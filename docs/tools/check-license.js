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

for (const path of [
  'package.json',
  'runner/package.json',
  'runner/package.json.orig',
  'implementations/typescript/core/package.json',
  'implementations/typescript/adapters/conformance/package.json',
]) {
  checkPackage(path)
}

checkLockPackage('package-lock.json', '')
checkLockPackage('package-lock.json', 'runner')
checkLockPackage('package-lock.json', 'implementations/typescript/core')
checkLockPackage('package-lock.json', 'implementations/typescript/adapters/conformance')
checkLockPackage('runner/package-lock.json', '')

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
  'THIRD_PARTY_LICENSES.md',
  'docs/decisions/ADR-0001-mpl-2-license.md',
  'docs/governance/license-history.md',
  'docs/tools/check-license.js',
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

  const content = readFileSync(path, 'utf8')
  if (/\bMIT\b|MIT License|License: MIT|license: MIT|"license"\s*:\s*"MIT"/.test(content)) {
    errors.push(`${path} contains an unexpected MIT reference`)
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
