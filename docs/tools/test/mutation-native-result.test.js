// SPDX-License-Identifier: MPL-2.0
/** Tests native mutation classification with synthetic reports; no effects or financial behavior. */
import assert from 'node:assert/strict'
import test from 'node:test'
import { assessNativeResult, nativeBaselinePassed } from '../mutation-native-result.js'

function captured(failed = true) {
  return { status: failed ? 1 : 0, stdout: JSON.stringify({
    summary: { total: 2, passed: failed ? 1 : 2, failed: failed ? 1 : 0, unsupported: 0, infrastructureErrors: 0 },
    results: [{ caseId: 'regression', status: failed ? 'FAIL' : 'PASS', failureKind: 'ASSERTION' },
      { caseId: 'control', status: 'PASS' }],
  }) }
}
const assess = (result) => assessNativeResult(result, 'regression', ['control']).killed

test('requires a named behavioral failure and a passing paired control', () => {
  assert.equal(assess(captured()), true)
  assert.equal(assess(captured(false)), false)
  for (const kind of ['ASSERTION', 'PORTABLE_ERROR_MISMATCH', 'UNEXPECTED_EXCEPTION', '', undefined]) {
    const result = captured(), report = JSON.parse(result.stdout)
    report.results[0].failureKind = kind
    result.stdout = JSON.stringify(report)
    assert.equal(assess(result), ['ASSERTION', 'PORTABLE_ERROR_MISMATCH'].includes(kind))
  }
})

test('rejects missing, duplicate, skipped, unrelated or failing controls and inconsistent summaries', () => {
  for (const mutate of [
    (r) => { r.results[0].caseId = 'unrelated' },
    (r) => { r.results[1].caseId = 'regression' },
    (r) => { r.results[1].status = 'FAIL'; r.results[1].failureKind = 'ASSERTION'; r.summary.failed = 2; r.summary.passed = 0 },
    (r) => { r.results[1].status = 'SKIPPED' },
    (r) => { r.results.pop() }, (r) => { r.results = [] },
    (r) => { r.summary.unsupported = 1 }, (r) => { r.summary.infrastructureErrors = 1 },
    (r) => { r.summary.total = 3 }, (r) => { r.summary.failed = 2 }, (r) => { r.summary.passed = 0 },
  ]) {
    const result = captured(), report = JSON.parse(result.stdout)
    mutate(report); result.stdout = JSON.stringify(report)
    assert.equal(assess(result), false)
  }
})

test('rejects malformed reports, compile failures, crashes, signals and wrong exit codes', () => {
  for (const override of [{ stdout: 'null' }, { stdout: '{' }, { stdout: '{}' },
    { status: 0 }, { status: 2 }, { status: null }, { signal: 'SIGTERM' }, { error: new Error('spawn') }]) {
    assert.equal(assess({ ...captured(), ...override }), false)
  }
})

test('baseline requires every distinct selected case to pass with exact successful totals', () => {
  assert.equal(nativeBaselinePassed(captured(false), ['regression', 'control']), true)
  assert.equal(nativeBaselinePassed(captured(), ['regression', 'control']), false)
  for (const cases of [[], ['regression'], ['regression', 'missing'], ['regression', 'regression']]) {
    assert.equal(nativeBaselinePassed(captured(false), cases), false)
  }
  for (const override of [{ status: 1 }, { signal: 'SIGTERM' }, { stdout: '{}' }, { stdout: 'invalid' }]) {
    assert.equal(nativeBaselinePassed({ ...captured(false), ...override }, ['regression', 'control']), false)
  }
})
