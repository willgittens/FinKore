# Audit Redaction

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines how sensitive information may be withheld while preserving audit-history integrity.

## Terminology

**Redaction** is the policy-authorized concealment or replacement of protected Audit Event content in a representation of logical history, without pretending the content or event never existed.

## Requirements

- **AUDIT-REDACTION-001** — An audit policy MUST identify which content requires redaction and under what authority. Core 0.9 release candidate redaction targets are Audit Change paths supplied by the producer and the reserved actor-context targets `actor.displayName` and `actor.metadata`.
- **AUDIT-REDACTION-002** — A redacted value MUST be distinguishable from a value that was absent originally.
- **AUDIT-REDACTION-003** — A redacted representation MUST preserve event identity, event type, entity reference, occurrence timestamp, actor identity, any supplied actor type, and every ordering relationship explicitly recorded in logical history.
- **AUDIT-REDACTION-004** — Redaction SHOULD preserve enough structural information to explain what category of content was removed.
- **AUDIT-REDACTION-005** — Access-time masking MAY supplement redaction.
- **AUDIT-REDACTION-007** — Access-time masking MUST NOT be represented as mutation of the committed source event.
- **AUDIT-REDACTION-006** — A redaction action affecting committed logical history MUST produce an Audit Event identifying that the redaction occurred.

## Invariants

A redacted representation must preserve the fact that an Audit Event occurred and that protected content occupied a defined place in it.

## Example

The following JSON is illustrative and non-normative. The masking representation is application-defined.

```json
{
  "field": "bankAccount",
  "before": { "redacted": true },
  "after": { "redacted": true }
}
```

Even though neither protected value is disclosed, the separate `before` and `after` positions preserve the fact that the field changed.

## Invalid Examples

- Deleting an entire event solely because one field is sensitive.
- Replacing a value with null when null could have been the original value.

## Open Questions

- How can cryptographic evidence of pre-redaction content be standardized without creating disclosure risk?
