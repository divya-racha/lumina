/* Lumina — MCAT Passage Simulator data (pure, no DOM, no three.js).
 *
 * All passages and questions are ORIGINAL practice content written for
 * Lumina, grounded in OpenStax Biology 2e / Chemistry 2e. Not affiliated
 * with AAMC; no real MCAT content is used or reproduced.
 *
 * A figure task is { id, prompt, targetPartId, targetLabel, confirm }.
 * targetPartId MUST be a real pickable part id in the passage's atlas/view
 * (see the headless assertion suite — it greps the builder sources).
 * An MCQ is { stem, options[4], answer (index), explanation }.
 */
export const PASSAGE_DISCLAIMER =
  'Practice passages written for Lumina \u2014 not affiliated with AAMC.';

/* Wrong-click budget per figure task before the answer is revealed. */
export const FIGURE_MAX_ATTEMPTS = 3;

export const PASSAGES = [
  {
    id: 'cardiac-cycle',
    title: 'The Cardiac Cycle',
    tagline: 'Pressure gradients, one-way valves, and the two loops of circulation.',
    atlas: 'anatomy',
    atlasLabel: 'Human Anatomy',
    view: null,
    text: [
      'Your heart beats about 100,000 times a day, yet it never \u201Cdecides\u201D where blood should go \u2014 physics does. Blood always flows from high pressure to low pressure, and a set of one-way valves makes sure it never flows backward.',
      'Each heartbeat has two phases. During diastole, the heart muscle relaxes. Blood returning from the body fills the right atrium through the vena cava, while oxygen-rich blood from the lungs fills the left atrium. The atrioventricular (AV) valves \u2014 tricuspid on the right, mitral on the left \u2014 hang open, letting blood drop into the ventricles.',
      'Then systole begins: the ventricles contract. Ventricular pressure shoots upward. The moment it exceeds atrial pressure, the AV valves slam shut \u2014 that is the \u201Club\u201D of the heartbeat. Pressure keeps climbing until it exceeds the pressure in the great arteries, forcing the semilunar valves open. The right ventricle pumps deoxygenated blood to the lungs; the left ventricle \u2014 with walls three times thicker \u2014 blasts oxygenated blood into the aorta, the body\u2019s largest artery, for delivery to every tissue. The closing of the semilunar valves makes the \u201Cdub\u201D sound.',
      'This creates two loops. The pulmonary circuit runs heart \u2192 lungs \u2192 heart, picking up oxygen and dropping off carbon dioxide. The systemic circuit runs heart \u2192 body \u2192 heart, delivering oxygen and nutrients. The left side always handles oxygenated blood; the right side always handles deoxygenated blood \u2014 the two never mix in a healthy heart.'
    ],
    figureTasks: [
      {
        id: 'ft-aorta',
        prompt: 'Figure task: click the great vessel that carries oxygenated blood AWAY from the heart to the body.',
        targetPartId: 'aorta',
        targetLabel: 'Aorta',
        confirm: 'The aorta is the body\u2019s largest artery \u2014 all systemic blood leaves through it.'
      },
      {
        id: 'ft-venacava',
        prompt: 'Figure task: click the great vessel that returns deoxygenated blood TO the heart.',
        targetPartId: 'vena_cava',
        targetLabel: 'Vena Cava',
        confirm: 'The vena cava dumps deoxygenated blood into the right atrium.'
      }
    ],
    mcqs: [
      {
        stem: 'What directly causes blood to flow from the atria into the ventricles during diastole?',
        options: [
          'A pressure gradient \u2014 atrial pressure is higher than ventricular pressure',
          'The ventricles actively suck blood downward',
          'Skeletal muscles squeezing the veins',
          'The semilunar valves pulling blood through'
        ],
        answer: 0,
        explanation: 'Blood always moves from high to low pressure. During diastole the relaxed ventricles sit at lower pressure than the filling atria, so blood flows down the gradient through the open AV valves.'
      },
      {
        stem: 'Which circuit delivers oxygenated blood to the body\u2019s tissues?',
        options: [
          'Pulmonary circuit',
          'Systemic circuit',
          'Coronary circuit',
          'Portal circuit'
        ],
        answer: 1,
        explanation: 'The systemic circuit (left ventricle \u2192 aorta \u2192 body \u2192 vena cava \u2192 right atrium) delivers oxygen and nutrients to tissues. The pulmonary circuit only serves the lungs.'
      },
      {
        stem: 'The \u201Club\u201D heart sound is produced when\u2026',
        options: [
          'The semilunar valves open',
          'The AV valves slam shut at the start of ventricular systole',
          'Blood rushes through the aorta',
          'The atria contract'
        ],
        answer: 1,
        explanation: 'When ventricular pressure exceeds atrial pressure at the start of systole, the AV (tricuspid and mitral) valves snap shut \u2014 that closure makes the \u201Club\u201D sound.'
      },
      {
        stem: 'A patient has a leaky mitral (left AV) valve. What is the direct consequence during ventricular systole?',
        options: [
          'Blood flows backward into the left atrium, reducing forward output',
          'Blood cannot enter the aorta at all',
          'The right ventricle pumps harder to compensate',
          'Oxygenated and deoxygenated blood mix inside the ventricles'
        ],
        answer: 0,
        explanation: 'Valves enforce one-way flow. A leaky mitral valve lets blood regurgitate into the left atrium when the ventricle contracts, so less blood reaches the aorta.'
      }
    ]
  },
  {
    id: 'action-potential',
    title: 'The Action Potential',
    tagline: 'Electrochemical gradients, threshold, and the all-or-none spike.',
    atlas: 'neuron',
    atlasLabel: 'Neuron Lab',
    view: 'ap',
    text: [
      'Neurons speak in electricity. At rest, a neuron\u2019s membrane potential sits near \u221270 millivolts \u2014 negative inside, positive outside. Two gradients maintain this: sodium (Na\u207a) is concentrated outside the cell, potassium (K\u207a) inside, and the sodium-potassium pump burns ATP to keep it that way, moving 3 Na\u207a out for every 2 K\u207a in.',
      'When a stimulus depolarizes the membrane to about \u221255 mV \u2014 the threshold \u2014 voltage-gated sodium channels snap open. Na\u207a floods INTO the axon down its electrochemical gradient, and the membrane potential rockets upward to roughly +30 mV. This rising phase is depolarization, and it is blindingly fast: the whole spike lasts about a millisecond.',
      'Near the peak, two things happen at once. The sodium channels inactivate \u2014 they plug themselves \u2014 and slower voltage-gated potassium channels finally open. K\u207a streams OUT of the axon, dragging the membrane potential back down. This falling phase is repolarization. Because the potassium channels are slow to close, the potential briefly overshoots below \u221270 mV, a dip called hyperpolarization.',
      'Only then does the sodium-potassium pump finish the job, restoring the original ion gradients so the neuron can fire again. While sodium channels are inactivated, no new action potential can begin \u2014 the absolute refractory period \u2014 which guarantees the signal travels in one direction and gives each spike a uniform size. It is all-or-none: a neuron either fires a full action potential or it does not fire at all.'
    ],
    figureTasks: [
      {
        id: 'ft-nachannel',
        prompt: 'Figure task: click the channel that opens at threshold (\u221255 mV) and lets Na\u207a rush IN.',
        targetPartId: 'nachannel',
        targetLabel: 'Sodium Channel (Na\u207a)',
        confirm: 'Voltage-gated Na\u207a channels drive depolarization \u2014 the rising phase of the spike.'
      },
      {
        id: 'ft-napump',
        prompt: 'Figure task: click the protein that burns ATP to restore the ion gradients after the spike.',
        targetPartId: 'napump',
        targetLabel: 'Sodium-Potassium Pump',
        confirm: 'The pump moves 3 Na\u207a out and 2 K\u207a in \u2014 it maintains the gradients; it does NOT cause the spike.'
      }
    ],
    mcqs: [
      {
        stem: 'What event causes the rising phase (depolarization) of the action potential?',
        options: [
          'K\u207a flowing out through voltage-gated channels',
          'Na\u207a rushing in through voltage-gated channels',
          'The Na\u207a/K\u207a pump burning ATP',
          'Cl\u207b entering the axon'
        ],
        answer: 1,
        explanation: 'At threshold (~\u221255 mV), voltage-gated Na\u207a channels open and Na\u207a floods in down its electrochemical gradient, driving the membrane from \u221270 mV toward +30 mV.'
      },
      {
        stem: 'Why does the membrane potential briefly dip below \u221270 mV after a spike?',
        options: [
          'The Na\u207a/K\u207a pump overcorrects',
          'Voltage-gated K\u207a channels are slow to close, so K\u207a keeps leaving',
          'Na\u207a channels reopen too early',
          'The membrane becomes impermeable to all ions'
        ],
        answer: 1,
        explanation: 'K\u207a channels close slowly. The extra K\u207a efflux after repolarization drives the potential below resting level \u2014 hyperpolarization \u2014 until the channels finally shut.'
      },
      {
        stem: 'The resting potential of \u221270 mV is maintained primarily by\u2026',
        options: [
          'Voltage-gated Na\u207a channels staying open',
          'The Na\u207a/K\u207a pump (3 Na\u207a out, 2 K\u207a in) plus K\u207a leak channels',
          'Continuous small action potentials',
          'The myelin sheath insulating the axon'
        ],
        answer: 1,
        explanation: 'The pump uses ATP to maintain the gradients (high Na\u207a outside, high K\u207a inside), and K\u207a leak channels let K\u207a drift out, leaving the inside negative.'
      },
      {
        stem: 'During the absolute refractory period, a second action potential cannot fire because\u2026',
        options: [
          'The Na\u207a/K\u207a pump has run out of ATP',
          'Voltage-gated Na\u207a channels are inactivated',
          'The membrane is too depolarized to change',
          'K\u207a channels are locked shut'
        ],
        answer: 1,
        explanation: 'After opening, Na\u207a channels enter an inactivated state and cannot reopen immediately. This enforces one-way signal travel and caps the maximum firing rate.'
      }
    ]
  },
  {
    id: 'aerobic-respiration',
    title: 'Aerobic Respiration',
    tagline: 'Redox harvest in the Krebs cycle: NADH, FADH\u2082, and the per-turn tally.',
    atlas: 'biochem',
    atlasLabel: 'Biochem Corner',
    view: 'krebs',
    /* Pulled-back framing so the figure-task banner (top-center) clears the
     * top Krebs node (oxaloacetate): all 8 nodes stay clickable without
     * orbiting. Only used by the passage; the walkthrough keeps its view. */
    camera: { pos: [0, 1.0, 19.0], target: [0, 0.2, 0] },
    text: [
      'When a cell needs energy, it does not burn glucose like a fire \u2014 it strips it for electrons. Aerobic respiration harvests those electrons in stages, and the Krebs cycle is the hub where most of the harvesting happens.',
      'It starts in the mitochondrial matrix. Pyruvate from glycolysis is converted to acetyl-CoA, a two-carbon molecule that enters the cycle by joining oxaloacetate, a four-carbon acceptor, to form citrate (six carbons). What follows is a loop of eight reactions that gradually oxidizes the carbons. Twice per turn, a carbon is released as CO\u2082 \u2014 at the isocitrate \u2192 \u03B1-ketoglutarate step and the \u03B1-ketoglutarate \u2192 succinyl-CoA step.',
      'Oxidation means losing electrons, and the cycle captures them in carrier molecules: three NADH and one FADH\u2082 per turn (FADH\u2082 is made when succinate becomes fumarate). One GTP \u2014 an ATP equivalent \u2014 is also produced directly when succinyl-CoA becomes succinate. At the end, oxaloacetate is regenerated, ready to accept the next acetyl-CoA.',
      'Per acetyl-CoA, the tally is 2 CO\u2082, 3 NADH, 1 FADH\u2082, and 1 GTP. Since one glucose makes two acetyl-CoA, the cycle runs twice per glucose. The NADH and FADH\u2082 then feed the electron transport chain, where their electrons drive proton pumping and, ultimately, the bulk of ATP synthesis through oxidative phosphorylation. Without oxygen as the final electron acceptor, the chain stalls \u2014 which is why the Krebs cycle, though it never touches oxygen directly, depends on it absolutely.'
    ],
    figureTasks: [
      {
        id: 'ft-oxaloacetate',
        prompt: 'Figure task: click the 4-carbon molecule that accepts acetyl-CoA to start the cycle \u2014 and is regenerated at the end.',
        targetPartId: 'k-oxaloacetate',
        targetLabel: 'Oxaloacetate',
        confirm: 'Oxaloacetate is both the starting acceptor and the final product \u2014 that is what makes it a cycle.'
      },
      {
        id: 'ft-succinate',
        prompt: 'Figure task: click the molecule whose conversion to fumarate produces FADH\u2082.',
        targetPartId: 'k-succinate',
        targetLabel: 'Succinate',
        confirm: 'Succinate \u2192 fumarate is the cycle\u2019s only FADH\u2082-producing step.'
      }
    ],
    mcqs: [
      {
        stem: 'Per acetyl-CoA, one turn of the Krebs cycle produces\u2026',
        options: [
          '2 CO\u2082, 3 NADH, 1 FADH\u2082, 1 GTP',
          '2 CO\u2082, 2 NADH, 2 FADH\u2082, 2 ATP',
          '1 CO\u2082, 3 NADH, 1 FADH\u2082, 1 ATP',
          '6 CO\u2082, 6 NADH, 2 FADH\u2082, 2 GTP'
        ],
        answer: 0,
        explanation: 'Each turn releases 2 CO\u2082 (two decarboxylations), reduces 3 NAD\u207a to NADH and 1 FAD to FADH\u2082, and makes 1 GTP by substrate-level phosphorylation.'
      },
      {
        stem: 'Where in the cell does the Krebs cycle run?',
        options: [
          'The cytosol',
          'The mitochondrial matrix',
          'The intermembrane space',
          'The nucleus'
        ],
        answer: 1,
        explanation: 'Krebs cycle enzymes are dissolved in the mitochondrial matrix \u2014 the innermost compartment \u2014 right beside the electron transport chain in the inner membrane.'
      },
      {
        stem: 'What is the main fate of the NADH made by the Krebs cycle?',
        options: [
          'It is oxidized by the electron transport chain to help make ATP',
          'It is converted directly back into glucose',
          'It leaves the cell as waste',
          'It is stored for the next cell division'
        ],
        answer: 0,
        explanation: 'NADH donates its electrons to the electron transport chain. The energy released pumps protons, powering ATP synthase \u2014 oxidative phosphorylation.'
      },
      {
        stem: 'FADH\u2082 is produced during which conversion?',
        options: [
          'Isocitrate \u2192 \u03B1-ketoglutarate',
          'Succinate \u2192 fumarate',
          'Malate \u2192 oxaloacetate',
          'Citrate \u2192 isocitrate'
        ],
        answer: 1,
        explanation: 'Succinate dehydrogenase oxidizes succinate to fumarate, reducing FAD to FADH\u2082. It is the only Krebs step that makes FADH\u2082 instead of NADH.'
      }
    ]
  }
];

export function passageById(id) {
  return PASSAGES.find(p => p.id === id) || null;
}

/* Structural validation — returns an array of error strings (empty = valid).
 * The headless suite calls this and also asserts the fine-grained rules
 * individually so failures point at the exact broken field. */
export function validatePassage(p) {
  const errs = [];
  if (!p || typeof p !== 'object') return ['passage is not an object'];
  if (!p.id || typeof p.id !== 'string') errs.push('missing id');
  if (!p.title || typeof p.title !== 'string') errs.push('missing title');
  if (!p.tagline || typeof p.tagline !== 'string') errs.push('missing tagline');
  if (!Array.isArray(p.text) || !p.text.length ||
      p.text.some(t => typeof t !== 'string' || !t.trim()))
    errs.push('text must be a non-empty array of non-empty paragraphs');
  if (!Array.isArray(p.figureTasks) || p.figureTasks.length < 1)
    errs.push('need at least 1 figure task');
  (p.figureTasks || []).forEach((t, i) => {
    if (!t.id || !t.prompt || !t.targetPartId || !t.targetLabel || !t.confirm)
      errs.push(`figureTasks[${i}] missing field`);
  });
  /* Optional per-passage camera override (used to keep figure targets clear
   * of overlay UI). When present it must be a valid pos/target triple. */
  if (p.camera !== undefined && p.camera !== null) {
    const okTriple = a => Array.isArray(a) && a.length === 3 &&
      a.every(n => typeof n === 'number' && Number.isFinite(n));
    if (!okTriple(p.camera.pos) || !okTriple(p.camera.target))
      errs.push('camera must have numeric pos[3] and target[3]');
  }
  if (!Array.isArray(p.mcqs) || p.mcqs.length !== 4)
    errs.push('need exactly 4 MCQs');
  (p.mcqs || []).forEach((q, i) => {
    if (!q.stem || typeof q.stem !== 'string') errs.push(`mcqs[${i}] missing stem`);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      errs.push(`mcqs[${i}] needs exactly 4 options`);
    (q.options || []).forEach((o, j) => {
      if (typeof o !== 'string' || !o.trim()) errs.push(`mcqs[${i}].options[${j}] empty`);
    });
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      errs.push(`mcqs[${i}] answer must be an index 0-3`);
    if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim())
      errs.push(`mcqs[${i}] missing explanation`);
  });
  return errs;
}

/* Word count of the passage body (paragraphs joined). */
export function passageWordCount(p) {
  return p.text.join(' ').split(/\s+/).filter(Boolean).length;
}
