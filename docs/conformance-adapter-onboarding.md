# FinKore Conformance Adapter Onboarding

## Purpose

This guide describes how to bring a language implementation under the FinKore
conformance suite. It is about adapter integration, not production API design.
The TypeScript adapter is a working example, but it is not normative
architecture for Python, Java, or any other implementation.

## Build and Run Boundary

The reference runner is a Node package. Build it before invoking the CLI:

```bash
npm run build
node runner/dist/cli/cli.js \
  --manifest conformance/manifest.json \
  --adapter path/to/adapter.js
```

The current CLI loads an in-process ESM adapter. A non-TypeScript implementation
can satisfy this boundary with a thin JavaScript bridge that starts a subprocess,
calls a local binary, or invokes a library through a binding. That bridge is
adapter infrastructure; it must not define financial behavior.

## Adapter Handshake

An adapter module exports either a named `adapter` or a default object with:

```ts
interface FinKoreConformanceAdapter {
  supports(operationId: string): boolean
  execute(request: {
    operationId: string
    input: unknown
    context?: unknown
  }): Promise<NormalizedResult> | NormalizedResult
  reset?(): Promise<void> | void
}
```

`supports` reports whether the adapter can execute the operation label. Returning
`false` produces `UNSUPPORTED`; it is never counted as pass or skip.

`reset` is optional and runs before each supported vector. Use it to clear
in-memory state, temporary stores, subprocess caches, or other vector-local
fixtures.

`execute` must run the operation once and return a normalized result.

## Operation Discovery

Use [conformance/manifest.json](../conformance/manifest.json) as the only
discovery entry point. Load only manifest-listed vector files, resolve paths
relative to the manifest, and reject unsupported format versions.

Operation labels come from [Conformance Conventions](../conformance/conventions.md).
Labels beginning with `finkore.` are canonical Agentic operations. Other labels
are conformance-local fixture operations and must not be advertised as public
FinKore capabilities merely because they appear in vectors.

## Vector Selection

The runner supports filters:

```bash
node runner/dist/cli/cli.js \
  --manifest conformance/manifest.json \
  --adapter path/to/adapter.js \
  --suite money \
  --tag boundary \
  --vector money.round.half-even.tie-even-down-001
```

Repeated values within one dimension are ORed. Different dimensions are ANDed.
Filtering does not change vector semantics.

Draft 0.6 also supports closed profile runs. A profile run resolves all required
vectors from metadata and cannot be combined with ad hoc suite, tag, or vector
filters:

```bash
node runner/dist/cli/cli.js \
  --manifest conformance/manifest.json \
  --profiles conformance/draft-0.6/profiles.json \
  --profile finkore.core.draft0_6.domain.money \
  --adapter path/to/adapter.js \
  --json
```

## Normalization

The adapter normalizes only observable behavior:

```ts
type NormalizedResult =
  | { status: "success"; value: unknown; observations?: Record<string, unknown> }
  | {
      status: "error"
      error: { code: string; details?: unknown }
      observations?: Record<string, unknown>
    }
```

For success, return the expected portable value. For error, return the primary
portable domain code. Include `observations` when a vector checks post-state,
failure atomicity, or non-mutation.

Do not return language exceptions, stack traces, localized messages, class
names, HTTP statuses, or internal storage records as portable behavior. They may
exist as diagnostics, but the comparison contract is value, portable code, and
requested observations.

Money values must be normalized to the conformance representation before
comparison. Use exact base-10 semantics and no floating-point tolerance.

## Unsupported and Infrastructure Outcomes

Use `supports(operationId) === false` only when the operation is genuinely not
implemented by the adapter. Unsupported is a reportable conformance outcome and
cannot be claimed as passing.

Let infrastructure failures surface when the adapter cannot faithfully execute
or normalize a vector. Examples include malformed bridge responses, subprocess
crashes, adapter bugs, invalid normalized result shapes, missing binaries, and
unexpected exceptions.

A domain rejection is not an infrastructure failure. It must return
`{ "status": "error", "error": { "code": "FINKORE_..." } }`.

## Debugging

Run a narrow vector first, then widen the filter:

```bash
node runner/dist/cli/cli.js --adapter path/to/adapter.js --suite money
node runner/dist/cli/cli.js --adapter path/to/adapter.js --tag mutation-sensitive
node runner/dist/cli/cli.js --adapter path/to/adapter.js --json
```

Use the JSON report for automated evidence. It includes suite counts,
requirement counts, mutation-sensitive counts, per-vector results, and critical
requirement failures. In profile mode it also records profile id, Core version,
profile kind, manifest/vector format versions, required vector count, required
vector ids, source files, and any capability floor.

When a vector fails, check these in order:

1. The referenced specification requirement.
2. The vector input and expected observation.
3. Adapter translation from fixture input to implementation call.
4. Implementation behavior.
5. Adapter normalization from implementation result/error to conformance result.

If the vector appears to define behavior absent from `/spec`, record a
specification gap instead of copying the fixture into production behavior.

## Complete-Suite Reporting

Before claiming conformance for a language implementation, run the complete
manifest-listed suite without filters and record:

- source revision;
- manifest and vector-file format versions;
- implementation package version;
- adapter version or source revision;
- command line;
- total pass/fail/unsupported/infrastructure counts;
- mutation-sensitive pass/fail/unsupported/infrastructure counts;
- critical requirement failures;
- any unsupported operations and why they are unsupported.

Do not claim full domain conformance while required vectors are unsupported,
failing, or blocked by infrastructure errors.

## Regression Policy

When a real defect is found:

1. Add or identify a language-independent vector that reproduces the defect.
2. Confirm the vector fails against the defective implementation.
3. Fix the implementation.
4. Keep the vector permanently with the `regression` tag when appropriate.
5. Add language unit tests or mutation tests for the local failure mode.

Regression vectors must derive from the specification. They must not encode a
TypeScript API accident, adapter implementation detail, or unstated language
default.

## Evidence Needed Before Claiming Conformance

A conformance claim needs all of the following:

- a complete unfiltered runner report with zero failures and zero infrastructure
  errors;
- zero unsupported vectors for the claimed scope;
- confirmation that the implementation targets the same FinKore Core Draft and
  conformance format versions;
- documentation of any language-specific limits that do not change current
  vector outcomes;
- public API documentation for supported behavior and portable errors;
- mutation or equivalent defect-resistance evidence for official/reference
  implementations;
- a clear statement of unsupported, not yet specified, and deferred behavior.

Draft 0.4 itself did not claim Python or Java implementation or conformance; it
published the baseline and onboarding path. Draft 0.5 subsequently recorded
full-manifest Python conformance and Money-scope Java conformance. Draft 0.6
records current profile-specific claims for TypeScript full scope, Python full
scope, and Java Money scope in `conformance/draft-0.6/claims`. Those results do
not remove any of the evidence requirements above for a new or updated claim.
