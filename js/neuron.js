/* Lumina — Neuron Lab atlas.
 * Three views sharing one container: a stylized neuron lying along the x-axis
 * (with an enlarged synapse close-up at the terminals), a stylized brain
 * with clickable regions, and an animated action-potential diagram with a
 * live voltage-vs-time graph. Descriptions grounded in OpenStax Biology 2e,
 * Chapters 33 and 35 (the nervous system, neurons and synapses, the brain).
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  soma: {
    name: 'Soma (Cell Body)',
    tag: 'Neuron',
    desc: [
      'The soma is the neuron\u2019s cell body. It contains the nucleus and most of the organelles, and it carries out the cell\u2019s normal metabolic life.',
      'Signals arriving from the dendrites are summed here: if the combined input depolarizes the soma enough, an action potential is triggered at the axon hillock.'
    ],
    exam: 'Soma = metabolic center + signal integrator. Dendrites bring signals IN, the soma decides whether to fire.'
  },
  dendrites: {
    name: 'Dendrites',
    tag: 'Neuron',
    desc: [
      'Dendrites are the neuron\u2019s branched, tree-like extensions. Their huge combined surface area lets one neuron receive input from thousands of other neurons.',
      'They collect graded (local) potentials from synapses and funnel them toward the soma. The word comes from the Greek for \u201ctree.\u201d'
    ],
    exam: 'Dendrites RECEIVE signals (toward the soma). Axons TRANSMIT (away from the soma) \u2014 a classic exam direction question.'
  },
  axonhillock: {
    name: 'Axon Hillock',
    tag: 'Neuron',
    desc: [
      'The axon hillock is the cone-shaped region where the axon leaves the soma. It has the highest density of voltage-gated sodium channels in the neuron.',
      'Because of that, it has the lowest threshold: when the summed input from the soma depolarizes it past about \u221255 mV, it fires the action potential down the axon.'
    ],
    exam: 'Axon hillock = the neuron\u2019s trigger zone. Threshold here (\u2248 \u221255 mV) is what decides fire vs. no fire.'
  },
  axon: {
    name: 'Axon',
    tag: 'Neuron',
    desc: [
      'The axon is the long fiber that transmits the action potential away from the soma toward the axon terminals. It can be microscopic or over a meter long (as in a motor neuron to the foot).',
      'A neuron at rest holds a membrane potential of about \u221270 mV (negative inside), maintained by the sodium-potassium pump and potassium leak channels.'
    ],
    exam: 'Resting potential \u2248 \u221270 mV. Axon direction is always AWAY from the cell body.'
  },
  myelin: {
    name: 'Myelin Sheath',
    tag: 'Neuron',
    desc: [
      'The myelin sheath is insulation made of glial cell membrane wrapped around the axon \u2014 Schwann cells in the peripheral nervous system, oligodendrocytes in the central nervous system.',
      'Myelin speeds the action potential enormously: the signal jumps from gap to gap (saltatory conduction) instead of traveling continuously, and it also saves energy.'
    ],
    exam: 'Myelin = faster conduction via SALTATORY (jumping) conduction. Lost myelin (e.g. multiple sclerosis) = slowed signals.'
  },
  nodes: {
    name: 'Nodes of Ranvier',
    tag: 'Neuron',
    desc: [
      'Nodes of Ranvier are the short gaps between adjacent myelin segments where the axon membrane is exposed.',
      'They are packed with voltage-gated Na\u207a and K\u207a channels, so the action potential is regenerated at each node \u2014 that is what lets the signal \u201cjump\u201d down a myelinated axon.'
    ],
    exam: 'Nodes of Ranvier = exposed gaps full of voltage-gated channels, where the action potential is re-boosted.'
  },
  terminals: {
    name: 'Axon Terminals',
    tag: 'Neuron',
    desc: [
      'The axon ends by branching into axon terminals (terminal arborizations), each ending in a synaptic knob that can contact another neuron, a muscle cell, or a gland.',
      'When the action potential arrives, voltage-gated calcium channels open in the terminals, and the calcium influx triggers neurotransmitter release.'
    ],
    exam: 'Action potential arrives \u2192 Ca\u00b2\u207a enters the terminals \u2192 vesicles fuse \u2192 neurotransmitter released.'
  },
  presynaptic: {
    name: 'Presynaptic Terminal',
    tag: 'Synapse',
    desc: [
      'The presynaptic terminal is the enlarged end of the axon terminal on the sending side of a synapse. It is packed with synaptic vesicles.',
      'It converts the electrical signal (the arriving action potential) into a chemical signal by releasing neurotransmitter into the synaptic cleft.'
    ],
    exam: 'Presynaptic = BEFORE the gap (sending side). Postsynaptic = AFTER the gap (receiving side).'
  },
  vesicles: {
    name: 'Synaptic Vesicles',
    tag: 'Synapse',
    desc: [
      'Synaptic vesicles are small membrane sacs in the presynaptic terminal, each loaded with thousands of neurotransmitter molecules.',
      'When calcium enters the terminal, vesicles fuse with the presynaptic membrane (exocytosis) and dump their neurotransmitter into the synaptic cleft.'
    ],
    exam: 'Vesicles = neurotransmitter packets. Ca\u00b2\u207a influx is the signal that makes them fuse and release.'
  },
  cleft: {
    name: 'Synaptic Cleft',
    tag: 'Synapse',
    desc: [
      'The synaptic cleft is the tiny gap (about 20 nanometers wide) between the presynaptic and postsynaptic membranes.',
      'Neurotransmitter diffuses across this gap in a fraction of a millisecond and binds to receptors on the postsynaptic membrane \u2014 so the signal crosses as a chemical, not as electricity.'
    ],
    exam: 'The cleft is why synapses are slow points: chemical diffusion across the gap takes time.'
  },
  postsynaptic: {
    name: 'Postsynaptic Membrane',
    tag: 'Synapse',
    desc: [
      'The postsynaptic membrane is the receiving cell\u2019s membrane, studded with receptor proteins shaped to bind the incoming neurotransmitter.',
      'When neurotransmitter binds, the receptors open ion channels (or trigger second messengers), producing a graded potential in the receiving cell \u2014 excitatory or inhibitory depending on the receptor.'
    ],
    exam: 'Neurotransmitter binding \u2192 channels open \u2192 graded potential in the next cell. Receptors decide excitation vs. inhibition.'
  },
  cerebrum: {
    name: 'Cerebrum',
    tag: 'Brain regions',
    desc: [
      'The cerebrum is the largest part of the human brain, divided into left and right hemispheres joined by the corpus callosum. Its wrinkled outer cortex is where higher processing happens.',
      'It handles conscious thought, language, memory, planning, and voluntary movement \u2014 the functions most people mean by \u201chigher thought.\u201d'
    ],
    exam: 'Cerebrum = higher thought: language, memory, planning, voluntary movement. Cortex = the wrinkled outer layer.'
  },
  cerebellum: {
    name: 'Cerebellum',
    tag: 'Brain regions',
    desc: [
      'The cerebellum (\u201clittle brain\u201d) sits behind and below the cerebrum. Despite its small size it holds more than half of the brain\u2019s neurons.',
      'It fine-tunes movement: coordination, balance, posture, and motor learning. Damage here causes clumsy, uncoordinated movement (ataxia), not paralysis.'
    ],
    exam: 'Cerebellum = coordination and balance. Think \u201clittle brain, big job in fine-tuning movement.\u201d'
  },
  brainstem: {
    name: 'Brainstem',
    tag: 'Brain regions',
    desc: [
      'The brainstem connects the brain to the spinal cord and includes the midbrain, pons, and medulla oblongata.',
      'It runs the non-negotiable basics: breathing, heart rate, blood pressure, and arousal. Nearly all sensory and motor tracts pass through it.'
    ],
    exam: 'Brainstem = life support: breathing, heart rate, blood pressure. Damage here is rapidly fatal.'
  },
  corpuscallosum: {
    name: 'Corpus Callosum',
    tag: 'Brain regions',
    desc: [
      'The corpus callosum is a broad band of axons \u2014 about 200 million of them \u2014 arching over the thalamus and connecting the two cerebral hemispheres.',
      'It lets the hemispheres share information instantly, so the brain acts as one integrated organ rather than two independent halves.'
    ],
    exam: 'Corpus callosum = the bridge between hemispheres. Cut it and each hemisphere works largely on its own.'
  },
  thalamus: {
    name: 'Thalamus',
    tag: 'Brain regions',
    desc: [
      'The thalamus is a paired egg-shaped structure deep in the brain that acts as the main relay station for sensory information.',
      'Almost all sensory input (except smell) passes through the thalamus on its way to the cortex, which also lets it help regulate attention and sleep.'
    ],
    exam: 'Thalamus = sensory relay to the cortex. Almost everything you feel passes through it first (except smell).'
  },
  hypothalamus: {
    name: 'Hypothalamus',
    tag: 'Brain regions',
    desc: [
      'The hypothalamus is a small region below the thalamus that links the nervous system to the endocrine system via the pituitary gland.',
      'It is the body\u2019s thermostat and homeostat: it regulates hunger, thirst, body temperature, sleep, and the stress response.'
    ],
    exam: 'Hypothalamus = homeostasis headquarters: hunger, thirst, temperature, plus control of the pituitary.'
  },
  nachannel: {
    name: 'Sodium Channel (Na\u207a)',
    tag: 'Action potential',
    desc: [
      'Voltage-gated sodium channels are proteins spanning the axon membrane. At rest they are closed; when the membrane depolarizes past threshold (\u2248 \u221255 mV), they snap open.',
      'Na\u207a then rushes INTO the axon down its electrochemical gradient, driving the rising phase of the action potential up to about +30 mV. They inactivate within a millisecond, which is why the spike is so brief.'
    ],
    exam: 'Depolarization = Na\u207a IN. Channels open at threshold (\u221255 mV) and inactivate fast.'
  },
  kchannel: {
    name: 'Potassium Channel (K\u207a)',
    tag: 'Action potential',
    desc: [
      'Voltage-gated potassium channels open more slowly, near the peak of the action potential.',
      'K\u207a then flows OUT of the axon down its concentration gradient, bringing the membrane potential back down (repolarization) and briefly overshooting into hyperpolarization.'
    ],
    exam: 'Repolarization = K\u207a OUT. These channels are slower to open than Na\u207a channels \u2014 that delay shapes the falling phase.'
  },
  napump: {
    name: 'Sodium-Potassium Pump',
    tag: 'Action potential',
    desc: [
      'The Na\u207a/K\u207a-ATPase uses ATP to move 3 Na\u207a out of the axon and 2 K\u207a in, against their concentration gradients.',
      'It does not create the action potential \u2014 it restores the ion gradients afterward, maintaining the \u221270 mV resting potential so the neuron can fire again.'
    ],
    exam: 'Pump = 3 Na\u207a OUT, 2 K\u207a IN, costs ATP. It maintains gradients; it does NOT cause the spike.'
  },
  depol: {
    name: 'Depolarization',
    tag: 'Action potential',
    desc: [
      'Depolarization is the rising phase of the action potential: the membrane potential shoots from the resting \u221270 mV, past threshold (\u221255 mV), up to about +30 mV.',
      'It is caused by voltage-gated Na\u207a channels opening and Na\u207a flooding into the axon. Press Play and watch the orange ions stream in.'
    ],
    exam: 'Depolarization: \u221270 \u2192 +30 mV, caused by Na\u207a influx. "Depolarize" = the inside becomes less negative.'
  },
  repol: {
    name: 'Repolarization',
    tag: 'Action potential',
    desc: [
      'Repolarization is the falling phase: K\u207a channels open, K\u207a flows out of the axon, and the membrane potential drops back toward \u221270 mV, briefly overshooting into hyperpolarization.',
      'The Na\u207a channels are inactivated by now, so no new spike can start until they reset \u2014 part of the refractory period.'
    ],
    exam: 'Repolarization: +30 mV \u2192 \u221270 mV (and below), caused by K\u207a efflux. The overshoot is hyperpolarization.'
  }
};

const SYSTEMS = [
  { id: 'neuron', label: 'Neuron', color: '#5dade2' },
  { id: 'synapse', label: 'Synapse', color: '#f5b041' },
  { id: 'brain', label: 'Brain regions', color: '#af7ac5' },
  { id: 'apchan', label: 'Ion channels', color: '#f39c12' },
  { id: 'appump', label: 'Na\u207a/K\u207a pump', color: '#9b59b6' },
  { id: 'apphase', label: 'Phase labels', color: '#2ecc71' }
];

const VIEWS = [
  { id: 'cell', label: '\uD83D\uDD2C Neuron' },
  { id: 'brain', label: '\uD83E\uDDE0 Brain regions' },
  { id: 'ap', label: '\u26A1 Action potential' }
];
const CAMERAS = {
  cell: { pos: [6.2, 3.0, 7.8], target: [0.4, 0, 0] },
  brain: { pos: [4.6, 3.2, 7.0], target: [0, -0.3, 0] },
  ap: { pos: [0, 3.6, 11.2], target: [0, 0.3, 0] }
};

/* --------------------------------- action potential timeline (OpenStax) */
/* One full cycle in seconds. Exported pure so tests can verify the curve. */
export const AP_CYCLE = 6.0;
export const AP_PHASES = [
  { id: 'rest',    label: 'Resting \u2014 \u221270 mV',            t0: 0.0, t1: 1.6, v0: -70, v1: -70 },
  { id: 'depol',   label: 'Depolarization \u2014 Na\u207a rushes in', t0: 1.6, t1: 2.7, v0: -70, v1: 30 },
  { id: 'repol',   label: 'Repolarization \u2014 K\u207a flows out',  t0: 2.7, t1: 3.8, v0: 30,  v1: -80 },
  { id: 'hyper',   label: 'Hyperpolarization \u2014 brief dip',   t0: 3.8, t1: 4.6, v0: -80, v1: -70 },
  { id: 'restore', label: 'Pump restores the gradients',        t0: 4.6, t1: 6.0, v0: -70, v1: -70 }
];
function smootherstep(x) {
  x = Math.min(1, Math.max(0, x));
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function apWrap(t) { return ((t % AP_CYCLE) + AP_CYCLE) % AP_CYCLE; }
export function apPhaseAt(t) {
  const tt = apWrap(t);
  return AP_PHASES.find(p => tt >= p.t0 && tt < p.t1) || AP_PHASES[0];
}
export function apVoltageAt(t) {
  const p = apPhaseAt(t);
  const k = smootherstep((apWrap(t) - p.t0) / (p.t1 - p.t0));
  return p.v0 + (p.v1 - p.v0) * k;
}

/* --------------------------------------------------------------- helpers */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.5, metalness: 0.05 }, opts));
}
function ghost(color, opacity) {
  return new THREE.MeshPhongMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, shininess: 80, specular: 0x99ccff
  });
}
function ball(r, color, w = 24, h = 18) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat(color));
}

/** Register a clickable part. Meshes are added in local coords; the group
 *  sits at basePos. Explode pushes radially away from the scene center. */
function makePart(id, system, basePos, explodeDist = 1.7) {
  const bp = new THREE.Vector3(...basePos);
  const dir = bp.clone().sub(new THREE.Vector3(0.3, 0, 0));
  if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
  return {
    id, system,
    info: INFO[id],
    group: new THREE.Group(),
    basePos: bp,
    explodeDir: dir.normalize(),
    explodeDist
  };
}
function addMesh(part, mesh, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  part.group.add(mesh);
  return mesh;
}
/** Tapered cylinder between two local points. */
function limb(a, b, r1, r2, color) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 12), mat(color));
  m.position.copy(va).lerp(vb, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return m;
}

function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* Floating text plaque (canvas texture). The group carries
 * userData.setGlow(on) to highlight it during its animation phase. */
function makePlaque(text, accent = '#5dade2', fs = 44) {
  const padX = 34, padY = 24;
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
  const tw = Math.ceil(meas.measureText(text).width);
  const c = document.createElement('canvas');
  c.width = tw + padX * 2; c.height = fs + padY * 2;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(13,22,36,0.88)';
  g.strokeStyle = accent; g.lineWidth = 5;
  roundRectPath(g, 4, 4, c.width - 8, c.height - 8, 26);
  g.fill(); g.stroke();
  g.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
  g.fillStyle = '#eaf2f8'; g.textBaseline = 'middle';
  g.fillText(text, padX, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const H = 0.62, W = H * (c.width / c.height);
  const group = new THREE.Group();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(W + 0.2, H + 0.2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true,
      opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  );
  glow.position.z = -0.02;
  group.add(glow); group.add(face);
  group.userData.setGlow = on => { glow.material.opacity = on ? 0.55 : 0; };
  return group;
}
/* Mark a mesh (or subtree) as decorative: raycast picking skips it. */
function noPick(obj) {
  obj.traverse(o => { o.userData.noPick = true; });
  return obj;
}

/* ----------------------------------------------------------------- build */
export function buildNeuron() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  let parts = [];
  let view = 'cell';

  /* ---------------- action potential view: animation + HUD state -------- */
  const ap = { t: 0, playing: true, ions: [], spawnAcc: 0 };
  let apView = null;           // per-view refs: { ionGroup, depolPlaque, repolPlaque }
  let apOverlay = null, apCanvas = null, apCtx2d = null;
  const apEls = {};
  const NA_XS = [-3.4, -2.6, -1.8];
  const K_XS = [1.8, 2.6, 3.4];

  function ensureApOverlay() {
    if (apOverlay) return;
    apOverlay = document.createElement('div');
    apOverlay.id = 'ap-panel';
    apOverlay.innerHTML =
      '<div class="ap-head">\u26A1 Action potential <span id="ap-phase">Resting</span></div>' +
      '<canvas id="ap-graph" width="560" height="300"></canvas>' +
      '<div class="ap-volt">Membrane potential: <b id="ap-vm">\u221270 mV</b></div>' +
      '<div class="ap-controls"><button id="ap-play">\u23F8 Pause</button>' +
      '<button id="ap-step">\u23ED Step</button>' +
      '<button id="ap-reset">\u21BA Reset</button></div>' +
      '<div class="ap-legend"><span><span class="sw" style="background:#ffa726"></span>Na\u207a in</span>' +
      '<span><span class="sw" style="background:#4dd0e1"></span>K\u207a out</span>' +
      '<span><span class="sw" style="background:#9b59b6"></span>pump</span></div>';
    document.body.appendChild(apOverlay);
    apCanvas = apOverlay.querySelector('#ap-graph');
    apCtx2d = apCanvas.getContext('2d');
    apEls.phase = apOverlay.querySelector('#ap-phase');
    apEls.vm = apOverlay.querySelector('#ap-vm');
    apEls.play = apOverlay.querySelector('#ap-play');
    const setPlayLabel = () => { apEls.play.textContent = ap.playing ? '\u23F8 Pause' : '\u25B6 Play'; };
    apEls.play.addEventListener('click', () => { ap.playing = !ap.playing; setPlayLabel(); });
    apOverlay.querySelector('#ap-step').addEventListener('click', () => {
      ap.playing = false; setPlayLabel();
      const idx = AP_PHASES.indexOf(apPhaseAt(ap.t));
      ap.t = AP_PHASES[(idx + 1) % AP_PHASES.length].t0 + 0.001;
      clearApIons();
    });
    apOverlay.querySelector('#ap-reset').addEventListener('click', () => {
      ap.t = 0; ap.playing = true; setPlayLabel();
      clearApIons();
    });
    setPlayLabel();
  }
  function setApOverlayVisible(on) {
    ensureApOverlay();
    apOverlay.style.display = on ? 'block' : 'none';
  }

  function clearApIons() {
    if (!apView) { ap.ions = []; return; }
    ap.ions.forEach(io => {
      apView.ionGroup.remove(io.mesh);
      io.mesh.geometry.dispose(); io.mesh.material.dispose();
    });
    ap.ions = [];
  }

  function spawnApIon(kind, x, y0, y1) {
    if (!apView || ap.ions.length > 60) return;
    const mesh = ball(0.10, kind === 'na' ? 0xffa726 : 0x4dd0e1, 12, 10);
    mesh.userData.noPick = true;
    apView.ionGroup.add(mesh);
    ap.ions.push({ mesh, x, z: (Math.random() - 0.5) * 1.6, y0, y1, t: 0, dur: 0.85 });
  }

  function stepApIons(dt) {
    for (let i = ap.ions.length - 1; i >= 0; i--) {
      const io = ap.ions[i];
      io.t += dt / io.dur;
      if (io.t >= 1) {
        apView.ionGroup.remove(io.mesh);
        io.mesh.geometry.dispose(); io.mesh.material.dispose();
        ap.ions.splice(i, 1);
        continue;
      }
      io.mesh.position.set(io.x, io.y0 + (io.y1 - io.y0) * io.t, io.z);
    }
  }

  function drawApGraph() {
    if (!apCtx2d) return;
    const g = apCtx2d, W = apCanvas.width, H = apCanvas.height;
    g.clearRect(0, 0, W, H);
    const x0 = 44, x1 = W - 14, yTop = 16, yBot = H - 30;
    const X = t => x0 + (apWrap(t) / AP_CYCLE) * (x1 - x0);
    const Y = v => yBot - ((v + 90) / 135) * (yBot - yTop);
    // reference lines
    const refs = [
      { v: -70, c: 'rgba(255,255,255,0.30)', l: 'rest \u221270' },
      { v: -55, c: 'rgba(242,193,78,0.55)', l: 'threshold \u221255' },
      { v: 30, c: 'rgba(255,255,255,0.30)', l: 'peak +30' }
    ];
    g.font = '19px system-ui, sans-serif';
    refs.forEach(r => {
      g.strokeStyle = r.c; g.lineWidth = 2; g.setLineDash([7, 6]);
      g.beginPath(); g.moveTo(x0, Y(r.v)); g.lineTo(x1, Y(r.v)); g.stroke();
      g.setLineDash([]);
      g.fillStyle = r.c; g.fillText(r.l, x0 + 4, Y(r.v) - 6);
    });
    // full cycle, faint
    g.beginPath();
    for (let t = 0; t <= AP_CYCLE + 1e-6; t += 0.05) {
      const x = X(t), y = Y(apVoltageAt(t));
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 3; g.stroke();
    // elapsed portion, bright
    const tc = apWrap(ap.t);
    g.beginPath();
    for (let t = 0; t <= tc + 1e-6; t += 0.05) {
      const x = X(t), y = Y(apVoltageAt(t));
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokeStyle = '#f2c14e'; g.lineWidth = 5; g.stroke();
    // current voltage dot
    g.beginPath();
    g.arc(X(tc), Y(apVoltageAt(ap.t)), 8, 0, Math.PI * 2);
    g.fillStyle = '#f2c14e'; g.fill();
    g.strokeStyle = '#0d1420'; g.lineWidth = 2; g.stroke();
    // axis labels
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.fillText('mV', 6, yTop + 6);
    g.fillText('time \u2192', x1 - 64, H - 8);
  }

  function apUpdate(dt) {
    if (view !== 'ap' || !apView) return;
    if (ap.playing) {
      ap.t = apWrap(ap.t + dt);
      const ph = apPhaseAt(ap.t);
      ap.spawnAcc += dt;
      if (ph.id === 'depol' && ap.spawnAcc > 0.12) {
        ap.spawnAcc = 0;
        spawnApIon('na', NA_XS[(Math.random() * NA_XS.length) | 0], 2.3, -2.1);
      } else if (ph.id === 'repol' && ap.spawnAcc > 0.12) {
        ap.spawnAcc = 0;
        spawnApIon('k', K_XS[(Math.random() * K_XS.length) | 0], -2.1, 2.3);
      } else if ((ph.id === 'rest' || ph.id === 'restore') && ap.spawnAcc > 0.55) {
        ap.spawnAcc = 0;
        // pump: 3 Na\u207a out, 2 K\u207a in (stylized single ions)
        if (Math.random() < 0.6) spawnApIon('na', (Math.random() - 0.5) * 0.3, -1.7, 2.1);
        else spawnApIon('k', (Math.random() - 0.5) * 0.3, 2.1, -1.7);
      }
    }
    stepApIons(dt);
    // phase plaque glow
    const ph = apPhaseAt(ap.t);
    if (apView.depolPlaque) apView.depolPlaque.userData.setGlow(ph.id === 'depol');
    if (apView.repolPlaque) apView.repolPlaque.userData.setGlow(ph.id === 'repol');
    // HUD readouts
    if (apEls.phase) apEls.phase.textContent = ph.label;
    if (apEls.vm) apEls.vm.textContent = `${Math.round(apVoltageAt(ap.t))} mV`;
    drawApGraph();
  }

  function clearContainer() {
    container.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    container.clear();
    parts = [];
  }

  function push(p) { p.group.position.copy(p.basePos); parts.push(p); container.add(p.group); }

  /* ------------------------------------------ view 1: neuron along x-axis */
  function buildNeuronView() {
    // --- dendrites: branching tapered cylinders left of the soma ---
    {
      const p = makePart('dendrites', 'neuron', [-3.0, 0, 0]);
      const C = 0x2e86c1;
      p.group.add(limb([0.65, 0, 0], [-0.25, 0.1, 0], 0.14, 0.07, C));
      p.group.add(limb([-0.25, 0.1, 0], [-0.95, 0.9, 0.3], 0.07, 0.025, C));
      p.group.add(limb([-0.25, 0.1, 0], [-0.85, -0.8, -0.2], 0.07, 0.025, C));
      p.group.add(limb([-0.25, 0.1, 0], [-0.75, 0.2, -0.9], 0.07, 0.025, C));
      p.group.add(limb([0.6, -0.25, 0.25], [-0.4, -1.15, 0.65], 0.09, 0.03, C));
      p.group.add(limb([0.6, 0.25, -0.25], [-0.5, 1.05, -0.85], 0.09, 0.03, C));
      push(p);
    }
    // --- soma ---
    {
      const p = makePart('soma', 'neuron', [-1.9, 0, 0]);
      addMesh(p, ball(0.72, 0x5dade2));
      addMesh(p, ball(0.26, 0x2e4053), 0.1, 0.1, 0.15); // nucleus hint
      push(p);
    }
    // --- axon hillock ---
    {
      const p = makePart('axonhillock', 'neuron', [-1.02, 0, 0]);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 20), mat(0x85c1e9));
      cone.rotation.z = -Math.PI / 2;
      p.group.add(cone);
      push(p);
    }
    // --- axon: long tube ---
    {
      const p = makePart('axon', 'neuron', [0.8, 0, 0]);
      const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 3.2, 16), mat(0x5dade2));
      ax.rotation.z = Math.PI / 2;
      p.group.add(ax);
      push(p);
    }
    // --- myelin sheath: 4 segments, one part ---
    {
      const p = makePart('myelin', 'neuron', [0.8, 0, 0]);
      [-1.19, -0.37, 0.45, 1.27].forEach(x => {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.62, 20), mat(0xf9e79f));
        seg.rotation.z = Math.PI / 2;
        addMesh(p, seg, x, 0, 0);
      });
      push(p);
    }
    // --- nodes of Ranvier: exposed gaps, one part ---
    {
      const p = makePart('nodes', 'neuron', [0.8, 0, 0]);
      [-0.78, 0.04, 0.86].forEach(x => {
        const n = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 16), mat(0xe67e22));
        n.rotation.z = Math.PI / 2;
        addMesh(p, n, x, 0, 0);
      });
      push(p);
    }
    // --- axon terminals: branching ends ---
    {
      const p = makePart('terminals', 'neuron', [2.7, 0, 0], 2.0);
      const C = 0x5dade2;
      const ends = [
        [[-0.3, 0, 0], [0.3, 0.5, 0.2]],
        [[-0.3, 0, 0], [0.35, -0.45, -0.15]],
        [[-0.3, 0, 0], [0.25, 0.1, 0.55]],
        [[-0.3, 0, 0], [0.25, -0.1, -0.5]]
      ];
      ends.forEach(([a, b]) => {
        p.group.add(limb(a, b, 0.08, 0.03, C));
        addMesh(p, ball(0.09, 0xe67e22, 12, 10), b[0], b[1], b[2]);
      });
      push(p);
    }
    // --- synapse close-up (enlarged, at the terminal end) ---
    {
      const p = makePart('presynaptic', 'synapse', [3.25, 0, 0], 2.2);
      addMesh(p, ball(0.5, 0xf5b041));
      push(p);
    }
    {
      const p = makePart('vesicles', 'synapse', [3.25, 0, 0], 2.2);
      const spots = [
        [-0.15, 0.12, 0.1], [0.05, -0.18, 0.12], [0.12, 0.05, -0.18],
        [-0.05, 0.2, -0.1], [0.2, -0.05, 0.08], [-0.2, -0.1, -0.05],
        [0.0, 0.0, 0.22], [-0.1, -0.22, -0.12], [0.22, 0.14, -0.02],
        [0.08, 0.24, 0.08]
      ];
      spots.forEach(s => addMesh(p, ball(0.09, 0xe67e22, 12, 10), s[0], s[1], s[2]));
      push(p);
    }
    {
      const p = makePart('cleft', 'synapse', [3.88, 0, 0], 2.4);
      const gap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 28), ghost(0xfdebd0, 0.55));
      gap.rotation.z = Math.PI / 2;
      p.group.add(gap);
      push(p);
    }
    {
      const p = makePart('postsynaptic', 'synapse', [4.5, 0, 0], 2.6);
      const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.26, 28), mat(0xaf7ac5));
      slab.rotation.z = Math.PI / 2;
      p.group.add(slab);
      // receptor knobs on the cleft-facing side
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        addMesh(p, ball(0.07, 0x7d3c98, 10, 8), -0.17, Math.cos(a) * 0.42, Math.sin(a) * 0.42);
      }
      push(p);
    }
  }

  /* ------------------------------------------------- view 2: brain regions */
  function buildBrainView() {
    const C = new THREE.Vector3(0, -0.3, 0);
    const bpush = (p) => {
      const dir = p.basePos.clone().sub(C);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      p.explodeDir = dir.normalize();
      p.group.position.copy(p.basePos);
      parts.push(p); container.add(p.group);
    };
    // --- cerebrum: two translucent hemispheres (pick-through) ---
    {
      const p = makePart('cerebrum', 'brain', [0, 0.7, 0]);
      p.explodeDist = 0; // stays: it is the frame the others sit in
      p.pickThrough = true;
      [-0.72, 0.72].forEach(x => {
        const hemi = new THREE.Mesh(new THREE.SphereGeometry(1.5, 40, 28), ghost(0xaf7ac5, 0.22));
        hemi.scale.set(1, 0.9, 1.08);
        hemi.renderOrder = 10;
        addMesh(p, hemi, x, 0, 0);
      });
      // gyri hint: two curved ridges per hemisphere (decorative)
      [-0.72, 0.72].forEach(x => {
        for (let i = 0; i < 2; i++) {
          const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.85 - i * 0.25, 0.05, 8, 28, Math.PI * 1.2), mat(0x8e44ad));
          ridge.position.set(x, 0.5 + i * 0.35, 0.9);
          ridge.rotation.set(0.4, 0, 0.5 + i);
          ridge.userData.noPick = true;
          p.group.add(ridge);
        }
      });
      bpush(p);
    }
    // --- cerebellum: folded, behind and below ---
    {
      const p = makePart('cerebellum', 'brain', [0.5, -1.35, -1.55]);
      const body = ball(0.85, 0x8e44ad);
      body.scale.set(1.15, 0.7, 0.9);
      p.group.add(body);
      for (let i = 0; i < 3; i++) {
        const fold = new THREE.Mesh(new THREE.TorusGeometry(0.55 - Math.abs(i - 1) * 0.08, 0.09, 10, 28), mat(0x7d3c98));
        fold.rotation.x = Math.PI / 2;
        fold.position.y = -0.15 + i * 0.2;
        p.group.add(fold);
      }
      bpush(p);
    }
    // --- brainstem: descending stalk ---
    {
      const p = makePart('brainstem', 'brain', [0.35, -1.5, -0.62]);
      p.group.add(limb([0, 0.82, 0.12], [0, -0.82, -0.12], 0.3, 0.26, 0xc39bd3));
      const medulla = ball(0.32, 0xbb8fce, 20, 14);
      medulla.scale.set(1, 1.25, 1);
      addMesh(p, medulla, 0, -0.75, -0.1);
      bpush(p);
    }
    // --- corpus callosum: arch band inside ---
    {
      const p = makePart('corpuscallosum', 'brain', [0, 0.55, 0]);
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.17, 12, 32, Math.PI), mat(0xf5b041));
      arch.rotation.y = Math.PI / 2; // arch spans z, visible from the side
      p.group.add(arch);
      bpush(p);
    }
    // --- thalamus: small sphere inside ---
    {
      const p = makePart('thalamus', 'brain', [0, -0.25, 0.25]);
      addMesh(p, ball(0.34, 0x5dade2));
      bpush(p);
    }
    // --- hypothalamus: smaller sphere below thalamus ---
    {
      const p = makePart('hypothalamus', 'brain', [0, -0.7, 0.3]);
      addMesh(p, ball(0.22, 0x2e86c1));
      bpush(p);
    }
  }

  /* --------------------------------------- view 3: action potential lab */
  function channelBarrel(color, poreColor) {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.7, 18), mat(color));
    g.add(outer);
    const pore = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.82, 14), mat(poreColor));
    g.add(pore);
    const rimT = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 10, 20), mat(color));
    rimT.rotation.x = Math.PI / 2; rimT.position.y = 0.85; g.add(rimT);
    const rimB = rimT.clone(); rimB.position.y = -0.85; g.add(rimB);
    return g;
  }

  function buildApView() {
    apView = { ionGroup: new THREE.Group(), depolPlaque: null, repolPlaque: null };
    container.add(apView.ionGroup);

    // --- membrane slab + bilayer hint (decorative, not clickable) ---
    const mem = new THREE.Mesh(new THREE.BoxGeometry(9, 0.55, 3.4), mat(0x8e7cc3, { roughness: 0.6 }));
    container.add(noPick(mem));
    [-0.18, 0.18].forEach(y => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(9, 0.1, 3.42), mat(0x6a5aa8));
      strip.position.set(0, y, 0);
      container.add(noPick(strip));
    });
    // --- fluid regions ---
    const extra = new THREE.Mesh(new THREE.BoxGeometry(9, 1.9, 3.4), ghost(0x5dade2, 0.10));
    extra.position.set(0, 1.5, 0); extra.renderOrder = 1;
    container.add(noPick(extra));
    const cyto = new THREE.Mesh(new THREE.BoxGeometry(9, 1.9, 3.4), ghost(0x2e86c1, 0.10));
    cyto.position.set(0, -1.5, 0); cyto.renderOrder = 1;
    container.add(noPick(cyto));
    const l1 = makePlaque('extracellular fluid \u00B7 high Na\u207a', '#5dade2', 34);
    l1.position.set(-2.9, 2.8, 0);
    container.add(noPick(l1));
    const l2 = makePlaque('cytosol \u00B7 high K\u207a', '#2e86c1', 34);
    l2.position.set(2.9, -2.8, 0);
    container.add(noPick(l2));

    // --- voltage-gated Na+ channels (one part, three barrels) ---
    {
      const p = makePart('nachannel', 'apchan', [0, 0, 0]);
      NA_XS.forEach(x => {
        const b = channelBarrel(0xe67e22, 0x7e5109);
        b.position.set(x, 0, 0);
        p.group.add(b);
      });
      push(p);
    }
    // --- voltage-gated K+ channels (one part, three barrels) ---
    {
      const p = makePart('kchannel', 'apchan', [0, 0, 0]);
      K_XS.forEach(x => {
        const b = channelBarrel(0x2ecc71, 0x1e8449);
        b.position.set(x, 0, 0);
        p.group.add(b);
      });
      push(p);
    }
    // --- Na+/K+ pump ---
    {
      const p = makePart('napump', 'appump', [0, 0, 0]);
      const body = ball(0.55, 0x9b59b6);
      body.scale.set(1, 1.6, 1);
      p.group.add(body);
      const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.44, 0.5, 16), mat(0x7d3c98));
      capT.position.y = 0.85; p.group.add(capT);
      const capB = capT.clone(); capB.position.y = -0.85; p.group.add(capB);
      // ATP burst hint: small golden octahedron riding the pump
      const atp = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), mat(0xf2c14e, { emissive: 0x7a5c14 }));
      atp.position.set(0.62, 0.35, 0.3);
      p.group.add(atp);
      push(p);
    }
    // --- phase plaques: clickable, glow during their phase ---
    {
      const p = makePart('depol', 'apphase', [-4.7, 1.0, 0], 1.2);
      const pl = makePlaque('Depolarization \u00B7 Na\u207a in', '#e67e22', 40);
      p.group.add(pl);
      apView.depolPlaque = pl;
      push(p);
    }
    {
      const p = makePart('repol', 'apphase', [4.7, 1.0, 0], 1.2);
      const pl = makePlaque('Repolarization \u00B7 K\u207a out', '#2ecc71', 40);
      p.group.add(pl);
      apView.repolPlaque = pl;
      push(p);
    }
  }

  function setView(id) {
    clearContainer();
    clearApIons();
    apView = null;
    view = VIEWS.some(v => v.id === id) ? id : 'cell';
    if (view === 'brain') buildBrainView();
    else if (view === 'ap') { buildApView(); ap.playing = true; }
    else buildNeuronView();
    setApOverlayVisible(view === 'ap');
    if (apEls.play) apEls.play.textContent = ap.playing ? '\u23F8 Pause' : '\u25B6 Play';
    return view;
  }
  function getViewId() { return view; }
  function getContextId() { return view; }

  setView('cell');

  return {
    id: 'neuron',
    label: 'Neuron Lab',
    group,
    getParts: () => parts,
    get parts() { return parts; },
    systems: SYSTEMS,
    viewList: VIEWS,
    setView,
    getViewId,
    getContextId,
    get camera() { return CAMERAS[view]; },
    explodeScale: 1.0,
    /* per-frame hook for the action-potential animation (main.js calls it
     * when present, mirroring the optional applyExplode hook) */
    update(dt) { apUpdate(dt); },
    /* teardown for the AP HUD overlay when the atlas is unloaded */
    dispose() {
      if (apOverlay && apOverlay.parentNode) apOverlay.parentNode.removeChild(apOverlay);
      apOverlay = null; apCanvas = null; apCtx2d = null;
      for (const k of Object.keys(apEls)) delete apEls[k];
    },
    /* introspection for headless tests / QA */
    apDebug: {
      ionCount: () => ap.ions.length,
      time: () => ap.t,
      phase: () => apPhaseAt(ap.t).id,
      overlayVisible: () => !!(apOverlay && apOverlay.style.display === 'block')
    }
  };
}
