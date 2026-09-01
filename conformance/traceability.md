# Draft 0.1 Traceability Snapshot

This snapshot records the initial suite baseline. The manifest and vector files remain the machine-readable source for counts and references.

## Coverage summary

| Domain | Vectors | Requirement IDs covered | Requirement IDs assigned |
| --- | ---: | ---: | ---: |
| Money | 50 | 30 | 37 |
| Workflow | 10 | 17 | 24 |
| Audit | 11 | 16 | 34 |
| Approvals | 13 | 13 | 31 |
| Entities | 7 | 17 | 29 |
| **Total** | **91** | **93** | **155** |

The denominator includes every detailed requirement bullet assigned an ID, including recommendations and permissions. Overview and invariant text that merely restates a detailed clause does not receive a second ID. A future independent normative clause must receive an ID before conformance evidence is added.

## Money

Covered:

`MONEY-ARITHMETIC-001`, `MONEY-ARITHMETIC-002`, `MONEY-ARITHMETIC-003`, `MONEY-ARITHMETIC-004`, `MONEY-ARITHMETIC-005`, `MONEY-ARITHMETIC-006`, `MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-008`, `MONEY-ARITHMETIC-009`, `MONEY-COMPARISON-001`, `MONEY-COMPARISON-002`, `MONEY-COMPARISON-003`, `MONEY-COMPARISON-004`, `MONEY-CURRENCY-002`, `MONEY-CURRENCY-003`, `MONEY-CURRENCY-004`, `MONEY-REPRESENTATION-001`, `MONEY-REPRESENTATION-002`, `MONEY-REPRESENTATION-004`, `MONEY-REPRESENTATION-005`, `MONEY-ROUNDING-001`, `MONEY-ROUNDING-002`, `MONEY-ROUNDING-003`, `MONEY-ROUNDING-004`, `MONEY-ROUNDING-006`, `MONEY-SERIALIZATION-001`, `MONEY-SERIALIZATION-002`, `MONEY-SERIALIZATION-003`, `MONEY-SERIALIZATION-004`, `MONEY-SERIALIZATION-005`.

Not yet directly covered:

`MONEY-COMPARISON-005`, `MONEY-CURRENCY-001`, `MONEY-CURRENCY-005`, `MONEY-REPRESENTATION-003`, `MONEY-REPRESENTATION-006`, `MONEY-ROUNDING-005`, `MONEY-SERIALIZATION-006`.

## Workflow

Covered:

`WORKFLOW-ERROR-001`, `WORKFLOW-ERROR-003`, `WORKFLOW-GUARD-001`, `WORKFLOW-GUARD-002`, `WORKFLOW-GUARD-003`, `WORKFLOW-STATES-001`, `WORKFLOW-STATES-002`, `WORKFLOW-STATES-003`, `WORKFLOW-TERMINAL-001`, `WORKFLOW-TERMINAL-002`, `WORKFLOW-TERMINAL-003`, `WORKFLOW-TERMINAL-004`, `WORKFLOW-TRANSITION-002`, `WORKFLOW-TRANSITION-003`, `WORKFLOW-TRANSITION-004`, `WORKFLOW-TRANSITION-005`, `WORKFLOW-TRANSITION-006`.

Not yet directly covered:

`WORKFLOW-ERROR-002`, `WORKFLOW-GUARD-004`, `WORKFLOW-GUARD-005`, `WORKFLOW-STATES-004`, `WORKFLOW-STATES-005`, `WORKFLOW-STATES-006`, `WORKFLOW-TRANSITION-001`.

## Audit

Covered:

`AUDIT-ACTOR-001`, `AUDIT-APPEND-001`, `AUDIT-APPEND-003`, `AUDIT-APPEND-006`, `AUDIT-CHANGE-001`, `AUDIT-CHANGE-002`, `AUDIT-CHANGE-003`, `AUDIT-ERROR-001`, `AUDIT-EVENT-001`, `AUDIT-EVENT-002`, `AUDIT-EVENT-004`, `AUDIT-EVENT-005`, `AUDIT-REDACTION-001`, `AUDIT-REDACTION-002`, `AUDIT-REDACTION-003`, `AUDIT-REDACTION-006`.

Not yet directly covered:

`AUDIT-ACTOR-002`, `AUDIT-ACTOR-003`, `AUDIT-ACTOR-004`, `AUDIT-ACTOR-005`, `AUDIT-ACTOR-006`, `AUDIT-APPEND-002`, `AUDIT-APPEND-004`, `AUDIT-CHANGE-004`, `AUDIT-CHANGE-005`, `AUDIT-CHANGE-006`, `AUDIT-CHANGE-007`, `AUDIT-ERROR-002`, `AUDIT-ERROR-003`, `AUDIT-EVENT-003`, `AUDIT-EVENT-006`, `AUDIT-EVENT-007`, `AUDIT-REDACTION-004`, `AUDIT-REDACTION-005`.

## Approvals

Covered:

`APPROVAL-CHAIN-004`, `APPROVAL-CHAIN-005`, `APPROVAL-CHAIN-006`, `APPROVAL-CHAIN-007`, `APPROVAL-CONDITION-001`, `APPROVAL-CONDITION-006`, `APPROVAL-DECISION-001`, `APPROVAL-DECISION-002`, `APPROVAL-DECISION-003`, `APPROVAL-DECISION-004`, `APPROVAL-DECISION-005`, `APPROVAL-REQUIREMENT-004`, `APPROVAL-REQUIREMENT-005`.

Not yet directly covered:

`APPROVAL-CHAIN-001`, `APPROVAL-CHAIN-002`, `APPROVAL-CHAIN-003`, `APPROVAL-CHAIN-008`, `APPROVAL-CONDITION-002`, `APPROVAL-CONDITION-003`, `APPROVAL-CONDITION-004`, `APPROVAL-CONDITION-005`, `APPROVAL-DECISION-006`, `APPROVAL-DECISION-007`, `APPROVAL-ERROR-001`, `APPROVAL-ERROR-002`, `APPROVAL-ERROR-003`, `APPROVAL-REQUIREMENT-001`, `APPROVAL-REQUIREMENT-002`, `APPROVAL-REQUIREMENT-003`, `APPROVAL-REQUIREMENT-006`, `APPROVAL-REQUIREMENT-007`.

## Entities

Covered:

`ENTITY-ERROR-001`, `ENTITY-ERROR-004`, `ENTITY-IDENTITY-001`, `ENTITY-IDENTITY-002`, `ENTITY-LIFECYCLE-001`, `ENTITY-LIFECYCLE-002`, `ENTITY-LIFECYCLE-003`, `ENTITY-MUTABILITY-001`, `ENTITY-MUTABILITY-002`, `ENTITY-MUTABILITY-004`, `ENTITY-MUTABILITY-006`, `ENTITY-MUTABILITY-007`, `ENTITY-VALIDATION-001`, `ENTITY-VALIDATION-002`, `ENTITY-VALIDATION-003`, `ENTITY-VALIDATION-004`, `ENTITY-VALIDATION-006`.

Not yet directly covered:

`ENTITY-ERROR-002`, `ENTITY-ERROR-003`, `ENTITY-IDENTITY-003`, `ENTITY-IDENTITY-004`, `ENTITY-IDENTITY-005`, `ENTITY-IDENTITY-006`, `ENTITY-LIFECYCLE-004`, `ENTITY-LIFECYCLE-005`, `ENTITY-MUTABILITY-003`, `ENTITY-MUTABILITY-005`, `ENTITY-VALIDATION-005`, `ENTITY-VALIDATION-007`.

## Specification gaps intentionally left without vectors

- Money: portable precision, scale, and overflow limits; whether presentation scale must round-trip; and any future currency-recommended scale remain open.
- Workflow: external or time-sensitive guard fact capture, definition versioning/migration, transition identifiers, and concurrent-transition conflict resolution are not defined.
- Audit: the portable representation of an unknown actor, a domain-path syntax, structured-value summaries, a canonical production redaction encoding, ingestion time, and explicit causal/sequence mechanisms remain open. The redaction sentinel in vector output is infrastructure-only.
- Approvals: no portable condition-expression model, subject-state interchange form, material-fact policy, multi-decision effectiveness/supersession, withdrawal, expiration, delegation, quorum, or dedicated rejection code is defined. Numeric threshold vectors were therefore not invented.
- Entities: Core defines no concrete entity fields, lifecycle policy, validation catalog, import-state rule, concurrency model, or correction/reversal/void behavior. Entity vectors supply explicit conformance-only composing policies.

## Mutation coverage design

The initial vectors distinguish arithmetic operator swaps, binary floating-point leakage, currency-check removal, rounding-mode and tie substitutions, sign-blind directed rounding, ignored target scale, reversed workflow direction, guard bypass, failure-state mutation, terminal-state escape, audit replacement/deletion, before/after reversal, redaction disclosure, invented audit ordering, approval outcome swaps, wrong requirement binding, stale subject-fact approval, pending-as-approved, and entity validation/immutability atomicity failures.

## Readiness

**READY FOR INITIAL RUNNER IMPLEMENTATION**

The format, operation mapping boundary, discovery manifest, exact comparison rules, error normalization, and initial traceability are deterministic enough to implement adapters. This is not readiness for reference implementations: uncovered requirements and the listed specification gaps still require specification and vector work.
