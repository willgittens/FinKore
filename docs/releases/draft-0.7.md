# FinKore Core Draft 0.7 Release Notes

## Status

Draft 0.7 is open. This file is a release-note shell for cross-domain
composition work. It records planning evidence and pending findings; it does
not claim Draft 0.7 conformance, package availability, production readiness,
external review, or release closure.

Draft 0.7 uses two non-normative reference application profiles:

- expense approval; and
- invoice correction.

Those profiles demonstrate composition of existing Money, Workflow, Audit,
Approvals, and Entities behavior. They do not define new invoice, expense,
ledger, tax, settlement, authorization, or posting standards.

## Target Scope

Draft 0.7 aims to prove that existing Core domains can be composed into
bounded financial workflows with traceable authority, portable observations,
preserved history, and no partial observable financial effect on rejection.

The release target remains subject to the task list in
[Draft 0.7 Composition Task List](../plans/draft-0.7-composition-task-list.md).

Supporting Milestone A artifacts:

- [Draft 0.7 Composition Profiles](../draft-0.7-composition-profiles.md)
- [Draft 0.7 Composition Scenario Matrix](../draft-0.7-composition-scenario-matrix.md)
- [Draft 0.7 Composition Observation Contract](../draft-0.7-composition-observation-contract.md)

## Opening Baseline

Opening source revision:
`ad2942179271f65234527d73fca020efa1df443c`.

Historical Draft 0.6 tag revision:
`4770e267bd13c3d89b6c34cee9fabb52eb0a4eab`.

TASK-257 Java full-profile parity evidence remains recorded at
`e79ff010428a959dd7cae59948eab7ce5d79bab9`.

Milestone A baseline verification was run on September 18, 2026 from the
repository workspace at opening source revision `ad2942179271f65234527d73fca020efa1df443c`.
The worktree was not clean when the run began: `README.md`,
`docs/plans/good-to-have.md`, and
`docs/plans/pre-draft-0.7-readiness-task-list.md` were already modified, and
`docs/plans/draft-0.7-composition-task-list.md` was untracked. These were
treated as planning/documentation qualifications, not as Draft 0.7 release
evidence.

A clean committed-checkout reproduction was later run from committed revision
`9f2409556eca6fd98f29e044c955bbdd22fe497f` on September 18, 2026. The same
opening baseline checks passed from that committed tree, closing
`D07-TOOLING-258-001`.

| Inventory item | Opening value |
| --- | ---: |
| Indexed requirements | 381 |
| Manifest-listed suites | 5 |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 254 |
| Money vectors | 93 |
| Manifest operation labels | 35 |
| Canonical Agentic operations | 20 |
| Conformance-local operation labels | 15 |
| Mutation-sensitive vectors | 227 |
| Portable error codes | 31 |

Manifest and vector-file formats remain `0.1`. The runner, TypeScript core,
TypeScript adapter, Python core, and Java core remain independently versioned at
`0.1.0`.

## Opening Verification

Toolchain observations:

| Tool | Observed version |
| --- | --- |
| Node | `v24.15.0` |
| npm | `11.12.1` |
| CPython 3.12 | `3.12.14` from `.tools/bin/python3.12` |
| CPython 3.13 | `3.13.15` from `.tools/bin/python3.13` |
| JDK | `21.0.12.1` from `.tools/bin/java` |
| Maven | `3.9.9` from `.tools/bin/mvn` |

Commands run:

| Command | Result |
| --- | --- |
| `npm run tools:check:draft0.5` | PASS |
| `npm run baseline:draft0.6` | PASS |
| `npm run build` | PASS |
| `npm run conformance:typescript:profile:full` | PASS: 254/254, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive |
| `npm run conformance:python:profile:full` | Initial sandboxed run failed with `spawnSync .tools/bin/python3.12 EPERM`; escalated rerun PASS: 254/254, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive |
| `npm run conformance:java:profile:full` | Initial sandboxed run failed with `spawnSync .tools/bin/javac EPERM`; escalated rerun PASS: 254/254, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive |

Suite counts for each successful full-profile run were identical:

| Suite | Vectors | Passed |
| --- | ---: | ---: |
| Money | 93 | 93 |
| Workflow | 41 | 41 |
| Audit | 29 | 29 |
| Approvals | 66 | 66 |
| Entities | 25 | 25 |

## Finding and Decision Register

| Finding | Classification | Status | Owner | Affected artifacts | Release or claim effect | Evidence | Resolution | Maintainer acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `D07-TOOLING-258-001` | `TOOLING/CLAIM DEFECT` | RESOLVED | Release/conformance maintainers | Draft 0.7 opening evidence and future release claims | Clean-checkout acceptance for TASK-258 is no longer blocked; does not change financial behavior, requirements, vectors, errors, operations, or Draft 0.6 historical evidence | Initial Milestone A profile runs passed from revision `ad2942179271f65234527d73fca020efa1df443c` with dirty-worktree qualifications. Clean committed revision `9f2409556eca6fd98f29e044c955bbdd22fe497f` later reproduced `tools:check:draft0.5`, `baseline:draft0.6`, `build`, and all three full profiles with 254/254 passing and 227/227 mutation-sensitive results. Python and Java required escalated reruns after local-toolchain sandbox `EPERM` failures. | Clean committed-checkout opening verification reproduced on September 18, 2026 | Accepted for Draft 0.7 opening-evidence scope |

## Current Claim Boundary

Draft 0.7 currently claims no new Core behavior and no new closed conformance
profile. The opening evidence only confirms that the existing
`finkore.core.draft0_6.full` profile still passes in TypeScript, Python, and
Java from the qualified workspace state described above.

Reference application scenario results are reported separately from normative
Core conformance.

## Milestone B Status

Milestone B resolves the reference action boundaries, primary-failure policy,
fixture location, and no-new-normative-change decision in
[Draft 0.7 Composition Observation Contract](../draft-0.7-composition-observation-contract.md).
The shared reference fixtures are recorded under
[`examples/composition/draft-0.7`](../../examples/composition/draft-0.7/).
They are reference application fixtures and are not part of the Core
conformance manifest.

## Milestone C Status

Milestone C adds independent reference profile implementations in TypeScript,
Python, and Java under the language-specific `examples/composition/draft-0.7/`
paths. The implementations execute the 20 shared scenarios through real Core
APIs and keep profile-local policy outside Core packages, adapters, and the
runner.

Reference scenario verification on September 18, 2026:

| Command | Result |
| --- | --- |
| `npm run composition:test:draft0.7` | Initial sandboxed combined run passed fixture, TypeScript, and Python stages, then failed Java compilation with `spawnSync .tools/bin/javac EPERM`; escalated rerun PASS |
| `npm run composition:check:draft0.7` | PASS: 20 scenarios |
| `npm run composition:typescript:draft0.7` | PASS: strict TypeScript example compile and 20/20 Vitest scenario checks |
| `npm run composition:python:draft0.7` | PASS: Python unittest scenario check over 20 shared scenarios |
| `npm run composition:java:draft0.7` | PASS after Java local-toolchain escalation: compiled 9 Java source files and 9 test files, including the composition profile/test |

This evidence does not create a new Core conformance profile or a Draft 0.7
release claim. Coverage, mutation hardening, cross-language result comparison,
and final claim closure remain later Draft 0.7 gates.
