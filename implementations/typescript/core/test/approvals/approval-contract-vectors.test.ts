// SPDX-License-Identifier: MPL-2.0
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { ApprovalCondition, ApprovalDecision, ApprovalDecisionHistory, ApprovalChain } from '../../src/index.js'

interface Vector {
  id: string
  operation: string
  input: Record<string, unknown>
  expected: { status: 'success'; value: unknown } | { status: 'error'; error: { code: string } }
}
let root = import.meta.dirname
while (!existsSync(resolve(root, 'conformance/manifest.json'))) {
  const parent = resolve(root, '..')
  if (parent === root) throw new Error('Conformance manifest not found')
  root = parent
}
const manifest = JSON.parse(readFileSync(resolve(root, 'conformance/manifest.json'), 'utf8')) as { suites: { vectorFiles: string[] }[] }
const vectors = manifest.suites.flatMap(s => s.vectorFiles).flatMap(file =>
  (JSON.parse(readFileSync(resolve(root, 'conformance', file), 'utf8')) as { vectors: Vector[] }).vectors,
).filter(v => v.operation.startsWith('approval.') && v.operation !== 'approval.composition.evaluate')
if (!vectors.length) throw new Error('No Approval vectors discovered')
for (const v of vectors) it(v.id, () => {
  const input = structuredClone(v.input)
  const before = structuredClone(input)
  const invoke = () => {
    const history = () => ApprovalDecisionHistory.from(input.history)
    switch (v.operation) {
      case 'approval.decision.record': return history().record(input.requirement, input.decision).toJSON()
      case 'approval.decision.withdraw': return history().withdraw(input.requirement, input.withdrawal).toJSON()
      case 'approval.decision.supersede': return history().supersedeDecision(input.supersession).toJSON()
      case 'approval.requirement.supersede': return history().supersedeRequirement(input.supersession).toJSON()
      case 'approval.decision.evaluate': return ApprovalDecision.evaluate(input.requirement, input.decision, input.currentSubjectFacts, input.relevantFactPaths as readonly string[] | undefined, input.evaluatedAt)
      case 'approval.requirement.evaluate': return ApprovalDecisionHistory.from(input.decisions).evaluateRequirement(input.requirement, input)
      case 'approval.condition.evaluate': return ApprovalCondition.from(input.condition).evaluate(input)
      case 'approval.chain.evaluate': return ApprovalChain.from(input.chain).evaluate(input.states)
      default: throw new Error('Unknown Approval operation')
    }
  }
  try {
    if (v.expected.status === 'success') expect(invoke()).toEqual(v.expected.value)
    else expect(invoke).toThrowError(expect.objectContaining({ code: v.expected.error.code }))
  } finally { expect(input).toEqual(before) }
})

it('validates native declaration objects and preserves condition identity', () => {
  expect(() => ApprovalCondition.from(null)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
  expect(() => ApprovalDecision.evaluate(null, {}, null)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
  const condition = ApprovalCondition.from({ id: ' invoice.review ', requiredFacts: ['invoice.amount'], evaluation: 'external' })
  expect(condition.id).toBe(' invoice.review ')
})
