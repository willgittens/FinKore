import { describe, expect, it } from 'vitest'
import { filterVectors } from '../src/filters.js'
import type { LoadedVector } from '../src/types/vector.js'
import { validVector } from './helpers.js'

const vectors: LoadedVector[] = [
  { ...validVector, id: 'money.add.a-001', suiteId: 'money', sourceFile: 'a', tags: ['positive'] },
  { ...validVector, id: 'money.add.b-001', suiteId: 'money', sourceFile: 'a', tags: ['boundary', 'mutation-sensitive'] },
  { ...validVector, id: 'workflow.test.a-001', suiteId: 'workflow', sourceFile: 'b', tags: ['negative'] },
]

describe('filters', () => {
  it('filters by suite, tag, and id', () => {
    expect(filterVectors(vectors, { suites: ['workflow'] }).map((v) => v.id)).toEqual(['workflow.test.a-001'])
    expect(filterVectors(vectors, { tags: ['boundary'] }).map((v) => v.id)).toEqual(['money.add.b-001'])
    expect(filterVectors(vectors, { vectorIds: ['money.add.a-001'] }).map((v) => v.id)).toEqual(['money.add.a-001'])
  })

  it('ANDs filter dimensions and ORs values within a dimension', () => {
    expect(filterVectors(vectors, { suites: ['money'], tags: ['negative', 'boundary'] }).map((v) => v.id)).toEqual(['money.add.b-001'])
  })

  it('preserves stable input order and treats empty filters as absent', () => {
    expect(filterVectors(vectors, { suites: [], tags: [], vectorIds: [] })).toEqual(vectors)
  })
})
