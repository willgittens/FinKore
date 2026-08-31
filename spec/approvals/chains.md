# Approval Chains

## Status

Draft.

## Purpose

This document defines how multiple approval requirements combine.

## Requirements

- A chain MUST contain one or more declared requirements.
- It MUST state whether requirements are sequential, parallel, or combined by an explicitly declared rule.
- A sequential chain MUST NOT activate a later requirement before its predecessor is satisfied unless the chain declares otherwise.
- A chain is approved only when every required applicable requirement is approved.
- A chain is pending while at least one required applicable requirement remains pending and no effective rejection determines the outcome.
- Rejection behavior MUST be explicit; by default, any effective rejection makes the chain rejected.
- Evaluation MUST be deterministic from the chain definition, applicable requirements, and effective decisions.

## Invariants

The chain outcome MUST NOT contradict the outcomes of its effective required decisions.

## Examples

```text
Manager approval → Finance approval
```

## Invalid Examples

- Reporting a chain as approved while a required step remains pending.
- Reordering sequential requirements without changing the declared chain.

## Open Questions

- Should quorum and any-of rules be standardized in the first conformance suite?
- How should a chain react when its definition changes mid-process?

