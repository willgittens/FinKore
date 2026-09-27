# FinKore Core 0.9.6 Plan

## Status

Milestones 1–8 are complete: accepted contracts, permanent regressions, Money,
Workflow, Approval, Audit, and Entity corrections are implemented and verified.
Fresh review adds 21 regressions and corrects Python
revision-currentness validation and Java composition evidence-container handling.
The expanded manifest has 884 vectors; complete clean-candidate verification,
full configured mutation suites, and all portable/native probe gates pass.
Milestone 9 release closure remains unstarted.
The readiness review of commit `e300bb1`
(`core-0.9.5`) found additional mandatory behavior and portability gaps despite
passing existing checks. Core 1.0 promotion is blocked pending this corrective
release closure and the separate stable-promotion gates.

The completed [0.9.5 plan](plan-09.5.md) remains the record of its corrections
and verified release snapshot. Its completion does not establish coverage of
the additional boundaries below. Preserve all earlier release protections.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) establishes
foundation obligations; `/spec` defines financial behavior. Any normative
correction must follow `SPEC-FREEZE-001` through `SPEC-FREEZE-004` and the
compatibility rules in [Specification Conventions](../../spec/conventions.md).
Accepted decisions are normative in their owning specification documents; this
plan records their implementation work. Planning does not implement fixes, create a release tag,
publish packages, or declare Core 1.0 stable.

## Objective and scope

Close the ten readiness findings across native construction, Approval evidence
and evaluation, Audit redaction authority, Workflow error precedence, and Entity
import/evolution boundaries. Replace temporary probes with permanent tests and
extend verification to adjacent public boundaries that the same defects could
affect. Fixes must preserve exact values, identity, bindings, history, explicit
context, and failure atomicity.

No new financial domain, rounding default, currency registry, authorization or
RBAC model, Workflow migration, persistence, distributed concurrency, generic
validation DSL, or special agent execution mode is in scope. Learn pages and
presentation work may proceed independently but cannot satisfy this release gate.

Financial validation and portable error selection belong in implementation
cores. Adapters translate representations and preserve member presence; they
must not repair missing evidence, infer financial facts, or implement domain
rules. The runner remains domain-neutral. Language APIs may differ in shape
while preserving the same specified observable guarantees.

## Starting evidence

The readiness review freshly passed `npm run tools:check`, `npm run check`,
`npm run python:compat`, and `npm run conformance`. All 667 manifest vectors
passed on TypeScript, CPython 3.12, CPython 3.13, and Java with zero failed,
unsupported, or infrastructure outcomes. Full coverage and mutation suites
were not rerun during that review; the 0.9.5 plan records its earlier complete
release verification separately.

Independent probes exercised native APIs and boundary variations across 33
conformance operations. Findings were confirmed with valid controls; selected
portable cases used identical JSON inputs on all four runtimes. Exploratory
differences are leads, not automatically specification violations. In particular,
TypeScript is not the specification, cross-language agreement is not proof of
correctness, and sparse native arrays are not equivalent to JSON null entries.

Execution of this plan must not depend on `/tmp` files or this conversation.
Reproduce each case from the owning contract and repository fixtures. Historical
counts are baseline observations, not target counts or proof of completeness.

## Findings to resolve

Numbers preserve the readiness review's ordering. Lettered rows distinguish
separate failure mechanisms; they are planning labels, not requirement IDs.

| Finding | Reproduced observation | Governing contract | Fix milestone |
| --- | --- | --- | --- |
| 1 — Missing composition state | Python and Java infer `PENDING` for an applicable member without required `state`; an `ANY_OF` group can consequently return `APPROVED` despite incomplete evidence. | `APPROVAL-COMPOSITION-010`/`024`, `APPROVAL-ERROR-008`/`010`: required missing evidence must fail with `FINKORE_APPROVAL_INVALID_CHAIN`. | 5 |
| 2 — Native Money construction | Python `Money(Decimal("NaN"), "EUR").to_portable()` succeeds; infinity and empty currency also serialize. Portable construction rejects them. | `MONEY-REPRESENTATION-002`, `MONEY-CURRENCY-001`, `MONEY-ERROR-001`/`002`; native public constructor validation. | 3 |
| 3 — Native Workflow construction | Python and Java directly constructed definitions allow `GHOST` as initial State when only `DRAFT` and `FINAL` are declared; creation returns `GHOST`. | `WORKFLOW-STATES-001` through `004`, `WORKFLOW-ERROR-001`/`007`; definition validity applies outside portable parsing. | 4 |
| 4 — Redaction authority | Python redacts content and returns an evidence Event after `policy.authority` is removed; TypeScript and Java reject it. | `AUDIT-REDACTION-001`, `FINKORE_AUDIT_REDACTION_INVALID`; declaration validation does not imply an authorization service. | 6 |
| 5 — Required composition timestamp | With `requiresEvaluationContext: true`, every implementation accepts `evaluatedAt: "not-a-timestamp"`; Python and Java also accept null. | `APPROVAL-COMPOSITION-010`, `APPROVAL-VALIDITY-007`/`008`, `APPROVAL-ERROR-007`/`010`, `SPEC-TIMESTAMP-001` through `006`. | 5 |
| 6a — Decision evaluation scope | `approval.decision.evaluate` with an empty Requirement subject returns `EFFECTIVE` in TypeScript/Java and invalid Decision in Python. | Concrete Requirement/Decision boundaries in `APPROVAL-REQUIREMENT-002`/`003`, Approval Errors, and the conformance-local operation contract; reconcile facts-only versus concrete effectiveness semantics. | 5 |
| 6b — Decision expiration scope | The same operation returns `EFFECTIVE` for an expired Decision in TypeScript and `INEFFECTIVE` in Python/Java. | `APPROVAL-VALIDITY-007` through `009`; distinguish a native fact-comparison helper from the agreed portable evaluation scope. | 5 |
| 7a — Lifecycle discriminator | Python and Java accept an unknown committed lifecycle type and still evaluate the Requirement as `APPROVED`. | `APPROVAL-VALIDITY-001`/`012`, Approval Errors, and the existing committed-lifecycle fixture contract. | 5 |
| 7b — Lifecycle relationships | Python and Java reuse history containing a withdrawal of a nonexistent Decision; TypeScript rejects it. | `APPROVAL-VALIDITY-004`/`005`/`010`/`012`; complete historical relationship validation before reuse. | 5 |
| 8 — Evaluation short circuit | TypeScript returns `REJECTED` for a rejecting Decision followed by a considered expiring Decision when the evaluation instant is missing. Python and Java return invalid context. | `APPROVAL-VALIDITY-007`/`008`/`012`; a decisive outcome cannot bypass required evaluation context. | 5 |
| 9a — Rate runtime exception | Python Rate `kind: {}` raises `TypeError` rather than a Money portable error. | `MONEY-ERROR-001`/`007`; unsupported Rate representation must fail in the core. | 3 |
| 9b — Approval runtime exception | Java chain evaluation with a missing State raises `NullPointerException`; null composition applicability also crashes. Python has analogous unhashable enum/container paths. | Approval chain/composition structure, evidence, and portable errors, including `APPROVAL-ERROR-008` through `010`. | 5 |
| 9c — Evolution runtime exception | Java Entity evolution with `expectedSourceRevision: null` raises `NullPointerException`; the expected-State check has the same failure mechanism. | `ENTITY-EVOLUTION-025`, `ENTITY-ERROR-001`/`004`; mismatched supplied preconditions must fail portably without partial evolution. | 7 |
| 10a — Workflow precedence | TypeScript reports version mismatch before detecting a malformed instance revision. | `WORKFLOW-ERROR-005`/`007`: invalid instance precedes version mismatch. | 4 |
| 10b — Malformed Source Identity | Python and Java accept explicit `sourceIdentity: null` when mapping evidence is present. | `ENTITY-IMPORT-003`/`005`/`008`/`009`; malformed supplied identity differs from omission. | 7 |

## Milestone 1 — Contract decisions and traceability

- [x] Read the owning Money, Workflow, Approval, Audit, and Entity specifications,
      their error catalogs, CoreDoc obligations, conformance conventions and
      traceability, and applicable Agentic descriptors.
- [x] Classify every finding as implementation violation, adapter defect,
      documentation mismatch, or specification gap. Establish the expected
      result, portable error, and applicable priority before writing expectations.
- [x] Resolve the decisions below in their owning documents. Record outcomes
      and compatibility assessments here; do not let this plan or a fixture
      become a second specification. Surface unresolved financial semantics
      before implementing dependent behavior.
- [x] Preserve requirement, error, operation, and vector identifiers. Apply the
      compatibility policy to changed API validation, fixture requiredness,
      operation meaning, and primary error selection. Do not label observable
      normative changes as editorial or silently redefine an existing identifier.
- [x] Reassess affected traceability claims by public entry point and boundary.
      Mark PARTIAL, UNCOVERED, or BLOCKING SPEC GAP where warranted; existing
      mapped vectors do not prove native or sequence coverage.
- [x] Preserve the distinction between concrete Approval Requirements/Decisions
      and lightweight composition observations. Do not require concrete subject
      facts on a composition observation or invent a universal fact schema.

### Accepted directions and scope limits

| Decision | Accepted direction | Scope limit |
| --- | --- | --- |
| Native constructor validation | Keep public construction supported and validate before exposing an invalid domain value or instance. Reuse core validation with portable parsing. | Preserve valid Decimal values, constructor signatures where practical, exactness, and owned declarations. Do not route valid native Decimal values through a parser that only accepts portable plain strings. |
| Decision evaluation meaning | Give `approval.decision.evaluate` one concrete, bounded meaning across runtimes: validate the supplied Requirement association/eligibility and Decision, evaluate relevant facts, and honor expiration with explicit context. | APPROVAL-DECISION-009 and the corrected fixture catalog define this boundary. A facts-only helper may remain explicitly documented as such. Do not imply lifecycle-aware evaluation without supplied lifecycle evidence, add a canonical operation ID, or silently change a fixture contract. |
| Complete evaluation validation | Validate required evidence/context before returning a decisive result. Reordering equivalent Decision inputs must not hide missing required context. | APPROVAL-VALIDITY-013 specifies unrelated, withdrawn, superseded, and stale evidence; do not impose evaluation-time requirements on excluded evidence without a governing rule. Preserve defined error priority without inventing a total order for unrelated concrete Approval failures. |
| Imported lifecycle evidence | Validate committed discriminators, field structure, and resolvable relationships before record, lifecycle mutation, or evaluation reuses history. | Distinguish a request's redundant `type` member from committed history's meaningful discriminator. APPROVAL-VALIDITY-014 defines self-reference, ambiguity, duplicate events, and successor checks. No new authorization or lifecycle kinds. |
| Required timestamps | Use the existing portable timestamp parser for required evaluation instants, including calendar, offset, and fractional precision checks. | Preserve original valid lexical values and nanosecond semantics. Do not require an instant where the contract does not require one or introduce a clock default. |
| Redaction policy authority | Reject absent, null, empty, or malformed authority declarations with the existing redaction error. | Validate the declared authority representation; do not implement RBAC, authenticate an authority, or invent policy lookup. Resolve any other policy-field requirements separately. |
| Source Identity presence | Reject supplied malformed Source Identity even when otherwise valid mapping evidence exists. | ENTITY-IMPORT-011 permits standalone complete mapping when Source Identity is omitted; explicit null is invalid. Preserve opaque identity values. |
| Malformed native values and errors | Validate types before enum membership, iteration, casting, or equality; use the owning domain's existing error. | Define supported native types and omission sentinels where necessary. Do not coerce malformed input, catch every runtime defect as a domain error, or copy one runtime's accidental priority. |

Completion: every finding has an agreed owning contract and test boundary, with
no unresolved semantic decision blocking its implementation milestone.

### Milestone 1 review results

The review read the owning domain/error specifications, CoreDoc, compatibility
and freeze rules, conformance conventions and mapped vectors, native public APIs,
adapter dispatch, and applicable Agentic descriptors. The table classifies the
reported observations by contract. The accepted decisions below resolve its
original gaps; Milestone 2 supplies permanent reproductions, without fixes.
Expected errors below assume otherwise valid input unless a priority is stated.

| Finding | Classification and governing outcome | Permanent test boundary and valid control |
| --- | --- | --- |
| 1 | Implementation violation. APPROVAL-COMPOSITION-010/024 and APPROVAL-ERROR-008/010 require `FINKORE_APPROVAL_INVALID_CHAIN` for missing required State, in evidence category 4. | Core and adapter ALL_OF/ANY_OF, nested and later-stage observations; explicit PENDING and quorum-derived pending controls. Pair missing State with higher-priority applicability/context failures. |
| 2 | Implementation violation and native support documentation gap. MONEY-REPRESENTATION-002, MONEY-CURRENCY-001, MONEY-ERROR-001/002 reject non-finite amounts and invalid currencies before exposing Money. | Python direct `Money(Decimal, currency)` construction: quiet/signaling NaN, both infinities, invalid currency and unsupported types. Finite exponent, signed-zero, negative, trailing-zero, retained-scale, arithmetic and serialization controls under altered Decimal context. |
| 3 | Implementation violation. WORKFLOW-STATES-001–004 and WORKFLOW-ERROR-001/007 require `FINKORE_WORKFLOW_INVALID_DEFINITION` for an undeclared initial State. | Python/Java direct definition constructors, then create/import/transition. Validate unique States, terminal declarations, endpoints, guards and version structure; valid owned definitions remain usable. JSON parsing alone cannot close this boundary. |
| 4 | Implementation violation. AUDIT-REDACTION-001 and its error catalog require `FINKORE_AUDIT_REDACTION_INVALID` for absent/malformed authority. | Native and portable redact with absent/null/empty/wrong-type authority; a nonempty authority control preserves Event meaning, relationships, and redaction evidence. Failed redaction leaves history unchanged. No new RBAC or unrelated policy-field requirement. |
| 5 | Implementation violation. APPROVAL-COMPOSITION-010, APPROVAL-VALIDITY-008, SPEC-TIMESTAMP-001–006 and APPROVAL-ERROR-007/010 require `FINKORE_APPROVAL_INVALID_CONTEXT` for malformed required instants. | Applicable `requiresEvaluationContext: true` with absent/null/calendar-invalid/offset-invalid/excess-precision timestamps; exact valid offsets/nanoseconds and context-not-required controls. Pair each composition priority category. |
| 6a | Fixture contract/documentation mismatch resolved by APPROVAL-DECISION-009. Concrete Requirement validation is already required by APPROVAL-REQUIREMENT-002/003, but the facts-only fixture description and TypeScript/Java dispatch omit that boundary. Accepted concrete evaluation rejects empty subject with `FINKORE_APPROVAL_INVALID_DECISION`. | Concrete Requirement subject/eligibility, Decision association, valid eligible/ineligible Actor, and explicit null/scalar/structured facts, directly and through adapters. Keep native facts-only helper tests separate. |
| 6b | Fixture scope resolved by APPROVAL-DECISION-009; the documented facts-only native helper retains its scope. For concrete evaluation, APPROVAL-VALIDITY-007–009 require expiration handling: expired → INEFFECTIVE; required absent/malformed time → `FINKORE_APPROVAL_INVALID_CONTEXT`. | Exact expiry, just-before/after, equivalent offsets, nanosecond boundaries, no-expiration control. Do not change a native facts-only helper's signature implicitly. |
| 7a | Implementation violation. APPROVAL-VALIDITY-001/012 and the existing committed-history fixture require meaningful lifecycle kinds; unknown committed discriminator uses `FINKORE_APPROVAL_INVALID_DECISION`. | Core history import/record/lifecycle/evaluate reuse, unknown/null/missing/wrong-type committed kind, paired valid kinds. Redundant request `type` remains ignored by operation-specific lifecycle requests. |
| 7b | Implementation violation for unresolved withdrawal target under APPROVAL-VALIDITY-004/005/012; `FINKORE_APPROVAL_INVALID_DECISION`. APPROVAL-VALIDITY-014 now specifies adjacent supersession constraints. | Missing/ambiguous withdrawal targets, prior withdrawal/supersession, real returned-history reuse and unchanged histories; valid uniquely resolving target control. Do not infer supersession policy from TypeScript. |
| 8 | Implementation violation for the reported pair of considered Decisions under APPROVAL-VALIDITY-007/008/012: required absent time → `FINKORE_APPROVAL_INVALID_CONTEXT`, regardless of rejection order. APPROVAL-VALIDITY-013 now specifies stale/excluded evidence. | Rejection followed/preceded by matching expiring Decision, valid explicit time, unchanged Decisions/lifecycle. Exercise the accepted excluded/stale context boundary. |
| 9a | Implementation violation. MONEY-RATE-001/007 and MONEY-ERROR-001/007 require `FINKORE_MONEY_INVALID_AMOUNT`, not Python TypeError. | Portable Rate kind `{}`, array, null, number, Boolean, unknown string; DECIMAL/PERCENTAGE controls and unchanged Money. Native unsupported types separately; review rounding/allocation under their own existing error codes. |
| 9b | Implementation violation. Missing chain State → `FINKORE_APPROVAL_INVALID_CHAIN`; null/unresolved composition applicability → `FINKORE_APPROVAL_CONDITION_UNRESOLVED`, subject to APPROVAL-ERROR-010 for compositions. | Java null and Python unhashable containers at native/core and adapter boundaries, all valid enum controls; no fabricated PENDING/inapplicability. Chain validation has no invented total error hierarchy. |
| 9c | Implementation violation. ENTITY-EVOLUTION-025 and ENTITY-ERROR-001/004 require `FINKORE_ENTITY_STATE_CONFLICT` for supplied null expected source State/Revision against a valid source. | Native overloads and all four portable evolution kinds: omitted/null/malformed/matching/mismatching expectations; no source, relation, currentness, or Audit partial effect. Preserve primary domain errors without inventing a total Entity priority. |
| 10a | Implementation violation. WORKFLOW-ERROR-005/007 require `FINKORE_WORKFLOW_INVALID_INSTANCE` before simultaneous version mismatch. | Import/transition with malformed observed revision plus mismatched binding; valid-instance mismatch control; expected-revision conflict and invalid-definition controls. Preserve State/binding/revision on failure. |
| 10b | Implementation violation for explicit null under ENTITY-IMPORT-003/005/008/009: `FINKORE_ENTITY_INVALID_IDENTITY` despite valid mapping. ENTITY-IMPORT-011 permits omitted Source Identity plus standalone mapping. | Core/adapter import presence matrix, opaque source values and unchanged observations, paired valid identity/mapping; standalone mapping preserves its declared references without synthesizing Source Identity. |

### Accepted contract decisions

The request to proceed with Milestone 2 accepted the four proposed directions.
Their owning documents now define the outcomes with distinct stable IDs:

1. [APPROVAL-DECISION-009](../../spec/approvals/decisions.md): concrete
   Requirement/Decision evaluation validates association and eligibility, compares
   relevant facts, and honors expiration with explicit context. Native facts-only
   helpers retain their scope; no lifecycle claim is made without history.
2. [APPROVAL-VALIDITY-013](../../spec/approvals/validity.md): validate expiration
   context for all currently considered matching Decisions before aggregation,
   including stale facts/revisions. Unrelated, withdrawn, and superseded evidence
   is excluded from this context requirement but still structurally validated.
3. [APPROVAL-VALIDITY-014](../../spec/approvals/validity.md): validate committed
   history in declared local order, with unique resolvable Decision targets and
   successors, distinct supersession references, and no repeat/conflicting
   targets. Requirement references remain opaque; no registry is invented.
4. [ENTITY-IMPORT-011](../../spec/entities/import.md): accept complete standalone
   mapping when Source Identity is omitted, preserve the mapping, and synthesize
   no Source Identity. Explicit null/malformed Source Identity remains invalid.

No semantic decision remains open for these regressions. Implementation and
public API synchronization are still required before release.

### Compatibility and synchronization assessment

Existing-obligation clarifications preserve all requirement, error, operation,
and vector IDs. Constructor validation applies existing domain invariants to
native APIs; it preserves valid Decimal inputs and documented constructor
signatures where practical. Rejection of previously accepted invalid native
values is an observable API tightening, even though native signatures are not
the portable compatibility surface. Correct portable error selection replaces
runtime exceptions or errors contrary to already-specified priority; it does
not change a previously conforming error mapping. Regression additions for
these rules fall under SPEC-COMPATIBILITY-013, not new financial policy.

The four accepted decisions select previously unsettled outcomes or expand a
documented fixture contract. This is corrective normative/contract work
under SPEC-FREEZE-001 and SPEC-COMPATIBILITY-012/014, not editorial work. New
obligations need distinct stable requirement IDs; existing IDs cannot be reused
for materially different meaning. Fixture requiredness and expiration scope
must be explicitly documented. No canonical operation is repurposed; Approval,
redaction, creation/import and serializer labels remain conformance-local.
Manifest/vector syntax stays 0.1 because these decisions do not change its
structural format. No blanket backward-compatibility claim is made for them.

SPEC-FREEZE-002 requires accepted normative corrections to land with affected
implementation, tests/conformance, public documentation, and Agentic metadata
in the same change. The branch now contains the accepted specification and
regressions; Milestones 5 and 7 must complete implementation, adapter, and public
API synchronization before the corrective change can satisfy SPEC-FREEZE-002
or be released. The intentionally red Milestone 2 baseline is not that closure.

CoreDoc review found no proposed foundation change: CORE-001 monetary validity,
CORE-002 declared control/atomicity, CORE-003.4 redaction authority, CORE-004
Approval evidence, and CORE-005 identity/presence/context already govern these
findings. CoreDoc version fields remain unchanged. Agentic descriptors clarify
existing Workflow priority and Entity evolution presence; no capability is
added or claimed corrected. README implementation claims, JSDoc, regression
tests, coverage, and mutation gates change with their owning implementation
milestones. Milestone 2 changes tests, fixtures, and their discovery, with no implementation
or public API changes. No release note or AGENTS.md change is needed; no release
verification is claimed.

Traceability now reopens affected requirement rows and distinguishes native
constructor/sequence boundaries from existing JSON mappings. See the current
[coverage inventory](../../conformance/traceability.md#core-096-reassessment).
Historical 0.9.5 completion is preserved as evidence of that release only.

Historical Milestone 1 validation passed `npm run docs:check` and
`git diff --check`, retaining 413 requirements and 667 vectors with 263 COVERED,
62 PARTIAL, 83 NOT DIRECTLY TESTABLE, and five BLOCKING SPEC GAP rows for four
then-open decisions. Milestone 2 supersedes that inventory and records fresh
runtime results below. Historical results are not new release verification.

## Milestone 2 — Permanent regressions and boundary inventory

- [x] Inventory supported public constructors, parsers/importers, serializers,
      operations, and history reuse paths across all three implementations.
      Map findings to native tests, portable vectors, adapter tests, and targeted
      mutation probes as appropriate. Keep mappings in this plan and existing
      traceability/test artifacts rather than a new audit-report system.
- [x] Reproduce every finding and lettered subcase with a failing permanent
      regression against the defective candidate and an independently passing
      valid control. Assert exact portable codes and observable outcomes.
- [x] Add specification-derived JSON vectors to manifest-listed files where
      behavior is portable. Use native tests for Decimal construction, Java
      records, ownership, unsupported native values, and public overloads.
- [x] Apply the matrix below to relevant entry points, including boundaries
      adjacent to each finding. Use deterministic representative cases and
      meaningful combinations, not an indiscriminate Cartesian product.
- [x] Compare equivalent portable inputs after a JSON round trip. Classify
      differences against `/spec`, including agreement on incorrect behavior;
      no implementation is the expected-result oracle. Treat native sparse
      arrays and unsupported objects separately from JSON fixtures.
- [x] Add sequence tests that pass actual returned values through record,
      lifecycle changes, evaluation, observation/import, and subsequent calls.
      On failure assert unchanged source values, bindings, Decisions, lifecycle
      history, evolution relations, and Audit history where applicable.
- [x] Review adjacent discrepancies for a governing requirement before fixing
      them. Record any additional confirmed mandatory gap and its regression
      here; do not silently expand scope or dismiss it because existing tests pass.

| Dimension | Minimum relevant coverage |
| --- | --- |
| Entry point | Native constructor, portable parser/import, adapter, observation/serialization, subsequent operation. |
| Presence | Omitted, explicit null, empty value, correctly typed value, wrong scalar/container type. |
| Evidence | Explicit `PENDING` versus missing State; false effectiveness versus absent effectiveness; valid lifecycle versus malformed history. |
| Context | Not required, required and absent, malformed, valid, exact expiration boundary, equivalent offsets, accepted fractional precision. |
| Validation order | Single failure, interacting categories with specified priority, decisive early outcomes, later branches/stages, reordered Decisions. |
| Ownership and reuse | Original inputs, returned observations, repeated reads, actual output fed into the next operation, unchanged state on failure. |
| Runtime | TypeScript, Python 3.12 and 3.13, Java; include installed package consumers for corrected native surfaces. |

Completion: every finding has a demonstrated failing regression and valid
control. The expanded tests may remain red until their owning fixes land; do
not weaken expectations or describe this milestone as release verification.

### Milestone 2 boundary inventory and results

The permanent native suites are
[TypeScript](../../implementations/typescript/core/test/integration/construction-evaluation-regressions.test.ts),
[Python](../../implementations/python/core/tests/test_construction_evaluation_regressions.py), and
[Java](../../implementations/java/core/src/test/java/org/finkore/ConstructionEvaluationRegressionTest.java).
They call public cores directly. The
[TypeScript adapter test](../../implementations/typescript/adapters/conformance/test/construction-evaluation-regressions.test.ts)
and real runner executions on all runtimes exercise representation translation
separately. Every new JSON file is in the normal manifest; native tests are in
normal Vitest, unittest, Java entry-point, and Maven test discovery. Nothing is
skipped, marked expected-failure, or inverted to make the defective code pass.

| Public surface | TypeScript | Python | Java | Exercised boundary / remaining correction work |
| --- | --- | --- | --- | --- |
| Money construction and observation | `Money.from`, `applyRate`, `toJSON`; private constructor | `Money(Decimal, currency)`, `from_portable`, `apply_rate`, `to_portable` | `Money.fromPortable`, `applyRate`, `toPortable`; private constructor | Direct Python amount/currency matrix, finite Decimal arithmetic/serialization controls, portable Rate kinds on every core and adapter. Existing rounding/allocation suites remain in discovery; corrective package-consumer/mutation checks belong to M3. |
| Workflow definitions and instances | `Workflow.create/from/import`, `transition`, `toJSON` | `WorkflowDefinition` / `WorkflowInstance`, portable parsers, `create_workflow`, `import_workflow`, `transition_workflow` | `Workflow.Definition` / `Instance` / `Transition` records, portable parsers, `create`, `importInstance`, `transition` | Direct definition construction, initial/terminal/duplicate/endpoint/version faults, owned valid definition → create → observe/import → transition. Portable import/transition pair observed revision with version mismatch and invalid definition. Existing guard/binding suites retained; adjacent instance/Transition constructor corrections remain M4 review. |
| Approval concrete values and evaluation | `ApprovalDecision.evaluate`, `ApprovalDecisionHistory.create/record/evaluateRequirement`; `evaluateEffectiveness` remains facts-only | `record_decision`, `evaluate_decision`, `evaluate_requirement` | `Approvals.recordDecision/evaluateDecision/evaluateRequirement`; five-argument Decision evaluation validates the Requirement | M5 implements concrete subject/association/eligibility, facts, and exact expiration directly in cores and tests every Decision vector natively and through adapters. Existing separate helper semantics remain documented. |
| Approval history reuse | history `toJSON/create/withdraw/supersede/supersedeRequirement` | `withdraw_decision`, `supersede_decision`, `supersede_requirement` | `Approvals.importHistory/withdrawDecision/supersedeDecision/supersedeRequirement` | Actual record → withdraw → reconstruct → record → evaluate outputs; malformed committed history reused through all five Python/Java operations and TS reconstruction. Decisions and lifecycle remain unchanged on failure. |
| Composition and chain | `ApprovalComposition.from/evaluate`, `ApprovalChain.from/evaluate` | `evaluate_composition`, `evaluate_chain` | `Approvals.evaluateComposition/evaluateChain` | State/applicability/context presence and type matrix, specified priority, nested/later-stage evidence, empty/false/missing effectiveness quorum controls. Lightweight observations do not gain concrete Requirement fields. |
| Audit | `AuditLog.create/events/redact` | `redact_history` | `Audit.Log.create/events/redact` | Authority declaration matrix, valid evidence append, unchanged source/history on rejected redaction. Existing append/serialize/ownership cases retained. |
| Entity import/observation/evolution | `FinancialEntity.from/import/toJSON`, `EntityEvolutionHistory.create/toJSON/correct/reverse/void/supersede` | `import_entity`, `evolve_entity` | `Entities.importEntity/evolve` | Source Identity presence with mapping; all four evolution kinds with supplied null/malformed/mismatch State and revision. Returned relations and Audit history feed the next evolution; source/history snapshots prove failure atomicity. Other public overloads retain existing native coverage and M7 correction review. |

The 177 additions comprise 9 Money, 18 Workflow, 8 Audit, 105 Approval, and
37 Entity vectors. The following representative cases map each original finding;
full matrices and all 22 distinct independently passing control IDs are recorded
by each vector's `reviewFinding` and `pairedControl`. Portable names below are full stable vector IDs. Native names are literal test
names. Existing vectors and expectations remain
unchanged; adapter suite counts increase only for newly registered vectors.

| Finding | Representative regression | Passing control | Reproduced failure / correction mutation target |
| --- | --- | --- | --- |
| 1 | `approval.boundary096.state-any-of-absent-001` | `approval.boundary096.state-any-of-control-001` | Python/Java infer missing State; remove required-evidence validation (M5). |
| 2 | Python `test_money_constructor_nan` and `test_money_currency_empty` | `test_money_decimal_controls` | Python exposes invalid native Money; bypass constructor validation (M3). |
| 3 | Python `test_workflow_constructor_initial`; Java `workflow.native.constructor-initial` | `test_workflow_native_control`; `workflow.native.control` | Python/Java expose invalid definitions; bypass shared definition validation (M4). |
| 4 | `audit.boundary096.authority-absent-001` | `audit.boundary096.authority-control-001` | Python accepts absent authority; remove authority validation (M6). |
| 5 | `approval.boundary096.context-invalid-001` | `approval.boundary096.context-control-001` | All runtimes accept malformed required instant; bypass timestamp parsing (M5). |
| 6a | `approval.boundary096.decision-subject-empty-001` | `approval.boundary096.decision-control-001` | TypeScript/Java accept invalid concrete Requirement; omit concrete validation (M5). |
| 6b | `approval.boundary096.decision-expiry-after-001` | `approval.boundary096.decision-control-001` and `approval.boundary096.decision-expiry-before-001` | TypeScript ignores expiration; bypass expiration or change exact boundary (M5). |
| 7a | `approval.boundary096.history-evaluate-unknown-kind-001` | `approval.boundary096.history-control-001` | Python/Java accept unknown committed kind; bypass history validation (M5). |
| 7b | `approval.boundary096.history-evaluate-missing-target-001` | `approval.boundary096.history-control-001` | Python/Java accept unresolved target; skip target uniqueness/relationship validation (M5). |
| 8 | `approval.boundary096.complete-context-reject-first-001` | `approval.boundary096.complete-context-control-001` | TypeScript short-circuits required context; return outcome before validating considered evidence (M5). |
| 9a | `money.boundary096.rate-kind-object-001` | `money.boundary096.rate-control-001` | Python raises TypeError; remove type validation before membership (M3). |
| 9b | `approval.boundary096.chain-state-absent-001`, `approval.boundary096.applicability-null-001` | `approval.boundary096.chain-control-001`, `approval.boundary096.state-any-of-control-001` | Java raises NullPointerException; Python container cases raise TypeError; bypass explicit evidence/applicability validation (M5). |
| 9c | `entity.boundary096.evolution-correct-expectedsourcerevision-null-001` | `entity.boundary096.evolution-correct-control-001` | Java raises NullPointerException; erase supplied precondition presence (M7). |
| 10a | `workflow.boundary096.import-revision-empty-before-mismatch-001` | `workflow.boundary096.import-mismatch-control-001` | TypeScript reports mismatch before invalid revision; reorder instance and binding validation (M4). |
| 10b | `entity.boundary096.import-source-null-001` | `entity.boundary096.import-control-001` | Python/Java accept supplied null; conflate omission with malformed identity (M7). |

These are targets for the existing portable critical and native mutation tools
(`docs/tools/mutation-critical.js` and `docs/tools/mutation-native.js`) in the
owning fixes. The new vector tags/requirements and named native cases provide
permanent selection points. Mutation testing cannot establish defect detection
against an already red baseline; no mutation score or coverage closure is claimed
here. Installed-package consumer checks also remain with the corrected surfaces.

Adjacent confirmed mandatory defects stay within the same findings: Python and
Java mishandle explicit null observed Workflow revisions before version mismatch;
all runtimes return incorrect applicability errors in composition cases (with
Python sometimes inferring applicability and Java crashing on null); Python
raises AttributeError for several malformed Source Identity shapes. Accepted
context and supersession boundaries also expose additional failures. None was
fixed or dismissed by cross-language agreement. JSON files are parsed normally
on every runtime; native Decimal/type tests remain separate from JSON values.

Fresh full-manifest results against the unfixed candidate:

| Runtime | PASS | FAIL | INFRASTRUCTURE_ERROR | UNSUPPORTED |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 800 | 44 | 0 | 0 |
| CPython 3.12 | 779 | 51 | 14 | 0 |
| CPython 3.13 | 779 | 51 | 14 | 0 |
| Java | 776 | 54 | 14 | 0 |

All 667 original vectors and all 22 distinct paired controls pass on all four
runtimes. Infrastructure outcomes above are uncaught implementation exceptions,
not accepted domain errors. The full TypeScript run passes all 130 runner tests
and 972 of 1,000 core tests (28 new failures); adapter discovery has 18 passing
and two failing tests after count synchronization. Python discovery runs 415
tests on each version and reports 79 failures plus 14 errors, including subtest
failures. Java's previous test entry points pass; its new native suite runs 175
cases, with 104 passing and 71 failing. Valid native constructor and returned
history controls pass. These red outcomes are the intended Milestone 2 result.

Reproduce from the repository root with the checked toolchain:

```sh
npm run tools:check
npm run build
npm test
npm run python:unit
npm run python:unit:3.13
npm run java:test
npm run conformance:typescript
npm run conformance:python
npm run conformance:python:3.13
npm run conformance:java
```

Run each command independently because the red suites return nonzero status.
The aggregate `npm run conformance` stops after the first failing runtime.
No temporary probe or generated report is required for test discovery.

Build, strict TypeScript (including the new tests), Java compilation, toolchain,
architecture, developer-tool tests, documentation/traceability, license, and
whitespace checks pass. The completion review required specification,
conformance, unit/adapter tests, test discovery, and README updates, all included.
No production API, JSDoc, canonical Agentic descriptor, CoreDoc obligation, or
AGENTS.md rule changes were needed. Critical mutation targets are mapped above;
execution and coverage closure await green implementation fixes.

## Milestone 3 — Money native validity and portable rejection

- [x] Validate Python native Money amount and currency before an invalid Money
      value can escape. Cover quiet/signaling NaN, both infinities, empty/invalid
      currency, and unsupported native amount types under the agreed API contract.
- [x] Preserve valid finite Decimal construction, including exponent forms,
      signed zero, negative values, trailing zeros, and retained presentation
      scales. Construction and subsequent arithmetic/serialization must preserve
      exact value independently of the caller's Decimal context.
- [x] Correct Rate type validation so `kind: {}` and analogous unsupported
      scalar/container forms produce the Money portable error instead of a
      Python hashing exception. Review neighboring rounding and allocation
      enum/container boundaries without adding limits or rounding defaults.
- [x] Retain 0.9.5 exact serialization, invalid-scale, loss-rejection, and explicit
      round-then-serialize regressions; constructor validation must not weaken them.
- [x] Run focused native/unit, Money conformance, coverage, and mutation checks
      on affected implementations, including Python 3.13. Update public API docs
      and package consumer cases for the direct constructor boundary.

Completion: findings 2 and 9a fail portably, valid native values remain usable,
and invalid construction cannot later emit invalid portable Money.

### Milestone 3 results

Findings 2 and 9a are corrected in the Python core. `Money.__post_init__`
validates a finite native `Decimal` and a valid currency before exposing the
value; portable construction shares that validation. No coercion or Decimal
arithmetic is used by validation, so finite exponent forms, signed zero, trailing
zeros, retained presentation scale, and exact arithmetic remain supported.
Presentation-scale validation still occurs at serialization, including exact
reduction, invalid-scale rejection, and explicit round-then-serialize behavior.
Rate kinds are type-checked before enum membership, returning the specified
Money error for malformed containers without changing the source.

The pre-fix focused Milestone 2 cases reproduced 16 constructor failures and two
Rate TypeErrors in 26 tests. They now pass. Additional permanent unit cases
verify rejection without changing Decimal flags/traps and the adjacent Rate,
rounding, and allocation scalar/container boundaries. Those neighboring paths
already reject invalid input portably and needed no production change. Existing
0.9.5 serialization and exact-arithmetic tests remain unchanged.

| Verification | Result |
| --- | --- |
| Focused Money unit/native tests | 53 pass on CPython 3.12 and 3.13. |
| Real Money conformance | 111/111 pass on both versions, zero FAIL/UNSUPPORTED/INFRASTRUCTURE_ERROR. |
| Money coverage | 96% with branches enabled, measured across focused native tests and real Money vectors; no source lines excluded. |
| Portable Money mutation | 11/11 killed on each version, including three new Rate validation/error probes; paired controls pass. |
| Native Money mutation | 17/17 killed on each version, including ten new constructor validation/exactness/error probes and seven retained serializer probes; paired controls pass. |
| Installed artifacts | Updated consumer passes for wheel and sdist on Python 3.12/3.13; TypeScript and Java consumers also pass in the existing package check. Nothing published. |
| Adapter regression | All 340 existing Python adapter tests pass. |
| Full Python unit discovery | 417 tests on each version; remaining 63 failures and 12 errors belong to later milestones. No Money failure remains. |
| Full Python conformance | 781 PASS, 51 FAIL, 12 INFRASTRUCTURE_ERROR on each version. All 667 original vectors pass; the two Rate infrastructure defects are gone. |

All 28 selected Money probes are killed on both versions (100% of these targeted
probes); this is not an exhaustive mutation score for every Python statement.
The full suites remain red because Milestones 4–7 are unimplemented. No expected
failure, skip, exception remapping, or weakened expectation hides those defects.
The nine reopened Money traceability rows are COVERED; the inventory now has
272 COVERED and 62 PARTIAL requirements, with all 417 IDs and 844 vectors retained.

Focused verification commands, from the repository root after `npm run build`
and the local toolchain/coverage environment setup:

```sh
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -k money
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -k money
npm run conformance:python -- --suite money
npm run conformance:python:3.13 -- --suite money
node docs/tools/mutation-critical.js python money
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-critical.js python money
node docs/tools/mutation-native.js python-money
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-money
node docs/tools/check-packages.js
```

For scoped coverage, use a fresh coverage data path and run the focused unittest
selection with `coverage run --branch --parallel-mode --source=finkore.money`.
Run the real runner with `--suite money`, the same `COVERAGE_FILE`,
`FINKORE_PYTHON_PATH=.tools/python-coverage/bin/python`, and
`FINKORE_PYTHON_COVERAGE_RCFILE=implementations/python/core/pyproject.toml`.
Combine those measurements and report `--include='*/finkore/money.py'` with
`--fail-under=95`. This measures the corrected module while preserving the full
coverage gate for the later release milestone.

Completion review: unit tests, mutation probes, package consumers, Python API
docstrings, README status/usage, plan, and traceability were updated. Existing
Milestone 2 vectors already express the normative defects and were retained.
No specification, error ID, operation ID, Agentic descriptor, architectural
boundary, CoreDoc obligation, or AGENTS.md rule changes were needed. Build,
strict TypeScript, Python compilation on both versions, toolchain, architecture,
developer-tool tests, documentation/traceability, license, and whitespace checks
pass. Full release verification remains pending.

## Milestone 4 — Workflow construction and validation precedence

- [x] Enforce definition validity for direct Python/Java construction as well
      as portable parsing. Cover unique declared States, a declared initial
      State, valid terminal declarations, Transition endpoints, guards, and
      version identity structure under existing requirements.
- [x] Exercise valid and invalid native definitions through create, import,
      and transition; no public path may create an undeclared current State.
      Review native instance/Transition constructors for the same bypass family.
- [x] Correct TypeScript import/transition validation so malformed revision or
      instance structure precedes version mismatch under `WORKFLOW-ERROR-007`.
      Pair each combined-failure case with valid-structure mismatch controls.
- [x] Cover the specified failure hierarchy, including malformed observed
      revision versus malformed expected revision. Preserve their distinct
      invalid-instance/state-conflict meanings and omission/null handling.
- [x] Preserve owned definitions/guards/bindings and versioned Entity sequences
      from 0.9.5. Reuse validation without deriving historical binding from the
      current definition or introducing Workflow migration.
- [x] Run affected native/unit, Workflow and Entity integration conformance,
      coverage, and mutation checks. Update public constructor and error docs.

Completion: findings 3 and 10a are corrected across direct and portable APIs,
with correct primary errors and unchanged instances on failure.

### Milestone 4 results

Findings 3 and 10a are corrected. Python and Java definition constructors now
validate declaration containers, unique States, initial/terminal membership,
Transition endpoints and terminal restrictions, and version pairs before exposing
an owned definition. Existing guard validation/copying remains in force. Native
Transition endpoints and instance structure are also validated. Portable parsing
uses these constructor boundaries; no adapter implements financial validation.

Native optional None/null binding and revision retain their omission meaning.
Portable supplied null revision/binding is malformed input, not omission.
TypeScript validates the complete observed instance before checking binding
mismatch or State membership. A malformed observed revision is INVALID_INSTANCE;
a malformed expected revision remains STATE_CONFLICT at transition time. No
binding is inferred, changed, or migrated. Existing returned-value, nested guard,
versioned Entity, and failure-atomicity regressions remain intact.

The pre-fix runs reproduced 24 TypeScript Workflow regression failures and 21
Java constructor/portable failures; Python reproduced constructor, native-shape,
and null-revision failures. Fourteen permanent portable cases extend single-State
structure and observed-revision/binding presence coverage. Their expected results
come from WORKFLOW-ERROR-005/007 and existing fixture observation conventions.
Invalid-instance fixtures return an error without manufacturing a valid instance
observation; native tests independently assert unchanged input. No pre-existing
vector expectation or stable identifier changed.

| Verification | Result |
| --- | --- |
| Workflow conformance | 135/135 PASS on TypeScript, CPython 3.12, CPython 3.13, and Java; zero unsupported/infrastructure outcomes in this domain. |
| Native and integration tests | 73 focused Python Workflow cases pass; both full Python versions retain no Workflow failures. Java's 52 construction/priority cases pass alongside existing Workflow/ownership suites. TypeScript's 244 scoped Workflow/retained-boundary tests pass. |
| TypeScript changed-module coverage | `workflow.ts`: 98.66% lines, 98.90% branches. |
| Python Workflow coverage | 96.02% statements, 92.75% branches across native tests and real Workflow vectors; no exclusions. |
| Java Workflow coverage | 96.03% lines, 84.82% branches across JUnit/native tests and real Workflow vectors using the same Maven-compiled classes. |
| Portable critical mutation | Python 16/16 killed on each version; Java 18/18 killed, with paired controls passing. Includes observed-null-revision regression probes. |
| Native critical mutation | 22/22 Workflow probes killed across TypeScript/Python/Java; the ten Python probes also pass on 3.13. Includes twelve constructor probes and a TypeScript priority-reversal probe. |
| TypeScript Stryker | 97.00% for the changed `workflow.ts`: 226 killed, six equivalent survivors, one unreachable fallback, zero errors/timeouts. |
| Installed consumers | npm, Java JAR, Python wheel and sdist on 3.12/3.13 pass constructor, binding, priority, and retained earlier checks. Nothing published. |

Stryker survivors were reviewed, not suppressed. Three mutations to the null
shortcut still yield the same result via the remaining null/type/record checks.
Removing the preliminary type comparison also leaves the primitive, array, and
record branches rejecting mismatched types. The two record-condition mutations
are equivalent after null, primitive, array, and differing-type cases have
returned. The final fallback is unreachable when one compared value is validated
guard JSON. No critical validation, state mutation, binding, error-priority, or
guard-result mutant survives; no exclusions or ignore annotations were added.

All 667 original vectors still pass on all runtimes. The complete manifest has
858 vectors and retains only known Milestone 5–7 defects:

| Runtime | PASS | FAIL | INFRASTRUCTURE_ERROR |
| --- | ---: | ---: | ---: |
| TypeScript | 826 | 32 | 0 |
| CPython 3.12 / 3.13 (each) | 797 | 49 | 12 |
| Java | 792 | 52 | 14 |

All 249 Entity vectors were executed as integration checks: remaining failures
are the previously recorded Source Identity/standalone-mapping/evolution cases,
not Workflow regressions. Full unit discovery likewise retains later-milestone
failures: TypeScript 16 of 1,018 core tests; Python 54 failures and 12 errors in
433 tests on each version; Java 62 failures in its 201-case expanded regression
entry point. Earlier Java entry points and all 130 runner tests pass. The two
TypeScript adapter tests for the still-defective expanded suites remain red.

Reproduce focused checks from the repository root after toolchain/build setup:

```sh
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -k workflow
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -k workflow
npm run conformance:typescript -- --suite workflow
npm run conformance:python -- --suite workflow
npm run conformance:python:3.13 -- --suite workflow
npm run conformance:java -- --suite workflow
node docs/tools/mutation-critical.js python workflow
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-critical.js python workflow
node docs/tools/mutation-critical.js java workflow
node docs/tools/mutation-native.js workflow
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-workflow
npm run test:mutation -w @finkore/typescript -- --mutate src/workflow/workflow.ts --testFiles 'test/workflow/*.test.ts,test/integration/readiness-regressions.test.ts,test/integration/boundary-regressions.test.ts' --concurrency 2
.tools/bin/mvn -f implementations/java/core/pom.xml -Dtest=WorkflowCoverageTest test
node docs/tools/check-packages.js
```

Coverage uses the same scoped native/real-vector procedure as Milestone 3 for
Python, selecting `workflow`. Java combines the JUnit JaCoCo data with real
Workflow vectors using Maven's compiled core classes first on the classpath;
TypeScript coverage runs the same eight test files as the scoped Stryker run.
The full coverage/mutation release commands retain their complete scope and
remain pending while unrelated domains are red.

Completion review updated native/unit/adapter-discovered cases, portable vectors,
critical mutation probes, installed consumers, public JSDoc/docstrings, package
READMEs, root status, and traceability. All 14 reopened Workflow rows are COVERED:
417 requirements now comprise 286 COVERED, 48 PARTIAL, and 83 NOT DIRECTLY
TESTABLE, with no blocking specification gap. No new financial rule, error code,
operation ID, Agentic effect, CoreDoc obligation, or AGENTS.md rule was needed.
Build, strict TypeScript (including new tests), Java compilation, Python
compilation on both versions, toolchain, architecture, developer-tool tests,
documentation/traceability, license, and whitespace checks pass. Full release
verification remains pending.

## Milestone 5 — Approval evidence, history, and evaluation

- [x] Reject missing required member State instead of inferring `PENDING`.
      Test ALL_OF, ANY_OF, quorum-related boundaries, nested alternatives, and
      later stages, including otherwise decisive approval/rejection results.
      Explicit valid `PENDING` and empty valid effective-vote sets remain valid.
- [x] Validate required evaluation timestamps with the shared portable profile.
      Cover absent/null/empty/wrong types, invalid dates/offsets, excessive
      fractional precision, and valid offset/nanosecond boundary controls.
- [x] Implement the Milestone 1 Decision evaluation contract consistently in
      cores and adapters. Test concrete subject/eligibility/association, changed
      facts, missing or malformed expiration context, and exact expiration.
      Preserve separately documented fact-comparison helpers as agreed.
- [x] Validate imported lifecycle discriminators, shape, references, and agreed
      duplicate/supersession constraints before reuse. Cover record, withdraw,
      supersede, history reconstruction, and evaluation. Do not drop invalid
      entries or lose valid lifecycle evidence during normalization.
- [x] Remove outcome-dependent skipping of required context checks. Exercise
      rejection before/after a considered expiring Decision, both without and
      with valid context; test excluded evidence according to the agreed scope.
- [x] Correct missing/null/malformed chain and composition values before set
      membership, casting, or iteration. Include Java missing State/null
      applicability and Python unhashable enum/container cases. Keep portable
      error priority stable across member and stage order.
- [x] Test actual record → withdraw/supersede → record → evaluate sequences,
      valid imported histories, multiple Requirements, and failure preservation
      of both Decision and lifecycle histories in every runtime.
- [x] Run focused unit/native/adapter tests, Approval conformance, coverage,
      and mutation checks; update API docs, fixture conventions, traceability,
      package examples, and Agentic metadata only where applicable. Do not
      promote conformance-local Approval operations to canonical IDs.

Completion: findings 1, 5, 6a/6b, 7a/7b, 8, and 9b are resolved. Incomplete
required evidence cannot produce a successful outcome, and complete valid
evidence produces the agreed result consistently across runtimes.

### Milestone 5 implementation and verification

The three cores now reject incomplete applicable composition State, unresolved
applicability, and malformed required timestamps before deriving outcomes.
Validation follows structure, applicability, context, then state/effectiveness
priority across branches and stages. Explicit PENDING, inapplicability, and empty
valid vote sets retain their specified meanings. Python avoids hashing untrusted
JSON enum values; Java validates values before null-sensitive set membership.

Concrete Decision evaluation validates subject, eligibility, association, facts,
and exact expiration: TypeScript adds `ApprovalDecision.evaluate`; Java adds the
five-argument `Approvals.evaluateDecision`; Python corrects `evaluate_decision`.
The TypeScript facts-only method and legacy Java helper retain separate scopes.
Every considered expiring Decision requires context before decisive outcomes;
unrelated and lifecycle-excluded evidence imposes no expiration-context demand.

Python and Java reconstruct lifecycle evidence through core validation of kinds,
field structure, unique references, and local-order supersession constraints.
Java exposes `Approvals.importHistory`; adapters use core reconstruction before
reporting committed error observations. Native returned-history sequences cover
withdrawal, supersession across Requirements, record, reconstruction, evaluation,
and preservation on errors. No same-Requirement successor, global graph, registry,
or timestamp-order rule was added.

Final contract review found that Decision references were still comparing
`decidedAt` lexically. Five permanent vectors first reproduced offset failures,
then verified exact-instant lookup, ambiguity, self-supersession, nanosecond
separation, and original timestamp spelling. Approval now has 272 vectors; the
manifest has 863, preserving all original 667 vectors. One older TypeScript
assertion expecting INVALID_CHAIN for malformed applicability was corrected to
CONDITION_UNRESOLVED under APPROVAL-COMPOSITION-009 and APPROVAL-ERROR-010.

Validation results:

- Build, strict TypeScript (including the new native tests), tools, architecture,
  documentation, license checks, and local npm/wheel/sdist/JAR consumers pass.
- All 272 Approval vectors pass on TypeScript, Python 3.12/3.13, and Java, with
  no unsupported operations or infrastructure errors in this domain.
- Focused TypeScript Approval tests: 164 pass; scoped coverage is 99.81% lines,
  100% branches and functions. Python has 176 focused Approval tests; Java's
  construction/evaluation suite has 118 passing Approval cases, alongside the
  existing Approval native/vector coverage tests.
- TypeScript Approval mutation: 98.07%, 1,243 mutants (1,213 killed, six timed out,
  22 surviving and two uncovered). No critical financial survivor remains.
  The survivors/uncovered paths are explained below; none were excluded.
- Python portable critical probes: 35/35 killed on both 3.12 and 3.13; Java:
  31/31 killed, with independent controls passing. Runtime exceptions were not
  counted as kills. The list/envelope association probes now remove only required
  fact presence while retaining other shape checks, so an unrelated malformed
  fixture cannot turn their result into an infrastructure failure.
- Python branch-enabled Approval coverage is 90% (395/432 statements covered).
  Combined Java native/vector coverage is 92.19% lines (496/538) and 83.07%
  branches (427/514). These are scoped reports; complete coverage/mutation
  release gates remain pending the other domain fixes.
- Python adapter tests pass 340/340 on each version; Java adapter tests pass
  343/343. TypeScript runner tests pass 130/130, core tests pass 1066/1067,
  and adapter tests pass 19/20; the remaining TypeScript failures are Entity
  standalone-mapping regression checks. Python full unit tests retain eight
  Audit/Entity failures and four Entity runtime errors; Java native failures
  remain in Entity source identity and null evolution preconditions.
- Eight native Approval probes pass; the Python subset also passes on 3.13.
- Full manifest: TypeScript 862 PASS/1 FAIL; Python 3.12/3.13 each 851 PASS/8 FAIL/
  4 INFRASTRUCTURE_ERROR; Java 854 PASS/1 FAIL/8 INFRASTRUCTURE_ERROR. All failures
  are the recorded Milestone 6 Audit and Milestone 7 Entity defects. Complete
  unit/adapter suites remain red for those same boundaries; focused Approval
  results do not establish whole-core conformance.

Remaining Stryker mutations are observationally equivalent at these public
boundaries: redundant timestamp type guards still feed the strict parser;
substituting one invalid fallback timestamp for another preserves INVALID_CONTEXT;
removing a false return from the context predicate leaves a falsy value; the
Requirement-supersession kind guard is redundant with its exclusive target field;
an absent-vote sentinel is filtered as ineffective; collecting an undefined
state-Requirement identifier for a child group cannot match a declared identity;
optional outcome guards are redundant with validated distinct mapped outcomes;
an internal quorum applicability field is unused; a rejecting quorum member's
alternative non-APPROVED/non-PENDING marker preserves the same count and capacity;
extra actionable data on a nonpending member is ignored; omitted false
applicability fields and stage filtering/approved-stage markers preserve the same
public outcome and actionable set. The two uncovered lifecycle serialization
catch mutants cannot execute for internally validated cloneable events. These
are not exclusions, and no public evidence/context/history-validation bypass was
accepted as equivalent.

The 30 reopened Approval rows and six shared timestamp rows are covered. The
inventory is 417 requirements: 322 COVERED, 12 PARTIAL, 83 NOT DIRECTLY TESTABLE,
and zero blocking specification gaps. Public API documentation, package examples,
fixture conventions, traceability, root/package status, and corrective spec notes
are synchronized. Agentic operation IDs/metadata, CoreDoc normative rules,
AGENTS.md, and release notes need no change: this milestone adds no canonical
operation or architectural dependency and does not complete the release.

## Milestone 6 — Audit redaction policy validation

- [x] Validate Python redaction authority before producing a redacted view or
      appending evidence. Apply the agreed portable redaction error to missing,
      null, empty, and malformed declarations.
- [x] Pair invalid policy cases with valid actor-context and ordinary Change
      redactions. Preserve event identity, Actor attribution, relationships,
      timestamps, redacted-versus-absent distinctions, and evidence Events.
- [x] Assert unchanged committed source history and candidate evidence on
      failure; verify returned observations cannot mutate retained content.
      Preserve native numeric ownership and cycle rejection from 0.9.5.
- [x] Run Audit native/unit tests, portable conformance, coverage, and mutation
      checks, including Python 3.13. Update policy API docs and relevant examples.

Completion: finding 4 is corrected without adding authorization infrastructure
or changing the meaning of valid policy-authorized redaction.

### Milestone 6 implementation and verification

Python core validates `policy.authority` as a nonempty string before producing
any redacted representation or evidence. Missing, null, empty, Boolean, numeric,
list, and dictionary declarations return FINKORE_AUDIT_REDACTION_INVALID. The
existing specification, policy fields, opaque authority meaning, and adapter
boundary are unchanged; no lookup, policy-ID requirement, or authorization
infrastructure was added.

The seven existing portable regressions first failed against the old core.
New native tests also failed for absent and malformed authority, then passed
after the core correction. Valid controls cover Actor metadata and ordinary
Change redaction, exact preservation of identity, attribution, timestamps and
relationships, null/absent/redacted distinctions, repeated use of returned
history, and unchanged history/policy/evidence on rejection. Returned views,
history, and evidence cannot modify the caller's inputs. Three older successful
redaction/cycle fixtures now supply valid authority; their original assertions
and portable cycle error expectations were preserved.

Verification:

- All 84 Audit vectors pass on TypeScript, Python 3.12/3.13, and Java, with zero
  unsupported operations or infrastructure errors in the Audit domain.
- Python 3.12 and 3.13 each pass 27 focused Audit tests, including native cycle,
  numeric/Boolean, shared-container ownership, and policy regressions.
- Python portable critical mutations: 9/9 killed on each version, including
  missing, empty, truthy wrong-type authority and incorrect portable error probes.
- Cross-language native Audit mutations: 21/21 killed (Python 8, Java 11,
  TypeScript 2); Python's eight probes also pass on 3.13. New probes protect
  authority rejection, unchanged committed source content, and candidate-evidence
  ownership. Every probe has an independent passing control; no exclusions or
  runtime-exception kills were introduced.
- Python Audit branch-enabled coverage from native tests and real vectors is
  87%, above the configured 85% floor. This is scoped Audit coverage, not a
  claim that the complete release gate passes.
- Build, strict TypeScript, Python compilation, adapter tests, tool tests,
  architecture, documentation/traceability, license and whitespace checks pass.
  Local npm/wheel/sdist/JAR package consumers pass; the Python wheel/sdist
  consumers on both versions exercise invalid authority, valid redaction,
  ownership, and unchanged inputs.
- Full Python conformance on each version: 858 PASS, 1 FAIL, 4
  INFRASTRUCTURE_ERROR across 863 vectors. Full native suites have 443 tests,
  with one failure and four errors. All remaining failures are the recorded
  Entity Source Identity boundaries owned by Milestone 7. The other runtimes'
  complete-suite Entity failures remain outside this milestone.

AUDIT-REDACTION-001, AUDIT-REDACTION-006, and AUDIT-ERROR-001 are now COVERED.
Traceability retains 417 requirements and 863 vectors: 325 COVERED, 9 PARTIAL,
83 NOT DIRECTLY TESTABLE, zero blocking specification gaps. Existing conformance
vectors and conventions already define the corrected contract; no new vector
IDs, financial specification rules, portable errors, or Agentic operations were
needed. Native tests, mutation probes, Python API docs, installed examples,
READMEs, and traceability are synchronized. TypeScript JSDoc, CoreDoc, AGENTS.md,
and release notes need no change because their contracts, responsibilities, and
release status are unchanged. Milestone 7 and the final release gates remain open.

## Milestone 7 — Entity evolution and import presence

- [x] Replace Java null-sensitive evolution precondition checks with explicit
      presence-aware validation. Cover expected source State and Revision
      omission, null, malformed, matching, and mismatching values across
      Correction, Reversal, Void, and Supersession. Review currentness under
      its own Boolean/error contract rather than assigning it a string rule.
- [x] Return `FINKORE_ENTITY_STATE_CONFLICT` for the reviewed State/Revision
      mismatches. Failure must preserve source/related Entities, relation
      history, and Audit history, with no partial result or appended evidence.
- [x] Reject explicit null and other malformed Source Identity in Python/Java
      imports even when mapping exists. Cover source/mapping presence pairs,
      incomplete fields, source mismatches, and mapped Entity mismatches.
      Retain the separately agreed valid omission/mapping-only behavior.
- [x] Preserve opaque mapping values, stable identity, current/historical
      revisions, conflict tokens, and versioned Workflow bindings. Retain 0.9.5
      import-precondition and validator-declaration protections.
- [x] Exercise returned Entity import/evolution observations in later valid
      operations, including versioned Workflows. Confirm adapters expose core
      errors without repairing observations or crashing while normalizing them.
- [x] Run Entity native/unit/adapter and cross-domain conformance tests,
      coverage, and mutation checks; update public docs and affected examples.

Completion: findings 9c and 10b fail atomically with portable errors, while
valid import and evolution sequences remain usable across runtimes.

### Milestone 7 implementation and verification

Java evolution now checks expected source State/Revision presence and compares
against the validated observed value. Supplied null uses STATE_CONFLICT instead
of throwing NullPointerException. Python and Java validate supplied Source
Identity before consuming mapping evidence. TypeScript accepts complete
standalone mapping under ENTITY-IMPORT-011 without synthesizing Source Identity.
No adapter financial logic or operation identifier was added.

The pre-fix native suites reproduced Python's one failure/four runtime errors,
Java's ten Entity failures (including returned-history reuse), and TypeScript's
standalone-mapping rejection. An older TypeScript assertion requiring that valid
mapping to fail contradicted the Milestone 1 accepted requirement; it is replaced
by exact preservation and subsequent-use assertions, not removed as a workaround.
All 37 Milestone 2 Entity vectors remain unchanged.

Native tests exercise source/mapping presence pairs, incomplete source/mapping
fields, source and mapped-Entity disagreement, omitted source expectations for
all four evolution kinds, and malformed currentness under its Boolean contract.
Versioned mapping-only import → reimport → mutation → transition → Correction
sequences preserve opaque values, revisions, conflict tokens, and binding.
Returned evolution and Audit histories feed the next request; a null Revision
expectation fails without mutation, and the valid retry appends both histories.
Existing validator, import-precondition, and ownership protections remain active.

Verification results:

- Build, strict TypeScript (including changed tests), Python compilation on both
  versions, and Java warning-as-error compilation pass.
- Full TypeScript discovery passes 1,072 core, 130 runner, and 20 adapter tests.
  Python 3.12/3.13 each pass 445 unit tests and 340 adapter tests. Java passes all
  native entry points, including 232 construction/evaluation cases, and 343
  adapter tests.
- All 863 vectors pass on TypeScript, Python 3.12, Python 3.13, and Java:
  12 Shared, 111 Money, 135 Workflow, 84 Audit, 272 Approval, and 249 Entity cases.
  There are no FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR results.
- TypeScript Entity coverage is 100% lines/functions, 99.71% statements, and
  99.65% branches. Python Entity native-plus-vector branch-enabled coverage is
  91%. Java Entity native/vector coverage is 92.40% lines, 80.96% branches,
  92.36% instructions, and 100% methods.
- TypeScript `entity.ts` Stryker kills 402/408 mutants (98.53%), with no uncovered
  mutants. The six survivors are observationally equivalent: the conflict-token
  presence guard is redundant beside string equality; two positive-Money shape
  guards are backed by Money deserialization; two internal predicate catches
  return false or undefined, both rejected by their sole truthiness caller; and
  the remaining mutant changes only non-portable diagnostic text. No meaningful
  financial logic was excluded or suppressed.
- Sixteen Entity native mutation probes pass across languages, including ten new
  source presence/type, standalone-mapping, and null-precondition probes. All
  six Python Entity native probes also pass on 3.13. Every probe requires its
  named regression to fail and an independent valid control to pass.
- Updated isolated npm, Python wheel/sdist (3.12/3.13), and Java JAR consumers
  pass mapping-only imports, malformed Source Identity rejection, and retained
  versioned Workflow reuse. Package versions and publication status are unchanged.
- Tool tests, architecture boundaries, documentation links, requirement
  traceability, license validation, and diff whitespace checks pass.

The portable mutation tool's default child-output buffer was too small for the
expanded Entity failure observations. Its buffer is now 8 MiB, matching the
native tool; runtime failures still cannot count as killed mutants. The full
Entity portable critical reruns pass: 36/36 Python and 36/36 Java mutants
are killed, including all ten new probes. Both unmodified Entity baselines pass;
each new probe has its named regression failure and passing paired control.
There are no critical survivors.

Findings 9c and 10b are corrected and verified. Traceability closes the nine
remaining Entity rows: 334 COVERED, 0 PARTIAL, and 83 NOT DIRECTLY TESTABLE across
417 requirements. This closes Milestone 7, not the combined release gate.

Completion synchronization: unit/native tests, mutation probes, public API docs,
package READMEs, executable consumer examples, root/conformance status, and the
import correction note are updated. Existing conformance vectors already cover
the normative changes; no new financial rule, identifier, or vector expectation
was introduced here. Agentic metadata already states presence/error and atomic
failure semantics, so it needs no change. CoreDoc and AGENTS.md obligations and
architecture remain unchanged. Release notes remain maintainer-owned and no
release action is performed. At Milestone 7 completion, Milestones 8–9 remained
unstarted.

## Milestone 8 — Mutation protection, full verification, and fresh review

- [x] Wire all regressions and boundary controls into repeatable repository
      verification. Extend existing portable critical and native mutation tools
      for every corrected failure mechanism, including each lettered subcase.
- [x] Require passing unmodified baselines and named behavioral regression
      failures for targeted mutants, with independent valid controls passing.
      Reject crashes, timeouts, compilation failures, skipped/missing/empty
      results, and unrelated failures as proof of a targeted mutant kill.
- [x] Run full runner and TypeScript core mutation suites with the unchanged
      minimum 95 percent gate; review every survivor and uncovered mutant.
      No critical financial mutant may survive. Report timeouts separately;
      do not hide meaningful logic with exclusions or weaken tests for scores.
- [x] Run all Python/Java critical and native probes, including the Python 3.13
      native gate. Do not describe selected probes as full mutation coverage
      of those implementations.
- [x] Run strict builds, native/unit/adapter tests, configured coverage gates,
      and every manifest vector on TypeScript, Python 3.12, Python 3.13, and
      Java. Require zero failed, unsupported, or infrastructure vector outcomes.
- [x] Extend installed npm, Python wheel/sdist on both runtimes, and Java JAR
      consumer checks with corrected native constructors and relevant evaluation,
      redaction, and reuse paths. Import-only checks do not cover these defects.
- [x] Run toolchain, architecture, documentation/traceability, license,
      developer-tool, and whitespace checks. Follow executable tool header
      conventions under `docs/tools`; verification remains local, with no
      GitHub Actions or new closure/provenance report system.
- [x] From a clean candidate checkout, install locked dependencies with
      `npm ci` and run the complete `npm run verify` using Node 24, CPython
      3.12/3.13, JDK 21, and Maven 3.9.x. Review dependency audit results
      separately from financial conformance and preserve the verified locks.
- [x] Perform a fresh contract-driven review after the fixes, beyond replaying
      this finding list. Revisit the Milestone 2 inventory, native versus
      portable validation, presence/type families, shared incorrect behavior,
      error priority, ownership, and actual cross-domain sequences. Turn any
      new confirmed mandatory gap into a failing regression before closure.
- [x] Reassess traceability against the actual evidence. Finite passing tests
      support the exercised scope; they do not prove exhaustive correctness.
      Close neither a blocking specification gap nor an untested mandatory
      boundary by pointing to an aggregate coverage or mutation percentage.

Completion: the combined candidate passes complete verification and a fresh
review, with no unresolved demonstrated blocker or surviving critical mutant.

### Milestone 8 fresh review and verification

The fresh contract-driven review revisits the Milestone 2 inventory and public
native/portable entry points, presence and type families, validation priority,
revision identity, ownership, and reuse of actual observations. It confirms two
additional implementation violations under existing requirements:

- Python import silently rewrote a supplied revision `current` marker, accepting
  opposite Booleans and malformed values. Fourteen failing regressions preceded
  the fix; two matching controls preserve current/historical observations.
  ENTITY-REVISION-007 and ENTITY-IMPORT-006/008/009 govern rejection and atomicity.
- Java composition silently replaced non-list Decision evidence with an empty
  list. Four failing regressions preceded the fix, with an empty-list control.
  APPROVAL-COMPOSITION-010/024 and APPROVAL-ERROR-010 govern complete evidence
  validation and its priority after applicability and required context.

All 21 vectors are in normal manifest/native/adapter discovery. No requirement,
error, or operation identifier is added. The fixture conventions clarify the
revision marker's existing current/historical role; no new financial policy is
introduced. Public docs and installed consumers exercise the corrected behavior.

The full core Stryker configuration now includes construction/evaluation
regressions. Both Stryker configurations use two workers for repeatable resource
use; mutation scope and the 95 percent thresholds are unchanged. Portable probes
now explicitly protect concrete Requirement subject validation (6a), committed
lifecycle target resolution (7b), chain State and composition applicability (9b),
and both fresh-review defects. Existing expiration, complete-context, native
constructor, authority, identity, and priority probes remain active. New Python
native probes reject revision rewriting and Boolean/numeric coercion.

The probe inventory maps the original findings to named regression/control
pairs (the Python/Java prefixes below identify separate probes). Full Stryker
adds TypeScript behavioral mutation coverage; native probes supplement portable
cases where construction or retained observations cannot be encoded in JSON.

| Finding | Targeted protection |
| --- | --- |
| 1 | Python/Java `approval096-missing-state`; composition State absence/type matrices. |
| 2 | Python native `money-construction-*` probes for amount/currency validation, exact context independence, and valid finite controls. |
| 3 | Python/Java native `workflow-constructor-*` probes for initial/terminal/endpoint/version validity and owned declarations. |
| 4 | Python `audit096-authority-*` portable probes plus native preservation/ownership probes. |
| 5 | Python/Java `approval096-context-parser` and native `approval096-required-context`, plus timestamp vectors and full TypeScript mutation. |
| 6a | Python/Java `approval096-concrete-subject-bypass`, `approval096-association`, subject/eligibility probes, and TypeScript concrete evaluation tests. |
| 6b | Python/Java `approval-expiration-bypass`, exact-instant controls, and TypeScript concrete expiration tests. |
| 7a | Python/Java `approval096-history-validation` and native imported-lifecycle validation across reuse boundaries. |
| 7b | Python/Java `approval096-history-target-bypass`, lifecycle relation/reference/repetition probes, and returned-history tests. |
| 8 | Python/Java `approval096-decisive-return`, reordered complete-context controls, and TypeScript evaluation mutations. |
| 9a | Python `money-rate-container-accepted`, unsupported-kind/wrong-error probes, and native/adapter type matrices. |
| 9b | Python/Java `approval096-chain-state-bypass` and `approval096-applicability-bypass`, paired with valid chain/composition controls. |
| 9c | Python/Java `entity096-evolution-null-state/revision`, plus all-kind precondition and actual history-reuse tests. |
| 10a | Native `typescript-workflow-instance-priority-reversed`; all-runtime malformed-instance-before-mismatch vectors. |
| 10b | Python/Java `entity096-source-null-omitted`, `source-type-omitted`, and standalone mapping controls; TypeScript import mutations. |
| Fresh revision finding | Python portable/native `entity096-revision-currentness-bypass` and `revision-currentness-number`. |
| Fresh container finding | Java `approval096-decision-container-discarded`; all-runtime native/adapter failure and unchanged-evidence observations. |

The complete clean-candidate runner and TypeScript core Stryker runs pass with
unchanged 95 percent gates. Runner: 627 killed, 19 survived, zero uncovered or
timed out (97.06%). Core: 4,069 killed, 131 survived, nine uncovered, 16 timed
out, and 69 pre-existing justified exclusions (96.69%). Excluding timeout credit,
the core still detects 4,069 of 4,225 scored mutants (96.31%). No exclusion was
added or broadened.

Every survivor and uncovered mutant was reviewed against its callers and public
observations. Runner survivors affect diagnostic text/source labels, a redundant
metadata-error wrapper, or record-type checks already enforced by required JSON
fields. Core survivors affect non-portable diagnostics or equivalent internal
paths: validation repeated after constructors/parsers, exclusive lifecycle target
fields, absent-vote sentinels, unused applicability markers, equivalent quorum
and nonpending actionable calculations, validated JSON cloning, Entity conflict
comparison/decoding and falsy predicate catches, and Workflow binding/equality
checks backed by validated shapes. None changes a portable error, accepted
financial outcome, retained history, required validation, or public ownership.

The nine uncovered mutants are defensive paths unreachable through validated
public values: two Approval history clone catches, two Audit redaction clone
catches and its repeated policy-match check, an Entity check after successful
Audit append, two Money rounding-default diagnostics behind mode validation,
and the Workflow comparison fallback behind JSON-value validation. These remain
in mutation scope rather than being suppressed.

The 16 timeouts are reported separately: ten Money divisor/GCD/factor-reduction
mutations introduce nontermination, three Approval group-depth mutations permit
unbounded recursion, and three Decision record-shape mutations recurse without
progress. They are not named behavioral kills in the targeted probe tools.
Finite tests and these reviewed equivalent paths do not establish exhaustive
correctness.

The isolated candidate was installed with `npm ci`: 229 packages installed,
233 audited, zero reported vulnerabilities, and no lockfile changes. The
prescribed Node 24, CPython 3.12/3.13, JDK 21, and Maven 3.9 toolchains are used.
Builds and strict checks pass, including 1,093 TypeScript core tests, 130 runner
tests, 20 TypeScript adapter tests, 466 Python unit tests and 340 adapter tests
on each version, all Java native entry points (253 construction/evaluation
cases), and 343 Java adapter tests. All 884 manifest vectors pass on each of
the four runtimes: 12 Shared, 111 Money, 135 Workflow, 84 Audit, 277 Approval,
and 265 Entity, with zero FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR outcomes.

Configured coverage gates pass: runner 100% lines and 96.61% branches;
TypeScript core 99.67% lines and 99.47% branches; Python branch-enabled coverage
92%; Java 92.85% lines and 81.82% branches. Installed npm, wheel/sdist consumers
on both Python versions, and JAR consumers pass native constructor, composition
context/evidence, redaction, ownership, and returned-observation reuse checks.
Toolchain, architecture, documentation/traceability, developer-tool, license,
and whitespace checks pass.

The complete `npm run verify` passes from the clean candidate after locked
installation. All 222 portable critical probes pass (Python 115, Java 107),
as do all 92 native probes (Python 47, Java 36, TypeScript 9) and the separate
47-probe Python 3.13 native gate. Each targeted probe requires an unmodified
passing baseline, its named behavioral regression, and independent passing
controls. Classifier tests reject process failures, timeouts, compilation errors,
missing/empty/skipped results, unsupported/infrastructure outcomes, and unrelated
failures. One new applicability probe initially caused a missing-key crash;
it was narrowed to bypass invalid supplied values while retaining presence
validation, then passed both the preflight and complete gate. No classifier was
weakened. These are targeted Python/Java probes, not full implementation mutation
coverage.

Traceability records 417 requirements and 884 vectors: 334 COVERED, zero PARTIAL,
83 NOT DIRECTLY TESTABLE, and zero blocking specification gaps. Every original
finding and lettered subcase has regression/control and mutation protection;
both fresh-review findings are corrected. No demonstrated mandatory blocker or
critical surviving financial mutant remains within the reviewed scope.

Completion synchronization: manifest-derived native/unit and adapter tests,
conformance vectors/conventions/traceability, mutation probes and configuration,
Python API docs, installed consumers, package/root READMEs, and current plan
status are updated. Existing TypeScript JSDoc and Java API docs already describe
the applicable invalid-evidence and atomic-failure contract. No new public API,
financial requirement, portable error, operation ID, dependency direction, or
foundation rule was introduced, so `/spec`, `/agentic`, CoreDoc, and AGENTS.md
need no change. Dependency locks are preserved. Final documentation is checked
against the verified executable candidate; release notes, tagging, and release
closure remain Milestone 9.

## Milestone 9 — Documentation and corrective release

- [ ] Review unit/native/conformance/mutation tests, JSDoc and Python/Java API
      docs, examples, root/package READMEs, `/spec`, `/conformance`, `/agentic`,
      CoreDoc, and `AGENTS.md`; update every affected artifact in the same
      change. Document implemented, conformant, unsupported, and deferred scope
      accurately. Change CoreDoc version fields only for changed foundation rules.
- [ ] Preserve separate identities for the corrective `core-0.9.6` snapshot,
      `0.9-rc` Core label, `0.1.0` reference-package versions, and `0.1`
      conformance syntax unless a reviewed compatibility decision requires
      otherwise. Stable 1.0 promotion remains a separate task.
- [ ] After verification, add a concise 0.9.6 summary to the single
      [release history](../releases/README.md). Keep detailed development
      history in Git and existing tools, not additional release reports.
- [ ] Follow the maintainer's release process for the verified commit and
      annotated local `core-0.9.6` tag. Preserve prior tags and unpublished
      reference-package status; remote or registry publication requires its
      own explicit release instruction.
- [ ] Verify final documentation from a clean checkout and ensure executable
      files, configuration, and locks match the fully verified candidate.
      Rerun affected gates if the release candidate changes after verification.
- [ ] Mark this plan complete and update [Core 1.0 prerequisites](plan-10.md)
      only after every finding and gate is resolved. Distinguish local release
      completion, remote availability, and stable Core 1.0 readiness.

Completion: documentation, release history, and the corrective tag identify
the verified 0.9.6 snapshot without making a premature stable-release claim.

## Execution dependencies and completion discipline

Milestone 1 establishes the contracts. Milestone 2 demonstrates failures and
maps adjacent boundaries before fixes. Milestones 3–7 implement their owning
domain corrections; Workflow and Audit changes must preserve Entity composition.
Milestone 8 validates the combined candidate, and Milestone 9 releases only
that verified state. Within each implementation milestone, retain the sequence
specification → requirement → failing regression → minimum fix → passing tests
and conformance → mutation testing → refactor.

Record milestone completion here only after its checks pass. Findings may be
resolved by a documented contract correction where warranted, but not by
silently changing expectations, removing supported APIs, narrowing advertised
scope, or treating a runtime exception as an acceptable domain result.

Learn pages may proceed independently. Executable examples must use the current
public APIs and describe release-candidate limitations honestly; presentation
work does not close this corrective gate or authorize new financial semantics.

## Release gate

Core 0.9.6 is complete only when:

- [x] Every numbered finding and lettered subcase has an agreed contract,
      permanent regression, valid control, and appropriate mutation protection.
- [x] Native Money and Workflow construction cannot expose the reviewed invalid
      domain values, while valid native and portable paths preserve exact semantics.
- [x] Approval evaluation has one agreed portable scope; missing required
      evidence/context, malformed lifecycle history, and decisive outcomes cannot
      bypass required validation or change committed history.
- [x] Required timestamps follow the portable profile in every implementation.
- [x] Redaction requires a valid declared authority and preserves Audit meaning.
- [x] Workflow errors follow specified precedence; Entity import/evolution
      distinguish malformed supplied values from omission and fail atomically.
- [x] Reviewed malformed-input families produce applicable portable errors,
      never language exceptions, process failures, or fabricated success.
- [x] All manifest vectors, native sequences, installed consumers, coverage,
      full configured mutation suites, and critical/native probes pass on the
      prescribed runtimes, with no surviving critical financial mutant.
- [x] Clean-checkout verification and a fresh boundary review pass; all newly
      confirmed mandatory gaps are resolved and traceability reflects actual scope.
- [ ] Documentation and compatibility decisions are synchronized, earlier
      regressions and tags are preserved, and no architecture boundary is violated.
- [ ] Concise release notes and the annotated corrective tag identify the
      verified snapshot. No unrequested publication or Core 1.0 promotion occurs.
