# Approvals

## Status

**Draft**

## Purpose

This domain defines approval requirements and decisions independently of any particular authorization system.

[Authorization](../glossary.md) answers, “May this Actor perform this operation?” Approval answers, “Has the required business decision been granted?” Authorization to perform an operation MUST NOT be treated as evidence that an Approval Requirement is satisfied.

## Requirements

- Approval behavior MUST be based on declared [Approval Requirements](requirements.md).
- An [Approval Decision](decisions.md) MUST identify its Approval Requirement, outcome, Actor, time, and association with the relevant subject state or facts.
- An [Approval Chain](chains.md) MUST define how its Approval Requirements combine and MUST declare sequencing only when sequencing applies.
- [Conditional Approval Requirements](conditions.md) MUST use explicit domain facts.

## Invariants

An Approval outcome MUST be derivable from the applicable Approval Requirements and effective Approval Decisions.

## Non-Goals

This domain does not define RBAC, authentication, organizational directories, UI inboxes, notification delivery, withdrawal, supersession, quorum, delegation, expiration, escalation, approval-definition migration, or complex dependency graphs.

