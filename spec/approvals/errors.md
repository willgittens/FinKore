# Approval Errors

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines initial portable approval failure categories.

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_APPROVAL_REQUIRED` | A domain action requires approval that is not satisfied. |
| `FINKORE_APPROVAL_INVALID_DECISION` | A proposed decision is missing, malformed, or not permitted. |
| `FINKORE_APPROVAL_INELIGIBLE_ACTOR` | The deciding actor does not satisfy the requirement. |
| `FINKORE_APPROVAL_INVALID_CHAIN` | A chain or composition definition, or its required evaluation evidence, is invalid. |
| `FINKORE_APPROVAL_CONDITION_UNRESOLVED` | A required condition cannot be evaluated from available facts. |
| `FINKORE_APPROVAL_INVALID_CONTEXT` | Required explicit evaluation context for Approval validity is missing or malformed. |

## Requirements

- **APPROVAL-ERROR-001** — A failed Approval Decision MUST NOT change an Approval Requirement or Approval Chain outcome.
- **APPROVAL-ERROR-002** — Error details MAY identify the affected requirement.
- **APPROVAL-ERROR-004** — Error details MUST NOT disclose restricted eligibility or decision data.
- **APPROVAL-ERROR-005** — A failed Approval operation MUST leave existing committed Approval Decisions unchanged.
- **APPROVAL-ERROR-006** — A failed Approval lifecycle operation MUST leave existing committed Approval Decisions and lifecycle events unchanged.
- **APPROVAL-ERROR-007** — Missing or malformed explicit current-effectiveness evaluation context MUST be distinguishable from an invalid Decision.
- **APPROVAL-ERROR-003** — Missing approval MUST be distinguishable from explicit rejection.
- **APPROVAL-ERROR-008** — Invalid Approval Composition shape, empty stage lists or stages without declared groups, duplicate group or member declarations, duplicate declared quorum voter identities, quorum members without exactly one explicit voter or referencing child groups, unresolved member references, cycles, excessive nesting, invalid quorum thresholds, and missing or conflicting required current state/effectiveness evidence MUST use `FINKORE_APPROVAL_INVALID_CHAIN`.
- **APPROVAL-ERROR-009** — Approval Composition evaluation MUST reuse `FINKORE_APPROVAL_INVALID_CHAIN` for invalid structure or required state/effectiveness evidence, `FINKORE_APPROVAL_CONDITION_UNRESOLVED` for unresolved required applicability, and `FINKORE_APPROVAL_INVALID_CONTEXT` for missing or malformed required current-effectiveness evaluation context. A composing domain action blocked by unsatisfied approval MUST use `FINKORE_APPROVAL_REQUIRED` unless its governing domain specifies a more specific error. Composition MUST NOT introduce a quorum-specific portable error solely for these cases.
- **APPROVAL-ERROR-010** — When multiple Approval Composition validation failures coexist, evaluation MUST return the portable code for the highest-priority applicable failure category in this order: (1) invalid composition structure — `FINKORE_APPROVAL_INVALID_CHAIN`; (2) unresolved required applicability — `FINKORE_APPROVAL_CONDITION_UNRESOLVED`; (3) missing or malformed required evaluation context — `FINKORE_APPROVAL_INVALID_CONTEXT`; (4) missing or malformed required state/effectiveness evidence — `FINKORE_APPROVAL_INVALID_CHAIN`. Member order, stage order, or a potentially decisive group outcome MUST NOT change that priority.

## Composition Error Priority

The priority in APPROVAL-ERROR-010 governs the returned code, not a prescribed
software architecture. Category 1 applies to the declared composition structure;
category 4 applies to required observation evidence after structure, applicability,
and required context. Sharing INVALID_CHAIN does not give those categories the
same priority. An implementation may return early only when no higher-priority
applicable failure can change the code it returns.

For example, invalid structure takes precedence over unresolved applicability;
unresolved applicability takes precedence over a missing required evaluation
instant; missing required context takes precedence over malformed state evidence.
A Decision whose expiration requires an evaluation instant uses INVALID_CONTEXT
when that instant is missing or malformed. Missing member state alone uses
INVALID_CHAIN. Opposing effective quorum votes under APPROVAL-QUORUM-009 are
invalid evidence in category 4, not a structural failure in category 1. The context requirement itself follows Approval Validity; no
ambient clock or invented context is permitted.

Failures within one category share its portable code. Optional diagnostics remain
subject to APPROVAL-ERROR-004: they must not disclose restricted eligibility or
Decision data. This priority does not require collecting or exposing every defect.
A valid PENDING or REJECTED evaluation outcome is not itself a validation error;
REQUIRED applies to a composing action blocked by that unsatisfied approval.

A quorum threshold is structurally invalid when it is not a positive integer or
exceeds the declared membership before applicability evaluation. A valid quorum
with at least one applicable member and insufficient remaining voting capacity
has the `REJECTED` evaluation outcome under APPROVAL-QUORUM-006; reduced
applicability alone does not produce `FINKORE_APPROVAL_INVALID_CHAIN`.

## Invariants

The 0.9.7 corrections retain existing error categories: malformed condition or
selector declarations and unsupported concrete fact values use
`FINKORE_APPROVAL_INVALID_DECISION`; unavailable facts for a valid condition use
`FINKORE_APPROVAL_CONDITION_UNRESOLVED`. A record that would invalidate retained
lifecycle references uses `FINKORE_APPROVAL_INVALID_DECISION` under
APPROVAL-VALIDITY-015 and leaves both histories unchanged. Missing quorum
eligibility/outcome evidence uses `FINKORE_APPROVAL_INVALID_CHAIN` in composition
category 4; disconnected cycles or unresolved declared references use category 1.
Only composition has the total priority in APPROVAL-ERROR-010. Declaration
validation before accepting a condition result does not create such a priority
for all concrete Approval operations.

At concrete Requirement/Decision record and evaluation boundaries, malformed
subject or eligibility declarations prevent a valid Decision and use
`FINKORE_APPROVAL_INVALID_DECISION`. Missing Decision subject association is
also malformed Decision content under **APPROVAL-DECISION-002**, including in
supplied concrete history. These are structural rejections, not eligibility
failures or successful `PENDING` evaluations. `FINKORE_APPROVAL_INELIGIBLE_ACTOR`
instead describes an Actor failing a valid eligibility rule. Valid historical
Decisions can be ineffective for the currently evaluated Requirement without
being structurally invalid.

This explains the existing invalid-Decision category and missing-subject/
missing-eligibility conformance outcomes; it adds no portable error. It does
not impose a new total ordering of unrelated concrete Approval errors. The
composition-only priority in **APPROVAL-ERROR-010** remains unchanged, as do
`FINKORE_APPROVAL_INVALID_CONTEXT` for required evaluation context and
`FINKORE_APPROVAL_INVALID_CHAIN` for malformed composition observations.

A failed Approval operation must leave existing committed Approval Decisions and lifecycle events unchanged.

## Open Questions

- Should explicit rejection have its own portable blocking code?

## Non-Goals

This catalog does not define authorization failures or transport representations.
