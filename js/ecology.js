/* ScienceAtlas — Ecology atlas.
 * Interactive 3D food web: organism nodes arranged by trophic level, with
 * energy-flow arrows from food to eater and dashed nutrient arrows back to
 * the decomposers. The explode slider spreads the trophic levels apart
 * vertically (arrows stretch to follow their nodes).
 * Also carries a biome selector (data only; the host UI renders it).
 * Descriptions grounded in OpenStax Biology 2e, Chapter 46 (Ecosystems).
 */
import * as THREE from 'three';

/* ------------------------------------------------------------------ info */
const INFO = {
  grass: {
    name: 'Grass',
    tag: 'Producer',
    desc: [
      'Grass is a producer: using sunlight, water, and carbon dioxide, it performs photosynthesis and turns light energy into food.',
      'It forms the base of this food web \u2014 the grasshopper and rabbit eat it directly, and every other animal here depends on it indirectly.'
    ],
    exam: 'Producers do photosynthesis: 6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082.'
  },
  berries: {
    name: 'Berry Bush',
    tag: 'Producer',
    desc: [
      'The berry bush is another producer, converting sunlight into sugary fruits packed with energy.',
      'Its berries feed the mouse, which then carries that energy up to the fox and the hawk.'
    ],
    exam: 'Fruits are energy packets \u2014 plants \u201Cpay\u201D animals to disperse their seeds.'
  },
  grasshopper: {
    name: 'Grasshopper',
    tag: 'Primary consumer',
    desc: [
      'The grasshopper is a primary consumer \u2014 a herbivore that eats grass directly.',
      'It passes the grass\u2019s stored energy upward: frogs and mice both prey on it.'
    ],
    exam: 'Herbivores = primary consumers; they eat producers.'
  },
  rabbit: {
    name: 'Rabbit',
    tag: 'Primary consumer',
    desc: [
      'Rabbits are herbivores that graze on grass, making them primary consumers.',
      'They are a key prey animal here \u2014 the fox depends on rabbits and mice for most of its meals.'
    ],
    exam: 'Follow the chain: grass \u2192 rabbit \u2192 fox.'
  },
  mouse: {
    name: 'Mouse',
    tag: 'Primary consumer',
    desc: [
      'The mouse is an omnivore: it eats berries (a producer) and grasshoppers (a primary consumer), so it feeds at more than one trophic level.',
      'That makes it a busy energy hub \u2014 both the fox and the hawk hunt mice.'
    ],
    exam: 'Omnivores feed at multiple trophic levels at once.'
  },
  frog: {
    name: 'Frog',
    tag: 'Secondary consumer',
    desc: [
      'The frog is a carnivore that hunts grasshoppers, making it a secondary consumer \u2014 it eats primary consumers.',
      'It in turn becomes food for the hawk, moving energy one step higher.'
    ],
    exam: 'Secondary consumer = carnivore that eats herbivores.'
  },
  fox: {
    name: 'Fox',
    tag: 'Secondary consumer',
    desc: [
      'The fox is a carnivore that preys on rabbits and mice \u2014 both primary consumers \u2014 so it sits at the secondary-consumer level.',
      'Foxes help control rodent and rabbit populations, keeping the whole web in balance.'
    ],
    exam: 'Predators that eat herbivores are secondary consumers.'
  },
  hawk: {
    name: 'Hawk',
    tag: 'Tertiary consumer',
    desc: [
      'The hawk is the apex predator of this food web \u2014 a tertiary consumer that hunts mice and frogs and has no natural predators here.',
      'Because energy is lost at every transfer, top predators like the hawk are always rare compared to the producers below them.'
    ],
    exam: 'Only ~10% of energy moves up each trophic level \u2014 that is why food chains stay short.'
  },
  fungi: {
    name: 'Fungi (Decomposers)',
    tag: 'Decomposer',
    desc: [
      'Fungi are decomposers: they secrete enzymes that break down dead leaves, fallen berries, and the remains of every animal in this web.',
      'They return carbon and nutrients to the soil, where producers like grass reuse them \u2014 closing the loop.'
    ],
    exam: 'Decomposers recycle nutrients; without them ecosystems run out of raw materials.'
  }
};

const SYSTEMS = [
  { id: 'producers', label: 'Producers', color: '#58d68d' },
  { id: 'primary', label: 'Primary consumers', color: '#f5b041' },
  { id: 'secondary', label: 'Secondary consumers', color: '#e67e22' },
  { id: 'tertiary', label: 'Tertiary consumers', color: '#c0392b' },
  { id: 'decomposers', label: 'Decomposers', color: '#8e44ad' }
];

const BIOMES = {
  desert: {
    name: 'Desert',
    desc: [
      'Deserts receive less than 25 cm of rain per year, and temperatures can swing wildly between scorching days and freezing nights.',
      'Life here is built around saving water: deep roots, waxy leaves, and animals that shelter by day and hunt by night.'
    ],
    exam: 'Desert = <25 cm rain/yr + extreme temperature swings; adaptations center on water conservation.'
  },
  rainforest: {
    name: 'Tropical Rainforest',
    desc: [
      'Tropical rainforests grow near the equator, where it is warm and rainy all year \u2014 ideal conditions for photosynthesis.',
      'They hold the highest biodiversity on Earth: a single hectare can contain more tree species than all of North America.'
    ],
    exam: 'Rainforests = near the equator, highest biodiversity of any biome.'
  },
  tundra: {
    name: 'Tundra',
    desc: [
      'The tundra is a cold, treeless biome where permafrost \u2014 permanently frozen soil \u2014 sits just below the surface.',
      'The growing season lasts only a few weeks, so plants stay low and fast, while most animals migrate or hibernate through the long winter.'
    ],
    exam: 'Tundra = permafrost + a very short growing season; no trees.'
  },
  ocean: {
    name: 'Ocean',
    desc: [
      'The ocean covers about 71% of Earth\u2019s surface and holds most of the planet\u2019s water and biodiversity.',
      'Almost all ocean life depends on the sunlit photic zone near the surface, where phytoplankton \u2014 the ocean\u2019s producers \u2014 photosynthesize.'
    ],
    exam: 'Ocean covers ~71% of Earth; the sunlit photic zone powers nearly all marine food webs.'
  }
};

/* --------------------------------------------------------------- helpers */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.55, metalness: 0.05 }, opts));
}
function ball(r, color, w = 24, h = 18) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat(color));
}
function place(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

/** Register a clickable organism node at its trophic height. */
function makePart(id, system, basePos, explodeDist) {
  return {
    id, system,
    info: INFO[id],
    group: new THREE.Group(),
    basePos: new THREE.Vector3(...basePos),
    explodeDir: new THREE.Vector3(0, 1, 0), // normalized; custom applyExplode below
    explodeDist
  };
}
function addMesh(part, mesh, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  part.group.add(mesh);
  return mesh;
}

/* ----------------------------------------------------------------- build */
export function buildEcology() {
  const group = new THREE.Group();
  const parts = [];
  const byId = {};
  const NODE_R = 0.45;

  // --- organism nodes (sphere per trophic color + a small identifying accent) ---
  function node(id, system, x, y, z, color, explodeDist, accentFn) {
    const p = makePart(id, system, [x, y, z], explodeDist);
    addMesh(p, ball(NODE_R, color), 0, 0, 0);
    if (accentFn) accentFn(p);
    parts.push(p); group.add(p.group);
    byId[id] = p;
    return p;
  }

  // producers (y = 0)
  node('grass', 'producers', -2.3, 0, 0.6, 0x58d68d, 0, p => {
    for (let i = -1; i <= 1; i++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 6), mat(0x1e8449));
      blade.position.set(i * 0.18, 0.45, 0);
      blade.rotation.z = -i * 0.25;
      p.group.add(blade);
    }
  });
  node('berries', 'producers', 2.3, 0, 0.6, 0x27ae60, 0, p => {
    [[0.15, 0.42, 0.1], [-0.18, 0.4, -0.05], [0, 0.48, -0.15]].forEach(([x, y, z]) =>
      addMesh(p, ball(0.13, 0x8e44ad, 12, 10), x, y, z));
  });

  // primary consumers (y = 1.6)
  node('grasshopper', 'primary', -2.5, 1.6, -0.6, 0xf5b041, 1.2, p => {
    [-1, 1].forEach(s => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), mat(0xb9770e));
      leg.position.set(s * 0.28, -0.25, -0.15);
      leg.rotation.z = s * 0.9; leg.rotation.x = 0.5;
      p.group.add(leg);
    });
  });
  node('rabbit', 'primary', 0, 1.6, 0.9, 0xf5b041, 1.2, p => {
    [-1, 1].forEach(s => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.32, 6, 12), mat(0xf8c471));
      ear.position.set(s * 0.16, 0.55, 0);
      ear.rotation.z = s * -0.12;
      p.group.add(ear);
    });
  });
  node('mouse', 'primary', 2.5, 1.6, -0.6, 0xf5b041, 1.2, p => {
    [-1, 1].forEach(s => {
      const ear = ball(0.14, 0xb9770e, 12, 10);
      ear.scale.z = 0.45;
      addMesh(p, ear, s * 0.3, 0.32, 0);
    });
  });

  // secondary consumers (y = 3.2)
  node('frog', 'secondary', -1.3, 3.2, 0.2, 0xe67e22, 2.4, p => {
    [-1, 1].forEach(s => addMesh(p, ball(0.13, 0x1e8449, 12, 10), s * 0.2, 0.38, 0.12));
  });
  node('fox', 'secondary', 1.5, 3.2, -0.4, 0xe67e22, 2.4, p => {
    [-1, 1].forEach(s => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 4), mat(0xa04000));
      addMesh(p, ear, s * 0.22, 0.5, 0);
    });
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), mat(0xfdebd0));
    snout.rotation.x = Math.PI / 2;
    addMesh(p, snout, 0, -0.05, 0.5);
  });

  // tertiary consumer (y = 4.8)
  node('hawk', 'tertiary', 0.1, 4.8, 0, 0xc0392b, 3.6, p => {
    [-1, 1].forEach(s => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.07, 0.38), mat(0x922b21));
      wing.position.set(s * 0.55, 0.12, -0.05);
      wing.rotation.z = s * 0.35;
      p.group.add(wing);
    });
  });

  // decomposers (off to the side)
  node('fungi', 'decomposers', 3.7, 0.8, 1.4, 0x8e44ad, 0.6, p => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.5, 12), mat(0xf5eef8));
    addMesh(p, stem, 0, 0.1, 0);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0x8e44ad));
    cap.scale.y = 0.7;
    addMesh(p, cap, 0, 0.32, 0);
    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 10), mat(0xf5eef8));
    addMesh(p, stem2, 0.42, -0.25, 0.15);
    const cap2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0x9b59b6));
    cap2.scale.y = 0.7;
    addMesh(p, cap2, 0.42, -0.12, 0.15);
  });

  /* ---------------- energy-flow arrows (food -> eater), all decorative ---- */
  const arrows = [];
  const UP = new THREE.Vector3(0, 1, 0);

  function solidArrow(fromId, toId, color = 0xf39c12) {
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), mat(color));
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.24, 12), mat(color));
    g.add(cyl); g.add(head);
    g.traverse(m => { m.userData.noPick = true; });
    group.add(g);
    const rec = { kind: 'solid', g, cyl, head, from: byId[fromId], to: byId[toId] };
    arrows.push(rec);
    return rec;
  }
  function dashedArrow(fromId, toId, color = 0x95a5a6) {
    const g = new THREE.Group();
    const segs = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), mat(color));
      g.add(s); segs.push(s);
    }
    g.traverse(m => { m.userData.noPick = true; });
    group.add(g);
    const rec = { kind: 'dash', g, segs, from: byId[fromId], to: byId[toId] };
    arrows.push(rec);
    return rec;
  }

  function endpoints(rec) {
    const a = rec.from.group.position.clone();
    const b = rec.to.group.position.clone();
    const dir = b.clone().sub(a).normalize();
    return [a.addScaledVector(dir, NODE_R + 0.05), b.addScaledVector(dir, -(NODE_R + 0.12)), dir];
  }
  function layoutArrows() {
    arrows.forEach(rec => {
      const [a, b, dir] = endpoints(rec);
      if (rec.kind === 'solid') {
        const mid = a.clone().lerp(b, 0.5);
        const len = a.distanceTo(b);
        rec.cyl.position.copy(mid);
        rec.cyl.scale.set(1, Math.max(len - 0.24, 0.05), 1);
        rec.cyl.quaternion.setFromUnitVectors(UP, dir);
        rec.head.position.copy(b).addScaledVector(dir, -0.12);
        rec.head.quaternion.setFromUnitVectors(UP, dir);
      } else {
        const n = rec.segs.length;
        rec.segs.forEach((s, i) => {
          const f = n === 1 ? 0.5 : 0.08 + (i / (n - 1)) * 0.84;
          s.position.copy(a).lerp(b, f);
          s.quaternion.setFromUnitVectors(UP, dir);
        });
      }
    });
  }

  // who eats whom
  solidArrow('grass', 'grasshopper');
  solidArrow('grass', 'rabbit');
  solidArrow('berries', 'mouse');
  solidArrow('grasshopper', 'frog');
  solidArrow('grasshopper', 'mouse');
  solidArrow('mouse', 'fox');
  solidArrow('mouse', 'hawk');
  solidArrow('rabbit', 'fox');
  solidArrow('frog', 'hawk');
  // nutrients flow back to the decomposers from every level
  dashedArrow('grass', 'fungi');
  dashedArrow('mouse', 'fungi');
  dashedArrow('fox', 'fungi');
  dashedArrow('hawk', 'fungi');

  layoutArrows();

  // --- explode: spread trophic levels apart vertically; arrows follow ---
  function applyExplode(t) {
    parts.forEach(p => {
      p.group.position.set(p.basePos.x, p.basePos.y + p.explodeDist * t, p.basePos.z);
    });
    layoutArrows();
  }

  /* ------------------------------------------------------- biome state */
  let currentBiome = 'desert';
  const biomeList = Object.keys(BIOMES).map(id => ({ id, name: BIOMES[id].name }));
  function setBiome(id) { if (BIOMES[id]) currentBiome = id; }
  function getBiomeInfo() {
    const b = BIOMES[currentBiome];
    return { tag: 'Biome', name: b.name, desc: b.desc, exam: b.exam };
  }

  return {
    id: 'ecology',
    label: 'Ecology',
    group,
    parts,
    systems: SYSTEMS,
    camera: { pos: [6.5, 4.5, 7.5], target: [0, 2.2, 0] },
    applyExplode,
    biomeList,
    setBiome,
    getBiomeInfo,
    getContextId: () => 'main'
  };
}
