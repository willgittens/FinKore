# Audit Redaction

## Status

**Draft**

## Purpose

This document defines how sensitive information may be withheld while preserving audit-history integrity.

## Terminology

**Redaction** is the policy-authorized concealment or replacement of protected Audit Event content in a representation of logical history, without pretending the content or event never existed.

## Requirements

- An audit policy MUST identify which content requires redaction and under what authority.
- A redacted value MUST be distinguishable from a value that was absent originally.
- A redacted representation MUST preserve event identity, ordering, event type, entity reference, and occurrence timestamp.
- Redaction SHOULD preserve enough structural information to explain what category of content was removed.
- Access-time masking MAY supplement redaction but MUST NOT be represented as mutation of the committed source event.
- A redaction action affecting committed logical history MUST produce an Audit Event identifying that the redaction occurred.

## Invariants

A redacted representation MUST preserve the fact that an Audit Event occurred and that protected content occupied a defined place in it.

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

