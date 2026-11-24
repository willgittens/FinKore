// SPDX-License-Identifier: MPL-2.0
/**
 * Checks package license metadata, source headers, and unexpected license text.
 *
 * This developer tool reads repository files without changing them and contains
 * no financial-domain behavior.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const expectedLicense = 'MPL-2.0'
const errors = []

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function checkPackage(path) {
  const manifest = readJson(path)
  if (manifest.license !== expectedLicense) {
    errors.push(`${path} must declare "license": "${expectedLicense}"`)
  }
}

function checkLockPackage(path, packagePath) {
  const lock = readJson(path)
  const entry = lock.packages?.[packagePath]
  if (entry?.license !== expectedLicense) {
    errors.push(`${path} package entry ${packagePath || '""'} must declare "${expectedLicense}"`)
  }
}

const excludedDirectories = new Set([
  '.git',
  '.npm-cache',
  '.stryker-tmp',
  '.tools',
  'coverage',
  'dist',
  'node_modules',
  'reports',
  'target',
])

function repositoryFiles(directory = '.') {
  const files = []

  for (const entry of readdirSync(directory)) {
    if (excludedDirectories.has(entry)) {
      continue
    }

    const path = join(directory, entry)
    const relativePath = path.replace(/^\.\//, '')
    const stats = statSync(path)

    if (stats.isDirectory()) {
      files.push(...repositoryFiles(path))
    } else if (stats.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

const licenseText = readFileSync('LICENSE', 'utf8')
if (!licenseText.startsWith('Mozilla Public License Version 2.0\n')) {
  errors.push('LICENSE must contain the official MPL-2.0 text')
}

checkPackage('package.json')

checkLockPackage('package-lock.json', '')

for (const path of repositoryFiles().filter((file) => /\.(?:ts|js)$/.test(file))) {
  if (path.includes('/dist/')) {
    continue
  }

  const content = readFileSync(path, 'utf8')
  if (
    !content.startsWith('// SPDX-License-Identifier: MPL-2.0\n') &&
    !content.startsWith('#!/usr/bin/env node\n// SPDX-License-Identifier: MPL-2.0\n')
  ) {
    errors.push(`${path} is missing SPDX-License-Identifier: MPL-2.0`)
  }
}

const allowedMitPaths = new Set([
  'LICENSING.md',
  'learn/licensing.html', // Derived policy; npm run learn:check enforces source synchronization.
  'THIRD_PARTY_LICENSES.md',
  'docs/decisions/ADR-0001-mpl-2-license.md',
  'docs/governance/license-history.md',
  'docs/tools/check-license.js',
  'docs/tools/test/fixtures/license-negative.json', // Explicit adversarial input, never a project license declaration.
])

for (const path of repositoryFiles()) {
  if (
    path.endsWith('package-lock.json') ||
    path.includes('/node_modules/') ||
    path.includes('/dist/') ||
    path.includes('/coverage/') ||
    path.includes('/reports/') ||
    allowedMitPaths.has(path)
  ) {
    continue
  }

  let content = readFileSync(path, 'utf8')
  // A filename in a source inventory is attribution metadata, not this
  // repository's license notice. Mask only that exact tuple path component;
  // descriptions, license fields and malformed documents remain inspected.
  if (/^experts\/code-evidence\/inventories\/CE-REPO-\d+\/CE-EDITION-\d+\.json$/.test(path)) {
    try {
      const inventory = JSON.parse(content)
      for (const group of ['source_files', 'other_files']) {
        for (const row of Array.isArray(inventory[group]) ? inventory[group] : []) {
          if (Array.isArray(row) && typeof row[0] === 'string') {
            row[0] = row[0].replace(/(^|\/)MIT-LICENSE(?:\.(?:md|txt))?$/i, '$1[upstream license filename]')
          }
        }
      }
      content = JSON.stringify(inventory)
    } catch { /* Preserve the raw content check when inventory JSON is malformed. */ }
  }
  // An institution acronym or a diagnostic mentioning that acronym is not a
  // license declaration. Retain checks for explicit notices and metadata.
  const incompatibleNotice = /\bMIT[\s-]+licen[cs](?:e|ed)\b|\b(?:SPDX-License-Identifier|licen[cs]e)["']?\s*[:=]\s*["']?(?:https?:\/\/(?:www\.)?opensource\.org\/licenses\/)?MIT\b|\blicen[cs]ed\s+(?:under|as|using|with)\s+(?:(?:the|an?)\s+)?MIT\b|\b(?:FinKore|project)\s+(?:uses?|is)\s+(?:the\s+)?MIT\b|@license\s+MIT\b/i
  if (incompatibleNotice.test(content)) {
    errors.push(`${path} contains an unexpected MIT license declaration`)
  }
}

if (errors.length > 0) {
  console.error('License validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('License validation passed.')
