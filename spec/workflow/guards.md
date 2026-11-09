# Workflow Guards

## Status

**FinKore Core 2.0.3 stable.**

## Purpose

This document defines Transition Guards: domain predicates that control whether a declared Transition may occur.

## Requirements

- **WORKFLOW-GUARD-001** — A Transition Guard MUST evaluate against the facts provided for the Transition Request.
- **WORKFLOW-GUARD-002** — Every applicable Transition Guard MUST pass before the Transition succeeds.
- **WORKFLOW-GUARD-003** — Transition Guard evaluation MUST NOT change Workflow State or other domain data.
- **WORKFLOW-GUARD-004** — A Transition Guard result MUST be deterministic for the same declared facts, or the guard definition MUST identify its dependence on external facts.
- **WORKFLOW-GUARD-005** — Authorization MAY be an input to a guard, but a guard MUST NOT assume a particular authorization model.
- **WORKFLOW-GUARD-006** — Guard evaluation order MUST NOT change the logical result when all guards evaluate the same supplied facts.
- **WORKFLOW-GUARD-007** — An implementation retaining native comparison values in a declared guard MUST document its supported value set, capture independently owned containers, and retain only supported immutable scalar values. Unsupported or mutable numeric objects, including unsupported subclasses of supported numeric classes, MUST fail definition construction/import with `FINKORE_WORKFLOW_INVALID_DEFINITION` before they can alter retained semantics. Supported exact numeric values MUST be preserved without conversion through binary floating point or arbitrary numeric string coercion. Failure MUST leave existing instances and their bindings unchanged, and MUST follow WORKFLOW-ERROR-007's definition-first priority.

WORKFLOW-GUARD-007 preserves WORKFLOW-VERSION-003/009's ownership guarantee
and WORKFLOW-GUARD-004's determinism. The conformance guard is a top-level
own-member comparison; Approval's nested selectors do not change it.
[Conformance conventions](../../conformance/conventions.md#declarative-fixtures)
define that fixture. Implementations document their native supported-value
profiles; no universal serializer or production guard language is required.

## Invariants

Failure of any required Transition Guard must leave current State unchanged. Guard order must not change the logical result when all guards are evaluated against the same facts.

## External dependency declarations (Non-Normative)

WORKFLOW-GUARD-004 places an existing obligation on the guard definition:
evaluation is deterministic for the same declared facts, or the definition
identifies its dependence on external facts. CoreDoc
[CORE-005.3](../../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context)
also identifies relevant context and external dependencies as part of an
evaluation's stated basis. Declaring a dependency does not make hidden changes
to that basis reproducible or permit guard evaluation to mutate domain data.

For example, an application can supply a Boolean indicating that its processing
window is open, or that an external eligibility check passed. The guard can
compare that supplied value without consulting a clock or provider. How the
application obtained the value is a separate dependency: a definition that
instead relies on a live clock or eligibility source identifies that reliance.
An equal Boolean alone does not establish the same source observation or
evaluation context.

Declarations remain consumer-authored under the current contract. Review can
ask which guard and definition binding depend on which external facts, how
those facts affect the result, and which supplied values and context explain
the evaluation. Source references, observation times, or retained snapshots
can help where the application's policy makes them relevant. These are review
prompts, not new required members, claim fields, a retention regime, or a
standardized provenance model.

A portable schema for external-dependency declarations, its omission/null
rules, and errors for malformed declarations are not published:
**This behavior is not currently defined by FinKore Core.** The
[local fact-equality fixture](../../conformance/conventions.md#declarative-fixtures)
is not that schema. Its existing definition-validation errors do not establish
new failures for an unspecified declaration format.

[Traceability](../../conformance/traceability.md#interpreting-the-five-partial-requirements)
therefore keeps WORKFLOW-GUARD-004 PARTIAL. Consumer declaration review and
native ownership evidence address their existing boundaries; neither supplies
the missing portable authoring representation. This limitation does not waive
the dependency obligation or change current transition results, errors, or
failure atomicity. No provider, callback interface, authorization model, or
production guard language is selected here.

## Examples

```text
Transition: SUBMITTED → APPROVED
Guard: required approvals are satisfied
```

## Invalid Examples

- Changing entity data as an undocumented side effect of evaluating a guard.
- Allowing a transition after a required guard fails.

## Errors

A Transition Guard rejection must report `FINKORE_WORKFLOW_GUARD_REJECTED`. A composing domain may provide additional context or a secondary domain code without replacing this failure category.

## Open Questions

- How should time-sensitive or externally sourced facts be captured for reproducible evaluation?
