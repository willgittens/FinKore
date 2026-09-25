# FinKore Core 0.9.5 Plan

## Status

Milestones 1 and 2 are complete: the three Entity contract decisions are
accepted, and permanent failing regressions and passing controls reproduce
every reviewed finding. Milestones 3 through 5 complete Money serialization,
direct Workflow ownership/precondition corrections, and concrete Approval
association/eligibility/history validation. Milestone 6 completes native Audit
value ownership and cycle rejection. Entity corrections remain pending.
A new readiness review of `d920091`
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

- [x] Review the affected Money serialization, rounding, and error rules;
      Workflow versioning, conflicts, and errors; Approval Requirements,
      Decisions, and errors; Audit Actors, Changes, append-only history, and
      errors; and Entity lifecycle, import, revisions, validation, and errors.
      Check CoreDoc and canonical Agentic descriptors for consistency.
- [x] Classify every finding as an implementation violation, adapter/fixture
      defect, documentation mismatch, or blocking specification gap. Establish
      expected outcomes and primary error selection before implementation.
- [x] Resolve the decisions below in their owning documents. Identify any
      observable specification change and its compatibility impact; preserve
      stable IDs or introduce a new requirement only when the existing meaning
      cannot correctly carry the clarification.
- [x] Reassess affected traceability rows. Existing mapped vectors are not
      exhaustive coverage; record PARTIAL, UNCOVERED, or BLOCKING SPEC GAP as
      warranted. Distinguish JSON-vector coverage from native ownership and
      serialization API coverage.
- [x] Keep conformance fixtures subordinate to `/spec`. Do not promote Approval
      or import fixture IDs into new canonical Agentic operations merely to
      expose a regression. Update Agentic metadata only for affected contracts.
- [x] Record decisions and requirement/test mappings in this plan and existing
      specification/conformance documentation. Change CoreDoc only for changed
      foundation obligations, using its existing version fields.

The original review directions below are resolved by the recorded outcomes and
accepted Entity decisions. The owning specifications remain normative.

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

### Review results

The review checked the listed specifications, their error catalogs, CoreDoc,
canonical Agentic descriptors, manifest vectors, and existing native tests.
The following expectations apply to otherwise valid inputs; combined failures
use an existing specified priority where one exists. No total Entity or
concrete Approval error ordering is inferred from implementation order.

| Finding | Classification and contract outcome | Permanent regression and valid control |
| --- | --- | --- |
| 1a | Implementation violation. `MONEY-SERIALIZATION-008`, `MONEY-ROUNDING-001`/`006`, and `MONEY-ERROR-005`/`007` prohibit lossy serialization. A valid scale discarding nonzero value returns `FINKORE_MONEY_ROUNDING_REQUIRED`, preserving the operand. | Native Python 3.12/3.13 serializers: positive/negative lossy reduction; exact reduction, scale extension, zero/trailing zeros, explicit round-then-serialize, and unchanged Decimal context. |
| 1b | Implementation violation. Java's raw arithmetic exception is not `FINKORE_MONEY_ROUNDING_REQUIRED`. Malformed, negative, non-integral, or unsupported requested scale uses `FINKORE_MONEY_INVALID_ROUNDING` under `MONEY-ERROR-006` before any loss check. | Java public serializer loss/error tests paired with exact scale 3 and safe reduction; malformed scales at representable native boundaries. No new TypeScript serializer argument is required. |
| 2 | Implementation violation. `WORKFLOW-VERSION-007`–`011` protect the binding itself at construction/import/transition/observation. Caller mutation cannot rebind an existing instance. | Native Python original/exposed binding mutation; independent instances and repeated observations; version 1 still works and version 2 returns `FINKORE_WORKFLOW_VERSION_MISMATCH` with unchanged state/revision/binding. |
| 3 | Implementation violation plus a native numeric support documentation gap. `AUDIT-ACTOR-010` and `AUDIT-APPEND-001` prohibit retained mutable numeric aliases. The selected Java correction rejects unsupported mutable `Number` subclasses with actor-invalid in Actor metadata, invalid-event in ordinary Changes/Event content. | Java `AtomicInteger`/`AtomicLong` rejection, supported immutable numeric controls, original/returned nested values, history import/append/repeated observation/redaction. No numeric coercion to repair unsupported input. |
| 4 | Implementation violation; concrete versus composition fixture boundary clarified. `APPROVAL-REQUIREMENT-002`, `APPROVAL-DECISION-001`/`002`, and the Approval error catalog require declared subject and association. Missing association or malformed concrete subject uses `FINKORE_APPROVAL_INVALID_DECISION`, including structurally incomplete reused history. | Record and evaluate directly and through adapters with missing/empty subject, absent association, and malformed historical entries before/after valid evidence. Pair explicit null/empty-object/scalar/structured fact associations and valid record → evaluate; preserve both histories on failure. |
| 5 | Implementation/fixture presence violation. `WORKFLOW-CONFLICT-001`–`007` and `WORKFLOW-ERROR-007` distinguish omission from null. Null expected State returns `FINKORE_WORKFLOW_INVALID_STATE`; null expected revision returns `FINKORE_WORKFLOW_STATE_CONFLICT`. | Portable and native omission/null/malformed/matching/mismatching tests, absent observed revision, version mismatch plus null expectation, invalid State plus conflict, and unchanged observations. |
| 6 | Implementation integration violation and missing fixture documentation. `ENTITY-LIFECYCLE-001`–`003`, `ENTITY-IMPORT-002`, and `WORKFLOW-VERSION-007`–`011` require retained binding. Create/transition/observe/import under the same version succeeds. Missing/malformed binding uses `FINKORE_WORKFLOW_INVALID_INSTANCE`; a different version uses `FINKORE_WORKFLOW_VERSION_MISMATCH`. | All-language native create → transition → observe/reconstruct/import → transition, plus versioned JSON fixtures. Compare exact binding and use unversioned, missing-binding, mismatch, and older-version controls; cover mutation/evolution observations too. |
| 7 | Normative ambiguity resolved by the accepted scoped interpretation of `ENTITY-REVISION-002`/`007`: the bounded fixture rejects equal current-revision/conflict tokens with `FINKORE_ENTITY_INVALID_IDENTITY`. Independently observable identities and the composing-specification exception remain intact. | equal-token and distinct-token import fixtures; independent revision/conflict preconditions, exact preservation, missing tokens, and explicit shared-meaning boundary. Do not infer global lexical uniqueness. |
| 8a | Implementation violation and fixture documentation gap. Null `eligibleActors` does not declare eligibility under `APPROVAL-REQUIREMENT-003`; it uses the existing malformed concrete Requirement outcome `FINKORE_APPROVAL_INVALID_DECISION`. | Null/missing/empty/malformed eligibility with a valid concrete Requirement control. A valid list excluding the deciding Actor instead returns `FINKORE_APPROVAL_INELIGIBLE_ACTOR` at record time; lightweight composition observations retain their own rules. |
| 8b | Implementation violation. Explicit null expected State/revision/conflict version does not match an otherwise valid Entity observation under `ENTITY-IMPORT-007`; return `FINKORE_ENTITY_STATE_CONFLICT`, not a Java null exception. | Native and portable import with all three omitted/null/malformed/matching/mismatching preconditions and missing observed revision/token. No partial result or changed source under `ENTITY-IMPORT-008` and `ENTITY-ERROR-001`. |
| 8c | Implementation violation. Cycles are outside JSON: Actor metadata uses `FINKORE_AUDIT_ACTOR_INVALID` under `AUDIT-ACTOR-010`; ordinary Change/Event values use `FINKORE_AUDIT_INVALID_EVENT` under `AUDIT-CHANGE-008`. Preserve `AUDIT-ERROR-004` priority. | Native Python and Java cyclic maps/lists, nested cycles, shared acyclic controls, history import and candidate append. A recursion/stack exception, timeout, or process termination is not the expected failure or a valid mutant kill. |
| 9 | Normative gap resolved by `ENTITY-DEFINITION-002`: existing Entities retain owned declarations, including unversioned Workflows, without caller or exposed aliases changing behavior. | native TypeScript original/exposed Workflow transitions, nested guards, declaration lists, mutability and validator configuration; unchanged existing-Entity behavior and independent newly created Entity controls. |
| 10 | Implementation violation for skipped validation; the declaration-error gap is resolved by `ENTITY-VALIDATION-009`. Unsupported/malformed declarations use `FINKORE_ENTITY_INVALID_MUTATION`; supported predicates rejecting data retain `FINKORE_ENTITY_VALIDATION_FAILED`. | all-language create/import/mutate/transition with misspelled rule, malformed rule/list/id/path/otherPath, and paired valid declarations. Supported predicates rejecting data still return `FINKORE_ENTITY_VALIDATION_FAILED`. |

### Accepted Entity decisions

The maintainer accepted the three proposals before requesting Milestone 2.
Their owning documents now establish the contracts:

1. [Definition ownership](../../spec/entities/README.md),
   `ENTITY-DEFINITION-002`: retain stable owned declarations for an existing
   Entity, including unversioned Workflows. Original or exposed input mutation
   cannot reconfigure the instance. Stateless APIs are not required to retain
   definitions across unrelated calls; no migration/reconfiguration API is added.
2. [Revision/conflict identity](../../spec/entities/revisions.md),
   `ENTITY-REVISION-002`/`007`: the bounded import representation rejects equal
   current-revision/conflict tokens without explicit composing-specification
   shared meaning. No fixture flag or global string-uniqueness rule is invented.
   The declared exception retains independently observable meanings and checks.
3. [Validator declarations](../../spec/entities/validation.md),
   `ENTITY-VALIDATION-009`: reject unsupported/malformed declarations with
   `FINKORE_ENTITY_INVALID_MUTATION` before predicate evaluation; supported
   predicates rejecting data still use `FINKORE_ENTITY_VALIDATION_FAILED`.
   Omitted/empty validator lists and the two supported predicates stay valid.

Milestone 1 is complete and no reviewed specification gap blocks Milestone 2.
Implementation and mutation closure remain separate gates.

### Compatibility and artifact synchronization

The existing-obligation clarifications preserve all requirement IDs, portable
errors, operation IDs, vector IDs, Money member meanings, and syntax versions.
Lossy serialization, mutable committed evidence, missing bindings, absent
association, and ignored supplied preconditions were not conforming behavior.
Native language APIs may preserve their existing idiomatic representation of
an omitted serializer scale, but a real requested scale is validated as above.

Entity binding is semantic preservation required by Workflow; `/spec` does not
freeze a universal Entity envelope. The fixture now documents `binding` inside
each versioned Entity observation, using the existing Workflow binding shape.
It is required for versioned reuse and cannot be described as freely ignorable
under `SPEC-COMPATIBILITY-010`. Unversioned fixtures retain their old shape;
no canonical operation gains a new financial meaning or a canonical import ID.
The defective versioned output path is not a backward-compatible import source
that can be repaired by inferring historical binding from a current definition.

The accepted ownership and declaration-error corrections add observable obligations
for previously unsettled boundaries. The scoped equal-token decision also
selects a previously ambiguous fixture result. They are recorded as
corrective normative decisions under `SPEC-FREEZE-001` and
`SPEC-COMPATIBILITY-012`/`014`, not editorial changes or version-neutral
regressions. Existing identifiers are preserved: these corrections resolve previously
unspecified boundaries rather than replace a prescribed canonical result.
The new obligations have their own requirement IDs. No canonical operation ID
is reused for different financial meaning or promoted from an import fixture;
this documented release-candidate correction path does not claim behavioral
compatibility for previously unsettled inputs merely because TypeScript
already rejected some of them.

CoreDoc review found no changed foundation obligation: exactness follows
CORE-001.1/001.2; declared controls and failure atomicity follow CORE-002;
immutable Audit meaning follows CORE-003.2; subject/Decision association follows
CORE-004.1/004.3; opaque identities and presence distinctions follow CORE-005.
CoreDoc version fields therefore remain unchanged. Agentic metadata clarifies
Workflow/Audit/Entity preservation and errors; Approval/import/serializer fixture
IDs remain conformance-local. Descriptor coverage is not implementation closure.

At the end of the initial review, the reassessment retained all 542 manifest
vectors and 411 requirement IDs:
**275 COVERED, 52 PARTIAL, 0 UNCOVERED, 81 NOT DIRECTLY TESTABLE, 0 DEFERRED,
3 BLOCKING SPEC GAP**. These are requirement-level classifications. Missing
native serializer/alias/cycle boundaries are themselves uncovered; their owning
requirements remain PARTIAL because existing JSON vectors exercise other cases.
Those were Milestone 1 classifications before acceptance. Milestone 2 adds
permanent evidence and the current inventory is in conformance traceability.

Permanent native boundary/sequence tests supplement the existing TypeScript,
Python, and Java domain suites through normal test discovery. Portable cases belong
in manifest-discovered domain files; existing readiness and critical/native
mutation tools must discover the new tests in later milestones. Named failing
regressions and paired passing controls precede fixes; historical passing
counts cannot substitute for them.

Milestone 1 completion review: specification explanations, conformance conventions and
traceability, Agentic descriptors, and README status need updates in this
milestone. Public APIs, JSDoc, unit tests, vectors, and mutation implementations
are unchanged; their coordinated corrections remain mandatory in Milestones
2–8 under `SPEC-FREEZE-002` before the corrective release can close. AGENTS.md,
CoreDoc, release notes, packages, and tags need no change for this review.

Verification for the initial documentation-only review: `npm run docs:check` passed
(documentation links, CoreDoc references, and requirement/vector/Agentic
traceability); `git diff --check` passed. These checks validate the edited
documents, not financial implementation conformance or mutation coverage.

## Milestone 2 — Permanent failing regressions and valid controls

- [x] Add manifest-discovered vectors for portable Approval association and
      eligibility, Workflow precondition presence, Entity import preconditions
      and revision identity, accepted versioned Entity sequences, and malformed
      validator declarations according to Milestone 1 decisions.
- [x] Add native Money serializer tests for exact round trips, safe scale
      extension/reduction, lossy positive/negative reductions, zero, trailing
      zeros, malformed scales, and explicit-rounding controls. Cover both
      Python runtimes and Java's portable error mapping.
- [x] Add native Python instance-binding tests for original constructor input,
      exposed binding, imported instances, and successful transition results.
      Verify that attempts to alter one observation do not alter another
      instance, and that version 2 cannot authorize a version 1 instance.
- [x] Add native Java Audit tests for mutable numeric input and returned
      observations, and Python/Java cycle rejection at Actor metadata and
      ordinary Change boundaries. Include acyclic shared-object controls,
      nested arrays/maps, and supported immutable numbers.
- [x] Add Entity create → transition → observe/import → transition tests under
      an explicit binding, plus unversioned and version-mismatch controls.
      Cover retained definition input and exposed observations under the
      agreed ownership contract.
- [x] Exercise each finding through the owning core as well as its adapter
      where applicable. Check exact outputs, portable codes, and unchanged
      operands, instance binding/state, Entity data, and committed histories.
- [x] Demonstrate each new regression fails against the defective implementation
      while its valid control passes. A crash cannot stand in for the expected
      portable error, and a rejection by an earlier unrelated validator cannot
      count as a regression exposing the intended defect.
- [x] Register all new vectors and native tests in existing discovery and
      verification paths. Update traceability without claiming implementation
      closure while regressions still fail.

Completion: every finding, including rows 9 and 10 and each lettered row, has
repeatable permanent regression coverage and an appropriate passing control.
No financial implementation fix precedes its demonstrated failing test.

### Milestone 2 evidence

The existing manifest-listed `readiness-regressions.json` files now include
85 additional vectors: 27 Approval, 12 Workflow, and 46 Entity cases. Native
tests execute those cases directly against owning cores, independently of
adapter dispatch, and add non-JSON inputs and actual operation sequences:

- [TypeScript boundary regressions](../../implementations/typescript/core/test/integration/boundary-regressions.test.ts).
- [Python boundary regressions](../../implementations/python/core/tests/test_boundary_regressions.py), on CPython 3.12 and 3.13.
- [Java boundary regressions](../../implementations/java/core/src/test/java/org/finkore/BoundaryRegressionTest.java), registered in the Java test tool and Maven coverage suite.

The following prefixes identify permanent vector or native test families;
native Python names refer to methods in `BoundaryRegressions`. Every finding
has a failing case on its affected implementation and a passing control.
Some defensive cases already pass on other implementations, as expected.

| Finding | Permanent failing evidence | Passing control |
| --- | --- | --- |
| 1a | Python `test_money_lossy_serialization_rejected`, `test_money_invalid_scale_rejected` | `test_money_exact_serialization_controls`, `test_money_explicit_rounding_control`; unchanged operand and Decimal context |
| 1b | Java `money.serialization.lossy-*`, `money.serialization.invalid-scale-*` | `money.serialization.exact-control`, `money.serialization.rounding-control` |
| 2 | Python `test_binding_constructor_input_is_owned`, `test_exposed_binding_cannot_rebind` (created, imported, transitioned instances) | `test_binding_observation_control`, independently retained instances and version-1 transitions |
| 3 | Java `audit.mutable-number.*` at construction/import/append and returned observations | `audit.immutable-numbers-shared-ownership-control`, including redaction and repeated observations |
| 4 | `approval.association.*` missing subject/association/history cases, Python/Java native `missing-association` sequences | Explicit null/object/scalar/structured associations; native record → reimport → evaluate controls in all three languages |
| 5 | `workflow.presence.state-null-001`, `workflow.presence.revision-null-001` and malformed/precedence cases, Python/Java | `workflow.presence.omitted-control-001`, matching State/revision controls |
| 6 | `entity.binding.versioned-*`, mismatch import, and native versioned create → transition → observe/import → transition in all languages | `entity.binding.unversioned-*` and native unversioned sequences; missing/malformed binding rejection |
| 7 | `entity.import.equal-revision-conflict-token-001`, Python/Java | `entity.import.distinct-token-control-001`, independently matching revision/conflict preconditions |
| 8a | `approval.association.record-null-eligibility-001`, `approval.association.evaluate-null-eligibility-001`, Python | Valid eligibility controls and `approval.association.ineligible-control-001` distinguish invalid declarations from ineligible Actors |
| 8b | `entity.import.presence-*` explicit null preconditions, Java | Omitted and matching State/revision/conflict controls; unchanged imported source |
| 8c | Python `test_audit_cycles_are_portable_errors`, Java `audit.cycle.*`; Actor/Change map/list/nested cycles at construct/import/append | Python `test_audit_shared_acyclic_and_ownership_controls`, Java shared immutable-number control |
| 9 | TypeScript original/exposed transition, State/terminal, mutability, and validator declaration alias tests | Independent new Entity declaration control and preserved nested guards |
| 10 | `entity.declaration.unknown-*` and malformed declaration families, Python/Java | `entity.declaration.omitted-control-001`, `empty-control-001`, `cross-field-control-001`, `valid-predicate-rejection-control-001` |

Python's requested zero-scale formatting also fails
`test_money_zero_requested_scale`: `0.000` at scale 0 remains `0.000` instead
of `0`. This additional formatting boundary belongs to Milestone 3. Null
validator lists and null expected conflict versions with absent observed
tokens likewise extend the reviewed declaration/presence families.

Final manifest execution against the unchanged implementations:

| Runtime | PASS | FAIL | UNSUPPORTED | INFRASTRUCTURE_ERROR |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 622 | 5 | 0 | 0 |
| CPython 3.12 | 588 | 35 | 0 | 4 |
| CPython 3.13 | 588 | 35 | 0 | 4 |
| Java | 587 | 36 | 0 | 4 |

All 542 earlier vectors and all 24 new portable control cases pass in all four
runtimes. Python's four infrastructure outcomes are raw `TypeError` exceptions
for null eligibility and null validator lists. Java's four are raw
`NullPointerException` exceptions for explicit null import preconditions.
These are reproduced implementation defects, not valid portable outcomes or
mutation kills. Native tests likewise reject raw exceptions and accepted
invalid input; no expected-failure markers or skips conceal them.

The targeted TypeScript suite executes 100 tests (86 pass, 14 fail); Java
executes 129 cases (50 pass, 79 fail). Each Python runtime executes 99 methods,
reporting 72 failing assertions including subtests and three unexpected
portable errors in expected-success versioned Entity sequences. These are
intentionally red results. Passing controls were checked separately; Python
subtest counts must not be subtracted from method counts to infer passes.
Later assertions in a sequence remain unverified until its first failure is
fixed; their presence does not claim implementation or mutation closure.

Reproduce the native suites from the repository root:

```sh
npm run test -w @finkore/typescript -- test/integration/boundary-regressions.test.ts
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_boundary_regressions.py
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -p test_boundary_regressions.py
npm run java:compile
.tools/bin/java -cp implementations/java/target/classes:implementations/java/target/test-classes org.finkore.BoundaryRegressionTest
```

Use the existing `conformance:typescript`, `conformance:python`,
`conformance:python:3.13`, and `conformance:java` npm scripts for portable runs.
Normal unit/coverage discovery includes these tests; runner discovery now
compares manifest-declared IDs with loaded IDs instead of a historical count.
No execution depends on temporary review probes.

Build, strict TypeScript (including changed test files), Java compilation,
toolchain verification, all 130 runner tests, developer-tool tests,
architecture, documentation/traceability, license, and whitespace checks pass. Full
financial coverage and mutation closure require a green baseline and remain
in the correction and mutation milestones; `check`/`verify` are expected to
fail at these ordinary regressions until then. Critical mutation probe tools
have not yet gained the Milestone 8 probes.

Completion review: tests, vectors, specification decisions, conformance
conventions/traceability, Agentic metadata, and root/implementation README
status are synchronized. Public APIs and production cores/adapters are
unchanged, so no API/JSDoc correction is claimed. AGENTS.md, CoreDoc, release
notes, packages, and tags need no change for this regression milestone.

## Milestone 3 — Exact Money serialization

- [x] Correct Python serialization so a requested presentation scale never
      truncates financial value. Preserve exact amount and currency across
      serialize → deserialize, including negative and high-precision values.
- [x] Correct Java's serialization failure mapping according to the reviewed
      Money contract; do not expose an arithmetic exception as the domain result.
- [x] Validate supplied scale at the owning public boundary. Preserve safe
      formatting and existing explicit rounding behavior; add no implicit mode
      or currency-minor-unit default and do not use floating-point arithmetic.
- [x] Confirm failure preserves the Money operand and Python Decimal context.
      Review direct public construction/serialization paths relevant to these
      guarantees, rather than testing only the conformance adapter.
- [x] Run Money unit/native tests, portable vectors on all required runtimes,
      applicable coverage, and mutation protection for truncation, rounding
      substitution, and portable errors. Update API docs and examples.

Completion: no serializer changes numeric value, all supported safe scale
controls pass, and lossy/invalid requests fail with the agreed portable errors.

### Milestone 3 completion and verification

Python now validates the selected presentation scale and examines discarded
plain decimal digits without Decimal arithmetic. This preserves arbitrary
precision and the caller's precision, rounding mode, traps, and flags. Scale 0
formats zero correctly. The same checks protect a `presentation_scale` supplied
through the native Money constructor. Java checks exact representability before
rescaling and maps unsupported BigDecimal capacity to the portable invalid-scale
error; ordinary lossy reduction returns the rounding-required error. Neither
implementation mutates Money operands or introduces an implicit rounding mode.

The Milestone 2 tests failed before the correction: Python reported 12 failing
serializer assertions and Java six failing serializer cases. Additional Python
constructor/context regressions also failed before the fix. The permanent tests
now pass, including signed reductions, safe extension/trailing-zero removal,
zero, malformed scales, 5,000-digit native Decimal values, explicit rounding,
and Java's unsupported scale boundary. Scale ranges and no-request semantics
are documented in both public method documentation and package READMEs.

| Check | Result |
| --- | --- |
| Python Money unit/native tests | 23 methods pass on CPython 3.12 and 3.13 |
| Java Money tests | Stdlib Money tests and all nine native serializer cases pass; 14 Money JUnit tests pass |
| Real Money conformance | 102/102 pass on TypeScript, CPython 3.12, CPython 3.13, and Java; no unsupported or infrastructure outcomes |
| Python focused coverage | Money: 222/232 statements (95.69%), 86/94 branches (91.49%); corrected formatter and public serializer have 100% line/branch coverage |
| Java focused coverage | Money: 149/160 lines (93.13%), 88/103 branches (85.44%); corrected formatter and public serializers have 100% line/branch coverage |
| New native serializer mutations | 13/13 killed with passing paired controls; all seven Python probes also pass on CPython 3.13 |
| Existing Money conformance mutations | 15/15 killed |
| Complete native mutation tool | 26/26 killed, retaining all 13 earlier probes |
| Repository checks | Build, strict TypeScript, Java compilation, toolchain, mutation-result tests, architecture, documentation/traceability, license, and whitespace checks pass |

Coverage used fresh data from the focused Money unit/native and real Money
conformance runs. These scoped measurements and targeted mutation results do
not claim a whole-core coverage gate or aggregate mutation score. Runtime
exceptions propagate out of serializer assertions so mutation classification
cannot count a raw arithmetic/type exception as a behavioral kill.

Reproduce focused unit and mutation checks from the repository root:

```sh
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_money.py
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_boundary_regressions.py -k money
npm run java:compile
.tools/bin/java -cp implementations/java/target/classes:implementations/java/target/test-classes org.finkore.MoneyTest
.tools/bin/java -cp implementations/java/target/classes:implementations/java/target/test-classes org.finkore.BoundaryRegressionTest money.serialization
.tools/bin/mvn -o -f implementations/java/core/pom.xml -Dtest=MoneyCoverageTest test
node docs/tools/mutation-native.js money-serialization
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-money-serialization
node docs/tools/mutation-critical.js all money
```

Repeat the two Python unit commands with `python3.13` for compatibility. The
existing conformance scripts accept `-- --suite money` (for Java, compile first
and invoke the runner directly with its Java adapter and `--suite money`).

Completion review: native tests, coverage registration, mutation probes, method
documentation, package/root README status, developer-tool usage, and traceability
are synchronized. The six Money requirements reopened for these boundaries
return to COVERED; the remaining 50 PARTIAL requirements stay open. Existing
Money vectors already exercise the portable representation, and optional native
serializer scales remain native API tests. No new vector, specification rule,
portable error, Agentic operation, adapter logic, JSDoc-bearing TypeScript API,
AGENTS.md rule, CoreDoc obligation, or release note is needed. Later milestone
regressions still fail, so full `check`/`verify` and corrective release closure
remain pending.

## Milestone 4 — Workflow binding and precondition preservation

- [x] Eliminate Python binding aliases at native construction, creation, import,
      successful transition, and observation boundaries. Verify both original
      input mutation and exposed-value mutation leave retained binding intact.
- [x] Preserve supplied null versus omitted expected State/revision through
      Python and Java adapters and cores. Keep financial precondition checks in
      cores and preserve valid omitted, matching, and mismatching controls.
- [x] Apply existing definition, instance, mismatch, State, conflict, terminal,
      transition, and guard precedence to combined-error cases.
- [x] Verify all failed requests preserve current State, binding, and instance
      revision. Preserve earlier nested guard ownership and default-sequence
      corrections, including older-version behavior after a new version exists.
- [x] Run Workflow native/unit/adapter tests and portable vectors across all
      runtimes. Kill binding-alias, silent-rebinding, and null-as-omitted probes;
      update public API documentation for ownership and optional arguments.

Completion: callers cannot rebind existing instances through aliases, and
explicit preconditions cannot be silently discarded.

### Milestone 4 completion and verification

Python `WorkflowInstance` now copies constructor bindings and returns defensive
binding observations. Create, import, transition, and repeated observation
preserve the governing version; mutating one observation cannot authorize a
newer definition or alter another instance. The constructor signature and public
properties are preserved, while the retained binding becomes a private dataclass
field. Native tests also reuse imported and transitioned instances, reject a
different version, and verify the original version still works.

Python transition defaults now distinguish omitted arguments from explicit
`None`. Java provides a four-argument transition overload for omitted
preconditions and `Workflow.OMITTED` for independent omission in the existing
six-argument overload. Explicit null remains supplied input. Callers that used
null placeholders must migrate to omission; all repository Java callers were
updated, including the Entity caller without changing Entity financial behavior.
Package examples and method documentation describe this corrective API change.

Adapters preserve member presence and leave precondition validation in cores.
Malformed-instance errors omit normalized observations, matching the fixture
convention; native assertions still verify unchanged input. Python and Java
validate target State before conflicts and terminal State, as required by
WORKFLOW-ERROR-007. Eight additional `workflow.presence.*` vectors cover
definition/instance priority, target priority, null revision versus terminal
State, and matching preconditions that still face terminal, transition, and
guard checks. The existing 12 presence cases and these eight cases execute
through native cores and adapters. Seven failed on each defective Python/Java
implementation before correction; the binding alias tests failed separately.

| Check | Result |
| --- | --- |
| Python Workflow unit/native tests | 32 methods pass on both CPython 3.12 and 3.13, including all 20 presence/priority cases and three binding methods |
| Java Workflow unit/native tests | Stdlib Workflow tests, 20 presence/priority cases, and ten JUnit tests pass |
| TypeScript regression controls | All 75 existing Workflow unit tests and 130 runner tests pass |
| Adapter tests | Infrastructure tests and all 52 Workflow readiness cases pass for Python 3.12/3.13 and Java |
| Real Workflow conformance | 103/103 pass on all four runtimes, with no unsupported or infrastructure outcomes |
| Native mutation protection | 9/9 Workflow probes killed, including two new instance-binding alias probes; all four Python probes also pass on CPython 3.13 |
| Conformance mutation protection | 32/32 Workflow probes killed, including twelve new core/adapter null-presence, target-priority, and mismatch probes |
| Python focused coverage | Workflow: 219/231 statements (94.81%) and 104/116 branches (89.66%); changed constructor, binding accessor, and transition function have 100% line/branch coverage |
| Java focused coverage | Workflow outer class: 137/147 lines (93.20%) and 166/206 branches (80.58%); transition overloads have 100% line coverage and 27/28 branches covered |
| Repository checks | Build, strict TypeScript, Java compilation, toolchain, tool tests, architecture, documentation/traceability, license, and whitespace checks pass |

Coverage used fresh focused unit/native and real conformance runs; Java
instrumentation and reporting used the same Maven-compiled classes. These are
scoped measurements, not the whole-core coverage or aggregate mutation gate.
No raw exception, skipped assertion, or infrastructure failure counts as a kill.

Full manifest verification now executes 635 vectors. All 542 original vectors
remain passing on every runtime. Remaining outcomes are from the later
milestone regressions:

| Runtime | PASS | FAIL | UNSUPPORTED | INFRASTRUCTURE_ERROR |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 630 | 5 | 0 | 0 |
| CPython 3.12 | 600 | 31 | 0 | 4 |
| CPython 3.13 | 600 | 31 | 0 | 4 |
| Java | 599 | 32 | 0 | 4 |

The unfiltered Python adapter readiness suite also remains red on the known
Approval and Entity regressions. Workflow's focused suite is green; this does
not claim `check`/`verify` or a corrective release is complete.

Focused mutation commands are
`node docs/tools/mutation-native.js workflow` and
`node docs/tools/mutation-critical.js all workflow`; Python native compatibility
uses `FINKORE_PYTHON_PATH=.tools/bin/python3.13`. Existing conformance scripts
accept `-- --suite workflow`; for Java compile first and invoke the runner
directly with its Java adapter and `--suite workflow`. Native boundary tests
select `-k workflow` in Python and `workflow.presence` in Java; the three Python
binding methods named in the Milestone 2 evidence table run separately. Maven
coverage selects `-Dtest=WorkflowCoverageTest`.

Completion review: unit/native tests, vectors, adapter discovery, mutation probes,
public API documentation, package/root README status, conformance conventions,
developer-tool usage, and traceability are synchronized. Eight conflict/error
requirements return to COVERED. Ten Workflow rows remain PARTIAL for their
Entity composition/import/error paths in Milestone 7. Existing specification
and Agentic semantics already define these guarantees, so no normative rule,
portable code, canonical operation, TypeScript API/JSDoc, architectural rule,
AGENTS.md, CoreDoc, release note, or package version changes are needed.

## Milestone 5 — Approval association and malformed eligibility

- [x] Validate required Requirement subject and Decision association in Python
      and Java at concrete record and evaluation boundaries. Missing association
      must not produce an effective or approving Decision.
- [x] Reject malformed supplied eligibility with the agreed portable error,
      including Python's null eligibility crash. Preserve the distinction
      between malformed declarations and a valid but ineligible Actor.
- [x] Review imported/reused Decision history at these same boundaries,
      including incomplete entries; apply the agreed history validation contract
      without inferring missing subject facts or silently dropping evidence.
- [x] Preserve lightweight composition/chain observation fixtures and legitimate
      association representations. Do not require a universal subject revision,
      non-null fact value, or a new eligibility model.
- [x] Verify failed operations preserve Decisions and lifecycle evidence, and
      valid record → evaluate sequences still work. Re-run earlier withdrawal,
      supersession, expiration, relevant-fact, and quorum protections.
- [x] Run Approval tests and vectors on all runtimes, applicable coverage, and
      mutation probes for missing-association acceptance and eligibility bypass.
      Synchronize API documentation and supported operation claims.

Completion: malformed subject/eligibility input yields portable failures, and
an unassociated Decision cannot be recorded or used to satisfy a Requirement.

### Milestone 5 completion and verification

Python and Java now validate concrete Requirement subject identity and nonempty,
distinct eligibility. Missing association and malformed declarations produce
`FINKORE_APPROVAL_INVALID_DECISION`; a valid rule excluding the deciding Actor
retains `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. Every reused concrete Decision is
validated before current-effectiveness filtering, including unrelated,
withdrawn, expired, or ineffective entries and entries after a valid approval.
Explicit null, Boolean, scalar, object, and array facts remain valid. Chain and
composition observation validators remain separate; no universal revision or
fact schema is introduced.

The 23 new vectors supplement the 27 Milestone 2 association cases. Native
record tests reuse malformed histories directly and verify unchanged input.
Actual withdrawal/supersession → record → evaluate sequences now also reject
missing association without losing committed Decisions or lifecycle evidence.
The existing relevant-fact, expiration, quorum, and invalid-withdrawal tests pass.
Before the fix, expanded Python tests reported 43 failures and three errors
across 52 methods/subtests; Java reported 33 failed cases out of 53. The corrected
native boundary suites pass. A Python fact-path test's formerly empty subject
fixture now declares a valid subject so it still exercises fact-path validation.

| Check | Result |
| --- | --- |
| Approval conformance, TypeScript / CPython 3.12 / CPython 3.13 / Java | 162 PASS each; no FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR |
| TypeScript Approval unit tests | 138 PASS; focused Approval integration/boundary selection also passes |
| Python Approval, lifecycle, and boundary tests | 66 methods PASS on each supported runtime, including parameterized history and lifecycle cases |
| Java Approval coverage/native harness | Both JUnit entry points PASS, including all Approval vectors, native Approval/readiness checks, and 53 boundary cases |
| Python Approval coverage, native tests plus real vectors | 91.62% statements, 86.36% branches, 89.62% combined |
| Java Approval coverage, native tests plus real vectors | 91.04% lines, 82.39% branches |
| Critical Approval conformance mutation probes | 27 Python and 23 Java probes killed; 17 new association/eligibility/history probes require named regressions and passing controls |
| Native Approval mutation probes | 4/4 killed, also passing with CPython 3.13 selected; includes two new reused-history probes |
| Other checks | Workspace build/strict TypeScript, Python compilation on both runtimes, Java strict compilation, developer-tool tests, architecture, documentation/traceability, license, and whitespace checks pass |

The first null-eligibility Python mutant caused a runtime crash and was correctly
rejected as mutation evidence. The probe now models invented eligibility and
fails its named behavioral assertion with its valid control passing. No crash,
compilation failure, skipped test, or timeout is counted as a kill. These are
focused Approval mutation results, not a whole-core mutation score or completion
of the release verification gate.

Full-manifest runs execute 658 vectors; all 542 vectors from `core-0.9.4` still
pass on each runtime. Remaining portable failures are exclusively Milestone 7
Entity cases:

| Runtime | PASS | FAIL | INFRASTRUCTURE_ERROR |
| --- | ---: | ---: | ---: |
| TypeScript | 653 | 5 | 0 |
| CPython 3.12 | 637 | 19 | 2 |
| CPython 3.13 | 637 | 19 | 2 |
| Java | 634 | 20 | 4 |

Native Audit regressions remain for Milestone 6. No full `check`/`verify` or
release completion is claimed. Focused mutation commands are
`node docs/tools/mutation-critical.js all approvals` and
`node docs/tools/mutation-native.js approval`; native compatibility uses
`FINKORE_PYTHON_PATH=.tools/bin/python3.13`. Maven coverage selects
`-Dtest=ApprovalsVectorCoverageTest` and no longer relies on a historical fixed
vector count.

Completion review: unit/native tests, conformance vectors, mutation-sensitive
checks, Python docstrings, Java API documentation, root/package README status,
conformance conventions, developer-tool usage, and traceability are synchronized.
Eight Approval requirements return to COVERED; 34 other requirements remain
PARTIAL. Existing specification and Agentic semantics already define these
rules. No normative requirement, portable error, canonical operation, TypeScript
API/JSDoc, adapter contract, architectural rule, AGENTS.md, CoreDoc, release note,
or package version change is needed.

## Milestone 6 — Native Audit value ownership and rejection

- [x] Remove Java's mutable numeric aliases from accepted Actor metadata,
      ordinary Changes, and other Audit JSON-copy entry points governed by the
      reviewed contract. Reject unsupported native values or retain exact
      independent values according to Milestone 1; never silently coerce them.
- [x] Reject cyclic native metadata and Change values in Python and Java with
      the context-specific portable errors. Distinguish cycles from valid shared
      acyclic references; include object and array/list cycles.
- [x] Exercise construction, history import, append, repeated observations, and
      redaction. Attempt to mutate both original inputs and exposed values, and
      verify committed Event meaning and source history remain unchanged.
- [x] Preserve JSON-member presence, explicit null, arbitrary member names,
      Boolean/number distinctions, declared Money comparisons, and prior Audit
      error precedence. Do not turn ordinary JSON numbers into Money.
- [x] Require exact portable-error assertions with failure atomicity. Stack
      overflow, recursion failure, timeout, and process termination cannot close
      these regressions or qualify as successful targeted mutant kills.
- [x] Run native/unit tests, all Audit vectors, applicable coverage, and critical
      numeric-alias/cycle-validation mutation probes. Update supported native
      value and defensive-observation API documentation.

Completion: no accepted value can mutate committed Audit history through an
alias, and unsupported cyclic/native values fail deterministically and portably.

### Milestone 6 completion and verification

Python and Java reject ancestor cycles with `FINKORE_AUDIT_ACTOR_INVALID` in
Actor context and `FINKORE_AUDIT_INVALID_EVENT` in ordinary Changes/Event
metadata. Traversal tracks ancestor identity, not every previously seen value,
so shared acyclic subobjects remain valid. Python validates all retained Event
JSON before Actor content, preserving the existing non-actor error priority.
No missing member, explicit null, JSON member name, Boolean/number distinction,
or declared Money comparison is normalized away.

Java accepts exactly the immutable numeric classes recorded in Milestone 1:
Byte, Short, Integer, Long, BigInteger, BigDecimal, and finite Float/Double.
Atomic numbers and unsupported subclasses are rejected without coercion. Direct
Change construction owns its values; Actor metadata, Change before/after, and
Event metadata accessors return defensive copies. Native tests mutate original
and exposed nested values, then observe the retained Event and history again.
Redaction evidence and returned redacted views cannot alter committed source
meaning through caller aliases.

Before the fix, the original Python cycle suite reported 18 errors; Java failed
31 of 32 Audit boundary cases. Expanded Python tests additionally reproduced
acceptance of cyclic/unsupported Event metadata and native error-priority
failures. A new Java test reproduced mutable record-accessor aliases. All these
regressions now pass without expected-failure markers. Cyclic Maps, Lists, and
nested cycles are exercised through construction, import, append, and redaction
evidence validation. Rejected appends/redactions leave logical history unchanged.

| Check | Result |
| --- | --- |
| Audit conformance, TypeScript / CPython 3.12 / CPython 3.13 / Java | 76 PASS each; no FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR |
| TypeScript Audit tests | 116 PASS |
| Python Audit unit/native tests | 15 methods PASS on each runtime, including 36 cycle boundary combinations, precedence, ownership, and redaction controls |
| Java Audit tests/coverage harness | 9 JUnit tests PASS, including existing native Audit checks and 66 boundary cases |
| Python Audit coverage, native tests plus real vectors | 90.42% statements, 79.45% branches, 86.49% combined |
| Java Audit coverage, native tests plus real vectors | 94.79% lines and 85.49% branches across Audit and its nested value/history types |
| Native Audit mutation probes | 18/18 killed: 16 new Python/Java probes plus two existing TypeScript JSON-member probes; all five Python probes also pass on CPython 3.13 |
| Critical portable Audit mutation probes | 13/13 killed |
| Other checks | Workspace build/strict TypeScript, Python compilation on both runtimes, Java strict compilation, developer-tool tests, architecture, documentation/traceability, license, and whitespace checks pass |

The Java native assertion helper no longer converts StackOverflowError into an
assertion failure. The mutation harness classifies it as infrastructure failure;
Python recursion failures retain the same classification. Temporary copies with
cycle detection deliberately disabled verified one infrastructure error and one
passing control on each language. Such failures are not counted as kills.
Targeted cycle mutants instead exercise silent acceptance/repair or the wrong
portable error, requiring the named regression to fail and a valid control to
pass. The focused results do not establish a whole-core mutation score.

Full-manifest results remain unchanged from Milestone 5: TypeScript has 653 PASS
and 5 FAIL; both Python runtimes have 637 PASS, 19 FAIL, and 2 infrastructure
errors; Java has 634 PASS, 20 FAIL, and 4 infrastructure errors. All 542 original
vectors still pass. The remaining portable failures belong to Milestone 7 Entity
cases; full `check`/`verify` and release closure remain pending.

Focused commands are `node docs/tools/mutation-native.js audit` and
`node docs/tools/mutation-critical.js all audit`. Python native compatibility
selects `python-audit` with `FINKORE_PYTHON_PATH=.tools/bin/python3.13`; Maven
coverage selects `-Dtest=AuditCoverageTest`.

Completion review: native/unit tests, mutation-sensitive cases, Python docstrings,
Java public API documentation, package/root README status, native conformance
conventions, developer-tool documentation, and traceability are synchronized.
Five Audit rows return to COVERED; 29 Entity/Workflow rows remain PARTIAL. The
76 existing Audit vectors already cover portable representation, comparison,
and precedence. Cycles, aliases, and native numeric classes cannot be encoded
in JSON, so their additional evidence is native. No new vector, normative rule,
portable error, canonical Agentic operation, TypeScript API/JSDoc, architecture,
AGENTS.md, CoreDoc, release note, or package version change is required.

## Milestone 7 — Entity binding, identity, and definition boundaries

- [x] Implement the reviewed versioned Entity binding contract across TypeScript,
      Python, and Java. Creation, reconstruction/import, lifecycle transitions,
      and relevant evolution observations must preserve the original binding.
      Reject mismatches without selecting a new definition as a repair.
- [x] Preserve binding through returned observations and subsequent operations;
      keep it distinct from Entity identity, business revision, and conflict
      version. Update fixture translation and serialization documentation only
      under the approved compatibility decision.
- [x] Correct revision/conflict identity handling in Python and Java according
      to the bounded contract, retaining any specified shared-meaning exception.
      Test independent expected-revision and expected-conflict-version checks.
- [x] Replace Java null-precondition crashes with the reviewed portable
      outcomes. Cover omission, null, malformed, matching, mismatching, and
      missing-observation cases without partial import results.
- [x] Apply the agreed retained-definition ownership rule to TypeScript Entity
      instances. Test original Workflow input and exposed definition references,
      plus relevant nested guards, declaration lists, mutability, and validators.
- [x] Reject unknown/malformed bounded validator declarations in Python and
      Java instead of skipping them. Preserve the distinction between invalid
      declarations and valid business rules that reject proposed financial data.
- [x] Re-run create/import/mutate/transition/evolution sequences with positive
      and negative controls. Preserve identity, validation completeness,
      currentness, history consistency, Audit correspondence, and failure
      atomicity from earlier releases.
- [x] Run Entity tests and vectors across all runtimes, applicable coverage, and
      mutation probes for binding loss, aliasing, precondition bypass, identity
      conflation, and skipped validation. Synchronize APIs, examples, and docs.

Completion: supported versioned Entity lifecycles remain usable across
observation boundaries, identity meanings stay distinct, and malformed
definitions/preconditions cannot silently pass or crash.

### Milestone 7 completion and verification

Entities now retain their original Workflow binding across creation, native
reconstruction/import, mutation, transition, and all four evolution observations.
Each owning core delegates binding validation to Workflow; adapters pass through
the explicit observation without deriving historical binding from the supplied
definition. Missing/malformed bindings produce WORKFLOW_INVALID_INSTANCE and
mismatches produce WORKFLOW_VERSION_MISMATCH. Unversioned observations retain
their previous shape.

Python and Java bounded imports now reject equal current-revision/conflict tokens
with ENTITY_INVALID_IDENTITY. The composing-specification shared-meaning exception
remains normative, but the bounded API has no declaration mechanism for it.
Expected revision and conflict tokens are checked independently. Java explicit
null expectations return ENTITY_STATE_CONFLICT without a null exception;
missing observed tokens cannot match an expectation. Malformed observed identities
remain identity errors. Python and Java validate every bounded validator declaration
before predicates, preserving INVALID_MUTATION versus VALIDATION_FAILED.

TypeScript FinancialEntity retains owned Workflow, nested guard, mutability,
and validator declarations. Its definition getter returns a defensive observation.
Native tests exercise both create/from boundaries, original/exposed references,
independently declared controls, and actual returned values reused across calls.
Entity ownership tests now live in test/entities/boundaries.test.ts so the existing
Stryker Entity glob executes them directly. Portable boundary dispatch remains in
the integration test; evolution harnesses select evolution operations explicitly.

Nine additional manifest vectors cover versioned mutation, all four evolution
results, malformed observed conflict tokens, independent revision/conflict checks,
and malformed declarations after a data-rejecting valid rule. Native tests also
reject missing/null/malformed/mismatched source and related bindings before any
changed Entity, evolution history, or Audit history becomes observable.
The existing complete-result validation, currentness, correspondence, history,
identity, and failure-atomicity regressions remain active.

| Check | Result |
| --- | --- |
| Full manifest, TypeScript / CPython 3.12 / CPython 3.13 / Java | 667 PASS each, including all 212 Entity vectors and all 542 original vectors; no FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR |
| Workspace check | Build, strict TypeScript, 130 runner tests, 836 TypeScript core tests, 19 TypeScript adapter tests, Python/Java native and adapter tests, developer-tool tests, architecture, docs/traceability, license, and whitespace pass |
| Python compatibility | Compilation, 209 native test methods, adapter tests and full conformance pass on CPython 3.13 |
| TypeScript full coverage | 99.67% lines, 99.39% branches, 100% functions; Entity files have 100% lines |
| Python native plus full conformance coverage | Configured gate passes at 91% combined; Entities 89% combined |
| Java Maven clean verify | Pass; Entities 90.91% lines and 78.35% branches, full bundle 91.87% lines |
| TypeScript Entity mutation | 400/406 killed, 98.52%; zero timeouts, uncovered mutants, or critical survivors |
| Python/Java critical Entity mutation | 62/62 killed, including 14 new binding, identity, validator and null-precondition probes; named regressions fail and paired controls pass |
| Native Entity mutation | 4/4 killed, including two new TypeScript declaration aliases and two existing currentness sequence probes; paired controls pass |

The six TypeScript survivors were reviewed: redundant conflict-token and Money
shape guards, private predicate catches with equivalent falsy returns, and a
diagnostic message. No binding, identity, validation, financial-value, or portable
error mutant survives; no exclusions or thresholds were changed. Ordinary Vitest
checks were rerun after Stryker finished to avoid discovering its temporary test
copies. One Java adapter subprocess emitted malformed output during a concurrent
check; its full 336-case readiness suite and the complete repository check passed
on rerun.

Completion review: native/unit tests, conformance vectors, mutation probes,
TypeScript JSDoc, Python/Java API documentation, package/root/adapter READMEs,
developer tools documentation, and traceability are synchronized. Of 29 reopened
Entity/Workflow rows, 28 return to COVERED; ENTITY-DEFINITION-002 becomes NOT
DIRECTLY TESTABLE by isolated JSON with passing native ownership and mutation
tests. Inventory: 413 requirements, 330 COVERED, 83 NOT DIRECTLY TESTABLE, no
PARTIAL or blocking-gap rows. Existing specification, fixture conventions, and
Agentic metadata already define the corrected behavior. No new normative rule,
portable error, canonical operation, architecture, AGENTS.md, CoreDoc, release
note, or package-version change is required. Full release mutation, packaging,
and clean-checkout closure remain Milestones 8 and 9.

## Milestone 8 — Mutation protection and complete verification

- [x] Wire every new native and portable regression into repeatable verification.
      Extend existing critical probe tools for all corrected failure mechanisms,
      including each lettered finding and the two Entity definition boundaries.
- [x] Require each targeted mutant to fail its named behavioral regression
      while its paired valid control executes and passes. Require passing
      unmodified baselines; reject missing results, skipped tests, empty suites,
      compilation failures, crashes, timeouts, and unrelated failures as proof.
- [x] Run full runner and TypeScript core mutation suites with the unchanged
      minimum 95 percent gate, plus all Python/Java critical and native API
      probes. Review every survivor and uncovered mutant; no critical financial
      mutant may survive. Do not relax scope or ignore meaningful logic to pass.
- [x] Run strict builds, unit/adapter tests, CPython 3.12/3.13 compatibility,
      coverage, and every manifest vector on TypeScript, both Python runtimes,
      and Java. Require zero failed, unsupported, or infrastructure outcomes.
- [x] Run isolated npm, Python wheel/sdist, and Java JAR consumer checks. Include
      representative corrected public API paths where existing import-only
      checks would miss serialization or ownership defects.
- [x] Run toolchain, architecture, documentation/traceability, license,
      developer-tool, and whitespace checks. New tools must follow the existing
      purpose/effects comment convention and remain local; add no GitHub Actions.
- [x] From a clean checkout of the intended candidate, install locked Node
      dependencies with `npm ci` and run the complete `npm run verify` using the
      prescribed Node 24, CPython 3.12/3.13, JDK 21, and Maven 3.9.x toolchains.
      Review dependency audit results separately from financial conformance.
- [x] Reassess coverage claims against actual native API, cross-domain sequence,
      and explicit-null tests. A passing aggregate score or manifest does not
      close an uncovered mandatory boundary or blocking specification gap.

Completion: the expanded candidate passes all configured gates from a clean
checkout, and every corrected critical failure mechanism is mutation-protected.

### Milestone 8 completion and verification

Every portable critical probe now declares its named failing regression and
independent passing controls, including 50 older probes whose evidence was less
specific. The classifier rejects unnamed kills; permanent developer-tool tests
fail against the previous classifier and pass against the corrected one. Full
suite baselines and mutant executions remain in scope. Missing/skipped/empty
results, compilation failures, crashes, timeouts, and unrelated failures cannot
satisfy a targeted probe.

The native gate now explicitly covers all four TypeScript Entity create/from
and input/observation ownership combinations. The full TypeScript Stryker run
also executes the portable boundary integration regressions; fixture discovery
works in both ordinary tests and isolated mutation copies. The complete verify
command repeats all 19 Python native probes on CPython 3.13.

Isolated consumers now exercise corrected public APIs through the installed npm
package, both Python wheel and sdist on both supported Python runtimes, and the
installed Java JAR. Checks include exact serialization and portable failures,
Entity binding reuse and declaration ownership, null preconditions, Approval
association validation, and native Audit ownership/cycle boundaries where
applicable. Consumers import only the installed public API and standard libraries.
No packages were published.

A fresh local candidate checkout installed locked dependencies with npm ci and
completed the entire npm run verify command successfully using Node 24.15.0,
CPython 3.12/3.13, JDK 21, and Maven 3.9.9. The checkout was clean before and after
verification. All executable files, configuration, and dependency locks match
this working candidate; the completion/status documentation was checked afterward.
The separate npm dependency audit reports zero vulnerabilities; no dependency
or financial behavior changes were made to obtain that result.

| Check | Result |
| --- | --- |
| Full manifest on TypeScript / CPython 3.12 / CPython 3.13 / Java | 667 PASS each; zero FAIL, UNSUPPORTED, or INFRASTRUCTURE_ERROR |
| Builds and tests | Strict builds, 130 runner tests, 836 TypeScript core tests, 19 TypeScript adapter tests, Python/Java native and adapter suites, and 13 developer-tool tests pass |
| Python compatibility | Compilation, 209 native test methods, adapter tests, full conformance, and 19/19 native mutation probes pass on CPython 3.13 |
| Runner coverage | 100% lines/functions, 96.61% branches |
| TypeScript core coverage | 99.67% lines, 99.39% branches, 100% functions |
| Python / Java coverage | Configured gates pass; Python 91% combined and Java 91.87% lines |
| Full runner mutation | 627 killed, 19 survivors, zero uncovered/timeouts; 97.06% |
| Full TypeScript core mutation | 4,035 killed, 16 pre-existing timeouts, 128 survivors, 10 uncovered; Stryker score 96.71%, or 96.32% with no timeout credit |
| Portable critical mutation | 176/176 named regressions killed with paired controls passing |
| Native API mutation | 50/50 killed: 8 TypeScript, 19 Python, 23 Java; paired controls pass |
| Isolated package consumers | npm, wheel and sdist on each Python runtime, and JAR: all six consumer executions pass |
| Repository checks | Toolchains, architecture, documentation/traceability, licenses, developer tools, and whitespace pass |
| Locked dependency installation and audit | Clean npm ci passes; zero reported vulnerabilities |

Every survivor and uncovered mutant was reviewed. Runner survivors affect
diagnostic text, source labels, redundant error wrapping, or record checks whose
required-field validation still rejects invalid input. Core survivors affect
diagnostic messages/class names/details, redundant guards with downstream
validation, or private representations discarded before observable results:

- Approval timestamp/record validation remains enforced downstream; normalized
  lifecycle states, synthetic keys, internal applicability flags, and discarded
  stage/actionable representations preserve public outcomes.
- Workflow identity and numeric guards remain covered by required-string and
  finite-value checks; null/primitive/array handling precedes redundant equality
  guards, and unversioned observations retain their defined shape.
- Audit numeric comparison receives finite validated JSON, optional metadata
  retains absence semantics, and fallback redaction entries cannot match valid
  paths or bypass public log validation.
- Entity currentness/effect comparisons preserve the defined source effect;
  Money values still undergo decoder validation, falsy private predicate returns
  reject, and conflict guards remain enforced through required revision checks.
- Uncovered clone-error and post-append defensive branches are unreachable from
  validated public histories; Money rounding modes are validated before dispatch.

No critical financial survivor remains. The 16 nonterminating Money/Approval
mutants already recorded in the 0.9.4 plan remain separately identified and do
not count as proof for any corrected targeted failure mechanism. The full core
score still exceeds 95% without timeout credit. Mutation scope, thresholds, and
all 69 existing ignored-mutant annotations are unchanged; no new exclusion was
introduced. Native ownership, explicit-null, and actual returned-value sequence
tests support the coverage claims, rather than aggregate percentages alone.

Completion review: verification tests/tools, package consumers, root/package
READMEs, and traceability status are synchronized. The inventory remains 413
requirements: 330 COVERED, 83 NOT DIRECTLY TESTABLE, no PARTIAL or blocking gaps.
No financial implementation or public API changed, so no new JSDoc, specification,
conformance vector, Agentic metadata, AGENTS.md, or CoreDoc change is required.
Release history, package versions, tags, and Core 1.0 promotion remain unchanged;
Milestone 9 owns final documentation and corrective release closure.

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
