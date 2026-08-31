# Financial Entities

## Status

Draft.

## Purpose

This domain defines common behavior for identifiable, lifecycle-managed, auditable financial entities. Domain types such as invoices, expenses, payments, purchase orders, and journal entries may later build on these rules.

## Requirements

- A financial entity MUST have a stable [identity](identity.md).
- It MUST have a declared [lifecycle](lifecycle.md) and current state.
- Proposed mutations MUST follow [mutability](mutability.md) and [validation](validation.md) rules.
- Domain-relevant mutations and transitions SHOULD be auditable according to the [Audit specification](../audit/README.md).
- A composing domain MUST define its fields, lifecycle, and financially relevant invariants.

## Invariants

Identity remains stable throughout an entity's lifecycle. Current state and data MUST reflect only successful domain operations.

## Non-Goals

This draft does not define any concrete financial entity type, storage model, ownership model, API, or user interface.

