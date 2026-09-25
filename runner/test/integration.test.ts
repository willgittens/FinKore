// SPDX-License-Identifier: MPL-2.0
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { loadConformance } from '../src/loader.js'
import { createConformanceRunner } from '../src/runner.js'

const realManifest = resolve(import.meta.dirname, '../../conformance/manifest.json')

describe('real FinKore artifact integration', () => {
  it('loads all manifest-declared vectors with valid operation and requirement references', async () => {
    const loaded = await loadConformance(realManifest)
    const manifest = JSON.parse(readFileSync(realManifest, 'utf8')) as { suites: { vectorFiles: string[] }[] }
    const declaredIds = manifest.suites.flatMap(suite => suite.vectorFiles).flatMap(file => {
      const document = JSON.parse(readFileSync(resolve(realManifest, '..', file), 'utf8')) as { vectors: { id: string }[] }
      return document.vectors.map(vector => vector.id)
    })
    expect(declaredIds.length).toBeGreaterThan(0)
    expect(loaded.vectors.map(vector => vector.id).sort()).toEqual(declaredIds.sort())
    expect(new Set(loaded.vectors.map((vector) => vector.id)).size).toBe(loaded.vectors.length)
    expect(loaded.vectors.every((vector) => loaded.metadata.operationIds.has(vector.operation))).toBe(true)
    expect(loaded.vectors.every((vector) => vector.requirements.every((id) => loaded.metadata.requirementIds.has(id)))).toBe(true)
    expect(loaded.vectors.filter((vector) => vector.operation.startsWith('finkore.')).every((vector) => loaded.metadata.agenticOperationIds.has(vector.operation))).toBe(true)
  })

  it('executes one real vector through a fixture adapter without claiming domain conformance', async () => {
    const report = await createConformanceRunner({
      manifestPath: realManifest,
      adapter: {
        supports: (operationId) => operationId === 'finkore.money.add',
        execute: () => ({
          status: 'success',
          value: { amount: '0.3', currency: 'EUR' },
          observations: {
            left: { amount: '0.1', currency: 'EUR' },
            right: { amount: '0.2', currency: 'EUR' },
          },
        }),
      },
    }).run({ vectorIds: ['money.add.exact-decimal-001'] })
    expect(report.summary).toEqual({ total: 1, passed: 1, failed: 0, unsupported: 0, infrastructureErrors: 0 })
  })
})
