# FinKore Agentic Contract

The Agentic Contract describes operations for agents and other machine clients:
what each operation needs, what it returns, how it can fail, and what state it
can change. Stable identifiers such as `finkore.money.add` name behavior
independently of language, framework, or transport.

## Status

**Documentation contract for FinKore Core 2.0.2 stable.**

The stable registry contains 20 canonical operations with published identifiers
preserved and the Core 2.0 contract documented. Compatibility is
governed by the [specification policy](../spec/conventions.md#compatibility-policy).
The 15 other manifest operation labels remain conformance-local; publication
of their vectors does not promote them to Agentic capabilities.

## Start here

Read [Conventions](conventions.md) for operation identifiers and descriptors,
then find the operation you need in the [registry](operations.md).
[Effects](effects.md) explains the state and evidence implications;
[Safety](safety.md) explains preconditions and policy boundaries. Clients use
the same financial rules regardless of whether an agent invokes them.

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

This is a documentation contract. Consumers supply executable tools, transports,
and authorization infrastructure.

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

An operation is **Agentic Ready** when it is Discoverable, Understandable,
Governable, and Conformance-traceable. The registry provides these semantics;
the checklist below helps contributors review a descriptor. Approval composition
and lifecycle fixtures, Workflow import, and Entity import remain
conformance-local until stable public operation contracts exist.

For Core 2.0, effect values use the dimensions defined in
[Effects](effects.md). Idempotency is explicitly unspecified and is not a
metadata dimension. Autonomous-execution policy belongs to the consuming
application unless a concrete FinKore rule says otherwise. Accounting finality
also remains unspecified while ledger posting and financial commitment are
outside Core.

## Documents

| Document | What you will learn |
| --- | --- |
| [Conventions](conventions.md) | Operation IDs, descriptors, and representation layers |
| [Capabilities](capabilities.md) | How a consumer advertises supported operations |
| [Operation registry](operations.md) | Each canonical operation's complete contract |
| [Effects](effects.md) | State changes and financial, audit, and approval implications |
| [Safety](safety.md) | Preconditions, postconditions, and policy boundaries |
| [Discovery](discovery.md) | Finding supported capabilities |
| [Portable errors](errors.md) | Interpreting failures consistently across clients |
| [Examples](examples.md) | Illustrative descriptors and discovery data |

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
