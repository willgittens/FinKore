# Glossary

## Status

**Draft**

## Terms

**Actor** — A person, system, or other identified subject responsible for a domain action.

**Approval** — An effective affirmative Approval Decision that satisfies an Approval Requirement. Approval is a business decision and is distinct from Authorization.

**Approval Chain** — A declared combination of Approval Requirements, with sequencing only when the chain explicitly declares it.

**Approval Decision** — A recorded `APPROVED` or `REJECTED` outcome for an identifiable Approval Requirement.

**Approval Requirement** — A declared need for an eligible Actor or application-defined subject to make an Approval Decision.

**Authorization** — A determination of whether an Actor may perform an operation; it does not establish Approval.

**Audit Event** — A logical record that a domain-relevant occurrence happened. Once committed, it is part of append-only logical audit history. It may describe a Business Event but is not necessarily the Business Event itself.

**Business Event** — A domain occurrence. It may result in an Audit Event without requiring event-sourced state.

**Change** — A description within an Audit Event of a difference between prior and resulting domain values. A Change may describe part of a Mutation but is not itself the Mutation.

**Currency** — A named unit in which a monetary amount is denominated.

**Financial Entity** — A domain concept distinguished by stable identity and continuity over time whose lifecycle or values represent financially relevant activity.

**Immutable State** — A lifecycle state in which specified data or behavior can no longer be changed directly.

**Money** — An exact decimal amount paired with a currency.

**Mutation** — A domain-recognized change to an entity's current data or state.

**State** — A named lifecycle condition that determines currently permitted behavior.

**Transition** — A validated change from one workflow State to another.

**Transition Guard** — A domain predicate that determines whether a declared Transition Request may succeed.

**Transition Request** — A request to perform a declared, directed Transition from an instance's current State.

**Workflow** — The declared states, transitions, and constraints governing a lifecycle.

## Conventions

Terms are technology-neutral. A domain specification MAY refine a term but MUST identify the refinement and MUST NOT silently contradict the shared definition.

