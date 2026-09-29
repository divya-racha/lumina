/* ScienceAtlas — Human Anatomy atlas.
 * Stylized classroom-model figure: semi-transparent body shell with
 * toggleable systems (skeletal, muscular, cardiovascular, nervous,
 * digestive, respiratory, urinary). 25 clickable parts. Explode fans
 * parts radially outward from the body axis.
 * Descriptions grounded in OpenStax Biology 2e, Chapters 33-41.
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  skull: { name: 'Skull', tag: 'Skeletal system',
    desc: ['The skull is made of 22 bones: 8 cranial bones that form the cavity enclosing the brain, and 14 facial bones that shape the face and protect the entrances to the digestive and respiratory tracts.',
      'In adults the cranial bones are tightly fused and do not move. The tiny auditory ossicles of the middle ear (malleus, incus, stapes) are the smallest bones in the body and are unique to mammals.'],
    exam: 'Axial skeleton = skull + vertebral column + ribcage \u2014 it protects the brain, spinal cord, heart, and lungs.' },
  spine: { name: 'Vertebral Column (Spine)', tag: 'Skeletal system',
    desc: ['The adult vertebral column has 26 bones: 24 vertebrae plus the sacrum and coccyx. The vertebrae divide into 7 cervical (neck), 12 thoracic (chest), and 5 lumbar (lower back).',
      'It surrounds and protects the spinal cord, supports the head, and anchors the ribs. Its S-shaped curves act like a spring, absorbing shocks, and fibrous discs between vertebrae cushion each joint.'],
    exam: '7 cervical, 12 thoracic, 5 lumbar \u2014 "breakfast at 7, lunch at 12, dinner at 5".' },
  ribcage: { name: 'Ribcage', tag: 'Skeletal system',
    desc: ['Twelve pairs of ribs plus the sternum (breastbone) form the thoracic cage. Costal cartilages connect most ribs to the sternum; pairs 11 and 12 are free-floating ribs.',
      'The cage protects the heart and lungs, and its movement \u2014 lifting up and out \u2014 changes thoracic volume to drive breathing.'],
    exam: 'Ribs 11\u201312 are "floating ribs": no attachment to the sternum.' },
  femur: { name: 'Femur (Thigh Bone)', tag: 'Skeletal system',
    desc: ['The femur runs from hip to knee and is the longest and strongest bone in the human body, built to carry the body\u2019s weight during standing, walking, and running.',
      'Like other long bones, its shaft is compact bone around a marrow cavity, with spongy bone at the ends to absorb impact.'],
    exam: 'Femur = longest bone in the body. A guaranteed exam answer.' },
  humerus: { name: 'Humerus', tag: 'Skeletal system',
    desc: ['The humerus is the long bone of the upper arm, running from the shoulder to the elbow where it meets the radius and ulna of the forearm.',
      'Its rounded head fits into the shoulder socket, giving the arm its wide range of motion.'],
    exam: 'Humerus (arm) and femur (thigh) are the two classic long bones \u2014 know both.' },
  biceps: { name: 'Biceps Brachii', tag: 'Muscular system',
    desc: ['The biceps is the prominent skeletal muscle on the front of the upper arm. When it contracts, it flexes (bends) the elbow; its opponent, the triceps, extends it.',
      'Skeletal muscles attach to bone via tendons and can only pull, never push \u2014 so they always work in opposing pairs.'],
    exam: 'Muscles only pull. Biceps flexes the elbow, triceps extends it \u2014 the classic opposing pair.' },
  pectorals: { name: 'Pectoralis Muscles', tag: 'Muscular system',
    desc: ['The pectoralis major muscles span the chest, connecting the sternum and clavicle to the upper arm. They power movements like pushing and throwing.',
      'Like all skeletal muscle, they contract when actin and myosin filaments slide past each other inside each muscle fiber.'],
    exam: 'Every skeletal muscle contraction = actin and myosin sliding past each other (sliding-filament model).' },
  abdominals: { name: 'Abdominal Muscles', tag: 'Muscular system',
    desc: ['The rectus abdominis and its neighbors form the front wall of the abdomen. They flex the trunk, maintain posture, and \u2014 with the back muscles \u2014 stabilize the core.',
      'They also compress the abdomen, assisting breathing out, coughing, and childbirth.'],
    exam: '"Core" = abdominals + back muscles stabilizing the trunk. Posture questions love this group.' },
  quadriceps: { name: 'Quadriceps', tag: 'Muscular system',
    desc: ['The quadriceps is the big four-part muscle on the front of the thigh. It extends (straightens) the knee and powers standing up, walking, and kicking.',
      'Its opponent is the hamstring group on the back of the thigh, which flexes the knee. Muscle cells are packed with mitochondria for energy and a specialized SER that releases calcium to trigger contraction.'],
    exam: 'Quads extend the knee; hamstrings flex it \u2014 another opposing pair. Calcium release triggers every contraction.' },
  heart: { name: 'Heart', tag: 'Cardiovascular system',
    desc: ['The heart is a four-chambered muscular pump: two upper atria receive blood, two lower ventricles pump it out. Mammals and birds evolved this design independently \u2014 it completely separates oxygenated from deoxygenated blood.',
      'Blood makes two circuits: pulmonary (heart \u2192 lungs \u2192 heart) and systemic (heart \u2192 body \u2192 heart). The left ventricle has the thickest wall because it pumps against the highest pressure.'],
    exam: 'Right side \u2192 lungs, left side \u2192 body. The left ventricle wall is thickest.' },
  aorta: { name: 'Aorta', tag: 'Cardiovascular system',
    desc: ['The aorta is the largest artery in the body. It arches up out of the left ventricle and delivers oxygenated blood to the entire systemic circuit.',
      'Arteries carry blood away from the heart; their thick, elastic walls stretch with each heartbeat and recoil to keep blood flowing between beats.'],
    exam: 'Arteries = Away from the heart. The aorta is the largest artery.' },
  vena_cava: { name: 'Vena Cava', tag: 'Cardiovascular system',
    desc: ['The vena cava is the largest vein in the body. It returns deoxygenated blood from the body\u2019s tissues to the right atrium of the heart.',
      'Veins carry blood toward the heart under low pressure, so they have thinner walls than arteries and one-way valves that prevent backflow.'],
    exam: 'Veins = toward the heart. The vena cava is the largest vein.' },
  brain: { name: 'Brain', tag: 'Nervous system',
    desc: ['The brain and spinal cord form the central nervous system (CNS). The brain is built from neurons \u2014 the signaling cells \u2014 and glial cells that support, insulate, and protect them.',
      'Neurons communicate at synapses, converting electrical signals into chemical ones and back again, letting the brain integrate information and command the body.'],
    exam: 'CNS = brain + spinal cord. PNS = all nerves outside the CNS.' },
  spinal_cord: { name: 'Spinal Cord', tag: 'Nervous system',
    desc: ['The spinal cord is the information highway between the brain and the body, running inside the protective vertebral column.',
      'Spinal nerves exit between adjacent vertebrae at each level, carrying motor commands out and sensory information in. Some reflexes are processed here without involving the brain.'],
    exam: 'Spinal nerves exit between vertebrae \u2014 each pair serves the body at its own level.' },
  nerves: { name: 'Peripheral Nerves', tag: 'Nervous system',
    desc: ['Peripheral nerves are bundles of neuron axons (plus myelin insulation from glial cells) that connect the CNS to muscles, skin, and organs.',
      'The sciatic nerve, running from the lower back down each leg, is the longest and widest nerve in the body.'],
    exam: 'Neurons do the signaling; glial cells support them \u2014 including the myelin that speeds signals up.' },
  esophagus: { name: 'Esophagus', tag: 'Digestive system',
    desc: ['The esophagus is the muscular tube connecting the throat to the stomach. Wave-like muscular contractions called peristalsis push food downward \u2014 which is why you can swallow upside down.',
      'A sphincter at its base keeps stomach acid from flowing back up.'],
    exam: 'Peristalsis = wave-like contractions that move food through the whole digestive tract.' },
  stomach: { name: 'Stomach', tag: 'Digestive system',
    desc: ['The stomach churns food and mixes it with hydrochloric acid and the enzyme pepsin, beginning chemical digestion of proteins.',
      'Its lining secretes a thick mucus layer that protects the stomach wall from being digested by its own acid \u2014 ulcers form when that protection fails.'],
    exam: 'Pepsin + acid start protein digestion. Mucus is why the stomach doesn\u2019t digest itself.' },
  liver: { name: 'Liver', tag: 'Digestive system',
    desc: ['The liver is the largest internal organ. It produces bile, which emulsifies large fat droplets into smaller ones so enzymes can work on them, and it processes absorbed nutrients from the blood.',
      'It also detoxifies drugs and poisons, stores glycogen and vitamins, and makes blood proteins.'],
    exam: 'Bile (made by the liver, stored in the gallbladder) emulsifies fat \u2014 it does NOT chemically digest it.' },
  small_intestine: { name: 'Small Intestine', tag: 'Digestive system',
    desc: ['Despite the name, the small intestine is over 6 meters long and is where most chemical digestion and nearly all nutrient absorption happen.',
      'Its lining is folded into villi, and each absorbing cell is covered in microvilli \u2014 multiplying the surface area enormously for absorption into the blood.'],
    exam: 'Nearly all nutrient absorption happens here. Microvilli = surface area = absorption.' },
  large_intestine: { name: 'Large Intestine (Colon)', tag: 'Digestive system',
    desc: ['The large intestine frames the small intestine and handles what\u2019s left: it absorbs water and salts, compacting the remaining material.',
      'Trillions of gut bacteria live here \u2014 some make vitamins (like vitamin K) that we cannot synthesize ourselves.'],
    exam: 'The colon reclaims water \u2014 that\u2019s why diarrhea quickly causes dehydration.' },
  trachea: { name: 'Trachea (Windpipe)', tag: 'Respiratory system',
    desc: ['The trachea is a 10\u201312 cm tube that funnels inhaled air to the lungs. Incomplete C-shaped rings of cartilage hold it open, while smooth muscle can narrow it during a forceful cough.',
      'It is lined with mucus and cilia: the mucus traps dust and microbes, and the cilia sweep the loaded mucus upward toward the pharynx to be swallowed.'],
    exam: 'C-shaped cartilage rings keep it open; cilia sweep mucus-trapped particles up and out.' },
  lungs: { name: 'Lungs', tag: 'Respiratory system',
    desc: ['The lungs house the bronchial tree: each primary bronchus branches into smaller bronchi and bronchioles ending in alveoli. The right lung has three lobes; the left has two, leaving room for the heart.',
      'Breathing is driven by volume changes \u2014 the diaphragm and rib muscles expand the thorax, air flows in; they relax, air flows out.'],
    exam: 'Right lung = 3 lobes, left lung = 2 lobes. The asymmetry is a classic exam question.' },
  alveoli: { name: 'Alveoli', tag: 'Respiratory system',
    desc: ['Alveoli are tiny air sacs \u2014 about 300 million per lung \u2014 clustered like grapes at the ends of the bronchioles. This is the only place where gas exchange occurs.',
      'Each alveolus wall is one cell thick and wrapped in capillaries, giving roughly 75 square meters of surface area with a minimal diffusion distance: oxygen in, carbon dioxide out.'],
    exam: 'One-cell-thick walls + capillaries = minimal diffusion distance. Structure serves function.' },
  diaphragm: { name: 'Diaphragm', tag: 'Respiratory system',
    desc: ['The diaphragm is the dome-shaped sheet of muscle sealing the bottom of the thoracic cavity, just below the lungs.',
      'When it contracts and flattens, thoracic volume increases and air is drawn in (inhalation). When it relaxes, the volume shrinks and air is pushed out.'],
    exam: 'Inhalation = diaphragm contracts + ribs lift \u2192 volume up \u2192 pressure down \u2192 air flows in.' },
  kidneys: { name: 'Kidneys', tag: 'Urinary system',
    desc: ['The two kidneys filter the blood continuously, removing nitrogenous wastes and excess water and salts as urine while keeping what the body needs.',
      'The functional unit is the nephron: blood is filtered at the glomerulus, then useful substances (water, glucose, ions) are reabsorbed along the tubule. The kidneys also regulate blood pressure and pH.'],
    exam: 'Nephron = the kidney\u2019s functional unit: glomerulus filters, tubule reabsorbs.' }
};

const SYSTEMS = [
  { id: 'Skeletal system', label: 'Skeletal', color: '#e9e2d0' },
  { id: 'Muscular system', label: 'Muscular', color: '#d6543f' },
  { id: 'Cardiovascular system', label: 'Cardiovascular', color: '#ff5b6a' },
  { id: 'Nervous system', label: 'Nervous', color: '#f2c14e' },
  { id: 'Digestive system', label: 'Digestive', color: '#e8933c' },
  { id: 'Respiratory system', label: 'Respiratory', color: '#63b3ed' },
  { id: 'Urinary system', label: 'Urinary', color: '#a06cd5' }
];

/* --------------------------------------------------------------- helpers */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.5, metalness: 0.08 }, opts));
}
function ghost(color, opacity) {
  return new THREE.MeshPhongMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, shininess: 60, specular: 0x8899aa
  });
}
function capsule(r, len, color) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mat(color));
}
function ball(r, color, w = 24, h = 18) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat(color));
}
function tube(points, r, color) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 32, r, 12, false), mat(color));
}

/** A clickable part: one THREE.Group holding any number of meshes. */
function singlePart(id, pos, dir, dist = 1.1) {
  const p = {
    id, system: INFO[id].tag, info: INFO[id],
    group: new THREE.Group(),
    basePos: new THREE.Vector3(...pos),
    explodeDir: new THREE.Vector3(...dir).normalize(),
    explodeDist: dist
  };
  return p;
}
/** Paired parts (left/right) that explode in mirrored directions. */
function pairedPart(id, spots) {
  // spots: [{pos:[x,y,z], dir:[x,y,z], build(holder)}]
  const p = {
    id, system: INFO[id].tag, info: INFO[id],
    group: new THREE.Group(),
    basePos: new THREE.Vector3(0, 0, 0),
    explodeDir: new THREE.Vector3(0, 0, 0),
    explodeDist: 0
  };
  spots.forEach(s => {
    const holder = new THREE.Group();
    holder.position.set(...s.pos);
    s.build(holder);
    holder.userData.base = new THREE.Vector3(...s.pos);
    holder.userData.dir = new THREE.Vector3(...s.dir).normalize();
    holder.userData.dist = s.dist || 1.1;
    p.group.add(holder);
  });
  p.explode = (t) => {
    p.group.children.forEach(h => {
      h.position.copy(h.userData.base).addScaledVector(h.userData.dir, t * h.userData.dist);
    });
  };
  return p;
}
function add(parts, group, p, buildFn) {
  buildFn(p.group);
  p.group.position.copy(p.basePos);
  parts.push(p); group.add(p.group);
  return p;
}

/* ----------------------------------------------------------------- build */
export function buildAnatomy() {
  const group = new THREE.Group();
  const parts = [];
  const BONE = 0xe9e2d0, MUSC = 0xd6543f, CARD = 0xff5b6a,
        NERV = 0xf2c14e, DIG = 0xe8933c, RESP = 0x63b3ed, URIN = 0xa06cd5;

  /* ---- body shell: translucent mannequin for context (not clickable) ---- */
  {
    const shell = new THREE.Group();
    const sm = (geo, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const m = new THREE.Mesh(geo, ghost(0x9aa5b1, 0.10));
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.renderOrder = 20;
      m.userData.noPick = true; shell.add(m); return m;
    };
    sm(new THREE.CapsuleGeometry(0.30, 0.85, 8, 20), 0, 2.08, -0.06);            // torso
    sm(new THREE.SphereGeometry(0.30, 24, 18), 0, 3.15, 0);                        // head
    sm(new THREE.CapsuleGeometry(0.085, 0.62, 8, 16), -0.44, 2.12, 0);             // arms
    sm(new THREE.CapsuleGeometry(0.085, 0.62, 8, 16), 0.44, 2.12, 0);
    sm(new THREE.CapsuleGeometry(0.105, 1.15, 8, 16), -0.21, 0.75, 0);             // legs
    sm(new THREE.CapsuleGeometry(0.105, 1.15, 8, 16), 0.21, 0.75, 0);
    sm(new THREE.SphereGeometry(0.24, 20, 14), 0, 1.52, -0.04, 1.25, 0.75, 0.9);   // pelvis
    shell.userData.shell = true;
    group.add(shell);
    group.userData.shell = shell;
  }

  /* ------------------------------- SKELETAL ------------------------------- */
  add(parts, group, singlePart('skull', [0, 3.15, 0], [0.25, 0.75, 0.55], 1.0), g => {
    const s = ball(0.27, BONE, 28, 22); g.add(s);
    const jaw = ball(0.16, BONE, 20, 14); jaw.scale.set(1.05, 0.7, 0.9); jaw.position.set(0, -0.17, 0.08); g.add(jaw);
  });
  add(parts, group, singlePart('spine', [0, 2.08, -0.155], [0, 0.1, -1], 1.0), g => {
    for (let i = 0; i < 7; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.10, 14), mat(BONE));
      v.position.y = 0.52 - i * 0.155; g.add(v);
    }
    const sac = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.06, 0.22, 14), mat(BONE));
    sac.position.y = -0.68; g.add(sac);
  });
  add(parts, group, singlePart('ribcage', [0, 2.30, -0.02], [0, 0.12, 1], 0.55), g => {
    for (let i = 0; i < 4; i++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.30 - i * 0.018, 0.032, 10, 40), mat(BONE));
      rib.rotation.x = Math.PI / 2;
      rib.scale.set(1, 0.78, 1);
      rib.position.y = 0.10 - i * 0.135;
      g.add(rib);
    }
    const stern = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), mat(BONE));
    stern.position.set(0, -0.05, 0.235); g.add(stern);
  });
  add(parts, group, pairedPart('femur', [
    { pos: [-0.21, 0.88, 0], dir: [-0.75, -0.25, 0.35], dist: 1.0,
      build: h => { const f = capsule(0.068, 0.55, BONE); h.add(f);
        const kn = ball(0.085, BONE, 14, 12); kn.position.y = -0.33; h.add(kn); } },
    { pos: [0.21, 0.88, 0], dir: [0.75, -0.25, 0.35], dist: 1.0,
      build: h => { const f = capsule(0.068, 0.55, BONE); h.add(f);
        const kn = ball(0.085, BONE, 14, 12); kn.position.y = -0.33; h.add(kn); } }
  ]), () => {});
  add(parts, group, pairedPart('humerus', [
    { pos: [-0.44, 2.28, 0], dir: [-1, 0.1, 0.25], build: h => h.add(capsule(0.052, 0.42, BONE)) },
    { pos: [0.44, 2.28, 0], dir: [1, 0.1, 0.25], build: h => h.add(capsule(0.052, 0.42, BONE)) }
  ]), () => {});

  /* ------------------------------- MUSCULAR ------------------------------- */
  add(parts, group, pairedPart('biceps', [
    { pos: [-0.44, 2.42, 0.10], dir: [-1, 0.25, 0.45], build: h => { const b = capsule(0.075, 0.26, MUSC); b.rotation.x = 0.15; h.add(b); } },
    { pos: [0.44, 2.42, 0.10], dir: [1, 0.25, 0.45], build: h => { const b = capsule(0.075, 0.26, MUSC); b.rotation.x = 0.15; h.add(b); } }
  ]), () => {});
  add(parts, group, pairedPart('pectorals', [
    { pos: [-0.17, 2.44, 0.175], dir: [-0.5, 0.35, 1], dist: 0.8, build: h => { const m = ball(0.155, MUSC); m.scale.set(1, 0.72, 0.5); h.add(m); } },
    { pos: [0.17, 2.44, 0.175], dir: [0.5, 0.35, 1], dist: 0.8, build: h => { const m = ball(0.155, MUSC); m.scale.set(1, 0.72, 0.5); h.add(m); } }
  ]), () => {});
  add(parts, group, singlePart('abdominals', [0, 1.93, 0.155], [0, -0.15, 1], 0.7), g => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const m = ball(0.088, MUSC, 16, 12);
      m.scale.set(1, 1.15, 0.55);
      m.position.set(c === 0 ? -0.095 : 0.095, 0.13 - r * 0.135, 0);
      g.add(m);
    }
  });
  add(parts, group, pairedPart('quadriceps', [
    { pos: [-0.21, 1.02, 0.095], dir: [-0.7, 0, 0.6], build: h => h.add(capsule(0.088, 0.38, MUSC)) },
    { pos: [0.21, 1.02, 0.095], dir: [0.7, 0, 0.6], build: h => h.add(capsule(0.088, 0.38, MUSC)) }
  ]), () => {});

  /* ---------------------------- CARDIOVASCULAR ---------------------------- */
  add(parts, group, singlePart('heart', [-0.13, 2.30, 0.10], [-0.55, 0.1, 1], 0.85), g => {
    const h = ball(0.155, CARD, 24, 18); h.scale.set(1, 1.28, 0.92); g.add(h);
    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.16, 18), mat(CARD));
    apex.rotation.x = Math.PI; apex.position.set(-0.03, -0.20, 0); g.add(apex);
  });
  add(parts, group, singlePart('aorta', [-0.02, 2.52, 0.05], [0.15, 0.75, 0.6], 0.8), g => {
    g.add(tube([[-0.11, -0.12, 0.05], [-0.11, 0.10, 0.03], [0.0, 0.16, -0.02], [0.10, 0.02, -0.08]], 0.045, CARD));
  });
  add(parts, group, singlePart('vena_cava', [0.10, 2.18, 0.05], [0.6, 0.1, 0.75], 0.8), g => {
    const v = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.52, 12), mat(0x4a90d9));
    g.add(v);
  });

  /* -------------------------------- NERVOUS ------------------------------- */
  add(parts, group, singlePart('brain', [0, 3.19, 0.015], [0, 0.9, 0.35], 1.0), g => {
    const b = ball(0.195, 0xddb84a, 28, 22); b.scale.set(1, 0.88, 1.04); g.add(b);
    for (let i = 0; i < 3; i++) { // gyri hint
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.13 - i * 0.03, 0.028, 8, 24, Math.PI * 1.4), mat(0xc79a2e));
      t.position.set(-0.05 + i * 0.05, 0.10 - i * 0.02, 0.06);
      t.rotation.set(0.4, 0.3 * i, 0.8);
      g.add(t);
    }
  });
  add(parts, group, singlePart('spinal_cord', [0, 2.08, -0.10], [0, 0.05, -1], 0.9), g => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 1.15, 12), mat(NERV));
    g.add(s);
  });
  add(parts, group, pairedPart('nerves', [
    { pos: [-0.21, 0.80, 0.07], dir: [-0.8, -0.2, 0.4], build: h => h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 8), mat(NERV))) },
    { pos: [0.21, 0.80, 0.07], dir: [0.8, -0.2, 0.4], build: h => h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 8), mat(NERV))) },
    { pos: [-0.44, 2.05, 0.06], dir: [-1, 0, 0.4], build: h => h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), mat(NERV))) },
    { pos: [0.44, 2.05, 0.06], dir: [1, 0, 0.4], build: h => h.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), mat(NERV))) }
  ]), () => {});

  /* ------------------------------- DIGESTIVE ------------------------------ */
  add(parts, group, singlePart('esophagus', [0, 2.56, 0.085], [0, 0.5, 0.85], 0.7), g => {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.34, 12), mat(DIG)));
  });
  add(parts, group, singlePart('stomach', [-0.16, 2.02, 0.10], [-0.6, -0.1, 1], 0.85), g => {
    const s = ball(0.165, DIG, 24, 18); s.scale.set(1.18, 0.85, 0.72); g.add(s);
    g.add(tube([[0.10, 0.02, 0], [0.20, -0.06, -0.02], [0.22, -0.18, -0.04]], 0.045, DIG));
  });
  add(parts, group, singlePart('liver', [0.175, 2.13, 0.075], [0.65, 0.15, 0.9], 0.85), g => {
    const l = ball(0.20, 0xb5541e, 24, 18); l.scale.set(1.3, 0.68, 0.82); g.add(l);
  });
  add(parts, group, singlePart('small_intestine', [0, 1.68, 0.10], [0, -0.35, 1], 0.9), g => {
    const k = new THREE.Mesh(new THREE.TorusKnotGeometry(0.155, 0.052, 80, 12, 2, 3), mat(DIG));
    k.scale.set(1.15, 0.95, 0.85); g.add(k);
  });
  add(parts, group, singlePart('large_intestine', [0, 1.68, 0.085], [0, -0.3, 1], 1.15), g => {
    const f = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.058, 12, 40), mat(0xc97a2a));
    f.scale.set(1, 1.28, 0.72); g.add(f);
  });
  /* ------------------------------ RESPIRATORY ----------------------------- */
  add(parts, group, singlePart('trachea', [0, 2.66, 0.125], [0, 0.55, 1], 0.7), g => {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.30, 14), mat(RESP)));
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 20, Math.PI * 1.6), mat(0x2e86c1));
      ring.rotation.x = Math.PI / 2; ring.rotation.z = -0.4;
      ring.position.y = 0.10 - i * 0.07; g.add(ring);
    }
  });
  add(parts, group, pairedPart('lungs', [
    { pos: [-0.215, 2.28, 0.03], dir: [-1, 0.1, 0.25], dist: 0.9,
      build: h => { const l = ball(0.20, RESP, 24, 20); l.scale.set(0.82, 1.32, 0.72); h.add(l); } },
    { pos: [0.215, 2.28, 0.03], dir: [1, 0.1, 0.25], dist: 0.9,
      build: h => { const l = ball(0.20, RESP, 24, 20); l.scale.set(0.82, 1.32, 0.72); h.add(l); } }
  ]), () => {});
  add(parts, group, singlePart('alveoli', [0.215, 2.14, 0.075], [0.9, -0.25, 0.55], 1.0), g => {
    for (let i = 0; i < 12; i++) {
      const a = ball(0.034, 0xaed6f1, 10, 8);
      const th = (i / 12) * Math.PI * 2, ph = (i * 2.3) % Math.PI;
      a.position.set(Math.cos(th) * Math.sin(ph) * 0.10, Math.cos(ph) * 0.13, Math.sin(th) * Math.sin(ph) * 0.08);
      g.add(a);
    }
  });
  add(parts, group, singlePart('diaphragm', [0, 1.94, 0], [0, -0.7, 0.5], 0.7), g => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x7fb3d5, { side: THREE.DoubleSide }));
    d.scale.set(1, 0.55, 0.82); g.add(d);
  });
  /* -------------------------------- URINARY ------------------------------- */
  add(parts, group, pairedPart('kidneys', [
    { pos: [-0.235, 1.98, -0.085], dir: [-0.85, 0.1, -0.5], dist: 0.9,
      build: h => { const k = ball(0.105, URIN, 20, 16); k.scale.set(0.78, 1.25, 0.7); h.add(k); } },
    { pos: [0.235, 1.98, -0.085], dir: [0.85, 0.1, -0.5], dist: 0.9,
      build: h => { const k = ball(0.105, URIN, 20, 16); k.scale.set(0.78, 1.25, 0.7); h.add(k); } }
  ]), () => {});

  return {
    id: 'anatomy',
    label: 'Human Anatomy',
    group,
    parts,
    systems: SYSTEMS,
    shell: true,
    getContextId: () => 'main',
    camera: { pos: [3.6, 2.7, 4.6], target: [0, 1.85, 0] },
    explodeScale: 1.0
  };
}
