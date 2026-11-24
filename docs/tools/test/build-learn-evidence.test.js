// SPDX-License-Identifier: MPL-2.0
/** Tests explicit Experts publication selection and freshness without financial execution. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { buildLearnEvidence, comparisonFingerprint } from '../build-learn-evidence.js'
import { recordHash, conformanceReportFromRecord } from '../code-evidence-publication.js'
import { codeEvidenceDestinations, requirementClauses, loadLearnEvidence, renderRelatedEvidence } from '../learn-evidence.js'

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

function executionFixture(t, { mapped = true } = {}) {
  const f = fixture(t)
  const path = 'experts/code-evidence/rules/CE-RULE-0001.json'
  const repository = 'example/money', commit = 'a'.repeat(40)
  const reading = {id:'CE-FINDING-0001',library_id:'CE-REPO-0001',edition_id:'CE-EDITION-0001',
    explanation:['A bounded reading.'],functions:[{id:'fn01',name:'Money.add',path:'src/money.js',start_line:1,end_line:9}]}
  const conformance = {passed:1,total:2,description:['Two selected cases on an explicit runtime.', 'One mismatch: <unsafe> & an exact match.']}
  const rule = {schema_version:'2.1.0',id:'CE-RULE-0001',evidence:[{...reading,conformance:structuredClone(conformance)}]}
  const record = {key:'code-evidence/CE-COMPARISON-0001',id:'CE-COMPARISON-0001',collection:'code-evidence',
    source:{id:reading.id,kind:'pinned_code_analysis',references:[{path}],reviewed_fingerprints:{record_sha256:recordHash({evidence:reading,source:{library_id:reading.library_id,edition_id:reading.edition_id,repository,version:'1.0',commit_sha:commit}})},
      details:{project:'Example Money',repository,version:'1.0',commit_sha:commit,
        functions:[{name:'Money.add',href:`https://github.com/${repository}/blob/${commit}/src/money.js#L1-L9`}],
        conformance,conformance_test_ids:['money.case-001','money.case-002']}},
    assessment:{curation:mapped?'reviewed':'pending_curation',freshness:'current',independent_validation:'pending_validation',publication_authorization:'not_recorded',editorial_eligible:false},
    bindings:mapped?[{target_id:'CORE-001.1',target_path:f.target,reviewed_clause_sha256:f.clause.sha256,current_clause_sha256:f.clause.sha256}]:[]}
  f.index.records.push(record)
  f.index.collections['code-evidence']={status:'current',index:'experts/code-evidence/traceability.json'}
  f.index.inputs['experts/code-evidence/traceability.json']=digest('{}')
  const saveRule=()=>{const bytes=JSON.stringify(rule);put(f.root,path,bytes);f.index.inputs[path]=digest(bytes)}
  put(f.root,'experts/code-evidence/traceability.json','{}');saveRule()
  const select=()=>{const target_ids=record.bindings.map(b=>b.target_id);f.selection.conformance_selections=[{comparison_key:record.key,target_ids,reviewed_result_sha256:recordHash(conformanceReportFromRecord(record,target_ids))}]}
  select();f.save()
  return {...f,path,rule,execution:record,select,saveRule}
}

// A pre-existing, independently selected interpretation is required for a card.
function selectFinding(f) {
  const d=f.execution.source.details
  const limits='One inspected path, pending specialist validation.'
  const historical={id:f.execution.source.id,title:'A bounded reading',function_ids:['fn01'],explanation:['The native path is inspected.',limits]}
  f.rule.historical_publications=[historical]
  f.saveRule()
  const publication={id:historical.id,kind:'code',title:historical.title,limits,status:'pending_validation',
    publication_format:'code-evidence-v2',publication_path:f.path,publication_sha256:recordHash(historical),
    href:'https://github.com/willgittens/FinKore/blob/main/'+f.path,
    project:d.project,repository:d.repository,owner:'example',version:d.version,commit_sha:d.commit_sha,functions:d.functions,
    reading_extent:'selected_code_and_tests',execution_status:'not_executed'}
  const record={...structuredClone(f.execution),key:'code-evidence/'+historical.id,id:historical.id,
    assessment:{...f.execution.assessment,editorial_eligible:true},
    source:{...f.execution.source,details:publication},
    bindings:f.execution.bindings.map(b=>({...b,implementation_relationship:'partial_match',evidence_role:'context_only',relationship:'application_policy',explanation:'A bounded partial comparison.'}))}
  f.index.records.push(record)
  f.selection.selections.push({comparison_key:record.key,reviewed_comparison_sha256:comparisonFingerprint(record),target_ids:record.bindings.map(b=>b.target_id),publication})
  f.save()
}

test('execution selection publishes bounded scores without accepting ineligible interpretations', t => {
  const f=executionFixture(t)
  f.index.records.push({...structuredClone(f.execution),key:'code-evidence/CE-COMPARISON-0002',id:'CE-COMPARISON-0002'})
  f.save();buildLearnEvidence(f.root)
  const data=JSON.parse(readFileSync(join(f.root,'learn/related-evidence.json')))
  assert.equal(data.schema_version,'1.4.0')
  assert.equal(data.sources.length,1)
  assert.equal(data.conformance_results.length,1)
  assert.equal(f.execution.assessment.editorial_eligible,false)
  assert.equal(f.execution.assessment.independent_validation,'pending_validation')
  assert.doesNotMatch(renderRelatedEvidence('CORE-001.1',f.clause,loadLearnEvidence(f.root)),/data-conformance=|Who does it this way/)
  selectFinding(f);buildLearnEvidence(f.root)
  const index=loadLearnEvidence(f.root),html=renderRelatedEvidence('CORE-001.1',f.clause,index)
  assert.match(html,/1\/2<\/strong> selected cases matched/)
  assert.match(html,/&lt;unsafe&gt; &amp;/)
  assert.doesNotMatch(html,/<unsafe>/)
  assert.doesNotMatch(html,/Selected cases:<|Recorded conformance results/)
  assert.match(html,/<details class="rule-evidence-limits finding-conformance"><summary>Conformance assessment:/)
  assert.match(html,/conditional cases remain in the denominator/)
  assert.equal(codeEvidenceDestinations(index).has(f.execution.source.details.functions[0].href),true)
  assert.match(html, /class="rule-implementations"[\s\S]*Who does it this way\?[\s\S]*data-conformance=/)
  assert.doesNotMatch(html, /id="conformance-results"|class="rule-conformance-results"/)
  f.selection.selections.push({comparison_key:f.execution.key,reviewed_comparison_sha256:comparisonFingerprint(f.execution),publication:{id:f.execution.id,kind:'code'},target_ids:['CORE-001.1']})
  f.save();assert.throws(()=>buildLearnEvidence(f.root),/needs review/)
})

test('unmapped execution observations stay separate without inventing CoreDoc bindings', t => {
  const f=executionFixture(t,{mapped:false});buildLearnEvidence(f.root)
  const index=loadLearnEvidence(f.root)
  assert.equal(index.conformanceByTarget.size,0)
  assert.equal(index.conformanceResults.size,1)
  assert.equal(f.execution.assessment.curation,'pending_curation')
  assert.doesNotMatch(renderRelatedEvidence('CORE-001.1',f.clause,index),/data-conformance/)
})

test('finding cards suppress a score from a different pinned source or function while retaining the reading', t => {
  const f=executionFixture(t)
  selectFinding(f);buildLearnEvidence(f.root)
  const index=loadLearnEvidence(f.root), report=index.conformanceResults.get(f.execution.id)
  const original=structuredClone(report)
  for (const mutate of [
    r=>{r.repository='other/money'}, r=>{r.version='2.0'},
    r=>{r.commit_sha='b'.repeat(40)},
    r=>{r.publication_path='experts/code-evidence/rules/CE-RULE-9999.json'},
    r=>{r.functions[0].name='Money.other'},
    r=>{r.functions[0].href=r.functions[0].href.replace('L1-L9','L2-L9')},
    r=>{r.targets[0].clause_sha256='0'.repeat(64)},
  ]) {
    Object.assign(report,structuredClone(original));mutate(report)
    const html=renderRelatedEvidence('CORE-001.1',f.clause,index)
    assert.match(html,/data-finding="CE-FINDING-0001"/)
    assert.match(html,/Recorded conformance result needs review/)
    assert.doesNotMatch(html,/data-conformance=|Not executed/)
  }
})

test('zero-match unsupported assessments do not imply native execution or financial rejection', t => {
  const f=executionFixture(t)
  f.rule.evidence[0].conformance.passed=0
  f.rule.evidence[0].conformance.description=['Two selected cases are unsupported; zero native comparisons were completed.']
  f.execution.source.details.conformance=structuredClone(f.rule.evidence[0].conformance)
  f.saveRule();f.select();selectFinding(f);buildLearnEvidence(f.root)
  const html=renderRelatedEvidence('CORE-001.1',f.clause,loadLearnEvidence(f.root))
  assert.match(html,/Conformance assessment: <strong>0\/2<\/strong> selected cases matched/)
  assert.match(html,/unsupported; zero native comparisons/)
  assert.match(html,/Finding-level selection/)
  assert.doesNotMatch(html,/selected cases passed|tests failed|Not executed|finding-conformance" open/)
  // An observed mismatch may also have zero matches; it must not be called unsupported by inference.
  const index=loadLearnEvidence(f.root)
  index.conformanceResults.get(f.execution.id).conformance.description=['Two native observations mismatched; both required states were inspected.']
  assert.match(renderRelatedEvidence('CORE-001.1',f.clause,index),/Two native observations mismatched/)
})

test('changed results, source functions and clauses need review; stale reports do not render', t => {
  const f=executionFixture(t);selectFinding(f);buildLearnEvidence(f.root)
  const before=readFileSync(join(f.root,'learn/related-evidence.json'),'utf8')
  f.execution.source.details.conformance.passed=0;f.save()
  assert.throws(()=>buildLearnEvidence(f.root),/execution result changed/)
  f.execution.source.details.conformance.passed=1;f.save()
  f.rule.evidence[0].conformance.description=['Changed native observation.'];f.saveRule();f.save()
  assert.throws(()=>buildLearnEvidence(f.root),/execution source changed/)
  const stale=loadLearnEvidence(f.root)
  assert.match(renderRelatedEvidence('CORE-001.1',f.clause,stale),/Conformance results need review/)
  assert.equal(stale.conformanceResults.get(f.execution.id).current,false)
  assert.equal(codeEvidenceDestinations(stale).size,1) // The separately selected static source remains current.
  assert.equal(readFileSync(join(f.root,'learn/related-evidence.json'),'utf8'),before)
  f.rule.evidence[0].conformance=f.execution.source.details.conformance;f.saveRule();f.save()
  assert.doesNotMatch(renderRelatedEvidence('CORE-001.1',{...f.clause,sha256:'0'.repeat(64)},loadLearnEvidence(f.root)),/data-conformance/)
  f.rule.evidence[0].functions[0].start_line=2;f.saveRule();f.save()
  assert.equal(loadLearnEvidence(f.root).conformanceResults.get(f.execution.id).current,false)
})

test('execution metadata rejects impossible scores, unpinned links and duplicate selections', t => {
  const f=executionFixture(t);selectFinding(f);buildLearnEvidence(f.root)
  const data=JSON.parse(readFileSync(join(f.root,'learn/related-evidence.json')))
  for (const mutate of [
    r=>{r.conformance.passed=3},r=>{r.test_ids=['duplicate','duplicate']},
    r=>{r.conformance.description=['one','two','three']},r=>{r.conformance.description=['multiple\nlines']},
    r=>{r.functions[0].href=r.functions[0].href.replace('a'.repeat(40),'main')},
    r=>{r.targets[0].target_path='spec/other.md'},r=>{r.publication_path='../outside.json'},
  ]) {
    const copy=structuredClone(data);mutate(copy.conformance_results[0]);
    assert.throws(()=>loadLearnEvidence(f.root,copy),/Invalid/)
  }
  f.selection.conformance_selections.push(f.selection.conformance_selections[0]);f.save()
  assert.throws(()=>buildLearnEvidence(f.root),/duplicate execution selection/)
  rmSync(join(f.root,'experts/traceability.json'))
  assert.equal(buildLearnEvidence(f.root).status,'snapshot_only')
  assert.match(renderRelatedEvidence('CORE-001.1',f.clause,loadLearnEvidence(f.root)),/data-conformance/)
})
