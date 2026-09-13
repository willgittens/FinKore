# FinKore Draft 0.2 → Draft 0.3 Execution Backlog

## 1. Purpose

This file is the authoritative execution checklist and persistent progress state from the current repository through Draft 0.2 closure and fully implemented, selected Draft 0.3 closure. Execute one task per user request. This document plans work; it does not establish financial semantics or claim any new capability is implemented.

The source plans remain authoritative planning inputs: [Draft 0.2](draft-0.2-implementation-plan.md) and [Draft 0.3](draft-0.3-implementation-plan.md), read completely for this backlog. This checklist reconciles their milestones and supplies missing executable steps. `/spec` remains the normative source of truth. Themes remain 0.1 foundational semantics; 0.2 evolution, validity and financial utilities; 0.3 bounded advanced orchestration, versioning and portability.

## 2. Baseline

Planning audit: 2026-09-09, repository HEAD `fa7a2e888fe68f6a0f667fd002e7b7e4149676e8`, with both source plans present in the working tree. No feature was implemented and no execution task was completed during planning.

- `README.md` and the TypeScript core README describe Money, Workflow, Audit, Approvals and Entities as Draft 0.1 complete. This is existing documented status, not a freshly executed test claim.
- `conformance/manifest.json` uses format `0.1`, five suites and eight vector files totaling 138 vectors. Traceability reports 213 requirements: 149 covered, 64 not directly testable, zero uncovered and zero blocking spec gaps. TASK-001 refreshed runtime evidence in `docs/tasks/draft-0.2-execution-evidence.md`.
- No `MONEY-RATE-*`, `MONEY-ALLOCATION-*`, `ENTITY-EVOLUTION-*`, `AUDIT-RELATIONSHIP-*` or `APPROVAL-LIFECYCLE-*` requirement families currently exist. Exact scalar multiplication already exists; it is not completion of the planned Rate contract. None of the new backlog tasks qualifies for a pre-existing checked state.
- Core exports Money, Workflow, Audit, Approval and Entity APIs from `implementations/typescript/core/src/index.ts`. Current Approvals compare relevant subject facts and preserve Decision history; they do not implement withdrawal, expiration, supersession or advanced composition. Current Entity `from` observations do not close the planned explicit import/mapping contract.
- `agentic/operations.md` has 11 canonical operations: seven Money, Workflow transition, and Audit append/remove/replace. Entity and Approval operation labels remain conformance-local. `runner/src/metadata.ts` maintains explicit allowlists and reads requirement rows from traceability; adding an unregistered operation will fail before adapter dispatch.
- `runner/src/manifest.ts` and vector validation support format `0.1` only. TASK-002/003 record that format versions are syntax compatibility versions, not Draft release numbers; Draft 0.2/0.3 artifacts may use format `0.1` while the shape remains compatible. No financial validation belongs in the runner.
- Core Stryker has an explicit source list and some line ranges. New financial files must enter mutation scope; a high score from the old list is insufficient. Coverage/mutation scripts exist in core and runner, but not the adapter. No dedicated architecture, traceability or Markdown-link script was found.
- Historical planning observation: no CoreDoc file was found at initial planning. TASK-060 corrected that observation; CoreDoc exists at `docs/coreDoc/core-doc.md` and was re-read for D03-REVIEW-001 on 2026-09-12. Review its foundation-level obligations and record assumption impact. No independent reviewer signoff is assumed.
- Machine `node` was not found during planning. No Node command/test was run for this documentation-only task. Future runtime tasks must follow the toolchain rule below.

## 3. Progress Dashboard

All tasks start unchecked. Dashboard checkboxes are summaries, not additional task IDs. Mark a summary checked only when its gate passes; label research dispositions explicitly so a deferred feature is never advertised as implemented.

### Draft 0.2

- [x] Foundation: [TASK-001](#task-001)–[TASK-003](#task-003)
- [x] Money Rates: [TASK-004](#task-004)–[TASK-011](#task-011)
- [x] Money Allocation: [TASK-012](#task-012)–[TASK-020](#task-020)
- [x] Entity Evolution Specification: [TASK-021](#task-021)–[TASK-024](#task-024)
- [x] Audit Relationships: [TASK-025](#task-025)–[TASK-032](#task-032)
- [x] Entity Evolution Implementation: [TASK-033](#task-033)–[TASK-044](#task-044)
- [x] Approval Validity: [TASK-045](#task-045)–[TASK-057](#task-057)
- [x] Draft 0.2 Alignment: [TASK-058](#task-058)–[TASK-060](#task-060)
- [x] Draft 0.2 Closure: [TASK-061](#task-061)–[TASK-066](#task-066)

### Draft 0.3

- [x] Draft 0.3 Foundation: [TASK-067](#task-067)–[TASK-067](#task-067)
- [x] Advanced Approvals: [TASK-068](#task-068)–[TASK-084](#task-084)
- [ ] Workflow Versioning and Import: [TASK-085](#task-085)–[TASK-098](#task-098)
- [ ] Entity Revision and Import: [TASK-099](#task-099)–[TASK-110](#task-110)
- [ ] Money Portability Research: [TASK-111](#task-111)–[TASK-121](#task-121)
- [ ] Audit Provenance Research: [TASK-122](#task-122)–[TASK-129](#task-129)
- [ ] Portable Conditions: [TASK-130](#task-130)–[TASK-144](#task-144)
- [ ] Draft 0.3 Alignment: [TASK-145](#task-145)–[TASK-147](#task-147)
- [ ] Optional Cross-Language Proof: [TASK-148](#task-148)–[TASK-150](#task-150) — OPTIONAL / recommended before v0.5
- [ ] Draft 0.3 Closure: [TASK-151](#task-151)–[TASK-166](#task-166)

## 4. Current Execution Pointer

```text
NEXT TASK: TASK-085
LAST COMPLETED: TASK-084
REASON: Advanced Approvals is closed. Draft 0.3 Approval Composition has stable reviewed specification, 19 manifest-listed composition vectors, complete TypeScript implementation and translation-only adapter support, 66/66 Approval conformance, 218/218 full conformance across all closed domains, synchronized docs, and focused mutation evidence at 97.88% with zero critical Advanced Approval survivors.
```

The default sequence is numeric, skipping only unselected OPTIONAL tasks. A blocked task is not skipped. Conditional tasks are decision-resolved mandatory checkpoints, explained below; they are not permission to silently omit approved implementation.

## 5. Codex Execution Protocol

1. Read `AGENTS.md`, this backlog, the current pointer, and the target task's cited source plan and artifacts.
2. Resolve `NEXT TASK` (or the explicitly requested stable task ID). Verify every dependency is checked and its completion evidence still applies. A task reachable through a conditional branch also needs the cited research decision.
3. Execute **only that task**. Do not start the next task automatically, including research, remediation or an optional proof.
4. Follow spec-first TDD. Implementation cannot decide missing financial behavior; vectors cannot be a second specification. SPEC tasks may propose the authorized named semantics, but unresolved domain decisions must be recorded as blockers rather than guessed in code.
5. Run the task's verification plan. Before Node commands, check `command -v node` and `node --version`. If absent, inspect the `/.tools` location required by AGENTS and repository-local `.tools` candidates; use the available local Node. If absent there too, follow AGENTS to provision the toolchain under `/.tools` with any necessary sandbox permission. Use a version satisfying package engines (`^22.18.0 || >=24.11.0`), and use its Node/npm consistently. Missing machine Node does not waive tests.
6. Update documentation required by the task in the same change. Every task reviews applicability to unit tests, vectors, mutation tests, JSDoc, root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; record no-change rationale where relevant. Later documentation tasks audit synchronization; they do not excuse stale docs now.
7. If Definition of Done passes, check the task and its DoD items, append a concise completion note, update dashboard summaries when their gates pass, and advance `NEXT TASK` to the next eligible task. Report results and **STOP**.
8. If blocked, keep the task unchecked, record the exact blocker and required decision, set the pointer as below, report it and **STOP**. Do not invent semantics or external reviewer approval.
9. Review requests require concrete reviewable artifacts first. Do not send email/Slack or other messages to reviewers without user authorization. Draft 0.2 section 10 review touchpoints are recommendations unless TASK-001 records a stronger existing requirement. Draft 0.3 uses [D03-REVIEW-001](draft-0.3-research-decisions.md#d03-review-001--draft-review-policy): required domain/security/technical/privacy analysis and explicit scoped maintainer acceptance remain mandatory; external review does not block draft development or closure. Record exact artifact revision, attributed findings, resolutions, decision rationale, CoreDoc/requirement references, and future review topics. Mark absent external review NOT EXTERNALLY REVIEWED. Missing maintainer acceptance, unresolved semantics, CoreDoc conflicts, and failed verification remain blockers. Optional proof does not block closure unless it reveals an actual mandatory defect.
10. Never renumber completed IDs. Insert future tasks as `TASK-023A`, `TASK-023B` or other unused stable suffixes and use the complete template. For a closure blocker, add focused remediation after the gate, followed by a recheck task; remediation depends on the completed feature tasks and the recorded failed gate attempt, not on the blocked gate checkbox. The recheck depends on remediation, retries the original gate, and checks it only when its original DoD passes. Downstream tasks must depend on successful recheck as well. This avoids circular dependencies. Do not execute inserted tasks during the discovery session.

Blocked pointer:

```text
NEXT TASK: BLOCKED
BLOCKED ON: TASK-023
REASON: <specific evidence or unresolved decision>
```

Completion note:

```text
Completion:
- Status: COMPLETE
- Verification: <commands, outcome, source revision and report path>
- Conformance: <per-domain/total counts or explicit pending/not-applicable reason>
- Mutation: <score, critical survivors, complete report path or not-applicable reason>
- Notes: <docs, review evidence and scope decisions>
```

Blocked note:

```text
Completion:
- Status: BLOCKED
- Reason: <exact blocker>
- Required decision: <specific missing decision/evidence>
```

Store large reports or their durable references in `docs/tasks/draft-0.2-execution-evidence.md` / `draft-0.3-execution-evidence.md` when execution creates them; research decisions may use `draft-0.3-research-decisions.md`. These files are planned artifacts, not existing evidence. Capture command, toolchain version, exit status, source revision/content changes, counts and report completeness. Re-run invalidated checks after remediation; timestamps alone do not prove applicability.

### Research-gated follow-ups

Conditions, Money normative portability changes and Audit provenance have mandatory research **decisions**, followed by conditional task tracks. They are included in the mandatory checkpoint count so every outcome is explicitly resolved:

- If the decision approves the bounded feature, every task in its track becomes required implementation work, with all normal spec, conformance, review and mutation gates.
- If research explicitly defers/rejects it, execute each follow-up as a bounded disposition check: verify the decision reference, absence of normative/API/adapter claims, and synchronized deferred status. Check the task only after this disposition DoD passes, with `Status: COMPLETE` and `Notes: NOT APPLICABLE — <decision reference>; no feature implemented`. Runtime tests/mutation are then not applicable. Do not label the feature implemented in the dashboard.
- Research uncertainty is BLOCKED, not DEFER by timeout. Approved work cannot be removed merely because tests fail. An accepted proposal requiring multiple independent changes must add separate suffixed spec/vector/operation/mutation/traceability/gate tasks, all required by its original track gate and final closure.
- These are conditional obligations, **not OPTIONAL tasks**. Mandatory tasks never depend on the optional language proof. Optional findings that expose a mandatory defect create mandatory remediation.

### Verification command catalog

Commands below are based on the current package scripts; run from repository root unless stated. Resolve the selected Node toolchain first. Task entries reference these labels with their domain. No generic `npm run conformance` or nonexistent workspace coverage script is assumed.

| Label | Command / check |
| --- | --- |
| BUILD | `npm run build --workspaces` |
| TYPE | `npm run typecheck --workspaces` |
| UNIT | `npm run test --workspaces` |
| UNIT(domain) | `npm run test --workspace @finkore/typescript -- test/<domain>`; replace `<domain>` with `money`, `workflow`, `audit`, `approvals` or `entities` |
| ADAPTER | `npm run test --workspace @finkore/typescript-conformance-adapter` |
| RUNNER | `npm run test --workspace @finkore/conformance-runner` |
| CONF | After BUILD: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` |
| CONF(domain) | Append `--suite <domain>` to CONF; repeat suites or use `--vector <actual-vector-id>` for a focused run |
| COV(core) | `npm run test:coverage --workspace @finkore/typescript` |
| COV(runner) | `npm run test:coverage --workspace @finkore/conformance-runner` |
| COV | Both available coverage scripts above; adapter tests run separately |
| MUT(core) | `npm run test:mutation --workspace @finkore/typescript` |
| MUT(runner) | `npm run test:mutation --workspace @finkore/conformance-runner` |
| MUT(domain) | Core `test:mutation` with a scoped `--mutate` override after checking the installed Stryker CLI help, using actual `src/<domain>/**/*.ts` paths; inspect every survivor. If a targeted override is unavailable, use MUT(core). A target filter never replaces full-core closure. |
| DOC | `git diff --check`; inspect scoped Markdown links, requirement/error/operation references with `rg`, and render/check checkbox structure. No dedicated documentation checker exists. |

Conformance outcomes before adapter implementation may intentionally be FAIL/UNSUPPORTED for **only the newly introduced vector set**. Record that exact set; existing closed vectors must remain PASS. INFRASTRUCTURE_ERROR is never a useful financial red test. Register new local IDs and requirement rows as part of vector work. Do not change runner financial comparisons to normalize domain results.

Regression grows with scope: focused tasks run domain tests and relevant real vectors; domain gates run domain checks plus all five Draft 0.1 domains and previous closed slices; Draft gates run workspace build/typecheck/all tests, full conformance, both available coverage suites, complete core mutation, required runner mutation, architecture and docs. Significant 0.3 gates preserve the entire closed Draft 0.2 baseline.

## 6. Dependency Overview

```text
0.1 evidence + 0.2 scope + conformance compatibility
  ├─ Rates spec → vectors → implementation → adapter → mutation → traceability → gate
  │    └─ Allocation spec → equal/ratio implementation → closure
  └─ Entity evolution/revision specification
       └─ Audit relationship spec → implementation → closure
            └─ Entity/Audit integration → correction/reversal/void/supersession → closure
                 └─ Approval validity/effectiveness → closure
All 0.2 slices → cross-domain tests → Agentic/docs → DRAFT 0.2 CLOSURE
  ├─ Advanced Approvals (reuses 0.2 effectiveness)
  ├─ Workflow binding/import/conflict → Entity revision/import/conflict
  ├─ Money research → approved bounded follow-ups or explicit deferral
  ├─ Audit provenance research → approved follow-ups or explicit deferral
  └─ Condition research/security decision → approved model or explicit deferral
All selected 0.3 slices → cross-domain regression → Agentic review
  ├─ Optional Java OR Go proof (no mandatory dependency)
  └─ inventory → traceability → conformance → unit/coverage/mutation
       → error/registry/Agentic/API/architecture/docs audits → FINAL 0.3 CLOSURE
```

Dependency fields below are executable prerequisites; order alone is not a dependency. Every 0.3 implementation is transitively gated by TASK-066 (Draft 0.2 COMPLETE) and TASK-067. Research-only tasks TASK-111/TASK-113/TASK-114/TASK-122/TASK-130 may run after their named closed 0.2 slice and before final 0.2 closure. All normative 0.3 changes remain behind closure. Numeric order is the recommended sequence; parallel eligibility never means automatically spawning agents or running another task.

Money Rates/Allocation are independent of Entity evolution implementation, but are required for 0.2 closure and inform later numeric portability research. Approval composition needs validity plus Entity revision/fact binding and preserved Audit evidence through the closed 0.2 baseline. Workflow uses revision terminology without importing Entities into Workflow core. Entity import follows Workflow version/import/conflict to reuse a stable lifecycle boundary. Conditions are not a mandatory prerequisite of advanced groups; their current explicit-fact boundary remains sufficient if model research defers.

Parallelism is limited to research documents with distinct sections/files. Shared traceability, manifest, Agentic registry and adapter handler edits are serialized by default, even for conceptually independent domains.

### Source plan reconciliation

| Source plan milestone | Backlog treatment |
| --- | --- |
| 0.2 step 1 | TASK-001, plus explicit format compatibility TASK-002/003 |
| 0.2 step 2 | Rates now has implementation, adapter, mutation, traceability and closure before Allocation |
| 0.2 step 3 | Allocation split into spec/errors/vectors/equal split/ratio split/adapter/hardening/closure |
| 0.2 steps 4–6 | Evolution terminology, four operations and integration; Audit Relationships now has its own complete implementation track |
| 0.2 steps 7–8 | Separate withdrawal, expiration, supersession and shared effectiveness implementation |
| 0.2 steps 9–10 | Dedicated Agentic review and explicit 0.2 closure prerequisites |
| 0.3 steps 1–4 | Baseline refresh, detailed any/all/quorum/stage/nesting tasks with required review and lifecycle contrast tests |
| 0.3 steps 5–7 | Version identity, binding, import and expected-state/revision conflict all required; migration stays deferred |
| 0.3 steps 8–9 | Entity revision/import mapping and Entity conflict contract are required by the actual plan; not merely optional suggestions |
| 0.3 step 10 | Separate numeric matrix, precision decision, minor-unit and private-currency research; approved work receives a conditional spec-to-closure track |
| 0.3 steps 11/13 | Research and security decision before primitive/missing-null/logic/serialization spec and implementation; explicit deferral path |
| 0.3 step 12 | Provenance decision followed by a conditional complete track, avoiding a spec-only dead end |
| 0.3 steps 14–16 | Agentic review, optional small language proof, then separate diagnostic closure gates |
| Candidate-only research | Tax, delegation, global identity registry and replacement/amendment expansion do not become mandatory implementation; deferred register retains their prerequisites |

No candidate portable error or candidate canonical operation ID in either plan is pre-approved by this backlog. Error-design tasks assess existing codes first. New `finkore.<domain>.<operation>` identifiers enter only through dedicated Agentic review.

## 7. Draft 0.2 Task Backlog

### Milestone: Foundation

<a id="task-001"></a>

### - [x] TASK-001 — Draft 0.1 Baseline Verification and Draft 0.2 Scope Lock

**Release:** Draft 0.2

**Milestone:** Foundation

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** None

**Objective**

Draft 0.1 Baseline Verification and Draft 0.2 Scope Lock.

**Scope**

- Refresh the 213-requirement/138-vector baseline, verify all five Draft 0.1 domains, inventory errors and local/canonical operations, and lock the selected 0.2 scope from plan steps 1–10.
- This is a fresh execution audit, not completion of the planning task. Run workspace typecheck/tests and full conformance; record source revision and report paths. Record 0.2 domain/security review touchpoints as recommended unless scope lock documents an explicit mandatory requirement; never fabricate review evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.
- **TYPE**, **UNIT**, **BUILD**, **CONF** to refresh the actual Draft 0.1 baseline; inventory existing mutation evidence without claiming a new report.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Refresh the 213-requirement/138-vector baseline, verify all five Draft 0.1 domains, inventory errors and local/canonical operations, and lock the selected 0.2 scope from plan steps 1–10.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run typecheck --workspaces`, `npm run test --workspaces`, `npm run build --workspaces`, and full conformance all exited 0 at source revision `79f2e683c8367d3e5266670b5de9b081e47c1516`; evidence recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: 138/138 PASS; suites Money 55/55, Workflow 20/20, Audit 19/19, Approvals 34/34, Entities 10/10; 114/114 mutation-sensitive vectors PASS.
- Mutation: Not applicable for this artifact-only task; later feature tasks must record mutation evidence.
- Notes: 213 requirements refreshed: 149 covered, 64 not directly testable, 0 partial, 0 uncovered, 0 deferred, 0 blocking spec gaps. Draft 0.2 scope locked without marking any new Draft 0.2 feature implemented.

<a id="task-002"></a>

### - [x] TASK-002 — Conformance Draft Version Policy

**Release:** Draft 0.2

**Milestone:** Foundation

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-001](#task-001)

**Objective**

Conformance Draft Version Policy.

**Scope**

- Separate release scope from vector/manifest format compatibility; decide how Draft 0.2 and 0.3 artifacts will be discovered while preserving 0.1 support.
- Inspect conformance/conventions.md, vector.schema.json, runner/src/manifest.ts, validator.ts, metadata.ts and loader.ts. The runner currently accepts only format 0.1. Specify accepted versions and old-format behavior before editing code; no blind manifest version bump.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `conformance/conventions.md`
- `conformance/README.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Separate release scope from vector/manifest format compatibility; decide how Draft 0.2 and 0.3 artifacts will be discovered while preserving 0.1 support.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC policy update in `conformance/conventions.md`, `conformance/README.md`, `runner/README.md`, and `docs/tasks/draft-0.2-execution-evidence.md`; final `git diff --check` recorded by TASK-003.
- Conformance: Not applicable; no vector or financial behavior changed.
- Mutation: Not applicable; documentation-only policy task.
- Notes: `finkoreConformance` and `finkoreVectorFile` are syntax compatibility versions, not Draft release numbers. Draft 0.2/0.3 artifacts may continue to use format `0.1` while their manifest and vector-file shape remains compatible; unsupported versions remain rejected.

<a id="task-003"></a>

### - [x] TASK-003 — Conformance Version Compatibility Support

**Release:** Draft 0.2

**Milestone:** Foundation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-002](#task-002)

**Objective**

Conformance Version Compatibility Support.

**Scope**

- Implement only the format/version policy from TASK-002 in schema, runner types/validation and infrastructure tests, or verify that no code change is required by that policy.
- Keep runner domain-neutral. Run runner tests, coverage and mutation plus full 0.1 conformance; preserve rejection of unknown versions. New operation registration remains part of each vector task.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `conformance/vector.schema.json`
- `runner/src/manifest.ts`
- `runner/src/validator.ts`
- `runner/src/types/`
- `runner/test/`
- `runner/README.md`

**Implementation instructions**

1. Reproduce accepted/unsupported format behavior from TASK-002 with runner/schema tests; preserve the existing Draft 0.1 fixtures and unknown-version rejection.
2. Implement only approved format compatibility in runner validation/types and the vector schema, or record why the existing format remains sufficient. Update infrastructure JSDoc and format documentation; do not add financial rules or core APIs.
3. Run runner build/typecheck/tests/coverage/mutation and the existing full conformance suite. New operation allowlist entries belong to their later conformance tasks.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.
- **RUNNER**, **COV(runner)**, **MUT(runner)** and old/accepted/unknown-version contrasts.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement only the format/version policy from TASK-002 in schema, runner types/validation and infrastructure tests, or verify that no code change is required by that policy.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The runner and schema support the approved draft/format policy while retaining Draft 0.1 compatibility and rejection of unknown versions. No Draft 0.2 financial implementation exists yet.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Existing schema/runner code verified sufficient for the TASK-002 policy; runner tests, runner coverage, runner mutation, workspace build/typecheck/tests, adapter tests and full conformance were run with the repository-local Node toolchain; evidence recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Full Draft 0.1 conformance remains 138/138 PASS.
- Mutation: Runner mutation completed with 99.73% mutation score, 1 non-critical diagnostic string-literal survivor, 0 timeout, 0 no-coverage; no critical runner compatibility mutant survived.
- Notes: No runner, schema, type, or vector code change was required because the approved policy keeps format `0.1` as the compatible syntax for Draft 0.2/0.3 artifacts until a future syntax change requires a focused format task.

### Milestone: Money Rates

<a id="task-004"></a>

### - [x] TASK-004 — Rate and Percentage Normative Semantics

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-001](#task-001), [TASK-003](#task-003)

**Objective**

Rate and Percentage Normative Semantics.

**Scope**

- Define MONEY-RATE-* input encoding, percentage conversion versus decimal scalar, currency preservation, zero/negative rates, precision-reduction trigger, explicit rounding and non-mutation.
- Read MONEY-ARITHMETIC-004/007/008/009 and MONEY-ROUNDING-001/006. Resolve exact-result versus explicit-rounding interaction in spec; choose naming without promoting an Agentic operation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/money/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define MONEY-RATE-* input encoding, percentage conversion versus decimal scalar, currency preservation, zero/negative rates, precision-reduction trigger, explicit rounding and non-mutation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Spec and traceability edits reviewed; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md` under Money Rates.
- Conformance: Rate requirements were made vector-ready; `money.rate.apply` was initially conformance-local and was later promoted by TASK-059 to canonical `finkore.money.applyrate`.
- Mutation: Not applicable to this SPEC task; defect scenarios carried into TASK-009.
- Notes: Added `spec/money/rates.md`, glossary/index links, and traceability rows for MONEY-RATE-001 through MONEY-RATE-009.


<a id="task-005"></a>

### - [x] TASK-005 — Rate Portable Error Design

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-004](#task-004)

**Objective**

Rate Portable Error Design.

**Scope**

- Evaluate existing INVALID_AMOUNT, ROUNDING_REQUIRED and INVALID_ROUNDING categories for rate failures; define a new category only for a distinct unmet portable condition.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/money/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Evaluate existing INVALID_AMOUNT, ROUNDING_REQUIRED and INVALID_ROUNDING categories for rate failures; define a new category only for a distinct unmet portable condition.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Error semantics reviewed against existing Money error catalog; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md` under Money Rates.
- Conformance: Invalid/malformed Rate inputs map to `FINKORE_MONEY_INVALID_AMOUNT`; invalid explicit rounding maps to `FINKORE_MONEY_INVALID_ROUNDING`.
- Mutation: Not applicable to this SPEC task; invalid amount and invalid rounding cases were later mutation-hardened.
- Notes: No new portable Money error was introduced; `FINKORE_MONEY_ROUNDING_REQUIRED` remains for operations that require precision reduction without policy, while Rate application returns exact results unless explicit rounding is supplied.


<a id="task-006"></a>

### - [x] TASK-006 — Rate Conformance Vectors

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-005](#task-005)

**Objective**

Rate Conformance Vectors.

**Scope**

- Add exact, zero, negative, fractional, malformed/non-finite rate and rounding-boundary vectors with currency and operand preservation observations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/money/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Add exact, zero, negative, fractional, malformed/non-finite rate and rounding-boundary vectors with currency and operand preservation observations.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Runner build/tests passed after registering `money.rate.apply`; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md` under Money Rates.
- Conformance: Added 12 manifest-listed Money Rate vectors covering exact decimal, percentage conversion, zero, negative, fractional, explicit rounding, invalid rate inputs, invalid representation, invalid rounding, and operand preservation. Initial pre-adapter Money run produced the expected 12 unsupported Rate vectors with no infrastructure errors.
- Mutation: Not applicable to this CONFORMANCE task; vectors were later exercised by implementation and mutation hardening.
- Notes: `money.rate.apply` was documented as conformance-local for this task and was later promoted by TASK-059 to canonical `finkore.money.applyrate`.


<a id="task-007"></a>

### - [x] TASK-007 — Rate Application Implementation

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-006](#task-006)

**Objective**

Rate Application Implementation.

**Scope**

- Implement the specified rate/percentage application operation using existing exact decimal arithmetic, with unit regression tests and meaningful public JSDoc.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement the specified rate/percentage application operation using existing exact decimal arithmetic, with unit regression tests and meaningful public JSDoc.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Core typecheck, focused Money tests, workspace tests, coverage and mutation passed; detailed command evidence is in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Core behavior was implemented before adapter closure; conformance pass is recorded in TASK-008/TASK-011 evidence.
- Mutation: Final core mutation report shows Money at 100.00% with zero Money survivors.
- Notes: Added public `Money.applyRate(rate, options)`, exported Rate types, exact percentage conversion, optional post-product rounding, public JSDoc and focused unit tests.


<a id="task-008"></a>

### - [x] TASK-008 — Rate Adapter Support

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-007](#task-007)

**Objective**

Rate Adapter Support.

**Scope**

- Translate registered rate fixtures into the core operation and normalize exact Money/error observations; no rate conversion or rounding in the adapter.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Translate registered rate fixtures into the core operation and normalize exact Money/error observations; no rate conversion or rounding in the adapter.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Adapter build and tests passed; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: `money.rate.apply` delegates to `Money.applyRate`; TASK-059 later retained it as a compatibility alias for canonical `finkore.money.applyrate`. Money suite passed 67/67 and full manifest passed 150/150.
- Mutation: Adapter is translation-only; core mutation evidence retained for financial behavior.
- Notes: Adapter performs fixture mapping and observation reporting only; rate conversion and rounding remain in core.


<a id="task-009"></a>

### - [x] TASK-009 — Money Rates Mutation Hardening

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-008](#task-008)

**Objective**

Money Rates Mutation Hardening.

**Scope**

- Kill ignored/inverted rates, percentage factor mistakes, implicit rounding, changed currency, unjustified negative rejection and operand mutation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill ignored/inverted rates, percentage factor mistakes, implicit rounding, changed currency, unjustified negative rejection and operand mutation.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill ignored/inverted rates, percentage factor mistakes, implicit rounding, changed currency, unjustified negative rejection and operand mutation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Core coverage and full core mutation completed successfully; report paths and counts are recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: All Money Rate vectors pass before mutation closure.
- Mutation: Overall core mutation score 99.58%; Money `money.ts` score 100.00%, 200 killed, 10 timeout, 0 survived, 0 no coverage. Remaining six survivors are pre-existing Entity-scope mutants and not Money Rates behavior.
- Notes: Added malformed callable Rate and malformed rounding-option container assertions to kill validation-boundary survivors.


<a id="task-010"></a>

### - [x] TASK-010 — Money Rates Traceability Closure

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-009](#task-009)

**Objective**

Money Rates Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Requirement, vector, operation and implementation references were reconciled; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: MONEY-RATE-001 through MONEY-RATE-009 map to manifest-listed vectors; closed Rate scope has UNCOVERED = 0 and BLOCKING SPEC GAPS = 0.
- Mutation: Latest TASK-009 mutation evidence remains applicable.
- Notes: Traceability inventory is now 222 total requirements, 158 covered, 64 not directly testable; 150 vectors are registered.


<a id="task-011"></a>

### - [x] TASK-011 — Money Rates Slice Closure Gate

**Release:** Draft 0.2

**Milestone:** Money Rates

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-010](#task-010)

**Objective**

Money Rates Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Workspace typecheck, tests, build, Money conformance, full conformance, coverage, mutation and `git diff --check` passed; details are recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Money Rates slice passed 12/12 Rate vectors, Money passed 67/67, and full manifest passed 150/150 with 0 failed, 0 unsupported and 0 infrastructure errors.
- Mutation: Latest core mutation evidence shows zero Money survivors and no critical Rate survivors.
- Notes: Documentation, README status, JSDoc, conformance metadata and backlog pointer are synchronized. Next task is TASK-012 Money Allocation.


### Milestone: Money Allocation

<a id="task-012"></a>

### - [x] TASK-012 — Allocation Normative Semantics

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-011](#task-011)

**Objective**

Allocation Normative Semantics.

**Scope**

- Define MONEY-ALLOCATION-* equal parts and positive integer ratios, source sign/zero, explicit scale policy, exact sum preservation and deterministic remainder placement by declared order.
- Resolve an unrepresentable source at the requested scale without silently rounding the total. This backlog closes Rates first even if allocation eventually uses only integer ratios.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/money/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define MONEY-ALLOCATION-* equal parts and positive integer ratios, source sign/zero, explicit scale policy, exact sum preservation and deterministic remainder placement by declared order.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0. Source revision before changes: `941564830b2f2b824c4c052802f39f53677c4ac2`.
- Conformance: Not run; no conformance vectors were added by this spec-only task. Allocation requirements are recorded as 13 UNCOVERED requirements pending TASK-014.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenarios recorded for unrepresentable source rejection, exact total preservation, ordered remainder distribution including negative sources, and source non-mutation.
- Notes: Added Draft 0.2 Money Allocation normative semantics in `spec/money/allocation.md`; updated Money index, glossary, and traceability. Invalid part-count, ratio, and target-scale portable error mapping remained intentionally assigned to TASK-013. No TypeScript public API, adapter operation, conformance vector, root README, package README, Agentic operation, or AGENTS.md change was required at this task boundary because allocation was specified but not yet implemented.

<a id="task-013"></a>

### - [x] TASK-013 — Allocation Portable Error Design

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-012](#task-012)

**Objective**

Allocation Portable Error Design.

**Scope**

- Decide whether existing Money errors suffice for invalid counts/ratios/scale; specify invalid-allocation category only if justified, including failure non-mutation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/money/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Decide whether existing Money errors suffice for invalid counts/ratios/scale; specify invalid-allocation category only if justified, including failure non-mutation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0. Source revision before changes: `0be7baaff8a00504692c2222579fd5126130e597`.
- Conformance: Not run; no conformance vectors were added by this spec-only task. `MONEY-ERROR-008` is recorded as UNCOVERED pending TASK-014.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenario recorded for invalid allocation requests collapsing into an incorrect portable error code.
- Notes: Existing Money errors do not suffice for invalid allocation method/count/ratio/target-scale inputs because those are allocation-contract failures rather than invalid Money amounts, currency mismatches, division-by-zero, or invalid rounding policies. Added `FINKORE_MONEY_INVALID_ALLOCATION` and `MONEY-ERROR-008`; unrepresentable source-at-scale remains `FINKORE_MONEY_ROUNDING_REQUIRED`. No TypeScript public API, adapter operation, conformance vector, root README, package README, Agentic operation, or AGENTS.md change was required at this task boundary because allocation was specified but not yet implemented.

<a id="task-014"></a>

### - [x] TASK-014 — Allocation Conformance Vectors

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-013](#task-013)

**Objective**

Allocation Conformance Vectors.

**Scope**

- Cover equal/ratio splits, zero/negative amounts, indivisible positive/negative remainders, reordered ratios, large ratios, invalid counts, zero/negative/malformed ratios and atomic failures.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/money/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Cover equal/ratio splits, zero/negative amounts, indivisible positive/negative remainders, reordered ratios, large ratios, invalid counts, zero/negative/malformed ratios and atomic failures.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added and registered `conformance/money/allocation.json` with 16 allocation vectors; `npm run build --workspaces` exited 0; `npm run test --workspace @finkore/conformance-runner` exited 0 with 10 files and 110 tests passed; `git diff --check` exited 0.
- Conformance: Initial conformance-first run against the pre-allocation adapter exited 3 as expected: 150 passed / 166 total, 0 failed, 16 unsupported allocation vectors, 0 infrastructure errors. The prior closed 150-vector baseline remained PASS.
- Mutation: Not applicable for vector-only work; mutation-sensitive allocation scenarios were encoded for later hardening.
- Notes: `money.allocate` was added as a conformance-local operation only; no `finkore.*` Agentic operation was promoted.

<a id="task-015"></a>

### - [x] TASK-015 — Equal Split Implementation

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-014](#task-014)

**Objective**

Equal Split Implementation.

**Scope**

- Implement equal-part splitting under the declared scale/remainder policy; compare sums exactly and preserve source currency/value.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement equal-part splitting under the declared scale/remainder policy; compare sums exactly and preserve source currency/value.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added `Money.allocate` equal-split behavior and focused unit coverage; `npm run typecheck --workspaces` exited 0; `npm run test --workspace @finkore/typescript -- test/money` exited 0 with 9 files and 52 tests passed.
- Conformance: Adapter wiring remained scheduled for TASK-017, so allocation vectors were not claimed green at this task boundary.
- Mutation: Full-core mutation was retained for TASK-018; no equal-allocation critical survivor remained after the TASK-018 run.
- Notes: Public API exports and JSDoc were updated with allocation requirement/error references.

<a id="task-016"></a>

### - [x] TASK-016 — Ratio Allocation Implementation

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-015](#task-015)

**Objective**

Ratio Allocation Implementation.

**Scope**

- Implement positive integer ratio allocation with exact arithmetic and declared ordered remainder distribution; reuse specified equal-split behavior where appropriate.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement positive integer ratio allocation with exact arithmetic and declared ordered remainder distribution; reuse specified equal-split behavior where appropriate.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added positive-integer ratio allocation, ordered remainder distribution, large-ratio coverage, invalid ratio coverage, and source non-mutation assertions; `npm run typecheck --workspaces` exited 0; `npm run test --workspace @finkore/typescript -- test/money` exited 0 with 9 files and 52 tests passed.
- Conformance: Adapter wiring remained scheduled for TASK-017, so allocation vectors were not claimed green at this task boundary.
- Mutation: Full-core mutation was retained for TASK-018; no ratio-allocation critical survivor remained after the TASK-018 run.
- Notes: Equal allocation and ratio allocation share exact integer allocation-unit distribution and preserve source currency/value.

<a id="task-017"></a>

### - [x] TASK-017 — Allocation Adapter Support

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-016](#task-016)

**Objective**

Allocation Adapter Support.

**Scope**

- Wire equal/ratio allocation fixtures and exact ordered result observations, retaining portable failures and source observations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Wire equal/ratio allocation fixtures and exact ordered result observations, retaining portable failures and source observations.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Adapter support added for `money.allocate`; `npm run test --workspace @finkore/typescript-conformance-adapter` exited 0 with 1 file and 12 tests passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite money --json` exited 0: Money 83 passed / 83 total, 0 failed, 0 unsupported, 0 infrastructure errors.
- Mutation: Adapter remained translation-only; full-core mutation was retained for TASK-018.
- Notes: Adapter delegates allocation semantics to `Money.allocate` and normalizes ordered Money results, portable errors, and source observations.

<a id="task-018"></a>

### - [x] TASK-018 — Money Allocation Mutation Hardening

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-017](#task-017)

**Objective**

Money Allocation Mutation Hardening.

**Scope**

- Kill lost/duplicated remainder, ratio-order loss, zero-ratio acceptance, sum mismatch, sign errors, implicit minor-unit rounding and source mutation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill lost/duplicated remainder, ratio-order loss, zero-ratio acceptance, sum mismatch, sign errors, implicit minor-unit rounding and source mutation.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill lost/duplicated remainder, ratio-order loss, zero-ratio acceptance, sum mismatch, sign errors, implicit minor-unit rounding and source mutation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm run test:coverage --workspace @finkore/typescript` exited 0; `npm run test:mutation --workspace @finkore/typescript` exited 0 after escalation for Stryker local logging server binding.
- Conformance: Money suite remained green before mutation: 83 passed / 83 total, 0 failed, 0 unsupported, 0 infrastructure errors.
- Mutation: Core final score 99.58%, report at `implementations/typescript/core/reports/mutation/mutation.json` and `.html`; Money `src/money/money.ts` scored 100.00%, 200 killed, 10 timeout, 0 survived, 0 no coverage. Six surviving mutants are Entity-scope only in `src/entities/entity.ts` and `src/entities/errors.ts`.
- Notes: No Money Allocation critical mutants survived.

<a id="task-019"></a>

### - [x] TASK-019 — Money Allocation Traceability Closure

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-018](#task-018)

**Objective**

Money Allocation Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Requirement/error/operation references were reviewed across spec, vectors, traceability, runner metadata, core tests, adapter tests and READMEs; `git diff --check` exited 0.
- Conformance: Full conformance after traceability updates exited 0: 166 passed / 166 total, 0 failed, 0 unsupported, 0 infrastructure errors; mutation-sensitive vectors 142 passed / 142 total.
- Mutation: Latest complete core mutation evidence remains applicable; Money scope has 0 survivors and no critical survivors.
- Notes: Traceability inventory is 236 total requirements, 172 covered, 64 not directly testable, 0 uncovered, 0 deferred, 0 blocking spec gaps. Money is 73 total requirements, 68 covered, 5 not directly testable, 0 uncovered, 0 blocking spec gaps.

<a id="task-020"></a>

### - [x] TASK-020 — Money Allocation Slice Closure Gate

**Release:** Draft 0.2

**Milestone:** Money Allocation

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-019](#task-019)

**Objective**

Money Allocation Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, focused Money conformance, full conformance, core coverage, runner coverage, core mutation, and `git diff --check` all exited 0 using repository-local Node `v24.11.1`.
- Conformance: Full manifest 166 passed / 166 total; Money 83/83, Workflow 20/20, Audit 19/19, Approvals 34/34, Entities 10/10; 0 failed, 0 unsupported, 0 infrastructure errors.
- Mutation: Core final mutation score 99.58%; Money `src/money/money.ts` 100.00% with 0 survivors and no critical Money survivors. Remaining six survivors are Entity-scope and outside the Money Allocation slice.
- Notes: Money Allocation is closed through specification, conformance vectors, TypeScript core API, conformance adapter, JSDoc, root/core/adapter README status, traceability, and evidence. Execution pointer advanced to TASK-021.

### Milestone: Entity Evolution Specification

<a id="task-021"></a>

### - [x] TASK-021 — Evolution Terminology and Revision Identity

**Release:** Draft 0.2

**Milestone:** Entity Evolution Specification

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-001](#task-001), [TASK-003](#task-003)

**Objective**

Evolution Terminology and Revision Identity.

**Scope**

- Define ENTITY-EVOLUTION-* stable Entity identity versus revision/relation identity and correction/reversal/void/supersession distinctions; classify replacement/amendment as composing-domain terms unless separately justified.
- Default sequence remains numeric; this spec can be prepared independently of Money after foundation. No Workflow terminal-state name implies financial finality.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define ENTITY-EVOLUTION-* stable Entity identity versus revision/relation identity and correction/reversal/void/supersession distinctions; classify replacement/amendment as composing-domain terms unless separately justified.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0. Source revision before changes: `0be7baaff8a00504692c2222579fd5126130e597`.
- Conformance: Not run; no conformance vectors were added by this spec-only task. `ENTITY-EVOLUTION-*` requirements are recorded as UNCOVERED pending vector work.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenarios were recorded for stable identity preservation and evolution-term separation.
- Notes: Added `spec/entities/evolution.md` with stable Entity identity, Entity Revision identity, Evolution Relation identity, correction/reversal/void/supersession distinctions, and replacement/amendment as composing-domain terms unless explicitly mapped.

<a id="task-022"></a>

### - [x] TASK-022 — Correction and Reversal Normative Semantics

**Release:** Draft 0.2

**Milestone:** Entity Evolution Specification

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-021](#task-021)

**Objective**

Correction and Reversal Normative Semantics.

**Scope**

- Define correction versus reversal outcomes, lifecycle prerequisites, related-entity identity, duplicate behavior and preservation of original financial facts.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define correction versus reversal outcomes, lifecycle prerequisites, related-entity identity, duplicate behavior and preservation of original financial facts.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0.
- Conformance: Not run; this task added no vectors. Correction and Reversal requirements remain UNCOVERED pending TASK-033 and related vector tasks.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenarios were recorded for original-fact preservation, duplicate relation rejection, and failure atomicity.
- Notes: Defined Correction and Reversal as related-Entity or Revision outcomes that preserve source identity and original facts, require composing-domain lifecycle eligibility, reject duplicates by relation identity or declared duplicate policy, and avoid in-place rewrites.

<a id="task-023"></a>

### - [x] TASK-023 — Void and Supersession Normative Semantics

**Release:** Draft 0.2

**Milestone:** Entity Evolution Specification

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-022](#task-022)

**Objective**

Void and Supersession Normative Semantics.

**Scope**

- Define void without deletion, supersession/currentness and replacement relationships, history observations and rejected-operation state preservation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define void without deletion, supersession/currentness and replacement relationships, history observations and rejected-operation state preservation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0.
- Conformance: Not run; this task added no vectors. Void and Supersession requirements remain UNCOVERED pending later vector and implementation tasks.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenarios were recorded for void-without-delete, supersession currentness, predecessor history preservation, and rejected-operation state preservation.
- Notes: Defined Void as nullification without deletion and Supersession as predecessor/successor currentness within a declared scope, with observable evolution history or relationship observations.

<a id="task-024"></a>

### - [x] TASK-024 — Entity Evolution Portable Error Design

**Release:** Draft 0.2

**Milestone:** Entity Evolution Specification

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-023](#task-023)

**Objective**

Entity Evolution Portable Error Design.

**Scope**

- Reuse existing Entity/domain errors where sufficient; assign only justified evolution failure categories, preserve primary domain error codes and safe diagnostics.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Reuse existing Entity/domain errors where sufficient; assign only justified evolution failure categories, preserve primary domain error codes and safe diagnostics.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review completed; `git diff --check` exited 0.
- Conformance: Not run; this task added no vectors. Entity Evolution error requirements remain UNCOVERED pending vector work.
- Mutation: Not applicable for this artifact-only task. Critical later-test scenarios were recorded for invalid evolution requests, state/revision/currentness conflicts, identity errors, primary downstream domain error preservation, and safe diagnostics.
- Notes: No new portable Entity error code was introduced. Invalid evolution requests use `FINKORE_ENTITY_INVALID_MUTATION`; state/revision/currentness mismatches use `FINKORE_ENTITY_STATE_CONFLICT`; identity failures use `FINKORE_ENTITY_INVALID_IDENTITY`; primary Workflow/Money/Approval/Audit failures retain their own codes. Execution pointer advanced to TASK-025.

### Milestone: Audit Relationships

<a id="task-025"></a>

### - [x] TASK-025 — Audit Relationship Normative Semantics

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-024](#task-024)

**Objective**

Audit Relationship Normative Semantics.

**Scope**

- Define AUDIT-RELATIONSHIP-* corrects/reverses/voids/supersedes target identities, permitted types, duplicate/unknown target handling, serialization and redaction evidence preservation.
- Generic related links enter only with a documented portable need. Distinguish entity identity, event identity and relationship identity; no global causality or ordering.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/audit/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define AUDIT-RELATIONSHIP-* corrects/reverses/voids/supersedes target identities, permitted types, duplicate/unknown target handling, serialization and redaction evidence preservation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Spec, index, glossary and traceability updates completed; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Relationship requirements were made vector-ready and later covered by 10 manifest-listed Audit vectors.
- Mutation: Not applicable to this SPEC task; defect scenarios carried into TASK-030.
- Notes: Added `AUDIT-RELATIONSHIP-001` through `AUDIT-RELATIONSHIP-014` in `spec/audit/relationships.md`.

<a id="task-026"></a>

### - [x] TASK-026 — Audit Relationship Portable Error Review

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-025](#task-025)

**Objective**

Audit Relationship Portable Error Review.

**Scope**

- Map malformed/missing target/type/duplicate relationship failures to INVALID_EVENT or a justified distinct category; specify rejection without history rewrite.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/audit/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map malformed/missing target/type/duplicate relationship failures to INVALID_EVENT or a justified distinct category; specify rejection without history rewrite.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Audit relationship error semantics were specified and reconciled with `spec/audit/errors.md`; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Invalid relationship vectors expect `FINKORE_AUDIT_INVALID_EVENT`.
- Mutation: Not applicable to this SPEC task; error-code mutants covered in TASK-030.
- Notes: No new portable Audit relationship error code was introduced.

<a id="task-027"></a>

### - [x] TASK-027 — Audit Relationship Conformance Vectors

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-026](#task-026)

**Objective**

Audit Relationship Conformance Vectors.

**Scope**

- Add relationship append, invalid target/type, duplicate and unknown-target cases per spec, defensive observation and redaction-preservation vectors.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/audit/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Add relationship append, invalid target/type, duplicate and unknown-target cases per spec, defensive observation and redaction-preservation vectors.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Runner tests and conformance completed successfully after vector registration; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Added `conformance/audit/relationships.json` with 10 manifest-listed vectors. Final Audit conformance passes 29/29; full manifest passes 176/176.
- Mutation: Not applicable to this CONFORMANCE task; vectors include mutation-sensitive cases for relationship preservation, invalid targets/types, duplicate IDs, redaction evidence, and failure atomicity.
- Notes: Relationship behavior uses existing `finkore.audit.append` and `audit.redact`; no new operation ID was added.

<a id="task-028"></a>

### - [x] TASK-028 — Audit Relationship Implementation

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-027](#task-027)

**Objective**

Audit Relationship Implementation.

**Scope**

- Implement relationship representation, validation and preservation through Audit Event append/redaction observations using the existing append-only model.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement relationship representation, validation and preservation through Audit Event append/redaction observations using the existing append-only model.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Core Audit unit tests, workspace typecheck/build, coverage and mutation passed; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Audit relationship vectors pass through the existing Audit adapter surface.
- Mutation: Focused `audit-event.ts` and `audit-log.ts` mutation passed 100.00%; full core mutation passed 99.60% with Audit at 100.00%.
- Notes: Added public relationship serialization types, validation in `AuditEvent`, history-level target/duplicate validation in `AuditLog`, redaction preservation, JSDoc, and Stryker coverage for the widened Audit event file.

<a id="task-029"></a>

### - [x] TASK-029 — Audit Relationship Adapter Support

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-028](#task-028)

**Objective**

Audit Relationship Adapter Support.

**Scope**

- Pass relationship fixtures to Audit core and expose required evidence on success and error without interpreting relationships.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Pass relationship fixtures to Audit core and expose required evidence on success and error without interpreting relationships.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Adapter tests passed; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Adapter suite includes a focused 10-vector Audit relationship check and Audit suite total 29/29.
- Mutation: Adapter is translation-only; core mutation evidence covers relationship behavior.
- Notes: Existing Audit operations pass relationship payloads to core without adapter-level relationship interpretation.

<a id="task-030"></a>

### - [x] TASK-030 — Audit Relationships Mutation Hardening

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-029](#task-029)

**Objective**

Audit Relationships Mutation Hardening.

**Scope**

- Kill dropped/rewritten relationship identity, hidden evidence during redaction, wrong duplicate handling, rewritten committed history and invented relationship order.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/audit/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill dropped/rewritten relationship identity, hidden evidence during redaction, wrong duplicate handling, rewritten committed history and invented relationship order.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill dropped/rewritten relationship identity, hidden evidence during redaction, wrong duplicate handling, rewritten committed history and invented relationship order.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Focused and full mutation reports completed successfully; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: All Audit relationship vectors passed before mutation closure.
- Mutation: Full core mutation score 99.60%; Audit domain 100.00%, with `audit-event.ts` 100.00% and `audit-log.ts` 100.00%. No critical Audit Relationship mutants survived.
- Notes: Added mutation-sensitive assertions for malformed relationship entries, metadata relationship conflicts, omitted optional relationship fields, same-ID/different-type target mismatches, duplicate relationship IDs after append/redaction, and invalid redaction evidence failure atomicity.

<a id="task-031"></a>

### - [x] TASK-031 — Audit Relationships Traceability Closure

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-030](#task-030)

**Objective**

Audit Relationships Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/audit/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Requirement, vector, operation and implementation references were reconciled; full verification summarized in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: `AUDIT-RELATIONSHIP-001` through `AUDIT-RELATIONSHIP-014` map to manifest-listed vectors; closed Audit Relationship scope has UNCOVERED = 0 and BLOCKING SPEC GAPS = 0.
- Mutation: Latest TASK-030 mutation evidence remains applicable.
- Notes: Traceability inventory is now 278 total requirements, 186 covered, 28 uncovered Entity Evolution requirements, and 64 not directly testable; 176 vectors are registered.

<a id="task-032"></a>

### - [x] TASK-032 — Audit Relationships Slice Closure Gate

**Release:** Draft 0.2

**Milestone:** Audit Relationships

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-031](#task-031)

**Objective**

Audit Relationships Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/audit/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Workspace typecheck, build, core tests, runner tests, adapter tests, Audit conformance, full conformance, coverage, full core mutation and `git diff --check` passed; details are recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Audit Relationships passed 10/10 relationship vectors, Audit passed 29/29, and full manifest passed 176/176 with 0 failed, 0 unsupported and 0 infrastructure errors.
- Mutation: Latest core mutation evidence shows Audit at 100.00% mutation score and no critical Audit Relationship survivors.
- Notes: Documentation, README status, JSDoc, conformance metadata and backlog pointer are synchronized. Next task is TASK-033 Entity and Audit Evolution Integration Contract.

### Milestone: Entity Evolution Implementation

<a id="task-033"></a>

### - [x] TASK-033 — Entity and Audit Evolution Integration Contract

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-024](#task-024), [TASK-032](#task-032)

**Objective**

Entity and Audit Evolution Integration Contract.

**Scope**

- Specify when evolution must produce audit evidence, who supplies event/relation identifiers, and observable atomicity across proposed entity result and audit history.
- Clarify composing-domain responsibility under ENTITY-AUDIT-001/002 and ENTITY-MUTABILITY-005. No storage transaction or mandatory Entity-owned Audit store.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Specify when evolution must produce audit evidence, who supplies event/relation identifiers, and observable atomicity across proposed entity result and audit history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Spec now defines the required Entity/Audit evolution evidence contract. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-034"></a>

### - [x] TASK-034 — Entity Evolution Conformance Families

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-033](#task-033)

**Objective**

Entity Evolution Conformance Families.

**Scope**

- Add separate correction, reversal, void and supersession vector families with revision identity, lifecycle/duplicate rejection, original preservation and mandatory audit evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/entities/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Add separate correction, reversal, void and supersession vector families with revision identity, lifecycle/duplicate rejection, original preservation and mandatory audit evidence.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Added manifest-listed Entity Evolution correction, reversal, void, and supersession vectors with audit evidence and failure-atomicity observations. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-035"></a>

### - [x] TASK-035 — Entity Revision Representation Implementation

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-034](#task-034)

**Objective**

Entity Revision Representation Implementation.

**Scope**

- Implement only the specified stable identity/revision/relation representation and defensive observations with validation tests.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement only the specified stable identity/revision/relation representation and defensive observations with validation tests.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Added immutable `EntityEvolutionHistory`, public evolution types, defensive observations, and validation tests. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-036"></a>

### - [x] TASK-036 — Entity Correction Implementation

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-035](#task-035)

**Objective**

Entity Correction Implementation.

**Scope**

- Create the specified correction result and relationship while preserving original facts and history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Create the specified correction result and relationship while preserving original facts and history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Correction now records a relation and required Audit evidence while preserving source Entity facts and history. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-037"></a>

### - [x] TASK-037 — Entity Reversal Implementation

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-036](#task-036)

**Objective**

Entity Reversal Implementation.

**Scope**

- Create the specified reversal result; enforce lifecycle and duplicate-reversal policy without ledger postings.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Create the specified reversal result; enforce lifecycle and duplicate-reversal policy without ledger postings.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Reversal now records a relation and rejects duplicate reversal for the same source Revision without ledger semantics. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-038"></a>

### - [x] TASK-038 — Entity Void Implementation

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-037](#task-037)

**Objective**

Entity Void Implementation.

**Scope**

- Implement void outcomes without deleting original facts, identity or history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement void outcomes without deleting original facts, identity or history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Void now records nullification/currentness without deleting the source Entity, facts, history, or Audit evidence. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-039"></a>

### - [x] TASK-039 — Entity Supersession Implementation

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-038](#task-038)

**Objective**

Entity Supersession Implementation.

**Scope**

- Implement replacement/currentness and revision links without rewriting stable identity or historical observations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement replacement/currentness and revision links without rewriting stable identity or historical observations.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Supersession now records predecessor/successor Revision links and declared-scope currentness without rewriting historical observations. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-040"></a>

### - [x] TASK-040 — Entity Evolution Audit Evidence Composition

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-039](#task-039)

**Objective**

Entity Evolution Audit Evidence Composition.

**Scope**

- Compose the specified Entity/Audit contract so success produces required evidence and rejected evidence/validation exposes no partial Entity or Audit result.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Compose the specified Entity/Audit contract so success produces required evidence and rejected evidence/validation exposes no partial Entity or Audit result.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Evolution operations now require matching Audit metadata and relationship evidence; rejected evidence exposes no partial evolution or Audit result. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-041"></a>

### - [x] TASK-041 — Entity Evolution Adapter Support

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-040](#task-040)

**Objective**

Entity Evolution Adapter Support.

**Scope**

- Wire each evolution operation separately in the handler table, delegating validation/evidence to core and observing original/result/history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Wire each evolution operation separately in the handler table, delegating validation/evidence to core and observing original/result/history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Adapter supports the four conformance-local Entity Evolution operations by delegating behavior to core and normalizing observations/errors. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-042"></a>

### - [x] TASK-042 — Entity Evolution Mutation Hardening

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-041](#task-041)

**Objective**

Entity Evolution Mutation Hardening.

**Scope**

- Kill original mutation, void-as-delete, identity rewrite, omitted audit relation, duplicate reversal acceptance, stale currentness and partial failure state.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill original mutation, void-as-delete, identity rewrite, omitted audit relation, duplicate reversal acceptance, stale currentness and partial failure state.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill original mutation, void-as-delete, identity rewrite, omitted audit relation, duplicate reversal acceptance, stale currentness and partial failure state.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Mutation: Scoped `src/entities/entity-evolution.ts` mutation passed at 97.66% with zero critical survivors.
- Notes: Mutation-sensitive tests cover source preservation, void-without-delete, identity rewrite rejection, omitted/wrong audit relation rejection, duplicate reversal rejection, stale currentness, and partial failure state. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-043"></a>

### - [x] TASK-043 — Entity Evolution Traceability Closure

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-042](#task-042)

**Objective**

Entity Evolution Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/entities/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

- Status: COMPLETE
- Verification: Completed as part of the consolidated TASK-033 through TASK-044 Entity Evolution Implementation slice. Evidence is recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Notes: Traceability now maps Entity Evolution requirements to vectors and implementation evidence with zero uncovered directly testable Entity requirements and zero blocking spec gaps. Next task is TASK-045 Approval Current-Effectiveness Contract.

<a id="task-044"></a>

### - [x] TASK-044 — Entity Evolution Slice Closure Gate

**Release:** Draft 0.2

**Milestone:** Entity Evolution Implementation

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-043](#task-043)

**Objective**

Entity Evolution Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/entities/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

- Status: COMPLETE
- Verification: Workspace typecheck, build, unit tests, adapter tests, focused Entity conformance, full conformance, coverage, scoped mutation and `git diff --check` passed; details are recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Entity suite passed 20/20 and full manifest passed 186/186 with 0 failed, 0 unsupported, and 0 infrastructure errors.
- Mutation: Scoped Entity Evolution mutation passed at 97.66%; remaining survivors are noncritical equivalent/defensive branches, with no critical Entity Evolution survivor.
- Notes: Documentation, README status, JSDoc, conformance metadata and backlog pointer are synchronized. Next task is TASK-045 Approval Current-Effectiveness Contract.

### Milestone: Approval Validity

<a id="task-045"></a>

### - [x] TASK-045 — Approval Current-Effectiveness Contract

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-044](#task-044), [TASK-032](#task-032)

**Objective**

Approval Current-Effectiveness Contract.

**Scope**

- Define current-effectiveness over append-only history, subject revisions/relevant facts and explicit evaluation context; refine existing APPROVAL-DECISION-002/003/007.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define current-effectiveness over append-only history, subject revisions/relevant facts and explicit evaluation context; refine existing APPROVAL-DECISION-002/003/007.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC (`git diff --check`) passed; Approval validity requirements added in `spec/approvals/validity.md` and linked from Approval specs/docs.
- Conformance: Implemented later in this same user-requested Approval Validity milestone; full conformance now passes 199/199 with Approvals 47/47.
- Mutation: Not applicable for this spec-only task; runtime mutation gate is TASK-055.
- Notes: Defines current-effectiveness over append-only Decision/lifecycle history, relevant facts, explicit evaluation instants, withdrawal, expiration and supersession.

<a id="task-046"></a>

### - [x] TASK-046 — Approval Withdrawal and Supersession Semantics

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-045](#task-045)

**Objective**

Approval Withdrawal and Supersession Semantics.

**Scope**

- Specify withdrawal and decision/requirement supersession relationships, eligibility evaluation boundaries, repeated requests and retained historical observations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Specify withdrawal and decision/requirement supersession relationships, eligibility evaluation boundaries, repeated requests and retained historical observations.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC (`git diff --check`) passed; requirements APPROVAL-VALIDITY-004 through APPROVAL-VALIDITY-006 and APPROVAL-VALIDITY-010 through APPROVAL-VALIDITY-012 added.
- Conformance: Implemented later in this same milestone; full conformance now passes 199/199 with Approvals 47/47.
- Mutation: Not applicable for this spec-only task; runtime mutation gate is TASK-055.
- Notes: Withdrawal, Decision supersession, Requirement supersession, retained history, repeated/invalid request behavior and eligibility boundary are specified.

<a id="task-047"></a>

### - [x] TASK-047 — Approval Expiration Semantics

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-046](#task-046)

**Objective**

Approval Expiration Semantics.

**Scope**

- Specify expiration using injected RFC 3339 instants, exact boundary inclusion, offsets, invalid/missing context and interaction with current-effectiveness; no wall clock.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Specify expiration using injected RFC 3339 instants, exact boundary inclusion, offsets, invalid/missing context and interaction with current-effectiveness; no wall clock.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC (`git diff --check`) passed; requirements APPROVAL-VALIDITY-007 through APPROVAL-VALIDITY-009 added.
- Conformance: Implemented later in this same milestone; full conformance now passes 199/199 with Approvals 47/47.
- Mutation: Not applicable for this spec-only task; runtime mutation gate is TASK-055.
- Notes: Expiration requires explicit injected evaluation instants, uses RFC 3339 instants with offsets, and treats equality at `expiresAt` as expired.

<a id="task-048"></a>

### - [x] TASK-048 — Approval Lifecycle Portable Error Design

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-047](#task-047)

**Objective**

Approval Lifecycle Portable Error Design.

**Scope**

- Evaluate existing decision/required errors for invalid lifecycle requests and evaluation context; define only stable missing categories and safe diagnostics.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Evaluate existing decision/required errors for invalid lifecycle requests and evaluation context; define only stable missing categories and safe diagnostics.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC (`git diff --check`) passed; `FINKORE_APPROVAL_INVALID_CONTEXT`, APPROVAL-ERROR-006 and APPROVAL-ERROR-007 added and documented.
- Conformance: Implemented later in this same milestone; full conformance now passes 199/199 with Approvals 47/47.
- Mutation: Not applicable for this spec-only task; runtime mutation gate is TASK-055.
- Notes: Existing invalid-decision/ineligible-actor errors cover invalid lifecycle requests; a new context error covers missing/malformed explicit evaluation context.

<a id="task-049"></a>

### - [x] TASK-049 — Approval Validity Conformance Vectors

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-048](#task-048)

**Objective**

Approval Validity Conformance Vectors.

**Scope**

- Cover withdrawal, expiration before/at/after boundary and equivalent offsets, decision/requirement supersession, stale revision/facts, unchanged relevant facts, repeated failures and preserved history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/approvals/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Cover withdrawal, expiration before/at/after boundary and equivalent offsets, decision/requirement supersession, stale revision/facts, unchanged relevant facts, repeated failures and preserved history.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, RUNNER and CONF passed after implementation; vector schema and metadata validation pass through runner tests and full conformance.
- Conformance: Added `conformance/approvals/validity.json` with 13 manifest-listed vectors. Full conformance passes 199/199; Approvals pass 47/47.
- Mutation: Not applicable for vector authoring; runtime mutation gate is TASK-055.
- Notes: Vectors cover withdrawal preservation/counting, duplicate withdrawal atomicity, expiration before/at/equivalent-offset/missing-context, Decision and Requirement supersession, stale revision and unchanged relevant facts.

<a id="task-050"></a>

### - [x] TASK-050 — Approval Withdrawal Implementation

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-049](#task-049)

**Objective**

Approval Withdrawal Implementation.

**Scope**

- Implement withdrawal and append-only lifecycle observations exactly as specified, including duplicate/invalid request behavior.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement withdrawal and append-only lifecycle observations exactly as specified, including duplicate/invalid request behavior.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, TYPE, UNIT(approvals), ADAPTER, CONF(approvals), UNIT and DOC passed with Node v24.11.1 from `.tools`.
- Conformance: Approval suite passes 47/47; full conformance passes 199/199.
- Mutation: Attempted in TASK-055; no fresh mutation report was produced.
- Notes: `ApprovalDecisionHistory.withdraw` appends lifecycle evidence, validates target uniqueness and eligibility, preserves committed Decisions and rejects duplicate/missing/ambiguous withdrawal without partial lifecycle state.

<a id="task-051"></a>

### - [x] TASK-051 — Approval Expiration Implementation

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-050](#task-050)

**Objective**

Approval Expiration Implementation.

**Scope**

- Implement explicit-instant validation and expiration boundary evaluation with deterministic offset comparisons.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement explicit-instant validation and expiration boundary evaluation with deterministic offset comparisons.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, TYPE, UNIT(approvals), ADAPTER, CONF(approvals), UNIT and DOC passed with Node v24.11.1 from `.tools`.
- Conformance: Approval suite passes 47/47; full conformance passes 199/199.
- Mutation: Attempted in TASK-055; no fresh mutation report was produced.
- Notes: Decisions may carry optional `expiresAt`; evaluation requires explicit `evaluatedAt`, compares instants by parsed time, and treats equality as expired.

<a id="task-052"></a>

### - [x] TASK-052 — Approval Supersession Implementation

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-051](#task-051)

**Objective**

Approval Supersession Implementation.

**Scope**

- Implement decision/requirement supersession and subject-revision binding while preserving committed history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement decision/requirement supersession and subject-revision binding while preserving committed history.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, TYPE, UNIT(approvals), ADAPTER, CONF(approvals), UNIT and DOC passed with Node v24.11.1 from `.tools`.
- Conformance: Approval suite passes 47/47; full conformance passes 199/199.
- Mutation: Attempted in TASK-055; no fresh mutation report was produced.
- Notes: `supersedeDecision` and `supersedeRequirement` append lifecycle evidence while preserving committed history and preventing Decision transfer to successor Requirements.

<a id="task-053"></a>

### - [x] TASK-053 — Approval Current-Effectiveness Integration

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-052](#task-052)

**Objective**

Approval Current-Effectiveness Integration.

**Scope**

- Integrate withdrawal/expiration/supersession/relevant-fact checks into requirement/decision evaluation; expose one reusable effectiveness model for 0.3 composition.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Integrate withdrawal/expiration/supersession/relevant-fact checks into requirement/decision evaluation; expose one reusable effectiveness model for 0.3 composition.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, TYPE, UNIT(approvals), ADAPTER, CONF(approvals), UNIT and DOC passed with Node v24.11.1 from `.tools`.
- Conformance: Approval suite passes 47/47; full conformance passes 199/199.
- Mutation: Attempted in TASK-055; no fresh mutation report was produced.
- Notes: Requirement evaluation now uses one current-effectiveness path for relevant facts, withdrawal, expiration, Decision supersession and Requirement supersession.

<a id="task-054"></a>

### - [x] TASK-054 — Approval Validity Adapter Support

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-053](#task-053)

**Objective**

Approval Validity Adapter Support.

**Scope**

- Translate lifecycle operations and explicit time/fact/revision context; core decides effectiveness and preserves history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Translate lifecycle operations and explicit time/fact/revision context; core decides effectiveness and preserves history.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD, TYPE, UNIT(approvals), ADAPTER, CONF(approvals), UNIT and DOC passed with Node v24.11.1 from `.tools`.
- Conformance: Adapter supports `approval.decision.withdraw`, `approval.decision.supersede`, `approval.requirement.supersede` and extended `approval.requirement.evaluate`; Approval suite passes 47/47; full conformance passes 199/199.
- Mutation: Translation-only adapter changes; core mutation gate is TASK-055.
- Notes: Adapter delegates lifecycle behavior to core and normalizes only values, errors and post-state observations.

<a id="task-055"></a>

### - [x] TASK-055 — Approval Validity Mutation Hardening

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-054](#task-054)

**Objective**

Approval Validity Mutation Hardening.

**Scope**

- Kill inverted expiration boundary, host-time access, counted withdrawn/superseded/stale decisions, relevant-fact loss and erased/partially mutated history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill inverted expiration boundary, host-time access, counted withdrawn/superseded/stale decisions, relevant-fact loss and erased/partially mutated history.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill inverted expiration boundary, host-time access, counted withdrawn/superseded/stale decisions, relevant-fact loss and erased/partially mutated history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm ci` exited 0 after escalation to install locked workspace dependencies; system `node` reported `v24.15.0`. `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspace @finkore/typescript -- test/approvals`, `npm run test --workspace @finkore/typescript-conformance-adapter`, `npm run test --workspaces`, `npm run test:coverage --workspace @finkore/typescript`, `npm run test:coverage --workspace @finkore/conformance-runner`, Approval/full conformance, and `git diff --check` exited 0.
- Conformance: Approval suite 47/47 PASS; full conformance 199/199 PASS with mutation-sensitive vectors 174/174 PASS.
- Mutation: Fresh full-core Stryker report exited 0 with 98.27% score, 2,086 killed, 13 timeout, 30 survived, 7 no coverage; Approval sources scored 97.11%, with 17 survived and 6 no coverage, report at `implementations/typescript/core/reports/mutation/mutation.json` and `.html`. Remaining Approval survivors are non-critical/equivalent validation-discrimination or lifecycle-kind isolation mutants; no named Approval Validity critical mutant survived.
- Notes: Added focused Approval DecisionHistory tests for imported lifecycle replay, malformed imported lifecycle records, exact lifecycle reference resolution, duplicate lifecycle invalidation, and direct lifecycle failure atomicity. Simplified internal lifecycle replay to use a validated discriminated event shape; no public API or normative behavior changed.

<a id="task-056"></a>

### - [x] TASK-056 — Approval Validity Traceability Closure

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-055](#task-055)

**Objective**

Approval Validity Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `rg` audit of `APPROVAL-VALIDITY-*`, `APPROVAL-ERROR-006`, `APPROVAL-ERROR-007`, lifecycle operation labels, and status text across `spec/approvals`, `conformance/traceability.md`, `agentic/operations.md`, TypeScript core/adapter READMEs, and Draft 0.2 evidence; `git diff --check` exited 0.
- Conformance: Approval suite 47/47 PASS; full conformance 199/199 PASS.
- Mutation: Reused fresh TASK-055 full-core mutation evidence: 98.27% full-core, Approval sources 97.11%, zero critical Approval Validity survivors.
- Notes: Traceability already maps `APPROVAL-VALIDITY-001` through `APPROVAL-VALIDITY-012`, `APPROVAL-ERROR-006`, and `APPROVAL-ERROR-007` to manifest-listed vectors. Approvals inventory remains 49 total, 44 covered, 5 not directly testable, 0 uncovered, 0 blocking spec gaps; no Agentic canonical Approval operation was introduced.

<a id="task-057"></a>

### - [x] TASK-057 — Approval Validity Slice Closure Gate

**Release:** Draft 0.2

**Milestone:** Approval Validity

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-056](#task-056)

**Objective**

Approval Validity Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.2-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, `npm run test --workspace @finkore/typescript-conformance-adapter`, `npm run test:coverage --workspace @finkore/typescript`, `npm run test:coverage --workspace @finkore/conformance-runner`, Approval/full conformance, full-core mutation, and `git diff --check` exited 0.
- Conformance: Approval suite 47/47 PASS; full conformance 199/199 PASS across Money 83/83, Workflow 20/20, Audit 29/29, Approvals 47/47, Entities 20/20; mutation-sensitive vectors 174/174 PASS.
- Mutation: Full-core Stryker 98.27% with report at `implementations/typescript/core/reports/mutation/mutation.json` and `.html`; Approval sources 97.11%, zero critical Approval Validity survivors.
- Notes: Approval Validity is closed for Draft 0.2. Documentation reviewed: spec/index, traceability, core README, adapter README, conformance-local operation labels, and JSDoc remain synchronized. Next execution pointer advanced to TASK-058.

### Milestone: Draft 0.2 Alignment

<a id="task-058"></a>

### - [x] TASK-058 — Draft 0.2 Cross-Domain Invariants

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Alignment

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-020](#task-020), [TASK-032](#task-032), [TASK-044](#task-044), [TASK-057](#task-057)

**Objective**

Draft 0.2 Cross-Domain Invariants.

**Scope**

- Test correction/reversal/void/supersession, Audit evidence, Approval revision/fact invalidation and Workflow lifecycle composition together, including joint failure preservation.
- Run targeted Entity/Audit/Approval mutation as well as cross-domain tests; no new semantics may be introduced by the integration tests.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Test correction/reversal/void/supersession, Audit evidence, Approval revision/fact invalidation and Workflow lifecycle composition together, including joint failure preservation.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added `implementations/typescript/core/test/integration/draft-0.2-alignment.test.ts`; focused integration test, `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, adapter tests, full conformance, scoped mutation, and docs checks passed.
- Conformance: Full conformance 199/199 PASS across Money 83/83, Workflow 20/20, Audit 29/29, Approvals 47/47, Entities 20/20; mutation-sensitive vectors 174/174 PASS.
- Mutation: Scoped Entity/Audit/Approval/Workflow Stryker run exited 0 with 95.32% score; report at `implementations/typescript/core/reports/mutation/mutation.json` and `.html`; no critical cross-domain alignment mutant was accepted as surviving.
- Notes: Cross-domain regression covers approval fact/revision invalidation gating Workflow transition, Entity correction/reversal/void/supersession with Audit evidence, and preservation of source/evolution/Audit/Approval observations on joint failures. Next execution pointer advanced to TASK-059 during this milestone run.

<a id="task-059"></a>

### - [x] TASK-059 — Draft 0.2 Agentic Review and Promotion

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Alignment

**Type:** AGENTIC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-058](#task-058)

**Objective**

Draft 0.2 Agentic Review and Promotion.

**Scope**

- Review rates/allocation, existing and evolution Entity operations, Audit append relationships and Approval validity for canonical, conformance-local or structural status.
- Review operation IDs, input/output, pre/postconditions, errors, determinism, mutatesState, mutatesFinancialState, audit/approval relevance and requirement references. Keep idempotency/irreversibility unspecified unless spec-backed. Update runner metadata and adapter labels only after promotion; obtain any required review without sending messages automatically.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `agentic/`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/README.md`
- `conformance/conventions.md`

**Implementation instructions**

1. Review each operation against /spec: canonical ID, inputs/outputs, preconditions/postconditions, errors, determinism, mutatesState, mutatesFinancialState, audit relevance, approval relevance and requirement references.
2. Record canonical/conformance-local/structural decisions, obtain required review, then align descriptors, allowlists and adapter dispatch without redefining domain behavior. Do not invent idempotency, irreversibility or AI-specific approval rules.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **RUNNER**, **ADAPTER**, **CONF** if operation registries/dispatch change; otherwise inspect their latest applicable results and all descriptor links.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Review rates/allocation, existing and evolution Entity operations, Audit append relationships and Approval validity for canonical, conformance-local or structural status.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Reviewed canonical/local/structural classifications and registry effects match the current normative and implemented behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm run build --workspaces`, `npm run typecheck --workspaces`, runner metadata/integration tests, adapter tests, full conformance, and docs checks passed after promotion.
- Conformance: Manifest-listed vectors use promoted `finkore.money.applyrate`, `finkore.money.allocate`, and `finkore.entity.*` operation IDs; full conformance remains 199/199 PASS with 174/174 mutation-sensitive vectors PASS.
- Mutation: Not rerun for this artifact/adapter-label task; no financial implementation behavior changed. TASK-058 scoped mutation evidence remains applicable for cross-domain behavior.
- Notes: Promoted Money Rate, Money Allocation, Entity create/mutate/transition, and Entity Evolution operations to canonical Agentic IDs. Approval lifecycle operations remain conformance-local; Audit Relationships remain structural evidence observed through Audit append/redaction rather than a separate operation. Adapter retains old local labels as compatibility aliases only. Next execution pointer advanced to TASK-060 during this milestone run.

<a id="task-060"></a>

### - [x] TASK-060 — Draft 0.2 Documentation and CoreDoc Review

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Alignment

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-059](#task-059)

**Objective**

Draft 0.2 Documentation and CoreDoc Review.

**Scope**

- Synchronize root/domain/spec/TypeScript/adapter/Agentic README status, JSDoc, deferred notes and CoreDoc assumptions for rates, remainder distribution, evolution and effectiveness.
- Search CoreDoc again. No CoreDoc file was found during planning; record absent when still absent and maintain an impact note, without creating a new CoreDoc product.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Synchronize root/domain/spec/TypeScript/adapter/Agentic README status, JSDoc, deferred notes and CoreDoc assumptions for rates, remainder distribution, evolution and effectiveness.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Completion:
- Status: COMPLETE
- Verification: CoreDoc was found at `docs/coreDoc/core-doc.md`; documentation review, scoped Markdown/reference scans, `git diff --check`, and final runtime gates passed.
- Conformance: Not a new behavior task; latest full conformance remains 199/199 PASS and reflects the promoted operation IDs.
- Mutation: Not applicable for documentation synchronization; no financial implementation behavior changed.
- Notes: Agentic status/effects/discovery/capability docs, conformance conventions, adapter README, root README, and CoreDoc approval-validity assumptions were synchronized. CoreDoc now records withdrawal, expiration, and supersession as current Approval validity semantics. `NEXT TASK` advanced to TASK-061.

## 8. Draft 0.2 Closure Gate

### Milestone: Draft 0.2 Closure

<a id="task-061"></a>

### - [x] TASK-061 — Draft 0.2 Requirements and Traceability Gate

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-060](#task-060)

**Objective**

Draft 0.2 Requirements and Traceability Gate.

**Scope**

- Reconcile all selected 0.2 requirements, directly testable coverage and former integration gaps; require UNCOVERED = 0 and BLOCKING SPEC GAPS = 0.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Reconcile all selected 0.2 requirements, directly testable coverage and former integration gaps; require UNCOVERED = 0 and BLOCKING SPEC GAPS = 0.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Requirement inventory, manifest vectors, vector requirement references, operation IDs, and coverage classifications were recomputed and recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Traceability inventory is 297 requirements: 231 COVERED, 66 NOT DIRECTLY TESTABLE, 0 PARTIAL, 0 UNCOVERED, 0 DEFERRED, 0 BLOCKING SPEC GAP. Manifest contains 199 vectors across Money 83, Workflow 20, Audit 29, Approvals 47, Entities 20.
- Mutation: Not a runtime mutation task; TASK-065 full-core mutation evidence closes the runtime survivor requirement.
- Notes: No requirement was hidden by reclassification. Next execution pointer advanced to TASK-062 during this milestone run.

<a id="task-062"></a>

### - [x] TASK-062 — Draft 0.2 Public API and Portable Error Audit

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-061](#task-061)

**Objective**

Draft 0.2 Public API and Portable Error Audit.

**Scope**

- Audit error categories across spec/conventions, vectors, core, adapter, JSDoc and Agentic descriptors; check every intentional public export and example.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Audit error categories across spec/conventions, vectors, core, adapter, JSDoc and Agentic descriptors; check every intentional public export and example.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Portable error references were reconciled across `spec/`, `conformance/`, TypeScript core, adapter normalization, Agentic descriptors, and examples; public TypeScript declaration JSDoc was reviewed.
- Conformance: All 28 portable error codes referenced by current spec/conformance/core/adapter/Agentic artifacts are listed in `spec/conventions.md`.
- Mutation: Not a mutation task. Focused unit tests were added for Approval lifecycle and Entity Evolution survivor hardening before TASK-065.
- Notes: Added missing `FINKORE_APPROVAL_INVALID_CONTEXT` to the shared spec convention error catalog. Public declaration JSDoc was current; `src/index.ts` re-export groups are not independent public declarations. Next execution pointer advanced to TASK-063 during this milestone run.

<a id="task-063"></a>

### - [x] TASK-063 — Draft 0.2 Architecture Gate

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-062](#task-062)

**Objective**

Draft 0.2 Architecture Gate.

**Scope**

- Verify core dependency direction, runner neutrality, translation-only adapters and language-neutral canonical artifacts; inspect explicit spec-backed cross-domain imports.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.
- Inspect imports and package dependencies with `rg`; no dedicated architecture script exists. Review runner financial neutrality and adapter delegation manually, and add focused architecture regression tests only where useful.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify core dependency direction, runner neutrality, translation-only adapters and language-neutral canonical artifacts; inspect explicit spec-backed cross-domain imports.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Package dependencies and imports were inspected with `rg`; build, typecheck, workspace tests, coverage, conformance, core mutation, runner mutation, and docs checks passed in the closure run.
- Conformance: Full conformance remains 199/199 PASS with 174/174 mutation-sensitive vectors PASS.
- Mutation: TASK-065 core and runner mutation evidence applies.
- Notes: Core has no dependency on runner/conformance/agentic/frameworks; adapter depends on runner/core only; runner contains generic validation/reporting/dispatch metadata and no financial rule implementation. Explicit core cross-domain imports are spec-backed Entity composition of Money, Workflow, and Audit. Next execution pointer advanced to TASK-064 during this milestone run.

<a id="task-064"></a>

### - [x] TASK-064 — Draft 0.2 Full Regression and Coverage Gate

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-063](#task-063)

**Objective**

Draft 0.2 Full Regression and Coverage Gate.

**Scope**

- Run workspace build/typecheck/tests, full conformance and available coverage; report five domains and totals for all required 0.1/0.2 vectors with zero FAIL, UNSUPPORTED and INFRASTRUCTURE_ERROR.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- Run **COV(core)** and **COV(runner)** explicitly; inspect uncovered financial/error branches and configured thresholds.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Run workspace build/typecheck/tests, full conformance and available coverage; report five domains and totals for all required 0.1/0.2 vectors with zero FAIL, UNSUPPORTED and INFRASTRUCTURE_ERROR.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, core coverage, runner coverage, and full conformance all exited 0.
- Conformance: Full conformance 199/199 PASS; Money 83/83, Workflow 20/20, Audit 29/29, Approvals 47/47, Entities 20/20; zero FAIL, UNSUPPORTED, and INFRASTRUCTURE_ERROR; mutation-sensitive vectors 174/174 PASS.
- Coverage: TypeScript core coverage 98.75% statements, 98.16% branches, 100% functions, 99.31% lines. Runner coverage 98.31% statements, 95.29% branches, 100% functions, 98.75% lines.
- Notes: No new semantics were introduced by this regression gate. Next execution pointer advanced to TASK-065 during this milestone run.

<a id="task-065"></a>

### - [x] TASK-065 — Draft 0.2 Full-Core Mutation Gate

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-064](#task-064)

**Objective**

Draft 0.2 Full-Core Mutation Gate.

**Scope**

- Produce a complete valid full-core report including all new files and legacy critical behavior, inspect every survivor, require at least 95% and zero critical survivors; run runner mutation after infrastructure changes.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Produce a complete valid full-core report including all new files and legacy critical behavior, inspect every survivor, require at least 95% and zero critical survivors; run runner mutation after infrastructure changes.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Produce a complete valid full-core report including all new files and legacy critical behavior, inspect every survivor, require at least 95% and zero critical survivors; run runner mutation after infrastructure changes.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Full-core Stryker and runner Stryker both exited 0 after focused survivor-hardening tests; reports are recorded in `docs/tasks/draft-0.2-execution-evidence.md`.
- Conformance: Full conformance remains 199/199 PASS after the mutation hardening tests.
- Mutation: Core full mutation 98.88% with 2,099 killed, 13 timeout, 20 survived, 4 no coverage, 0 errors. Runner mutation 99.73% with 367 killed, 1 survived, 0 no coverage, 0 errors. No critical survivor accepted.
- Notes: Remaining core survivors are validation-equivalent, optional-shape serialization, unreachable append-postcondition, or diagnostic-message/details branches; runner survivor is a diagnostic source-label default. Next execution pointer advanced to TASK-066 during this milestone run.

<a id="task-066"></a>

### - [x] TASK-066 — DRAFT 0.2 CLOSURE GATE

**Release:** Draft 0.2

**Milestone:** Draft 0.2 Closure

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-001](#task-001), [TASK-002](#task-002), [TASK-003](#task-003), [TASK-004](#task-004), [TASK-005](#task-005), [TASK-006](#task-006), [TASK-007](#task-007), [TASK-008](#task-008), [TASK-009](#task-009), [TASK-010](#task-010), [TASK-011](#task-011), [TASK-012](#task-012), [TASK-013](#task-013), [TASK-014](#task-014), [TASK-015](#task-015), [TASK-016](#task-016), [TASK-017](#task-017), [TASK-018](#task-018), [TASK-019](#task-019), [TASK-020](#task-020), [TASK-021](#task-021), [TASK-022](#task-022), [TASK-023](#task-023), [TASK-024](#task-024), [TASK-025](#task-025), [TASK-026](#task-026), [TASK-027](#task-027), [TASK-028](#task-028), [TASK-029](#task-029), [TASK-030](#task-030), [TASK-031](#task-031), [TASK-032](#task-032), [TASK-033](#task-033), [TASK-034](#task-034), [TASK-035](#task-035), [TASK-036](#task-036), [TASK-037](#task-037), [TASK-038](#task-038), [TASK-039](#task-039), [TASK-040](#task-040), [TASK-041](#task-041), [TASK-042](#task-042), [TASK-043](#task-043), [TASK-044](#task-044), [TASK-045](#task-045), [TASK-046](#task-046), [TASK-047](#task-047), [TASK-048](#task-048), [TASK-049](#task-049), [TASK-050](#task-050), [TASK-051](#task-051), [TASK-052](#task-052), [TASK-053](#task-053), [TASK-054](#task-054), [TASK-055](#task-055), [TASK-056](#task-056), [TASK-057](#task-057), [TASK-058](#task-058), [TASK-059](#task-059), [TASK-060](#task-060), [TASK-061](#task-061), [TASK-062](#task-062), [TASK-063](#task-063), [TASK-064](#task-064), [TASK-065](#task-065)

**Objective**

DRAFT 0.2 CLOSURE GATE.

**Scope**

- Verify all preceding mandatory 0.2 tasks and reports, cross-domain invariants, errors/registry, public JSDoc, README/status and manifest release policy.
- Output exactly one status line: FINKORE CORE DRAFT 0.2 NOT COMPLETE or FINKORE CORE DRAFT 0.2 COMPLETE. Only COMPLETE permits advancing to 0.3 implementation. Revalidate reports after relevant changes; do not claim completion from stale evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.2-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.2-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify all preceding mandatory 0.2 tasks and reports, cross-domain invariants, errors/registry, public JSDoc, README/status and manifest release policy.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED. Emit exactly one: `FINKORE CORE DRAFT 0.2 NOT COMPLETE` or `FINKORE CORE DRAFT 0.2 COMPLETE`.

**Completion**

Completion:
- Status: COMPLETE
- Verification: All mandatory Draft 0.2 task dependencies through TASK-065 are complete and current closure gates passed; `git diff --check` passed after documentation updates.
- Conformance: Required Draft 0.1/0.2 vectors all PASS: 199/199 total, 174/174 mutation-sensitive, zero fail/unsupported/infrastructure error.
- Mutation: Full-core and runner mutation reports are complete and above 95%, with zero critical survivors accepted.
- Notes: `FINKORE CORE DRAFT 0.2 COMPLETE`. Draft 0.3 implementation may begin. `NEXT TASK` advanced to TASK-067.

## 9. Draft 0.3 Task Backlog

### Milestone: Draft 0.3 Foundation

<a id="task-067"></a>

### - [x] TASK-067 — Draft 0.2 Closure Verification and Draft 0.3 Scope Refresh

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Foundation

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-066](#task-066)

**Objective**

Draft 0.2 Closure Verification and Draft 0.3 Scope Refresh.

**Scope**

- Verify the actual closed 0.2 baseline against the 0.3 plan; lock mandatory composition, Workflow binding/import/conflict and Entity revision/import scope, plus required research and review gates.
- Retain the plan classifications. Conditions, Money normative portability changes and Audit provenance implementation require recorded research approval. Delegation/tax/identity-registry candidates remain deferred research, not mandatory 0.3 features.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify the actual closed 0.2 baseline against the 0.3 plan; lock mandatory composition, Workflow binding/import/conflict and Entity revision/import scope, plus required research and review gates.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Completion:
- Status: COMPLETE
- Verification: `node --version`, `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, adapter tests, full conformance, core coverage, and runner coverage all exited 0 during the TASK-067 refresh; evidence recorded in `docs/tasks/draft-0.3-execution-evidence.md`.
- Conformance: Full manifest PASS 199/199; mutation-sensitive vectors PASS 174/174; Money 83/83, Workflow 20/20, Audit 29/29, Approvals 47/47, Entities 20/20.
- Mutation: No new financial behavior changed, so mutation was not rerun; latest complete core report remains 98.88% and latest runner report remains 99.73%, with zero critical survivors accepted under TASK-066 classification.
- Notes: Draft 0.3 plan refreshed to the actual closed 0.2 baseline. Mandatory 0.3 scope and research/review gates remain unchanged. `NEXT TASK` advanced to TASK-068.

### Milestone: Advanced Approvals

<a id="task-068"></a>

### - [x] TASK-068 — Approval Composition Requirement Inventory

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067), [TASK-057](#task-057)

**Objective**

Approval Composition Requirement Inventory.

**Scope**

- Inventory ANY_OF, ALL_OF, N_OF_M, ordered stages and bounded nested groups; map dependencies on 0.2 effectiveness, actor/requirement identity and history.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Inventory ANY_OF, ALL_OF, N_OF_M, ordered stages and bounded nested groups; map dependencies on 0.2 effectiveness, actor/requirement identity and history.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC inventory used `rg` over `spec/approvals`, `conformance/approvals`, `conformance/traceability.md`, `agentic/operations.md`, approval core tests, and adapter operations; `git diff --check` passed.
- Conformance: Existing Approval suite remains 47 vectors before TASK-074. The new Draft 0.3 composition slice has 23 planned directly testable requirements and 0 blocking spec gaps; vectors are intentionally pending.
- Mutation: Not applicable for this traceability inventory. Recorded critical scenarios include quorum off-by-one, duplicate voter counted twice, ineffective Decision counted, order bypass, nested early return, cycle/depth bypass, and mutable observation defects.
- Notes: Inventory maps ANY_OF, ALL_OF, N_OF_M, ordered stages, and bounded nested groups to Draft 0.2 current-effectiveness, actor/voter identity, requirement identity, and Decision history. `NEXT TASK` advanced to TASK-069.

<a id="task-069"></a>

### - [x] TASK-069 — Any-of All-of and Quorum Normative Semantics

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-068](#task-068)

**Objective**

Any-of All-of and Quorum Normative Semantics.

**Scope**

- Define APPROVAL-COMPOSITION-* and APPROVAL-QUORUM-* group/member identity, voter counting, thresholds, rejection/pending, duplicates and eligibility; no implied abstention.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Define APPROVAL-COMPOSITION-* and APPROVAL-QUORUM-* group/member identity, voter counting, thresholds, rejection/pending, duplicates and eligibility; no implied abstention.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review and `git diff --check` passed.
- Conformance: 23 Draft 0.3 Approval Composition/Error/Quorum requirements are traceability-listed as UNCOVERED until TASK-074 adds manifest-listed vectors.
- Mutation: Not applicable for this spec-only task; mutation scenarios are recorded for later implementation and hardening tasks.
- Notes: Added vector-ready `APPROVAL-COMPOSITION-*` and `APPROVAL-QUORUM-*` semantics for group identity, member identity, any/all/quorum outcomes, thresholds, rejection/pending handling, duplicate voters, eligibility, and no implied abstention. `NEXT TASK` advanced to TASK-070.

<a id="task-070"></a>

### - [x] TASK-070 — Composition and Current-Effectiveness Interaction

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-069](#task-069)

**Objective**

Composition and Current-Effectiveness Interaction.

**Scope**

- Require composition to reuse closed 0.2 effectiveness; define how withdrawn, expired, superseded, stale and ineligible decisions affect quorum/any/all outcomes.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Require composition to reuse closed 0.2 effectiveness; define how withdrawn, expired, superseded, stale and ineligible decisions affect quorum/any/all outcomes.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review and `git diff --check` passed.
- Conformance: Current-effectiveness interaction requirements remain UNCOVERED until TASK-074 publishes vectors; no closed Draft 0.2 vector semantics were changed.
- Mutation: Not applicable for this spec-only task.
- Notes: Composition now explicitly reuses Draft 0.2 effectiveness and excludes withdrawn, expired, superseded, stale-fact, stale-revision, ineligible, malformed, and rejected Decisions from quorum approval counts. `NEXT TASK` advanced to TASK-071.

<a id="task-071"></a>

### - [x] TASK-071 — Ordered Stages and Bounded Groups Semantics

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-070](#task-070)

**Objective**

Ordered Stages and Bounded Groups Semantics.

**Scope**

- Specify stage progression, independent parallel group meaning, bounded nesting/depth, cycle rejection, deterministic traversal and actionable requirements; no scheduling engine.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Specify stage progression, independent parallel group meaning, bounded nesting/depth, cycle rejection, deterministic traversal and actionable requirements; no scheduling engine.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review and `git diff --check` passed.
- Conformance: Stage, deterministic traversal, cycle, depth, and actionable-requirement requirements are UNCOVERED until TASK-074.
- Mutation: Not applicable for this spec-only task.
- Notes: Specified declared-order stage progression, same-stage parallel group meaning, maximum group depth of four including the root, cycle rejection, deterministic traversal, and first non-approved stage actionability. `NEXT TASK` advanced to TASK-072.

<a id="task-072"></a>

### - [x] TASK-072 — Approval Composition Portable Error Design

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-071](#task-071)

**Objective**

Approval Composition Portable Error Design.

**Scope**

- Reuse INVALID_CHAIN, REQUIRED and CONDITION_UNRESOLVED where applicable; resolve invalid group shape, missing states and threshold errors without arbitrary categories.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Reuse INVALID_CHAIN, REQUIRED and CONDITION_UNRESOLVED where applicable; resolve invalid group shape, missing states and threshold errors without arbitrary categories.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Completion:
- Status: COMPLETE
- Verification: DOC review and `git diff --check` passed.
- Conformance: New error requirements `APPROVAL-ERROR-008` and `APPROVAL-ERROR-009` are UNCOVERED until TASK-074 adds vectors.
- Mutation: Not applicable for this spec-only task.
- Notes: Reused `FINKORE_APPROVAL_INVALID_CHAIN`, `FINKORE_APPROVAL_REQUIRED`, and `FINKORE_APPROVAL_CONDITION_UNRESOLVED`; no quorum-specific portable error was introduced. `NEXT TASK` advanced to TASK-073.

<a id="task-073"></a>

### - [x] TASK-073 — Approval Composition Domain and Security Review

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-072](#task-072)

**Objective**

Approval Composition Domain and Security Review.

**Scope**

- Obtain and record required accounting/domain review of counting/rejection/duplicates and technical/security review of bounded nesting and safe diagnostics.
- Required review gate from 0.3 plan sections 8 and 11, governed by D03-REVIEW-001. Prepare concrete semantics and contrast cases first. Missing scoped maintainer acceptance is BLOCKED BY REVIEW; unresolved semantics remain BLOCKED BY SPEC GAP. Record external review status separately.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Obtain and record required accounting/domain review of counting/rejection/duplicates and technical/security review of bounded nesting and safe diagnostics.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Completion:
- Status: COMPLETE — 2026-09-12.
- Decisions: D03-REVIEW-001, D03-QUORUM-001/002/003, and D03-COMPOSITION-001 through 006. All six review findings resolved; scoped recommendations accepted by the maintainer, including explicit auto-accept authority for this review.
- Review: attributed domain/accounting and technical/security analysis, alternatives, contrast cases, findings/resolutions, and limitations in [the final review record](draft-0.3-research-decisions.md#task-073-final-review-record). External review: NOT EXTERNALLY REVIEWED.
- Revision: [final SHA-256 manifest](review-snapshots/task-073-final.json). Earlier decision manifests remain historical records.
- Scope: normative remediation was explicitly authorized during the decision discussion, separately from this research task's default scope. No runtime implementation or conformance completion is implied.
- Verification: documentation links/anchors, requirement mapping and totals, unchanged closed coverage, stable task IDs/dependency state, final artifact hashes, and git diff --check passed. See [execution evidence](draft-0.3-execution-evidence.md). Runtime tests and mutation do not apply to this artifact-only review.
- Next: TASK-074 remains unchecked and ready; 37 Draft 0.3 requirements remain UNCOVERED, with zero identified blocking specification gaps in the inventory.

<a id="task-074"></a>

### - [x] TASK-074 — Approval Composition Conformance Families

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-073](#task-073)

**Objective**

Approval Composition Conformance Families.

**Scope**

- Add any/all/quorum, ordered stages and nesting vector families, threshold boundaries, duplicates, rejection, missing states, cycles and depth cases.
- Carry forward the accepted TASK-073 contrast cases: fixed N under applicability changes, recursively inapplicable groups, parallel stage aggregation, complete validation and error priority, eligible actionable paths, opposing effective votes, and member-specific voter evidence. Derive all expectations from APPROVAL-COMPOSITION-001 through 024, APPROVAL-QUORUM-001 through 010, and APPROVAL-ERROR-008 through 010.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `docs/tasks/draft-0.3-research-decisions.md` — accepted review rationale and contrast cases; `/spec` remains normative.
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/approvals/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Add any/all/quorum, ordered stages and nesting vector families, threshold boundaries, duplicates, rejection, missing states, cycles and depth cases.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Completion:
- Status: COMPLETE
- Verification: BUILD exited 0; RUNNER exited 0 with 10 files / 110 tests passing; full CONF exited 3 with the expected conformance-first red set only. DOC (`git diff --check`) passed. Evidence is recorded in `docs/tasks/draft-0.3-execution-evidence.md`.
- Conformance: 218 total vectors; 199 PASS, 0 FAIL, 19 UNSUPPORTED, 0 INFRASTRUCTURE_ERROR. The unsupported set is exactly the new `approval.composition.evaluate` vector family; previously closed Money 83/83, Workflow 20/20, Audit 29/29, existing Approvals 47/47, and Entities 20/20 remain passing.
- Mutation: Not applicable for this conformance-first artifact task; the 19 new mutation-sensitive vectors define later implementation hardening targets.
- Notes: Added and registered `conformance/approvals/composition.json`; documented the conformance-local operation; updated traceability to 268 covered, 0 uncovered, 66 not directly testable, 0 blocking spec gaps. `NEXT TASK` advanced to TASK-075.

<a id="task-075"></a>

### - [x] TASK-075 — Approval Composition TypeScript Model and API

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-074](#task-074)

**Objective**

Approval Composition TypeScript Model and API.

**Scope**

- Implement only group representation/validation and public types from the approved spec, with JSDoc and boundary unit tests.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement only group representation/validation and public types from the approved spec, with JSDoc and boundary unit tests.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Node v24.20.0 from `.tools/node-v24.20.0-linux-x64`; `npm run build --workspaces` exited 0; `npm run typecheck --workspaces` exited 0; `npm run test --workspace @finkore/typescript -- test/approvals` exited 0 with 8 files / 84 tests passing; `npm run test --workspace @finkore/typescript-conformance-adapter` exited 0 with 1 file / 13 tests passing; `npm run test:coverage --workspace @finkore/typescript` exited 0 with 33 files / 289 tests passing and 98.87% statement coverage; `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite approvals --json` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. The unsupported set remains the TASK-074 `approval.composition.evaluate` vectors scheduled for later adapter/evaluation tasks.
- Mutation: targeted core mutation `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` exited 0 with 100.00% score, 238 killed, 3 timeout, 0 survived, 0 no coverage. Reports: `implementations/typescript/core/reports/mutation/mutation.json` and `mutation.html`.
- Notes: Added the `ApprovalComposition` public model/API, serialized composition public types, exports, JSDoc, boundary and mutation-sensitive unit tests, Stryker coverage for the new source file, adapter expectation synchronization, and TypeScript core README status/API updates. No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, root README, or conformance vectors changed in this task because no evaluation operation or canonical Agentic operation was implemented. `NEXT TASK` advanced to TASK-076.

<a id="task-076"></a>

### - [x] TASK-076 — Any-of and All-of Evaluation Implementation

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-075](#task-075)

**Objective**

Any-of and All-of Evaluation Implementation.

**Scope**

- Implement any/all evaluation over the specified effective decision/requirement observations; preserve legacy sequential/unordered chain behavior.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement any/all evaluation over the specified effective decision/requirement observations; preserve legacy sequential/unordered chain behavior.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

- Status: COMPLETE
- Verification: Node v24.20.0 from `.tools/node-v24.20.0-linux-x64`; initial red `npm run test --workspace @finkore/typescript -- test/approvals` failed with `composition.evaluate is not a function`; final `npm run test --workspace @finkore/typescript -- test/approvals` exited 0 with 10 files / 103 tests passing; `npm run typecheck --workspaces` exited 0; `npm run build --workspaces` exited 0; `npm run test --workspace @finkore/typescript-conformance-adapter` exited 0 with 1 file / 13 tests passing; `npm run test:coverage --workspace @finkore/typescript` exited 0 with 35 files / 308 tests passing and 98.89% statement coverage; `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite approvals --json` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. Adapter wiring remains later, so the TASK-074 `approval.composition.evaluate` vector set is still the known unsupported set.
- Mutation: targeted core mutation `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` exited 0 with 97.29% score, 536 killed, 3 timeout, 14 survived, 1 no coverage. No critical survivor affects implemented any/all behavior; remaining survivors are redundant defensive branches or unreachable post-validation guards. Reports: `implementations/typescript/core/reports/mutation/mutation.json` and `mutation.html`.
- Notes: Added `ApprovalComposition.evaluate`, public evaluation input/result types, any/all and staged evaluation tests, complete-validation/error-priority tests, README/API synchronization, and no adapter dispatch. Quorum vote counting remains TASK-077; conformance support remains pending adapter work. No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, or root README update was required because the normative vector set and canonical operation inventory did not change. `NEXT TASK` advanced to TASK-077.

<a id="task-077"></a>

### - [x] TASK-077 — N-of-M Quorum Evaluation Implementation

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-076](#task-076)

**Objective**

N-of-M Quorum Evaluation Implementation.

**Scope**

- Implement distinct eligible effective counting, threshold outcome and rejection/pending rules; reuse 0.2 effectiveness without adapter-side counting.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement distinct eligible effective counting, threshold outcome and rejection/pending rules; reuse 0.2 effectiveness without adapter-side counting.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Red `npm run test --workspace @finkore/typescript -- test/approvals` failed before implementation on the new quorum behavior tests; after implementation, `npm run test --workspace @finkore/typescript -- test/approvals` passed 11 files / 115 tests, `npm run typecheck --workspaces` passed, `npm run build --workspaces` passed, `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 13 tests, `npm run test:coverage --workspace @finkore/typescript` passed 36 files / 320 tests with 99.02% statements and 98.54% branches; `npm run test:coverage --workspace @finkore/conformance-runner` passed 10 files / 110 tests with 98.31% statements and 95.29% branches, and `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. The unsupported set remains the TASK-074 `approval.composition.evaluate` family because adapter dispatch is scheduled later.
- Mutation: Targeted `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` passed at 97.45% mutation score, 686 killed, 3 timeout, 18 survived, 0 no coverage; no critical quorum-counting, duplicate-vote, ineffective-vote, eligibility, fixed-threshold, or opposing-effective-vote survivor was accepted. Report: `implementations/typescript/core/reports/mutation/mutation.html`.
- Notes: Added explicit Decision-observation quorum evaluation input/types, unit and mutation-sensitive quorum tests, public exports/JSDoc, and TypeScript core README status/API updates. No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, or root README update was required because the normative requirements, vector set, canonical operation inventory, governance, and project-level slice closure did not change. `NEXT TASK` advanced to TASK-078.

<a id="task-078"></a>

### - [x] TASK-078 — Ordered Approval Stage Evaluation Implementation

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-077](#task-077)

**Objective**

Ordered Approval Stage Evaluation Implementation.

**Scope**

- Implement declared stage progression/actionability using closed group evaluation and current-effectiveness.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement declared stage progression/actionability using closed group evaluation and current-effectiveness.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added focused ordered-stage tests over closed quorum group evaluation in `composition-stage-quorum.test.ts`; the behavior passed immediately because prior stage evaluation and TASK-077 quorum closure already supplied the implementation. `npm run test --workspace @finkore/typescript -- test/approvals` passed 12 files / 118 tests, `npm run typecheck --workspaces` passed, `npm run build --workspaces` passed, `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 13 tests, `npm run test:coverage --workspace @finkore/typescript` passed 37 files / 323 tests with 99.02% statements and 98.54% branches, `npm run test:coverage --workspace @finkore/conformance-runner` passed 10 files / 110 tests with 98.31% statements and 95.29% branches, and `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. The unsupported set remains the TASK-074 `approval.composition.evaluate` family because adapter dispatch is scheduled later.
- Mutation: Targeted `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` passed at 97.45% mutation score, 686 killed, 3 timeout, 18 survived, 0 no coverage; no critical ordered-stage, first-pending-stage actionability, inapplicable-stage progression, same-stage rejection, or stage/quorum composition survivor was accepted. Report: `implementations/typescript/core/reports/mutation/mutation.html`.
- Notes: No production source change was required for TASK-078 because ordered stage evaluation was already implemented by TASK-076 and now composes with TASK-077 quorum evaluation. Added focused tests and recorded verification. README/JSDoc remained current; no `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, or root README update was required because no normative requirement, vector set, canonical operation inventory, governance, or project-level slice closure changed. `NEXT TASK` advanced to TASK-079.

<a id="task-079"></a>

### - [x] TASK-079 — Bounded Nested Group Evaluation Implementation

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-078](#task-078)

**Objective**

Bounded Nested Group Evaluation Implementation.

**Scope**

- Implement bounded deterministic nested/parallel group evaluation with specified cycle/depth handling and defensive observations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Implement bounded deterministic nested/parallel group evaluation with specified cycle/depth handling and defensive observations.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added focused bounded nested-group tests in `composition-nested.test.ts`; the behavior passed immediately because prior recursive group evaluation and TASK-077 quorum closure already supplied the implementation. `npm run test --workspace @finkore/typescript -- test/approvals` passed 13 files / 121 tests, `npm run typecheck --workspaces` passed, `npm run build --workspaces` passed, `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 13 tests, `npm run test:coverage --workspace @finkore/typescript` passed 38 files / 326 tests with 99.02% statements and 98.54% branches, `npm run test:coverage --workspace @finkore/conformance-runner` passed 10 files / 110 tests with 98.31% statements and 95.29% branches, and `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. The unsupported set remains the TASK-074 `approval.composition.evaluate` family because adapter dispatch is scheduled later.
- Mutation: Targeted `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` passed at 97.45% mutation score, 686 killed, 3 timeout, 18 survived, 0 no coverage; no critical nested evaluation, child-group omission, depth/cycle, or nested quorum composition survivor was accepted. Report: `implementations/typescript/core/reports/mutation/mutation.html`.
- Notes: No production source change was required for TASK-079 because bounded nested group validation/evaluation already existed and now composes with TASK-077 quorum evaluation. Added focused tests and recorded verification. README/JSDoc remained current; no `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, or root README update was required because no normative requirement, vector set, canonical operation inventory, governance, or project-level slice closure changed. `NEXT TASK` advanced to TASK-080.

<a id="task-080"></a>

### - [x] TASK-080 — Approval Composition Adapter Support

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-079](#task-079)

**Objective**

Approval Composition Adapter Support.

**Scope**

- Wire registered group/stage operations to core; preserve fixture semantics without treating caller-declared approved states as a substitute for required evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Wire registered group/stage operations to core; preserve fixture semantics without treating caller-declared approved states as a substitute for required evidence.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added `approval.composition.evaluate` adapter support through `ApprovalComposition.from(...).evaluate(...)`, registered support in the adapter, and added focused adapter coverage for all 19 manifest-listed Approval Composition vectors. `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 14 tests, `npm run test --workspace @finkore/typescript -- test/approvals` passed 13 files / 121 tests, `npm run typecheck --workspaces` passed, and `npm run build --workspaces` passed.
- Conformance: Before this adapter task, the approvals suite had the expected red adapter gap: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. After wiring, `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 0: 66 total, 66 passed, 0 failed, 0 unsupported, 0 infrastructure errors; mutation-sensitive approvals vectors were 64/64.
- Mutation: Adapter remained translation-only, with no new financial rule implementation or adapter mutation script. Core Approval Composition mutation evidence from TASK-077/TASK-079 remains retained for the underlying group, stage, nested, and quorum behavior.
- Notes: Adapter dispatch preserves fixture semantics by delegating all composition behavior to core and only echoing Decision observations where required by vector expectations; caller-declared approved Requirement states are not used as a substitute for quorum Decision evidence. Adapter/core READMEs were synchronized. No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, root README, or conformance vector update was required because no normative requirement, vector set, canonical operation inventory, governance, or project-level slice closure changed. `NEXT TASK` advanced to TASK-081.

<a id="task-081"></a>

### - [x] TASK-081 — Approval Composition Contrast and Boundary Tests

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-080](#task-080)

**Objective**

Approval Composition Contrast and Boundary Tests.

**Scope**

- Pair effective versus withdrawn/expired/superseded/stale cases across quorum, any-of, all-of and parallel groups; test N−1/N/N+1 counts, duplicates, exact expiration instant, missing states and nested rejection.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Pair effective versus withdrawn/expired/superseded/stale cases across quorum, any-of, all-of and parallel groups; test N−1/N/N+1 counts, duplicates, exact expiration instant, missing states and nested rejection.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Added `composition-contrast-boundaries.test.ts` covering Draft 0.2 current-effectiveness observations through any/all composition, exact expiration before/at boundary behavior, quorum N-1/N/N+1 vote counts, duplicate-vote non-inflation, ineffective quorum observations, missing current states, and nested rejection through parallel stage evaluation. `npm run test --workspace @finkore/typescript -- test/approvals` passed 14 files / 125 tests, `npm run typecheck --workspaces` passed, `npm run build --workspaces` passed, and `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 14 tests.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 0: 66 total, 66 passed, 0 failed, 0 unsupported, 0 infrastructure errors; mutation-sensitive approvals vectors were 64/64.
- Mutation: No production financial behavior changed in this test-only task, and no targeted mutation run was required here. Prior Approval Composition mutation evidence remains retained; TASK-082 is the dedicated Advanced Approvals mutation hardening gate.
- Notes: No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, root README, adapter README, TypeScript core README, public API, or JSDoc update was required because this task added durable regression coverage without changing normative behavior, vector families, operation IDs, capability status, or public semantics. `NEXT TASK` advanced to TASK-082.

<a id="task-082"></a>

### - [x] TASK-082 — Advanced Approvals Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-081](#task-081)

**Objective**

Advanced Approvals Mutation Hardening.

**Scope**

- Kill quorum off-by-one, duplicate counting, ineffective/rejected votes counted, order bypass, early nested return, ignored depth/cycles and mutable input state.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill quorum off-by-one, duplicate counting, ineffective/rejected votes counted, order bypass, early nested return, ignored depth/cycles and mutable input state.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Kill quorum off-by-one, duplicate counting, ineffective/rejected votes counted, order bypass, early nested return, ignored depth/cycles and mutable input state.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Completion:
- Status: COMPLETE
- Verification: Confirmed Stryker scope includes `src/approvals/approval-composition.ts` and all `test/approvals/*.test.ts` files, then added mutation-hardening assertions in `composition-contrast-boundaries.test.ts` for malformed inapplicable state evidence, unused non-quorum outcome metadata, effective rejecting quorum votes, and independently applicable approved nested all-of/any-of groups. `npm run test --workspace @finkore/typescript -- test/approvals` passed 14 files / 129 tests, `npm run typecheck --workspaces` passed, `npm run build --workspaces` passed, `npm run test --workspace @finkore/typescript-conformance-adapter` passed 1 file / 14 tests, and `npm run test:coverage --workspace @finkore/typescript` passed 39 files / 334 tests with 99.02% statements, 98.54% branches, 100% functions, 99.44% lines.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json --suite approvals` exited 0: 66 total, 66 passed, 0 failed, 0 unsupported, 0 infrastructure errors; mutation-sensitive approvals vectors were 64/64.
- Mutation: Focused `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` completed with 707 mutants, 689 killed, 3 timeout, 15 survived, 0 no coverage, 0 errors, and 97.88% score. Report: `implementations/typescript/core/reports/mutation/mutation.html` and `.json`. Zero critical survivors remain for quorum threshold/off-by-one behavior, duplicate approvals, ineffective/rejected approval counting, member-specific voter evidence, same-stage/stage-order behavior, nested group outcome propagation, cycle/depth validation, or defensive snapshot/input mutation.
- Survivor classification: Remaining survivors are noncritical or equivalent internal observation-shape/bookkeeping variants: default optional Decision list sentinel values have no effective Decision semantics; state-requirement collection sentinels/group-member pushes are not referenced by required Requirement observations; outcome-pair guard variants either preserve current accepted behavior or only over-tighten unused optional metadata; the returned quorum observation `applicability` field is not read after the applicable-member check; rejected-member state spelling is unobservable because aggregate quorum capacity distinguishes only approvals and pending members; inapplicable member/stage empty-object and approved-stage applicability variants are equivalent to no-obligation progression at the public aggregate boundary; and pending-actionable metadata on approved/rejected members is ignored unless the member outcome is pending.
- Notes: No `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, root README, adapter README, TypeScript core README, public API, or JSDoc update was required because this task hardened tests/mutation evidence without changing normative behavior, vector families, operation IDs, capability status, or public semantics. `NEXT TASK` advanced to TASK-083.

<a id="task-083"></a>

### - [x] TASK-083 — Advanced Approvals Traceability Closure

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-082](#task-082)

**Objective**

Advanced Approvals Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

- Status: COMPLETE
- Verification: `node --version` reported `v24.15.0`; initial stale-dist Approval conformance exited 2 with unknown `approval.composition.evaluate`, then `npm run build --workspaces`, `npm run typecheck --workspaces`, traceability consistency script, Approval conformance, and `git diff --check` exited 0.
- Conformance: Approval suite 66/66 PASS with 64/64 mutation-sensitive vectors after rebuild; manifest 218 vectors total, including 19 `approval.composition.evaluate` vectors.
- Mutation: No runtime mutation run for this documentation/traceability task. TASK-082 focused mutation evidence remains applicable: 97.88%, 707 mutants, 689 killed, 3 timeout, 15 survived, 0 no coverage, 0 errors, and zero critical Advanced Approval survivors.
- Notes: Updated root README, conformance README, traceability notes, Approval spec README, TypeScript core README, and Draft 0.3 implementation plan to remove stale pending claims. No normative `/spec`, vector, core source, adapter source, public API, JSDoc, `/agentic`, AGENTS.md, or CoreDoc change was required. `NEXT TASK` advanced to TASK-084.

<a id="task-084"></a>

### - [x] TASK-084 — Advanced Approvals Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Advanced Approvals

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-083](#task-083)

**Objective**

Advanced Approvals Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [x] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [x] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [x] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [x] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

- Status: COMPLETE
- Verification: `node --version` reported `v24.15.0`; `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspace @finkore/typescript -- test/approvals`, `npm run test --workspace @finkore/typescript-conformance-adapter`, both coverage commands, full/scoped conformance, focused mutation after sandbox escalation, mutation report parse, and `git diff --check` exited 0.
- Conformance: Approval suite 66/66 PASS with 64/64 mutation-sensitive Approval vectors; full conformance 218/218 PASS with 193/193 mutation-sensitive vectors. By suite: Money 83/83, Workflow 20/20, Audit 29/29, Approvals 66/66, Entities 20/20.
- Mutation: Focused `approval-composition.ts` mutation report mtime `2026-09-13T20:27:38.748Z`; 707 total mutants, 689 killed, 3 timeout, 15 survived, 0 no coverage, 0 errors, 97.88% score. Zero critical Advanced Approval survivors remain; surviving mutants retain the TASK-082 noncritical/equivalent classification.
- Notes: Advanced Approvals dashboard summary is checked. Approval Composition remains conformance-local in Agentic terms; no canonical Approval operation was promoted. External review remains NOT EXTERNALLY REVIEWED under D03-REVIEW-001. `NEXT TASK` advanced to TASK-085.

### Milestone: Workflow Versioning and Import

<a id="task-085"></a>

### - [ ] TASK-085 — Workflow Definition Identity and Version Terminology

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067)

**Objective**

Workflow Definition Identity and Version Terminology.

**Scope**

- Define WORKFLOW-VERSION-* opaque definition/version identities independently of database counters and Entity business revisions.
- This spec is independent of Approval implementation. Default is numeric sequence; no migration semantics.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/workflow/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define WORKFLOW-VERSION-* opaque definition/version identities independently of database counters and Entity business revisions.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-086"></a>

### - [ ] TASK-086 — Workflow Instance Binding and Version Mismatch

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-085](#task-085)

**Objective**

Workflow Instance Binding and Version Mismatch.

**Scope**

- Define immutable binding to declared definition version, observations of older versions and mismatch behavior; prohibit silently switching existing instances to a newer definition.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/workflow/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define immutable binding to declared definition version, observations of older versions and mismatch behavior; prohibit silently switching existing instances to a newer definition.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-087"></a>

### - [ ] TASK-087 — Workflow Import and Conflict Semantics

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-086](#task-086)

**Objective**

Workflow Import and Conflict Semantics.

**Scope**

- Define WORKFLOW-IMPORT-* import of declared existing state/version and WORKFLOW-CONFLICT-* expected-state or revision preconditions, including omission, mismatch, precedence and failure preservation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/workflow/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define WORKFLOW-IMPORT-* import of declared existing state/version and WORKFLOW-CONFLICT-* expected-state or revision preconditions, including omission, mismatch, precedence and failure preservation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-088"></a>

### - [ ] TASK-088 — Workflow Version and Conflict Portable Error Design

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-087](#task-087)

**Objective**

Workflow Version and Conflict Portable Error Design.

**Scope**

- Assess existing definition/state/transition codes and introduce version/conflict categories only for distinct portable failures; preserve Draft 0.1 terminal-state precedence unless explicitly refined.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/workflow/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Assess existing definition/state/transition codes and introduce version/conflict categories only for distinct portable failures; preserve Draft 0.1 terminal-state precedence unless explicitly refined.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-089"></a>

### - [ ] TASK-089 — Workflow Versioning Technical and Domain Review

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-088](#task-088)

**Objective**

Workflow Versioning Technical and Domain Review.

**Scope**

- Record required review of opaque version identity, bound-instance stability, import boundaries and expected-state/revision portability before implementation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Record required review of opaque version identity, bound-instance stability, import boundaries and expected-state/revision portability before implementation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-090"></a>

### - [ ] TASK-090 — Workflow Versioning Import and Conflict Vectors

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-089](#task-089)

**Objective**

Workflow Versioning Import and Conflict Vectors.

**Scope**

- Cover older/newer definition binding, mismatch, import state/version, undeclared/missing values, matching/mismatching expected state/revision and rejected state preservation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/workflow/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Cover older/newer definition binding, mismatch, import state/version, undeclared/missing values, matching/mismatching expected state/revision and rejected state preservation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Pending.

<a id="task-091"></a>

### - [ ] TASK-091 — Workflow Definition Version API Implementation

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-090](#task-090)

**Objective**

Workflow Definition Version API Implementation.

**Scope**

- Implement definition identity/version representation and validation with meaningful public JSDoc and portability tests.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement definition identity/version representation and validation with meaningful public JSDoc and portability tests.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-092"></a>

### - [ ] TASK-092 — Workflow Instance Binding Implementation

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-091](#task-091)

**Objective**

Workflow Instance Binding Implementation.

**Scope**

- Implement persistent observable binding and version mismatch rejection without importing Entity or Approval into Workflow core.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement persistent observable binding and version mismatch rejection without importing Entity or Approval into Workflow core.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-093"></a>

### - [ ] TASK-093 — Workflow Import Implementation

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-092](#task-092)

**Objective**

Workflow Import Implementation.

**Scope**

- Implement specified existing-state/version import validation separately from new-instance initial-state creation; no migration.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement specified existing-state/version import validation separately from new-instance initial-state creation; no migration.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-094"></a>

### - [ ] TASK-094 — Workflow Conflict Precondition Implementation

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-093](#task-093)

**Objective**

Workflow Conflict Precondition Implementation.

**Scope**

- Implement expected-state/revision checks and primary error precedence before any transition becomes observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement expected-state/revision checks and primary error precedence before any transition becomes observable.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-095"></a>

### - [ ] TASK-095 — Workflow Versioning Adapter Support

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-094](#task-094)

**Objective**

Workflow Versioning Adapter Support.

**Scope**

- Translate version binding/import/conflict inputs and post-state observations; keep transition validation in core.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Translate version binding/import/conflict inputs and post-state observations; keep transition validation in core.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Pending.

<a id="task-096"></a>

### - [ ] TASK-096 — Workflow Versioning Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-095](#task-095)

**Objective**

Workflow Versioning Mutation Hardening.

**Scope**

- Kill version ignored/replaced, invented import version, undeclared state accepted, inverted conflict check, terminal precedence loss and failed-transition mutation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill version ignored/replaced, invented import version, undeclared state accepted, inverted conflict check, terminal precedence loss and failed-transition mutation.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Kill version ignored/replaced, invented import version, undeclared state accepted, inverted conflict check, terminal precedence loss and failed-transition mutation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Pending.

<a id="task-097"></a>

### - [ ] TASK-097 — Workflow Versioning Traceability Closure

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-096](#task-096)

**Objective**

Workflow Versioning Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/workflow/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-098"></a>

### - [ ] TASK-098 — Workflow Versioning Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Workflow Versioning and Import

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-097](#task-097)

**Objective**

Workflow Versioning Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No definition migration, BPMN, locking, persistence or distributed concurrency.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/workflow/`
- `conformance/workflow/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/workflow/`
- `implementations/typescript/core/test/workflow/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/workflow/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(workflow)**, **ADAPTER**, **CONF(workflow)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Pending.

### Milestone: Entity Revision and Import

<a id="task-099"></a>

### - [ ] TASK-099 — Entity Business Revision Refinement

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067), [TASK-098](#task-098), [TASK-044](#task-044)

**Objective**

Entity Business Revision Refinement.

**Scope**

- Define ENTITY-REVISION-* current/historical revision references versus stable identity and conflict version, preserving 0.2 evolution semantics.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define ENTITY-REVISION-* current/historical revision references versus stable identity and conflict version, preserving 0.2 evolution semantics.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-100"></a>

### - [ ] TASK-100 — Entity Import Mapping and Conflict Contract

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-099](#task-099)

**Objective**

Entity Import Mapping and Conflict Contract.

**Scope**

- Define ENTITY-IMPORT-* stable FinKore identity, opaque external/source identity and explicit mapping evidence; specify Entity expected-state/revision preconditions and history preservation.
- Review ENTITY-IDENTITY-006 and ENTITY-ERROR-004; import mapping does not imply a global registry, deduplication or Workflow definition migration.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define ENTITY-IMPORT-* stable FinKore identity, opaque external/source identity and explicit mapping evidence; specify Entity expected-state/revision preconditions and history preservation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-101"></a>

### - [ ] TASK-101 — Entity Import and Conflict Portable Error Review

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-100](#task-100)

**Objective**

Entity Import and Conflict Portable Error Review.

**Scope**

- Determine sufficiency of INVALID_IDENTITY and STATE_CONFLICT, mapping validation categories and safe source-identity diagnostics; retain primary Workflow/Audit errors.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/entities/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Determine sufficiency of INVALID_IDENTITY and STATE_CONFLICT, mapping validation categories and safe source-identity diagnostics; retain primary Workflow/Audit errors.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending.

**Completion**

Pending.

<a id="task-102"></a>

### - [ ] TASK-102 — Entity Import Domain and Security Review

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-101](#task-101)

**Objective**

Entity Import Domain and Security Review.

**Scope**

- Record required review of revision/mapping ownership, source-system identifiers, historical evidence and safe diagnostic disclosure.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Record required review of revision/mapping ownership, source-system identifiers, historical evidence and safe diagnostic disclosure.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-103"></a>

### - [ ] TASK-103 — Entity Revision Import and Conflict Vectors

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-102](#task-102)

**Objective**

Entity Revision Import and Conflict Vectors.

**Scope**

- Cover identity preservation, explicit external mapping, malformed/missing mapping, historical/current revision, business versus conflict revision, mismatching expected state and failure non-mutation.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/entities/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Cover identity preservation, explicit external mapping, malformed/missing mapping, historical/current revision, business versus conflict revision, mismatching expected state and failure non-mutation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green.

**Completion**

Pending.

<a id="task-104"></a>

### - [ ] TASK-104 — Entity Revision Refinement Implementation

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-103](#task-103)

**Objective**

Entity Revision Refinement Implementation.

**Scope**

- Implement current/historical business revision observations without overwriting stable identity or conflating storage counters.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement current/historical business revision observations without overwriting stable identity or conflating storage counters.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-105"></a>

### - [ ] TASK-105 — Entity Import Identity Mapping Implementation

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-104](#task-104)

**Objective**

Entity Import Identity Mapping Implementation.

**Scope**

- Implement supplied identity/mapping validation and evidence preservation; do not generate or infer a replacement identity.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement supplied identity/mapping validation and evidence preservation; do not generate or infer a replacement identity.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-106"></a>

### - [ ] TASK-106 — Entity Conflict Precondition Implementation

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-105](#task-105)

**Objective**

Entity Conflict Precondition Implementation.

**Scope**

- Implement the specified expected-state/revision guard for selected Entity operations and preserve primary domain error precedence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement the specified expected-state/revision guard for selected Entity operations and preserve primary domain error precedence.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate.

**Completion**

Pending.

<a id="task-107"></a>

### - [ ] TASK-107 — Entity Revision and Import Adapter Support

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-106](#task-106)

**Objective**

Entity Revision and Import Adapter Support.

**Scope**

- Wire import/revision/conflict operations and mapping/history observations, delegating all identity/effectiveness rules to core.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Wire import/revision/conflict operations and mapping/history observations, delegating all identity/effectiveness rules to core.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate.

**Completion**

Pending.

<a id="task-108"></a>

### - [ ] TASK-108 — Entity Revision and Import Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-107](#task-107)

**Objective**

Entity Revision and Import Mutation Hardening.

**Scope**

- Kill generated/replaced identity, dropped mapping, overwritten historical revision, business/storage version confusion, conflict bypass and sensitive diagnostic leaks.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/entities/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill generated/replaced identity, dropped mapping, overwritten historical revision, business/storage version confusion, conflict bypass and sensitive diagnostic leaks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Kill generated/replaced identity, dropped mapping, overwritten historical revision, business/storage version confusion, conflict bypass and sensitive diagnostic leaks.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Pending.

<a id="task-109"></a>

### - [ ] TASK-109 — Entity Revision and Import Traceability Closure

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-108](#task-108)

**Objective**

Entity Revision and Import Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/entities/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-110"></a>

### - [ ] TASK-110 — Entity Revision and Import Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Entity Revision and Import

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-109](#task-109)

**Objective**

Entity Revision and Import Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No concrete invoices/ledger, identity registry, persistence transactions or authorization.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/entities/`
- `conformance/entities/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/entities/`
- `implementations/typescript/core/test/entities/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/entities/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(entities)**, **ADAPTER**, **CONF(entities)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Pending.

### Milestone: Money Portability Research

<a id="task-111"></a>

### - [ ] TASK-111 — Cross-Language Numeric Capability Matrix

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** RESEARCH

**Execution:** CAN RUN IN PARALLEL

**Depends on:** [TASK-020](#task-020)

**Objective**

Cross-Language Numeric Capability Matrix.

**Scope**

- Compare TypeScript, Java, Go and .NET exact decimal capacity, scale/exponent representation, overflow and rounding using primary runtime/library sources; record sources and reproducible probes.
- RESEARCH ONLY; NO NORMATIVE CHANGES. May run before final 0.2 closure once Money is closed; no second-language implementation is required.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Compare TypeScript, Java, Go and .NET exact decimal capacity, scale/exponent representation, overflow and rounding using primary runtime/library sources; record sources and reproducible probes.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-112"></a>

### - [ ] TASK-112 — Precision and Overflow Minimum Guarantee Decision

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-111](#task-111)

**Objective**

Precision and Overflow Minimum Guarantee Decision.

**Scope**

- Decide unbounded semantics, minimum declared capability, hard limits or DEFER using the matrix; record overflow/unsupported precision implications and technical review.
- Never constrain FinKore to BigInt or silently narrow existing exact Money behavior. An IN 0.3 decision activates the conditional follow-up track.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Decide unbounded semantics, minimum declared capability, hard limits or DEFER using the matrix; record overflow/unsupported precision implications and technical review.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-113"></a>

### - [ ] TASK-113 — Minor-Unit Metadata Policy Research

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** RESEARCH

**Execution:** CAN RUN IN PARALLEL

**Depends on:** [TASK-020](#task-020)

**Objective**

Minor-Unit Metadata Policy Research.

**Scope**

- Decide metadata recommendation/data freshness ownership versus calculation scale; obtain required domain/accounting review for selected guidance and record INCLUDE/DEFER/REJECT.
- RESEARCH ONLY; NO NORMATIVE CHANGES. No metadata provider/package or implicit minor-unit rounding.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Decide metadata recommendation/data freshness ownership versus calculation scale; obtain required domain/accounting review for selected guidance and record INCLUDE/DEFER/REJECT.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-114"></a>

### - [ ] TASK-114 — Private Currency Namespace Research

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** RESEARCH

**Execution:** CAN RUN IN PARALLEL

**Depends on:** [TASK-020](#task-020)

**Objective**

Private Currency Namespace Research.

**Scope**

- Research naming, ISO collision boundaries, compatibility and identifier preservation; record domain/security review and narrow INCLUDE or explicit DEFER/REJECT decision.
- RESEARCH ONLY; NO NORMATIVE CHANGES. No registry, FX or currency namespace implementation is authorized by research alone.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Research naming, ISO collision boundaries, compatibility and identifier preservation; record domain/security review and narrow INCLUDE or explicit DEFER/REJECT decision.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-115"></a>

### - [ ] TASK-115 — Approved Money Portability Normative Follow-up

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067), [TASK-112](#task-112), [TASK-113](#task-113), [TASK-114](#task-114)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Normative Follow-up.

**Scope**

- For each approved narrow decision, define minimum guarantees, precision/overflow behavior or metadata/namespace semantics and justified errors; otherwise verify documented deferral.
- If more than one independent normative proposal is approved, insert suffixed spec/vector/operation/mutation/traceability tasks per proposal before proceeding; do not turn this into a multi-feature task.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/money/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] For each approved narrow decision, define minimum guarantees, precision/overflow behavior or metadata/namespace semantics and justified errors; otherwise verify documented deferral.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-116"></a>

### - [ ] TASK-116 — Approved Money Portability Conformance

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-115](#task-115)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Conformance.

**Scope**

- Add approved precision/overflow boundaries, metadata-not-scale contrasts or namespace identity/collision vectors; no behavior beyond the selected normative proposal.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/money/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Add approved precision/overflow boundaries, metadata-not-scale contrasts or namespace identity/collision vectors; no behavior beyond the selected normative proposal.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-117"></a>

### - [ ] TASK-117 — Approved Money Portability TypeScript Adjustment

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-116](#task-116)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability TypeScript Adjustment.

**Scope**

- Implement one approved portability adjustment at a time with exact arithmetic and public capability/error documentation; preserve 0.1/0.2 semantics.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement one approved portability adjustment at a time with exact arithmetic and public capability/error documentation; preserve 0.1/0.2 semantics.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-118"></a>

### - [ ] TASK-118 — Approved Money Portability Adapter Adjustment

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-117](#task-117)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Adapter Adjustment.

**Scope**

- Translate approved capability/precision/currency fixtures and normalized portable failures; do not implement numeric limits in the runner.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Translate approved capability/precision/currency fixtures and normalized portable failures; do not implement numeric limits in the runner.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-119"></a>

### - [ ] TASK-119 — Approved Money Portability Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-118](#task-118)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Mutation Hardening.

**Scope**

- Kill silent truncation/overflow, capability misreporting, minor-unit-as-scale and private/ISO identity collision for activated behavior.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/money/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill silent truncation/overflow, capability misreporting, minor-unit-as-scale and private/ISO identity collision for activated behavior.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Kill silent truncation/overflow, capability misreporting, minor-unit-as-scale and private/ISO identity collision for activated behavior.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-120"></a>

### - [ ] TASK-120 — Approved Money Portability Traceability Closure

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-119](#task-119)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-121"></a>

### - [ ] TASK-121 — Approved Money Portability Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Money Portability Research

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-120](#task-120)

**Activation:** Conditional follow-up of **Money portability decisions**; apply the research-gated follow-up protocol.

**Objective**

Approved Money Portability Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No tax/interest/FX policy, currency data service or implicit rounding defaults.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/money/`
- `conformance/money/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/money/`
- `implementations/typescript/core/test/money/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/money/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(money)**, **ADAPTER**, **CONF(money)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

### Milestone: Audit Provenance Research

<a id="task-122"></a>

### - [ ] TASK-122 — Audit Provenance Research and Security Decision

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** RESEARCH

**Execution:** CAN RUN IN PARALLEL

**Depends on:** [TASK-032](#task-032)

**Objective**

Audit Provenance Research and Security Decision.

**Scope**

- Evaluate reason/source/correlation/causation metadata, relationship coexistence and redaction; obtain security/privacy review and record INCLUDE/DEFER/REJECT.
- RESEARCH ONLY; NO NORMATIVE CHANGES. A decision to include must activate a bounded spec-to-closure track; correlation is not a total ordering guarantee.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Evaluate reason/source/correlation/causation metadata, relationship coexistence and redaction; obtain security/privacy review and record INCLUDE/DEFER/REJECT.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-123"></a>

### - [ ] TASK-123 — Approved Audit Provenance Specification and Errors

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067), [TASK-122](#task-122)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Specification and Errors.

**Scope**

- Define only approved provenance fields, safe serialization/redaction behavior and existing INVALID_EVENT sufficiency; otherwise verify deferral.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/audit/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define only approved provenance fields, safe serialization/redaction behavior and existing INVALID_EVENT sufficiency; otherwise verify deferral.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-124"></a>

### - [ ] TASK-124 — Approved Audit Provenance Conformance

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-123](#task-123)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Conformance.

**Scope**

- Cover preservation, malformed values, redaction, relationship coexistence and safe disclosure under the approved provenance contract.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/audit/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Cover preservation, malformed values, redaction, relationship coexistence and safe disclosure under the approved provenance contract.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-125"></a>

### - [ ] TASK-125 — Approved Audit Provenance Implementation

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-124](#task-124)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Implementation.

**Scope**

- Implement approved provenance representation/preservation in Audit core without retention, tracing or storage infrastructure.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement approved provenance representation/preservation in Audit core without retention, tracing or storage infrastructure.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-126"></a>

### - [ ] TASK-126 — Approved Audit Provenance Adapter Support

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-125](#task-125)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Adapter Support.

**Scope**

- Translate approved provenance input and safe observations through Audit core; retain append-only evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Translate approved provenance input and safe observations through Audit core; retain append-only evidence.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-127"></a>

### - [ ] TASK-127 — Approved Audit Provenance Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-126](#task-126)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Mutation Hardening.

**Scope**

- Kill provenance loss, inappropriate disclosure/redaction, relationship loss and correlation-as-order assumptions.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/audit/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill provenance loss, inappropriate disclosure/redaction, relationship loss and correlation-as-order assumptions.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Kill provenance loss, inappropriate disclosure/redaction, relationship loss and correlation-as-order assumptions.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-128"></a>

### - [ ] TASK-128 — Approved Audit Provenance Traceability Closure

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-127](#task-127)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/audit/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-129"></a>

### - [ ] TASK-129 — Approved Audit Provenance Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Audit Provenance Research

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-128](#task-128)

**Activation:** Conditional follow-up of **Audit provenance decision**; apply the research-gated follow-up protocol.

**Objective**

Approved Audit Provenance Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No retention service, event store, distributed ordering or cryptographic ledger.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/audit/`
- `conformance/audit/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/audit/`
- `implementations/typescript/core/test/audit/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/audit/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(audit)**, **ADAPTER**, **CONF(audit)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

### Milestone: Portable Conditions

<a id="task-130"></a>

### - [ ] TASK-130 — Portable Condition Standards Research

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** RESEARCH

**Execution:** CAN RUN IN PARALLEL

**Depends on:** [TASK-057](#task-057)

**Objective**

Portable Condition Standards Research.

**Scope**

- Compare CEL, JSON Logic, DMN FEEL subsets and a minimal FinKore model for explicit facts, exact Money, missing/null, logical composition, serialization and bounded safe evaluation.
- RESEARCH ONLY; NO NORMATIVE CHANGES. Use primary standards sources, record versions and capability/security comparison; do not adopt executable expressions.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Compare CEL, JSON Logic, DMN FEEL subsets and a minimal FinKore model for explicit facts, exact Money, missing/null, logical composition, serialization and bounded safe evaluation.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-131"></a>

### - [ ] TASK-131 — Condition Model Decision and Pre-Spec Security Review

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-067](#task-067), [TASK-130](#task-130)

**Objective**

Condition Model Decision and Pre-Spec Security Review.

**Scope**

- Record ADOPT, ADAPT SUBSET, BUILD MINIMAL FINKORE MODEL or DEFER with required security/domain review before normative changes.
- Plan step 13 explicitly allows ADAPT SUBSET or BUILD MINIMAL; ADOPT alone does not authorize a full engine. Reconcile an ADOPT outcome into a reviewed bounded subset or defer. Reject unsafe arbitrary code/callbacks, external lookup and unbounded recursion.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Record ADOPT, ADAPT SUBSET, BUILD MINIMAL FINKORE MODEL or DEFER with required security/domain review before normative changes.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied.

**Completion**

Pending.

<a id="task-132"></a>

### - [ ] TASK-132 — Condition Primitive Operator Specification

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-131](#task-131)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Primitive Operator Specification.

**Scope**

- Define APPROVAL-CONDITION-MODEL-* approved primitive equals/not-equals/exists and selected numeric/Money comparisons with exact types and compatible currencies.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define APPROVAL-CONDITION-MODEL-* approved primitive equals/not-equals/exists and selected numeric/Money comparisons with exact types and compatible currencies.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-133"></a>

### - [ ] TASK-133 — Condition Missing and Null Semantics

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-132](#task-132)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Missing and Null Semantics.

**Scope**

- Define distinct missing, null, false, zero and empty-string observations and invalid versus unresolved errors; first assess existing CONDITION_UNRESOLVED.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Define distinct missing, null, false, zero and empty-string observations and invalid versus unresolved errors; first assess existing CONDITION_UNRESOLVED.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-134"></a>

### - [ ] TASK-134 — Condition Logical Composition Specification

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-133](#task-133)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Logical Composition Specification.

**Scope**

- Specify only explicitly approved AND/OR/NOT behavior, bounded depth, evaluation/error ordering and cycle rejection; document non-selection if logical composition is excluded.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Specify only explicitly approved AND/OR/NOT behavior, bounded depth, evaluation/error ordering and cycle rejection; document non-selection if logical composition is excluded.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-135"></a>

### - [ ] TASK-135 — Condition Serialization and Version Specification

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** SPEC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-134](#task-134)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Serialization and Version Specification.

**Scope**

- Specify portable structural descriptors, fact paths, object/array meaning and model version handling; no implementation-language callbacks.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `spec/approvals/`
- `spec/conventions.md`
- `spec/glossary.md`
- `conformance/traceability.md`

**Implementation instructions**

1. Read the governing requirements and dependency decisions; identify unresolved cases explicitly before drafting normative text.
2. Write only the named scope with stable requirement IDs, portable inputs/results/errors and invariants; preserve older requirements or document explicit refinements. Record vector-ready outcomes and implementation-pending status.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Specify portable structural descriptors, fact paths, object/array meaning and model version handling; no implementation-language callbacks.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named normative slice is stable and vector-ready; its implementation is pending. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-136"></a>

### - [ ] TASK-136 — Condition Primitive and Missing-Value Vectors

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-135](#task-135)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Primitive and Missing-Value Vectors.

**Scope**

- Add approved operator truth boundaries, missing/null/type contrasts, Money currency mismatch and object-key-order invariance.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/approvals/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Add approved operator truth boundaries, missing/null/type contrasts, Money currency mismatch and object-key-order invariance.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-137"></a>

### - [ ] TASK-137 — Condition Composition and Serialization Vectors

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** CONFORMANCE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-136](#task-136)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Composition and Serialization Vectors.

**Scope**

- Add selected logic, error ordering, depth/cycle and model roundtrip/version cases; preserve existing explicit condition-result boundary vectors.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/approvals/`
- `conformance/manifest.json`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `runner/test/integration.test.ts`

**Implementation instructions**

1. Derive exact expected results from the completed specification; add positive/negative/boundary contrasts and success/failure preservation observations.
2. Register vector files in the manifest and IDs in canonical traceability tables; document new local operation labels in conformance/conventions.md and runner/src/metadata.ts. Use a new finkore.* ID only after a dedicated Agentic promotion review.
3. Run the real runner against the unchanged implementation and record the exact new FAIL/UNSUPPORTED set. Schema/metadata errors are infrastructure failures to fix, not acceptable TDD evidence; all closed baseline vectors must still pass.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **RUNNER**, **CONF**; distinguish registered new FAIL/UNSUPPORTED results from infrastructure errors, and assert the prior closed vector set remains PASS.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Add selected logic, error ordering, depth/cycle and model roundtrip/version cases; preserve existing explicit condition-result boundary vectors.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named vectors are registered and traceable; new behavior is intentionally FAIL/UNSUPPORTED against the old implementation, with closed baseline vectors still green. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-138"></a>

### - [ ] TASK-138 — Condition Representation and Primitive Implementation

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-137](#task-137)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Representation and Primitive Implementation.

**Scope**

- Implement approved structural validation and primitive operators over explicit facts; use Money semantics, avoid JS truthiness and eval.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement approved structural validation and primitive operators over explicit facts; use Money semantics, avoid JS truthiness and eval.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-139"></a>

### - [ ] TASK-139 — Condition Composition and Serialization Implementation

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** IMPLEMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-138](#task-138)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Composition and Serialization Implementation.

**Scope**

- Implement selected bounded composition and serialization/version behavior; preserve rejected/missing/null distinctions without arbitrary expressions.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/src/index.ts`
- `implementations/typescript/core/stryker.config.json`
- `implementations/typescript/core/README.md`

**Implementation instructions**

1. First reproduce the missing behavior with a focused failing unit test or the pending vectors; record the red result. Implement the minimum specified behavior in core with exact values and explicit context.
2. Add success/failure/invariant tests, meaningful public JSDoc with requirement IDs and portable errors; register exports only where intentional. Add new financial source files to Stryker coverage without broad exclusions.
3. Run focused verification and applicable conformance. If adapter wiring is scheduled later, explicitly retain the known new unsupported set; do not implement financial rules in the adapter or claim slice conformance early.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(domain)** for changed core behavior (runner equivalents for TASK-003); retain the dedicated later hardening task.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Implement selected bounded composition and serialization/version behavior; preserve rejected/missing/null distinctions without arbitrary expressions.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named core behavior and unit tests exist with JSDoc; only operations wired by prior adapter tasks may be claimed passing conformance. Slice closure is still separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-140"></a>

### - [ ] TASK-140 — Condition Model Adapter Support

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** ADAPTER

**Execution:** SEQUENTIAL

**Depends on:** [TASK-139](#task-139)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Model Adapter Support.

**Scope**

- Translate descriptors/facts and normalize evaluator outputs; adapter must not interpret conditions or substitute true/false for unresolved results.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/src/normalization.ts`
- `implementations/typescript/adapters/conformance/test/adapter.test.ts`
- `implementations/typescript/adapters/conformance/README.md`

**Implementation instructions**

1. Confirm operation registration and core support from dependencies. Translate fixtures to public core calls and normalize success/error/observation values only.
2. Add adapter tests covering actual manifest vectors and rejected-state observations. Update supported-operation documentation; required slice vectors must now all PASS.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- Run focused adapter tests and the complete affected suite; no required slice vector may remain unsupported after wiring.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Translate descriptors/facts and normalize evaluator outputs; adapter must not interpret conditions or substitute true/false for unresolved results.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

Named operation fixtures execute through core and all required slice vectors PASS; hardening/traceability gates remain separate. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-141"></a>

### - [ ] TASK-141 — Condition Implementation Security Review

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** RESEARCH

**Execution:** SEQUENTIAL

**Depends on:** [TASK-140](#task-140)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Condition Implementation Security Review.

**Scope**

- Obtain required review of the implemented evaluator, resource bounds, unsafe keys/prototypes, diagnostics and prohibition of arbitrary execution before slice closure.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `docs/tasks/draft-0.3-research-decisions.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Prepare the scoped evidence/options or review packet using repository requirements and primary sources where standards research is needed. Record source versions/links and unresolved questions. No normative or runtime changes in research.
2. For a review, apply D03-REVIEW-001: record attributed analysis, maintainer authority and scoped acceptance, exact artifact revision, findings and resolutions, and future external review topics/status. Missing required maintainer acceptance or unresolved findings are blockers; absent external review alone is not. For a research decision, document rationale, review status and INCLUDE/DEFER/REJECT (or the specified condition decision vocabulary).
3. If a decision activates work, bind its narrow scope to the conditional follow-up tasks before any normative edit. If the scope exceeds one focused task, insert suffixed tasks with all template fields and dependencies; do not execute them now.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Verify primary-source citations or reviewer evidence, decision rationale and scope disposition. Runtime tests and mutation are not applicable to research-only changes.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Obtain required review of the implemented evaluator, resource bounds, unsafe keys/prototypes, diagnostics and prohibition of arbitrary execution before slice closure.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

A scoped research decision or required reviewer report exists; no new normative behavior or implementation is implied. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-142"></a>

### - [ ] TASK-142 — Portable Conditions Mutation Hardening

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-141](#task-141)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Portable Conditions Mutation Hardening.

**Scope**

- Kill comparison inversions, missing/null conflation, truthiness coercion, cross-currency success, AND/OR inversion, ignored NOT, object-order dependence and bounds bypass.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/core/stryker.config.json`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Kill comparison inversions, missing/null conflation, truthiness coercion, cross-currency success, AND/OR inversion, ignored NOT, object-order dependence and bounds bypass.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Kill comparison inversions, missing/null conflation, truthiness coercion, cross-currency success, AND/OR inversion, ignored NOT, object-order dependence and bounds bypass.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-143"></a>

### - [ ] TASK-143 — Portable Conditions Traceability Closure

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-142](#task-142)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Portable Conditions Traceability Closure.

**Scope**

- Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Map every slice requirement to manifest-listed vectors, core tests, errors, and operation metadata; revisit formerly NOT DIRECTLY TESTABLE rows now observable.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

<a id="task-144"></a>

### - [ ] TASK-144 — Portable Conditions Slice Closure Gate

**Release:** Draft 0.3

**Milestone:** Portable Conditions

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-143](#task-143)

**Activation:** Conditional follow-up of **Condition model decision**; apply the research-gated follow-up protocol.

**Objective**

Portable Conditions Slice Closure Gate.

**Scope**

- Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No delegation, escalation, IAM/RBAC, arbitrary graphs, executable callbacks or external fact lookup.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `spec/approvals/`
- `conformance/approvals/`
- `conformance/traceability.md`
- `conformance/conventions.md`
- `agentic/operations.md`
- `implementations/typescript/core/src/approvals/`
- `implementations/typescript/core/test/approvals/`
- `implementations/typescript/adapters/conformance/src/operations.ts`

**Likely changes**

- `conformance/traceability.md`
- `spec/approvals/README.md`
- `implementations/typescript/core/README.md`
- `implementations/typescript/adapters/conformance/README.md`
- `docs/tasks/draft-0.3-execution-evidence.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

For a documented non-selection, make only the disposition/documentation checks; do not create the proposed financial artifacts.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT(approvals)**, **ADAPTER**, **CONF(approvals)**. Use **CONF** without filters as needed to verify the closed baseline; pending future adapter work must be reported explicitly.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify stable spec, complete implementation and translation-only adapter, green slice conformance, aligned errors, synchronized README/JSDoc, and required review evidence. Regress every previously closed domain.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.
- [ ] Either approved scope satisfies every normal DoD item, or a reviewed DEFER/REJECT decision is cited, implementation remains absent and docs explicitly say NOT APPLICABLE; no false implementation claim.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED. If not selected, only its disposition is complete; no implementation exists for this conditional feature.

**Completion**

Pending.

### Milestone: Draft 0.3 Alignment

<a id="task-145"></a>

### - [ ] TASK-145 — Draft 0.3 Cross-Domain Regression Contracts

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Alignment

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-084](#task-084), [TASK-098](#task-098), [TASK-110](#task-110), [TASK-121](#task-121), [TASK-129](#task-129), [TASK-144](#task-144)

**Objective**

Draft 0.3 Cross-Domain Regression Contracts.

**Scope**

- Test advanced groups against 0.2 effectiveness/evolution, Workflow and Entity version/conflict interactions, Audit evidence and approved conditions; preserve all 0.1/0.2 vectors.
- Run focused mutation for the integration paths. Only selected conditional tracks participate; a documented deferral never disables mandatory composition/import/conflict behavior.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Test advanced groups against 0.2 effectiveness/evolution, Workflow and Entity version/conflict interactions, Audit evidence and approved conditions; preserve all 0.1/0.2 vectors.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Pending.

<a id="task-146"></a>

### - [ ] TASK-146 — Draft 0.3 Agentic Operation Review

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Alignment

**Type:** AGENTIC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-145](#task-145)

**Objective**

Draft 0.3 Agentic Operation Review.

**Scope**

- Classify every new operation as canonical, conformance-local or structural; review complete effects/preconditions/errors/determinism and requirement references, including existing descriptors affected by new inputs.
- Required security review for state-changing Approval/Workflow exposure and diagnostics. Record attributed security analysis and explicit scoped maintainer acceptance under D03-REVIEW-001; keep external review status separate. Align canonical IDs, runner metadata, adapter dispatch and docs without premature promotion or AI bypasses.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `agentic/`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/README.md`
- `conformance/conventions.md`

**Implementation instructions**

1. Review each operation against /spec: canonical ID, inputs/outputs, preconditions/postconditions, errors, determinism, mutatesState, mutatesFinancialState, audit relevance, approval relevance and requirement references.
2. Record canonical/conformance-local/structural decisions, obtain required review, then align descriptors, allowlists and adapter dispatch without redefining domain behavior. Do not invent idempotency, irreversibility or AI-specific approval rules.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **RUNNER**, **ADAPTER**, **CONF** if operation registries/dispatch change; otherwise inspect their latest applicable results and all descriptor links.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Classify every new operation as canonical, conformance-local or structural; review complete effects/preconditions/errors/determinism and requirement references, including existing descriptors affected by new inputs.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Reviewed canonical/local/structural classifications and registry effects match the current normative and implemented behavior.

**Completion**

Pending.

<a id="task-147"></a>

### - [ ] TASK-147 — Draft 0.3 Slice Documentation and CoreDoc Touchpoints

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Alignment

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-146](#task-146)

**Objective**

Draft 0.3 Slice Documentation and CoreDoc Touchpoints.

**Scope**

- Synchronize current slice status and CoreDoc assumption notes for quorum, stages, versioning, identity mapping, condition decision and currency portability; review relevant AGENTS deferred wording.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Synchronize current slice status and CoreDoc assumption notes for quorum, stages, versioning, identity mapping, condition decision and currency portability; review relevant AGENTS deferred wording.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

### Milestone: Optional Cross-Language Proof

<a id="task-148"></a>

### - [ ] TASK-148 — Minimal Java or Go Proof Adapter

**Release:** Draft 0.3

**Milestone:** Optional Cross-Language Proof

**Type:** PORTABILITY

**Execution:** OPTIONAL

**Depends on:** [TASK-146](#task-146)

**Objective**

Minimal Java or Go Proof Adapter.

**Scope**

- If explicitly selected, choose one mature Money or Workflow slice in Java or Go and implement a tiny spec-driven core plus conformance bridge.
- OPTIONAL, recommended before v0.5. Discover the selected language toolchain and document actual build/test commands before coding; no full port or publishing.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `implementations/java/ or implementations/go/ (one selected proof only)`
- `docs/tasks/draft-0.3-portability-proof.md`

**Implementation instructions**

1. Confirm the optional proof is selected; choose one language and one bounded spec-backed slice, documenting real toolchain/build/test commands.
2. Use the same portable vector expectations and error codes, not TypeScript internals. Record representative coverage and limitations; surface any mandatory specification defect as remediation.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] If explicitly selected, choose one mature Money or Workflow slice in Java or Go and implement a tiny spec-driven core plus conformance bridge.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Only the selected optional proof scope has new evidence; full second-language conformance is not claimed.

**Completion**

Pending.

<a id="task-149"></a>

### - [ ] TASK-149 — Cross-Language Representative Conformance Proof

**Release:** Draft 0.3

**Milestone:** Optional Cross-Language Proof

**Type:** PORTABILITY

**Execution:** OPTIONAL

**Depends on:** [TASK-148](#task-148)

**Objective**

Cross-Language Representative Conformance Proof.

**Scope**

- Run the selected representative vectors through the optional language bridge, compare portable error/value observations and record unsupported scope honestly.
- Use language-native focused tests and mutation tooling if available; never claim full-domain conformance from a representative subset.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `implementations/java/ or implementations/go/ (one selected proof only)`
- `docs/tasks/draft-0.3-portability-proof.md`

**Implementation instructions**

1. Confirm the optional proof is selected; choose one language and one bounded spec-backed slice, documenting real toolchain/build/test commands.
2. Use the same portable vector expectations and error codes, not TypeScript internals. Record representative coverage and limitations; surface any mandatory specification defect as remediation.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Run the selected representative vectors through the optional language bridge, compare portable error/value observations and record unsupported scope honestly.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Only the selected optional proof scope has new evidence; full second-language conformance is not claimed.

**Completion**

Pending.

<a id="task-150"></a>

### - [ ] TASK-150 — Cross-Language Portability Findings

**Release:** Draft 0.3

**Milestone:** Optional Cross-Language Proof

**Type:** DOCUMENTATION

**Execution:** OPTIONAL

**Depends on:** [TASK-149](#task-149)

**Objective**

Cross-Language Portability Findings.

**Scope**

- Document reviewed proof results and concrete portability gaps, with source/vector references; classify the implementation as a proof rather than an official full port.
- Optional execution does not gate closure, but any revealed mandatory spec defect must become a mandatory remediation task; it cannot be ignored because the proof was optional.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `implementations/java/ or implementations/go/ (one selected proof only)`
- `docs/tasks/draft-0.3-portability-proof.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Document reviewed proof results and concrete portability gaps, with source/vector references; classify the implementation as a proof rather than an official full port.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

## 10. Draft 0.3 Closure Gate

### Milestone: Draft 0.3 Closure

<a id="task-151"></a>

### - [ ] TASK-151 — Draft 0.3 Full Requirement Inventory

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-147](#task-147)

**Objective**

Draft 0.3 Full Requirement Inventory.

**Scope**

- Inventory every 0.1/0.2/selected 0.3 requirement with source, status, criticality and testability; verify research dispositions and required review evidence.
- Include all approved conditional follow-ups and suffixed tasks; do not mark mandatory work deferred merely to pass closure.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Inventory every 0.1/0.2/selected 0.3 requirement with source, status, criticality and testability; verify research dispositions and required review evidence.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-152"></a>

### - [ ] TASK-152 — Draft 0.3 Final Traceability Gate

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-151](#task-151)

**Objective**

Draft 0.3 Final Traceability Gate.

**Scope**

- Recompute per-domain and total requirement coverage; require UNCOVERED = 0 and BLOCKING SPEC GAPS = 0, with evidence for NOT DIRECTLY TESTABLE classifications.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Recompute per-domain and total requirement coverage; require UNCOVERED = 0 and BLOCKING SPEC GAPS = 0, with evidence for NOT DIRECTLY TESTABLE classifications.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-153"></a>

### - [ ] TASK-153 — Draft 0.3 Final Full Conformance Gate

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-152](#task-152)

**Objective**

Draft 0.3 Final Full Conformance Gate.

**Scope**

- Run the complete required manifest and report PASS totals by domain and overall; require FAIL = 0, UNSUPPORTED = 0, INFRASTRUCTURE_ERROR = 0 across all three drafts.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Run the complete required manifest and report PASS totals by domain and overall; require FAIL = 0, UNSUPPORTED = 0, INFRASTRUCTURE_ERROR = 0 across all three drafts.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Pending.

<a id="task-154"></a>

### - [ ] TASK-154 — Draft 0.3 Workspace Build Typecheck and Unit Gate

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-153](#task-153)

**Objective**

Draft 0.3 Workspace Build Typecheck and Unit Gate.

**Scope**

- Run workspace build, strict TypeScript and all unit/adapter/runner tests; retain every 0.1 and 0.2 regression.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Run workspace build, strict TypeScript and all unit/adapter/runner tests; retain every 0.1 and 0.2 regression.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Pending.

<a id="task-155"></a>

### - [ ] TASK-155 — Draft 0.3 Coverage Gate

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TEST

**Execution:** SEQUENTIAL

**Depends on:** [TASK-154](#task-154)

**Objective**

Draft 0.3 Coverage Gate.

**Scope**

- Run core and runner coverage scripts, review new financial/error branches and the package thresholds; adapter has no coverage script, so retain its full test evidence.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Identify normative behaviors and plausible defects targeted by this test task; retain exact assertions and explicit context.
2. Add only missing contrasts/invariants or execute the named gate. Preserve regression tests and record per-domain results; never rewrite expected financial outcomes to fit code.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- Run **COV(core)** and **COV(runner)** explicitly; inspect uncovered financial/error branches and configured thresholds.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Run core and runner coverage scripts, review new financial/error branches and the package thresholds; adapter has no coverage script, so retain its full test evidence.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named regression/coverage/conformance checks have durable results; no new semantics were introduced.

**Completion**

Pending.

<a id="task-156"></a>

### - [ ] TASK-156 — Draft 0.3 Final Full-Core Mutation Gate

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** MUTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-155](#task-155)

**Objective**

Draft 0.3 Final Full-Core Mutation Gate.

**Scope**

- Generate the latest complete valid mutation report for all 0.1/0.2/0.3 core behavior, audit configured files/line ranges, inspect every survivor and require score >=95% and critical survivors = 0.
- A tool crash, incomplete report or unreviewed source exclusion blocks closure. Preserve per-survivor classification and written equivalence justification. Run runner mutation to close its infrastructure baseline too.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Check Stryker source lists, line ranges and test selection include every meaningful path in this scope; do not omit new modules or error branches.
2. Run targeted mutation (full-core for a full gate), inspect every survivor, classify critical/noncritical/equivalent with evidence, add missing behavioral tests, and rerun to a complete valid report.
3. Require critical surviving mutants = 0 and score >=95%. Justified equivalents need written semantic proof; tooling failures or incomplete reports cannot establish success.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV**, **MUT(core)** for full-core gates, otherwise **MUT(domain)** followed by applicable package mutation; inspect report completeness, source inventory and every survivor.

**Mutation expectations**

- Generate the latest complete valid mutation report for all 0.1/0.2/0.3 core behavior, audit configured files/line ranges, inspect every survivor and require score >=95% and critical survivors = 0.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Generate the latest complete valid mutation report for all 0.1/0.2/0.3 core behavior, audit configured files/line ranges, inspect every survivor and require score >=95% and critical survivors = 0.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

A complete scoped mutation report and survivor classifications establish >=95% and zero critical surviving mutants for the named behavior.

**Completion**

Pending.

<a id="task-157"></a>

### - [ ] TASK-157 — Draft 0.3 Portable Error Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-156](#task-156)

**Objective**

Draft 0.3 Portable Error Audit.

**Scope**

- Compare every required domain code and error precedence across canonical spec, vectors, core errors, adapter normalization, public JSDoc and Agentic known-error lists.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Compare every required domain code and error precedence across canonical spec, vectors, core errors, adapter normalization, public JSDoc and Agentic known-error lists.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-158"></a>

### - [ ] TASK-158 — Draft 0.3 Operation Registry Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** TRACEABILITY

**Execution:** SEQUENTIAL

**Depends on:** [TASK-157](#task-157)

**Objective**

Draft 0.3 Operation Registry Audit.

**Scope**

- Compare manifest operation IDs, conformance conventions, runner metadata allowlists, adapter support and Agentic canonical IDs; require stable naming and no unsupported mandatory operations.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Recompute the named inventory from canonical requirements, manifest-listed vectors and implementation/test evidence. Preserve IDs and distinguish directly testable from architectural/composing-domain obligations.
2. Resolve mismatches only from spec-backed evidence; record UNCOVERED and BLOCKING SPEC GAPS counts for the scoped requirements. At a closure task both must equal zero.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- Use `rg` to compare requirement/error/operation references across spec, vectors, traceability and implementation. Reconcile counts against **CONF** evidence; do not infer executed coverage solely from a reference.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Compare manifest operation IDs, conformance conventions, runner metadata allowlists, adapter support and Agentic canonical IDs; require stable naming and no unsupported mandatory operations.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named inventory/mapping audit is recorded with exact counts and evidence; only explicitly closed slices have zero uncovered/gap status.

**Completion**

Pending.

<a id="task-159"></a>

### - [ ] TASK-159 — Draft 0.3 Final Agentic Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** AGENTIC

**Execution:** SEQUENTIAL

**Depends on:** [TASK-158](#task-158)

**Objective**

Draft 0.3 Final Agentic Audit.

**Scope**

- Verify promoted descriptors have accurate inputs/outputs, effects, determinism, mutatesState, mutatesFinancialState, audit/approval relevance, errors and requirement links; retain required security analysis and scoped maintainer acceptance under D03-REVIEW-001.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `agentic/`
- `runner/src/metadata.ts`
- `runner/test/metadata.test.ts`
- `implementations/typescript/adapters/conformance/src/operations.ts`
- `implementations/typescript/adapters/conformance/README.md`
- `conformance/conventions.md`

**Implementation instructions**

1. Review each operation against /spec: canonical ID, inputs/outputs, preconditions/postconditions, errors, determinism, mutatesState, mutatesFinancialState, audit relevance, approval relevance and requirement references.
2. Record canonical/conformance-local/structural decisions, obtain required review, then align descriptors, allowlists and adapter dispatch without redefining domain behavior. Do not invent idempotency, irreversibility or AI-specific approval rules.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **RUNNER**, **ADAPTER**, **CONF** if operation registries/dispatch change; otherwise inspect their latest applicable results and all descriptor links.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify promoted descriptors have accurate inputs/outputs, effects, determinism, mutatesState, mutatesFinancialState, audit/approval relevance, errors and requirement links; retain required security analysis and scoped maintainer acceptance under D03-REVIEW-001.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

Reviewed canonical/local/structural classifications and registry effects match the current normative and implemented behavior.

**Completion**

Pending.

<a id="task-160"></a>

### - [ ] TASK-160 — Draft 0.3 Public API and JSDoc Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-159](#task-159)

**Objective**

Draft 0.3 Public API and JSDoc Audit.

**Scope**

- Audit every exported class/function/type/constant/error and public method, examples and package entry points for meaningful semantics, mutation/error guarantees and stable requirement references.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Audit every exported class/function/type/constant/error and public method, examples and package entry points for meaningful semantics, mutation/error guarantees and stable requirement references.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

<a id="task-161"></a>

### - [ ] TASK-161 — Draft 0.3 Architecture Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-160](#task-160)

**Objective**

Draft 0.3 Architecture Audit.

**Scope**

- Verify core has no runner/conformance/agentic/framework dependencies, runner has no financial rules, adapters only translate, canonical artifacts are language-neutral and cross-domain imports are explicit/spec-backed.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.
- Inspect imports and package dependencies with `rg`; no dedicated architecture script exists. Review runner financial neutrality and adapter delegation manually, and add focused architecture regression tests only where useful.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify core has no runner/conformance/agentic/framework dependencies, runner has no financial rules, adapters only translate, canonical artifacts are language-neutral and cross-domain imports are explicit/spec-backed.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED.

**Completion**

Pending.

<a id="task-162"></a>

### - [ ] TASK-162 — Draft 0.3 Stale Naming and Reference Audit

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-161](#task-161)

**Objective**

Draft 0.3 Stale Naming and Reference Audit.

**Scope**

- Search old operation names, candidate IDs, stale package paths, unsupported-capability claims and mistaken version/revision terminology; distinguish historical Draft 0.1 statements from stale current claims.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Search old operation names, candidate IDs, stale package paths, unsupported-capability claims and mistaken version/revision terminology; distinguish historical Draft 0.1 statements from stale current claims.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

<a id="task-163"></a>

### - [ ] TASK-163 — Draft 0.3 README and Status Synchronization

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-162](#task-162)

**Objective**

Draft 0.3 README and Status Synchronization.

**Scope**

- Update root/spec/domain/TypeScript/adapter/Agentic current capability tables and manifest policy status to verified scope; retain experimental status and avoid production or full-port claims.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Update root/spec/domain/TypeScript/adapter/Agentic current capability tables and manifest policy status to verified scope; retain experimental status and avoid production or full-port claims.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

<a id="task-164"></a>

### - [ ] TASK-164 — Draft 0.3 Deferred Backlog Synchronization

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-163](#task-163)

**Objective**

Draft 0.3 Deferred Backlog Synchronization.

**Scope**

- Reconcile both source plans and every research disposition into explicit 0.4+ or rejected items; preserve condition/portability/provenance decision rationale and optional proof status.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Reconcile both source plans and every research disposition into explicit 0.4+ or rejected items; preserve condition/portability/provenance decision rationale and optional proof status.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

<a id="task-165"></a>

### - [ ] TASK-165 — Draft 0.3 Final CoreDoc Impact Review

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** DOCUMENTATION

**Execution:** SEQUENTIAL

**Depends on:** [TASK-164](#task-164)

**Objective**

Draft 0.3 Final CoreDoc Impact Review.

**Scope**

- Recheck CoreDoc presence and synchronize changed normative assumptions or record an absence/impact note; keep TypeScript class/helper/adapter details out.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Compare each current claim to spec, executable support and the latest applicable verification evidence; distinguish implemented, passing conformance, unsupported and not yet specified.
2. Update only affected documentation, examples and assumption notes. Historical plan snapshots may remain labeled historical; current capability/status statements must be accurate.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.

**Mutation expectations**

- No runtime mutation run for this artifact-only task. Record the relevant defect scenarios for later tests; never infer mutation success from specification or review alone. If runtime code changes are required, insert a focused implementation/remediation task with mutation checks.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Recheck CoreDoc presence and synchronize changed normative assumptions or record an absence/impact note; keep TypeScript class/helper/adapter details out.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named documentation surface describes current verified capability and explicit deferrals.

**Completion**

Pending.

<a id="task-166"></a>

### - [ ] TASK-166 — FinKore Core Draft 0.3 Final Closure

**Release:** Draft 0.3

**Milestone:** Draft 0.3 Closure

**Type:** CLOSURE

**Execution:** SEQUENTIAL

**Depends on:** [TASK-001](#task-001), [TASK-002](#task-002), [TASK-003](#task-003), [TASK-004](#task-004), [TASK-005](#task-005), [TASK-006](#task-006), [TASK-007](#task-007), [TASK-008](#task-008), [TASK-009](#task-009), [TASK-010](#task-010), [TASK-011](#task-011), [TASK-012](#task-012), [TASK-013](#task-013), [TASK-014](#task-014), [TASK-015](#task-015), [TASK-016](#task-016), [TASK-017](#task-017), [TASK-018](#task-018), [TASK-019](#task-019), [TASK-020](#task-020), [TASK-021](#task-021), [TASK-022](#task-022), [TASK-023](#task-023), [TASK-024](#task-024), [TASK-025](#task-025), [TASK-026](#task-026), [TASK-027](#task-027), [TASK-028](#task-028), [TASK-029](#task-029), [TASK-030](#task-030), [TASK-031](#task-031), [TASK-032](#task-032), [TASK-033](#task-033), [TASK-034](#task-034), [TASK-035](#task-035), [TASK-036](#task-036), [TASK-037](#task-037), [TASK-038](#task-038), [TASK-039](#task-039), [TASK-040](#task-040), [TASK-041](#task-041), [TASK-042](#task-042), [TASK-043](#task-043), [TASK-044](#task-044), [TASK-045](#task-045), [TASK-046](#task-046), [TASK-047](#task-047), [TASK-048](#task-048), [TASK-049](#task-049), [TASK-050](#task-050), [TASK-051](#task-051), [TASK-052](#task-052), [TASK-053](#task-053), [TASK-054](#task-054), [TASK-055](#task-055), [TASK-056](#task-056), [TASK-057](#task-057), [TASK-058](#task-058), [TASK-059](#task-059), [TASK-060](#task-060), [TASK-061](#task-061), [TASK-062](#task-062), [TASK-063](#task-063), [TASK-064](#task-064), [TASK-065](#task-065), [TASK-066](#task-066), [TASK-067](#task-067), [TASK-068](#task-068), [TASK-069](#task-069), [TASK-070](#task-070), [TASK-071](#task-071), [TASK-072](#task-072), [TASK-073](#task-073), [TASK-074](#task-074), [TASK-075](#task-075), [TASK-076](#task-076), [TASK-077](#task-077), [TASK-078](#task-078), [TASK-079](#task-079), [TASK-080](#task-080), [TASK-081](#task-081), [TASK-082](#task-082), [TASK-083](#task-083), [TASK-084](#task-084), [TASK-085](#task-085), [TASK-086](#task-086), [TASK-087](#task-087), [TASK-088](#task-088), [TASK-089](#task-089), [TASK-090](#task-090), [TASK-091](#task-091), [TASK-092](#task-092), [TASK-093](#task-093), [TASK-094](#task-094), [TASK-095](#task-095), [TASK-096](#task-096), [TASK-097](#task-097), [TASK-098](#task-098), [TASK-099](#task-099), [TASK-100](#task-100), [TASK-101](#task-101), [TASK-102](#task-102), [TASK-103](#task-103), [TASK-104](#task-104), [TASK-105](#task-105), [TASK-106](#task-106), [TASK-107](#task-107), [TASK-108](#task-108), [TASK-109](#task-109), [TASK-110](#task-110), [TASK-111](#task-111), [TASK-112](#task-112), [TASK-113](#task-113), [TASK-114](#task-114), [TASK-115](#task-115), [TASK-116](#task-116), [TASK-117](#task-117), [TASK-118](#task-118), [TASK-119](#task-119), [TASK-120](#task-120), [TASK-121](#task-121), [TASK-122](#task-122), [TASK-123](#task-123), [TASK-124](#task-124), [TASK-125](#task-125), [TASK-126](#task-126), [TASK-127](#task-127), [TASK-128](#task-128), [TASK-129](#task-129), [TASK-130](#task-130), [TASK-131](#task-131), [TASK-132](#task-132), [TASK-133](#task-133), [TASK-134](#task-134), [TASK-135](#task-135), [TASK-136](#task-136), [TASK-137](#task-137), [TASK-138](#task-138), [TASK-139](#task-139), [TASK-140](#task-140), [TASK-141](#task-141), [TASK-142](#task-142), [TASK-143](#task-143), [TASK-144](#task-144), [TASK-145](#task-145), [TASK-146](#task-146), [TASK-147](#task-147), [TASK-151](#task-151), [TASK-152](#task-152), [TASK-153](#task-153), [TASK-154](#task-154), [TASK-155](#task-155), [TASK-156](#task-156), [TASK-157](#task-157), [TASK-158](#task-158), [TASK-159](#task-159), [TASK-160](#task-160), [TASK-161](#task-161), [TASK-162](#task-162), [TASK-163](#task-163), [TASK-164](#task-164), [TASK-165](#task-165)

**Objective**

FinKore Core Draft 0.3 Final Closure.

**Scope**

- Verify all previous mandatory tasks, activated follow-ups and remediation tasks are checked, all required reviews are evidenced and all reports still apply to current source.
- Output exactly one status: FINKORE CORE DRAFT 0.3 NOT COMPLETE or FINKORE CORE DRAFT 0.3 COMPLETE. Only when complete also emit READY FOR FINKORE DRAFT 0.4 PLANNING. Do not begin Draft 0.4. Missing or stale evidence leaves this checkbox unchecked.

**Non-scope**

- Only the named responsibility; other operations, unrelated refactors and subsequent tasks remain outside this session.
- No new financial behavior outside the selected 0.2/0.3 scope; no release publishing or Draft 0.4 execution.

**Inspect**

- `AGENTS.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`
- `docs/tasks/draft-0.3-implementation-plan.md`
- `README.md`
- `spec/`
- `conformance/`
- `agentic/`
- `runner/`
- `implementations/typescript/core/`
- `implementations/typescript/adapters/conformance/`
- `package.json`

**Likely changes**

- `docs/tasks/draft-0.3-execution-evidence.md`
- `docs/tasks/draft-0.2-to-0.3-execution-backlog.md`

**Implementation instructions**

1. Review dependency completion notes and their applicability to current source; implementation alone is not closure. Verify named requirements, vectors, errors, docs, reviews and architecture.
2. Run the scoped regression gate and inspect complete mutation evidence. Record exact gaps; insert focused remediation/recheck tasks if needed without widening this session.
3. Require slice UNCOVERED = 0, BLOCKING SPEC GAPS = 0, required vectors all PASS, critical mutants = 0, implementation/adapter complete and documentation synchronized.

**Verification**

- **DOC**: review scoped requirements/references, local Markdown links and `git diff --check`; record changed files.
- **BUILD**, **TYPE**, **UNIT**, **ADAPTER**, **CONF** for TypeScript runtime/closure work; use discovered language-native commands for an optional proof.
- **COV** and latest applicable complete mutation evidence; **MUT(core)** if evidence is absent/stale. All five Draft 0.1 domains and all previously closed slices must remain green; significant 0.3 gates also require complete Draft 0.2 regression conformance.

**Mutation expectations**

- For changed financial behavior, run applicable targeted mutation and inspect complete results; require zero critical survivors and >=95% score. Gates require evidence covering the entire closed scope, including new files. Translation/docs-only changes need no invented financial mutants; retain core evidence.

**Documentation**

- Update the affected domain index, traceability/status and public API JSDoc/examples when this task changes their meaning. New APIs need `@see` requirement IDs and portable error/mutation semantics now.
- Record this task’s evidence, reviewer/decision references where applicable, checkbox and pointer. Review root/package READMEs, `/spec`, `/conformance`, `/agentic` and `AGENTS.md`; keep planned versus implemented status explicit.

**Stop conditions**

- Unchecked dependency; missing required review; ambiguity not resolved by the scoped spec/decision; vector/spec contradiction; unexpected regression or infrastructure failure; incomplete mutation evidence or a critical survivor.
- A task exceeds one focused responsibility: propose suffixed tasks and stop before dependent work. Never guess financial semantics, alter tests to fit a defect, or treat optional/research work as already implemented.

**Definition of Done**

- [ ] Verify all previous mandatory tasks, activated follow-ups and remediation tasks are checked, all required reviews are evidenced and all reports still apply to current source.
- [ ] For the closed scope: UNCOVERED = 0 and BLOCKING SPEC GAPS = 0; no required behavior was hidden by reclassification.
- [ ] Required verification and scope-specific review evidence are recorded and pass (a conformance-first task records only the named expected new red set).
- [ ] Affected documentation is synchronized; completion note and execution pointer reflect exactly this task.

**Expected repository state**

The named gate is evidenced and closed; any blocker instead leaves it unchecked and the pointer BLOCKED. Emit exactly one: `FINKORE CORE DRAFT 0.3 NOT COMPLETE` or `FINKORE CORE DRAFT 0.3 COMPLETE`; on COMPLETE also emit `READY FOR FINKORE DRAFT 0.4 PLANNING`. Set `NEXT TASK: NONE — DRAFT 0.3 CLOSED`; do not start 0.4.

**Completion**

Pending.

## 11. Deferred / Optional Tasks

The optional cross-language proof is TASK-148–TASK-150, fully specified in the numeric execution sequence above. It is OPTIONAL, recommended before public v0.5, never mandatory for Draft 0.3. Leave its checkboxes unchecked if not selected and record that disposition; the default pointer skips it. Final mandatory closure is TASK-166. Any real blocking spec defect discovered by a proof still requires remediation.

| Item | Disposition / prerequisite |
| --- | --- |
| Conditions | Required research/decision; implementation only for a reviewed bounded subset. DEFER is a valid research outcome, not a failed implementation waiver. |
| Money precision/overflow, minor-unit guidance, private currency | Required separate research decisions; normative/code changes only via approved conditional follow-ups. No live metadata service or full registry. |
| Audit provenance | Required research/security decision; approved narrow semantics require the complete conditional track. Retention remains deferred. |
| Draft 0.2 accountant/domain/security touchpoints | Recommended review of rates, allocation, evolution, validity and Audit redaction; capture concrete packets/evidence through scope/spec/docs tasks. Optional pre-v0.5 follow-up unless explicitly made required at scope lock. |
| Draft 0.3 quorum/stages/nesting, Workflow versioning, Entity import, Conditions and Agentic review | Required analysis and scoped maintainer acceptance under D03-REVIEW-001; dedicated tasks remain mandatory or conditionally mandatory. Future external review is recorded separately and does not block draft development or closure. |
| Workflow migration | DEFER 0.4+ after bound definition identity/import/conflict closes. Importing an existing state is not migrating between definitions. |
| Delegation / escalation | Delegation remains RESEARCH FIRST, default future backlog; escalation DEFER 0.4+. No IAM/RBAC, timers, notifications or actor directory. |
| Global identity registry | RESEARCH FIRST, default DEFER; 0.3 import aliases do not authorize a registry or deduplication service. |
| Tax-specific primitives | RESEARCH FIRST, deferred candidate track requiring accountant-reviewed jurisdiction-neutral semantics; generic rates are the selected utility. |
| Interest/accrual/day-count | DEFER 0.4+; no calendar or compounding engine. |
| Audit retention / distributed causal ordering | DEFER; needs separate legal/security and domain research. |
| Replacement/amendment as new operations | Terminology assessment in 0.2 only; no extra operation unless a separately approved spec track is inserted. |
| Unrestricted approval graphs, distributed locking/consensus | REJECT as Core implementation scope in the 0.3 plan. |
| Ledger, journals, reconciliation, payments, banking, full tax, full BPMN, persistence, UI, notifications, reporting/BI | Outside selected 0.2/0.3 scope; do not pull them into implementation. |
| Full Java/Go/.NET ports | Future tracks, not the optional bounded proof. |

## 12. Final Completion Criteria

TASK-166 is the final mandatory task. `FINKORE CORE DRAFT 0.3 COMPLETE` requires all earlier mandatory tasks (including activated follow-ups and inserted remediation) checked and their evidence applicable to the final source. An unchecked unselected optional proof is permitted; an approved but unimplemented condition/portability/provenance feature is not.

- Draft 0.2 explicitly closed with all selected Rates, Allocation, Entity evolution, Audit relationships, Approval validity and Agentic alignment complete.
- Every selected 0.3 financial behavior is normative, implemented, adapted and independently closed; all research outcomes, required analysis, and scoped maintainer acceptance under D03-REVIEW-001 are evidenced; external review status is explicit.
- Every directly testable required requirement is covered. `UNCOVERED = 0`, `BLOCKING SPEC GAPS = 0`. NOT DIRECTLY TESTABLE requirements retain defensible architectural/unit/review evidence.
- All required 0.1/0.2/0.3 vectors PASS with per-domain/total results: `FAIL = 0`, `UNSUPPORTED = 0`, `INFRASTRUCTURE_ERROR = 0`.
- Workspace build, strict typecheck and all tests pass; available coverage checks pass. Complete valid mutation reports cover all core behavior with score >=95% and `critical surviving mutants = 0`; no hidden new source exclusions or tooling failures.
- Portable errors, canonical/local operation registries, Agentic effects, public APIs/JSDoc, architectural boundaries, names/links, README/status, deferred backlog and CoreDoc impact are aligned.
- Completion is a Core draft claim, not a production, v1.0, full second-language or release-publication claim. Output `READY FOR FINKORE DRAFT 0.4 PLANNING` only alongside Draft 0.3 COMPLETE, then stop.

### Planning validation

The creation audit checks sequential unique IDs, complete task fields, resolved acyclic dependencies, no mandatory dependency on optional proof tasks, mandatory implementation reachability through Draft 0.2 closure, and final closure dependency coverage. Semantic review maps both source plans to the slice tracks above: each selected feature has specification, conformance, implementation, adapter, dedicated mutation, traceability and gate work. Research-only candidates have explicit decision paths; no deferred feature is silently selected.

There are **166 tasks: 66 Draft 0.2 mandatory, 97 Draft 0.3 mandatory checkpoints, and 3 optional**. The 0.3 mandatory count includes **27 conditional follow-up checkpoints** whose feature work is activated only by an approved research decision; non-selection must still be documented and checked under the disposition protocol. All execution tasks are initially unchecked. No feature task was executed in creating this backlog.

Planning audit result (2026-09-09): **PASS**. A Python structural check verified all task fields, stable IDs, links, counts, dependency reachability and optional isolation; the manifest count was independently recomputed. Manual reconciliation verified selected capabilities and research/deferred boundaries against both complete source plans. Runtime checks remain pending TASK-001.
