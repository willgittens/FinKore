# Implementing FinKore

FinKore defines observable financial behavior without prescribing a language,
package layout, public API, framework, or persistence model. Consumer-owned
implementations should be idiomatic in their environment while preserving the
portable contract.

Start with one domain slice and its normative requirements. The shared guidance
below covers values, errors, atomicity, and deterministic context;
[domain details](#domain-details) highlights specific boundaries for Approvals,
Entities, Audit, and Money. The [worked examples](#worked-examples) connect those
rules to explicit inputs, operation sequences, and preserved observations.

## Reading order

1. Read [CoreDoc](coreDoc/core-doc.md) for foundation-level obligations.
2. Read [Specification Conventions](../spec/conventions.md) and the
   [Glossary](../spec/glossary.md).
3. Read the relevant domain specification under `spec/money/`,
   `spec/workflow/`, `spec/audit/`, `spec/approvals/`, or `spec/entities/`.
4. Read [Conformance Conventions](../conformance/conventions.md), the
   [Operation Contracts](../conformance/operations.md), the
   [Consumer Guide](../conformance/consumer-guide.md), and
   [Traceability](../conformance/traceability.md).
5. Read [Agentic Operations](../agentic/operations.md) when implementing a
   canonical `finkore.*` operation.

## Authority and boundaries

`/spec` defines financial behavior. `/conformance` supplies portable acceptance
inputs and expected observations. `/agentic` names canonical operation
semantics. None of those artifacts prescribes an implementation architecture.

An implementation may choose its own classes, records, services, exceptions,
result types, decimal library, mutability mechanisms, storage, dependency
injection, and public method names. It must not choose different observable
financial semantics.

Conformance fixture shapes are test-boundary data, not production API schemas.
A consumer-owned binding may translate between fixture operation labels and an
idiomatic API, but that binding must not implement Money, Workflow, Audit,
Approval, or Entity rules. An execution harness may validate, dispatch, compare,
and report; it must remain domain-neutral.

## Recommended workflow

For each domain slice:

1. Identify the owning normative requirements and portable errors.
2. Locate the related cases through `conformance/manifest.json` and
   `conformance/traceability.md`.
3. Confirm the cases fail or are unsupported before implementing the behavior.
4. Implement the smallest behavior that satisfies the specification.
5. Add language-native tests for API ergonomics and invariants.
6. Execute the portable cases through consumer-owned tooling.
7. Add mutation testing or an equivalent defect-resistance check for critical
   financial behavior.
8. Document the public API, portable errors, mutation effects, and requirement
   references.

Do not infer missing semantics from a fixture, historical implementation, or
language default. Report a specification gap instead.

## Value semantics

Money requires exact base-10 semantics. Parse portable decimals from strings
where the specification requires them; do not substitute binary floating-point
arithmetic. Currency compatibility and rounding policy must remain explicit.

Identifiers are opaque unless the specification explicitly assigns internal
meaning. Do not derive tenancy, sequence, state, permission, timestamp, or
revision semantics from identifier spelling.

Preserve observable distinctions between absent, null, empty, and redacted
values. Preserve declared order where the contract makes order significant; do
not let hash iteration, filesystem order, database incidental order, or locale
define financial meaning.

## Errors

Portable error codes are the cross-language contract. Exception classes,
messages, stack traces, HTTP statuses, and wrapper types are consumer choices.
Expose the specified portable code for a domain failure and preserve any
required post-state observation.

Optional diagnostics must not change the portable meaning and should not reveal
sensitive information by default.

## Effects and atomicity

Where the specification requires non-mutation or failure atomicity, rejected
operations must leave all specified observations unchanged. Validation before
commit, immutable construction, defensive copies, or transactions are possible
implementation techniques; FinKore does not select among them.

Pure value operations should produce equivalent immutable observations.
State-changing domains must expose the specified success and failure
postconditions.

Compare complete state for meaningful rejected mutations, including identifiers,
State, data, version bindings, revisions, and every related history named by the
operation. At native malformed-input boundaries where a valid committed JSON
observation would be invented, verify that the original object graph is
unchanged and, where practical, reusable after the failure.

## Deterministic context

Conformance-observable behavior must not depend on wall-clock time, host
timezone, locale, network calls, external FX providers, filesystem order,
database incidental order, uncontrolled randomness, or process identity.

Pass time, facts, policy, and expected state explicitly when the specification
makes them relevant. Serialize timestamps as unambiguous instants where
required.

## Domain details

These notes highlight implementation boundaries that are easy to miss. Read
them alongside the owning specifications for the domains you implement.

### Approval history and scoped identity

Approval histories need an immutable association with their owning approval
context and subject even when individual legacy Core 1.x records do not encode that
scope. Preserve the association through storage, import, evaluation, record,
withdrawal, and supersession; matching Requirement IDs or subject facts do not
authorize relabeling a history for another context or subject.

For Core 2.0, persist the Requirement `contextId`, each Decision's exact
`requirementRef`, and its stable `decisionId`. Enforce Decision-ID uniqueness
within context, including across Requirements, and resolve withdrawal or
supersession only through scoped identity references. One history may contain
several Requirement identities when every member remains in the same context
and exact subject. Validate every Decision and lifecycle member before selecting
the exact Requirement identity for eligibility, current-effectiveness, and
outcome evaluation; do not apply that Requirement's eligibility or expiration-
context demand to an unrelated same-scope Decision. Foreign context or subject
evidence is invalid rather than unrelated. Migration from Core 1.x must preserve
original fields and use an explicit source-record mapping; do not guess when a
legacy tuple matches more than one Decision or relabel retained evidence.

See [Approval Decisions](../spec/approvals/decisions.md) and
[Approval Validity](../spec/approvals/validity.md).

### Entity transition facts

An Entity transition forwards explicitly supplied object-valued guard facts to
its referenced Workflow; do not source them from Entity data, Approval history,
authorization infrastructure, or ambient state. After Workflow acceptance,
validate the complete Entity under rules applicable to the target State before
committing the State change.

In Core 2.0, reject supplied null, array, or scalar guard facts with
`FINKORE_WORKFLOW_INVALID_CONTEXT` after earlier Workflow errors through invalid
Transition and before guard rejection. Preserve the Entity, binding, revision,
data, and supplied context on failure.

See [Entity Lifecycle](../spec/entities/lifecycle.md).

### Audit redaction evidence

For Audit redaction in Core 2.0, select one committed source by its explicit
`sourceEventId` and validate that every protected target belongs to it. Append a
separate evidence Event whose `metadata.redactionEvidence` matches the source,
authority, ordered targets, and optional policy identifier without copying a
protected value. Do not add a `REDACTS` relationship or mutate the committed
source Event.

See [Audit Redaction](../spec/audit/redaction.md).

### Money division and rounding

Money division may receive one complete explicit rounding policy. Validate a
supplied policy for every nonzero divisor, use it only for nonterminating exact
quotients, and preserve an exactly representable quotient even when it is finer
than the policy scale. Zero division retains its own primary error.

See [Money Arithmetic](../spec/money/arithmetic.md#explicit-policy-for-division).

## Worked examples

These examples are non-normative. Application field names, eligibility choices,
and business policies are illustrative consumer declarations. The examples
explain the existing primitives and use fixture vocabulary where helpful;
they do not define a production API or a concrete invoice/expense specification.
The linked cases are already discoverable through the
[conformance manifest](../conformance/manifest.json).

### Rounding at a declared boundary

Take two exact amounts of `0.005 EUR`. Both sequences below explicitly use
scale 2 and `HALF_UP`, but apply rounding at different application boundaries:

| Sequence | Intermediate observations | Result |
| --- | --- | --- |
| Round each component, then add | Each `0.005 EUR` rounds to `0.01 EUR`; add `0.01 EUR + 0.01 EUR`. | `0.02 EUR` |
| Add exactly, then round the total | Exact sum is `0.010 EUR`; rounding that sum to scale 2 preserves its value. | `0.01 EUR` |

The difference follows the declared operation order. FinKore does not choose
an application's aggregation boundary. Exact addition preserves value under
MONEY-ARITHMETIC-007; deliberate rounding follows MONEY-ROUNDING-001 and -003.
Neither sequence changes the original operands under MONEY-ARITHMETIC-009.

For a negative source of `-1.239 EUR` at scale 2, the adjacent candidates are
`-1.24 EUR` and `-1.23 EUR`. `DOWN` chooses `-1.23 EUR`, toward zero; `FLOOR`
chooses `-1.24 EUR`, toward negative infinity. Both preserve currency and leave
the source unchanged. The sign does not make these modes interchangeable.

Now divide `1 GBP` by exact scalar `8`, supplying a valid policy with scale 2
and `HALF_UP`. The exact quotient is `0.125 GBP`. Under MONEY-ARITHMETIC-010
and -011, division retains that exact quotient even though its scale is finer
than the policy's scale. A separate explicit rounding operation on `0.125 GBP`
produces `0.13 GBP`. In contrast, `1 EUR / 3` has no finite exact decimal
quotient: the same explicit scale/mode produces `0.33 EUR`; without an
applicable policy, it fails with `FINKORE_MONEY_ROUNDING_REQUIRED`.

Calculation scale comes from the declared operation or policy, never implicitly
from currency minor-unit metadata. Presentation is a separate question:
`"10"`, `"10.0"`, and `"10.00"` represent the same exact Money amount. Removing
insignificant zeros changes spelling, while changing `1.239` to `1.23` changes
value and requires rounding rather than presentation normalization.

The rules are in [Money Arithmetic](../spec/money/arithmetic.md),
[Rounding](../spec/money/rounding.md), and
[Serialization](../spec/money/serialization.md). Existing controls include
`money.round.half-up.tie-positive-001`, `money.round.down.negative-001`, and
`money.round.floor.negative-001` in the
[rounding cases](../conformance/money/rounding.json), plus
`money.divide.exact-finer-than-policy-001` and
`money.divide.rounded-third-half-up-001` in the
[division-policy cases](../conformance/money/rounded-division.json).
These primitive cases support the explanations; they do not choose either
application aggregation policy.

### Approval effectiveness after a fact change

The application declares Requirement `finance-review` in context `ctx-exp-42`,
for subject type `expense` and identity `exp-42`. Its eligible Actors are
`["reviewer-7"]`; `APPROVED` satisfies the Requirement and `REJECTED` rejects it.
There is exactly one retained Decision, no expiration, and an empty lifecycle
history. Its evidence is:

```json
{
  "decisionId": "decision-1",
  "requirementId": "finance-review",
  "requirementRef": {
    "contextId": "ctx-exp-42",
    "requirementId": "finance-review",
    "subject": { "type": "expense", "id": "exp-42" }
  },
  "outcome": "APPROVED",
  "actor": { "id": "reviewer-7" },
  "decidedAt": "2026-09-01T12:00:00Z",
  "subjectFacts": {
    "amount": { "amount": "100.00", "currency": "EUR" },
    "memo": "initial"
  }
}
```

At explicit evaluation context `2026-09-02T12:00:00Z`, supply the current facts
for each comparison below. Each row starts from that same retained evidence;
all unmentioned facts stay equal. Single-Decision evaluation reports
`EFFECTIVE` or `INEFFECTIVE`. Requirement evaluation over that one-Decision
history reports the corresponding current Requirement outcome.

| Current facts relative to the retained facts | Relevance selection | Decision effectiveness | Requirement outcome |
| --- | --- | --- | --- |
| No change | `["amount"]` | `EFFECTIVE` | `APPROVED` |
| Only `memo` becomes `"updated"` | `["amount"]` | `EFFECTIVE` | `APPROVED` |
| `amount.amount` becomes `"101.00"` | `["amount"]` | `INEFFECTIVE` | `PENDING` |
| Only `memo` becomes `"updated"` | Selector omitted; compare the whole fact value | `INEFFECTIVE` | `PENDING` |
| `amount.amount` becomes `"100.0"` | `["amount"]` | `INEFFECTIVE` | `PENDING` |

The selected `amount` path compares the supplied object recursively under
APPROVAL-FACT-001 through -003. A Money-shaped object inside Approval facts is
ordinary structured data: its decimal strings compare exactly. Consequently,
the last row changes the fact value even though Money numeric comparison would
consider the two amounts equal. The application chooses its fact representation
and relevance policy; this example does not establish a universal reapproval
threshold or materiality rule.

Structural comparison also distinguishes Boolean `false` from numeric `0` and
an absent member from a present null. Object member order alone does not change
facts; array member order can. A selected leaf absent on both sides is
unavailable, rather than equal; an explicitly present null leaf is available.

The retained evidence preserves `decision-1`, its recorded `APPROVED` outcome,
original facts, Actor, timestamp, and histories under APPROVAL-DECISION-007 and
APPROVAL-VALIDITY-002. An ineffective Decision contributes neither approval nor
rejection under APPROVAL-VALIDITY-003, so the Requirement is `PENDING` in this
one-Decision example.
No new Decision or withdrawal is recorded merely by comparing changed facts.

Requirement evaluation may instead omit both current facts and selectors. Here
that history-only evaluation reports `APPROVED` from the retained evidence,
without asserting that current facts were checked. Concrete single-Decision
evaluation requires current facts. Neither operation reconstructs what was
known at a past instant by changing an evaluation timestamp.

Reusing this Decision for subject `expense/exp-99` or another context is
`FINKORE_APPROVAL_INVALID_DECISION`, even if the Requirement name and facts
match. Both histories remain unchanged. Scoped subject identity, fact equality,
current effectiveness, and application authorization remain separate questions.

The rules are in [Approval Decisions](../spec/approvals/decisions.md),
especially APPROVAL-DECISION-002, -003, -007, and -013, and
[Approval Validity](../spec/approvals/validity.md). Related existing cases are
`approval.decision.relevant-path-unchanged-unrelated-fact-changed-001` and
`approval.decision.subject-facts-changed-001` in
[Decision cases](../conformance/approvals/decisions.json),
`approval.boundary097.requirement-whole-changed-001` in
[evidence regressions](../conformance/approvals/evidence-regressions.json), and
`approval.requirement.foreign-subject-history-001` in the
[scoped-identity cases](../conformance/approvals/stronger-contract.json).

### Four distinct Entity evolution requests

These are independent scenarios, not four operations applied in succession.
Each starts with source Entity type `invoice`, identity `inv-10`, Revision
`rev-1`, State `ISSUED`, and amount `100.00 EUR` in identity scope `tenant-a`.
The illustrative application declares that amount immutable in `ISSUED`, accepts
the supplied source/related data, and declares the requested evolution eligible.
The State name alone supplies none of that authority under ENTITY-EVOLUTION-006.

Initial evolution history is empty. Initial Audit history contains committed
Event `evt-original`, type `ENTITY_ISSUED`, affecting `invoice/inv-10` at
`2026-09-01T10:00:00Z`. The source is supplied as current for each scenario;
currentness is observed for exact Entity/Revision/scope keys, independently of
the unchanged lifecycle State and original amount.

#### Correction preserves the earlier facts

Before: `invoice/inv-10`, Revision `rev-1`, carries `100.00 EUR`.

Request: `finkore.entity.evolution.correct` identifies related Revision `rev-2`
of that same Entity with caller-supplied corrected amount `99.00 EUR`. Its
expected source State and Revision are `ISSUED` and `rev-1`.

After: the relation connects `inv-10/rev-1` to `inv-10/rev-2`. The original
Revision still carries `100.00 EUR`; the related Revision carries `99.00 EUR`.
Stable Entity identity remains `inv-10`, and the input observations remain
unchanged. Correction does not itself establish a universal current-successor
selection rule or overwrite the source's currentness. This follows
ENTITY-EVOLUTION-001, -002, and -008 through -015.

#### Reversal preserves the original source

Before: `invoice/inv-10`, Revision `rev-1`, carries `100.00 EUR`.

Request: `finkore.entity.evolution.reverse` identifies the distinct related
Entity `invoice/rev-10`, Revision `rev-1`, with amount `-100.00 EUR` supplied by
the application as its reversing record.

After: both Entity identities and amounts remain observable, connected by a
Reversal relation. The source amount has not been negated in place. The related
amount and its cancelling meaning come from the application; Core does not
calculate a reversal amount, post entries, or define settlement effects.
Reversal alone does not make the source non-current. This follows
ENTITY-EVOLUTION-011 through -015.

#### Void changes currentness without deleting the source

Before: `invoice/inv-10`, Revision `rev-1`, is observed as current.

Request: `finkore.entity.evolution.void` declares nullification of that source
under the application's eligibility policy, with no related Entity required.

After: the Void relation observes `sourceCurrent: false`. Identity `inv-10`,
Revision `rev-1`, State `ISSUED`, amount `100.00 EUR`, and prior evidence remain
observable. No implied State named `VOID` or deletion replaces that observation.
This follows ENTITY-EVOLUTION-016 through -018 and the
[bounded currentness conventions](../conformance/conventions.md#declarative-fixtures).

#### Supersession selects current use within a declared scope

Before: predecessor `invoice/inv-10`, Revision `rev-1`, is current within the
application-declared scope `tenant-a:invoice-current`. The supplied successor
is `invoice/inv-10-v2`, Revision `rev-1`, amount `99.00 EUR`.

Request: `finkore.entity.evolution.supersede` identifies those two observations
and that exact supersession scope, with `expectedSourceCurrent: true`.

After: the relation observes predecessor `sourceCurrent: false` and successor
`relatedCurrent: true` in the declared scope. Both identities and original facts
remain unchanged. The scope string is an opaque declaration, not authority
inferred from its spelling; no currentness claim for another scope follows.
This follows ENTITY-EVOLUTION-019 through -021.

#### Required evidence and a rejected request

Each successful request above supplies its own identifiers before execution:

| Kind | Evolution Relation | Audit Event | Audit Relationship and type |
| --- | --- | --- | --- |
| Correction | `rel-correction-1` | `evt-correction` | `audit-rel-correction-1`, `CORRECTS` |
| Reversal | `rel-reversal-1` | `evt-reversal` | `audit-rel-reversal-1`, `REVERSES` |
| Void | `rel-void-1` | `evt-void` | `audit-rel-void-1`, `VOIDS` |
| Supersession | `rel-supersession-1` | `evt-supersession` | `audit-rel-supersession-1`, `SUPERSEDES` |

Each new Audit Event has type `ENTITY_EVOLUTION_RECORDED`, affects source
`invoice/inv-10`, and uses explicit occurrence time `2026-09-01T11:00:00Z`.
Its evidence identifies the evolution kind, source Revision, related Entity or
Revision where applicable, Evolution Relation, and supersession scope where
applicable. Its Audit Relationship targets committed `evt-original` and that
Event's affected Entity `invoice/inv-10`. The relationship identity is distinct
from the Evolution Relation and Event identities. No identifier is generated
or derived from an amount, State, or timestamp.

On success, result histories contain the new relation and corresponding Audit
Event together, preserving their original entries. These are declared local
observations, not a distributed total order. The obligations are
ENTITY-EVOLUTION-022 and -029 through -033, with
[Audit Relationship](../spec/audit/relationships.md) identity/type/target rules.

For a rejected Correction, keep the source, related `inv-10/rev-2` observation,
eligibility, and all other declarations valid, but supply empty Audit history
and a candidate whose relationship targets `evt-original`. That target is not
committed in the supplied history. Audit rejects it with
`FINKORE_AUDIT_INVALID_EVENT` under AUDIT-RELATIONSHIP-006. There is no successful
evolution result: source and related identities, Revisions, States, amounts,
currentness, empty relation history, and empty Audit history all remain
unchanged. Validation of candidate evidence has not committed either history.
This follows ENTITY-EVOLUTION-023, -027, -033, and -034. With a valid committed
target restored, the successful Correction is the paired control.

The four success sequences and rejection are illustrated by
`entity.evolution.correction.audit-001`, `entity.evolution.reversal.audit-001`,
`entity.evolution.void.audit-001`,
`entity.evolution.supersession.currentness-001`, and
`entity.evolution.audit-failure-001` in the
[existing evolution cases](../conformance/entities/evolution.json).
[Entity Evolution](../spec/entities/evolution.md) remains authoritative;
the examples add no concrete accounting effects or eligibility policy to Core.

## Reliability

Portable acceptance cases are a baseline, not exhaustive proof. Add
language-native tests for integration boundaries and use mutation testing or an
equivalent technique for financially critical logic. Important defect classes
include removed currency checks, arithmetic substitutions, rounding-mode
changes, guard bypass, mutable audit history, approval-effectiveness bypass,
Entity identity changes, partial state after failure, and changed portable
error codes.

Public API documentation should explain domain purpose, semantically important
parameters, results, portable errors, mutation behavior, and relevant FinKore
requirement IDs. The documentation format is language-specific; the observable
contract is not.

## Reporting a specification gap

If the specification does not define an observable result, record:

- the exact artifacts and requirement IDs reviewed;
- the operation or value boundary affected;
- at least two plausible interpretations;
- the financial, control, security, or privacy impact;
- whether the issue is a clarification, normative change, contradiction,
  portability blocker, or deferred topic.

Wait for a specification-first decision before changing portable expectations
or consumer behavior.
