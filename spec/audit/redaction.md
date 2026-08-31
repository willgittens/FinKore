# Audit Redaction

## Status

Draft.

## Purpose

This document defines how sensitive information may be withheld while preserving audit-history integrity.

## Terminology

**Redaction** is the controlled concealment or replacement of event content without pretending the content never existed.

## Requirements

- An audit policy MUST identify which content requires redaction and under what authority.
- A redacted value MUST be distinguishable from a value that was absent originally.
- Redaction MUST NOT alter event identity, ordering, event type, entity reference, or occurrence timestamp.
- Redaction SHOULD preserve enough structural information to explain what category of content was removed.
- Access-time masking MAY supplement redaction but MUST NOT be represented as mutation of the committed source event.
- Redaction actions affecting committed history MUST themselves be auditable.

## Invariants

Redaction preserves the fact that an event occurred and that protected content occupied a defined place in it.

## Examples

```json
{
  "field": "bankAccount",
  "before": { "redacted": true },
  "after": { "redacted": true }
}
```

## Invalid Examples

- Deleting an entire event solely because one field is sensitive.
- Replacing a value with null when null could have been the original value.

## Open Questions

- How can cryptographic evidence of pre-redaction content be standardized without creating disclosure risk?

