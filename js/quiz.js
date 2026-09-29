/* ScienceAtlas — quiz + search logic (pure functions, no DOM).
 * Questions are sampled directly from the atlas part data objects, so the
 * quiz can never drift out of sync with what the atlases contain.
 *
 * atlasCtx: { id: 'anatomy' | 'cell' | 'molecules', molecule: <MOLECULES entry> | null }
 * A question is { kind: 'part', part } or { kind: 'element', el, elName }.
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

/* Sample `n` questions from the current atlas parts. */
export function sampleQuestions(parts, atlasCtx, n = 10) {
  const qs = [];
  if (atlasCtx.id === 'molecules') {
    // Ask for an atom of a random element type present in the current molecule.
    const byEl = new Map();
    parts.forEach(p => {
      if (p.el && !byEl.has(p.el)) byEl.set(p.el, p);
    });
    const reps = [...byEl.values()];
    if (!reps.length) return qs;
    for (let i = 0; i < n; i++) {
      const rep = reps[Math.floor(Math.random() * reps.length)];
      qs.push({ kind: 'element', el: rep.el, elName: elementName(rep) });
    }
    return qs;
  }
  // Anatomy / cell: sample distinct visible parts, no repeats within a round.
  const pool = shuffle(parts.filter(p => p.group.visible));
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) qs.push({ kind: 'part', part: pool[i] });
  return qs;
}

/* Did the clicked part answer this question correctly? */
export function isCorrectAnswer(question, part) {
  if (!part) return false;
  if (question.kind === 'part') return part === question.part;
  return part.el === question.el;
}

/* One representative target part to highlight when the user answers wrong. */
export function findTargetPart(question, parts) {
  if (question.kind === 'part') return question.part;
  return parts.find(p => p.el === question.el) || null;
}

/* Human-readable prompt for a question. */
export function questionPrompt(question, atlasCtx) {
  if (question.kind === 'part') return `Click the: ${question.part.info.name}`;
  const mol = atlasCtx.molecule;
  const article = /^[aeiou]/i.test(question.elName) ? 'an' : 'a';
  const where = mol ? ` — in ${mol.name}` : '';
  return `Click ${article} ${question.elName.toLowerCase()} atom${where}`;
}

/* Short label of what the question is asking for (used in feedback). */
export function questionTargetLabel(question) {
  if (question.kind === 'part') return question.part.info.name;
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
