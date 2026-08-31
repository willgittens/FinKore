# Workflow Errors

## Status

Draft.

## Purpose

This document defines initial portable workflow failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_WORKFLOW_INVALID_DEFINITION` | The workflow definition violates a structural requirement. |
| `FINFLOW_WORKFLOW_INVALID_STATE` | A state value is missing or not declared. |
| `FINFLOW_WORKFLOW_INVALID_TRANSITION` | The requested transition is not declared from the current state. |
| `FINFLOW_WORKFLOW_GUARD_REJECTED` | A required transition guard did not pass. |
| `FINFLOW_WORKFLOW_TERMINAL_STATE` | Ordinary transition was requested from a terminal state. |

## Requirements

- A failed workflow operation MUST identify one applicable portable code.
- It MAY include the current state and requested transition when disclosure is safe.
- It MUST NOT claim that state changed when the operation failed.

## Invariants

Every failure leaves workflow state unchanged.

## Open Questions

- Is a separate concurrency-conflict code needed at the domain level?

## Non-Goals

This document does not define transport status codes or implementation-specific exception hierarchies.

