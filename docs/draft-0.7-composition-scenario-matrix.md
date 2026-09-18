# Draft 0.7 Composition Scenario Matrix

## Status

Non-normative Milestone A scenario and traceability matrix.

This matrix expands the Draft 0.7 reference profiles into deterministic
success, rejection, boundary, and history-preservation scenarios. It does not
add conformance vectors or new Core behavior. Normative vectors may be added
only after a later task accepts any necessary specification change.

Milestone C implements the matrix as non-normative reference scenarios in
TypeScript, Python, and Java. Run `npm run composition:test:draft0.7` from the
repository root to execute the shared fixture contract and all three language
reference runners.

Milestone D compares the actual portable observations emitted by all three
language profiles with `npm run composition:compare:draft0.7` and checks
selected critical boundary invariants with
`npm run composition:critical:draft0.7`. It hardens those checks with
`npm run composition:mutation:critical:draft0.7`. These commands remain
reference application evidence, not Core conformance vectors.

## Assertion Authority

| Authority | Meaning |
| --- | --- |
| `CORE` | Existing FinKore requirement governs the expected observation. |
| `PROFILE` | Non-normative profile policy governs the expected observation. |
| `OBSERVATION` | Scenario harness observation needed to compare real outcomes. |
| `FINDING` | Expected behavior remains blocked until the finding is resolved. |

## Existing Coverage Summary

Existing `finkore.core.draft0_6.full` evidence already covers:

| Domain | Existing suites and vectors |
| --- | --- |
| Money | 93 vectors covering exact arithmetic, rounding, allocation, rates, comparison, currency mismatch, representation, and serialization. |
| Workflow | 41 vectors covering declared transitions, guards, terminal behavior, version binding, import, and expected-state/revision conflicts. |
| Audit | 29 vectors covering events, append-only history, actors, changes, relationships, redaction, duplicate event and relationship rejection, and invalid targets. |
| Approvals | 66 vectors covering Requirements, Decisions, fact/revision effectiveness, validity lifecycle, chains, stages, bounded groups, quorum, inapplicability, and unresolved conditions. |
| Entities | 25 vectors covering identity, lifecycle, mutation, validation, import, revision conflicts, and evolution with required Audit evidence. |

Draft 0.7 scenarios must prove interactions through real language APIs and
reference orchestration. Existing vectors remain normative Core evidence; new
profile scenarios remain reference application evidence unless a later accepted
finding promotes a behavior into `/spec` and `/conformance`.

## Expense Approval Scenarios

| Scenario | Before | Action | After | Authority | Existing coverage | New interaction evidence needed |
| --- | --- | --- | --- | --- | --- | --- |
| `D07-EXP-001` successful submission | `expense` in `DRAFT`, exact line items, tax, total, allocation ratios, empty Audit history | Validate total, allocate department splits, transition to `SUBMITTED`, append submit Audit Event | Entity remains same identity, state is `SUBMITTED`, total and allocations exact, submit event appended | `CORE`: Money arithmetic/allocation, Workflow transition, Entity lifecycle/identity, Audit append; `PROFILE`: fields and submit rule | Money arithmetic/allocation vectors; workflow valid transition; audit append; entity transition identity | One orchestration scenario joining Money validation, Entity transition, and required Audit observation |
| `D07-EXP-002` current approval permits transition | `expense` in `SUBMITTED`, effective manager and finance Decisions, executive quorum explicitly inapplicable | Evaluate staged Approval composition, transition to `APPROVED`, append approval Audit Event | `APPROVED` state, committed Decisions preserved, no synthetic Decision for inapplicable quorum | `CORE`: Approval validity/composition/no-obligation, Workflow transition, Audit append; `PROFILE`: approval threshold policy | Approval validity, composition, stage, no-obligation vectors; workflow transition | Scenario proving no-obligation remains distinguishable from approving evidence while lifecycle transition succeeds |
| `D07-EXP-003` pending approval blocks transition | `expense` in `SUBMITTED`, manager approved, finance applicable and pending | Evaluate composition and request approval transition | Transition rejected, Entity state/revision unchanged, committed approval history unchanged, no approval Audit Event appended | `CORE`: Approval pending semantics, Workflow guard rejection, `CORE-002.3`; `PROFILE`: guard connects approval result to transition | Approval pending vectors; workflow guard reject; entity rejected transition preservation | Scenario boundary showing the rejected action is approval-gated transition plus its Audit evidence |
| `D07-EXP-004` explicit rejection blocks transition | `expense` in `SUBMITTED`, effective rejecting finance Decision | Evaluate composition and request approval transition | Transition rejected with profile-selected primary domain error pending TASK-261, Decision remains committed | `FINDING`: exact primary error precedence between profile approval rejection and workflow guard result is deferred to TASK-261 | Approval rejected vectors; workflow guard reject | Blocked expectation for portable primary error until action-boundary and precedence decision |
| `D07-EXP-005` stale approval does not count | `expense` in `SUBMITTED`, prior approval bound to old revision or old relevant facts | Evaluate composition for current revision/facts | Composition is pending or rejected according to remaining current evidence; stale Decision remains in history | `CORE`: `APPROVAL-VALIDITY-003`, `APPROVAL-VALIDITY-012`; `PROFILE`: relevant fact set | Approval stale fact and stale revision vectors | Scenario proves stale evidence cannot authorize lifecycle movement |
| `D07-EXP-006` expired approval at boundary | Approval Decision expires at `2026-09-18T12:00:00Z`; evaluation instant equals expiration | Evaluate composition | Decision ineffective; no ambient clock used | `CORE`: `APPROVAL-VALIDITY-007` through `-009`; `PROFILE`: evaluation context | Approval expiration vectors | Interaction with profile transition gating |
| `D07-EXP-007` incompatible currency total | One line item is `EUR`, profile reimbursement currency is `USD` | Validate total before submission | Money error prevents submission; Entity state and Audit history unchanged | `CORE`: Money currency mismatch and failed operand non-mutation; `PROFILE`: all values same reimbursement currency | Money currency mismatch vectors | Scenario observes Entity/Audit unchanged around failed profile validation |
| `D07-EXP-008` invalid allocation request | Allocation ratio list is empty or target scale invalid | Submit expense | Allocation error prevents submission; source Money, Entity, and Audit history unchanged | `CORE`: `MONEY-ALLOCATION-001`, `MONEY-ALLOCATION-002`, `MONEY-ERROR-008`; `PROFILE`: allocation policy | Money invalid allocation vectors | Scenario joins Money allocation failure with no Entity/Audit effect |
| `D07-EXP-009` stale workflow precondition | `expense` observed in `SUBMITTED` revision `wf-rev-4`; request supplies expected revision `wf-rev-3` | Request approval transition | `FINKORE_WORKFLOW_STATE_CONFLICT`; state, revision, Decisions, and Audit history unchanged | `CORE`: `WORKFLOW-CONFLICT-005`, `WORKFLOW-CONFLICT-007`; `PROFILE`: transition action | Workflow conflict vectors | Scenario includes committed approval evidence that must survive the failed transition |
| `D07-EXP-010` late Audit failure | Approval evidence is current and transition candidate would be allowed; approval Audit Event has duplicate event ID | Request approval transition plus required Audit evidence | Transition success not observable, duplicate Audit Event not appended, prior Decisions and prior Audit history preserved | `CORE`: Audit duplicate event, `CORE-002.3`; `FINDING`: exact cross-domain action boundary and primary error confirmed in TASK-261 | Audit duplicate event vectors; Entity evolution has audit-failure precedent | Scenario for failure after earlier candidate approval/transition checks succeeded |

## Invoice Correction Scenarios

| Scenario | Before | Action | After | Authority | Existing coverage | New interaction evidence needed |
| --- | --- | --- | --- | --- | --- | --- |
| `D07-INV-001` eligible correction succeeds | Source invoice `ISSUED`, source revision current, corrected related revision supplied, required approval effective, valid `CORRECTS` Audit relationship | Record correction relation and Audit Event | Source identity/facts/revision remain observable; corrected revision related; Audit relationship appended | `CORE`: `ENTITY-EVOLUTION-008`, `-015`, `-022`, `-029` through `-033`; `PROFILE`: invoice eligibility | Entity correction/audit vectors; Audit relationship append | Scenario composes approval evaluation before Entity evolution success |
| `D07-INV-002` original facts preserved | Corrected total differs from source total | Record correction | Source total, source revision, invoice identity, and original Audit Event remain unchanged and observable | `CORE`: `CORE-003.3`, `ENTITY-EVOLUTION-008`, `-015`, `AUDIT-APPEND-001` | Entity correction and Audit append-only vectors | Scenario asserts complete before/after observations, not only returned relation |
| `D07-INV-003` ineligible source rejected | Source invoice is `DRAFT` or profile eligibility flag is false | Request correction | `FINKORE_ENTITY_INVALID_MUTATION`; no relation, currentness change, or correction Audit Event | `CORE`: `ENTITY-EVOLUTION-006`, `-010`, `-023`, `-024`; `PROFILE`: eligibility policy | Entity correction ineligible vector | Scenario includes unchanged Approval and Audit histories |
| `D07-INV-004` duplicate correction relation | Relation ID already exists in evolution history | Request correction | Rejected without appending another relation or Audit Event | `CORE`: `ENTITY-EVOLUTION-014`, `-023`; `PROFILE`: duplicate policy follows Core relation identity | Entity reversal duplicate vector and evolution duplicate semantics | Correction-specific duplicate relation scenario |
| `D07-INV-005` stale source revision | Request expected source revision does not match observed source revision | Request correction | `FINKORE_ENTITY_STATE_CONFLICT`; source, related value, relations, and Audit history unchanged | `CORE`: `ENTITY-EVOLUTION-025`; `PROFILE`: correction precondition required | Entity stale revision vector | Scenario also preserves effective or stale Approval history |
| `D07-INV-006` controller approval pending | Delta exceeds `500.00 USD`; accounts receivable approved; controller pending | Evaluate correction policy and request correction | Correction rejected or blocked by profile approval gate; no correction relation or Audit Event | `CORE`: Approval pending/current effectiveness; `PROFILE`: correction requires approval | Approval pending/composition vectors | `FINDING`: TASK-261 selects action boundary and primary error representation |
| `D07-INV-007` stale correction approval | Approval Decision bound to source revision, but corrected revision context changed | Evaluate correction policy | Decision ineffective; correction cannot proceed on stale evidence | `CORE`: `APPROVAL-VALIDITY-003`; `PROFILE`: relevant facts include source and corrected revisions | Approval stale revision vector | Scenario uses invoice correction facts rather than standalone approval fixture |
| `D07-INV-008` invalid Audit relationship | Audit relationship type is not `CORRECTS`, target is unknown, or target Entity mismatches original event | Request correction | Primary Audit error; no correction relation, no currentness change, no success result | `CORE`: `AUDIT-RELATIONSHIP-003`, `-006`, `-008`, `-012`, `-013`, `ENTITY-EVOLUTION-027`, `-033` | Audit relationship invalid vectors; Entity audit failure vector | Late-failure scenario with valid correction candidate but invalid required evidence |
| `D07-INV-009` no approval obligation | Customer impact review is explicitly inapplicable because customer and total are unchanged | Evaluate composition | No-obligation outcome remains distinct from approving Decision; correction still requires other applicable approvals | `CORE`: `APPROVAL-COMPOSITION-011`, `-012`, `-022`; `PROFILE`: applicability rule | Approval no-obligation vectors | Scenario ensures no approving Decision is synthesized |
| `D07-INV-010` correction does not imply reversal or posting | Correction succeeds with related corrected revision | Observe histories | No reversing relation, void relation, ledger entry, payment effect, or supersession currentness appears unless explicitly supplied by scenario | `CORE`: `ENTITY-EVOLUTION-004`, `-005`; `PROFILE`: non-goals | Entity evolution kind distinction vectors | Scenario asserts absence of unintended profile consequences |

## Cross-Profile Required Matrix

| Area | Expense scenario coverage | Invoice scenario coverage | Authority status |
| --- | --- | --- | --- |
| Money exact calculation | `D07-EXP-001`, `D07-EXP-007` | `D07-INV-001`, `D07-INV-002` | Existing Core plus profile field policy |
| Allocation conservation and boundaries | `D07-EXP-001`, `D07-EXP-008` | Not applicable except total comparison | Existing Core; invoice exclusion is profile policy |
| Incompatible currencies | `D07-EXP-007` | Add if corrected total mixes currencies in later fixtures | Existing Core |
| Stable identity | All expense transition scenarios | `D07-INV-001` through `D07-INV-010` | Existing Core |
| Immutable source observations | `D07-EXP-003`, `D07-EXP-009`, `D07-EXP-010` | `D07-INV-002`, `D07-INV-003`, `D07-INV-008` | Existing Core plus profile policy |
| Declared field validation | `D07-EXP-001`, `D07-EXP-007` | `D07-INV-001`, invalid correction fixture to be added later | Existing Core plus profile policy |
| Allowed/rejected mutations | `D07-EXP-001`, `D07-EXP-003` | `D07-INV-003`, `D07-INV-005` | Existing Core plus profile policy |
| Workflow allowed transition | `D07-EXP-001`, `D07-EXP-002` | Correction profile uses evolution, not lifecycle transition, unless a later fixture adds `CORRECTED` state movement | Existing Core plus profile policy |
| Workflow guard rejection | `D07-EXP-003`, `D07-EXP-004` | `D07-INV-006` if modeled as a profile guard | `FINDING` for primary error/action boundary in TASK-261 |
| Terminal behavior | `D07-EXP-009` or later paid/terminal boundary | Optional rejected correction from `VOIDED` | Existing Core plus profile policy |
| Definition version mismatch | `D07-EXP-009` variant | Invoice correction does not require Workflow transition | Existing Core |
| Stale expected state/revision | `D07-EXP-009` | `D07-INV-005` | Existing Core |
| Approval applicability and unresolved facts | `D07-EXP-002` through `D07-EXP-006` | `D07-INV-006`, `D07-INV-007`, `D07-INV-009` | Existing Core plus profile policy |
| Approved/pending/rejected | `D07-EXP-002`, `D07-EXP-003`, `D07-EXP-004` | `D07-INV-001`, `D07-INV-006` | Existing Core plus profile policy |
| Distinct-voter quorum | `D07-EXP-002` variant for executive quorum | Not used unless correction approval later adds quorum | Existing Core; invoice exclusion is profile policy |
| Withdrawn/expired/superseded/stale | `D07-EXP-005`, `D07-EXP-006` | `D07-INV-007` | Existing Core |
| No approval obligation | `D07-EXP-002` | `D07-INV-009` | Existing Core |
| Eligible correction | Not applicable | `D07-INV-001` | Existing Core plus profile policy |
| Ineligible source | Not applicable | `D07-INV-003` | Existing Core plus profile policy |
| Duplicate relation identity | Not applicable | `D07-INV-004` | Existing Core |
| Stale source preconditions | Not applicable | `D07-INV-005` | Existing Core |
| Preserved original facts and relationships | `D07-EXP-003`, `D07-EXP-010` | `D07-INV-002`, `D07-INV-008` | Existing Core |
| Required Audit evidence | `D07-EXP-001`, `D07-EXP-002`, `D07-EXP-010` | `D07-INV-001`, `D07-INV-008` | Existing Core plus profile policy |
| Invalid/mismatched relationship | Not applicable | `D07-INV-008` | Existing Core |
| Duplicate Audit Event | `D07-EXP-010` | `D07-INV-008` variant | Existing Core |
| Append-only preservation | `D07-EXP-003`, `D07-EXP-010` | `D07-INV-002`, `D07-INV-008` | Existing Core |
| Declared ordering | `D07-EXP-001`, `D07-EXP-002` | `D07-INV-001` | Existing Core plus profile observation |
| Late evidence rejection | `D07-EXP-010` | `D07-INV-008` | Existing Core; TASK-261 reviews boundary |
| Primary error interactions | `D07-EXP-004`, `D07-EXP-010` | `D07-INV-006`, `D07-INV-008` | `FINDING` until TASK-261 |
| Failure boundary | `D07-EXP-003`, `D07-EXP-007`, `D07-EXP-008`, `D07-EXP-009`, `D07-EXP-010` | `D07-INV-003` through `D07-INV-008` | Existing Core plus profile boundary |
| Portability and safety | All scenarios | All scenarios | Existing Core plus profile fixture discipline |

## Milestone B Resolutions

The open Milestone A questions are resolved in
[Draft 0.7 Composition Observation Contract](draft-0.7-composition-observation-contract.md):

| Question | Affected scenarios | Resolution |
| --- | --- | --- |
| What portable or reference-profile error is reported when a profile approval gate rejects an otherwise valid Workflow transition? | `D07-EXP-004`, `D07-INV-006` | Profile approval gates use the profile-local code `D07_PROFILE_APPROVAL_NOT_CURRENT`; no `FINKORE_*` error is invented. |
| Does a late Audit failure around a profile-level transition return the primary Audit error, a profile error, or an existing domain error? | `D07-EXP-010`, `D07-INV-008` | Required Audit evidence is inside the profile action boundary; existing Audit or Entity evolution primary errors remain visible where they are the Core primary failure. |
| Does invoice correction require a lifecycle transition to `CORRECTED`, or is the evolution relation alone the portable observation for Draft 0.7? | `D07-INV-001`, `D07-INV-002`, `D07-INV-008` | Entity evolution correction plus required Audit evidence is the Draft 0.7 portable observation; no lifecycle transition is required by Milestone B. |
| Which observations are normative conformance vectors versus reference scenario fixtures? | All scenarios | No normative vectors are added in Milestone B; reference fixtures live under `examples/composition/draft-0.7/` and remain outside `conformance/manifest.json`. |
