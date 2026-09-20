# Audit Events

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines the minimum meaning and content of an Audit Event. An Audit Event records a domain occurrence; it is not required to be the Business Event itself or the source from which domain state is reconstructed.

## Requirements

- **AUDIT-EVENT-001** — Every committed Audit Event MUST have a stable event identifier, event type, entity reference, and timestamp.
- **AUDIT-EVENT-002** — It MUST identify an Actor when the responsible Actor is known; otherwise Actor attribution MAY be omitted or explicitly represented as unknown.
- **AUDIT-EVENT-003** — The event type MUST be a stable, producer-supplied domain event identifier. In Core 0.9 release candidate it MUST be a non-empty ASCII token matching `[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*`. FinKore does not define a closed global event-type catalog in Core 0.9 release candidate. Implementations MUST NOT derive event type automatically from TypeScript method names, class names, repository methods, HTTP endpoints, database operations, framework callbacks, or other implementation mechanism names.
- **AUDIT-EVENT-004** — The entity reference MUST identify the affected entity type and stable entity identifier.
- **AUDIT-EVENT-005** — The timestamp MUST identify an unambiguous instant when the recorded occurrence took effect and, when serialized, MUST follow [Timestamp conventions](../conventions.md#portable-values).
- **AUDIT-EVENT-006** — Event metadata MAY provide relevant context.
- **AUDIT-EVENT-008** — Event metadata MUST NOT contradict required event fields.
- **AUDIT-EVENT-007** — In Core 0.9 release candidate, an Audit Event is complete when every required Audit Event field is present and individually valid according to this document and referenced actor, timestamp, entity, change, and redaction requirements. No additional event-type-specific fields are required by Core 0.9 release candidate. Optional metadata or display text MUST NOT be required to recover the event identifier, event type, entity reference, timestamp, known actor identity, or recorded changes.

Audit Relationships, when present, follow [Audit Relationships](relationships.md).

## Invariants

Within one audit history, event identifiers must be unique and committed events must follow [append-only](append-only.md) behavior.

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
- Supplying a calendar-invalid occurrence timestamp, an unknown `-00:00`
  offset, or more than nine fractional digits.

## Open Questions

- Must ingestion time be recorded separately from occurrence time?
