# Entity Mutability

## Status

Draft.

## Purpose

This document defines when financial entity data may change and how immutable lifecycle states constrain mutation.

## Terminology

An **immutable lifecycle state** is a state in which specified entity data cannot be changed directly. A **correction** rectifies history by adding new domain facts. A **reversal** adds a compensating action.

## Requirements

- A composing domain MUST declare which fields may change in each lifecycle state.
- A mutation MUST be rejected when the current state makes any targeted field immutable.
- A successful mutation SHOULD create an audit event describing financially relevant changes.
- A rejected mutation MUST leave all entity data and state unchanged.
- Entering an immutable state MUST NOT erase or detach prior audit history.
- Corrections and reversals MUST be explicit domain operations and MUST preserve the original action or value in history.
- Metadata MAY remain mutable in an otherwise immutable state only when the composing domain identifies it and preserves relevant auditability.

## Invariants

Immutable fields do not change through ordinary mutation while their immutability rule applies.

## Invalid Examples

- Editing the amount of a finalized entity in place.
- Relabeling an original transaction as its reversal.

## Errors

A prohibited mutation MUST report `FINFLOW_ENTITY_IMMUTABLE`.

## Open Questions

- Which metadata categories can safely remain mutable after financial finalization?
- Should corrections always create a related entity, or may some domains append a revision to the same identity?

