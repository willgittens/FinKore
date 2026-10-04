# Terminal States

## Status

**FinKore Core 2.0 stable.**

## Purpose

This document defines States with no outgoing Transitions in their Workflow definition.

## Requirements

- **WORKFLOW-TERMINAL-001** — A Workflow definition MUST explicitly identify each terminal State.
- **WORKFLOW-TERMINAL-002** — A terminal State MUST NOT have an outgoing Transition in that Workflow definition.
- **WORKFLOW-TERMINAL-003** — A Transition Request from a terminal State MUST fail with `FINKORE_WORKFLOW_TERMINAL_STATE`.
- **WORKFLOW-TERMINAL-004** — Terminal status MUST be determined from the Workflow definition, not inferred from naming.

## Invariants

Once a Workflow instance enters a terminal State, no further Transition in that Workflow definition must succeed.

## Examples

`APPROVED` and `REJECTED` may both be terminal states even though their domain outcomes differ.

## Invalid Examples

Treating a state named `COMPLETE` as terminal without declaring it terminal is invalid.

## Errors

An ordinary transition from a terminal state must report `FINKORE_WORKFLOW_TERMINAL_STATE`.

## Non-Goals

This document does not determine whether entity fields or operational metadata become immutable in a terminal State; see [Entity Mutability](../entities/mutability.md). It also does not define Correction, Reversal, Void, Cancellation, Supersession, or Adjustment behavior.

