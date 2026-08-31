# Append-Only Audit History

## Status

Draft.

## Purpose

This document defines preservation rules for committed audit events.

## Requirements

- Once committed, an audit event MUST NOT be silently rewritten, reordered, or removed.
- A correction MUST be represented by a new event that references or otherwise identifies the corrected occurrence where possible.
- A reversal MUST be represented by a new compensating event and MUST NOT erase the reversed event.
- Event ordering MUST be stable within an audit history.
- Duplicate submission of the same event identity MUST NOT create contradictory copies.
- Any exceptional transformation required by law or policy MUST remain detectable through compliant [redaction](redaction.md) evidence.

## Invariants

Reading history later MUST preserve the existence, identity, and relative order of all non-redacted committed events.

## Invalid Examples

- Editing yesterday's event to match today's corrected value.
- Deleting a rejected decision after a later approval.

## Errors

An attempted prohibited mutation MUST report `FINFLOW_AUDIT_APPEND_ONLY_VIOLATION`.

## Open Questions

- What ordering guarantees are required when independent producers submit concurrent events?

## Non-Goals

This document does not prescribe event stores, ledgers, hashes, signatures, or replication protocols.

