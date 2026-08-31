# Workflow States

## Status

Draft.

## Purpose

This document defines named lifecycle conditions and workflow initialization.

## Requirements

- Each state MUST have an identifier unique within its workflow definition.
- A workflow MUST declare exactly one initial state.
- A new workflow instance MUST begin in the declared initial state unless a composing specification explicitly defines import of existing history.
- The current state MUST be one of the declared states.
- State identifiers MUST be treated as domain names, not presentation labels.
- A definition SHOULD document the domain meaning of every state.

## Invariants

A workflow instance MUST NOT occupy multiple current states simultaneously. A state change MUST occur only through a successful [transition](transitions.md).

## Invalid Examples

- A workflow definition with no initial state.
- Setting the current state directly to an undeclared value.

## Errors

Invalid definitions or state values MUST report an applicable code from [Workflow Errors](errors.md).

## Open Questions

- Should future revisions standardize versioning of workflow definitions?

