# Entity Lifecycle

## Status

Draft.

## Purpose

This document defines how a financial entity progresses through declared domain states.

## Requirements

- A financial entity MUST declare or reference a [workflow](../workflow/README.md).
- A new entity MUST begin in that workflow's initial state.
- Current state MUST change only through a valid workflow transition.
- A lifecycle transition SHOULD create an [audit event](../audit/events.md).
- A composing domain MUST define the domain consequences of each state.
- Correction and reversal behavior MUST preserve prior domain history and MUST be explicitly defined before use.

## Invariants

The entity has exactly one current lifecycle state. A failed transition leaves both current state and entity data unchanged.

## Examples

```text
DRAFT → SUBMITTED → APPROVED
                  └→ REJECTED
```

## Invalid Examples

- Assigning `APPROVED` directly when no permitted transition exists.
- Erasing a completed lifecycle to perform a correction.

## Errors

Workflow failures use [Workflow Errors](../workflow/errors.md); entity-specific constraints use [Entity Errors](errors.md).

## Open Questions

- How should imported entities with pre-existing lifecycle history establish their initial FinFlow state?

