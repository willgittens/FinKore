// SPDX-License-Identifier: MPL-2.0
import { RunnerInfrastructureError } from './errors/runner-errors.js'

export interface RunnerMetadata {
  readonly operationIds: ReadonlySet<string>
  readonly agenticOperationIds: ReadonlySet<string>
  readonly requirementIds: ReadonlySet<string>
  readonly criticalRequirementIds: ReadonlySet<string>
}

export const AGENTIC_OPERATION_IDS = new Set([
  'finkore.money.add',
  'finkore.money.subtract',
  'finkore.money.negate',
  'finkore.money.multiply',
  'finkore.money.divide',
  'finkore.money.compare',
  'finkore.money.round',
  'finkore.workflow.transition',
  'finkore.audit.append',
  'finkore.audit.replace',
  'finkore.audit.remove',
])

export const CONFORMANCE_OPERATION_IDS = new Set([
  ...AGENTIC_OPERATION_IDS,
  'money.deserialize',
  'money.serialize',
  'workflow.create',
  'money.rate.apply',
  'audit.redact',
  'approval.requirement.evaluate',
  'approval.decision.record',
  'approval.decision.evaluate',
  'approval.condition.evaluate',
  'approval.chain.evaluate',
  'entity.create',
  'entity.mutate',
  'entity.transition',
])

const REQUIREMENT_ROW = /^\|\s*([A-Z]+(?:-[A-Z]+)+-[0-9]{3})\s*\|/

export function parseTraceabilityMetadata(markdown: string): Pick<RunnerMetadata, 'requirementIds' | 'criticalRequirementIds'> {
  const requirementIds = new Set<string>()
  const criticalRequirementIds = new Set<string>()
  let inCriticalTable = false

  for (const line of markdown.split(/\r?\n/u)) {
    if (line === '## Critical financial requirements') {
      inCriticalTable = true
      continue
    }
    if (inCriticalTable && line.startsWith('## ')) inCriticalTable = false
    const match = REQUIREMENT_ROW.exec(line)
    const id = match?.[1]
    if (id === undefined) continue
    requirementIds.add(id)
    if (inCriticalTable) criticalRequirementIds.add(id)
  }

  if (requirementIds.size === 0) {
    throw new RunnerInfrastructureError('METADATA', 'Traceability metadata contains no requirement rows')
  }
  return { requirementIds, criticalRequirementIds }
}

export function createRunnerMetadata(traceabilityMarkdown: string): RunnerMetadata {
  return {
    operationIds: CONFORMANCE_OPERATION_IDS,
    agenticOperationIds: AGENTIC_OPERATION_IDS,
    ...parseTraceabilityMetadata(traceabilityMarkdown),
  }
}
