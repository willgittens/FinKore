# Approval Requirements

## Status

**FinKore Core 1.1 stable.**

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

Concrete record and Requirement/Decision evaluation boundaries require the
subject and eligibility declarations in **APPROVAL-REQUIREMENT-002** and
**APPROVAL-REQUIREMENT-003**. An empty subject object does not identify a
subject. A null eligibility declaration does not identify an eligibility rule.
An `applicability` or `state` observation cannot replace these declarations at
a concrete Decision boundary. Lightweight chain/composition observations remain
governed by their own contracts; they need not repeat a concrete Requirement.

The bounded conformance representation is described in
[Conformance Conventions](../../conformance/conventions.md); it does not
standardize every composing domain's subject or eligibility representation.

The approval context in **APPROVAL-REQUIREMENT-001** is the boundary within
which a Requirement identifier is stable. A consumer that stores or transports
Requirements in a larger namespace must retain which approval context and
subject own the Requirement; equal Requirement identifiers in different
contexts do not establish identity. This is an existing association obligation,
not a requirement for a global registry or one prescribed identifier shape.

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
