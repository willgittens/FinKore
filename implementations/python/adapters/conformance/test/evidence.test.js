// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createConformanceRunner } from '../../../../../runner/dist/index.js'
import { createPythonConformanceAdapter } from '../adapter.js'

const manifestPath = 'conformance/manifest.json'
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const ids = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file => JSON.parse(readFileSync('conformance/' + file, 'utf8')).vectors).filter(v => v.id.includes('.boundary097.')).map(v => v.id)
test('Core 0.9.7 exact portable regressions', async () => {
  assert.ok(ids.length)
  const adapter = createPythonConformanceAdapter({ pythonPath: process.env.FINKORE_PYTHON_PATH ?? '.tools/bin/python3.12' })
  const report = await createConformanceRunner({ manifestPath, adapter }).run({ vectorIds: ids })
  assert.deepEqual(report.results.filter(r => r.status !== 'PASS'), [])
})

const cases = JSON.parse(readFileSync('conformance/boundary097-cases.json', 'utf8')).cases
for (const candidate of cases) test(candidate.id + ' domain result and unchanged input', () => {
  const input = structuredClone(candidate.input)
  const before = structuredClone(input)
  try {
    const actual = createPythonConformanceAdapter({ pythonPath: process.env.FINKORE_PYTHON_PATH ?? '.tools/bin/python3.12' }).execute({ operationId: candidate.operation, input, ...(candidate.context === undefined ? {} : { context: candidate.context }) })
    assert.equal(actual.status, candidate.expected.status)
    if (candidate.expected.status === 'error') assert.deepEqual(actual.error, candidate.expected.error)
    else assert.deepEqual(actual.value, candidate.expected.value)
  } finally { assert.deepEqual(input, before) }
})
