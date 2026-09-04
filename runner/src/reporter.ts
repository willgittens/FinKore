import type { ConformanceReport, StatusCounts } from './types/report.js'
import type { ExecutionResult, ExecutionStatus } from './types/execution-result.js'

function emptyCounts(): { total: number; passed: number; failed: number; unsupported: number; infrastructureErrors: number } {
  return { total: 0, passed: 0, failed: 0, unsupported: 0, infrastructureErrors: 0 }
}

function addStatus(counts: ReturnType<typeof emptyCounts>, status: ExecutionStatus): void {
  counts.total += 1
  if (status === 'PASS') counts.passed += 1
  else if (status === 'FAIL') counts.failed += 1
  else if (status === 'UNSUPPORTED') counts.unsupported += 1
  else counts.infrastructureErrors += 1
}

export function buildReport(
  results: readonly ExecutionResult[],
  criticalRequirements: ReadonlySet<string>,
): ConformanceReport {
  const summary = emptyCounts()
  const mutationSensitive = emptyCounts()
  const suiteMap = new Map<string, ReturnType<typeof emptyCounts>>()
  const requirementMap = new Map<string, ReturnType<typeof emptyCounts>>()

  for (const result of results) {
    addStatus(summary, result.status)
    if (result.tags.includes('mutation-sensitive')) addStatus(mutationSensitive, result.status)
    const suiteCounts = suiteMap.get(result.suiteId) ?? emptyCounts()
    addStatus(suiteCounts, result.status)
    suiteMap.set(result.suiteId, suiteCounts)
    for (const requirementId of result.requirementIds) {
      const requirementCounts = requirementMap.get(requirementId) ?? emptyCounts()
      addStatus(requirementCounts, result.status)
      requirementMap.set(requirementId, requirementCounts)
    }
  }

  const suites = [...suiteMap].map(([suiteId, counts]) => ({ suiteId, counts }))
  const requirements = [...requirementMap]
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([requirementId, counts]) => ({
      requirementId,
      critical: criticalRequirements.has(requirementId),
      counts,
    }))
  const criticalFailures = results.flatMap((result) => {
    if (result.status === 'PASS') return []
    const status = result.status
    return result.requirementIds
      .filter((requirementId) => criticalRequirements.has(requirementId))
      .map((requirementId) => ({ requirementId, vectorId: result.vectorId, status }))
  })

  return {
    finkoreConformanceRunner: '0.1',
    summary,
    mutationSensitive,
    suites,
    requirements,
    criticalFailures,
    results,
  }
}

function countsLine(counts: StatusCounts): string {
  return `${counts.passed} passed, ${counts.failed} failed, ${counts.unsupported} unsupported, ${counts.infrastructureErrors} infrastructure errors`
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? String(value)
}

export function formatConsoleReport(report: ConformanceReport): string {
  const lines = ['FinKore Conformance', '']
  for (const suite of report.suites) {
    lines.push(suite.suiteId, `  ${countsLine(suite.counts)}`, '')
  }
  lines.push('Total', `  ${countsLine(report.summary)}`)

  const unsuccessful = report.results.filter((result) => result.status !== 'PASS')
  for (const result of unsuccessful) {
    lines.push(
      '',
      `${result.status === 'FAIL' ? '✗' : result.status === 'UNSUPPORTED' ? '-' : '!'} ${result.vectorId}`,
      '',
      'Operation:',
      result.operationId,
      '',
      'Requirements:',
      result.requirementIds.join(', '),
      '',
      'Expected:',
      formatJson(result.expected),
    )
    if (result.actual !== undefined) lines.push('', 'Actual:', formatJson(result.actual))
    if (result.diagnostic !== undefined) lines.push('', 'Diagnostic:', result.diagnostic)
  }

  for (const failure of report.criticalFailures) {
    lines.push(
      '',
      'CRITICAL CONFORMANCE FAILURE',
      '',
      'Requirement:',
      failure.requirementId,
      '',
      'Vector:',
      failure.vectorId,
      '',
      'Status:',
      failure.status,
    )
  }
  return lines.join('\n')
}

export function formatJsonReport(report: ConformanceReport): string {
  return `${JSON.stringify(report, null, 2)}\n`
}

export function exitCodeForReport(report: ConformanceReport): 0 | 1 | 2 | 3 {
  if (report.summary.infrastructureErrors > 0) return 2
  if (report.summary.failed > 0) return 1
  if (report.summary.unsupported > 0) return 3
  return 0
}
