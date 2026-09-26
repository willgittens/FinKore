// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { createConformanceRunner } from '@finkore/conformance-runner'
import { createTypeScriptConformanceAdapter } from '../src/adapter.js'

const root = resolve(import.meta.dirname, '../../../../..')
const manifestPath = resolve(root, 'conformance/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { suites: { vectorFiles: string[] }[] }
const vectors = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: { id: string }[] }).vectors,
).filter(v => v.id.includes('.boundary096.'))
it('Core 0.9.6 adapter boundaries retain exact results, presence and portable errors', async () => {
  expect(vectors.length).toBeGreaterThan(0)
  const report = await createConformanceRunner({ manifestPath, adapter: createTypeScriptConformanceAdapter() }).run({ vectorIds: vectors.map(v => v.id) })
  expect(report.results.filter(r => r.status !== 'PASS')).toEqual([])
})
