# Workflow

## Status

Draft.

## Purpose

This domain defines lifecycle behavior through declared [states](states.md), [transitions](transitions.md), [guards](guards.md), and [terminal states](terminal-states.md), independently of user interface or persistence.

## Requirements

- A workflow MUST declare its states and exactly one initial state.
- Every permitted state change MUST be declared as a transition.
- A transition MUST be validated before it changes current state.
- An undeclared or guard-rejected transition MUST fail predictably.

## Example

```text
DRAFT
  ↓
SUBMITTED
  ├── APPROVED
  └── REJECTED
```

## Invariants

At any point, a workflow instance has exactly one current state from its workflow definition.

## Non-Goals

This domain does not define screens, queues, persistence, process engines, or actor authorization.

