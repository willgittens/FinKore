# Workflow Transitions

## Status

Draft.

## Purpose

This document defines declared changes between workflow states.

## Terminology

**Source state** is the required current state. **Target state** is the state after a successful transition.

## Requirements

- A transition MUST identify a declared source state and target state.
- A requested transition MUST be allowed from the instance's current state.
- All applicable [guards](guards.md) MUST pass before the state changes.
- A successful transition MUST change the current state to its target exactly once.
- A failed transition MUST leave current state unchanged.
- Transition evaluation SHOULD produce enough domain context for an audit event without prescribing audit storage.

## Invariants

An undeclared source-to-target transition MUST NOT succeed. Validation and state change MUST behave as one domain operation from the observer's perspective.

## Examples

Given `DRAFT → SUBMITTED`, requesting that transition from `DRAFT` succeeds if all guards pass.

## Invalid Examples

Requesting `DRAFT → APPROVED` when only `DRAFT → SUBMITTED` is declared MUST fail.

## Errors

An unavailable transition MUST report `FINFLOW_WORKFLOW_INVALID_TRANSITION`. A failed guard MUST follow [Guards](guards.md).

## Open Questions

- Should transitions have stable identifiers distinct from source and target state pairs?

