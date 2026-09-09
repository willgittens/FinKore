// SPDX-License-Identifier: MPL-2.0
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadConformance } from '../src/loader.js'
import { createFixtureConformance, metadata, validVector } from './helpers.js'

describe('manifest-driven loading', () => {
  it('loads a declared vector', async () => {
    const fixture = await createFixtureConformance()
    const loaded = await loadConformance(fixture.manifestPath, metadata)
    expect(loaded.vectors.map((vector) => vector.id)).toEqual(['money.add.basic-001'])
    expect(loaded.vectors[0]?.suiteId).toBe('money')
  })

  it('sorts vectors by id within manifest suite order', async () => {
    const z = { ...validVector, id: 'money.add.zzz-001' }
    const a = { ...validVector, id: 'money.add.aaa-001' }
    const fixture = await createFixtureConformance([z, a])
    const loaded = await loadConformance(fixture.manifestPath, metadata)
    expect(loaded.vectors.map((vector) => vector.id)).toEqual(['money.add.aaa-001', 'money.add.zzz-001'])
  })

  it('rejects missing vector files', async () => {
    const fixture = await createFixtureConformance([], {
      finkoreConformance: '0.1',
      vectorSchema: './schema.json',
      suites: [{ id: 'money', vectorFiles: ['./missing.json'] }],
    })
    await expect(loadConformance(fixture.manifestPath, metadata)).rejects.toThrow('Cannot read valid JSON')
  })

  it.each(['../escape.json', '/tmp/escape.json', '.'])('rejects unsafe vector path %s', async (path) => {
    const fixture = await createFixtureConformance([], {
      finkoreConformance: '0.1',
      vectorSchema: './schema.json',
      suites: [{ id: 'money', vectorFiles: [path] }],
    })
    await expect(loadConformance(fixture.manifestPath, metadata)).rejects.toThrow('escapes or resolves')
  })

  it('rejects unsafe schema paths', async () => {
    const fixture = await createFixtureConformance([validVector], {
      finkoreConformance: '0.1',
      vectorSchema: '../schema.json',
      suites: [{ id: 'money', vectorFiles: ['./suite/vectors.json'] }],
    })
    await expect(loadConformance(fixture.manifestPath, metadata)).rejects.toThrow('Vector schema path')
  })

  it('rejects duplicate ids across files', async () => {
    const fixture = await createFixtureConformance()
    await mkdir(join(fixture.root, 'other'))
    await writeFile(join(fixture.root, 'other', 'vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors: [validVector] }))
    await writeFile(fixture.manifestPath, JSON.stringify({
      finkoreConformance: '0.1',
      vectorSchema: './schema.json',
      suites: [
        { id: 'money', vectorFiles: ['./suite/vectors.json'] },
        { id: 'other', vectorFiles: ['./other/vectors.json'] },
      ],
    }))
    await expect(loadConformance(fixture.manifestPath, metadata)).rejects.toThrow('Duplicate vector id')
  })

  it('loads requirement and critical metadata by default', async () => {
    const fixture = await createFixtureConformance()
    await writeFile(join(fixture.root, 'traceability.md'), [
      '| MONEY-ARITHMETIC-001 | Money | MUST | COVERED | x |',
      '## Critical financial requirements',
      '| Requirement | behavior | mutant |',
      '| --- | --- | --- |',
      '| MONEY-ARITHMETIC-001 | exact | altered |',
    ].join('\n'))
    const loaded = await loadConformance(fixture.manifestPath)
    expect(loaded.metadata.requirementIds.has('MONEY-ARITHMETIC-001')).toBe(true)
    expect(loaded.metadata.criticalRequirementIds.has('MONEY-ARITHMETIC-001')).toBe(true)
  })
})
