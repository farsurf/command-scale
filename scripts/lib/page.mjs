// The card as a page.
//
// WHY THIS EXISTS. A reading is taken for somebody, and what was handed over
// was a screen of fixed-width text. Somebody who is not a programmer reads
// that once. The same numbers laid out — four situations down, five heights
// across, their own sentence under each — is the same reading and a different
// thing to receive.
//
// WHY IT IS A FILE AND NOT A CANVAS. Rendering surfaces belong to particular
// assistants: some have one, most do not, and a reading that only appears
// properly in one of them is a reading most people never see. A single file
// with nothing outside it in it opens in any browser, can be shown by whatever
// surface an assistant does have, and can be tested here. It loads no font, no
// stylesheet and no script from anywhere.
import { LEVEL_NAMES, QUESTION_LEVEL_NAMES, nameOf, SITUATION_NAMES, COLUMNS, CONFERRING,
  NEED, PASS, SHOW_RATE, DEPTH_BATCH, DEPTH_NEED } from './scale.mjs';
import { rungDefinitions } from './rungs.mjs';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STYLE = `
:root{color-scheme:light dark;--ink:#16181d;--dim:#5d636e;--line:#d9dce2;--bg:#fbfbfc;--card:#fff;--held:#1b6b3a;--heldbg:#e6f4ec;--warn:#8a3d12}
@media (prefers-color-scheme:dark){:root{--ink:#e8eaee;--dim:#98a0ad;--line:#2c3038;--bg:#101216;--card:#171a20;--held:#6fd39b;--heldbg:#12301f;--warn:#e0a074}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 ui-serif,Georgia,"Times New Roman",serif;padding:2.5rem 1.25rem 5rem}
.wrap{max-width:46rem;margin:0 auto}
h1{font-size:1.45rem;line-height:1.25;margin:0 0 .2rem}
h2{font-size:1rem;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin:2.6rem 0 .8rem;font-weight:600}
.sub{color:var(--dim);margin:0 0 2rem}
.level{background:var(--card);border:1px solid var(--line);border-radius:.6rem;padding:1.1rem 1.25rem}
.level b{font-size:1.25rem}
.level p{margin:.4rem 0 0;color:var(--dim);font-size:.94rem}
table{border-collapse:collapse;width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9rem}
th,td{padding:.5rem .35rem;text-align:center;border-bottom:1px solid var(--line)}
th:first-child,td:first-child{text-align:left;font-family:inherit;white-space:nowrap}
thead th{color:var(--dim);font-weight:600}
td.has{background:var(--card)}
td.held{background:var(--heldbg);color:var(--held);font-weight:700}
td.none{color:var(--line)}
.note{color:var(--dim);font-size:.86rem}
.sit{border-top:1px solid var(--line);padding:1.2rem 0}
.sit h3{margin:0 0 .5rem;font-size:1.02rem}
.sit h3 span{color:var(--dim);font-weight:400}
blockquote{margin:.6rem 0;padding:.55rem 0 .55rem .9rem;border-left:3px solid var(--line);color:var(--ink)}
.def{margin:.55rem 0 0}
.def b{display:block;color:var(--dim);font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;font-weight:600;margin-bottom:.15rem}
ul{margin:.4rem 0;padding-left:1.1rem}
li{margin:.25rem 0}
footer{margin-top:3rem;border-top:1px solid var(--line);padding-top:1rem;color:var(--dim);font-size:.85rem}
@media (max-width:30rem){body{padding:1.5rem 1rem 4rem}table{font-size:.78rem}th,td{padding:.4rem .15rem}}
`;

/** Their own sentence at the height they reached, the one the reading credited. */
function theirWords(tasks, column, rung) {
  for (const t of tasks) {
    for (const p of t.placements || []) {
      if (p.column === column && p.rung === rung && p.cite && p.landed === 'yes') return p.cite;
    }
  }
  return '';
}

export function page(st, meta = {}) {
  const tasks = meta.tasks || [];
  const defs = rungDefinitions(meta.standard || '');
  const qDefs = meta.questionStandard
    ? rungDefinitions(`**knowing** — the part of a message that asks to be told something.\n\n${meta.questionStandard}`)
    : {};
  const said = (c, r) => (c === 'knowing' ? (qDefs.knowing && qDefs.knowing[r]) || '' : (defs[c] && defs[c][r]) || '');

  const H = [];
  H.push('<!doctype html><html lang="en"><head><meta charset="utf-8">');
  H.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  H.push('<title>Your reading — The Command Scale v1.0</title>');
  H.push(`<style>${STYLE}</style></head><body><div class="wrap">`);

  H.push('<h1>Your reading</h1>');
  H.push(`<p class="sub">The Command Scale v1.0 · ${tasks.length} closed task${tasks.length === 1 ? '' : 's'} across ${meta.sessions || 0} conversation${meta.sessions === 1 ? '' : 's'} · taken ${esc(new Date().toISOString().slice(0, 10))}</p>`);

  H.push('<div class="level">');
  if (st.level) {
    H.push(`<b>Level held: L${st.level} ${LEVEL_NAMES[st.level]}</b>`);
    H.push('<p>Held means reached in every conferring situation and met there, not reached once.</p>');
  } else {
    H.push('<b>Level held: none yet</b>');
    H.push('<p>A level is held only where every conferring situation holds it at that height. Holding nothing is the ordinary case and says the situations are uneven — the table says where.</p>');
  }
  H.push('</div>');

  H.push('<h2>Where you stand</h2>');
  H.push('<table><thead><tr><th></th>' + [1, 2, 3, 4, 5].map((r) => `<th>L${r}</th>`).join('') + '</tr></thead><tbody>');
  for (const c of COLUMNS) {
    const s = st.situations[c];
    const cells = [1, 2, 3, 4, 5].map((r) => {
      const cell = s && s.rungs[r];
      if (!cell) return '<td class="none">·</td>';
      return `<td class="${cell.met ? 'held' : 'has'}">${cell.pos}/${cell.n}</td>`;
    }).join('');
    H.push(`<tr><th>${esc(SITUATION_NAMES[c])}</th>${cells}</tr>`);
  }
  H.push('</tbody></table>');
  H.push(`<p class="note">Each cell is how many occasions at that height were met, out of how many there were. A height is held at ${NEED} occasions with ${Math.ceil(NEED * PASS)} met (§5.3); under ${SHOW_RATE} no rate is shown at all. Question is placed and recorded and confers nothing here (B.2), and is read on a ladder of its own: ${[1, 2, 3, 4, 5].map((r) => `L${r} ${QUESTION_LEVEL_NAMES[r]}`).join(' · ')}.</p>`);

  H.push('<h2>Situation by situation</h2>');
  for (const c of COLUMNS) {
    const s = st.situations[c];
    H.push('<div class="sit">');
    if (!s) {
      H.push(`<h3>${esc(SITUATION_NAMES[c])} <span>— nothing in your record at all</span></h3>`);
      H.push(`<p class="note">In ${tasks.length} task${tasks.length === 1 ? '' : 's'} you never said this. Not saying it is not a failure and nothing counts against you for it. A level is held only where every conferring situation holds it, so this one holds the whole reading at nothing until something appears here.</p>`);
      H.push('</div>');
      continue;
    }
    const at = s.reached;
    const next = Math.min(5, at + 1);
    H.push(`<h3>${esc(SITUATION_NAMES[c])} <span>— you reach L${at} ${nameOf(c, at)}${CONFERRING.includes(c) ? '' : ', recorded but not counted'}</span></h3>`);
    const mine = theirWords(tasks, c, at);
    if (mine) H.push(`<blockquote>${esc(mine.replace(/\s+/g, ' '))}</blockquote>`);
    if (said(c, at)) H.push(`<div class="def"><b>what that closed</b>${esc(said(c, at))}</div>`);
    if (next > at && said(c, next)) H.push(`<div class="def"><b>what L${next} ${nameOf(c, next)} closes that this does not</b>${esc(said(c, next))}</div>`);
    if (s.samples < NEED) H.push(`<p class="note">${s.short} more occasion${s.short === 1 ? '' : 's'} at L${s.next} ${nameOf(c, s.next)}, ${st.must} of ${st.need} met, would hold it.</p>`);
    H.push('</div>');
  }

  H.push('<h2>Coming back</h2>');
  H.push('<ul>');
  if (meta.moved && meta.moved.length) H.push(`<li><b>Since your last reading:</b> ${esc(meta.moved.join(' · '))}</li>`);
  else H.push('<li>This is the first reading kept, so there is nothing yet to have moved. The next one says what changed.</li>');
  if (meta.nextStep) H.push(`<li>${esc(meta.nextStep)}</li>`);
  if (meta.waiting && meta.waiting.count) {
    H.push(`<li>${meta.waiting.count} conversation${meta.waiting.count === 1 ? '' : 's'} on this machine have not been read; reading the newest ${Math.min(3, meta.waiting.count)} would take about ${meta.waiting.readings} readings.</li>`);
  }
  H.push(`<li>Looking at this again costs nothing: the counting is arithmetic over what is already here. Only reading a new conversation asks a model anything.</li>`);
  H.push('</ul>');

  const batches = Math.floor(tasks.length / DEPTH_BATCH);
  H.push('<h2>What this reading cannot say</h2><ul>');
  H.push(`<li>L6 Myth is read across batches of ${DEPTH_BATCH} closed tasks, ${DEPTH_NEED} batches at least (A.5). You have ${batches} full batch${batches === 1 ? '' : 'es'}. It is not read here.</li>`);
  H.push('<li>A reading over few tasks is a placement, not a measurement (§10). It is not a diagnosis, not an intelligence measure, and no certificate is issued.</li>');
  H.push(`<li>${(st.setAside || []).length} occasion${(st.setAside || []).length === 1 ? '' : 's'} were set aside and counted neither way — a refusal, a limit of the environment, a failure with a cause of its own — and are reported because an uncounted escape is a way for evidence to vanish quietly (§5.4).</li>`);
  H.push('<li>If you say a placement is wrong, it is wrong until evidence of a different kind arrives (§4, B.4). Every level above the first quotes your own words and was checked against the message it was credited to.</li>');
  H.push('</ul>');

  H.push('<footer>Nothing here left this machine. This page and the readings behind it are removed by <code>node scripts/cs.mjs forget --all</code>. This says what you left open; it does not write the sentence that would close it, because a sentence handed to you would be the assistant&rsquo;s, and under this standard what the assistant said is never yours.</footer>');
  H.push('</div></body></html>');
  return H.join('\n');
}
