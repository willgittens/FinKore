# FinKore Conformance Artifacts

> FinKore cases are designed not only to demonstrate correct behavior, but to
> make plausible financial defects fail.

This directory publishes language-independent acceptance artifacts for FinKore
Core 0.9 release candidate. The specification remains the source of truth.
Vectors describe observable inputs, results, portable errors, and post-state;
they do not prescribe APIs, classes, exceptions, storage, frameworks, or an
execution protocol.

The repository does not contain a financial implementation, Conformance Runner,
or adapter API. Its local checks validate the artifacts themselves. Consumers
own implementation bindings, execution, normalized observation, comparison,
and reporting.

## Published artifacts

- [`manifest.json`](manifest.json) — the only vector discovery entry point.
- [`vector.schema.json`](vector.schema.json) — vector-file syntax.
- Domain vector directories — manifest-listed portable acceptance cases.
- [`conventions.md`](conventions.md) — fixture interpretation, exact comparison,
  operation labels, and consumer-owned evaluation obligations.
- [`operations.md`](operations.md) — current request, result, omission/null,
  error, and post-state contract for all manifest operation labels.
- [`traceability.md`](traceability.md) — requirement coverage, known limits,
  mutation intent, and coverage limitations.
- [`consumer-guide.md`](consumer-guide.md) — discovery, execution outcomes,
  reporting, and claim guidance.

The current manifest contains 1,790 vectors. Repository verification checks
their schemas, identifiers, declared portable error references, paired controls,
requirement references, specification topics, operation catalog, and Agentic
alignment. Supplementary historical controls are checked as a separate metadata
namespace but are not manifest-discovered vectors. These checks do not execute
financial behavior and do not establish that any implementation passes the
vectors.

Traceability currently records 436 requirements: 356 with portable vector
coverage, one partial external-fact authoring requirement, and 79 not directly
testable by portable vectors. Coverage means an acceptance case exists; it is
not a current execution result and is not proof of exhaustive correctness.

## Scope and discovery

A consumer-owned tool must load only files listed by `manifest.json`, resolve
paths relative to the manifest, reject unsupported syntax versions, and reject
duplicate vector IDs. Filesystem traversal order carries no meaning.

`finkoreConformance` and `finkoreVectorFile` version the artifact formats, not
the FinKore Core release. Release scope is identified by the manifest contents,
referenced requirement IDs, traceability status, and the release record.

The suites cover:

- Money representation, serialization, arithmetic, comparison, currency,
  rounding, Rates, and Allocation;
- Workflow states, transitions, guards, terminal states, definition binding,
  import, conflicts, and failure atomicity;
- Audit events, actors, changes, append-only history, redaction, relationships,
  and ordering evidence;
- Approval requirements, decisions, validity, conditions, chains, facts, and
  bounded composition;
- Entity identity, lifecycle, mutability, validation, evolution, import,
  revisions, and conflict preconditions.

## Vector model

Every vector has a stable ID, specification topic, requirement references,
description, operation label, logical input, expected normalized observation,
and one or more test-design tags. Optional context supplies explicit facts such
as an evaluation timestamp or policy.

An expected result is either `success` with a value or `error` with a portable
error code. Either may include requested post-operation observations. Human
error messages are never compared. JSON object member order is irrelevant;
array order is significant unless the owning operation says otherwise.

Canonical operation identifiers beginning with `finkore.` align with the
[Agentic Contract](../agentic/operations.md). Other operation labels are
conformance-local boundaries. Vector use alone does not promote them to public
FinKore capabilities.

## Consumer-owned evaluation

A faithful consumer tool performs this domain-neutral flow:

```text
load and validate published artifacts
        ↓
map the operation label to consumer implementation behavior
        ↓
construct exact values from logical input and explicit context
        ↓
execute the operation once in isolation
        ↓
normalize only the requested observable result and post-state
        ↓
compare exactly with the expected observation
```

Financial rules stay in the consumer implementation. The binding translates
between fixture syntax and an idiomatic API. The evaluation tool must not add
currency rules, rounding, workflow permissions, approval semantics, Entity
currentness, error priority, or any other domain behavior.

Evaluations must distinguish omission from explicit null, avoid floating-point
tolerances for Money, preserve significant array order, verify every requested
post-state observation, and fail unexpected successes or errors. Vectors must
be isolated so no case depends on another.

See [Conformance Conventions](conventions.md) for the detailed portable contract.

## Claim model

A conformance claim concerns observable behavior against an identified Core
release and manifest. It says nothing by itself about production API shape,
storage design, framework integration, package maturity, mutation score, or
Agentic capability advertising.

A complete Core claim must identify:

- the FinKore Core release;
- the manifest identity and `finkoreConformance` format version;
- all suites included;
- the implementation under test;
- the consumer-owned evaluation tool and binding;
- filters, if any, and full result counts.

A complete claim passes every applicable manifest-listed vector. `UNSUPPORTED`
is not passing. A domain-scoped claim may cover only named domain suites, but it
must pass every applicable vector in those suites and must not be described as
complete Core conformance. A selected-vector or selected-tag run is a useful
development report only when its filters are disclosed.

Artifact validation alone is not a conformance claim. Advertising an Agentic
operation is not a conformance claim.

## Test design and determinism

New portable behavior should receive positive, negative, boundary, invariant,
and mutation-sensitive cases as applicable. Paired controls are preferred when
a plausible defect could otherwise produce the expected result accidentally.

Portable cases must not depend on wall-clock time, host timezone, locale,
network services, filesystem order, database incidental order, process identity,
or uncontrolled randomness. Explicit context is part of the vector input.

Money comparisons are exact. Evaluation tooling must not use epsilon comparison,
silently normalize decimal strings, infer currency compatibility, or apply an
unstated rounding rule.

## Regression and mutation intent

A confirmed defect should be reproduced by a specification-derived portable
case when the boundary is representable, and the case should remain as a
regression. If JSON cannot represent the relevant language-native boundary,
consumers should retain equivalent native evidence without turning it into a
new portable rule.

The `guardsAgainst` field records plausible defects such as removed currency
checks, changed arithmetic or rounding modes, guard bypass, mutated audit
history, invalid approval reuse, partial state after failure, Entity identity
changes, and portable error substitution. It describes test intent, not an
implementation technique or repository-maintained mutation gate.

Consumer implementations should use mutation testing or an equivalent
defect-resistance method appropriate to their language. Such results are
consumer evidence, not results produced by this repository.

## Contract status

The Core label remains `0.9-rc`; conformance syntax remains `0.1`. Stable 1.0
promotion is not complete. See [release notes](../docs/releases/README.md) for
concise release history.

## Repository validation

From a clean checkout with Node `>=24.11.0 <25`:

```bash
npm ci --no-audit
npm run conformance:check
npm run traceability:check
npm run agentic:check
```

Use `npm run verify` for the complete repository-maintenance suite. These
commands validate published artifacts and their relationships; they do not run
an implementation or query a vulnerability advisory service. Use
`npm run dependencies:audit` separately for a fresh network-backed review of
the locked maintenance dependency graph.
