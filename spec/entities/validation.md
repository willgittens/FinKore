# Entity Validation

## Status

**FinKore Core 2.0.2 stable.**

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
- **ENTITY-VALIDATION-011** — An implementation accepting native Entity application data MUST document its supported value profile, capture independently owned containers, and retain only supported immutable scalar values. Supported values MUST preserve their exact meaning, including all JSON object member names, through construction, observation, import, mutation, transition and evolution. Caller mutation of inputs or returned observations MUST NOT rewrite another retained Entity observation. Mutable or unsupported numeric objects, unsupported numeric subclasses, non-finite values, other unsupported objects and cyclic containers MUST be rejected without coercion, rounding, invoking custom copy hooks or partial effects. Shared acyclic containers MUST remain valid. Unsupported initial, imported or current Entity data MUST use `FINKORE_ENTITY_VALIDATION_FAILED`; unsupported proposed mutation values MUST use `FINKORE_ENTITY_INVALID_MUTATION`. Existing definition, identity, Workflow, current-data and mutability validation priorities MUST be preserved. A rejected operation MUST leave Entity, revision, evolution and Audit observations unchanged.

## Native application-data profile

**ENTITY-VALIDATION-011** extends the retained-value discipline of
APPROVAL-FACT-004 to Entity application data. The bounded profile consists of
null, strings, Booleans, supported finite numbers, arrays/lists and string-key
objects/maps. Entity data itself remains object-valued under
**ENTITY-VALIDATION-010**. Containers are copied independently; accepted immutable
numbers retain exact values without converting exact decimals through binary
floating point. Numeric strings remain strings; Money is not inferred from shape.
TypeScript accepts dense indexed arrays and plain or null-prototype records,
with string-key own enumerable members; symbol-key records and missing array
positions are unsupported. Python accepts lists and string-key dictionaries;
Java accepts lists and string-key maps. Container copying does not invoke
custom copy hooks.

The reference native numeric sets are finite primitive TypeScript `number`;
exact Python built-in `int`, finite built-in `float` and finite `Decimal`; and
exact Java classes `Byte`, `Short`, `Integer`, `Long`, `BigInteger`, `BigDecimal`,
finite `Float` and finite `Double`. Numeric subclasses, mutable Number objects
such as `AtomicInteger`/`AtomicLong`, TypeScript bigint/boxed numbers and other
native objects are unsupported. This does not add a persistence encoding,
extend Workflow guard comparison, or alter Money arithmetic/rounding rules.

The application-data profile applies to source and related/successor Entity
data in evolution. Audit evidence has its own value profile; this does not
define a total ordering for otherwise unspecified competing errors.

## Invariants

A successful operation must leave the Financial Entity valid for its resulting State. A failed operation must leave the Financial Entity unchanged.

For an Entity lifecycle Transition, the complete proposed result includes the
target State even when the data is unchanged. Rules declared for that target
State are evaluated only after the referenced Workflow accepts the Transition
Request and its Guards. A supported target-State rule that rejects the proposed
Entity uses **ENTITY-VALIDATION-004** and leaves the original observation
unchanged under **ENTITY-VALIDATION-006**. This ordering does not replace an
earlier primary Workflow error and does not define the outcome for malformed
Entity guard-context containers.

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

## Validator declarations

**ENTITY-VALIDATION-009** distinguishes declaration failure from a supported
predicate rejecting data. The bounded fixture supports only
`positive-money` and `money-not-greater-than`, with nonempty string
`id`/`path` and the latter's nonempty `otherPath`. A fixture rule may also name a
nonempty list of distinct declared States in `states`; omission applies the rule
in every State. Null, empty, duplicate, non-string, or undeclared State selectors
are malformed declarations under **ENTITY-VALIDATION-009**. Omitted validation
and an empty list remain valid. No general validation DSL or universal
positive-Money business rule is introduced, and no total priority over
unrelated domain failures is specified.

## Open Questions

- Should violation severity and warning semantics be standardized?
