(() => {
  const menu = document.querySelector('#v7-screen-menu');
  const open = document.querySelector('#v7-menu-button');
  const close = document.querySelector('#v7-menu-close');
  if (!menu || !open || !close) return;

  function setMenu(show, restoreFocus = true) {
    menu.hidden = !show;
    open.setAttribute('aria-expanded', String(show));
    document.body.classList.toggle('v7-menu-open', show);
    if (show) close.focus();
    else if (restoreFocus) open.focus();
  }

  open.addEventListener('click', () => setMenu(menu.hidden));
  close.addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      const target = new URL(link.href);
      const samePage = target.pathname.replace(/\/index(?:\.html)?$/, '/') === location.pathname.replace(/\/index(?:\.html)?$/, '/');
      setMenu(false, !samePage || !target.hash);
      if (samePage && target.hash) {
        const section = document.getElementById(target.hash.slice(1));
        if (section) {
          section.setAttribute('tabindex', '-1');
          section.focus({ preventScroll: true });
        }
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      // The assistant also handles Escape when it has focus.
      if (!event.defaultPrevented) setMenu(false);
    }
    if (event.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('a,button')].filter(item => item.offsetParent !== null);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
