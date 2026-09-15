# Draft 0.4 Conformance and Implementer Documentation Audit

## Status

Accepted for FinKore Core Draft 0.4 on 2026-09-15.

This record closes the Draft 0.4 "Conformance and implementer documentation"
milestone for TASK-194 through TASK-198. It audits the current conformance
schema, manifest, vectors, traceability, runner, and adapter boundary, and it
records publication of the language-neutral implementation and adapter
onboarding guides.

No financial behavior, portable error code, canonical operation identifier,
conformance vector, manifest format, vector-file format, runner behavior,
TypeScript core behavior, or Agentic descriptor changed in this milestone.

## Reviewed Artifacts

- `conformance/manifest.json`
- `conformance/vector.schema.json`
- all manifest-listed files under `conformance/money/`,
  `conformance/workflow/`, `conformance/audit/`, `conformance/approvals/`,
  and `conformance/entities/`
- `conformance/README.md`
- `conformance/conventions.md`
- `conformance/traceability.md`
- `runner/README.md`
- runner source under `runner/src/`
- runner tests under `runner/test/`
- `implementations/typescript/adapters/conformance/README.md`
- TypeScript conformance adapter source under
  `implementations/typescript/adapters/conformance/src/`
- Draft 0.4 portability contract:
  `spec/draft-0.4-portability-contract.md`

## Finding Summary

| Finding ID | Task | Classification | Resolution |
| --- | --- | --- | --- |
| `D04-CONF-194-001` | Schema and manifest portability | ACCEPTED | Conformance format `0.1` remains language-neutral for the current corpus; schema dialect, versions, path rules, IDs, operation registration, input/context separation, expected-result exclusivity, JSON-number handling, order, and diagnostics are documented and tested without requiring a format change. |
| `D04-CONF-195-001` | Vectors and traceability | ACCEPTED | The corpus has 244 unique vectors, 35 operation labels, 381 indexed requirements, 312 covered requirements, 69 not directly testable requirements, 0 partial, 0 uncovered, 0 deferred, and 0 blocking specification gaps. |
| `D04-CONF-196-001` | Runner and adapter boundary | ACCEPTED | The runner remains domain-neutral; adapters own operation translation and normalized result mapping; unsupported and infrastructure outcomes cannot be reported as passing. |
| `D04-CONF-197-001` | Implementation guide | ACCEPTED | Published the language-neutral implementation guide at `docs/implementation-guide.md`. |
| `D04-CONF-198-001` | Adapter onboarding guide | ACCEPTED | Published the conformance adapter onboarding guide at `docs/conformance-adapter-onboarding.md`. |

All findings are review or documentation findings. No external review is
claimed.

## Schema and Manifest Audit

| Concern | Draft 0.4 result |
| --- | --- |
| Schema dialect | `conformance/vector.schema.json` declares JSON Schema draft 2020-12. No Draft 0.4 syntax change was made. |
| Format-version handling | `finkoreConformance` and `finkoreVectorFile` remain `0.1` syntax compatibility versions, distinct from FinKore Core Draft 0.4. The runner rejects unsupported manifest and vector-file versions. |
| Unknown-member policy | The current manifest-listed corpus contains no unknown vector-level members. Format `0.1` conformance cannot depend on unknown members. Schema-aware runners may reject members outside the schema; permissive runners must not let them alter defined-member semantics. |
| Path resolution | The manifest is the only discovery entry point. Vector schema and vector file paths resolve relative to the manifest directory and must not escape the conformance root. |
| Unique IDs | Suite IDs are unique within the manifest, vector file paths are unique within each suite, and vector IDs are globally unique across loaded files. |
| Operation registration | Every vector operation must exist in the runner metadata operation set. Any `finkore.*` operation must also be present in the Agentic registry. |
| Input/context separation | `input` is required and must be an object. `context` is optional and must be an object when present. The current corpus has 0 separate `context` members; explicit facts and instants are supplied in operation-specific inputs where existing vectors require them. |
| Expected-result exclusivity | `expected` must contain exactly one success value or error code. Current inventory: 137 success vectors, 107 error vectors, 0 vectors with both `value` and `error`, and 0 vectors with neither. |
| JSON-number avoidance | Decimal boundary values are strings except for negative vectors that intentionally supply JSON numbers to prove rejection: `money.deserialize.numeric-amount-001` and `money.rate.invalid-numeric-value-001`. |
| Deterministic ordering | Loader order is manifest suite order, then vector ID order within each suite. Filesystem traversal order has no meaning. JSON object member order has no meaning; arrays remain ordered where specifications or vectors make order observable. |
| Validation diagnostics | Loader, manifest, vector, normalized-result, adapter, and execution failures are reported as infrastructure errors when they prevent a faithful conformance comparison. Diagnostic wording is not financial semantics. |

No format bump was required because no manifest or vector-file shape changed.
No financial validation was added to the runner.

## Vector and Traceability Audit

Current manifest inventory:

| Item | Count |
| --- | ---: |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 244 |
| Unique vector IDs | 244 |
| Operation labels | 35 |
| Canonical `finkore.*` operations | 20 |
| Conformance-local operation labels | 15 |
| Success vectors | 137 |
| Error vectors | 107 |
| Vectors with expected observations | 129 |
| Vectors tagged `positive` | 129 |
| Vectors tagged `negative` | 114 |
| Vectors tagged `boundary` | 104 |
| Vectors tagged `invariant` | 115 |
| Vectors tagged `regression` | 6 |
| Vectors tagged `mutation-sensitive` | 217 |

Current traceability inventory:

| Coverage class | Count |
| --- | ---: |
| Indexed requirements | 381 |
| Covered | 312 |
| Partial | 0 |
| Uncovered | 0 |
| Not directly testable | 69 |
| Deferred | 0 |
| Blocking specification gap | 0 |

The 69 `NOT DIRECTLY TESTABLE` rows remain justified as specification-authoring
rules, optional/recommended freedoms, non-observable guarantees, diagnostic
privacy constraints, architecture constraints, or other obligations that one
static vector cannot isolate without turning non-mandatory behavior into a
mandatory fixture. No row hides a feasible deterministic vector for the closed
Draft 0.4 behavior.

The audit found no orphan vector, invalid requirement reference, uncovered
directly testable mandatory requirement, partial requirement, or blocking
specification gap.

## Runner and Adapter Boundary Audit

| Boundary | Draft 0.4 result |
| --- | --- |
| Dispatch | The runner validates vector operation labels and calls `adapter.supports(operationId)` before execution. It does not branch on financial domain rules. |
| Input translation | The adapter receives `operationId`, `input`, and optional `context`. It translates fixtures into implementation calls. Production APIs do not need to expose fixture shapes. |
| Normalized results | The adapter returns only normalized success values, portable error codes, and optional requested observations. The normalized envelope is conformance infrastructure. |
| Comparison | The runner compares normalized results by exact recursive equality. Money-specific numeric canonicalization is an adapter responsibility before returning normalized values. |
| Observations | Expected post-state observations are compared for both success and error results. This is how atomicity and non-mutation invariants are made visible. |
| Unsupported | `supports() === false` produces `UNSUPPORTED`. Unsupported is not pass, skip, or success. |
| Infrastructure errors | Adapter support checks, reset hooks, execution, malformed normalized results, loading, and validation failures report `INFRASTRUCTURE_ERROR` rather than a domain result. |
| Metadata | Requirement and operation metadata are read from traceability and Agentic descriptors. Metadata duplicates identifiers, not financial behavior. |
| Process and transport | The current runner accepts an in-process ESM adapter. Other process boundaries are future adapter tooling, not Draft 0.4 financial semantics. |
| Exit status | CLI exit codes distinguish pass, fail, infrastructure error, and unsupported outcomes with documented precedence. |
| Determinism | Vectors are isolated with optional `reset`, loaded deterministically, and cannot depend on wall clocks, locale, timezone, network, external FX, or filesystem enumeration order. |
| Diagnostic privacy | Error messages and details are not compared as portable behavior. Optional diagnostics must not redefine portable codes or expose protected data by default. |

The TypeScript adapter audit found no financial rule that needed to move from
adapter code into the runner and no conformance-only fixture that needed to move
into the production TypeScript core. Existing compatibility aliases in the
TypeScript adapter remain adapter-local and are not manifest-listed Draft 0.4
operation labels.

## Published Guides

- [Language-Neutral Implementation Guide](../docs/implementation-guide.md)
- [Conformance Adapter Onboarding Guide](../docs/conformance-adapter-onboarding.md)

The guides link to authoritative rules instead of restating a second
specification. Python and Java API sketches are explicitly non-normative.

## Gate

TASK-198 is accepted.

- The conformance schema and manifest are portable for the current Draft 0.4
  corpus without a format change.
- Vectors and traceability remain language-neutral and derive from `/spec`.
- The runner remains domain-neutral.
- Adapter obligations are documented without requiring Python or Java to copy
  TypeScript APIs or adapter internals.
- The implementation guide and adapter onboarding guide are published.
- No Python implementation, Java implementation, or Python/Java conformance is
  claimed.
- No external review is claimed.
