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

FinKore Core currently develops portable rules for:

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

TypeScript and Java may expose different APIs. They should still produce the same financial behavior.

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
- [Conformance Suite](./conformance/README.md) — language-independent test vectors and reliability methodology.
- [Agentic Contract](./agentic/README.md) — portable operational semantics for machine clients.
- [Language-Neutral Implementation Guide](./docs/implementation-guide.md) — implementation reading order, boundaries, value semantics, errors, effects, and gap handling.
- [Conformance Adapter Onboarding](./docs/conformance-adapter-onboarding.md) — adapter integration, normalization, reporting, and conformance-claim evidence.
- [Draft 0.5 Python and Java Handoff](./docs/draft-0.5-python-java-handoff.md) — historical bounded starting checklist for the completed implementation milestone.
- [Draft 0.5 Cross-Language Implementation Plan](./docs/plans/draft-0.5-cross-language-task-list.md) — completed execution record for full Python and Money-scope Java conformance.
- [Draft 0.6 Portability and Compatibility Plan](./docs/plans/draft-0.6-portability-compatibility-task-list.md) — completed execution record for capability floors, compatibility governance, claims, and reproducible release evidence.
- [Pre-Draft 0.7 Readiness Plan](./docs/plans/pre-draft-0.7-readiness-task-list.md) — completed Draft 0.6 release-evidence correction and Java full-profile parity gate.
- [Draft 0.7 Cross-Domain Composition Plan](./docs/plans/draft-0.7-composition-task-list.md) — pending execution tasks for expense approval and invoice correction profiles across TypeScript, Python, and Java.
- [Draft 0.5 to 1.0 Roadmap](./docs/plans/good-to-have.md) — proposed non-normative sequence from independent portability proof to a stable 1.0 foundation.
- [Conformance Traceability](./conformance/traceability.md) — current vector coverage, known gaps, and readiness.
- [Release Notes](./docs/releases/README.md) — shipped scope, exclusions, review status, and verification by Core draft.
- [Draft 0.4 Foundation Plan](./docs/plans/draft-0.4-foundation-task-list.md) — completed stabilization work for the closed Draft 0.4 baseline.
- [Licensing](./LICENSING.md) — community license policy, third-party notice policy, and commercial-use guidance.

## Project Status

FinKore is experimental. FinKore Core Draft 0.6 is closed with release-evidence correction; Draft 0.7 composition planning is prepared and execution is pending. Draft 0.6 publishes a portable Money capability floor, compatibility/deprecation rules, closed conformance profiles, implementation capability declarations, metadata validation, and profile-specific claim records. TypeScript, Python, and Java currently pass the Draft 0.6 full profile at 254/254 vectors; Java full-profile parity was completed after the original Draft 0.6 closure as TASK-257 pre-Draft 0.7 readiness evidence. The immutable Draft 0.6 tag `core-draft-0.6` remains preserved as historical evidence while TASK-256 records corrected checksum/provenance evidence.

Money, Workflow, Audit, Approvals, and Entities are complete for Draft 0.1 in the TypeScript reference implementation, Python implementation, and Java implementation. Money covers representation, canonical serialization, portable errors, exact arithmetic, exact compatible-currency comparison, explicit rounding, the Draft 0.2 Money Rates and Money Allocation slices, and the Draft 0.6 portable numeric/allocation floor. Workflow covers definitions, exact state identity, initial and current state, directed transitions, guards, explicit terminal states, portable errors, and state preservation after rejection; Draft 0.3 specifies, vector-covers, implements, and adapts Workflow definition/version identity, immutable instance binding/mismatch behavior, import of existing state/version observations, and expected-state/revision conflict preconditions. The canonical `finkore.workflow.transition` Agentic descriptor is aligned with the version/conflict preconditions, while Workflow import remains conformance-local. Audit covers events, actors, append-only logical history, changes, redaction, Audit Relationships, and portable Audit errors. Approvals covers requirement and decision representation, decision recording, requirement evaluation, subject-fact effectiveness, withdrawal, expiration, Decision and Requirement supersession, append-only Decision and lifecycle history preservation, condition representation, condition required-fact completeness, explicit condition evaluation boundaries, all-required sequential and unordered Approval Chains, duplicate Requirement rejection in chains, Draft 0.3 Approval Composition for bounded any-of/all-of groups, N-of-M quorum groups, ordered stages, nested groups, and portable Approval errors. Approval lifecycle and composition operation labels remain conformance-local rather than canonical Agentic operations. Entities covers identity, lifecycle, mutability, validation, Draft 0.2 Entity Evolution correction/reversal/void/supersession history, required Audit evidence for evolution, Draft 0.3 Entity Revision and Import identity mapping/conflict preconditions, portable Entity errors, and canonical `finkore.entity.*` Agentic operation IDs for the current Entity operation surface. Entity import remains conformance-local. Rich condition expressions, delegation, escalation, parallel approval graphs beyond bounded composition, dynamic approver resolution, authorization/RBAC, generic entity validation rule engines, concrete Entity/Audit integration policy, global identity registries, and other FinKore domains remain deferred for future drafts.

The specification is expected to evolve significantly before version 1.0. Production use is not recommended yet, and no implementation should claim that its API defines FinKore independently of the specification.

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
