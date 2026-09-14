# FinKore Core Draft 0.2 Release Notes

**Status:** Closed

## Purpose

Draft 0.2 expanded the original primitives with bounded behavior needed for
common corporate financial operations while preserving specification-first and
domain-neutral architecture.

## Added

### Money Rates and Allocation

- Exact decimal and percentage Rate application.
- Explicit rounding when precision reduction is required.
- Equal and positive-integer-ratio allocation.
- Exact source-value conservation and deterministic ordered remainder handling.
- Portable invalid-allocation behavior.

### Entity Evolution

- Portable Correction, Reversal, Void, and Supersession relationships.
- Stable Entity identity with distinct revision and evolution-relation identity.
- Preserved original facts, currentness semantics, non-mutating failure, and
  mandatory caller-supplied Audit evidence.

### Audit Relationships

- Validated relationships supporting Entity evolution evidence without creating
  an event-store, distributed-ordering, or persistence contract.

### Approval Validity

- Decision withdrawal, expiration, and supersession.
- Requirement supersession and explicit current-effectiveness evaluation.
- Subject fact/revision validity and append-only lifecycle evidence.

### Agentic alignment

- Money Rate application and Allocation received canonical operation IDs.
- Mature Entity create, mutate, transition, and evolution operations received
  canonical IDs.
- Approval lifecycle operations remained conformance-local.

## Verification at closure

- 297 normative clauses: 231 covered and 66 not directly testable.
- 0 partial, uncovered, deferred, or blocking specification-gap rows.
- 199/199 manifest-listed vectors passed.
- 174/174 mutation-sensitive vectors passed.
- TypeScript core mutation score: 98.88%, with zero accepted critical survivors.
- Runner mutation score: 99.73%, with no critical runner survivor.

These results describe the recorded Draft 0.2 closure. Current repository
verification is reported by the latest release note and conformance traceability.

## Explicit exclusions

Draft 0.2 did not add Approval quorum/composition, Workflow versioning/migration,
Entity import, private currencies, minor-unit policy, a condition expression
language, Audit retention, persistence, authorization, ledger/accounting domains,
tax, interest, payments, or new language implementations.
