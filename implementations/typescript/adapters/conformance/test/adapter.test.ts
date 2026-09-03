import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createConformanceRunner } from '@finflow/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const manifestPath = resolve(import.meta.dirname, '../../../../../conformance/manifest.json')

describe('TypeScript conformance adapter', () => {
  it('supports Money serialization and canonical arithmetic operations', () => {
    const adapter = createTypeScriptConformanceAdapter()

    expect(adapter.supports('money.deserialize')).toBe(true)
    expect(adapter.supports('money.serialize')).toBe(true)
    expect(adapter.supports('finflow.money.add')).toBe(true)
    expect(adapter.supports('finflow.money.subtract')).toBe(true)
    expect(adapter.supports('finflow.money.compare')).toBe(false)
    expect(adapter.supports('finflow.money.round')).toBe(false)
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
      'money.serialize.locale-independent-001',
    ] })

    expect(report.summary).toEqual({ total: 11, passed: 11, failed: 0, unsupported: 0, infrastructureErrors: 0 })
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
    ] })

    expect(report.summary).toEqual({ total: 11, passed: 11, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })
})
