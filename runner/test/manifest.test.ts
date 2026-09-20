// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { RunnerInfrastructureError } from '../src/errors/runner-errors.js'
import { validateManifest } from '../src/manifest.js'

const valid = {
  finkoreConformance: '0.1',
  vectorSchema: './schema.json',
  suites: [{ id: 'money', vectorFiles: ['./money.json'] }],
}

describe('manifest validation', () => {
  it('accepts a valid manifest', () => expect(validateManifest(valid)).toEqual(valid))

  it.each([
    ['not-an-object', 'Manifest must be an object'],
    [[], 'Manifest must be an object'],
    [{ ...valid, finkoreConformance: '0.2' }, 'version'],
    [{ ...valid, vectorSchema: '' }, 'vectorSchema'],
    [{ ...valid, vectorSchema: 4 }, 'vectorSchema'],
    [{ ...valid, suites: [] }, 'suites'],
    [{ ...valid, suites: [null] }, 'must be an object'],
    [{ ...valid, suites: [{ id: 'Money', vectorFiles: ['./x'] }] }, 'invalid id'],
    [{ ...valid, suites: [{ id: 'money!', vectorFiles: ['./x'] }] }, 'invalid id'],
    [{ ...valid, suites: [{ id: 4, vectorFiles: ['./x'] }] }, 'invalid id'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: [] }] }, 'vectorFiles'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: null }] }, 'vectorFiles'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: ['./x', ''] }] }, 'vectorFiles'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: ['./x', 4] }] }, 'vectorFiles'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: ['./x', './x'] }] }, 'duplicate vector files'],
    [{ ...valid, suites: [valid.suites[0], valid.suites[0]] }, 'Duplicate suite'],
  ])('rejects malformed manifest %#', (candidate, message) => {
    expect(() => validateManifest(candidate)).toThrow(message)
  })

  it('uses a typed infrastructure error', () => {
    try {
      validateManifest(null, 'fixture-manifest')
    } catch (error) {
      expect(error).toBeInstanceOf(RunnerInfrastructureError)
      expect(error).toMatchObject({
        kind: 'MANIFEST',
        message: 'Manifest must be an object',
        path: 'fixture-manifest',
      })
    }
  })
})
