# Approval Validity

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines Core 0.9 release candidate current-effectiveness semantics for Approval
Decisions. It extends the fact-effectiveness model with explicit
withdrawal, expiration, and supersession evidence while preserving append-only
Approval history.

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

- **APPROVAL-VALIDITY-013** — Before returning a concrete Requirement evaluation outcome, an implementation MUST validate required expiration context for every currently considered Decision, independently of Decision order or a decisive outcome. For this purpose, a currently considered Decision identifies the evaluated Requirement and is not excluded by committed withdrawal, Decision supersession, or Requirement supersession. Fact/revision staleness MUST NOT waive required expiration context for these Decisions. Unrelated or lifecycle-excluded Decisions MUST NOT require an evaluation instant solely because they have an expiration. All supplied Decision and lifecycle structure MUST still be validated, including excluded evidence. Missing or malformed required context MUST use `FINKORE_APPROVAL_INVALID_CONTEXT`. This rule does not define a total priority among unrelated concrete Approval failures.
- **APPROVAL-VALIDITY-014** — Before record, lifecycle mutation, or current-effectiveness evaluation reuses supplied committed lifecycle history, the implementation MUST validate supported discriminators, required field structure, and relationships in the history's declared local event order against committed Decisions and earlier lifecycle events. Decision withdrawal targets and Decision supersession targets/successors MUST resolve uniquely; supersession target and successor MUST be distinct. A withdrawal or Decision supersession target MUST NOT already be withdrawn or superseded. Requirement supersession target and successor identifiers MUST be distinct, and a Requirement MUST NOT be superseded twice. Invalid evidence MUST use `FINKORE_APPROVAL_INVALID_DECISION` without changing either history. Requirement references MUST remain opaque; this rule MUST NOT require an absent Requirement registry or infer event order from timestamps.

## Invariants

Current-effectiveness is an observation over append-only evidence. A Decision
can be historically committed and still be ineffective for current evaluation
because relevant facts changed, the subject revision changed, the Decision was
withdrawn, the Decision expired, the Decision was superseded, or the Requirement
it addressed was superseded.

Expiration is deterministic. If any currently considered Decision has an
expiration instant, the evaluation context must include an explicit evaluation
instant. At the exact expiration instant the Decision is no longer effective.
Comparison uses every accepted fractional digit in the portable timestamp
profile; an implementation must not reduce the comparison to milliseconds or
microseconds.

Lifecycle events are relationships over existing Approval evidence. They do not
delete historical Decisions, create new Decisions, or define authorization
policy.

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
Decision and lifecycle observations. Finding the first matching Decision is
insufficient when the supplied target identifies more than one. Prior
supersession is an independent reason a withdrawal target is invalid, even
when there is no prior withdrawal. These failures use
`FINKORE_APPROVAL_INVALID_DECISION` and preserve both histories under
**APPROVAL-VALIDITY-012** and **APPROVAL-ERROR-006**.

These 0.9.4 clarifications apply existing validity and history obligations;
they introduce no new lifecycle kind, eligibility policy, or portable error.

## Core 0.9.6 boundary review (non-normative)

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

The two Milestone 1 proposals were accepted for the Milestone 2 regression
baseline. APPROVAL-VALIDITY-013 defines the considered-set/context boundary;
APPROVAL-VALIDITY-014 defines imported lifecycle relationship validation.
These are corrective normative additions, not retroactive claims that every
boundary was previously specified. The bounded fixture declares local lifecycle
order through its array; Decision references use Requirement identity, Actor
identity, and decision instant. Timestamp equality retains SPEC-TIMESTAMP-005.

No same-Requirement successor restriction, successor-effectiveness condition,
or general graph/cycle policy is introduced. A successor can later be withdrawn
without rewriting its predecessor's supersession. Requirement identifiers do
not need to resolve through a registry absent from the input. Operation-specific
request kind remains distinct from committed history's discriminator.

Milestone 2 provides permanent regressions. Milestone 5 synchronizes core,
adapter, public API, and package behavior, including exact-instant lifecycle
references and preservation of their timestamp spelling. Milestones 8–9 complete
the Core 0.9.6 verification, fresh review, and local release gate. Existing IDs
retain their meaning; new obligations
have new IDs.

## Example

The following JSON is illustrative and non-normative:

```json
{
  "history": [
    {
      "requirementId": "finance-review",
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
      "target": {
        "requirementId": "finance-review",
        "actorId": "user-7",
        "decidedAt": "2026-09-01T12:00:00Z"
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
