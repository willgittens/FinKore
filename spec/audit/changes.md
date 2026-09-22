# Audit Changes

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines how an audit event may describe domain-relevant field changes.

## Requirements

- **AUDIT-CHANGE-001** — A Change MUST identify the changed field or domain path.
- **AUDIT-CHANGE-002** — A Change SHOULD record prior and resulting values when both may be safely retained.
- **AUDIT-CHANGE-003** — A Change MUST distinguish an absent value from an explicit null value when the underlying domain distinguishes them.
- **AUDIT-CHANGE-004** — Values MUST use stable domain representations, not localized display strings. Changes to Money values MUST preserve the semantics defined by [Money](../money/README.md).
- **AUDIT-CHANGE-005** — A Change set MUST NOT claim a field changed when its domain value remained equal.
- **AUDIT-CHANGE-006** — Sensitive values MUST follow [Redaction](redaction.md).
- **AUDIT-CHANGE-007** — An event MAY omit field changes when its event type fully expresses the occurrence or disclosure is prohibited.
- **AUDIT-CHANGE-008** — Unless a Change explicitly declares a supported domain value type, its prior and resulting values MUST be compared as ordinary JSON values. Equality is recursive and type-sensitive: null equals only null; a Boolean MUST NOT equal a number; strings compare by their exact value; numbers compare by their JSON numeric value; arrays compare in declared order; and objects compare the same member names and recursively equal member values without assigning meaning to object member order. Absence remains distinct from every supplied JSON value, including null. A value outside the JSON data model is not a supported portable Audit Change value and MUST be rejected with `FINKORE_AUDIT_INVALID_EVENT`.
- **AUDIT-CHANGE-009** — A portable Audit Change whose values carry Money semantics MUST explicitly declare `valueType` as `MONEY`; Money semantics MUST NOT be inferred from an ordinary JSON object merely because it has `amount` and `currency` members. Each supplied non-null, non-absent value of a `MONEY` Change MUST be a valid normative Money serialization. Two supplied Money values are equal only when their currencies are the same and their exact decimal amounts are numerically equal under **MONEY-REPRESENTATION-005** and **MONEY-COMPARISON-002**; differing valid currencies or amounts are different domain values. Null and absence retain the distinctions required by **AUDIT-CHANGE-003**. An unknown `valueType` or malformed declared Money value MUST make the Audit Event invalid with `FINKORE_AUDIT_INVALID_EVENT`.

## Invariants

Recorded Changes must be consistent with the Audit Event's declared domain meaning.

Audit owns validation of its Change representation and the decision whether a
Change falsely claims equality. Money owns Money parsing and numeric semantics;
Audit invokes those semantics only after the Change explicitly declares Money.
The Audit equality check is not the `finkore.money.compare` operation: two
valid Money values with different currencies are different Change values, so
their difference is recordable without reporting a currency-mismatch error.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names or a domain-path syntax.

```json
{
  "field": "state",
  "before": "DRAFT",
  "after": "SUBMITTED"
}
```

## Invalid Examples

- Recording a secret in clear text when policy requires redaction.
- Using translated labels as canonical before and after values.

## Open Questions

- Should domain paths use a standardized portable syntax?
- How should large or structured values be summarized without losing evidentiary meaning?

## Core 0.9.3 correction note (non-normative)

**AUDIT-CHANGE-008** specifies the ordinary JSON comparison already required
to apply **AUDIT-CHANGE-005** portably. **AUDIT-CHANGE-009** adds an opt-in
Money declaration because treating every Money-shaped object as Money would
silently reinterpret existing ordinary JSON. Omission of `valueType` preserves
ordinary JSON semantics, so the optional declaration follows
**SPEC-COMPATIBILITY-010**. The dedicated declaration and invalid-event mapping
correct a demonstrated ambiguity under **SPEC-FREEZE-001**; no portable error
code or operation identifier changes.
