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

Core 0.9 release candidate Entity Evolution defines portable correction, reversal, void, and supersession relations. Evolution preserves stable Entity identity and historical financial facts, uses explicit Entity Revision and Evolution Relation identities, requires caller-supplied Audit evidence, and rejects invalid or duplicate evolution without creating partial Entity, evolution, or Audit observations.

Core 0.9 release candidate Entity Revision and Import refines business revision observations and
defines a bounded import boundary. Import preserves stable FinKore Entity
identity, records explicit source identity mapping when external identity is
present, preserves current and historical Entity Revision identity, keeps Entity
Conflict Version distinct from business revision identity, and rejects stale
expected-state/revision/conflict-version observations without partial import.

## Invariants

A Financial Entity's identity must remain stable throughout its lifecycle. Its current State and data must reflect only successful domain operations.

## Core 0.9.5 ownership review (non-normative, blocking)

The existing lifecycle/validation rules require declared behavior, but do not
explicitly settle whether an unversioned Entity may retain caller-mutable
declarations. **WORKFLOW-VERSION-003** cannot by itself govern this unversioned
case. The [Milestone 1 decision](../../docs/plans/plan-09.5.md) proposes that an
existing Entity retain stable, owned declarations, including nested Workflow
guards/transitions, mutability lists, and validators. Original input or returned
observation mutation would not reconfigure it; immutable values or defensive
copies would both satisfy that guarantee. No migration or dynamic
reconfiguration API is proposed.

This is a blocking specification gap, not an accepted new requirement. Adoption
needs a new `ENTITY-DEFINITION` requirement because **ENTITY-DEFINITION-001**
governs what a composing domain declares, not ownership over an instance's
lifetime. Native alias tests can establish the proposed boundary; a JSON
request alone cannot. The proposed successful observation is unchanged retained
behavior; a previously undeclared transition still fails with the existing
Workflow transition error. CoreDoc's declared-control obligations remain intact.

## Non-Goals

Core 0.9 release candidate does not define any concrete financial entity type,
storage model, ownership model, global identity registry, deduplication service,
authorization model, API, or user interface.
