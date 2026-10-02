# Specification Conventions

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines the writing, naming, and portable data conventions shared by FinKore specifications.

## Normative Language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** express requirements, prohibitions, recommendations, discouraged behavior, and permission respectively. Lowercase uses of these words have their ordinary meaning.

Text is normative when it uses one of these uppercase keywords. Invariant sections summarize fundamental normative rules and use the keywords when they impose a conformance requirement. Examples, explanatory notes, and sections explicitly labeled non-normative do not add requirements.

Open Questions sections are non-normative future-scope notes unless a
conformance traceability entry explicitly classifies the topic as a blocking
specification gap.

- **SPEC-CONFORMANCE-001** — A conforming implementation MUST satisfy every applicable **MUST** and **MUST NOT** requirement.
- **SPEC-CONFORMANCE-002** — A conforming implementation SHOULD satisfy every applicable **SHOULD** and **SHOULD NOT** requirement unless it documents a reason for the exception.

## Stable Requirement Identifiers

Normative clauses selected for conformance traceability use a domain-prefixed identifier such as `MONEY-ARITHMETIC-001`.

- **SPEC-REQUIREMENT-001** — Once published, a requirement identifier MUST remain bound to the same normative meaning.
- **SPEC-REQUIREMENT-002** — An identifier MUST NOT be renumbered merely to close a sequence gap or because its document moves.
- **SPEC-REQUIREMENT-003** — A materially different replacement requirement MUST receive a new identifier.
- **SPEC-REQUIREMENT-004** — A retired requirement identifier MUST NOT be reused.
- **SPEC-REQUIREMENT-005** — Conformance vectors SHOULD reference every normative requirement they exercise.

## Compatibility Policy

This policy defines the portable compatibility surface for FinKore Core. Before
1.0, FinKore remains experimental, but published identifiers and observable
portable semantics are still managed deliberately. FinKore Core 0.9 is the
release-candidate freeze for the Core 1.0 compatibility surface. After 1.0, an
incompatible observable change to this compatibility surface requires a new
major Core version.

The compatibility surface is limited to:

- normative requirements and their stable identifiers;
- portable error codes and their domain-failure meanings;
- canonical `finkore.*` operation identifiers and their language-neutral
  contracts;
- normative portable input and output serializations;
- conformance manifest and vector-file syntax as separately versioned by
  `finkoreConformance` and `finkoreVectorFile`.

It does not include implementation-specific APIs, exception class names,
package-private helpers, storage schemas, persistence models, framework
bindings, transport protocols, HTTP routes, generated documentation shape,
stack traces, localized messages, or test-runner normalization envelopes.

- **SPEC-COMPATIBILITY-001** — A published requirement identifier MUST NOT be reused for a different normative meaning.
- **SPEC-COMPATIBILITY-002** — A requirement MAY be deprecated, replaced, or superseded only by preserving its identifier and assigning a distinct identifier to any materially different replacement requirement.
- **SPEC-COMPATIBILITY-003** — Deprecation, replacement, or supersession metadata MUST NOT erase the historical identity or traceability of the original requirement.
- **SPEC-COMPATIBILITY-004** — A portable error code MUST NOT be reused for a different domain-failure category.
- **SPEC-COMPATIBILITY-005** — A release MUST classify changing the primary portable error code required for an existing observable failure condition as behaviorally incompatible unless the previous mapping was internally inconsistent and the release explicitly records the correction.
- **SPEC-COMPATIBILITY-006** — A canonical `finkore.*` operation identifier MUST NOT be reused for a different operation contract.
- **SPEC-COMPATIBILITY-007** — A behaviorally incompatible change to a canonical operation's required inputs, success output, portable errors, preconditions, postconditions, or state-mutation effect MUST use a new operation identifier or a documented supersession path.
- **SPEC-COMPATIBILITY-008** — A normative portable serialization MUST preserve the meaning of published member names, requiredness, nullability, value encodings, and result categories.
- **SPEC-COMPATIBILITY-009** — A release MUST classify a portable serialization change as behaviorally incompatible when an older conforming consumer or producer cannot faithfully interpret it.
- **SPEC-COMPATIBILITY-010** — A release MUST classify adding an optional portable serialization member as compatible only when omission preserves the prior semantics and consumers may ignore the member without changing the defined result.
- **SPEC-COMPATIBILITY-011** — A change MUST be classified as editorial only when it does not change observable required behavior. Editorial changes include wording clarifications, typo fixes, document moves, heading changes, additional non-normative examples, and requirement cross-reference repairs meeting that condition.
- **SPEC-COMPATIBILITY-012** — A release MUST classify as behaviorally incompatible any change that alters whether an existing valid input succeeds, whether an existing invalid input fails, the normalized portable result, the primary portable error code, required input shape, required output shape, mutation semantics, or failure atomicity.
- **SPEC-COMPATIBILITY-013** — A regression vector MAY be added without changing the Core version when it exercises existing normative behavior and does not require changing the specification's observable semantics.
- **SPEC-COMPATIBILITY-014** — A regression vector that requires new normative behavior, a changed portable result, or a changed portable error mapping MUST be treated as a specification change rather than a version-neutral regression.

## Release-Candidate Freeze

FinKore Core 0.9 freezes the behavioral candidate intended to become FinKore
Core 1.0. Existing requirement IDs, portable error codes, canonical operation
IDs, and normative serialization shapes are frozen under the compatibility
policy above.

- **SPEC-FREEZE-001** — After the Core 0.9 release-candidate freeze, a normative change MAY be accepted only to correct a demonstrated contradiction, ambiguity, or portability defect.
- **SPEC-FREEZE-002** — An accepted normative correction MUST update the affected specification, conformance vectors or traceability, implementations, tests, Agentic metadata when applicable, and public documentation in the same change.
- **SPEC-FREEZE-003** — A release-candidate correction MUST preserve existing stable identifiers unless the compatibility policy requires a new identifier or documented supersession path.
- **SPEC-FREEZE-004** — Non-normative editorial changes MAY be made when they do not change observable required behavior, portable error mapping, serialization shape, operation contract, mutation semantics, or failure atomicity.

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
- **SPEC-TIMESTAMP-003** — The portable FinKore RFC 3339 profile MUST use a valid proleptic-Gregorian calendar date with a four-digit year from `0001` through `9999`, uppercase `T`, an hour from `00` through `23`, a minute and second from `00` through `59`, and uppercase `Z` or a numeric offset in `+HH:MM` or `-HH:MM` form. Numeric offset hours MUST be from `00` through `23` and offset minutes from `00` through `59`. The RFC 3339 unknown-local-offset form `-00:00`, leap-second values, lowercase `t` or `z`, basic forms without separators, and calendar-invalid dates MUST be rejected.
- **SPEC-TIMESTAMP-004** — Fractional seconds MAY be omitted. When present, they MUST contain from one through nine decimal digits. A timestamp with more than nine fractional digits MUST be rejected rather than truncated or rounded.
- **SPEC-TIMESTAMP-005** — Timestamp ordering and equality MUST compare the exact represented instant at nanosecond precision. Equivalent numeric offsets MUST compare as the same instant, and an implementation MUST NOT use a conversion that loses any accepted fractional digit.
- **SPEC-TIMESTAMP-006** — FinKore Core does not define one canonical lexical spelling for equivalent timestamp instants. An operation that returns a caller-supplied valid timestamp MUST preserve that serialized value exactly unless its governing domain specification explicitly requires normalization.
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
| Workflow | `FINKORE_WORKFLOW_INVALID_INSTANCE` | [A Workflow instance observation is malformed](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_INVALID_STATE` | [A State is missing or undeclared](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_INVALID_TRANSITION` | [A requested directed Transition is undeclared](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_GUARD_REJECTED` | [A Transition Guard rejected a request](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_TERMINAL_STATE` | [A Transition Request would leave a terminal State](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_VERSION_MISMATCH` | [A supplied Workflow definition version does not match the instance binding](workflow/errors.md). |
| Workflow | `FINKORE_WORKFLOW_STATE_CONFLICT` | [An expected current State or Workflow Instance Revision does not match](workflow/errors.md). |
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

- Should identifiers receive a common serialized envelope in a later interchange specification?

## Non-Goals

This document does not select a schema language, error transport, decimal library, identifier format, or timestamp storage mechanism.
