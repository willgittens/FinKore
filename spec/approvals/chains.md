# Approval Chains

## Status

**Draft**

## Purpose

This document defines how multiple Approval Requirements combine. The term Approval Chain does not by itself imply sequencing.

## Requirements

- **APPROVAL-CHAIN-001** — An Approval Chain MUST contain one or more declared Approval Requirements.
- **APPROVAL-CHAIN-002** — It MUST declare whether its Approval Requirements are sequential or unordered.
- **APPROVAL-CHAIN-003** — An unordered chain MUST NOT be interpreted as sequential.
- **APPROVAL-CHAIN-004** — A sequential chain MUST NOT activate a later Approval Requirement before its predecessor is satisfied.
- **APPROVAL-CHAIN-005** — An Approval Chain MUST be `APPROVED` only when every applicable Approval Requirement is approved.
- **APPROVAL-CHAIN-006** — Such a chain MUST remain `PENDING` while at least one applicable Approval Requirement remains pending and no effective rejection determines the outcome.
- **APPROVAL-CHAIN-007** — Every Approval Chain definition MUST state how an effective rejection determines its outcome.
- **APPROVAL-CHAIN-008** — Evaluation MUST be deterministic from the chain definition, applicable requirements, and effective decisions.

## Invariants

An Approval Chain outcome must be consistent with its sequencing declaration and effective required Approval Decisions.

## Examples

```text
Manager approval → Finance approval
Manager approval AND Finance approval
```

The arrow denotes a sequential chain. `AND` denotes an unordered all-required chain; it does not imply that either Approval Requirement occurs first.

## Invalid Examples

- Reporting a chain as approved while a required step remains pending.
- Reordering sequential requirements without changing the declared chain.

## Open Questions

- Which future approval semantics should define quorum, any-of, or other non-all-required combination rules?
- How should a future specification version and migrate Approval Chain definitions when a definition changes mid-process?

## Non-Goals

FinKore Core Draft 0.1 does not define quorum, any-of, delegation, complex dependency graphs, or migration between Approval Chain definitions.

