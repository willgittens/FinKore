# Draft 0.3 Execution Evidence

This file records durable execution evidence for the Draft 0.3 backlog. It is
not a source of financial semantics.

## Foundation

### TASK-067 - Draft 0.2 Closure Verification and Draft 0.3 Scope Refresh

- Status: COMPLETE
- Source revision: `59d10fad5f8b99c32b3c09bdce927b89f4439be3` plus TASK-067 documentation refresh.
- Date: 2026-09-12
- Toolchain: system `node` reported `v24.15.0`, satisfying package engines.
- Scope refresh:
  - Draft 0.2 closure evidence from TASK-066 remains applicable.
  - `docs/tasks/draft-0.3-implementation-plan.md` was refreshed from its original pre-0.2 planning assumption to the actual closed 0.2 baseline.
  - Mandatory Draft 0.3 scope remains Approval composition/quorum/stages/nesting, Workflow definition binding/import/conflict, Entity revision/import identity, research-gated Money portability, research-gated Audit provenance, research-gated portable Conditions, and Agentic review.
  - Conditions, Money normative portability changes, and Audit provenance implementation still require recorded research approval before feature work.
  - Delegation, tax primitives, cross-entity identity registry, workflow migration, audit retention, ledger/payment behavior, IAM/RBAC, persistence, and full language ports remain deferred or optional exactly as classified in the 0.3 plan.
- Traceability:
  - `conformance/traceability.md` reports 297 total requirements, 231 covered, 66 not directly testable, 0 partial, 0 uncovered, 0 deferred, and 0 blocking spec gaps.
  - Closed 0.2 scope has `UNCOVERED = 0` and `BLOCKING SPEC GAPS = 0`.
- Commands:
  - `node --version` exited 0 and reported `v24.15.0`.
  - `npm run build --workspaces` exited 0.
  - `npm run typecheck --workspaces` exited 0.
  - `npm run test --workspaces` exited 0.
  - `npm run test --workspace @finkore/typescript-conformance-adapter` exited 0.
  - `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` exited 0.
  - `npm run test:coverage --workspace @finkore/typescript` exited 0.
  - `npm run test:coverage --workspace @finkore/conformance-runner` exited 0.
- Unit evidence:
  - Runner: 10 files / 110 tests passed.
  - TypeScript core: 30 files / 268 tests passed.
  - TypeScript conformance adapter: 1 file / 13 tests passed.
- Conformance evidence:
  - Full manifest: 199 passed / 199 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - By suite: Money 83/83, Workflow 20/20, Audit 29/29, Approvals 47/47, Entities 20/20.
  - Mutation-sensitive vectors: 174 passed / 174 total.
- Coverage:
  - TypeScript core: 98.75% statements, 98.16% branches, 100% functions, 99.31% lines.
  - Runner: 98.31% statements, 95.29% branches, 100% functions, 98.75% lines.
- Mutation:
  - No new financial behavior changed in TASK-067, so mutation was not rerun.
  - Latest complete core mutation evidence remains applicable: report mtime 2026-09-11T22:48:48.587Z, score 98.88%, 2,371 total mutants, 2,099 killed, 13 timeout, 20 survived, 4 no coverage, 235 ignored, 0 errors.
  - Latest complete runner mutation evidence remains applicable: report mtime 2026-09-11T22:49:11.388Z, score 99.73%, 368 total mutants, 367 killed, 1 survived, 0 no coverage, 0 errors.
  - TASK-066 survivor classification still applies; no critical financial or runner-neutrality mutant is accepted as surviving.
- Documentation/update applicability:
  - Unit tests: no change; full workspace tests re-ran and passed.
  - Conformance vectors: no change; full conformance re-ran and passed.
  - Mutation-sensitive tests: no change; mutation-sensitive conformance re-ran and passed.
  - JSDoc: no change; no public TypeScript API changed.
  - README documentation: reviewed; current root/core/adapter README status already reflects 0.2 implemented and 0.3 deferred.
  - `/spec`: no change; no normative behavior changed.
  - `/conformance`: no change; traceability reviewed.
  - `/agentic`: no change; 0.3 Agentic review remains a later milestone.
  - `AGENTS.md`: no change required.
- Result:
  - READY FOR TASK-068.

## Advanced Approvals

### TASK-068 - Approval Composition Requirement Inventory

- Status: COMPLETE
- Date: 2026-09-12
- Inventory:
  - Existing Approval requirement families before this slice: `APPROVAL-REQUIREMENT-*`, `APPROVAL-DECISION-*`, `APPROVAL-CHAIN-*`, `APPROVAL-CONDITION-*`, `APPROVAL-VALIDITY-*`, and `APPROVAL-ERROR-*`.
  - Existing conformance: 47 Approval vectors in `conformance/approvals/decisions.json` and `conformance/approvals/validity.json`.
  - Existing implementation: single-Requirement evaluation, Decision history/effectiveness, withdrawal, expiration, supersession, conditions, and Draft 0.1 all-required chain evaluation.
  - Existing Agentic status: Approval operation labels remain conformance-local; no canonical Approval operation is listed in `agentic/operations.md`.
  - Draft 0.3 inventory: ANY_OF, ALL_OF, N_OF_M, ordered stages, and bounded nested groups require explicit dependencies on Draft 0.2 current-effectiveness, stable Requirement identity, Actor/voter identity, and append-only Decision history.
- Traceability:
  - Planned directly testable Draft 0.3 slice: 23 new Approval requirements, 0 partial, 23 uncovered, 0 deferred, 0 blocking spec gaps at inventory time.
- Verification:
  - `rg` inspections over `spec/approvals`, `conformance/approvals`, `conformance/traceability.md`, `agentic/operations.md`, approval implementation/tests, and adapter operation registrations completed.
  - `git diff --check` passed after the TASK-068 through TASK-073 documentation updates.
- Mutation:
  - Not applicable; no runtime behavior changed.
  - Later mutation targets: quorum off-by-one, duplicate voter counted twice, ineffective/rejected Decision counted, ordered-stage bypass, nested early return, ignored depth/cycle limits, and mutable observation state.
- Documentation/update applicability:
  - Unit tests: no change; no runtime behavior changed.
  - Conformance vectors: no change; vector publication is TASK-074.
  - Mutation-sensitive tests: no change; later implementation/hardening tasks own these.
  - JSDoc: no change; no public TypeScript API changed.
  - README documentation: `spec/approvals/README.md` updated to index composition semantics; TypeScript and adapter READMEs remain accurate because implementation is still pending.
  - `/spec`: new composition scope identified and later specified by TASK-069 through TASK-072.
  - `/conformance`: traceability updated after the spec tasks.
  - `/agentic`: reviewed; no change, Approval operations remain conformance-local.
  - `AGENTS.md`: no change required.

### TASK-069 - Any-of All-of and Quorum Normative Semantics

- Status: COMPLETE
- Date: 2026-09-12
- Changes:
  - Added `spec/approvals/composition.md`.
  - Added vector-ready `APPROVAL-COMPOSITION-*` and `APPROVAL-QUORUM-*` requirements covering group identity, group kinds, member references, duplicate members, any/all outcomes, quorum thresholds, distinct voter counting, duplicate voter treatment, rejection/pending outcomes, eligibility, and no implied abstention.
  - Updated `spec/approvals/chains.md` and `spec/approvals/README.md` so Draft 0.1 all-required chains and Draft 0.3 bounded composition are separated.
- Traceability:
  - `conformance/traceability.md` now lists the new requirements as UNCOVERED pending TASK-074 vectors.
- Verification:
  - `git diff --check` passed.
- Mutation:
  - Not applicable; spec-only task.
- Notes:
  - No implementation, adapter support, or Agentic promotion was added.

### TASK-070 - Composition and Current-Effectiveness Interaction

- Status: COMPLETE
- Date: 2026-09-12
- Changes:
  - `APPROVAL-COMPOSITION-020`, `APPROVAL-COMPOSITION-021`, and `APPROVAL-QUORUM-004` bind composition to Decision history and Draft 0.2 current-effectiveness.
  - Withdrawn, expired, superseded, stale-fact, stale-revision, ineligible, malformed, and rejected Decisions cannot increase quorum approval counts.
- Verification:
  - `git diff --check` passed.
- Mutation:
  - Not applicable; spec-only task.
- Notes:
  - No Draft 0.2 validity semantics were changed.

### TASK-071 - Ordered Stages and Bounded Groups Semantics

- Status: COMPLETE
- Date: 2026-09-12
- Changes:
  - `APPROVAL-COMPOSITION-006` and `APPROVAL-COMPOSITION-007` define cycle rejection and a maximum nested group depth of four including the root.
  - `APPROVAL-COMPOSITION-016` through `APPROVAL-COMPOSITION-019` define declared-order stage progression, same-stage parallel meaning, staged outcomes, and actionable requirements from only the first non-approved stage.
  - `APPROVAL-COMPOSITION-008` requires deterministic evaluation from declared order, explicit context, and current-effective observations.
- Verification:
  - `git diff --check` passed.
- Mutation:
  - Not applicable; spec-only task.
- Notes:
  - No scheduling engine, arbitrary graph traversal, or dynamic approver resolution was introduced.

### TASK-072 - Approval Composition Portable Error Design

- Status: COMPLETE
- Date: 2026-09-12
- Changes:
  - `spec/approvals/errors.md` adds `APPROVAL-ERROR-008` and `APPROVAL-ERROR-009`.
  - Invalid group shape, duplicate group/member declarations, unresolved references, cycles, excessive nesting, invalid quorum thresholds, and missing current state observations reuse `FINKORE_APPROVAL_INVALID_CHAIN`.
  - Unresolved applicability reuses `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.
  - Domain actions blocked by unsatisfied composition reuse `FINKORE_APPROVAL_REQUIRED`.
  - No new quorum-specific portable error category was introduced.
- Verification:
  - `git diff --check` passed.
- Mutation:
  - Not applicable; spec-only task.
- Notes:
  - Error rows are UNCOVERED until TASK-074 adds vectors.

### TASK-073 - Approval Composition Domain and Security Review

Historical blocker record; review authority is superseded by D03-REVIEW-001 below.

- Status: BLOCKED
- Date: 2026-09-12
- Review packet:
  - `docs/tasks/draft-0.3-research-decisions.md` records the scoped review packet for accounting/domain and technical/security review.
- Reason:
  - The backlog requires reviewer role/authority, reviewed artifact revision, findings, resolutions, and explicit acceptance/deferral/rejection. No such external review evidence is present in the repository.
- Required decision:
  - Provide required accounting/domain and technical/security review evidence for the Draft 0.3 Approval Composition semantics before TASK-073 can be checked and before TASK-074 or later implementation work can begin.


### TASK-073 — Decision Preparation Follow-up (2026-09-12)

Historical inspection; its semantic findings remain open, while its external
review prerequisite is superseded by D03-REVIEW-001 below.

- Status: BLOCKED; no external acceptance recorded.
- Added a non-normative decision worklist to
  [the review packet](draft-0.3-research-decisions.md#decision-worklist--2026-09-12).
- Assistant inspection identified unresolved quorum counting units, empty-group
  and threshold precedence, nested applicability, stage aggregation and validation
  scope, and the boundary between malformed evidence and invalid context errors.
- Resolve these questions and any resulting specification remediation before
  accepting the packet and deriving TASK-074 vectors.
- The existing review-evidence gate and execution pointer remain applicable.
- Documentation applicability is recorded in the worklist; no runtime or
  normative changes were made in this follow-up.


### D03-REVIEW-001 — Maintainer Review Policy (2026-09-12)

- Status: ACCEPTED for Draft 0.3 project review governance.
- Authority: maintainer clarification that FinKore is a solo open-source project
  governed by CoreDoc and intended for later community and audit review.
- CoreDoc inspected: `docs/coreDoc/core-doc.md`, v0.5, dated 2026-09-12.
  SHA-256: `53d5565c6ac0cad831ec9409c86c1648c93f15c15325530eca7581cb6d6fdf1f`.
  Foundation rules govern domain specifications; external review supports
  challenges by rule ID and does not require pre-development external signoff.
- Updated research decisions, source plan, execution protocol, research task
  instructions, closure criteria, current blocker, and AGENTS guidance.
- Required review analysis and scoped maintainer acceptance remain mandatory;
  external review is separately recorded and is not a Draft 0.3 prerequisite.
- TASK-073 remains BLOCKED on semantic worklist items 2–5, resulting specification
  remediation, and scoped maintainer acceptance. No financial choice was accepted
  and no task checkbox was advanced by this governance decision.
- External review status: NOT EXTERNALLY REVIEWED. Future community, accounting,
  security, and audit findings remain attributable to exact rules and revisions.
- Completion applicability: unit tests, vectors, mutation tests, JSDoc, root and
  package READMEs, `/spec`, `/conformance`, and `/agentic` need no updates for this
  governance-only change; financial behavior, APIs, and capability claims did not
  change. CoreDoc rules were read and remain unchanged. Planning documents and
  AGENTS.md were updated because execution review responsibilities changed.
- Verification: `git diff --check` passed; a Python documentation check passed
  463 local links and confirmed all 166 stable task IDs, TASK-073/TASK-074 still
  unchecked, and removal of active external-evidence-only blockers. No runtime
  tests were needed for this governance-only change.
- Next discussion: the review packet includes a pending proposal for explicit
  voter membership in quorum groups. It has not been accepted or specified.


### D03-QUORUM-001 — Explicit Voter Membership (2026-09-12)

- Status: ACCEPTED membership decision; directly authorized specification
  remediation complete. TASK-073 remains BLOCKED on worklist items 3–5.
- Authority: maintainer instruction to follow the explicit-voter recommendation.
- Changed `spec/approvals/composition.md`, `spec/approvals/errors.md`, and the
  Approval index. Added APPROVAL-QUORUM-007/008; refined composition member
  references, counted voter evidence, and existing invalid-chain error mapping.
- Updated the decision record, source plan, current backlog blocker, and
  canonical traceability. Explicit voters do not replace eligibility checks;
  ordinary Requirement eligibility rules and Draft 0.2 behavior are unchanged.
- Traceability reconciliation corrected stale totals (326 existing rows had been
  summarized as 320). With two new requirements, the inventory is 328: 231
  COVERED, 17 UNCOVERED, 66 NOT DIRECTLY TESTABLE, and 14 BLOCKING SPEC GAP rows.
  The gap rows reflect existing unresolved applicability, stage/validation, and
  error-boundary findings, not 14 newly introduced decisions. Closed coverage
  classifications and vector references were verified unchanged.
- Verification: `git diff --check` passed; Python checks passed 472 local links,
  328 unique requirement rows and status totals, nine snapshot hashes, 166 stable
  task IDs, and TASK-073/TASK-074 remaining unchecked.
- Snapshot: `docs/tasks/review-snapshots/d03-quorum-001.json` identifies the resulting
  specification translation. The maintainer accepted the membership proposal;
  no acceptance of the unresolved full composition packet is inferred.
- Conformance: new requirements remain UNCOVERED; TASK-074 owns vector publication
  after the remaining semantics are resolved. Contrast cases are recorded in the
  decision packet. No runtime checks or mutation runs apply to this spec-only
  remediation, and none are claimed. Critical future mutants include duplicate
  voter acceptance, group-as-vote acceptance, missing explicit voter acceptance,
  undeclared voter counting, and changed invalid-definition error mapping.
- Completion applicability: `/spec`, Approval README, `/conformance` traceability,
  and planning/evidence documents were updated. Unit tests, runtime mutation
  tests, JSDoc, root/package implementation READMEs, `/agentic`, `AGENTS.md`, and
  CoreDoc need no changes for this membership-only specification remediation;
  public APIs, implementation capability, and canonical operation IDs did not
  change. CoreDoc and existing eligibility/effectiveness rules were reviewed.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-QUORUM-002 — Fixed Threshold (2026-09-12)

- Status: ACCEPTED scoped decision; directly authorized specification remediation
  complete. TASK-073 remains BLOCKED on all-inapplicable groups, stages/validation,
  and error-boundary semantics. TASK-074 remains unchecked.
- Authority: maintainer acceptance of keeping N fixed and returning REJECTED for
  an unreachable quorum with at least one applicable voter. The no-applicable-
  member case was expressly reserved for the next decision.
- Refined APPROVAL-QUORUM-001 to validate N against declared M before applicability
  and prohibit changing N during evaluation. Refined APPROVAL-QUORUM-006 for
  unreachable nonempty applicable quorums. Clarified existing invalid-chain error
  mapping and preserved the distinction between aggregate rejection and a
  rejecting Decision. No existing requirement ID or portable error code changed.
- Updated composition spec, Approval errors/index, decision record, traceability,
  source plan, and current backlog blocker. Contrast cases include unreachable
  approved/pending members, exact reachability, threshold met/exceeded, and invalid
  declared N. Empty-group behavior was not accepted or changed.
- Traceability: two requirement rows move from BLOCKING SPEC GAP to UNCOVERED.
  Inventory: 328 requirements; 231 COVERED, 19 UNCOVERED, 66 NOT DIRECTLY TESTABLE,
  12 BLOCKING SPEC GAP. Closed coverage and vector references remain unchanged.
- Verification: git diff --check passed; Python checks passed 473 local links,
  every inventory total, 328 unique requirement rows, six current snapshot hashes,
  166 stable task IDs, and TASK-073/TASK-074 remaining open.
- Snapshot: docs/tasks/review-snapshots/d03-quorum-002.json identifies this scoped
  specification translation. D03-QUORUM-001's earlier manifest is unchanged and
  records an earlier revision; its hashes are not assertions about later files.
- Completion applicability: spec, Approval README, traceability, and task documents
  were updated. Conformance vector publication remains TASK-074 after unresolved
  semantics close. Unit tests, runtime mutation tests, JSDoc, root/package
  implementation READMEs, /agentic, AGENTS.md, and CoreDoc need no changes because
  runtime behavior, APIs, supported capability, and canonical IDs are unchanged.
  No runtime checks or mutation success are claimed for this spec-only change.
- Future critical mutants: silently reduce N, validate N against applicable M,
  return INVALID_CHAIN or PENDING for an unreachable nonempty quorum, reject
  equality at the reachability boundary, or fabricate member rejection evidence.
- External review: NOT EXTERNALLY REVIEWED; findings remain open to future review.


### D03-COMPOSITION-001 — Entirely Inapplicable Groups (2026-09-12)

- Status: ACCEPTED scoped decision; directly authorized specification remediation
  complete. Worklist item 3 is resolved. TASK-073 remains BLOCKED on items 4–5;
  TASK-074 remains unchecked.
- Authority: maintainer acceptance of child-group omission, prevention of empty
  ANY_OF branch approval, and APPROVED for a valid composition with no applicable
  requirements, without inferring approving Decisions.
- Refined APPROVAL-COMPOSITION-011/012 for recursive omission and no-obligation
  group outcomes; clarified nonempty ALL_OF/ANY_OF rules 013/014; added
  APPROVAL-COMPOSITION-022 for the entirely inapplicable composition result.
- Preserved fixed N, rejection for unreachable nonempty quorums, structural
  validation, explicit applicability, and existing portable errors. No missing
  fact becomes an exemption; empty declarations remain invalid. Future stage
  aggregation and validation scope are not silently decided by this change.
- Updated composition spec, Approval README, canonical traceability, decision
  record, source plan, and current backlog blocker. Recorded positive/negative
  contrast cases for later TASK-074 vectors.
- Traceability: three rows move from BLOCKING SPEC GAP to UNCOVERED; one new
  requirement is UNCOVERED. Totals: 329 requirements, 231 COVERED, 23 UNCOVERED,
  66 NOT DIRECTLY TESTABLE, and 9 BLOCKING SPEC GAP. Closed classifications and
  vector references remain unchanged.
- Verification: git diff --check passed; Python checks passed 474 local links,
  all inventory totals, 329 unique mapping rows, 30 traced composition/quorum IDs,
  eight current snapshot hashes, and 166 stable task IDs with TASK-073/074 open.
- Snapshot: docs/tasks/review-snapshots/d03-composition-001.json identifies this
  specification translation. Earlier manifests remain historical records.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. Vector publication remains TASK-074 after the remaining semantics are
  resolved. No runtime tests or mutation runs apply to this spec-only change.
  Future critical mutants: count an inapplicable ANY_OF child as approval, fail
  to propagate omission, reject no-obligation compositions, invent Decisions,
  or bypass structural/applicability errors through an empty-group shortcut.
- Unit tests, runtime mutation tests, JSDoc, root/package implementation READMEs,
  /agentic, AGENTS.md, and CoreDoc need no changes: runtime behavior, APIs,
  capability claims, canonical IDs, and foundation-level rules are unchanged.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-COMPOSITION-002 — Stage Group Aggregation (2026-09-12)

- Status: ACCEPTED stage-outcome decision; directly authorized specification
  remediation complete. Worklist item 4 remains partially open for structure,
  validation/actionability; item 5 remains open. TASK-073/074 stay unchecked.
- Authority: maintainer acceptance of ALL_OF between applicable stage groups,
  including APPROVED/no obligation when a valid stage has no applicable groups.
- Added APPROVAL-COMPOSITION-023. Retained parallel group semantics and the
  first-non-approved-stage result. A same-stage rejection dominates pending;
  an earlier pending stage still takes precedence over later-stage rejection.
  Entirely inapplicable stages do not bypass an earlier non-approved stage.
- Updated composition spec, Approval README, canonical traceability, decision
  record, source plan, and backlog blocker. Contrast cases assume valid resolved
  evidence and do not settle validation of later or unused branches.
- Traceability: APPROVAL-COMPOSITION-017/018 move from BLOCKING SPEC GAP to
  UNCOVERED; new 023 is UNCOVERED. Totals: 330 requirements, 231 COVERED,
  26 UNCOVERED, 66 NOT DIRECTLY TESTABLE, 7 BLOCKING SPEC GAP.
- Verification: git diff --check and Python documentation checks passed: 475 local
  links, all inventory totals, 330 unique rows, 31 traced composition/quorum IDs,
  five current snapshot hashes, and 166 stable task IDs. Closed coverage and
  vector references remain unchanged.
- Snapshot: docs/tasks/review-snapshots/d03-composition-002.json. Prior manifests
  retain their historical revision identities; full composition review is pending.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. Vector publication remains TASK-074 after remaining semantics close.
  No runtime tests or mutation runs apply to this spec-only change. Unit tests,
  runtime mutation tests, JSDoc, root/package implementation READMEs, /agentic,
  AGENTS.md, and CoreDoc need no updates: runtime behavior, APIs, canonical IDs,
  supported capability, and foundation-level obligations are unchanged.
- Future critical mutants: ANY_OF stage aggregation, pending masking same-stage
  rejection, later rejection overriding earlier pending, inapplicable stage
  blocking progression, or declaration order imposing within-stage prerequisites.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-COMPOSITION-003 — Stage Structure and Depth (2026-09-12)

- Status: ACCEPTED structural decision; directly authorized specification
  remediation complete. Worklist item 4 now remains open only for validation
  and precise actionability; item 5 remains open. TASK-073/074 stay unchecked.
- Authority: maintainer acceptance of nonempty stage lists and group declarations,
  and a four-group limit starting independently at every standalone or stage root.
- Refined APPROVAL-COMPOSITION-001/007; clarified invalid stage declarations in
  APPROVAL-ERROR-008. Stage containers and Requirement leaves consume no group
  level. Empty declarations remain distinct from valid all-inapplicable stages.
- Updated spec examples to use declared stage root groups, Approval README,
  traceability, research decision, source plan, and current backlog blocker.
- Traceability: requirements 001/007 move from BLOCKING SPEC GAP to UNCOVERED.
  Totals: 330 requirements; 231 COVERED, 28 UNCOVERED, 66 NOT DIRECTLY TESTABLE,
  5 BLOCKING SPEC GAP. No existing identifier or portable error category changed.
- Verification: git diff --check and Python documentation checks passed: 476 local
  links, all inventory totals, 330 unique rows, 31 traced composition/quorum IDs,
  six current snapshot hashes, 166 stable task IDs, unchanged closed coverage.
- Snapshot: docs/tasks/review-snapshots/d03-composition-003.json records the scoped
  specification translation; earlier manifests retain historical revisions.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. Contrast cases recorded for TASK-074; vectors and implementation await
  remaining semantics. No runtime tests/mutation runs apply to this spec-only
  change. Unit tests, runtime mutation tests, JSDoc, root/package implementation
  READMEs, /agentic, AGENTS.md, and CoreDoc need no changes: runtime behavior,
  APIs, canonical IDs, supported capability, and foundation rules are unchanged.
- Future critical mutants: accept empty stage/list, ignore unresolved root, count
  stage containers as group levels, ignore root depth, accept depth five, or
  accumulate depth across independent roots/stages.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-COMPOSITION-004 — Complete Validation (2026-09-12)

- Status: ACCEPTED validation-scope decision; directly authorized specification
  remediation complete. Precise actionability and deterministic error selection/
  mapping remain open under worklist items 4–5. TASK-073/074 remain unchecked.
- Authority: maintainer acceptance of complete structure and required-evidence
  validation before outcomes, including later stages and alternative branches.
- Added APPROVAL-COMPOSITION-024; clarified declared-Requirement applicability
  scope in 009. An apparent outcome cannot hide invalid required input, and
  validating later stages does not make them actionable. Explicit PENDING is
  valid evidence; absence of an effective Decision is not fabricated approval.
- This guarantees complete validation before an outcome without prescribing
  architecture or requiring collection of all errors. Error precedence remains
  a separate decision. No new portable code is introduced.
- Updated spec, Approval README, traceability, decisions, source plan, and backlog.
  Single-defect contrast cases recorded for TASK-074.
- Traceability: 009 moves from BLOCKING SPEC GAP to UNCOVERED; new 024 is UNCOVERED.
  Totals: 331 requirements, 231 COVERED, 30 UNCOVERED, 66 NOT DIRECTLY TESTABLE,
  4 BLOCKING SPEC GAP. Closed coverage and vector references are unchanged.
- Verification: git diff --check and Python documentation checks passed: 477 local
  links, all totals, 331 unique rows, 32 traced composition/quorum IDs, eight
  current snapshot hashes, 166 stable task IDs, and TASK-073/074 still open.
- Snapshot: docs/tasks/review-snapshots/d03-composition-004.json records this scoped
  specification translation; prior snapshots retain historical revisions.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. Vector publication remains TASK-074 after remaining semantics close.
  No runtime tests or mutation runs apply to this spec-only change. Unit tests,
  runtime mutation tests, JSDoc, root/package implementation READMEs, /agentic,
  AGENTS.md, and CoreDoc need no changes: runtime behavior, APIs, canonical IDs,
  supported capability, and foundation rules are unchanged.
- Future critical mutants: return an outcome before validating another branch,
  skip later-stage validation, treat missing state as PENDING, infer an exemption
  from missing facts, or make later stages actionable through validation.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-COMPOSITION-005 — Actionable Requirements (2026-09-12)

- Status: ACCEPTED actionability decision; directly authorized specification
  remediation complete. Only deterministic error selection/mapping remains open
  under worklist items 4–5. TASK-073/074 remain unchecked.
- Authority: maintainer acceptance of pending applicable Requirements through
  pending groups in the first pending stage, deduplicated in declared order, and
  no actionables for approved or rejected compositions.
- Refined APPROVAL-COMPOSITION-019. Recursive declared traversal reports first
  eligible occurrences; skipped branches cannot suppress later eligible paths.
  Alternative candidates remain alternatives, not a demand for every vote.
  Reporting order creates no within-stage prerequisite or authorization.
- Updated spec, Approval README, traceability, decision record, source plan, and
  current blocker. Recorded contrast cases for fulfilled/rejected branches,
  duplicate paths, declared order, later stages, and terminal outcomes.
- Traceability: 019 moves from BLOCKING SPEC GAP to UNCOVERED. Totals: 331
  requirements; 231 COVERED, 31 UNCOVERED, 66 NOT DIRECTLY TESTABLE, and 3 BLOCKING
  SPEC GAP. No existing identifier, portable error code, or closed coverage changed.
- Verification: git diff --check and Python documentation checks passed: 478 local
  links, all inventory totals, 331 unique rows, 32 traced composition/quorum IDs,
  five current snapshot hashes, 166 stable task IDs, and unchanged closed vector
  references. TASK-073/074 remain open.
- Snapshot: docs/tasks/review-snapshots/d03-composition-005.json identifies the
  scoped specification translation; earlier manifests retain historical revisions.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. Vector publication remains TASK-074 after error semantics close. No
  runtime tests or mutation runs apply to this spec-only change. Unit tests,
  runtime mutation tests, JSDoc, root/package implementation READMEs, /agentic,
  AGENTS.md, and CoreDoc need no changes: runtime behavior, APIs, canonical IDs,
  supported capability, and foundation-level obligations are unchanged.
- Future critical mutants: report later-stage leaves, descend into satisfied or
  rejected groups, deduplicate before eligibility, duplicate identifiers, sort
  names, report terminal actionables, or require all ANY_OF candidate approvals.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.


### D03-COMPOSITION-006 — Error Mapping and Precedence (2026-09-12)

- Status: ACCEPTED error decision; directly authorized specification remediation
  complete. Original worklist items 1–5 are resolved. TASK-073 remains BLOCKED on
  final-review item 6: conflicting effective vote evidence. TASK-074 stays open.
- Authority: maintainer acceptance of structure, applicability, required context,
  and required state/effectiveness category priority. Recommendations will remain
  explicit in subsequent decision discussions.
- Refined APPROVAL-COMPOSITION-010 and APPROVAL-ERROR-009; added ERROR-010. Missing
  required evaluation context retains INVALID_CONTEXT. Shared INVALID_CHAIN code
  in structural and evidence categories does not collapse their priority. Existing
  restricted-diagnostic and non-mutating evaluation rules remain intact.
- Updated spec, Approval README, traceability, decision record, plan, and blocker.
  Recorded mixed-defect contrast cases and preserved prior decision history.
- Final consistency inspection found that opposing effective Decisions by the
  same declared voter for one Requirement/current facts have no normative quorum
  resolution. Existing ApprovalDecisionHistory.evaluateRequirement returns an
  effective rejection, but no cited spec rule or manifest vector resolves this
  mixed-evidence quorum case. No runtime behavior or test expectation was changed.
- Pending recommendation: reject conflicting evidence in composition with
  INVALID_CHAIN until explicit lifecycle/current-effectiveness evidence removes
  the conflict; repeated same-outcome evidence remains deduplicated. This new
  proposal is not maintainer-accepted and is not normative yet.
- Traceability: earlier three error gaps resolve; three quorum rows (002/005/006)
  expose the new conflict gap; new ERROR-010 is UNCOVERED. Totals: 332 requirements,
  231 COVERED, 32 UNCOVERED, 66 NOT DIRECTLY TESTABLE, 3 BLOCKING SPEC GAP.
- Verification: git diff --check and Python documentation checks passed: 478 local
  links, all inventory totals, 332 unique rows, 32 traced composition/quorum IDs,
  nine current snapshot hashes, 166 stable task IDs, and unchanged closed coverage.
- Snapshot: docs/tasks/review-snapshots/d03-composition-006.json; prior manifests
  retain historical revision identities. No full review closure is claimed.
- Completion applicability: spec, Approval README, traceability, and task documents
  updated. TASK-074 retains vector publication after the remaining semantics close.
  No runtime tests/mutation runs apply to this spec-only work. Unit tests, runtime
  mutation tests, JSDoc, root/package implementation READMEs, /agentic, AGENTS.md,
  and CoreDoc need no changes because runtime behavior, APIs, canonical IDs,
  supported capability, and foundation rules are unchanged.
- Future critical mutants: priority inversion, branch-order-dependent error code,
  context collapsed into INVALID_CHAIN, diagnostic leakage, or a validation error
  hidden by aggregate outcome. Conflict mutants await the item 6 decision.
- External review: NOT EXTERNALLY REVIEWED; retained for future community/audit
  challenge under D03-REVIEW-001.

### D03-QUORUM-003 and TASK-073 — Final Review Closure (2026-09-12)

- Status: COMPLETE. This entry supersedes the earlier TASK-073 blocker statuses;
  their decision-time findings and revision manifests remain historical records.
- Authority: the maintainer accepted the opposing-effective-vote recommendation
  and explicitly instructed automatic acceptance of recommended options. Scoped
  follow-up recommendations in this Approval Composition review were applied and
  recorded under that authority. This is distinct from governance-only acceptance
  of D03-REVIEW-001 and does not claim independent review of the final file bytes.
- Domain/accounting and technical/security analysis: assistant-prepared, accepted
  by the maintainer under the documented instruction. Findings, alternatives,
  rationale, CoreDoc/requirement references, resolutions, contrast cases, and
  remaining review limitations are in the research packet's final review record.
- Final conflict resolution: APPROVAL-QUORUM-009 rejects opposing effective
  outcomes from one applicable named voter for its Requirement/current context
  with INVALID_CHAIN in evidence priority category 4. No implicit latest/first
  vote or approval/rejection preference is permitted; same-outcome repeats remain
  deduplicated. Lifecycle and current-effectiveness evidence determine whether a
  historical Decision still participates. Evaluation never rewrites history.
- Recommended clarification: APPROVAL-QUORUM-010 defines each applicable member's
  state using only matching named-voter/Requirement/current-context evidence and
  the Requirement's outcome mapping. Other eligible Actors cannot consume that
  voter's pending capacity or supply its approval. Actionability uses this member
  state while retaining unique Requirement reporting. Standalone Draft 0.2 APIs
  and their existing test expectations remain unchanged.
- Synchronized artifacts: spec/approvals/composition.md, errors.md, README.md;
  conformance/traceability.md; the research decision packet, implementation plan,
  execution backlog, and this evidence log. Added the final review snapshot.
  TASK-074 now explicitly carries forward the accepted contrast cases and source
  requirement ranges. It remains unchecked and has not been executed.
- Traceability: 334 unique canonical requirements; 231 COVERED, 37 UNCOVERED,
  66 NOT DIRECTLY TESTABLE, zero BLOCKING SPEC GAP. All 37 directly testable new
  composition/quorum/error requirements await vectors. All 199 existing manifest
  vectors, their closed coverage references, runtime files, and Agentic metadata
  are unchanged. No composition conformance or implementation is claimed.
- Verification: PASS — Python documentation checks verified 485 local Markdown
  links/anchors, all 334 canonical normative IDs mapped uniquely, domain/modality/
  coverage totals, 34 composition/quorum IDs, unchanged closed coverage, 166 stable
  task IDs, completed dependency TASK-072, completed TASK-073 with its DoD checked,
  TASK-074 still unchecked, and the execution pointer set to TASK-074. Eleven
  final snapshot hashes match the resulting artifacts. git diff --check passed.
  The documentation checker was adjusted to treat an absent zero-count category
  as zero when the last blocking-gap rows were resolved.
- Snapshot: docs/tasks/review-snapshots/task-073-final.json. The manifest includes
  this completed evidence record and identifies the resulting accepted
  specification translation. Prior manifests were not rewritten. CoreDoc v0.5
  retains SHA-256 53d5565c6ac0cad831ec9409c86c1648c93f15c15325530eca7581cb6d6fdf1f.
- Completion applicability: spec, Approval README, traceability, and task docs
  required updates and received them. AGENTS.md already contains the accepted
  governance. CoreDoc, unit tests, conformance vectors, mutation tests, JSDoc,
  root/package implementation READMEs, and /agentic require no additional edits
  because foundation obligations, runtime behavior, APIs, canonical IDs, and
  implemented capabilities are unchanged. No Node/build/unit/conformance/mutation
  run applies to this artifact-only review; those checks remain mandatory for
  their named future tasks, beginning with TASK-074's conformance-first checks.
- Future critical defects to test: conflicting evidence accepted or masked by a
  decisive branch; vote order/timestamps silently choosing an outcome; another
  Actor changing the member's state; duplicate evidence increasing voting power;
  ineffective evidence still counting; category priority inversion; or history
  mutation during evaluation. Earlier accepted decision records supply the other
  threshold, applicability, stage, depth, actionability, and diagnostic cases.
- External review: NOT EXTERNALLY REVIEWED. Future community, accounting,
  security, and audit review can challenge stable rule IDs and these revisions.
- Next task: TASK-074 — Approval Composition Conformance Families. Review closure
  clears its dependency; the Advanced Approvals milestone remains incomplete.


### TASK-074 — Approval Composition Conformance Families (2026-09-12)

- Status: COMPLETE. Added a manifest-listed Draft 0.3 Approval Composition conformance family while leaving runtime implementation and adapter support pending for later Advanced Approvals tasks.
- Added `conformance/approvals/composition.json` with 19 vectors covering any/all/quorum groups, ordered stages, nested/inapplicable groups, threshold boundaries, duplicate definitions, rejected/pending behavior, missing/unresolved state, cycles, depth overflow, complete validation, error priority, opposing effective votes, member-specific voter evidence, and current-effectiveness exclusions.
- Registered `approval.composition.evaluate` as a conformance-local operation in `runner/src/metadata.ts` and `conformance/conventions.md`; it is not an Agentic operation. Updated `runner/test/integration.test.ts` for 218 manifest-listed vectors.
- Traceability: all 37 directly testable Draft 0.3 Approval Composition, Quorum, and Error requirements are now vector-covered. Inventory is 334 requirements: 268 COVERED, 0 UNCOVERED, 66 NOT DIRECTLY TESTABLE, 0 BLOCKING SPEC GAP. The suite now contains 218 vectors.
- Verification: Node v24.20.0 from `.tools/node-v24.20.0-linux-x64`; `npm run build --workspaces` exited 0; `npm run test --workspace @finkore/conformance-runner` exited 0 with 10 files / 110 tests passing. Full conformance command `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` exited 3 as expected for unsupported vectors: 218 total, 199 passed, 0 failed, 19 unsupported, 0 infrastructure errors. All unsupported vectors are in the Approvals suite; Money 83/83, Workflow 20/20, Audit 29/29, Entities 20/20, and existing Approvals 47/47 remain passing.
- Mutation: not applicable for this conformance-first artifact task. The 19 new vectors are mutation-sensitive red coverage for later implementation and hardening tasks.
- Completion applicability: conformance vectors, manifest, traceability, runner metadata/tests, conformance conventions, execution evidence, and backlog required updates and received them. No TypeScript core API, adapter handler, JSDoc, root/package README, `/spec`, `/agentic`, AGENTS.md, or CoreDoc update is required because no runtime capability or canonical operation is implemented or promoted in this task.
- External review: NOT EXTERNALLY REVIEWED. TASK-073 scoped review remains the accepted source for the contrast cases; TASK-074 adds executable conformance expectations only.
- Next task: TASK-075 — Approval Composition TypeScript Model and API.


### TASK-075 — Approval Composition TypeScript Model and API (2026-09-12)

- Status: COMPLETE. Implemented the Draft 0.3 Approval Composition definition model/API without adding evaluation or adapter support.
- Red evidence: before implementation, `npm run test --workspace @finkore/typescript -- test/approvals` failed against the focused composition tests because `ApprovalComposition` was not exported/implemented. This established the missing public model/API before code was added.
- Added `implementations/typescript/core/src/approvals/approval-composition.ts` with validation for exactly one `rootGroup` or nonempty ordered `stages`, unique group/stage/member identifiers, supported `ALL_OF`, `ANY_OF`, and `N_OF_M` group kinds, nonempty members, bounded child-group traversal, valid references, fixed positive quorum thresholds, explicit distinct quorum voters, and defensive observations.
- Added public serialized composition types and exported `ApprovalComposition` from the TypeScript core. Public JSDoc references the relevant Composition, Quorum, and portable error requirement IDs and states that evaluation, authorization, callbacks, dynamic approvers, and adapter normalization are out of scope.
- Added unit, boundary, and mutation-sensitive tests in `implementations/typescript/core/test/approvals/`, covering valid standalone/staged/quorum definitions, malformed top-level values, duplicate identifiers, invalid group kinds, unresolved references, cycles/depth overflow, malformed stages, threshold boundaries, voter declarations, child-group quorum rejection, opaque voter identities, and defensive snapshots.
- Added `src/approvals/approval-composition.ts` to core Stryker scope and synchronized adapter tests for the current approval conformance split of 47 passing vectors plus 19 unsupported composition evaluation vectors.
- Verification: Node v24.20.0 from `.tools/node-v24.20.0-linux-x64`; `npm run build --workspaces` exited 0; `npm run typecheck --workspaces` exited 0; `npm run test --workspace @finkore/typescript -- test/approvals` exited 0 with 8 files / 84 tests passing; `npm run test --workspace @finkore/typescript-conformance-adapter` exited 0 with 1 file / 13 tests passing; `npm run test:coverage --workspace @finkore/typescript` exited 0 with 33 files / 289 tests passing and 98.87% statements, 98.32% branches, 100% functions, 99.37% lines; `git diff --check` passed.
- Conformance: `node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite approvals --json` exited 3 as expected: 66 total, 47 passed, 0 failed, 19 unsupported, 0 infrastructure errors. The unsupported set remains the TASK-074 `approval.composition.evaluate` vectors pending TASK-076 and later adapter/evaluation work.
- Mutation: targeted core mutation `npm run test:mutation --workspace @finkore/typescript -- --mutate src/approvals/approval-composition.ts` exited 0 with 100.00% score, 238 killed, 3 timeout, 0 survived, 0 no coverage. Reports: `implementations/typescript/core/reports/mutation/mutation.json` and `implementations/typescript/core/reports/mutation/mutation.html`.
- Documentation synchronization: updated the TypeScript core README to advertise Approval Composition definition validation while explicitly keeping composition evaluation/conformance pending. No root README update was needed because the public capability is a package-level model/API slice, not slice closure. No `/spec`, `/conformance`, `/agentic`, AGENTS.md, or CoreDoc update was needed because the normative behavior, vector set, canonical operation inventory, governance, and foundation obligations did not change.
- Completion applicability: unit tests yes; conformance vectors no change; mutation tests yes; JSDoc yes; package README yes; `/spec`, `/conformance`, `/agentic`, AGENTS.md, CoreDoc, and root README reviewed with no task-required changes. Advanced Approvals remains incomplete; TASK-076 starts Any-of and All-of evaluation.
