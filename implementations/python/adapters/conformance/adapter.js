// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const adapterDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(adapterDirectory, '../../../..')
const defaultBridgePath = process.env.FINKORE_PYTHON_BRIDGE_PATH ?? resolve(adapterDirectory, 'bridge.py')
const defaultPythonPath = process.env.FINKORE_PYTHON_PATH ?? resolve(repositoryRoot, '.tools/bin/python3.12')

function bridgeArgs(bridgePath, extraArgs = []) {
  const coverageRcfile = process.env.FINKORE_PYTHON_COVERAGE_RCFILE
  if (coverageRcfile !== undefined && coverageRcfile.length > 0) {
    return ['-m', 'coverage', 'run', '--parallel-mode', '--rcfile', coverageRcfile, bridgePath, ...extraArgs]
  }
  return [bridgePath, ...extraArgs]
}

function parseJson(text, diagnostic) {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`${diagnostic}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function runBridge(pythonPath, bridgePath, request, timeoutMs) {
  const child = spawnSync(pythonPath, bridgeArgs(bridgePath), {
    input: JSON.stringify(request),
    encoding: 'utf8',
    timeout: timeoutMs,
    cwd: repositoryRoot,
  })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) throw new Error(`Python bridge exited with ${child.status ?? 'unknown'}: ${child.stderr}`)
  if (child.stdout.trim().length === 0) throw new Error('Python bridge produced no response')
  const result = parseJson(child.stdout, 'Python bridge produced malformed JSON')
  if (result?.status === 'unsupported') return { status: 'unsupported' }
  return result
}

export function createPythonConformanceAdapter(options = {}) {
  const pythonPath = options.pythonPath ?? defaultPythonPath
  const bridgePath = options.bridgePath ?? defaultBridgePath
  const timeoutMs = options.timeoutMs ?? 5_000
  let supportedOperations

  function operations() {
    if (supportedOperations !== undefined) return supportedOperations
    const child = spawnSync(pythonPath, bridgeArgs(bridgePath, ['--operations']), {
      encoding: 'utf8',
      timeout: timeoutMs,
      cwd: repositoryRoot,
    })
    if (child.error !== undefined) throw child.error
    if (child.status !== 0) throw new Error(`Python bridge operation discovery exited with ${child.status ?? 'unknown'}: ${child.stderr}`)
    supportedOperations = new Set(parseJson(child.stdout, 'Python bridge operation discovery produced malformed JSON'))
    return supportedOperations
  }

  return {
    supports(operationId) {
      return operations().has(operationId)
    },
    execute(request) {
      return runBridge(pythonPath, bridgePath, request, timeoutMs)
    },
    reset() {},
  }
}

export const adapter = createPythonConformanceAdapter()
export default adapter
