/* ScienceAtlas — main orchestrator.
 * Scene setup, atlas switching, explode slider, raycast picking,
 * hover highlight, systems panel, info card, responsive UI.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildAnatomy } from './anatomy.js';
import { buildCell } from './cell.js';
import { buildMolecules } from './molecules.js';

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
const BUILDERS = { anatomy: buildAnatomy, cell: buildCell, molecules: buildMolecules };
let atlas = null;
let parts = [];
let explodeT = 0;
let hovered = null;
let selected = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const $ = id => document.getElementById(id);
const systemsEl = $('systems'), infoCard = $('info-card'), infoBody = $('info-body');

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

function loadAtlas(id) {
  disposeAtlas();
  clearSelection();
  atlas = BUILDERS[id]();
  scene.add(atlas.group);
  parts = atlas.id === 'molecules' ? atlas.getParts() : atlas.parts;
  tagParts();
  camera.position.set(...atlas.camera.pos);
  controls.target.set(...atlas.camera.target);
  controls.update();
  applyExplode();
  buildSystemsPanel();
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.atlas === id));
  $('atlas-meta').textContent =
    `${parts.length} clickable parts${atlas.systems.length ? ' · ' + atlas.systems.length + ' systems' : ''}`;
  if (id === 'molecules') showMoleculeInfo();
  else hideInfo();
}

function refreshParts() { // after molecule switch
  parts = atlas.getParts();
  tagParts();
  applyExplode();
  $('atlas-meta').textContent = `${parts.length} clickable parts`;
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
    if (part) selectPart(part);
    else clearSelection();
  }
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const part = pick(e.clientX, e.clientY);
  if (part !== hovered) {
    hovered = part;
    renderer.domElement.style.cursor = part ? 'pointer' : 'grab';
    refreshHighlights();
  }
});

function selectPart(part) {
  if (selected && selected !== part) setEmissive(selected, null);
  selected = part;
  refreshHighlights();
  showInfo(part.info);
}
function clearSelection() {
  if (selected) setEmissive(selected, null);
  selected = null; hovered = null;
  refreshHighlights();
  hideInfo();
}

/* ------------------------------------------------------------ info card */
function showInfo(info) {
  infoBody.innerHTML =
    `<div class="tag">${escapeHtml(info.tag)}</div>` +
    `<h2>${escapeHtml(info.name)}</h2>` +
    info.desc.map(d => `<p>${escapeHtml(d)}</p>`).join('') +
    (info.exam ? `<div class="exam"><span>\uD83D\uDD11 Exam point</span>${escapeHtml(info.exam)}</div>` : '');
  infoCard.classList.add('open');
}
function hideInfo() { infoCard.classList.remove('open'); }
$('info-close').addEventListener('click', clearSelection);

function showMoleculeInfo() {
  const m = atlas.getMoleculeInfo();
  showInfo({
    tag: 'Molecule',
    name: `${m.name} · ${m.formula}`,
    desc: [
      `Bond type: ${m.bondType} \u2014 Geometry: ${m.geometry} \u2014 ${m.polarity}.`,
      ...m.desc
    ],
    exam: m.exam + '  Click any atom for element info.'
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* --------------------------------------------------------- systems panel */
function buildSystemsPanel() {
  systemsEl.innerHTML = '';
  if (atlas.moleculeList) {
    const h = document.createElement('div');
    h.className = 'panel-heading'; h.textContent = 'Molecules';
    systemsEl.appendChild(h);
    atlas.moleculeList.forEach(m => {
      const b = document.createElement('button');
      b.className = 'mol-btn' + (atlas.getMoleculeInfo().id === m.id ? ' active' : '');
      b.innerHTML = `<strong>${escapeHtml(m.name)}</strong><span>${escapeHtml(m.formula)}</span>`;
      b.addEventListener('click', () => {
        atlas.setMolecule(m.id);
        refreshParts();
        clearSelection();
        showMoleculeInfo();
        systemsEl.querySelectorAll('.mol-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      systemsEl.appendChild(b);
    });
    return;
  }
  const h = document.createElement('div');
  h.className = 'panel-heading'; h.textContent = 'Systems';
  systemsEl.appendChild(h);
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
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    setTimeout(() => document.getElementById('loader').classList.add('done'), 350);
  }
}

loadAtlas('anatomy');
animate();
