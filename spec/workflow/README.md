# Workflow

## Status

**Draft**

## Purpose

This domain defines lifecycle behavior through declared [states](states.md), [transitions](transitions.md), [guards](guards.md), and [terminal states](terminal-states.md), independently of user interface or persistence.

## Requirements

- A Workflow MUST declare its States and exactly one initial State so creation of a new instance has one deterministic result.
- Every permitted State change MUST be declared as a directed Transition. Declaring `A → B` MUST NOT permit `B → A` unless that reverse Transition is also declared.
- A Transition Request MUST be validated before it changes current State.
- A Transition Request from a terminal State MUST fail with `FINFLOW_WORKFLOW_TERMINAL_STATE`. Otherwise, an undeclared Transition Request MUST fail with `FINFLOW_WORKFLOW_INVALID_TRANSITION`, and a request rejected by a Transition Guard MUST fail with `FINFLOW_WORKFLOW_GUARD_REJECTED`.

## Example

```text
DRAFT
  ↓
SUBMITTED
  ├── APPROVED
  └── REJECTED
```

## Invariants

A Workflow instance MUST have exactly one current State, and that State MUST belong to its Workflow definition.

## Non-Goals

This domain does not define screens, queues, persistence, process engines, or actor authorization.

