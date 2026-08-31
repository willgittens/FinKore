# Approval Requirements

## Status

Draft.

## Purpose

This document defines a need for an approval decision from an eligible role or subject.

## Requirements

- A requirement MUST have a stable identifier within its approval context.
- It MUST identify the eligible approver role, subject, or eligibility rule.
- It MUST define what decision satisfies or rejects it.
- A requirement MUST initially be `PENDING` when it applies and no effective decision exists.
- Eligibility MUST be evaluated independently from the actor's technical ability to submit a request.
- A requirement MAY be conditional as defined by [Conditions](conditions.md).
- A requirement SHOULD identify the object and revision or facts being approved.

## Invariants

A requirement MUST NOT be considered approved without an effective approving decision from an eligible actor.

## Examples

```json
{
  "id": "finance-review",
  "eligibleRole": "FINANCE_REVIEWER",
  "status": "PENDING"
}
```

## Invalid Examples

- Treating permission to view an entity as approval of it.
- Satisfying a requirement with a decision from an ineligible actor.

## Open Questions

- Must every requirement bind to an immutable revision of the approved facts?

