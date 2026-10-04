# Audit

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

Audit history records financially relevant occurrences so a reviewer can
understand what happened, when, and who was responsible. A Business Event is the
occurrence itself; an Audit Event records it. The two may carry related
information but must not be assumed to be identical.

## Requirements

- An Audit Event must identify what occurred, when it occurred, and the affected Financial Entity.
- An Audit Event must identify the responsible [Actor](actors.md) when one is known.
- Committed logical audit history must be [append-only](append-only.md).
- Sensitive content must follow the declared [redaction](redaction.md) policy.

## Documents

Start with events, actors, and changes to understand the evidence in one
record. Continue with append-only history before reading relationships and
redaction.

| Document | What you will learn |
| --- | --- |
| [Events](events.md) | Essential evidence of an occurrence |
| [Actors](actors.md) | Attribution, including unknown or absent actors |
| [Changes](changes.md) | Differences between prior and resulting values |
| [Append-Only History](append-only.md) | Preservation of committed logical history |
| [Relationships](relationships.md) | Evidence linking related events |
| [Redaction](redaction.md) | Withholding protected content while preserving evidence |
| [Errors](errors.md) | Portable failure codes and their priority |

## Invariants

Committed logical audit history must preserve the existence and meaning of its Audit Events and every explicitly recorded ordering relationship, subject only to declared [redaction](redaction.md).

## Non-Goals

This domain does not define operational logs, storage technology, database triggers, monitoring, analytics, event delivery, event-sourced reconstruction of domain state, or Entity Evolution operation semantics. Audit Relationships record evidence links for correction, reversal, void, and supersession without defining those operations.
