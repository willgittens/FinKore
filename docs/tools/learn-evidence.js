// SPDX-License-Identifier: MPL-2.0
/**
 * Renders optional, curated Learn source links beside unchanged contract text.
 * This developer tool reads publication inputs without changing them and detects
 * stale comparisons. It writes nothing and does not define or execute financial
 * behavior, assess quality or grant approval.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { resolve, relative, isAbsolute } from 'node:path'

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const normal = value => value.trim().replace(/\s+/gu, ' ')
const sha = value => createHash('sha256').update(value).digest('hex')
const hash = value => sha(JSON.stringify(typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value, null, 2) + '\n')
const roles = new Map([
  ['supports_rationale', 'Supports the rationale'], ['illustrates_risk', 'Illustrates a risk'],
  ['limits_claim', 'Clarifies a boundary'], ['counterpoint', 'Offers a counterpoint'], ['context_only', 'Provides context'],
])
const relationships = new Set(['already_addressed', 'possible_gap', 'possible_conflict', 'application_policy', 'deferred_scope', 'outside_scope'])

export function requirementClauses(markdown, path) {
  const clauses = new Map()
  const core = path === 'docs/coreDoc/core-doc.md'
  const pattern = core ? /^### (CORE-\d{3}\.\d+) [—-] (.+)$/gm : /^\s*- \*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]\s*(.+)$/gm
  const matches = [...markdown.matchAll(pattern)]
  for (const [index, match] of matches.entries()) {
    let fingerprint, statement
    if (core) {
      const block = markdown.slice(match.index + match[0].length, matches[index + 1]?.index).split(/^## /m)[0]
      statement = normal(block.match(/\*\*Rule\*\*\s*([\s\S]*?)(?=\n\*\*|$)/)?.[1] ?? '')
      if (!statement) throw new Error(`Missing CoreDoc rule: ${match[1]}`)
      fingerprint = hash({ title: match[2], context: normal(block) })
    } else {
      let continuation = markdown.slice(match.index + match[0].length).split('\n\n')[0]
      if (/^(?:- |#)/.test(continuation.trimStart())) continuation = ''
      statement = normal(match[2] + ' ' + continuation)
      if (!/\b(?:MUST|SHOULD|MAY)\b/.test(statement)) continue
      fingerprint = hash(statement)
    }
    if (clauses.has(match[1])) throw new Error(`Duplicate requirement definition: ${match[1]}`)
    clauses.set(match[1], { path, sha256: fingerprint, statement })
  }
  return clauses
}

function contained(root, path) {
  const relation = relative(realpathSync(root), realpathSync(resolve(root, path)))
  if (isAbsolute(relation) || relation === '..' || relation.startsWith('../')) throw new Error(`Evidence publication escapes repository: ${path}`)
  return resolve(root, path)
}

export function loadLearnEvidence(root) {
  const path = resolve(root, 'learn/related-evidence.json')
  const index = { sources: new Map(), byTarget: new Map() }
  if (!existsSync(path)) return index // Contract readers also work without research.
  const data = JSON.parse(readFileSync(contained(root, 'learn/related-evidence.json'), 'utf8'))
  if (data.schema_version !== '1.0.0' || !Array.isArray(data.sources) || !Array.isArray(data.bindings)) throw new Error('Unsupported Learn evidence format')
  for (const source of data.sources) {
    if (!/^(?:MAP|LGC)-\d{4}$/.test(source.id) || index.sources.has(source.id) || !['research', 'legacy'].includes(source.kind) ||
        !source.title?.trim() || !Array.isArray(source.authors) || !source.authors.length || source.authors.some(author => typeof author !== 'string' || !author.trim()) ||
        !source.limits?.trim() || source.status !== 'pending_validation' || !/^[a-f0-9]{64}$/.test(source.publication_sha256)) throw new Error('Invalid or duplicate Learn evidence source')
    const allowed = source.kind === 'research' ? /^research\.html#rev-\d{4}$/ : /^legacy-\d{3}-[a-z0-9-]+\.html#[a-z0-9-]+$/
    const publication = source.kind === 'research' ? /^learn\/research\.md$/ : /^legacy\/interviews\/\d{3}-[a-z0-9-]+\.md$/
    if (!allowed.test(source.href) || !publication.test(source.publication_path) || !source.id.startsWith(source.kind === 'research' ? 'MAP-' : 'LGC-')) throw new Error('Unsupported Learn evidence destination')
    let current = false
    try {
      const bytes = readFileSync(contained(root, source.publication_path))
      current = sha(bytes) === source.publication_sha256
      if (source.kind === 'legacy') {
        const text = bytes.toString('utf8')
        const speaker = text.match(/^\*\*Interviewee:\*\*\s*(.+)$/m)?.[1].trim()
        const approved = /^\*\*Status:\*\* (?:Approved by Interviewee on .+|Approved for publication — confirmed by the project maintainer on \d{2}\.\d{2}\.\d{4})\s*$/m.test(text)
        const reader = 'legacy-' + source.publication_path.split('/').at(-1).replace(/\.md$/, '.html')
        current &&= approved && source.authors.length === 1 && source.authors[0] === speaker && source.href.startsWith(reader + '#')
      }
    }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    index.sources.set(source.id, { ...source, current })
  }
  const seen = new Set()
  for (const binding of data.bindings) {
    const key = `${binding.source_id}/${binding.target_id}`
    if (seen.has(key) || !index.sources.has(binding.source_id) || !/^(?:CORE-\d{3}\.\d+|[A-Z][A-Z0-9-]+-\d{3})$/.test(binding.target_id) ||
        !roles.has(binding.evidence_role) || !relationships.has(binding.relationship) || !binding.explanation?.trim() ||
        !/^[a-f0-9]{64}$/.test(binding.clause_sha256) || !/^(?:docs\/coreDoc\/core-doc\.md|spec\/[A-Za-z0-9/-]+\.md)$/.test(binding.target_path)) throw new Error('Invalid or duplicate Learn evidence binding')
    seen.add(key)
    if (!index.byTarget.has(binding.target_id)) index.byTarget.set(binding.target_id, [])
    index.byTarget.get(binding.target_id).push(binding)
  }
  return index
}

export function renderRelatedEvidence(id, clause, index) {
  const bindings = index?.byTarget.get(id) ?? []
  if (!bindings.length) return ''
  const current = bindings.filter(binding => binding.target_path === clause.path && binding.clause_sha256 === clause.sha256 && index.sources.get(binding.source_id).current)
  const stale = bindings.length - current.length
  if (!current.length) return `<aside class="rule-evidence-stale"><p>Related reading for ${escape(id)} needs review after a source or rule changed.</p></aside>`
  const kinds = current.reduce((counts, binding) => { const kind = index.sources.get(binding.source_id).kind; counts[kind] = (counts[kind] ?? 0) + 1; return counts }, {})
  const label = [kinds.research ? `${kinds.research} research ${kinds.research === 1 ? 'note' : 'notes'}` : '', kinds.legacy ? `${kinds.legacy} practitioner ${kinds.legacy === 1 ? 'account' : 'accounts'}` : ''].filter(Boolean).join(' · ')
  return `<aside class="rule-evidence" aria-label="Evidence and context for ${escape(id)}"><details>
    <summary><span>Evidence &amp; context<span class="rule-evidence-count">${label}</span></span><span aria-hidden="true">+</span></summary>
    <p class="rule-evidence-intro">These sources inform discussion of this rule. Their role and limits are stated separately; a citation is not certification or specialist sign-off. Notes from the same study are not independent confirmation.</p>
    <div class="rule-evidence-grid">${current.map(binding => {
      const source = index.sources.get(binding.source_id)
      return `<article class="rule-evidence-card"><p class="rule-evidence-kind">${source.kind === 'research' ? 'Research' : 'Legacy'} <span aria-hidden="true">/</span> ${roles.get(binding.evidence_role)}</p><p class="rule-evidence-title"><a href="${escape(source.href)}">${escape(source.title)} <span aria-hidden="true">↗</span></a></p><p class="rule-evidence-authors">${escape(source.authors.join('; '))}</p><p>${escape(binding.explanation)}</p><details class="rule-evidence-limits"><summary>Scope and limitations</summary><p>${escape(source.limits)}</p></details></article>`
    }).join('')}</div>${stale ? '<p class="rule-evidence-stale">Some other related readings need review after a source or rule changed.</p>' : ''}
  </details></aside>`
}

export function decorateSpecification(html, markdown, source, index) {
  const clauses = requirementClauses(markdown, source)
  const seen = new Set()
  return html.replace(/<li><strong>([A-Z][A-Z0-9-]+-\d{3})<\/strong>([\s\S]*?)<\/li>/g, (original, id) => {
    const clause = clauses.get(id)
    if (!clause) return original
    if (seen.has(id)) throw new Error(`Repeated specification requirement: ${id}`)
    seen.add(id)
    return `<li class="spec-requirement" id="${id.toLowerCase()}">${original.slice(4, -5)}${renderRelatedEvidence(id, clause, index)}</li>`
  })
}
