// SPDX-License-Identifier: MPL-2.0
/** Tests traceability metadata validation without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { runTraceabilityCli } from '../check-traceability.js'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'finkore-traceability-'))
  for (const directory of ['spec', 'conformance', 'agentic']) {
    cpSync(resolve(directory), join(root, directory), { recursive: true })
  }
  return root
}

function run(root) {
  const stdout = []
  const stderr = []
  const status = runTraceabilityCli(root, { log: (message) => stdout.push(message), error: (message) => stderr.push(message) })
  return { status, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

function mutateTraceability(root, update) {
  const path = join(root, 'conformance/traceability.md')
  const before = readFileSync(path, 'utf8')
  const after = update(before)
  assert.notEqual(after, before)
  writeFileSync(path, after)
}

test('accepts current traceability totals, modalities, classifications, and evidence', () => {
  const result = run(fixture())
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Traceability check passed/)
})

test('CLI rejects incorrect per-domain totals and modality classifications', () => {
  const totalRoot = fixture()
  mutateTraceability(totalRoot, (text) => text.replace('| Money | 74 |', '| Money | 999 |'))
  const total = run(totalRoot)
  assert.equal(total.status, 1)
  assert.match(total.stderr, /inventory Money requirements total must equal 74/)

  const modalityRoot = fixture()
  mutateTraceability(modalityRoot, (text) => text.replace(
    '| SPEC-COMPATIBILITY-005 | Shared | MUST / MUST NOT |',
    '| SPEC-COMPATIBILITY-005 | Shared | MAY |',
  ))
  const modality = run(modalityRoot)
  assert.equal(modality.status, 1)
  assert.match(modality.stderr, /modality MAY differs from specification modality MUST \/ MUST NOT/)
})

test('CLI rejects unsupported classifications and bad PARTIAL vector evidence', () => {
  const classificationRoot = fixture()
  mutateTraceability(classificationRoot, (text) => text.replace(
    '| WORKFLOW-GUARD-004 | Workflow | MUST / MUST NOT | PARTIAL |',
    '| WORKFLOW-GUARD-004 | Workflow | MUST / MUST NOT | SOMETIMES |',
  ))
  const classification = run(classificationRoot)
  assert.equal(classification.status, 1)
  assert.match(classification.stderr, /unsupported coverage classification SOMETIMES/)

  const evidenceRoot = fixture()
  mutateTraceability(evidenceRoot, (text) => text.replace(
    'Portable vectors exercise local guard evaluation, but the external-fact dependency declaration',
    'missing.vector-001 is alleged evidence, but the external-fact dependency declaration',
  ))
  const evidence = run(evidenceRoot)
  assert.equal(evidence.status, 1)
  assert.match(evidence.stderr, /WORKFLOW-GUARD-004 references unknown vector missing.vector-001/)
})
