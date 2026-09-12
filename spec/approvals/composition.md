# Approval Composition

## Status

**Draft**

## Purpose

This document defines bounded Draft 0.3 Approval composition for reusable groups,
quorum decisions, ordered stages, and limited nesting. It extends
[Approval Chains](chains.md) without defining delegation, escalation,
authorization, task routing, notifications, persistence, or an unrestricted graph
engine.

## Terminology

An Approval Composition is an evaluation definition made from Approval
Requirements, Approval Groups, and optionally ordered Approval Stages.

An Approval Group is a bounded set of members combined by one of these group
kinds:

- `ALL_OF`
- `ANY_OF`
- `N_OF_M`

A group member is either a declared Approval Requirement reference or a declared
child Approval Group reference, subject to the quorum-specific restriction below.
An `N_OF_M` member references an Approval Requirement and explicitly names one
voter Actor identity. Each declared voter occurs once within that quorum group;
its applicable members therefore represent distinct potential voters. A currently
effective Decision can contribute only to the member declaring its Actor and
referencing its Requirement. Declaring a voter does not establish eligibility.

`ALL_OF` and `ANY_OF` may contain child quorum groups. A quorum group cannot
itself contain child groups as voting members.

## Requirements

- **APPROVAL-COMPOSITION-001** — An Approval Composition MUST declare exactly one root Approval Group or one nonempty ordered list of Approval Stages. Each Stage MUST declare one or more root Approval Group references, and each reference MUST resolve to exactly one declared Approval Group.
- **APPROVAL-COMPOSITION-002** — Every Approval Group MUST have a stable identifier that is unique within the Approval Composition.
- **APPROVAL-COMPOSITION-003** — Every Approval Group MUST declare exactly one group kind: `ALL_OF`, `ANY_OF`, or `N_OF_M`.
- **APPROVAL-COMPOSITION-004** — Every Approval Group MUST contain one or more declared members, and every member reference MUST resolve to exactly one declared Approval Requirement or child Approval Group, subject to the `N_OF_M` member restriction in APPROVAL-QUORUM-007.
- **APPROVAL-COMPOSITION-005** — An Approval Group MUST NOT contain the same member identifier more than once within that group.
- **APPROVAL-COMPOSITION-006** — An Approval Group MUST NOT create a cycle through child group references.
- **APPROVAL-COMPOSITION-007** — Nested Approval Group evaluation MUST be bounded to a maximum depth of four groups on every root-to-child path. The standalone root group, or each group directly referenced by a Stage, MUST count as depth one; each child group MUST increase depth by one. Stage and stage-list containers MUST NOT count as group levels.
- **APPROVAL-COMPOSITION-008** — Composition evaluation MUST be deterministic from the composition definition, declared member order, current-effective Approval Requirement or Decision observations, and explicit evaluation context.
- **APPROVAL-COMPOSITION-009** — A declared Requirement member with unresolved applicability MUST fail composition evaluation with `FINKORE_APPROVAL_CONDITION_UNRESOLVED`; it MUST NOT be treated as approved, rejected, pending, or not applicable.
- **APPROVAL-COMPOSITION-010** — A required member with missing or malformed current state or effectiveness evidence MUST fail composition evaluation with `FINKORE_APPROVAL_INVALID_CHAIN`; it MUST NOT be silently inferred. Missing or malformed required evaluation context instead MUST use `FINKORE_APPROVAL_INVALID_CONTEXT` as defined by Approval Validity. When failures coexist, the returned code MUST follow APPROVAL-ERROR-010.
- **APPROVAL-COMPOSITION-011** — A member explicitly evaluated as not applicable MUST be omitted from its containing group's outcome evaluation and MUST NOT contribute an approval, rejection, or pending blocker. This includes a child Approval Group with no applicable members after explicit applicability evaluation; the omission MUST propagate through nested groups.
- **APPROVAL-COMPOSITION-012** — A structurally valid Approval Group with no applicable members after explicit applicability evaluation MUST evaluate as `APPROVED`, meaning it imposes no current approval obligation. When it is a child group, its containing group MUST treat it as not applicable under APPROVAL-COMPOSITION-011, not as an approving member.
- **APPROVAL-COMPOSITION-013** — An `ALL_OF` group with at least one applicable member MUST evaluate as `APPROVED` only when every applicable member is approved; it MUST evaluate as `REJECTED` when any applicable member is rejected; otherwise it MUST evaluate as `PENDING`.
- **APPROVAL-COMPOSITION-014** — An `ANY_OF` group with at least one applicable member MUST evaluate as `APPROVED` when at least one applicable member is approved; it MUST evaluate as `REJECTED` only when every applicable member is rejected; otherwise it MUST evaluate as `PENDING`.
- **APPROVAL-COMPOSITION-015** — A `PENDING` member or voter MUST NOT be interpreted as an abstention, rejection, or approval.
- **APPROVAL-COMPOSITION-016** — An ordered Approval Stage list MUST evaluate stages in declared order and MUST NOT make a later stage actionable before every earlier stage is approved.
- **APPROVAL-COMPOSITION-017** — Groups declared within the same Approval Stage are parallel for composition purposes: their order determines deterministic observation order only, not prerequisite ordering.
- **APPROVAL-COMPOSITION-018** — A staged composition MUST evaluate as `APPROVED` only when every stage is approved, `REJECTED` when the first non-approved stage is rejected, and `PENDING` when the first non-approved stage is pending.
- **APPROVAL-COMPOSITION-019** — A pending staged composition MUST report all and only the pending, applicable Requirements reachable through exclusively pending groups in its first pending stage. It MUST visit that stage's root groups in declared order and recursively visit each pending group's members in declared order, reporting each Requirement identifier once at its first eligible occurrence. It MUST exclude later stages and approved, rejected, or entirely inapplicable group branches. An approved or rejected composition MUST report no actionable Requirements.
- **APPROVAL-COMPOSITION-020** — Composition state observations MUST NOT be treated as proof of which Approval Decision satisfied a Requirement or which subject facts were bound to that Decision.
- **APPROVAL-COMPOSITION-021** — Composition evaluation MUST reuse Draft 0.2 current-effectiveness semantics for withdrawn, expired, superseded, stale-fact, stale-revision, and ineligible Decisions.
- **APPROVAL-COMPOSITION-022** — A structurally valid Approval Composition with no applicable Approval Requirements after explicit applicability evaluation MUST return `APPROVED`, meaning no approval is currently required. That outcome MUST NOT create or imply an approving Decision; it MUST remain distinguishable from evidence that a voter approved.
- **APPROVAL-COMPOSITION-023** — An Approval Stage MUST omit entirely inapplicable groups from its outcome evaluation. With at least one applicable group, the stage MUST evaluate as `APPROVED` when every applicable group is approved, `REJECTED` when any applicable group is rejected, and `PENDING` otherwise. A structurally valid stage with no applicable groups MUST evaluate as `APPROVED`, meaning it imposes no current approval obligation and does not itself block progression to a later stage.
- **APPROVAL-COMPOSITION-024** — Composition evaluation MUST validate the entire composition definition, applicability of every declared Requirement member, and all required current-state and effectiveness evidence before returning an outcome. This MUST include later stages and all alternative branches, even when their outcome would not change the aggregate result. An otherwise decisive approval, rejection, pending state, or no-obligation result MUST NOT suppress a required validation failure. Validation of a later stage MUST NOT make it actionable.
- **APPROVAL-QUORUM-001** — An `N_OF_M` group MUST declare a positive integer threshold `N`, and `N` MUST be less than or equal to the number of distinct declared voting members `M`, counted before applicability evaluation. Evaluation MUST NOT lower or otherwise change `N` when fewer members apply.
- **APPROVAL-QUORUM-002** — A quorum approval count MUST include only distinct declared voter identities from currently effective approving Decisions that identify the member's referenced Requirement and declared voter Actor; each deciding Actor MUST also be eligible for that Requirement.
- **APPROVAL-QUORUM-003** — A voter identity MUST contribute at most one approval to the same quorum group, even if multiple effective approving Decisions by that voter are present.
- **APPROVAL-QUORUM-004** — Withdrawn, expired, superseded, stale-fact, stale-revision, ineligible, malformed, and rejected Decisions MUST NOT increase a quorum approval count.
- **APPROVAL-QUORUM-005** — An `N_OF_M` group MUST evaluate as `APPROVED` when the distinct effective approval count is greater than or equal to `N`.
- **APPROVAL-QUORUM-006** — An `N_OF_M` group with at least one explicitly applicable voting member whose threshold is not met MUST evaluate as `REJECTED` when the number of distinct effective approvals plus remaining pending applicable voting members is less than the declared `N`; otherwise it MUST evaluate as `PENDING`.
- **APPROVAL-QUORUM-007** — Each `N_OF_M` member MUST reference an Approval Requirement and MUST explicitly declare exactly one voter Actor identity; it MUST NOT reference a child Approval Group or leave voter identity to be inferred from subsequent Decisions, a role, or a group.
- **APPROVAL-QUORUM-008** — An `N_OF_M` group MUST NOT declare the same voter Actor identity in more than one member, even when those members reference different Requirements. This definition constraint applies before applicability evaluation.
- **APPROVAL-QUORUM-009** — For an applicable quorum member, currently effective eligible Decisions by its declared voter for its referenced Requirement and current subject context MUST NOT include both satisfying and rejecting outcomes under that Requirement's outcome mapping. Such opposing evidence MUST fail composition evaluation with `FINKORE_APPROVAL_INVALID_CHAIN` in the state/effectiveness evidence category of APPROVAL-ERROR-010. Evaluation MUST NOT resolve the conflict by Decision order, timestamp order, or an implicit preference for approval or rejection; only explicit lifecycle or current-effectiveness evidence may remove it. Repeated effective Decisions with the same mapped outcome MUST NOT by themselves constitute conflicting evidence.
- **APPROVAL-QUORUM-010** — Each applicable quorum member's state MUST be determined only from currently effective eligible Decisions matching its declared voter, referenced Requirement, and current subject context, using the Requirement's declared outcome mapping. After required validation, at least one satisfying Decision with no rejecting Decision MUST give that member `APPROVED`; at least one rejecting Decision with no satisfying Decision MUST give it `REJECTED`; no effective matching Decision MUST give it `PENDING`. Quorum capacity and actionable-member selection MUST use this member-specific state; another Actor's Decision or an aggregate Requirement observation MUST NOT replace it.

## Quorum Member Evidence

The member state in APPROVAL-QUORUM-010 is an observation for this composition,
not a mutation of the referenced Requirement. A Requirement may admit several
eligible Actors while a quorum member names only one. An effective rejection by
Bob cannot reject Alice's member, just as Bob's approval cannot supply her vote.
In that case Alice remains pending if she has no effective matching Decision.
If the same Requirement is referenced through another declared voter elsewhere,
that occurrence uses its own matching evidence. Actionable Requirement reporting
still deduplicates identifiers at their first eligible occurrence under
APPROVAL-COMPOSITION-019; it does not assign voters or authorize an action.

Opposing effective Decisions from the same member's voter are invalid evidence,
even if other voters already meet N or an alternative group already approves.
Complete validation and error priority still apply. A withdrawn, expired,
superseded, stale, or otherwise ineffective Decision does not create an effective
conflict, but remains in history. Duplicate effective approvals supply one vote;
duplicate effective rejections produce one rejected member, not extra votes.
No Decision is implicitly withdrawn, superseded, or selected by its timestamp.

This rule governs Draft 0.3 quorum evaluation; it does not redefine a standalone
Draft 0.2 Requirement or Approval Chain evaluator.

## Threshold Validation and Evaluation

`M` is the size of the declared electorate, not its currently applicable subset.
For example, a two-of-three definition remains structurally valid when only one
of its three members applies. Its threshold remains two. With one applicable
voter it evaluates as `REJECTED`, even if that voter approves, because two
approvals are unreachable from the current applicable membership.

A `REJECTED` quorum is an aggregate evaluation outcome; it does not invent a
rejected Decision or change any member's evidence. A pending member remains
pending even when the overall quorum cannot reach its threshold. Evaluation uses
current evidence and does not predict future applicability changes.

When all members are explicitly inapplicable, APPROVAL-COMPOSITION-012 applies:
the quorum imposes no current obligation, and its standalone group outcome is
`APPROVED`. If nested, it contributes no member outcome to its parent. The declared
threshold remains unchanged; no votes are inferred and N is not reduced to zero.

## Entirely Inapplicable Groups

Applicability is separate from approval evidence. A group whose members are all
explicitly inapplicable imposes no obligation. Such a child is omitted before its
parent combines applicable member outcomes. If this leaves the parent with no
applicable members, the same rule applies recursively.

For example, `ANY_OF(inapplicable-group, pending-review)` remains `PENDING`, and
`ANY_OF(inapplicable-group, rejected-review)` is `REJECTED`. The inapplicable
branch cannot satisfy either parent. A structurally valid composition in which
all Requirements are explicitly inapplicable returns `APPROVED`, signifying no
current approval obligation rather than any approving Decision.

A group with zero declared members is still structurally invalid under
APPROVAL-COMPOSITION-004. Explicitly inapplicable members are different from
missing applicability facts or missing required state evidence; neither kind of
missing evidence establishes an exemption. Existing error rules still apply.

## Stage Structure and Depth

A staged composition declares at least one stage, and every stage declares at
least one root group. A single Requirement can occupy a stage through a declared
`ALL_OF` group containing that Requirement. A stage with no declared groups is
invalid; a stage whose declared groups all become explicitly inapplicable remains
valid and follows APPROVAL-COMPOSITION-023.

Count nesting independently from each root group in each stage. Four group
levels are permitted; a fifth is rejected. A stage is a sequencing container,
not an implicit extra group level, and depth is not accumulated across stages.
Requirements are group members, not another group level. The same four-level
limit applies to a standalone root. Reference and cycle constraints still apply.

## Stage Outcomes

Applicable groups in the same stage combine with `ALL_OF` semantics, while
remaining parallel: their declaration order does not create prerequisites
between those groups. Alternatives are expressed inside an explicit `ANY_OF`
group. For example, a stage containing `ANY_OF(manager-review, cfo-review)` and
`finance-review` requires both the any-of group's approval and finance approval.

One rejected applicable group rejects its stage even if another group is pending.
An entirely inapplicable group contributes nothing to the stage. If no groups
apply, the valid stage imposes no current obligation and does not block progress;
it does not imply that any voter approved. Earlier non-approved stages still
block later-stage action under APPROVAL-COMPOSITION-016.

APPROVAL-COMPOSITION-018 continues to determine the overall staged outcome from
the first non-approved stage. A pending earlier stage and a rejected later stage
therefore give a `PENDING` staged outcome when the input observations are valid.
All required later-stage evidence is validated under APPROVAL-COMPOSITION-024.
Selection of a portable error when multiple validation failures coexist follows
APPROVAL-ERROR-010 in [Approval Errors](errors.md).

## Actionable Requirements

For a pending staged composition, select its first pending stage and descend
only through groups whose current outcome is PENDING. Report each pending,
applicable Requirement once, at its first eligible occurrence in recursive
declared order. An earlier occurrence inside an approved or rejected branch is
not eligible and does not suppress a later eligible occurrence. This is a
reporting order, not a prerequisite ordering between parallel groups.

For a stage containing `ANY_OF(A, B)` and a group containing `C`, if A is approved
and B and C are pending, only C is actionable. If A and B are both pending and
the any-of group is pending, both are available alternatives. A pending quorum
can likewise expose more candidates than the number of additional votes needed;
the list does not mean every candidate must approve. Group outcome rules still
determine satisfaction.

A rejected group can contain pending leaves, but that branch contributes no
current actionable Requirements. Approved, rejected, and entirely inapplicable
compositions report none. Actionability is an observation of current approval
obligations, not authorization, assignment, or permission to bypass eligibility.
Complete validation still applies before this report is returned.

## Complete Validation

Before any composition outcome is returned, validate all declared structure and
required observations, including later stages and alternative branches that would
otherwise be unnecessary to the result. An approved ANY_OF branch cannot hide
unresolved applicability or missing required state in another branch. Likewise,
a pending or rejected early stage cannot hide a malformed later-stage group.

Complete validation is an observable guarantee, not a required implementation
architecture or an obligation to collect all errors. An evaluator may stop and
return a validation error; it cannot stop checking required inputs and return an
outcome merely because that outcome seems determined. The error returned must
respect the category priority in APPROVAL-ERROR-010 even when validation can stop
before collecting every defect.

An explicit valid PENDING observation is different from missing required state.
An applicable Requirement with no effective Decision legitimately remains PENDING;
validation must not fabricate a Decision merely to supply evidence. Explicit
inapplicability removes the approval obligation, not structural validity or the
need to establish applicability. It does not require an approving Decision.

Validation observes current input; it does not activate future stages, request
votes, mutate history, or resolve missing facts through ambient lookup. The
current stage's actionability is determined separately by the stage rules.

## Invariants

Approval Composition is an observation over Approval Requirements and current
effective Approval Decision evidence. It does not create Approval Decisions,
authorize Actors, resolve dynamic approvers, or mutate Approval history.

Composition must not count ineffective evidence. A historical Approval Decision
can remain committed while contributing nothing to a current group, quorum, or
stage because its facts changed, its subject revision changed, it expired, it
was withdrawn, it was superseded, or its Requirement was superseded.

## Examples

```text
ALL_OF(manager-review, finance-review)
ANY_OF(finance-manager-review, cfo-review)
N_OF_M(2, board-member-a, board-member-b, board-member-c)
DECLARED STAGE GROUPS:
  manager-group = ALL_OF(manager-review)
  finance-options = ANY_OF(controller-review, finance-review)
  cfo-group = ALL_OF(cfo-review)
STAGES:
  1. manager-group
  2. finance-options
  3. cfo-group
```

For the quorum example, `board-member-a`, `board-member-b`, and `board-member-c`
reference Requirements and declare distinct voters Alice, Bob, and Carol,
respectively. Effective eligible approvals from Alice and Bob supply two votes.
Repeated approving Decisions from Alice supply at most one vote. A Decision by
another Actor cannot contribute to Alice's member even if that Actor is eligible
for the referenced Requirement.

`ALL_OF(finance-review, board-quorum)` can combine a finance Requirement with
that quorum. `N_OF_M(2, finance-group, board-group)` is invalid because child
Group outcomes are not voting members.

The examples are illustrative. They do not define a production serialization.

## Invalid Examples

- Counting one Actor twice toward the same quorum.
- Accepting opposing effective votes from one declared voter by taking the latest
  timestamp, the first encountered Decision, approval, or rejection.
- Treating another eligible Actor's rejection as the named voter's rejection.
- Hiding conflicting effective votes because another branch already approves.
- Declaring Alice as the voter for two members of one quorum, even if one member
  later evaluates as not applicable.
- Declaring a quorum member as “anyone from Finance” without one explicit voter.
- Counting a child group as a quorum vote.
- Lowering a two-of-three threshold to one because only one member applies.
- Rejecting a valid declared quorum definition as malformed solely because
  fewer members currently apply than its threshold.
- Treating a withdrawn or expired Decision as a current approval.
- Making the CFO stage actionable before the manager stage is approved.
- Accepting a nested group cycle.
- Treating a missing member state as `PENDING` or `NOT_APPLICABLE`.
- Using an entirely inapplicable child as the approving branch of `ANY_OF`.
- Approving a stage because one parallel group approved while another applicable
  group remains pending or rejected.
- Requiring an approving Decision for an entirely inapplicable stage.
- Recording an approving Decision because a composition has no applicable
  requirements.
- Treating an empty declaration as a valid all-inapplicable group.
- Declaring an empty stage list or a stage without declared root groups.
- Returning APPROVED from ANY_OF before checking another branch's required state
  or applicability.
- Returning PENDING because an early stage is pending while a later stage has a
  validation failure.
- Making a later stage actionable solely because its evidence was validated.
- Reporting a pending leaf inside an already approved or rejected group as
  actionable through that branch.
- Reporting the same actionable Requirement twice or sorting identifiers instead
  of preserving recursive declared order.
- Treating all reported ANY_OF alternatives as mandatory approvals.
- Accepting five nested groups beneath a stage because only child levels were
  counted, or rejecting four because the stage container was counted as a group.

## Errors

Invalid group shape, an empty stage list or stage without declared groups,
invalid threshold shape, missing or conflicting required member evidence, duplicate
members or quorum voter identities, quorum members without exactly one explicit
voter or referencing child groups, unresolved references, cycles, and excessive nesting use
`FINKORE_APPROVAL_INVALID_CHAIN`.

A structurally valid quorum with at least one applicable member whose threshold
is unreachable evaluates as `REJECTED`; reduced applicability alone is not an
invalid-threshold error. A non-positive or non-integer `N`, or `N` greater than
the declared `M`, is an invalid definition using `FINKORE_APPROVAL_INVALID_CHAIN`.

Unresolved applicability uses `FINKORE_APPROVAL_CONDITION_UNRESOLVED`. Missing
or malformed required current-effectiveness context uses
`FINKORE_APPROVAL_INVALID_CONTEXT`, including a missing evaluation instant for
an expiring Decision. Coexisting failures follow APPROVAL-ERROR-010: structure,
applicability, required context, then required state/effectiveness evidence.

A domain action blocked by a pending or rejected required composition uses
`FINKORE_APPROVAL_REQUIRED` unless a composing domain defines a more specific
already-specified failure.

## Non-Goals

This document does not define delegation, escalation, IAM/RBAC, authorization,
actor-directory lookup, dynamic approver resolution, notification or inbox
behavior, persistence, workflow migration, arbitrary graph traversal, executable
callbacks, or a portable condition expression language.
