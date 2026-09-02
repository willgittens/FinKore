# FinFlow Agentic Contract

## Status

**Draft 0.1**

> Agent-ready by contract, not by convention.

FinFlow's Agentic Contract describes portable operational semantics for agents,
autonomous systems, tool runtimes, and other machine clients. It lets a client
discover a capability, understand its contract, and govern its use without
depending on a programming language, framework, or transport.

> FinFlow does not make financial operations safer by trusting agents. It makes
> agent behavior safer by exposing the same explicit domain constraints that
> govern every other client.

## Architectural position

```text
                FinFlow
                   │
        ┌──────────┴──────────┐
        │                     │
      Spec               Conformance
        │                     │
        └──────────┬──────────┘
                   │
              Agentic Contract
                   │
            Operation Metadata
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   TypeScript     Java       Future
       │
       ▼
  MCP / Tools / Agents
```

- [`/spec`](../spec/README.md) defines normative domain behavior and remains the
  source of truth.
- [`/conformance`](../conformance/README.md) verifies portable observable domain
  behavior.
- `/agentic` describes machine-discoverable operational semantics.
- `/agentic` MUST NOT redefine financial domain behavior already defined by
  `/spec`; descriptors reference specification requirement IDs instead.

The contract is documentation-first. It defines no MCP server, tool definition,
HTTP or JSON-RPC API, agent SDK integration, runtime adapter, authorization
middleware, or reference implementation.

## Agentic readiness

FinFlow separates four dimensions:

1. **Discoverable** — a machine client can determine which operations exist and
   each operation's stable ID, domain, and purpose.
2. **Understandable** — it can determine required inputs, observable outputs,
   portable errors, preconditions, and relevant invariants.
3. **Governable** — it can determine state-change, financial-state, audit,
   approval, and known finality implications.
4. **Executable** — it can invoke an operation through an implementation-specific
   tool or transport.

The Core Agentic Contract defines Discoverable, Understandable, and Governable
semantics. Executable adapters are outside Draft 0.1.

For FinFlow Draft 0.1, an operation is **Agentic Ready** when it is Discoverable,
Understandable, Governable, and Conformance-traceable. Direct execution through
an agent framework is not required.

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

## Open questions

- How should incompatible operation-contract changes be versioned?
- Should FinFlow define a machine-readable capability manifest?
- Should all effects use booleans, or richer states such as `none`, `may`, and
  `required`?
- Should operations declare idempotency semantics?
- Should FinFlow define policy hints for autonomous execution?
- How should future financial commitment and finality semantics be represented?

