# Workflow States

## Status

**Draft**

## Purpose

This document defines named lifecycle conditions and workflow initialization.

## Requirements

- Each state MUST have an identifier unique within its workflow definition.
- A Workflow definition MUST declare exactly one initial State.
- A newly created Workflow instance MUST begin in the declared initial State. Importing an instance with existing history is a separate operation whose resulting State MUST be defined by the composing specification.
- The current state MUST be one of the declared states.
- State identifiers MUST be treated as domain names, not presentation labels.
- A definition SHOULD document the domain meaning of every state.

## Invariants

A Workflow instance MUST NOT occupy multiple current States simultaneously. A State change MUST occur only through a [Successful Transition](transitions.md).

## Invalid Examples

- A workflow definition with no initial state.
- Setting the current state directly to an undeclared value.

## Errors

Invalid definitions or state values MUST report an applicable code from [Workflow Errors](errors.md).

## Open Questions

- Should future revisions standardize versioning of workflow definitions?

