# FinKore

> **Financial behavior, made explicit.**

**Define once. Build many times.**

Financial software shouldn't have to reinvent the same foundations over and
over again.

FinKore is an open-source, language-agnostic specification for recurring
financial software behavior.

It defines how common financial foundations such as **Money, Workflow, Audit,
Approvals, and Financial Entities** should behave, fail, and remain observable
across implementations.

FinKore is not a SaaS, an ERP, a payment platform, or another framework.

It is a reference and contract for financial behavior.

**Know the rule before you write the code.**

---

## Financial CRUD isn't ordinary CRUD

A monetary amount looks like a number until currencies, precision, rounding,
allocation, and serialization begin to matter.

An approval looks like a status until the facts that justified it change.

An audit trail looks like a list until someone needs to reconstruct exactly
what happened.

A workflow looks like a state machine until terminal states, failed transitions,
imports, and historical definitions become financially significant.

These problems appear again and again in financial software.

Yet teams repeatedly solve them inside application code, internal abstractions,
tests, documentation, and historical decisions.

The result is familiar:

**Build → discover edge cases → fix → document → rebuild somewhere else.**

FinKore exists to make those recurring rules explicit before they become
another implementation detail.

---

## Your product may be unique. Your financial rules don't have to be.

FinKore does not replace your business logic.

Your application still decides what makes your product different:

| Your application decides | FinKore makes explicit |
| --- | --- |
| Business policies, thresholds, permissions, and user experience | How declared financial rules behave and fail |
| Storage, transport, framework, and API design | Observable values, errors, invariants, and mutation effects |
| Which domains and operations exist in your product | Stable requirements and operation identifiers for the selected FinKore scope |

FinKore sits underneath those decisions.

It turns recurring financial problems into:

- explicit specifications
- stable rules and identifiers
- portable acceptance cases
- observable failure semantics
- reusable implementation contracts

The goal is simple:

> **Don't rediscover the rule every time you implement it.**

---

## The Standard and the Foundation

FinKore combines two ideas.

### The Standard

**The Standard defines what should happen.**

Rules are written explicitly, documented, identified, and connected to portable
acceptance cases.

Instead of asking:

> How should we implement this?

FinKore aims to make the first question:

> What does the rule say?

### The Foundation

**The Foundation makes those rules reusable.**

Implementations can use different languages, frameworks, APIs, storage systems,
and architectures while preserving the same observable financial behavior.

The Standard defines.

The Foundation enables reuse.

**Know the rule. Build on it.**

---

## What FinKore makes explicit

The FinKore Core `2.0.2` stable normative baseline currently covers:

| Domain | Defined behavior |
| --- | --- |
| [Money](./spec/money/README.md) | Exact amounts and currencies; arithmetic, comparison, rates, allocation, rounding, and serialization |
| [Workflow](./spec/workflow/README.md) | Lifecycle states and permitted transitions; guards, terminal behavior, definition versions, imports, and conflict checks |
| [Audit](./spec/audit/README.md) | Attributable, append-only history; events, changes, relationships, redaction, and portable failures |
| [Approvals](./spec/approvals/README.md) | Required business decisions; conditions, validity, lifecycle history, chains, and bounded composition |
| [Financial Entities](./spec/entities/README.md) | Stable identity over time; lifecycle, mutability, validation, revisions, imports, and evidence-backed evolution |

For example:

- **Money** defines deterministic allocation remainder behavior.
- **Workflow** defines terminal-state failures and unchanged state.
- **Approvals** binds decisions to the relevant facts that justified them.
- **Audit** preserves committed logical history.
- **Financial Entities** defines how identity and permitted change evolve over time.

These outcomes should not depend on a framework default or whichever service
happened to implement them first.

---

## What FinKore is not

FinKore deliberately does not attempt to become an entire financial platform.

The Core does not define:

- an ERP
- an accounting application
- a payment platform
- a ledger
- a persistence layer
- an authorization system
- a user interface
- a hosted service
- an agent runtime

Ledger posting, tax, FX sourcing, reconciliation, settlement, and other concrete
accounting domains remain outside the current Core scope.

FinKore defines the financial behavior that belongs at the foundation.

Your product remains yours.

---

## Start with the rule, not the implementation

The best place to start is [CoreDoc](./docs/coreDoc/core-doc.md).

CoreDoc explains the financial principles behind the specification and why they
exist.

From there, choose a domain and follow its rules independently.

The specifications use normative language deliberately:

- **MUST** / **MUST NOT** define obligations.
- **SHOULD** / **SHOULD NOT** define recommendations.
- **MAY** defines permission.
- CoreDoc additionally uses **SHALL** / **SHALL NOT** for obligations.

Stable requirement identifiers such as:

```text
MONEY-ARITHMETIC-001
```

connect financial rules to their acceptance cases and supporting artifacts.

Examples explain behavior, but the normative specification remains the contract.

See:

- [CoreDoc](./docs/coreDoc/core-doc.md)
- [Specification index](./spec/README.md)
- [Glossary](./spec/glossary.md)
- [Conventions](./spec/conventions.md#normative-language)
- [Documentation](./learn/index.html)

---

## One contract. Different implementations.

FinKore is language-agnostic by design.

This repository publishes the financial contract and the tools used to maintain
and verify it.

It does **not** publish an installable financial implementation.

You choose:

- programming language
- framework
- API design
- storage
- runtime
- deployment model

The behavior defined by the selected FinKore scope should remain portable
between them.

| When you want to… | Start here |
| --- | --- |
| Build an implementation | [Implementation guide](./docs/implementation-guide.md) |
| Check behavior against portable acceptance cases | [Conformance artifacts](./conformance/README.md) and [consumer guide](./conformance/consumer-guide.md) |
| Find cases for a requirement and understand coverage limits | [Requirement traceability](./conformance/traceability.md) |
| Expose canonical operations to agents or machine clients | [Agentic Contract](./agentic/README.md) |

The relationship is:

```text
CoreDoc
   ↓
Specification
   ↓
Conformance
   ↓
Implementation
```

CoreDoc provides the principles.

`/spec` defines the normative behavior.

Conformance vectors provide portable inputs and expected observations.

Agentic metadata describes canonical `finkore.*` operations.

Implementations and transports remain yours.

---

## Show the logic. Don't sell the magic.

FinKore is built around explicit behavior rather than hidden abstractions.

A financial rule should be possible to:

- inspect
- explain
- identify
- test
- trace
- reproduce

That is also why the project avoids claiming universal financial correctness.

Specifications and acceptance cases provide bounded, inspectable evidence.

They do not by themselves establish exhaustive financial correctness,
production readiness, legal compliance, or regulatory suitability.

Known limits are documented alongside specification rules, in
[traceability](./conformance/traceability.md), and in the Agentic Contract.

---

## Verify the repository

The maintained Node tooling verifies the published FinKore artifacts themselves.

Node:

```text
>=24.11.0 <25
```

Run:

```bash
npm ci --no-audit
npm run verify
```

Verification checks:

- artifact schemas
- conformance vectors
- requirement traceability
- Agentic consistency
- repository architecture
- tooling tests
- documentation links
- licensing consistency

After dependencies are installed, verification runs locally.

This verifies the FinKore artifacts.

Conformance of an external financial implementation remains the responsibility
of the implementation and its execution environment.

See [Developer Tools](./docs/tools/README.md) for setup, individual commands,
publication checks, and the separate network-backed:

```bash
npm run dependencies:audit
```

---

## Contributing

FinKore contributions should begin with **financial behavior**, not API design.

Before introducing an abstraction, ask:

> What financial rule are we trying to make explicit?

Normative changes should connect, where applicable, to:

- stable requirement IDs
- specification rules
- conformance cases
- traceability
- Agentic metadata

Do not infer new financial semantics from an implementation, fixture, or
framework behavior when the specification is silent.

See:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [Contributor Licensing](./docs/governance/contributor-licensing.md)

---

## Releases and evidence

[Release notes](./docs/releases/README.md) summarize published FinKore history.

Detailed development history remains available through Git.

Specifications, tests, conformance artifacts, and repository verification exist
to make the project's claims inspectable.

**Show the logic. Don't sell the magic.**

---

## License

FinKore is open source under the Mozilla Public License 2.0 (`MPL-2.0`).

It may be used in commercial and proprietary systems subject to the license
terms.

See:

- [LICENSE](./LICENSE)
- [LICENSING.md](./LICENSING.md)

The license text controls.
