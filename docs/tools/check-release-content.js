// SPDX-License-Identifier: MPL-2.0
/**
 * Checks a proposed stable release tree for publication content and local HTML links.
 *
 * This developer tool reads files without changing them or using the network.
 * It does not define or execute financial behavior or establish conformance.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { markdownAnchors } from './check-doc-links.js'

const LOCAL_STATE = new Set(['.git', '.tools', 'node_modules', '.npm-cache', 'coverage', 'dist', 'reports'])
const NEGATIVE_FIXTURE = 'docs/tools/test/fixtures/release-content-negative.json'
const REQUIRED = ['README.md', 'docs/coreDoc/core-doc.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md']
const DOMAINS = ['money', 'workflow', 'audit', 'approvals', 'entities']
export const TARGET_CORE_VERSION = '2.0.2'
const TARGET_CORE_BASELINE = TARGET_CORE_VERSION.split('.').slice(0, 2).join('.')
const PLAN_REFERENCE = /docs[/\\]plans\b|\bplan-\d+(?:\.\d+)*\b/i
const SUPPLEMENT_REFERENCE = /boundary097-cases\.json|readSupplementary[C]ases|SUPPLEMENTARY[_]CASES|manifest\/supplementary/i
const FREEZE_REFERENCE = /SPEC-FREEZE-\d+|release[\s-]+candidate\s+freeze/i
const escapedTarget = TARGET_CORE_VERSION.replaceAll('.', '\\.')
const STABLE = new RegExp(`\\bFinKore Core ${escapedTarget} (?:is )?stable\\b`, 'i')
const STALE_STATUS = /release[\s-]+candidate|\b\d+\.\d+-rc\b|\bpre[\s-]?1\.0\b|\bDraft \d+\.\d+|\bremains experimental\b|\bpromotion (?:is )?(?:not complete|outstanding)\b|\bnot (?:yet )?stable\b|\bstatus:\s*(?:draft|experimental)\b|\bintended to become\b/i

function hasStaleCoreStatus(text) {
  if (STALE_STATUS.test(text)) return true
  if ([...text.matchAll(/\bFinKore Core (\d+\.\d+(?:\.\d+)?) (?:is )?stable\b/gi)]
    .some((match) => match[1] !== TARGET_CORE_VERSION)) return true
  return [...text.matchAll(/\bCore (\d+\.\d+(?:\.\d+)?)\b/gi)]
    .some((match) => match[1] !== TARGET_CORE_VERSION && match[1] !== TARGET_CORE_BASELINE)
}

function plain(text) {
  return text.replace(/<[^>]*>/g, ' ').replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim()
}

function currentDocument(path) {
  return path === 'README.md' || path === 'docs/implementation-guide.md' ||
    /^(?:spec|agentic|conformance|docs\/coreDoc)\/.*\.md$/i.test(path) || /\.html?$/i.test(path)
}

function retirementNote(paragraph) {
  const ids = [...paragraph.matchAll(/SPEC-FREEZE-\d+/g)].map((match) => match[0])
  return /^Retired\s/.test(paragraph) && paragraph.length < 800 && ids.length === 4 &&
    new Set(ids).size === 4 && ids.every((id) => /-00[1-4]$/.test(id)) &&
    /applicability has ended/.test(paragraph) && /Git history/.test(paragraph) &&
    /unavailable for reuse/.test(paragraph) && !/\b(?:MUST|SHOULD|MAY)\b/.test(paragraph)
}

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, key) => {
    if (!key.startsWith('#')) return named[key.toLowerCase()]
    const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1))
    return code <= 0x10ffff ? String.fromCodePoint(code) : '\ufffd'
  })
}

function htmlAttributes(text, names) {
  const attributes = []
  for (const tag of text.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<[a-z][^>]*>/gi)) {
    for (const match of tag[0].matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      if (names.has(match[1].toLowerCase())) attributes.push(decodeEntities(match[2] ?? match[3] ?? match[4]))
    }
  }
  return attributes
}

function checkHtml(root, path, text, errors) {
  // The retained Learn surface is a static local index, not an application.
  if (/<(?:script|form|input|button|select|textarea)\b|\son\w+\s*=/i.test(text)) {
    errors.push(`${path}: interactive HTML is outside the supported static-index profile`)
  }
  if (/\b(?:TODO|TBD)\b|suggested structure|this section should grow|Version\s+0\.1\.0/i.test(plain(text))) {
    errors.push(`${path}: unfinished or ambiguous HTML content`)
  }
  const ids = htmlAttributes(text, new Set(['id']))
  if (new Set(ids).size !== ids.length) errors.push(`${path}: duplicate HTML anchor`)
  let count = 0
  for (const href of htmlAttributes(text, new Set(['href', 'src']))) {
    count += 1
    if (!href || href === '#' || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(href)) {
      errors.push(`${path}: HTML link must name a local destination: ${href || '(empty)'}`)
      continue
    }
    let target, fragment
    try {
      const [rawPath, rawFragment] = href.split('#')
      target = rawPath ? resolve(dirname(join(root, path)), decodeURIComponent(rawPath.split('?')[0])) : join(root, path)
      fragment = rawFragment === undefined ? undefined : decodeURIComponent(rawFragment)
    } catch {
      errors.push(`${path}: malformed HTML link: ${href}`)
      continue
    }
    const local = relative(root, target)
    if (local.startsWith('..') || !existsSync(target) || !statSync(target).isFile()) {
      errors.push(`${path}: broken or escaping HTML link: ${href}`)
      continue
    }
    if (fragment) {
      const anchors = extname(target) === '.md' ? markdownAnchors(target) :
        new Set(htmlAttributes(readFileSync(target, 'utf8'), new Set(['id', 'name'])))
      if (!anchors.has(fragment)) errors.push(`${path}: missing HTML link fragment: ${href}`)
    }
  }
  return count
}

export function validateReleaseContent(repositoryRoot = process.cwd()) {
  const root = resolve(repositoryRoot)
  const errors = []
  const files = new Map()
  let htmlLinkCount = 0
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (directory === root && LOCAL_STATE.has(entry.name)) continue
      const absolute = join(directory, entry.name)
      const path = relative(root, absolute).replaceAll('\\', '/')
      if (entry.isSymbolicLink()) {
        errors.push(`${path}: symlinks are not supported in the proposed publication tree`)
        continue
      }
      if (/(?:^|\/)(?:plans?|planning[-_]archive|archived[-_]plans)(?:\/|$)|(?:^|\/)plan-\d/i.test(path)) {
        errors.push(`${path}: planning artifact is forbidden in a release tree`)
      }
      if (entry.isDirectory()) { walk(absolute); continue }
      if (!entry.isFile()) continue
      if (/\.(?:zip|tar|tgz|gz|bz2|xz|7z)$/i.test(path)) errors.push(`${path}: opaque archives cannot be reviewed for copied planning content`)
      if (/boundary097-cases\.json$/i.test(path)) errors.push(`${path}: historical case supplement is forbidden`)
      const buffer = readFileSync(absolute)
      if (buffer.includes(0)) continue
      files.set(path, buffer.toString('utf8'))
    }
  }
  if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`Release content check failed: missing release tree: ${root}`)
  walk(root)
  for (const path of [...REQUIRED, ...DOMAINS.map((domain) => `spec/${domain}/README.md`)]) {
    if (!files.has(path)) errors.push(`${path}: required publication document is missing`)
  }
  for (const [path, text] of files) {
    // Only explicit adversarial fixture data is exempt; test/tool source is scanned.
    if (path === NEGATIVE_FIXTURE) continue
    if (PLAN_REFERENCE.test(text)) errors.push(`${path}: active planning reference is forbidden`)
    if (/^#{1,6}\s+.*FinKore.*\b(?:Plan|Roadmap)\b|^##\s+Milestone\s+\d/im.test(text)) {
      errors.push(`${path}: copied planning content is forbidden`)
    }
    if (SUPPLEMENT_REFERENCE.test(text)) errors.push(`${path}: historical supplement reference or dependency is forbidden`)
    const paragraphs = text.split(/\n\s*\n/)
    if (path === 'docs/releases/README.md' && paragraphs.filter(retirementNote).length > 1) {
      errors.push(`${path}: retain only one concise retirement note`)
    }
    const freezeText = path === 'docs/releases/README.md' ? paragraphs.filter((p) => !retirementNote(p)).join('\n\n') : text
    if (FREEZE_REFERENCE.test(freezeText)) errors.push(`${path}: retired freeze definition or reference is forbidden`)
    if (!currentDocument(path)) continue
    const current = path.startsWith('docs/coreDoc/') ? text.split('\n').filter((line) =>
      !/^\*\*(?:Introduced|Last updated|Last updated on):\*\*/.test(line)).join('\n') : text
    const normalized = plain(decodeEntities(current))
    if (hasStaleCoreStatus(normalized)) errors.push(`${path}: stale or contradictory Core status in current content`)
    if ((REQUIRED.includes(path) || path.startsWith('spec/') || path === 'learn/index.html') && !STABLE.test(normalized)) {
      errors.push(`${path}: missing explicit FinKore Core ${TARGET_CORE_VERSION} stable declaration`)
    }
    if (path === 'docs/coreDoc/core-doc.md') {
      const version = new RegExp(`^\\*\\*CoreDoc version:\\*\\* FinKore Core ${escapedTarget}\\b`, 'm')
      const status = new RegExp(`^\\*\\*Status:\\*\\* FinKore Core ${escapedTarget} (?:is )?stable\\b`, 'mi')
      if (!version.test(text) || !status.test(text)) errors.push(`${path}: CoreDoc version/status fields must declare the stable ${TARGET_CORE_VERSION} baseline`)
    }
    if (/\.html?$/i.test(path)) htmlLinkCount += checkHtml(root, path, text, errors)
  }
  if (errors.length) throw new Error(`Release content check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  return { fileCount: files.size, htmlLinkCount }
}

export function runReleaseContentCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateReleaseContent(repositoryRoot)
    output.log(`FinKore Core ${TARGET_CORE_VERSION} release content check passed: ${result.fileCount} text files, ${result.htmlLinkCount} local HTML links. Financial behavior was not executed.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runReleaseContentCli(process.argv[2])
}
