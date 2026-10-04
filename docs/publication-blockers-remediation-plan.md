# Publication blocker remediation plan

This active development plan resolves the two high-priority blockers and the
related Entity fixture defect identified in
[the publication review](publication-blockers.md). The intended outcome is a
specification and acceptance artifacts that describe the same financial
contract, followed by a reviewed, versioned publication tree.

Baseline: commit `265a62a`, FinKore Core 2.0, reviewed on 2026-10-04. The local
annotated `core-2.0` tag already identifies that release. Every task below starts
pending; this plan does not implement corrections, adopt proposed semantics, or
authorize moving a published tag.

## Scope and completion rules

| Finding | Work required | Completion condition |
| --- | --- | --- |
| B1 Missing Approval identity in shared timestamp cases | Correct five fixtures and review all manifest-discovered uses of affected operations. | Timestamp cases use valid scoped identities and isolate their intended boundary or precision defect. |
| B2 Unclear treatment of unrelated Approval history | Decide the history population, define the owning specification boundary, and synchronize all derived artifacts. | Consumers can derive one result for each supported history population without guessing from fixtures. |
| C1 Malformed validator in the Entity context-priority case | Replace the incorrect member and confirm the case isolates the intended priority. | A well-formed target-State rule rejects the zero amount, while malformed context produces the specified earlier error. |

Keep the work within the existing specification-only architecture. Do not add a
financial implementation, runner, adapter API, transport, canonical Approval
operation, or deferred banking domain. Repository tools may inspect structure
and references; they must not calculate financial outcomes.

Follow the source order: [CoreDoc](coreDoc/core-doc.md), owning specifications,
manifest-discovered conformance artifacts and traceability, then Agentic
metadata. Preserve CoreDoc governance metadata during editorial changes.

The contributor implements each milestone; a maintainer reviews normative and
release decisions. Reviewers assess financial control implications and
adversarial cases. These are responsibilities, not newly required automation
or a request to create additional review reports.

## Version and identifier policy

Apply [Specification Compatibility Policy](../spec/conventions.md#compatibility-policy)
and [contributor guidance](../CONTRIBUTING.md#compatibility-and-coordinated-review).
Classify the actual change before choosing the release number.

| Change | Version treatment |
| --- | --- |
| B1 and C1 fixture corrections that enforce existing normative behavior | Suitable for a patch such as Core 2.0.1, subject to review confirming no contract redefinition. |
| B2 clarification that demonstrably preserves existing required behavior | A patch is possible only if the old and new text require the same observations for supported inputs. |
| New backward-compatible behavior with omission preserving the earlier contract | A minor release may be appropriate under the published policy. |
| B2 changes which inputs succeed, required shape, outcome, portable error, or mutation effect | Treat as an incompatible change requiring a new major Core version, provisionally Core 3.0. |

Calling a change a clarification does not make it compatible. In particular,
changing a previously required `FINKORE_APPROVAL_INVALID_DECISION` into
`PENDING`, or permitting a previously forbidden collection, needs explicit
compatibility analysis. The narrow internally inconsistent error-mapping
exception in SPEC-COMPATIBILITY-005 is not a general exemption from major-version
rules. Do not assert compatibility where the existing boundary cannot support
that conclusion.

- Preserve requirement IDs when their meaning stays the same. Assign a new ID
  to a materially different replacement after searching the active inventory,
  Git history, and release notes for prior use.
- If replacing or retiring a requirement, preserve every continuing obligation,
  remove obsolete active references, update traceability and totals, and record
  the sunset under Unreleased in [release notes](releases/README.md).
- Preserve vector IDs when repairing the same intended acceptance case. Give
  materially different cases new IDs and document any retirement; never recycle
  retired identifiers.
- Keep existing portable errors when their defined categories apply. Do not
  create aliases or promote conformance-local Approval labels to `finkore.*`.
  If a canonical operation changes incompatibly, follow its new-ID or documented
  supersession requirement.
- Keep `finkoreConformance`, `finkoreVectorFile`, and the private maintenance
  package version separate from the Core release. The planned fixture repairs
  alone do not change the artifact syntax.
- Keep `core-2.0` immutable. Publish a reviewed correction through a new release
  and tag; do not rewrite the historical Core 2.0 release entry as though it
  contained the repairs.

## Milestones and dependencies

| Milestone | Deliverable | Depends on | Exit gate |
| --- | --- | --- | --- |
| M0 Establish the repair baseline | Confirmed inventory and compatibility constraints | None | Each finding has an owning layer and affected artifacts. |
| M1 Repair timestamp and Entity fixtures | B1 and C1 corrections with preserved coverage | M0 | All six named cases isolate their intended behavior. |
| M2 Define Approval history scope | Reviewed normative boundary and compatibility classification | M0 | Every scope combination has one specified interpretation. |
| M3 Synchronize Approval acceptance artifacts | Corrected B2 cases, controls, traceability, and guidance | M2 | No derived artifact contradicts the selected rule. |
| M4 Review the integrated contract | Adversarial review and passing local verification | M1 and M3 | No unresolved contradiction or new blocking gap remains. |
| M5 Prepare stable publication | Versioned final tree without development plans | M4 | Proposed-tree and final-tree release gates pass. |

M1 can proceed while M2 is being reviewed because its intended timestamp and
Entity behavior is already specified. Do not implement B2 expectations before
M2 settles the owning rule. Update this plan as work proceeds; check a task only
when its deliverable and verification are complete.

## M0 Establish the repair baseline

- [x] **M0.1 Confirm the checkout.** Record the working commit in this plan,
  inspect local changes, and confirm the target of `core-2.0`. Preserve unrelated
  user work and keep historical tags unchanged.
- [x] **M0.2 Read the owning contract.** Review CoreDoc approval integrity,
  identity, determinism, and rejected-action obligations; then
  [Approval Decisions](../spec/approvals/decisions.md),
  [Approval Validity](../spec/approvals/validity.md),
  [Entity Validation](../spec/entities/validation.md), and
  [Entity Lifecycle](../spec/entities/lifecycle.md). Include their portable errors.
- [x] **M0.3 Inventory by manifest.** Starting only from
  [manifest.json](../conformance/manifest.json), locate every case using affected
  Approval record/evaluation/lifecycle operations and Entity context priority.
  Include shared and other suites, supplied histories, lifecycle references,
  expected observations, and paired-control references.
- [x] **M0.4 Map derived content.** Identify affected rows in
  [traceability](../conformance/traceability.md),
  [fixture contracts](../conformance/operations.md),
  [Agentic scope](../agentic/operations.md#scope),
  [implementation guidance](implementation-guide.md), and
  [consumer guidance](../conformance/consumer-guide.md).
- [x] **M0.5 Establish the verification baseline.** Confirm Node
  `>=24.11.0 <25`, install locked dependencies with `npm ci --no-audit`, and run
  `npm run verify`. Passing structural checks do not close B1 or B2. Treat the
  release gate separately while this active plan remains in the checkout.

**M0 exit:** The inventory includes the five B1 cases, four B2 cases, and C1
listed below, plus any related defects found by the manifest-wide review.
Provisional patch treatment is limited to corrections of existing behavior;
B2's classification remains pending M2.

### M0 baseline record — completed 2026-10-04

The working commit is
`265a62a610cf3d67bcc3c45d11f71c4c6d10225b` (`Release FinKore Core 2.0
stable`). The annotated `core-2.0` tag object is
`f4afd36124408aa9ff9a6239566378c609eef74d` and peels to that same commit.
The tag was not changed. At the start of M0, the only checkout changes were the
untracked review and active-plan files, `docs/publication-blockers.md` and this
file; the review file was preserved unchanged.

The contract review covered CoreDoc **CORE-002.2**, **CORE-002.3**,
**CORE-004.1** through **CORE-004.4**, and **CORE-005.1** through
**CORE-005.3**; the four owning specifications named above; and Approval,
Entity, and Workflow portable-error definitions. B1's scoped identity and
timestamp outcomes and C1's context-before-target-validation outcome are
already defined. B2 remains an unresolved boundary between
**APPROVAL-DECISION-012/013** and **APPROVAL-VALIDITY-013/017**; M0 does not
select a history-population rule or a compatibility classification.

Starting from the manifest, the operation-wide inventory found 431 affected
vectors in 18 declared files:

| Operation | Vectors | Manifest-listed files |
| --- | ---: | --- |
| `approval.requirement.evaluate` | 145 | `shared/timestamps.json`; `approvals/decisions.json`; `approvals/validity.json`; `approvals/readiness-regressions.json`; `approvals/construction-evaluation-regressions.json`; `approvals/evidence-regressions.json`; `approvals/discovery-regressions.json`; `approvals/fact-history-contracts.json`; `approvals/stronger-contract.json`; `approvals/corrections-098.json` |
| `approval.decision.record` | 56 | `shared/timestamps.json`; `approvals/decisions.json`; `approvals/readiness-regressions.json`; `approvals/construction-evaluation-regressions.json`; `approvals/evidence-regressions.json`; `approvals/discovery-regressions.json`; `approvals/stronger-contract.json`; `approvals/corrections-098.json` |
| `approval.decision.evaluate` | 73 | `approvals/decisions.json`; `approvals/readiness-regressions.json`; `approvals/construction-evaluation-regressions.json`; `approvals/evidence-regressions.json`; `approvals/discovery-regressions.json`; `approvals/fact-history-contracts.json` |
| `approval.decision.withdraw` | 24 | `approvals/validity.json`; `approvals/readiness-regressions.json`; `approvals/discovery-regressions.json`; `approvals/stronger-contract.json` |
| `approval.decision.supersede` | 21 | `approvals/validity.json`; `approvals/readiness-regressions.json`; `approvals/discovery-regressions.json`; `approvals/stronger-contract.json` |
| `approval.requirement.supersede` | 21 | `approvals/validity.json`; `approvals/readiness-regressions.json`; `approvals/discovery-regressions.json` |
| `finkore.entity.transition` | 91 | `entities/behavior.json`; `entities/readiness-regressions.json`; `entities/evidence-regressions.json`; `entities/guard-validation.json`; `entities/context-errors.json`; `entities/discovery-regressions.json`; `entities/malformed-boundary-regressions.json`; `entities/application-values.json` |

Across those operations, 53 inputs contain committed lifecycle arrays with 59
events, 117 cases request post-operation observations, and 205 cases declare a
`pairedControl`. The targeted cases have these exact evidence boundaries:

| Finding | Supplied evidence and expected observation | Paired control |
| --- | --- | --- |
| B1 three expiration cases | One unscoped Decision in an array; success values `APPROVED`, `PENDING`, and `PENDING`; no lifecycle or post-state observation. | None declared. Existing valid precision and expiration controls are manifest-listed in the shared and Approval suites. |
| B1 invalid evaluation precision | One unscoped expiring Decision; `FINKORE_APPROVAL_INVALID_CONTEXT`; no lifecycle or post-state observation. | None declared. |
| B1 invalid Decision precision | One unscoped retained Decision plus one unscoped candidate; `FINKORE_APPROVAL_INVALID_DECISION`; the unchanged retained history is observed. | None declared. |
| B2 wrong association | One Decision array member for another Requirement and a synthetic foreign subject; success `PENDING`; no lifecycle or post-state observation. | None declared. |
| B2 Requirement supersession | Envelope with one Decision and one `REQUIREMENT_SUPERSEDED` lifecycle event; the predecessor reference has a synthetic foreign subject while the successor reference uses the evaluated subject; success `PENDING`. | None declared. |
| B2 excluded expiration context | Envelope with one expiring Decision for another Requirement and a synthetic foreign subject, plus an empty lifecycle array; success `PENDING`. | `approval.boundary096.complete-context-control-001`. |
| B2 unrelated eligibility | One Decision array member for another Requirement, an ineligible Actor under the evaluated Requirement, and a synthetic foreign subject; success `PENDING`. | None declared. |
| C1 Entity priority | No history; malformed scalar `facts`; `FINKORE_WORKFLOW_INVALID_CONTEXT`; unchanged Entity and supplied facts are observed. The only `field` validator member in the manifest is this typo. | None declared. `entity.transition.target-validation-fail-001`, paired with `entity.transition.target-validation-pass-001`, proves the same predicate kind can reject under valid context, but does not use C1's exact zero-valued, unguarded input. |

The scope scan found these additional competing-defect cases for M1 review:

- `approval.association.history-missing-requirement-id-001`,
  `approval.association.history-missing-actor-001`,
  `approval.association.history-missing-outcome-001`, and
  `approval.association.history-missing-decided-at-001` each omit scoped
  identity on the malformed second Decision as well as the field named by the
  case. Their expected portable error is unchanged, but they do not isolate
  their intended structural defect.
- Eight non-B1 malformed-subject cases also omit Requirement `contextId`:
  `approval.requirement.missing-subject-001`, the record/evaluate null-subject,
  state-without-subject, and applicability-without-subject cases in
  `approvals/readiness-regressions.json`, and
  `approval.boundary096.decision-subject-absent-001`. M1 must distinguish an
  intentional scoped-identity negative case from an accidental second defect
  before changing any of them.

The B2 population scan found no valid same-context/same-subject/different-
Requirement control: all four `PENDING` cases use a foreign subject. Existing
negative controls reject a foreign context
(`approval.decision.cross-context-reference-001`) and structurally incomplete
unrelated history (`approval.association.history-unrelated-001`), but they do
not settle the collection population. This is the M2 specification gap rather
than authority to infer an answer from those controls.

Derived-content ownership is mapped as follows:

- Traceability rows directly affected by the named cases or their repaired
  requirement lists are **SPEC-TIMESTAMP-004/005**,
  **APPROVAL-DECISION-001/006/012/013/014**,
  **APPROVAL-ERROR-001/005/007**, **APPROVAL-VALIDITY-008/009/011/013/017**,
  **ENTITY-LIFECYCLE-003/008/009**, **ENTITY-VALIDATION-001/002/004/006/009**,
  **ENTITY-ERROR-001/004**, and **WORKFLOW-ERROR-008**.
- `conformance/operations.md` owns the concrete Approval identity/history
  shape and all six affected Approval operation rows. Its Entity validator
  definition owns `path`, and its `finkore.entity.transition` row is stale: it
  still says non-object facts have no portable outcome despite the Core 2.0
  specification and vectors.
- `agentic/operations.md` keeps Approval labels conformance-local but its scope
  note preserves the unrelated-Requirement eligibility distinction. Its
  canonical `finkore.entity.transition` entry already states the Core 2.0
  invalid-context and target-validation order.
- `docs/implementation-guide.md` already requires scoped Approval identity,
  immutable context/subject ownership, explicit evaluation context, and the
  current Entity transition priority. It does not settle whether one owned
  history may contain several Requirements.
- `conformance/consumer-guide.md` has current Core 2.0 identity and Entity
  context guidance, but its “Previous compatible-release migration” section
  still says non-object Entity facts are undefined and stronger Approval
  identity is future work. That historical passage is stale current-facing
  guidance and must be synchronized in the milestone that changes the owning
  derived content.
- No schema, repository-tool, or tool-test change is required merely to record
  M0: the current checks correctly validate structure and references but are
  not financial-outcome evaluators.

Verification used Node `v24.15.0`. `npm ci --no-audit` installed the five
locked maintenance dependencies, and `npm run verify` passed: 30 tool tests,
47 manifest files, 1,818 vectors, 447 requirement references, 20 canonical
Agentic operations, documentation links, architecture, and licensing. This
does not close the semantic blockers. `npm run release:check` was intentionally
not run because the active plan remains in the checkout and M0 treats the
stable-publication gate separately.

M0 therefore meets its exit gate. B1 and C1 remain provisional patch-level
fixture corrections; B2's compatibility and version treatment remain pending
the M2 normative decision.

## M1 Repair timestamp and Entity fixtures

### B1 Shared Approval timestamp cases

Repair these five cases in
[shared/timestamps.json](../conformance/shared/timestamps.json):

| Vector | Preserve this observation |
| --- | --- |
| `shared.timestamp.expiration-subnanosecond-before-001` | Successful `APPROVED`, one nanosecond before expiration. |
| `shared.timestamp.expiration-equivalent-offset-nanoseconds-001` | Successful `PENDING` at the equivalent expiration instant. |
| `shared.timestamp.expiration-subnanosecond-after-001` | Successful `PENDING`, one nanosecond after expiration. |
| `shared.timestamp.invalid-evaluation-precision-001` | `FINKORE_APPROVAL_INVALID_CONTEXT` for excessive evaluation timestamp precision. |
| `shared.timestamp.invalid-decision-precision-001` | `FINKORE_APPROVAL_INVALID_DECISION` for excessive candidate Decision timestamp precision, with unchanged history. |

- [x] **M1.1 Supply valid Requirement scope.** Add a deterministic, nonempty
  opaque `contextId` to each Requirement and retain its exact subject reference.
  Keep eligibility, outcome mappings, facts, and timestamp spellings intact.
- [x] **M1.2 Supply valid Decision identity.** Add a nonempty `decisionId` and
  matching `requirementRef` to every supplied Decision, including the record
  candidate and committed history. Use distinct IDs within the context and
  coherent `contextId`, `requirementId`, and subject members.
- [x] **M1.3 Align observations.** Update expected retained records to contain
  exactly the identity fields supplied in input. Preserve complete committed
  Decision/lifecycle history where the operation and fixture require it.
  Do not manufacture lifecycle evidence or claim mutation observations that
  the request does not expose.
- [x] **M1.4 Isolate timestamp defects.** Ensure the two negative cases contain
  no unrelated malformed identity, scope, eligibility, retained timestamp, or
  history. Retain the intentionally invalid ten-digit fractional timestamp.
  Never replace the three positive expectations with structural errors.
- [x] **M1.5 Verify precision controls and traceability.** Review existing
  manifest-listed controls with valid timestamp precision; add paired controls
  if needed to distinguish acceptance from truncation or blanket rejection.
  Reference APPROVAL-DECISION-013/014 where exercised, retain timestamp and
  validity requirements, and update corresponding traceability evidence.
- [x] **M1.6 Complete the operation-wide review.** Inspect other suites for
  missed scoped-identity migrations. Repair equivalent defects under the same
  existing rule; send unresolved history-population questions to M2.

### C1 Entity context priority

- [x] **M1.7 Correct the validator declaration.** In
  [entities/context-errors.json](../conformance/entities/context-errors.json),
  change `field: "amount"` to `path: "amount"` for
  `entity.transition.invalid-context-before-target-validation-001`. Keep the
  supported `positive-money` rule, `FINAL` selector, zero EUR amount, declared
  Transition, and malformed `facts: true`.
- [x] **M1.8 Confirm the competing failure is real.** Review or add a companion
  case using valid context and the same target-State rule, where existing
  specification requires `FINKORE_ENTITY_VALIDATION_FAILED`. The repaired
  malformed-context case retains `FINKORE_WORKFLOW_INVALID_CONTEXT` and unchanged
  Entity/data/State/facts observations. Use existing controls where sufficient.
- [x] **M1.9 Keep malformed-definition coverage separate.** Review validator
  structure cases and their ENTITY-VALIDATION-009 references. Do not infer a
  total ordering of malformed definitions and context from this repair. Search
  for other `field` declarations and distinguish intentional malformed cases
  from typos before changing them.

**M1 exit:** The five timestamp cases use valid identity except for their
intended timestamp defect. C1 contains a well-formed rejecting predicate.
Stable case intent, exact timestamps, errors, and failure observations remain
intact; updated artifacts pass `npm run verify`.

### M1 completion record — completed 2026-10-04

All five shared timestamp cases now supply a deterministic Requirement
`contextId`, exact subject-matching `requirementRef`, and stable `decisionId`.
The record case uses distinct candidate and retained-history identities, and its
failure observation exactly reproduces the retained scoped record. The original
nanosecond and ten-digit fractional timestamp spellings, three success values,
two portable errors, and mutation observations are unchanged. Each case now
references **APPROVAL-DECISION-013/014**, and their traceability rows are
synchronized.

Existing manifest-listed precision controls were sufficient without adding a
new vector. The Approval validity and boundary suites already cover before,
equal, after, and equivalent-offset expiration, complete context, and distinct
nanosecond identities. Together with the repaired positive shared cases, they
distinguish exact acceptance from truncation, lexical comparison, and blanket
precision rejection.

The operation-wide identity scan found no remaining concrete Decision in the
six affected Approval operation families without scoped identity, and no
concrete supplied Requirement without `contextId`. To reach that result without
changing case intent:

- the four `approval.association.history-missing-*` cases now give their
  malformed second Decision a valid distinct identity and exact scoped
  reference while retaining only the named missing legacy field; and
- the eight malformed-subject cases identified in M0 now supply `contextId`
  while retaining their missing or null subject and existing expected error.

No B2 case, subject association, lifecycle relationship, expected `PENDING`
result, or history-population rule changed. Those observations remain blocked
on M2.

The C1 validator now uses `path: "amount"`; the supported `positive-money`
rule, `FINAL` selector, zero EUR amount, declared transition, scalar
`facts: true`, invalid-context error, and unchanged observations are preserved.
It now names `entity.transition.target-validation-fail-001` as its paired
control. That manifest-listed control uses valid object context and the same
target-State predicate kind to require `FINKORE_ENTITY_VALIDATION_FAILED`; its
own paired success control remains unchanged. A manifest-wide search found no
other `field` validator member. Existing malformed-declaration vectors and
**ENTITY-VALIDATION-009** traceability remain separate and unchanged.

The current Entity fixture contract now states the Core 2.0 non-object-facts
error and priority, and the consumer guide labels the former undefined behavior
and absent scoped identity as belonging to the earlier compatible release rather
than current guidance. CoreDoc, normative requirements, portable errors,
canonical operations, schemas, repository tools, and tool tests did not require
changes. These repairs preserve the provisional patch classification; they do
not settle B2 or select the final release version.

## M2 Define Approval history scope

B2 is a normative decision. The conflicting boundary spans
APPROVAL-DECISION-012/013, APPROVAL-VALIDITY-013/017, fixture definitions, and
Agentic scope notes. Until resolved, the exact population accepted by the
collection boundary needs this explicit statement:

> This behavior is not currently defined by FinKore Core.

The recommended design for review is one immutable history scope per approval
context and subject, allowing several Requirement IDs within that scope.
Validate all evidence; select only exact scoped matches for the evaluated
Requirement. This preserves unrelated-Requirement handling while rejecting
foreign-subject or foreign-context reuse. It is a proposal, not an adopted rule.

| Supplied Decision relative to the evaluated Requirement | Proposed treatment for review |
| --- | --- |
| Same context, subject, and Requirement ID | Apply existing eligibility, facts, lifecycle, expiration, and outcome rules. |
| Same context and subject, different Requirement ID | Validate complete structure; exclude from the evaluated Requirement's eligibility/outcome and expiration-context demand. |
| Same context, different subject type or ID, any Requirement ID | Reject foreign-subject evidence as invalid Decision input. |
| Different context, any subject or Requirement ID | Reject foreign-context evidence as invalid Decision input. |
| Malformed unrelated Decision within the permitted scope | Reject; unrelated status never exempts structural validation. |
| Duplicate Decision ID within one context, including across Requirements | Reject under existing Decision-identity uniqueness. |

- [x] **M2.1 Compare boundary alternatives.** Review the recommended population
  against a history limited to only the evaluated Requirement. Explain the
  effect on existing unrelated-history obligations, retained histories,
  expiration context, and subject/context isolation. Select one rule from the
  domain contract, not from whichever fixture is easier to preserve.
- [x] **M2.2 Define each operation boundary.** Separate the candidate's exact
  association in record and single-Decision evaluation from population checks
  and selection in collection evaluation. Specify whether retained record
  histories can contain other Requirements and how scope is checked at
  import/reuse, withdrawal, and supersession. Do not add an import operation or
  an absent Requirement registry.
- [x] **M2.3 Define validation obligations.** State which checks apply to every
  supplied Decision and lifecycle record, including excluded members, and
  which checks apply only to the evaluated Requirement. Preserve existing
  eligibility checks on its expired, stale, withdrawn, or superseded Decisions;
  do not invent another Requirement's eligibility rule. Prevent early outcomes
  from bypassing required validation. Define only the error priority needed by
  the boundary; do not imply a total order of unrelated failures.
- [x] **M2.4 Review lifecycle scope.** Retain scoped Decision references,
  unique resolution, immutable original Decisions, and Requirement-supersession
  behavior that does not transfer approval to a successor. Specify how related
  history members fit the chosen population without inferring identity from
  facts, bare IDs, Actor/timestamp tuples, or timestamp order.
- [x] **M2.5 Write the owning normative change.** Update Approval Decisions and
  Validity before changing derived expectations. Preserve unchanged requirement
  meanings. For materially different replacements, assign unused IDs, preserve
  continuing obligations, retire obsolete references, and record the sunset.
  Review CoreDoc alignment without broadening its foundation or altering
  historical governance fields during clarification.
- [x] **M2.6 Decide compatibility and migration.** Compare the old and proposed
  contract for success/failure, result, error, shape, and atomicity. Record the
  conclusion in this active plan and concise Unreleased notes. If incompatible,
  select a major release and describe consumer changes to history population,
  scope validation, selection, and error handling. Never repair committed
  histories by silently relabeling or rewriting financial evidence.

**M2 exit:** Reviewed specification text gives a single scope rule for each
operation boundary, explains unrelated evidence, and has an explicit version
classification. Any remaining observable ambiguity blocks M3 expectations.

### M2 completion record — completed 2026-10-04

M2 adopts one immutable Decision-history scope per approval `contextId` and
exact subject reference. A history in that scope may retain Decisions for more
than one Requirement. Exact Requirement identity selects the Decisions that
receive the evaluated Requirement's eligibility, fact or revision,
expiration-context, effectiveness, and outcome rules. A Decision for another
Requirement in the same scope is unrelated evidence: its complete structure is
validated, but no absent eligibility rule or Requirement registry is invented
for it. A foreign context or subject is invalid scoped evidence, not unrelated
evidence that can be filtered out.

The rejected alternative was one history per Requirement identity. That model
would make **APPROVAL-DECISION-012**'s explicit unrelated-Requirement handling
unreachable, prevent record and reuse boundaries from retaining otherwise valid
same-subject history, and split lifecycle evidence that already preserves
Requirement supersession without transferring approval. It would also turn a
same-scope different-Requirement member into an association failure even though
the existing contract requires structural validation without applying the
evaluated Requirement's eligibility rule. The selected context-and-subject
population instead preserves that obligation while keeping the isolation rule
in **APPROVAL-DECISION-013** meaningful.

The operation boundary is now explicit:

| Boundary | Adopted rule |
| --- | --- |
| Candidate record | The candidate exactly matches the supplied Requirement. Retained history may contain other Requirements only in the same context and subject. |
| Single-Decision evaluation | The Decision exactly matches the supplied Requirement; there is no unrelated-member population at this boundary. |
| Requirement collection evaluation | Every member shares the evaluated context and subject. Exact Requirement identity selects eligibility, effectiveness, and outcome evidence. |
| History reuse | All Decision and lifecycle members remain in their original single scope; reuse cannot merge scopes or relabel evidence. |
| Withdrawal | A supplied Requirement exactly matches the uniquely resolved target Decision. Other same-scope evidence is retained. |
| Decision supersession | Target and successor resolve uniquely in one context-and-subject scope. They may identify different Requirements, but approval does not transfer. |
| Requirement supersession | Target and successor use the same context and exact subject with distinct Requirement identities. Existing Decisions keep their original association. |

All supplied Decision structure, scoped references, Decision-identity
uniqueness, retained fact value support, and forbidden current-effectiveness
assertions are validated before selection. All lifecycle discriminators,
references, relationships, and local order are also validated, including for
members later excluded from current effectiveness. Only exact-Requirement
members receive that Requirement's eligibility rule and fact or revision
comparison. Required expiration context still applies to every exact-Requirement
Decision currently considered under **APPROVAL-VALIDITY-013**, including before
a decisive outcome, but not solely because an unrelated or lifecycle-excluded
Decision has an expiration. Existing portable errors apply at their defined
boundaries; M2 introduces no total priority among unrelated failures.

The compatibility comparison is:

| Dimension | M2 conclusion |
| --- | --- |
| Required input and output shape | Unchanged; no member, envelope, operation, registry, or transport was added. |
| Success and failure boundary | The coherent Core 2.0 rule in **APPROVAL-DECISION-012** already requires same-scope unrelated Decisions not to affect the evaluated Requirement. M2 narrows the conflicting evaluation wording in **APPROVAL-DECISION-013** while retaining its context-and-subject isolation. |
| Result | Unchanged: permitted unrelated evidence contributes no outcome; foreign-scope evidence fails. |
| Portable error | Unchanged: invalid structure or scope uses `FINKORE_APPROVAL_INVALID_DECISION`, exact-Requirement ineligibility uses `FINKORE_APPROVAL_INELIGIBLE_ACTOR`, and missing or malformed required expiration context uses `FINKORE_APPROVAL_INVALID_CONTEXT`. |
| Mutation and atomicity | Unchanged: committed Decision and lifecycle history is append-only and all specified failures preserve both histories. |

This is a patch-compatible correction, provisionally Core 2.0.1, rather than a
new behavior surface. **APPROVAL-DECISION-013** retains its published identifier
because its owning meaning remains scoped identity and foreign-scope rejection;
the edit resolves its overbroad collection-evaluation sentence against the
already-published unrelated-evidence obligation. No requirement, vector,
portable-error, or operation identifier is added, replaced, retired, or
reused. CoreDoc's Approval integrity, attribution, identity, determinism, and
rejected-action obligations remain aligned and require no change.

Consumers need no history rewrite or evidence relabeling. They preserve the
original context and subject, validate all retained evidence, select exact
Requirement identity only for Requirement-specific evaluation, and keep
Decision identity unique across Requirements in one context. The four B2
fixtures and all other derived acceptance and public-guidance changes remain
untouched for M3; this milestone establishes their owning normative rule first.

Verification used Node `v24.15.0`. `npm ci --no-audit` installed the five
locked maintenance dependencies, and `npm run verify` passed: 30 tool tests,
47 manifest files, 1,818 vectors, 447 requirement references, 20 canonical
Agentic operations, documentation links, architecture, and licensing. The
stable-publication gate remains reserved for M5 after removal of this active
plan.

## M3 Synchronize Approval acceptance artifacts

Repair the four B2 cases according to M2's accepted rule:

| File | Vector |
| --- | --- |
| [approvals/decisions.json](../conformance/approvals/decisions.json) | `approval.requirement.wrong-association-001` |
| [approvals/validity.json](../conformance/approvals/validity.json) | `approval.validity.requirement-superseded-not-transferred-001` |
| [approvals/construction-evaluation-regressions.json](../conformance/approvals/construction-evaluation-regressions.json) | `approval.boundary096.excluded-context-unrelated-001` |
| [approvals/corrections-098.json](../conformance/approvals/corrections-098.json) | `approval.eligibility.unrelated-history-not-misclassified-001` |

- [x] **M3.1 Correct the intended associations.** For cases retained as valid
  unrelated-Requirement controls, replace synthetic foreign subjects with the
  evaluated subject and keep the different Requirement ID. Align all scoped
  lifecycle references and observations. If M2 rejects that population, retire
  or replace cases explicitly rather than silently discarding their obligations.
- [x] **M3.2 Cover each population.** Publish positive and negative controls for
  same-scope matching Decisions, permitted unrelated Requirements, a foreign
  subject ID, a foreign subject type, a foreign context, and malformed unrelated
  evidence. Include equal facts/bare IDs across scopes so those shortcuts fail.
  Expected errors come from the reviewed specification.
- [x] **M3.3 Preserve complete evaluation coverage.** Include unrelated evidence
  with an Actor outside the evaluated Requirement's eligibility and with an
  expiration but no evaluation instant, wherever M2 permits that population.
  Matching Decisions still require the existing eligibility/context checks.
  Use decisive-outcome controls with malformed evidence before and after a
  valid Decision to detect premature return.
- [x] **M3.4 Preserve lifecycle and identity controls.** Review supersession
  without approval transfer, malformed/unresolved/foreign lifecycle references,
  duplicate Decision IDs across Requirements in one context, and distinct IDs
  for equal Actor/timestamp tuples. Retain unchanged Decision and lifecycle
  observations on failed non-mutating operations.
- [x] **M3.5 Update discovery and traceability.** Add new files to the manifest
  only when needed. Ensure unique stable IDs, valid requirements, controls that
  resolve through the manifest, and accurate coverage classifications. Recompute
  totals from the active inventory; do not copy historical counts into the new
  release summary or label untested cases as financially executed.
- [x] **M3.6 Synchronize public guidance.** Update Approval fixture definitions,
  Agentic scope notes, implementation and consumer guidance, and examples affected
  by M2. Approval operations remain conformance-local. Review relevant effects,
  errors, and safety statements for consistency; preserve unchanged canonical
  operation contracts and describe any accepted supersession when applicable.
- [x] **M3.7 Keep verification domain-neutral.** Assess whether existing schema
  or reference checks need an update. Any maintained check must validate artifact
  structure or metadata, not evaluate Approval outcomes. Add meaningful tool
  tests only if tool behavior changes; do not build a financial runner to close
  these findings.

**M3 exit:** Every acceptance expectation follows M2. No valid unrelated case
uses a foreign subject accidentally, no malformed evidence escapes validation,
and specification, traceability, Agentic notes, and consumer guidance agree.

### M3 completion record — completed 2026-10-04

The four named B2 cases now use the evaluated Requirement's exact subject while
retaining a different Requirement identity, their existing outcomes, and their
intended eligibility, expiration-context, and no-transfer observations. The
manifest-wide scope review also repaired the malformed-unrelated control so its
missing `subjectFacts` remains the sole structural defect, plus four valid
Requirement-supersession histories whose successor reference previously used a
synthetic foreign subject. Decision and lifecycle evidence in every successful
affected case now stays within one context and exact subject.

The published population controls cover:

- matching Decisions in the evaluated Requirement's scope;
- structurally valid same-scope Decisions for another Requirement;
- same-scope unrelated evidence with an ineligible Actor and with expiration
  but no evaluation instant;
- foreign context with equal Requirement identity, subject, and facts;
- foreign subject identity with equal context, Requirement identity, and facts;
- foreign subject type with equal context, Requirement identity, subject ID,
  and facts; and
- malformed unrelated evidence after a decisive matching Decision, together
  with existing malformed-before-valid and malformed-after-valid controls.

Four new vectors in the existing `approvals/stronger-contract.json` file cover
collection-level foreign subject ID and type, a foreign-context withdrawal
reference, and a foreign-subject Requirement-supersession reference. The latter
two observe unchanged Decision and lifecycle histories. The existing duplicate-
Decision-identity case now uses two Requirements in one context, while the
equal-tuple controls retain distinct identities. Existing missing, malformed,
duplicate, already-used, and tuple-reference lifecycle controls remain intact.

The cross-context, cross-subject, cross-subject-type, and duplicate-identity
record/evaluation cases now reference **APPROVAL-ERROR-005**, which owns failure
preservation for non-lifecycle Approval operations. The new lifecycle failures
reference **APPROVAL-ERROR-006**. Traceability was regenerated from the active
manifest mapping and now records 1,822 vectors in 47 files, 447 requirements,
and 35 operation identifiers. No manifest, schema, format version, requirement
ID, portable error, or operation identifier changed.

Approval fixture definitions, conformance conventions, Agentic scope notes,
implementation guidance, consumer claim guidance, mutation-sensitive review
notes, and Unreleased notes now state the M2 population and selection rule.
Approval labels remain conformance-local; no runner, registry, transport,
implementation, or Agentic Approval operation was introduced. Existing schema
and repository tools already validate the required artifact structure and
references, so M3 required no domain logic or tool-test change.

Verification used Node `v24.15.0`. `npm ci --no-audit` installed the five
locked maintenance dependencies, and `npm run verify` passed: 30 tool tests,
47 manifest files, 1,822 vectors, 447 requirement references, 20 canonical
Agentic operations, documentation links, architecture, and licensing. The
stable-publication gate remains reserved for M5 after removal of this active
plan.

## M4 Review the integrated contract

- [x] **M4.1 Review financial semantics adversarially.** Read the final diff in
  source-of-truth order. Derive each changed expected result from a requirement.
  Check one-nanosecond expiration boundaries, equivalent offsets, excessive
  precision, complete scope matching, unrelated evidence, retained lifecycle
  structure, Entity priority, and failure atomicity. Do not treat a schema pass
  as proof of those conclusions.
- [x] **M4.2 Assess defect resistance.** Confirm the cases would distinguish
  missing identity validation, timestamp truncation, matching only bare IDs or
  facts, filtering foreign scope before validation, applying eligibility to
  unrelated Requirements, skipping excluded structure, and evaluating target
  validation before malformed context. Use case reasoning here; actual financial
  execution and implementation mutation testing remain consumer-owned.
- [x] **M4.3 Run local verification.** Use supported Node, run
  `npm ci --no-audit` and `npm run verify`, and resolve applicable failures.
  Verify links and whitespace in newly added files as well as tracked diffs.
  Repeat checks after relevant changes.
- [x] **M4.4 Confirm the release classification.** Reassess the integrated diff,
  including any new issue found in M0/M4. Finalize patch, minor, or major treatment
  and migration wording. Keep unresolved behavior disclosed rather than assigning
  unsupported expectations. Any unresolved high-priority contract contradiction
  prevents promotion to a stable baseline.

**M4 exit:** B1 and B2 resolution conditions and C1's intended priority are met,
applicable local verification passes, and reviewers can account for the changed
financial observations. Check results remain limited to repository artifacts.

### M4 completion record — completed 2026-10-04

The integrated review read CoreDoc, the changed Approval specifications, every
changed conformance case and traceability row, the Agentic scope note, and the
implementation, consumer, and release guidance in source-of-truth order.
CoreDoc governance metadata and foundation rules are unchanged. The result
aligns with complete validation, rejected-action atomicity, Approval attribution
and retained history, stable scoped identity, material presence distinctions,
and deterministic explicit context under **CORE-002.2**, **CORE-002.3**,
**CORE-004.1** through **CORE-004.4**, and **CORE-005.1** through
**CORE-005.3**.

The changed observations derive as follows:

| Boundary | Reviewed derivation |
| --- | --- |
| One nanosecond before expiration | The Decision is not expired under **APPROVAL-VALIDITY-009** and remains `APPROVED`; exact nine-digit comparison follows **SPEC-TIMESTAMP-004/005**. |
| Equivalent-offset instant and one nanosecond after | Equality is expired and the later instant remains expired, so no effective approval remains and the Requirement is `PENDING`. |
| Ten-digit evaluation instant | Excess portable precision is invalid context under **SPEC-TIMESTAMP-004**, **APPROVAL-VALIDITY-008**, and **APPROVAL-ERROR-007**. |
| Ten-digit candidate Decision instant | The candidate is invalid under **APPROVAL-DECISION-006**; **APPROVAL-ERROR-005** preserves the complete retained scoped history. |
| Same-scope other Requirement | **APPROVAL-DECISION-012/013** require complete structure, exclude the member from the evaluated Requirement's eligibility and outcome, and yield `PENDING` where no matching effective Decision exists. |
| Unrelated expiration and eligibility | **APPROVAL-VALIDITY-013** does not demand an instant solely for the unrelated expiration, and **APPROVAL-DECISION-012** does not apply the evaluated Requirement's eligibility rule to that Actor. |
| Foreign context or subject | The evidence is invalid under **APPROVAL-DECISION-013**, not filterable unrelated evidence; failed operations preserve the requested histories. |
| Requirement supersession | Same-scope lifecycle references remain valid, predecessor approval does not transfer under **APPROVAL-VALIDITY-011**, and foreign-scope references fail under **APPROVAL-VALIDITY-014/017**. |
| Entity malformed context plus rejecting target rule | The well-formed `positive-money` rule would reject zero EUR under valid context, but scalar `facts` returns `FINKORE_WORKFLOW_INVALID_CONTEXT` first under **WORKFLOW-ERROR-008** and **ENTITY-LIFECYCLE-009**, preserving Entity and facts. |

The adversarial case review confirms the published cases distinguish the
plausible mutations named by M4.2:

- removing required Requirement/Decision identity fails the repaired timestamp
  and stronger-contract controls;
- reducing timestamps to milliseconds or microseconds changes the before/equal/
  after nanosecond outcomes, while lexical comparison fails the equivalent-
  offset control;
- matching only bare Requirement IDs or equal facts accepts the foreign-context
  and foreign-subject cases that must fail;
- filtering before scope and structure validation turns foreign or malformed
  evidence into false `PENDING` or decisive success;
- applying the evaluated eligibility rule to another Requirement turns the
  valid unrelated-Actor case into `FINKORE_APPROVAL_INELIGIBLE_ACTOR`;
- skipping expired, stale, withdrawn, superseded, earlier, later, or unrelated
  malformed evidence defeats existing complete-validation controls;
- collapsing Decision identity by tuple or Requirement accepts the cross-
  Requirement duplicate while breaking distinct equal-tuple lifecycle cases;
  and
- running target-State validation before malformed guard context changes C1 to
  `FINKORE_ENTITY_VALIDATION_FAILED`, while ignoring the target rule makes its
  paired valid-context failure pass incorrectly.

The final compatibility classification is patch-compatible Core 2.0.1. The M1
fixture repairs supply fields already required by Core 2.0 and preserve their
results, errors, and failure observations. M2 resolves the internal collection-
evaluation wording in favor of the already-published unrelated-evidence rule
while retaining foreign-scope rejection. M3 changes invalid fixture associations
to supported same-scope inputs and adds regression coverage; it does not change
artifact syntax or an operation contract. Required input/output shape, success
and failure conditions for supported inputs, portable errors, mutation effects,
and atomicity are unchanged. No requirement, vector, portable-error, or canonical
operation identifier is retired or reused, and consumers need no stored-history
rewrite or relabeling. Current Core status remains unchanged until M5 performs
the separate publication preparation.

The read-only adversarial audit passed for timestamp precision, scoped identity,
history population, eligibility, expiration context, lifecycle relationships,
failure atomicity, and Entity priority. Verification used Node `v24.15.0`;
`npm ci --no-audit` installed the five locked maintenance dependencies and
`npm run verify` passed 30 tool tests, 47 manifest files, 1,822 vectors, 447
requirement references, 20 canonical Agentic operations, documentation links,
architecture, licensing, and whitespace. These checks validate repository
artifacts only; consumer-owned financial execution and mutation testing remain
outside the repository. The stable-publication and network-backed dependency
gates remain reserved for M5.

## M5 Prepare stable publication

Follow the existing [stable release procedure](../CONTRIBUTING.md#stable-release-procedure)
and [publication gate](tools/README.md#stable-publication-gate).

- [ ] **M5.1 Prepare the selected release metadata.** Update current-facing
  Core status consistently across the required documents and Learn index.
  Review `TARGET_CORE_VERSION` in
  [check-release-content.js](tools/check-release-content.js), its tests, and tool
  guidance for the selected release. Preserve historical release claims,
  CoreDoc evolution metadata, stable identities, and separate format versions.
- [ ] **M5.2 Prepare a disposable publication tree.** Copy the intended release
  content without checkout state, temporary reports, or plans. Include the
  proposed final metadata and run `npm run release:check -- /absolute/path/to/tree`.
  Inspect the proposed file list and rendered Learn layout and keyboard behavior.
  Do not promote the working contract early just to pass this stricter gate.
- [ ] **M5.3 Complete documentation lifecycle.** Keep enduring rules in existing
  contributor, tool, implementation, and consumer guidance. Preserve this plan
  and the resolved findings in ordinary Git history, then remove completed
  development documents from the final publication tree. Remove references to
  them; do not create an archive, closure report, or verification dependency on
  a planning file. Summarize the actual corrections and compatibility impact
  concisely in the existing release notes only when ready.
- [ ] **M5.4 Verify the actual final tree.** After final metadata updates and plan
  removal, run `npm ci --no-audit`, `npm run verify`, a fresh network-backed
  `npm run dependencies:audit`, and `npm run release:check`. Record the dependency
  review date, freshness, and maintenance-dependency scope in the concise release
  entry. Resolve failures; a successful disposable copy does not waive this gate.
- [ ] **M5.5 Finish the reviewed release.** Commit the verified final tree and
  create its new annotated `core-<version>` tag as part of the release task.
  Confirm the tag targets that commit and the checkout is clean. Keep `core-2.0`
  unchanged. Remote publication remains a separate maintainer action, not an
  implication of creating or completing this plan.

**M5 exit:** The selected new release has coherent status, concise accurate
release notes, no active or archived plans, passing required gates, and an
immutable tag targeting the reviewed tree. Claims describe published contract
consistency and artifact validation, not consumer implementation conformance.
