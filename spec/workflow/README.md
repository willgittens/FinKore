# Workflow

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This domain defines lifecycle behavior through declared [states](states.md), [transitions](transitions.md), [guards](guards.md), [terminal states](terminal-states.md), [definition versions](versioning.md), [import](import.md), and [conflict preconditions](conflicts.md), independently of user interface or persistence.

## Requirements

- A Workflow must declare its States and exactly one initial State so creation of a new instance has one deterministic result.
- Every permitted State change must be declared as a directed Transition. Declaring `A → B` must not permit `B → A` unless that reverse Transition is also declared.
- A Transition Request must be validated before it changes current State.
- A Transition Request from a terminal State must fail with `FINKORE_WORKFLOW_TERMINAL_STATE`. Otherwise, an undeclared Transition Request must fail with `FINKORE_WORKFLOW_INVALID_TRANSITION`, and a request rejected by a Transition Guard must fail with `FINKORE_WORKFLOW_GUARD_REJECTED`.
- A versioned Workflow instance must remain bound to its declared Workflow Definition Version and must not silently switch to a newer definition.
- Workflow Import must preserve a declared existing current State and version binding instead of inferring a new instance from the initial State.
- Expected-current-state and expected-revision preconditions must reject stale Transition Requests without changing State.
- Every portable State identifier must be a nonempty, opaque, case-sensitive string; empty values use the boundary-specific definition, instance, or State error without mutation.

## Example

```text
DRAFT
  ↓
SUBMITTED
  ├── APPROVED
  └── REJECTED
```

## Invariants

A Workflow instance must have exactly one current State, and that State must belong to its Workflow definition. A versioned Workflow instance must be governed by its bound Workflow Definition Version. Failed import, mismatch, conflict, transition, terminal-state, or guard checks must not change current State.

## Non-Goals

This domain does not define screens, queues, persistence, process engines, or actor authorization. Core 2.0 defines Workflow definition identity, version identity, immutable instance binding, import of existing current State observations, and expected-state/revision conflict preconditions; it does not define optimistic locking, pessimistic locking, concurrent-transition winner selection, distributed coordination, database transaction isolation, Workflow migrations, state mapping across versions, or actor authorization.
