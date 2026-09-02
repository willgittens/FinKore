# Agentic Safety

> Agentic behavior MUST NOT bypass FinFlow domain behavior.

An autonomous client has no special semantic privileges. An invalid
`DRAFT → PAID` transition remains invalid when requested by an agent. An
unsatisfied Approval used by an applicable guard still blocks a transition. Data
declared immutable by a composing Financial Entity policy remains immutable.

## No hidden agent mode

> FinFlow does not define an "AI mode", "agent override", or privileged
> autonomous execution path.

The same normative semantics apply to human-driven applications, backend
services, batch jobs, integrations, agents, and autonomous systems. Tool or
transport adapters MUST preserve the operation's preconditions, postconditions,
portable errors, and failure atomicity.

## Policy boundaries

FinFlow Approval and Authorization are distinct. The Agentic Contract neither
grants authorization nor invents a universal human-in-the-loop requirement.
Applications decide when confirmation, authorization, Approval, or additional
policy evaluation is required, using the exposed operation metadata and their
own policies.

An adapter may add stricter access controls, but it MUST NOT reinterpret a
rejected domain operation as successful or replace its primary portable domain
error merely because the requester is autonomous.

## Preconditions and postconditions

A precondition is a constraint that must hold before execution can succeed. It
may concern currency compatibility, Workflow current State and declared target,
supplied guard facts, or approval subject state. Draft 0.1 describes these by
links and requirement IDs; it defines no custom expression language.

A postcondition is an observable result established by the specification. It may
describe both success and failure. For Workflow transition, success changes
current State to the target exactly once; rejection leaves current State
unchanged. Metadata MUST NOT invent postconditions absent from `/spec`.

