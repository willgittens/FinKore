# FinKore TypeScript Conformance Adapter

Adapter from FinKore conformance operation IDs to the TypeScript reference implementation.

This milestone supports:

- `finkore.money.add`
- `finkore.money.compare`
- `finkore.money.divide`
- `finkore.money.multiply`
- `finkore.money.negate`
- `finkore.money.round`
- `finkore.money.subtract`
- `finkore.workflow.transition`
- `finkore.audit.append`
- `finkore.audit.replace`
- `finkore.audit.remove`
- `audit.redact`
- `approval.requirement.evaluate`
- `approval.decision.record`
- `approval.decision.evaluate`
- `approval.condition.evaluate`
- `money.deserialize`
- `money.serialize`
- `workflow.create`

`money.deserialize` and `money.serialize` are conformance-local representation
boundary checks for portable Money JSON. They are not advertised as Agentic
Contract operations in Draft 0.1.

`workflow.create` is conformance-local vocabulary for validating Workflow
definition and initial-state behavior. `finkore.workflow.transition` is the
canonical Workflow operation ID currently listed in the Agentic Contract.

Audit operation support covers FinKore Audit Draft 0.1: Events, Actors, append-only history, Change representation, Redaction, and portable Audit errors. Draft 0.1 does not define `audit.order` as an executable adapter operation.

Approval operation support covers only the first Approval milestones:
Requirement evaluation, Decision recording, Decision effectiveness, eligible
actor validation, subject-fact binding, append-only Decision history
preservation, Condition representation, required-fact completeness, explicit
Condition result boundaries, and portable Approval errors. The current Approval
conformance operation labels remain conformance-local vocabulary; no canonical
Approval operation is currently listed in `agentic/operations.md`.

It does not claim support for rich condition expressions, approval chains,
entities, MCP, executable agent integrations, workflow versioning, concurrency
resolution, persistence, or broader guard frameworks.
