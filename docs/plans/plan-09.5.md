# FinKore Core 0.9.5 Plan

## Status

Planned; no milestone is complete. A new readiness review of `d920091`
(`core-0.9.4`) reproduced the findings below despite passing existing checks.
[Core 1.0 promotion](plan-10.md) is blocked until these findings and this
corrective release gate are closed. The completed [0.9.4 plan](plan-09.4.md)
remains the record of its own corrections and verified snapshot.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) establishes
foundation obligations; `/spec` defines financial behavior. Any normative
correction must follow `SPEC-FREEZE-001` through `SPEC-FREEZE-004` and the
compatibility rules in [Specification Conventions](../../spec/conventions.md).
Planning does not implement a correction, declare 1.0 stable, publish packages,
create a tag, or authorize remote publication.

## Objective and scope

Close demonstrated gaps in exact Money serialization, Workflow binding
ownership and precondition presence, Approval subject association, native Audit
value ownership and rejection, and Entity composition, identity, and definition
validation. Exercise native public APIs as well as conformance adapters, with
paired valid controls, operation sequences, and failure-state observations.

Preserve all earlier Money, Approval, Workflow, Audit, and Entity corrections,
including 0.9.4 lifecycle evidence preservation, evolution history consistency,
Audit precedence, nested guard ownership, and arbitrary JSON member preservation.

No new financial domain, rounding default, universal Approval fact policy,
Workflow migration or registry, distributed concurrency, persistence, generic
validation DSL, authorization model, or agent execution mode is in scope.
Existing identifiers, portable errors, and operation IDs remain stable unless
the compatibility policy requires a documented replacement.

Financial rules and portable failure selection belong in cores. Adapters may
translate fixture containers and preserve member presence, but must not supply
missing financial facts, derive bindings from a newly supplied definition,
perform rounding, or hide core validation failures. The runner stays
domain-neutral. API representation may differ by language while preserving the
same observable guarantees.

## Starting evidence

The review reran `npm run check`, Python 3.13 compatibility, and all 542 manifest
vectors on TypeScript, CPython 3.12, CPython 3.13, and Java. These passed with
zero failed, unsupported, or infrastructure conformance outcomes. Additional
adapter probes and direct Python, Java, and TypeScript API probes reproduced
the failures below; passing controls distinguished them from setup failures.

The earlier 0.9.4 clean release verification also passed coverage, isolated
package consumers, both full Stryker suites, 133 critical conformance probes,
and 13 native API probes. Its mutation scores were 97.06 percent for the runner
and 96.69 percent for the TypeScript core. These are historical measurements,
not proof that the newly reviewed boundaries are covered. No complete mutation
rerun was performed during the subsequent read-only readiness review.

Permanent repository tests must replace the temporary review probes. Execution
must not depend on `/tmp` files, this conversation, or fixed historical test
counts. The 0.9.4 dependency audit was clean; its documented npm dependency-tree
diagnostic is separate from these financial findings.

## Findings to resolve

Numbers retain the readiness review's ordering. Lettered rows separate failure
mechanisms; rows 9 and 10 capture its additional Entity definition findings.
These are planning labels, not new requirement identifiers. TypeScript agreement
is not specification authority, and cross-language agreement is not proof of
correctness.

| Finding | Reproduced observation | Governing requirement or contract boundary | Fix milestone |
| --- | --- | --- | --- |
| 1a — Money value loss | Python `Money.from_portable({"amount":"1.239","currency":"EUR"}).to_portable(scale=2)` returns `1.23 EUR` without a rounding policy. | `MONEY-SERIALIZATION-008`, `MONEY-ROUNDING-001`, `MONEY-ROUNDING-006`, `MONEY-ERROR-005`. | 3 |
| 1b — Money error portability | Java `toPortable(2)` on the same amount throws raw `ArithmeticException`; exact scale 3 succeeds. | Serialization/rounding boundary and `MONEY-ERROR-005` through `MONEY-ERROR-007`. | 3 |
| 2 — Instance binding ownership | Python permits mutation of the exposed binding and a native constructor's original binding dictionary. Changing version `1` to `2` enables version 2 transitions on an existing instance. | `WORKFLOW-VERSION-007` through `WORKFLOW-VERSION-011`. | 4 |
| 3 — Committed Audit numeric alias | Java accepts an `AtomicInteger` inside actor metadata and retains it. Changing it from `1` to `999` changes an already committed Event observation. | `AUDIT-APPEND-001`, `AUDIT-ACTOR-010`; supported native JSON-number boundary. | 6 |
| 4 — Approval association validation | Python and Java record Decisions without `subjectFacts`, then return `APPROVED` during evaluation. They also accept an empty Requirement subject. | `APPROVAL-DECISION-001`/`002`, `APPROVAL-REQUIREMENT-002`, `APPROVAL-ERROR-001`; native and fixture association representations. | 5 |
| 5 — Null Workflow preconditions | Python and Java treat explicit null expected State/revision as omission and successfully transition. TypeScript returns invalid-State/state-conflict errors. | `WORKFLOW-CONFLICT-001` through `WORKFLOW-CONFLICT-007`, `WORKFLOW-ERROR-007`, `SPEC-NULLABILITY-001`. | 4 |
| 6 — Entity/Workflow binding integration | A versioned Entity can be created, but a subsequent transition fails with `FINKORE_WORKFLOW_INVALID_INSTANCE` in all three implementations because the reconstructed Workflow instance lacks its binding. TypeScript also rejects reconstruction from its own Entity observation. | `ENTITY-LIFECYCLE-001`/`002`/`003`, `ENTITY-IMPORT-002`, `WORKFLOW-VERSION-007` through `WORKFLOW-VERSION-011`; retained and imported binding contract. | 7 |
| 7 — Revision/conflict identity | Python and Java accept identical business-revision and conflict-version values in a fixture with no explicit shared-meaning declaration; TypeScript rejects them. | `ENTITY-REVISION-002`, `ENTITY-REVISION-006`/`007`, `ENTITY-IMPORT-006`; semantic distinction versus lexical equality and the declared exception. | 7 |
| 8a — Null Approval eligibility | Python crashes on `eligibleActors: null` instead of returning a portable error. | `APPROVAL-REQUIREMENT-003`, `APPROVAL-ERROR-001`; concrete Requirement versus composition observation validation. | 5 |
| 8b — Null Entity preconditions | Java throws `NullPointerException` for explicit null expected State, revision, or conflict version during import. Python and TypeScript return state-conflict errors. | `ENTITY-IMPORT-007`/`008`, `ENTITY-ERROR-001`; presence-aware precondition and error selection. | 7 |
| 8c — Native Audit cycles | Cyclic actor metadata raises Python `RecursionError` and Java `StackOverflowError`, rather than `FINKORE_AUDIT_ACTOR_INVALID`. | `AUDIT-ACTOR-010`, `AUDIT-CHANGE-008`, `AUDIT-ERROR-004`; native non-JSON rejection and failure atomicity. | 6 |
| 9 — Retained Entity definition alias | TypeScript retains the caller's Workflow definition. Adding a transition after creating an unversioned Entity changes a previously rejected transition into success. | Entity definition ownership review under `ENTITY-LIFECYCLE-001`/`003` and applicable Workflow guarantees; do not assume versioned rules silently define every unversioned policy. | 7 |
| 10 — Unknown Entity validator | Python and Java silently ignore a validator named `positive-mony`; TypeScript rejects the definition. | `ENTITY-VALIDATION-001`/`002`/`003`, existing declarative fixture conventions, malformed definition versus failed business rule. | 7 |

## Milestone 1 — Contract decisions and traceability

- [ ] Review the affected Money serialization, rounding, and error rules;
      Workflow versioning, conflicts, and errors; Approval Requirements,
      Decisions, and errors; Audit Actors, Changes, append-only history, and
      errors; and Entity lifecycle, import, revisions, validation, and errors.
      Check CoreDoc and canonical Agentic descriptors for consistency.
- [ ] Classify every finding as an implementation violation, adapter/fixture
      defect, documentation mismatch, or blocking specification gap. Establish
      expected outcomes and primary error selection before implementation.
- [ ] Resolve the decisions below in their owning documents. Identify any
      observable specification change and its compatibility impact; preserve
      stable IDs or introduce a new requirement only when the existing meaning
      cannot correctly carry the clarification.
- [ ] Reassess affected traceability rows. Existing mapped vectors are not
      exhaustive coverage; record PARTIAL, UNCOVERED, or BLOCKING SPEC GAP as
      warranted. Distinguish JSON-vector coverage from native ownership and
      serialization API coverage.
- [ ] Keep conformance fixtures subordinate to `/spec`. Do not promote Approval
      or import fixture IDs into new canonical Agentic operations merely to
      expose a regression. Update Agentic metadata only for affected contracts.
- [ ] Record decisions and requirement/test mappings in this plan and existing
      specification/conformance documentation. Change CoreDoc only for changed
      foundation obligations, using its existing version fields.

The following recommendations guide review; they are not accepted normative
decisions or permission to invent implementation semantics.

| Decision | Recommended direction | Boundary requiring resolution |
| --- | --- | --- |
| Explicit serialization scale | Permit presentation changes only when numeric value is preserved; require explicit rounding through the existing rounding API for lossy reduction. | Confirm error mapping for lossy, negative, non-integral, and unsupported scales without adding a rounding default. |
| Workflow binding ownership | Retain an immutable binding or expose defensive copies at construction, import, transition, and observation boundaries. | Preserve language-idiomatic APIs; copying must not silently rebind an instance to the supplied definition. |
| Missing versus null preconditions | Preserve supplied-member presence and apply existing State/revision validation and precedence. | Define fixture translation and native optional-argument representation without conflating null with omission. |
| Approval subject association | Require the declared subject and Decision association at concrete record/evaluation boundaries. | Do not standardize a universal fact schema or reject legitimate null fact values merely because association was absent in the failing probe; separate composition observations from concrete Requirements. |
| Java native numeric values | Prefer rejecting unsupported mutable `Number` subclasses with the existing context-specific portable error. | If a numeric class is supported, retain its exact immutable value; no `double` coercion or generic string conversion to repair input. Preserve accepted immutable numeric values. |
| Versioned Entity lifecycle | Preserve the original Workflow binding through create, transition, observation, and import, with mismatch rejection. | Establish where binding is retained and explicitly supplied on import; never derive a historical binding from whichever definition is presented later. Any representation change needs compatibility review. |
| Revision/conflict identity | Preserve independently observable identities and the explicitly declared shared-meaning exception. | Confirm whether the bounded fixture rejects identical strings; semantic separation must not become an invented global string-uniqueness rule. |
| Entity definition ownership | Prefer owned, stable declarations for existing Entity instances, including their Workflow and validator configuration. | Resolve the demonstrated unversioned alias boundary explicitly; do not invent a dynamic reconfiguration API or migration mechanism. |
| Unknown validator declarations | Reject unsupported/malformed declarations instead of silently skipping them. | Confirm the owning portable error and distinguish a malformed definition from a supported validator rejecting financial data; retain the bounded fixture, not a new DSL. |

Completion: every finding has an agreed contract, primary portable outcome,
compatibility assessment where needed, and identified permanent test boundary.
Unresolved financial semantics block the dependent implementation milestone.

## Milestone 2 — Permanent failing regressions and valid controls

- [ ] Add manifest-discovered vectors for portable Approval association and
      eligibility, Workflow precondition presence, Entity import preconditions
      and revision identity, accepted versioned Entity sequences, and malformed
      validator declarations according to Milestone 1 decisions.
- [ ] Add native Money serializer tests for exact round trips, safe scale
      extension/reduction, lossy positive/negative reductions, zero, trailing
      zeros, malformed scales, and explicit-rounding controls. Cover both
      Python runtimes and Java's portable error mapping.
- [ ] Add native Python instance-binding tests for original constructor input,
      exposed binding, imported instances, and successful transition results.
      Verify that attempts to alter one observation do not alter another
      instance, and that version 2 cannot authorize a version 1 instance.
- [ ] Add native Java Audit tests for mutable numeric input and returned
      observations, and Python/Java cycle rejection at Actor metadata and
      ordinary Change boundaries. Include acyclic shared-object controls,
      nested arrays/maps, and supported immutable numbers.
- [ ] Add Entity create → transition → observe/import → transition tests under
      an explicit binding, plus unversioned and version-mismatch controls.
      Cover retained definition input and exposed observations under the
      agreed ownership contract.
- [ ] Exercise each finding through the owning core as well as its adapter
      where applicable. Check exact outputs, portable codes, and unchanged
      operands, instance binding/state, Entity data, and committed histories.
- [ ] Demonstrate each new regression fails against the defective implementation
      while its valid control passes. A crash cannot stand in for the expected
      portable error, and a rejection by an earlier unrelated validator cannot
      count as a regression exposing the intended defect.
- [ ] Register all new vectors and native tests in existing discovery and
      verification paths. Update traceability without claiming implementation
      closure while regressions still fail.

Completion: every finding, including rows 9 and 10 and each lettered row, has
repeatable permanent regression coverage and an appropriate passing control.
No financial implementation fix precedes its demonstrated failing test.

## Milestone 3 — Exact Money serialization

- [ ] Correct Python serialization so a requested presentation scale never
      truncates financial value. Preserve exact amount and currency across
      serialize → deserialize, including negative and high-precision values.
- [ ] Correct Java's serialization failure mapping according to the reviewed
      Money contract; do not expose an arithmetic exception as the domain result.
- [ ] Validate supplied scale at the owning public boundary. Preserve safe
      formatting and existing explicit rounding behavior; add no implicit mode
      or currency-minor-unit default and do not use floating-point arithmetic.
- [ ] Confirm failure preserves the Money operand and Python Decimal context.
      Review direct public construction/serialization paths relevant to these
      guarantees, rather than testing only the conformance adapter.
- [ ] Run Money unit/native tests, portable vectors on all required runtimes,
      applicable coverage, and mutation protection for truncation, rounding
      substitution, and portable errors. Update API docs and examples.

Completion: no serializer changes numeric value, all supported safe scale
controls pass, and lossy/invalid requests fail with the agreed portable errors.

## Milestone 4 — Workflow binding and precondition preservation

- [ ] Eliminate Python binding aliases at native construction, creation, import,
      successful transition, and observation boundaries. Verify both original
      input mutation and exposed-value mutation leave retained binding intact.
- [ ] Preserve supplied null versus omitted expected State/revision through
      Python and Java adapters and cores. Keep financial precondition checks in
      cores and preserve valid omitted, matching, and mismatching controls.
- [ ] Apply existing definition, instance, mismatch, State, conflict, terminal,
      transition, and guard precedence to combined-error cases.
- [ ] Verify all failed requests preserve current State, binding, and instance
      revision. Preserve earlier nested guard ownership and default-sequence
      corrections, including older-version behavior after a new version exists.
- [ ] Run Workflow native/unit/adapter tests and portable vectors across all
      runtimes. Kill binding-alias, silent-rebinding, and null-as-omitted probes;
      update public API documentation for ownership and optional arguments.

Completion: callers cannot rebind existing instances through aliases, and
explicit preconditions cannot be silently discarded.

## Milestone 5 — Approval association and malformed eligibility

- [ ] Validate required Requirement subject and Decision association in Python
      and Java at concrete record and evaluation boundaries. Missing association
      must not produce an effective or approving Decision.
- [ ] Reject malformed supplied eligibility with the agreed portable error,
      including Python's null eligibility crash. Preserve the distinction
      between malformed declarations and a valid but ineligible Actor.
- [ ] Review imported/reused Decision history at these same boundaries,
      including incomplete entries; apply the agreed history validation contract
      without inferring missing subject facts or silently dropping evidence.
- [ ] Preserve lightweight composition/chain observation fixtures and legitimate
      association representations. Do not require a universal subject revision,
      non-null fact value, or a new eligibility model.
- [ ] Verify failed operations preserve Decisions and lifecycle evidence, and
      valid record → evaluate sequences still work. Re-run earlier withdrawal,
      supersession, expiration, relevant-fact, and quorum protections.
- [ ] Run Approval tests and vectors on all runtimes, applicable coverage, and
      mutation probes for missing-association acceptance and eligibility bypass.
      Synchronize API documentation and supported operation claims.

Completion: malformed subject/eligibility input yields portable failures, and
an unassociated Decision cannot be recorded or used to satisfy a Requirement.

## Milestone 6 — Native Audit value ownership and rejection

- [ ] Remove Java's mutable numeric aliases from accepted Actor metadata,
      ordinary Changes, and other Audit JSON-copy entry points governed by the
      reviewed contract. Reject unsupported native values or retain exact
      independent values according to Milestone 1; never silently coerce them.
- [ ] Reject cyclic native metadata and Change values in Python and Java with
      the context-specific portable errors. Distinguish cycles from valid shared
      acyclic references; include object and array/list cycles.
- [ ] Exercise construction, history import, append, repeated observations, and
      redaction. Attempt to mutate both original inputs and exposed values, and
      verify committed Event meaning and source history remain unchanged.
- [ ] Preserve JSON-member presence, explicit null, arbitrary member names,
      Boolean/number distinctions, declared Money comparisons, and prior Audit
      error precedence. Do not turn ordinary JSON numbers into Money.
- [ ] Require exact portable-error assertions with failure atomicity. Stack
      overflow, recursion failure, timeout, and process termination cannot close
      these regressions or qualify as successful targeted mutant kills.
- [ ] Run native/unit tests, all Audit vectors, applicable coverage, and critical
      numeric-alias/cycle-validation mutation probes. Update supported native
      value and defensive-observation API documentation.

Completion: no accepted value can mutate committed Audit history through an
alias, and unsupported cyclic/native values fail deterministically and portably.

## Milestone 7 — Entity binding, identity, and definition boundaries

- [ ] Implement the reviewed versioned Entity binding contract across TypeScript,
      Python, and Java. Creation, reconstruction/import, lifecycle transitions,
      and relevant evolution observations must preserve the original binding.
      Reject mismatches without selecting a new definition as a repair.
- [ ] Preserve binding through returned observations and subsequent operations;
      keep it distinct from Entity identity, business revision, and conflict
      version. Update fixture translation and serialization documentation only
      under the approved compatibility decision.
- [ ] Correct revision/conflict identity handling in Python and Java according
      to the bounded contract, retaining any specified shared-meaning exception.
      Test independent expected-revision and expected-conflict-version checks.
- [ ] Replace Java null-precondition crashes with the reviewed portable
      outcomes. Cover omission, null, malformed, matching, mismatching, and
      missing-observation cases without partial import results.
- [ ] Apply the agreed retained-definition ownership rule to TypeScript Entity
      instances. Test original Workflow input and exposed definition references,
      plus relevant nested guards, declaration lists, mutability, and validators.
- [ ] Reject unknown/malformed bounded validator declarations in Python and
      Java instead of skipping them. Preserve the distinction between invalid
      declarations and valid business rules that reject proposed financial data.
- [ ] Re-run create/import/mutate/transition/evolution sequences with positive
      and negative controls. Preserve identity, validation completeness,
      currentness, history consistency, Audit correspondence, and failure
      atomicity from earlier releases.
- [ ] Run Entity tests and vectors across all runtimes, applicable coverage, and
      mutation probes for binding loss, aliasing, precondition bypass, identity
      conflation, and skipped validation. Synchronize APIs, examples, and docs.

Completion: supported versioned Entity lifecycles remain usable across
observation boundaries, identity meanings stay distinct, and malformed
definitions/preconditions cannot silently pass or crash.

## Milestone 8 — Mutation protection and complete verification

- [ ] Wire every new native and portable regression into repeatable verification.
      Extend existing critical probe tools for all corrected failure mechanisms,
      including each lettered finding and the two Entity definition boundaries.
- [ ] Require each targeted mutant to fail its named behavioral regression
      while its paired valid control executes and passes. Require passing
      unmodified baselines; reject missing results, skipped tests, empty suites,
      compilation failures, crashes, timeouts, and unrelated failures as proof.
- [ ] Run full runner and TypeScript core mutation suites with the unchanged
      minimum 95 percent gate, plus all Python/Java critical and native API
      probes. Review every survivor and uncovered mutant; no critical financial
      mutant may survive. Do not relax scope or ignore meaningful logic to pass.
- [ ] Run strict builds, unit/adapter tests, CPython 3.12/3.13 compatibility,
      coverage, and every manifest vector on TypeScript, both Python runtimes,
      and Java. Require zero failed, unsupported, or infrastructure outcomes.
- [ ] Run isolated npm, Python wheel/sdist, and Java JAR consumer checks. Include
      representative corrected public API paths where existing import-only
      checks would miss serialization or ownership defects.
- [ ] Run toolchain, architecture, documentation/traceability, license,
      developer-tool, and whitespace checks. New tools must follow the existing
      purpose/effects comment convention and remain local; add no GitHub Actions.
- [ ] From a clean checkout of the intended candidate, install locked Node
      dependencies with `npm ci` and run the complete `npm run verify` using the
      prescribed Node 24, CPython 3.12/3.13, JDK 21, and Maven 3.9.x toolchains.
      Review dependency audit results separately from financial conformance.
- [ ] Reassess coverage claims against actual native API, cross-domain sequence,
      and explicit-null tests. A passing aggregate score or manifest does not
      close an uncovered mandatory boundary or blocking specification gap.

Completion: the expanded candidate passes all configured gates from a clean
checkout, and every corrected critical failure mechanism is mutation-protected.

## Milestone 9 — Documentation and corrective release

- [ ] Review tests, public JSDoc and other API docs, examples, root/package
      READMEs, `/spec`, `/conformance`, `/agentic`, CoreDoc, and `AGENTS.md`.
      Update affected artifacts together; document actual supported scope and
      unresolved/deferred semantics accurately.
- [ ] Preserve separate identities for the corrective `core-0.9.5` snapshot,
      `0.9-rc` Core label, `0.1.0` repository-reference package versions, and
      `0.1` conformance syntax unless an explicit reviewed compatibility change
      requires otherwise. Do not promote any of them to stable 1.0 here.
- [ ] After verification, add a concise 0.9.5 summary to the single
      [release history](../releases/README.md). Keep detailed development history
      in Git and existing tools; add no separate closure/provenance reports.
- [ ] Preserve unpublished reference-package status unless the maintainer
      explicitly changes it. Verify the intended release commit and existing
      tags, then create the annotated local `core-0.9.5` tag through the
      maintainer's release process only after every gate passes.
- [ ] Verify the final documentation snapshot from a clean checkout and ensure
      the release tree contains the executable files and dependency locks that
      passed complete verification. Preserve all prior tags and distinguish
      local completion from remote availability/publication.
- [ ] Close this plan and update [Core 1.0 prerequisites](plan-10.md) only after
      every finding and release gate is resolved. Stable 1.0 promotion remains
      separate; do not convert passing finite coverage into a claim of exhaustive
      correctness.

Completion: documentation, release notes, and the corrective tag identify the
verified 0.9.5 state, and the 1.0 plan reflects its actual readiness.

## Execution dependencies and scope control

Milestone 1 establishes the contracts. Milestone 2 supplies failing regressions
before fixes. Milestones 3–6 correct their respective domains; Milestone 7 uses
the corrected Workflow ownership/presence contract and preserves Audit/Approval
composition guarantees. Milestone 8 verifies the combined candidate, and
Milestone 9 finalizes only that verified state.

Record completion only after each milestone's checks pass. If implementation
exposes another mandatory boundary gap, establish its governing contract and
failing regression before correcting it. Do not hide new defects by weakening
expectations, narrowing advertised scope without review, or relying on an older
release's passing measurements.

Learn pages, navigation, and presentation may proceed independently. Their
examples must follow the current specification and label release-candidate and
unsupported behavior honestly. Such work does not close this gate, establish
1.0 readiness, or authorize changes to core semantics. Validate any executable
learning examples against the applicable public API when those pages are built.

## Release gate

Core 0.9.5 is complete only when:

- [ ] Every finding, including each subcase and rows 9–10, has a resolved
      contract, permanent regression, and valid control.
- [ ] Money serialization preserves exact numeric value and currency, with
      portable failures for unsupported precision reduction and invalid scale.
- [ ] Workflow instances retain immutable version bindings and enforce supplied
      preconditions with correct omission/null semantics and error precedence.
- [ ] Approval operations require valid subject association and eligibility
      without losing committed Decisions or lifecycle evidence.
- [ ] Audit history cannot change through accepted native aliases, and cyclic
      or unsupported values return the applicable portable errors atomically.
- [ ] Versioned Entity creation, observation/import, and transition compose
      correctly; definition ownership and validator handling follow the agreed
      contract, and revision/conflict identity remains independently meaningful.
- [ ] No reviewed malformed-input path escapes as a language exception, process
      crash, timeout, or successful operation that skipped required validation.
- [ ] All manifest vectors pass on TypeScript, Python 3.12, Python 3.13, and
      Java with zero failed, unsupported, or infrastructure outcomes.
- [ ] Native sequences, coverage, mutation, package consumers, repository
      checks, and clean-checkout verification pass with no surviving critical
      financial mutant or uncovered mandatory boundary.
- [ ] Traceability and current documentation reflect the corrected behavior,
      with no blocking specification gap or premature stable claim.
- [ ] The concise release note and annotated corrective tag identify the
      verified snapshot, preserving prior releases and publication choices.
- [ ] No new domain, invented financial policy, architecture bypass, or
      premature Core 1.0 promotion was introduced.
