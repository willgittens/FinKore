# Entity Validation

## Status

Draft.

## Purpose

This document defines validation of financial entity state and proposed domain operations.

## Terminology

**Structural validation** checks required shape and value forms. **Domain validation** checks business invariants and state-dependent rules.

## Requirements

- An entity MUST satisfy all structural and domain rules applicable to its current state.
- A proposed mutation or transition MUST be validated before any resulting change becomes observable.
- Validation MUST evaluate the complete proposed domain result when rules span multiple fields.
- Validation failure MUST identify `FINFLOW_VALIDATION_FAILED` and SHOULD provide one or more stable, structured violation identifiers.
- Validation details SHOULD identify relevant domain paths and MUST NOT expose sensitive values unnecessarily.
- Validation MUST NOT mutate the entity.
- A composing domain SHOULD distinguish rules required in every state from rules required only for a transition or target state.

## Invariants

A successful operation leaves the entity valid for its resulting state. A failed operation leaves the entity unchanged.

## Examples

```json
{
  "code": "FINFLOW_VALIDATION_FAILED",
  "violations": [
    { "rule": "AMOUNT_REQUIRED", "path": "amount" }
  ]
}
```

## Invalid Examples

- Applying half of a multi-field mutation before reporting another field invalid.
- Using localized prose as the only machine-readable violation identity.

## Open Questions

- Should violation severity and warning semantics be standardized?

