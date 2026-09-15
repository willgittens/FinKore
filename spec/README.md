# FinKore Specification

## Status

**Draft.** FinKore Core Draft 0.4 is the closed
foundation-stabilization baseline. It aligns authority, version terminology, and
implementation-readiness evidence for the closed Draft 0.3 behavioral scope:
Draft 0.1 Money, Workflow, Audit, Approvals, and Entities; selected Draft 0.2
Money Rates, Money Allocation, Audit Relationships, Entity Evolution, and
Approval Validity; and selected Draft 0.3 Approval Composition, Workflow
version/import/conflict, and Entity Revision/Import behavior. Draft 0.4 does not
add Python or Java production code or new financial-domain behavior. The
specification remains pre-1.0 and experimental.

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

The first planned reference implementation targets TypeScript. Its core is intended to remain runtime-independent where practical so it can be used in browsers, Node.js, Bun, Deno, and worker environments. Candidate package names such as `@finkore/core` and `@finkore/node` are exploratory, not specification requirements. Framework integrations, including possible React or Vue packages, would remain integrations rather than definitions of FinKore.

A future Java implementation may provide idiomatic modules such as `finkore-core`
and `finkore-spring`. Other implementations may target C#, Python, Go, Rust,
PHP, or additional ecosystems. Draft 0.4 prepares for Python and Java work in
Draft 0.5, but no Python or Java implementation or conformance is currently
claimed. An implementation does not need to copy another implementation's API or
internal architecture; it needs to preserve the behavior required here and
verified by the conformance suite.

The repository is organized around `spec/` and `conformance/` today. As implementations and portable interchange schemas are introduced, they may live in dedicated top-level areas alongside examples. This layout is project direction rather than a normative requirement.

## Organization

- [Conventions](conventions.md) defines the language and representation rules used throughout the specification.
- [Glossary](glossary.md) defines shared domain terms.
- [Draft 0.4 Domain Specification Stabilization Record](draft-0.4-stabilization.md) records the accepted Draft 0.4 review of shared conventions and domain specifications.
- [Draft 0.4 Cross-Language Portability Contract](draft-0.4-portability-contract.md) records the accepted Draft 0.4 Python and Java portability review for the stabilized baseline.
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
