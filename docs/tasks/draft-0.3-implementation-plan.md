# FinKore Draft 0.3 Implementation Plan

## 1. Executive Summary

Draft 0.3 should deepen FinKore's usefulness for complex corporate financial workflows by building on the expected Draft 0.2 foundation rather than adding unrelated domains. The recommended theme is advanced but bounded orchestration:

- Approval composition beyond all-required chains: any-of, all-of, N-of-M quorum, ordered stages, and bounded nested groups.
- Portable condition research and, only if justified, a small deterministic condition model over explicit facts.
- Workflow definition versioning and a small expected-state or expected-revision conflict contract.
- Entity import and migration identity semantics that preserve stable FinKore identity without creating a master-data registry.
- Money portability research for precision, overflow, minor-unit metadata, and private currency namespace decisions.
- Conservative Agentic review for state-changing Approval and Workflow capabilities.

Draft 0.3 should not implement delegation, escalation, tax primitives, interest, audit retention, ledger behavior, payments, BPMN, IAM/RBAC, or persistence unless research produces a narrow portable Core rule. The plan assumes Draft 0.2 is not yet executed in this repository; every 0.3 milestone is therefore gated by verification that the 0.2 capabilities it depends on are actually closed.

## 2. Actual Repository Baseline

Draft 0.1 complete state:

| Area | Actual state |
| --- | --- |
| Specification | `/spec` contains Draft 0.1 Money, Workflow, Audit, Approvals, Entities, shared conventions, and glossary. |
| Conformance | `conformance/manifest.json` is version `0.1`; `conformance/traceability.md` reports 213 requirements, 138 vectors, 149 covered, 64 not directly testable, 0 uncovered, and 0 blocking spec gaps. |
| Agentic | Canonical Draft 0.1 operations include Money operations, `finkore.workflow.transition`, and Audit append/remove/replace. Entity and advanced Approval operations remain conformance-local. |
| TypeScript | The TypeScript reference implementation README states Draft 0.1 is complete for Money, Workflow, Audit, Approvals, and Entities. It explicitly excludes 0.2/0.3 topics such as allocation, correction/reversal, supersession, workflow versioning, concurrency, quorum, delegation, withdrawal, expiration, and escalation. |
| Runner | The runner is domain-neutral and must remain so. |

Draft 0.2 planned state:

| Domain | Expected Draft 0.2 capability from `docs/tasks/draft-0.2-implementation-plan.md` |
| --- | --- |
| Money | Exact rate/percentage application, allocation/splitting, deterministic remainder behavior. |
| Entities | Revision/evolution identity plus correction, reversal, void, and supersession. |
| Audit | Relationship metadata supporting Entity evolution. |
| Approvals | Withdrawal, expiration, supersession, current-effectiveness, and stronger subject/revision validity. |
| Agentic | Review and possible promotion of mature Money, Entity, Audit, and Approval operations. |

Draft 0.2 actually implemented state in the current repository:

| Area | Actual state |
| --- | --- |
| Docs | `docs/tasks/draft-0.2-implementation-plan.md` exists. |
| Specification | No `MONEY-RATE-*`, `MONEY-ALLOCATION-*`, `ENTITY-EVOLUTION-*`, `AUDIT-RELATIONSHIP-*`, or `APPROVAL-LIFECYCLE-*` requirements are present. |
| Conformance | No Draft 0.2 manifest, vectors, or traceability closure exist. |
| Agentic | No Draft 0.2 operation promotions are present. |
| TypeScript | No Draft 0.2 public APIs are present. |

Planning assumption: Draft 0.3 will be executed only after Draft 0.2 is completed or explicitly re-scoped. If a future Codex run finds that Draft 0.2 was implemented differently from the 0.2 plan, it must update this 0.3 roadmap before beginning feature work.

## 3. Draft 0.2 Dependency Review

Draft 0.3 depends on these expected Draft 0.2 outcomes:

| 0.2 capability | Why it matters for 0.3 |
| --- | --- |
| Approval withdrawal/expiration/supersession | Quorum and group evaluation must not count withdrawn, expired, superseded, or stale decisions. |
| Approval current-effectiveness | 0.3 composition must reuse the same effectiveness model instead of creating contradictory rules. |
| Entity revision/evolution identity | Approval facts and Workflow binding may need stable references to current or historical Entity revisions. |
| Audit relationship metadata | Advanced Approval and Entity operations may need audit evidence without rewriting history. |
| Money rate/allocation | Tax research and precision/overflow review should start from known exact Money expansion behavior. |
| Agentic 0.2 review | 0.3 should not promote advanced state-changing operations unless 0.2 descriptors are aligned. |

Hard gate: if Draft 0.2 is not closed, Step 1 of this plan must stop with `BLOCKED BY DRAFT 0.2 NOT CLOSED` unless the user explicitly asks to revise the 0.3 plan around a different baseline.

## 4. Candidate Capability Assessment

| Capability | Domain | Decision | Reason | 0.2 Dependency | Complexity | External Review |
| --- | --- | --- | --- | --- | --- | --- |
| Any-of Approval composition | Approvals | IN 0.3 | Covers common "Finance Manager OR CFO" scenarios without full graph engine. | Current-effectiveness. | MEDIUM | Domain review. |
| All-of explicit group composition | Approvals | IN 0.3 | Generalizes existing all-required chains into reusable grouped composition. | Current chain semantics. | MEDIUM | Domain review. |
| N-of-M quorum | Approvals | IN 0.3 | High-value corporate primitive for boards, committees, and spending approvals. | Withdrawal, expiration, supersession, stale-fact handling. | HIGH | Domain/accounting review. |
| Ordered approval stages | Approvals | IN 0.3 | Supports "Manager THEN Finance OR Controller THEN CFO" without arbitrary workflow graphs. | Group composition and current-effectiveness. | HIGH | Domain review. |
| Bounded nested approval groups | Approvals | IN 0.3 | Needed for practical composition; must be limited and deterministic. | Any/all/quorum groups. | HIGH | Domain/security review. |
| Unrestricted approval graph engine | Approvals | REJECT | Would turn Core into a BPM/rules product. | None. | VERY HIGH | Not applicable. |
| Delegation | Approvals | RESEARCH FIRST | Useful, but authority validation may require IAM/RBAC. | Current-effectiveness and actor semantics. | HIGH | Security/domain review. |
| Escalation | Approvals | DEFER 0.4+ | Usually depends on timers, notifications, task routing, and policy infrastructure. | Delegation/time model. | HIGH | Security/domain review later. |
| Portable condition model research | Conditions/Approvals | RESEARCH FIRST | Needed before adding richer deterministic predicates; must avoid executable DSL risk. | Current condition boundary and subject facts. | VERY HIGH | Security/domain review. |
| Minimal deterministic condition model | Conditions/Approvals | IN 0.3 if research passes | Could unlock portable amount thresholds and fact checks without a general rules engine. | Research milestone approval. | HIGH | Security/domain review. |
| CEL/JSON Logic/FEEL adoption | Conditions/Approvals | RESEARCH FIRST | Existing standards may be better than inventing a DSL, but only a restricted subset may fit. | Condition research. | VERY HIGH | Security review. |
| Workflow definition versioning | Workflow | IN 0.3 | Prevents existing instances from silently changing behavior after definition changes. | Entity revision concepts helpful but not mandatory. | HIGH | Technical/domain review. |
| Workflow migration semantics | Workflow | DEFER 0.4+ | State mapping and migration policy are composing-domain heavy. | Versioning. | VERY HIGH | Domain review later. |
| Workflow import semantics | Workflow | IN 0.3 | Complements version binding for legacy/current-state observations. | Definition versioning. | MEDIUM | Domain review. |
| Expected current state/revision conflict | Workflow/Entities | IN 0.3 | Portable optimistic conflict concept without specifying persistence. | Entity revision and Workflow versioning. | HIGH | Technical review. |
| Distributed concurrency/locking | Workflow | REJECT | Persistence and distributed systems concern, not Core domain semantics. | None. | VERY HIGH | Not applicable. |
| Entity revision identity refinement | Entities | IN 0.3 | Needed to distinguish business revisions from database versions. | 0.2 revision/evolution baseline. | MEDIUM | Domain review. |
| Entity import/migration identity mapping | Entities | IN 0.3 | Common legacy migration need; can define identity aliases without a registry. | Entity identity and revision semantics. | HIGH | Domain/security review. |
| Cross-entity identity registry | Entities | RESEARCH FIRST | Default defer; may not belong in Core without concrete need. | Import identity research. | HIGH | Technical/security review. |
| Audit provenance reason/source/correlation | Audit | RESEARCH FIRST | Useful for imports and advanced approvals, but must avoid tracing platform scope. | 0.2 relationship metadata. | MEDIUM | Security review. |
| Audit retention | Audit | DEFER 0.4+ | Legal/security policy varies too much for 0.3. | Audit relationship maturity. | VERY HIGH | Legal/security review later. |
| Money precision/overflow portability | Money | RESEARCH FIRST | Cross-language reliability issue that should be decided before v0.5. | 0.2 Money expansion. | HIGH | Technical review. |
| Currency minor-unit metadata | Money | RESEARCH FIRST | Useful if kept separate from calculation scale; stale data risk is real. | 0.2 rounding/allocation. | MEDIUM | Domain review. |
| Private/non-ISO currency namespace | Money | RESEARCH FIRST | Important interoperability issue, but universal registry would be overreach. | Currency semantics. | HIGH | Domain/security review. |
| Accountant-reviewed tax primitives | Financial utilities | RESEARCH FIRST | Only a jurisdiction-neutral core should enter FinKore. | Rate application. | VERY HIGH | Accountant review. |
| Interest/accrual/day-count | Financial utilities | DEFER 0.4+ | Requires calendars, compounding, periods, and conventions. | Rate semantics. | VERY HIGH | Accountant review later. |
| Optional Java or Go proof slice | Portability | IN 0.3 as OPTIONAL | Validates language independence before v0.5 without turning 0.3 into ports. | Stable mature slice. | MEDIUM | Technical review. |

## 5. Recommended Draft 0.3 Scope

Recommended in 0.3:

1. Approval composition spec and implementation for `ANY_OF`, `ALL_OF`, `N_OF_M`, ordered stages, and bounded nested groups.
2. Quorum counting semantics that compose with Draft 0.2 current-effectiveness, including expired, withdrawn, superseded, ineligible, duplicate, rejected, and stale decisions.
3. Research milestone for portable condition standards, followed by a minimal deterministic condition model only if the research gate passes.
4. Workflow definition identity/version binding and import semantics.
5. Portable expected-state or expected-revision conflict contract for Workflow/Entity operations, without persistence or locking.
6. Entity revision identity refinement and import/migration identity mapping.
7. Money portability research for precision/overflow limits, minor-unit metadata, and private currency namespaces, producing decisions or deferrals rather than automatic implementation.
8. Conservative Audit provenance research for source/correlation/reason metadata.
9. Agentic review for new state-changing Approval and Workflow operations.
10. Optional Java or Go proof-of-portability for a mature, isolated slice.

## 6. Explicit Draft 0.3 Non-Goals

Draft 0.3 must not include:

- Full ledger, journal entries, double-entry accounting, reconciliation, fiscal periods, or account balances.
- Payments, bank integrations, settlement, card rails, or FX market data.
- Full tax engine, jurisdiction-specific tax behavior, filings, recoverability, or compound-tax policy.
- Interest/accrual/day-count/compounding engine.
- BPMN, unrestricted workflow graphs, queues, inboxes, timers, reminders, notifications, or task routing.
- General-purpose rule engine, arbitrary expression DSL, callbacks, `eval`, SQL fragments, or implementation-language expressions.
- IAM/RBAC, authentication, organization directory, authority validation, or access-control framework.
- ORM, database, persistence, storage transactions, distributed locks, distributed consensus, or global ordering.
- Reporting/BI, dashboards, UI, or document rendering.
- Full Java, Go, or .NET ports.

## 7. Dependency Graph

```text
Step 1: Draft 0.2 Closure Verification and 0.3 Scope Refresh
  -> Step 2: Approval Composition and Quorum Specification
  -> Step 5: Workflow Definition Versioning Specification
  -> Step 8: Entity Import and Revision Specification
  -> Step 10: Money Portability Research
  -> Step 11: Condition Model Research
  -> Step 12: Audit Provenance Research

Step 2 -> Step 3: Approval Composition Implementation
Step 3 -> Step 4: Approval Composition Closure

Step 5 -> Step 6: Workflow Versioning and Conflict Implementation
Step 6 -> Step 7: Workflow Versioning Closure

Step 8 -> Step 9: Entity Import and Revision Implementation

Step 11 -> Step 13: Minimal Condition Model Specification and Implementation

Steps 4, 7, 9, 10, 12, 13 -> Step 14: Agentic 0.3 Review
Step 14 -> Step 15: Optional Cross-Language Proof
Step 14 -> Step 16: Draft 0.3 Closure
Step 15 -> Step 16 if executed
```

Critical path: Steps 1, 2, 3, 4, 5, 6, 7, 14, 16.

Can run in parallel after Step 1: Workflow specification, Entity import specification, Money portability research, Condition research, and Audit provenance research.

Optional: Step 15.

## 8. Detailed Execution Plan

### Step 1. Draft 0.2 Closure Verification and 0.3 Scope Refresh

| Field | Plan |
| --- | --- |
| Title | Draft 0.2 Closure Verification and 0.3 Scope Refresh |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM: broad audit with no feature implementation. |
| Objective | Verify actual Draft 0.2 completion status and update this plan if implementation differs from the expected baseline. |
| Why it belongs in 0.3 | 0.3 depends heavily on 0.2 Approval validity, Entity evolution, Audit relationships, and Money expansion. |
| Prerequisites | Draft 0.2 plan exists; ideally Draft 0.2 closure has been executed. |
| Exact scope | Inspect repo state, compare to 0.2 closure criteria, identify implemented vs planned 0.2 capabilities, and amend this 0.3 plan if needed. |
| Explicit non-scope | Do not implement any 0.2 or 0.3 feature. |
| Artifacts to inspect | `README.md`, `AGENTS.md`, `docs/tasks/draft-0.2-implementation-plan.md`, `spec/**`, `conformance/**`, `agentic/**`, `runner/**`, `implementations/typescript/**`. |
| Artifacts likely to change | `docs/tasks/draft-0.3-implementation-plan.md` only if the baseline changed. |
| Normative requirements | None. |
| Conformance work | Confirm `UNCOVERED = 0` and `BLOCKING SPEC GAPS = 0` for closed 0.2 scope. |
| Agentic impact | Confirm 0.2 operation promotions or conformance-local decisions. |
| Portable errors | Confirm 0.2 error catalog alignment. |
| TypeScript implementation | None. |
| Tests | Run `node --version`; if dependencies are present, run `npm run typecheck --workspaces` and `npm run test --workspaces`. Follow AGENTS Node toolchain instructions if Node is unavailable. |
| Critical mutation scenarios | None for this planning gate. |
| Documentation | Update this document if reality differs from assumptions. |
| External review requirements | None. |
| Stop conditions | `BLOCKED BY DRAFT 0.2 NOT CLOSED` if required 0.2 semantics are absent and the user has not approved a revised 0.3 baseline. |
| Definition of Done | Actual 0.2 baseline is documented and 0.3 scope remains valid. |
| Expected readiness status | READY FOR NEXT 0.3 MILESTONE. |

### Step 2. Approval Composition and Quorum Specification

| Field | Plan |
| --- | --- |
| Title | Approval Composition and Quorum Specification |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: quorum and nesting are financially sensitive and off-by-one prone. |
| Objective | Define bounded Approval composition for any-of, all-of, N-of-M quorum, ordered stages, and limited nested groups. |
| Why it belongs in 0.3 | It is the highest-value corporate workflow primitive deferred from 0.2. |
| Prerequisites | 0.2 Approval current-effectiveness is closed. |
| Exact scope | Define group identity, group members, requirement-state inputs, ordering rules, quorum thresholds, rejection counting, duplicate handling, ineligible decisions, and interaction with expired/withdrawn/superseded/stale decisions. |
| Explicit non-scope | Delegation, escalation, dynamic approver resolution, RBAC, notifications, parallel execution infrastructure, unrestricted graphs. |
| Artifacts to inspect | `spec/approvals/**`, `conformance/approvals/decisions.json`, `docs/tasks/draft-0.2-implementation-plan.md`, TypeScript approval chain API/tests. |
| Artifacts likely to change | New or updated `spec/approvals/composition.md`, `spec/approvals/chains.md`, `spec/approvals/errors.md`, `spec/approvals/README.md`, conformance vector drafts, traceability. |
| Normative requirements | Add stable `APPROVAL-COMPOSITION-*` and `APPROVAL-QUORUM-*` requirements. |
| Conformance work | Design positive, negative, boundary, invariant, and mutation-sensitive vectors for all-of, any-of, N-of-M, ordered stages, nested groups, duplicate members, missing states, explicit rejection, and stale/expired/withdrawn/superseded decisions. |
| Agentic impact | Do not promote yet; record candidate operation semantics for later review. |
| Portable errors | Prefer existing `FINKORE_APPROVAL_INVALID_CHAIN`, `FINKORE_APPROVAL_REQUIRED`, and `FINKORE_APPROVAL_CONDITION_UNRESOLVED` unless a new stable category is required. |
| TypeScript implementation | None. |
| Tests | Spec/conformance validation only if available. |
| Critical mutation scenarios | Quorum threshold off by one, rejected counted as approved, withdrawn counted, expired counted, superseded counted, duplicate voter counted twice, order ignored, missing state treated as approval. |
| Documentation | Update Approval README and traceability with planned implementation status. |
| External review requirements | Domain/accounting review for quorum semantics. |
| Stop conditions | `BLOCKED BY SPEC GAP` if quorum voter identity or current-effectiveness composition is ambiguous. |
| Definition of Done | Approval composition requirements are precise and vector-ready. |
| Expected readiness status | READY FOR Approval Composition Implementation. |

### Step 3. Approval Composition Implementation

| Field | Plan |
| --- | --- |
| Title | Approval Composition Implementation |
| Type | IMPLEMENTATION |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: recursive/group evaluation must remain deterministic and bounded. |
| Objective | Implement the specified Approval composition model in TypeScript and conformance adapter fixtures. |
| Why it belongs in 0.3 | It operationalizes the core 0.3 approval theme. |
| Prerequisites | Step 2 complete. |
| Exact scope | Add public TypeScript APIs for composition evaluation, conformance operations, normalization, and tests. Ensure evaluation consumes effective requirement/decision state as specified. |
| Explicit non-scope | Rich conditions, delegation, escalation, authorization, persistence. |
| Artifacts to inspect | `implementations/typescript/core/src/approvals/**`, approval tests, adapter operations, conformance vectors. |
| Artifacts likely to change | Approval source, tests, errors if needed, adapter, conformance vectors, README, JSDoc. |
| Normative requirements | Implement all `APPROVAL-COMPOSITION-*` and `APPROVAL-QUORUM-*` requirements. |
| Conformance work | Add manifest-listed vectors from Step 2 with requirement traceability. |
| Agentic impact | Keep operations conformance-local until Step 14. |
| Portable errors | Implement only finalized error categories. |
| TypeScript implementation | Keep core independent of runner/conformance; use deterministic traversal and defensive observations. |
| Tests | Unit, adapter, conformance, build, typecheck, coverage. |
| Critical mutation scenarios | Same as Step 2, plus nested group early return, threshold comparison mutation, branch order dependence, mutable input state. |
| Documentation | JSDoc for every public API; update TypeScript README and root status if capability is implemented. |
| External review requirements | None beyond Step 2 unless semantics changed. |
| Stop conditions | `BLOCKED BY SPEC GAP` if implementation needs behavior Step 2 did not define. |
| Definition of Done | Implementation and conformance pass; docs and JSDoc current; no adapter domain logic. |
| Expected readiness status | Approval composition implemented, pending closure. |

### Step 4. Approval Composition Closure

| Field | Plan |
| --- | --- |
| Title | Approval Composition Closure |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM: focused traceability and mutation review. |
| Objective | Close the Approval composition slice with clean traceability, docs, and mutation results. |
| Why it belongs in 0.3 | Quorum is high-risk financial behavior and needs explicit closure separate from implementation. |
| Prerequisites | Step 3 complete. |
| Exact scope | Audit requirements, vectors, errors, README/JSDoc, and mutation results for the composition slice. |
| Explicit non-scope | New approval features. |
| Artifacts to inspect | `spec/approvals/**`, `conformance/approvals/**`, `conformance/traceability.md`, approval tests, mutation reports. |
| Artifacts likely to change | Traceability, README/status, tests if closure finds gaps. |
| Normative requirements | Every directly testable mandatory composition requirement covered. |
| Conformance work | `UNCOVERED = 0`, `BLOCKING SPEC GAPS = 0` for the slice. |
| Agentic impact | Prepare candidates for Step 14, but do not promote here. |
| Portable errors | Verify aligned categories. |
| TypeScript implementation | Only remediation if closure finds a defect. |
| Tests | Run approval unit tests, adapter tests, relevant conformance, coverage, and mutation. |
| Critical mutation scenarios | Any critical composition mutant from Steps 2-3 surviving. |
| Documentation | Finalize status in approval and root docs. |
| External review requirements | Domain review signoff or documented follow-up. |
| Stop conditions | `BLOCKED BY CRITICAL MUTANT` or `BLOCKED BY TRACEABILITY GAP`. |
| Definition of Done | Approval composition slice is closed and ready for Agentic review. |
| Expected readiness status | Approval composition 0.3 slice closed. |

### Step 5. Workflow Definition Versioning Specification

| Field | Plan |
| --- | --- |
| Title | Workflow Definition Versioning Specification |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: version binding must avoid persistence assumptions. |
| Objective | Define workflow definition identity, version identity, instance binding, import behavior, and expected-state/revision conflict semantics. |
| Why it belongs in 0.3 | Existing instances must not silently change behavior when definitions are modified. |
| Prerequisites | 0.2 closure verified; Entity revision concepts inspected. |
| Exact scope | Specify definition identity/version fields, immutable behavior for bound instances, import with existing state/version, and an optional expected current state or revision precondition for transition requests. |
| Explicit non-scope | Migration between definitions, database locks, distributed concurrency, BPMN, authorization. |
| Artifacts to inspect | `spec/workflow/**`, `conformance/workflow/transitions.json`, `spec/entities/**`, Workflow implementation/tests. |
| Artifacts likely to change | New or updated `spec/workflow/versioning.md`, `spec/workflow/states.md`, `spec/workflow/transitions.md`, `spec/workflow/errors.md`, conformance designs, traceability. |
| Normative requirements | Add `WORKFLOW-VERSION-*`, `WORKFLOW-IMPORT-*`, and possibly `WORKFLOW-CONFLICT-*` requirements. |
| Conformance work | Design vectors for stable binding, newer definition ignored unless explicit migration exists, import with version, missing version if required, expected state mismatch, and failed transition state preservation. |
| Agentic impact | `finkore.workflow.transition` descriptor may need expected-state/version preconditions. |
| Portable errors | Existing `FINKORE_WORKFLOW_INVALID_DEFINITION`, `FINKORE_WORKFLOW_INVALID_STATE`, and `FINKORE_WORKFLOW_INVALID_TRANSITION` may be insufficient; likely add `FINKORE_WORKFLOW_VERSION_CONFLICT` only if a stable conflict category is needed. |
| TypeScript implementation | None. |
| Tests | Spec/conformance validation only if available. |
| Critical mutation scenarios | Instance silently uses newer definition, version ignored, expected state mismatch accepted, import invents version, failure mutates state. |
| Documentation | Update Workflow README and traceability. |
| External review requirements | Technical/domain review for version identity semantics. |
| Stop conditions | `BLOCKED BY SPEC GAP` if version identity vs migration semantics cannot be separated. |
| Definition of Done | Workflow versioning semantics are vector-ready and migration remains explicitly deferred. |
| Expected readiness status | READY FOR Workflow Versioning Implementation. |

### Step 6. Workflow Versioning and Conflict Implementation

| Field | Plan |
| --- | --- |
| Title | Workflow Versioning and Conflict Implementation |
| Type | IMPLEMENTATION |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: must preserve Draft 0.1 transition behavior while adding version preconditions. |
| Objective | Implement Workflow version binding, import, and expected-state/revision conflict behavior. |
| Why it belongs in 0.3 | It prevents silent behavior drift in corporate workflow instances. |
| Prerequisites | Step 5 complete. |
| Exact scope | Add TypeScript Workflow definition version support, instance binding observation, import validation, transition precondition checks, vectors, adapter translation, and tests. |
| Explicit non-scope | Workflow migration, storage conflict resolution, locks, queues, authorization. |
| Artifacts to inspect | Workflow source/tests, adapter operations, conformance workflow vectors, Agentic workflow docs. |
| Artifacts likely to change | `implementations/typescript/core/src/workflow/**`, tests, adapter, conformance vectors, traceability, Workflow README, JSDoc. |
| Normative requirements | Implement all Step 5 requirements. |
| Conformance work | Manifest-listed vectors with traceability. |
| Agentic impact | Defer final descriptor update to Step 14 unless existing descriptor becomes inaccurate. |
| Portable errors | Implement finalized version/conflict codes only. |
| TypeScript implementation | Preserve domain-neutral runner and no Approval/Entity imports in Workflow core. |
| Tests | Unit, adapter, conformance, build, typecheck, coverage. |
| Critical mutation scenarios | Version ignored, newer definition used, expected-state check inverted, failed transition mutates state, import accepts undeclared version/state. |
| Documentation | Public APIs documented with JSDoc; README/status updated. |
| External review requirements | Technical review for portability of version fields. |
| Stop conditions | `BLOCKED BY SPEC GAP` if implementation requires migration behavior. |
| Definition of Done | Workflow versioning and conflict behavior passes tests/conformance and docs are current. |
| Expected readiness status | Workflow versioning implemented, pending closure. |

### Step 7. Workflow Versioning Closure

| Field | Plan |
| --- | --- |
| Title | Workflow Versioning Closure |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM. |
| Objective | Close Workflow 0.3 versioning with traceability, mutation review, and docs. |
| Why it belongs in 0.3 | Version binding is foundational for stable corporate workflows. |
| Prerequisites | Step 6 complete. |
| Exact scope | Verify no uncovered mandatory versioning/conflict requirements, no stale docs, no critical mutants. |
| Explicit non-scope | Migration semantics or additional workflow features. |
| Artifacts to inspect | Workflow specs/vectors/tests, traceability, mutation reports, Agentic docs. |
| Artifacts likely to change | Traceability and docs; remediation only if defects are found. |
| Normative requirements | Closed `WORKFLOW-VERSION-*`, `WORKFLOW-IMPORT-*`, and `WORKFLOW-CONFLICT-*` coverage. |
| Conformance work | `UNCOVERED = 0`, `BLOCKING SPEC GAPS = 0` for Workflow 0.3 slice. |
| Agentic impact | Candidate updates prepared for Step 14. |
| Portable errors | Aligned. |
| TypeScript implementation | Remediation only. |
| Tests | Workflow tests, adapter tests, conformance, mutation. |
| Critical mutation scenarios | Any Step 5-6 critical mutant surviving. |
| Documentation | Finalize Workflow/root/TypeScript README status. |
| External review requirements | Technical review signoff or documented issue. |
| Stop conditions | `BLOCKED BY TRACEABILITY GAP` or `BLOCKED BY CRITICAL MUTANT`. |
| Definition of Done | Workflow versioning slice closed. |
| Expected readiness status | Workflow 0.3 versioning slice closed. |

### Step 8. Entity Import and Revision Specification

| Field | Plan |
| --- | --- |
| Title | Entity Import and Revision Specification |
| Type | SPEC-FIRST |
| Criticality | CAN RUN IN PARALLEL after Step 1 |
| Complexity | HIGH: identity mapping is important but can easily become infrastructure. |
| Objective | Define portable Entity revision refinement and import/migration identity alias semantics. |
| Why it belongs in 0.3 | Corporate adopters often import legacy financial records and need stable identity mapping. |
| Prerequisites | 0.2 Entity revision/evolution semantics closed. |
| Exact scope | Distinguish stable Entity identity, business revision identity, external/source identity, migration mapping evidence, and current/historical revision references. |
| Explicit non-scope | Global identity registry, master data management, persistence, deduplication service, authorization. |
| Artifacts to inspect | `spec/entities/**`, `spec/audit/**`, conformance entity vectors, TypeScript Entity APIs. |
| Artifacts likely to change | New or updated `spec/entities/import.md`, `spec/entities/identity.md`, `spec/entities/evolution.md`, glossary, vector designs, traceability. |
| Normative requirements | Add `ENTITY-IMPORT-*` and refined `ENTITY-REVISION-*` requirements. |
| Conformance work | Design vectors for preserving supplied FinKore identity, recording external/source identity, rejecting missing required mapping fields, preserving historical revision identity, and distinguishing business revision from conflict version. |
| Agentic impact | Candidate structural operations may remain conformance-local until Step 14. |
| Portable errors | Existing identity errors may be enough; add import-specific code only if there is a distinct portable failure category. |
| TypeScript implementation | None. |
| Tests | Spec/conformance validation only if available. |
| Critical mutation scenarios | Generated new identity on import, external ID replaces FinKore ID, revision identity ignored, database version treated as business revision, sensitive source data in error details. |
| Documentation | Entity README, glossary, traceability. |
| External review requirements | Domain/security review for source-system identifiers. |
| Stop conditions | `BLOCKED BY SPEC GAP` if mapping ownership requires a registry. |
| Definition of Done | Entity import/revision semantics are precise and vector-ready. |
| Expected readiness status | READY FOR Entity Import and Revision Implementation. |

### Step 9. Entity Import and Revision Implementation

| Field | Plan |
| --- | --- |
| Title | Entity Import and Revision Implementation |
| Type | IMPLEMENTATION |
| Criticality | CAN RUN IN PARALLEL after Step 8 |
| Complexity | HIGH. |
| Objective | Implement the Entity import/revision semantics selected in Step 8. |
| Why it belongs in 0.3 | It strengthens migration readiness for real corporate systems. |
| Prerequisites | Step 8 complete. |
| Exact scope | Add TypeScript APIs, conformance operations, tests, and docs for import identity mapping and revision observation. |
| Explicit non-scope | Registry, persistence, deduplication, workflow migration. |
| Artifacts to inspect | Entity source/tests, adapter operations, conformance entity vectors, Audit relationship support if mapping evidence uses Audit. |
| Artifacts likely to change | Entity source, tests, adapter, vectors, traceability, README, JSDoc, errors if finalized. |
| Normative requirements | Implement all Step 8 selected requirements. |
| Conformance work | Add vectors with traceability; include negative and mutation-sensitive mapping cases. |
| Agentic impact | Defer promotion to Step 14. |
| Portable errors | Implement finalized codes only. |
| TypeScript implementation | Keep APIs small and domain-oriented; avoid generic registry abstractions. |
| Tests | Unit, adapter, conformance, build, typecheck, coverage, mutation for critical identity behavior. |
| Critical mutation scenarios | Identity generated, mapping dropped, source identity leaked in error, revision overwritten, input mutated. |
| Documentation | JSDoc, Entity README, root status, traceability. |
| External review requirements | Security/domain review if source identity metadata contains sensitive values. |
| Stop conditions | `BLOCKED BY SPEC GAP` if code would need registry semantics. |
| Definition of Done | Entity import/revision slice passes verification and docs are synchronized. |
| Expected readiness status | Entity import/revision 0.3 slice closed. |

### Step 10. Money Precision, Minor Unit, and Currency Namespace Research

| Field | Plan |
| --- | --- |
| Title | Money Precision, Minor Unit, and Currency Namespace Research |
| Type | RESEARCH |
| Criticality | CAN RUN IN PARALLEL |
| Complexity | HIGH: decisions affect cross-language compatibility and future public API stability. |
| Objective | Decide whether Draft 0.3 should specify minimum precision/scale, overflow behavior, minor-unit metadata, or private currency namespace syntax. |
| Why it belongs in 0.3 | These are v0.5-readiness risks for language-independent Money behavior. |
| Prerequisites | 0.2 Money rate/allocation closed. |
| Exact scope | Compare TypeScript, Java, Go, and .NET decimal capabilities; define options: unbounded spec, minimum capability declaration, hard portable limits, optional metadata package, or deferral. |
| Explicit non-scope | Implementing metadata data source, FX, crypto registry, tax logic, interest. |
| Artifacts to inspect | `spec/money/**`, `conformance/money/**`, TypeScript Money internals/tests, 0.2 Money docs. |
| Artifacts likely to change | Research notes in this plan or a new docs task/research doc; specs only if a narrow decision is approved. |
| Normative requirements | None unless research recommends a spec milestone. |
| Conformance work | Identify future vectors for overflow, unsupported precision, minor-unit recommendation non-equivalence, and private currency preservation if included. |
| Agentic impact | Capability declarations may be needed if supported precision varies. |
| Portable errors | Determine whether existing invalid amount/rounding codes cover overflow or whether `FINKORE_MONEY_LIMIT_EXCEEDED` is justified. |
| TypeScript implementation | None in research. |
| Tests | None. |
| Critical mutation scenarios | Calculation scale confused with minor unit, overflow silently truncates, private currency collides with ISO code, metadata treated as exchange rate. |
| Documentation | Record decision and deferred items. |
| External review requirements | Technical review; domain/accounting review for minor-unit guidance. |
| Stop conditions | `BLOCKED BY RESEARCH` if cross-language behavior cannot be characterized. |
| Definition of Done | Clear decision: IN 0.3 spec follow-up, DEFER 0.4+, or REJECT, with rationale. |
| Expected readiness status | Money portability decision ready for 0.3 closure or future backlog. |

### Step 11. Portable Condition Model Research

| Field | Plan |
| --- | --- |
| Title | Portable Condition Model Research |
| Type | RESEARCH |
| Criticality | CAN RUN IN PARALLEL |
| Complexity | VERY HIGH: expression models have security and portability traps. |
| Objective | Decide whether 0.3 should adopt, adapt, build, or defer a portable condition model. |
| Why it belongs in 0.3 | Advanced approvals need richer deterministic predicates, but Core must avoid becoming a rules engine. |
| Prerequisites | 0.2 Approval current-effectiveness closed. |
| Exact scope | Evaluate CEL, JSON Logic, DMN FEEL subsets, and a minimal FinKore model. Assess deterministic fact access, missing vs null, Money comparison, logical composition, versioning, and safe evaluation. |
| Explicit non-scope | Implementing eval, JavaScript expressions, callbacks, SQL fragments, full CEL/FEEL engines, arbitrary code execution. |
| Artifacts to inspect | `spec/approvals/conditions.md`, conformance approval vectors, TypeScript condition API, Agentic safety docs. |
| Artifacts likely to change | Research doc or this plan; no implementation unless Step 13 is approved. |
| Normative requirements | None in research. |
| Conformance work | Identify candidate vectors for equals, comparisons, exists, in, AND/OR/NOT if accepted, missing fact, null fact, object/array shape changes, Money currency mismatch. |
| Agentic impact | Condition descriptors may be structural and non-executable or part of Approval operation input. |
| Portable errors | Existing `FINKORE_APPROVAL_CONDITION_UNRESOLVED` may cover missing facts; invalid condition syntax may need a distinct category. |
| TypeScript implementation | None. |
| Tests | None. |
| Critical mutation scenarios | Missing treated as false, null treated as missing, JS truthiness used, unsafe cross-currency Money comparison, object key order treated as meaningful, arbitrary expression executed. |
| Documentation | Record ADOPT, ADAPT SUBSET, BUILD MINIMAL FINKORE MODEL, or DEFER decision. |
| External review requirements | Security review required before any normative model. Domain review for amount threshold semantics. |
| Stop conditions | `BLOCKED BY SECURITY RISK` if no safe deterministic subset can be defined. |
| Definition of Done | A documented standard/subset/defer decision exists. |
| Expected readiness status | READY FOR Minimal Condition Model only if research passes. |

### Step 12. Audit Provenance Research

| Field | Plan |
| --- | --- |
| Title | Audit Provenance Research |
| Type | RESEARCH |
| Criticality | CAN RUN IN PARALLEL |
| Complexity | MEDIUM. |
| Objective | Decide whether 0.3 should add Audit provenance metadata such as reason, source system, correlation identity, or causation identity. |
| Why it belongs in 0.3 | Import, approval composition, and workflow versioning may benefit from richer audit context. |
| Prerequisites | 0.2 Audit relationship metadata closed. |
| Exact scope | Evaluate portable source/correlation/reason semantics and redaction interaction. |
| Explicit non-scope | Distributed tracing standard, event-sourcing framework, retention engine, cryptographic ledger, global causal ordering. |
| Artifacts to inspect | `spec/audit/**`, `agentic/effects.md`, Audit TypeScript API/tests, 0.2 relationship docs. |
| Artifacts likely to change | Research doc; Audit spec only if a narrow semantics is approved. |
| Normative requirements | None unless follow-up spec milestone is approved. |
| Conformance work | Identify possible vectors for preserving source identity, safe reason metadata, redaction behavior, and relationship coexistence. |
| Agentic impact | Audit append descriptor may need provenance input notes. |
| Portable errors | Existing `FINKORE_AUDIT_INVALID_EVENT` likely sufficient for malformed provenance. |
| TypeScript implementation | None. |
| Tests | None. |
| Critical mutation scenarios | Provenance lost, sensitive source fields exposed in errors, redaction removes required evidence, correlation identity treated as ordering guarantee. |
| Documentation | Record decision and security considerations. |
| External review requirements | Security/privacy review. |
| Stop conditions | `BLOCKED BY SECURITY RISK` if provenance cannot be represented safely. |
| Definition of Done | Decision documented: include narrow spec, defer, or reject. |
| Expected readiness status | Audit provenance decision ready. |

### Step 13. Minimal Condition Model Specification and Implementation

| Field | Plan |
| --- | --- |
| Title | Minimal Condition Model Specification and Implementation |
| Type | IMPLEMENTATION |
| Criticality | CAN RUN IN PARALLEL after Step 11; skip if research defers |
| Complexity | HIGH. |
| Objective | Add a small deterministic condition model only if Step 11 approves one. |
| Why it belongs in 0.3 | It enables portable approval thresholds while avoiding arbitrary rules. |
| Prerequisites | Step 11 decision is ADAPT SUBSET or BUILD MINIMAL FINKORE MODEL. |
| Exact scope | Implement approved predicates only, likely equals/not-equals, exists, and carefully selected numeric/Money comparisons; add logical composition only if explicitly approved. |
| Explicit non-scope | General rules engine, callbacks, arbitrary expressions, unbounded recursion, external fact lookup. |
| Artifacts to inspect | Approval condition specs/source/tests, Money comparison specs, conformance approvals. |
| Artifacts likely to change | `spec/approvals/conditions.md`, possible new condition spec, approval source/tests, adapter, vectors, traceability, JSDoc, READMEs. |
| Normative requirements | Add `APPROVAL-CONDITION-MODEL-*` requirements. |
| Conformance work | Positive, negative, boundary, invariant, regression, and mutation-sensitive vectors for approved predicates. |
| Agentic impact | Likely structural/non-executable metadata; review in Step 14. |
| Portable errors | Finalize invalid condition vs unresolved condition categories. |
| TypeScript implementation | Deterministic interpreter for approved portable model only; no `eval` or callbacks. |
| Tests | Unit, adapter, conformance, typecheck, build, coverage, mutation for predicate boundaries. |
| Critical mutation scenarios | Missing/null confusion, comparison operator inversion, cross-currency comparison succeeds, AND/OR inversion, NOT ignored, object order sensitivity, unsafe expression execution. |
| Documentation | Specs, README, JSDoc, traceability, security notes. |
| External review requirements | Security review before completion. |
| Stop conditions | `BLOCKED BY SECURITY RISK` or `BLOCKED BY SPEC GAP`. |
| Definition of Done | Approved condition subset is implemented and closed with no critical mutants. |
| Expected readiness status | Condition model 0.3 slice closed, or skipped by research decision. |

### Step 14. Agentic 0.3 Review

| Field | Plan |
| --- | --- |
| Title | Agentic 0.3 Review |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM. |
| Objective | Classify each 0.3 capability as canonical Agentic, conformance-local, or structural/non-executable. |
| Why it belongs in 0.3 | State-changing Approval and Workflow operations need accurate machine-discoverable effects before v0.5. |
| Prerequisites | Implemented 0.3 slices complete or explicitly skipped. |
| Exact scope | Review operation names, inputs, outputs, errors, determinism, state mutation, financial-state mutation, audit production, approval sensitivity, and idempotency notes. |
| Explicit non-scope | MCP adapter, OpenAI integration, authorization policy, blanket human approval rule. |
| Artifacts to inspect | `agentic/**`, conformance operation IDs, adapter operations, specs, traceability. |
| Artifacts likely to change | `agentic/operations.md`, `agentic/effects.md`, `agentic/errors.md`, `agentic/capabilities.md`, `agentic/safety.md`, examples. |
| Normative requirements | Agentic docs must not override `/spec`. |
| Conformance work | Ensure promoted operations correspond to conformance-backed behavior or document conformance-local status. |
| Agentic impact | Decide canonical vs conformance-local vs structural for approval composition, workflow versioning/conflict, entity import, and condition model. |
| Portable errors | Descriptor error lists aligned with domain specs. |
| TypeScript implementation | No core logic. |
| Tests | Link/reference checks if available; conformance if operation labels change. |
| Critical mutation scenarios | Not direct mutation; review metadata defects such as state-changing marked pure or audit-producing omitted. |
| Documentation | Root and Agentic README status updated. |
| External review requirements | Security review for state-changing agent-facing operations. |
| Stop conditions | `BLOCKED BY SPEC GAP` if operation effects are not stable. |
| Definition of Done | Agentic registry accurately reflects 0.3 closed capabilities. |
| Expected readiness status | Agentic 0.3 aligned. |

### Step 15. Optional Cross-Language Proof

| Field | Plan |
| --- | --- |
| Title | Optional Cross-Language Proof |
| Type | IMPLEMENTATION |
| Criticality | OPTIONAL |
| Complexity | MEDIUM: small slice only. |
| Objective | Validate that a mature FinKore slice can be implemented outside TypeScript using the same spec and conformance expectations. |
| Why it belongs in 0.3 | It reduces v0.5 portability risk without turning Draft 0.3 into a multi-language release. |
| Prerequisites | Step 14 complete; select Money or Workflow as the proof slice. |
| Exact scope | Implement a tiny Java or Go proof for Money or Workflow only, enough to run representative vectors or document conformance mapping. |
| Explicit non-scope | Full Java/Go/.NET ports, package publishing, all domains, production support. |
| Artifacts to inspect | Chosen domain spec/vectors, runner adapter contract, existing TypeScript behavior. |
| Artifacts likely to change | Optional `implementations/java` or `implementations/go` proof directory only if approved; docs noting proof status. |
| Normative requirements | None added. |
| Conformance work | Run or document representative conformance against selected vectors. |
| Agentic impact | None unless proof exposes descriptor portability issue. |
| Portable errors | Verify codes are not TypeScript-specific. |
| TypeScript implementation | None. |
| Tests | Language-native unit tests plus selected conformance if practical. |
| Critical mutation scenarios | Same as selected slice. |
| Documentation | Mark as optional proof, not official full port. |
| External review requirements | Technical review. |
| Stop conditions | `BLOCKED BY TOOLCHAIN` if language toolchain is unavailable and user does not approve setup. |
| Definition of Done | Proof either validates portability or records concrete spec issues. |
| Expected readiness status | Optional portability evidence collected. |

### Step 16. Draft 0.3 Closure

| Field | Plan |
| --- | --- |
| Title | Draft 0.3 Closure |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: broad verification and status synchronization. |
| Objective | Close FinKore Core Draft 0.3 only when selected requirements, conformance, implementation, mutation testing, Agentic registry, docs, and deferred backlog are aligned. |
| Why it belongs in 0.3 | Closure prevents partial implementation from masquerading as a draft release. |
| Prerequisites | All selected 0.3 milestones complete; skipped research paths are documented. |
| Exact scope | Full traceability audit, full TypeScript regression run, conformance, mutation review, portable error inventory, Agentic review, README/status update, CoreDoc update if present. |
| Explicit non-scope | Draft 0.4 implementation, v0.5 release packaging, production claims. |
| Artifacts to inspect | Entire repo areas listed in AGENTS completion rule. |
| Artifacts likely to change | `README.md`, `spec/README.md`, `conformance/traceability.md`, `conformance/manifest.json`, `agentic/README.md`, implementation READMEs, this plan if final scope differed. |
| Normative requirements | All selected 0.3 requirements stable and traceable. |
| Conformance work | `UNCOVERED = 0`, `BLOCKING SPEC GAPS = 0` for 0.3 closed scope; Draft 0.1 and 0.2 regressions green. |
| Agentic impact | Registry and capability docs match actual supported operations. |
| Portable errors | Error catalog aligned across specs, implementation, adapter normalization, tests, JSDoc, and Agentic docs. |
| TypeScript implementation | Remediation only if closure finds defects. |
| Tests | Run build, typecheck, unit tests, coverage, conformance, and mutation for affected packages. |
| Critical mutation scenarios | All critical mutants from approval composition, workflow versioning, entity import, and optional condition model must be killed or justified as equivalent. |
| Documentation | Sync root README, TypeScript README, spec indexes, traceability, Agentic docs, CoreDoc assumptions, and deferred backlog. |
| External review requirements | Confirm required domain/security/technical reviews are completed or documented as blockers. |
| Stop conditions | `BLOCKED BY SPEC GAP`, `BLOCKED BY TRACEABILITY GAP`, `BLOCKED BY CRITICAL MUTANT`, or `BLOCKED BY REVIEW`. |
| Definition of Done | `FINKORE CORE DRAFT 0.3 COMPLETE` is justified by green checks, clean traceability, aligned docs, and explicit 0.4+ backlog. |
| Expected readiness status | FINKORE CORE DRAFT 0.3 COMPLETE. |

## 9. Cross-Domain Risks

- Approval composition must reuse Draft 0.2 current-effectiveness and must not invent a second validity model.
- Workflow version binding may interact with Entity lifecycle, but Workflow core should not import Entity.
- Entity import identities may require Audit provenance; avoid requiring Entity to own Audit storage.
- Conditions may compare Money facts; they must use Money semantics and reject incompatible currencies rather than doing ad hoc comparison.
- Agentic descriptors for state-changing operations must expose effects without creating AI-specific bypasses or approval rules.
- Expected-state/revision conflict is a domain precondition, not a database locking model.
- Nested approval groups can drift into arbitrary workflow graphs; depth and shape should be bounded.

## 10. Cross-Language Risks

- Decimal precision and overflow cannot assume TypeScript `BigInt` or a specific decimal package.
- JSON object member order must remain meaningless.
- Missing, null, false, zero, and empty string facts must be distinguished in condition semantics.
- Time-sensitive approval expiration must use injected RFC 3339 instants, not wall-clock time.
- Recursive group evaluation must define deterministic traversal and cycle rejection portably.
- Exceptions vs result objects must remain implementation detail; portable errors are the contract.
- Entity import IDs must be opaque strings, not parsed source-system formats.
- Version identifiers must not rely on numeric width, monotonic database counters, or object identity.

## 11. Security / Domain Review Touchpoints

Domain/accounting review required:

- Approval quorum, rejection, abstention if considered, and duplicate counting.
- Ordered approval stages and bounded nested groups.
- Entity import/revision terminology.
- Tax primitive research if any tax-like behavior is reconsidered.
- Currency minor-unit guidance.

Security/technical review required:

- Portable condition model and any adopted standard subset.
- Delegation research before it can leave research status.
- Audit provenance fields and redaction interaction.
- Agentic exposure of state-changing Approval/Workflow operations.
- Source-system identifiers and legacy import metadata.
- Error diagnostics for conditions, approvals, and imports.

## 12. Optional Cross-Language Proof Plan

Classification: OPTIONAL but recommended before public v0.5 if Draft 0.3 closes on schedule.

Recommended proof slice:

1. Money if 0.2 allocation/rate behavior is mature and precision questions remain unresolved.
2. Workflow if 0.3 version binding becomes a central portability risk.

Use Java or Go, not both. The proof should implement only a tiny conformance-backed slice and record whether the spec was sufficiently language-independent. It must not become a full language port or delay 0.3 closure unless it reveals a blocking spec issue.

## 13. CoreDoc Impact

Include in CoreDoc:

- Draft 0.3 scope and non-goals.
- Approval composition and quorum semantics.
- Workflow definition versioning and expected-state/revision conflict semantics.
- Condition model decision and security rationale.
- Entity import/revision identity semantics.
- Money portability decisions or explicit deferrals.
- Agentic governance for state-changing operations.

Keep as implementation detail:

- TypeScript class names and helper functions.
- Adapter fixture parsing.
- Internal decimal representation.
- Language proof scaffolding.

## 14. Draft 0.3 Closure Criteria

`FINKORE CORE DRAFT 0.3 COMPLETE` requires:

- Draft 0.2 baseline was verified as closed or this plan was explicitly revised around actual state.
- All selected 0.3 requirements are stable in `/spec`.
- Every directly testable mandatory 0.3 requirement has conformance coverage.
- `UNCOVERED = 0` and `BLOCKING SPEC GAPS = 0` for closed 0.3 scope.
- Full TypeScript conformance is green.
- Draft 0.1 and 0.2 regression tests and conformance vectors remain green.
- Critical surviving mutants are zero for new Approval, Workflow, Entity, and condition behavior.
- Portable errors are aligned across spec, conformance, TypeScript, adapter normalization, JSDoc, and Agentic docs.
- Agentic registry is aligned and does not over-promote unstable or structural concepts.
- Public TypeScript APIs have meaningful JSDoc with requirement IDs.
- Cross-language assumptions are reviewed and unresolved risks are explicitly deferred.
- README/status documentation is synchronized.
- CoreDoc assumptions are updated where relevant.
- Required domain/security/technical reviews are complete or recorded as blockers.

## 15. Draft 0.4+ Backlog

Priority order toward eventual FinKore v0.5:

1. Workflow migration semantics, after 0.3 version binding is stable.
2. Delegation, after security review proves it can be modeled without IAM/RBAC.
3. Approval escalation, after delegation and time/context semantics are clear.
4. Full condition standard adoption or broader predicate model, only after the minimal 0.3 decision is proven safe.
5. Cross-entity identity registry, only if import/migration work demonstrates Core need.
6. Audit retention and stronger provenance/security policy, with legal/security review.
7. Tax primitives beyond generic rates, only if accountant-reviewed jurisdiction-neutral semantics emerge.
8. Interest/accrual/day-count primitives, because calendars and compounding require separate careful design.
9. Private/non-ISO currency namespace implementation, if 0.3 research does not close it.
10. Recommended minor-unit metadata package or integration, if 0.3 research chooses a data strategy.
11. Ledger, journal entries, reconciliation, fiscal periods, purchase orders, invoice matching, payments, and settlement as separate future domain tracks.
12. Full Java, Go, and .NET ports after the v0.5 core behavior is stable enough to justify maintenance.

## 16. First Milestone to Execute

NEXT CODEX MILESTONE: Draft 0.2 Closure Verification and 0.3 Scope Refresh
