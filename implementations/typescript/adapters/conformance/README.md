# FinFlow TypeScript Conformance Adapter

Adapter from FinFlow conformance operation IDs to the TypeScript reference implementation.

This milestone supports:

- `finflow.money.add`
- `finflow.money.compare`
- `finflow.money.divide`
- `finflow.money.multiply`
- `finflow.money.negate`
- `finflow.money.round`
- `finflow.money.subtract`
- `finflow.workflow.transition`
- `money.deserialize`
- `money.serialize`
- `workflow.create`

`money.deserialize` and `money.serialize` are conformance-local representation
boundary checks for portable Money JSON. They are not advertised as Agentic
Contract operations in Draft 0.1.

`workflow.create` is conformance-local vocabulary for validating Workflow
definition and initial-state behavior. `finflow.workflow.transition` is the
canonical Workflow operation ID currently listed in the Agentic Contract.

It does not claim support for audit, approvals, entities, MCP, executable agent
integrations, workflow versioning, concurrency resolution, persistence, or
broader guard frameworks.
