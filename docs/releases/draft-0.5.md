# FinKore Core Draft 0.5 Release Notes

## Status

Draft 0.5 is open as the independent cross-language proof release.

This release currently records Milestone A only: baseline, governance,
toolchain, bridge-boundary, and CI planning. It does not claim Python
implementation, Python conformance, Java implementation, Java conformance,
production readiness, certification, external review, or a package release.

## Target Scope

Draft 0.5 targets the closed FinKore Core Draft 0.4 behavior.

- Python is the primary full-manifest implementation track.
- Java is the independent second-language Money track.
- TypeScript remains the regression implementation and must stay green against
  the final Draft 0.5 artifact set.
- No new financial domain is added by Draft 0.5.

## Baseline

Milestone A locked the implementation baseline at repository revision
`d130b2a9dccfbfa50e10e692c1b91866b0fce878`.

| Artifact | Baseline |
| --- | --- |
| Core version | FinKore Core Draft 0.4 |
| Conformance manifest format | `0.1` |
| Vector-file format | `0.1` |
| Vector schema | `conformance/vector.schema.json` |
| Runner package | `@finkore/conformance-runner` `0.1.0` |
| TypeScript core package | `@finkore/typescript` `0.1.0` |
| TypeScript conformance adapter | `@finkore/typescript-conformance-adapter` `0.1.0` |

Baseline inventory:

| Inventory item | Count |
| --- | ---: |
| Indexed requirements | 381 |
| Manifest-listed suites | 5 |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 244 |
| Money vectors | 83 |
| Manifest operation labels | 35 |
| Canonical Agentic operations | 20 |
| Conformance-local operation labels | 15 |
| Mutation-sensitive vectors | 217 |
| Portable error codes | 31 |

The baseline count check is `npm run baseline:draft0.5`.

## Governance

The Milestone A governance record is
[Draft 0.5 Cross-Language Governance](../draft-0.5-cross-language-governance.md).
It records the finding rules, spec-first independence procedure, selected
Python and Java toolchains, conformance bridge boundary, and CI quality matrix.

## Finding Register

No Draft 0.5 findings are open at Milestone A completion.

| Finding | Classification | Status | Owner | Affected artifacts | Release effect | Evidence | Resolution | Maintainer acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

New findings must use stable `D05-*` identifiers and one classification:
`EDITORIAL`, `CLARIFICATION`, `NORMATIVE CHANGE`, `CONTRADICTION`,
`PORTABILITY BLOCKER`, `CONFORMANCE DEFECT`, `IMPLEMENTATION DEFECT`, or
`TOOLING DEFECT`.

TypeScript behavior may be supporting regression evidence, but it is never the
authority that resolves a finding.

## Verification Status

Milestone A adds the Draft 0.5 CI matrix and baseline validation. Final release
verification is not complete.

Required current checks:

- clean package installation;
- TypeScript build, strict typecheck, and unit tests;
- TypeScript full conformance regression;
- baseline count validation;
- documentation reference checks;
- license checks; and
- clean-diff checks after generated outputs.

Python and Java jobs are pre-implementation toolchain checks until TASK-213 and
TASK-226 create the package skeletons. The Draft 0.5 CI workflow provisions the
selected versions through `npm run tools:bootstrap:draft0.5`; local development
uses the same `.tools` fallback when system toolchains are missing. These jobs
must not be reported as conformance evidence.

## Unsupported and Deferred Scope

Java full-domain conformance is outside this release. Python and Java packages
are not yet implemented at Milestone A completion. Draft 0.4 deferred topics
remain deferred unless an accepted Draft 0.5 finding records a scoped
resolution.
