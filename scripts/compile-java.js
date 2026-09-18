// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { delimiter, join, resolve } from 'node:path'

const repositoryRoot = process.cwd()
const javac = existsSync(resolve(repositoryRoot, '.tools/bin/javac')) ? resolve(repositoryRoot, '.tools/bin/javac') : 'javac'
const mainOutput = resolve(repositoryRoot, 'implementations/java/target/classes')
const testOutput = resolve(repositoryRoot, 'implementations/java/target/test-classes')

function files(directory) {
  if (!existsSync(directory)) return []
  const result = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      result.push(...files(path))
    } else if (entry.isFile() && path.endsWith('.java')) {
      result.push(path)
    }
  }
  return result
}

function run(args) {
  const child = spawnSync(javac, args, { encoding: 'utf8', cwd: repositoryRoot })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) {
    process.stderr.write(child.stdout)
    process.stderr.write(child.stderr)
    process.exit(child.status ?? 1)
  }
}

mkdirSync(mainOutput, { recursive: true })
mkdirSync(testOutput, { recursive: true })

const mainSources = [
  ...files('implementations/java/core/src/main/java'),
  ...files('implementations/java/examples'),
  ...files('implementations/java/adapters/conformance/src/main/java'),
]
run(['-Xlint:all', '-Werror', '-d', mainOutput, ...mainSources])

const testSources = files('implementations/java/core/src/test/java')
  .concat(files('implementations/java/adapters/conformance/src/test/java'))
  .filter((path) => !path.endsWith('CoverageTest.java'))
if (testSources.length > 0) {
  run(['-Xlint:all', '-Werror', '-cp', mainOutput, '-d', testOutput, ...testSources])
}

console.log(`Compiled ${mainSources.length} Java source files and ${testSources.length} test files.`)
