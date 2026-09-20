# FinKore

> CRUD is easy. Financial CRUD isn't.

FinKore is an open-source, specification-first, language-agnostic project for reusable financial domain behavior. It defines the rules that make financial software predictable and auditable, so teams can preserve the same meaning across services, frameworks, and programming languages.

## Why FinKore?

Ordinary CRUD gets harder as soon as financial requirements appear:

- Money cannot safely be treated as an ordinary floating-point number.
- Approved records may no longer be freely editable.
- Posted financial data may require correction instead of deletion.
- Large transactions may require additional approvals.
- Every important mutation may need a durable audit history.
- The same financial behavior may need to exist across JavaScript, Java, Python, or other services.

These are domain problems, not framework problems. Yet teams repeatedly rebuild their own versions for every invoice, expense, purchase order, payment, and financial back-office workflow. The results often agree in the common case and diverge at exactly the boundary where correctness matters.

FinKore exists to define that behavior once, independently of the stack that implements it.

## What FinKore Standardizes

FinKore Core 0.9 is the current shared, language-neutral release candidate
intended to become Core 1.0. It covers portable rules for:

- exact Money representation, arithmetic, comparison, rounding, and serialization;
- Financial Entity identity, lifecycle, mutability, and validation;
- explicit Workflow states, transitions, guards, and terminal behavior;
- Approval requirements, conditions, decisions, and chains;
- append-only Audit history, actors, changes, and redaction;
- stable, portable error semantics for domain failures.

These primitives are designed to be composed by financial applications. They make important behavior explicit: whether an operation is valid, what changes are permitted, what must be recorded, and which error another system can reliably understand.

Consider a simple monetary operation:

```text
10.20 EUR + 5.30 EUR
→ 15.50 EUR
```

The same operation with incompatible currencies must not silently succeed:

```text
10.20 EUR + 5.30 USD
→ FINKORE_MONEY_CURRENCY_MISMATCH
```

TypeScript, Python, and Java may expose different APIs. They should still
produce the same financial behavior.

## Specification First

FinKore is not defined by a particular package or implementation. The specification is the source of truth, and language implementations may provide idiomatic APIs while preserving its observable semantics.

Frameworks and architectures change; financial meaning should survive. A move from a monolith to services, from Node.js to Java, or from one frontend framework to another should not silently redefine what `APPROVED`, `POSTED`, `PAID`, or `REVERSED` means.

```text
Problem
   ↓
Specification
   ↓
Conformance Tests
   ↓
Reference Implementation
   ↓
Other Implementations
```

This keeps financial meaning portable when a system moves from one framework, language, or architecture to another. See the [FinKore Specification](./spec/README.md) for the normative rules and the non-normative implementation direction.

## Built for Financial Reliability

FinKore uses language-independent conformance vectors, strict deterministic tests, boundary cases, and permanent regression vectors to verify observable behavior across implementations. Official implementations are also expected to use mutation testing against plausible financial defects.

> FinKore tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

The [Conformance Suite](./conformance/README.md) documents the vector format, runner contract, traceability, regression policy, mutation policy, and quality model.

FinKore is also [agent-ready by contract](./agentic/README.md): operations,
effects, portable errors, and domain constraints are machine-discoverable without
bypassing financial rules.

## Who Is This For?

FinKore is intended for engineers and teams building:

- accounts payable and expense management;
- procurement and payment systems;
- accounting tooling and fintech platforms;
- financial back-office workflows;
- modern replacements for legacy financial platforms.

It is especially useful when domain behavior must remain consistent across multiple services or technology stacks.

## What FinKore Is Not

FinKore is not an ERP, ORM, payment processor, UI framework, accounting application, or replacement for an accounting engine. It provides portable financial domain primitives and behavioral contracts; applications decide how to compose them.

## Documentation

- [FinKore Specification](./spec/README.md) — normative financial behavior, conventions, and domain definitions.
- [Specification Conventions](./spec/conventions.md) — normative language, compatibility policy, stable identifiers, portable values, and error-code catalog.
- [Conformance Suite](./conformance/README.md) — language-independent test vectors and reliability methodology.
- [Agentic Contract](./agentic/README.md) — portable operational semantics for machine clients.
- [Language-Neutral Implementation Guide](./docs/implementation-guide.md) — implementation reading order, boundaries, value semantics, errors, effects, and gap handling.
- [Conformance Adapter Onboarding](./docs/conformance-adapter-onboarding.md) — adapter integration, normalization, reporting, and local verification.
- [Conformance Traceability](./conformance/traceability.md) — current vector coverage, known gaps, and readiness.
- [Release Notes](./docs/releases/README.md) — concise release history.
- [Developer Tools](./docs/tools/README.md) — local build, test, coverage, mutation, and verification utilities.
- [Licensing](./LICENSING.md) — community license policy, third-party notice policy, and commercial-use guidance.

## Project Status

FinKore Core 0.9.1 is the current corrective release candidate for the frozen
Core 0.9 baseline. TypeScript, Python, and Java implement the current manifest
scope for Money, Workflow, Audit, Approvals, and Entities. The 0.9.1
corrections make timestamp precision and syntax, allocation integer bounds,
Audit actor errors, and requirement traceability consistent across that
baseline without adding a domain.

Money covers exact representation, serialization, arithmetic, comparison,
rounding, Rates, and Allocation. Workflow covers definitions, version binding,
transitions, guards, terminal states, import observations, and conflict
preconditions. Audit covers actors, events, changes, append-only history,
redaction, relationships, and portable errors. Approvals covers requirements,
conditions, decisions, validity, chains, and bounded composition. Entities covers
identity, lifecycle, mutability, validation, revisions, imports, and evolution
with required Audit evidence.

Rich condition expressions, delegation, escalation, unrestricted approval
graphs, dynamic approver resolution, authorization, global identity registries,
and concrete accounting domains remain outside the current scope.

The Core release version is separate from other version lines:

- `FinKore Core 0.9` identifies the current language-neutral release-candidate
  behavioral baseline.
- `finkoreConformance` and `finkoreVectorFile` identify manifest and vector
  syntax compatibility, not the Core release.
- The conformance runner package version identifies the runner implementation,
  not financial behavior.
- Language package versions identify package release artifacts, not independent
  FinKore semantics.

No planned behavioral changes remain before Core 1.0, but the project is still
pre-1.0 and production use is not recommended yet. No implementation should
claim that its API defines FinKore independently of the specification.

The complete local release gate is `npm run verify`. It validates Node
`>=24.11.0 <25`, CPython 3.12 and 3.13, JDK 21, and Maven 3.9.x; executes the
complete manifest against all three implementations; and checks distributable
artifacts through isolated consumer installs. See [Developer
Tools](./docs/tools/README.md) for clean-checkout instructions.

## Migration From Pre-0.9

External package consumers should treat Core 0.9.1 as the corrected Core 0.9
release-candidate baseline rather than a continuation of earlier draft package
surfaces. The observable financial behavior is the frozen candidate described
by `/spec` and `conformance/manifest.json`.

- TypeScript consumers should import from `@finkore/typescript` package root.
  Money serialization helpers are no longer part of the root public API; use
  `Money.deserialize(value)` and `money.toJSON()` for the supported boundary.
- TypeScript, Python, and Java packages now expose their implemented Core
  baseline through `FINKORE_CORE_VERSION`, `CORE_VERSION`, and
  `FinKore.CORE_VERSION` respectively. These Core-version values are distinct
  from package artifact versions.
- Java conformance observation helpers are adapter internals rather than public
  core API. Portable consumers should use the documented `org.finkore` public
  classes and inspect `FinKoreException.code()`.
- The reference packages are not published to public registries for Core 0.9;
  local artifact consumption is documented in [Developer Tools](./docs/tools/README.md).

## Contributing

FinKore is developed in the open. Contributions can begin with financial use cases, edge cases, specification proposals, conformance vectors, schemas, implementation work, documentation, or examples.

Start with the behavior that needs to be portable. For example:

> An approval should no longer be assumed valid after the amount used to determine the requirement changes.

That frames the domain problem more clearly than “we should add an `ApprovalVersion` class.” The specification can establish the invariant, conformance vectors can make it observable, and each implementation can then choose an idiomatic API.

Behavior first. API later.

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [Contributor Licensing](./docs/governance/contributor-licensing.md) for contribution licensing expectations.

## License

FinKore is licensed under the Mozilla Public License 2.0 (`MPL-2.0`).

FinKore may be used in commercial and proprietary systems. MPL-2.0 applies file-level copyleft obligations to covered source files under the conditions defined by the license.

See [LICENSE](./LICENSE) and [LICENSING.md](./LICENSING.md). The license text controls over explanatory project documentation.
