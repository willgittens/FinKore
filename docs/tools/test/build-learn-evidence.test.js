// SPDX-License-Identifier: MPL-2.0
/** Tests explicit Experts publication selection and freshness without financial execution. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { buildLearnEvidence, comparisonFingerprint } from '../build-learn-evidence.js'
import { requirementClauses, loadLearnEvidence, renderRelatedEvidence } from '../learn-evidence.js'

const digest = value => createHash('sha256').update(value).digest('hex')
function put(root, path, value) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), typeof value === 'string' ? value : JSON.stringify(value))
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-experts-publication-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const path = 'experts/reviews/reports/001-specialist.md'
  const body = '# ER-0001 — A professional account\n\n**Specialist:** Public Specialist · **Field:** operations\n\n<a id="er-0001-f01"></a>\n### First comparison\n\nA bounded interpretation.\n'
  const target = 'docs/coreDoc/core-doc.md'
  const core = '# CoreDoc\n\n## Exactness\n\n### CORE-001.1 — Exact amounts\n\n**Rule**\nMoney MUST remain exact.\n'
  const clause = requirementClauses(core, target).get('CORE-001.1')
  const publication = { id: 'ER-0001-F01', report_id: 'ER-0001', kind: 'review', title: 'A bounded comparison', authors: ['Public Specialist'],
    href: 'review-001-specialist.html#er-0001-f01', limits: 'One professional account.', status: 'pending_validation',
    publication_path: path, publication_sha256: digest(body), original_language: 'pt', interview_language: 'en',
    translation_status: 'editorial_translation', publication_authorization: 'not_recorded' }
  const record = { key: 'reviews/ER-0001-F01', id: publication.id, collection: 'reviews', claim: publication.title,
    local_index: { path: 'experts/reviews/traceability.md', anchor: 'er-0001-f01' },
    source: { kind: 'specialist_consultation', id: 'ER-0001', groups: ['ER-0001'], references: [{ path, anchor: 'er-0001-f01' }],
      reviewed_fingerprints: { report_sha256: digest(body) }, details: { specialist: 'Public Specialist', original_language: 'pt', interview_language: 'en', translation_status: 'editorial_translation' } },
    assessment: { curation: 'reviewed', freshness: 'current', independent_validation: 'pending_validation', publication_authorization: 'not_recorded', editorial_eligible: null },
    bindings: [{ target_id: 'CORE-001.1', target_path: target, reviewed_clause_sha256: clause.sha256, current_clause_sha256: clause.sha256,
      relationship: 'already_addressed', evidence_role: 'supports_rationale', explanation: 'Explains the need for exact amounts.', limits: publication.limits }] }
  const index = { schema_version: '1.0.0', records: [record], collections: { reviews: { status: 'current', index: 'experts/reviews/traceability.json' } }, inputs: { 'experts/reviews/traceability.json': digest('{}'), [path]: digest(body) } }
  const selection = { schema_version: '1.0.0', selections: [{ comparison_key: record.key, reviewed_comparison_sha256: comparisonFingerprint(record), target_ids: ['CORE-001.1'], publication }] }
  const save = () => {
    put(root, 'experts/traceability.json', index)
    put(root, 'learn/evidence-selection.json', selection)
  }
  put(root, path, body)
  put(root, target, core)
  put(root, 'experts/reviews/traceability.json', '{}')
  save()
  return { root, path, body, target, core, clause, publication, record, index, selection, save }
}

test('exports only explicitly selected comparisons and retains their reviewed meaning and authorization state', t => {
  const f = fixture(t)
  f.index.records.push({ ...structuredClone(f.record), key: 'reviews/ER-0001-F02', id: 'ER-0001-F02' })
  f.save()
  assert.deepEqual(buildLearnEvidence(f.root), { status: 'exported', sources: 1, bindings: 1 })
  const bytes = readFileSync(join(f.root, 'learn/related-evidence.json'), 'utf8')
  const result = JSON.parse(bytes)
  assert.deepEqual(result.sources, [f.publication])
  assert.equal(result.bindings[0].explanation, f.record.bindings[0].explanation)
  assert.equal(result.sources[0].publication_authorization, 'not_recorded')
  buildLearnEvidence(f.root, { check: true })
  assert.equal(readFileSync(join(f.root, 'learn/related-evidence.json'), 'utf8'), bytes)
  const cards = renderRelatedEvidence('CORE-001.1', f.clause, loadLearnEvidence(f.root))
  assert.match(cards, /1 specialist report/)
  assert.match(cards, /Public Specialist/)
  assert.match(cards, /review-001-specialist.html#er-0001-f01/)
})

test('changed comparisons, source inputs and clauses require review instead of automatic fingerprint refresh', t => {
  const f = fixture(t)
  buildLearnEvidence(f.root)
  const before = readFileSync(join(f.root, 'learn/related-evidence.json'), 'utf8')
  f.record.bindings[0].explanation = 'A different financial claim.'
  f.save()
  assert.throws(() => buildLearnEvidence(f.root), /comparison changed/)
  f.selection.selections[0].reviewed_comparison_sha256 = comparisonFingerprint(f.record)
  f.save()
  put(f.root, 'experts/reviews/traceability.json', '{"changed":true}')
  assert.throws(() => buildLearnEvidence(f.root), /Experts input changed/)
  put(f.root, 'experts/reviews/traceability.json', '{}')
  put(f.root, f.target, f.core.replace('exact.', 'approximate.'))
  assert.throws(() => buildLearnEvidence(f.root), /Selected rule changed/)
  put(f.root, f.target, f.core)
  put(f.root, f.path, f.body + '\nChanged interpretation.')
  f.index.inputs[f.path] = digest(f.body + '\nChanged interpretation.')
  f.save()
  assert.throws(() => buildLearnEvidence(f.root), /selected publication changed/)
  assert.equal(readFileSync(join(f.root, 'learn/related-evidence.json'), 'utf8'), before)
})

test('publication selection cannot hide source attribution, pending curation or missing collection checks', t => {
  const f = fixture(t)
  const item = f.selection.selections[0]
  item.publication.authors = ['Someone Else']; f.save()
  assert.throws(() => buildLearnEvidence(f.root), /attribution differs/)
  item.publication.authors = ['Public Specialist']
  item.publication.publication_authorization = 'authorized'; f.save()
  assert.throws(() => buildLearnEvidence(f.root), /attribution differs/)
  item.publication.publication_authorization = 'not_recorded'
  for (const value of ['pending_evidence', 'not_recommended']) {
    f.record.assessment.curation = value; f.save()
    assert.throws(() => buildLearnEvidence(f.root), /needs review/)
  }
  f.record.assessment.curation = 'reviewed'
  delete f.index.inputs['experts/reviews/traceability.json']; f.save()
  assert.throws(() => buildLearnEvidence(f.root), /Missing selected collection fingerprint/)
})

test('readers retain the independent snapshot without the optional global catalog and checks never rewrite it', t => {
  const f = fixture(t)
  buildLearnEvidence(f.root)
  const output = join(f.root, 'learn/related-evidence.json')
  const bytes = readFileSync(output, 'utf8')
  put(f.root, 'learn/related-evidence.json', bytes + '\n')
  assert.throws(() => buildLearnEvidence(f.root, { check: true }), /snapshot is stale/)
  assert.equal(readFileSync(output, 'utf8'), bytes + '\n')
  rmSync(join(f.root, 'experts/traceability.json'))
  assert.equal(buildLearnEvidence(f.root).status, 'snapshot_only')
  assert.equal(buildLearnEvidence(f.root, { check: true }).status, 'snapshot_only')
  assert.equal(loadLearnEvidence(f.root).sources.get('ER-0001-F01').current, true)
  assert.equal(readFileSync(output, 'utf8'), bytes + '\n')
})

test('Review publication rejects unsafe destinations, incorrect languages and specification bindings', t => {
  const f = fixture(t)
  buildLearnEvidence(f.root)
  const original = JSON.parse(readFileSync(join(f.root, 'learn/related-evidence.json'), 'utf8'))
  for (const patch of [{ href: 'https://example.org/report' }, { report_id: 'ER-0002' }, { original_language: 'unknown' }, { translation_status: 'original' }]) {
    const data = structuredClone(original)
    Object.assign(data.sources[0], patch)
    assert.throws(() => loadLearnEvidence(f.root, data), /Invalid Review/)
  }
  const data = structuredClone(original)
  Object.assign(data.bindings[0], { target_id: 'MONEY-ROUNDING-001', target_path: 'spec/money/rounding.md' })
  assert.throws(() => loadLearnEvidence(f.root, data), /CoreDoc rules only/)
  const changed = f.body.replace('Public Specialist', 'Another Specialist')
  put(f.root, f.path, changed)
  const changedData = structuredClone(original)
  changedData.sources[0].publication_sha256 = digest(changed)
  assert.equal(loadLearnEvidence(f.root, changedData).sources.get('ER-0001-F01').current, false)
})
