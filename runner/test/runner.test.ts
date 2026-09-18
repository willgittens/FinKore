// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import { createConformanceRunner } from '../src/runner.js'
import type { FinKoreConformanceAdapter } from '../src/adapter/types.js'
import { createFixtureConformance, metadata, validVector } from './helpers.js'

async function runWith(adapter: FinKoreConformanceAdapter, vectors: readonly unknown[] = [validVector]) {
  const fixture = await createFixtureConformance(vectors)
  return createConformanceRunner({ manifestPath: fixture.manifestPath, adapter, metadata }).run()
}

describe('runner execution classification', () => {
  it('passes a matching synchronous result', async () => {
    const report = await runWith({ supports: () => true, execute: () => ({ status: 'success', value: { answer: 'ok' } }) })
    expect(report.summary).toMatchObject({ passed: 1, failed: 0 })
    expect(report.results[0]?.status).toBe('PASS')
  })

  it('passes a matching asynchronous portable error', async () => {
    const vector = { ...validVector, expected: { status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT' } }, tags: ['negative'] }
    const report = await runWith({ supports: () => true, execute: async () => ({ status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT' } }) }, [vector])
    expect(report.results[0]?.status).toBe('PASS')
  })

  it.each([
    [{ status: 'success', value: { answer: 'wrong' } }, 'FAIL'],
    [{ status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT' } }, 'FAIL'],
  ] as const)('classifies an executed mismatch as FAIL', async (actual, status) => {
    const report = await runWith({ supports: () => true, execute: () => actual })
    expect(report.results[0]?.status).toBe(status)
  })

  it('classifies unsupported without executing', async () => {
    const execute = vi.fn()
    const report = await runWith({ supports: () => false, execute })
    expect(report.results[0]?.status).toBe('UNSUPPORTED')
    expect(execute).not.toHaveBeenCalled()
  })

  it.each([
    [{ supports: () => { throw new Error('supports crash') }, execute: vi.fn() }, 'supports() failed'],
    [{ supports: () => true, execute: () => { throw new Error('execute crash') } }, 'execution failed'],
    [{ supports: () => true, reset: () => { throw new Error('reset crash') }, execute: vi.fn() }, 'execution failed'],
    [{ supports: () => true, execute: () => ({ status: 'success' }) }, 'invalid normalized'],
  ] as const)('classifies adapter infrastructure failure %#', async (adapter, diagnostic) => {
    const report = await runWith(adapter as FinKoreConformanceAdapter)
    expect(report.results[0]?.status).toBe('INFRASTRUCTURE_ERROR')
    expect(report.results[0]?.diagnostic).toContain(diagnostic)
  })

  it('passes context unchanged and resets before each supported execution', async () => {
    const context = { now: '2026-01-01T00:00:00Z' }
    const vector = { ...validVector, context }
    const reset = vi.fn()
    const execute = vi.fn(() => ({ status: 'success' as const, value: { answer: 'ok' } }))
    await runWith({ supports: () => true, reset, execute }, [vector])
    expect(reset).toHaveBeenCalledOnce()
    expect(execute.mock.calls[0]?.[0].context).toStrictEqual(context)
  })

  it('omits absent context and marks any critical requirement', async () => {
    const execute = vi.fn(() => ({ status: 'success' as const, value: { answer: 'ok' } }))
    const vector = {
      ...validVector,
      requirements: ['MONEY-ARITHMETIC-001', 'MONEY-ROUNDING-003'],
    }
    const report = await runWith({ supports: () => true, execute }, [vector])
    expect(Object.hasOwn(execute.mock.calls[0]?.[0] ?? {}, 'context')).toBe(false)
    expect(report.results[0]?.critical).toBe(true)
  })

  it('preserves exact classification diagnostics', async () => {
    const unsupported = await runWith({ supports: () => false, execute: vi.fn() })
    expect(unsupported.results[0]?.diagnostic).toBe('Adapter does not support finkore.money.add')
    const mismatch = await runWith({
      supports: () => true,
      execute: () => ({ status: 'success', value: { answer: 'wrong' } }),
    })
    expect(mismatch.results[0]?.diagnostic).toContain('Value mismatch')
  })

  it('executes sequentially in deterministic order and supports filters', async () => {
    const calls: string[] = []
    const second = { ...validVector, id: 'money.add.second-001', tags: ['boundary'], input: { token: 'second' } }
    const first = { ...validVector, id: 'money.add.first-001', tags: ['positive'], input: { token: 'first' } }
    const fixture = await createFixtureConformance([second, first])
    const adapter: FinKoreConformanceAdapter = {
      supports: () => true,
      execute: async ({ input }) => {
        calls.push((input as { token: string }).token)
        return { status: 'success', value: { answer: 'ok' } }
      },
    }
    const report = await createConformanceRunner({ manifestPath: fixture.manifestPath, adapter, metadata }).run({ tags: ['positive'] })
    expect(calls).toEqual(['first'])
    expect(report.results.map((result) => result.vectorId)).toEqual(['money.add.first-001'])
    expect(report.reproducibility).toStrictEqual({
      manifest: {
        path: resolve(fixture.manifestPath),
        finkoreConformance: '0.1',
        vectorSchema: './schema.json',
        suites: [{ id: 'money', vectorFiles: ['./suite/vectors.json'] }],
      },
      filters: {
        suites: [],
        tags: ['positive'],
        vectorIds: [],
      },
    })
  })

})
