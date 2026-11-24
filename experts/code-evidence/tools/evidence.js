// SPDX-License-Identifier: MPL-2.0
// Validates compact non-normative evidence, renders navigation and exports typed
// comparisons. Build writes only the Markdown view; check/export are read-only.
// This maintenance tool does not define or execute financial behavior or approve publication.
import { readFileSync, readdirSync, realpathSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative, isAbsolute } from 'node:path'
import { pathToFileURL } from 'node:url'
import Ajv from 'ajv/dist/2020.js'
import { createHash } from 'node:crypto'
import { loadLearnEvidence, requirementClauses } from '../../../docs/tools/learn-evidence.js'
import { recordHash } from '../../../docs/tools/code-evidence-publication.js'

const prefix = 'experts/code-evidence/'
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const cell = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('[', '&#91;').replaceAll(']', '&#93;').replaceAll('\n', ' ')
function safe(root, path) {
  const base = realpathSync(root), dest = realpathSync(resolve(root, path)), rel = relative(base, dest)
  if (isAbsolute(rel) || rel === '..' || rel.startsWith('../')) throw new Error(`Input escapes repository: ${path}`)
  return dest
}
export const evidenceFingerprint = (item, lib, ed) => { const {conformance, ...reading} = item; return recordHash({evidence:reading, source:{library_id:lib.id, edition_id:ed.id, repository:lib.repository, version:ed.version, commit_sha:ed.commit_sha}}) }
const shaPattern = /^[a-f0-9]{40}$/
export function validateEvidence({catalog, rules, trace}, {clauses = new Map(), baselineChanged = false, publicationSources = [], references} = {}) {
  const libraries = new Map(), editions = new Map(), evidence = new Map(), families = new Map(), seen = new Set(), functionLocations = new Map()
  for (const lib of catalog.libraries) {
    if (libraries.has(lib.id) || seen.has(lib.repository.toLowerCase()) || (lib.github_id && seen.has(lib.github_id)) || lib.repository.split('/').some(p => ['.', '..'].includes(p))) throw new Error('Duplicate or unsafe library identity')
    libraries.set(lib.id, lib); seen.add(lib.repository.toLowerCase()); if (lib.github_id) seen.add(lib.github_id)
    for (const edition of lib.editions) {
      if (editions.has(edition.id) || !shaPattern.test(edition.commit_sha)) throw new Error('Duplicate edition or unpinned commit')
      editions.set(edition.id, {...edition, library_id: lib.id})
    }
  }
  for (const rule of rules) {
    if (families.has(rule.id)) throw new Error('Duplicate rule family')
    families.set(rule.id, rule)
    for (const item of rule.evidence) {
      const lib = libraries.get(item.library_id), ed = editions.get(item.edition_id)
      if (evidence.has(item.id) || !lib || !ed || ed.library_id !== lib.id) throw new Error('Duplicate evidence or unresolved source')
      if (new Date(item.collected_on).toISOString().slice(0, 10) !== item.collected_on) throw new Error('Invalid collection date')
      if (item.explanation.length < 1 || item.explanation.length > 3 || item.explanation.some(p => !p.trim() || /[\r\n]/.test(p))) throw new Error('Evidence requires one to three paragraphs')
      const functions = new Set()
      for (const fn of item.functions) {
        const key = `${lib.id}:${ed.id}:`
        if (functions.has(fn.id) || !fn.id.startsWith(key) || fn.start_line > fn.end_line ||
            !/^([A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(fn.path) || fn.path.startsWith('/') || fn.path.includes('\\') || fn.path.split('/').some(p => !p || p === '.' || p === '..') || /[\r\n#?]/.test(fn.path)) throw new Error('Invalid or duplicate function location')
        functions.add(fn.id)
        if (functionLocations.has(fn.id) && JSON.stringify(functionLocations.get(fn.id)) !== JSON.stringify(fn)) throw new Error('Conflicting locations for stable function ID')
        functionLocations.set(fn.id, fn)
      }
      evidence.set(item.id, {item, rule, lib, ed})
    }
    const historical = new Set()
    for (const pub of rule.historical_publications ?? []) {
      if (historical.has(pub.id) || !rule.evidence.some(item => item.id === pub.id)) throw new Error('Duplicate or orphan historical publication')
      historical.add(pub.id)
    }
  }
  const normalized = [], comparisons = new Set(), compared = new Set()
  for (const record of trace.records) {
    const joined = evidence.get(record.finding_id)
    if (comparisons.has(record.id) || compared.has(record.finding_id) || !joined || joined.rule.id !== record.rule_id) throw new Error('Duplicate or unresolved comparison')
    if (record.reviewed_on < joined.item.collected_on) throw new Error('Review precedes collection date')
    comparisons.add(record.id); compared.add(record.finding_id)
    if (record.previous_comparison && (record.previous_comparison !== record.finding_id || !trace.publications.sources.some(s => s.id === record.previous_comparison))) throw new Error('Unresolved previous comparison')
    if ((record.disposition === 'mapped') !== (record.bindings.length > 0) || (record.disposition === 'not_mapped' && !record.reason?.trim())) throw new Error('Unmapped comparisons need a reason and no artificial binding')
    if (record.decision.action === 'defer' && (!record.decision.question?.trim() || !record.decision.role?.trim())) throw new Error('Deferred decision needs question and owner role')
    if (references) {
      for (const [field, known] of [['requirement_ids', references.requirements], ['vector_ids', references.vectors], ['agentic_operations', references.operations]]) {
        if (new Set(record[field]).size !== record[field].length || record[field].some(id => !known.has(id))) throw new Error('Unresolved or duplicate ' + field)
      }
    }
    const {item, rule, lib, ed} = joined, problems = []
    if (item.conformance) {
      const result = item.conformance, tests = result.test_ids ?? record.vector_ids
      if (!Number.isInteger(result.passed) || !Number.isInteger(result.total) || result.passed < 0 || result.total < 1 || result.passed > result.total || result.total !== tests.length || new Set(tests).size !== tests.length || (references && tests.some(id => !references.vectors.has(id))) || !Array.isArray(result.description) || result.description.length < 1 || result.description.length > 2 || result.description.some(p => typeof p !== 'string' || !p.trim() || /[\r\n]/.test(p))) throw new Error('Invalid conformance result or selected test count')
    }
    if (evidenceFingerprint(item,lib,ed) !== record.record_sha256) problems.push('evidence_record_changed')
    if (baselineChanged) problems.push('review_baseline_changed')
    const targets = new Set()
    const bindings = record.bindings.map(binding => {
      if (targets.has(binding.target_id)) throw new Error('Duplicate target binding')
      targets.add(binding.target_id)
      if (binding.implementation_relationship === 'same_approach' && (binding.relationship !== 'already_addressed' || binding.evidence_role !== 'supports_rationale')) throw new Error('Same-approach binding needs supporting rationale')
      const current = clauses.get(binding.target_id)
      if (current?.sha256 !== binding.clause_sha256 || current?.path !== binding.target_path) problems.push('target_clause_changed:' + binding.target_id)
      const {clause_sha256, ...fields} = binding
      return {...fields, reviewed_clause_sha256: clause_sha256, current_clause_sha256: current?.sha256 ?? null, limits: item.explanation.at(-1)}
    })
    normalized.push({key: 'code-evidence/' + record.id, id: record.id, collection: 'code-evidence', claim: item.explanation[0],
      local_index: {path: prefix + 'traceability.md', anchor: record.id.toLowerCase()},
      source: {kind: 'pinned_code_analysis', id: item.id, groups: [lib.repository + '@' + ed.commit_sha],
        references: [{path: prefix + `rules/${rule.id}.json`, anchor: null, label: item.id}],
        reviewed_fingerprints: {record_sha256: record.record_sha256}, observed_fingerprints: {record_sha256: evidenceFingerprint(item,lib,ed)},
        details: {project: lib.name, repository: lib.repository, owner: lib.repository.split('/')[0], version: ed.version, commit_sha: ed.commit_sha,
          functions: item.functions.map(fn => ({name: fn.name, href: sourceUrl(lib, ed, fn)})), collected_on: item.collected_on,
          relationship: item.relationship, qualification: item.qualification, decision: record.decision, execution_status: item.conformance ? 'see_conformance_result' : 'not_executed',
          ...(item.conformance ? {conformance:item.conformance, conformance_test_ids:item.conformance.test_ids ?? record.vector_ids} : {}),
          reviewed_by: record.reviewed_by, reviewed_on: record.reviewed_on, disposition: record.disposition}},
      assessment: {curation: bindings.length ? 'reviewed' : 'pending_curation', freshness: problems.length ? 'needs_recheck' : 'current',
        independent_validation: 'pending_validation', publication_authorization: 'not_recorded', editorial_eligible: false, recheck_reasons: problems}, bindings})
  }
  for (const {item} of evidence.values()) if (item.conformance && !compared.has(item.id)) throw new Error('Conformance result needs an existing comparison and test references')
  for (const {item} of evidence.values()) if (item.qualification !== 'not_critically_reviewed' && !compared.has(item.id)) throw new Error('Reviewed finding missing comparison')
  for (const item of publicationSources) {
    const source = item.source, problems = [], joined = evidence.get(source.id)
    if (!joined || joined.lib.repository !== source.repository || joined.ed.commit_sha !== source.commit_sha) throw new Error('Historical publication source differs from evidence')
    if (!source.current) problems.push('publication_record_changed')
    const bindings = trace.publications.bindings.filter(b => b.source_id === source.id).map(binding => {
      const {source_id, clause_sha256, ...fields} = binding, current = clauses.get(binding.target_id)
      if (current?.sha256 !== clause_sha256) problems.push('target_clause_changed:' + binding.target_id)
      return {...fields, reviewed_clause_sha256: clause_sha256, current_clause_sha256: current?.sha256 ?? null, limits: source.limits}
    })
    if (!bindings.length || comparisons.has(source.id)) throw new Error('Historical publication missing bindings or duplicate ID')
    comparisons.add(source.id)
    normalized.unshift({key: 'code-evidence/' + source.id, id: source.id, collection: 'code-evidence', claim: source.title,
      local_index: {path: prefix + 'traceability.md', anchor: source.id.toLowerCase()},
      source: {kind: 'pinned_code_analysis', id: source.id, groups: [source.repository + '@' + source.commit_sha],
        references: [{path: source.publication_path, anchor: null, label: source.project}],
        reviewed_fingerprints: {publication_sha256: source.publication_sha256}, observed_fingerprints: {publication_sha256: item.observed},
        details: Object.fromEntries(['project','repository','owner','version','commit_sha','functions','reading_extent','execution_status'].map(k => [k, source[k]]))},
      assessment: {curation: 'reviewed', freshness: problems.length ? 'needs_recheck' : 'current', independent_validation: 'pending_validation',
        publication_authorization: 'not_recorded', editorial_eligible: null, recheck_reasons: problems}, bindings})
  }
  normalized.sort((a,b) => a.id.localeCompare(b.id))
  return {libraries, editions, evidence, families, records: normalized}
}
// Registry headings declare canonical IDs; prose mentions cannot invent operations.
export function agenticOperationIds(markdown) {
  return new Set([...markdown.matchAll(/^## `(finkore\.[a-z][a-z0-9]*(?:\.[a-z][a-zA-Z0-9]*)+)`$/gm)].map(match => match[1]))
}
export const sourceUrl = (lib, ed, fn) => `https://github.com/${lib.repository}/blob/${ed.commit_sha}/${fn.path}#L${fn.start_line}-L${fn.end_line}`

export function loadEvidence(root = process.cwd()) {
  const inputs = {}, read = path => {const bytes = readFileSync(safe(root,path)); inputs[path] = hash(bytes); return bytes}
  const parse = path => JSON.parse(read(path)), ajv = new Ajv({allErrors:true, strict:true})
  function validate(kind, value) {
    const schema = JSON.parse(readFileSync(new URL(`../schemas/${kind}.schema.json`, import.meta.url)))
    const check = ajv.getSchema(schema.$id) ?? ajv.compile(schema)
    if (!check(value)) throw new Error(`${kind} schema: ${ajv.errorsText(check.errors)}`)
    return value
  }
  const catalog = validate('repositories',parse(prefix+'repositories.json')), trace = validate('traceability',parse(prefix+'traceability.json'))
  const names = readdirSync(safe(root,prefix+'rules')).sort()
  if (names.some(name => !/^CE-RULE-\d{4}\.json$/.test(name))) throw new Error('Unexpected file in rules directory')
  const rules = names.map(name => {const value = validate('rule',parse(prefix+'rules/'+name)); if (name !== value.id+'.json') throw new Error('Rule ID/path mismatch'); return value})
  const clauses = requirementClauses(read('docs/coreDoc/core-doc.md').toString(), 'docs/coreDoc/core-doc.md')
  let baselineChanged = false
  for (const item of trace.review_baseline.artifacts) {
    if (!/^(docs\/coreDoc\/|spec\/|conformance\/|agentic\/)/.test(item.path)) throw new Error('Invalid baseline path')
    try {if (hash(read(item.path)) !== item.sha256) baselineChanged = true} catch(error) {if(error.code !== 'ENOENT') throw error; baselineChanged = true}
  }
  const published = loadLearnEvidence(root, {schema_version:'1.3.0', ...trace.publications})
  const publicationSources = [...published.sources.values()].map(source => {
    if (source.kind !== 'code' || source.publication_format !== 'code-evidence-v2') throw new Error('Unsupported compact publication profile')
    return {source, observed:source.current ? source.publication_sha256 : null}
  })
  const requirements = new Set(), vectors = new Set(), operations = new Set()
  function specFiles(dir) {
    for (const entry of readdirSync(safe(root,dir),{withFileTypes:true})) {
      const path = dir + '/' + entry.name
      if (entry.isDirectory()) specFiles(path)
      else if (entry.name.endsWith('.md')) for (const id of requirementClauses(read(path).toString(),path).keys()) requirements.add(id)
    }
  }
  specFiles('spec')
  const manifest = parse('conformance/manifest.json')
  for (const suite of manifest.suites) for (const local of suite.vectorFiles) {
    const path = local.replace(/^\.\//,'')
    if (!/^[A-Za-z0-9_./-]+\.json$/.test(path) || path.split('/').some(p => p === '..' || p === '.')) throw new Error('Invalid vector discovery path')
    for (const vector of parse('conformance/'+path).vectors) vectors.add(vector.id)
  }
  for (const id of agenticOperationIds(read('agentic/operations.md').toString())) operations.add(id)
  for (const rule of rules) for (const item of rule.evidence) if ((item.context_requirement_ids ?? []).some(id => !requirements.has(id))) throw new Error('Unresolved contextual requirement')
  const state = validateEvidence({catalog, rules, trace}, {clauses, baselineChanged, publicationSources, references:{requirements,vectors,operations}})
  return {catalog, rules, trace, state, inputs}
}
export function renderEvidence({catalog,rules,trace,state}) {
  const lines = ['# Code Evidence — traceability', '', '<!-- Generated by tools/evidence.js. Edit rules/*.json and traceability.json. -->', '',
    'Non-normative source readings. Where present, conformance scores report bounded external evaluations; their descriptions distinguish failures, unsupported cases and infrastructure errors. Independent financial validation and specialist review remain separate. Repetition does not establish independence or accept a FinKore rule.', '',
    '## By rule family', '', '| Family | Evidence | Libraries |', '| --- | --- | --- |']
  for (const rule of rules) lines.push(`| [${rule.id}: ${cell(rule.title)}](rules/${rule.id}.json) | ${rule.evidence.length} | ${new Set(rule.evidence.map(e => e.library_id)).size} |`)
  lines.push('', '## By evidence', '', '| Evidence | Library / collected | Relationship | Location / function | Comparison | Conformance |', '| --- | --- | --- | --- | --- | --- |')
  for (const rule of rules) for (const item of rule.evidence) {
    const {lib, ed} = state.evidence.get(item.id), comp = trace.records.find(r => r.finding_id === item.id)
    const fns = item.functions.map(fn => `[${cell(fn.path)}:${fn.start_line} — ${cell(fn.name)}](${sourceUrl(lib,ed,fn)})`).join('; ')
    lines.push(`| <a id="${item.id.toLowerCase()}"></a>[${item.id}](rules/${rule.id}.json) | ${cell(lib.name)} / ${item.collected_on} | ${item.relationship} (${item.qualification}) | ${fns} | ${comp ? `[${comp.id}](#${comp.id.toLowerCase()})` : 'Not critically curated'} | ${item.conformance ? `${item.conformance.passed}/${item.conformance.total}` : 'Not evaluated'} |`)
  }
  lines.push('', '## Reviewed comparisons', '', '| Comparison | Evidence | Targets | Freshness | Follow-up |', '| --- | --- | --- | --- | --- |')
  for (const record of trace.records) {
    const normalized = state.records.find(r => r.id === record.id)
    lines.push(`| <a id="${record.id.toLowerCase()}"></a>${record.id} | [${record.finding_id}](#${record.finding_id.toLowerCase()}) | ${record.bindings.map(b => b.target_id).join(', ') || 'No direct binding'} | ${normalized.assessment.freshness} | ${cell(record.decision.question ?? record.decision.action)} |`)
  }
  lines.push('', 'Historical Learn selections retain their existing finding IDs and bounded interpretations in each rule’s historical_publications. The current comparison qualifies those readings separately. See [JSON curation](traceability.json), [libraries](repositories.json), [global Experts index](../traceability.md) and [guidance](README.md).', '')
  return lines.join('\n')
}
export function run(root, {check=false, write=false}={}) {
  const loaded = loadEvidence(root), markdown = renderEvidence(loaded), path=resolve(root,prefix+'traceability.md')
  if (write) writeFileSync(path,markdown)
  if (check && (!existsSync(path) || readFileSync(path,'utf8') !== markdown)) throw new Error('Code Evidence view is stale; run code-evidence:build')
  if (check && loaded.state.records.some(r => r.assessment.freshness !== 'current')) throw new Error('Code Evidence requires semantic recheck; build does not renew review fingerprints')
  return {schema_version:'2.0.0', records:loaded.state.records, inputs:loaded.inputs, markdown,
    counts:{libraries:loaded.state.libraries.size, rules:loaded.rules.length, evidence:loaded.state.evidence.size, comparisons:loaded.state.records.length,
      conformance_reports:[...loaded.state.evidence.values()].filter(({item})=>item.conformance).length,
      conformance_case_applications:[...loaded.state.evidence.values()].reduce((n,{item})=>n+(item.conformance?.total??0),0),
      conformance_passed:[...loaded.state.evidence.values()].reduce((n,{item})=>n+(item.conformance?.passed??0),0)}}
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const root = process.argv.includes('--export') ? process.argv[process.argv.indexOf('--export')+1] : process.cwd()
    const result = run(root,{check:process.argv.includes('--check'),write:process.argv.includes('--write')})
    console.log(JSON.stringify(process.argv.includes('--export') ? result : result.counts))
  } catch(error) {console.error(error.message);process.exitCode=1}
}
