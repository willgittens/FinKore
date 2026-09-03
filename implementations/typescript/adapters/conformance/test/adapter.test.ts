import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createConformanceRunner } from '@finflow/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const manifestPath = resolve(import.meta.dirname, '../../../../../conformance/manifest.json')

describe('TypeScript conformance adapter', () => {
  it('supports only first-milestone Money serialization operations', () => {
    const adapter = createTypeScriptConformanceAdapter()

    expect(adapter.supports('money.deserialize')).toBe(true)
    expect(adapter.supports('money.serialize')).toBe(true)
    expect(adapter.supports('finflow.money.add')).toBe(false)
    expect(adapter.supports('finflow.money.compare')).toBe(false)
    expect(adapter.supports('finflow.money.round')).toBe(false)
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
})
