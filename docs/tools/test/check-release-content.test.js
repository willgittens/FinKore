// SPDX-License-Identifier: MPL-2.0
/** Tests publication boundaries as data without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { runReleaseContentCli, validateReleaseContent } from '../check-release-content.js'

const negative = JSON.parse(readFileSync(new URL('./fixtures/release-content-negative.json', import.meta.url), 'utf8'))
const stable = '# Contract\n\nFinKore Core 2.0.1 stable.\n'
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-release-content-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const path of ['README.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md',
    ...['money', 'workflow', 'audit', 'approvals', 'entities'].map((d) => `spec/${d}/README.md`)]) put(root, path, stable)
  put(root, 'docs/coreDoc/core-doc.md', `${stable}\n**CoreDoc version:** FinKore Core 2.0.1\n**Status:** FinKore Core 2.0.1 stable\n**Introduced:** Draft 0.4\n**Last updated:** Draft 0.9\n**Last updated on:** 2026-09-20\n`)
  put(root, 'docs/releases/README.md', `# Release history\n\n${negative.retirement}\n\n## Core 0.9 release candidate\n\nHistorical scope only.\n`)
  put(root, 'package.json', JSON.stringify({ private: true, version: '0.1.0' }))
  put(root, 'conformance/manifest.json', JSON.stringify({ finkoreConformance: '0.1' }))
  put(root, 'conformance/vector.schema.json', JSON.stringify({ finkoreVectorFile: '0.1' }))
  put(root, 'conformance/example.json', JSON.stringify({ vectors: [{ id: 'entity.boundary097.control-001' }] }))
  put(root, 'learn/index.html', '<h1 id="start">FinKore Core 2.0.1 stable</h1><a href="#start">Start</a><a href="../spec/README.md#contract">Spec</a><a href=../README.md>Home</a>')
  return root
}
function run(root) {
  const out = [], errors = []
  const status = runReleaseContentCli(root, { log: (s) => out.push(s), error: (s) => errors.push(s) })
  return { status, output: out.join('\n'), error: errors.join('\n') }
}

test('accepts stable publication while preserving format versions, vector IDs, release history and CoreDoc evolution metadata', (t) => {
  const root = fixture(t)
  put(root, 'docs/tools/check-release-content.js', readFileSync(new URL('../check-release-content.js', import.meta.url), 'utf8'))
  put(root, 'docs/tools/test/check-release-content.test.js', readFileSync(new URL('./check-release-content.test.js', import.meta.url), 'utf8'))
  assert.equal(validateReleaseContent(root).htmlLinkCount, 3)
  assert.equal(run(root).status, 0)
  assert.match(run(root).output, /Financial behavior was not executed/)
})

test('rejects each reintroduced artifact, dependency, status and HTML defect with its intended CLI diagnostic', (t) => {
  for (const sample of negative.cases) {
    const root = fixture(t)
    assert.equal(run(root).status, 0, sample.name)
    put(root, sample.path, sample.content)
    const result = run(root)
    assert.equal(result.status, 1, sample.name)
    assert.ok(result.error.includes(`${sample.path}:`), result.error)
    assert.ok(result.error.includes(sample.diagnostic), `${sample.name}: ${result.error}`)
    assert.equal(result.output, '')
  }
})

test('rejects even an empty planning directory and missing stable publication documents', (t) => {
  const root = fixture(t)
  mkdirSync(join(root, negative.emptyPlanDirectory), { recursive: true })
  assert.match(run(root).error, /planning artifact is forbidden/)
  rmSync(join(root, negative.emptyPlanDirectory), { recursive: true })
  rmSync(join(root, 'spec/money/README.md'))
  assert.match(run(root).error, /required publication document is missing/)
})

test('does not accept a version marker without stable status or incoherent CoreDoc fields', (t) => {
  const root = fixture(t)
  put(root, 'spec/README.md', '# Specification\nFinKore Core 2.0.1\n')
  assert.match(run(root).error, /missing explicit FinKore Core 2.0.1 stable declaration/)
  put(root, 'spec/README.md', stable)
  put(root, 'docs/coreDoc/core-doc.md', stable)
  assert.match(run(root).error, /CoreDoc version\/status fields/)
})

test('rejects stale, candidate, and arbitrary matching Core versions', (t) => {
  const staleRoot = fixture(t)
  put(staleRoot, 'spec/README.md', '# Specification\n\nFinKore Core 1.0 stable.\n')
  assert.match(run(staleRoot).error, /stale or contradictory Core status/)

  const candidateRoot = fixture(t)
  put(candidateRoot, 'spec/README.md', '# Specification\n\nFinKore Core 2.0.1 release candidate.\n')
  assert.match(run(candidateRoot).error, /stale or contradictory Core status/)

  const priorPatchRoot = fixture(t)
  put(priorPatchRoot, 'spec/README.md', '# Specification\n\nFinKore Core 2.0 stable.\n')
  assert.match(run(priorPatchRoot).error, /stale or contradictory Core status/)

  const arbitraryRoot = fixture(t)
  for (const path of ['README.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md',
    ...['money', 'workflow', 'audit', 'approvals', 'entities'].map((d) => `spec/${d}/README.md`)]) {
    put(arbitraryRoot, path, '# Contract\n\nFinKore Core 9.9 stable.\n')
  }
  put(arbitraryRoot, 'docs/coreDoc/core-doc.md', '# CoreDoc\n\nFinKore Core 9.9 stable.\n\n**CoreDoc version:** FinKore Core 9.9\n**Status:** FinKore Core 9.9 stable\n')
  assert.match(run(arbitraryRoot).error, /stale or contradictory Core status/)
  assert.match(run(arbitraryRoot).error, /missing explicit FinKore Core 2.0.1 stable declaration/)
})

test('permits compatible major-baseline scope wording without accepting its old stable status', (t) => {
  const root = fixture(t)
  put(root, 'conformance/scope.md', 'Core 2.0 introduced this compatible contract boundary.\n')
  assert.equal(run(root).status, 0)

  put(root, 'spec/README.md', '# Specification\n\nFinKore Core 2.0x1 stable.\n')
  assert.match(run(root).error, /missing explicit FinKore Core 2\.0\.1 stable declaration/)
})

test('limits retired-rule exceptions to the concise release note and designated negative fixture data', (t) => {
  const root = fixture(t)
  put(root, 'docs/tools/test/fixtures/release-content-negative.json', JSON.stringify(negative))
  assert.equal(run(root).status, 0)
  put(root, 'docs/releases/README.md', negative.badRetirement)
  assert.match(run(root).error, /retired freeze definition or reference is forbidden/)
  put(root, 'docs/releases/README.md', `${negative.retirement}\n\n${negative.retirement}`)
  assert.match(run(root).error, /retain only one concise retirement note/)
  put(root, 'docs/releases/README.md', negative.retirement)
  put(root, 'docs/tools/test/other.json', negative.retirement)
  assert.match(run(root).error, /retired freeze definition or reference is forbidden/)
})

test('ignores only local checkout state and supports a release without the optional Learn index', (t) => {
  const root = fixture(t)
  put(root, '.tools/local.md', negative.badRetirement)
  rmSync(join(root, 'learn'), { recursive: true })
  assert.equal(validateReleaseContent(root).htmlLinkCount, 0)
})
