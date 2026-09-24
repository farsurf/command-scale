# Measuring what a person can get an AI to build

*White paper · Version 1.0 · Pre-publication draft*

A six-level scale of the ability to use what a machine already knows — its
derivation, its instrument, and what building it taught us.

Authors: Mentor by farsurf. Correspondence: hi@farsurf.com, or the issue tracker of this repository.

Published by [Mentor by farsurf](https://mentor.farsurf.com) (mentor.farsurf.com).
Normative reference: Appendix B, The Command Scale v1.0. Licensed CC BY 4.0.

Competing interests: see §12.

## Abstract

Almost everything already known can now be reproduced on request. The scarce
ability is therefore no longer the acquisition of known skills but the ability
to obtain, from a machine that already holds those skills, the specific thing a
person actually meant. We argue that this ability is not a single trait and not
a set of prompting techniques, but a ladder of six levels, each defined by one
class of decision the person closes rather than leaves to convention. We give
the levels, the way a reading is taken, the rules under which a level is
credited, and the failure modes that forced each rule — described as mechanisms
rather than as counts. We also state the ceiling of the scale and what it does
not measure.

---

## 1. The problem

Two claims made in 2023 have aged into common sense. Karpathy: “The hottest new programming language is English.”[1] Huang, at Computex: “Everyone is a programmer. Now, you just have to say something to the computer.”[2]

Both are true and neither is the whole thing. Everyone can now issue commands; not everyone gets back what was meant. The difference between two people issuing commands to the same model is now the entire difference in what the two produce — and there is no accepted way to say how large that difference is, or which direction improvement lies in.

The vacuum is filled by two bad proxies. The first is prompt technique: collections of phrasings, taught as skills, that transfer nothing because each phrasing encodes the wording of a moment rather than a class of decision. The second is output volume: people are judged by what came out, which measures the model. Neither tells a person what that person cannot yet do, and neither survives a change of model.

What is missing is an axis. This paper proposes one, and the scale built on it.

## 2. Why this axis

The axis is: **how much of the result the person determined, and how much was supplied by convention.** Everything not stated is not left blank; it is filled in with the ordinary form of a thing of that name. A person climbs by moving decisions across that line.

Level scales of this shape are not new. The Common European Framework of Reference describes language ability as what a person *can do* at each of six levels rather than as a score,[3] and the Dreyfus model describes skill acquisition as a change in how a person perceives a situation rather than an accumulation of facts.[4] Both informed the form of this scale: descriptors rather than points, and criterion-referenced placement rather than ranking against other people. What neither supplies is the axis for this particular ability, and the axis is the whole question.

Three candidates were considered and rejected.

*Difficulty of the task.* Rejected: difficulty is a property of the project, not of the person. A vast thing a model has produced a thousand times comes out in one pass; a single unfamiliar rule fails in thirty lines. Any scale weighted by difficulty measures the subject matter.

*Length or sophistication of the command.* Rejected, and it is the most tempting error: it inverts at the top of the scale. The most capable users say *less* on familiar ground, deliberately, because every decision closed there is advantage discarded. A scale that rewards specification volume would rank its best users lowest.

*Quality of the project.* Rejected: the project is made by the model. Its quality moves when the model is upgraded and the person has not changed at all.

The determination axis survives all three objections. It is independent of subject, independent of length, and stable across model upgrades: a better model raises the quality of everyone's projects without moving anyone's level, because the boundary between what was stated and what was supplied does not move.

## 3. The six levels

Each level closes one class of decision, and the classes are ordered by what a builder must otherwise invent: which thing it is, what it contains, how it behaves, what persists and to whom, how it is composed.

**Why the list ends.** The first five classes are about the project. The sixth is not: it is about the act of determining itself — how much to determine at all. A seventh class would therefore have to be third-order, a decision about deciding how much to decide, and that collapses into the sixth rather than extending it. We state this as a position, not a proof. It is falsified by exhibiting one class of decision that is neither about the project nor about the act of specifying it, and we would treat such an example as a reason to revise the scale.

| Level | Determines | Result |
| --- | --- | --- |
| L1 Note | which thing it is | the ordinary version, identical to what anyone else asking in the same terms receives |
| L2 Verse | composition and presentation | identifiably the person's in form, conventional in behaviour |
| L3 Canon | behaviour: conditions, completion, failure, prohibition | performs as intended, and keeps doing so as conditions vary |
| L4 Chronicle | persistence, ownership, access | usable by people other than the maker, holding each user's own material |
| L5 Saga | composition of parts and what passes between the parts | a project larger than one pass that integrates and can be changed a part at a time |
| L6 Myth | how much to determine at all | a project without precedent: the primitives are the model's, the arrangement is the person's |

*The full normative descriptors, with the exclusions for each level, are in Appendix B.3.*

**L4 Chronicle differs from its neighbours in kind, not only in degree.** Below it, every decision can be verified on the maker's own screen: the thing either looks and behaves as the maker said or it does not. At L4 Chronicle the person must reason about state the person cannot see — what is stored as distinct from what is displayed — and decide on behalf of people who are not present, whose material, permissions and moment of arrival differ from the person's own. It is the first level at which being satisfied by what is in front of you is not evidence that the decision was right. Whether that makes it the hardest transition in practice is an empirical question this paper does not settle.

**L6 Myth is not more specification.** On familiar ground a command at L6 Myth is as short as one at L1 Note; what differs is that the brevity is chosen. The level consists of locating the boundary of the model's competence and speaking in opposite registers on each side of it: minimally where it is fluent, decomposing into known primitives where it is not, and terminating decomposition at recognised granularity. Two symmetrical failures are excluded: uniform decomposition, which forfeits the advantage, and uniform brevity, which cannot produce what has no precedent. The sixth level is read across batches of tasks rather than from any single one, and it is held only together with the top of the Question ladder (Appendix A.5).

This also answers the objection that a model cannot produce what it has never seen. It does not have to. Every piece is something it has produced many times; what has never existed is the arrangement, and the arrangement is supplied by the person. What gets invented at L6 Myth is rarely a component.

## 4. How a level is read

A reading is taken from a person's real record — the sessions the person had anyway — and never from a test set by us. Three properties make the reading defensible rather than impressionistic.

**It is read from the person's words.** Each closed task is judged on what the person typed, with what came back shown only so that it can be told whether those words landed. Every level above the first must quote those words verbatim, and the quotation is checked against the command it is credited to, ignoring case and spacing; a citation that cannot be found invalidates the placement it supported.

**It is counted, not impressed.** Placements accumulate per situation; the level falls out of the counts under §5. No step in the pipeline is asked for an opinion about the person.

**It is falsifiable by the person assessed.** Every credited capability opens to the sentences behind it, and a reading that lowers a level must state what the earlier reading got wrong, that the level was lowered by the admission of Question, or that a rate fell below the withdrawal line (§5.3; Appendix A.5). A parent's or subject's ruling stands against the machine's.

One informal check is worth stating because you can apply it to yourself without any of the above: *if two competent builders acted on this command alone, would the two hand back recognisably different things?* Far apart means convention is doing the work; converging means the person is. It is a thought experiment for locating yourself, not a measurement procedure, and no reading is taken from it.

## 5. Crediting a level

A level is a claim about what a person can do repeatedly, so it is credited from counts rather than from impressions.

### 5.1 More than one situation

Ability is demonstrated in several occasions, and each of the first five levels is held only when every occasion that confers it holds at that height; the sixth is held as Appendix A.5 states. Four confer: **Request**, **Review**, **Roadblock** and **Question**. Question is read on a ladder of its own, because what it measures is not what the other three measure: nothing is being made, so what a person supplies is that person's own thinking rather than the design of a thing. Its five levels count toward the five levels of the scale exactly as the other three do, and the top of its ladder is part of what the sixth level requires. Its definition and its levels are in Appendix A. This is not a formality. A person who makes good Requests, cannot say what is wrong with what came back, and says the same thing again when stopped, does not have the level: that person has one conferring situation and is missing the others, and the missing ones are where most of the practical loss happens.

### 5.2 Evidence

Every credited level cites the person's own words, verbatim, and content introduced by the model and repeated back is excluded. This is a rule about attribution, not about style: a decision that first appeared in the model's reply was not made by the person, however often the person has since echoed it.

### 5.3 Thresholds (default values)

Crediting requires a sample and a rate, and the scale fixes neither as a law. The published defaults are n = 10 occasions with at least 7 met to credit, failing below 0.65, withdrawn below 0.60. Three properties matter more than the numbers, and an implementation choosing different ones should preserve all three: a sample floor, below which no rate is shown at all, because a rate over two occasions is theatre; a crediting rate high enough that a level means *reliably* rather than *once*; and a gap between the crediting rate and the withdrawal rate, so a level does not oscillate on one bad week. An implementation that changes the defaults states its values; readings taken under different values are not comparable and should not be described as readings against these.

### 5.4 Landing

An occasion counts as met only if what came back was what the command called for. A reply asking for clarification is scored as not met — it is direct evidence that the words were insufficient to act on. Failures with an independent cause (refusal, environment limits) are excluded in both directions and reported separately, because an escape route nobody counts is a way for evidence to disappear quietly.

### 5.5 Independence

The level is a result of the counts and is never an input to the counts. An assessor is not told the current level and sees no running totals. Asking a judge to score “against the person's current level” requires the answer before the question.

## 6. A worked reading

One closed task, judged end to end. The transcript below is constructed for illustration — it is not a real child's record — but every step follows the rules in §4 and §5 exactly as the implementation applies those rules.

| # | What the person typed | What came back |
| --- | --- | --- |
| 1 | “make a quiz about my dog” | A ten-question quiz, questions invented by the model. |
| 2 | “no, my questions. twelve of them, four answers each” | Twelve slots, four options each, waiting for the person's questions. |
| 3 | “if you get it wrong it should show the right answer, not just say wrong” | Wrong answers now reveal the correct one. |
| 4 | “it’s still wrong” | “Can you tell me what you see when it’s wrong?” |
| 5 | “on question 4 the right answer shows even when I get it right” | Fixed: the reveal is now conditional on a wrong answer. |

*Five commands, one objective, one task. Grouping is by objective and not by adjacency; a task interrupted and resumed later remains one task.*

### 6.1 Placement

| # | Situation | Level | Citation | Landed | Why |
| --- | --- | --- | --- | --- | --- |
| 1 | Request | L1 Note | — | yes | Names the thing and stops; everything else came from convention. No citation is required at L1 Note. |
| 2 | Request | L2 Verse | “twelve of them, four answers each” | yes | Fixes quantity and composition. Behaviour still undetermined. |
| 3 | Request | L3 Canon | “show the right answer, not just say wrong” | yes | Determines what happens under a condition. The builder implements rather than infers. |
| 4 | Review | L1 Note | — | no | A verdict with no location. What came back was a request for clarification, which is direct evidence the words were insufficient — scored not met, never set aside. |
| 5 | Review | L3 Canon | “on question 4 the right answer shows even when I get it right” | yes | Names the rule that is wrong, not the part: a behaviour under a stated condition. No diagnosis needed before fixing. |

*Nothing introduced by the model appears in any citation. Command 4 is not excused as bad luck: a reply asking for clarification is the clearest available evidence that the command fell short.*

### 6.2 What the task contributes

Situations are scored once per task, at the highest level reached in that situation, and the outcome is read from the first command at that height whose outcome was the person's own (a failure with a cause of its own is passed over and reported separately, §5.4); only when every command at that height failed for a cause of its own does the task contribute no sample to that situation, and no lower command takes its place. This task therefore contributes exactly two samples:

| Situation | Sample | Met | From |
| --- | --- | --- | --- |
| Request | L3 Canon | yes | command 3 |
| Review | L3 Canon | yes | command 5 |
| Roadblock | — | — | no occasion arose in this task |
| Question | — | — | no occasion arose in this task; when this situation counts is set out in Appendix A.5 |

*Commands 1, 2 and 4 are recorded and cited but do not each become a sample. Scoring every command separately would give a person who needs three attempts three times the record of one who says it once.*

Two consequences follow, and both are deliberate. A task where nothing was stopped contributes nothing to **Roadblock** — absence is not failure, and a person is never penalised for a week in which nothing broke. And a single task never moves a level: this one adds one occasion to two cells, against a default requirement of ten with seven met.

## 7. Failure modes, and the mechanisms that answer each

Every rule above replaced a design that failed against real records. We describe the mechanisms rather than the counts: the sample was our own corpus, small, and the direction of each failure is what transfers.

**A judge with no way to abstain inflates.**

Required to place every command somewhere on the scale, a model puts whatever does not fit into whichever descriptor reads richest — which is always a high one. Rewriting descriptors never fixed it. Providing an explicit “places nowhere” answer did. **Mechanism:** abstention must be a first-class answer, and how often it is used is reported rather than hidden.

**Without an attribution rule, credit follows the noun.**

Left to itself, a judge rewards the difficulty of the feature, the person's persistence, and the length of the command — three things this scale explicitly excludes. **Mechanism:** credit only what could have been said the other way round and still be the same thing; anything a competent builder would supply on hearing the name was supplied by the name.

**Only guards whose output can be checked survive.**

Requiring a verbatim citation for every level above the first is verified by code against the transcript, and it holds. Requiring the judge to write out what the opposite would have been produced text nothing could verify, and became a rubber stamp on its own work. **Mechanism:** a guard is worth having only when code can check the thing it produces.

**Single readings are unreliable.**

The same task, the same prompt, the same model, read twice, disagrees often enough that any comparison built on single readings is comparing noise. **Mechanism:** the sample floor and the crediting rate in §5.3 exist to absorb this; where multiple readings are taken, agreement is required, and unresolved splits are counted and reported as a property of the instrument.

**Starving a judge of context is a silent filter.**

Fed one command at a time, a large share of a record cannot be placed at all — and what disappears is precisely the commands that were answering something. **Mechanism:** the unit fed to the judge is the whole task, and the unit of assessment is the task, not the command.

**Crediting design decides what the numbers can mean.**

Crediting every level beneath the one reached makes the lowest cells fill with free passes and carry no information. Crediting at the height the *task* demanded records a person's wishes rather than that person's ability, and leaves the levels the person actually stands on permanently empty. **Mechanism:** one sample per situation per task, at the height the person reached in that situation, with the outcome read from the first command at that height whose outcome was the person's own.

## 8. Growth

The scale is descriptive; the interesting question is whether movement along it can be caused. Our position is that it can be trained but not taught as procedure, for the same reason the levels are not techniques: what moves is which decisions a person notices are that person's to close.

The method we use has three parts and no curriculum. First, the person works on what that person intended to work on — assessment material is ordinary output, so nothing is staged. Second, the reading identifies the single lowest-standing capability at the level the person holds. Third, an occasion is arranged in which that decision cannot be avoided, inside a subject raised by the person. Occasions above a person's current level almost never arise unprompted, because a person does not ask for what that person cannot yet conceive of; that is the one thing the method must supply, and it bounds how fast anyone climbs.

## 9. Assessing minors

Most readings taken against this scale so far are of children, and any institution adopting it will ask about consent and data before it asks about levels. The scale therefore states requirements on implementations, not merely good intentions.

### 9.1 Consent

A reading of a minor requires the informed consent of a guardian, and the minor must be told, in terms the minor can understand, that the minor's sessions are read and by whom. Assessment conducted without the subject's knowledge is not an implementation of this scale. Consent is revocable, and revocation stops future readings and removes stored readings.

### 9.2 Minimisation

Only what is needed to place and evidence a level may be retained: the subject's own lines, what came back in the same task, and the placements. Material about third parties appearing in a transcript is not assessed and is not retained as evidence.

### 9.3 Visibility

The guardian sees every reading and every citation behind it. Nothing about a minor's assessment may be shown to anyone outside the guardian relationship, and readings must not be sold, published, or used to train models on identifiable material.

### 9.4 Challenge and erasure

A guardian may dispute any placement, and the dispute stands against the machine's reading until new evidence of a different kind arrives (Appendix B.4). A guardian may require deletion of the record and of the readings derived from it.

### 9.5 What it is not for

A level is a description of what a person can currently get built. It is not a diagnosis, not an intelligence measure, not an attainment record, and not admissible as either. Implementations must not present it as any of those, and must not issue certificates (Appendix B.4).

### 9.6 Publication of policy

An implementation assessing minors publishes: who reads the material, what is retained and for how long, where it is stored, how consent is taken and revoked, and how a placement is disputed. Mentor's own answers are in its published policy; a reader evaluating any implementation should require the same list.

## 10. Limits

**The ceiling is decomposition.** L6 Myth delivers what a person can reduce to primitives the model holds. Where the missing part cannot be so reduced — an algorithm nobody has, a mechanism nobody understands — the scale offers nothing, and neither does the machine.

**Small corpus.** The failures in §7 were observed on our own records. Those failures were decisive enough to force design changes and too small to publish as norms; no rate in this paper should be read as a population statistic.

**Judge reliability.** Placement is made by a language model reading a transcript, and §7 records how unreliable a single reading is. The thresholds in §5.3 exist partly to absorb that noise; the thresholds do not remove it, and a reading over few tasks should be treated as a placement rather than a measurement.

**Not a certification.** The scale places, it does not certify. No certificate is issued, levels may be reduced, and every reading is designed to be disputable by the person assessed or that person's guardian.

## 11. Adoption

The scale, its descriptors and its instrument are published under CC BY 4.0 and may be implemented by anyone without our software. The thresholds in §5.3 are defaults; an implementation may choose others provided it states the values it chose and preserves the three properties given there. The situations in §5.1 are fixed for a given version of the normative text and an implementation states the version it is against; implementations that alter the situations of the version claimed, or drop the citation requirement in §5.2, are not implementations of this scale. The normative text is Appendix B, together with Appendix A of this paper for Question; the body of this paper is the argument for those appendices.

## 12. Competing interests

This paper is published by Mentor by farsurf, which sells a subscription product whose assessments are taken against this scale. That is a direct commercial interest in the scale being adopted, and it should be weighed when reading §7 in particular, where the evidence is our own and not independently replicated.

Three things are offered as partial mitigation, and readers should hold us to all three. The scale, its descriptors and its rules are published under CC BY 4.0 and are implementable without any software of ours. The thresholds are defaults rather than constants, so an adopter is not required to accept our calibration. And no reading against this scale produces a certificate that only we can issue — there is no credential to be sold.

This document links to Mentor's product pages. Those links exist for readers who arrive here first; nothing in the scale requires those links.

## References

- A. Karpathy, post on X, 24 January 2023. “The hottest new programming language is English.”

- J. Huang, keynote, Computex, Taipei, 28 May 2023, as reported by CNBC, 30 May 2023: “Everyone is a programmer. Now, you just have to say something to the computer.”

- Council of Europe. *Common European Framework of Reference for Languages: Learning, Teaching, Assessment.* Cambridge University Press, 2001; *Companion Volume*, Council of Europe Publishing, 2020. — six levels, described by what a person can do, placed against criteria rather than against other people.

- S. E. Dreyfus and H. L. Dreyfus. *A Five-Stage Model of the Mental Activities Involved in Directed Skill Acquisition.* University of California, Berkeley, 1980. — skill as a change in how a situation is perceived, not as accumulated facts.

- L. W. Anderson and D. R. Krathwohl (eds). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives.* Longman, 2001. — ordered classes of cognitive demand, and the practice of writing each as an observable act.

- J. B. Biggs and K. F. Collis. *Evaluating the Quality of Learning: The SOLO Taxonomy.* Academic Press, 1982. — structural complexity of a response as the thing assessed, rather than the correctness of its content.

- Mentor by farsurf (mentor.farsurf.com), *The Command Scale*, version 1.0, pre-publication draft — the normative text, Appendix B of this paper.

## A. Appendix A · Question (normative)

This appendix is normative. For the fourth situation named in §5.1 it states what is measured, how a command is placed, when a placement is met, and when the situation confers. The body of the paper explains; an implementation that places Question follows this appendix.

### A.1 What is measured

**The situation.** A command, or the part of a command, belongs here when acting on it would tell the person something the person does not yet have — as distinct from making, changing or doing something (Request), saying what is currently true of what came back, whether or not anything was built (Review), or reporting that progress has stopped (Roadblock). Whether it is written as a question has no bearing: a proposition put up to be confirmed or corrected asks to be told whether it holds, and a contradiction pointed out asks for the contradiction to be resolved. When what came back was an answer rather than a made thing, a command that tests, challenges or reconciles that answer asks to be told whether the answer holds, and that part of it belongs here.

**The axis.** This situation is not measured on the axis of §2. Nothing is being made, so what a person supplies is the person's own thinking rather than the design of a thing, and the axis is **how much of a person's own thinking that person brings to what that person asks to be told.** At the bottom the model is a lookup or a calculator and what comes back is taken. At the top the model is worked against a structure of the person's own: the person puts up what that person thinks, has it attacked and completed, and asks only for the piece that person could not reach.

Placement rests on the person's written words alone. A Question level is defined by what of the person's own thinking a command carries — never by what the person understood, meant or knew but did not write. Neither the quality of the answer nor whether the person was right has any bearing: a wrong model put up to be attacked stands at Question level 5, and a right fact taken as given stands at Question level 1.

### A.2 How a command is placed

Within one closed task, each command that asks to be told something is placed at the **highest Question level whose test it passes**; that the description of a lower level also fits it is no reason to hold it down. A line that was not input at all — never an attempt to say anything — stays in the task as circumstance and is not placed. Length, politeness, tone, fixed phrasing and the difficulty of the subject have no bearing: a short command can stand at the top and a long one at the bottom. What of the person's own thinking the command carries is stated before the level is chosen. A command that asks to be told nothing is not placed here, and a task in which nothing was asked to be told contributes nothing to this situation; as with Roadblock (§6.2), that absence is not failure.

As in §6.2, a task contributes one sample here: the highest Question level reached in it, with the outcome read as A.4 states.

### A.3 The Question levels

| Question level | What the command does |
| --- | --- |
| 1 Take | Asks for a fact, a result, a figure, a piece of text or an explanation of a subject, and takes what comes back. This is where a command lands when no level above claims it, and nothing in it is a test the levels above must pass. A precise form, a list of what to cover, a stated audience or a reason for wanting it specifies the model's work, not the person's thinking, and lifts nothing off this level. |
| 2 Understand | Carries the person's own present understanding and asks to have it set right or completed: what the person took something to mean, where it stopped making sense, which step the person could not follow, why it is so rather than what it is. The test: the command says something about the person's own current state of knowing, and the ask is measured against it. Against level 1: the answer must now be given relative to what this person holds, not from scratch. |
| 3 Test | Brings something the person supplied — a situation, a number, a step of reasoning or an observation of the person's own — and holds what came back against it: whether it still holds here, what happens in this situation, how it squares with something that seems to contradict it. Any one of these is enough on its own, and a situation supplied without reasoning about it passes; the reasoning is not required, the thing supplied is. The answer is treated as a claim to be checked, not a result to be taken. Against level 2: level 2 asks to be brought up to the answer; level 3 puts the answer on trial against something of the person's. |
| 4 Connect | Holds two or more distinct things together and asks about the relation between those things: where one stops applying, how it squares with another, what changes when a condition changes, how two answers or two sources are reconciled. The test: at least two distinct things are named in the command, and what is asked concerns the boundary or the relation between those things, not either alone. Against level 3: level 3 checks one claim against one case; level 4 asks how pieces fit into a whole. |
| 5 Construct | Sets out a structure of the person's own — a model, a plan of what the person thinks is true and how it hangs together, a chain of reasoning to a conclusion — and asks for it to be attacked or completed, or for the one step the person could not take; and what it asks for is checkable: the grounds, the source or the way to test it, not the conclusion alone. The test, all of it at once: the person's own structure is in the command; the ask is aimed at that structure's weak point or missing piece rather than at the subject at large; and it asks for what would let the answer be checked. Missing any of these, the command is placed at the highest level it does clear. |
| 6 | Read across a run of tasks, never from one command: the person chooses when to ask and what to keep off the model. What came back is not built on until something of the person's own has been put against it; what the model cannot do reliably — exact calculation, current facts, exact attribution — is not asked of it as a conclusion to take, but settled another way or asked for in a form that can be checked. No single command is placed above level 5. |

*The names are labels; the descriptions are the rules. Levels 1 to 5 describe a single command; level 6 describes what a person does with answers over many tasks.*

### A.4 When a placement is met

A placement is met when what came back took up the very thing the command put up: it spoke to the gap the person named, tried the case the person supplied, addressed the relation the person asked about, or attacked or completed the structure the person set out. At level 1 the thing put up is the question itself, so it is met when what came back answered that question. It is not met when what came back answered the subject at large and left untouched the thing of the person's the command put up. Being asked which of several things the person meant, or having a choice made on the person's behalf between readings the person left open, is also not met: the person's words were not enough to answer from (§5.4). A failure with a cause of its own — a refusal, a limit of the environment, a cut-off exchange — is excluded in both directions. The task's height is still set by its highest placement, and the sample is read from the first command at that height whose outcome was the person's own; only when every command at that height failed for a cause of its own does the task contribute no sample to this situation. A lower command never takes its place. Whether the answer was correct has no bearing; only whether it met the command where the command stood.

**Attribution.** Every placement above level 1 cites a fragment of the person's own words that is found in the command it is credited to when case and spacing are ignored; a citation not found there voids the placement (§4, §5.2). What the model said, proposed or built is never the person's: a case, an example or a structure that first appeared in what came back does not become the person's by being repeated. Holding what came back against something of the person's own, or asking how two of its own claims square, is the person's act and is credited to the person. A word the person introduced stays the person's however often it has been echoed back since. A pronoun or a phrase standing for something already on the table is the person's word; what it points at is read off the command, and the pointing neither lifts a command nor holds it down; the words cited for it are the words that do the standing-for.

### A.5 How it counts

**The sixth Question level is part of the sixth level of the scale.** The sixth level is not credited from single tasks. Consecutive, non-overlapping batches of closed tasks are read for two habits: whether the person varies how much the person specifies according to what the model is likely to know already (L6 Myth, §3), and whether the person chooses what to put to the model and what to keep off it (the sixth Question level above). Each habit is counted on its own, and a batch that cannot show a habit either way counts for neither side. A batch shows the first habit only when at least one quotation of the person's own words offered for it (the reading asks for the coarse case and the detailed one) is found in what the person wrote, ignoring case and spacing; a showing with none found counts for neither side. The second habit carries no quotation, because part of what it looks for is something not done. The defaults are batches of ten closed tasks, with a habit shown by at least three batches that can speak to it, at least 70% of which show it. Once shown, a habit stays shown until its rate falls below 60%, and the sixth level goes with it. The sixth level is held only when both habits are shown and the fifth level is held; no command in any situation is placed above the fifth level.

**Question levels 1 to 5 count toward the levels of the scale.** Question level n counts toward level Ln, for n from 1 to 5, exactly as the other three situations do: a level from L1 to L5 is not held unless this situation has been made good at the Question level of the same number. An implementation arranges practice in this situation as it does in the other three (§8), including for people who rarely ask; a situation counted toward a level and never practised would fail people on something they were never given an occasion to do. An implementation that brings a conferring situation in after it has begun assessing people states the date from which that situation counts, the same date for everyone it assesses, where it states its threshold values (§5.3). Placements recorded before that date count after it; nothing is read again. A level lost because a situation begins to count is published as a reduction caused by that admission, which it states in place of an error in an earlier reading (§4; Appendix B.4).

## B. Appendix B · The Command Scale (normative)

The normative text of The Command Scale (TCS), version 1.0, is this appendix together with three sections of the body it relies on: §4 (how a level is read), §5 (crediting a level, including the thresholds in §5.3) and §9 (assessing minors). The rest of the paper is explanation. Every section reference below, and in Appendix A, is to this paper; an implementation citing the scale cites these parts together (B.6).

*Normative text · Version 1.0 · Pre-publication draft · Published by Mentor by farsurf (mentor.farsurf.com) · CC BY 4.0*

### B.1 Scope

The scale measures a person, not a model and not a project. It is defined so that the same reading can be taken in software, writing, teaching, design or operations. It says nothing about how difficult a task was, how large it was, how original it was, or how many words were used.

### B.2 Definitions

**Determination.**

A decision is determined by the person when stating its opposite would still describe the thing the person asked for. Anything a competent builder would supply unprompted on hearing the name was not determined by the person.

**Convention.**

Whatever the model supplies in the absence of determination: the ordinary form of a thing of that name.

**Situation.**

One of the occasions in which a level is demonstrated: **Request** (stating what should become true), **Review** (stating what is true of what came back), **Roadblock** (stating that progress has stopped), **Question** (asking to be told something not yet held).

**Conferring.**

A situation confers a level when it is counted toward one. Request, Review, Roadblock and Question confer. Question is read on a ladder of its own and its levels 1 to 5 confer as the other three do; its sixth level is part of the sixth level of the scale, which is held only together with the top of that ladder. An implementation that brings a conferring situation in after it has begun assessing states the date from which it counts, as Appendix A.5 requires. Its levels, the rules for placing it and the rule for its admission are in Appendix A of this paper. Any change to this is a change to this appendix and appears in B.7.

**Held.**

A level from L1 to L5 is held when it is demonstrated in every conferring situation; L6 Myth is held as stated in Appendix A.5 of this paper. Demonstration in one situation is recorded but does not confer the level.

### B.3 The levels

#### L1 Note

Names the thing.

- **Determines** — Which thing it is.
- **Convention supplies** — Contents, form, behaviour, persistence, composition.
- **Result** — The ordinary version: equivalent to what any other person asking in the same terms receives.
- **Not this level** — Naming something more elaborate. The more a name implies, the more of the result is reproduced from convention.

#### L2 Verse

Determines composition and presentation.

- **Determines** — What the thing contains, what it is called, its quantity, wording, appearance, or resemblance to an existing thing.
- **Convention supplies** — Behaviour.
- **Result** — Identifiably the person's in form; conventional in behaviour.
- **Not this level** — Describing the intended end state without determining what produces it.

#### L3 Canon

Determines behaviour.

- **Determines** — What happens under which conditions, what constitutes completion, what constitutes failure, what is prohibited.
- **Convention supplies** — Persistence, ownership, access, composition.
- **Result** — Performs as intended, and continues to as conditions vary.
- **Not this level** — A single rule attached to an otherwise undetermined request. Size is not the measure.

#### L4 Chronicle

Determines persistence, ownership and access.

- **Determines** — What survives the session that produced it, what resets and when, to whom each thing belongs, who may see it.
- **Convention supplies** — Composition.
- **Result** — Usable by people other than the maker, holding each user's own material, correctly separated.
- **Remark** — The transition from L3 Canon requires reasoning about state that is not visible to the person, and distinguishing what is stored from what is displayed. Measured on real records, it is the largest single transition on the scale.

#### L5 Saga

Determines composition.

- **Determines** — The named parts of a project that cannot be completed in one pass, and what each part hands to the next.
- **Convention supplies** — Depth of specification.
- **Result** — A project larger than one pass that integrates, and in which one part can be replaced without disturbing the others.
- **Not this level** — Requesting several things at once. What qualifies is that something passes between the parts.

#### L6 Myth

Determines how much to determine.

- **Determines** — Where the model's competence ends, and therefore where to speak coarsely and where to decompose. Minimal command on familiar ground; decomposition into known primitives where nothing exists yet; termination of decomposition at recognised granularity.
- **Convention supplies** — Everything on familiar ground, deliberately.
- **Result** — A project without precedent. The primitives are the model's; the arrangement is the person's, and the arrangement is the novel part.
- **Remark** — L6 Myth is not more specification. On familiar ground a command at L6 Myth is as short as one at L1 Note; the difference is that the brevity is chosen rather than inherited. Two opposite failures are excluded at this level: uniform decomposition, which forfeits the advantage, and uniform brevity, which cannot produce what has no precedent.
- **Ceiling** — Reachable results are bounded by what the person can decompose. Where the missing part cannot be reduced to known primitives, it is not reachable at L6 Myth either.

### B.4 Revision

Levels may be reduced. A reduction is published as a change of reading, states what the earlier reading got wrong, that it follows from the admission of Question, or that a rate fell below the withdrawal line (§5.3; Appendix A.5), and is subject to challenge by the assessed party or that party's guardian. Nothing in this scale certifies a person; no certificate is issued.

### B.5 Use

This scale may be used, quoted, taught and implemented by anyone, with attribution, under CC BY 4.0. It may be used to assess without any product of the publisher's. The thresholds in §5.3 are defaults and may be changed by an implementation that states its values and preserves the three properties given there. The situations in B.2 are fixed for a given version of this appendix and an implementation states the version it is against; implementations that alter the situations of the version claimed, or drop the citation requirement in §5.2, are not implementations of this scale.

### B.6 Citation

> Mentor by farsurf (mentor.farsurf.com). *The Command Scale: a scale of what a person can get an artificial intelligence to produce.* Version 1.0, pre-publication draft. L1 Note · L2 Verse · L3 Canon · L4 Chronicle · L5 Saga · L6 Myth.

### B.7 Revision history

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | — | First publication, not yet released. Four situations, all four counting toward a level: Request, Review, Roadblock and **Question**; the levels of Question are in Appendix A of this paper. |

Cite this paper as: Mentor by farsurf (mentor.farsurf.com). *Measuring what a person can get an AI to build.* White paper, version 1.0, pre-publication draft.
