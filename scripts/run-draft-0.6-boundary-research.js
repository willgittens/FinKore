// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { compareResults, isNormalizedResult } from '../runner/dist/index.js'
import { adapter as typescript } from '../implementations/typescript/adapters/conformance/dist/adapter.js'
import { adapter as python } from '../implementations/python/adapters/conformance/adapter.js'
import { adapter as java } from '../implementations/java/adapters/conformance/adapter.js'

const corpusPath = 'docs/research/draft-0.6-boundary-corpus.json'
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'))
const jsonOutput = process.argv.includes('--json')

const adapters = { typescript, python, java }

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function loadManifestVectors() {
  const manifest = readJson('conformance/manifest.json')
  return new Map(manifest.suites.flatMap((suite) =>
    suite.vectorFiles.flatMap((relativePath) => {
      const vectorFile = readJson(join('conformance', relativePath.replace(/^\.\//, '')))
      return vectorFile.vectors.map((vector) => [vector.id, vector])
    }),
  ))
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stable(item)]),
    )
  }
  return value
}

function same(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right))
}

function requestFor(entry, vectors) {
  if (entry.sourceVectorId !== undefined) {
    const vector = vectors.get(entry.sourceVectorId)
    if (vector === undefined) throw new Error(`${entry.id}: source vector ${entry.sourceVectorId} was not found`)
    return {
      operationId: vector.operation,
      input: vector.input,
      ...(vector.context === undefined ? {} : { context: vector.context }),
      expected: vector.expected,
    }
  }
  return { operationId: entry.operation, input: entry.input, ...(entry.context === undefined ? {} : { context: entry.context }) }
}

async function observe(implementation, adapter, request) {
  const started = performance.now()
  try {
    if (!adapter.supports(request.operationId)) {
      return { implementation, outcome: 'UNSUPPORTED', durationMs: performance.now() - started }
    }
    await adapter.reset?.()
    const actual = await adapter.execute(request)
    if (!isNormalizedResult(actual)) {
      return { implementation, outcome: 'INVALID_NORMALIZED_RESULT', actual, durationMs: performance.now() - started }
    }
    return { implementation, outcome: 'RESULT', actual, durationMs: performance.now() - started }
  } catch (error) {
    return {
      implementation,
      outcome: 'INFRASTRUCTURE_ERROR',
      diagnostic: error instanceof Error ? error.message : String(error),
      durationMs: performance.now() - started,
    }
  }
}

function comparisonKey(observation) {
  return observation.outcome === 'RESULT'
    ? { outcome: observation.outcome, actual: observation.actual }
    : { outcome: observation.outcome, diagnostic: observation.diagnostic }
}

function validateCorpus() {
  const errors = []
  if (corpus.status !== 'NON_NORMATIVE_RESEARCH') errors.push('corpus status must be NON_NORMATIVE_RESEARCH')
  if (!Array.isArray(corpus.cases) || corpus.cases.length === 0) errors.push('corpus cases must be a non-empty array')
  const ids = new Set()
  for (const entry of corpus.cases ?? []) {
    if (ids.has(entry.id)) errors.push(`duplicate case ID ${entry.id}`)
    ids.add(entry.id)
    if (!['MATCH', 'DOCUMENTED_DIFFERENCE'].includes(entry.expectedRelation)) {
      errors.push(`${entry.id}: invalid expectedRelation`)
    }
    if (entry.expectedRelation === 'DOCUMENTED_DIFFERENCE' && !/^D06-[A-Z0-9-]+$/.test(entry.finding ?? '')) {
      errors.push(`${entry.id}: documented difference must name one D06 finding`)
    }
    if (!Array.isArray(entry.implementations) || entry.implementations.length < 2) {
      errors.push(`${entry.id}: at least two implementations are required`)
    } else if (entry.implementations.some((name) => !(name in adapters))) {
      errors.push(`${entry.id}: unknown implementation`)
    }
    if ((entry.sourceVectorId === undefined) === (entry.operation === undefined)) {
      errors.push(`${entry.id}: provide exactly one of sourceVectorId or operation`)
    }
  }
  if (errors.length > 0) throw new Error(`Invalid Draft 0.6 research corpus:\n- ${errors.join('\n- ')}`)
}

validateCorpus()
const vectors = loadManifestVectors()
const observations = []
const issues = []
let matchingCases = 0
let documentedDifferences = 0
let normativeSourceChecks = 0

for (const entry of corpus.cases) {
  const request = requestFor(entry, vectors)
  const results = []
  for (const implementation of entry.implementations) {
    results.push(await observe(implementation, adapters[implementation], request))
  }

  if (request.expected !== undefined) {
    normativeSourceChecks += results.length
    for (const result of results) {
      if (result.outcome !== 'RESULT') {
        issues.push(`${entry.id}: ${result.implementation} did not produce a result for normative source vector`)
      } else if (!compareResults(request.expected, result.actual).matches) {
        issues.push(`${entry.id}: ${result.implementation} disagreed with normative source vector ${entry.sourceVectorId}`)
      }
    }
  }

  const reference = comparisonKey(results[0])
  const matches = results.every((result) => same(reference, comparisonKey(result)))
  if (entry.expectedRelation === 'MATCH') {
    if (!matches) issues.push(`${entry.id}: unexpected cross-language difference`)
    else matchingCases += 1
  } else if (matches) {
    issues.push(`${entry.id}: expected documented difference ${entry.finding} was not observed`)
  } else {
    documentedDifferences += 1
  }
  observations.push({
    id: entry.id,
    category: entry.category,
    expectedRelation: entry.expectedRelation,
    ...(entry.finding === undefined ? {} : { finding: entry.finding }),
    matches,
    results,
  })
}

const totalExecutions = observations.reduce((total, entry) => total + entry.results.length, 0)
const infrastructureErrors = observations.flatMap((entry) => entry.results).filter((result) => result.outcome === 'INFRASTRUCTURE_ERROR').length
const unsupported = observations.flatMap((entry) => entry.results).filter((result) => result.outcome === 'UNSUPPORTED').length
const maximumDurationMs = Math.max(...observations.flatMap((entry) => entry.results.map((result) => result.durationMs)))
const report = {
  corpus: corpusPath,
  status: issues.length === 0 ? 'PASS' : 'FAIL',
  summary: {
    cases: observations.length,
    executions: totalExecutions,
    matchingCases,
    documentedDifferences,
    normativeSourceChecks,
    infrastructureErrors,
    unsupported,
    adapterTimeoutMs: corpus.adapterTimeoutMs,
    maximumObservedDurationMs: Math.round(maximumDurationMs * 100) / 100,
  },
  observations,
  issues,
}

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2))
} else {
  for (const observation of observations) {
    const label = observation.matches ? 'MATCH' : `DIFFERENCE ${observation.finding ?? 'UNRECORDED'}`
    console.log(`${label} ${observation.id}`)
  }
  console.log(`Draft 0.6 boundary research: ${report.status}`)
  console.log(`${report.summary.cases} cases; ${report.summary.executions} executions; ${matchingCases} matched cases; ${documentedDifferences} documented differences.`)
  console.log(`${normativeSourceChecks} normative source checks; ${infrastructureErrors} infrastructure errors; ${unsupported} unsupported.`)
  console.log(`Maximum observed execution ${report.summary.maximumObservedDurationMs} ms within ${corpus.adapterTimeoutMs} ms adapter timeout.`)
  for (const issue of issues) console.error(`- ${issue}`)
}

if (issues.length > 0) process.exit(1)
