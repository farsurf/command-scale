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
/* The publisher's own values, copied in as values. The page is recognisable
   as the same family as mentor.farsurf.com without carrying a line of that
   site's code: four and a half thousand lines of stylesheet and script written
   for one conversation, a login wall and a price list have nothing to lay out
   here, and would disagree with the site the first time either changed.
   Their own sentences are set in the face with Han glyphs in it — a stack
   without one sets every Chinese character in the browser's last resort,
   visibly a different width, on the one line of the page that is theirs. */
:root{
  color-scheme:light dark;
  --paper:#FAF8F4; --card:#FFFFFF; --ink:#171717; --body:#44443F; --dim:#8A8A85;
  --line:#E6E6E2; --rule:#D9D5CC; --accent:#D8480B; --credit:#2A6B4F; --warn:#A11A1A;
  --dark:#171717; --dark-ink:#F5F2EC; --dark-dim:#A8A29A; --dark-line:#2C2822;
  --face:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;
  --own:'DM Mono',ui-monospace,'SFMono-Regular',Menlo,'PingFang SC','Microsoft YaHei','Noto Sans SC',monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#121211; --card:#1B1B19; --ink:#F2F2EE; --body:#E4E4DD; --dim:#9A9A93;
  --line:#2C2C29; --rule:#31312D; --accent:#FF6A2B; --credit:#6FD39B; --warn:#E4614F;
  --dark:#1B1B19; --dark-ink:#F2F2EE; --dark-dim:#9A9A93; --dark-line:#2C2C29;
}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--body);font:16px/1.6 var(--face);padding:2.5rem 1.25rem 5rem}
.wrap{max-width:46rem;margin:0 auto}
h1{font-size:1.5rem;line-height:1.2;margin:0 0 .2rem;color:var(--ink);letter-spacing:-.01em}
h2{font-family:var(--own);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin:2.8rem 0 .9rem;font-weight:500}
.sub{color:var(--dim);margin:0 0 2rem;font-family:var(--own);font-size:.8rem}
.level{background:var(--dark);color:var(--dark-ink);border-radius:.5rem;padding:1.3rem 1.4rem}
.level b{display:block;font-size:1.3rem;letter-spacing:-.01em}
.level p{margin:.5rem 0 0;color:var(--dark-dim);font-size:.9rem}
table{border-collapse:collapse;width:100%;font-family:var(--own);font-size:.86rem}
th,td{padding:.55rem .35rem;text-align:center;border-bottom:1px solid var(--line)}
th:first-child,td:first-child{text-align:left;font-family:var(--face);white-space:nowrap;color:var(--ink)}
thead th{color:var(--dim);font-weight:500;border-bottom:1px solid var(--rule)}
td.has{color:var(--body)}
td.held{color:var(--accent);font-weight:700}
td.none{color:var(--line)}
.note{color:var(--dim);font-size:.84rem}
.sit{border-top:1px solid var(--line);padding:1.2rem 0}
.sit h3{margin:0 0 .5rem;font-size:1rem;color:var(--ink)}
.sit h3 span{color:var(--dim);font-weight:400;font-size:.9rem}
blockquote{margin:.6rem 0;padding:.5rem 0 .5rem .9rem;border-left:2px solid var(--accent);
  font-family:var(--own);font-size:.9rem;color:var(--ink)}
.def{margin:.6rem 0 0}
.def b{display:block;font-family:var(--own);color:var(--dim);font-size:.72rem;letter-spacing:.08em;
  text-transform:uppercase;font-weight:500;margin-bottom:.2rem}
ul{margin:.4rem 0;padding-left:1.1rem}
li{margin:.3rem 0}
.task{border-top:1px solid var(--line);padding:1.1rem 0}
.task h4{margin:0 0 .15rem;font-size:.98rem;font-weight:600;color:var(--ink)}
.task .when{color:var(--dim);font-family:var(--own);font-size:.75rem;margin:0 0 .7rem}
.p{margin:.8rem 0 0;padding-left:.9rem;border-left:2px solid var(--rule)}
.p .tag{font-family:var(--own);font-size:.74rem;color:var(--dim);letter-spacing:.05em;text-transform:uppercase}
.p .tag em{font-style:normal;color:var(--credit);font-weight:700}
.p .tag s{text-decoration:none;color:var(--warn);font-weight:700}
.p q{display:block;margin:.25rem 0 .2rem;font-family:var(--own);font-size:.9rem;color:var(--ink);quotes:none}
.p .why{color:var(--dim);font-size:.86rem}
footer{margin-top:3rem;border-top:1px solid var(--rule);padding-top:1rem;color:var(--dim);font-size:.82rem}
code{font-family:var(--own);font-size:.85em}
@media (max-width:30rem){body{padding:1.5rem 1rem 4rem}table{font-size:.74rem}th,td{padding:.45rem .12rem}}
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

  // Every placement, with the sentence it was credited for and the one line
  // saying why it sits there. This is the part of a reading that can be argued
  // with, and a reading nobody can argue with is a score. It is already on
  // disk and costs nothing to lay out.
  if (tasks.length) {
    H.push('<h2>Every placement, and the words behind it</h2>');
    H.push('<p class="note">A level above the first was credited to a sentence of yours and checked against the message it came from. If you say one of these is wrong, it is wrong until evidence of a different kind arrives.</p>');
    const newest = [...tasks].sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    for (const t of newest) {
      const placed = (t.placements || []).slice().sort((a, b) => (a.message - b.message) || String(a.column).localeCompare(String(b.column)));
      if (!placed.length) continue;
      H.push('<div class="task">');
      H.push(`<h4>${esc(t.objective || '(no objective stated)')}</h4>`);
      H.push(`<p class="when">${esc(String(t.at || '').slice(0, 10))}${t.outcome ? ` · ${esc(t.outcome)}` : ''}</p>`);
      for (const p of placed) {
        const met = p.landed === 'yes' ? '<em>met</em>' : (p.landed === 'no' ? '<s>not met</s>' : 'set aside');
        H.push('<div class="p">');
        H.push(`<div class="tag">${esc(SITUATION_NAMES[p.column] || p.column)} · L${p.rung} ${esc(nameOf(p.column, p.rung))} · ${met}</div>`);
        if (p.cite) H.push(`<q>${esc(p.cite.replace(/\s+/g, ' '))}</q>`);
        if (p.why) H.push(`<div class="why">${esc(p.why)}</div>`);
        H.push('</div>');
      }
      H.push('</div>');
    }
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
