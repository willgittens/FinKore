# Implementing FinKore

FinKore defines observable financial behavior without prescribing a language,
package layout, public API, framework, or persistence model. Consumer-owned
implementations should be idiomatic in their environment while preserving the
portable contract.

This repository does not provide a reference implementation, Conformance
Runner, adapter library, or executable implementation API.

## Reading order

1. Read [CoreDoc](coreDoc/core-doc.md) for foundation-level obligations.
2. Read [Specification Conventions](../spec/conventions.md) and the
   [Glossary](../spec/glossary.md).
3. Read the relevant domain specification under `spec/money/`,
   `spec/workflow/`, `spec/audit/`, `spec/approvals/`, or `spec/entities/`.
4. Read [Conformance Conventions](../conformance/conventions.md), the
   [Operation Contracts](../conformance/operations.md), the
   [Consumer Guide](../conformance/consumer-guide.md), and
   [Traceability](../conformance/traceability.md).
5. Read [Agentic Operations](../agentic/operations.md) when implementing a
   canonical `finkore.*` operation.

## Authority and boundaries

`/spec` defines financial behavior. `/conformance` supplies portable acceptance
inputs and expected observations. `/agentic` names canonical operation
semantics. None of those artifacts prescribes an implementation architecture.

An implementation may choose its own classes, records, services, exceptions,
result types, decimal library, mutability mechanisms, storage, dependency
injection, and public method names. It must not choose different observable
financial semantics.

Conformance fixture shapes are test-boundary data, not production API schemas.
A consumer-owned binding may translate between fixture operation labels and an
idiomatic API, but that binding must not implement Money, Workflow, Audit,
Approval, or Entity rules. An execution harness may validate, dispatch, compare,
and report; it must remain domain-neutral.

## Recommended workflow

For each domain slice:

1. Identify the owning normative requirements and portable errors.
2. Locate the related cases through `conformance/manifest.json` and
   `conformance/traceability.md`.
3. Confirm the cases fail or are unsupported before implementing the behavior.
4. Implement the smallest behavior that satisfies the specification.
5. Add language-native tests for API ergonomics and invariants.
6. Execute the portable cases through consumer-owned tooling.
7. Add mutation testing or an equivalent defect-resistance check for critical
   financial behavior.
8. Document the public API, portable errors, mutation effects, and requirement
   references.

Do not infer missing semantics from a fixture, historical implementation, or
language default. Report a specification gap instead.

## Value semantics

Money requires exact base-10 semantics. Parse portable decimals from strings
where the specification requires them; do not substitute binary floating-point
arithmetic. Currency compatibility and rounding policy must remain explicit.

Identifiers are opaque unless the specification explicitly assigns internal
meaning. Do not derive tenancy, sequence, state, permission, timestamp, or
revision semantics from identifier spelling.

Preserve observable distinctions between absent, null, empty, and redacted
values. Preserve declared order where the contract makes order significant; do
not let hash iteration, filesystem order, database incidental order, or locale
define financial meaning.

## Errors

Portable error codes are the cross-language contract. Exception classes,
messages, stack traces, HTTP statuses, and wrapper types are consumer choices.
Expose the specified portable code for a domain failure and preserve any
required post-state observation.

Optional diagnostics must not change the portable meaning and should not reveal
sensitive information by default.

## Effects and atomicity

Where the specification requires non-mutation or failure atomicity, rejected
operations must leave all specified observations unchanged. Validation before
commit, immutable construction, defensive copies, or transactions are possible
implementation techniques; FinKore does not select among them.

Pure value operations should produce equivalent immutable observations.
State-changing domains must expose the specified success and failure
postconditions.

Compare complete state for meaningful rejected mutations, including identifiers,
State, data, version bindings, revisions, and every related history named by the
operation. At native malformed-input boundaries where a valid committed JSON
observation would be invented, verify that the original object graph is
unchanged and, where practical, reusable after the failure.

Approval histories need an immutable association with their owning approval
context and subject even when individual Core 1.0 records do not encode that
scope. Preserve the association through storage, import, evaluation, record,
withdrawal, and supersession; matching Requirement IDs or subject facts do not
authorize relabeling a history for another context or subject.

## Deterministic context

Conformance-observable behavior must not depend on wall-clock time, host
timezone, locale, network calls, external FX providers, filesystem order,
database incidental order, uncontrolled randomness, or process identity.

Pass time, facts, policy, and expected state explicitly when the specification
makes them relevant. Serialize timestamps as unambiguous instants where
required.

## Reliability

Portable acceptance cases are a baseline, not exhaustive proof. Add
language-native tests for integration boundaries and use mutation testing or an
equivalent technique for financially critical logic. Important defect classes
include removed currency checks, arithmetic substitutions, rounding-mode
changes, guard bypass, mutable audit history, approval-effectiveness bypass,
Entity identity changes, partial state after failure, and changed portable
error codes.

Public API documentation should explain domain purpose, semantically important
parameters, results, portable errors, mutation behavior, and relevant FinKore
requirement IDs. The documentation format is language-specific; the observable
contract is not.

## Reporting a specification gap

If the specification does not define an observable result, record:

- the exact artifacts and requirement IDs reviewed;
- the operation or value boundary affected;
- at least two plausible interpretations;
- the financial, control, security, or privacy impact;
- whether the issue is a clarification, normative change, contradiction,
  portability blocker, or deferred topic.

Wait for a specification-first decision before changing portable expectations
or consumer behavior.
