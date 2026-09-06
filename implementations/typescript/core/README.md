# FinKore TypeScript

TypeScript reference implementation for the current FinKore Money, Workflow,
and Audit Draft 0.1 milestones.

FinKore Money Draft 0.1 is fully implemented by this TypeScript reference implementation. This statement applies only to the current Money specification draft; it does not imply that other FinKore domains are complete.

FinKore Workflow Draft 0.1 is fully implemented by the TypeScript reference implementation. This statement applies only to the current Workflow specification draft; it does not imply that Approvals, Entities, or other FinKore domains are complete.

FinKore Audit Draft 0.1 is fully implemented by the TypeScript reference implementation. Audit covers Events, Actors, append-only logical history, Change representation semantics, and Redaction semantics. Distributed ordering, persistence, and cross-domain integrations remain outside this milestone.

This package implements Money construction, validation, portable Money errors, canonical serialization, exact compatible-currency addition, exact compatible-currency subtraction, exact negation, exact decimal scalar multiplication, exact decimal scalar division when the quotient terminates, exact compatible-currency numeric comparison, and explicit Money rounding.

It implements Workflow Draft 0.1: validated workflow
definitions, exact state identifiers, one initial state, current state,
directed transitions, single or multiple simple Draft 0.1 fact-equality guards,
explicit terminal-state detection, rejection of outgoing transitions in
terminal definitions, terminal-state transition rejection and portable error
precedence, successful state changes, and state preservation after rejection.

It intentionally does not implement FX conversion, persistence, framework integrations, agent adapters, workflow versioning, concurrency resolution, distributed audit ordering, audit persistence, approvals integration, entities, corrections, or reversals.

The specification remains canonical. This package stores validated decimal amounts as strings and performs arithmetic and comparison with scaled integer arithmetic so observable behavior preserves exact base-10 semantics without using JavaScript `number`.

## Current Money API

- `Money.from(input)` validates amount and currency and returns a Money value.
- `Money.deserialize(value)` parses portable Money JSON.
- `money.toJSON()` returns canonical portable Money serialization.
- `money.add(other)` returns an exact same-currency sum and throws `FINKORE_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.subtract(other)` returns an exact same-currency difference and throws `FINKORE_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.negate()` returns a new Money value with the amount sign reversed exactly.
- `money.multiply(scalar)` returns a new Money value multiplied by an exact decimal scalar.
- `money.divide(scalar)` returns a new Money value divided by a non-zero exact decimal scalar when the quotient terminates; zero divisors throw `FINKORE_MONEY_DIVISION_BY_ZERO`, and non-terminating quotients without a rounding policy throw `FINKORE_MONEY_ROUNDING_REQUIRED`.
- `money.compare(other)` returns `LESS`, `EQUAL`, or `GREATER` for exact same-currency numeric comparison and throws `FINKORE_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.round({ scale, mode })` returns a new Money value rounded to the explicit target scale using `HALF_UP`, `HALF_EVEN`, `DOWN`, `UP`, `FLOOR`, or `CEILING`; invalid scale or mode values throw `FINKORE_MONEY_INVALID_ROUNDING`.

## Current Workflow API

- `Workflow.create(definition)` validates a workflow definition and creates an instance in its declared initial state.
- `Workflow.from(definition, { currentState })` validates an existing current-state observation against the definition.
- `workflow.currentState` returns the instance's current state identifier exactly as declared.
- `workflow.definition.isTerminalState(state)` reports terminal status only
  when the definition explicitly lists the state; names and empty outgoing
  transition sets do not imply terminality.
- `workflow.transition(target, { facts })` applies a declared directed
  transition and updates current state on success only when the current state is
  non-terminal and every guard attached to the matched transition passes.
- `workflow.toJSON()` returns `{ currentState }` for portable observation.

Workflow failures expose portable codes: `FINKORE_WORKFLOW_INVALID_DEFINITION`,
`FINKORE_WORKFLOW_INVALID_STATE`, `FINKORE_WORKFLOW_INVALID_TRANSITION`,
`FINKORE_WORKFLOW_GUARD_REJECTED`, and
`FINKORE_WORKFLOW_TERMINAL_STATE`. A request from an explicitly terminal
current state reports `FINKORE_WORKFLOW_TERMINAL_STATE` before undeclared
transition errors and leaves current state unchanged. Entering a declared
terminal target through a valid transition remains allowed. Terminal Workflow
status does not imply broader entity or metadata immutability.

Transition definitions may use `guard` for one fact-equality condition or
`guards` for multiple fact-equality conditions. If multiple guards are attached
to the matched transition, every guard must pass against the supplied facts
before current state changes. Failed guard evaluation throws
`FINKORE_WORKFLOW_GUARD_REJECTED` and leaves state unchanged.

This Workflow milestone does not define a production interchange format,
callback guard model, authorization system, or full guard language. The current
fact-equality guard shape exists to satisfy Draft 0.1 conformance semantics
without introducing broader workflow behavior.

## Current Audit API

- `AuditActor.from(actor)` validates known actor attribution with a stable opaque identity and optional type/display metadata.
- `AuditChange.from(change)` validates a change with a required field/path identity and preserved optional `before`/`after` values.
- `AuditEvent.from(event)` validates an Audit Event with caller-supplied `eventId`, stable domain `eventType`, `entity`, optional `actor`, explicit RFC 3339 `occurredAt` timestamp, and optional validated changes.
- `AuditLog.create(history)` creates a logical audit history from existing committed events and rejects duplicate event identities.
- `auditLog.append(event)` validates and appends one event, rejecting duplicate identities and failed appends without changing prior history.
- `auditLog.redact({ policy, redactionEvent })` returns a redacted representation of exactly one affected event with protected Change path values or reserved actor-context targets and appends an evidence event without mutating the committed source event.
- `auditLog.replace()` and `auditLog.remove()` reject attempts to rewrite committed history with `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`.
- `auditLog.events()` and `auditLog.toJSON()` return defensive observations of committed history.

Audit failures expose portable codes: `FINKORE_AUDIT_INVALID_EVENT`,
`FINKORE_AUDIT_DUPLICATE_EVENT`,
`FINKORE_AUDIT_APPEND_ONLY_VIOLATION`,
`FINKORE_AUDIT_REDACTION_INVALID`, and
`FINKORE_AUDIT_ACTOR_INVALID`. Redaction is representation-level concealment with audit evidence; it is not secure deletion, cryptographic erasure, authorization, retention automation, or a persistence guarantee.

## API Documentation

Public TypeScript APIs are documented with JSDoc. Where an API implements normative FinKore behavior, its JSDoc references the relevant stable requirement IDs from `/spec`.

The JSDoc is implementation guidance for TypeScript users; `/spec` remains the normative source of FinKore behavior. Future generated API documentation may be produced from these comments.
