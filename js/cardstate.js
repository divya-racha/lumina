/* Lumina — info-card visibility state (pure, no DOM, no three.js).
 *
 * Single source of truth for "is an info card open". main.js routes every
 * open/close through here so mode transitions (passage figure tasks,
 * practical exams) can force-close reliably and Close always wins over
 * stale auto-opens (e.g. the molecule card loadAtlas opens for
 * biochem/molecules/ochem).
 */
export function createCardState() {
  return { open: false };
}

/* Record that the card was opened (call alongside adding the .open class). */
export function markCardOpen(state) {
  state.open = true;
  return state;
}

/* Record that the card was closed (call alongside removing .open).
 * Idempotent: closing an already-closed card is a no-op. */
export function markCardClosed(state) {
  state.open = false;
  return state;
}

export function isCardOpen(state) {
  return !!state.open;
}

/* Whether the UI may open an info card in the given mode.
 * Practical exams promise "no info cards": the card may not open mid-exam,
 * and any open card is force-hidden for the exam's duration. */
export function infoCardAllowed(mode) {
  return !(mode && mode.examActive);
}
