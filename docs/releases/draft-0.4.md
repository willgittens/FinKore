# FinKore Core Draft 0.4 Release Notes

**Status:** UNRELEASED

## Planned purpose

Draft 0.4 is a foundation-stabilization release. It will finalize and align the
existing specifications, CoreDoc, conformance contract, Agentic Contract, and
implementation documentation so that Draft 0.5 can add Python and Java
implementations against one language-neutral behavioral baseline.

The active work is tracked in the
[Draft 0.4 Specification Foundation Plan](../plans/draft-0.4-foundation-task-list.md).

## Planned scope

- Resolve authority and version terminology, including correction of the current
  CoreDoc `v0.5` label to Draft 0.4.
- Establish bidirectional CoreDoc/specification traceability.
- Stabilize shared conventions and the existing Money, Workflow, Audit,
  Approvals, and Entities specifications.
- Review portable values, decimals, timestamps, identity, ordering, optionality,
  errors, effects, and failure atomicity across TypeScript, Python, and Java
  language models.
- Conduct Python and Java implementation-readiness desk reviews without adding
  either implementation.
- Audit conformance schema, vectors, traceability, runner, and adapter boundaries
  for language neutrality.
- Publish language-neutral implementation and adapter-onboarding guidance.
- Produce a bounded Draft 0.5 Python and Java handoff.

## Non-goals

- No new financial domain or deferred financial capability.
- No Python or Java production implementation.
- No conversion of conformance fixtures into mandatory production APIs.
- No claim of Python or Java conformance.

## Starting baseline

Draft 0.4 starts from the closed Draft 0.3 baseline of 381 normative clauses and
244 passing manifest-listed vectors. These figures must be refreshed before
Draft 0.4 relies on them.

## Verification

Not yet recorded. This section will be populated only with completed, reproducible
Draft 0.4 closure evidence.

## Release status rule

This document describes planned work while its status is `UNRELEASED`. Items must
not be described as delivered until their specification, conformance,
implementation-alignment, documentation, and review gates have passed. Draft 0.4
closure does not itself claim Python or Java implementation or conformance.
