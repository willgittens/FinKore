# Workflow Transitions

## Status

**Draft**

## Purpose

This document defines declared changes between workflow states.

## Terminology

**Source State** is the required current State. **Target State** is the State after success. A **Transition Request** asks to perform a declared Transition. A **Successful Transition** changes current State after validation; a **Rejected Transition** does not.

## Requirements

- **WORKFLOW-TRANSITION-001** — A Transition MUST identify one declared Source State and one declared Target State.
- **WORKFLOW-TRANSITION-002** — A Transition is directed; declaring one direction MUST NOT declare or permit its reverse.
- **WORKFLOW-TRANSITION-003** — A Transition Request MUST match a Transition whose Source State is the instance's current State.
- **WORKFLOW-TRANSITION-004** — All applicable [Transition Guards](guards.md) MUST pass before the State changes.
- **WORKFLOW-TRANSITION-005** — A Successful Transition MUST change the current State to its Target State exactly once.
- **WORKFLOW-TRANSITION-006** — A Rejected Transition MUST leave current State unchanged.
- **WORKFLOW-TRANSITION-007** — Transition validation and State change MUST be observable as one domain operation, with no intermediate State change exposed.
- A composing domain should identify the context needed to describe a Successful Transition in an [Audit Event](../audit/events.md).

## Invariants

An undeclared Source-State-to-Target-State Transition must not succeed. Validation and State change must behave as one domain operation from the observer's perspective.

## Examples

The following concurrency example is non-normative:

```text
Current state: SUBMITTED
Process A requests: SUBMITTED → APPROVED
Process B requests: SUBMITTED → REJECTED
```

FinFlow Core Draft 0.1 defines whether each request is valid from `SUBMITTED`; it does not determine which concurrent request wins. That decision belongs to the application, persistence layer, or a future concurrency specification.

Given `DRAFT → SUBMITTED`, requesting that transition from `DRAFT` succeeds if all guards pass.

## Invalid Examples

Requesting `DRAFT → APPROVED` when only `DRAFT → SUBMITTED` is declared must fail.

## Errors

Except for a request from a terminal State, an undeclared Transition Request must report `FINFLOW_WORKFLOW_INVALID_TRANSITION`. A request from a terminal State follows [Terminal States](terminal-states.md), and a failed Transition Guard follows [Guards](guards.md).

## Open Questions

- Should transitions have stable identifiers distinct from source and target state pairs?
- What conflict semantics should a future concurrency specification define for simultaneous Transition Requests from the same current State?

