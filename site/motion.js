(() => {
  const header = document.querySelector('.house-header');
  const updateHeader = () => document.body.classList.toggle('header-solid', scrollY > 40);
  if (header) {
    updateHeader();
    addEventListener('scroll', updateHeader, { passive: true });
  }
  // Motion is limited to entrances and CSS hover. Normal document scrolling
  // preserves anchor navigation, form pointer targets and mobile behavior.
})();
