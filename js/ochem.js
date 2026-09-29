/* ScienceAtlas — Ochem Studio atlas.
 * Two views: (1) a ring of 8 clickable functional-group fragments — each a
 * small ball-and-stick group registered with quizGroup/quizGroupLabel (no el);
 * (2) a molecule gallery (ethanol, benzene, aspirin, caffeine) where every
 * atom is a clickable part carrying its element symbol (el, no quizGroup).
 * Content grounded in OpenStax Chemistry 2e (Ch. 20-22) and Biology 2e (Ch. 3).
 */
import * as THREE from 'three';

const ELEMENTS = {
  H: { name: 'Hydrogen', num: 1,  color: 0xf2f3f4, r: 0.30,
       fact: 'One valence electron, one covalent bond — that is why –OH, –NH2 and –SH each carry a single hydrogen.' },
  C: { name: 'Carbon', num: 6,  color: 0x9aa0a8, r: 0.42,
       fact: 'Tetravalent — four valence electrons, four bonds. The carbonyl carbon is the reactive heart of aldehydes, ketones and carboxylic acids.' },
  O: { name: 'Oxygen', num: 8,  color: 0xe8443a, r: 0.44,
       fact: 'Highly electronegative — its pull on shared electrons makes C=O and O–H bonds polar, which is why carbonyls and hydroxyls love water.' },
  N: { name: 'Nitrogen', num: 7,  color: 0x3b7dd8, r: 0.44,
       fact: 'Five valence electrons and a lone pair that readily accepts a proton — that is why amino groups are basic.' },
  P: { name: 'Phosphorus', num: 15, color: 0xe08a2e, r: 0.55,
       fact: 'Below nitrogen on the periodic table. Its phosphate groups form the backbone of DNA and carry energy in ATP.' },
  S: { name: 'Sulfur', num: 16, color: 0xf2d13d, r: 0.55,
       fact: 'In the same column as oxygen but larger and less electronegative. Its –SH groups pair up into disulfide bridges that lock protein shapes.' }
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.35, metalness: 0.1 }, opts));
}

const VIEW_LIST = [
  { id: 'groups', label: '🧪 Functional groups' },
  { id: 'gallery', label: '⚗️ Molecule gallery' }
];

/* 8 functional-group fragments shown as a ring in the groups view.
 * Local coords are centered near the fragment origin; the builder places
 * each fragment on the ring. quizGroup/quizGroupLabel drive quiz + search. */
const FRAGMENTS = [
  { id: 'hydroxyl', label: 'hydroxyl group', sym: '–OH',
    name: 'Hydroxyl group (–OH)',
    atoms: [ { el: 'O', pos: [0, 0, 0] }, { el: 'H', pos: [0.78, 0.34, 0] } ],
    bonds: [[0, 1, 1]],
    desc: ['A hydrogen atom bonded to an oxygen atom — the defining group of alcohols. You will find it everywhere in biomolecules: glucose carries five hydroxyls and ethanol carries one.',
      'Oxygen is far more electronegative than hydrogen, so the O–H bond is polar and can both donate and accept hydrogen bonds. That is why sugars and alcohols mix so readily with water.'],
    exam: 'Polar → hydrogen bonding → hydrophilic. The –OH suffix –ol in a name (ethanol, glycerol) means an alcohol.' },
  { id: 'aldehyde', label: 'aldehyde group', sym: '–CHO',
    name: 'Aldehyde group (–CHO)',
    atoms: [ { el: 'C', pos: [0, 0, 0] }, { el: 'H', pos: [-0.78, 0.30, 0] },
             { el: 'O', pos: [0.85, 0.60, 0] } ],
    bonds: [[0, 1, 1], [0, 2, 2]],
    desc: ['A carbon double-bonded to oxygen and single-bonded to hydrogen — and it always sits at the END of a carbon chain, never in the middle. Glucose in its open-chain form is an aldehyde (an aldose).',
      'The polar C=O can accept hydrogen bonds from water, so small aldehydes dissolve well; many also have sharp, recognizable smells — formaldehyde and vanilla’s vanillin are both aldehydes.'],
    exam: 'Terminal C(=O)H — chain end only. Aldehyde vs. ketone is the glucose vs. fructose difference.' },
  { id: 'ketone', label: 'ketone group', sym: 'C=O',
    name: 'Ketone group (C=O, mid-chain)',
    atoms: [ { el: 'C', pos: [0, 0, 0] }, { el: 'O', pos: [0, 1.02, 0] },
             { el: 'C', pos: [-1.02, -0.38, 0] }, { el: 'C', pos: [1.02, -0.38, 0] } ],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
    desc: ['A carbon double-bonded to oxygen with a carbon on BOTH sides — the carbonyl sits in the middle of the chain. Fructose is the classic ketose: a six-carbon sugar with a mid-chain carbonyl.',
      'Like aldehydes, ketones are polar at the C=O and can accept hydrogen bonds, but they cannot donate them, so they boil lower than alcohols of similar size.'],
    exam: 'Mid-chain C=O — a ketone. If the carbonyl carbon also holds a hydrogen, it is an aldehyde instead.' },
  { id: 'carboxyl', label: 'carboxyl group', sym: '–COOH',
    name: 'Carboxyl group (–COOH)',
    atoms: [ { el: 'C', pos: [0, 0, 0] }, { el: 'O', pos: [0.18, 0.98, 0] },
             { el: 'O', pos: [0.92, -0.48, 0] }, { el: 'H', pos: [1.62, -0.70, 0] } ],
    bonds: [[0, 1, 2], [0, 2, 1], [2, 3, 1]],
    desc: ['A carbon double-bonded to one oxygen and single-bonded to an –OH. This is the acidic end of every amino acid and every fatty acid.',
      'In water it readily gives up its hydrogen as H⁺, becoming a negatively charged carboxylate (–COO⁻). That released proton is exactly why carboxylic acids — like acetic acid in vinegar — lower pH.'],
    exam: 'ACIDIC — donates H⁺ → becomes COO⁻. Carboxyl = the "acid" in amino acids and fatty acids.' },
  { id: 'amino', label: 'amino group', sym: '–NH2',
    name: 'Amino group (–NH2)',
    atoms: [ { el: 'N', pos: [0, 0, 0] }, { el: 'H', pos: [-0.62, 0.56, 0] },
             { el: 'H', pos: [0.62, 0.56, 0] } ],
    bonds: [[0, 1, 1], [0, 2, 1]],
    desc: ['A nitrogen bonded to two hydrogens, attached to a carbon — the basic end of every amino acid. Nitrogen’s lone pair is hungry for a proton.',
      'At cellular pH the amino group usually accepts an H⁺ and becomes –NH₃⁺, carrying a positive charge. That charge is why amino acids and proteins interact so strongly with water and ions.'],
    exam: 'BASIC — accepts H⁺ → becomes NH₃⁺ (positive at cellular pH). Amino = the "amino" in amino acids.' },
  { id: 'phosphate', label: 'phosphate group', sym: '–OPO3',
    name: 'Phosphate group (–OPO3)',
    atoms: [ { el: 'P', pos: [0, 0, 0] }, { el: 'O', pos: [-1.02, 0, 0] },
             { el: 'O', pos: [0.38, 0.88, 0] }, { el: 'O', pos: [0.38, -0.88, 0] },
             { el: 'O', pos: [0.38, 0, 0.88] } ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    desc: ['A phosphorus surrounded by four oxygens, usually drawn attached to a molecule through one bridging oxygen. ATP — the cell’s energy currency — carries three phosphate groups in a row.',
      'Phosphates can release H⁺ (they are acidic) and carry negative charges that repel each other, which is why snapping a phosphate off ATP releases usable energy. DNA’s backbone is an alternating chain of phosphates and sugars.'],
    exam: 'Acidic and negatively charged — in ATP, the DNA/RNA backbone, and phospholipids. Breaking phosphate bonds releases energy.' },
  { id: 'sulfhydryl', label: 'sulfhydryl group', sym: '–SH',
    name: 'Sulfhydryl group (–SH)',
    atoms: [ { el: 'S', pos: [0, 0, 0] }, { el: 'H', pos: [0.88, 0.28, 0] } ],
    bonds: [[0, 1, 1]],
    desc: ['A sulfur bonded to a hydrogen — sulfur sits in the same periodic-table column as oxygen but is larger and less electronegative. You will meet it in the amino acid cysteine and in coenzyme A.',
      'Two sulfhydryls can oxidize to form a disulfide bridge (–S–S–), a strong covalent cross-link that locks a protein’s folded shape. Hair perms work by breaking and re-forming these bridges.'],
    exam: '–SH pairs form disulfide bridges (–S–S–) that stabilize protein folding. Think cysteine.' },
  { id: 'methyl', label: 'methyl group', sym: '–CH3',
    name: 'Methyl group (–CH3)',
    atoms: [ { el: 'C', pos: [0, 0, 0] }, { el: 'H', pos: [0.68, 0.58, 0] },
             { el: 'H', pos: [-0.28, -0.72, 0.42] }, { el: 'H', pos: [-0.28, -0.30, -0.78] } ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
    desc: ['A carbon with three hydrogens, usually capping the end of a chain. Methyl groups are completely nonpolar — they cannot hydrogen-bond, so they make regions of molecules hydrophobic.',
      'Small but mighty in regulation: attaching methyl groups to DNA (methylation) is a key epigenetic switch that can silence genes. Fats are built from long hydrocarbon tails tipped with methyls.'],
    exam: 'NONPOLAR → hydrophobic. –CH₃ added to DNA = methylation, an epigenetic on/off switch.' }
];

/* Molecule gallery. Every atom becomes a clickable part with `el` (no
 * quizGroup) so the quiz can ask "click an oxygen/nitrogen atom". All
 * heteroatoms are included even in the simplified molecules. */
const H3 = [[0.45, 0.78, 0.35], [-0.58, 0.42, -0.55], [0.12, -0.38, 0.86]];
function methylH(c) {
  return H3.map(o => ({ el: 'H', pos: [c[0] + o[0], c[1] + o[1], c[2] + o[2]] }));
}

const GALLERY = [
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH',
    headline: 'Simplest alcohol — polar thanks to its –OH',
    desc: ['Two carbons, six hydrogens, and one hydroxyl group. That single –OH makes ethanol polar enough to mix freely with water, while its ethyl end can cozy up to nonpolar substances — which is why it works as both a drink and a solvent.',
      'Your liver oxidizes ethanol to acetaldehyde (an aldehyde!) and then to acetic acid, a carboxylic acid. Two functional groups from the ring above appear in one metabolic pathway.'],
    exam: '–OH makes it polar and water-miscible. The C–C–O skeleton shows how functional groups attach to carbon chains.',
    atomNotes: {
      C: 'The two carbons form the skeleton that the hydroxyl group hangs off of.',
      O: 'This oxygen’s hydroxyl group is what makes ethanol polar and able to mix with water.',
      H: 'Eight hydrogens here: six around the carbons, plus the one on oxygen that can hydrogen-bond.'
    },
    atoms: [
      { el: 'C', pos: [-1.15, 0, 0] }, { el: 'C', pos: [0.10, 0, 0] },
      { el: 'O', pos: [1.30, 0.20, 0] },
      { el: 'H', pos: [-1.72, 0.80, 0] }, { el: 'H', pos: [-1.72, -0.50, 0.66] },
      { el: 'H', pos: [-1.72, -0.50, -0.66] },
      { el: 'H', pos: [0.10, 0.82, 0.44] }, { el: 'H', pos: [0.10, -0.56, 0.62] },
      { el: 'H', pos: [1.96, 0.62, 0] }
    ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 8, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1]] },
  { id: 'benzene', name: 'Benzene', formula: 'C₆H₆',
    headline: 'Aromatic ring — six carbons sharing one electron cloud',
    desc: ['Six carbons in a flat hexagon, each holding one hydrogen. The six p-orbitals merge into a single delocalized electron ring above and below the plane — this “aromatic” sharing makes benzene far more stable than three isolated double bonds.',
      'Benzene is the parent of all aromatic compounds: toluene, phenol, and the rings inside aspirin, caffeine, and the DNA bases are all decorated benzenes.'],
    exam: 'Flat hexagon + delocalized π electrons = aromatic. Alternating double bonds are just one way to draw a shared cloud.',
    atomNotes: {
      C: 'Each carbon bonds to two neighbors and one hydrogen, sharing its fourth electron in the aromatic cloud.',
      H: 'Each hydrogen caps a ring carbon, pointing outward from the hexagon.'
    },
    atoms: (() => {
      const out = [];
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        out.push({ el: 'C', pos: [Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15] });
      }
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        out.push({ el: 'H', pos: [Math.cos(a) * 1.92, 0, Math.sin(a) * 1.92] });
      }
      return out;
    })(),
    bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
            [0, 6, 1], [1, 7, 1], [2, 8, 1], [3, 9, 1], [4, 10, 1], [5, 11, 1]] },
  { id: 'aspirin', name: 'Aspirin (simplified)', formula: 'C₉H₈O₄',
    headline: 'Acetylsalicylic acid — an ester and a carboxylic acid on a benzene ring',
    desc: ['Aspirin is a benzene ring carrying two groups: an acetyl ester (–OCOCH₃) and a carboxylic acid (–COOH). It is made by acetylating salicylic acid, a compound willow bark and other plants produce to fight infection.',
      'It relieves pain, fever, and inflammation by irreversibly blocking COX enzymes, which shuts down prostaglandin synthesis. Low daily doses also keep platelets from clumping, preventing clots.'],
    exam: 'The ester group is what makes it aspirin instead of salicylic acid; the carboxylic acid makes it acidic (take with food).',
    atomNotes: {
      C: 'Nine carbons: six in the benzene ring, one in the carboxylic acid, two in the acetyl ester.',
      O: 'Four oxygens: two in the carboxylic acid and two in the ester group that makes this aspirin.',
      H: 'Eight hydrogens: four on the ring, three on the methyl, one on the carboxylic acid.'
    },
    atoms: (() => {
      const out = [];
      for (let i = 0; i < 6; i++) { // benzene ring in the xz-plane
        const a = i / 6 * Math.PI * 2;
        out.push({ el: 'C', pos: [Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15] });
      }
      // carboxylic acid substituent on ring atom 0
      out.push({ el: 'C', pos: [2.05, 0, 0] });          // 6
      out.push({ el: 'O', pos: [2.72, 0.72, 0] });       // 7 carbonyl O
      out.push({ el: 'O', pos: [2.72, -0.72, 0] });      // 8 hydroxyl O
      out.push({ el: 'H', pos: [3.40, -0.95, 0] });      // 9
      // acetyl ester substituent on ring atom 1
      out.push({ el: 'O', pos: [1.05, 0, 1.818] });      // 10 bridging O
      out.push({ el: 'C', pos: [1.575, 0, 2.727] });     // 11 acetyl C
      out.push({ el: 'O', pos: [2.325, 0.55, 2.877] });  // 12 carbonyl O
      out.push({ el: 'C', pos: [1.05, -0.10, 3.35] });   // 13 methyl C
      methylH([1.05, -0.10, 3.35]).forEach(h => out.push(h)); // 14,15,16
      // ring hydrogens on atoms 2-5
      [[-0.95, 0, 1.647], [-1.90, 0, 0], [-0.95, 0, -1.647], [0.95, 0, -1.647]]
        .forEach(p => out.push({ el: 'H', pos: p }));    // 17,18,19,20
      return out;
    })(),
    bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
            [0, 6, 1], [6, 7, 2], [6, 8, 1], [8, 9, 1],
            [1, 10, 1], [10, 11, 1], [11, 12, 2], [11, 13, 1],
            [13, 14, 1], [13, 15, 1], [13, 16, 1],
            [2, 17, 1], [3, 18, 1], [4, 19, 1], [5, 20, 1]] },
  { id: 'caffeine', name: 'Caffeine (simplified)', formula: 'C₈H₁₀N₄O₂',
    headline: 'Methylxanthine — fused double ring with four nitrogens',
    desc: ['Caffeine is a purine alkaloid: two fused rings containing four nitrogens, decorated with three methyl groups and two carbonyl oxygens. Coffee, tea, and cacao plants evolved it as a natural pesticide.',
      'It keeps you alert by blocking adenosine receptors in the brain. Adenosine is the “sleep pressure” signal, so caffeine masks tiredness rather than removing it — the crash comes when it wears off.'],
    exam: 'Alkaloid = nitrogen-containing plant compound. Blocks adenosine receptors → masks sleepiness, does not erase it.',
    atomNotes: {
      C: 'Eight carbons: five in the fused rings and three in the methyl groups.',
      N: 'Four nitrogens in the fused rings — they are what make caffeine an alkaloid.',
      O: 'Two carbonyl oxygens on the six-membered ring.',
      H: 'Ten hydrogens: nine on the three methyl groups and one on the five-membered ring.'
    },
    atoms: (() => {
      const out = [
        { el: 'N', pos: [0, 1.15, 0] },          // 0 N1
        { el: 'C', pos: [-0.996, 0.575, 0] },   // 1 C2 (carbonyl)
        { el: 'N', pos: [-0.996, -0.575, 0] },  // 2 N3
        { el: 'C', pos: [0, -1.15, 0] },        // 3 C4 (fused)
        { el: 'C', pos: [0.996, -0.575, 0] },   // 4 C5 (fused)
        { el: 'C', pos: [0.996, 0.575, 0] },    // 5 C6 (carbonyl)
        { el: 'O', pos: [-1.905, 1.10, 0] },    // 6 carbonyl O
        { el: 'O', pos: [1.905, 1.10, 0] },     // 7 carbonyl O
        { el: 'N', pos: [0.397, -1.787, 0] },   // 8 N7
        { el: 'C', pos: [1.073, -1.858, 0] },   // 9 C8
        { el: 'N', pos: [1.349, -1.237, 0] },   // 10 N9
        { el: 'C', pos: [0, 2.10, 0] },         // 11 methyl on N1
        { el: 'C', pos: [-1.819, -1.05, 0] },   // 12 methyl on N3
        { el: 'C', pos: [0.445, -2.69, 0] },    // 13 methyl on N7
        { el: 'H', pos: [1.473, -2.551, 0] }    // 14 ring H on C8
      ];
      methylH([0, 2.10, 0]).forEach(h => out.push(h));        // 15,16,17
      methylH([-1.819, -1.05, 0]).forEach(h => out.push(h));  // 18,19,20
      methylH([0.445, -2.69, 0]).forEach(h => out.push(h));   // 21,22,23
      return out;
    })(),
    bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 1], [5, 0, 2],
            [1, 6, 2], [5, 7, 2],
            [3, 8, 1], [8, 9, 2], [9, 10, 1], [10, 4, 1],
            [0, 11, 1], [2, 12, 1], [8, 13, 1], [9, 14, 1],
            [11, 15, 1], [11, 16, 1], [11, 17, 1],
            [12, 18, 1], [12, 19, 1], [12, 20, 1],
            [13, 21, 1], [13, 22, 1], [13, 23, 1]] }
];

export function buildOchem() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  let parts = [];
  let bondMeshes = [];
  let bondMat = null;
  let viewId = 'groups';
  let currentId = 'ethanol';
  let lastT = 0;

  function clearContainer() {
    container.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    container.clear();
    parts = []; bondMeshes = []; bondMat = null;
  }

  function newBondMat() {
    bondMat = new THREE.MeshStandardMaterial({
      color: 0xbdc3c7, roughness: 0.4, metalness: 0.3, transparent: true
    });
  }

  /* Bond cylinders between absolute positions; decorative (noPick) like molecules.js. */
  function addBonds(atomPos, bonds, els) {
    bonds.forEach(([i, j, order]) => {
      const pa = atomPos[i], pb = atomPos[j];
      const dir = pb.clone().sub(pa);
      const len = Math.max(
        dir.length() - ELEMENTS[els[i]].r * 0.35 - ELEMENTS[els[j]].r * 0.35, 0.05);
      const mid = pa.clone().lerp(pb, 0.5);
      const perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      if (perp.lengthSq() < 1e-6) perp.set(1, 0, 0);
      (order === 2 ? [0.10, -0.10] : [0]).forEach(o => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, len, 14), bondMat);
        m.position.copy(mid).addScaledVector(perp, o);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        m.userData.noPick = true;
        container.add(m); bondMeshes.push(m);
      });
    });
  }

  function buildGroupsView() {
    newBondMat();
    const R = 2.4;
    FRAGMENTS.forEach((f, fi) => {
      const a = fi / FRAGMENTS.length * Math.PI * 2 + Math.PI / 8;
      const center = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
      const atomPos = f.atoms.map(at => new THREE.Vector3(...at.pos).add(center));
      const p = {
        id: 'fg-' + f.id,
        system: 'functional-group',
        quizGroup: f.id,          // quiz/search key — never `el` on fragment parts
        quizGroupLabel: f.label,
        info: { name: f.name, tag: 'Functional group', desc: f.desc, exam: f.exam },
        group: new THREE.Group(),
        basePos: center.clone(),
        explodeDir: new THREE.Vector3(Math.cos(a), 0.35, Math.sin(a)).normalize(),
        explodeDist: 1.4
      };
      f.atoms.forEach((at, i) => {
        const E = ELEMENTS[at.el];
        const s = new THREE.Mesh(new THREE.SphereGeometry(E.r, 28, 22), mat(E.color));
        s.position.copy(atomPos[i]).sub(center);
        p.group.add(s);
      });
      p.group.position.copy(center);
      parts.push(p); container.add(p.group);
      addBonds(atomPos, f.bonds, f.atoms.map(at => at.el));
    });
  }

  function galleryMol() {
    return GALLERY.find(m => m.id === currentId) || GALLERY[0];
  }

  function buildGalleryView() {
    newBondMat();
    const mol = galleryMol();
    const center = new THREE.Vector3();
    mol.atoms.forEach(a => center.add(new THREE.Vector3(...a.pos)));
    center.divideScalar(mol.atoms.length);
    mol.atoms.forEach((a, i) => {
      const E = ELEMENTS[a.el];
      const pos = new THREE.Vector3(...a.pos);
      const p = {
        id: 'atom-' + i,
        system: 'atom',
        el: a.el, // element symbol — quiz matching + search; never quizGroup on atoms
        info: {
          name: `${E.name} (${a.el})`,
          tag: `Element · atomic number ${E.num} — in ${mol.name}`,
          desc: [E.fact, mol.atomNotes[a.el]],
          exam: mol.exam
        },
        group: new THREE.Group(),
        basePos: pos.clone(),
        explodeDir: pos.clone().sub(center),
        explodeDist: 1.5
      };
      if (p.explodeDir.lengthSq() < 1e-6) p.explodeDir.set(0, 1, 0);
      p.explodeDir.normalize();
      const s = new THREE.Mesh(new THREE.SphereGeometry(E.r, 28, 22), mat(E.color));
      if (a.el === 'H') s.material = mat(E.color, { roughness: 0.6 });
      p.group.add(s);
      p.group.position.copy(pos);
      parts.push(p); container.add(p.group);
    });
    addBonds(mol.atoms.map(a => new THREE.Vector3(...a.pos)),
             mol.bonds, mol.atoms.map(a => a.el));
  }

  function setView(id) {
    viewId = (id === 'gallery') ? 'gallery' : 'groups';
    api.showMolecules = (viewId === 'gallery');
    clearContainer();
    if (viewId === 'gallery') buildGalleryView();
    else buildGroupsView();
    applyExplode(lastT);
    return viewId;
  }

  function setMolecule(id) {
    currentId = GALLERY.some(m => m.id === id) ? id : GALLERY[0].id;
    if (viewId === 'gallery') {
      clearContainer();
      buildGalleryView();
      applyExplode(lastT);
    }
    return currentId;
  }

  function getMoleculeInfo() {
    if (viewId !== 'gallery') return null;
    const m = galleryMol();
    return { id: m.id, name: m.name, formula: m.formula, tag: 'Molecule',
             headline: m.headline, desc: m.desc, exam: m.exam };
  }

  function applyExplode(t) {
    lastT = t;
    parts.forEach(p => {
      p.group.position.copy(p.basePos).addScaledVector(p.explodeDir, t * p.explodeDist);
    });
    bondMeshes.forEach(b => { b.material.opacity = Math.max(0.06, 1 - t * 0.94); });
  }

  const api = {
    id: 'ochem',
    label: 'Ochem Studio',
    group,
    get parts() { return parts; },
    getParts: () => parts,
    systems: [],
    viewList: VIEW_LIST,
    setView,
    getViewId: () => viewId,
    showMolecules: false,
    moleculeList: GALLERY.map(m => ({ id: m.id, name: m.name, formula: m.formula })),
    setMolecule,
    getMoleculeInfo,
    applyExplode,
    getContextId: () => (viewId === 'gallery' ? 'gallery:' + currentId : 'groups'),
    camera: { pos: [5.2, 3.0, 6.2], target: [0, 0, 0] },
    explodeScale: 1.0
  };
  setView('groups');
  return api;
}
