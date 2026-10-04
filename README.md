# FinKore

> **Financial CRUD isn't ordinary CRUD.**

FinKore is an open-source, language-agnostic specification for predictable,
auditable, and portable financial domain behavior. It gives recurring rules for
Money, Workflow, Audit, Approvals, and Financial Entities stable names, precise
semantics, and portable acceptance cases.

## Why FinKore exists

Ordinary application operations become financially significant when exact
decimal values, currencies, historical facts, approvals, lifecycle rules, and
failure atomicity matter. A harmless-looking local decision can otherwise
change meaning across services or languages.

FinKore separates product policy from portable financial foundations:

| Your application decides | FinKore makes explicit |
| --- | --- |
| Business policies, thresholds, permissions, and user experience | How declared financial rules behave and fail |
| Storage, transport, framework, and API design | Observable values, errors, invariants, and mutation effects |
| Which domains and operations to implement | Stable requirement and operation identifiers for the selected scope |

For example, the Money specification makes allocation remainder behavior
deterministic; Workflow declares terminal-state failures and unchanged state;
Approvals binds decisions to relevant facts; Audit preserves committed logical
history. Those outcomes should not depend on a framework default or whichever
service happened to implement them first.

## Start reading

Start with [CoreDoc](./docs/coreDoc/core-doc.md) for the financial principles and
why they matter, then choose a domain from the table below. Each domain overview
links to its detailed rules. You can read one domain at a time.

In the specifications, **normative** means part of the contract: uppercase
**MUST** and **MUST NOT** mark obligations, **SHOULD** and **SHOULD NOT** mark
recommendations, and **MAY** marks permission. CoreDoc also uses **SHALL** and
**SHALL NOT** for obligations. Requirement IDs such as `MONEY-ARITHMETIC-001`
let you trace a rule to its acceptance cases. Examples explain the rules;
their authority is described in [Conventions](./spec/conventions.md#normative-language).

Keep the [glossary](./spec/glossary.md) nearby for unfamiliar terms. The
[specification index](./spec/README.md) and
[documentation index](./learn/index.html) provide the full reading map.

## Current scope

The FinKore Core 2.0.2 stable normative baseline covers:

| Domain | Defined behavior |
| --- | --- |
| [Money](./spec/money/README.md) | Exact amounts and currencies; arithmetic, comparison, rates, allocation, rounding, and serialization |
| [Workflow](./spec/workflow/README.md) | Lifecycle states and permitted transitions; guards, terminal behavior, definition versions, imports, and conflict checks |
| [Audit](./spec/audit/README.md) | Attributable, append-only history; events, changes, relationships, redaction, and portable failures |
| [Approvals](./spec/approvals/README.md) | Required business decisions; conditions, validity, lifecycle history, chains, and bounded composition |
| [Financial Entities](./spec/entities/README.md) | Stable identity over time; lifecycle, mutability, validation, revisions, imports, and evidence-backed evolution |

The project does not define an ERP, accounting application, payment platform,
ledger, persistence layer, authorization system, user interface, hosted service,
or agent runtime. Ledger posting, tax, FX sourcing, reconciliation, settlement,
and other concrete accounting domains remain outside the current Core scope.

## Using the contract

This repository publishes the contract and maintenance tools. You supply the
financial implementation and choose its language, API, storage, and execution
tooling; there are no installable language packages, financial implementation,
Conformance Runner, or adapter API here.

| When you want to… | Read |
| --- | --- |
| Build an implementation | [Implementation guide](./docs/implementation-guide.md) |
| Check behavior against portable acceptance cases | [Conformance artifacts](./conformance/README.md) and [consumer guide](./conformance/consumer-guide.md) |
| Find cases for a requirement and understand coverage limits | [Requirement traceability](./conformance/traceability.md) |
| Expose operations to agents or other machine clients | [Agentic Contract](./agentic/README.md) |

CoreDoc supplies the foundation; `/spec` defines precise domain behavior.
Conformance vectors are test inputs and expected observations, and Agentic
metadata describes canonical `finkore.*` operations. Both derive from the
specification. The Agentic Contract covers discovery and operation semantics;
you supply executable tools and transports, subject to the same financial rules.

## Repository verification

The maintained Node tooling checks the published artifacts themselves. Node
`>=24.11.0 <25` is required.

```bash
npm ci --no-audit
npm run verify
```

This validates artifact schemas, vectors, traceability, Agentic consistency,
repository architecture, tool tests, documentation links, and licenses. After
dependency installation, verification runs locally. It checks the published
artifacts; external implementation conformance requires consumer-owned execution.

See [Developer Tools](./docs/tools/README.md) for setup, individual commands,
publication checks, and the separate network-backed `npm run dependencies:audit`.

## Status and evidence

Known limits are recorded alongside the specification rules, in
[traceability](./conformance/traceability.md), and in the Agentic Contract.
Acceptance cases and repository checks provide bounded evidence; they do not
establish exhaustive financial correctness, production readiness, or regulatory
suitability. [Release notes](./docs/releases/README.md) summarize published
history; detailed development history remains in Git.

## Contributing

Contributions should begin with portable financial behavior, not an API shape.
Connect normative changes to stable requirement IDs, conformance cases,
traceability, and Agentic metadata where applicable. Do not infer new financial
semantics from an implementation or fixture when the specification is silent.

See [CONTRIBUTING.md](./CONTRIBUTING.md) and
[Contributor Licensing](./docs/governance/contributor-licensing.md).

## License

FinKore is licensed under the Mozilla Public License 2.0 (`MPL-2.0`) and may be
used in commercial and proprietary systems subject to the license terms. See
[LICENSE](./LICENSE) and [LICENSING.md](./LICENSING.md). The license text
controls.
