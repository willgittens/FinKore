// SPDX-License-Identifier: MPL-2.0
/** Tests Learn cache invalidation and read-only validation without financial execution. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import test from 'node:test'
import { LEARN_PAGES, LEARN_EDITORIAL_PAGES } from '../build-learn-pages.js'
import { readLearnAssetVersion, versionLearnStylesheets } from '../build-learn-assets.js'
import { comparisonFingerprint } from '../build-learn-evidence.js'

const repository = new URL('../../../', import.meta.url)
const pages = ['learn/index.html', 'learn/coredoc.html', ...LEARN_PAGES.map(page => page.output), ...LEARN_EDITORIAL_PAGES.filter(page => page !== 'learn/index.html')]
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-learn-assets-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const sources = ['package.json', ...LEARN_EDITORIAL_PAGES, 'docs/coreDoc/core-doc.md', 'learn/related-evidence.json', ...LEARN_PAGES.map(page => page.source),
    'docs/tools/build-learn-evidence.js', 'docs/tools/build-learn-assets.js', 'docs/tools/build-learn-coredoc.js', 'docs/tools/build-learn-pages.js', 'docs/tools/learn-evidence.js', 'docs/tools/learn-specifications.js']
  for (const path of sources) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), readFileSync(new URL(path, repository)))
  }
  return root
}
const run = (root, command) => execFileSync('npm', ['run', command], { cwd: root, encoding: 'utf8', stdio: 'pipe' })
const snapshot = root => pages.map(path => readFileSync(join(root, path), 'utf8'))

function publicationEvidenceFixture(root) {
  // Derive test comparisons from the independent published snapshot, never
  // requiring the real optional Experts index or its editorial selection.
  const published = JSON.parse(readFileSync(join(root, 'learn/related-evidence.json'), 'utf8'))
  const source = published.sources.find(source => source.kind === 'review' && published.bindings.filter(binding => binding.source_id === source.id).length > 1)
  const bindings = published.bindings.filter(binding => binding.source_id === source.id)
  const local = 'experts/reviews/traceability.json'
  const record = { key: `reviews/${source.id}`, id: source.id, collection: 'reviews', claim: source.title,
    source: { kind: 'specialist_consultation', id: source.report_id, groups: [source.report_id],
      references: [{ path: source.publication_path, anchor: source.id.toLowerCase() }],
      reviewed_fingerprints: { report_sha256: source.publication_sha256 },
      details: { specialist: source.authors[0], original_language: source.original_language,
        interview_language: source.interview_language, translation_status: source.translation_status } },
    assessment: { curation: 'reviewed', freshness: 'current', independent_validation: 'pending_validation',
      publication_authorization: source.publication_authorization, editorial_eligible: null },
    bindings: bindings.map(({ source_id, clause_sha256, ...binding }) => ({ ...binding,
      reviewed_clause_sha256: clause_sha256, current_clause_sha256: clause_sha256, limits: source.limits })) }
  const index = { schema_version: '1.0.0', records: [record],
    collections: { reviews: { status: 'current', index: local } },
    inputs: { [local]: createHash('sha256').update('{}\n').digest('hex'), [source.publication_path]: source.publication_sha256 } }
  writeFileSync(join(root, local), '{}\n')
  writeFileSync(join(root, 'experts/traceability.json'), JSON.stringify(index))
  writeFileSync(join(root, 'learn/evidence-selection.json'), JSON.stringify({ schema_version: '1.0.0', selections: [{
    comparison_key: record.key, reviewed_comparison_sha256: comparisonFingerprint(record),
    target_ids: bindings.map(binding => binding.target_id), publication: source }] }))
}

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
    const editorial = i < 2 || pages[i] === 'learn/network.html' || LEARN_PAGES.some(page => page.output === pages[i] && page.presentation?.startsWith('legacy-'))
    assert.equal(urls.length, editorial ? 2 : 3, pages[i])
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

test('deployment gates reject stale readers, broken HTML links and unpublished evidence selections without rebuilding', t => {
  const root = fixture(t)
  // Exercise the actual publication checks with published sources and their
  // destinations, keeping optional catalogs out of normative verification.
  for (const path of ['LICENSE', 'SECURITY.md', 'TRADEMARKS.md', 'THIRD_PARTY_LICENSES.md',
    'docs', 'spec', 'conformance', 'agentic', '.github', '.agents', 'experts',
    'learn/css', 'learn/fonts', 'learn/img', 'learn/js']) {
    cpSync(new URL(path, repository), join(root, path), { recursive: true,
      filter: source => path !== 'experts' || (basename(source) !== 'catalog' && !source.endsWith('.json')) })
  }
  publicationEvidenceFixture(root)
  run(root, 'learn:build')
  const built = snapshot(root)
  const version = readLearnAssetVersion(root)
  const workflow = readFileSync(new URL('.github/workflows/deploy-learn.yml', repository), 'utf8')
  const validation = workflow.match(/      - name: Verify the committed site\n        run: \|\n((?:          .+\n)+)/)?.[1]
  assert.ok(validation, 'The deployment must validate the committed site')
  assert.match(validation, /npm run verify/)
  assert.match(validation, /npm run learn:evidence:check/)
  assert.match(validation, /npm run release:check/)
  assert.match(validation, /git diff --exit-code -- learn\//)
  assert.doesNotMatch(validation, /learn:build|experts:(?:build|check)|python/)
  // The enclosing suite runs the full checks. This isolated fixture exercises
  // Learn validation only and skips dependency installation to stay local.
  const packagePath = join(root, 'package.json')
  const metadata = JSON.parse(readFileSync(packagePath, 'utf8'))
  metadata.scripts.verify = 'npm run learn:check'
  writeFileSync(packagePath, JSON.stringify(metadata))
  execFileSync('git', ['init', '--quiet', root], { stdio: 'pipe' })
  execFileSync('git', ['add', '.'], { cwd: root, stdio: 'pipe' })
  const commands = validation.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('npm ci ')).join('\n')
  const validate = () => execFileSync('sh', ['-ec', commands], { cwd: root, stdio: 'pipe' })
  validate()
  assert.equal(readLearnAssetVersion(root), version)
  assert.deepEqual(snapshot(root), built)
  const stale = built[2] + '\n'
  writeFileSync(join(root, pages[2]), stale)
  assert.throws(validate, /Learn pages are out of date/)
  assert.equal(readFileSync(join(root, pages[2]), 'utf8'), stale)
  assert.equal(readLearnAssetVersion(root), version)
  writeFileSync(join(root, pages[2]), built[2])

  const networkPath = join(root, 'learn/network.html')
  const network = readFileSync(networkPath, 'utf8')
  const broken = network.replace('</main>', '<p><a href="deployment-missing-page.html">Missing page</a></p></main>')
  writeFileSync(networkPath, broken)
  run(root, 'learn:check')
  assert.throws(validate, /broken or escaping HTML link: deployment-missing-page.html/)
  assert.equal(readFileSync(networkPath, 'utf8'), broken)
  writeFileSync(networkPath, network)

  const selectionPath = join(root, 'learn/evidence-selection.json')
  const selectionBytes = readFileSync(selectionPath, 'utf8')
  const selection = JSON.parse(selectionBytes)
  selection.selections.find(item => item.target_ids.length > 1).target_ids.pop()
  const unpublished = JSON.stringify(selection, null, 2) + '\n'
  const snapshotPath = join(root, 'learn/related-evidence.json')
  const snapshotBytes = readFileSync(snapshotPath, 'utf8')
  writeFileSync(selectionPath, unpublished)
  run(root, 'learn:check')
  run(root, 'release:check')
  assert.throws(validate, /Learn evidence snapshot is stale/)
  assert.equal(readFileSync(snapshotPath, 'utf8'), snapshotBytes)
  assert.equal(readFileSync(selectionPath, 'utf8'), unpublished)
  assert.deepEqual(snapshot(root), built)
  assert.equal(readLearnAssetVersion(root), version)
  writeFileSync(selectionPath, selectionBytes)

  // Published readers and deployment retain their independent snapshot when
  // the optional global catalog is absent. A malformed present index still fails.
  const globalPath = join(root, 'experts/traceability.json')
  const globalBytes = readFileSync(globalPath, 'utf8')
  writeFileSync(globalPath, '{}')
  assert.throws(validate, /Unsupported Experts editorial selection format/)
  rmSync(globalPath)
  validate()
  assert.equal(readFileSync(snapshotPath, 'utf8'), snapshotBytes)
  assert.deepEqual(snapshot(root), built)
  writeFileSync(globalPath, globalBytes)
})

test('replaces an old stylesheet query once and preserves non-CSS references', () => {
  const version = '00000000-0000-4000-8000-000000000001'
  const other = '<link rel="icon" href="img/icon.png" /><a href="css/styles.css">Source</a><script src="js/coredoc.js" defer></script>'
  const html = versionLearnStylesheets('<link rel="stylesheet" href="css/styles.css?old=1&amp;v=old" />' + other, version)
  assert.equal(html, `<link rel="stylesheet" href="css/styles.css?v=${version}" />${other}`)
  assert.throws(() => versionLearnStylesheets(html, 'invalid'), /Invalid Learn CSS build version/)
})
