// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'

function runJson(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    ...options,
  })
  if (result.error !== undefined) throw result.error
  if (result.status === 2) {
    process.stderr.write(result.stderr)
    process.exit(2)
  }
  try {
    return { status: result.status ?? 0, report: JSON.parse(result.stdout) }
  } catch (error) {
    process.stderr.write(result.stdout)
    process.stderr.write(result.stderr)
    throw new Error(`Could not parse conformance JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function conformance(adapter, extra = [], env = {}) {
  return runJson('node', [
    'runner/dist/cli/cli.js',
    '--manifest',
    'conformance/manifest.json',
    '--adapter',
    adapter,
    ...extra,
    '--json',
  ], { env: { ...process.env, ...env } })
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, stable(item)]))
  }
  return value
}

function same(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right))
}

function byVector(report) {
  return new Map(report.results.map((result) => [result.vectorId, result]))
}

function compareActuals(label, leftReport, rightReport, suite = null) {
  const right = byVector(rightReport)
  const differences = []
  for (const left of leftReport.results) {
    if (suite !== null && left.suiteId !== suite) continue
    const candidate = right.get(left.vectorId)
    if (candidate === undefined) {
      differences.push(`${label}: missing ${left.vectorId}`)
    } else if (left.status !== candidate.status || !same(left.actual, candidate.actual)) {
      differences.push(`${label}: ${left.vectorId}`)
    }
  }
  return differences
}

function expectCounts(label, counts, expected) {
  const mismatches = []
  for (const [key, value] of Object.entries(expected)) {
    if (counts[key] !== value) mismatches.push(`${label} ${key}: expected ${value}, got ${counts[key]}`)
  }
  return mismatches
}

const compileJava = spawnSync('npm', ['run', 'java:compile'], { cwd: process.cwd(), encoding: 'utf8' })
if (compileJava.error !== undefined) throw compileJava.error
if (compileJava.status !== 0) {
  process.stderr.write(compileJava.stdout)
  process.stderr.write(compileJava.stderr)
  process.exit(compileJava.status ?? 1)
}

const ts = conformance('implementations/typescript/adapters/conformance/dist/adapter.js')
const python = conformance('implementations/python/adapters/conformance/adapter.js')
const javaMoney = conformance('implementations/java/adapters/conformance/adapter.js', ['--suite', 'money'])
const javaFull = conformance('implementations/java/adapters/conformance/adapter.js')
const totalVectors = ts.report.summary.total
const moneyVectors = javaMoney.report.summary.total
const nonMoneyVectors = totalVectors - moneyVectors

const issues = [
  ...expectCounts('TypeScript summary', ts.report.summary, { total: totalVectors, passed: totalVectors, failed: 0, unsupported: 0, infrastructureErrors: 0 }),
  ...expectCounts('Python summary', python.report.summary, { total: totalVectors, passed: totalVectors, failed: 0, unsupported: 0, infrastructureErrors: 0 }),
  ...expectCounts('Java Money summary', javaMoney.report.summary, { total: moneyVectors, passed: moneyVectors, failed: 0, unsupported: 0, infrastructureErrors: 0 }),
  ...expectCounts('Java full-manifest unsupported-boundary summary', javaFull.report.summary, { total: totalVectors, passed: moneyVectors, failed: 0, unsupported: nonMoneyVectors, infrastructureErrors: 0 }),
  ...compareActuals('TypeScript/Python full-manifest actual mismatch', ts.report, python.report),
  ...compareActuals('TypeScript/Java Money actual mismatch', ts.report, javaMoney.report, 'money'),
]

const lines = [
  'Cross-language portability review passed.',
  `TypeScript: ${ts.report.summary.passed}/${ts.report.summary.total} vectors passed; mutation-sensitive ${ts.report.mutationSensitive.passed}/${ts.report.mutationSensitive.total}.`,
  `Python: ${python.report.summary.passed}/${python.report.summary.total} vectors passed; mutation-sensitive ${python.report.mutationSensitive.passed}/${python.report.mutationSensitive.total}.`,
  `Java Money: ${javaMoney.report.summary.passed}/${javaMoney.report.summary.total} vectors passed; mutation-sensitive ${javaMoney.report.mutationSensitive.passed}/${javaMoney.report.mutationSensitive.total}.`,
  `Java full-manifest boundary: ${javaFull.report.summary.passed} Money vectors passed and ${javaFull.report.summary.unsupported} non-Money vectors reported unsupported.`,
  'Observed actual-result differences requiring D05 findings: 0.',
]

if (issues.length > 0) {
  console.error('Draft 0.5 portability review failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log(lines.join('\n'))
