// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { compareResults } from '../src/comparator.js'

describe('exact result comparison', () => {
  it('matches structurally equal objects independent of key order', () => {
    expect(compareResults(
      { status: 'success', value: { amount: '15.50', currency: 'EUR', nested: [1, null] } },
      { status: 'success', value: { nested: [1, null], currency: 'EUR', amount: '15.50' } },
    )).toEqual({ matches: true })
  })

  it.each([
    [{ amount: '15.50' }, { amount: '15.5' }],
    [{ nested: { value: 1 } }, { nested: { value: 2 } }],
    [[1, 2], [1]],
    [{ a: 1 }, { a: 1, b: 2 }],
    [null, {}],
  ])('detects exact mismatch %#', (expected, actual) => {
    const result = compareResults({ status: 'success', value: expected }, { status: 'success', value: actual })
    expect(result.matches).toBe(false)
    expect(result.diagnostic).toContain('Value mismatch')
  })

  it('rejects success/error inversions in both directions', () => {
    expect(compareResults({ status: 'success', value: 1 }, { status: 'error', error: { code: 'FINKORE_MONEY_BAD' } }))
      .toEqual({ matches: false, diagnostic: 'Expected success, actual error' })
    expect(compareResults({ status: 'error', error: { code: 'FINKORE_MONEY_BAD' } }, { status: 'success', value: 1 }))
      .toEqual({ matches: false, diagnostic: 'Expected error, actual success' })
  })

  it('compares portable error code and observations but ignores details', () => {
    expect(compareResults(
      { status: 'error', error: { code: 'FINKORE_MONEY_BAD' }, observations: { state: 'A' } },
      { status: 'error', error: { code: 'FINKORE_MONEY_BAD', details: { native: 'x' } }, observations: { state: 'A' } },
    )).toEqual({ matches: true })
    const errorMismatch = compareResults(
      { status: 'error', error: { code: 'FINKORE_MONEY_BAD' } },
      { status: 'error', error: { code: 'FINKORE_MONEY_OTHER' } },
    )
    expect(errorMismatch.matches).toBe(false)
    expect(errorMismatch.diagnostic).toContain('FINKORE_MONEY_OTHER')
    expect(compareResults(
      { status: 'error', error: { code: 'FINKORE_MONEY_BAD' }, observations: { state: 'A' } },
      { status: 'error', error: { code: 'FINKORE_MONEY_BAD' }, observations: { state: 'B' } },
    ).diagnostic).toContain('Observations mismatch')
    expect(compareResults(
      { status: 'success', value: 1, observations: { state: 'A' } },
      { status: 'success', value: 1, observations: { state: 'B' } },
    ).diagnostic).toContain('Observations mismatch')
  })
})
