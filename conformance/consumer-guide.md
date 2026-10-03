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
FinKore Core 1.0 portable suite. Its association with Core 1.0 is documented in
the [conformance index](README.md#scope-and-discovery); the manifest and
vector-file format versions remain `0.1`.

For artifact validation:

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
validation, and paired-control reference validation against manifest-listed
vectors. A `pairedControl` must identify a vector discovered through the same
manifest; files outside that discovery do not supply controls. These checks do
not invoke financial operations.

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

## Case applicability

Applicability follows the owning requirement's normative modality; it is not a
runtime outcome. Before selecting cases, a claim must declare each implemented
optional choice and each justified exception to a `SHOULD` or `SHOULD NOT`,
including the affected requirement, rationale, and implementation scope. A case
excluded by one of those declarations is listed separately with its vector ID
and reason. It is not executed, counted as `PASS`, relabeled `UNSUPPORTED`, or
removed by an undisclosed filter. A failure after selection remains a failure.

Mandatory behavior cannot be excluded by an optional-feature declaration or a
recommendation exception. Optional acceptance also cannot weaken the mandatory
meaning of accepted values. The following table is the complete conditional
case inventory for format `0.1`; all other manifest-listed cases are applicable
when their suite and operation are in the claim's declared scope.

| Vector ID | Applicability condition | Mandatory behavior retained independently |
| --- | --- | --- |
| `money.deserialize.unknown-members-001` | Applies only when the implementation declares that its Money deserializer accepts unknown members under `MONEY-SERIALIZATION-006`. A strict parser excludes it before execution; FinKore defines no portable error for that strict-parser choice. | Accepted extensions must preserve Money amount and currency under `MONEY-SERIALIZATION-007` and `MONEY-SERIALIZATION-008`; known-member cases remain applicable. |
| `entity.validation.complete-result-001` | Its `findings` observation applies when the claim declares no justified exception to `ENTITY-ERROR-002` and `ENTITY-VALIDATION-005`. An exception must identify both the diagnostic detail omitted and its rationale. | `entity.validation.failure-atomicity-required-001` independently requires the portable validation error and unchanged complete Entity. |

The table is claim guidance, not vector syntax. It does not change
`finkoreConformance` or `finkoreVectorFile` format `0.1`, add a runner protocol,
or authorize private applicability members in vector files.

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
- optional-feature declarations, justified recommendation exceptions, and the
  vector IDs excluded by those declarations;
- PASS, FAIL, UNSUPPORTED, and INFRASTRUCTURE_ERROR totals;
- individual vector IDs and normalized outcomes sufficient to reproduce
  failures.

Schema validation proves only that the published artifacts are structurally
consistent. It must never be reported as executed financial conformance.

For Approval histories whose individual records do not encode approval context
and subject identity, the claim must also identify consumer-owned evidence that
the enclosing history is immutably scoped to one context and subject through
record, import, reuse, evaluation, withdrawal, and supersession. Portable JSON
cases can compare recorded facts and Requirement associations, but cannot prove
that byte-identical history was not relabeled outside the fixture boundary.

For failure atomicity at a language-native boundary, compare complete retained
state before and after the rejected call and then reuse the retained value in a
subsequent valid operation where practical. If a malformed native input cannot
be represented as a valid committed JSON observation, retain it without
normalizing or manufacturing a valid state and record native evidence that the
call did not mutate it. Such evidence supplements rather than replaces every
portable `expected.observations` comparison.
