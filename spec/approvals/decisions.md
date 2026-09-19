# Approval Decisions

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines recorded approval outcomes.

## Terminology

An Approval Decision outcome is `APPROVED` or `REJECTED`. `PENDING` describes an unresolved Approval Requirement and is not an Approval Decision.

## Requirements

- **APPROVAL-DECISION-001** — An Approval Decision MUST identify its Approval Requirement, deciding Actor, outcome, and decision timestamp.
- **APPROVAL-DECISION-002** — An Approval Decision MUST be associated with the relevant subject state or facts against which the decision was made.
- **APPROVAL-DECISION-003** — An Approval Decision MUST NOT be assumed to remain valid when facts relevant to its Approval Requirement have changed. The application or a higher-level domain policy MAY define which mutations are relevant or material.
- **APPROVAL-DECISION-004** — The Actor MUST satisfy the Approval Requirement's eligibility rule at the domain-defined evaluation time.
- **APPROVAL-DECISION-005** — An outcome MUST be either `APPROVED` or `REJECTED`.
- **APPROVAL-DECISION-006** — The decision timestamp MUST identify an unambiguous instant and, when serialized, MUST follow [Timestamp conventions](../conventions.md#portable-values).
- **APPROVAL-DECISION-007** — A committed Approval Decision MUST NOT be overwritten or removed from logical approval history, including when later lifecycle evidence makes it no longer currently effective.
- **APPROVAL-DECISION-008** — When a composing domain requires an [Audit Event](../audit/events.md) for an Approval Decision, that Audit Event MUST preserve the Approval Decision's domain meaning.

## Invariants

Each effective Approval Decision must have exactly one outcome and exactly one attributable Actor.

For current satisfaction, a Decision is effective only for the Approval
Requirement it identifies and only while the relevant subject state or facts
still correspond to the state or facts against which the Decision was made. If
current relevant facts no longer correspond, the historical Decision remains in
logical history but MUST NOT satisfy the Requirement for current evaluation.
The observable Requirement state is therefore `PENDING` unless another
effective Decision satisfies or rejects the Requirement.

Core 0.9 release candidate current-effectiveness also considers lifecycle evidence defined by
[Approval Validity](validity.md), including withdrawal, expiration, and
supersession. Those lifecycle events change current effectiveness without
rewriting the committed Decision.

Core 0.9 release candidate does not require a specific binding mechanism such as revision
numbers, database versions, hashes, immutable snapshots, or stable fact
references. A composing domain MAY use any mechanism that preserves the
observable guarantee that the Decision can be associated with the relevant
subject state or facts used when it was made.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

```json
{
  "requirementId": "finance-review",
  "subjectStateRef": "invoice-42/revision-3",
  "outcome": "APPROVED",
  "actor": { "type": "user", "id": "user-7" },
  "decidedAt": "2026-08-31T10:15:30Z"
}
```

For example, a manager approves an invoice for `9,000 EUR`. If its amount changes to `90,000 EUR` and amount is relevant to that requirement, the previous approval is not automatically valid for the modified facts. This example is non-normative.

## Invalid Examples

- Treating a decision as effective for materially changed subject facts solely because its Approval Requirement identifier still matches.
- A `PENDING` decision.
- Editing a rejection into an approval without preserving the rejection.

## Errors

Invalid decisions must use an applicable [Approval Error](errors.md).

## Non-Goals

FinKore Core does not define delegation, escalation, approval-definition migration, or complex dependency graphs. Subject-state association is semantic; this document does not require revision identifiers, version numbers, hashes, snapshots, or immutable references.
