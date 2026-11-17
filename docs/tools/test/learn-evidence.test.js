// SPDX-License-Identifier: MPL-2.0
/** Tests editorial links, source freshness and preserved contract text; executes no financial behavior. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { loadLearnEvidence, requirementClauses, renderRelatedEvidence, decorateSpecification } from '../learn-evidence.js'
import { SPECIFICATION_PAGES } from '../learn-specifications.js'
import { renderLearnMarkdown } from '../build-learn-pages.js'
import { parseCoreDoc, renderReader } from '../build-learn-coredoc.js'

const repository = new URL('../../../', import.meta.url)
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-learn-evidence-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const markdown = '# Rule\n\n- **MONEY-ROUNDING-001** — Rounding MUST specify a target scale and a rounding mode.\n'
  const source = '# Public research note\n\nA carefully bounded discussion.\n'
  put(root, 'learn/research.md', source)
  const clause = requirementClauses(markdown, 'spec/money/rounding.md').get('MONEY-ROUNDING-001')
  const data = { schema_version: '1.0.0', sources: [{ id: 'MAP-0001', kind: 'research', title: 'Explicit rounding policy', authors: ['Public Author'], href: 'research.html#rev-0001', limits: 'A preliminary interpretation with limited scope.', status: 'pending_validation', publication_path: 'learn/research.md', publication_sha256: digest(source) }], bindings: [{ source_id: 'MAP-0001', target_id: 'MONEY-ROUNDING-001', target_path: 'spec/money/rounding.md', clause_sha256: clause.sha256, evidence_role: 'supports_rationale', relationship: 'already_addressed', explanation: 'Supports choosing an explicit scale and mode.' }] }
  const save = () => put(root, 'learn/related-evidence.json', JSON.stringify(data))
  save()
  return { root, markdown, clause, data, save }
}

test('public editorial data works without research catalogs and never grants normative acceptance', t => {
  const { root, clause } = fixture(t)
  const html = renderRelatedEvidence('MONEY-ROUNDING-001', clause, loadLearnEvidence(root))
  assert.match(html, /Evidence &amp; context/)
  assert.match(html, /href="research.html#rev-0001"/)
  assert.match(html, /Public Author/)
  assert.match(html, /Supports the rationale/)
  assert.match(html, /not certification or specialist sign-off/)
  assert.match(html, /not independent confirmation/)
  assert.equal(renderRelatedEvidence('MONEY-ROUNDING-002', clause, loadLearnEvidence(root)), '')
})

test('changed publication or clause suppresses its card without refreshing reviewed fingerprints', t => {
  const { root, data, clause } = fixture(t)
  const original = JSON.stringify(data)
  put(root, 'learn/research.md', '# Changed public note\n')
  let html = renderRelatedEvidence('MONEY-ROUNDING-001', clause, loadLearnEvidence(root))
  assert.match(html, /needs review/)
  assert.doesNotMatch(html, /rule-evidence-card|href="research/)
  put(root, 'learn/research.md', '# Public research note\n\nA carefully bounded discussion.\n')
  html = renderRelatedEvidence('MONEY-ROUNDING-001', { ...clause, sha256: 'a'.repeat(64) }, loadLearnEvidence(root))
  assert.match(html, /needs review/)
  assert.equal(JSON.stringify(data), original)
})

test('missing publication hides evidence while valid sources remain available', t => {
  const { root, data, save, clause } = fixture(t)
  data.sources.push({ ...data.sources[0], id: 'LGC-0002', kind: 'legacy', publication_path: 'legacy/interviews/001-missing.md', href: 'legacy-001-missing.html#question' })
  data.bindings.push({ ...data.bindings[0], source_id: 'LGC-0002' })
  save()
  const html = renderRelatedEvidence('MONEY-ROUNDING-001', clause, loadLearnEvidence(root))
  assert.equal([...html.matchAll(/class="rule-evidence-card"/g)].length, 1)
  assert.match(html, /Some other related readings need review/)
})

test('duplicates, unsupported roles, fabricated acceptance and unsafe links are rejected', t => {
  const { root, data, save } = fixture(t)
  const original = structuredClone(data)
  const mutations = [
    d => d.sources.push({ ...d.sources[0] }),
    d => d.bindings.push({ ...d.bindings[0] }),
    d => { d.sources[0].status = 'accepted' },
    d => { d.sources[0].href = 'javascript:alert(1)' },
    d => { d.sources[0].href = '../outside.html' },
    d => { d.sources[0].publication_path = '../private.md' },
    d => { d.bindings[0].evidence_role = 'proves_correctness' },
    d => { d.bindings[0].target_id = 'unverified' },
  ]
  for (const mutate of mutations) {
    Object.assign(data, structuredClone(original)); mutate(data); save()
    assert.throws(() => loadLearnEvidence(root), /Invalid|Unsupported/)
  }
})

test('escaping symlink sources are rejected and source text is escaped before display', t => {
  const { root, data, save, clause } = fixture(t)
  data.sources[0].authors = ['<script>unsafe</script>']
  save()
  const html = renderRelatedEvidence('MONEY-ROUNDING-001', clause, loadLearnEvidence(root))
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;unsafe/)
  const outside = mkdtempSync(join(tmpdir(), 'finkore-evidence-outside-'))
  t.after(() => rmSync(outside, { recursive: true, force: true }))
  put(outside, 'private.md', 'Not a publication input.')
  rmSync(join(root, 'learn/research.md'))
  symlinkSync(join(outside, 'private.md'), join(root, 'learn/research.md'))
  assert.throws(() => loadLearnEvidence(root), /escapes repository/)
})

test('every published requirement retains its rendered text and gets a unique direct anchor', () => {
  const ids = new Set()
  for (const page of SPECIFICATION_PAGES) {
    const markdown = readFileSync(new URL(page.source, repository), 'utf8')
    const doc = renderLearnMarkdown(markdown, page.source)
    const html = decorateSpecification(doc.html, markdown, page.source)
    assert.equal(html.replace(/<li class="spec-requirement" id="[^"]+">/g, '<li>'), doc.html, page.source)
    const clauses = requirementClauses(markdown, page.source)
    for (const id of clauses.keys()) {
      assert.equal(ids.has(id), false, id)
      ids.add(id)
      assert.equal(html.split(`id="${id.toLowerCase()}"`).length - 1, 1, id)
    }
  }
  assert.equal(ids.size, 447)
})

test('published data exposes only current bindings and tolerates comparisons needing recheck', () => {
  const index = loadLearnEvidence(new URL('../../../', import.meta.url).pathname)
  for (const [id, bindings] of index.byTarget) {
    const markdown = readFileSync(new URL(bindings[0].target_path, repository), 'utf8')
    const clause = requirementClauses(markdown, bindings[0].target_path).get(id)
    if (!clause) continue // A removed rule cannot receive a card in its reader.
    const expected = bindings.filter(binding => binding.target_path === clause.path && binding.clause_sha256 === clause.sha256 && index.sources.get(binding.source_id).current)
    const html = renderRelatedEvidence(id, clause, index)
    assert.equal([...html.matchAll(/class="rule-evidence-card"/g)].length, expected.length, id)
    if (!expected.length) assert.match(html, /needs review/)
  }
})

test('CoreDoc evidence is separate from every original obligation and governance section', () => {
  const markdown = readFileSync(new URL('docs/coreDoc/core-doc.md', repository), 'utf8')
  const doc = parseCoreDoc(markdown)
  const version = '00000000-0000-4000-8000-000000000001'
  const baseline = renderReader(doc, version)
  const html = renderReader(doc, version, { evidence: loadLearnEvidence(new URL('../../../', import.meta.url).pathname), clauses: requirementClauses(markdown, 'docs/coreDoc/core-doc.md') })
  assert.match(html, /rule-evidence-card/)
  assert.equal(html.replace(/\n\s*<aside class="rule-evidence"[\s\S]*?<\/aside>/g, ''), baseline)
})
