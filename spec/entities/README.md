# Financial Entities

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

Financial Entities combines stable identity, lifecycle rules, permitted changes,
and audit obligations. It describes what a continuing financial subject preserves
over time. A composing domain supplies the concrete fields and business rules.

## Documents

Start with identity, lifecycle, mutability, and validation. Continue with
revisions, import, and evolution when retaining or changing existing records.

| Document | What you will learn |
| --- | --- |
| [Identity](identity.md) | Stable identity throughout a subject's lifecycle |
| [Lifecycle](lifecycle.md) | How an Entity follows its Workflow |
| [Mutability](mutability.md) | Which fields may change in each state |
| [Validation](validation.md) | Checking the complete proposed Entity |
| [Revisions](revisions.md) | Business revisions and their distinction from conflict tokens |
| [Import](import.md) | Preserving existing identity, revisions, and explicit source mappings |
| [Evolution](evolution.md) | Correction, reversal, void, and supersession with preserved evidence |
| [Errors](errors.md) | Portable failure codes and unchanged state after rejection |

## Requirements

A Financial Entity follows the canonical [identity](identity.md), [lifecycle](lifecycle.md), [mutability](mutability.md), [validation](validation.md), [evolution](evolution.md), [revisions](revisions.md), and [import](import.md) requirements.

- **ENTITY-AUDIT-001** — A composing domain MUST identify which Mutations and Transitions require an [Audit Event](../audit/events.md).
- **ENTITY-AUDIT-002** — Each successful Mutation or Transition identified by **ENTITY-AUDIT-001** MUST produce a corresponding Audit Event.
- **ENTITY-DEFINITION-001** — A composing domain MUST define its fields, lifecycle, and financially relevant invariants.
- **ENTITY-DEFINITION-002** — An existing Financial Entity MUST retain stable owned declarations for its lifecycle, mutability, and validation rules, including nested Workflow guards and declaration containers, whether the Workflow is versioned or unversioned. Mutating original constructor/import inputs or returned definition observations MUST NOT change the behavior of that existing Entity. Immutable representations and defensive copies MAY realize this guarantee.

Core 2.0 Entity Evolution defines portable correction, reversal, void, and supersession relations. Evolution preserves stable Entity identity and historical financial facts, uses explicit Entity Revision and Evolution Relation identities, requires caller-supplied Audit evidence, and rejects invalid or duplicate evolution without creating partial Entity, evolution, or Audit observations.

Core 2.0 Entity Revision and Import refines business revision observations and
defines a bounded import boundary. Import preserves stable FinKore Entity
identity, records explicit source identity mapping when external identity is
present, preserves current and historical Entity Revision identity, keeps Entity
Conflict Version distinct from business revision identity, and rejects stale
expected-state/revision/conflict-version observations without partial import.

## Invariants

A Financial Entity's identity must remain stable throughout its lifecycle. Its current State and data must reflect only successful domain operations.

## Declaration ownership

**ENTITY-DEFINITION-002** governs declarations retained for an existing Entity
instance, including unversioned Workflows. It does not require stateless APIs to
retain declarations across unrelated calls or define migration or dynamic
reconfiguration.

## Non-Goals

Core 2.0 does not define any concrete financial entity type,
storage model, financial ownership model, global identity registry, deduplication service,
authorization model, API, or user interface.
