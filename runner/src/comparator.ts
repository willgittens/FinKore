// SPDX-License-Identifier: MPL-2.0
import { isDeepStrictEqual } from 'node:util'
import type { NormalizedResult } from './types/normalized-result.js'
import type { ExpectedResult } from './types/vector.js'

export type Comparison = { readonly matches: true } | { readonly matches: false; readonly diagnostic: string }

function describe(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? String(value)
}

function mismatch(label: string, expected: unknown, actual: unknown): Comparison {
  return { matches: false, diagnostic: `${label} mismatch\nExpected: ${describe(expected)}\nActual: ${describe(actual)}` }
}

export function compareResults(expected: ExpectedResult, actual: NormalizedResult): Comparison {
  if (expected.status === 'error') {
    if (actual.status !== 'error') return { matches: false, diagnostic: 'Expected error, actual success' }
    if (expected.error.code !== actual.error.code) {
      return { matches: false, diagnostic: `Expected error ${expected.error.code}, actual ${actual.error.code}` }
    }
    return isDeepStrictEqual(expected.observations, actual.observations)
      ? { matches: true }
      : mismatch('Observations', expected.observations, actual.observations)
  }
  if (actual.status !== 'success') return { matches: false, diagnostic: 'Expected success, actual error' }
  if (!isDeepStrictEqual(expected.value, actual.value)) return mismatch('Value', expected.value, actual.value)
  return isDeepStrictEqual(expected.observations, actual.observations)
    ? { matches: true }
    : mismatch('Observations', expected.observations, actual.observations)
}
