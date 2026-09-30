/* Lumina — main orchestrator.
 * Scene setup, atlas switching, explode slider, raycast picking,
 * hover highlight, systems panel, info card, responsive UI.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildAnatomy } from './anatomy.js';
import { buildCell } from './cell.js';
import { buildMolecules } from './molecules.js';
import { buildNeuron } from './neuron.js';
import { buildPlantCell } from './plantcell.js';
import { buildOchem } from './ochem.js';
import { buildBiochem } from './biochem.js';
import { buildEarth } from './earth.js';
import { buildEcology } from './ecology.js';
import { sampleQuestions, isCorrectAnswer, findTargetPart, questionPrompt,
         questionTargetLabel, quizTier, buildSearchEntries, searchEntries,
         shuffle, MCAT_SECTIONS, MCAT_ROUND, masteryKey,
         sampleMicroQuestion } from './quiz.js';

/* ------------------------------------------------------------ renderer */
const canvasWrap = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
canvasWrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2;
controls.maxDistance = 22;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;
controls.addEventListener('start', () => { controls.autoRotate = false; }, { once: true });

/* --------------------------------------------------------------- lights */
scene.add(new THREE.HemisphereLight(0xdfeaff, 0x1a2230, 0.85));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(5, 8, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0x7fb2ff, 0.7);
rim.position.set(-6, 3, -5);
scene.add(rim);
const fill = new THREE.PointLight(0xffd9a0, 12, 30);
fill.position.set(0, 1.5, 4);
scene.add(fill);

/* subtle ground glow disc */
{
  const g = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshBasicMaterial({ color: 0x16202e, transparent: true, opacity: 0.55 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -0.02;
  g.name = 'groundGlow';
  scene.add(g);
}

/* ---------------------------------------------------------------- state */
const BUILDERS = {
  anatomy: buildAnatomy, cell: buildCell, plantcell: buildPlantCell,
  neuron: buildNeuron, molecules: buildMolecules, ochem: buildOchem,
  biochem: buildBiochem, earth: buildEarth, ecology: buildEcology
};
let atlas = null;
let parts = [];
let explodeT = 0;
let hovered = null;
let selected = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const $ = id => document.getElementById(id);
const systemsEl = $('systems'), infoCard = $('info-card'), infoBody = $('info-body');
const quizBar = $('quiz-bar'), quizEnd = $('quiz-end'), quizBtn = $('quiz-btn');
const searchInput = $('search-input'), searchResults = $('search-results');

/* camera fly-to + pulse highlight (search) */
const clock = new THREE.Clock();
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
let camAnim = null;
let pulsePart = null, pulseUntil = 0;

/* quiz mode state */
const quiz = { active: false, questions: [], total: 0, idx: 0, score: 0, locked: false, timer: null, mcat: null };
let searchIdx = [];

/* learn mode state: micro-quiz + mastery */
const micro = { active: false, q: null, kind: null, cycle: 0, locked: false, timer: null };
const MICRO_KINDS = ['recall', 'choice', 'element'];
const PRAISE = ['Nice!', 'Locked in!', 'Exactly right!', 'You got it!', 'Brain power! \u26A1'];
let mastery = {};
try { mastery = JSON.parse(localStorage.getItem('lumina-mastery') || '{}'); } catch (e) { mastery = {}; }
let lastSeen = null, chipTimer = null;

function atlasCtx() {
  return { id: atlas.id, molecule: atlas.getMoleculeInfo ? atlas.getMoleculeInfo() : null };
}

/* dynamic context id (molecule / view / amino acid) for mastery keys */
function contextId() {
  if (atlas.getContextId) return atlas.getContextId();
  const mi = atlas.getMoleculeInfo ? atlas.getMoleculeInfo() : null;
  return mi ? mi.id : 'main';
}
const mkey = part => masteryKey(atlas.id, contextId(), part.id);
const isLearned = part => !!mastery[mkey(part)];
function masterySave() {
  try { localStorage.setItem('lumina-mastery', JSON.stringify(mastery)); } catch (e) {}
}
function markLearned(part) {
  const k = mkey(part);
  if (!mastery[k]) { mastery[k] = 1; masterySave(); updateMasteryLine(); }
}
function updateMasteryLine() {
  const seen = new Set(); let learned = 0, total = 0;
  parts.forEach(p => {
    if (seen.has(p.id)) return;
    seen.add(p.id); total++;
    if (isLearned(p)) learned++;
  });
  $('atlas-meta').innerHTML =
    `${parts.length} clickable parts` +
    (atlas.systems && atlas.systems.length ? ` \u00B7 ${atlas.systems.length} systems` : '') +
    ` \u00B7 <span class="mastered">Mastered ${learned}/${total} \u2713</span>`;
}

/* ---------------------------------------------------------- atlas switch */
function disposeAtlas() {
  if (!atlas) return;
  scene.remove(atlas.group);
  atlas.group.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
  });
}

function tagParts() {
  parts.forEach(p => {
    p.group.traverse(m => { if (m.isMesh) m.userData.part = p; });
  });
}

function loadAtlas(id, keepQuiz = false) {
  if (!keepQuiz) endQuiz(false);
  endMicro(); hideLearnChip();
  disposeAtlas();
  clearSelection();
  atlas = BUILDERS[id]();
  scene.add(atlas.group);
  parts = typeof atlas.getParts === 'function' ? atlas.getParts() : atlas.parts;
  tagParts();
  buildSearchIdx();
  searchInput.value = '';
  searchResults.classList.remove('open');
  camera.position.set(...atlas.camera.pos);
  controls.target.set(...atlas.camera.target);
  controls.update();
  applyExplode();
  buildSystemsPanel();
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.atlas === id));
  updateMasteryLine();
  const mi = atlas.getMoleculeInfo ? atlas.getMoleculeInfo() : null;
  if (mi) showMoleculeInfo(mi, infoSuffix());
  else hideInfo();
}

function infoSuffix() {
  return (atlas.id === 'molecules' || atlas.id === 'ochem')
    ? '  Click any atom for element info.' : '';
}

function refreshParts(keepQuiz = false) { // after molecule/view switch
  if (!keepQuiz) endQuiz(false);
  parts = typeof atlas.getParts === 'function' ? atlas.getParts() : atlas.parts;
  tagParts();
  buildSearchIdx();
  applyExplode();
  updateMasteryLine();
}

/* --------------------------------------------------------------- explode */
function applyExplode() {
  if (!atlas) return;
  if (atlas.applyExplode) { atlas.applyExplode(explodeT); return; }
  parts.forEach(p => {
    if (p.explode) p.explode(explodeT);
    else p.group.position.copy(p.basePos).addScaledVector(p.explodeDir, explodeT * p.explodeDist);
  });
}
$('explode').addEventListener('input', e => {
  explodeT = e.target.value / 100;
  $('explode-val').textContent = e.target.value + '%';
  applyExplode();
});

/* ---------------------------------------------------------------- picking */
function pick(cx, cy) {
  pointer.x = (cx / window.innerWidth) * 2 - 1;
  pointer.y = -(cy / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const meshes = [];
  atlas.group.traverse(o => {
    if (o.isMesh && !o.userData.noPick && o.visible) {
      // skip invisible-via-system parents
      let n = o, ok = true;
      while (n && n !== atlas.group) { if (!n.visible) { ok = false; break; } n = n.parent; }
      if (ok) meshes.push(o);
    }
  });
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return null;
  // pick-through shells (cell membrane/cytoplasm): let inner parts win when present
  let i = 0;
  while (i < hits.length - 1) {
    const pt = hits[i].object.userData.part;
    if (pt && pt.pickThrough) i++;
    else break;
  }
  return hits[i].object.userData.part || null;
}

function setEmissive(part, hex) {
  part.group.traverse(m => {
    if (m.isMesh && m.material && m.material.emissive) {
      if (m.userData.origEmissive === undefined)
        m.userData.origEmissive = m.material.emissive.getHex();
      m.material.emissive.setHex(hex === null ? m.userData.origEmissive : hex);
    }
  });
}
function refreshHighlights() {
  parts.forEach(p => {
    if (p === selected) setEmissive(p, 0x4a4a4a);
    else if (p === hovered) setEmissive(p, 0x232323);
    else setEmissive(p, null);
  });
}

let downX = 0, downY = 0, downT = 0;
renderer.domElement.addEventListener('pointerdown', e => {
  downX = e.clientX; downY = e.clientY; downT = performance.now();
});
renderer.domElement.addEventListener('pointerup', e => {
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved < 7 && performance.now() - downT < 600) {
    const part = pick(e.clientX, e.clientY);
    if (micro.active && micro.q && (micro.q.kind === 'recall' || micro.q.kind === 'element')) {
      microAnswer3d(part); return; // empty-space taps don't count
    }
    if (quiz.active) { quizAnswer(part); return; } // never open info cards mid-quiz
    if (part) selectPart(part);
    else clearSelection(true);
  }
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const part = pick(e.clientX, e.clientY);
  if (part !== hovered) {
    hovered = part;
    renderer.domElement.style.cursor = part ? 'pointer' : 'grab';
    if (!quiz.locked) refreshHighlights(); // don't clear answer flashes
  }
});

function selectPart(part) {
  if (selected && selected !== part) setEmissive(selected, null);
  selected = part;
  refreshHighlights();
  showInfo(part.info);
}
function clearSelection(learn = false) {
  const was = selected;
  if (selected) setEmissive(selected, null);
  selected = null; hovered = null;
  refreshHighlights();
  hideInfo();
  if (learn && was) armLearnChip(was); // visiting a part arms a quick check
}

/* ------------------------------------------------------------ info card */
/* staggered letter pop for part names — playful, under ~600ms total */
function animTitle(name) {
  const chars = [...String(name)];
  return chars.map((ch, i) => {
    const d = Math.min(i * 0.018, 0.20).toFixed(3);
    const safe = ch === ' ' ? '&nbsp;' : escapeHtml(ch);
    return `<span class="rl" style="animation-delay:${d}s">${safe}</span>`;
  }).join('');
}
function showInfo(info) {
  infoBody.innerHTML =
    `<div class="tag">${escapeHtml(info.tag)}</div>` +
    `<h2 class="anim-title">${animTitle(info.name)}</h2>` +
    info.desc.map(d => `<p>${escapeHtml(d)}</p>`).join('') +
    (info.exam ? `<div class="exam"><span>\uD83D\uDD11 Exam point</span>${escapeHtml(info.exam)}</div>` : '') +
    `<a class="tutor-link" href="https://gradpath-727nuzefxhbofh3rmobmk3.streamlit.app/" target="_blank" rel="noopener">\uD83D\uDCAC Ask the GradPath tutor about this</a>` +
    `<button class="gotit-btn" id="gotit-btn">Got it \u2713</button>`;
  infoCard.classList.add('open');
  $('gotit-btn').addEventListener('click', () => clearSelection(true));
}
function hideInfo() { infoCard.classList.remove('open'); }
$('info-close').addEventListener('click', () => clearSelection(true));

/* ------------------------------------------------------------ quiz mode */
function startQuiz() {
  if (!parts.length) return;
  endQuiz(false);
  endMicro(); hideLearnChip();
  clearSelection();
  hideInfo();
  camAnim = null; pulsePart = null;
  controls.autoRotate = false;
  quiz.active = true;
  quiz.mcat = null;
  quiz.questions = sampleQuestions(parts, atlasCtx(), 10);
  quiz.total = quiz.questions.length;
  quiz.idx = 0; quiz.score = 0; quiz.locked = false;
  quizBtn.classList.add('on');
  quizBtn.innerHTML = '\u2715 Exit quiz';
  renderQuizBar();
  quizBar.hidden = false;
}

function renderQuizBar(feedback) {
  const q = quiz.questions[quiz.idx];
  const n = quiz.mcat ? quiz.mcat.qi + 1 : quiz.idx + 1;
  quizBar.innerHTML =
    `<div class="qq">${feedback || escapeHtml(questionPrompt(q, atlasCtx()))}</div>` +
    `<div class="qmeta">Question ${n}/${quiz.total} &middot; Score ${quiz.score}</div>`;
}

function quizAnswer(part) {
  if (!quiz.active || quiz.locked || !part) return; // empty-space clicks don't count
  quiz.locked = true;
  const q = quiz.questions[quiz.idx];
  if (isCorrectAnswer(q, part)) {
    quiz.score++;
    markLearned(part);
    setEmissive(part, 0x2ecc71);
    renderQuizBar('\u2705 Correct!');
  } else {
    setEmissive(part, 0xe74c3c);
    const target = findTargetPart(q, parts);
    if (target && target !== part) setEmissive(target, 0x2ecc71);
    renderQuizBar(`\u274C That was the <b>${escapeHtml(part.info.name)}</b> &mdash; find the <b>${escapeHtml(questionTargetLabel(q))}</b>`);
  }
  quiz.timer = setTimeout(() => {
    quiz.locked = false;
    if (quiz.mcat) {
      const m = quiz.mcat;
      m.qi++;
      if (m.qi >= quiz.total) endQuiz(true);
      else mcatNext();
    } else {
      quiz.idx++;
      if (quiz.idx >= quiz.total) endQuiz(true);
      else { refreshHighlights(); renderQuizBar(); }
    }
  }, 1200);
}

function endQuiz(showResults) {
  if (quiz.timer) { clearTimeout(quiz.timer); quiz.timer = null; }
  const wasActive = quiz.active;
  const score = quiz.score, total = quiz.total;
  const mcatSection = quiz.mcat ? quiz.mcat.section.id : null;
  quiz.active = false; quiz.locked = false; quiz.mcat = null;
  quiz.questions = []; quiz.total = 0; quiz.score = 0; quiz.idx = 0;
  quizBar.hidden = true;
  quizBtn.classList.remove('on');
  quizBtn.innerHTML = '\uD83C\uDFAF Quiz me';
  if (wasActive) refreshHighlights();
  if (showResults) showQuizEnd(score, total, mcatSection);
  else quizEnd.hidden = true;
}

function showQuizEnd(score, total, mcatSection = null) {
  const tier = quizTier(score, total);
  $('quiz-end-body').innerHTML =
    `<div class="qscore">${score}<span>/${total}</span></div>` +
    `<h2>${tier.title}</h2><p>${tier.sub}</p>` +
    `<div class="qbtns"><button id="quiz-retry">\u21BB Retry</button>` +
    `<button id="quiz-exit">Exit quiz</button></div>`;
  quizEnd.hidden = false;
  $('quiz-retry').addEventListener('click', () =>
    mcatSection ? startMcat(mcatSection) : startQuiz());
  $('quiz-exit').addEventListener('click', () => endQuiz(false));
}
quizBtn.addEventListener('click', () => quiz.active ? endQuiz(false) : startQuiz());

/* ------------------------------------------------------- MCAT prep packs */
const mcatMenu = $('mcat-menu');
$('mcat-btn').addEventListener('click', () => {
  if (quiz.active || micro.active) return;
  $('mcat-menu-body').innerHTML =
    `<h2>\u2695\uFE0F MCAT Prep</h2><p class="msub">10 questions across atlases, just like test day.</p>` +
    MCAT_SECTIONS.map(s =>
      `<button class="mpack" data-id="${s.id}"><strong>${escapeHtml(s.name)}</strong>` +
      `<span>${escapeHtml(s.tagline)}</span><em>${s.atlases.length} atlases \u00B7 ${MCAT_ROUND} questions</em></button>`).join('') +
    `<button id="mcat-close" class="skip-btn">Close</button>`;
  mcatMenu.querySelectorAll('.mpack').forEach(b =>
    b.addEventListener('click', () => startMcat(b.dataset.id)));
  $('mcat-close').addEventListener('click', () => { mcatMenu.hidden = true; });
  mcatMenu.hidden = false;
});

function startMcat(sectionId) {
  const sec = MCAT_SECTIONS.find(s => s.id === sectionId);
  if (!sec) return;
  mcatMenu.hidden = true;
  endMicro(); hideLearnChip();
  endQuiz(false);
  clearSelection(); hideInfo();
  controls.autoRotate = false;
  const atlases = shuffle(sec.atlases.slice());
  const order = [];
  for (let i = 0; i < MCAT_ROUND; i++) order.push(atlases[i % atlases.length]);
  quiz.mcat = { section: sec, order, qi: 0 };
  quiz.active = true;
  quiz.score = 0; quiz.total = MCAT_ROUND; quiz.idx = 0; quiz.locked = false;
  quiz.questions = [];
  quizBtn.classList.add('on');
  quizBtn.innerHTML = '\u2715 Exit';
  mcatNext();
}

function mcatNext() {
  const m = quiz.mcat;
  if (!m) return;
  const atlasId = m.order[m.qi];
  loadAtlas(atlasId, true);
  // randomize dynamic views so packs cover the full breadth
  if (atlasId === 'ochem' && atlas.setView) {
    atlas.setView(Math.random() < 0.5 ? 'groups' : 'gallery');
    if (atlas.getViewId() === 'gallery' && atlas.moleculeList) {
      const mols = atlas.moleculeList;
      atlas.setMolecule(mols[Math.floor(Math.random() * mols.length)].id);
    }
  }
  if (atlasId === 'biochem' && atlas.moleculeList && atlas.setMolecule) {
    const aas = atlas.moleculeList;
    atlas.setMolecule(aas[Math.floor(Math.random() * aas.length)].id);
  }
  buildSystemsPanel(); // reflect the randomized view/molecule in the panel
  refreshParts(true);
  const qs = sampleQuestions(parts, atlasCtx(), 1);
  if (!qs.length) { // degenerate state — skip ahead
    m.qi++;
    if (m.qi >= quiz.total) endQuiz(true); else mcatNext();
    return;
  }
  quiz.questions = qs; quiz.idx = 0;
  quizBar.hidden = false;
  renderQuizBar();
}

/* ------------------------------------------- learn mode: quick-check chip */
const learnChip = $('learn-chip');
function armLearnChip(part) {
  if (quiz.active || micro.active || !part) return;
  lastSeen = part;
  clearTimeout(chipTimer);
  learnChip.classList.add('show');
  chipTimer = setTimeout(hideLearnChip, 12000);
}
function hideLearnChip() {
  learnChip.classList.remove('show');
  clearTimeout(chipTimer); chipTimer = null;
  lastSeen = null;
}
$('learn-chip-go').addEventListener('click', startMicro);
$('learn-chip-x').addEventListener('click', hideLearnChip);

/* --------------------------------------------- learn mode: micro-quiz */
const microBar = $('micro-bar'), microModal = $('micro-modal');

function microLabel(q) {
  if (q.kind === 'element') return `${q.elName} atom`;
  if (q.kind === 'recall') return q.label;
  return q.part.info.name;
}

function startMicro() {
  const part = lastSeen;
  hideLearnChip();
  if (!part || quiz.active || micro.active) return;
  if (!parts.includes(part)) return; // atlas changed since the visit
  const kind = MICRO_KINDS[micro.cycle % MICRO_KINDS.length];
  micro.cycle++;
  const q = sampleMicroQuestion(part, parts, kind)
         || sampleMicroQuestion(part, parts, 'recall');
  if (!q) return;
  clearSelection();
  hideInfo();
  camAnim = null;
  controls.autoRotate = false;
  micro.active = true; micro.q = q; micro.kind = q.kind; micro.locked = false;
  if (q.kind === 'choice') {
    $('micro-modal-body').innerHTML =
      `<div class="qq">\u26A1 ${escapeHtml(q.stem)}</div>` +
      `<div class="mchoices">` + q.options.map((o, i) =>
        `<button class="mchoice" data-i="${i}">${escapeHtml(o)}</button>`).join('') +
      `</div><button id="micro-skip2" class="skip-btn">Skip</button>` +
      `<div class="mfeedback" id="mfeedback"></div>`;
    microModal.hidden = false;
    microModal.querySelectorAll('.mchoice').forEach(b =>
      b.addEventListener('click', () => microAnswerChoice(q, q.options[+b.dataset.i])));
    $('micro-skip2').addEventListener('click', endMicro);
  } else {
    const prompt = q.kind === 'element'
      ? escapeHtml(questionPrompt({ kind: 'element', el: q.el, elName: q.elName }, atlasCtx()))
      : `Click the: <b>${escapeHtml(q.label)}</b>`;
    microBar.innerHTML =
      `<div class="qq">\u26A1 ${prompt}</div>` +
      `<div class="qmeta">Quick check \u00B7 <button id="micro-skip" class="skip-btn">Skip</button></div>`;
    microBar.hidden = false;
    $('micro-skip').addEventListener('click', endMicro);
  }
}

function microAnswerChoice(q, pickedName) {
  if (!micro.active || micro.locked) return;
  micro.locked = true;
  const ok = pickedName === q.part.info.name;
  const fb = $('mfeedback');
  microModal.querySelectorAll('.mchoice').forEach(b => {
    if (b.textContent === q.part.info.name) b.classList.add('right');
    else if (b.textContent === pickedName && !ok) b.classList.add('wrong');
    b.disabled = true;
  });
  if (ok) {
    markLearned(q.part);
    confettiBurst();
    fb.innerHTML = `\u2705 ${PRAISE[Math.floor(Math.random() * PRAISE.length)]} That's the <b>${escapeHtml(q.part.info.name)}</b>!`;
    micro.timer = setTimeout(endMicro, 1600);
  } else {
    fb.innerHTML = `\uD83D\uDCA1 You'll get it next time \u2014 that's the <b>${escapeHtml(q.part.info.name)}</b>`;
    micro.timer = setTimeout(() => { endMicro(); selectPart(q.part); }, 1700);
  }
}

function microAnswer3d(clicked) {
  if (!micro.active || micro.locked || !clicked) return; // empty-space taps don't count
  micro.locked = true;
  const q = micro.q;
  const ok = q.kind === 'element' ? clicked.el === q.el : clicked === q.part;
  if (ok) {
    setEmissive(clicked, 0x2ecc71);
    markLearned(q.part);
    confettiBurst();
    microBar.innerHTML =
      `<div class="qq">\u2705 ${PRAISE[Math.floor(Math.random() * PRAISE.length)]} \u2014 that's the <b>${escapeHtml(microLabel(q))}</b>!</div>`;
    micro.timer = setTimeout(endMicro, 1600);
  } else {
    setEmissive(clicked, 0xe74c3c);
    const target = q.kind === 'element' ? parts.find(p => p.el === q.el) : q.part;
    if (target && target !== clicked) setEmissive(target, 0x2ecc71);
    microBar.innerHTML =
      `<div class="qq">\uD83D\uDCA1 You'll get it next time \u2014 that's the <b>${escapeHtml(microLabel(q))}</b></div>`;
    micro.timer = setTimeout(() => { endMicro(); if (target) selectPart(target); }, 1700);
  }
}

function endMicro() {
  if (micro.timer) { clearTimeout(micro.timer); micro.timer = null; }
  const was = micro.active;
  micro.active = false; micro.locked = false; micro.q = null; micro.kind = null;
  microBar.hidden = true;
  microModal.hidden = true;
  if (was) refreshHighlights();
}

function confettiBurst() {
  const c = $('confetti');
  c.innerHTML = '';
  const colors = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#b565d8'];
  for (let i = 0; i < 30; i++) {
    const s = document.createElement('span');
    s.style.setProperty('--tx', `${(Math.random() * 340 - 170).toFixed(0)}px`);
    s.style.setProperty('--ty', `${(-Math.random() * 280 - 60).toFixed(0)}px`);
    s.style.setProperty('--rot', `${(Math.random() * 720 - 360).toFixed(0)}deg`);
    s.style.background = colors[i % colors.length];
    c.appendChild(s);
  }
  c.classList.remove('go');
  void c.offsetWidth;
  c.classList.add('go');
  setTimeout(() => { c.classList.remove('go'); c.innerHTML = ''; }, 1200);
}

/* ---------------------------------------------------------------- search */
function buildSearchIdx() { searchIdx = buildSearchEntries(parts); }

function renderSearchResults() {
  if (quiz.active) { searchResults.classList.remove('open'); return; } // no hints mid-quiz
  const hits = searchEntries(searchIdx, searchInput.value, 8);
  if (!hits.length) { searchResults.innerHTML = ''; searchResults.classList.remove('open'); return; }
  searchResults.innerHTML = hits.map((h, i) =>
    `<button data-i="${i}"><span class="sr-name">${escapeHtml(h.name)}` +
    (isLearned(h.part) ? ` <span class="sr-check">\u2713</span>` : '') +
    `</span><span class="sr-tag">${escapeHtml(h.tag)}</span></button>`).join('');
  searchResults.classList.add('open');
  searchResults.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      const h = hits[+b.dataset.i];
      searchInput.value = '';
      searchResults.innerHTML = '';
      searchResults.classList.remove('open');
      focusPart(h.part);
    }));
}
searchInput.addEventListener('input', renderSearchResults);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.remove('open');
    searchInput.blur();
  }
});

/* fly the camera to a part, pulse-highlight it, open its info card */
function focusPart(part) {
  const wp = new THREE.Vector3();
  part.group.getWorldPosition(wp);
  const off = camera.position.clone().sub(controls.target);
  const dist = THREE.MathUtils.clamp(off.length(), 3.2, 6.5);
  off.normalize();
  camAnim = { t: 0, dur: 1.0,
    fromT: controls.target.clone(), toT: wp.clone(),
    fromP: camera.position.clone(), toP: wp.clone().addScaledVector(off, dist) };
  pulsePart = part;
  pulseUntil = performance.now() + 2400;
  selectPart(part);
  if (window.innerWidth <= 900) $('panel-left').classList.remove('open');
}

function showMoleculeInfo(m, suffix = '') {
  const headline = m.headline ||
    `Bond type: ${m.bondType} \u2014 Geometry: ${m.geometry} \u2014 ${m.polarity}.`;
  showInfo({
    tag: m.tag || 'Molecule',
    name: `${m.name} \u00B7 ${m.formula}`,
    desc: [headline, ...m.desc],
    exam: m.exam + suffix
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* --------------------------------------------------------- systems panel */
function appendHeading(text, cls = 'panel-heading') {
  const h = document.createElement('div');
  h.className = cls; h.textContent = text;
  systemsEl.appendChild(h);
}

function buildSystemsPanel() {
  systemsEl.innerHTML = '';
  // view switcher (neuron, ochem)
  if (atlas.viewList) {
    appendHeading('Views');
    atlas.viewList.forEach(v => {
      const b = document.createElement('button');
      b.className = 'mol-btn' + (atlas.getViewId() === v.id ? ' active' : '');
      b.innerHTML = `<strong>${escapeHtml(v.label)}</strong>`;
      b.addEventListener('click', () => {
        atlas.setView(v.id);
        refreshParts();
        clearSelection();
        const mi = atlas.getMoleculeInfo ? atlas.getMoleculeInfo() : null;
        if (mi) showMoleculeInfo(mi, infoSuffix()); else hideInfo();
        buildSystemsPanel();
      });
      systemsEl.appendChild(b);
    });
  }
  // molecule / amino-acid switcher (molecules, ochem gallery, biochem)
  if (atlas.moleculeList && atlas.showMolecules !== false) {
    appendHeading(atlas.moleculeListHeading || 'Molecules');
    const cur = atlas.getMoleculeInfo ? atlas.getMoleculeInfo() : null;
    const renderBtn = m => {
      const b = document.createElement('button');
      b.className = 'mol-btn switch-btn' + (cur && cur.id === m.id ? ' active' : '');
      b.innerHTML = `<strong>${escapeHtml(m.name)}</strong><span>${escapeHtml(m.formula)}</span>`;
      b.addEventListener('click', () => {
        atlas.setMolecule(m.id);
        refreshParts();
        clearSelection();
        const mi2 = atlas.getMoleculeInfo();
        if (mi2) showMoleculeInfo(mi2, infoSuffix()); else hideInfo();
        systemsEl.querySelectorAll('.switch-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      systemsEl.appendChild(b);
    };
    if (atlas.moleculeGroups) {
      atlas.moleculeGroups.forEach(g => {
        appendHeading(g.label, 'panel-subheading');
        atlas.moleculeList.filter(m => m.group === g.id).forEach(renderBtn);
      });
    } else {
      atlas.moleculeList.forEach(renderBtn);
    }
  }
  // biome selector (ecology)
  if (atlas.biomeList) {
    appendHeading('Biomes');
    atlas.biomeList.forEach(bi => {
      const b = document.createElement('button');
      b.className = 'mol-btn biome-btn';
      b.innerHTML = `<strong>${escapeHtml(bi.name)}</strong>`;
      b.addEventListener('click', () => {
        atlas.setBiome(bi.id);
        showInfo(atlas.getBiomeInfo());
        systemsEl.querySelectorAll('.biome-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      systemsEl.appendChild(b);
    });
  }
  // system layer checkboxes
  if (atlas.systems && atlas.systems.length) {
    appendHeading('Systems');
    atlas.systems.forEach(s => {
      const row = document.createElement('label');
      row.className = 'sys-row';
      row.innerHTML = `<input type="checkbox" checked>
        <span class="dot" style="background:${s.color}"></span>
        <span>${escapeHtml(s.label)}</span>`;
      row.querySelector('input').addEventListener('change', e => {
        parts.forEach(p => { if (p.system === s.id) p.group.visible = e.target.checked; });
        if (selected && !selected.group.visible) clearSelection();
      });
      systemsEl.appendChild(row);
    });
  }
  if (atlas.shell) {
    const row = document.createElement('label');
    row.className = 'sys-row';
    row.innerHTML = `<input type="checkbox" checked>
      <span class="dot" style="background:#9aa5b1"></span><span>Body outline</span>`;
    row.querySelector('input').addEventListener('change', e => {
      atlas.group.userData.shell.visible = e.target.checked;
    });
    systemsEl.appendChild(row);
  }
}

/* ------------------------------------------------------------------ tabs */
document.querySelectorAll('.tab').forEach(t =>
  t.addEventListener('click', () => loadAtlas(t.dataset.atlas)));

/* mobile panel toggle */
$('panel-toggle').addEventListener('click', () =>
  $('panel-left').classList.toggle('open'));

/* ---------------------------------------------------------------- resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ------------------------------------------------------------------ loop */
let firstFrame = true;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  if (camAnim) {
    camAnim.t += dt;
    const k = easeInOut(Math.min(1, camAnim.t / camAnim.dur));
    controls.target.lerpVectors(camAnim.fromT, camAnim.toT, k);
    camera.position.lerpVectors(camAnim.fromP, camAnim.toP, k);
    if (camAnim.t >= camAnim.dur) camAnim = null;
  }
  if (pulsePart) {
    if (performance.now() > pulseUntil || quiz.locked) {
      pulsePart = null;
      refreshHighlights();
    } else {
      setEmissive(pulsePart, Math.floor(performance.now() / 300) % 2 ? 0x7a5c14 : null);
    }
  }
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    setTimeout(() => document.getElementById('loader').classList.add('done'), 350);
  }
}

loadAtlas('anatomy');
animate();
