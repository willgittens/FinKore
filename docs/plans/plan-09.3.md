# FinKore Core 0.9.3 Plan

## Status

Complete locally. All six milestones and the corrective release gate pass. The
Entity import, Workflow guard, and Audit portability findings are resolved and
protected by permanent regressions. Clean-checkout verification passes across
all implementations, and the annotated local `core-0.9.3` tag identifies the
corrective snapshot. Remote publication remains pending GitHub authentication.
[Core 1.0 planning](plan-10.md) may continue; this release does not declare Core
1.0 stable.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) records foundation
obligations, and `/spec` defines precise financial behavior. Corrections follow
`SPEC-FREEZE-001` through `SPEC-FREEZE-004` and the compatibility rules in
[Specification Conventions](../../spec/conventions.md). This plan does not
choose unresolved financial semantics or declare a stable release.

## Objective and scope

Resolve the reproduced portability failures, clarify the comparison boundaries
needed to fix them, and retain permanent tests that prevent their recurrence.
The existing full verification workflow passed during the review despite these
findings. Passing the old suite alone cannot close this release.

Preserve the [0.9.2 corrections](plan-09.2.md), the subsequent cross-field
Entity validation regressions, and the distinction between implementation-defined
Audit redaction representations and conformance-only markers.

No new financial domain, general expression language, persistence mechanism,
authorization model, or agent execution mode is in scope. Preserve stable
requirement, vector, operation, and error identifiers. Any necessary contract
or public API change must be explicit, narrowly justified by a demonstrated
gap, and assessed for compatibility before implementation.

Financial rules belong in implementation cores. Adapters translate inputs and
observations; the runner remains domain-neutral. Do not infer a new universal
comparison rule from one language's native equality or from agreement between
two implementations.

## Findings to resolve

| Finding | Reproduced observation | Governing contract or decision needed |
| --- | --- | --- |
| Entity import validation | Python accepts an imported `-1 EUR` amount under a declared `positive-money` validator; TypeScript and Java reject it. | `ENTITY-IMPORT-002`, `ENTITY-IMPORT-008`, `ENTITY-VALIDATION-001`, `ENTITY-VALIDATION-004`, and `ENTITY-VALIDATION-006`. |
| Workflow guard comparison | Python accepts `1` against `equals: true` and a missing fact against `equals: null`. Java throws on an explicit null fact. TypeScript rejects independently supplied, structurally equal object facts. | `WORKFLOW-GUARD-001` through `WORKFLOW-GUARD-006`, `WORKFLOW-ERROR-001`, and `SPEC-JSON-001`; the supported equality fixture and its value/presence rules need an explicit boundary. |
| Audit actor validation | Python accepts empty or numeric `displayName` values. Java accepts explicit null for `type` and `displayName`. | `AUDIT-ACTOR-009` requires supplied optional strings to be non-empty; preserve `AUDIT-ERROR-004` precedence and failure atomicity. |
| Audit actor metadata presence | Java loses supplied `actor.metadata: null` and rejects its redaction; TypeScript and Python preserve its presence and redact it. | `AUDIT-ACTOR-006`, `AUDIT-REDACTION-002`, and `SPEC-NULLABILITY-001`; make the metadata nullability boundary explicit and preserve meaningful presence. |
| Audit value comparison | Python treats `true` and `1`, including nested values, as unchanged. All three implementations accept Money-shaped values `10.0 EUR` and `10.00 EUR` as a change. | `AUDIT-CHANGE-003` through `AUDIT-CHANGE-005`, `MONEY-REPRESENTATION-005`, and `MONEY-COMPARISON-002`; establish how domain-typed values are identified and compared before correcting Money-aware Audit equality. |
| Conformance comparison documentation | Conventions say runners compare Money numerically, while the runner compares adapter-normalized results exactly. | Align [Conformance Conventions](../../conformance/conventions.md) with the historical `runner/README.md` contract, preserving domain neutrality. |

The observations above establish failures or disagreements, not all expected
results. In particular, Workflow fixture equality and Audit domain-value
identification require specification review. Do not silently treat every object
with `amount` and `currency` members as Money, or introduce a production type
marker through conformance fixtures alone.

## Milestone 1 — Resolve specification and comparison boundaries

- [x] Review the affected Entity, Workflow, Audit, Money, shared, and Agentic
      contracts against CoreDoc, especially `CORE-002.2`, `CORE-002.3`,
      `CORE-003.4`, `CORE-005.2`, and `CORE-005.3`.
- [x] Distinguish implementation violations, fixture clarifications, and
      normative gaps. Correct traceability classifications where a mandatory
      observable behavior is not sufficiently specified; do not present a
      mapped vector as proof of complete boundary coverage.
- [x] Define the supported Workflow equality fixture precisely: fact presence,
      explicit null, Boolean versus numeric values, nested objects and arrays,
      object member order, and array order. Establish behavior for unsupported
      values and the applicable existing portable errors. Keep fixture syntax
      separate from the production guard contract and avoid a general DSL.
- [x] Clarify Audit comparison ownership and domain-value identification. State
      how declared Money values retain exact amount/currency semantics, how
      ordinary JSON values are compared, and how absence and explicit null
      remain distinct. Resolve malformed domain-value handling and error mapping
      before implementing or asserting new expectations.
- [x] Make actor metadata omission/nullability explicit without weakening the
      existing non-empty-string requirements for `type` and `displayName`.
- [x] Correct the conformance comparison wording: implementations perform
      domain operations, adapters expose the agreed normalized representations,
      and the runner compares those observations exactly. Explain trailing-zero
      and target-scale normalization without adding financial logic to the runner.
- [x] Apply necessary normative corrections in `/spec` with stable requirement
      references, compatibility assessment, and synchronized Agentic contracts
      where affected. Record fixture details in `/conformance`, not as an
      alternative financial specification.

Completed: 2026-09-22. Review against CoreDoc confirmed that its foundation
obligations do not change. Entity import validator enforcement is an
implementation correction under the existing `ENTITY-IMPORT-002` boundary;
the specification now makes the already-required complete validation and
`FINKORE_ENTITY_VALIDATION_FAILED` mapping explicit. The supported Workflow
fact-equality form remains a conformance fixture rather than a production DSL;
its missing/null, type, recursive object/array, ordering, unsupported-value, and
portable-error behavior is now defined in conformance conventions and reflected
in the canonical transition descriptor.

Audit now defines ordinary recursive JSON equality separately from explicitly
declared Money equality. `valueType: "MONEY"` is opt-in, malformed or unknown
declarations map to `FINKORE_AUDIT_INVALID_EVENT`, and incidental Money-shaped
objects remain ordinary JSON. Actor metadata may be omitted or supplied as any
JSON value including null; supplied presence survives observation and redaction,
while optional actor strings remain non-empty when supplied. These corrections
add `AUDIT-ACTOR-010`, `AUDIT-CHANGE-008`, and `AUDIT-CHANGE-009` without
changing portable error or operation identifiers. Agentic metadata is aligned.

Conformance documentation now assigns all financial comparison and
normalization to implementations, adapter observation to adapters, and only
exact recursive comparison to the runner. Traceability no longer treats the
existing positive and scalar vectors as complete boundary proof: eight rows are
PARTIAL and the three new requirements are UNCOVERED pending Milestone 2.
The standard build, typecheck, unit/adapter, architecture, documentation,
traceability, license, and whitespace check passes with 409 requirements and
296 vectors. No implementation behavior or conformance expectation was changed
in this milestone.

Completion requires explicit expected behavior for every unresolved case.
CoreDoc changes are needed only if a foundation obligation changes; use its
existing version fields and do not create separate alignment or review records.
Clear implementation corrections may proceed independently once their existing
governing requirements are confirmed.

## Milestone 2 — Permanent failing regressions

- [x] Convert every reproduced failure into permanent public-API tests and
      manifest-discovered vectors where the portable contract permits them.
      Resolve Milestone 1 decisions before assigning expectations to ambiguous
      cases. Do not depend on temporary review scripts.
- [x] Give vectors stable IDs, requirement references, regression and
      mutation-sensitive metadata, exact results, and post-state observations.
- [x] Cover Entity import with invalid positive-Money data, valid controls,
      and valid/invalid cross-field amount/limit observations. Check unchanged
      source observations and absence of partial imports after rejection.
- [x] Cover Workflow Boolean/numeric distinctions in both directions, missing
      versus explicit null facts, nested structures, object order, array order,
      and multiple guards under the resolved contract. Preserve state, binding,
      revision, and supplied facts on rejection.
- [x] Cover omitted, valid, empty, numeric, and null actor optional strings,
      including invalid supplied history and competing append errors. Require
      the existing actor error and precedence rules without partial history.
- [x] Pair actor metadata omission and explicit null with ordinary metadata
      redaction cases under the resolved contract. Verify source history,
      actor identity/type, redaction evidence, and distinguishable presence.
- [x] Cover Audit Boolean/numeric changes, nested containers, unchanged
      controls, omission/null distinctions, and object/array ordering. Add
      Money equality and actual amount/currency change cases through the
      domain-value boundary resolved in Milestone 1.
- [x] Demonstrate failures against defective implementations before fixes,
      distinguishing incorrect results from Java process/infrastructure errors.
      Compare TypeScript, Python 3.12/3.13, and Java observations.
- [x] Synchronize traceability, manifest-discovered counts, integration tests,
      and coverage helpers as vectors are added. Preserve previous regressions.

Completed: 2026-09-22. Milestone 2 adds 35 manifest-discovered regression
vectors: four Entity import cases, ten Workflow equality cases, and twenty-one
Audit actor, metadata/redaction, ordinary JSON, and declared Money cases. The
vectors include stable IDs, requirement references, regression and
mutation-sensitive tags, exact results, and failure observations. Public API
tests cover the same boundaries in TypeScript, Python, and Java without changing
implementation source behavior.

The 145-vector Entity, Workflow, and Audit comparison run reproduces the
pre-correction state as follows:

| Implementation | Pass | Fail | Infrastructure error | Reproduced boundary |
| --- | ---: | ---: | ---: | --- |
| TypeScript | 136 | 9 | 0 | Structural Workflow equality, declared Money semantics, and Entity import failure observations. |
| Python 3.12 | 129 | 16 | 0 | Entity import validator bypass, Workflow type/presence coercion, actor optional strings/precedence, JSON Boolean/number equality, and declared Money semantics. |
| Python 3.13 | 129 | 16 | 0 | Identical result and failing vector set to Python 3.12. |
| Java | 135 | 8 | 2 | Actor null-presence and declared Money semantics fail; `workflow.guard.explicit-null-pass-001` and `workflow.guard.multiple-structured-pass-001` crash the adapter process and are classified as infrastructure errors. |

The positive Entity controls pass on all three implementations; Java passes all
four new Entity import vectors. The public API suites independently reproduce
the defects: TypeScript has two targeted failures, Python 3.12 and 3.13 each
report nine assertion failures and three unexpected errors, Java Workflow
throws the expected pre-fix null dereference, Java Audit fails its actor
validation assertion, and Java Entity import passes.

Build, strict TypeScript, Python 3.12/3.13 compilation, Java compilation, the
130 runner tests, documentation/traceability checks, and whitespace checks
pass. The intentionally red TypeScript adapter coverage test discovers all
expanded suites and fails in the expected Audit, Workflow, and Entity groups.
Traceability now records 409 requirements, 331 vectors, and 327 covered
requirements, with no partial or uncovered rows. Passing corrections, coverage,
and mutation gates remain work for Milestones 3 through 5.

## Milestone 3 — Entity import and Workflow corrections

- [x] Make Python Entity import enforce all applicable declared validators
      before returning an imported observation. Preserve identity, lifecycle,
      revision, mapping, conflict preconditions, and domain error precedence.
- [x] Correct Workflow guard evaluation in each affected core according to the
      resolved comparison contract, including Java null handling and Python
      presence/type distinctions. Do not replace a runtime crash with an
      arbitrary successful or rejected outcome.
- [x] Review adjacent callers of the corrected validation/comparison paths.
      Add a failing regression before fixing any additional confirmed defect;
      preserve existing Approval fact-comparison protections.
- [x] Keep adapters free of validation and guard rules. Update affected public
      API documentation, JSDoc/docstrings, examples, and implementation claims
      alongside each correction.
- [x] Run affected unit, adapter, and real conformance suites on all official
      implementations and both required Python versions.

Completed: 2026-09-23. Python Entity import now applies the complete declared
validation set immediately after structural Entity validation and before
revision, mapping, and conflict-precondition processing, matching the existing
TypeScript and Java primary-error ordering. Rejected imports retain
`FINKORE_ENTITY_VALIDATION_FAILED`, do not mutate their supplied observation,
and return no partial import result. The TypeScript conformance adapter now
reports that caller-supplied source observation after failure without
duplicating any validator or financial rule.

TypeScript, Python, and Java Workflow guards now distinguish missing facts from
explicit null and compare supported JSON recursively with Boolean/number type
distinctions, order-independent object members, and order-sensitive arrays.
Java null values no longer crash the adapter process. The implementation keeps
comparison inside each core; adapters remain limited to request/result
translation. Adjacent Approval fact-comparison suites pass unchanged.

All 51 Workflow vectors and all 36 Entity vectors pass on TypeScript, Python
3.12, Python 3.13, and Java: 87/87 for each runtime, with zero unsupported or
infrastructure results. Targeted public-API verification passes 64 TypeScript
Entity/Workflow tests, 12 Python Entity/Workflow tests on each required runtime,
and the Java Workflow and Entity entry points. Approval protections pass 138
TypeScript tests, 10 Python tests per runtime, and the Java Approval entry
point. Python and Java adapter tests pass; the TypeScript adapter suite now has
only its intentionally pending Audit group failure.

The reduced 145-vector corrective baseline contains only Milestone 4 Audit
failures: TypeScript passes 141 with 4 failures, both Python versions pass 135
with the same 10 failures, and Java passes 137 with 8 failures. Every runtime
reports zero infrastructure errors. Build, strict TypeScript, Python 3.12/3.13
compilation, and Java compilation pass. No specification, conformance-vector,
Agentic, or traceability change is required because Milestone 1 already defines
the corrected behavior and Milestone 2 already supplies its permanent vectors.

## Milestone 4 — Audit corrections

- [x] Enforce actor optional-string validation in Python and Java using
      `FINKORE_AUDIT_ACTOR_INVALID` and existing append error precedence.
- [x] Preserve actor metadata presence in Java through parsing, serialization,
      and redaction under the clarified nullability contract. Failed redaction
      must not append evidence or modify committed source history.
- [x] Correct Python Audit comparison so Boolean/numeric distinctions survive
      recursively; retain unchanged-value rejection and valid-change controls.
- [x] Implement the resolved Audit domain-value comparison boundary across
      TypeScript, Python, and Java. Do not hide Money interpretation in adapters
      or guess a value's type from an incidental object shape.
- [x] Verify immutable history, defensive observations, unchanged-value
      rejection, source preservation during redaction, and portable errors.
- [x] Synchronize public API documentation and affected `/spec`, `/conformance`,
      `/agentic`, and README claims with the final behavior. Re-run affected
      unit, adapter, and Audit conformance suites across required runtimes.

Completed: 2026-09-23. Python and Java now reject supplied null, empty, or
non-string optional Actor strings with `FINKORE_AUDIT_ACTOR_INVALID` at the
existing precedence point. Java Actor observations retain a dedicated metadata
presence bit, so supplied `metadata: null` survives append and remains an
eligible redaction target without changing committed source history.

Ordinary Audit Change equality is recursive and preserves the JSON
Boolean/number distinction. TypeScript, Python, and Java apply Money semantics
only for explicit `valueType: MONEY`, validate each supplied non-null Money
value through the language's Money core, compare same-currency amounts exactly,
and treat different valid currencies as a recordable difference rather than a
currency-mismatch error. The declaration is retained in portable observations;
Money-shaped ordinary JSON remains ordinary JSON.

All 58 Audit vectors and the complete 145-vector Entity, Workflow, and Audit
corrective set pass on TypeScript, Python 3.12, Python 3.13, and Java with zero
failures, unsupported cases, or infrastructure errors. TypeScript passes 418
core tests and 15 adapter tests; Python passes 47 core tests and 4 adapter tests
on each required runtime; Java core entry-point tests and all 7 adapter tests
pass. Build and strict TypeScript checks pass. Public API and implementation
README documentation is synchronized. `/spec`, `/conformance`, and `/agentic`
were reviewed and need no Milestone 4 edit because Milestone 1 established the
contract and Milestone 2 added permanent vectors and traceability.

## Milestone 5 — Mutation protection and complete verification

- [x] Add targeted Python/Java probes for the corrected failure mechanisms:
      import validator bypass, guard coercion/presence errors, actor validation
      bypass, metadata presence loss, and Audit comparison defects. Add positive
      controls so rejecting every input cannot satisfy the regressions.
- [x] Exercise meaningful changed TypeScript behavior through Stryker and
      permanent public-behavior tests. Review survivors, including comparison,
      error, state-preservation, and redaction branches.
- [x] Require new critical probes to fail their named regression or positive
      control with valid conformance failures. Compilation failures, crashes,
      malformed reports, unsupported results, and infrastructure errors are not
      evidence that a financial mutant was killed.
- [x] Run builds, strict TypeScript, unit/adapter tests, coverage gates, and the
      complete expanded manifest on TypeScript, Python 3.12/3.13, and Java.
      Require zero failures, unsupported cases, and infrastructure errors.
- [x] Run both full Stryker suites at the existing minimum 95 percent gate and
      all configured critical probes. No critical financial mutant may survive;
      justify equivalent mutants without weakening meaningful tests or scope.
- [x] Run documentation, traceability, architecture, license, and whitespace
      checks, plus isolated package/consumer checks for all three languages.
- [x] Run `npm ci` and the complete `npm run verify` from a clean checkout of
      the intended release snapshot with the prescribed toolchains. Ensure new
      protections participate in the aggregate workflow; keep verification local.

Completed: 2026-09-23. The critical mutation harness now requires both the
named regression failure and every declared positive control to execute and
remain passing. Compilation failures, crashes, malformed reports, unsupported
results, and infrastructure errors remain invalid mutation evidence. New probes
cover Entity import validation, Workflow Boolean/number and missing/null
boundaries, Actor optional-string validation, Java metadata presence, and Audit
ordinary JSON and declared Money comparison. Python kills all 33 critical
mutants and Java kills all 34.

TypeScript public-behavior tests now exercise portable Audit JSON scalar and
container boundaries, non-finite and cyclic values, shared-value defensive
copies, declared Money null/absence semantics, and recursive Workflow guard
contrasts. The full TypeScript core Stryker suite passes at 96.31 percent and
the Conformance Runner suite at 97.06 percent, both above the unchanged 95
percent gate. No critical financial mutant survives.

Builds, strict TypeScript, 130 Runner tests, 424 TypeScript core tests, 15
TypeScript adapter tests, 47 Python core tests and 4 adapter tests on each
required Python runtime, Java core entry-point tests, 31 Java coverage tests,
and 7 Java adapter tests pass. The complete manifest passes 331/331 on
TypeScript, Python 3.12, Python 3.13, and Java with zero failures, unsupported
cases, or infrastructure errors. TypeScript coverage exceeds 99 percent for
statements and lines, Python and Java meet their configured 85 percent floors,
and npm, Python wheel/sdist, and Java JAR consumer checks pass.

Documentation, traceability, architecture, license, and whitespace checks pass.
A temporary clean Git snapshot of the intended Milestone 5 tree passes `npm ci`
and the complete local `npm run verify`; no workflow publishes artifacts or
changes remote state. Milestone 6 owns the concise release note and release tag.

## Milestone 6 — Documentation and corrective release

- [x] Review CoreDoc, specifications, conformance claims, Agentic metadata,
      public API documentation, implementation READMEs, root README, and
      `AGENTS.md`. Update affected claims only, distinguishing implemented,
      passing conformance, unsupported, and not-yet-specified behavior.
- [x] Keep Core release identity, implementation package versions, and
      conformance syntax versions distinct. Review constants, report labels,
      and consumer assertions for consistency with the corrective baseline.
- [x] After verification, add a concise 0.9.3 summary to the single
      [release notes](../releases/README.md), including the existing Unreleased
      cross-field validation and redaction clarification changes. Keep detailed
      test and development history out of release summaries.
- [x] Preserve repository-reference package publication status unless the
      maintainer changes the distribution decision. Creating this plan does
      not publish packages, create tags, or authorize remote release actions.
- [x] Through the maintainer's release process, verify the intended commit and
      existing tag state, then create the annotated `core-0.9.3` tag only after
      all gates pass. Do not move an existing release tag; distinguish local
      tagging from remote publication in the completion status.
- [x] Mark this plan complete and update Core 1.0 promotion prerequisites only
      when no known blocker remains. Do not describe corrective RC completion
      as stable Core 1.0 completion.

Completed locally: 2026-09-23. CoreDoc, `/spec`, `/conformance`, `/agentic`,
public API documentation, implementation READMEs, the root README, and
`AGENTS.md` were reviewed against the verified corrections. No further
financial-contract or development-rule change is required. The release
documentation distinguishes the `core-0.9.3` snapshot from the unchanged
`0.9-rc` behavioral baseline, unpublished `0.1.0` reference packages, and `0.1`
conformance syntax. Package publication remains unchanged.

The release documentation snapshot passed `npm ci` and the complete local `npm
run verify` from a clean checkout. Local tag inspection found no existing
`core-0.9.3`; the annotated tag identifies the final release commit while
preserving existing tags. Remote tag inspection could not authenticate to
GitHub, so this completion records a local release only. No known corrective
blocker remains, and Core 1.0 planning may continue as a separate stable-release
plan.

## Release gate

Core 0.9.3 is complete only when:

- [x] Every finding above has a resolved contract and permanent regression
      coverage; no mandatory equality or nullability question remains open.
- [x] Entity imports enforce declared validation and Workflow guards produce
      consistent portable outcomes without crashes or hidden state changes.
- [x] Audit actor validation, metadata presence, redaction, and value comparison
      agree across languages while preserving history and domain meaning.
- [x] Existing and new vectors, coverage gates, mutation gates, clean-checkout
      verification, and isolated package consumers pass on required runtimes.
- [x] Traceability and public documentation describe the actual verified state,
      without unsupported full-conformance or stability claims.
- [x] The concise release note and corrective release tag identify the verified
      snapshot, with no scope expansion, invented semantics, or architectural
      bypass introduced by the corrections.
