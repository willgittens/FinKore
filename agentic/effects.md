# Operation Effects

Effects describe observable consequences supported by the specification. They
do not prescribe implementation style.

## Draft 0.1 dimensions

| Dimension | Values | Meaning |
| --- | --- | --- |
| State mutation | `yes`, `no` | Whether successful execution changes observable domain state. |
| Financial-state mutation | `yes`, `no`, `unspecified` | Whether that state change modifies financial facts; `unspecified` is used when Core cannot decide without a composing domain. |
| Deterministic | `yes`, `no`, `unspecified` | Whether the observable result is fixed for the same input, context, and domain state. |
| Audit production | `none`, `may`, `required`, `unspecified` | Whether execution has a specified audit consequence. |
| Approval relation | explicit relation or `none` | Whether the operation makes a decision, may be blocked by approval, or may invalidate a decision. |
| Irreversibility | `unspecified` in Draft 0.1 | Core has not defined the correction, reversal, void, or supersession semantics needed to claim finality. |

The mixed value sets are intentional. Booleans are adequate for direct
state-change and determinism facts, while audit and approval semantics would be
misleading if compressed into booleans.

## Pure operations

An operation with state mutation `no` does not mutate observable domain state.
This is behavioral and does not require functional-programming techniques.
Money addition, subtraction, comparison, and rounding are non-mutating under
`MONEY-ARITHMETIC-009` and `MONEY-ERROR-007`; rounding returns a Money result and
does not alter its input value. A non-mutating classification MUST NOT be read as
permission to mutate financial state.

## State-changing operations

An operation with state mutation `yes` changes observable domain state on
success and is not merely computational. This classification does not by itself
mean dangerous or irreversible. `finflow.workflow.transition` changes current
State exactly once on success and leaves it unchanged on rejection.

Generic state mutation and financial-state mutation are distinct. A generic
Workflow transition changes state, but whether that state represents a changed
financial fact depends on the composing domain. Draft 0.1 therefore marks its
financial-state effect `unspecified`.

## Determinism

Determinism concerns the observable result for the same input, context, and
domain state. It does not require identical internals. Money operations are
deterministic. Workflow guards evaluate supplied facts and must either be
deterministic for them or declare external-fact dependence; a complete repeated
context therefore yields the same result.

## Audit and approval

State mutation does not automatically produce an Audit Event. A composing domain
must identify which Financial Entity mutations and transitions require audit
under `ENTITY-AUDIT-001`; only those identified operations must produce one under
`ENTITY-AUDIT-002`. Generic Workflow transition is therefore `may` for audit.

Workflow guards may use authorization or satisfied approvals as supplied facts,
so a transition may be blocked by approval-related policy. The transition does
not itself record an Approval Decision, and Core does not say that every
transition is approval-sensitive. Money operations have no normative approval
relation.

## Irreversibility and idempotency

Mutation does not establish irreversibility. Core Draft 0.1 defers Correction,
Reversal, Void, Cancellation, Supersession, and Adjustment behavior, so the
registry does not claim that any operation is irreversible.

Idempotency is also not a Draft 0.1 metadata dimension. Pure Money operations can
be recomputed without mutating their operands, but this does not define transport
retries or idempotency keys. State-changing idempotency remains open.

