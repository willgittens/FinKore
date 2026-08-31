# Audit Actors

## Status

Draft.

## Purpose

This document defines attribution of domain events to people, systems, or other subjects.

## Requirements

- An actor reference MUST include a stable identifier and SHOULD include an actor type.
- Actor identifiers MUST be treated as opaque.
- Display names MAY be captured as historical metadata but MUST NOT replace stable identity.
- If no actor can be identified, the event MUST represent that fact explicitly rather than invent an actor.
- Delegation or acting-on-behalf-of relationships SHOULD preserve both the initiating and represented subjects when domain-relevant.
- Actor data MUST follow applicable [redaction](redaction.md) rules.

## Invariants

Later changes to an actor's profile MUST NOT silently change the identity recorded by a committed event.

## Examples

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

