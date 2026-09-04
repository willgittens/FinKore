# Approval Conditions

## Status

**Draft**

## Purpose

This document defines domain conditions that determine whether an approval requirement applies.

## Requirements

- **APPROVAL-CONDITION-001** — A condition MUST be expressed in terms of identified domain facts.
- **APPROVAL-CONDITION-002** — Evaluation MUST produce an applicable or not-applicable result.
- **APPROVAL-CONDITION-003** — The facts and condition version used for an effective evaluation SHOULD be retained as audit evidence.
- **APPROVAL-CONDITION-004** — A condition MUST NOT depend implicitly on presentation state or an unspecified authorization policy.
- **APPROVAL-CONDITION-005** — The result MUST be deterministic for the same condition and facts.
- **APPROVAL-CONDITION-006** — If required facts are absent, evaluation MUST fail or remain unresolved; it MUST NOT silently treat the requirement as not applicable.

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

