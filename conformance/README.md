# Conformance

A set of cases with their answers. Put an implementation through them and it
either agrees with the standard or it does not, case by case, with the
difference named.

```
node conformance/run.mjs                              # the implementation here
node conformance/run.mjs --command "python3 mine.py"  # somebody else's
```

## What is checked, and what is not

**Checked: the parts of the standard that have one right answer.** How the
placements that survive are counted — the crediting line, the give-back line,
the sample floor, one sample per situation per task, the escape that is
excluded in both directions and still reported — and which claimed placements
survive at all: the citation check, the fields a placement must carry, the
levels it may name.

**Not checked: where a message sits on the ladder.** That is a judgement, and
§7 records that two readings of the same task disagree often enough that no
suite could demand agreement without failing every implementation including
this one. A second family of cases could state a tolerance instead; it is worth
building once there is a second implementation to calibrate against, and until
then it would only show that this implementation agrees with itself.

So passing these cases does not mean two implementations will place a given
sentence at the same level. It means that once they have placed it, they will
count it the same way, and will throw out the same claims.

## The contract, for an implementation of your own

`--command <cmd>` runs `<cmd> counting` and `<cmd> verification`. Each is given
the case's `input` as JSON on standard input and must write its answer as JSON
on standard output. Anything your implementation keeps beyond these fields is
its own business and is not compared.

**counting** — in: `{ "tasks": [ { "id", "at", "placements": [ { "message",
"column", "rung", "cite", "landed", "becomes"? } ] } ] }`, oldest task first.
Out:

```json
{ "level": 0,
  "setAside": 1,
  "situations": {
    "asking": { "held": 3, "reached": 3, "seen": 10,
                "cells": { "3": { "n": 10, "pos": 7, "met": true,
                                  "warning": false, "givenBack": false } } } } }
```

`level` is the level held across every conferring situation, or 0. `setAside`
counts every firing of the escape. A situation with no samples is left out
rather than given an empty entry. A height with no samples is left out of
`cells`.

**verification** — in: `{ "turns": [ { "quote" } ], "only": ["asking", …],
"answer": { "placements": […], "elsewhere": […] } }`. Out:

```json
{ "kept": [ { "message": 1, "column": "asking", "rung": 2 } ],
  "rejected": [ { "message": 1, "reason": "the words are not in their message" } ],
  "malformed": false }
```

`kept` is sorted by message then situation, `rejected` by message then reason.
`malformed` is true only when something was thrown out and every reason was the
answer's own shape — one false claim among shape faults and it is false.

## The reasons a placement is thrown out

These strings are part of the contract, because an implementation that throws
out the right placement for the wrong reason sends its reader to fix the wrong
thing.

| reason | when |
| --- | --- |
| `no placements in the answer` | nothing placed and nothing named, over a task that holds messages that were input |
| `no such message` | a message number the task does not hold |
| `situation or level out of range` | a situation this pass was not taken against, or a level outside one to five |
| `the words are not in their message` | above the first level, a fragment not found in the message it is credited to |
| `whether it landed is not one of the three answers` | anything but met, not met, set aside |
| `nothing becomes true` | a Request placement with nothing in `becomes` |
| `this reading also said it belongs elsewhere` | the same answer named that message as belonging to the other standard |

## Changing the thresholds

§5.3 lets an implementation choose its own values if it states them and keeps
the three properties. An implementation that does will fail the cases that turn
on the values it changed, and that is correct: readings taken under different
values are not comparable and should not be described as readings against these
defaults. State your values, and say which cases you fail and why.

## Adding a case

A case is a name, what it asks, an input and the expected answer. Derive the
answer from the standard before running anything — a case written down from
what an implementation happened to print is a test that the implementation
agrees with itself.
