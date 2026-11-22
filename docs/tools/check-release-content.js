// SPDX-License-Identifier: MPL-2.0
/**
 * Checks a proposed stable release tree for publication content and HTML link boundaries.
 *
 * This developer tool reads files without changing them or using the network.
 * It does not define or execute financial behavior or establish conformance.
 */
import { existsSync, readFileSync, readdirSync, statSync, realpathSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { markdownAnchors } from './check-doc-links.js'
import { buildLearnCoreDoc } from './build-learn-coredoc.js'
import { LEARN_PAGES, LEARN_EDITORIAL_PAGES, renderLearnPage, buildLearnPages, GITHUB_PROJECT_URL, GITHUB_FILE_BASE_URL } from './build-learn-pages.js'
import { codeEvidenceDestinations, loadLearnEvidence } from './learn-evidence.js'
import { readLearnAssetVersion } from './build-learn-assets.js'

const LOCAL_STATE = new Set(['.git', '.tools', 'node_modules', '.npm-cache', 'coverage', 'dist', 'reports'])
const NEGATIVE_FIXTURE = 'docs/tools/test/fixtures/release-content-negative.json'
const REQUIRED = ['README.md', 'docs/coreDoc/core-doc.md', 'spec/README.md', 'conformance/README.md', 'agentic/README.md']
const DOMAINS = ['money', 'workflow', 'audit', 'approvals', 'entities']
export const TARGET_CORE_VERSION = '2.0.4'
const TARGET_CORE_BASELINE = TARGET_CORE_VERSION.split('.').slice(0, 2).join('.')
const PLAN_REFERENCE = /docs[/\\]plans\b|\bplan-\d+(?:\.\d+)*\b/i
const SUPPLEMENT_REFERENCE = /boundary097-cases\.json|readSupplementary[C]ases|SUPPLEMENTARY[_]CASES|manifest\/supplementary/i
const FREEZE_REFERENCE = /SPEC-FREEZE-\d+|release[\s-]+candidate\s+freeze/i
const escapedTarget = TARGET_CORE_VERSION.replaceAll('.', '\\.')

// Attribution can contain an upstream planning path without retaining a local
// working plan. Mask only inventoried paths in their own pinned metadata/reading
// context for the planning-reference check; all other content checks still use
// the original bytes. This is not validation of upstream financial behavior.
function upstreamPlanningContexts(files) {
  const contexts = new Map()
  try {
    const catalog = JSON.parse(files.get('experts/code-evidence/repositories.json') ?? 'null')
    const library = JSON.parse(files.get('experts/code-evidence/rule-library.json') ?? 'null')
    for (const repo of catalog?.repositories ?? []) for (const edition of repo.editions ?? []) {
      if (!/^CE-REPO-\d{4}$/.test(repo.id) || !/^CE-EDITION-\d{4}$/.test(edition.id) ||
          !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo.full_name) ||
          repo.full_name.split('/').some(part => part === '.' || part === '..') ||
          `https://github.com/${repo.full_name}`.toLowerCase() === GITHUB_PROJECT_URL.toLowerCase() ||
          !/^[a-f0-9]{40}$/.test(edition.commit_sha)) continue
      const inventoryPath = `experts/code-evidence/inventories/${repo.id}/${edition.id}.json`
      let inventory
      try { inventory = JSON.parse(files.get(inventoryPath) ?? 'null') } catch { continue }
      if (!inventory || !['1.0.0', '1.1.0', '1.2.0', '1.3.0'].includes(inventory.schema_version) ||
          inventory.repository_id !== repo.id || inventory.edition_id !== edition.id || inventory.commit_sha !== edition.commit_sha ||
          inventory.source_url !== `https://codeload.github.com/${repo.full_name}/tar.gz/${edition.commit_sha}`) continue
      if (inventory.repository_tree && (inventory.repository_tree.commit_sha !== edition.commit_sha ||
          inventory.repository_tree.source_url !== `https://github.com/${repo.full_name}/tree/${edition.commit_sha}` ||
          !/^[a-f0-9]{40}$/.test(inventory.repository_tree.tree_sha))) continue
      const paths = new Set([...(inventory.source_files ?? []), ...(inventory.other_files ?? []), ...(inventory.repository_tree?.files ?? [])]
        .map(row => row[0]).filter(path => typeof path === 'string' && /^[A-Za-z0-9_./-]+$/.test(path) &&
          !path.split('/').some(part => ['', '.', '..'].includes(part)) && PLAN_REFERENCE.test(path)))
      if (!paths.size) continue
      const source = library?.sources?.find(s => s.repository_id === repo.id && s.edition_id === edition.id &&
        s.inventory === inventoryPath.slice('experts/code-evidence/'.length))
      contexts.set(`${repo.id}/${edition.id}`, { paths, inventoryPath, commit: edition.commit_sha,
        url: `https://github.com/${repo.full_name}/blob/${edition.commit_sha}/`, records: new Set(source?.analysis_records ?? []) })
    }
  } catch { /* Malformed/unavailable optional metadata cannot establish an exception. */ }
  return contexts
}

function planningReferenceText(path, text, contexts) {
  const match = /^experts\/code-evidence\/(inventories|evaluations|analyses)\/(CE-REPO-\d{4})\/(CE-EDITION-\d{4})(\.json|\.md|\/[A-Za-z0-9_-]+\.md)$/.exec(path)
  if (!match) return text
  const context = contexts.get(`${match[2]}/${match[3]}`)
  if (!context) return text
  const marker = '[attributed upstream path]'
  const pinned = (url, target) => typeof url === 'string' && url.startsWith(context.url + target + '#') &&
    /^#L([1-9]\d*)-L([1-9]\d*)$/.test(url.slice((context.url + target).length)) &&
    Number(url.split('#L')[1].split('-L')[0]) <= Number(url.split('-L').at(-1))
  if (match[1] !== 'analyses') {
    let data
    try { data = JSON.parse(text) } catch { return text }
    if (data.repository_id !== match[2] || data.edition_id !== match[3] || data.commit_sha !== context.commit) return text
    if (match[1] === 'inventories') {
      if (path !== context.inventoryPath) return text
      for (const rows of [data.source_files, data.other_files, data.repository_tree?.files]) {
        for (const row of rows ?? []) if (context.paths.has(row[0])) row[0] = marker
      }
    } else {
      for (const group of data.file_groups ?? []) if (Array.isArray(group.paths)) group.paths = group.paths.map(p => context.paths.has(p) ? marker : p)
      for (const observation of data.file_observations ?? []) if (context.paths.has(observation.path)) observation.path = marker
      for (const item of [...(data.constructs ?? []), ...(data.tests ?? [])]) {
        const target = item.location?.path
        if (!context.paths.has(target) || !pinned(item.location.source_url, target)) continue
        item.location.path = marker; item.location.source_url = marker
        if (typeof item.name === 'string') item.name = item.name.split(target).join(marker)
      }
    }
    return JSON.stringify(data)
  }
  const local = path.slice('experts/code-evidence/'.length)
  if (!context.records.has(local)) return text
  const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let result = text
  const cited = []
  for (const target of context.paths) {
    const url = new RegExp('(^|[\\s(])' + escaped(context.url + target) + '#L([1-9]\\d*)-L([1-9]\\d*)(?=[)\\s]|$)', 'gm')
    result = result.replace(url, (ref, boundary, start, end) => {
      if (Number(start) > Number(end)) return ref
      cited.push(target)
      return boundary + marker
    })
  }
  for (const target of new Set(cited)) {
    // Relative Markdown/HTML links remain local references and are never masked.
    const bare = new RegExp('(^|[\\s`])' + escaped(target) + '(?=$|[\\s`:,]|\\.(?=\\s|$))', 'gm')
    result = result.replace(bare, (_, boundary) => boundary + marker)
  }
  const directory = ['docs', 'plans'].join('/') + '/'
  if (cited.some(target => target.startsWith(directory))) {
    result = result.replace(new RegExp('(^|[\\s`])' + escaped(directory) + '(?=$|[\\s`,]|\\.(?=\\s|$))', 'gm'), (_, boundary) => boundary + marker)
  }
  return result
}
const STABLE = new RegExp(`\\bFinKore Core ${escapedTarget} (?:is )?stable\\b`, 'i')
const STALE_STATUS = /release[\s-]+candidate|\brelease preparation\b|\b\d+\.\d+-rc\b|\bpre[\s-]?1\.0\b|\bDraft \d+\.\d+|\bremains experimental\b|\bpromotion (?:is )?(?:not complete|outstanding)\b|\bnot (?:yet )?stable\b|\bstatus:\s*(?:draft|experimental)\b|\bintended to become\b/i

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

const navigationPages = new Set([...LEARN_EDITORIAL_PAGES, 'learn/coredoc.html', ...LEARN_PAGES.map(page => page.output)])

function isAllowedExternalLink(path, tag, href, codeLinks) {
  const destinations = {
    'learn/index.html': ['https://www.linkedin.com/in/will-gittens/', 'https://savoiabarker.com/'],
    'learn/about.html': ['https://finkore.dev', 'https://savoiabarker.com/'],
    'learn/licensing.html': ['https://www.mozilla.org/en-US/MPL/2.0/FAQ/'],
    'learn/network.html': [`${GITHUB_PROJECT_URL}/discussions`],
    'learn/reviews.html': [`${GITHUB_PROJECT_URL}/discussions`],
    // Exact study destinations from the curated Research collection. New sources
    // require an editorial review here; this is not an arbitrary external-link rule.
    'learn/research.html': [
      'https://acta.uni-obuda.hu/Szivos_Orosz_54.pdf',
      'https://al-kindipublishers.org/index.php/jcsts/article/download/10816/9602',
      'https://arxiv.org/pdf/1908.05940v2',
      'https://arxiv.org/pdf/2306.15975v2',
      'https://arxiv.org/abs/2306.15975',
      'https://arxiv.org/pdf/2604.25555',
      'https://drops.dagstuhl.de/storage/00lipics/lipics-vol333-ecoop2025/LIPIcs.ECOOP.2025.4/LIPIcs.ECOOP.2025.4.pdf',
      'https://ecsenet.com/index.php/2576-6821/article/download/631/242',
      'https://iacis.org/iis/2011/36-43_AL2011_1571.pdf',
      'https://ijefm.co.in/v7i1/Doc/50.pdf',
      'https://jurnal.ywnr.org/index.php/cfabr/article/download/230/292',
      'https://msabp.magnascientiapub.com/sites/default/files/fulltext_pdf/MSABP-2026-0060.pdf',
      'https://ppublishing.org/media/uploads/journals/article/EJT-4-26_p82-90.pdf',
      'https://pubsonline.informs.org/doi/10.1287/isre.1110.0371',
      'https://www.ijrai.org/index.php/ijrai/article/view/796',
      'https://www.ijsr.net/archive/v9i1/SR24926100330.pdf',
      'https://www.managementpaper.net/archives/2025/vol7issue1/PartN/7-2-178-924.pdf',
      'https://www.mdpi.com/1911-8074/17/10/445',
      'https://www.mdpi.com/2078-2489/15/12/778',
      'https://www.mdpi.com/2079-8954/14/8/990',
      'https://www.svedbergopen.com/index.php/ijaiml/article/view/529',
      'https://www.techscience.com/cmc/v89n1/68376/html',
      'https://www.usenix.org/events/osdi10/tech/full_papers/Ports.pdf',
    ],
    'learn/legacy.html': [`${GITHUB_PROJECT_URL}/discussions/42`, 'https://finkore.dev/'],
    'learn/legacy-001-elaine-richardson.html': ['https://www.linkedin.com/in/elainecrichardson/'],
    'learn/legacy-002-otilia-borges.html': ['https://www.linkedin.com/in/otilia-borges-33a19a1b/'],
  }
  const projectLink = navigationPages.has(path) && href === GITHUB_PROJECT_URL
  const fileLink = navigationPages.has(path) && href.startsWith(GITHUB_FILE_BASE_URL) &&
    /^[^?#]+(?:#[^?]*)?$/.test(href.slice(GITHUB_FILE_BASE_URL.length))
  const discussionLink = ['learn/network.html', 'learn/reviews.html'].includes(path) && href.startsWith(`${GITHUB_PROJECT_URL}/discussions/`) &&
    /^[1-9]\d*$/.test(href.slice(`${GITHUB_PROJECT_URL}/discussions/`.length))
  const codeLink = path === 'learn/coredoc.html' && codeLinks?.has(href)
  if (!/^<a\b/i.test(tag) || !(projectLink || fileLink || discussionLink || codeLink || destinations[path]?.includes(href))) return false
  const targets = htmlAttributes(tag, new Set(['target']))
  const relationships = htmlAttributes(tag, new Set(['rel']))
  const tokens = relationships.length === 1 ? relationships[0].split(/\s+/) : []
  return htmlAttributes(tag, new Set(['href'])).length === 1 &&
    htmlAttributes(tag, new Set(['src'])).length === 0 &&
    targets.length === 1 && targets[0] === '_blank' &&
    tokens.includes('noopener') && tokens.includes('noreferrer')
}

function checkHtml(root, path, text, errors, { verifiedResearch = false, codeLinks } = {}) {
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
  // A cited study's version is bibliographic data, not the site's release status.
  // This narrow exclusion applies only to the version field of the exactly
  // synchronized Research reader; placeholders elsewhere still fail.
  const versionText = verifiedResearch ? text.replace(/<li><strong>Version:<\/strong>[\s\S]*?<\/li>/g, '') : text
  if (/\b(?:TODO|TBD)\b|suggested structure|this section should grow/i.test(plain(text)) || /Version\s+0\.1\.0/i.test(plain(versionText))) {
    errors.push(`${path}: unfinished or ambiguous HTML content`)
  }
  const ids = htmlAttributes(text, new Set(['id']))
  if (new Set(ids).size !== ids.length) errors.push(`${path}: duplicate HTML anchor`)
  let count = 0
  const links = [...markup.matchAll(/<[a-z][^>]*>/gi)].flatMap(([tag]) =>
    htmlAttributes(tag, new Set(['href', 'src'])).map(href => ({ tag, href })))
  for (const { tag, href } of links) {
    count += 1
    const allowedExternal = isAllowedExternalLink(path, tag, href, codeLinks)
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
  const snapshots = new Map()
  // Optional research memory is not required by the financial contract. When
  // present, inspect its registered snapshots instead of exempting opaque data.
  const statePath = join(root, 'experts/research/catalog/state.json')
  if (existsSync(statePath)) {
    try {
      if (realpathSync(statePath) !== join(realpathSync(root), 'experts/research/catalog/state.json')) throw new Error('snapshot registry must not traverse a symlink')
      const state = JSON.parse(readFileSync(statePath, 'utf8'))
      if (!['1.0.0', '1.1.0'].includes(state.schema_version)) throw new Error('unsupported catalog format')
      const collect = value => {
        if (!value || typeof value !== 'object') return
        if (Object.hasOwn(value, 'snapshot')) {
          if (value.snapshot !== `catalog/snapshots/${value.sha256}.gz` || !/^[a-f0-9]{64}$/.test(value.sha256) ||
              !Number.isSafeInteger(value.size_bytes) || value.size_bytes < 1 || value.size_bytes > 64 * 1024 * 1024 ||
              typeof value.path !== 'string' || !/\.(?:md|json)$/.test(value.path)) throw new Error('invalid snapshot reference')
          const path = 'experts/research/' + value.snapshot
          if (snapshots.has(path) && snapshots.get(path).size_bytes !== value.size_bytes) throw new Error('conflicting snapshot references')
          snapshots.set(path, value)
        }
        for (const child of Object.values(value)) collect(child)
      }
      collect(state)
    } catch (error) { errors.push(`experts/research/catalog/state.json: cannot inspect snapshot registry: ${error.message}`) }
  }
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
      const snapshot = snapshots.get(path)
      if (/\.(?:zip|tar|tgz|gz|bz2|xz|7z)$/i.test(path) && !snapshot) errors.push(`${path}: opaque archives cannot be reviewed for copied planning content`)
      if (/boundary097-cases\.json$/i.test(path)) errors.push(`${path}: historical case supplement is forbidden`)
      let buffer = readFileSync(absolute)
      if (snapshot) {
        try {
          buffer = gunzipSync(buffer, { maxOutputLength: 64 * 1024 * 1024 })
          if (buffer.length !== snapshot.size_bytes || createHash('sha256').update(buffer).digest('hex') !== snapshot.sha256 || buffer.includes(0)) throw new Error('snapshot digest, size or text mismatch')
          new TextDecoder('utf-8', { fatal: true }).decode(buffer)
        } catch (error) { errors.push(`${path}: cannot inspect registered snapshot: ${error.message}`); continue }
      }
      if (buffer.includes(0)) continue
      files.set(path, buffer.toString('utf8'))
    }
  }
  if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`Release content check failed: missing release tree: ${root}`)
  walk(root)
  const upstreamContexts = upstreamPlanningContexts(files)
  const evidence = loadLearnEvidence(root)
  const codeLinks = codeEvidenceDestinations(evidence)
  for (const path of snapshots.keys()) if (!files.has(path)) errors.push(`${path}: registered snapshot is missing or unreadable`)
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
        if (files.get(page.output) === renderLearnPage(page, files.get(page.source) ?? '', readLearnAssetVersion(root), { evidence })) synchronizedPages.set(page.output, page.source)
      } catch (error) { errors.push(`${page.output}: ${error.message}`) }
    }
  }
  for (const path of [...REQUIRED, ...DOMAINS.map((domain) => `spec/${domain}/README.md`)]) {
    if (!files.has(path)) errors.push(`${path}: required publication document is missing`)
  }
  for (const [path, text] of files) {
    // Only explicit adversarial fixture data is exempt; test/tool source is scanned.
    if (path === NEGATIVE_FIXTURE) continue
    if (PLAN_REFERENCE.test(planningReferenceText(path, text, upstreamContexts))) errors.push(`${path}: active planning reference is forbidden`)
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
    if (/\.html?$/i.test(path)) htmlLinkCount += checkHtml(root, path, text, errors, { codeLinks, verifiedResearch: path === 'learn/research.html' && synchronizedPages.get(path) === 'learn/research.md' })
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
