// SPDX-License-Identifier: MPL-2.0
import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { get } from 'node:https'
import { basename, dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const root = process.cwd()
const tools = resolve(root, '.tools')
const toolsBin = join(tools, 'bin')
const uvExecutable = join(tools, 'uv', 'bin', 'uv')
const jdkHome = join(tools, 'java', 'jdk-21')
const mavenVersion = '3.9.9'
const mavenHome = join(tools, 'maven', `apache-maven-${mavenVersion}`)

const downloads = {
  uv: 'https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-unknown-linux-gnu.tar.gz',
  jdk21: 'https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse?project=jdk',
  maven: `https://archive.apache.org/dist/maven/maven-3/${mavenVersion}/binaries/apache-maven-${mavenVersion}-bin.tar.gz`,
}

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true })
}

function temporaryDirectory(name) {
  const path = join(tmpdir(), `finkore-${name}-${process.pid}-${Date.now()}`)
  ensureDirectory(path)
  return path
}

function removeFileIfPresent(path) {
  if (existsSync(path)) rmSync(path)
}

function download(url, destination, redirects = 0) {
  if (redirects > 8) throw new Error(`Too many redirects while downloading ${url}`)
  return new Promise((resolveDownload, reject) => {
    const request = get(url, (response) => {
      const location = response.headers.location
      if (response.statusCode !== undefined && response.statusCode >= 300 && response.statusCode < 400 && location !== undefined) {
        response.resume()
        const redirected = new URL(location, url).href
        resolveDownload(download(redirected, destination, redirects + 1))
        return
      }
      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Download failed for ${url}: HTTP ${response.statusCode ?? 'unknown'}`))
        return
      }

      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        writeFileSync(destination, Buffer.concat(chunks))
        resolveDownload(undefined)
      })
    })
    request.on('error', reject)
  })
}

function extractTarball(tarball, destination) {
  execFileSync('tar', ['-xzf', tarball, '-C', destination], { stdio: 'inherit' })
}

function findExecutable(directory, name) {
  if (!existsSync(directory)) return undefined
  const entries = readdirSync(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      const found = findExecutable(path, name)
      if (found !== undefined) return found
    } else if (entry.isFile() && entry.name === name) {
      return path
    }
  }
  return undefined
}

function firstDirectoryWithExecutables(directory, names) {
  if (!existsSync(directory)) return undefined
  const entries = readdirSync(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (!entry.isDirectory()) continue
    if (names.every((name) => existsSync(join(path, 'bin', name)))) return path
    const found = firstDirectoryWithExecutables(path, names)
    if (found !== undefined) return found
  }
  return undefined
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`
}

function writeExecutableShim(target, name, environment = {}) {
  ensureDirectory(toolsBin)
  const shim = join(toolsBin, name)
  removeFileIfPresent(shim)
  const exports = Object.entries(environment)
    .map(([key, value]) => `export ${key}=${shellQuote(value)}\n`)
    .join('')
  writeFileSync(shim, `#!/usr/bin/env bash\n${exports}exec ${shellQuote(target)} "$@"\n`)
  chmodSync(shim, 0o755)
}

async function installUv() {
  if (existsSync(uvExecutable)) {
    writeExecutableShim(uvExecutable, 'uv')
    return
  }

  const work = temporaryDirectory('uv')
  const tarball = join(work, 'uv.tar.gz')
  console.log(`Downloading uv into ${tools}`)
  await download(downloads.uv, tarball)
  extractTarball(tarball, work)

  const extracted = findExecutable(work, 'uv')
  if (extracted === undefined) throw new Error('Downloaded uv archive did not contain a uv executable')

  ensureDirectory(dirname(uvExecutable))
  copyFileSync(extracted, uvExecutable)
  chmodSync(uvExecutable, 0o755)
  writeExecutableShim(uvExecutable, 'uv')
}

function pythonExecutable(version) {
  return findExecutable(join(tools, 'python'), `python${version}`)
}

async function installPython(versions) {
  await installUv()
  ensureDirectory(join(tools, 'python'))
  execFileSync(uvExecutable, ['python', 'install', ...versions], {
    stdio: 'inherit',
    env: {
      ...process.env,
      UV_CACHE_DIR: join(tools, 'uv-cache'),
      UV_NO_MODIFY_PATH: '1',
      UV_PYTHON_INSTALL_DIR: join(tools, 'python'),
    },
  })

  for (const version of versions) {
    const python = pythonExecutable(version)
    if (python === undefined) throw new Error(`uv did not install python${version} under ${join(tools, 'python')}`)
    writeExecutableShim(python, `python${version}`)
    if (version === '3.12') {
      writeExecutableShim(python, 'python3')
      writeExecutableShim(python, 'python')
    }
  }
}

async function installJdk21() {
  if (existsSync(join(jdkHome, 'bin', 'javac'))) {
    writeExecutableShim(join(jdkHome, 'bin', 'java'), 'java')
    writeExecutableShim(join(jdkHome, 'bin', 'javac'), 'javac')
    return
  }
  if (existsSync(jdkHome)) {
    throw new Error(`${jdkHome} exists but does not contain bin/javac; move it aside before bootstrapping JDK 21`)
  }

  const work = temporaryDirectory('jdk21')
  const tarball = join(work, 'jdk21.tar.gz')
  console.log(`Downloading JDK 21 into ${tools}`)
  await download(downloads.jdk21, tarball)
  extractTarball(tarball, work)

  const extracted = firstDirectoryWithExecutables(work, ['java', 'javac'])
  if (extracted === undefined) throw new Error('Downloaded JDK archive did not contain java and javac')

  ensureDirectory(dirname(jdkHome))
  cpSync(extracted, jdkHome, { recursive: true })
  writeExecutableShim(join(jdkHome, 'bin', 'java'), 'java')
  writeExecutableShim(join(jdkHome, 'bin', 'javac'), 'javac')
}

async function installMaven() {
  if (existsSync(join(mavenHome, 'bin', 'mvn'))) {
    writeExecutableShim(join(mavenHome, 'bin', 'mvn'), 'mvn', {
      JAVA_HOME: jdkHome,
    })
    return
  }
  if (existsSync(mavenHome)) {
    throw new Error(`${mavenHome} exists but does not contain bin/mvn; move it aside before bootstrapping Maven`)
  }

  const work = temporaryDirectory('maven')
  const tarball = join(work, basename(downloads.maven))
  console.log(`Downloading Maven ${mavenVersion} into ${tools}`)
  await download(downloads.maven, tarball)
  extractTarball(tarball, work)

  const extracted = firstDirectoryWithExecutables(work, ['mvn'])
  if (extracted === undefined) throw new Error('Downloaded Maven archive did not contain mvn')

  ensureDirectory(dirname(mavenHome))
  cpSync(extracted, mavenHome, { recursive: true })
  writeExecutableShim(join(mavenHome, 'bin', 'mvn'), 'mvn', {
    JAVA_HOME: jdkHome,
  })
}

function isExecutable(path) {
  return (statSync(path).mode & 0o111) !== 0
}

function pythonMetadataVersion(version) {
  const python = pythonExecutable(version)
  if (python === undefined) return undefined
  const rootDirectory = dirname(dirname(python))
  const patchLevel = readFileSync(join(rootDirectory, 'include', `python${version}`, 'patchlevel.h'), 'utf8')
  return patchLevel.match(/#define PY_VERSION\s+"([^"]+)"/)?.[1]
}

function jdkMetadataVersion() {
  const release = readFileSync(join(jdkHome, 'release'), 'utf8')
  return release.match(/^JAVA_VERSION="([^"]+)"/m)?.[1]
}

function checkTools(options) {
  const checks = [
    ...options.pythonVersions.map((version) => ({
      path: join(toolsBin, `python${version}`),
      valid: () => pythonMetadataVersion(version)?.startsWith(`${version}.`) === true,
      expected: `CPython ${version}.x`,
    })),
    ...(options.java ? [
      {
        path: join(toolsBin, 'java'),
        valid: () => jdkMetadataVersion()?.startsWith('21.') === true,
        expected: 'JDK 21.x java',
      },
      {
        path: join(toolsBin, 'javac'),
        valid: () => jdkMetadataVersion()?.startsWith('21.') === true,
        expected: 'JDK 21.x javac',
      },
    ] : []),
    ...(options.maven ? [{
      path: join(toolsBin, 'mvn'),
      valid: () => existsSync(join(mavenHome, 'lib', `maven-core-${mavenVersion}.jar`)),
      expected: `Apache Maven ${mavenVersion}`,
    }] : []),
  ]

  const failures = []
  for (const check of checks) {
    if (!existsSync(check.path)) {
      failures.push(`${check.path} is missing`)
      continue
    }
    if (!isExecutable(check.path)) {
      failures.push(`${check.path} is not executable`)
      continue
    }
    if (!check.valid()) failures.push(`${check.path} does not match ${check.expected}`)
  }

  if (failures.length > 0) {
    console.error('Draft 0.5 local toolchain check failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log('Draft 0.5 local toolchain check passed.')
}

function requestedInstallations(args) {
  const pythonVersions = args
    .filter((arg) => arg.startsWith('--python='))
    .map((arg) => arg.slice('--python='.length))
  const explicitPython = args.includes('--python')
  const hasSpecificPython = pythonVersions.length > 0
  const noInstallFlags = !explicitPython && !hasSpecificPython && !args.includes('--java') && !args.includes('--maven')

  return {
    pythonVersions: noInstallFlags || explicitPython ? ['3.12', '3.13'] : pythonVersions,
    java: noInstallFlags || args.includes('--java') || args.includes('--maven'),
    maven: noInstallFlags || args.includes('--maven'),
    check: args.includes('--check'),
  }
}

const options = requestedInstallations(process.argv.slice(2))

if (options.check) {
  checkTools({
    pythonVersions: options.pythonVersions.length === 0 && !options.java && !options.maven ? ['3.12', '3.13'] : options.pythonVersions,
    java: options.pythonVersions.length === 0 && !options.maven ? true : options.java,
    maven: options.pythonVersions.length === 0 && !options.java ? true : options.maven,
  })
} else {
  ensureDirectory(tools)
  if (options.pythonVersions.length > 0) await installPython(options.pythonVersions)
  if (options.java) await installJdk21()
  if (options.maven) await installMaven()
  checkTools(options)
}
