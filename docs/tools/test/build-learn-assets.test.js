// SPDX-License-Identifier: MPL-2.0
/** Tests Learn cache invalidation and read-only validation without financial execution. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { LEARN_PAGES } from '../build-learn-pages.js'
import { readLearnAssetVersion, versionLearnStylesheets } from '../build-learn-assets.js'

const repository = new URL('../../../', import.meta.url)
const pages = ['learn/index.html', 'learn/coredoc.html', ...LEARN_PAGES.map(page => page.output)]
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-learn-assets-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const sources = ['package.json', 'learn/index.html', 'docs/coreDoc/core-doc.md', ...LEARN_PAGES.map(page => page.source),
    'docs/tools/build-learn-assets.js', 'docs/tools/build-learn-coredoc.js', 'docs/tools/build-learn-pages.js']
  for (const path of sources) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), readFileSync(new URL(path, repository)))
  }
  return root
}
const run = (root, command) => execFileSync('npm', ['run', command], { cwd: root, encoding: 'utf8', stdio: 'pipe' })
const snapshot = root => pages.map(path => readFileSync(join(root, path), 'utf8'))

test('each full build changes every page CSS URL, even with unchanged sources; checks preserve the built version', t => {
  const root = fixture(t)
  run(root, 'learn:build')
  const firstVersion = readLearnAssetVersion(root)
  const first = snapshot(root)
  run(root, 'learn:build')
  const secondVersion = readLearnAssetVersion(root)
  const second = snapshot(root)
  assert.notEqual(secondVersion, firstVersion)
  for (const [i, html] of second.entries()) {
    const urls = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1])
    assert.equal(urls.length, i < 2 ? 2 : 3, pages[i])
    for (const url of urls) assert.ok(url.endsWith(`?v=${secondVersion}`), `${pages[i]}: ${url}`)
    assert.equal(html.replaceAll(secondVersion, ''), first[i].replaceAll(firstVersion, ''), pages[i])
  }
  run(root, 'learn:check')
  run(root, 'learn:check')
  assert.deepEqual(snapshot(root), second)
})

test('checks reject absent, malformed and mixed CSS versions without modifying output', t => {
  const root = fixture(t)
  run(root, 'learn:build')
  const version = readLearnAssetVersion(root)
  const built = snapshot(root)
  for (const [i, before] of built.entries()) {
    const changed = before.replace(`?v=${version}`, '')
    writeFileSync(join(root, pages[i]), changed)
    assert.throws(() => run(root, 'learn:check'), /CSS build version|out of date/, pages[i])
    assert.equal(readFileSync(join(root, pages[i]), 'utf8'), changed)
    writeFileSync(join(root, pages[i]), before)
  }
  for (const replacement of ['invalid', '00000000-0000-4000-8000-000000000001']) {
    const changed = built[0].replace(`coredoc.css?v=${version}`, `coredoc.css?v=${replacement}`)
    writeFileSync(join(root, pages[0]), changed)
    assert.throws(() => run(root, 'learn:check'), /out of date/)
    assert.equal(readFileSync(join(root, pages[0]), 'utf8'), changed)
  }
  writeFileSync(join(root, pages[0]), built[0].replace(`styles.css?v=${version}`, 'styles.css?v=invalid'))
  assert.throws(() => readLearnAssetVersion(root), /CSS build version/)
})

test('replaces an old stylesheet query once and preserves non-CSS references', () => {
  const version = '00000000-0000-4000-8000-000000000001'
  const other = '<link rel="icon" href="img/icon.png" /><a href="css/styles.css">Source</a><script src="js/coredoc.js" defer></script>'
  const html = versionLearnStylesheets('<link rel="stylesheet" href="css/styles.css?old=1&amp;v=old" />' + other, version)
  assert.equal(html, `<link rel="stylesheet" href="css/styles.css?v=${version}" />${other}`)
  assert.throws(() => versionLearnStylesheets(html, 'invalid'), /Invalid Learn CSS build version/)
})
