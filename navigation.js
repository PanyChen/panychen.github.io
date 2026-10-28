const views = ['home', 'how-i-work', 'education', 'recognition', 'outputs'];

export function initNavigation(onViewChange) {
  const rail = document.querySelector('.section-rail');
  const toggle = document.querySelector('#menu-toggle');
  let activeView = 'home';

  function closeMenu() {
    rail.dataset.expanded = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Show section menu');
  }

  function showView(id, { focus = true } = {}) {
    if (!views.includes(id)) id = 'home';
    activeView = id;
    for (const panel of document.querySelectorAll('section.view[data-view]')) {
      panel.hidden = panel.dataset.view !== id;
      panel.inert = panel.hidden;
    }
    for (const link of document.querySelectorAll('[data-view-link]')) {
      if (link.dataset.viewLink === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    document.body.dataset.view = id;
    const name = document.querySelector(`section.view[data-view="${id}"]`).dataset.title;
    document.title = id === 'home' ? 'Pengxu (Vincent) Chen — Interfaces' : `${name} — Pengxu (Vincent) Chen`;
    closeMenu();
    onViewChange(id);
    if (focus) {
      const heading = document.querySelector(`section.view[data-view="${id}"] h1`);
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-view-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.dataset.viewLink;
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    showView(id);
  });
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close section menu' : 'Show section menu');
    rail.dataset.expanded = String(expanded);
  });
  document.addEventListener('pointerdown', event => {
    if (!rail.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus({ preventScroll:true });
      event.stopImmediatePropagation();
    }
  });
  const fromHash = () => showView(location.hash.slice(1) || 'home');
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  showView(location.hash.slice(1) || 'home', { focus:false });
  return { get activeView() { return activeView; } };
}
