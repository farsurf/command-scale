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
§9, together with Appendix B, are the normative text, and Appendix A is
normative for the fourth situation — `prompts/knowing.md` and `prompts/depth.md`
are its implementation. The prompts below are the
instrument, and they are written to be applied exactly as given.

## What the person sees

A reading is taken for somebody. Three things are owed to them, and none of
them is the program's to say.

**Before anything is read, say what will be read and stop.** Name the
conversations by when they happened and how they open, say how many tasks that
comes to, say where the readings will be kept and that one command removes
them. Then stop and let them change the selection. Reading costs a model call
per task and cannot be undone once spent; a selection they never saw is a
selection they cannot correct, and correcting it afterwards means paying twice.

**After each task, say one line to them**: what they were doing in that task,
and the heights it reached. The program prints this line. Pass it on as it
comes rather than saving it up — a run that says nothing until the end is
indistinguishable, from outside, from a program helping itself to the machine,
and a run stopped part way then hands over nothing at all.

**At the end, hand over the card itself.** `report` and then `gap`, given to
them whole. Describing what the card would say is not giving it to them.
`report` also writes the same reading as a single page, `reading.html`, in the
work directory, and prints its path: show that page if you can render one, and
otherwise tell them where it is so they can open it. It loads nothing from
anywhere and works offline.

## The order of work

Run the program and do what it says next. It is resumable: a run that stops is
continued, never started again.

```
node scripts/cs.mjs status        # where they stand — costs nothing, asks no model
node scripts/cs.mjs list          # what is waiting, and what reading it would cost
node scripts/cs.mjs import --budget 40    # read as much as they want to spend
node scripts/cs.mjs next          # what to do, one step at a time
```

**Looking costs nothing; only reading new conversations costs anything.**
`status`, `recent`, `why` and `report` are arithmetic over what is already on
disk. Say so when somebody asks how much checking their level costs.

**Never read their whole history unasked.** `list` says how many conversations
are waiting altogether, then shows the newest twenty — `--limit` shows more —
with an estimate beside each of how many readings it would take and a total for
the ones it showed. The estimate comes from how many messages they sent, by a
ratio this implementation guessed and the standard does not fix. `--budget N`
takes conversations newest first, skipping any that would take the total past
the budget, and refuses rather than reading past it. If they have not said how
much to spend, read a few of the newest and say plainly that this is a
placement over a few tasks.

**Offer the slice by when it happened, or by which source it came from** —
`--since`, `--project`, `--take`, where the sources are whatever `list` prints.
Choosing their best conversations and leaving out the rest makes the reading a
fact about those conversations rather than about them, and `list` says so on
every run.

**Say what this implementation can read.** It reads the session files a coding
agent leaves on the machine, and it recognises one layout today: the JSON-lines
files under `~/.claude/projects`. A conversation kept any other way is read with
`--file` once it has been saved as plain text with each side's turns marked.

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

**Take the second pass without the first answer in view.** Held in one standard
with the other three, the fourth situation's arrival moves them: the same words
and the same model give different levels inside the first three. Two passes over
one input cost one more reading and leave the first three the reading they were.

`node scripts/cs.mjs place <session> <task>` keeps the first pass;
`node scripts/cs.mjs know <session> <task>` keeps the second. When there is
nothing left: `node scripts/cs.mjs report`.

A pass that finds nothing of its own in a task answers with no placements and
an `elsewhere` naming what it passed over. That is an answer, not a fault.

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

## What the reading owes them beyond a number

§8 puts three parts in the method and only the third is arranging an occasion.
The second — **naming the single lowest-standing capability at the level they
hold** — is part of the reading, and `node scripts/cs.mjs gap` is where it is
said: their own sentence at the height they reached, what that height closed,
and what the next one closes that it does not. Every sentence in it is either
the standard's, parsed from it, or theirs, quoted from the message it was
credited to.

**Do not write the better sentence for them.** Not in the card, not in
conversation, not when asked nicely. A sentence handed over is the assistant's,
and this standard says in so many words that what the assistant said is never
theirs — so a person who uses it is being credited for words that are not their
own, and the next reading will be a reading of you. Name what they left open
and stop there.

**Do not arrange their practice.** Choosing a subject for them, setting them an
exercise, scheduling a next occasion, or tracking whether they did it is the
third part of the method and no part of this instrument.

## What this reading cannot say, and must not imply

**L6 Myth is not read here.** It is read across batches of ten closed tasks,
three batches at least (A.5). `prompts/depth.md` is the reading for it; this
program does not take that reading at all. It counts the batches and says on
the card how many there are and how many are needed.

**Question confers nothing.** It is placed and recorded. It begins to confer
one month after an implementation begins to arrange practice in it, on a single
date for everyone that implementation assesses (B.2). Nothing here arranges
practice, so this implementation states its date as never, and the card says so.

**Under ten occasions at a height with seven met, no level is held there.**
That is the standard's published default (§5.3). This implementation also sets
a sample floor of five, under which no rate is printed at all; five is this
implementation's own value, not the standard's, and §5.3 requires it to be
stated as such. A reading over few tasks is a placement, not a measurement
(§10). Say that plainly if you are asked to summarise the card;
never round it up into a verdict about the person.

**Reading somebody else's record needs their consent first**, and where that
person is a minor, a guardian's informed consent and the minor's knowledge are
required by §9.1 — assessment without the subject's knowledge is not an
implementation of this scale. This program cannot tell whose transcripts it was
pointed at, so the check is yours. `policy/reading-your-record.md` states what
is kept, where, and how to remove it; say so when somebody asks.

**A level can be disputed and the dispute stands.** If the person says a
placement is wrong, it is wrong until evidence of a different kind arrives
(§4, B.4). Show them the words behind it — `node scripts/cs.mjs why Review` —
rather than defending the number.
