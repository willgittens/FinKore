# Workflow States

## Status

**Draft**

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

## Invariants

A Workflow instance must not occupy multiple current States simultaneously. A State change must occur only through a [Successful Transition](transitions.md). For a versioned Workflow instance, the current State is interpreted under the instance's [Bound Workflow Definition Version](versioning.md).

## Invalid Examples

- A workflow definition with no initial state.
- Setting the current state directly to an undeclared value.

## Errors

Invalid definitions or state values must report an applicable code from [Workflow Errors](errors.md).

## Open Questions

- How should a future migration specification map active instances and states between Workflow Definition Versions?
