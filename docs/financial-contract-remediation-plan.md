# Financial contract remediation plan

**Status:** Active working plan; Milestones 0, 1, 2, and 3 are complete and Milestone 4 has not started.
**Prepared:** 2026-10-03.
**Baseline:** FinKore Core 1.0 stable, reviewed at commit `6534c76`.
**Proposed releases:** Compatible work in Core 1.1; incompatible behavior and
identity changes in Core 2.0, subject to the classification tasks below.

This plan addresses all eight findings in the
[financial contract review](financial-contract-review.md). It defines the
decisions, artifact changes, acceptance cases, migration work, and publication
gates needed to resolve them. Creating this plan authorizes no change to the
published financial semantics. Proposed rules below remain recommendations
until incorporated into the owning specification through the project workflow.

The default route uses two releases. Core 1.1 strengthens existing obligations
and clarifies consumer responsibilities. Core 2.0 completes the changes that
require a new outcome rule, identity boundary, or mandatory evidence. Publishing
1.1 does not mean that all eight findings have been resolved.

This is development material. Stable publication trees must exclude active
plans and copied planning content. Maintain the plan on the development branch,
move enduring guidance into existing contract or contributor documents, and
retain completed planning history only in Git. Published documents and checks
must remain usable without this file or the review document.

## Authority and scope

Use this source order for every task:

1. [CoreDoc](coreDoc/core-doc.md) for foundation obligations.
2. [Specification](../spec/README.md) for normative financial behavior.
3. [Conformance](../conformance/README.md) for derived acceptance artifacts.
4. [Agentic Contract](../agentic/README.md) for canonical operation semantics.
5. [Release history](releases/README.md) and Git for historical context.

The work publishes specification, fixtures, traceability, metadata, and
consumer guidance. Consumer-owned implementations execute financial behavior.
Repository tools validate structure and consistency; they must not implement
approval evaluation, arithmetic, redaction, guards, or other financial rules.

Keep ledger posting, tax, FX sourcing, settlement, statutory retention,
segregation of duties, authorization models, distributed ordering, unrestricted
approval graphs, and generic provenance standardization outside this work.
Approval subject binding and redaction evidence need bounded semantic rules,
not new registries, transports, or financial implementation packages.

While a reviewed result remains undefined, describe it as:

> This behavior is not currently defined by FinKore Core.

A fixture, an old implementation, or this plan cannot supply a missing rule.

## Version and compatibility policy

Apply [the existing policy](../spec/conventions.md#compatibility-policy)
before implementing each change. Release labels do not make a change compatible.

| Classification | Release treatment | Required evidence |
| --- | --- | --- |
| Editorial clarification | Eligible for 1.1 or a maintenance release | Existing inputs, outcomes, errors, and effects retain their meaning. |
| Additional coverage of existing obligations | Eligible for 1.1 or a maintenance release | Each expected result follows from existing normative requirements. |
| Additive contract capability | Eligible for 1.1 only when existing contracts remain intact | Omission preserves prior semantics; existing conforming consumers remain conforming. |
| Changed observable behavior | Core 2.0 | Identify changes to success/failure, results, errors, input/output requirements, mutation, or atomicity. |
| Artifact syntax change | Assess the conformance format independently | Publish the schema, format compatibility rules, and consumer migration guidance. |

The policy protects required inputs, outputs, error categories, preconditions,
postconditions, serializations, and state effects. Treat a rule resolving an
existing ambiguity as a normative change when it establishes new required
observable behavior. Do not describe it as editorial merely because its old
result was underspecified.

An incompatible canonical operation contract also needs the new operation
identifier or documented supersession path required by the policy. A new name
alone does not remove the major-version obligation for changes to existing
contracts. Additive opt-in capabilities are possible, but are not the default
route for these fixes and need their own complete specification and traceability.

Keep these version axes separate:

- **Core version:** Shared financial behavioral baseline.
- **Conformance format:** `finkoreConformance` and `finkoreVectorFile` syntax.
  The current format is `0.1`; changing the Core label does not change it.
- **Maintenance package version:** The private Node tooling package, currently
  `0.1.0`; it is not a financial implementation package or Core version.
- **Consumer versions:** Owned by external implementations and evaluation tools.

Preserve requirement, vector, portable error, and operation identities. A
materially different replacement requirement receives a distinct ID. Search the
active inventory, Git history, and release notes before assigning one. Retired
IDs remain unavailable. For each changed vector, inspect whether its existing
ID can retain its meaning; new behavior receives a new case rather than a silent
rewrite of an old financial expectation.

### Proposed release allocation

| Finding | Core 1.1 work | Work reserved for Core 2.0 by default |
| --- | --- | --- |
| 1 Approval conflicts | Document the existing gap and review the proposed rule early. | Define mandatory standalone aggregation and its observable outcomes. |
| 2 Subject binding | Explain existing subject/context association duties and publish faithful coverage or explicit coverage limits. | Add required binding information if the current boundary cannot represent it. |
| 3 Entity guard context | Add optional object-valued fact pass-through, reuse existing missing-fact guard rejection, and complete target-State validation descriptors and cases. | Define malformed supplied guard-context failure and the required canonical-operation supersession path. |
| 4 Redaction | Explain current limits and specify the proposed targeting/evidence design. | Mandatory source selection and stronger evidence linkage if they change published contracts. |
| 5 Decision addressability | Document accepted duplicate tuples and their lifecycle consequence. | Introduce stable Decision addressing and its import/migration rules. |
| 6 Applicability | Define optional-feature and SHOULD-exception applicability faithfully. | Any proposal that increases normative financial obligations. |
| 7 Atomicity coverage | Add observations and cases enforcing existing preservation rules. | Only a separately accepted change to failure effects, which this plan does not propose. |
| 8 Division | Complete existing explicit-rounding semantics and coverage. | Any new policy precedence or validation behavior not derivable from the current specification. |

If classification moves work from 1.1 to 2.0, update this allocation and its
milestone tasks before changing artifacts. Do not weaken the compatibility
policy to keep an intended release number.

## Ownership and task status

Checklist items start open and are updated as work completes. Task labels such
as F1.1 are local planning references, not FinKore requirement IDs. Assign a
maintainer before starting a work package; no individuals are assigned by this
document.

The specification author owns the normative proposal. A reviewer with financial
control knowledge challenges its outcomes and compatibility classification.
Artifact maintenance covers vectors, traceability, Agentic metadata, and tool
checks. The release maintainer owns version consistency and publication gates.
These responsibilities can be combined where necessary, but substantial
financial changes still need an explicit adversarial review.

Update task status in this active plan during development. Put lasting decisions
in the owning specification and guidance, and concise release summaries in the
existing release notes. Do not create separate closure or review-evidence reports.

## Milestones and dependencies

| Milestone | Tasks and dependencies | Exit condition |
| --- | --- | --- |
| M0 Establish the baseline | Confirm source inventory, existing requirements, errors, operations, and verification. | All eight findings have an owning boundary and a reproducible baseline. |
| M1 Decide semantics and compatibility | Depends on M0; complete the decision tasks in F1 through F8. | Proposed rules, unresolved questions, release allocation, and migration impacts are explicit. |
| M2 Strengthen compatible controls | Depends on M1; implement compatible F2, F6, and F7 work. | Subject-binding guidance is accurate; applicability is explicit; meaningful failure cases observe preserved state. |
| M3 Complete compatible operations | Depends on M1 and applicable M2 controls; implement compatible F3 and F8 work. | Entity guards and rounded division have aligned semantics, descriptors, and cases. |
| M4 Prepare and publish Core 1.1 | Depends on M2 and M3; complete tooling and publication tasks. | Compatible scope is published with remaining gaps disclosed and all release gates passed. |
| M5 Complete the stronger contract | Depends on M1; implement F1, F4, F5, and remaining work transferred to 2.0. Can proceed on the development branch before M4 finishes. | All newly required behavior is specified, mapped to artifacts, reviewed, and accompanied by migration guidance. |
| M6 Publish Core 2.0 and finish remediation | Depends on M4 and M5 under the default route. | Every finding meets its completion condition; the final publication tree has no active plan or unresolved required behavior for these boundaries. |

Milestones have evidence-based exit conditions rather than promised dates. The
release maintainer can schedule them after assigning owners and assessing the
M1 decisions. Begin the high-priority approval and guard decisions during M1;
do not defer their design review until after 1.1 publication.

### M0 baseline tasks

- [x] Record the exact starting commit and local changes in this active plan.
- [x] Confirm each finding against current owning documents and manifest-listed
  cases, including any changes made since the original review.
- [x] Check the active Node runtime against `>=24.11.0 <25`; follow the
  [toolchain guidance](tools/README.md#supported-node-setup) if bootstrapping is needed.
- [x] Run `npm ci --no-audit` and `npm run verify`; resolve baseline failures
  before attributing later failures to remediation.
- [x] Inventory affected current-facing documents, including the static Learn
  index where present. Avoid using old test or implementation claims as evidence.

#### M0 baseline record

Baseline capture completed on 2026-10-03 at commit
`6534c760cc3ea8fa841425b9cf989a83eb7e3c5b`. This is the same tracked tree as
the original review. Before the baseline commands, `git status --short
--untracked-files=all` reported no tracked modifications and exactly these two
untracked development documents:

- `docs/financial-contract-remediation-plan.md`;
- `docs/financial-contract-review.md`.

The active runtime was Node `v24.15.0` with npm `11.12.1`, satisfying
`>=24.11.0 <25`; no repository-local bootstrap was needed. `npm ci --no-audit`
completed from the locked dependency graph, and `npm run verify` passed. The
verified source inventory is 436 active normative requirements, 31 portable
error codes, six manifest suites, 42 manifest-listed vector files, 1,790
vectors, 35 conformance operation labels, 20 canonical `finkore.*` operations,
eight repository developer tools, and 28 passing maintenance-tool tests.
Installation kept the dependency advisory lookup disabled; M0 did not request
or run a fresh `npm run dependencies:audit` review.

The following finding audit used only files discovered through
`conformance/manifest.json`. Because `HEAD` still equals the reviewed commit,
there are no intervening tracked changes to reconcile.

| Finding | Current requirement, error, and operation boundary | Manifest evidence and reproduced result |
| --- | --- | --- |
| 1 — standalone conflicts | `APPROVAL-REQUIREMENT-004/-005`, `APPROVAL-DECISION-009/-012`, `APPROVAL-VALIDITY-001/-003`, and `APPROVAL-QUORUM-009/-010`; the existing Approval errors; conformance-local `approval.requirement.evaluate`. | The mixed-history cases in `approvals/construction-evaluation-regressions.json` and `approvals/fact-history-contracts.json` cover missing context or lifecycle/fact exclusion. None defines the outcome when opposing Decisions both remain effective. The gap remains. |
| 2 — subject binding | `APPROVAL-REQUIREMENT-001/-002`, `APPROVAL-DECISION-001/-003`, and `FINKORE_APPROVAL_INVALID_DECISION`; Approval record/evaluation and lifecycle fixture boundaries. | `approval.requirement.wrong-association-001` changes the Requirement ID. No case distinguishes equal identifiers and facts reused across different subjects or approval contexts, so the fixture-observability gap remains. |
| 3 — Entity guard context | `ENTITY-LIFECYCLE-001/-003`, `ENTITY-VALIDATION-001/-004`, `WORKFLOW-TRANSITION-004`, `WORKFLOW-GUARD-001/-003`, `FINKORE_WORKFLOW_GUARD_REJECTED`, and `FINKORE_ENTITY_VALIDATION_FAILED`; canonical `finkore.workflow.transition` and `finkore.entity.transition`. | All 78 Entity-transition vectors were rechecked: zero declare a guarded Workflow and zero supply top-level `facts`. The Entity fixture and Agentic descriptors still omit guard-fact supply, and the Entity descriptor still omits target-State validation failure. |
| 4 — redaction selection and evidence | `AUDIT-REDACTION-001/-003/-006`, `AUDIT-RELATIONSHIP-010/-013`, and the Audit portable errors; conformance-local `audit.redact`. | All 35 redaction vectors use only `history`, `policy`, and `redactionEvent` request members. None supplies an explicit source selector. `audit.relationship.redaction-preserves-001` and `audit.redaction.preserve-evidence-001` retain the reviewed target-selection and evidence-linkage limits. |
| 5 — Decision addressability | `APPROVAL-VALIDITY-005/-014/-015` and `FINKORE_APPROVAL_INVALID_DECISION`; conformance-local record, withdrawal, and Decision-supersession operations. | `approval.boundary097.record-unreferenced-equal-tuples-control-001` still accepts unreferenced equal tuples, while `approval.withdraw.target-ambiguous-001` rejects a later ambiguous target. The documented design risk remains internally consistent and unresolved. |
| 6 — applicability | `SPEC-CONFORMANCE-001/-002`, `MONEY-SERIALIZATION-006/-007`, `ENTITY-ERROR-002`, and `ENTITY-VALIDATION-005`; the consumer claim boundary rather than a financial operation. | `money.deserialize.unknown-members-001` still selects permissive success for a `MAY`; `entity.validation.complete-result-001` still requires recommended finding detail. The claim model requires every applicable vector to pass but declares no optional-feature or justified-`SHOULD` applicability mechanism. |
| 7 — failure atomicity | CoreDoc rejected-action obligations, `ENTITY-ERROR-001`, `ENTITY-MUTABILITY-004`, and `APPROVAL-ERROR-005/-006`; stateful Entity, Approval, Audit, Workflow, and evolution operations. | The review counts reproduce: 65 of 73 failing Entity-mutation cases, 56 of 69 failing Entity-transition cases, and all 12 failing Decision-supersession cases omit `expected.observations`. These remain review leads; malformed construction/import cases are not automatically atomicity defects. |
| 8 — rounded division | `MONEY-ARITHMETIC-005/-009`, `MONEY-ROUNDING-001/-007`, `FINKORE_MONEY_DIVISION_BY_ZERO`, `FINKORE_MONEY_ROUNDING_REQUIRED`, and `FINKORE_MONEY_INVALID_ROUNDING`; canonical `finkore.money.divide`. | All five division vectors accept only `value` and `scalar`; none supplies rounding. They cover three exact successes, zero division, and missing policy for a nonterminating quotient. The successful explicit-policy boundary remains absent from both fixture and Agentic descriptions. |

The affected current-facing documentation inventory is:

- foundation and specification: `docs/coreDoc/core-doc.md`,
  `spec/conventions.md`, and the owner documents named under Findings 1–8;
- conformance and consumer guidance: `conformance/README.md`,
  `conformance/conventions.md`, `conformance/operations.md`,
  `conformance/consumer-guide.md`, and `conformance/traceability.md`, with
  `conformance/manifest.json` and `conformance/vector.schema.json` affected only
  if an accepted applicability or representation decision changes format `0.1`;
- Agentic material: `agentic/operations.md` and, when an accepted operation
  change affects their claims, `agentic/README.md`, `agentic/capabilities.md`,
  `agentic/effects.md`, `agentic/errors.md`, `agentic/safety.md`, and discovery
  metadata;
- repository-facing guidance and navigation: `README.md`, `AGENTS.md`,
  `CONTRIBUTING.md`, `docs/implementation-guide.md`, `docs/tools/README.md`,
  `docs/releases/README.md`, and the present static index `learn/index.html`.

This record changes no CoreDoc obligation, normative requirement, conformance
expectation, portable error, stable identifier, or Agentic operation. It
establishes the reproducible M0 exit condition only.

### M1 decision tasks

- [x] Decide the standalone Requirement aggregation rule, compatibility class,
  validation interaction, and migration impact for F1.
- [x] Decide the 1.1 evidence boundary and the stronger scoped-reference model
  shared by F2 and F5.
- [x] Separate compatible Entity guard/validation completion from the undefined
  malformed-context error boundary in F3.
- [x] Decide the bounded redaction selector, evidence linkage, repeat behavior,
  validation order, and compatibility class for F4.
- [x] Decide Decision identity, lifecycle reference, import, coexistence, and
  legacy migration rules for F5.
- [x] Inventory every manifest case mapped to a `MAY` or `SHOULD` obligation and
  choose a claim-level applicability model for F6.
- [x] Inventory failure-observation gaps by operation and define the inclusion
  rule for compatible F7 coverage work.
- [x] Decide the explicit rounded-division input, omission/null behavior,
  policy-source boundary, error priority, and exact-result rule for F8.
- [x] Search the active inventory, release notes, and Git history for every
  planned requirement ID and portable error named below.
- [x] Review the cross-finding interactions in A7 and record the remaining
  deliberately undefined combined-failure boundary.

#### M1 decision record

M1 completed on 2026-10-03 against the unchanged M0 baseline. The specification
author and financial-control reviewer responsibilities were combined in this
user-directed working session; artifact implementation and publication review
remain separate later gates. The decisions below are accepted inputs to the
next milestones, but they do not change FinKore Core until incorporated into
the owning specification with coordinated conformance and metadata updates.

The per-finding checklists below remain open where their wording requires those
published artifact changes. M1 completion means their semantic, compatibility,
and migration choices are no longer open, not that later specification, vector,
traceability, Agentic, guidance, or release work has already occurred.

| Finding | M1 classification | Planned identifiers and contract treatment |
| --- | --- | --- |
| 1 | Changed observable outcome; Core 2.0. | Add `APPROVAL-REQUIREMENT-008`; retain existing requirement and error meanings. Approval operations remain conformance-local. |
| 2 | 1.1 guidance plus incompatible bounded representation in Core 2.0. | Add `APPROVAL-DECISION-013` for the scoped Requirement reference. No global registry or new portable error. |
| 3 | Derived/additive valid-context and existing validation work in 1.1; malformed supplied context in Core 2.0. | Add `ENTITY-LIFECYCLE-008` for fact pass-through. Add `WORKFLOW-ERROR-008` and `FINKORE_WORKFLOW_INVALID_CONTEXT` in 2.0, with canonical-operation supersession. |
| 4 | New required request and evidence content; Core 2.0. | Add `AUDIT-REDACTION-009` and `AUDIT-REDACTION-010`; reuse existing Audit errors and keep `audit.redact` conformance-local. |
| 5 | New mandatory identity and reference representation; Core 2.0. | Add `APPROVAL-DECISION-014` and `APPROVAL-VALIDITY-017`; retain the 1.1 tuple contract only in the 1.x line. |
| 6 | Compatible claim guidance and coverage correction; Core 1.1. | No normative requirement, vector-schema member, runner protocol, or portable error is added. |
| 7 | Additional coverage of existing atomicity obligations; Core 1.1. | No new normative requirement or portable error; retain qualifying vector IDs when only post-state observations are completed. |
| 8 | Additive explicit-policy capability preserving every existing call; Core 1.1. | Add `MONEY-ARITHMETIC-010` and `MONEY-ARITHMETIC-011`; keep `finkore.money.divide` and existing Money errors. |

CoreDoc already requires explicit context, guard enforcement, target-State
validity, rejected-action atomicity, retained evidence, and exact Money. M1
refines those obligations without changing foundation-level scope or governance
metadata, so no CoreDoc amendment is planned.

The planned requirement IDs and Workflow error above have no active or
historical occurrence in `/spec`, `/conformance`, `/agentic`, release notes, or
Git history. They are planned assignments for the owning specification changes,
not active requirements or errors while this plan remains non-normative.

##### F1 — standalone Requirement aggregation

The selected rule is rejection precedence over the complete effective Decision
set. After all required structure, association, eligibility, lifecycle, current-
fact/revision, expiration, and explicit-context validation succeeds, one or more
effective rejecting Decisions yield `REJECTED`; otherwise one or more effective
approving Decisions yield `APPROVED`; otherwise the applicable Requirement is
`PENDING`. Decision order, Actor equality, and decision timestamp order do not
change this aggregation. Timestamps remain occurrence evidence, not implicit
withdrawal or supersession.

Validation remains outcome-independent. Every supplied Decision receives its
currently required structural validation; every Decision tied to the evaluated
Requirement receives eligibility validation under APPROVAL-DECISION-012; and
APPROVAL-VALIDITY-013/-014 still govern required context and lifecycle history.
Withdrawal, Decision supersession, Requirement supersession, expiration, and
fact/revision staleness exclude evidence only under their existing rules. An
invalid or context-deficient request returns its existing portable error before
aggregation; this decision creates no total priority among unrelated Approval
errors and no conflict error.

Explicit conflict failure was declined because two individually valid opposing
Decisions are not malformed evidence and a new error would prevent the
Requirement's declared rejected outcome from expressing the conservative
control result. Latest-timestamp selection was declined because it would create
implicit lifecycle semantics. A caller-selected aggregation policy was declined
for the standalone Core operation because identical evidence would then have no
portable result; composing domains may still define separate higher-level
approval structures.

This is a new mandatory outcome for a previously undefined effective set, so it
is not editorial and belongs to Core 2.0 under a distinct requirement. Migration
preserves every historical Decision and lifecycle event. Consumers using first-
match, last-match, latest-timestamp, or approval-wins logic must replace that
logic; they must not rewrite old timestamps or delete opposing evidence.

##### F2 and F5 — scoped binding, Decision identity, and migration

Core 1.1 will explain the existing semantic obligation without claiming
unobservable portable coverage. A concrete history may remain externally scoped
to one immutable approval context and identified subject, but a consumer must
retain that scope through recording, evaluation, import, reuse, withdrawal, and
supersession. Relabeling a history into a different container is not binding
evidence. Traceability will identify this as a consumer-owned evidence duty when
the encoded Decision records are otherwise identical.

Core 2.0 will make detached records self-identifying at the bounded boundary:

- every Decision has a required nonempty opaque `decisionId`;
- every Decision has a required `requirementRef` containing nonempty opaque
  `contextId` and `requirementId` plus the exact bounded subject reference;
- the reference must match the evaluated or recorded Requirement's context,
  identity, and subject; fact equality cannot repair a mismatch;
- Decision identity is unique within `contextId`, immutable after commitment,
  retained after withdrawal or supersession, and never inferred from Actor or
  timestamp;
- Decision lifecycle references use `decisionRef` containing `contextId` and
  `decisionId`; Requirement supersession uses the scoped `requirementRef`;
- context identifiers are supplied and governed by the composing domain. Core
  requires no global context, Requirement, subject, or Decision registry.

Duplicate `decisionId` values in one context, a missing identity, a foreign-
context reference, a scoped Requirement/subject mismatch, and a missing
lifecycle target use `FINKORE_APPROVAL_INVALID_DECISION` and preserve both
Decision and lifecycle histories. Import validates the complete proposed scoped
history before accepting it. Equal Requirement/Actor/timestamp tuples remain
valid when their Decision identities differ. The stronger contract does not
support tuple and identity lifecycle references side by side; 1.x retains tuple
references, while a 2.0 claim requires migration to scoped identity references.

Migration uses an explicit mapping from each retained source Decision occurrence
to one new identity in its retained context. Original Decision fields,
timestamps, order, and lifecycle evidence remain unchanged. A legacy lifecycle
tuple that resolves uniquely maps to that Decision. An ambiguous tuple requires
explicit consumer resolution backed by source-system evidence; migration must
not choose the first record, fabricate timestamp precision, merge equal tuples,
or delete history. A record that cannot be resolved faithfully remains a
reported migration exception and cannot be claimed as automatically migrated.

##### F3 — Entity guard facts and target-State validation

WORKFLOW-GUARD-001 through -003 already establish that guards consume facts
provided for a Transition Request, every guard passes before State changes, and
failure is non-mutating. ENTITY-LIFECYCLE-001/-003 compose the Entity transition
through that Workflow. Core 1.1 will therefore add an optional object-valued
`facts` member to the Entity transition boundary and pass that exact value to
the referenced Workflow guard evaluator. Facts are never sourced implicitly
from Entity data, Approval history, authorization services, wall-clock state, or
other ambient state. Omission represents no supplied facts; an applicable guard
whose selected fact is absent uses the existing
`FINKORE_WORKFLOW_GUARD_REJECTED`. Unguarded existing requests retain their
current results, and supplied facts do not create a guard.

ENTITY-VALIDATION-001/-004 already require the complete proposed Entity to
satisfy rules applicable to its target State and to use
`FINKORE_ENTITY_VALIDATION_FAILED` for an applicable Entity business-validation
failure. That descriptor and coverage omission is compatible 1.1 completion,
not a new validation policy. Existing Workflow, Money, Approval, and Audit
primary errors remain preserved under ENTITY-ERROR-004. Rejection observes the
unchanged identity, type, data, State, Workflow binding, revision where present,
and supplied facts.

Explicit null, arrays, scalars, and other non-object `facts` values are distinct
from omission but have no accurate portable error in the current Workflow
catalog. `INVALID_DEFINITION`, `INVALID_INSTANCE`, and `INVALID_TRANSITION` do
not describe malformed request context, while `GUARD_REJECTED` describes a
well-formed guard result. M1 selects `FINKORE_WORKFLOW_INVALID_CONTEXT` under a
new `WORKFLOW-ERROR-008` for Core 2.0. Its limited transition priority follows
invalid Transition and precedes guard rejection; target-State Entity validation
runs only after the Workflow transition request, including context and guards,
has passed. Thus invalid/terminal/undeclared transitions retain their existing
primary errors, malformed context wins over target-State validation on an
otherwise valid transition, and this decision creates no priority among other
unrelated Entity failures. The exact replacement operation identifier versus
documented supersession path remains an explicit M5 naming decision that must
be resolved before changing the canonical descriptor.

Core 1.1 cases will isolate valid object facts, omission/missing fact, guard
success/rejection, and target-State validation. They will not claim a primary
error for malformed fact containers or combined malformed-context/target-
validation failures before the 2.0 context error and canonical supersession are
published.

##### F4 — redaction selector and evidence

Core 2.0 `audit.redact` will identify exactly one committed source Event with a
required top-level `sourceEventId`. Policy targets are resolved only within that
Event. An absent, malformed, or unknown selector, or a selected Event without
the declared supported protected target, uses
`FINKORE_AUDIT_REDACTION_INVALID`. Other matching Events are unrelated and stay
unchanged. Multi-Event redaction remains outside this operation.

The evidence Event will carry required redaction-specific content under
`metadata.redactionEvidence` with the selected `sourceEventId`, required policy
`authority`, and the exact declared `protectedTargets`; it carries `policyId`
only when the optional policy identifier was supplied. The evidence Event's
Entity reference must match the source Event, and its evidence content must
match the request selector and policy. No protected value is copied into this
metadata. This is a bounded redaction-evidence rule under AUDIT-EVENT-006, not a
generic provenance framework or a new Audit Relationship type. Existing
`CORRECTS`, `REVERSES`, `VOIDS`, and `SUPERSEDES` relationships retain their
meanings and cannot substitute for this linkage.

Validation follows the existing history-before-policy rule, then resolves and
validates the selected source and targets, validates the candidate evidence
Event under existing Event/Actor/duplicate/relationship rules, and finally
validates redaction-specific linkage consistency. Intrinsically malformed
evidence retains its existing Audit error; a structurally valid but mismatched
link uses `FINKORE_AUDIT_REDACTION_INVALID`. Every failure leaves source and
unrelated Events unchanged and appends no evidence.

A repeated redaction request with a new evidence Event identity is permitted and
creates another evidence occurrence; Core does not infer transport idempotency.
Reusing an already committed evidence Event identity returns
`FINKORE_AUDIT_DUPLICATE_EVENT`. The source Event remains committed and
unchanged in either case; successful output includes its redacted representation
and appends the linked evidence Event.

##### F6 — case applicability and claims

The complete modality scan found five manifest mappings to `MAY` or
`SHOULD`/`SHOULD NOT` requirements:

| Requirement and vector | M1 applicability decision |
| --- | --- |
| `MONEY-SERIALIZATION-006` — `money.deserialize.unknown-members-001` | Conditional. It applies only when the implementation declares before selection that it accepts unknown Money members. Strict rejection is not a PASS and FinKore defines no portable strict-parser error for this input. |
| `AUDIT-CHANGE-002` — `audit.change.before-after-001` | The runtime case remains applicable because prior/result values are already supplied and mandatory Event preservation governs them. The `SHOULD` authoring recommendation itself moves to consumer evidence or `NOT DIRECTLY TESTABLE`; this vector does not prove producers record values whenever safely possible. |
| `ENTITY-MUTABILITY-007` — `entity.mutate.terminal-metadata-001` | The runtime case remains applicable: its definition explicitly declares the field mutable, and mandatory declared-mutability rules govern the result. It does not force a composing domain to choose mutable operational metadata. |
| `ENTITY-ERROR-002` and `ENTITY-VALIDATION-005` — `entity.validation.complete-result-001` | Diagnostic `rule`/`path` detail is conditional on no documented `SHOULD` exception. Mandatory error code and unchanged-Entity behavior will receive an independent always-applicable case. |

Core 1.1 will use a documented vector-ID applicability table rather than adding
members to closed conformance format `0.1`. Before selecting cases, a claim must
declare optional features exercised and every justified `SHOULD` exception with
its affected requirement and vector IDs. The claim reports each excluded vector
and reason separately; exclusion is neither PASS nor `UNSUPPORTED`.
`UNSUPPORTED` and infrastructure failure remain non-passing execution outcomes,
and a failure observed at runtime cannot be retroactively reclassified as an
optional choice. Any future machine-readable applicability syntax requires its
own schema publication and format compatibility assessment.

##### F7 — failure atomicity scope

The manifest-wide inventory found 1,296 error cases, of which 559 omit
`expected.observations`; those totals are triage data, not 559 defects. The
highest-priority stateful gaps are:

| Boundary | Failing cases / lacking observations | M1 disposition |
| --- | ---: | --- |
| Entity mutate | 73 / 65 | Inspect first; complete identity, State, data, binding, revision, and declaration observations where a valid existing Entity is supplied. |
| Entity transition | 69 / 56 | Inspect first with the same complete Entity boundary and later guard-fact observations. |
| Decision record / withdraw / Decision supersede / Requirement supersede | 44 / 10; 13 / 6; 12 / 12; 12 / 10 | Complete both Decision and lifecycle histories whenever valid committed histories are supplied. |
| Requirement evaluation | 77 / 77 | Add history observations only where the request supplies valid committed history and the governing failure promises preservation; pure evaluation has no mutation result. |
| Workflow transition / import | 73 / 33; 26 / 26 | Complete valid instance State, binding, revision, and facts; malformed input remains consumer-native unchanged-input evidence. |
| Audit append / redact | 53 / 4; 25 / 1 | Complete valid committed history and relationship observations; do not normalize malformed candidate/history data. |

Entity evolution failures already carry observations in the current manifest,
but their completeness will still be reviewed for source, related/successor,
evolution, currentness, and Audit histories. Creation, condition evaluation,
chain/composition evaluation, and malformed construction/import cases do not
automatically need a fabricated committed-state observation. Where JSON cannot
represent object identity or rejected native input reuse, consumer-owned tests
must establish non-mutation instead.

An existing vector keeps its ID when M2 only adds observations already required
by the same failure and inputs. A new case is used when a distinct valid-state
setup or behavior is needed. Expected portable errors are not changed to make
atomicity assertions pass, and important failures receive a valid paired
control.

##### F8 — explicit rounded division

Core 1.1 `finkore.money.divide` will accept an optional complete `rounding`
object with non-negative integer `scale` and supported `mode`. Omission preserves
the current contract: an exact finite quotient succeeds exactly and a quotient
requiring precision reduction uses `FINKORE_MONEY_ROUNDING_REQUIRED`. Explicit
null, incomplete, malformed, negative-scale, or unsupported policy input uses
`FINKORE_MONEY_INVALID_ROUNDING`; it is not omission.

The generic canonical operation exposes an explicit request policy only. A
composing domain may instead define and bind a domain policy under
MONEY-ROUNDING-005/-007, but simultaneous caller and domain sources are not part
of this generic boundary; a composing specification exposing both must define
its own selection rule before invoking the Money semantics. Core therefore adds
no implicit precedence or ambient policy lookup.

After Money/scalar validation, a zero scalar retains
`FINKORE_MONEY_DIVISION_BY_ZERO` before optional rounding-policy validation,
preserving the existing zero-divisor result. For a nonzero scalar, a supplied
policy is validated even when the quotient terminates. A valid policy is applied
only when the mathematical quotient has no exact finite decimal representation.
An exactly representable quotient remains exact under MONEY-ARITHMETIC-007 even
when its scale is finer than the supplied policy scale; division does not become
an implicit call to `finkore.money.round`.

Rounded nonterminating results use the policy scale and mode, including the
defined negative-value difference between `DOWN` and `FLOOR`. Currency and the
operand remain unchanged. Midpoint behavior stays covered by the separate round
operation because a nonterminating decimal quotient does not supply a finite
exact midpoint at the target decimal boundary. This is additive: every existing
request and result keeps its meaning, while previously undefined requests with
a valid optional policy gain a success path.

#### M1 residual questions and gates

Only one design choice remains intentionally unresolved after M1: the exact
Core 2.0 canonical operation identifier or documented supersession path for the
malformed Entity guard-context contract. M5 must resolve it before changing
`finkore.entity.transition`; the current identifier cannot silently acquire an
incompatible error contract. Until that 2.0 contract is published, malformed
Entity guard-context outcomes remain undefined in the current Core.

No other M1 question blocks M2 or M3 compatible work. In particular, M1 does
not authorize early Core status changes, release-note claims, conformance format
changes, or implementation of the 2.0-only outcomes. Each later milestone must
still perform identifier-reference searches immediately before specification
edits in case repository history advances after this decision record.

## Finding 1 Standalone approval conflicts

**Owner documents:** [Requirements](../spec/approvals/requirements.md),
[Decisions](../spec/approvals/decisions.md),
[Validity](../spec/approvals/validity.md),
[Composition](../spec/approvals/composition.md), and
[Approval errors](../spec/approvals/errors.md).

**Proposed decision:** For an applicable standalone Requirement, evaluate the
complete effective Decision set after required validation. Any effective
rejecting Decision produces `REJECTED`; otherwise an effective approving
Decision produces `APPROVED`; no effective Decision produces `PENDING`.
An approving Decision with a later timestamp does not itself supersede a
rejection. Withdrawal, supersession, expiration, and staleness retain their
explicit current-effectiveness meanings.

This recommendation uses existing outcome categories and avoids adding a
conflict error. It does not change the quorum rule that opposing effective
outcomes for one voter are invalid evidence. Requirement applicability and
Chain rejection policies retain their separate roles.

- [ ] **F1.1** Review rejection precedence against explicit conflict failure and
  declared domain aggregation alternatives. Document the selected rule, its
  financial/control rationale, and why alternatives were declined in the
  owning document's explanatory text.
- [ ] **F1.2** Classify the rule as a normative behavior change; identify any
  affected existing requirement meanings and assign distinct IDs where needed.
- [ ] **F1.3** Define interaction with current facts, eligibility, expiration,
  withdrawal, Decision supersession, and Requirement supersession. Preserve
  existing context/structure validation before decisive outcomes; do not invent
  a total priority among unrelated concrete Approval errors.
- [ ] **F1.4** Add both Decision orders, same and different eligible Actors,
  repeated matching outcomes, no effective evidence, and lifecycle-excluded
  opposing evidence. Include quorum controls preserving its different rule.
- [ ] **F1.5** Update traceability, relevant fixture contracts, Chain examples,
  and Agentic metadata only where canonical operation semantics are affected.
- [ ] **F1.6** Document migration: consumers that previously selected approval
  or used timestamp precedence must change evaluation. Preserve historical
  Decisions; the release does not authorize rewriting past financial actions.

**Completion:** Equivalent effective Decision sets yield one specified outcome
regardless of order, while invalid/context-deficient evidence retains its
required error behavior. A fixture cannot bypass validation by encountering
an approval or rejection first.

## Finding 2 Subject and approval context binding

**Owner documents:** [Requirements](../spec/approvals/requirements.md),
[Decisions](../spec/approvals/decisions.md),
[fixture boundaries](../conformance/operations.md), and the
[implementation guide](implementation-guide.md).

**Proposed decision:** Treat association as the scoped Requirement plus its
approval context and identified subject. Subject fact equality is not subject
identity. A history confined to one context is a valid design only if its
binding remains established through every consumer boundary; accepting a new
container label must not silently rebind imported Decisions.

- [x] **F2.1** Specify which existing obligations already establish this binding
  and which guarantees belong to the composing domain. Cover recording,
  evaluation, history import/reuse, withdrawal, and supersession.
- [x] **F2.2** Decide whether scoped history alone can expose the required
  association faithfully or whether records need scoped references. Coordinate
  this choice with F5 so identity rules do not diverge.
- [x] **F2.3** Publish compatible guidance in 1.1. If portable fixtures cannot
  observe the binding, state the limitation in traceability and describe
  consumer-owned evidence. Do not claim a test distinguishes two records whose
  encoded association data are identical.
- [ ] **F2.4** If needed, define required context/subject information for 2.0 at
  the semantic and bounded-representation levels. Choose member names only
  after specification review; no global Requirement registry is required.
- [ ] **F2.5** Add same Requirement ID and matching facts across different
  subjects, different subject types, and different approval contexts. Include
  a same-subject valid control and checks preserving the exact scoped reference.
- [x] **F2.6** State the error category for invalid association in the owning
  specification before adding expectations. Retain existing invalid-Decision
  meanings where applicable, and test unchanged histories after rejection.

**Completion:** A Decision for invoice A cannot satisfy invoice B's Requirement
merely because their selected facts match. The contract explains how the
association is retained, and portable coverage or a clearly assigned consumer
evidence obligation observes that guarantee.

## Finding 3 Entity guards and target State validation

**Owner documents:** [Entity lifecycle](../spec/entities/lifecycle.md),
[validation](../spec/entities/validation.md),
[Workflow guards](../spec/workflow/guards.md),
[conformance operations](../conformance/operations.md), and
[Agentic operations](../agentic/operations.md).

**Proposed decision:** An Entity transition carries explicitly declared request
facts to its referenced Workflow guards. Facts are not silently sourced from
Entity data, authorization infrastructure, or ambient state. The complete
proposed Entity must also satisfy the rules applicable to its target State.
The exact context binding remains a specification decision, not an implementation
choice established by this plan.

- [x] **F3.1** Determine which context semantics follow from existing Workflow
  requirements and whether any new required inputs need 2.0 classification.
  Preserve successful existing unguarded requests and existing error mappings.
- [x] **F3.2** Describe fact supply, omission versus null, guard interpretation,
  and failure effects in the owning specification and both operation catalogs.
  Reuse the declared Workflow guard meaning; do not create a second evaluator.
- [x] **F3.3** Add passing, failing, and missing-fact cases under the accepted
  semantics, and retain malformed supplied context as explicitly undefined
  pending the accepted 2.0 boundary. Pair Workflow and Entity cases with
  equivalent guards and facts to detect composition bypass.
- [x] **F3.4** Observe unchanged Entity identity, type, data, State, and retained
  Workflow binding on rejection, plus unchanged guard facts where applicable.
- [x] **F3.5** Describe target-State validation and its applicable
  `FINKORE_ENTITY_VALIDATION_FAILED` outcome while preserving primary Workflow
  and other domain errors. Include native consumer guidance where a bounded
  fixture cannot express the state-dependent validator.
- [x] **F3.6** Align Agentic preconditions, postconditions, errors, effects, and
  relevant safety metadata. Approval observations remain declared inputs rather
  than authorization bypasses or proof of unspecified underlying checks.

**Completion:** The Entity transition boundary explains where guard facts come
from, exercises their effect, validates the target result, and preserves the
complete original observation after a rejected request.

## Finding 4 Redaction target and evidence

**Owner documents:** [Audit redaction](../spec/audit/redaction.md),
[relationships](../spec/audit/relationships.md),
[errors](../spec/audit/errors.md), and
[the redaction fixture contract](../conformance/operations.md#audit-operations).

**Proposed decision:** A redaction request identifies one committed source Event
explicitly. Protected paths describe content within that Event. A redacted
representation preserves essential evidence, and the new evidence Event
identifies its source and declared policy authority/basis without repeating
protected values. Multiple-event redaction would need a separately defined
scope and is outside this proposal.

- [ ] **F4.1** Review this bounded targeting/evidence proposal and classify its
  required inputs, success observation, and evidence obligations. Current
  selection and minimum evidence do not already establish all these rules.
- [ ] **F4.2** Define missing/unknown target handling, unsupported protected
  content, and linkage validation. Decide repeated-redaction behavior explicitly
  while preserving duplicate Audit Event identity rules; do not assume transport
  idempotency or guess a new error-priority order.
- [ ] **F4.3** Define minimum semantic evidence and a bounded representation.
  Keep policy IDs optional where required by existing contracts until any
  replacement is explicitly versioned. Authority remains required; an ID alone
  cannot authorize or select content.
- [ ] **F4.4** Preserve the closed relationship catalog. Do not add a `REDACTS`
  relationship implicitly or expand generic Event provenance requirements.
  If the bounded design cannot be expressed within the accepted scope, resolve
  that scope decision before claiming this finding complete.
- [ ] **F4.5** Add two matching source Events, selection of each separately,
  unrelated-event preservation, invalid target, missing authority, malformed
  evidence linkage, and duplicate evidence identity cases.
- [ ] **F4.6** Check preserved Event identity, type, subject, time, Actor identity,
  supplied Actor type, and ordering relationships. Committed source Events remain
  unchanged; successful evidence append and redacted representations follow
  the accepted contract, and failure appends no partial evidence.
- [ ] **F4.7** Update the conformance-local boundary, traceability, and consumer
  guidance. The local `audit.redact` label does not become a canonical Agentic
  operation merely because its fixtures change.

**Completion:** Two Events with matching protected paths cannot create a
selection ambiguity, and the published evidence can establish which Event was
redacted under what declared basis without exposing protected content.

## Finding 5 Decision addressability and migration

**Owner documents:** [Approval validity](../spec/approvals/validity.md),
[Decisions](../spec/approvals/decisions.md),
[lifecycle fixture conventions](../conformance/operations.md), and
[consumer guidance](../conformance/consumer-guide.md).

**Proposed decision:** Introduce a stable, opaque Decision identity within the
declared approval context for the stronger contract. Lifecycle references target
that identity within its scope. Actor and timestamp retain their evidentiary
meaning; equality of occurrence instants does not itself define Decision identity.
Exact timestamp precision and supplied lexical spelling remain preserved.

- [ ] **F5.1** Document the current permitted-duplicate consequence in 1.1,
  including why whole-Requirement supersession is broader than withdrawing one
  Decision. Retain the existing equal-tuple success control and ambiguous-target
  rejection under the current contract.
- [ ] **F5.2** Specify 2.0 identity scope, uniqueness, immutability, retention,
  and reference resolution together with F2. Duplicate tuple values with distinct
  identities should remain representable; this proposal does not reject those
  historical Decisions merely to avoid an addressing problem.
- [ ] **F5.3** Define record/import behavior for duplicate identities, missing
  identities, foreign-context references, and missing lifecycle targets. Specify
  primary portable errors before fixtures; avoid a global identity registry.
- [ ] **F5.4** Update withdrawal and Decision-supersession references, retained
  relationship validation, and any affected operation contracts. Review each
  materially changed requirement and preserve continuing history obligations.
- [ ] **F5.5** Define consumer migration using an explicit mapping from retained
  source records to scoped identities. Preserve original Decisions and timestamps.
  Do not resolve ambiguous legacy tuple references by selecting the first record
  or fabricating a unique timestamp. Unresolvable mappings require explicit
  consumer resolution and cannot be reported as faithful automatic migration.
- [ ] **F5.6** Add equal tuples with distinct identities, duplicate identity
  rejection, selective withdrawal, selective supersession, offset-equivalent
  instants, nanosecond-distinct instants, history reuse, and migration controls.
- [ ] **F5.7** Document whether older and newer reference representations coexist
  or use a supersession path. Avoid optional-ID claims of compatibility if
  ignoring the ID changes reference resolution.

**Completion:** Two accepted Decisions with the same requirement/actor/instant
can be addressed independently in the stronger contract, and migrated history
retains its financial meaning and valid relationships.

## Finding 6 Optional behavior and applicable cases

**Owner documents:** [Specification conventions](../spec/conventions.md),
[Money serialization](../spec/money/serialization.md),
[Entity errors](../spec/entities/errors.md),
[validation](../spec/entities/validation.md), and
[conformance claim guidance](../conformance/consumer-guide.md).

**Proposed decision:** Applicability follows the specification's modalities.
Optional behavior is declared before case selection. A justified SHOULD
exception is visible in the claim. Neither is a general permission to skip
mandatory behavior or count unsupported execution as passing.

- [x] **F6.1** Inventory vectors selecting a MAY behavior or requiring
  recommended diagnostics. Start with unknown Money members and Entity rule/path
  findings, then inspect the remaining manifest rather than assuming these are
  the only cases.
- [x] **F6.2** Define the declarations needed to establish applicability and
  map affected vector IDs to their conditions in existing consumer guidance.
  Keep result representation consumer-owned; publish no runner protocol.
- [x] **F6.3** Separate mandatory amount/currency preservation and portable
  failure behavior from optional extension acceptance and recommended diagnostic
  detail. Ensure mandatory obligations retain independent acceptance cases.
- [x] **F6.4** Specify disclosure of excluded cases and reasons. They are not
  PASS results. `UNSUPPORTED` and infrastructure failures retain their current
  non-passing meanings; a runtime failure cannot be relabeled an optional choice.
- [x] **F6.5** Decide whether documentation and a vector-ID applicability table
  are sufficient. If machine-readable metadata is accepted, publish schema and
  format-version changes first. Format `0.1` is closed; do not add undocumented
  members such as an applicability flag to existing vectors.
- [x] **F6.6** Review permissive and strict parser claim examples, accepted and
  unjustified SHOULD exceptions, and attempts to skip mandatory requirements.
  Do not invent a portable error for a strict parser's unknown-member rejection
  where the specification does not define one.
- [x] **F6.7** Update traceability and domain-neutral tool checks as needed to
  validate declared references and structure. Tools must not execute policy
  choices or compute financial outcomes.

**Completion:** A conforming strict parser and a conforming permissive parser
can make accurate, scoped claims, while accepted extensions cannot change Money
meaning and diagnostic exceptions cannot conceal mandatory failures.

## Finding 7 Failure atomicity observations

**Owner documents:** [CoreDoc](coreDoc/core-doc.md),
[Entity errors](../spec/entities/errors.md),
[Approval errors](../spec/approvals/errors.md), and
[expected observations](../conformance/consumer-guide.md#expected-observation).

- [x] **F7.1** Inventory stateful failure cases across the manifest. Distinguish
  existing valid state, malformed construction/import data, and partially
  observed histories. The review's missing-observation counts are review leads,
  not proof that every listed case has an observable atomicity defect.
- [x] **F7.2** Add complete relevant observations for Entity mutations/transitions
  and Approval lifecycle failures first. Cover identity, State, data, binding,
  revision where supplied, and both Decision and lifecycle histories.
- [x] **F7.3** Inspect Audit, Workflow, and Entity evolution failures for the same
  omission. Include related Entity, relationship, evolution, and Audit histories
  where the governing operation promises preservation.
- [x] **F7.4** Preserve valid vector IDs and error expectations when extending
  observations of existing obligations. Pair important failures with controls
  that succeed when the invalid condition is removed.
- [x] **F7.5** Document consumer checks for unchanged malformed native inputs and
  subsequent reuse where JSON fixtures cannot express retained object state.
  Do not normalize invalid input into an invented valid committed observation.
- [x] **F7.6** Record mutation intent for partial State changes, dropped lifecycle
  history, modified identity/data, and appended evidence despite failure. Update
  traceability from actual cases without asserting implementation execution.

**Completion:** For each relevant rejection boundary, returning the expected
error while changing promised state would contradict a requested observation
or an explicitly documented consumer evidence obligation.

### M2 implementation record

Milestone 2 completed the compatible F2, F6, and F7 controls without adding a
Core requirement, portable error, canonical operation, runner boundary, or
conformance-format member. CoreDoc remains aligned and unchanged. Agentic
metadata is unaffected because no canonical operation input, result, effect,
precondition, postcondition, error, or safety claim changed.

For F2, the Approval specification and consumer boundaries now explain that a
Requirement identifier is stable within its approval context, matching facts
are not subject identity, and a Core 1.0 history without encoded scope must be
immutably bound to one context and subject across record, import, reuse,
evaluation, withdrawal, and supersession. Detected cross-scope reuse remains
`FINKORE_APPROVAL_INVALID_DECISION` and preserves both histories. Portable JSON
cannot distinguish byte-identical histories relabeled outside the fixture, so
traceability classifies **APPROVAL-DECISION-002** as `PARTIAL` and claims require
consumer-owned persistence and reuse evidence. F2.4 and F2.5 remain open for the
stronger 2.0 scoped-reference representation; M2 did not invent that shape.

For F6, the consumer guide contains the complete format `0.1` conditional-case
table: `money.deserialize.unknown-members-001` follows a predeclared permissive
unknown-member choice, and `entity.validation.complete-result-001` follows the
absence of justified exceptions to the recommended diagnostic obligations.
Excluded cases remain visible with reasons and are neither `PASS` nor
`UNSUPPORTED`. New mandatory case
`entity.validation.failure-atomicity-required-001` independently checks the
portable validation error and unchanged Entity without requiring recommended
findings. The traceability tool now validates applicability-table vector
references and duplicates without evaluating financial policy.

For F7, the manifest audit separated valid pre-existing state from malformed
construction/import evidence. Fifteen existing Entity mutability rejection
cases now observe the complete unchanged Entity and retain their successful
paired control; two direct withdrawal failures and 24 lifecycle discovery
failures with explicit history now observe both Decision and lifecycle
histories. The four remaining discovery failures supply null or an envelope
without a history array, so they do not invent a committed observation. The new
mandatory validation case observes identity,
State, and all data while guarding against partial multi-field mutation. Audit,
Workflow, and Entity evolution already carried complete state/history
observations for their meaningful rejection boundaries reviewed here. Cases
whose malformed native input cannot denote valid committed state retain the
explicit consumer obligation to compare the original object graph and exercise
subsequent reuse rather than publishing a normalized fictional observation.
The mutation intent covers partial Entity changes, identity/State/data changes,
dropped Approval lifecycle evidence, and append-after-failure defects.

Traceability now inventories 436 requirements and 1,791 vectors: 351
requirements are `COVERED`, five are `PARTIAL`, and 80 are `NOT DIRECTLY
TESTABLE`. The moved classifications distinguish an optional Money branch,
recommended Entity diagnostics, the Approval history-scope limitation, and the
Audit authoring recommendation from mandatory runtime behavior. Final M2
verification used Node `v24.15.0` and npm `11.12.1`. The first sandboxed
`npm ci --no-audit` attempt could not resolve `registry.npmjs.org`; the approved
network retry installed the locked five maintenance packages with the advisory
lookup still disabled. `npm run verify` then passed: six suites, 42 files, 1,791
vectors, 35 conformance operation labels, 20 canonical operations, eight
developer tools, 29 tool tests, documentation links, traceability, licenses,
architecture, and whitespace checks. No dependency advisory review or stable
publication gate was requested or run for this development milestone.

## Finding 8 Explicit rounding during division

**Owner documents:** [Money arithmetic](../spec/money/arithmetic.md),
[rounding](../spec/money/rounding.md),
[errors](../spec/money/errors.md),
[Money fixture contracts](../conformance/operations.md#money-operations), and
[Agentic division](../agentic/operations.md#finkoremoneydivide).

**Proposed decision:** Division receives an explicitly supplied or
domain-declared policy identifying scale and mode when the quotient cannot be
represented exactly. An exactly representable quotient remains exact under
MONEY-ARITHMETIC-007. Currency minor-unit scale is never an implicit policy.

- [x] **F8.1** Reconcile the arithmetic, rounding, Agentic, and fixture descriptions
  of policy supply. Identify genuinely undefined policy precedence or malformed
  policy handling; specify and classify new behavior before creating expectations.
- [x] **F8.2** Describe policy omission, supplied null, complete policy, and
  domain-declared policy without changing existing no-policy calls. Clarify
  simultaneous policy sources only if the accepted boundary supports them.
- [x] **F8.3** Add recurring positive and negative quotient cases. Include mode
  distinctions such as negative `DOWN` versus `FLOOR`, multiple explicit scales,
  missing policy, invalid policy, and division by zero under defined priorities.
- [x] **F8.4** Preserve existing exact cases, including very long terminating
  quotients. Add an exact quotient finer than a supplied policy's scale to guard
  against silently introducing rounded division of exactly representable results.
- [x] **F8.5** Keep midpoint tests in the explicit rounding operation. For example,
  `1 / 8` is exactly `0.125`; expecting division itself to return `0.13` would
  contradict the current exactness rule. Nonterminating division does not supply
  an exact finite midpoint tie at a decimal rounding boundary.
- [x] **F8.6** Verify unchanged operands, currency preservation, output scale
  interpretation, portable errors, and matching Agentic effects. If a desired
  rounded-exact division feature is proposed, classify it separately for 2.0.

**Completion:** The operation describes a faithful explicit policy boundary,
successful nonterminating calculations have acceptance cases, and exact
quotients retain their defined value without defaults or precision caps.

### M3 implementation record

Milestone 3 completed the compatible F3 and F8 operation work. CoreDoc remains
aligned and unchanged. The specification adds the three identifiers reserved
in M1: **ENTITY-LIFECYCLE-008**, **MONEY-ARITHMETIC-010**, and
**MONEY-ARITHMETIC-011**. It adds no portable error, canonical operation,
runner or adapter boundary, implementation package, or conformance-format
member. Existing calls retain their prior meaning when the new optional inputs
are omitted.

For F3, `finkore.entity.transition` now accepts optional object-valued request
facts and passes that exact object to the referenced Workflow guard evaluator.
Omission supplies no facts; Entity data, Approval evidence, authorization,
time, and ambient state do not manufacture facts, and supplied facts do not
create a guard on an unguarded transition. Guard failure retains
`FINKORE_WORKFLOW_GUARD_REJECTED`. After Workflow acceptance, the proposed
target-State Entity is checked by the applicable Entity validators and failure
retains `FINKORE_ENTITY_VALIDATION_FAILED`. Both failures preserve the complete
Entity, binding, and supplied facts. Seven new Entity vectors cover pass,
rejection, missing facts, unguarded no-effect behavior, target validation, and
guard-before-validation priority. Non-object supplied facts remain undefined by
the current contract and intentionally have no expectation; M1 reserved that
malformed-context rule, error, and operation supersession work for Core 2.0.

For F8, `finkore.money.divide` now accepts one optional complete request policy
with non-negative integer `scale` and a supported `mode`. A valid policy rounds
only a nonterminating quotient; omission preserves the existing
rounding-required behavior, and an exactly representable quotient remains exact
even when finer than the supplied scale. Explicit null, incomplete or malformed
policies, negative or non-integer scales, and unsupported modes use
`FINKORE_MONEY_INVALID_ROUNDING` for a non-zero scalar. Zero is checked first
and retains `FINKORE_MONEY_DIVISION_BY_ZERO`. Ten new Money vectors cover two
positive recurring quotients, negative `DOWN` versus `FLOOR`, invalid policy
forms, zero-error priority, exact-result preservation, unchanged operands,
currency, and explicit result scale. The generic boundary defines no precedence
between simultaneous request and domain policy sources and performs no ambient
or currency-minor-unit lookup.

Traceability now inventories 439 requirements and 1,808 vectors: 355 are
`COVERED`, five are `PARTIAL`, and 79 are `NOT DIRECTLY TESTABLE`. The new
atomic rejection observations also make **WORKFLOW-TRANSITION-007** directly
covered. Agentic operation, discovery, effects, and safety metadata; conformance
operation and consumer guidance; implementation guidance; the manifest; and
the domain-neutral traceability test all match the published artifacts.

Final M3 verification used Node `v24.15.0` and npm `11.12.1`. The first
sandboxed `npm ci --no-audit` attempt could not resolve `registry.npmjs.org`;
the approved network retry installed the five locked maintenance packages with
the advisory lookup disabled. The first `npm run verify` identified one stale
Money inventory value in the traceability validator's negative test; after that
fixture was updated, verification passed: six suites, 44 files, 1,808 vectors,
35 conformance operation labels, 20 canonical operations, eight developer
tools, 29 tool tests, documentation links, traceability, licenses,
architecture, and whitespace checks. No dependency advisory review or stable
publication gate was requested or run, and M4 publication work has not started.

## Shared artifact and review tasks

Apply these tasks to each implementation change, keeping the affected layers in
one reviewable change. Large findings may use several coherent changes rather
than one repository-wide rewrite.

- [ ] **A1** Check CoreDoc alignment. Change foundation text only if genuinely
  necessary; preserve governance metadata during editorial changes.
- [ ] **A2** Search all references before assigning, superseding, or retiring any
  stable identifier. Preserve continuing obligations and historical identity;
  record retirements concisely under Unreleased in existing release notes.
- [ ] **A3** Add positive, negative, boundary, invariant, and mutation-sensitive
  cases appropriate to each rule. Each expected result cites valid requirements;
  discover files only through the manifest.
- [ ] **A4** Update conformance conventions, operation contracts, traceability,
  actual counts, and applicability guidance. Never let fixtures define new rules.
- [ ] **A5** Update canonical Agentic descriptors and registry entries where
  inputs, results, errors, effects, preconditions, or safety claims are affected.
  Keep conformance-local labels local and do not create aliases.
- [ ] **A6** Update READMEs, implementation guidance, consumer guidance, static
  documentation, and AGENTS instructions only where their content changes.
- [ ] **A7** Review interactions: opposing Decisions in a foreign subject context;
  duplicate timestamps during withdrawal; approval facts used by an Entity guard;
  missing guard context plus target-State failure; and redaction failure after
  candidate evidence preparation. Do not invent undefined error priorities.
- [ ] **A8** Review plausible defects against the cases: approval-first shortcuts,
  identity comparison using facts, skipped Entity guards, arbitrary redaction
  selection, first-match lifecycle addressing, hidden case exclusions, partial
  mutation before errors, and implicit Money rounding.

Finite cases provide defect resistance, not an exhaustive financial proof.
Consumer execution or mutation evidence, if supplied, must identify the actual
implementation, release/manifest, scope, and method. Such execution is outside
the repository's maintained verification gates.

## Tooling and release tasks

The current [publication checker](tools/check-release-content.js) hard-codes
the Core 1.0 stable declaration and treats other current Core labels as stale.
Preparing 1.1 or 2.0 therefore requires a deliberate maintenance-tool update,
not merely replacing document version strings.

- [ ] **R1** Define how the checker identifies the intended stable Core version
  of the proposed tree. Validate agreement across required documents and
  CoreDoc version/status; do not accept arbitrary matching strings as proof
  that the intended release was prepared.
- [ ] **R2** Extend [publication tool tests](tools/test/check-release-content.test.js)
  for the intended version, mixed/stale status, candidate status, missing required
  declarations, active/renamed plans, broken static links, and preserved CoreDoc
  governance metadata. Keep rejecting obsolete implementation surfaces.
- [ ] **R3** Update other validators only for accepted structural or metadata
  changes. Add meaningful tests for new validation behavior and retain purpose,
  effects, and domain-neutrality comments in executable tools.
- [ ] **R4** Update tooling and contributor instructions to describe the selected
  release target and independent format versions. Do not add GitHub Actions,
  financial execution, packages, or a runner/adapter API.
- [ ] **R5** For each proposed release, document consumer migration: added cases,
  applicability declarations, changed requirements, new reference/evidence
  shapes, operation supersession, and handling of historical records.
- [ ] **R6** In a disposable proposed-release tree, remove development plans and
  unneeded review material, promote only reviewed status text, and run the stable
  publication gate. The disposable check does not promote the working checkout.
- [ ] **R7** Preserve this still-active plan on the development branch while
  publishing the separate 1.1 tree. Continue the remaining tasks on the 2.0
  development branch; do not publish an archive copy of the plan. At final
  completion, remove the active plan after moving enduring content to guidance.
- [ ] **R8** Run the required checks on the actual final publication tree after
  removing its last working plan, before tagging. Keep final-tree checks separate
  from any earlier disposable-tree result.
- [ ] **R9** Write only a concise summary in the existing release notes. Mark work
  Unreleased until publication; record no planned outcome as a completed release.

### Verification commands and evidence limits

For meaningful repository changes, after checking the Node runtime:

```bash
npm ci --no-audit
npm run verify
```

For stable release preparation, run the separate dependency review and
publication gate described in [Developer Tools](tools/README.md):

```bash
npm run dependencies:audit
npm run release:check -- /absolute/path/to/proposed-release
```

On the actual final tree, repeat installation and verification, run the required
fresh dependency review, and run `npm run release:check` before tagging. Report
the advisory review date, freshness, and maintenance-dependency scope separately
from local artifact validation. Resolve failures without weakening checks to
accommodate unfinished publication content.

Ordinary verification remains appropriate while this active plan exists. The
publication gate is expected to reject such a development tree. Do not promote
its Core status early or run publication checks as a substitute for verifying
financial semantics through specification review.

## Completion conditions for all findings

| Finding | Required condition at final completion |
| --- | --- |
| 1 | Standalone opposing effective Decisions have one normative outcome rule and order-independent cases. |
| 2 | Subject/context association survives every relevant boundary, with observable cases or an explicit consumer evidence obligation. |
| 3 | Entity guard context and target-State validation are specified and represented accurately in descriptors and coverage. |
| 4 | Redaction selects a declared source and produces adequately linked evidence while preserving unrelated history. |
| 5 | Accepted equal-tuple Decisions remain individually addressable under the stronger contract, with faithful migration rules. |
| 6 | Optional choices and justified recommendation exceptions have explicit applicability, without skipping mandatory behavior. |
| 7 | Meaningful failures observe all promised unchanged state or disclose the consumer-native evidence boundary. |
| 8 | Explicit-policy nonterminating division is described and covered, while exactly representable results remain exact. |

Before completing M6, confirm that every proposed rule has been accepted or
replaced by an equally complete reviewed resolution. A rejected proposal needs
replacement tasks and a new completion condition; a design note alone cannot
close a financial behavior gap. Remaining coverage limits must be documented
honestly in traceability and consumer guidance.

The final release must pass applicable local and publication checks, preserve
architectural boundaries, identify compatibility and migration effects, and
contain no stale current-facing claims. Remove this completed plan from the
published tree; its detailed development history remains in Git.
