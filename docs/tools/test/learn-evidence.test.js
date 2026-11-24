// SPDX-License-Identifier: MPL-2.0
/** Tests editorial links, source freshness and preserved contract text; executes no financial behavior. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { codeEvidenceDestinations, loadLearnEvidence, requirementClauses, renderRelatedEvidence, decorateSpecification } from '../learn-evidence.js'
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

function codeFixture(t) {
  const f = fixture(t)
  const clause = { ...f.clause, path: 'docs/coreDoc/core-doc.md' }
  const commit = 'a'.repeat(40)
  const path = 'experts/code-evidence/analyses/CE-REPO-0001/CE-EDITION-0001.md'
  const href = `https://github.com/example/money/blob/${commit}/src/money.js#L10-L20`
  const body = `# CE-FINDING-0001\n\n${commit}\n\nMoney.allocate\n\n${href}\n`
  put(f.root, path, body)
  f.data.schema_version = '1.1.0'
  f.data.sources.push({ id: 'CE-FINDING-0001', kind: 'code', title: 'Allocation conserves value', project: 'Example Money', repository: 'example/money', owner: 'example', version: 'v1.2.0', commit_sha: commit, href: `https://github.com/willgittens/FinKore/blob/main/${path}#ce-finding-0001`, publication_path: path, publication_sha256: digest(body), functions: [{ name: 'Money.allocate', href }], reading_extent: 'selected_code_and_tests', execution_status: 'not_executed', limits: 'Only the selected allocation path was read.', status: 'pending_validation' })
  f.data.bindings.push({ source_id: 'CE-FINDING-0001', target_id: 'CORE-001.4', target_path: clause.path, clause_sha256: clause.sha256, evidence_role: 'supports_rationale', relationship: 'already_addressed', implementation_relationship: 'same_approach', explanation: 'The inspected allocation preserves the total.' })
  f.save()
  return { ...f, clause, body, path, href }
}

test('explicit evidence data receives the same validation without a publication index', t => {
  const { root, data } = codeFixture(t)
  rmSync(join(root, 'learn/related-evidence.json'))
  assert.equal(loadLearnEvidence(root).sources.size, 0)
  const index = loadLearnEvidence(root, data)
  assert.equal(index.sources.get('CE-FINDING-0001').current, true)
  data.sources[1].commit_sha = 'main'
  assert.throws(() => loadLearnEvidence(root, data), /Invalid Code Evidence/)
  assert.throws(() => loadLearnEvidence(root, null), /Unsupported Learn evidence format/)
})

test('code cards expose pinned attribution and keep different policies separate from matches', t => {
  const { root, data, save, clause, href } = codeFixture(t)
  for (const [kind, label] of [['same_approach', 'Same approach in the inspected path'], ['partial_match', 'Partial match with stated limits'], ['different_policy', 'Different policy'], ['related_control', 'Related control or open question']]) {
    Object.assign(data.bindings[1], { implementation_relationship: kind, evidence_role: kind === 'same_approach' ? 'supports_rationale' : 'context_only', relationship: kind === 'same_approach' ? 'already_addressed' : 'application_policy' })
    save()
    const index = loadLearnEvidence(root)
    const html = renderRelatedEvidence('CORE-001.4', clause, index)
    assert.match(html, /Who does it this way\?/)
    assert.ok(html.includes(label))
    assert.match(html, /Example Money.*v1\.2\.0/)
    assert.match(html, /GitHub owner: example/)
    assert.ok(html.includes(`href="${href}" target="_blank" rel="noopener noreferrer"`))
    assert.match(html, /Money\.allocate/)
    assert.match(html, /Read the full analysis/)
    assert.match(html, /No selected conformance result/)
    assert.match(html, /Historical source reading · Pending specialist validation/)
    assert.doesNotMatch(html, /Not executed/)
    assert.deepEqual([...codeEvidenceDestinations(index)], [href])
  }
  data.bindings.push({ ...data.bindings[0], target_id: 'CORE-001.4', target_path: clause.path })
  save()
  const html = renderRelatedEvidence('CORE-001.4', clause, loadLearnEvidence(root))
  assert.match(html, /Evidence &amp; context/)
  assert.match(html, /Who does it this way\?/)
  assert.equal([...html.matchAll(/class="rule-evidence-card"/g)].length, 2)
})

test('stale code publications, missing symbols and changed rules cannot keep comparison cards', t => {
  const { root, path, data, save, body, clause } = codeFixture(t)
  for (const replacement of [body + '\nChanged interpretation.', body.replace('Money.allocate', 'Money.other'), null]) {
    if (replacement === null) rmSync(join(root, path))
    else put(root, path, replacement)
    if (replacement?.includes('Money.other')) { data.sources[1].publication_sha256 = digest(replacement); save() }
    const index = loadLearnEvidence(root)
    assert.match(renderRelatedEvidence('CORE-001.4', clause, index), /needs review/)
    assert.equal(codeEvidenceDestinations(index).size, 0)
  }
  put(root, path, body)
  data.sources[1].publication_sha256 = digest(body); save()
  assert.match(renderRelatedEvidence('CORE-001.4', { ...clause, sha256: 'b'.repeat(64) }, loadLearnEvidence(root)), /needs review/)
})

test('code metadata rejects unpinned or cross-repository functions and fabricated alignment', t => {
  const { root, data, save } = codeFixture(t)
  const original = structuredClone(data)
  for (const mutate of [
    d => { d.schema_version = '1.0.0' },
    d => { d.sources[1].owner = 'invented-author' },
    d => { d.sources[1].repository = '../money'; d.sources[1].owner = '..'; d.sources[1].functions[0].href = d.sources[1].functions[0].href.replace('example/money', '../money') },
    d => { d.sources[1].execution_status = 'passed' },
    d => { d.sources[1].functions[0].href = d.sources[1].functions[0].href.replace('a'.repeat(40), 'main') },
    d => { d.sources[1].functions[0].href = d.sources[1].functions[0].href.replace('example/money/', 'other/money/') },
    d => { d.sources[1].functions[0].href = d.sources[1].functions[0].href.replace('src/money.js', '../private.js') },
    d => { d.sources[1].functions[0].href = d.sources[1].functions[0].href.replace('L10-L20', 'L20-L10') },
    d => { d.sources[1].functions.push({ ...d.sources[1].functions[0] }) },
    d => { d.bindings[1].target_path = 'spec/money/allocation.md' },
    d => { d.bindings[1].implementation_relationship = 'certified' },
    d => { d.bindings[1].evidence_role = 'counterpoint' },
  ]) {
    Object.assign(data, structuredClone(original)); mutate(data); save()
    assert.throws(() => loadLearnEvidence(root), /Invalid|requires/)
  }
})

test('code display text is escaped without turning metadata into executable HTML', t => {
  const { root, data, save, clause } = codeFixture(t)
  data.sources[1].project = '<img src=x onerror=alert(1)>'
  data.bindings[1].explanation = '<script>unsafe</script>'
  save()
  const html = renderRelatedEvidence('CORE-001.4', clause, loadLearnEvidence(root))
  assert.doesNotMatch(html, /<img|<script>/)
  assert.match(html, /&lt;img/)
  assert.match(html, /&lt;script&gt;/)
})

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
  data.sources.push({ ...data.sources[0], id: 'LGC-0002', kind: 'legacy', publication_path: 'experts/legacy/interviews/001-missing.md', href: 'legacy-001-missing.html#question' })
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
  assert.doesNotMatch(html, /id="conformance-results"|class="rule-conformance-results"/)
  assert.equal(html.replace(/\n\s*<aside class="rule-evidence"[\s\S]*?<\/aside>/g, ''), baseline)
})

test('conformance stays collapsed inside existing finding cards without creating cards or groups', () => {
  const root = new URL('../../../', import.meta.url).pathname
  const index = loadLearnEvidence(root)
  const markdown = readFileSync(new URL('docs/coreDoc/core-doc.md', repository), 'utf8')
  const clauses = requirementClauses(markdown, 'docs/coreDoc/core-doc.md')
  let scored = 0, omitted = 0
  const withoutResults = {...index, conformanceByTarget:new Map()}
  for (const [id, reports] of index.conformanceByTarget) {
    const clause = clauses.get(id)
    if (!clause) continue
    const html = renderRelatedEvidence(id, clause, index)
    const baseline = renderRelatedEvidence(id, clause, withoutResults)
    const cards = [...html.matchAll(/<article class="rule-evidence-card"([^>]*)>([\s\S]*?)<\/article>/g)]
    assert.equal(cards.length, [...baseline.matchAll(/class="rule-evidence-card"/g)].length, id)
    assert.equal([...html.matchAll(/class="code-evidence-group"/g)].length, [...baseline.matchAll(/class="code-evidence-group"/g)].length, id)
    assert.doesNotMatch(html, /Recorded conformance results|<h4>Conformance results<|id="conformance-results"/, id)
    for (const report of reports.filter(r => r.current)) {
      const resultCards = cards.filter(m => m[1].includes(`data-conformance="${report.id}"`))
      const selected = (index.byTarget.get(id) ?? []).some(b => b.source_id === report.finding_id && index.sources.get(b.source_id).current)
      assert.equal(resultCards.length, selected ? 1 : 0, report.id)
      if (!selected) { omitted++; continue }
      assert.ok(resultCards[0][1].includes(`data-finding="${report.finding_id}"`))
      assert.match(resultCards[0][2], /<details class="rule-evidence-limits finding-conformance"><summary>Conformance assessment: <strong>\d+\/\d+<\/strong> selected cases matched<\/summary>/)
      assert.doesNotMatch(resultCards[0][2], /finding-conformance" open|Selected cases:<|Recorded source functions/)
      assert.match(resultCards[0][2], /Functions, source &amp; scope/)
      scored++
    }
  }
  assert.ok(scored > 0, 'Selected finding cards must expose their results')
  assert.ok(omitted > 0, 'Execution-only observations must not create extra cards')
})

test('compact code publications preserve selected text and function identity without hashing unrelated findings', async t => {
  const {recordHash} = await import('../code-evidence-publication.js')
  const f=codeFixture(t), source=f.data.sources.find(s=>s.kind==='code')
  const publication={id:source.id,title:source.title,collected_on:'2026-11-18',function_ids:['fn01'],explanation:['The allocation path retains residual units.',source.limits]}
  const rule={schema_version:'2.0.0',id:'CE-RULE-0001',evidence:[{id:source.id,functions:[{id:'fn01',name:'Money.allocate',path:'src/money.js',start_line:10,end_line:20}]}],historical_publications:[publication]}
  const path='experts/code-evidence/rules/CE-RULE-0001.json'
  Object.assign(source,{publication_format:'code-evidence-v2',publication_path:path,publication_sha256:recordHash(publication),href:'https://github.com/willgittens/FinKore/blob/main/'+path})
  f.data.schema_version='1.3.0'
  const save=()=>{put(f.root,path,JSON.stringify(rule));f.save()}
  save();assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,true)
  f.data.schema_version='1.2.0';f.save()
  assert.throws(()=>loadLearnEvidence(f.root),/requires Learn evidence format 1.3.0/)
  f.data.schema_version='1.3.0';f.save()
  rule.schema_version='2.1.0'
  rule.evidence[0].conformance={passed:1,total:1,description:['A later bounded execution.']}
  save();assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,true)
  rule.evidence.push({id:'CE-FINDING-0002',explanation:['An unrelated observation.']})
  save();assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,true)
  publication.explanation[0]='A materially changed interpretation.'
  save();assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,false)
  publication.explanation[0]='The allocation path retains residual units.'
  rule.evidence[0].functions[0].start_line=11
  save();assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,false)
  put(f.root,path,'invalid JSON')
  assert.equal(loadLearnEvidence(f.root).sources.get(source.id).current,false)
})

test('a finding evaluated under another rule does not claim that it was never executed', t => {
  const {root, clause} = codeFixture(t)
  const index=loadLearnEvidence(root)
  const source=index.sources.get('CE-FINDING-0001')
  index.conformanceResults.set('CE-COMPARISON-0999', {...source,finding_id:source.id,current:true,targets:[{target_id:'CORE-002.3'}]})
  const html=renderRelatedEvidence('CORE-001.4',clause,index)
  assert.match(html,/No conformance result linked to this rule/)
  assert.doesNotMatch(html,/Not executed|data-conformance=/)
  index.conformanceResults.get('CE-COMPARISON-0999').current=false
  const stale=renderRelatedEvidence('CORE-001.4',clause,index)
  assert.match(stale,/Recorded conformance result needs review/)
  assert.doesNotMatch(stale,/Not executed|data-conformance=/)
})
