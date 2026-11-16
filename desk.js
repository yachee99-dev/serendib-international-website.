(() => {
  const root = document.querySelector('#sourcing-desk');
  const products = window.SERENDIB_PRODUCTS;
  if (!root || !Array.isArray(products)) return;
  const picker = root.querySelector('#desk-product');
  const image = root.querySelector('#desk-product-image');
  const forms = root.querySelector('#desk-forms');
  const question = root.querySelector('#desk-question');
  const guide = root.querySelector('#desk-guide');
  const quote = root.querySelector('#desk-quote');
  const sample = root.querySelector('#desk-sample');
  const modes = [...root.querySelectorAll('input[name=desk-route]')];

  const directions = {
    bulk: { title: 'Build quote brief', prompt: '' },
    'private-label': { title: 'Build packaging brief', prompt: ' Include launch market, first run and intended retail pack.' },
    horticulture: { title: 'Build substrate brief', prompt: ' Include crop or intended growing system.' }
  };

  function renderProduct() {
    const product = products.find(item => item.key === picker.value);
    const mode = modes.find(input => input.checked).value;
    if (!product) return;
    const direction = directions[mode];
    forms.textContent = product.formats;
    question.textContent = product.question + direction.prompt;
    image.src = product.image;
    image.alt = product.alt;
    guide.href = product.group + '.html';
    const payload = new URLSearchParams({ type: mode, product: product.name, category: product.group });
    quote.href = 'contact.html?' + payload;
    quote.firstChild.nodeValue = direction.title + ' ';
    payload.set('type', 'sample');
    sample.href = 'contact.html?' + payload;
  }

  function changeMode() {
    const mode = modes.find(input => input.checked).value;
    const current = picker.value;
    const options = products.filter(item => mode === 'horticulture' ? item.group === 'growing' : item.group !== 'growing');
    picker.replaceChildren(...options.map(item => new Option(item.name, item.key)));
    if (options.some(item => item.key === current)) picker.value = current;
    renderProduct();
  }

  picker.addEventListener('change', renderProduct);
  modes.forEach(mode => mode.addEventListener('change', changeMode));
  changeMode();
})();
