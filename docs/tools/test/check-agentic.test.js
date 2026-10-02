// SPDX-License-Identifier: MPL-2.0
/** Tests Agentic metadata consistency without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { validateAgenticConsistency } from '../check-agentic.js'

function fixture({ registry = true, descriptor = true, vectorOperation = 'finkore.example.run', errorCode = 'FINKORE_EXAMPLE_INVALID' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-agentic-'))
  mkdirSync(join(root, 'spec/example'), { recursive: true })
  mkdirSync(join(root, 'agentic'))
  mkdirSync(join(root, 'conformance/example'), { recursive: true })
  writeFileSync(join(root, 'spec/example/behavior.md'), `**EXAMPLE-BEHAVIOR-001** — Required behavior.\n\`${errorCode}\`\n`)
  writeFileSync(join(root, 'agentic/operations.md'), [
    '# Operations',
    registry ? '| `finkore.example.run` | Example |' : '',
    descriptor ? '## `finkore.example.run`' : '',
    '**EXAMPLE-BEHAVIOR-001**',
    `\`${errorCode}\``,
  ].join('\n'))
  writeFileSync(join(root, 'conformance/manifest.json'), JSON.stringify({
    suites: [{ id: 'example', vectorFiles: ['./example/vectors.json'] }],
  }))
  writeFileSync(join(root, 'conformance/example/vectors.json'), JSON.stringify({
    vectors: [{ operation: vectorOperation }],
  }))
  return root
}

test('accepts aligned registry, descriptor, specification, and vector identifiers', () => {
  const result = validateAgenticConsistency(fixture())
  assert.deepEqual(result, { operationCount: 1, requirementReferenceCount: 1, portableErrorReferenceCount: 1 })
})

test('rejects missing canonical registrations and descriptors', () => {
  assert.throws(() => validateAgenticConsistency(fixture({ registry: false })), /absent from Agentic registry/)
  assert.throws(() => validateAgenticConsistency(fixture({ descriptor: false })), /lacks a descriptor/)
})

test('rejects Agentic portable errors absent from the specification', () => {
  const root = fixture()
  writeFileSync(join(root, 'agentic/errors.md'), '`FINKORE_EXAMPLE_INVENTED`')
  assert.throws(() => validateAgenticConsistency(root), /unknown portable error/)
})
