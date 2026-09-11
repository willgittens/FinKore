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
- [Conditional Approval Requirements](conditions.md) must use explicit domain facts.
- [Approval Validity](validity.md) must derive current effectiveness from append-only history, explicit evaluation context, relevant subject facts or revisions, and lifecycle evidence such as withdrawal, expiration, or supersession.

## Invariants

An Approval outcome must be derivable from the applicable Approval Requirements and effective Approval Decisions.

## Non-Goals

This domain does not define RBAC, authentication, organizational directories, UI inboxes, notification delivery, quorum, delegation, escalation, approval-definition migration, or complex dependency graphs.
