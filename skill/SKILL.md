---
name: command-scale
description: Take a reading of a person's own record against The Command Scale v1.0 — six levels of what they can get an AI to produce, read from their own words, counted rather than judged. Use when someone asks where they stand on the scale, wants their transcripts read, or asks what would move them up. Everything stays on their machine; no API key and no upload.
---

# Taking a reading against The Command Scale

You are the instrument's reader. A program prepares what you read, checks what
you claim, and does the counting; you do the one thing code cannot, which is
decide where a message sits. Nothing here calls a model — you are the model —
and nothing leaves this machine.

**Read `spec/the-command-scale-v1.0.md` before your first reading.** §4, §5 and
§9, together with Appendix B, are the normative text. The prompts below are the
instrument, and they are written to be applied exactly as given.

## The order of work

Run the program and do what it says next. It is resumable: a run that stops is
continued, never started again.

```
node scripts/cs.mjs import        # prepare; add --sessions N or --file F
node scripts/cs.mjs next          # what to do, one step at a time
```

`next` tells you which file to read, which rules to apply, and which file to
write. There are exactly two things you ever write:

**A grouping**, one per conversation. Read the conversation it names, apply
`prompts/grouping.md` exactly, and write the JSON that prompt specifies. Then
`node scripts/cs.mjs group <session>`.

**A reading**, twice per task, in two passes that are blind to each other.

The first pass applies `prompts/placing.md` and places the first three
situations. The second applies `prompts/knowing.md` and places the fourth on
its own. Each writes the JSON its own prompt specifies, to its own file, and
each carries its own `elsewhere` — the messages whose whole ask belongs to the
standard the other pass holds. An `elsewhere` entry voids the placements of the
pass that wrote it, which is what keeps a question from being counted as a
request and a request from being counted as a question.

**Take the second pass without the first answer in view.** Held in one standard,
the fourth situation's arrival moved the other three: the same words, the same
model, and levels inside the first three drifted on one reading in seven. Two
passes over one input cost one more reading and leave the first three exactly
the reading they were.

`node scripts/cs.mjs place <session> <task>` keeps the first pass;
`node scripts/cs.mjs know <session> <task>` keeps the second. When there is
nothing left: `node scripts/cs.mjs report`.

A pass that finds nothing of its own in a task answers with no placements and
an `elsewhere` naming what it passed over. That is the commonest answer there
is — most tasks that made something ask to be told nothing — and it is an
answer, not a fault.

## What the program will refuse

Every level above the first must quote the person's own words, and the quote is
checked against the message it is credited to, ignoring case and spacing. A
quote that is not there is thrown out, and the level it claimed goes with it.
This is not a formality: it is the whole defence against crediting somebody
with what the assistant said.

A placement in the `asking` situation with nothing in `becomes` is thrown out
too — a part that asks only to be told something has nothing that situation
measures, and belongs in `elsewhere`.

If the program says your answer came back malformed, write it again before
moving on. Nothing was claimed about that conversation, so nothing about it has
been found out.

## Things you are not asked

You are never told what level the person is on, you see no running total, and
you are not asked for an opinion about them. The level is a result of the
counts and is never an input to them. Do not read earlier readings before
taking one.

Difficulty has no bearing anywhere, nor does how long a message is, nor
anything about the person.

## The four situations

The instrument's field names and the standard's names are the same four things:

| field | standard (B.2) | what it is |
| --- | --- | --- |
| `asking` | Request | says what should become true |
| `reacting` | Review | says what is true of what came back |
| `blocked` | Roadblock | says progress has stopped |
| `knowing` | Question | asks to be told something not yet held |

## What this reading cannot say, and must not imply

**L6 Myth is not read here.** It is read across batches of ten closed tasks,
three batches at least (A.5). `prompts/depth.md` is the reading for it and the
program does not invoke it until there is enough to invoke it on.

**Question confers nothing.** It is placed and recorded. It begins to confer
one month after an implementation begins to arrange practice in it, on a single
date for everyone that implementation assesses (B.2). Nothing here arranges
practice, so this implementation states its date as never, and the card says so.

**Under ten occasions at a height, no level is held there** — and under five, no
rate is printed at all. A reading over few tasks is a placement, not a
measurement (§10). Say that plainly if you are asked to summarise the card;
never round it up into a verdict about the person.

**A level can be disputed and the dispute stands.** If the person says a
placement is wrong, it is wrong until evidence of a different kind arrives
(§4, B.4). Show them the words behind it — `node scripts/cs.mjs why Review` —
rather than defending the number.
