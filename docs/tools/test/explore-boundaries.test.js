// SPDX-License-Identifier: MPL-2.0
// Tests deterministic investigation and case/control metadata without changing
// implementation files or defining financial behavior.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { explorationCases, memberPaths, manifestVectors } from '../explore-boundaries.js'
import { classify } from '../classify-boundaries.js'

const seed = { id: 'example.control-001', operation: 'example.operation', input: JSON.parse('{"__proto__":{"value":1},"items":[{"deep":{"leaf":1}},{"deep":{"leaf":2}}]}'), context: { evaluatedAt: '2026-09-01T10:00:00Z' }, expected: { status: 'success', value: 1 } }
test('investigation requests isolate input, preserve context, and treat special names as own members', () => {
  const before = structuredClone(seed)
  const cases = explorationCases([seed])
  const changed = cases.find(c => c.path.join('.') === '__proto__.value' && c.mutation === 'zero')
  assert.equal(changed.input.__proto__.value, 0)
  assert.deepEqual(changed.context, seed.context)
  assert.equal(Object.hasOwn(changed.input, '__proto__'), true)
  assert.equal(Object.getPrototypeOf(changed.input), Object.prototype)
  assert.deepEqual(seed, before)
  changed.input.items[0].deep.leaf = 999
  assert.equal(cases.find(c => c.mutation === 'control').input.items[0].deep.leaf, 1)
  assert.equal(cases.some(c => c.mutation === 'omit' && typeof c.path.at(-1) === 'number'), false)
})
test('expanded investigation includes error seeds and deeper first and last array positions deterministically', () => {
  const error = { ...structuredClone(seed), id: 'example.rejected-001', expected: { status: 'error', error: { code: 'FINKORE_EXAMPLE_INVALID' } } }
  const cases = explorationCases([seed, error], 'expanded')
  assert.deepEqual(cases, explorationCases([seed, error], 'expanded'))
  assert.deepEqual(cases.filter(c => c.mutation === 'control').map(c => c.seed), [seed.id, error.id])
  assert.ok(memberPaths(seed.input, 6, true).some(p => p.join('.') === 'items.1.deep.leaf'))
  assert.equal(memberPaths(seed.input).some(p => p.length > 3), false)
})
test('classification refuses unknown differences and distinguishes the unresolved policy gap', () => {
  const lead = { statusDifference: true, exception: false, mutated: false }
  assert.throws(() => classify({ id: 'new', path: ['new'], operationId: 'unknown' }, lead, [], seed), /Unclassified/)
  assert.equal(classify({ id: 'gap', path: ['policy', 'id'], operationId: 'audit.redact' }, lead, [], seed).classification, 'contract gap')
  assert.throws(() => classify({ id: 'changed', path: [], operationId: 'unknown' }, { mutated: true }, [], seed), /Unclassified input mutation/)
})
test('all permanent discovery cases retain specification references and resolvable independent controls', () => {
  const vectors = manifestVectors(process.cwd())
  const supplementary = JSON.parse(readFileSync('conformance/boundary097-cases.json', 'utf8')).cases
  const all = [...vectors, ...supplementary]
  const ids = new Set(all.map(v => v.id))
  assert.equal(ids.size, all.length)
  const newCases = all.filter(v => v.id.includes('.boundary097.'))
  assert.ok(newCases.length > 0)
  for (const v of newCases) {
    assert.ok(v.requirements.length > 0, v.id)
    if (v.pairedControl) assert.ok(ids.has(v.pairedControl) && v.pairedControl !== v.id, v.id)
    assert.notEqual(v.reviewFinding, 'D8', 'Unresolved policy semantics cannot have a normative oracle')
  }
})

test('D11 treats omitted successful import history as a defect, not a permitted difference', () => {
  const candidate = { id: 'history', path: ['import', 'historicalRevisions'], operationId: 'entity.import' }
  const lead = { statusDifference: false, exception: false, mutated: false }
  const entity = { id: 'invoice' }
  const missing = { status: 'success', value: { entity } }
  const empty = { status: 'success', value: { entity, historicalRevisions: [] } }
  const result = classify(candidate, lead, [missing, empty], seed)
  assert.equal(result.classification, 'confirmed defect')
  assert.equal(result.family, 'D11')
  assert.deepEqual(result.requirements, ['ENTITY-IMPORT-012'])
  assert.throws(() => classify(candidate, lead, [empty, empty], seed), /Unclassified/)
  assert.throws(() => classify(candidate, lead, [missing, { ...empty, value: { entity, historicalRevisions: null } }], seed), /Unclassified/)
})
