# FinFlow Specification

## Status

Draft.

## Purpose

FinFlow is a specification-first, language-agnostic standard for recurring financial domain behavior. The specification is the source of truth; implementations exist to realize and verify that behavior.

Implementations MAY expose different APIs and use different languages, frameworks, or persistence models. Conformance concerns observable behavior and invariants, not syntax or internal structure. Financial rules SHOULD survive migrations between those implementation choices.

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

Specifications SHOULD remain small and composable. A new concept MUST begin with a real domain problem and MUST NOT begin solely with a proposed class, API, or framework abstraction.

## Organization

- [Conventions](conventions.md) defines the language and representation rules used throughout the specification.
- [Glossary](glossary.md) defines shared domain terms.
- [Money](money/README.md) defines monetary representation and behavior.
- [Workflow](workflow/README.md) defines lifecycle states and transitions.
- [Audit](audit/README.md) defines durable domain history.
- [Approvals](approvals/README.md) defines approval requirements and decisions.
- [Entities](entities/README.md) defines the common behavior of financial entities.

Later domain specifications MAY compose these areas. A domain-specific specification MUST state any refinement or exception explicitly and MUST preserve all unmodified underlying invariants.

## Conformance

A conforming implementation MUST satisfy every applicable **MUST** and **MUST NOT** requirement. It SHOULD satisfy applicable recommendations unless a documented reason prevents it. Examples illustrate expected behavior but are non-normative unless explicitly identified as normative.

## Non-Goals

This specification does not prescribe programming constructs, user interfaces, storage systems, network protocols, or deployment architecture.

