# Financial contract review

Reviewed on 2026-10-03 against the FinKore Core 1.0 stable tree at `6534c76`.
This is a non-normative list of issues for further consideration, written from
a financial-systems engineering and control perspective. Recommendations here
do not change the published contract.

The foundations generally make sense: exact Money, explicit rounding,
currency compatibility, controlled lifecycle changes, preserved history, and
approval tied to facts are appropriate primitives. The separation between
specification, acceptance artifacts, and machine-client metadata is also clear.
The areas needing most attention are approval outcome ambiguity, approval
binding to the correct subject, and the composition of Entity transitions with
Workflow guards. Passing repository checks does not resolve those questions.

## Scope and priorities

The review followed CoreDoc, then all specification documents, the conformance
manifest/schema/conventions/operation contracts and traceability, and finally
the Agentic documents. Vector inspection included the manifest inventory,
duplicate-request consistency, and targeted financial and control boundaries;
it was not an independent recalculation of every expected result. The
implementation guide and release history supplied supporting context.

High priority means the issue can affect whether a financial action is treated
as approved or permitted. Medium priority means a portability, evidence, or
control-maintenance issue needs a deliberate decision. These are review
priorities, not FinKore Agentic safety classifications.

| Item | Priority | Classification | Subject |
| --- | --- | --- | --- |
| 1 | High | Specification gap | Opposing effective Decisions for one standalone Requirement |
| 2 | High | Binding clarification and coverage gap | Decisions associated with the correct subject and approval context |
| 3 | High | Agentic and conformance gap | Guard context at the Entity transition boundary |
| 4 | Medium | Fixture and evidence gap | Redaction target selection and evidence linkage |
| 5 | Medium | Explicitly permitted design risk | Duplicate Decision references obstruct later withdrawal |
| 6 | Medium | Conformance applicability ambiguity | Optional permissions and recommended diagnostics |
| 7 | Medium | Coverage gap | Failure cases without complete unchanged-state observations |
| 8 | Medium | Agentic and conformance gap | Division with explicit rounding |

## 1 Opposing effective Decisions have no standalone outcome rule

**Basis:** CoreDoc's approval integrity rules; APPROVAL-REQUIREMENT-004/-005;
APPROVAL-DECISION-009/-012; APPROVAL-VALIDITY-001/-003; and
APPROVAL-QUORUM-009/-010. See [Requirements](../spec/approvals/requirements.md),
[Decisions](../spec/approvals/decisions.md),
[Validity](../spec/approvals/validity.md), and
[Composition](../spec/approvals/composition.md).

The specification determines whether an individual Decision is effective, but
does not determine a standalone Requirement's outcome when both an eligible
approval and an eligible rejection remain effective for the same subject facts.
Quorum evaluation explicitly rejects opposing effective outcomes for one voter
and explicitly says that rule does not redefine standalone Requirement or Chain
evaluation. A Chain's declared rejection handling applies after its Requirement
states have been established.

For example, Alice approves and then rejects `review`, with identical relevant
facts, different decision instants, no expiration, and no withdrawal or
supersession. Both Decisions satisfy the individual effectiveness rules. The
standalone evaluator has no declared rule selecting rejection, requiring
explicit conflict resolution, or applying a composing-domain aggregation policy.
An implicit latest-Decision rule would also introduce semantics absent from the
contract.

**This behavior is not currently defined by FinKore Core.** The observable
outcome of `approval.requirement.evaluate` for that case needs a normative
decision. Otherwise implementations can disagree about whether the same
financial action has its required approval.

Existing mixed-outcome cases in
[construction/evaluation regressions](../conformance/approvals/construction-evaluation-regressions.json)
and [fact/history cases](../conformance/approvals/fact-history-contracts.json)
exercise missing expiration context or exclusion of stale/expired evidence.
They do not settle the case where both opposing outcomes remain effective.

**Follow-up:** Define the standalone aggregation or conflict-policy boundary
first. Then add both Decision orders, same/different eligible Actors, repeated
same-outcome controls, and withdrawal/supersession controls. Preserve the quorum
rule's separate scope and review the Core compatibility impact.

## 2 Subject binding is not observable in the concrete Decision fixture

**Basis:** APPROVAL-REQUIREMENT-001/-002 and APPROVAL-DECISION-001/-002/-003;
[CoreDoc](coreDoc/core-doc.md),
[Requirement identity and subject](../spec/approvals/requirements.md),
[Decision association](../spec/approvals/decisions.md), and
[concrete fixture definitions](../conformance/operations.md).

Requirement identifiers are stable within an approval context, rather than
globally unique. The concrete Requirement names its subject, but the concrete
Decision contains only `requirementId` and `subjectFacts` as its association.
The fixture history has no declared subject/context binding of its own, and
subject facts need not include subject identity.

Consider two invoices with different identities, each using the Requirement
identifier `finance-review`, the same eligible Actor, and identical selected
facts such as amount and revision label. Moving the Decision data from one
context to the other leaves every encoded association/comparison field the
same. That is not evidence that the second invoice was approved.

The specification already requires correct association. The gap is how that
association remains established at this boundary: either histories are explicitly
confined to one immutable subject/context, or Decisions carry a reference that
distinguishes the scoped Requirement. The reviewed fixture contract does not
state which guarantee a consumer must preserve during translation or history
reuse. The wrong-Requirement case
`approval.requirement.wrong-association-001` in
[decisions.json](../conformance/approvals/decisions.json) changes the identifier;
it does not exercise reuse of an identifier across subjects.

**Follow-up:** Clarify the semantic scope of supplied Decision history and add
a control for attempted reuse across subjects with identical relevant facts.
If isolation is a composing-domain obligation outside portable fixtures, say
so explicitly in the implementation guide and traceability. No global identity
registry or universal subject envelope is needed to explain that obligation.
This is a missing binding guarantee in the published fixture description, not
proof that a particular consumer accepts a foreign Decision.

## 3 Guarded Entity transitions lack a published context boundary

**Basis:** ENTITY-LIFECYCLE-001/-003, ENTITY-VALIDATION-001/-002/-003,
WORKFLOW-TRANSITION-004, and WORKFLOW-GUARD-001/-002/-003. See
[Entity lifecycle](../spec/entities/lifecycle.md),
[Entity validation](../spec/entities/validation.md),
[Workflow guards](../spec/workflow/guards.md),
[conformance operations](../conformance/operations.md), and
[Agentic operations](../agentic/operations.md).

`finkore.workflow.transition` describes supplied guard facts.
`finkore.entity.transition` describes only the definition, existing Entity, and
target State, while its registry entry says composing-domain approval policy
may govern it. The contract does not explain whether its guards receive
caller-supplied context, Entity data, or another explicitly declared fact source.
Choosing one implicitly would give the same declared guard different behavior
across implementations.

All 78 manifest-listed Entity transition cases were inspected for this
boundary: none declares a guarded Workflow transition, and none supplies an
input `facts` member. Generic Workflow guard coverage therefore does not
demonstrate that an Entity transition preserves the same control.

For example, a composing domain requires `approvalSatisfied` before an Entity
can enter `FINAL`. The guard must pass before State changes, but the published
Entity operation description does not tell a machine client how its explicit
approval observation reaches that guard. **This behavior is not currently
defined by FinKore Core** at the Entity guard-context binding boundary; the
obligation to enforce the guard itself is already defined.

The Entity descriptor also should state explicitly that the complete resulting
Entity must be valid for the target State. Its current error discussion omits
`FINKORE_ENTITY_VALIDATION_FAILED`, although ENTITY-VALIDATION-001/-002/-004
apply to a Transition rejected by a target-State business rule.

**Follow-up:** Clarify guard-context semantics without assuming an authorization
model. Synchronize the canonical descriptor and fixture contract, then add
guard-passing, guard-failing, missing-fact, and unchanged-Entity cases. Add
consumer-native target-State validation evidence where the bounded validator
fixture cannot express the state-dependent rule.

## 4 Redaction does not identify which history event to select

**Basis:** AUDIT-REDACTION-001/-003/-006 and AUDIT-RELATIONSHIP-010/-011;
[Redaction](../spec/audit/redaction.md),
[Relationships](../spec/audit/relationships.md), and the `audit.redact` row in
[conformance operations](../conformance/operations.md).

The fixture supplies history, a policy, and a redaction evidence Event. It
returns one redacted Event but supplies no explicit source Event identity and
documents no selection rule. The multi-event case
`audit.relationship.redaction-preserves-001` in
[relationships.json](../conformance/audit/relationships.json) selects
`evt-correction`; only that history Event contains the protected Change path.
That does not determine what happens when two Events contain that path or actor
context.

Selecting the last Event, the first matching Event, or every matching Event are
different operations. **This behavior is not currently defined by FinKore
Core** for selection among multiple matching history Events, and a binding
should not invent it from the existing expected result.

There is a related evidence limitation. The successful
`audit.redaction.preserve-evidence-001` case in
[history.json](../conformance/audit/history.json) appends an evidence Event with
type, Entity, Actor, and time, but no source Event reference, protected paths,
or policy/authority reference. The source representation remains distinguishable
as redacted, as required, but an exported evidence Event alone cannot identify
which of several Events for that Entity was redacted or on what declared basis.
Current minimum wording requires evidence that redaction occurred; it does not
require that fuller linkage.

**Follow-up:** Resolve target selection and document the minimum relationship
between the redacted representation and its evidence. Add a history with two
matching targets and verify unrelated Events remain unchanged. Keep this
separate from the deferred standardized provenance fields; do not invent a
`REDACTS` relationship type outside the closed current catalog.

## 5 Permitted duplicate Decision references obstruct later withdrawal

**Basis:** APPROVAL-VALIDITY-005/-014/-015;
[Validity](../spec/approvals/validity.md) and
[lifecycle reference conventions](../conformance/operations.md).

Lifecycle references identify a Decision by Requirement, Actor, and exact
decision instant. The contract permits equal reference tuples when no retained
lifecycle relationship becomes invalid. The success case
`approval.boundary097.record-unreferenced-equal-tuples-control-001` in
[evidence regressions](../conformance/approvals/evidence-regressions.json)
demonstrates that permission. Withdrawal subsequently rejects an ambiguous
reference, as demonstrated by `approval.withdraw.target-ambiguous-001` in
[readiness regressions](../conformance/approvals/readiness-regressions.json).

These rules are consistent with each other, but the sequence creates a control
problem: two accepted Decisions can become individually unaddressable by the
portable withdrawal and Decision-supersession references. Editing their
timestamps or deleting one would violate preserved history. Superseding the
whole Requirement is a broader action, not selective withdrawal of one Decision.

**Follow-up:** Explicitly document this consequence and the composing-domain
responsibility for maintaining addressable Decision identities. Evaluate a
future stable Decision identity or a declared collision policy through the
compatibility process. Do not silently prohibit the existing accepted control
or change reference tuples under the current identifiers.

## 6 Optional behavior needs explicit conformance applicability

**Basis:** SPEC-CONFORMANCE-001/-002, MONEY-SERIALIZATION-006/-007,
ENTITY-ERROR-002, and ENTITY-VALIDATION-005;
[conventions](../spec/conventions.md),
[Money serialization](../spec/money/serialization.md), and the
[conformance claim model](../conformance/README.md).

MONEY-SERIALIZATION-006 permits acceptance of unknown Money members with `MAY`.
Nevertheless, `money.deserialize.unknown-members-001` in
[representation.json](../conformance/money/representation.json) requires
success with unknown members. This is a useful case for a permissive parser,
but it selects one permitted policy. It does not establish that every conforming
parser must accept extensions.

Similarly, `entity.validation.complete-result-001` in
[behavior.json](../conformance/entities/behavior.json) requires a particular
`findings` observation with rule and path. Stable violation identifiers and
diagnostic paths are recommendations whose documented exceptions the
specification allows.

The claim model requires every applicable vector to pass and says UNSUPPORTED
is not passing. It does not explain how an implementation declares that a
permission was not exercised or a documented SHOULD exception affects a case.
Thus the artifact expectations are stronger than the mandatory behavior unless
an applicability rule is supplied.

**Follow-up:** Define and document applicability for permissions and recommended
diagnostics. Separate the conditional extension-preservation obligation from
the choice to accept extensions. Keep optional-feature exclusions and SHOULD
exceptions visible in consumer claims; do not turn `MAY` or `SHOULD` into `MUST`
merely to retain a fixed expected result.

## 7 Some failure vectors omit the state they promise to preserve

**Basis:** CoreDoc's rejected-action rule, ENTITY-ERROR-001,
ENTITY-MUTABILITY-004, and APPROVAL-ERROR-005/-006;
[Entity errors](../spec/entities/errors.md),
[Approval errors](../spec/approvals/errors.md), and
[consumer observation rules](../conformance/consumer-guide.md).

Manifest inspection found no `expected.observations` in 65 of 73 failing Entity
mutation cases, 56 of 69 failing Entity transition cases, and all 12 failing
Decision-supersession cases. Some are malformed import/construction boundaries
where no valid committed object can be observed, so these counts are indicators
for review rather than 133 proven atomicity defects.

There are also directly relevant cases. For example,
`entity.boundary097.transition-mutability-rule-null-001` in
[evidence regressions](../conformance/entities/evidence-regressions.json)
supplies an existing Entity and references preservation requirements, but
expects only the error. `approval.withdraw.target-ambiguous-001` observes the
Decision list after failure but does not also observe lifecycle history.
A defect that changes omitted state while returning the correct error can evade
that individual comparison.

**Follow-up:** Add complete post-state observations to meaningful rejection
cases with existing state: Entity identity/data/State/binding and both Approval
histories where applicable. For malformed boundaries, retain native evidence
that supplied inputs were not mutated without pretending they were valid
committed state. Pair failures with valid controls and exercise subsequent
output reuse. Existing baseline atomicity cases are useful; they do not make
every new rejection boundary mutation-sensitive automatically.

## 8 Rounded division is missing from the operational description

**Basis:** MONEY-ARITHMETIC-005/-007/-008, MONEY-ROUNDING-001/-006/-007;
[Arithmetic](../spec/money/arithmetic.md),
[Rounding](../spec/money/rounding.md),
[Agentic division](../agentic/operations.md), and
[Money fixture operations](../conformance/operations.md).

The specification requires explicit rounding when division needs precision
reduction. The Agentic division descriptor acknowledges that requirement, but
its inputs describe only Money and a scalar, and its success description covers
only an exact quotient. The fixture table likewise describes only an exact
quotient. The broader conformance operation catalog mentions optional explicit
rounding, so the descriptions do not communicate one complete boundary.

All five published division cases in
[arithmetic.json](../conformance/money/arithmetic.json) omit rounding: three
exact successes, division by zero, and a nonterminating quotient rejected for
missing policy. There is no successful case showing how an explicit policy
permits the nonterminating calculation.

**Follow-up:** State how the canonical division operation receives an explicit
or domain-declared policy and describe its rounded success/error results. Add
positive and negative nonterminating quotients, ties, invalid-policy controls,
and unchanged operands. For example, a declared scale 2 and HALF_UP policy can
illustrate the defined rounding of `1 EUR / 3`; it must never become a default.
This completes an existing rounding obligation rather than adding interest,
tax, or FX policy.

## Boundaries that should remain explicit

The absent ledger, accounting-date, closed-period, FX sourcing, settlement,
statutory retention, segregation-of-duties, and distributed coordination rules
are deliberate scope limits in [CoreDoc](coreDoc/core-doc.md). They are not
missing Core implementations to recreate. A banking consumer still has to
define its own policies in those areas.

Approval chain/composition state observations are explicitly not proof of the
Decision or subject facts that satisfied a Requirement. History-only Requirement
evaluation is explicitly allowed to omit current-fact comparison. Consumers
should preserve those limited claims when using their results as inputs to a
financial control.

Likewise, `evaluatedAt` governs defined expiration checks; the reviewed Approval
contract does not establish a general historical evaluation that filters all
Decisions and lifecycle events to that time. Event metadata accepts arbitrary
JSON, while current redaction targets cover Change paths and optional Actor
context, not general Event metadata. These are integration limits to document,
not permissions to invent historical replay or metadata-redaction semantics.

## Verification and change impact

The baseline `npm ci --no-audit` and `npm run verify` passed with Node 24.15.0:
six suites, 42 vector files, 1,790 vectors, 436 requirements, 20 canonical
operations, and 28 maintenance-tool tests. A structural scan also found no
identical operation/input/context requests with conflicting primary success
values or error codes. These checks validate artifacts; they did not execute
financial behavior against a consumer implementation.

This change adds only this requested findings document. CoreDoc governance
metadata, normative requirements, stable identifiers, portable errors,
conformance expectations, Agentic contracts, and repository tools are unchanged.
No fresh dependency advisory review was required for this documentation change;
installation used the locked dependency graph with audit disabled. Findings
that change observable behavior need the specification-first workflow and
compatibility assessment before coordinated artifact changes.
