// SPDX-License-Identifier: MPL-2.0
/**
 * Reconstructs and expands the Core 0.9.7 deterministic boundary investigation.
 * Reads manifest fixtures and built adapters from --root, executes isolated JSON
 * requests, and writes observations to --output. It changes no implementation,
 * defines no financial behavior, and does not infer correctness from agreement.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { isDeepStrictEqual } from 'node:util'

export function manifestVectors(root) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8'))
  return manifest.suites.flatMap(suite => suite.vectorFiles.flatMap(file =>
    JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')).vectors))
}

export function memberPaths(value, depth = 3, expanded = false, prefix = []) {
  if (value === null || typeof value !== 'object' || prefix.length === depth) return []
  const keys = Array.isArray(value)
    ? (expanded ? [...new Set([0, value.length - 1])].filter(i => i >= 0 && i < value.length) : value.length ? [0] : [])
    : Object.keys(value).slice(0, 100)
  return keys.flatMap(key => {
    const path = [...prefix, key]
    return [path, ...memberPaths(value[key], depth, expanded, path)]
  })
}

export function explorationCases(vectors, mode = 'original') {
  const operations = [...new Set(vectors.map(v => v.operation))]
  const cases = []
  for (const operation of operations) {
    const candidates = vectors.filter(v => v.operation === operation)
    const successes = candidates.filter(v => v.expected.status === 'success')
    if (successes.length === 0) continue
    const first = successes[0]
    const seeds = mode === 'original' ? [first] : [...new Set([
      successes.at(-1), candidates.find(v => v.expected.status === 'error'),
    ].filter(Boolean))]
    for (const seed of seeds) {
      const base = { seed: seed.id, operationId: operation, input: seed.input, ...(seed.context === undefined ? {} : { context: seed.context }) }
      cases.push({ ...base, id: `${seed.id}/control`, path: [], mutation: 'control', expected: seed.expected })
      let paths = memberPaths(seed.input, mode === 'original' ? 3 : 6, mode !== 'original')
      // The expansion samples deep first/last positions as well as top-level
      // boundaries; the original reconstruction has no path-count limit.
      if (mode !== 'original' && paths.length > 24) {
        paths = [...new Map([...paths.slice(0, 8), ...paths.filter(p => p.length > 3).slice(-8), ...paths.slice(-8)].map(p => [JSON.stringify(p), p])).values()]
      }
      for (const path of paths) for (const [mutation, replacement] of [
        ['null', null], ['object', {}], ['array', []], ['false', false], ['zero', 0], ['empty', ''], ['omit', undefined],
      ]) {
        if (mutation === 'omit' && typeof path.at(-1) === 'number') continue
        const input = JSON.parse(JSON.stringify(seed.input))
        let parent = input
        for (const key of path.slice(0, -1)) parent = parent[key]
        const key = path.at(-1)
        if (mutation === 'omit') delete parent[key]
        else Object.defineProperty(parent, key, { value: replacement, writable: true, enumerable: true, configurable: true })
        cases.push({ ...base, id: `${seed.id}/${JSON.stringify(path)}/${mutation}`, input, path, mutation })
      }
    }
  }
  return cases
}

async function executeCases({ root, runtime, cases }) {
  const directory = runtime === 'typescript' ? 'typescript' : runtime.startsWith('python') ? 'python' : 'java'
  const module = await import(pathToFileURL(resolve(root, `implementations/${directory}/adapters/conformance/${directory === 'typescript' ? 'dist/' : ''}adapter.js`)))
  const adapter = runtime.startsWith('python')
    ? module.createPythonConformanceAdapter({ pythonPath: resolve(root, `.tools/bin/${runtime}`) })
    : module.adapter
  const results = []
  for (const [index, candidate] of cases.entries()) {
    const request = JSON.parse(JSON.stringify({ operationId: candidate.operationId, input: candidate.input, ...(candidate.context === undefined ? {} : { context: candidate.context }) }))
    const before = JSON.parse(JSON.stringify(request))
    let result
    try {
      await adapter.reset?.()
      result = await adapter.execute(request)
    } catch (error) {
      result = { status: 'exception', name: error.name, message: error.message }
    }
    results.push({ id: candidate.id, result, inputUnchanged: isDeepStrictEqual(request, before) })
    if ((index + 1) % 250 === 0) parentPort?.postMessage({ progress: `${runtime}: ${index + 1}/${cases.length}` })
  }
  return results
}

async function main() {
  const args = process.argv.slice(2)
  const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
  const root = resolve(option('--root', '.'))
  const output = option('--output', undefined)
  if (!output) throw new Error('--output is required; investigation output is not a conformance oracle')
  const mode = option('--mode', 'original')
  if (!['original', 'expanded'].includes(mode)) throw new Error('Expected original or expanded mode')
  const cases = explorationCases(manifestVectors(root), mode)
  const runtimes = option('--runtimes', 'typescript,python3.12,python3.13,java').split(',')
  console.log(`${mode}: ${cases.length} cases, ${new Set(cases.map(c => c.operationId)).size} operations`)
  const observations = Object.fromEntries(await Promise.all(runtimes.map(runtime => new Promise((fulfill, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { root, runtime, cases } })
    worker.on('message', message => message.progress ? console.log(message.progress) : fulfill([runtime, message.results]))
    worker.on('error', reject)
    worker.on('exit', code => { if (code !== 0) reject(new Error(`${runtime} worker exited ${code}`)) })
  }))))
  const signatures = result => JSON.stringify([result.status, result.error?.code])
  const leads = cases.flatMap((candidate, index) => {
    const results = Object.fromEntries(runtimes.map(runtime => [runtime, observations[runtime][index]]))
    const values = Object.values(results)
    const statusDifference = new Set(values.map(v => signatures(v.result))).size > 1
    const fullDifference = values.some(v => !isDeepStrictEqual(v.result, values[0].result))
    const exception = values.some(v => v.result.status === 'exception')
    const mutated = values.some(v => !v.inputUnchanged)
    return statusDifference || fullDifference || exception || mutated ? [{ id: candidate.id, statusDifference, fullDifference, exception, mutated }] : []
  })
  writeFileSync(output, JSON.stringify({ mode, root, cases, observations, leads }, null, 2) + '\n')
  console.log(JSON.stringify({ cases: cases.length, leads: leads.length, statusOrException: leads.filter(l => l.statusDifference || l.exception).length, output }))
}

if (!isMainThread) parentPort.postMessage({ results: await executeCases(workerData) })
else if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main()
