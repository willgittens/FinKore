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
  if (rule.schema_version !== '2.0.0' || !/^CE-RULE-\d{4}$/.test(rule.id) ||
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
