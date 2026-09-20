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

Money is represented as `{"amount":"plain base-10 decimal","currency":"ISO code"}`. A normalized Money result uses a canonical plain decimal string: no plus sign, no exponent, no insignificant leading zeros, and zero is not negative. Trailing fractional zeros MAY be present in vector input, but runners compare Money numerically and exactly with currency. Where an operation defines target scale, the expected result uses that scale to expose the boundary.
The `finkore.money.allocate` fixture supplies `value`, `allocation`, and
`scale`. `allocation.method` is `EQUAL` with `parts` or `RATIO` with `ratios`.
Scale, parts, and ratio entries are JSON numbers with integer mathematical
values. Scale and parts use the inclusive ranges defined by
MONEY-ALLOCATION-014, and ratio entries use its inclusive exact JSON integer
range. Adapters pass these values to their core implementation without applying
range or allocation rules.
Conformance-only sentinels use `{"presence":"ABSENT"}` and `{"presence":"REDACTED"}` when absence and policy-authorized concealment must be observed distinctly from JSON `null`. Adapters translate their own representations to these sentinels; production APIs are not required to expose them.

## Declarative fixtures

Workflow guard expressions and entity validation rules in these vectors are small adapter fixtures, not additions to the FinKore business specification or a general expression DSL. The fixture `{"fact":"x","equals":value}` compares one explicitly supplied fact. The entity validator named `positive-money` accepts an exact Money amount greater than zero. These fixtures let every adapter exercise guard/validation ordering and atomicity under the same deterministic predicate.


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
| `approval.decision.evaluate` | Determine whether a decision remains effective for supplied subject facts. |
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

For Approvals, `approval.chain.evaluate`, `approval.decision.withdraw`,
`approval.decision.supersede`, and `approval.requirement.supersede` remain
conformance-local. They observe deterministic chain composition and
current-effectiveness lifecycle behavior; they are not public Agentic operations
and do not replace Decision history as evidence for which Decision satisfied a
Requirement or which subject facts were bound to that Decision.
For Entities, Entity create, mutate, transition, and evolution
operations are promoted to canonical `finkore.entity.*` operation identifiers.
They observe identity, lifecycle, mutability, validation, correction, reversal,
void, supersession, revision, relation, currentness, and Audit evidence
semantics defined by the Entity specifications.
For Entities, `entity.import` remains conformance-local after the
Agentic review. It observes import identity mapping, current and
historical Entity Revision identity, Entity Conflict Version separation, and
expected-state/revision/conflict-version preconditions without defining a
registry, storage lock, or concrete migration format.

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

The adapter bridges syntax. The vector defines behavior.

## Classification and regression metadata

Tags are deliberately few and may be combined. `positive` and `negative` describe success or rejected input; `boundary` distinguishes a decision edge; `invariant` requires post-state observation; `mutation-sensitive` targets a plausible defect; `regression` permanently records a real defect.

Optional issue metadata is informational and repository-specific. It MUST NOT affect evaluation.

## Specification gaps

A vector must not settle an open question. If the specification does not define an observable result, document the gap and wait for a normative rule. Tests are evidence for the specification, never an accidental second specification.
