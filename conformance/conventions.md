# Conformance Vector Conventions

## Versions

`finkoreConformance` versions the manifest syntax and `finkoreVectorFile`
versions vector-file syntax. These fields are compatibility versions, not
release numbers. Release scope is discovered from manifest-listed files,
requirement IDs, and traceability, not from bumping a format field.

A format version MUST be bumped only when manifest syntax, vector-file syntax, or
the meaning of a defined format member changes in a way that an older runner
cannot faithfully validate. A runner MUST reject versions it does not support.
Core compatibility rules for normative behavior, portable serializations, and
regression vectors are defined in the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy).

## File and vector shape

Each manifest-listed JSON file is an object containing `finkoreVectorFile` and a non-empty `vectors` array. Each vector has:

- `id`: stable, globally unique, domain-prefixed identifier.
- `spec`: repository-relative specification topic without a Markdown line number.
- `requirements`: non-empty array of stable normative requirement IDs.
- `description`: concise reason the behavior is observable.
- `operation`: language-neutral operation identifier from the catalog below.
- `input`: complete logical operands and fixtures.
- `context`: optional explicit environmental facts such as a timestamp or policy.
- `expected`: the normalized observation.
- `tags`: one or more of `positive`, `negative`, `boundary`, `invariant`, `regression`, and `mutation-sensitive`.
- `guardsAgainst`: optional informational list of plausible defect names.

Unknown vector members MAY be ignored. They MUST NOT alter the meaning of defined members.

`expected.status` is either `success` or `error`. Success uses `value`; failure uses `error.code`. Either may include `observations` for post-operation state. A vector MUST NOT contain both `value` and `error`. Error messages are never compared. Exact object member order is irrelevant; array order is significant unless a specific operation says otherwise.

The normalized observation belongs only to conformance infrastructure. Production FinKore libraries are not required to return this shape.

## Canonical values

Money is represented as `{"amount":"plain base-10 decimal","currency":"ISO code"}`.
Implementations perform Money operations and comparisons under `/spec`; the
adapter exposes the resulting normative Money serialization or other agreed
observation. The runner then compares that normalized observation exactly. It
does not recognize Money-shaped objects, remove trailing zeros, compare decimal
strings numerically, or apply currency rules.

Trailing fractional zeros MAY be present in vector input. Numeric equality is
observed through a domain operation such as `finkore.money.compare`, whose
normalized result is `EQUAL`; it is not created by special runner comparison.
For an operation that returns Money, the expected decimal string records the
operation's agreed observable representation. When the operation defines a
target scale, the expected amount has exactly that scale, and each adapter must
expose that result before the runner's exact comparison. This keeps decimal and
scale semantics in the implementation core rather than in the runner.
The `finkore.money.allocate` fixture supplies `value`, `allocation`, and
`scale`. `allocation.method` is `EQUAL` with `parts` or `RATIO` with `ratios`.
Scale, parts, and ratio entries are JSON numbers with integer mathematical
values. Scale and parts use the inclusive ranges defined by
MONEY-ALLOCATION-014, and ratio entries use its inclusive exact JSON integer
range. Adapters pass these values to their core implementation without applying
range or allocation rules.
Conformance-only sentinels use `{"presence":"ABSENT"}` and `{"presence":"REDACTED"}` when absence and policy-authorized concealment must be observed distinctly from JSON `null`. Adapters translate their own representations to these sentinels; production APIs are not required to expose them.

## Declarative fixtures

Workflow guard expressions and entity validation rules in these vectors are
small adapter fixtures, not additions to the FinKore business specification or
a general expression DSL. The Workflow fixture
`{"fact":"x","equals":value}` selects one own, top-level member of the
explicitly supplied `facts` object. `fact` must be a non-empty string and
`equals` must be present. A definition that omits either member, supplies an
unsupported non-JSON comparison value, supplies both `guard` and non-empty
`guards`, or otherwise malforms this fixture fails with
`FINKORE_WORKFLOW_INVALID_DEFINITION` under the existing Workflow definition
and error-precedence rules.

Omission of both guard members declares no guards. When supplied, `guard` must
be a well-formed guard object and `guards` must be an array of well-formed guard
objects; explicit null is invalid for either container. A valid `guard` together
with `guards: []` means that single guard. A valid `guard` together with a
nonempty `guards` array is invalid. An empty, null, or non-string `fact` is
invalid; `equals: null` is a valid explicitly supplied comparison value.
Definition validation precedes instance, binding, State, conflict, terminal,
Transition, and guard-result failures under **WORKFLOW-ERROR-007**. A runtime
exception is not a substitute for `FINKORE_WORKFLOW_INVALID_DEFINITION`.

The fixture supports ordinary JSON null, Boolean, number, string, array, and
object values. It uses recursive, type-sensitive JSON equality: Boolean and
number values are distinct; JSON numbers compare by numeric value; strings
compare exactly; object member order is irrelevant and the complete member set
must match; array order and length are significant. A missing fact never equals
any value, including null. An explicitly supplied null fact equals an explicit
null `equals` value. A well-formed guard whose selected fact is missing or not
equal rejects the transition with `FINKORE_WORKFLOW_GUARD_REJECTED`. Values are
not coerced, and an object that resembles Money or another domain type remains
an ordinary JSON object in this fixture.

Native public-API tests supplement these JSON fixtures by attempting to mutate
construction inputs and returned definition observations, including nested guard
objects and arrays. They cover creation and import, accepted and rejected facts,
and unversioned controls. The same retained predicate must continue to evaluate
under the original binding; either immutable observations or defensive copies
satisfy this ownership check. Unsupported native comparison values require
native tests because they cannot be represented in a JSON vector.

Versioned Workflow fixtures identify the definition family with
`definitionIdentity` and its version with `definitionVersionIdentity`. When
`versionSequence` is supplied, its only supported selector is `"DEFAULT"`,
and both identity members are required. Under that selector the version identity
must match `[1-9][0-9]*`: `"1"` and `"12"` are valid positions; `"0"`, `"01"`,
signed, fractional, empty, and non-ASCII-digit positions are invalid. The selector
itself is not parsed as an integer. Invalid selectors, including null or `"1"`,
produce `FINKORE_WORKFLOW_INVALID_DEFINITION`. Without a selector, valid
nonempty version identities remain opaque, including identities that would not
be valid default-sequence positions. This encoding observes
**WORKFLOW-VERSION-005** and **WORKFLOW-VERSION-006**; it adds no global version
registry or production request format.

The entity validator named `positive-money` accepts an exact Money amount
greater than zero. These fixtures let every adapter exercise guard/validation
ordering and atomicity under the same deterministic predicate.

Audit Change fixtures reflect the production declaration in
**AUDIT-CHANGE-009** by using `"valueType":"MONEY"` when `before` and `after`
carry Money semantics. Without that declaration, even an object containing
`amount` and `currency` is compared as ordinary JSON under
**AUDIT-CHANGE-008**. The conformance-only `{"presence":"ABSENT"}` sentinel
continues to observe domain absence and is not a production type declaration.
Malformed declared Money values produce `FINKORE_AUDIT_INVALID_EVENT`; adapters
must not repair them or infer Money semantics.

The Entity fixture `{"id":"WITHIN_LIMIT","rule":"money-not-greater-than",
"path":"amount","otherPath":"limit"}` accepts two valid, compatible Money
values when the value at `path` is numerically less than or equal to the value
at `otherPath`. Both paths name top-level fields in the complete proposed Entity
data, including retained fields omitted from the mutation. Missing or invalid
Money values and incompatible currencies make this predicate false. A failed
predicate produces `FINKORE_ENTITY_VALIDATION_FAILED`, with any observed finding
identifying its declared `id` and `path`. The predicate uses exact Money
comparison and does not impose positivity or currency conversion. It is a
declared test constraint for **ENTITY-VALIDATION-003**, not a required rule for
all financial entities. Core implementations evaluate the predicate; adapters
only translate fixtures and observations.


Timestamps use the portable FinKore RFC 3339 profile in
[SPEC-TIMESTAMP-001 through -006](../spec/conventions.md#portable-values).
They use uppercase `T` and `Z`, a valid year from `0001` through `9999`,
seconds from `00` through `59`, `Z` or a known numeric offset, and at most
nine fractional digits. Exact instant comparison includes all accepted
fractional digits. Identifiers are opaque strings. States and outcomes use the
exact domain names supplied by the vector.

## Semantic operation catalog

These identifiers name observable behavior, not implementation methods.

| Operation | Logical observation |
| --- | --- |
| `money.deserialize` | Parse the normative portable Money JSON value. |
| `money.serialize` | Produce the normative portable Money JSON value. |
| `finkore.money.add`, `finkore.money.subtract` | Exact compatible-currency arithmetic. |
| `finkore.money.negate` | Exact sign reversal. |
| `finkore.money.multiply`, `finkore.money.divide` | Exact scalar arithmetic, with an optional explicit rounding policy where needed. |
| `finkore.money.compare` | Return `LESS`, `EQUAL`, or `GREATER`. |
| `finkore.money.round` | Reduce to the explicit `scale` using the explicit `mode`. |
| `finkore.money.applyrate` | Apply an explicitly represented decimal or percentage Rate to Money, with optional explicit rounding. |
| `finkore.money.allocate` | Allocate Money by equal parts or positive integer ratios using an explicit target scale and deterministic ordered remainder placement. |
| `workflow.create` | Validate a definition and create an instance at its initial state. |
| `workflow.import` | Validate and observe an existing Workflow instance with supplied current state, optional instance revision, and version binding when versioned. |
| `finkore.workflow.transition` | Request the supplied target from the instance's current state using supplied guard facts. |
| `finkore.audit.append` | Append one event to supplied committed logical history. |
| `finkore.audit.replace`, `finkore.audit.remove` | Attempt the named change to committed logical history. |
| `audit.redact` | Produce a policy-authorized redacted logical representation and evidence event. |
| `approval.requirement.evaluate` | Derive one requirement's `PENDING`, `APPROVED`, or `REJECTED` state. |
| `approval.requirement.supersede` | Append Requirement supersession lifecycle evidence without altering Decision history. |
| `approval.decision.record` | Validate and commit a decision. |
| `approval.decision.evaluate` | Validate a concrete Requirement and associated eligible Decision, compare relevant subject facts, and honor expiration with explicit context under APPROVAL-DECISION-009; no lifecycle effectiveness claim without history. |
| `approval.decision.withdraw` | Append Decision withdrawal lifecycle evidence without altering Decision history. |
| `approval.decision.supersede` | Append Decision supersession lifecycle evidence without altering Decision history. |
| `approval.condition.evaluate` | Return `APPLICABLE` or `NOT_APPLICABLE` from explicit facts. |
| `approval.chain.evaluate` | Derive chain state from its declared combination and explicit Requirement state observations. |
| `approval.composition.evaluate` | Derive bounded composition outcome and actionable Requirement identifiers from declared groups, stages, applicability, current-effective evidence, and explicit evaluation context. |
| `finkore.entity.create` | Create under the supplied composing-domain definition. |
| `finkore.entity.mutate` | Apply a declared mutation under supplied mutability and validation rules. |
| `finkore.entity.transition` | Apply a lifecycle transition under the referenced workflow. |
| `finkore.entity.evolution.correct` | Record a Correction relation with required Audit evidence. |
| `finkore.entity.evolution.reverse` | Record a Reversal relation with required Audit evidence. |
| `finkore.entity.evolution.void` | Record a Void relation with required Audit evidence. |
| `finkore.entity.evolution.supersede` | Record a Supersession relation with required Audit evidence. |
| `entity.import` | Validate and observe an existing Entity with optional source identity mapping, business revision history, and conflict-version preconditions. |

Logical fixtures in `input` are intentionally small declarative models. An adapter constructs any idiomatic implementation objects required to realize them. The fixtures do not define a production interchange format.

Identifiers beginning with `finkore.` are canonical operations in the
[Agentic Contract](../agentic/operations.md). Remaining catalog entries are
conformance-local adapter operations until their stable public contracts are
reviewed; vector use alone does not make them advertised FinKore capabilities.
Audit ordering requirements are verified through append-only history and review of explicitly recorded relationships; Core 0.9 release candidate does not define `audit.order` as an executable conformance operation or as an Agentic operation. Audit Relationships are observed through ordinary `finkore.audit.append` and `audit.redact` fixtures, not a separate relationship operation.
For Money, `money.deserialize` and `money.serialize` remain
conformance-local representation boundary checks. They exercise normative Money
serialization but are not separate public Agentic operations. Rate application
and Allocation are promoted to
`finkore.money.applyrate` and `finkore.money.allocate` after Agentic review.
For Workflow, `workflow.import` remains conformance-local after the
Agentic review. Versioned Workflow fixtures may include definition identity,
definition version identity, instance binding, Workflow Instance Revision,
Expected Current State, and Expected Workflow Instance Revision. These fixture
members observe specification behavior only; they do not define storage schemas,
persistence locks, or a canonical import operation contract. The canonical
`finkore.workflow.transition` operation includes version binding and
expected-state/revision conflict preconditions.

For Approval Composition, `approval.composition.evaluate` uses a conformance-local logical fixture. `composition` declares exactly one `rootGroup` or ordered `stages`, plus declared `groups` with `ALL_OF`, `ANY_OF`, or `N_OF_M` kind. `requirements` supplies explicit applicability and, for non-quorum members, current state observations. Quorum vectors use explicit voter members and `decisions` entries to observe current-effective voter evidence; an `effective: false` decision is retained history that does not count toward current approval. The normalized success value is `{ "outcome": "APPROVED" | "PENDING" | "REJECTED", "actionableRequirements": [...] }`.

Every supplied composition Decision observation requires `effective` as a JSON
Boolean. Missing, null, numeric, string, array, or object values are malformed
evidence, not truthy/falsy substitutes or defaults. `true` permits consideration
under the existing voter/Requirement/eligibility rules; `false` contributes no
effective vote. Invalid evidence produces `FINKORE_APPROVAL_INVALID_CHAIN` in
category 4 of **APPROVAL-ERROR-010**, after higher-priority structure,
applicability, and required-context failures. Validation includes supplied
evidence in otherwise decisive branches and later stages. The fixture consumes
current-effectiveness observations; adapters do not derive them or repair them.

For Approvals, `approval.chain.evaluate`, `approval.decision.withdraw`,
`approval.decision.supersede`, and `approval.requirement.supersede` remain
conformance-local. They observe deterministic chain composition and
current-effectiveness lifecycle behavior; they are not public Agentic operations
and do not replace Decision history as evidence for which Decision satisfied a
Requirement or which subject facts were bound to that Decision.

Approval history inputs may use the existing Decision array or the
`{ "history": [...], "lifecycle": [...] }` envelope. The array represents
Decision history with no lifecycle events. Recording another Decision preserves
all supplied committed Decisions and lifecycle events; an output omits the
lifecycle member only when there are no lifecycle events. Adapters translate
containers without discarding evidence. Tests that withdraw or supersede, record,
and then evaluate must pass real operation outputs between public APIs as well
as exercise reconstructed-history conformance vectors.

For the operation-specific withdrawal and supersession fixtures, the operation
identifier determines the requested lifecycle kind. A redundant `type` member
inside `withdrawal` or `supersession` has no effect, whether omitted, matching,
conflicting, null, or otherwise malformed. Successful operations append
`WITHDRAWN`, `DECISION_SUPERSEDED`, or `REQUIREMENT_SUPERSEDED`, respectively;
the core operation owns this guarantee. This rule does not apply to committed
lifecycle history, where `type` is the meaningful event discriminator and is
validated as such. It does not prescribe the handling of redundant members in
other production request representations.

A withdrawal target matching zero or multiple committed Decisions, or one
already withdrawn or superseded, produces `FINKORE_APPROVAL_INVALID_DECISION`
under **APPROVAL-VALIDITY-005**. Failure preserves both Decision and lifecycle
history. An accepted withdrawal must also be observed through subsequent
effectiveness evaluation; a success envelope alone is insufficient evidence.

An `approval.requirement.evaluate` fixture with an array of `decisions` may
set `input.observeHistory` to `true`. On successful evaluation the adapter
returns `observations.history` containing the committed decisions after the
operation, alongside the normal requirement-state value. This optional
conformance observation verifies history preservation; it does not change
Approval semantics or introduce a public Agentic operation. Fixtures omitting
the flag retain their existing result shape.

For Entities, Entity create, mutate, transition, and evolution
operations are promoted to canonical `finkore.entity.*` operation identifiers.
They observe identity, lifecycle, mutability, validation, correction, reversal,
void, supersession, revision, relation, currentness, and Audit evidence
semantics defined by the Entity specifications.

The existing evolution fixture supplies `evolutionHistory` as an array of
declared relation observations, including an empty array for no prior relations.
The normalized result represents history as `{ "relations": [...] }`. An
adapter may translate that container into its core's accepted history API and
normalize it back; it must not reject every nonempty input, invent relations,
derive currentness, or implement duplicate policies itself. A follow-on fixture
uses the returned relation array. Native API sequence tests use each documented
history import boundary. Valid unrelated prior relations must survive a later
successful operation, and duplicate-rule tests need paired valid histories
that prove parsing reaches the domain rule. This is a fixture translation
boundary, not a required production envelope.

The relation array declares local evolution-step order, matching the order in
which these fixtures append successful relations. It is not storage enumeration
or a distributed order. `sourceCurrent` and `relatedCurrent` record observations
after their relation's step. Their key is the exact Entity type/identity and
Revision within the supplied definition's identity scope, plus the relation's
supersession scope when applicable. An absent supersession scope is distinct
from every named scope. The first observation for a key establishes its observed
value, subject to the relation kind's required effects. Further observations
must agree unless a declared effect at that step explains the change.

Void establishes a non-current source. Supersession establishes a non-current
source and current successor in its named scope. Correction and Reversal do not
by themselves change an already observed source's currentness; a related
observation also cannot silently override established currentness without a
declared effect. Incompatible source/related assertions about the same key
within one step are contradictory. When an operation appends a relation, the
resulting history must also satisfy these rules; it cannot return evidence that
would be rejected when consumed by a subsequent operation.

Under **ENTITY-EVOLUTION-035**, contradictory observations return
`FINKORE_ENTITY_INVALID_MUTATION`, whether or not `expectedSourceCurrent` is
present. A mismatch against consistent observed currentness instead returns
`FINKORE_ENTITY_STATE_CONFLICT` under **ENTITY-EVOLUTION-025**. The adapter
translates these observations; consistency and currentness are core behavior.
No fixture introduces a timestamp-based winner or an implicit restoration
operation. For example, Supersession A → B followed by B → C in one scope is
consistent: B's earlier `relatedCurrent: true` and later `sourceCurrent: false`
describe different steps with an explicit intervening effect. Separately, an
unscoped Void of B followed by an unscoped Correction assertion that the same
B Revision is current is contradictory: Correction supplies no effect
establishing that change. Different Revisions or scopes are separate keys.

Under **ENTITY-EVOLUTION-034**, supplied Audit history and candidate Event are
validated using **AUDIT-ERROR-004** before evolution correspondence selects an
error. An invalid timestamp plus wrong evolution kind returns
`FINKORE_AUDIT_INVALID_EVENT`; a valid Audit Event with only the wrong evolution
kind returns `FINKORE_ENTITY_INVALID_MUTATION`. Pair combined failures with
Audit-only, correspondence-only, and fully valid controls, and verify both
histories remain unchanged after failure. These examples do not impose
precedence over unrelated Entity failures.

For Entities, `entity.import` remains conformance-local after the
Agentic review. It observes import identity mapping, current and
historical Entity Revision identity, Entity Conflict Version separation, and
expected-state/revision/conflict-version preconditions without defining a
registry, storage lock, or concrete migration format.

## Core 0.9.5 boundary review

These fixture interpretations implement the linked specification obligations;
they do not define a production envelope. The completed
[Core 0.9.5 plan](../docs/plans/plan-09.5.md) corrects these boundaries, with
passing permanent regressions, native API sequences, and paired mutation probes.

### Money serialization and native Audit values

`money.serialize` remains a conformance-local operation. Existing vectors
without a requested presentation scale do not test a native serializer's scale
argument. Native Python and Java tests must exercise exact extension/reduction,
lossy reduction of either sign, zero, trailing zeros, malformed/unsupported
scales, and an explicit-rounding control under
[Money Serialization](../spec/money/serialization.md). TypeScript's public
serializer need not gain a new scale argument to make tests uniform.

JSON cannot encode shared references, cycles, or Java numeric classes. Native
Audit tests therefore supplement Actor/Change vectors at construction, history
import, append, observation, and redaction boundaries. The Java implementation
rejects mutable or unsupported `Number` implementations, including
`AtomicInteger` and `AtomicLong`, with the context-specific actor/event error.
Accepted immutable `Byte`, `Short`, `Integer`, `Long`, `BigInteger`,
`BigDecimal`, and finite `Float`/`Double` values retain their exact accepted
JSON numeric meaning; support does not authorize conversion through `double`
or arbitrary subclass `toString()`. Custom subclasses are not implicitly
supported. This Java native boundary does not require that
other languages implement Java types. Cycles use the existing actor/event
errors; acyclic shared structures remain valid. See
[Actors](../spec/audit/actors.md) and [Changes](../spec/audit/changes.md).

### Workflow presence and ownership

Workflow `expectedCurrentState` and `expectedRevision` are optional fixture members.
Adapters preserve presence, including explicit null. The core applies
[Workflow Conflicts](../spec/workflow/conflicts.md): null expected State uses
`FINKORE_WORKFLOW_INVALID_STATE`; null expected revision uses
`FINKORE_WORKFLOW_STATE_CONFLICT`. Tests pair omission, null, malformed,
matching, and mismatching values, preserving the existing error priority.
Native optional arguments need a representation that distinguishes omission
from explicit null. Native binding tests also mutate constructor inputs and
returned observations after create/import/transition; isolated JSON cannot
exercise those aliases.

The reference Python API expresses omission by leaving the corresponding
keyword argument out. Java provides a four-argument transition overload and
`Workflow.OMITTED` for independently omitted preconditions in the six-argument
overload. Explicit native null remains supplied input. These are API
representations, not additions to the portable fixture or operation identifier.
Workflow invalid-instance fixtures omit normalized error observations; native
tests independently check unchanged source observations. Failures on valid
instances retain State, binding, revision, and supplied guard facts in fixture
observations where applicable.

### Concrete Approval association

The concrete Requirement fixture supplies `subject` with nonempty string
`type` and `id`, and `eligibleActors` as a nonempty list of distinct nonempty
Actor identifiers. Missing, empty, null, or malformed declarations are invalid;
they are not a valid rule that happened to reject an Actor. The existing
missing-subject and missing-eligibility vectors select
`FINKORE_APPROVAL_INVALID_DECISION`. A valid rule excluding the deciding Actor
uses `FINKORE_APPROVAL_INELIGIBLE_ACTOR` at record time.

Concrete Decisions supply `subjectFacts` as an explicit JSON value, including
null. Omission is invalid association under
[Approval Decisions](../spec/approvals/decisions.md). Neither adapters nor cores
may insert current facts or `{}` to fill that omission. Native APIs may use
another explicit association supported by the composing domain. Valid null,
empty-object, scalar, and structured fact controls prevent a universal fact
schema from being inferred. Chain/composition fixtures consume observations;
their `state`, `applicability`, and `effective` members do not authorize using
an incomplete concrete Requirement or Decision at record/evaluation boundaries.

Record and Requirement evaluation validate every supplied concrete historical
Decision before determining current effectiveness. Incomplete evidence remains
invalid even when unrelated, withdrawn, superseded, expired, ineffective, or
placed after an approving Decision. Native record tests also reuse these
malformed histories and verify unchanged Decisions and lifecycle evidence.

### Entity declarations and revision identity

Under **ENTITY-VALIDATION-009**, the bounded fixture rejects an unknown rule,
malformed validator list/entry, missing or empty string `id`/`path`, or missing
or empty `otherPath` for `money-not-greater-than`, with
`FINKORE_ENTITY_INVALID_MUTATION`. A supported predicate rejecting data uses
`FINKORE_ENTITY_VALIDATION_FAILED`. Omitted validation and an empty list are
valid; no general validator language is introduced.

The bounded import fixture rejects equal current-revision/conflict tokens with
`FINKORE_ENTITY_INVALID_IDENTITY` under **ENTITY-REVISION-002**/**007**. It has
no shared-meaning declaration switch. This is not global lexical uniqueness;
the composing-specification exception remains in [Entity Revisions](../spec/entities/revisions.md).
Native retained-definition checks apply **ENTITY-DEFINITION-002**, including
unversioned Entity instances.

### Entity version binding and import preconditions

The versioned Entity fixture retains `binding` inside the Entity observation,
alongside `type`, `id`, `state`, and `data`. It uses the existing Workflow
binding shape: `{ "definitionIdentity": "invoice-workflow",
"definitionVersionIdentity": "1" }`. Creation obtains the initial binding
from the declared Workflow. Every subsequent existing-Entity fixture, including
`entity.import`'s `entity` member and evolution's source/related/successor,
supplies the retained binding explicitly. Successful observations preserve it.
Adapters translate this representation; they never fill a missing binding from
the currently supplied definition. Missing/malformed bindings and mismatches
use the Workflow errors in [Entity Lifecycle](../spec/entities/lifecycle.md).
Unversioned Entity fixtures retain their existing shape.

This closes a fixture documentation omission without changing manifest/vector
syntax `0.1` or defining a canonical import operation. It is not an ignorable
optional field on versioned observations: losing it loses the historical
binding. There was no conforming binding-free versioned observation under
**WORKFLOW-VERSION-007**. Native create → transition → observe/reconstruct or
import → transition sequences must reuse actual output, including bindings,
and have unversioned, malformed-binding, and mismatched-version controls.

Entity import's `expectedState`, `expectedRevision`, and
`expectedConflictVersion` retain supplied-member presence. With otherwise valid
observations, null, malformed, mismatching, or absent-observation expectations
fail with `FINKORE_ENTITY_STATE_CONFLICT` under
[Entity Import](../spec/entities/import.md). Omission performs no check.
Malformed observed identities remain invalid identity, not a precondition
match. No total ordering of unrelated Entity errors is added by these fixtures.

## Core 0.9.6 boundary review

The [Milestone 2 regressions](../docs/plans/plan-09.6.md) exercise native construction,
Approval evaluation/history, redaction authority, Workflow priority, and Entity
presence boundaries. Existing vectors remain evidence only for their exercised
inputs. Four accepted contract decisions are now normative in their owning
specification documents. The expanded suites are intentionally red until the
implementation corrections land; fixture publication is not conformance.

- Native Python Money construction accepts its declared exact `Decimal` type;
  finite exponent forms, signed zero, trailing zeros, and retained scale are
  valid controls. NaN/infinities and unsupported native amount types use
  `FINKORE_MONEY_INVALID_AMOUNT`; invalid currency uses
  `FINKORE_MONEY_INVALID_CURRENCY`. These constructor tests belong in native
  suites, alongside portable `money.deserialize` and serializer checks.
  Malformed Rate `kind` containers are JSON-testable and use
  `FINKORE_MONEY_INVALID_AMOUNT` under MONEY-RATE-007. Neither hashing errors nor
  adapter coercion satisfy that error contract.
- Native Workflow definitions are validated before an invalid domain definition
  is exposed. Exercise direct construction followed by create/import/transition,
  including valid controls and owned nested declarations. Portable combined
  failures exercise WORKFLOW-ERROR-007: invalid definition, invalid instance,
  version mismatch, invalid State, conflict, terminal State, invalid Transition,
  then guard rejection. A malformed observed revision precedes version mismatch;
  a malformed expected revision has the separate conflict meaning.
- Applicable non-quorum composition observations supply explicit valid State;
  an omitted State cannot become `PENDING`. Quorum state instead derives from
  member-specific effective Decision evidence under APPROVAL-QUORUM-010; no
  redundant concrete Requirement or State declaration is added. An empty valid
  effective-vote set is a valid pending control. Null/malformed applicability
  remains unresolved, not false or inapplicable. Required timestamp validation
  uses the complete portable profile and APPROVAL-ERROR-010 category priority,
  including otherwise decisive alternatives and later stages.
- `audit.redact` represents authority as a nonempty string `policy.authority`.
  Missing, null, empty, or wrong-type authority uses
  `FINKORE_AUDIT_REDACTION_INVALID`, without a partial redaction or evidence
  append. This is declaration validation, not an authorization service. This
  review adds no independent policy-ID, policy-lookup, or protected-path rule.
- Evolution `expectedSourceState` and `expectedSourceRevision` preserve supplied
  presence. Against a valid source, explicit null/malformed or mismatching
  expectations use `FINKORE_ENTITY_STATE_CONFLICT`; omitted members skip their
  checks. Native overloads need presence-aware tests as well as JSON fixtures.
- Entity import's supplied `sourceIdentity` is an object with nonempty string
  `sourceSystem` and `sourceId`. Null and wrong types are malformed even with a
  complete `identityMapping`; they use `FINKORE_ENTITY_INVALID_IDENTITY` and
  return no partial import. Under ENTITY-IMPORT-011, omitted Source Identity
  permits complete standalone mapping, which is preserved without synthesizing
  Source Identity. Omitting both remains valid.

The concrete `approval.decision.evaluate` fixture supplies `requirement`,
`decision`, and `currentSubjectFacts`, with optional `relevantFactPaths` and
`evaluatedAt` when expiration applies.
APPROVAL-DECISION-009 defines its validation and effectiveness boundary. Native
facts-only helpers remain separately tested and are not evidence of concrete
Requirement validation. The fixture remains conformance-local, with its existing
EFFECTIVE/INEFFECTIVE results and portable Approval errors.

APPROVAL-VALIDITY-013 defines which Decisions require expiration context before
aggregation. APPROVAL-VALIDITY-014 defines committed history validation in the
supplied lifecycle array's local order. The fixture's `type` discriminators and
Decision target/successor references carry those meanings; a redundant request
`type` does not replace an operation-specific request. Neither fixture infers a
Requirement registry, global ordering, or missing subject facts.

The manifest lists each domain's `construction-evaluation-regressions.json`.
Optional `reviewFinding` and `pairedControl` metadata link review labels and
independently passing control vector IDs; the runner ignores them. Requirements
and exact expected results still define each test, with no new fixture DSL.
Native arrays with holes, cycles, or unsupported objects are not JSON null
fixtures. Structural input failures are core domain errors; unexpected runtime
defects remain infrastructure failures and must not be broadly remapped.

## Runner contract

A language adapter performs:

```text
load manifest and vector file
        ↓
validate syntax, version, IDs, tags, and references
        ↓
map operation identifier to implementation behavior
        ↓
construct exact values from logical input and explicit context
        ↓
execute once
        ↓
normalize only observable result, error code, and requested post-state
        ↓
compare exactly with expected
```

A runner must isolate vectors so one vector cannot depend on another. It must treat absent and explicit null as different, compare monetary values without floating-point tolerance, verify every requested post-operation observation, and fail on an unexpected success or error.

Illustrative pseudocode:

```text
for file in manifest.vectorFiles:
    suite = parseAndValidate(file)
    for vector in suite.vectors:
        adapter.reset()
        actual = adapter.execute(vector.operation, vector.input, vector.context)
        assertExact(normalize(actual), vector.expected)
```

The adapter bridges syntax. The vector observes behavior defined by `/spec`.

## Classification and regression metadata

Tags are deliberately few and may be combined. `positive` and `negative` describe success or rejected input; `boundary` distinguishes a decision edge; `invariant` requires post-state observation; `mutation-sensitive` targets a plausible defect; `regression` permanently records a real defect.

Optional issue metadata is informational and repository-specific. It MUST NOT affect evaluation.

## Specification gaps

A vector must not settle an open question. If the specification does not define an observable result, document the gap and wait for a normative rule. Tests are evidence for the specification, never an accidental second specification.

Core 0.9.6 Approval lifecycle reference regressions compare `decidedAt` by exact
portable instant, including equivalent offsets and nanosecond distinctions.
Two committed Decisions with the same Requirement, Actor, and instant make a
reference ambiguous even when their timestamp spellings differ. Successful
history observations preserve those spellings; rejected history reconstruction
does not claim that malformed input became a committed core observation.
