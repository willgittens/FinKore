import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createConformanceRunner } from '@finkore/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const manifestPath = resolve(import.meta.dirname, '../../../../../conformance/manifest.json')

describe('TypeScript conformance adapter', () => {
  it('supports current Money, Workflow, Audit, and Approval milestone operations', () => {
    const adapter = createTypeScriptConformanceAdapter()

    expect(adapter.supports('money.deserialize')).toBe(true)
    expect(adapter.supports('money.serialize')).toBe(true)
    expect(adapter.supports('finkore.money.add')).toBe(true)
    expect(adapter.supports('finkore.money.subtract')).toBe(true)
    expect(adapter.supports('finkore.money.compare')).toBe(true)
    expect(adapter.supports('finkore.money.round')).toBe(true)
    expect(adapter.supports('finkore.money.negate')).toBe(true)
    expect(adapter.supports('finkore.money.multiply')).toBe(true)
    expect(adapter.supports('finkore.money.divide')).toBe(true)
    expect(adapter.supports('workflow.create')).toBe(true)
    expect(adapter.supports('finkore.workflow.transition')).toBe(true)
    expect(adapter.supports('finkore.audit.append')).toBe(true)
    expect(adapter.supports('finkore.audit.replace')).toBe(true)
    expect(adapter.supports('finkore.audit.remove')).toBe(true)
    expect(adapter.supports('approval.requirement.evaluate')).toBe(true)
    expect(adapter.supports('approval.decision.record')).toBe(true)
    expect(adapter.supports('approval.decision.evaluate')).toBe(true)
    expect(adapter.supports('approval.condition.evaluate')).toBe(true)
    expect(adapter.supports('audit.append')).toBe(false)
    expect(adapter.supports('audit.redact')).toBe(true)
    expect(adapter.supports('audit.order')).toBe(false)
    expect(adapter.supports('approval.chain.evaluate')).toBe(false)
    expect(adapter.supports('money.negate')).toBe(false)
    expect(adapter.supports('money.multiply')).toBe(false)
    expect(adapter.supports('money.divide')).toBe(false)
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

    expect(report.summary).toEqual({ total: 19, passed: 19, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })

  it('passes current Approval requirement, decision, and condition milestone vectors', async () => {
    const report = await createConformanceRunner({
      manifestPath,
      adapter: createTypeScriptConformanceAdapter(),
    }).run({ vectorIds: [
      'approval.requirement.pending-001',
      'approval.requirement.approved-001',
      'approval.requirement.rejected-001',
      'approval.requirement.wrong-association-001',
      'approval.decision.pending-invalid-001',
      'approval.decision.ineligible-actor-001',
      'approval.decision.subject-facts-unchanged-001',
      'approval.decision.subject-facts-changed-001',
      'approval.condition.missing-fact-001',
      'approval.condition.applicable-explicit-001',
      'approval.condition.not-applicable-explicit-001',
      'approval.condition.falsey-facts-present-001',
      'approval.condition.missing-result-unresolved-001',
    ] })

    expect(report.summary).toEqual({ total: 13, passed: 13, failed: 0, unsupported: 0, infrastructureErrors: 0 })
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
      'workflow.terminal.entry-allowed-001',
      'workflow.terminal.not-inferred-no-outgoing-001',
      'workflow.terminal.transition-rejected-001',
    ] })

    expect(report.summary).toEqual({ total: 20, passed: 20, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })
})
