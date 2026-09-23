#!/usr/bin/env node
// The conformance suite: a set of cases with their answers, and a way to put
// any implementation through them.
//
// What is checked here is the part of the standard that has one right answer.
// Where a message sits on the ladder is a judgement and two readings of it
// disagree (§7); how the placements that survive are counted, and which
// claimed placements survive at all, are arithmetic and a rule, and an
// implementation that gets either wrong is wrong rather than differing.
//
// By default it runs the implementation in this repository. `--command <cmd>`
// runs somebody else's instead: the case's `input` is written to that
// command's standard input as JSON, and its standard output is read back as
// JSON in the shape `conformance/README.md` sets out.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { standing, verifyPlacements, answerWasUnusable, COLUMNS } from '../scripts/lib/scale.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : '';
};
const command = arg('command');
const only = arg('only');

/** The counting, reduced to what an implementation must agree on. Anything it
 *  keeps beside this is its own business. */
function countingShape(st) {
  // The escapes are part of what must agree: §5.4 says a failure with a cause
  // of its own is excluded in both directions AND reported, and an
  // implementation that drops them quietly counts a different record.
  const out = { level: st.level, setAside: (st.setAside || []).length, situations: {} };
  for (const c of COLUMNS) {
    const s = st.situations[c];
    if (!s) continue;
    const cells = {};
    for (const [r, v] of Object.entries(s.rungs)) {
      cells[r] = { n: v.n, pos: v.pos, met: !!v.met, warning: !!v.warning, givenBack: !!v.givenBack };
    }
    out.situations[c] = { held: s.held, reached: s.reached, seen: s.seen, cells };
  }
  return out;
}

/** What a verification must agree on: which placements survived, and why each
 *  of the others did not. */
function verificationShape({ placements, rejected }) {
  return {
    kept: placements.map((p) => ({ message: p.message, column: p.column, rung: p.rung }))
      .sort((a, b) => a.message - b.message || a.column.localeCompare(b.column)),
    rejected: rejected.map((r) => ({ message: r.message ?? null, reason: r.reason }))
      .sort((a, b) => (a.message ?? -1) - (b.message ?? -1) || a.reason.localeCompare(b.reason)),
    malformed: answerWasUnusable(rejected),
  };
}

const ours = {
  counting: (input) => countingShape(standing(input.tasks)),
  verification: (input) => verificationShape(verifyPlacements(input.answer, input.turns, input.only || COLUMNS)),
};

function theirs(family, input) {
  const out = execFileSync(command, [family], { input: JSON.stringify(input), encoding: 'utf8', shell: true });
  return JSON.parse(out);
}

/** Deep equality with the difference named, because "it did not match" sends
 *  somebody to read their whole implementation. */
function differs(got, want, at = '') {
  if (want === null || typeof want !== 'object') {
    return Object.is(got, want) ? null : `${at || 'value'}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`;
  }
  if (Array.isArray(want)) {
    if (!Array.isArray(got)) return `${at}: expected a list of ${want.length}, got ${JSON.stringify(got)}`;
    if (got.length !== want.length) return `${at}: expected ${want.length} entr${want.length === 1 ? 'y' : 'ies'}, got ${got.length}`;
    for (let i = 0; i < want.length; i += 1) {
      const d = differs(got[i], want[i], `${at}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  if (got === null || typeof got !== 'object') return `${at}: expected an object, got ${JSON.stringify(got)}`;
  for (const k of Object.keys(want)) {
    const d = differs(got[k], want[k], at ? `${at}.${k}` : k);
    if (d) return d;
  }
  for (const k of Object.keys(got)) {
    if (!(k in want)) return `${at ? `${at}.` : ''}${k}: not expected here`;
  }
  return null;
}

let pass = 0;
const failed = [];
console.log('');
console.log(`  THE COMMAND SCALE v1.0 — conformance${command ? `: ${command}` : ''}`);
console.log('');
for (const family of ['counting', 'verification']) {
  const cases = JSON.parse(fs.readFileSync(path.join(HERE, `${family}.json`), 'utf8'));
  console.log(`  ${family.toUpperCase()}`);
  for (const c of cases) {
    if (only && !c.name.includes(only)) continue;
    let got;
    try {
      got = command ? theirs(family, c.input) : ours[family](c.input);
    } catch (e) {
      failed.push({ name: c.name, why: `threw: ${(e && e.message) || e}` });
      console.log(`    ✗ ${c.name}`);
      continue;
    }
    const d = differs(got, c.expect);
    if (d) {
      failed.push({ name: c.name, why: d, asks: c.asks });
      console.log(`    ✗ ${c.name}`);
    } else {
      pass += 1;
      console.log(`    ✓ ${c.name}`);
    }
  }
  console.log('');
}
if (failed.length) {
  console.log('  WHAT FAILED');
  for (const f of failed) {
    console.log(`    ${f.name}`);
    if (f.asks) console.log(`      asks:  ${f.asks}`);
    console.log(`      here:  ${f.why}`);
  }
  console.log('');
}
console.log(`  ${pass} passed, ${failed.length} failed.`);
console.log(failed.length
  ? '  This implementation does not pass The Command Scale v1.0 conformance.'
  : '  This implementation passes The Command Scale v1.0 conformance.');
console.log('');
process.exit(failed.length ? 1 : 0);
