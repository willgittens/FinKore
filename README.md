# FinKore

> **Financial CRUD isn't ordinary CRUD.**

FinKore is an open-source, language-agnostic specification for predictable,
auditable, and portable financial domain behavior. It gives recurring rules for
Money, Workflow, Audit, Approvals, and Financial Entities stable names, precise
semantics, and portable acceptance cases.

FinKore is specification-first:

```text
Specification
      ↓
Conformance artifacts
      ↓
Agentic Contract
      ↓
Consumer-owned implementations and integrations
```

The specification is the source of truth. Conformance vectors and Agentic
metadata make the contract easier to verify and consume; they do not redefine
it.

## What this repository publishes

- [`spec/`](./spec/README.md) — normative financial behavior, invariants,
  terminology, serialization rules, and portable errors.
- [`conformance/`](./conformance/README.md) — language-independent acceptance
  cases, schemas, conventions, and requirement traceability.
- [`agentic/`](./agentic/README.md) — canonical `finkore.*` operation semantics,
  effects, preconditions, postconditions, and portable errors.
- [`docs/coreDoc/`](./docs/coreDoc/core-doc.md) — foundation-level financial
  principles that the domain specifications refine.
- [`docs/tools/`](./docs/tools/README.md) — repository-maintenance checks for
  artifact validity, traceability, architecture, documentation, and licensing.

This repository does **not** maintain a financial implementation, a Conformance
Runner, a runner adapter API, or installable language packages. Consumers choose
their own language, architecture, API, and execution tooling. The
[consumer guide](./conformance/consumer-guide.md) explains how to discover and
use the portable cases without prescribing those choices.

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

## Current scope

The FinKore Core 1.0 normative baseline covers:

| Domain | Defined behavior |
| --- | --- |
| Money | Exact decimal representation, currency compatibility, arithmetic, comparison, rates, allocation, rounding, and serialization |
| Workflow | States, transitions, guards, terminal behavior, definition binding, imports, and conflict preconditions |
| Audit | Actors, events, changes, append-only history, relationships, redaction, and portable failures |
| Approvals | Requirements, conditions, decisions, validity, lifecycle history, chains, and bounded composition |
| Financial Entities | Identity, lifecycle, mutability, validation, revisions, imports, and evidence-backed evolution |

The project does not define an ERP, accounting application, payment platform,
ledger, persistence layer, authorization system, user interface, hosted service,
or agent runtime. Ledger posting, tax, FX sourcing, reconciliation, settlement,
and other concrete accounting domains remain outside the current Core scope.

## Using the contract

Start with the artifacts that match your task:

The [documentation index](./learn/index.html) also links to these resources.

1. Read [CoreDoc](./docs/coreDoc/core-doc.md) for foundation-level obligations.
2. Read [specification conventions](./spec/conventions.md), the
   [glossary](./spec/glossary.md), and the relevant domain specification.
3. Use [conformance conventions](./conformance/conventions.md), the current
   [operation contracts](./conformance/operations.md), and
   [traceability](./conformance/traceability.md) to interpret the acceptance
   cases.
4. Read the [Agentic operation registry](./agentic/operations.md) when consuming
   a canonical `finkore.*` operation.
5. Follow the [implementation guide](./docs/implementation-guide.md) and
   [consumer guide](./conformance/consumer-guide.md) in your own codebase.

Conformance vectors are acceptance inputs and expected observations. They are
not production API schemas and do not prescribe a class model, exception model,
transport, command line, or test framework. A consumer-owned harness should load
[`conformance/manifest.json`](./conformance/manifest.json), validate referenced
files against the published schemas, dispatch canonical operation labels into
the consumer implementation, and compare normalized observations.

## Repository verification

The maintained Node tooling checks the published artifacts themselves. Node
`>=24.11.0 <25` is required.

```bash
npm ci --no-audit
npm run verify
```

This validates schemas and vectors, checks requirement and Agentic traceability,
enforces repository architecture, runs tool tests, checks documentation links
and licenses. After the locked dependency is installed, `npm run verify` is
local and makes no advisory-service request. It does **not** execute a financial
implementation or establish that any external implementation conforms.

Dependency vulnerability review is a separate, network-enabled maintenance
step:

```bash
npm run dependencies:audit
```

Its result covers the locked maintenance dependency graph against the advisory
data returned at that time; it is not a financial-behavior or artifact-validity
check. Installation may require registry access when the package cache is cold.

See [Developer Tools](./docs/tools/README.md) for individual commands.

## Status and evidence

CoreDoc, the specification, conformance artifacts, and Agentic Contract identify
the FinKore Core 1.0 stable baseline, with the accepted candidate's financial
behavior, acceptance cases, and canonical operation contracts preserved.
Known limitations and gaps are recorded in
the specification, [traceability](./conformance/traceability.md), and Agentic
Contract. [Release notes](./docs/releases/README.md) summarize published history;
detailed development and implementation history remains in Git.

Passing repository-maintenance checks proves that the published artifacts are
internally well-formed within their stated bounds. It does not prove exhaustive
financial correctness, external implementation conformance, production
readiness, or regulatory suitability.

## Agentic readiness

The [Agentic Contract](./agentic/README.md) makes operations discoverable,
understandable, governable, and conformance-traceable. It does not provide an MCP
server, agent framework, transport, authorization layer, or execution bypass.
Agents and other machine clients remain subject to the same financial rules as
every other consumer.

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
