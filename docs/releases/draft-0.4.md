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

- Resolve authority and version terminology, including correction of the
  pre-Draft-0.4 CoreDoc `v0.5` label to Draft 0.4.
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

Draft 0.4 baseline refresh was performed on repository revision `68e576b`
(`Organizing Release Notes`) with a clean worktree before Draft 0.4 edits began.

Inventory:

- Specification Markdown files: 47.
- Unique specification requirement IDs indexed in
  [traceability](../../conformance/traceability.md): 381.
- Traceability status: 312 covered, 69 not directly testable, 0 partial, 0
  uncovered, 0 deferred, and 0 blocking specification gaps.
- Conformance format: `finkoreConformance` `0.1`.
- Manifest-listed vector files: 16.
- Manifest-listed vectors: 244 total, including 217 mutation-sensitive vectors.
- Manifest-listed operation labels: 35 total; 20 canonical `finkore.*`
  operations and 15 conformance-local operations.
- Agentic registry: 20 canonical operations with matching descriptor sections.
- Portable error codes referenced across specification, conformance, Agentic
  contract, runner, adapter, and TypeScript core source: 31.
- Node toolchain used for baseline verification: Node `v24.15.0`, npm `11.12.1`.

Current deferred or non-capability topics remain outside Draft 0.4 unless a
later accepted finding shows that one blocks an unambiguous implementation of
already accepted behavior. They include private/non-fiat currency namespace
design, minor-unit metadata policy, decimal precision floors, overflow and
capability reporting, standardized Audit provenance, portable condition
expressions, Workflow migration and distributed coordination, approval
delegation/escalation/dynamic approver resolution, broader identity registries,
concrete ledger or correction posting effects, post-finalization metadata
policy, distributed audit total ordering, and future ledger, reconciliation,
payment, tax, and settlement domains.

## Authority and version taxonomy

Draft 0.4 records the accepted foundation decision that FinKore Core Draft
versions name the shared specification/CoreDoc behavioral baseline. The
conformance manifest/vector-file format and language package versions are
separate compatibility dimensions:

- CoreDoc and `/spec` are aligned to FinKore Core Draft 0.4 terminology.
- Draft 0.5 is reserved for the later Python and Java implementation milestone.
- Conformance format `0.1` remains a syntax compatibility version because the
  manifest and vector-file shapes did not change.
- TypeScript package versions remain implementation-package versions and do not
  define the FinKore Core draft.
- No Draft 0.4 artifact claims Python or Java implementation or conformance.

When labels differ, `/spec` is authoritative for precise domain behavior,
CoreDoc is authoritative for foundation rules and their evolution,
`/conformance` is executable evidence, `/agentic` describes canonical operation
semantics, and language implementations are evidence and regression oracles, not
sources of financial semantics.

## Draft 0.5 implementation-readiness contract

Python and Java implementation work may begin in Draft 0.5 only after Draft 0.4
records evidence that a prospective implementer can determine, for each
supported capability:

- authoritative behavior and stable requirement IDs;
- portable value representations, optionality, nullability, ordering,
  timestamps, identity, revisions, versions, and deterministic context;
- exact success outputs, portable errors, failure atomicity, mutation behavior,
  preconditions, postconditions, and unsupported behavior;
- canonical versus conformance-local operation labels;
- conformance adapter obligations and normalized-result boundaries;
- test vectors for directly testable requirements and justification for `NOT
  DIRECTLY TESTABLE` classifications;
- documentation and examples that do not require reading TypeScript source to
  infer financial semantics; and
- verification evidence for the TypeScript reference oracle, including build,
  typecheck, unit tests, conformance, coverage, mutation, and any available
  documentation-link checks.

Desirable later enhancements, such as machine-readable operation manifests,
additional property-test guidance, richer discovery metadata, or language-
specific architecture recommendations, are not prerequisites for beginning
Draft 0.5 language implementation work unless a Draft 0.4 finding reclassifies
one as portability-blocking.

## Review and decision governance

Draft 0.4 adapts the Draft 0.3 review model for a stabilization release.
Material findings must be classified under the categories in the foundation
plan and must record affected identifiers, owner, reviewed revision, domain,
accounting, technical, security, and privacy analysis, alternatives,
recommendation, compatibility impact, maintainer acceptance, superseded
normative decisions where applicable, and factual external-review status.

CoreDoc is the durable record for foundation-level normative evolution. The
affected specification remains the home of precise domain behavior. Release
notes record implementation and verification facts. Developer plans organize
work but are not release evidence or normative history.

No external review, independent review, community signoff, or reviewer
credential is implied by Draft 0.4 unless explicitly recorded. Material semantic
findings cannot close as editorial-only edits.

## CoreDoc alignment

Milestone B, CoreDoc alignment, is complete. The durable review record is
[Draft 0.4 CoreDoc Alignment Record](../coreDoc/draft-0.4-alignment.md).

Results:

- 24 CoreDoc identifiers inventoried: 5 principles and 19 rule-level entries.
- Every CoreDoc identifier has introduced/updated metadata and a finding
  classification.
- Every rule-level CoreDoc identifier maps to exact specification requirement
  refinements.
- Every requirement family in `conformance/traceability.md` maps back to a
  CoreDoc rule or an explicit `DOMAIN-LOCAL` rationale.
- Counterexample review covered negative amounts, currency mismatch,
  rounding/allocation, failed state changes, history/redaction, approval
  applicability/effectiveness, and identity/revision/version separation.
- Findings were `EDITORIAL` or `CLARIFICATION`; zero contradictions, zero
  portability blockers, and zero normative behavior changes were recorded.
- No external review is claimed.

## Domain specification stabilization

Milestone C, Domain specification stabilization, is complete. The durable review
record is [Draft 0.4 Domain Specification Stabilization Record](../../spec/draft-0.4-stabilization.md).

Results:

- 47 specification Markdown files and 388 normative-keyword occurrences were
  audited for shared terminology and domain consistency.
- 30 existing open questions were classified as future-scope questions; none
  blocks the Draft 0.4 baseline.
- The glossary now explicitly defines Absent, Current, Invalid, Null, Revision,
  Unsupported, and Version for cross-domain use.
- Money, Workflow, Audit, Approvals, and Entities were accepted as stable for
  Draft 0.4 without new financial behavior.
- The cross-domain matrix records identity, revision/version, currentness,
  applicability, validation, atomicity, Audit evidence, timestamps, portable
  values, and portable error priority.
- The consolidated portable error contract remains 31 cataloged codes with zero
  missing or orphan catalog entries in the reviewed scope.
- Findings were `CLARIFICATION` or `ACCEPTED`; zero contradictions, zero
  blocking gaps, zero conformance-vector changes, and zero TypeScript behavior
  changes were recorded.
- No external review is claimed.

## Cross-language portability contract

Milestone D, Cross-language portability contract, is complete. The durable review
record is [Draft 0.4 Cross-Language Portability Contract](../../spec/draft-0.4-portability-contract.md).

Results:

- Abstract values, normative serialization, conformance-only fixture shapes,
  normalized results, and idiomatic production API choices are explicitly
  separated for Money, rates, rounding, currencies, identifiers, states,
  timestamps, collections, histories, errors, absence, redaction, operation
  inputs, and observations.
- Decimal and numeric portability was reviewed against Python `decimal` and Java
  `BigDecimal`/integer implementation models. Every current Money vector has one
  intended outcome in both languages when exact base-10 parsing, numeric
  equality, explicit rounding, signed-zero normalization, and declared-order
  allocation are preserved.
- Structural portability was reviewed for omitted versus null, unknown members,
  duplicate JSON members, map versus array order, stable declared order, Unicode
  and ASCII constraints, case sensitivity, RFC 3339 offsets, instant comparison,
  immutable observations, opaque identifiers, and deterministic diagnostics.
- All 35 manifest-listed operation labels are inventoried: 20 canonical
  `finkore.*` Agentic operations and 15 conformance-local fixture labels.
- Python and Java desk reviews found zero unresolved portability blockers.
- No conformance vectors, TypeScript behavior, portable error codes, Agentic
  descriptors, or runner behavior changed.
- No Python implementation, Java implementation, or Python/Java conformance is
  claimed.
- No external review is claimed.

## Conformance and implementer documentation

Milestone E, Conformance and implementer documentation, is complete. The durable
review record is
[Draft 0.4 Conformance and Implementer Documentation Audit](../../conformance/draft-0.4-audit.md).

Results:

- Conformance schema and manifest portability were reviewed for schema dialect,
  format-version handling, unknown-member policy, path resolution, unique IDs,
  operation registration, input/context separation, expected-result
  exclusivity, JSON-number avoidance, deterministic ordering, and diagnostics.
- Vector and traceability language neutrality were reviewed. The manifest
  remains at 16 vector files and 244 unique vectors across 35 operation labels;
  traceability remains 381 indexed requirements, 312 covered, 69 not directly
  testable, and zero partial, uncovered, deferred, or blocking specification-gap
  rows.
- Runner and adapter boundaries were reviewed. The runner remains
  domain-neutral; adapters own translation and normalized result mapping;
  unsupported and infrastructure outcomes cannot be reported as passing.
- Published the
  [Language-Neutral Implementation Guide](../implementation-guide.md) and
  [Conformance Adapter Onboarding Guide](../conformance-adapter-onboarding.md).
- No manifest format, vector-file format, conformance vectors, runner behavior,
  adapter behavior, TypeScript behavior, portable error codes, Agentic
  descriptors, or Python/Java implementation/conformance claims changed.
- No external review is claimed.

## Verification

Baseline verification for Milestone A:

| Check | Command | Result |
| --- | --- | --- |
| Build | `npm run build` | PASS |
| Strict TypeScript | `npm run typecheck` | PASS |
| Unit tests | `npm test` | PASS: runner 110/110, TypeScript core 371/371, TypeScript conformance adapter 15/15 |
| Runner coverage | `npm run test:coverage -w @finkore/conformance-runner` | PASS: 98.31% statements, 95.29% branches, 100% functions, 98.75% lines |
| TypeScript core coverage | `npm run test:coverage -w @finkore/typescript` | PASS: 99.09% statements, 98.69% branches, 100% functions, 99.49% lines |
| Full conformance | `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` | PASS: 244/244 vectors, 217/217 mutation-sensitive vectors |
| TypeScript core mutation | `npm run test:mutation -w @finkore/typescript` | PASS: 98.28% total, 98.40% covered, 3129 killed, 16 timeout, 51 survived, 4 no coverage, 0 errors |
| Runner mutation | `npm run test:mutation -w @finkore/conformance-runner` | PASS: 99.73% total and covered, 367 killed, 1 survived, 0 no coverage, 0 errors |
| License metadata | `npm run license:check` | PASS |
| Documentation links | repository script/tool search | No configured Markdown link checker was found |

The first sandboxed TypeScript core mutation attempt failed before testing with
`listen EPERM` when Stryker tried to bind its local logging server. The same
command was rerun outside the sandbox and passed.

Additional verification for Milestone B:

| Check | Command | Result |
| --- | --- | --- |
| CoreDoc requirement and Markdown links | `npm run docs:check` | PASS: 269 CoreDoc specification references checked; Markdown links resolve |
| Strict TypeScript | `npm run typecheck` | PASS |
| Unit tests | `npm test` | PASS: runner 110/110, TypeScript core 371/371, TypeScript conformance adapter 15/15 |
| License metadata | `npm run license:check` | PASS |
| Whitespace | `git diff --check` | PASS |

Additional verification for Milestone C:

| Check | Command | Result |
| --- | --- | --- |
| Domain specification links | `npm run docs:check` | PASS |
| Strict TypeScript | `npm run typecheck` | PASS |
| Unit tests | `npm test` | PASS |
| License metadata | `npm run license:check` | PASS |
| Whitespace | `git diff --check` | PASS |

Additional verification for Milestone D:

| Check | Command | Result |
| --- | --- | --- |
| Portability contract links | `npm run docs:check` | PASS |
| Strict TypeScript | `npm run typecheck` | PASS |
| Unit tests | `npm test` | PASS |
| License metadata | `npm run license:check` | PASS |
| Whitespace | `git diff --check` | PASS |

Additional verification for Milestone E:

| Check | Command | Result |
| --- | --- | --- |
| Conformance and guide links | `npm run docs:check` | PASS |
| Workspace build | `npm run build` | PASS |
| Strict TypeScript | `npm run typecheck` | PASS |
| Unit tests | `npm test` | PASS |
| Full conformance | `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` | PASS: 244/244 vectors |
| License metadata | `npm run license:check` | PASS |
| Whitespace | `git diff --check` | PASS |

## Release status rule

This document describes planned work while its status is `UNRELEASED`. Items must
not be described as delivered until their specification, conformance,
implementation-alignment, documentation, and review gates have passed. Draft 0.4
closure does not itself claim Python or Java implementation or conformance.
