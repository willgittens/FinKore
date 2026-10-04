# Audit Errors

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

This document defines initial portable audit failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_AUDIT_INVALID_EVENT` | Required event content or supplied non-actor context is missing, malformed, unsupported, or inconsistent. |
| `FINKORE_AUDIT_DUPLICATE_EVENT` | The event identity has already been committed. |
| `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` | An operation would replace, modify, or remove a committed event, or change an explicitly recorded ordering relationship, outside the redaction rules. |
| `FINKORE_AUDIT_REDACTION_INVALID` | A redaction violates policy, source/target selection, required evidence linkage, or preserved Event meaning. |
| `FINKORE_AUDIT_ACTOR_INVALID` | Actor attribution is malformed or inconsistent. |

## Requirements

- **AUDIT-ERROR-001** — A rejected audit operation MUST NOT partially commit the invalid event.
- **AUDIT-ERROR-002** — Error details MUST NOT disclose content protected by redaction policy.
- **AUDIT-ERROR-003** — Implementations MAY expose additional diagnostic context that preserves these constraints.
- **AUDIT-ERROR-004** — Audit append validation MUST first validate supplied history in declared order, applying non-actor event representation, supplied actor attribution, duplicate event identity, and history-dependent relationship validation to each observation before proceeding to the next. It MUST then select a primary candidate error in this order: invalid non-actor candidate representation, including relationship representation; invalid supplied actor attribution; duplicate event identity; then relationship inconsistency against committed history. A malformed history or non-actor event representation MUST use `FINKORE_AUDIT_INVALID_EVENT`; malformed actor attribution MUST use `FINKORE_AUDIT_ACTOR_INVALID`; and duplicate event identity MUST use `FINKORE_AUDIT_DUPLICATE_EVENT`. A failure at any stage MUST stop validation before later stages determine the primary error and MUST leave committed logical history unchanged.

Audit Relationship error mapping is defined by **AUDIT-RELATIONSHIP-013** in
[Audit Relationships](relationships.md). Core 2.0 does not introduce a
dedicated Audit Relationship portable error code.

The precedence in **AUDIT-ERROR-004** separates representation validation from
history-dependent relationship validation. For example, a candidate with a
malformed entity and malformed actor returns `FINKORE_AUDIT_INVALID_EVENT`; a
structurally valid duplicate candidate with a malformed actor returns
`FINKORE_AUDIT_ACTOR_INVALID`; and a structurally valid duplicate candidate
whose relationship target is unknown returns `FINKORE_AUDIT_DUPLICATE_EVENT`.

## Invariants

A failed append must leave committed logical history unchanged.

## Non-Goals

This is not a complete error catalog and does not define transport behavior or errors for concurrency and ordering mechanisms outside Core 2.0.
