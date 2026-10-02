// SPDX-License-Identifier: MPL-2.0
/**
 * Validates local Markdown links and CoreDoc references to specification IDs.
 *
 * This developer tool reads repository documentation without changing it and
 * contains no financial-domain behavior.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

let root = process.cwd()
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'reports', '.tools'])

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return []
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return extname(entry.name) === '.md' ? [path] : []
  })
}

function markdownFilesUnder(directory) {
  return walk(resolve(root, directory)).sort()
}

function collectSpecIds() {
  const ids = new Set()
  for (const file of markdownFilesUnder('spec')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/^\s*-\s+\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]/gm)) ids.add(match[1])
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
      if (!path.startsWith(root) || !existsSync(path)) failures.push(`${file}: ${target}`)
      else if (!statSync(path).isFile() && !statSync(path).isDirectory()) failures.push(`${file}: ${target}`)
      else if (fragment !== undefined && fragment.length > 0 && statSync(path).isFile() && extname(path) === '.md') {
        const anchors = anchorCache.get(path) ?? markdownAnchors(path)
        anchorCache.set(path, anchors)
        if (!anchors.has(fragment)) failures.push(`${file}: ${target} (missing fragment)`)
      }
    }
  }
  if (failures.length > 0) throw new Error(`Broken Markdown links:\n${failures.sort().join('\n')}`)
}

export function validateDocumentation(repositoryRoot = process.cwd()) {
  root = resolve(repositoryRoot)
  const referenced = checkCoreDocRequirementReferences(collectSpecIds())
  checkMarkdownLinks()
  return { coreDocReferenceCount: referenced }
}

export function runDocumentationCli(repositoryRoot = process.cwd(), output = console) {
  try {
    const result = validateDocumentation(repositoryRoot)
    output.log(`Documentation references passed. CoreDoc spec references checked: ${result.coreDocReferenceCount}.`)
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
