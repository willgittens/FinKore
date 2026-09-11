# Approval Validity

## Status

**Draft**

## Purpose

This document defines Draft 0.2 current-effectiveness semantics for Approval
Decisions. It extends the Draft 0.1 fact-effectiveness model with explicit
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

## Invariants

Current-effectiveness is an observation over append-only evidence. A Decision
can be historically committed and still be ineffective for current evaluation
because relevant facts changed, the subject revision changed, the Decision was
withdrawn, the Decision expired, the Decision was superseded, or the Requirement
it addressed was superseded.

Expiration is deterministic. If any currently considered Decision has an
expiration instant, the evaluation context must include an explicit evaluation
instant. At the exact expiration instant the Decision is no longer effective.

Lifecycle events are relationships over existing Approval evidence. They do not
delete historical Decisions, create new Decisions, or define authorization
policy.

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
