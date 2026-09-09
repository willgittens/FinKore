# Draft 0.1 Requirement Traceability

This is the canonical human-readable requirement-to-vector index. Manifest-listed vectors remain the primary machine-readable mapping through each vector requirements field.

## Inventory and coverage

| Domain | Requirements | MUST / MUST NOT | SHOULD / SHOULD NOT | MAY | Covered | Partial | Uncovered | Not directly testable | Deferred | Blocking spec gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Shared | 29 | 23 | 5 | 1 | 1 | 0 | 0 | 28 | 0 | 0 |
| Money | 50 | 45 | 1 | 4 | 45 | 0 | 0 | 5 | 0 | 0 |
| Workflow | 27 | 25 | 1 | 1 | 22 | 0 | 0 | 5 | 0 | 0 |
| Audit | 38 | 30 | 4 | 4 | 28 | 0 | 0 | 10 | 0 | 0 |
| Approvals | 35 | 32 | 1 | 2 | 30 | 0 | 0 | 5 | 0 | 0 |
| Entities | 34 | 29 | 3 | 2 | 23 | 0 | 0 | 11 | 0 | 0 |
| **Total** | **213** | **184** | **15** | **14** | **149** | **0** | **0** | **64** | **0** | **0** |

The suite contains 138 vectors. Overall: **149 covered (70.0%)**, **0 partially covered (0.0%)**, **0 uncovered (0.0%)**, **64 not directly testable (30.0%)**, **0 deferred (0.0%)**, and **0 blocking spec gaps (0.0%)**.

NOT DIRECTLY TESTABLE covers specification-authoring rules, optional or recommended freedoms without one mandatory runtime observation, guarantees such as absence of an assumed authorization model or unobservable intermediate state that one static input/result vector cannot prove, and adapter obligations that the current normalized vector shape cannot isolate. These guarantees remain subject to implementation unit, mutation, and architectural review. DEFERRED means the requirement is explicitly outside the current draft. BLOCKING SPEC GAP means mandatory wording exists, but the expected portable observable behavior is not sufficiently specified. UNCOVERED means a deterministic mandatory vector is feasible but not yet published. No requirement is partially covered in this snapshot.

## Requirement mapping

| Requirement | Domain | Modality | Coverage | Test vectors |
| --- | --- | --- | --- | --- |
| SPEC-CONFORMANCE-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CONFORMANCE-002 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CURRENCY-001 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CURRENCY-002 | Shared | MUST / MUST NOT | COVERED | money.deserialize.lowercase-currency-001 |
| SPEC-DECIMAL-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-DECIMAL-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-ERROR-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-ERROR-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-ERROR-003 | Shared | MAY | NOT DIRECTLY TESTABLE | — |
| SPEC-ERROR-004 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-ERROR-005 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-EXAMPLE-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-EXAMPLE-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-EXAMPLE-003 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-IDENTIFIER-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-IDENTIFIER-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-IDENTIFIER-003 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-JSON-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-NULLABILITY-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-REQUIREMENT-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-REQUIREMENT-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-REQUIREMENT-003 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-REQUIREMENT-004 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-REQUIREMENT-005 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-TERMINOLOGY-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-TERMINOLOGY-002 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-TERMINOLOGY-003 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-TIMESTAMP-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-TIMESTAMP-002 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| MONEY-ARITHMETIC-001 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.add.negative-001, money.add.same-currency.basic-001, money.subtract.basic-001, money.subtract.currency-mismatch-001 |
| MONEY-ARITHMETIC-002 | Money | MUST / MUST NOT | COVERED | money.add.same-currency.basic-001, money.subtract.basic-001 |
| MONEY-ARITHMETIC-003 | Money | MUST / MUST NOT | COVERED | money.negate.negative-001, money.negate.positive-001 |
| MONEY-ARITHMETIC-004 | Money | MUST / MUST NOT | COVERED | money.multiply.decimal-001 |
| MONEY-ARITHMETIC-005 | Money | MUST / MUST NOT | COVERED | money.divide.exact-001 |
| MONEY-ARITHMETIC-006 | Money | MUST / MUST NOT | COVERED | money.divide.zero-001 |
| MONEY-ARITHMETIC-007 | Money | MUST / MUST NOT | COVERED | money.add.differing-scale-001, money.add.exact-decimal-001, money.add.zero-001, money.divide.exact-001, money.multiply.decimal-001, money.subtract.differing-scale-001, money.subtract.negative-result-001, money.subtract.whole-number-001 |
| MONEY-ARITHMETIC-008 | Money | MUST / MUST NOT | COVERED | money.divide.rounding-required-001 |
| MONEY-ARITHMETIC-009 | Money | MUST / MUST NOT | COVERED | money.add.differing-scale-001, money.add.exact-decimal-001, money.add.negative-001, money.add.same-currency.basic-001, money.add.zero-001, money.divide.exact-001, money.multiply.decimal-001, money.negate.negative-001, money.negate.positive-001, money.subtract.basic-001, money.subtract.differing-scale-001, money.subtract.negative-result-001, money.subtract.whole-number-001 |
| MONEY-COMPARISON-001 | Money | MUST / MUST NOT | COVERED | money.compare.equal-trailing-zeros-001 |
| MONEY-COMPARISON-002 | Money | MUST / MUST NOT | COVERED | money.compare.equal-trailing-zeros-001, money.compare.equal-zero-scale-001 |
| MONEY-COMPARISON-003 | Money | MUST / MUST NOT | COVERED | money.compare.greater-negative-001, money.compare.less-001 |
| MONEY-COMPARISON-004 | Money | MUST / MUST NOT | COVERED | money.compare.equality-currency-mismatch-001, money.compare.order-currency-mismatch-001 |
| MONEY-COMPARISON-005 | Money | MAY | NOT DIRECTLY TESTABLE | — |
| MONEY-COMPARISON-006 | Money | MUST / MUST NOT | COVERED | money.compare.equal-zero-scale-001, money.compare.equal-trailing-zeros-001 |
| MONEY-CURRENCY-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.positive-001 |
| MONEY-CURRENCY-002 | Money | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| MONEY-CURRENCY-003 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.compare.equality-currency-mismatch-001, money.compare.order-currency-mismatch-001 |
| MONEY-CURRENCY-004 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.compare.equality-currency-mismatch-001, money.compare.order-currency-mismatch-001, money.subtract.currency-mismatch-001 |
| MONEY-CURRENCY-005 | Money | MUST / MUST NOT | COVERED | money.deserialize.unknown-members-001 |
| MONEY-ERROR-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.exponent-001, money.deserialize.leading-plus-001, money.deserialize.missing-amount-001, money.deserialize.non-finite-001, money.deserialize.numeric-amount-001 |
| MONEY-ERROR-002 | Money | MUST / MUST NOT | COVERED | money.deserialize.lowercase-currency-001, money.deserialize.missing-currency-001 |
| MONEY-ERROR-003 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.compare.equality-currency-mismatch-001, money.compare.order-currency-mismatch-001, money.subtract.currency-mismatch-001 |
| MONEY-ERROR-004 | Money | MUST / MUST NOT | COVERED | money.divide.zero-001 |
| MONEY-ERROR-005 | Money | MUST / MUST NOT | COVERED | money.divide.rounding-required-001 |
| MONEY-ERROR-006 | Money | MUST / MUST NOT | COVERED | money.round.invalid-mode-001, money.round.invalid-scale-001 |
| MONEY-ERROR-007 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.compare.equality-currency-mismatch-001, money.compare.order-currency-mismatch-001, money.divide.rounding-required-001, money.divide.zero-001, money.round.invalid-mode-001, money.round.invalid-scale-001, money.subtract.currency-mismatch-001 |
| MONEY-REPRESENTATION-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-amount-001, money.deserialize.missing-currency-001, money.deserialize.positive-001 |
| MONEY-REPRESENTATION-002 | Money | MUST / MUST NOT | COVERED | money.deserialize.positive-001 |
| MONEY-REPRESENTATION-003 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-currency-001, money.deserialize.positive-001 |
| MONEY-REPRESENTATION-004 | Money | MUST / MUST NOT | COVERED | money.add.negative-001, money.deserialize.negative-001, money.deserialize.zero-001 |
| MONEY-REPRESENTATION-005 | Money | MUST / MUST NOT | COVERED | money.compare.equal-trailing-zeros-001 |
| MONEY-REPRESENTATION-006 | Money | MAY | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-001 | Money | MUST / MUST NOT | COVERED | money.round.explicit-scale-001, money.round.invalid-mode-001, money.round.invalid-scale-001 |
| MONEY-ROUNDING-002 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-003 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.no-discard-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-004 | Money | MUST / MUST NOT | COVERED | money.round.explicit-scale-001 |
| MONEY-ROUNDING-005 | Money | MAY | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-006 | Money | MUST / MUST NOT | COVERED | money.divide.rounding-required-001 |
| MONEY-ROUNDING-007 | Money | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-008 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.explicit-scale-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.no-discard-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-009 | Money | MUST / MUST NOT | COVERED | money.round.no-discard-001 |
| MONEY-SERIALIZATION-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-amount-001, money.deserialize.missing-currency-001, money.deserialize.positive-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-002 | Money | MUST / MUST NOT | COVERED | money.deserialize.numeric-amount-001, money.deserialize.positive-001, money.serialize.locale-independent-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-003 | Money | MUST / MUST NOT | COVERED | money.deserialize.exponent-001, money.deserialize.leading-plus-001, money.deserialize.non-finite-001, money.serialize.locale-independent-001 |
| MONEY-SERIALIZATION-004 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-currency-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-005 | Money | MUST / MUST NOT | COVERED | money.deserialize.exponent-001, money.deserialize.leading-plus-001, money.deserialize.non-finite-001 |
| MONEY-SERIALIZATION-006 | Money | MAY | COVERED | money.deserialize.unknown-members-001 |
| MONEY-SERIALIZATION-007 | Money | MUST / MUST NOT | COVERED | money.deserialize.unknown-members-001 |
| MONEY-SERIALIZATION-008 | Money | MUST / MUST NOT | COVERED | money.deserialize.positive-001, money.deserialize.unknown-members-001, money.serialize.roundtrip-001 |
| WORKFLOW-ERROR-001 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.transition-rejected-001 |
| WORKFLOW-ERROR-002 | Workflow | MAY | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-ERROR-003 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.not-inferred-no-outgoing-001, workflow.terminal.transition-rejected-001, workflow.transition.reverse-not-implied-001, workflow.transition.state-identity-exact-001, workflow.transition.undeclared-001 |
| WORKFLOW-GUARD-001 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.pass-001 |
| WORKFLOW-GUARD-002 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001, workflow.guard.multiple-pass-001, workflow.guard.pass-001, workflow.guard.reject-001 |
| WORKFLOW-GUARD-003 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001, workflow.guard.reject-001 |
| WORKFLOW-GUARD-004 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-GUARD-005 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-GUARD-006 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001 |
| WORKFLOW-STATES-001 | Workflow | MUST / MUST NOT | COVERED | workflow.create.duplicate-state-001 |
| WORKFLOW-STATES-002 | Workflow | MUST / MUST NOT | COVERED | workflow.create.initial-state-001, workflow.create.multiple-initial-001 |
| WORKFLOW-STATES-003 | Workflow | MUST / MUST NOT | COVERED | workflow.create.initial-state-001 |
| WORKFLOW-STATES-004 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.undeclared-current-state-001 |
| WORKFLOW-STATES-005 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.state-identity-exact-001 |
| WORKFLOW-STATES-006 | Workflow | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-STATES-007 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.multiple-current-states-001 |
| WORKFLOW-TERMINAL-001 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.entry-allowed-001, workflow.terminal.not-inferred-no-outgoing-001, workflow.terminal.transition-rejected-001 |
| WORKFLOW-TERMINAL-002 | Workflow | MUST / MUST NOT | COVERED | workflow.create.terminal-outgoing-001 |
| WORKFLOW-TERMINAL-003 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.transition-rejected-001 |
| WORKFLOW-TERMINAL-004 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.entry-allowed-001, workflow.terminal.not-inferred-no-outgoing-001, workflow.terminal.transition-rejected-001 |
| WORKFLOW-TRANSITION-001 | Workflow | MUST / MUST NOT | COVERED | workflow.create.undeclared-transition-source-001, workflow.create.undeclared-transition-target-001 |
| WORKFLOW-TRANSITION-002 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.reverse-not-implied-001 |
| WORKFLOW-TRANSITION-003 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.entry-allowed-001, workflow.terminal.not-inferred-no-outgoing-001, workflow.transition.undeclared-001, workflow.transition.unguarded-ignores-facts-001, workflow.transition.valid-001 |
| WORKFLOW-TRANSITION-004 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.pass-001, workflow.transition.unguarded-ignores-facts-001 |
| WORKFLOW-TRANSITION-005 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.entry-allowed-001, workflow.transition.unguarded-ignores-facts-001, workflow.transition.valid-001 |
| WORKFLOW-TRANSITION-006 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.not-inferred-no-outgoing-001, workflow.terminal.transition-rejected-001, workflow.transition.reverse-not-implied-001, workflow.transition.undeclared-001 |
| WORKFLOW-TRANSITION-007 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-ACTOR-001 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001 |
| AUDIT-ACTOR-002 | Audit | MUST / MUST NOT | COVERED | audit.actor.opaque-identity-001 |
| AUDIT-ACTOR-003 | Audit | MUST / MUST NOT | COVERED | audit.actor.display-name-not-identity-001 |
| AUDIT-ACTOR-004 | Audit | MUST / MUST NOT | COVERED | audit.event.unknown-actor-omitted-001 |
| AUDIT-ACTOR-005 | Audit | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-ACTOR-006 | Audit | MUST / MUST NOT | COVERED | audit.redaction.actor-context-001 |
| AUDIT-ACTOR-007 | Audit | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-ACTOR-008 | Audit | MUST / MUST NOT | COVERED | audit.actor.identity-preserved-in-history-001 |
| AUDIT-APPEND-001 | Audit | MUST / MUST NOT | COVERED | audit.append-only.remove-forbidden-001, audit.append-only.replace-forbidden-001 |
| AUDIT-APPEND-002 | Audit | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-APPEND-003 | Audit | MUST / MUST NOT | COVERED | audit.event.duplicate-identity-001 |
| AUDIT-APPEND-004 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| AUDIT-APPEND-006 | Audit | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-CHANGE-001 | Audit | MUST / MUST NOT | COVERED | audit.change.before-after-001 |
| AUDIT-CHANGE-002 | Audit | SHOULD / SHOULD NOT | COVERED | audit.change.before-after-001 |
| AUDIT-CHANGE-003 | Audit | MUST / MUST NOT | COVERED | audit.change.absent-vs-null-001 |
| AUDIT-CHANGE-004 | Audit | MUST / MUST NOT | COVERED | audit.change.money-value-preserved-001 |
| AUDIT-CHANGE-005 | Audit | MUST / MUST NOT | COVERED | audit.change.unchanged-rejected-001 |
| AUDIT-CHANGE-006 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| AUDIT-CHANGE-007 | Audit | MAY | NOT DIRECTLY TESTABLE | — |
| AUDIT-ERROR-001 | Audit | MUST / MUST NOT | COVERED | audit.event.missing-entity-id-001, audit.event.missing-timestamp-001, audit.redaction.unknown-path-001 |
| AUDIT-ERROR-002 | Audit | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-ERROR-003 | Audit | MAY | NOT DIRECTLY TESTABLE | — |
| AUDIT-EVENT-001 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001, audit.event.missing-timestamp-001 |
| AUDIT-EVENT-002 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001, audit.event.unknown-actor-omitted-001 |
| AUDIT-EVENT-003 | Audit | MUST / MUST NOT | COVERED | audit.event.implementation-type-rejected-001 |
| AUDIT-EVENT-004 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001, audit.event.missing-entity-id-001 |
| AUDIT-EVENT-005 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001, audit.event.missing-timestamp-001 |
| AUDIT-EVENT-006 | Audit | MAY | NOT DIRECTLY TESTABLE | — |
| AUDIT-EVENT-007 | Audit | MUST / MUST NOT | COVERED | audit.event.append-complete-001, audit.event.missing-entity-id-001, audit.event.missing-timestamp-001 |
| AUDIT-EVENT-008 | Audit | MUST / MUST NOT | COVERED | audit.event.metadata-conflict-001 |
| AUDIT-REDACTION-001 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001, audit.redaction.unknown-path-001 |
| AUDIT-REDACTION-002 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| AUDIT-REDACTION-003 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| AUDIT-REDACTION-004 | Audit | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| AUDIT-REDACTION-005 | Audit | MAY | NOT DIRECTLY TESTABLE | — |
| AUDIT-REDACTION-006 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| AUDIT-REDACTION-007 | Audit | MUST / MUST NOT | COVERED | audit.redaction.preserve-evidence-001 |
| APPROVAL-CHAIN-001 | Approvals | MUST / MUST NOT | COVERED | approval.chain.empty-requirements-invalid-001 |
| APPROVAL-CHAIN-002 | Approvals | MUST / MUST NOT | COVERED | approval.chain.missing-mode-invalid-001 |
| APPROVAL-CHAIN-003 | Approvals | MUST / MUST NOT | COVERED | approval.chain.pending-001, approval.chain.unordered-not-sequential-001 |
| APPROVAL-CHAIN-004 | Approvals | MUST / MUST NOT | COVERED | approval.chain.sequential-not-active-001 |
| APPROVAL-CHAIN-005 | Approvals | MUST / MUST NOT | COVERED | approval.chain.all-approved-001, approval.chain.pending-001 |
| APPROVAL-CHAIN-006 | Approvals | MUST / MUST NOT | COVERED | approval.chain.pending-001 |
| APPROVAL-CHAIN-007 | Approvals | MUST / MUST NOT | COVERED | approval.chain.rejected-001 |
| APPROVAL-CHAIN-008 | Approvals | MUST / MUST NOT | COVERED | approval.chain.deterministic-declared-order-001 |
| APPROVAL-CHAIN-009 | Approvals | MUST / MUST NOT | COVERED | approval.chain.duplicate-requirement-invalid-001 |
| APPROVAL-CONDITION-001 | Approvals | MUST / MUST NOT | COVERED | approval.condition.missing-fact-001 |
| APPROVAL-CONDITION-002 | Approvals | MUST / MUST NOT | COVERED | approval.condition.applicable-explicit-001, approval.condition.missing-result-unresolved-001, approval.condition.not-applicable-explicit-001 |
| APPROVAL-CONDITION-003 | Approvals | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| APPROVAL-CONDITION-004 | Approvals | MUST / MUST NOT | COVERED | approval.condition.applicable-explicit-001, approval.condition.not-applicable-explicit-001 |
| APPROVAL-CONDITION-005 | Approvals | MUST / MUST NOT | COVERED | approval.condition.applicable-explicit-001, approval.condition.not-applicable-explicit-001 |
| APPROVAL-CONDITION-006 | Approvals | MUST / MUST NOT | COVERED | approval.condition.falsey-facts-present-001, approval.condition.missing-fact-001, approval.condition.missing-result-unresolved-001 |
| APPROVAL-DECISION-001 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.wrong-association-001 |
| APPROVAL-DECISION-002 | Approvals | MUST / MUST NOT | COVERED | approval.decision.relevant-path-unchanged-unrelated-fact-changed-001, approval.decision.subject-facts-array-order-changed-001, approval.decision.subject-facts-array-to-object-001, approval.decision.subject-facts-changed-001, approval.decision.subject-facts-nested-shape-changed-001, approval.decision.subject-facts-object-key-changed-001, approval.decision.subject-facts-object-key-order-001, approval.decision.subject-facts-object-to-array-001, approval.decision.subject-facts-unchanged-001 |
| APPROVAL-DECISION-003 | Approvals | MUST / MUST NOT | COVERED | approval.decision.relevant-path-unchanged-unrelated-fact-changed-001, approval.decision.subject-facts-array-order-changed-001, approval.decision.subject-facts-array-to-object-001, approval.decision.subject-facts-changed-001, approval.decision.subject-facts-nested-shape-changed-001, approval.decision.subject-facts-object-key-changed-001, approval.decision.subject-facts-object-key-order-001, approval.decision.subject-facts-object-to-array-001, approval.decision.subject-facts-unchanged-001 |
| APPROVAL-DECISION-004 | Approvals | MUST / MUST NOT | COVERED | approval.decision.ineligible-actor-001 |
| APPROVAL-DECISION-005 | Approvals | MUST / MUST NOT | COVERED | approval.decision.pending-invalid-001 |
| APPROVAL-DECISION-006 | Approvals | MUST / MUST NOT | COVERED | approval.decision.timestamp-ambiguous-001 |
| APPROVAL-DECISION-007 | Approvals | MUST / MUST NOT | COVERED | approval.decision.append-history-001 |
| APPROVAL-DECISION-008 | Approvals | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| APPROVAL-ERROR-001 | Approvals | MUST / MUST NOT | COVERED | approval.decision.ineligible-actor-001, approval.decision.pending-invalid-001, approval.decision.timestamp-ambiguous-001 |
| APPROVAL-ERROR-002 | Approvals | MAY | NOT DIRECTLY TESTABLE | — |
| APPROVAL-ERROR-003 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.pending-001, approval.requirement.rejected-001 |
| APPROVAL-ERROR-004 | Approvals | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| APPROVAL-ERROR-005 | Approvals | MUST / MUST NOT | COVERED | approval.decision.ineligible-actor-001, approval.decision.pending-invalid-001, approval.decision.timestamp-ambiguous-001 |
| APPROVAL-REQUIREMENT-001 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-identity-001 |
| APPROVAL-REQUIREMENT-002 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-subject-001 |
| APPROVAL-REQUIREMENT-003 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-eligibility-001 |
| APPROVAL-REQUIREMENT-004 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.approved-001, approval.requirement.rejected-001 |
| APPROVAL-REQUIREMENT-005 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.pending-001 |
| APPROVAL-REQUIREMENT-006 | Approvals | MUST / MUST NOT | COVERED | approval.decision.ineligible-actor-001 |
| APPROVAL-REQUIREMENT-007 | Approvals | MAY | NOT DIRECTLY TESTABLE | — |
| ENTITY-AUDIT-001 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-AUDIT-002 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-DEFINITION-001 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-ERROR-001 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.mutate.immutable-financial-field-001, entity.transition.rejected-preserves-entity-001, entity.validation.complete-result-001 |
| ENTITY-ERROR-002 | Entities | SHOULD / SHOULD NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-ERROR-003 | Entities | MAY | NOT DIRECTLY TESTABLE | — |
| ENTITY-ERROR-004 | Entities | MUST / MUST NOT | COVERED | entity.transition.rejected-preserves-entity-001 |
| ENTITY-IDENTITY-001 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-IDENTITY-002 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.transition.success-identity-stable-001 |
| ENTITY-IDENTITY-003 | Entities | MUST / MUST NOT | COVERED | entity.create.opaque-identity-preserved-001 |
| ENTITY-IDENTITY-004 | Entities | MUST / MUST NOT | COVERED | entity.mutate.display-number-not-identity-001 |
| ENTITY-IDENTITY-005 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-IDENTITY-006 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-LIFECYCLE-001 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-LIFECYCLE-002 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-LIFECYCLE-003 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.transition.rejected-preserves-entity-001, entity.transition.success-identity-stable-001 |
| ENTITY-LIFECYCLE-004 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-LIFECYCLE-005 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-LIFECYCLE-006 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-MUTABILITY-001 | Entities | MUST / MUST NOT | COVERED | entity.mutate.mutable-field-001 |
| ENTITY-MUTABILITY-002 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.mutate.immutable-financial-field-001 |
| ENTITY-MUTABILITY-003 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-MUTABILITY-004 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.mutate.immutable-financial-field-001 |
| ENTITY-MUTABILITY-005 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-MUTABILITY-006 | Entities | MUST / MUST NOT | COVERED | entity.mutate.terminal-metadata-001 |
| ENTITY-MUTABILITY-007 | Entities | MAY | COVERED | entity.mutate.terminal-metadata-001 |
| ENTITY-VALIDATION-001 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-VALIDATION-002 | Entities | MUST / MUST NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-VALIDATION-003 | Entities | MUST / MUST NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-VALIDATION-004 | Entities | MUST / MUST NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-VALIDATION-005 | Entities | SHOULD / SHOULD NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-VALIDATION-006 | Entities | MUST / MUST NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-VALIDATION-007 | Entities | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-VALIDATION-008 | Entities | MUST / MUST NOT | COVERED | entity.validation.complete-result-001 |

## Audit Draft 0.1 traceability closure notes

| Requirement | Final classification | Justification |
| --- | --- | --- |
| AUDIT-ACTOR-002 | COVERED | `audit.actor.opaque-identity-001` observes that actor identifiers are preserved exactly and actor types are not interpreted as an authorization or identity namespace. |
| AUDIT-ACTOR-003 | COVERED | `audit.actor.display-name-not-identity-001` observes display metadata retained separately from stable actor identity. |
| AUDIT-ACTOR-004 | COVERED | `audit.event.unknown-actor-omitted-001` observes the Draft 0.1 permitted unknown-actor path: actor attribution is omitted and no identity is invented. The explicit unknown-actor interchange representation remains an open question. |
| AUDIT-ACTOR-006 | COVERED | `audit.redaction.actor-context-001` observes the Draft 0.1 reserved actor-context redaction targets: optional actor display name and metadata are redacted, while actor identity and type remain observable. |
| AUDIT-ACTOR-008 | COVERED | `audit.actor.identity-preserved-in-history-001` observes that later appends preserve actor identity already recorded on committed history. |
| AUDIT-APPEND-002 | NOT DIRECTLY TESTABLE | Draft 0.1 requires preservation of explicitly recorded ordering relationships, but no portable representation of such relationships exists in current Audit Event or history vectors. Append order remains observable under `AUDIT-APPEND-001`; distributed or causal ordering is outside Draft 0.1. |
| AUDIT-ERROR-002 | NOT DIRECTLY TESTABLE | Current normalized conformance errors compare portable error codes and post-state only; messages are never compared and safe diagnostic details are optional. The TypeScript adapter omits implementation messages/details, but the current vector shape cannot independently prove absence of protected details. |
| AUDIT-EVENT-003 | COVERED | `audit.event.implementation-type-rejected-001` observes the clarified stable domain event identifier rule and rejects implementation-mechanism event type syntax. |
| AUDIT-EVENT-007 | COVERED | Draft 0.1 now defines structural completeness through required valid fields. Existing complete and missing-required-field vectors exercise that boundary. |
| AUDIT-REDACTION-007 | COVERED | `audit.redaction.preserve-evidence-001` now observes that redaction returns a redacted representation and evidence event while preserving the committed source event in history. |

## Approvals Draft 0.1 traceability closure notes

| Requirement | Final classification | Justification |
| --- | --- | --- |
| APPROVAL-REQUIREMENT-001 | COVERED | `approval.requirement.missing-identity-001` observes that a Requirement without a stable caller-supplied identifier is rejected instead of receiving inferred identity from position, structure, or implementation state. |
| APPROVAL-REQUIREMENT-002 | COVERED | `approval.requirement.missing-subject-001` observes that the subject association is required for Requirement evaluation. |
| APPROVAL-REQUIREMENT-003 | COVERED | `approval.requirement.missing-eligibility-001` observes that a Requirement must explicitly declare eligible actors or eligibility semantics accepted by this milestone representation. |
| APPROVAL-REQUIREMENT-006 | COVERED | `approval.decision.ineligible-actor-001` observes domain eligibility independently from any technical ability to submit the candidate Decision fixture. |
| APPROVAL-CHAIN-001 | COVERED | `approval.chain.empty-requirements-invalid-001` observes that a Chain cannot be evaluated without one or more declared Requirement identities. |
| APPROVAL-CHAIN-002 | COVERED | `approval.chain.missing-mode-invalid-001` observes that Chain sequencing mode must be declared and is not inferred. |
| APPROVAL-CHAIN-003 | COVERED | `approval.chain.unordered-not-sequential-001` observes that unordered Chains report aggregate state rather than sequential active work. |
| APPROVAL-CHAIN-008 | COVERED | `approval.chain.deterministic-declared-order-001` observes deterministic sequential evaluation from declared order rather than sorted identifiers or ambient ordering. |
| APPROVAL-DECISION-006 | COVERED | `approval.decision.timestamp-ambiguous-001` observes that serialized Decision timestamps must identify an unambiguous instant with an explicit offset. |
| APPROVAL-DECISION-003 | COVERED | Decision vectors observe that relevant facts remain effective only under structural, deterministic JSON equivalence and caller-declared relevant paths: object key order is non-semantic, unrelated fact changes outside a relevant path are ignored, arrays remain order-sensitive, and object/array, key-set, null, and nested shape changes make the Decision ineffective. |
| APPROVAL-DECISION-007 | COVERED | `approval.decision.append-history-001` observes append-only logical Decision history: committing a later Decision preserves prior committed Decisions. |
| APPROVAL-DECISION-008 | NOT DIRECTLY TESTABLE | The requirement is conditional: it applies only when a composing domain requires an Audit Event for an Approval Decision. Standalone Approvals Draft 0.1 intentionally has no Audit coupling, and no current Approval operation emits Audit Events. |
| APPROVAL-ERROR-001 | COVERED | Failing Decision vectors with history observations, including `approval.decision.timestamp-ambiguous-001`, observe that failed Decision attempts do not change Approval state or Chain inputs. |
| APPROVAL-ERROR-003 | COVERED | `approval.requirement.pending-001` and `approval.requirement.rejected-001` observe distinct `PENDING` and `REJECTED` outcomes; missing approval is not collapsed into explicit rejection. |
| APPROVAL-ERROR-004 | NOT DIRECTLY TESTABLE | Current normalized conformance errors compare portable codes and post-state only; messages/details are intentionally outside vector comparison. The TypeScript adapter omits Approval diagnostic details, but absence of restricted disclosure cannot be isolated by the current vector shape. |
| APPROVAL-ERROR-005 | COVERED | Failing Decision vectors with history observations, including `approval.decision.timestamp-ambiguous-001` and `approval.decision.ineligible-actor-001`, observe that existing committed Decisions remain unchanged after failed Approval operations. |

## Entities Draft 0.1 traceability closure notes

| Requirement | Final classification | Justification |
| --- | --- | --- |
| ENTITY-AUDIT-001 | NOT DIRECTLY TESTABLE | This is a composing-domain obligation to identify which Entity Mutations and Transitions require Audit Events. The generic Entity conformance operations do not include an audit policy declaration surface, and Draft 0.1 does not define an Entity/Audit integration operation to observe that declaration independently. |
| ENTITY-AUDIT-002 | NOT DIRECTLY TESTABLE | This obligation is conditional on the audit policy identified by `ENTITY-AUDIT-001`. Because current Entity operations intentionally do not integrate Audit, no portable Entity operation can independently observe event production without adding the out-of-scope integration. |
| ENTITY-DEFINITION-001 | NOT DIRECTLY TESTABLE | The requirement is a composing-domain definition responsibility: fields, lifecycle, and invariants must be defined by the domain using Entity primitives. Current vectors observe the lifecycle, mutability, and validation fixtures supplied to Entity operations, but there is no standalone portable definition-validation operation in Draft 0.1. |
| ENTITY-IDENTITY-003 | COVERED | `entity.create.opaque-identity-preserved-001` observes exact preservation of an opaque identifier containing case and surrounding whitespace, guarding against normalization, coercion, or format inference. |
| ENTITY-IDENTITY-004 | COVERED | `entity.mutate.display-number-not-identity-001` observes mutable display-number and revision data changing while stable Entity identity remains unchanged. |
| ENTITY-IDENTITY-005 | NOT DIRECTLY TESTABLE | Uniqueness across distinct entities in the same scope requires a composing-domain registry, repository, or persistence boundary. Draft 0.1 Entity conformance operates on one supplied Entity observation at a time and cannot prove cross-entity uniqueness independently. |
| ENTITY-IDENTITY-006 | NOT DIRECTLY TESTABLE | Import or migration identity mapping requires an import/migration operation or mapping record, neither of which is defined by current Entity Draft 0.1 conformance. Existing operations preserve supplied identity but cannot observe an explicit migration mapping contract. |
| ENTITY-LIFECYCLE-004 | NOT DIRECTLY TESTABLE | This is the lifecycle-specific form of the Entity/Audit declaration obligation. Current Entity lifecycle operations intentionally do not couple to Audit and cannot observe audit declaration or event production. |
| ENTITY-LIFECYCLE-005 | NOT DIRECTLY TESTABLE | Domain consequences of each state belong to composing domains. Generic Entity conformance can observe the current state and transition boundary, but it cannot prove concrete invoice, expense, or payment consequences absent a concrete domain specification. |
| ENTITY-LIFECYCLE-006 | COVERED | `entity.create.initial-lifecycle-001` observes a portable Entity representation with exactly one current lifecycle `state` initialized through the referenced Workflow. |
| ENTITY-MUTABILITY-003 | NOT DIRECTLY TESTABLE | This is the mutation-specific form of the Entity/Audit declaration obligation. Testing it would require the out-of-scope Entity/Audit integration surface. |
| ENTITY-MUTABILITY-005 | NOT DIRECTLY TESTABLE | Preservation of prior audit history after a field becomes immutable requires an attached audit history or Entity/Audit integration operation. Current Entity conformance has no such portable observation. |
| ENTITY-ERROR-002 | COVERED | `entity.validation.complete-result-001` observes a stable validation finding identifier through the safe `rule` field. |
| ENTITY-ERROR-003 | NOT DIRECTLY TESTABLE | Safe diagnostic context is optional. Conformance can verify portable codes and safe findings when present, but cannot require optional diagnostics without turning a MAY into mandatory behavior. |
| ENTITY-VALIDATION-005 | COVERED | `entity.validation.complete-result-001` observes the relevant domain path through the validation finding `path` field. |
| ENTITY-VALIDATION-007 | NOT DIRECTLY TESTABLE | This is a composing-domain recommendation about distinguishing always-required rules from transition or target-state rules. Draft 0.1 has no generic state-dependent validation policy language to execute portably. |
| ENTITY-VALIDATION-008 | COVERED | `entity.validation.complete-result-001` observes that validation failure details expose only `rule` and `path`, not the rejected Money value, TypeScript class name, message, or other sensitive value-bearing details. |

## Critical financial requirements

| Requirement | Critical behavior | Mutation that should be killed |
| --- | --- | --- |
| MONEY-ERROR-003 | Currency mismatch rejection and portable code. | Remove currency compatibility check. |
| MONEY-ARITHMETIC-007 | Exact base-10 arithmetic. | Use binary floating point or implicit minor-unit rounding. |
| MONEY-ROUNDING-003 | Six exact portable rounding modes. | Replace HALF_EVEN with HALF_UP or negative FLOOR with DOWN. |
| WORKFLOW-TRANSITION-003 | Declared directed transitions only. | Ignore current Source State. |
| WORKFLOW-TRANSITION-006 | State preservation after rejection. | Assign Target State before validation. |
| WORKFLOW-TERMINAL-003 | No transition request may leave an explicitly terminal State. | Remove or invert the current-State terminal check. |
| AUDIT-APPEND-001 | Append-only committed history. | Replace or remove a committed event. |
| AUDIT-REDACTION-002, AUDIT-REDACTION-003, AUDIT-REDACTION-006 | Redacted representation remains distinguishable, preserves event meaning, and records evidence. | Expose protected values, collapse redaction to null or absence, change event identity, or omit evidence. |
| APPROVAL-DECISION-003 | Validity against policy-relevant facts. | Ignore changed relevant facts. |
| ENTITY-IDENTITY-002 | Lifecycle-stable identity. | Generate a new ID after mutation. |
| ENTITY-MUTABILITY-002 | Configured immutability. | Skip current-State mutability check. |
| ENTITY-VALIDATION-003, ENTITY-VALIDATION-004, ENTITY-VALIDATION-006 | Complete validation before observable mutation with the portable validation code. | Stop after the first failed rule, return success for invalid data, apply part of a rejected mutation, or expose sensitive field values in findings. |

## Conformance gaps

- Money: precision or overflow limits, private or non-fiat currency namespaces, and currency-recommended scale remain open as deferred topics outside Draft 0.1 closure.
- Workflow: external fact capture, definition migration, transition identifiers, and concurrency remain open.
- Audit: unknown-Actor interchange, domain paths, structured summaries, production redaction encoding, ingestion time, and causal sequencing remain open.
- Approvals: condition syntax, subject-state interchange, relevant-fact policy, supersession, withdrawal, expiration, delegation, quorum, and rejection codes remain open for future drafts; current standalone Draft 0.1 conformance has no uncovered mandatory Approval requirements.
- Entities: concrete fields, lifecycle policy, full validation catalog, import or migration mapping, cross-entity identity registries, Audit integration, concurrency, and correction or reversal behavior remain outside Core. The current TypeScript reference implementation covers the conformance-local Entity identity, lifecycle, mutability, and validation vectors. Remaining Entity requirements classified as not directly testable are composing-domain, conditional Audit-integration, optional diagnostic, or registry/import obligations without a standalone portable Entity operation.

Vectors do not settle these open questions.

## Readiness

**READY FOR CONFORMANCE RUNNER**

The manifest, schema, operation catalog, exact comparison rules, normalized errors, deterministic context, and valid requirement references are sufficient for the first runner. Money, Workflow, Audit, Approvals, and Entities Draft 0.1 have complete vector coverage for their current directly testable mandatory requirements, and the TypeScript reference implementation passes those suites. FinKore Core Draft 0.1 cross-domain closure is complete for these directly testable mandatory requirements.
