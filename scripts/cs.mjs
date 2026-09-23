#!/usr/bin/env node
// The instrument. It prepares what a reading is taken from, checks what a
// reading claims, and counts what survives. It never asks a model anything:
// the reading is taken by whichever agent is running this skill, which is why
// no key is needed and why nothing leaves this machine.
//
// Everything it writes goes under .command-scale/ in the directory it is run
// from. A run that stops half way is continued rather than started again.
import fs from 'fs';
import path from 'path';
import { turnsFrom, knownRecordDirs, sessionFiles } from './lib/transcripts.mjs';
import { verifyPlacements, answerWasUnusable, standing, UNUSABLE, COLUMNS,
  SITUATION_NAMES, LEVEL_NAMES, CONFERRING } from './lib/scale.mjs';

/** The two passes. They are taken separately, against separate standards, and
 *  are blind to each other: held in one standard the fourth situation's
 *  arrival moved the other three, on one reading in seven. */
const PASSES = {
  place: { file: 'reading-place', prompt: 'skill/prompts/placing.md',
    only: ['asking', 'reacting', 'blocked'],
    says: 'the first three situations — what should become true, what is true of what came back, and that progress has stopped' },
  know: { file: 'reading-know', prompt: 'skill/prompts/knowing.md',
    only: ['knowing'],
    says: 'the fourth situation on its own — what is asked to be told' },
};
import { card, weakest } from './lib/report.mjs';

const WORK = path.resolve(process.env.COMMAND_SCALE_DIR || '.command-scale');
const read = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
const write = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, 2)); };
const writeText = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const sessionDirs = () => {
  try { return fs.readdirSync(path.join(WORK, 'sessions')).sort(); } catch { return []; }
};
const sess = (id) => path.join(WORK, 'sessions', id);

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
      n: i, objective: t.objective || null, work: t.work || '',
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
    task.work ? `Work: ${task.work}` : '',
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

function cmdImport() {
  const howMany = Number(arg('sessions', 12));
  const file = arg('file', '');
  let sources = [];
  if (file) {
    sources = [path.resolve(file)];
  } else {
    for (const d of knownRecordDirs()) sources.push(...sessionFiles(d));
    if (!sources.length) {
      console.log('No agent records found on this machine. Point at a file instead:');
      console.log('  node scripts/cs.mjs import --file <a saved conversation>');
      process.exit(1);
    }
    sources = sources.slice(0, howMany);
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
  console.log(`Work directory: ${WORK}`);
  console.log('');
  cmdNext();
}

function cmdNext() {
  for (const id of sessionDirs()) {
    const d = sess(id);
    if (!fs.existsSync(path.join(d, 'grouping.json'))) {
      console.log(`NEXT — group one conversation into tasks.`);
      console.log(`  read:  ${path.join(d, 'grouping-input.txt')}`);
      console.log(`  rules: skill/prompts/grouping.md`);
      console.log(`  write: ${path.join(d, 'grouping.json')}`);
      console.log(`  then:  node scripts/cs.mjs group ${id}`);
      return;
    }
    const tasks = read(path.join(d, 'tasks.json'));
    if (!tasks) {
      console.log(`NEXT — apply the grouping you wrote: node scripts/cs.mjs group ${id}`);
      return;
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
          console.log('  for the other pass: two standards in view at once moved levels');
          console.log('  inside the first three on one reading in seven.');
        }
        return;
      }
    }
  }
  console.log('NOTHING LEFT TO READ — node scripts/cs.mjs report');
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
  }
  console.log(`Task ${n}, pass "${name}": ${placements.length} placement(s) kept, ${rejected.length} thrown out.`);
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

function cmdReport() {
  const tasks = allPlacements();
  if (!tasks.length) { console.log('Nothing read yet. Start with: node scripts/cs.mjs import'); process.exit(1); }
  const st = standing(tasks);
  console.log(card(st, { tasks: tasks.length, sessions: sessionDirs().length }));
  const w = weakest(st);
  if (w) {
    const name = SITUATION_NAMES[w.column];
    console.log(`  LOWEST STANDING: ${name}.`);
    if (w.why) console.log(`  ${w.why} — a level is held only where every conferring situation holds it.`);
    else console.log(`  Holds L${w.held}${w.held ? ` ${LEVEL_NAMES[w.held]}` : ''}; ${w.short} more occasion(s) at L${w.next} would count toward the next.`);
    console.log('');
  }
  write(path.join(WORK, 'reading.json'), { takenAt: new Date().toISOString(), standing: st, tasks: tasks.length });
  console.log(`  Machine-readable: ${path.join(WORK, 'reading.json')}`);
  console.log('');
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
      console.log(`  L${p.rung} ${LEVEL_NAMES[p.rung].padEnd(10)} ${p.landed === 'yes' ? 'met    ' : (p.landed === 'no' ? 'not met' : 'set aside')}  ${t.objective || ''}`);
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
else if (cmd === 'next') cmdNext();
else {
  console.log(`The Command Scale v1.0 — take a reading of your own record.

  node scripts/cs.mjs import [--sessions N] [--file F]   prepare what to read
  node scripts/cs.mjs next                               what to do next
  node scripts/cs.mjs group <session>                    apply a grouping
  node scripts/cs.mjs place <session> <task>             keep the first three situations
  node scripts/cs.mjs know  <session> <task>             keep the fourth, read on its own
  node scripts/cs.mjs report                             the card
  node scripts/cs.mjs why <situation>                    the words behind it

Nothing here calls a model and nothing leaves this machine. The reading is
taken by the agent running this skill; this program prepares, checks and counts.`);
}
