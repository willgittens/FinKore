# Capabilities

## Capability meaning

A capability states that an implementation exposes a named FinKore Operation.
Its descriptor makes the operation Discoverable, Understandable, and Governable.
Invocation bindings are implementation-specific and outside Draft 0.4.

An adapter MAY expose only a subset of the registry. A Money-only implementation,
for example, may expose Money operations such as `finkore.money.add`,
`finkore.money.divide`, `finkore.money.round`, and
`finkore.money.allocate` without exposing `finkore.workflow.transition` or
`finkore.entity.evolution.correct`. Its capability list MUST accurately
describe what is available; clients MUST NOT assume that every FinKore
implementation supports every registered operation. Conformance-local operation
labels such as `approval.composition.evaluate`, `workflow.import`, and
`entity.import` are test-adapter vocabulary, not advertised FinKore Agentic
capabilities.

## Capability and conformance

> Advertising an operation as a FinKore capability does not by itself prove
> conformance.

The Agentic Contract describes capabilities. The
[Conformance Suite](../conformance/README.md) proves observable behavior. An
implementation advertising `finkore.money.add` should be verified against the
applicable vectors and requirements before a client relies on a conformance
claim. The same principle applies to promoted operations such as
`finkore.money.applyrate`, `finkore.money.allocate`,
`finkore.workflow.transition`, and `finkore.entity.evolution.supersede`.
Draft 0.4 retains the version/conflict refinements to
`finkore.workflow.transition` as part of that canonical operation's current
descriptor; `workflow.import` and
`entity.import` remain conformance-local.

## Suitability for autonomy

Metadata supplies facts for an application or policy engine; it does not make a
universal execution decision. A client should consider inputs, preconditions,
effects, approval implications, audit consequences, and the implementation's
conformance status. FinKore Core does not assign subjective `LOW`, `MEDIUM`,
`HIGH`, or `CRITICAL` safety classes.

Some operations may be suitable for autonomous execution. Others may require
human confirmation, an Approval, authorization, or application policy. Draft
0.4 preserves the available facts and does not impose human confirmation on
every mutation. It keeps Approval composition/lifecycle fixtures
conformance-local and adds no AI-specific bypass or universal execution
decision for clients.
