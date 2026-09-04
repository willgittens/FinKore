import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createConformanceRunner } from '@finflow/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const manifestPath = resolve(import.meta.dirname, '../../../../../conformance/manifest.json')

describe('TypeScript conformance adapter', () => {
  it('supports Money serialization, canonical arithmetic, comparison, and rounding operations', () => {
    const adapter = createTypeScriptConformanceAdapter()

    expect(adapter.supports('money.deserialize')).toBe(true)
    expect(adapter.supports('money.serialize')).toBe(true)
    expect(adapter.supports('finflow.money.add')).toBe(true)
    expect(adapter.supports('finflow.money.subtract')).toBe(true)
    expect(adapter.supports('finflow.money.compare')).toBe(true)
    expect(adapter.supports('finflow.money.round')).toBe(true)
    expect(adapter.supports('finflow.money.negate')).toBe(true)
    expect(adapter.supports('finflow.money.multiply')).toBe(true)
    expect(adapter.supports('finflow.money.divide')).toBe(true)
    expect(adapter.supports('money.negate')).toBe(false)
    expect(adapter.supports('money.multiply')).toBe(false)
    expect(adapter.supports('money.divide')).toBe(false)
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
})
