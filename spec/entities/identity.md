# Entity Identity

## Status

Draft.

## Purpose

This document defines stable identity and continuity for a financial entity.

## Requirements

- An entity MUST have an identifier unique within its declared identity scope.
- The identifier MUST remain stable for the entity's entire lifecycle.
- Identifiers MUST be opaque; consumers MUST NOT infer mutable domain facts from their format.
- Revisions, versions, and display numbers MUST NOT replace stable identity unless a composing specification explicitly makes them identical and immutable.
- Two distinct entities MUST NOT share the same identifier within the same scope.
- Import or migration MUST preserve identity or record an explicit identity mapping.

## Invariants

Mutation, state transition, correction, and reversal MUST NOT silently create a new identity for the same continuing entity.

## Examples

```json
{
  "entityType": "expense",
  "entityId": "exp-52"
}
```

## Invalid Examples

- Changing an entity identifier when its status changes.
- Using a mutable title as the sole identity.

## Open Questions

- Should the specification define a common identity scope model across entity types and tenants?

