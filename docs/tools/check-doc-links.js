// SPDX-License-Identifier: MPL-2.0
/**
 * Validates repository-contained Markdown sources, local link destinations,
 * fragments, CoreDoc references, and specification IDs in selected current docs.
 *
 * This developer tool reads repository documentation without changing it and
 * contains no financial-domain behavior.
 */
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

let root = process.cwd()
let realRoot
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'reports', '.tools'])
const currentGuides = new Set(['README.md', 'CONTRIBUTING.md', 'docs/implementation-guide.md', 'docs/where-to-start.md'])

function proseLines(text) {
  let fence
  let comment = false
  return text.split('\n').map((line) => {
    if (fence !== undefined) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/)?.[1]
      if (closing?.[0] === fence[0] && closing.length >= fence.length) fence = undefined
      return ''
    }
    let visible = ''
    let position = 0
    while (position < line.length) {
      const marker = comment ? '-->' : '<!--'
      const next = line.indexOf(marker, position)
      const end = next === -1 ? line.length : next + marker.length
      if (comment) visible += ' '.repeat(end - position)
      else {
        visible += line.slice(position, next === -1 ? end : next)
        if (next !== -1) visible += ' '.repeat(marker.length)
      }
      position = end
      if (next !== -1) comment = !comment
    }
    const opening = visible.match(/^ {0,3}(`{3,}|~{3,})/)
    if (opening !== null) {
      fence = opening[1]
      return ''
    }
    return /^(?: {4}|\t)/.test(visible) ? '' : visible
  })
}

function referenceBlocks(text) {
  const blocks = []
  let block
  for (const [index, line] of proseLines(text).entries()) {
    const boundary = /^\s*(?:#{1,6}\s|[-+*]\s|\d+\.\s|\|)/.test(line)
    if (line.trim() === '' || boundary) block = undefined
    if (line.trim() === '') continue
    if (block === undefined) {
      block = { line: index + 1, text: '' }
      blocks.push(block)
    }
    block.text += (block.text === '' ? '' : '\n') + line
    if (/^\s*(?:#{1,6}\s|\|)/.test(line)) block = undefined
  }
  return blocks
}

function within(base, path) {
  const relation = relative(base, path)
  return relation !== '..' && !relation.startsWith(`..${sep}`) && !isAbsolute(relation)
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return []
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    if (extname(entry.name) !== '.md') return []
    let realTarget
    try {
      realTarget = realpathSync(path)
    } catch (error) {
      throw new Error(`Cannot resolve Markdown source: ${path}`, { cause: error })
    }
    if (!within(realRoot, realTarget)) throw new Error(`Markdown source outside repository after resolving symlinks: ${path}`)
    if (!statSync(realTarget).isFile()) throw new Error(`Markdown source is not a regular file: ${path}`)
    return [path]
  })
}

function markdownFilesUnder(directory) {
  return walk(resolve(root, directory)).sort()
}

function collectSpecIds() {
  const ids = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = proseLines(readFileSync(file, 'utf8')).join('\n')
    for (const match of text.matchAll(/^\s*-\s+\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]\s*(.+)$/gm)) {
      if (/\b(?:MUST|SHOULD|MAY)\b/.test(match[2])) ids.add(match[1])
    }
  }
  return ids
}

function checkCoreDocRequirementReferences(specIds) {
  const prefixes = new Set([...specIds].map((id) => id.replace(/-\d{3}$/, '')))
  const missing = new Set()
  const unknownPrefixes = new Set()
  let referenced = 0

  for (const file of markdownFilesUnder('docs/coreDoc')) {
    for (const [lineIndex, line] of readFileSync(file, 'utf8').split('\n').entries()) {
      let prefix
      const tokens = /([A-Z][A-Z0-9-]+)-(\d{3})(?:\s+(?:to|through)\s+-?(\d{3}))?|-(\d{3})/g
      for (const match of line.matchAll(tokens)) {
        if (match[1] !== undefined) prefix = match[1]
        if (prefix === undefined || prefix === 'CORE') continue
        if (!prefixes.has(prefix)) {
          unknownPrefixes.add(`${file}:${lineIndex + 1}: ${prefix}`)
          continue
        }
        const start = Number(match[2] ?? match[4])
        const end = match[3] === undefined ? start : Number(match[3])
        if (end < start) {
          missing.add(`${file}:${lineIndex + 1}: invalid descending range ${prefix}-${String(start).padStart(3, '0')} through -${String(end).padStart(3, '0')}`)
          continue
        }
        for (let value = start; value <= end; value += 1) {
          const id = `${prefix}-${String(value).padStart(3, '0')}`
          referenced += 1
          if (!specIds.has(id)) missing.add(`${file}:${lineIndex + 1}: ${id}`)
        }
      }
    }
  }

  if (unknownPrefixes.size > 0) {
    throw new Error(`Unknown CoreDoc requirement prefixes:\n${[...unknownPrefixes].sort().join('\n')}`)
  }
  if (missing.size > 0) {
    throw new Error(`Missing CoreDoc requirement references:\n${[...missing].sort().join('\n')}`)
  }
  return referenced
}

function checkCurrentRequirementReferences(specIds) {
  const failures = new Set()
  let referenced = 0
  let documents = 0
  for (const file of markdownFilesUnder('.')) {
    const path = relative(root, file).split(sep).join('/')
    if (!currentGuides.has(path) && !['spec', 'conformance', 'agentic'].includes(path.split('/')[0])) continue
    documents += 1
    for (const block of referenceBlocks(readFileSync(file, 'utf8'))) {
      // Link destinations and formatting are not requirement-reference text.
      const text = block.text.replace(/\]\([^)]*\)/g, (value) => value.replace(/[^\n]/g, ' ')).replace(/[`*]/g, ' ')
      let previous
      // Domain/topic IDs exclude foundation CORE IDs and labels such as SHA-256.
      const tokens = /(?<![\w-])(?:([A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)+)-(\d{3})|-(\d{3})|(\d{3}))(?![\w-])/g
      for (const match of text.matchAll(tokens)) {
        const gap = previous === undefined ? '' : text.slice(previous.end, match.index).trim()
        const range = previous !== undefined && /^(?:to|through|[–—-])$/.test(gap)
        const list = previous !== undefined && /^(?:,\s*(?:(?:and|or)\s*)?|and|or|\/)$/.test(gap)
        if (match[1] === undefined && !(range || (list && (match[3] !== undefined || gap === '/')))) continue
        const prefix = match[1] ?? previous.prefix
        const end = Number(match[2] ?? match[3] ?? match[4])
        const location = `${path}:${block.line + text.slice(0, match.index).split('\n').length - 1}`
        const id = `${prefix}-${String(end).padStart(3, '0')}`
        if (range && (prefix !== previous.prefix || end < previous.value)) {
          failures.add(`${location}: invalid requirement range ${previous.prefix}-${String(previous.value).padStart(3, '0')} through ${id}`)
        } else {
          const start = range ? previous.value + 1 : end
          for (let value = start; value <= end; value += 1) {
            const requirement = `${prefix}-${String(value).padStart(3, '0')}`
            referenced += 1
            if (!specIds.has(requirement)) failures.add(`${location}: ${requirement}`)
          }
        }
        previous = { prefix, value: end, end: match.index + match[0].length }
      }
    }
  }
  if (failures.size > 0) throw new Error(`Invalid current-document specification requirement references:\n${[...failures].sort().join('\n')}`)
  return { currentDocumentReferenceCount: referenced, currentDocumentCount: documents }
}

function markdownLinks(text) {
  return [...text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim())
}

function localLinkTarget(file, target) {
  const withoutTitle = target.split(/\s+["'][^"']*["']\s*$/)[0] ?? target
  const fragmentIndex = withoutTitle.indexOf('#')
  const rawPath = fragmentIndex === -1 ? withoutTitle : withoutTitle.slice(0, fragmentIndex)
  const rawFragment = fragmentIndex === -1 ? undefined : withoutTitle.slice(fragmentIndex + 1)
  if (/^[a-z][a-z0-9+.-]*:/i.test(rawPath)) return undefined
  let decodedPath
  let fragment
  try {
    decodedPath = decodeURIComponent(rawPath.replace(/^<|>$/g, ''))
    fragment = rawFragment === undefined ? undefined : decodeURIComponent(rawFragment)
  } catch {
    return { path: '', fragment: rawFragment }
  }
  return {
    path: decodedPath.length === 0 ? file : normalize(resolve(dirname(file), decodedPath)),
    fragment,
  }
}

function githubSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
}

export function markdownAnchors(path) {
  const text = readFileSync(path, 'utf8')
  const anchors = new Set()
  const counts = new Map()
  for (const line of text.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)?.[1]
    if (heading !== undefined) {
      const base = githubSlug(heading)
      const count = counts.get(base) ?? 0
      counts.set(base, count + 1)
      anchors.add(count === 0 ? base : `${base}-${count}`)
    }
    for (const match of line.matchAll(/<(?:a|span)\s+[^>]*(?:id|name)=["']([^"']+)["'][^>]*>/gi)) anchors.add(match[1])
  }
  return anchors
}

function checkMarkdownLinks() {
  const failures = []
  const anchorCache = new Map()
  for (const file of markdownFilesUnder('.')) {
    const text = readFileSync(file, 'utf8')
    for (const target of markdownLinks(text)) {
      const local = localLinkTarget(file, target)
      if (local === undefined) continue
      const { path, fragment } = local
      if (!within(root, path)) {
        failures.push(`${file}: ${target} (outside repository)`)
        continue
      }
      try {
        const realTarget = realpathSync(path)
        if (!within(realRoot, realTarget)) {
          failures.push(`${file}: ${target} (outside repository after resolving symlinks)`)
          continue
        }
        const stats = statSync(realTarget)
        if (!stats.isFile() && !stats.isDirectory()) failures.push(`${file}: ${target}`)
        else if (fragment !== undefined && fragment.length > 0 && stats.isFile() && extname(path) === '.md') {
          const anchors = anchorCache.get(realTarget) ?? markdownAnchors(realTarget)
          anchorCache.set(realTarget, anchors)
          if (!anchors.has(fragment)) failures.push(`${file}: ${target} (missing fragment)`)
        }
      } catch {
        failures.push(`${file}: ${target}`)
      }
    }
  }
  if (failures.length > 0) throw new Error(`Broken Markdown links:\n${failures.sort().join('\n')}`)
}

export function validateDocumentation(repositoryRoot = process.cwd()) {
  root = resolve(repositoryRoot)
  realRoot = realpathSync(root)
  const specIds = collectSpecIds()
  const referenced = checkCoreDocRequirementReferences(specIds)
  const current = checkCurrentRequirementReferences(specIds)
  checkMarkdownLinks()
  return { coreDocReferenceCount: referenced, ...current }
}

export function runDocumentationCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateDocumentation(repositoryRoot)
    output.log(`Documentation references passed. CoreDoc spec references checked: ${result.coreDocReferenceCount}. Current-document spec references checked: ${result.currentDocumentReferenceCount} across ${result.currentDocumentCount} documents.`)
    return 0
  } catch (error) {
    output.error(error instanceof Error ? error.message : String(error))
    return 1
  }
}

function isDirectExecution() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isDirectExecution()) {
  process.exitCode = runDocumentationCli()
}
