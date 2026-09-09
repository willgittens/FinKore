# FinKore TypeScript

TypeScript reference implementation for the current FinKore Money, Workflow,
Audit, Approvals, and current Entities Draft 0.1 milestones.

FinKore Money Draft 0.1 is fully implemented by this TypeScript reference implementation. The Draft 0.2 Money Rates slice is also implemented. These statements apply only to the named Money specification slices; they do not imply that other FinKore domains are complete.

FinKore Workflow Draft 0.1 is fully implemented by the TypeScript reference implementation. This statement applies only to the current Workflow specification draft; it does not imply that Entities or other FinKore domains are complete.

FinKore Audit Draft 0.1 is fully implemented by the TypeScript reference implementation. Audit covers Events, Actors, append-only logical history, Change representation semantics, and Redaction semantics. Distributed ordering, persistence, and cross-domain integrations remain outside this milestone.

FinKore Approvals Draft 0.1 is fully implemented by the TypeScript reference implementation. Approvals covers Approval Requirement representation, Approval Decision representation, Decision-to-Requirement binding, allowed Decision outcomes, Decision validation, relevant subject-fact effectiveness checks, append-only Decision history preservation, Approval Condition representation and evaluation-boundary validation, Approval Chain all-required ordered or unordered composition, declared rejection outcomes, current sequential actionable Requirement reporting, exclusion of explicitly not-applicable Requirements, duplicate Requirement rejection in chains, and portable Approval errors.

FinKore Entities Draft 0.1 is fully implemented by the TypeScript reference
implementation for Entity Identity, Lifecycle, Mutability, and the current
Validation milestone. This covers caller-supplied stable Entity identity,
declared identity scope, creation in the referenced Workflow initial state,
exactly one current lifecycle state, valid directed lifecycle transitions,
rejected transition failure atomicity, identity preservation through transitions
and mutations, declared top-level field mutability by lifecycle state,
terminal-state mutability distinction, preservation of primary Workflow
portable error codes, complete validation of declared Entity data before
mutation results become observable, validation failure atomicity, and safe
validation findings. Generic validation rule engines, audit integration,
correction/reversal, supersession, versioning, optimistic locking, persistence,
authorization, and concrete financial entity types remain outside this
milestone.

This package implements Money construction, validation, portable Money errors, canonical serialization, exact compatible-currency addition, exact compatible-currency subtraction, exact negation, exact decimal scalar multiplication, exact decimal scalar division when the quotient terminates, exact decimal and percentage Rate application, exact compatible-currency numeric comparison, and explicit Money rounding.

It implements Workflow Draft 0.1: validated workflow
definitions, exact state identifiers, one initial state, current state,
directed transitions, single or multiple simple Draft 0.1 fact-equality guards,
explicit terminal-state detection, rejection of outgoing transitions in
terminal definitions, terminal-state transition rejection and portable error
precedence, successful state changes, and state preservation after rejection.

It intentionally does not implement allocation, tax jurisdiction policy, interest conventions, FX conversion, persistence, framework integrations, agent adapters, workflow versioning, concurrency resolution, distributed audit ordering, audit persistence, approval quorum, N-of-M voting, parallel approval groups, delegation, withdrawal, supersession, expiration, escalation, multi-stage approval graphs, dynamic approver resolution, authorization/RBAC, Workflow or Audit integration for approvals, generic entity validation engines, corrections, or reversals.

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
- `money.applyRate(rate, options)` applies an explicit `DECIMAL` or `PERCENTAGE` Rate, preserves currency, accepts zero and negative rates, returns the exact product unless `options.rounding` is supplied, and throws `FINKORE_MONEY_INVALID_AMOUNT` or `FINKORE_MONEY_INVALID_ROUNDING` for invalid rate or rounding inputs.
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

## Current Approval API

- `ApprovalCondition.from(condition)` validates a condition with caller-supplied stable `id`, declared required facts, and an evaluation ownership/model string preserved exactly as supplied.
- `approvalCondition.evaluate({ facts, result })` verifies all required facts are present and returns only the explicit composing-domain `APPLICABLE` or `NOT_APPLICABLE` result. Missing facts or missing/invalid explicit results throw `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.
- `ApprovalRequirement.from(requirement)` validates a requirement with caller-supplied stable `id`, subject reference, eligible actor identities, and explicit `APPROVED`/`REJECTED` outcome semantics.
- `approvalRequirement.isEligibleActor(actorId)` reports whether an actor identity is declared eligible for the requirement.
- `approvalRequirement.stateForOutcome(outcome)` maps an effective Decision outcome to `APPROVED` or `REJECTED`.
- `ApprovalDecision.from(decision)` validates a decision with requirement identity, subject facts, `APPROVED` or `REJECTED` outcome, actor attribution, and explicit RFC 3339 timestamp.
- `ApprovalDecision.forRequirement(requirement, decision)` validates Decision-to-Requirement association and actor eligibility.
- `approvalDecision.evaluateEffectiveness(currentSubjectFacts, relevantFactPaths)` returns `EFFECTIVE` only when the decision remains associated with unchanged relevant subject facts.
- `ApprovalDecisionHistory.create(history)` creates a logical append-only Approval Decision history.
- `approvalDecisionHistory.record(requirement, decision)` validates and appends one Decision, leaving prior history unchanged on failure.
- `approvalDecisionHistory.evaluateRequirement(requirement, options)` returns `PENDING`, `APPROVED`, or `REJECTED` from effective associated Decisions.
- `approvalDecisionHistory.decisions()` and `approvalDecisionHistory.toJSON()` return defensive observations of committed history.
- `ApprovalChain.from(chain)` validates a chain with `SEQUENTIAL` or `UNORDERED` mode, one or more Requirement identities in declared order, and a declared `REJECTED` rejection outcome.
- `approvalChain.evaluate(states)` returns `APPROVED` only when every applicable Requirement is approved, `PENDING` while at least one applicable Requirement remains pending, and `REJECTED` when an effective rejection exists. Pending sequential chains also report the single currently actionable Requirement identity.
- Explicit `NOT_APPLICABLE` Requirement states are excluded from chain completion. Missing or malformed states throw `FINKORE_APPROVAL_INVALID_CHAIN`; explicit unresolved applicability throws `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.
- Approval Chain evaluation consumes explicit Requirement state observations. It does not prove which historical Decision satisfied a Requirement or which subject facts were bound to that Decision; use `ApprovalDecisionHistory.evaluateRequirement(requirement, { currentSubjectFacts, relevantFactPaths })` for current satisfaction from historical evidence.
- Historical Decisions whose relevant subject facts no longer match current facts remain committed but do not satisfy or reject the Requirement for current evaluation. Without another effective Decision, the Requirement is `PENDING`.
- Draft 0.1 does not define Approval Chain identity. Decisions bind to Requirements and relevant subject facts, not to Chain identifiers.

Approval failures expose portable codes:
`FINKORE_APPROVAL_REQUIRED`,
`FINKORE_APPROVAL_INVALID_DECISION`,
`FINKORE_APPROVAL_INELIGIBLE_ACTOR`,
`FINKORE_APPROVAL_INVALID_CHAIN`, and
`FINKORE_APPROVAL_CONDITION_UNRESOLVED`.

FinKore Draft 0.1 does not define a portable rich condition expression model.
This implementation therefore does not evaluate comparisons such as amount
thresholds, logical `AND`/`OR` expressions, policy rules, JavaScript callbacks,
or authorization predicates as FinKore semantics. Composing domains evaluate
their own condition rule and supply the explicit boundary result.

## Current Entity API

- `FinancialEntity.create(definition, id, data)` validates the Entity type, identity scope, caller-supplied identity, referenced Workflow definition, and mutability declaration for the initial lifecycle state, then creates an Entity in the Workflow initial state.
- `FinancialEntity.from(definition, entity)` reconstructs an existing Entity observation when its type and state match the supplied definition and Workflow.
- `financialEntity.id` returns the stable Entity identity exactly as supplied.
- `financialEntity.state` returns the exactly one current lifecycle state.
- `financialEntity.transition(target)` applies a valid directed lifecycle transition through the referenced Workflow and returns a new Entity preserving identity, type, and data.
- `financialEntity.mutate(changes)` applies top-level data field changes only when every targeted field is declared mutable for the current lifecycle state and the complete proposed data satisfies declared validation rules, preserving identity and lifecycle state.
- `financialEntity.validate()` evaluates declared Entity validation rules against current data and returns a complete non-mutating `{ valid, findings }` result.
- `financialEntity.toJSON()` returns a defensive portable observation `{ type, id, state, data }`.

Entity failures currently introduced by these milestones expose
`FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_IMMUTABLE`,
`FINKORE_ENTITY_INVALID_MUTATION`, `FINKORE_ENTITY_STATE_CONFLICT`, and
`FINKORE_ENTITY_VALIDATION_FAILED`.
Lifecycle transition failures can expose Workflow portable errors such as
`FINKORE_WORKFLOW_INVALID_TRANSITION`, preserving the primary Workflow error
code required by Entity error semantics.

Entity validation in this milestone intentionally supports only declared
top-level validation entries with the deterministic `positive-money` fixture
predicate used by conformance. It is not a generic rule DSL, JSON Schema
adapter, callback system, persistence validator, authorization model, or
cross-domain Workflow/Approval/Audit integration. Validation findings include
stable rule identity and path only; they do not include sensitive field values.

### Entity Draft 0.1 Requirement Inventory

| Requirement | Draft 0.1 classification | Implementation and tests |
| --- | --- | --- |
| `ENTITY-AUDIT-001` | NOT DIRECTLY TESTABLE | Composing domains identify which Entity operations require Audit Events; the generic Entity API has no standalone audit policy declaration surface. |
| `ENTITY-AUDIT-002` | NOT DIRECTLY TESTABLE | Audit Event production is conditional on `ENTITY-AUDIT-001` and requires the out-of-scope Entity/Audit integration surface. |
| `ENTITY-DEFINITION-001` | NOT DIRECTLY TESTABLE | Composing domains define fields, lifecycle, and invariants; Entity vectors observe supplied lifecycle, mutability, and validation fixtures but do not define a standalone definition-validation operation. |
| `ENTITY-IDENTITY-001` | IN SCOPE | `FinancialEntity.create`/`from`; unit tests in `test/entities/entity.test.ts`; conformance `entity.create.initial-lifecycle-001`; mutation protection checks missing/generated identity. |
| `ENTITY-IDENTITY-002` | IN SCOPE | `FinancialEntity.transition` and `mutate`; unit tests verify identity after success and failure; conformance `entity.transition.success-identity-stable-001` and mutate vectors; mutation protection checks identity changed during transition or mutation. |
| `ENTITY-IDENTITY-003` | IN SCOPE | Entity IDs are opaque strings preserved exactly; unit tests verify no generation or inference; conformance `entity.create.opaque-identity-preserved-001`. |
| `ENTITY-IDENTITY-004` | IN SCOPE | Revision/version/display-number data does not replace stable identity; conformance `entity.mutate.display-number-not-identity-001`. |
| `ENTITY-IDENTITY-005` | NOT DIRECTLY TESTABLE | Cross-entity uniqueness requires a composing-domain registry or persistence scope not defined by this milestone. |
| `ENTITY-IDENTITY-006` | NOT DIRECTLY TESTABLE | Import/migration identity mapping has no standalone Draft 0.1 operation; `from` only reconstructs a supplied observation. |
| `ENTITY-LIFECYCLE-001` | IN SCOPE | Entity definitions require a valid referenced Workflow; unit tests and conformance `entity.create.initial-lifecycle-001`. |
| `ENTITY-LIFECYCLE-002` | IN SCOPE | `FinancialEntity.create` uses `Workflow.create` initial state; unit tests and conformance `entity.create.initial-lifecycle-001`. |
| `ENTITY-LIFECYCLE-003` | IN SCOPE | `FinancialEntity.transition` delegates to `Workflow.transition`; `mutate` never changes lifecycle state; unit tests and conformance transition/mutate vectors. |
| `ENTITY-LIFECYCLE-004` | NOT DIRECTLY TESTABLE | Entity Audit declaration is a composing-domain/cross-domain obligation without a standalone Draft 0.1 Entity operation. |
| `ENTITY-LIFECYCLE-005` | NOT DIRECTLY TESTABLE | Concrete domain consequences of states belong to composing domains. |
| `ENTITY-LIFECYCLE-006` | IN SCOPE | Serialized Entity has a single `state`; `from` validates it against Workflow; unit tests cover undeclared state rejection; conformance `entity.create.initial-lifecycle-001`. |
| `ENTITY-MUTABILITY-001` | IN SCOPE | `FinancialEntity` requires per-state mutable field declarations; unit tests and conformance `entity.mutate.mutable-field-001`. |
| `ENTITY-MUTABILITY-002` | IN SCOPE | `FinancialEntity.mutate` rejects any undeclared targeted field with `FINKORE_ENTITY_IMMUTABLE`; unit tests and conformance `entity.mutate.immutable-financial-field-001`. |
| `ENTITY-MUTABILITY-003` | NOT DIRECTLY TESTABLE | Mutation Audit declaration is a composing-domain/cross-domain obligation without a standalone Draft 0.1 Entity operation. |
| `ENTITY-MUTABILITY-004` | IN SCOPE | `mutate` validates all targets before returning a new Entity; unit tests and conformance immutable vector cover failure atomicity. |
| `ENTITY-MUTABILITY-005` | NOT DIRECTLY TESTABLE | Audit history attachment/preservation requires the out-of-scope Entity/Audit integration surface. |
| `ENTITY-MUTABILITY-006` | IN SCOPE | Terminal states use their declared mutability list, not global immutability; unit tests and conformance `entity.mutate.terminal-metadata-001`. |
| `ENTITY-MUTABILITY-007` | IN SCOPE | Declared terminal metadata mutation is allowed by mutability policy; unit tests and conformance `entity.mutate.terminal-metadata-001`. |
| `ENTITY-ERROR-001` | IN SCOPE | Transition and mutation failures leave original Entity unchanged; unit tests and conformance rejected transition/immutable mutation vectors. |
| `ENTITY-ERROR-003` | NOT DIRECTLY TESTABLE | Safe diagnostic context is optional and cannot be required by conformance without changing MAY behavior into mandatory behavior. |
| `ENTITY-ERROR-004` | IN SCOPE | Workflow transition errors retain Workflow codes; unit tests and conformance `entity.transition.rejected-preserves-entity-001`. |

### Entity Validation Requirement Inventory

| Requirement | Draft 0.1 classification | Implementation and tests |
| --- | --- | --- |
| `ENTITY-VALIDATION-001` | IN SCOPE | `FinancialEntity.create` and `from` validate declared rules for current data; unit tests cover valid and invalid creation/import; conformance `entity.create.initial-lifecycle-001`. |
| `ENTITY-VALIDATION-002` | IN SCOPE | `FinancialEntity.mutate` validates the complete proposed result before returning a new Entity; unit tests and conformance `entity.validation.complete-result-001`; mutation protection checks mutation-before-validation. |
| `ENTITY-VALIDATION-003` | IN SCOPE | `FinancialEntity.validate` and `mutate` evaluate all declared rules without early return; unit tests cover multiple findings; conformance `entity.validation.complete-result-001` covers complete proposed result validation. |
| `ENTITY-VALIDATION-004` | IN SCOPE | Failed declared validation throws `EntityValidationFailedError` with portable `FINKORE_ENTITY_VALIDATION_FAILED`; unit tests and conformance `entity.validation.complete-result-001`. |
| `ENTITY-VALIDATION-005` | IN SCOPE | Findings include the declared validation path; unit tests cover path preservation; conformance `entity.validation.complete-result-001`. |
| `ENTITY-VALIDATION-006` | IN SCOPE | `validate` is observational and failed create/from/mutate do not alter observable Entity state; unit tests and conformance `entity.validation.complete-result-001`. |
| `ENTITY-VALIDATION-007` | NOT DIRECTLY TESTABLE | Draft 0.1 recommends composing domains distinguish always-required and state/transition-specific rules, but the current generic Entity milestone has no state-dependent validation policy language. |
| `ENTITY-VALIDATION-008` | IN SCOPE | Validation findings and normalized adapter observations omit field values and localized messages; unit tests inspect safe details; conformance `entity.validation.complete-result-001`. |
| `ENTITY-ERROR-002` | IN SCOPE | Findings preserve stable declared violation identifiers as `rule`; unit tests cover identifier preservation; conformance `entity.validation.complete-result-001`. |
| `ENTITY-ERROR-004` | IN SCOPE | Workflow transition failures continue to retain Workflow portable error codes; validation does not replace primary Workflow behavior. |

FinKore Entities Draft 0.1 is fully implemented by the TypeScript reference
implementation. No blocking Entity spec gap remains. Entity operations remain
conformance-local; the Agentic Contract still does not advertise canonical
`finkore.entity.*` operation identifiers.

## API Documentation

Public TypeScript APIs are documented with JSDoc. Where an API implements normative FinKore behavior, its JSDoc references the relevant stable requirement IDs from `/spec`.

The JSDoc is implementation guidance for TypeScript users; `/spec` remains the normative source of FinKore behavior. Future generated API documentation may be produced from these comments.
