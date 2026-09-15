# FinKore Core Draft 0.5 Release Notes

## Status

Draft 0.5 is open as the independent cross-language proof release.

This release currently records Milestone A infrastructure, the Python
implementation track, and the Java Money implementation track. It does not yet
claim Draft 0.5 closure, production readiness, certification, external review,
or a package release.

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

Current implementation evidence:

- Python passes the complete current manifest: 244 vectors pass with zero
  failures, unsupported results, or infrastructure errors.
- Python packaged coverage passes at 86% line coverage across `finkore` source,
  including the complete current manifest in the measured run.
- Java passes the complete current Money suite: 83 vectors pass with zero
  failures, unsupported results, or infrastructure errors.
- Java packaged coverage passes through Maven/JUnit/JaCoCo with 135 covered
  lines out of 144 package lines and an enforced 85% line-coverage gate.
- Java non-Money operations remain explicitly unsupported and are outside the
  Java Draft 0.5 claim.

Python and Java closure still require mutation or accepted equivalent
defect-resistance evidence, critical-mutant review, and final release
verification before TASK-225 or TASK-231 can close.

Local development provisions the selected versions through
`npm run tools:bootstrap:draft0.5` when system toolchains are missing. The
downloaded `.tools` artifacts are local build inputs, not committed source.

## Unsupported and Deferred Scope

Java full-domain conformance is outside this release. Draft 0.4 deferred topics
remain deferred unless an accepted Draft 0.5 finding records a scoped
resolution.
