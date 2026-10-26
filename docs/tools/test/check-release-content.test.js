// SPDX-License-Identifier: MPL-2.0
/** Tests publication boundaries as data without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { runReleaseContentCli, validateReleaseContent } from '../check-release-content.js'

const negative = JSON.parse(readFileSync(new URL('./fixtures/release-content-negative.json', import.meta.url), 'utf8'))
const stable = '# Contract\n\nFinKore Core 2.0.2 stable.\n'
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-release-content-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const path of ['README.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md',
    ...['money', 'workflow', 'audit', 'approvals', 'entities'].map((d) => `spec/${d}/README.md`)]) put(root, path, stable)
  put(root, 'docs/coreDoc/core-doc.md', `${stable}\n**CoreDoc version:** FinKore Core 2.0.2\n**Status:** FinKore Core 2.0.2 stable\n**Introduced:** Draft 0.4\n**Last updated:** Draft 0.9\n**Last updated on:** 2026-09-20\n`)
  put(root, 'docs/releases/README.md', `# Release history\n\n${negative.retirement}\n\n## Core 0.9 release candidate\n\nHistorical scope only.\n`)
  put(root, 'package.json', JSON.stringify({ private: true, version: '0.1.0' }))
  put(root, 'conformance/manifest.json', JSON.stringify({ finkoreConformance: '0.1' }))
  put(root, 'conformance/vector.schema.json', JSON.stringify({ finkoreVectorFile: '0.1' }))
  put(root, 'conformance/example.json', JSON.stringify({ vectors: [{ id: 'entity.boundary097.control-001' }] }))
  put(root, 'learn/index.html', '<h1 id="start">FinKore Core 2.0.2 stable</h1><a href="#start">Start</a><a href="https://github.com/willgittens/FinKore/blob/main/spec/README.md#contract" target="_blank" rel="noopener noreferrer">Spec</a><a href="https://github.com/willgittens/FinKore/blob/main/README.md" target="_blank" rel="noopener noreferrer">Home</a>')
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
  put(root, 'spec/README.md', '# Specification\nFinKore Core 2.0.2\n')
  assert.match(run(root).error, /missing explicit FinKore Core 2.0.2 stable declaration/)
  put(root, 'spec/README.md', stable)
  put(root, 'docs/coreDoc/core-doc.md', stable)
  assert.match(run(root).error, /CoreDoc version\/status fields/)
})

test('rejects stale, candidate, and arbitrary matching Core versions', (t) => {
  const staleRoot = fixture(t)
  put(staleRoot, 'spec/README.md', '# Specification\n\nFinKore Core 1.0 stable.\n')
  assert.match(run(staleRoot).error, /stale or contradictory Core status/)

  const candidateRoot = fixture(t)
  put(candidateRoot, 'spec/README.md', '# Specification\n\nFinKore Core 2.0.2 release candidate.\n')
  assert.match(run(candidateRoot).error, /stale or contradictory Core status/)

  const priorPatchRoot = fixture(t)
  put(priorPatchRoot, 'spec/README.md', '# Specification\n\nFinKore Core 2.0.1 stable.\n')
  assert.match(run(priorPatchRoot).error, /stale or contradictory Core status/)

  const arbitraryRoot = fixture(t)
  for (const path of ['README.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md',
    ...['money', 'workflow', 'audit', 'approvals', 'entities'].map((d) => `spec/${d}/README.md`)]) {
    put(arbitraryRoot, path, '# Contract\n\nFinKore Core 9.9 stable.\n')
  }
  put(arbitraryRoot, 'docs/coreDoc/core-doc.md', '# CoreDoc\n\nFinKore Core 9.9 stable.\n\n**CoreDoc version:** FinKore Core 9.9\n**Status:** FinKore Core 9.9 stable\n')
  assert.match(run(arbitraryRoot).error, /stale or contradictory Core status/)
  assert.match(run(arbitraryRoot).error, /missing explicit FinKore Core 2.0.2 stable declaration/)
})

test('permits compatible major-baseline scope wording without accepting its old stable status', (t) => {
  const root = fixture(t)
  put(root, 'conformance/scope.md', 'Core 2.0 introduced this compatible contract boundary.\n')
  assert.equal(run(root).status, 0)

  put(root, 'spec/README.md', '# Specification\n\nFinKore Core 2.0x2 stable.\n')
  assert.match(run(root).error, /missing explicit FinKore Core 2\.0\.2 stable declaration/)
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

test('accepts a static Learn video preview and rejects scripts and unsupported controls', (t) => {
  const root = fixture(t)
  const script = '<script src="js/examples.js" defer></script>'
  const controls = ['toggle', 'previous', 'next'].map(action =>
    `<button type="button" data-carousel-action="${action}" aria-controls="example-slides">${action}</button>`).join('')
  const page = '<h1>FinKore Core 2.0.2 stable</h1><figure><div class="video-frame" role="img" aria-label="Video preview; playback unavailable">FinKore</div><figcaption>Introduction video · Coming soon</figcaption></figure>'
  put(root, 'learn/js/examples.js', '// Presentation only.\n')
  put(root, 'learn/index.html', page)
  assert.equal(run(root).status, 0)
  assert.equal(validateReleaseContent(root).htmlLinkCount, 0)

  for (const invalid of [
    page + '<script>document.title = "inline"</script>',
    page + '<script src="js/other.js" defer></script>',
    page + '<script src="https://example.org/examples.js" defer></script>',
    page + script,
    page + controls,
    page + `<div id="example-slides">Authored examples</div>${controls}${script}`,
    page.replace('class="video-frame"', 'class="video-frame" onclick="alert(1)"'),
    page + '<button type="button">Unwired control</button>',
    page + '<form><input type="search"></form>',
  ]) {
    put(root, 'learn/index.html', invalid)
    const result = run(root)
    assert.equal(result.status, 1, invalid)
    assert.match(result.error, /interactive HTML is outside/, invalid)
  }
  put(root, 'learn/index.html', page)
  put(root, 'learn/other.html', page + script)
  assert.match(run(root).error, /learn\/other.html: interactive HTML is outside/)
  rmSync(join(root, 'learn/other.html'))
})

test('permits only the homepage founder profile destination with the required new-tab attributes', t => {
  const root = fixture(t)
  const link = '<a href="https://www.linkedin.com/in/will-gittens/" target="_blank" rel="noopener noreferrer">Connect with Will on LinkedIn</a>'
  const page = `<h1>FinKore Core 2.0.2 stable</h1><section id="founder">${link}</section>`
  put(root, 'learn/index.html', page)
  assert.equal(run(root).status, 0)
  assert.equal(validateReleaseContent(root).htmlLinkCount, 1)

  for (const invalid of [
    page.replace(' target="_blank"', ''),
    page.replace('target="_blank"', 'target="_self"'),
    page.replace('target="_blank"', 'target="_blank" target="_self"'),
    page.replace(' rel="noopener noreferrer"', ''),
    page.replace('noopener noreferrer', 'noopener'),
    page.replace('noopener noreferrer', 'noreferrer'),
    page.replace('rel="noopener noreferrer"', 'rel="noopener noreferrer" rel="opener"'),
    page.replace('/in/will-gittens/', '/in/another-person/'),
    page.replace('https://www.linkedin.com', 'http://www.linkedin.com'),
    page.replace('https://www.linkedin.com', 'https://www.linkedin.com.example.org'),
    page.replace('<a href=', '<img src='),
    page.replace('target="_blank"', 'target="_blank" src="https://www.linkedin.com/in/will-gittens/"'),
  ]) {
    put(root, 'learn/index.html', invalid)
    const result = run(root)
    assert.equal(result.status, 1, invalid)
    assert.match(result.error, /HTML link must name a local destination/, invalid)
  }
  put(root, 'learn/index.html', page)
  put(root, 'learn/other.html', page)
  assert.match(run(root).error, /learn\/other.html: HTML link must name a local destination/)
})

test('permits the homepage partner destination while rejecting other remote links and resources', t => {
  const root = fixture(t)
  const link = '<a href="https://savoiabarker.com/" target="_blank" rel="noopener noreferrer">Savoia Barker</a>'
  const page = `<h1>FinKore Core 2.0.2 stable</h1><section id="partners">${link}</section>`
  put(root, 'learn/index.html', page)
  assert.equal(run(root).status, 0)
  assert.equal(validateReleaseContent(root).htmlLinkCount, 1)

  for (const invalid of [
    page.replace(' target="_blank"', ''),
    page.replace('target="_blank"', 'target="_self"'),
    page.replace('target="_blank"', 'target="_blank" target="_self"'),
    page.replace(' rel="noopener noreferrer"', ''),
    page.replace('noopener noreferrer', 'noopener'),
    page.replace('noopener noreferrer', 'noreferrer'),
    page.replace('rel="noopener noreferrer"', 'rel="noopener noreferrer" rel="opener"'),
    page.replace('https://savoiabarker.com/', 'http://savoiabarker.com/'),
    page.replace('https://savoiabarker.com/', 'https://savoiabarker.com.example.org/'),
    page.replace('https://savoiabarker.com/', 'https://savoiabarker.com/other'),
    page.replace('<a href=', '<img src='),
    page.replace('target="_blank"', 'target="_blank" src="https://savoiabarker.com/"'),
  ]) {
    put(root, 'learn/index.html', invalid)
    const result = run(root)
    assert.equal(result.status, 1, invalid)
    assert.match(result.error, /HTML link must name a local destination/, invalid)
  }
  put(root, 'learn/index.html', page)
  put(root, 'learn/other.html', page)
  assert.match(run(root).error, /learn\/other.html: HTML link must name a local destination/)
})

test('rejects an unsynchronized CoreDoc reader even when historical metadata is marked', t => {
  const root = fixture(t)
  put(root, 'docs/coreDoc/core-doc.md', readFileSync(new URL('../../coreDoc/core-doc.md', import.meta.url), 'utf8'))
  put(root, 'learn/coredoc.html', '<h1>FinKore Core 2.0.2 stable</h1><p class="core-governance"><strong>Introduced:</strong> Draft 0.4</p>')
  assert.match(run(root).error, /learn\/coredoc.html:/)
  assert.match(run(root).error, /generated CoreDoc index markers/)
})

test('limits the CoreDoc reader enhancement to its exact deferred local script and target', t => {
  const root = fixture(t)
  const script = '<script src="js/coredoc.js" defer></script>'
  const page = '<h1>FinKore Core 2.0.2 stable</h1><details id="core-mobile-index"><summary>Browse</summary></details>' + script
  put(root, 'learn/js/coredoc.js', '// presentation only\n')
  put(root, 'learn/coredoc.html', page)
  // Synchronization still rejects this incomplete reader; the exact script is permitted.
  assert.doesNotMatch(run(root).error, /interactive HTML/)
  for (const variant of [page.replace(' defer', ''), page + script, page.replace('js/coredoc.js', 'js/other.js'), page.replace('core-mobile-index', 'other-index'), page.replace('</details>', '</details><button>Other action</button>')]) {
    put(root, 'learn/coredoc.html', variant)
    assert.match(run(root).error, /interactive HTML/)
  }
  put(root, 'learn/index.html', page)
  assert.match(run(root).error, /learn\/index.html: interactive HTML/)
})


test('permits the official GitHub project link only on known Learn pages with safe new-tab attributes', t => {
  const root = fixture(t)
  const link = '<a class="nav-start" href="https://github.com/willgittens/FinKore" target="_blank" rel="noopener noreferrer">Github Project</a>'
  const page = `<h1>FinKore Core 2.0.2 stable</h1>${link}`
  put(root, 'learn/index.html', page)
  assert.equal(run(root).status, 0)
  for (const invalid of [
    page.replace('github.com/willgittens/FinKore', 'github.com/another-person/FinKore'),
    page.replace('https://github.com', 'http://github.com'),
    page.replace('target="_blank"', 'target="_self"'),
    page.replace('rel="noopener noreferrer"', 'rel="opener"'),
    page.replace('target="_blank"', 'target="_blank" target="_self"'),
    page.replace('href="https:', 'src="https:'),
  ]) {
    put(root, 'learn/index.html', invalid)
    assert.match(run(root).error, /HTML link must name a local destination/)
  }
  put(root, 'learn/index.html', page)
  put(root, 'learn/other.html', page)
  assert.match(run(root).error, /learn\/other.html: HTML link must name a local destination/)
})

test('validates official GitHub file links and fragments against the local tree', t => {
  const root = fixture(t)
  const url = 'https://github.com/willgittens/FinKore/blob/main/spec/README.md#contract'
  const page = `<h1>FinKore Core 2.0.2 stable</h1><a href="${url}" target="_blank" rel="noopener noreferrer">Specification</a>`
  put(root, 'learn/index.html', page)
  assert.equal(run(root).status, 0)
  for (const invalid of [
    page.replace('/willgittens/', '/another-person/'),
    page.replace('/blob/main/', '/blob/other/'),
    page.replace('target="_blank"', 'target="_self"'),
    page.replace('rel="noopener noreferrer"', 'rel="opener"'),
  ]) {
    put(root, 'learn/index.html', invalid)
    assert.match(run(root).error, /HTML link must name a local destination/)
  }
  for (const file of ['LICENSE', 'conformance/manifest.json', '.github/CODEOWNERS']) {
    put(root, file, file.endsWith('.json') ? '{"finkoreConformance":"0.1"}' : 'Repository file\n')
    put(root, 'learn/index.html', page.replace('spec/README.md#contract', file))
    assert.equal(run(root).status, 0, file)
  }
  for (const [invalid, diagnostic] of [
    [page.replace('spec/README.md', 'spec/missing.md'), /broken or escaping HTML link/],
    [page.replace('#contract', '#missing'), /missing HTML link fragment/],
    [page.replace('spec/README.md', '%2e%2e/outside.md'), /broken or escaping HTML link/],
  ]) {
    put(root, 'learn/index.html', invalid)
    assert.match(run(root).error, diagnostic)
  }
})


test('rejects links outside the published Learn directory even when files exist', t => {
  const root = fixture(t)
  for (const href of ['../README.md', '../spec/README.md', '%2e%2e/README.md']) {
    put(root, 'learn/index.html', `<h1>FinKore Core 2.0.2 stable</h1><a href="${href}">Repository file</a>`)
    assert.match(run(root).error, /HTML link escapes the Learn site root/)
  }
})
