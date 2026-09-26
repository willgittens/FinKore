// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, ApprovalDecision, ApprovalDecisionHistory } from '../../src/index.js'

const requirement = { id: 'r', subject: { type: 'invoice', id: 'i' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' } as const
const decision = { requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', subjectFacts: { revision: 1 }, decidedAt: '2026-09-01T00:00:00Z' } as const
const expiry = '2026-09-26T10:00:00.123456789Z'
const invalidTimes: unknown[] = [undefined, null, '', true, 42, [], {}, 'invalid', '2026-02-30T00:00:00Z', '2026-09-26T10:00:00-00:00', '2026-09-26T10:00:00.1234567890Z']
const composition = ApprovalComposition.from({ rootGroup: 'root', groups: [{ id: 'root', kind: 'ANY_OF', members: [
  { type: 'requirement', id: 'one', requirementId: 'r' }, { type: 'requirement', id: 'two', requirementId: 's' },
] }] })
const observation = { id: 'r', applicability: 'APPLICABLE', state: 'APPROVED', requiresEvaluationContext: true } as const
const pending = { id: 's', applicability: 'APPLICABLE', state: 'PENDING' } as const
const error = (code: string) => expect.objectContaining({ code: `FINKORE_APPROVAL_${code}` })

describe('concrete Approval evaluation', () => {
  it('validates concrete association and eligibility before facts and expiry', () => {
    expect(ApprovalDecision.evaluate(requirement, decision, decision.subjectFacts)).toBe('EFFECTIVE')
    expect(ApprovalDecision.evaluate(requirement, decision, { revision: 2 })).toBe('INEFFECTIVE')
    for (const req of [{ ...requirement, id: 'other' }, { ...requirement, subject: null }, { ...requirement, eligibleActors: [] }]) {
      expect(() => ApprovalDecision.evaluate(req, decision, decision.subjectFacts)).toThrowError(error('INVALID_DECISION'))
    }
    expect(() => ApprovalDecision.evaluate({ ...requirement, eligibleActors: ['bob'] }, decision, decision.subjectFacts)).toThrowError(error('INELIGIBLE_ACTOR'))
  })
  for (const evaluatedAt of invalidTimes) it(`rejects invalid required context ${JSON.stringify(evaluatedAt)}`, () => {
    expect(() => ApprovalDecision.evaluate(requirement, { ...decision, expiresAt: expiry }, decision.subjectFacts, undefined, evaluatedAt)).toThrowError(error('INVALID_CONTEXT'))
    expect(() => composition.evaluate({ requirements: [observation, pending], context: { evaluatedAt } })).toThrowError(error('INVALID_CONTEXT'))
  })
  it('compares expiration at nanosecond precision and equivalent offsets', () => {
    const expiring = { ...decision, expiresAt: expiry }
    expect(ApprovalDecision.evaluate(requirement, expiring, decision.subjectFacts, undefined, '2026-09-26T12:00:00.123456788+02:00')).toBe('EFFECTIVE')
    for (const time of [expiry, '2026-09-26T12:00:00.123456789+02:00', '2026-09-26T10:00:00.123456790Z']) {
      expect(ApprovalDecision.evaluate(requirement, expiring, decision.subjectFacts, undefined, time)).toBe('INEFFECTIVE')
    }
    expect(composition.evaluate({ requirements: [observation, pending], context: { evaluatedAt: expiry } })).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })
  it('enforces applicability, context, then state priority independent of member order', () => {
    for (const requirements of [[observation, { id: 's' }], [{ id: 's' }, observation]]) {
      expect(() => composition.evaluate({ requirements: requirements as unknown as Parameters<ApprovalComposition['evaluate']>[0]['requirements'] })).toThrowError(error('CONDITION_UNRESOLVED'))
      expect(() => composition.evaluate({ requirements: requirements.map(r => ({ ...r, applicability: 'APPLICABLE' })) })).toThrowError(error('INVALID_CONTEXT'))
      expect(() => composition.evaluate({ requirements: requirements.map(r => ({ ...r, applicability: 'APPLICABLE' })), context: { evaluatedAt: expiry } })).toThrowError(error('INVALID_CHAIN'))
    }
    expect(composition.evaluate({ requirements: [{ ...observation, applicability: 'NOT_APPLICABLE' }, pending] })).toEqual({ outcome: 'PENDING', actionableRequirements: ['s'] })
  })
  it('validates later considered expiration before decisive rejection and preserves history', () => {
    const rejected = { ...decision, outcome: 'REJECTED' }
    const expiring = { ...decision, expiresAt: expiry, subjectFacts: { revision: 0 } }
    for (const decisions of [[rejected, expiring], [expiring, rejected]]) {
      const history = ApprovalDecisionHistory.create(decisions)
      const before = history.toJSON()
      expect(() => history.evaluateRequirement(requirement, { currentSubjectFacts: decision.subjectFacts })).toThrowError(error('INVALID_CONTEXT'))
      expect(history.evaluateRequirement(requirement, { currentSubjectFacts: decision.subjectFacts, evaluatedAt: expiry })).toBe('REJECTED')
      expect(history.toJSON()).toEqual(before)
    }
  })
  it('reuses superseded history across Requirements without changing prior evidence', () => {
    const other = { ...requirement, id: 'other' }
    const second = { ...decision, requirementId: 'other' }
    const history = ApprovalDecisionHistory.create().record(requirement, decision).record(other, second)
    const ref = (requirementId: string) => ({ requirementId, actorId: 'alice', decidedAt: decision.decidedAt })
    history.supersedeDecision({ target: ref('r'), successor: ref('other'), actor: { id: 'alice' }, recordedAt: expiry })
    const before = history.toJSON()
    const next = ApprovalDecisionHistory.create(before).record(requirement, { ...decision, decidedAt: expiry })
    expect(next.evaluateRequirement(requirement)).toBe('APPROVED')
    expect(next.evaluateRequirement(other)).toBe('APPROVED')
    expect(next.lifecycleEvents()).toEqual(before.lifecycle)
    expect(history.toJSON()).toEqual(before)
    expect(history.evaluateRequirement(requirement)).toBe('PENDING')
    expect(() => next.supersedeDecision({ target: ref('r'), successor: ref('other'), actor: { id: 'alice' }, recordedAt: expiry })).toThrowError(error('INVALID_DECISION'))
    expect(next.decisions()).toEqual([...before.history, { ...decision, decidedAt: expiry }])
    expect(next.lifecycleEvents()).toEqual(before.lifecycle)
  })
})

for (const excluded of ['unrelated', 'withdrawn', 'superseded', 'requirement-superseded', 'no-expiry']) it(`excluded context ${excluded}`, () => {
  const expiring = { ...decision, expiresAt: expiry, ...(excluded === 'unrelated' ? { requirementId: 'other' } : {}) }
  const first = excluded === 'no-expiry' ? decision : expiring
  const history = ApprovalDecisionHistory.create([first])
  const target = { requirementId: 'r', actorId: 'alice', decidedAt: decision.decidedAt }
  const actor = { id: 'alice' }
  if (excluded === 'withdrawn') history.withdraw(requirement, { target, actor, recordedAt: expiry })
  if (excluded === 'superseded') {
    const successor = { ...decision, decidedAt: expiry }
    history.record(requirement, successor).supersedeDecision({ target, successor: { ...target, decidedAt: expiry }, actor, recordedAt: expiry })
  }
  if (excluded === 'requirement-superseded') history.supersedeRequirement({ targetRequirementId: 'r', successorRequirementId: 'other', actor, recordedAt: expiry })
  const before = history.toJSON()
  expect(history.evaluateRequirement(requirement)).toBe(excluded === 'no-expiry' || excluded === 'superseded' ? 'APPROVED' : 'PENDING')
  expect(history.toJSON()).toEqual(before)
})
it('Requirement supersession leaves another Requirement effective', () => {
  const other = { ...requirement, id: 'other' }
  const history = ApprovalDecisionHistory.create().record(other, { ...decision, requirementId: 'other' })
  history.supersedeRequirement({ targetRequirementId: 'r', successorRequirementId: 'next', actor: { id: 'alice' }, recordedAt: expiry })
  expect(history.evaluateRequirement(other)).toBe('APPROVED')
})
it('rejects array-shaped lifecycle requests even with event properties', () => {
  const history = ApprovalDecisionHistory.create([decision])
  const event = { target: { requirementId: 'r', actorId: 'alice', decidedAt: decision.decidedAt }, actor: { id: 'alice' }, recordedAt: expiry }
  expect(() => history.withdraw(requirement, Object.assign([], event))).toThrowError(error('INVALID_DECISION'))
  expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: [Object.assign([], { ...event, type: 'WITHDRAWN' })] })).toThrowError(error('INVALID_DECISION'))
  expect(history.toJSON()).toEqual({ history: [decision] })
})
it('evaluates a rejecting quorum vote and requires explicit vote evidence', () => {
  const quorum = ApprovalComposition.from({ rootGroup: 'q', groups: [{ id: 'q', kind: 'N_OF_M', threshold: 1,
    members: [{ id: 'v', type: 'requirement', requirementId: 'r', voter: { id: 'alice' } }],
  }] })
  const requirements = [{ ...requirement, applicability: 'APPLICABLE' }] as const
  expect(quorum.evaluate({ requirements })).toEqual({ outcome: 'PENDING', actionableRequirements: ['r'] })
  expect(quorum.evaluate({ requirements, decisions: [{ requirementId: 'r', actor: { id: 'alice' }, outcome: 'REJECTED', effective: true }] })).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  expect(composition.evaluate({ requirements: [{ ...observation, ...requirement }, pending], context: { evaluatedAt: expiry } })).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
})
it('lifecycle references compare by instant, retain spelling, and distinguish nanoseconds', () => {
  const ref = (decidedAt: string) => ({ requirementId: 'r', actorId: 'alice', decidedAt })
  const event = { type: 'WITHDRAWN', target: ref('2026-09-01T02:00:00+02:00'), actor: { id: 'alice' }, recordedAt: expiry }
  const source = { history: [decision], lifecycle: [event] }
  const history = ApprovalDecisionHistory.create(source)
  expect(history.evaluateRequirement(requirement)).toBe('PENDING')
  expect(history.toJSON()).toEqual(source)
  expect(() => ApprovalDecisionHistory.create({ ...source, history: [decision, { ...decision, decidedAt: event.target.decidedAt }] })).toThrowError(error('INVALID_DECISION'))
  expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: [{ ...event, type: 'DECISION_SUPERSEDED', successor: ref(decision.decidedAt) }] })).toThrowError(error('INVALID_DECISION'))
  const nano = ApprovalDecisionHistory.create([
    { ...decision, decidedAt: '2026-09-01T00:00:00.000000001Z' },
    { ...decision, decidedAt: '2026-09-01T00:00:00.000000002Z' },
  ]).withdraw(requirement, { ...event, target: ref('2026-09-01T02:00:00.000000001+02:00') })
  expect(nano.evaluateRequirement(requirement)).toBe('APPROVED')
})
it('rejects callable lifecycle candidates with attached event properties', () => {
  const history = ApprovalDecisionHistory.create([decision])
  const event = Object.assign(() => undefined, { target: { requirementId: 'r', actorId: 'alice', decidedAt: decision.decidedAt }, actor: { id: 'alice' }, recordedAt: expiry })
  expect(() => history.withdraw(requirement, event)).toThrowError(error('INVALID_DECISION'))
  expect(history.toJSON()).toEqual({ history: [decision] })
})
