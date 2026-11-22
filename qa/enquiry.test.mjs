import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/enquiry.js';

test('enquiry validation, recording, notification and retry', async t => {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_enquiries.sql', import.meta.url), 'utf8'));
  const dbBinding = {
    prepare: sql => ({
      bind: (...args) => ({
        run: async () => db.prepare(sql).run(...args),
        first: async () => db.prepare(sql).get(...args)
      })
    })
  };
  const env = {
    RFQ_ENABLED: 'true', RFQ_HOSTNAME: 'staging.example.com', ENQUIRIES: dbBinding,
    TURNSTILE_SECRET: 'test', RESEND_API_KEY: 'test', RFQ_FROM: 'Test <staging@example.com>'
  };
  let sent = [];
  let verify = { success: true, hostname: env.RFQ_HOSTNAME, action: 'enquiry' };
  let mailFail = false;
  let verifyFail = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.includes('/siteverify')) {
      if (verifyFail) return Response.json({}, { status: 503 });
      assert.equal(options.body.get('response'), 'fake');
      return Response.json(verify);
    }
    assert.equal(url, 'https://api.resend.com/emails');
    if (mailFail) return Response.json({}, { status: 429 });
    sent.push({ payload: JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
    return Response.json({ id: 'provider-test' });
  });
  const origin = 'https://' + env.RFQ_HOSTNAME;
  const id = crypto.randomUUID();
  const payload = {
    id, route: 'bulk', product: 'Ceylon cinnamon', market: 'Singapore', volume: '500 kg',
    spec: 'Quills', name: 'QA Contact', company: 'QA Example', email: 'qa@example.com',
    format: '', timing: '', notes: '', consent: 'yes', website: '', token: 'fake'
  };
  async function request(data = payload, overrides = {}, bindings = {}) {
    const request = new Request(origin + '/api/enquiry', {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: typeof data === 'string' ? data : JSON.stringify(data), ...overrides
    });
    return onRequest({ request, env: { ...env, ...bindings } });
  }
  const count = () => db.prepare('SELECT count(*) AS rows FROM enquiries').get().rows;

  await t.test('disable gate, origin, method and body limits', async () => {
    assert.equal((await request(payload, {}, { RFQ_ENABLED: 'false' })).status, 503);
    assert.equal((await request(payload, {}, { RFQ_HOSTNAME: 'other.example.com' })).status, 503);
    assert.equal((await request(payload, { headers: { Origin: 'https://other.example.com' } })).status, 403);
    assert.equal((await request(payload, { method: 'GET', body: undefined })).status, 405);
    assert.equal((await request(payload, { headers: { Origin: origin, 'Content-Type': 'text/plain' } })).status, 415);
    assert.equal((await request('{bad JSON')).status, 400);
    assert.equal((await request('x'.repeat(13_000))).status, 413);
  });
  await t.test('field, consent, honeypot and challenge rejection', async () => {
    for (const bad of [{ consent: 'no' }, { website: 'bot' }, { email: 'invalid' },
      { volume: ' ' }, { route: 'private-label' }, { route: 'unknown' }, { spec: ['invalid'] }]) {
      assert.equal((await request({ ...payload, ...bad })).status, 400);
    }
    verify.hostname = 'bad-host.example.com';
    assert.equal((await request()).status, 403);
    verify.hostname = env.RFQ_HOSTNAME;
    verify.action = 'incorrect';
    assert.equal((await request()).status, 403);
    verify.action = 'enquiry';
    verifyFail = true;
    assert.equal((await request()).status, 503);
    verifyFail = false;
    assert.equal(count(), 0);
    assert.equal(sent.length, 0);
  });
  await t.test('record a qualified brief and address the fixed inbox', async () => {
    const first = await request();
    assert.equal(first.status, 201);
    assert.deepEqual(await first.json(), { accepted: true, id, notification: 'sent' });
    const row = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id);
    assert.equal(row.status, 'new');
    assert.equal(row.owner, 'Sourcing desk');
    assert.equal(row.consent_version, 'rfq-v73');
    assert.match(row.details, /Quills/);
    assert.equal(sent[0].key, 'serendib-rfq/' + id);
    assert.deepEqual(sent[0].payload.to, ['info@serendibinternational.com']);
    assert.equal(sent[0].payload.reply_to, 'qa@example.com');
  });
  await t.test('identical retry deduplicates and changed details conflict', async () => {
    assert.equal((await request()).status, 200);
    assert.equal((await request({ ...payload, volume: '600 kg' })).status, 409);
    assert.equal(count(), 1);
    assert.equal(sent.length, 1);
  });
  await t.test('provider error keeps record for review and can be retried', async () => {
    const newId = crypto.randomUUID();
    const retry = { ...payload, id: newId, route: 'horticulture' };
    mailFail = true;
    const pending = await request(retry);
    assert.equal(pending.status, 202);
    assert.equal((await pending.json()).notification, 'pending');
    assert.equal(count(), 2);
    assert.equal(db.prepare('SELECT notification FROM enquiries WHERE id = ?').get(newId).notification, 'pending');
    mailFail = false;
    assert.equal((await request(retry)).status, 201);
    assert.equal(count(), 2);
    assert.equal(sent.length, 2);
  });
  await t.test('database errors never send notifications', async () => {
    const ENQUIRIES = { prepare: () => { throw new Error('test failure'); } };
    assert.equal((await request({ ...payload, id: crypto.randomUUID() }, {}, { ENQUIRIES })).status, 503);
    assert.equal(sent.length, 2);
  });
});
