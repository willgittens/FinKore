# Entity Revisions

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document refines Entity Revision semantics for imported and observed
Financial Entities. It distinguishes stable Entity identity, business revision
identity, and conflict-version tokens without defining persistence,
deduplication, authorization, or a global identity registry.

## Terminology

An **Entity Revision** is a stable, opaque identifier for a declared business
observation or version of a continuing Financial Entity.

A **Current Entity Revision** is the revision identified by the caller or
composing domain as current for the supplied Entity observation and revision
scope.

A **Historical Entity Revision** is a preserved prior revision for the same
stable Entity identity.

An **Entity Conflict Version** is an optional opaque precondition token used to
detect stale observations. It is not an Entity Revision, stable Entity identity,
database row identity, or display number.

## Requirements

- **ENTITY-REVISION-001** - Entity Revision identity MUST be stable, opaque, and supplied by the caller or composing domain.
- **ENTITY-REVISION-002** - Entity Revision identity MUST remain distinct from stable Entity identity, display numbers, source-system identifiers, database row identity, storage counters, timestamps, and Entity Conflict Version unless a composing specification explicitly defines one immutable value as carrying both meanings.
- **ENTITY-REVISION-003** - A Current Entity Revision observation MUST identify the same stable Entity type and Entity identity as the Entity observation it qualifies.
- **ENTITY-REVISION-004** - A Historical Entity Revision observation MUST preserve the supplied revision identity and MUST NOT rewrite stable Entity identity, current lifecycle State, or current Entity data.
- **ENTITY-REVISION-005** - An implementation MUST NOT generate, increment, normalize, sort, or reinterpret Entity Revision identity from array order, lifecycle State, storage position, timestamps, display numbers, or mutable financial facts.
- **ENTITY-REVISION-006** - When both Entity Revision and Entity Conflict Version are supplied, they MUST remain independently observable and MUST NOT be substituted for one another during precondition checks.
- **ENTITY-REVISION-007** - A missing, malformed, duplicate, or identity-conflicting Entity Revision observation MUST fail with `FINKORE_ENTITY_INVALID_IDENTITY` unless a more specific primary domain error applies.

## Invariants

Entity Revisions identify declared business observations. They do not replace
stable Entity identity and do not define storage locking or a persistence
transaction model.

## Core 0.9.5 equal-token review (non-normative, blocking)

**ENTITY-REVISION-002** separates meanings and permits an explicit immutable
shared-meaning declaration. **ENTITY-REVISION-006** requires independently
observable revision and conflict values. Neither statement unambiguously
defines whether equal strings in separate fixture members assert one shared
identity or happen to spell two separately scoped identities the same way.
TypeScript rejection is not specification authority; Python/Java acceptance
cannot yet be classified solely as a violation on the basis of lexical equality.

The [Milestone 1 proposal](../../docs/plans/plan-09.5.md) treats the existing
bounded import fixture as using distinct tokens: equal current business-revision
and conflict-version tokens without a declared shared meaning would fail with
`FINKORE_ENTITY_INVALID_IDENTITY`. Distinct values and independently checked
preconditions remain valid. This is not a global string-uniqueness rule across
typed/scoped identities. The current fixture has no shared-meaning declaration;
no arbitrary Boolean flag can waive the requirement. A composing specification
using the exception must explicitly define its immutable dual meaning and
preserve independent observation/precondition checks. Adoption requires a scoped
normative clarification before a vector selects the proposed rejection.

## Non-Goals

This document does not define concrete invoice revisions, optimistic locking
algorithms, storage row versions, migration across Workflow definitions, or a
global Entity registry.
