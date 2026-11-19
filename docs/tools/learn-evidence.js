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
const projectBase = 'https://github.com/willgittens/FinKore/blob/main/'
const codeRelationships = new Map([
  ['same_approach', 'Same approach in the inspected path'],
  ['partial_match', 'Partial match with stated limits'],
  ['different_policy', 'Different policy'],
  ['related_control', 'Related control or open question'],
])
const text = value => typeof value === 'string' && value.trim().length > 0

function validateCodeSource(source) {
  const path = /^experts\/code-evidence\/analyses\/(CE-REPO-\d{4})\/(CE-EDITION-\d{4})\.md$/
  if (!/^CE-FINDING-\d{4}$/.test(source.id) || !path.test(source.publication_path) ||
      source.href !== `${projectBase}${source.publication_path}#${source.id.toLowerCase()}` ||
      !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository) ||
      source.repository.split('/').some(part => part === '.' || part === '..') ||
      !text(source.project) || !text(source.version) || !/^[a-f0-9]{40}$/.test(source.commit_sha) ||
      source.owner !== source.repository.split('/')[0] || source.reading_extent !== 'selected_code_and_tests' ||
      source.execution_status !== 'not_executed' || !Array.isArray(source.functions) || !source.functions.length) {
    throw new Error('Invalid Code Evidence source or destination')
  }
  const urls = new Set()
  for (const fn of source.functions) {
    const prefix = `https://github.com/${source.repository}/blob/${source.commit_sha}/`
    const suffix = typeof fn.href === 'string' && fn.href.startsWith(prefix) ? fn.href.slice(prefix.length) : ''
    const match = suffix.match(/^([A-Za-z0-9_./-]+)#L([1-9]\d*)-L([1-9]\d*)$/)
    if (!text(fn.name) || !match || match[1].split('/').some(part => !part || part === '.' || part === '..') ||
        Number(match[2]) > Number(match[3]) || urls.has(fn.href)) throw new Error('Invalid or duplicate pinned Code Evidence function')
    urls.add(fn.href)
  }
}

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

export function loadLearnEvidence(root, suppliedData) {
  const path = resolve(root, 'learn/related-evidence.json')
  const index = { sources: new Map(), byTarget: new Map() }
  if (suppliedData === undefined && !existsSync(path)) return index // Contract readers also work without research.
  const data = suppliedData === undefined
    ? JSON.parse(readFileSync(contained(root, 'learn/related-evidence.json'), 'utf8'))
    : suppliedData
  if (!data || !['1.0.0', '1.1.0'].includes(data.schema_version) || !Array.isArray(data.sources) || !Array.isArray(data.bindings)) throw new Error('Unsupported Learn evidence format')
  for (const source of data.sources) {
    if (index.sources.has(source.id) || !['research', 'legacy', 'code'].includes(source.kind) ||
        !text(source.title) || !text(source.limits) || source.status !== 'pending_validation' ||
        !/^[a-f0-9]{64}$/.test(source.publication_sha256)) throw new Error('Invalid or duplicate Learn evidence source')
    if (source.kind === 'code') {
      if (data.schema_version !== '1.1.0') throw new Error('Code Evidence requires Learn evidence format 1.1.0')
      validateCodeSource(source)
    } else {
      if (!/^(?:MAP|LGC)-\d{4}$/.test(source.id) || !Array.isArray(source.authors) || !source.authors.length || source.authors.some(author => !text(author))) throw new Error('Invalid Learn evidence attribution')
      const allowed = source.kind === 'research' ? /^research\.html#rev-\d{4}$/ : /^legacy-\d{3}-[a-z0-9-]+\.html#[a-z0-9-]+$/
      const publication = source.kind === 'research' ? /^learn\/research\.md$/ : /^experts\/legacy\/interviews\/\d{3}-[a-z0-9-]+\.md$/
      if (!allowed.test(source.href) || !publication.test(source.publication_path) || !source.id.startsWith(source.kind === 'research' ? 'MAP-' : 'LGC-')) throw new Error('Unsupported Learn evidence destination')
    }
    let current = false
    try {
      const bytes = readFileSync(contained(root, source.publication_path))
      current = sha(bytes) === source.publication_sha256
      if (source.kind === 'code') {
        const body = bytes.toString('utf8')
        current &&= body.includes(source.id) && body.includes(source.commit_sha) &&
          source.functions.every(fn => body.includes(fn.name) && body.includes(fn.href))
      }
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
    if (index.sources.get(binding.source_id).kind === 'code' &&
        (binding.target_path !== 'docs/coreDoc/core-doc.md' || !/^CORE-\d{3}\.\d+$/.test(binding.target_id) ||
         !codeRelationships.has(binding.implementation_relationship) ||
         (binding.implementation_relationship === 'same_approach' &&
          (binding.evidence_role !== 'supports_rationale' || binding.relationship !== 'already_addressed')))) {
      throw new Error('Invalid Code Evidence CoreDoc comparison')
    }
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
  const code = current.filter(binding => index.sources.get(binding.source_id).kind === 'code')
  const readings = current.filter(binding => index.sources.get(binding.source_id).kind !== 'code')
  const kinds = readings.reduce((counts, binding) => { const kind = index.sources.get(binding.source_id).kind; counts[kind] = (counts[kind] ?? 0) + 1; return counts }, {})
  const label = [kinds.research ? `${kinds.research} research ${kinds.research === 1 ? 'note' : 'notes'}` : '', kinds.legacy ? `${kinds.legacy} practitioner ${kinds.legacy === 1 ? 'account' : 'accounts'}` : ''].filter(Boolean).join(' · ')
  const editorial = readings.length ? `<aside class="rule-evidence" aria-label="Evidence and context for ${escape(id)}"><details>
    <summary><span>Evidence &amp; context<span class="rule-evidence-count">${label}</span></span><span aria-hidden="true">+</span></summary>
    <p class="rule-evidence-intro">These sources inform discussion of this rule. Their role and limits are stated separately; a citation is not certification or specialist sign-off. Notes from the same study are not independent confirmation.</p>
    <div class="rule-evidence-grid">${readings.map(binding => {
      const source = index.sources.get(binding.source_id)
      return `<article class="rule-evidence-card"><p class="rule-evidence-kind">${source.kind === 'research' ? 'Research' : 'Legacy'} <span aria-hidden="true">/</span> ${roles.get(binding.evidence_role)}</p><p class="rule-evidence-title"><a href="${escape(source.href)}">${escape(source.title)} <span aria-hidden="true">↗</span></a></p><p class="rule-evidence-authors">${escape(source.authors.join('; '))}</p><p>${escape(binding.explanation)}</p><details class="rule-evidence-limits"><summary>Scope and limitations</summary><p>${escape(source.limits)}</p></details></article>`
    }).join('')}</div>${stale ? '<p class="rule-evidence-stale">Some other related readings need review after a source or rule changed.</p>' : ''}
  </details></aside>` : ''
  return [editorial, code.length ? renderCodeEvidence(id, code, index, stale) : ''].filter(Boolean).join('\n            ')
}

function renderCodeEvidence(id, bindings, index, stale) {
  const groups = [...codeRelationships].map(([kind, label]) => {
    const matches = bindings.filter(binding => binding.implementation_relationship === kind)
    if (!matches.length) return ''
    return `<section class="code-evidence-group" aria-label="${escape(label)}"><h4>${escape(label)}</h4>
      <div class="rule-evidence-grid">${matches.map(binding => {
        const source = index.sources.get(binding.source_id)
        return `<article class="rule-evidence-card" data-finding="${escape(source.id)}">
          <p class="rule-evidence-kind">Code Evidence · ${escape(source.id)}</p>
          <h5 class="rule-evidence-title">${escape(source.project)} <span>${escape(source.version)}</span></h5>
          <p class="code-evidence-repository">${escape(source.repository)} · GitHub owner: ${escape(source.owner)}</p>
          <p class="code-evidence-status">Code and tests read · Not executed</p>
          <p>${escape(binding.explanation)}</p>
          <details class="rule-evidence-limits"><summary>Functions, source &amp; scope</summary>
            <p>${escape(source.title)}</p><ul class="code-evidence-functions">${source.functions.map(fn => `<li><a href="${escape(fn.href)}" target="_blank" rel="noopener noreferrer"><code>${escape(fn.name)}</code></a></li>`).join('')}</ul>
            <p>${escape(source.limits)}</p>
            <p>Selected code and tests read · Not executed · Pending validation</p>
            <p><a href="${escape(source.href)}" target="_blank" rel="noopener noreferrer">Read the full analysis</a></p>
          </details></article>`
      }).join('')}</div></section>`
  }).join('')
  return `<aside class="rule-evidence" aria-label="Implementation comparisons for ${escape(id)}"><details class="rule-implementations" open>
    <summary><span>Who does it this way?<span class="rule-evidence-count">${bindings.length} compared ${bindings.length === 1 ? 'finding' : 'findings'}</span></span><span aria-hidden="true">+</span></summary>
    <p class="rule-evidence-intro">Compare the inspected paths below. Matches, partial matches and different policies are identified separately. These source readings are pending validation, not conformance certification. Shared design ancestry is not independent confirmation.</p>
    ${groups}${stale ? '<p class="rule-evidence-stale">Some other implementation comparisons need review after a source or rule changed.</p>' : ''}
  </details></aside>`
}

export function codeEvidenceDestinations(index) {
  return new Set([...index.sources.values()].filter(source => source.kind === 'code' && source.current)
    .flatMap(source => source.functions.map(fn => fn.href)))
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
