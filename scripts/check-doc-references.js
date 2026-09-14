// SPDX-License-Identifier: MPL-2.0
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'

const root = process.cwd()
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
    for (const match of text.matchAll(/\*\*([A-Z][A-Z0-9-]+-\d{3})\*\*/g)) ids.add(match[1])
  }
  return ids
}

function checkCoreDocRequirementReferences(specIds) {
  const prefixes = new Set([...specIds].map((id) => id.replace(/-\d{3}$/, '')))
  const missing = new Set()
  let referenced = 0

  for (const file of markdownFilesUnder('docs/coreDoc')) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/([A-Z][A-Z0-9-]+)-(\d{3})(?:\s+(?:to|through)\s+-?(\d{3}))?/g)) {
      const prefix = match[1]
      if (!prefixes.has(prefix)) continue
      const start = Number(match[2])
      const end = match[3] === undefined ? start : Number(match[3])
      for (let value = start; value <= end; value += 1) {
        const id = `${prefix}-${String(value).padStart(3, '0')}`
        referenced += 1
        if (!specIds.has(id)) missing.add(`${file}: ${id}`)
      }
    }
  }

  if (missing.size > 0) {
    throw new Error(`Missing CoreDoc requirement references:\n${[...missing].sort().join('\n')}`)
  }
  return referenced
}

function markdownLinks(text) {
  return [...text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim())
}

function linkTargetPath(file, target) {
  const withoutTitle = target.split(/\s+["'][^"']*["']\s*$/)[0] ?? target
  const withoutFragment = withoutTitle.split('#')[0]
  if (withoutFragment.length === 0) return undefined
  if (/^[a-z][a-z0-9+.-]*:/i.test(withoutFragment)) return undefined
  return normalize(resolve(dirname(file), withoutFragment.replace(/^<|>$/g, '')))
}

function checkMarkdownLinks() {
  const failures = []
  for (const file of markdownFilesUnder('.')) {
    const text = readFileSync(file, 'utf8')
    for (const target of markdownLinks(text)) {
      const path = linkTargetPath(file, target)
      if (path === undefined) continue
      if (!path.startsWith(root) || !existsSync(path)) failures.push(`${file}: ${target}`)
      else if (!statSync(path).isFile() && !statSync(path).isDirectory()) failures.push(`${file}: ${target}`)
    }
  }
  if (failures.length > 0) throw new Error(`Broken Markdown links:\n${failures.sort().join('\n')}`)
}

try {
  const referenced = checkCoreDocRequirementReferences(collectSpecIds())
  checkMarkdownLinks()
  process.stdout.write(`Documentation references passed. CoreDoc spec references checked: ${referenced}.\n`)
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}
