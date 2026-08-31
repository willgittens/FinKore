# Audit Changes

## Status

**Draft**

## Purpose

This document defines how an audit event may describe domain-relevant field changes.

## Requirements

- A Change MUST identify the changed field or domain path.
- A Change SHOULD record prior and resulting values when both may be safely retained.
- A Change MUST distinguish an absent value from an explicit null value when the underlying domain distinguishes them.
- Values MUST use stable domain representations, not localized display strings. Changes to Money values MUST preserve the semantics defined by [Money](../money/README.md).
- A Change set MUST NOT claim a field changed when its domain value remained equal.
- Sensitive values MUST follow [Redaction](redaction.md).
- An event MAY omit field changes when its event type fully expresses the occurrence or disclosure is prohibited.

## Invariants

Recorded Changes MUST be consistent with the Audit Event's declared domain meaning.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names or a domain-path syntax.

```json
{
  "field": "state",
  "before": "DRAFT",
  "after": "SUBMITTED"
}
```

## Invalid Examples

- Recording a secret in clear text when policy requires redaction.
- Using translated labels as canonical before and after values.

## Open Questions

- Should domain paths use a standardized portable syntax?
- How should large or structured values be summarized without losing evidentiary meaning?

