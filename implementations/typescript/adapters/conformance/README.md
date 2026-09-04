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
- `money.deserialize`
- `money.serialize`
- `workflow.create`

`money.deserialize` and `money.serialize` are conformance-local representation
boundary checks for portable Money JSON. They are not advertised as Agentic
Contract operations in Draft 0.1.

`workflow.create` is conformance-local vocabulary for validating Workflow
definition and initial-state behavior. `finkore.workflow.transition` is the
canonical Workflow operation ID currently listed in the Agentic Contract.

It does not claim support for audit, approvals, entities, MCP, executable agent
integrations, workflow versioning, concurrency resolution, persistence, or
broader guard frameworks.
