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
evidence. A clean committed-checkout reproduction remains required before
closure.

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
| `D07-TOOLING-258-001` | `TOOLING/CLAIM DEFECT` | OPEN | Release/conformance maintainers | Draft 0.7 opening evidence and future release claims | Blocks claiming TASK-258 clean-checkout acceptance and blocks Draft 0.7 closure evidence; does not change financial behavior, requirements, vectors, errors, operations, or Draft 0.6 historical evidence | Milestone A profile runs passed from revision `ad2942179271f65234527d73fca020efa1df443c`, but the workspace already contained modified documentation and the Draft 0.7 plan was untracked | Rerun the required opening verification from a clean committed checkout after Milestone A documentation is committed | Pending |

## Current Claim Boundary

Draft 0.7 currently claims no new Core behavior and no new closed conformance
profile. The opening evidence only confirms that the existing
`finkore.core.draft0_6.full` profile still passes in TypeScript, Python, and
Java from the qualified workspace state described above.

Reference application scenario results, when later implemented, will be
reported separately from normative Core conformance.
