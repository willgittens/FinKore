import { describe, expect, it } from 'vitest'
import { RunnerInfrastructureError } from '../src/errors/runner-errors.js'
import { validateManifest } from '../src/manifest.js'

const valid = {
  finflowConformance: '0.1',
  vectorSchema: './schema.json',
  suites: [{ id: 'money', vectorFiles: ['./money.json'] }],
}

describe('manifest validation', () => {
  it('accepts a valid manifest', () => expect(validateManifest(valid)).toEqual(valid))

  it.each([
    [{ ...valid, finflowConformance: '0.2' }, 'version'],
    [{ ...valid, vectorSchema: '' }, 'vectorSchema'],
    [{ ...valid, suites: [] }, 'suites'],
    [{ ...valid, suites: [{ id: 'Money', vectorFiles: ['./x'] }] }, 'invalid id'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: [] }] }, 'vectorFiles'],
    [{ ...valid, suites: [{ id: 'money', vectorFiles: ['./x', './x'] }] }, 'duplicate vector files'],
    [{ ...valid, suites: [valid.suites[0], valid.suites[0]] }, 'Duplicate suite'],
  ])('rejects malformed manifest %#', (candidate, message) => {
    expect(() => validateManifest(candidate)).toThrow(message)
  })

  it('uses a typed infrastructure error', () => {
    expect(() => validateManifest(null)).toThrow(RunnerInfrastructureError)
  })
})
