# FinKore Core Draft 0.5 Release Notes

## Status

Draft 0.5 is closed as the independent cross-language proof release.

This release currently records Milestone A infrastructure, the Python
implementation track, Java Money implementation track, Milestone D portability
review, and final verification evidence. It does not claim production
readiness, certification, external review, or a package release.

```text
FINKORE CORE DRAFT 0.5 COMPLETE

The stabilized FinKore Core behavior has been implemented independently in
Python for the complete manifest-listed scope and in Java for the complete Money
scope. TypeScript remains the reference implementation, not the source of
financial semantics. All declared conformance scopes pass with zero failures,
unsupported results, or infrastructure errors. This statement does not claim
full Java conformance, production readiness, external certification, or FinKore
behavior beyond the named Draft 0.5 scopes.
```

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

Final verification was performed on the current workspace state based on
repository revision `eeab3da94c2321e38a11735528c903a007a7e713`. The eventual
commit containing these Draft 0.5 changes should be treated as the durable
artifact revision for release indexing.

## Governance

The Milestone A governance record is
[Draft 0.5 Cross-Language Governance](../draft-0.5-cross-language-governance.md).
It records the finding rules, spec-first independence procedure, selected
Python and Java toolchains, conformance bridge boundary, and CI quality matrix.

## Finding Register

No Draft 0.5 findings are open at release closure. The portability review is
[FinKore Core Draft 0.5 Portability Review](./draft-0.5-portability-review.md).

| Finding | Classification | Status | Owner | Affected artifacts | Release effect | Evidence | Resolution | Maintainer acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A | N/A | `npm run portability:draft0.5` | No observed portability finding in declared scopes | N/A |

New findings must use stable `D05-*` identifiers and one classification:
`EDITORIAL`, `CLARIFICATION`, `NORMATIVE CHANGE`, `CONTRADICTION`,
`PORTABILITY BLOCKER`, `CONFORMANCE DEFECT`, `IMPLEMENTATION DEFECT`, or
`TOOLING DEFECT`.

TypeScript behavior may be supporting regression evidence, but it is never the
authority that resolves a finding.

## Verification Status

Milestone D final verification is complete for the declared Draft 0.5 scopes.

| Check | Evidence |
| --- | --- |
| Toolchain check | `npm run tools:check:draft0.5`: PASS |
| Baseline inventory | `npm run baseline:draft0.5`: PASS; 381 requirements, 244 vectors, 217 mutation-sensitive vectors, 31 portable error codes |
| TypeScript build | `npm run build`: PASS |
| TypeScript strict typecheck | `npm run typecheck`: PASS |
| TypeScript unit tests | `npm test`: PASS; runner 110 tests, TypeScript core 371 tests, TypeScript adapter 15 tests |
| TypeScript full conformance | `npm run conformance:typescript`: PASS; 244/244 vectors |
| Python compile | `npm run python:compile`: PASS |
| Python adapter tests | `npm run python:adapter:test`: PASS; 4/4 tests |
| Python full conformance | `npm run conformance:python`: PASS; 244/244 vectors |
| Python packaged coverage | `npm run python:coverage`: PASS; 86% line coverage across `finkore` source, full manifest included |
| Python critical mutants | `npm run python:mutation:critical`: PASS; 9/9 critical probes killed |
| Java tests | `npm run java:test`: PASS |
| Java adapter tests | `npm run java:adapter:test`: PASS; 4/4 tests |
| Java Money conformance | `npm run conformance:java:money`: PASS; 83/83 vectors |
| Java packaged coverage | `npm run java:coverage`: PASS; 135/144 package lines covered, 85% gate enforced |
| Java critical mutants | `npm run java:mutation:critical`: PASS; 5/5 critical probes killed |
| Portability review | `npm run portability:draft0.5`: PASS; zero observed actual-result differences requiring findings |
| Architecture boundaries | `npm run architecture:check`: PASS |
| Runner coverage | `npm run test:coverage -w @finkore/conformance-runner`: PASS; 98.31% statements, 95.29% branches, 100% functions, 98.75% lines |
| TypeScript core coverage | `npm run test:coverage -w @finkore/typescript`: PASS; 99.09% statements, 98.69% branches, 100% functions, 99.49% lines |
| Runner mutation | `npm run test:mutation -w @finkore/conformance-runner`: PASS; 99.73% total and covered, 367 killed, 1 survived, 0 no coverage, 0 errors |
| TypeScript core mutation | `npm run test:mutation -w @finkore/typescript`: PASS; 98.28% total, 98.40% covered, 3129 killed, 16 timeout, 51 survived, 4 no coverage, 0 errors; Money scored 100% |
| Documentation references | `npm run docs:check`: PASS |
| License validation | `npm run license:check`: PASS |
| Whitespace/diff sanity | `git diff --check`: PASS |

Python and Java use the packaged critical-mutant probe as the accepted Draft 0.5
defect-resistance evidence for the new language tracks. This is not a broad
mutation-score claim for Python or Java.

Local development provisions the selected versions through
`npm run tools:bootstrap:draft0.5` when system toolchains are missing. The
downloaded `.tools` artifacts are local build inputs, not committed source.

## Unsupported and Deferred Scope

Java full-domain conformance is outside this release. Draft 0.4 deferred topics
remain deferred; no accepted Draft 0.5 finding changed their status.
