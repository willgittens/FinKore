# FinFlow TypeScript Conformance Adapter

Adapter from FinFlow conformance operation IDs to the TypeScript reference implementation.

This milestone supports only:

- `finflow.money.add`
- `finflow.money.compare`
- `finflow.money.divide`
- `finflow.money.multiply`
- `finflow.money.negate`
- `finflow.money.round`
- `finflow.money.subtract`
- `money.deserialize`
- `money.serialize`

`money.deserialize` and `money.serialize` are conformance-local representation
boundary checks for portable Money JSON. They are not advertised as Agentic
Contract operations in Draft 0.1.

It does not claim support for workflow, audit, approvals, entities, MCP, or executable agent integrations.
