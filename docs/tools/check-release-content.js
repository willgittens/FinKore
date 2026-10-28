// SPDX-License-Identifier: MPL-2.0
/**
 * Checks a proposed stable release tree for publication content and HTML link boundaries.
 *
 * This developer tool reads files without changing them or using the network.
 * It does not define or execute financial behavior or establish conformance.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { markdownAnchors } from './check-doc-links.js'
import { buildLearnCoreDoc } from './build-learn-coredoc.js'
import { LEARN_PAGES, renderLearnPage, buildLearnPages, GITHUB_PROJECT_URL, GITHUB_FILE_BASE_URL } from './build-learn-pages.js'
import { readLearnAssetVersion } from './build-learn-assets.js'

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

const navigationPages = new Set(['learn/index.html', 'learn/coredoc.html', ...LEARN_PAGES.map(page => page.output)])

function isAllowedExternalLink(path, tag, href) {
  const destinations = {
    'learn/index.html': ['https://www.linkedin.com/in/will-gittens/', 'https://savoiabarker.com/'],
    'learn/about.html': ['https://finkore.dev', 'https://savoiabarker.com/'],
    'learn/licensing.html': ['https://www.mozilla.org/en-US/MPL/2.0/FAQ/'],
  }
  const projectLink = navigationPages.has(path) && href === GITHUB_PROJECT_URL
  const fileLink = navigationPages.has(path) && href.startsWith(GITHUB_FILE_BASE_URL) &&
    /^[^?#]+(?:#[^?]*)?$/.test(href.slice(GITHUB_FILE_BASE_URL.length))
  if (!/^<a\b/i.test(tag) || !(projectLink || fileLink || destinations[path]?.includes(href))) return false
  const targets = htmlAttributes(tag, new Set(['target']))
  const relationships = htmlAttributes(tag, new Set(['rel']))
  const tokens = relationships.length === 1 ? relationships[0].split(/\s+/) : []
  return htmlAttributes(tag, new Set(['href'])).length === 1 &&
    htmlAttributes(tag, new Set(['src'])).length === 0 &&
    targets.length === 1 && targets[0] === '_blank' &&
    tokens.includes('noopener') && tokens.includes('noreferrer')
}

function checkHtml(root, path, text, errors) {
  // Only the declared mobile CoreDoc disclosure script is allowed.
  // Keep inline/other scripts and unrelated controls outside this profile.
  const markup = text.replace(/<!--[\s\S]*?-->/g, '')
  const scripts = [...markup.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)]
  const readerScript = '<script src="js/coredoc.js" defer></script>'
  const readerEnabled = path === 'learn/coredoc.html' && scripts.length === 1 &&
    scripts[0][0] === readerScript && htmlAttributes(markup, new Set(['id'])).includes('core-mobile-index')
  const unsupported = readerEnabled ? markup.replace(readerScript, '') : markup
  if (/<(?:script|form|input|button|select|textarea)\b/i.test(unsupported) || /\son\w+\s*=/i.test(markup)) {
    errors.push(`${path}: interactive HTML is outside the supported Learn profile`)
  }
  if (/\b(?:TODO|TBD)\b|suggested structure|this section should grow|Version\s+0\.1\.0/i.test(plain(text))) {
    errors.push(`${path}: unfinished or ambiguous HTML content`)
  }
  const ids = htmlAttributes(text, new Set(['id']))
  if (new Set(ids).size !== ids.length) errors.push(`${path}: duplicate HTML anchor`)
  let count = 0
  const links = [...markup.matchAll(/<[a-z][^>]*>/gi)].flatMap(([tag]) =>
    htmlAttributes(tag, new Set(['href', 'src'])).map(href => ({ tag, href })))
  for (const { tag, href } of links) {
    count += 1
    const allowedExternal = isAllowedExternalLink(path, tag, href)
    if (allowedExternal && !href.startsWith(GITHUB_FILE_BASE_URL)) continue
    // Validate GitHub file paths and fragments against the local release
    // tree, keeping this publication check deterministic and offline.
    const destination = allowedExternal ? `${relative(dirname(path), '.')}/${href.slice(GITHUB_FILE_BASE_URL.length)}` : href
    if (!destination || destination === '#' || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(destination)) {
      errors.push(`${path}: HTML link must name a local destination: ${href || '(empty)'}`)
      continue
    }
    let target, fragment
    try {
      const [rawPath, rawFragment] = destination.split('#')
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
    if (!allowedExternal && path.startsWith('learn/') && relative(join(root, 'learn'), target).startsWith('..')) {
      errors.push(`${path}: HTML link escapes the Learn site root: ${href}`)
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
  // The generated reader must match its canonical source before historical
  // governance dates can be excluded from current-status checks below.
  if (files.has('learn/coredoc.html')) {
    try { buildLearnCoreDoc(root, { check: true }) }
    catch (error) { errors.push('learn/coredoc.html: ' + error.message) }
  }
  // Historical HTML receives the source document's content policy only after
  // exact generation is verified. HTML links and controls are always checked.
  const synchronizedPages = new Map()
  if (LEARN_PAGES.some(page => files.has(page.output))) {
    try { buildLearnPages(root, { check: true }) }
    catch (error) { errors.push('learn: ' + error.message) }
    for (const page of LEARN_PAGES.filter(page => files.has(page.output))) {
      try {
        if (files.get(page.output) === renderLearnPage(page, files.get(page.source) ?? '', readLearnAssetVersion(root))) synchronizedPages.set(page.output, page.source)
      } catch (error) { errors.push(`${page.output}: ${error.message}`) }
    }
  }
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
    const sourcePath = synchronizedPages.get(path) ?? path
    const policyText = synchronizedPages.has(path) ? files.get(sourcePath) : text
    const paragraphs = policyText.split(/\n\s*\n/)
    if (sourcePath === 'docs/releases/README.md' && paragraphs.filter(retirementNote).length > 1) {
      errors.push(`${path}: retain only one concise retirement note`)
    }
    const freezeText = sourcePath === 'docs/releases/README.md' ? paragraphs.filter((p) => !retirementNote(p)).join('\n\n') : policyText
    if (FREEZE_REFERENCE.test(freezeText)) errors.push(`${path}: retired freeze definition or reference is forbidden`)
    if (/\.html?$/i.test(path)) htmlLinkCount += checkHtml(root, path, text, errors)
    if (!currentDocument(sourcePath)) continue
    const current = path.startsWith('docs/coreDoc/') ? text.split('\n').filter((line) =>
      !/^\*\*(?:Introduced|Last updated|Last updated on):\*\*/.test(line)).join('\n') :
      path === 'learn/coredoc.html' ? text.replace(/<p class="core-governance"><strong>(?:Introduced|Last updated|Last updated on):<\/strong>[^<]*<\/p>/g, '') : policyText
    const normalized = plain(decodeEntities(current))
    if (hasStaleCoreStatus(normalized)) errors.push(`${path}: stale or contradictory Core status in current content`)
    if ((REQUIRED.includes(path) || path.startsWith('spec/') || path === 'learn/index.html' || path === 'learn/coredoc.html') && !STABLE.test(normalized)) {
      errors.push(`${path}: missing explicit FinKore Core ${TARGET_CORE_VERSION} stable declaration`)
    }
    if (path === 'docs/coreDoc/core-doc.md') {
      const version = new RegExp(`^\\*\\*CoreDoc version:\\*\\* FinKore Core ${escapedTarget}\\b`, 'm')
      const status = new RegExp(`^\\*\\*Status:\\*\\* FinKore Core ${escapedTarget} (?:is )?stable\\b`, 'mi')
      if (!version.test(text) || !status.test(text)) errors.push(`${path}: CoreDoc version/status fields must declare the stable ${TARGET_CORE_VERSION} baseline`)
    }
  }
  if (errors.length) throw new Error(`Release content check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  return { fileCount: files.size, htmlLinkCount }
}

export function runReleaseContentCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateReleaseContent(repositoryRoot)
    output.log(`FinKore Core ${TARGET_CORE_VERSION} release content check passed: ${result.fileCount} text files, ${result.htmlLinkCount} HTML links. Financial behavior was not executed.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runReleaseContentCli(process.argv[2])
}
