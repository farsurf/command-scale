// Turning a coding agent's own record into the turns a reading is taken from.
//
// Two rules govern this file. The person's words are carried through byte for
// byte — no trimming inside a message, no spelling repaired, no punctuation
// normalised — because a reading is a claim about what somebody said and the
// citation check compares against exactly this text. And which side said what
// is decided from the shape of the record, never from a product name, because
// a record this does not recognise is the ordinary case rather than the
// exception.
import fs from 'fs';
import path from 'path';
import os from 'os';

/** How much of a reply travels with the turn it answered.
 *
 *  Enough to tell whether the words landed — whether what came back was a
 *  question about what they meant, or the thing they asked for — and no more.
 *  The whole reply would put the assistant's sentences in front of the reader
 *  as if they were evidence about the person; the citation check is what stops
 *  those sentences being credited to anyone, and this bound is what stops them
 *  crowding out the message they followed. */
const REPLY_CHARS = 400;

/** Shorter than this and a quotation cannot be found again in what it came
 *  from. Records really do contain a turn whose whole text is one character. */
const SHORTEST = 4;

const text = (content) => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
};

const toolsIn = (content) => {
  if (!Array.isArray(content)) return [];
  return [...new Set(content.filter((b) => b && b.type === 'tool_use' && b.name).map((b) => b.name))];
};

const isToolResult = (content) =>
  Array.isArray(content) && content.some((b) => b && b.type === 'tool_result');

/** A line that was not an attempt to say anything.
 *
 *  It stays in its task and in its order — what follows one of these often only
 *  makes sense because it happened — and nothing is placed for it. The tests
 *  are structural: a slash command is an invocation rather than words, and an
 *  interruption is the harness speaking. */
function notInputReason(body) {
  const s = body.trim();
  if (/^<command-(name|message|args)>/m.test(s)) return 'a command invocation, not words';
  if (/^\[Request interrupted/i.test(s)) return 'an interruption recorded by the harness';
  if (/^<(local-command|system)-/m.test(s)) return 'inserted by the harness, not typed';
  // Some harnesses write their own feedback into the person's side of the
  // record. The category is general — text the harness inserted — and the
  // spellings are not, so they are recognised here rather than reasoned about
  // by the reader, which is shown the whole record and no harness at all.
  if (/^(Stop hook feedback|Caveat: The messages below were generated)/i.test(s)) {
    return 'inserted by the harness, not typed';
  }
  // A harness reporting its own machinery back into the person's side of the
  // record: a background job finishing, a hook firing, a tool being answered.
  // The opening tag is the whole test, because what follows it is a report and
  // reads like one.
  if (/^<[a-z][a-z-]{2,30}>/.test(s)) return 'a report the harness wrote, not typed';
  return '';
}

/** One agent session file, in the JSON-lines shape Claude Code writes. */
export function turnsFromClaudeCode(file) {
  const out = [];
  let pending = null;
  const flush = () => { if (pending) { out.push(pending); pending = null; } };
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (o.isSidechain) continue;               // a subagent's conversation, not theirs
    const msg = o.message;
    if (!msg || typeof msg !== 'object') continue;
    if (o.type === 'user') {
      if (isToolResult(msg.content)) continue; // the harness answering a tool call
      const body = text(msg.content);
      if (!body.trim() || body.trim().length < SHORTEST) continue;
      flush();
      pending = {
        quote: body,
        at: String(o.timestamp || ''),
        back: '',
        tools: [],
        source: path.basename(file),
        ...(notInputReason(body) ? { notInput: notInputReason(body) } : null),
      };
    } else if (o.type === 'assistant' && pending) {
      const body = text(msg.content).trim();
      const tools = toolsIn(msg.content);
      if (tools.length) pending.tools = [...new Set([...pending.tools, ...tools])];
      if (body && !pending.back) {
        pending.back = body.length > REPLY_CHARS ? `${body.slice(0, REPLY_CHARS)}…` : body;
      }
    }
  }
  flush();
  return out;
}

/** A conversation copied out of a chat window and saved as plain text.
 *
 *  Which side is speaking is read off the shape of the paste: a short name at
 *  the start of a line, then a colon. Short is the whole test, and deliberately
 *  not a list of names — anybody who copies a chat gets whatever that window
 *  calls the two sides, in whatever language they were reading it in. */
export function turnsFromPaste(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const speaker = /^([^\s:]{1,20}(?:\s[^\s:]{1,20}){0,2}):\s*$|^([^\s:]{1,20}(?:\s[^\s:]{1,20}){0,2}):\s+(.*)$/;
  const blocks = [];
  let cur = null;
  for (const line of raw.split('\n')) {
    const m = speaker.exec(line);
    if (m && !/^https?$/i.test(m[1] || m[2] || '')) {
      if (cur) blocks.push(cur);
      cur = { who: (m[1] || m[2] || '').trim(), body: m[3] ? [m[3]] : [] };
    } else if (cur) {
      cur.body.push(line);
    }
  }
  if (cur) blocks.push(cur);
  if (blocks.length < 2) return [];
  // The first speaker is taken to be the person: a copied conversation starts
  // where they started it.
  const them = blocks[0].who;
  const out = [];
  let pending = null;
  for (const b of blocks) {
    const body = b.body.join('\n').trim();
    if (!body) continue;
    if (b.who === them) {
      if (pending) out.push(pending);
      pending = { quote: body, at: '', back: '', tools: [], source: path.basename(file) };
    } else if (pending && !pending.back) {
      pending.back = body.length > REPLY_CHARS ? `${body.slice(0, REPLY_CHARS)}…` : body;
    }
  }
  if (pending) out.push(pending);
  return out;
}

// Within one run, a directory is walked once and a file's opening is parsed
// once. Both `status` and `list` ask what is on the machine and then what is
// waiting, and without this every file under every root is opened twice for
// the same answer.
const walked = new Map();
const heads = new Map();

/** Every session file under a directory, newest first. */
export function sessionFiles(dir) {
  if (walked.has(dir)) return walked.get(dir);
  const out = walkFor(dir);
  walked.set(dir, out);
  return out;
}

function walkFor(dir) {
  const found = [];
  const walk = (d, depth) => {
    if (depth > 4) return;
    let names = [];
    try { names = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.isFile() && e.name.endsWith('.jsonl')) {
        try { found.push({ path: p, at: fs.statSync(p).mtimeMs }); } catch { /* unreadable */ }
      }
    }
  };
  walk(dir, 0);
  found.sort((a, b) => b.at - a.at);
  return found.map((f) => f.path);
}

/** The first few objects of a record, for deciding whose shape it is.
 *
 *  Only the opening of the file is read: whose record this is shows in its
 *  first lines, and reading a hundred whole files to find out would be the
 *  slowest part of a command that is supposed to cost nothing. */
function head(file) {
  if (heads.has(file)) return heads.get(file);
  const out = headOf(file);
  heads.set(file, out);
  return out;
}

function headOf(file) {
  // Grown until a whole line is in hand rather than fixed: one message of
  // theirs can be longer than any opening this would otherwise read, and a
  // file whose first line is longer than the window comes back with no
  // complete line at all — which reads as "this is nobody's record" about a
  // record that is perfectly readable.
  for (const bytes of [16384, 262144, Infinity]) {
    let buf = '';
    try {
      if (bytes === Infinity) buf = fs.readFileSync(file, 'utf8');
      else {
        const fd = fs.openSync(file, 'r');
        const b = Buffer.alloc(bytes);
        const n = fs.readSync(fd, b, 0, bytes, 0);
        fs.closeSync(fd);
        buf = b.slice(0, n).toString('utf8');
      }
    } catch { return []; }
    const whole = buf.split('\n');
    // The last piece is a line cut in half unless the read reached the end.
    if (buf.length && !buf.endsWith('\n') && bytes !== Infinity) whole.pop();
    const out = [];
    for (const line of whole) {
      if (!line.trim()) continue;
      try { out.push(JSON.parse(line)); } catch { /* not a line of ours */ }
    }
    if (out.length) return out;
    if (buf.length < bytes) return out;   // the whole file was read and held nothing
  }
  return [];
}

/** A wall-clock stamp with its offset written beside it, as a harness that
 *  hands the model a human-readable date writes one. Parsed without the offset
 *  it reads as that many hours from the truth, and the listing then sorts and
 *  prints the wrong day. */
function stamped(s) {
  const m = /\(UTC([+-])(\d{1,2})(?::(\d{2}))?\)/.exec(s);
  const base = Date.parse(s.replace(/\s*\(UTC[^)]*\)/, ''));
  if (!Number.isFinite(base)) return '';
  if (!m) return new Date(base).toISOString();
  const mins = ((Number(m[2]) * 60) + Number(m[3] || 0)) * (m[1] === '-' ? -1 : 1);
  return new Date(base - (mins * 60000)).toISOString();
}

/** What a harness wrapped around the person's message, taken off again.
 *
 *  The envelope is the harness's and the text inside it is theirs. Left on,
 *  every message in the record opens with a tag and is read as something the
 *  harness inserted rather than something they typed; taken off, their words
 *  are carried through exactly as they were. */
function unwrap(body) {
  const q = /<user_query>\n?([^]*?)\n?<\/user_query>/.exec(body);
  const t = /<timestamp>([^<]*)<\/timestamp>/.exec(body);
  return { quote: q ? q[1] : body, at: t ? stamped(t[1]) : '' };
}

/** One agent session file, in the JSON-lines shape Cursor writes. */
export function turnsFromCursor(file) {
  const out = [];
  let pending = null;
  const flush = () => { if (pending) { out.push(pending); pending = null; } };
  // When no stamp travels with a message, when the file was last written is
  // the only date there is. It is the same for every turn in the file, which
  // is true rather than precise.
  let fallback = '';
  try { fallback = new Date(fs.statSync(file).mtimeMs).toISOString(); } catch { /* unreadable */ }
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const msg = o.message;
    if (!msg || typeof msg !== 'object') continue;
    if (o.role === 'user') {
      if (isToolResult(msg.content)) continue;
      const { quote, at } = unwrap(text(msg.content));
      if (!quote.trim() || quote.trim().length < SHORTEST) continue;
      flush();
      pending = {
        quote,
        at: at || fallback,
        back: '',
        tools: [],
        source: path.basename(file),
        ...(notInputReason(quote) ? { notInput: notInputReason(quote) } : null),
      };
    } else if (o.role === 'assistant' && pending) {
      const body = text(msg.content).trim();
      const tools = toolsIn(msg.content);
      if (tools.length) pending.tools = [...new Set([...pending.tools, ...tools])];
      if (body && !pending.back) {
        pending.back = body.length > REPLY_CHARS ? `${body.slice(0, REPLY_CHARS)}…` : body;
      }
    }
  }
  flush();
  return out;
}

/**
 * The records this knows how to read.
 *
 * One entry per shape, not per product: a record is claimed by what its lines
 * look like rather than by where it was found or what wrote it, so a directory
 * holding two kinds is read correctly and a record nobody here has seen is
 * passed over rather than mangled. Adding another agent is adding one entry.
 */
export const READERS = [
  {
    name: 'Claude Code',
    where: '~/.claude/projects',
    roots: () => [path.join(os.homedir(), '.claude', 'projects')],
    project: (file) => path.basename(path.dirname(file)),
    claims: (objs) => objs.some((o) => o && (o.type === 'user' || o.type === 'assistant') && o.message),
    turns: turnsFromClaudeCode,
  },
  {
    name: 'Cursor',
    where: '~/.cursor/projects',
    roots: () => [path.join(os.homedir(), '.cursor', 'projects')],
    // .../projects/<project>/agent-transcripts/<id>/<id>.jsonl — the session's
    // own folder is named after the session, so the project is the folder the
    // transcripts live under.
    project: (file) => {
      const parts = file.split(path.sep);
      const i = parts.lastIndexOf('agent-transcripts');
      return i > 0 ? parts[i - 1] : path.basename(path.dirname(file));
    },
    claims: (objs) => objs.some((o) => o && (o.role === 'user' || o.role === 'assistant') && o.message),
    turns: turnsFromCursor,
  },
];

/** Which kinds of record are on this machine, and how many of each.
 *
 *  Said out loud by `status` and `list`, because "nothing to read" and "your
 *  agent keeps its record somewhere this cannot read" are different facts and
 *  only one of them is worth doing something about. */
export function sources() {
  return READERS.map((r) => {
    const dirs = r.roots().filter((d) => { try { return fs.statSync(d).isDirectory(); } catch { return false; } });
    let files = 0;
    for (const d of dirs) for (const f of sessionFiles(d)) if (r.claims(head(f))) files += 1;
    return { name: r.name, where: r.where, present: dirs.length > 0, files };
  });
}

/** Every record on this machine that something here can read. */
export function discover() {
  const out = [];
  const seen = new Set();
  for (const r of READERS) {
    for (const root of r.roots()) {
      let ok = false;
      try { ok = fs.statSync(root).isDirectory(); } catch { ok = false; }
      if (!ok) continue;
      for (const file of sessionFiles(root)) {
        if (seen.has(file)) continue;
        if (!r.claims(head(file))) continue;
        seen.add(file);
        let at = 0;
        try { at = fs.statSync(file).mtimeMs; } catch { /* unreadable */ }
        out.push({ file, reader: r, from: r.name, project: r.project(file), at });
      }
    }
  }
  out.sort((a, b) => b.at - a.at);
  return out;
}

/** Read a file whatever shape it is in.
 *
 *  A file named on the command line is claimed the same way one found on the
 *  machine is — by what its lines look like — so a record copied out of its
 *  usual place still reads, and one nobody here recognises falls through to
 *  the plain-text reader rather than coming back empty with no reason. */
export function turnsFrom(file) {
  if (!file.endsWith('.jsonl')) return turnsFromPaste(file);
  const objs = head(file);
  const r = READERS.find((x) => x.claims(objs));
  return r ? r.turns(file) : turnsFromPaste(file);
}
