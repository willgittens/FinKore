# Workflow

## Status

**Draft**

## Purpose

This domain defines lifecycle behavior through declared [states](states.md), [transitions](transitions.md), [guards](guards.md), and [terminal states](terminal-states.md), independently of user interface or persistence.

## Requirements

- A Workflow must declare its States and exactly one initial State so creation of a new instance has one deterministic result.
- Every permitted State change must be declared as a directed Transition. Declaring `A → B` must not permit `B → A` unless that reverse Transition is also declared.
- A Transition Request must be validated before it changes current State.
- A Transition Request from a terminal State must fail with `FINFLOW_WORKFLOW_TERMINAL_STATE`. Otherwise, an undeclared Transition Request must fail with `FINFLOW_WORKFLOW_INVALID_TRANSITION`, and a request rejected by a Transition Guard must fail with `FINFLOW_WORKFLOW_GUARD_REJECTED`.

## Example

```text
DRAFT
  ↓
SUBMITTED
  ├── APPROVED
  └── REJECTED
```

## Invariants

A Workflow instance must have exactly one current State, and that State must belong to its Workflow definition.

## Non-Goals

This domain does not define screens, queues, persistence, process engines, or actor authorization. FinFlow Core Draft 0.1 also does not define optimistic locking, pessimistic locking, concurrent-transition conflict resolution, distributed coordination, database transaction isolation, Workflow definition versions, Workflow migrations, treatment of entities created under older definitions, or transition behavior after a definition changes.

