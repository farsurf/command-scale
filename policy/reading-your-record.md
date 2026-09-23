# What this instrument does with what it reads

§9.6 of the standard requires an implementation to publish six things: who reads
the material, what is retained, for how long, where it is stored, how consent is
taken and revoked, and how a placement is disputed. These are this
implementation's answers. A reader evaluating any other implementation should
require the same list from it.

## Who reads the material

The coding agent already running on your machine. There is no service behind
this, no account, and no key: the program in `scripts/` prepares what the agent
reads, checks what it claims, and does the counting, and it imports three
built-in modules and opens no socket at all.

Nobody else reads it. Nothing is uploaded, and there is nowhere for it to be
uploaded to.

## What is retained

Under `~/.command-scale`, per conversation read:

- your own messages, byte for byte as your agent recorded them, because a
  reading is a claim about what you said and every level above the first is
  checked against exactly this text;
- up to 400 characters of each reply that followed one, and the names of the
  tools it used — enough to tell whether your words landed, and no more;
- how the conversation was grouped into tasks;
- the two readings taken of each task, as written;
- the placements that survived checking, each with the fragment of your own
  words it was credited to;
- the counting, and one line per reading that moved anything.

Nothing else. Not the assistant's full replies, not files it touched, not
anything about anyone who appears in your transcripts but did not write them.

## For how long

Until you remove it. Nothing here expires on its own and nothing is rotated
away, because a level is held over a run of readings and a run that silently
lost its early ones would report a different person.

`node scripts/cs.mjs forget --all` removes everything it kept.
`--session <id>` removes one conversation. Your agent's own records are
untouched by either: this only ever read them.

## Where it is stored

In one directory on the machine it ran on: `~/.command-scale`, or wherever
`COMMAND_SCALE_DIR` points. Plain text and JSON. Nowhere else.

It lives with the person rather than beside a project, because a reading is
about a person: kept per directory, somebody working in three repositories
would have three separate records of themselves, each too thin to hold
anything.

## How consent is taken and revoked

You run it on your own record, and running it is the consent.

**Reading somebody else's record is a different act and needs their consent
first.** Where that person is a minor, §9.1 of the standard applies in full: a
guardian's informed consent is required, and the minor must be told, in terms
the minor can understand, that the minor's sessions are read and by whom.
Assessment conducted without the subject's knowledge is not an implementation
of this scale. Consent is revocable; revoking it stops future readings, and
`forget` removes the stored ones.

This instrument cannot tell whose transcripts it has been pointed at. That
check is yours, and the standard makes it a requirement rather than a courtesy.

## How a placement is disputed

Every level above the first quotes your own words, and
`node scripts/cs.mjs why <situation>` shows every placement with the fragment it
was credited to and the one line saying why it sits where it does.

If you say a placement is wrong, it is wrong. A guardian's or subject's ruling
stands against the machine's until evidence of a different kind arrives (§4,
B.4). Remove the reading it came from with `forget --session`, and the counting
follows.

## What a reading is not for

A level is a description of what you can currently get built. It is not a
diagnosis, not an intelligence measure, not an attainment record, and not
admissible as either. No certificate is issued and none can be. Levels may be
reduced. A reading over few tasks is a placement rather than a measurement, and
the card says so on every run.
