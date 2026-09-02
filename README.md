# FinFlow

> CRUD is easy. Financial CRUD isn't.

FinFlow is an open-source, specification-first, language-agnostic project for reusable financial domain behavior. It defines the rules that make financial software predictable and auditable, so teams can preserve the same meaning across services, frameworks, and programming languages.

## Why FinFlow?

Ordinary CRUD gets harder as soon as financial requirements appear:

- Money cannot safely be treated as an ordinary floating-point number.
- Approved records may no longer be freely editable.
- Posted financial data may require correction instead of deletion.
- Large transactions may require additional approvals.
- Every important mutation may need a durable audit history.
- The same financial behavior may need to exist across JavaScript, Java, Python, or other services.

These are domain problems, not framework problems. Yet teams repeatedly rebuild their own versions for every invoice, expense, purchase order, payment, and financial back-office workflow. The results often agree in the common case and diverge at exactly the boundary where correctness matters.

FinFlow exists to define that behavior once, independently of the stack that implements it.

## What FinFlow Standardizes

FinFlow Core currently develops portable rules for:

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
→ FINFLOW_MONEY_CURRENCY_MISMATCH
```

TypeScript and Java may expose different APIs. They should still produce the same financial behavior.

## Specification First

FinFlow is not defined by a particular package or implementation. The specification is the source of truth, and language implementations may provide idiomatic APIs while preserving its observable semantics.

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

This keeps financial meaning portable when a system moves from one framework, language, or architecture to another. See the [FinFlow Specification](./spec/README.md) for the normative rules and the non-normative implementation direction.

## Built for Financial Reliability

FinFlow uses language-independent conformance vectors, strict deterministic tests, boundary cases, and permanent regression vectors to verify observable behavior across implementations. Official implementations are also expected to use mutation testing against plausible financial defects.

> FinFlow tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

The [Conformance Suite](./conformance/README.md) documents the vector format, runner contract, traceability, regression policy, mutation policy, and quality model.

FinFlow is also [agent-ready by contract](./agentic/README.md): operations,
effects, portable errors, and domain constraints are machine-discoverable without
bypassing financial rules.

## Who Is This For?

FinFlow is intended for engineers and teams building:

- accounts payable and expense management;
- procurement and payment systems;
- accounting tooling and fintech platforms;
- financial back-office workflows;
- modern replacements for legacy financial platforms.

It is especially useful when domain behavior must remain consistent across multiple services or technology stacks.

## What FinFlow Is Not

FinFlow is not an ERP, ORM, payment processor, UI framework, accounting application, or replacement for an accounting engine. It provides portable financial domain primitives and behavioral contracts; applications decide how to compose them.

## Documentation

- [FinFlow Specification](./spec/README.md) — normative financial behavior, conventions, and domain definitions.
- [Conformance Suite](./conformance/README.md) — language-independent test vectors and reliability methodology.
- [Agentic Contract](./agentic/README.md) — portable operational semantics for machine clients.
- [Conformance Traceability](./conformance/traceability.md) — current vector coverage, known gaps, and readiness.

## Project Status

FinFlow is experimental. The Core Specification is under active development, and its initial conformance vectors are being expanded. Specification and conformance work come first; the planned initial reference implementation in TypeScript will follow.

The specification is expected to evolve significantly before version 1.0. Production use is not recommended yet, and no implementation should claim that its API defines FinFlow independently of the specification.

## Contributing

FinFlow is developed in the open. Contributions can begin with financial use cases, edge cases, specification proposals, conformance vectors, schemas, implementation work, documentation, or examples.

Start with the behavior that needs to be portable. For example:

> An approval should no longer be assumed valid after the amount used to determine the requirement changes.

That frames the domain problem more clearly than “we should add an `ApprovalVersion` class.” The specification can establish the invariant, conformance vectors can make it observable, and each implementation can then choose an idiomatic API.

Behavior first. API later.

## License

MIT
