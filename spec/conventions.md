# Specification Conventions

## Status

**Draft**

## Purpose

This document defines the writing, naming, and portable data conventions shared by FinFlow specifications.

## Normative Language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirements, prohibitions, recommendations, discouraged behavior, and permission respectively. Lowercase uses of these words have their ordinary meaning.

Text is normative when it uses one of these uppercase keywords. Invariant sections summarize fundamental normative rules and use the keywords when they impose a conformance requirement. Examples, explanatory notes, and sections explicitly labeled non-normative do not add requirements.

## Naming and Terminology

- A specification MUST use terms as defined in the [glossary](glossary.md), unless it explicitly defines a narrower local meaning.
- The same concept SHOULD retain the same name across domains.
- Names SHOULD describe domain meaning rather than implementation mechanism.
- Identifiers MUST be treated as opaque values. Consumers MUST NOT infer domain facts from their internal format.
- An identifier MUST be stable within the scope in which it identifies a resource.

## Portable Values

- Timestamps used as domain values MUST identify an unambiguous instant. A serialized timestamp MUST use an RFC 3339 `date-time` representation with an explicit numeric UTC offset or `Z`.
- Exact decimal domain values MUST use base-10 semantics. A specification that defines a serialized decimal value MUST define an encoding that preserves its exact numeric value; JSON numbers are not portable for this purpose.
- Currency identifiers SHOULD use ISO 4217 alphabetic codes when representing currencies covered by ISO 4217, and those codes MUST be uppercase. Application-defined and non-ISO identifier namespaces are outside the normative scope of FinFlow Core Draft 0.1.
- JSON object member order MUST NOT carry meaning.
- Optional and nullable values are distinct; a specification MUST state which, if either, is allowed.

## Error Codes

Portable errors use `FINFLOW_<DOMAIN>_<ERROR>`, with uppercase ASCII words separated by underscores. Codes MUST identify a stable category of domain failure and MUST NOT embed localized prose or implementation details.

The following table is the consolidated catalog. Domain error documents define the conditions in detail.

| Domain | Code | Defined condition |
| --- | --- | --- |
| Money | `FINFLOW_MONEY_INVALID_AMOUNT` | [Money amount is invalid](money/errors.md). |
| Money | `FINFLOW_MONEY_INVALID_CURRENCY` | [Currency identifier is invalid](money/errors.md). |
| Money | `FINFLOW_MONEY_CURRENCY_MISMATCH` | [Compatible currencies were required](money/errors.md). |
| Money | `FINFLOW_MONEY_DIVISION_BY_ZERO` | [A scalar divisor was zero](money/errors.md). |
| Money | `FINFLOW_MONEY_ROUNDING_REQUIRED` | [Required precision reduction has no rounding rule](money/errors.md). |
| Money | `FINFLOW_MONEY_INVALID_ROUNDING` | [A requested rounding rule is invalid or unsupported](money/errors.md). |
| Workflow | `FINFLOW_WORKFLOW_INVALID_DEFINITION` | [Workflow structure is invalid](workflow/errors.md). |
| Workflow | `FINFLOW_WORKFLOW_INVALID_STATE` | [A State is missing or undeclared](workflow/errors.md). |
| Workflow | `FINFLOW_WORKFLOW_INVALID_TRANSITION` | [A requested directed Transition is undeclared](workflow/errors.md). |
| Workflow | `FINFLOW_WORKFLOW_GUARD_REJECTED` | [A Transition Guard rejected a request](workflow/errors.md). |
| Workflow | `FINFLOW_WORKFLOW_TERMINAL_STATE` | [A Transition Request would leave a terminal State](workflow/errors.md). |
| Audit | `FINFLOW_AUDIT_INVALID_EVENT` | [Audit Event content is invalid](audit/errors.md). |
| Audit | `FINFLOW_AUDIT_DUPLICATE_EVENT` | [An Audit Event identity is already committed](audit/errors.md). |
| Audit | `FINFLOW_AUDIT_APPEND_ONLY_VIOLATION` | [Committed logical history would be altered](audit/errors.md). |
| Audit | `FINFLOW_AUDIT_REDACTION_INVALID` | [Redaction violates its policy or required meaning](audit/errors.md). |
| Audit | `FINFLOW_AUDIT_ACTOR_INVALID` | [Actor attribution is invalid](audit/errors.md). |
| Approval | `FINFLOW_APPROVAL_REQUIRED` | [A required Approval is unsatisfied](approvals/errors.md). |
| Approval | `FINFLOW_APPROVAL_INVALID_DECISION` | [An Approval Decision is invalid](approvals/errors.md). |
| Approval | `FINFLOW_APPROVAL_INELIGIBLE_ACTOR` | [The deciding Actor is ineligible](approvals/errors.md). |
| Approval | `FINFLOW_APPROVAL_INVALID_CHAIN` | [An Approval Chain is invalid](approvals/errors.md). |
| Approval | `FINFLOW_APPROVAL_CONDITION_UNRESOLVED` | [An Approval Condition cannot be evaluated](approvals/errors.md). |
| Entity | `FINFLOW_ENTITY_INVALID_IDENTITY` | [Financial Entity identity is invalid](entities/errors.md). |
| Entity | `FINFLOW_ENTITY_IMMUTABLE` | [A Mutation targets immutable data](entities/errors.md). |
| Entity | `FINFLOW_ENTITY_INVALID_MUTATION` | [A Mutation is not recognized or permitted](entities/errors.md). |
| Entity | `FINFLOW_ENTITY_STATE_CONFLICT` | [Expected and current State differ](entities/errors.md). |
| Entity | `FINFLOW_ENTITY_VALIDATION_FAILED` | [Structural or business validation failed](entities/errors.md). |

An implementation MAY attach human-readable messages and structured context. Such additions MUST NOT change the meaning of the portable code and MUST NOT expose sensitive information by default. This document does not define a complete error catalog.

## Examples

JSON identified as a normative representation MUST be valid JSON and its surrounding text MUST define required and optional members. All other JSON is illustrative and non-normative; omission in an example does not imply that a field is optional. Language-specific examples, when unavoidable, MUST be labeled non-normative.

## Open Questions

- Which formal specification revision and compatibility policy will govern future changes?
- Should identifiers receive a common serialized envelope in a later interchange specification?

## Non-Goals

This document does not select a schema language, error transport, decimal library, identifier format, or timestamp storage mechanism.

