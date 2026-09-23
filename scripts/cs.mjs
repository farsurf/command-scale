#!/usr/bin/env node
// The instrument. It prepares what a reading is taken from, checks what a
// reading claims, and counts what survives. It never asks a model anything:
// the reading is taken by whichever agent is running this skill, which is why
// no key is needed and why nothing leaves this machine.
//
// Everything it writes goes under .command-scale/ in the directory it is run
// from. A run that stops half way is continued rather than started again.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// Where this file is. Taken from the module URL through the conversion node
// provides for it rather than from its .pathname: on Windows that property
// hands back /C:/… with a leading slash, which path.join then treats as a
// directory of its own, and every file this program reads beside itself — the
// standards, the spec — silently comes back empty.
const HERE = path.dirname(fileURLToPath(import.meta.url));
import { turnsFrom, knownRecordDirs, sessionFiles } from './lib/transcripts.mjs';
import { page } from './lib/page.mjs';
import { verifyPlacements, answerWasUnusable, standing, UNUSABLE, COLUMNS,
  SITUATION_NAMES, nameOf, CONFERRING } from './lib/scale.mjs';

/** The two passes. They are taken separately, against separate standards, and
 *  are blind to each other: held in one standard the fourth situation's
 *  arrival moves the other three. */
const PASSES = {
  place: { file: 'reading-place', prompt: 'prompts/placing.md',
    only: ['asking', 'reacting', 'blocked'],
    says: 'the first three situations — what should become true, what is true of what came back, and that progress has stopped' },
  know: { file: 'reading-know', prompt: 'prompts/knowing.md',
    only: ['knowing'],
    says: 'the fourth situation on its own — what is asked to be told' },
};
import { card, weakest, grid, snapshot, movement, gaps, trail } from './lib/report.mjs';

// A reading is about a person, not about a project, so what it keeps lives
// with the person. Kept beside whatever directory the command happened to be
// run from, somebody working in three repositories would have three separate
// records of themselves, each too thin to hold anything, and the level would
// depend on where they were standing when they asked.
const WORK = path.resolve(process.env.COMMAND_SCALE_DIR || path.join(os.homedir(), '.command-scale'));
const read = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const write = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, 2)); };
const writeText = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const sessionDirs = () => {
  try { return fs.readdirSync(path.join(WORK, 'sessions')).sort(); } catch { return []; }
};
const sess = (id) => path.join(WORK, 'sessions', id);

/** Padding that counts what a terminal shows, not what JavaScript counts: a
 *  CJK character takes two columns, and objectives arrive in whatever language
 *  they were typed in. */
const wide = (s) => [...String(s)].reduce((n, ch) => n + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1), 0);
const padWide = (s, w) => {
  let out = '';
  for (const ch of String(s)) { if (wide(out + ch) > w) break; out += ch; }
  return out + ' '.repeat(Math.max(0, w - wide(out)));
};

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

/** Their words, numbered, each followed by what came back after it. */
function groupingInput(turns) {
  return turns.map((t, i) => [
    `[${i}] ${t.at ? `${t.at.slice(0, 16).replace('T', ' ')} — ` : ''}${t.quote}`,
    `      what came back: ${t.back || 'not recorded'}${t.tools && t.tools.length ? ` (tools used: ${t.tools.join(', ')})` : ''}`,
    t.notInput ? `      NOT INPUT: ${t.notInput}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

/** Attach turns to the tasks the reading proposed, and say out loud when a
 *  message landed in none or in two. A message in no task is evidence quietly
 *  dropped; a message in two is one thing they said counted twice. */
function applyGrouping(turns, grouping) {
  const tasks = [];
  const used = new Map();
  // Messages that were never an attempt to say anything, marked rather than
  // removed: they stay in their task and in their order, because what follows
  // one of them is often only readable because it happened. The marking is
  // made by a step that read the conversation and never saw the ladder.
  const empty = new Map();
  for (const e of (grouping && grouping.notInput) || []) {
    if (Number.isInteger(e && e.message)) empty.set(e.message, String(e.why || '').trim());
  }
  for (const [i, t] of ((grouping && grouping.tasks) || []).entries()) {
    const idx = (t.messages || []).filter((n) => Number.isInteger(n) && n >= 0 && n < turns.length);
    for (const n of idx) used.set(n, (used.get(n) || 0) + 1);
    tasks.push({
      n: i, objective: t.objective || null,
      turns: idx.map((n) => (empty.has(n)
        ? { ...turns[n], notInput: turns[n].notInput || empty.get(n) || 'not an attempt to say anything' }
        : turns[n])),
      at: idx.length ? turns[idx[0]].at : '', lastAt: idx.length ? turns[idx[idx.length - 1]].at : '',
    });
  }
  const missing = turns.map((_, i) => i).filter((i) => !used.has(i));
  const twice = [...used.entries()].filter(([, c]) => c > 1).map(([i]) => i);
  return { tasks: tasks.filter((t) => t.turns.length), missing, twice };
}

/** One task as the reading sees it. */
function judgeInput(task) {
  const lines = [
    `Objective: ${task.objective || '(not stated)'}`,
    '',
    'Their messages, in order, each with what came back after it:',
  ];
  task.turns.forEach((t, i) => {
    lines.push(`[${i + 1}] THEY SAID: ${t.quote}`);
    lines.push(`    WHAT CAME BACK: ${t.back || 'not recorded'}${t.tools && t.tools.length ? ` (tools used: ${t.tools.join(', ')})` : ''}`);
    if (t.notInput) lines.push(`    THIS ONE WAS NOT INPUT: ${t.notInput}`);
  });
  return lines.filter(Boolean).join('\n');
}


/** What a conversation is, said by code alone: nothing is read by a model to
 *  decide whether it is worth reading. */
function candidates() {
  const out = [];
  for (const d of knownRecordDirs()) {
    for (const f of sessionFiles(d)) {
      const id = path.basename(f).replace(/\.[^.]+$/, '').slice(0, 24);
      if (fs.existsSync(path.join(sess(id), 'turns.json'))) continue;  // already prepared
      let turns = [];
      try { turns = turnsFrom(f); } catch { continue; }
      const theirs = turns.filter((t) => !t.notInput);
      if (theirs.length < 2) continue;
      out.push({
        file: f, id,
        project: path.basename(path.dirname(f)),
        // When they last said something in it, which is what "newest" means to
        // somebody choosing what to read, and what the row prints. Ordered by
        // anything else — when the file was last touched, say — the listing
        // would call itself newest first while showing an older conversation
        // above a newer one.
        at: (theirs[theirs.length - 1].at || theirs[0].at || '').slice(0, 10),
        turns: theirs.length,
        opens: (theirs[0].quote || '').replace(/\s+/g, ' ').slice(0, 64),
      });
    }
  }
  out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  return out;
}

/** What a run will cost, in the only units that mean anything here: how many
 *  readings the agent has to take.
 *
 *  Estimated from the number of their messages, because how many tasks a
 *  conversation holds is not known until it has been grouped. The ratio is
 *  this implementation's own guess and nothing in the standard fixes it, so
 *  what is printed is called an estimate everywhere it appears. */
const PER_TASK_PASSES = 2;
/** One conversation's estimate. A set's is the sum of its parts, so that a row
 *  and the total under it never disagree — rounded once per conversation and
 *  then added, three rows of five cannot add up to eleven. */
const estimateOne = (c) => {
  const tasks = Math.max(1, Math.ceil(c.turns / 3));
  return { tasks, readings: tasks * PER_TASK_PASSES + 1 };
};
const estimate = (list) => list.reduce((a, c) => {
  const one = estimateOne(c);
  return { tasks: a.tasks + one.tasks, readings: a.readings + one.readings };
}, { tasks: 0, readings: 0 });

/** A few whole slices of what is waiting, each with what reading it would cost.
 *
 *  Built from the conversations that are actually here rather than offered as
 *  fixed choices: a window with nothing in it is not printed, and neither is
 *  one that would read exactly what another already covers. */
function slices(all) {
  const day = 86400000;
  const iso = (d) => new Date(d).toISOString().slice(0, 10);
  const out = [];
  const seen = new Set();
  const add = (label, picked, how) => {
    if (!picked.length) return;
    const key = picked.map((c) => c.file).sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ label, n: picked.length, readings: estimate(picked).readings, how });
  };
  // Newest first within a budget, the same way --budget picks them, so the
  // cheapest way in is offered rather than left to be worked out. A first look
  // is what most people want and the standard says plainly what it is worth
  // (§10): a placement over a few tasks, not a measurement.
  const within = [];
  for (const c of all) if (estimate([...within, c]).readings <= 20) within.push(c);
  add('a first look', within, 'node scripts/cs.mjs import --budget 20');
  add('the newest 3', all.slice(0, 3), 'node scripts/cs.mjs import --sessions 3');
  for (const days of [7, 30]) {
    const from = iso(Date.now() - (days * day));
    add(`the last ${days} days`, all.filter((c) => c.at >= from), `node scripts/cs.mjs import --since ${from}`);
  }
  const byProject = new Map();
  for (const c of all) byProject.set(c.project, (byProject.get(c.project) || 0) + 1);
  if (byProject.size > 1) {
    const [name] = [...byProject.entries()].sort((a, b) => b[1] - a[1])[0];
    add(`everything from ${name}`, all.filter((c) => c.project === name), `node scripts/cs.mjs import --project ${name}`);
  }
  add('everything waiting', all, `node scripts/cs.mjs import --sessions ${all.length}`);
  return out;
}

function cmdList() {
  const since = arg('since', '');
  const project = arg('project', '');
  const limit = Number(arg('limit', 20));
  let all = candidates();
  if (since) all = all.filter((c) => c.at >= since);
  if (project) all = all.filter((c) => c.project.includes(project));
  const shown = all.slice(0, limit);
  if (!shown.length) { console.log('Nothing new to read.'); return; }
  console.log(`\n  ${all.length} conversation(s) not yet read${since ? ` since ${since}` : ''}${project ? ` in ${project}` : ''}. Newest first:\n`);
  shown.forEach((c, i) => {
    const one = estimate([c]).readings;
    console.log(`  ${String(i + 1).padStart(3)}  ${c.at}  ${String(c.turns).padStart(3)} msg  ~${String(one).padStart(3)} readings  ${c.project.slice(0, 20).padEnd(20)}  ${c.opens}`);
  });
  const e = estimate(shown);
  console.log(`\n  Reading all ${shown.length} of these: about ${e.tasks} task(s), ${e.readings} readings.`);
  console.log('');
  // Whole slices rather than a menu of everything. A list of fifteen lines is
  // a directory, and somebody reading a directory still does not know which
  // lines to pick; a few slices with their cost beside them is a choice that
  // can be made in one look. The numbered list stays, for anybody who wants to
  // name conversations one at a time.
  console.log('  WAYS TO CHOOSE, WITH WHAT EACH WOULD COST');
  const ways = slices(all);
  const w = Math.max(21, ...ways.map((o) => o.label.length));
  for (const o of ways) {
    const cost = `${o.n} conversation(s), ~${o.readings} readings`;
    console.log(`    ${o.label.padEnd(w)}  ${cost.padEnd(34)}  ${o.how}`);
  }
  console.log(`    ${'or name them yourself'.padEnd(w)}  ${' '.repeat(34)}  node scripts/cs.mjs import --take 1,2,5`);
  console.log('');
  console.log('  Choosing your best conversations and leaving out the rest makes the');
  console.log('  reading a fact about those conversations rather than about you.');
  console.log('');
}

function cmdImport() {
  // Said before the first file is written rather than after. Somebody watching
  // a reading being taken sees files appearing and no statement of what they
  // are; read as tampering, the natural thing to do is stop the run, and a run
  // stopped there has produced nothing. One line, up front, costs nothing and
  // is the difference between a record and a rummage.
  console.log(`Readings are kept under ${WORK}, and nothing else on this machine is written.`);
  console.log('To remove them at any point: node scripts/cs.mjs forget --all');
  console.log('');
  const howMany = Number(arg('sessions', 5));
  const file = arg('file', '');
  const take = arg('take', '');
  const since = arg('since', '');
  const project = arg('project', '');
  let sources = [];
  if (file) {
    sources = [path.resolve(file)];
  } else {
    let all = candidates();
    if (!all.length) {
      console.log('Nothing new to read. Point at a saved conversation instead:');
      console.log('  node scripts/cs.mjs import --file <a saved conversation>');
      process.exit(1);
    }
    if (since) all = all.filter((c) => c.at >= since);
    if (project) all = all.filter((c) => c.project.includes(project));
    const budget = Number(arg('budget', 0));
    if (take) {
      const want = new Set(take.split(',').map((n) => Number(n.trim())));
      all = all.filter((_, i) => want.has(i + 1));
    } else if (budget > 0) {
      // Bounded by what it will cost rather than by how many conversations it
      // is: one long conversation can cost more than many short ones, and
      // somebody choosing how much to spend is choosing readings, not files.
      // Newest first, skipping any that would take the total past the budget
      // rather than stopping at the first one that does: a single long
      // conversation at the top would otherwise either blow the budget or hide
      // every short one behind it.
      const picked = [];
      for (const c of all) {
        if (estimate([...picked, c]).readings <= budget) picked.push(c);
      }
      if (!picked.length) {
        const cheapest = all.reduce((a, b) => (estimate([a]).readings <= estimate([b]).readings ? a : b));
        console.log(`Nothing fits a budget of ${budget} readings. The smallest conversation waiting`);
        console.log(`is ${cheapest.at}, ${cheapest.turns} messages, about ${estimate([cheapest]).readings} readings.`);
        process.exit(1);
      }
      all = picked;
    } else {
      // A handful by default, newest first, and said as what §10 says it is: a
      // reading over few tasks is a placement rather than a measurement. A
      // first run that read everything would spend a long time before saying
      // anything at all, and what it would buy — crossing the floor and the
      // sample the standard asks for — is bought as well by coming back.
      all = all.slice(0, howMany);
    }
    const e = estimate(all);
    console.log(`Reading ${all.length} conversation(s): about ${e.tasks} task(s), ${e.readings} readings to take.`);
    sources = all.map((c) => c.file);
  }
  let kept = 0;
  const done = [];
  for (const src of sources) {
    const turns = turnsFrom(src);
    // A conversation with fewer than two of their messages cannot carry a task
    // that was pursued; it is dropped rather than read, and said so here.
    if (turns.filter((t) => !t.notInput).length < 2) continue;
    const id = path.basename(src).replace(/\.[^.]+$/, '').slice(0, 24);
    const dir = sess(id);
    if (fs.existsSync(path.join(dir, 'turns.json'))) { done.push(id); continue; }
    write(path.join(dir, 'turns.json'), { source: src, turns });
    writeText(path.join(dir, 'grouping-input.txt'), groupingInput(turns));
    kept += 1;
    done.push(id);
  }
  console.log(`Prepared ${kept} new session(s); ${done.length} in this reading.`);
  console.log('');
  cmdNext();
}

function nextStep() {
  for (const id of sessionDirs()) {
    const d = sess(id);
    if (!fs.existsSync(path.join(d, 'grouping.json'))) {
      console.log(`NEXT — group one conversation into tasks.`);
      console.log(`  read:  ${path.join(d, 'grouping-input.txt')}`);
      console.log(`  rules: prompts/grouping.md`);
      console.log(`  write: ${path.join(d, 'grouping.json')}`);
      console.log(`  then:  node scripts/cs.mjs group ${id}`);
      return true;
    }
    const tasks = read(path.join(d, 'tasks.json'));
    if (!tasks) {
      console.log(`NEXT — apply the grouping you wrote: node scripts/cs.mjs group ${id}`);
      return true;
    }
    for (const t of tasks.tasks) {
      for (const [name, pass] of Object.entries(PASSES)) {
        if (fs.existsSync(path.join(d, `${pass.file}-${t.n}.json`))) continue;
        console.log(`NEXT — read one task, pass "${name}".`);
        console.log(`  read:  ${path.join(d, `task-${t.n}.txt`)}`);
        console.log(`  rules: ${pass.prompt}`);
        console.log(`  place: ${pass.says}`);
        console.log(`  write: ${path.join(d, `${pass.file}-${t.n}.json`)}`);
        console.log(`  then:  node scripts/cs.mjs ${name} ${id} ${t.n}`);
        if (name === 'know') {
          console.log('');
          console.log('  Take this pass on the task alone. Do not read the answer you wrote');
          console.log('  for the other pass: two standards in view at once move the levels');
          console.log('  the first three are read at.');
        }
        return true;
      }
    }
  }
  console.log('NOTHING LEFT TO READ — node scripts/cs.mjs report');
  return false;
}

function cmdNext() {
  if (nextStep()) cardSoFar();
}

/** What can be handed over right now. A reading interrupted part way is still
 *  a reading of the tasks it got through, and the card is built from whatever
 *  has been kept; printing this beside every next step means there is never a
 *  moment where the only answer to "what have you got" is nothing. */
function cardSoFar() {
  const tasks = allPlacements();
  if (!tasks.length) return;
  console.log('');
  console.log(`  A card over the ${tasks.length} task(s) read so far, at any point: node scripts/cs.mjs report`);
}

function cmdGroup(id) {
  const d = sess(id);
  const { turns } = read(path.join(d, 'turns.json'), { turns: [] });
  const grouping = read(path.join(d, 'grouping.json'));
  if (!grouping) { console.log(`No grouping written yet at ${path.join(d, 'grouping.json')}`); process.exit(1); }
  const { tasks, missing, twice } = applyGrouping(turns, grouping);
  write(path.join(d, 'tasks.json'), { tasks });
  for (const t of tasks) writeText(path.join(d, `task-${t.n}.txt`), judgeInput(t));
  console.log(`${tasks.length} task(s) from ${turns.length} message(s).`);
  // Reported rather than repaired: a grouping that cannot account for their
  // messages is a grouping to look at, not one to patch.
  if (missing.length) console.log(`  ${missing.length} message(s) in no task: ${missing.join(', ')}`);
  if (twice.length) console.log(`  ${twice.length} message(s) in more than one task: ${twice.join(', ')}`);
  console.log('');
  cmdNext();
}

function cmdPass(name, id, n) {
  const pass = PASSES[name];
  const d = sess(id);
  const tasks = read(path.join(d, 'tasks.json'), { tasks: [] }).tasks;
  const task = tasks.find((t) => String(t.n) === String(n));
  if (!task) { console.log(`No task ${n} in session ${id}`); process.exit(1); }
  const answer = read(path.join(d, `${pass.file}-${n}.json`));
  if (!answer) { console.log(`No reading written yet at ${path.join(d, `${pass.file}-${n}.json`)}`); process.exit(1); }
  const { placements, rejected } = verifyPlacements(answer, task.turns, pass.only);
  // Kept per pass, then gathered. Merged into one file as they arrive, a pass
  // re-read after a correction would have to know what the other pass had put
  // there, and a re-read is exactly when that is least safe.
  write(path.join(d, `kept-${name}-${n}.json`), {
    placements, rejected, elsewhere: answer.elsewhere || [],
    outcome: answer.outcome || '', familiarity: answer.familiarity || '',
    objective: answer.objective || task.objective,
  });
  let finished = null;
  const both = Object.keys(PASSES).map((k) => read(path.join(d, `kept-${k}-${n}.json`)));
  if (both.every(Boolean)) {
    write(path.join(d, `placements-${n}.json`), {
      id: `${id}#${n}`, at: task.at,
      objective: both[0].objective || task.objective,
      outcome: both[0].outcome, familiarity: both[0].familiarity,
      placements: both.flatMap((b) => b.placements),
      rejected: both.flatMap((b) => b.rejected),
      elsewhere: both.flatMap((b) => b.elsewhere),
    });
    // Said to the person, not to the program. A task is finished here and this
    // is the only moment its reading exists as one thing; printed as counts of
    // kept and thrown-out placements it tells somebody watching nothing about
    // their own record, and a run that says nothing until the end looks from
    // outside like a program helping itself to the machine.
    const all = both.flatMap((b) => b.placements);
    const tops = new Map();
    for (const pl of all) {
      const cur = tops.get(pl.column);
      if (!cur || pl.rung > cur.rung) tops.set(pl.column, pl);
    }
    const said = COLUMNS.filter((c) => tops.has(c))
      .map((c) => `${SITUATION_NAMES[c]} L${tops.get(c).rung} ${nameOf(c, tops.get(c).rung)}`)
      .join(' · ');
    finished = [
      '',
      `  READ: ${both[0].objective || task.objective || '(no objective stated)'}`,
      `  ${said || 'nothing this ladder measures'}`,
    ];
  }
  console.log(`Task ${n}, pass "${name}": ${placements.length} placement(s) kept, ${rejected.length} thrown out.`);
  if (finished) console.log(finished.join('\n'));
  for (const r of rejected) {
    const said = UNUSABLE.get(r.reason);
    console.log(`  · message ${r.message ?? '?'} ${r.column || ''}${r.rung ? ` L${r.rung}` : ''} — ${r.reason}${said ? ` (${said})` : ''}`);
  }
  if (answerWasUnusable(rejected)) {
    console.log('  The answer came back malformed rather than wrong: nothing was claimed');
    console.log('  about this conversation. Write it again before moving on.');
  }
  console.log('');
  cmdNext();
}

function allPlacements() {
  const out = [];
  for (const id of sessionDirs()) {
    const d = sess(id);
    let names = [];
    try { names = fs.readdirSync(d); } catch { continue; }
    for (const f of names.filter((f) => f.startsWith('placements-')).sort()) {
      const p = read(path.join(d, f));
      if (p) out.push(p);
    }
  }
  out.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return out;
}


/** Where things stand, on one screen, costing nothing. */

/** Erasure. §9.4 requires it of an implementation assessing minors, and
 *  anybody who has had their own words read should be able to take them back.
 *  What goes is everything this kept: the quotations, the readings, the
 *  counting. Nothing of it was anywhere else. */
function cmdForget() {
  const one = arg('session', '');
  const all = process.argv.includes('--all');
  if (!one && !all) {
    console.log('  node scripts/cs.mjs forget --all              remove everything this kept');
    console.log('  node scripts/cs.mjs forget --session <id>     remove one conversation');
    console.log(`\n  It is all under ${WORK} and nowhere else.\n`);
    return;
  }
  const target = all ? WORK : sess(one);
  if (!fs.existsSync(target)) { console.log(`Nothing kept at ${target}`); return; }
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`Removed ${target}.`);
  if (all) console.log('Your own agent records are untouched: this only ever read them.');
}

function cmdStatus() {
  const tasks = allPlacements();
  if (!tasks.length) {
    console.log('\n  Nothing read yet.  node scripts/cs.mjs list   — what there is to read');
    console.log('                     node scripts/cs.mjs import — read a few and start\n');
    return;
  }
  const st = standing(tasks);
  const sessions = new Set(tasks.map((t) => String(t.id).split('#')[0])).size;
  const now = snapshot(st, tasks.length);
  const prev = lastSnapshot();
  console.log(grid(st, { tasks: tasks.length, sessions, delta: movement(prev, now), glosses: levelGlosses() }));
  keepSnapshot(now, prev);
}

const HISTORY = () => path.join(WORK, 'history.jsonl');
function lastSnapshot() {
  try {
    const lines = fs.readFileSync(HISTORY(), 'utf8').trim().split('\n').filter(Boolean);
    return lines.length ? JSON.parse(lines[lines.length - 1]) : null;
  } catch { return null; }
}
/** Kept only when something moved. A line per look would bury the readings
 *  under the times somebody checked. */
function keepSnapshot(now, prev) {
  if (prev && prev.tasks === now.tasks) return;
  fs.mkdirSync(path.dirname(HISTORY()), { recursive: true });
  fs.appendFileSync(HISTORY(), `${JSON.stringify(now)}\n`);
}

/** The last few tasks read, and what each reached. */
function cmdRecent() {
  const n = Number(arg('n', 8));
  const tasks = allPlacements().slice(-n).reverse();
  if (!tasks.length) { console.log('Nothing read yet.'); return; }
  console.log('');
  for (const t of tasks) {
    const tops = {};
    for (const p of t.placements) {
      if (!tops[p.column] || p.rung > tops[p.column].rung) tops[p.column] = p;
    }
    const line = Object.entries(tops)
      .map(([c, p]) => `${SITUATION_NAMES[c]} L${p.rung}${p.landed === 'yes' ? '' : p.landed === 'no' ? ' (not met)' : ' (set aside)'}`)
      .join(' · ');
    console.log(`  ${String(t.at || '').slice(0, 10)}  ${padWide(String(t.objective || '(no objective)').replace(/\s+/g, ' '), 48)}  ${line || 'nothing placed'}`);
  }
  console.log('');
}

function cmdReport() {
  const tasks = allPlacements();
  if (!tasks.length) { console.log('Nothing read yet. Start with: node scripts/cs.mjs import'); process.exit(1); }
  const st = standing(tasks);
  // The sessions that contributed, not the ones prepared: a run that has read
  // three of fifteen says fifteen and claims evidence it has not looked at.
  const contributed = new Set(tasks.map((t) => String(t.id).split('#')[0])).size;
  const standard = readStandard();
  console.log(card(st, { tasks: tasks.length, sessions: contributed, standard }));
  const w = weakest(st);
  if (w) {
    const name = SITUATION_NAMES[w.column];
    console.log(`  LOWEST STANDING: ${name}.`);
    if (w.why) console.log(`  ${w.why} — a level is held only where every conferring situation holds it.`);
    else if (w.held) console.log(`  Holds L${w.held} ${nameOf(w.column, w.held)}; ${w.short} more occasion(s) at L${w.next} ${nameOf(w.column, w.next)} would count toward it.`);
    else console.log(`  Holds nothing yet; ${w.short} more occasion(s) at L${w.next} ${nameOf(w.column, w.next)} would count toward it.`);
    console.log('');
  }
  write(path.join(WORK, 'reading.json'), { takenAt: new Date().toISOString(), standing: st, tasks: tasks.length });
  const prev = lastSnapshot();
  const now = snapshot(st, tasks.length);
  const moved = movement(prev, now);
  if (moved.length) console.log(`  SINCE YOUR LAST READING: ${moved.join(' · ')}\n`);
  keepSnapshot(now, prev);

  // A reading is taken once and looked at afterwards, and what brings somebody
  // back is seeing themselves move rather than being told a level. So the card
  // ends by saying what a next reading would cost and what is still waiting —
  // which is arithmetic over this machine, not an invitation to spend.
  const waiting = candidates();
  const nextStep = w && !w.why
    ? `${SITUATION_NAMES[w.column]} is where the next step is: ${w.short} more occasion(s) at L${w.next} ${nameOf(w.column, w.next)}.`
    : (w ? `${SITUATION_NAMES[w.column]} has nothing in it yet; one occasion there is worth more than another anywhere else.` : '');
  if (waiting.length) {
    const soon = waiting.slice(0, 3);
    console.log(`  COMING BACK: ${waiting.length} conversation(s) here are unread; the newest ${soon.length} would take about ${estimate(soon).readings} readings.`);
    console.log('  Looking at this reading again costs nothing — only reading a new conversation asks a model anything.');
    console.log('');
  }

  const html = path.join(WORK, 'reading.html');
  writeText(html, page(st, {
    tasks, sessions: contributed, standard, questionStandard: promptFile('knowing.md'),
    moved, nextStep,
    waiting: { count: waiting.length, readings: waiting.length ? estimate(waiting.slice(0, 3)).readings : 0 },
  }));
  console.log(`  A page you can open, with the same reading laid out: ${html}`);
  console.log('  Show it if you can render a page; otherwise open it in a browser.');
  console.log('');
  console.log(`  Machine-readable: ${path.join(WORK, 'reading.json')}`);
  console.log('');
}

const promptFile = (name) => {
  try { return fs.readFileSync(path.join(HERE, '..', 'prompts', name), 'utf8'); } catch { return ''; }
};
const readStandard = () => promptFile('placing.md');

/** Each level's own one-line gloss, read out of the normative text rather than
 *  written down a second time. A card that carried its own wording for what a
 *  level is would be a second vocabulary, and the one thing a standard cannot
 *  survive is its name meaning two things. */
function levelGlosses() {
  const out = {};
  try {
    const spec = fs.readFileSync(path.join(HERE, '..', 'spec', 'the-command-scale-v1.0.md'), 'utf8');
    const re = /^#### L([1-6]) \S+\s*\n+([^\n]+)/gm;
    let m;
    while ((m = re.exec(spec))) out[Number(m[1])] = m[2].trim();
  } catch { /* the card prints without them */ }
  return out;
}

function cmdHistory() {
  let entries = [];
  try {
    entries = fs.readFileSync(HISTORY(), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch { /* none yet */ }
  if (!entries.length) { console.log('No readings recorded yet.'); return; }
  console.log(trail(entries));
}

function cmdGap() {
  const tasks = allPlacements();
  if (!tasks.length) { console.log('Nothing read yet.'); return; }
  console.log(gaps(standing(tasks), tasks, readStandard(), promptFile('knowing.md')));
}

function cmdWhy(which) {
  const tasks = allPlacements();
  const want = Object.entries(SITUATION_NAMES).find(([k, v]) =>
    k === which || v.toLowerCase() === String(which || '').toLowerCase());
  if (!want) { console.log(`Name one of: ${Object.values(SITUATION_NAMES).join(', ')}`); process.exit(1); }
  const [col, name] = want;
  console.log(`\n  ${name} — every placement, with the words it was credited for\n`);
  for (const t of tasks) {
    for (const p of t.placements.filter((p) => p.column === col)) {
      console.log(`  L${p.rung} ${nameOf(col, p.rung).padEnd(10)} ${p.landed === 'yes' ? 'met    ' : (p.landed === 'no' ? 'not met' : 'set aside')}  ${t.objective || ''}`);
      if (p.cite) console.log(`       “${p.cite.replace(/\s+/g, ' ').slice(0, 100)}”`);
      if (p.why) console.log(`       ${p.why}`);
    }
  }
  console.log('');
}

const [, , cmd, a, b] = process.argv;
if (cmd === 'import') cmdImport();
else if (cmd === 'group') cmdGroup(a);
else if (cmd === 'place' || cmd === 'know') cmdPass(cmd, a, b);
else if (cmd === 'report') cmdReport();
else if (cmd === 'why') cmdWhy(a);
else if (cmd === 'status') cmdStatus();
else if (cmd === 'recent') cmdRecent();
else if (cmd === 'list') cmdList();
else if (cmd === 'forget') cmdForget();
else if (cmd === 'gap') cmdGap();
else if (cmd === 'history') cmdHistory();
else if (cmd === 'next') cmdNext();
else {
  console.log(`The Command Scale v1.0 — take a reading of your own record.

  node scripts/cs.mjs status                             where you stand, one screen
  node scripts/cs.mjs list                               what there is to read, and what it costs
  node scripts/cs.mjs import [--budget 40] [--take 1,3]  read as much as you want to spend
  node scripts/cs.mjs next                               what to do next
  node scripts/cs.mjs group <session>                    apply a grouping
  node scripts/cs.mjs place <session> <task>             keep the first three situations
  node scripts/cs.mjs know  <session> <task>             keep the fourth, read on its own
  node scripts/cs.mjs gap                                what you left open, and what closes it
  node scripts/cs.mjs history                            every reading so far, and what moved
  node scripts/cs.mjs recent                             the last few tasks read
  node scripts/cs.mjs report                             the long card
  node scripts/cs.mjs why <situation>                    the words behind it
  node scripts/cs.mjs forget --all                       take it all back

Nothing here calls a model, opens a socket or needs an account. The reading is
taken by the agent running this skill; this program prepares, checks and counts.
Everything it keeps is plain files under ~/.command-scale, on this machine.`);
}
