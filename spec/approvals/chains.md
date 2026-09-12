# Approval Chains

## Status

**Draft**

## Purpose

This document defines the Draft 0.1 all-required Approval Chain model. The term
Approval Chain does not by itself imply sequencing. Draft 0.3 bounded any-of,
all-of, quorum, staged, and nested group semantics are defined by
[Approval Composition](composition.md).

## Requirements

- **APPROVAL-CHAIN-001** — An Approval Chain MUST contain one or more declared Approval Requirements.
- **APPROVAL-CHAIN-002** — It MUST declare whether its Approval Requirements are sequential or unordered.
- **APPROVAL-CHAIN-003** — An unordered chain MUST NOT be interpreted as sequential.
- **APPROVAL-CHAIN-004** — A sequential chain MUST NOT activate a later Approval Requirement before its predecessor is satisfied.
- **APPROVAL-CHAIN-005** — An Approval Chain MUST be `APPROVED` only when every applicable Approval Requirement is approved.
- **APPROVAL-CHAIN-006** — Such a chain MUST remain `PENDING` while at least one applicable Approval Requirement remains pending and no effective rejection determines the outcome.
- **APPROVAL-CHAIN-007** — Every Approval Chain definition MUST state how an effective rejection determines its outcome.
- **APPROVAL-CHAIN-008** — Evaluation MUST be deterministic from the chain definition, applicable requirements, and effective decisions.
- **APPROVAL-CHAIN-009** — An Approval Chain MUST NOT declare the same Approval Requirement identifier more than once.

## Invariants

An Approval Chain outcome must be consistent with its sequencing declaration and effective required Approval Decisions.

Approval Chain evaluation is an outcome evaluation over declared Approval
Requirements. A state-map representation MAY be used to evaluate which
Requirements are currently satisfied, rejected, pending, or not applicable, but
that representation does not replace Approval Decision history and MUST NOT be
used as proof of which Decision satisfied a Requirement or which subject facts
were bound to that Decision.

Draft 0.1 does not define Approval Chain identity. A Decision binds to its
Approval Requirement and relevant subject state or facts, not to a Chain
identifier. Draft 0.3 Approval Composition adds group identity for composition
definitions; that group identity still does not replace Decision-to-Requirement
binding.

## Examples

```text
Manager approval → Finance approval
Manager approval AND Finance approval
```

The arrow denotes a sequential chain. `AND` denotes an unordered all-required chain; it does not imply that either Approval Requirement occurs first.

## Invalid Examples

- Reporting a chain as approved while a required step remains pending.
- Reordering sequential requirements without changing the declared chain.
- Declaring the same Approval Requirement identifier twice in one chain.

## Open Questions

- How should a future specification version and migrate Approval Chain definitions when a definition changes mid-process?

## Non-Goals

FinKore Core Draft 0.1 chains do not define delegation, unrestricted dependency
graphs, or migration between Approval Chain definitions. Non-all-required
bounded composition is defined separately by Draft 0.3 Approval Composition.
