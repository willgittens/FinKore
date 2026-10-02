# Financial Entities

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This domain defines common behavior for identifiable, lifecycle-managed, auditable Financial Entities without defining any concrete financial domain.

## Requirements

A Financial Entity follows the canonical [identity](identity.md), [lifecycle](lifecycle.md), [mutability](mutability.md), [validation](validation.md), [evolution](evolution.md), [revisions](revisions.md), and [import](import.md) requirements.

- **ENTITY-AUDIT-001** — A composing domain MUST identify which Mutations and Transitions require an [Audit Event](../audit/events.md).
- **ENTITY-AUDIT-002** — Each successful Mutation or Transition identified by **ENTITY-AUDIT-001** MUST produce a corresponding Audit Event.
- **ENTITY-DEFINITION-001** — A composing domain MUST define its fields, lifecycle, and financially relevant invariants.
- **ENTITY-DEFINITION-002** — An existing Financial Entity MUST retain stable owned declarations for its lifecycle, mutability, and validation rules, including nested Workflow guards and declaration containers, whether the Workflow is versioned or unversioned. Mutating original constructor/import inputs or returned definition observations MUST NOT change the behavior of that existing Entity. Immutable representations and defensive copies MAY realize this guarantee.

Core 0.9 release candidate Entity Evolution defines portable correction, reversal, void, and supersession relations. Evolution preserves stable Entity identity and historical financial facts, uses explicit Entity Revision and Evolution Relation identities, requires caller-supplied Audit evidence, and rejects invalid or duplicate evolution without creating partial Entity, evolution, or Audit observations.

Core 0.9 release candidate Entity Revision and Import refines business revision observations and
defines a bounded import boundary. Import preserves stable FinKore Entity
identity, records explicit source identity mapping when external identity is
present, preserves current and historical Entity Revision identity, keeps Entity
Conflict Version distinct from business revision identity, and rejects stale
expected-state/revision/conflict-version observations without partial import.

## Invariants

A Financial Entity's identity must remain stable throughout its lifecycle. Its current State and data must reflect only successful domain operations.

## Core 0.9.5 correction note (non-normative)

The accepted [contract decision](../../docs/plans/plan-09.5.md) adds
**ENTITY-DEFINITION-002** for the previously ambiguous unversioned ownership
boundary. It does not define migration or dynamic reconfiguration. Native alias
tests recorded by the completed 0.9.5 plan are historical evidence for this
guarantee; the current repository does not rerun them. The rule does not require
stateless APIs to retain declarations across unrelated calls; it governs
declarations retained for an existing Entity instance.

## Non-Goals

Core 0.9 release candidate does not define any concrete financial entity type,
storage model, financial ownership model, global identity registry, deduplication service,
authorization model, API, or user interface.
