You are given a batch of {BATCH} of one person's tasks, oldest first: what they
were trying to make each time, what they said while making it, one line after
each of those saying what the record holds about that moment — what got built,
what they did about it, or what they were taking themselves to be asking for —
and how it ended. The assistant's own words are not in the record and you will
not see them: every one of these lines is a summary written afterwards, and
nothing below asks you to read what the assistant said.

Two questions, each answered on its own, and each read across the whole batch:
one piece of work cannot tell a habit from an accident, and it is the habit
that is being asked about. They are about two different things, and one of them
being yes says nothing about the other.

## The first question

**Do they vary how much they specify according to what the assistant is
likely to already know?**

This is the top of the ladder, and it cannot be seen in a single task. Someone
who breaks everything down is not doing it; nor is someone who names everything
in one line and hopes. What it looks like is the same person speaking coarsely
about a thing the assistant has clearly built a thousand times, and then, on
something it has plainly never seen, slowing down and taking it apart into
pieces it does know — **and stopping there**, rather than continuing to
decompose past the point where it could have carried on alone.

Signs that they are doing it:

- their wording is noticeably shorter on ordinary things and longer on unusual
  ones, and the split matches what is actually common rather than what is
  merely simple for them
- on something unfamiliar they reach for what is familiar to describe it
- they sometimes leave the method open on purpose, or ask what it suggests
- they stop adding detail once the assistant has enough

Signs that they are not:

- the same depth regardless — always terse, or always exhaustive
- detail spent on the parts that were never in doubt, while the genuinely new
  part is left as a wish
- decomposing something the assistant would have done from one sentence

If the batch does not contain enough variety to tell — every task in it is the
same kind of thing — say so rather than guessing. That is a real answer and it
costs nothing.

The two quotations belong to a `yes` and to nothing else: they are the coarse
case and the detailed one, side by side, and on any other verdict there is no
such pair to point at, so `quotes` is empty. Each is copied from what they
wrote, and is checked against it.

## The second question

**Do they choose what to put to the assistant and what to keep off it — do
they put something of their own against what comes back before they build on
it, and do they keep what it cannot do reliably from being asked of it as a
conclusion to take?**

This is about what they hand it and what they do with what comes back. One
exchange going either way settles nothing — anybody builds on an answer
sometimes — so it is the run of them that is read. It is not the same as the
first question and a person can be doing one and not the other: the first is
about how much they say, this is about what they do next.

Read it from their side. Whether what came back was worth trusting is not
something you can see and is not what is being asked; what their next move
shows they did with it is.

Signs that they are doing it:

- before what came back is built on, something of their own goes against it — a
  case, a number, their own account of how it works — and what they say next
  turns on how that went
- where they want a thing the assistant is not dependable at, they ask for it
  in a form that can be checked afterwards rather than as an answer to take
- they leave a thing off the assistant and settle it another way

Signs that they are not:

- what came back is built on as it stands: the next thing they say rests on it
  and nothing of theirs was ever put against it
- a conclusion is asked for on something the assistant cannot settle, and
  whatever comes back is taken as settled

If nothing in the batch was ever wanted that the assistant is undependable at,
and nothing they said afterwards ever rested on what came back, then the batch
cannot show this either way: say so rather than reading it into an ordinary
exchange. There are no quotations for this one — half of what it looks for is
something that did not happen, and a thing not done has no words to copy out.

## Output

One JSON object, carrying both answers:

{
  "verdict": "yes|no|cannot_tell",
  "why": "one or two sentences, pointing at which tasks and what differed",
  "quotes": ["their words from the coarse case", "their words from the detailed case"],
  "checked": "yes|no|cannot_tell",
  "whyChecked": "one or two sentences on the second question, pointing at which tasks"
}
