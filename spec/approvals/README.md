# Approvals

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

Approvals describes required business decisions and the evidence that makes
them effective for a particular subject and set of facts.

[Authorization](../glossary.md) answers, “May this Actor perform this operation?” Approval answers, “Has the required business decision been granted?” Authorization to perform an operation must not be treated as evidence that an Approval Requirement is satisfied.

## Documents

Start with requirements and conditions, then decisions and validity. Read chains
for sequential or unordered combinations, and composition for groups, quorum,
and stages.

| Document | What you will learn |
| --- | --- |
| [Requirements](requirements.md) | The subject, eligible decision-makers, and required outcome |
| [Conditions](conditions.md) | Whether a Requirement applies to the supplied facts |
| [Decisions](decisions.md) | Recorded outcomes, scoped identity, and fact association |
| [Validity](validity.md) | Whether a historical Decision remains effective now |
| [Chains](chains.md) | Combining Requirements sequentially or without ordering |
| [Composition](composition.md) | All-of, any-of, quorum, and staged evaluation with limited nesting |
| [Errors](errors.md) | Portable failure codes and composition validation priority |

Composition fixture labels are conformance-local; they are not canonical
Agentic operations.

## Requirements

- Approval behavior must be based on declared [Approval Requirements](requirements.md).
- An [Approval Decision](decisions.md) must identify its Approval Requirement, outcome, Actor, time, and association with the relevant subject state or facts.
- An [Approval Chain](chains.md) must define how its Approval Requirements combine and must declare sequencing only when sequencing applies.
- [Approval Composition](composition.md) combines Requirements through bounded
  all-of, any-of, quorum, staged, and nested groups. Its detailed rules cover
  applicability, voter evidence, thresholds, actionability, and complete validation.
- [Conditional Approval Requirements](conditions.md) must use explicit domain facts.
- [Approval Validity](validity.md) must derive current effectiveness from append-only history, explicit evaluation context, relevant subject facts or revisions, and lifecycle evidence such as withdrawal, expiration, or supersession.

Sequential Chain actionability follows the first non-approved Requirement.
Concrete Decision/history boundaries reject caller-asserted effectiveness and
validate eligibility across all supplied Decisions for the evaluated Requirement.
Approval Composition retains its separate lightweight current-effectiveness
observation contract.

## Invariants

An Approval outcome must be derivable from the applicable Approval Requirements and effective Approval Decisions.

## Non-Goals

This domain does not define RBAC, authentication, organizational directories,
UI inboxes, notification delivery, delegation, escalation, approval-definition
migration, dynamic approver resolution, arbitrary dependency graphs, or
unrestricted workflow engines.
