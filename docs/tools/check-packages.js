// SPDX-License-Identifier: MPL-2.0
/**
 * Builds and inspects local TypeScript, Python, and Java package artifacts.
 *
 * This developer tool writes only normal build outputs and a temporary package
 * directory, publishes nothing, and does not define financial-domain behavior.
 */
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const artifactDirectory = mkdtempSync(join(tmpdir(), 'finkore-package-check-'))
const pythonSource = join(artifactDirectory, 'python-source')
const python = resolve(repositoryRoot, '.tools/python-coverage/bin/python')
const maven = resolve(repositoryRoot, '.tools/bin/mvn')
const jar = resolve(repositoryRoot, '.tools/java/jdk-21/bin/jar')

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  })
}

function oneArtifact(pattern, description) {
  const matches = readdirSync(artifactDirectory).filter((name) => pattern.test(name))
  if (matches.length !== 1) {
    throw new Error(`Expected one ${description} in ${artifactDirectory}, found ${matches.length}`)
  }
  const path = join(artifactDirectory, matches[0])
  if (statSync(path).size === 0) throw new Error(`${description} is empty: ${path}`)
  return path
}

function requireEntries(listing, entries, description) {
  for (const entry of entries) {
    if (!listing.includes(entry)) throw new Error(`${description} is missing ${entry}`)
  }
  if (/\.orig(?:\r?\n|$)|\/reports\/|\/coverage\//u.test(listing)) {
    throw new Error(`${description} contains a backup or generated verification artifact`)
  }
}

try {
  run('npm', ['pack', '--workspace', '@finkore/typescript', '--pack-destination', artifactDirectory])
  const npmArchive = oneArtifact(/^finkore-typescript-0\.1\.0\.tgz$/u, 'TypeScript package')
  requireEntries(run('tar', ['-tzf', npmArchive]), [
    'package/package.json',
    'package/dist/index.js',
    'package/dist/index.d.ts',
    'package/LICENSE',
    'package/NOTICE.md',
    'package/THIRD_PARTY_LICENSES.md',
  ], 'TypeScript package')

  cpSync(resolve(repositoryRoot, 'implementations/python/core'), pythonSource, { recursive: true })
  run(python, ['-m', 'pip', 'wheel', pythonSource, '--no-build-isolation', '--no-deps', '--wheel-dir', artifactDirectory])
  run(python, [
    '-c',
    'import setuptools.build_meta as backend; backend.build_sdist(__import__("sys").argv[1])',
    artifactDirectory,
  ], { cwd: pythonSource })
  const wheel = oneArtifact(/^finkore_python-0\.1\.0-py3-none-any\.whl$/u, 'Python wheel')
  const sourceArchive = oneArtifact(/^finkore_python-0\.1\.0\.tar\.gz$/u, 'Python source distribution')
  requireEntries(run(python, ['-m', 'zipfile', '-l', wheel]), [
    'finkore/__init__.py',
    'finkore/py.typed',
    'finkore_python-0.1.0.dist-info/METADATA',
  ], 'Python wheel')
  requireEntries(run('tar', ['-tzf', sourceArchive]), [
    'finkore_python-0.1.0/pyproject.toml',
    'finkore_python-0.1.0/src/finkore/__init__.py',
    'finkore_python-0.1.0/LICENSE',
  ], 'Python source distribution')

  run(maven, ['-q', '-f', 'implementations/java/core/pom.xml', '-DskipTests', 'package'])
  const javaArchive = resolve(repositoryRoot, 'implementations/java/core/target/finkore-java-core-0.1.0.jar')
  if (!existsSync(javaArchive) || statSync(javaArchive).size === 0) {
    throw new Error(`Java package was not created: ${javaArchive}`)
  }
  requireEntries(run(jar, ['tf', javaArchive]), [
    'org/finkore/Money.class',
    'META-INF/LICENSE',
    'META-INF/NOTICE.md',
    'META-INF/THIRD_PARTY_LICENSES.md',
  ], 'Java package')

  console.log(`Local package check passed: ${basename(npmArchive)}, ${basename(wheel)}, ${basename(sourceArchive)}, ${basename(javaArchive)}`)
} finally {
  rmSync(artifactDirectory, { recursive: true, force: true })
}
