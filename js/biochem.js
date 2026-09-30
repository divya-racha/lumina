/* Lumina — Biochem Corner atlas.
 * The 20 amino acids, built on demand: a shared backbone (amino group,
 * alpha carbon, carboxyl group) plus the R-group side chain, each a clickable
 * part registered with quizGroup/quizGroupLabel (no el). Side-chain atoms
 * follow the stylized per-amino-acid table below.
 * Content grounded in OpenStax Biology 2e, Chapter 3 (Biological Macromolecules).
 */
import * as THREE from 'three';

const ELEMENTS = {
  H: { name: 'Hydrogen', num: 1,  color: 0xf2f3f4, r: 0.30,
       fact: 'One valence electron, one covalent bond.' },
  C: { name: 'Carbon', num: 6,  color: 0x9aa0a8, r: 0.42,
       fact: 'Tetravalent — the alpha carbon bonds to the amino group, the carboxyl group, a hydrogen, and the side chain.' },
  O: { name: 'Oxygen', num: 8,  color: 0xe8443a, r: 0.44,
       fact: 'Highly electronegative — the carboxyl oxygens carry the negative charge of acidic side chains.' },
  N: { name: 'Nitrogen', num: 7,  color: 0x3b7dd8, r: 0.44,
       fact: 'Five valence electrons; its lone pair accepts protons, which is why amino groups and Lys/Arg/His side chains are basic.' },
  S: { name: 'Sulfur', num: 16, color: 0xf2d13d, r: 0.55,
       fact: 'Below oxygen on the periodic table. Cysteine’s –SH groups pair into disulfide bridges that staple proteins together.' }
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness: 0.35, metalness: 0.1 }, opts));
}

const GROUPS = [
  { id: 'nonpolar', label: 'Nonpolar' },
  { id: 'polar',    label: 'Polar (uncharged)' },
  { id: 'acidic',   label: 'Acidic' },
  { id: 'basic',    label: 'Basic' }
];

/* Shared backbone, laid out horizontally. Indices 0-7; side-chain atoms
 * are appended from index 8. Bonds reference the combined index space. */
const BB = [
  { el: 'N', pos: [-1.55, 0, 0],    part: 'amino' },    // 0
  { el: 'H', pos: [-2.20, 0.50, 0.15], part: 'amino' }, // 1
  { el: 'H', pos: [-2.20, -0.50, -0.15], part: 'amino' },// 2
  { el: 'C', pos: [0, 0, 0],        part: 'alpha' },    // 3 alpha carbon
  { el: 'H', pos: [0, -0.95, 0],    part: 'alpha' },    // 4
  { el: 'C', pos: [1.55, 0, 0],     part: 'carboxyl' }, // 5
  { el: 'O', pos: [2.20, 0.80, 0],  part: 'carboxyl' }, // 6
  { el: 'O', pos: [2.20, -0.80, 0], part: 'carboxyl' }  // 7
];
const BB_BONDS = [[0, 3, 1], [3, 5, 1], [5, 6, 2], [5, 7, 1], [0, 1, 1], [0, 2, 1], [3, 4, 1]];
// alpha-carbon -> beta-carbon bond is added dynamically as [3, 8, 1]

/* Side-chain table. atoms: relative indices (beta carbon = 0, absolute 8).
 * bonds: [relA, relB, order] in side-chain index space. xBonds: absolute
 * [a, b, order] in the combined backbone+sidechain space (used by Proline). */
const AMINO_ACIDS = [
  { id: 'gly', name: 'Glycine', code3: 'Gly', code1: 'G', group: 'nonpolar',
    headline: 'Nonpolar · smallest — hydrophobic',
    atoms: [ { el: 'H', pos: [0, 1.00, 0] } ],
    bonds: [],
    desc: ['Glycine’s side chain is a single hydrogen atom — the smallest possible, which makes glycine the most flexible amino acid.',
      'It fits into tight turns of the protein backbone where no other side chain could squeeze in.'],
    exam: 'Smallest amino acid; its flexibility lets protein chains make tight turns.' },
  { id: 'ala', name: 'Alanine', code3: 'Ala', code1: 'A', group: 'nonpolar',
    headline: 'Nonpolar · simple methyl group — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] } ],
    bonds: [],
    desc: ['Alanine carries just a methyl (–CH₃) group — small, nonpolar, and chemically quiet.',
      'It is a favorite of the alpha helix, and “alanine scanning” mutates other residues to alanine to test how important they are.'],
    exam: 'Small nonpolar side chain — common in alpha helices; alanine scanning tests residue importance.' },
  { id: 'val', name: 'Valine', code3: 'Val', code1: 'V', group: 'nonpolar',
    headline: 'Nonpolar · branched — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [-0.72, 1.62, 0] },
             { el: 'C', pos: [0.72, 1.62, 0] } ],
    bonds: [[0, 1, 1], [0, 2, 1]],
    desc: ['Valine’s side chain branches into two methyl groups right at the beta carbon, making it bulky near the backbone.',
      'Branched, bulky, and hydrophobic — it packs into protein interiors and favors beta sheets over helices.'],
    exam: 'Branched hydrophobic side chain; prefers protein interiors and β-sheets.' },
  { id: 'leu', name: 'Leucine', code3: 'Leu', code1: 'L', group: 'nonpolar',
    headline: 'Nonpolar · bulky branched — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'C', pos: [-0.75, 2.42, 0] }, { el: 'C', pos: [0.75, 2.42, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [1, 3, 1]],
    desc: ['Leucine has a four-carbon branched side chain — one of the most common amino acids in proteins.',
      'Its bulky hydrophobic side chain drives leucine zippers, the dimerization motifs in many transcription factors.'],
    exam: 'Very common hydrophobic residue; leucine zippers zip DNA-binding proteins together.' },
  { id: 'ile', name: 'Isoleucine', code3: 'Ile', code1: 'I', group: 'nonpolar',
    headline: 'Nonpolar · branched — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.92, 0] },
             { el: 'C', pos: [-0.80, 1.38, 0.25] }, { el: 'C', pos: [0, 2.82, 0] } ],
    bonds: [[0, 1, 1], [0, 2, 1], [1, 3, 1]],
    desc: ['Isoleucine is a structural isomer of leucine — same atoms, with the branch one carbon closer to the backbone.',
      'Like valine and leucine, it is hydrophobic and packs tightly into protein cores.'],
    exam: 'Isomer of leucine; hydrophobic core-packing residue. Do not confuse the two on an exam.' },
  { id: 'met', name: 'Methionine', code3: 'Met', code1: 'M', group: 'nonpolar',
    headline: 'Nonpolar · contains sulfur — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'S', pos: [0.78, 2.52, 0] }, { el: 'C', pos: [-0.05, 3.18, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1]],
    desc: ['Methionine’s side chain ends in a thioether (–CH₂–CH₂–S–CH₃) — sulfur buried inside a hydrophobic chain.',
      'Every protein starts here: AUG, the start codon, codes for methionine, so it is the first residue of nearly all polypeptides.'],
    exam: 'START-codon amino acid (AUG) — initiates nearly every polypeptide.' },
  { id: 'phe', name: 'Phenylalanine', code3: 'Phe', code1: 'F', group: 'nonpolar',
    headline: 'Nonpolar · aromatic ring — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] },
             { el: 'C', pos: [0, 1.30, 0] }, { el: 'C', pos: [0.736, 1.725, 0] },
             { el: 'C', pos: [0.736, 2.575, 0] }, { el: 'C', pos: [0, 3.00, 0] },
             { el: 'C', pos: [-0.736, 2.575, 0] }, { el: 'C', pos: [-0.736, 1.725, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 2], [4, 5, 1], [5, 6, 2], [6, 1, 1]],
    desc: ['Phenylalanine carries a benzene ring — flat, aromatic, and strongly hydrophobic.',
      'Aromatic rings stack against each other (π-stacking) to stabilize protein cores; a defective phenylalanine-processing enzyme causes PKU.'],
    exam: 'Aromatic (benzene) side chain — one of the three aromatics: Phe, Tyr, Trp.' },
  { id: 'trp', name: 'Tryptophan', code3: 'Trp', code1: 'W', group: 'nonpolar',
    headline: 'Nonpolar · largest, aromatic — hydrophobic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] },
             { el: 'C', pos: [0, 1.30, 0] }, { el: 'C', pos: [0.736, 1.725, 0] },
             { el: 'C', pos: [0.736, 2.575, 0] }, { el: 'C', pos: [0, 3.00, 0] },
             { el: 'C', pos: [-0.736, 2.575, 0] }, { el: 'C', pos: [-0.736, 1.725, 0] },
             { el: 'C', pos: [1.45, 1.90, 0] }, { el: 'N', pos: [1.85, 2.30, 0] },
             { el: 'C', pos: [1.45, 2.62, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 2], [4, 5, 1], [5, 6, 2], [6, 1, 1],
            [2, 7, 1], [7, 8, 2], [8, 9, 1], [9, 3, 1]],
    desc: ['Tryptophan has the bulkiest side chain of all: a fused double ring (indole) containing a nitrogen.',
      'It absorbs UV light — used to measure protein concentration — and it is the precursor of serotonin and melatonin.'],
    exam: 'Largest amino acid; aromatic; precursor of serotonin — rare, so its position is highly conserved.' },
  { id: 'pro', name: 'Proline', code3: 'Pro', code1: 'P', group: 'nonpolar',
    headline: 'Nonpolar · cyclic — helix breaker',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [-0.72, 1.52, 0.35] },
             { el: 'C', pos: [-1.38, 0.82, 0.15] } ],
    bonds: [[0, 1, 1], [1, 2, 1]],
    xBonds: [[10, 0, 1]], // side-chain tip bonds back to the backbone nitrogen
    desc: ['Proline’s side chain loops back and bonds to its own amino nitrogen, forming a rigid ring — the only cyclic amino acid.',
      'The ring locks the backbone angle and removes the N–H used in helix hydrogen bonding, so proline kinks and breaks alpha helices.'],
    exam: 'Cyclic + rigid = HELIX BREAKER. The only amino acid whose side chain bonds back to its own nitrogen.' },
  { id: 'ser', name: 'Serine', code3: 'Ser', code1: 'S', group: 'polar',
    headline: 'Polar (uncharged) · hydroxyl — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'O', pos: [0.18, 1.92, 0] } ],
    bonds: [[0, 1, 1]],
    desc: ['Serine carries a small –CH₂OH group — polar and ready to hydrogen-bond with water.',
      'Its hydroxyl is a phosphorylation site: kinases attach phosphate here to switch proteins on and off.'],
    exam: '–OH = phosphorylation site. Small and polar — common on protein surfaces.' },
  { id: 'thr', name: 'Threonine', code3: 'Thr', code1: 'T', group: 'polar',
    headline: 'Polar (uncharged) · hydroxyl — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'O', pos: [-0.72, 1.58, 0] },
             { el: 'C', pos: [0.72, 1.62, 0] } ],
    bonds: [[0, 1, 1], [0, 2, 1]],
    desc: ['Threonine adds a methyl branch to serine’s –CH₂OH, keeping the polar hydroxyl.',
      'Like serine and tyrosine, its –OH can be phosphorylated for cell signaling.'],
    exam: 'Polar –OH = phosphorylation site (remember the trio: Ser, Thr, Tyr).' },
  { id: 'cys', name: 'Cysteine', code3: 'Cys', code1: 'C', group: 'polar',
    headline: 'Polar (uncharged) · sulfhydryl — forms disulfides',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'S', pos: [0.38, 1.98, 0] } ],
    bonds: [[0, 1, 1]],
    desc: ['Cysteine’s –CH₂SH group carries a reactive sulfhydryl — sulfur’s version of a hydroxyl.',
      'Two cysteines oxidize to form a disulfide bridge (–S–S–), a covalent staple that locks a protein’s folded shape, as in insulin.'],
    exam: 'Cys–Cys DISULFIDE bridges (–S–S–) stabilize tertiary protein structure.' },
  { id: 'tyr', name: 'Tyrosine', code3: 'Tyr', code1: 'Y', group: 'polar',
    headline: 'Polar (uncharged) · aromatic + hydroxyl — amphipathic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] },
             { el: 'C', pos: [0, 1.30, 0] }, { el: 'C', pos: [0.736, 1.725, 0] },
             { el: 'C', pos: [0.736, 2.575, 0] }, { el: 'C', pos: [0, 3.00, 0] },
             { el: 'C', pos: [-0.736, 2.575, 0] }, { el: 'C', pos: [-0.736, 1.725, 0] },
             { el: 'O', pos: [0, 3.92, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 2], [4, 5, 1], [5, 6, 2], [6, 1, 1], [4, 7, 1]],
    desc: ['Tyrosine is phenylalanine plus a para-hydroxyl — an aromatic ring that is also polar.',
      'That –OH makes it the third phosphorylation site (Ser/Thr/Tyr) and the starting point for thyroid hormone and dopamine.'],
    exam: 'Aromatic AND polar (–OH): phosphorylation site; precursor of dopamine and thyroid hormone.' },
  { id: 'asn', name: 'Asparagine', code3: 'Asn', code1: 'N', group: 'polar',
    headline: 'Polar (uncharged) · amide — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0.12, 1.92, 0] },
             { el: 'O', pos: [0.88, 2.34, 0] }, { el: 'N', pos: [-0.64, 2.34, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [1, 3, 1]],
    desc: ['Asparagine ends in an amide group (–CONH₂) — polar and an excellent hydrogen-bond donor and acceptor.',
      'Its amide nitrogen is where N-linked glycosylation attaches sugar chains to proteins.'],
    exam: 'Amide side chain — heavy H-bonding; N-linked glycosylation attaches sugars to Asn.' },
  { id: 'gln', name: 'Glutamine', code3: 'Gln', code1: 'Q', group: 'polar',
    headline: 'Polar (uncharged) · amide — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'C', pos: [0.12, 2.80, 0] }, { el: 'O', pos: [0.88, 3.22, 0] },
             { el: 'N', pos: [-0.64, 3.22, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 2], [2, 4, 1]],
    desc: ['Glutamine is asparagine with one extra CH₂ — a longer polar amide side chain.',
      'It shuttles nitrogen safely through the blood and is the most abundant free amino acid in muscle.'],
    exam: 'Longer amide than Asn — nitrogen shuttle in blood. Do not confuse with glutamate (Glu).' },
  { id: 'asp', name: 'Aspartic acid', code3: 'Asp', code1: 'D', group: 'acidic',
    headline: 'Acidic · negatively charged at pH 7 — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0.12, 1.92, 0] },
             { el: 'O', pos: [0.88, 2.34, 0] }, { el: 'O', pos: [-0.64, 2.34, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [1, 3, 1]],
    desc: ['Aspartic acid’s side chain ends in a carboxyl group that loses its H⁺ at cellular pH, leaving a –1 charge.',
      'That negative charge lets it grip metal ions (as in many enzyme active sites) and form salt bridges with lysine or arginine.'],
    exam: 'ACIDIC = negative at pH 7. Asp/Glu (–) pair with Lys/Arg/His (+) in salt bridges.' },
  { id: 'glu', name: 'Glutamic acid', code3: 'Glu', code1: 'E', group: 'acidic',
    headline: 'Acidic · negatively charged at pH 7 — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'C', pos: [0.12, 2.80, 0] }, { el: 'O', pos: [0.88, 3.22, 0] },
             { el: 'O', pos: [-0.64, 3.22, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 2], [2, 4, 1]],
    desc: ['Glutamic acid is aspartate with one extra CH₂ — a longer negatively charged side chain.',
      'Beyond proteins, free glutamate is the brain’s main excitatory neurotransmitter (and the flavor of umami/MSG).'],
    exam: 'ACIDIC = negative at pH 7; also the excitatory neurotransmitter glutamate.' },
  { id: 'lys', name: 'Lysine', code3: 'Lys', code1: 'K', group: 'basic',
    headline: 'Basic · positively charged at pH 7 — hydrophilic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'C', pos: [0.15, 2.80, 0] }, { el: 'C', pos: [-0.10, 3.68, 0] },
             { el: 'N', pos: [0.30, 4.52, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1]],
    desc: ['Lysine’s long side chain ends in an amino group that picks up H⁺ at cellular pH, carrying a +1 charge.',
      'Histone tails are rich in lysine: the positive charges grip negatively charged DNA, and acetylating them loosens that grip to switch genes on.'],
    exam: 'BASIC = positive at pH 7. Lys/Arg/His (+) pair with Asp/Glu (–); histone lysines control DNA packing.' },
  { id: 'arg', name: 'Arginine', code3: 'Arg', code1: 'R', group: 'basic',
    headline: 'Basic · positively charged at pH 7 — most basic',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] }, { el: 'C', pos: [0, 1.90, 0] },
             { el: 'C', pos: [0.15, 2.80, 0] }, { el: 'C', pos: [-0.10, 3.68, 0] },
             { el: 'N', pos: [0.62, 4.20, 0.20] }, { el: 'N', pos: [-0.82, 4.20, -0.20] },
             { el: 'N', pos: [-0.10, 4.58, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [3, 5, 1], [3, 6, 2]],
    desc: ['Arginine ends in a guanidinium group whose positive charge is spread over three nitrogens — the most basic side chain.',
      'Its charge is delocalized by resonance, so it stays protonated even in harsh environments and forms the strongest salt bridges.'],
    exam: 'Most basic amino acid — guanidinium charge delocalized over 3 N’s; forms the strongest salt bridges.' },
  { id: 'his', name: 'Histidine', code3: 'His', code1: 'H', group: 'basic',
    headline: 'Basic · imidazole — charge flips near pH 7',
    atoms: [ { el: 'C', pos: [0, 1.00, 0] },
             { el: 'C', pos: [0, 1.40, 0] }, { el: 'N', pos: [0.761, 1.953, 0] },
             { el: 'C', pos: [0.470, 2.847, 0] }, { el: 'N', pos: [-0.470, 2.847, 0] },
             { el: 'C', pos: [-0.761, 1.953, 0] } ],
    bonds: [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 1], [4, 5, 2], [5, 1, 1]],
    desc: ['Histidine’s imidazole ring has a pKa near 6, so it flips between neutral and +1 right around cellular pH.',
      'That makes it the perfect acid–base catalyst: enzyme active sites (like chymotrypsin’s) use histidine to donate and accept protons during reactions.'],
    exam: 'pKa ≈ 6 — the only side chain that titrates near pH 7; classic enzyme acid–base catalyst.' }
];

/* ---------------- Krebs cycle view (OpenStax Biology 2e, Ch. 7) ------------- */
/* Node info: clickable intermediates around the cycle. */
const KREBS_INFO = {
  'k-oxaloacetate': {
    name: 'Oxaloacetate', tag: 'Krebs cycle',
    desc: ['Oxaloacetate is the 4-carbon molecule that starts and ends every turn of the cycle — it is consumed in step 1 and regenerated in step 8.',
      'Because the starting material is remade, the pathway is a true cycle: it keeps turning as long as acetyl-CoA arrives.'],
    exam: '4 carbons, regenerated each turn. Starting material AND end product — that is why it is a cycle.' },
  'k-citrate': {
    name: 'Citrate', tag: 'Krebs cycle',
    desc: ['Citrate is the 6-carbon molecule formed when acetyl-CoA (2 carbons) joins oxaloacetate (4 carbons).',
      'The enzyme citrate synthase drives this condensation — a regulated, irreversible step and the cycle\u2019s entry point.'],
    exam: '6C = 4C (oxaloacetate) + 2C (acetyl-CoA). The cycle\u2019s committed entry step.' },
  'k-isocitrate': {
    name: 'Isocitrate', tag: 'Krebs cycle',
    desc: ['Isocitrate is citrate rearranged: the enzyme aconitase moves the –OH group from one carbon to the next.',
      'No carbons are lost and no energy carriers are made here — it simply sets up the first decarboxylation.'],
    exam: 'Rearrangement only (water leaves, then returns). No CO\u2082, no NADH at this step.' },
  'k-alphakg': {
    name: '\u03B1-Ketoglutarate', tag: 'Krebs cycle',
    desc: ['\u03B1-Ketoglutarate is a 5-carbon molecule: isocitrate loses one CO\u2082 and gives up electrons to make the cycle\u2019s first NADH.',
      'Beyond the cycle it is a biosynthetic hub — cells convert it into glutamate and other amino acids.'],
    exam: 'First CO\u2082 out, first NADH made. 6C \u2192 5C. Also a precursor for amino-acid synthesis.' },
  'k-succinylcoa': {
    name: 'Succinyl-CoA', tag: 'Krebs cycle',
    desc: ['Succinyl-CoA carries a high-energy thioester bond (the –CoA part) left over from a second round of CO\u2082 + NADH release.',
      'That bond\u2019s energy is spent in the next step to attach a phosphate — the cycle\u2019s only substrate-level phosphorylation.'],
    exam: 'High-energy thioester \u2192 its energy pays for the GTP made in the next step.' },
  'k-succinate': {
    name: 'Succinate', tag: 'Krebs cycle',
    desc: ['Succinate is a 4-carbon molecule freed when the CoA is swapped for a phosphate, making GTP (equivalent to ATP).',
      'Its oxidation is handled by succinate dehydrogenase — which is also Complex II of the electron transport chain, sitting in the inner mitochondrial membrane.'],
    exam: 'Succinate \u2192 fumarate makes FADH\u2082 (not NADH) — and the enzyme IS Complex II of the ETC.' },
  'k-fumarate': {
    name: 'Fumarate', tag: 'Krebs cycle',
    desc: ['Fumarate is succinate with a new carbon–carbon double bond, formed when FAD picks up the removed hydrogens.',
      'The enzyme fumarase then adds a water molecule across that double bond to make malate.'],
    exam: 'Has a C=C double bond — fumarase hydrates it (adds H\u2082O) to give malate.' },
  'k-malate': {
    name: 'Malate', tag: 'Krebs cycle',
    desc: ['Malate is the last 4-carbon intermediate. Malate dehydrogenase oxidizes it back into oxaloacetate.',
      'That oxidation produces the cycle\u2019s third NADH — the final energy-carrier payoff of the turn.'],
    exam: 'Malate \u2192 oxaloacetate makes the 3rd NADH and regenerates the starting material.' },
  'k-acetylcoa': {
    name: 'Acetyl-CoA', tag: 'Krebs cycle',
    desc: ['Acetyl-CoA is the 2-carbon fuel that enters the cycle, made from pyruvate by pyruvate oxidation (or from fatty-acid breakdown).',
      'Each glucose yields 2 pyruvate \u2192 2 acetyl-CoA, so the cycle turns TWICE per glucose.'],
    exam: '2C fuel in. Per glucose the cycle runs twice — double all per-turn totals.' }
};

/* Intermediates in cycle order (step i runs NODES[i] -> NODES[i+1 mod 8]). */
const KREBS_NODES = [
  { id: 'k-oxaloacetate', name: 'Oxaloacetate',  formula: 'C\u2084' },
  { id: 'k-citrate',      name: 'Citrate',       formula: 'C\u2086' },
  { id: 'k-isocitrate',    name: 'Isocitrate',    formula: 'C\u2086' },
  { id: 'k-alphakg',       name: '\u03B1-Ketoglutarate', formula: 'C\u2085' },
  { id: 'k-succinylcoa',   name: 'Succinyl-CoA',  formula: 'C\u2084' },
  { id: 'k-succinate',     name: 'Succinate',     formula: 'C\u2084' },
  { id: 'k-fumarate',      name: 'Fumarate',      formula: 'C\u2084' },
  { id: 'k-malate',        name: 'Malate',        formula: 'C\u2084' }
];

/* The 8 steps. Exported pure so tests can verify the chain and the totals. */
export const KREBS_STEPS = [
  { from: 'k-oxaloacetate', to: 'k-citrate',
    name: 'Oxaloacetate + acetyl-CoA \u2192 Citrate',
    inputs: ['Acetyl-CoA'], outputs: [],
    detail: 'Citrate synthase condenses acetyl-CoA with oxaloacetate. Irreversible entry step.' },
  { from: 'k-citrate', to: 'k-isocitrate',
    name: 'Citrate \u2192 Isocitrate',
    inputs: [], outputs: [],
    detail: 'Aconitase rearranges citrate (water leaves, then returns). No redox, no carbon lost.' },
  { from: 'k-isocitrate', to: 'k-alphakg',
    name: 'Isocitrate \u2192 \u03B1-Ketoglutarate',
    inputs: [], outputs: ['CO\u2082', 'NADH'],
    detail: 'First oxidative decarboxylation: one CO\u2082 released, first NADH made.' },
  { from: 'k-alphakg', to: 'k-succinylcoa',
    name: '\u03B1-Ketoglutarate \u2192 Succinyl-CoA',
    inputs: [], outputs: ['CO\u2082', 'NADH'],
    detail: 'Second oxidative decarboxylation: another CO\u2082 and NADH.' },
  { from: 'k-succinylcoa', to: 'k-succinate',
    name: 'Succinyl-CoA \u2192 Succinate',
    inputs: [], outputs: ['GTP'],
    detail: 'Substrate-level phosphorylation: the thioester\u2019s energy makes GTP (\u2248 ATP).' },
  { from: 'k-succinate', to: 'k-fumarate',
    name: 'Succinate \u2192 Fumarate',
    inputs: [], outputs: ['FADH\u2082'],
    detail: 'Succinate dehydrogenase (Complex II of the ETC) oxidizes succinate; FAD \u2192 FADH\u2082.' },
  { from: 'k-fumarate', to: 'k-malate',
    name: 'Fumarate \u2192 Malate',
    inputs: ['H\u2082O'], outputs: [],
    detail: 'Fumarase adds water across the C=C double bond.' },
  { from: 'k-malate', to: 'k-oxaloacetate',
    name: 'Malate \u2192 Oxaloacetate',
    inputs: [], outputs: ['NADH'],
    detail: 'Malate dehydrogenase oxidizes malate, regenerating oxaloacetate and the third NADH.' }
];

/* Per-turn yield (per acetyl-CoA). ×2 per glucose. */
export const KREBS_TOTALS = { 'CO\u2082': 2, 'NADH': 3, 'FADH\u2082': 1, 'GTP': 1 };

const BIOCHEM_VIEWS = [
  { id: 'aa',    label: '\uD83E\uDDEA Amino acids' },
  { id: 'krebs', label: '\uD83D\uDD04 Krebs cycle' }
];
const BIOCHEM_CAMERAS = {
  aa:    { pos: [5.2, 3.6, 6.6], target: [0, 1.4, 0] },
  krebs: { pos: [0, 1.0, 11.0],   target: [0, 0.2, 0] }
};

/* Backbone part templates (shared text; tag is stamped with the current
 * amino acid name at build time). */
function backboneInfo(kind, aaName) {
  const tag = `Backbone · ${aaName}`;
  if (kind === 'amino') return {
    name: 'Amino group', tag,
    desc: ['The –NH₂ group at the “N-terminus” end of the amino acid: a nitrogen with two hydrogens and a lone pair.',
      'That lone pair readily accepts a proton, so at cellular pH the amino group is usually –NH₃⁺, carrying a positive charge.',
      'During protein synthesis, this nitrogen attacks the next amino acid’s carboxyl carbon, forming the peptide bond.'],
    exam: 'Basic end: accepts H⁺ → –NH₃⁺ (positive at pH 7). Its nitrogen forms the peptide bond.' };
  if (kind === 'alpha') return {
    name: 'Alpha carbon', tag,
    desc: ['The central carbon bonded to four things: the amino group, the carboxyl group, a hydrogen, and the side chain.',
      'Because those four groups differ (except in glycine), the alpha carbon is a chiral center — amino acids come in L and D mirror forms, and life uses the L form.',
      'Protein backbones pivot around the bonds on either side of the alpha carbon, which is why glycine’s tiny side chain makes chains so flexible.'],
    exam: 'Chiral center (except glycine) — four different groups; life uses the L form.' };
  return {
    name: 'Carboxyl group', tag,
    desc: ['The –COOH group at the “C-terminus” end: a carbon double-bonded to one oxygen and single-bonded to an –OH.',
      'It readily donates its hydrogen as H⁺, so at cellular pH it is usually –COO⁻, carrying a negative charge.',
      'In protein synthesis, its carbon links to the next amino acid’s nitrogen — the peptide bond that strings amino acids into chains.'],
    exam: 'Acidic end: donates H⁺ → –COO⁻ (negative at pH 7). Its carbon forms the peptide bond.' };
}

export function buildBiochem() {
  const group = new THREE.Group();
  const container = new THREE.Group();
  group.add(container);
  let parts = [];
  let bondMeshes = [];
  let bondMat = null;
  let current = AMINO_ACIDS[1]; // alanine — simple, representative default
  let lastT = 0;
  let view = 'aa';

  /* ------------------ krebs view: animation + HUD state ----------------- */
  const krebs = { step: 0, playing: true, t: 0 };
  const krebsEls = {};
  let krebsOverlay = null;

  function clearContainer() {
    container.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    container.clear();
    /* keep the SAME array identity: main.js holds this reference between
     * refreshParts() calls */
    parts.length = 0; bondMeshes = []; bondMat = null;
  }
  /* tag every part mesh so main.js's raycast picker opens its info card.
   * Called after EVERY rebuild: step changes create brand-new meshes that
   * main.js's refreshParts() (view-switch time only) never sees. */
  function tagParts() {
    parts.forEach(p => { p.group.traverse(m => { if (m.isMesh) m.userData.part = p; }); });
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

  function setMolecule(id) {
    if (view === 'krebs') {
      // leave the krebs view cleanly before showing a molecule
      // (main.js calls setMolecule directly during MCAT packs)
      current = AMINO_ACIDS.find(a => a.id === id) || AMINO_ACIDS[1];
      setView('aa');
      return;
    }
    clearContainer();
    newBondMat();
    current = AMINO_ACIDS.find(a => a.id === id) || AMINO_ACIDS[1];
    const all = BB.concat(current.atoms);
    const pos = all.map(a => new THREE.Vector3(...a.pos));
    const els = all.map(a => a.el);
    const molCenter = new THREE.Vector3();
    pos.forEach(v => molCenter.add(v));
    molCenter.divideScalar(pos.length);

    function mkPart(pid, system, quizGroup, quizGroupLabel, info, idxs) {
      const c = new THREE.Vector3();
      idxs.forEach(i => c.add(pos[i]));
      c.divideScalar(idxs.length);
      const dir = c.clone().sub(molCenter);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();
      const p = {
        id: pid,
        system,
        quizGroup,       // quiz/search key — never `el` on these parts
        quizGroupLabel,
        info,
        group: new THREE.Group(),
        basePos: c.clone(),
        explodeDir: dir,
        explodeDist: 1.3
      };
      idxs.forEach(i => {
        const E = ELEMENTS[els[i]];
        const s = new THREE.Mesh(new THREE.SphereGeometry(E.r, 28, 22), mat(E.color));
        if (els[i] === 'H') s.material = mat(E.color, { roughness: 0.6 });
        s.position.copy(pos[i]).sub(c);
        p.group.add(s);
      });
      p.group.position.copy(c);
      parts.push(p); container.add(p.group);
      return p;
    }

    mkPart('amino-group', 'backbone', 'amino-group', 'amino group',
           backboneInfo('amino', current.name), [0, 1, 2]);
    mkPart('alpha-carbon', 'backbone', 'alpha-carbon', 'alpha carbon',
           backboneInfo('alpha', current.name), [3, 4]);
    mkPart('carboxyl-group', 'backbone', 'carboxyl-group', 'carboxyl group',
           backboneInfo('carboxyl', current.name), [5, 6, 7]);
    mkPart('side-chain', 'side-chain', 'side-chain', 'side chain (R group)',
           { name: `${current.name} side chain`, tag: 'R group',
             desc: current.desc, exam: current.exam },
           current.atoms.map((_, k) => 8 + k));

    const bonds = BB_BONDS.concat([[3, 8, 1]]) // alpha carbon -> beta carbon
      .concat(current.bonds.map(([i, j, o]) => [i + 8, j + 8, o || 1]))
      .concat(current.xBonds || []);
    addBonds(pos, bonds, els);
    applyExplode(lastT);
    return current.id;
  }

  function getMoleculeInfo() {
    return {
      id: current.id, name: current.name,
      formula: `${current.code3} · ${current.code1}`,
      tag: 'Amino acid', headline: current.headline,
      desc: current.desc, exam: current.exam
    };
  }

  function applyExplode(t) {
    lastT = t;
    parts.forEach(p => {
      p.group.position.copy(p.basePos).addScaledVector(p.explodeDir, t * p.explodeDist);
    });
    bondMeshes.forEach(b => { b.material.opacity = Math.max(0.06, 1 - t * 0.94); });
  }

  /* ------------------------------ krebs view --------------------------- */
  const KREBS_R = 3.2;
  const KREBS_COLORS = [0x5dade2, 0x58d68d, 0xf5b041, 0xec7063,
                        0xaf7ac5, 0x48c9b0, 0xf1948a, 0x85c1e9];
  function krebsNodePos(i) {
    const a = Math.PI / 2 + i * (Math.PI / 4);
    return [Math.cos(a) * KREBS_R, Math.sin(a) * KREBS_R];
  }
  function krebsNoPick(o) { o.traverse(m => { m.userData.noPick = true; }); return o; }

  /* Floating text plaque (canvas texture), decorative. */
  function krebsPlaque(title, sub, accent = '#5dade2') {
    const fs = 40, padX = 30, padY = 22;
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
    const tw = Math.ceil(meas.measureText(title).width);
    const c = document.createElement('canvas');
    c.width = tw + padX * 2;
    c.height = fs + padY * 2 + (sub ? 36 : 0);
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(13,22,36,0.88)';
    g.strokeStyle = accent; g.lineWidth = 5;
    g.beginPath();
    const r = 26, w = c.width, h = c.height;
    g.moveTo(r, 4);
    g.arcTo(w - 4, 4, w - 4, h - 4, r);
    g.arcTo(w - 4, h - 4, 4, h - 4, r);
    g.arcTo(4, h - 4, 4, 4, r);
    g.arcTo(4, 4, w - 4, 4, r);
    g.closePath();
    g.fill(); g.stroke();
    g.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
    g.fillStyle = '#eaf2f8'; g.textBaseline = 'middle';
    g.fillText(title, padX, padY + fs / 2 + 2);
    if (sub) {
      g.font = `600 30px system-ui, -apple-system, sans-serif`;
      g.fillStyle = '#a9cce3';
      g.fillText(sub, padX, padY + fs + 34);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const H = 0.55, W = H * (c.width / c.height);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    return krebsNoPick(m);
  }

  /** Tube (cylinder) between two points, decorative or pickable. */
  function krebsTube(a, b, r, color) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const len = Math.max(va.distanceTo(vb), 0.01);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat(color));
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return m;
  }
  function krebsArrowhead(at, dir, s, color) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.11 * s, 0.28 * s, 12), mat(color));
    cone.position.set(...at);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(...dir).normalize());
    return cone;
  }

  function buildKrebsView() {
    const step = KREBS_STEPS[krebs.step];
    const activeCol = 0xf2c14e, idleCol = 0x566573;

    // --- arcs between consecutive intermediates; current step glows ---
    KREBS_STEPS.forEach((st, i) => {
      const a0 = Math.PI / 2 + i * (Math.PI / 4);
      const active = i === krebs.step;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(KREBS_R, active ? 0.075 : 0.045, 10, 28, Math.PI / 4 - 0.24),
        mat(active ? activeCol : idleCol));
      arc.rotation.z = a0 + 0.12;
      arc.userData.noPick = true;
      container.add(arc);
      const ae = a0 + Math.PI / 4 - 0.12;
      const ah = krebsArrowhead(
        [Math.cos(ae) * KREBS_R, Math.sin(ae) * KREBS_R, 0],
        [-Math.sin(ae), Math.cos(ae), 0], active ? 1.4 : 1.0,
        active ? activeCol : idleCol);
      ah.userData.noPick = true;
      container.add(ah);
    });

    // --- intermediate nodes: clickable parts ---
    KREBS_NODES.forEach((nd, i) => {
      const [x, y] = krebsNodePos(i);
      const active = step.from === nd.id || step.to === nd.id;
      const p = {
        id: nd.id,
        system: 'krebs',
        info: KREBS_INFO[nd.id],
        group: new THREE.Group(),
        basePos: new THREE.Vector3(x, y, 0),
        explodeDir: new THREE.Vector3(x, y, 0).normalize(),
        explodeDist: 0.9
      };
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(active ? 0.5 : 0.42, 28, 22),
        mat(KREBS_COLORS[i], active
          ? { emissive: 0xf2c14e, emissiveIntensity: 0.5 } : {}));
      p.group.add(s);
      const pl = krebsPlaque(nd.name, nd.formula);
      pl.position.set(0, -1.0, 0);
      p.group.add(pl);
      p.group.position.set(x, y, 0);
      parts.push(p); container.add(p.group);
    });

    // --- acetyl-CoA entry node, feeding the oxaloacetate -> citrate arc ---
    {
      const aMid = Math.PI / 2 + Math.PI / 8;
      const ax = Math.cos(aMid) * 5.5, ay = Math.sin(aMid) * 5.5;
      const p = {
        id: 'k-acetylcoa',
        system: 'krebs',
        info: KREBS_INFO['k-acetylcoa'],
        group: new THREE.Group(),
        basePos: new THREE.Vector3(ax, ay, 0),
        explodeDir: new THREE.Vector3(ax, ay, 0).normalize(),
        explodeDist: 0.9
      };
      p.group.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 22), mat(0xe67e22)));
      const pl = krebsPlaque('Acetyl-CoA', 'C\u2082 \u00B7 enters here', '#e67e22');
      pl.position.set(0, -1.0, 0);
      p.group.add(pl);
      const mid = [Math.cos(aMid) * KREBS_R, Math.sin(aMid) * KREBS_R, 0];
      const start = [ax * 0.86, ay * 0.86, 0];
      const tube = krebsTube(start, mid, 0.06, 0xe67e22);
      tube.userData.noPick = true;
      container.add(tube);
      const dir = [mid[0] - start[0], mid[1] - start[1], 0];
      const ah = krebsArrowhead(mid, dir, 1.2, 0xe67e22);
      ah.userData.noPick = true;
      container.add(ah);
      p.group.position.set(ax, ay, 0);
      parts.push(p); container.add(p.group);
    }

    // --- center caption (decorative) ---
    const cap = krebsPlaque('Krebs cycle', 'mitochondrial matrix', '#f2c14e');
    cap.scale.set(0.9, 0.9, 0.9);
    container.add(cap);
    updateKrebsHud();
  }

  /* --------------------------- krebs HUD overlay ----------------------- */
  function kel(tag, id, parent, text, cls) {
    const e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function krebsIoText(st) {
    const ins = st.inputs.length ? st.inputs.join(' + ') : '\u2014';
    const outs = st.outputs.length ? st.outputs.join(' + ') : '\u2014';
    return `in: ${ins}  \u00B7  out: ${outs}`;
  }
  function ensureKrebsOverlay() {
    if (krebsOverlay) return;
    krebsOverlay = document.createElement('div');
    krebsOverlay.id = 'krebs-panel';
    const head = kel('div', null, krebsOverlay, null, 'ap-head');
    kel('span', null, head, '\uD83D\uDD04 Krebs cycle');
    krebsEls.step = kel('span', 'krebs-step', head, 'Step 1 / 8');
    krebsEls.name = kel('div', 'krebs-name', krebsOverlay, KREBS_STEPS[0].name);
    krebsEls.io = kel('div', 'krebs-io', krebsOverlay, krebsIoText(KREBS_STEPS[0]));
    krebsEls.detail = kel('div', 'krebs-detail', krebsOverlay, KREBS_STEPS[0].detail);
    kel('div', null, krebsOverlay,
      'Per turn (per acetyl-CoA): 2 CO\u2082 \u00B7 3 NADH \u00B7 1 FADH\u2082 \u00B7 1 GTP \u2014 \u00D72 per glucose',
      'krebs-totals');
    const ctrls = kel('div', null, krebsOverlay, null, 'ap-controls');
    krebsEls.prev = kel('button', 'krebs-prev', ctrls, '\u23EE Prev');
    krebsEls.play = kel('button', 'krebs-play', ctrls, '\u23F8 Pause');
    krebsEls.next = kel('button', 'krebs-next', ctrls, '\u23ED Next');
    krebsEls.reset = kel('button', 'krebs-reset', ctrls, '\u21BA Reset');
    const setPlayLabel = () => {
      krebsEls.play.textContent = krebs.playing ? '\u23F8 Pause' : '\u25B6 Play';
    };
    krebsEls.play.addEventListener('click', () => { krebs.playing = !krebs.playing; setPlayLabel(); });
    krebsEls.prev.addEventListener('click', () => setKrebsStep(krebs.step - 1));
    krebsEls.next.addEventListener('click', () => setKrebsStep(krebs.step + 1));
    krebsEls.reset.addEventListener('click', () => {
      krebs.playing = true; setPlayLabel(); setKrebsStep(0);
    });
    document.body.appendChild(krebsOverlay);
    setPlayLabel();
  }
  function updateKrebsHud() {
    if (!krebsOverlay) return;
    const st = KREBS_STEPS[krebs.step];
    krebsEls.step.textContent = `Step ${krebs.step + 1} / ${KREBS_STEPS.length}`;
    krebsEls.name.textContent = st.name;
    krebsEls.io.textContent = krebsIoText(st);
    krebsEls.detail.textContent = st.detail;
  }
  function setKrebsOverlayVisible(on) {
    ensureKrebsOverlay();
    krebsOverlay.style.display = on ? 'block' : 'none';
    updateKrebsHud();
  }

  function setKrebsStep(i) {
    krebs.step = ((i % KREBS_STEPS.length) + KREBS_STEPS.length) % KREBS_STEPS.length;
    krebs.t = 0;
    clearContainer();
    buildKrebsView();
    tagParts();
    updateKrebsHud();
  }
  function krebsUpdate(dt) {
    if (view !== 'krebs') return;
    if (krebs.playing) {
      krebs.t += dt;
      if (krebs.t > 3.5) setKrebsStep(krebs.step + 1);
    }
  }

  /* ------------------------------ view wiring -------------------------- */
  function setView(id) {
    clearContainer();
    view = BIOCHEM_VIEWS.some(v => v.id === id) ? id : 'aa';
    if (view === 'krebs') { setKrebsStep(krebs.step); krebs.playing = true; }
    else setMolecule(current.id);
    setKrebsOverlayVisible(view === 'krebs');
    if (krebsEls.play) krebsEls.play.textContent = krebs.playing ? '\u23F8 Pause' : '\u25B6 Play';
    return view;
  }
  function getViewId() { return view; }

  const api = {
    id: 'biochem',
    label: 'Biochem Corner',
    group,
    get parts() { return parts; },
    getParts: () => parts,
    systems: [],
    moleculeGroups: GROUPS,
    moleculeList: AMINO_ACIDS.map(a => ({
      id: a.id, name: a.name, formula: `${a.code3} · ${a.code1}`, group: a.group })),
    /* the amino-acid switcher only makes sense in the amino-acids view */
    get showMolecules() { return view === 'aa'; },
    setMolecule,
    setAminoAcid: setMolecule,
    /* no molecule info card while the Krebs cycle is showing */
    getMoleculeInfo: () => (view === 'krebs' ? null : getMoleculeInfo()),
    applyExplode,
    viewList: BIOCHEM_VIEWS,
    setView,
    getViewId,
    getContextId: () => (view === 'krebs' ? 'krebs' : current.id),
    get camera() { return BIOCHEM_CAMERAS[view]; },
    explodeScale: 1.0,
    /* per-frame hook for the Krebs auto-step (main.js calls it when present) */
    update(dt) { krebsUpdate(dt); },
    /* teardown for the Krebs HUD overlay when the atlas is unloaded */
    dispose() {
      if (krebsOverlay && krebsOverlay.parentNode) krebsOverlay.parentNode.removeChild(krebsOverlay);
      krebsOverlay = null;
      for (const k of Object.keys(krebsEls)) delete krebsEls[k];
    },
    /* introspection for headless tests / QA */
    krebsDebug: {
      step: () => krebs.step,
      stepId: () => `${KREBS_STEPS[krebs.step].from}\u2192${KREBS_STEPS[krebs.step].to}`,
      overlayVisible: () => !!(krebsOverlay && krebsOverlay.style.display === 'block')
    }
  };
  setView('aa');
  return api;
}
