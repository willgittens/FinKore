# Draft 0.5 Python and Java Handoff Checklist

## Status

Prepared for Draft 0.5 planning from the FinKore Core Draft 0.4 stabilization
baseline on 2026-09-15.

This checklist closes TASK-201. It defines bounded starting work for future
Python and Java implementations. It does not create either implementation,
choose final language architecture, claim conformance, or add new financial
behavior.

## Shared Starting Baseline

Future Python and Java work starts from these Draft 0.4 artifacts:

- [CoreDoc](coreDoc/core-doc.md)
- [Specification](../spec/README.md)
- [Domain Specification Stabilization Record](../spec/draft-0.4-stabilization.md)
- [Cross-Language Portability Contract](../spec/draft-0.4-portability-contract.md)
- [Conformance Suite](../conformance/README.md)
- [Conformance and Implementer Documentation Audit](../conformance/draft-0.4-audit.md)
- [Language-Neutral Implementation Guide](implementation-guide.md)
- [Conformance Adapter Onboarding Guide](conformance-adapter-onboarding.md)
- [Agentic Contract](../agentic/README.md)
- [Draft 0.4 Agentic Alignment Record](../agentic/draft-0.4-alignment.md)

Before implementation begins, the contributor should confirm the working tree
reports Draft 0.4 as the closed stabilization baseline and does not claim Python
or Java conformance.

## Shared Prerequisites

- Read `/spec` before implementation code.
- Treat TypeScript as reference evidence, not the source of financial semantics.
- Use `conformance/manifest.json` as the only conformance discovery entry point.
- Keep conformance fixtures out of production API design unless a specification
  defines the same shape as normative serialization.
- Preserve portable error codes as language-neutral categories.
- Preserve exact base-10 Money behavior without binary floating-point shortcuts.
- Preserve failure atomicity and non-mutation observations where specified.
- Pass explicit time, facts, current state, and policy through the operation or
  adapter boundary rather than using host defaults.
- Document unsupported, deferred, and not-yet-specified behavior separately from
  implemented behavior.

## Recommended First Vertical Slice

Start with Money representation, serialization, addition, subtraction, compare,
and rounding.

This slice is mature and isolated because it exercises the full
spec-to-conformance path while avoiding persistence, history, lifecycle,
approval, and cross-domain composition. It includes exact decimals, currency
compatibility, portable errors, non-mutation, boundary vectors, and
mutation-sensitive cases. Completing this slice does not imply full Money,
domain, or FinKore conformance.

Suggested order:

1. Implement portable Money parsing and serialization.
2. Implement exact compatible-currency addition and subtraction.
3. Implement exact compatible-currency comparison.
4. Implement explicit rounding modes and target scale.
5. Add language unit tests for exactness, invalid inputs, boundaries, and
   non-mutation.
6. Add a conformance adapter for only the implemented operation labels.
7. Run the selected Money vectors.
8. Add mutation or equivalent defect-resistance coverage for currency mismatch,
   exact arithmetic, and rounding boundaries.

## Python Bootstrap Checklist

- Create a Python package skeleton without deciding global framework or service
  architecture.
- Choose an exact decimal strategy, such as `decimal.Decimal` parsed from
  strings or an exact scaled-integer representation.
- Validate FinKore plain decimal syntax before using Python decimal parsing.
- Prevent implicit context precision from rounding Money operations.
- Use timezone-aware timestamp handling for future timestamp-bearing slices.
- Preserve absent versus `None` at adapter boundaries.
- Use lists or explicit order data for declared-order behavior.
- Define Python exceptions or result types that carry portable FinKore error
  codes without making Python class names portable.
- Provide docstrings or generated API docs for public symbols with relevant
  requirement IDs.
- Build a conformance adapter bridge that exposes `supports`, `execute`, and
  optional `reset` through the current runner boundary.
- Evaluate mutation tooling or an equivalent strategy before claiming
  reference-quality implementation status.
- Record unsupported operations honestly until their vectors pass.

## Java Bootstrap Checklist

- Create a Java package skeleton without deciding global framework, HTTP,
  persistence, or dependency-injection architecture.
- Choose an exact decimal strategy, such as `BigDecimal` from strings plus
  explicit validation, or an exact integer/coefficient representation.
- Do not use `BigDecimal.equals` as Money numeric equality because scale is not
  significant for Money equality.
- Avoid `MathContext` or other precision settings that round without a FinKore
  rounding policy.
- Use `BigInteger` or checked arithmetic for allocation units and ratios.
- Use `OffsetDateTime` or `Instant` for future timestamp-bearing slices without
  relying on the JVM default timezone.
- Preserve absent versus JSON `null` at adapter boundaries.
- Use `List` or explicit order data for declared-order behavior; do not rely on
  incidental `Map` iteration order.
- Define checked exceptions, unchecked exceptions, or result types that carry
  portable FinKore error codes without making Java class names portable.
- Provide Javadoc or generated API docs for public symbols with relevant
  requirement IDs.
- Build a conformance adapter bridge that exposes `supports`, `execute`, and
  optional `reset` through the current runner boundary.
- Evaluate mutation tooling or an equivalent strategy before claiming
  reference-quality implementation status.
- Record unsupported operations honestly until their vectors pass.

## CI Expectations

Early Draft 0.5 implementation branches should run:

```text
language build
language static checks
language unit tests
selected conformance vectors
full conformance for claimed scope
coverage where available
mutation or equivalent defect-resistance checks for critical behavior
documentation and license checks
```

For a full conformance claim, run the complete manifest-listed suite without
filters and record pass/fail/unsupported/infrastructure counts. Zero unsupported
vectors are required for the claimed scope.

## Prohibited Shortcuts

- Do not implement unspecified behavior to make an API feel complete.
- Do not infer financial semantics from TypeScript internals.
- Do not treat conformance fixture shape as a required production schema.
- Do not use binary floating point for Money arithmetic.
- Do not silently round, convert currencies, normalize opaque identifiers, or
  replace portable error codes with language-specific exceptions.
- Do not claim full Python or Java conformance while any required vector is
  failing, unsupported, or blocked by infrastructure.

## Handoff Gate

Draft 0.5 Python and Java implementation work may begin from this checklist
after Draft 0.4 closure. The first slice should remain bounded and should report
implemented, passing conformance, unsupported, not yet specified, and deferred
behavior separately.
