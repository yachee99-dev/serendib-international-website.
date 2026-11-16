(() => {
  const form = document.querySelector('#brief-form');
  if (!form) return;
  const fields = form.elements;
  const config = window.SERENDIB_PUBLIC_CONFIG;
  const params = new URLSearchParams(location.search);
  const routes = {
    bulk: {
      guidance: 'Include your grade or cut, order frequency and any destination-market testing.',
      volume: 'Estimated order volume and unit',
      spec: 'Grade, cut or specification',
      pack: 'Bulk pack type and size (optional)'
    },
    'private-label': {
      guidance: 'Include your launch market, retail pack size and estimated first run.',
      volume: 'Estimated first run and unit',
      spec: 'Product specification or intended use',
      pack: 'Retail pack size, material and labelling needs'
    },
    horticulture: {
      guidance: 'Include EC units and test method, target pH and expansion or hydrated dimensions where known.',
      volume: 'Estimated volume and unit',
      spec: 'Crop, blend, treatment and technical targets',
      pack: 'Block weight, bag dimensions or pallet needs (optional)'
    },
    sample: {
      guidance: 'Include your evaluation criteria and sample quantity. Any sample and courier charges require your approval.',
      volume: 'Sample quantity and unit',
      spec: 'Grade and evaluation criteria',
      pack: 'Sample presentation (optional)'
    }
  };
  const categories = { spices: 'Ceylon spices', coconut: 'Coconut ingredients', growing: 'Cocopeat and growing media', tea: 'Ceylon tea' };
  const output = document.querySelector('#draft-output');
  const draft = document.querySelector('#draft-text');
  const status = document.querySelector('#enquiry-status');
  const copyStatus = document.querySelector('#copy-status');
  const emailLink = document.querySelector('#email-draft');
  const submit = document.querySelector('#prepare-enquiry');
  const live = document.querySelector('#live-enquiry');
  const widgetBox = document.querySelector('#turnstile-widget');
  const type = params.get('type');
  const product = params.get('product');
  const category = params.get('category');
  if (Object.hasOwn(routes, type)) fields.route.value = type;
  if (product) fields.product.value = product.slice(0, 160);
  else if (Object.hasOwn(categories, category)) fields.product.placeholder = categories[category];
  if (params.get('from') === 'assistant') {
    status.textContent = 'Add the product or question you want the sourcing desk to review.';
  }

  const panels = [...form.querySelectorAll('[data-panel]')];
  const progress = form.querySelector('.desk-progress');
  const actions = form.querySelector('.desk-stepActions');
  const next = form.querySelector('#desk-next');
  const back = form.querySelector('#desk-back');
  const summary = form.querySelector('#desk-enquiry-summary');
  let step = 0;

  function showStep(index, focus = true) {
    if (panels.length !== 3) return;
    step = index;
    progress.hidden = false;
    actions.hidden = false;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    [...progress.children].forEach((item, i) => {
      if (i === index) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    back.hidden = index === 0;
    next.hidden = index === 2;
    if (index === 0) submit.disabled = false;
    next.textContent = index === 0 ? 'Continue to contact' : 'Review your enquiry';
    if (index === 1) {
      summary.textContent = [fields.product.value, fields.volume.value, fields.market.value].join(' · ');
    }
    if (focus) panels[index].querySelector('legend')?.focus();
  }

  function advance() {
    if (step >= 2) return;
    const visibleFields = [...panels[step].querySelectorAll('input,select,textarea')];
    for (const field of visibleFields) {
      field.value = field.value.trim();
      if (!field.reportValidity()) return;
    }
    const data = step === 1 ? readBrief() : null;
    if (step === 1 && !data) return;
    showStep(step + 1);
    if (data) showDraft(data);
  }

  function updateRoute() {
    const route = routes[fields.route.value];
    document.querySelector('#route-guidance').textContent = route.guidance;
    document.querySelector('#volume-label').textContent = route.volume;
    document.querySelector('#spec-label').textContent = route.spec;
    document.querySelector('#pack-label').textContent = route.pack;
    fields.format.required = fields.route.value === 'private-label';
  }

  function readBrief() {
    for (const field of form.querySelectorAll('input:not([type=checkbox]), textarea:not([readonly])')) {
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return null;
    return Object.fromEntries(new FormData(form));
  }

  function showDraft(data) {
    const route = routes[data.route];
    const routeName = fields.route.selectedOptions[0].text;
    draft.value = [
      'Company: ' + data.company, 'Contact: ' + data.name, 'Reply email: ' + data.email,
      'Product: ' + data.product, 'Destination: ' + data.market, route.volume + ': ' + data.volume,
      route.spec + ': ' + data.spec, data.format && 'Packaging: ' + data.format,
      data.timing && 'Timing: ' + data.timing, data.notes && 'Documents / notes: ' + data.notes
    ].filter(Boolean).join('\r\n');
    const mailto = 'mailto:info@serendibinternational.com?subject=' +
      encodeURIComponent('Serendib RFQ | ' + routeName) + '&body=' + encodeURIComponent(new TextDecoder().decode(new TextEncoder().encode(draft.value)));
    const shortLink = mailto.length > 1900;
    emailLink.href = shortLink ? mailto.split('&body=')[0] : mailto;
    emailLink.textContent = shortLink ? 'Open email and paste copied text' : 'Open email draft';
    copyStatus.textContent = shortLink ? 'Copy your brief first. Long briefs may exceed email app link limits.' : '';
    output.hidden = false;
    draft.focus();
  }

  updateRoute();
  if (panels.length === 3) {
    form.noValidate = true;
    next.addEventListener('click', advance);
    back.addEventListener('click', () => showStep(step - 1));
    showStep(0, false);
  }
  let widgetId;
  let submissionId;
  let pending = false;
  form.addEventListener('change', event => {
    if (event.target === fields.route) updateRoute();
  });
  form.addEventListener('input', () => {
    if (pending) return;
    submissionId = undefined;
    output.hidden = true;
    status.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (panels.length === 3 && step < 2) { advance(); return; }
    const data = readBrief();
    if (data) showDraft(data);
  });
  document.querySelector('#copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      copyStatus.textContent = 'Enquiry text copied.';
    } catch {
      draft.focus();
      draft.select();
      copyStatus.textContent = 'Draft selected. Use your device’s copy command.';
    }
  });
  submit.disabled = false;

  if (!config?.liveEnquiries || !config.turnstileSiteKey) return;
  document.querySelector('#live-controls').hidden = false;
  fields.consent.disabled = false;
  live.hidden = false;
  document.querySelector('#form-disclosure').replaceChildren(
    'You can send this brief online, or prepare an email draft. ',
    Object.assign(document.createElement('a'), { href: 'privacy.html', textContent: 'Privacy notice' })
  );
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.onload = () => {
    widgetId = window.turnstile?.render(widgetBox, { sitekey: config.turnstileSiteKey, action: 'enquiry' });
  };
  script.onerror = () => { status.textContent = 'Security check unavailable. You can still email your brief.'; };
  document.head.append(script);

  live.addEventListener('click', async () => {
    const data = readBrief();
    if (!data || pending) return;
    if (data.consent !== 'yes') {
      status.textContent = 'Please agree to the use of your details before sending online.';
      fields.consent.focus();
      return;
    }
    const token = widgetId === undefined ? '' : window.turnstile.getResponse(widgetId);
    if (!token) {
      status.textContent = 'Complete the security check, or use the email draft.';
      return;
    }
    submissionId ??= crypto.randomUUID();
    pending = true;
    const fieldsets = [...form.querySelectorAll('fieldset')];
    fieldsets.forEach(fieldset => { fieldset.disabled = true; });
    live.disabled = true;
    back.disabled = true;
    submit.disabled = true;
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token, id: submissionId }),
        signal: AbortSignal.timeout(15000)
      });
      const result = await response.json();
      if (!response.ok || !result.accepted) throw new Error(result.error);
      status.textContent = result.notification === 'sent'
        ? 'Enquiry received. Your reference is ' + result.id + '.'
        : 'Enquiry recorded for review. Your reference is ' + result.id + '.';
      form.reset();
      output.hidden = true;
      submissionId = undefined;
      updateRoute();
      // Keep the receipt visible until the buyer chooses to begin another brief.
      next.hidden = false;
      next.textContent = 'Start another brief';
      next.onclick = () => { next.onclick = null; status.textContent = ''; showStep(0); };
      back.hidden = true;
      submit.disabled = true;
    } catch {
      status.textContent = 'We could not confirm receipt. Retry with the same details or email the sourcing desk.';
    } finally {
      window.turnstile.reset(widgetId);
      pending = false;
      fieldsets.forEach(fieldset => { fieldset.disabled = false; });
      live.disabled = false;
      back.disabled = false;
      submit.disabled = Boolean(next.onclick);
    }
  });
})();
