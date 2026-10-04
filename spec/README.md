# FinKore Specification

## Status

**FinKore Core 2.0.2 stable.** This is the shared, language-neutral
normative baseline. Stability applies to the defined observable contract and
the compatibility policy in [Conventions](conventions.md#compatibility-policy).
The domain scope is Money, Workflow, Audit, Approvals, and Entities.

## Purpose

The specification defines the observable financial behavior an implementation
preserves: values, results, failures, and invariants. You choose the language,
API, framework, and storage. [CoreDoc](../docs/coreDoc/core-doc.md) states the
financial obligations that these domain rules refine.

## How to read a specification

Choose a domain below and follow its reading path. Most documents use the same
structure:

| Section | What it tells you |
| --- | --- |
| Purpose and terminology | The problem and the terms used in its rules |
| Requirements | Obligations, recommendations, and permissions, with stable IDs for reference |
| Invariants | Properties that continue to hold across operations |
| Examples and invalid examples | Concrete illustrations of the rules |
| Errors | Portable failure codes and the conditions that produce them |
| Open Questions and Non-Goals | Unresolved topics and the limits of the document |

Read the [normative-language conventions](conventions.md#normative-language)
before assessing conformance. They distinguish requirements from explanation
and examples. Use the [glossary](glossary.md) as a reference when a term is
unfamiliar; you do not need to read it from beginning to end first.

## Organization

| Domain | Start here when you need to understand… |
| --- | --- |
| [Money](money/README.md) | Exact amounts, currency compatibility, calculations, and rounding |
| [Workflow](workflow/README.md) | Permitted lifecycle changes and rejected transitions |
| [Audit](audit/README.md) | What happened, who acted, and how history is preserved |
| [Approvals](approvals/README.md) | Which business decisions are required and whether they remain effective |
| [Financial Entities](entities/README.md) | Stable identity, valid changes, revisions, and evolution over time |

Later domain specifications can compose these areas. The rules for explicit refinements are defined by **SPEC-TERMINOLOGY-001** in [Conventions](conventions.md).

Each domain index links to all of its specification documents. Shared rules for
compatibility, stable identifiers, portable values, and errors are in
[Conventions](conventions.md).

## Scope Discipline (Non-Normative)

FinKore Core deliberately begins with reusable primitives rather than concrete invoice, expense, purchase-order, payment, reimbursement, or journal-entry models. Applications may compose the primitives for those domains, but Core 2.0 does not claim to standardize them.

Ledger posting, reconciliation, payments, tax, and concrete correction or reversal
accounting effects remain deferred. Domain documents record their specific Open
Questions and Non-Goals. New concepts begin with a financial domain problem and
specification review; possible future topics are not current commitments.

## Conformance

Conformance is defined by **SPEC-CONFORMANCE-001** and **SPEC-CONFORMANCE-002** in [Conventions](conventions.md). Examples illustrate expected behavior but are non-normative unless explicitly identified as normative.

The [conformance artifacts](../conformance/README.md) connect requirements to
portable acceptance cases. The [Agentic Contract](../agentic/README.md) describes
canonical operation semantics for machine clients. Both derive from `/spec`.
The [implementation guide](../docs/implementation-guide.md) explains how to
use them in your own codebase.

## Version Identity (Non-Normative)

`FinKore Core 2.0.2` identifies the behavioral baseline. The conformance manifest
and vector-file formats have separate versions, as do consumer-owned tools and
implementations. See the [compatibility policy](conventions.md#compatibility-policy)
for the portable surface protected by Core stability.

## Non-Goals

This specification does not prescribe programming constructs, user interfaces,
storage systems, network protocols, or deployment architecture. This repository
publishes the contract and maintenance tools; consumers own financial
implementations and execution tooling.
