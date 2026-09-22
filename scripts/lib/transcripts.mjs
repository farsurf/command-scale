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
  return '';
}

/** One agent session file, in the JSON-lines shape Claude Code writes. */
export function turnsFromJsonl(file) {
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

/** Where this machine's agent records are, if they are anywhere this knows. */
export function knownRecordDirs() {
  const home = os.homedir();
  return [path.join(home, '.claude', 'projects')].filter((d) => {
    try { return fs.statSync(d).isDirectory(); } catch { return false; }
  });
}

/** Every session file under a directory, newest first. */
export function sessionFiles(dir) {
  const found = [];
  const walk = (d, depth) => {
    if (depth > 3) return;
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

/** Read a file whatever shape it is in. */
export function turnsFrom(file) {
  return file.endsWith('.jsonl') ? turnsFromJsonl(file) : turnsFromPaste(file);
}
