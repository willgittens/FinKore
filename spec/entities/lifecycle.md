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

Referencing a versioned Workflow under **ENTITY-LIFECYCLE-001** also applies
**WORKFLOW-VERSION-007** through **WORKFLOW-VERSION-011**. Creation records the
initial binding; subsequent transitions and observations preserve it. Existing
Entity observations supplied for reconstruction, import, mutation, or evolution
cannot lose or derive that binding from a replacement definition. A versioned
observation without its required binding uses
`FINKORE_WORKFLOW_INVALID_INSTANCE`; a well-formed binding that disagrees with
the supplied definition uses `FINKORE_WORKFLOW_VERSION_MISMATCH`, following
Workflow priority and **ENTITY-ERROR-004**. Failure preserves Entity State,
data, and binding.

The specification does not prescribe a production Entity envelope. The
[conformance convention](../../conformance/conventions.md) records the binding
inside each versioned Entity observation so the actual output can be reused.
Unversioned observations do not acquire an invented version. Ownership of
unversioned Entity declarations is a separate 0.9.5 contract decision; it does
not follow solely from Workflow versioning.

```text
DRAFT → SUBMITTED → APPROVED
                  └→ REJECTED
```

## Invalid Examples

- Assigning `APPROVED` directly when no permitted transition exists.

## Errors

Workflow failures use [Workflow Errors](../workflow/errors.md); entity-specific constraints use [Entity Errors](errors.md).

## Open Questions

- Historical replay and provenance beyond the explicit observation boundary in
  [Entity Import](import.md) remain outside the current contract.

## Non-Goals

Lifecycle State semantics do not by themselves define Correction, Reversal,
Void, Supersession, Cancellation, or Adjustment behavior. Core 0.9 release candidate Entity
Evolution defines portable correction, reversal, void, and supersession
distinctions; composing domains still define concrete lifecycle eligibility and
consequences.
