/* Lumina — Neuron Lab atlas.
 * Two views sharing one container: a stylized neuron lying along the x-axis
 * (with an enlarged synapse close-up at the terminals) and a stylized brain
 * with clickable regions. Descriptions grounded in OpenStax Biology 2e,
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
  }
};

const SYSTEMS = [
  { id: 'neuron', label: 'Neuron', color: '#5dade2' },
  { id: 'synapse', label: 'Synapse', color: '#f5b041' },
  { id: 'brain', label: 'Brain regions', color: '#af7ac5' }
];

const VIEWS = [
  { id: 'cell', label: '\uD83D\uDD2C Neuron' },
  { id: 'brain', label: '\uD83E\uDDE0 Brain regions' }
];
const CAMERAS = {
  cell: { pos: [6.2, 3.0, 7.8], target: [0.4, 0, 0] },
  brain: { pos: [4.6, 3.2, 7.0], target: [0, -0.3, 0] }
};

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

/* ----------------------------------------------------------------- build */
export function buildNeuron() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  let parts = [];
  let view = 'cell';

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

  function setView(id) {
    clearContainer();
    view = VIEWS.some(v => v.id === id) ? id : 'cell';
    if (view === 'brain') buildBrainView(); else buildNeuronView();
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
    explodeScale: 1.0
  };
}
