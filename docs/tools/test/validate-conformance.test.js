// SPDX-License-Identifier: MPL-2.0
/** Tests artifact validation only; these cases do not execute or define financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { validateConformance, validateManifest } from '../validate-conformance.js'

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  additionalProperties: false,
  required: ['finkoreVectorFile', 'vectors'],
  properties: {
    finkoreVectorFile: { const: '0.1' },
    vectors: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  },
}

function fixture(files = [["./suite/vectors.json", ['example.case-001']]], override = {}) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-artifacts-'))
  mkdirSync(join(root, 'suite'))
  writeFileSync(join(root, 'vector.schema.json'), JSON.stringify(schema))
  for (const [path, ids] of files) {
    const absolute = resolve(root, path)
    mkdirSync(resolve(absolute, '..'), { recursive: true })
    writeFileSync(absolute, JSON.stringify({ finkoreVectorFile: '0.1', vectors: ids.map((id) => ({ id })) }))
  }
  const manifest = {
    finkoreConformance: '0.1',
    vectorSchema: './vector.schema.json',
    suites: [{ id: 'example', vectorFiles: files.map(([path]) => path) }],
    ...override,
  }
  const manifestPath = join(root, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest))
  return { root, manifestPath }
}

test('validates the published manifest and every declared vector file', () => {
  const result = validateConformance(resolve('conformance/manifest.json'))
  assert.ok(result.suiteCount > 0)
  assert.ok(result.vectorFileCount > 0)
  assert.ok(result.vectorCount > 0)
})

test('loads valid fixture artifacts and reports their counts', () => {
  const { manifestPath } = fixture()
  assert.deepEqual(validateConformance(manifestPath), {
    manifestPath,
    suiteCount: 1,
    vectorFileCount: 1,
    vectorCount: 1,
  })
})

test('rejects malformed manifests and unsafe declared paths', () => {
  assert.throws(() => validateManifest(null), /must be an object/)
  assert.throws(() => validateManifest({ finkoreConformance: '0.2' }), /version/)
  assert.throws(() => validateConformance(fixture([], {
    vectorSchema: '../schema.json',
    suites: [{ id: 'example', vectorFiles: ['./suite/vectors.json'] }],
  }).manifestPath), /escapes or resolves/)
})

test('rejects vector files that fail the published schema', () => {
  const { manifestPath, root } = fixture()
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.2', vectors: [] }))
  assert.throws(() => validateConformance(manifestPath), /does not satisfy/)
})

test('rejects duplicate vector identifiers across declared files', () => {
  const { manifestPath } = fixture([
    ['./suite/one.json', ['example.case-001']],
    ['./suite/two.json', ['example.case-001']],
  ])
  assert.throws(() => validateConformance(manifestPath), /Duplicate vector id/)
})
