# Where to start

FinKore makes recurring financial behavior explicit so you can understand a rule,
implement it in your own stack, and evaluate the result against a shared
contract. Start with the financial question your product needs to answer.

You can begin with one domain. You do not need to adopt every part of FinKore at
once.

## Understand what you are adopting

FinKore publishes a specification, portable acceptance cases, and an Agentic
Contract for machine clients. Your team owns the implementation and its
integration into your product.

The repository provides the contract and tools that validate its published
artifacts. Financial implementations and execution of acceptance cases belong
to consumers. There is no financial package to install or hosted service to
connect to here.

For more context, read [About the project](../README.md).

## Choose your starting point

| Your goal | Start here |
| --- | --- |
| Understand the reasons behind the financial rules | [CoreDoc](coreDoc/core-doc.md) |
| Build a FinKore implementation in your own codebase | [Implementation guide](implementation-guide.md) |
| Integrate an agent or another machine client | [Agentic Contract](../agentic/README.md) |
| Propose a correction or contribute to the project | [Contributing](../CONTRIBUTING.md) |
| Understand the terms for adopting repository materials | [Licensing](../LICENSING.md) |

## Follow the contract from principle to evidence

Read the [CoreDoc](coreDoc/core-doc.md) first. Its principles explain why
monetary integrity, controlled state, preserved history, approvals, and identity
need explicit obligations.

The [domain specifications](../spec/README.md) turn those obligations into precise
requirements, invariants, and portable errors. They are authoritative for
financial behavior.

The [conformance artifacts](../conformance/README.md) connect requirements to
portable inputs and expected observations. They help you evaluate your own
implementation; publishing a case does not mean it has been executed or prove
that an implementation conforms.

The [Agentic Contract](../agentic/README.md) describes canonical operation
semantics for machine clients. Your integration provides execution and
authorization infrastructure while preserving the specification's behavior.

## Pick one domain that matches your problem

| Domain | A useful starting question |
| --- | --- |
| Money | How should monetary values retain their currency and exact amount through calculation? |
| Workflow | Which lifecycle changes are permitted, and what must remain unchanged after rejection? |
| Audit | What evidence must be preserved to explain an action and its history? |
| Approvals | What was approved, for which subject, and does the decision still apply? |
| Financial Entities | How does a financial subject retain its identity through validation and permitted change? |

Use the [specification index](../spec/README.md) to find the selected domain.
For example, if you need monetary values, begin with Money's representation and
arithmetic requirements before adding rounding or allocation to your scope.
Your product decides its language, API, storage, and business policies.

## Build your first slice

1. Read the selected domain's requirements alongside CoreDoc. Use the
   [conventions](../spec/conventions.md) and [glossary](../spec/glossary.md) to
   understand normative language and terminology.
2. Identify the requirements, portable errors, and observable results you will
   support. Keep that scope explicit.
3. Find related acceptance cases through the
   [conformance manifest](../conformance/manifest.json) and
   [requirement traceability](../conformance/traceability.md).
4. Implement the behavior in your own codebase. Follow the
   [implementation guide](implementation-guide.md) for exact values, deterministic
   context, and preservation of state when an operation fails.
5. Use your own tooling to invoke the implementation, observe the result, and
   compare it with the expected observations. The
   [consumer guide](../conformance/consumer-guide.md) explains the responsibilities
   and limits of that evaluation.
6. Add tests for your integration and plausible defects. Document your supported
   scope and evidence before expanding to another slice.

A useful first milestone is a small, documented scope with traceable
requirements, reproducible observations, and coverage of success and failure
cases. Acceptance cases provide bounded evidence; add your own checks for the
product boundaries you introduce.

## When a rule is unclear

Do not infer financial behavior from a fixture, a language default, or a past
implementation. Describe the observable result that is undefined, the artifacts
you reviewed, plausible interpretations, and their financial or control impact.
Follow [Contributing](../CONTRIBUTING.md) to raise the gap for
specification-first review.

## Continue reading

Start with the [CoreDoc](coreDoc/core-doc.md) to understand the foundations, then
use the [implementation guide](implementation-guide.md) to work through your
first domain slice. Consult [release notes](releases/README.md) when reviewing
published changes and migration context.
