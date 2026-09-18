# Agentic Contract Conventions

The normative-language and portable-value conventions in the
[FinKore Specification](../spec/conventions.md) apply here. The Agentic Contract
adds operational metadata; it does not add or alter financial rules.

## FinKore Operation

A **FinKore Operation** is a stable, language-independent identifier for an
observable domain capability. Its identifier has the form:

```text
finkore.<domain>.<operation>
```

Examples are `finkore.money.add` and `finkore.workflow.transition`.

An operation ID:

- MUST be globally unique within FinKore;
- MUST NOT be reused for a different operation contract;
- MUST remain independent of TypeScript methods, Java classes, package names,
  framework routes, HTTP URLs, and tool-provider naming;
- MUST map to one clear semantic operation;
- SHOULD remain stable across language implementations and API refactors; and
- SHOULD be reusable by conformance vectors, runner adapters, discovery data,
  future tool adapters, and reference implementations.

Versions are not encoded in operation IDs. Operation identifiers are intended
to remain stable. Compatibility rules for canonical operation identifiers are
defined in the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy);
incompatible operation-contract changes require a new identifier or documented
supersession path.

## Operation IDs and requirement IDs

These identifiers serve different purposes. An operation ID names a capability;
a requirement ID anchors a normative rule. For example,
`finkore.money.add` is governed by multiple `MONEY-*` requirements. One
requirement may govern several operations, and one operation may reference many
requirements. The two identifier systems MUST NOT be collapsed.

## Descriptor semantics

A descriptor minimally communicates:

- stable operation ID, domain, and summary;
- governing specification requirements;
- language-independent input and output semantics;
- normatively associated portable errors where practical;
- effects, preconditions, and observable postconditions; and
- whether any listed error set is exhaustive.

This illustrative JSON is non-normative:

```json
{
  "id": "finkore.money.add",
  "domain": "money",
  "summary": "Adds two compatible Money values.",
  "requirements": [
    "MONEY-ARITHMETIC-001",
    "MONEY-ARITHMETIC-002",
    "MONEY-ARITHMETIC-007",
    "MONEY-ARITHMETIC-009"
  ]
}
```

The semantic fields are the contract; this object shape is not a normative
serialization.

## Representation layers

- A **domain representation** has the meaning assigned by `/spec`.
- An **Agentic Contract representation** explains inputs and outputs to a
  machine client and reuses a normative domain serialization when one exists.
- A **runner normalization representation** belongs to conformance
  infrastructure and may contain test-only fixtures or observations.

These layers MUST NOT be treated as interchangeable merely because examples look
similar. In particular, Money operation metadata reuses the normative
[Money serialization](../spec/money/serialization.md); production APIs are not
required to return the conformance runner's normalized envelope.
