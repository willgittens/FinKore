// SPDX-License-Identifier: MPL-2.0
/** Classifies native test reports without side effects or financial behavior. */
import { assessMutationResult } from './mutation-result.js'

export function assessNativeResult(result, expectedCase, controls) {
  let report
  try { report = JSON.parse(result.stdout) } catch { return { killed: false, reason: 'Malformed native report' } }
  if (!Array.isArray(report?.results) || report.results.some((row) =>
    !row || typeof row.caseId !== 'string' || !['PASS', 'FAIL'].includes(row.status)
    || (row.status === 'FAIL' && !['ASSERTION', 'PORTABLE_ERROR_MISMATCH'].includes(row.failureKind)))) {
    return { killed: false, reason: 'Unclassified native failure' }
  }
  return assessMutationResult({ ...result, stdout: JSON.stringify({
    summary: report.summary,
    results: report.results.map((row) => ({ vectorId: row.caseId, status: row.status })),
  }) }, expectedCase, controls)
}

export function nativeBaselinePassed(result, cases) {
  if (result.error || result.signal || result.status !== 0 || cases.length === 0) return false
  let report
  try { report = JSON.parse(result.stdout) } catch { return false }
  const rows = report?.results
  return Array.isArray(rows) && rows.length === cases.length
    && new Set(cases).size === cases.length
    && cases.every((id) => rows.filter((row) => row?.caseId === id && row.status === 'PASS').length === 1)
    && report.summary?.total === cases.length && report.summary.passed === cases.length
    && report.summary.failed === 0 && report.summary.infrastructureErrors === 0 && report.summary.unsupported === 0
}
