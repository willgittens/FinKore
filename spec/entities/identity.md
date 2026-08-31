# Entity Identity

## Status

**Draft**

## Purpose

This document defines stable domain identity and continuity for a Financial Entity; it does not define a database key or storage record.

## Requirements

- A Financial Entity MUST have an identifier unique within its declared identity scope.
- The identifier MUST remain stable for the Financial Entity's entire lifecycle.
- Identifiers MUST be opaque; consumers MUST NOT infer mutable domain facts from their format.
- Revisions, versions, and display numbers MUST NOT replace stable identity unless a composing specification explicitly makes them identical and immutable.
- Two distinct entities MUST NOT share the same identifier within the same scope.
- Import or migration MUST preserve identity or record an explicit identity mapping.

## Invariants

A Mutation, Transition, or other domain operation MUST NOT silently create a new identity for the same continuing Financial Entity.

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

