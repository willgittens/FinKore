# FinKore Conformance Artifacts

This directory contains portable acceptance cases for **FinKore Core 2.0.2 stable**.
Each case, called a **vector**, describes an input and the expected observable
result: a value or portable error, plus post-operation state where required.
Cases include boundaries and plausible defects as well as successful operations.

Use these cases to evaluate your own implementation. You supply the invocation,
result normalization, comparison, and reporting. Repository checks validate the
published artifacts; financial conformance requires execution against an
implementation. The specification remains authoritative for behavior.

## Start here

Read the [consumer guide](consumer-guide.md) for discovery and evaluation, then
the [operation contracts](operations.md) for the operations you need.
[Conventions](conventions.md) explains fixture details and exact comparison.
Use [traceability](traceability.md) to find cases for a requirement and understand
where additional consumer evidence is needed.

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

Traceability currently records 447 requirements: 363 covered by portable
vectors, five partially covered, and 79 not directly testable by portable
vectors. Coverage means an acceptance case exists; it is not a current execution
result and is not proof of exhaustive correctness.

## Scope and discovery

A consumer-owned tool must load only files listed by `manifest.json`, resolve
paths relative to the manifest, reject unsupported syntax versions, and reject
duplicate vector IDs. Filesystem traversal order carries no meaning.

[`manifest.json`](manifest.json) is the sole discovery entry point for the
Core 2.0.2 baseline: six suites, 47 vector files, and 1,822 vectors.
Core association is documented here because the manifest syntax has no
Core-version field. Use the `core-2.0.2` tag for this published manifest.
`finkoreConformance` and `finkoreVectorFile` remain `0.1` and version the artifact
formats, not the FinKore Core release. A claim identifies the exact release or
commit and manifest as well as the format version. Referenced requirement IDs
and [traceability](traceability.md) describe the covered scope and its limits.

For retained data from an earlier Core release, follow the
[Core 2.0 migration guidance](consumer-guide.md#core-20-migration).

The suites cover:

- shared portable timestamp syntax, precision, offset equality, and ordering;
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

A complete Core claim passes every applicable manifest-listed vector against a
named implementation. A domain-scoped claim covers named suites and passes all
applicable vectors in them; it must not be described as complete Core conformance.
Report the exact Core release, manifest, format version, implementation,
evaluation tooling and binding, included suites, filters, and full result counts.

Declare optional choices and justified recommendation exceptions before case
selection. Excluded cases and their reasons remain visible; `UNSUPPORTED` is not
passing. Follow the consumer guide's [case applicability](consumer-guide.md#case-applicability)
and [claim guidance](consumer-guide.md#making-a-conformance-claim) for the full
reporting obligations. A filtered development run, artifact validation, or
Agentic capability advertisement does not establish complete Core conformance.

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

## Repository validation

From a clean checkout with Node `>=24.11.0 <25`:

```bash
npm ci --no-audit
npm run conformance:check
npm run traceability:check
npm run agentic:check
```

Use `npm run verify` for the complete repository-maintenance suite. These
commands validate published artifacts and their relationships locally. See
[Developer Tools](../docs/tools/README.md) for validation details and the separate
dependency review, and [release notes](../docs/releases/README.md) for published
history.
