# FinKore Agentic Contract

## Status

**Documentation contract for FinKore Core 2.0 stable.**

The stable registry contains 20 canonical operations with published identifiers
preserved and the Core 2.0 contract documented. Compatibility is
governed by the [specification policy](../spec/conventions.md#compatibility-policy).
The 15 other manifest operation labels remain conformance-local; publication
of their vectors does not promote them to Agentic capabilities.

> Agent-ready by contract, not by convention.

FinKore's Agentic Contract describes portable operational semantics for agents,
autonomous systems, tool runtimes, and other machine clients. It lets a client
discover a capability, understand its contract, and govern its use without
depending on a programming language, framework, or transport.

> FinKore does not make financial operations safer by trusting agents. It makes
> agent behavior safer by exposing the same explicit domain constraints that
> govern every other client.

## Architectural position

```text
Specification ──► Conformance artifacts
      │
      └─────────► Agentic Contract
                         │
                         ▼
             Consumer-owned implementations,
                tools, transports, and agents
```

- [`/spec`](../spec/README.md) defines normative domain behavior and remains the
  source of truth.
- [`/conformance`](../conformance/README.md) publishes portable acceptance cases
  for observable domain behavior.
- `/agentic` describes machine-discoverable operational semantics.
- `/agentic` MUST NOT redefine financial domain behavior already defined by
  `/spec`; descriptors reference specification requirement IDs instead.

The contract is documentation-first. It defines no MCP server, tool definition,
HTTP or JSON-RPC API, agent SDK integration, runtime adapter, authorization
middleware, or reference implementation.

## Agentic readiness

FinKore separates four dimensions:

1. **Discoverable** — a machine client can determine which operations exist and
   each operation's stable ID, domain, and purpose.
2. **Understandable** — it can determine required inputs, observable outputs,
   portable errors, preconditions, and relevant invariants.
3. **Governable** — it can determine state-change, financial-state, audit,
   approval, and known finality implications.
4. **Executable** — it can invoke an operation through an implementation-specific
   tool or transport.

The Core Agentic Contract defines Discoverable, Understandable, and Governable
semantics. Executable integrations and transports remain outside the current
scope.

For current FinKore Core work, an operation is **Agentic Ready** when it is
Discoverable, Understandable, Governable, and Conformance-traceable. Direct
execution through an agent framework is not required. The canonical
`finkore.workflow.transition` descriptor includes version binding and
expected-state/revision conflict preconditions. Approval composition and
lifecycle fixtures, Workflow import, and Entity import remain conformance-local
until stable public operation contracts exist.

For Core 2.0, effect values use the dimensions defined in
[Effects](effects.md). Idempotency is explicitly unspecified and is not a
metadata dimension. Autonomous-execution policy belongs to the consuming
application unless a concrete FinKore rule says otherwise. Accounting finality
also remains unspecified while ledger posting and financial commitment are
outside Core.

## Documents

- [Conventions](conventions.md)
- [Capabilities](capabilities.md)
- [Operation registry](operations.md)
- [Effects](effects.md)
- [Safety](safety.md)
- [Discovery](discovery.md)
- [Portable errors](errors.md)
- [Examples](examples.md)

## Readiness checklist

An operation may be considered Agentic Contract-ready when:

- [ ] Stable operation ID exists
- [ ] Domain is identified
- [ ] Purpose is documented
- [ ] Relevant requirement IDs are linked
- [ ] Input semantics are documented
- [ ] Output semantics are documented
- [ ] Portable domain errors are documented
- [ ] State-change effects are documented
- [ ] Preconditions are documented where applicable
- [ ] Postconditions are documented where applicable
- [ ] No agent-specific bypass exists
- [ ] Relevant conformance vectors use the same operation ID

## Deferred questions

- Transport idempotency and idempotency-key semantics.
- Autonomous-execution policy hints beyond the existing operation metadata.
- Financial commitment, ledger posting, and accounting finality.
