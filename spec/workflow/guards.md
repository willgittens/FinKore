# Workflow Guards

## Status

Draft.

## Purpose

This document defines domain conditions that control whether a declared transition may occur.

## Requirements

- A guard MUST evaluate against the facts provided for the transition request.
- Every applicable guard MUST pass before the transition succeeds.
- Guard evaluation MUST NOT change workflow state.
- A guard result MUST be deterministic for the same declared facts, or its dependence on external facts MUST be explicit.
- A failed guard SHOULD identify a portable reason without exposing sensitive inputs.
- Authorization MAY be an input to a guard, but a guard MUST NOT assume a particular authorization model.

## Invariants

Failure of any required guard leaves current state unchanged. Guard order MUST NOT change the logical result when all guards are evaluated against the same facts.

## Examples

```text
Transition: SUBMITTED → APPROVED
Guard: required approvals are satisfied
```

## Invalid Examples

- Changing entity data as an undocumented side effect of evaluating a guard.
- Allowing a transition after a required guard fails.

## Errors

A rejected guard MUST report `FINFLOW_WORKFLOW_GUARD_REJECTED` or a more specific code declared by the composing domain.

## Open Questions

- How should time-sensitive or externally sourced facts be captured for reproducible evaluation?

