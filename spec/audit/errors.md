# Audit Errors

## Status

**Draft**

## Purpose

This document defines initial portable audit failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_AUDIT_INVALID_EVENT` | Required event content is missing, malformed, or inconsistent. |
| `FINFLOW_AUDIT_DUPLICATE_EVENT` | The event identity has already been committed. |
| `FINFLOW_AUDIT_APPEND_ONLY_VIOLATION` | An operation would replace, modify, reorder, or remove committed logical history outside the redaction rules. |
| `FINFLOW_AUDIT_REDACTION_INVALID` | A redaction violates policy or destroys required event meaning. |
| `FINFLOW_AUDIT_ACTOR_INVALID` | Actor attribution is malformed or inconsistent. |

## Requirements

- A rejected audit operation MUST NOT partially commit the invalid event.
- Error details MUST NOT disclose content protected by redaction policy.
- Implementations MAY expose additional diagnostic context that preserves these constraints.

## Invariants

A failed append MUST leave committed logical history unchanged.

## Open Questions

- Should conflicts between event ordering claims receive a dedicated code?

## Non-Goals

This is not a complete error catalog and does not define transport behavior.

