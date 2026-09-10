# Entity Errors

## Status

**Draft**

## Purpose

This document defines initial portable entity failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_ENTITY_INVALID_IDENTITY` | Entity identity is missing, unstable, or conflicts within its scope. |
| `FINKORE_ENTITY_IMMUTABLE` | A requested mutation targets data immutable in the current state. |
| `FINKORE_ENTITY_INVALID_MUTATION` | A requested change is not a recognized or permitted domain mutation. |
| `FINKORE_ENTITY_STATE_CONFLICT` | The operation's expected state does not match current state. |
| `FINKORE_ENTITY_VALIDATION_FAILED` | One or more Structural Validation or Business Validation rules failed. |

## Requirements

- **ENTITY-ERROR-001** — A Financial Entity failure MUST leave identity, current State, and entity data unchanged.
- **ENTITY-ERROR-002** — Validation failures SHOULD include stable violation identifiers.
- **ENTITY-ERROR-003** — Implementations MAY attach safe diagnostic context without changing portable code meaning.
- **ENTITY-ERROR-004** — A Workflow, Money, Approval, or Audit failure MUST retain its domain-specific code when that condition is the primary failure; it MUST NOT be replaced by `FINKORE_ENTITY_VALIDATION_FAILED`.

Entity evolution error mapping is defined by **ENTITY-EVOLUTION-024** through
**ENTITY-EVOLUTION-028** in [Entity Evolution](evolution.md). Draft 0.2 does not
introduce a dedicated evolution error code.

## Invariants

A failed Financial Entity operation must not produce a partially valid Financial Entity.

## Open Questions

- Should a future draft define a dedicated portable error catalog for additional evolution concepts if existing Entity errors become too broad?

## Non-Goals

This is not a complete catalog and does not define concurrency control or transport errors.
