# Approvals

## Status

Draft.

## Purpose

This domain defines approval requirements and decisions independently of any particular authorization system.

Authorization answers whether an actor is permitted to act. Approval records whether a required actor, role, or subject has made a domain decision. A system MUST NOT treat these concepts as interchangeable.

## Requirements

- Approval behavior MUST be based on declared [requirements](requirements.md).
- A [decision](decisions.md) MUST identify its requirement, outcome, actor, and time.
- An [approval chain](chains.md) MUST define how its requirements combine and, when relevant, their order.
- [Conditional requirements](conditions.md) MUST use explicit domain facts.

## Invariants

An approval outcome MUST be derivable from the applicable requirements and recorded decisions.

## Non-Goals

This domain does not define RBAC, authentication, organizational directories, UI inboxes, or notification delivery.

