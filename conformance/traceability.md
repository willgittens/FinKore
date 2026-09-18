# FinKore Requirement Traceability

This is the canonical human-readable requirement-to-vector index. Manifest-listed
vectors remain the primary machine-readable mapping through each vector's
`requirements` field. The counts and mappings cover the current Money, Workflow,
Audit, Approvals, and Entities scope.

## Inventory and coverage

| Domain | Requirements | MUST / MUST NOT | SHOULD / SHOULD NOT | MAY | Covered | Partial | Uncovered | Not directly testable | Deferred | Blocking spec gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Shared | 29 | 23 | 5 | 1 | 2 | 0 | 0 | 27 | 0 | 0 |
| Money | 73 | 68 | 1 | 4 | 68 | 0 | 0 | 5 | 0 | 0 |
| Workflow | 57 | 55 | 1 | 1 | 48 | 0 | 0 | 9 | 0 | 0 |
| Audit | 52 | 44 | 4 | 4 | 42 | 0 | 0 | 10 | 0 | 0 |
| Approvals | 86 | 83 | 1 | 2 | 81 | 0 | 0 | 5 | 0 | 0 |
| Entities | 84 | 79 | 3 | 2 | 72 | 0 | 0 | 12 | 0 | 0 |
| **Total** | **381** | **352** | **15** | **14** | **313** | **0** | **0** | **68** | **0** | **0** |

The suite contains 254 vectors. Overall: **313 covered (82.2%)**, **0 partially covered (0.0%)**, **0 uncovered (0.0%)**, **68 not directly testable (17.8%)**, **0 deferred (0.0%)**, **0 blocking spec gaps (0.0%)**.

NOT DIRECTLY TESTABLE covers specification-authoring rules, optional or recommended freedoms without one mandatory runtime observation, guarantees such as absence of an assumed authorization model or unobservable intermediate state that one static input/result vector cannot prove, and adapter obligations that the current normalized vector shape cannot isolate. These guarantees remain subject to implementation unit, mutation, and architectural review. DEFERRED means the requirement is explicitly outside the current draft. BLOCKING SPEC GAP means mandatory wording exists, but the expected portable observable behavior is not sufficiently specified. UNCOVERED means a deterministic mandatory vector is feasible but not yet published. No requirement is partially covered in this snapshot.

## Requirement mapping

| Requirement | Domain | Modality | Coverage | Test vectors |
| --- | --- | --- | --- | --- |
| SPEC-CONFORMANCE-001 | Shared | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CONFORMANCE-002 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CURRENCY-001 | Shared | SHOULD / SHOULD NOT | NOT DIRECTLY TESTABLE | — |
| SPEC-CURRENCY-002 | Shared | MUST / MUST NOT | COVERED | money.deserialize.lowercase-currency-001 |
| SPEC-DECIMAL-001 | Shared | MUST / MUST NOT | COVERED | money.add.deep-positive-scale-001, money.add.large-significant-digits-001, money.allocate.ratio.safe-integer-boundary-001, money.divide.quotient-plain-expansion-001, money.divide.terminating-scale-40-001, money.multiply.large-product-growth-001, money.rate.large-percentage-growth-001, money.round.scale-50-half-even-001, money.subtract.large-negative-001 |
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
| MONEY-ARITHMETIC-001 | Money | MUST / MUST NOT | COVERED | money.add.currency-mismatch-001, money.add.deep-positive-scale-001, money.add.large-significant-digits-001, money.add.negative-001, money.add.same-currency.basic-001, money.subtract.basic-001, money.subtract.currency-mismatch-001, money.subtract.large-negative-001 |
| MONEY-ARITHMETIC-002 | Money | MUST / MUST NOT | COVERED | money.add.deep-positive-scale-001, money.add.large-significant-digits-001, money.add.same-currency.basic-001, money.subtract.basic-001, money.subtract.large-negative-001 |
| MONEY-ARITHMETIC-003 | Money | MUST / MUST NOT | COVERED | money.negate.negative-001, money.negate.positive-001 |
| MONEY-ARITHMETIC-004 | Money | MUST / MUST NOT | COVERED | money.multiply.decimal-001, money.multiply.large-product-growth-001 |
| MONEY-ARITHMETIC-005 | Money | MUST / MUST NOT | COVERED | money.divide.exact-001, money.divide.quotient-plain-expansion-001, money.divide.terminating-scale-40-001 |
| MONEY-ARITHMETIC-006 | Money | MUST / MUST NOT | COVERED | money.divide.zero-001 |
| MONEY-ARITHMETIC-007 | Money | MUST / MUST NOT | COVERED | money.add.deep-positive-scale-001, money.add.differing-scale-001, money.add.exact-decimal-001, money.add.large-significant-digits-001, money.add.zero-001, money.divide.exact-001, money.divide.quotient-plain-expansion-001, money.divide.terminating-scale-40-001, money.multiply.decimal-001, money.multiply.large-product-growth-001, money.subtract.differing-scale-001, money.subtract.large-negative-001, money.subtract.negative-result-001, money.subtract.whole-number-001 |
| MONEY-ARITHMETIC-008 | Money | MUST / MUST NOT | COVERED | money.divide.rounding-required-001 |
| MONEY-ARITHMETIC-009 | Money | MUST / MUST NOT | COVERED | money.add.deep-positive-scale-001, money.add.differing-scale-001, money.add.exact-decimal-001, money.add.large-significant-digits-001, money.add.negative-001, money.add.same-currency.basic-001, money.add.zero-001, money.divide.exact-001, money.divide.quotient-plain-expansion-001, money.divide.terminating-scale-40-001, money.multiply.decimal-001, money.multiply.large-product-growth-001, money.negate.negative-001, money.negate.positive-001, money.subtract.basic-001, money.subtract.differing-scale-001, money.subtract.large-negative-001, money.subtract.negative-result-001, money.subtract.whole-number-001 |
| MONEY-ALLOCATION-001 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.remainder-positive-001, money.allocate.invalid-method-001, money.allocate.invalid-scale-001, money.allocate.ratio.remainder-positive-001 |
| MONEY-ALLOCATION-002 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-positive-001, money.allocate.invalid-scale-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.unrepresentable-source-scale-001 |
| MONEY-ALLOCATION-003 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.invalid-negative-parts-001, money.allocate.equal.invalid-zero-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001 |
| MONEY-ALLOCATION-004 | Money | MUST / MUST NOT | COVERED | money.allocate.ratio.declared-order-001, money.allocate.ratio.invalid-empty-ratios-001, money.allocate.ratio.invalid-fractional-ratio-001, money.allocate.ratio.invalid-malformed-ratio-001, money.allocate.ratio.invalid-negative-ratio-001, money.allocate.ratio.invalid-zero-ratio-001, money.allocate.ratio.large-ratios-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.ratio.zero-source-001 |
| MONEY-ALLOCATION-005 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.remainder-negative-001, money.allocate.ratio.zero-source-001 |
| MONEY-ALLOCATION-006 | Money | MUST / MUST NOT | COVERED | money.allocate.unrepresentable-source-scale-001 |
| MONEY-ALLOCATION-007 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.large-ratios-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.ratio.zero-source-001 |
| MONEY-ALLOCATION-008 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.declared-order-001, money.allocate.ratio.large-ratios-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.ratio.zero-source-001 |
| MONEY-ALLOCATION-009 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.declared-order-001, money.allocate.ratio.large-ratios-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001 |
| MONEY-ALLOCATION-010 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.declared-order-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001 |
| MONEY-ALLOCATION-011 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.remainder-negative-001 |
| MONEY-ALLOCATION-012 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.declared-order-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.ratio.zero-source-001 |
| MONEY-ALLOCATION-013 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.hundred-parts-001, money.allocate.equal.invalid-zero-parts-001, money.allocate.equal.remainder-negative-001, money.allocate.equal.remainder-positive-001, money.allocate.ratio.remainder-positive-001, money.allocate.ratio.safe-integer-boundary-001, money.allocate.unrepresentable-source-scale-001 |
| MONEY-RATE-001 | Money | MUST / MUST NOT | COVERED | money.rate.decimal-exact-001, money.rate.fractional-percentage-001, money.rate.invalid-exponent-value-001, money.rate.invalid-kind-001, money.rate.invalid-numeric-value-001, money.rate.large-percentage-growth-001, money.rate.percentage-conversion-001 |
| MONEY-RATE-002 | Money | MUST / MUST NOT | COVERED | money.rate.fractional-percentage-001, money.rate.large-percentage-growth-001, money.rate.percentage-conversion-001 |
| MONEY-RATE-003 | Money | MUST / MUST NOT | COVERED | money.rate.decimal-exact-001, money.rate.fractional-base10-001, money.rate.fractional-percentage-001, money.rate.large-percentage-growth-001, money.rate.negative-decimal-001, money.rate.percentage-conversion-001, money.rate.zero-decimal-001 |
| MONEY-RATE-004 | Money | MUST / MUST NOT | COVERED | money.rate.zero-decimal-001, money.rate.negative-decimal-001 |
| MONEY-RATE-005 | Money | MUST / MUST NOT | COVERED | money.rate.decimal-exact-001, money.rate.fractional-base10-001, money.rate.fractional-percentage-001, money.rate.large-percentage-growth-001, money.rate.percentage-conversion-001 |
| MONEY-RATE-006 | Money | MUST / MUST NOT | COVERED | money.rate.round.half-up-001, money.rate.round.half-even-001, money.rate.invalid-rounding-001 |
| MONEY-RATE-007 | Money | MUST / MUST NOT | COVERED | money.rate.invalid-numeric-value-001, money.rate.invalid-exponent-value-001, money.rate.invalid-kind-001 |
| MONEY-RATE-008 | Money | MUST / MUST NOT | COVERED | money.rate.invalid-rounding-001 |
| MONEY-RATE-009 | Money | MUST / MUST NOT | COVERED | money.rate.decimal-exact-001, money.rate.fractional-base10-001, money.rate.invalid-exponent-value-001, money.rate.invalid-kind-001, money.rate.invalid-numeric-value-001, money.rate.invalid-rounding-001, money.rate.large-percentage-growth-001, money.rate.negative-decimal-001, money.rate.percentage-conversion-001, money.rate.round.half-even-001, money.rate.round.half-up-001, money.rate.zero-decimal-001 |
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
| MONEY-ERROR-008 | Money | MUST / MUST NOT | COVERED | money.allocate.equal.invalid-negative-parts-001, money.allocate.equal.invalid-zero-parts-001, money.allocate.invalid-method-001, money.allocate.invalid-scale-001, money.allocate.ratio.invalid-empty-ratios-001, money.allocate.ratio.invalid-fractional-ratio-001, money.allocate.ratio.invalid-malformed-ratio-001, money.allocate.ratio.invalid-negative-ratio-001, money.allocate.ratio.invalid-zero-ratio-001 |
| MONEY-REPRESENTATION-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-amount-001, money.deserialize.missing-currency-001, money.deserialize.positive-001 |
| MONEY-REPRESENTATION-002 | Money | MUST / MUST NOT | COVERED | money.add.deep-positive-scale-001, money.add.large-significant-digits-001, money.deserialize.positive-001, money.divide.terminating-scale-40-001, money.multiply.large-product-growth-001, money.rate.large-percentage-growth-001, money.round.scale-50-half-even-001, money.subtract.large-negative-001 |
| MONEY-REPRESENTATION-003 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-currency-001, money.deserialize.positive-001 |
| MONEY-REPRESENTATION-004 | Money | MUST / MUST NOT | COVERED | money.add.negative-001, money.deserialize.negative-001, money.deserialize.zero-001, money.subtract.large-negative-001 |
| MONEY-REPRESENTATION-005 | Money | MUST / MUST NOT | COVERED | money.compare.equal-trailing-zeros-001 |
| MONEY-REPRESENTATION-006 | Money | MAY | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-001 | Money | MUST / MUST NOT | COVERED | money.round.explicit-scale-001, money.round.invalid-mode-001, money.round.invalid-scale-001, money.round.scale-50-half-even-001 |
| MONEY-ROUNDING-002 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.scale-50-half-even-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-003 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.no-discard-001, money.round.scale-50-half-even-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-004 | Money | MUST / MUST NOT | COVERED | money.round.explicit-scale-001, money.round.scale-50-half-even-001 |
| MONEY-ROUNDING-005 | Money | MAY | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-006 | Money | MUST / MUST NOT | COVERED | money.divide.rounding-required-001 |
| MONEY-ROUNDING-007 | Money | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| MONEY-ROUNDING-008 | Money | MUST / MUST NOT | COVERED | money.round.above-half-positive-001, money.round.below-half-positive-001, money.round.ceiling.negative-001, money.round.ceiling.positive-001, money.round.down.negative-001, money.round.down.positive-001, money.round.explicit-scale-001, money.round.floor.negative-001, money.round.floor.positive-001, money.round.half-even.tie-even-down-001, money.round.half-even.tie-negative-even-001, money.round.half-even.tie-odd-up-001, money.round.half-up.tie-negative-001, money.round.half-up.tie-positive-001, money.round.no-discard-001, money.round.scale-50-half-even-001, money.round.up.negative-001, money.round.up.positive-001 |
| MONEY-ROUNDING-009 | Money | MUST / MUST NOT | COVERED | money.round.no-discard-001 |
| MONEY-SERIALIZATION-001 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-amount-001, money.deserialize.missing-currency-001, money.deserialize.positive-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-002 | Money | MUST / MUST NOT | COVERED | money.deserialize.numeric-amount-001, money.deserialize.positive-001, money.serialize.locale-independent-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-003 | Money | MUST / MUST NOT | COVERED | money.deserialize.exponent-001, money.deserialize.leading-plus-001, money.deserialize.non-finite-001, money.serialize.locale-independent-001 |
| MONEY-SERIALIZATION-004 | Money | MUST / MUST NOT | COVERED | money.deserialize.missing-currency-001, money.serialize.roundtrip-001 |
| MONEY-SERIALIZATION-005 | Money | MUST / MUST NOT | COVERED | money.deserialize.exponent-001, money.deserialize.leading-plus-001, money.deserialize.non-finite-001 |
| MONEY-SERIALIZATION-006 | Money | MAY | COVERED | money.deserialize.unknown-members-001 |
| MONEY-SERIALIZATION-007 | Money | MUST / MUST NOT | COVERED | money.deserialize.unknown-members-001 |
| MONEY-SERIALIZATION-008 | Money | MUST / MUST NOT | COVERED | money.deserialize.positive-001, money.deserialize.unknown-members-001, money.divide.quotient-plain-expansion-001, money.serialize.roundtrip-001 |
| WORKFLOW-ERROR-001 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.transition-rejected-001 |
| WORKFLOW-ERROR-002 | Workflow | MAY | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-ERROR-003 | Workflow | MUST / MUST NOT | COVERED | workflow.terminal.not-inferred-no-outgoing-001, workflow.terminal.transition-rejected-001, workflow.transition.reverse-not-implied-001, workflow.transition.state-identity-exact-001, workflow.transition.undeclared-001 |
| WORKFLOW-ERROR-004 | Workflow | MUST / MUST NOT | COVERED | workflow.import.version-mismatch-001, workflow.transition.version-mismatch-preserves-state-001 |
| WORKFLOW-ERROR-005 | Workflow | MUST / MUST NOT | COVERED | workflow.import.malformed-revision-invalid-instance-001, workflow.import.missing-current-state-invalid-instance-001, workflow.import.undeclared-current-state-001, workflow.transition.error-precedence-invalid-instance-before-version-001, workflow.transition.multiple-current-states-001 |
| WORKFLOW-ERROR-006 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-revision-mismatch-001, workflow.transition.expected-state-mismatch-001 |
| WORKFLOW-ERROR-007 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.error-precedence-conflict-before-terminal-001, workflow.transition.error-precedence-invalid-instance-before-version-001, workflow.transition.error-precedence-invalid-state-before-conflict-001, workflow.transition.error-precedence-terminal-before-invalid-transition-001 |
| WORKFLOW-CONFLICT-001 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-state-omitted-no-default-001 |
| WORKFLOW-CONFLICT-002 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.error-precedence-invalid-state-before-conflict-001, workflow.transition.expected-state-matches-001 |
| WORKFLOW-CONFLICT-003 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-state-mismatch-001 |
| WORKFLOW-CONFLICT-004 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-revision-omitted-no-default-001 |
| WORKFLOW-CONFLICT-005 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-revision-matches-001, workflow.transition.expected-revision-mismatch-001 |
| WORKFLOW-CONFLICT-006 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.bound-older-version-001, workflow.transition.expected-revision-matches-001, workflow.transition.expected-state-matches-001 |
| WORKFLOW-CONFLICT-007 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.expected-revision-mismatch-001, workflow.transition.expected-state-mismatch-001 |
| WORKFLOW-CONFLICT-008 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-GUARD-001 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.pass-001 |
| WORKFLOW-GUARD-002 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001, workflow.guard.multiple-pass-001, workflow.guard.pass-001, workflow.guard.reject-001 |
| WORKFLOW-GUARD-003 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001, workflow.guard.reject-001 |
| WORKFLOW-GUARD-004 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-GUARD-005 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-GUARD-006 | Workflow | MUST / MUST NOT | COVERED | workflow.guard.multiple-order-invariant-001 |
| WORKFLOW-IMPORT-001 | Workflow | MUST / MUST NOT | COVERED | workflow.import.current-state-preserved-001, workflow.import.missing-current-state-invalid-instance-001 |
| WORKFLOW-IMPORT-002 | Workflow | MUST / MUST NOT | COVERED | workflow.import.undeclared-current-state-001 |
| WORKFLOW-IMPORT-003 | Workflow | MUST / MUST NOT | COVERED | workflow.import.version-binding-preserved-001, workflow.import.version-mismatch-001 |
| WORKFLOW-IMPORT-004 | Workflow | MUST / MUST NOT | COVERED | workflow.import.malformed-revision-invalid-instance-001, workflow.import.version-binding-preserved-001 |
| WORKFLOW-IMPORT-005 | Workflow | MUST / MUST NOT | COVERED | workflow.import.current-state-preserved-001, workflow.import.version-binding-preserved-001 |
| WORKFLOW-IMPORT-006 | Workflow | MUST / MUST NOT | COVERED | workflow.import.malformed-revision-invalid-instance-001, workflow.import.missing-current-state-invalid-instance-001, workflow.import.version-mismatch-001 |
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
| WORKFLOW-VERSION-001 | Workflow | MUST / MUST NOT | COVERED | workflow.create.version-missing-invalid-001, workflow.create.versioned-binding-001 |
| WORKFLOW-VERSION-002 | Workflow | MUST / MUST NOT | COVERED | workflow.create.versioned-binding-001 |
| WORKFLOW-VERSION-003 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-VERSION-004 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| WORKFLOW-VERSION-005 | Workflow | MUST / MUST NOT | COVERED | workflow.create.versioned-binding-001 |
| WORKFLOW-VERSION-006 | Workflow | MUST / MUST NOT | COVERED | workflow.create.default-version-sequence-zero-invalid-001 |
| WORKFLOW-VERSION-007 | Workflow | MUST / MUST NOT | COVERED | workflow.create.versioned-binding-001, workflow.import.version-binding-preserved-001 |
| WORKFLOW-VERSION-008 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.bound-older-version-001 |
| WORKFLOW-VERSION-009 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.bound-older-version-001 |
| WORKFLOW-VERSION-010 | Workflow | MUST / MUST NOT | COVERED | workflow.import.version-mismatch-001, workflow.transition.version-mismatch-preserves-state-001 |
| WORKFLOW-VERSION-011 | Workflow | MUST / MUST NOT | COVERED | workflow.transition.bound-older-version-001 |
| WORKFLOW-VERSION-012 | Workflow | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
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
| AUDIT-RELATIONSHIP-001 | Audit | MUST / MUST NOT | COVERED | audit.relationship.corrects.append-001 |
| AUDIT-RELATIONSHIP-002 | Audit | MUST / MUST NOT | COVERED | audit.relationship.corrects.append-001 |
| AUDIT-RELATIONSHIP-003 | Audit | MUST / MUST NOT | COVERED | audit.relationship.all-types-order-001, audit.relationship.corrects.append-001, audit.relationship.invalid-type-001 |
| AUDIT-RELATIONSHIP-004 | Audit | MUST / MUST NOT | COVERED | audit.relationship.self-target-001 |
| AUDIT-RELATIONSHIP-005 | Audit | MUST / MUST NOT | COVERED | audit.relationship.duplicate-identity-001 |
| AUDIT-RELATIONSHIP-006 | Audit | MUST / MUST NOT | COVERED | audit.relationship.corrects.append-001, audit.relationship.unknown-target-001 |
| AUDIT-RELATIONSHIP-007 | Audit | MUST / MUST NOT | COVERED | audit.relationship.import-unknown-target-001 |
| AUDIT-RELATIONSHIP-008 | Audit | MUST / MUST NOT | COVERED | audit.relationship.corrects.append-001, audit.relationship.target-entity-mismatch-001 |
| AUDIT-RELATIONSHIP-009 | Audit | MUST / MUST NOT | COVERED | audit.relationship.all-types-order-001, audit.relationship.corrects.append-001 |
| AUDIT-RELATIONSHIP-010 | Audit | MUST / MUST NOT | COVERED | audit.relationship.redaction-preserves-001 |
| AUDIT-RELATIONSHIP-011 | Audit | MUST / MUST NOT | COVERED | audit.relationship.redaction-invalid-evidence-001, audit.relationship.redaction-preserves-001 |
| AUDIT-RELATIONSHIP-012 | Audit | MUST / MUST NOT | COVERED | audit.relationship.duplicate-identity-001, audit.relationship.invalid-type-001, audit.relationship.redaction-invalid-evidence-001, audit.relationship.redaction-preserves-001, audit.relationship.self-target-001, audit.relationship.target-entity-mismatch-001, audit.relationship.unknown-target-001 |
| AUDIT-RELATIONSHIP-013 | Audit | MUST / MUST NOT | COVERED | audit.relationship.duplicate-identity-001, audit.relationship.import-unknown-target-001, audit.relationship.invalid-type-001, audit.relationship.redaction-invalid-evidence-001, audit.relationship.self-target-001, audit.relationship.target-entity-mismatch-001, audit.relationship.unknown-target-001 |
| AUDIT-RELATIONSHIP-014 | Audit | MUST / MUST NOT | COVERED | audit.relationship.all-types-order-001 |
| APPROVAL-CHAIN-001 | Approvals | MUST / MUST NOT | COVERED | approval.chain.empty-requirements-invalid-001 |
| APPROVAL-CHAIN-002 | Approvals | MUST / MUST NOT | COVERED | approval.chain.missing-mode-invalid-001 |
| APPROVAL-CHAIN-003 | Approvals | MUST / MUST NOT | COVERED | approval.chain.pending-001, approval.chain.unordered-not-sequential-001 |
| APPROVAL-CHAIN-004 | Approvals | MUST / MUST NOT | COVERED | approval.chain.sequential-not-active-001 |
| APPROVAL-CHAIN-005 | Approvals | MUST / MUST NOT | COVERED | approval.chain.all-approved-001, approval.chain.pending-001 |
| APPROVAL-CHAIN-006 | Approvals | MUST / MUST NOT | COVERED | approval.chain.pending-001 |
| APPROVAL-CHAIN-007 | Approvals | MUST / MUST NOT | COVERED | approval.chain.rejected-001 |
| APPROVAL-CHAIN-008 | Approvals | MUST / MUST NOT | COVERED | approval.chain.deterministic-declared-order-001 |
| APPROVAL-CHAIN-009 | Approvals | MUST / MUST NOT | COVERED | approval.chain.duplicate-requirement-invalid-001 |
| APPROVAL-COMPOSITION-001 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001, approval.composition.structure-empty-stage-kind-invalid-001 |
| APPROVAL-COMPOSITION-002 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001, approval.composition.structure-invalid-duplicates-001 |
| APPROVAL-COMPOSITION-003 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001, approval.composition.structure-empty-stage-kind-invalid-001 |
| APPROVAL-COMPOSITION-004 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001, approval.composition.structure-empty-stage-kind-invalid-001 |
| APPROVAL-COMPOSITION-005 | Approvals | MUST / MUST NOT | COVERED | approval.composition.structure-invalid-duplicates-001 |
| APPROVAL-COMPOSITION-006 | Approvals | MUST / MUST NOT | COVERED | approval.composition.structure-cycle-depth-invalid-001 |
| APPROVAL-COMPOSITION-007 | Approvals | MUST / MUST NOT | COVERED | approval.composition.structure-cycle-depth-invalid-001 |
| APPROVAL-COMPOSITION-008 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001 |
| APPROVAL-COMPOSITION-009 | Approvals | MUST / MUST NOT | COVERED | approval.composition.unresolved-applicability-complete-validation-001 |
| APPROVAL-COMPOSITION-010 | Approvals | MUST / MUST NOT | COVERED | approval.composition.error-priority-context-before-state-001, approval.composition.error-priority-structure-over-context-001 |
| APPROVAL-COMPOSITION-011 | Approvals | MUST / MUST NOT | COVERED | approval.composition.any-of-inapplicable-child-pending-001, approval.composition.none-applicable-approved-001, approval.composition.quorum-fixed-threshold-unreachable-001 |
| APPROVAL-COMPOSITION-012 | Approvals | MUST / MUST NOT | COVERED | approval.composition.any-of-inapplicable-child-pending-001, approval.composition.none-applicable-approved-001 |
| APPROVAL-COMPOSITION-013 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001 |
| APPROVAL-COMPOSITION-014 | Approvals | MUST / MUST NOT | COVERED | approval.composition.any-of-inapplicable-child-pending-001 |
| APPROVAL-COMPOSITION-015 | Approvals | MUST / MUST NOT | COVERED | approval.composition.all-of-pending-001, approval.composition.quorum-reachable-pending-001 |
| APPROVAL-COMPOSITION-016 | Approvals | MUST / MUST NOT | COVERED | approval.composition.stage-first-pending-actionable-001, approval.composition.stage-inapplicable-allows-later-001 |
| APPROVAL-COMPOSITION-017 | Approvals | MUST / MUST NOT | COVERED | approval.composition.stage-parallel-rejected-001 |
| APPROVAL-COMPOSITION-018 | Approvals | MUST / MUST NOT | COVERED | approval.composition.stage-first-pending-actionable-001, approval.composition.stage-parallel-rejected-001 |
| APPROVAL-COMPOSITION-019 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-reachable-pending-001, approval.composition.stage-first-pending-actionable-001 |
| APPROVAL-COMPOSITION-020 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-member-specific-evidence-001 |
| APPROVAL-COMPOSITION-021 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-ineffective-decision-not-counted-001 |
| APPROVAL-COMPOSITION-022 | Approvals | MUST / MUST NOT | COVERED | approval.composition.none-applicable-approved-001, approval.composition.stage-inapplicable-allows-later-001 |
| APPROVAL-COMPOSITION-023 | Approvals | MUST / MUST NOT | COVERED | approval.composition.stage-inapplicable-allows-later-001, approval.composition.stage-parallel-rejected-001 |
| APPROVAL-COMPOSITION-024 | Approvals | MUST / MUST NOT | COVERED | approval.composition.stage-first-pending-actionable-001, approval.composition.unresolved-applicability-complete-validation-001 |
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
| APPROVAL-ERROR-006 | Approvals | MUST / MUST NOT | COVERED | approval.validity.withdraw-duplicate-invalid-001 |
| APPROVAL-ERROR-007 | Approvals | MUST / MUST NOT | COVERED | approval.validity.expiration-missing-context-001 |
| APPROVAL-ERROR-008 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-invalid-member-voter-001, approval.composition.quorum-opposing-effective-votes-invalid-001, approval.composition.structure-cycle-depth-invalid-001, approval.composition.structure-empty-stage-kind-invalid-001, approval.composition.structure-invalid-duplicates-001 |
| APPROVAL-ERROR-009 | Approvals | MUST / MUST NOT | COVERED | approval.composition.error-priority-context-before-state-001, approval.composition.error-priority-structure-over-context-001, approval.composition.unresolved-applicability-complete-validation-001 |
| APPROVAL-ERROR-010 | Approvals | MUST / MUST NOT | COVERED | approval.composition.error-priority-context-before-state-001, approval.composition.error-priority-structure-over-context-001, approval.composition.quorum-opposing-effective-votes-invalid-001 |
| APPROVAL-QUORUM-001 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-fixed-threshold-unreachable-001, approval.composition.quorum-two-of-three-approved-boundary-001 |
| APPROVAL-QUORUM-002 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-member-specific-evidence-001, approval.composition.quorum-two-of-three-approved-boundary-001 |
| APPROVAL-QUORUM-003 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-two-of-three-approved-boundary-001 |
| APPROVAL-QUORUM-004 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-ineffective-decision-not-counted-001 |
| APPROVAL-QUORUM-005 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-two-of-three-approved-boundary-001 |
| APPROVAL-QUORUM-006 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-fixed-threshold-unreachable-001, approval.composition.quorum-reachable-pending-001 |
| APPROVAL-QUORUM-007 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-invalid-member-voter-001 |
| APPROVAL-QUORUM-008 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-invalid-member-voter-001 |
| APPROVAL-QUORUM-009 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-opposing-effective-votes-invalid-001 |
| APPROVAL-QUORUM-010 | Approvals | MUST / MUST NOT | COVERED | approval.composition.quorum-ineffective-decision-not-counted-001, approval.composition.quorum-member-specific-evidence-001, approval.composition.quorum-opposing-effective-votes-invalid-001 |
| APPROVAL-REQUIREMENT-001 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-identity-001 |
| APPROVAL-REQUIREMENT-002 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-subject-001 |
| APPROVAL-REQUIREMENT-003 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.missing-eligibility-001 |
| APPROVAL-REQUIREMENT-004 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.approved-001, approval.requirement.rejected-001 |
| APPROVAL-REQUIREMENT-005 | Approvals | MUST / MUST NOT | COVERED | approval.requirement.pending-001 |
| APPROVAL-REQUIREMENT-006 | Approvals | MUST / MUST NOT | COVERED | approval.decision.ineligible-actor-001 |
| APPROVAL-REQUIREMENT-007 | Approvals | MAY | NOT DIRECTLY TESTABLE | — |
| APPROVAL-VALIDITY-001 | Approvals | MUST / MUST NOT | COVERED | approval.validity.decision-superseded-not-counted-001, approval.validity.withdrawn-not-counted-001 |
| APPROVAL-VALIDITY-002 | Approvals | MUST / MUST NOT | COVERED | approval.validity.decision-supersession-preserves-history-001, approval.validity.requirement-supersession-preserves-history-001, approval.validity.withdraw-preserves-history-001 |
| APPROVAL-VALIDITY-003 | Approvals | MUST / MUST NOT | COVERED | approval.validity.stale-revision-not-effective-001, approval.validity.unchanged-relevant-facts-effective-001 |
| APPROVAL-VALIDITY-004 | Approvals | MUST / MUST NOT | COVERED | approval.validity.withdraw-preserves-history-001, approval.validity.withdrawn-not-counted-001 |
| APPROVAL-VALIDITY-005 | Approvals | MUST / MUST NOT | COVERED | approval.validity.withdraw-duplicate-invalid-001 |
| APPROVAL-VALIDITY-006 | Approvals | MUST / MUST NOT | COVERED | approval.validity.withdraw-preserves-history-001 |
| APPROVAL-VALIDITY-007 | Approvals | MUST / MUST NOT | COVERED | approval.validity.expiration-before-boundary-001, approval.validity.expiration-missing-context-001 |
| APPROVAL-VALIDITY-008 | Approvals | MUST / MUST NOT | COVERED | approval.validity.expiration-before-boundary-001, approval.validity.expiration-equivalent-offset-001 |
| APPROVAL-VALIDITY-009 | Approvals | MUST / MUST NOT | COVERED | approval.validity.expiration-at-boundary-001, approval.validity.expiration-before-boundary-001, approval.validity.expiration-equivalent-offset-001 |
| APPROVAL-VALIDITY-010 | Approvals | MUST / MUST NOT | COVERED | approval.validity.decision-superseded-not-counted-001, approval.validity.decision-supersession-preserves-history-001 |
| APPROVAL-VALIDITY-011 | Approvals | MUST / MUST NOT | COVERED | approval.validity.requirement-superseded-not-transferred-001, approval.validity.requirement-supersession-preserves-history-001 |
| APPROVAL-VALIDITY-012 | Approvals | MUST / MUST NOT | COVERED | approval.validity.withdraw-duplicate-invalid-001 |
| ENTITY-AUDIT-001 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-AUDIT-002 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-DEFINITION-001 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-ERROR-001 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.mutate.immutable-financial-field-001, entity.transition.rejected-preserves-entity-001, entity.validation.complete-result-001 |
| ENTITY-ERROR-002 | Entities | SHOULD / SHOULD NOT | COVERED | entity.validation.complete-result-001 |
| ENTITY-ERROR-003 | Entities | MAY | NOT DIRECTLY TESTABLE | — |
| ENTITY-ERROR-004 | Entities | MUST / MUST NOT | COVERED | entity.transition.rejected-preserves-entity-001 |
| ENTITY-EVOLUTION-001 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.reversal.audit-001 |
| ENTITY-EVOLUTION-002 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-003 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-004 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-005 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-EVOLUTION-006 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.ineligible-001, entity.evolution.void.ineligible-001 |
| ENTITY-EVOLUTION-007 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-008 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-009 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-010 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.ineligible-001 |
| ENTITY-EVOLUTION-011 | Entities | MUST / MUST NOT | COVERED | entity.evolution.reversal.audit-001, entity.evolution.reversal.duplicate-001 |
| ENTITY-EVOLUTION-012 | Entities | MUST / MUST NOT | COVERED | entity.evolution.reversal.audit-001, entity.evolution.reversal.duplicate-001 |
| ENTITY-EVOLUTION-013 | Entities | MUST / MUST NOT | COVERED | entity.evolution.invalid-related-identity-001, entity.evolution.reversal.audit-001 |
| ENTITY-EVOLUTION-014 | Entities | MUST / MUST NOT | COVERED | entity.evolution.reversal.duplicate-001 |
| ENTITY-EVOLUTION-015 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.reversal.audit-001 |
| ENTITY-EVOLUTION-016 | Entities | MUST / MUST NOT | COVERED | entity.evolution.void.audit-001 |
| ENTITY-EVOLUTION-017 | Entities | MUST / MUST NOT | COVERED | entity.evolution.void.audit-001 |
| ENTITY-EVOLUTION-018 | Entities | MUST / MUST NOT | COVERED | entity.evolution.void.ineligible-001 |
| ENTITY-EVOLUTION-019 | Entities | MUST / MUST NOT | COVERED | entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-020 | Entities | MUST / MUST NOT | COVERED | entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-021 | Entities | MUST / MUST NOT | COVERED | entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-022 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.reversal.audit-001, entity.evolution.void.audit-001, entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-023 | Entities | MUST / MUST NOT | COVERED | entity.evolution.audit-failure-001, entity.evolution.correction.ineligible-001, entity.evolution.invalid-related-identity-001, entity.evolution.reversal.duplicate-001, entity.evolution.stale-revision-001, entity.evolution.void.ineligible-001 |
| ENTITY-EVOLUTION-024 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.ineligible-001, entity.evolution.reversal.duplicate-001, entity.evolution.void.ineligible-001 |
| ENTITY-EVOLUTION-025 | Entities | MUST / MUST NOT | COVERED | entity.evolution.stale-revision-001 |
| ENTITY-EVOLUTION-026 | Entities | MUST / MUST NOT | COVERED | entity.evolution.invalid-related-identity-001 |
| ENTITY-EVOLUTION-027 | Entities | MUST / MUST NOT | COVERED | entity.evolution.audit-failure-001 |
| ENTITY-EVOLUTION-028 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-EVOLUTION-029 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.reversal.audit-001, entity.evolution.void.audit-001, entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-030 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001 |
| ENTITY-EVOLUTION-031 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-032 | Entities | MUST / MUST NOT | COVERED | entity.evolution.correction.audit-001, entity.evolution.reversal.audit-001, entity.evolution.void.audit-001, entity.evolution.supersession.currentness-001 |
| ENTITY-EVOLUTION-033 | Entities | MUST / MUST NOT | COVERED | entity.evolution.audit-failure-001 |
| ENTITY-IDENTITY-001 | Entities | MUST / MUST NOT | COVERED | entity.create.initial-lifecycle-001 |
| ENTITY-IDENTITY-002 | Entities | MUST / MUST NOT | COVERED | entity.mutate.identity-and-state-protected-001, entity.transition.success-identity-stable-001 |
| ENTITY-IDENTITY-003 | Entities | MUST / MUST NOT | COVERED | entity.create.opaque-identity-preserved-001 |
| ENTITY-IDENTITY-004 | Entities | MUST / MUST NOT | COVERED | entity.mutate.display-number-not-identity-001 |
| ENTITY-IDENTITY-005 | Entities | MUST / MUST NOT | NOT DIRECTLY TESTABLE | — |
| ENTITY-IDENTITY-006 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-001 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-002 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-003 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001, entity.import.missing-mapping-invalid-identity-001 |
| ENTITY-IMPORT-004 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-005 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-006 | Entities | MUST / MUST NOT | COVERED | entity.import.expected-conflict-version-conflict-001, entity.import.expected-revision-conflict-001, entity.import.identity-mapping-preserved-001 |
| ENTITY-IMPORT-007 | Entities | MUST / MUST NOT | COVERED | entity.import.expected-conflict-version-conflict-001, entity.import.expected-revision-conflict-001, entity.import.expected-state-conflict-001 |
| ENTITY-IMPORT-008 | Entities | MUST / MUST NOT | COVERED | entity.import.expected-conflict-version-conflict-001, entity.import.expected-revision-conflict-001, entity.import.expected-state-conflict-001, entity.import.missing-mapping-invalid-identity-001 |
| ENTITY-IMPORT-009 | Entities | MUST / MUST NOT | COVERED | entity.import.missing-mapping-invalid-identity-001 |
| ENTITY-IMPORT-010 | Entities | MUST / MUST NOT | COVERED | entity.import.missing-mapping-invalid-identity-001 |
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
| ENTITY-REVISION-001 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-REVISION-002 | Entities | MUST / MUST NOT | COVERED | entity.import.expected-conflict-version-conflict-001, entity.import.expected-revision-conflict-001 |
| ENTITY-REVISION-003 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-REVISION-004 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-REVISION-005 | Entities | MUST / MUST NOT | COVERED | entity.import.identity-mapping-preserved-001 |
| ENTITY-REVISION-006 | Entities | MUST / MUST NOT | COVERED | entity.import.expected-conflict-version-conflict-001, entity.import.expected-revision-conflict-001, entity.import.identity-mapping-preserved-001 |
| ENTITY-REVISION-007 | Entities | MUST / MUST NOT | COVERED | entity.import.missing-mapping-invalid-identity-001 |
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
| ENTITY-IDENTITY-006 | COVERED | `entity.import.identity-mapping-preserved-001` observes explicit mapping evidence that preserves stable FinKore Entity identity while retaining opaque source identity. |
| ENTITY-IMPORT-001 to ENTITY-IMPORT-006 | COVERED | Import vectors observe stable FinKore identity preservation, source identity mapping evidence, current and historical business revision preservation, and distinct conflict-version preservation. |
| ENTITY-IMPORT-007 to ENTITY-IMPORT-009 | COVERED | Import vectors reject stale expected state, stale expected business revision, stale expected conflict version, and missing mapping evidence with the required portable Entity errors and no partial import result. |
| ENTITY-IMPORT-010 | COVERED | `entity.import.missing-mapping-invalid-identity-001` observes that the normalized error surface contains only the portable code and does not expose the supplied source identity value. |
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
| ENTITY-REVISION-001 to ENTITY-REVISION-006 | COVERED | `entity.import.identity-mapping-preserved-001` and the expected-revision/conflict-version contrast vectors observe opaque caller-supplied business revisions, stable Entity identity qualification, historical revision preservation, and separation from conflict-version tokens. |
| ENTITY-REVISION-007 | COVERED | `entity.import.missing-mapping-invalid-identity-001` covers invalid identity handling for malformed import evidence; implementation unit tests additionally cover duplicate and identity-conflicting revision observations. |

## Critical financial requirements

| Requirement | Critical behavior | Mutation that should be killed |
| --- | --- | --- |
| MONEY-ERROR-003 | Currency mismatch rejection and portable code. | Remove currency compatibility check. |
| MONEY-ARITHMETIC-007 | Exact base-10 arithmetic. | Use binary floating point or implicit minor-unit rounding. |
| MONEY-ROUNDING-003 | Six exact portable rounding modes. | Replace HALF_EVEN with HALF_UP or negative FLOOR with DOWN. |
| MONEY-RATE-002 | Exact percentage-to-decimal Rate conversion. | Treat a percentage value as the direct scalar or divide by the wrong factor. |
| MONEY-RATE-003 | Exact Rate application preserves Money currency. | Ignore the Rate, change the currency, or apply addition instead of multiplication. |
| MONEY-RATE-005 | Exact Rate products are preserved without implicit minor-unit rounding. | Round every Rate result to currency minor units. |
| MONEY-RATE-006 | Explicit Rate rounding is applied after exact multiplication. | Round before multiplication or substitute the requested rounding mode. |
| MONEY-RATE-009 | Rate application leaves the source Money operand unchanged on success and failure. | Mutate the source Money while computing or rejecting a Rate result. |
| MONEY-ALLOCATION-006 | Source totals unrepresentable as whole allocation units at the target scale are rejected without rounding. | Silently round the source before allocation or accept precision loss. |
| MONEY-ALLOCATION-008 | Allocated outputs sum exactly to the source Money amount. | Drop, duplicate, create, or destroy one allocation unit. |
| MONEY-ALLOCATION-010, MONEY-ALLOCATION-011 | Remainders are assigned to earliest declared positions, including negative-source magnitude. | Assign remainder to the last position, ignore declared order, or use positive-only logic for negatives. |
| MONEY-ALLOCATION-013 | Allocation leaves the source Money operand unchanged on success and failure. | Mutate the source Money while computing or rejecting allocation. |
| MONEY-ERROR-008 | Invalid allocation requests use the allocation-specific portable error code. | Collapse invalid counts, ratios, methods, or target scales into amount, rounding, or implementation-specific errors. |
| WORKFLOW-TRANSITION-003 | Declared directed transitions only. | Ignore current Source State. |
| WORKFLOW-TRANSITION-006 | State preservation after rejection. | Assign Target State before validation. |
| WORKFLOW-TERMINAL-003 | No transition request may leave an explicitly terminal State. | Remove or invert the current-State terminal check. |
| WORKFLOW-VERSION-002, WORKFLOW-VERSION-003, WORKFLOW-VERSION-005 | Definition/version identities are opaque, stable, and not reused for changed semantics. | Infer behavior from identifier format, storage position, timestamps, state names, or transition lists; reuse a version identity after changing declared behavior. |
| WORKFLOW-VERSION-008, WORKFLOW-VERSION-009, WORKFLOW-VERSION-011 | Versioned instances remain governed by the bound definition version. | Evaluate an existing instance against the latest definition, let a newer version add/remove old-instance transitions, or change binding during transition. |
| WORKFLOW-VERSION-010, WORKFLOW-ERROR-004 | Definition/version mismatch fails with the portable mismatch code and preserves state and binding. | Ignore supplied-version mismatch, return transition/guard/terminal errors first, or mutate current state or binding on failure. |
| WORKFLOW-IMPORT-001, WORKFLOW-IMPORT-005 | Import observes supplied existing state without replaying or creating a transition. | Infer initial state, evaluate guards, append audit evidence, or report a state change during import. |
| WORKFLOW-IMPORT-003, WORKFLOW-IMPORT-004, WORKFLOW-ERROR-005 | Versioned import preserves explicit binding and opaque instance revision without invention or storage interpretation. | Invent binding/revision, accept missing binding, derive revision from transition count or storage version, or collapse malformed instance shape into a transition error. |
| WORKFLOW-CONFLICT-001, WORKFLOW-CONFLICT-004 | Omitted expected-state/revision preconditions do not imply defaults. | Treat omission as initial/latest state or storage revision, or reject because a caller omitted an optional precondition. |
| WORKFLOW-CONFLICT-003, WORKFLOW-CONFLICT-005, WORKFLOW-CONFLICT-007, WORKFLOW-ERROR-006 | Expected-state or expected-revision conflicts fail with the portable conflict code and preserve state, binding, and revision. | Ignore stale expected values, accept missing observed revision as matched, return invalid-transition/terminal/guard codes first, or mutate state/binding/revision on conflict. |
| WORKFLOW-ERROR-007 | Error precedence is deterministic across versioning, import, conflict, terminal, transition, and guard failures. | Let branch order choose error code, report terminal/transition/guard before structural or conflict failures, or invert terminal precedence over invalid transition. |
| AUDIT-APPEND-001 | Append-only committed history. | Replace or remove a committed event. |
| AUDIT-REDACTION-002, AUDIT-REDACTION-003, AUDIT-REDACTION-006 | Redacted representation remains distinguishable, preserves event meaning, and records evidence. | Expose protected values, collapse redaction to null or absence, change event identity, or omit evidence. |
| AUDIT-RELATIONSHIP-005, AUDIT-RELATIONSHIP-012 | Relationship identity is unique and rejected relationship requests do not create partial state. | Accept duplicate relationship identities or append relationship-bearing invalid events. |
| AUDIT-RELATIONSHIP-006, AUDIT-RELATIONSHIP-007, AUDIT-RELATIONSHIP-008 | Relationship targets must exist and match the recorded target Entity. | Accept absent target events or ignore target Entity mismatches. |
| AUDIT-RELATIONSHIP-009, AUDIT-RELATIONSHIP-010, AUDIT-RELATIONSHIP-011 | Relationships are preserved through append and redaction evidence. | Drop, rewrite, sort, or conceal relationship identity/type/target during append or redaction. |
| APPROVAL-DECISION-003 | Validity against policy-relevant facts. | Ignore changed relevant facts. |
| APPROVAL-VALIDITY-004, APPROVAL-VALIDITY-005, APPROVAL-VALIDITY-012 | Withdrawal affects only current effectiveness and rejected lifecycle requests preserve history. | Count withdrawn Decisions, erase withdrawn Decisions, accept duplicate withdrawals, or append partial lifecycle evidence on failure. |
| APPROVAL-VALIDITY-007, APPROVAL-VALIDITY-009 | Expiration uses explicit injected instants and an exclusive boundary. | Use host time, ignore equivalent offsets, or treat the expiration boundary as still effective. |
| APPROVAL-VALIDITY-010, APPROVAL-VALIDITY-011 | Supersession preserves history while removing current effectiveness from superseded Decisions or Requirements. | Count superseded Decisions, transfer Decisions to successor Requirements, or rewrite historical observations. |
| APPROVAL-COMPOSITION-013, APPROVAL-COMPOSITION-014 | All-of and any-of group outcomes follow declared member states and do not collapse pending members into approval or rejection. | Treat any rejected any-of member as group rejection, or treat any approved all-of member as group approval. |
| APPROVAL-COMPOSITION-016, APPROVAL-COMPOSITION-019 | Ordered stages expose only the first non-approved stage as actionable. | Allow later-stage action before earlier approval or report actionable requirements from later stages. |
| APPROVAL-COMPOSITION-021, APPROVAL-QUORUM-004 | Composition and quorum reuse current-effectiveness and never count ineffective Decisions. | Count withdrawn, expired, superseded, stale, ineligible, or rejected Decisions toward group approval. |
| APPROVAL-QUORUM-001, APPROVAL-QUORUM-002, APPROVAL-QUORUM-003, APPROVAL-QUORUM-005, APPROVAL-QUORUM-006 | Quorum thresholds count distinct effective eligible voters with exact N-of-M boundary behavior. | Use `>` instead of `>=`, count duplicate voters twice, infer abstentions, or reject while threshold can still be met. |
| APPROVAL-QUORUM-002, APPROVAL-QUORUM-007, APPROVAL-QUORUM-008, APPROVAL-ERROR-008 | Quorums have explicit distinct voter identities on Requirement members; a group's outcome is not voter evidence. | Accept child groups or missing/role-only voter identities, accept duplicate declared voters, count an eligible but undeclared voter, or change the invalid-definition error code. |
| APPROVAL-QUORUM-009, APPROVAL-QUORUM-010 | Reject opposing effective votes for a named voter; derive its state only from matching current evidence. | Select latest/first vote or favor either outcome; hide conflicts behind a satisfied branch; use another Actor's rejection or approval; double-count repeated evidence; mutate history while resolving a conflict. |
| APPROVAL-QUORUM-001, APPROVAL-QUORUM-006, APPROVAL-ERROR-008 | Validate N against declared M; retain N after applicability filtering and reject a nonempty quorum when approvals plus pending capacity cannot reach N. | Lower N after filtering, compare N to applicable membership during definition validation, use <= at the reachability boundary, or return INVALID_CHAIN/PENDING for an unreachable nonempty quorum. |
| APPROVAL-COMPOSITION-011, APPROVAL-COMPOSITION-012, APPROVAL-COMPOSITION-014, APPROVAL-COMPOSITION-022 | Entirely inapplicable child groups contribute nothing to their parent; an entirely inapplicable valid composition has no approval obligation. | Count a skipped child as an approving ANY_OF branch, fail to propagate nested omission, reject an all-inapplicable composition, fabricate Decisions, or treat missing facts/invalid definitions as exemptions. |
| APPROVAL-COMPOSITION-017, APPROVAL-COMPOSITION-018, APPROVAL-COMPOSITION-023 | Applicable parallel groups combine as ALL_OF; a stage with no applicable groups adds no obligation; the first non-approved stage determines the composition outcome. | Use ANY_OF between stage groups, let pending mask a same-stage rejection, block on an inapplicable stage, turn group order into prerequisites, or let later rejection override an earlier pending stage. |
| APPROVAL-COMPOSITION-001, APPROVAL-COMPOSITION-007, APPROVAL-ERROR-008 | Stage lists and stage group declarations are nonempty; every standalone or staged root starts at group depth one, bounded to four along every path. | Accept an empty stage/list, accept an unresolved stage root, count stages as groups, ignore roots in depth counting, permit depth five, or accumulate depth across parallel roots/stages. |
| APPROVAL-COMPOSITION-009, APPROVAL-COMPOSITION-024 | Validate all declared structure, applicability, and required evidence before an outcome, including later stages and otherwise unnecessary alternatives. | Return early approval/pending/rejection while another branch is invalid, treat missing state as PENDING, treat unresolved applicability as exemption, or activate later stages during validation. |
| APPROVAL-COMPOSITION-019 | Report unique pending applicable Requirements only through pending groups in the first pending stage, in recursive declared order; terminal outcomes expose none. | Include later stages, descend into satisfied/rejected branches, suppress an eligible occurrence because of an earlier ineligible path, duplicate IDs, sort names, or report actionables after approval/rejection. |
| APPROVAL-COMPOSITION-008, APPROVAL-COMPOSITION-010, APPROVAL-ERROR-009, APPROVAL-ERROR-010 | Return the highest-priority applicable error category: structure, applicability, required context, then state/effectiveness. | Collapse context into INVALID_CHAIN, let traversal order choose the category, confuse structural with evidence INVALID_CHAIN priority, or expose restricted diagnostics. |
| ENTITY-IDENTITY-002 | Lifecycle-stable identity. | Generate a new ID after mutation. |
| ENTITY-MUTABILITY-002 | Configured immutability. | Skip current-State mutability check. |
| ENTITY-VALIDATION-003, ENTITY-VALIDATION-004, ENTITY-VALIDATION-006 | Complete validation before observable mutation with the portable validation code. | Stop after the first failed rule, return success for invalid data, apply part of a rejected mutation, or expose sensitive field values in findings. |
| ENTITY-EVOLUTION-001, ENTITY-EVOLUTION-008, ENTITY-EVOLUTION-011, ENTITY-EVOLUTION-021 | Evolution preserves stable identity and historical financial facts. | Rewrite the original Entity identity or facts during correction, reversal, or supersession. |
| ENTITY-EVOLUTION-014, ENTITY-EVOLUTION-023 | Duplicate or rejected evolution requests do not create partial state. | Create a second relation, mutate currentness, or alter source/related data during a rejected evolution request. |
| ENTITY-EVOLUTION-016, ENTITY-EVOLUTION-017 | Void is nullification without deletion. | Delete the source Entity or erase original facts/history while voiding. |
| ENTITY-EVOLUTION-020 | Supersession currentness follows the declared scope. | Leave a superseded predecessor current or mark an unrelated Entity non-current. |
| ENTITY-EVOLUTION-024, ENTITY-EVOLUTION-027 | Evolution errors use the specified portable error category and preserve primary domain codes. | Collapse state conflicts, validation failures, or downstream domain failures into an implementation-specific or generic error. |
| ENTITY-IMPORT-001, ENTITY-IMPORT-003, ENTITY-IMPORT-005 | Import preserves FinKore identity and explicit mapping evidence. | Replace stable Entity identity with Source Identity, accept incomplete mapping evidence, or map evidence to a different Entity. |
| ENTITY-REVISION-004, ENTITY-IMPORT-006 | Import preserves current and historical business revision observations. | Drop historical revisions, overwrite the current revision, or derive revision identity from state/order/storage values. |
| ENTITY-REVISION-006, ENTITY-IMPORT-007 | Business revision and conflict version remain distinct precondition values. | Use conflict version as business revision, use business revision as conflict version, or bypass stale expected values. |
| ENTITY-IMPORT-008, ENTITY-IMPORT-010 | Failed import returns no partial import and exposes safe diagnostics. | Return partial import output after failure or leak source identity/financial values in normalized error details. |


## Conformance gaps

- Money: allocation normative semantics and portable invalid-allocation error semantics are specified, vector-covered, implemented by the TypeScript reference implementation, and passing conformance for Draft 0.2. Draft 0.3 explicitly deferred precision/overflow limits, capability reporting, private or non-fiat currency namespaces, and currency-recommended/minor-unit scale guidance; these remain outside the closed Draft 0.1 plus Draft 0.2 Money Rates and Allocation scope.
- Workflow: Draft 0.3 Workflow definition identity, version identity, immutable instance binding, older-version observation, version-mismatch semantics, import of existing state/version observations, and expected-state/revision conflict preconditions are specified, vector-covered, implemented by the TypeScript reference implementation, and passing through the conformance adapter. Version identity reuse, Entity/storage separation, safe diagnostic disclosure, and non-locking/non-concurrency guarantees are not directly testable through one portable vector and remain subject to implementation, architecture, and review checks. External fact capture, definition migration, state mapping across versions, transition identifiers, storage locking, and distributed concurrency remain open.
- Audit: Draft 0.2 Audit Relationships are specified, vector-covered, implemented by the TypeScript reference implementation, and passing conformance. Draft 0.3 explicitly deferred standardized reason, source, correlation, causation, and trace-context metadata; generic Audit Event metadata remains available only as non-standardized context under `AUDIT-EVENT-006`. Unknown-Actor interchange, domain paths, structured summaries, production redaction encoding, ingestion time, generic related links, relationship redaction policy, and causal sequencing remain open.
- Approvals: Draft 0.2 Approval Validity withdrawal, expiration, supersession, explicit current-effectiveness context, and lifecycle failure atomicity are specified, vector-covered, implemented by the TypeScript reference implementation, and passing conformance. Draft 0.3 composition requirements define explicit quorum membership, fixed thresholds with nonempty unreachable-quorum rejection, entirely inapplicable group treatment, stage aggregation and structure, bounded group depth, complete validation, staged actionability, deterministic error precedence, opposing effective votes, and member-specific evidence. These requirements are manifest-vector-covered, implemented through the TypeScript core and adapter, and mutation-hardened with zero classified critical survivors. Draft 0.3 explicitly deferred a portable condition expression/operator model; existing condition behavior remains the explicit required-fact/result boundary only. Rich condition syntax, delegation, escalation, approval-definition migration, dynamic approver resolution, and unrestricted dependency graphs remain open for future drafts.
- Entities: Draft 0.2 Entity Evolution terminology, correction, reversal, void, supersession, currentness, failure atomicity, mandatory Audit evidence, and portable error mapping are specified, vector-covered, implemented by the TypeScript reference implementation, and passing conformance. Draft 0.3 Entity Revision and Import business revision identity, source identity mapping, conflict-version separation, and expected-state/revision/conflict-version preconditions are specified and vector-covered. Concrete fields, composing-domain lifecycle policy, full validation catalog, cross-entity identity registries, concurrency, cancellation, adjustment, replacement, amendment, concrete migration formats, and concrete ledger posting behavior remain outside the current implemented Core. The current TypeScript reference implementation covers the conformance-local Entity identity, lifecycle, mutability, validation, evolution, and import vectors. Remaining Entity requirements classified as not directly testable are composing-domain, optional diagnostic, or registry obligations without a standalone portable Entity operation.

### Draft 0.3 Approval review gaps

`APPROVAL-QUORUM-009` and `APPROVAL-QUORUM-010` close the identified
opposing-vote ambiguity and preserve member-specific counting, pending capacity,
and actionability. There are zero currently identified blocking specification
gaps in this inventory. This does not close future-draft questions outside it.

All 37 directly testable Draft 0.3 composition/quorum/error requirements have
manifest-listed vectors and pass against the TypeScript reference implementation
through the conformance adapter. Focused mutation hardening recorded zero
critical survivors for the Advanced Approvals composition surface. Closed Draft
0.1/0.2 coverage classifications and vector references are unchanged.

### Draft 0.3 Workflow versioning review gaps

All 26 directly testable Draft 0.3 Workflow version/import/conflict/error
requirements have manifest-listed vectors and pass against the TypeScript
reference implementation through the conformance adapter. The scoped Workflow
inventory has 0 UNCOVERED and 0 BLOCKING SPEC GAP rows. The 9 Workflow rows
classified as NOT DIRECTLY TESTABLE are the Draft 0.1
Workflow authoring or non-observable requirements plus `WORKFLOW-VERSION-003`,
`WORKFLOW-VERSION-004`, `WORKFLOW-VERSION-012`, and `WORKFLOW-CONFLICT-008`;
none hides a feasible deterministic vector for the closed Workflow 0.3 slice.
Focused mutation hardening recorded zero critical survivors for the Workflow
definition/version identity, import, instance binding/mismatch, and
expected-state/revision conflict surface. Canonical Agentic metadata for these
Draft 0.3 Workflow refinements is aligned; the canonical
`finkore.workflow.transition` descriptor includes version binding and
expected-state/revision preconditions, while `workflow.import` remains
conformance-local. Closed Draft 0.1/0.2 coverage classifications and vector
references are unchanged.

## Readiness

**READY FOR CONFORMANCE RUNNER**

The manifest, schema, operation catalog, exact comparison rules, normalized
errors, deterministic context, and valid requirement references are sufficient
for the current runner. Current directly testable requirements are covered by
manifest-listed vectors, and the TypeScript, Python, and Java implementations
execute the complete manifest scope.
