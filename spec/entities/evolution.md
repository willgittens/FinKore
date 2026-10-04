# Entity Evolution

## Status

**FinKore Core 2.0.1 stable.**

## Purpose

This document defines portable Financial Entity evolution semantics for
correction, reversal, void, and supersession. These operations preserve stable
Entity identity and historical financial facts while allowing a composing domain
to represent later domain outcomes without rewriting the original Entity.

This document does not define invoices, ledger postings, persistence,
authorization, or legal cancellation policy.

## Terminology

An **Entity Revision** is a stable, opaque identifier for a declared observation
or version of a continuing Financial Entity's data or lifecycle State. A
Revision is not the stable Entity identity. Core 2.0 refines current,
historical, import, and conflict-version distinctions in
[Entity Revisions](revisions.md) and [Entity Import](import.md).

An **Evolution Relation** is a stable, opaque relationship between one source
Financial Entity and another Entity, Revision, or evolution outcome. The
relation has its own identity when a composing domain needs to reference it
independently.

A **Correction** records that a later related Entity or Revision carries
corrected financial facts for an earlier source without editing the preserved
source facts in place.

A **Reversal** records that a later related Entity or Revision carries a
domain-defined cancelling or opposite effect for an earlier source without
rewriting the source.

A **Void** records that the source Entity is nullified or no longer valid for
the composing domain's purpose without deleting the source Entity or erasing its
financial facts.

A **Supersession** records that a successor Entity or Revision replaces a
predecessor for current use within a declared supersession scope without
changing the predecessor's stable identity or historical facts.

**Replacement** and **Amendment** do not have portable Core 2.0
semantics. A composing domain may use those terms only when it defines their
meaning and maps them to the portable evolution concepts it relies on.

## Portable Model

A portable evolution request identifies one source Financial Entity and exactly
one evolution kind: correction, reversal, void, or supersession. When an
evolution kind requires a related Entity, Revision, or Evolution Relation, the
request identifies that related value explicitly.

No request member defined by this document is nullable. Omission of the source
Entity reference, evolution kind, or a related value required by the chosen
evolution kind is invalid.

Portable Entity evolution is audit-required in Core 2.0. The composing domain
or caller supplies every Entity Evolution Relation identifier, Audit Event
identifier, and Audit Relationship identifier. A FinKore implementation MUST
NOT generate those identifiers, derive them from mutable financial facts, or
infer them from array order, timestamps, state names, or display labels.

The Audit Event for a successful evolution operation records the affected
source Entity and carries safe metadata identifying the evolution kind, source
Entity identity, source Revision identity, related Entity or Revision identity
when applicable, Evolution Relation identity, and supersession scope when
applicable. The Audit Event also carries an Audit Relationship of the
corresponding type: `CORRECTS`, `REVERSES`, `VOIDS`, or `SUPERSEDES`.

Entity evolution and its Audit evidence are observed atomically. If the Entity
evolution request is rejected, no evolution relation or currentness change is
created. If required Audit evidence is missing or rejected by Audit semantics,
the Entity evolution request fails with the primary Audit error and no Entity
evolution result becomes observable.

Core 2.0 does not require one serialized envelope or API
shape. Conformance vectors may use fixture vocabulary to observe the same
portable semantics.

### Audit validation and correspondence

Audit validity and evolution correspondence are separate checks. Audit validity
uses the supplied Audit history and candidate Event, including Actor,
duplicate-identity, and Relationship validation, in the order defined by
`AUDIT-ERROR-004`. Correspondence then checks whether that valid evidence
describes the requested evolution: affected Entity, kind, source and related
Revision references, Relation identity, scope, and corresponding Relationship.

Under `ENTITY-EVOLUTION-034`, an intrinsic Audit failure wins over a simultaneous
correspondence failure. If Audit validation succeeds but correspondence fails,
the error is `FINKORE_ENTITY_INVALID_MUTATION`. Missing required Audit evidence
remains an Audit failure. This ordering does not prescribe precedence between
Audit validation and unrelated Entity identity, eligibility, Business
Validation, or currentness failures. Validation does not commit either history;
all successful observations remain subject to atomicity.

### Consistent currentness observations

Currentness is evaluated for the exact Entity identity within its identity
scope, Revision identity, and applicable supersession scope. Observations for
different keys do not contradict or override each other. A scope-free observation
does not silently become a statement about every named supersession scope.

Historical currentness is an observation at an evolution step, not a timeless
claim about the present. An ordered sequence can therefore contain both `true`
and `false` for the same key. A change is explained when a declared evolution
effect establishes it: Void nullifies its source, and Supersession makes its
predecessor non-current and its successor current in the declared scope.
Ordering alone does not authorize a change. A later Boolean assertion without
an applicable declared effect cannot override an established observation.

For `ENTITY-EVOLUTION-035`, an unresolved contradiction exists when observations
assign incompatible currentness to the same key at the same evolution step, or
when a change between steps cannot be explained by declared evolution effects
and the supplied history's explicit ordering semantics. This includes an
observation inconsistent with its own operation's required effect. An earlier
current observation followed by a valid Void or Supersession is not a
contradiction. Repeated consistent observations are not contradictions either.

An implementation uses ordering explicitly established by the history contract;
it does not invent precedence from timestamps, identifier spelling, or storage
enumeration. It rejects unresolved contradictions instead of choosing a winning
observation, discarding evidence, or returning success with arbitrary
currentness. Contradictory history is invalid even when the request omits an
expected-currentness precondition. Once currentness is established consistently,
an expectation that disagrees with it remains a state conflict under
`ENTITY-EVOLUTION-025`.

Core does not add an automatic restoration policy, a permanent non-current-wins
rule, or a universal last-record-wins rule. A composing domain may define
additional evolution consequences explicitly; they cannot waive Core's
identity, history-preservation, or atomicity requirements. Conformance uses the
bounded history semantics in [its conventions](../../conformance/conventions.md).

### Supplied source preconditions

For **ENTITY-EVOLUTION-025**, omission of an optional expected source State or
Revision means no corresponding check. Explicit null is supplied input and
cannot match a valid observed State or Revision. It uses
`FINKORE_ENTITY_STATE_CONFLICT`, including when the observed Revision is absent;
it is not a runtime null exception or a reason to skip the precondition.
Malformed observed identity/revision input retains its own domain error.
Failure preserves source and related observations, evolution relations,
currentness, and Audit history under **ENTITY-EVOLUTION-023** and
**ENTITY-EVOLUTION-033**. No total ordering among unrelated Entity failures is
introduced by this clarification.

## Requirements

- **ENTITY-EVOLUTION-001** - Recording Entity evolution MUST NOT change the stable identity of any continuing Financial Entity.
- **ENTITY-EVOLUTION-002** - When a composing domain uses Entity Revisions, each Revision identity MUST identify a particular declared Entity observation or version, MUST be stable within its revision scope, and MUST remain distinct from stable Entity identity.
- **ENTITY-EVOLUTION-003** - When a composing domain uses Evolution Relations, each relation identity MUST identify the relationship itself, MUST be stable within its relation scope, and MUST NOT be treated as the identity of the source or related Entity.
- **ENTITY-EVOLUTION-004** - Correction, Reversal, Void, and Supersession MUST be treated as distinct evolution concepts; an implementation MUST NOT silently treat one successful or failed evolution kind as another.
- **ENTITY-EVOLUTION-005** - Replacement and Amendment MUST NOT be treated as portable Core 2.0 evolution operations unless a composing specification explicitly defines their meaning and maps them to one or more portable evolution concepts.
- **ENTITY-EVOLUTION-006** - Workflow State names, terminal-state status, or display labels such as final, approved, posted, void, reversed, corrected, or superseded MUST NOT by themselves establish evolution eligibility or financial finality. Eligibility and consequences MUST be declared by the composing domain or lifecycle policy.
- **ENTITY-EVOLUTION-007** - An evolution request MUST identify one source Financial Entity, exactly one supported evolution kind, and every related Entity, Revision, or Evolution Relation required by that kind.
- **ENTITY-EVOLUTION-008** - A Correction MUST preserve the source Entity's stable identity and original financial facts while producing or identifying a corrected related Entity or Revision carrying the corrected financial facts.
- **ENTITY-EVOLUTION-009** - A Correction MUST NOT mutate source financial facts in place when the composing domain or lifecycle policy declares those facts no longer directly mutable.
- **ENTITY-EVOLUTION-010** - A Correction request MUST be rejected when the source Entity is not eligible for correction under the composing domain or lifecycle policy.
- **ENTITY-EVOLUTION-011** - A Reversal MUST preserve the source Entity's stable identity and original financial facts while producing or identifying a reversing related Entity or Revision whose cancelling or opposite effect is defined by the composing domain.
- **ENTITY-EVOLUTION-012** - A Reversal MUST NOT erase, overwrite, or negate source financial facts in place.
- **ENTITY-EVOLUTION-013** - When a Correction or Reversal creates or references a related Financial Entity, that related Entity MUST have a stable identity supplied or preserved according to the Entity identity requirements; the implementation MUST NOT infer that identity from mutable source facts.
- **ENTITY-EVOLUTION-014** - A Correction or Reversal request that would duplicate an existing Evolution Relation identity or violate the composing domain's declared duplicate policy MUST be rejected without creating another relation.
- **ENTITY-EVOLUTION-015** - Original financial facts relevant to a corrected or reversed source Entity MUST remain observable after the successful Correction or Reversal.
- **ENTITY-EVOLUTION-016** - A Void MUST represent source nullification without deleting the source Entity.
- **ENTITY-EVOLUTION-017** - A Void MUST NOT remove source identity, source financial facts, or prior evolution and audit evidence.
- **ENTITY-EVOLUTION-018** - A Void request MUST be rejected when the source Entity is not eligible to be voided under the composing domain or lifecycle policy.
- **ENTITY-EVOLUTION-019** - A Supersession MUST relate a predecessor Entity or Revision to a successor Entity or Revision without changing either stable Entity identity.
- **ENTITY-EVOLUTION-020** - Within the composing domain's declared supersession scope, a successfully superseded predecessor MUST NOT be represented as the current Entity or Revision after supersession succeeds.
- **ENTITY-EVOLUTION-021** - A Supersession MUST preserve predecessor financial facts and history; it MUST NOT rewrite the predecessor to match the successor.
- **ENTITY-EVOLUTION-022** - A successful evolution operation MUST leave an observable evolution history or relationship observation that identifies the evolution kind, source Entity identity, related Entity or Revision identity when applicable, and Evolution Relation identity when supplied.
- **ENTITY-EVOLUTION-023** - A rejected evolution request MUST leave source Entity identity, related Entity identity, current lifecycle State, data, Revision identity or currentness, and existing Evolution Relations unchanged.
- **ENTITY-EVOLUTION-024** - A missing, malformed, unsupported, or otherwise invalid evolution request MUST fail with `FINKORE_ENTITY_INVALID_MUTATION` unless a more specific primary domain error applies, and MUST NOT return a successful evolution result.
- **ENTITY-EVOLUTION-025** - An evolution request whose expected source State, Revision, or currentness does not match the observed source MUST fail with `FINKORE_ENTITY_STATE_CONFLICT` and MUST leave the source unchanged.
- **ENTITY-EVOLUTION-026** - An evolution request with a missing, malformed, unstable, or conflicting source or related Entity identity MUST fail with `FINKORE_ENTITY_INVALID_IDENTITY`.
- **ENTITY-EVOLUTION-027** - A Workflow, Money, Approval, or Audit failure encountered as the primary failure while evaluating an Entity evolution request MUST retain its domain-specific portable error code.
- **ENTITY-EVOLUTION-028** - Evolution error diagnostics, when supplied, MUST remain safe diagnostic context and MUST NOT expose sensitive original or related financial values unnecessarily.
- **ENTITY-EVOLUTION-029** - Every successful portable Entity evolution operation MUST produce corresponding Audit evidence in the same observable result.
- **ENTITY-EVOLUTION-030** - Entity Evolution Relation identifiers, Audit Event identifiers, and Audit Relationship identifiers MUST be supplied by the composing domain or caller; an implementation MUST NOT generate, normalize, or infer them from Entity identity, Revision identity, state, time, display labels, or mutable financial facts.
- **ENTITY-EVOLUTION-031** - Audit evidence for Entity evolution MUST identify the evolution kind, source Entity identity, source Revision identity, related Entity or Revision identity when applicable, Evolution Relation identity, and supersession scope when applicable without exposing unrelated sensitive financial values.
- **ENTITY-EVOLUTION-032** - Audit evidence for Entity evolution MUST include an Audit Relationship whose relationship type corresponds to the evolution kind and whose target satisfies the Audit Relationship requirements.
- **ENTITY-EVOLUTION-033** - Entity evolution and required Audit evidence MUST be atomic for portable observation: an Audit failure MUST prevent the evolution relation, currentness change, and success result from becoming observable.
- **ENTITY-EVOLUTION-034** - When validating required evolution Audit evidence, an implementation MUST apply Audit validation in the order defined by `AUDIT-ERROR-004` before selecting an evolution-correspondence error. A failing Audit validation MUST retain its primary Audit error even when correspondence also fails. If Audit validation succeeds but required evolution correspondence fails, the request MUST fail with `FINKORE_ENTITY_INVALID_MUTATION`. Either failure MUST NOT produce a partial evolution or Audit result.
- **ENTITY-EVOLUTION-035** - An implementation MUST reject an evolution request whose supplied or resulting evolution history contains unresolved contradictory currentness observations as defined in the Portable Model with `FINKORE_ENTITY_INVALID_MUTATION`, without selecting an arbitrary winner or changing any supplied Entity, Revision, currentness, evolution-history, or Audit-history observation. It MUST validate supplied-history consistency independently of whether an expected-currentness precondition is supplied and before comparing that expectation with observed currentness. It MUST NOT reject a consistent history solely because declared evolution effects change currentness between historical steps.

## Invariants

Entity evolution preserves identity and historical facts. A successful evolution
operation records a new relationship or currentness outcome; it does not rewrite
the source into a different historical fact pattern. A failed evolution request
does not create partial state.

## Examples

These examples are illustrative and non-normative.

- A finalized invoice with identity `inv-10` is corrected by related invoice
  revision `inv-10/rev-2`; the original amount on `inv-10/rev-1` remains
  observable.
- A payment record is reversed by a separate reversing record; the original
  payment record remains observable and is not edited into a negative payment.
- An issued entity is voided by recording that it no longer has domain effect;
  the entity identity and original facts remain observable.
- A purchase order revision supersedes an earlier revision for current use; the
  earlier revision remains part of history.

## Invalid Examples

- Editing a finalized amount in place and calling the edit a correction.
- Deleting an entity and calling the deletion a void.
- Changing the stable identity of a predecessor to the successor identity during
  supersession.
- Treating a Workflow terminal State named `APPROVED` as universal permission to
  reverse or void every Entity.

## Errors

Entity evolution reuses the existing Entity portable error catalog in
[Entity Errors](errors.md). Core 2.0 does not introduce a dedicated evolution
error code.

## Open Questions

- Should a future specification version define a common serialized envelope for Evolution
  Relations?
- Should a future specification version define branch-aware supersession graphs, or require
  composing domains to maintain a single current successor per declared scope?

## Non-Goals

This document does not define ledger reversal entries, tax treatment,
replacement/amendment semantics, persistence conflict resolution, authorization,
approval invalidation, or Audit Event relationship serialization.
