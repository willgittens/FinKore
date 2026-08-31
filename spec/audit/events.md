# Audit Events

## Status

**Draft**

## Purpose

This document defines the minimum meaning and content of an Audit Event. An Audit Event records a domain occurrence; it is not required to be the Business Event itself or the source from which domain state is reconstructed.

## Requirements

- Every committed Audit Event MUST have a stable event identifier, event type, entity reference, and timestamp.
- It MUST identify an Actor when the responsible Actor is known; otherwise Actor attribution MAY be omitted or explicitly represented as unknown.
- The event type MUST express a domain occurrence and MUST NOT merely name an implementation method.
- The entity reference MUST identify the affected entity type and stable entity identifier.
- The timestamp MUST identify an unambiguous instant when the recorded occurrence took effect and, when serialized, MUST follow [Timestamp conventions](../conventions.md#portable-values).
- Event metadata MAY provide relevant context but MUST NOT contradict required event fields.
- An event MUST be complete enough to retain its declared meaning without relying on mutable display text.

## Invariants

Within one audit history, event identifiers MUST be unique and committed events MUST follow [append-only](append-only.md) behavior.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

```json
{
  "eventId": "evt-1042",
  "eventType": "ENTITY_SUBMITTED",
  "entity": { "type": "expense", "id": "exp-52" },
  "actor": { "type": "user", "id": "user-7" },
  "occurredAt": "2026-08-31T10:15:30Z",
  "changes": []
}
```

## Invalid Examples

- An event with only free-form prose and no event type or entity reference.
- Reusing an event identifier within the same history.

## Open Questions

- Must ingestion time be recorded separately from occurrence time?

