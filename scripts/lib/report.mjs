// The card. Arithmetic in, sentences out; nothing is decided here.
//
// Two things it must never do. It must not print a level over fewer samples
// than the floor §5.3 requires and this implementation set — a rate over four
// occasions is a fact about those four — and it must not print a number
// without the sentence that says what the number is a claim about.
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
  L.push(`  · Under ${SHOW_RATE} occasions no rate is printed at all — §5.3 requires`);
  L.push(`    a floor and leaves its height open; ${SHOW_RATE} is this implementation's own value.`);
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

/**
 * The two findings a reading owes, which are not one ranking.
 *
 * Standing and evidence are different things and saying them as one number
 * loses both. A situation standing lower than the others is a fact about the
 * person. A situation with two occasions in it is a fact about the record —
 * nothing is known there yet, and calling it their weakest says something
 * about them that nothing supports.
 *
 * So standing is compared only where there is enough to compare (§5.3's floor,
 * for the same reason a rate is not printed under it), and thinness is
 * reported separately and always.
 */
export function findings(st) {
  const lows = [];
  const thin = [];
  for (const c of CONFERRING) {
    const s = st.situations[c];
    const seen = s ? s.seen : 0;
    if (seen < SHOW_RATE) thin.push({ column: c, seen, short: SHOW_RATE - seen });
    if (s && seen >= SHOW_RATE) lows.push({ column: c, held: s.held, reached: s.reached, next: s.next, short: s.short, seen });
  }
  // Lowest by what is held; where nothing is held anywhere, by what has been
  // reached. A tie is a tie and is reported as one rather than broken by the
  // order the situations happen to be listed in.
  let standing = null;
  if (lows.length >= 2) {
    const key = (x) => (x.held * 10) + x.reached;
    const min = Math.min(...lows.map(key));
    const at = lows.filter((x) => key(x) === min);
    standing = { tied: at.length > 1, at, comparable: lows.length };
  }
  // An empty situation is the extreme of thinness and never of standing:
  // nothing is known there, which is not the same as standing low.
  thin.sort((a, b) => a.seen - b.seen);
  return { standing, thin };
}

/** One line naming where a reading stands lowest, or why it cannot say. */
export function lowestLine(f) {
  if (!f.standing) return 'lowest:   two situations have to have enough in them before either can be called lower';
  const names = f.standing.at.map((x) => SITUATION_NAMES[x.column]).join(' and ');
  const x = f.standing.at[0];
  const where = x.held ? `holds L${x.held} ${LEVEL_NAMES[x.held]}` : `holds nothing yet, reaching L${x.reached} ${LEVEL_NAMES[x.reached]}`;
  return `lowest:   ${names}${f.standing.tied ? ' — level' : ''}, ${where}; ${f.standing.comparable} situation(s) have enough to compare`;
}

/** One line naming where the record is too thin to say anything. */
export function thinnestLine(f) {
  if (!f.thin.length) return 'thinnest: every situation has enough occasions for a rate to mean something';
  const t = f.thin[0];
  if (!t.seen) return `thinnest: ${SITUATION_NAMES[t.column]} — nothing in your record at all, so nothing is known there`;
  return `thinnest: ${SITUATION_NAMES[t.column]} — ${t.seen} occasion${t.seen === 1 ? '' : 's'}; ${t.short} more before a rate means anything`;
}

/** Kept for the long card, which names one thing to work on. */
export function weakest(st) {
  const f = findings(st);
  const empty = f.thin.find((t) => !t.seen);
  if (empty) return { column: empty.column, why: 'no occasion in this record at all' };
  if (f.standing) {
    const x = f.standing.at[0];
    return { column: x.column, held: x.held, next: x.next, short: x.short };
  }
  const t = f.thin[0];
  return t ? { column: t.column, why: `only ${t.seen} occasion(s) — too thin to stand anything on` } : null;
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
  // Both rows of the head, every time. The number carries the order and the
  // name carries which level it is; printed apart, the number is forgettable
  // and the name has nothing to sort it by. Somebody who looks at this screen
  // weekly should not have to go and look up which one Chronicle was.
  const W = 10;
  L.push(`  ${''.padEnd(11)}${[1, 2, 3, 4, 5].map((r) => `L${r}`.padStart(W)).join('')}`);
  L.push(`  ${''.padEnd(11)}${[1, 2, 3, 4, 5].map((r) => LEVEL_NAMES[r].padStart(W)).join('')}`);
  for (const c of COLUMNS) {
    const s = st.situations[c];
    const cells = [1, 2, 3, 4, 5].map((r) => {
      const cell = s && s.rungs[r];
      if (!cell) return '·'.padStart(W);
      return `${cell.pos}/${cell.n}${cell.met ? '*' : ''}`.padStart(W);
    }).join('');
    let note = '';
    if (!s) note = '   nothing in your record yet';
    else if (!CONFERRING.includes(c)) note = '   recorded, not counted';
    else if (s.givenBack) note = `   L${s.givenBack} given back`;
    L.push(`  ${SITUATION_NAMES[c].padEnd(11)}${cells}${note}`);
  }
  L.push('');
  // The whole vocabulary, in the standard's own words, on the screen somebody
  // looks at most. A name nobody is shown the meaning of is a name nobody
  // keeps, and six of them are what this standard is cited by.
  if (meta.glosses) {
    for (const r of [1, 2, 3, 4, 5, 6]) {
      const g = meta.glosses[r];
      if (g) L.push(`  L${r} ${LEVEL_NAMES[r].padEnd(10)} ${g}`);
    }
    L.push('');
  }
  L.push(`  ${st.level ? `held: L${st.level} ${LEVEL_NAMES[st.level]}` : 'held: nothing yet'} — a height counts when ${NEED} occasions reach it and ${Math.ceil(NEED * PASS)} are met (* = held)`);
  const f = findings(st);
  L.push(`  ${lowestLine(f)}`);
  L.push(`  ${thinnestLine(f)}`);
  L.push('  what you left open, and what closes it:  cs gap');
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
const occasions = (side) => (side ? Object.values(side.cells || {}).reduce((n, [, m]) => n + m, 0) : 0);

/**
 * What moved, in the fewest words that are still true.
 *
 * Three kinds of movement and they are not the same thing: a level taken or
 * given back, a height reached for the first time, and evidence arriving where
 * there was not enough of it. The third is most of what happens week to week,
 * and a line that only reported the first two said "nothing changed" to
 * somebody whose thinnest situation had just doubled.
 */
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
    else {
      const gained = occasions(b) - occasions(a);
      if (gained > 0) out.push(`${SITUATION_NAMES[c]} +${gained} occasion${gained === 1 ? '' : 's'}`);
    }
  }
  return out;
}

/** The trajectory: one line per reading that moved anything. */
export function trail(entries) {
  const L = [];
  L.push('');
  L.push('  EVERY READING SO FAR');
  L.push('');
  L.push(`  ${'when'.padEnd(12)}${'tasks'.padStart(6)}   ${COLUMNS.map((c) => SITUATION_NAMES[c].slice(0, 9).padStart(10)).join('')}`);
  for (const [i, e] of entries.entries()) {
    const cells = COLUMNS.map((c) => {
      const s = e.situations[c];
      if (!s) return '·'.padStart(10);
      return `${s.held ? `L${s.held}*` : `L${s.reached}`}/${occasions(s)}`.padStart(10);
    }).join('');
    const moved = i ? movement(entries[i - 1], e).filter((m) => !/^\+\d+ task/.test(m)) : [];
    L.push(`  ${String(e.at).slice(0, 10).padEnd(12)}${String(e.tasks).padStart(6)}   ${cells}`);
    if (moved.length) L.push(`  ${' '.repeat(18)}${moved.join(' · ')}`);
  }
  L.push('');
  L.push('  Lx = highest reached, Lx* = held · /n = occasions counted in that situation');
  L.push('');
  return L.join('\n');
}

/**
 * Where the next step is, situation by situation.
 *
 * §8 puts three things in the method, and only the third is arranging an
 * occasion. The second — naming the single lowest-standing capability — is
 * part of the reading, and a card that prints a count without it has done
 * two thirds of what a reading is for.
 *
 * Every sentence here is the standard's own, parsed from it, or the person's
 * own, quoted from the message it was credited to. Nothing is written for
 * them: a better sentence handed over would be the assistant's, and the
 * standard says in so many words that what the assistant said is never theirs.
 */
export function gaps(st, tasks, standard, questionStandard = '') {
  const defs = rungDefinitions(standard);
  // The fourth standard is one situation from its first line, so it carries no
  // heading naming it. Read with one put in front, its levels parse exactly as
  // the others do and stay the sentences that standard actually applies.
  const qDefs = questionStandard
    ? rungDefinitions(`**knowing** — the part of a message that asks to be told something.\n\n${questionStandard}`)
    : {};
  const said = (col, r) => (col === 'knowing'
    ? (qDefs.knowing && qDefs.knowing[r]) || ''
    : (defs[col] && defs[col][r]) || '');
  /** What the situation IS, in the standard's own opening sentence for it. */
  const situationIs = (col) => {
    const m = new RegExp(`^\\*\\*${col}\\*\\* — ([^]*?)(?=\\n\\n)`, 'm').exec(standard);
    return m ? m[1].replace(/\s+/g, ' ').trim() : '';
  };
  const L = [];
  L.push('');
  L.push('  WHERE THE NEXT STEP IS');
  L.push('');
  for (const c of COLUMNS) {
    const s = st.situations[c];
    const name = SITUATION_NAMES[c];
    if (!s) {
      L.push(`  ${name} — nothing in your record at all`);
      L.push(...wrap(`In ${tasks.length} task${tasks.length === 1 ? '' : 's'} you never said this. Not saying it is not a failure and nothing counts against you for it. A level is held only where every conferring situation holds it, so this one holds the whole reading at nothing until something appears here.`, '      '));
      // What this situation is, not what its lowest level is: somebody who has
      // never been here needs to recognise the occasion when it arrives, and
      // the bottom level describes the poorest way of taking it.
      const what = situationIs(c);
      if (what) {
        L.push('      what this situation is:');
        L.push(...wrap(what, '        '));
      }
      L.push('');
      continue;
    }
    const at = s.reached;
    const next = Math.min(5, at + 1);
    // Their own sentence at the height they reached: the best evidence there
    // is of what they can already do, and the one to read the next step
    // against.
    let mine = '';
    for (const t of tasks) {
      for (const p of t.placements || []) {
        if (p.column === c && p.rung === at && p.cite && p.landed === 'yes') { mine = p.cite; break; }
      }
      if (mine) break;
    }
    L.push(`  ${name} — you reach L${at} ${LEVEL_NAMES[at]}${CONFERRING.includes(c) ? '' : ' (recorded, not counted)'}`);
    if (mine) L.push(...wrap(`your words: “${mine.replace(/\s+/g, ' ')}”`, '      '));
    if (said(c, at)) {
      L.push(`      what that closed:`);
      L.push(...wrap(said(c, at), '        '));
    }
    if (next > at && said(c, next)) {
      L.push(`      what L${next} ${LEVEL_NAMES[next]} closes that this does not:`);
      L.push(...wrap(said(c, next), '        '));
    }
    L.push('');
  }
  L.push('  This says what you left open. It does not write the sentence that');
  L.push('  would close it: a sentence handed to you would be the assistant\'s,');
  L.push('  and under this standard what the assistant said is never yours.');
  L.push('');
  return L.join('\n');
}
