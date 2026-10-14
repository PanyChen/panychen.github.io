(() => {
  'use strict';

  const pages = [...document.querySelectorAll('[data-page]')];
  const progressButtons = [...document.querySelectorAll('.page-progress [data-go]')];
  const backButton = document.querySelector('#back-button');
  const nextButton = document.querySelector('#next-button');
  const nextLabel = document.querySelector('#next-label');
  const pageNumber = document.querySelector('#current-number');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cvDialog = document.querySelector('#cv-dialog');
  let currentPage = 0;
  let cvAvailable = false;
  let touchStart = null;

  const waterScene = document.querySelector('.water-scene');
  const glassButton = document.querySelector('#glass-button');
  const glassHint = document.querySelector('#glass-hint');
  const icePause = document.querySelector('#ice-pause');
  const iceResult = document.querySelector('#ice-result');
  let iceStarted = false;
  let iceRunning = false;

  function revealIceResult() {
    iceResult.hidden = false;
  }

  function updateIce() {
    const paused = currentPage !== 1 || document.hidden || !iceRunning;
    waterScene.classList.toggle('is-active', iceStarted);
    waterScene.classList.toggle('is-paused', paused);
    waterScene.classList.toggle('is-hint-paused', currentPage !== 1 || document.hidden);
    icePause.hidden = !iceStarted || motionPreference.matches;
    icePause.textContent = iceRunning ? 'Pause animation' : 'Resume';
    glassHint.toggleAttribute('hidden', iceStarted);
    if (!iceStarted) return;
    if (motionPreference.matches) {
      glassButton.setAttribute('aria-label', 'Glass of water: it depends on how you shake it.');
    } else {
      glassButton.setAttribute('aria-label', iceRunning ? 'Pause the glass animation' : 'Resume the glass animation');
    }
  }

  function tapGlass() {
    iceRunning = iceStarted ? !iceRunning : true;
    iceStarted = true;
    revealIceResult();
    updateIce();
  }
  glassButton.addEventListener('click', tapGlass);
  icePause.addEventListener('click', () => { iceRunning = !iceRunning; updateIce(); });
  document.addEventListener('visibilitychange', updateIce);
  motionPreference.addEventListener('change', updateIce);

  const memoBoard = document.querySelector('#memo-board');
  const organiseButton = document.querySelector('#organise-button');
  const workflowReplay = document.querySelector('#workflow-replay');
  const workflowResult = document.querySelector('#workflow-result');
  function setWorkflow(organised) {
    memoBoard.classList.toggle('is-organised', organised);
    memoBoard.setAttribute('aria-label', organised
      ? 'A repeatable workflow: prepare data and files, run scripts and tasks, check the output using checks and notes, then summarise results.'
      : 'Seven scattered notes: data, files, script, tasks, checks, notes, and results.');
    workflowResult.hidden = !organised;
    workflowReplay.hidden = !organised;
    organiseButton.hidden = organised;
    if (organised) workflowReplay.focus({ preventScroll: true });
    else organiseButton.focus({ preventScroll: true });
  }
  organiseButton.addEventListener('click', () => setWorkflow(true));
  workflowReplay.addEventListener('click', () => setWorkflow(false));

  const explanationScene = document.querySelector('.explanation-scene');
  const equationView = document.querySelector('#equation-view');
  const touristView = document.querySelector('#tourist-view');
  const eraserButton = document.querySelector('#eraser-button');
  const equationReset = document.querySelector('#equation-reset');
  const communicationResult = document.querySelector('#communication-result');
  let eraserTimer = null;

  function finishExplanation() {
    if (eraserTimer !== null) window.clearTimeout(eraserTimer);
    eraserTimer = null;
    explanationScene.classList.remove('is-erasing');
    equationView.hidden = true;
    touristView.hidden = false;
    eraserButton.hidden = true;
    eraserButton.disabled = false;
    equationReset.hidden = false;
    communicationResult.hidden = false;
    if (currentPage === 3) equationReset.focus({ preventScroll: true });
  }

  eraserButton.addEventListener('click', () => {
    if (motionPreference.matches) { finishExplanation(); return; }
    explanationScene.classList.add('is-erasing');
    eraserButton.disabled = true;
    eraserTimer = window.setTimeout(finishExplanation, 550);
  });
  equationReset.addEventListener('click', () => {
    equationView.hidden = false;
    touristView.hidden = true;
    eraserButton.hidden = false;
    equationReset.hidden = true;
    communicationResult.hidden = true;
    eraserButton.focus({ preventScroll: true });
  });

  function goToPage(index, { focus = true, updateHistory = true } = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= pages.length) return;
    const previousPage = currentPage;
    if (eraserTimer !== null && index !== 3) finishExplanation();
    currentPage = index;
    pages.forEach((page, pageIndex) => {
      const active = pageIndex === index;
      page.hidden = !active;
      page.inert = !active;
      page.classList.remove('is-entering', 'is-entering-back');
      if (active && index !== previousPage) {
        // Restart the short page-turn transition only on an actual page change.
        void page.offsetWidth;
        page.classList.add('is-entering');
        page.classList.toggle('is-entering-back', index < previousPage);
      }
    });
    progressButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === index) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    backButton.disabled = index === 0;
    nextLabel.textContent = index === 4 ? 'Cover' : 'Next';
    nextButton.setAttribute('aria-label', index === 4 ? 'Return to cover' : 'Next page');
    pageNumber.textContent = String(index + 1);
    updateIce();
    if (updateHistory && location.hash !== `#${pages[index].id}`) {
      history.pushState({ page: index }, '', `#${pages[index].id}`);
    }
    if (focus) {
      pages[index].querySelector('h1, h2').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function pageFromHash() {
    const hash = location.hash.slice(1);
    const index = pages.findIndex(page => page.id === hash);
    return index < 0 ? 0 : index;
  }
  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => goToPage(Number(button.dataset.go)));
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const index = pages.findIndex(page => `#${page.id}` === link.getAttribute('href'));
    if (index < 0) return;
    link.addEventListener('click', event => {
      event.preventDefault();
      goToPage(index);
    });
  });
  backButton.addEventListener('click', () => goToPage(currentPage - 1));
  nextButton.addEventListener('click', () => goToPage(currentPage === 4 ? 0 : currentPage + 1));
  window.addEventListener('popstate', () => goToPage(pageFromHash(), { updateHistory: false }));
  window.addEventListener('hashchange', () => goToPage(pageFromHash(), { updateHistory: false }));
  document.addEventListener('keydown', event => {
    if (cvDialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); goToPage(Math.min(currentPage + 1, 4)); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goToPage(Math.max(currentPage - 1, 0)); }
  });

  // Horizontal swipes turn pages without scrolling the document.
  document.querySelector('main').addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button, a')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  document.querySelector('main').addEventListener('touchend', event => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      goToPage(Math.max(0, Math.min(4, currentPage + (dx < 0 ? 1 : -1))));
    }
  }, { passive: true });
  document.querySelector('main').addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

  document.querySelectorAll('.cv-link').forEach(button => {
    button.addEventListener('click', () => {
      if (cvAvailable) window.open('assets/cv.pdf', '_blank', 'noopener,noreferrer');
      else cvDialog.showModal();
    });
  });
  cvDialog.querySelector('.dialog-close').addEventListener('click', () => cvDialog.close());
  cvDialog.addEventListener('click', event => {
    const bounds = cvDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cvDialog.close();
  });
  fetch('assets/cv.pdf', { method: 'HEAD', cache: 'no-store' })
    .then(response => { cvAvailable = response.ok && (response.headers.get('content-type') || '').includes('application/pdf'); })
    .catch(() => { cvAvailable = false; });

  const photo = new Image();
  photo.addEventListener('load', () => {
    const profile = document.querySelector('#profile-photo');
    profile.src = photo.src;
    profile.hidden = false;
    document.querySelector('.portrait-placeholder').hidden = true;
  });
  photo.src = 'assets/profile.jpg?v=083af7be32c0';
  goToPage(pageFromHash(), { focus: false, updateHistory: false });
})();
