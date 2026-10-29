import { initialState, selectGoal, selectProject } from './state.js';
import { escapeHTML as e } from './content.js';
import { initNavigation } from './navigation.js';
import { initWorkInteractions } from './work-interactions.js';

const { site, research, manifest } = JSON.parse(document.querySelector('#portfolio-data').textContent);
const assets = new Map(manifest.assets.map(asset => [asset.path, asset]));
const projects = new Map(research.projects.map(project => [project.id, project]));
const publications = new Map(research.publications.map(publication => [publication.id, publication]));
const region = document.querySelector('#research');
const story = document.querySelector('#story');
const storyNav = document.querySelector('#story-nav');
const mobileLayout = matchMedia('(max-width: 649px)');
const regionHome = { parent: region.parentElement, next: region.nextElementSibling };
const status = document.querySelector('#selection-status');
const imageError = document.querySelector('#image-error');
const cards = [...document.querySelectorAll('.goal-card')];
const failedImages = new Set();
let state = { ...initialState };
const updateWorkView = initWorkInteractions();
let navigation;

function updateBackdrop() {
  const active = document.body.dataset.view === 'home' ? state.activeGoal : null;
  document.body.dataset.backdrop = active || '';
  for (const layer of document.querySelectorAll('.backdrop-layer')) {
    layer.classList.toggle('is-visible', layer.dataset.backdrop === active);
  }
}

const introductions = {
  energy: 'Clearing ice from roads takes a lot of energy, so I ask a simple question: can a surface keep ice from sticking, or even stop it forming? I first led a student team developing a water-repellent coating for roads, then used computer simulations to study how shaking a surface changes when water starts to freeze.',
  carbon: 'Every time a road is rebuilt, more carbon is emitted. Roads often fail because the black binder, bitumen, loses its grip on the stones, especially once water gets in. I studied that boundary from three sides: chemistry that improves the grip, how it breaks at the molecular scale, and how both add up to the strength measured in the lab.',
  water: 'When seawater freezes, the ice leaves most of the salt behind, so freezing could become a lower-energy way to make fresh water. This is still being investigated, and the hard part is controlling when ice forms. I study it with simulations on national supercomputers, and I am training machine-learned models to make those simulations more reliable.',
};

function describeCard(goal) {
  const card = document.querySelector(`#goal-${goal.id}`);
  const selected = state.activeGoal === goal.id;
  const image = selected && card.dataset.imageReady === 'true' ? goal.after_image : goal.before_image;
  document.querySelector(`#state-${goal.id}`).textContent = assets.get(image).alt;
}

function loadSelectedImage(card) {
  const image = card.querySelector('.goal-image--selected');
  if (image.hasAttribute('src')) return;
  const goal = site.goals.find(item => item.id === card.dataset.goal);
  image.addEventListener('load', () => {
    card.dataset.imageReady = 'true';
    describeCard(goal);
  }, { once: true });
  image.addEventListener('error', () => {
    card.dataset.imageReady = 'false';
    failedImages.add(goal.id);
    describeCard(goal);
    showImageError();
  }, { once: true });
  image.src = image.dataset.src;
}

function showImageError() {
  const failed = failedImages.has(state.activeGoal);
  imageError.hidden = !failed;
  imageError.textContent = failed ? 'The selected reference image could not load. The opening photograph is shown; the full research description is available below.' : '';
}

function renderStory() {
  const project = projects.get(state.selectedProject);
  if (!project) { story.replaceChildren(); return; }
  for (const button of storyNav.querySelectorAll('[data-project]')) {
    button.setAttribute('aria-pressed', String(button.dataset.project === project.id));
  }
  story.dataset.project = project.id;
  const paperList = project.papers.map(id => { const p = publications.get(id); return `<li data-publication="${e(id)}"><a href="${e(p.url)}">${e(p.title)}</a><span class="paper-meta">${e(p.journal)} · ${e(p.year)}</span></li>`; }).join('');
  const related = project.related_projects.length ? `<p class="related">Related: ${project.related_projects.map(id => `<button type="button" data-related="${e(id)}">${e(projects.get(id).display_title)}</button>`).join(' · ')}</p>` : '';
  story.innerHTML = `<h3 id="story-title" class="sr-only">${e(project.display_title)}</h3><p class="story-summary">${e(project.summary)}</p><p class="authorship">${e(project.role)}</p>
    <dl class="story-facts"><div><dt>What I found</dt><dd>${e(project.finding)}</dd></div><div><dt>Why it matters</dt><dd>${e(project.purpose)}</dd></div><div><dt>Methods</dt><dd>${project.methods.map(e).join(' · ')}</dd></div></dl>
    ${paperList ? `<div class="story-papers"><h4>${project.id === 'W1' ? 'Research case study' : project.papers.length === 1 ? 'Paper' : 'Papers'}</h4><ul class="paper-list">${paperList}</ul></div>` : ''}${related}`;
}

// On phones the research opens directly under the selected card; elsewhere it follows all three cards
function placeRegion() {
  const card = state.activeGoal && mobileLayout.matches ? document.querySelector(`#goal-${state.activeGoal}`) : null;
  if (card) { if (card.nextElementSibling !== region) card.after(region); }
  else if (region.parentElement !== regionHome.parent) regionHome.parent.insertBefore(region, regionHome.next);
}
mobileLayout.addEventListener('change', placeRegion);

function renderGoal() {
  updateBackdrop();
  placeRegion();
  const goal = site.goals.find(item => item.id === state.activeGoal);
  for (const card of cards) {
    card.setAttribute('aria-pressed', String(card.dataset.goal === state.activeGoal));
    describeCard(site.goals.find(item => item.id === card.dataset.goal));
  }
  region.hidden = !goal;
  showImageError();
  if (!goal) {
    story.replaceChildren();
    storyNav.replaceChildren();
    delete story.dataset.project;
    status.textContent = 'Selection cleared. All three opening photographs are shown.';
    return;
  }
  document.querySelector('#research-heading').textContent = goal.title;
  document.querySelector('#goal-intro').textContent = introductions[goal.id];
  storyNav.innerHTML = goal.projects.map(id => `<button type="button" class="story-choice" data-project="${e(id)}" aria-controls="story" aria-pressed="false">${e(projects.get(id).display_title)}</button>`).join('');
  renderStory();
  status.textContent = `${goal.label} selected. ${goal.projects.length} research ${goal.projects.length === 1 ? 'story' : 'stories'} available below.`;
}

function clearSelection() {
  if (!state.activeGoal) return;
  const previousCard = document.querySelector(`#goal-${state.activeGoal}`);
  const restoreFocus = region.contains(document.activeElement);
  state = { ...initialState };
  renderGoal();
  if (restoreFocus) previousCard.focus({ preventScroll: true });
}

for (const card of cards) {
  card.addEventListener('click', () => {
    loadSelectedImage(card);
    state = selectGoal(state, card.dataset.goal, site.goals);
    renderGoal();
  });
}
storyNav.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  state = selectProject(state, button.dataset.project, site.goals);
  renderStory();
  status.textContent = `${projects.get(state.selectedProject).display_title} selected.`;
});
story.addEventListener('click', event => {
  const button = event.target.closest('[data-related]');
  if (!button) return;
  const project = projects.get(button.dataset.related);
  if (project.goal !== state.activeGoal) {
    state = selectGoal(state, project.goal, site.goals);
    loadSelectedImage(document.querySelector(`#goal-${project.goal}`));
  }
  state = selectProject(state, project.id, site.goals);
  renderGoal();
  document.querySelector(`#goal-${project.goal}`).focus({ preventScroll: true });
});
document.querySelector('#clear-selection').addEventListener('click', clearSelection);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.activeGoal && navigation.activeView === 'home' && document.querySelector('#menu-toggle').getAttribute('aria-expanded') !== 'true') {
    event.preventDefault();
    clearSelection();
  }
});

navigation = initNavigation(id => {
  updateWorkView(id);
  updateBackdrop();
});

// Opening photographs take priority; selected layers are then loaded into the same frames.
const preloadSelected = () => cards.forEach(loadSelectedImage);
if (document.readyState === 'complete') preloadSelected();
else window.addEventListener('load', preloadSelected, { once: true });
