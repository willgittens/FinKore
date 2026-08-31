# Terminal States

## Status

**Draft**

## Purpose

This document defines States with no outgoing Transitions in their Workflow definition.

## Requirements

- A Workflow definition MUST explicitly identify each terminal State.
- A terminal State MUST NOT have an outgoing Transition in that Workflow definition.
- A Transition Request from a terminal State MUST fail with `FINFLOW_WORKFLOW_TERMINAL_STATE`.
- Terminal status MUST be determined from the Workflow definition, not inferred from naming.

## Invariants

Once a Workflow instance enters a terminal State, no further Transition in that Workflow definition MUST succeed.

## Examples

`APPROVED` and `REJECTED` MAY both be terminal states even though their domain outcomes differ.

## Invalid Examples

Treating a state named `COMPLETE` as terminal without declaring it terminal is invalid.

## Errors

An ordinary transition from a terminal state MUST report `FINFLOW_WORKFLOW_TERMINAL_STATE`.

## Non-Goals

This document does not determine whether entity fields or operational metadata become immutable in a terminal State; see [Entity Mutability](../entities/mutability.md). It also does not define Correction, Reversal, Void, Cancellation, Supersession, or Adjustment behavior.

