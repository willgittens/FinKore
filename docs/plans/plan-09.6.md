# FinKore Core 0.9.6 Plan

## Status

Planned. Milestones 1–9 are unstarted. The readiness review of commit `e300bb1`
(`core-0.9.5`) found additional mandatory behavior and portability gaps despite
passing existing checks. Core 1.0 promotion is blocked pending this corrective
work and a fresh review of the resulting candidate.

The completed [0.9.5 plan](plan-09.5.md) remains the record of its corrections
and verified release snapshot. Its completion does not establish coverage of
the additional boundaries below. Preserve all earlier release protections.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) establishes
foundation obligations; `/spec` defines financial behavior. Any normative
correction must follow `SPEC-FREEZE-001` through `SPEC-FREEZE-004` and the
compatibility rules in [Specification Conventions](../../spec/conventions.md).
Recommendations below are proposals for Milestone 1, not accepted changes to
financial semantics. Planning does not implement fixes, create a release tag,
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

- [ ] Read the owning Money, Workflow, Approval, Audit, and Entity specifications,
      their error catalogs, CoreDoc obligations, conformance conventions and
      traceability, and applicable Agentic descriptors.
- [ ] Classify every finding as implementation violation, adapter defect,
      documentation mismatch, or specification gap. Establish the expected
      result, portable error, and applicable priority before writing expectations.
- [ ] Resolve the decisions below in their owning documents. Record outcomes
      and compatibility assessments here; do not let this plan or a fixture
      become a second specification. Surface unresolved financial semantics
      before implementing dependent behavior.
- [ ] Preserve requirement, error, operation, and vector identifiers. Apply the
      compatibility policy to changed API validation, fixture requiredness,
      operation meaning, and primary error selection. Do not label observable
      normative changes as editorial or silently redefine an existing identifier.
- [ ] Reassess affected traceability claims by public entry point and boundary.
      Mark PARTIAL, UNCOVERED, or BLOCKING SPEC GAP where warranted; existing
      mapped vectors do not prove native or sequence coverage.
- [ ] Preserve the distinction between concrete Approval Requirements/Decisions
      and lightweight composition observations. Do not require concrete subject
      facts on a composition observation or invent a universal fact schema.

### Decisions and recommended directions

| Decision | Recommended direction | Limit to resolve explicitly |
| --- | --- | --- |
| Native constructor validation | Keep public construction supported and validate before exposing an invalid domain value or instance. Reuse core validation with portable parsing. | Preserve valid Decimal values, constructor signatures where practical, exactness, and owned declarations. Do not route valid native Decimal values through a parser that only accepts portable plain strings. |
| Decision evaluation meaning | Give `approval.decision.evaluate` one concrete, bounded meaning across runtimes: validate the supplied Requirement association/eligibility and Decision, evaluate relevant facts, and honor expiration with explicit context. | Review this proposal against the existing facts-only fixture description and native APIs. A facts-only helper may remain explicitly documented as such. Do not imply lifecycle-aware evaluation without supplied lifecycle evidence, add a canonical operation ID, or silently change a fixture contract. |
| Complete evaluation validation | Validate required evidence/context before returning a decisive result. Reordering equivalent Decision inputs must not hide missing required context. | Specify which Decisions are currently considered, including unrelated, withdrawn, superseded, and stale evidence; do not impose evaluation-time requirements on excluded evidence without a governing rule. Preserve defined error priority without inventing a total order for unrelated concrete Approval failures. |
| Imported lifecycle evidence | Validate committed discriminators, field structure, and resolvable relationships before record, lifecycle mutation, or evaluation reuses history. | Distinguish a request's redundant `type` member from committed history's meaningful discriminator. Review self-reference, ambiguity, duplicate events, and successor checks against the specification before choosing results. No new authorization or lifecycle kinds. |
| Required timestamps | Use the existing portable timestamp parser for required evaluation instants, including calendar, offset, and fractional precision checks. | Preserve original valid lexical values and nanosecond semantics. Do not require an instant where the contract does not require one or introduce a clock default. |
| Redaction policy authority | Reject absent, null, empty, or malformed authority declarations with the existing redaction error. | Validate the declared authority representation; do not implement RBAC, authenticate an authority, or invent policy lookup. Resolve any other policy-field requirements separately. |
| Source Identity presence | Reject supplied malformed Source Identity even when otherwise valid mapping evidence exists. | Resolve omitted Source Identity with standalone complete mapping separately from explicit null; do not assume TypeScript's pair-required representation is normative. Preserve opaque identity values. |
| Malformed native values and errors | Validate types before enum membership, iteration, casting, or equality; use the owning domain's existing error. | Define supported native types and omission sentinels where necessary. Do not coerce malformed input, catch every runtime defect as a domain error, or copy one runtime's accidental priority. |

Completion: every finding has an agreed owning contract and test boundary, with
no unresolved semantic decision blocking its implementation milestone.

## Milestone 2 — Permanent regressions and boundary inventory

- [ ] Inventory supported public constructors, parsers/importers, serializers,
      operations, and history reuse paths across all three implementations.
      Map findings to native tests, portable vectors, adapter tests, and targeted
      mutation probes as appropriate. Keep mappings in this plan and existing
      traceability/test artifacts rather than a new audit-report system.
- [ ] Reproduce every finding and lettered subcase with a failing permanent
      regression against the defective candidate and an independently passing
      valid control. Assert exact portable codes and observable outcomes.
- [ ] Add specification-derived JSON vectors to manifest-listed files where
      behavior is portable. Use native tests for Decimal construction, Java
      records, ownership, unsupported native values, and public overloads.
- [ ] Apply the matrix below to relevant entry points, including boundaries
      adjacent to each finding. Use deterministic representative cases and
      meaningful combinations, not an indiscriminate Cartesian product.
- [ ] Compare equivalent portable inputs after a JSON round trip. Classify
      differences against `/spec`, including agreement on incorrect behavior;
      no implementation is the expected-result oracle. Treat native sparse
      arrays and unsupported objects separately from JSON fixtures.
- [ ] Add sequence tests that pass actual returned values through record,
      lifecycle changes, evaluation, observation/import, and subsequent calls.
      On failure assert unchanged source values, bindings, Decisions, lifecycle
      history, evolution relations, and Audit history where applicable.
- [ ] Review adjacent discrepancies for a governing requirement before fixing
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

## Milestone 3 — Money native validity and portable rejection

- [ ] Validate Python native Money amount and currency before an invalid Money
      value can escape. Cover quiet/signaling NaN, both infinities, empty/invalid
      currency, and unsupported native amount types under the agreed API contract.
- [ ] Preserve valid finite Decimal construction, including exponent forms,
      signed zero, negative values, trailing zeros, and retained presentation
      scales. Construction and subsequent arithmetic/serialization must preserve
      exact value independently of the caller's Decimal context.
- [ ] Correct Rate type validation so `kind: {}` and analogous unsupported
      scalar/container forms produce the Money portable error instead of a
      Python hashing exception. Review neighboring rounding and allocation
      enum/container boundaries without adding limits or rounding defaults.
- [ ] Retain 0.9.5 exact serialization, invalid-scale, loss-rejection, and explicit
      round-then-serialize regressions; constructor validation must not weaken them.
- [ ] Run focused native/unit, Money conformance, coverage, and mutation checks
      on affected implementations, including Python 3.13. Update public API docs
      and package consumer cases for the direct constructor boundary.

Completion: findings 2 and 9a fail portably, valid native values remain usable,
and invalid construction cannot later emit invalid portable Money.

## Milestone 4 — Workflow construction and validation precedence

- [ ] Enforce definition validity for direct Python/Java construction as well
      as portable parsing. Cover unique declared States, a declared initial
      State, valid terminal declarations, Transition endpoints, guards, and
      version identity structure under existing requirements.
- [ ] Exercise valid and invalid native definitions through create, import,
      and transition; no public path may create an undeclared current State.
      Review native instance/Transition constructors for the same bypass family.
- [ ] Correct TypeScript import/transition validation so malformed revision or
      instance structure precedes version mismatch under `WORKFLOW-ERROR-007`.
      Pair each combined-failure case with valid-structure mismatch controls.
- [ ] Cover the specified failure hierarchy, including malformed observed
      revision versus malformed expected revision. Preserve their distinct
      invalid-instance/state-conflict meanings and omission/null handling.
- [ ] Preserve owned definitions/guards/bindings and versioned Entity sequences
      from 0.9.5. Reuse validation without deriving historical binding from the
      current definition or introducing Workflow migration.
- [ ] Run affected native/unit, Workflow and Entity integration conformance,
      coverage, and mutation checks. Update public constructor and error docs.

Completion: findings 3 and 10a are corrected across direct and portable APIs,
with correct primary errors and unchanged instances on failure.

## Milestone 5 — Approval evidence, history, and evaluation

- [ ] Reject missing required member State instead of inferring `PENDING`.
      Test ALL_OF, ANY_OF, quorum-related boundaries, nested alternatives, and
      later stages, including otherwise decisive approval/rejection results.
      Explicit valid `PENDING` and empty valid effective-vote sets remain valid.
- [ ] Validate required evaluation timestamps with the shared portable profile.
      Cover absent/null/empty/wrong types, invalid dates/offsets, excessive
      fractional precision, and valid offset/nanosecond boundary controls.
- [ ] Implement the Milestone 1 Decision evaluation contract consistently in
      cores and adapters. Test concrete subject/eligibility/association, changed
      facts, missing or malformed expiration context, and exact expiration.
      Preserve separately documented fact-comparison helpers as agreed.
- [ ] Validate imported lifecycle discriminators, shape, references, and agreed
      duplicate/supersession constraints before reuse. Cover record, withdraw,
      supersede, history reconstruction, and evaluation. Do not drop invalid
      entries or lose valid lifecycle evidence during normalization.
- [ ] Remove outcome-dependent skipping of required context checks. Exercise
      rejection before/after a considered expiring Decision, both without and
      with valid context; test excluded evidence according to the agreed scope.
- [ ] Correct missing/null/malformed chain and composition values before set
      membership, casting, or iteration. Include Java missing State/null
      applicability and Python unhashable enum/container cases. Keep portable
      error priority stable across member and stage order.
- [ ] Test actual record → withdraw/supersede → record → evaluate sequences,
      valid imported histories, multiple Requirements, and failure preservation
      of both Decision and lifecycle histories in every runtime.
- [ ] Run focused unit/native/adapter tests, Approval conformance, coverage,
      and mutation checks; update API docs, fixture conventions, traceability,
      package examples, and Agentic metadata only where applicable. Do not
      promote conformance-local Approval operations to canonical IDs.

Completion: findings 1, 5, 6a/6b, 7a/7b, 8, and 9b are resolved. Incomplete
required evidence cannot produce a successful outcome, and complete valid
evidence produces the agreed result consistently across runtimes.

## Milestone 6 — Audit redaction policy validation

- [ ] Validate Python redaction authority before producing a redacted view or
      appending evidence. Apply the agreed portable redaction error to missing,
      null, empty, and malformed declarations.
- [ ] Pair invalid policy cases with valid actor-context and ordinary Change
      redactions. Preserve event identity, Actor attribution, relationships,
      timestamps, redacted-versus-absent distinctions, and evidence Events.
- [ ] Assert unchanged committed source history and candidate evidence on
      failure; verify returned observations cannot mutate retained content.
      Preserve native numeric ownership and cycle rejection from 0.9.5.
- [ ] Run Audit native/unit tests, portable conformance, coverage, and mutation
      checks, including Python 3.13. Update policy API docs and relevant examples.

Completion: finding 4 is corrected without adding authorization infrastructure
or changing the meaning of valid policy-authorized redaction.

## Milestone 7 — Entity evolution and import presence

- [ ] Replace Java null-sensitive evolution precondition checks with explicit
      presence-aware validation. Cover expected source State and Revision
      omission, null, malformed, matching, and mismatching values across
      Correction, Reversal, Void, and Supersession. Review currentness under
      its own Boolean/error contract rather than assigning it a string rule.
- [ ] Return `FINKORE_ENTITY_STATE_CONFLICT` for the reviewed State/Revision
      mismatches. Failure must preserve source/related Entities, relation
      history, and Audit history, with no partial result or appended evidence.
- [ ] Reject explicit null and other malformed Source Identity in Python/Java
      imports even when mapping exists. Cover source/mapping presence pairs,
      incomplete fields, source mismatches, and mapped Entity mismatches.
      Retain the separately agreed valid omission/mapping-only behavior.
- [ ] Preserve opaque mapping values, stable identity, current/historical
      revisions, conflict tokens, and versioned Workflow bindings. Retain 0.9.5
      import-precondition and validator-declaration protections.
- [ ] Exercise returned Entity import/evolution observations in later valid
      operations, including versioned Workflows. Confirm adapters expose core
      errors without repairing observations or crashing while normalizing them.
- [ ] Run Entity native/unit/adapter and cross-domain conformance tests,
      coverage, and mutation checks; update public docs and affected examples.

Completion: findings 9c and 10b fail atomically with portable errors, while
valid import and evolution sequences remain usable across runtimes.

## Milestone 8 — Mutation protection, full verification, and fresh review

- [ ] Wire all regressions and boundary controls into repeatable repository
      verification. Extend existing portable critical and native mutation tools
      for every corrected failure mechanism, including each lettered subcase.
- [ ] Require passing unmodified baselines and named behavioral regression
      failures for targeted mutants, with independent valid controls passing.
      Reject crashes, timeouts, compilation failures, skipped/missing/empty
      results, and unrelated failures as proof of a targeted mutant kill.
- [ ] Run full runner and TypeScript core mutation suites with the unchanged
      minimum 95 percent gate; review every survivor and uncovered mutant.
      No critical financial mutant may survive. Report timeouts separately;
      do not hide meaningful logic with exclusions or weaken tests for scores.
- [ ] Run all Python/Java critical and native probes, including the Python 3.13
      native gate. Do not describe selected probes as full mutation coverage
      of those implementations.
- [ ] Run strict builds, native/unit/adapter tests, configured coverage gates,
      and every manifest vector on TypeScript, Python 3.12, Python 3.13, and
      Java. Require zero failed, unsupported, or infrastructure vector outcomes.
- [ ] Extend installed npm, Python wheel/sdist on both runtimes, and Java JAR
      consumer checks with corrected native constructors and relevant evaluation,
      redaction, and reuse paths. Import-only checks do not cover these defects.
- [ ] Run toolchain, architecture, documentation/traceability, license,
      developer-tool, and whitespace checks. Follow executable tool header
      conventions under `docs/tools`; verification remains local, with no
      GitHub Actions or new closure/provenance report system.
- [ ] From a clean candidate checkout, install locked dependencies with
      `npm ci` and run the complete `npm run verify` using Node 24, CPython
      3.12/3.13, JDK 21, and Maven 3.9.x. Review dependency audit results
      separately from financial conformance and preserve the verified locks.
- [ ] Perform a fresh contract-driven review after the fixes, beyond replaying
      this finding list. Revisit the Milestone 2 inventory, native versus
      portable validation, presence/type families, shared incorrect behavior,
      error priority, ownership, and actual cross-domain sequences. Turn any
      new confirmed mandatory gap into a failing regression before closure.
- [ ] Reassess traceability against the actual evidence. Finite passing tests
      support the exercised scope; they do not prove exhaustive correctness.
      Close neither a blocking specification gap nor an untested mandatory
      boundary by pointing to an aggregate coverage or mutation percentage.

Completion: the combined candidate passes complete verification and a fresh
review, with no unresolved demonstrated blocker or surviving critical mutant.

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

- [ ] Every numbered finding and lettered subcase has an agreed contract,
      permanent regression, valid control, and appropriate mutation protection.
- [ ] Native Money and Workflow construction cannot expose the reviewed invalid
      domain values, while valid native and portable paths preserve exact semantics.
- [ ] Approval evaluation has one agreed portable scope; missing required
      evidence/context, malformed lifecycle history, and decisive outcomes cannot
      bypass required validation or change committed history.
- [ ] Required timestamps follow the portable profile in every implementation.
- [ ] Redaction requires a valid declared authority and preserves Audit meaning.
- [ ] Workflow errors follow specified precedence; Entity import/evolution
      distinguish malformed supplied values from omission and fail atomically.
- [ ] Reviewed malformed-input families produce applicable portable errors,
      never language exceptions, process failures, or fabricated success.
- [ ] All manifest vectors, native sequences, installed consumers, coverage,
      full configured mutation suites, and critical/native probes pass on the
      prescribed runtimes, with no surviving critical financial mutant.
- [ ] Clean-checkout verification and a fresh boundary review pass; all newly
      confirmed mandatory gaps are resolved and traceability reflects actual scope.
- [ ] Documentation and compatibility decisions are synchronized, earlier
      regressions and tags are preserved, and no architecture boundary is violated.
- [ ] Concise release notes and the annotated corrective tag identify the
      verified snapshot. No unrequested publication or Core 1.0 promotion occurs.
