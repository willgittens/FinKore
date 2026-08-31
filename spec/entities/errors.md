# Entity Errors

## Status

Draft.

## Purpose

This document defines initial portable entity failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_ENTITY_INVALID_IDENTITY` | Entity identity is missing, unstable, or conflicts within its scope. |
| `FINFLOW_ENTITY_IMMUTABLE` | A requested mutation targets data immutable in the current state. |
| `FINFLOW_ENTITY_INVALID_MUTATION` | A requested change is not a recognized or permitted domain mutation. |
| `FINFLOW_ENTITY_STATE_CONFLICT` | The operation's expected state does not match current state. |
| `FINFLOW_VALIDATION_FAILED` | One or more structural or domain validation rules failed. |

## Requirements

- An entity failure MUST leave identity, current state, and entity data unchanged.
- Validation failures SHOULD include stable violation identifiers.
- Implementations MAY attach safe diagnostic context without changing portable code meaning.
- Workflow, Money, Approval, or Audit failures SHOULD retain their more specific domain code when that code explains the primary failure.

## Invariants

No failed entity operation produces a partially valid entity.

## Open Questions

- Should correction and reversal failures share entity codes or receive a future dedicated domain catalog?

## Non-Goals

This is not a complete catalog and does not define concurrency control or transport errors.

