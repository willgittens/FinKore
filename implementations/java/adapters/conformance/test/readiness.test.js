// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createJavaConformanceAdapter } from '../adapter.js'

const manifest = JSON.parse(readFileSync('conformance/manifest.json', 'utf8'))
const vectors = manifest.suites.flatMap(suite => suite.vectorFiles)
  .filter(path => path.endsWith('/readiness-regressions.json'))
  .flatMap(path => JSON.parse(readFileSync('conformance/' + path, 'utf8')).vectors)
const adapter = createJavaConformanceAdapter({})

for (const vector of vectors) {
  test(vector.id, () => {
    const input = structuredClone(vector.input)
    const before = structuredClone(input)
    const actual = adapter.execute({ operationId: vector.operation, input, ...(vector.context === undefined ? {} : { context: vector.context }) })
    assert.deepEqual(input, before, 'Adapter must preserve supplied observations')
    assert.deepEqual(actual, vector.expected)
  })
}
