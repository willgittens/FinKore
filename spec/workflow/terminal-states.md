# Terminal States

## Status

Draft.

## Purpose

This document defines states after which ordinary workflow progression ends.

## Requirements

- A workflow definition MUST explicitly identify each terminal state.
- A terminal state MUST NOT have ordinary outgoing transitions.
- A request to leave a terminal state MUST fail unless a composing specification declares a distinct correction or reversal mechanism.
- Terminal status MUST be determined from the workflow definition, not inferred from naming.

## Invariants

Entering a terminal state ends ordinary transition processing for that workflow instance.

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

