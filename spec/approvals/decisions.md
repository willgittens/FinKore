# Approval Decisions

## Status

Draft.

## Purpose

This document defines recorded approval outcomes.

## Terminology

A decision outcome is **approved** or **rejected**. **Pending** describes an unresolved requirement and is not itself a decision.

## Requirements

- A decision MUST identify the requirement, deciding actor, outcome, and decision timestamp.
- The actor MUST satisfy the requirement's eligibility rule at the domain-defined evaluation time.
- An outcome MUST be either `APPROVED` or `REJECTED` unless a composing specification declares another portable outcome.
- A committed decision MUST be auditable and MUST NOT be silently overwritten.
- Reconsideration MUST create a new decision or explicit superseding record, preserving prior history.
- A decision SHOULD identify the facts or entity revision to which it applies.

## Invariants

Each effective decision has exactly one outcome and exactly one attributable actor.

## Examples

```json
{
  "requirementId": "finance-review",
  "outcome": "APPROVED",
  "actor": { "type": "user", "id": "user-7" },
  "decidedAt": "2026-08-31T10:15:30Z"
}
```

## Invalid Examples

- A `PENDING` decision.
- Editing a rejection into an approval without preserving the rejection.

## Errors

Invalid decisions MUST use an applicable [Approval Error](errors.md).

## Open Questions

- What explicit rules should govern withdrawal and supersession?

