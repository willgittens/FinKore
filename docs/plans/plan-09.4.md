# FinKore Core 0.9.4 Plan

## Status

Milestones 1–7 are complete. Approval, Entity, Workflow, and Audit corrections,
permanent regressions, and mutation protection pass complete verification from
a clean candidate checkout. All 542 vectors pass on TypeScript, Python
3.12/3.13, and Java, with zero failed, unsupported, or infrastructure outcomes.
The four Audit cycle-validation mutants are now behavioral kills. Milestone 8
and release promotion remain open; two moderate Stryker dependency advisories
remain a development-tool dependency-review follow-up.
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

- [x] Preserve both Decision history and all committed lifecycle evidence when
      recording another Decision in Python and Java. Verify withdrawal,
      Decision supersession, and Requirement supersession remain effective
      across subsequent recording and observation round trips.
- [x] Retain the revision-3 withdrawal/revision-4 recording regression: revision
      3 remains pending when the new Decision does not apply. Add valid controls
      proving a new effective eligible Decision can still satisfy a Requirement
      under the existing rules. Do not make withdrawal a permanent blanket ban.
- [x] Prevent caller fields from silently changing the lifecycle operation's
      effect under Milestone 1's resolved boundary. Cover omitted, matching,
      unknown, and conflicting `type` members for withdrawal and adjacent
      supersession paths. Verify the subsequent effectiveness result, not only
      the returned lifecycle event label.
- [x] Require withdrawal targets to resolve to exactly one committed Decision.
      Reject missing, ambiguous, already-withdrawn, and already-superseded
      targets using existing errors, preserving all prior evidence. Retain
      valid single-target controls and the existing Actor eligibility boundary.
- [x] Validate quorum effectiveness observations before outcome calculation.
      Missing, null, string, numeric, or other malformed evidence must not count
      as an effective vote. Preserve valid `true` and `false` behavior, distinct
      voters, ineligible-decision exclusion, and opposing-evidence rules.
- [x] Apply required evidence validation across all declared branches and later
      stages, including when another branch already determines an outcome.
      Preserve `APPROVAL-ERROR-010` priority and actionable-requirement ordering.
- [x] Review adjacent Approval callers for dropped lifecycle evidence and
      missing-evidence defaults. Fix additional confirmed defects only after
      retaining a failing regression; preserve the prior exact fact-comparison
      and timestamp protections.
- [x] Update affected public API documentation, JSDoc/docstrings, examples, and
      implementation README claims. Run Approval unit, adapter, sequence, and
      real conformance tests on every required runtime.

Completion: successful lifecycle operations have their declared effect,
recording preserves committed evidence, invalid targets fail atomically, and
quorum approval requires valid explicit effectiveness evidence.

### Milestone 3 outcome

Python and Java now preserve committed lifecycle evidence when recording a
Decision, enforce the requested lifecycle operation despite ancillary `type`,
reject non-unique or already invalidated withdrawal targets, and require
explicit Boolean quorum effectiveness. Python's adapter also omits empty
lifecycle observations consistently with the fixture convention. TypeScript
Approval financial code required no change.

Verification:

- All **112 Approval vectors pass** on TypeScript, Python 3.12, Python 3.13,
  and Java, including all 40 Milestone 2 Approval regressions and controls.
- Native tests cover all three lifecycle operations with seven request-type
  variants, subsequent recording/evaluation, failed recording, independent
  returned histories, and a fresh eligible approval after withdrawal. Python
  and Java additionally observe history and effectiveness across each invalid
  withdrawal target and its valid control. Approval unit and adapter tests pass
  on all required runtimes.
- **33/33 targeted critical Approval probes are killed**, including 24 new
  probes with named regressions and positive controls. This is a focused probe
  result, not a full-release aggregate mutation score.
- Python Approval coverage is **88%** including branch measurement; Java
  Approval line coverage is **90.1%**, with **80.7%** branch coverage. Build,
  strict TypeScript, Python compilation, Java compilation, tool tests,
  architecture, documentation, traceability, license, and whitespace checks
  pass.
- The full 532-vector comparison changes only Approval failures to passes:
  TypeScript **495 PASS / 37 FAIL**; Python 3.12 and 3.13 each
  **456 PASS / 76 FAIL**; Java **460 PASS / 69 FAIL / 3 INFRASTRUCTURE_ERROR**.
  Unsupported remains zero. The remaining failures and Java infrastructure
  errors are unchanged from Milestone 2 and belong to later milestones; the
  full release gate is still open.

Public docstrings/Javadoc, implementation READMEs, root status, tool usage, and
traceability status are synchronized. Existing normative requirements and
conformance vectors already define these corrections; no specification,
CoreDoc, Agentic operation metadata, or AGENTS.md change is required. Approval
fixture labels remain conformance-local.

## Milestone 4 — Entity evolution validation and history corrections

- [x] Implement `ENTITY-EVOLUTION-034` in TypeScript, Python, and Java: perform
      intrinsic Audit validation before evolution correspondence and preserve
      its primary error when both fail. Retain atomicity across both histories.
- [x] Implement `ENTITY-EVOLUTION-035` in all three cores at history import and
      operation-result boundaries. Reject unresolved currentness contradictions
      without requiring an expected-currentness precondition; accept consistent
      effect-driven history changes. Keep this validation out of adapters.
- [x] Validate required Audit correspondence for correction, reversal, void,
      and supersession in Python and Java: evolution kind, source identity and
      revision, related identity and revision when applicable, relation identity,
      affected Entity, supersession scope when applicable, and the corresponding
      Audit Relationship. Reuse Audit's own Event and relationship validation.
- [x] Pair each missing or mismatched evidence case with valid evidence for the
      same evolution kind. Preserve established primary errors for invalid
      Audit Events and Milestone 1's resolved mapping for invalid correspondence.
      Failure must leave both Audit and evolution observations unchanged.
- [x] Translate existing conformance history arrays into each core's accepted
      API representation without financial rules in adapters. Cover empty and
      nonempty histories, successful operations with unrelated prior relations,
      preservation of earlier relations, and subsequent consumption of outputs.
- [x] Determine observed currentness from validated history for the applicable
      Entity, Revision, and scope before comparing an explicit expectation.
      Cover true/false matches and mismatches, omitted expectations, prior void
      and supersession evidence, and unrelated history. A matching expectation
      does not override a separate eligibility failure.
- [x] Ensure duplicate relation/reversal regressions reach the intended domain
      check after successful history parsing. Pair rejection with a permitted
      operation using the same nonempty history structure. Preserve declared
      duplicate policies; do not invent a universal reversal restriction.
- [x] Apply all declared Entity business validators to source and related or
      successor observations wherever required by the governing contract. Fix
      Python's positive-Money bypass and test the existing cross-field validator
      against complete observations. Preserve established validation and
      domain-error precedence without mutating source financial facts.
- [x] Verify histories, identities, revisions, scopes, currentness, and original
      financial facts survive success and failure exactly. Use the existing
      correction/reversal relation semantics; add no accounting posting effects.
- [x] Update affected API documentation, examples, and README claims. Run Entity,
      Audit, and relevant Workflow unit, adapter, sequence, and conformance tests
      across all required runtimes.

Completion: evolution enforces business validity, checks observed currentness,
preserves usable history, and commits only corresponding valid Audit evidence
with an atomic evolution result.

### Milestone 4 outcome

All three cores enforce Audit-before-correspondence priority and consistent
currentness at imported and resulting history boundaries. Python and Java now
check all required evolution correspondence, consume nonempty fixture histories
through adapter container translation, apply their bounded duplicate-reversal
policy, and compare expectations with observed currentness. Python validates
complete source and related/successor business observations. The new
`import_evolution_history` and `Entities.importEvolutionHistory` APIs provide
validated, defensive history envelopes; adapters contain no currentness or
financial validation rules.

Verification:

- All **157 Entity vectors pass** on TypeScript, Python 3.12, Python 3.13, and
  Java. Four additional portable cases cover incompatible same-key Supersession
  effects, conflicting same-step Correction observations, and a consistent
  control. The manifest now contains **536 vectors**; existing identifiers and
  normative requirements are unchanged.
- Native tests execute evolution vectors directly, retain actual result-reuse
  sequences, validate complete cross-field observations for each evolution kind,
  and check defensive history import, opaque reference keys, explicit successor
  effects, and atomic rejection. Entity adapter tests and relevant Entity,
  Audit, and Workflow unit suites pass on all required runtimes. The runner's
  130 tests pass with the expanded manifest.
- TypeScript evolution mutation testing scores **99.20%** (373/376 killed).
  No critical mutant survives. The remaining two survivors and one uncovered
  mutant are equivalent: the post-append empty-result guard is unreachable
  after successful Audit append, and the repeated effect-value comparison is
  always true when that step's existing source-effect key is present. No
  exclusions or thresholds were relaxed.
- **48/48 targeted Python/Java Entity critical probes are killed** (24 per
  implementation), including 30 new probes with named regressions and positive
  controls. This is focused evidence, not an aggregate Python/Java mutation
  score or the complete release mutation gate.
- Scoped coverage: TypeScript evolution **100% lines / 99.29% branches**;
  Python Entities **88%** including branch measurement; Java Entities
  **90.07% lines / 74.59% branches**. Build, strict TypeScript, Python/Java
  compilation, architecture, tool tests, documentation, traceability, license,
  and whitespace checks pass.
- Full-manifest results: TypeScript **528 PASS / 8 FAIL**; Python 3.12 and
  3.13 each **524 PASS / 12 FAIL**; Java **528 PASS / 5 FAIL /
  3 INFRASTRUCTURE_ERROR**. Unsupported remains zero. Compared with Milestone 3,
  only Entity failures become passes (29 TypeScript, 64 per Python runtime,
  64 Java), and all four added vectors pass. Unrelated results, including
  Java's existing Workflow infrastructure errors, are unchanged.

Public API documentation, examples, READMEs, conformance status and requirement
indexes, and verification tooling are synchronized. Older TypeScript error
assertions were updated specifically to the accepted `ENTITY-EVOLUTION-034`
priority and correspondence mapping; the rejection cases remain. CoreDoc,
Agentic metadata, and AGENTS.md already describe the governing obligations and
boundaries, so no changes are required there. The specification's non-normative
implementation-status note is current. Full release verification remains open
pending the later milestones.

## Milestone 5 — Workflow ownership and fixture corrections

- [x] Make retained definitions independent of caller-owned nested guard values
      in TypeScript, Python, and Java. Protect exposed observations as well as
      construction inputs; a shallow container copy or a read-only annotation
      alone does not establish immutable ownership.
- [x] Test both acceptance and rejection after attempts to mutate nested guard
      objects, arrays, and exposed transitions. Cover creation and import with
      versioned definitions and preserve unversioned behavior. The same facts
      must yield the same predicate result under the retained bound definition.
- [x] Enforce nonempty fact names and the supported JSON comparison boundary.
      Reject explicit null/malformed guards with the existing portable definition
      error, eliminating Java's `List.of(null)` crash. Cover missing versus null
      `equals`, valid explicit-null comparisons, and multiple guards.
- [x] Align `guard` plus `guards: []` and the invalid nonempty combination with
      the resolved fixture contract. Keep all presence/type checks in the core
      boundary that owns definition validation.
- [x] Correct default-sequence fixture translation and validation: the selector
      chooses the convention and the version identity supplies the position.
      Cover valid `1` and later positive positions, zero and malformed positions,
      invalid selectors, and opaque version identities without the convention.
      Do not add global sequence tracking or migration authority.
- [x] Preserve recursive type-sensitive equality, object/array ordering rules,
      missing/null distinctions, version binding, conflict checks, and failure
      atomicity established by earlier corrections.
- [x] Update public API documentation and fixture descriptions, including any
      compatibility-relevant constructor or observation changes. Run Workflow
      and composing Entity tests and conformance on all required runtimes.

Completion: caller mutation cannot change a retained definition, supported
fixtures behave consistently, and malformed definitions produce portable errors
without changing instance state or binding.

### Milestone 5 outcome

Completed the Workflow corrections under the existing guard fixture contract,
`WORKFLOW-VERSION-003`, `-005`, `-006`, `-009`, and `WORKFLOW-ERROR-007`.
Definitions retain independent nested guard values. TypeScript observations
are deeply frozen; Python guard observations are defensive JSON copies; Java
observations are deeply unmodifiable maps/lists that preserve null values.
Native constructor signatures remain unchanged. Python's retained guard field
is now private; dataclass field introspection is not a serialization contract.
Declaration arrays, exposed transitions, and unversioned controls are covered.

Malformed guard containers, empty fact names, missing comparison values, and
unsupported native JSON values produce the portable definition error. A single
guard with an empty competing list is accepted. Python and Java validate the
`DEFAULT` selector separately from its version identity position, including
ASCII-only positive positions and opaque identities without that selector.
Python adapter error observations now require a valid core definition, matching
the existing fixture expectations; definition validation stays in the core.

Verification completed:

- All **83 Workflow** and **157 Entity** vectors pass on TypeScript,
  Python 3.12, Python 3.13, and Java. Full-manifest results are TypeScript
  **530 PASS / 6 FAIL**, and **536 PASS / 0 FAIL** on both Python runtimes
  and Java. Every runtime has zero unsupported and infrastructure outcomes.
  Against Milestone 4, only Workflow results change: two TypeScript failures,
  twelve failures per Python runtime, and five Java failures plus three Java
  infrastructure errors become passes. Remaining failures are the six
  TypeScript Audit JSON-member cases assigned to Milestone 6.
- The permanent creation/import ownership matrix now passes in all languages.
  Native tests additionally cover unsupported values, cycles, shared references,
  direct constructors, declaration observations, unversioned ownership, and
  exact JSON type/container equality. TypeScript core has **619 passing tests**;
  Python has **62 passing tests** on each required runtime. Java native tests
  and Maven's **35 tests** pass. Workflow/Entity TypeScript adapter checks and
  all Python/Java adapter tests pass.
- TypeScript Workflow mutation score is **96.78%**: 481 of 497 mutants killed,
  zero timeouts or errors, 15 equivalent survivors, and one unreachable fallback
  mutant. No critical mutant survives. Equivalent cases retain validation in
  later checks, preserve undefined metadata observations, or duplicate JSON
  type/null checks. The final equality fallback is unreachable for the supported
  JSON comparison boundary. These mutants remain in the score; no exclusions
  were introduced. Array-like objects with `length` members are tested to
  distinguish ordinary JSON objects from arrays.
- The critical probe tool kills **9/9 Python** and **11/11 Java** Workflow
  mutants, including twelve new guard/sequence probes with named regression
  and passing-control vectors. Separate temporary-copy native runs kill two
  Python alias mutants and three Java alias mutants; compilation succeeds and
  unaffected declaration/sequence controls pass. Integrating these native probes
  into the unified critical-probe tool remains part of Milestone 7. The permanent
  TypeScript ownership suite now participates in Stryker configuration.
- Coverage gates pass: TypeScript core **99.67% lines / 99.39% branches**;
  Python core **89% combined**, with Workflow **92% combined**; Java Maven's
  full coverage gate passes, with Workflow **91.38% line coverage**.
  Build, strict TypeScript, Python compilation on both runtimes, architecture,
  documentation/traceability, tool tests, licenses, and whitespace checks pass.

Public API documentation, package/root READMEs, fixture descriptions, and
conformance status are synchronized. Existing portable vectors already cover
these corrections, so the manifest remains at 536 vectors and requirement IDs
are unchanged. The specification, CoreDoc, Agentic metadata, and AGENTS.md
already state the applicable semantics and architecture; no changes are needed
there. Release-wide mutation, packaging, clean-checkout verification, and
promotion remain assigned to later milestones.

## Milestone 6 — Audit JSON preservation corrections

- [x] Preserve arbitrary supported own JSON member names in TypeScript Actor
      metadata and Change values without invoking prototype setters. Do not
      filter, rename, drop, or assign domain meaning to `__proto__`, `constructor`,
      or other ordinary JSON member names.
- [x] Cover scalar, null, object, and array values under those names, nested
      containers, and shared caller references. Check exact observations after
      construction, append, history import, and repeated serialization.
- [x] Pair genuinely changed objects differing only in such a member with equal
      controls that must still be rejected as unchanged. Preserve Boolean/number
      distinctions, absent/null semantics, and explicitly declared Money rules.
- [x] Verify defensive observations and committed-history immutability, Actor
      identity and metadata presence, redaction source preservation, and absence
      of prototype side effects. Preserve existing rejection of unsupported
      non-JSON values rather than silently normalizing them.
- [x] Review adjacent Audit copying paths for the same mechanism. Extend to
      other domain paths only when a concrete contract violation is reproduced
      and covered; avoid an unrelated generic utility refactor.
- [x] Update affected public documentation and run Audit unit, adapter, and
      conformance suites on all required runtimes, including controls proving
      Python and Java preserve the same portable observations.

Completion: supported JSON members survive Audit processing exactly and cannot
silently disappear, create false equality, or change retained history.

### Milestone 6 outcome

Corrected the two unsafe TypeScript object-copy loops in Audit Actor metadata
and Change values. Copying now defines own data members rather than invoking
an inherited prototype setter. Every supported JSON member name is preserved;
there is no reserved-name filter or special financial interpretation. Public
signatures are unchanged. Python and Java already preserve these members and
needed additional native controls, not implementation changes.

Reviewed adjacent Audit Event, history import/observation, and redaction paths.
Their existing copying preserves these values once the Actor/Change boundary
is corrected. Native tests now exercise construction, append, import, repeated
serialization, mutations of caller inputs and returned observations, shared
references, and redaction of either Actor metadata or Change values while the
unredacted content and source history remain intact. The tests cover scalar,
null, object, and array values under `__proto__`, `constructor`, `prototype`,
and `hasOwnProperty`; prototype observations remain unchanged. Equal-value
controls still fail without committing partial history. Unsupported non-JSON
values remain rejected. Boolean/number distinctions, absent/null semantics,
and explicitly declared Money validation/equality have mutation controls.

Six new portable cases cover null and array values under `__proto__`, including
Actor preservation and changed/equal Change pairs. Existing IDs are retained.
The manifest now contains **542 vectors**, including **76 Audit** vectors.
Traceability remains **411 requirements / 329 COVERED / 82 NOT DIRECTLY TESTABLE**.
Native equality assertions use Node's exact deep comparison because Vitest's
strict matcher treats an own `constructor` member as a runtime type marker.

Verification completed:

- **542 PASS / 0 FAIL / 0 UNSUPPORTED / 0 INFRASTRUCTURE_ERROR** on TypeScript,
  Python 3.12, Python 3.13, and Java. Compared with Milestone 5, the six existing
  TypeScript Audit failures become passes, all six added cases pass everywhere,
  and all other vector outcomes are unchanged.
- All workspace tests pass: **130 runner**, **657 TypeScript core**, and
  **19 TypeScript adapter** tests. Python has **63 passing native tests** on
  each required runtime and **215 passing adapter tests** on each. Java native
  tests, **218 adapter tests**, and Maven's **36 tests** pass.
- Audit Stryker coverage includes Actor, Change, Event, Log, and redaction:
  **644 behavioral kills, 4 timeouts, 9 equivalent survivors, and 3 uncovered
  defensive-path mutants**, with no mutation-run errors. The reported score is
  **98.18%**; counting timeouts as unverified gives **97.58%**, still above 95%.
  The equivalent survivors retain finite-number validation/comparison or
  duplicate checks already performed by the public Log/Event boundary. The
  uncovered redaction exception/precondition branches are unreachable through
  validated Log calls. Existing exclusions were not broadened.
- Restoring either unsafe copy loop in an isolated TypeScript copy fails its
  named own-member preservation assertion while the paired constructor-member
  controls pass. The unmodified baseline passes. Python critical Audit probes
  kill **5/5** mutants and Java probes kill **8/8**. The four Stryker timeouts
  remove cyclic-input rejection from the Actor/Change copy routines; they
  remain unclassified, are not behavioral closure evidence, and are explicitly
  carried into Milestone 7. No unsafe-copy mutant survives.
- Coverage gates pass: TypeScript core **99.67% lines / 99.46% branches**;
  Python core **89% combined**, with Audit **85% combined**; Java Maven's full
  coverage gate passes. Build, strict TypeScript, Python compilation on both
  runtimes, architecture, documentation/traceability, tool tests, licenses, and
  whitespace checks pass.

JSDoc, package/root READMEs, conformance status, traceability, and suite-count
assertions are synchronized. The existing specification and Agentic Contract
already define preservation of arbitrary JSON names; CoreDoc and AGENTS.md
already cover history immutability and architectural responsibilities. No new
normative behavior, requirement IDs, portable errors, or operation IDs were
needed. Release-wide verification and promotion remain open.

## Milestone 7 — Mutation protection and complete verification

- [x] Resolve the four Audit Actor/Change cycle-validation mutation timeouts
      recorded in Milestone 6. Require classified behavioral results rather than
      counting timeout outcomes as regression closure.
- [x] Extend critical mutation protection for every corrected failure mechanism:
      lifecycle evidence loss, lifecycle type override, ambiguous/superseded
      target acceptance, malformed effectiveness counted as approval, evolution
      evidence mismatch, constant currentness, rejected valid nonempty history,
      business-validator bypass, mutable guard aliases, malformed guard handling,
      default-sequence misvalidation, and unsafe Audit key copying.
- [x] Require each new targeted probe to fail its named behavioral regression
      while paired valid controls execute and pass. Compilation failures,
      process crashes, unsupported outcomes, malformed reports, empty suites,
      and unrelated rejection are not valid kills. Preserve and extend existing
      mutation-classification tests if the harness changes.
- [x] Include public-API sequence and aliasing tests in mutation verification.
      Where isolated JSON vectors cannot expose a defect, add narrowly scoped
      public-API mutation probes and wire them into `npm run verify`; do not add
      financial sequence logic to the runner or waive these cases.
- [x] Run full runner and TypeScript core Stryker suites with the unchanged
      minimum 95 percent gate and all Python/Java critical probes. Review every
      survivor and uncovered mutant; no critical financial mutant may survive.
      Justify equivalent mutants explicitly without weakening meaningful scope.
- [x] Run builds, strict TypeScript, unit and adapter tests, Python 3.12/3.13
      compilation and compatibility checks, coverage, and every expanded
      manifest vector on TypeScript, both Python runtimes, and Java. Require
      zero failed, unsupported, or infrastructure conformance results.
- [x] Verify normalized portable observations as well as outcomes, especially
      history preservation, currentness, error precedence, and special-key
      presence. Re-run all earlier Money and cross-domain regressions.
- [x] Run isolated npm, Python wheel/sdist, and Java JAR consumer checks,
      documentation and traceability checks, architecture and license checks,
      developer-tool tests, and whitespace validation. Update affected coverage
      helpers and discovery assertions to include every added vector.
- [x] From a clean checkout of the intended candidate, install locked Node
      dependencies with `npm ci` and run the complete `npm run verify`. Use the
      prescribed Node 24, CPython 3.12/3.13, JDK 21, and Maven 3.9.x toolchains;
      bootstrap missing runtimes under `.tools` according to `AGENTS.md`.
- [x] Reassess traceability and release claims against the new tests. Mandatory
      uncovered boundaries and unresolved specification gaps remain blockers
      even when aggregate coverage, mutation, and conformance totals pass.

Completion: the expanded regressions and controls participate in repeatable
local verification, all configured gates pass, and no corrected critical
failure mechanism survives mutation testing.

Milestone 7 completed on 2026-09-24 after locked installation and the complete
`npm run verify` passed in a clean, isolated Git checkout containing the intended
working-tree changes. The repository's index, commits, and tags were not changed.
The final documentation-only status updates were checked separately.

The four Actor/Change cycle-check removals now fail exact portable-error
assertions. Bounded self-references stop defective traversal before Stryker's
hit-count limiter, while ordinary cyclic arrays and objects remain in the same
regression tests. The focused suite reports 298 kills, zero timeouts, and five
redundant-comparison survivors. No mutation scope, coverage selection, annotation,
or threshold was relaxed.

`npm run verify` now includes 13 native public-API mutation probes: four
TypeScript, four Python, and five Java. They reuse permanent lifecycle sequences,
returned Entity histories, retained Workflow aliases, and Audit own-key tests.
Every new probe passes its unmodified baseline, fails its named regression, and
passes its paired valid control. The conformance probe tool also requires passing
baselines containing all declared regression/control vectors. Twelve tool tests
protect classification against duplicate IDs, missing controls, empty suites,
malformed reports, inconsistent counts, skips, crashes, compilation failures,
and unrelated failures. All 66 Python and 67 Java conformance probes and all
13 native probes pass.

The full runner mutation score is 97.06 percent (627 killed, 19 survived, zero
uncovered or timed out). The full TypeScript core score is 96.69 percent
(4,021 killed, 16 timed out, 128 survived, 10 uncovered). Excluding every timeout
still gives 96.31 percent behavioral kills. The remaining Money/Approval
nonterminating mutants are reported separately; they are not evidence for
closing the four Audit regressions or any new targeted probe.

Every survivor and uncovered mutant was reviewed:

- Runner diagnostic strings, source labels, and redundant error wrapping retain
  infrastructure classification; primitive records still fail required fields.
- Core error-carrier messages, names, optional details, and the Entity validation
  message do not change portable codes or financial results.
- Approval timestamp/record checks retain downstream validation; normalized
  lifecycle event shapes make the redundant type guard equivalent. Synthetic
  decision entries and state keys cannot match validated identifiers. Internal
  applicability flags, extra non-pending actionables, and approved/empty stage
  representations are discarded before observable outcomes.
- Workflow identity guards retain mandatory downstream string validation;
  `Number.isFinite` already rejects nonnumbers, null is handled before traversal,
  and unversioned getters still return undefined. Equality guards are redundant
  after primitive, null, and array cases; the final fallthrough is unreachable
  for validated JSON.
- Audit numeric equality remains strict over prevalidated finite JSON numbers;
  optional metadata validation preserves omission. Redaction fallback entries
  cannot match validated paths, and matching is checked by the public log.
- Entity currentness effects contain only the previously assigned false source
  effect at the redundant comparison. Money inputs still pass through Money
  validation; undefined and false findings remain invalid. Conflict identifiers
  remain checked against mandatory revision identities.
- Uncovered clone-error and post-append branches cannot be reached through
  validated public histories; Money rounding modes are validated before dispatch.

Builds, strict TypeScript, 130 runner tests, 657 TypeScript core tests, 19
TypeScript adapter tests, 64 Python tests on each supported runtime, Python
adapter tests, Java entry-point and adapter tests, and 36 Maven tests pass.
All 542 vectors pass on TypeScript, CPython 3.12, CPython 3.13, and Java, with zero
failed, unsupported, or infrastructure outcomes. Normalized history, currentness,
error-precedence, and own-member observations participate in those comparisons.
Coverage gates, npm/wheel/sdist/JAR consumer checks, documentation, traceability,
architecture, licensing, toolchain, and whitespace checks pass.

Traceability remains 411 requirements: 329 COVERED and 82 NOT DIRECTLY TESTABLE,
with no partial, uncovered, deferred, or blocking-gap entries. Native ownership
and sequence tests supplement the finite vectors; passing them is not exhaustive
boundary coverage or authorization to promote 1.0. Locked installation reports
two moderate transitive development-tool advisories (`typed-rest-client`/`qs`
under Stryker); those remain a dependency-review follow-up.

Completion review: unit/native/tool and mutation tests and affected README/status
documentation were updated. No production API or financial behavior changed, so
no new vectors, requirements, portable errors, operation metadata, public API
JSDoc, CoreDoc rules, or AGENTS.md changes were needed. Milestone 8 and release
promotion remain open.

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
