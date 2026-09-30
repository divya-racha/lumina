/* Lumina — Animal Cell atlas.
 * Procedural 3D animal cell: translucent membrane, clickable organelles,
 * explode slider pushes organelles outward from the nucleus.
 * Descriptions grounded in OpenStax Biology 2e, Chapter 4 (Cell Structure).
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  membrane: {
    name: 'Cell Membrane (Plasma Membrane)',
    tag: 'Boundary',
    desc: [
      'The plasma membrane is a phospholipid bilayer with proteins and cholesterol embedded in it. It separates the cell\u2019s internal content from its surrounding environment.',
      'It is selectively permeable: it controls the passage of organic molecules, ions, water, oxygen, and wastes into and out of the cell.'
    ],
    exam: 'Phospholipid heads are hydrophilic (face the water), tails are hydrophobic (hide inside) \u2014 that is why membranes self-assemble into bilayers.'
  },
  nucleus: {
    name: 'Nucleus',
    tag: 'Genetic control',
    desc: [
      'Typically the most prominent organelle in the cell. The nucleus houses the cell\u2019s DNA as chromatin and directs ribosome and protein synthesis.',
      'Its boundary, the nuclear envelope, is a double membrane that is continuous with the endoplasmic reticulum. Nuclear pores allow substances to enter and exit the nucleus.'
    ],
    exam: 'Human body cells carry 46 chromosomes in the nucleus; chromatin = DNA plus protein.'
  },
  nucleolus: {
    name: 'Nucleolus',
    tag: 'Genetic control',
    desc: [
      'A darkly staining region inside the nucleus. Some chromosomes carry DNA that encodes ribosomal RNA, and the nucleolus aggregates that rRNA with proteins.',
      'It assembles the large and small ribosomal subunits, which are then transported out through the nuclear pores into the cytoplasm.'
    ],
    exam: 'Nucleolus builds ribosome subunits \u2014 no nucleolus, no new ribosomes.'
  },
  ribosomes: {
    name: 'Ribosomes',
    tag: 'Genetic control',
    desc: [
      'Ribosomes are the cellular structures responsible for protein synthesis. Each is built from a large and a small subunit made of protein and ribosomal RNA.',
      'Free ribosomes float in the cytoplasm and make proteins used inside the cell; bound ribosomes attach to the endoplasmic reticulum or nuclear envelope and make proteins destined for membranes or secretion.'
    ],
    exam: 'Free \u2192 proteins for inside the cell. Bound (on the RER) \u2192 proteins for membranes or export.'
  },
  rer: {
    name: 'Rough Endoplasmic Reticulum (RER)',
    tag: 'Endomembrane system',
    desc: [
      'The endoplasmic reticulum is a series of interconnected membranous sacs and tubules. The rough ER looks \u201crough\u201d because ribosomes stud its cytoplasmic surface.',
      'Ribosomes feed newly made proteins into the RER\u2019s lumen, where they are folded and modified. Its membrane is continuous with the nuclear envelope.'
    ],
    exam: 'Secretory pathway order: ribosome \u2192 RER \u2192 Golgi \u2192 vesicle \u2192 plasma membrane or outside.'
  },
  ser: {
    name: 'Smooth Endoplasmic Reticulum (SER)',
    tag: 'Endomembrane system',
    desc: [
      'The smooth ER has few or no ribosomes on its surface. It synthesizes carbohydrates, lipids, and steroid hormones, and it detoxifies medications and poisons.',
      'It also stores calcium ions. In muscle cells a specialized SER, the sarcoplasmic reticulum, releases calcium to trigger coordinated contraction.'
    ],
    exam: 'Liver and hormone-making cells are packed with SER \u2014 think detox plus lipid/steroid synthesis.'
  },
  golgi: {
    name: 'Golgi Apparatus',
    tag: 'Endomembrane system',
    desc: [
      'A stack of flattened membranous sacs (cisternae). Transport vesicles from the ER fuse with its cis face; finished products bud off the trans face in secretory vesicles.',
      'As proteins and lipids pass through, the Golgi modifies them (often adding sugar chains), sorts them, and tags them for their destinations. Secretory cells such as salivary gland cells have an especially large Golgi.'
    ],
    exam: 'Cis face = receiving (ER side), trans face = shipping. Big Golgi = lots of secretion.'
  },
  mitochondrion: {
    name: 'Mitochondrion',
    tag: 'Energy',
    desc: [
      'Often called the powerhouse of the cell. Mitochondria carry out cellular respiration, making ATP \u2014 the cell\u2019s main energy-carrying molecule \u2014 using oxygen and producing carbon dioxide.',
      'Each has an outer and an inner membrane; the inner membrane folds into cristae that increase surface area for ATP synthesis. Mitochondria have their own DNA and ribosomes, evidence they evolved from free-living bacteria (endosymbiosis).'
    ],
    exam: 'Cristae = more surface area for ATP synthesis. Their own DNA supports the endosymbiosis theory.'
  },
  lysosome: {
    name: 'Lysosome',
    tag: 'Endomembrane system',
    desc: [
      'The lysosome is the cell\u2019s \u201cgarbage disposal\u201d and recycling facility. Its hydrolytic enzymes break down proteins, polysaccharides, lipids, nucleic acids, and worn-out organelles.',
      'These enzymes work at a much lower (acidic) pH than the cytoplasm, so compartmentalizing them keeps the rest of the cell safe. Lysosomes also destroy pathogens engulfed by immune cells.'
    ],
    exam: 'Tay-Sachs disease = faulty lysosomes \u2192 lipid buildup that destroys neurons.'
  },
  vacuole: {
    name: 'Vacuole',
    tag: 'Endomembrane system',
    desc: [
      'Vesicles and vacuoles are membrane-bound sacs used for storage and transport; vacuoles are simply the larger version. Vesicle membranes can fuse with the plasma membrane or other membranes to deliver cargo.',
      'In plant cells the central vacuole is huge: it stores water, helps break down macromolecules, and provides turgor pressure that keeps the plant firm.'
    ],
    exam: 'Vesicle vs vacuole is mostly a size distinction \u2014 same storage-and-transport idea.'
  },
  centrioles: {
    name: 'Centrioles (Centrosome)',
    tag: 'Support & division',
    desc: [
      'The centrosome consists of two centrioles lying at right angles to each other. Each centriole is a cylinder made of nine triplets of microtubules held together by proteins.',
      'In animal cells the centrosome is the microtubule-organizing center, and the centrioles help pull duplicated chromosomes to opposite ends of a dividing cell.'
    ],
    exam: 'Two centrioles at right angles, each built from 9 triplets of microtubules.'
  },
  cytoskeleton: {
    name: 'Cytoskeleton',
    tag: 'Support & division',
    desc: [
      'A network of protein fibers that maintains the cell\u2019s shape, anchors organelles in place, and lets vesicles move within the cell. It has three fiber types.',
      'From narrowest to widest: microfilaments (actin \u2014 resist tension, enable movement), intermediate filaments (e.g. keratin \u2014 bear tension, purely structural), and microtubules (hollow tubulin tubes \u2014 vesicle tracks that also pull chromosomes apart in mitosis).'
    ],
    exam: 'Narrowest \u2192 widest: microfilaments < intermediate filaments < microtubules.'
  },
  cytoplasm: {
    name: 'Cytoplasm / Cytosol',
    tag: 'Support & division',
    desc: [
      'The cytoplasm is everything between the plasma membrane and the nuclear envelope: organelles suspended in a gel-like fluid called the cytosol, plus the cytoskeleton.',
      'Although it is 70\u201380 percent water, dissolved proteins give it a semi-solid consistency. Many metabolic reactions, including protein synthesis, take place here.'
    ],
    exam: 'Cytosol = the fluid; cytoplasm = cytosol plus organelles.'
  },
  /* ------------------------- mitosis view parts (OpenStax Ch. 10) ------ */
  'mito-chromosomes': {
    name: 'Chromosomes (Sister Chromatids)',
    tag: 'Mitosis',
    desc: [
      'Each duplicated chromosome consists of two identical sister chromatids joined at the centromere, giving the familiar X shape.',
      'A human body cell entering mitosis carries 46 duplicated chromosomes (92 chromatids). This animation shows 4 for clarity.'
    ],
    exam: 'Metaphase = chromosomes line up at the metaphase plate. Anaphase = sister chromatids separate to opposite poles.'
  },
  'mito-spindle': {
    name: 'Spindle Fibers',
    tag: 'Mitosis',
    desc: [
      'The mitotic spindle is built from microtubules that grow out of the two centrosomes at opposite poles of the cell.',
      'Kinetochore fibers attach to each chromatid and pull; other spindle fibers push the poles apart, elongating the cell.'
    ],
    exam: 'Spindle = microtubules. Motor proteins walk the chromatids toward the poles along them.'
  },
  'mito-centrioles': {
    name: 'Centrioles (Centrosome)',
    tag: 'Mitosis',
    desc: [
      'The centrosome — a pair of centrioles — is the microtubule-organizing center of animal cells. In prophase the two centrosomes migrate to opposite poles.',
      'From each pole they nucleate the spindle fibers that separate the chromosomes. Plant cells build spindles with no centrioles at all.'
    ],
    exam: 'Animal cells: centrioles organize the spindle. Plant cells: no centrioles, spindle still forms.'
  },
  'mito-envelope': {
    name: 'Nuclear Envelope',
    tag: 'Mitosis',
    desc: [
      'The nuclear envelope breaks down during prometaphase so that spindle fibers can reach the chromosomes.',
      'In telophase it reforms around each separated set of chromosomes, creating two new nuclei.'
    ],
    exam: 'Envelope breaks down AFTER prophase (prometaphase) and reforms in telophase — a classic ordering question.'
  },
  'mito-furrow': {
    name: 'Cleavage Furrow',
    tag: 'Mitosis',
    desc: [
      'In animal cells, cytokinesis pinches the cell in two: a contractile ring of actin filaments tightens like a drawstring, forming the cleavage furrow.',
      'Plant cells cannot pinch through a rigid wall — instead they build a cell plate across the middle that becomes the new cell wall.'
    ],
    exam: 'Animal = cleavage furrow (actin ring). Plant = cell plate. Know which goes with which.'
  }
};

const SYSTEMS = [
  { id: 'Boundary', label: 'Cell boundary', color: '#5dade2' },
  { id: 'Genetic control', label: 'Genetic control', color: '#af7ac5' },
  { id: 'Endomembrane system', label: 'Endomembrane system', color: '#58d68d' },
  { id: 'Energy', label: 'Energy', color: '#f5b041' },
  { id: 'Support & division', label: 'Support & division', color: '#ec7063' }
];

/* --------------------------------------------------------------- helpers */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.55, metalness: 0.05 }, opts));
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
function place(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

/** Register a clickable part. All meshes go in one group at basePos. */
function makePart(id, system, basePos, explodeDir, explodeDist = 1.7) {
  return {
    id, system,
    info: INFO[id],
    group: new THREE.Group(),
    basePos: new THREE.Vector3(...basePos),
    explodeDir: new THREE.Vector3(...explodeDir).normalize(),
    explodeDist
  };
}
function addMesh(part, mesh, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  part.group.add(mesh);
  return mesh;
}

/* ----------------------------------------------------------------- build */
/* Mitosis stage timeline (OpenStax Biology 2e, Ch. 10 — Cell Reproduction).
 * Exported pure so tests can verify stage order and copy. */
export const MITOSIS_STAGES = [
  { id: 'interphase',   label: 'Interphase',
    blurb: 'The cell grows and copies its DNA. Chromosomes are loose chromatin — not yet visible as X shapes.' },
  { id: 'prophase',     label: 'Prophase',
    blurb: 'Chromatin condenses into X-shaped chromosomes. Centrosomes migrate to opposite poles; the spindle begins to form.' },
  { id: 'metaphase',    label: 'Metaphase',
    blurb: 'Chromosomes align along the metaphase plate at the cell\u2019s equator, attached to spindle fibers.' },
  { id: 'anaphase',     label: 'Anaphase',
    blurb: 'Sister chromatids separate and are pulled to opposite poles — the shortest, most dramatic stage.' },
  { id: 'telophase',    label: 'Telophase',
    blurb: 'Chromosomes arrive at the poles and decondense. A nuclear envelope reforms around each set.' },
  { id: 'cytokinesis',  label: 'Cytokinesis',
    blurb: 'The cytoplasm divides: a cleavage furrow pinches one cell into two daughter cells.' }
];

const CELL_VIEWS = [
  { id: 'cell',    label: '\uD83D\uDD2C Cell' },
  { id: 'mitosis', label: '\uD83E\uDDEC Mitosis' }
];
const CELL_CAMERAS = {
  cell:    { pos: [5.4, 3.4, 6.4], target: [0, 0.2, 0] },
  mitosis: { pos: [0, 2.4, 10.4],  target: [0, 0, 0] }
};

export function buildCell() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  const parts = [];
  const R = 3; // cell radius
  let view = 'cell';

  /* ------------------- mitosis view: animation + HUD state ------------- */
  const mito = { stage: 0, playing: true, t: 0 };
  const mitoEls = {};
  let mitoOverlay = null;

  function clearContainer() {
    container.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    container.clear();
    /* keep the SAME array identity: main.js holds this reference between
     * refreshParts() calls */
    parts.length = 0;
  }
  function push(p) {
    p.group.position.copy(p.basePos);
    parts.push(p); container.add(p.group);
  }
  /* tag every part mesh so main.js's raycast picker opens its info card.
   * Called after EVERY rebuild: stage changes create brand-new meshes that
   * main.js's refreshParts() (view-switch time only) never sees. */
  function tagParts() {
    parts.forEach(p => { p.group.traverse(m => { if (m.isMesh) m.userData.part = p; }); });
  }

  /* ------------------------------ view 1: the cell --------------------- */
  function buildCellView() {

  const radial = (x, y, z, d = 1.7) =>
    makePart(null, null, [x, y, z],
      [x, y * 0.9, z], d);

  // --- cell membrane: big translucent sphere (stays, scales slightly) ---
  {
    const p = makePart('membrane', 'Boundary', [0, 0, 0], [0, 1, 0], 0);
    const m = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), ghost(0x5dade2, 0.13));
    m.renderOrder = 10;
    p.group.add(m);
    // faint inner glow shell for depth
    const inner = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 32, 24), ghost(0x2e86c1, 0.05));
    inner.renderOrder = 9;
    p.group.add(inner);
    p.info = INFO.membrane;
    p.pickThrough = true; // let clicks pass to organelles inside; membrane picked at rim
    push(p);
  }

  // --- cytoplasm: soft inner volume hint ---
  {
    const p = radial(0, 0, 0); p.id = 'cytoplasm'; p.system = 'Support & division'; p.info = INFO.cytoplasm;
    p.pickThrough = true; // same: inner organelles take priority on click
    const m = new THREE.Mesh(new THREE.SphereGeometry(R * 0.96, 32, 24), ghost(0x1a5276, 0.10));
    m.renderOrder = 1;
    p.group.add(m);
    push(p);
  }

  // --- nucleus + envelope ---
  {
    const p = radial(-0.4, 0.3, 0.2); p.id = 'nucleus'; p.system = 'Genetic control'; p.info = INFO.nucleus;
    addMesh(p, ball(1.05, 0x7d3c98), 0, 0, 0);
    const env = new THREE.Mesh(new THREE.SphereGeometry(1.18, 32, 24), ghost(0xaf7ac5, 0.35));
    p.group.add(env);
    // chromatin threads: a few thin tori inside
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.55 - i * 0.12, 0.035, 8, 32), mat(0x4a235a));
      t.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      p.group.add(t);
    }
    push(p);
  }

  // --- nucleolus ---
  {
    const p = radial(-0.55, 0.75, 0.45); p.id = 'nucleolus'; p.system = 'Genetic control'; p.info = INFO.nucleolus;
    addMesh(p, ball(0.34, 0x2c1a33), 0, 0, 0);
    push(p);
  }

  // --- mitochondria x3 ---
  {
    const spots = [[1.7, -0.6, 0.9], [1.9, 0.7, -0.9], [-1.9, -1.1, -0.6]];
    const p = makePart('mitochondrion', 'Energy', [0, 0, 0], [0, 0, 0]);
    p.info = INFO.mitochondrion;
    spots.forEach(([x, y, z], si) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      const outer = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 8, 20), mat(0xe67e22));
      outer.rotation.z = Math.PI / 2 + si * 0.5;
      holder.add(outer);
      // cristae hint: inner wavy tube
      const inner = new THREE.Mesh(new THREE.TorusKnotGeometry(0.16, 0.045, 48, 8), mat(0xa04000));
      inner.scale.set(1.6, 0.8, 0.8);
      holder.add(inner);
      holder.userData.base = new THREE.Vector3(x, y, z);
      holder.userData.dir = new THREE.Vector3(x, y * 0.9, z).normalize();
      p.group.add(holder);
      p['sub' + si] = holder;
    });
    // custom explode: each mitochondrion flies its own way
    p.explode = (t) => {
      p.group.children.forEach(h => {
        h.position.copy(h.userData.base).addScaledVector(h.userData.dir, t * 1.7);
      });
    };
    push(p);
  }

  // --- rough ER: stacked curved sheets with ribosome dots ---
  {
    const p = radial(0.4, -1.5, 1.3); p.id = 'rer'; p.system = 'Endomembrane system'; p.info = INFO.rer;
    for (let i = 0; i < 4; i++) {
      const sheet = new THREE.Mesh(
        new THREE.TorusGeometry(1.05 - i * 0.16, 0.13, 12, 40, Math.PI * 1.25),
        mat(0x27ae60));
      sheet.rotation.set(Math.PI / 2, 0, 0.4 + i * 0.12);
      sheet.scale.set(1, 1, 0.45);
      sheet.position.y = i * 0.30 - 0.45;
      p.group.add(sheet);
      // ribosome dots on the sheet
      for (let d = 0; d < 6; d++) {
        const a = 0.5 + d * 0.32 + i * 0.1;
        const dot = ball(0.055, 0x1e8449, 10, 8);
        const rr = 1.05 - i * 0.16;
        dot.position.set(Math.cos(a) * rr, i * 0.30 - 0.45 + 0.13, Math.sin(a) * rr * 0.45);
        p.group.add(dot);
      }
    }
    push(p);
  }

  // --- smooth ER: tubular loops ---
  {
    const p = radial(1.5, -1.3, -1.4); p.id = 'ser'; p.system = 'Endomembrane system'; p.info = INFO.ser;
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 28), mat(0x52be80));
      loop.position.set((i - 1.5) * 0.42, (i % 2) * 0.3 - 0.15, ((i * 7) % 3 - 1) * 0.3);
      loop.rotation.set(i * 0.7, i * 1.1, 0);
      p.group.add(loop);
    }
    push(p);
  }

  // --- Golgi: stacked curved discs ---
  {
    const p = radial(-1.7, 1.15, -1.15); p.id = 'golgi'; p.system = 'Endomembrane system'; p.info = INFO.golgi;
    for (let i = 0; i < 5; i++) {
      const r = 0.75 - i * 0.07;
      const disc = new THREE.Mesh(
        new THREE.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, 0.85),
        mat(0xf39c12, { side: THREE.DoubleSide }));
      disc.scale.y = 0.42;
      disc.position.y = i * 0.26 - 0.5;
      disc.rotation.x = Math.PI; // cup upward
      p.group.add(disc);
    }
    // budding vesicle
    addMesh(p, ball(0.16, 0xf5b041), 0.85, 0.35, 0.2);
    push(p);
  }

  // --- ribosomes: scattered dots (one clickable part) ---
  {
    const p = makePart('ribosomes', 'Genetic control', [0, 0, 0], [0, 0, 0]);
    p.info = INFO.ribosomes;
    const spots = [
      [0.9, 1.5, 0.4], [-1.2, -0.4, 1.6], [0.2, 2.0, -1.2], [2.2, 0.2, 0.6],
      [-2.2, 0.6, 0.8], [0.6, -2.0, -0.6], [-0.8, 1.8, 1.4], [1.3, 1.2, -1.8],
      [-1.6, -1.8, 0.9], [2.4, -1.0, -0.4], [0.1, 0.9, 2.1], [-2.4, -0.2, -1.2]
    ];
    spots.forEach(([x, y, z]) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      const s = ball(0.11, 0x8e44ad, 12, 10);
      holder.add(s);
      holder.userData.base = new THREE.Vector3(x, y, z);
      holder.userData.dir = new THREE.Vector3(x, y * 0.9, z).normalize();
      p.group.add(holder);
    });
    p.explode = (t) => {
      p.group.children.forEach(h => {
        h.position.copy(h.userData.base).addScaledVector(h.userData.dir, t * 1.7);
      });
    };
    push(p);
  }

  // --- lysosomes x3 ---
  {
    const p = makePart('lysosome', 'Endomembrane system', [0, 0, 0], [0, 0, 0]);
    p.info = INFO.lysosome;
    [[-1.3, -1.9, 0.4], [2.0, 1.6, 1.2], [0.9, -0.2, -2.0]].forEach(([x, y, z]) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      holder.add(ball(0.24, 0xc0392b));
      const core = ball(0.12, 0x7b241c, 12, 10);
      holder.add(core);
      holder.userData.base = new THREE.Vector3(x, y, z);
      holder.userData.dir = new THREE.Vector3(x, y * 0.9, z).normalize();
      p.group.add(holder);
    });
    p.explode = (t) => {
      p.group.children.forEach(h => {
        h.position.copy(h.userData.base).addScaledVector(h.userData.dir, t * 1.7);
      });
    };
    push(p);
  }

  // --- vacuole ---
  {
    const p = radial(1.1, 1.7, 1.1); p.id = 'vacuole'; p.system = 'Endomembrane system'; p.info = INFO.vacuole;
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 18), ghost(0x85c1e9, 0.5));
    p.group.add(v);
    push(p);
  }

  // --- centrioles: two perpendicular cylinders ---
  {
    const p = radial(-2.0, 0.1, 1.5); p.id = 'centrioles'; p.system = 'Support & division'; p.info = INFO.centrioles;
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16), mat(0x5d6d7e));
    p.group.add(c1);
    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16), mat(0x5d6d7e));
    c2.rotation.z = Math.PI / 2; c2.position.set(0.3, 0.1, 0.15);
    p.group.add(c2);
    // banding hint
    for (let i = -1; i <= 1; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.02, 8, 20), mat(0x2e4053));
      band.rotation.x = Math.PI / 2; band.position.y = i * 0.18;
      c1.add(band);
    }
    push(p);
  }

  // --- cytoskeleton: thin struts ---
  {
    const p = makePart('cytoskeleton', 'Support & division', [0, 0, 0], [0, 0, 0]);
    p.info = INFO.cytoskeleton;
    const strutMat = mat(0x95a5a6);
    const lines = [
      [[-2.4, -0.5, 0.5], [2.4, 0.6, -0.4]],
      [[-1.8, 1.8, -1.2], [1.6, -1.9, 1.1]],
      [[0.3, -2.4, -0.8], [-0.4, 2.3, 0.9]],
      [[-2.2, 1.2, 1.4], [2.0, -1.4, -1.5]],
      [[1.8, 2.0, 0.6], [-1.9, -2.1, -0.7]]
    ];
    lines.forEach(([a, b]) => {
      const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
      const len = va.distanceTo(vb);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 8), strutMat);
      strut.position.copy(va).lerp(vb, 0.5);
      strut.lookAt(vb); strut.rotateX(Math.PI / 2);
      strut.userData.base = strut.position.clone();
      strut.userData.dir = strut.position.clone().normalize();
      p.group.add(strut);
    });
    p.explode = (t) => {
      p.group.children.forEach(s => {
        s.position.copy(s.userData.base).addScaledVector(s.userData.dir, t * 0.9);
      });
    };
    push(p);
  }
  } // end buildCellView

  /* --------------------------- view 2: mitosis ------------------------- */
  /** Clickable mitosis part. Explode pushes radially from the scene center. */
  function mitoPart(id, x, y, z, dist = 1.3) {
    const zero = (x === 0 && y === 0 && z === 0);
    return makePart(id, 'Support & division', [x, y, z],
      zero ? [0, 1, 0] : [x, y * 0.9, z], dist);
  }
  function noPick(o) { o.traverse(m => { m.userData.noPick = true; }); return o; }

  /** X-shaped duplicated chromosome (two sister chromatids + centromere). */
  function xChromo(color = 0x4a90d9) {
    const g = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 6, 12), mat(color));
    const c2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 6, 12), mat(color));
    c1.rotation.z = 0.5; c2.rotation.z = -0.5;
    g.add(c1, c2);
    g.add(ball(0.07, 0xf2c14e, 10, 8)); // centromere
    return g;
  }
  /** Single chromatid (after sister-chromatid separation). */
  function chromatid(color = 0x4a90d9) {
    return new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.45, 6, 12), mat(color));
  }
  /** Thin cylinder from a to b (a spindle fiber). */
  function fiber(a, b, r = 0.022) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const len = Math.max(va.distanceTo(vb), 0.01);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat(0x95a5a6));
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return m;
  }
  /** One centrosome: two centrioles at right angles. */
  function centrosome() {
    const g = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 12), mat(0x5d6d7e));
    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 12), mat(0x5d6d7e));
    c2.rotation.z = Math.PI / 2; c2.position.set(0.24, 0.08, 0.12);
    g.add(c1, c2);
    return g;
  }
  /** Loose chromatin threads (decorative, not clickable). */
  function chromatin(cx, cy, cz, r, n = 4) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(r * (0.55 + 0.12 * i), 0.03, 8, 28), mat(0x4a235a));
      t.position.set(cx, cy, cz);
      t.rotation.set(i * 1.1, i * 0.7, 0);
      g.add(t);
    }
    return noPick(g);
  }

  function buildMitosisView() {
    const s = mito.stage;
    const POLE = 2.2;

    // --- cell membrane: one sphere, or two daughters in cytokinesis ---
    if (s === 5) {
      [-1.6, 1.6].forEach(x => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(1.9, 40, 28), ghost(0x5dade2, 0.13));
        m.position.set(x, 0, 0); m.renderOrder = 10;
        container.add(noPick(m));
        container.add(chromatin(x, 0, 0, 0.7, 3));
      });
      const pf = mitoPart('mito-furrow', 0, 0, 0, 0.5);
      pf.group.add(new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 12, 44), mat(0xec7063)));
      push(pf);
      const pe = mitoPart('mito-envelope', 0, 0, 0, 0.5);
      [-1.6, 1.6].forEach(x => {
        const e = new THREE.Mesh(new THREE.SphereGeometry(1.05, 28, 20), ghost(0xaf7ac5, 0.3));
        e.position.set(x, 0, 0);
        pe.group.add(e);
      });
      push(pe);
      const pc = mitoPart('mito-centrioles', 0, 1.4, 0, 0.8);
      [[-1.6, 1.0, 0], [1.6, 1.0, 0]].forEach(pt => {
        const c = centrosome(); c.position.set(...pt); pc.group.add(c);
      });
      push(pc);
      updateMitoHud();
      return;
    }
    {
      const m = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), ghost(0x5dade2, 0.13));
      m.renderOrder = 10;
      container.add(noPick(m));
    }

    // --- centrioles / centrosomes: together, migrating, then at the poles ---
    const pc = mitoPart('mito-centrioles', 0, 1.6, 0, 0.9);
    const polePts = s === 0 ? [[0.9, 1.9, 0]]
      : s === 1 ? [[-1.2, 1.4, 0], [1.2, 1.4, 0]]
      : [[-POLE, 0, 0], [POLE, 0, 0]];
    polePts.forEach(pt => { const c = centrosome(); c.position.set(...pt); pc.group.add(c); });
    push(pc);

    // --- nuclear envelope: present, breaking down, gone, reformed ---
    if (s === 0 || s === 1 || s === 4) {
      const pe = mitoPart('mito-envelope', 0, 0, 0, 0.7);
      if (s === 4) {
        [-1.55, 1.55].forEach(x => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(1.0, 28, 20), ghost(0xaf7ac5, 0.32));
          e.position.set(x, 0, 0);
          pe.group.add(e);
        });
      } else {
        pe.group.add(new THREE.Mesh(
          new THREE.SphereGeometry(1.6, 32, 24), ghost(0xaf7ac5, s === 1 ? 0.14 : 0.32)));
      }
      push(pe);
    }

    // --- chromosomes through the stages ---
    const pch = mitoPart('mito-chromosomes', 0, 0, 0, 1.0);
    const plateZ = [-0.9, -0.3, 0.3, 0.9];
    if (s === 0) {
      container.add(chromatin(0, 0, 0, 0.9, 4));
    } else if (s === 1) {
      [[-0.7, 0.5, 0.4], [0.6, -0.4, -0.5], [0.1, 0.8, -0.2], [-0.2, -0.7, 0.6]]
        .forEach(pt => {
          const x = xChromo(); x.position.set(...pt); x.rotation.set(pt[0], pt[1], 0);
          pch.group.add(x);
        });
    } else if (s === 2) {
      plateZ.forEach((z, i) => {
        const x = xChromo(); x.position.set(0, 0.15 * (i - 1.5), z);
        pch.group.add(x);
      });
      const plate = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), ghost(0xf2c14e, 0.10));
      plate.rotation.y = Math.PI / 2;
      container.add(noPick(plate));
    } else if (s === 3) {
      plateZ.forEach((z, i) => {
        const y = 0.15 * (i - 1.5);
        [-0.95, 0.95].forEach(x => {
          const c = chromatid(); c.rotation.z = Math.PI / 2;
          c.position.set(x, y, z);
          pch.group.add(c);
        });
      });
    } else if (s === 4) {
      [-1.55, 1.55].forEach(x => {
        plateZ.forEach((z, i) => {
          const c = chromatid(0x7fb3e8);
          c.position.set(x + (i % 2 ? 0.25 : -0.25), 0.15 * (i - 1.5), z * 0.6);
          c.rotation.z = Math.PI / 2 + i * 0.2;
          pch.group.add(c);
        });
        container.add(chromatin(x, 0, 0, 0.7, 2));
      });
    }
    if (s >= 1 && s <= 4) push(pch);

    // --- spindle fibers grow from the poles toward the chromosomes ---
    if (s >= 1 && s <= 4) {
      const ps = mitoPart('mito-spindle', 0, 0, 0, 0.8);
      const targets = s === 2 ? plateZ.map((z, i) => [0, 0.15 * (i - 1.5), z])
        : s === 3 ? plateZ.flatMap((z, i) =>
          [[-0.95, 0.15 * (i - 1.5), z], [0.95, 0.15 * (i - 1.5), z]])
        : s === 4 ? [[-1.55, 0, 0], [1.55, 0, 0]]
        : [[-0.4, 0.2, 0], [0.4, -0.2, 0]];
      const poles = s === 1 ? [[-1.2, 1.4, 0], [1.2, 1.4, 0]]
        : [[-POLE, 0, 0], [POLE, 0, 0]];
      poles.forEach(pole => targets.forEach(t => ps.group.add(fiber(pole, t))));
      push(ps);
    }
    updateMitoHud();
  }

  /* ------------------------- mitosis HUD overlay ----------------------- */
  function mel(tag, id, parent, text, cls) {
    const e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function ensureMitoOverlay() {
    if (mitoOverlay) return;
    mitoOverlay = document.createElement('div');
    mitoOverlay.id = 'mitosis-panel';
    const head = mel('div', null, mitoOverlay, null, 'ap-head');
    mel('span', null, head, '\uD83E\uDDEC Mitosis');
    mitoEls.stage = mel('span', 'mito-stage', head, MITOSIS_STAGES[0].label);
    mitoEls.blurb = mel('div', 'mito-blurb', mitoOverlay, MITOSIS_STAGES[0].blurb);
    const ctrls = mel('div', null, mitoOverlay, null, 'ap-controls');
    mitoEls.prev = mel('button', 'mito-prev', ctrls, '\u23EE Prev');
    mitoEls.play = mel('button', 'mito-play', ctrls, '\u23F8 Pause');
    mitoEls.next = mel('button', 'mito-next', ctrls, '\u23ED Next');
    mitoEls.reset = mel('button', 'mito-reset', ctrls, '\u21BA Reset');
    const dots = mel('div', 'mito-dots', mitoOverlay);
    mitoEls.dots = MITOSIS_STAGES.map((st, i) => {
      const d = mel('button', null, dots, null, i === 0 ? 'on' : '');
      d.title = st.label;
      d.setAttribute('aria-label', st.label);
      d.addEventListener('click', () => setMitosisStage(i));
      return d;
    });
    const setPlayLabel = () => {
      mitoEls.play.textContent = mito.playing ? '\u23F8 Pause' : '\u25B6 Play';
    };
    mitoEls.play.addEventListener('click', () => { mito.playing = !mito.playing; setPlayLabel(); });
    mitoEls.prev.addEventListener('click', () => setMitosisStage(mito.stage - 1));
    mitoEls.next.addEventListener('click', () => setMitosisStage(mito.stage + 1));
    mitoEls.reset.addEventListener('click', () => {
      mito.playing = true; setPlayLabel(); setMitosisStage(0);
    });
    document.body.appendChild(mitoOverlay);
    setPlayLabel();
  }
  function updateMitoHud() {
    if (!mitoOverlay) return;
    const st = MITOSIS_STAGES[mito.stage];
    mitoEls.stage.textContent = st.label;
    mitoEls.blurb.textContent = st.blurb;
    mitoEls.dots.forEach((d, i) => { d.className = i === mito.stage ? 'on' : ''; });
  }
  function setMitoOverlayVisible(on) {
    ensureMitoOverlay();
    mitoOverlay.style.display = on ? 'block' : 'none';
    updateMitoHud();
  }

  function setMitosisStage(i) {
    mito.stage = ((i % MITOSIS_STAGES.length) + MITOSIS_STAGES.length) % MITOSIS_STAGES.length;
    mito.t = 0;
    clearContainer();
    buildMitosisView();
    tagParts();
    updateMitoHud();
  }
  function mitoUpdate(dt) {
    if (view !== 'mitosis') return;
    if (mito.playing) {
      mito.t += dt;
      if (mito.t > 4.0) setMitosisStage(mito.stage + 1);
    }
  }

  /* ------------------------------ view wiring -------------------------- */
  function setView(id) {
    clearContainer();
    view = CELL_VIEWS.some(v => v.id === id) ? id : 'cell';
    if (view === 'mitosis') { setMitosisStage(mito.stage); mito.playing = true; }
    else buildCellView();
    setMitoOverlayVisible(view === 'mitosis');
    if (mitoEls.play) mitoEls.play.textContent = mito.playing ? '\u23F8 Pause' : '\u25B6 Play';
    return view;
  }
  function getViewId() { return view; }
  function getContextId() { return view; }

  setView('cell');

  group.position.y = 0.2;
  return {
    id: 'cell',
    label: 'Animal Cell',
    group,
    getParts: () => parts,
    get parts() { return parts; },
    systems: SYSTEMS,
    viewList: CELL_VIEWS,
    setView,
    getViewId,
    getContextId,
    get camera() { return CELL_CAMERAS[view]; },
    explodeScale: 1.0,
    /* per-frame hook for the mitosis auto-play (main.js calls it when present) */
    update(dt) { mitoUpdate(dt); },
    /* teardown for the mitosis HUD overlay when the atlas is unloaded */
    dispose() {
      if (mitoOverlay && mitoOverlay.parentNode) mitoOverlay.parentNode.removeChild(mitoOverlay);
      mitoOverlay = null;
      for (const k of Object.keys(mitoEls)) delete mitoEls[k];
    },
    /* introspection for headless tests / QA */
    mitoDebug: {
      stage: () => mito.stage,
      stageId: () => MITOSIS_STAGES[mito.stage].id,
      overlayVisible: () => !!(mitoOverlay && mitoOverlay.style.display === 'block')
    }
  };
}
