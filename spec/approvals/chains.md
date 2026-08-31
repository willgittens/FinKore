# Approval Chains

## Status

**Draft**

## Purpose

This document defines how multiple Approval Requirements combine. The term Approval Chain does not by itself imply sequencing.

## Requirements

- An Approval Chain MUST contain one or more declared Approval Requirements.
- It MUST declare whether its Approval Requirements are sequential, unordered, or combined by another explicitly defined rule.
- An unordered chain MUST NOT be interpreted as sequential.
- A sequential chain MUST NOT activate a later Approval Requirement before its predecessor is satisfied.
- An Approval Chain using the all-required rule is `APPROVED` only when every applicable Approval Requirement is approved.
- Such a chain is `PENDING` while at least one applicable Approval Requirement remains pending and no effective rejection determines the outcome.
- Every Approval Chain definition MUST state how an effective rejection determines its outcome.
- Evaluation MUST be deterministic from the chain definition, applicable requirements, and effective decisions.

## Invariants

An Approval Chain outcome MUST be consistent with its declared combination rule and effective required Approval Decisions.

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

- Should quorum, any-of, and other non-all-required combination rules be standardized in the first conformance suite?
- How should a chain react when its definition changes mid-process?

