# FinKore Conformance Runner

This package is the reference TypeScript runner for FinKore's language-independent conformance vectors. It verifies an implementation's normalized observable behavior against the specification vectors.

It is not a financial library, a FinKore domain implementation, an agent runtime, or a general-purpose application testing framework. Production code here contains no Money, Workflow, Audit, Approval, or Entity behavior.

The runner package version is an implementation artifact version. It is
separate from the FinKore Core release version and from the manifest/vector
format versions that the runner accepts.

## Architecture

```text
Specification requirements
        ↓
Manifest-declared vector
        ↓
Runner validation and dispatch
        ↓
Implementation adapter
        ↓
Implementation under test
```

The runner loads only files declared by `conformance/manifest.json`. It validates every loaded vector and all cross-layer references before executing any vector. Execution is sequential and deterministic: manifest suite order, then vector ID within each suite.

Manifest and vector-file versions are syntax compatibility versions. They do not
need to match FinKore release numbers. The runner rejects unsupported format
versions instead of guessing compatibility.
Core compatibility rules for financial behavior and portable serializations are
defined by the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy);
the runner package version does not create a separate financial compatibility
promise.

## Canonical operations and requirements

Canonical operation IDs are reused verbatim from the Agentic Contract, including
`finkore.money.add`, `finkore.money.divide`, and
`finkore.workflow.transition`. `src/metadata.ts` contains the small explicit
canonical Agentic ID set aligned with `agentic/operations.md`; it
duplicates identifiers, not semantics. Operations without the `finkore.` prefix
remain conformance-local adapter vocabulary as documented by
`conformance/conventions.md`.

Requirement IDs and the existing critical classification are read conservatively from the canonical tables in `conformance/traceability.md`. The loader fails if that inventory is missing, and vector references outside it are rejected. This focused table reader is deliberately not a generalized Markdown or specification parser.

## Adapter API

```ts
export interface FinKoreConformanceAdapter {
  supports(operationId: string): boolean

  execute(request: {
    operationId: string
    input: unknown
    context?: unknown
  }): Promise<NormalizedResult> | NormalizedResult

  reset?(): Promise<void> | void
}

export type NormalizedResult =
  | { status: 'success'; value: unknown; observations?: Record<string, unknown> }
  | {
      status: 'error'
      error: { code: string; details?: unknown }
      observations?: Record<string, unknown>
    }
```

The normalized envelope is conformance infrastructure, not a required FinKore implementation API. An adapter translates native values and errors into it. It must canonicalize domain representations before returning; the domain-neutral comparator applies exact recursive equality, with unordered object keys and ordered arrays. It never uses floating-point tolerance or invents domain equivalence.

An optional `reset` hook supports the vector-isolation requirement. It runs immediately before each supported execution.

See the [Conformance Adapter Onboarding Guide](../docs/conformance-adapter-onboarding.md)
for the language-neutral integration workflow, reporting expectations, and
local verification.

## Programmatic usage

```ts
import { createConformanceRunner } from '@finkore/conformance-runner'
import { adapter } from './my-adapter.js'

const runner = createConformanceRunner({
  manifestPath: 'conformance/manifest.json',
  adapter,
})

const report = await runner.run({
  suites: ['money'],
  tags: ['boundary'],
  vectorIds: ['money.round.half-even.tie-even-down-001'],
})
```

Values within one filter dimension are ORed; different dimensions are ANDed. Empty filter arrays mean no restriction. Filtering preserves loader order and never changes vector semantics.

## CLI

Build the package, then provide an ESM module whose default export or named `adapter` export implements the adapter interface:

```bash
npm run build
node dist/cli/cli.js \
  --manifest ../conformance/manifest.json \
  --adapter ./my-adapter.js \
  --suite money \
  --tag mutation-sensitive
```

Repeat `--suite`, `--tag`, or `--vector` to select multiple values. Add `--json` for the stable machine-readable report.

Exit codes have this precedence:

| Code | Meaning |
| ---: | --- |
| 0 | Every selected vector passed. |
| 1 | At least one vector failed and there was no infrastructure error. |
| 2 | Loading, validation, runner, or adapter infrastructure failed. |
| 3 | At least one vector was unsupported, with no failure or infrastructure error. |

Thus infrastructure errors take precedence over failures, and failures over unsupported results.

## Result semantics

- `PASS`: the normalized observable result exactly matches the vector.
- `FAIL`: the adapter executed the operation but the result, portable error code, or requested observations differed.
- `UNSUPPORTED`: `supports` returned false. Unsupported is never passing or skipped.
- `INFRASTRUCTURE_ERROR`: adapter capability detection, reset, execution, or normalized-result validation failed unexpectedly.

Malformed manifests or vectors fail the run before execution and lead to CLI exit code 2. Reports aggregate by suite and requirement, separately summarize mutation-sensitive vectors, and surface every non-passing result tied to a critical requirement.

Reports also include reproducibility metadata: Core release, manifest path,
`finkoreConformance` version, vector schema path, manifest-declared suites and
vector files, and any selected suites, tags, or vector IDs. A filtered report is
evidence only for that selected run; complete Core or domain-scoped conformance
claims are governed by the claim model in
[conformance/README.md](../conformance/README.md#conformance-claim-model).

## Validation

The runner rejects unsupported versions, malformed or duplicate suite declarations, unsafe manifest paths, unreadable JSON, missing files, malformed vector files, missing/invalid/duplicate vector IDs, invalid specification references, empty descriptions, non-object input/context/observations, invalid or duplicate requirement references, invalid/unknown operation IDs, unregistered `finkore.*` IDs, invalid/duplicate tags and guards, malformed portable error codes, contradictory success/error expectations, and globally duplicate vector IDs.

Unknown vector members are ignored in accordance with `conformance/conventions.md`; they cannot alter defined-member semantics.

## Reliability

```bash
npm test
npm run typecheck
npm run test:coverage
npm run test:mutation
```

Vitest covers loader, validator, comparator, adapter, filters, runner classification, reporters, real artifacts, and cross-layer consistency. Stryker mutates the meaningful decision logic with a 95% break threshold. No broad source exclusions or mutation-type exclusions are configured. A high aggregate score never excuses a surviving critical mutant; mutation reports must be inspected before readiness is claimed.
