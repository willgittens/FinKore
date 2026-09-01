# Audit Actors

## Status

**Draft**

## Purpose

This document defines attribution of domain events to Actors. An Actor may be a human, service, scheduled process, system, integration, or another identified subject.

## Requirements

- **AUDIT-ACTOR-001** — An actor reference MUST include a stable identifier.
- **AUDIT-ACTOR-007** — An actor reference SHOULD include an actor type.
- **AUDIT-ACTOR-008** — Later changes to an Actor profile MUST NOT change the Actor identity recorded by a committed Audit Event.
- **AUDIT-ACTOR-002** — Actor identifiers MUST be treated as opaque.
- **AUDIT-ACTOR-003** — Display names MAY be captured as historical metadata but MUST NOT replace stable identity.
- **AUDIT-ACTOR-004** — If an unknown Actor is represented, that representation MUST distinguish unknown attribution from a known Actor and MUST NOT invent an identity. [Audit Events](events.md) also permits omission when no Actor is known.
- **AUDIT-ACTOR-005** — Delegation or acting-on-behalf-of relationships SHOULD preserve both the initiating and represented subjects when domain-relevant.
- **AUDIT-ACTOR-006** — Actor data MUST follow applicable [redaction](redaction.md) rules.

## Invariants

Later changes to an Actor's profile must not change the identity recorded by a committed Audit Event.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

```json
{
  "type": "service",
  "id": "settlement-importer"
}
```

## Invalid Examples

- Using a mutable display name as the sole actor identity.
- Attributing an automated event to a human who did not initiate it.

## Open Questions

- Which explicit representation should denote an unknown actor?

## Non-Goals

This document does not define authentication, authorization, user directories, or role assignment.

