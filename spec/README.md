# FinKore Specification

## Status

**FinKore Core 2.0.2 stable.** This is the shared, language-neutral
normative baseline. Stability applies to the defined observable contract and
the compatibility policy in [Conventions](conventions.md#compatibility-policy).
The domain scope is Money, Workflow, Audit, Approvals, and Entities.

## Purpose

FinKore is a specification-first, language-agnostic standard for recurring
financial domain behavior. The specification is the source of truth; consumers
may implement and verify that behavior in their own environments.

Implementations can expose different APIs and use different languages, frameworks, or persistence models. Conformance concerns observable behavior and invariants, not syntax or internal structure. The specification is intended to preserve the same financial semantics across those implementation choices.

The development flow is:

```text
Problem
   ↓
Specification
   ↓
Examples
   ↓
Conformance Artifacts
   ↓
Consumer Implementations and Verification
```

Specifications are intended to remain small and composable. New concepts should address domain problems rather than proposed classes, APIs, or framework abstractions.

## Implementation Direction (Non-Normative)

This repository does not maintain a financial implementation, Conformance
Runner, adapter API, or language package. Consumers may use any idiomatic design
and execution tooling that preserve the behavior required here. Published
conformance artifacts express portable acceptance inputs and observations; they
do not prescribe a production API or implementation architecture.

The repository is organized around `spec/`, `conformance/`, `agentic/`, and
domain-neutral maintenance tools under `docs/tools/`. This layout is project
direction rather than a normative requirement.

## Version Identity (Non-Normative)

`FinKore Core 2.0.2` identifies the current language-neutral
behavioral baseline. It is distinct from the `finkoreConformance` manifest
format version, the `finkoreVectorFile` vector-file format version, and versions
assigned by consumer-owned tools or implementations. Format and tool versions
describe artifact or integration compatibility; they do not define financial
behavior.

## Organization

- [Conventions](conventions.md) defines normative language, compatibility policy, stable identifiers, portable values, and error-code conventions.
- [Glossary](glossary.md) defines shared domain terms.
- [Money](money/README.md) defines monetary representation and behavior.
- [Workflow](workflow/README.md) defines lifecycle states, transitions, and definition versions.
- [Audit](audit/README.md) defines durable domain history.
- [Approvals](approvals/README.md) defines approval requirements and decisions.
- [Entities](entities/README.md) defines the common behavior of financial entities.

Later domain specifications can compose these areas. The rules for explicit refinements are defined by **SPEC-TERMINOLOGY-001** in [Conventions](conventions.md).

### 2.0 document baseline (Non-Normative)

The foundation is [CoreDoc](../docs/coreDoc/core-doc.md). The specification
baseline comprises the following 47 documents, including this index and each
domain index. Links identify the complete document set; they do not extend the
normative scope of any document.

| Area | Documents |
| --- | --- |
| Shared | This index, [Conventions](conventions.md), [Glossary](glossary.md) |
| Money | [Index](money/README.md), [Representation](money/representation.md), [Currency](money/currency.md), [Arithmetic](money/arithmetic.md), [Comparison](money/comparison.md), [Rounding](money/rounding.md), [Rates](money/rates.md), [Allocation](money/allocation.md), [Serialization](money/serialization.md), [Errors](money/errors.md) |
| Workflow | [Index](workflow/README.md), [States](workflow/states.md), [Transitions](workflow/transitions.md), [Guards](workflow/guards.md), [Terminal states](workflow/terminal-states.md), [Versioning](workflow/versioning.md), [Import](workflow/import.md), [Conflicts](workflow/conflicts.md), [Errors](workflow/errors.md) |
| Audit | [Index](audit/README.md), [Actors](audit/actors.md), [Events](audit/events.md), [Changes](audit/changes.md), [Append-only history](audit/append-only.md), [Redaction](audit/redaction.md), [Relationships](audit/relationships.md), [Errors](audit/errors.md) |
| Approvals | [Index](approvals/README.md), [Requirements](approvals/requirements.md), [Conditions](approvals/conditions.md), [Decisions](approvals/decisions.md), [Validity](approvals/validity.md), [Chains](approvals/chains.md), [Composition](approvals/composition.md), [Errors](approvals/errors.md) |
| Financial Entities | [Index](entities/README.md), [Identity](entities/identity.md), [Lifecycle](entities/lifecycle.md), [Mutability](entities/mutability.md), [Validation](entities/validation.md), [Evolution](entities/evolution.md), [Revisions](entities/revisions.md), [Import](entities/import.md), [Errors](entities/errors.md) |

Compatibility covers stable requirement meanings, portable error meanings,
canonical operation contracts, and normative serializations under
**SPEC-COMPATIBILITY-001** through **SPEC-COMPATIBILITY-014**. For every normative
portable shape, that includes member names, requiredness, nullability, value
encodings, and result categories. Illustrative JSON and conformance-local
observations do not become production serialization requirements. Manifest and
vector-file syntax retain their separate format versions.

## Scope Discipline (Non-Normative)

FinKore Core deliberately begins with reusable primitives rather than concrete invoice, expense, purchase-order, payment, reimbursement, or journal-entry models. Applications may compose the primitives for those domains, but Core 2.0 does not claim to standardize them.

Possible later specifications may explore journal entries, debit and credit, general ledgers, reconciliation, fiscal periods, cost centers, purchase orders, invoice matching, payments, concrete correction posting rules, ledger reversals, and tax primitives. These are not current capabilities or commitments. A topic should enter scope only when its semantics can be defined clearly, tested across implementations, and justified by a real financial software problem.

## Conformance

Conformance is defined by **SPEC-CONFORMANCE-001** and **SPEC-CONFORMANCE-002** in [Conventions](conventions.md). Examples illustrate expected behavior but are non-normative unless explicitly identified as normative.

## Non-Goals

This specification does not prescribe programming constructs, user interfaces, storage systems, network protocols, or deployment architecture.
