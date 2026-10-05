/* Lumina — Practical Exam (label-it recall) logic (pure, no DOM, no three.js).
 *
 * A practical exam mimics real lab-practical stations: timed, pure recall,
 * no labels. Questions are sampled from the atlas part data objects (via
 * quiz.js sampleQuestions), then ordered weakest-first using the same
 * `lumina-mastery` store as learn mode, so the exam drills what you
 * actually miss.
 *
 * IMPORTANT: part OBJECTS are recreated when some views rebuild (e.g. the
 * Krebs view auto-advances every few seconds, mitosis stages rebuild). All
 * answer matching below is therefore ID-based, never identity-based.
 */
import { masteryKey } from './quiz.js';

/* Stations per exam round. */
export const EXAM_STATIONS = 10;
/* Time budget per station, in milliseconds. */
export const STATION_MS = 20000;
/* Scoring: base points for a correct answer + speed bonus, both in points. */
export const STATION_BASE_PTS = 100;
export const STATION_MAX_BONUS = 100;

/* Speed bonus in points: full bonus for an instant answer, 0 at timeout. */
export function timeBonus(elapsedMs) {
  const left = Math.max(0, STATION_MS - Math.max(0, elapsedMs));
  return Math.round((left / STATION_MS) * STATION_MAX_BONUS);
}

/* Points awarded for one station. Wrong answers and timeouts score 0. */
export function stationPoints(correct, elapsedMs) {
  return correct ? STATION_BASE_PTS + timeBonus(elapsedMs) : 0;
}

/* Representative LIVE part for a question (for mastery keys + highlight).
 * Resolved against the current parts array by id, so view rebuilds that
 * create brand-new part objects can't strand it. */
export function questionRepPart(question, parts) {
  if (!question || !parts) return null;
  if (question.kind === 'part')
    return parts.find(p => p.id === question.part.id) || null;
  if (question.kind === 'group')
    return parts.find(p => p.quizGroup === question.key) || null;
  if (question.kind === 'element')
    return parts.find(p => p.el === question.el) || null;
  return null;
}

/* Did the clicked part answer this exam question correctly?
 * ID-based so mid-exam view rebuilds (Krebs auto-step, mitosis stages)
 * can never turn a right answer wrong. */
export function isCorrectExamAnswer(question, part) {
  if (!question || !part) return false;
  if (question.kind === 'part') return part.id === question.part.id;
  if (question.kind === 'group') return part.quizGroup === question.key;
  return part.el === question.el;
}

/* Weakness score for adaptive ordering: higher = weaker = asked earlier.
 * 2 = never attempted, 1 = missed before, 0 = mastered. The mastery map
 * uses the canonical masteryKey format from quiz.js (`a|b|c`), where a
 * missing key means unseen, 0 means missed, and truthy means learned. */
export function weaknessOf(question, masteryMap, atlasId, ctxId, parts) {
  const rep = questionRepPart(question, parts);
  if (!rep) return 2;
  const v = (masteryMap || {})[masteryKey(atlasId, ctxId, rep.id)];
  if (v === undefined) return 2;
  return v ? 0 : 1;
}

/* Order questions weakest-first; ties broken randomly. With an empty
 * mastery map every question scores 2, so this degrades to random order. */
export function orderByWeakness(questions, masteryMap, atlasId, ctxId, parts) {
  return (questions || [])
    .map(q => ({ q, w: weaknessOf(q, masteryMap, atlasId, ctxId, parts), r: Math.random() }))
    .sort((a, b) => b.w - a.w || a.r - b.r)
    .map(s => s.q);
}

/* Pass/fail tier in the quizTier style, with lab-practical language. */
export function examTier(score, total) {
  const pct = total ? score / total : 0;
  if (pct >= 0.9)
    return { pass: true, title: 'Practical passed \uD83C\uDFC6',
             sub: 'Flawless under pressure \u2014 genuinely lab-ready.' };
  if (pct >= 0.7)
    return { pass: true, title: 'Practical passed \u2705',
             sub: 'You cleared the bar. Trim those seconds for a stronger pass.' };
  if (pct >= 0.4)
    return { pass: false, title: 'Practical failed \uD83D\uDCCB',
             sub: 'Below the pass line \u2014 drill your weak stations and retake.' };
  return { pass: false, title: 'Practical failed \uD83D\uDD0D',
           sub: 'Back to the atlas \u2014 explore the parts, then retake the exam.' };
}

/* Build the end-of-exam report from per-station results.
 * A result is { correct, timedOut, elapsedMs, q, pickedName, pts }.
 * Average answer time excludes timed-out stations (no answer was given). */
export function buildExamReport(results) {
  const rs = results || [];
  const total = rs.length;
  const correct = rs.filter(r => r.correct).length;
  const timedOut = rs.filter(r => r.timedOut).length;
  const answered = rs.filter(r => !r.timedOut);
  const avgMs = answered.length
    ? Math.round(answered.reduce((s, r) => s + r.elapsedMs, 0) / answered.length)
    : 0;
  const points = rs.reduce((s, r) => s + stationPoints(r.correct, r.elapsedMs), 0);
  const maxPoints = total * (STATION_BASE_PTS + STATION_MAX_BONUS);
  return { total, correct, timedOut, avgMs, points, maxPoints,
           tier: examTier(correct, total) };
}
