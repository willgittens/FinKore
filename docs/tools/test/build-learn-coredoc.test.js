// SPDX-License-Identifier: MPL-2.0
/** Tests documentation generation without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildLearnCoreDoc, parseCoreDoc, renderReader, renderMarkdown } from '../build-learn-coredoc.js'
import { refreshLearnAssetVersion } from '../build-learn-assets.js'

const source = readFileSync(new URL('../../coreDoc/core-doc.md', import.meta.url), 'utf8')
const home = '<h1>Unrelated home content</h1>\n<link rel="stylesheet" href="css/styles.css" />\n<!-- BEGIN GENERATED COREDOC INDEX -->\n<!-- END GENERATED COREDOC INDEX -->\n<footer>Keep this footer</footer>\n'
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-coredoc-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'docs/coreDoc'), { recursive: true })
  mkdirSync(join(root, 'learn'))
  writeFileSync(join(root, 'docs/coreDoc/core-doc.md'), source)
  writeFileSync(join(root, 'learn/index.html'), home)
  refreshLearnAssetVersion(root)
  return root
}

test('renders every canonical principle and rule with unchanged obligations and governance metadata', () => {
  const doc = parseCoreDoc(source)
  assert.equal(doc.principles.length, (source.match(/^## CORE-/gm) ?? []).length)
  assert.equal(doc.rules.length, (source.match(/^### CORE-/gm) ?? []).length)
  const html = renderReader(doc, '00000000-0000-4000-8000-000000000001')
  assert.match(html, /A monetary value SHALL contain an exact base-10 amount and a currency/)
  assert.match(html, /<strong>Introduced:<\/strong> Draft 0\.4/)
  assert.match(html, /<strong>Last updated on:<\/strong> 2026-09-12/)
  for (const id of [...source.matchAll(/^### (CORE-\d{3}\.\d+)/gm)].map(m => m[1])) {
    assert.equal(html.split(`id="${id.toLowerCase().replace('.', '-')}"`).length - 1, 1, id)
  }
  assert.ok(html.includes('href="https://github.com/willgittens/FinKore/blob/main/spec/money/representation.md" target="_blank" rel="noopener noreferrer"'))
  assert.ok(html.includes('href="https://github.com/willgittens/FinKore/blob/main/docs/coreDoc/core-doc.md" target="_blank" rel="noopener noreferrer"'))
  assert.doesNotMatch(html, /(?:href|src)="\.\.\//)
  assert.match(html, /href="#core-002-1"/)
  assert.match(html, /<header id="core-0012-exact-calculation-and-explicit-rounding">/)
  assert.match(html, /<script src="js\/coredoc.js" defer><\/script>/)
  assert.doesNotMatch(html, /<button\b/)
})

test('builds deterministically and detects drift in source, reader and home without modifying them in check mode', t => {
  const root = fixture(t)
  const readerPath = join(root, 'learn/coredoc.html')
  const homePath = join(root, 'learn/index.html')
  const sourcePath = join(root, 'docs/coreDoc/core-doc.md')
  assert.throws(() => buildLearnCoreDoc(root, { check: true }), /out of date/)
  buildLearnCoreDoc(root)
  const reader = readFileSync(readerPath, 'utf8')
  const index = readFileSync(homePath, 'utf8')
  assert.ok(index.startsWith('<h1>Unrelated home content</h1>'))
  assert.ok(index.endsWith('<footer>Keep this footer</footer>\n'))
  assert.equal(readFileSync(sourcePath, 'utf8'), source)
  buildLearnCoreDoc(root)
  assert.equal(readFileSync(readerPath, 'utf8'), reader)
  assert.equal(readFileSync(homePath, 'utf8'), index)
  buildLearnCoreDoc(root, { check: true })
  for (const [path, original, changed] of [
    [readerPath, reader, reader.replace('SHALL contain', 'MAY contain')],
    [homePath, index, index.replace('19 foundational rules', '18 foundational rules')],
    [sourcePath, source, source.replace('2026-09-12', '2026-09-13')],
  ]) {
    writeFileSync(path, changed)
    assert.throws(() => buildLearnCoreDoc(root, { check: true }), /out of date/)
    assert.equal(readFileSync(path, 'utf8'), changed)
    writeFileSync(path, original)
  }
})

test('escapes text and rejects unsafe links or unsupported Markdown instead of inventing rendered behavior', () => {
  assert.equal(renderMarkdown('A <script> & "quote".'), '<p>A &lt;script&gt; &amp; &quot;quote&quot;.</p>')
  assert.throws(() => renderMarkdown('[unsafe](javascript:alert)'), /Unsupported CoreDoc link/)
  assert.throws(() => renderMarkdown('[escape](../../../outside.md)'), /Escaping CoreDoc link/)
  assert.throws(() => renderMarkdown('- unsupported list'), /Unsupported CoreDoc block/)
  assert.throws(() => parseCoreDoc(source.replace('**Boundaries**', '**Unexpected section**')), /Unsupported rule sections/)
})

test('refuses ambiguous generation markers and does not overwrite unrelated home content', t => {
  const root = fixture(t)
  const path = join(root, 'learn/index.html')
  writeFileSync(path, home + '<!-- BEGIN GENERATED COREDOC INDEX -->')
  const before = readFileSync(path, 'utf8')
  assert.throws(() => buildLearnCoreDoc(root), /duplicate generated/)
  assert.equal(readFileSync(path, 'utf8'), before)
})
