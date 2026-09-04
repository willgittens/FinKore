# Capabilities

## Capability meaning

A capability states that an implementation exposes a named FinKore Operation.
Its descriptor makes the operation Discoverable, Understandable, and Governable.
Invocation bindings are implementation-specific and outside Draft 0.1.

An adapter MAY expose only a subset of the registry. A Money-only implementation,
for example, may expose Money operations such as `finkore.money.add`,
`finkore.money.divide`, and `finkore.money.round` without exposing
`finkore.workflow.transition`. Its capability list MUST accurately describe what
is available; clients MUST NOT assume that every FinKore implementation supports
every registered operation.

## Capability and conformance

> Advertising an operation as a FinKore capability does not by itself prove
> conformance.

The Agentic Contract describes capabilities. The
[Conformance Suite](../conformance/README.md) proves observable behavior. An
implementation advertising `finkore.money.add` should be verified against the
applicable vectors and requirements before a client relies on a conformance
claim.

## Suitability for autonomy

Metadata supplies facts for an application or policy engine; it does not make a
universal execution decision. A client should consider inputs, preconditions,
effects, approval implications, audit consequences, and the implementation's
conformance status. FinKore Core does not assign subjective `LOW`, `MEDIUM`,
`HIGH`, or `CRITICAL` safety classes.

Some operations may be suitable for autonomous execution. Others may require
human confirmation, an Approval, authorization, or application policy. Draft
0.1 exposes available facts and does not impose human confirmation on every
mutation.
