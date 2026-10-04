# Workflow Conflicts

## Status

**FinKore Core 2.0 stable.**

## Purpose

This document defines optional Transition Request preconditions that let a caller
state which Workflow instance observation it expected before requesting a state
change.

These preconditions are domain-level conflict checks. They do not define
database locks, transaction isolation, distributed concurrency, or retry policy.

## Terminology

**Expected Current State** is a caller-supplied State identifier that must match
the instance's current State before a Transition Request can proceed.

**Expected Workflow Instance Revision** is a caller-supplied opaque Workflow
instance revision that must match the observed Workflow instance revision before
a Transition Request can proceed.

**Workflow State Conflict** is a failed Transition Request caused by an expected
current State or expected Workflow instance revision not matching the actual
Workflow instance observation.

## Requirements

- **WORKFLOW-CONFLICT-001** - A Transition Request that omits Expected Current State MUST NOT perform an expected-current-state precondition check. Omission MUST NOT imply the initial State, latest State, any terminal State, or any implementation default.
- **WORKFLOW-CONFLICT-002** - A Transition Request that supplies Expected Current State MUST validate it as a declared State in the instance's governing Workflow Definition Version before using it as a precondition.
- **WORKFLOW-CONFLICT-003** - A Transition Request that supplies Expected Current State MUST fail with `FINKORE_WORKFLOW_STATE_CONFLICT` when the supplied value does not exactly match the instance's current State before transition validation.
- **WORKFLOW-CONFLICT-004** - A Transition Request that omits Expected Workflow Instance Revision MUST NOT perform an expected-revision precondition check. Omission MUST NOT imply a latest revision, storage version, Entity Revision, or implementation default.
- **WORKFLOW-CONFLICT-005** - A Transition Request that supplies Expected Workflow Instance Revision MUST compare it exactly with the observed Workflow Instance Revision before transition validation. If the observed instance has no Workflow Instance Revision, or if the values differ, the request MUST fail with `FINKORE_WORKFLOW_STATE_CONFLICT`.
- **WORKFLOW-CONFLICT-006** - A Transition Request that passes expected-current-state and expected-revision preconditions MUST still satisfy all applicable terminal-state, declared-transition, target-state, and guard requirements before the current State can change.
- **WORKFLOW-CONFLICT-007** - A Transition Request rejected by an expected-current-state or expected-revision conflict MUST leave current State, Bound Workflow Definition Version, and Workflow Instance Revision unchanged.
- **WORKFLOW-CONFLICT-008** - Expected-current-state and expected-revision preconditions MUST NOT be treated as storage locks, distributed coordination, database transaction isolation, or a rule for selecting a winner between concurrent Transition Requests.

## Invariants

Conflict preconditions can prevent a Transition Request from proceeding, but they
cannot authorize a transition that would otherwise be invalid under the Workflow
definition, version binding, terminal-state, transition, or guard rules.

## Errors

Omission in **WORKFLOW-CONFLICT-001** and **WORKFLOW-CONFLICT-004** means no
precondition was supplied. Explicit null is supplied input, not omission.
Null Expected Current State is not a declared State and uses
`FINKORE_WORKFLOW_INVALID_STATE` under **WORKFLOW-CONFLICT-002**. Null Expected
Workflow Instance Revision does not match a valid observed revision, including
an absent revision, and uses `FINKORE_WORKFLOW_STATE_CONFLICT` under
**WORKFLOW-CONFLICT-005**. A malformed revision on the observed instance itself
remains `FINKORE_WORKFLOW_INVALID_INSTANCE` under **WORKFLOW-ERROR-005**.
Combined failures retain the complete priority in **WORKFLOW-ERROR-007**;
for example, version mismatch precedes an invalid expected State.

Native APIs and fixture translators must retain this distinction, whether
through separate overloads, an omission sentinel, or explicit member presence.
No particular optional-argument representation is prescribed.

Expected-current-state and expected-revision mismatches use
`FINKORE_WORKFLOW_STATE_CONFLICT` as defined by [Workflow Errors](errors.md).

## Non-Goals

This document does not define persistence revisions, revision generation,
revision ordering, automatic retries, conflict resolution policy, locking,
distributed coordination, or migration across Workflow Definition Versions.
