// SPDX-License-Identifier: MPL-2.0
/**
 * Exports explicitly selected Experts comparisons into Learn's publication snapshot.
 * This developer tool reads the generated index and editorial selection without
 * changing them. Build mode writes the snapshot; check mode writes nothing.
 * It does not define or execute financial behavior or approve changed evidence.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadLearnEvidence, requirementClauses } from './learn-evidence.js'

const sha = value => createHash('sha256').update(value).digest('hex')
function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])]))
  return value
}

export function comparisonFingerprint(record) {
  const { key, id, collection, claim, source, assessment, bindings } = record
  if (!source || !assessment || !Array.isArray(bindings)) throw new Error('Malformed Experts comparison')
  return sha(JSON.stringify(sorted({ key, id, collection, claim,
    source: { kind: source.kind, id: source.id, groups: source.groups, references: source.references,
      reviewed_fingerprints: source.reviewed_fingerprints, details: source.details },
    assessment: { curation: assessment.curation, independent_validation: assessment.independent_validation,
      publication_authorization: assessment.publication_authorization, editorial_eligible: assessment.editorial_eligible },
    bindings: bindings.map(({ current_clause_sha256, ...reviewed }) => reviewed),
  })))
}

function read(root, path) {
  const absolute = resolve(root, path)
  const target = realpathSync(absolute)
  const relation = relative(realpathSync(root), target)
  if (isAbsolute(relation) || relation === '..' || relation.startsWith('../')) throw new Error(`Evidence input escapes repository: ${path}`)
  return readFileSync(target)
}

export function buildLearnEvidence(root = process.cwd(), { check = false } = {}) {
  const selectionPath = 'learn/evidence-selection.json'
  const indexPath = 'experts/traceability.json'
  const outputPath = 'learn/related-evidence.json'
  // Published readers and verification retain their independent snapshot when
  // optional evidence catalogs are absent. Neither check path invokes Python.
  if (!existsSync(resolve(root, selectionPath)) || !existsSync(resolve(root, indexPath))) return { status: 'snapshot_only', sources: 0, bindings: 0 }
  const selectionBytes = read(root, selectionPath)
  const indexBytes = read(root, indexPath)
  const selection = JSON.parse(selectionBytes)
  const index = JSON.parse(indexBytes)
  if (selection.schema_version !== '1.0.0' || !Array.isArray(selection.selections) || index.schema_version !== '1.0.0' || !Array.isArray(index.records) || !index.collections || !index.inputs) throw new Error('Unsupported Experts editorial selection format')
  const records = new Map()
  for (const record of index.records) {
    if (records.has(record.key)) throw new Error('Duplicate Experts comparison key')
    records.set(record.key, record)
  }
  const sources = [], bindings = [], seen = new Set(), guarded = new Map(), clauses = new Map()
  const kinds = { research: 'research', legacy: 'legacy', reviews: 'review', 'code-evidence': 'code' }
  for (const item of selection.selections) {
    if (seen.has(item.comparison_key) || !/^[a-f0-9]{64}$/.test(item.reviewed_comparison_sha256) || !Array.isArray(item.target_ids) || !item.target_ids.length || new Set(item.target_ids).size !== item.target_ids.length) throw new Error('Invalid or duplicate editorial selection')
    seen.add(item.comparison_key)
    const record = records.get(item.comparison_key)
    const source = item.publication
    if (!record || source?.id !== record.id || source?.kind !== kinds[record.collection]) throw new Error(`Unresolved editorial comparison: ${item.comparison_key}`)
    if (!index.collections[record.collection] || ['invalid', 'unavailable'].includes(index.collections[record.collection].status) ||
        record.assessment.curation !== 'reviewed' || record.assessment.freshness !== 'current' ||
        record.assessment.editorial_eligible === false ||
        record.assessment.independent_validation !== 'pending_validation') throw new Error(`Selected Experts comparison needs review: ${record.key}`)
    if (comparisonFingerprint(record) !== item.reviewed_comparison_sha256) throw new Error(`Editorial comparison changed; review before updating its fingerprint: ${record.key}`)
    const collectionIndex = index.collections[record.collection].index
    if (!collectionIndex?.startsWith(`experts/${record.collection}/`) || !/^[a-f0-9]{64}$/.test(index.inputs[collectionIndex])) throw new Error(`Missing selected collection fingerprint: ${record.key}`)
    // Check the saved collection snapshot and live inputs used by that profile.
    // Other collections do not become prerequisites for a selected publication.
    for (const [path, expected] of Object.entries(index.inputs)) {
      if (!path.startsWith(`experts/${record.collection}/`)) continue
      if (!guarded.has(path)) guarded.set(path, read(root, path))
      if (sha(guarded.get(path)) !== expected) throw new Error(`Experts input changed; rebuild the unified index: ${path}`)
    }
    const details = record.source.details
    if (source.kind === 'code') {
      for (const field of ['project', 'repository', 'owner', 'version', 'commit_sha', 'functions', 'reading_extent', 'execution_status']) {
        if (JSON.stringify(sorted(source[field])) !== JSON.stringify(sorted(details[field]))) throw new Error(`Published Code Evidence attribution differs from Experts: ${record.key}`)
      }
    }
    if (source.kind === 'review' && (source.report_id !== record.source.id || source.authors?.length !== 1 || source.authors[0] !== details.specialist ||
        source.original_language !== details.original_language || source.interview_language !== details.interview_language || source.translation_status !== details.translation_status ||
        source.publication_authorization !== record.assessment.publication_authorization)) throw new Error('Published Review attribution differs from Experts')
    sources.push(source)
    for (const targetId of item.target_ids) {
      const binding = record.bindings.find(binding => binding.target_id === targetId)
      if (!binding || binding.reviewed_clause_sha256 !== binding.current_clause_sha256) throw new Error(`Unresolved or changed selected rule: ${targetId}`)
      if (!clauses.has(binding.target_path)) {
        const bytes = read(root, binding.target_path)
        guarded.set(binding.target_path, bytes)
        clauses.set(binding.target_path, requirementClauses(bytes.toString('utf8'), binding.target_path))
      }
      if (clauses.get(binding.target_path).get(targetId)?.sha256 !== binding.reviewed_clause_sha256) throw new Error(`Selected rule changed; review before rebuilding: ${targetId}`)
      const exported = { source_id: record.id, target_id: targetId, target_path: binding.target_path,
        clause_sha256: binding.reviewed_clause_sha256, evidence_role: binding.evidence_role,
        relationship: binding.relationship, explanation: binding.explanation }
      if (binding.implementation_relationship) exported.implementation_relationship = binding.implementation_relationship
      bindings.push(exported)
    }
  }
  const snapshot = { schema_version: '1.3.0', description: 'Explicit editorial selection from the unified Experts index. Roles and limits are not endorsements, independent validation or normative acceptance.', sources, bindings }
  const validated = loadLearnEvidence(root, snapshot)
  if ([...validated.sources.values()].some(source => !source.current)) throw new Error('A selected publication changed; review its text before updating its fingerprint')
  if (read(root, selectionPath).compare(selectionBytes) || read(root, indexPath).compare(indexBytes)) throw new Error('Evidence inputs changed during export')
  for (const [path, bytes] of guarded) if (read(root, path).compare(bytes)) throw new Error(`Evidence input changed during export: ${path}`)
  const output = JSON.stringify(snapshot, null, 2) + '\n'
  if (check) {
    if (!existsSync(resolve(root, outputPath)) || read(root, outputPath).toString('utf8') !== output) throw new Error('Learn evidence snapshot is stale; rebuild')
  } else writeFileSync(resolve(root, outputPath), output)
  return { status: 'exported', sources: sources.length, bindings: bindings.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(`Learn evidence: ${JSON.stringify(buildLearnEvidence(process.cwd(), { check: process.argv.includes('--check') }))}. Financial behavior was not executed.`) }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}
