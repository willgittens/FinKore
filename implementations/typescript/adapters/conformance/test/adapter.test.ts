// SPDX-License-Identifier: MPL-2.0
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createConformanceRunner } from '@finkore/conformance-runner'
import { adapter as cliAdapter, createTypeScriptConformanceAdapter } from '../src/adapter.js'

const manifestPath = resolve(import.meta.dirname, '../../../../../conformance/manifest.json')

describe('TypeScript conformance adapter', () => {
  it('exports a concrete adapter for the conformance CLI', () => {
    expect(cliAdapter.supports('finkore.entity.create')).toBe(true)
  })

  it('supports current Core 0.9 Money, Workflow, Audit, Approval, and Entity operations', () => {
    const adapter = createTypeScriptConformanceAdapter()

    expect(adapter.supports('money.deserialize')).toBe(true)
    expect(adapter.supports('money.serialize')).toBe(true)
    expect(adapter.supports('finkore.money.applyrate')).toBe(true)
    expect(adapter.supports('finkore.money.allocate')).toBe(true)
    expect(adapter.supports('money.rate.apply')).toBe(true)
    expect(adapter.supports('money.allocate')).toBe(true)
    expect(adapter.supports('finkore.money.add')).toBe(true)
    expect(adapter.supports('finkore.money.subtract')).toBe(true)
    expect(adapter.supports('finkore.money.compare')).toBe(true)
    expect(adapter.supports('finkore.money.round')).toBe(true)
    expect(adapter.supports('finkore.money.negate')).toBe(true)
    expect(adapter.supports('finkore.money.multiply')).toBe(true)
    expect(adapter.supports('finkore.money.divide')).toBe(true)
    expect(adapter.supports('workflow.create')).toBe(true)
    expect(adapter.supports('workflow.import')).toBe(true)
    expect(adapter.supports('finkore.workflow.transition')).toBe(true)
    expect(adapter.supports('finkore.entity.create')).toBe(true)
    expect(adapter.supports('finkore.entity.evolution.correct')).toBe(true)
    expect(adapter.supports('finkore.entity.evolution.reverse')).toBe(true)
    expect(adapter.supports('finkore.entity.evolution.supersede')).toBe(true)
    expect(adapter.supports('finkore.entity.evolution.void')).toBe(true)
    expect(adapter.supports('finkore.entity.transition')).toBe(true)
    expect(adapter.supports('finkore.entity.mutate')).toBe(true)
    expect(adapter.supports('entity.create')).toBe(true)
    expect(adapter.supports('entity.evolution.correct')).toBe(true)
    expect(adapter.supports('entity.evolution.reverse')).toBe(true)
    expect(adapter.supports('entity.evolution.supersede')).toBe(true)
    expect(adapter.supports('entity.evolution.void')).toBe(true)
    expect(adapter.supports('entity.transition')).toBe(true)
    expect(adapter.supports('entity.mutate')).toBe(true)
    expect(adapter.supports('entity.import')).toBe(true)
    expect(adapter.supports('finkore.audit.append')).toBe(true)
    expect(adapter.supports('finkore.audit.replace')).toBe(true)
    expect(adapter.supports('finkore.audit.remove')).toBe(true)
    expect(adapter.supports('approval.requirement.evaluate')).toBe(true)
    expect(adapter.supports('approval.decision.record')).toBe(true)
    expect(adapter.supports('approval.decision.evaluate')).toBe(true)
    expect(adapter.supports('approval.condition.evaluate')).toBe(true)
    expect(adapter.supports('approval.chain.evaluate')).toBe(true)
    expect(adapter.supports('approval.composition.evaluate')).toBe(true)
    expect(adapter.supports('audit.append')).toBe(false)
    expect(adapter.supports('audit.redact')).toBe(true)
    expect(adapter.supports('audit.order')).toBe(false)
    expect(adapter.supports('money.negate')).toBe(false)
    expect(adapter.supports('money.multiply')).toBe(false)
    expect(adapter.supports('money.divide')).toBe(false)
    expect(adapter.supports('finkore.approval.decision.withdraw')).toBe(false)
    expect(adapter.supports('workflow.transition')).toBe(false)
  })

  it('passes current Money representation and serialization vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.deserialize.positive-001',
      'money.deserialize.zero-001',
      'money.deserialize.negative-001',
      'money.deserialize.missing-amount-001',
      'money.deserialize.missing-currency-001',
      'money.deserialize.numeric-amount-001',
      'money.deserialize.exponent-001',
      'money.deserialize.leading-plus-001',
      'money.deserialize.non-finite-001',
      'money.deserialize.lowercase-currency-001',
      'money.deserialize.unknown-members-001',
      'money.serialize.roundtrip-001',
      'money.serialize.locale-independent-001',
    ] })

    expect(report.summary).toEqual({ total: 13, passed: 13, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current canonical Money arithmetic vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.add.same-currency.basic-001',
      'money.add.exact-decimal-001',
      'money.add.negative-001',
      'money.add.zero-001',
      'money.add.differing-scale-001',
      'money.add.currency-mismatch-001',
      'money.subtract.basic-001',
      'money.subtract.negative-result-001',
      'money.subtract.differing-scale-001',
      'money.subtract.whole-number-001',
      'money.subtract.currency-mismatch-001',
      'money.negate.positive-001',
      'money.negate.negative-001',
      'money.multiply.decimal-001',
      'money.divide.exact-001',
      'money.divide.zero-001',
      'money.divide.rounding-required-001',
    ] })

    expect(report.summary).toEqual({ total: 17, passed: 17, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })


  it('passes current canonical Money rate vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.rate.decimal-exact-001',
      'money.rate.percentage-conversion-001',
      'money.rate.zero-decimal-001',
      'money.rate.negative-decimal-001',
      'money.rate.fractional-base10-001',
      'money.rate.fractional-percentage-001',
      'money.rate.round.half-up-001',
      'money.rate.round.half-even-001',
      'money.rate.invalid-numeric-value-001',
      'money.rate.invalid-exponent-value-001',
      'money.rate.invalid-kind-001',
      'money.rate.invalid-rounding-001',
    ] })

    expect(report.summary).toEqual({ total: 12, passed: 12, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current canonical Money allocation vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.allocate.equal.remainder-positive-001',
      'money.allocate.ratio.remainder-positive-001',
      'money.allocate.ratio.zero-source-001',
      'money.allocate.equal.remainder-negative-001',
      'money.allocate.ratio.declared-order-001',
      'money.allocate.ratio.large-ratios-001',
      'money.allocate.unrepresentable-source-scale-001',
      'money.allocate.equal.invalid-zero-parts-001',
      'money.allocate.equal.invalid-negative-parts-001',
      'money.allocate.ratio.invalid-zero-ratio-001',
      'money.allocate.ratio.invalid-negative-ratio-001',
      'money.allocate.ratio.invalid-malformed-ratio-001',
      'money.allocate.ratio.invalid-fractional-ratio-001',
      'money.allocate.ratio.invalid-empty-ratios-001',
      'money.allocate.invalid-scale-001',
      'money.allocate.invalid-method-001',
      'money.allocate.equal.hundred-parts-001',
      'money.allocate.equal.integral-json-number-001',
      'money.allocate.equal.part-count-out-of-range-001',
      'money.allocate.ratio.integral-json-number-001',
      'money.allocate.ratio.out-of-range-001',
      'money.allocate.ratio.safe-integer-boundary-001',
      'money.allocate.scale.maximum-001',
      'money.allocate.scale.out-of-range-001',
    ] })

    expect(report.summary).toEqual({ total: 24, passed: 24, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current canonical Money comparison vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.compare.equal-trailing-zeros-001',
      'money.compare.less-001',
      'money.compare.greater-negative-001',
      'money.compare.equal-zero-scale-001',
      'money.compare.equality-currency-mismatch-001',
      'money.compare.order-currency-mismatch-001',
    ] })

    expect(report.summary).toEqual({ total: 6, passed: 6, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current canonical Money rounding vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'money.round.half-up.tie-positive-001',
      'money.round.half-up.tie-negative-001',
      'money.round.half-even.tie-even-down-001',
      'money.round.half-even.tie-odd-up-001',
      'money.round.half-even.tie-negative-even-001',
      'money.round.down.positive-001',
      'money.round.down.negative-001',
      'money.round.up.positive-001',
      'money.round.up.negative-001',
      'money.round.floor.positive-001',
      'money.round.floor.negative-001',
      'money.round.ceiling.positive-001',
      'money.round.ceiling.negative-001',
      'money.round.below-half-positive-001',
      'money.round.above-half-positive-001',
      'money.round.explicit-scale-001',
      'money.round.no-discard-001',
      'money.round.invalid-mode-001',
      'money.round.invalid-scale-001',
    ] })

    expect(report.summary).toEqual({ total: 19, passed: 19, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current required Audit vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ suites: ['audit'] })

    expect(report.summary).toEqual({ total: 84, passed: 84, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Audit relationship vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'audit.relationship.corrects.append-001',
      'audit.relationship.all-types-order-001',
      'audit.relationship.invalid-type-001',
      'audit.relationship.unknown-target-001',
      'audit.relationship.import-unknown-target-001',
      'audit.relationship.self-target-001',
      'audit.relationship.target-entity-mismatch-001',
      'audit.relationship.duplicate-identity-001',
      'audit.relationship.redaction-preserves-001',
      'audit.relationship.redaction-invalid-evidence-001',
    ] })

    expect(report.summary).toEqual({ total: 10, passed: 10, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Approval Composition vectors through the TypeScript core evaluator', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'approval.composition.all-of-pending-001',
      'approval.composition.any-of-inapplicable-child-pending-001',
      'approval.composition.none-applicable-approved-001',
      'approval.composition.stage-first-pending-actionable-001',
      'approval.composition.stage-parallel-rejected-001',
      'approval.composition.stage-inapplicable-allows-later-001',
      'approval.composition.structure-invalid-duplicates-001',
      'approval.composition.structure-cycle-depth-invalid-001',
      'approval.composition.structure-empty-stage-kind-invalid-001',
      'approval.composition.unresolved-applicability-complete-validation-001',
      'approval.composition.error-priority-structure-over-context-001',
      'approval.composition.error-priority-context-before-state-001',
      'approval.composition.quorum-two-of-three-approved-boundary-001',
      'approval.composition.quorum-fixed-threshold-unreachable-001',
      'approval.composition.quorum-reachable-pending-001',
      'approval.composition.quorum-invalid-member-voter-001',
      'approval.composition.quorum-opposing-effective-votes-invalid-001',
      'approval.composition.quorum-member-specific-evidence-001',
      'approval.composition.quorum-ineffective-decision-not-counted-001',
    ] })

    expect(report.summary).toEqual({ total: 19, passed: 19, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Approval vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ suites: ['approvals'] })

    expect(report.summary).toEqual({ total: 277, passed: 277, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Workflow state and transition vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'workflow.create.initial-state-001',
      'workflow.create.duplicate-state-001',
      'workflow.create.multiple-initial-001',
      'workflow.create.terminal-outgoing-001',
      'workflow.create.undeclared-transition-source-001',
      'workflow.create.undeclared-transition-target-001',
      'workflow.transition.valid-001',
      'workflow.transition.reverse-not-implied-001',
      'workflow.transition.unguarded-ignores-facts-001',
      'workflow.transition.undeclared-001',
      'workflow.transition.undeclared-current-state-001',
      'workflow.transition.multiple-current-states-001',
      'workflow.transition.state-identity-exact-001',
      'workflow.guard.pass-001',
      'workflow.guard.reject-001',
      'workflow.guard.multiple-pass-001',
      'workflow.guard.multiple-order-invariant-001',
      'workflow.guard.boolean-expected-number-actual-rejected-001',
      'workflow.guard.number-expected-boolean-actual-rejected-001',
      'workflow.guard.missing-fact-not-null-001',
      'workflow.guard.explicit-null-pass-001',
      'workflow.guard.object-member-order-pass-001',
      'workflow.guard.nested-boolean-number-rejected-001',
      'workflow.guard.array-equal-pass-001',
      'workflow.guard.array-order-rejected-001',
      'workflow.guard.multiple-structured-pass-001',
      'workflow.guard.multiple-rejection-preserves-context-001',
      'workflow.terminal.entry-allowed-001',
      'workflow.terminal.not-inferred-no-outgoing-001',
      'workflow.terminal.transition-rejected-001',
    ] })

    expect(report.summary).toEqual({ total: 30, passed: 30, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes Workflow versioning, import, and conflict vectors through core Workflow behavior', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'workflow.create.versioned-binding-001',
      'workflow.create.version-missing-invalid-001',
      'workflow.create.default-version-sequence-zero-invalid-001',
      'workflow.import.current-state-preserved-001',
      'workflow.import.version-binding-preserved-001',
      'workflow.import.undeclared-current-state-001',
      'workflow.import.missing-current-state-invalid-instance-001',
      'workflow.import.version-mismatch-001',
      'workflow.import.malformed-revision-invalid-instance-001',
      'workflow.transition.bound-older-version-001',
      'workflow.transition.version-mismatch-preserves-state-001',
      'workflow.transition.expected-state-matches-001',
      'workflow.transition.expected-state-mismatch-001',
      'workflow.transition.expected-state-omitted-no-default-001',
      'workflow.transition.expected-revision-matches-001',
      'workflow.transition.expected-revision-mismatch-001',
      'workflow.transition.expected-revision-omitted-no-default-001',
      'workflow.transition.error-precedence-invalid-instance-before-version-001',
      'workflow.transition.error-precedence-invalid-state-before-conflict-001',
      'workflow.transition.error-precedence-terminal-before-invalid-transition-001',
      'workflow.transition.error-precedence-conflict-before-terminal-001',
    ] })

    expect(report.summary).toEqual({ total: 21, passed: 21, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Entity identity, lifecycle, mutability, validation, evolution, and import vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'entity.create.initial-lifecycle-001',
      'entity.create.opaque-identity-preserved-001',
      'entity.mutate.display-number-not-identity-001',
      'entity.mutate.identity-and-state-protected-001',
      'entity.mutate.mutable-field-001',
      'entity.mutate.immutable-financial-field-001',
      'entity.mutate.terminal-metadata-001',
      'entity.validation.complete-result-001',
      'entity.transition.success-identity-stable-001',
      'entity.transition.rejected-preserves-entity-001',
      'entity.evolution.correction.audit-001',
      'entity.evolution.reversal.audit-001',
      'entity.evolution.reversal.duplicate-001',
      'entity.evolution.void.audit-001',
      'entity.evolution.supersession.currentness-001',
      'entity.evolution.stale-revision-001',
      'entity.evolution.invalid-related-identity-001',
      'entity.evolution.audit-failure-001',
      'entity.evolution.correction.ineligible-001',
      'entity.evolution.void.ineligible-001',
      'entity.import.identity-mapping-preserved-001',
      'entity.import.missing-mapping-invalid-identity-001',
      'entity.import.expected-state-conflict-001',
      'entity.import.expected-revision-conflict-001',
      'entity.import.expected-conflict-version-conflict-001',
      'entity.import.validation-positive-money-valid-001',
      'entity.import.validation-positive-money-invalid-001',
      'entity.import.validation-cross-field-valid-001',
      'entity.import.validation-cross-field-invalid-001',
    ] })

    expect(report.summary).toEqual({ total: 29, passed: 29, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })
})
