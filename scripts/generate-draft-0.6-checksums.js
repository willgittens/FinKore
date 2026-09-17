#!/usr/bin/env node
// SPDX-License-Identifier: MPL-2.0
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const outputPath = 'conformance/draft-0.6/checksums.json'
const mode = process.argv.includes('--check') ? 'check' : 'write'
const includeRoots = [
  'LICENSE',
  'LICENSING.md',
  'NOTICE.md',
  'THIRD_PARTY_LICENSES.md',
  'TRADEMARKS.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'spec',
  'conformance',
  'agentic',
  'runner',
  'implementations',
  'docs',
  '.github',
  'scripts',
]
const allowedExtensions = new Set(['.md', '.json', '.ts', '.js', '.py', '.java', '.xml'])
const allowedBasenames = new Set(['pom.xml'])
const immutableTag = 'core-draft-0.6'
const correctionIdentity = 'draft-0.6-release-evidence-correction'
const excluded = [
  '/dist/',
  '/target/',
  '/reports/',
  '/__pycache__/',
  '/node_modules/',
  '/.stryker-tmp/',
]
const ignoredGeneratedRoots = [
  'coverage/',
  'reports/',
  'dist/',
  'target/',
  'node_modules/',
  '.stryker-tmp/',
  '.tools/',
]

function extension(path) {
  const last = path.lastIndexOf('.')
  return last === -1 ? '' : path.slice(last)
}

function shouldInclude(path) {
  if (path === outputPath) return false
  if (excluded.some((segment) => path.includes(segment))) return false
  if (ignoredGeneratedRoots.some((root) => path === root.slice(0, -1) || path.startsWith(root))) return false
  const basename = path.split('/').at(-1) ?? path
  return allowedBasenames.has(basename) || allowedExtensions.has(extension(path))
}

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
    .split('\0')
    .filter((path) => path.length > 0)
    .map((path) => path.replaceAll('\\', '/'))
}

function isUnderIncludedRoot(path) {
  return includeRoots.some((root) => path === root || path.startsWith(`${root}/`))
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function artifactKind(path) {
  if (path === 'LICENSE' || path === 'LICENSING.md' || path === 'NOTICE.md' || path === 'THIRD_PARTY_LICENSES.md' || path === 'TRADEMARKS.md') return 'license'
  if (path === 'package.json' || path === 'package-lock.json' || path.endsWith('/package.json') || path.endsWith('/package-lock.json') || path.endsWith('/pom.xml') || path.endsWith('/pyproject.toml')) return 'package'
  if (path.startsWith('spec/')) return 'specification'
  if (path.startsWith('conformance/draft-0.6/claims/')) return 'claim'
  if (path.startsWith('conformance/draft-0.6/schemas/')) return 'schema'
  if (path.startsWith('conformance/draft-0.6/fixtures/')) return 'test-fixture'
  if (path.startsWith('conformance/')) return 'conformance'
  if (path.startsWith('agentic/')) return 'agentic'
  if (path.startsWith('runner/')) return 'runner'
  if (path.includes('/adapters/conformance/')) return 'adapter'
  if (path.startsWith('implementations/')) return 'implementation'
  if (path.startsWith('docs/')) return 'documentation'
  if (path.startsWith('.github/')) return 'tooling'
  if (path.startsWith('scripts/')) return 'tooling'
  return 'source'
}

const inventory = trackedFiles().filter((path) => isUnderIncludedRoot(path) && shouldInclude(path))
const artifacts = [...new Set(inventory)]
  .sort((left, right) => left.localeCompare(right, 'en'))
  .map((path) => ({ path, kind: artifactKind(path), sha256: sha256(path) }))

const manifest = {
  finkoreChecksums: '0.1',
  authority: 'docs/draft-0.6-compatibility-claims-provenance-policy.md',
  algorithm: 'SHA-256',
  status: 'release-evidence-correction',
  generatedFor: {
    coreVersion: 'draft-0.6',
    evidenceRevision: correctionIdentity,
    supersedesEvidenceRevision: `resolved-by-immutable-tag:${immutableTag}`,
    sourceInventory: 'git ls-files --cached --others --exclude-standard',
    worktreeStatus: 'tracked release-relevant files only; ignored and untracked ambient outputs are excluded',
    immutableTag,
    immutableTagStatus: 'historical evidence preserved; this manifest records corrected replacement evidence',
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
