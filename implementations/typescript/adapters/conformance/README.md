# FinKore TypeScript Conformance Adapter

Adapter from FinKore conformance operation IDs to the TypeScript reference implementation.

Draft 0.4 stabilizes this adapter contract for the existing Draft 0.1 through
Draft 0.3 behavior. It keeps conformance-local fixtures separate from production
API requirements. Draft 0.5 later recorded independent Python full-manifest and
Java Money adapter results; those adapters remain separate evidence and do not
copy this adapter as financial authority. New adapters should follow the language-neutral
[Conformance Adapter Onboarding Guide](../../../../docs/conformance-adapter-onboarding.md)
rather than copying TypeScript adapter internals as architecture.

This milestone supports:

- `finkore.money.add`
- `finkore.money.compare`
- `finkore.money.divide`
- `finkore.money.applyrate`
- `finkore.money.allocate`
- `finkore.money.multiply`
- `finkore.money.negate`
- `finkore.money.round`
- `finkore.money.subtract`
- `finkore.workflow.transition`
- `finkore.entity.create`
- `finkore.entity.evolution.correct`
- `finkore.entity.evolution.reverse`
- `finkore.entity.evolution.supersede`
- `finkore.entity.evolution.void`
- `finkore.entity.mutate`
- `finkore.entity.transition`
- `entity.import`
- `finkore.audit.append`
- `finkore.audit.replace`
- `finkore.audit.remove`
- `audit.redact`
- `approval.requirement.evaluate`
- `approval.requirement.supersede`
- `approval.decision.record`
- `approval.decision.evaluate`
- `approval.decision.withdraw`
- `approval.decision.supersede`
- `approval.condition.evaluate`
- `approval.chain.evaluate`
- `approval.composition.evaluate`
- `money.deserialize`
- `money.serialize`
- `workflow.create`
- `workflow.import`

`money.deserialize` and `money.serialize` are conformance-local Money
operations. Serialization operations remain representation boundary checks for
portable Money JSON. Draft 0.2 Rate application and Allocation are promoted as
`finkore.money.applyrate` and `finkore.money.allocate`. This adapter still
accepts the previous `money.rate.apply` and `money.allocate` labels as
compatibility aliases, but current manifest-listed vectors use the canonical
operation IDs.

`workflow.create` and `workflow.import` are conformance-local vocabulary for
validating Workflow definition, initial-state, existing-observation import,
version binding, and opaque revision behavior. `finkore.workflow.transition` is
the canonical Workflow operation ID currently listed in the Agentic Contract.
Transition fixtures delegate version binding checks, expected-current-state and
expected-revision conflict checks, terminal-state precedence, transition
validation, guard evaluation, and state preservation to the core TypeScript
Workflow API.

`finkore.entity.create`, `finkore.entity.mutate`,
`finkore.entity.transition`, and `finkore.entity.evolution.*` are canonical
Draft 0.2 Entity operation IDs for the current Identity, Lifecycle,
Mutability, Validation, and Entity Evolution milestones. The adapter still
accepts the previous local `entity.*` labels as compatibility aliases.
`finkore.entity.mutate` support covers declared top-level field mutability and
complete validation of the proposed result through the core TypeScript Entity
API. `finkore.entity.evolution.correct`,
`finkore.entity.evolution.reverse`, `finkore.entity.evolution.void`, and
`finkore.entity.evolution.supersede` reconstruct Entities and evolution
history, call `EntityEvolutionHistory`, and normalize
source/result/evolution/Audit observations. The adapter does not implement
evolution rules, evaluate validation rules, construct Audit evidence, or infer
identifiers itself. Generic validation rule engines remain outside this
milestone.
`entity.import` is a Draft 0.3 conformance-local import boundary. It delegates
stable identity preservation, source identity mapping, Entity Revision history,
Entity Conflict Version separation, and expected precondition checks to core;
the Draft 0.3 Agentic review keeps it conformance-local because Core does not
yet define a public migration/import operation contract, identity registry,
persistence schema, or source-system authority model.

Audit operation support covers FinKore Audit Draft 0.1 plus the Draft 0.2 Audit Relationships slice: Events, Actors, append-only history, Change representation, Redaction, relationship metadata, and portable Audit errors. Draft 0.1 does not define `audit.order` as an executable adapter operation. Audit Relationships are observed through existing append/redaction fixtures; the adapter does not interpret relationships itself.

Approval operation support covers FinKore Approvals Draft 0.1, the Draft
0.2 Approval Validity slice, and the Draft 0.3 Approval Composition adapter
slice: Requirement evaluation, Decision recording, Decision effectiveness,
eligible actor validation, subject-fact binding, append-only Decision history
preservation, withdrawal lifecycle evidence, expiration with explicit
evaluation instants, Decision supersession, Requirement supersession,
Condition representation, required-fact completeness, explicit Condition result
boundaries, Approval Chain all-required composition for sequential and unordered
chains, declared rejection outcomes, current sequential actionable Requirement
reporting, duplicate Requirement rejection in chains, Approval Composition
all/any group evaluation, ordered stages, bounded nested groups, N-of-M quorum
evaluation from explicit current-effective Decision observations, and portable
Approval errors. The current Approval conformance operation labels remain
conformance-local vocabulary; no canonical Approval operation is currently
listed in `agentic/operations.md`.

`approval.chain.evaluate`, `approval.composition.evaluate`,
`approval.decision.withdraw`, `approval.decision.supersede`, and
`approval.requirement.supersede` remain conformance-local operations. They
observe chain/composition and Draft 0.2 Approval Validity lifecycle behavior.
They do not replace Approval Decision history as evidence for Requirement
binding, actor eligibility, relevant subject facts, or quorum voter evidence.
Composition fixtures are delegated to the core API; caller-declared approved
Requirement states are not treated as a substitute for required Decision
observations.

It does not claim support for rich condition expressions, delegation,
escalation, dynamic approver resolution, authorization/RBAC, MCP,
executable agent integrations, generic entity validation rule engines, workflow
migration, concurrency resolution, persistence, concrete ledger reversal
posting, or broader guard frameworks.
