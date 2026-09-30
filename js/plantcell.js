/* Lumina — Plant Cell atlas.
 * Rectangular plant cell: cellulose wall, plasma membrane, a large central
 * vacuole, chloroplasts with thylakoid stacks, plus the shared organelles.
 * Explode pushes organelles outward from the center; wall and membrane stay.
 * Descriptions grounded in OpenStax Biology 2e, Chapter 4 (Cell Structure).
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  cellwall: {
    name: 'Cell Wall',
    tag: 'Boundary',
    desc: [
      'The cell wall is a rigid outer layer found in plant cells (and in fungi and many protists). In plants it is made mostly of cellulose, a tough carbohydrate fiber.',
      'It protects the cell, gives it its shape, and prevents it from bursting when water rushes in. Primary walls are flexible for growth; some cells later add a stiff secondary wall.'
    ],
    exam: 'Plant cell wall = CELLULOSE. It gives shape and protection \u2014 animal cells don\u2019t have one.'
  },
  membrane: {
    name: 'Cell Membrane (Plasma Membrane)',
    tag: 'Boundary',
    desc: [
      'Just inside the cell wall sits the plasma membrane: a phospholipid bilayer with embedded proteins and cholesterol.',
      'It is selectively permeable, controlling the passage of water, ions, and molecules \u2014 and in plant cells it works with the wall to manage turgor pressure.'
    ],
    exam: 'Phospholipid heads are hydrophilic (face water), tails hydrophobic (hide inside) \u2014 bilayers self-assemble.'
  },
  vacuole: {
    name: 'Central Vacuole',
    tag: 'Support',
    desc: [
      'The central vacuole is a huge membrane-bound sac (the tonoplast is its membrane) that can take up 30\u201390% of a plant cell\u2019s volume.',
      'It stores water, ions, pigments, and wastes \u2014 and by pressing the cytoplasm against the wall it creates turgor pressure, the firmness that holds a plant upright.'
    ],
    exam: 'Central vacuole = water storage + TURGOR pressure. A wilted plant is a plant that lost vacuole water.'
  },
  chloroplast: {
    name: 'Chloroplast',
    tag: 'Energy',
    desc: [
      'Chloroplasts are the sites of photosynthesis: they capture light energy and convert carbon dioxide and water into glucose and oxygen.',
      'They have three membranes: an outer, an inner, and the thylakoid system. Thylakoids are stacked into grana, and the green pigment chlorophyll embedded in them absorbs light.'
    ],
    exam: 'Chloroplast = photosynthesis. Thylakoids stack into GRANA; chlorophyll in the thylakoid membrane captures light.'
  },
  nucleus: {
    name: 'Nucleus',
    tag: 'Genetic control',
    desc: [
      'The nucleus houses the cell\u2019s DNA as chromatin and directs ribosome and protein synthesis, just as in animal cells.',
      'Its double-membrane nuclear envelope is continuous with the endoplasmic reticulum, and nuclear pores control traffic in and out.'
    ],
    exam: 'Chromatin = DNA plus protein. The nuclear envelope is continuous with the ER membrane.'
  },
  nucleolus: {
    name: 'Nucleolus',
    tag: 'Genetic control',
    desc: [
      'A darkly staining region inside the nucleus where ribosomal RNA is produced and combined with proteins.',
      'It assembles the large and small ribosomal subunits, which then exit through the nuclear pores to the cytoplasm.'
    ],
    exam: 'Nucleolus builds ribosome subunits \u2014 no nucleolus, no new ribosomes.'
  },
  mitochondrion: {
    name: 'Mitochondrion',
    tag: 'Energy',
    desc: [
      'Mitochondria carry out cellular respiration, making ATP \u2014 the cell\u2019s energy currency \u2014 even in plant cells (which make their sugar by day but burn it around the clock).',
      'The inner membrane folds into cristae for extra surface area. Like chloroplasts, mitochondria have their own DNA: evidence for the endosymbiotic theory.'
    ],
    exam: 'Plants have BOTH chloroplasts (make sugar) and mitochondria (burn sugar for ATP).'
  },
  rer: {
    name: 'Rough Endoplasmic Reticulum (RER)',
    tag: 'Endomembrane system',
    desc: [
      'The rough ER is a network of membranous sacs studded with ribosomes on its cytoplasmic surface, continuous with the nuclear envelope.',
      'Ribosomes feed new proteins into its lumen for folding and modification \u2014 the first stop of the secretory pathway (RER \u2192 Golgi \u2192 vesicle).'
    ],
    exam: 'Secretory pathway order: ribosome \u2192 RER \u2192 Golgi \u2192 vesicle \u2192 membrane or outside.'
  },
  ser: {
    name: 'Smooth Endoplasmic Reticulum (SER)',
    tag: 'Endomembrane system',
    desc: [
      'The smooth ER has few or no ribosomes. It synthesizes lipids and carbohydrates, detoxifies poisons, and stores calcium ions.',
      'In plant cells the SER also helps assemble the lipids needed for the extensive internal membrane system, including new cell-wall components.'
    ],
    exam: 'SER = lipid/carbohydrate synthesis + detox + calcium storage. Rough = ribosomes; smooth = none.'
  },
  golgi: {
    name: 'Golgi Apparatus',
    tag: 'Endomembrane system',
    desc: [
      'A stack of flattened membranous sacs (cisternae). Transport vesicles from the ER arrive at its cis face; finished products leave the trans face in vesicles.',
      'In plant cells the Golgi is especially busy making cell-wall materials: it synthesizes and ships pectin and hemicellulose to the growing wall.'
    ],
    exam: 'Plant Golgi = cell-wall factory: it makes pectin and hemicellulose. Cis = receiving, trans = shipping.'
  },
  ribosomes: {
    name: 'Ribosomes',
    tag: 'Genetic control',
    desc: [
      'Ribosomes build proteins from messenger-RNA instructions. Each is a large and small subunit made of protein and ribosomal RNA.',
      'Free ribosomes in the cytosol make proteins used inside the cell (including the enzymes of photosynthesis and respiration); bound ribosomes on the RER make proteins for membranes or export.'
    ],
    exam: 'Free \u2192 proteins for inside. Bound (on the RER) \u2192 proteins for membranes or export.'
  },
  cytoplasm: {
    name: 'Cytoplasm / Cytosol',
    tag: 'Support',
    desc: [
      'The cytoplasm is everything between the plasma membrane and the nuclear envelope: organelles suspended in the gel-like cytosol, plus the cytoskeleton.',
      'In plant cells a thin layer of cytoplasm is pressed between the huge central vacuole and the membrane \u2014 most metabolic reactions of the cell happen here.'
    ],
    exam: 'Cytosol = the fluid; cytoplasm = cytosol plus organelles.'
  }
};

const SYSTEMS = [
  { id: 'Boundary', label: 'Cell boundary', color: '#5dade2' },
  { id: 'Genetic control', label: 'Genetic control', color: '#af7ac5' },
  { id: 'Endomembrane system', label: 'Endomembrane system', color: '#58d68d' },
  { id: 'Energy', label: 'Energy', color: '#f5b041' },
  { id: 'Support', label: 'Support', color: '#ec7063' }
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
export function buildPlantCell() {
  const group = new THREE.Group();
  const parts = [];
  const W = 6.6, H = 5.4, D = 5.4; // cell wall dims

  const radial = (x, y, z, d = 1.7) =>
    makePart(null, null, [x, y, z], [x, y * 0.9, z], d);
  function push(p) { p.group.position.copy(p.basePos); parts.push(p); group.add(p.group); }

  // --- cell wall: translucent green box shell (stays, pick-through) ---
  {
    const p = makePart('cellwall', 'Boundary', [0, 0, 0], [0, 1, 0], 0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), ghost(0x27ae60, 0.18));
    m.renderOrder = 10;
    p.group.add(m);
    const edges = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, H + 0.04, D + 0.04),
      new THREE.MeshBasicMaterial({ color: 0x1e8449, wireframe: true, transparent: true, opacity: 0.35 }));
    edges.userData.noPick = true;
    p.group.add(edges);
    p.pickThrough = true;
    push(p);
  }

  // --- cell membrane: slightly smaller translucent shell, pick-through ---
  {
    const p = makePart('membrane', 'Boundary', [0, 0, 0], [0, 1, 0], 0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(W - 0.5, H - 0.5, D - 0.5), ghost(0x5dade2, 0.15));
    m.renderOrder = 9;
    p.group.add(m);
    p.pickThrough = true;
    push(p);
  }

  // --- cytoplasm: soft inner volume hint, pick-through ---
  {
    const p = makePart('cytoplasm', 'Support', [0, 0, 0], [0, 1, 0], 0);
    p.info = INFO.cytoplasm;
    p.pickThrough = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(W - 1.2, H - 1.2, D - 1.2), ghost(0x1a5276, 0.08));
    m.renderOrder = 1;
    p.group.add(m);
    push(p);
  }

  // --- central vacuole: big, ~35% of interior volume ---
  {
    const p = radial(0.6, 0.1, 0); p.id = 'vacuole'; p.system = 'Support'; p.info = INFO.vacuole;
    const v = new THREE.Mesh(new THREE.SphereGeometry(2.0, 36, 26), ghost(0x85c1e9, 0.45));
    v.scale.set(1.25, 0.9, 0.9);
    p.group.add(v);
    push(p);
  }

  // --- nucleus + envelope ---
  {
    const p = radial(-2.0, 1.1, 0.6); p.id = 'nucleus'; p.system = 'Genetic control'; p.info = INFO.nucleus;
    addMesh(p, ball(0.8, 0x7d3c98), 0, 0, 0);
    const env = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), ghost(0xaf7ac5, 0.35));
    p.group.add(env);
    push(p);
  }

  // --- nucleolus ---
  {
    const p = radial(-1.85, 1.4, 0.85); p.id = 'nucleolus'; p.system = 'Genetic control'; p.info = INFO.nucleolus;
    addMesh(p, ball(0.26, 0x2c1a33), 0, 0, 0);
    push(p);
  }

  // --- chloroplasts x3 (ONE part): ellipsoid + thylakoid stack hint ---
  {
    const p = makePart('chloroplast', 'Energy', [-0.1, -0.2, -0.1], [-0.1, -0.2, -0.1]);
    p.info = INFO.chloroplast;
    [[-0.6, -1.4, 1.5], [1.9, 1.3, -1.3], [-1.7, 0.1, -1.9]].forEach(([x, y, z], si) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), mat(0x2ecc71));
      body.scale.set(1.35, 0.7, 0.7);
      body.rotation.y = si * 0.6;
      holder.add(body);
      // thylakoid stack (granum) hint: 4 thin discs inside
      for (let i = 0; i < 4; i++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 20), mat(0x1e8449));
        disc.rotation.z = Math.PI / 2;
        disc.rotation.y = si * 0.6;
        disc.position.set(-0.18 + i * 0.12, 0, 0);
        disc.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), si * 0.6);
        holder.add(disc);
      }
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

  // --- mitochondria x2 (ONE part) ---
  {
    const p = makePart('mitochondrion', 'Energy', [-0.5, 0.5, -0.1], [-0.5, 0.5, -0.1]);
    p.info = INFO.mitochondrion;
    [[0.2, -0.9, -1.9], [-1.3, 1.9, 1.7]].forEach(([x, y, z], si) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      const outer = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 8, 20), mat(0xe67e22));
      outer.rotation.z = Math.PI / 2 + si * 0.7;
      holder.add(outer);
      const inner = new THREE.Mesh(new THREE.TorusKnotGeometry(0.14, 0.04, 48, 8), mat(0xa04000));
      inner.scale.set(1.6, 0.8, 0.8);
      holder.add(inner);
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

  // --- rough ER: stacked curved sheets with ribosome dots ---
  {
    const p = radial(-1.3, 0.1, 1.9); p.id = 'rer'; p.system = 'Endomembrane system'; p.info = INFO.rer;
    for (let i = 0; i < 4; i++) {
      const sheet = new THREE.Mesh(
        new THREE.TorusGeometry(0.85 - i * 0.13, 0.11, 12, 40, Math.PI * 1.25),
        mat(0x27ae60));
      sheet.rotation.set(Math.PI / 2, 0, 0.4 + i * 0.12);
      sheet.scale.set(1, 1, 0.45);
      sheet.position.y = i * 0.28 - 0.42;
      p.group.add(sheet);
      for (let d = 0; d < 6; d++) {
        const a = 0.5 + d * 0.32 + i * 0.1;
        const dot = ball(0.05, 0x1e8449, 10, 8);
        const rr = 0.85 - i * 0.13;
        dot.position.set(Math.cos(a) * rr, i * 0.28 - 0.42 + 0.11, Math.sin(a) * rr * 0.45);
        p.group.add(dot);
      }
    }
    push(p);
  }

  // --- smooth ER: tubular loops ---
  {
    const p = radial(1.6, -1.6, 1.2); p.id = 'ser'; p.system = 'Endomembrane system'; p.info = INFO.ser;
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 10, 28), mat(0x52be80));
      loop.position.set((i - 1.5) * 0.38, (i % 2) * 0.28 - 0.14, ((i * 7) % 3 - 1) * 0.28);
      loop.rotation.set(i * 0.7, i * 1.1, 0);
      p.group.add(loop);
    }
    push(p);
  }

  // --- Golgi: stacked curved discs ---
  {
    const p = radial(0.8, 1.9, -0.7); p.id = 'golgi'; p.system = 'Endomembrane system'; p.info = INFO.golgi;
    for (let i = 0; i < 5; i++) {
      const r = 0.65 - i * 0.06;
      const disc = new THREE.Mesh(
        new THREE.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, 0.85),
        mat(0xf39c12, { side: THREE.DoubleSide }));
      disc.scale.y = 0.42;
      disc.position.y = i * 0.24 - 0.46;
      disc.rotation.x = Math.PI;
      p.group.add(disc);
    }
    addMesh(p, ball(0.14, 0xf5b041), 0.75, 0.3, 0.2);
    push(p);
  }

  // --- ribosomes: scattered dots (one clickable part) ---
  {
    const p = makePart('ribosomes', 'Genetic control', [0, 0, 0], [0, 1, 0]);
    p.info = INFO.ribosomes;
    const spots = [
      [-2.4, 0.4, 1.6], [2.4, 0.6, 1.8], [0.4, 2.2, 0.8], [-0.6, -2.2, 0.6],
      [2.6, -0.8, -0.8], [-2.6, -0.6, -1.4], [1.2, 1.8, 2.0], [-1.8, -1.9, 1.0],
      [0.8, 0.2, -2.2], [-0.2, 2.3, -1.6]
    ];
    spots.forEach(([x, y, z]) => {
      const holder = new THREE.Group();
      holder.position.set(x, y, z);
      holder.add(ball(0.1, 0x8e44ad, 12, 10));
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

  group.position.y = 0.2;
  return {
    id: 'plantcell',
    label: 'Plant Cell',
    group,
    getParts: () => parts,
    parts,
    systems: SYSTEMS,
    camera: { pos: [7.4, 4.6, 8.0], target: [0, 0.2, 0] },
    getContextId: () => 'main',
    explodeScale: 1.0
  };
}
