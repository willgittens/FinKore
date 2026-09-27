# Entity Validation

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines validation of financial entity state and proposed domain operations.

## Terminology

**Structural Validation** checks required shape and value forms. **Business Validation** checks business invariants and State-dependent rules.

## Requirements

- **ENTITY-VALIDATION-001** — A Financial Entity MUST satisfy all Structural Validation and Business Validation rules applicable to its current State.
- **ENTITY-VALIDATION-002** — A proposed Mutation or Transition MUST be validated before any resulting Change becomes observable.
- **ENTITY-VALIDATION-003** — Validation MUST evaluate the complete proposed domain result when rules span multiple fields.
- **ENTITY-VALIDATION-004** — Failure of a Structural Validation or Business Validation rule defined for the Financial Entity MUST identify `FINKORE_ENTITY_VALIDATION_FAILED`. Stable violation identifiers follow **ENTITY-ERROR-002**, and preservation of a primary domain-specific code follows **ENTITY-ERROR-004**.
- **ENTITY-VALIDATION-005** — Validation details SHOULD identify relevant domain paths.
- **ENTITY-VALIDATION-008** — Validation details MUST NOT expose sensitive values unnecessarily.
- **ENTITY-VALIDATION-006** — Validation evaluation MUST NOT alter the observable Financial Entity.
- **ENTITY-VALIDATION-007** — A composing domain SHOULD distinguish rules required in every state from rules required only for a transition or target state.
- **ENTITY-VALIDATION-009** — An unsupported or malformed Entity validator declaration MUST be rejected with `FINKORE_ENTITY_INVALID_MUTATION` before evaluating declared predicates against Entity data. It MUST NOT be silently skipped. A supported, well-formed rule that rejects data continues to use `FINKORE_ENTITY_VALIDATION_FAILED` under **ENTITY-VALIDATION-004**. Rejection MUST preserve existing Entity observations.

- **ENTITY-VALIDATION-010** — The bounded Entity representation MUST supply object-valued data at creation and at every boundary consuming an existing Entity observation, including import and evolution. Omission, null, or non-object data MUST use `FINKORE_ENTITY_VALIDATION_FAILED`, even when no business validator is declared. This requirement defines the bounded fixture shape, not a universal composing-domain data schema. Failure MUST preserve prior observations and MUST NOT expose a partial result.

## Invariants

A successful operation must leave the Financial Entity valid for its resulting State. A failed operation must leave the Financial Entity unchanged.

The applicable rules in **ENTITY-VALIDATION-001** also govern Entity
observations supplied as the source, related Entity, or successor of an
[evolution operation](evolution.md). Preserving source facts does not waive
their declared validation, and an operation cannot successfully identify an
invalid related Entity as its domain result. Validate each complete observation
against the rules applicable to its State. A declared business-validator failure
uses **ENTITY-VALIDATION-004**; preservation of a more specific primary domain
failure still follows **ENTITY-ERROR-004**. Failed evolution returns no partial
relation, currentness change, or Audit commit under **ENTITY-EVOLUTION-023**
and **ENTITY-EVOLUTION-033**.

## Example

The following JSON is illustrative and non-normative.

```json
{
  "code": "FINKORE_ENTITY_VALIDATION_FAILED",
  "violations": [
    { "rule": "AMOUNT_REQUIRED", "path": "amount" }
  ]
}
```

## Cross-field example (non-normative)

For example, a composing domain may declare that an amount must not exceed a
limit in the same currency. Updating both from `10 EUR` to `20 EUR` must be
validated against the proposed `20 EUR` amount and `20 EUR` limit, not against
an intermediate `20 EUR` amount and old `10 EUR` limit. A proposed `30 EUR`
amount and `20 EUR` limit must fail without changing either original field.
This is an illustration of **ENTITY-VALIDATION-003**, not a universal Entity
constraint or a standardized validation language.

## Invalid Examples

- Applying half of a multi-field mutation before reporting another field invalid.
- Using localized prose as the only machine-readable violation identity.

## Core 0.9.5 correction note (non-normative)

The accepted [contract decision](../../docs/plans/plan-09.5.md) adds
**ENTITY-VALIDATION-009** to distinguish declaration failure from a supported
predicate rejecting data. The bounded fixture continues to support only
`positive-money` and `money-not-greater-than`, with nonempty string
`id`/`path` and the latter's nonempty `otherPath`. Omitted validation and an
empty list remain valid. No general validation DSL or universal positive-Money
business rule is introduced, and no total priority over unrelated domain
failures is specified.

## Open Questions

- Should violation severity and warning semantics be standardized?
