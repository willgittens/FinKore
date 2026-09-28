// SPDX-License-Identifier: MPL-2.0
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { ApprovalComposition } from '../../src/index.js'

interface Vector {
  id: string
  operation: string
  input: Record<string, unknown>
  expected: { status: 'success'; value: unknown } | { status: 'error'; error: { code: string } }
}
let root = import.meta.dirname
while (!existsSync(resolve(root, 'conformance/manifest.json'))) {
  const parent = resolve(root, '..')
  if (parent === root) throw new Error('Conformance manifest not found')
  root = parent
}
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as { suites: { vectorFiles: string[] }[] }
const vectors = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: Vector[] }).vectors,
).filter(v => v.operation === 'approval.composition.evaluate')
if (!vectors.length) throw new Error('No composition vectors discovered')
for (const v of vectors) it(v.id, () => {
  const input = structuredClone(v.input)
  const before = structuredClone(input)
  const invoke = () => ApprovalComposition.from(input.composition).evaluate(input as unknown as Parameters<ApprovalComposition['evaluate']>[0])
  try {
    if (v.expected.status === 'success') expect(invoke()).toEqual(v.expected.value)
    else expect(invoke).toThrowError(expect.objectContaining({ code: v.expected.error.code }))
  } finally { expect(input).toEqual(before) }
})
