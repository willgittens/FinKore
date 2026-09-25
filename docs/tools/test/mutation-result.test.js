// SPDX-License-Identifier: MPL-2.0
/**
 * Tests mutation gate classification using synthetic process reports.
 * Does not spawn processes or change files and defines no financial behavior.
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { assessMutationResult, conformanceBaselinePassed } from '../mutation-result.js'

function result(statuses = ['PASS', 'FAIL']) {
  const failed = statuses.filter((status) => status === 'FAIL').length
  return {
    status: failed ? 1 : 0,
    stdout: JSON.stringify({
      summary: { total: statuses.length, passed: statuses.length - failed, failed, unsupported: 0, infrastructureErrors: 0 },
      results: statuses.map((status, index) => ({ vectorId: `vector-${index}`, status })),
    }),
  }
}

test('accepts only the intended behavioral regression with paired controls', () => {
  assert.equal(assessMutationResult(result()).killed, false)
  assert.equal(assessMutationResult(result(), 'vector-1', ['vector-0']).killed, true)
  assert.equal(assessMutationResult(result(), 'vector-0', ['vector-0']).killed, false)
  assert.equal(assessMutationResult(result(), 'missing-vector', ['vector-0']).killed, false)
})

test('requires declared positive controls to execute and keep passing', () => {
  assert.equal(assessMutationResult(result(), 'vector-1', ['vector-0']).killed, true)
  assert.equal(assessMutationResult(result(), 'vector-1', ['vector-1']).killed, false)
  assert.equal(assessMutationResult(result(), 'vector-1', ['missing-vector']).killed, false)
})

test('passing or empty suites cannot kill a mutant', () => {
  assert.equal(assessMutationResult(result(['PASS'])).killed, false)
  assert.equal(assessMutationResult(result([])).killed, false)
})

test('process failures, signals and malformed output cannot kill a mutant', () => {
  for (const override of [
    { status: 2 }, { status: 3 }, { status: null }, { signal: 'SIGTERM' },
    { error: new Error('spawn failed') }, { stdout: 'SyntaxError' },
    { stdout: '{}' }, { stdout: 'null' },
  ]) assert.equal(assessMutationResult({ ...result(), ...override }, 'vector-1', ['vector-0']).killed, false)
})

test('infrastructure and unsupported outcomes cannot be hidden by a behavioral failure', () => {
  for (const status of ['INFRASTRUCTURE_ERROR', 'UNSUPPORTED', 'UNKNOWN']) {
    assert.equal(assessMutationResult(result(['FAIL', status]), 'vector-0', ['vector-1']).killed, false)
  }
})

test('inconsistent counts or exit codes cannot kill a mutant', () => {
  for (const field of ['total', 'passed', 'failed', 'unsupported', 'infrastructureErrors']) {
    const captured = result()
    const report = JSON.parse(captured.stdout)
    report.summary[field] += 1
    captured.stdout = JSON.stringify(report)
    assert.equal(assessMutationResult(captured, 'vector-1', ['vector-0']).killed, false)
  }
  assert.equal(assessMutationResult({ ...result(), status: 0 }).killed, false)
  assert.equal(assessMutationResult({ ...result(['PASS']), status: 1 }).killed, false)
})

test('duplicate identifiers cannot supply a failed regression and a passing control', () => {
  const captured = result(), report = JSON.parse(captured.stdout)
  report.results[0].vectorId = 'vector-1'
  captured.stdout = JSON.stringify(report)
  assert.equal(assessMutationResult(captured, 'vector-1', ['vector-0']).killed, false)
})

test('baseline requires valid all-pass reports including every named regression and control', () => {
  assert.equal(conformanceBaselinePassed(result(['PASS']), ['vector-0']), true)
  assert.equal(conformanceBaselinePassed(result(['PASS']), ['missing']), false)
  assert.equal(conformanceBaselinePassed(result()), false)
  assert.equal(conformanceBaselinePassed(result([])), false)
  assert.equal(conformanceBaselinePassed({ ...result(['PASS']), status: 1 }), false)
})

test('a targeted kill requires a named regression and at least one distinct control', () => {
  assert.equal(assessMutationResult(result()).killed, false)
  assert.equal(assessMutationResult(result(), 'vector-1').killed, false)
  assert.equal(assessMutationResult(result(), '', ['vector-0']).killed, false)
  assert.equal(assessMutationResult(result(), 'vector-1', ['vector-0']).killed, true)
})
