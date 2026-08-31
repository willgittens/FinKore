# Specification Conventions

## Status

Draft.

## Purpose

This document defines the writing, naming, and portable data conventions shared by FinFlow specifications.

## Normative Language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirements, prohibitions, recommendations, discouraged behavior, and permission respectively. Lowercase uses of these words have their ordinary meaning.

Text is normative when it states requirements or invariants. Examples, explanatory notes, and sections explicitly labeled non-normative do not add requirements.

## Naming and Terminology

- A specification MUST use terms as defined in the [glossary](glossary.md), unless it explicitly defines a narrower local meaning.
- The same concept SHOULD retain the same name across domains.
- Names SHOULD describe domain meaning rather than implementation mechanism.
- Identifiers MUST be treated as opaque values. Consumers MUST NOT infer domain facts from their internal format.
- An identifier MUST be stable within the scope in which it identifies a resource.

## Portable Values

- Timestamps MUST identify an unambiguous instant and SHOULD use RFC 3339 date-time text with an explicit UTC offset. UTC, expressed with `Z`, is preferred for interchange.
- Decimal values MUST use base-10 semantics. JSON examples SHOULD encode exact decimal values as strings.
- Currency identifiers SHOULD use uppercase ISO 4217 alphabetic codes where a suitable code exists. Private or non-ISO identifiers MUST be explicitly documented and MUST NOT collide with ISO codes in the same context.
- JSON object member order MUST NOT carry meaning.
- Optional and nullable values are distinct; a specification MUST state which, if either, is allowed.

## Error Codes

Portable errors use `FINFLOW_<DOMAIN>_<ERROR>`, with uppercase ASCII words separated by underscores. Codes MUST identify a stable category of domain failure and MUST NOT embed localized prose or implementation details.

Examples include:

```text
FINFLOW_MONEY_CURRENCY_MISMATCH
FINFLOW_WORKFLOW_INVALID_TRANSITION
FINFLOW_ENTITY_IMMUTABLE
FINFLOW_APPROVAL_REQUIRED
FINFLOW_VALIDATION_FAILED
```

An implementation MAY attach human-readable messages and structured context. Such additions MUST NOT change the meaning of the portable code and MUST NOT expose sensitive information by default. This document does not define a complete error catalog.

## Examples

JSON examples MUST be valid JSON unless labeled as pseudocode. Omitted fields MUST NOT be interpreted as optional unless the surrounding text says so. Language-specific examples, when unavoidable, MUST be labeled non-normative.

## Open Questions

- Which formal specification revision and compatibility policy will govern future changes?
- Should identifiers receive a common serialized envelope in a later interchange specification?

## Non-Goals

This document does not select a schema language, error transport, decimal library, identifier format, or timestamp storage mechanism.

