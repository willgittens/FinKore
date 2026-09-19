# Entity Evolution

## Status

**FinKore Core 0.9 release candidate.**

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
Revision is not the stable Entity identity. Core 0.9 release candidate refines current,
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

**Replacement** and **Amendment** do not have portable Core 0.9 release candidate
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

Portable Entity evolution is audit-required in Core 0.9 release candidate. The composing domain
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

This draft does not require one serialized envelope or API shape. Conformance
vectors may use fixture vocabulary to observe the same portable semantics.

## Requirements

- **ENTITY-EVOLUTION-001** - Recording Entity evolution MUST NOT change the stable identity of any continuing Financial Entity.
- **ENTITY-EVOLUTION-002** - When a composing domain uses Entity Revisions, each Revision identity MUST identify a particular declared Entity observation or version, MUST be stable within its revision scope, and MUST remain distinct from stable Entity identity.
- **ENTITY-EVOLUTION-003** - When a composing domain uses Evolution Relations, each relation identity MUST identify the relationship itself, MUST be stable within its relation scope, and MUST NOT be treated as the identity of the source or related Entity.
- **ENTITY-EVOLUTION-004** - Correction, Reversal, Void, and Supersession MUST be treated as distinct evolution concepts; an implementation MUST NOT silently treat one successful or failed evolution kind as another.
- **ENTITY-EVOLUTION-005** - Replacement and Amendment MUST NOT be treated as portable Core 0.9 release candidate evolution operations unless a composing specification explicitly defines their meaning and maps them to one or more portable evolution concepts.
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
[Entity Errors](errors.md). Core 0.9 release candidate does not introduce a dedicated evolution
error code.

## Open Questions

- Should a future draft define a common serialized envelope for Evolution
  Relations?
- Should a future draft define branch-aware supersession graphs, or require
  composing domains to maintain a single current successor per declared scope?

## Non-Goals

This document does not define ledger reversal entries, tax treatment,
replacement/amendment semantics, persistence conflict resolution, authorization,
approval invalidation, or Audit Event relationship serialization. Later
Entity/Audit and Approval milestones define their own integration behavior.
