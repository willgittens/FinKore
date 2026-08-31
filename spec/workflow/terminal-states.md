# Terminal States

## Status

**Draft**

## Purpose

This document defines States with no outgoing Transitions in their Workflow definition.

## Requirements

- A Workflow definition MUST explicitly identify each terminal State.
- A terminal State MUST NOT have an outgoing Transition in that Workflow definition.
- A Transition Request from a terminal State MUST fail with `FINFLOW_WORKFLOW_TERMINAL_STATE`.
- A correction or reversal, if a composing specification defines one, is a distinct domain operation and MUST NOT be represented as an outgoing Transition from a terminal State in that Workflow.
- Terminal status MUST be determined from the Workflow definition, not inferred from naming.

## Invariants

Once a Workflow instance enters a terminal State, no further Transition in that Workflow definition MUST succeed.

## Examples

`APPROVED` and `REJECTED` MAY both be terminal states even though their domain outcomes differ.

## Invalid Examples

Treating a state named `COMPLETE` as terminal without declaring it terminal is invalid.

## Errors

An ordinary transition from a terminal state MUST report `FINFLOW_WORKFLOW_TERMINAL_STATE`.

## Open Questions

- Should correction and reversal use separate workflows or specially classified transitions?

## Non-Goals

This document does not determine whether entity fields become immutable in a terminal state; see [Entity Mutability](../entities/mutability.md).

