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

## Walk through one rounding case

The [README example](../README.md#concrete-example-rounding-a-monetary-amount)
starts with `10.005 EUR` rounded to scale 2. Follow that same amount from its
financial obligation to a published expected observation. This walkthrough
illustrates the existing contract; it adds no rounding policy to your product.

### 1. Read the obligation and requirements

[CORE-001.2](coreDoc/core-doc.md#core-0012-exact-calculation-and-explicit-rounding)
requires exact calculation and a declared rule when reducing precision. A
currency's customary minor-unit scale is not itself a rounding instruction.

In [Money Rounding](../spec/money/rounding.md#requirements),
`MONEY-ROUNDING-001` requires an explicit target scale and mode.
`MONEY-ROUNDING-003` defines the supported modes. At a tie, `HALF_UP` selects the
nearest candidate farther from zero; `HALF_EVEN` selects the nearest candidate
whose last retained digit is even. For `10.005 EUR` at scale 2, those rules give
different results.

### 2. Discover the existing cases

Open [conformance/manifest.json](../conformance/manifest.json), find the suite
whose `id` is `money`, and follow its `vectorFiles` entry
`./money/rounding.json`, resolved relative to the manifest directory. In that
declared file, locate these stable IDs:

| Vector ID | Mode | Expected amount | Currency |
| --- | --- | --- | --- |
| `money.round.half-up.tie-positive-001` | `HALF_UP` | `10.01` | `EUR` |
| `money.round.half-even.tie-even-down-001` | `HALF_EVEN` | `10.00` | `EUR` |

Both cases supply `10.005 EUR` and `scale: 2`. Discover files only through the
manifest; do not enumerate the Money directory. The
[traceability index](../conformance/traceability.md) connects requirements to
their published cases and coverage limits.

### 3. Read the request and complete expected observation

This excerpt copies the relevant fields of
`money.round.half-up.tie-positive-001` from the manifest-listed file:

```json
{
  "id": "money.round.half-up.tie-positive-001",
  "requirements": [
    "MONEY-ROUNDING-002",
    "MONEY-ROUNDING-003",
    "MONEY-ROUNDING-008"
  ],
  "operation": "finkore.money.round",
  "input": {
    "value": {
      "amount": "10.005",
      "currency": "EUR"
    },
    "scale": 2,
    "mode": "HALF_UP"
  },
  "expected": {
    "status": "success",
    "value": {
      "amount": "10.01",
      "currency": "EUR"
    },
    "observations": {
      "operand": {
        "amount": "10.005",
        "currency": "EUR"
      }
    }
  }
}
```

| Field | What to look for |
| --- | --- |
| `id` | The stable case identity used to report an evaluation. |
| `requirements` | This case exercises determinism (`MONEY-ROUNDING-002`), portable mode semantics (`MONEY-ROUNDING-003`), and currency preservation (`MONEY-ROUNDING-008`). The explicit request is also governed by `MONEY-ROUNDING-001`; that ID is not listed by this particular case. |
| `operation` | The canonical behavior to map to your own API: `finkore.money.round`. |
| `input` | The exact decimal amount, currency, explicit target scale, and mode to supply. |
| `expected.value` | The resulting amount and currency, with exactly two fractional digits for this explicit scale. |
| `expected.observations.operand` | The unchanged source Money to observe after the operation. |

The complete vector also includes `spec`, a description, tags, and defect intent.
The [operation contract](../conformance/operations.md#money-operations) and
[Agentic descriptor](../agentic/operations.md#finkoremoneyround) explain the
portable boundary; the fixture shape does not prescribe your production API.

### 4. Compare your implementation's observations

In your own environment, map the operation to your implementation and supply
the case's `input`. Preserve exact decimal semantics when parsing `"10.005"`;
do not convert it to approximate binary floating point or infer a policy from
`EUR`.

Normalize the actual result according to the
[consumer guide](../conformance/consumer-guide.md#expected-observation), then
compare the whole observation with `expected`: success status, `10.01 EUR` at
scale 2, and the unchanged `10.005 EUR` operand. Derive the observation from the
actual result and retained source, independently of `expected`.

Repeat with `money.round.half-even.tie-even-down-001`, which supplies
`HALF_EVEN` and expects `10.00 EUR` with the same unchanged operand. These two
cases expose substitution of one tie-breaking mode for the other. Compare exact
decimals and the required presentation scale; an approximate tolerance is not a
Money comparison rule.

FinKore publishes these expectations. Your team supplies the implementation,
invocation, observation, comparison, and reporting tools. Reading the example
or running repository artifact checks does not execute either case. Two cases
also do not establish conformance to all Money requirements: continue with the
[implementation workflow](implementation-guide.md#recommended-workflow) to
define your scope, select the related success and failure cases, and collect
your own execution evidence.

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
