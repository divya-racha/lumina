/* ScienceAtlas — Earth Explorer atlas.
 * Procedural cutaway Earth: concentric layer spheres with a 90-degree wedge
 * removed so the interior stays visible, plus clickable plate-tectonic
 * features (plates, mid-ocean ridge, subduction trench) on the crust.
 * The explode slider pulls the layers apart along the x-axis.
 * Descriptions grounded in OpenStax introductory geology.
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  innercore: {
    name: 'Inner Core',
    tag: 'Layer',
    desc: [
      'The inner core spans roughly 5,150\u20136,371 km deep \u2014 the very center of the Earth. It is a solid ball of iron-nickel alloy about the size of the Moon.',
      'It reaches around 5,400 \u00B0C, nearly as hot as the surface of the Sun. It stays solid despite that heat because the crushing pressure at Earth\u2019s center forces its atoms to lock together.'
    ],
    exam: 'Solid iron-nickel at ~5,400 \u00B0C \u2014 pressure, not cold, keeps it solid.'
  },
  outercore: {
    name: 'Outer Core',
    tag: 'Layer',
    desc: [
      'The outer core lies 2,890\u20135,150 km beneath the surface. Unlike the inner core, it is liquid \u2014 a churning ocean of molten iron and nickel.',
      'Convection in this liquid metal, twisted by Earth\u2019s rotation, works like a dynamo and generates the magnetic field that shields the planet from solar wind.'
    ],
    exam: 'Liquid outer core + convection = Earth\u2019s magnetic field (the geodynamo).'
  },
  mantle: {
    name: 'Mantle',
    tag: 'Layer',
    desc: [
      'The mantle extends from the base of the crust down to 2,890 km. It is made of hot, dense silicate rock that flows extremely slowly \u2014 more like warm asphalt than liquid.',
      'Convection currents in the mantle drag the plates above them: this is the engine of plate tectonics. Though hidden, the mantle is by far the largest layer, holding about 84% of Earth\u2019s volume.'
    ],
    exam: 'Mantle convection drives plate tectonics; the mantle is ~84% of Earth\u2019s volume.'
  },
  crust: {
    name: 'Crust',
    tag: 'Layer',
    desc: [
      'The crust is Earth\u2019s thin outer skin, only 5\u201370 km thick \u2014 proportionally thinner than an apple\u2019s peel. Oceanic crust is thin, young basalt; continental crust is thicker, older granite.',
      'It is broken into tectonic plates that drift on the mantle below, colliding, separating, and grinding past one another a few centimeters per year.'
    ],
    exam: 'Lithosphere = crust + the rigid uppermost mantle riding with it.'
  },
  plateOceanic: {
    name: 'Oceanic Plate',
    tag: 'Plate feature',
    desc: [
      'Oceanic plates carry thin, dense basaltic crust born at mid-ocean ridges. Because the crust is dense, oceanic plates usually sink (subduct) when they collide with continental plates.',
      'This plate is drifting a few centimeters per year \u2014 about as fast as your fingernails grow.'
    ],
    exam: 'Dense oceanic crust subducts beneath lighter continental crust.'
  },
  plateContinental: {
    name: 'Continental Plate',
    tag: 'Plate feature',
    desc: [
      'Continental plates carry thick, buoyant granitic crust that resists subduction. Continents are essentially permanent rafts of light rock riding on the mantle.',
      'When two continental plates collide, neither sinks easily \u2014 instead the crust crumples upward, building mountain ranges like the Himalayas.'
    ],
    exam: 'Continental collision \u2192 mountains (neither plate subducts easily).'
  },
  ridge: {
    name: 'Mid-Ocean Ridge',
    tag: 'Plate feature',
    desc: [
      'A mid-ocean ridge is a long underwater mountain chain where two plates pull apart \u2014 a divergent boundary. Magma rises into the gap, cools, and hardens into brand-new oceanic crust.',
      'This seafloor spreading is why the Atlantic grows a few centimeters wider every year, and why the youngest seafloor sits right at the ridge.'
    ],
    exam: 'Divergent boundary = plates separate, new crust forms (seafloor spreading).'
  },
  trench: {
    name: 'Ocean Trench (Subduction Zone)',
    tag: 'Plate feature',
    desc: [
      'Where an oceanic plate meets a continental plate, the denser oceanic slab bends and dives back into the mantle \u2014 a convergent boundary called a subduction zone. The dimple in the seafloor above it is the trench, the deepest place on Earth.',
      'Water carried down with the sinking slab melts the rock above it, feeding chains of volcanoes on the overriding plate, like the Andes.'
    ],
    exam: 'Convergent boundary = denser plate subducts; trenches plus volcanic arcs result.'
  }
};

const SYSTEMS = [
  { id: 'layer', label: 'Layers', color: '#e67e22' },
  { id: 'feature', label: 'Plate features', color: '#5dade2' }
];

/* --------------------------------------------------------------- helpers */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.6, metalness: 0.05 }, opts));
}
function place(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

/** SphereGeometry param: x = -r cos(phi) sin(theta), z = r sin(phi) sin(theta). */
function sph(r, phi, theta) {
  return new THREE.Vector3(
    -r * Math.cos(phi) * Math.sin(theta),
    r * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Register a clickable part. All meshes go in one group at basePos. */
function makePart(id, system, basePos, explodeDist = 0) {
  return {
    id, system,
    info: INFO[id],
    group: new THREE.Group(),
    basePos: new THREE.Vector3(...basePos),
    explodeDir: new THREE.Vector3(1, 0, 0), // normalized; custom applyExplode below
    explodeDist,
    explodeOffset: explodeDist
  };
}
function addMesh(part, mesh, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  part.group.add(mesh);
  return mesh;
}

/* ----------------------------------------------------------------- build */
export function buildEarth() {
  const group = new THREE.Group();
  const parts = [];

  // 270° of sphere drawn; the missing 90° wedge faces the default camera.
  const PHI_START = 3.105, PHI_LEN = Math.PI * 1.5;
  const SEG = [48, 32];
  const layerSphere = (r) =>
    new THREE.SphereGeometry(r, SEG[0], SEG[1], PHI_START, PHI_LEN);

  const layerDefs = [
    { id: 'innercore', r: 0.75, color: 0xf7dc6f,
      opts: { emissive: 0x7e5109, emissiveIntensity: 0.45 }, arc: 0xf9e79f },
    { id: 'outercore', r: 1.25, color: 0xe67e22,
      opts: { emissive: 0x7e5109, emissiveIntensity: 0.25 }, arc: 0xf0a35e },
    { id: 'mantle', r: 1.85, color: 0xa93226, opts: {}, arc: 0xe08080 },
    { id: 'crust', r: 2.0, color: 0x8d7b68, opts: { roughness: 0.85 }, arc: 0xd5c9b8 }
  ];

  // --- concentric layers + thin outline arcs along the two cut faces ---
  layerDefs.forEach((L, i) => {
    const p = makePart(L.id, 'layer', [0, 0, 0], [0, 1.6, 3.2, 4.8][i]);
    const m = new THREE.Mesh(layerSphere(L.r),
      mat(L.color, Object.assign({ side: THREE.DoubleSide }, L.opts)));
    p.group.add(m);
    // semicircle outline on each wedge cut face (decorative, rides with layer)
    [PHI_START, PHI_START + PHI_LEN].forEach(phi => {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(L.r, 0.014, 8, 64, Math.PI),
        new THREE.MeshBasicMaterial({ color: L.arc }));
      arc.rotation.y = Math.PI + phi;
      arc.userData.noPick = true;
      p.group.add(arc);
    });
    parts.push(p); group.add(p.group);
  });

  // --- tectonic plates: curved patches sitting just above the crust ---
  function platePatch(id, phiS, phiL, thetaS, thetaL, color) {
    const p = makePart(id, 'feature', [0, 0, 0], 4.8); // rides with the crust
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(2.02, 24, 16, phiS, phiL, thetaS, thetaL),
      mat(color, { roughness: 0.8 }));
    p.group.add(m);
    parts.push(p); group.add(p.group);
    return p;
  }
  platePatch('plateOceanic', 3.35, 0.85, 0.7, 0.9, 0x5d6d7e);      // oceanic: slate blue-gray
  platePatch('plateContinental', 4.6, 0.8, 0.85, 0.85, 0xc8a165);  // continental: tan

  // --- mid-ocean ridge: raised volcanic tube along the oceanic plate ---
  {
    const p = makePart('ridge', 'feature', [0, 0, 0], 4.8);
    const pts = [];
    for (let i = 0; i <= 5; i++) pts.push(sph(2.07, 3.78, 0.85 + i * 0.12));
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 8),
      mat(0xe74c3c, { emissive: 0x7b241c, emissiveIntensity: 0.35 }));
    p.group.add(tube);
    // small volcanic bumps along the ridge
    for (let i = 0; i <= 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), mat(0x922b21));
      b.position.copy(sph(2.1, 3.78, 0.9 + i * 0.13));
      p.group.add(b);
    }
    parts.push(p); group.add(p.group);
  }

  // --- trench / subduction zone: slab diving under the continental plate edge ---
  {
    const p = makePart('trench', 'feature', [0, 0, 0], 4.8);
    const surf = sph(1.98, 4.6, 1.3);
    const eR = surf.clone().normalize();
    const ePhi = new THREE.Vector3(
      Math.sin(4.6) * Math.sin(1.3), 0, Math.cos(4.6) * Math.sin(1.3)).normalize();
    const diveDir = eR.clone().multiplyScalar(-0.75).addScaledVector(ePhi, 0.66).normalize();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.13, 0.5), mat(0x2c3e50));
    slab.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), diveDir);
    slab.position.copy(surf).addScaledVector(diveDir, 0.18);
    p.group.add(slab);
    // dark groove marking the trench on the surface
    const groove = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.6), mat(0x1a252f));
    groove.position.copy(sph(2.0, 4.62, 1.3));
    groove.lookAt(0, 0, 0);
    p.group.add(groove);
    parts.push(p); group.add(p.group);
  }

  // --- explode: pull layers apart along x; features ride with the crust ---
  function applyExplode(t) {
    parts.forEach(p => {
      p.group.position.set(
        p.basePos.x + p.explodeOffset * t, p.basePos.y, p.basePos.z);
    });
  }

  return {
    id: 'earth',
    label: 'Earth Explorer',
    group,
    parts,
    systems: SYSTEMS,
    camera: { pos: [4.8, 2.6, 5.2], target: [0, 0, 0] },
    applyExplode,
    getContextId: () => 'main'
  };
}
