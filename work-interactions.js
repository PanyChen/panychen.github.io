export function initWorkInteractions() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.querySelector('.water-scene');
  const glass = document.querySelector('#glass-button');
  const pause = document.querySelector('#ice-pause');
  let active = false, started = false, running = false;

  function updateIce() {
    scene.classList.toggle('is-active', started);
    scene.classList.toggle('is-paused', !active || document.hidden || !running || motion.matches);
    document.querySelector('#glass-hint').toggleAttribute('hidden', started);
    document.querySelector('#glass-prompt').hidden = started;
    pause.hidden = !started || motion.matches;
    pause.textContent = running ? 'Pause animation' : 'Resume animation';
    glass.setAttribute('aria-pressed', String(started));
    glass.setAttribute('aria-label', !started ? 'Tap the glass to explore how conditions affect ice' : motion.matches ? 'Glass of water: it depends on how you shake it' : running ? 'Pause the glass animation' : 'Resume the glass animation');
  }
  glass.addEventListener('click', () => {
    running = started ? !running : true;
    started = true;
    document.querySelector('#ice-result').hidden = false;
    updateIce();
  });
  pause.addEventListener('click', () => { running = !running; updateIce(); });
  document.addEventListener('visibilitychange', updateIce);
  motion.addEventListener('change', updateIce);

  const board = document.querySelector('#memo-board');
  const organise = document.querySelector('#organise-button');
  const replay = document.querySelector('#workflow-replay');
  function setWorkflow(organised) {
    board.classList.toggle('is-organised', organised);
    board.setAttribute('aria-label', organised ? 'A repeatable workflow: Prepare tasks and files; Run script and data; Check checks; Analyse results; Summarise notes. Note order: tasks, files, script, data, checks, results, notes.' : 'Seven scattered notes: data, files, script, tasks, checks, notes, and results.');
    document.querySelector('#workflow-result').hidden = !organised;
    organise.hidden = organised;
    replay.hidden = !organised;
    (organised ? replay : organise).focus({preventScroll:true});
  }
  organise.addEventListener('click', () => setWorkflow(true));
  replay.addEventListener('click', () => setWorkflow(false));

  const explanation = document.querySelector('.explanation-scene');
  const eraser = document.querySelector('#eraser-button');
  const reset = document.querySelector('#equation-reset');
  let eraserTimer;
  function finishExplanation() {
    clearTimeout(eraserTimer);
    eraserTimer = undefined;
    explanation.classList.remove('is-erasing');
    document.querySelector('#equation-view').hidden = true;
    document.querySelector('#tourist-view').hidden = false;
    eraser.hidden = true;
    eraser.disabled = false;
    reset.hidden = false;
    document.querySelector('#communication-result').hidden = false;
    if (active) reset.focus({preventScroll:true});
  }
  eraser.addEventListener('click', () => {
    if (motion.matches) { finishExplanation(); return; }
    explanation.classList.add('is-erasing');
    eraser.disabled = true;
    eraserTimer = setTimeout(finishExplanation, 550);
  });
  reset.addEventListener('click', () => {
    document.querySelector('#equation-view').hidden = false;
    document.querySelector('#tourist-view').hidden = true;
    eraser.hidden = false;
    reset.hidden = true;
    document.querySelector('#communication-result').hidden = true;
    eraser.focus({preventScroll:true});
  });
  updateIce();
  return id => {
    active = id === 'how-i-work';
    if (!active && eraserTimer !== undefined) finishExplanation();
    updateIce();
  };
}
