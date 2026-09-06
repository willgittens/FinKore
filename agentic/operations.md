# FinKore Operation Registry

## Scope

This Draft 0.1 registry includes only operation boundaries clearly supported by
both the current specification and conformance vectors. Other conformance
operation labels remain runner-adapter vocabulary until their stable agent-facing
contract, effects, and inputs are reviewed.

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
| `finkore.workflow.transition` | Workflow | Yes | Unspecified | Unspecified | May | May be blocked by an approval-dependent guard | `WORKFLOW-TRANSITION-001`–`-007` |
| `finkore.audit.append` | Audit | Yes | No | Yes | Records | None | `AUDIT-EVENT-001`–`-005`, `-007`, `-008`, `AUDIT-ACTOR-001`–`-004`, `-007`, `-008`, `AUDIT-APPEND-001`, `-003`, `AUDIT-ERROR-001` |
| `finkore.audit.replace` | Audit | No | No | Yes | None | None | `AUDIT-APPEND-001` |
| `finkore.audit.remove` | Audit | No | No | Yes | None | None | `AUDIT-APPEND-001` |

`Unspecified` is deliberate. A generic Workflow may not be attached to a
Financial Entity, and a guard may declare dependence on external facts. No
operation is labeled irreversible because Core Draft 0.1 does not define the
necessary finality and reversal semantics.

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
