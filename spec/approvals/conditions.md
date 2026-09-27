# Approval Conditions

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines domain conditions that determine whether an approval requirement applies.

## Requirements

- **APPROVAL-CONDITION-001** — A condition MUST be expressed in terms of identified domain facts.
- **APPROVAL-CONDITION-002** — Evaluation MUST produce an applicable or not-applicable result.
- **APPROVAL-CONDITION-003** — The facts and condition version used for an effective evaluation SHOULD be retained as audit evidence.
- **APPROVAL-CONDITION-004** — A condition MUST NOT depend implicitly on presentation state or an unspecified authorization policy.
- **APPROVAL-CONDITION-005** — The result MUST be deterministic for the same condition and facts.
- **APPROVAL-CONDITION-006** — If required facts are absent, evaluation MUST fail or remain unresolved; it MUST NOT silently treat the requirement as not applicable.
- **APPROVAL-CONDITION-007** — Before accepting an external applicability result, evaluation MUST validate its condition declaration and required-fact selectors. Missing or malformed required declarations MUST fail with `FINKORE_APPROVAL_INVALID_DECISION`; they MUST NOT become a condition with no required facts. A well-formed declaration whose required facts are unavailable MUST use `FINKORE_APPROVAL_CONDITION_UNRESOLVED`. Required fact selection MUST follow APPROVAL-FACT-002, including own-member traversal and the distinction between absent and explicit null. Declaration validation and evaluation MUST NOT mutate supplied facts or Approval history.

The [bounded fixture](../../conformance/conventions.md) requires condition
identity, an explicit nonempty required-fact list, and an evaluation-owner label.
An explicit result cannot bypass malformed declarations or unavailable facts.
With a valid declaration and complete facts, the supplied `APPLICABLE` or
`NOT_APPLICABLE` result is returned unchanged. Missing/malformed result evidence
is unresolved. This correction defines no condition expression engine or general
priority among unrelated concrete Approval errors.

## Invariants

Only applicable Approval Requirements must contribute to an Approval Chain's outcome.

## Examples

```text
Finance approval applies when total amount is greater than 10,000 EUR.
```

The example assumes the amount comparison and any conversion basis are declared by the composing domain.

## Invalid Examples

- Comparing amounts in different currencies without explicit conversion terms.
- Skipping a requirement because condition input was missing.

## Errors

An unevaluable required condition must report `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.

## Open Questions

- Is a portable condition expression model needed, or is behavioral conformance sufficient?
