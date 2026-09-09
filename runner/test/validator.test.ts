// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { assertUniqueVectorIds, isNormalizedResult, validateVector, validateVectorFile } from '../src/validator.js'
import { metadata, validVector } from './helpers.js'

describe('vector validation', () => {
  it('accepts valid success and error vectors', () => {
    expect(validateVector(validVector, metadata)).toEqual(validVector)
    const error = { ...validVector, expected: { status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT' } }, tags: ['negative'] }
    expect(validateVector(error, metadata).expected).toEqual(error.expected)
  })

  it('preserves optional validated fields exactly when present', () => {
    const vector = { ...validVector, context: { now: 'fixed' }, guardsAgainst: ['bad-branch'], expected: { status: 'success', value: 1, observations: { state: 'same' } } }
    expect(validateVector(vector, metadata)).toStrictEqual(vector)
  })

  it.each([
    [null, 'Vector must be an object'],
    [{ ...validVector, id: undefined }, 'invalid id'],
    [{ ...validVector, id: 4 }, 'invalid id'],
    [{ ...validVector, id: ['money.add.basic-001'] }, 'invalid id'],
    [{ ...validVector, spec: '../money' }, 'spec reference'],
    [{ ...validVector, spec: 4 }, 'spec reference'],
    [{ ...validVector, spec: ['money/arithmetic'] }, 'spec reference'],
    [{ ...validVector, description: '' }, 'empty description'],
    [{ ...validVector, description: 4 }, 'empty description'],
    [{ ...validVector, input: null }, 'input'],
    [{ ...validVector, context: [] }, 'context'],
    [{ ...validVector, requirements: [] }, 'requirements'],
    [{ ...validVector, requirements: null }, 'requirements'],
    [{ ...validVector, requirements: [4] }, 'entries must be strings'],
    [{ ...validVector, requirements: ['bad'] }, 'invalid string'],
    [{ ...validVector, requirements: ['UNKNOWN-RULE-001'] }, 'unknown requirement'],
    [{ ...validVector, operation: undefined }, 'operation id'],
    [{ ...validVector, operation: 4 }, 'operation id'],
    [{ ...validVector, operation: ['finkore.money.add'] }, 'operation id'],
    [{ ...validVector, operation: 'Money.add' }, 'operation id'],
    [{ ...validVector, operation: 'finkore.money.unknown' }, 'unknown operation'],
    [{ ...validVector, tags: ['unknown'] }, 'tags'],
    [{ ...validVector, tags: ['positive', 'positive'] }, 'duplicates'],
    [{ ...validVector, guardsAgainst: ['Bad Guard'] }, 'guardsAgainst'],
    [{ ...validVector, guardsAgainst: [4] }, 'entries must be strings'],
    [{ ...validVector, expected: null }, 'expected must be an object'],
    [{ ...validVector, expected: { status: 'success', value: 1, error: { code: 'FINKORE_MONEY_BAD' } } }, 'both value and error'],
    [{ ...validVector, expected: { status: 'success' } }, 'either value or error'],
    [{ ...validVector, expected: { status: 'success', error: { code: 'FINKORE_MONEY_BAD' } } }, 'success expectation'],
    [{ ...validVector, expected: { status: 'error', value: 1 } }, 'error expectation'],
    [{ ...validVector, expected: { status: 'error', error: null } }, 'portable error code'],
    [{ ...validVector, expected: { status: 'error', error: { code: 3 } } }, 'portable error code'],
    [{ ...validVector, expected: { status: 'error', error: { code: ['FINKORE_MONEY_BAD'] } } }, 'portable error code'],
    [{ ...validVector, expected: { status: 'error', error: { code: 'bad' } } }, 'portable error code'],
    [{ ...validVector, expected: { status: 'other', value: 1 } }, 'status'],
    [{ ...validVector, expected: { status: 'success', value: 1, observations: [] } }, 'observations'],
  ])('rejects malformed vector %#', (candidate, message) => {
    expect(() => validateVector(candidate, metadata)).toThrow(message)
  })

  it('rejects a finkore-prefixed operation absent from the Agentic registry', () => {
    const divergent = { ...metadata, operationIds: new Set([...metadata.operationIds, 'finkore.money.future']) }
    expect(() => validateVector({ ...validVector, operation: 'finkore.money.future' }, divergent)).toThrow('unregistered Agentic')
  })

  it('accepts registered conformance-local operation vocabulary', () => {
    expect(validateVector({ ...validVector, operation: 'local.inspect' }, metadata).operation).toBe('local.inspect')
  })

  it('rejects duplicate ids globally', () => {
    expect(() => assertUniqueVectorIds([validVector, validVector])).toThrow('Duplicate vector id')
    try {
      assertUniqueVectorIds([validVector, validVector])
    } catch (error) {
      expect(error).toMatchObject({ path: 'manifest' })
    }
  })

  it('validates vector file version and contents', () => {
    expect(validateVectorFile({ finkoreVectorFile: '0.1', vectors: [validVector] }, metadata, 'x').vectors).toHaveLength(1)
    expect(() => validateVectorFile(null, metadata, 'x')).toThrow('Vector file must be an object')
    expect(() => validateVectorFile({ finkoreVectorFile: '0.1', vectors: null }, metadata, 'x')).toThrow('vectors array')
    expect(() => validateVectorFile({ finkoreVectorFile: '0.2', vectors: [validVector] }, metadata, 'x')).toThrow('version')
    expect(() => validateVectorFile({ finkoreVectorFile: '0.1', vectors: [] }, metadata, 'x')).toThrow('non-empty')
  })
})

describe('adapter result validation', () => {
  it.each([
    { status: 'success', value: null },
    { status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT' } },
    { status: 'error', error: { code: 'FINKORE_MONEY_BAD_INPUT', details: { native: 3 } }, observations: {} },
  ])('accepts a normalized result', (result) => expect(isNormalizedResult(result)).toBe(true))

  it.each([
    null,
    { status: 'success' },
    { status: 'success', value: 1, error: {} },
    { status: 'error', value: 1, error: { code: 'FINKORE_MONEY_BAD_INPUT' } },
    { status: 'error', error: { code: 'bad' } },
    { status: 'error', error: { code: 4 } },
    { status: 'error', error: { code: ['FINKORE_MONEY_BAD_INPUT'] } },
    { status: 'error', error: null },
    { status: 'other', error: { code: 'FINKORE_MONEY_BAD_INPUT' } },
    { status: 'success', value: 1, observations: [] },
  ])('rejects invalid normalized result', (result) => expect(isNormalizedResult(result)).toBe(false))
})
