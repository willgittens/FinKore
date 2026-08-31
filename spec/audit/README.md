# Audit

## Status

Draft.

## Purpose

This domain defines audit history as a record of financially relevant domain events, not application logging.

## Requirements

- An audit event MUST identify what occurred, when it occurred, and the affected entity.
- An event SHOULD identify the responsible [actor](actors.md) when one is known.
- Committed audit history MUST be [append-only](append-only.md).
- Corrections MUST add events rather than rewrite committed history.
- Sensitive content MUST follow the declared [redaction](redaction.md) policy.

## Documents

- [Events](events.md)
- [Changes](changes.md)
- [Actors](actors.md)
- [Redaction](redaction.md)
- [Append-Only History](append-only.md)
- [Errors](errors.md)

## Invariants

Audit history preserves the sequence and meaning of committed domain events.

## Non-Goals

This domain does not define operational logs, storage technology, database triggers, monitoring, or analytics.

