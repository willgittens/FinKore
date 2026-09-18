# Approvals

## Status

**Draft**

## Purpose

This domain defines approval requirements and decisions independently of any particular authorization system.

[Authorization](../glossary.md) answers, “May this Actor perform this operation?” Approval answers, “Has the required business decision been granted?” Authorization to perform an operation must not be treated as evidence that an Approval Requirement is satisfied.

## Requirements

- Approval behavior must be based on declared [Approval Requirements](requirements.md).
- An [Approval Decision](decisions.md) must identify its Approval Requirement, outcome, Actor, time, and association with the relevant subject state or facts.
- An [Approval Chain](chains.md) must define how its Approval Requirements combine and must declare sequencing only when sequencing applies.
- [Approval Composition](composition.md) defines bounded any-of, all-of, quorum,
  staged, and nested group evaluation for Core 0.8. Quorum members reference
  Requirements with explicit distinct voter identities; quorum groups may be
  nested beneath any-of/all-of groups but cannot contain child groups as votes.
  The declared quorum threshold stays fixed when applicability changes; a
  nonempty applicable quorum is rejected when that threshold is unreachable.
  Entirely inapplicable child groups are omitted from parent evaluation; an
  entirely inapplicable composition is approved because no approval is required.
  Applicable groups within a stage combine with all-of semantics; a valid stage
  with no applicable groups does not block progression. Stage lists and each
  stage's declared groups must be nonempty; each stage root starts at depth one
  within the four-group nesting limit. Complete structure and required-evidence
  validation includes later stages and alternative branches before any outcome.
  Pending staged compositions report unique pending applicable Requirements
  through pending groups in their first pending stage, in recursive declared
  order. Coexisting validation failures follow structure, applicability, required
  context, then state/effectiveness priority. Opposing effective Decisions from
  one declared quorum voter are invalid evidence; each member's state uses only
  its matching voter/Requirement evidence. The scoped Agentic review,
  conformance vectors, TypeScript implementation, adapter wiring, and mutation
  hardening are complete for this composition surface.
- [Conditional Approval Requirements](conditions.md) must use explicit domain facts.
- [Approval Validity](validity.md) must derive current effectiveness from append-only history, explicit evaluation context, relevant subject facts or revisions, and lifecycle evidence such as withdrawal, expiration, or supersession.

## Invariants

An Approval outcome must be derivable from the applicable Approval Requirements and effective Approval Decisions.

## Non-Goals

This domain does not define RBAC, authentication, organizational directories,
UI inboxes, notification delivery, delegation, escalation, approval-definition
migration, dynamic approver resolution, arbitrary dependency graphs, or
unrestricted workflow engines.
