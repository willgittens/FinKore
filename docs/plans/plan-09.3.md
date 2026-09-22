# FinKore Core 0.9.3 Plan

## Status

In progress. Milestone 1 is complete. The release-candidate review identified
Entity import, Workflow guard, and Audit portability findings; their contract
boundaries are now resolved, while regression coverage and implementation
corrections remain pending in Milestones 2 through 5. Stable Core 1.0 promotion
remains blocked until the corrective release gate below is satisfied;
[Core 1.0 planning](plan-10.md) may continue.

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
| Conformance comparison documentation | Conventions say runners compare Money numerically, while the runner compares adapter-normalized results exactly. | Align [Conformance Conventions](../../conformance/conventions.md) with the [runner contract](../../runner/README.md), preserving domain neutrality. |

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

- [ ] Convert every reproduced failure into permanent public-API tests and
      manifest-discovered vectors where the portable contract permits them.
      Resolve Milestone 1 decisions before assigning expectations to ambiguous
      cases. Do not depend on temporary review scripts.
- [ ] Give vectors stable IDs, requirement references, regression and
      mutation-sensitive metadata, exact results, and post-state observations.
- [ ] Cover Entity import with invalid positive-Money data, valid controls,
      and valid/invalid cross-field amount/limit observations. Check unchanged
      source observations and absence of partial imports after rejection.
- [ ] Cover Workflow Boolean/numeric distinctions in both directions, missing
      versus explicit null facts, nested structures, object order, array order,
      and multiple guards under the resolved contract. Preserve state, binding,
      revision, and supplied facts on rejection.
- [ ] Cover omitted, valid, empty, numeric, and null actor optional strings,
      including invalid supplied history and competing append errors. Require
      the existing actor error and precedence rules without partial history.
- [ ] Pair actor metadata omission and explicit null with ordinary metadata
      redaction cases under the resolved contract. Verify source history,
      actor identity/type, redaction evidence, and distinguishable presence.
- [ ] Cover Audit Boolean/numeric changes, nested containers, unchanged
      controls, omission/null distinctions, and object/array ordering. Add
      Money equality and actual amount/currency change cases through the
      domain-value boundary resolved in Milestone 1.
- [ ] Demonstrate failures against defective implementations before fixes,
      distinguishing incorrect results from Java process/infrastructure errors.
      Compare TypeScript, Python 3.12/3.13, and Java observations.
- [ ] Synchronize traceability, manifest-discovered counts, integration tests,
      and coverage helpers as vectors are added. Preserve previous regressions.

## Milestone 3 — Entity import and Workflow corrections

- [ ] Make Python Entity import enforce all applicable declared validators
      before returning an imported observation. Preserve identity, lifecycle,
      revision, mapping, conflict preconditions, and domain error precedence.
- [ ] Correct Workflow guard evaluation in each affected core according to the
      resolved comparison contract, including Java null handling and Python
      presence/type distinctions. Do not replace a runtime crash with an
      arbitrary successful or rejected outcome.
- [ ] Review adjacent callers of the corrected validation/comparison paths.
      Add a failing regression before fixing any additional confirmed defect;
      preserve existing Approval fact-comparison protections.
- [ ] Keep adapters free of validation and guard rules. Update affected public
      API documentation, JSDoc/docstrings, examples, and implementation claims
      alongside each correction.
- [ ] Run affected unit, adapter, and real conformance suites on all official
      implementations and both required Python versions.

## Milestone 4 — Audit corrections

- [ ] Enforce actor optional-string validation in Python and Java using
      `FINKORE_AUDIT_ACTOR_INVALID` and existing append error precedence.
- [ ] Preserve actor metadata presence in Java through parsing, serialization,
      and redaction under the clarified nullability contract. Failed redaction
      must not append evidence or modify committed source history.
- [ ] Correct Python Audit comparison so Boolean/numeric distinctions survive
      recursively; retain unchanged-value rejection and valid-change controls.
- [ ] Implement the resolved Audit domain-value comparison boundary across
      TypeScript, Python, and Java. Do not hide Money interpretation in adapters
      or guess a value's type from an incidental object shape.
- [ ] Verify immutable history, defensive observations, unchanged-value
      rejection, source preservation during redaction, and portable errors.
- [ ] Synchronize public API documentation and affected `/spec`, `/conformance`,
      `/agentic`, and README claims with the final behavior. Re-run affected
      unit, adapter, and Audit conformance suites across required runtimes.

## Milestone 5 — Mutation protection and complete verification

- [ ] Add targeted Python/Java probes for the corrected failure mechanisms:
      import validator bypass, guard coercion/presence errors, actor validation
      bypass, metadata presence loss, and Audit comparison defects. Add positive
      controls so rejecting every input cannot satisfy the regressions.
- [ ] Exercise meaningful changed TypeScript behavior through Stryker and
      permanent public-behavior tests. Review survivors, including comparison,
      error, state-preservation, and redaction branches.
- [ ] Require new critical probes to fail their named regression or positive
      control with valid conformance failures. Compilation failures, crashes,
      malformed reports, unsupported results, and infrastructure errors are not
      evidence that a financial mutant was killed.
- [ ] Run builds, strict TypeScript, unit/adapter tests, coverage gates, and the
      complete expanded manifest on TypeScript, Python 3.12/3.13, and Java.
      Require zero failures, unsupported cases, and infrastructure errors.
- [ ] Run both full Stryker suites at the existing minimum 95 percent gate and
      all configured critical probes. No critical financial mutant may survive;
      justify equivalent mutants without weakening meaningful tests or scope.
- [ ] Run documentation, traceability, architecture, license, and whitespace
      checks, plus isolated package/consumer checks for all three languages.
- [ ] Run `npm ci` and the complete `npm run verify` from a clean checkout of
      the intended release snapshot with the prescribed toolchains. Ensure new
      protections participate in the aggregate workflow; keep verification local.

## Milestone 6 — Documentation and corrective release

- [ ] Review CoreDoc, specifications, conformance claims, Agentic metadata,
      public API documentation, implementation READMEs, root README, and
      `AGENTS.md`. Update affected claims only, distinguishing implemented,
      passing conformance, unsupported, and not-yet-specified behavior.
- [ ] Keep Core release identity, implementation package versions, and
      conformance syntax versions distinct. Review constants, report labels,
      and consumer assertions for consistency with the corrective baseline.
- [ ] After verification, add a concise 0.9.3 summary to the single
      [release notes](../releases/README.md), including the existing Unreleased
      cross-field validation and redaction clarification changes. Keep detailed
      test and development history out of release summaries.
- [ ] Preserve repository-reference package publication status unless the
      maintainer changes the distribution decision. Creating this plan does
      not publish packages, create tags, or authorize remote release actions.
- [ ] Through the maintainer's release process, verify the intended commit and
      existing tag state, then create the annotated `core-0.9.3` tag only after
      all gates pass. Do not move an existing release tag; distinguish local
      tagging from remote publication in the completion status.
- [ ] Mark this plan complete and update Core 1.0 promotion prerequisites only
      when no known blocker remains. Do not describe corrective RC completion
      as stable Core 1.0 completion.

## Release gate

Core 0.9.3 is complete only when:

- [ ] Every finding above has a resolved contract and permanent regression
      coverage; no mandatory equality or nullability question remains open.
- [ ] Entity imports enforce declared validation and Workflow guards produce
      consistent portable outcomes without crashes or hidden state changes.
- [ ] Audit actor validation, metadata presence, redaction, and value comparison
      agree across languages while preserving history and domain meaning.
- [ ] Existing and new vectors, coverage gates, mutation gates, clean-checkout
      verification, and isolated package consumers pass on required runtimes.
- [ ] Traceability and public documentation describe the actual verified state,
      without unsupported full-conformance or stability claims.
- [ ] The concise release note and corrective release tag identify the verified
      snapshot, with no scope expansion, invented semantics, or architectural
      bypass introduced by the corrections.
