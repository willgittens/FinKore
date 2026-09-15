// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'
import { dirname, delimiter, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const adapterDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(adapterDirectory, '../../../..')
const defaultJavaPath = process.env.FINKORE_JAVA_PATH ?? resolve(repositoryRoot, '.tools/bin/java')
const defaultClasspath = [
  resolve(repositoryRoot, 'implementations/java/target/classes'),
].join(delimiter)
const defaultClasspathOverride = process.env.FINKORE_JAVA_CLASSPATH
const defaultBridgeMain = process.env.FINKORE_JAVA_BRIDGE_MAIN ?? 'org.finkore.conformance.Bridge'

function parseJson(text, diagnostic) {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`${diagnostic}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function bridgeArgs(classpath, bridgeMain, extraArgs = []) {
  return ['-cp', classpath, bridgeMain, ...extraArgs]
}

function runBridge(javaPath, classpath, bridgeMain, request, timeoutMs) {
  const child = spawnSync(javaPath, bridgeArgs(classpath, bridgeMain), {
    input: JSON.stringify(request),
    encoding: 'utf8',
    timeout: timeoutMs,
    cwd: repositoryRoot,
  })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) throw new Error(`Java bridge exited with ${child.status ?? 'unknown'}: ${child.stderr}`)
  if (child.stdout.trim().length === 0) throw new Error('Java bridge produced no response')
  const result = parseJson(child.stdout, 'Java bridge produced malformed JSON')
  if (result?.status === 'unsupported') return { status: 'unsupported' }
  return result
}

export function createJavaConformanceAdapter(options = {}) {
  const javaPath = options.javaPath ?? defaultJavaPath
  const classpath = options.classpath ?? defaultClasspathOverride ?? defaultClasspath
  const bridgeMain = options.bridgeMain ?? defaultBridgeMain
  const timeoutMs = options.timeoutMs ?? 5_000
  let supportedOperations

  function operations() {
    if (supportedOperations !== undefined) return supportedOperations
    const child = spawnSync(javaPath, bridgeArgs(classpath, bridgeMain, ['--operations']), {
      encoding: 'utf8',
      timeout: timeoutMs,
      cwd: repositoryRoot,
    })
    if (child.error !== undefined) throw child.error
    if (child.status !== 0) throw new Error(`Java bridge operation discovery exited with ${child.status ?? 'unknown'}: ${child.stderr}`)
    supportedOperations = new Set(parseJson(child.stdout, 'Java bridge operation discovery produced malformed JSON'))
    return supportedOperations
  }

  return {
    supports(operationId) {
      return operations().has(operationId)
    },
    execute(request) {
      return runBridge(javaPath, classpath, bridgeMain, request, timeoutMs)
    },
    reset() {},
  }
}

export const adapter = createJavaConformanceAdapter()
export default adapter
