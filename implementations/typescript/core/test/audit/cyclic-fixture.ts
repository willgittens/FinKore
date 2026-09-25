// SPDX-License-Identifier: MPL-2.0
/**
 * Builds a genuine self-reference with a bounded read budget for negative tests.
 * Correct cycle detection rejects the repeated object after one member read.
 * Faulty recursive traversal instead throws an ordinary Error after eight reads,
 * which cannot satisfy the asserted portable Audit error. This prevents Stryker's
 * execution-count limiter from hiding the behavioral regression as a timeout.
 */
export function boundedCycle(array: boolean): unknown[] | Record<string, unknown> {
  const value: unknown[] | Record<string, unknown> = array ? [] : {}
  let reads = 0
  Object.defineProperty(value, array ? '0' : 'self', {
    enumerable: true,
    get: () => {
      if (++reads > 8) throw new Error('Cycle traversal exceeded the test read budget')
      return value
    },
  })
  return value
}
