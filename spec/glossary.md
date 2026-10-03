# Glossary

## Status

**FinKore Core 1.1 stable.**

## Terms

**Absent** — A portable member or domain value is absent when it is omitted entirely from the supplied observation or serialized value. Absence is distinct from an explicit `null` value.

**Actor** — A person, system, or other identified subject responsible for a domain action.

**Approval** — An effective affirmative Approval Decision that satisfies an Approval Requirement. Approval is a business decision and is distinct from Authorization.

**Approval Chain** — A declared combination of Approval Requirements, with sequencing only when the chain explicitly declares it.

**Approval Decision** — A recorded `APPROVED` or `REJECTED` outcome for an identifiable Approval Requirement.

**Approval Requirement** — A declared need for an eligible Actor or application-defined subject to make an Approval Decision.

**Authorization** — A determination of whether an Actor may perform an operation; it does not establish Approval.

**Allocation** — A deterministic split of one Money value into ordered Money values that preserve the exact source total and currency.

**Audit Event** — A logical record that a domain-relevant occurrence happened. Once committed, it is part of append-only logical audit history. It may describe a Business Event but is not necessarily the Business Event itself.

**Audit Relationship** — Event content identifying a relationship from one source Audit Event to one target Audit Event.

**Business Event** — A domain occurrence. It may result in an Audit Event without requiring event-sourced state.

**Change** — A description within an Audit Event of a difference between prior and resulting domain values. A Change may describe part of a Mutation but is not itself the Mutation.

**Currency** — A named unit in which a monetary amount is denominated.

**Current** — The presently effective, selected, or observed domain value under the governing domain rules. Currentness is not inferred from wall-clock time, storage order, or identifier format unless a specification explicitly defines that basis.

**Correction** — An Entity Evolution operation that preserves an original source Financial Entity while identifying corrected financial facts through a related Entity or Revision.

**Entity Revision** — A stable, opaque identity for a declared observation or version of a continuing Financial Entity; it is distinct from stable Entity identity.

**Entity Conflict Version** — An optional opaque precondition token for detecting stale Entity observations; it is distinct from Entity Revision and stable Entity identity.

**Entity Identity Mapping** — Explicit evidence relating an external Source Identity to a stable FinKore Entity identity during import or migration.

**Entity Import** — Validation and observation of a supplied existing Financial Entity, optional revision history, optional conflict version, and explicit source identity mapping.

**Evolution Relation** — A stable relationship between a source Financial Entity and a related Entity, Revision, or evolution outcome.

**Financial Entity** — A domain concept distinguished by stable identity and continuity over time whose lifecycle or values represent financially relevant activity.

**Immutable State** — A lifecycle state in which specified data or behavior can no longer be changed directly.

**Invalid** — A supplied value, observation, request, or definition is invalid when it violates an applicable FinKore requirement. Invalid input is distinct from behavior that is outside the current specified capability surface.

**Money** — An exact decimal amount paired with a currency.

**Money Allocation** — An Allocation whose source and results are Money values.

**Null** — The explicit JSON `null` value or equivalent explicit null marker at a portable boundary. Null is distinct from an omitted or absent member and is permitted only when the governing specification allows it.

**Percentage Rate** - A Rate whose exact decimal value is divided by 100 before being applied as a scalar.

**Rate** - An exact decimal scalar, or explicitly identified percentage value, applied to Money.

**Reversal** — An Entity Evolution operation that preserves an original source Financial Entity while identifying a related cancelling or opposite-effect Entity or Revision.

**Revision** — An opaque identity for a declared domain observation where the governing specification defines revision semantics. Revision is distinct from stable resource identity, definition version, storage counters, database row versions, and timestamps unless a composing specification explicitly defines one immutable value as carrying both meanings.

**Supersession** — An Entity Evolution operation that records a successor Entity or Revision as replacing a predecessor for current use within a declared scope while preserving predecessor history.

**Mutation** — A domain-recognized change to an entity's current data or state.

**State** — A named lifecycle condition that determines currently permitted behavior.

**Source Identity** — An opaque external or legacy identifier supplied during import; it does not replace stable FinKore Entity identity.

**Transition** — A validated change from one workflow State to another.

**Transition Guard** — A domain predicate that determines whether a declared Transition Request may succeed.

**Transition Request** — A request to perform a declared, directed Transition from an instance's current State.

**Unsupported** — Outside the current specified capability surface, or outside a closed set of values supported by a specific operation. When a domain error document maps an unsupported value for a specified operation to an invalid-input portable code, that document defines the applicable refinement.

**Version** — An opaque identity or compatibility label for a declared definition, artifact, format, or package where the governing specification defines version semantics. Version is distinct from business revision and conflict-version tokens unless a composing specification explicitly defines one immutable value as carrying multiple meanings.

**Void** — An Entity Evolution operation that records source nullification without deleting the source Financial Entity or erasing its original facts.

**Workflow** — The declared states, transitions, and constraints governing a lifecycle.

**Workflow Definition Identity** — A stable, opaque identity for a logical Workflow definition family.

**Workflow Definition Version Identity** — A stable, opaque identity for one immutable declared version of a Workflow definition.

**Workflow Import** — Validation of a supplied existing Workflow instance observation against a supplied Workflow definition.

**Workflow Instance Binding** — The association between a versioned Workflow instance and the Workflow Definition Identity and Workflow Definition Version Identity that govern it.

**Workflow Instance Revision** — An optional, stable, opaque revision of a Workflow instance observation used for conflict preconditions; it is distinct from Entity Revision and storage counters.

**Workflow State Conflict** — A failed Transition Request caused by an expected current State or expected Workflow Instance Revision not matching the observed Workflow instance.

## Conventions

Terms are technology-neutral. The rules for refining shared terms are defined by **SPEC-TERMINOLOGY-001** in [Conventions](conventions.md).
