# Entity Validation

## Status

**Draft**

## Purpose

This document defines validation of financial entity state and proposed domain operations.

## Terminology

**Structural Validation** checks required shape and value forms. **Business Validation** checks business invariants and State-dependent rules.

## Requirements

- A Financial Entity MUST satisfy all Structural Validation and Business Validation rules applicable to its current State.
- A proposed Mutation or Transition MUST be validated before any resulting Change becomes observable.
- Validation MUST evaluate the complete proposed domain result when rules span multiple fields.
- Failure of a Structural Validation or Business Validation rule defined for the Financial Entity MUST identify `FINFLOW_ENTITY_VALIDATION_FAILED` and SHOULD provide one or more stable, structured violation identifiers. When an independently specified Money, Workflow, Approval, or Audit operation is the primary failure, its domain-specific code MUST be retained instead.
- Validation details SHOULD identify relevant domain paths and MUST NOT expose sensitive values unnecessarily.
- Validation evaluation MUST NOT alter the observable Financial Entity.
- A composing domain SHOULD distinguish rules required in every state from rules required only for a transition or target state.

## Invariants

A successful operation MUST leave the Financial Entity valid for its resulting State. A failed operation MUST leave the Financial Entity unchanged.

## Example

The following JSON is illustrative and non-normative.

```json
{
  "code": "FINFLOW_ENTITY_VALIDATION_FAILED",
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

