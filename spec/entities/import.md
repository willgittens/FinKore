# Entity Import

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines the portable Entity import boundary for observing an
existing Financial Entity, preserving supplied business revision history, and
recording explicit source identity mapping when import or migration uses an
external identity. It does not define a master-data registry, persistence,
deduplication, authorization, or concrete financial document formats.

## Terminology

**Entity Import** is the operation that accepts a supplied existing Entity
observation and returns a validated import observation.

**Source Identity** is an opaque identifier supplied by an external or legacy
system. It does not replace stable FinKore Entity identity.

**Entity Identity Mapping** is explicit evidence that relates a Source Identity
to the stable FinKore Entity identity preserved by import.

**Expected Entity State**, **Expected Entity Revision**, and **Expected Entity
Conflict Version** are optional caller-supplied preconditions checked against
the imported observation.

## Requirements

- **ENTITY-IMPORT-001** - Entity Import MUST preserve the supplied stable FinKore Entity identity. It MUST NOT generate a replacement identity or substitute a Source Identity for stable Entity identity.
- **ENTITY-IMPORT-002** - Entity Import MUST validate the complete supplied Entity observation using the Entity identity, lifecycle, mutability, validation, and referenced Workflow requirements before returning an import observation. Every Structural Validation and Business Validation rule declared for the Entity's supplied current State applies to import in the same way that it applies to an already-observed Entity; import MUST NOT bypass a declared validator merely because no Mutation is being proposed.
- **ENTITY-IMPORT-003** - When Entity Import supplies Source Identity, it MUST also supply explicit Entity Identity Mapping evidence that identifies the source system, source identity, mapped Entity type, mapped Entity identity, and mapping identity.
- **ENTITY-IMPORT-004** - Entity Identity Mapping evidence MUST be preserved as opaque caller-supplied values. An implementation MUST NOT parse source-system formats, infer tenancy, deduplicate entities, or look up a global registry from mapping content.
- **ENTITY-IMPORT-005** - Entity Identity Mapping MUST map to the same stable Entity type and Entity identity as the imported Entity observation.
- **ENTITY-IMPORT-006** - Entity Import MUST preserve supplied Current Entity Revision, Historical Entity Revisions, and Entity Conflict Version as distinct opaque values.
- **ENTITY-IMPORT-007** - Entity Import with an Expected Entity State, Expected Entity Revision, or Expected Entity Conflict Version that does not match the supplied observation MUST fail with `FINKORE_ENTITY_STATE_CONFLICT`.
- **ENTITY-IMPORT-008** - A failed Entity Import MUST NOT return a partially imported Entity, Revision, Mapping, or Conflict Version observation and MUST NOT change any existing Entity observation.
- **ENTITY-IMPORT-009** - Missing, malformed, conflicting, or incomplete identity, mapping, or revision input MUST fail with `FINKORE_ENTITY_INVALID_IDENTITY` unless a more specific primary domain error applies.
- **ENTITY-IMPORT-010** - Entity Import diagnostics, when supplied, MUST remain safe diagnostic context and MUST NOT expose sensitive source identity values, financial values, or implementation storage identifiers by default.

- **ENTITY-IMPORT-011** - Entity Import MUST accept complete valid Entity Identity Mapping evidence when the separate Source Identity is omitted, provided it identifies the source system, source identity, mapping identity, and the same Entity type and identity as the imported observation. It MUST preserve that evidence without synthesizing a separate Source Identity observation. Supplied null or malformed Source Identity MUST still fail under ENTITY-IMPORT-009. Omission of both Source Identity and mapping MUST remain valid when the rest of the import is valid.

- **ENTITY-IMPORT-012** - Every successful bounded Entity Import result MUST include `historicalRevisions` as a list. When supplied history is omitted or an empty list, the result MUST contain `historicalRevisions: []`. Nonempty supplied revisions MUST remain preserved under ENTITY-IMPORT-006. This output normalization MUST NOT synthesize current revisions, identity mapping, or conflict versions, alter input member presence, accept null or malformed history, change error priorities, or expose a partial result on failure. Empty history describes the supplied observation, not proof that no earlier revisions exist.

## Core 0.9.7 empty-history decision (non-normative)

D11 adopts an explicit empty list for successful import observations, an
observable compatibility correction under SPEC-COMPATIBILITY-012/014. Python
and Java previously omitted that result member; TypeScript already returned it.
Consumers comparing
exact object shapes will observe the added field in Python and Java. Input
optionality, nonempty history, portable errors and failure observations remain
unchanged. No canonical Agentic operation is introduced.

## Invariants

Import observes existing Entity continuity. It preserves the stable FinKore
Entity identity or records explicit continuity mapping; it does not create a
global identity registry or select an Entity by searching external systems.

An imported Entity is an observed existing Entity, not a validation bypass. A
validation failure uses `FINKORE_ENTITY_VALIDATION_FAILED` under
**ENTITY-VALIDATION-004** and returns no partial import observation under
**ENTITY-IMPORT-008**.

## Supplied preconditions

Supplied Source Identity is validated independently of whether mapping evidence
is also present. Explicit null or another malformed supplied Source Identity
is not omission and cannot be repaired by taking source values from a valid
mapping. It fails with `FINKORE_ENTITY_INVALID_IDENTITY` under
**ENTITY-IMPORT-009**, without a partial import under **ENTITY-IMPORT-008**.
When both are supplied and valid, their source references agree and the mapping
identifies the imported Entity under **ENTITY-IMPORT-003** and
**ENTITY-IMPORT-005**. Valid identity values remain opaque.

For the optional preconditions in **ENTITY-IMPORT-007**, explicit null is
supplied input, not omission. Null or another malformed expected value cannot
match a valid State, business revision, or conflict-version identifier; an
absent observed revision/token also cannot satisfy a supplied expectation.
These mismatches use `FINKORE_ENTITY_STATE_CONFLICT` and return no partial
import under **ENTITY-IMPORT-008**. Malformed observed identity/revision input
remains subject to **ENTITY-IMPORT-009**. This clarification does not introduce
a total priority among unrelated Entity failures.

## Core 0.9.6 contract decision (non-normative)

The standalone-mapping proposal was accepted for the Milestone 2 regression
baseline. ENTITY-IMPORT-011 resolves the previously unspecified result while
preserving ENTITY-IMPORT-003's requirement for mapping whenever Source Identity
is supplied. Neither explicit null nor malformed Source Identity is omission.

This is a corrective normative addition under
SPEC-COMPATIBILITY-012/014, not an editorial change or a claim of compatibility
for TypeScript's former pair-required behavior. The completed 0.9.6 plan records
the vectors, native regressions, implementation and API migration, returned-
observation reuse, combined verification, fresh review, and local corrective
release closure as historical evidence. Current synchronization follows
[contributor guidance](../../CONTRIBUTING.md). No canonical import operation is
introduced.

## Core 0.9.3 correction note (non-normative)

The clarification to **ENTITY-IMPORT-002** closes a demonstrated portability
defect: one implementation skipped declared Entity validators during import.
It does not add a new validator, change valid import input, or alter error
precedence. Imports that satisfied their declared validation rules remain
valid; imports that violated those already-applicable rules were never
conforming. The correction is therefore compatible under
**SPEC-COMPATIBILITY-011** and **SPEC-COMPATIBILITY-013**.

## Non-Goals

This document does not define concrete invoice migration, database uniqueness,
merge/deduplication, source-system authentication, Workflow definition
migration, state mapping across Workflow definitions, or external-system data
retention policy.
