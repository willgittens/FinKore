# FinKore Core 2.0.2 Maintenance Plan

**Status:** Superseded development plan; the remaining M4 scope response was confirmed published on 2026-11-08. Subsequent release preparation is tracked in the [2.0.3 task list](core-2.0.3-task-list.md). This work did not republish 2.0.2 or establish the pending external reviewer acceptance.
**Date:** 2026-11-06.
**Baseline:** FinKore Core 2.0.2 stable.
**Purpose:** Strengthen the existing contract and maintenance tools before Core 2.1.

## Objective and version boundary

Improve artifact validation, coverage explanations, and consumer guidance while
preserving the published Core 2.0.2 financial behavior. This plan concerns work
on that baseline; it does not reopen or republish the existing 2.0.2 release.

Editorial and maintenance-tool improvements can proceed without inventing new
financial semantics. Any correction to published acceptance artifacts needs an
explicit compatibility and consumer-impact review. If a new release is needed,
select its version through the [compatibility policy](../spec/conventions.md#compatibility-policy)
and existing release procedure; do not silently replace the published 2.0.2
baseline or assume this plan authorizes a particular next version.

Idempotency implementation belongs to the separate
[Core 2.1 task list](core-2.1-task-list.md). This plan prepares its inputs without
accepting the unresolved policies in the
[idempotency draft](idempotency-concurrency-draft.md).

## Scope and priorities

| Workstream | Priority | Contract impact | Completion condition |
| --- | --- | --- | --- |
| M0 — Baseline and change classification | P1 | None | Existing behavior and validation conditions are understood. |
| M1 — Operation and portable-error consistency | P1 | Maintenance tooling | Unsupported operation/error associations are rejected where the current contract determines them. |
| M2 — Coverage terminology and evidence | P1 | Descriptive clarification unless claim obligations change | All five current PARTIAL rows have a consistent, justified interpretation. |
| M3 — Worked financial examples | P2 | Non-normative explanation | Money, Approval, and Entity examples explain existing results and preservation obligations. |
| M4 — Guard dependency decision for 2.1 | P1 | Scope decision only | The existing authoring limitation and its implications for idempotency have an explicit disposition. |
| M5 — Compatibility review and validation | P1 | Maintenance process | The resulting change passes applicable checks and has a reviewed compatibility classification. |

M0 precedes implementation. M1, M2, and M3 are independently reviewable after
M0. M4 informs the relevant Core 2.1 decisions without blocking unrelated
maintenance work. M5 integrates and verifies completed changes.

Priorities are planning recommendations, not changes to GitHub Issue metadata.
Checked tasks are complete; unchecked tasks remain outstanding. Milestone labels
are not stable requirement identifiers.

## M0 — Establish the baseline

- [x] Read [CoreDoc](coreDoc/core-doc.md), the owning specifications,
  manifest-listed cases, [traceability](../conformance/traceability.md), and
  affected [Agentic descriptors](../agentic/operations.md), in that order.
- [x] Confirm the starting inventory: 447 requirements, 1,822 vectors in 47
  files, 35 conformance operation labels, and 20 canonical Agentic operations.
  Distinguish conformance-local labels from advertised capabilities.
- [x] Classify each proposed change as editorial, tooling, an existing-behavior
  conformance correction, or a normative proposal. Record consumer impact in
  its review description and existing guidance where enduring explanation is needed.
- [x] Preserve stable requirement/vector/operation IDs, portable errors,
  financial outcomes, failure atomicity, and CoreDoc governance metadata.
- [x] Check the supported Node runtime and install locked dependencies using
  the [developer-tool instructions](tools/README.md).
- [x] Resolve local checkout contamination safely. Relocated the untracked
  legacy `implementations/` and `runner/` directories to the ignored local
  `.tools/legacy-checkout-pre21-hKUDPs/` directory. Preserved all 795 regular
  files and their modes; rebased three internal absolute sandbox links and
  verified that they still resolve to the same relocated objects. No file was
  deleted and no architecture rule was weakened.

At M0 completion, the `docs/coreDoc/`, `spec/`, `conformance/`, and `agentic/`
trees matched the local published `2.0.2` tag. Discovery through the manifest confirms six
suites, 47 files, and 1,822 vectors. Of the 35 operation labels, 20 are canonical
Agentic operations and 15 remain conformance-local. The existing coverage
inventory remains 363 COVERED, five PARTIAL, and 79 NOT DIRECTLY TESTABLE across
447 requirements; M0 changes none of those classifications.

The supported local runtime is `.tools/node/bin/node` version 24.11.1 with npm
11.6.2. Locked installation completed with `npm ci --no-audit --offline` using
the existing local cache. This installation did not query vulnerability advisories.

### Change classification for subsequent milestones

| Proposed work | Classification | Consumer impact and boundary |
| --- | --- | --- |
| M1 operation/error association checks and negative tool fixtures | Tooling | Reject inconsistent repository artifacts where existing rules determine the association. Preserve valid cases and legitimate cross-domain failures; non-exhaustive descriptors are not closed catalogs. |
| M1 case/observation shape checks | Tooling, subject to format review | Enforce only already-published structure. Preserve intentionally invalid domain inputs; any new format obligation needs a separate compatibility decision. |
| M2 coverage definitions, rationale, and synchronized counts | Editorial clarification | Explain existing evidence limits, optional choices, and recommendation exceptions. Changes to claim obligations are normative proposals outside this cleanup. |
| M2 checker/test synchronization | Tooling | Enforce only reviewed coverage metadata; do not infer financial coverage from structural validation. |
| M3 Money, Approval, and Entity walkthroughs | Editorial clarification | Explain current outcomes without imposing aggregation, reapproval, accounting, or production API policies. |
| M4 guard-dependency alternatives and 2.1 handoff | Scope decision | The current declaration limitation remains. New schemas, errors, required facts, or idempotency semantics remain unaccepted normative proposals. |
| M5 compatibility review, Learn synchronization, and verification | Maintenance process and derived documentation | Preserve the published baseline and classify any later correction explicitly before choosing a release version. |
| Deferred opportunities | Separate proposals | No new behavior, capability, conformance obligation, or release commitment is accepted by M0. |

No published vector correction is selected at this milestone. A later discovery
that requires changing an expected result must be investigated against the
owning specification and classified under the compatibility policy before editing
the artifact. Reclassification of coverage cannot waive a financial obligation.

**Exit:** implementation can proceed against a known baseline without changing
financial behavior through maintenance decisions.

## M1 — Validate operation and portable-error associations

Before M1, the [conformance validator](tools/validate-conformance.js) checked that
an expected error existed in the consolidated specification catalog. A temporary
probe replacing `money.add.currency-mismatch-001`'s
`FINKORE_MONEY_CURRENCY_MISMATCH` with
`FINKORE_WORKFLOW_INVALID_TRANSITION` was accepted by conformance, traceability,
and Agentic checks. The probe changed only a temporary copy; it identifies a
missing maintenance check, not an incorrect published vector.

- [x] Inspect error declarations in [shared conventions](../spec/conventions.md#error-codes),
  owning domain error documents, [conformance operation contracts](../conformance/operations.md),
  and Agentic descriptors. Identify which operation/error associations are
  exhaustive and which intentionally remain open.
- [x] Select one maintained representation for associations that the current
  specification determines. Keep its authority, update process, and references
  explicit; avoid conflicting registries or semantics defined by a fixture.
- [x] Validate declared associations without inferring them from a shared name
  prefix. Composed operations can legitimately preserve another domain's error;
  for example, `ENTITY-EVOLUTION-027` requires such preservation.
- [x] Reject a globally known but unsupported error for an operation when the
  governing contract determines that it cannot apply. Retain the existing
  rejection of entirely undeclared portable errors.
- [x] Where the catalog is non-exhaustive or the association is undefined,
  document the limitation rather than inventing a closed financial rule. Route
  any proposed completion of that contract through specification review.
- [x] Add maintenance-tool tests with a valid original control, the Money-to-
  Workflow substitution above, an undeclared code, legitimate cross-domain
  propagation, and non-exhaustive-descriptor handling. Require the intended
  diagnostic and nonzero CLI result for rejected fixtures.
- [x] Review structural validation of case and observation shapes already
  defined by the operation contracts. Add checks only for demonstrated gaps;
  preserve malformed domain inputs intentionally used by negative vectors.
- [x] Keep financial calculations, error-precedence evaluation, and expected
  outcome generation outside repository tooling.
- [x] Update [Developer Tools](tools/README.md) and affected contributor or
  consumer guidance to describe the check's actual guarantees and limits.

The maintained representation is the non-normative
[error association table](../conformance/operations.md#error-association-checks)
in the existing operation contracts. It covers all 35 labels through explicit
catalog declarations and finite exclusions. The validator checks those
references and associations without parsing Agentic known-error prose as an
allowlist or deriving a domain from identifier spelling. Broad Entity
composition and non-exhaustive catalogs retain their documented limits.

The shape review retained the existing `0.1` schema: its closed envelopes are
protected by regression tests, while operation-specific payloads remain open to
deliberately malformed domain values. No new payload schema, vector, expected
result, financial requirement, portable error, or Agentic operation was added.

**Exit:** existing valid artifacts pass, demonstrated unsupported associations
fail, and the checker adds no financial behavior or new artifact-format rule
without the required compatibility review.

## M2 — Clarify coverage classifications

Use [Issue #14](https://github.com/willgittens/FinKore/issues/14) and the existing
[consumer guide](../conformance/consumer-guide.md) as starting points.

- [x] Review each current PARTIAL requirement separately:
  `MONEY-SERIALIZATION-006`, `WORKFLOW-GUARD-004`, `APPROVAL-DECISION-002`,
  `ENTITY-ERROR-002`, and `ENTITY-VALIDATION-005`.
- [x] Distinguish an optional parser branch, an authoring-schema limitation,
  native history ownership, and recommended diagnostics. State the behavior
  exercised, the boundary left unproven, and applicable consumer evidence.
- [x] Prefer a coherent clarification of the existing vocabulary when it can
  express these distinctions. If classification changes are needed, review
  every affected row and explain the rationale before recomputing totals.
- [x] Preserve MUST, SHOULD, and MAY meanings, justified recommendation
  exceptions, and existing case-applicability choices. Do not turn permissions
  or recommendations into mandatory portable observations.
- [x] Keep native/deployment evidence distinguishable from portable cases.
  Do not promote a row merely because a schema check or local example passes.
- [x] Keep `WORKFLOW-GUARD-004`'s external-dependency representation limitation
  visible unless accepted work actually resolves it.
- [x] Synchronize traceability definitions, affected rows and totals,
  conformance README, consumer guidance, and applicable maintenance-tool checks.
- [x] Add or adjust tool tests only where the reviewed classification or
  evidence structure requires enforcement. Confirm existing valid controls pass.

The selected change is descriptive clarification: the existing vocabulary and
all five PARTIAL classifications remain. The
[individual explanations](../conformance/traceability.md#interpreting-the-five-partial-requirements)
separate the optional parser choice, mandatory guard authoring boundary,
Approval association evidence, and two diagnostic recommendations. They also
state that no manifest vector directly maps `WORKFLOW-GUARD-004`; related local
cases do not supply its missing dependency-declaration representation.

The inventory remains 447 requirements: 363 COVERED, five PARTIAL, and 79 NOT
DIRECTLY TESTABLE. All requirement modalities and direct vector references are
preserved. No conformance-claim obligation, conditional-case applicability,
normative rule, vector result, or artifact format changed. Checker code and tests
need no modification because the classification vocabulary and evidence syntax
are unchanged; the existing valid controls and adversarial metadata tests remain
the applicable verification.

**Exit:** the coverage vocabulary agrees with the five rows and consumer
guidance. Any proposal changing conformance-claim obligations is separated for
normative approval rather than bundled as descriptive cleanup.

## M3 — Add worked examples of existing behavior

Choose a primary home in the [implementation guide](implementation-guide.md)
or existing domain examples. Use cross-links rather than duplicate walkthroughs.
Every example is non-normative and states its inputs, operation order, explicit
policy/context, intermediate observations where relevant, and governing rules.

### Money rounding

Starting point: [Issue #11](https://github.com/willgittens/FinKore/issues/11),
[Money arithmetic](../spec/money/arithmetic.md), and
[rounding](../spec/money/rounding.md).

- [x] Explain component rounding versus rounding the exact total, without
  selecting a universal invoice, tax, fee, or aggregation policy.
- [x] Include a negative-value case distinguishing DOWN from FLOOR.
- [x] Distinguish calculation scale, currency minor units, and presentation.
- [x] Explain exact division with a supplied coarser rounding policy under
  `MONEY-ARITHMETIC-010` and `MONEY-ARITHMETIC-011`.
- [x] Have the arithmetic independently reviewed and link existing relevant
  vectors discovered through the manifest.

### Approval facts and preserved history

Starting point: [Issue #12](https://github.com/willgittens/FinKore/issues/12),
[Approval Decisions](../spec/approvals/decisions.md), and
[Approval Validity](../spec/approvals/validity.md).

- [x] Show a relevant fact changing, the Decision remaining in history, and
  its contribution to current approval becoming ineffective.
- [x] Pair that example with an unrelated fact change under explicit selection.
- [x] Explain whole-fact comparison, exact structural/type distinctions, scoped
  context/subject identity, and history-only evaluation limits.
- [x] Keep present effectiveness separate from historical reconstruction,
  authorization, and application-owned materiality/reapproval policy.

### Entity evolution

Starting point: [Issue #13](https://github.com/willgittens/FinKore/issues/13),
[Entity Evolution](../spec/entities/evolution.md), and
[Audit Relationships](../spec/audit/relationships.md).

- [x] Show correction, reversal, void, and supersession as separate
  before/request/after sequences with consumer-declared eligibility.
- [x] Identify preserved identity, original facts, Revision/currentness,
  Evolution Relations, and corresponding required Audit evidence.
- [x] Include a rejected operation showing unchanged Entity and Audit
  observations where required by the governing contract.
- [x] Avoid ledger entries, tax consequences, payment effects, or a new
  concrete financial entity specification.

The [worked examples](implementation-guide.md#worked-examples) are the primary
home for all three subjects. Fourteen cited vector IDs were resolved through
the manifest, covering the underlying primitives and preservation controls;
none selects a universal aggregation, reapproval, or accounting policy.
No demonstrated coverage gap required a new vector or traceability row.

Arithmetic review used independent exact `bc` calculations of the sums,
negative rounding candidates, terminating quotient, and rounding boundaries,
cross-checked against existing primitive cases. This is a computational
cross-check, not external reviewer sign-off or execution of a consumer's
financial implementation. No calculation tool or financial test was added to
the repository.

The Learn readers were regenerated. Desktop and mobile review identified
compressed table columns; document tables now retain a minimum readable width
inside their existing horizontal scroll containers. CoreDoc, normative rules,
portable errors, stable identifiers, conformance artifacts, and Agentic metadata
remain unchanged. The change is explanatory documentation and reader styling.
Locked dependencies were installed with `npm ci --no-audit` using the local
cache. On Node 24.11.1, `npm run verify` passed on the actual development tree,
including all 61 tool tests and generated-reader synchronization checks.

**Exit:** reviewed examples explain existing rules. Add conformance vectors only
for a demonstrated coverage gap in already-defined behavior; do not duplicate
existing cases merely to accompany prose.

## M4 — Resolve the guard dependency boundary for Core 2.1

Starting point: [Issue #15](https://github.com/willgittens/FinKore/issues/15),
CoreDoc `CORE-005.3`, [Workflow Guards](../spec/workflow/guards.md), and the
Core 2.1 scope/semantic decisions.

- [x] Identify which external-dependency declarations the current obligation
  requires and what the published portable representation does not define.
- [x] Compare a bounded authoring schema with continued consumer-authored
  declarations and explicit review/evidence obligations.
- [x] Explain how either choice affects the complete instruction and explicit
  facts bound by a future idempotency profile. Separate caller instructions,
  current-state observations, and external fact provenance.
- [x] Record the maintainer's scope and compatibility decision in the existing
  discussion/Issue and relevant active 2.1 planning section. Place enduring
  accepted guidance in its owning documents.
- [x] If a new schema, rejection condition, serialization, or obligation is
  selected, scope it as specification-first follow-up work. This maintenance
  plan does not approve those new semantics.
- [x] Carry any unresolved behavior as an explicit limitation or dependency
  for the affected 2.1 mapping. Do not claim the full RFC must be implemented
  before unrelated maintenance can land.

Maintenance disposition: keep consumer-authored declarations under the existing
obligation and defer the portable schema. The comparison, concrete time/source
examples, compatibility classification, and per-mapping limitations are in the
[2.1 planning section](core-2.1-task-list.md#guard-dependency-disposition-before-21)
and synchronized draft. Existing obligations and non-normative review prompts
are explained in [Workflow Guards](../spec/workflow/guards.md#external-dependency-declarations-non-normative)
and linked consumer guidance. This does not accept new 2.1 behavior.

WORKFLOW-GUARD-004 remains PARTIAL, with no directly mapped vector. Current
fixture syntax, requirement IDs/modalities, errors, financial results, failure
atomicity, and CoreDoc metadata remain unchanged. No new schema, artifact-format
member, conformance case, claim field, or Agentic capability was introduced.
The schema alternative is separately scoped follow-up work if later accepted.

Locked dependencies were installed with `npm ci --no-audit` from the local
cache on Node 24.11.1. After correcting a CoreDoc fragment link, `npm run verify`
passed on the actual development tree, including all 61 tool tests. Learn was
regenerated and its affected reader reviewed in desktop and mobile viewports.
No financial implementation was executed; a fresh dependency advisory review
was not required by this documentation-only change.

The original 2026-11-07 check had no authenticated publication capability.
A read-only API check on 2026-11-08 confirmed the maintainer's
[published Issue #15 response](https://github.com/willgittens/FinKore/issues/15#issuecomment-6705220539).
It records the maintenance scope disposition, keeps the RFC open, and approves
no new schema or contract. This resolves the remote-recording task; later
release preparation and outstanding example reviews belong to the 2.0.3 plan.

### Prepared Issue #15 wording — published disposition confirmed

**M4 maintenance scope disposition — 2026-11-07**

Retain consumer-authored external-dependency declarations under the existing
Core 2.0.2 contract; defer a new portable authoring schema. The current local
change is a **Clarification**, with unchanged observable behavior under
SPEC-COMPATIBILITY-011. This is a maintenance scope decision, not approval of
the proposed 2.1 profile or implementation of this RFC.

WORKFLOW-GUARD-004 and CORE-005.3 already require relevant external dependence
to be identified. A supplied `windowOpen` or `screeningClear` Boolean can be
evaluated locally; it does not establish the time, policy, or external source
observation that produced it. Declaration, supplied value, and supporting
evidence remain distinct. Consumer review prompts add no required claim fields
or universal provenance/retention model.

A bounded schema could standardize declaration identities and associations,
but would need accepted requiredness, omission/null, incomplete/malformed-input,
validation/error, evidence, and format-compatibility rules. These are separate
specification-first follow-up decisions. The selected consumer-authored path
introduces none of them and preserves the existing portability limitation.
WORKFLOW-GUARD-004 stays **PARTIAL**, with no directly mapped vector; local
guard controls and native ownership tests do not close that authoring boundary.

For future `finkore.workflow.transition` and `finkore.entity.transition` profile
mappings, separately identify the complete caller instruction, authoritative
current-state observations, and outcome-relevant external provenance. Resolve
capture/admission order, comparison significance, binding, and recovery meaning
before declaring either mapping complete. A schema alone would not answer
those questions. Fully explicit mappings can progress independently; live
dependencies with undefined capture/comparison remain blockers for their mapping
and dependent claims, without requiring the whole RFC before other maintenance.

There are no changed portable errors, operation IDs, required serializations,
financial outcomes, failure atomicity, or CoreDoc governance metadata. No
consumer migration or format bump is required by this clarification. A future
schema needs its own Core/format compatibility review and coordinated
specification, conformance, traceability, and Agentic changes where applicable.
No provider integration, callback API, guard DSL, or financial execution is added.
The RFC remains open for any separately accepted portable-schema work.

References: [CORE-005.3](https://github.com/willgittens/FinKore/blob/main/docs/coreDoc/core-doc.md),
[Workflow Guards](https://github.com/willgittens/FinKore/blob/main/spec/workflow/guards.md),
[conformance conventions](https://github.com/willgittens/FinKore/blob/main/conformance/conventions.md#declarative-fixtures),
[traceability](https://github.com/willgittens/FinKore/blob/main/conformance/traceability.md),
and [compatibility policy](https://github.com/willgittens/FinKore/blob/main/spec/conventions.md#compatibility-policy).

**Exit:** 2.1 work has an explicit dependency decision and does not guess missing
guard semantics from a fixture, callback API, or external provider.

## M5 — Review compatibility and verify delivery

- [x] Review the diff against the exact published baseline for changed
  requirements, portable errors, stable identifiers, operation contracts,
  serializations, applicability, and failure atomicity. Tool assistance may
  highlight changes; semantic compatibility remains a review decision.
- [x] Confirm no CoreDoc financial obligation or governance metadata changed
  during editorial work. Review any substantive proposal separately.
- [x] Confirm any conformance addition derives from current specification and
  has correct traceability, boundary/negative controls, and mutation intent.
- [x] Update affected Agentic metadata only where synchronization is required;
  do not advertise idempotency, new operations, or new safety guarantees.
- [x] Synchronize current-facing guidance and regenerate affected Learn
  readers with `npm run learn:build`. Review generated output and presentation
  when its sources change.
- [x] Run `npm ci --no-audit` and `npm run verify` on the actual development
  tree with Node `>=24.11.0 <25`. Report actual-tree failures separately from
  any isolated clean-copy results.
- [x] Run `npm run dependencies:audit` separately when a fresh dependency
  review is required, recording its date and advisory-data scope.
- **Publication only — not triggered by M5:** If preparing a stable publication,
  select its version deliberately,
  complete ordinary verification, and exercise `npm run release:check` on a
  disposable proposed-release tree. Repeat required checks on the actual
  final tree before tagging, as described in [Developer Tools](tools/README.md).
- **Before stable publication — still required:** Move enduring procedures into existing
  guidance and remove completed/active planning artifacts from the publication
  tree and its links. Preserve unrelated user-owned planning work safely;
  stable publication requires a genuinely plan-free final tree.
- **Release only — not applicable to this review:** Record only a concise actual release summary in
  [release notes](releases/README.md) when appropriate. Do not create closure,
  alignment, provenance, checksum, or review-evidence documents.

Review completed on 2026-11-07 against the local published `2.0.2` tag at
`953a2aca22681ff1a81897c732e9fc7a3a14087e`, with maintenance changes through
`9b6f54a29df1f95ab19b4dc275d41099fd46efb4`. The M1–M4 range was also isolated
from its parent, `080d098^`, to distinguish maintenance work from earlier Learn,
contributor-guidance, deployment, and toolchain changes already in the checkout.

| Reviewed surface | Result and compatibility classification |
| --- | --- |
| CoreDoc and normative specification | CoreDoc, including governance metadata, is unchanged from the tag. The only changed specification file is Workflow Guards; removing its added explicitly non-normative section reproduces the tagged file exactly. No changed obligation, portable error, or stable identifier. |
| Conformance artifacts and operation contracts | Manifest, schema, every vector file, and conventions are unchanged from the tag. Removing the new non-normative association section reproduces the original operation contracts exactly. No new expected result, serialization, input/output shape, error precedence, or failure-atomicity rule. |
| Traceability and consumer claims | All 447 requirement IDs, domains, modalities, classifications, and direct vector-reference lists match the tag. The five PARTIAL rationales are clarified without promotion. Consumer case-applicability and conformance-claim sections are unchanged. |
| Agentic Contract | Unchanged from the tag: 20 canonical operations, existing effects and safety metadata, no idempotency capability. No synchronization change is needed. |
| M1 maintenance checks | Tooling now rejects documented unsupported error associations. Valid published artifacts, negative domain inputs, composed errors, and non-exhaustive catalogs retain their controls. Consumers of financial behavior need no migration; artifact authors maintain the documented association metadata when changing operation contracts. |
| M2–M4 explanations and Learn | Editorial clarification under SPEC-COMPATIBILITY-011. Examples explain existing results; guard review prompts introduce no required declaration format, claim field, or provenance/retention regime. Presentation changes do not change financial behavior. |

The unchanged inventory is six suites, 47 vector files, 1,822 vectors, 35
operation labels, and 447 requirements: 363 COVERED, five PARTIAL, and 79 NOT
DIRECTLY TESTABLE. No conformance addition requires new traceability or a
consumer migration. Core and artifact-format versions remain unchanged; this
review does not select the version of a future publication.

Earlier checkout changes include the maintenance dependency `fast-uri` update
from 3.1.8 to 3.1.9, CSS-cache generation, Learn content, and deployment fixes.
They are outside the M1–M4 range and were preserved. Verification CI still uses
`npm run verify` with read-only repository permission and no deployment secrets;
the separate Learn workflow restricts hosting secrets to its `production`
Environment job. No deployment was executed by M5.

On Node 24.11.1 with npm 11.6.2, locked installation completed using
`npm ci --no-audit --offline` and the local cache. `npm run verify` passed on
the actual development tree, including all 61 tool tests, artifact checks,
traceability, documentation, licenses, and Learn synchronization. No isolated
clean-copy result substitutes for that run. Existing M3/M4 generated readers
and desktop/mobile review remain applicable: M5 changes only this active plan,
which is not a Learn source, so no reader regeneration was necessary.

Separately, `npm run dependencies:audit` queried fresh npm registry advisory
data on 2026-11-07 at 00:29 CET. Its bulk advisory request returned HTTP 200 and
reported zero vulnerabilities in the five-package locked maintenance graph.
This review does not cover external consumer dependencies or prove financial
implementation conformance.

At the original M5 review, the M4 comment remained unpublished because GitHub
authentication was unavailable. Its subsequent manual publication was confirmed
on 2026-11-08, resolving that follow-up. This superseded plan is preserved locally
until its reviewed state can be retained in ordinary Git history before release.
Other user-owned 2.1 planning files are preserved. No release was being prepared
at that earlier review, so neither a proposed-release tree nor the final-tree
`release:check` gate was run then. Those gates and removal of planning artifacts remain mandatory before
stable publication. No version, tag, release entry, or completed-release claim
was created.

**Exit:** completed work is reviewable, compatibility is explicit, and applicable
checks pass on their required trees. Artifact checks do not establish external
implementation conformance.

## Deferred opportunities

These remain separate proposals rather than completion conditions for this plan:

- Machine-readable Agentic discovery after its descriptor/version model is stable.
- Automated cross-version contract-diff assistance beyond the scoped review above.
- Learn navigation across requirement IDs, operations, and acceptance cases.
- New Audit path, recording-time, or initiating/represented-subject profiles.
- Universal Money capacity/overflow guarantees or new capacity errors.
- Historical Approval evaluation, maker-checker policy, and retention/disposal.
- Ledger posting, payment settlement, tax, FX sourcing, general distributed
  coordination, delegation, and implementation/runner/package surfaces.

The related public RFCs remain proposals. They are not implicitly accepted by
this plan or prerequisites for all Core 2.1 work.

## Definition of done

- [x] M1 rejects demonstrated unsupported operation/error substitutions while
  preserving legitimate composed errors and documented open catalogs.
- [x] M2 makes all five PARTIAL rows consistent with coverage definitions and
  consumer evidence obligations, without weakening normative requirements.
- [x] M3 delivers reviewed, non-normative examples for all three subject areas.
- [x] M4 provides an explicit guard-dependency disposition for affected 2.1 work.
- [x] M5 confirms compatibility, synchronized documentation, applicable checks,
  and an honest account of any remaining local limitation.
- [x] No new financial behavior, claim obligation, public API, runtime,
  transport, or future-domain commitment was introduced by maintenance tooling
  or explanatory examples.
