# Draft 0.4 Cross-Language Portability Contract

## Status

Accepted for FinKore Core Draft 0.4 on 2026-09-15.

This record closes the Draft 0.4 "Cross-language portability contract"
milestone for TASK-186 through TASK-193. It records the language-neutral
boundaries that a future Python or Java implementation must follow without
promoting Python, Java, JavaScript, TypeScript, JSON tooling, or conformance
fixtures into the source of financial semantics.

No financial behavior, portable error code, canonical operation identifier,
conformance vector, runner behavior, TypeScript core behavior, or Agentic
descriptor changed in this milestone.

## Reviewed Artifacts

- Foundation plan: `docs/plans/draft-0.4-foundation-task-list.md`.
- Release baseline and readiness contract: `docs/releases/draft-0.4.md`.
- CoreDoc: `docs/coreDoc/core-doc.md` and
  `docs/coreDoc/draft-0.4-alignment.md`.
- Specification: `spec/conventions.md`, `spec/glossary.md`, and all Money,
  Workflow, Audit, Approvals, and Entities specification files.
- Prior stabilization record: `spec/draft-0.4-stabilization.md`.
- Conformance contract: `conformance/README.md`, `conformance/conventions.md`,
  `conformance/vector.schema.json`, `conformance/manifest.json`, and all
  manifest-listed vector files.
- Agentic Contract: `agentic/README.md`, `agentic/conventions.md`,
  `agentic/effects.md`, `agentic/errors.md`, `agentic/discovery.md`,
  `agentic/capabilities.md`, and `agentic/operations.md`.
- TypeScript public documentation and adapter boundary documentation:
  `implementations/typescript/core/README.md`,
  `implementations/typescript/adapters/conformance/README.md`, and public
  TypeScript source JSDoc where behavior is surfaced.

## Finding Summary

| Finding ID | Task | Classification | Resolution |
| --- | --- | --- | --- |
| `D04-PORT-186-001` | Abstract values | ACCEPTED | Normative abstract values, normative serialization, conformance-only fixture shapes, and idiomatic production API freedom are distinguishable from current artifacts. |
| `D04-PORT-187-001` | Decimal and numeric portability | ACCEPTED | Current Money vectors have one intended outcome for Python `decimal` and Java decimal/integer models when implementations follow exact base-10 semantics and explicit rounding. Deferred precision floors and overflow limits remain non-blocking. |
| `D04-PORT-188-001` | Structure, time, order, identity | ACCEPTED | Omitted versus null, redaction sentinels, ordered arrays, opaque identifiers, case sensitivity, timestamps, immutable observations, and deterministic diagnostics have sufficient language-neutral boundaries for Draft 0.4. |
| `D04-PORT-189-001` | Operation inventory | ACCEPTED | All 35 manifest-listed operation labels are inventoried as 20 canonical Agentic operations and 15 conformance-local fixture labels with vector and requirement evidence. |
| `D04-PORT-190-001` | Python readiness | ACCEPTED | A Python implementation can use idiomatic public APIs while preserving normative decimal, datetime, mapping/order, error, immutable observation, and adapter-normalization behavior. |
| `D04-PORT-191-001` | Java readiness | ACCEPTED | A Java implementation can use idiomatic public APIs while preserving normative `BigDecimal`-class decimal behavior, `java.time` instant handling, collection order, error, immutable observation, and adapter-normalization behavior. |
| `D04-PORT-192-001` | Blocker remediation | ACCEPTED | No unresolved Python or Java portability blocker was found; no spec-first correction or conformance-vector change was required. |
| `D04-PORT-193-001` | Portability gate | ACCEPTED | Draft 0.4 behavior is implementable in Python and Java without language-specific semantic invention and without claiming either implementation or conformance. |

All findings are review findings. No external review is claimed.

## Abstract Value and Representation Boundary

| Value or boundary | Normative semantics | Normative serialization | Conformance-only representation | Idiomatic implementation freedom |
| --- | --- | --- | --- | --- |
| Money | Exact signed base-10 amount paired with one currency; numeric equality ignores insignificant trailing zeros. | Money JSON uses `amount` as a plain decimal string and `currency` as a valid currency string. | Normalized Money values use canonical decimal strings for comparison; `money.deserialize` and `money.serialize` are representation boundary labels. | Store decimals as language decimals, scaled integers, or another exact model that preserves observable behavior. |
| Rates and scalars | Exact base-10 scalar; percentage rates divide by 100 exactly before application. | Conformance Rate inputs use `kind` and decimal-string `value` for current vectors. | The Rate fixture shape is an adapter input model, not a public production API requirement. | Public APIs may expose typed rates, value objects, or functions. |
| Rounding policy | Explicit target scale and supported mode are required when precision is reduced. | Current vectors encode `scale` as a non-negative integer and `mode` as the specified uppercase value. | The request member names are fixture vocabulary. | Implementations may map to native rounding enums if the FinKore mode semantics are preserved. |
| Currency identifiers | Identifiers are opaque except for the current ISO 4217 uppercase compatibility rule. | Money serialization requires a JSON string satisfying Currency requirements. | Fixture currency strings exercise exact preservation and rejection. | Implementations may use currency value objects or validated strings. |
| Identifiers | Stable and opaque within declared scope; no domain fact is inferred from format. | No common serialized identifier envelope exists in Draft 0.4. | Vector identifiers are strings used to observe exact preservation and conflict checks. | Public APIs may use strings, branded types, records, or objects. |
| States and outcomes | Domain names are exact and case-sensitive where supplied; no locale or label normalization. | No common state serialization exists beyond current fixture observations. | Workflow, Approval, and Entity fixtures use exact state/outcome strings. | Implementations may use enums or domain objects if adapter normalization preserves exact observations. |
| Timestamps | Domain timestamps identify unambiguous instants and serialized timestamps use RFC 3339 date-time with `Z` or explicit numeric offset. | Serialized timestamp values are strings where domain specs require them. | Vectors supply explicit timestamp strings; no vector depends on host time. | Implementations may use native datetime types if offset/instant semantics are preserved at the boundary. |
| Collections and histories | Declared order is meaningful when the specification says so; object/map member order is not meaningful. | JSON arrays preserve declared order; JSON object member order carries no meaning. | Histories, stages, ratios, actions, and relationships use arrays when order is observable. | Implementations may use lists, arrays, immutable collections, or maps with explicit ordering metadata. |
| Results and observations | Success and failure observations are domain-specific; failed operations are non-mutating where specified. | No production-wide result envelope is specified. | Normalized conformance uses `expected.status`, `value` or `error`, and optional `observations`. | Public APIs may throw, return result objects, or use language-native error handling if portable codes and observations can be adapted. |
| Portable errors | Codes are stable language-neutral domain categories; messages and class names are non-portable. | Portable code strings follow `FINKORE_<DOMAIN>_<ERROR>`. | Normalized errors compare only `error.code` and requested observations. | Exception hierarchies, diagnostics, and transport mapping are language-specific. |
| Absence and redaction | Absent, null, and redacted values are distinct where observable. | Explicit JSON `null` is allowed only where specified; no common production redaction envelope exists. | Conformance uses `{"presence":"ABSENT"}` and `{"presence":"REDACTED"}` sentinels when needed. | Implementations may use optionals, nulls, sealed sentinels, or redaction objects if normalization preserves distinctions. |
| Operation inputs | Inputs express logical operands, explicit facts, policies, and current observations. | Normative serialization exists only where specifications define it, currently Money and timestamp strings at specified boundaries. | Vector `input` and optional `context` are adapter fixtures. | Production method signatures, constructors, modules, services, and persistence boundaries remain idiomatic. |

The boundary is intentionally asymmetric: `/spec` defines financial behavior,
`/conformance` defines executable observations, `/agentic` names canonical
operation semantics, and language implementations choose their own public APIs.
No future port is required to copy TypeScript class names, folder layout,
exception hierarchy, decimal internals, or adapter fixture shapes.

## Decimal and Numeric Portability Matrix

| Concern | Draft 0.4 contract | Python desk result | Java desk result | Disposition |
| --- | --- | --- | --- | --- |
| Exact base-10 parsing | Decimal domain values use base-10 semantics and serialized Money amounts use plain decimal strings. | Use `decimal.Decimal` from strings; do not parse through `float`. | Use `BigDecimal(String)` or an equivalent exact parser; do not parse through `double`. | Accepted. |
| JSON numbers | JSON numbers are not portable for serialized decimal values. | Reject numeric Money/Rate boundary values where vectors require strings. | Reject numeric Money/Rate boundary values where vectors require strings. | Accepted. |
| Plain notation | Money amount strings reject exponent notation, leading plus signs, and non-finite tokens. | `Decimal` may parse values FinKore serialization rejects, so boundary validation must precede or constrain parsing. | `BigDecimal` may parse scientific notation when constructed from strings, so boundary validation must precede or constrain parsing. | Accepted. |
| Canonical output | Normalized conformance Money output has no plus sign, exponent, insignificant leading zeros, or negative zero. | Adapter can normalize exact Decimal values without changing numeric meaning. | Adapter can normalize exact BigDecimal values without relying on scale-sensitive equality. | Accepted. |
| Equality and scale | Numeric equality ignores insignificant trailing zeros; representation scale is significant only when a specific operation exposes target scale. | Avoid using tuple/exponent equality as Money equality. | Avoid using `BigDecimal.equals` as Money equality; use numeric comparison semantics. | Accepted. |
| Signed zero | Zero has ordinary numeric meaning and is not negative in canonical normalized output. | Normalize signed zero observations to non-negative zero at the portable boundary. | Preserve numeric zero semantics; do not invent a negative-zero domain distinction. | Accepted. |
| Precision growth | Exact results must not be silently rounded; precision reduction requires explicit policy. | Increase context precision or use integer/coefficient arithmetic so operations do not round implicitly. | `BigDecimal` supports arbitrary precision; avoid `MathContext` that rounds without a FinKore policy. | Accepted. |
| Division | Exact division by a non-zero scalar preserves exact results; non-terminating precision reduction without policy fails. | Detect non-terminating quotients or perform explicit rounding only when supplied. | Use exact division rules or catch non-terminating division and map missing policy to `FINKORE_MONEY_ROUNDING_REQUIRED`. | Accepted. |
| Rounding modes | `HALF_UP`, `HALF_EVEN`, `DOWN`, `UP`, `FLOOR`, and `CEILING` have FinKore signed semantics, including negative boundaries. | Map only when Python mode behavior matches the FinKore definition, especially `DOWN` versus `FLOOR`. | Map only when Java mode behavior matches the FinKore definition, especially `DOWN` versus `FLOOR`. | Accepted. |
| Ratios and allocation units | Ratios and units use exact integer arithmetic, declared order, and no source-total rounding. | Use unbounded integers for unit arithmetic. | Use `BigInteger` or checked integer arithmetic sufficient for vector values. | Accepted. |
| Integer bounds | Draft 0.4 does not define global portable precision, scale, or overflow limits. | May document implementation limits, but cannot change current vector outcomes inside supported range. | May document implementation limits, but cannot change current vector outcomes inside supported range. | Deferred non-blocker. |
| Unsupported capability handling | Unsupported future numeric capability is not silently coerced into current behavior. | Map unsupported values for specified operations through domain error requirements. | Map unsupported values for specified operations through domain error requirements. | Accepted. |

Every current Money vector has one intended Python and Java outcome under this
matrix. No Draft 0.4 precision floor, overflow rule, minor-unit default, private
currency namespace, or presentation-scale obligation is introduced.

## Structural, Time, Order, and Identity Matrix

| Concern | Draft 0.4 contract | Python desk result | Java desk result | Disposition |
| --- | --- | --- | --- | --- |
| Omitted versus null | Absence and explicit null are distinct; null is allowed only when specified. | Distinguish missing mapping keys from `None` at adapter boundaries. | Distinguish absent JSON properties from `null` values. | Accepted. |
| Unknown members | Unknown Money serialization members may be accepted but must not alter amount or currency meaning; vector unknown members are governed by schema/conventions. | Preserve or ignore unknown members only where allowed. | Preserve or ignore unknown members only where allowed. | Accepted. |
| Duplicate object keys | JSON object member order has no meaning; duplicate member behavior is not a domain semantic. | Use a parser or pre-parse validation if duplicate-key diagnostics are needed; no current vector depends on duplicates. | Same; do not infer financial meaning from duplicate parser behavior. | Deferred non-blocker. |
| Map versus array order | Object/map order carries no meaning; array order is significant when declared by a domain or vector. | Do not let dict/hash order determine financial order unless the input is an ordered array. | Do not let map iteration order determine financial order unless the input is an ordered list. | Accepted. |
| Stable declared order | Allocation ratios, Approval stages, sequential Chains, actionables, Audit Relationships, and histories preserve declared or append order when specified. | Use lists or explicit order fields at the boundary. | Use lists or explicit order fields at the boundary. | Accepted. |
| Unicode and ASCII constraints | Portable error codes and operation IDs use ASCII forms; domain identifiers are opaque strings unless a spec narrows them. | Preserve opaque identifiers exactly; avoid case folding or Unicode normalization as domain behavior. | Preserve opaque identifiers exactly; avoid case folding or Unicode normalization as domain behavior. | Accepted. |
| Case sensitivity | Currency ISO codes are uppercase; state, actor, entity, source, revision, and operation identifiers are exact. | Validate currency case and preserve other supplied identity strings exactly. | Validate currency case and preserve other supplied identity strings exactly. | Accepted. |
| RFC 3339 offsets | Serialized timestamps require `Z` or explicit numeric offset and represent unambiguous instants. | Use timezone-aware datetimes at the boundary; reject naive timestamps where invalid. | Use `OffsetDateTime` or `Instant` plus parsed offset evidence as needed. | Accepted. |
| Instant comparison | Expiration and equivalent-offset tests compare instants, not local string forms or host timezone. | Normalize to instants for comparison without using wall-clock defaults. | Normalize to instants for comparison without using system default timezone. | Accepted. |
| Immutable observations | Failed operations leave observable state unchanged where specified; observations should be defensive. | Use immutable values, copies, or transactional construction to avoid partial mutation. | Use immutable value types, defensive copies, or transactional construction to avoid partial mutation. | Accepted. |
| Opaque identifiers | Identifiers do not encode tenancy, state, revision, sequence, permission, or storage facts. | Treat strings or identity objects as opaque. | Treat strings or identity objects as opaque. | Accepted. |
| Diagnostic details | Portable code meaning is stable; optional details must be safe and deterministic where exposed. | Exceptions may carry messages/details, but the adapter compares only portable code and requested observations. | Exceptions may carry messages/details, but the adapter compares only portable code and requested observations. | Accepted. |

Host locale, host timezone, wall-clock time, unseeded randomness, filesystem
enumeration order, object identity, hash iteration order, and parser-specific
diagnostic wording are not FinKore domain inputs.

## Operation, Effects, Preconditions, and Atomicity Inventory

The manifest currently lists 244 vectors across 35 operation labels: 20
canonical `finkore.*` Agentic operations and 15 conformance-local fixture
labels. The table records vector evidence from `conformance/manifest.json`.
Requirement ranges are compact references to the exact stable identifiers
present in those vectors.

| Operation | Authority | Vector evidence | Explicit context | Vector files | Requirement evidence |
| --- | --- | --- | --- | --- | --- |
| `approval.chain.evaluate` | Conformance-local fixture label | 9 vectors; 6 success / 3 error | No separate context member | `approvals/decisions.json` (9) | `APPROVAL-CHAIN-001..009` |
| `approval.composition.evaluate` | Conformance-local fixture label | 19 vectors; 11 success / 8 error | No separate context member | `approvals/composition.json` (19) | `APPROVAL-COMPOSITION-001..024`; `APPROVAL-ERROR-008..010`; `APPROVAL-QUORUM-001..010` |
| `approval.condition.evaluate` | Conformance-local fixture label | 5 vectors; 3 success / 2 error | No separate context member | `approvals/decisions.json` (5) | `APPROVAL-CONDITION-001..002`, `APPROVAL-CONDITION-004..006` |
| `approval.decision.evaluate` | Conformance-local fixture label | 9 vectors; 9 success / 0 error | No separate context member | `approvals/decisions.json` (9) | `APPROVAL-DECISION-002..003` |
| `approval.decision.record` | Conformance-local fixture label | 4 vectors; 1 success / 3 error | No separate context member | `approvals/decisions.json` (4) | `APPROVAL-DECISION-004..007`; `APPROVAL-ERROR-001`, `APPROVAL-ERROR-005`; `APPROVAL-REQUIREMENT-006` |
| `approval.decision.supersede` | Conformance-local fixture label | 1 vector; 1 success / 0 error | No separate context member | `approvals/validity.json` (1) | `APPROVAL-VALIDITY-002`, `APPROVAL-VALIDITY-010` |
| `approval.decision.withdraw` | Conformance-local fixture label | 2 vectors; 1 success / 1 error | No separate context member | `approvals/validity.json` (2) | `APPROVAL-ERROR-006`; `APPROVAL-VALIDITY-002`, `APPROVAL-VALIDITY-004..006`, `APPROVAL-VALIDITY-012` |
| `approval.requirement.evaluate` | Conformance-local fixture label | 16 vectors; 12 success / 4 error | No separate context member | `approvals/decisions.json` (7), `approvals/validity.json` (9) | `APPROVAL-DECISION-001`; `APPROVAL-ERROR-007`; `APPROVAL-REQUIREMENT-001..005`; `APPROVAL-VALIDITY-001`, `APPROVAL-VALIDITY-003..004`, `APPROVAL-VALIDITY-007..011` |
| `approval.requirement.supersede` | Conformance-local fixture label | 1 vector; 1 success / 0 error | No separate context member | `approvals/validity.json` (1) | `APPROVAL-VALIDITY-002`, `APPROVAL-VALIDITY-011` |
| `audit.redact` | Conformance-local fixture label | 5 vectors; 3 success / 2 error | No separate context member | `audit/history.json` (3), `audit/relationships.json` (2) | `AUDIT-ACTOR-006`; `AUDIT-ERROR-001`; `AUDIT-REDACTION-001..003`, `AUDIT-REDACTION-006..007`; `AUDIT-RELATIONSHIP-010..013` |
| `entity.import` | Conformance-local fixture label | 5 vectors; 1 success / 4 error | No separate context member | `entities/import.json` (5) | `ENTITY-IDENTITY-006`; `ENTITY-IMPORT-001..010`; `ENTITY-REVISION-001`, `ENTITY-REVISION-003..006` |
| `finkore.audit.append` | Canonical Agentic operation | 22 vectors; 10 success / 12 error | No separate context member | `audit/history.json` (14), `audit/relationships.json` (8) | `AUDIT-ACTOR-001..004`, `AUDIT-ACTOR-008`; `AUDIT-APPEND-003`; `AUDIT-CHANGE-001..005`; `AUDIT-ERROR-001`; `AUDIT-EVENT-001..005`, `AUDIT-EVENT-008`; `AUDIT-RELATIONSHIP-001..009`, `AUDIT-RELATIONSHIP-012..014` |
| `finkore.audit.remove` | Canonical Agentic operation | 1 vector; 0 success / 1 error | No separate context member | `audit/history.json` (1) | `AUDIT-APPEND-001` |
| `finkore.audit.replace` | Canonical Agentic operation | 1 vector; 0 success / 1 error | No separate context member | `audit/history.json` (1) | `AUDIT-APPEND-001` |
| `finkore.entity.create` | Canonical Agentic operation | 2 vectors; 2 success / 0 error | No separate context member | `entities/behavior.json` (2) | `ENTITY-IDENTITY-001`, `ENTITY-IDENTITY-003`; `ENTITY-LIFECYCLE-001..002`, `ENTITY-LIFECYCLE-006`; `ENTITY-VALIDATION-001` |
| `finkore.entity.evolution.correct` | Canonical Agentic operation | 5 vectors; 1 success / 4 error | No separate context member | `entities/evolution.json` (5) | `ENTITY-EVOLUTION-001..004`, `ENTITY-EVOLUTION-006..010`, `ENTITY-EVOLUTION-013`, `ENTITY-EVOLUTION-015`, `ENTITY-EVOLUTION-022..027`, `ENTITY-EVOLUTION-029..033` |
| `finkore.entity.evolution.reverse` | Canonical Agentic operation | 2 vectors; 1 success / 1 error | No separate context member | `entities/evolution.json` (2) | `ENTITY-EVOLUTION-001`, `ENTITY-EVOLUTION-011..015`, `ENTITY-EVOLUTION-022..024`, `ENTITY-EVOLUTION-029`, `ENTITY-EVOLUTION-032` |
| `finkore.entity.evolution.supersede` | Canonical Agentic operation | 1 vector; 1 success / 0 error | No separate context member | `entities/evolution.json` (1) | `ENTITY-EVOLUTION-019..022`, `ENTITY-EVOLUTION-029`, `ENTITY-EVOLUTION-031..032` |
| `finkore.entity.evolution.void` | Canonical Agentic operation | 2 vectors; 1 success / 1 error | No separate context member | `entities/evolution.json` (2) | `ENTITY-EVOLUTION-006`, `ENTITY-EVOLUTION-016..018`, `ENTITY-EVOLUTION-022..024`, `ENTITY-EVOLUTION-029`, `ENTITY-EVOLUTION-032` |
| `finkore.entity.mutate` | Canonical Agentic operation | 6 vectors; 3 success / 3 error | No separate context member | `entities/behavior.json` (6) | `ENTITY-ERROR-001..002`; `ENTITY-IDENTITY-002`, `ENTITY-IDENTITY-004`; `ENTITY-LIFECYCLE-003`; `ENTITY-MUTABILITY-001..002`, `ENTITY-MUTABILITY-004`, `ENTITY-MUTABILITY-006..007`; `ENTITY-VALIDATION-002..006`, `ENTITY-VALIDATION-008` |
| `finkore.entity.transition` | Canonical Agentic operation | 2 vectors; 1 success / 1 error | No separate context member | `entities/behavior.json` (2) | `ENTITY-ERROR-001`, `ENTITY-ERROR-004`; `ENTITY-IDENTITY-002`; `ENTITY-LIFECYCLE-003` |
| `finkore.money.add` | Canonical Agentic operation | 6 vectors; 5 success / 1 error | No separate context member | `money/arithmetic.json` (6) | `MONEY-ARITHMETIC-001..002`, `MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-009`; `MONEY-CURRENCY-003..004`; `MONEY-ERROR-003`, `MONEY-ERROR-007`; `MONEY-REPRESENTATION-004` |
| `finkore.money.allocate` | Canonical Agentic operation | 16 vectors; 6 success / 10 error | No separate context member | `money/allocation.json` (16) | `MONEY-ALLOCATION-001..013`; `MONEY-ERROR-005`, `MONEY-ERROR-007..008` |
| `finkore.money.applyrate` | Canonical Agentic operation | 12 vectors; 8 success / 4 error | No separate context member | `money/rates.json` (12) | `MONEY-ERROR-001`, `MONEY-ERROR-006`; `MONEY-RATE-001..009`; `MONEY-ROUNDING-001`, `MONEY-ROUNDING-003` |
| `finkore.money.compare` | Canonical Agentic operation | 6 vectors; 4 success / 2 error | No separate context member | `money/comparison.json` (6) | `MONEY-COMPARISON-001..004`, `MONEY-COMPARISON-006`; `MONEY-CURRENCY-003..004`; `MONEY-ERROR-003`, `MONEY-ERROR-007`; `MONEY-REPRESENTATION-005` |
| `finkore.money.divide` | Canonical Agentic operation | 3 vectors; 1 success / 2 error | No separate context member | `money/arithmetic.json` (3) | `MONEY-ARITHMETIC-005..009`; `MONEY-ERROR-004..005`, `MONEY-ERROR-007`; `MONEY-ROUNDING-006` |
| `finkore.money.multiply` | Canonical Agentic operation | 1 vector; 1 success / 0 error | No separate context member | `money/arithmetic.json` (1) | `MONEY-ARITHMETIC-004`, `MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-009` |
| `finkore.money.negate` | Canonical Agentic operation | 2 vectors; 2 success / 0 error | No separate context member | `money/arithmetic.json` (2) | `MONEY-ARITHMETIC-003`, `MONEY-ARITHMETIC-009` |
| `finkore.money.round` | Canonical Agentic operation | 19 vectors; 17 success / 2 error | No separate context member | `money/rounding.json` (19) | `MONEY-ERROR-006`; `MONEY-ROUNDING-001..004`, `MONEY-ROUNDING-008..009` |
| `finkore.money.subtract` | Canonical Agentic operation | 5 vectors; 4 success / 1 error | No separate context member | `money/arithmetic.json` (5) | `MONEY-ARITHMETIC-001..002`, `MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-009`; `MONEY-CURRENCY-004`; `MONEY-ERROR-003`, `MONEY-ERROR-007` |
| `finkore.workflow.transition` | Canonical Agentic operation | 26 vectors; 10 success / 16 error | No separate context member | `workflow/transitions.json` (14), `workflow/versioning.json` (12) | `WORKFLOW-CONFLICT-001..007`; `WORKFLOW-ERROR-001`, `WORKFLOW-ERROR-003..007`; `WORKFLOW-GUARD-001..003`, `WORKFLOW-GUARD-006`; `WORKFLOW-STATES-004..005`, `WORKFLOW-STATES-007`; `WORKFLOW-TERMINAL-001`, `WORKFLOW-TERMINAL-003..004`; `WORKFLOW-TRANSITION-002..006`; `WORKFLOW-VERSION-008..011` |
| `money.deserialize` | Conformance-local fixture label | 11 vectors; 4 success / 7 error | No separate context member | `money/representation.json` (11) | `MONEY-CURRENCY-001`, `MONEY-CURRENCY-005`; `MONEY-ERROR-001..002`; `MONEY-REPRESENTATION-001..004`; `MONEY-SERIALIZATION-001..008`; `SPEC-CURRENCY-002` |
| `money.serialize` | Conformance-local fixture label | 2 vectors; 2 success / 0 error | No separate context member | `money/representation.json` (2) | `MONEY-SERIALIZATION-001..004`, `MONEY-SERIALIZATION-008` |
| `workflow.create` | Conformance-local fixture label | 9 vectors; 2 success / 7 error | No separate context member | `workflow/transitions.json` (6), `workflow/versioning.json` (3) | `WORKFLOW-STATES-001..003`; `WORKFLOW-TERMINAL-002`; `WORKFLOW-TRANSITION-001`; `WORKFLOW-VERSION-001..002`, `WORKFLOW-VERSION-005..007` |
| `workflow.import` | Conformance-local fixture label | 6 vectors; 2 success / 4 error | No separate context member | `workflow/versioning.json` (6) | `WORKFLOW-ERROR-004..005`; `WORKFLOW-IMPORT-001..006`; `WORKFLOW-VERSION-007`, `WORKFLOW-VERSION-010` |

### Operation Semantics Inventory

This table summarizes each operation's language-neutral input/output boundary,
preconditions, error precedence, effects, atomicity, and determinism. Error
lists are exhaustive only when the governing domain error specification says so;
otherwise they are operation-specific summaries plus applicable input validation
errors.

| Operation | Input and success output | Preconditions and error precedence | Effects, atomicity, and determinism |
| --- | --- | --- | --- |
| `approval.chain.evaluate` | Declared Chain mode, ordered Requirement references, and Requirement state observations; returns aggregate `APPROVED`, `PENDING`, or `REJECTED`. | Chain structure and referenced states must be valid; invalid Chain failures use Approval chain/error requirements. | Pure fixture evaluation; no mutation; deterministic from declared order and supplied observations. |
| `approval.composition.evaluate` | Declared root group or ordered stages, groups, Requirement applicability/state evidence, voter Decisions, and evaluation facts; returns composition outcome and actionable Requirement identifiers. | Complete structure, applicability evidence, required context, and state/effectiveness evidence are validated; `APPROVAL-ERROR-010` defines precedence. | Pure fixture evaluation; no mutation; deterministic from supplied evidence, declared order, and bounded traversal. |
| `approval.condition.evaluate` | Condition required fact and explicit fact map; returns `APPLICABLE` or `NOT_APPLICABLE`. | Required fact must be present and condition result must be resolvable; unresolved conditions use `FINKORE_APPROVAL_CONDITION_UNRESOLVED`. | Pure evaluation; no mutation; deterministic for the same supplied facts. |
| `approval.decision.evaluate` | Historical Decision, relevant subject facts, and current facts; returns whether the Decision remains effective. | Decision association and fact observations must be comparable under Approval Decision requirements. | Pure evaluation; no mutation; deterministic structural comparison where object key order is non-semantic and arrays are order-sensitive. |
| `approval.decision.record` | Candidate Decision, Requirement, eligibility evidence, and existing Decision history; returns appended history observation. | Decision shape, timestamp, outcome, Requirement association, and Actor eligibility must be valid; ineligible Actor and invalid Decision codes apply. | State-changing fixture observation; failed recording preserves existing Decision history; deterministic from supplied evidence. |
| `approval.decision.supersede` | Existing Decision history and supersession lifecycle evidence; returns history with lifecycle evidence. | Supersession evidence must identify the target Decision and comply with validity requirements. | State-changing fixture observation; preserves Decision history; deterministic from supplied lifecycle evidence. |
| `approval.decision.withdraw` | Existing Decision history and withdrawal lifecycle evidence; returns history with withdrawal evidence. | Withdrawal evidence must be valid and non-duplicate; duplicate/invalid lifecycle failure uses Approval error requirements. | State-changing fixture observation; failed withdrawal preserves Decision and lifecycle history; deterministic from supplied evidence. |
| `approval.requirement.evaluate` | Requirement, Decision/effectiveness observations, applicability facts, and explicit evaluation instant when expiration is relevant; returns Requirement state. | Requirement identity, subject, eligibility, current effectiveness, expiration context, and applicability must satisfy Approval requirements. | Pure evaluation; no mutation; deterministic from supplied Decisions, facts, and instant. |
| `approval.requirement.supersede` | Existing Requirement lifecycle evidence and supersession evidence; returns updated lifecycle observation. | Supersession evidence must be valid and bound to the Requirement. | State-changing fixture observation; preserves Decision history; deterministic from supplied evidence. |
| `audit.redact` | Committed Audit history, redaction policy, target event, and evidence event; returns redacted representation plus evidence. | Redaction policy, preserved event meaning, Actor redaction boundaries, and relationship preservation must be valid; invalid redaction or invalid evidence codes apply. | Does not rewrite committed source history; failed redaction preserves history; deterministic from supplied policy and event. |
| `entity.import` | Supplied Entity observation, optional source identity mapping, revision history, conflict version, and expected preconditions; returns imported observation. | Identity mapping, state, current/historical revisions, and expected state/revision/conflict-version must be valid; identity failures precede conflict failures where specified. | Conformance-local observation only; failed import returns no partial import; deterministic from supplied observation. |
| `finkore.audit.append` | Logical Audit history and candidate Audit Event; returns history with appended event. | Event identity/content, entity reference, timestamp, Actor, Change, Relationship, and duplicate checks must be valid; domain rules define primary Audit code. | State-changing logical append; failed append preserves committed history and relationships; deterministic for supplied history/event. |
| `finkore.audit.remove` | Logical Audit history and removal attempt; returns portable append-only failure. | Committed event removal is prohibited by append-only requirements. | No successful mutation; history remains unchanged; deterministic denied operation. |
| `finkore.audit.replace` | Logical Audit history and replacement attempt; returns portable append-only failure. | Committed event replacement is prohibited by append-only requirements. | No successful mutation; history remains unchanged; deterministic denied operation. |
| `finkore.entity.create` | Entity definition, identity, initial state, and initial data; returns created Entity observation. | Identity, lifecycle, and structural validation must succeed. | State-changing creation observation; no partial Entity result on failure; deterministic from supplied definition/data. |
| `finkore.entity.evolution.correct` | Source Entity/revision, corrected related Entity or Revision, relation identity, optional expected preconditions, and Audit evidence; returns evolution relation/currentness observations. | Correction eligibility, source/related identity, expected preconditions, and required Audit evidence must be valid; primary domain failures retain their code. | State-changing; failed correction preserves source, related observations, existing relations, and Audit history; deterministic from supplied evidence. |
| `finkore.entity.evolution.reverse` | Source Entity/revision, reversing related Entity or Revision, relation identity, optional expected preconditions, and Audit evidence; returns evolution relation observation. | Reversal eligibility, duplicate policy, identities, preconditions, and Audit evidence must be valid. | State-changing; failed reversal preserves source, related observations, existing relations, and Audit history; deterministic from supplied evidence. |
| `finkore.entity.evolution.supersede` | Predecessor Entity/revision, successor Entity or Revision, relation identity, scope evidence, and Audit evidence; returns supersession/currentness observation. | Supersession must preserve predecessor facts and validate identities, currentness, and required evidence. | State-changing; failed supersession preserves predecessor/successor observations and Audit history; deterministic from supplied evidence. |
| `finkore.entity.evolution.void` | Source Entity/revision, void relation identity, optional expected preconditions, and Audit evidence; returns void/nullification observation. | Void eligibility, identity, precondition, and Audit evidence requirements must pass. | State-changing; failed void preserves source facts, currentness, existing relations, and Audit history; deterministic from supplied evidence. |
| `finkore.entity.mutate` | Entity observation, declared mutation, mutability policy, and validation rules; returns mutated Entity observation. | Mutation must be recognized and permitted in current state; immutable fields and validation failures use Entity error requirements. | State-changing; failed mutation preserves identity, current State, and data; deterministic from supplied policy/rules. |
| `finkore.entity.transition` | Entity observation and Workflow transition request; returns Entity with updated lifecycle State. | Underlying Workflow transition and Entity lifecycle identity requirements must pass; primary Workflow failures retain Workflow codes. | State-changing; failed transition preserves Entity identity, state, and data; deterministic when Workflow guards are deterministic. |
| `finkore.money.add` | Two Money values; returns exact sum in operand currency. | Both operands must be valid and currency-compatible; mismatch uses `FINKORE_MONEY_CURRENCY_MISMATCH`. | Pure value operation; operands unchanged on success or failure; deterministic exact base-10 arithmetic. |
| `finkore.money.allocate` | Money value plus equal-part or ratio request and explicit target scale; returns ordered Money list. | Source must be whole allocation units at target scale; method, parts, ratios, and scale must be valid. | Pure value operation; source unchanged on success or failure; deterministic integer unit allocation in declared order. |
| `finkore.money.applyrate` | Money value, Rate kind/value, and optional explicit rounding; returns exact or explicitly rounded Money. | Money, Rate representation, and rounding policy must be valid; invalid Rate maps to amount error and invalid rounding maps to rounding error. | Pure value operation; source unchanged on success or failure; deterministic exact base-10 multiplication. |
| `finkore.money.compare` | Two Money values; returns `LESS`, `EQUAL`, or `GREATER`. | Both operands must be valid and currency-compatible; mismatch uses `FINKORE_MONEY_CURRENCY_MISMATCH`. | Pure value operation; operands unchanged; deterministic exact numeric comparison. |
| `finkore.money.divide` | Money value and non-zero exact decimal scalar, plus explicit rounding if required; returns exact or explicitly rounded Money. | Scalar must be non-zero; required precision reduction needs an applicable rounding policy. | Pure value operation; operand unchanged on success or failure; deterministic exact base-10 division/error classification. |
| `finkore.money.multiply` | Money value and exact decimal scalar; returns exact product in same currency. | Money and scalar must be valid. | Pure value operation; operand unchanged; deterministic exact base-10 multiplication. |
| `finkore.money.negate` | Money value; returns exact additive inverse in same currency. | Money must be valid. | Pure value operation; operand unchanged; deterministic sign reversal. |
| `finkore.money.round` | Money value, target scale, and rounding mode; returns Money at target scale. | Scale and mode must be valid and supported. | Pure value operation; operand unchanged; deterministic FinKore rounding semantics. |
| `finkore.money.subtract` | Two Money values; returns exact difference in operand currency. | Both operands must be valid and currency-compatible; mismatch uses `FINKORE_MONEY_CURRENCY_MISMATCH`. | Pure value operation; operands unchanged on success or failure; deterministic exact base-10 arithmetic in operand order. |
| `finkore.workflow.transition` | Workflow definition/instance, target State, supplied guard facts, version binding, and optional expected state/revision; returns updated instance observation. | Definition/instance/version/state/conflict/terminal/transition/guard validations follow `WORKFLOW-ERROR-007` precedence. | State-changing; failed transition preserves current State, revision, and binding; deterministic when supplied guards are deterministic. |
| `money.deserialize` | Portable Money JSON candidate; returns valid Money observation. | `amount` and `currency` must satisfy Money serialization, amount, and currency rules; unknown members cannot alter meaning. | Boundary parse fixture; no production API obligation; deterministic validation and normalization. |
| `money.serialize` | Money observation; returns normative portable Money JSON. | Money must be valid and serialization must preserve numeric amount and currency. | Boundary serialization fixture; no production API obligation; deterministic locale-independent output. |
| `workflow.create` | Workflow definition and initial instance request; returns instance at initial state. | Definition structure, unique states, single initial state, terminal-state constraints, transitions, and version identity must be valid. | Conformance-local creation fixture; failed creation returns no valid instance; deterministic from definition. |
| `workflow.import` | Workflow definition and supplied existing instance observation; returns observed instance. | Current State, version binding, and optional instance revision must be valid and compatible. | Conformance-local import fixture; failed import returns no partial instance and performs no migration; deterministic from supplied observation. |

Operation-wide conclusions:

- Money operations are non-mutating and deterministic; preconditions are valid
  Money/scalar/rate/allocation/rounding inputs and compatible currencies where
  required. Money error lists in Agentic descriptors are operation-specific and
  not exhaustive because input validation can also apply.
- Workflow create/import fixture labels validate structural observations but are
  not canonical public operations. `finkore.workflow.transition` is
  state-changing, deterministic for supplied deterministic guard facts, and
  failed transition/version/conflict checks preserve current State and binding.
- Audit append is state-changing and appends to logical history; replace and
  remove are canonical denied operations used to preserve append-only semantics.
  Failed Audit operations leave committed logical history unchanged.
- Approval fixture labels observe current Draft 0.1 through Draft 0.3 behavior
  but remain conformance-local pending public agent-facing input, diagnostics,
  and security review. Failed lifecycle operations preserve Decision and
  lifecycle history where specified.
- Entity canonical operations are state-changing except when rejected. They
  preserve identity, current State, data, revision/currentness observations, and
  Audit history on failure where specified. Entity import remains
  conformance-local and does not define a registry, storage lock, or migration
  format.
- Portable error catalogs are intentionally domain-level rather than exhaustive
  per operation. Error precedence is exhaustive only where the governing domain
  error specification defines a priority rule, such as Workflow transition
  precedence and Approval composition precedence.

## Python Implementation-Readiness Desk Review

| Review area | Result |
| --- | --- |
| Decimal behavior | Ready. Python can implement Money with `decimal.Decimal` or an exact integer model, provided all portable decimal values are parsed from strings, non-FinKore decimal syntax is rejected at boundaries, context precision does not round implicitly, and equality ignores insignificant scale. |
| Immutable/value semantics | Ready. Python dataclasses, frozen values, copies, or transactional construction can preserve non-mutation and failed-operation atomicity. The specification does not require a class model. |
| Exceptions to portable errors | Ready. Python exceptions may be idiomatic; adapters must map primary domain failure categories to portable code strings and must not rely on exception class names or messages as portable semantics. |
| Datetimes | Ready. Offset-aware parsing can preserve RFC 3339 instants and avoid host timezone dependence; naive datetimes are not sufficient at serialized boundaries. |
| Mappings and order | Ready. Dict insertion order must not become domain meaning for JSON objects. Lists or explicit order fields cover allocation, histories, stages, chains, and relationships. |
| Recursion limits | Ready. Approval composition has bounded nesting and cycle/depth validation; Python can implement explicit traversal limits without making recursion depth a public rule. |
| JSON boundaries | Ready. Standard JSON decoding can be used if the adapter preserves missing/null distinctions and validates decimal strings before decimal parsing. Duplicate-key policy is not currently a domain outcome. |
| Adapter normalization | Ready. A Python adapter can translate idiomatic APIs into normalized success/error observations without requiring production APIs to expose conformance result envelopes. |
| Packaging-independent API freedom | Ready. Public module layout, classes, functions, typing, and package versioning remain separate from FinKore Core Draft versioning. |
| Test execution | Ready for Draft 0.5 bootstrap after Milestone E documents onboarding. Current manifest-listed vectors already provide deterministic Python target outcomes. |

No Python-specific portability blocker was found.

## Java Implementation-Readiness Desk Review

| Review area | Result |
| --- | --- |
| `BigDecimal` value/scale distinctions | Ready. Java can use `BigDecimal` if boundaries validate plain decimal strings and Money equality uses numeric comparison rather than `BigDecimal.equals` scale-sensitive equality. |
| Rounding mode mapping | Ready. Java rounding modes can be mapped when each mode is checked against FinKore signed semantics, especially negative `DOWN`, `UP`, `FLOOR`, and `CEILING` cases. |
| Integer limits | Ready. Allocation can use `BigInteger` or checked arithmetic. Draft 0.4 does not define a global overflow or precision floor, so implementations must document local limits without changing current vector outcomes. |
| Immutable/value semantics | Ready. Records, immutable classes, defensive copies, builders used only internally, or transactional services can preserve observations. No Java object model is normative. |
| Exceptions to portable errors | Ready. Checked or unchecked exceptions, result types, and diagnostic objects are implementation choices; portable code mapping is the contract. |
| `java.time` | Ready. `OffsetDateTime` and `Instant` can represent explicit offsets and instant comparison without system-default timezone dependence. |
| Collection order | Ready. Lists preserve declared order; maps must not define financial order unless a specification declares that order. |
| Recursion limits | Ready. Bounded Approval composition can be implemented with explicit validation and cycle detection independent of JVM recursion behavior. |
| JSON boundaries | Ready. JSON libraries may differ on duplicate keys and numeric coercion, so adapters must preserve missing/null distinctions and reject non-portable decimal numbers where required. |
| Adapter normalization | Ready. A Java adapter may wrap any idiomatic API and normalize only observable values, error codes, and requested post-state. |
| Packaging-independent API freedom | Ready. Maven/Gradle coordinates, package names, and module layout remain language-package version decisions. |
| Test execution | Ready for Draft 0.5 bootstrap after Milestone E documents onboarding. Current manifest-listed vectors already provide deterministic Java target outcomes. |

No Java-specific portability blocker was found.

## Blocker Remediation

No `PORTABILITY BLOCKER`, `CONTRADICTION`, or `NORMATIVE CHANGE` finding was
identified in TASK-186 through TASK-191. Therefore TASK-192 required no
spec-first correction, no conformance vector update, no TypeScript regression
change, no mutation-sensitive test addition, no JSDoc update, and no Agentic
descriptor update.

The following items remain explicit non-blocking deferrals:

- common identifier envelope;
- global decimal precision, scale, and overflow limits;
- currency minor-unit defaults or metadata policy;
- private/non-ISO currency namespaces;
- Money presentation-scale preservation beyond numeric amount and currency;
- duplicate JSON member diagnostics as financial behavior;
- portable condition expression language;
- Workflow migration and distributed coordination;
- approval delegation, escalation, dynamic approver resolution, and unrestricted
  dependency graphs;
- Audit provenance expansion, retention rules, cryptographic redaction evidence,
  and distributed total ordering;
- common identity registry, storage locking, concrete migration format, and
  concrete ledger/accounting posting effects.

## Portability Gate

TASK-193 is accepted.

- Abstract values, serialized values, conformance fixture shapes, normalized
  observations, and idiomatic production APIs are explicitly separated.
- Decimal and numeric behavior has deterministic Python and Java implementation
  paths for every current Money vector.
- Structural, timestamp, ordering, identity, optionality, redaction, immutable
  observation, and diagnostic boundaries do not depend on host language defaults.
- All 35 manifest-listed operation labels are inventoried with authority,
  vector counts, success/error coverage, file evidence, and requirement evidence.
- Canonical Agentic operation IDs remain distinct from conformance-local labels.
- Python and Java desk reviews found zero unresolved portability blockers.
- No Python implementation, Java implementation, or Python/Java conformance is
  claimed.
- No external review is claimed.
