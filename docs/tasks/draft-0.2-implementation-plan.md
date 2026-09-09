# FinKore Draft 0.2 Implementation Plan

## 1. Executive Summary

Draft 0.2 should make FinKore materially more useful for corporate financial software without turning Core into an accounting system, rules engine, persistence layer, or workflow product. The recommended scope is a conservative expansion of the existing Draft 0.1 domains:

- Money allocation and exact rate/percentage application.
- Entity evolution primitives for correction, reversal, void, and supersession distinctions.
- Audit relationship metadata needed to record those evolution relationships without making Audit an event-sourcing framework.
- Approval validity lifecycle basics: withdrawal, expiration, supersession, and explicit current-effectiveness semantics.
- Agentic and conformance promotion review for mature operations, especially Entity operations that are still conformance-local in Draft 0.1.

Draft 0.2 should not add a new domain unless spec research proves that Entity evolution cannot be expressed as an extension of Entities, Audit, and Approvals. The initial implementation path should be spec-first and milestone-sized. Every closed slice must preserve the existing architecture: `/spec` is normative, `/conformance` proves behavior, `/agentic` describes discoverable operations, `/runner` remains domain-neutral, and TypeScript remains the reference implementation rather than the source of truth.

## 2. Current 0.1 Baseline

Repository audit snapshot:

| Area | Current state |
| --- | --- |
| Root README | Says Money, Workflow, Audit, Approvals, and Entities are complete for Draft 0.1 in TypeScript. It explicitly defers rich conditions, quorum, delegation, withdrawal, supersession, expiration, escalation, parallel approval graphs, dynamic approver resolution, authorization/RBAC, generic validation rule engines, Entity/Audit integration, and other domains. |
| `/spec` | Contains Draft 0.1 normative domains for Money, Workflow, Audit, Approvals, and Entities, plus shared conventions and glossary. Deferred topics are recorded directly in domain files. |
| `/conformance` | Manifest version is `0.1`; 138 vectors are listed. Traceability reports 213 requirements, 149 covered, 64 not directly testable, 0 uncovered, 0 deferred, and 0 blocking spec gaps. |
| `/agentic` | Canonical Draft 0.1 operations include Money operations, `finkore.workflow.transition`, and Audit append/remove/replace. Entity and Approval chain operations remain conformance-local. Irreversibility and idempotency are explicitly not defined. |
| `/runner` | Domain-neutral TypeScript runner with build, typecheck, unit, coverage, and mutation scripts. It must not gain financial logic in 0.2. |
| `/implementations/typescript/core` | Public APIs exist for Money, Workflow, Audit, Approvals, and Entities. README explicitly excludes FX, persistence, workflow versioning, concurrency, audit persistence, quorum, delegation, withdrawal, supersession, expiration, escalation, generic validation engines, corrections, and reversals. |
| `/implementations/typescript/adapters/conformance` | Adapter translates conformance fixture shapes into core APIs. Its README excludes advanced approval behavior, workflow versioning, generic entity validation, and agent integrations. |

Current portable error inventory:

| Domain | Codes |
| --- | --- |
| Money | `FINKORE_MONEY_INVALID_AMOUNT`, `FINKORE_MONEY_INVALID_CURRENCY`, `FINKORE_MONEY_CURRENCY_MISMATCH`, `FINKORE_MONEY_DIVISION_BY_ZERO`, `FINKORE_MONEY_ROUNDING_REQUIRED`, `FINKORE_MONEY_INVALID_ROUNDING` |
| Workflow | `FINKORE_WORKFLOW_INVALID_DEFINITION`, `FINKORE_WORKFLOW_INVALID_STATE`, `FINKORE_WORKFLOW_INVALID_TRANSITION`, `FINKORE_WORKFLOW_GUARD_REJECTED`, `FINKORE_WORKFLOW_TERMINAL_STATE` |
| Audit | `FINKORE_AUDIT_INVALID_EVENT`, `FINKORE_AUDIT_DUPLICATE_EVENT`, `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`, `FINKORE_AUDIT_REDACTION_INVALID`, `FINKORE_AUDIT_ACTOR_INVALID` |
| Approval | `FINKORE_APPROVAL_REQUIRED`, `FINKORE_APPROVAL_INVALID_DECISION`, `FINKORE_APPROVAL_INELIGIBLE_ACTOR`, `FINKORE_APPROVAL_INVALID_CHAIN`, `FINKORE_APPROVAL_CONDITION_UNRESOLVED` |
| Entity | `FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_IMMUTABLE`, `FINKORE_ENTITY_INVALID_MUTATION`, `FINKORE_ENTITY_STATE_CONFLICT`, `FINKORE_ENTITY_VALIDATION_FAILED` |

Important Draft 0.1 deferred topics:

- Money: allocation, taxation, interest, exchange conversion, precision/scale/overflow policy, non-ISO/private currency namespaces, and recommended minor-unit behavior.
- Workflow: definition versions, migrations, import semantics, transition identifiers, and concurrency/conflict behavior.
- Audit: causal relationships, distributed ordering, retention, correction, reversal, void, cancellation, supersession, and adjustment semantics.
- Approvals: condition syntax, subject-state interchange, relevant-fact policy, withdrawal, supersession, delegation, expiration, escalation, definition migration, quorum, any-of, and complex graphs.
- Entities: concrete fields, lifecycle policy, validation catalog, import/migration mapping, identity registry, Audit integration, concurrency, correction, and reversal behavior.

## 3. Candidate Capability Assessment

| Capability | Domain | Decision | Reason | Dependencies | Complexity |
| --- | --- | --- | --- | --- | --- |
| Money allocation/splitting | Money | IN 0.2 | Common AP, expense, invoice, tax, and procurement primitive; can be specified portably with exact totals and explicit remainder policy. | Existing Money arithmetic and rounding semantics. | HIGH |
| Money percentage/rate application | Money | IN 0.2 | Foundational for tax-like, discount-like, fee-like, and threshold calculations without jurisdiction policy. | Exact decimal scalar multiplication, explicit rounding. | MEDIUM |
| Tax-specific primitives | Money or future tax domain | RESEARCH FIRST | Useful, but easy to smuggle jurisdiction, inclusive/exclusive, recoverability, and filing policy into Core. | Rate primitives; accountant review. | HIGH |
| Interest primitives | Money or future finance domain | DEFER 0.3+ | Requires day-count conventions, compounding, accrual periods, and policy choices beyond Draft 0.2. | Rate primitives and period semantics. | VERY HIGH |
| Precision limits | Money | RESEARCH FIRST | Needed for cross-language portability, but premature hard limits may exclude valid implementations. | Java/Go/.NET portability review. | HIGH |
| Recommended currency minor-unit behavior | Money | RESEARCH FIRST | Useful guidance, but must avoid implicit calculation scale and stale ISO metadata assumptions. | Rounding policy; external data policy decision. | MEDIUM |
| Non-ISO/private currency namespace | Money | DEFER 0.3+ | Important but already intentionally limited; requires naming, collision, and compatibility model. | Currency identifier envelope research. | HIGH |
| Entity correction | Entities | IN 0.2 | Central corporate financial primitive for finalized facts; must distinguish from mutation and replacement. | Entity identity, mutability, Audit relationships. | HIGH |
| Entity reversal | Entities | IN 0.2 | Common for financial records where original facts must remain preserved. | Correction definitions, Audit links. | HIGH |
| Entity void | Entities | IN 0.2 | Useful lifecycle status when an issued record is nullified without rewriting original facts. | Entity lifecycle semantics, Audit links. | MEDIUM |
| Entity supersession | Entities | IN 0.2 | Needed for replacement chains and approval invalidation without changing stable identity meaning. | Correction/reversal distinctions, Audit links. | HIGH |
| Revision/version identity | Entities | IN 0.2 | Needed to talk about approval binding and supersession without replacing stable entity identity. | Entity identity semantics. | HIGH |
| Replacement/amendment | Entities | RESEARCH FIRST | Terms are overloaded; include only if distinctions become normative and portable. | Correction/supersession terminology milestone. | MEDIUM |
| Entity/Audit integration | Entities + Audit | IN 0.2 | Draft 0.1 has conditional audit obligations but no standalone integration surface. Relationships are needed for correction/reversal/supersession. | Audit relationship metadata. | HIGH |
| Audit relationship links | Audit | IN 0.2 | Enables `corrects`, `reverses`, `voids`, and `supersedes` evidence without distributed event-sourcing claims. | Entity evolution semantics. | MEDIUM |
| Audit retention semantics | Audit | DEFER 0.3+ | Legal/security requirements vary widely; portable minimum is not yet obvious. | Security/legal review. | VERY HIGH |
| Approval withdrawal | Approvals | IN 0.2 | Corporate approval workflows commonly need a prior decision to no longer count without deleting it. | Decision history and current-effectiveness semantics. | MEDIUM |
| Approval expiration | Approvals | IN 0.2 | Approval validity may depend on an explicit instant; can be portable if time context is injected. | RFC 3339 timestamps, injected evaluation context. | MEDIUM |
| Approval supersession | Approvals | IN 0.2 | Pairs with Entity supersession and changed subject facts; preserves history while replacing effectiveness. | Entity revision/supersession semantics. | HIGH |
| Approval delegation | Approvals | DEFER 0.3+ | Requires actor authority, directory, time windows, and authorization boundaries. | Authorization model research. | HIGH |
| Approval quorum/N-of-M | Approvals | DEFER 0.3+ | Valuable but more complex than current all-required chain semantics; can wait until lifecycle validity is stable. | Chain identity and advanced combination semantics. | HIGH |
| Parallel approval groups | Approvals | DEFER 0.3+ | Likely follows quorum/graph semantics; not needed for the first validity upgrade. | Quorum and dependency graph design. | HIGH |
| Approval escalation | Approvals | DEFER 0.3+ | Notifications and timing policy drift toward workflow product behavior. | Delegation/time policy. | HIGH |
| Rich condition expressions | Approvals | RESEARCH FIRST | Useful but risks creating a general policy/rules engine. | Expression portability and security review. | VERY HIGH |
| Workflow definition versioning | Workflow | RESEARCH FIRST | Important, but must separate portable domain semantics from storage/concurrency mechanics. | Entity revisions and approval supersession review. | HIGH |
| Workflow migration semantics | Workflow | DEFER 0.3+ | Derived from definition versioning and potentially concurrency-heavy. | Versioning semantics. | VERY HIGH |
| Workflow concurrency/conflict | Workflow | DEFER 0.3+ | Distributed systems complexity; likely belongs to persistence/composition unless tightly scoped. | State conflict model research. | VERY HIGH |
| Agentic Entity operation promotion | Agentic | IN 0.2 | Entity operations are already conformance-local and mature enough for review after 0.1 closure. | Stable Entity 0.2 operation semantics. | MEDIUM |
| Agentic Approval operation promotion | Agentic | RESEARCH FIRST | Some labels may remain fixture vocabulary until binding and lifecycle semantics are clearer. | Approval validity milestones. | MEDIUM |

## 4. Recommended Draft 0.2 Scope

Recommended Draft 0.2 feature list:

1. Money allocation/splitting with exact total preservation, deterministic remainder distribution, explicit currency compatibility, and explicit rounding where precision reduction is required.
2. Money rate/percentage application as exact decimal scalar semantics plus explicit result rounding policy, without tax jurisdiction or interest convention behavior.
3. Entity evolution terminology and semantics for correction, reversal, void, and supersession, including their distinctions from mutation, replacement, and amendment.
4. Entity revision/evolution identity model that preserves stable Entity identity and defines separate revision or relation identifiers where needed.
5. Audit relationship links for correction, reversal, void, supersession, and related-event evidence, without rewriting committed history.
6. Minimal Entity/Audit integration contract for evolution operations that require audit evidence.
7. Approval withdrawal, expiration, and supersession as current-effectiveness semantics over append-only decision history.
8. Approval invalidation when relevant subject facts, subject revisions, or supersession relationships make a decision no longer effective.
9. Agentic review and promotion of mature Entity operations, with careful review of Approval operations after lifecycle semantics are specified.
10. Draft 0.2 conformance manifest, traceability, README status, TypeScript JSDoc, and mutation-sensitive test updates for each closed slice.

## 5. Explicit Draft 0.2 Non-Goals

Draft 0.2 must not include:

- Full ledger, journal-entry, debit/credit, reconciliation, or fiscal-period engine.
- Jurisdiction-specific tax calculation or filing behavior.
- Interest accrual, compounding, day-count conventions, or amortization.
- FX market data, exchange-rate providers, or implicit currency conversion.
- Payment processing, banking integrations, card networks, or settlement rails.
- UI, inboxes, notifications, reminders, or workflow task routing.
- ORM, database, persistence, indexing, or storage isolation layer.
- Authorization/RBAC, authentication, organization directory, or identity provider integration.
- Distributed consensus, global audit ordering, event-store implementation, or cryptographic audit ledger.
- Full BPMN, general workflow engine, or general policy/rules expression language.
- Multi-language port implementation as mandatory 0.2 work.

## 6. Dependency Graph

```text
Step 1: Draft 0.2 Baseline Audit and Scope Lock
  -> Step 2: Money Rate Semantics
  -> Step 3: Money Allocation Semantics
  -> Step 4: Entity Evolution Terminology

Step 2 -> Step 3

Step 4 -> Step 5: Audit Relationship Semantics
Step 4 -> Step 6: Entity Evolution Implementation
Step 5 -> Step 6

Step 4 -> Step 7: Approval Validity Lifecycle Semantics
Step 7 -> Step 8: Approval Validity Implementation

Step 6 -> Step 9: Agentic Operation Review
Step 8 -> Step 9

Steps 3, 6, 8, 9 -> Step 10: Draft 0.2 Closure

Optional portability checkpoint may run after Steps 3, 6, or 8.
```

Critical path: Steps 1, 4, 5, 6, 7, 8, 9, 10.

Can run in parallel after Step 1: Step 2 and Step 4, if different agents keep requirement IDs and traceability coordinated.

Optional: Java or Go proof-of-portability for Money allocation and Entity evolution fixtures after the corresponding TypeScript implementation passes conformance.

## 7. Detailed Execution Plan

### Step 1. Draft 0.2 Baseline Audit and Scope Lock

| Field | Plan |
| --- | --- |
| Title | Draft 0.2 Baseline Audit and Scope Lock |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM: broad audit, limited editing. |
| Objective | Refresh the current repository audit and convert this plan into a locked Draft 0.2 scope issue/task set before any feature implementation. |
| Prerequisites | Draft 0.1 closure remains true: conformance traceability has `UNCOVERED = 0` and `BLOCKING SPEC GAPS = 0`. |
| Scope | Re-read README, AGENTS, spec, conformance, agentic, runner, TypeScript core, adapter, TODO/deferred sections, package scripts, and current generated reports if relevant. Confirm or amend this plan before implementation. |
| Non-scope | No Draft 0.2 feature semantics, code, vectors, or public APIs. |
| Artifacts to inspect | `README.md`, `AGENTS.md`, `spec/**`, `conformance/**`, `agentic/**`, `runner/**`, `implementations/typescript/**`. |
| Artifacts likely to change | `docs/tasks/draft-0.2-implementation-plan.md` only, if audit findings require corrections. |
| Normative requirements | None added. |
| Conformance work | Confirm current manifest and traceability status. |
| Agentic impact | Confirm current canonical operations and conformance-local operations. |
| Portable error impact | Confirm current inventory. |
| TypeScript implementation | None. |
| Tests | Run `node --version`; then run `npm run typecheck --workspaces` and `npm run test --workspaces` if dependencies are present. If not, follow AGENTS Node toolchain instructions. |
| Critical mutation scenarios | None; this is planning. |
| Documentation | Update this plan if repository reality differs. |
| Stop conditions | `BLOCKED BY SPEC GAP` if Draft 0.1 is not actually closed or current docs contradict traceability in a way that changes 0.2 scope. |
| Definition of Done | Scope recommendation is reconciled with repository state; no feature implementation occurred. |
| Expected readiness status | READY FOR NEXT 0.2 MILESTONE. |

### Step 2. Money Rate and Percentage Semantics

| Field | Plan |
| --- | --- |
| Title | Money Rate and Percentage Semantics |
| Type | SPEC-FIRST |
| Criticality | CAN RUN IN PARALLEL after Step 1 |
| Complexity | MEDIUM: exact decimals and rounding boundaries are established, but terminology must avoid tax/interest policy. |
| Objective | Define portable rate/percentage application as a fundamental Money primitive. |
| Prerequisites | Step 1 complete; Money arithmetic and rounding Draft 0.1 remain green. |
| Scope | Specify exact decimal rate input encoding, Money-by-rate multiplication, currency preservation, required explicit rounding for precision reduction, and non-mutation. Decide whether operation name is `applyRate`, `applyPercentage`, or a more neutral term. |
| Non-scope | Tax jurisdiction, discounts as business policy, interest accrual, FX conversion, rate lookup, percentage display formatting. |
| Artifacts to inspect | `spec/money/arithmetic.md`, `spec/money/rounding.md`, `spec/money/errors.md`, `conformance/money/arithmetic.json`, `conformance/money/rounding.json`, `agentic/operations.md`, `implementations/typescript/core/src/money/**`. |
| Artifacts likely to change | New or updated `spec/money/rates.md`, `spec/money/README.md`, `spec/conventions.md`, `conformance/money/*.json`, `conformance/manifest.json`, `conformance/traceability.md`, `agentic/operations.md` if promoted. |
| Normative requirements | Add stable `MONEY-RATE-*` requirements for exact rate representation, valid input, currency preservation, rounding-required behavior, and operand non-mutation. |
| Conformance work | Add positive vectors for exact rates, negative vectors for malformed/non-finite rates, boundary vectors for zero/negative/fractional rates, rounding-required vectors, and mutation-sensitive vectors for input non-mutation. |
| Agentic impact | Candidate canonical operation: `finkore.money.applyRate` or equivalent after naming review. |
| Portable error impact | Prefer existing `FINKORE_MONEY_INVALID_AMOUNT`, `FINKORE_MONEY_ROUNDING_REQUIRED`, and `FINKORE_MONEY_INVALID_ROUNDING` if semantically sufficient. Add a new code only if rate validity cannot fit existing Money invalid amount semantics. |
| TypeScript implementation | None in this milestone. |
| Tests | Spec/conformance validation only if available; do not change core yet. |
| Critical mutation scenarios | Rate ignored, rate inverted, implicit rounding chosen, currency changed, negative rate rejected without spec basis, input Money mutated. |
| Documentation | Update Money README/status and traceability notes for planned implementation state. |
| Stop conditions | `BLOCKED BY SPEC GAP` if rate precision, rounding trigger, negative rate allowance, or rate encoding cannot be stated portably. |
| Definition of Done | Normative rate semantics exist with vectors and traceability; implementation remains pending. |
| Expected readiness status | READY FOR Money Rate Implementation. |

### Step 3. Money Allocation Semantics and Implementation

| Field | Plan |
| --- | --- |
| Title | Money Allocation Semantics and Implementation |
| Type | IMPLEMENTATION |
| Criticality | CRITICAL PATH for Money 0.2 |
| Complexity | HIGH: deterministic remainder handling and exact total preservation are mutation-sensitive. |
| Objective | Specify and implement Money allocation/splitting with exact preservation of the source amount. |
| Prerequisites | Step 2 complete if allocation uses rates; otherwise Step 1 plus existing Money Draft 0.1 closure. |
| Scope | Define allocation by equal parts and by positive integer ratios. Preserve total exactly. Define deterministic remainder distribution by declared order when target scale requires indivisible units. Require explicit scale/rounding policy where precision reduction is needed. |
| Non-scope | Tax apportionment policy, accounting postings, item matching, currency conversion, random/proportional fair rounding beyond deterministic rules. |
| Artifacts to inspect | `spec/money/**`, `conformance/money/**`, `implementations/typescript/core/src/money/**`, Money tests, adapter operation dispatch. |
| Artifacts likely to change | `spec/money/allocation.md`, `spec/money/README.md`, `spec/money/errors.md` if needed, conformance money vectors, manifest, traceability, TypeScript Money API/JSDoc/tests, conformance adapter operations, TypeScript README, agentic operations if promoted. |
| Normative requirements | Add `MONEY-ALLOCATION-*` requirements for positive part counts/ratios, compatible currency preservation, sum equality, deterministic ordering, explicit rounding/scale, and non-mutation. |
| Conformance work | Add equal split, ratio split, zero amount, negative amount, indivisible remainder, invalid part count, zero/negative ratio, malformed ratio, large ratio, and failure atomicity vectors. |
| Agentic impact | Candidate canonical operation: `finkore.money.allocate`. Add only if input/output/effects are stable. |
| Portable error impact | Likely new `FINKORE_MONEY_INVALID_ALLOCATION` for invalid counts/ratios; existing rounding and amount errors still apply. |
| TypeScript implementation | Add public API with JSDoc and exact decimal/integer arithmetic. Adapter must only translate fixtures and normalize results. |
| Tests | Unit tests, adapter tests, conformance runner, typecheck, build, coverage. |
| Mutation testing | Run Money-focused mutation first, then package mutation. Critical surviving allocation mutants must be zero. |
| Critical mutation scenarios | Dropped remainder, duplicated remainder, nondeterministic distribution, sum mismatch, ratio order ignored, zero ratio accepted, implicit currency/minor-unit rounding, source Money mutated. |
| Documentation | Update Money spec index, TypeScript README, root README status, conformance traceability, Agentic docs if promoted. |
| Stop conditions | `BLOCKED BY SPEC GAP` if remainder policy, target scale, or ratio validity is ambiguous. |
| Definition of Done | Specification, vectors, implementation, adapter, docs, conformance, and critical mutation checks are green for allocation. |
| Expected readiness status | Money Draft 0.2 slice closed. |

### Step 4. Entity Evolution Terminology and Semantics

| Field | Plan |
| --- | --- |
| Title | Entity Evolution Terminology and Semantics |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: terms are common but not synonyms, and incorrect semantics would infect Audit and Approvals. |
| Objective | Define correction, reversal, void, supersession, replacement, and amendment distinctions for FinKore Core. |
| Prerequisites | Step 1 complete. |
| Scope | Decide which terms are normative in 0.2. Recommended: include correction, reversal, void, and supersession; classify replacement/amendment as composing-domain terms unless a precise portable meaning emerges. Define identity preservation, new related Entity creation when applicable, lifecycle constraints, and original-record non-mutation. |
| Non-scope | Concrete invoice/expense/order models, ledger postings, legal cancellation policy, payment settlement effects, persistence versioning, authorization. |
| Artifacts to inspect | `spec/entities/**`, `spec/audit/**`, `spec/approvals/decisions.md`, `spec/glossary.md`, `conformance/entities/behavior.json`, TypeScript Entity API/tests. |
| Artifacts likely to change | New `spec/entities/evolution.md`, glossary, entity README, conformance planning notes, traceability. |
| Normative requirements | Add `ENTITY-EVOLUTION-*` requirements for term definitions, immutable original facts after finalization, stable identity, relation identity, allowed lifecycle prerequisites, and failure atomicity. |
| Conformance work | Design vector shapes but do not implement until semantics are complete. |
| Agentic impact | No operation promotion yet. |
| Portable error impact | Identify likely codes such as `FINKORE_ENTITY_INVALID_EVOLUTION`, `FINKORE_ENTITY_ALREADY_SUPERSEDED`, or `FINKORE_ENTITY_REVERSAL_INVALID`, but do not add codes until failure categories are stable. |
| TypeScript implementation | None. |
| Tests | None beyond documentation validation. |
| Critical mutation scenarios | Correction mutates original, reversal overwrites original, void treated as delete, supersession changes stable identity, duplicate reversal accepted, terminal lifecycle ignored. |
| Documentation | Update glossary and entity status to describe planned, not implemented, behavior. |
| Stop conditions | `BLOCKED BY SPEC GAP` if the team cannot define portable distinctions among correction, reversal, void, and supersession. |
| Definition of Done | Term distinctions are normative enough for conformance design. |
| Expected readiness status | READY FOR Audit Relationship Semantics and Entity Evolution Implementation. |

### Step 5. Audit Relationship Semantics

| Field | Plan |
| --- | --- |
| Title | Audit Relationship Semantics |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM: relationship metadata is small, but append-only invariants are strict. |
| Objective | Define portable Audit Event relationships needed for Entity evolution evidence. |
| Prerequisites | Step 4 complete. |
| Scope | Specify relationship fields or structures for `corrects`, `reverses`, `voids`, `supersedes`, and generic `related` if justified. Define identity preservation, duplicate relationship handling, unknown target behavior, and non-rewrite guarantees. |
| Non-scope | Event sourcing, global ordering, cryptographic proofs, storage retention, legal discovery, distributed causality. |
| Artifacts to inspect | `spec/audit/events.md`, `spec/audit/append-only.md`, `spec/audit/errors.md`, `agentic/effects.md`, Audit implementation/tests. |
| Artifacts likely to change | `spec/audit/events.md`, possibly new `spec/audit/relationships.md`, conformance audit vectors, traceability, Audit TypeScript API/JSDoc later. |
| Normative requirements | Add `AUDIT-RELATIONSHIP-*` requirements for stable target event identity, relationship type validity, append-only preservation, and safe serialization. |
| Conformance work | Add vector designs for valid relationship, missing target identity, duplicate relationship if forbidden, relationship preserved after append, and redaction preserving relationship evidence. |
| Agentic impact | Update `finkore.audit.append` descriptor if Audit Event input gains relationship semantics. |
| Portable error impact | Existing `FINKORE_AUDIT_INVALID_EVENT` may cover malformed relationships; add a relationship-specific code only if needed. |
| TypeScript implementation | None in spec-first milestone. |
| Tests | None beyond conformance schema planning. |
| Critical mutation scenarios | Relationship omitted, target identity rewritten, relationship order treated as meaning when it should not, redaction hides relationship evidence improperly. |
| Documentation | Update Audit README and Agentic effects if relationship semantics affect audit consequences. |
| Stop conditions | `BLOCKED BY SPEC GAP` if relationship target identity or relationship-type ownership is unclear. |
| Definition of Done | Audit relationship requirements are precise enough for vectors and implementation. |
| Expected readiness status | READY FOR Entity Evolution Implementation. |

### Step 6. Entity Evolution Implementation and Closure

| Field | Plan |
| --- | --- |
| Title | Entity Evolution Implementation and Closure |
| Type | IMPLEMENTATION |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: cross-domain Entity/Audit behavior, stable identity, and failure atomicity all matter. |
| Objective | Implement the selected Entity evolution primitives and close their conformance slice. |
| Prerequisites | Steps 4 and 5 complete. |
| Scope | Add conformance operations and TypeScript APIs for correction, reversal, void, and supersession as specified. Ensure original entities and committed audit events are not rewritten. Produce required audit relationship evidence where the spec makes it mandatory. |
| Non-scope | Ledger entries, storage transactions, authorization, concrete invoice semantics, workflow migration. |
| Artifacts to inspect | `spec/entities/evolution.md`, `spec/audit/relationships.md`, `conformance/entities/behavior.json`, `conformance/audit/history.json`, `implementations/typescript/core/src/entities/**`, `src/audit/**`, adapter operations. |
| Artifacts likely to change | Entity/Audit specs, conformance vectors, manifest, traceability, TypeScript Entity and Audit APIs, adapter operations, tests, JSDoc, READMEs, Agentic docs if operations are promoted. |
| Normative requirements | Finalize `ENTITY-EVOLUTION-*` and `AUDIT-RELATIONSHIP-*` coverage. |
| Conformance work | Add positive, negative, boundary, invariant, and cross-domain vectors for each included operation. |
| Agentic impact | Candidate operations: `finkore.entity.correct`, `finkore.entity.reverse`, `finkore.entity.void`, `finkore.entity.supersede`. Promote only after Step 9 review or mark conformance-local until then. |
| Portable error impact | Add final portable Entity evolution error codes to `spec/conventions.md`, `spec/entities/errors.md`, implementation errors, normalization, and docs. |
| TypeScript implementation | Add small public APIs with meaningful JSDoc and no runner/conformance dependency in core. Adapter remains translation-only. |
| Tests | Unit tests for success, invalid lifecycle, duplicate evolution, original non-mutation, audit evidence, validation failure atomicity; adapter tests; conformance run; build/typecheck/coverage. |
| Mutation testing | Run entity/audit-focused mutation and full critical mutant review. |
| Critical mutation scenarios | Original record mutated, audit relation omitted, reversal changes original identity, void deletes data, superseded entity remains current, duplicate reversal accepted, failed operation partially mutates state. |
| Documentation | Update entity and audit specs, traceability, TypeScript README, root README status, JSDoc, Agentic docs if promoted. |
| Stop conditions | `BLOCKED BY SPEC GAP` if composing-domain responsibility for required audit evidence is still unclear. |
| Definition of Done | Entity evolution slice has green conformance, green unit tests, updated docs, aligned errors, and no critical surviving mutants. |
| Expected readiness status | Entity/Audit Draft 0.2 evolution slice closed. |

### Step 7. Approval Validity Lifecycle Semantics

| Field | Plan |
| --- | --- |
| Title | Approval Validity Lifecycle Semantics |
| Type | SPEC-FIRST |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: validity must compose with subject facts, Entity revisions, and append-only history. |
| Objective | Define withdrawal, expiration, and supersession as Approval current-effectiveness semantics without deleting historical decisions. |
| Prerequisites | Step 4 complete; Step 5 recommended for audit evidence alignment. |
| Scope | Specify decision withdrawal, explicit expiration instants, superseded decision/requirement relationships, injected evaluation time, subject revision/fact effectiveness, and history preservation. |
| Non-scope | Delegation, quorum, parallel graphs, escalation, notifications, RBAC, dynamic approver resolution, rich expression conditions. |
| Artifacts to inspect | `spec/approvals/**`, `conformance/approvals/decisions.json`, `spec/entities/evolution.md`, `spec/audit/relationships.md`, Approval TypeScript APIs/tests. |
| Artifacts likely to change | New or updated approval spec files, approval conformance vectors, traceability, portable errors after finalization. |
| Normative requirements | Add `APPROVAL-LIFECYCLE-*` or targeted `APPROVAL-DECISION-*` requirements for withdrawal, expiration, supersession, current-effectiveness, evaluation context, and non-deletion. |
| Conformance work | Design vectors for withdrawn approval no longer satisfying requirement, expired approval with injected time, superseded decision ignored, historical preservation, and unchanged relevant facts remaining effective. |
| Agentic impact | Defer promotion until implementation; likely current evaluation operation remains conformance-local unless descriptor is stable. |
| Portable error impact | Likely codes for invalid lifecycle operation or invalid evaluation context; do not invent before failure categories stabilize. |
| TypeScript implementation | None. |
| Tests | None beyond spec/conformance design. |
| Critical mutation scenarios | Withdrawn decision still active, expired decision still active, stale subject revision accepted, superseded approval counted, history entry deleted instead of marked ineffective. |
| Documentation | Update approval README and traceability with planned implementation state. |
| Stop conditions | `BLOCKED BY SPEC GAP` if evaluation time, subject revision identity, or supersession ownership cannot be specified portably. |
| Definition of Done | Approval validity semantics are normative and vector-ready. |
| Expected readiness status | READY FOR Approval Validity Implementation. |

### Step 8. Approval Validity Implementation and Closure

| Field | Plan |
| --- | --- |
| Title | Approval Validity Implementation and Closure |
| Type | IMPLEMENTATION |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: current-effectiveness must preserve append-only history and exact fact binding. |
| Objective | Implement withdrawal, expiration, supersession, and revised effectiveness evaluation for Approval decisions. |
| Prerequisites | Step 7 complete. |
| Scope | Add TypeScript APIs and conformance operations for specified approval lifecycle behavior. Use injected time/context. Preserve historical decisions defensively. |
| Non-scope | Delegation, quorum, parallel approval groups, authorization/RBAC, notification escalation. |
| Artifacts to inspect | Approval specs and vectors, `implementations/typescript/core/src/approvals/**`, adapter operations, tests, README. |
| Artifacts likely to change | Approval core APIs, errors, tests, conformance vectors, adapter, traceability, JSDoc, READMEs, possibly Agentic docs. |
| Normative requirements | Cover all added approval lifecycle requirements. |
| Conformance work | Add all vectors designed in Step 7, including boundary time vectors with explicit UTC offsets and no wall-clock dependency. |
| Agentic impact | Candidate operation review for `finkore.approval.evaluateRequirement` or lifecycle commands should wait for Step 9. |
| Portable error impact | Add finalized codes to spec conventions, approval errors, TypeScript errors, normalization, tests, and docs. |
| TypeScript implementation | Add public lifecycle APIs; use `unknown` at untrusted boundaries; avoid JavaScript object-order semantics except where spec says order is ignored. |
| Tests | Unit, adapter, conformance, typecheck, build, coverage. |
| Mutation testing | Run approval-focused and package mutation where feasible. |
| Critical mutation scenarios | Expiration comparison inverted, current time taken from wall clock, withdrawn decision still effective, superseded decision still effective, stale facts ignored, failure mutates history. |
| Documentation | Update approval spec, TypeScript README, root README status, traceability, JSDoc. |
| Stop conditions | `BLOCKED BY SPEC GAP` if implementation exposes behavior not defined in Step 7. |
| Definition of Done | Approval validity slice passes tests/conformance, docs and errors are aligned, and critical mutants are killed. |
| Expected readiness status | Approval Draft 0.2 lifecycle slice closed. |

### Step 9. Agentic Operation Review and Promotion

| Field | Plan |
| --- | --- |
| Title | Agentic Operation Review and Promotion |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | MEDIUM: requires judgment, not much code. |
| Objective | Decide which Draft 0.2 operations become canonical Agentic operations and which remain conformance-local. |
| Prerequisites | Steps 3, 6, and 8 completed or explicitly scoped out. |
| Scope | Review Money allocation/rate, Entity evolution, Audit relationship, and Approval validity operations against descriptor stability, effects, inputs, outputs, portable errors, audit relation, approval relation, and conformance coverage. |
| Non-scope | MCP/OpenAI executable adapter, network tools, authorization, UI. |
| Artifacts to inspect | `agentic/**`, conformance operation IDs, adapter operation IDs, spec requirements, traceability. |
| Artifacts likely to change | `agentic/operations.md`, `agentic/effects.md`, `agentic/errors.md`, `agentic/capabilities.md`, `agentic/examples.md`, conformance conventions if operation labels change. |
| Normative requirements | Agentic docs must reference stable spec requirements and must not override them. |
| Conformance work | Ensure promoted operations map cleanly to vector operation IDs or document why a conformance-local label remains local. |
| Agentic impact | Possible promotions: `finkore.money.allocate`, rate operation, `finkore.entity.*` evolution operations, updated `finkore.audit.append`, possibly approval current-effectiveness evaluation. |
| Portable error impact | Ensure every descriptor enumerates known operation-specific portable errors without claiming exhaustiveness where validation errors also apply. |
| TypeScript implementation | No core logic. Adapter naming updates only if necessary and safe. |
| Tests | Run agentic link/reference checks if available; run conformance if operation IDs changed. |
| Critical mutation scenarios | Not mutation-tested directly; review for misleading state-changing, audit, approval, irreversibility, or determinism metadata. |
| Documentation | Update Agentic README/status and root README if advertised capabilities change. |
| Stop conditions | `BLOCKED BY SPEC GAP` if an operation lacks stable effect semantics or portable input/output shape. |
| Definition of Done | Agentic registry is aligned with implemented/spec-covered 0.2 capabilities and avoids premature promotion. |
| Expected readiness status | Agentic Draft 0.2 registry aligned. |

### Step 10. Draft 0.2 Closure

| Field | Plan |
| --- | --- |
| Title | Draft 0.2 Closure |
| Type | CLOSURE |
| Criticality | CRITICAL PATH |
| Complexity | HIGH: broad verification and documentation synchronization. |
| Objective | Close FinKore Core Draft 0.2 only after every selected slice is spec-defined, conformance-covered, implemented where intended, mutation-reviewed, and documented. |
| Prerequisites | All selected implementation and Agentic milestones complete. Deferred candidates are documented. |
| Scope | Full traceability audit, conformance manifest/version review, README status update, portable error inventory review, Agentic registry audit, TypeScript API/JSDoc audit, mutation report review, Draft 0.1 regression verification. |
| Non-scope | Starting 0.3 work, language ports, production release claims, v0.5 release packaging. |
| Artifacts to inspect | Entire repo areas listed in AGENTS completion rule. |
| Artifacts likely to change | `README.md`, `spec/README.md`, `conformance/traceability.md`, `conformance/manifest.json`, `agentic/README.md`, implementation READMEs, package status/version only if release policy says so. |
| Normative requirements | All selected 0.2 requirements have stable IDs and traceability. |
| Conformance work | Ensure `UNCOVERED = 0`, `BLOCKING SPEC GAPS = 0`, no accidental second specification in vectors, and closed-slice vectors are manifest-listed. |
| Agentic impact | Registry/capabilities match actual implemented and conformance-covered operation surfaces. |
| Portable error impact | `spec/conventions.md`, domain error files, TypeScript error classes, adapter normalization, JSDoc, and Agentic descriptors agree. |
| TypeScript implementation | No feature implementation unless closure reveals a missed required fix; if so, open a focused remediation step. |
| Tests | Run `npm run build --workspaces`, `npm run typecheck --workspaces`, `npm run test --workspaces`, `npm run test:coverage --workspaces` where available, relevant conformance runner commands, and mutation tests for affected packages. |
| Mutation testing | Critical surviving mutants must be zero for selected 0.2 financial behavior; aggregate target remains at least 95 percent where mutation tooling applies. |
| Critical mutation scenarios | Review all critical scenarios from Steps 3, 6, and 8. |
| Documentation | Synchronize root README, implementation README, spec indexes, conformance traceability, Agentic docs, and this task document if final scope differed. |
| Stop conditions | `BLOCKED BY SPEC GAP` if any selected mandatory behavior remains ambiguous; `BLOCKED BY CRITICAL MUTANT` if a critical financial mutant survives without justified equivalence. |
| Definition of Done | `FINKORE CORE DRAFT 0.2 COMPLETE` is justified by green checks, clean traceability, aligned docs, and explicit deferred backlog. |
| Expected readiness status | FINKORE CORE DRAFT 0.2 COMPLETE. |

## 8. Cross-Domain Risks

- Entity evolution and Audit evidence can create hidden coupling if Entity APIs directly implement Audit rules instead of composing clearly specified contracts.
- Approval supersession may depend on Entity revision identity; the plan must define whether Approvals reference Entity identity, revision identity, stable fact snapshots, or caller-provided subject facts.
- Workflow terminal states do not automatically imply Entity finality. Evolution semantics must not infer financial finality from a generic Workflow state name.
- Money allocation may be used by tax or invoice domains, but Money must not embed tax jurisdiction or accounting posting policy.
- Audit relationship metadata must preserve append-only history and must not become a backdoor replacement/removal mechanism.
- Portable errors must remain stable categories; do not create one code per application-specific scenario.
- Conformance vectors must not define behavior before `/spec` does.

## 9. Cross-Language Risks

- Exact decimals: avoid JavaScript-specific `number`, `BigInt`, or decimal library assumptions in normative text.
- Undefined and optional values: portable JSON must distinguish omitted and null where relevant.
- Object identity: never rely on reference identity or prototype behavior.
- Map/Set/object key order: JSON object member order must not carry meaning; declared arrays may carry order only where the spec says so.
- Exceptions vs results: normative behavior should describe success/error observations, not TypeScript exception mechanics.
- Date/time: expiration must use injected RFC 3339 instants and must not depend on host timezone, locale, or wall clock.
- Locale: serialization remains locale-independent.
- Callback functions: guard, condition, and validation semantics must not require callbacks as portable behavior.
- Integer limits: allocation ratios and scaled decimal arithmetic need explicit portability review for Java, Go, and .NET numeric boundaries.
- Defensive copying: mutation guarantees must be observable without assuming JavaScript object freezing.

## 10. CoreDoc / External Review Touchpoints

Include in CoreDoc:

- Draft 0.2 scope and non-goals.
- Correction, reversal, void, supersession, replacement, and amendment terminology.
- Money allocation remainder policy and rate/percentage semantics.
- Approval current-effectiveness model.
- Agentic operation promotion rules.

Review by accounting/domain experts:

- Correction vs reversal vs void vs supersession distinctions.
- Money allocation remainder distribution.
- Tax-like rate application boundary that avoids jurisdiction-specific behavior.
- Approval expiration and supersession validity in AP, expenses, invoices, and procurement.

Review by security experts:

- Audit relationship metadata and redaction interaction.
- Approval history preservation and safe diagnostic context.
- Any future retention semantics before they enter scope.

Keep as implementation detail:

- TypeScript class layout.
- Decimal arithmetic library or internal representation.
- Test runner internals.
- Adapter fixture parsing helpers.

## 11. Draft 0.2 Closure Criteria

`FINKORE CORE DRAFT 0.2 COMPLETE` requires:

- All selected Draft 0.2 requirements are present in `/spec` with stable IDs.
- Conformance vectors exist for every directly testable mandatory behavior.
- `conformance/traceability.md` reports `UNCOVERED = 0` and `BLOCKING SPEC GAPS = 0` for closed Draft 0.2 scope.
- Full conformance is green for the TypeScript reference implementation.
- Draft 0.1 regression tests and conformance vectors remain green.
- Critical surviving mutants are zero for new financial behavior; equivalent mutants have written justification.
- Portable error catalog is aligned across `spec/conventions.md`, domain error docs, TypeScript errors, adapter normalization, JSDoc, and Agentic descriptors.
- Agentic registry advertises only stable, spec-backed operations and accurately leaves immature operations conformance-local.
- TypeScript public APIs have meaningful JSDoc with relevant requirement IDs.
- Root README, TypeScript README, conformance traceability, Agentic docs, and spec indexes describe the current implemented state.
- Cross-domain invariants for Entity/Audit/Approval interactions are tested.
- Deferred 0.3+ backlog is explicit and no 0.2 document implies deferred behavior is implemented.

## 12. Deferred Draft 0.3+ Backlog

Priority order:

1. Approval quorum/N-of-M and parallel approval groups, after lifecycle validity is stable.
2. Workflow definition versioning, followed later by migration semantics.
3. Rich approval condition expression/interchange model, if it can avoid becoming a general policy engine.
4. Entity import/migration identity mapping and cross-entity identity registry semantics.
5. Private/non-ISO currency namespace design.
6. Precision/overflow limits and recommended minor-unit metadata after cross-language proof.
7. Tax primitives beyond generic rates, only with accountant-reviewed portable boundaries.
8. Interest/accrual/day-count primitives.
9. Delegation and escalation, after authorization boundaries are clear.
10. Audit retention and stronger provenance/security policy.
11. Ledger, journal entries, reconciliation, fiscal periods, purchase orders, invoice matching, and payments as separate future domain research.

## 13. First Milestone to Execute

NEXT CODEX MILESTONE: Draft 0.2 Baseline Audit and Scope Lock
