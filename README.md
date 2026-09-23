# The Command Scale

**A scale of what a person can get an AI to produce.** Six levels, four
situations, read from a person's own words and counted rather than judged.

Everyone can now issue commands to a model; not everyone gets back what they
meant. The difference between two people commanding the same model is the whole
difference in what they produce, and there is no accepted way to say how large
that difference is or which direction improvement lies in. Two proxies fill the
gap and neither works: prompt technique, which encodes the wording of a moment
rather than a class of decision, and output volume, which measures the model.

This standard proposes the missing axis — **how much of the result the person
determined, and how much was supplied by convention** — and the scale built on
it.

| | Determines | Result |
| --- | --- | --- |
| **L1 Note** | which thing it is | the ordinary version, identical to what anyone else asking in the same terms receives |
| **L2 Verse** | composition and presentation | identifiably the person's in form, conventional in behaviour |
| **L3 Canon** | behaviour: conditions, completion, failure, prohibition | performs as intended, and keeps doing so as conditions vary |
| **L4 Chronicle** | persistence, ownership, access | usable by people other than the maker, holding each user's own material |
| **L5 Saga** | composition of parts and what passes between the parts | a project larger than one pass that integrates and can be changed a part at a time |
| **L6 Myth** | how much to determine at all | a project without precedent: the primitives are the model's, the arrangement is the person's |

A level is not a score for a session. It is held only when it is demonstrated
across enough closed tasks, in every situation that confers it — stating what
should become true (Request), stating what is true of what came back (Review),
reporting that progress has stopped (Roadblock), and asking to be told
something (Question).

## The one test you can apply to yourself right now

Take something you asked a model for. **Hand that same message to two competent
builders. How far apart would the two results be?**

Far apart means convention is doing the work. Converging means you are. It is a
thought experiment for locating yourself, not a measurement procedure — no
reading is taken from it.

## Install it as a skill

This repository is the skill. Put it where your agent looks for skills and it
is installed:

```
git clone https://<this repo> ~/.claude/skills/command-scale
```

Then ask your agent to read your record against The Command Scale. It reads the
transcripts already on your machine, takes the reading itself, and keeps what
it found in `~/.command-scale`. No account, no key, no service: the code here
imports three built-in modules and opens no socket at all.

Looking costs nothing — where you stand, the last few tasks, the words behind
any placement, all of it is arithmetic over files. Only reading a conversation
you have not read before asks your agent to do any work, and it tells you what
that will cost before it starts.

## What this repository is

The standard, and the instrument for taking a reading against it. Both are open
so that two implementations reach the same number; a scale whose readings
cannot be reproduced is an opinion with a table in it.

- **[`SKILL.md`](SKILL.md)** — how an agent takes a reading, and what it must
  not imply about one. **[`prompts/`](prompts)** — the four standards a reading
  is taken against. **[`scripts/`](scripts)** — the preparing, the citation
  check and the counting, in Node with no dependencies.
- **[`spec/the-command-scale-v1.0.md`](spec/the-command-scale-v1.0.md)** — the
  white paper. Its Appendix B is the normative text, together with §4 (how a
  level is read), §5 (crediting, including the default thresholds) and §9
  (assessing minors). Appendix A is normative for the Question situation. The
  rest of the paper is the argument for those appendices.

- **[`conformance/`](conformance)** — cases with their answers, and a runner
  that puts any implementation through them. `node conformance/run.mjs
  --command "python3 mine.py"` puts yours through.

Not yet in this repository: the reading of L6 Myth, which needs thirty closed
tasks before it can be taken at all, and a second family of conformance cases
for where a message sits on the ladder, which is worth calibrating once there
is a second implementation to calibrate against.

## Implementing it

You may implement this scale in anything, without asking and without any code
of ours. The thresholds in §5.3 are defaults; change them if you state your
values and keep the three properties given there. What you may not do is change
the four situations or drop the citation requirement and still call the result
an implementation of this scale — see [`TRADEMARK.md`](TRADEMARK.md), which is
short and asks for very little.

## What it is not

Not a diagnosis, not an intelligence measure, not an attainment record, and not
a certification. No certificate is issued and none can be. Levels may be
reduced, every reading is designed to be disputable by the person assessed, and
a single reading should be treated as a placement rather than a measurement —
§7 records how unreliable one reading is, and §5.3 exists to absorb that.

## What it does with what it reads

Nothing leaves your machine, and what it keeps is listed in full — including
how to take it all back — in [`policy/reading-your-record.md`](policy/reading-your-record.md).
That file is this implementation's answer to §9.6, which requires every
implementation to publish the same six things. Ask any other implementation for
its own.

## Licence

Text and spec under [CC BY 4.0](LICENSE-TEXT.md). Code, prompts and fixtures
under [Apache 2.0](LICENSE). The names are covered by neither — see
[`TRADEMARK.md`](TRADEMARK.md).

Published by [Mentor](https://mentor.farsurf.com), which sells a subscription
product whose assessments are taken against this scale. That is a direct
commercial interest in the scale being adopted, stated here and in §12 of the
paper so it can be weighed.
