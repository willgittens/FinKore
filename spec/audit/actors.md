# Audit Actors

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines attribution of domain events to Actors. An Actor may be a human, service, scheduled process, system, integration, or another identified subject.

## Requirements

- **AUDIT-ACTOR-001** — An actor reference MUST include a stable identifier.
- **AUDIT-ACTOR-007** — An actor reference SHOULD include an actor type.
- **AUDIT-ACTOR-008** — Later changes to an Actor profile MUST NOT change the Actor identity recorded by a committed Audit Event.
- **AUDIT-ACTOR-002** — Actor identifiers MUST be treated as opaque.
- **AUDIT-ACTOR-003** — Display names MAY be captured as historical metadata but MUST NOT replace stable identity.
- **AUDIT-ACTOR-004** — If an unknown Actor is represented, that representation MUST distinguish unknown attribution from a known Actor and MUST NOT invent an identity. [Audit Events](events.md) also permits omission when no Actor is known.
- **AUDIT-ACTOR-005** — Delegation or acting-on-behalf-of relationships SHOULD preserve both the initiating and represented subjects when domain-relevant.
- **AUDIT-ACTOR-006** — Actor data MUST follow applicable [redaction](redaction.md) rules. In Core 0.9 release candidate, actor redaction is limited to optional actor context: `actor.displayName` and `actor.metadata`. A redacted actor representation MUST preserve actor `id` and any supplied actor `type`, MUST replace each redacted optional actor member with a redacted representation distinguishable from original absence under **AUDIT-REDACTION-002**, and MUST leave an omitted actor member omitted. A redaction policy MUST identify these actor targets using exactly `actor.displayName` or `actor.metadata`. Core 0.9 release candidate does not permit redacting actor identity or actor type because those fields carry audit attribution semantics.
- **AUDIT-ACTOR-009** — When an Audit Event supplies an `actor` member, it MUST be a JSON object containing `id` as a non-empty string. If `type` or `displayName` is supplied, including when it is supplied as explicit null, that member MUST be a non-empty string. A supplied actor that violates this portable shape MUST be rejected with `FINKORE_AUDIT_ACTOR_INVALID`; omitting the event's `actor` member remains the representation for unknown attribution permitted by **AUDIT-ACTOR-004**.
- **AUDIT-ACTOR-010** — `actor.metadata` MAY be omitted or supplied as any JSON value, including explicit null. An implementation MUST preserve whether `actor.metadata` was supplied, and MUST preserve its JSON value until an applicable redaction rule replaces it. Omitted metadata, supplied null metadata, and redacted metadata MUST remain distinguishable. A supplied non-JSON metadata value MUST be rejected with `FINKORE_AUDIT_ACTOR_INVALID`.

## Invariants

Later changes to an Actor's profile must not change the identity recorded by a committed Audit Event.

Supplying `actor.metadata: null` records present metadata whose value is null;
it does not mean that the member was omitted. A policy targeting
`actor.metadata` redacts either a null or non-null supplied value, while an
omitted member remains omitted under **AUDIT-ACTOR-006**.

## Core 0.9.3 correction note (non-normative)

**AUDIT-ACTOR-010** makes the previously missing metadata nullability boundary
explicit as required by **SPEC-NULLABILITY-001**. It preserves the existing
meaning of supplied actor context and redaction, and does not relax the
non-empty-string rules for `id`, `type`, or `displayName`. Accepting explicit
null metadata and preserving its presence corrects a portability ambiguity;
the optional member is compatible under **SPEC-COMPATIBILITY-010**. Rejecting
explicit null for the optional string members is a clarification of the
existing "if supplied" rule, not a new valid-input restriction.

## Example

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

```json
{
  "type": "service",
  "id": "settlement-importer"
}
```

## Invalid Examples

- Using a mutable display name as the sole actor identity.
- Attributing an automated event to a human who did not initiate it.

## Open Questions

- Which explicit representation should denote an unknown actor?

## Non-Goals

This document does not define authentication, authorization, user directories, or role assignment.
