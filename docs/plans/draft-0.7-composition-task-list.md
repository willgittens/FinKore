# FinKore Core Draft 0.7 Cross-Domain Composition Task List

## 1. Purpose

Draft 0.7 proves that Money, Workflow, Audit, Approvals, and Entities compose
into realistic, bounded financial workflows with portable outcomes, preserved
history, and no partial observable financial effect on rejection.

This plan implements the Draft 0.7 direction in the
[good-to-have roadmap](good-to-have.md) and continues numbering after the
completed [pre-Draft 0.7 readiness plan](pre-draft-0.7-readiness-task-list.md).
It is non-normative. CoreDoc and `/spec` define financial obligations;
`/conformance` verifies them; `/agentic` describes canonical operations;
release notes record shipped scope and evidence. Planning a task does not
accept a financial rule or establish conformance.

## 2. Starting Baseline

The readiness record marks TASK-256 and TASK-257 complete:

- Draft 0.6 release-evidence correction was verified from clean committed
  worktree revision `d001916e`.
- Java full-profile parity is recorded against
  `e79ff010428a959dd7cae59948eab7ce5d79bab9`.
- TypeScript, Python, and Java each have recorded results of 254/254 for
  `finkore.core.draft0_6.full`, with no failures, unsupported results, or
  infrastructure errors.
- The historical `core-draft-0.6` tag and original Java Money claim remain
  preserved; later evidence does not rewrite the original release.

This plan was prepared from repository revision
`ad2942179271f65234527d73fca020efa1df443c`. These are recorded starting facts,
not a new verification run or a Draft 0.7 claim. TASK-258 must bind execution
to exact committed inputs and reproduce the opening evidence.

Authoritative and supporting references:

- [CoreDoc](../coreDoc/core-doc.md), especially `CORE-001`, `CORE-002.3`,
  `CORE-003`, `CORE-004`, and `CORE-005`;
- [Draft 0.6 Release Notes](../releases/draft-0.6.md);
- [Compatibility, Claims, and Provenance Policy](../draft-0.6-compatibility-claims-provenance-policy.md);
- [Portable Capability Contract](../../spec/draft-0.6-portability-capability-contract.md);
- [Conformance Conventions](../../conformance/conventions.md) and
  [Traceability](../../conformance/traceability.md);
- [Agentic Operations](../../agentic/operations.md); and
- [Draft 0.6 Profiles and Evidence](../../conformance/draft-0.6/README.md).

## 3. Scope and Success Definition

Use two non-normative reference profiles: expense approval and invoice
correction. These names describe examples, not new Core financial domains.
Their fields, eligibility rules, approval thresholds, lifecycle consequences,
and Audit requirements must be declared explicitly as application policy.

The planned implementation target is both profiles in TypeScript, Python, and
Java, building on completed full-profile parity. This exceeds the roadmap's
minimum of TypeScript plus one other language and avoids leaving Java behind
immediately after the readiness work.

Draft 0.7 succeeds when:

1. both profiles execute through real language Core APIs;
2. every expected outcome has an explicit authority and traceable evidence;
3. success, rejection, stale context, and late Audit failure preserve all
   applicable financial and historical invariants;
4. all three languages agree on normative observations and declared reference
   profile outcomes;
5. any necessary new portable behavior has completed specification-first
   governance, conformance, implementation, and mutation gates; and
6. reproducible release evidence distinguishes Core conformance from reference
   application scenario results.

No new Core requirement is required merely to make Draft 0.7 substantial. A
finding that existing requirements are sufficient is a valid outcome when
supported by the composition evidence.

## 4. Non-Goals

- An invoice or expense standard, ledger postings, double-entry accounting,
  tax, FX, payments, settlement, or jurisdiction-specific correction policy.
- A database, transaction manager, distributed rollback protocol, lock,
  concurrency winner-selection rule, retry policy, or message broker.
- Universal authorization, RBAC, segregation of duties, delegation,
  escalation, or dynamic approver resolution.
- Revision generation, automatic approval invalidation policy beyond the
  specified effectiveness rules, or financial finality inferred from names.
- The Draft 0.8 machine-readable Agentic manifest, executable agent adapters,
  or promotion of Approval operations solely to support these examples.
- Package publication, production-readiness claims, certification, or a 1.0
  compatibility guarantee.

## 5. Authority, Findings, and Atomicity Rules

### 5.1 Classify every scenario assertion

| Classification | Authority and treatment |
| --- | --- |
| Existing normative Core behavior | Cite current requirement IDs and retain their portable meaning. |
| Proposed normative composition behavior | Record a finding; accept and specify before adding normative vectors or implementation behavior. |
| Conformance-only observation | Define how the harness observes specified behavior; it cannot add financial rules or public API obligations. |
| Non-normative application guidance | Declare profile policy and test it as reference application behavior; do not present it as Core conformance. |

Keep reference application profiles distinct from closed conformance profiles.
A reference profile passing cannot imply new canonical operations, full Core
conformance, or support for every possible application policy.

### 5.2 Define the rejected action before claiming atomicity

`CORE-002.3` governs rejection without partial financial effect.
`ENTITY-EVOLUTION-023` through `-033` already define important rejection,
primary-error, identity, and Audit obligations. In particular,
`ENTITY-EVOLUTION-033` requires atomic portable observation of evolution and
its required Audit evidence. That does not establish an arbitrary transaction
over every preceding independent operation.

For each scenario, identify the action boundary, prior committed observations,
candidate results, required Audit evidence, success observation, and failure
observation. A later rejected action must not erase a previously committed
Approval Decision or Audit Event. Conversely, a rejected action must not expose
a candidate relation, revision, lifecycle change, or success event that belongs
inside its declared atomic boundary.

Resolve whether any stronger composition guarantee is application guidance or
a necessary portable Core obligation before implementing it. Do not hide an
undefined guarantee in fixture orchestration, adapters, or a runner snapshot.
Domain-observable atomicity does not establish crash recovery, durable storage,
network-failure semantics, or distributed transaction guarantees.

### 5.3 Findings and acceptance

Assign findings stable `D07-*` identifiers and classify them as editorial,
clarification, normative change, contradiction, portability blocker,
conformance defect, implementation defect, tooling/claim defect, or application
policy decision. Record affected identifiers, exact artifact revisions,
reproduction, alternatives, domain/accounting/technical/security/privacy
analysis, compatibility impact, resolution, and explicit scoped maintainer
acceptance where required.

Record foundation-level normative evolution in CoreDoc or the affected
specification. Release notes carry shipped evidence and factual review status;
this plan is not the acceptance record. Do not infer acceptance of a later
financial decision from authorization to prepare or execute this plan.

Unresolved financial ambiguity blocks dependent normative vectors and code.
Independent work can continue. External community or independent review is
not a closure prerequisite unless explicitly added to the accepted scope;
required analysis still applies, and actual review status must be recorded.

## 6. Reference Profiles and Scenario Coverage

### Expense approval

Declare a small expense Entity, its fields and revisions, a Workflow with
explicit version binding, mutation policy, approval policy, and Audit-required
actions. Exercise exact Money calculation and allocation with explicit scale,
rounding mode, ratios, and declared remainder order. Bind Approval evidence to
explicit relevant subject facts or revisions and explicit evaluation context.

Cover submission, current approval evaluation, and a permitted lifecycle
transition. Include applicability, bounded quorum, pending and rejected
outcomes, and stale or expired Decisions. An approval result does not itself
authorize an actor or establish a financial consequence for a state name.

### Invoice correction

Use an invoice-shaped Entity with original facts declared immutable by profile
policy. Apply existing correction semantics to a related Entity or Revision,
with caller-supplied identities, a correction relation, and matching Audit
evidence. Preserve the original Money values, source identity, revisions, and
history. Declare correction eligibility and any approval policy explicitly.

Correction does not automatically imply reversal, supersession, accounting
entries, or a currentness change. Exercise only consequences supported by the
selected evolution kind and declared policy. Re-evaluate existing Approval
evidence against explicitly supplied corrected facts or revision context;
never synthesize a new approving Decision.

### Required scenario matrix

Each row must be assigned to one or both profiles with requirement references,
policy inputs, expected outputs, and before/after observations. Cover both
profiles for action-boundary and history-preservation failures.

| Area | Required evidence |
| --- | --- |
| Money | Exact calculation, allocation conservation, explicit rounding boundaries, incompatible currencies, invalid allocation, and declared capability limits. |
| Entity | Stable identity, immutable source observations, declared field validation, allowed/rejected mutations, distinct revision and conflict identities. |
| Workflow | Allowed transition, guard rejection, terminal behavior, definition-version mismatch, stale expected state and instance revision. |
| Approvals | Applicable/inapplicable/unresolved conditions; approved/pending/rejected results; distinct-voter quorum; withdrawn, expired, superseded, stale-fact and stale-revision evidence. |
| No approval obligation | Explicitly inapplicable requirements remain distinguishable from a committed approving Decision. |
| Evolution | Eligible correction, ineligible source, duplicate relation identity, stale source preconditions, preserved original facts and relationships. |
| Audit | Required evidence, invalid/mismatched relationship, duplicate event, append-only preservation, declared ordering, late evidence rejection. |
| Error interactions | Primary domain errors and specified precedence; ambiguous simultaneous failures become findings rather than guessed expectations. |
| Failure boundary | Exact unchanged relevant state, Money, revisions, relations, Approval history, and committed Audit history after rejection. |
| Portability and safety | Explicit time/facts/IDs, omitted versus null inputs, declared order, safe diagnostics, no ambient locale/time/network dependency. |

Not every cell needs a new vector when existing evidence already proves it.
Composition scenarios must still demonstrate the relevant interactions through
real operations, including a failure after earlier candidate work succeeded.

## 7. Architecture and Verification Gates

Reference application orchestration should live outside language Core packages,
for example in language-specific `examples/composition/` directories. TASK-263
must select the concrete layout after the semantic classification is accepted.
Core may implement accepted normative composition behavior in the appropriate
domain; application policy must remain outside it.

Preserve Runner → Conformance Adapter → Core. The runner loads, dispatches,
compares, and reports; it cannot calculate amounts, evaluate approvals, select
transitions, or implement rollback. Adapters translate values and invoke APIs;
they cannot implement financial rules. Scenario tests must observe actual
results, including retained source objects and histories, rather than having
the harness manufacture the expected state.

Share language-independent fixtures and expected observations, not production
orchestration code across languages. Derive each implementation from accepted
specifications and declared reference policy; TypeScript is not an oracle.
Do not invent `finkore.*` IDs for scenario names. Any operation addition requires
the normal canonical operation and Agentic review process.

For meaningful financial changes, require build/static checks, native unit and
adapter tests, coverage, full claimed conformance, cross-language comparisons,
and mutation testing. Target at least 95% mutation score with no critical
survivors; an equivalent technique needs documented acceptance and scope.
Apply defect-resistance checks to meaningful composition code as well as Core.

Critical cases include bypassed approval checks, counted stale Decisions,
changed allocation arithmetic, bypassed conflict preconditions, early state
publication, ignored Audit failures, altered portable errors, and rewritten
source or committed history. Kill these defects with behavior assertions.

Use deterministic fixture inputs. Verify installed runtimes before execution
and follow repository toolchain fallback instructions. The opening matrix is
Node/strict TypeScript, CPython 3.12 plus 3.13 compatibility, JDK 21, and Maven
3.9.x; TASK-258 records exact versions used.

## 8. Milestone and Dependency Map

| Milestone | Tasks | Exit gate |
| --- | --- | --- |
| A — Baseline and scenario design | 258–260 | Reproduced baseline, classified profiles, complete scenario matrix. |
| B — Semantic and observation contract | 261–264 | Accepted boundaries, resolved necessary spec changes, traceable test contract. |
| C — Independent implementation | 265–267 | Both profiles work in all three languages with honest support reporting. |
| D — Composition proof | 268–270 | Matching results, failure atomicity, history preservation, critical defects killed. |
| E — Claims and closure | 271–275 | Reviewed, documented, reproducible and accurately scoped release. |

```text
257 → 258 → 259 → 260 → 261 → 262 → 263 → 264
264 → 265 (TypeScript)
264 → 266 (Python)
264 → 267 (Java)
{265, 266, 267} → 268 → 269 → 270 → 271 → 272 → 273 → 274 → 275
```

Record findings as they arise. A finding that changes accepted semantics
reopens affected specification, conformance, implementation, and verification
gates. Completion requires the evidence for the final accepted revision.

## 9. Detailed Task List

### Milestone A — Baseline and Scenario Design

### - [x] TASK-258 — Open Draft 0.7 and Reproduce the Corrected Baseline

**Depends on:** TASK-256 and TASK-257.

**Deliverables:** Record exact opening source and evidence revisions,
working-tree qualifications, toolchains, package/format versions, requirements,
vectors, errors, canonical and conformance-local operations, capability limits,
and claims. Create a Draft 0.7 release-note shell and finding register with
pending status. Preserve original and corrected Draft 0.6 evidence identities.

**Verification:** Reproduce the existing closure-grade verification path from
a clean committed checkout and run all three full profiles. Investigate any
stale checksum, metadata, provenance, or status claim before relying on it.
Do not regenerate historical evidence solely to bless planning edits.

**Acceptance:** The exact starting baseline is reproducible; all three
languages pass the complete 254-vector opening profile with zero failures,
unsupported results, or infrastructure errors. Counts are refreshed evidence,
not a permanent Draft 0.7 quota.

**Execution note (2026-09-18):** Baseline, build, and all three
`finkore.core.draft0_6.full` profile runs passed from opening source revision
`ad2942179271f65234527d73fca020efa1df443c`. Python and Java profile execution
required escalated local-toolchain runs after sandboxed attempts failed with
`spawnSync .tools/bin/python3.12 EPERM` and `spawnSync .tools/bin/javac EPERM`.
The workspace was already dirty when execution began, so clean committed
checkout acceptance remains open and is tracked as `D07-TOOLING-258-001` in
[Draft 0.7 Release Notes](../releases/draft-0.7.md).

**Closure note (2026-09-18):** Clean committed-checkout opening verification
was reproduced from revision `9f2409556eca6fd98f29e044c955bbdd22fe497f`.
`npm run tools:check:draft0.5`, `npm run baseline:draft0.6`,
`npm run build`, and all three full profiles passed. Python and Java again
required escalated local-toolchain reruns after sandboxed `EPERM` failures.
`D07-TOOLING-258-001` is resolved in
[Draft 0.7 Release Notes](../releases/draft-0.7.md).

### - [x] TASK-259 — Declare the Two Reference Application Profiles

**Depends on:** TASK-258.

**Deliverables:** Write expense approval and invoice correction profiles with
fields, lifecycle consequences, relevant facts, identity/revision inputs,
approval eligibility and thresholds, rounding/allocation policy, mutation
rules, and Audit-required actions. Label each rule using section 5.1.

**Verification:** Review profiles against existing Money, Workflow, Audit,
Approval, and Entity requirements and CoreDoc obligations.

**Acceptance:** Both profiles are bounded, realistic, explicitly non-normative,
and contain no implicit tax, posting, authorization, settlement, or finality rule.

**Execution note (2026-09-18):** Initial non-normative profile declarations are
recorded in
[Draft 0.7 Composition Profiles](../draft-0.7-composition-profiles.md).

### - [x] TASK-260 — Build the Composition Scenario and Traceability Matrix

**Depends on:** TASK-259.

**Deliverables:** Expand section 6 into deterministic success, rejection,
boundary, and history-preservation scenarios. Map each assertion to requirement
IDs, declared application policy, or an unresolved finding. Identify existing
vector coverage and the new interaction evidence needed.

**Verification:** Walk through both profiles using explicit before/action/after
observations, including multi-error and late-failure cases.

**Acceptance:** No expected financial outcome lacks authority; unresolved
expectations are marked blocked rather than encoded as new semantics.

**Execution note (2026-09-18):** Initial deterministic scenarios, authority
classifications, existing coverage, and blocked Milestone B questions are
recorded in
[Draft 0.7 Composition Scenario Matrix](../draft-0.7-composition-scenario-matrix.md).

### Milestone B — Semantic and Observation Contract

### - [x] TASK-261 — Resolve Action Boundaries, Failure Effects, and Error Precedence

**Depends on:** TASK-260.

**Deliverables:** Define the atomic action boundary and observable state for
each scenario; distinguish previously committed evidence from candidate work.
Review approval gating, relevant-fact binding, evolution consequences, required
Audit effects, and primary domain errors. Classify each gap as application
policy or necessary portable behavior and record the required analysis.

**Verification:** Use counterexamples: approved evaluation followed by stale
transition, valid correction followed by invalid Audit evidence, and rejection
after earlier candidate calculation. Confirm failed actions preserve earlier
committed evidence without exposing partial new results.

**Acceptance:** Boundaries and precedence are explicit, accepted where required,
and do not prescribe storage or invent universal cross-operation rollback.

**Execution note (2026-09-18):** Reference action boundaries and primary-failure
policy are recorded in
[Draft 0.7 Composition Observation Contract](../draft-0.7-composition-observation-contract.md).
Approval gates use profile-local rejection codes, late Audit failures preserve
previously committed observations, and invoice correction uses Entity evolution
plus required Audit evidence as the portable observation.

### - [x] TASK-262 — Apply Accepted Specification and CoreDoc Resolutions

**Depends on:** TASK-261.

**Deliverables:** Resolve accepted normative findings in `/spec`, with stable
requirement IDs, invariants, errors where needed, compatibility analysis, and
CoreDoc evolution records where affected. Review Agentic preconditions,
postconditions, effects, failure guarantees, and errors. Preserve deferred
Approval discoverability boundaries.

**Verification:** Check authority consistency and traceability; obtain explicit
scoped acceptance of material normative changes before implementation.

**Acceptance:** No affected semantic blocker remains. If no normative change is
needed, record the evidence and decision explicitly; do not invent requirements,
portable errors, or canonical operations to fill a milestone.

**Execution note (2026-09-18):** No normative `/spec`, CoreDoc, `/agentic`, or
portable error change is required for Milestone B. Existing Money, Workflow,
Audit, Approval, and Entity requirements cover the bounded reference scenarios
when profile policy remains outside Core.

### - [x] TASK-263 — Define Scenario Execution and Portable Observations

**Depends on:** TASK-262.

**Deliverables:** Select concrete example/test locations, action entry points,
fixture inputs, observation shapes, and output comparison rules. Reuse existing
operations and formats where sufficient. Decide whether accepted normative
additions need new conformance fixtures, dispatch support, or format changes.
Keep reference application evidence distinguishable from normative vectors.

**Verification:** Review dependency directions and demonstrate that adapters and
runner do not own financial sequencing, policy, atomicity, or fabricated results.
Assess format/version compatibility rather than assuming a Core version bump
requires a fixture-format bump.

**Acceptance:** All three languages can execute the same scenarios through
idiomatic APIs, with portable observations and explicit evidence classifications.

**Execution note (2026-09-18):** Scenario execution layout, observation shape,
profile-local errors, and reference fixture boundaries are recorded in
[Draft 0.7 Composition Observation Contract](../draft-0.7-composition-observation-contract.md).
Shared fixtures live under `examples/composition/draft-0.7/`; future language
implementations should live under language-specific
`implementations/<language>/examples/composition/draft-0.7/` directories.

### - [x] TASK-264 — Add Traceable Vectors and Establish Failing Regressions

**Depends on:** TASK-263.

**Deliverables:** Add normative vectors only for accepted requirements, update
manifest/traceability where affected, and add separately identified reference
scenario fixtures. Establish failing tests for missing behavior or reproduced
defects before implementation. Record already-passing existing behavior honestly.

**Verification:** Validate schemas and identifiers; prove failures occur for the
intended reason. Assert exact values, errors, unchanged inputs, and history.

**Acceptance:** Fixtures are language independent, reproducible, and unable to
turn missing support or infrastructure errors into successful domain evidence.

**Execution note (2026-09-18):** No normative vectors were added because no new
Core behavior was accepted. Non-normative reference fixtures were added under
`examples/composition/draft-0.7/` and a fixture contract check exposed as
`npm run composition:check:draft0.7`. Milestone C later changed
`implementationStatus` to `"implemented"` after all three language runners and
native scenario tests were added.

### Milestone C — Independent Implementation

For TASK-265 through TASK-267, derive behavior from accepted specifications and
declared profile policy, preserve architecture boundaries, and retain a failing
regression before fixing any defect. Each language implements both profiles.

### - [x] TASK-265 — Implement and Verify TypeScript Composition Profiles

**Depends on:** TASK-264.

**Deliverables:** Add reference orchestration and only necessary accepted Core
changes, with strict typed APIs, meaningful public JSDoc, requirement references,
native scenario tests, and applicable adapter translations.

**Verification:** Build, strict TypeScript, unit/adapter tests, coverage,
normative conformance, reference scenarios, and affected mutation checks.

**Acceptance:** Both profiles pass; state and historical observations remain
immutable as specified; no application policy enters the runner or adapter.

**Execution note (2026-09-18):** TypeScript reference orchestration was added
under `implementations/typescript/examples/composition/draft-0.7/`, with a
strict example `tsconfig` and fixture-driven Vitest coverage for all 20 shared
scenarios. `npm run composition:typescript:draft0.7` passed: strict compile and
20/20 scenario checks.

### - [x] TASK-266 — Implement and Verify Python Composition Profiles

**Depends on:** TASK-264.

**Deliverables:** Implement both profiles independently using idiomatic Python
APIs, exact decimals, explicit evaluation context, native tests, public API
documentation, and applicable adapter translations.

**Verification:** Compile/static checks, native and adapter tests, coverage,
conformance, scenarios, and mutation or accepted equivalent; exercise CPython
3.12 and the 3.13 compatibility track.

**Acceptance:** Both profiles pass without relying on TypeScript code, ambient
decimal context, mutable fixture aliases, or inferred financial policy.

**Execution note (2026-09-18):** Python reference orchestration was added under
`implementations/python/examples/composition/draft-0.7/`, with a native
unittest loading the shared fixture set. `npm run composition:python:draft0.7`
passed and checked all 20 shared scenarios through Python Core APIs.

### - [x] TASK-267 — Implement and Verify Java Composition Profiles

**Depends on:** TASK-264.

**Deliverables:** Implement both profiles independently using typed Java APIs,
public Javadoc, native tests, and applicable adapter translations. Keep generic
fixture maps at serialization/adapter boundaries rather than making them the
production composition API.

**Verification:** JDK 21/Maven 3.9.x build/static checks, native and adapter tests,
coverage, conformance, scenarios, and mutation or accepted equivalent.

**Acceptance:** Both profiles pass with exact decimal behavior, preserved source
observations, and full existing domain support retained.

**Execution note (2026-09-18):** Java reference orchestration was added under
`implementations/java/examples/composition/draft-0.7/`, with a native main-class
test registered in the Java test runner. `npm run composition:java:draft0.7`
passed after local-toolchain escalation for `javac`, compiling 9 Java source
files and 9 test files. The combined
`npm run composition:test:draft0.7` command passed after the same Java sandbox
escalation.

### Milestone D — Composition Proof

### - [x] TASK-268 — Compare Actual Composition Results Across Languages

**Depends on:** TASK-265, TASK-266, TASK-267.

**Deliverables:** Produce actual-result comparisons for both profiles and every
normative composition vector, including error codes, Money values, identity,
revisions, approval effectiveness, relations, and declared history ordering.

**Verification:** Run identical committed inputs through each implementation.
Resolve differences through authority review, not majority voting or copying
TypeScript expectations. Do not normalize away meaningful nullability or order.

**Acceptance:** No unexplained cross-language difference remains within the
declared portable scope; claims identify exact inputs and implementation revisions.

**Execution note (2026-09-18):** Added
`npm run composition:compare:draft0.7`, which emits actual observations from
TypeScript, Python, and Java and compares the complete sorted JSON result set
for all 20 shared scenarios. Sandboxed runs hit subprocess `EPERM` boundaries
while spawning local toolchain commands; escalated reruns passed with all 20
scenarios matching across the three languages.

### - [x] TASK-269 — Prove Failure Atomicity and History Preservation

**Depends on:** TASK-268.

**Deliverables:** Complete negative interaction coverage at each accepted action
boundary, including late Audit rejection, stale approvals, version/conflict
checks, invalid Money/Entity inputs, and duplicate evidence. Retain prior
observations and compare complete relevant state before and after failure.

**Verification:** Execute the cases in every language; demonstrate the harness
neither restores state nor discards evidence of a partial mutation. Preserve
prior committed Decisions, Audit Events, and original correction facts.

**Acceptance:** Every rejection has the specified error and effects; no claimed
atomicity guarantee rests solely on inspecting the returned status.

**Execution note (2026-09-18):** Added explicit `evidence` observations to the
TypeScript, Python, and Java profile results for exact allocations, approval
gates, stale Workflow preconditions, late Audit failures, correction source and
related facts, relation counts, and absence of synthetic correction effects.
Added `npm run composition:critical:draft0.7`; after the same subprocess
sandbox `EPERM` boundary, escalated reruns passed critical checks for all 20
compared scenarios.

### - [x] TASK-270 — Harden Composition Tests Against Critical Defects

**Depends on:** TASK-269.

**Deliverables:** Add or extend mutation campaigns across meaningful Core and
reference composition behavior, including the critical defects in section 7.
Document equivalent-mutant justifications and accepted technique limitations.

**Verification:** Run the campaigns in all three languages and verify each
critical defect is killed by a financial outcome or invariant assertion.

**Acceptance:** Mutation target is met or an equivalent is explicitly accepted;
no critical financial mutant survives. Do not exclude orchestration merely
because it lives in examples.

**Execution note (2026-09-18):** Added
`npm run composition:mutation:critical:draft0.7`, a focused critical mutant
harness for the Draft 0.7 reference composition orchestration. It first
requires the compared critical proof baseline to pass, then seeds critical
mutants across TypeScript, Python, and Java for allocation order, approval gate
bypass, late Audit history publication, and synthetic correction effects. The
escalated run killed 9/9 seeded composition mutants. This complements the
existing Core critical mutation guard and records the accepted Draft 0.7
composition mutation scope.

### Milestone E — Claims and Closure

### - [x] TASK-271 — Close Domain, Accounting, Technical, Security, and Privacy Findings

**Depends on:** TASK-270.

**Deliverables:** Review both profiles for financial meaning, control failures,
forged or stale actor/fact evidence, diagnostic disclosure, replay/duplicates,
untrusted identifiers, Audit tampering, and authorization boundaries. Record
attributed findings, dispositions, exact revisions, and required acceptance.

**Verification:** Confirm required analysis is complete and limitations cannot
be mistaken for stronger Core, storage, security, or accounting guarantees.

**Acceptance:** No material blocker remains. Record actual external-review
status and future Draft 0.8 topics without inventing signoff or credentials.

**Execution note (2026-09-18):** Domain, accounting, technical, security,
privacy, external-review status, accepted limitations, and Draft 0.8 handoff
topics are recorded in
[Draft 0.7 Composition Closure Review](../draft-0.7-composition-closure-review.md).
No material blocker remains for the non-normative reference profile scope.

### - [x] TASK-272 — Finalize Compatibility, Profile Scope, and Claim Evidence

**Depends on:** TASK-271.

**Deliverables:** Define closed Draft 0.7 conformance scope according to accepted
changes; update capability and claim metadata as applicable. Record reference
profile evidence separately. Keep Core, package, conformance format, Agentic,
profile, and evidence versions distinct; preserve historical Draft 0.6 claims.

**Verification:** Run all required normative vectors against all three full
implementations and both reference profiles in each. Check metadata, identifier,
error, operation, and requirement/vector drift. Publish exact counts and revisions.

**Acceptance:** Claimed profiles have zero failures, unsupported results, or
infrastructure errors. Reference application results do not expand Core claims.

**Execution note (2026-09-18):** The claim boundary is finalized in
[Draft 0.7 Composition Claim Evidence](../draft-0.7-composition-claim-evidence.md).
No Draft 0.7 Core conformance profile, capability declaration, claim metadata,
manifest format, vector-file format, portable error, or canonical operation is
added. Existing Draft 0.6 full-profile claims remain the closed Core claim
boundary, while Draft 0.7 reference profile results remain non-normative
application evidence.

### - [x] TASK-273 — Synchronize Documentation and Runnable Examples

**Depends on:** TASK-272.

**Deliverables:** Update root/package READMEs, example instructions, public API
documentation, spec/conformance/Agentic navigation, release notes, and status
tables where affected. Review AGENTS.md if architecture responsibilities change.
Explain policy inputs, action boundaries, limitations, and exact run commands.

**Verification:** Run examples from documented commands and check links,
architecture, licensing, and whitespace. Review every completion question below.

**Acceptance:** Documentation reflects implemented and verified scope, with no
planned capability described as shipped and no stale unsupported-domain claim.

**Execution note (2026-09-18):** Root README, release index, conformance
navigation, roadmap status, implementation READMEs, release notes, fixture
README, observation contract, and scenario matrix now distinguish Draft 0.6
closed Core claims from Draft 0.7 non-normative reference profile evidence.
Runnable commands are documented for fixture, scenario, comparison, critical,
and critical-mutant checks.

### - [ ] TASK-274 — Reproduce Draft 0.7 Closure Evidence in CI and a Clean Checkout

**Depends on:** TASK-273.

**Deliverables:** Provide a Draft 0.7 closure-grade command and CI path covering
toolchains, builds, static checks, unit/adapter/scenario tests, coverage,
conformance, mutation, cross-language comparisons, metadata, architecture,
documentation, licensing, checksums, provenance, and clean-tree checks.

**Verification:** Reproduce from committed inputs, both without generated
outputs and after coverage/mutation output exists. Exercise stale/missing
metadata and evidence failures. Preserve Draft 0.6 immutable artifacts; bind
new evidence to exact revisions without circular or moving-branch claims.

**Acceptance:** Required evidence reproduces, generated output does not corrupt
source checksums, and stale claims or provenance prevent closure.

**Execution note (2026-09-18):** Added `npm run verify:closure:draft0.7` and
`.github/workflows/draft-0.7-closure.yml`. The command sequences toolchain
checks, Draft 0.6 baseline inventory/version validation, builds, static
checks, native and adapter tests, full three-language conformance, Draft 0.7
reference scenarios, cross-language comparison, critical composition checks,
composition critical mutants, coverage, Core critical mutants, portability and
boundary reviews, architecture, documentation, license, whitespace, and
clean-tree checks. Draft 0.7 release-candidate checksum evidence is recorded
under `conformance/draft-0.7/checksums.json` and verified by
`npm run checksums:check:draft0.7`; Draft 0.6 checksum metadata remains
historical release evidence and is not regenerated for Draft 0.7
documentation/source changes. TASK-274 remains open until this command is
reproduced from the final committed clean checkout that includes the Draft 0.7
checksum/provenance gate.

### - [ ] TASK-275 — Close Draft 0.7 and Record the Draft 0.8 Handoff

**Depends on:** TASK-274.

**Deliverables:** Finalize inventories, compatibility/migration notes, findings,
implementation/profile outcomes, review status, checksums, and release scope.
Record the Draft 0.8 Agentic/security/privacy/external-review handoff. Prepare
the concrete release identity for explicit maintainer approval before creating
or publishing an immutable tag, following the existing release policy.

**Verification:** Check every closure item against final committed evidence.
Any final semantic or artifact change reruns affected verification gates.

**Acceptance:** Release notes and reproducible artifacts support every claim;
accepted tag/provenance requirements are fulfilled without rewriting historical
releases. Draft 0.7 is closed only after the complete exit gate passes.

## 10. Draft 0.7 Closure Checklist

- [ ] Corrected opening baseline and three-language full parity reproduced.
- [ ] Expense approval and invoice correction profiles explicitly declared.
- [ ] Every assertion classified and traced to requirements or application policy.
- [ ] Necessary normative resolutions accepted before vectors and implementation.
- [ ] Action boundaries and primary-error behavior defined without storage assumptions.
- [ ] Both profiles independently implemented in TypeScript, Python, and Java.
- [ ] All normative composition vectors pass across all three implementations.
- [ ] Failure atomicity and history preservation verified through actual operations.
- [x] No critical financial mutant survives; mutation/equivalent evidence recorded.
- [x] Domain/accounting/technical/security/privacy findings have explicit dispositions.
- [x] Closed claims distinguish normative conformance from reference scenario results.
- [x] Existing full-profile regressions remain green; scope counts are current.
- [x] Public APIs, examples, READMEs, and operation metadata are synchronized.
- [ ] CI and clean-checkout closure evidence, checksums, and provenance reproduce.
- [ ] Historical tags and evidence are preserved; approved release identity is recorded.
- [ ] External-review status and deferred Draft 0.8 topics are factual and explicit.

## 11. Completion Review

For each implementation or semantic task, explicitly evaluate whether updates
were required to unit tests, conformance vectors, mutation-sensitive tests,
JSDoc/Javadoc/Python API documentation, README documentation, `/spec`,
`/conformance`, `/agentic`, CoreDoc, and AGENTS.md. Make affected updates in the
same change; record why a category is not applicable when that matters.

Before closure, confirm that no test expectation became a second specification,
no adapter or runner acquired financial logic, no reference policy became an
undeclared Core rule, and no passing aggregate score concealed a critical defect.

## 12. Current Execution Status

```text
NEXT CODEX TASK: Continue TASK-274 by committing the Draft 0.7 closure command
and checksum/provenance gate, then reproducing
`npm run verify:closure:draft0.7` from a clean checkout.
```

Milestones A through D are implemented for the non-normative Draft 0.7
reference composition scope. Milestone E has started: TASK-271 findings review,
TASK-272 claim evidence, and TASK-273 documentation synchronization are
recorded. TASK-274 has closure/checksum tooling prepared but still needs final
committed clean-checkout reproduction; TASK-275 remains open. This document
does not claim Draft 0.7 release closure.
