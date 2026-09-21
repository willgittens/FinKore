// SPDX-License-Identifier: MPL-2.0
/**
 * Classifies captured conformance output for local mutation verification.
 * Reads only the supplied result, has no side effects, and defines no financial behavior.
 */

export function assessMutationResult(result, expectedVector) {
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    return { killed: false, reason: 'Conformance process failed or reported infrastructure/unsupported results' }
  }
  let report
  try {
    report = JSON.parse(result.stdout)
  } catch {
    return { killed: false, reason: 'Conformance process did not return a JSON report' }
  }
  const rows = report?.results
  const summary = report?.summary
  if (!Array.isArray(rows) || rows.length === 0 || !summary
      || rows.some((row) => !row || typeof row.vectorId !== 'string' || !['PASS', 'FAIL'].includes(row.status))) {
    return { killed: false, reason: 'Missing, empty, or unsuccessful conformance results' }
  }
  const failed = rows.filter((row) => row.status === 'FAIL')
  if (summary.total !== rows.length || summary.failed !== failed.length
      || summary.passed !== rows.length - failed.length
      || summary.infrastructureErrors !== 0 || summary.unsupported !== 0
      || result.status !== (failed.length > 0 ? 1 : 0)) {
    return { killed: false, reason: 'Conformance counts or exit status do not match valid results' }
  }
  if (failed.length === 0) return { killed: false, reason: 'All vectors passed' }
  if (expectedVector !== undefined && !failed.some((row) => row.vectorId === expectedVector)) {
    return { killed: false, reason: `Expected regression did not fail: ${expectedVector}` }
  }
  return { killed: true, reason: expectedVector ?? `${failed.length} conformance vector(s) failed` }
}
