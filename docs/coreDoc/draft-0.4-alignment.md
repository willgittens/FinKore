# Draft 0.4 CoreDoc Alignment Record

**Status:** COMPLETE for Milestone B, TASK-172 through TASK-176
**Review date:** 2026-09-15
**Reviewed baseline:** repository revision `68e576b`, plus completed Milestone A
authority and version records.
**External review status:** No independent or community review is claimed.

This record is part of the durable CoreDoc review history for FinKore Core Draft
0.4. It inventories every CoreDoc identifier, maps CoreDoc rules to exact
specification refinements, maps specification requirement families back to
CoreDoc or a domain-local rationale, records counterexample review findings, and
closes the Draft 0.4 CoreDoc alignment gate.

## Finding Classifications

| Finding | Classification | Affected identifiers | Disposition |
| --- | --- | --- | --- |
| D04-CORE-172-001 | CLARIFICATION | CORE-001 through CORE-005 | Every CoreDoc identifier has metadata, rationale, interpretation or summary, boundaries where applicable, and stable references. Principle headings intentionally summarize their child rules rather than repeating rule sections. |
| D04-CORE-173-001 | CLARIFICATION | CORE-001.1 through CORE-005.3 | CoreDoc-to-spec and spec-to-CoreDoc mappings are complete for Draft 0.4 without making CoreDoc the detailed domain specification. |
| D04-CORE-174-001 | CLARIFICATION | CORE-001.1, CORE-005.2 | Negative and zero Money amounts are not contradictions. CoreDoc preserves sign meaning, and consuming domains may declare restrictions. |
| D04-CORE-174-002 | CLARIFICATION | CORE-001.3 | Currency mismatch is a rejected domain outcome unless explicit conversion exists. No implicit rate source is introduced. |
| D04-CORE-174-003 | CLARIFICATION | CORE-001.2, CORE-001.4, CORE-005.3 | Rounding and allocation are deterministic only from declared scale, mode, method, and order. Minor-unit policy remains outside Draft 0.4. |
| D04-CORE-174-004 | CLARIFICATION | CORE-002.1 through CORE-002.4 | Rejected lifecycle, validation, mutability, import, and conflict operations preserve observable domain state as specified. This is a domain guarantee, not a database transaction model. |
| D04-CORE-174-005 | CLARIFICATION | CORE-003.1 through CORE-003.4, CORE-005.2 | Redaction and append-only history coexist: redaction is evidenced and distinguishable from original absence, not destructive rewriting. |
| D04-CORE-174-006 | CLARIFICATION | CORE-004.1 through CORE-004.4 | Approval applicability, eligibility, effectiveness, withdrawal, supersession, and composition refine approval integrity without defining IAM, delegation, or escalation. |
| D04-CORE-174-007 | CLARIFICATION | CORE-005.1 | Entity identity, Entity Revision, Workflow Definition Version, and conflict version remain distinct unless a composing specification explicitly binds meanings. |
| D04-CORE-175-001 | EDITORIAL | CoreDoc, release note, task list | Add this alignment record and links from CoreDoc, release notes, and the task list. No normative financial behavior changes. |

There are zero `NORMATIVE CHANGE`, `CONTRADICTION`, or `PORTABILITY BLOCKER`
findings in this milestone.

## TASK-172 Inventory

Every `CORE-*` identifier has one inventory row.

| CoreDoc ID | Kind | Title | Metadata | Required sections | References | Finding |
| --- | --- | --- | --- | --- | --- | --- |
| CORE-001 | Principle | Monetary Integrity | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-12 | Summary only; child rules carry detailed sections | CORE-001.1 to CORE-001.4 | D04-CORE-172-001 |
| CORE-001.1 | Rule | Amount and currency are inseparable | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Money representation, currency | D04-CORE-172-001 |
| CORE-001.2 | Rule | Exact calculation and explicit rounding | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Money arithmetic, rounding, rates | D04-CORE-172-001 |
| CORE-001.3 | Rule | Incompatible currencies are not combined or compared | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Currency, arithmetic, comparison | D04-CORE-172-001 |
| CORE-001.4 | Rule | Allocation conserves the source value | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Money allocation | D04-CORE-172-001 |
| CORE-002 | Principle | Controlled Financial State | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Summary only; child rules carry detailed sections | CORE-002.1 to CORE-002.4 | D04-CORE-172-001 |
| CORE-002.1 | Rule | Lifecycle changes require a declared valid transition | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Workflow states, transitions, terminal states, Entity lifecycle | D04-CORE-172-001 |
| CORE-002.2 | Rule | Validation is complete, fact-based, and non-mutating | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Workflow guards, Entity validation | D04-CORE-172-001 |
| CORE-002.3 | Rule | Rejected actions have no partial financial effect | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Workflow transitions, Entity mutability/evolution, Audit errors/relationships | D04-CORE-172-001 |
| CORE-002.4 | Rule | Mutability is declared by state and field | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Entity mutability | D04-CORE-172-001 |
| CORE-003 | Principle | Financial History and Evolution | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Summary only; child rules carry detailed sections | CORE-003.1 to CORE-003.4 | D04-CORE-172-001 |
| CORE-003.1 | Rule | A committed event preserves essential evidence | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Audit events, actors | D04-CORE-172-001 |
| CORE-003.2 | Rule | Committed history is not destructively rewritten | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Audit append-only history, relationships | D04-CORE-172-001 |
| CORE-003.3 | Rule | Corrections and related evolution preserve original facts | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Entity evolution, Audit relationships | D04-CORE-172-001 |
| CORE-003.4 | Rule | Redaction preserves evidence of history | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Audit redaction, append-only history, actors | D04-CORE-172-001 |
| CORE-004 | Principle | Approval Integrity | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Summary only; child rules carry detailed sections | CORE-004.1 to CORE-004.4 | D04-CORE-172-001 |
| CORE-004.1 | Rule | Approval requirements state subject, eligibility, and outcome | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Approval requirements, decisions | D04-CORE-172-001 |
| CORE-004.2 | Rule | Missing facts do not create an approval exemption | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Approval conditions | D04-CORE-172-001 |
| CORE-004.3 | Rule | Decisions remain tied to their facts and history | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Approval decisions, conditions, validity | D04-CORE-172-001 |
| CORE-004.4 | Rule | Chain status follows declared requirements and decisions | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Approval chains, requirements | D04-CORE-172-001 |
| CORE-005 | Principle | Identifiable and Determinable Financial Meaning | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Summary only; child rules carry detailed sections | CORE-005.1 to CORE-005.3 | D04-CORE-172-001 |
| CORE-005.1 | Rule | Continuing financial subjects retain stable identity | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Entity identity, Audit events, actors | D04-CORE-172-001 |
| CORE-005.2 | Rule | Materially distinct conditions remain distinguishable | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Audit changes/actors/redaction, Approval conditions/requirements, Money representation | D04-CORE-172-001 |
| CORE-005.3 | Rule | Evaluation follows declared facts and context | Introduced Draft 0.4; updated Draft 0.4 on 2026-09-10 | Rule, rationale, interpretation, boundaries | Money rounding/allocation, Approval conditions/chains, Workflow guards, Audit append-only history | D04-CORE-172-001 |

No missing, stale, contradictory, circular, or over-broad CoreDoc reference was
found. All requirement references in CoreDoc resolve to existing `/spec`
requirement IDs.

## TASK-173 CoreDoc-to-Spec Traceability

Ranges are inclusive stable requirement IDs.

| CoreDoc rule | Exact specification refinements |
| --- | --- |
| CORE-001.1 | MONEY-REPRESENTATION-001 to MONEY-REPRESENTATION-004; MONEY-CURRENCY-005 |
| CORE-001.2 | MONEY-ARITHMETIC-007; MONEY-ARITHMETIC-008; MONEY-ROUNDING-001; MONEY-ROUNDING-004 to MONEY-ROUNDING-007; MONEY-RATE-005; MONEY-RATE-006 |
| CORE-001.3 | MONEY-CURRENCY-003; MONEY-CURRENCY-004; MONEY-ARITHMETIC-001; MONEY-ARITHMETIC-002; MONEY-COMPARISON-001 to MONEY-COMPARISON-004 |
| CORE-001.4 | MONEY-ALLOCATION-001 to MONEY-ALLOCATION-013 |
| CORE-002.1 | WORKFLOW-STATES-002; WORKFLOW-STATES-004; WORKFLOW-STATES-007; WORKFLOW-TRANSITION-001 to WORKFLOW-TRANSITION-005; WORKFLOW-TERMINAL-001 to WORKFLOW-TERMINAL-004; ENTITY-LIFECYCLE-001 to ENTITY-LIFECYCLE-006 |
| CORE-002.2 | WORKFLOW-GUARD-001 to WORKFLOW-GUARD-006; ENTITY-VALIDATION-001 to ENTITY-VALIDATION-003; ENTITY-VALIDATION-006 |
| CORE-002.3 | WORKFLOW-TRANSITION-006; WORKFLOW-TRANSITION-007; ENTITY-MUTABILITY-004; ENTITY-EVOLUTION-023 to ENTITY-EVOLUTION-025; AUDIT-ERROR-001; AUDIT-RELATIONSHIP-012 |
| CORE-002.4 | ENTITY-MUTABILITY-001 to ENTITY-MUTABILITY-007 |
| CORE-003.1 | AUDIT-EVENT-001 to AUDIT-EVENT-008; AUDIT-ACTOR-001 to AUDIT-ACTOR-004 |
| CORE-003.2 | AUDIT-APPEND-001 to AUDIT-APPEND-004; AUDIT-APPEND-006; AUDIT-RELATIONSHIP-009; AUDIT-RELATIONSHIP-014 |
| CORE-003.3 | ENTITY-EVOLUTION-004; ENTITY-EVOLUTION-006; ENTITY-EVOLUTION-008 to ENTITY-EVOLUTION-023; AUDIT-RELATIONSHIP-001 to AUDIT-RELATIONSHIP-013 |
| CORE-003.4 | AUDIT-REDACTION-001 to AUDIT-REDACTION-007; AUDIT-APPEND-001; AUDIT-APPEND-004; AUDIT-ACTOR-006 |
| CORE-004.1 | APPROVAL-REQUIREMENT-001 to APPROVAL-REQUIREMENT-007; APPROVAL-DECISION-004 |
| CORE-004.2 | APPROVAL-CONDITION-001 to APPROVAL-CONDITION-006 |
| CORE-004.3 | APPROVAL-DECISION-001 to APPROVAL-DECISION-008; APPROVAL-CONDITION-003; APPROVAL-VALIDITY-001 to APPROVAL-VALIDITY-012 |
| CORE-004.4 | APPROVAL-CHAIN-001 to APPROVAL-CHAIN-009; APPROVAL-REQUIREMENT-005 |
| CORE-005.1 | ENTITY-IDENTITY-001 to ENTITY-IDENTITY-006; AUDIT-EVENT-004; AUDIT-ACTOR-001 to AUDIT-ACTOR-003 |
| CORE-005.2 | AUDIT-CHANGE-003; AUDIT-ACTOR-004; AUDIT-REDACTION-002; APPROVAL-CONDITION-002; APPROVAL-CONDITION-006; APPROVAL-REQUIREMENT-005; MONEY-REPRESENTATION-004 |
| CORE-005.3 | MONEY-ROUNDING-002; MONEY-ALLOCATION-012; APPROVAL-CONDITION-005; APPROVAL-CHAIN-008; WORKFLOW-GUARD-004; WORKFLOW-GUARD-006; AUDIT-APPEND-006 |

These mappings show refinement relationships only. They do not mean that CoreDoc
defines detailed Money, Workflow, Audit, Approval, or Entity behavior.

## TASK-173 Spec-to-CoreDoc Family Map

| Requirement family | Domain | CoreDoc relation or DOMAIN-LOCAL rationale |
| --- | --- | --- |
| SPEC-CONFORMANCE | Shared | DOMAIN-LOCAL: specification and conformance governance. |
| SPEC-REQUIREMENT | Shared | DOMAIN-LOCAL: stable requirement identifier governance. |
| SPEC-TERMINOLOGY | Shared | DOMAIN-LOCAL: shared terminology governance. |
| SPEC-IDENTIFIER | Shared | CORE-005.1. |
| SPEC-TIMESTAMP | Shared | CORE-003.1; CORE-005.3. |
| SPEC-DECIMAL | Shared | CORE-001.1; CORE-001.2. |
| SPEC-CURRENCY | Shared | CORE-001.1; CORE-001.3. |
| SPEC-JSON | Shared | CORE-005.2. |
| SPEC-NULLABILITY | Shared | CORE-005.2. |
| SPEC-ERROR | Shared | CORE-002.3; CORE-005.2. |
| SPEC-EXAMPLE | Shared | DOMAIN-LOCAL: specification authoring and example hygiene. |
| MONEY-REPRESENTATION | Money | CORE-001.1; CORE-005.2. |
| MONEY-CURRENCY | Money | CORE-001.1; CORE-001.3. |
| MONEY-ARITHMETIC | Money | CORE-001.2; CORE-001.3. |
| MONEY-COMPARISON | Money | CORE-001.3; CORE-005.2. |
| MONEY-ROUNDING | Money | CORE-001.2; CORE-005.3. |
| MONEY-RATE | Money | CORE-001.2; CORE-001.3. |
| MONEY-ALLOCATION | Money | CORE-001.4; CORE-005.3. |
| MONEY-SERIALIZATION | Money | CORE-001.1; CORE-005.2. |
| MONEY-ERROR | Money | CORE-002.3; SPEC-ERROR domain-local portable error catalog. |
| WORKFLOW-STATES | Workflow | CORE-002.1. |
| WORKFLOW-TRANSITION | Workflow | CORE-002.1; CORE-002.2; CORE-002.3. |
| WORKFLOW-TERMINAL | Workflow | CORE-002.1. |
| WORKFLOW-GUARD | Workflow | CORE-002.2; CORE-005.3. |
| WORKFLOW-ERROR | Workflow | CORE-002.3. |
| WORKFLOW-VERSION | Workflow | CORE-002.1; CORE-005.1; CORE-005.3. |
| WORKFLOW-IMPORT | Workflow | CORE-002.1; CORE-005.1. |
| WORKFLOW-CONFLICT | Workflow | CORE-002.3; CORE-005.3. |
| AUDIT-EVENT | Audit | CORE-003.1; CORE-005.1. |
| AUDIT-ACTOR | Audit | CORE-003.1; CORE-005.2. |
| AUDIT-CHANGE | Audit | CORE-003.1; CORE-005.2. |
| AUDIT-APPEND | Audit | CORE-003.2; CORE-005.3. |
| AUDIT-ERROR | Audit | CORE-002.3; CORE-003.2. |
| AUDIT-REDACTION | Audit | CORE-003.4; CORE-005.2. |
| AUDIT-RELATIONSHIP | Audit | CORE-003.2; CORE-003.3. |
| APPROVAL-REQUIREMENT | Approvals | CORE-004.1; CORE-004.4. |
| APPROVAL-DECISION | Approvals | CORE-004.1; CORE-004.3. |
| APPROVAL-CONDITION | Approvals | CORE-004.2; CORE-005.3. |
| APPROVAL-CHAIN | Approvals | CORE-004.4; CORE-005.3. |
| APPROVAL-VALIDITY | Approvals | CORE-004.3. |
| APPROVAL-COMPOSITION | Approvals | CORE-004.4; CORE-005.3. |
| APPROVAL-QUORUM | Approvals | CORE-004.4; DOMAIN-LOCAL bounded composition refinement. |
| APPROVAL-ERROR | Approvals | CORE-002.3; DOMAIN-LOCAL approval error precedence and disclosure. |
| ENTITY-IDENTITY | Entities | CORE-005.1. |
| ENTITY-LIFECYCLE | Entities | CORE-002.1. |
| ENTITY-MUTABILITY | Entities | CORE-002.4; CORE-002.3. |
| ENTITY-VALIDATION | Entities | CORE-002.2; CORE-002.3. |
| ENTITY-ERROR | Entities | CORE-002.3. |
| ENTITY-EVOLUTION | Entities | CORE-003.3; CORE-002.3. |
| ENTITY-AUDIT | Entities | CORE-003.1; CORE-003.2. |
| ENTITY-DEFINITION | Entities | CORE-002.1; CORE-002.4; DOMAIN-LOCAL composing-domain definition boundary. |
| ENTITY-REVISION | Entities | CORE-005.1; CORE-005.2. |
| ENTITY-IMPORT | Entities | CORE-005.1; CORE-002.3. |

## TASK-174 Counterexample And Contradiction Review

| Review case | CoreDoc identifiers | Analysis | Disposition |
| --- | --- | --- | --- |
| Negative and zero Money amounts | CORE-001.1; CORE-005.2 | MONEY-REPRESENTATION-004 gives sign ordinary numeric meaning and leaves business restrictions to consuming domains. Zero remains distinguishable from absence. | No contradiction; no change. |
| EUR plus USD, or USD ordered against EUR | CORE-001.3 | MONEY-CURRENCY-003 and MONEY-CURRENCY-004 reject incompatible currency operations. CoreDoc does not invent conversion or rate sourcing. | No contradiction; no change. |
| Rounding `10.005` and negative boundary values | CORE-001.2; CORE-005.3 | MONEY-ROUNDING requires explicit scale and mode and defines deterministic modes. DOWN/FLOOR and UP/CEILING remain distinct for negatives. | No contradiction; no change. |
| Allocation with indivisible remainder | CORE-001.4; CORE-005.3 | MONEY-ALLOCATION preserves total value and uses declared order for remainder placement. This refines conservation without defining commercial allocation policy. | No contradiction; no change. |
| Failed Workflow transition or stale expected revision | CORE-002.1; CORE-002.3; CORE-005.3 | Workflow transition, version mismatch, and conflict rules reject without changing current state or binding. They do not define storage locks or distributed winner selection. | No contradiction; deferred concurrency remains deferred. |
| Entity mutation changes immutable financial field | CORE-002.3; CORE-002.4 | Entity mutability and validation rules require rejection and state preservation. Metadata exceptions must be explicitly declared. | No contradiction; no change. |
| Audit redaction hides sensitive value | CORE-003.2; CORE-003.4; CORE-005.2 | Redaction preserves evidence, identity, event metadata, actor context rules, and distinguishes redacted values from absence. It is not secure deletion or retention automation. | No contradiction; privacy/security limits remain explicit. |
| Approval condition lacks a required fact | CORE-004.2; CORE-005.2; CORE-005.3 | Approval conditions fail or remain unresolved when required facts are absent. They are not silently not applicable. | No contradiction; no change. |
| Approval decision after subject facts changed | CORE-004.3 | Approval validity treats stale facts, withdrawal, expiration, and supersession as current-effectiveness questions while preserving decision history. | No contradiction; no change. |
| Any-of/all-of/quorum approval composition | CORE-004.4 | Draft 0.3 composition refines chain integrity with bounded groups and quorum rules without adding delegation, escalation, or unrestricted graphs. | No contradiction; deferred approval extensions remain deferred. |
| Source identity import versus FinKore identity | CORE-005.1 | Entity Import preserves stable FinKore identity and records source mapping evidence without making source identity the FinKore identity. | No contradiction; no global registry introduced. |
| Entity Revision, Workflow Definition Version, and conflict version | CORE-005.1; CORE-005.3 | Version and revision specs keep business identity, definition version, and conflict preconditions distinct. A composing spec may bind values only explicitly. | No contradiction; no change. |

## TASK-175 Accepted Corrections

Only editorial and clarification changes were accepted:

- Add this alignment record as durable CoreDoc review evidence.
- Link the record from [CoreDoc](core-doc.md).
- Record Milestone B status in the Draft 0.4 release note and task list.

No CoreDoc rule text, specification requirement, conformance vector, Agentic
operation, portable error code, JSDoc, or implementation behavior required a
normative change.

## TASK-176 Alignment Gate

CoreDoc alignment gate result: **PASS**.

- Every `CORE-*` identifier has an inventory row.
- CoreDoc-to-spec mapping is complete for every rule-level CoreDoc identifier.
- Spec-to-CoreDoc mapping is complete for every requirement family in
  `conformance/traceability.md`, with explicit `DOMAIN-LOCAL` rationale where
  the family is specification governance or a domain-local refinement.
- Requirement references from CoreDoc resolve to existing `/spec` IDs.
- Counterexample review found zero unresolved contradictions and zero blocking
  specification gaps.
- Review status is explicit, and no external review is claimed.
- Release-level verification remains in the release note.
