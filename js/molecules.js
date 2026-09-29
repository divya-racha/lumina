/* ScienceAtlas — Molecules atlas.
 * Ball-and-stick models with a molecule switcher. Correct VSEPR geometry
 * (bent H2O 104.5°, linear CO2, tetrahedral CH4 109.5°), an NaCl lattice
 * chunk, and a simplified glucose ring. Clicking an atom shows element
 * info; the panel header shows molecule-level info (bond type, geometry).
 * Content grounded in OpenStax Chemistry 2e, Chapters 2, 7, and 10.
 */
import * as THREE from 'three';

const ELEMENTS = {
  H:  { name: 'Hydrogen', num: 1,  color: 0xf2f3f4, r: 0.30,
        fact: 'One valence electron, one covalent bond \u2014 that is why water has two H atoms and methane has four.' },
  O:  { name: 'Oxygen', num: 8,  color: 0xe8443a, r: 0.44,
        fact: 'Six valence electrons and highly electronegative. In water its two lone pairs squeeze the H\u2013O\u2013H angle down to 104.5\u00b0.' },
  C:  { name: 'Carbon', num: 6,  color: 0x9aa0a8, r: 0.42,
        fact: 'Tetravalent \u2014 four valence electrons, four bonds. Carbon is the backbone of every organic molecule.' },
  Na: { name: 'Sodium', num: 11, color: 0x5b7fd4, r: 0.52,
        fact: 'An alkali metal that loses its single valence electron to become Na\u207a \u2014 the cation in table salt.' },
  Cl: { name: 'Chlorine', num: 17, color: 0x2fbf71, r: 0.58,
        fact: 'A halogen that gains one electron to become Cl\u207b. In the NaCl lattice each Cl\u207b is surrounded by six Na\u207a ions.' }
};

const MOLECULES = [
  { id: 'water', name: 'Water', formula: 'H\u2082O',
    bondType: 'Polar covalent (O\u2013H)', geometry: 'Bent \u00b7 104.5\u00b0', polarity: 'Polar molecule',
    desc: ['Two hydrogen atoms bonded to one oxygen, with two lone pairs on the oxygen. The lone pairs repel more strongly than bonding pairs, squeezing the molecule into a bent shape.',
      'Because oxygen pulls electrons harder than hydrogen, each O\u2013H bond is polar \u2014 and the bent shape keeps those dipoles from canceling, so water itself is polar.'],
    exam: 'Bent + polar bonds = polar molecule \u2192 hydrogen bonding \u2192 unusually high boiling point for its size.',
    atoms: (() => { const a = 52.25 * Math.PI / 180, L = 1.0;
      return [ { el: 'O', pos: [0, 0.15, 0] },
               { el: 'H', pos: [-Math.sin(a) * L, 0.15 - Math.cos(a) * L, 0] },
               { el: 'H', pos: [Math.sin(a) * L, 0.15 - Math.cos(a) * L, 0] } ]; })(),
    bonds: [[0, 1, 1], [0, 2, 1]] },
  { id: 'co2', name: 'Carbon Dioxide', formula: 'CO\u2082',
    bondType: 'Polar covalent (C=O double)', geometry: 'Linear \u00b7 180\u00b0', polarity: 'Nonpolar molecule',
    desc: ['A carbon atom double-bonded to two oxygens in a perfectly straight line. The two regions of electron density around carbon arrange themselves 180\u00b0 apart (VSEPR).',
      'Each C=O bond is polar, but the linear symmetry means the two bond dipoles point in opposite directions and cancel exactly.'],
    exam: 'Polar bonds but a NONPOLAR molecule \u2014 symmetry cancels the dipoles. A classic trick question.' ,
    atoms: [ { el: 'C', pos: [0, 0, 0] }, { el: 'O', pos: [-1.16, 0, 0] }, { el: 'O', pos: [1.16, 0, 0] } ],
    bonds: [[0, 1, 2], [0, 2, 2]] },
  { id: 'methane', name: 'Methane', formula: 'CH\u2084',
    bondType: 'Covalent (C\u2013H)', geometry: 'Tetrahedral \u00b7 109.5\u00b0', polarity: 'Nonpolar molecule',
    desc: ['Carbon\u2019s four bonding pairs arrange themselves toward the corners of a tetrahedron \u2014 the geometry that maximizes their separation (VSEPR). Methane is the major component of natural gas.',
      'With four identical, nearly nonpolar C\u2013H bonds in perfect tetrahedral symmetry, methane has no net dipole.'],
    exam: '4 bonding pairs + 0 lone pairs \u2192 tetrahedral electron-pair AND molecular geometry, 109.5\u00b0.',
    atoms: (() => { const v = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(p => {
        const l = Math.hypot(...p); return p.map(x => x / l * 1.09); });
      return [{ el: 'C', pos: [0, 0, 0] }, ...v.map(pos => ({ el: 'H', pos }))]; })(),
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
  { id: 'oxygen', name: 'Oxygen', formula: 'O\u2082',
    bondType: 'Nonpolar covalent (O=O double)', geometry: 'Linear (diatomic)', polarity: 'Nonpolar molecule',
    desc: ['Two identical oxygen atoms sharing two pairs of electrons. Because the atoms are identical, they pull on the shared electrons equally.',
      'Equal sharing between identical atoms is the definition of a pure nonpolar covalent bond \u2014 the contrast case to polar bonds like O\u2013H.'],
    exam: 'Identical atoms share equally = pure nonpolar covalent. Compare with water\u2019s polar O\u2013H bonds.',
    atoms: [ { el: 'O', pos: [-0.62, 0, 0] }, { el: 'O', pos: [0.62, 0, 0] } ],
    bonds: [[0, 1, 2]] },
  { id: 'nacl', name: 'Sodium Chloride', formula: 'NaCl',
    bondType: 'Ionic (Na\u207a / Cl\u207b)', geometry: 'Cubic lattice \u00b7 6:6 coordination', polarity: '\u2014 (not a molecule)',
    desc: ['Table salt is NOT a molecule. Na\u207a cations and Cl\u207b anions pack into a repeating 3D lattice in which every ion is surrounded by six ions of opposite charge.',
      'The attraction is electrostatic and acts equally in all directions, so there are no discrete bonds \u2014 that is why solid NaCl is hard and brittle, melts at 801\u00b0C, and conducts electricity only when molten or dissolved.'],
    exam: 'Never call NaCl a "molecule" \u2014 it\u2019s a lattice. The formula NaCl is just the simplest whole-number ratio.',
    lattice: true,
    atoms: (() => { const s = 1.35, out = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++)
        out.push({ el: (i + j + k) % 2 === 0 ? 'Na' : 'Cl',
                   pos: [(i - 1) * s, (j - 1) * s, (k - 1) * s] });
      return out; })(),
    bonds: [] },
  { id: 'glucose', name: 'Glucose (simplified)', formula: 'C\u2086H\u2081\u2082O\u2086',
    bondType: 'Covalent', geometry: 'Six-membered ring (hexose)', polarity: 'Polar (\u2013OH groups)',
    desc: ['Glucose is the most common monosaccharide \u2014 a simple sugar and the starting fuel for cellular respiration. In solution it mostly exists as a six-membered ring: five carbons and one oxygen.',
      'Each carbon carries hydroxyl (\u2013OH) groups (shown simplified here), which make glucose polar and very soluble in water. Most sugar names end in \u2013ose.'],
    exam: 'Glucose = the monosaccharide all of cellular respiration starts from. \u2013ose ending = sugar.',
    atoms: (() => { const out = [], R = 1.15;
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        out.push({ el: i === 0 ? 'O' : 'C', pos: [Math.cos(a) * R, 0, Math.sin(a) * R] });
      }
      // simplified -OH stubs alternating up/down on the ring carbons
      for (let i = 1; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, up = i % 2 === 0 ? 1 : -1;
        out.push({ el: 'O', pos: [Math.cos(a) * (R + 0.55), up * 0.55, Math.sin(a) * (R + 0.55)], stub: true });
      }
      return out; })(),
    bonds: [[0,1,1],[1,2,1],[2,3,1],[3,4,1],[4,5,1],[5,0,1],
            [1,6,1],[2,7,1],[3,8,1],[4,9,1],[5,10,1]] }
];

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.35, metalness: 0.1 }, opts));
}

export function buildMolecules() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  let parts = [];
  let bondMeshes = [];
  let current = MOLECULES[0];

  function clearContainer() {
    container.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    container.clear();
    parts = []; bondMeshes = [];
  }

  function setMolecule(id) {
    clearContainer();
    current = MOLECULES.find(m => m.id === id) || MOLECULES[0];
    const center = new THREE.Vector3();
    current.atoms.forEach(a => center.add(new THREE.Vector3(...a.pos)));
    center.divideScalar(current.atoms.length);

    current.atoms.forEach((a, i) => {
      const E = ELEMENTS[a.el];
      const pos = new THREE.Vector3(...a.pos);
      const p = {
        id: 'atom-' + i,
        system: 'atom',
        el: a.el, // element symbol — used by quiz matching + search
        info: {
          name: `${E.name} (${a.el})`,
          tag: `Element \u00b7 atomic number ${E.num} \u2014 in ${current.name}`,
          desc: [E.fact],
          exam: moleculeExamHint(a.el)
        },
        group: new THREE.Group(),
        basePos: pos.clone(),
        explodeDir: pos.clone().sub(center),
        explodeDist: 1.5
      };
      if (p.explodeDir.lengthSq() < 1e-6) p.explodeDir.set(0, 1, 0);
      p.explodeDir.normalize();
      const s = new THREE.Mesh(new THREE.SphereGeometry(a.stub ? E.r * 0.7 : E.r, 28, 22), mat(E.color));
      if (a.el === 'H') s.material = mat(E.color, { roughness: 0.6 });
      p.group.add(s);
      p.group.position.copy(pos);
      // subtle ring under atom for depth
      parts.push(p); container.add(p.group);
    });

    // bonds
    const bondMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7, roughness: 0.4, metalness: 0.3, transparent: true
    });
    current.bonds.forEach(([i, j, order]) => {
      const a = new THREE.Vector3(...current.atoms[i].pos);
      const b = new THREE.Vector3(...current.atoms[j].pos);
      const dir = b.clone().sub(a);
      const len = dir.length() - ELEMENTS[current.atoms[i].el].r * 0.35
                                - ELEMENTS[current.atoms[j].el].r * 0.35;
      const mid = a.clone().lerp(b, 0.5);
      const offs = order === 2 ? [0.10, -0.10] : [0];
      // perpendicular offset direction
      const perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      if (perp.lengthSq() < 1e-6) perp.set(1, 0, 0);
      offs.forEach(o => {
        const geo = new THREE.CylinderGeometry(0.11, 0.11, len, 14);
        const m = new THREE.Mesh(geo, bondMat);
        m.position.copy(mid).addScaledVector(perp, o);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        m.userData.bond = true;
        m.userData.noPick = true; // bonds are visual only; atoms are the clickable parts
        container.add(m); bondMeshes.push(m);
      });
    });
    return current;
  }

  function moleculeExamHint(el) {
    return current.exam;
  }

  function applyExplode(t) {
    parts.forEach(p => {
      p.group.position.copy(p.basePos).addScaledVector(p.explodeDir, t * p.explodeDist);
    });
    bondMeshes.forEach(b => { b.material.opacity = Math.max(0.06, 1 - t * 0.94); });
  }

  function getMoleculeInfo() { return current; }

  setMolecule('water');
  return {
    id: 'molecules',
    label: 'Molecules',
    group,
    getParts: () => parts,
    systems: [],
    moleculeList: MOLECULES.map(m => ({ id: m.id, name: m.name, formula: m.formula })),
    setMolecule,
    getMoleculeInfo,
    applyExplode,
    camera: { pos: [4.0, 2.4, 4.8], target: [0, 0, 0] },
    explodeScale: 1.0
  };
}
