# Append-Only Audit History

## Status

**Draft**

## Purpose

This document defines logical preservation rules for committed Audit Events, independently of physical storage technology.

## Requirements

- Within logical audit history, a committed Audit Event MUST NOT be replaced, modified, reordered, or removed. A policy-authorized redacted representation follows [Audit Redaction](redaction.md) and MUST leave evidence of the redaction.
- A correction MUST be represented by a new Audit Event. When the corrected occurrence is identifiable, the correction event MUST reference or otherwise identify it.
- A reversal MUST be represented by a new compensating event and MUST NOT erase the reversed event.
- Submission of an already committed Audit Event identity MUST fail with `FINFLOW_AUDIT_DUPLICATE_EVENT` and MUST NOT create another committed event.
- Any exceptional transformation required by law or policy MUST remain detectable through compliant [redaction](redaction.md) evidence.

## Invariants

Reading logical history later MUST preserve the existence, identity, and relative order of every committed Audit Event. A redacted representation MUST preserve the event-level meaning required by [Audit Redaction](redaction.md).

## Invalid Examples

- Editing yesterday's event to match today's corrected value.
- Deleting a rejected decision after a later approval.

## Errors

An attempted prohibited mutation MUST report `FINFLOW_AUDIT_APPEND_ONLY_VIOLATION`.

## Open Questions

- What ordering guarantees are required when independent producers submit concurrent events?

## Non-Goals

This document does not prescribe event stores, ledgers, hashes, signatures, or replication protocols.

