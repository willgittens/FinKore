# Financial Entities

## Status

**Draft**

## Purpose

This domain defines common behavior for identifiable, lifecycle-managed, auditable Financial Entities without defining any concrete financial domain.

## Requirements

A Financial Entity follows the canonical [identity](identity.md), [lifecycle](lifecycle.md), [mutability](mutability.md), [validation](validation.md), and [evolution](evolution.md) requirements.

- **ENTITY-AUDIT-001** — A composing domain MUST identify which Mutations and Transitions require an [Audit Event](../audit/events.md).
- **ENTITY-AUDIT-002** — Each successful Mutation or Transition identified by **ENTITY-AUDIT-001** MUST produce a corresponding Audit Event.
- **ENTITY-DEFINITION-001** — A composing domain MUST define its fields, lifecycle, and financially relevant invariants.

Draft 0.2 Entity Evolution defines portable correction, reversal, void, and supersession relations. Evolution preserves stable Entity identity and historical financial facts, uses explicit Entity Revision and Evolution Relation identities, requires caller-supplied Audit evidence, and rejects invalid or duplicate evolution without creating partial Entity, evolution, or Audit observations.

## Invariants

A Financial Entity's identity must remain stable throughout its lifecycle. Its current State and data must reflect only successful domain operations.

## Non-Goals

This draft does not define any concrete financial entity type, storage model, ownership model, API, or user interface.
