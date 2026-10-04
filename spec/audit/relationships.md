# Audit Relationships

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines portable relationship metadata between Audit Events. Audit
Relationships allow a later Audit Event to state that it corrects, reverses,
voids, or supersedes an earlier Audit Event without rewriting committed logical
history.

Audit Relationships record evidence links. They do not define the Entity
Evolution operation itself, ledger effects, retention policy, or global
distributed ordering.

## Terminology

An **Audit Relationship** is event content identifying a relationship from the
source Audit Event that contains the relationship to one target Audit Event.

A **relationship identity** is a stable, opaque identifier for an Audit
Relationship. It identifies the relationship itself, not the source event,
target event, or affected Entity.

A **source Audit Event** is the Audit Event that contains the relationship.

A **target Audit Event** is the Audit Event identified by the relationship as
being corrected, reversed, voided, or superseded.

## Portable Model

An Audit Event may include an ordered list of Audit Relationships. Each
relationship has:

- a relationship identity;
- one relationship type: `CORRECTS`, `REVERSES`, `VOIDS`, or `SUPERSEDES`;
- a target event identity; and
- the target event's affected Entity reference.

No Audit Relationship member defined by this document is nullable. When a
relationship list is present, it must contain at least one relationship.

The relationship list order is a local event-content observation only. It MUST
NOT be treated as a portable causality, priority, or global ordering rule.

## Requirements

- **AUDIT-RELATIONSHIP-001** - An Audit Relationship MUST identify a stable relationship identity, exactly one permitted relationship type, one target Audit Event identity, and the target Audit Event's affected Entity reference.
- **AUDIT-RELATIONSHIP-002** - Relationship identities MUST be stable and opaque; consumers MUST NOT infer source event, target event, Entity identity, time, ordering, or relationship type from the relationship identity format.
- **AUDIT-RELATIONSHIP-003** - The permitted Audit Relationship types are exactly `CORRECTS`, `REVERSES`, `VOIDS`, and `SUPERSEDES`. An implementation MUST NOT silently accept, normalize, or reinterpret another relationship type as one of these values.
- **AUDIT-RELATIONSHIP-004** - A source Audit Event MUST NOT target itself through an Audit Relationship.
- **AUDIT-RELATIONSHIP-005** - A committed logical Audit history MUST NOT contain two Audit Relationships with the same relationship identity.
- **AUDIT-RELATIONSHIP-006** - Appending an Audit Event with an Audit Relationship whose target Audit Event is not already committed in the supplied logical history MUST fail with `FINKORE_AUDIT_INVALID_EVENT` and MUST NOT commit the source event.
- **AUDIT-RELATIONSHIP-007** - Importing or constructing a logical Audit history containing an Audit Relationship whose target Audit Event is absent from that logical history MUST fail with `FINKORE_AUDIT_INVALID_EVENT`.
- **AUDIT-RELATIONSHIP-008** - The target Entity reference recorded on an Audit Relationship MUST match the affected Entity reference of the target Audit Event.
- **AUDIT-RELATIONSHIP-009** - Audit Relationships MUST be preserved as committed event content by later appends; later events MUST NOT rewrite, reorder, remove, or reinterpret committed relationships.
- **AUDIT-RELATIONSHIP-010** - A redacted Audit Event representation MUST preserve Audit Relationship identity, type, target event identity, and target Entity reference unless a future redaction rule explicitly defines a safe relationship redaction mechanism.
- **AUDIT-RELATIONSHIP-011** - Redaction evidence events may carry Audit Relationships and, when they do, those relationships MUST satisfy the same relationship validation rules as any other Audit Event.
- **AUDIT-RELATIONSHIP-012** - A rejected relationship-bearing append, import, or redaction request MUST leave committed logical history and existing Audit Relationships unchanged.
- **AUDIT-RELATIONSHIP-013** - An invalid, missing, malformed, unsupported, duplicate, unknown-target, self-targeting, or target-Entity-mismatched Audit Relationship MUST fail with `FINKORE_AUDIT_INVALID_EVENT` unless the primary failure is an existing append-only, duplicate-event, redaction, or actor failure.
- **AUDIT-RELATIONSHIP-014** - Audit Relationships MUST NOT create a global ordering, distributed causality guarantee, or event-sourced reconstruction requirement beyond the explicit relationship content they record.

Core 2.0 redaction linkage does not extend the closed relationship-type set.
In particular, `REDACTS` is not a permitted relationship type; redaction
evidence identifies its selected source through the metadata defined by
**AUDIT-REDACTION-010**.

## Invariants

Committed Audit Relationships are part of append-only logical Audit history.
They must remain observable with the same relationship identity, relationship
type, target event identity, and target Entity reference after later appends and
redaction representations.

## Examples

The following JSON is illustrative and non-normative.

```json
{
  "eventId": "evt-correction",
  "eventType": "ENTITY_CORRECTED",
  "entity": { "type": "invoice", "id": "inv-10" },
  "occurredAt": "2026-09-01T12:00:00Z",
  "relationships": [
    {
      "relationshipId": "rel-correction-1",
      "type": "CORRECTS",
      "target": {
        "eventId": "evt-original",
        "entity": { "type": "invoice", "id": "inv-10" }
      }
    }
  ]
}
```

## Invalid Examples

- A relationship with type `RELATED_TO` in Core 2.0.
- A relationship whose target event identity is not present in the logical
  history.
- A relationship whose target Entity reference differs from the target Audit
  Event's affected Entity.
- A relationship that targets the source Audit Event itself.
- Reusing a relationship identity already committed in the same logical history.

## Errors

Malformed, unsupported, duplicate, unknown-target, self-targeting, or
target-Entity-mismatched Audit Relationships fail as invalid event content with
`FINKORE_AUDIT_INVALID_EVENT`. Attempting to replace, remove, or rewrite a
committed relationship by changing committed event content remains an
append-only violation.

Core 2.0 does not introduce a dedicated Audit Relationship portable error
code.

## Open Questions

- Should a future specification version define a generic `RELATED` relationship type?
- Should a future specification version define policy-authorized relationship redaction, and if
  so which relationship members can be safely concealed without destroying event
  meaning?

## Non-Goals

This document does not define Entity Evolution operations, event stores,
retention services, total ordering, distributed causality, cryptographic
proofs, cancellation, adjustment, replacement, amendment, or concrete financial
domain effects.
