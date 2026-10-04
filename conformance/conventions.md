# Conformance Vector Conventions

## Versions

The [manifest](manifest.json) discovers the FinKore Core 1.1 conformance baseline
identified in the [conformance index](README.md#scope-and-discovery).

`finkoreConformance` versions the manifest syntax and `finkoreVectorFile`
versions vector-file syntax. These fields are compatibility versions, not
release numbers. Release scope is discovered from manifest-listed files,
requirement IDs, and traceability, not from bumping a format field.

A format version MUST be bumped only when manifest syntax, vector-file syntax, or
the meaning of a defined format member changes in a way that an older consumer
tool cannot faithfully validate. A consumer tool MUST reject versions it does
not support.
Core compatibility rules for normative behavior, portable serializations, and
regression vectors are defined in the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy).

## File and vector shape

Each manifest-listed JSON file is an object containing `finkoreVectorFile` and a non-empty `vectors` array. Each vector has:

- `id`: stable, globally unique, domain-prefixed identifier.
- `spec`: specification topic without a Markdown line number. Domain topics map
  below `spec/`; the shared `shared/conventions` topic maps to
  `spec/conventions.md`.
- `requirements`: non-empty array of stable normative requirement IDs.
- `description`: concise reason the behavior is observable.
- `operation`: language-neutral operation identifier from the catalog below.
- `input`: complete logical operands and fixtures.
- `context`: optional explicit environmental facts such as a timestamp or policy.
- `expected`: the normalized observation.
- `tags`: one or more of `positive`, `negative`, `boundary`, `invariant`, `regression`, and `mutation-sensitive`.
- `guardsAgainst`: optional informational list of plausible defect names.
- `reviewFinding`, `pairedControl`, and `reason`: optional non-normative review
  metadata. These fields do not alter the required financial observation.

Review findings and defect names describe the exercised boundary in words;
consumers do not need a development-plan label to interpret them. A
`pairedControl` retains its stable case identifier even when that identifier
contains a historical version or review label. These identifiers are not prose
to renumber or repurpose.

Manifest-listed vector syntax is closed in format version `0.1`. The declared
JSON Schema uses `additionalProperties: false`, so a consumer MUST reject an
unknown vector-file, vector, expected-result, or error member during mandatory
schema validation. The optional review fields listed above are defined members,
not extensions. Adding a new syntax member requires a compatible published
schema and the format-version assessment described above; private metadata must
remain outside manifest-listed files.

`expected.status` is either `success` or `error`. Success uses `value`; failure uses `error.code`. Either may include `observations` for post-operation state. A vector MUST NOT contain both `value` and `error`. Error messages are never compared. Exact object member order is irrelevant; array order is significant unless a specific operation says otherwise.

The normalized observation belongs only to conformance infrastructure. Production FinKore libraries are not required to return this shape.

## Canonical values

Money is represented as `{"amount":"plain base-10 decimal","currency":"ISO code"}`.
Implementations perform Money operations and comparisons under `/spec`. For
Money operation results without an explicit target scale, the consumer binding
exposes a canonical conformance amount observation: plain notation, no leading
plus or redundant integer zeros, no trailing fractional zeros, no decimal point
when the fractional part is empty, and `"0"` for numeric zero. The binding must
derive this spelling from the actual exact result. It must not read, copy, or
otherwise substitute `expected.value`.

When `finkore.money.round` or `finkore.money.allocate` supplies an explicit
target `scale`, each result amount instead has exactly that many fractional
digits. `finkore.money.applyrate` follows that rule when its explicit
`rounding.scale` is present and uses the canonical observation otherwise.
`finkore.money.divide` uses exactly `rounding.scale` fractional digits only when
the valid policy reduces a nonterminating quotient; an exactly representable
quotient remains exact and uses the canonical unscaled observation even when a
policy was supplied.
Requested operand post-state observations use the corresponding input amount's
fractional digit count, so unchanged-value evidence does not require a native
implementation to retain lexical scale. Extending with zeros or removing only
trailing zeros is presentation normalization; changing a non-zero digit is a
different numeric value and must fail exact comparison.

The evaluation tool compares the binding's normalized observation exactly. It
does not recognize Money-shaped objects, remove trailing zeros, compare decimal
strings numerically, or apply currency, rounding, or allocation rules. This
keeps financial behavior in the implementation and presentation normalization
in the binding while leaving the comparison layer domain-neutral.

Trailing fractional zeros MAY be present in vector input. Numeric equality is
observed through a domain operation such as `finkore.money.compare`, whose
normalized result is `EQUAL`; it is not created by special comparison logic.
For an operation that returns Money, the expected decimal string records the
canonical or explicit-target-scale observation defined above. Equivalent native
values such as decimal `15.50`, `15.5`, or an exact coefficient/scale pair all
reach `"15.5"` for an unscaled result. Exact `15.500` rounded to scale 2 reaches
`"15.50"`. `"15.5"` and `"15.5001"` never converge because the latter changes
numeric value. Negative values follow the same rule: `-2.50` reaches `"-2.5"`,
while exact zero reaches `"0"` regardless of a native negative-zero spelling.

The `finkore.money.allocate` fixture supplies `value`, `allocation`, and
`scale`. `allocation.method` is `EQUAL` with `parts` or `RATIO` with `ratios`.
Scale, parts, and ratio entries are JSON numbers with integer mathematical
values. Scale and parts use the inclusive ranges defined by
MONEY-ALLOCATION-014, and ratio entries use its inclusive exact JSON integer
range. Consumer bindings pass these values to their implementation without
applying
range or allocation rules.
Conformance-only sentinels use `{"presence":"ABSENT"}` and `{"presence":"REDACTED"}` when absence and policy-authorized concealment must be observed distinctly from JSON `null`. Consumer bindings translate their own representations to these sentinels; production APIs are not required to expose them.

## Declarative fixtures

Workflow guard expressions and entity validation rules in these vectors are
small conformance fixtures, not additions to the FinKore business specification or
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

Consumer-native public API tests should supplement these JSON fixtures by
attempting to mutate
construction inputs and returned definition observations, including nested guard
objects and arrays. They cover creation and import, accepted and rejected facts,
and unversioned controls. The same retained predicate must continue to evaluate
under the original binding; either immutable observations or defensive copies
satisfy this ownership check. Unsupported native comparison values require
consumer-native tests because they cannot be represented in a JSON vector.

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
greater than zero. These fixtures let every consumer binding exercise guard/validation
ordering and atomicity under the same deterministic predicate.

An Entity validator's optional `states` member is a nonempty array of distinct,
nonempty States declared by the Entity's Workflow. It limits that rule to the
named current or proposed State; omission applies the rule in every State. A
null, empty, duplicate, non-string, or undeclared selector makes the validator
declaration invalid. Entity transition applies the same guard fixture as
`finkore.workflow.transition`: optional object-valued `facts` are forwarded
unchanged, omission supplies no facts, and Entity data or ambient sources are
never substituted. Under the Core 2.0 operation contract, supplied null, array,
or scalar `facts` uses `FINKORE_WORKFLOW_INVALID_CONTEXT` after the earlier
Workflow checks through invalid Transition and before guard rejection. Format
`0.1` is unchanged; the new expectation is a Core semantic change, not a vector
file syntax change.

Audit Change fixtures reflect the production declaration in
**AUDIT-CHANGE-009** by using `"valueType":"MONEY"` when `before` and `after`
carry Money semantics. Without that declaration, even an object containing
`amount` and `currency` is compared as ordinary JSON under
**AUDIT-CHANGE-008**. The conformance-only `{"presence":"ABSENT"}` sentinel
continues to observe domain absence and is not a production type declaration.
Malformed declared Money values produce `FINKORE_AUDIT_INVALID_EVENT`; bindings
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
all financial entities. Consumer implementations evaluate the predicate;
bindings only translate fixtures and observations.


Timestamps use the portable FinKore RFC 3339 profile in
[SPEC-TIMESTAMP-001 through -006](../spec/conventions.md#portable-values).
They use uppercase `T` and `Z`, a valid year from `0001` through `9999`,
seconds from `00` through `59`, `Z` or a known numeric offset, and at most
nine fractional digits. Exact instant comparison includes all accepted
fractional digits. Identifiers are opaque strings. States and outcomes use the
exact domain names supplied by the vector.

## Semantic operation catalog

These identifiers name observable behavior, not implementation methods.
Their complete current fixture shapes, omission/null rules, results, errors,
and requested post-state interpretations are defined in
[Portable Conformance Operation Contracts](operations.md).

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
| `finkore.entity.transition` | Apply a lifecycle transition under the referenced Workflow using supplied guard facts, then validate the complete target-State Entity. |
| `finkore.entity.evolution.correct` | Record a Correction relation with required Audit evidence. |
| `finkore.entity.evolution.reverse` | Record a Reversal relation with required Audit evidence. |
| `finkore.entity.evolution.void` | Record a Void relation with required Audit evidence. |
| `finkore.entity.evolution.supersede` | Record a Supersession relation with required Audit evidence. |
| `entity.import` | Validate and observe an existing Entity with optional source identity mapping, business revision history, and conflict-version preconditions. |

Logical fixtures in `input` are intentionally small declarative models. A
consumer binding constructs any idiomatic implementation objects required to
realize them. The fixtures do not define a production interchange format.

Identifiers beginning with `finkore.` are canonical operations in the
[Agentic Contract](../agentic/operations.md). Remaining catalog entries are
conformance-local operations until their stable public contracts are
reviewed; vector use alone does not make them advertised FinKore capabilities.
Audit ordering requirements are verified through append-only history and review of explicitly recorded relationships; Core 1.1 does not define `audit.order` as an executable conformance operation or as an Agentic operation. Audit Relationships are observed through ordinary `finkore.audit.append` and `audit.redact` fixtures, not a separate relationship operation.
For Money, `money.deserialize` and `money.serialize` remain
conformance-local representation boundary checks. They exercise normative Money
serialization but are not separate public Agentic operations. Rate application
and Allocation use canonical
`finkore.money.applyrate` and `finkore.money.allocate` identifiers.
For Workflow, `workflow.import` remains conformance-local. Versioned Workflow fixtures may include definition identity,
definition version identity, instance binding, Workflow Instance Revision,
Expected Current State, and Expected Workflow Instance Revision. These fixture
members observe specification behavior only; they do not define storage schemas,
persistence locks, or a canonical import operation contract. The canonical
`finkore.workflow.transition` operation includes version binding and
expected-state/revision conflict preconditions.

Every portable Workflow State identifier in a definition, instance, requested
target, or expected-current-State precondition is a nonempty string under
**WORKFLOW-STATES-009**. Empty definition positions use
`FINKORE_WORKFLOW_INVALID_DEFINITION`; an empty instance current State uses
`FINKORE_WORKFLOW_INVALID_INSTANCE`; and an empty target or expected State uses
`FINKORE_WORKFLOW_INVALID_STATE`. Nonempty identifiers remain opaque and
case-sensitive.

For `approval.chain.evaluate`, every declared Requirement has an explicit
`APPROVED`, `PENDING`, or `REJECTED` state observation and every supplied state
is validated before an outcome is returned. An unordered Chain returns its
aggregate state. A sequential Chain returns
`{"state":"APPROVED|PENDING|REJECTED","activeRequirements":[...]}`. Its first
non-approved Requirement in declared order determines current outcome: pending
makes that Requirement the single active entry; reached rejection uses the
declared rejection outcome with an empty active list; complete approval also has
an empty active list. A later rejection cannot bypass a pending predecessor.
This is separate from parallel groups within an Approval Composition stage.

Concrete Decision and history fixtures do not accept an `effective` member.
They derive effectiveness from the complete evidence required by Approval
Validity; any supplied member uses `FINKORE_APPROVAL_INVALID_DECISION` whether
its value is true, false, or malformed. Composition's explicit Boolean
`effective` observation remains a separate lightweight fixture. During concrete
Requirement evaluation, every structurally valid Decision identifying the
evaluated Requirement is checked against that Requirement's eligibility rule
even when lifecycle, expiration, or stale facts exclude it from current effect.
A Decision for another Requirement is structurally validated but is not checked
against the evaluated Requirement's eligibility rule and cannot affect its
outcome.

For Approval Composition, `approval.composition.evaluate` uses a conformance-local logical fixture. `composition` declares exactly one `rootGroup` or ordered `stages`, plus declared `groups` with `ALL_OF`, `ANY_OF`, or `N_OF_M` kind. `requirements` supplies explicit applicability and, for non-quorum members, current state observations. Quorum vectors use explicit voter members and `decisions` entries to observe current-effective voter evidence; an `effective: false` decision is retained history that does not count toward current approval. The normalized success value is `{ "outcome": "APPROVED" | "PENDING" | "REJECTED", "actionableRequirements": [...] }`.

Every supplied composition Decision observation requires `effective` as a JSON
Boolean. Missing, null, numeric, string, array, or object values are malformed
evidence, not truthy/falsy substitutes or defaults. `true` permits consideration
under the existing voter/Requirement/eligibility rules; `false` contributes no
effective vote. Invalid evidence produces `FINKORE_APPROVAL_INVALID_CHAIN` in
category 4 of **APPROVAL-ERROR-010**, after higher-priority structure,
applicability, and required-context failures. Validation includes supplied
evidence in otherwise decisive branches and later stages. The fixture consumes
current-effectiveness observations; bindings do not derive them or repair them.

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
lifecycle member only when there are no lifecycle events. Consumer bindings translate
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
set `input.observeHistory` to `true`. On successful evaluation the binding
returns `observations.history` containing the committed decisions after the
operation, alongside the normal requirement-state value. This optional
conformance observation verifies history preservation; it does not change
Approval semantics or introduce a public Agentic operation. Fixtures omitting
the flag retain their existing result shape.

For Entities, Entity create, mutate, transition, and evolution
operations use canonical `finkore.entity.*` operation identifiers.
They observe identity, lifecycle, mutability, validation, correction, reversal,
void, supersession, revision, relation, currentness, and Audit evidence
semantics defined by the Entity specifications.

The existing evolution fixture supplies `evolutionHistory` as an array of
declared relation observations, including an empty array for no prior relations.
The normalized result represents history as `{ "relations": [...] }`. A
consumer binding may translate that container into its implementation's accepted history API and
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
`FINKORE_ENTITY_STATE_CONFLICT` under **ENTITY-EVOLUTION-025**. The binding
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

## Consumer-owned evaluation contract

A consumer-owned implementation binding and evaluation tool perform:

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

The tool must isolate vectors so one vector cannot depend on another. It must
treat absent and explicit null as different, compare monetary values without
floating-point tolerance, verify every requested post-operation observation,
and fail on an unexpected success or error.

Illustrative pseudocode:

```text
for file in manifest.vectorFiles:
    suite = parseAndValidate(file)
    for vector in suite.vectors:
        binding.resetIfNeeded()
        actual = binding.execute(vector.operation, vector.input, vector.context)
        assertExact(normalize(actual), vector.expected)
```

The binding bridges syntax. FinKore does not prescribe this pseudocode as an API.
The vector observes behavior defined by `/spec`.

## Classification and regression metadata

Tags are deliberately few and may be combined. `positive` and `negative` describe success or rejected input; `boundary` distinguishes a decision edge; `invariant` requires post-state observation; `mutation-sensitive` targets a plausible defect; `regression` permanently records a real defect.

Optional issue metadata is informational and repository-specific. It MUST NOT affect evaluation.

## Specification gaps

A vector must not settle an open question. If the specification does not define an observable result, document the gap and wait for a normative rule. Tests are evidence for the specification, never an accidental second specification.
