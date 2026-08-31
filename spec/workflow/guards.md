# Workflow Guards

## Status

**Draft**

## Purpose

This document defines Transition Guards: domain predicates that control whether a declared Transition may occur.

## Requirements

- A Transition Guard MUST evaluate against the facts provided for the Transition Request.
- Every applicable Transition Guard MUST pass before the Transition succeeds.
- Transition Guard evaluation MUST NOT change Workflow State or other domain data.
- A Transition Guard result MUST be deterministic for the same declared facts, or the guard definition MUST identify its dependence on external facts.
- Authorization MAY be an input to a guard, but a guard MUST NOT assume a particular authorization model.

## Invariants

Failure of any required Transition Guard MUST leave current State unchanged. Guard order MUST NOT change the logical result when all guards are evaluated against the same facts.

## Examples

```text
Transition: SUBMITTED → APPROVED
Guard: required approvals are satisfied
```

## Invalid Examples

- Changing entity data as an undocumented side effect of evaluating a guard.
- Allowing a transition after a required guard fails.

## Errors

A Transition Guard rejection MUST report `FINFLOW_WORKFLOW_GUARD_REJECTED`. A composing domain MAY provide additional context or a secondary domain code without replacing this failure category.

## Open Questions

- How should time-sensitive or externally sourced facts be captured for reproducible evaluation?

