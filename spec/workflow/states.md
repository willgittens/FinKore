# Workflow States

## Status

**FinKore Core 1.0 stable.**

## Purpose

This document defines named lifecycle conditions and workflow initialization.

## Requirements

- **WORKFLOW-STATES-001** — Each state MUST have an identifier unique within its workflow definition.
- **WORKFLOW-STATES-002** — A Workflow definition MUST declare exactly one initial State.
- **WORKFLOW-STATES-003** — A newly created Workflow instance MUST begin in the declared initial State. Importing an instance with existing history is a separate operation whose resulting State MUST be defined by the composing specification.
- **WORKFLOW-STATES-004** — The current state MUST be one of the declared states.
- **WORKFLOW-STATES-005** — State identifiers MUST be treated as domain names, not presentation labels.
- **WORKFLOW-STATES-006** — A definition SHOULD document the domain meaning of every state.
- **WORKFLOW-STATES-007** — A Workflow instance MUST have exactly one current State.
- **WORKFLOW-STATES-008** — The bounded portable Workflow definition MUST explicitly supply its terminal-State and Transition collections, including when either collection is empty. Omission, null, or a non-array collection MUST use `FINKORE_WORKFLOW_INVALID_DEFINITION`. Native convenience constructors MAY supply documented empty defaults, but portable parsing MUST preserve the distinction between omission and an explicit empty collection.
- **WORKFLOW-STATES-009** — Every portable Workflow State identifier MUST be a nonempty string, including identifiers in the declared State collection, initial and terminal State declarations, Transition endpoints, a Workflow instance's current State, a requested target State, and an expected-current-State precondition. An empty identifier in a definition MUST use `FINKORE_WORKFLOW_INVALID_DEFINITION`; an empty current State in an instance MUST use `FINKORE_WORKFLOW_INVALID_INSTANCE`; and an empty requested target or expected-current-State precondition MUST use `FINKORE_WORKFLOW_INVALID_STATE`. Existing error priority and failure non-mutation requirements continue to apply. Nonempty State identifiers remain opaque and case-sensitive.

## Invariants

A Workflow instance must not occupy multiple current States simultaneously. A State change must occur only through a [Successful Transition](transitions.md). For a versioned Workflow instance, the current State is interpreted under the instance's [Bound Workflow Definition Version](versioning.md).

## Invalid Examples

- A workflow definition with no initial state.
- Setting the current state directly to an undeclared value.

## Errors

Invalid definitions or state values must report an applicable code from [Workflow Errors](errors.md).

### Native definition boundaries

The definition requirements apply equally to public native construction and
portable parsing. A definition with an undeclared initial State is an invalid
definition, not a valid definition that can create an instance in that State.
The same boundary includes unique declared States, terminal declarations,
Transition endpoints, guards, and version identity declarations under their
owning requirements. Native construction cannot provide a validation bypass
when that definition is later used by creation, import, or transition.

Definition failures use `FINKORE_WORKFLOW_INVALID_DEFINITION`. A malformed
instance, including its revision, instead uses
`FINKORE_WORKFLOW_INVALID_INSTANCE`, preceding a simultaneous version mismatch
under **WORKFLOW-ERROR-007**. An undeclared current State in an otherwise
well-formed instance retains `FINKORE_WORKFLOW_INVALID_STATE`. Constructor
signatures and validation reuse are implementation choices; accepted declarations
retain their existing ownership and version-binding guarantees.

## Open Questions

- How should a future migration specification map active instances and states between Workflow Definition Versions?
