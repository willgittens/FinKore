# FinKore Core 2.1 — Idempotency Task List

**Status:** Active working plan; no 2.1 implementation or release is complete.
**Date:** 2026-11-05.
**Current published baseline:** FinKore Core 2.0.2 stable.
**Design context:** [Idempotency and concurrency draft](idempotency-concurrency-draft.md).
**Origin:** [GitHub discussion #29](https://github.com/willgittens/FinKore/discussions/29).

## Objective and scope

Deliver a cross-domain, opt-in idempotency profile within FinKore Core, with
complete specified behavior and acceptance artifacts for these four scenarios:

1. Same scoped request identity and same instruction: replay the recorded outcome.
2. Same scoped request identity and different instruction: conflict without mutation.
3. Concurrent submissions of one request identity: at most one committed effect group.
4. Effect committed, response lost, then retry or restart: recover the original
   outcome without another committed effect.

Implementing this plan in this repository means delivering the specification,
conformance artifacts, Agentic Contract changes, consumer guidance, and
domain-neutral maintenance-tool support. Financial implementations, invocation
bindings, execution, fault injection, and implementation evidence belong to
consumers. Publishing the profile does not claim that an external implementation
has passed it.

The initial target is declared execution boundaries for
`finkore.entity.create`, `finkore.entity.mutate`, `finkore.entity.transition`,
and `finkore.workflow.transition`. Each needs a precise composition mapping;
an existing supplied-observation operation is not automatically a shared-state
or durable execution boundary.

General arbitration between different request identities, multi-entity
transactions, distributed coordination algorithms, global Audit ordering,
payment processing, ledger posting, and settlement remain outside this plan.
Same-identity concurrency and recovery safety are required profile properties;
their realization is consumer-owned.

The profile direction and four scenarios are the working scope. Detailed
policies listed under M0 remain decisions to resolve, not accepted normative
rules. All checkboxes below represent outstanding work. Milestone labels and
scenario numbers are planning references, not stable requirement or vector IDs.

## Delivery order

| Milestone | Depends on | Exit condition |
| --- | --- | --- |
| M0 — Scope and semantic decisions | Current draft and repository contract | Profile applicability and every policy affecting expected results are decided. |
| M1 — CoreDoc and specification | M0 | Normative behavior, stable IDs, errors, and compatibility classification exist. |
| M2 — Domain composition | M1 | Every target operation has an unambiguous profile mapping and regression obligations. |
| M3 — Conformance representation | M1, M2 | Versioned logical scenario and observation formats are specified. |
| M4 — Acceptance artifacts | M3 | All four central scenarios and applicable boundaries have specification-derived cases. |
| M5 — Maintenance tools | M3; validate against M4 | Structural and cross-reference checks accept valid artifacts and reject malformed ones. |
| M6 — Traceability and Agentic metadata | M1–M5 | Requirements, cases, capability claims, and descriptors agree. |
| M7 — Consumer and contributor guidance | M1–M6 | Adoption, migration, evidence obligations, and claim limits are documented. |
| M8 — Adversarial review and verification | M1–M7 | Applicable repository checks pass and identified contract gaps are resolved. |
| M9 — Stable publication | M8 | Disposable-tree and actual-final-tree publication gates pass after planning files are removed. |

This order does not authorize guessing missing semantics from a fixture or
weakening a gate to advance a milestone. Routine implementation choices follow
the accepted contract; any unresolved observable behavior stays a named blocker
for the affected work.

## M0 — Resolve scope and semantic decisions

- [ ] Recheck [CoreDoc](coreDoc/core-doc.md), owning specifications,
  conformance artifacts, [Agentic effects](../agentic/effects.md), and
  [compatibility policy](../spec/conventions.md#compatibility-policy), in that order.
- [ ] Define a profile claim separately from a domain-only or complete Core
  claim: version, supported operations, composing boundary, deployment boundary,
  applicable choices, and additional evidence obligations.
- [ ] Define the boundary for each of the four target operations, including
  target/creation scope, current-state authority, request facts, and observable
  committed effect group. Identify any mapping that cannot yet be specified.
- [ ] Resolve every decision below before deriving its expected results.
- [ ] Record the accepted decisions in the owning specification as M1 proceeds;
  keep candidate reasoning in the draft synchronized during development.

| Decision | Required resolution |
| --- | --- |
| Request identity | Define scope, canonical operation, key, opaque comparison, validation limits, and how scope is established without treating a key as tenancy or authorization. |
| Profile selection | Define explicit adoption and discovery; specify behavior when protection is not selected, unsupported, or selected with malformed input. Preserve the unselected operation contract. |
| Instruction boundary | List every financially or control-relevant caller input, definition identity/version, precondition, actor attribution, and context field. Distinguish instruction facts from current-state observations and transport metadata. |
| Guard dependencies | Retain consumer-authored declarations for maintenance. Apply the disposition below before completing either transition mapping; unresolved external-fact capture/comparison semantics block the affected mapping. |
| Instruction equivalence | Decide structural comparison versus explicitly specified semantic normalization, including decimal spellings, timestamps, object order, array order, omission, and null. Do not choose a hash algorithm as the semantic definition. |
| Admission | Define which validations occur before identity is bound, what is retained after admission, and what happens to repeated malformed input. |
| Domain rejection | Decide whether and which completed domain rejections are retained and replayed. Distinguish them from infrastructure failures and unresolved completion. |
| Pending and unresolved | Define distinct meanings, allowed observations, safe later transitions, and whether waiting is an optional consumer behavior. No success or terminal rejection without evidence. |
| Commit and recovery | Define consistency between the retained outcome, domain changes, and required Audit evidence; safe continuation after proven non-commit; and rejection of a stale execution's later commit. |
| Retention and reuse | Decide full-result retention, minimum binding evidence, exact expiry boundaries, and whether key reuse is ever permitted. Separate a replay window from the committed-effect guarantee and explain the cost of the chosen policy. |
| Policy changes | Preserve bindings and comparison meaning across upgrades, retained-data migration, scope retirement, and result loss. Changing a profile version cannot silently re-enable execution. |
| Errors and precedence | Define profile-level versus underlying domain failures, including simultaneous malformed instruction, payload conflict, stale precondition, and invalid definition. Keep access-control failures consumer-owned. |
| Claim limits | Define supported deployment/failure boundaries, unsupported features, evidence completeness, and how unavailable binding authority prevents an unsupported safety claim. |

**Exit:** no policy-dependent expected result is left to an implementer's guess.
If an issue remains undefined, state: “This behavior is not currently defined
by FinKore Core.” Document its financial/control impact and resolve it before
marking its dependent tasks complete.

### Guard dependency disposition before 2.1

Maintenance scope decision, 2026-11-07: preserve consumer-authored dependency
declarations and defer a portable authoring schema. This is a clarification
under SPEC-COMPATIBILITY-011, with no changed observable behavior. It does not
approve the proposed idempotency profile or finish this plan's M0. The
disposition is prepared for [Issue #15](https://github.com/willgittens/FinKore/issues/15);
remote publication remains pending GitHub authentication.

[Workflow Guards](../spec/workflow/guards.md), WORKFLOW-GUARD-004, requires
determinism for the same declared facts or identification of external-fact
dependence in the guard definition. CoreDoc CORE-005.3 also requires relevant
external dependence to be stated. Neither publishes a dependency interchange
shape, provenance vocabulary, capture boundary, or general snapshot-retention
policy. The fixture `{"fact":"x","equals":value}` compares a supplied own,
top-level fact; it cannot establish how an external value was obtained.

| Alternative | Authoring and evidence | Compatibility and limits |
| --- | --- | --- |
| Bounded portable declaration schema | Could describe dependency identities, their association with guards/definitions, and supplied evaluation context. Requiredness, omission/null, incomplete declarations, validation ownership, and evidence observations need explicit decisions. | New required shapes or rejection conditions are normative work. Review Core and artifact-format compatibility separately; do not assume a minor release or infer an error for an unspecified failure. No schema is accepted here. |
| Continue consumer-authored declarations — selected for maintenance | Keep the existing definition-level obligation. Review declared dependence, supplied facts/context, and supporting evidence using the owning guard document's non-normative prompts. | No new serialization, mandatory review protocol, claim field, error, or runtime behavior. Authoring portability remains limited; WORKFLOW-GUARD-004 stays PARTIAL with no directly mapped vector. |

Both alternatives distinguish declaring dependence, supplying a value, and
retaining evidence. A declaration alone proves neither source truth nor
freshness. Omission, null, or malformed content in a hypothetical portable
declaration has no defined new portable outcome. Existing definition/fixture
validation still applies; it does not specify that missing format.

Two consumer-policy examples show the control impact:

- A processing-window guard receives `windowOpen: true`. The application may
  explain it through an explicit evaluation instant and its cutoff policy.
  Consulting a live clock on retry may change the result. Core selects no
  cutoff, accounting date, or clock API.
- An eligibility guard receives `screeningClear: true` from an external check.
  Its declaration identifies that dependence; an opaque source observation
  reference and observed time may explain the value. A later provider answer
  does not reproduce the original basis. Core selects no provider, freshness
  interval, or authorization rule, and does not verify source truth.

For `finkore.workflow.transition` and `finkore.entity.transition`, M0/M2 still
need to resolve these distinct categories in the future profile:

| Category | Mapping decision |
| --- | --- |
| Caller instruction | Identify target, expected State/revision, definition binding, supplied guard facts, and relevant caller-selected context in the complete immutable instruction. Entity facts are explicit, never inferred from Entity data or Approval history. |
| Current-state observation | Identify current State/revision/binding and target-State validation data from the declared execution authority. An observed current value differs from the caller's precondition; do not silently substitute one for the other in comparison. |
| External-fact provenance | Identify which declaration, source observation, time, or other relevant context was caller-supplied and which was obtained at execution. Decide capture/admission order, binding, comparison significance, and recovery evidence for outcome-relevant values. No universal envelope is assumed. |

A bounded schema could standardize declarations without deciding these profile
questions. Consumer-authored declarations still need a complete proposed
projection and reviewable supporting evidence. A live dependency cannot simply
be omitted from consideration because the fixture compares only a Boolean.
Fully explicit supplied-fact mappings can progress without implementing the
whole RFC, once their profile-specific projection and evidence are accepted.
Live external dependencies remain blockers for their mapping until capture,
comparison, first-execution validation, and recovery meaning are specified.
Excluding a mapping from an initial profile also requires an explicit
applicability decision; it does not exempt current Core obligations.

The draft proposes replay without rerunning guards or refreshing facts. This
is a candidate profile rule, not current Core behavior or approval of an old
eligibility answer for a new instruction. Without defined binding and capture,
fresh evaluation can contradict the original outcome or permit another effect
after response loss: **This behavior is not currently defined by FinKore Core.**

If a schema is later selected, separately scope CoreDoc alignment, specification
and stable IDs, omission/null/validation/error semantics, manifest-discovered
positive and negative artifacts, traceability, Core and format-version
compatibility, and Agentic synchronization where operation contracts change.
No callback, provider integration, guard language, or new validation rule is
authorized here. Unrelated maintenance and independent 2.1 decisions can
proceed; unresolved external-fact behavior blocks the affected mapping and
claims depending on it.

## M1 — Establish the normative contract

- [ ] Review CoreDoc alignment for duplicate effects, rejected changes,
  committed evidence, Approval integrity, identity, and reproducible context.
- [ ] Define any necessary new foundation obligation with explicit scope.
  CORE-002.3 currently excludes retry and network handling; do not reinterpret
  it silently as an existing idempotency requirement.
- [ ] Preserve existing CoreDoc governance metadata; update only entries whose
  normative evolution is actually accepted, using the established conventions.
- [ ] Search active inventories, Git history, and [release history](releases/README.md)
  before assigning new requirement identifiers. Do not reuse retired IDs.
- [ ] Create the cross-domain specification, provisionally under
  `spec/idempotency/`, with purpose, applicability, terminology, normative
  requirements, invariants, errors, examples, and explicit non-goals.
- [ ] Specify scoped request identity, complete instruction binding, equality,
  profile input validity, ownership, and protection against caller mutation.
- [ ] Specify the logical lifecycle and a complete allowed-transition table:
  admission, in-progress execution, committed success, completed rejection
  according to policy, unresolved outcome, recovery, and expiry as applicable.
- [ ] Specify immutable completion association and the distinction between
  original result, replay delivery, and a fresh observation of current state.
- [ ] Specify same-identity arbitration, consistency of the committed effect
  group, and unchanged financial state/history for conflicts and replays.
- [ ] Specify response loss, restart, timeout, failover within the declared
  boundary, proof of non-commit, safe continuation, and stale-execution safety.
- [ ] Specify retention and reuse according to M0, with exact explicit-time
  boundaries and no inference that a lock timeout proves non-commit.
- [ ] Define portable profile error categories only in `/spec`, including
  precedence. Decide whether pending/unresolved/unavailable-result observations
  are result categories or errors; do not model them as accidental server errors.
- [ ] Define portable value representations, requiredness, omission/null,
  accepted limits, and safe diagnostics. Distinguish domain representations
  from test-only observation shapes.
- [ ] Update shared conventions, glossary, error inventory, and specification
  index where needed. Classify behavior and serialization compatibility.
- [ ] Demonstrate that non-adoption preserves existing valid inputs, outputs,
  errors, mutation semantics, and failure atomicity. If that cannot hold,
  follow the compatibility policy rather than force an incompatible minor release.

**Exit:** each central scenario and policy has normative requirements that
determine its allowed observations, with no new requirement defined by tooling.

## M2 — Map the profile to existing domains

- [ ] Define creation mapping for `finkore.entity.create`: identity scope before
  creation, retained resulting Entity identity, and prevention of duplicate creation.
- [ ] Define mutation mapping for `finkore.entity.mutate`: complete change
  instruction, expected subject, validation/mutability, and unchanged later
  Entity state when the original result is replayed.
- [ ] Define Entity transition mapping for `finkore.entity.transition`: explicit
  facts, Workflow definition binding and guards, target-State Entity validation,
  and the boundary between the retained result and current Entity observation.
- [ ] Define Workflow transition mapping for `finkore.workflow.transition`:
  governed definition, expected State/revision, explicit facts, original outcome,
  and preservation of the existing domain error priority on first execution.
- [ ] Apply the [guard dependency disposition](#guard-dependency-disposition-before-21)
  to both transition mappings: resolve caller facts, authoritative current state,
  and relevant external provenance before claiming a complete instruction.
  Carry live-dependency capture/comparison gaps as blockers for their mapping.
- [ ] Preserve the distinct meanings of Entity identity, Entity Revision,
  Entity Conflict Version, Workflow Instance Revision, and Workflow Definition Version.
- [ ] Show that replay of a successful transition is result retrieval, not
  another transition attempt from a later State or with refreshed facts.
- [ ] Preserve Audit duplicate-event rejection for a fresh append, and prohibit
  duplicate committed evidence when replaying a covered operation. Do not
  require Audit production where the composing domain does not require it.
- [ ] Show that admission does not bypass Approval/guard controls and replay
  does not refresh Approval effectiveness or authorize a new instruction.
- [ ] Preserve all existing unselected-operation regression cases. Add targeted
  composition cases where new normative behavior requires them.

**Exit:** every targeted operation can be tested without inventing production
APIs, financial effects, a persistence model, or a general concurrency guarantee.

## M3 — Define portable scenario artifacts

- [ ] Review the closed `0.1` [vector schema](../conformance/vector.schema.json)
  and [consumer guide](../conformance/consumer-guide.md). Select and document a
  compatible, explicitly versioned representation for the new scenarios.
- [ ] Keep Core version, manifest format, and scenario/vector-file format
  versions distinct. Define old-artifact handling and unsupported-version
  rejection; do not insert undocumented members into the published format.
- [ ] Keep [manifest.json](../conformance/manifest.json) as the only discovery
  entry point for every new acceptance artifact and its schema association.
- [ ] Specify one isolated scenario's initial state, request identities,
  instructions, explicit context, logical history, and requested observations.
  No scenario depends on another vector having run.
- [ ] Describe logical order/interleaving constraints and allowed observable
  histories without specifying threads, barrier APIs, a command language,
  transport envelopes, or a runner/adapter protocol.
- [ ] Define result, binding, current-state, committed-effect, and required
  evidence observations sufficient to detect duplicate effects behind a correct response.
- [ ] Distinguish portable pending/unresolved outcomes from consumer execution
  statuses such as `PASS`, `FAIL`, `UNSUPPORTED`, and `INFRASTRUCTURE_ERROR`.
- [ ] Define how permitted observations differ before and after controlled
  completion. Avoid a fixed concurrent winner or a check that passes when
  neither valid request commits the expected effect.
- [ ] Define explicit timestamps and expiry context, exact values and ownership,
  significant array ordering, and omitted/null distinctions without ambient facts.
- [ ] Update conformance conventions and operation mappings after these
  representations are accepted. Test-local labels remain test-local and do
  not become advertised Agentic operations.

**Exit:** scenario data has precise meaning and a published schema; execution
mechanics and financial comparison remain consumer-owned.

## M4 — Implement complete acceptance artifacts

For each central scenario, publish cases for every target operation with an
accepted M2 mapping. A case for only one operation does not establish coverage
for the other advertised operations. Document genuine non-applicability with
its governing requirement; do not use it to hide an incomplete mapping.

### Scenario 1 — Same identity and same instruction

- [ ] Cover successful first execution followed by one and multiple identical retries.
- [ ] Check original returned values and identities, retained instruction/outcome,
  current domain state, and no additional committed effect or required evidence.
- [ ] Cover replay after a later legitimate Entity/Workflow change; preserve
  current state rather than restoring or re-evaluating the historical result.
- [ ] Cover request/result ownership: changes to caller-owned values cannot
  mutate the retained binding or later replay observations.
- [ ] Cover a different key carrying the same instruction: it is not silently
  treated as replay and still follows the owning domain's normal checks.

### Scenario 2 — Same identity and different instruction

- [ ] Change each relevant dimension independently: subject, requested data,
  target State, definition binding, supplied precondition, relevant facts, and attribution.
- [ ] Check conflict while the original is pending, succeeded, rejected under
  the selected policy, or unresolved. Verify no overwritten binding/outcome.
- [ ] Verify unchanged current domain state, original effect, committed history,
  and required evidence after conflict.
- [ ] Pair each conflict with a same-instruction control and scope/operation
  separation controls to detect overbroad as well as missing comparisons.
- [ ] Test the accepted combined-failure precedence without substituting an
  unrelated Workflow/Entity error for a profile conflict.

### Scenario 3 — Concurrent submissions of one identity

- [ ] Describe controlled admission-before-completion histories with two
  matching attempts, then with several matching attempts.
- [ ] Cover both caller orderings and arrival after completion. Compare allowed
  histories without assigning business meaning to scheduler order.
- [ ] Before completion, require pending or waiting as allowed by the contract;
  prohibit competing commit authority and premature financial success.
- [ ] After successful completion, require the same original outcome and one
  committed effect group with complete required evidence, not merely equal responses.
- [ ] Add mixed-instruction contention: one identity cannot bind or commit
  competing payloads, and the losing payload cannot overwrite the retained result.
- [ ] Cover domain rejection and technical interruption without reporting a
  nonexistent success; pair with a valid successful execution control.

### Scenario 4 — Committed effect, lost response, retry/restart

- [ ] Describe a confirmed commit with no delivered response, followed by an
  identical retry that returns the original outcome without another effect.
- [ ] Cover restart and declared failover boundaries with retained identity,
  instruction, outcome, Entity identity, and required evidence references.
- [ ] Cover interruption before a proven commit, after a confirmed commit,
  and when commit status is unknown; require different justified observations.
- [ ] Permit continuation only with the contract's evidence of no prior effect
  and no surviving authority to commit it. Preserve the original bound instruction.
- [ ] Cover an old execution resuming after recovery: no second commit or
  overwrite of the authoritative outcome.
- [ ] Check that a pending timeout, expired lock, or elapsed retry window alone
  cannot turn unknown completion into safe re-execution.

### Supporting boundaries and defect resistance

- [ ] Cover missing, null, empty, malformed, and boundary-size profile values;
  verify admission side effects according to the accepted validation order.
- [ ] Cover identical keys in distinct scopes and canonical operations, including
  no cross-scope result disclosure and no inference of authority from a key.
- [ ] Cover object member reordering, significant array reordering, scalar/type
  changes, omitted/null changes, and exact decimal/timestamp rules chosen in M0.
- [ ] Cover retained domain rejection behavior and new-instruction behavior
  after changed facts, without silently converting infrastructure errors.
- [ ] Cover before, exactly at, and after result-retention expiry; expired
  bindings, scope retirement, and key reuse according to the accepted policy.
- [ ] Cover profile/comparison-policy upgrades, loss of binding authority,
  unavailable original results, and preservation of existing identities.
- [ ] Cover Workflow guards, target-State validation, mutability, Approval-sensitive
  facts, and required/non-required Audit production within the declared scope.
- [ ] Define non-disclosure and unchanged-outcome obligations without prescribing
  an authentication service, access-control model, or portable authorization error.
- [ ] Annotate mutation-sensitive intent and paired controls for dropped payload
  checks, scope loss, changed operation identity, duplicate execution, lost
  evidence, stale authority, replay overwrite, and unsafe timeout/expiry handling.
- [ ] Compare the completed cases against every scenario in the design draft;
  resolve omissions explicitly instead of silently narrowing the profile.

**Exit:** all accepted behaviors have portable cases where feasible and explicit
consumer-evidence obligations where static data cannot establish the property.

## M5 — Update domain-neutral maintenance tools

- [ ] Update [artifact validation](tools/validate-conformance.js) for the accepted
  discovery/schema versions, scenario structure, and safe declared paths.
- [ ] Validate global IDs, specification topics, requirement references,
  declared operation labels, portable errors, and paired controls across all
  manifest-discovered artifact kinds.
- [ ] Validate scenario references and observation shapes where structurally
  defined; reject unresolved, duplicate, cyclic, or contradictory references
  where the accepted format prohibits them.
- [ ] Add valid controls and negative tool fixtures for unsupported versions,
  undeclared errors, invalid outcomes, unknown fields, missing context, bad
  references, and scenario/schema associations.
- [ ] Require intended diagnostics and nonzero CLI results for negative cases;
  a crash or inability to load a fixture is not a successful rejection test.
- [ ] Update [traceability validation](tools/check-traceability.js) and
  [Agentic checks](tools/check-agentic.js) for the accepted profile structure.
- [ ] Extend architecture/tool tests only where needed to prevent accidental
  domain execution, API recreation, or an unsupported conformance claim.
- [ ] Preserve executable-tool purpose/effects headers and local, deterministic
  verification. Tools never calculate outcomes, arbitrate requests, or infer expected results.
- [ ] Keep CI and local verification on `npm run verify`, without financial
  execution, publishing, repository secrets, or vulnerability-network calls.

**Exit:** meaningful tool tests pass; validation proves artifact consistency
and structure, not an implementation's financial or concurrency correctness.

## M6 — Complete traceability and Agentic metadata

- [ ] Map every new normative requirement to manifest-discovered cases and
  honest coverage classifications; recompute domain/profile and total inventories.
- [ ] Distinguish portable logical-history coverage from deployment guarantees
  requiring native concurrency, persistence, ownership, or fault-injection evidence.
  Do not mark a requirement fully covered when a mandatory boundary remains uncovered.
- [ ] Update [capabilities](../agentic/capabilities.md),
  [discovery](../agentic/discovery.md), and
  [conventions](../agentic/conventions.md) with explicit profile applicability.
- [ ] Update descriptors in [operations](../agentic/operations.md) for each
  covered canonical operation, linking the accepted requirements and domain mappings.
- [ ] Describe original execution versus replay, pending/unresolved meaning,
  relevant preconditions, retention limits, errors, and disclosure obligations.
- [ ] Keep state/financial-state effects faithful to `/spec`; a profile claim
  does not make financial mutation known where the composing domain leaves it unspecified.
- [ ] Update [effects](../agentic/effects.md), [errors](../agentic/errors.md),
  [safety](../agentic/safety.md), and [examples](../agentic/examples.md), without
  inventing a new effect enum, operation alias, transport, or agent bypass.
- [ ] Make capability advertisement distinguish availability from conformance
  evidence; do not imply that base-operation support includes idempotency.

**Exit:** metadata and traceability agree with the normative profile and
disclose the limits of the published acceptance artifacts.

## M7 — Publish consumer and contributor guidance

- [ ] Update [implementation guidance](implementation-guide.md), root/domain
  indexes, and conformance guidance to explain profile adoption and its exact scope.
- [ ] Define the profile claim alongside existing domain and complete Core
  claims, with no retroactive idempotency promise for 2.0.2 implementations.
- [ ] Document version/manifest references, selected operations, deployment and
  retention limits, optional choices, exclusions, and required consumer evidence.
- [ ] Preserve `UNSUPPORTED` and infrastructure failures as non-passing results;
  define when missing execution evidence leaves a profile claim incomplete.
- [ ] Describe controlled histories and additional execution evidence without
  prescribing a runner, public adapter API, transport, or language framework.
- [ ] Explain migration of existing keys/bindings and recorded outcomes, opt-in
  deployment, comparison-policy changes, and prevention of accidental identity resets.
- [ ] Update [AGENTS.md](../AGENTS.md) and [Developer Tools](tools/README.md) for
  the accepted profile/artifact responsibilities and verification obligations.
- [ ] Regenerate affected Learn readers with `npm run learn:build`; include
  generated outputs with their canonical sources and review affected presentation.
- [ ] Record only concise actual implementation progress under Unreleased in
  existing release notes when work lands. Do not describe planned tasks as a
  completed release or create a separate closure/evidence report.

### Consumer-owned implementation and evidence obligations

Publishing these obligations is part of repository delivery. Completing them
against an implementation belongs to its consumer and is not a new repository
publication gate. A consumer cannot claim full profile conformance while its
required evidence is missing.

- [ ] Document how a consumer declares the authoritative boundary for bindings,
  original outcomes, current state, deployment failure model, and required evidence.
- [ ] Require execution of applicable sequential scenarios and native ownership tests.
- [ ] Require controlled concurrent submissions, order reversals, and observations
  that detect both duplicate effects and failure to commit the valid original effect.
- [ ] Require interruption/restart tests around commit and response delivery,
  safe continuation, unresolved outcomes, and stale-execution recovery.
- [ ] Require deployment-specific evidence for any claimed multi-instance or
  failover guarantee; finite portable cases alone do not establish it.
- [ ] Require mutation testing or equivalent defect-resistance evidence for
  critical guarantees, without adding a maintained language-specific mutation run.
- [ ] Explain reports identifying implementation/version, claim scope, policies,
  exercised histories, expected/observed outcomes, and limitations, without
  defining a new portable report protocol or committing consumer reports here.

**Exit:** an adopter can determine what to implement, what evidence to produce,
and which claims that evidence can support.

## M8 — Adversarial review and repository verification

- [ ] Review all four scenarios for hidden duplicate effects behind matching
  responses, vacuous success when nothing commits, and missing required evidence.
- [ ] Review instruction equivalence for excluded financial facts, implicit
  normalization, floating-point conversion, and confused identity/revision tokens.
- [ ] Review incomplete execution for unsafe timeout recovery, stale authority,
  lost bindings, policy resets, retention expiry, and false finality claims.
- [ ] Review domain composition for changed error priority, mutated failure
  state/history, Approval reuse, and conflation of replay with fresh execution.
- [ ] Review the profile-unselected path against the existing compatibility surface.
- [ ] Resolve every blocking semantic gap before marking implementation complete;
  retain honest partial/non-portable evidence classifications where appropriate.
- [ ] Check the supported Node environment, then run `npm ci --no-audit` and
  `npm run verify` on the actual development change.
- [ ] Run `npm run dependencies:audit` separately when a fresh dependency review
  is required; report its time and advisory-data scope independently.
- [ ] Review the final diff for stale current-facing documentation, identifier
  changes, unsupported scope, and unintentional generated-output changes.

Local preparation: the Core 2.0.2 maintenance M0 relocated the untracked legacy
`implementations/` and `runner/` directories into ignored local storage under
`.tools/legacy-checkout-pre21-hKUDPs/`, preserving file contents and internal link
referents. These directories no longer occupy the removed repository roots.
Keep that local storage outside publication and run checks on the actual tree;
a copied-tree pass does not substitute for actual-final-tree verification.

**Exit:** repository checks pass on the intended development tree and the
contract review has no unresolved blocker for the claimed profile scope.

## M9 — Prepare and publish the stable release

- [ ] Prepare a disposable proposed-release tree after M8; apply the reviewed
  final version/status changes there, without prematurely promoting development text.
- [ ] Review the deliberately selected `TARGET_CORE_VERSION` and necessary
  publication-check expectations for the accepted release; preserve gate strictness.
- [ ] Move enduring decisions, obligations, and contributor procedures into
  their owning documents. Remove this task list and the design draft from the
  proposed stable tree, with all links and dependencies on them removed.
- [ ] Do not copy planning files into an archive or replace them with a closure,
  provenance, checksum, or review-evidence report.
- [ ] Run the separate `npm run release:check -- /absolute/path/to/proposed-release`
  gate on the disposable tree and resolve genuine failures.
- [ ] After final-tree cleanup, align the actual release's CoreDoc/specification,
  conformance, Agentic, README, and generated Learn status declarations.
- [ ] On the actual final tree, run locked installation, `npm run verify`, the
  separately required fresh `npm run dependencies:audit`, and `npm run release:check`.
- [ ] Preserve format-version decisions, migration guidance, and stable IDs;
  write the concise dated release summary only when the release is actually ready.
- [ ] Tag/publish only through the authorized release procedure. Verification
  workflows remain artifact-only; Learn deployment retains its existing scope.

**Exit:** the final published tree passes both development verification and
the separate stable-publication gate, contains no working plans, and makes no
unsupported implementation-conformance claim.

## Definition of done for repository delivery

- [ ] All four central scenarios are completely specified for every advertised
  operation boundary, including concurrency, response loss, and recovery limits.
- [ ] Retention, rejection replay, equivalence, admission, and precedence have
  decided semantics, not fixture-driven or consumer-invented expected results.
- [ ] Applicable portable cases, negative/boundary controls, mutation intent,
  requirement traceability, and additional consumer-evidence obligations are complete.
- [ ] Maintenance tools and their tests validate all accepted artifact kinds;
  they do not execute or define financial behavior.
- [ ] Agentic metadata, claims, compatibility/migration guidance, and current
  documentation describe the same implemented repository contract.
- [ ] CoreDoc alignment, normative changes, stable identifiers/errors, domain
  composition, tool changes, documentation, and required checks have each been
  explicitly reviewed, following the repository change-discipline checklist.
- [ ] Development and stable-publication checks pass on their required trees,
  with separately required dependency review complete and accurately scoped.
- [ ] Planning files are absent from the stable tree, with concise release
  history retained only in the existing release notes.

External implementation execution is a separate consumer deliverable. Repository
completion means the contract and acceptance obligations are published and
validated; it is not evidence that a financial implementation has passed them.
