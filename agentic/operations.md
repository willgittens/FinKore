# FinKore Operation Registry

## Scope

This Draft 0.2 registry includes only operation boundaries clearly supported by
both the current specification and conformance vectors. Other conformance
operation labels remain runner-adapter vocabulary until their stable agent-facing
contract, effects, and inputs are reviewed.

Approval conformance labels, including `approval.chain.evaluate`,
`approval.decision.withdraw`, `approval.decision.supersede`, and
`approval.requirement.supersede`, remain conformance-local in Draft 0.2.
Chain evaluation currently observes composition
from explicit Requirement state inputs; it is not promoted to a canonical
Agentic operation because the public approval binding model still depends on
Approval Requirement identity, Decision history, and relevant subject facts
rather than a standalone agent-facing chain command.

## Registry

| Operation | Domain | State-changing | Financial state | Deterministic | Audit | Approval relation | Requirements |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `finkore.money.add` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finkore.money.subtract` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finkore.money.negate` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-003`, `-009` |
| `finkore.money.multiply` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-004`, `-007`, `-009` |
| `finkore.money.divide` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-005`–`-009`, `MONEY-ROUNDING-006` |
| `finkore.money.compare` | Money | No | No | Yes | None | None | `MONEY-COMPARISON-001`–`-004`, `-006` |
| `finkore.money.round` | Money | No | No | Yes | None | None | `MONEY-ROUNDING-001`–`-004`, `-008`, `-009` |
| `finkore.money.applyrate` | Money | No | No | Yes | None | None | `MONEY-RATE-001`–`-009` |
| `finkore.money.allocate` | Money | No | No | Yes | None | None | `MONEY-ALLOCATION-001`–`-013`, `MONEY-ERROR-008` |
| `finkore.workflow.transition` | Workflow | Yes | Unspecified | Unspecified | May | May be blocked by an approval-dependent guard | `WORKFLOW-TRANSITION-001`–`-007` |
| `finkore.audit.append` | Audit | Yes | No | Yes | Records | None | `AUDIT-EVENT-001`–`-005`, `-007`, `-008`, `AUDIT-ACTOR-001`–`-004`, `-007`, `-008`, `AUDIT-APPEND-001`, `-003`, `AUDIT-ERROR-001` |
| `finkore.audit.replace` | Audit | No | No | Yes | None | None | `AUDIT-APPEND-001` |
| `finkore.audit.remove` | Audit | No | No | Yes | None | None | `AUDIT-APPEND-001` |
| `finkore.entity.create` | Entities | Yes | Unspecified | Yes | May | None | `ENTITY-IDENTITY-001`, `-003`, `ENTITY-LIFECYCLE-001`, `-002`, `-006`, `ENTITY-VALIDATION-001` |
| `finkore.entity.mutate` | Entities | Yes | Unspecified | Yes | May | May invalidate approval-relevant facts | `ENTITY-MUTABILITY-001`, `-002`, `-004`, `-006`, `-007`, `ENTITY-VALIDATION-002`–`-006`, `ENTITY-ERROR-001` |
| `finkore.entity.transition` | Entities | Yes | Unspecified | Yes | May | May be governed by composing-domain approval policy | `ENTITY-LIFECYCLE-003`, `ENTITY-IDENTITY-002`, `ENTITY-ERROR-001`, `-004` |
| `finkore.entity.evolution.correct` | Entities | Yes | Unspecified | Yes | Required | May invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-001`–`-010`, `-015`, `-022`–`-024`, `-029`–`-032` |
| `finkore.entity.evolution.reverse` | Entities | Yes | Unspecified | Yes | Required | May invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-001`, `-011`–`-015`, `-022`–`-024`, `-029`, `-032` |
| `finkore.entity.evolution.void` | Entities | Yes | Unspecified | Yes | Required | May invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-016`–`-018`, `-022`–`-024`, `-029`, `-032` |
| `finkore.entity.evolution.supersede` | Entities | Yes | Unspecified | Yes | Required | May invalidate approval-relevant facts or revisions | `ENTITY-EVOLUTION-019`–`-024`, `-029`, `-031`, `-032` |

`Unspecified` is deliberate. A generic Workflow may not be attached to a
Financial Entity, an Entity may carry non-financial or composing-domain facts,
and a guard may declare dependence on external facts. Draft 0.2 defines
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
non-empty ordered positive integer `ratios` list.

**Preconditions:** The source Money is valid, the allocation request shape is
valid, and the source amount is exactly representable as whole units at the
target scale.

**Success:** Returns an ordered list of Money values preserving source currency.
The list sums exactly to the source amount, and any indivisible remainder is
distributed by declared order. The input Money does not change.

**Known operation-specific errors:** `FINKORE_MONEY_INVALID_ALLOCATION` and
`FINKORE_MONEY_ROUNDING_REQUIRED`. Money validation errors may also apply.

**Normative traceability:** [MONEY-ALLOCATION-001 through -013](../spec/money/allocation.md)
and [MONEY-ERROR-005, -007, -008](../spec/money/errors.md).

## `finkore.audit.append`

**Purpose:** Commit one valid Audit Event to a logical Audit history.

**Input semantics:** Existing logical history and a candidate Audit Event with
caller-supplied stable event identity, stable domain event type, entity reference, optional
known Actor, and explicit occurrence timestamp. Current conformance fixtures use
`history` and `event`; this fixture shape is not a production storage format.

**Preconditions:** Event content is valid; known Actor attribution is valid when
supplied; the event identity has not already been committed in the supplied
logical history.

**Success postcondition:** The event is appended to the logical history while
all existing committed event identities and meanings are preserved.

**Failure postcondition:** The supplied logical history remains unchanged.

**Known operation-specific errors:** `FINKORE_AUDIT_INVALID_EVENT`,
`FINKORE_AUDIT_ACTOR_INVALID`, and `FINKORE_AUDIT_DUPLICATE_EVENT`. This
Stage 1 operation does not perform redaction.

**Normative traceability:**
[AUDIT-EVENT-001 through -005, -007, and -008](../spec/audit/events.md),
[AUDIT-ACTOR-001 through -004 and -007 through -008](../spec/audit/actors.md),
[AUDIT-APPEND-001 and -003](../spec/audit/append-only.md), and
[AUDIT-ERROR-001](../spec/audit/errors.md).

## `finkore.audit.replace`

**Purpose:** Reject replacement of committed Audit Event content.

**Input semantics:** Existing logical history and a replacement request. The
replacement payload is intentionally not interpreted by the Agentic layer.

**Preconditions:** None that permit replacement; committed logical Audit history
is append-only.

**Success postcondition:** None. Draft 0.1 defines no successful replacement of
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

**Success postcondition:** None. Draft 0.1 defines no successful removal of
committed Audit Events outside future redaction policy semantics.

**Failure postcondition:** The supplied logical history remains unchanged.

**Known operation-specific error:** `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`.

**Normative traceability:** [AUDIT-APPEND-001](../spec/audit/append-only.md).

## `finkore.workflow.transition`

**Purpose:** Request a declared, directed transition from current State to target.

**Input semantics:** A valid Workflow definition, an instance with one declared
current State, requested target State, and facts required by applicable guards.
Current conformance fixtures express fact-equality guards as `guard` for one
condition or `guards` for multiple conditions; this fixture shape is not a
production interchange format.

**Preconditions:** States and directed Transition are declared; current State is
the source and is not terminal; every applicable guard passes. A guard may use
supplied authorization or approval facts without defining an authorization model.

**Success postcondition:** Current State becomes the target exactly once.
Validation and change are observable as one domain operation.

**Failure postcondition:** Current State remains unchanged.

**Known operation-specific errors:** `FINKORE_WORKFLOW_INVALID_STATE`,
`FINKORE_WORKFLOW_INVALID_TRANSITION`, `FINKORE_WORKFLOW_GUARD_REJECTED`, and
`FINKORE_WORKFLOW_TERMINAL_STATE`. Definition validation can also fail with
`FINKORE_WORKFLOW_INVALID_DEFINITION`; this list is not exhaustive. Terminal
State error precedence follows `WORKFLOW-ERROR-001`.

**Normative traceability:**
[WORKFLOW-TRANSITION-001 through -007](../spec/workflow/transitions.md),
[WORKFLOW-GUARD-001 through -006](../spec/workflow/guards.md),
[WORKFLOW-TERMINAL-001 through -004](../spec/workflow/terminal-states.md),
[WORKFLOW-STATES-004 and -007](../spec/workflow/states.md), and
[WORKFLOW-ERROR-001 through -003](../spec/workflow/errors.md).

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

**Preconditions:** The Entity and referenced Workflow are valid, and the target
transition is permitted by the Workflow from the current Entity state.

**Success postcondition:** Returns a new Entity observation preserving identity,
type, and data at the target State.

**Failure postcondition:** The original Entity observation remains unchanged.

**Known operation-specific errors:** Workflow transition errors such as
`FINKORE_WORKFLOW_INVALID_TRANSITION` are preserved as primary portable errors.
Entity identity or mutation errors may apply when the supplied Entity or
definition is malformed.

**Normative traceability:** [ENTITY-LIFECYCLE-003](../spec/entities/lifecycle.md),
[ENTITY-IDENTITY-002](../spec/entities/identity.md), and
[ENTITY-ERROR-001, -004](../spec/entities/errors.md).

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
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-001 through -010, -015, -022 through -024, and -029 through -032](../spec/entities/evolution.md).

## `finkore.entity.evolution.reverse`

**Purpose:** Record a Reversal relation between a source Entity Revision and a
related reversing Revision with required Audit evidence.

**Input semantics:** Same evidence and precondition shape as
`finkore.entity.evolution.correct`, with Reversal-specific relation semantics.

**Preconditions:** The request is valid and eligible, Audit evidence matches the
requested Reversal, and the same source Revision has not already been reversed
under the current duplicate-reversal policy.

**Success postcondition:** Returns a new evolution history containing the
Reversal relation and a new Audit history containing the evidence event. The
source Entity facts are not negated or rewritten in place.

**Failure postcondition:** Source Entity, related Entity, evolution history, and
Audit history observations remain unchanged.

**Known operation-specific errors:** `FINKORE_ENTITY_INVALID_MUTATION`,
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`, and Audit
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
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`, and Audit
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
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_STATE_CONFLICT`, and Audit
portable errors from invalid evidence.

**Normative traceability:** [ENTITY-EVOLUTION-019 through -024, -029, -031, and -032](../spec/entities/evolution.md).
