// SPDX-License-Identifier: MPL-2.0
/** Tests artifact validation only; these cases do not execute or define financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { runConformanceCli, validateConformance, validateManifest } from '../validate-conformance.js'

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
        properties: {
          id: { type: 'string' },
          pairedControl: { type: 'string' },
          expected: { type: 'object' },
        },
      },
    },
  },
}

function fixture(files = [["./suite/vectors.json", ['example.case-001']]], override = {}) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-artifacts-'))
  mkdirSync(join(root, 'suite'))
  mkdirSync(join(root, 'spec'))
  writeFileSync(join(root, 'spec/conventions.md'), [
    '# Conventions',
    '## Error Codes',
    '| Domain | Code | Defined condition |',
    '| --- | --- | --- |',
    '| Example | `FINKORE_EXAMPLE_INVALID` | Invalid fixture. |',
  ].join('\n'))
  writeFileSync(join(root, 'vector.schema.json'), JSON.stringify(schema))
  for (const [path, entries] of files) {
    const absolute = resolve(root, path)
    mkdirSync(resolve(absolute, '..'), { recursive: true })
    writeFileSync(absolute, JSON.stringify({
      finkoreVectorFile: '0.1',
      vectors: entries.map((entry) => typeof entry === 'string' ? { id: entry } : entry),
    }))
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
  const { manifestPath, root } = fixture()
  assert.deepEqual(validateConformance(manifestPath, root), {
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
  assert.throws(() => validateConformance(manifestPath, root), /does not satisfy/)
})

test('rejects duplicate vector identifiers across declared files', () => {
  const { manifestPath, root } = fixture([
    ['./suite/one.json', ['example.case-001']],
    ['./suite/two.json', ['example.case-001']],
  ])
  assert.throws(() => validateConformance(manifestPath, root), /Duplicate vector id/)
})

test('accepts declared portable errors and rejects invented vector or supplementary errors', () => {
  const declared = { id: 'example.error-001', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVALID' } } }
  const { manifestPath, root } = fixture([["./suite/vectors.json", [declared]]])
  assert.equal(validateConformance(manifestPath, root).vectorCount, 1)

  declared.expected.error.code = 'FINKORE_EXAMPLE_INVENTED'
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors: [declared] }))
  assert.throws(() => validateConformance(manifestPath, root), /undeclared portable error/)

  declared.expected.error.code = 'FINKORE_EXAMPLE_INVALID'
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors: [declared] }))
  writeFileSync(join(root, 'boundary097-cases.json'), JSON.stringify({
    cases: [{ id: 'example.supplementary-001', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVENTED' } } }],
  }))
  assert.throws(() => validateConformance(manifestPath, root), /Supplementary case.*undeclared portable error/)
})

test('validates paired controls in manifest and supplementary namespaces', () => {
  const vectors = [
    { id: 'example.control-001' },
    { id: 'example.case-001', pairedControl: 'example.control-001' },
    { id: 'example.case-002', pairedControl: 'example.supplementary-001' },
  ]
  const { manifestPath, root } = fixture([["./suite/vectors.json", vectors]])
  writeFileSync(join(root, 'boundary097-cases.json'), JSON.stringify({
    purpose: 'Historical controls only.',
    cases: [{ id: 'example.supplementary-001', pairedControl: 'example.control-001' }],
  }))
  assert.equal(validateConformance(manifestPath, root).vectorCount, 3)

  vectors[2].pairedControl = 'example.missing-001'
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors }))
  assert.throws(() => validateConformance(manifestPath, root), /unknown pairedControl/)
})

test('conformance CLI exits unsuccessfully for an undeclared portable error', () => {
  const vector = { id: 'example.error-001', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVENTED' } } }
  const { manifestPath, root } = fixture([["./suite/vectors.json", [vector]]])
  const messages = []
  const status = runConformanceCli(manifestPath, root, { log: (message) => messages.push(message), error: (message) => messages.push(message) })
  assert.equal(status, 1)
  assert.match(messages.join('\n'), /undeclared portable error/)
})
