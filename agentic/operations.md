# FinKore Operation Registry

## Scope

This registry includes only operation boundaries clearly supported by both the
current specification and conformance vectors. Other conformance
operation labels remain conformance-local vocabulary until their stable agent-facing
contract, effects, and inputs are reviewed.

The Core 0.9 release-candidate review checked every promoted operation in this
registry for stable purpose, input semantics, success output, preconditions,
postconditions, portable errors, effects, and requirement references. Each
promoted operation is also used by manifest-listed conformance vectors. No
Approval operation label,
Workflow import/create label, Entity import label, Money serialization label, or
Audit redaction label is promoted as a canonical Agentic operation in Core 0.9 release candidate.

The conformance-local `audit.redact` fixture follows AUDIT-REDACTION-008:
`policy.id` is optional; supplied values must be nonempty strings or policy
validation rejects with `FINKORE_AUDIT_REDACTION_INVALID`. Authority and protected
targets remain required. This clarification does not promote a new Agentic operation.

Approval conformance labels, including `approval.chain.evaluate`,
`approval.composition.evaluate`, `approval.decision.withdraw`,
`approval.decision.supersede`, and `approval.requirement.supersede`, remain
conformance-local after the Core 0.9 release candidate Agentic review. They observe Approval
evaluation and lifecycle behavior through test fixtures; they are not promoted
to canonical Agentic operations because public Approval operation contracts still
need a stable agent-facing input model, diagnostics policy, and security review
separate from conformance fixtures.

The conformance-local Approval contracts now make three corrected boundaries
explicit. Sequential Chain outcome/actionability follows the first non-approved
Requirement under `APPROVAL-CHAIN-010`; concrete Decision/history input rejects
a caller-supplied `effective` member under `APPROVAL-VALIDITY-016`; and concrete
Requirement evaluation applies the evaluated Requirement's eligibility rule to
all of its supplied Decisions, but not to Decisions for another Requirement,
under `APPROVAL-DECISION-012`. These clarifications do not promote an Approval
operation to the canonical registry.

Timestamp fields used by these Approval fixtures, including `decidedAt`,
`expiresAt`, `recordedAt`, and `evaluatedAt`, follow the portable
timestamp profile in [Agentic Contract Conventions](conventions.md#portable-timestamps).

Workflow definition/version identity, immutable instance binding, version
mismatch, import, and expected-state/revision conflict semantics are specified
in `/spec` and covered by published vectors. The canonical
`finkore.workflow.transition` operation now
includes the version binding and conflict preconditions listed below.
`workflow.create` and `workflow.import` remain conformance-local structural
boundary checks rather than canonical Agentic operations.

The conformance-local `entity.import` result always includes `historicalRevisions`
under ENTITY-IMPORT-012, using an empty list for omitted or empty supplied history.
It preserves nonempty history and existing error/failure observations.

`entity.import` remains conformance-local after the Agentic review. It
observes import identity mapping, business revision history, and conflict-version
preconditions through fixture-shaped inputs, but Core 0.9 release candidate does not define a
public migration/import operation contract, identity registry, persistence
schema, or source-system authority model.

The registry intentionally does not include idempotency metadata for Core 0.9 release candidate.
Transport retry policy, idempotency keys, and autonomous-execution policy belong
to the consuming application unless a concrete FinKore rule says otherwise.
Accounting finality remains unspecified while ledger posting and financial
commitment are outside Core.

The completed [0.9.5 corrective plan](../docs/plans/plan-09.5.md) resolves the
reviewed boundary defects in the existing operation surface. Canonical operation
IDs and promotion boundaries are unchanged. Registry inclusion does not itself
establish conformance; exercised requirements and coverage limits are recorded
in [traceability](../conformance/traceability.md).

## Registry

| Operation | Domain | State mutation | Financial-state mutation | Determinism | Audit production | Approval relation | Requirements |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `finkore.money.add` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finkore.money.subtract` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finkore.money.negate` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ARITHMETIC-003`, `-009` |
| `finkore.money.multiply` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ARITHMETIC-004`, `-007`, `-009` |
| `finkore.money.divide` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ARITHMETIC-005`–`-009`, `MONEY-ROUNDING-006` |
| `finkore.money.compare` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-COMPARISON-001`–`-004`, `-006` |
| `finkore.money.round` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ROUNDING-001`–`-004`, `-008`, `-009` |
| `finkore.money.applyrate` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-RATE-001`–`-009` |
| `finkore.money.allocate` | Money | `no` | `no` | `yes` | `none` | `none` | `MONEY-ALLOCATION-001`–`-014`, `MONEY-ERROR-008` |
| `finkore.workflow.transition` | Workflow | `yes` | `unspecified` | `yes` | `may` | may be blocked by an approval-dependent guard | `WORKFLOW-STATES-009`, `WORKFLOW-TRANSITION-001`–`-007`, `WORKFLOW-GUARD-001`–`-007`, `WORKFLOW-VERSION-003`, `-005`–`-012`, `WORKFLOW-CONFLICT-001`–`-008` |
| `finkore.audit.append` | Audit | `yes` | `no` | `yes` | `required` | `none` | `AUDIT-EVENT-001`–`-005`, `-007`–`-009`, `AUDIT-ACTOR-001`–`-004`, `-007`–`-010`, `AUDIT-CHANGE-001`–`-005`, `-008`, `-009`, `AUDIT-APPEND-001`, `-003`, `AUDIT-ERROR-001`, `-004` |
| `finkore.audit.replace` | Audit | `no` | `no` | `yes` | `none` | `none` | `AUDIT-APPEND-001` |
| `finkore.audit.remove` | Audit | `no` | `no` | `yes` | `none` | `none` | `AUDIT-APPEND-001` |
| `finkore.entity.create` | Entities | `yes` | `unspecified` | `yes` | `may` | `none` | `ENTITY-IDENTITY-001`, `-003`, `ENTITY-LIFECYCLE-001`, `-002`, `-006`, `ENTITY-VALIDATION-001` |
| `finkore.entity.mutate` | Entities | `yes` | `unspecified` | `yes` | `may` | may invalidate approval-relevant facts | `ENTITY-MUTABILITY-001`, `-002`, `-004`, `-006`, `-007`, `-008`, `ENTITY-VALIDATION-002`–`-006`, `ENTITY-ERROR-001` |
| `finkore.entity.transition` | Entities | `yes` | `unspecified` | `yes` | `may` | may be governed by composing-domain approval policy | `ENTITY-LIFECYCLE-003`, `ENTITY-IDENTITY-002`, `ENTITY-ERROR-001`, `-004` |
| `finkore.entity.evolution.correct` | Entities | `yes` | `unspecified` | `yes` | `required` | may invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-001`–`-010`, `-015`, `-022`–`-027`, `-029`–`-035`, `ENTITY-VALIDATION-001`, `-004`, `-006` |
| `finkore.entity.evolution.reverse` | Entities | `yes` | `unspecified` | `yes` | `required` | may invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-001`, `-011`–`-015`, `-022`–`-027`, `-029`–`-035`, `ENTITY-VALIDATION-001`, `-004`, `-006` |
| `finkore.entity.evolution.void` | Entities | `yes` | `unspecified` | `yes` | `required` | may invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-016`–`-018`, `-022`–`-027`, `-029`–`-035`, `ENTITY-VALIDATION-001`, `-004`, `-006` |
| `finkore.entity.evolution.supersede` | Entities | `yes` | `unspecified` | `yes` | `required` | may invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-019`–`-027`, `-029`–`-035`, `ENTITY-VALIDATION-001`, `-004`, `-006` |

`Unspecified` is deliberate. A generic Workflow may not be attached to a
Financial Entity, an Entity may carry non-financial or composing-domain facts,
and a guard may declare dependence on external facts. Core 0.9 release candidate includes
correction, reversal, void, and supersession observations, but no operation is
labeled irreversible because Core still does not define accounting finality,
ledger posting, or transport idempotency.

## `finkore.money.add`

**Purpose:** Add two Money values with compatible currencies.

**Input:** `left` and `right`, each using the normative
[Money serialization](../spec/money/serialization.md).

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns Money whose exact amount is `left + right` and whose
currency is the operands' currency. Neither operand changes.

**Known operation-specific error:** `FINKORE_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-001, -002, -007, -009](../spec/money/arithmetic.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finkore.money.subtract`

**Purpose:** Subtract one compatible-currency Money value from another.

**Input:** `left` and `right`, each using normative Money serialization.

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns the exact difference in the operands' currency. Neither
operand changes.

**Known operation-specific error:** `FINKORE_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-001, -002, -007, -009](../spec/money/arithmetic.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finkore.money.negate`

**Purpose:** Reverse the sign of a Money value exactly.

**Input:** `value` using normative Money serialization.

**Preconditions:** The input is valid Money.

**Success:** Returns Money with the exact additive inverse amount and the same
currency. The input Money does not change.

**Known operation-specific error:** None. Money validation errors may apply; this
list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-003 and -009](../spec/money/arithmetic.md).

## `finkore.money.multiply`

**Purpose:** Multiply Money by an exact decimal scalar.

**Input:** `value` using normative Money serialization and `scalar` as an exact
decimal scalar accepted by the Money arithmetic specification.

**Preconditions:** Money and scalar inputs are valid.

**Success:** Returns Money whose exact amount is `value * scalar`, preserving the
input currency and without implicit minor-unit rounding. The input Money does
not change.

**Known operation-specific error:** None. Money validation errors may apply; this
list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-004, -007, and -009](../spec/money/arithmetic.md).

## `finkore.money.divide`

**Purpose:** Divide Money by a non-zero exact decimal scalar.

**Input:** `value` using normative Money serialization and `scalar` as an exact
decimal scalar accepted by the Money arithmetic specification.

**Preconditions:** Money and scalar inputs are valid. The scalar is not zero. If
the quotient does not terminate exactly, an explicit rounding policy is required
by the Money specification.

**Success:** Returns Money whose exact amount is `value / scalar`, preserving the
input currency when the quotient is exact. The input Money does not change.

**Known operation-specific errors:** `FINKORE_MONEY_DIVISION_BY_ZERO` and
`FINKORE_MONEY_ROUNDING_REQUIRED`. Money validation errors may also apply; this
list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-005 through -009](../spec/money/arithmetic.md),
[MONEY-ROUNDING-006](../spec/money/rounding.md), and
[MONEY-ERROR-004, -005, -007](../spec/money/errors.md).

## `finkore.money.compare`

**Purpose:** Compare Money numerically and return `LESS`, `EQUAL`, or `GREATER`.

**Input:** `left` and `right`, each using normative Money serialization.

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns exact numeric ordering. Insignificant trailing zeros do not
affect equality, and neither operand changes.

**Known operation-specific error:** `FINKORE_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-COMPARISON-001 through -004 and -006](../spec/money/comparison.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finkore.money.round`

**Purpose:** Round Money to an explicit target scale with an explicit mode.

**Input:** `money` in normative Money serialization, a non-negative `scale`,
and a supported `mode` defined by [Money Rounding](../spec/money/rounding.md).

**Preconditions:** Money is valid; scale and mode are supplied and supported.

**Success:** Returns Money at the target scale according to the selected mode,
preserving currency and numeric value when no digits are discarded. The input
Money does not change.

**Known operation-specific error:** `FINKORE_MONEY_INVALID_ROUNDING`. Other
Money validation errors may apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ROUNDING-001 through -004, -008, and -009](../spec/money/rounding.md)
and [MONEY-ERROR-006, -007](../spec/money/errors.md).

## `finkore.money.applyrate`

**Purpose:** Apply an explicitly represented decimal or percentage Rate to a
Money value.

**Input:** `value` using normative Money serialization, `rate` with
`kind: DECIMAL | PERCENTAGE` and exact decimal string `value`, and optional
explicit rounding.

**Preconditions:** Money, Rate, and optional rounding inputs are valid. Rate
application never supplies tax, interest, FX, or jurisdiction policy.

**Success:** Returns Money whose amount is the exact product, or the explicitly
rounded product when rounding is supplied, preserving input currency. The input
Money does not change.

**Known operation-specific errors:** `FINKORE_MONEY_INVALID_AMOUNT` for invalid
Rate representation and `FINKORE_MONEY_INVALID_ROUNDING` for invalid explicit
rounding. Money validation errors may also apply.

**Normative traceability:** [MONEY-RATE-001 through -009](../spec/money/rates.md),
[MONEY-ARITHMETIC-004 and -009](../spec/money/arithmetic.md), and
[MONEY-ROUNDING-001 through -004](../spec/money/rounding.md).

## `finkore.money.allocate`

**Purpose:** Allocate a Money value by equal parts or declared positive integer
ratios.

**Input:** `value` using normative Money serialization and an allocation request
with `method`, explicit target `scale`, and either positive integer `parts` or a
non-empty ordered positive integer `ratios` list. These integer members are JSON
numbers: scale is in `0..50`, parts is in `1..100`, and every
ratio is in `1..9007199254740991`, all inclusive. Integral JSON numbers such as
`2.0` have the integer value `2`; strings and fractional values are invalid.

**Preconditions:** The source Money is valid, the allocation request shape and
integer ranges are valid, and the source amount is exactly representable as
whole units at the target scale.

**Success:** Returns an ordered list of Money values preserving source currency.
The list sums exactly to the source amount, and any indivisible remainder is
distributed by declared order. The input Money does not change.

**Known operation-specific errors:** `FINKORE_MONEY_INVALID_ALLOCATION` and
`FINKORE_MONEY_ROUNDING_REQUIRED`. Money validation errors may also apply.

**Normative traceability:** [MONEY-ALLOCATION-001 through -014](../spec/money/allocation.md)
and [MONEY-ERROR-005, -007, and -008](../spec/money/errors.md).

## `finkore.audit.append`

**Purpose:** Commit one valid Audit Event to a logical Audit history.

**Input semantics:** Existing logical history and a candidate Audit Event with
caller-supplied stable event identity, stable domain event type, entity
reference, optional known Actor, and explicit occurrence timestamp following
the portable timestamp profile. Supplied actor `type` and `displayName` values
are non-empty strings; optional actor metadata may be any JSON value, including
null, and its presence is preserved. Event metadata follows the same JSON-value
profile under `AUDIT-EVENT-009`, preserving omission versus supplied null and
rejecting unsupported native values/cycles with `FINKORE_AUDIT_INVALID_EVENT`.
Ordinary Audit Change values use
type-sensitive recursive JSON comparison. A Change carrying Money semantics
explicitly declares `valueType: "MONEY"`; Money is never inferred from object
shape. Current conformance fixtures use
`history` and `event`; this fixture shape is not a production storage format.

JSON metadata preservation and recursive Change comparison include every own
member, including `__proto__` and `constructor`, at every nesting depth. Native
object prototype conventions do not reserve or remove JSON member names.

**Preconditions:** Event content is valid; known Actor attribution is valid when
supplied; the event identity has not already been committed in the supplied
logical history.

**Success postcondition:** The event is appended to the logical history while
all existing committed event identities and meanings are preserved.

**Failure postcondition:** The supplied logical history remains unchanged.

Accepted native values cannot retain aliases that alter committed meaning.
Cyclic or unsupported values use the context-specific
`FINKORE_AUDIT_ACTOR_INVALID` or `FINKORE_AUDIT_INVALID_EVENT` error under
`AUDIT-ACTOR-010`, `AUDIT-CHANGE-008` and `AUDIT-EVENT-009`; host recursion failures are not domain
results. Native value representations do not extend the portable JSON contract.

**Known operation-specific errors:** `FINKORE_AUDIT_INVALID_EVENT`,
`FINKORE_AUDIT_ACTOR_INVALID`, and `FINKORE_AUDIT_DUPLICATE_EVENT`. This
Stage 1 operation does not perform redaction.

**Error precedence:** Validate supplied history first, then the candidate's
non-actor representation, supplied actor, duplicate event identity, and finally
relationships against committed history. The first failing stage determines
the primary portable error, and failure leaves history unchanged.

**Normative traceability:**
[AUDIT-EVENT-001 through -005 and -007 through -009](../spec/audit/events.md),
[AUDIT-ACTOR-001 through -004 and -007 through -010](../spec/audit/actors.md),
[AUDIT-CHANGE-001 through -005, -008, and -009](../spec/audit/changes.md),
[AUDIT-APPEND-001 and -003](../spec/audit/append-only.md), and
[AUDIT-ERROR-001 and -004](../spec/audit/errors.md).

## `finkore.audit.replace`

**Purpose:** Reject replacement of committed Audit Event content.

**Input semantics:** Existing logical history and a replacement request. The
replacement payload is intentionally not interpreted by the Agentic layer.

**Preconditions:** None that permit replacement; committed logical Audit history
is append-only.

**Success postcondition:** None. Core 0.9 release candidate defines no successful replacement of
committed Audit Events outside future redaction policy semantics.

**Failure postcondition:** The supplied logical history remains unchanged.

**Known operation-specific error:** `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`.

**Normative traceability:** [AUDIT-APPEND-001](../spec/audit/append-only.md).

## `finkore.audit.remove`

**Purpose:** Reject removal of committed Audit Event content.

**Input semantics:** Existing logical history and a removal request. The target
identifier is not interpreted as permission to erase committed logical history.

**Preconditions:** None that permit removal; committed logical Audit history is
append-only.

**Success postcondition:** None. Core 0.9 release candidate defines no successful removal of
committed Audit Events outside future redaction policy semantics.

**Failure postcondition:** The supplied logical history remains unchanged.

**Known operation-specific error:** `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`.

**Normative traceability:** [AUDIT-APPEND-001](../spec/audit/append-only.md).

## `finkore.workflow.transition`

**Purpose:** Request a declared, directed transition from current State to target.

**Input semantics:** A valid Workflow definition, an instance with one declared
current State, requested target State, facts required by applicable guards, and
when versioned, the instance's bound Workflow Definition Version. Conformance
fixtures may also supply optional expected-current-state and expected-revision
preconditions. Current conformance fixtures express fact-equality guards as
`guard` for one condition or `guards` for multiple conditions; this fixture shape
is not a production interchange format. Within that fixture, a missing fact is
different from explicit null, Boolean and numeric values are different, object
member order is irrelevant, array order is significant, and nested JSON values
are compared recursively without coercion. Unsupported comparison values make
the fixture definition invalid rather than extending the production guard
contract.

Retained versioned definition semantics include nested guards, transitions, and
state declarations. Mutating caller-owned inputs or returned observations must
not change the retained version's behavior (`WORKFLOW-VERSION-003` and `-009`).
This local ownership guarantee does not require a definition registry.
The accepted Core 0.9.7 correction in `WORKFLOW-GUARD-007` requires documented
native comparison-value support and rejection of mutable/unsupported numeric
objects and subclasses with `FINKORE_WORKFLOW_INVALID_DEFINITION` before
retention. Supported exact values retain their meaning. Implementation and
regression verification remains tracked in the [0.9.7 plan](../docs/plans/plan-09.7.md).
The bounded definition also requires explicit terminal-State and Transition
collections under `WORKFLOW-STATES-008`; omission uses INVALID_DEFINITION.
Every State identifier is nonempty under `WORKFLOW-STATES-009`; empty definition
positions, instance current State, and target or expected State inputs retain
their specified definition/instance/State error categories and precedence.
The same ownership guarantee applies to the instance binding itself at native
construction, import, transition, and observation (`WORKFLOW-VERSION-008`).
Explicit null preconditions are supplied input: null expected State is invalid
State, and null expected revision is a conflict. Omission alone skips the
respective check; all combined failures follow `WORKFLOW-ERROR-007`.
That priority includes invalid definition before invalid instance, and invalid
instance before version mismatch. A malformed observed revision cannot be hidden
by a simultaneous binding mismatch. Public native definition construction is
subject to the same definition validity as portable parsing.
The [conformance conventions](../conformance/conventions.md) define the guard
shape and `versionSequence: "DEFAULT"` fixture selector; they do not prescribe
production serialization or expand the guard language.

**Preconditions:** States and directed Transition are declared; current State is
the source and is not terminal; every applicable guard passes. For versioned
instances, the supplied definition identity/version must match the instance's
immutable binding. Optional expected-current-state and expected-revision
preconditions, when supplied, must match the observed instance. A guard may use
supplied authorization or approval facts without defining an authorization model.

**Success postcondition:** Current State becomes the target exactly once.
Validation and change are observable as one domain operation.

**Failure postcondition:** Current State, binding, and instance revision remain
unchanged.

**Known operation-specific errors:** `FINKORE_WORKFLOW_INVALID_STATE`,
`FINKORE_WORKFLOW_INVALID_TRANSITION`, `FINKORE_WORKFLOW_GUARD_REJECTED`,
`FINKORE_WORKFLOW_TERMINAL_STATE`, `FINKORE_WORKFLOW_VERSION_MISMATCH`, and
`FINKORE_WORKFLOW_STATE_CONFLICT`. Definition validation can also fail with
`FINKORE_WORKFLOW_INVALID_DEFINITION`; malformed instance/version binding can
fail with `FINKORE_WORKFLOW_INVALID_INSTANCE`. This list is not exhaustive.
Terminal State error precedence follows `WORKFLOW-ERROR-001` after structural,
binding, and expected-precondition checks have passed.

**Normative traceability:**
[WORKFLOW-TRANSITION-001 through -007](../spec/workflow/transitions.md),
[WORKFLOW-GUARD-001 through -007](../spec/workflow/guards.md),
[WORKFLOW-TERMINAL-001 through -004](../spec/workflow/terminal-states.md),
[WORKFLOW-STATES-004, -007, and -009](../spec/workflow/states.md), and
[WORKFLOW-ERROR-001 through -007](../spec/workflow/errors.md),
[WORKFLOW-VERSION-003 and -005 through -012](../spec/workflow/versioning.md), and
[WORKFLOW-CONFLICT-001 through -008](../spec/workflow/conflicts.md).

## Shared Entity declaration obligations

Existing Entity instances retain their owned lifecycle, mutability, and validator
declarations under [ENTITY-DEFINITION-002](../spec/entities/README.md), including
unversioned Workflows. Unsupported/malformed validators fail with
`FINKORE_ENTITY_INVALID_MUTATION` under
[ENTITY-VALIDATION-009](../spec/entities/validation.md); a supported rule rejecting
data retains `FINKORE_ENTITY_VALIDATION_FAILED`. These corrections apply to
Entity create, mutate, transition, and evolution without adding an operation ID.

`ENTITY-MUTABILITY-008` distinguishes malformed mutability declarations
(`FINKORE_ENTITY_INVALID_MUTATION`) from a valid rule protecting a requested
field (`FINKORE_ENTITY_IMMUTABLE`). Own valid State/field names, including
`__proto__`, retain their declarations through definition observation and reuse
under `ENTITY-DEFINITION-002`. These Core 0.9.7 corrections retain the existing
operation IDs and result shapes. The accepted corrections pass complete
verification; current verification results are recorded in the
[Core 0.9.7 plan](../docs/plans/plan-09.7.md).

D6–D7 additionally specify the bounded Entity representation: explicit nonempty
identity scope (`ENTITY-IDENTITY-007`), object-valued data with VALIDATION_FAILED
for missing/malformed data (`ENTITY-VALIDATION-010`), Workflow instance/State
errors for current-State shape (`ENTITY-LIFECYCLE-007`), and INVALID_MUTATION for
empty change objects (`ENTITY-MUTABILITY-009`). Existing Workflow priority and
non-mutation guarantees apply. These are staged compatibility corrections;
M2 regression publication does not claim implementation conformance.

Entity application data additionally follows [ENTITY-VALIDATION-011](../spec/entities/validation.md):
owned containers and documented supported immutable scalars, exact values and all
JSON member names preserved across creation, import, mutation, transition and
evolution. Unsupported initial/imported/current data uses
`FINKORE_ENTITY_VALIDATION_FAILED`; unsupported proposed mutation values use
`FINKORE_ENTITY_INVALID_MUTATION` after existing mutability checks. Cycles,
non-finite values and unsupported native objects reject without partial Entity,
evolution or Audit effects. Existing validation priorities and operation IDs remain.

## `finkore.entity.create`

**Purpose:** Create a Financial Entity observation under a supplied
composing-domain definition.

**Input semantics:** Entity definition, caller-supplied Entity identity, and
initial data. Current conformance fixtures include a small validation predicate
for portability tests; this fixture shape is not a production schema language.

**Preconditions:** Entity type, identity scope, identity, referenced Workflow,
initial lifecycle state, mutability declaration, and declared validation must be
valid.

**Success postcondition:** Returns an Entity with the supplied stable identity,
definition type, Workflow initial state, and accepted data.
For a versioned Workflow, it also retains the initial Workflow binding under
`WORKFLOW-VERSION-007`. Subsequent operations preserve that binding.

**Failure postcondition:** No Entity observation is created by the failed
operation.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_IDENTITY`,
`FINKORE_ENTITY_INVALID_MUTATION`, and
`FINKORE_ENTITY_VALIDATION_FAILED`. Workflow definition errors may also apply.

**Normative traceability:** [ENTITY-IDENTITY-001 and -003](../spec/entities/identity.md),
[ENTITY-LIFECYCLE-001, -002, and -006](../spec/entities/lifecycle.md), and
[ENTITY-VALIDATION-001](../spec/entities/validation.md).

## `finkore.entity.mutate`

**Purpose:** Apply declared top-level Entity data changes under the Entity's
current state mutability and validation rules.

**Input semantics:** Entity definition, existing Entity observation, and a set
of top-level data field changes.

**Preconditions:** The Entity observation is valid for its definition, every
target field is mutable in the current lifecycle state, and the complete
proposed data satisfies declared validation.
Versioned existing observations include their retained Workflow binding;
missing/malformed binding and version mismatch retain the applicable Workflow
error under `ENTITY-ERROR-004`.

**Success postcondition:** Returns a new Entity observation preserving identity,
type, and lifecycle state with the accepted data changes.

**Failure postcondition:** The original Entity observation remains unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_IMMUTABLE`,
`FINKORE_ENTITY_INVALID_MUTATION`, and
`FINKORE_ENTITY_VALIDATION_FAILED`.

**Normative traceability:** [ENTITY-MUTABILITY-001, -002, -004, -006, and -007](../spec/entities/mutability.md),
[ENTITY-VALIDATION-002 through -006](../spec/entities/validation.md), and
[ENTITY-ERROR-001](../spec/entities/errors.md).

## `finkore.entity.transition`

**Purpose:** Apply a declared Entity lifecycle transition through the referenced
Workflow.

**Input semantics:** Entity definition, existing Entity observation, and target
State.
For versioned lifecycles, the observation includes its original Workflow
binding. It is never inferred from a later supplied definition.

**Preconditions:** The Entity and referenced Workflow are valid, and the target
transition is permitted by the Workflow from the current Entity state.

**Success postcondition:** Returns a new Entity observation preserving identity,
type, and data at the target State.
The Workflow binding is also preserved under `WORKFLOW-VERSION-008`.

**Failure postcondition:** The original Entity observation remains unchanged.

**Known operation-specific errors:** Workflow transition errors such as
`FINKORE_WORKFLOW_INVALID_TRANSITION` are preserved as primary portable errors.
Missing/malformed required binding uses `FINKORE_WORKFLOW_INVALID_INSTANCE`;
a different definition identity/version uses `FINKORE_WORKFLOW_VERSION_MISMATCH`.
Entity identity or mutation errors may apply when the supplied Entity or
definition is malformed.

**Normative traceability:** [ENTITY-LIFECYCLE-003](../spec/entities/lifecycle.md),
[ENTITY-IDENTITY-002](../spec/entities/identity.md), and
[ENTITY-ERROR-001, -004](../spec/entities/errors.md).

## Shared Entity evolution obligations

All four evolution operations validate complete source and related/successor
Entity observations under [ENTITY-VALIDATION-001, -004, and -006](../spec/entities/validation.md).
Business Validation failures return `FINKORE_ENTITY_VALIDATION_FAILED` unless
another domain failure is primary under `ENTITY-ERROR-004`.

Expected currentness is compared with the observed source Entity and Revision
in the applicable scope, independently of eligibility and declared duplicate
policy (`ENTITY-EVOLUTION-025`). Required Audit evidence must satisfy both
Audit validation and evolution correspondence (`ENTITY-EVOLUTION-027`, `-029`,
`-031`, and `-032`). Failure preserves Entity observations, evolution history,
currentness, and Audit history together (`ENTITY-EVOLUTION-023` and `-033`).
Intrinsic Audit validation precedes evolution correspondence under
`ENTITY-EVOLUTION-034`. If both fail, preserve Audit's primary error; if only
correspondence fails, return `FINKORE_ENTITY_INVALID_MUTATION`. This specifies
validation priority, not permission to commit Audit history early. Malformed
supplied Audit history, including explicit null, retains
`FINKORE_AUDIT_INVALID_EVENT`; consumer binding failure observations cannot replace that
code or manufacture a successfully imported history.

For optional expected source State and Revision, explicit null remains supplied
input and fails with `FINKORE_ENTITY_STATE_CONFLICT` against a valid observation
under `ENTITY-EVOLUTION-025`. Omission skips that check. Consumer bindings must
preserve presence; a null-handling runtime exception is not a portable
domain failure. Malformed observed identities retain their own domain error,
and this does not add priority between unrelated Entity failures.

Under `ENTITY-EVOLUTION-035`, unresolved contradictory currentness history
returns `FINKORE_ENTITY_INVALID_MUTATION`, independently of an expected-currentness
precondition. A mismatch against consistent observed currentness remains
`FINKORE_ENTITY_STATE_CONFLICT`. Valid historical changes explained by declared
evolution effects are accepted; neither a permanent non-current-wins rule nor
an arbitrary last-record-wins rule is introduced. The
[Entity evolution specification](../spec/entities/evolution.md#consistent-currentness-observations)
defines the exact Entity/Revision/scope and historical-step distinctions.

Conformance evolution history arrays are translated according to the
[fixture conventions](../conformance/conventions.md). Consumer production
history containers may differ; bindings do not define currentness or duplicate
policy.

## `finkore.entity.evolution.correct`

**Purpose:** Record a Correction relation between a source Entity Revision and
a related corrected Revision with required Audit evidence.

**Input semantics:** Existing evolution history, source and related Entity
observations, Revision and Relation identities, composing-domain eligibility and
optional expected-state/revision/currentness preconditions, plus Audit history
and one Audit Event containing matching relationship evidence.

**Preconditions:** Source and related references are valid and distinct where
required, the request is eligible, expected preconditions match, the Relation
identity is new, and Audit evidence matches the requested Correction.

**Success postcondition:** Returns a new evolution history containing the
Correction relation and a new Audit history containing the evidence event. The
source Entity facts remain preserved.

**Failure postcondition:** Source Entity, related Entity, evolution history, and
Audit history observations remain unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_MUTATION`,
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`,
`FINKORE_ENTITY_VALIDATION_FAILED`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-001 through -010, -015, -022 through -024, and -029 through -032](../spec/entities/evolution.md).

## `finkore.entity.evolution.reverse`

**Purpose:** Record a Reversal relation between a source Entity Revision and a
related reversing Revision with required Audit evidence.

**Input semantics:** Same evidence and precondition shape as
`finkore.entity.evolution.correct`, with Reversal-specific relation semantics.

**Preconditions:** The request is valid and eligible, Audit evidence matches the
requested Reversal, the Relation identity is new, and the request satisfies the
composing domain's declared duplicate policy. Core does not impose a universal
one-reversal policy on every composing domain.

**Success postcondition:** Returns a new evolution history containing the
Reversal relation and a new Audit history containing the evidence event. The
source Entity facts are not negated or rewritten in place.

**Failure postcondition:** Source Entity, related Entity, evolution history, and
Audit history observations remain unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_MUTATION`,
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`,
`FINKORE_ENTITY_VALIDATION_FAILED`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-001, -011 through -015, -022 through -024, -029, and -032](../spec/entities/evolution.md).

## `finkore.entity.evolution.void`

**Purpose:** Record Void nullification for a source Entity Revision without
deleting source facts or history.

**Input semantics:** Existing evolution history, source Entity observation,
Revision and Relation identities, composing-domain eligibility and optional
expected preconditions, plus Audit evidence matching the Void relation.

**Preconditions:** The request is valid and eligible, expected preconditions
match, the Relation identity is new, and Audit evidence matches the requested
Void.

**Success postcondition:** Returns a new evolution history marking the source
Revision non-current for the Void relation and a new Audit history containing
the evidence event.

**Failure postcondition:** Source Entity, evolution history, and Audit history
observations remain unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_MUTATION`,
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`,
`FINKORE_ENTITY_VALIDATION_FAILED`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-016 through -018, -022 through -024, -029, and -032](../spec/entities/evolution.md).

## `finkore.entity.evolution.supersede`

**Purpose:** Record Supersession between a source Entity Revision and successor
Revision within a declared composing-domain scope.

**Input semantics:** Existing evolution history, source and successor Entity
observations, Revision and Relation identities, supersession scope,
composing-domain eligibility and optional expected preconditions, plus Audit
evidence matching the Supersession relation.

**Preconditions:** The request is valid and eligible, expected preconditions
match, the Relation identity is new, the source is current in the declared
scope when required, and Audit evidence matches the requested Supersession.

**Success postcondition:** Returns a new evolution history marking the source
Revision non-current and successor Revision current within the declared
supersession scope, plus a new Audit history containing the evidence event.

**Failure postcondition:** Source Entity, successor Entity, evolution history,
and Audit history observations remain unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_MUTATION`,
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`,
`FINKORE_ENTITY_VALIDATION_FAILED`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-019 through -024, -029, -031, and -032](../spec/entities/evolution.md).
