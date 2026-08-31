# Workflow Errors

## Status

**Draft**

## Purpose

This document defines initial portable workflow failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_WORKFLOW_INVALID_DEFINITION` | The workflow definition violates a structural requirement. |
| `FINFLOW_WORKFLOW_INVALID_STATE` | A state value is missing or not declared. |
| `FINFLOW_WORKFLOW_INVALID_TRANSITION` | The requested directed Transition is not declared from the current State. |
| `FINFLOW_WORKFLOW_GUARD_REJECTED` | A required Transition Guard did not pass. |
| `FINFLOW_WORKFLOW_TERMINAL_STATE` | A Transition Request was made from a terminal State. |

## Requirements

- A failed Workflow operation MUST identify one applicable portable code. For a Transition Request from a terminal State, `FINFLOW_WORKFLOW_TERMINAL_STATE` takes precedence over `FINFLOW_WORKFLOW_INVALID_TRANSITION`.
- Error context MAY include the current State and requested Transition when disclosure is safe.
- It MUST NOT claim that state changed when the operation failed.

## Invariants

A failed Workflow operation MUST leave current State unchanged.

## Open Questions

- Is a separate concurrency-conflict code needed at the domain level?

## Non-Goals

This document does not define transport status codes or implementation-specific exception hierarchies.

