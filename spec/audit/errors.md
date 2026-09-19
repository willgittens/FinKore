# Audit Errors

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines initial portable audit failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_AUDIT_INVALID_EVENT` | Required event content is missing, malformed, or inconsistent. |
| `FINKORE_AUDIT_DUPLICATE_EVENT` | The event identity has already been committed. |
| `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` | An operation would replace, modify, or remove a committed event, or change an explicitly recorded ordering relationship, outside the redaction rules. |
| `FINKORE_AUDIT_REDACTION_INVALID` | A redaction violates policy or destroys required event meaning. |
| `FINKORE_AUDIT_ACTOR_INVALID` | Actor attribution is malformed or inconsistent. |

## Requirements

- **AUDIT-ERROR-001** — A rejected audit operation MUST NOT partially commit the invalid event.
- **AUDIT-ERROR-002** — Error details MUST NOT disclose content protected by redaction policy.
- **AUDIT-ERROR-003** — Implementations MAY expose additional diagnostic context that preserves these constraints.

Audit Relationship error mapping is defined by **AUDIT-RELATIONSHIP-013** in
[Audit Relationships](relationships.md). Core 0.9 release candidate does not introduce a
dedicated Audit Relationship portable error code.

## Invariants

A failed append must leave committed logical history unchanged.

## Non-Goals

This is not a complete error catalog and does not define transport behavior or errors for concurrency and ordering mechanisms outside Core 0.9 release candidate.
