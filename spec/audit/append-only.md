# Append-Only Audit History

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines logical preservation rules for committed Audit Events, independently of physical storage technology.

## Requirements

- **AUDIT-APPEND-001** — Within logical audit history, a committed Audit Event MUST NOT be replaced, modified, or removed. A policy-authorized redacted representation follows [Audit Redaction](redaction.md) and MUST leave evidence of the redaction.
- **AUDIT-APPEND-002** — An ordering relationship explicitly recorded as part of committed logical history MUST NOT later be changed.
- **AUDIT-APPEND-003** — Submission of an already committed Audit Event identity MUST fail with `FINKORE_AUDIT_DUPLICATE_EVENT` and MUST NOT create another committed event.
- **AUDIT-APPEND-004** — Any exceptional transformation required by law or policy MUST remain detectable through compliant [redaction](redaction.md) evidence.
- FinKore Core does not guarantee a total ordering of independently produced concurrent Audit Events.
- **AUDIT-APPEND-006** — When timestamps do not establish a reliable ordering between independently produced Audit Events, an implementation MUST NOT assign domain meaning to their arbitrary storage or retrieval order.

## Invariants

Reading logical history later must preserve the existence and identity of every committed Audit Event, every explicitly recorded ordering relationship, and every committed [Audit Relationship](relationships.md). A redacted representation must preserve the event-level meaning required by [Audit Redaction](redaction.md).

## Invalid Examples

- Editing yesterday's event to match a later value.
- Deleting a rejected decision after a later approval.
- Treating database row order as proof that one concurrent event caused another.

## Errors

An attempted prohibited mutation must report `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`.

## Open Questions

- Should a future specification define entity-local sequencing or explicit causal relationships between Audit Events?

## Non-Goals

This document does not prescribe event stores, ledgers, hashes, signatures, replication protocols, global sequence numbers, Lamport clocks, vector clocks, broker offsets, distributed consensus, or database transaction ordering. Entity Evolution operation semantics are defined outside Audit; Audit Relationships only preserve evidence links.
