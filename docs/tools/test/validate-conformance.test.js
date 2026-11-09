// SPDX-License-Identifier: MPL-2.0
/** Tests artifact validation only; these cases do not execute or define financial behavior. */
import assert from 'node:assert/strict'
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
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
        required: ['id', 'operation'],
        properties: {
          id: { type: 'string' },
          operation: { type: 'string' },
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
  mkdirSync(join(root, 'conformance'))
  writeFileSync(join(root, 'spec/conventions.md'), [
    '# Conventions',
    '## Error Codes',
    '| Domain | Code | Defined condition |',
    '| --- | --- | --- |',
    '| Example | `FINKORE_EXAMPLE_INVALID` | Invalid fixture. |',
  ].join('\n'))
  writeFileSync(join(root, 'conformance/operations.md'), [
    '# Operation contracts',
    '## Error association checks',
    '| Operation labels | Permitted error catalogs | Excluded existing errors | Governing specification |',
    '| --- | --- | --- | --- |',
    '| `example.operation` | `Example` | none | Fixture declaration. |',
    '## Operations',
    '| Operation | Request | Result |',
    '| --- | --- | --- |',
    '| `example.operation` | Fixture input. | Fixture observation. |',
  ].join('\n'))
  writeFileSync(join(root, 'vector.schema.json'), JSON.stringify(schema))
  for (const [path, entries] of files) {
    const absolute = resolve(root, path)
    mkdirSync(resolve(absolute, '..'), { recursive: true })
    writeFileSync(absolute, JSON.stringify({
      finkoreVectorFile: '0.1',
      vectors: entries.map((entry) => ({ operation: 'example.operation', ...(typeof entry === 'string' ? { id: entry } : entry) })),
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

test('CLI rejects external schema and vector symlinks before parsing their targets', (t) => {
  const cases = [
    { label: 'schema file', path: 'vector.schema.json' },
    { label: 'schema directory', path: 'schemas', directory: true },
    { label: 'vector file', path: 'suite/vectors.json' },
    { label: 'vector directory', path: 'suite', directory: true },
  ]
  for (const entry of cases) {
    const { manifestPath, root } = fixture()
    const outside = `${root}-outside`
    mkdirSync(outside)
    t.after(() => {
      rmSync(root, { recursive: true, force: true })
      rmSync(outside, { recursive: true, force: true })
    })
    const isSchema = entry.label.startsWith('schema')
    if (entry.path === 'schemas') {
      mkdirSync(join(root, entry.path))
      writeFileSync(join(root, entry.path, 'schema.json'), JSON.stringify(schema))
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      manifest.vectorSchema = './schemas/schema.json'
      writeFileSync(manifestPath, JSON.stringify(manifest))
    }
    assert.equal(cliResult(manifestPath, root).status, 0, entry.label)
    const path = join(root, entry.path)
    const target = join(outside, 'target')
    renameSync(path, target)
    symlinkSync(target, path, entry.directory ? 'dir' : 'file')
    for (const invalidJson of [false, true]) {
      if (invalidJson) {
        const targetFile = entry.directory ? join(target, isSchema ? 'schema.json' : 'vectors.json') : target
        writeFileSync(targetFile, 'not JSON')
      }
      const result = cliResult(manifestPath, root)
      assert.equal(result.status, 1, entry.label)
      assert.match(result.message, /escapes or resolves to the conformance root after resolving symlinks/)
      assert.match(result.message, isSchema ? /Vector schema path/ : /Vector path for suite example/)
      assert.doesNotMatch(result.message, /Cannot read valid JSON|SyntaxError|TypeError/)
    }
  }
})

test('CLI accepts internal file/directory links and a symlinked checkout root', (t) => {
  const { manifestPath, root } = fixture()
  const alias = `${root}-alias`
  t.after(() => {
    rmSync(alias, { recursive: true, force: true })
    rmSync(root, { recursive: true, force: true })
  })
  renameSync(join(root, 'vector.schema.json'), join(root, 'retained-schema.json'))
  symlinkSync('./retained-schema.json', join(root, 'vector.schema.json'), 'file')
  renameSync(join(root, 'suite'), join(root, 'retained-suite'))
  symlinkSync('./retained-suite', join(root, 'suite'), 'dir')
  assert.equal(cliResult(manifestPath, root).status, 0)
  symlinkSync(root, alias, 'dir')
  const result = cliResult(join(alias, 'manifest.json'), alias)
  assert.equal(result.status, 0, result.message)
  assert.match(result.message, /1 suites, 1 files, 1 vectors/)
})

test('CLI reports missing, broken, and non-file schema/vector paths without crashing', (t) => {
  for (const path of ['vector.schema.json', 'suite/vectors.json']) {
    for (const kind of ['missing', 'broken', 'directory']) {
      const { manifestPath, root } = fixture()
      t.after(() => rmSync(root, { recursive: true, force: true }))
      const target = join(root, path)
      rmSync(target)
      if (kind === 'broken') symlinkSync('./missing.json', target, 'file')
      if (kind === 'directory') mkdirSync(target)
      const result = cliResult(manifestPath, root)
      assert.equal(result.status, 1, `${path}: ${kind}`)
      assert.match(result.message, kind === 'directory' ? /is not a regular file/ : /Cannot resolve Vector/)
      assert.doesNotMatch(result.message, /TypeError|SyntaxError/)
    }
  }
})

test('CLI preserves read-error diagnostics for an unreadable artifact', (t) => {
  const { manifestPath, root } = fixture()
  const path = join(root, 'suite/vectors.json')
  t.after(() => {
    chmodSync(path, 0o600)
    rmSync(root, { recursive: true, force: true })
  })
  chmodSync(path, 0)
  try {
    readFileSync(path)
    t.skip('This process can read mode-000 files; unreadability cannot be exercised with these privileges.')
    return
  } catch (error) {
    assert.equal(error.code, 'EACCES')
  }
  const result = cliResult(manifestPath, root)
  assert.equal(result.status, 1)
  assert.match(result.message, /Cannot read valid JSON for vector file in suite example/)
})

test('CLI rejects lexical escapes and root targets for schema and vector declarations', (t) => {
  for (const field of ['vectorSchema', 'vectorFiles']) {
    for (const path of ['../outside.json', './suite/../../outside.json', '.']) {
      const { manifestPath, root } = fixture()
      t.after(() => rmSync(root, { recursive: true, force: true }))
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      if (field === 'vectorSchema') manifest.vectorSchema = path
      else manifest.suites[0].vectorFiles = [path]
      writeFileSync(manifestPath, JSON.stringify(manifest))
      const result = cliResult(manifestPath, root)
      assert.equal(result.status, 1)
      assert.match(result.message, /escapes or resolves to the conformance root/)
    }
  }
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

test('accepts declared portable errors and rejects invented vector errors', () => {
  const declared = { id: 'example.error-001', operation: 'example.operation', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVALID' } } }
  const { manifestPath, root } = fixture([["./suite/vectors.json", [declared]]])
  assert.equal(validateConformance(manifestPath, root).vectorCount, 1)

  declared.expected.error.code = 'FINKORE_EXAMPLE_INVENTED'
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors: [declared] }))
  assert.throws(() => validateConformance(manifestPath, root), /undeclared portable error/)
})

test('validates paired controls only among manifest-listed vectors', () => {
  const vectors = [
    { id: 'example.case-001', operation: 'example.operation', pairedControl: 'example.control-001' },
    { id: 'example.case-002', operation: 'example.operation', pairedControl: 'example.case-001' },
  ]
  const { manifestPath, root } = fixture([
    ['./suite/vectors.json', vectors],
    ['./suite/controls.json', ['example.control-001']],
  ])
  writeFileSync(join(root, 'unlisted.json'), JSON.stringify({
    finkoreVectorFile: '0.1',
    vectors: [{ id: 'example.unlisted-001' }],
  }))
  writeFileSync(join(root, 'unlisted-invalid.json'), 'not JSON')
  assert.equal(validateConformance(manifestPath, root).vectorCount, 3)

  for (const control of ['example.unlisted-001', 'example.missing-001']) {
    vectors[1].pairedControl = control
    writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors }))
    const messages = []
    const status = runConformanceCli(manifestPath, root, {
      log: (message) => messages.push(message),
      error: (message) => messages.push(message),
    })
    assert.equal(status, 1)
    assert.equal(messages.join('\n'), `Vector example.case-002 references unknown pairedControl: ${control}`)
  }
})

test('conformance CLI exits unsuccessfully for an undeclared portable error', () => {
  const vector = { id: 'example.error-001', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVENTED' } } }
  const { manifestPath, root } = fixture([["./suite/vectors.json", [vector]]])
  const messages = []
  const status = runConformanceCli(manifestPath, root, { log: (message) => messages.push(message), error: (message) => messages.push(message) })
  assert.equal(status, 1)
  assert.match(messages.join('\n'), /undeclared portable error/)
})

function publishedFixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-error-associations-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const directory of ['spec', 'conformance']) cpSync(resolve(directory), join(root, directory), { recursive: true })
  return { root, manifestPath: join(root, 'conformance/manifest.json') }
}

function changeVector(root, id, update) {
  const manifest = JSON.parse(readFileSync(join(root, 'conformance/manifest.json'), 'utf8'))
  for (const suite of manifest.suites) {
    for (const file of suite.vectorFiles) {
      const path = resolve(root, 'conformance', file)
      const artifact = JSON.parse(readFileSync(path, 'utf8'))
      const vector = artifact.vectors.find((candidate) => candidate.id === id)
      if (vector === undefined) continue
      update(vector)
      writeFileSync(path, JSON.stringify(artifact))
      return
    }
  }
  assert.fail(`Missing test source vector: ${id}`)
}

function cliResult(manifestPath, root) {
  const messages = []
  const status = runConformanceCli(manifestPath, root, { log: (message) => messages.push(message), error: (message) => messages.push(message) })
  return { status, message: messages.join('\n') }
}

test('CLI rejects cross-catalog and explicitly excluded errors on a published Money operation', (t) => {
  const { manifestPath, root } = publishedFixture(t)
  assert.equal(cliResult(manifestPath, root).status, 0)
  for (const code of ['FINKORE_WORKFLOW_INVALID_TRANSITION', 'FINKORE_MONEY_DIVISION_BY_ZERO']) {
    changeVector(root, 'money.add.currency-mismatch-001', (vector) => { vector.expected.error.code = code })
    const result = cliResult(manifestPath, root)
    assert.equal(result.status, 1)
    assert.equal(result.message, `Vector money.add.currency-mismatch-001 references portable error ${code} not associated with operation finkore.money.add`)
  }
  changeVector(root, 'money.add.currency-mismatch-001', (vector) => { vector.expected.error.code = 'FINKORE_MONEY_CURRENCY_MISMATCH' })
  assert.equal(cliResult(manifestPath, root).status, 0)
})

test('non-exhaustive Agentic errors do not exclude Money input validation', (t) => {
  const { manifestPath, root } = publishedFixture(t)
  const descriptor = readFileSync(resolve('agentic/operations.md'), 'utf8').split('## `finkore.money.add`')[1].split('\n## ')[0]
  assert.match(descriptor, /this list is not exhaustive/)
  changeVector(root, 'money.add.currency-mismatch-001', (vector) => {
    vector.input.left.amount = 'not-a-decimal'
    vector.expected = { status: 'error', error: { code: 'FINKORE_MONEY_INVALID_AMOUNT' } }
  })
  assert.equal(cliResult(manifestPath, root).status, 0)
})

test('composed Entity operations preserve primary Audit and Workflow error associations', (t) => {
  const { manifestPath, root } = publishedFixture(t)
  changeVector(root, 'entity.evolution.audit-failure-001', (vector) => {
    assert.equal(vector.operation, 'finkore.entity.evolution.correct')
    assert.equal(vector.expected.error.code, 'FINKORE_AUDIT_INVALID_EVENT')
  })
  // This additional declared composition association does not determine which
  // error is primary for the fixture's particular input.
  changeVector(root, 'entity.evolution.audit-failure-001', (vector) => { vector.expected.error.code = 'FINKORE_WORKFLOW_INVALID_DEFINITION' })
  assert.equal(cliResult(manifestPath, root).status, 0)
})

test('catalog associations use explicit declarations rather than code or operation prefixes', (t) => {
  const vector = { id: 'example.error-001', operation: 'example.operation', expected: { status: 'error', error: { code: 'FINKORE_WORKFLOW_INVALID_TRANSITION' } } }
  const { manifestPath, root } = fixture([['./suite/vectors.json', [vector]]])
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const catalogPath = join(root, 'spec/conventions.md')
  writeFileSync(catalogPath, readFileSync(catalogPath, 'utf8') + '\n' + [
    '| Example | `FINKORE_WORKFLOW_INVALID_TRANSITION` | Synthetic validation category. |',
    '| Other | `FINKORE_EXAMPLE_FOREIGN` | Another synthetic catalog. |',
  ].join('\n'))
  assert.equal(cliResult(manifestPath, root).status, 0)
  vector.expected.error.code = 'FINKORE_EXAMPLE_FOREIGN'
  writeFileSync(join(root, 'suite/vectors.json'), JSON.stringify({ finkoreVectorFile: '0.1', vectors: [vector] }))
  const result = cliResult(manifestPath, root)
  assert.equal(result.status, 1)
  assert.match(result.message, /FINKORE_EXAMPLE_FOREIGN not associated with operation example\.operation/)
})

test('CLI rejects missing, malformed, duplicate, and unresolved association metadata', (t) => {
  const row = '| `example.operation` | `Example` | none | Fixture declaration. |'
  const cases = [
    [(text) => text.replace('## Error association checks', '## Other metadata'), /no Error association checks section/],
    [(text) => text.replace(row, ''), /no operation error associations/],
    [(text) => text.replace(row, row + '\n' + row), /Duplicate operation error association: example\.operation/],
    [(text) => text.replace('`Example` | none', '`Unknown` | none'), /unknown catalog: Unknown/],
    [(text) => text.replace('`Example` | none', '`Example`, `Example` | none'), /Invalid permitted catalogs/],
    [(text) => text.replace('| none |', '| `FINKORE_EXAMPLE_INVENTED` |'), /excludes undeclared portable error/],
    [(text) => text.replace('| none |', '| FINKORE_EXAMPLE_INVALID |'), /Invalid excluded errors/],
    [(text) => text.replace(row, '| `example.operation` | `Example` | none |'), /Malformed operation error association row/],
    [(text) => text.replace(row, row.replace('example.operation', 'example.unknown')), /operation absent from operation contracts: example\.unknown/],
    [(text) => text + '\n| `example.unmapped` | Fixture input. | Fixture observation. |', /Operation contract lacks error association: example\.unmapped/],
  ]
  for (const [update, diagnostic] of cases) {
    const { manifestPath, root } = fixture()
    t.after(() => rmSync(root, { recursive: true, force: true }))
    const path = join(root, 'conformance/operations.md')
    const before = readFileSync(path, 'utf8')
    const after = update(before)
    assert.notEqual(after, before)
    writeFileSync(path, after)
    const result = cliResult(manifestPath, root)
    assert.equal(result.status, 1)
    assert.match(result.message, diagnostic)
  }
  const { manifestPath, root } = fixture([['./suite/vectors.json', [{ id: 'example.unmapped-001', operation: 'example.unknown' }]]])
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = cliResult(manifestPath, root)
  assert.equal(result.status, 1)
  assert.match(result.message, /no documented error association for operation: example\.unknown/)
})

test('published schema rejects malformed result envelopes while retaining negative domain inputs', (t) => {
  const { manifestPath, root } = publishedFixture(t)
  const id = 'money.add.currency-mismatch-001'
  let original
  changeVector(root, id, (vector) => { original = structuredClone(vector) })
  const malformed = [
    (vector) => { vector.privateMetadata = true },
    (vector) => { vector.expected.privateMetadata = true },
    (vector) => { vector.expected.value = null },
    (vector) => { vector.expected.error.message = 'not part of the portable error envelope' },
  ]
  for (const update of malformed) {
    changeVector(root, id, (vector) => { Object.assign(vector, structuredClone(original)); update(vector) })
    const result = cliResult(manifestPath, root)
    assert.equal(result.status, 1)
    assert.match(result.message, /Vector file does not satisfy its declared schema/)
    assert.match(result.message, /additional properties/)
    changeVector(root, id, (vector) => {
      for (const key of Object.keys(vector)) delete vector[key]
      Object.assign(vector, structuredClone(original))
    })
  }
  changeVector(root, id, (vector) => {
    vector.input.left = null
    vector.expected = { status: 'error', error: { code: 'FINKORE_MONEY_INVALID_AMOUNT' } }
  })
  assert.equal(cliResult(manifestPath, root).status, 0)
})
