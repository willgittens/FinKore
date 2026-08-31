# Financial Entities

## Status

**Draft**

## Purpose

This domain defines common behavior for identifiable, lifecycle-managed, auditable Financial Entities without defining any concrete financial domain.

## Requirements

- A Financial Entity MUST have a stable [identity](identity.md).
- It MUST have a declared [lifecycle](lifecycle.md) and current State.
- Proposed Mutations MUST follow [mutability](mutability.md) and [validation](validation.md) rules.
- A composing domain MUST identify which Mutations and Transitions require an [Audit Event](../audit/events.md). Each successful operation so identified MUST produce a corresponding Audit Event.
- A composing domain MUST define its fields, lifecycle, and financially relevant invariants.

## Invariants

A Financial Entity's identity MUST remain stable throughout its lifecycle. Its current State and data MUST reflect only successful domain operations.

## Non-Goals

This draft does not define any concrete financial entity type, storage model, ownership model, API, or user interface.

