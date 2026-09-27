// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { createConformanceRunner } from '@finkore/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const root = resolve(import.meta.dirname, '../../../../..')
const manifestPath = resolve(root, 'conformance/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { suites: { vectorFiles: string[] }[] }
const ids = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: { id: string }[] }).vectors,
).filter(v => v.id.includes('.boundary097.')).map(v => v.id)
it('Core 0.9.7 adapters preserve exact result values and portable errors', async () => {
  expect(ids.length).toBeGreaterThan(0)
  const report = await createConformanceRunner({ manifestPath, adapter: createTypeScriptConformanceAdapter() }).run({ vectorIds: ids })
  expect(report.results.filter(r => r.status !== 'PASS')).toEqual([])
})

interface SupplementaryCase {
  id: string
  operation: string
  input: Record<string, unknown>
  context?: Record<string, unknown>
  expected: { status: 'success'; value: unknown } | { status: 'error'; error: { code: string } }
}
const cases = (JSON.parse(readFileSync(resolve(root, 'conformance/boundary097-cases.json'), 'utf8')) as { cases: SupplementaryCase[] }).cases
for (const candidate of cases) it(candidate.id + ' domain result and unchanged input', async () => {
  const input = structuredClone(candidate.input)
  const before = structuredClone(input)
  try {
    const actual = await createTypeScriptConformanceAdapter().execute({ operationId: candidate.operation, input, ...(candidate.context === undefined ? {} : { context: candidate.context }) })
    expect(actual.status).toBe(candidate.expected.status)
    if (candidate.expected.status === 'error') expect(actual).toMatchObject({ error: candidate.expected.error })
    else expect('value' in actual ? actual.value : undefined).toEqual(candidate.expected.value)
  } finally { expect(input).toEqual(before) }
})
