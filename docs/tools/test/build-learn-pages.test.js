// SPDX-License-Identifier: MPL-2.0
/** Tests generated documentation, link routing and drift detection without financial execution. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { LEARN_PAGES, GITHUB_FILE_BASE_URL, buildLearnPages, learnLink, renderLearnMarkdown, renderLearnPage } from '../build-learn-pages.js'
import { validateReleaseContent } from '../check-release-content.js'
import { readLearnAssetVersion, refreshLearnAssetVersion } from '../build-learn-assets.js'

const repository = new URL('../../../', import.meta.url)
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-learn-pages-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const page of LEARN_PAGES) put(root, page.source, readFileSync(new URL(page.source, repository), 'utf8'))
  put(root, 'learn/index.html', '<h1>Keep this content</h1><link rel="stylesheet" href="css/styles.css" /><nav aria-label="Primary navigation"><a href="#start">Start reading</a></nav><a href="../LICENSING.md">License</a><a href="../spec/README.md#status">Spec</a><a href="../conformance/README.md">Cases</a><a href="../LICENSE">Full license</a>')
  put(root, 'learn/network.html', readFileSync(new URL('learn/network.html', repository), 'utf8'))
  refreshLearnAssetVersion(root)
  return root
}

test('keeps site readers and assets local and routes repository files to GitHub', () => {
  assert.equal(learnLink('docs/implementation-guide.md', 'coreDoc/core-doc.md'), 'coredoc.html')
  assert.equal(learnLink('README.md', './docs/releases/README.md#draft-01'), 'releases.html#draft-01')
  assert.equal(learnLink('docs/coreDoc/core-doc.md', '../releases/README.md'), 'releases.html')
  assert.equal(learnLink('README.md', './LICENSING.md'), 'licensing.html')
  assert.equal(learnLink('README.md', './spec/money/README.md#scope'), GITHUB_FILE_BASE_URL + 'spec/money/README.md#scope')
  assert.equal(learnLink('README.md', './conformance/README.md'), GITHUB_FILE_BASE_URL + 'conformance/README.md')
  assert.equal(learnLink('README.md', './agentic/README.md'), GITHUB_FILE_BASE_URL + 'agentic/README.md')
  assert.equal(learnLink('docs/coreDoc/core-doc.md', '../../spec/money/rounding.md'), GITHUB_FILE_BASE_URL + 'spec/money/rounding.md')
  assert.equal(learnLink('README.md', './conformance/manifest.json'), GITHUB_FILE_BASE_URL + 'conformance/manifest.json')
  assert.equal(learnLink('README.md', './LICENSE'), GITHUB_FILE_BASE_URL + 'LICENSE')
  assert.equal(learnLink('CONTRIBUTING.md', '.github/CODEOWNERS'), GITHUB_FILE_BASE_URL + '.github/CODEOWNERS')
  assert.equal(learnLink('README.md', './learn/img/Finkore.png'), 'img/Finkore.png')
  assert.equal(learnLink('README.md', './learn/index.html#core-explorer'), 'index.html#core-explorer')
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
  const external = renderLearnMarkdown('# Guide\n\n[Rule](spec/money/rounding.md#requirements)', 'README.md')
  assert.ok(external.html.includes(`href="${GITHUB_FILE_BASE_URL}spec/money/rounding.md#requirements" target="_blank" rel="noopener noreferrer"`))
  assert.deepEqual(doc.headings.map(h => h.id), ['a-question', 'a-question-1'])
  for (const malformed of ['# Title\n\n```text\nunclosed', '# Title\n\n| A | B |\n| --- |\n| x | y |', '# Title\n\n> > unsupported', '# Title\n\n<script>unsafe</script>']) {
    assert.throws(() => renderLearnMarkdown(malformed, 'README.md'), /Unclosed|Unsupported/)
  }
})

test('renders paragraph blockquotes with safe inline content and preserves surrounding blocks', () => {
  const render = content => renderLearnMarkdown(`# Guide\n\n${content}`, 'README.md')
  const doc = render('Before.\n> FinKore Core 2.0.2 stable.\n> See [status](./spec/README.md#status).\n>\n> Keep **format `versions`** separate.\n\nAfter.\n\n## Next step\n')
  assert.match(doc.html, /<p>Before\.<\/p>\n<blockquote><p>FinKore Core 2\.0\.2 stable\. See /)
  assert.ok(doc.html.includes(`href="${GITHUB_FILE_BASE_URL}spec/README.md#status" target="_blank" rel="noopener noreferrer"`))
  assert.match(doc.html, /<p>Keep <strong>format <code>versions<\/code><\/strong> separate\.<\/p><\/blockquote>\n<p>After\.<\/p>/)
  assert.deepEqual(doc.headings.map(h => h.id), ['next-step'])
  assert.match(render('> <script>unsafe</script> & value').html, /&lt;script&gt;unsafe&lt;\/script&gt; &amp; value/)
  for (const href of ['javascript:alert', '../../../outside.md']) {
    assert.throws(() => render(`> [unsafe](${href})`), /Unsupported|Escaping/)
  }
  for (const content of ['> > Nested', '> ## Heading', '> - List', '> 1. List', '> ```text', '> | Table |', '>     Indented code']) {
    assert.throws(() => render(content), /Unsupported Learn blockquote/)
  }
})

test('renders GitHub theme logos as one light-surface image and rejects unsafe or incomplete pairs', () => {
  const markup = `<p align="center">
  <img src="./learn/img/Finkore.png#gh-light-mode-only"
       alt="FinKore" width="480" />
  <img src="./learn/img/Finkore_White.png#gh-dark-mode-only"
       alt="FinKore" width="480" />
</p>`
  const render = content => renderLearnMarkdown(`# Guide\n\n${content}`, 'README.md').html
  const html = render(markup)
  assert.match(html, /src="img\/Finkore\.png" alt="FinKore" width="480"/)
  assert.equal([...html.matchAll(/<img\b/g)].length, 1)
  assert.doesNotMatch(html, /gh-(?:light|dark)-mode-only|Finkore_White/)
  for (const invalid of [
    markup.replace('./learn/img/Finkore_White.png', 'javascript:alert(1)'),
    markup.replace('gh-dark-mode-only', 'gh-light-mode-only'),
    markup.replace('alt="FinKore"', 'alt="Different logo"'),
    markup.replace('</p>', '<script>unsafe</script>\n</p>'),
  ]) {
    assert.throws(() => render(invalid), /Unsupported Learn/)
  }
})

test('generates all six canonical documents deterministically and checks drift without writing', t => {
  const root = fixture(t)
  assert.throws(() => buildLearnPages(root, { check: true }), /out of date/)
  assert.deepEqual(buildLearnPages(root), { pages: 6 })
  const home = readFileSync(join(root, 'learn/index.html'), 'utf8')
  assert.match(home, /Keep this content/)
  assert.match(home, /Where to start<\/a>[\s\S]*?CoreDoc<\/a>[\s\S]*?Github Project/)
  assert.match(home, /href="network.html">Join the Network<\/a>/)
  assert.match(home, /href="licensing.html"/)
  assert.ok(home.includes(`href="${GITHUB_FILE_BASE_URL}spec/README.md#status" target="_blank" rel="noopener noreferrer"`))
  assert.ok(home.includes(`href="${GITHUB_FILE_BASE_URL}conformance/README.md" target="_blank" rel="noopener noreferrer"`))
  assert.ok(home.includes(`href="${GITHUB_FILE_BASE_URL}LICENSE" target="_blank" rel="noopener noreferrer"`))
  assert.doesNotMatch(home, /(?:href|src)="\.\.\//)
  for (const page of LEARN_PAGES) {
    const source = readFileSync(join(root, page.source), 'utf8')
    const html = readFileSync(join(root, page.output), 'utf8')
    assert.equal(html, renderLearnPage(page, source, readLearnAssetVersion(root)))
    assert.match(html, /aria-label="Table of contents"/)
    assert.match(html, /<details class="learn-document-index">/)
    assert.ok(html.includes(`href="${GITHUB_FILE_BASE_URL}${page.source}" target="_blank" rel="noopener noreferrer"`))
    assert.doesNotMatch(html, /(?:href|src)="\.\.\//)
    assert.doesNotMatch(html, /<script|<button|<form/)
    assert.match(html, /Where to start<\/a>[\s\S]*?CoreDoc<\/a>[\s\S]*?Github Project/)
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
  const networkPath = join(root, 'learn/network.html')
  const network = readFileSync(networkPath, 'utf8')
  assert.match(network, /href="network.html" aria-current="page">Join the Network<\/a>/)
  const originalNetwork = readFileSync(new URL('learn/network.html', repository), 'utf8')
  assert.equal(network.match(/<main\b[\s\S]*?<\/main>/)[0], originalNetwork.match(/<main\b[\s\S]*?<\/main>/)[0])
  for (const staleNetwork of [network.replace('aria-current="page"', ''), network.replace(/network.css\?v=[^"]+/, 'network.css?v=invalid')]) {
    writeFileSync(networkPath, staleNetwork)
    assert.throws(() => buildLearnPages(root, { check: true }), /learn\/network.html/)
    assert.equal(readFileSync(networkPath, 'utf8'), staleNetwork)
    buildLearnPages(root)
    assert.equal(readFileSync(networkPath, 'utf8'), network)
  }
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
  for (const changed of [about.replace('href="https://finkore.dev"', 'href="https://example.org"'), about.replace('target="_blank"', 'target="_self"')]) {
    writeFileSync(aboutPath, changed)
    assert.match(diagnostics(), /learn\/about.html: HTML link must name a local destination/)
  }
})
