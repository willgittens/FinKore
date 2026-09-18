# FinKore Specification

## Status

**Experimental.** The specification remains pre-1.0 and may change. Money,
Workflow, Audit, Approvals, and Entities are the current domain scope.

## Purpose

FinKore is a specification-first, language-agnostic standard for recurring financial domain behavior. The specification is the source of truth; implementations exist to realize and verify that behavior.

Implementations can expose different APIs and use different languages, frameworks, or persistence models. Conformance concerns observable behavior and invariants, not syntax or internal structure. The specification is intended to preserve the same financial semantics across those implementation choices.

The development flow is:

```text
Problem
   ↓
Specification
   ↓
Examples
   ↓
Conformance Tests
   ↓
Reference Implementation
   ↓
Other Implementations
```

Specifications are intended to remain small and composable. New concepts should address domain problems rather than proposed classes, APIs, or framework abstractions.

## Implementation Direction (Non-Normative)

TypeScript is the reference implementation and remains runtime-independent where
practical. Python and Java provide independent implementations of the current
manifest scope. These implementations are evidence, not specification authority,
and their public APIs do not need to match one another. Future implementations
may use any idiomatic design that preserves the behavior required here and
verified by the conformance suite.

The repository is organized around `spec/` and `conformance/` today. As implementations and portable interchange schemas are introduced, they may live in dedicated top-level areas alongside examples. This layout is project direction rather than a normative requirement.

## Organization

- [Conventions](conventions.md) defines the language and representation rules used throughout the specification.
- [Glossary](glossary.md) defines shared domain terms.
- [Money](money/README.md) defines monetary representation and behavior.
- [Workflow](workflow/README.md) defines lifecycle states, transitions, and definition versions.
- [Audit](audit/README.md) defines durable domain history.
- [Approvals](approvals/README.md) defines approval requirements and decisions.
- [Entities](entities/README.md) defines the common behavior of financial entities.

Later domain specifications can compose these areas. The rules for explicit refinements are defined by **SPEC-TERMINOLOGY-001** in [Conventions](conventions.md).

## Scope Discipline (Non-Normative)

FinKore Core deliberately begins with reusable primitives rather than concrete invoice, expense, purchase-order, payment, reimbursement, or journal-entry models. Applications may compose the primitives for those domains, but Core Draft 0.1 does not claim to standardize them.

Possible later specifications may explore journal entries, debit and credit, general ledgers, reconciliation, fiscal periods, cost centers, purchase orders, invoice matching, payments, concrete correction posting rules, ledger reversals, and tax primitives. These are not current capabilities or commitments. A topic should enter scope only when its semantics can be defined clearly, tested across implementations, and justified by a real financial software problem.

## Conformance

Conformance is defined by **SPEC-CONFORMANCE-001** and **SPEC-CONFORMANCE-002** in [Conventions](conventions.md). Examples illustrate expected behavior but are non-normative unless explicitly identified as normative.

## Non-Goals

This specification does not prescribe programming constructs, user interfaces, storage systems, network protocols, or deployment architecture.
