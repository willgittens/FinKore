# Agent Reasoning Examples

These examples are conceptual and non-normative. They demonstrate decisions a
client can derive from the contract; they do not implement an agent or adapter.

## Predictable Money failure

```text
Agent discovers: finflow.money.add
Effects: non-mutating, deterministic
Possible error: FINFLOW_MONEY_CURRENCY_MISMATCH
Input: 10 EUR + 5 USD

Conclusion: unchanged execution will fail. The agent must not silently convert,
relabel, or retry the values and expect a different domain result.
```

Conceptual input uses the normative Money serialization:

```json
{
  "left": { "amount": "10", "currency": "EUR" },
  "right": { "amount": "5", "currency": "USD" }
}
```

## Safe pure computation

```text
Agent discovers: finflow.money.round
Input: 10.005 EUR, scale 2, HALF_EVEN
Effects: non-mutating, deterministic
Output: 10.00 EUR

Conclusion: the input value remains unchanged and the explicit mode determines
the result. The agent must not substitute a customary currency scale or mode.
```

## Invalid Workflow shortcut

```text
Agent discovers: finflow.workflow.transition
Current state: DRAFT
Requested target: PAID
Declared transition: absent
Effects: state-changing; financial-state effect unspecified

Conclusion: FINFLOW_WORKFLOW_INVALID_TRANSITION is expected and current state
remains DRAFT. Autonomous execution cannot bypass the Workflow definition.
```

## Conditional approval and audit implications

```text
Agent discovers: finflow.workflow.transition
Declared transition: SUBMITTED → APPROVED
Applicable guard: required approval is satisfied
Supplied fact: approval unsatisfied

Conclusion: the guard rejects the request and state remains SUBMITTED. If a
composing Financial Entity domain declares successful lifecycle transitions
auditable, a successful retry must also produce the required Audit Event. Generic
Workflow metadata alone does not claim that every transition produces audit.
```

