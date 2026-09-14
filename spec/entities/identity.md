# Entity Identity

## Status

**Draft**

## Purpose

This document defines stable domain identity and continuity for a Financial Entity; it does not define a database key or storage record.

## Requirements

- **ENTITY-IDENTITY-001** — A Financial Entity MUST have an identifier unique within its declared identity scope.
- **ENTITY-IDENTITY-002** — The identifier MUST remain stable for the Financial Entity's entire lifecycle.
- **ENTITY-IDENTITY-003** — Identifiers MUST be opaque; consumers MUST NOT infer mutable domain facts from their format.
- **ENTITY-IDENTITY-004** — Revisions, versions, and display numbers MUST NOT replace stable identity unless a composing specification explicitly makes them identical and immutable.
- **ENTITY-IDENTITY-005** — Two distinct entities MUST NOT share the same identifier within the same scope.
- **ENTITY-IDENTITY-006** — Import or migration MUST preserve identity or record an explicit identity mapping.

Draft 0.3 refines import mapping in [Entity Import](import.md). That refinement
does not create a global registry or permit Source Identity to replace stable
FinKore Entity identity.

## Invariants

A Mutation, Transition, or other domain operation must not silently create a new identity for the same continuing Financial Entity.

## Example

The following JSON is illustrative and non-normative. It does not prescribe common serialized member names or an identifier format.

```json
{
  "entityType": "expense",
  "entityId": "exp-52"
}
```

## Invalid Examples

- Changing a Financial Entity identifier when its State changes.
- Using a mutable title as the sole identity.

## Open Questions

- Should the specification define a common identity scope model across entity types and tenants?
