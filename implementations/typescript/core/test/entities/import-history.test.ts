// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { FinancialEntity } from '../../src/index.js'

const definition = {
  type: 'invoice', identityScope: 'tenant',
  workflow: { states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: [], transitions: [{ source: 'DRAFT', target: 'DONE' }] },
  mutability: { DRAFT: ['memo'], DONE: [] },
}
const entity = { type: 'invoice', id: 'i', state: 'DRAFT', data: { memo: 'imported' } }
const identityMapping = { mappingId: 'mapping', sourceSystem: 'legacy', sourceId: 'legacy-i', entity: { type: 'invoice', id: 'i' } }
const metadata = { identityMapping, currentRevision: 'rev-2', conflictVersion: 'token', expectedRevision: 'rev-2', expectedConflictVersion: 'token', expectedState: 'DRAFT' }
const observedMetadata = { identityMapping, currentRevision: { type: 'invoice', id: 'i', revision: 'rev-2', current: true }, conflictVersion: 'token' }

function success(input: unknown, expected: unknown): void {
  const request = structuredClone(input)
  const before = structuredClone(request)
  const result = FinancialEntity.import(definition, request)
  expect(result).toEqual(expected)
  expect(FinancialEntity.import(definition, result)).toEqual(result)
  expect(request).toEqual(before)
  const history = result.historicalRevisions as unknown[]
  history.push({ revision: 'caller-write' })
  expect(request).toEqual(before)
  expect(FinancialEntity.import(definition, request)).toEqual(expected)
}

describe('Entity import history', () => {
  it('empty history contract', () => {
    for (const history of [{}, { historicalRevisions: [] }]) {
      success({ entity, ...history }, { entity, historicalRevisions: [] })
      success({ entity, ...metadata, ...history }, { entity, ...observedMetadata, historicalRevisions: [] })
    }
  })
  it('nonempty history control', () => {
    success({ entity, ...metadata, historicalRevisions: ['rev-1'] }, {
      entity, ...observedMetadata,
      historicalRevisions: [{ type: 'invoice', id: 'i', revision: 'rev-1', current: false }],
    })
  })
  it('preserves input presence on failure', () => {
    const cases = [
      [{ entity, historicalRevisions: null }, 'FINKORE_ENTITY_INVALID_IDENTITY'],
      [{ entity, historicalRevisions: {} }, 'FINKORE_ENTITY_INVALID_IDENTITY'],
      [{ entity, expectedState: 'DONE' }, 'FINKORE_ENTITY_STATE_CONFLICT'],
      [{ entity, historicalRevisions: [], expectedState: 'DONE' }, 'FINKORE_ENTITY_STATE_CONFLICT'],
    ] as const
    for (const [input, code] of cases) {
      const request = structuredClone(input)
      const before = structuredClone(request)
      expect(() => FinancialEntity.import(definition, request)).toThrowError(expect.objectContaining({ code }))
      expect(request).toEqual(before)
    }
  })
})
