// SPDX-License-Identifier: MPL-2.0
/**
 * Validates the Node runtime and package engine declarations used for releases.
 *
 * This developer tool reads package metadata, writes nothing, and does not
 * define financial-domain behavior.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repositoryRoot = process.cwd()
const supportedEngine = '>=24.11.0 <25'
const packageFiles = ['package.json']

const [major, minor, patch] = process.versions.node.split('.').map(Number)
if (major !== 24 || minor < 11 || [major, minor, patch].some((part) => !Number.isInteger(part))) {
  console.error(`Node ${process.versions.node} is outside the supported release line ${supportedEngine}`)
  process.exit(1)
}

const failures = []
for (const packageFile of packageFiles) {
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, packageFile), 'utf8'))
  if (packageJson.engines?.node !== supportedEngine) {
    failures.push(`${packageFile} declares ${JSON.stringify(packageJson.engines?.node)} instead of ${supportedEngine}`)
  }
}

if (failures.length > 0) {
  console.error('Node engine metadata check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Node ${process.versions.node} satisfies the tested release line ${supportedEngine}.`)
