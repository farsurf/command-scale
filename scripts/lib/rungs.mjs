// The levels, read out of the standard rather than written down a second time.
//
// A reading tells somebody what one more step up would look like, and that
// sentence has to be the ladder's own. Copied into a second file it would drift
// from the one the judging actually uses, and then the card would be promising
// a step against a rule nobody is applying. So this parses the standard.
//
// What it takes is each rung's own positive definition — the sentences that say
// what the rung IS. The standard then turns to what the rung is not, and to the
// mistakes it guards against; those are written for somebody placing a message
// and are of no use to somebody being told where they stand.

// Any bold word followed by a dash opens a column. The names are not written
// here: the standard is the only place that says what the columns are, and a
// list of them in this file would be a second copy that goes stale silently —
// a renamed or added situation would simply vanish from every card. Output-field
// headings in the standard match this shape too and are harmless: a column is
// only created below when a numbered rung is actually closed under it.
const COLUMN_HEAD = /^\*\*([A-Za-z][A-Za-z ]{0,20})\*\*\s+—/;
const RUNG_HEAD = /^\*\*([1-5])\.\*\*\s*/;
// Where a rung stops defining itself and starts guiding whoever applies it. The
// standard marks every one of those in italics, and it uses italics for nothing
// else inside a rung — so the first of them is the end of the definition. It is
// matched on the run of text and not on a line, because the standard wraps its
// paragraphs and the mark lands mid-line as often as not.
const TURNS_TO_GUIDANCE = /\s\*(?=[A-Z])/;

/** One line, whatever the source wrapped it across. */
const oneLine = (lines) => lines.join(' ').replace(/\s+/g, ' ').trim();

/**
 * Every column's rungs, as `{ asking: { 1: '…', … }, reacting: …, blocked: … }`.
 *
 * A column or a rung the standard does not carry is simply absent, so a caller
 * asking for one it does not have gets nothing rather than a plausible
 * sentence. The standard's sixth rung is read only across many tasks and never
 * inside one message, and it says so itself — so nothing above five is ever
 * returned from here, and what stands beyond five is not this file's to state.
 */
export function rungDefinitions(standard) {
  const out = {};
  let column = null;
  let rung = null;
  let held = [];
  const close = () => {
    if (column && rung && held.length) {
      const whole = oneLine(held);
      const cut = TURNS_TO_GUIDANCE.exec(whole);
      const said = (cut ? whole.slice(0, cut.index) : whole).trim();
      out[column] = out[column] || {};
      if (said && !out[column][rung]) out[column][rung] = said;
    }
    rung = null;
    held = [];
  };
  for (const raw of String(standard || '').split('\n')) {
    const line = raw.trim();
    const head = COLUMN_HEAD.exec(line);
    if (head) { close(); column = head[1]; continue; }
    if (!column) continue;
    const at = RUNG_HEAD.exec(line);
    if (at) {
      close();
      rung = Number(at[1]);
      held = [line.replace(RUNG_HEAD, '')];
      continue;
    }
    if (rung === null) continue;
    // A blank line ends the run. What follows it in the same rung is a separate
    // paragraph about how to apply the rung, not part of saying what it is.
    if (!line) { close(); continue; }
    held.push(line);
  }
  close();
  return out;
}
