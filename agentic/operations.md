# FinFlow Operation Registry

## Scope

This Draft 0.1 registry includes only operation boundaries clearly supported by
both the current specification and conformance vectors. Other conformance
operation labels remain runner-adapter vocabulary until their stable agent-facing
contract, effects, and inputs are reviewed.

## Registry

| Operation | Domain | State-changing | Financial state | Deterministic | Audit | Approval relation | Requirements |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `finflow.money.add` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finflow.money.subtract` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-001`, `-002`, `-007`, `-009` |
| `finflow.money.negate` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-003`, `-009` |
| `finflow.money.multiply` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-004`, `-007`, `-009` |
| `finflow.money.divide` | Money | No | No | Yes | None | None | `MONEY-ARITHMETIC-005`–`-009`, `MONEY-ROUNDING-006` |
| `finflow.money.compare` | Money | No | No | Yes | None | None | `MONEY-COMPARISON-001`–`-004`, `-006` |
| `finflow.money.round` | Money | No | No | Yes | None | None | `MONEY-ROUNDING-001`–`-004`, `-008`, `-009` |
| `finflow.workflow.transition` | Workflow | Yes | Unspecified | Unspecified | May | May be blocked by an approval-dependent guard | `WORKFLOW-TRANSITION-001`–`-007` |

`Unspecified` is deliberate. A generic Workflow may not be attached to a
Financial Entity, and a guard may declare dependence on external facts. No
operation is labeled irreversible because Core Draft 0.1 does not define the
necessary finality and reversal semantics.

## `finflow.money.add`

**Purpose:** Add two Money values with compatible currencies.

**Input:** `left` and `right`, each using the normative
[Money serialization](../spec/money/serialization.md).

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns Money whose exact amount is `left + right` and whose
currency is the operands' currency. Neither operand changes.

**Known operation-specific error:** `FINFLOW_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-001, -002, -007, -009](../spec/money/arithmetic.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finflow.money.subtract`

**Purpose:** Subtract one compatible-currency Money value from another.

**Input:** `left` and `right`, each using normative Money serialization.

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns the exact difference in the operands' currency. Neither
operand changes.

**Known operation-specific error:** `FINFLOW_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-001, -002, -007, -009](../spec/money/arithmetic.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finflow.money.negate`

**Purpose:** Reverse the sign of a Money value exactly.

**Input:** `value` using normative Money serialization.

**Preconditions:** The input is valid Money.

**Success:** Returns Money with the exact additive inverse amount and the same
currency. The input Money does not change.

**Known operation-specific error:** None. Money validation errors may apply; this
list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-003 and -009](../spec/money/arithmetic.md).

## `finflow.money.multiply`

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

## `finflow.money.divide`

**Purpose:** Divide Money by a non-zero exact decimal scalar.

**Input:** `value` using normative Money serialization and `scalar` as an exact
decimal scalar accepted by the Money arithmetic specification.

**Preconditions:** Money and scalar inputs are valid. The scalar is not zero. If
the quotient does not terminate exactly, an explicit rounding policy is required
by the Money specification.

**Success:** Returns Money whose exact amount is `value / scalar`, preserving the
input currency when the quotient is exact. The input Money does not change.

**Known operation-specific errors:** `FINFLOW_MONEY_DIVISION_BY_ZERO` and
`FINFLOW_MONEY_ROUNDING_REQUIRED`. Money validation errors may also apply; this
list is not exhaustive.

**Normative traceability:** [MONEY-ARITHMETIC-005 through -009](../spec/money/arithmetic.md),
[MONEY-ROUNDING-006](../spec/money/rounding.md), and
[MONEY-ERROR-004, -005, -007](../spec/money/errors.md).

## `finflow.money.compare`

**Purpose:** Compare Money numerically and return `LESS`, `EQUAL`, or `GREATER`.

**Input:** `left` and `right`, each using normative Money serialization.

**Preconditions:** Each operand is valid Money and currencies are compatible.

**Success:** Returns exact numeric ordering. Insignificant trailing zeros do not
affect equality, and neither operand changes.

**Known operation-specific error:** `FINFLOW_MONEY_CURRENCY_MISMATCH`. Input
validation errors may also apply; this list is not exhaustive.

**Normative traceability:** [MONEY-COMPARISON-001 through -004 and -006](../spec/money/comparison.md),
[MONEY-CURRENCY-003, -004](../spec/money/currency.md), and
[MONEY-ERROR-003, -007](../spec/money/errors.md).

## `finflow.money.round`

**Purpose:** Round Money to an explicit target scale with an explicit mode.

**Input:** `money` in normative Money serialization, a non-negative `scale`,
and a supported `mode` defined by [Money Rounding](../spec/money/rounding.md).

**Preconditions:** Money is valid; scale and mode are supplied and supported.

**Success:** Returns Money at the target scale according to the selected mode,
preserving currency and numeric value when no digits are discarded. The input
Money does not change.

**Known operation-specific error:** `FINFLOW_MONEY_INVALID_ROUNDING`. Other
Money validation errors may apply; this list is not exhaustive.

**Normative traceability:** [MONEY-ROUNDING-001 through -004, -008, and -009](../spec/money/rounding.md)
and [MONEY-ERROR-006, -007](../spec/money/errors.md).

## `finflow.workflow.transition`

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

**Known operation-specific errors:** `FINFLOW_WORKFLOW_INVALID_STATE`,
`FINFLOW_WORKFLOW_INVALID_TRANSITION`, `FINFLOW_WORKFLOW_GUARD_REJECTED`, and
`FINFLOW_WORKFLOW_TERMINAL_STATE`. Definition validation can also fail with
`FINFLOW_WORKFLOW_INVALID_DEFINITION`; this list is not exhaustive. Terminal
State error precedence follows `WORKFLOW-ERROR-001`.

**Normative traceability:**
[WORKFLOW-TRANSITION-001 through -007](../spec/workflow/transitions.md),
[WORKFLOW-GUARD-001 through -006](../spec/workflow/guards.md),
[WORKFLOW-TERMINAL-001 through -004](../spec/workflow/terminal-states.md),
[WORKFLOW-STATES-004 and -007](../spec/workflow/states.md), and
[WORKFLOW-ERROR-001 through -003](../spec/workflow/errors.md).
