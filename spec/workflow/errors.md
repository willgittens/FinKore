# Workflow Errors

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines initial portable workflow failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_WORKFLOW_INVALID_DEFINITION` | The workflow definition violates a structural requirement. |
| `FINKORE_WORKFLOW_INVALID_INSTANCE` | A supplied Workflow instance observation is malformed or lacks required binding/revision structure. |
| `FINKORE_WORKFLOW_INVALID_STATE` | A state value is missing or not declared. |
| `FINKORE_WORKFLOW_INVALID_TRANSITION` | The requested directed Transition is not declared from the current State. |
| `FINKORE_WORKFLOW_GUARD_REJECTED` | A required Transition Guard did not pass. |
| `FINKORE_WORKFLOW_TERMINAL_STATE` | A Transition Request was made from a terminal State. |
| `FINKORE_WORKFLOW_VERSION_MISMATCH` | A versioned Workflow operation supplied a definition identity or version identity that does not match the instance binding. |
| `FINKORE_WORKFLOW_STATE_CONFLICT` | A Transition Request expected a different current State or Workflow Instance Revision than the observed instance has. |
| `FINKORE_WORKFLOW_INVALID_CONTEXT` | Supplied Workflow Transition evaluation context is malformed. |

## Requirements

- **WORKFLOW-ERROR-001** — A failed Workflow operation MUST identify one applicable portable code. For a Transition Request from a terminal State, `FINKORE_WORKFLOW_TERMINAL_STATE` takes precedence over `FINKORE_WORKFLOW_INVALID_TRANSITION`.
- **WORKFLOW-ERROR-002** — Error context MAY include the current State and requested Transition when disclosure is safe.
- **WORKFLOW-ERROR-003** — It MUST NOT claim that state changed when the operation failed.
- **WORKFLOW-ERROR-004** — A versioned Workflow operation whose supplied definition identity or version identity does not exactly match the instance binding MUST fail with `FINKORE_WORKFLOW_VERSION_MISMATCH`. It MUST NOT report invalid state, invalid transition, guard rejection, or terminal-state failure as the primary code for the same mismatch, and it MUST leave the current State and binding unchanged.
- **WORKFLOW-ERROR-005** — A malformed Workflow instance observation, including a missing current State, missing required version binding, duplicate binding, or malformed Workflow Instance Revision, MUST fail with `FINKORE_WORKFLOW_INVALID_INSTANCE`. An undeclared State value in an otherwise well-formed observation MUST remain `FINKORE_WORKFLOW_INVALID_STATE`.
- **WORKFLOW-ERROR-006** — An expected-current-state or expected-revision precondition mismatch MUST fail with `FINKORE_WORKFLOW_STATE_CONFLICT`. It MUST NOT be reported as invalid state, invalid transition, guard rejection, terminal-state failure, or version mismatch.
- **WORKFLOW-ERROR-007** — When more than one Workflow failure category applies to the same operation, the primary portable error code MUST be selected in this order: invalid definition, invalid instance observation, version mismatch, invalid State value, expected-state or expected-revision conflict, terminal State, invalid Transition, then guard rejection. This ordering preserves `WORKFLOW-ERROR-001` terminal-state precedence over invalid Transition after earlier structural, binding, State, and conflict preconditions have passed.
- **WORKFLOW-ERROR-008** — When a bounded Entity Transition Request supplies `facts`, the value MUST be an object. Explicit null, arrays, strings, numbers, and Booleans MUST fail with `FINKORE_WORKFLOW_INVALID_CONTEXT`; omission remains distinct and means that no facts were supplied. Invalid context is evaluated only after **WORKFLOW-ERROR-007** has established a valid declared Transition through invalid-Transition priority and before a declared Guard can reject. Therefore invalid definition, invalid instance, version mismatch, invalid State, state conflict, terminal State, and invalid Transition remain primary when simultaneously applicable; invalid context is primary over guard rejection. Failure MUST preserve the Workflow instance, Entity observation, binding, revision, data, and supplied facts.

## Invariants

A failed Workflow operation must leave current State unchanged.

Under **WORKFLOW-STATES-009**, an empty identifier in definition structure is
an invalid definition, an empty observed current State is an invalid instance,
and an empty requested or expected State value is an invalid State. These
categories follow the priority in **WORKFLOW-ERROR-007**.

The extended Core 2.0 priority is invalid definition, invalid instance
observation, version mismatch, invalid State value, expected-state or
expected-revision conflict, terminal State, invalid Transition, invalid supplied
context, then guard rejection. Context validation does not create a Guard on an
unguarded Transition; a malformed supplied context is nevertheless rejected at
the Entity operation boundary once the requested Transition has passed the
earlier checks.

## Non-Goals

This document does not define transport status codes, implementation-specific exception hierarchies, migration errors, storage-lock errors, retry policies, or distributed concurrency-conflict errors. FinKore does not select a winner between concurrent Transition Requests.
