/* ScienceAtlas — Animal Cell atlas.
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
export function buildCell() {
  const group = new THREE.Group();
  const parts = [];
  const R = 3; // cell radius

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
    parts.push(p); group.add(p.group);
  }

  // --- cytoplasm: soft inner volume hint ---
  {
    const p = radial(0, 0, 0); p.id = 'cytoplasm'; p.system = 'Support & division'; p.info = INFO.cytoplasm;
    p.pickThrough = true; // same: inner organelles take priority on click
    const m = new THREE.Mesh(new THREE.SphereGeometry(R * 0.96, 32, 24), ghost(0x1a5276, 0.10));
    m.renderOrder = 1;
    p.group.add(m);
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
  }

  // --- nucleolus ---
  {
    const p = radial(-0.55, 0.75, 0.45); p.id = 'nucleolus'; p.system = 'Genetic control'; p.info = INFO.nucleolus;
    addMesh(p, ball(0.34, 0x2c1a33), 0, 0, 0);
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
  }

  // --- vacuole ---
  {
    const p = radial(1.1, 1.7, 1.1); p.id = 'vacuole'; p.system = 'Endomembrane system'; p.info = INFO.vacuole;
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 18), ghost(0x85c1e9, 0.5));
    p.group.add(v);
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
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
    parts.push(p); group.add(p.group);
  }

  group.position.y = 0.2;
  return {
    id: 'cell',
    label: 'Animal Cell',
    group,
    parts,
    systems: SYSTEMS,
    getContextId: () => 'main',
    camera: { pos: [5.4, 3.4, 6.4], target: [0, 0.2, 0] },
    explodeScale: 1.0
  };
}
