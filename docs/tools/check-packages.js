// SPDX-License-Identifier: MPL-2.0
/**
 * Builds, inspects, and consumes local TypeScript, Python, and Java artifacts.
 *
 * This developer tool writes only normal build outputs and a temporary package
 * directory, publishes nothing, and does not define financial-domain behavior.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, delimiter, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const artifactDirectory = mkdtempSync(join(tmpdir(), 'finkore-package-check-'))
const pythonSource = join(artifactDirectory, 'python-source')
const python = resolve(repositoryRoot, '.tools/python-coverage/bin/python')
const pythonRuntime = resolve(repositoryRoot, '.tools/bin/python3.12')
const maven = resolve(repositoryRoot, '.tools/bin/mvn')
const jar = resolve(repositoryRoot, '.tools/java/jdk-21/bin/jar')
const java = resolve(repositoryRoot, '.tools/java/jdk-21/bin/java')
const javac = resolve(repositoryRoot, '.tools/java/jdk-21/bin/javac')

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env: {
      ...process.env,
      npm_config_cache: join(artifactDirectory, 'npm-cache'),
      PIP_CACHE_DIR: join(artifactDirectory, 'pip-cache'),
      PIP_DISABLE_PIP_VERSION_CHECK: '1',
    },
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

function rejectEntries(listing, patterns, description) {
  for (const pattern of patterns) {
    if (pattern.test(listing)) throw new Error(`${description} contains an excluded entry matching ${pattern}`)
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
  const npmListing = run('tar', ['-tzf', npmArchive])
  rejectEntries(npmListing, [
    /^package\/(?:src|test|coverage|reports|node_modules)\//mu,
    /^package\/.*\.orig$/mu,
  ], 'TypeScript package')

  const nodeConsumer = join(artifactDirectory, 'node-consumer')
  mkdirSync(nodeConsumer)
  writeFileSync(join(nodeConsumer, 'package.json'), '{"private":true,"type":"module"}\n')
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', npmArchive], { cwd: nodeConsumer })
  run(process.execPath, [
    '--input-type=module',
    '--eval',
    "import { FINKORE_CORE_VERSION, Money } from '@finkore/typescript'; const value = Money.from({ amount: '1.20', currency: 'EUR' }).toJSON(); if (FINKORE_CORE_VERSION !== '0.9-rc' || value.amount !== '1.20' || value.currency !== 'EUR') throw new Error('Installed TypeScript package returned an unexpected public value')",
  ], { cwd: nodeConsumer })

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
  const wheelListing = run(python, ['-m', 'zipfile', '-l', wheel])
  const sourceListing = run('tar', ['-tzf', sourceArchive])
  rejectEntries(wheelListing, [/(?:^|\/)(?:tests?|coverage|reports|build)(?:\/|$)/mu, /\.orig$/mu], 'Python wheel')
  rejectEntries(sourceListing, [/(?:^|\/)(?:tests?|coverage|reports|build)(?:\/|$)/mu, /\.orig$/mu], 'Python source distribution')

  const pythonConsumer = join(artifactDirectory, 'python-consumer')
  run(pythonRuntime, ['-m', 'venv', pythonConsumer])
  const consumerPython = join(pythonConsumer, 'bin', 'python')
  run(consumerPython, ['-m', 'pip', 'install', '--no-index', '--no-deps', wheel])
  run(consumerPython, [
    '-c',
    "from finkore import CORE_VERSION, Money; value = Money.from_portable({'amount': '1.20', 'currency': 'EUR'}).to_portable(); assert CORE_VERSION == '0.9-rc' and value == {'amount': '1.20', 'currency': 'EUR'}",
  ])

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
  const javaListing = run(jar, ['tf', javaArchive])
  rejectEntries(javaListing, [/(?:^|\/)(?:test|tests|coverage|reports)(?:\/|$)/mu, /\.orig$/mu], 'Java package')

  const localRepository = join(artifactDirectory, 'm2')
  run(maven, [
    '-q',
    'install:install-file',
    `-Dfile=${javaArchive}`,
    `-DpomFile=${resolve(repositoryRoot, 'implementations/java/core/pom.xml')}`,
    `-DlocalRepositoryPath=${localRepository}`,
  ])
  const installedJavaArchive = join(localRepository, 'org/finkore/finkore-java-core/0.1.0/finkore-java-core-0.1.0.jar')
  if (!existsSync(installedJavaArchive)) throw new Error('Java package was not installed into the isolated repository')
  const javaConsumer = join(artifactDirectory, 'java-consumer')
  const javaClasses = join(javaConsumer, 'classes')
  mkdirSync(javaClasses, { recursive: true })
  const javaConsumerSource = join(javaConsumer, 'FinKoreConsumer.java')
  writeFileSync(javaConsumerSource, `
import java.util.Map;
import org.finkore.FinKore;
import org.finkore.Money;

public final class FinKoreConsumer {
  public static void main(String[] args) {
    Money value = Money.fromPortable(Map.of("amount", "1.20", "currency", "EUR"));
    if (!"0.9-rc".equals(FinKore.CORE_VERSION) || !"1.20".equals(value.toPortable().get("amount"))) {
      throw new IllegalStateException("Installed Java package returned an unexpected public value");
    }
  }
}
`)
  run(javac, ['-cp', installedJavaArchive, '-d', javaClasses, javaConsumerSource])
  run(java, ['-cp', `${installedJavaArchive}${delimiter}${javaClasses}`, 'FinKoreConsumer'])

  console.log(`Local package and consumer check passed: ${basename(npmArchive)}, ${basename(wheel)}, ${basename(sourceArchive)}, ${basename(javaArchive)}`)
} finally {
  rmSync(artifactDirectory, { recursive: true, force: true })
}
