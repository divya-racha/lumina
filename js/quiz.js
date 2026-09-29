/* ScienceAtlas — quiz + search + learn-mode logic (pure functions, no DOM).
 * Questions are sampled directly from the atlas part data objects, so the
 * quiz can never drift out of sync with what the atlases contain.
 *
 * atlasCtx: { id, molecule: <info> | null }
 * A question is { kind: 'part', part } | { kind: 'element', el, elName }
 *              | { kind: 'group', key, label }.
 */

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Element display name from a molecule atom part ("Oxygen (O)" -> "Oxygen"). */
export function elementName(part) {
  return String(part.info.name).replace(/\s*\(.*\)$/, '');
}

/* Sample `n` questions from the current atlas parts. Data-driven:
 *  - every part has `el`        -> element questions (molecules, ochem gallery)
 *  - parts carry `quizGroup`     -> functional-group questions (ochem groups, biochem)
 *  - otherwise                   -> distinct-part questions (anatomy, cells, ...)
 */
export function sampleQuestions(parts, atlasCtx, n = 10) {
  const qs = [];
  if (!parts.length) return qs;
  if (parts.every(p => p.el)) {
    const byEl = new Map();
    parts.forEach(p => { if (!byEl.has(p.el)) byEl.set(p.el, p); });
    const reps = [...byEl.values()];
    if (!reps.length) return qs;
    for (let i = 0; i < n; i++) {
      const rep = reps[Math.floor(Math.random() * reps.length)];
      qs.push({ kind: 'element', el: rep.el, elName: elementName(rep) });
    }
    return qs;
  }
  const byGroup = new Map();
  parts.forEach(p => {
    if (p.quizGroup && !byGroup.has(p.quizGroup))
      byGroup.set(p.quizGroup, p.quizGroupLabel || p.quizGroup);
  });
  if (byGroup.size >= 2) {
    const keys = shuffle([...byGroup.keys()]);
    const count = Math.min(n, keys.length);
    for (let i = 0; i < count; i++)
      qs.push({ kind: 'group', key: keys[i], label: byGroup.get(keys[i]) });
    return qs;
  }
  const pool = shuffle(parts.filter(p => p.group.visible));
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) qs.push({ kind: 'part', part: pool[i] });
  return qs;
}

/* Did the clicked part answer this question correctly? */
export function isCorrectAnswer(question, part) {
  if (!part) return false;
  if (question.kind === 'part') return part === question.part;
  if (question.kind === 'group') return part.quizGroup === question.key;
  return part.el === question.el;
}

/* One representative target part to highlight when the user answers wrong. */
export function findTargetPart(question, parts) {
  if (question.kind === 'part') return question.part;
  if (question.kind === 'group')
    return parts.find(p => p.quizGroup === question.key) || null;
  return parts.find(p => p.el === question.el) || null;
}

/* Human-readable prompt for a question. */
export function questionPrompt(question, atlasCtx) {
  if (question.kind === 'part') return `Click the: ${question.part.info.name}`;
  if (question.kind === 'group') return `Click the: ${question.label}`;
  const mol = atlasCtx.molecule;
  const article = /^[aeiou]/i.test(question.elName) ? 'an' : 'a';
  const where = mol ? ` — in ${mol.name}` : '';
  return `Click ${article} ${question.elName.toLowerCase()} atom${where}`;
}

/* Short label of what the question is asking for (used in feedback). */
export function questionTargetLabel(question) {
  if (question.kind === 'part') return question.part.info.name;
  if (question.kind === 'group') return question.label;
  return `${question.elName} atom`;
}

/* End-of-round message tier. */
export function quizTier(score, total) {
  const pct = total ? score / total : 0;
  if (pct >= 0.9) return { title: 'Exam ready 🏆', sub: 'Outstanding — you know this cold.' };
  if (pct >= 0.7) return { title: 'Almost there 💪', sub: 'One more round and it will stick.' };
  if (pct >= 0.4) return { title: 'Good effort 🌱', sub: 'Explore the atlas, then try again.' };
  return { title: 'Keep exploring 🔍', sub: 'Click around the atlas to learn the parts, then retry.' };
}

/* Deduplicated search entries from the current atlas parts. */
export function buildSearchEntries(parts) {
  const seen = new Set();
  const out = [];
  parts.forEach(p => {
    const name = p.info.name;
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ part: p, name, tag: p.info.tag });
  });
  return out;
}

export function searchEntries(entries, query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return entries.filter(e => e.name.toLowerCase().includes(q)).slice(0, limit);
}

/* -------------------------------------------------- MCAT prep sections */
export const MCAT_SECTIONS = [
  {
    id: 'bio-biochem', name: 'Bio / Biochem',
    tagline: 'Anatomy, cells, the neuron, amino acids — the living-systems half of the MCAT.',
    atlases: ['anatomy', 'cell', 'plantcell', 'neuron', 'biochem']
  },
  {
    id: 'chem-phys', name: 'Chem / Phys',
    tagline: 'Molecules and organic functional groups — gen chem + ochem essentials.',
    atlases: ['molecules', 'ochem']
  }
];
export const MCAT_ROUND = 10;

/* ------------------------------------------------- learn mode (micro-quiz) */
/* Stable mastery key: atlas + dynamic context (molecule/view/amino acid) + part. */
export function masteryKey(atlasId, contextId, partId) {
  return `${atlasId}|${contextId}|${partId}`;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* Turn the part's first description sentence into a fill-in-the-blank stem.
 * Returns null when the part name can't be blanked cleanly (caller falls back). */
export function blankStem(part) {
  const name = String((part.info && part.info.name) || '');
  const paren = (name.match(/\(([^)]+)\)/) || [])[1] || '';
  const core = name.replace(/\s*\(.*\)$/, '').trim();
  const words = core.split(/\s+/).filter(w => w.length > 3 && !/^(the|and|with|from)$/i.test(w));
  const cands = [];
  const push = c => { if (c && !cands.includes(c)) cands.push(c); };
  push(core); push(paren);
  words.forEach(w => {
    push(w);
    if (/on$/i.test(w)) push(w.replace(/on$/i, 'a'));
    else if (/a$/i.test(w) && w.length > 4) push(w.replace(/a$/i, 'on'));
  });
  const text = (part.info.desc && part.info.desc[0]) || '';
  if (!text || !cands.length) return null;
  for (const c of cands) {
    if (new RegExp(escapeRegExp(c) + 's?', 'i').test(text)) {
      const blanked = text.replace(new RegExp(escapeRegExp(c) + 's?', 'gi'), '_____');
      const sentences = blanked.match(/[^.!?]+[.!?]+/g) || [blanked];
      return `Which part is described here? \u201c${sentences.slice(0, 2).join(' ').trim()}\u201d`;
    }
  }
  return null;
}

/* Build a one-question micro quiz about a just-seen part.
 * kindHint cycles 'recall' -> 'choice' -> 'element'; the caller falls back
 * to 'recall' when the hinted kind isn't possible for this part. */
export function sampleMicroQuestion(part, parts, kindHint) {
  if (!part) return null;
  if (kindHint === 'element' && part.el) {
    return { kind: 'element', el: part.el, elName: elementName(part), part };
  }
  if (kindHint === 'choice' && parts.length >= 3) {
    const others = shuffle(
      parts.filter(p => p !== part && p.info.name !== part.info.name)).slice(0, 2);
    if (others.length < 2) return null;
    const options = shuffle([part, ...others]);
    return {
      kind: 'choice', part,
      stem: blankStem(part) || 'Which one did you just explore?',
      options: options.map(p => p.info.name)
    };
  }
  const label = part.quizGroup
    ? (part.quizGroupLabel || part.quizGroup)
    : part.info.name;
  return { kind: 'recall', part, label };
}
