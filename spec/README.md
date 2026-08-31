# FinFlow Specification

## Status

**Draft**

## Purpose

FinFlow is a specification-first, language-agnostic standard for recurring financial domain behavior. The specification is the source of truth; implementations exist to realize and verify that behavior.

Implementations MAY expose different APIs and use different languages, frameworks, or persistence models. Conformance concerns observable behavior and invariants, not syntax or internal structure. The specification is intended to preserve the same financial semantics across those implementation choices.

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

## Organization

- [Conventions](conventions.md) defines the language and representation rules used throughout the specification.
- [Glossary](glossary.md) defines shared domain terms.
- [Money](money/README.md) defines monetary representation and behavior.
- [Workflow](workflow/README.md) defines lifecycle states and transitions.
- [Audit](audit/README.md) defines durable domain history.
- [Approvals](approvals/README.md) defines approval requirements and decisions.
- [Entities](entities/README.md) defines the common behavior of financial entities.

Later domain specifications MAY compose these areas. A domain-specific specification that refines or makes an exception to an underlying rule MUST identify that change explicitly; all other applicable underlying requirements remain in force.

## Conformance

A conforming implementation MUST satisfy every applicable **MUST** and **MUST NOT** requirement. It SHOULD satisfy applicable recommendations unless a documented reason prevents it. Examples illustrate expected behavior but are non-normative unless explicitly identified as normative.

## Non-Goals

This specification does not prescribe programming constructs, user interfaces, storage systems, network protocols, or deployment architecture.

