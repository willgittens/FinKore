// SPDX-License-Identifier: MPL-2.0
/** Tests generated documentation, link routing and drift detection without financial execution. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { LEARN_PAGES, buildLearnPages, learnLink, renderLearnMarkdown, renderLearnPage } from '../build-learn-pages.js'
import { validateReleaseContent } from '../check-release-content.js'

const repository = new URL('../../../', import.meta.url)
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-learn-pages-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const page of LEARN_PAGES) put(root, page.source, readFileSync(new URL(page.source, repository), 'utf8'))
  put(root, 'learn/index.html', '<h1>Keep this content</h1><a href="../LICENSING.md">License</a><a href="../spec/README.md#status">Spec</a><a href="../conformance/README.md">Cases</a>')
  return root
}

test('routes converted documents and preserves deferred and repository links with their fragments', () => {
  assert.equal(learnLink('docs/implementation-guide.md', 'coreDoc/core-doc.md'), 'coredoc.html')
  assert.equal(learnLink('README.md', './docs/releases/README.md#draft-01'), 'releases.html#draft-01')
  assert.equal(learnLink('docs/coreDoc/core-doc.md', '../releases/README.md'), 'releases.html')
  assert.equal(learnLink('README.md', './LICENSING.md'), 'licensing.html')
  assert.equal(learnLink('README.md', './spec/money/README.md#scope'), '../spec/money/README.md#scope')
  assert.equal(learnLink('README.md', './conformance/README.md'), '../conformance/README.md')
  assert.equal(learnLink('README.md', './agentic/README.md'), '../agentic/README.md')
  assert.equal(learnLink('README.md', './LICENSE'), '../LICENSE')
  assert.equal(learnLink('README.md', '#local'), '#local')
  for (const href of ['javascript:alert', '../../../outside.md', '/etc/passwd', 'https://example.org/" onclick="bad']) {
    assert.throws(() => learnLink('README.md', href), /Unsupported|Escaping/)
  }
})

test('preserves code, ordered list continuations, inline wording, tables and heading fragments', () => {
  const doc = renderLearnMarkdown('# Guide\n\n## A question?\n\n1. Read [CoreDoc](docs/coreDoc/core-doc.md).\n   Keep **exact `values`**.\n2. Observe.\n\n| Topic | Detail |\n| --- | --- |\n| A | <b> & value |\n\n```text\nx < y\n\nkeep blank lines\n```\n\n## A question?\n', 'README.md')
  assert.match(doc.html, /<ol><li>Read <a href="coredoc.html">CoreDoc<\/a>\. Keep <strong>exact <code>values<\/code><\/strong>\.<\/li><li>Observe\.<\/li><\/ol>/)
  assert.match(doc.html, /<td>&lt;b&gt; &amp; value<\/td>/)
  assert.match(doc.html, /<pre><code class="language-text">x &lt; y\n\nkeep blank lines<\/code><\/pre>/)
  assert.deepEqual(doc.headings.map(h => h.id), ['a-question', 'a-question-1'])
  for (const malformed of ['# Title\n\n```text\nunclosed', '# Title\n\n| A | B |\n| --- |\n| x | y |', '# Title\n\n> unsupported', '# Title\n\n<script>unsafe</script>']) {
    assert.throws(() => renderLearnMarkdown(malformed, 'README.md'), /Unclosed|Unsupported/)
  }
})

test('generates all five canonical documents deterministically and checks drift without writing', t => {
  const root = fixture(t)
  assert.throws(() => buildLearnPages(root, { check: true }), /out of date/)
  assert.deepEqual(buildLearnPages(root), { pages: 5 })
  const home = readFileSync(join(root, 'learn/index.html'), 'utf8')
  assert.match(home, /Keep this content/)
  assert.match(home, /href="licensing.html"/)
  assert.match(home, /href="..\/spec\/README.md#status"/)
  assert.match(home, /href="..\/conformance\/README.md"/)
  for (const page of LEARN_PAGES) {
    const source = readFileSync(join(root, page.source), 'utf8')
    const html = readFileSync(join(root, page.output), 'utf8')
    assert.equal(html, renderLearnPage(page, source))
    assert.match(html, /aria-label="Table of contents"/)
    assert.match(html, /<details class="learn-document-index">/)
    assert.match(html, new RegExp(`href="../${page.source}"`))
    assert.doesNotMatch(html, /<script|<button|<form/)
    buildLearnPages(root)
    assert.equal(readFileSync(join(root, page.output), 'utf8'), html)
    for (const [path, original, changed] of [[page.output, html, html + '\n'], [page.source, source, source + '\nAn editorial addition.\n']]) {
      writeFileSync(join(root, path), changed)
      assert.throws(() => buildLearnPages(root, { check: true }), /out of date/)
      assert.equal(readFileSync(join(root, path), 'utf8'), changed)
      writeFileSync(join(root, path), original)
    }
  }
  buildLearnPages(root, { check: true })
  writeFileSync(join(root, 'learn/index.html'), home.replace('licensing.html', '../LICENSING.md'))
  assert.throws(() => buildLearnPages(root, { check: true }), /learn\/index.html/)
})

test('publication accepts synchronized release history but rejects changed history or unsafe external links', t => {
  const root = fixture(t)
  buildLearnPages(root)
  const diagnostics = () => {
    try { validateReleaseContent(root); return '' } catch (error) { return error.message }
  }
  // This small fixture lacks the full release tree; inspect the relevant diagnostics.
  assert.doesNotMatch(diagnostics(), /learn\/releases.html:.*(?:stale|retired|unfinished)/)
  assert.doesNotMatch(diagnostics(), /HTML link must name a local destination/)
  const page = LEARN_PAGES.find(p => p.label === 'Release notes')
  const html = readFileSync(join(root, page.output), 'utf8')
  writeFileSync(join(root, page.output), html.replace('Published release history.', 'Changed release history.'))
  assert.match(diagnostics(), /Learn pages are out of date/)
  assert.match(diagnostics(), /learn\/releases.html: stale or contradictory/)
  writeFileSync(join(root, page.output), html)
  const aboutPath = join(root, 'learn/about.html')
  const about = readFileSync(aboutPath, 'utf8')
  for (const changed of [about.replace('https://finkore.dev', 'https://example.org'), about.replace('target="_blank"', 'target="_self"')]) {
    writeFileSync(aboutPath, changed)
    assert.match(diagnostics(), /learn\/about.html: HTML link must name a local destination/)
  }
})
