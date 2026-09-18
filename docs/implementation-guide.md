# FinKore Language-Neutral Implementation Guide

## Purpose

This guide is the entry point for future FinKore implementation authors. It
explains how to implement FinKore behavior without treating the TypeScript
reference implementation, conformance fixtures, or this guide as a second
specification.

The source of truth for financial behavior is `/spec`. CoreDoc records
foundation-level obligations, `/conformance` verifies portable observations,
`/agentic` names canonical operation semantics, and language implementations are
evidence that the same behavior can be realized idiomatically.

## Reading Order

1. Read [CoreDoc](coreDoc/core-doc.md) for foundation-level obligations.
2. Read [Specification Conventions](../spec/conventions.md) and the
   [Glossary](../spec/glossary.md).
3. Read the relevant domain specification under `spec/money/`,
   `spec/workflow/`, `spec/audit/`, `spec/approvals/`, or `spec/entities/`.
4. Read [Conformance Conventions](../conformance/conventions.md),
   [Traceability](../conformance/traceability.md), and the
   [Adapter Onboarding Guide](conformance-adapter-onboarding.md).
5. Read [Agentic Operations](../agentic/operations.md) when implementing a
   canonical `finkore.*` operation.
6. Use [Developer Tools](tools/README.md) for local toolchains and verification.

## Architecture Boundaries

An implementation may use any idiomatic architecture that preserves FinKore
observable semantics. Packages, modules, classes, records, services, exceptions,
builders, storage, dependency injection, and public method names are
language-specific choices.

The implementation must keep these boundaries clear:

- Domain behavior comes from `/spec`, not from TypeScript source.
- Conformance fixtures are adapter inputs, not production API schemas.
- The runner validates, dispatches, and compares; it does not contain Money,
  Workflow, Audit, Approval, or Entity rules.
- An adapter translates between conformance operation labels and the
  implementation's public or internal API.
- Agentic operation identifiers name canonical operation semantics; they do not
  require an agent framework or a transport.

## Normative and Idiomatic Choices

Normative choices are observable financial obligations: exact Money arithmetic,
currency compatibility, explicit rounding, failure atomicity, append-only Audit
history, Approval effectiveness, Entity identity preservation, portable error
codes, and similar rules defined in `/spec`.

Idiomatic choices are language design decisions: package layout, class names,
exception hierarchy, return types, decimal library, visibility, mutability
mechanisms, build tools, and how public documentation is generated.

When a language default conflicts with FinKore semantics, FinKore wins at the
portable boundary. Examples include binary floating-point arithmetic,
scale-sensitive decimal equality, host timezone defaults, locale-sensitive
formatting, map iteration order, and case folding of opaque identifiers.

## Value Semantics

Implement Money with exact base-10 semantics. Parse portable decimal values from
strings and reject JSON numbers where the specification requires decimal
strings. Do not use binary floating point for Money arithmetic.

Preserve identifier opacity. Identifiers do not encode state, tenancy, sequence,
permission, timestamp, revision, or storage facts unless a future specification
explicitly says so.

Preserve absent, null, and redacted distinctions where they are observable. A
missing field is not the same thing as JSON `null`, and redaction is not deletion
or nullification unless a specification defines that result.

Preserve declared order when the domain makes order observable. Do not let
object member order, hash iteration order, filesystem order, or database return
order define financial meaning.

## Errors

Portable error codes are the cross-language contract. Class names, exception
hierarchies, human-readable messages, stack traces, HTTP statuses, and transport
errors are not portable domain behavior.

An implementation may throw exceptions, return result objects, use checked
errors, or use another idiomatic mechanism. The implementation and adapter must
still expose the correct portable code for a domain failure and preserve any
required post-state observations.

Optional diagnostic details must not change the meaning of the portable code and
must not disclose sensitive information by default.

## Effects and Atomicity

Failed operations must not create partial observable state where the
specification requires non-mutation or failure atomicity. For mutable APIs, use
validation-before-commit, defensive copies, immutable values, or transactional
construction so that rejected operations leave the required observations
unchanged.

Pure value operations, such as Money arithmetic, should return new observable
values or equivalent immutable results. State-changing domains, such as
Workflow, Audit, Approval lifecycle, and Entity operations, must make the
specified success and failure postconditions observable.

## Deterministic Context

Do not depend on wall-clock time, host timezone, locale, network calls,
external FX providers, filesystem traversal order, database incidental order,
unseeded randomness, or process identity for conformance-observable behavior.

When time, policy, facts, or current state matter, pass them explicitly through
the operation or adapter boundary. Serialized timestamps must identify
unambiguous instants where the relevant specification requires timestamps.

## Conformance Workflow

Use [conformance/manifest.json](../conformance/manifest.json) as the only vector
discovery entry point. Run the language implementation through an adapter that
implements the normalized conformance contract described in
[Conformance Adapter Onboarding](conformance-adapter-onboarding.md).

Recommended implementation sequence:

1. Select one domain slice and read its specifications.
2. Identify the requirement IDs in [Traceability](../conformance/traceability.md).
3. Run the related vectors and confirm they fail or are unsupported before the
   implementation exists.
4. Implement the smallest behavior that satisfies the specification.
5. Add language unit tests for API ergonomics and invariants.
6. Run the conformance vectors through the adapter.
7. Add mutation or equivalent defect-resistance tests for critical behavior.
8. Update public API documentation and examples.

## Mutation and Reliability

Official or reference implementations are expected to use mutation testing or a
language-appropriate equivalent for critical financial behavior. The target
mutation score is at least 95%, but critical mutants matter more than the
aggregate score.

Critical defects include currency check removal, binary floating-point shortcuts,
rounding-mode substitution, guard bypass, append-only history mutation,
approval-effectiveness bypass, Entity immutability bypass, and portable error
code changes.

## Public API Documentation

Every intentional public API symbol should have meaningful language-native
documentation. The documentation should explain domain purpose, parameters whose
meaning matters, return behavior, portable errors, mutation behavior, and
relevant requirement IDs.

For TypeScript this means JSDoc. Python might use docstrings and generated API
documentation. Java might use Javadoc. The documentation format is idiomatic;
the requirement to document public semantics is shared.

## Non-Normative API Sketches

The following sketches are illustrative only. They are not FinKore production
API requirements.

```python
amount = Money.from_portable({"amount": "10.20", "currency": "EUR"})
result = amount.add(Money.from_portable({"amount": "5.30", "currency": "EUR"}))
assert result.to_portable() == {"amount": "15.50", "currency": "EUR"}
```

```java
Money amount = Money.fromPortable(Map.of("amount", "10.20", "currency", "EUR"));
Money result = amount.add(Money.fromPortable(Map.of("amount", "5.30", "currency", "EUR")));
assert result.toPortable().equals(Map.of("amount", "15.50", "currency", "EUR"));
```

The only normative representation shown here is the Money JSON value defined by
[Money Serialization](../spec/money/serialization.md). The method names,
classes, assertions, and container types are examples.

## Reporting a Specification Gap

If the specification does not define an observable result, do not copy
TypeScript behavior, local test behavior, or a language default as the answer.
Record the gap with:

- the exact artifact and requirement IDs reviewed;
- the operation or value boundary affected;
- at least two plausible interpretations;
- the financial, control, security, or privacy impact;
- the proposed classification: clarification, normative change,
  contradiction, portability blocker, or deferred topic.

Then wait for an accepted specification-first decision before changing
conformance expectations or implementation behavior.
