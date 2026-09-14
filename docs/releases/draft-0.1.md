# FinKore Core Draft 0.1 Release Notes

**Status:** Historical closed baseline

## Purpose

Draft 0.1 established FinKore as a specification-first foundation for portable
financial domain behavior. It introduced the separation between specification,
language-independent conformance, the Agentic Contract, the domain-neutral
runner, and language implementations.

## Included

### Money

- Exact base-10 amount and currency representation.
- Canonical, locale-independent serialization.
- Exact compatible-currency addition, subtraction, negation, multiplication,
  division, and comparison.
- Explicit rounding with portable modes.
- Portable Money error categories.

### Workflow

- Definitions, exact state identity, initial/current state, and directed
  transitions.
- Explicit guards and terminal states.
- Rejected-transition state preservation and portable errors.

### Audit

- Audit Events, actors, changes, append-only logical history, and redaction.
- Required historical evidence and portable Audit errors.

### Approvals

- Approval Requirements and Decisions.
- Eligibility, subject-fact binding, decision recording, requirement evaluation,
  conditions through explicit fact/result boundaries, and basic Approval Chains.

### Entities

- Stable identity, lifecycle, mutability, validation, and composition with
  Workflow.
- Portable Entity errors and non-mutating rejected operations.

## Conformance and implementation status

The later Draft 0.2 baseline audit recorded 213 normative clauses: 149 covered
and 64 not directly testable, with zero partial, uncovered, deferred, or blocking
specification-gap rows. The manifest contained 138 vectors.

The TypeScript reference implementation covered all five selected Draft 0.1
domains. The Agentic Contract exposed seven Money operations, Workflow
transition, and Audit append/remove/replace as canonical operations; Entity and
Approval fixture labels remained conformance-local.

These figures are the historical Draft 0.1 baseline as subsequently audited, not
a claim that current repository counts remain unchanged.

## Explicit exclusions

Draft 0.1 did not standardize Money rates/allocation, Workflow versioning or
migration, Audit relationships/retention, Approval lifecycle validity or advanced
composition, Entity evolution/import, persistence, IAM/RBAC, a rules engine,
accounting ledgers, tax, payments, or other concrete financial domains.
