// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  ApprovalDecision,
  ApprovalDecisionHistory,
  IneligibleApprovalActorError,
  InvalidApprovalContextError,
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

  it('withdraws one decision without removing it from append-only history', () => {
    const withdrawal = {
      target: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    }
    const history = ApprovalDecisionHistory.create([decision])

    expect(history.withdraw(requirement, withdrawal)).toBe(history)
    expect(history.evaluateRequirement(requirement)).toBe('PENDING')
    expect(history.toJSON()).toEqual({
      history: [decision],
      lifecycle: [{ type: 'WITHDRAWN', ...withdrawal }],
    })
  })

  it('accepts lifecycle actors without optional type while preserving exact actor shape', () => {
    const withdrawal = {
      target: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      actor: { id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    }
    const history = ApprovalDecisionHistory.create([decision])

    history.withdraw(requirement, withdrawal)

    expect(history.toJSON()).toEqual({
      history: [decision],
      lifecycle: [{ type: 'WITHDRAWN', ...withdrawal }],
    })
    expect(Object.hasOwn((history.toJSON().lifecycle?.[0] as { actor: Record<string, unknown> }).actor, 'type')).toBe(false)
  })

  it('rejects duplicate, missing, ambiguous, and ineligible withdrawal requests without partial lifecycle state', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const withdrawal = {
      target,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    }
    const withdrawn = ApprovalDecisionHistory.create([decision]).withdraw(requirement, withdrawal)

    expect(() => withdrawn.withdraw(requirement, { ...withdrawal, recordedAt: '2026-09-03T12:00:00Z' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(withdrawn.toJSON()).toEqual({
      history: [decision],
      lifecycle: [{ type: 'WITHDRAWN', ...withdrawal }],
    })

    const missing = ApprovalDecisionHistory.create([decision])
    expect(() =>
      missing.withdraw(requirement, {
        ...withdrawal,
        target: { ...target, decidedAt: '2026-09-01T13:00:00Z' },
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(missing.toJSON()).toEqual({ history: [decision] })

    const ambiguous = ApprovalDecisionHistory.create([decision, decision])
    expect(() => ambiguous.withdraw(requirement, withdrawal)).toThrow(InvalidApprovalDecisionError)
    expect(ambiguous.toJSON()).toEqual({ history: [decision, decision] })

    const ineligible = ApprovalDecisionHistory.create([decision])
    expect(() =>
      ineligible.withdraw(requirement, {
        ...withdrawal,
        actor: { type: 'user', id: 'user-9' },
      }),
    ).toThrow(IneligibleApprovalActorError)
    expect(ineligible.toJSON()).toEqual({ history: [decision] })

    expect(() =>
      ApprovalDecisionHistory.create([decision]).withdraw(requirement, {
        ...withdrawal,
        actor: null,
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create([decision]).withdraw(requirement, {
        ...withdrawal,
        actor: { id: 'user-7', type: 7 },
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create([decision]).withdraw(requirement, {
        ...withdrawal,
        target: null,
      }),
    ).toThrow(InvalidApprovalDecisionError)
  })

  it('requires explicit evaluation instants for expiring decisions and applies an exclusive boundary', () => {
    const expiringDecision = {
      ...decision,
      expiresAt: '2026-09-02T12:00:00Z',
    }
    const history = ApprovalDecisionHistory.create([expiringDecision])

    expect(() => history.evaluateRequirement(requirement)).toThrow(InvalidApprovalContextError)
    expect(() => history.evaluateRequirement(requirement, { evaluatedAt: '2026-09-02T12:00:00' })).toThrow(
      InvalidApprovalContextError,
    )
    expect(history.evaluateRequirement(requirement, { evaluatedAt: '2026-09-02T11:59:59Z' })).toBe('APPROVED')
    expect(history.evaluateRequirement(requirement, { evaluatedAt: '2026-09-02T12:00:00Z' })).toBe('PENDING')
    expect(history.evaluateRequirement(requirement, { evaluatedAt: '2026-09-02T14:00:00+02:00' })).toBe('PENDING')
  })

  it('supersedes a decision while preserving target and successor decisions', () => {
    const earlierApproval = {
      ...decision,
      subjectFacts: { revision: '2', amount: { amount: '9000.00', currency: 'EUR' } },
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const laterApproval = {
      ...decision,
      subjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const supersession = {
      target: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      successor: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-02T12:00:00Z',
      },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    }
    const history = ApprovalDecisionHistory.create([earlierApproval, laterApproval])

    history.supersedeDecision(supersession)

    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '2', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('PENDING')
    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('APPROVED')
    expect(history.toJSON()).toEqual({
      history: [earlierApproval, laterApproval],
      lifecycle: [{ type: 'DECISION_SUPERSEDED', ...supersession }],
    })
  })

  it('imports withdrawal lifecycle events as append-only evidence without reactivating decisions', () => {
    const withdrawal = {
      type: 'WITHDRAWN',
      target: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    } as const
    const history = ApprovalDecisionHistory.create({ history: [decision], lifecycle: [withdrawal] })

    expect(history.evaluateRequirement(requirement)).toBe('PENDING')
    expect(history.toJSON()).toEqual({ history: [decision], lifecycle: [withdrawal] })

    const snapshot = history.toJSON() as { lifecycle: [{ actor: { id: string }; target: { actorId: string } }] }
    snapshot.lifecycle[0].actor.id = 'user-9'
    snapshot.lifecycle[0].target.actorId = 'user-9'

    expect(history.toJSON()).toEqual({ history: [decision], lifecycle: [withdrawal] })
  })

  it('supersedes a requirement without transferring its decisions to the successor requirement', () => {
    const successorRequirement = {
      ...requirement,
      id: 'controller-review',
      eligibleActors: ['user-7'],
    }
    const history = ApprovalDecisionHistory.create([decision])

    history.supersedeRequirement({
      targetRequirementId: 'finance-review',
      successorRequirementId: 'controller-review',
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    })

    expect(history.evaluateRequirement(requirement)).toBe('PENDING')
    expect(history.evaluateRequirement(successorRequirement)).toBe('PENDING')
    expect(history.decisions()).toEqual([decision])
  })

  it('imports decision and requirement supersession lifecycle events with current effectiveness semantics', () => {
    const earlierApproval = {
      ...decision,
      subjectFacts: { revision: '2', amount: { amount: '9000.00', currency: 'EUR' } },
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const laterApproval = {
      ...decision,
      subjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const decisionSupersession = {
      type: 'DECISION_SUPERSEDED',
      target: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      successor: {
        requirementId: 'finance-review',
        actorId: 'user-7',
        decidedAt: '2026-09-02T12:00:00Z',
      },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    } as const
    const requirementSupersession = {
      type: 'REQUIREMENT_SUPERSEDED',
      targetRequirementId: 'finance-review',
      successorRequirementId: 'controller-review',
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-03T12:30:00Z',
    } as const

    const decisionHistory = ApprovalDecisionHistory.create({
      history: [earlierApproval, laterApproval],
      lifecycle: [decisionSupersession],
    })
    expect(
      decisionHistory.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '2', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('PENDING')
    expect(
      decisionHistory.evaluateRequirement(requirement, {
        currentSubjectFacts: { revision: '3', amount: { amount: '9000.00', currency: 'EUR' } },
        relevantFactPaths: ['revision', 'amount'],
      }),
    ).toBe('APPROVED')
    expect(decisionHistory.toJSON()).toEqual({
      history: [earlierApproval, laterApproval],
      lifecycle: [decisionSupersession],
    })

    const requirementHistory = ApprovalDecisionHistory.create({
      history: [decision],
      lifecycle: [requirementSupersession],
    })
    expect(requirementHistory.evaluateRequirement(requirement)).toBe('PENDING')
    expect(
      requirementHistory.evaluateRequirement({
        ...requirement,
        id: 'controller-review',
      }),
    ).toBe('PENDING')
    expect(requirementHistory.toJSON()).toEqual({ history: [decision], lifecycle: [requirementSupersession] })
  })

  it('rejects malformed imported lifecycle history before accepting partial lifecycle state', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const successor = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const validWithdrawal = {
      type: 'WITHDRAWN',
      target,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    }

    expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: validWithdrawal })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: [null] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() =>
      ApprovalDecisionHistory.create({ history: [decision], lifecycle: [{ ...validWithdrawal, type: 'VOID' }] }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'VOID',
            targetRequirementId: 'finance-review',
            successorRequirementId: 'controller-review',
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({ history: [decision], lifecycle: [{ ...validWithdrawal, actor: { id: '' } }] }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...validWithdrawal, actor: { id: 'user-7', type: '' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...validWithdrawal, recordedAt: '2026-09-02T12:00:00' }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...validWithdrawal, target: { ...target, actorId: '' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({ history: [decision], lifecycle: [{ ...validWithdrawal, successor }] }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...validWithdrawal, targetRequirementId: 'finance-review' }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...validWithdrawal, successorRequirementId: 'controller-review' }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'REQUIREMENT_SUPERSEDED',
            targetRequirementId: 'finance-review',
            successorRequirementId: 'controller-review',
            successor,
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'DECISION_SUPERSEDED',
            target,
            successor: target,
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'DECISION_SUPERSEDED',
            target,
            successor,
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
            targetRequirementId: 'finance-review',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'REQUIREMENT_SUPERSEDED',
            targetRequirementId: 'finance-review',
            successorRequirementId: 'finance-review',
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [
          {
            type: 'REQUIREMENT_SUPERSEDED',
            targetRequirementId: 'finance-review',
            successorRequirementId: 'controller-review',
            target,
            actor: { type: 'user', id: 'user-7' },
            recordedAt: '2026-09-02T12:30:00Z',
          },
        ],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: [validWithdrawal] }).toJSON()).not.toThrow()
    expect(ApprovalDecisionHistory.create({ history: [decision] }).toJSON()).toEqual({ history: [decision] })
  })

  it('resolves decision lifecycle references by requirement, actor, and timestamp together', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const sameInstantOtherActor = {
      ...decision,
      actor: { type: 'user', id: 'user-9' },
    }
    const sameInstantOtherRequirement = {
      ...decision,
      requirementId: 'controller-review',
    }
    const broadenedRequirement = {
      ...requirement,
      eligibleActors: ['user-7', 'user-9'],
    }

    expect(
      ApprovalDecisionHistory.create([decision, sameInstantOtherActor])
        .withdraw(broadenedRequirement, {
          target,
          actor: { type: 'user', id: 'user-7' },
          recordedAt: '2026-09-02T12:00:00Z',
        })
        .evaluateRequirement(broadenedRequirement),
    ).toBe('APPROVED')
    expect(
      ApprovalDecisionHistory.create([decision, sameInstantOtherRequirement])
        .withdraw(requirement, {
          target,
          actor: { type: 'user', id: 'user-7' },
          recordedAt: '2026-09-02T12:00:00Z',
        })
        .evaluateRequirement(requirement),
    ).toBe('PENDING')
  })

  it('rejects lifecycle operations evaluated against a different requirement even when the target decision exists', () => {
    const controllerRequirement = {
      ...requirement,
      id: 'controller-review',
    }
    const controllerDecision = {
      ...decision,
      requirementId: 'controller-review',
    }
    const history = ApprovalDecisionHistory.create([controllerDecision])

    expect(() =>
      history.withdraw(requirement, {
        target: {
          requirementId: 'controller-review',
          actorId: 'user-7',
          decidedAt: '2026-09-01T12:00:00Z',
        },
        actor: { type: 'user', id: 'user-7' },
        recordedAt: '2026-09-02T12:00:00Z',
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(history.toJSON()).toEqual({ history: [controllerDecision] })
    expect(history.withdraw(controllerRequirement, {
      target: {
        requirementId: 'controller-review',
        actorId: 'user-7',
        decidedAt: '2026-09-01T12:00:00Z',
      },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    })).toBe(history)
  })

  it('rejects imported lifecycle events that do not resolve exactly once or duplicate prior invalidation', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const laterApproval = {
      ...decision,
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const successor = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const withdrawal = {
      type: 'WITHDRAWN',
      target,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:00:00Z',
    } as const
    const supersession = {
      type: 'DECISION_SUPERSEDED',
      target,
      successor,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    } as const
    const requirementSupersession = {
      type: 'REQUIREMENT_SUPERSEDED',
      targetRequirementId: 'finance-review',
      successorRequirementId: 'controller-review',
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-03T12:30:00Z',
    } as const

    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...withdrawal, target: { ...target, decidedAt: '2026-09-01T13:00:00Z' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...withdrawal, target: { ...target, actorId: 'user-9' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [{ ...withdrawal, target: { ...target, requirementId: 'controller-review' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, target: { ...target, decidedAt: '2026-09-01T13:00:00Z' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, target: { ...target, actorId: 'user-9' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, target: { ...target, requirementId: 'controller-review' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, successor: { ...successor, decidedAt: '2026-09-03T12:00:00Z' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, successor: { ...successor, actorId: 'user-9' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision, laterApproval],
        lifecycle: [{ ...supersession, successor: { ...successor, requirementId: 'controller-review' } }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalDecisionHistory.create({ history: [decision, decision], lifecycle: [withdrawal] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalDecisionHistory.create({ history: [decision], lifecycle: [withdrawal, withdrawal] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() =>
      ApprovalDecisionHistory.create({ history: [decision, laterApproval], lifecycle: [withdrawal, supersession] }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({ history: [decision, laterApproval], lifecycle: [supersession, withdrawal] }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      ApprovalDecisionHistory.create({
        history: [decision],
        lifecycle: [requirementSupersession, { ...requirementSupersession, successorRequirementId: 'audit-review' }],
      }),
    ).toThrow(InvalidApprovalDecisionError)
  })

  it('rejects malformed direct lifecycle operations without partial lifecycle state', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const successor = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const laterApproval = {
      ...decision,
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const baseEvent = {
      target,
      successor,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    }

    const withdrawalHistory = ApprovalDecisionHistory.create([decision])
    expect(() => withdrawalHistory.withdraw(requirement, { ...baseEvent, successor })).toThrow(InvalidApprovalDecisionError)
    expect(() => withdrawalHistory.withdraw(requirement, { ...baseEvent, targetRequirementId: 'finance-review' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => withdrawalHistory.withdraw(requirement, { ...baseEvent, successorRequirementId: 'controller-review' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() =>
      withdrawalHistory.withdraw(requirement, { ...baseEvent, target: { ...target, requirementId: 'controller-review' } }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(withdrawalHistory.toJSON()).toEqual({ history: [decision] })

    const decisionSupersessionHistory = ApprovalDecisionHistory.create([decision, laterApproval])
    expect(() => decisionSupersessionHistory.supersedeDecision({ ...baseEvent, targetRequirementId: 'finance-review' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => decisionSupersessionHistory.supersedeDecision({ ...baseEvent, successorRequirementId: 'controller-review' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => decisionSupersessionHistory.supersedeDecision({ ...baseEvent, successor: target })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() =>
      decisionSupersessionHistory.supersedeDecision({ ...baseEvent, successor: { ...successor, decidedAt: '2026-09-03T12:00:00Z' } }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      decisionSupersessionHistory.supersedeDecision({ ...baseEvent, target: { ...target, actorId: 'user-9' } }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      decisionSupersessionHistory.supersedeDecision({ ...baseEvent, target: { ...target, requirementId: 'controller-review' } }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(decisionSupersessionHistory.toJSON()).toEqual({ history: [decision, laterApproval] })

    const requirementSupersessionHistory = ApprovalDecisionHistory.create([decision])
    expect(() =>
      requirementSupersessionHistory.supersedeRequirement({
        targetRequirementId: 'finance-review',
        successorRequirementId: 'controller-review',
        target,
        actor: { type: 'user', id: 'user-7' },
        recordedAt: '2026-09-02T12:30:00Z',
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(() =>
      requirementSupersessionHistory.supersedeRequirement({
        targetRequirementId: '',
        successorRequirementId: 'controller-review',
        actor: { type: 'user', id: 'user-7' },
        recordedAt: '2026-09-02T12:30:00Z',
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(requirementSupersessionHistory.toJSON()).toEqual({ history: [decision] })
  })

  it('rejects direct lifecycle supersession duplicates without altering committed lifecycle evidence', () => {
    const target = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-01T12:00:00Z',
    }
    const successor = {
      requirementId: 'finance-review',
      actorId: 'user-7',
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const laterApproval = {
      ...decision,
      decidedAt: '2026-09-02T12:00:00Z',
    }
    const supersession = {
      target,
      successor,
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    } as const
    const decisionHistory = ApprovalDecisionHistory.create([decision, laterApproval])

    decisionHistory.supersedeDecision(supersession)

    expect(() =>
      decisionHistory.supersedeDecision({ ...supersession, recordedAt: '2026-09-03T12:30:00Z' }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(decisionHistory.toJSON()).toEqual({
      history: [decision, laterApproval],
      lifecycle: [{ type: 'DECISION_SUPERSEDED', ...supersession }],
    })

    const requirementSupersession = {
      targetRequirementId: 'finance-review',
      successorRequirementId: 'controller-review',
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    } as const
    const requirementHistory = ApprovalDecisionHistory.create([decision])
    requirementHistory.supersedeRequirement(requirementSupersession)

    expect(() =>
      requirementHistory.supersedeRequirement({
        ...requirementSupersession,
        successorRequirementId: 'audit-review',
        recordedAt: '2026-09-03T12:30:00Z',
      }),
    ).toThrow(InvalidApprovalDecisionError)
    expect(requirementHistory.toJSON()).toEqual({
      history: [decision],
      lifecycle: [{ type: 'REQUIREMENT_SUPERSEDED', ...requirementSupersession }],
    })
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

  it('does not let an unrelated requirement supersession invalidate another requirement', () => {
    const history = ApprovalDecisionHistory.create({
      history: [decision],
      lifecycle: [
        {
          type: 'REQUIREMENT_SUPERSEDED',
          targetRequirementId: 'manager-review',
          successorRequirementId: 'director-review',
          actor: { type: 'user', id: 'user-7' },
          recordedAt: '2026-09-03T12:30:00Z',
        },
      ],
    })

    expect(history.evaluateRequirement(requirement)).toBe('APPROVED')
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

  it('makes decisions ineffective when relevant fact JSON shape changes', () => {
    const base = {
      ...decision,
      subjectFacts: {
        facts: {
          amount: { amount: '9000.00', currency: 'EUR' },
          approvals: ['manager', 'finance'],
          nullable: null,
        },
      },
    }
    const approvalDecision = ApprovalDecision.from(base)

    expect(
      approvalDecision.evaluateEffectiveness(
        {
          facts: {
            nullable: null,
            approvals: ['manager', 'finance'],
            amount: { currency: 'EUR', amount: '9000.00' },
          },
        },
        ['facts'],
      ),
    ).toBe('EFFECTIVE')

    expect(ApprovalDecision.from({ ...decision, subjectFacts: { facts: {} } }).evaluateEffectiveness({ facts: [] }, ['facts'])).toBe(
      'INEFFECTIVE',
    )
    expect(ApprovalDecision.from({ ...decision, subjectFacts: { facts: [] } }).evaluateEffectiveness({ facts: {} }, ['facts'])).toBe(
      'INEFFECTIVE',
    )
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: [1, 2] } }).evaluateEffectiveness(
        { facts: { '0': 1, '1': 2 } },
        ['facts'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: { a: 1 } } }).evaluateEffectiveness({ facts: { b: 1 } }, [
        'facts',
      ]),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: { a: 1 } } }).evaluateEffectiveness(
        { facts: { a: 1, b: 2 } },
        ['facts'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: { amount: [1, 2] } } }).evaluateEffectiveness(
        { facts: { amount: { '0': 1, '1': 2 } } },
        ['facts'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: ['manager', 'finance'] } }).evaluateEffectiveness(
        { facts: ['finance', 'manager'] },
        ['facts'],
      ),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: null } }).evaluateEffectiveness({ facts: {} }, ['facts']),
    ).toBe('INEFFECTIVE')
    expect(
      ApprovalDecision.from({ ...decision, subjectFacts: { facts: null } }).evaluateEffectiveness({ facts: [] }, ['facts']),
    ).toBe('INEFFECTIVE')
  })

  it('ignores unrelated fact changes when a relevant nested path remains unchanged', () => {
    const approvalDecision = ApprovalDecision.from({
      ...decision,
      subjectFacts: {
        facts: { approvalLevels: ['manager', 'finance'], note: 'original' },
      },
    })

    expect(
      approvalDecision.evaluateEffectiveness(
        {
          facts: { approvalLevels: ['manager', 'finance'], note: 'changed' },
        },
        ['facts.approvalLevels'],
      ),
    ).toBe('EFFECTIVE')
  })

  it('does not satisfy a requirement when relevant fact shape changes', () => {
    const history = ApprovalDecisionHistory.create([
      {
        ...decision,
        subjectFacts: {
          facts: {
            approvalLevels: ['manager', 'finance'],
          },
        },
      },
    ])

    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: {
          facts: {
            approvalLevels: ['manager', 'finance'],
          },
        },
        relevantFactPaths: ['facts.approvalLevels'],
      }),
    ).toBe('APPROVED')
    expect(
      history.evaluateRequirement(requirement, {
        currentSubjectFacts: {
          facts: {
            approvalLevels: { '0': 'manager', '1': 'finance' },
          },
        },
        relevantFactPaths: ['facts.approvalLevels'],
      }),
    ).toBe('PENDING')
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
