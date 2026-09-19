# Entity Mutability

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines how declared field-level mutability rules constrain Financial Entity Mutation.

## Terminology

**Immutable data** is entity data that a composing domain or lifecycle policy declares cannot be changed in the current State. A terminal State, immutable financial data, and a globally immutable object are distinct concepts.

## Requirements

- **ENTITY-MUTABILITY-001** — A composing domain MUST declare which fields may change in each lifecycle state.
- **ENTITY-MUTABILITY-002** — A mutation MUST be rejected when the current state makes any targeted field immutable.
- **ENTITY-MUTABILITY-003** — Audit requirements for Mutations MUST be declared as specified by [Financial Entities](README.md).
- **ENTITY-MUTABILITY-004** — A rejected mutation MUST leave all entity data and state unchanged.
- **ENTITY-MUTABILITY-005** — Declaring data immutable in a State MUST NOT erase or detach prior audit history.
- **ENTITY-MUTABILITY-006** — A terminal, approved, posted, or finalized State MUST NOT by itself make every entity field immutable; immutability applies only as declared by the composing domain or lifecycle policy.
- **ENTITY-MUTABILITY-007** — Operational metadata MAY remain mutable when financial fields are immutable only when the composing domain identifies that metadata and applies the Audit Event requirements declared under [Financial Entities](README.md).

## Invariants

A field declared immutable in the current State must not change through an ordinary Mutation.

## Invalid Examples

- Editing the amount of a finalized entity in place.
- Rejecting an update to delivery metadata declared mutable in the current State solely because that State is terminal.

## Errors

A prohibited mutation must report `FINKORE_ENTITY_IMMUTABLE`.

## Open Questions

- What policy model, if any, should a future specification define for post-finalization operational metadata such as external synchronization, processing, or delivery metadata?
- Should a future specification define Cancellation or Adjustment as additional portable Entity evolution concepts?

## Non-Goals

Ordinary Mutation does not define Correction, Reversal, Void, Supersession,
Cancellation, or Adjustment. Core 0.9 release candidate Entity Evolution defines portable
correction, reversal, void, and supersession distinctions; those operations are
not ordinary in-place mutation and are not synonyms. This document also does not
define a universal policy for post-finalization operational metadata.
