const INBOX = 'info@serendibinternational.com';
const MAX_BODY_BYTES = 12_288;
const ROUTES = new Set(['bulk', 'private-label', 'horticulture', 'sample']);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const EMAIL = /^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+$/;
const limits = { product: 160, market: 100, volume: 100, spec: 160, name: 100, company: 120, email: 254, format: 120, timing: 100, notes: 450 };

function json(status, payload) {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' } });
}

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let body = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError();
    }
    body += decoder.decode(value, { stream: true });
  }
  return JSON.parse(body + decoder.decode());
}

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
    !UUID.test(body.id ?? '') || !ROUTES.has(body.route) ||
    body.consent !== 'yes' || body.website !== '' ||
    typeof body.token !== 'string' || !body.token.length || body.token.length > 2048) return null;
  const brief = { route: body.route };
  const optional = new Set(['timing', 'notes', ...(body.route === 'private-label' ? [] : ['format'])]);
  for (const [key, max] of Object.entries(limits)) {
    const value = body[key] ?? '';
    if (typeof value !== 'string' || value.length > max) return null;
    const cleaned = value.trim();
    if (!cleaned && !optional.has(key)) return null;
    if (key !== 'notes' && /[\r\n\u0000]/.test(cleaned)) return null;
    brief[key] = cleaned;
  }
  return EMAIL.test(brief.email) ? brief : null;
}

async function verifyChallenge(env, token, hostname) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error('Verification unavailable');
  const verification = await response.json();
  if (verification['error-codes']?.includes('internal-error')) throw new Error('Verification unavailable');
  return verification.success === true && verification.hostname === hostname && verification.action === 'enquiry';
}

async function notify(env, id, brief) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': 'serendib-rfq/' + id },
    body: JSON.stringify({
      from: env.RFQ_FROM, to: [INBOX], reply_to: brief.email,
      subject: '[Website enquiry] ' + brief.route + ' | ' + id,
      text: Object.entries(brief).filter(([, value]) => value).map(([key, value]) => key + ': ' + value).join('\n')
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error('Notification unavailable');
  const result = await response.json();
  if (typeof result.id !== 'string' || !result.id) throw new Error('Notification unconfirmed');
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin) return json(403, { error: 'Origin not allowed.' });
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json(415, { error: 'Expected a JSON enquiry.' });
  }
  if (env.RFQ_ENABLED !== 'true' || url.hostname !== env.RFQ_HOSTNAME || !env.ENQUIRIES ||
    !env.TURNSTILE_SECRET || !env.RESEND_API_KEY || !env.RFQ_FROM) {
    return json(503, { error: 'Online enquiries are unavailable. Please use email.' });
  }

  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return error instanceof RangeError
      ? json(413, { error: 'Enquiry is too long.' })
      : json(400, { error: 'Invalid enquiry.' });
  }
  const brief = validate(body);
  if (!brief) return json(400, { error: 'Check the enquiry fields and consent.' });
  try {
    if (!await verifyChallenge(env, body.token, url.hostname)) {
      return json(403, { error: 'Security check failed. Refresh it and try again.' });
    }
  } catch {
    return json(503, { error: 'Security check unavailable. Please use email or retry.' });
  }

  const id = body.id;
  const details = JSON.stringify(brief);
  try {
    await env.ENQUIRIES.prepare(
      'INSERT INTO enquiries (id, route, details, created_at, consent_version) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING'
    ).bind(id, brief.route, details, new Date().toISOString(), 'rfq-v73').run();
    const row = await env.ENQUIRIES.prepare(
      'SELECT details, notification, created_at FROM enquiries WHERE id = ?'
    ).bind(id).first();
    if (!row) throw new Error('Missing enquiry');
    if (row.details !== details) return json(409, { error: 'Start a new enquiry for changed details.' });
    if (row.notification === 'sent') return json(200, { accepted: true, id, notification: 'sent' });

    // The provider only deduplicates retries within 24 hours. Older entries stay
    // in the review queue for a human to reconcile with the company mailbox.
    if (!(Date.now() - Date.parse(row.created_at) < 23 * 60 * 60 * 1000)) {
      return json(202, { accepted: true, id, notification: 'pending' });
    }
    try {
      await notify(env, id, brief);
      await env.ENQUIRIES.prepare("UPDATE enquiries SET notification = 'sent' WHERE id = ?").bind(id).run();
      return json(201, { accepted: true, id, notification: 'sent' });
    } catch {
      return json(202, { accepted: true, id, notification: 'pending' });
    }
  } catch {
    return json(503, { error: 'Receipt could not be confirmed. Retry or use email.' });
  }
}
