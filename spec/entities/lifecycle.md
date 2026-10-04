# Entity Lifecycle

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines how a Financial Entity progresses through declared domain States.

## Requirements

- **ENTITY-LIFECYCLE-001** — A Financial Entity MUST declare or reference a [Workflow](../workflow/README.md).
- **ENTITY-LIFECYCLE-002** — A newly created Financial Entity MUST begin in that Workflow's initial State. Import with existing history follows the separate rule in [Workflow States](../workflow/states.md).
- **ENTITY-LIFECYCLE-003** — Current State MUST change only through a Successful Transition.
- **ENTITY-LIFECYCLE-004** — Audit requirements for lifecycle Transitions MUST be declared as specified by [Financial Entities](README.md).
- **ENTITY-LIFECYCLE-005** — A composing domain MUST define the domain consequences of each state.
- **ENTITY-LIFECYCLE-006** — A Financial Entity MUST have exactly one current lifecycle State.
- **ENTITY-LIFECYCLE-007** — In the bounded Entity representation, an existing observation's missing, null, empty, or non-string current State MUST use `FINKORE_WORKFLOW_INVALID_INSTANCE`. A nonempty string identifying an undeclared State MUST use `FINKORE_WORKFLOW_INVALID_STATE`. Consuming Entity operations MUST preserve Workflow validation priority under **WORKFLOW-ERROR-007**, including definition validation before instance validation, and MUST preserve existing observations on failure.
- **ENTITY-LIFECYCLE-008** — When a bounded Entity Transition Request supplies object-valued guard facts, the Entity transition MUST pass that exact value to the referenced Workflow Transition Guard evaluation. Omission MUST represent no supplied facts. The operation MUST NOT derive guard facts implicitly from Entity data, Approval history, authorization services, wall-clock state, or other ambient state. Supplied facts MUST NOT create a Guard where the referenced Workflow declares none, and failed guard evaluation MUST preserve the complete Entity and supplied facts.
- **ENTITY-LIFECYCLE-009** — In Core 2.0, a supplied Entity Transition `facts` value MUST be an object. A supplied null, array, string, number, or Boolean MUST fail with `FINKORE_WORKFLOW_INVALID_CONTEXT` according to **WORKFLOW-ERROR-008**. Omission continues to mean that no facts were supplied. The error and preservation semantics are part of the Core 2.0 contract for the existing canonical `finkore.entity.transition` operation; no alias or replacement operation is introduced.

## Invariants

A Financial Entity must have exactly one current lifecycle State. A Rejected Transition must leave both current State and entity data unchanged.

## Guard facts and resulting-State validation

**ENTITY-LIFECYCLE-008** composes the existing Workflow guard contract rather
than defining a second evaluator. An omitted fact selected by a declared Guard
causes the existing `FINKORE_WORKFLOW_GUARD_REJECTED` result. A valid supplied
object is compared under the referenced Workflow's rules and is request context,
not Entity data to persist. A supplied object has no effect on an unguarded
Transition.

Core 2.0 closes the former malformed-context gap: supplied non-object `facts`
is `FINKORE_WORKFLOW_INVALID_CONTEXT`. It must not be repaired or treated as
omission. The priority in **WORKFLOW-ERROR-008** preserves every earlier
definition, instance, version, State, conflict, terminal, and Transition error,
and places invalid context before guard rejection.

After the referenced Workflow has accepted the Transition Request, including
its guard evaluation, the complete proposed Entity at the target State remains
subject to [Entity Validation](validation.md). A target-State validation failure
uses `FINKORE_ENTITY_VALIDATION_FAILED` and leaves identity, type, data, State,
Workflow binding, and supplied facts unchanged. An earlier primary Workflow
failure is preserved under **ENTITY-ERROR-004**; target-State validation does not
replace invalid-State, terminal-State, invalid-Transition, or guard-rejection
results.

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
unversioned Entity declarations follows **ENTITY-DEFINITION-002**, separately
from Workflow versioning.

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
Void, Supersession, Cancellation, or Adjustment behavior. Core 2.0 Entity
Evolution defines portable correction, reversal, void, and supersession
distinctions; composing domains still define concrete lifecycle eligibility and
consequences.
