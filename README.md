# FinKore

> **Financial CRUD isn't ordinary CRUD.**

FinKore is **not a SaaS, ERP, accounting application, payment platform, ORM, or generic framework**.

It is an open-source technical foundation for defining how common financial behavior should work.

FinKore turns recurring financial rules into:

- explicit specifications;
- language-independent conformance tests;
- reusable implementations.

So engineering teams do not have to rediscover the same financial foundations every time they build a new product, service, or platform.

Your product remains yours.

Your workflows remain yours.

Your business rules remain yours.

FinKore provides the layer beneath them: inspectable and testable behavior for money, workflows, approvals, audit history, and financial entities.

---

## The problem FinKore exists to solve

CRUD is easy.

Financial CRUD is not.

A monetary amount looks like a number until currency, precision, allocation, and rounding begin to matter.

An approval looks like a status until the facts that justified it change.

An audit trail looks like a list until someone needs to reconstruct exactly what happened.

These rules usually begin as small pieces of application code.

Then the product grows.

Exceptions accumulate.

Historical assumptions spread across services, tests, documentation, and developer knowledge.

Eventually, a harmless-looking change can alter financially significant behavior without anyone noticing until a customer, finance team, or auditor does.

FinKore gives those rules a deliberate home before they become hidden system behavior.

---

## The idea is simple

Your application may be unique.

The foundational financial problems beneath it usually are not.

FinKore separates the rules that make your product distinctive from the
foundational behavior that should not be reinvented each time.

| Your application decides | FinKore makes explicit |
| --- | --- |
| Which business policies, thresholds, and permissions apply | How declared financial rules behave and fail |
| Which workflows and approval requirements the product needs | How state, decisions, and history remain valid and traceable |
| How data is stored, presented, and integrated | Which outcomes must remain consistent across implementations |

You keep control of the product. FinKore gives its financially significant
behavior a shared, testable foundation.

---

## One rule, one meaning

The value becomes clearer at the boundaries where ordinary application logic
often becomes ambiguous.

### Allocation without a missing cent

Splitting `10.00 USD` equally into three parts cannot produce three identical
amounts at a scale of two. FinKore makes the remainder rule deterministic:

```text
10.00 USD ÷ 3
→ [3.34 USD, 3.33 USD, 3.33 USD]
```

The result order is declared, every part keeps the source currency, and the
exact sum remains `10.00 USD`.

### An approval belongs to the facts that were approved

A manager approves an invoice for `9,000 EUR`. The invoice is later changed to
`90,000 EUR`, and amount is relevant to that approval requirement.

```text
Approval for 9,000 EUR + current amount of 90,000 EUR
→ previous decision remains in history
→ previous decision does not satisfy the current requirement
```

The history is preserved, but the old decision is not silently reused for
materially different facts.

### A terminal state is actually terminal

If a workflow explicitly declares `APPROVED` as terminal, a later request to
transition that instance back to `DRAFT` must fail.

```text
APPROVED → DRAFT
→ FINKORE_WORKFLOW_TERMINAL_STATE
→ current state remains APPROVED
```

The failure is explicit, portable, and non-mutating. A state name alone is not
enough: terminal behavior must be declared by the workflow definition.

### History keeps the uncomfortable parts

Suppose a committed audit event records a rejected decision and a later event
records an approval. The later outcome does not permit the earlier event to be
edited or deleted.

```text
[rejected event] + [later approved event]
→ both remain in committed history
```

FinKore treats that history as evidence, not as a mutable summary of the latest
result.

These are financial domain decisions.

They should not be accidental side effects of a framework or whichever service implemented them first.

FinKore specifies each outcome, provides portable tests for it, and verifies
that every implementation preserves the same meaning.

These scenarios are only a small illustration of FinKore Core 0.9.5.

Across Money, Workflow, Audit, Approvals, Financial Entities, and shared
conventions, the 0.9.5 snapshot's 667-vector suite maps vectors to 330 requirements.
Every vector passed on TypeScript, Python 3.12/3.13, and Java, with zero failed,
unsupported, or infrastructure outcomes. Native tests and mutation probes also
protect lifecycle sequences, Entity history reuse, Workflow ownership, and
Audit JSON preservation. Complete clean-checkout verification covers builds,
coverage, mutation protection, and isolated package consumers.

Passing this finite manifest does not establish exhaustive boundary coverage
or complete the separate Core 1.0 promotion process. See
[current traceability](./conformance/traceability.md) and the
[Core 0.9.5 plan](./docs/plans/plan-09.5.md).

---

## What teams gain

### Less repeated domain work

Start from shared financial rules instead of redesigning foundational behavior for every product or service.

### Safer change

Conformance vectors and mutation-sensitive tests make important invariants visible and help plausible defects fail early.

### Consistent meaning across systems

TypeScript, Python, and Java can expose idiomatic APIs while producing the same observable financial outcomes.

### Decisions that can be explained

Stable requirements and portable errors connect behavior directly to the rule that requires it.

### Control without lock-in

FinKore is open, language-independent at the specification level, and does not impose a hosted platform, application architecture, or proprietary data model.

The goal is not to pretend financial domains are simple.

The goal is to make their foundational rules explicit, testable, and explainable.

---

## How FinKore works

FinKore separates financial meaning from implementation technology:

```text
Financial rule
      ↓
Specification with stable requirements
      ↓
Language-independent conformance vectors
      ↓
Idiomatic TypeScript, Python, and Java implementations
```

The [specification](./spec/README.md) is the source of truth.

Implementations may feel natural in their language, but no package independently defines what FinKore means.

A domain-neutral [Conformance Runner](./runner/README.md) checks each implementation against the same observable outcomes.

This makes financial behavior portable across languages and more resilient to changes in frameworks, services, and architecture.

---

## What FinKore Core covers

The current Core 0.9.5 release-candidate snapshot defines:

| Domain | What becomes explicit |
| --- | --- |
| Money | Exact decimal values, currency compatibility, arithmetic, comparison, rates, allocation, rounding, and serialization |
| Workflow | States, allowed transitions, guards, terminal behavior, version binding, and conflict preconditions |
| Audit | Actors, events, changes, append-only history, relationships, redaction evidence, and portable failures |
| Approvals | Requirements, conditions, decisions, validity, lifecycle history, chains, and bounded composition |
| Financial Entities | Identity, lifecycle, mutability, validation, revisions, imports, and evidence-backed evolution |

These domains are building blocks.

Your application still decides:

- which approval policy applies;
- what an invoice means;
- who may perform an action;
- how data is stored;
- how its unique business processes work.

FinKore provides the foundation underneath those decisions.

---

## Not another framework

FinKore does **not** want to own your application.

It does not provide:

- a hosted platform;
- a proprietary data model;
- an application shell;
- an ERP;
- an accounting UI;
- a payment processor;
- a persistence layer;
- a generic workflow product.

It also does not replace financial or regulatory domain expertise.

Instead, FinKore focuses on a smaller but critical layer:

> **the rules that should remain correct regardless of language, framework, service boundary, or application architecture.**

---

## Built for multiple languages

FinKore separates specification from implementation.

That means the same financial rule can be expressed through idiomatic APIs in different languages while preserving the same observable behavior.

Current reference implementations include:

- TypeScript
- Python
- Java

The implementation language can change.

The rule should not.

---

## Machine-understandable financial behavior

FinKore also publishes an [Agentic Contract](./agentic/README.md) describing canonical operations, effects, constraints, and portable errors in a machine-understandable form.

Agents and integrations follow the same financial rules as every other client.

There is no bypass mode.

---

## Who FinKore is for

FinKore is designed for technical leaders and engineers responsible for software that handles:

- money;
- invoices;
- expenses;
- approvals;
- auditability;
- financial entities;
- financial workflows.

It becomes particularly useful when:

- the same calculation behaves differently in two parts of a product;
- a team is rebuilding rules it has already implemented elsewhere;
- an approval or historical decision must be reproducible;
- important behavior depends on knowledge held by a few developers;
- a refactor must preserve rules accumulated over years;
- multiple languages or services need to agree on the same outcomes.

FinKore sits beneath product-specific logic.

---

## Evaluate FinKore

You do not need to adopt the entire project to evaluate the ideas behind it.

Start with the part that matches your question:

- **Understand the principles:** read the [FinKore CoreDoc](./docs/coreDoc/core-doc.md).
- **Review precise behavior:** explore the [FinKore Specification](./spec/README.md).
- **Inspect executable examples:** browse the [conformance vectors](./conformance/README.md).
- **Explore an implementation:** see the [TypeScript](./implementations/typescript/core/README.md), [Python](./implementations/python/core/README.md), or [Java](./implementations/java/core/README.md) reference implementation.
- **Check coverage and known gaps:** review [Conformance Traceability](./conformance/traceability.md).

To run the complete release verification from a clean checkout:

```bash
npm ci
npm run verify
```

The verification suite builds all implementations, runs unit and conformance tests, checks coverage and architecture boundaries, builds local consumer artifacts, and exercises mutation-sensitive financial behavior.

It can bootstrap the required Python, Java, and Maven toolchains locally.

Node `>=24.11.0 <25` is required.

See [Developer Tools](./docs/tools/README.md) for details.

---

## Project status

FinKore Core 0.9.5 is the corrective release candidate for the frozen Core 0.9
baseline intended to become Core 1.0.

All 667 manifest vectors pass on TypeScript, CPython 3.12/3.13, and Java,
including all earlier corrective regressions.
The completed [Core 0.9.5 corrective plan](./docs/plans/plan-09.5.md) closes the
reviewed exact serialization, Workflow binding and precondition, Approval
association, Audit ownership, and Entity integration boundaries. Native public
API and operation-sequence tests supplement portable vectors; full mutation
suites and isolated package consumers pass clean-checkout verification.
[Traceability](./conformance/traceability.md) records the exercised scope and
coverage limits. [Core 1.0 promotion](./docs/plans/plan-10.md) remains a separate,
uncompleted process.

A subsequent readiness review found additional native construction, Approval
evaluation/evidence, Audit authority, and Workflow/Entity validation gaps.
The [Core 0.9.6 corrective plan](./docs/plans/plan-09.6.md) records the Milestone 1
contract decisions and Milestone 2 permanent regressions. All 667 original
vectors still pass across the four runtimes; the expanded 844-vector suite
exposes the defects and remains red. Implementation corrections are unstarted.
Core 1.0 promotion is blocked pending those corrections and fresh review;
`core-0.9.5` remains the latest completed corrective snapshot.

- Money
- Workflow
- Audit
- Approvals
- Financial Entities

The project is still pre-1.0.

Production use is not yet recommended, and the reference packages are not published to npm, PyPI, or Maven Central.

Current limitations include areas such as:

- authorization;
- persistence;
- dynamic approver resolution;
- unrestricted approval graphs;
- distributed audit ordering;
- concrete accounting domains such as ledgers, tax, reconciliation, and FX policy.

The release identifiers serve different purposes:

| Identifier | Current value | Meaning |
| --- | --- | --- |
| Corrective snapshot tag | `core-0.9.5` | Exact repository state containing the corrections. |
| Core constants, package compatibility metadata, and runner Core label | `0.9-rc` | Frozen language-neutral behavioral baseline. |
| Implementation package versions | `0.1.0` | Unpublished repository reference artifacts. |
| Conformance syntax version | `0.1` | Manifest and vector format compatibility. |

The corrective release fixes implementation defects and clarifies demonstrated
Entity declaration ownership, validator rejection, and the bounded
revision/conflict identity contract. These release-candidate corrections preserve
existing identifiers and do not declare Core 1.0 stable. The release tag is local;
remote publication is
separate, and the packages retain repository-reference status.

See the [release notes](./docs/releases/README.md) for the concise history and the implementation READMEs for current public APIs and local package use.

---

## Documentation

- [Specification conventions](./spec/conventions.md) — normative language, compatibility, identifiers, portable values, and errors.
- [Language-neutral implementation guide](./docs/implementation-guide.md) — implementation order, boundaries, value semantics, and gap handling.
- [Conformance adapter onboarding](./docs/conformance-adapter-onboarding.md) — adapter integration, normalization, reporting, and verification.
- [Licensing](./LICENSING.md) — community licensing, third-party notices, and commercial-use guidance.

---

## Contributing

FinKore is developed in the open.

Contributions can begin with:

- a real financial use case;
- an edge case;
- a specification proposal;
- a conformance vector;
- an implementation;
- clearer documentation.

Start with the behavior that needs to be portable:

> An approval should no longer be assumed valid after the amount used to determine the requirement changes.

That gives the rule a chance to become explicit before it becomes an API.

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [Contributor Licensing](./docs/governance/contributor-licensing.md).

---

## License

FinKore is licensed under the Mozilla Public License 2.0 (`MPL-2.0`) and may be used in commercial and proprietary systems subject to the license terms.

See [LICENSE](./LICENSE) and [LICENSING.md](./LICENSING.md).

The license text controls.
