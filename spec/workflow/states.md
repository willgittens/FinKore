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

## Invariants

A Workflow instance MUST NOT occupy multiple current States simultaneously. A State change MUST occur only through a [Successful Transition](transitions.md).

## Invalid Examples

- A workflow definition with no initial state.
- Setting the current state directly to an undeclared value.

## Errors

Invalid definitions or state values MUST report an applicable code from [Workflow Errors](errors.md).

## Open Questions

- How should a future specification identify Workflow definition versions, migrate active instances, and determine transition behavior after a definition changes?

