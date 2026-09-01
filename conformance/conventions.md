# Conformance Vector Conventions

## Versions

`finflowConformance` versions the manifest and `finflowVectorFile` versions vector-file syntax. Version `0.1` targets FinFlow Core Draft 0.1. A runner MUST reject versions it does not support.

## File and vector shape

Each manifest-listed JSON file is an object containing `finflowVectorFile` and a non-empty `vectors` array. Each vector has:

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

The normalized observation belongs only to conformance infrastructure. Production FinFlow libraries are not required to return this shape.

## Canonical values

Money is represented as `{"amount":"plain base-10 decimal","currency":"ISO code"}`. A normalized Money result uses a canonical plain decimal string: no plus sign, no exponent, no insignificant leading zeros, and zero is not negative. Trailing fractional zeros MAY be present in vector input, but runners compare Money numerically and exactly with currency. Where an operation defines target scale, the expected result uses that scale to expose the boundary.
Conformance-only sentinels use `{"presence":"ABSENT"}` and `{"presence":"REDACTED"}` when absence and policy-authorized concealment must be observed distinctly from JSON `null`. Adapters translate their own representations to these sentinels; production APIs are not required to expose them.

## Declarative fixtures

Workflow guard expressions and entity validation rules in these vectors are small adapter fixtures, not additions to the FinFlow business specification or a general expression DSL. The fixture `{"fact":"x","equals":value}` compares one explicitly supplied fact. The entity validator named `positive-money` accepts an exact Money amount greater than zero. These fixtures let every adapter exercise guard/validation ordering and atomicity under the same deterministic predicate.


Timestamps are RFC 3339 instants with `Z` or an explicit numeric offset. Identifiers are opaque strings. States and outcomes use the exact domain names supplied by the vector.

## Semantic operation catalog

These identifiers name observable behavior, not implementation methods.

| Operation | Logical observation |
| --- | --- |
| `money.deserialize` | Parse the normative portable Money JSON value. |
| `money.serialize` | Produce the normative portable Money JSON value. |
| `money.add`, `money.subtract` | Exact compatible-currency arithmetic. |
| `money.negate` | Exact sign reversal. |
| `money.multiply`, `money.divide` | Exact scalar arithmetic, with an optional explicit rounding policy where needed. |
| `money.compare` | Return `LESS`, `EQUAL`, or `GREATER`. |
| `money.round` | Reduce to the explicit `scale` using the explicit `mode`. |
| `workflow.create` | Validate a definition and create an instance at its initial state. |
| `workflow.transition` | Request the supplied target from the instance's current state using supplied guard facts. |
| `audit.append` | Append one event to supplied committed logical history. |
| `audit.replace`, `audit.remove` | Attempt the named change to committed logical history. |
| `audit.redact` | Produce a policy-authorized redacted logical representation and evidence event. |
| `audit.order` | Determine only the explicitly established ordering relation between two events. |
| `approval.requirement.evaluate` | Derive one requirement's `PENDING`, `APPROVED`, or `REJECTED` state. |
| `approval.decision.record` | Validate and commit a decision. |
| `approval.decision.evaluate` | Determine whether a decision remains effective for supplied subject facts. |
| `approval.condition.evaluate` | Return `APPLICABLE` or `NOT_APPLICABLE` from explicit facts. |
| `approval.chain.evaluate` | Derive chain state from its declared combination and effective decisions. |
| `entity.create` | Create under the supplied composing-domain definition. |
| `entity.mutate` | Apply a declared mutation under supplied mutability and validation rules. |
| `entity.transition` | Apply a lifecycle transition under the referenced workflow. |

Logical fixtures in `input` are intentionally small declarative models. An adapter constructs any idiomatic implementation objects required to realize them. The fixtures do not define a production interchange format.

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
