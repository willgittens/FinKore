# Approval Errors

## Status

Draft.

## Purpose

This document defines initial portable approval failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_APPROVAL_REQUIRED` | A domain action requires approval that is not satisfied. |
| `FINFLOW_APPROVAL_INVALID_DECISION` | A proposed decision is missing, malformed, or not permitted. |
| `FINFLOW_APPROVAL_INELIGIBLE_ACTOR` | The deciding actor does not satisfy the requirement. |
| `FINFLOW_APPROVAL_INVALID_CHAIN` | A chain definition or evaluation is structurally invalid. |
| `FINFLOW_APPROVAL_CONDITION_UNRESOLVED` | A required condition cannot be evaluated from available facts. |

## Requirements

- A failed decision MUST NOT change the requirement or chain outcome.
- Error details MAY identify the affected requirement, but MUST NOT disclose restricted eligibility or decision data.
- Missing approval MUST be distinguishable from explicit rejection.

## Invariants

Failure leaves existing committed decisions unchanged.

## Open Questions

- Should explicit rejection have its own portable blocking code?

## Non-Goals

This catalog does not define authorization failures or transport representations.

