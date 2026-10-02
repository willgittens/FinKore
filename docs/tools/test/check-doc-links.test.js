// SPDX-License-Identifier: MPL-2.0
/** Tests documentation reference validation without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { runDocumentationCli } from '../check-doc-links.js'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'finkore-doc-links-'))
  for (const directory of ['spec', 'conformance', 'agentic', 'docs']) {
    cpSync(resolve(directory), join(root, directory), { recursive: true })
  }
  for (const file of ['AGENTS.md', 'CONTRIBUTING.md', 'LICENSE', 'LICENSING.md', 'NOTICE.md', 'README.md', 'THIRD_PARTY_LICENSES.md', 'TRADEMARKS.md']) {
    cpSync(resolve(file), join(root, file))
  }
  return root
}

function run(root) {
  const stdout = []
  const stderr = []
  const status = runDocumentationCli(root, { log: (message) => stdout.push(message), error: (message) => stderr.push(message) })
  return { status, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

test('accepts valid CoreDoc IDs, ranges, local links, and Markdown fragments', () => {
  const root = fixture()
  writeFileSync(join(root, 'docs/fragment-control.md'), '[valid](../spec/conventions.md#compatibility-policy)\n')
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Documentation references passed/)
})

test('CLI rejects unknown CoreDoc prefixes and missing IDs under known prefixes', () => {
  const prefixRoot = fixture()
  const prefixPath = join(prefixRoot, 'docs/coreDoc/core-doc.md')
  writeFileSync(prefixPath, `${readFileSync(prefixPath, 'utf8')}\nINVENTED-RULE-001\n`)
  const prefix = run(prefixRoot)
  assert.equal(prefix.status, 1)
  assert.match(prefix.stderr, /Unknown CoreDoc requirement prefixes/)
  assert.match(prefix.stderr, /INVENTED-RULE/)

  const idRoot = fixture()
  const idPath = join(idRoot, 'docs/coreDoc/core-doc.md')
  writeFileSync(idPath, `${readFileSync(idPath, 'utf8')}\nMONEY-ARITHMETIC-999\n`)
  const id = run(idRoot)
  assert.equal(id.status, 1)
  assert.match(id.stderr, /Missing CoreDoc requirement references/)
  assert.match(id.stderr, /MONEY-ARITHMETIC-999/)
})

test('CLI rejects a nonexistent local Markdown fragment', () => {
  const root = fixture()
  writeFileSync(join(root, 'docs/fragment-negative.md'), '[broken](../spec/conventions.md#missing-fragment)\n')
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /missing fragment/)
})
