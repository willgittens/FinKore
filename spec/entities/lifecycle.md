# Entity Lifecycle

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines how a Financial Entity progresses through declared domain States.

## Requirements

- **ENTITY-LIFECYCLE-001** — A Financial Entity MUST declare or reference a [Workflow](../workflow/README.md).
- **ENTITY-LIFECYCLE-002** — A newly created Financial Entity MUST begin in that Workflow's initial State. Import with existing history follows the separate rule in [Workflow States](../workflow/states.md).
- **ENTITY-LIFECYCLE-003** — Current State MUST change only through a Successful Transition.
- **ENTITY-LIFECYCLE-004** — Audit requirements for lifecycle Transitions MUST be declared as specified by [Financial Entities](README.md).
- **ENTITY-LIFECYCLE-005** — A composing domain MUST define the domain consequences of each state.
- **ENTITY-LIFECYCLE-006** — A Financial Entity MUST have exactly one current lifecycle State.

## Invariants

A Financial Entity must have exactly one current lifecycle State. A Rejected Transition must leave both current State and entity data unchanged.

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

- How should imported entities with pre-existing lifecycle history establish their initial FinKore state?

## Non-Goals

Lifecycle State semantics do not by themselves define Correction, Reversal,
Void, Supersession, Cancellation, or Adjustment behavior. Core 0.9 release candidate Entity
Evolution defines portable correction, reversal, void, and supersession
distinctions; composing domains still define concrete lifecycle eligibility and
consequences.
