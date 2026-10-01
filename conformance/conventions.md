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

### Entity application values

[ENTITY-VALIDATION-011](../spec/entities/validation.md) governs the supported
native value profile, independent ownership, exact values and owning error
categories. `entities/application-values.json` exercises supported JSON values
through creation, import, mutation, transition and all four evolution operations.
Native tests supplement JSON for shared references, cycles, unsupported numeric
objects/subclasses, non-finite values, exact native decimals and observation reuse.
The application-value import control supplies historical revision evidence.
The separate `entities/import-history.json` cases exercise ENTITY-IMPORT-012: every
successful import includes `historicalRevisions`, empty when supplied history is
omitted or empty. This represents supplied evidence only; null and malformed
history remain invalid, and failed observations retain input member presence.

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

An imported revision object may omit its `current` marker; its enclosing
`currentRevision` or `historicalRevisions` field declares its role. A supplied
marker must be Boolean and agree with that role. A contradictory or malformed
marker is invalid revision input under **ENTITY-REVISION-007** and
**ENTITY-IMPORT-009**; import must not silently rewrite it. Failure preserves
the supplied observation under **ENTITY-IMPORT-008**.

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

## Core 0.9.7 accepted correction fixtures

These conventions encode the accepted [Milestone 1 decisions](../docs/plans/plan-09.7.md).
The owning specifications define behavior; M2 adds permanent regressions and
M3–M7 synchronize implementations. The existing 884 passing vectors do not
establish these newly reviewed boundaries.

### Approval relevance, selectors, and equality

Under APPROVAL-FACT-001 through APPROVAL-FACT-004, concrete
`approval.decision.evaluate` requires `currentSubjectFacts` as a present JSON
value, including explicit null. `approval.requirement.evaluate` retains optional
current facts: omission together with omitted selectors evaluates history without
claiming current-fact comparison. Neither core nor adapter fills omitted current
facts from a historical Decision. Historical `subjectFacts` remains required.

When current facts are supplied, omitted `relevantFactPaths` compares the entire
value. A supplied list must be nonempty and contain valid selector strings;
null, an empty list, a wrong-type list/member, or malformed selector yields
`FINKORE_APPROVAL_INVALID_DECISION`. Supplied selectors without current facts
have that same error. Duplicate relevance paths merely repeat the same comparison
and do not disable validation. Explicit null current facts are compared as null.

Both `relevantFactPaths` and condition `requiredFacts` use dot-separated object
member paths. A path and every segment must be nonempty: `invoice.amount` is
valid; `""`, `.amount`, `invoice.`, and `invoice..amount` are malformed.
Member names are case-sensitive and are not trimmed or normalized. Each step
uses only an own member of an object. Numeric-looking segments may address
object keys; they never index arrays. Other characters have literal member-name
meaning, not wildcard, bracket, or expression syntax. There is no escaping or
fallback to a literal dotted key: `invoice.amount` does not select the top-level
key `"invoice.amount"`. Such a key remains part of whole-value comparison.
Own `__proto__`, `constructor`, and `prototype` members are ordinary facts;
inherited members do not supply evidence.

A missing selected leaf, a missing intermediate member, or traversal through
null/scalar/array is unavailable. Required condition facts then yield
`FINKORE_APPROVAL_CONDITION_UNRESOLVED`; selected Decision facts do not match,
even when absent on both sides. Present null, false, zero, and empty string
leaves are available. Equality of selected leaves or complete values is recursive:
object member order is immaterial, arrays preserve length/order, types remain
distinct, and exact accepted numbers compare independently of decimal scale.
For example, numeric 1 and native decimal 1.00 compare equal; `"1"`, true, and
1 do not. A Money-shaped object remains an ordinary object, so amount strings
`"1.0"` and `"1.00"` differ. Missing object members differ from null members.
Signed numeric zero compares equal. No Money rounding or tolerance is involved.

Native numeric tests supplement JSON vectors. Shared JSON vectors use values
whose numeric meaning survives each adapter's supported parse/serialization
boundary; arbitrary-precision decimal and large-integer equality is tested
natively rather than passed through a lossy JavaScript JSON number. This does
not make JSON numbers a serialization for exact decimal domain values under
SPEC-DECIMAL-002 or allow converting strings into numbers.

### Condition declaration and evidence

Under APPROVAL-CONDITION-007, `condition` is an object with nonempty string `id`
and `evaluation`, and `requiredFacts` is an explicit nonempty array of distinct
valid selectors. `evaluation` identifies the composing evaluation boundary; it
is not executable code. Missing/null/wrong-type declarations, empty required
lists, duplicate required selectors, and malformed paths use
`FINKORE_APPROVAL_INVALID_DECISION` before any external result is accepted.
The `facts` member is an object. Omitted facts leave required facts unavailable
(`FINKORE_APPROVAL_CONDITION_UNRESOLVED`); a supplied null or non-object facts
container is malformed (`FINKORE_APPROVAL_INVALID_DECISION`). Missing required
members of a valid object remain unresolved. With complete facts, `result` must
be exactly `APPLICABLE` or `NOT_APPLICABLE`, otherwise it is unresolved. No
declaration or result substitutes for actual required fact presence.

### Quorum evidence and disconnected declarations

Each applicable quorum Requirement observation supplies `eligibleActors` as an
array of nonempty Actor identifier strings and explicit `approvedOutcome` and
`rejectedOutcome` mappings to distinct supported Decision outcomes. An empty
eligibility list is valid evidence that no Actor qualifies; it is not omitted
evidence, and repetition cannot create votes. The mappings are not filled with
defaults. Missing, null, or malformed required evidence uses
`FINKORE_APPROVAL_INVALID_CHAIN` in APPROVAL-ERROR-010 category 4, even for an
empty Decision list. A valid list excluding the voter yields no vote; it does
not make the definition malformed. A pending member and unreachable threshold
retain APPROVAL-QUORUM-006/010 outcomes.

An explicitly `NOT_APPLICABLE` member requires no eligibility/mapping evidence
or vote. Optional evidence, when supplied, must still have valid shape. Every
Requirement referenced by any declared group requires applicability evidence;
unused groups do not escape validation or become actionable. Quorum observations
do not require a concrete `subject` or redundant `state`. Non-quorum applicable
observations retain their required State. Decision `effective` remains a required
Boolean; `decisions: []` is a valid no-vote control. Composition omission retains
its empty-list convenience; explicitly supplied null is malformed evidence and
uses `FINKORE_APPROVAL_INVALID_CHAIN`. Adapters preserve that distinction.

Disconnected cycles and unresolved children are invalid structure (category 1),
not missing observation evidence (category 4). A valid unused group is permitted.
Root/stage-to-child depth remains four, checked on every evaluated path; a shared
child reached through different depths cannot hide the deeper path. Whole-graph
cycle validation does not create artificial evaluation roots for unused groups.
Success retains the existing exact `{outcome, actionableRequirements}` shape,
with actionability restricted to the existing reachable pending branches/order.

### Proposed Approval history

APPROVAL-VALIDITY-015 checks the proposed appended Decision array against all
retained lifecycle events before returning record success. A collision with any
retained withdrawal target or supersession target/successor yields
`FINKORE_APPROVAL_INVALID_DECISION`, with both histories unchanged. Reference
tuples are Requirement identifier, Actor identifier, and exact decision instant.
Equivalent offset spellings collide; nanosecond-distinct instants do not.
Equal tuples unreferenced by lifecycle evidence are not banned. A successful
record returns all earlier history and lifecycle evidence plus the new Decision,
preserving timestamps and local order. Tests use actual returned envelopes in
subsequent record/lifecycle/evaluation calls without repairing them.

Record error diagnostics retain the existing `observations.history` Decision
array convention. Native tests separately assert that the lifecycle collection
also remains unchanged. For an omitted input history, diagnostics may show an
empty history; the operation still rejects the missing required collection.
This diagnostic projection does not imply successful history import.

### Supported native retained values

APPROVAL-FACT-004 and WORKFLOW-GUARD-007 require validation in owning cores.
The reference correction profiles use null, strings, Booleans, finite supported
numbers, arrays/lists, and objects/maps with string own member names. Containers
are captured independently; acyclic shared children are valid, cycles and
unsupported scalar objects are rejected. This profile governs Approval facts
and retained Workflow comparison values, not arbitrary application objects or
new persistence serialization.

| Reference runtime | Supported numeric values and exact comparison interpretation |
| --- | --- |
| TypeScript | Finite primitive `number`, interpreted by its ECMAScript decimal round-trip spelling. No boxed number, bigint, NaN, infinity, or custom numeric object is implicitly supported. Integers already rounded by the caller cannot be recovered. |
| Python | Built-in `int` and finite built-in `float`; Approval also retains immutable finite `Decimal`. Workflow guards retain their existing rejection of Decimal. Boolean stays a separate category. For Approval comparison, integers/Decimals retain exact value and floats use their decimal round-trip spelling. Numeric subclasses and other numeric objects are unsupported. Decimal context must not round equality. |
| Java | Exact classes `Byte`, `Short`, `Integer`, `Long`, `BigInteger`, `BigDecimal`, and finite `Float`/`Double`. Integral/decimal values retain exact value; float/double use their standard decimal round-trip spelling. No conversion of exact values through double; no arbitrary `Number.toString()` coercion. `AtomicInteger`, `AtomicLong`, other Number classes, and BigInteger/BigDecimal subclasses are rejected. |

The comparison interpretation above governs Approval facts; it does not extend
Workflow guard equality or its supported Python numeric set.
Round-trip spelling assigns the supported native binary scalar its documented
JSON numeric meaning; subsequent equality compares that decimal value exactly.
It is not a way to repair an unsupported value or round an exact decimal.
Representations outside the common JSON range remain native-only test inputs.
Numeric strings remain strings. Native collection APIs are language-specific;
neither mutable container aliases nor returned observations may change captured
facts or bound guard meaning.

Unsupported concrete Approval facts use `FINKORE_APPROVAL_INVALID_DECISION`;
composition evidence uses `FINKORE_APPROVAL_INVALID_CHAIN` in its evidence
category. Unsupported retained guard values use
`FINKORE_WORKFLOW_INVALID_DEFINITION`, with existing Workflow error priority.
Native tests must include supported immutable controls and mutate original and
returned containers separately. Existing facts-only helpers remain documented
as such. Concrete APIs/bridges need omission-aware arguments: migrating Python
`None`/Java null selector defaults must not erase explicit portable null.

### Entity mutability and failure observation

Under ENTITY-MUTABILITY-008 the bounded `definition.mutability` is a required
object whose own nonempty State names map to arrays of nonempty field names.
Each declared lifecycle State has an explicit entry; an empty array means no
fields may change. Missing/null/wrong-type containers, absent required entries,
and malformed field lists/members use `FINKORE_ENTITY_INVALID_MUTATION`.
A valid empty permission list instead produces `FINKORE_ENTITY_IMMUTABLE` when
a protected field is targeted. This distinguishes a malformed declaration from
valid immutable data. Own special names survive construction, observation,
serialization/import, and subsequent operations under ENTITY-DEFINITION-002.

For evolution, omitted `auditHistory` retains the existing empty-history fixture
default; `[]` or `{history: []}` explicitly supplies empty history. A null or
wrong-type supplied history is malformed, not omission. AUDIT-ERROR-004 validates
history before candidate evidence, and ENTITY-EVOLUTION-034 preserves its primary
Audit error before correspondence checks. Empty history does not waive required
relationship-target resolution. A valid control needs corresponding Audit
evidence with resolvable targets. A failure adapter preserves the core error and
observes unchanged supplied inputs without calling object methods on null or
claiming a malformed history was successfully imported. Native tests establish
unchanged Entity/revision/currentness/relation/Audit state; invalid histories
need not be fabricated into valid normalized observations.

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

## Core 0.9.7 discovery corrections

The maintainer accepted D6–D7 in the [plan](../docs/plans/plan-09.7.md).
WORKFLOW-STATES-008 requires explicit array-valued `terminalStates` and
`transitions` in the bounded definition, including embedded Entity Workflows.
Empty arrays remain valid. Native convenience defaults are separate from
portable parsing and cannot repair missing fixture members.

APPROVAL-DECISION-010 requires explicit `history` or `decisions` at concrete
operations consuming those collections. An array or an envelope with an explicit
`history` array is valid; an absent member, null, or missing envelope array is
invalid Decision input. This does not change composition's separate collection
and INVALID_CHAIN rules. APPROVAL-DECISION-011 keeps Actor `type` optional;
a supplied type is a nonempty string at concrete Decision/lifecycle boundaries.

ENTITY-IDENTITY-007 requires explicit nonempty `definition.identityScope`.
ENTITY-VALIDATION-010 requires object-valued `data` on creation and existing
Entity observations; missing/null/non-object data uses ENTITY_VALIDATION_FAILED.
ENTITY-LIFECYCLE-007 preserves Workflow errors: malformed/missing/empty current
`state` uses WORKFLOW_INVALID_INSTANCE, undeclared nonempty State uses
WORKFLOW_INVALID_STATE, after definition validation. ENTITY-MUTABILITY-009
rejects an empty `changes` object with ENTITY_INVALID_MUTATION. These bounded
representations do not standardize a production Entity envelope or data schema.

D8 is now resolved by AUDIT-REDACTION-008: `policy.id` is optional; a supplied
value must be a nonempty string. Supplied null, empty or non-string values use
FINKORE_AUDIT_REDACTION_INVALID during policy validation before candidate
evidence validation. Omission cannot replace authority or protected targets,
and ID presence does not change the redacted content. Native convenience absence
sentinels are documented separately from portable omission; explicit null is
not omitted input. `audit.redact` remains conformance-local.

M2 full-envelope vectors remain manifest-listed and are compared exactly by the
unchanged runner. The supplementary [boundary cases](boundary097-cases.json)
cover native behavior and adapter results whose optional diagnostic envelope is
not specified. Their tests compare complete success values or exact portable
error codes and independently snapshot supplied input. They do not make optional
diagnostics mandatory or infer domain results from implementation agreement.
`reviewFinding` and `pairedControl` are non-normative review metadata, now also
recognized by the vector schema; they do not affect runner execution.
