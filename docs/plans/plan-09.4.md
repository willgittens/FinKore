# FinKore Core 0.9.4 Plan

## Status

Milestones 1 and 2 are complete, including the accepted Entity decisions and
permanent failing regressions with valid controls. Implementation fixes have
not started; the expanded tests intentionally expose the defective baseline.
The review of `f39bbe1`
(`core-0.9.3`) reproduced the failures below after the complete existing
verification command passed. The earlier corrective releases remain historical
snapshots; their passing gates do not close these newly demonstrated defects.
[Core 1.0 promotion](plan-10.md) is blocked until this corrective release gate
is satisfied.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) records foundation
obligations, and `/spec` defines precise financial behavior. Corrections follow
`SPEC-FREEZE-001` through `SPEC-FREEZE-004` and the compatibility rules in
[Specification Conventions](../../spec/conventions.md). The plan does not
resolve undefined semantics, declare 1.0 stable, or authorize publication.

## Objective and scope

Correct Approval lifecycle preservation and validation, quorum effectiveness
evidence, Entity evolution validation and history, Workflow definition ownership
and fixture validation, and Audit JSON preservation. Protect the corrections
with permanent tests that exercise operation sequences, invalid combinations,
and paired valid controls.

Preserve the [0.9.2](plan-09.2.md) Money and Approval corrections and all
[0.9.3](plan-09.3.md) Entity import, cross-field validation, Workflow comparison,
Audit Actor, metadata, declared Money, and redaction protections.

No new financial domain, Approval policy, Workflow registry or migration,
distributed coordination, persistence, general expression language, or agent
execution mode is in scope. Do not infer eligibility from lifecycle labels or
introduce new duplicate, supersession, or currentness policies to make tests
pass. Preserve stable requirement IDs, portable error codes, canonical operation
IDs, and existing vector IDs.

Financial validation, currentness, effectiveness, and equality belong in cores.
Adapters translate fixture and observation shapes. The runner remains
domain-neutral and must not acquire financial rules or operation-specific
sequence logic. Language APIs may differ while implementing the same portable
behavior; conformance fixtures must be translated consistently.

## Starting evidence

The reviewed 0.9.3 snapshot passes 331 manifest vectors on TypeScript, CPython
3.12, CPython 3.13, and Java, with no unsupported or infrastructure outcomes.
Its full `npm run verify` passes builds, unit and adapter tests, coverage,
isolated package consumers, and repository checks. The configured mutation
results are 97.06 percent for the runner, 96.31 percent for the TypeScript core,
and 33/33 Python plus 34/34 Java critical probes killed.

Those are historical measurements of the existing suite, not acceptance targets
for this release. Additional probes reproduce financial failures despite those
results, including on Python 3.13. Permanent repository tests must replace the
temporary review probes; completion must not depend on `/tmp` files or a prior
conversation. Final vector and test counts follow the implemented coverage.

## Findings to resolve

Numbers correspond to the ten findings in the 0.9.3 readiness review. Lettered
rows separate failure mechanisms within a finding; these are planning labels,
not normative requirement or operation identifiers.

| Finding | Reproduced observation | Governing contract or boundary to review | Correction milestone |
| --- | --- | --- | --- |
| 1 — Approval history preservation | Python and Java discard lifecycle events when recording another Decision. A withdrawn approval for revision 3 becomes effective after recording a Decision for revision 4 that does not apply to revision 3, changing `PENDING` to `APPROVED`. | `APPROVAL-VALIDITY-001` through `APPROVAL-VALIDITY-004`, `APPROVAL-VALIDITY-010`, and `APPROVAL-VALIDITY-011`. | 3 |
| 2 — Quorum effectiveness evidence | Python and Java count approving Decisions with missing, null, or string-valued `effective`; TypeScript rejects them. | `APPROVAL-COMPOSITION-010`, `APPROVAL-COMPOSITION-024`, `APPROVAL-QUORUM-002`, and `APPROVAL-QUORUM-004`; the fixture consumes explicitly supplied current-effectiveness observations. | 3 |
| 3a — Lifecycle event type | A supplied withdrawal `type: "IGNORED"` overwrites the operation's event type in Python and Java. Withdrawal reports success while the Requirement remains approved. | `APPROVAL-VALIDITY-004` and `APPROVAL-VALIDITY-012`; review conflicting input members and related supersession operations without defining new lifecycle kinds. | 3 |
| 3b — Withdrawal target validity | Python and Java accept ambiguous targets and already-superseded Decisions. | `APPROVAL-VALIDITY-005` and `APPROVAL-VALIDITY-012`; retain the existing portable Approval errors. | 3 |
| 4 — Evolution Audit correspondence | Python and Java accept correction evidence with missing evolution metadata or relationship, wrong evolution kind, wrong affected Entity, or wrong relationship type. | `ENTITY-EVOLUTION-027`, `ENTITY-EVOLUTION-029`, and `ENTITY-EVOLUTION-031` through `ENTITY-EVOLUTION-033`; review correspondence validation and primary error selection. | 4 |
| 5a — Evolution currentness | With their accepted history envelope recording the source as non-current, Python and Java accept `expectedSourceCurrent: true`. They check the supplied Boolean rather than observed currentness. | `ENTITY-EVOLUTION-020`, `ENTITY-EVOLUTION-023`, and `ENTITY-EVOLUTION-025`; review revision and supersession-scope boundaries. | 4 |
| 5b — Evolution history fixtures | Python and Java reject a valid nonempty history array containing an unrelated prior relation. The duplicate-reversal negative vector can pass because nonempty history is rejected before its intended rule is reached. | `ENTITY-EVOLUTION-014`, `ENTITY-EVOLUTION-022`, and `ENTITY-EVOLUTION-023`; distinguish conformance input arrays from implementation history envelopes. | 4 |
| 6 — Evolution business validation | Python accepts a related correction Entity containing `-1 EUR` under a declared `positive-money` validator. TypeScript and Java reject it. | `ENTITY-VALIDATION-001`, `ENTITY-VALIDATION-004`, `ENTITY-VALIDATION-006`, and `ENTITY-EVOLUTION-023`. | 4 |
| 7 — Workflow definition ownership | All three implementations retain nested guard input references. Changing the caller's original `{approved: true}` to false changes transition behavior under the same bound version. | `WORKFLOW-VERSION-003`, `WORKFLOW-VERSION-009`, and `WORKFLOW-GUARD-004`; local defensive ownership is testable without a definition registry. | 5 |
| 8 — Audit JSON preservation | TypeScript drops scalar `__proto__` metadata, rejects object-valued `__proto__` metadata, and rejects a real Change between objects differing only in that member. | `AUDIT-ACTOR-010`, `AUDIT-CHANGE-005`, `AUDIT-CHANGE-008`, and `AUDIT-APPEND-001`. | 6 |
| 9 — Workflow guard validation | Python and Java accept empty fact names; Java crashes on `guard: null`; TypeScript rejects `guard` with `guards: []` although the conventions prohibit only a nonempty competing list. | The existing [guard fixture](../../conformance/conventions.md), `WORKFLOW-GUARD-001`, and `WORKFLOW-ERROR-001`; preserve portable definition-error precedence. | 5 |
| 10 — Default Workflow sequence fixture | Python and Java reject `definitionVersionIdentity: "1", versionSequence: "DEFAULT"`, validating the marker itself as an integer. The existing zero-version negative case lacks a valid counterpart. | `WORKFLOW-VERSION-005` and `WORKFLOW-VERSION-006`; distinguish the fixture's selector from its version position and from idiomatic public API shapes. | 5 |

Implementation agreement is evidence, not the source of financial semantics.
In particular, do not copy TypeScript error selection or history representation
without checking the governing contract.

## Milestone 1 — Contract review and traceability correction

- [x] Review the affected [Approval validity](../../spec/approvals/validity.md),
      [composition](../../spec/approvals/composition.md),
      [Entity evolution](../../spec/entities/evolution.md),
      [validation](../../spec/entities/validation.md),
      [Workflow versioning](../../spec/workflow/versioning.md),
      [guards](../../spec/workflow/guards.md),
      [Audit Actors](../../spec/audit/actors.md), and
      [Changes](../../spec/audit/changes.md) contracts against CoreDoc and the
      applicable domain error catalogs and Agentic metadata.
- [x] Classify each finding as an implementation violation, fixture translation
      defect, documentation inconsistency, or demonstrated normative gap.
      Record any required clarification in its owning document before choosing
      new expectations. Preserve existing identifiers and assess compatibility.
- [x] Resolve handling of conflicting lifecycle `type` members at the request
      boundary. Successful withdrawal must have withdrawal semantics; rejection
      must preserve history. Review the corresponding Decision and Requirement
      supersession boundaries without inventing new lifecycle policies.
- [x] Confirm the composition fixture's required Boolean effectiveness evidence
      and existing error precedence. Keep effectiveness derivation in its owning
      Approval operation; do not infer effectiveness from missing evidence or
      require a new history interpreter in the composition adapter.
- [x] Confirm Entity evolution Audit correspondence and primary error mapping,
      including valid generic Audit Events that lack required evolution meaning
      versus Events rejected by Audit itself. Resolve any ambiguity between
      Entity and Audit error ownership before assigning expected codes.
- [x] Confirm how supplied evolution history determines currentness for the
      exact Entity, Revision, and applicable supersession scope. Separate
      currentness conflicts from eligibility and declared duplicate policy.
      Specify fixture-to-API history translation in conformance documentation
      without standardizing a new production envelope.
- [x] Confirm Workflow fixture rules for empty fact names, explicit null guards,
      `guard` with empty/nonempty `guards`, and unsupported comparison values.
      Document the default-sequence selector and version-position boundary;
      keep arbitrary opaque version identities valid when that convention is
      not selected.
- [x] Reassess affected [traceability](../../conformance/traceability.md) rows.
      Use PARTIAL, UNCOVERED, or BLOCKING SPEC GAP where appropriate; one mapped
      rejection does not establish coverage of every mandatory boundary.
      Distinguish local Workflow definition ownership tests from the separate
      cross-definition registry guarantee.
- [x] Update `/spec`, `/conformance`, and `/agentic` only where the review shows
      a change is necessary. CoreDoc changes require a changed foundation
      obligation and its existing version fields; do not create separate
      alignment, provenance, or closure documents.

Completion: every finding has a governing requirement, an explicit portable
outcome or a documented blocking gap, and an identified test boundary. Unresolved
financial semantics block dependent implementation work.

### Review outcomes

The review covers the affected normative files, their domain error catalogs,
CoreDoc, conformance conventions and vectors, and canonical Agentic descriptors.
The requirements listed in the findings table remain the governing identifiers.
The table below records portable expectations and test boundaries; it does not
claim the implementations already satisfy them.

| Finding | Classification and outcome | Permanent test boundary |
| --- | --- | --- |
| 1 | Implementation violation. Recording a Decision preserves both Decision and committed lifecycle history. An unrelated revision's Decision does not reactivate withdrawn or superseded evidence. | Native withdraw/supersede → record → evaluate sequences, plus reconstructed-history vectors and a new eligible Decision control. |
| 2 | Implementation violation; fixture documentation clarified. Every supplied quorum Decision has explicit Boolean `effective`. Missing or malformed evidence returns `FINKORE_APPROVAL_INVALID_CHAIN` in the existing state/effectiveness priority category; `false` is valid ineffective evidence. | Missing/null/string/number/container evidence, `true`/`false` controls, decisive sibling/later-stage cases, and competing error categories. |
| 3a | Implementation violation; fixture translation clarified. The invoked lifecycle operation determines the event kind. The conformance request ignores redundant `type`, including conflicting values. Committed lifecycle event types remain meaningful and validated. Production APIs are not required to adopt this fixture envelope. | Withdraw, Decision supersede, and Requirement supersede with omitted/matching/conflicting/malformed request `type`; evaluate the actual resulting effect. |
| 3b | Implementation violation. Missing, ambiguous, withdrawn, or superseded withdrawal targets return `FINKORE_APPROVAL_INVALID_DECISION` without changing either history. | Each invalid target paired with exactly one valid target; observe both history and subsequent effectiveness. |
| 4 | Implementation violation for accepted mismatched evidence; the demonstrated combined-failure gap is resolved by `ENTITY-EVOLUTION-034`. Intrinsic Audit validation runs first and preserves its primary error. Valid Audit evidence with invalid evolution correspondence yields `FINKORE_ENTITY_INVALID_MUTATION`. | Each evolution kind with valid evidence, correspondence-only, Audit-only, and combined failures; primary-code and atomicity assertions. |
| 5a | Implementation violation for ignored unambiguous currentness; the contradictory-history gap is resolved by `ENTITY-EVOLUTION-035`. Reject unresolved contradictions with `FINKORE_ENTITY_INVALID_MUTATION`. A mismatch against consistent observed currentness returns `FINKORE_ENTITY_STATE_CONFLICT`, independently of eligibility. | Exact Entity/Revision/scope keys, consistent repeated observations, valid historical changes, unresolved contradictory changes, and unchanged-state assertions with and without expected currentness. |
| 5b | Fixture translation defect and misleading negative-test coverage. Nonempty history arrays are accepted and preserved when valid; only the declared duplicate policy or other actual invalidity justifies rejection. | An unrelated prior relation succeeds; an actual duplicate fails for its governing rule; native sequences reuse actual returned history. |
| 6 | Implementation violation. Full source and related/successor Business Validation applies to evolution; business-rule failure returns `FINKORE_ENTITY_VALIDATION_FAILED` unless a different domain failure is primary. | Invalid positive-money input paired with valid data; complete validation findings and atomic failure for all affected observations. |
| 7 | Implementation violation and traceability rationale correction. Nested caller or observation mutations cannot change retained definition-version semantics. Local ownership needs no registry. | Native tests mutate original and returned nested objects/arrays, then observe unchanged guard behavior, binding, state, and revision. |
| 8 | Implementation violation. Every own JSON member survives metadata preservation and participates in recursive Change comparison, including `__proto__` and `constructor`. A real change succeeds; unchanged content returns `FINKORE_AUDIT_INVALID_EVENT`. | Parsed JSON/native maps with scalar/object/array nesting, unequal/equal controls, and retained-history ownership observations. |
| 9 | Implementation and fixture translation defects. Empty fact names or null/malformed guards return `FINKORE_WORKFLOW_INVALID_DEFINITION` with existing definition-error priority. A valid `guard` plus `guards: []` is accepted; a nonempty competing list is rejected. Explicit null comparison values remain valid JSON. | Paired create/transition fixture cases, combined-invalidity priority, and no host exception substituted for a portable error. |
| 10 | Fixture translation defect. `DEFAULT` selects the convention; the version identity supplies a positive base-10 position. Valid positions are accepted, invalid selectors/positions return `FINKORE_WORKFLOW_INVALID_DEFINITION`, and omitted selectors retain opaque version identities. | Valid `1` and multi-digit positions paired with zero/leading-zero/sign/fraction/malformed cases and opaque non-default controls. |

### Accepted Entity decisions

The maintainer accepted both recommendations. The owning
[Entity evolution specification](../../spec/entities/evolution.md) now assigns
new stable IDs to the added observable obligations:

1. **Audit error priority — `ENTITY-EVOLUTION-034`:** Validate the supplied
   Audit history and candidate under `AUDIT-ERROR-004` before choosing an
   evolution-correspondence error. Preserve the primary Audit error when both
   fail; otherwise reject mismatched correspondence with
   `FINKORE_ENTITY_INVALID_MUTATION`. Validation does not commit either history.
   This does not impose a total order on unrelated Entity validation failures.
2. **Contradictory currentness — `ENTITY-EVOLUTION-035`:** Reject unresolved
   contradictory history with `FINKORE_ENTITY_INVALID_MUTATION`, independently
   of whether expected currentness is supplied. Compare expectations only with
   consistent observed currentness, using `FINKORE_ENTITY_STATE_CONFLICT` for a
   mismatch. Evaluate the exact Entity/Revision/scope and distinguish historical
   steps: valid declared evolution effects may change currentness. Do not choose
   a winner from timestamps, unexplained later assertions, or any prior `false`.

The conformance relation array declares local evolution-step order, and its
Boolean members are observations after each step. This makes valid
Supersession A → B → C distinguishable from an unexplained currentness change
without introducing a production history envelope or distributed ordering.
Unresolved contradictions are rejected; automatic conflict resolution and
implicit restoration remain outside scope.

Both specification gaps are closed. Coverage and implementation are still
pending, so Core 1.0 remains blocked. Milestone 2 can now assign portable expected
results for the dependent cases as well as the other findings.

### Compatibility and synchronization

The review clarifies existing financial obligations and the conformance-only
input vocabulary, and adds `ENTITY-EVOLUTION-034` and `ENTITY-EVOLUTION-035`
to resolve demonstrated ambiguities under `SPEC-FREEZE-001`. Existing requirement
IDs, portable error codes, operation IDs, vector IDs, and serialization version
`0.1` are preserved. No domain, expression language, production envelope,
registry, or automatic restoration policy is added.
Correcting accepted invalid inputs or rejected valid fixtures changes defective
implementation behavior; it does not establish that current consumers observe
identical behavior. Release documentation must describe those corrections when
implemented. The two accepted decisions are normative specification additions,
not editorial edits or version-neutral regression expectations under
`SPEC-COMPATIBILITY-014`. They select behavior for previously unspecified
combined failures and contradictory histories without replacing a previously
prescribed result or reusing an error category. Existing 0.9.3 implementations
may change primary errors or reject previously accepted input; do not advertise
behavioral compatibility for those cases. Complete the affected tests,
implementations, and documentation within this corrective release before its
release gate, as required by `SPEC-FREEZE-002`.

At Milestone 1, traceability recorded 290 COVERED, 37 PARTIAL, 2 UNCOVERED, 0 BLOCKING SPEC GAP,
and 82 NOT DIRECTLY TESTABLE requirements out of 411; all 331 vectors and their existing
requirement mappings are retained. Local Workflow ownership remains a native
test obligation even where isolated JSON vectors cannot express aliasing.

CoreDoc's foundation obligations are unchanged, so its rules and version fields
need no edit. Specification clarifications, conformance conventions, Agentic
metadata, and README coverage claims are synchronized. No code, public API,
JSDoc, vector, or mutation-test implementation changes belong to this milestone;
those updates remain required by Milestones 2–7. AGENTS.md and release history
need no change for this contract review.

## Milestone 2 — Permanent failing regressions and positive controls

- [x] Reproduce every finding through public APIs before fixing it. Add
      manifest-discovered vectors wherever the behavior is expressible by the
      existing conformance contract. Give new vectors stable IDs, requirement
      references, regression and mutation-sensitive metadata, and exact results.
- [x] Add public-API sequence tests that pass actual results into subsequent
      operations: withdraw or supersede, record another Decision, then evaluate;
      evolve an Entity, retain history, then evaluate a later request. Static
      reconstructed-history vectors supplement these tests rather than proving
      that operations preserve each other's outputs.
- [x] Pair invalid lifecycle, effectiveness, evolution-evidence, history,
      validation, guard, and default-version cases with minimally different valid
      controls. In particular, prove that a nonempty unrelated evolution history
      succeeds and that a valid default version position is accepted.
- [x] Cover `ENTITY-EVOLUTION-034` with Audit-only, correspondence-only,
      combined-invalidity, and fully valid controls, including invalid supplied
      Audit history, invalid Actor, duplicate Event, and invalid Relationship.
      Do not introduce expectations for unrelated cross-domain error ordering.
- [x] Cover `ENTITY-EVOLUTION-035` with conflicting observations within one
      step, unexplained changes between steps, and observations inconsistent
      with their evolution kind. Include repeated consistent observations,
      valid Void and Supersession sequences, exact-key and different-key
      controls, omitted/supplied expected currentness, and actual output reuse.
      Verify atomic rejection and distinguish it from a known-currentness
      precondition mismatch.
- [x] Exercise immutable Workflow ownership in native public-API tests: mutate
      original nested objects and arrays after creation/import, and mutate
      returned definition/transition observations where APIs expose them. Verify
      the retained version, predicate, state, and revision are unchanged.
      These aliasing checks cannot be replaced by isolated JSON requests.
- [x] For Audit key preservation, construct genuine own `__proto__` members
      using parsed JSON or equivalent native maps. Do not accidentally test a
      JavaScript object literal that changes a prototype instead of containing
      the intended member. Preserve exact member presence and values.
- [x] Observe failure atomicity as well as error codes: Decisions, lifecycle
      evidence, Entity data and revisions, currentness, evolution relations,
      Workflow binding and facts, and Audit history must remain unchanged where
      the contract requires it. Assert that no partial result is returned.
- [x] Run new tests against the defective baseline on TypeScript, Python 3.12,
      Python 3.13, and Java. Distinguish assertion failures and portable errors
      from crashes, timeouts, and other infrastructure failures. A Java null
      crash is a defect to fix, not a valid conformance rejection.
- [x] Synchronize discovery counts, adapter integration expectations, language
      coverage helpers, and traceability as vectors are added. Keep existing
      regressions and require all paired controls to execute.

Completion: every reproduced mechanism has permanent failing coverage at the
appropriate boundary, plus controls that prevent unrelated rejection from
masquerading as the intended validation.

### Milestone 2 outcome

Added 201 manifest-discovered regression/control vectors: 40 Approvals,
32 Workflow, 12 Audit, and 117 Entities. The manifest now contains 532 vectors.
The new files are `readiness-regressions.json` in each affected conformance
domain. All include stable IDs, requirement references, regression and
mutation-sensitive tags, and plausible defect descriptions. The 65 successful
controls are executed alongside the rejection cases, including controls that
the defective baseline itself rejects.

Native `readiness` tests in all three cores exercise actual lifecycle → record
→ evaluate and Void → Correction outputs, nested object/array ownership through
Workflow creation/import and exposed observations, declaration-array ownership,
and failure atomicity. Adapter tests discover the new files through the
manifest. Runner inventory assertions and Java coverage helpers are synchronized;
Maven also discovers the Java native regressions. Traceability records 329
vector-covered and 82 not-directly-vector-testable requirements out of 411.
Coverage does not claim implementation success.

The full expanded manifest was executed against the unfixed implementations:

| Runtime | PASS | FAIL | UNSUPPORTED | INFRASTRUCTURE_ERROR |
| --- | ---: | ---: | ---: | ---: |
| TypeScript | 495 | 37 | 0 | 0 |
| CPython 3.12 | 430 | 102 | 0 | 0 |
| CPython 3.13 | 430 | 102 | 0 | 0 |
| Java | 435 | 94 | 0 | 3 |

All 331 pre-existing vectors still pass on every runtime. Java's three
infrastructure outcomes are reproduced `NullPointerException` failures for
explicit null guard fixtures, including the combined-invalid-state case; they
are not counted as successful portable rejections. Duplicate-Audit controls use
a distinct relationship target to isolate duplicate identity from self-targeting
validation. Nonempty-history negative
cases must be assessed together with their failing valid controls so a blanket
history rejection cannot masquerade as currentness or duplicate-policy support.

Builds, strict TypeScript, Java stdlib and Maven test compilation, toolchain
verification, all 130 runner tests, developer-tool tests, documentation,
traceability, architecture, license, and whitespace checks pass. Core and
adapter suites execute with expected new regression failures on each required
runtime. TypeScript's new native suite has 17 failures and 7 passes; Python and
Java native runs expose lifecycle preservation, Workflow aliasing, and observed
currentness failures. No financial implementation, runner dispatch, or existing
regression expectation was changed to make these tests pass.

Coverage percentage and mutation scoring are not claimed for this deliberately
failing TDD baseline. Restore relevant green suites in the corrective milestones
before running their coverage and mutation gates; the final release still
requires the complete verification command. CoreDoc, public API signatures,
JSDoc, Agentic semantics, AGENTS.md, and release history need no additional
change for this test-only milestone; README status and conformance traceability
now describe the failing expanded suite.

## Milestone 3 — Approval lifecycle and quorum corrections

- [ ] Preserve both Decision history and all committed lifecycle evidence when
      recording another Decision in Python and Java. Verify withdrawal,
      Decision supersession, and Requirement supersession remain effective
      across subsequent recording and observation round trips.
- [ ] Retain the revision-3 withdrawal/revision-4 recording regression: revision
      3 remains pending when the new Decision does not apply. Add valid controls
      proving a new effective eligible Decision can still satisfy a Requirement
      under the existing rules. Do not make withdrawal a permanent blanket ban.
- [ ] Prevent caller fields from silently changing the lifecycle operation's
      effect under Milestone 1's resolved boundary. Cover omitted, matching,
      unknown, and conflicting `type` members for withdrawal and adjacent
      supersession paths. Verify the subsequent effectiveness result, not only
      the returned lifecycle event label.
- [ ] Require withdrawal targets to resolve to exactly one committed Decision.
      Reject missing, ambiguous, already-withdrawn, and already-superseded
      targets using existing errors, preserving all prior evidence. Retain
      valid single-target controls and the existing Actor eligibility boundary.
- [ ] Validate quorum effectiveness observations before outcome calculation.
      Missing, null, string, numeric, or other malformed evidence must not count
      as an effective vote. Preserve valid `true` and `false` behavior, distinct
      voters, ineligible-decision exclusion, and opposing-evidence rules.
- [ ] Apply required evidence validation across all declared branches and later
      stages, including when another branch already determines an outcome.
      Preserve `APPROVAL-ERROR-010` priority and actionable-requirement ordering.
- [ ] Review adjacent Approval callers for dropped lifecycle evidence and
      missing-evidence defaults. Fix additional confirmed defects only after
      retaining a failing regression; preserve the prior exact fact-comparison
      and timestamp protections.
- [ ] Update affected public API documentation, JSDoc/docstrings, examples, and
      implementation README claims. Run Approval unit, adapter, sequence, and
      real conformance tests on every required runtime.

Completion: successful lifecycle operations have their declared effect,
recording preserves committed evidence, invalid targets fail atomically, and
quorum approval requires valid explicit effectiveness evidence.

## Milestone 4 — Entity evolution validation and history corrections

- [ ] Implement `ENTITY-EVOLUTION-034` in TypeScript, Python, and Java: perform
      intrinsic Audit validation before evolution correspondence and preserve
      its primary error when both fail. Retain atomicity across both histories.
- [ ] Implement `ENTITY-EVOLUTION-035` in all three cores at history import and
      operation-result boundaries. Reject unresolved currentness contradictions
      without requiring an expected-currentness precondition; accept consistent
      effect-driven history changes. Keep this validation out of adapters.
- [ ] Validate required Audit correspondence for correction, reversal, void,
      and supersession in Python and Java: evolution kind, source identity and
      revision, related identity and revision when applicable, relation identity,
      affected Entity, supersession scope when applicable, and the corresponding
      Audit Relationship. Reuse Audit's own Event and relationship validation.
- [ ] Pair each missing or mismatched evidence case with valid evidence for the
      same evolution kind. Preserve established primary errors for invalid
      Audit Events and Milestone 1's resolved mapping for invalid correspondence.
      Failure must leave both Audit and evolution observations unchanged.
- [ ] Translate existing conformance history arrays into each core's accepted
      API representation without financial rules in adapters. Cover empty and
      nonempty histories, successful operations with unrelated prior relations,
      preservation of earlier relations, and subsequent consumption of outputs.
- [ ] Determine observed currentness from validated history for the applicable
      Entity, Revision, and scope before comparing an explicit expectation.
      Cover true/false matches and mismatches, omitted expectations, prior void
      and supersession evidence, and unrelated history. A matching expectation
      does not override a separate eligibility failure.
- [ ] Ensure duplicate relation/reversal regressions reach the intended domain
      check after successful history parsing. Pair rejection with a permitted
      operation using the same nonempty history structure. Preserve declared
      duplicate policies; do not invent a universal reversal restriction.
- [ ] Apply all declared Entity business validators to source and related or
      successor observations wherever required by the governing contract. Fix
      Python's positive-Money bypass and test the existing cross-field validator
      against complete observations. Preserve established validation and
      domain-error precedence without mutating source financial facts.
- [ ] Verify histories, identities, revisions, scopes, currentness, and original
      financial facts survive success and failure exactly. Use the existing
      correction/reversal relation semantics; add no accounting posting effects.
- [ ] Update affected API documentation, examples, and README claims. Run Entity,
      Audit, and relevant Workflow unit, adapter, sequence, and conformance tests
      across all required runtimes.

Completion: evolution enforces business validity, checks observed currentness,
preserves usable history, and commits only corresponding valid Audit evidence
with an atomic evolution result.

## Milestone 5 — Workflow ownership and fixture corrections

- [ ] Make retained definitions independent of caller-owned nested guard values
      in TypeScript, Python, and Java. Protect exposed observations as well as
      construction inputs; a shallow container copy or a read-only annotation
      alone does not establish immutable ownership.
- [ ] Test both acceptance and rejection after attempts to mutate nested guard
      objects, arrays, and exposed transitions. Cover creation and import with
      versioned definitions and preserve unversioned behavior. The same facts
      must yield the same predicate result under the retained bound definition.
- [ ] Enforce nonempty fact names and the supported JSON comparison boundary.
      Reject explicit null/malformed guards with the existing portable definition
      error, eliminating Java's `List.of(null)` crash. Cover missing versus null
      `equals`, valid explicit-null comparisons, and multiple guards.
- [ ] Align `guard` plus `guards: []` and the invalid nonempty combination with
      the resolved fixture contract. Keep all presence/type checks in the core
      boundary that owns definition validation.
- [ ] Correct default-sequence fixture translation and validation: the selector
      chooses the convention and the version identity supplies the position.
      Cover valid `1` and later positive positions, zero and malformed positions,
      invalid selectors, and opaque version identities without the convention.
      Do not add global sequence tracking or migration authority.
- [ ] Preserve recursive type-sensitive equality, object/array ordering rules,
      missing/null distinctions, version binding, conflict checks, and failure
      atomicity established by earlier corrections.
- [ ] Update public API documentation and fixture descriptions, including any
      compatibility-relevant constructor or observation changes. Run Workflow
      and composing Entity tests and conformance on all required runtimes.

Completion: caller mutation cannot change a retained definition, supported
fixtures behave consistently, and malformed definitions produce portable errors
without changing instance state or binding.

## Milestone 6 — Audit JSON preservation corrections

- [ ] Preserve arbitrary supported own JSON member names in TypeScript Actor
      metadata and Change values without invoking prototype setters. Do not
      filter, rename, drop, or assign domain meaning to `__proto__`, `constructor`,
      or other ordinary JSON member names.
- [ ] Cover scalar, null, object, and array values under those names, nested
      containers, and shared caller references. Check exact observations after
      construction, append, history import, and repeated serialization.
- [ ] Pair genuinely changed objects differing only in such a member with equal
      controls that must still be rejected as unchanged. Preserve Boolean/number
      distinctions, absent/null semantics, and explicitly declared Money rules.
- [ ] Verify defensive observations and committed-history immutability, Actor
      identity and metadata presence, redaction source preservation, and absence
      of prototype side effects. Preserve existing rejection of unsupported
      non-JSON values rather than silently normalizing them.
- [ ] Review adjacent Audit copying paths for the same mechanism. Extend to
      other domain paths only when a concrete contract violation is reproduced
      and covered; avoid an unrelated generic utility refactor.
- [ ] Update affected public documentation and run Audit unit, adapter, and
      conformance suites on all required runtimes, including controls proving
      Python and Java preserve the same portable observations.

Completion: supported JSON members survive Audit processing exactly and cannot
silently disappear, create false equality, or change retained history.

## Milestone 7 — Mutation protection and complete verification

- [ ] Extend critical mutation protection for every corrected failure mechanism:
      lifecycle evidence loss, lifecycle type override, ambiguous/superseded
      target acceptance, malformed effectiveness counted as approval, evolution
      evidence mismatch, constant currentness, rejected valid nonempty history,
      business-validator bypass, mutable guard aliases, malformed guard handling,
      default-sequence misvalidation, and unsafe Audit key copying.
- [ ] Require each new targeted probe to fail its named behavioral regression
      while paired valid controls execute and pass. Compilation failures,
      process crashes, unsupported outcomes, malformed reports, empty suites,
      and unrelated rejection are not valid kills. Preserve and extend existing
      mutation-classification tests if the harness changes.
- [ ] Include public-API sequence and aliasing tests in mutation verification.
      Where isolated JSON vectors cannot expose a defect, add narrowly scoped
      public-API mutation probes and wire them into `npm run verify`; do not add
      financial sequence logic to the runner or waive these cases.
- [ ] Run full runner and TypeScript core Stryker suites with the unchanged
      minimum 95 percent gate and all Python/Java critical probes. Review every
      survivor and uncovered mutant; no critical financial mutant may survive.
      Justify equivalent mutants explicitly without weakening meaningful scope.
- [ ] Run builds, strict TypeScript, unit and adapter tests, Python 3.12/3.13
      compilation and compatibility checks, coverage, and every expanded
      manifest vector on TypeScript, both Python runtimes, and Java. Require
      zero failed, unsupported, or infrastructure conformance results.
- [ ] Verify normalized portable observations as well as outcomes, especially
      history preservation, currentness, error precedence, and special-key
      presence. Re-run all earlier Money and cross-domain regressions.
- [ ] Run isolated npm, Python wheel/sdist, and Java JAR consumer checks,
      documentation and traceability checks, architecture and license checks,
      developer-tool tests, and whitespace validation. Update affected coverage
      helpers and discovery assertions to include every added vector.
- [ ] From a clean checkout of the intended candidate, install locked Node
      dependencies with `npm ci` and run the complete `npm run verify`. Use the
      prescribed Node 24, CPython 3.12/3.13, JDK 21, and Maven 3.9.x toolchains;
      bootstrap missing runtimes under `.tools` according to `AGENTS.md`.
- [ ] Reassess traceability and release claims against the new tests. Mandatory
      uncovered boundaries and unresolved specification gaps remain blockers
      even when aggregate coverage, mutation, and conformance totals pass.

Completion: the expanded regressions and controls participate in repeatable
local verification, all configured gates pass, and no corrected critical
failure mechanism survives mutation testing.

## Milestone 8 — Documentation and corrective release

- [ ] Review unit/conformance/mutation tests, public JSDoc and other API
      documentation, examples, implementation READMEs, root README, `/spec`,
      `/conformance`, `/agentic`, CoreDoc, and `AGENTS.md`. Update every affected
      artifact; keep unrelated normative behavior and architecture unchanged.
- [ ] Describe implemented behavior, passing conformance, unsupported behavior,
      and deferred semantics accurately. Retain the distinction between a
      passing finite manifest and exhaustive financial boundary coverage.
- [ ] Keep Core release identity, implementation package versions, and
      conformance syntax versions distinct. Review Core constants, package
      metadata, report labels, and consumer assertions for the final corrective
      baseline without prematurely promoting any of them to stable 1.0.
- [ ] After verification, add a concise 0.9.4 summary to the single
      [release notes](../releases/README.md). Keep detailed test, mutation, and
      development history in the existing tools and Git; add no separate audit,
      closure, checksum, or provenance reports and no GitHub Actions.
- [ ] Preserve repository-reference package publication status unless the
      maintainer changes that decision. Creating this plan does not publish
      packages, create tags, or authorize remote actions.
- [ ] Through the maintainer's release process, verify the intended commit and
      existing tag state, then create the annotated `core-0.9.4` tag only after
      all gates pass. Preserve existing tags and distinguish local release
      completion from remote publication and authentication availability.
- [ ] Verify the final release documentation snapshot from a clean checkout.
      Mark this plan complete and update [Core 1.0 prerequisites](plan-10.md)
      only when every finding and the release gate below are closed. Stable
      1.0 promotion remains a separate task.

## Execution dependencies

Milestone 1 establishes the contract for each correction. Milestone 2 supplies
failing regressions before implementation. Milestones 3 through 6 may proceed
independently once their contract decisions and tests are ready; Entity evolution
must also exercise its Audit and Workflow dependencies. Milestone 7 verifies the
combined candidate, and Milestone 8 finalizes only that verified state.

Record completion in this plan only after the relevant checks pass. A newly
demonstrated adjacent financial defect requires its own failing regression and
contract review before correction; unresolved defects prevent closure rather
than being hidden by the previous release's passing measurements.

## Release gate

Core 0.9.4 is complete only when:

- [ ] Every finding above, including each lettered failure mechanism, has a
      resolved contract, permanent regression, and appropriate valid control.
- [ ] Approval operations preserve lifecycle evidence, perform their declared
      effects, reject invalid targets, and count only valid effective votes.
- [ ] Entity evolution enforces business validation, consumes existing history,
      compares expectations with observed currentness, and requires matching
      Audit evidence without partial state.
- [ ] Workflow definitions retain immutable semantics under caller mutation,
      and guard/default-sequence fixtures agree across implementations without
      process crashes.
- [ ] Audit preserves supported JSON keys and values, exact equality semantics,
      defensive observations, and committed history.
- [ ] Sequence and aliasing tests participate in verification, and invalid cases
      cannot pass merely because an earlier unrelated check rejects all inputs.
- [ ] Every manifest vector passes on TypeScript, Python 3.12, Python 3.13,
      and Java with zero failed, unsupported, or infrastructure outcomes.
- [ ] Coverage, mutation, package-consumer, repository, and clean-checkout
      verification gates pass with no surviving critical financial mutant.
- [ ] Traceability and documentation reflect the actual corrected behavior,
      with no uncovered mandatory boundary or blocking specification gap.
- [ ] The concise release note and corrective tag identify the verified
      snapshot, preserving publication choices and prior release identities.
- [ ] No new domain, invented financial policy, architectural bypass, or
      premature Core 1.0 stability claim was introduced.
