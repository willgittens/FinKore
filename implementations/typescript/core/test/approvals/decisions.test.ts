import { describe, expect, it } from 'vitest'
import {
  ApprovalDecision,
  ApprovalDecisionHistory,
  IneligibleApprovalActorError,
  InvalidApprovalDecisionError,
} from '../../src/index.js'

const requirement = {
  id: 'finance-review',
  subject: { type: 'invoice', id: 'inv-42' },
  eligibleActors: ['user-7'],
  approvedOutcome: 'APPROVED',
  rejectedOutcome: 'REJECTED',
}

const decision = {
  requirementId: 'finance-review',
  subjectFacts: {
    revision: '3',
    amount: { amount: '9000.00', currency: 'EUR' },
  },
  outcome: 'APPROVED',
  actor: { type: 'user', id: 'user-7' },
  decidedAt: '2026-09-01T12:00:00Z',
}

describe('Approval decisions', () => {
  it('records a valid decision without generating additional fields', () => {
    const history = ApprovalDecisionHistory.create()

    expect(history.record(requirement, decision)).toBe(history)
    expect(history.toJSON()).toEqual({ history: [decision] })
  })

  it('rejects PENDING and malformed timestamps as invalid decisions', () => {
    expect(() => ApprovalDecision.from(null)).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from([])).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, requirementId: '' })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, requirementId: 7 })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, actor: null })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, actor: { id: 7 } })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, actor: { id: 'user-7', type: '' } })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalDecision.from({ ...decision, actor: { id: 'user-7', type: 7 } })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalDecision.from({ ...decision, outcome: 'PENDING' })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, decidedAt: 7 })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, decidedAt: '2026-09-01T12:00:00' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalDecision.from({ ...decision, subjectFacts: undefined })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecision.from({ ...decision, subjectFacts: () => 'not portable' })).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('preserves optional actor type only when supplied', () => {
    const serialized = ApprovalDecision.from({ ...decision, actor: { id: 'user-7' } }).toJSON()

    expect(serialized).toEqual({
      ...decision,
      actor: { id: 'user-7' },
    })
    expect(Object.hasOwn(serialized.actor, 'type')).toBe(false)
    expect(ApprovalDecision.from(decision).actor).toEqual({ type: 'user', id: 'user-7' })
  })

  it('requires association with the correct requirement before committing', () => {
    const history = ApprovalDecisionHistory.create()

    expect(() => history.record(requirement, { ...decision, requirementId: 'manager-review' })).toThrow(
      InvalidApprovalDecisionError,
    )

    expect(history.toJSON()).toEqual({ history: [] })
  })

  it('rejects ineligible actors before committing', () => {
    const history = ApprovalDecisionHistory.create()

    expect(() => history.record(requirement, { ...decision, actor: { type: 'user', id: 'user-9' } })).toThrow(
      IneligibleApprovalActorError,
    )

    expect(history.toJSON()).toEqual({ history: [] })
  })

  it('preserves committed history when a later record attempt fails', () => {
    const history = ApprovalDecisionHistory.create([decision])

    expect(() => history.record(requirement, { ...decision, outcome: 'PENDING' })).toThrow(InvalidApprovalDecisionError)

    expect(history.toJSON()).toEqual({ history: [decision] })
  })

  it('evaluates a requirement as pending, approved, or rejected from effective associated decisions only', () => {
    expect(ApprovalDecisionHistory.create().evaluateRequirement(requirement)).toBe('PENDING')

    expect(ApprovalDecisionHistory.create([{ ...decision, requirementId: 'manager-review' }]).evaluateRequirement(requirement)).toBe(
      'PENDING',
    )

    expect(ApprovalDecisionHistory.create([decision]).evaluateRequirement(requirement)).toBe('APPROVED')
    expect(ApprovalDecisionHistory.create([{ ...decision, outcome: 'REJECTED' }]).evaluateRequirement(requirement)).toBe(
      'REJECTED',
    )
  })

  it('does not assume a decision remains effective after relevant subject facts change', () => {
    const approvalDecision = ApprovalDecision.from(decision)

    expect(
      approvalDecision.evaluateEffectiveness(
        { revision: '3', amount: { currency: 'EUR', amount: '9000.00' } },
        ['revision', 'amount'],
      ),
    ).toBe('EFFECTIVE')

    expect(
      approvalDecision.evaluateEffectiveness(
        { revision: '4', amount: { amount: '90000.00', currency: 'EUR' } },
        ['revision', 'amount'],
      ),
    ).toBe('INEFFECTIVE')

    expect(
      approvalDecision.evaluateEffectiveness(
        { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        ['revision', 'missingFact'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      approvalDecision.evaluateEffectiveness(
        { revision: '3', amount: { amount: '9000.00', currency: 'EUR' }, missingFact: undefined },
        ['revision', 'missingFact'],
      ),
    ).toBe('INEFFECTIVE')

    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { revision: '3' } }).evaluateEffectiveness(
        { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        ['revision', 'amount'],
      ),
    ).toBe('INEFFECTIVE')
  })

  it('uses current subject facts when evaluating requirement state', () => {
    const history = ApprovalDecisionHistory.create([decision])

    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('APPROVED')

    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '4', amount: { amount: '90000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('PENDING')
  })

  it('preserves stale historical decisions without treating them as current satisfaction', () => {
    const staleApproval = {
      ...decision,
      subjectFacts: { revision: '2', amount: { amount: '9000.00', currency: 'EUR' } },
    }
    const currentRejection = {
      ...decision,
      outcome: 'REJECTED',
      subjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const history = ApprovalDecisionHistory.create([staleApproval, currentRejection])

    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('REJECTED')
    expect(history.toJSON()).toEqual({ history: [staleApproval, currentRejection] })
  })

  it('validates relevant fact paths and requires every supplied path to match', () => {
    const approvalDecision = ApprovalDecision.from({
      ...decision,
      subjectFacts: {
        amount: { currency: 'EUR', amount: '9000.00' },
        revision: '3',
        approvals: ['manager', 'finance'],
      },
    })

    expect(() =>
      approvalDecision.evaluateEffectiveness(
        { amount: { amount: '9000.00', currency: 'EUR' }, revision: '3' },
        'revision' as never,
      ),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      approvalDecision.evaluateEffectiveness(
        { amount: { amount: '9000.00', currency: 'EUR' }, revision: '3' },
        [''] as never,
      ),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      approvalDecision.evaluateEffectiveness(
        { amount: { amount: '9000.00', currency: 'EUR' }, revision: '3' },
        ['revision', 7] as never,
      ),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      approvalDecision.evaluateEffectiveness(
        { amount: { amount: '9000.00', currency: 'EUR' }, revision: '3' },
        ['revision', ''] as never,
      ),
    ).toThrow(InvalidApprovalDecisionError)

    expect(
      approvalDecision.evaluateEffectiveness(
        {
          amount: { amount: '9000.00', currency: 'EUR' },
          revision: '3',
          approvals: ['manager', 'finance'],
        },
        ['revision', 'amount', 'approvals'],
      ),
    ).toBe('EFFECTIVE')
    expect(
      approvalDecision.evaluateEffectiveness(
        {
          amount: { amount: '9000.00', currency: 'EUR' },
          revision: '3',
          approvals: ['finance', 'manager'],
        },
        ['revision', 'amount', 'approvals'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      approvalDecision.evaluateEffectiveness(
        {
          amount: { amount: '9000.00', currency: 'EUR' },
          revision: '3',
          approvals: ['manager', 'other'],
        },
        ['revision', 'amount', 'approvals'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      approvalDecision.evaluateEffectiveness(
        {
          amount: { amount: '9000.00', currency: 'EUR' },
          revision: '3',
          approvals: ['manager'],
        },
        ['revision', 'amount', 'approvals'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      approvalDecision.evaluateEffectiveness(
        {
          amount: { amount: '9000.00', currency: 'EUR' },
          revision: '3',
          approvals: 'manager',
        },
        ['revision', 'amount', 'approvals'],
      ),
    ).toBe('INEFFECTIVE')
  })

  it('compares full subject facts when no relevant paths are supplied', () => {
    const approvalDecision = ApprovalDecision.from({
      ...decision,
      subjectFacts: { b: 2, a: { y: true, x: false } },
    })

    expect(approvalDecision.evaluateEffectiveness({ a: { x: false, y: true }, b: 2 })).toBe('EFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness({ a: { x: false, y: false }, b: 2 })).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness({ a: { x: false, y: true }, b: 3 })).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness({ c: { x: false, y: true }, b: 2 })).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness({ a: { x: false }, b: 2 })).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness({ a: { x: false, y: true }, b: 2, c: 3 })).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness([{ a: 1 }])).toBe('INEFFECTIVE')
    expect(approvalDecision.evaluateEffectiveness(7)).toBe('INEFFECTIVE')
    expect(ApprovalDecision.from({ ...decision, subjectFacts: [1, 2] }).evaluateEffectiveness([1])).toBe('INEFFECTIVE')
    expect(ApprovalDecision.from({ ...decision, subjectFacts: [1] }).evaluateEffectiveness([1, 2])).toBe('INEFFECTIVE')
    expect(ApprovalDecision.from({ ...decision, subjectFacts: [1, 2] }).evaluateEffectiveness('not-array')).toBe(
      'INEFFECTIVE',
    )
  })

  it('distinguishes JSON fact shapes when evaluating decision effectiveness', () => {
    expect(ApprovalDecision.from({ ...decision, subjectFacts: [] }).evaluateEffectiveness({})).toBe('INEFFECTIVE')
    expect(ApprovalDecision.from({ ...decision, subjectFacts: {} }).evaluateEffectiveness([])).toBe('INEFFECTIVE')
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { value: [] } }).evaluateEffectiveness({ value: {} })).toBe(
      'INEFFECTIVE',
    )
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { value: {} } }).evaluateEffectiveness({ value: [] })).toBe(
      'INEFFECTIVE',
    )
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { a: 1 } }).evaluateEffectiveness({ b: 1 })).toBe(
      'INEFFECTIVE',
    )
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { a: undefined } }).evaluateEffectiveness({ b: undefined })).toBe(
      'INEFFECTIVE',
    )
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { a: { b: false } } }).evaluateEffectiveness({ a: 1 })).toBe(
      'INEFFECTIVE',
    )
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: [false, 0, null, ''] } }).evaluateEffectiveness({
        facts: [false, 0, null, ''],
      }),
    ).toBe('EFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: [false, 0, null, ''] } }).evaluateEffectiveness({
        facts: [false, null, 0, ''],
      }),
    ).toBe('INEFFECTIVE')
  })

  it('rejects malformed imported decision history', () => {
    expect(() => ApprovalDecisionHistory.create('not-history' as never)).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecisionHistory.create([{ ...decision, actor: { id: '' } }])).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('defensively preserves committed decision state', () => {
    const mutableDecision = {
      requirementId: 'finance-review',
      subjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
      outcome: 'APPROVED',
      actor: { type: 'user', id: 'user-7' },
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const history = ApprovalDecisionHistory.create()

    history.record(requirement, mutableDecision)
    mutableDecision.subjectFacts.revision = '4'
    mutableDecision.actor.id = 'user-9'
    const snapshot = history.toJSON() as { history: [{ outcome: string; actor: { id: string } }] }
    snapshot.history[0].outcome = 'REJECTED'
    snapshot.history[0].actor.id = 'user-9'

    expect(history.toJSON()).toEqual({ history: [decision] })
  })
})
