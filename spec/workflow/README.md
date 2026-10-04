# Workflow

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

Workflow describes a lifecycle: its states, permitted changes, and the
conditions that allow a change. A declared transition is directed; allowing
`DRAFT → SUBMITTED` does not by itself allow the reverse.

## Documents

Start with states and transitions. Read guards and terminal states next, then
versioning, import, and conflicts when working with existing instances.

| Document | What you will learn |
| --- | --- |
| [States](states.md) | Declared states, the initial state, and the current state |
| [Transitions](transitions.md) | Permitted directed changes and failure atomicity |
| [Guards](guards.md) | Conditions checked before accepting a transition |
| [Terminal states](terminal-states.md) | States from which a transition cannot leave |
| [Versioning](versioning.md) | The definition version that continues to govern an instance |
| [Import](import.md) | Validating an existing instance without restarting its lifecycle |
| [Conflicts](conflicts.md) | Rejecting requests based on stale state or revision observations |
| [Errors](errors.md) | Portable failure codes and their priority |

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

This domain does not define screens, queues, persistence, process engines, or
actor authorization. Locking, concurrent-transition winner selection,
distributed coordination, database isolation, Workflow migration, and state
mapping across versions remain outside Core scope.
