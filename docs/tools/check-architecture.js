// SPDX-License-Identifier: MPL-2.0
/**
 * Validates the specification-only repository architecture after implementation removal.
 *
 * This developer tool reads repository structure and metadata without changing
 * them. It enforces boundaries only and does not define or execute financial
 * behavior.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const REMOVED_ROOTS = ['implementations', 'runner']
const REMOVED_REFERENCE = /(?:^|[\s'"/])(?:implementations|runner)(?:[\s'"/]|$)/

function filesUnder(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : entry.isFile() ? [path] : []
  })
}

export function validateRepositoryArchitecture(repositoryRoot = process.cwd()) {
  const root = resolve(repositoryRoot)
  const errors = []
  for (const removedRoot of REMOVED_ROOTS) {
    if (existsSync(join(root, removedRoot))) errors.push(`removed repository root still exists: ${removedRoot}`)
  }

  const workflowRoot = join(root, '.github', 'workflows')
  if (existsSync(workflowRoot) && filesUnder(workflowRoot).length > 0) {
    errors.push('GitHub Actions workflows are not permitted; verification is local')
  }

  const packagePath = join(root, 'package.json')
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
  if (Object.hasOwn(packageJson, 'workspaces')) errors.push('root package must not declare implementation or runner workspaces')
  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    if (typeof command === 'string' && REMOVED_REFERENCE.test(command)) {
      errors.push(`package script ${name} references removed implementation or runner paths`)
    }
  }
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const name of Object.keys(packageJson[section] ?? {})) {
      if (name.startsWith('@finkore/')) errors.push(`${section} retains removed maintained package ${name}`)
    }
  }

  const toolsRoot = join(root, 'docs', 'tools')
  for (const path of filesUnder(toolsRoot).filter((candidate) => candidate.endsWith('.js') && !candidate.includes(`${join('docs', 'tools', 'test')}/`))) {
    const text = readFileSync(path, 'utf8')
    const label = relative(root, path)
    if (!text.startsWith('// SPDX-License-Identifier: MPL-2.0\n/**')) errors.push(`${label} lacks the required executable-tool header`)
    if (!/developer tool/i.test(text.slice(0, 700))) errors.push(`${label} does not identify itself as a developer tool`)
    if (!/(?:reads|writes|changes)[\s\S]{0,160}(?:without changing|writes nothing|does not change|changing them)/i.test(text.slice(0, 700))) {
      errors.push(`${label} does not explain its effects`)
    }
    if (!/(?:does[\s*]+not[\s*]+define|contains[\s*]+no)[\s\S]{0,80}financial/i.test(text.slice(0, 700))) {
      errors.push(`${label} does not disclaim financial behavior`)
    }
  }

  if (errors.length > 0) throw new Error(`Architecture check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`)
  return { toolCount: filesUnder(toolsRoot).filter((path) => path.endsWith('.js') && !path.includes(`${join('docs', 'tools', 'test')}/`)).length }
}

function isDirectExecution() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

if (isDirectExecution()) {
  try {
    const result = validateRepositoryArchitecture()
    console.log(`Architecture check passed: specification-only boundaries and ${result.toolCount} developer tools validated.`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
