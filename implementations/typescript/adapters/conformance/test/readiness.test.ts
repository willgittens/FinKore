// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { createConformanceRunner } from '@finkore/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const root = resolve(import.meta.dirname, '../../../../..')
const manifestPath = resolve(root, 'conformance/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { suites: { vectorFiles: string[] }[] }
for (const file of manifest.suites.flatMap(suite => suite.vectorFiles).filter(file => file.endsWith('/readiness-regressions.json'))) {
  const document = JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: { id: string }[] }
  it('passes ' + file + ' including all valid controls', async () => {
    const report = await createConformanceRunner({ manifestPath, adapter: createTypeScriptConformanceAdapter() }).run({ vectorIds: document.vectors.map(vector => vector.id) })
    expect(report.summary.total).toBe(document.vectors.length)
    expect(report.results.filter(result => result.status !== 'PASS').map(result => ({ id: result.vectorId, status: result.status }))).toEqual([])
  })
}
