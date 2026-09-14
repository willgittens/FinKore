# FinKore — Codex Agent Instructions

## Project Overview

FinKore is an open-source, language-agnostic specification for building predictable, auditable, and portable financial domain logic.

Core idea:

> CRUD is easy. Financial CRUD isn't.

FinKore is **specification-first**.

The FinKore specification is the source of truth. TypeScript, Java, and future implementations are implementations of the specification, not the definition of FinKore itself.

The project is designed around four major layers:

```text
Specification
      ↓
Conformance
      ↓
Agentic Contract
      ↓
Implementations
```

The repository also contains a Conformance Runner used to execute language-independent test vectors against implementations.

---

# Repository Responsibilities

## `/spec`

Canonical financial behavior.

Defines:

- normative requirements;
- invariants;
- portable error semantics;
- domain terminology;
- financial behavior.

Normative keywords include:

- MUST
- MUST NOT
- SHOULD
- SHOULD NOT
- MAY

The specification defines **behavior**, not implementation architecture.

The implementation MUST NOT invent financial behavior that does not exist in `/spec`.

If behavior is ambiguous, stop and identify the specification gap rather than silently choosing semantics.

---

## `/conformance`

Defines how FinKore behavior is verified.

Contains:

- language-independent test vectors;
- requirement traceability;
- conformance conventions;
- mutation-sensitive cases;
- regression vectors;
- boundary tests.

Conformance vectors are derived from `/spec`.

They MUST NOT become a second specification.

If a test vector expects behavior that is not defined by `/spec`, report the inconsistency instead of changing implementation behavior to satisfy an invented rule.

---

## `/agentic`

Defines the FinKore Agentic Contract.

Purpose:

> Agent-ready by contract, not by convention.

It provides machine-understandable operation semantics such as:

- canonical operation identifiers;
- discoverability;
- input/output semantics;
- portable errors;
- operation effects;
- preconditions;
- postconditions;
- state mutation characteristics.

Canonical operation identifiers use:

```text
finkore.<domain>.<operation>
```

Examples:

```text
finkore.money.add
finkore.money.subtract
finkore.money.compare
finkore.money.round
finkore.workflow.transition
```

Do NOT invent alternate operation IDs.

The Agentic Contract does not override `/spec`.

Agents, humans, backend services, and integrations are governed by the same domain rules.

There is no special AI bypass or agent execution mode.

---

## `/runner`

Reference TypeScript Conformance Runner.

The runner:

- loads conformance vectors;
- validates them;
- dispatches canonical FinKore operation IDs;
- calls an implementation adapter;
- compares normalized results;
- reports PASS / FAIL / UNSUPPORTED / INFRASTRUCTURE_ERROR.

The runner MUST remain completely domain-neutral.

It MUST NOT contain financial logic.

Examples of forbidden runner logic:

```ts
if (left.currency !== right.currency) {
  // financial behavior does not belong here
}
```

```ts
if (state === 'draft') {
  // workflow behavior does not belong here
}
```

The runner verifies behavior. It does not define or implement behavior.

Current runner quality baseline:

- strict TypeScript passes;
- tests are heavily mutation-tested;
- critical runner mutants must not survive.

---

## `/implementations`

Contains language-specific FinKore implementations.

Expected structure:

```text
implementations/
├── typescript/
│   ├── core/
│   └── adapters/
│       └── conformance/
│
└── future-language/
```

The TypeScript implementation is a reference implementation, not the canonical FinKore definition.

---

# TypeScript Architecture

Current TypeScript implementation:

```text
implementations/typescript/
├── core/
└── adapters/
    └── conformance/
```

## `core`

Implements FinKore financial domain behavior.

It MAY depend on normal language/runtime libraries required to implement the specification.

It MUST NOT depend on:

- `/runner`;
- `/conformance`;
- `/agentic`;
- MCP;
- OpenAI tools;
- agent frameworks;
- React;
- Vue;
- persistence infrastructure;
- HTTP frameworks.

Dependency direction:

```text
Runner
  ↓
Conformance Adapter
  ↓
TypeScript Core
```

Never reverse this dependency.

---

# Node Toolchain

Before running Node-based commands or tests, verify whether `node` is available on the machine environment.

If `node` is not found in the machine environment:

1. Look for a repository-local Node toolchain under `/.tools`.
2. If `/.tools` exists and contains Node, run all Node-based commands and tests using that Node binary.
3. If `/.tools` does not exist, or Node cannot be found there, download Node into `/.tools` and run all Node-based commands and tests from that downloaded toolchain.

Do not skip required tests merely because the machine environment does not already provide Node.

---

## `adapters/conformance`

Translates between:

```text
canonical FinKore operation IDs
        ↓
TypeScript implementation API
        ↓
normalized Conformance Runner results
```

The adapter MAY know about:

- runner adapter contracts;
- canonical operation IDs;
- TypeScript core APIs.

The adapter MUST NOT implement financial rules.

Example:

Correct:

```ts
const result = Money.from(left).add(Money.from(right))
return normalize(result)
```

Incorrect:

```ts
if (left.currency !== right.currency) {
  return {
    status: 'error',
    error: { code: 'FINKORE_MONEY_CURRENCY_MISMATCH' }
  }
}
```

Currency compatibility belongs in the core implementation.

---

# Development Methodology

FinKore uses strict specification-driven TDD.

For new financial behavior, use this sequence:

```text
Domain Problem
      ↓
Specification
      ↓
Normative Requirement
      ↓
Conformance Vector
      ↓
Failing Test
      ↓
Minimum Implementation
      ↓
Passing Test
      ↓
Mutation Testing
      ↓
Refactor
```

Do NOT start by inventing a class or API.

Start from existing specification behavior.

Before implementing a feature:

1. Read the relevant `/spec` files.
2. Identify requirement IDs.
3. Read related `/conformance` vectors.
4. Read canonical operation metadata under `/agentic` when applicable.
5. Write or verify failing tests.
6. Implement the smallest correct behavior.
7. Run unit tests.
8. Run real conformance vectors.
9. Run mutation testing.
10. Refactor only after correctness is established.

---

# Testing Standards

FinKore is intended for financial and accounting software.

Reliability is a primary engineering requirement.

A passing test suite is not sufficient if plausible defects can survive.

Core testing strategy:

- TDD;
- exact assertions;
- boundary testing;
- negative testing;
- invariant testing;
- regression testing;
- language-independent conformance vectors;
- mutation testing.

Core philosophy:

> FinKore tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

---

# Mutation Testing

Mutation testing is mandatory for meaningful financial behavior.

Target:

```text
Mutation score >= 95%
```

However, the aggregate score is secondary to critical mutants.

Critical financial mutants MUST NOT survive.

Examples:

- currency mismatch validation removed;
- arithmetic operator changed;
- rounding mode changed;
- workflow transition validation bypassed;
- immutable-state protection removed;
- approval validity check removed;
- audit history mutation allowed;
- portable error code changed.

A 99% mutation score with one critical surviving mutant is unacceptable.

Do NOT game mutation scores by:

- excluding meaningful business logic;
- adding meaningless assertions;
- testing implementation details instead of behavior;
- broadly ignoring difficult mutants.

Equivalent mutants may be ignored only with an explicit justification.

---

# Financial Testing Rules

## Exactness

Never use approximate floating-point assertions for Money.

Forbidden:

```ts
expect(Math.abs(actual - expected)).toBeLessThan(0.001)
```

Financial values must be compared using exact FinKore semantics.

---

## Determinism

Tests MUST NOT depend on:

- wall-clock time;
- host timezone;
- machine locale;
- network calls;
- external FX providers;
- filesystem enumeration order;
- uncontrolled randomness.

Explicit context must be injected when time or state matters.

---

## Failure Must Not Create Partial State

Where `/spec` defines a failed operation as non-mutating, test the invariant explicitly.

Do not only test the returned error.

Also verify that observable state remains unchanged.

---

# TypeScript Standards

Use strict TypeScript.

Prefer:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

Avoid `any`.

Use `unknown` at untrusted boundaries.

Do not model conformance payloads as financial-domain types inside the runner.

Keep implementation APIs idiomatic TypeScript while preserving FinKore observable behavior.

---

# Public API Design

Keep APIs small.

Avoid premature abstractions.

Do not introduce:

- builders without clear need;
- generic utility layers;
- framework abstractions;
- extension systems for hypothetical future behavior.

Prefer domain-oriented modules.

Example:

```text
src/
├── money/
├── workflow/
├── audit/
├── approvals/
└── entities/
```

Avoid generic dumping grounds such as:

```text
utils/
helpers/
common/
```

unless a genuinely shared abstraction emerges from multiple domains.

---

# JSDoc Policy

All intentional public TypeScript API symbols MUST have meaningful JSDoc.

This includes:

- exported classes;
- exported functions;
- public methods;
- public static methods;
- exported interfaces;
- exported types when useful;
- exported enums/constants;
- portable error classes.

JSDoc should explain:

- domain purpose;
- relevant financial semantics;
- parameters where semantics matter;
- return behavior;
- portable errors;
- mutation behavior;
- relevant FinKore requirement IDs.

Use standard JSDoc tags:

```text
@param
@returns
@throws
@example
@remarks
@see
@internal
```

Use `@see` for stable FinKore requirement IDs.

Example:

```ts
/**
 * Adds another Money value using FinKore exact decimal semantics.
 *
 * Both operands must use compatible currencies.
 * Neither operand is mutated.
 *
 * @param other - Money value to add.
 * @returns A new Money value containing the result.
 *
 * @throws {CurrencyMismatchError}
 * When the operands use incompatible currencies.
 *
 * @see MONEY-ARITHMETIC-001
 * @see MONEY-ARITHMETIC-002
 * @see MONEY-ARITHMETIC-003
 */
add(other: Money): Money {
  // ...
}
```

Do NOT copy entire specification sections into JSDoc.

Documentation responsibilities:

```text
/spec
  normative financial behavior

JSDoc
  TypeScript API semantics and usage

README
  project/package introduction
```

Internal helpers need JSDoc only when they contain non-obvious financial semantics or important architectural decisions.

Avoid comments that merely restate code.

---

# Portable Errors

FinKore portable error codes are language-independent.

Example:

```text
FINKORE_MONEY_CURRENCY_MISMATCH
```

TypeScript error classes are implementation-specific.

Consumers requiring portable semantics should rely on the error code, not the TypeScript class name.

Do not create portable behavior based on:

- exception class names;
- human-readable error messages;
- stack traces.

If `/spec` does not define an error code for a condition, do not invent one in the implementation.

---

# Money Rules

Money is foundational.

Before changing Money behavior, always inspect:

```text
spec/money/
conformance/money/
```

Important principles already established include:

- Money has amount and currency.
- Monetary behavior uses exact decimal semantics.
- Unsafe binary floating-point behavior is unacceptable.
- Currency compatibility is explicit.
- Rounding is explicit when required.
- Supported portable rounding modes are defined by the specification.
- Calculation scale is not automatically the same thing as currency minor units.
- Canonical serialization is locale-independent.
- Non-ISO/private currency namespace behavior remains intentionally limited/deferred according to the current spec.

Do not use JavaScript `number` as an unsafe shortcut for financial arithmetic.

---

# Rounding

Do not invent rounding defaults.

Where rounding is required, follow `/spec/money/rounding.md`.

Portable modes currently include the modes defined there, such as:

```text
HALF_UP
HALF_EVEN
DOWN
UP
FLOOR
CEILING
```

Negative-value boundary cases matter.

For example, `DOWN` and `FLOOR` are not interchangeable.

Always test boundary values and mutation-sensitive cases.

---

# Agentic Readiness

FinKore is:

> Agent-ready by contract, not by convention.

Do not add AI-specific shortcuts to core APIs.

The Agentic Contract is meant to make operations:

- Discoverable;
- Understandable;
- Governable;
- Conformance-traceable.

Executable MCP/OpenAI/agent adapters are separate future integrations.

Agentic behavior MUST NOT bypass FinKore financial semantics.

---

# Current Scope Discipline

Do not implement future domains merely because they appear useful.

Only implement behavior that is part of the active milestone.

Potential future concepts include:

- Workflow;
- Audit;
- Approvals;
- Financial Entities;
- Corrections;
- Reversals;
- Journal Entries;
- Ledger;
- Reconciliation;
- Purchase Orders;
- Payments;
- Tax;
- FX.

A future concept appearing in README/spec discussion does not imply it belongs in the current implementation task.

---

# Deferred Topics

Some topics are intentionally deferred.

Examples include areas such as:

- private/non-fiat currency namespace design;
- approval delegation, escalation, dynamic approver resolution, and quorum extensions beyond the implemented bounded composition model;
- workflow migration, concurrency, and distributed version coordination beyond the implemented definition/version binding and expected-precondition model;
- concrete correction/reversal accounting effects beyond the implemented Entity Evolution relation semantics;
- post-finalization metadata policy;
- distributed audit total ordering.

Do not resolve deferred architectural questions inside implementation code.

If they become necessary, stop and surface the specification gap.

---

# Backward Compatibility

Stable identifiers are important.

Do not casually rename:

- requirement IDs;
- portable error codes;
- canonical operation IDs;
- conformance vector IDs.

These identifiers are intended for long-term traceability.

If a rename is unavoidable, explain why and assess all references before changing it.

---

# Change Discipline

When implementing a task:

1. Keep changes scoped.
2. Do not refactor unrelated code.
3. Do not broaden the milestone.
4. Do not silently change spec behavior.
5. Do not update test expectations simply to make implementation pass.
6. Never weaken mutation-sensitive tests without explicit justification.
7. Preserve architectural boundaries.

If code and spec disagree, investigate the disagreement.

Do not assume the implementation is correct.

---

# Test and Documentation Synchronization

Tests and documentation are part of the implementation and MUST evolve together with code.

Whenever a change affects observable behavior, public API, portable errors, architecture, supported operations, or implementation status, update the relevant artifacts in the same change.

At minimum, review whether the change requires updates to:

```text
unit tests
conformance vectors
mutation-sensitive tests
JSDoc
package README files
root README
/spec
/conformance
/agentic
AGENTS.md
```

Do not consider a code change complete if affected tests or documentation are stale.

---

## Public API Changes

When adding, removing, renaming, or changing a public API:

```text
[ ] update or add unit tests
[ ] update conformance coverage where behavior is normative
[ ] update mutation-sensitive tests where behavior is critical
[ ] update JSDoc
[ ] update examples that use the API
[ ] update the implementation README when usage or supported capabilities changed
```

Every intentional public API added by a change MUST have meaningful JSDoc before the task is considered complete.

---

## Behavioral Changes

When observable financial behavior changes:

```text
[ ] verify the behavior is already defined by /spec
[ ] update the specification if the intended normative behavior itself changed
[ ] update conformance vectors
[ ] update implementation tests
[ ] update mutation-sensitive tests
[ ] update JSDoc describing the affected behavior
[ ] update README documentation if the change affects users or project status
[ ] update Agentic metadata if operation semantics, effects, inputs, outputs, or errors changed
```

Do not change test expectations merely to accommodate implementation behavior that conflicts with the specification.

If implementation behavior and the specification disagree, the discrepancy MUST be investigated before changing tests.

---

## Error Changes

When adding or changing portable error behavior:

```text
[ ] update the canonical specification
[ ] update conformance vectors
[ ] update implementation tests
[ ] update mutation-sensitive tests when the error is financially critical
[ ] update JSDoc @throws and portable error references
[ ] update README examples if users may encounter the error
[ ] update Agentic operation metadata when the portable error surface changes
```

Portable errors MUST remain traceable across specification, conformance, implementation, JSDoc, and Agentic metadata where applicable.

---

## Architecture Changes

When package boundaries, adapters, public entry points, operation dispatch, or dependency directions change:

```text
[ ] update architecture tests where applicable
[ ] update relevant README architecture sections
[ ] update diagrams or examples that describe the old structure
[ ] update AGENTS.md if development rules or architectural responsibilities changed
[ ] verify that architectural boundaries remain enforced
```

Documentation must not describe an architecture that no longer exists.

---

## Supported Capability Changes

When a previously unsupported FinKore capability becomes implemented, or an implementation status changes:

```text
[ ] update unit tests
[ ] execute relevant conformance vectors
[ ] update implementation README status
[ ] update examples if applicable
[ ] update conformance adapter operation support
[ ] verify canonical Agentic operation IDs remain aligned
[ ] update any public capability/status tables
```

Do not leave README sections claiming a feature is unsupported after it has been implemented.

Do not claim full domain conformance while required vectors remain unsupported.

---

## Documentation Freshness Rule

Documentation MUST describe the code and project state that exist now.

Do not document planned functionality as implemented functionality.

Do not leave stale:

- usage examples;
- API names;
- supported operation lists;
- implementation status;
- error references;
- package paths;
- architecture diagrams;
- conformance claims.

If a meaningful implementation milestone changes current capabilities, review the relevant README files before completing the task.

---

## JSDoc Freshness Rule

JSDoc is part of the public API contract for language-specific implementations.

When code behavior changes, JSDoc MUST be reviewed even if the function signature does not change.

Examples include:

- new portable error conditions;
- changed mutation semantics;
- new validation behavior;
- changed serialization semantics;
- changed preconditions;
- changed return guarantees.

Do not leave comments that describe previous behavior.

---

## Test Freshness Rule

Tests MUST represent the current normative behavior.

When a bug is found:

1. reproduce it with a failing test or conformance vector;
2. confirm the test fails against the defective behavior;
3. fix the implementation;
4. retain the regression test permanently where appropriate;
5. update JSDoc/README if the bug revealed previously incorrect documentation.

Do not delete a regression test simply because the implementation has been fixed.

---

## Completion Rule

Before completing any significant task, explicitly evaluate:

```text
Did this change require updates to unit tests?
Did this change require updates to conformance vectors?
Did this change require updates to mutation-sensitive tests?
Did this change require updates to JSDoc?
Did this change require updates to README documentation?
Did this change require updates to /spec?
Did this change require updates to /conformance?
Did this change require updates to /agentic?
Did this change require updates to AGENTS.md?
```

If yes, make those updates before considering the task complete.

A code-only change is incomplete when it leaves affected tests or documentation behind.

---

# Verification Required Before Completing Code Tasks

For meaningful TypeScript implementation changes, run the relevant available checks:

```text
build
strict TypeScript
unit tests
coverage
conformance
mutation testing
```

Report failures honestly.

Do not describe a subset implementation as fully conformant.

Distinguish:

```text
implemented
passing conformance
unsupported
not yet specified
```

---

# Definition of Done for New Financial Behavior

A new normative financial behavior is not complete until, where applicable:

```text
[ ] Domain behavior exists in /spec
[ ] Stable requirement ID exists
[ ] Conformance vector exists
[ ] Positive behavior is tested
[ ] Negative behavior is tested
[ ] Boundary behavior is tested
[ ] Relevant invariants are tested
[ ] Mutation-sensitive tests exist
[ ] TypeScript implementation passes
[ ] Conformance passes
[ ] Critical mutants are killed
[ ] Public API has JSDoc
[ ] Relevant requirement IDs are referenced from JSDoc
[ ] Relevant README documentation is current
[ ] Agentic operation metadata is current where applicable
[ ] No architectural boundary was violated
```

Not every trivial rule needs every test category, but critical financial behavior should receive the strongest treatment.

---

# CoreDoc and Release Review Governance

Read [CoreDoc](docs/coreDoc/core-doc.md) for foundation-level financial obligations;
`/spec` refines the precise domain behavior and must not silently contradict it.

CoreDoc is the durable record for foundation-level normative evolution. Record
attributed material findings, resolutions, exact artifact revision, stable rule
or requirement identifiers, and explicit scoped maintainer acceptance there or
in the affected specification. [Release notes](docs/releases/README.md) record
shipped scope, compatibility, verification, and actual external-review status.
Developer plans organize active work but are not normative or release evidence.

Required domain, accounting, technical, security, and privacy analysis remains
mandatory where specified. External community or independent review is not a
prerequisite unless a current scope explicitly makes it one; record its actual
status and future review topics without inventing signoff or reviewer
credentials.

This policy does not resolve financial ambiguity, accept later domain decisions,
or waive conformance, mutation, traceability, or other verification gates.

---

# When Requirements Are Unclear

Never guess financial semantics.

When encountering ambiguity:

1. Search `/spec`.
2. Search `/conformance`.
3. Search `/agentic`.
4. Check requirement traceability.
5. If behavior remains undefined, report a specification gap.

Prefer:

> This behavior is not currently defined by FinKore Draft 0.1.

over inventing behavior.

Correct incompleteness is better than false financial precision.

---

# Coding Style Principle

Prefer code that makes financial rules explicit.

Avoid cleverness.

Avoid magic.

Avoid hidden normalization.

Avoid silent correction of invalid values unless the specification explicitly requires normalization.

The implementation should make it easy for another engineer to answer:

```text
Why is this allowed?
Why is this rejected?
Which FinKore requirement governs this?
Which test proves it?
Which documentation describes it?
```

That traceability is a core FinKore engineering value.
