# Specification Conventions

## Status

**Draft**

## Purpose

This document defines the writing, naming, and portable data conventions shared by FinKore specifications.

## Normative Language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirements, prohibitions, recommendations, discouraged behavior, and permission respectively. Lowercase uses of these words have their ordinary meaning.

Text is normative when it uses one of these uppercase keywords. Invariant sections summarize fundamental normative rules and use the keywords when they impose a conformance requirement. Examples, explanatory notes, and sections explicitly labeled non-normative do not add requirements.

- **SPEC-CONFORMANCE-001** — A conforming implementation MUST satisfy every applicable **MUST** and **MUST NOT** requirement.
- **SPEC-CONFORMANCE-002** — A conforming implementation SHOULD satisfy every applicable **SHOULD** and **SHOULD NOT** requirement unless it documents a reason for the exception.

## Stable Requirement Identifiers

Normative clauses selected for conformance traceability use a domain-prefixed identifier such as `MONEY-ARITHMETIC-001`.

- **SPEC-REQUIREMENT-001** — Once published, a requirement identifier MUST remain bound to the same normative meaning.
- **SPEC-REQUIREMENT-002** — An identifier MUST NOT be renumbered merely to close a sequence gap or because its document moves.
- **SPEC-REQUIREMENT-003** — A materially different replacement requirement MUST receive a new identifier.
- **SPEC-REQUIREMENT-004** — A retired requirement identifier MUST NOT be reused.
- **SPEC-REQUIREMENT-005** — Conformance vectors SHOULD reference every normative requirement they exercise.

## Naming and Terminology

- **SPEC-TERMINOLOGY-001** — A specification that refines a [glossary](glossary.md) term or an underlying rule MUST identify the refinement explicitly and MUST NOT silently contradict the shared definition.
- **SPEC-TERMINOLOGY-002** — The same concept SHOULD retain the same name across domains.
- **SPEC-TERMINOLOGY-003** — Names SHOULD describe domain meaning rather than implementation mechanism.
- **SPEC-IDENTIFIER-001** — Identifiers MUST be treated as opaque values.
- **SPEC-IDENTIFIER-002** — Consumers MUST NOT infer domain facts from an identifier's internal format.
- **SPEC-IDENTIFIER-003** — An identifier MUST be stable within the scope in which it identifies a resource.

## Portable Values

- **SPEC-TIMESTAMP-001** — Timestamps used as domain values MUST identify an unambiguous instant.
- **SPEC-TIMESTAMP-002** — A serialized timestamp MUST use an RFC 3339 `date-time` representation with an explicit numeric UTC offset or `Z`.
- **SPEC-DECIMAL-001** — Exact decimal domain values MUST use base-10 semantics.
- **SPEC-DECIMAL-002** — A specification that defines a serialized decimal value MUST define an encoding that preserves its exact numeric value; JSON numbers are not portable for this purpose.
- **SPEC-CURRENCY-001** — Currency identifiers SHOULD use ISO 4217 alphabetic codes when representing currencies covered by ISO 4217.
- **SPEC-CURRENCY-002** — An ISO 4217 alphabetic currency identifier MUST be uppercase.
- **SPEC-JSON-001** — JSON object member order MUST NOT carry meaning.
- **SPEC-NULLABILITY-001** — A specification defining a portable value MUST state whether each value may be omitted or be null.

## Error Codes

Portable errors use `FINKORE_<DOMAIN>_<ERROR>`, with uppercase ASCII words separated by underscores.

- **SPEC-ERROR-001** — A portable error code MUST identify a stable category of domain failure.
- **SPEC-ERROR-002** — A portable error code MUST NOT embed localized prose or implementation details.

The following table is the consolidated catalog. Domain error documents define the conditions in detail.

| Domain | Code | Defined condition |
| --- | --- | --- |
| Money | `FINKORE_MONEY_INVALID_AMOUNT` | [Money amount is invalid](money/errors.md). |
| Money | `FINKORE_MONEY_INVALID_CURRENCY` | [Currency identifier is invalid](money/errors.md). |
| Money | `FINKORE_MONEY_CURRENCY_MISMATCH` | [Compatible currencies were required](money/errors.md). |
| Money | `FINKORE_MONEY_DIVISION_BY_ZERO` | [A scalar divisor was zero](money/errors.md). |
| Money | `FINKORE_MONEY_ROUNDING_REQUIRED` | [Required precision reduction has no rounding rule](money/errors.md). |
| Money | `FINKORE_MONEY_INVALID_ROUNDING` | [A requested rounding rule is invalid or unsupported](money/errors.md). |
| Money | `FINKORE_MONEY_INVALID_ALLOCATION` | [A requested allocation is invalid](money/errors.md). |
| Workflow | `FINKORE_WORKFLOW_INVALID_DEFINITION` | [Workflow structure is invalid](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_INVALID_STATE` | [A State is missing or undeclared](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_INVALID_TRANSITION` | [A requested directed Transition is undeclared](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_GUARD_REJECTED` | [A Transition Guard rejected a request](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_TERMINAL_STATE` | [A Transition Request would leave a terminal State](workflow/errors.md). |
| Audit | `FINKORE_AUDIT_INVALID_EVENT` | [Audit Event content is invalid](audit/errors.md). |
| Audit | `FINKORE_AUDIT_DUPLICATE_EVENT` | [An Audit Event identity is already committed](audit/errors.md). |
| Audit | `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` | [Committed logical history would be altered](audit/errors.md). |
| Audit | `FINKORE_AUDIT_REDACTION_INVALID` | [Redaction violates its policy or required meaning](audit/errors.md). |
| Audit | `FINKORE_AUDIT_ACTOR_INVALID` | [Actor attribution is invalid](audit/errors.md). |
| Approval | `FINKORE_APPROVAL_REQUIRED` | [A required Approval is unsatisfied](approvals/errors.md). |
| Approval | `FINKORE_APPROVAL_INVALID_DECISION` | [An Approval Decision is invalid](approvals/errors.md). |
| Approval | `FINKORE_APPROVAL_INELIGIBLE_ACTOR` | [The deciding Actor is ineligible](approvals/errors.md). |
| Approval | `FINKORE_APPROVAL_INVALID_CHAIN` | [An Approval Chain is invalid](approvals/errors.md). |
| Approval | `FINKORE_APPROVAL_CONDITION_UNRESOLVED` | [An Approval Condition cannot be evaluated](approvals/errors.md). |
| Approval | `FINKORE_APPROVAL_INVALID_CONTEXT` | [Required explicit Approval evaluation context is missing or malformed](approvals/errors.md). |
| Entity | `FINKORE_ENTITY_INVALID_IDENTITY` | [Financial Entity identity is invalid](entities/errors.md). |
| Entity | `FINKORE_ENTITY_IMMUTABLE` | [A Mutation targets immutable data](entities/errors.md). |
| Entity | `FINKORE_ENTITY_INVALID_MUTATION` | [A Mutation is not recognized or permitted](entities/errors.md). |
| Entity | `FINKORE_ENTITY_STATE_CONFLICT` | [Expected and current State differ](entities/errors.md). |
| Entity | `FINKORE_ENTITY_VALIDATION_FAILED` | [Structural or business validation failed](entities/errors.md). |

- **SPEC-ERROR-003** — An implementation MAY attach human-readable messages and structured context to a portable error.
- **SPEC-ERROR-004** — Additional error details MUST NOT change the meaning of the portable code.
- **SPEC-ERROR-005** — Additional error details MUST NOT expose sensitive information by default.

This document does not define a complete error catalog.

## Examples

- **SPEC-EXAMPLE-001** — JSON identified as a normative representation MUST be valid JSON.
- **SPEC-EXAMPLE-002** — The specification text surrounding normative JSON MUST define its required and optional members.
- **SPEC-EXAMPLE-003** — Language-specific examples MUST be labeled non-normative.

All other JSON is illustrative and non-normative; omission in an example does not imply that a field is optional.

## Open Questions

- Which formal specification revision and compatibility policy will govern future changes?
- Should identifiers receive a common serialized envelope in a later interchange specification?

## Non-Goals

This document does not select a schema language, error transport, decimal library, identifier format, or timestamp storage mechanism.
