// The card. Arithmetic in, sentences out; nothing is decided here.
//
// Two things it must never do. It must not print a level over fewer samples
// than the standard's floor — a rate over four occasions is a fact about those
// four — and it must not print a number without the sentence that says what
// the number is a claim about.
import { LEVEL_NAMES, SITUATION_NAMES, COLUMNS, CONFERRING, KNOWING_CONFERS_FROM,
  NEED, PASS, WARN, DROP, SHOW_RATE, DEPTH_BATCH, DEPTH_NEED } from './scale.mjs';
import { rungDefinitions } from './rungs.mjs';

/** What one more step up looks like, in the standard's own sentence.
 *
 *  Parsed out of the standard rather than written down a second time. Copied
 *  into a card it would drift from the one the reading actually applies, and
 *  the card would then be promising a step against a rule nobody is using. */
export function stepUp(column, rung, standard) {
  const defs = rungDefinitions(standard);
  const said = defs[column] && defs[column][rung];
  return said || '';
}

const pct = (r) => `${Math.round(r * 100)}%`;

/** Wrapped to the card's width, so the standard's own sentence can be printed
 *  whole rather than cut to fit. */
function wrap(text, indent, width = 72) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > width) { lines.push(indent + line.trim()); line = w; }
    else line = `${line} ${w}`;
  }
  if (line.trim()) lines.push(indent + line.trim());
  return lines;
}
const bar = (s) => '─'.repeat(s);

function situationLine(name, s) {
  const head = `${SITUATION_NAMES[name]}`.padEnd(11);
  if (!s) return `  ${head} no occasion in this record`;
  const held = s.held ? `L${s.held} ${LEVEL_NAMES[s.held]}` : 'nothing held yet';
  const bits = [`${held.padEnd(14)}`, `reached L${s.reached}`, `${s.seen} occasion${s.seen === 1 ? '' : 's'}`];
  if (s.givenBack) bits.push(`L${s.givenBack} given back`);
  if (!s.confers) bits.push('confers nothing');
  return `  ${head} ${bits.join(' · ')}`;
}

function rungTable(s) {
  const lines = [];
  for (const r of [1, 2, 3, 4, 5]) {
    const c = s.rungs[r];
    if (!c) continue;
    const rate = c.shownRate === null ? `${c.pos}/${c.n}` : `${c.pos}/${c.n} (${pct(c.shownRate)})`;
    const mark = c.met ? 'held' : (c.givenBack ? 'given back' : (c.n >= NEED ? 'short of the rate' : `${NEED - c.n} more to count`));
    const warn = c.warning ? '  ← failing' : '';
    lines.push(`      L${r} ${LEVEL_NAMES[r].padEnd(10)} ${rate.padEnd(14)} ${mark}${warn}`);
  }
  return lines;
}

export function card(st, meta = {}) {
  const L = [];
  L.push('');
  L.push('  THE COMMAND SCALE v1.0 — a reading of your own record');
  L.push(`  ${bar(58)}`);
  L.push('');

  const tasks = meta.tasks || 0;
  L.push(`  Read from ${tasks} closed task${tasks === 1 ? '' : 's'}${meta.sessions ? ` across ${meta.sessions} session${meta.sessions === 1 ? '' : 's'}` : ''}.`);
  L.push('');

  if (st.level) {
    L.push(`  LEVEL HELD:  L${st.level} ${LEVEL_NAMES[st.level]}`);
    L.push(`  Held means demonstrated in every conferring situation, not reached once.`);
  } else {
    L.push('  LEVEL HELD:  none yet');
    L.push('  A level is held only when every conferring situation holds it at that');
    L.push('  height. Holding nothing overall is the ordinary case and says the');
    L.push('  situations are uneven — the lines below say where.');
  }
  L.push('');
  L.push('  WHERE YOU STAND, SITUATION BY SITUATION');
  for (const c of COLUMNS) L.push(situationLine(c, st.situations[c]));
  L.push('');

  for (const c of COLUMNS) {
    const s = st.situations[c];
    if (!s) continue;
    L.push(`  ${SITUATION_NAMES[c]} — every height with a record`);
    L.push(...rungTable(s));
    if (s.samples < NEED) {
      L.push(`      to hold L${s.next} ${LEVEL_NAMES[s.next]}: ${s.short} more occasion${s.short === 1 ? '' : 's'} at that height, ${st.must} of ten met`);
    }
    // What that height IS, in the standard's own words, so the number beside
    // it is a claim somebody can act on rather than a score.
    const said = meta.standard ? stepUp(c, s.next, meta.standard) : '';
    if (said) {
      L.push(`      what L${s.next} ${LEVEL_NAMES[s.next]} is:`);
      L.push(...wrap(said, '        '));
    }
    L.push('');
  }

  // What was set aside, always, on both branches. An escape nobody counts is a
  // way for evidence to disappear quietly (§5.4).
  const aside = (st.setAside || []).length;
  L.push(`  SET ASIDE:   ${aside} occasion${aside === 1 ? '' : 's'} counted neither way`);
  L.push('               (a refusal, a limit of the environment, a failure with a');
  L.push('               cause of its own — reported because an uncounted escape');
  L.push('               is a way for evidence to vanish quietly)');
  L.push('');

  L.push('  WHAT THIS READING CANNOT SAY');
  L.push(`  · L6 Myth is read across batches of ${DEPTH_BATCH} closed tasks, ${DEPTH_NEED} batches at least.`);
  const batches = Math.floor(tasks / DEPTH_BATCH);
  L.push(`    You have ${batches} full batch${batches === 1 ? '' : 'es'}; ${DEPTH_NEED} are needed. Not read here.`);
  L.push('  · Question is placed and recorded and confers nothing, because nothing');
  L.push('    here arranges practice in it (B.2 "Conferring"). This implementation');
  L.push(`    states its conferring date as ${KNOWING_CONFERS_FROM || 'never'}.`);
  L.push(`  · Under ${SHOW_RATE} occasions no rate is printed at all.`);
  L.push('  · A reading over few tasks is a placement, not a measurement (§10).');
  L.push('');
  L.push(`  Thresholds in force: n=${NEED}, credit at ${pct(PASS)}, failing under ${pct(WARN)},`);
  L.push(`  withdrawn under ${pct(DROP)} — the published defaults of §5.3.`);
  L.push('');
  L.push('  Every placement above L1 quotes your own words and was checked against');
  L.push('  the message it is credited to. Run `cs why <situation>` to see them.');
  L.push('');
  return L.join('\n');
}

/** The single lowest-standing capability at the level they hold (§8). */
export function weakest(st) {
  const scored = CONFERRING.map((c) => st.situations[c]).filter(Boolean);
  if (!scored.length) return null;
  let worst = null;
  for (const c of CONFERRING) {
    const s = st.situations[c];
    if (!s) return { column: c, why: 'no occasion in this record at all' };
    if (!worst || s.held < worst.s.held) worst = { c, s };
  }
  return worst ? { column: worst.c, held: worst.s.held, next: worst.s.next, short: worst.s.short } : null;
}

/** The whole standing on one screen: four situations by five heights.
 *
 *  This is what somebody looks at when they want to know where they are, and
 *  it costs nothing to print — the counting is arithmetic over what is already
 *  on disk, so asking again asks no model anything. */
export function grid(st, meta = {}) {
  const L = [];
  const head = `${meta.tasks || 0} task${meta.tasks === 1 ? '' : 's'} · ${meta.sessions || 0} conversation${meta.sessions === 1 ? '' : 's'}`;
  L.push('');
  L.push(`  THE COMMAND SCALE — where you stand${' '.repeat(Math.max(1, 34 - head.length))}${head}`);
  L.push('');
  L.push(`  ${''.padEnd(11)}${[1, 2, 3, 4, 5].map((r) => `L${r}`.padStart(7)).join('')}`);
  for (const c of COLUMNS) {
    const s = st.situations[c];
    const cells = [1, 2, 3, 4, 5].map((r) => {
      const cell = s && s.rungs[r];
      if (!cell) return '·'.padStart(7);
      return `${cell.pos}/${cell.n}${cell.met ? '*' : ''}`.padStart(7);
    }).join('');
    let note = '';
    if (!s) note = '   nothing in your record yet';
    else if (!CONFERRING.includes(c)) note = '   recorded, not counted';
    else if (s.givenBack) note = `   L${s.givenBack} given back`;
    L.push(`  ${SITUATION_NAMES[c].padEnd(11)}${cells}${note}`);
  }
  L.push('');
  L.push(`  ${st.level ? `held: L${st.level} ${LEVEL_NAMES[st.level]}` : 'held: nothing yet'} — a height counts when ${NEED} occasions reach it and ${Math.ceil(NEED * PASS)} are met (* = held)`);
  const w = weakest(st);
  if (w) {
    L.push(w.why
      ? `  next:  ${SITUATION_NAMES[w.column]} — ${w.why}`
      : `  next:  ${SITUATION_NAMES[w.column]} stands lowest; ${w.short} more occasion(s) at L${w.next} ${LEVEL_NAMES[w.next]}`);
  }
  if (meta.delta && meta.delta.length) {
    L.push('');
    L.push(`  since your last reading: ${meta.delta.join(' · ')}`);
  }
  L.push('');
  return L.join('\n');
}

/** What a standing keeps, so that the next one can say what moved. */
export function snapshot(st, tasks) {
  const out = { at: new Date().toISOString(), tasks, level: st.level, situations: {} };
  for (const c of COLUMNS) {
    const s = st.situations[c];
    out.situations[c] = s
      ? { held: s.held, reached: s.reached, cells: Object.fromEntries(Object.entries(s.rungs).map(([r, v]) => [r, [v.pos, v.n]])) }
      : null;
  }
  return out;
}

/** What moved, in the fewest words that are still true. */
export function movement(prev, now) {
  if (!prev) return [];
  const out = [];
  if (now.tasks > prev.tasks) out.push(`+${now.tasks - prev.tasks} task${now.tasks - prev.tasks === 1 ? '' : 's'}`);
  for (const c of COLUMNS) {
    const a = prev.situations[c];
    const b = now.situations[c];
    if (!b) continue;
    if (!a) { out.push(`${SITUATION_NAMES[c]} first read`); continue; }
    if (b.held > a.held) out.push(`${SITUATION_NAMES[c]} now holds L${b.held} ${LEVEL_NAMES[b.held]}`);
    else if (b.held < a.held) out.push(`${SITUATION_NAMES[c]} gave back L${a.held} ${LEVEL_NAMES[a.held]}`);
    else if (b.reached > a.reached) out.push(`${SITUATION_NAMES[c]} reached L${b.reached} ${LEVEL_NAMES[b.reached]} for the first time`);
  }
  return out;
}
