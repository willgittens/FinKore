#!/usr/bin/env node
// SPDX-License-Identifier: MPL-2.0
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputPath = 'conformance/draft-0.6/checksums.json'
const mode = process.argv.includes('--check') ? 'check' : 'write'
const includeRoots = [
  'README.md',
  'package.json',
  'package-lock.json',
  'spec',
  'conformance',
  'agentic',
  'runner',
  'implementations',
  'docs',
]
const allowedExtensions = new Set(['.md', '.json', '.ts', '.js', '.py', '.java', '.xml'])
const allowedBasenames = new Set(['pom.xml'])
const immutableTag = 'core-draft-0.6'
const releaseIdentity = `resolved-by-immutable-tag:${immutableTag}`
const excluded = [
  '/dist/',
  '/target/',
  '/reports/',
  '/__pycache__/',
  '/node_modules/',
  '/.stryker-tmp/',
]

function extension(path) {
  const last = path.lastIndexOf('.')
  return last === -1 ? '' : path.slice(last)
}

function shouldInclude(path) {
  if (path === outputPath) return false
  if (excluded.some((segment) => path.includes(segment))) return false
  const basename = path.split('/').at(-1) ?? path
  return allowedBasenames.has(basename) || allowedExtensions.has(extension(path))
}

function walk(path) {
  const stats = statSync(path)
  if (stats.isFile()) return shouldInclude(path) ? [path] : []
  if (!stats.isDirectory()) return []
  return readdirSync(path).flatMap((entry) => walk(join(path, entry).replaceAll('\\', '/')))
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

const artifacts = [...new Set(includeRoots.flatMap(walk))]
  .sort((left, right) => left.localeCompare(right, 'en'))
  .map((path) => ({ path, sha256: sha256(path) }))

const manifest = {
  finkoreChecksums: '0.1',
  authority: 'docs/draft-0.6-compatibility-claims-provenance-policy.md',
  algorithm: 'SHA-256',
  status: 'generated-for-immutable-tag',
  generatedFor: {
    coreVersion: 'draft-0.6',
    baseRevision: releaseIdentity,
    worktreeStatus: 'committed release evidence; exact source revision resolved by immutable tag',
    immutableTag,
    immutableTagStatus: 'approved-for-creation-from-this-evidence',
  },
  artifacts,
}

const serialized = `${JSON.stringify(manifest, null, 2)}\n`

if (mode === 'check') {
  const current = readFileSync(outputPath, 'utf8')
  if (current !== serialized) {
    console.error('Draft 0.6 checksum manifest is stale. Run npm run checksums:generate:draft0.6.')
    process.exit(1)
  }
  console.log(`Draft 0.6 checksum manifest verified: ${artifacts.length} artifacts.`)
} else {
  writeFileSync(outputPath, serialized)
  console.log(`Draft 0.6 checksum manifest generated: ${artifacts.length} artifacts.`)
}
