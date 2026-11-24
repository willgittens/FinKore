// SPDX-License-Identifier: MPL-2.0
/**
 * Reads compact, previously selected Code Evidence publications and checks integrity.
 * This developer tool reads metadata without changing it and writes nothing.
 * It does not define financial behavior, approve evidence or execute source code.
 */
import { createHash } from 'node:crypto'

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  return value
}
export const recordHash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')

export function compactCodePublication(bytes, source) {
  const rule = JSON.parse(bytes.toString('utf8'))
  if (!['2.0.0','2.1.0'].includes(rule.schema_version) || !/^CE-RULE-\d{4}$/.test(rule.id) ||
      source.publication_path !== `experts/code-evidence/rules/${rule.id}.json`) throw new Error('Invalid compact code publication')
  const matches = rule.historical_publications?.filter(item => item.id === source.id) ?? []
  const readings = rule.evidence?.filter(item => item.id === source.id) ?? []
  if (matches.length !== 1 || readings.length !== 1) throw new Error('Missing or duplicate compact code publication record')
  const publication = matches[0], reading = readings[0]
  if (publication.title !== source.title || !Array.isArray(publication.explanation) || publication.explanation.length < 1 ||
      publication.explanation.length > 3 || publication.explanation.some(p => typeof p !== 'string' || !p.trim() || /[\r\n]/.test(p)) ||
      publication.explanation.at(-1) !== source.limits || !Array.isArray(publication.function_ids) ||
      new Set(publication.function_ids).size !== publication.function_ids.length) throw new Error('Invalid compact code publication text')
  const functions = publication.function_ids.map(id => {
    const fn = reading.functions?.find(fn => fn.id === id)
    if (!fn) throw new Error('Missing compact publication function')
    return {name: fn.name, href: `https://github.com/${source.repository}/blob/${source.commit_sha}/${fn.path}#L${fn.start_line}-L${fn.end_line}`}
  })
  if (JSON.stringify(canonical(functions)) !== JSON.stringify(canonical(source.functions))) throw new Error('Compact publication functions differ')
  return { publication, reading, fingerprint: recordHash(publication) }
}

// Execution observations have a separate explicit selection. They do not publish
// the comparison's interpretation or change its editorial/financial assessment.
export function conformanceReportFromRecord(record, targetIds) {
  const d = record.source?.details, sourcePath = record.source?.references?.[0]?.path
  if (record.collection !== 'code-evidence' || record.source?.kind !== 'pinned_code_analysis' ||
      !['reviewed', 'pending_curation'].includes(record.assessment?.curation) || record.assessment?.freshness !== 'current' ||
      !d?.conformance || !Array.isArray(targetIds) || (!targetIds.length && record.bindings.length) || new Set(targetIds).size !== targetIds.length) throw new Error('Execution observation needs a current Code Evidence record')
  const targets = targetIds.map(id => {
    const binding = record.bindings.find(b => b.target_id === id)
    if (!binding || binding.reviewed_clause_sha256 !== binding.current_clause_sha256) throw new Error('Execution observation target needs recheck')
    return {target_id:id, target_path:binding.target_path, clause_sha256:binding.reviewed_clause_sha256}
  })
  const report = {id:record.id, finding_id:record.source.id, project:d.project, repository:d.repository,
    version:d.version, commit_sha:d.commit_sha, publication_path:sourcePath,
    href:'https://github.com/willgittens/FinKore/blob/main/'+sourcePath,
    reading_sha256:record.source.reviewed_fingerprints?.record_sha256,
    functions:d.functions, test_ids:d.conformance_test_ids, targets, conformance:d.conformance}
  validateConformanceReport(report)
  return report
}

export function validateConformanceReport(report) {
  const text = s => typeof s === 'string' && s.trim().length > 0
  const digest = /^[a-f0-9]{64}$/
  if (!report || !/^CE-COMPARISON-\d{4}$/.test(report.id) || !/^CE-FINDING-\d{4}$/.test(report.finding_id) ||
      !text(report.project) || !text(report.version) || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(report.repository) ||
      report.repository.split('/').some(p => ['.','..'].includes(p)) || !/^[a-f0-9]{40}$/.test(report.commit_sha) ||
      !/^experts\/code-evidence\/rules\/CE-RULE-\d{4}\.json$/.test(report.publication_path) ||
      report.href !== 'https://github.com/willgittens/FinKore/blob/main/'+report.publication_path ||
      !digest.test(report.reading_sha256) || !Array.isArray(report.functions) || !report.functions.length) throw new Error('Invalid Code Evidence execution source')
  for (const fn of report.functions) {
    const prefix = `https://github.com/${report.repository}/blob/${report.commit_sha}/`
    const suffix = typeof fn.href === 'string' && fn.href.startsWith(prefix) ? fn.href.slice(prefix.length) : ''
    const m = suffix.match(/^([A-Za-z0-9_./-]+)#L([1-9]\d*)-L([1-9]\d*)$/)
    if (!text(fn.name) || !m || m[1].split('/').some(p => !p || p === '.' || p === '..') || Number(m[2]) > Number(m[3])) throw new Error('Invalid execution function location')
  }
  const c=report.conformance, ids=report.test_ids
  if (!c || !Number.isInteger(c.passed) || !Number.isInteger(c.total) || c.passed < 0 || c.total < 1 || c.passed > c.total ||
      !Array.isArray(ids) || ids.length !== c.total || ids.some(id => !text(id)) || new Set(ids).size !== ids.length ||
      !Array.isArray(c.description) || c.description.length < 1 || c.description.length > 2 || c.description.some(p => !text(p) || /[\r\n]/.test(p)) ||
      Object.keys(c).some(k => !['passed','total','description','test_ids'].includes(k)) ||
      (c.test_ids && recordHash(c.test_ids) !== recordHash(ids))) throw new Error('Invalid execution score, description or selected cases')
  if (!Array.isArray(report.targets) || new Set(report.targets.map(t => t.target_id)).size !== report.targets.length ||
      report.targets.some(t => !/^CORE-\d{3}\.\d+$/.test(t.target_id) || t.target_path !== 'docs/coreDoc/core-doc.md' || !digest.test(t.clause_sha256))) throw new Error('Invalid execution target')
}

export function compactConformanceCurrent(bytes, report) {
  const rule=JSON.parse(bytes.toString('utf8'))
  if (rule.schema_version !== '2.1.0' || report.publication_path !== `experts/code-evidence/rules/${rule.id}.json`) return false
  const readings=rule.evidence?.filter(e => e.id === report.finding_id) ?? []
  if (readings.length !== 1) return false
  const {conformance,...reading}=readings[0]
  const fingerprint=recordHash({evidence:reading, source:{library_id:reading.library_id, edition_id:reading.edition_id,
    repository:report.repository, version:report.version, commit_sha:report.commit_sha}})
  const functions=reading.functions.map(fn => ({name:fn.name,href:`https://github.com/${report.repository}/blob/${report.commit_sha}/${fn.path}#L${fn.start_line}-L${fn.end_line}`}))
  return fingerprint === report.reading_sha256 && recordHash(conformance) === recordHash(report.conformance) && recordHash(functions) === recordHash(report.functions)
}
