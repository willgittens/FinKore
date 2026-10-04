# Audit

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This domain defines audit history as logical records of financially relevant occurrences, not application logging. A Business Event is the occurrence itself; an Audit Event records that occurrence. The two may carry related information but must not be assumed to be identical.

## Requirements

- An Audit Event must identify what occurred, when it occurred, and the affected Financial Entity.
- An Audit Event must identify the responsible [Actor](actors.md) when one is known.
- Committed logical audit history must be [append-only](append-only.md).
- Sensitive content must follow the declared [redaction](redaction.md) policy.

## Documents

- [Events](events.md)
- [Changes](changes.md)
- [Actors](actors.md)
- [Redaction](redaction.md)
- [Relationships](relationships.md)
- [Append-Only History](append-only.md)
- [Errors](errors.md)

## Invariants

Committed logical audit history must preserve the existence and meaning of its Audit Events and every explicitly recorded ordering relationship, subject only to declared [redaction](redaction.md).

## Non-Goals

This domain does not define operational logs, storage technology, database triggers, monitoring, analytics, event delivery, event-sourced reconstruction of domain state, or Entity Evolution operation semantics. Audit Relationships record evidence links for correction, reversal, void, and supersession without defining those operations.
