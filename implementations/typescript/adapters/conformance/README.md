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
- `entity.create`
- `entity.mutate`
- `entity.transition`
- `finkore.audit.append`
- `finkore.audit.replace`
- `finkore.audit.remove`
- `audit.redact`
- `approval.requirement.evaluate`
- `approval.decision.record`
- `approval.decision.evaluate`
- `approval.condition.evaluate`
- `approval.chain.evaluate`
- `money.deserialize`
- `money.serialize`
- `workflow.create`

`money.deserialize` and `money.serialize` are conformance-local representation
boundary checks for portable Money JSON. They are not advertised as Agentic
Contract operations in Draft 0.1.

`workflow.create` is conformance-local vocabulary for validating Workflow
definition and initial-state behavior. `finkore.workflow.transition` is the
canonical Workflow operation ID currently listed in the Agentic Contract.

`entity.create`, `entity.mutate`, and `entity.transition` are conformance-local
labels for the current Entity Identity, Lifecycle, Mutability, and Validation
milestones. The current Agentic operation
registry has not promoted Entity operations to canonical `finkore.entity.*`
identifiers, so this adapter intentionally does not invent those identifiers.
`entity.mutate` support covers declared top-level field mutability and complete
validation of the proposed result through the core TypeScript Entity API. When
core Entity validation fails with safe findings, the adapter exposes those
findings as conformance observations so vectors can verify portable rule/path
semantics without comparing TypeScript class names, messages, or sensitive
values. The adapter does not evaluate validation rules itself. Generic
validation rule engines remain outside this milestone.

Audit operation support covers FinKore Audit Draft 0.1: Events, Actors, append-only history, Change representation, Redaction, and portable Audit errors. Draft 0.1 does not define `audit.order` as an executable adapter operation.

Approval operation support covers FinKore Approvals Draft 0.1: Requirement
evaluation, Decision recording, Decision effectiveness, eligible actor
validation, subject-fact binding, append-only Decision history preservation,
Condition representation, required-fact completeness, explicit Condition result
boundaries, Approval Chain all-required composition for sequential and unordered
chains, declared rejection outcomes, current sequential actionable Requirement
reporting, duplicate Requirement rejection in chains, and portable Approval
errors. The current Approval conformance operation labels remain
conformance-local vocabulary; no canonical Approval operation is currently
listed in `agentic/operations.md`.

`approval.chain.evaluate` remains a conformance-local operation. It evaluates a
chain from explicit Requirement state observations so conformance can verify
ordered and unordered composition. It does not replace Approval Decision history
as evidence for Requirement binding, actor eligibility, or relevant subject
facts.

It does not claim support for rich condition expressions, approval quorum,
N-of-M voting, parallel approval groups, delegation, withdrawal, supersession,
escalation, dynamic approver resolution, authorization/RBAC, MCP, executable
agent integrations, generic entity validation rule engines, workflow versioning,
concurrency resolution, persistence, or broader guard frameworks.
