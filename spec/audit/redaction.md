# Audit Redaction

## Status

**FinKore Core 1.0 stable.**

## Purpose

This document defines how sensitive information may be withheld while preserving audit-history integrity.

## Terminology

**Redaction** is the policy-authorized concealment or replacement of protected Audit Event content in a representation of logical history, without pretending the content or event never existed.

## Requirements

- **AUDIT-REDACTION-001** — An audit policy MUST identify which content requires redaction and under what authority. Core 1.0 redaction targets are Audit Change paths supplied by the producer and the reserved actor-context targets `actor.displayName` and `actor.metadata`.
- **AUDIT-REDACTION-002** — A redacted value MUST be distinguishable from a value that was absent originally.
- **AUDIT-REDACTION-003** — A redacted representation MUST preserve event identity, event type, entity reference, occurrence timestamp, actor identity, any supplied actor type, and every ordering relationship explicitly recorded in logical history.
- **AUDIT-REDACTION-004** — Redaction SHOULD preserve enough structural information to explain what category of content was removed.
- **AUDIT-REDACTION-005** — Access-time masking MAY supplement redaction.
- **AUDIT-REDACTION-007** — Access-time masking MUST NOT be represented as mutation of the committed source event.
- **AUDIT-REDACTION-006** — A redaction action affecting committed logical history MUST produce an Audit Event identifying that the redaction occurred.
- **AUDIT-REDACTION-008** — A redaction policy identifier is optional. In the bounded policy representation, `policy.id` MAY be omitted; when supplied, it MUST be a nonempty string. Supplied null, empty strings and non-string values MUST be rejected with `FINKORE_AUDIT_REDACTION_INVALID` during policy validation, before candidate evidence validation. An omitted identifier MUST NOT prevent otherwise valid redaction. An identifier MUST NOT substitute for required authority or protected targets, change which content is redacted, or authorize changes to committed history. Rejection MUST leave logical history unchanged under **AUDIT-ERROR-001**.

## Invariants

A redacted representation must preserve the fact that an Audit Event occurred and that protected content occupied a defined place in it.

## Representation boundary

Identifying authority in **AUDIT-REDACTION-001** is required before a redacted
representation or redaction evidence is returned. Missing or malformed
authority is `FINKORE_AUDIT_REDACTION_INVALID`; the existence of protected
paths alone does not establish authority. The bounded fixture represents that
declaration as a nonempty string `policy.authority`; omitted, null, empty,
numeric, Boolean, array, or object values do not satisfy that representation.
This does not standardize an authority registry, authenticate the declaration,
or introduce RBAC. Other policy fields retain their separately declared
contracts. Invalid policy input cannot partially redact committed history or
commit a redaction evidence Event.

The optional identifier in **AUDIT-REDACTION-008** is an opaque label. It is not
looked up, authenticated, normalized or used to select protected content. A
nonempty string is preserved as supplied; whitespace or special member names
do not acquire identifier semantics. Omission and supplied null are distinct.
Native convenience APIs may use a documented absence sentinel; portable parsing
must not treat supplied null as omission. Existing history validation precedes
policy processing under the existing error priorities.

Core 1.0 defines the meaning of redaction, including optional
Actor context under **AUDIT-ACTOR-006**, without standardizing a production
redacted-value encoding. The representation is implementation-defined and must
preserve the distinctions and evidence required above. A consumer-owned
conformance binding normalizes that representation to the conformance-only
`{"presence":"REDACTED"}` sentinel; the sentinel is not a required production
representation.

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
