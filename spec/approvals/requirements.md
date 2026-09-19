# Approval Requirements

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines a need for an Approval Decision from an eligible Actor or application-defined subject. Eligibility may refer to an individual Actor, role, group, organizational responsibility, or another declared rule; no authorization or RBAC model is prescribed.

## Requirements

- **APPROVAL-REQUIREMENT-001** — An Approval Requirement MUST have a stable identifier within its approval context.
- **APPROVAL-REQUIREMENT-002** — It MUST identify the subject whose approval is requested.
- **APPROVAL-REQUIREMENT-003** — It MUST identify its eligible Actor, application-defined subject, or eligibility rule.
- **APPROVAL-REQUIREMENT-004** — It MUST define which Approval Decision outcome satisfies or rejects it.
- **APPROVAL-REQUIREMENT-005** — An applicable Approval Requirement with no effective Approval Decision MUST have the `PENDING` State.
- **APPROVAL-REQUIREMENT-006** — Eligibility MUST be evaluated independently from the Actor's technical ability to submit a request.
- **APPROVAL-REQUIREMENT-007** — A requirement MAY be conditional as defined by [Conditions](conditions.md).

## Invariants

An Approval Requirement must not be considered approved without an effective approving Approval Decision from an eligible Actor.

## Example

The following JSON is illustrative and non-normative; eligibility is not limited to roles and these member names are not a portable serialization.

```json
{
  "id": "finance-review",
  "eligibleRole": "FINANCE_REVIEWER",
  "state": "PENDING"
}
```

## Invalid Examples

- Treating permission to view an entity as approval of it.
- Satisfying a requirement with a decision from an ineligible actor.

## Open Questions

- Should a future interchange specification define a portable representation for associating Approval Decisions with subject state or facts?

