# Approval Decisions

## Status

**Draft**

## Purpose

This document defines recorded approval outcomes.

## Terminology

An Approval Decision outcome is `APPROVED` or `REJECTED`. `PENDING` describes an unresolved Approval Requirement and is not an Approval Decision.

## Requirements

- An Approval Decision MUST identify its Approval Requirement, deciding Actor, outcome, and decision timestamp.
- The Actor MUST satisfy the Approval Requirement's eligibility rule at the domain-defined evaluation time.
- An outcome MUST be either `APPROVED` or `REJECTED`.
- The decision timestamp MUST identify an unambiguous instant and, when serialized, MUST follow [Timestamp conventions](../conventions.md#portable-values).
- A committed Approval Decision MUST NOT be overwritten or removed from logical approval history. When a composing domain also requires an [Audit Event](../audit/events.md), that Audit Event MUST preserve the Approval Decision's domain meaning.
- Reconsideration MUST create a new decision or explicit superseding record, preserving prior history.

## Invariants

Each effective Approval Decision MUST have exactly one outcome and exactly one attributable Actor.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

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

