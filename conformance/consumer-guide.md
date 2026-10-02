# Consuming FinKore Conformance Vectors

## Purpose

FinKore publishes language-independent acceptance cases. It does not publish a
runner API, implementation adapter contract, or financial evaluation engine.
Consumers own the code that invokes their implementation, normalizes observable
results, and compares those results with the vectors.

The specification remains authoritative. A vector makes an expected observation
concrete and links it to normative requirements; it does not create behavior
that is absent from `/spec`.

## Discovery and validation

Use [manifest.json](manifest.json) as the only discovery entry point for the
portable suite:

1. Require the supported `finkoreConformance` format version.
2. Resolve `vectorSchema` and every `vectorFiles` entry relative to the
   manifest directory. Reject paths that resolve outside that directory.
3. Load suites and files in manifest order. Filesystem enumeration is not a
   discovery mechanism.
4. Validate every listed vector file against the declared
   [JSON Schema](vector.schema.json).
5. Reject duplicate suite IDs, duplicate paths within a suite, and duplicate
   vector IDs across the complete manifest.

Format `0.1` is closed by the published schema: unknown members at the file,
vector, expected-result, or error level are validation failures. Consumers must
not treat them as private extensions. Metadata explicitly named by the schema is
optional but is not semantically extensible; a future syntax extension requires
schema publication and format-version compatibility assessment.

The repository command `npm run conformance:check` performs these schema and
discovery checks plus global vector-ID uniqueness, declared portable-error
validation, and manifest/supplementary paired-control reference validation. It
does not invoke financial operations. The supplementary namespace is read only
for metadata integrity and is not added to manifest discovery or vector counts.

The separate `boundary097-cases.json` file is retained historical review data.
It is not manifest-listed, does not use the published vector-file schema, and is
not part of a portable conformance claim unless a consumer deliberately adopts
and documents an additional evaluation contract for it.

## Vector request

Each manifest-listed vector declares:

- `operation`: the language-neutral behavior to invoke;
- `input`: the complete logical operands or fixture;
- `context`: optional explicit facts such as evaluation time or policy;
- `requirements`: the normative requirement IDs exercised by the case;
- `spec`: the governing specification topic;
- `description`, `tags`, and optional review metadata explaining test intent.

Canonical `finkore.*` operations are defined by the
[Agentic operation registry](../agentic/operations.md). Other operation labels
are conformance-local fixture boundaries documented in
[Conformance Vector Conventions](conventions.md) and the current
[operation contracts](operations.md); their presence does not promote them to
public Agentic capabilities.

Consumers may map these logical requests to any idiomatic API. That mapping must
not add financial rules, repair invalid input, infer missing policy, or replace a
portable error with implementation-specific behavior.

## Expected observation

`expected` has exactly one of these forms:

```json
{
  "status": "success",
  "value": {},
  "observations": {}
}
```

```json
{
  "status": "error",
  "error": { "code": "FINKORE_DOMAIN_CATEGORY" },
  "observations": {}
}
```

`observations` is optional. When present, it records required post-operation
state such as failure atomicity or unchanged input. An error comparison uses the
portable code, not a language exception name, message, stack trace, HTTP status,
or transport error.

Normalize implementation results before comparison, then compare the complete
expected envelope using the rules in [conventions.md](conventions.md). Object
member order is insignificant; array order is significant unless the governing
operation states otherwise. Money and other domain values are not specially
reinterpreted by the comparison layer.

Money bindings apply the presentation-only observation rule before comparison:
unscaled results use canonical plain-decimal spelling, while explicit target
scales remain exact. This normalization is derived from the actual result and
operation input, never from `expected`; see the
[Money operation contract](operations.md#money-operations).

## Execution outcomes

A consumer-owned tool should distinguish at least:

- `PASS`: the normalized observation equals `expected`;
- `FAIL`: the operation executed but produced a different portable observation;
- `UNSUPPORTED`: the implementation does not expose the operation;
- `INFRASTRUCTURE_ERROR`: the operation could not be faithfully invoked or
  normalized because of tool, transport, process, or implementation failure.

`UNSUPPORTED` and `INFRASTRUCTURE_ERROR` are not passing results. Unexpected
exceptions are infrastructure failures, not substitutes for expected portable
errors. Each case must run with isolated deterministic state; explicit vector
context replaces wall clocks, locale, network data, and uncontrolled randomness.

## Requirement mapping

Every vector lists one or more stable requirement IDs. The
[traceability index](traceability.md) cross-checks those declarations against
the specification and records whether a requirement has portable vector
coverage, partial coverage, or no directly testable portable observation.

`COVERED` means one or more published vectors exercise the requirement. It does
not mean that this repository executed those vectors, that an implementation
passed them, or that finite cases exhaust the requirement. Requirements marked
`PARTIAL` or `NOT DIRECTLY TESTABLE` retain their written limitation and require
additional consumer-owned evidence where applicable.

## Making a conformance claim

A claim requires actual execution against a named implementation. Record:

- the FinKore release or commit and manifest identity;
- the `finkoreConformance` format version;
- the implementation and consumer-owned evaluation tool;
- every included suite and any filters;
- PASS, FAIL, UNSUPPORTED, and INFRASTRUCTURE_ERROR totals;
- individual vector IDs and normalized outcomes sufficient to reproduce
  failures.

Schema validation proves only that the published artifacts are structurally
consistent. It must never be reported as executed financial conformance.
