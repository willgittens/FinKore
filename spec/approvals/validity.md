# Approval Validity

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines current-effectiveness semantics for Approval Decisions.
Core 2.0 uses explicit withdrawal, expiration, and supersession evidence plus
scoped identity references while preserving append-only Approval history.

## Requirements

- **APPROVAL-VALIDITY-001** — Current Approval effectiveness MUST be derived from committed Approval Decisions, committed lifecycle events, current subject facts or subject revision context when supplied, and an explicit evaluation context.
- **APPROVAL-VALIDITY-002** — A historical Approval Decision MUST remain in logical history even when it is no longer currently effective.
- **APPROVAL-VALIDITY-003** — A Decision that no longer matches caller-declared relevant subject facts or subject revision context MUST NOT satisfy or reject a Requirement for current evaluation.
- **APPROVAL-VALIDITY-004** — A lifecycle event that withdraws a Decision MUST make only the identified Decision ineffective for current evaluation and MUST NOT remove or rewrite the withdrawn Decision.
- **APPROVAL-VALIDITY-005** — Withdrawal requests MUST identify exactly one committed Decision and MUST be rejected when the target is missing, ambiguous, already withdrawn, or already superseded.
- **APPROVAL-VALIDITY-006** — Withdrawal does not define authorization, delegation, or RBAC; when an implementation validates the withdrawal Actor against the affected Requirement, eligibility MUST be evaluated using the Requirement's declared eligibility boundary.
- **APPROVAL-VALIDITY-007** — A Decision with an expiration instant MUST be evaluated only with an explicit evaluation instant; implementations MUST NOT use wall-clock time, host timezone, or ambient locale to decide expiration.
- **APPROVAL-VALIDITY-008** — Expiration instants and evaluation instants MUST identify unambiguous instants using the portable timestamp convention.
- **APPROVAL-VALIDITY-009** — A Decision is expired when the evaluation instant is equal to or later than the Decision's expiration instant. Equivalent offsets MUST compare by instant, not by lexical representation.
- **APPROVAL-VALIDITY-010** — A lifecycle event that supersedes a Decision MUST make the superseded Decision ineffective for current evaluation while preserving both historical Decisions and the supersession observation.
- **APPROVAL-VALIDITY-011** — A lifecycle event that supersedes a Requirement MUST make Decisions for the superseded Requirement ineffective for current evaluation of that superseded Requirement; it MUST NOT make those Decisions satisfy the successor Requirement.
- **APPROVAL-VALIDITY-012** — Failed lifecycle operations and failed current-effectiveness evaluations MUST leave committed Decisions and lifecycle events unchanged.

- **APPROVAL-VALIDITY-013** — Before returning a concrete Requirement evaluation outcome, an implementation MUST validate required expiration context for every currently considered Decision, independently of Decision order or a decisive outcome. For this purpose, a currently considered Decision identifies the evaluated Requirement and is not excluded by committed withdrawal, Decision supersession, or Requirement supersession. Fact/revision staleness MUST NOT waive required expiration context for these Decisions. A structurally valid Decision for another Requirement in the same context and subject scope, or a lifecycle-excluded Decision, MUST NOT require an evaluation instant solely because it has an expiration. A foreign-context or foreign-subject Decision is invalid scoped evidence under **APPROVAL-DECISION-013**, not unrelated evidence that can be excluded. All supplied Decision and lifecycle structure MUST still be validated, including excluded evidence. Missing or malformed required context MUST use `FINKORE_APPROVAL_INVALID_CONTEXT`. This rule does not define a total priority among unrelated concrete Approval failures.
- **APPROVAL-VALIDITY-014** — Before record, lifecycle mutation, or current-effectiveness evaluation reuses supplied committed lifecycle history, the implementation MUST validate supported discriminators, required field structure, the single context-and-subject scope defined by **APPROVAL-DECISION-013**, and relationships in the history's declared local event order against committed Decisions and earlier lifecycle events. Decision withdrawal targets and Decision supersession targets/successors MUST resolve uniquely within that scope; supersession target and successor MUST be distinct. A withdrawal or Decision supersession target MUST NOT already be withdrawn or superseded. Requirement supersession target and successor references MUST remain in that same context and exact subject, their Requirement identifiers MUST be distinct, and a Requirement MUST NOT be superseded twice. Invalid evidence MUST use `FINKORE_APPROVAL_INVALID_DECISION` without changing either history. Requirement references MUST remain opaque; this rule MUST NOT require an absent Requirement registry or infer event order from timestamps.
- **APPROVAL-VALIDITY-015** — Before successfully recording a Decision, an implementation MUST validate retained lifecycle relationships against the complete proposed resulting Decision history under APPROVAL-VALIDITY-014. The candidate MUST match its supplied Requirement exactly under **APPROVAL-DECISION-013**, while retained Decisions for other Requirements MAY remain only when they share that Requirement's context and exact subject. The new Decision MUST NOT duplicate a Decision identity anywhere in that context, make a retained withdrawal target or Decision supersession target or successor ambiguous, or otherwise invalidate a required historical relationship. Such a record request MUST fail with `FINKORE_APPROVAL_INVALID_DECISION` and MUST preserve both input histories without exposing a partial append. Equal Decision reference tuples alone MUST NOT be rejected by this rule when they invalidate no retained relationship.
- **APPROVAL-VALIDITY-016** — A concrete Decision or Decision-history input MUST NOT accept a caller-supplied `effective` member as current-effectiveness evidence. Current effectiveness MUST be derived under APPROVAL-VALIDITY-001 from the governing Decision, lifecycle, fact or revision, eligibility, expiration, and explicit-context evidence. Any supplied `effective` member at a concrete boundary, including Boolean `true` or `false`, MUST use `FINKORE_APPROVAL_INVALID_DECISION` and MUST leave committed Decision and lifecycle history unchanged. This prohibition does not apply to Approval Composition's separately documented lightweight current-effectiveness observation fixture.
- **APPROVAL-VALIDITY-017** — In the stronger bounded lifecycle contract, a Decision withdrawal or supersession reference MUST identify a committed Decision by a `decisionRef` containing its nonempty `contextId` and `decisionId`; Decision supersession MUST separately identify the successor by `successorDecisionRef`. Decision references MUST use the one history context and resolve exactly once within it. When a withdrawal boundary supplies the affected Requirement, that Requirement MUST match the target Decision's scoped Requirement association exactly. Requirement supersession MUST use scoped `requirementRef` and `successorRequirementRef` values with the same history context and exact subject, distinct nonempty Requirement identities, and no inference from a registry. Decision-supersession target and successor MAY identify different Requirements within that scope; no approval transfers between them. A missing, malformed, foreign-context, foreign-subject, unresolved, duplicate-identity, already withdrawn, or already superseded reference MUST use `FINKORE_APPROVAL_INVALID_DECISION` and preserve both histories. Lifecycle identity MUST NOT fall back to facts, bare Requirement identifiers, Actor/timestamp tuples, timestamp order, or first-match selection.

## Invariants

APPROVAL-VALIDITY-015 covers the proposed result, whereas
APPROVAL-VALIDITY-014 validates supplied evidence before reuse. Successful
recording preserves earlier Decisions and lifecycle events and appends exactly
the accepted Decision, yielding history reusable by subsequent operations.
Under the Core 1.x tuple contract, reference equality used
SPEC-TIMESTAMP-005's exact instant, including equivalent offset spellings. The
stronger bounded contract instead uses scoped identities under
**APPROVAL-VALIDITY-017** while retained timestamps keep their spelling under
SPEC-TIMESTAMP-006. Decision identity remains context-scoped; there is no global
Decision uniqueness rule or new registry.

Current-effectiveness is an observation over append-only evidence. A Decision
can be historically committed and still be ineffective for current evaluation
because relevant facts changed, the subject revision changed, the Decision was
withdrawn, the Decision expired, the Decision was superseded, or the Requirement
it addressed was superseded.

Accordingly, concrete history cannot use an asserted `effective` flag to bypass
or preempt eligibility, lifecycle, fact/revision, expiration, or context
evaluation. Composition accepts such a Boolean only because its lightweight
fixture consumes an already-derived observation rather than concrete history.

Expiration is deterministic. If any currently considered Decision has an
expiration instant, the evaluation context must include an explicit evaluation
instant. At the exact expiration instant the Decision is no longer effective.
Comparison uses every accepted fractional digit in the portable timestamp
profile; an implementation must not reduce the comparison to milliseconds or
microseconds.

Lifecycle events are relationships over existing Approval evidence. They do not
delete historical Decisions, create new Decisions, or define authorization
policy.

Lifecycle relationships and current-effectiveness evaluation operate within
the approval context and subject association that owns the Decision history.
Legacy Core 1.x history whose individual records do not carry scope must remain
bound to one immutable external context and subject through import and explicit
migration. Core 2.0 records carry scoped Requirement and Decision identities; a
caller-supplied label cannot rebind either legacy or migrated history. A
detected mismatch is invalid Decision evidence and preserves both Decision and
lifecycle histories.

### Lifecycle operation scope

The bounded lifecycle operations apply the same immutable history population;
they do not create separate collections for each Requirement:

| Boundary | Scope and selection |
| --- | --- |
| Record | The candidate matches the supplied Requirement exactly. The retained history and lifecycle remain in that Requirement's context and subject but may include other Requirement identities. |
| Withdrawal | The supplied Requirement matches the uniquely resolved target Decision. Other Decisions and lifecycle events in the same history scope remain unchanged. |
| Decision supersession | Target and successor resolve uniquely within one context-and-subject history. They may identify different Requirements, but the relationship does not transfer approval between Requirements. |
| Requirement supersession | Target and successor Requirement references share the history context and exact subject while using distinct Requirement identities. Existing Decisions stay associated with their original Requirements. |
| Evaluation or other reuse | Every Decision and lifecycle event is structurally and relationally validated before Requirement selection or current-effectiveness exclusion. Import or storage reuse cannot merge or relabel scopes. |

This table describes the existing record, lifecycle, and evaluation boundaries;
it does not add an import operation, Requirement registry, or production request
envelope. Empty Decision history does not invent a scope: a supplied concrete
Requirement or scoped Requirement-supersession references provide it where the
operation otherwise permits an empty history.

Recording another Decision preserves the committed lifecycle evidence used by
**APPROVAL-VALIDITY-001**, including withdrawals and Decision or Requirement
supersessions. Returning the Decision list while dropping that evidence can
make an ineffective historical Decision effective again and violates the
existing current-effectiveness rules. A later Decision is evaluated against
its own Requirement and facts; withdrawal of an earlier Decision does not
prohibit a later, independently effective Decision.

An operation explicitly requesting withdrawal has withdrawal meaning under
**APPROVAL-VALIDITY-004**. Caller-supplied ancillary members cannot turn a
successful withdrawal into an unknown lifecycle kind or a supersession. The
same principle applies to the explicitly requested supersession operations in
**APPROVAL-VALIDITY-010** and **APPROVAL-VALIDITY-011**. This does not prescribe
a production request envelope. The handling of redundant fixture members is
documented in the [conformance conventions](../../conformance/conventions.md).

The target checks in **APPROVAL-VALIDITY-005** apply to the complete committed
Decision and lifecycle observations. Under the stronger contract, finding a
matching Actor/timestamp tuple or the first apparent match cannot resolve a
`decisionRef`; the scoped Decision identity must resolve exactly once. Prior
supersession is an independent reason a withdrawal target is invalid, even when
there is no prior withdrawal. These failures use
`FINKORE_APPROVAL_INVALID_DECISION` and preserve both histories under
**APPROVAL-VALIDITY-012** and **APPROVAL-ERROR-006**.

## Context and lifecycle validation

The following existing obligations do not depend on a new evaluation policy:

- A required evaluation instant is a portable timestamp, not merely a present
  member. Invalid required context uses `FINKORE_APPROVAL_INVALID_CONTEXT`.
- Returning a decisive outcome cannot hide missing required context for another
  currently considered Decision. Reordering equivalent Decisions cannot make
  the same required context optional.
- Committed lifecycle history has a meaningful discriminator. An unknown kind
  is invalid evidence, not a harmless ancillary request member. A withdrawal
  of a missing or ambiguous Decision cannot become valid merely by importing
  it as history. Record, lifecycle mutation, and Requirement evaluation all
  reuse that history; invalid evidence uses `FINKORE_APPROVAL_INVALID_DECISION`
  and leaves both histories unchanged.

APPROVAL-VALIDITY-013 defines the considered-set/context boundary;
APPROVAL-VALIDITY-014 defines imported lifecycle relationship validation.
The bounded fixture declares local lifecycle order through its array. Core 1.x
tuple references remain historical input requiring migration; the stronger
contract uses the scoped references in **APPROVAL-VALIDITY-017** and does not
accept both forms side by side.

No same-Requirement successor restriction, successor-effectiveness condition,
or general graph/cycle policy is introduced. A successor can later be withdrawn
without rewriting its predecessor's supersession. Requirement identifiers do
not need to resolve through a registry absent from the input. Operation-specific
request kind remains distinct from committed history's discriminator.

## Example

The following JSON is illustrative and non-normative:

```json
{
  "history": [
    {
      "decisionId": "decision-17",
      "requirementId": "finance-review",
      "requirementRef": {
        "contextId": "invoice-42-approval",
        "requirementId": "finance-review",
        "subject": { "type": "invoice", "id": "invoice-42" }
      },
      "subjectFacts": { "revision": "3", "amount": "9000.00" },
      "outcome": "APPROVED",
      "actor": { "type": "user", "id": "user-7" },
      "decidedAt": "2026-09-01T12:00:00Z",
      "expiresAt": "2026-09-08T12:00:00Z"
    }
  ],
  "lifecycle": [
    {
      "type": "WITHDRAWN",
      "decisionRef": {
        "contextId": "invoice-42-approval",
        "decisionId": "decision-17"
      },
      "actor": { "type": "user", "id": "user-7" },
      "recordedAt": "2026-09-02T12:00:00Z"
    }
  ]
}
```

## Invalid Examples

- Counting a withdrawn, expired, superseded, or stale-fact Decision as current approval.
- Removing a withdrawn Decision from history.
- Treating a Decision for a superseded Requirement as satisfying its successor Requirement.
- Using host time to decide whether a Decision has expired.

## Errors

Invalid lifecycle requests must use an applicable [Approval Error](errors.md).
Invalid or missing evaluation context for current-effectiveness evaluation uses
`FINKORE_APPROVAL_INVALID_CONTEXT`.

## Non-Goals

This document does not define delegation, escalation, quorum, complex approval
graphs, authorization/RBAC, actor directory lookup, UI task routing, reminders,
or executable condition logic.
