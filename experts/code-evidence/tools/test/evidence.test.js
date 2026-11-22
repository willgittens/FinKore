// SPDX-License-Identifier: MPL-2.0
// Tests compact evidence integrity, references and review isolation with synthetic
// metadata. No test defines or executes financial behavior.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { validateEvidence, run, renderEvidence, evidenceFingerprint } from '../evidence.js'

function fixture() {
  const fn = {id:'CE-REPO-0001:CE-EDITION-0001:fn01',path:'src/money.js',name:'Money.allocate',start_line:1,end_line:8}
  const evidence = {id:'CE-FINDING-0001',title:'Conservation',library_id:'CE-REPO-0001',edition_id:'CE-EDITION-0001',collected_on:'2026-11-18',relationship:'corroborates',qualification:'support',functions:[fn],explanation:['The inspected path preserves the source amount.','This avoids unassigned residuals.','Static reading; no execution or independent validation.']}
  const rule = {schema_version:'2.0.0',id:'CE-RULE-0001',title:'Conservation',scope:'existing_core_subject',question:'Where does the residual go?',evidence:[evidence]}
  const catalog = {schema_version:'2.0.0',libraries:[{id:'CE-REPO-0001',name:'Example',repository:'example/money',github_id:100,editions:[{id:'CE-EDITION-0001',version:'v1',commit_sha:'a'.repeat(40),observed_on:'2026-11-18',reading_status:'complete'}]}]}
  const record = {id:'CE-COMPARISON-0001',finding_id:evidence.id,rule_id:rule.id,reviewed_by:'Analyst',reviewed_on:'2026-11-21',disposition:'mapped',record_sha256:evidenceFingerprint(evidence,catalog.libraries[0],catalog.libraries[0].editions[0]),requirement_ids:['MONEY-ALLOCATION-001'],vector_ids:['money.allocate.case'],agentic_operations:['finkore.money.allocate'],decision:{action:'keep_evidence',priority:'medium',by:'Curator',on:'2026-11-21'},bindings:[{target_id:'CORE-001.4',target_path:'docs/coreDoc/core-doc.md',clause_sha256:'b'.repeat(64),relationship:'already_addressed',evidence_role:'supports_rationale',implementation_relationship:'same_approach',explanation:'A bounded rationale comparison.'}]}
  const trace = {schema_version:'2.0.0',normative:false,format_migrated_on:'2026-11-22',records:[record],publications:{sources:[],bindings:[]},review_baseline:{version:'Test',commit_sha:'c'.repeat(40),scope:'Test',artifacts:[{path:'docs/coreDoc/core-doc.md',sha256:'d'.repeat(64)}]}}
  const clauses = new Map([['CORE-001.4',{path:'docs/coreDoc/core-doc.md',sha256:'b'.repeat(64)}]])
  const references = {requirements:new Set(record.requirement_ids),vectors:new Set(record.vector_ids),operations:new Set(record.agentic_operations)}
  const data = {catalog,rules:[rule],trace}, options = {clauses,references}
  return {data,options,evidence,fn,rule,record,trace,catalog,check:() => validateEvidence(data,options)}
}
test('bounded evidence exports separate conservative states and stable IDs', () => {
  const f=fixture(), row=f.check().records[0]
  assert.equal(row.id,f.record.id); assert.equal(row.source.id,f.evidence.id)
  assert.equal(row.assessment.freshness,'current')
  assert.equal(row.assessment.independent_validation,'pending_validation')
  assert.equal(row.assessment.publication_authorization,'not_recorded')
  assert.equal(row.assessment.editorial_eligible,false)
  assert.equal(row.source.details.execution_status,'not_executed')
  assert.equal(row.source.details.collected_on,'2026-11-18')
  assert.equal(row.source.groups[0],'example/money@'+'a'.repeat(40))
})
test('changed interpretation becomes stale without refreshing saved hashes or dates', () => {
  const f=fixture(), before=structuredClone(f.record)
  f.evidence.explanation[0]='A corrected reading.'
  assert.deepEqual(f.check().records[0].assessment.recheck_reasons,['evidence_record_changed'])
  assert.deepEqual(f.record,before)
})
test('a changed pinned edition becomes stale even if the finding text is unchanged',()=>{
  const f=fixture();f.catalog.libraries[0].editions[0].commit_sha='b'.repeat(40)
  assert.deepEqual(f.check().records[0].assessment.recheck_reasons,['evidence_record_changed'])
})
test('changed baseline or clause requires recheck separately from evidence', () => {
  const f=fixture();f.options.baselineChanged=true
  assert.deepEqual(f.check().records[0].assessment.recheck_reasons,['review_baseline_changed'])
  f.options.baselineChanged=false;f.options.clauses.clear()
  assert.match(f.check().records[0].assessment.recheck_reasons[0],/target_clause_changed/)
})
test('unmapped findings remain navigable without artificial bindings', () => {
  const f=fixture();Object.assign(f.record,{disposition:'not_mapped',bindings:[],reason:'Future domain.'})
  const row=f.check().records[0]
  assert.deepEqual(row.bindings,[]);assert.equal(row.assessment.curation,'pending_curation')
  f.record.reason='';assert.throws(f.check,/need a reason/)
})
for (const [label,change,message] of [
  ['duplicate finding',f=>f.rule.evidence.push(structuredClone(f.evidence)),/Duplicate evidence/],
  ['duplicate family',f=>f.data.rules.push(structuredClone(f.rule)),/Duplicate rule/],
  ['duplicate comparison',f=>f.trace.records.push(structuredClone(f.record)),/Duplicate or unresolved comparison/],
  ['duplicate target',f=>f.record.bindings.push(structuredClone(f.record.bindings[0])),/Duplicate target/],
  ['duplicate library',f=>f.catalog.libraries.push(structuredClone(f.catalog.libraries[0])),/Duplicate or unsafe library/],
  ['branch instead of commit',f=>f.catalog.libraries[0].editions[0].commit_sha='main',/unpinned commit/],
  ['wrong edition',f=>f.evidence.edition_id='CE-EDITION-0002',/unresolved source/],
  ['orphan comparison',f=>f.record.finding_id='CE-FINDING-9999',/unresolved comparison/],
  ['lost reviewed comparison',f=>f.trace.records=[],/missing comparison/],
  ['false supporting role',f=>f.record.bindings[0].evidence_role='counterpoint',/supporting rationale/],
  ['unresolved prior comparison',f=>f.record.previous_comparison='CE-FINDING-9999',/previous comparison/],
  ['wrong family',f=>f.record.rule_id='CE-RULE-9999',/unresolved comparison/],
  ['too many paragraphs',f=>f.evidence.explanation.push('Fourth.'),/one to three/],
  ['hidden paragraph',f=>f.evidence.explanation[0]='One\n\nTwo',/one to three/],
  ['review before collection date',f=>f.evidence.collected_on='2026-11-23',/collection date/],
  ['invalid calendar date',f=>f.evidence.collected_on='2026-02-31',/collection date/],
  ['escaping path',f=>f.fn.path='../src/money.js',/function location/],
  ['unsafe function link',f=>f.fn.path='src/money.js)\"',/function location/],
  ['URL injection in path',f=>f.fn.path='src/money.js#L2',/function location/],
  ['reversed line range',f=>f.fn.end_line=0,/function location/],
  ['cross-library function',f=>f.fn.id='CE-REPO-0002:CE-EDITION-0002:fn01',/function location/],
  ['duplicate function',f=>f.evidence.functions.push(structuredClone(f.fn)),/function location/],
  ['mapped without target',f=>f.record.bindings=[],/no artificial binding/],
  ['deferred without question',f=>f.record.decision.action='defer',/question and owner/],
  ['invented requirement',f=>f.record.requirement_ids=['MONEY-INVENTED-001'],/requirement_ids/],
  ['invented vector',f=>f.record.vector_ids=['made.up'],/vector_ids/],
  ['invented operation',f=>f.record.agentic_operations=['finkore.money.fake'],/agentic_operations/],
]) test('rejects '+label,()=>{const f=fixture();change(f);assert.throws(f.check,message)})
test('one stable function ID cannot point to different locations across findings',()=>{
  const f=fixture(), second=structuredClone(f.evidence);second.id='CE-FINDING-0002';second.functions[0].start_line=2;f.rule.evidence.push(second)
  assert.throws(f.check,/Conflicting locations/)
})
test('rendered navigation escapes upstream labels and links exact pinned locations',()=>{
  const f=fixture();f.catalog.libraries[0].name='<img src=x> | [label]'
  const markdown=renderEvidence({...f.data,state:f.check()})
  assert.ok(!markdown.includes('<img'));assert.match(markdown,/&lt;img/);assert.match(markdown,/&#124;/)
  assert.ok(markdown.includes('/blob/'+'a'.repeat(40)+'/src/money.js#L1-L8'))
})
test('real collection check is read-only and stores only useful source locations',()=>{
  const root=new URL('../../../../',import.meta.url).pathname
  const before=readFileSync(join(root,'experts/code-evidence/traceability.json'))
  const result=run(root,{check:true})
  assert.ok(result.counts.evidence>0);assert.ok(result.counts.comparisons>0)
  assert.deepEqual(readFileSync(join(root,'experts/code-evidence/traceability.json')),before)
})

test('compact schemas reject stored implementation code and untyped state promotion', async()=>{
  const {default:Ajv}=await import('ajv/dist/2020.js')
  const schema=JSON.parse(readFileSync(new URL('../../schemas/rule.schema.json',import.meta.url)))
  const check=new Ajv({strict:true}).compile(schema), f=fixture()
  assert.equal(check(f.rule),true)
  f.fn.code_body='implementation text';assert.equal(check(f.rule),false)
  delete f.fn.code_body;f.evidence.execution_status='passed';assert.equal(check(f.rule),false)
  delete f.evidence.execution_status;f.evidence.explanation.push('Fourth paragraph.');assert.equal(check(f.rule),false)
})

test('a later source reading does not require changing the format migration date',()=>{
  const f=fixture();f.evidence.collected_on='2027-01-01';f.record.reviewed_on='2027-01-02'
  f.record.record_sha256=evidenceFingerprint(f.evidence,f.catalog.libraries[0],f.catalog.libraries[0].editions[0])
  assert.equal(f.check().records[0].assessment.freshness,'current')
  assert.equal(f.trace.format_migrated_on,'2026-11-22')
})
