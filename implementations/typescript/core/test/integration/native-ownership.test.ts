// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { ApprovalDecisionHistory, ApprovalDecision, ApprovalComposition, WorkflowDefinition, FinancialEntity } from '../../src/index.js'
const requirement = { id: 'r', subject: { type: 'invoice', id: 'i' }, eligibleActors: ['a'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'r', actor: { id: 'a' }, outcome: 'APPROVED', decidedAt: '2026-09-01T00:00:00Z', subjectFacts: { value: 1 } }
const invalid = { code: 'FINKORE_APPROVAL_INVALID_DECISION' }
const cycle: unknown[] = []; cycle.push(cycle)
const values = [new Number(1), 1n, NaN, Infinity, new Date(0), new Map(), () => 1, undefined, cycle, new Array(1)]
for (const [index, value] of values.entries()) it(`native retention rejects unsupported Approval value ${index}`, () => {
  const history = ApprovalDecisionHistory.create().record(requirement, decision)
  const before = structuredClone(history.toJSON())
  const facts = { nested: [value] }
  expect(() => history.record(requirement, { ...decision, subjectFacts: facts })).toThrowError(expect.objectContaining(invalid))
  expect(() => ApprovalDecisionHistory.from([{ ...decision, subjectFacts: facts }])).toThrowError(expect.objectContaining(invalid))
  expect(() => ApprovalDecision.evaluate(requirement, decision, facts)).toThrowError(expect.objectContaining(invalid))
  expect(history.toJSON()).toEqual(before)
})
it('native retention captures shared supported Approval children independently', () => {
  const child = { value: [1, null, false] }
  const facts = { left: child, right: child, ['__proto__']: { amount: '1' } }
  const history = ApprovalDecisionHistory.create().record(requirement, { ...decision, subjectFacts: facts })
  const before = structuredClone(history.toJSON())
  child.value[0] = 99
  const observed = history.toJSON() as unknown as { history: { subjectFacts: { left: { value: unknown[] } } }[] }
  observed.history[0]!.subjectFacts.left.value[0] = 88
  expect(history.toJSON()).toEqual(before)
  expect(history.evaluateRequirement(requirement, { currentSubjectFacts: before.history[0]!.subjectFacts })).toBe('APPROVED')
})
it('native retention preserves composition evidence priority', () => {
  const composition = ApprovalComposition.from({ rootGroup: 'q', groups: [{ id: 'q', kind: 'N_OF_M', threshold: 1, members: [{ id: 'm', type: 'requirement', requirementId: 'r', voter: { id: 'a' } }] }] })
  const observation = { id: 'r', applicability: 'APPLICABLE', eligibleActors: ['a'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
  const evidence = { ...decision, effective: true, subjectFacts: { value: new Number(1) } }
  const invoke = (req: unknown) => composition.evaluate({ requirements: [req], decisions: [evidence] } as unknown as Parameters<ApprovalComposition['evaluate']>[0])
  expect(() => invoke(observation)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_CHAIN' }))
  expect(() => invoke({ ...observation, applicability: 'UNKNOWN' })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_CONDITION_UNRESOLVED' }))
  expect(() => invoke({ ...observation, requiresEvaluationContext: true })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_CONTEXT' }))
  const malformedRequirement = { ...observation, subjectFacts: { value: new Number(1) } }
  const invokeRequirement = (req: unknown) => composition.evaluate({ requirements: [req], decisions: [] } as unknown as Parameters<ApprovalComposition['evaluate']>[0])
  expect(() => invokeRequirement(malformedRequirement)).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_CHAIN' }))
  expect(() => invokeRequirement({ ...malformedRequirement, applicability: 'UNKNOWN' })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_CONDITION_UNRESOLVED' }))
  expect(() => invokeRequirement({ ...malformedRequirement, requiresEvaluationContext: true })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_CONTEXT' }))
})
for (const key of ['terminalStates', 'transitions']) it(`native retention requires explicit Workflow ${key} standalone and embedded`, () => {
  const workflow: Record<string, unknown> = { states: ['DRAFT'], initialState: 'DRAFT', terminalStates: [], transitions: [] }
  delete workflow[key]
  expect(() => WorkflowDefinition.from(workflow)).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_DEFINITION' }))
  expect(() => FinancialEntity.create({ type: 'invoice', identityScope: 'tenant', workflow, mutability: { DRAFT: ['memo'] } }, 'i', { memo: 'x' })).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_DEFINITION' }))
})

it('native retention supports null-prototype fact and guard records', () => {
  const facts = Object.assign(Object.create(null) as Record<string, unknown>, { value: [1, false, null] })
  const captured = ApprovalDecision.from({ ...decision, subjectFacts: facts })
  expect(captured.evaluateEffectiveness({ value: [1, false, null] })).toBe('EFFECTIVE')
  const bound = WorkflowDefinition.from({ states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE', guard: { fact: 'value', equals: facts } }] })
  expect(bound.transitionFrom('DRAFT', 'DONE')!.guards[0]!.equals).toEqual({ value: [1, false, null] })
  facts.value = 'changed'
  expect(captured.toJSON().subjectFacts).toEqual({ value: [1, false, null] })
})

it('native retention keeps missing nested facts ineffective without a runtime exception', () => {
  const captured = ApprovalDecision.from({ ...decision, subjectFacts: {} })
  expect(captured.evaluateEffectiveness({ invoice: { amount: 1 } }, ['invoice.amount'])).toBe('INEFFECTIVE')
  const nested = ApprovalDecision.from({ ...decision, subjectFacts: { invoice: { amount: 1 } } })
  expect(nested.evaluateEffectiveness({}, ['invoice.amount'])).toBe('INEFFECTIVE')
})
