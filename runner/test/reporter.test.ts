// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { buildReport, exitCodeForReport, formatConsoleReport, formatJsonReport } from '../src/reporter.js'
import type { ExecutionResult, ExecutionStatus } from '../src/types/execution-result.js'
import type { ReportReproducibility } from '../src/types/report.js'

const reproducibility: ReportReproducibility = {
  manifest: {
    path: '/repo/conformance/manifest.json',
    finkoreConformance: '0.1',
    vectorSchema: './vector.schema.json',
    suites: [{ id: 'money', vectorFiles: ['./money/rounding.json'] }],
  },
  filters: { suites: [], tags: [], vectorIds: [] },
}

function result(status: ExecutionStatus, overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  return {
    vectorId: 'money.round.tie-001',
    suiteId: 'money',
    operationId: 'finkore.money.round',
    requirementIds: ['MONEY-ROUNDING-003'],
    tags: ['mutation-sensitive'],
    critical: true,
    status,
    expected: { status: 'success', value: 'expected' },
    ...overrides,
  }
}

describe('report aggregation', () => {
  it('counts every classification by suite, requirement, and mutation tag', () => {
    const report = buildReport([
      result('PASS'),
      result('FAIL', { vectorId: 'money.round.fail-001', actual: { status: 'success', value: 'actual' } }),
      result('UNSUPPORTED', { vectorId: 'money.round.unsupported-001' }),
      result('INFRASTRUCTURE_ERROR', { vectorId: 'money.round.crash-001' }),
      result('PASS', { vectorId: 'money.round.plain-001', tags: ['positive'] }),
    ], new Set(['MONEY-ROUNDING-003']), reproducibility)
    expect(report.summary).toEqual({ total: 5, passed: 2, failed: 1, unsupported: 1, infrastructureErrors: 1 })
    expect(report.finkoreCore).toBe('0.9-rc')
    expect(report.finkoreConformanceRunner).toBe('0.1')
    expect(report.reproducibility).toStrictEqual(reproducibility)
    expect(report.suites[0]?.counts).toEqual(report.summary)
    expect(report.requirements[0]?.counts).toEqual(report.summary)
    expect(report.mutationSensitive).toEqual({ total: 4, passed: 1, failed: 1, unsupported: 1, infrastructureErrors: 1 })
    expect(report.criticalFailures).toHaveLength(3)
  })

  it('sorts requirements and records only exact critical failure identities', () => {
    const report = buildReport([
      result('FAIL', {
        vectorId: 'vector-x',
        requirementIds: ['Z-RULE-001', 'A-RULE-001'],
        critical: true,
      }),
    ], new Set(['A-RULE-001']), reproducibility)
    expect(report.requirements.map((entry) => entry.requirementId)).toEqual(['A-RULE-001', 'Z-RULE-001'])
    expect(report.criticalFailures).toStrictEqual([{ requirementId: 'A-RULE-001', vectorId: 'vector-x', status: 'FAIL' }])
  })

  it('surfaces critical failures in console and deterministic JSON', () => {
    const report = buildReport([result('FAIL', { diagnostic: 'different' })], new Set(['MONEY-ROUNDING-003']), reproducibility)
    const console = formatConsoleReport(report)
    expect(console).toContain('Core: 0.9-rc')
    expect(console).toContain('Manifest: /repo/conformance/manifest.json')
    expect(console).toContain('CRITICAL CONFORMANCE FAILURE')
    expect(console).toContain('MONEY-ROUNDING-003')
    expect(console).toContain('different')
    expect(JSON.parse(formatJsonReport(report))).toEqual(report)
  })

  it.each([
    [['PASS'], 0],
    [['UNSUPPORTED'], 3],
    [['FAIL', 'UNSUPPORTED'], 1],
    [['INFRASTRUCTURE_ERROR', 'FAIL', 'UNSUPPORTED'], 2],
  ] as const)('uses documented exit precedence %#', (statuses, expected) => {
    expect(exitCodeForReport(buildReport(statuses.map((status) => result(status)), new Set(), reproducibility))).toBe(expected)
  })
})
