<p align="center">
  <img src="./learn/img/Finkore.png" alt="FinKore" width="480" />
</p>

# FinKore

**Define once. Build many times.**

FinKore is an open-source, language-agnostic specification that makes recurring
financial behavior explicit, testable, and reusable across products and
implementations. It defines how **Money, Workflow, Audit, Approvals, and
Financial Entities** behave, how they fail, and what evidence they preserve.

The repository publishes the specification, portable acceptance cases, and an
Agentic Contract for machine clients. You use these artifacts to build and
evaluate an implementation in your own language and stack.

<a href="https://finkore.dev" target="_blank" rel="noopener noreferrer">https://finkore.dev</a> ·
[Read the CoreDoc](./docs/coreDoc/core-doc.md) ·
[Build an implementation](./docs/implementation-guide.md)

## Why rebuild the same foundations?

**CRUD is easy. Financial CRUD isn't.**

An amount needs a currency, exact calculation, and explicit rounding. An
approval needs to remain tied to the facts that justified it. A rejected
workflow transition must preserve the state it was meant to change. An audit
trail must retain enough evidence to explain what happened.

These questions recur across financial products, yet their answers often live
inside application code, framework defaults, and decisions that are difficult
to recover. Teams build, discover edge cases, fix, document, then repeat the
work elsewhere.

FinKore brings those rules into a shared, inspectable contract. Your team can
understand the expected behavior before writing code and check its results
against portable acceptance cases afterward.

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

This repository maintains the contract and its maintenance tools. Financial
implementations, integrations, and conformance execution belong to consumers;
there is no installable financial library, hosted service, or Conformance
Runner here.

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

Contributions start with a financial domain problem and CoreDoc alignment.
Changes to behavior should connect specification requirements to conformance
cases, traceability, and Agentic metadata where applicable. If the specification
is silent, raise the gap before choosing new semantics.

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

After dependency installation, verification runs locally. It checks schemas,
vector structure, requirement traceability, Agentic consistency, repository
architecture, tool tests, documentation links, and licensing. These checks
validate the published artifacts; consumers execute financial operations
against their own implementations.

See [Developer Tools](./docs/tools/README.md) for Node setup, individual checks,
the separate `npm run dependencies:audit` review, and stable publication checks.

## Partners

<!-- Use width="200" for every partner logo and preserve its original aspect ratio. -->
<p>
  <a href="https://savoiabarker.com/" target="_blank" rel="noopener noreferrer">
    <img src="./learn/img/SavoiaBarker.png" alt="Savoia Barker" width="300" />
  </a>
</p>
