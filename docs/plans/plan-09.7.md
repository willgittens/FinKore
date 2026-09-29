# FinKore Core 0.9.7 Plan

## Status

Milestones 2–5 are complete for their accepted contracts. Milestones 6–9
remain uncompleted. D1–D7 were explicitly accepted on 2026-09-27. M1 remains
open for D8 (explicitly left unresolved) and D9 (the Entity native-value policy
gap discovered during M5). No Entity numeric policy has been selected.
Implementation scope and release verification remain open.
Release type: corrective release candidate. Core 1.0 promotion is blocked pending this work and the separate
[Core 1.0 promotion gates](plan-10.md).

The completed [0.9.6 release](plan-09.6.md), commit
`4041ec2838d4cbcf9333b8c6c651affe9ee10500` and local tag `core-0.9.6`, remains
the latest corrective snapshot. Its recorded corrections remain valid historical
work. Subsequent review reproduced additional failures outside the exercised
boundaries of its tests. Preserve all earlier corrective regressions and tags.

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

The complete fixture optionality, value profiles, selector syntax, and success
envelopes are in [conformance conventions](../../conformance/conventions.md#core-097-accepted-correction-fixtures).
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

### Discovery decisions (D6–D7 accepted; D8 unresolved)

The reconstructed baseline exactly reproduces 3,861 cases and 478 status/code
differences or exceptions. Comparing complete results adds 186 leads, including
optional observation differences that are not automatically defects. Investigation
also exposes the following representation gaps; no expected result is selected
by implementation majority voting.

| Decision | Accepted correction or explicitly unresolved gap | Compatibility and owner |
| --- | --- | --- |
| D6 — Required fixture collections and optional Actor type | Require explicit `terminalStates` and `transitions` arrays in the bounded Workflow definition, and explicit array/envelope `history` or `decisions` at Approval fixture operations that consume them; explicit null or an envelope without its required history array is malformed. Empty arrays remain valid. Document native convenience constructors/defaults separately. Approval Actor `type` stays optional, but when supplied is a nonempty string. | Resolves omitted-list and malformed Actor type differences without requiring a production serialization. Workflow failures use INVALID_DEFINITION; Approval failures use INVALID_DECISION. M4 handles Approval; M5 handles Workflow declaration boundaries. |
| D7 — Entity representation | Require the bounded Entity definition's explicit nonempty `identityScope` and object-valued Entity `data`; absent/null/non-object data uses ENTITY_VALIDATION_FAILED. For an existing Entity, malformed/missing current State uses WORKFLOW_INVALID_INSTANCE and an undeclared nonempty State uses WORKFLOW_INVALID_STATE, preserving Workflow error priority. An empty mutation change object uses ENTITY_INVALID_MUTATION. | Adds explicit representation/error rules rather than treating an implementation as the oracle. Native composing-domain APIs need no universal data schema. M7 owns shape/error correction and M6 own-member preservation. |
| D8 — Redaction policy identity | Do not select requiredness or malformed-value handling for `policy.id`; authority and protected targets retain their existing requirements. Classify its malformed/omitted fixture differences as a contract gap, with no new normative regression until that optional fixture member is separately settled. | The earlier 0.9.6 scope explicitly added no independent policy-ID obligation. This gap does not authorize a new authorization model or invented ID requirement. |

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

[explore-boundaries.js](../tools/explore-boundaries.js) reconstructs the original
matrix on the old manifest: 3,861 cases across 33 operations, exactly 478
status/code differences or exceptions. Comparing complete normalized results
finds 664 leads in total. The expanded matrix adds 5,980 cases across the same
operations, selecting last-success and first-error seeds, depth-six paths,
first/last array positions, and at most 24 deterministic paths per seed. It
finds 1,001 complete-result leads, including 494 status/code/exception leads.
Both runs execute TypeScript, CPython 3.12, CPython 3.13, and Java with independent
JSON-round-tripped requests, preserved explicit context, and input snapshots.
No input mutation was observed. This finite sample is not exhaustive.

[classify-boundaries.js](../tools/classify-boundaries.js) accounts for every
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
these overlays; instructions are in [developer tools](../tools/README.md#core-097-discovery-and-red-regressions).
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

### D9 — Entity application-data native numbers: unresolved

The M5 adjacent-path review reproduced a Java Entity data alias: create an
Entity with a nested `AtomicInteger(1)` as `memo`, change the original number
to 999, and observe the returned Entity data change from 1 to 999 without an
Entity mutation. Entity declaration ownership is already specified, but the
accepted APPROVAL-FACT-004 / WORKFLOW-GUARD-007 native numeric profile expressly
does not define arbitrary Entity application data. The allowed native number
set and error category for create/import/current data versus proposed mutations
remain unspecified at that boundary.

A clarification was requested to extend the immutable-number profile with
ENTITY_VALIDATION_FAILED for create/import/current data and
ENTITY_INVALID_MUTATION for proposed changes, preserving existing priority.
No answer has selected that extension. No normative expectation, broad copier
change, or native rejection policy is invented here. D9 remains open for M1
resolution and prevents a claim of complete Entity ownership closure.

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

- [ ] Fix F5 using own-member-safe retention and observation of valid declaration
      names. Do not reject `__proto__` merely to avoid the implementation defect.
- [ ] Exercise create/import → definition observation → serialization/import →
      permitted mutation, prohibited mutation, and transition, using actual
      returned definitions and Entity observations.
- [ ] Check adjacent keyed declarations in Entity, Workflow, Approval, and Audit
      boundaries for own-member loss or inherited-member acceptance. Preserve
      earlier Audit prototype-key regressions.
- [ ] Assert exact keys and values, field mutability, binding/revision retention,
      failure atomicity, and unchanged prototypes for ordinary and special names.
- [ ] Add mutation protection for unsafe assignment, dropped declarations, and
      inherited-member lookup. Exercise the regression in the installed npm
      consumer and update affected public documentation.

Completion: a valid Entity definition remains semantically identical through
observation and reuse, including valid special member names, without runtime
exceptions or accidental changes to permitted mutations.

## Milestone 7 — Portable malformed-input failures and adapter observations

- [ ] Close F8b/F8c and F9a–F9c from M2: Workflow instance/target error
      preservation; Entity scope/data/State/empty-change/evolution request
      validation; TypeScript null-facts adapter failure; Python Audit relationship
      type exceptions; and validation of existing Entity data before mutation.
      Keep each primary error and non-mutation obligation under its owning spec.


- [ ] Fix F6b in the Python core and review adjacent mutability containers and
      list entries at create/import, mutation, transition, and evolution boundaries
      where those declarations are consumed.
- [ ] Fix F6c so Python failure-observation construction cannot replace the
      original core error. Validate financial input in the core; adapters only
      observe safely and preserve the established result.
- [ ] Exercise all four Entity evolution kinds with omitted, null, wrong-type,
      malformed, and valid Audit histories under the settled contracts. Include
      malformed nested events and primary Audit failures combined with evolution
      correspondence failures, following existing priority.
- [ ] Review equivalent adapter error/observation paths across domains and
      languages. Assert exact codes and unchanged inputs; unexpected runtime
      defects remain infrastructure failures, not blanket domain-error mappings.
- [ ] Confirm legitimate omission, empty histories, empty permitted-field sets,
      and valid controls remain supported where specified.
- [ ] Add paired critical/native probes and synchronize vectors, adapter tests,
      public documentation, and traceability for the corrected boundaries.

Completion: reviewed malformed inputs produce the governing portable failure
without fabricated observations, partial effects, or secondary adapter crashes.

## Milestone 8 — Full verification and independent readiness review

- [ ] Run the complete `npm run verify` on the combined candidate, including
      toolchain checks, builds, strict typing, all unit/native/adapter/tool tests,
      Python 3.13 compatibility, conformance, coverage, installed consumers,
      both full configured mutation suites, critical/native probes, architecture,
      documentation/traceability, licensing, and whitespace.
- [ ] Preserve mutation thresholds of at least 95% and meaningful mutation scope.
      Inspect surviving, uncovered, ignored, and timed-out mutants for critical
      behavior, not only aggregate percentages. Investigate timeout credit and
      justify equivalent exclusions explicitly; no critical mutant may survive.
- [ ] Require every manifest vector to pass on TypeScript, Python 3.12/3.13,
      and Java, with no unsupported or infrastructure outcomes for claimed scope.
      Compare normalized success values and specified observations as well as
      portable codes; native guarantees need their own tests.
- [ ] Perform a fresh specification-led review after the fixes. Start from public
      operations and their invariants rather than merely rerunning the new
      examples: all declared evidence, proposed-result validity, ownership,
      optionality, exact values, failure priority, and later reuse.
- [ ] Exercise a deterministic set of additional seeds, graph arrangements,
      malformed nested values, aliases, and operation sequences beyond M2's
      regressions. Recheck cross-language agreement against `/spec`, including
      cases where every implementation agrees on an invalid result.
- [ ] Add each new confirmed mandatory gap to the appropriate milestone, retain
      its failing regression and valid control, and fix it before closure. A new
      financial ambiguity reopens M1; a green existing suite does not close it.
- [ ] Run complete clean-candidate verification again after any executable,
      normative, fixture, dependency, or test change from the review. Record the
      exact candidate and actual results in this plan; distinguish earlier runs
      from the final result. Use isolated checkouts, not concurrent builds or
      mutation runs sharing generated class directories.
- [ ] Reconcile every finding, newly discovered subcase, and affected traceability
      row with permanent tests and mutation protection. No unexplained mandatory
      gap or unreconciled exploratory failure family may be marked complete.

Completion: the exact combined candidate passes the full gates and fresh review.
Report remaining coverage limits honestly. Finite tests and review support a
bounded readiness assessment; they do not prove that all possible defects have
been discovered.

## Milestone 9 — Documentation and local corrective release

- [ ] Synchronize root/package READMEs, examples, public API docs, specification
      status, conformance conventions/traceability, applicable Agentic metadata,
      and the Core 1.0 prerequisite. Review AGENTS.md if development rules or
      architecture actually changed.
- [ ] Summarize accepted compatibility corrections and supported native values.
      Distinguish implemented behavior, passing conformance, unsupported scope,
      and behavior not yet specified. Do not retain unqualified claims beyond
      the tested boundary.
- [ ] Add a concise maintainer release summary to
      [the existing release history](../releases/README.md). Keep detailed test,
      coverage, mutation, and review results in this plan and normal development
      history, not in release notes or a new report system.
- [ ] Review the final diff against the verified candidate. For documentation-only
      changes, rerun documentation/traceability, architecture/license checks,
      whitespace, and affected installed examples; otherwise return to M8's
      complete verification. Identify precisely which revision each result covers.
- [ ] Follow the existing local release process for the final reviewed candidate
      and annotated `core-0.9.7` tag, preserving earlier tags. Planning alone does
      not authorize creating a release tag or publishing anything.
- [ ] Retain Core `0.9-rc`, reference-package `0.1.0`, and conformance-syntax `0.1`
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

- [ ] Every F1–F7 subcase and additional confirmed mandatory gap has a resolved
      contract, permanent regression, passing valid control, and appropriate
      mutation protection.
- [ ] Quorum evaluation requires explicit evidence and composition validation
      covers all declared groups without changing actionability or error priority.
- [ ] Committed Approval history and bound Workflow definitions cannot change
      through retained caller values; successful operations return reusable state.
- [ ] Approval fact selection, presence, relevance, and equality have documented
      portable meaning and compatible, tested native representations.
- [ ] Valid Entity declarations survive observation/import/reuse, and reviewed
      malformed inputs fail through the correct domain with no partial effect.
- [ ] All configured verification gates pass on the final applicable candidate,
      all critical probes are killed, and mutation survivors have been assessed.
- [ ] Fresh review and the broader discovery inventory leave no unresolved
      mandatory defect, blocking contract decision, or unexplained discrepancy.
- [ ] Documentation, traceability, installed artifacts, compatibility decisions,
      and the local release snapshot agree; earlier protections remain intact.

Completion permits reassessment under the Core 1.0 plan. It does not by itself
declare stable 1.0 or guarantee that unrelated work cannot expose further gaps.
