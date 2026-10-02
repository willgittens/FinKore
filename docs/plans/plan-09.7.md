# FinKore Core 0.9.7 Plan

## Status

**Complete — local FinKore Core 0.9.7 corrective release candidate.**
Milestones 1–9 and the accepted D1–D11 corrections are complete. Final combined
verification passes on the committed D11 candidate; the release changes only
reviewed documentation. The annotated local `core-0.9.7` tag identifies the
release commit. Earlier milestone evidence retains its historical scope.

Core remains `0.9-rc`, reference-package versions remain `0.1.0`, and conformance
syntax remains `0.1`. No remote push or package publication is included.
[Core 1.0 promotion](plan-10.md) remains a separate, uncompleted process.
The completed [0.9.6 release](plan-09.6.md) and all earlier corrective tags and
regressions are preserved.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) establishes
foundation obligations; `/spec` defines financial behavior. Recommendations
below have the explicit dispositions recorded in Milestone 1. Apply `SPEC-FREEZE-001`
through `004` and the compatibility rules in
[Specification Conventions](../../spec/conventions.md) before implementing
an unsettled financial outcome. Planning does not implement fixes, publish
packages, create a tag, or promote Core 1.0.

## Objective and scope

Close the seven finding families from the post-0.9.6 review: incomplete quorum
evidence, retained native values, invalid histories produced by successful
operations, incomplete composition validation, lost Entity declarations,
malformed-input failures, and inconsistent Approval fact semantics.

The release must also improve how related gaps are found. Classify the existing
exploratory discrepancies, exercise neighboring entry points and operation
sequences, and review the corrected candidate independently of the reported
examples. A passing existing suite, a high mutation percentage, or agreement
between implementations cannot substitute for checking the governing contract.

No new financial domain, general condition language, authorization model,
Approval delegation, Workflow migration, persistence, distributed ordering,
or accounting effects are included. Learn pages and presentation work may
proceed independently; they do not satisfy these readiness gates.

Financial validation belongs in implementation cores. Adapters preserve input
presence and translate results without inferring eligibility, repairing facts,
or selecting financial policy. The runner remains domain-neutral. Existing
conformance-local `approval.*` labels are not promoted to canonical Agentic
operations; canonical identifiers retain their existing meanings.

## Verified starting point

On 2026-09-27, the complete `npm run verify` ran on `4041ec2` and exited zero.
The working tree was clean before and after verification. This is a fresh full
baseline, not an inference from the 0.9.6 milestone records.

| Gate | Observed baseline |
| --- | --- |
| Builds, strict typing, unit/native and adapter tests | Passed on the configured runtimes; Python 3.12 and 3.13 checks passed. |
| Conformance | All 884 vectors passed on TypeScript, CPython 3.12, CPython 3.13, and Java, with no failed, unsupported, or infrastructure outcomes. |
| Coverage | All configured gates passed: runner 100% lines / 96.61% branches; TypeScript 99.67% lines / 99.47% branches; Python 92% combined statement/branch coverage; Java 92.85% lines / 81.82% branches. |
| Installed consumers | All six passed: npm, Python wheel and sdist on both Python versions, and Java JAR. |
| Runner mutation | 97.06%; 627 killed, 19 survivors, no uncovered mutants or timeouts. |
| TypeScript mutation | 96.69%; 4,069 killed, 131 survivors, 9 uncovered, 16 timeouts, and 69 existing ignored mutants. Without timeout credit: 96.31%. |
| Targeted mutation | 222/222 critical probes, 92/92 native probes, and 47/47 Python 3.13 native probes killed. |
| Repository checks | Toolchains, developer tools, architecture, documentation links, traceability, licensing, and whitespace passed. |

These results establish the behavior exercised by the existing tests. They do
not clear the findings below or establish that every surviving mutant is harmless.
Historical counts are not target counts for the corrected release.

The exploratory review varied 3,861 cases across 33 conformance operations and
logged 478 differences or exceptions. These are investigation leads, not 478
confirmed defects. The initial matrix used limited seeds, shallow variations,
and primarily status/error comparisons; it was not an exhaustive review of
success observations, native values, or stateful sequences. Targeted probes
and valid controls established the findings below. Execution of this plan must
reconstruct permanent cases from repository fixtures and contracts, without
depending on temporary files or conversation history.

To reconstruct that exploratory baseline, read the manifest, vector files, and
vectors in declared order on `4041ec2`; select the first successful vector for
each operation. Run its unchanged control, then independently replace each
visited input member with null, `{}`, `[]`, false, zero, or an empty string, or
omit it. Visit member paths of length one through three, taking at most the
first 100 own keys per object and the first element per array; skip omission
of array elements. Give each adapter a separate JSON-round-tripped copy and
preserve the seed's explicit context. The original sweep compared success/error
status and portable codes on TypeScript, Python 3.12, and Java, and retained
exceptions as leads. M2 expands those limits and adds Python 3.13; reproducing
the old count alone is not its acceptance criterion.

## Findings to resolve

Labels below are planning references, not new requirement identifiers. A
contract reference identifies the owning obligation; it does not settle every
representation or error-selection question raised by a malformed input.

| Finding | Reproduced observation and minimal trigger | Governing contract and disposition | Milestone |
| --- | --- | --- | --- |
| F1 — Quorum evidence | Remove `eligibleActors` from a valid approving quorum fixture: Python and Java still return `APPROVED`; TypeScript rejects it. Explicit null raises Python `TypeError`. Removing both outcome mappings also permits approval in Python/Java. | `APPROVAL-QUORUM-002`, `004`, `009`, `010`, `APPROVAL-COMPOSITION-010`/`024`, and Approval Errors. A declared voter is not eligibility evidence; outcome mappings must not be invented. Establish exact required fixture evidence and error category in M1. | 3 |
| F2a — Committed Approval ownership | Java `Approvals.recordDecision` retains an `AtomicInteger` inside `subjectFacts`. Changing it after recording changes the returned committed history from 1 to 999. | `APPROVAL-DECISION-002`/`007`, `CORE-004.3`: committed factual evidence cannot change through caller aliases. Decide the supported native value boundary before rejecting or copying additional classes. | 5 |
| F2b — Workflow definition ownership | A mutable `BigDecimal` subclass in a Java portable guard changes its textual value after definition construction. The same bound definition changes a transition from guard rejection to success without a version change. | `WORKFLOW-VERSION-003`, `WORKFLOW-GUARD-004`: retained definition semantics must remain immutable. Preserve exact supported values; do not rely on a mutable subclass as an immutable scalar. | 5 |
| F3 — Returned history becomes invalid | Withdraw a Decision, then record another Decision with the same Requirement, Actor, and decision instant but different facts. All implementations report successful recording; evaluation of the actual returned history rejects the now-ambiguous withdrawal reference. A distinct-instant control succeeds. | `APPROVAL-VALIDITY-014`, `APPROVAL-DECISION-007`, `APPROVAL-ERROR-005`/`006`. Preserve valid committed relationships when forming the proposed result; do not invent global uniqueness for every Decision. | 4 |
| F4 — Unreachable declarations escape validation | Add an unreferenced group with a self-cycle or an unresolved child reference to an otherwise valid composition. All implementations return an outcome. | `APPROVAL-COMPOSITION-004`, `006`, `024`, `APPROVAL-ERROR-008`/`010`: structural validation covers the entire declared definition, not only roots reached during outcome evaluation. | 3 |
| F5 — Entity declaration lost | In TypeScript, create an Entity whose initial state is `__proto__` with an own mutability entry allowing `memo`. Creation succeeds, but the observed definition loses that entry; `FinancialEntity.from(entity.definition, entity.toJSON())` throws a raw `TypeError`. | `ENTITY-MUTABILITY-001`/`002`/`004`, Entity declaration/import guarantees, and Workflow state semantics. Valid caller-defined names must survive retention and reuse without prototype behavior. | 6 |
| F6a — Malformed condition declaration | `condition.requiredFacts: null` raises Python `TypeError`; Java skips the fact checks and returns `APPLICABLE`; TypeScript returns invalid Decision. | `APPROVAL-CONDITION-001`/`006`, Approval Errors, and the bounded condition fixture. Distinguish malformed declaration from a valid declaration with unavailable facts; settle shape and exact errors in M1. | 4 |
| F6b — Malformed mutability declaration | `definition.mutability.DRAFT: null` raises Python `TypeError`; TypeScript/Java return `FINKORE_ENTITY_INVALID_MUTATION`. | Entity mutability, declaration validity, and Entity Errors. Confirm the declaration/error contract; do not conflate a malformed rule with valid immutable data. | 7 |
| F6c — Failure observation masks domain error | Entity evolution with `auditHistory: null` reaches Python adapter observation code that calls `.get` on null and raises `AttributeError`. TypeScript/Java return `FINKORE_AUDIT_INVALID_EVENT`. | `ENTITY-EVOLUTION-027`/`034`, `ENTITY-ERROR-004`, Audit Errors, and adapter result preservation. A failure-observation helper must not replace the core's domain result. | 7 |
| F7a — Undeclared relevance behavior | Requirement evaluation with changed current subject facts and omitted `relevantFactPaths` returns `PENDING` in TypeScript but `APPROVED` in Python/Java. With an explicit changed path, all return `PENDING`. | `APPROVAL-DECISION-003`/`009`, current-effectiveness invariants, and conformance conventions. Contract gap: choose and document the omitted-selector meaning without treating TypeScript as the oracle. | 1, 4 |
| F7b — Fact addressing differs | With required fact `invoice.amount` and facts `{invoice: {amount: "10"}}`, TypeScript returns `APPLICABLE`; Python/Java report unresolved. They interpret the selector differently. | `APPROVAL-CONDITION-001`/`005`/`006` and the bounded fixture. Specify selector syntax and own-member presence rules; no general condition expression engine. | 1, 4 |
| F7c — Native numeric fact equality | Java Decision evaluation compares `BigDecimal("1.0")` and `BigDecimal("1.00")` as different facts; the identical-scale control is effective. | Approval relevance/equality and native-to-portable value semantics require an explicit contract. This is not automatically a Money comparison defect. Preserve distinctions between numbers, strings, booleans, missing members, and null. | 1, 4, 5 |

| F10 — Native collection traversal | TypeScript `.map` skipped missing array positions; caller iterators/methods could hide invalid members or change guard/quorum/fact outcomes. | Existing collection/member, comparison and ownership requirements; `native-collections.test.ts` maps 32 boundaries to owning IDs, with adjacent fact/eligibility regressions in `review-invariants.test.ts`. No new semantics or JSON hole representation. | 3–7, corrected in 8 |

## Milestone 1 — Resolve contracts and compatibility

- [x] Read the owning specifications, conformance conventions/vectors,
      traceability, public APIs, and applicable Agentic descriptors for every row.
      Classify each as implementation defect, adapter defect, documentation
      mismatch, or unresolved contract, including lettered subcases.
- [x] Specify exact success observations, required evidence, portable errors,
      existing error priority, and failure effects before adding expectations.
      Do not extend composition error priority to unrelated Approval operations.
- [x] Resolve the decisions below. Record the selected options and compatibility
      consequences here; put normative obligations in their owning `/spec`
      documents and fixture representation in conformance conventions.
- [x] Clarify that successful record operations preserve the validity of retained
      lifecycle references against the proposed resulting history. Determine
      whether the existing rule needs clarification or a distinct new requirement.
- [x] Clarify validation of all declared composition groups, including disconnected
      components, without inventing actionability for unreferenced groups. Keep
      root-to-child depth semantics distinct from whole-definition cycle checks.
- [x] Reassess affected traceability rows. Existing COVERED mappings do not prove
      native ownership, returned-value reuse, or all required validation paths;
      use PARTIAL or BLOCKING SPEC GAP where warranted.
- [x] Apply freeze and compatibility rules to requiredness, selector meaning,
      native supported values, error mappings, and resulting-history validation.
      Preserve stable identifiers; materially new obligations need distinct IDs.

### Decisions and recommendations

The following recommendations were explicitly accepted together on 2026-09-27.
The resolution below fixes their detailed scope and compatibility consequences.
Execution of the plan alone was not treated as acceptance.

| Decision | Options | Recommendation to resolve in Milestone 1 |
| --- | --- | --- |
| D1 — Omitted relevant-fact selectors | Compare the complete supplied fact value; require explicit selectors and reject omission; or define omission as disabling comparison. | Compare the complete supplied fact value when selectors are omitted. Explicit nonempty selectors narrow relevance. Define explicit null and empty selectors separately; recommend rejecting them rather than silently disabling validation. Missing current facts must not be synthesized from historical facts. Assess native helper defaults and fixture compatibility explicitly. |
| D2 — Approval fact selectors | Treat all selector strings as literal top-level keys; or support a bounded nested-path representation. | Specify dot-separated own-object-member paths for Approval selectors, consistent across condition completeness and explicit relevance. Define malformed segments, missing versus null, and literal dotted-key ambiguity; do not add fallback lookup, wildcards, expressions, or array indexing implicitly. Workflow's existing top-level guard fixture remains unchanged. |
| D3 — Equality of supported facts | Use host-language equality; or define structural portable equality with exact numeric value comparison. | Define portable structural equality: object member order is irrelevant, array order matters, missing differs from null, and booleans/strings/numbers remain distinct. Compare supported finite numeric facts by exact value, independent of native decimal scale. Do not interpret decimal strings or Money-shaped objects as Money automatically, or round values through binary floats. Document limits of each native-to-portable representation. |
| D4 — Mutable native numeric objects | Support explicit immutable snapshots of selected mutable classes; or reject classes outside a documented immutable value set. | Reject mutable/unsupported numeric objects and subclasses at domain boundaries, using existing domain errors whose mapping is documented first. Preserve already-supported immutable exact values. Align Java Approval/Workflow ownership with the audited value discipline used by Audit; do not add arbitrary `Number.toString()` coercion or a universal serializer. |
| D5 — Malformed declarations and evidence | Treat absent/null/wrong-type declarations as defaults; or require explicit valid declarations and distinguish them from valid negative observations. | Reject missing/malformed required quorum evidence with `FINKORE_APPROVAL_INVALID_CHAIN`; distinguish malformed condition declarations (proposed `FINKORE_APPROVAL_INVALID_DECISION`) from unavailable required facts (`FINKORE_APPROVAL_CONDITION_UNRESOLVED`). Confirm mutability declaration rejection as `FINKORE_ENTITY_INVALID_MUTATION` and preserve primary Audit errors in evolution. Document optionality and error precedence from the owning contracts. |

Recommend rejecting a proposed record only when it invalidates required
historical relationships, rather than banning all equal Decision reference
tuples. Preserve timestamp instant equality, including equivalent offset
spellings, without rewriting retained timestamps. Likewise, reject invalid
unreferenced groups without imposing a new blanket ban on valid unreferenced
declarations. Neither recommendation introduces a registry or new identity model.

CoreDoc review should start from CORE-002.2/002.3/002.4, CORE-004.1/004.2/004.3,
and CORE-005.2/005.3. No foundation change is currently proposed. Change CoreDoc
version fields only if an accepted correction changes a foundation obligation;
do not create separate alignment, provenance, or closure reports.

### Milestone 1 resolution — 2026-09-27

The maintainer explicitly selected “Adopt all five recommendations.” There are
no unresolved D1–D5 contract blockers. New defects or ambiguity discovered in M2
or M8 reopen this milestone; acceptance is not evidence that an implementation
passes. No implementation code or vector expectation changes belong to this
Milestone 1 result.

The review read the CoreDoc foundation rules identified above, Specification
Conventions, Approval Requirements/Decisions/Conditions/Validity/Composition/
Errors, Workflow States/Guards/Versioning/Errors, Entity declaration/mutability/
import/evolution/errors, and Audit Errors. It also inspected the existing
conformance conventions, manifest-listed Approval decision/validity/composition/
readiness/construction-evaluation vectors, Entity behavior/import/evolution/
regression fixtures, and their traceability mappings. Public core entry points
and native documentation were checked in TypeScript, Python, and Java, including
record/evaluate/condition/composition, Workflow retained guard values, Entity
definition retention, and Python evolution failure observations. Applicable
Agentic descriptors are Workflow transition and Entity create/mutate/transition/
evolution; the Approval labels remain conformance-local.

| Decision | Accepted contract and compatibility consequence |
| --- | --- |
| D1 | APPROVAL-FACT-001: supplied current facts with omitted selectors compare completely; explicit nonempty selectors narrow comparison. Null/empty/malformed selectors fail INVALID_DECISION. Concrete single-Decision evaluation requires current facts. Requirement evaluation with neither current facts nor selectors retains its history-only scope under APPROVAL-VALIDITY-001; it does not synthesize facts or claim current-fact validation. Selectors without current facts are invalid. This changes Python/Java Requirement outcomes when current facts changed and paths were omitted; it also closes empty-list bypasses. Existing history-only vectors remain valid. Native concrete null/None selector defaults require an omission-aware migration in M4; separately documented facts-only helpers retain their limited scope and cannot implement the concrete fixture. |
| D2 | APPROVAL-FACT-002 and APPROVAL-CONDITION-007: dot-separated own-object-member paths, nonempty segments, no normalization, no arrays/inheritance/fallback/escaping/expression evaluation. Missing leaves never match, even on both sides; present null leaves are available. Literal dotted keys remain part of complete equality but are not addressed through an ambiguous fallback. Python/Java condition top-level lookup changes; malformed path acceptance changes in all affected cores. Workflow's top-level guard fixture is unchanged. |
| D3 | APPROVAL-FACT-003: recursive type-sensitive equality, unordered object members, ordered arrays, exact accepted numeric value independent of decimal scale, signed zero equality, no numeric-string or Money coercion. Native decimal equality corrections change Java outcomes without changing Money semantics. Common JSON cases must survive every bridge exactly; high-precision native values have native tests, not lossy JSON vectors. |
| D4 | APPROVAL-FACT-004 and WORKFLOW-GUARD-007: owned containers and documented immutable numeric support, rejecting mutable/unsupported classes and subclasses before retention. Concrete Approval uses INVALID_DECISION, composition uses INVALID_CHAIN in evidence category 4, and Workflow definitions use INVALID_DEFINITION before later Workflow errors. Conventions document the TypeScript/Python/Java value profiles and exact number interpretation. Previously accepted AtomicInteger/custom subclass inputs are deliberately rejected; supported exact immutable values remain supported. These are native API compatibility corrections, not a new universal serializer or a new Money limit. |
| D5 | Missing/malformed required quorum eligibility and outcome evidence uses INVALID_CHAIN in composition evidence category 4. An empty valid eligibility list supplies explicit negative evidence; no vote is inferred. Malformed condition declarations use INVALID_DECISION; valid declarations with unavailable facts use CONDITION_UNRESOLVED. ENTITY-MUTABILITY-008 uses INVALID_MUTATION for malformed declarations and preserves IMMUTABLE for a valid protecting rule. Primary Audit errors survive evolution failure observation. Condition shape/error and mutability mapping are explicit corrective additions; quorum/Audit categories retain their prior domain meaning. |

The current portable fixture optionality, selector syntax, and success envelopes
are in the [Approval operation contract](../../conformance/operations.md#approval-fixture-definitions);
the historical runtime value profiles remain in conformance conventions.
Normative additions are in their owning specs, not this decision table.

### Finding disposition, expected observations, and owners

Error suffixes below retain their full existing `FINKORE_<DOMAIN>_` prefixes.
Each negative case has an otherwise valid control; error priority is not inferred
from a single malformed-input example. M2 owns permanent failing regressions and
controls on the isolated `4041ec2` baseline for every row. The implementation
owner named below also owns unit/native coverage, targeted mutation protection,
public API documentation, and installed-consumer checks for its correction.

| Finding | Classification and governing disposition | Exact outcome, effects, and valid control | Implementation/test owner |
| --- | --- | --- | --- |
| F1 | Python/Java core defects in required quorum evidence; fixture requiredness clarification under APPROVAL-QUORUM-002/004/009/010, COMPOSITION-010/024 and ERROR-010. | Missing/null/malformed eligibility or either outcome mapping on an applicable quorum member yields APPROVAL_INVALID_CHAIN, category 4. No inferred voter eligibility or outcome mapping; all inputs unchanged. Explicit valid approving quorum returns `{outcome: APPROVED, actionableRequirements: []}`. No-vote evidence remains PENDING or REJECTED by the fixed capacity rules; explicitly inapplicable members need no votes. | M3: all three composition cores and conformance/native tests; Python runs on both versions. |
| F2a | Java core ownership defect plus formerly unresolved supported-native-value boundary, now APPROVAL-FACT-004 and DECISION-002/007. | AtomicInteger/numeric subclass facts fail APPROVAL_INVALID_DECISION before append; original histories remain unchanged. Supported exact immutable numbers record successfully, survive repeated observation, and cannot change via input/output container aliases. | M5: Java Approvals, native tests/probes and JAR consumer; review analogous TS/Python retention. |
| F2b | Java core defect under WORKFLOW-VERSION-003/009 and GUARD-004; native rejection boundary now GUARD-007. | Mutable BigDecimal/BigInteger subclasses in retained guard values fail WORKFLOW_INVALID_DEFINITION at construction/import. Existing instances/bindings stay unchanged. Exact immutable values retain the same guard rejection/success before and after attempted external mutations. | M5: Java Workflow native ownership tests/probes and JAR consumer; analogous core review. |
| F3 | All three record cores fail proposed-result validity; VALIDITY-014 covered supplied history only. New APPROVAL-VALIDITY-015 makes the additional result boundary explicit. | A new Decision colliding with a retained withdrawal target or supersession target/successor fails APPROVAL_INVALID_DECISION, preserving both histories. A distinct-instant control appends one Decision, keeps lifecycle/local order/timestamp spelling, and reuses the actual result successfully. Equal tuples without an affected lifecycle reference remain permitted. | M4: record/import/lifecycle/evaluation native sequences plus portable record vectors in all languages. |
| F4 | All three composition cores incompletely enforce existing COMPOSITION-004/006/024; no new requirement ID. | An unused self-cycle, multi-group cycle, or unresolved child fails APPROVAL_INVALID_CHAIN in category 1. Valid unused groups do not alter outcome/actionable order. Cycle/reference checks cover every declaration; depth four applies only to each standalone/stage-root path. No mutation. | M3: all composition cores, disconnected/shared-child vectors and native tests; critical traversal mutations. |
| F5 | TypeScript core retention defect under ENTITY-DEFINITION-002, MUTABILITY-001/002/004, IMPORT-002, and Workflow State semantics. | Own `__proto__` State with `memo` permission survives create → definition observation → serialization/import → mutation/transition. Permitted memo changes succeed; forbidden fields use ENTITY_IMMUTABLE and preserve identity/State/data/revisions. No raw TypeError, lost own key, changed prototype, or name ban. | M6: TypeScript Entity retention/tests and npm consumer; adjacent declaration review across domains. |
| F6a | Python/Java core declaration defects and missing portable declaration/error detail; resolved by APPROVAL-CONDITION-007 with FACT-002. | `requiredFacts: null` (also missing/wrong/empty declaration) fails APPROVAL_INVALID_DECISION before external applicability is accepted. A valid selector whose fact is absent fails CONDITION_UNRESOLVED. Complete nested facts return exactly the supplied APPLICABLE/NOT_APPLICABLE value, including present null/false/zero leaves. Inputs unchanged. | M4: condition cores, adapter presence translation, declaration/path/control vectors and native tests. |
| F6b | Python core malformed-rule defect; cross-boundary declaration mapping now ENTITY-MUTABILITY-008. Java/TS matching error alone does not prove complete validation. | `mutability.DRAFT: null` and malformed required declaration shapes fail ENTITY_INVALID_MUTATION at consuming boundaries, with no partial Entity/state/data/revision result. `DRAFT: []` is valid; a targeted protected field then yields ENTITY_IMMUTABLE. | M7: Python core plus all-language neighboring create/import/mutate/transition/evolution declaration tests. |
| F6c | Python adapter defect masking a core Audit failure, governed by AUDIT-ERROR-004, ENTITY-EVOLUTION-027/033/034 and ENTITY-ERROR-004. | Explicit null Audit history returns AUDIT_INVALID_EVENT, never AttributeError. Supplied sources, related observations, revisions/currentness, relations and Audit input remain unchanged. Omission is the existing empty-history fixture default, not a guarantee of evolution success; a valid corresponding Audit target/control succeeds. | M7: Python bridge failure observations and adapter tests, four evolution-kind vectors, native unchanged-state tests on all runtimes. |
| F7a | Unresolved relevance contract plus inconsistent core behavior/public documentation, resolved by APPROVAL-FACT-001. | Supplied changed current facts with omitted selectors make the lone approving Decision INEFFECTIVE and its Requirement PENDING. Equal facts remain EFFECTIVE/APPROVED. Explicit unchanged selected facts ignore unrelated changes; malformed selectors fail INVALID_DECISION without mutation. History-only omission retains its limited scope. | M4: concrete Decision and Requirement cores/bridges/docs, presence and unchanged/changed controls. |
| F7b | Unresolved selector representation and Python/Java condition mismatch, resolved by APPROVAL-FACT-002 and CONDITION-007. | Required `invoice.amount` with own nested amount returns supplied APPLICABLE; a literal dotted key alone cannot satisfy it and yields CONDITION_UNRESOLVED. Null/false/zero nested leaves are present. Malformed selector declarations yield INVALID_DECISION. | M4: all condition/relevance boundaries, own/inherited keys, nested and scalar/array controls. |
| F7c | Unresolved native fact equality plus Java scale-sensitive comparison; resolved by APPROVAL-FACT-003/004. | BigDecimal 1.0 versus 1.00 is EFFECTIVE/APPROVED for otherwise valid current evidence; numeric 1 versus string `"1"` or Boolean true differs. Arrays/order and complete object member sets remain significant. No rounding, Money inference, or history mutation. | M4 equality and M5 native ownership/value-set tests; Java/Python exact numeric native controls and shared JSON vectors. |

### Freeze, compatibility, and traceability assessment

All normative additions correct demonstrated ambiguity/portability defects under
SPEC-FREEZE-001. Existing IDs keep their meaning. Eight new requirements are
APPROVAL-FACT-001 through -004, APPROVAL-CONDITION-007, APPROVAL-VALIDITY-015,
WORKFLOW-GUARD-007, and ENTITY-MUTABILITY-008. Proposed-history validation gets a
new ID because it extends the preexisting supplied-history rule; disconnected
declaration validation and special-name preservation clarify existing scope.

D1–D4, malformed-condition mapping, and newly explicit mutability requiredness
are observable corrections, not editorial changes or version-neutral regression
claims (SPEC-COMPATIBILITY-005/008/009/012/014). No prior published portable
serialization is replaced: these are bounded conformance fixtures/native API
profiles. Their member names/result categories and syntax version stay stable,
but consumers relying on the previously underspecified permissive cases must
migrate. Native concrete callers must use explicit omission instead of null/None
selectors. Whole-fact comparison may now invalidate formerly effective evidence;
callers may explicitly declare a nonempty relevant subset, never an empty bypass.

No canonical Approval operation exists to rename. Workflow transition and Entity
canonical IDs retain their original purpose, inputs, results, and failure effects.
Their Agentic descriptors now reference native definition/mutability validity
corrections; this documents correction of previously invalid declarations, not
repurposing a valid operation contract under SPEC-COMPATIBILITY-007. Error codes
retain their domain-failure categories. Composition priority remains structure →
applicability → required context → required state/effectiveness; it does not
govern concrete Approval operations. Workflow and Audit/evolution retain their
separate existing priority. No total priority for unrelated Entity failures is
invented.

The [traceability index](../../conformance/traceability.md#core-097-reassessment)
reopens existing affected rows as PARTIAL and marks new mandatory rows UNCOVERED.
Native-only ownership rows remain explicitly incomplete until native sequences
and mutations pass; an old COVERED or NOT DIRECTLY TESTABLE status is not closure.
There are no remaining BLOCKING SPEC GAP rows for the accepted D1–D5 decisions.
All old vector mappings and historical release evidence remain available.

SPEC-FREEZE-002 is a combined corrective-change gate: this M1 working state is
not independently releasable. M2 supplies permanent failing examples; M3–M7 must
update implementations, tests, public API docs, and consumers before M8/M9 can
verify or release it. Core remains `0.9-rc`, package versions `0.1.0`, and
conformance syntax `0.1`. No tag, publication, or Core 1.0 promotion is performed.

### Completion review and verification

Unit/native tests, conformance vectors, mutation probes, JSDoc/native API comments,
and installed examples require changes in M2–M7; their named owners above retain
those obligations. They were inspected but were not changed or claimed passing
for new contracts in M1. Existing executable code and vector expectations remain
unchanged. Owning `/spec`, fixture conventions, traceability, applicable Agentic
descriptors, and spec/conformance/package README status notices are synchronized
for this contract stage. The existing root README and Core 1.0 plan edits were preserved and their
0.9.7 prerequisite wording now records M1 completion with later work pending.

CoreDoc CORE-002.2/002.3/002.4, CORE-004.1/004.2/004.3, and CORE-005.2/005.3
already cover complete validation, non-mutation, declared permissions, evidence,
ownership, and deterministic distinctions. No foundation change or CoreDoc
version-field update is needed. AGENTS.md, architecture, and release notes need
no change: responsibilities and development rules are unchanged, and no release
has occurred. Documentation/traceability, architecture, license, and whitespace
checks are the applicable M1 gates. On 2026-09-27, `npm run docs:check`,
`npm run architecture:check`, `npm run license:check`, and `git diff --check`
passed. The traceability inventory is 425 requirements: 296 COVERED, 41 PARTIAL,
8 UNCOVERED, 80 NOT DIRECTLY TESTABLE, and no BLOCKING SPEC GAP; the manifest
remains at 884 vectors. No runtime, coverage, or mutation run is claimed for
this documentation-only contract stage.

Completion: every finding and lettered subcase has an accepted contract, exact
outcome/effects, compatibility assessment, and implementation/test owner. M1
completion authorizes its dependent regression work; it does not close M2–M9.

## Milestone 2 — Permanent regressions and broader discovery

### Discovery decisions (D6–D7 accepted; D8 subsequently resolved)

The reconstructed baseline exactly reproduces 3,861 cases and 478 status/code
differences or exceptions. Comparing complete results adds 186 leads, including
optional observation differences that are not automatically defects. Investigation
also exposes the following representation gaps; no expected result is selected
by implementation majority voting.

| Decision | Accepted correction or explicitly unresolved gap | Compatibility and owner |
| --- | --- | --- |
| D6 — Required fixture collections and optional Actor type | Require explicit `terminalStates` and `transitions` arrays in the bounded Workflow definition, and explicit array/envelope `history` or `decisions` at Approval fixture operations that consume them; explicit null or an envelope without its required history array is malformed. Empty arrays remain valid. Document native convenience constructors/defaults separately. Approval Actor `type` stays optional, but when supplied is a nonempty string. | Resolves omitted-list and malformed Actor type differences without requiring a production serialization. Workflow failures use INVALID_DEFINITION; Approval failures use INVALID_DECISION. M4 handles Approval; M5 handles Workflow declaration boundaries. |
| D7 — Entity representation | Require the bounded Entity definition's explicit nonempty `identityScope` and object-valued Entity `data`; absent/null/non-object data uses ENTITY_VALIDATION_FAILED. For an existing Entity, malformed/missing current State uses WORKFLOW_INVALID_INSTANCE and an undeclared nonempty State uses WORKFLOW_INVALID_STATE, preserving Workflow error priority. An empty mutation change object uses ENTITY_INVALID_MUTATION. | Adds explicit representation/error rules rather than treating an implementation as the oracle. Native composing-domain APIs need no universal data schema. M7 owns shape/error correction and M6 own-member preservation. |
| D8 — Redaction policy identity | Initially left unresolved; on 2026-09-30 the maintainer selected optional `policy.id`, with a nonempty string required when supplied. AUDIT-REDACTION-008 rejects malformed supplied values with REDACTION_INVALID, preserves history and existing priority, and keeps authority/targets required. | TypeScript/Java now accept omission; Python rejects malformed supplied IDs it previously ignored. No registry, ID requirement, normalization or authorization lookup is introduced. See the later D8 resolution and verification below. |

Other discoveries are assessed against existing requirements: missing concrete
Requirement outcome mappings (APPROVAL-REQUIREMENT-004), missing Chain rejection
declarations (APPROVAL-CHAIN-007), malformed Workflow instance/Entity transition
target error preservation, and evolution history/relation/scope input errors.
Their permanent cases and implementation owners are recorded in the
discrepancy classification below. This section reopens M1 only for the new decisions;
D1–D5 remain accepted.

- [x] Reproduce every finding and subcase as a permanent failing regression on
      `4041ec2`, with an independently passing valid control. Use an isolated
      checkout when testing the defective baseline; never reset working changes.
- [x] Add portable vectors to manifest-listed files where the behavior is
      specified. Use native tests for retained references, unsupported numeric
      classes, subclass behavior, and actual multi-operation result reuse.
- [x] Reconstruct the exploratory review deterministically and classify its
      distinct failure families. Account for every observed discrepancy as a
      confirmed defect, contract gap, permitted difference, duplicate, or invalid
      probe, with reasons in this plan or existing traceability/test artifacts.
      Do not treat implementation majority voting as the expected-result oracle.
- [x] Expand beyond one successful seed per operation and shallow leaf changes.
      Cover meaningful success/error variants, nested containers, complete
      normalized values and observations, and domain-relevant interactions.
- [x] Inventory all supported public boundaries across Money, Workflow, Audit,
      Approvals, and Entities: constructors, factories, parsers/importers,
      serializers, operations, adapters, observations, and result reuse. Explain
      inapplicable dimensions rather than claiming exhaustive combinations.
- [x] Add actual-output sequences with failure snapshots. Never rebuild the
      expected history by hand between operations or repair a returned value
      before giving it to its next consumer.
- [x] Include new tests in ordinary test discovery, coverage, configured mutation
      test selection, and package-consumer checks where applicable. Shared
      fixtures do not replace assertions about native public behavior.
- [x] Add any newly confirmed mandatory gap to this plan before fixing it;
      resolve new ambiguity through M1 (D6–D7 accepted; D8 explicitly left
      unresolved by the maintainer). Complete this discovery pass before
      declaring the implementation scope closed.

| Dimension | Minimum relevant coverage |
| --- | --- |
| Presence and types | Omitted, explicit null, empty, false/zero, valid scalar/container, wrong scalar/container, malformed nested entry. |
| Evidence position | First/last entry, before/after decisive evidence, later stage, alternative branch, disconnected group, repeated reference. |
| Definition graph | Valid unused group, missing reference, self/multi-group cycle, shared child reached at different depths, root versus staged roots, depth four and five on evaluated paths. |
| Fact identity | Selected/unselected changes, omitted/null/empty selectors, nested paths, missing/null leaves, own/inherited members, dotted keys, reordered objects/arrays, boolean versus number, equal numeric values with different native scales. |
| Retention | Mutate original input and each returned observation independently; verify repeated observations and later successful/rejected operations preserve committed meaning. |
| Identifiers | Ordinary names plus `__proto__`, `constructor`, and `prototype` where permitted; preserve own members without changing global prototypes or banning valid names. |
| History sequences | Record → withdraw/supersede → record → evaluate/import/reuse; collisions with targets and successors, equivalent timestamp instants, unrelated valid histories, repeat calls. |
| Failure effects | Exact code plus unchanged Decisions, lifecycle, definition/binding, Entity state/data/revisions, relations, and Audit history where applicable. |
| Runtime boundary | Identical JSON-round-tripped portable inputs on all four runtime configurations; separate native cases for values JSON cannot represent. |

Completion: every confirmed case fails for the intended behavioral assertion
on the defective baseline, its control passes, and unexplained exploratory
families are not silently dropped. Contract-gap cases become normative tests
only after their decisions are resolved.

### Milestone 2 result — 2026-09-27

The maintainer explicitly selected “Adopt D6–D7; keep D8 unresolved.” D6–D7
are now normative in WORKFLOW-STATES-008, APPROVAL-DECISION-010/011,
ENTITY-IDENTITY-007, ENTITY-VALIDATION-010, ENTITY-LIFECYCLE-007, and
ENTITY-MUTABILITY-009, with bounded representations in conformance conventions.
These are corrective compatibility changes under SPEC-FREEZE-001 and
SPEC-COMPATIBILITY-005/008/009/012/014: callers relying on omitted collections,
malformed Actor types, default identity scope, non-object data, malformed State
error categories, or empty mutation no-ops must migrate. Native convenience
constructors retain their separately documented scope. No new operation ID,
portable error code, production serialization, domain, or total Entity error
priority is introduced. D8 reopens M1 and prevents implementation-scope closure;
it does not acquire an expected result through this discovery milestone.

#### Permanent cases and independent controls

There are **896 new identified cases**: **699 manifest-listed full-envelope
vectors** and **197 supplementary native/adapter cases** in
[boundary097-cases.json](../../conformance/boundary097-cases.json). The latter
cover specified domain results where optional diagnostic observations lack a
single prescribed envelope, and cases whose result is incorrect on every
baseline implementation. They assert exact complete success values or portable
error codes and unchanged supplied inputs. They do not select diagnostics by
majority vote or weaken the runner. Full-envelope vectors preserve exact
observation comparison; their unchanged-history/Entity observations come from
the supplied fixture state. No baseline failure below is solely an optional
observation mismatch.

The original 884 vectors and their expectations remain unchanged; the manifest
now contains **1,583 vectors**. Cases retain their finding label, requirement
references, and `pairedControl` where applicable. All **61 referenced portable
controls pass independently on all four configurations**. Additional healthy
neighbors include no-vote/inapplicable evidence, valid unused groups, shared
children at valid depths, equal tuples without lifecycle references, same-scale
exact values, equal/selected facts, and ordinary/special-name Entity operations.
These controls and boundary cases are not counted as additional defects merely
because they were added during a corrective review.

Native suites in each implementation use direct public APIs, in addition to
shared JSON cases. They record actual histories, withdraw or supersede, record
again, and import/evaluate the actual returned values. Collision cases cover
withdrawal targets and supersession targets/successors, including equivalent
UTC-offset spellings; distinct-instant and Requirement-supersession controls
pass. Failed operations snapshot Decision/lifecycle histories and caller input.
TypeScript's successful history methods intentionally mutate their receiver;
non-mutation assertions apply to rejected operations and independent retained
observations, not a falsely assumed persistent API.

Native tests require Java to reject AtomicInteger/AtomicLong, mutable BigDecimal/BigInteger subclasses,
and unsupported numeric values in the new tests, with immutable numeric controls;
these rejection tests fail on the defective baseline where indicated below.
Exact Java/Python decimal cases compare scale-independent values without
rounding through binary floats or Python decimal context. Native container tests
mutate original inputs and returned views independently. TypeScript exercises
own `__proto__`, `constructor`, and `prototype` declarations through actual
Entity definition observation, reconstruction, allowed/forbidden mutation, and
transition, checking the original observation and global prototype. Ordinary
names are independently passing controls. Native condition APIs with a required
positional facts argument are not tested by an invalid call-arity trick: omitted
fixture facts have adapter coverage; TypeScript's options-object API can also
represent native omission.

#### Complete exploratory accounting

The historical `docs/tools/explore-boundaries.js` tool reconstructs the original
matrix on the old manifest: 3,861 cases across 33 operations, exactly 478
status/code differences or exceptions. Comparing complete normalized results
finds 664 leads in total. The expanded matrix adds 5,980 cases across the same
operations, selecting last-success and first-error seeds, depth-six paths,
first/last array positions, and at most 24 deterministic paths per seed. It
finds 1,001 complete-result leads, including 494 status/code/exception leads.
Both runs execute TypeScript, CPython 3.12, CPython 3.13, and Java with independent
JSON-round-tripped requests, preserved explicit context, and input snapshots.
No input mutation was observed. This finite sample is not exhaustive.

The historical `docs/tools/classify-boundaries.js` tool accounts for every
lead by deterministic case ID and fails on an unclassified family. The reasons
below are contract-based; implementation agreement is not an oracle. Repeated
variants and operations within a family are duplicate exposures of its stated
obligation, not separate financial rules or an aggregate defect count.

| Disposition/family | Original leads | Expanded leads | Reason and owning correction |
| --- | ---: | ---: | --- |
| F1 | 0 | 1 | Composition null decision evidence bypass; COMPOSITION-010, INVALID_CHAIN; M3. |
| F6a | 34 | 74 | Malformed condition declarations accepted, misclassified, or throwing; CONDITION-007; M4. |
| F6b | 109 | 84 | Missing/malformed mutability rules or field members across consuming boundaries; MUTABILITY-008; M7. |
| F6c | 16 | 4 | Malformed evolution Audit history masks the domain result; AUDIT-ERROR-004 and EVOLUTION-034; M7. |
| F7a | 1 | 2 | Null selector bypass and selectors without current facts, including a complete-value disagreement; FACT-001; M4. |
| F7b | 6 | 12 | Absent versus malformed condition facts; CONDITION-007/FACT-002; M4. Nested-path neighbors have permanent targeted cases. |
| F8a | 36 | 50 | Required concrete outcome mappings, history/Decision collections, optional Actor type, and Chain rejection declarations; REQUIREMENT-004, DECISION-010/011, CHAIN-007; M4. |
| F8b | 30 | 26 | Omitted Workflow collections, omitted instances, and Entity transition target error preservation; STATES-008, WORKFLOW-ERROR-007, ENTITY-ERROR-004; M5 for definitions, M7 for adapter/error preservation. |
| F8c | 238 | 141 | Entity identity scope/data/current-State/empty-change contracts plus malformed evolution history, relation identity, and supersession scope; new D7 requirements and EVOLUTION-024; M7. Invalid relation/scope request fields use INVALID_MUTATION, not an Entity identity error. |
| F9a | 0 | 1 | TypeScript adapter throws on null facts for an otherwise rejected undeclared reverse transition; TRANSITION-001/002/003 and ERROR-007 require INVALID_TRANSITION, unchanged instance; M7. |
| F9b | 0 | 10 | Python Audit relationship type object/array raises an unhashable-type exception, including evolution's first/last relationships; AUDIT-ERROR-004 requires INVALID_EVENT before correspondence; M7 Audit core and bridge. |
| F9c | 0 | 35 | Python mutation can overwrite malformed existing Money-valued Entity data and return success; supplied Entity observations also need their declared validation, VALIDATION-001/004; M7. Transition neighbors and exact error preservation are included. |
| P1 — permitted diagnostic difference | 184 | 505 | Same domain error, differing optional failure observations: omitted lifecycle, partial Entity observations, absent/null diagnostics, or empty-history presentation. No success value or primary code differs. Native/input snapshots separately verify preservation; diagnostics are not promoted into normative state. |
| P2 — permitted redaction error selection | 1 | 2 | Omitted history also leaves the redaction target unavailable. Both reject. AUDIT-ERROR-004 orders append validation, not every redaction failure; no total redaction priority is invented. |
| P3 — permitted empty observation | 2 | 1 | Entity import returns the same Entity/mapping with absent versus empty optional historicalRevisions when no revisions were supplied. No historical revision is lost or invented. |
| P4 — invalid precedence probe | 0 | 53 | An already-malformed Entity validator seed also receives an invalid Workflow declaration. Both fail; no total priority across these unrelated Entity declaration errors exists. Isolated valid controls govern their individual failures. |
| D8 — unresolved contract gap | 7 | 0 | Malformed/omitted policy.id differs. Maintainer explicitly left policy identity unresolved. No normative assertion or implementation change. |
| **Total** | **664** | **1,001** | **910 contract-backed defect exposures, 695 permitted differences, 53 invalid precedence probes, 7 unresolved-gap exposures.** |

F2–F5 and the deeper fact-equality/selector interactions are independently
reproduced by targeted cases and native sequences; their absence from a shallow
sweep's lead count is not an exemption. Newly confirmed F8/F9 obligations are
recorded here before fixes. Their owners inherit the earlier requirement for
unit/native, portable, mutation, API-documentation, and installed-consumer closure.

#### Public boundary inventory and limits

| Domain | Supported public boundaries reviewed | Relevant exercised dimensions and limits |
| --- | --- | --- |
| Money | TypeScript Currency validation/Money factories; Python Money constructor/from_portable; Java Money native construction/fromPortable; amount/currency observations; add/subtract/compare/multiply/divide/round/apply-rate/allocate; serialize/toJSON/to_portable/toPortable and arithmetic-result reuse; all adapter operations. | Original/expanded portable shape and success/error seeds plus existing native exactness, requested-scale serialization, constructor, and package controls. No new Money arithmetic semantics or defects selected. Graphs, lifecycle histories, eligibility, and Entity declaration retention do not apply. |
| Workflow | Definition/Transition/Instance native constructors, portable factories/parsers, create/import/transition, binding/definition/current-State/revision observations and serialization; actual create→transition reuse and adapters. | Required collections, malformed instances, definition-before-instance priority, terminal/endpoint/guard validation, null facts, native immutable/mutable numeric classes, retained definition values and original instance snapshots. No registry, migration, concurrency, or distributed version work. |
| Audit | Actor/Change/Event constructors and portable parsing, log/history import, append, redaction, history/event/actor/change observations and serialization; append/redaction result reuse and adapters. | Existing ownership/cycle/exact-number/native suites remain active; expanded nested relationship types and evolution error preservation are added. D8 policy identity is explicitly not tested as a chosen rule. No general ordering operation or production redaction encoding is invented. |
| Approvals | Requirement/Decision/Condition/Chain/Composition factories and evaluation; native validation functions; history creation/import/normalization, record/withdraw/Decision supersession/Requirement supersession, concrete and history-only evaluation; observation/serialization and result reuse; all conformance-local adapters. | Required evidence, applicability/context/error order, disconnected graphs/shared children/depth, malformed first/last declarations, own-member paths, exact structural/native numeric comparison, input/output ownership, all actual lifecycle result sequences. Java facts-only overload remains a distinct limited helper. No canonical Approval operation, expression language, delegation, or dynamic eligibility extension is added. |
| Entities | Native definition/observation validation, create/from/reconstruction/import, mutate/transition, evolution-history import and correct/reverse/void/supersede, definition/data/identity/State/binding/revision/currentness/relation observations, serialization and adapters. | Shape/presence, own special names, complete permission lists and malformed members across states, validation before source reuse, target/primary-domain errors, Audit correspondence/history, revisions and unchanged-state controls. Existing actual evolution/import/binding sequence suites remain active. No accounting effects or universal data schema is invented. |
| Shared surface | Exported error constructors/predicates/codes, timestamp parsing through public operations, version constants and exported data types; TypeScript dispatch and Python/Java JSON bridges; installed npm, wheel/sdist, and JAR consumers. | Existing exact error/version/timestamp controls and architecture checks remain active. Types and constants have no independent history/graph behavior; private helpers are not separately promoted into public APIs. Same-instant offsets and fixed timestamps are explicit; host clock, locale and timezone do not choose outcomes. |

The expanded sampler covers portable entry points; native tests cover values,
references, and successful stateful reuse that JSON cannot preserve. Earlier
readiness/boundary/construction suites remain part of ordinary discovery. This
inventory records reviewed surfaces and relevant tests, not every Cartesian
combination or a new full-domain conformance claim.

#### Baseline verification and gate status

The defective baseline was archived into an isolated `/tmp` checkout from
`4041ec2838d4cbcf9333b8c6c651affe9ee10500`, built there, then overlaid only with
new conformance/spec metadata and regression tests. Implementation and adapter
sources were not replaced or fixed. The working tree's implementation sources
also still match that commit. Reconstruction uses the original manifest before
these overlays; the snapshot-specific reconstruction instructions were removed
with the maintained implementations and runner.
No working changes were reset.

| Baseline configuration | Full vectors PASS / FAIL / INFRASTRUCTURE_ERROR | Direct native suite PASS / unsuccessful | Supplementary adapter cases PASS / unsuccessful |
| --- | --- | --- | --- |
| TypeScript | 1,494 / 88 / 1 | 265 / 42 of 307 | 92 / 105 of 197 |
| CPython 3.12 | 1,106 / 447 / 30 | 144 / 155 of 299 | 28 / 169 of 197 |
| CPython 3.13 | 1,106 / 447 / 30 | 144 / 155 of 299 | 28 / 169 of 197 |
| Java 21 | 1,215 / 368 / 0 | 172 / 146 of 318 | 98 / 99 of 197 |

All original 884 vectors pass on every runtime; there are no UNSUPPORTED
results. Infrastructure outcomes above are reproduced domain-boundary crashes,
not setup failures, and are not accepted as portable errors. Python native
unsuccessful results comprise 142 assertion failures and 13 unexpected errors
(including incorrect portable failures on expected-success cases). All referenced
controls pass, and native ordinary-name, exact-value, ownership and distinct-time
controls pass. Each original finding/subcase has at least one intended red
assertion on an affected runtime, alongside its independently passing control.

Build, strict TypeScript, Java `-Xlint:all -Werror` compilation, local toolchains,
17 developer-tool tests, documentation/traceability, architecture, licensing,
and whitespace checks pass. The inventory is 432 requirements: 288 COVERED,
63 PARTIAL, 80 NOT DIRECTLY TESTABLE, and one BLOCKING SPEC GAP (D8); no new
conformance closure is claimed. Ordinary coverage entry points discover the new
tests and stop on the expected red suites: TypeScript runs 1,400 tests with
42 failures; Python coverage runs the 299 new native cases; Java Maven runs
42 aggregate tests with the new native-suite entry failing. No passing coverage
percentage or release verification is claimed.

Stryker's initial test run and the native mutation preflight reject this red
baseline. No mutation kill/score is claimed for these defects before their
implementation corrections; existing mutation assertions are not weakened.
New targeted perturbations remain owned by M3–M7. All six locally installed
consumers reach their new intended failures after their existing controls:
TypeScript own declaration retention, four Python wheel/sdist consumers'
proposed-history collision, and Java unsupported AtomicInteger evidence.
A temporary collection wrapper ran all consumers after each expected failure;
ordinary package verification remains fail-fast. Artifacts were local only and
were not published.

Completion review: tests, vectors/supplementary cases, mutation selection,
coverage discovery, consumers, owning specs, conventions/schema/traceability,
Agentic references, and relevant README status notices are updated. No public
production API or implementation behavior changed, so production JSDoc/native
API changes accompany M3–M7 rather than describing an unimplemented fix now.
CoreDoc obligations and AGENTS.md architecture/rules are unchanged; no foundation
version update, release note, provenance record, tag, publication, or Core 1.0
promotion is needed or performed.

**At M2 completion, implementation remained pending. M3 is now complete below;
M4–M7 and D8 remain open. Implementation scope is not closed.**

## Milestone 3 — Complete composition validation and quorum evidence

- [x] Fix F1 and F4 in all affected cores. Validate every declared group's
      structure and references, including disconnected cycles and missing children,
      before returning an outcome.
- [x] Validate required eligibility and outcome evidence explicitly; remove
      defaults that make a declared voter eligible or manufacture an outcome
      mapping. Preserve the lightweight composition-observation boundary rather
      than requiring an invented concrete subject schema.
- [x] Preserve APPROVAL-ERROR-010 across invalid structure, unresolved
      applicability, required context, and invalid state/effectiveness evidence.
      Exercise mixed failures in both declaration orders and after decisive roots.
- [x] Preserve quorum member-specific counting, opposing-vote rejection,
      threshold capacity, inapplicability, and ordered actionability. Validation
      of unused/later declarations must not make them actionable.
- [x] Add critical mutations for implicit eligibility/mapping, skipped
      disconnected validation, and early outcome return, with paired controls.
- [x] Update affected public API documentation, vectors, traceability, and
      package behavior together with the implementation.

Completion: invalid declarations or incomplete required evidence cannot produce
approval through any reviewed placement; valid compositions retain their exact
outcome and actionable Requirement order on every runtime.

### M3 implementation and verification — 2026-09-28

F1/F4 are corrected in all three cores. Whole-declaration graph validation uses
incoming-edge counts to reject missing children and cycles without recursion
through arbitrarily long unused components. The existing depth-four check still
starts only at actual standalone/stage roots. All applicable declared quorum
members are validated before outcome selection, including opposing effective
votes in unused groups. Python/Java no longer infer eligibility or either
outcome mapping. Valid unused declarations never contribute actionables.

The additional F1 null-Decision-container discovery is also fixed. Omitted
composition decisions retain the empty-list convenience; explicit null/None
uses INVALID_CHAIN. Python callers using None as an omission placeholder must
omit it or pass []; Java callers use the new three-argument evaluateComposition
omission overload or an explicit empty List. Adapters preserve presence and
only translate fixtures. Concrete Approval collection changes remain M4.

Permanent regressions were demonstrated red before correction: the initial
155-vector native set had 15 TypeScript failures and 42 Python assertion failures
plus three native exceptions; Java first failed by approving missing eligibility.
The added null-container test also failed before its correction. Final coverage
includes every composition manifest vector at each native boundary, exact output
and error assertions, and unchanged-input checks. The Java opposing-vote unit
fixture now supplies valid explicit effectiveness/mappings and an approving
control, so missing evidence cannot satisfy that negative test accidentally.

`conformance/approvals/composition-validation.json` adds 47 full-envelope cases:
nine promoted supplementary cases retain their IDs and paired-control references,
and 38 further cases exercise mixed-member priority in both declaration orders,
unused conflicts, decisive pending/rejected/no-obligation roots, optional malformed
inapplicable evidence, swapped mappings, empty votes, null/omitted collections,
and the valid unused depth-eight control. The manifest contains 1630 vectors;
188 supplementary cases remain, without duplicate IDs.

Verification:

- All **176 composition vectors pass on TypeScript, CPython 3.12, CPython 3.13,
  and Java**, both through native APIs and real adapters. No composition case is
  unsupported or an infrastructure error. TypeScript's scoped suite has 244 tests.
- TypeScript composition coverage is 100% for statements, branches, functions,
  and lines. Native composition-function line coverage is 193/210 (91.90%) for
  Python and 243/257 (94.55%) for Java composition methods. These scoped coverage
  results do not claim whole-package coverage; unrelated red suites still block
  the complete coverage gates.
- Stryker composition score is **97.62%**: 735 killed, two timed out, 18 survived,
  no uncovered or errored mutants. No exclusions were added. All 16 Python
  critical probes pass on each Python runtime; all 18 Java critical probes pass.
  Each probe requires its named behavioral failure and independent passing
  controls; infrastructure failures do not count. Two legacy applicability
  probes now model an invalid applicability assumption without crashing when
  required evidence is absent, and the Java container probe targets the new
  explicit-list validation. Their original regression/control assertions remain.
- Installed npm, Python wheel and sdist on both runtimes, and JAR consumers pass
  the composition controls, missing-evidence failures, disconnected cycles,
  explicit null rejection, and native omission convenience. Default package
  verification still includes all later-milestone assertions; scoped verification
  is available with `node docs/tools/check-packages.js --composition`.
- Build, strict TypeScript, Java warning-as-error compilation, developer-tool
  tests, architecture, documentation/traceability, licensing, and whitespace
  checks pass. Scoped commands are documented in `docs/tools/README.md`.

The surviving TypeScript mutants were reviewed against observable behavior:
219 adds only an unused NaN scratch-map entry for a non-group member; 311 adds
an ineffective ignored placeholder to an omitted Decision list; 318/321/328
leave malformed context falsy through the timestamp parser/catch; 376 adds only
an unused undefined state-requirement key; 455/456/458 loosen redundant mapping
presence guards without changing equality; 514 changes an unused internal
applicability label; 548 changes the private rejected-member label while retaining
its zero approvals/zero pending capacity; 613 and 615 change only omitted or
non-pending internal fields; 696/698/700/726/727 change stage no-obligation/internal
approved representations that never become open or actionable. None changes a
portable outcome, error, order, or input. These remain counted as survivors.

Full 1630-vector results remain red outside composition, as expected for M4–M7:

| Runtime | PASS | FAIL | INFRASTRUCTURE_ERROR | UNSUPPORTED |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 1541 | 88 | 1 | 0 |
| CPython 3.12 | 1180 | 423 | 27 | 0 |
| CPython 3.13 | 1180 | 423 | 27 | 0 |
| Java | 1284 | 346 | 0 | 0 |

Full unit suites were also executed and retain non-composition M4–M7 failures.
All original 884 conformance vectors still pass on every runtime.
The reported infrastructure results are existing domain-boundary failures, not
accepted portable errors. No full-domain or release verification is claimed.

Completion review: unit/vector/critical mutation tests, API JSDoc/docstrings,
package consumers, root/package READMEs, conventions, and traceability are updated.
Eleven F1/F4 requirement rows return to COVERED (299 covered, 52 partial, 80 not
directly testable, one D8 gap). The accepted `/spec` contracts already define this
behavior; no new normative requirement is introduced. Agentic metadata needs no
change: composition remains a conformance-local operation and canonical operation
IDs/effects are unchanged. CoreDoc and AGENTS.md obligations and architecture
remain unchanged. No release note, tag, publication, or Core 1.0 promotion occurs.

**M3 is complete. M4–M7 remain pending; D8 remains unresolved.**

## Milestone 4 — Approval histories, conditions, and fact semantics

- [x] Close F8a discovery regressions: concrete outcome mappings, explicit
      fixture histories/Decision collections, supplied Actor type, and Chain
      rejection declarations. Preserve native convenience defaults separately
      from D6 portable requiredness.

- [x] Fix F3 by validating the proposed committed result before exposing it.
      A new Decision cannot make an existing target or successor ambiguous.
      Rejection preserves both Decision and lifecycle histories.
- [x] Test actual returned histories through record, withdrawal, Decision and
      Requirement supersession, evaluation, and observation/reuse. Include
      same-instant offset variants, different facts/outcomes, and distinct-instant
      controls without introducing global Decision uniqueness.
- [x] Implement the accepted D1–D3 contracts for concrete Decision evaluation,
      Requirement evaluation, and condition fact completeness. Preserve the
      documented scope of native facts-only helpers.
- [x] Fix F6a declaration validation before iterating required facts or accepting
      an external condition result. Present null/false/zero fact values must not
      be confused with absent facts.
- [x] Preserve consideration of withdrawal, expiration, supersession, eligibility,
      and required evaluation context when fact comparison is changed. Exercise
      rejecting and approving Decisions before and after stale evidence.
- [x] Add exact structural/numeric equality and selector controls in each
      implementation. Compare full facts and selected facts recursively without
      Python boolean-number coercion or Java scale-sensitive host equality.
- [x] Add mutations for stale-fact acceptance, skipped result-history validation,
      shallow equality, ignored required facts, and absent/null conflation.
      Synchronize public docs, fixtures, traceability, and installed examples.

Completion: successful recording produces reusable valid history; equivalent
portable fact inputs have the accepted specified meaning across runtimes, with
no language exceptions or implicit approval caused by missing required facts.

### M4 implementation and verification

M4 implements the accepted D1–D3/D6 contracts in all three cores, with fixture
presence preserved by adapters. It closes F3, F6a, F7a–F7c comparison behavior,
and F8a. F2 native retained-value rejection/ownership remains M5, including the
native-value portion of FACT-004; D8 remains unresolved.

Recording validates the proposed history against retained lifecycle references
before exposing success. Native sequences consume actual record, withdrawal,
Decision supersession, and Requirement supersession results, checking observation,
reimport, evaluation, same-instant offset collisions, and distinct-instant controls.
Unreferenced equal tuples remain permitted. Conditions validate declarations and
own-member path completeness before accepting external results. Concrete fact
comparison distinguishes omitted selectors from null/empty declarations, compares
complete supplied facts, preserves lifecycle/context checks, and uses exact typed
structural equality. Swapped distinct Requirement mappings remain supported.

Compatibility: Python callers must omit selector arguments instead of passing
`None`; Java concrete callers use `Approvals.OMITTED` instead of null placeholders.
Explicit null facts remain values. Java's legacy four-argument facts-only helper
retains its documented limited scope. TypeScript `ApprovalDecisionHistory.from`
requires an explicit collection; `create()` retains the empty native convenience.
Python native omitted histories also retain their documented empty default.
Fixture histories and outcome mappings are explicit, supplied Actor types are
nonempty strings, and Chain rejection declarations are `REJECTED`.

Evidence and scope:

- A clean HEAD TypeScript native Approval baseline reproduced 31 failures before
  correction. Before correction, the 542-vector Approval suite had 113 failures
  and three infrastructure errors on Python, and 116 failures on Java.
- The manifest now has 1667 vectors: six existing F3 supplementary cases were
  promoted unchanged in identity, and 31 new selector/filtering/mapping/equality
  controls were added. The remaining supplementary inventory is 182 cases.
- All **579 Approval suite vectors pass** on TypeScript, CPython 3.12/3.13, and
  Java, with no unsupported or infrastructure outcomes. All 584 Approval operation
  vectors (including five shared timestamp vectors) pass at the adapter boundary.
- Direct native vector suites and returned-history sequences pass, including
  decimal scale, mixed accepted native numeric types, signed zero, nested
  Boolean/numeric differences, adjacent large decimals, and unchanged ambient
  Python decimal context. Installed npm, wheel/sdist on both Python versions,
  and JAR consumers pass composition plus concrete Approval checks.
- Scoped TypeScript Approval coverage is 99.82% lines, 100% branches, and 100%
  functions. The unexecuted history-cloning exception path belongs to the M5
  unsupported-native boundary. A reproduced selector-array alias introduced during
  the helper change is corrected and retained as a native/unit/installed regression.
  Sparse native selector arrays also fail with a portable error. Python Approval
  line coverage is 94%; Java Approval line coverage is 93.68% (578/617 lines).
- Scoped TypeScript mutation passes at **98.05%**: 1608 killed, two timed out,
  30 survived, and two uncovered out of 1642 mutants, with 905 passing baseline
  tests. No financial outcome, portable error, selector, or committed-history
  validation mutant survives within M4 scope.
- All **105/105** Python/Java portable Approval critical probes are killed with
  passing controls; Python 3.13 separately kills **54/54**. Five new native probes
  (four exact numeric and one retained Condition selector array) are killed, and both Python probes also pass on 3.13. New probes
  cover skipped proposed-history validation, stale complete facts, null omission,
  shallow/Boolean equality, ignored required facts, absent/null confusion, and
  selector validation before ineffective evidence. Scoped commands preserve
  passing baselines; default full-suite gates remain unchanged.

Survivor review: the 18 composition survivors retain the M3 equivalence
explanations above. Three condition mutants remove validation duplicated by the
shared selector validator. Two Decision and two history timestamp mutants remove
checks or change invalid fallback strings still rejected by the timestamp parser.
The remaining history mutant broadens an event-kind guard but compares an absent
Requirement target on other event kinds, leaving the result unchanged. Four
error-class mutants change only non-normative diagnostics, names, or undefined
optional properties. The two uncovered mutants are the retained-value cloning
exception path reserved for M5. These are counted in the score, not excluded.

Build, strict TypeScript, Java warning-as-error compilation, Python compilation
on both versions, developer-tool tests, architecture, documentation/traceability,
licensing, and whitespace checks pass. Full adapter suites also ran and retain
out-of-scope failures (TypeScript 79; Python 142 on each version; Java 72).

Full conformance remains red outside M4:

| Runtime | PASS | FAIL | INFRASTRUCTURE_ERROR | UNSUPPORTED |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 1579 | 87 | 1 | 0 |
| CPython 3.12 | 1333 | 310 | 24 | 0 |
| CPython 3.13 | 1333 | 310 | 24 | 0 |
| Java | 1437 | 230 | 0 | 0 |

All original **884** vectors still pass on every runtime. Full unit suites retain
M5–M7 regressions (TypeScript core: seven failures; Python: 50 failures/three
errors; Java evidence suite: 47 failures). These include native Approval retained
values, Entity declarations/ownership, and Workflow boundaries. Infrastructure
errors remain defects, not accepted portable errors. Full release verification
and native-value closure are not claimed.

Completion review: tests, vectors, critical/native mutation probes, public API
JSDoc/docstrings, package consumers, READMEs, conventions, and traceability are
updated. Nineteen Approval requirement rows return to COVERED: 318 covered,
33 partial, 80 not directly testable, and one D8 gap. Six Approval rows retain M5
native-value qualifications. Existing accepted `/spec` contracts define the
behavior; no new normative semantics are selected. Agentic metadata and canonical
operation IDs are unchanged because these Approval fixtures are conformance-local.
CoreDoc, AGENTS.md, and architecture obligations remain unchanged. No release
note, tag, publication, or Core 1.0 promotion occurs.

**M4 is complete. M5–M7 remain pending; D8 remains unresolved.**

## Milestone 5 — Native value ownership across retained domain data

- [x] Enforce D6/F8b explicit Workflow terminal-State/Transition fixture
      collections at standalone and embedded Entity definition boundaries.


- [x] Fix F2a/F2b under the accepted native value contract. Validate before
      retaining caller-provided values; preserve supported exact immutable
      numbers and reject unsupported values through documented domain errors.
- [x] Exercise Java `AtomicInteger`, related mutable numeric objects, and mutable
      `BigDecimal`/`BigInteger` subclasses in nested facts and guard values.
      Include supported immutable controls and nonfinite/unsupported values.
- [x] Review analogous retention paths across all implementations and domains:
      Decision history, lifecycle metadata, condition observations, Workflow
      definitions/bindings, Entity definitions/data, and Audit evidence.
      Add tests for confirmed ownership obligations rather than a generic freeze.
- [x] Test original-input and output-observation mutation separately, including
      repeated observation and later domain operations. Changing a rejected
      input must never alter earlier committed state.
- [x] Keep native validation in cores and JSON bridges lossless within their
      documented supported value sets. Do not catch arbitrary runtime exceptions
      and relabel them as financial errors.
- [x] Extend native mutation probes and installed Java consumer tests for these
      cases. Review TypeScript JSDoc and Python/Java API docs for supported-value
      and mutation guarantees.

Completion: supported retained values preserve their captured meaning; rejected
native values fail portably and atomically. Caller aliases cannot rewrite
Approval history or a bound Workflow definition.

### D9 — Entity application-data native numbers: resolved

The M5 adjacent-path review reproduced a Java Entity data alias: create an
Entity with a nested `AtomicInteger(1)` as `memo`, change the original number
to 999, and observe the returned Entity data change from 1 to 999 without an
Entity mutation. Entity declaration ownership is already specified, but the
accepted APPROVAL-FACT-004 / WORKFLOW-GUARD-007 native numeric profile expressly
does not define arbitrary Entity application data. The allowed native number
set and error category for create/import/current data versus proposed mutations
were unspecified at that boundary.

A clarification was requested to extend the immutable-number profile with
ENTITY_VALIDATION_FAILED for create/import/current data and
ENTITY_INVALID_MUTATION for proposed changes, preserving existing priority.
The maintainer accepted both recommendations on 2026-09-30. The extension is
specified as ENTITY-VALIDATION-011: owned JSON-shaped containers and supported
immutable scalars, exact immutable native numbers, no numeric subclasses,
non-finite values, unsupported objects or cycles, and no custom copy hooks.
Shared acyclic children remain valid. Current/initial/imported data uses
FINKORE_ENTITY_VALIDATION_FAILED; proposed values use
FINKORE_ENTITY_INVALID_MUTATION after existing mutability checks. Existing
identity, Workflow and declaration priorities remain intact. Evolution applies
the same validation to source and related/successor Entity data and preserves
all prior Entity, revision, evolution and Audit observations on failure.

This is an observable corrective contract change under SPEC-FREEZE-001/002/003
and SPEC-COMPATIBILITY-012/014. Previously accepted unsupported native values
now reject; Java mutable Number aliases no longer enter Entity data. Audit
retains its own native profile. It introduces no persistence encoding, Money
inference, rounding policy, or total priority among otherwise unspecified
competing errors. Completed implementation verification is recorded at the end of this plan.

### M5 implementation and verification — 2026-09-29

The three cores enforce the accepted Approval native value profile before
retention and before fact comparison. Supported immutable numbers retain their
exact values; unsupported objects, numeric subclasses, nonfinite values, and
cycles fail portably without invoking custom copy hooks. Shared acyclic
children remain supported and become independent observations. Composition
native evidence retains applicability/context-before-evidence priority and
INVALID_CHAIN; concrete facts use INVALID_DECISION. No arbitrary runtime
exception is caught and relabeled as a financial error.

Python and Java Workflow imports require explicit terminalStates/transitions,
including embedded Entity declarations. Their native guard validation rejects
numeric subclasses without changing supported guard equality; Python Decimal
remains unsupported for Workflow. TypeScript already enforced those Workflow
boundaries. Python/Java failure-observation bridges now ask the owning Workflow
core to validate embedded definitions before emitting Entity observations;
invalid definitions no longer produce misleading diagnostic observations.

| Reviewed retention path | Outcome |
| --- | --- |
| Approval Decisions, histories, lifecycle metadata, requirement/condition observations | Native value validation and independent containers; actual returned histories are reused, with original/output mutations and rejected-input atomicity tested. Existing condition ownership controls remain active. |
| Workflow definitions, guards, bindings, later transitions | Supported controls preserve captured meaning and binding; mutable numbers and subclasses reject before retention. Original and observed containers are tested independently. |
| Entity definitions and embedded Workflow | Explicit collections and core guard validation apply. Special-key declaration reuse remains M6; malformed Entity boundaries remain M7. |
| Entity application data | D9 reproduced above; supported native numbers/error policy remains unresolved. |
| Audit evidence | Existing validated JSON ownership, numeric/cycle controls, append/import/redaction observations, and special-key regressions reviewed and retained. No generic freeze or Audit policy change. D8 remains open. |

The new native suite was demonstrated red before correction: TypeScript
11/14 initial tests failed, Python reported 14 subtest failures, and Java
reported 12 failures including a cyclic-value stack overflow. Final native
suites pass, including exact error priority for unsupported Requirement as well
as Decision composition evidence. Existing TypeScript tests that treated native
undefined members as merely ineffective now require INVALID_DECISION under D4;
missing-path controls remain ineffective. The adapter's stale Approval-vector
count was corrected from 277 to 579, without weakening result assertions.

Compatibility: callers must provide explicit portable Workflow collections,
replace unsupported native numeric objects with supported immutable values,
and omit optional members instead of supplying unsupported undefined values.
Native convenience constructors retain their documented defaults. No supported
exact number is rounded, stringified, or normalized into an accepted value.

Verification results:

| Gate | Observed result |
| --- | --- |
| Toolchains/build/strict typing | Toolchain check, all workspace builds/strict TypeScript, Python compilation on 3.12/3.13, strict Java compilation, tools tests, and architecture check pass. |
| Focused unit/native suites | TypeScript 1009 tests pass (130 Entity cases omitted only in the dedicated M5 configuration); Python six native methods with subtests pass on 3.12/3.13; Java 41 named native cases pass. All remain included in full-suite discovery. |
| Scoped coverage | TypeScript Approval/Workflow: 99.87% lines, 99.74% branches, 100% functions. Python native + Approval contracts + Workflow tests: 90% combined statement/branch coverage for Approval/Workflow. Clean Maven native + Approval contracts + Workflow coverage: 93.95% lines / 85.04% branches for Approval/Workflow. These are scoped measurements, not a claim that the full release coverage gate passes. |
| Mutation | Focused TypeScript Approval/Workflow Stryker: 96.42% (2154 killed, two timeouts, 79 survivors, one uncovered; 96.33% without timeout credit). Approval alone is 97.87%; Workflow is 91.96%, including diagnostic error-class mutants. The unchanged combined 95% gate passes. No new exclusions or ignore annotations. |
| Targeted probes | 15/15 new native ownership probes killed with independent passing controls; Python's seven repeat on 3.13. Existing Approval critical probes remain 105/105 killed (54/54 Python repeat on 3.13). Source targets for renamed Python copying are updated without changing fault intent. |
| Installed consumers | npm, wheel and sdist on Python 3.12/3.13, and JAR pass `--ownership`; these assertions also execute in default consumers before pending Entity checks. |
| Whole-manifest conformance | Of 1667 vectors: TypeScript 1579 PASS / 87 FAIL / 1 INFRASTRUCTURE_ERROR; each Python runtime 1361 / 282 / 24; Java 1465 / 202 / 0. No UNSUPPORTED outcomes. All 579 Approval vectors, all 34 explicit Workflow collection cases, and every one of the original 884 vectors pass on every runtime. Remaining failing/error results belong to M6–M7 Entity corrections. |
| Whole unit suites | Runner 130/130 pass. TypeScript core 1987 pass / 2 Entity failures; adapter 125 pass / 78 Entity failures. Each Python runtime has 45 failures / 3 errors in the full suite; Java evidence regressions have 39 failures. These known red M6–M7 gates remain visible and block full verification. |
| Repository consistency | Documentation links, traceability, licensing, developer-tool tests, and whitespace checks pass. |

Survivor review: the 18 composition survivors retain the M3 equivalence
explanations; unsupported Requirement evidence now kills the additional
INVALID_CHAIN-category mutation. Condition selector validation and timestamp
fallback survivors remain redundant as recorded in M4. The extra Decision
presence checks are redundant with native value validation; equal-length key
comparison without the name guard still differs on an absent value because
undefined is unsupported. The three new copy-helper survivors change the
default category to another value taking the same concrete-error branch, remove
a typeof check already enforced by Number.isFinite, or repeat an already-returned
null check. None changes supported evidence or its portable error.

Workflow survivors remove binding checks repeated by required-string validation,
return the same absent binding fields from unversioned getters, or remove
comparison branches made redundant by earlier type/shape checks for supported
guard values. The one uncovered comparison fallback is unreachable with a
supported retained guard operand. Workflow's 28 error-class survivors and four
Approval error-class survivors alter non-normative diagnostics, class names,
or absent optional properties. All remain counted; these explanations do not
waive critical mutations. The original/output alias, numeric-class, finite-value,
cycle, exact comparison, and portable error-category probes are killed.

Synchronization review: native/unit tests, mutation tools, installed consumers,
public JSDoc/docstrings, package/root/conformance READMEs, and traceability are
updated. Existing M2 vectors exercise all 34 collection cases; no new portable
vector can encode native object identity, mutable Number classes, or aliases.
Seven rows return to COVERED and three native/registry-only rows use NOT DIRECTLY
TESTABLE with explicit native evidence; 432 requirements remain (325 covered,
23 partial, 83 not directly testable, one D8 blocking gap). D9 is a newly
identified policy gap, not an invented requirement. Existing approved /spec
contracts already define the implemented behavior; Agentic IDs/metadata,
CoreDoc, AGENTS.md, and architectural boundaries are unchanged. No release note,
tag, publication, or Core 1.0 promotion occurs.

**M5 is complete for the accepted Approval/Workflow profile and adjacent-path
review. M6–M7 remain pending; D8 and D9 remain unresolved.**

## Milestone 6 — Preserve Entity declarations through observation and reuse

- [x] Fix F5 using own-member-safe retention and observation of valid declaration
      names. Do not reject `__proto__` merely to avoid the implementation defect.
- [x] Exercise create/import → definition observation → serialization/import →
      permitted mutation, prohibited mutation, and transition, using actual
      returned definitions and Entity observations.
- [x] Check adjacent keyed declarations in Entity, Workflow, Approval, and Audit
      boundaries for own-member loss or inherited-member acceptance. Preserve
      earlier Audit prototype-key regressions.
- [x] Assert exact keys and values, field mutability, binding/revision retention,
      failure atomicity, and unchanged prototypes for ordinary and special names.
- [x] Add mutation protection for unsafe assignment, dropped declarations, and
      inherited-member lookup. Exercise the regression in the installed npm
      consumer and update affected public documentation.

Completion: a valid Entity definition remains semantically identical through
observation and reuse, including valid special member names, without runtime
exceptions or accidental changes to permitted mutations.

### M6 implementation and verification — 2026-09-29

F5 is corrected in the TypeScript core. Mutability copying uses own-property
construction, so `__proto__` remains an ordinary declared State and survives
definition observation and serialization/import. Permission lookup requires an
own State entry; inherited `constructor`/`__proto__` values cannot become field
lists or cause a raw TypeError. No valid name is forbidden or normalized.

The adjacent-path review also reproduced inherited Entity validator values:
creation accepted a positive Money field from a prototype, then structured
copying omitted it from the returned data. The returned Entity consequently
failed its own validator. Own-field lookup now rejects this input with
ENTITY_VALIDATION_FAILED under ENTITY-VALIDATION-001/003/004/006. This preserves
the existing validation rule and resulting-state invariant; it does not extend
D9's unresolved native numeric profile.

The permanent native suite covers four State names crossed with four field
names, independent original/output declaration mutations, actual JSON
serialization and definition/observation reuse, allowed and forbidden field
changes, terminal-State rejection, stable Workflow binding, revision/conflict
import, unchanged prototypes, and failure atomicity. It also checks inherited
State/validator fields and adjacent Workflow guard facts, Approval conditions
and facts, and Audit metadata. Six of the initial 23 tests failed before the
retention/lookup correction; all four added validator tests failed before its
own-field correction. All 27 pass now. Unexpected runtime errors remain
infrastructure failures in native probes; only an explicit wrong portable
rejection of a valid declaration is asserted as a domain mismatch.

Adjacent review: Workflow/Approval key collections use Maps/Sets or safe own
record copying, and fact lookups reject inherited members. Audit retains safe
own-property construction and its prior prototype-key regressions. Python/Java
map keys do not have JavaScript prototype semantics; their ten portable F5
controls pass unchanged. No cross-domain freezing or adapter financial logic
was introduced. Entity revision/conflict metadata is verified through the
import envelope; this does not add revision tracking to the FinancialEntity
instance API.

| Verification | Result |
| --- | --- |
| Build/typing | All workspaces build and strict TypeScript passes; configured toolchains and strict Java compilation pass. |
| Unit and coverage | 27/27 new native tests pass. Focused TypeScript core: 2019 pass, one known M7 case skipped only in that configuration; changed Entity file coverage is 100% statements/branches/functions/lines. Full runner 130/130 passes; full TypeScript core retains one M7 failure and adapters retain 78. Both Python versions retain 45 failures/three errors among 766 full-suite tests. Java native special-name cases pass 10/10. |
| Mutation | Complete changed `entity.ts`: 98.54%, 405/411 killed, six survivors, no uncovered mutants or timeouts; unchanged 95% gate. Five targeted native probes are killed with independent passing controls. |
| Installed packages | npm special-state/field declaration reuse, mutation/transition, and validator checks pass; Python wheel/sdist on both runtimes and JAR ownership controls pass. Assertions run by default and under `--ownership`. |
| Conformance | 1671 total: TypeScript 1583 PASS / 87 FAIL / one infrastructure error; Python 3.12 and 3.13 each 1365 / 282 / 24; Java 1469 / 202 / zero. No unsupported outcomes. All ten special-name vectors and all original 884 vectors pass on every runtime. Remaining full-manifest failures belong to M7; no full-conformance claim. |
| Repository checks | Tool tests, architecture, documentation links, traceability, licensing, and whitespace pass. Full release verification remains blocked by the published M7 regressions. |

Survivor review: the revision/conflict presence check is redundant with unequal
string-versus-undefined comparison; two Money shape checks are repeated by
Money.deserialize. Empty catches yield undefined instead of false, both rejected
by the same validation branch. The sixth changes non-normative error text.
All survivors remain counted; no financial logic was excluded or ignored.

Synchronization: four new manifest-discovered special-field vectors supplement
six existing special-state controls. Native tests, five probes, installed npm
consumer, JSDoc, implementation/root/conformance READMEs, developer-tool docs,
and traceability are updated. ENTITY-DEFINITION-002 and MUTABILITY-002 return to
COVERED; broader declaration/import/error rows retain M7 qualifications. The
inventory is 432 requirements and 1671 vectors: 327 covered, 21 partial,
83 not directly testable, one D8 blocking gap. Existing spec obligations already
define the corrected behavior, so no new semantics, requirement IDs, Agentic
operation/metadata changes, CoreDoc/AGENTS changes, release notes, or publication
are needed. D8 and D9 remain unresolved.

**M6 is complete. M7 and full release verification remain pending.**

## Milestone 7 — Portable malformed-input failures and adapter observations

- [x] Close F8b/F8c and F9a–F9c from M2: Workflow instance/target error
      preservation; Entity scope/data/State/empty-change/evolution request
      validation; TypeScript null-facts adapter failure; Python Audit relationship
      type exceptions; and validation of existing Entity data before mutation.
      Keep each primary error and non-mutation obligation under its owning spec.


- [x] Fix F6b in the Python core and review adjacent mutability containers and
      list entries at create/import, mutation, transition, and evolution boundaries
      where those declarations are consumed.
- [x] Fix F6c so Python failure-observation construction cannot replace the
      original core error. Validate financial input in the core; adapters only
      observe safely and preserve the established result.
- [x] Exercise all four Entity evolution kinds with omitted, null, wrong-type,
      malformed, and valid Audit histories under the settled contracts. Include
      malformed nested events and primary Audit failures combined with evolution
      correspondence failures, following existing priority.
- [x] Review equivalent adapter error/observation paths across domains and
      languages. Assert exact codes and unchanged inputs; unexpected runtime
      defects remain infrastructure failures, not blanket domain-error mappings.
- [x] Confirm legitimate omission, empty histories, empty permitted-field sets,
      and valid controls remain supported where specified.
- [x] Add paired critical/native probes and synchronize vectors, adapter tests,
      public documentation, and traceability for the corrected boundaries.

Completion: reviewed malformed inputs produce the governing portable failure
without fabricated observations, partial effects, or secondary adapter crashes.

### M7 implementation and verification — 2026-09-30

F6b/F6c, the remaining F8b/F8c boundaries, and F9a–F9c are corrected under
D1–D7's accepted contracts. Entity definitions validate explicit identity scope,
Workflow declarations, and every mutability entry before use. Each declared
State requires an own field list; empty lists remain valid. Current data must
be an object satisfying its validators before mutation, transition, import, or
evolution. Overwriting an invalid Money field with valid proposed data cannot
repair an invalid original observation. Empty changes use INVALID_MUTATION.
Malformed current States use WORKFLOW_INVALID_INSTANCE; undeclared nonempty
States and unknown transition targets retain WORKFLOW_INVALID_STATE. Transition
edge/terminal/guard priority belongs to Workflow and is no longer preempted by
Entity target checks.

TypeScript passes missing Workflow instances together with their definitions
to core, preserving validation order, and observes null facts safely on rejected
transitions. Python checks Audit relationship type before set membership, so
object/array types produce AUDIT_INVALID_EVENT rather than an unhashable-type
exception. Failure observations inspect malformed history containers safely;
Python/Java reconstruct valid Entity observations through core instead of
reporting invalid input as valid state. No blanket runtime-exception conversion
or financial validation was added to an adapter.

All four evolution kinds exercise omitted, null, wrong-type, malformed nested,
and valid Audit histories. Intrinsic Audit failures retain priority over
correspondence failures, including malformed relationship types in first/last
positions. Missing histories use the existing empty default; explicit null is
invalid. Python and Java also stop accepting explicit null evolution history.
Request relation IDs and supersession scopes use INVALID_MUTATION; imported
relation identities retain their existing INVALID_IDENTITY category. Mutation
review added an empty imported relation-ID regression, which kills the remaining
meaningful string-validation mutant.

The pre-fix sweep reproduced core/adapter failures across languages. Additional
F9/native tests run against the original Python source produced two assertion
failures and one raw TypeError: invalid original data was accepted, malformed
Audit relationship type escaped, and omitted Audit history masked Actor priority.
Permanent direct-core tests now discover the complete Entity/Workflow M2
malformed matrices as well as M7 cases. Every failure case asserts its exact
portable code and unchanged caller input; valid controls retain exact outcomes.

Compatibility: previously accepted incomplete mutability definitions, non-object
Entity data, empty changes, and explicit null evolution histories now fail.
Python callers can omit `import_evolution_history`'s argument or pass `[]`;
Java callers must pass an empty list instead of null. The original
`entity.transition.rejected-preserves-entity-001` used undeclared target UNKNOWN
but expected INVALID_TRANSITION, contradicting WORKFLOW-ERROR-007. Its expected
code is corrected to INVALID_STATE; its ID, input, and unchanged observation are
preserved. Older unit fixtures now declare all States, as already required by
ENTITY-MUTABILITY-008. These are accepted-contract corrections, not a new
financial policy or a change made merely to fit implementation output.

M7 adds 47 manifest vectors and promotes one existing supplementary empty-State
case without changing its ID. Eight new supplementary cases distinguish
omitted/null Audit history combined with an invalid Actor. The inventory is
1719 vectors, 189 supplementary cases, and 432 requirements: 347 COVERED,
one PARTIAL (the separate Workflow external-fact authoring limit), 83 NOT
DIRECTLY TESTABLE, and one BLOCKING SPEC GAP (D8). D9 remains a separate policy
gap; this work does not choose an Entity native-number profile.

| Verification | Result |
| --- | --- |
| Build/typing | All workspace builds and strict TypeScript pass; strict Java compilation and Python compilation pass. |
| Unit/native/adapter | Runner 130, TypeScript core 2483 and adapter 210 tests pass. Python 3.12/3.13 each pass 1229 native tests and their adapter suites. Java native and adapter suites pass, including 771 direct evidence cases; Maven verifies 45 test methods. |
| Conformance | All 1719 vectors pass on TypeScript, Python 3.12/3.13, and Java; zero failures, unsupported operations, or infrastructure errors. |
| Coverage | Full TypeScript core: 99.74% lines, 99.42% branches, 100% functions. Python combined coverage is 94%; Java has 93.98% lines and 84.27% branches. Both configured coverage gates pass. |
| Mutation | Both complete TypeScript Entity files: 98.49%, 783 killed, ten survivors, two uncovered, no timeouts; the 95% gate is unchanged. Entity critical probes 88/88 and Python Audit probes 10/10 pass with independent controls. Python 3.13 repeats 46/46 Entity and 10/10 Audit probes successfully. The complete native gate kills 117/117 probes with independent passing controls; the repaired lifecycle probe also passes under Python 3.13. |
| Installed consumers | Default npm, Python wheel/sdist on 3.12/3.13, and JAR consumers pass. |
| Repository checks | Tool tests, architecture, documentation links, traceability, licensing, and whitespace pass. |

Survivor review: Workflow reconstruction repeats the malformed-State type
check; conflict-version comparison already rejects undefined against a string;
Money.deserialize repeats the Money shape checks; empty catches produce
undefined rather than false, both rejected. Another mutant changes only
non-normative error text. The Supersession effect collision is already rejected
by same-step currentness validation. The two uncovered defensive throws guard
an impossible missing appended Audit event and non-object retained Entity data,
which construction/import now reject. Their condition mutants are redundant.
All ten survivors and both uncovered mutants remain counted, with no exclusions
or timeout credit. The initially surviving empty imported relation-ID check is
now killed by its permanent regression.

Mutation tooling retains the named regressions and controls while updating
source targets for the shared own-State check, shared Python import validation,
and explicit Audit history defaults. A legacy Approval native probe referenced
removed `deepcopy`; it now uses the existing owned-copy helper so it tests
lifecycle validation rather than raising NameError. That infrastructure failure
was not counted as a kill. The older Python reused-history probe now bypasses
the shared Decision-shape validator: bypassing only list import had become
redundant with proposed-result validation. Its original named regression and
control remain unchanged. Python 3.13 temporary-copy races during package and
coverage artifact writes were retried after both writers finished.

Synchronization review: native/unit and adapter tests, vectors, paired critical
and native probes, JSDoc/docstrings, package/root/conformance READMEs, developer
tool instructions, and traceability are updated. The old declaration-only
Vitest exclusion is removed. Existing /spec and Agentic metadata already define
the corrected error surfaces and semantics, so no normative requirement,
canonical operation/error ID, CoreDoc, AGENTS.md, or architecture change is
needed. No release notes, tag, publication, or Core 1.0 promotion are performed.
The complete combined-candidate `npm run verify` and fresh independent review
remain Milestone 8 work; D8/D9 remain unresolved.

**M7 is complete for the accepted contracts. M8–M9 and D8/D9 remain open.**

## Milestone 8 — Full verification and independent readiness review

### Initial review result — 2026-09-30; before D10 resolution

The initial isolated candidate is `fa447a8711845893a4ac929d56b10782974de46b`.
Fresh native review reproduced F10: TypeScript sparse arrays bypassed collection
validation or raised raw runtime errors. Holes in guard lists could permit a
transition; eligibility and mutability declarations could retain missing entries.
Existing owning requirements already prohibit malformed members. Permanent native
regressions and paired controls cover the affected boundaries. Final M8
verification closes F10 for the accepted contracts. The later D10 resolution
and its required fresh verification are recorded below.

### F10 correction and verification tooling

Native red reproduction: 69 failures and 39 passes across 108 cases. The retained
suite places a missing position first, in the middle, and last at each of 27
boundaries, with independent dense controls and input-preservation assertions.
Another 125 cases require arrays at collection-only boundaries (233 total);
Actor/Change JSON values retain their permitted alternative types. Twenty-four
untrusted traversals now validate every position with indexed traversal;
validated internal traversals retain their existing behavior. The complete native
suite passes. Twenty-four paired mutations silently drop holes and are killed by
the named regression while dense controls pass. A raw runtime exception is not
counted as a kill. Quorum eligibility is already protected by shared value
validation, so its regression needs no redundant traversal change/probe.

Fresh deterministic review on the initial candidate ran 6,154 expanded JSON cases
on TypeScript, Python 3.12/3.13 and Java: 30 observation leads, two code differences,
zero raw exceptions and zero input mutations. All leads were inspected: 27 optional
error observations, two absent Audit-redaction histories with unspecified
cross-error ordering, and one optional absent-versus-empty revision observation.
The latter two code differences are the omitted `history` variants of
`audit.boundary096.authority-control-001` and `audit.redaction.unknown-path-001`.
No invented ordering expectation or repaired input was introduced.

An independent requirement-derived oracle checked 596 additional cases on every
runtime: all 256 assignments of four Requirement outcomes to a shared graph,
under both declaration orders (512 cases), plus 84 whole/selected fact cases
covering null, Boolean/number/string distinctions, nested arrays/objects, own
special keys, member order, and nanosecond Decision timestamps. All passed with
exact results and unchanged inputs. These are retained in native tests; 49
Workflow guard type-pairs and an alias/returned-Decision reuse sequence extend
the permanent review suite to 646 cases. Final survivor inspection then added
64 Audit type-pairs (710 total): the previously ignored primitive-as-object
mutation incorrectly made Boolean false equal an empty object. Its named
false-to-object regression fails with an exact portable-result mismatch while
the valid false-to-string change control passes. No production or normative change was needed;
this was a meaningful mutation-coverage gap under AUDIT-CHANGE-005/008. Existing cross-domain sequence tests
remain included. The 64 Audit type-pairs also passed every corrected runtime through Audit append,
including full success/error history envelopes and unchanged inputs. These finite
cases are not exhaustive graph/value enumeration.

Initial complete verification reached all conformance, coverage and package
gates and both full Stryker suites, then correctly failed: a removed Python
Entity validation guard caused four infrastructure errors elsewhere in the full
mutated suite. No kill was credited. The default critical-probe command now uses
the established `--paired` mode: complete unmodified suite baselines, every named
regression, and all independent controls remain mandatory. Direct unfiltered
mutation remains available. Two stale Python Workflow adapter mutation anchors
were also made unique; 412 static target checks now cover every critical/native
probe. No source behavior was changed to accommodate a mutant.

Core Stryker now includes every integration test. Four broad lexical exclusions
were removed: Currency, decimal, Event type and timestamp regexes are mutated
inside validation calls. Scoped verification killed 354/357 mutants (99.16%),
with no uncovered mutants or timeouts. Two malformed-container survivors
prompted the additional 125 cases; the third always validates omitted metadata
as undefined, preserving the same public result.
The 95% threshold and complete source-file scope are unchanged. The first corrected full run scored 96.25% with no ignores, but survivor
inspection identified the Audit primitive-as-object gap described above. That run
was stopped before probe completion and is not the final verification result.
A new complete run includes the added Audit regressions.

M8 exclusion audit also removed the remaining operator-family ignores. An
`EqualityOperator` ignore justified only `<` versus `<=` also excluded the
non-equivalent `>=` mutation; likewise an arithmetic-family ignore covered more
than its cited sign identity. No core mutation exclusions remain. Equivalent
mutants stay in the report/denominator for explicit review. No threshold is lowered.

### F10 adjacent native traversal cases

The first sparse-array fix used `Array.from(input, validate)`. Review demonstrated
that a caller-supplied iterator could hide an invalid indexed guard and permit a
transition. The extended 300-case collection suite covers 32 boundaries: 128
hole/dense cases, 140 malformed-container cases, and 32 iterator-override cases.
Before the indexed traversal fix, 30 cases failed and 270 passed. All now pass.

An internal `arrayValues` helper uses the native indexed Array traversal rather
than caller iteration; owning domain validators still select every portable
error. It is not exported from the package entry point and defines no financial
rule. It also protects retained Approval/Workflow values, Audit history import,
composition observations and selector capture. All other Array callbacks were
reviewed against their callers; operations on validated internal arrays retain
their existing implementation.

Three additional tests reproduced sparse/overridden-method Workflow facts
passing a guard and an overridden eligibility mapping changing a quorum result.
Those entry points now also consume indexed values. Seven retained regression/
control/reuse tests extend `review-invariants.test.ts` to 717 cases; the combined
native review has 1,017 cases. These include an effectiveness regression preventing
a selector Array method from accepting changed facts. Twenty-eight paired collection
probes pass (24 hole bypasses, one iterator bypass, three method/capture bypasses);
the full native gate now contains 145 probes. The older Condition ownership probe
now returns the original caller selectors: removing only the local copy is
redundant after shared selector capture, and is no longer claimed as a defect. These are existing declaration, fact, eligibility and
non-mutation rules, not new financial policies. JSON cannot encode these native
hooks. The previous verification was stopped and a fresh isolated full run is
required for this final executable candidate.

### Runner scalar validation mutation coverage

Review of the runner report identified a meaningful survivor previously grouped
with redundant record checks. Replacing `typeof value === 'object'` with `true`
admits scalar fixture input/context and expected/actual observations. This is a
runner shape-validation gap in the tests, not missing financial logic or a defect
in the unmodified validator. Six permanent tests cover Boolean, number and string
values at those boundaries, for success and error envelopes. Against the exact
mutant all six fail by assertion while four valid controls pass; all 136 runner
tests pass against the correct implementation. The previous 19-survivor runner
classification is superseded. A complete candidate rerun includes these tests.

### Pre-D10 mutation disposition on the corrected core

The pre-D10 candidate's complete core run reports 4,255 killed, 155 surviving,
10 uncovered and 12 timed-out mutants, with zero ignored mutants: 96.28%, or
96.01% counting only assertion/test kills. Every non-killed mutation was inspected
against its call sites and admitted values; the final complete rerun reproduced
every mutation status from the audited indexed candidate. Remaining survivors
are retained in the score denominator:

| Family | Survivors | Disposition |
| --- | ---: | --- |
| Portable error classes | 77 | Diagnostic messages, class names and optional diagnostic details; portable error codes remain protected. |
| Money | 9 | BigInt zero has no negative-zero distinction; zero divisors are rejected earlier; multiplication/division by a sign of ±1 and equal-scale branches yield identical exact values. |
| Workflow | 15 | Required version strings are revalidated downstream; unversioned optional getters still return undefined; admitted JSON types make the remaining equality prechecks redundant. |
| Approvals | 32 | Delegated timestamp/value/selector validation; unused synthetic entries/internal flags; equivalent inapplicable/closed-stage paths; redundant outcome-presence checks. Differently named fact members still compare against unsupported undefined and cannot become equal. |
| Audit | 12 | Finite/type checks on already validated JSON, omitted metadata retaining undefined, unused synthetic entries, and checks repeated by prior-target/redaction preflight validation. The primitive-as-object mutation is killed. |
| Entities | 10 | Delegated Workflow/Money validation, private false-versus-undefined predicates consumed only as Boolean conditions, redundant currentness/data guards, and one diagnostic message. |

The ten uncovered mutants are defensive branches: two Audit clone-failure catch
mutations, one already-preflighted redaction rejection, the impossible absent
result after successful Entity Evolution append, an Entity data guard after
construction validation, four unsupported rounding-dispatch defaults behind
public mode validation, and Workflow equality's fallback after admitted guard
types. They remain uncovered and count against the score; none is an exclusion.

The twelve timeouts comprise ten Money GCD/factor/zero-denominator loop mutations
and two composition graph-queue mutations. Inspection identifies nonterminating
paths, and these families reproduced across complete runs. They are not claimed
as assertion kills; the score without their credit still exceeds 95%.

After the scalar validation correction, the runner's remaining mutations concern
diagnostic text/source labels and exception wrapping. The schema-read kind-label
mutation retains `RunnerInfrastructureError`, infrastructure status and exit
classification; it changes only its diagnostic category. No financial logic was
added to the runner. The final report confirms 628 killed and 18 survivors
(97.21%), with no uncovered, timed-out or ignored mutants. Its only change from
the earlier report is the killed scalar-record validation mutation.

### D10 — Audit Event metadata native value profile: resolved 2026-09-30

The user requested resolving D10 after the M8 review. The proposed existing
Audit JSON-value profile is adopted through new **AUDIT-EVENT-009**; the optional
context meaning of **AUDIT-EVENT-006** and contradiction rule **008** remain intact.
Event metadata preserves omission versus supplied null and every JSON member,
including special own names. Shared acyclic values and defensive observations
remain valid. Cycles and unsupported native values use
`FINKORE_AUDIT_INVALID_EVENT` at non-actor representation validation under
**AUDIT-ERROR-004**, without coercion or partial history changes. Native numeric
support follows the existing Audit profile; D9 is not resolved by this decision.

Compatibility correction: TypeScript no longer accepts Map, Date, cycles,
non-finite numbers, sparse arrays or other non-JSON Event context, and supplied
`undefined` no longer means omission. Java now retains explicit-null metadata
from portable input. Its Event record gains `hasMetadata`; the existing
eight-argument constructor remains available with its prior null-means-omitted
convention, while the explicit-presence constructor can represent supplied null.
Record patterns must account for the added component. This is an observable
release-candidate correction under SPEC-FREEZE-001/002/003 and
SPEC-COMPATIBILITY-012/014, not an editorial claim or a new operation/error ID.

Red reproduction preceded the implementation: 75 of 84 initial TypeScript native
cases failed; Java's null-presence case failed while its omission control passed.
The retained TypeScript suite now has 89 cases across construction, import,
append and redaction evidence, with exact codes, unchanged history and valid
later reuse, including four direct-construction checks exposed by mutation review.
Java tests cover null/omission import, append/reuse and both native
constructors. Python's established profile needs no behavior change; an explicit
presence/value/reuse test supplements its existing cycle/numeric/ownership tests.
Nineteen portable vectors cover all JSON categories, special members, imported
null metadata, contradiction and error priority. An invalid-history vector does
not require an unspecified diagnostic history observation; native tests check
source preservation directly.

Entity Evolution's old `related: undefined` fixture is now an invalid Audit JSON
value, so its expected error changes under the adopted priority. A separate true
omission fixture retains the original Entity correspondence error. Neither
expectation was weakened to accommodate accidental implementation behavior.

Eleven paired D10 probes cover unsupported profiles, explicit undefined,
non-finite values, cycle repair, sparse repair, caller iteration, aliases, own
member loss, Java null import/observation and Python null loss. All eleven are
killed with independent controls. An exploratory unsafe prototype-assignment
mutation raised an unclassified exception and received no kill credit; the
retained own-member-loss probe produces a direct value mismatch instead.

Scoped Event mutation testing finishes with 183 killed, two recursive-cycle
mutations reaching the execution limit, and no survivors, uncovered or ignored
mutants: 100%, or 98.92% without timeout credit. The stricter copier initially
masked two relationship-type guard deletions until serialization; direct Event
construction regressions now kill both. All 105 Audit vectors pass on TypeScript,
Python 3.12/3.13 and Java. The full manifest now has 1,738 vectors and 433
requirements (348 covered). These scoped results do not replace the full run.

A separate deterministic review runs 272 cases (288 adapter operations) on each
runtime, all passing with exact full results and unchanged inputs. Starting from
`audit.redaction.actor-context-001`, vary source Event and evidence metadata
independently over omission plus null, false, true, 0, -1, 1.25, empty/nonempty
strings, empty/nested arrays, empty/nested objects, and own `__proto__`/`constructor`
members (16 profiles; 256 redaction pairs). The other 16 cases append each profile
and reuse its actual returned history for a later append containing null metadata.
Expected values retain context while applying only the fixture's Actor redaction.
This finite review does not extend the native numeric profile or resolve D8/D9.

Normative, conformance/traceability, Agentic, JSDoc and package documentation are
synchronized. CoreDoc and AGENTS.md require no foundational or architectural
change. M9 release history/tag work is not part of this correction. Full combined
verification after D10 passes, as recorded below; the earlier result is historical.

### Pre-D10 combined verification — 2026-09-30

The complete `npm run verify` exited zero on the isolated candidate based on
`fa447a8711845893a4ac929d56b10782974de46b`, with staged Git tree
`c635266bf2d7ca625dc5b1135e0b2749b7705bea`. This candidate includes the indexed
collection fixes, complete core mutation scope, Audit type regressions, all
paired probes and the final runner scalar regressions. Its tracked files were
unchanged after verification. Earlier partial runs and the successful indexed
candidate before the runner tests are not substituted for this final result.

| Gate | Final observed result |
| --- | --- |
| Toolchains, builds and strict typing | Passed on Node 24.15.0, CPython 3.12/3.13, JDK 21 and Maven 3.9.x. |
| Unit/native, adapter and tool tests | Passed: 136 runner, 3,500 TypeScript core and 210 TypeScript adapter tests; 1,229 Python tests on each supported version; all Java, subprocess-adapter and 429 developer-tool tests. |
| Conformance | All 1,719 manifest vectors passed on TypeScript, CPython 3.12, CPython 3.13 and Java; zero failed, unsupported or infrastructure outcomes. |
| Coverage | All configured gates passed: runner 100% lines / 96.61% branches; TypeScript core 99.74% lines / 99.42% branches; Python 94% combined statement/branch coverage; Java 93.98% lines / 84.27% branches. |
| Installed consumers | All six passed: npm, Python wheel and sdist on both versions, and Java JAR. |
| Runner mutation | 97.21%; 628 killed, 18 reviewed survivors, zero uncovered, timed-out or ignored mutants. |
| TypeScript mutation | 96.28%; 4,255 killed, 155 reviewed survivors, 10 uncovered defensive branches, 12 nonterminating mutations, zero ignored mutants. Without timeout credit: 96.01%. |
| Critical/native probes | 267/267 critical, 145/145 native and 56/56 Python 3.13 native probes killed; independent controls passed. Raw infrastructure failures receive no kill credit. |
| Repository checks | Architecture, documentation links, traceability, licensing and whitespace passed. Traceability retains 432 requirements, 1,719 vectors and 347 covered requirements. |

Fresh review was repeated against the corrected implementation sources: all
6,154 expanded cases on every runtime reproduce the same 30 classified leads
and two unspecified error-order differences, with no raw exceptions or input
mutation. The 596 independent graph/fact cases and 64 Audit type-pairs pass on
every runtime with exact results. Review implementation/adapter sources were
compared byte-for-byte with the final candidate. Permanent native suites retain
1,017 review cases and 28 paired collection probes; the six runner scalar tests
retain the additional validator coverage correction.

At this pre-D10 snapshot, F1–F10 and the Audit/runner mutation gaps were
reconciled for their accepted contracts. D10 then remained unresolved and blocked
M8 closure; its later resolution above requires a new full verification. D8/D9
remain open. No unqualified Core 1.0 or full native-profile readiness claim is made.

Review is finite: the selected graph/value combinations and native collection
hooks do not exhaust arbitrary graphs, containers, accessors, proxies or runtime
tampering. This is a coverage limit, not a new exemption from specification
requirements. The two unspecified cross-error orderings retain their existing
classification without an invented expected code.

Only documentation outcome/status edits follow the verified tree; executable,
normative, dependency, fixture and test files remain byte-identical. Documentation,
traceability, architecture, licensing and whitespace checks are repeated after
those edits. No installed usage example changes require another consumer run.

### Synchronization review

Unit/native regressions, paired mutation probes, mutation-anchor tests and runner
validation tests were added. Existing JSON vectors still define the portable
cases; sparse arrays and overridden native Array hooks are covered by the native
supplement in `/conformance`, without changing vector IDs or the manifest count.
Public API JSDoc and root/package/tool READMEs describe the compatibility
correction and pending profiles. No public package entry point or signature was
added; the shared Array traversal helper remains internal and domain-neutral.

For the pre-D10 corrections, no `/spec` or Agentic metadata change was needed: existing
requirements, canonical operation IDs, effects and portable errors are unchanged.
D10 subsequently adds AUDIT-EVENT-009 and updates Agentic metadata. CoreDoc, release notes and AGENTS.md
need no change: financial foundations, architecture and development obligations
are unchanged, and M9's release work has not been performed. No tag, version
promotion, publication or remote push is part of M8.


- [x] Run the complete `npm run verify` on the combined candidate, including
      toolchain checks, builds, strict typing, all unit/native/adapter/tool tests,
      Python 3.13 compatibility, conformance, coverage, installed consumers,
      both full configured mutation suites, critical/native probes, architecture,
      documentation/traceability, licensing, and whitespace.
- [x] Preserve mutation thresholds of at least 95% and meaningful mutation scope.
      Inspect surviving, uncovered, ignored, and timed-out mutants for critical
      behavior, not only aggregate percentages. Investigate timeout credit and
      justify equivalent exclusions explicitly; no critical mutant may survive.
- [x] Require every manifest vector to pass on TypeScript, Python 3.12/3.13,
      and Java, with no unsupported or infrastructure outcomes for claimed scope.
      Compare normalized success values and specified observations as well as
      portable codes; native guarantees need their own tests.
- [x] Perform a fresh specification-led review after the fixes. Start from public
      operations and their invariants rather than merely rerunning the new
      examples: all declared evidence, proposed-result validity, ownership,
      optionality, exact values, failure priority, and later reuse.
- [x] Exercise a deterministic set of additional seeds, graph arrangements,
      malformed nested values, aliases, and operation sequences beyond M2's
      regressions. Recheck cross-language agreement against `/spec`, including
      cases where every implementation agrees on an invalid result.
- [x] Add each new confirmed mandatory gap to the appropriate milestone, retain
      its failing regression and valid control, and fix it before closure. A new
      financial ambiguity reopens M1; a green existing suite does not close it.
- [x] Run complete clean-candidate verification again after any executable,
      normative, fixture, dependency, or test change from the review. Record the
      exact candidate and actual results in this plan; distinguish earlier runs
      from the final result. Use isolated checkouts, not concurrent builds or
      mutation runs sharing generated class directories.
- [x] Reconcile every finding, newly discovered subcase, and affected traceability
      row with permanent tests and mutation protection. No unexplained mandatory
      gap or unreconciled exploratory failure family may be marked complete.

The verification/review actions above pass again after D10, as recorded next.

Completion: the exact combined candidate passes the full gates and fresh review.
Report remaining coverage limits honestly. Finite tests and review support a
bounded readiness assessment; they do not prove that all possible defects have
been discovered.

### Post-D10 combined verification — 2026-09-30

The complete `npm run verify` exited zero on the isolated candidate based on
`b2f93fe0509c60851f9902ddfd59152e875f2de5`, with staged Git tree
`0c08016142d0c036a3715f702b0caf0ab39a04e1`. This run includes the normative
AUDIT-EVENT-009 correction, all metadata vectors, native regressions and eleven
paired probes. Candidate tracked files remained unchanged throughout verification.

| Gate | Final observed result |
| --- | --- |
| Toolchains, builds and strict typing | Passed on Node 24.15.0, CPython 3.12/3.13, JDK 21 and Maven 3.9.x. |
| Unit/native, adapter and tool tests | Passed: 136 runner, 3,589 TypeScript core and 210 TypeScript adapter tests; 1,230 Python tests on each supported version; all Java, subprocess-adapter and 440 developer-tool tests. |
| Conformance | All 1,738 manifest vectors passed on TypeScript, CPython 3.12, CPython 3.13 and Java; zero failed, unsupported or infrastructure outcomes. |
| Coverage | All configured gates passed: runner 100% lines / 96.61% branches; TypeScript core 99.75% lines / 99.43% branches; Python 94% combined statement/branch coverage; Java 93.99% lines / 84.37% branches. |
| Installed consumers | All six passed: npm, Python wheel and sdist on both versions, and Java JAR. |
| Runner mutation | 97.21%; 628 killed, 18 reviewed survivors, zero uncovered, timed-out or ignored mutants. |
| TypeScript mutation | 96.34%; 4,305 killed, 154 reviewed survivors, 10 uncovered defensive branches, 14 execution-limit/nonterminating mutations, zero ignored mutants. Without timeout credit: 96.03%. |
| Critical/native probes | 267/267 critical, 156/156 native and 57/57 Python 3.13 native probes killed; independent controls passed. Raw infrastructure failures receive no kill credit. |
| Repository checks | Architecture, documentation links, traceability, licensing and whitespace passed. Traceability retains 433 requirements, 1,738 vectors and 348 covered requirements. |

Every runner mutation status matches the reviewed pre-D10 report. Every core
mutation outside `audit-event.ts` also retains its previous status. Event now
has 183 killed, two execution-limit mutations and no survivors or uncovered
mutants; its former omitted-metadata survivor is killed. The remaining Audit
survivor family therefore contains eleven mutants, while all other survivor and
uncovered dispositions above remain applicable. The two added cycle-guard
removals hit recursion execution limits (401/400 and 801/800); they are not
assertion kills. No critical mutant survives, and the score exceeds 95% without
timeout credit.

The separate 272-case review described in D10 passes on every runtime, including
exact redaction results and actual append-result reuse. Review implementation
and adapter files are byte-identical to this candidate. The earlier M8 broad
review remains applicable to the unchanged domain implementations; this additional
review exercises the changed Event value and presence contract. Its finite
coverage does not establish exhaustive correctness or select D8/D9 policy.

Only documentation outcome/status edits follow the verified tree; executable,
normative, dependency, fixture and test files remain byte-identical. Documentation,
traceability, architecture, licensing and whitespace checks are repeated after
those edits. The synchronization review now also includes AUDIT-EVENT-009,
Agentic metadata and the documented Java Event record component/constructor
compatibility consequences.

D10 is resolved, and M8 is complete for the accepted contracts. D8/D9 remain
open; M9 and Core 1.0 promotion have not been performed.

### D8 — Optional redaction policy identity: resolved 2026-09-30

The maintainer selected “Optional; validate when supplied.” New
**AUDIT-REDACTION-008** distinguishes omission from supplied null and requires a
nonempty string for a supplied `policy.id`. Labels are opaque and unnormalized;
no registry, authenticated identity or production redaction encoding is added.
History validation still precedes policy processing, and malformed supplied
identity rejects with `FINKORE_AUDIT_REDACTION_INVALID` during policy validation
before candidate evidence validation. Authority and protected targets remain
required regardless of ID presence. Failure preserves history and later reuse.

This is an observable release-candidate correction under
SPEC-FREEZE-001/002/003 and SPEC-COMPATIBILITY-012/014. TypeScript and Java accept
omission they previously rejected. Python rejects malformed supplied values it
previously ignored. Java's native `RedactionPolicy` constructor retains null as
its omission sentinel and now rejects an empty string; portable parsing rejects
supplied null. The TypeScript interface makes `id` optional and its validator
rejects supplied undefined. Existing valid supplied IDs keep their behavior.
Canonical operation IDs and portable error codes are unchanged; `audit.redact`
remains a conformance-local label.

Red reproduction precedes the fixes: the TypeScript omission case fails while
19 controls/negative cases pass; Java omission and empty-constructor cases fail
while its three other cases pass; Python reports nine malformed-ID failures
and a policy-before-evidence failure. Permanent tests assert full success
results, portable errors, input/history preservation and actual-result reuse.
Twenty vectors cover omission, valid opaque labels, all malformed JSON categories,
authority/target independence and validation priority. AUDIT-REDACTION-001
returns to COVERED and new AUDIT-REDACTION-008 is COVERED: 434 requirements,
350 covered, and 1,758 vectors. D9 remains an explicit native policy gap.

Nine paired native probes cover requiredness regressions, validation bypasses,
null-as-omission, empty strings and native constructor validation. Success
regressions classify portable rejection as an assertion mismatch while raw host
exceptions remain unclassified failures; the initial required-ID probe received
no kill credit until that distinction was explicit. All nine probes now pass
with independent controls. Scoped redaction mutation testing reports 132 killed,
three survivors and three uncovered defensive mutations: 95.65%, with no timeouts
or ignored mutants. The survivors are unused synthetic Change entries and the
redundant post-preflight match check; uncovered branches are clone-failure catches
and the preflighted rejection. No new policy-ID branch survives.

A fresh deterministic review passes 90 cases (180 operations) on each of
TypeScript, Python 3.12/3.13 and Java. It crosses fifteen identity profiles
(omitted, null, empty string, both Booleans, zero, nonzero number, empty array,
object, nonempty array, whitespace, ordinary label, Unicode, `__proto__` and
`constructor`) with six Actor-context/Change target combinations. Exact results
retain source relationships and unrelated fields. Successful cases reuse actual
returned history for append; rejected cases preserve inputs/history and recover
with an omitted-ID policy using the same evidence identity. The full combined
verification below includes the final corrected source and tests.

Unit/native tests, conformance vectors and traceability, mutation-sensitive tests,
JSDoc/native API documentation, root/package/tool READMEs, `/spec`, and the Agentic
scope note are synchronized. CoreDoc and AGENTS.md need no change: foundational
redaction obligations and architecture are unchanged. Release notes and tags
remain M9 work.

### Post-D8 combined verification — 2026-09-30

The complete `npm run verify` exited zero on the isolated candidate based on
`3a7b688abdcb51173d1efc648db9492fa81fc071`, with staged Git tree
`33af2eb447112e0f8f1e18bff5f3380cc007ba21`. This candidate includes
AUDIT-REDACTION-008, all 20 policy-ID vectors, native tests and nine paired probes.
Its tracked files remained unchanged throughout verification. Earlier scoped
results and the pre-D8 full result are not substituted for this run.

| Gate | Final observed result |
| --- | --- |
| Toolchains, builds and strict typing | Passed on Node 24.15.0, CPython 3.12/3.13, JDK 21 and Maven 3.9.x. |
| Unit/native, adapter and tool tests | Passed: 136 runner, 3,609 TypeScript core and 210 TypeScript adapter tests; 1,234 Python tests on each supported version; all Java, subprocess-adapter and 449 developer-tool tests. |
| Conformance | All 1,758 manifest vectors passed on TypeScript, CPython 3.12, CPython 3.13 and Java; zero failed, unsupported or infrastructure outcomes. |
| Coverage | All configured gates passed: runner 100% lines / 96.61% branches; TypeScript core 99.75% lines / 99.43% branches; Python 94% combined statement/branch coverage; Java 93.99% lines / 84.41% branches. |
| Installed consumers | All six passed: npm, Python wheel and sdist on both versions, and Java JAR. |
| Runner mutation | 97.21%; 628 killed, 18 reviewed diagnostic/wrapping survivors, zero uncovered, timed-out or ignored mutants. |
| TypeScript mutation | 96.34%; 4,307 killed, 154 reviewed survivors, 10 uncovered defensive branches, 14 execution-limit/nonterminating mutations, zero ignored mutants. Without timeout credit: 96.03%. |
| Critical/native probes | 267/267 critical, 165/165 native and 60/60 Python 3.13 native probes killed; independent controls passed. Raw infrastructure failures receive no kill credit. |
| Repository checks | Architecture, documentation links, traceability, licensing and whitespace passed. Traceability retains 434 requirements, 1,758 vectors and 350 covered requirements. |

The complete redaction mutation report reproduces every status from the scoped
run: 132 killed, three reviewed survivors and three uncovered defensive branches.
No policy-ID mutation survives. The full core's other non-killed families retain
the dispositions documented above: 77 diagnostic error-class survivors, nine
Money, fifteen Workflow, thirty-two Approvals, eleven Audit and ten Entity
survivors. The ten uncovered defensive paths and fourteen execution-limit/loop
mutations retain their recorded classifications and remain in the denominator;
no timeout is claimed as an assertion kill. No critical mutant survives.

The independent 90-case review described above passes on all four runtimes.
Its implementation/adapter sources match the verified candidate byte-for-byte.
Only documentation outcome/status edits follow the frozen tree; executable,
normative, dependency, vector and test files are unchanged. Documentation,
traceability, architecture, licensing and whitespace checks are repeated after
those edits. This is a finite review of the accepted contract, not exhaustive
proof or a decision about D9's native Entity values.

D8 is resolved, and M8 passes for the accepted contracts including D8 and D10.
D9 remains open. M9 release history, tag creation and Core 1.0 promotion have
not been performed.

## Milestone 9 — Documentation and local corrective release

- [x] Synchronize root/package READMEs, examples, public API docs, specification
      status, conformance conventions/traceability, applicable Agentic metadata,
      and the Core 1.0 prerequisite. Review AGENTS.md if development rules or
      architecture actually changed.
- [x] Summarize accepted compatibility corrections and supported native values.
      Distinguish implemented behavior, passing conformance, unsupported scope,
      and behavior not yet specified. Do not retain unqualified claims beyond
      the tested boundary.
- [x] Add a concise maintainer release summary to
      [the existing release history](../releases/README.md). Keep detailed test,
      coverage, mutation, and review results in this plan and normal development
      history, not in release notes or a new report system.
- [x] Review the final diff against the verified candidate. For documentation-only
      changes, rerun documentation/traceability, architecture/license checks,
      whitespace, and affected installed examples; otherwise return to M8's
      complete verification. Identify precisely which revision each result covers.
- [x] Follow the existing local release process for the final reviewed candidate
      and annotated `core-0.9.7` tag, preserving earlier tags. Planning alone does
      not authorize creating a release tag or publishing anything.
- [x] Retain Core `0.9-rc`, reference-package `0.1.0`, and conformance-syntax `0.1`
      unless an explicit compatible release decision requires otherwise. No remote
      push, registry publication, GitHub Actions, or Core 1.0 promotion is included.

Completion: documentation and the local corrective snapshot describe the exact
verified result. The separate 1.0 milestones remain uncompleted until executed.

## Dependencies and completion discipline

M1 resolves meaning; M2 establishes permanent failing examples and broader
discovery. M3–M7 implement the agreed corrections, with M4 and M5 coordinated
for Approval fact equality and retained native values. M8 verifies the combined
candidate and reopens owning milestones for newly discovered failures. M9
records the corrective release only after M8 passes.

Within each implementation milestone retain the sequence specification → stable
requirement → conformance/native regression → demonstrated failure → minimal
implementation → passing tests → mutation protection. Synchronize normative
corrections, affected implementations, vectors, APIs, Agentic metadata, and
documentation in the same corrective change under SPEC-FREEZE-002; milestone
staging is not permission to release an inconsistent intermediate state.

Each implementation milestone runs its affected builds, strict typing, unit and
adapter tests, coverage, conformance, and mutation checks before completion.
M8 additionally runs the full combined pipeline; domain-level results do not
replace that final gate.

Before marking a milestone complete, explicitly review unit tests, conformance
vectors, mutation-sensitive tests, JSDoc and native API docs, READMEs, `/spec`,
`/conformance`, `/agentic`, and AGENTS.md. Update affected artifacts and state
why others did not need changes. Keep tools under `docs/tools`, with their
required purpose/effects/non-financial-behavior header. Verification stays local.

## Release gate

Core 0.9.7 is complete only when:

- [x] Every F1–F7 subcase and additional confirmed mandatory gap has a resolved
      contract, permanent regression, passing valid control, and appropriate
      mutation protection.
- [x] Quorum evaluation requires explicit evidence and composition validation
      covers all declared groups without changing actionability or error priority.
- [x] Committed Approval history and bound Workflow definitions cannot change
      through retained caller values; successful operations return reusable state.
- [x] Approval fact selection, presence, relevance, and equality have documented
      portable meaning and compatible, tested native representations.
- [x] Valid Entity declarations survive observation/import/reuse, and reviewed
      malformed inputs fail through the correct domain with no partial effect.
- [x] All configured verification gates pass on the final applicable candidate,
      all critical probes are killed, and mutation survivors have been assessed.
- [x] Fresh review and the broader discovery inventory leave no unresolved
      mandatory defect, blocking contract decision, or unexplained discrepancy.
- [x] Documentation, traceability, installed artifacts, compatibility decisions,
      and the local release snapshot agree; earlier protections remain intact.

Completion permits reassessment under the Core 1.0 plan. It does not by itself
declare stable 1.0 or guarantee that unrelated work cannot expose further gaps.


### D9 implementation and verification — 2026-09-30–2026-10-01

Both recommendations were explicitly accepted. ENTITY-VALIDATION-011 records
the selected native profile and portable error categories. TypeScript, Python
and Java now copy Entity application data at the owning validation boundary.
Java delays traversal of imported/current data until identity and Workflow
validation finish. Proposed values are checked after existing mutability checks.
The generic declaration/Audit copiers are not changed by this correction.

Before implementation, the TypeScript regressions produced 115 failures out of
120 cases; Python produced 82 failing subtests across five methods; Java's ten
AtomicInteger/AtomicLong boundary cases all failed. After implementation, the
native boundary regressions pass, including exact Decimal/BigDecimal values,
shared acyclic children, cycles, numeric subclasses, special member names,
input/output ownership, evolution source/related observations and failure reuse.
Eight new manifest controls cover creation, import, mutation, transition and all
four evolution operations. The inventory is now 435 requirements, 351 covered,
and 1,766 vectors. Paired native mutation probes cover native profile rejection,
exactness, independent ownership, wrong errors and lost special member names.

The final isolated candidate is based on
`018337be5c5bb5dc349643e3e272db2662c478bf`, with staged tree
`f23de532892568efdd1a8d548c3177ee061a971d` in `/tmp/finkore-d9-final`.
Its complete `npm run verify` exited zero. Earlier interrupted runs do not
supply this result; the final run includes all permanent corrections and tests.

| Gate | Final D9 result |
| --- | --- |
| Build, strict typing and unit tests | Passed: runner 136; TypeScript core 3,730; TypeScript adapter 210; Python 1,239 on each version; developer tools 476. Java core and both subprocess adapter suites passed. |
| Conformance | All 1,766 vectors passed on TypeScript, Python 3.12/3.13 and Java, including all 779 Entity vectors; no failed, unsupported or infrastructure outcomes. |
| Coverage | All configured gates passed: runner 100% lines / 96.61% branches; TypeScript core 99.69% lines / 99.44% branches; Python 94% combined; Java 94.09% lines / 84.71% branches. |
| Installed consumers | All six passed: npm, Python wheel and sdist on both Python versions, and Java JAR. |
| Runner mutation | 97.21%; 628 killed, 18 reviewed survivors, no uncovered, timed-out or ignored mutants; every status matches D8. |
| TypeScript mutation | 96.34%; 4,350 killed, 154 reviewed survivors, 12 uncovered defensive mutations, 14 execution-limit/nonterminating mutations, no ignored mutants. Without timeout credit: 96.03%. |
| Critical/native probes | 267/267 critical, 192/192 native and 69/69 Python 3.13 native probes killed, with paired controls passing. All 459 mutation anchor checks pass. |
| Repository checks | Architecture, documentation links, traceability, licensing and whitespace passed. |

Mutation review found that rejecting custom-prototype application data early
made an older own-member predicate regression ineffective. Two guard mutations
then survived. A new permanent plain-object case supplies inherited Money facts
through Object.prototype, verifies rejection and an own-member valid control,
and restores the prototype afterward. The existing native declaration probe
now targets that case with its original ID and control; a duplicate added probe
was removed. Both mutants now fail that case with
passing scalar controls, including in the complete rerun. No D9 value-profile
mutation survives. The only newly uncovered mutations are the old generic
structured-clone catch and its diagnostic string, now bypassed by native-value
rejection. They do not define supported application-data behavior and remain
in the score denominator. Earlier non-killed families retain their reviewed
classifications; no timeout or raw host exception is claimed as an assertion kill.

The separate finite review exercised 128 additional JSON value combinations
through eight boundaries on each runtime, plus 35 native magnitude, exact-decimal,
signed-zero, non-finite and unsupported-number-conversion observations. It also
caught the initial TypeScript create ordering regression: invalid identity must
retain priority over newly rejected native values. A permanent combined-error
case failed before the ordering fix and passes afterward. These results exercise
the chosen contract; they are not exhaustive proof. The review separately
reproduced D11 on all four runtimes, without adopting an expected output shape.

Completion review updated unit/native tests, conformance vectors, mutation
probes, API comments, READMEs, `/spec`, `/conformance`, and `/agentic`. CoreDoc,
AGENTS.md and architectural rules need no changes: foundation obligations and
dependency directions are unchanged. Runner and adapter financial behavior is
unchanged. Final refreshes are documentation/API comments and informational
`guardsAgainst` metadata only; executable logic, normative requirements, test
inputs/expectations and operation IDs match the verified candidate. Final
repository/documentation checks passed again.

**D9 is complete.** At that snapshot D11 remained a separate unselected contract; M9 release history
and local tag creation remain unrequested and unperformed. Earlier D9-open
statements in milestone evidence describe those earlier snapshots.

### D11 — Empty import-history result shape: resolved

D9's adjacent-boundary review found a separate result-shape difference. For a
valid `entity.import` with `historicalRevisions` omitted or an empty list,
TypeScript returns `historicalRevisions: []`; Python and Java omit that output
member. ENTITY-IMPORT-006 preserves supplied revisions but does not explicitly
select an empty output representation; the bounded fixture convention also
leaves it unspecified. No financial facts differ, but exact normalized results
cannot agree without a selected output contract. This is outside D9's native
value profile and is not silently repaired in a core or adapter.

Recommendation for a separate decision: normalize successful import observations
to include `historicalRevisions: []` when supplied history is omitted or empty. Preserve
nonempty revision observations, existing errors, input presence on failure and
all error priorities. This recommendation was not part of D9; the maintainer explicitly accepted it
on 2026-10-01 by requesting D11 execution.
D9's portable import control supplies a real historical revision and tests its
preservation; it makes no expectation for the unselected empty-result shape.
ENTITY-IMPORT-012 now selects this result shape. D11 verification passes as
recorded below; final combined release verification and M9 remain pending.

### D11 implementation and verification — 2026-10-01

The accepted contract is ENTITY-IMPORT-012. Python and Java now always add the
validated historical-revision list after all import validation succeeds.
TypeScript already implements this result shape. No adapter or runner logic
changes, new portable errors, or canonical operation IDs are introduced.

Before the fix, Python failed four empty-history matrix assertions and Java
failed its empty-history case; nonempty and failure controls passed. TypeScript
passed all three new direct-core cases. Nine new portable vectors cover omitted
and empty history both with and without mapping/current-revision/conflict
metadata, nonempty preservation, null/object rejection and failed expectations.
Native tests additionally reuse actual returned results and verify independent
input/output observations. Existing Python/Java exact-output tests are updated
to the newly selected contract.

The investigation classifier no longer treats absent successful history as P3.
It reports a D11 defect traceable to ENTITY-IMPORT-012; historical P3 counts above
retain their original review scope. Paired mutation probes restore the former
omission and erase supplied history on each runtime. All six probes are killed
with passing paired controls; the two Python probes also pass on Python 3.13.

D11 verification passed:

- Build and strict TypeScript; runner 136 tests, TypeScript core 3,733 tests,
  TypeScript adapter 210 tests; Python 1,242 tests on each supported version;
  Java core and both subprocess adapters, including Python 3.13.
- All 1,775 manifest vectors on TypeScript, Python 3.12/3.13 and Java, including
  788 Entity vectors; zero failures, unsupported or infrastructure outcomes.
- TypeScript core coverage 99.69% lines / 99.44% branches, Python combined
  coverage 94%, and the Java coverage gates.
- All 88 existing critical Entity probes with paired controls, all six D11
  native probes and both Python 3.13 D11 probes. No D11 mutant survives.
- All six installed consumers (npm, wheel/sdist on both Python versions, Java
  JAR), 483 developer-tool tests, 465 mutation anchors, architecture, documentation,
  traceability, licensing and whitespace checks.

The initial combined check reached documentation validation with the new vector
file not yet registered; registration and the requirement index were corrected
and the documentation checks then passed. The first TypeScript mutation
baseline used a fixture path unavailable in temporary copies; self-contained
native cases fixed the harness, after which both mutations were killed by exact
assertions. These setup failures are not counted as mutation kills.

This is scoped D11 verification, not a new complete `npm run verify` result or
a refreshed repository-wide Stryker score. TypeScript executable behavior and
the runner are unchanged. Final combined release verification still precedes
Milestone 9 release history/tag creation; neither release action is performed.

Completion review updated the specification, vectors, native/unit and mutation
tests, public API comments, README compatibility notes, conformance conventions,
traceability and Agentic documentation. CoreDoc and AGENTS.md need no changes:
foundation rules, architecture, portable error identities and operation IDs are
unchanged. **D11 is complete.**

### Milestone 9 completion and final verification — 2026-10-01

The maintainer explicitly requested Milestone 9 execution, including its local
release process. The final clean code candidate is commit
`d394ec86855c9839367d48e2daa070c8d0ce6f35`, checked out independently at
`/tmp/finkore097-release`. After `npm ci`, its complete `npm run verify` exited
zero. Tracked candidate files remained unchanged. This is the final combined
result including D8–D11, not the earlier D11-only subset or preliminary run.

| Gate | Final observed result |
| --- | --- |
| Toolchain, build, strict typing, unit and adapters | Passed: runner 136; TypeScript core 3,733; TypeScript adapter 210; Python 1,242 on each supported version; all Java and subprocess-adapter tests; 483 developer-tool tests. |
| Conformance | All 1,775 vectors pass on TypeScript, Python 3.12/3.13 and Java, including 788 Entity vectors; no failures, unsupported or infrastructure outcomes. |
| Coverage | All configured gates pass: runner 100% lines / 96.61% branches; TypeScript core 99.69% lines / 99.44% branches; Python 94% combined; Java 94.14% lines / 84.75% branches. |
| Installed consumers | All six pass: npm, wheel/sdist on both Python versions, and Java JAR. The six checks pass again with the final packaged READMEs. |
| Runner mutation | 97.21%; 628 killed, 18 reviewed survivors, 0 uncovered, 0 timeouts and 0 ignored. |
| TypeScript mutation | 96.34%; 4,350 killed, 154 reviewed survivors, 12 uncovered, 14 timeouts and 0 ignored. Without timeout credit: 96.03%. |
| Critical/native probes | 267/267 critical, 198/198 native and 71/71 Python 3.13 native probes killed, with passing paired controls; all 465 mutation anchors pass. |
| Repository consistency | Documentation, traceability, architecture, licensing and whitespace pass. Inventory: 436 requirements, 352 covered, one partial, 83 not directly testable. |

The final mutation reports were inspected against the recorded D9 dispositions
and current source/call sites. The D9 counts and survivor families recur: 77
error-class diagnostics, nine Money, fifteen Workflow, thirty-two Approval,
eleven Audit and ten Entity mutants. No portable error-code mutation survives.
No critical mutant survives. Diagnostic/error
message mutations and equivalent/delegated validation paths remain counted;
uncovered defensive paths remain in the denominator. Execution-limit/loop
mutations are not represented as assertion kills. The core score exceeds 95%
without timeout credit. The previously recorded independent review and permanent
regressions remain applicable; D11 adds successful empty-history normalization
after validation, with exact native/vector, failure-preservation, reuse and
paired mutation controls. This finite review is not exhaustive proof.

Current root/package READMEs, specification/conformance status, traceability,
release history, developer-tool guidance and the Core 1.0 prerequisite are
synchronized. Historical milestone results remain scoped to their original
candidates. The documented external-fact authoring limit in WORKFLOW-GUARD-004
remains partial; two previously classified cross-error orderings retain their
unspecified total priority. Neither is silently assigned new financial semantics.

The release diff contains documentation only. Every executable, dependency,
configuration, normative requirement, vector and test matches the verified
candidate. The specification-index edits change non-normative release status
only. Final documentation/traceability, architecture, licensing and whitespace
checks pass again, and installed consumer checks pass with the final README
content. The local process commits that reviewed documentation and places an
annotated `core-0.9.7` tag on the exact release commit, preserving earlier tags.

Completion review covered unit/native/conformance/mutation tests, installed
examples, TypeScript JSDoc, Python/Java API docs, `/spec`, `/conformance`,
`/agentic`, CoreDoc and AGENTS.md. Existing APIs, examples, tests and operation
metadata already describe the accepted contracts; this milestone adds no
behavior, requirement, error, public API, operation ID or dependency. CoreDoc
version fields and AGENTS.md remain current. No Core 1.0 promotion, remote push,
registry publication or GitHub Actions are included.
