# Entity Lifecycle

## Status

**Draft**

## Purpose

This document defines how a Financial Entity progresses through declared domain States.

## Requirements

- A Financial Entity MUST declare or reference a [Workflow](../workflow/README.md).
- A newly created Financial Entity MUST begin in that Workflow's initial State. Import with existing history follows the separate rule in [Workflow States](../workflow/states.md).
- Current State MUST change only through a Successful Transition.
- Audit requirements for lifecycle Transitions MUST be declared as specified by [Financial Entities](README.md).
- A composing domain MUST define the domain consequences of each state.

## Invariants

A Financial Entity MUST have exactly one current lifecycle State. A Rejected Transition MUST leave both current State and entity data unchanged.

## Examples

```text
DRAFT → SUBMITTED → APPROVED
                  └→ REJECTED
```

## Invalid Examples

- Assigning `APPROVED` directly when no permitted transition exists.

## Errors

Workflow failures use [Workflow Errors](../workflow/errors.md); entity-specific constraints use [Entity Errors](errors.md).

## Open Questions

- How should imported entities with pre-existing lifecycle history establish their initial FinFlow state?

## Non-Goals

FinFlow Core Draft 0.1 does not define Correction, Reversal, Void, Cancellation, Supersession, or Adjustment behavior.

