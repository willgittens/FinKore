> FinKore Core 2.0.2 stable. See the [specification status](./spec/README.md#status)
> and [release notes](./docs/releases/README.md).

<p align="center">
  <img src="./learn/img/Finkore.png#gh-light-mode-only"
       alt="FinKore" width="480" />
  <img src="./learn/img/Finkore_White.png#gh-dark-mode-only"
       alt="FinKore" width="480" />
</p>

# FinKore

**CRUD is easy. Financial CRUD isn't.**

Financial applications repeatedly face the same questions: How should money be
rounded? When is an approval no longer valid? What must happen when an operation
fails? Different answers can change amounts, invalidate controls, or lose the
evidence needed to explain a transaction.

FinKore gives teams a shared foundation for answering those questions. It is an
open-source, language-independent specification that defines how fundamental
financial operations behave, how they fail, and how consumers can verify their
results. It covers **Money, Workflow, Audit, Approvals, and Financial Entities**
through three layers:

**CoreDoc → Specifications → Conformance**

Financial principles become precise technical requirements. Those requirements
become portable acceptance cases. Developers use them to build and evaluate
their own implementations, in their own languages and architectures. The
Agentic Contract describes the same operations for machine clients.

Your team chooses the language, architecture, and tools. Your product and
implementation remain yours, while the financial foundation becomes something
we can define, verify, and improve together.

**Define once. Build many times.**

<a href="https://finkore.dev" target="_blank" rel="noopener noreferrer">https://finkore.dev</a>

[Read the CoreDoc](./docs/coreDoc/core-doc.md)

[Build an implementation](./docs/implementation-guide.md)

## What do you actually get?

| FinKore provides | FinKore does not provide |
| --- | --- |
| Documented financial rules | A ready-made financial application |
| Stable, verifiable technical requirements | A mandatory architecture |
| Portable conformance cases | A financial implementation or Conformance Runner |
| Operation contracts for machine clients | An executable agent integration or hosted AI service |
| Open specifications and maintenance tools | A SaaS platform or installable financial library |

Consumers implement the selected domains and own invocation, observation,
comparison, reporting, and application security.

## Your product may be unique. Your financial rules don't have to be.

FinKore is intended for engineers, architects, and financial-domain reviewers
working on banks, fintechs, SaaS platforms, ERPs, and other financial systems.
It provides a common reference for discussing behavior across teams and
implementations.

| FinKore makes explicit | Your application decides |
| --- | --- |
| Observable values, results, errors, and invariants | Language, framework, API, storage, and deployment |
| How declared lifecycle and approval rules behave | Business policies, thresholds, permissions, and user experience |
| Stable requirements and portable acceptance cases | Which FinKore domains to implement and how to integrate them |

Ledger posting, tax, FX sourcing, reconciliation, settlement, and concrete
accounting models remain outside the current Core scope. See the
[specification scope](./spec/README.md#scope-discipline-non-normative) for the
boundaries.

## What the Core covers

Choose the domain that addresses the question in front of you:

| Domain | Questions it answers |
| --- | --- |
| [Money](./spec/money/README.md) | How do amounts retain their currency and exact value through arithmetic, rounding, allocation, and serialization? |
| [Workflow](./spec/workflow/README.md) | Which lifecycle changes are permitted, and what happens when a transition is rejected? |
| [Audit](./spec/audit/README.md) | What happened, who acted, and how is committed history preserved? |
| [Approvals](./spec/approvals/README.md) | What was approved, under which conditions, and does that decision still apply? |
| [Financial Entities](./spec/entities/README.md) | How does a financial subject retain its identity through validation, revisions, and permitted change? |

Each domain defines observable behavior independently of implementation
architecture. Together, they provide foundations your application can compose
for its own financial use cases.

## From financial principle to implementation

Start with the reason a rule exists, then follow it to its precise requirements
and acceptance cases:

```text
CoreDoc — financial principles and obligations
   ↓
Specification — precise behavior and stable requirement IDs
   ├── Conformance artifacts — portable inputs and expected observations
   └── Agentic Contract — canonical operation semantics for machine clients
                     ↓
       Consumer-owned implementations and integrations
```

[CoreDoc](./docs/coreDoc/core-doc.md) states the foundation-level financial
obligations. The [specification](./spec/README.md) refines them into requirements,
invariants, and portable errors. Normative terms such as **MUST**, **SHOULD**,
and **MAY** distinguish obligations, recommendations, and permissions; see the
[conventions](./spec/conventions.md#normative-language) for their meaning.

[Conformance artifacts](./conformance/README.md) connect those requirements to
portable acceptance cases, including failure, boundary, and mutation-sensitive
cases. Stable IDs such as `MONEY-ARITHMETIC-001` let you trace a rule to its
supporting evidence. The [manifest](./conformance/manifest.json) is the only
entry point for discovering vector files.

The [Agentic Contract](./agentic/README.md) describes canonical operations such
as `finkore.money.add`: their inputs, outputs, errors, effects, and safety
properties. Consumers provide executable integrations and authorization
infrastructure. The specification remains authoritative for financial behavior.

### Concrete example: rounding a monetary amount

**CoreDoc → Specification → Conformance → Consumer Implementation**

[CoreDoc CORE-001.2](./docs/coreDoc/core-doc.md#core-0012-exact-calculation-and-explicit-rounding)
requires a declared rule when reducing precision. The
[Money rounding specification](./spec/money/rounding.md) makes the target scale
and mode explicit (`MONEY-ROUNDING-001`) and defines the portable modes
(`MONEY-ROUNDING-003`).

The [rounding vectors](./conformance/money/rounding.json), discovered through the
[manifest](./conformance/manifest.json), include these two cases for
`finkore.money.round` at scale 2:

| Vector ID | Input | Mode | Expected value |
| --- | --- | --- | --- |
| `money.round.half-up.tie-positive-001` | `10.005 EUR` | `HALF_UP` | `10.01 EUR` |
| `money.round.half-even.tie-even-down-001` | `10.005 EUR` | `HALF_EVEN` | `10.00 EUR` |

A consumer could implement this behavior in TypeScript, Java, or Go and compare
its observations with these cases. FinKore supplies the rules and expected
observations; consumers supply the implementation and execution.

## Start reading or building

| If you want to… | Start here |
| --- | --- |
| Get an overview of the project | [Learn introduction](./learn/index.html) |
| Understand the financial principles | [CoreDoc](./docs/coreDoc/core-doc.md) or its [web reader](./learn/coredoc.html) |
| Find a precise rule | [Specification index](./spec/README.md) and [glossary](./spec/glossary.md) |
| Implement a domain in your codebase | [Implementation guide](./docs/implementation-guide.md) |
| Evaluate your implementation against acceptance cases | [Conformance consumer guide](./conformance/consumer-guide.md) |
| Find evidence for a requirement and understand coverage limits | [Requirement traceability](./conformance/traceability.md) |
| Integrate agents or other machine clients | [Agentic Contract](./agentic/README.md) |
| Make a first contribution | [Contributor workflow](./CONTRIBUTING.md#make-your-first-contribution) |

You can begin with one domain. Read its rules, implement the selected scope,
and use the published cases alongside your own evidence to evaluate the
result. Consumers own invocation, observation, comparison, and reporting.

Acceptance cases provide bounded evidence; their existence alone does not
establish that an implementation conforms or that its behavior is exhaustively
tested.

## Build on FinKore. Keep your product yours.

FinKore's project-owned materials are open source under the **Mozilla Public
License 2.0 (MPL-2.0)**, unless a file states otherwise. Commercial and
proprietary use is permitted subject to the license terms.

See [Licensing](./LICENSING.md) for the distinction between implementing the
specified behavior and copying or modifying covered repository files. The
[license text](./LICENSE) controls.

## Contributing

Useful first contributions include:

- Clarifying documentation or reviewing an existing requirement.
- Reporting a specification gap or adding a portable acceptance case.
- Improving repository maintenance tools.

Follow the [first-contribution workflow](./CONTRIBUTING.md#make-your-first-contribution)
to choose a problem, validate the change, and submit a Pull Request.

Financial behavior proposals start with a domain problem and CoreDoc alignment.
Changes to behavior should connect specification requirements to conformance
cases, traceability, and Agentic metadata where applicable. If the specification
is silent, raise the gap before choosing new semantics.

Anyone may fork the repository, open Issues, participate in Discussions, review
and challenge specifications, and submit Pull Requests. Lead maintainer
`@willgittens` retains final integration authority. Report potentially
exploitable issues privately through the [Security Policy](./SECURITY.md).

See [Contributing](./CONTRIBUTING.md) for the workflow and
[Contributor Licensing](./docs/governance/contributor-licensing.md) for the
contribution terms. Published history is in the
[release notes](./docs/releases/README.md).

### Verify repository changes

The maintenance tools require **Node `>=24.11.0 <25`**. From the repository
root, run:

```bash
npm ci --no-audit
npm run verify
```

The same verification command runs locally and in GitHub Actions. It checks
schemas, vector structure, requirement traceability, Agentic consistency, repository
architecture, tool tests, documentation links, and licensing. These checks
validate the published artifacts; consumers execute financial operations
against their own implementations.

See [Developer Tools](./docs/tools/README.md) for Node setup, individual checks,
the separate `npm run dependencies:audit` review, and stable publication checks.

## Partners

No project grows without great partners. My special thanks to those who
supported FinKore at key stages of its journey.

<!-- Use width="200" for every partner logo and preserve its original aspect ratio. -->
<p>
  <a href="https://savoiabarker.com/" target="_blank" rel="noopener noreferrer">
    <img src="./learn/img/SavoiaBarker.png" alt="Savoia Barker" width="300" />
  </a>
</p>
