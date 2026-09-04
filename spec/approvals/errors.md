# Approval Errors

## Status

**Draft**

## Purpose

This document defines initial portable approval failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_APPROVAL_REQUIRED` | A domain action requires approval that is not satisfied. |
| `FINKORE_APPROVAL_INVALID_DECISION` | A proposed decision is missing, malformed, or not permitted. |
| `FINKORE_APPROVAL_INELIGIBLE_ACTOR` | The deciding actor does not satisfy the requirement. |
| `FINKORE_APPROVAL_INVALID_CHAIN` | A chain definition or evaluation is structurally invalid. |
| `FINKORE_APPROVAL_CONDITION_UNRESOLVED` | A required condition cannot be evaluated from available facts. |

## Requirements

- **APPROVAL-ERROR-001** — A failed Approval Decision MUST NOT change an Approval Requirement or Approval Chain outcome.
- **APPROVAL-ERROR-002** — Error details MAY identify the affected requirement.
- **APPROVAL-ERROR-004** — Error details MUST NOT disclose restricted eligibility or decision data.
- **APPROVAL-ERROR-005** — A failed Approval operation MUST leave existing committed Approval Decisions unchanged.
- **APPROVAL-ERROR-003** — Missing approval MUST be distinguishable from explicit rejection.

## Invariants

A failed Approval operation must leave existing committed Approval Decisions unchanged.

## Open Questions

- Should explicit rejection have its own portable blocking code?

## Non-Goals

This catalog does not define authorization failures or transport representations.

