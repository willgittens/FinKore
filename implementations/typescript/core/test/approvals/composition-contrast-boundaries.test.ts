// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, ApprovalDecisionHistory, InvalidApprovalChainError } from '../../src/index.js'

const evaluatedAt = '2026-09-12T10:00:00Z'
const subject = { type: 'invoice', id: 'inv-42' }

function requirement(id: string, actorId = 'user-7') {
  return {
    id,
    subject,
    eligibleActors: [actorId],
    approvedOutcome: 'APPROVED',
    rejectedOutcome: 'REJECTED',
  } as const
}

function approval(requirementId: string, actorId = 'user-7', decidedAt = '2026-09-01T12:00:00Z') {
  return {
    requirementId,
    subjectFacts: { revision: '3' },
    outcome: 'APPROVED',
    actor: { type: 'user', id: actorId },
    decidedAt,
  } as const
}

function vote(actorId: string, effective: boolean) {
  return {
    requirementId: 'board-review',
    actor: { id: actorId },
    outcome: 'APPROVED',
    effective,
  } as const
}

describe('Approval composition contrast and boundary evaluation', () => {
  it('composes Draft 0.2 current-state contrasts through any-of and all-of groups', () => {
    const effectiveRequirement = requirement('effective-review')
    const withdrawnRequirement = requirement('withdrawn-review')
    const expiredRequirement = requirement('expired-review')
    const supersededRequirement = requirement('superseded-review')
    const staleRequirement = requirement('stale-review')

    const effectiveState = ApprovalDecisionHistory.create([approval('effective-review')]).evaluateRequirement(effectiveRequirement)
    const withdrawnState = ApprovalDecisionHistory.create({
      history: [approval('withdrawn-review')],
      lifecycle: [
        {
          type: 'WITHDRAWN',
          target: { requirementId: 'withdrawn-review', actorId: 'user-7', decidedAt: '2026-09-01T12:00:00Z' },
          actor: { type: 'user', id: 'user-7' },
          recordedAt: '2026-09-02T12:00:00Z',
        },
      ],
    }).evaluateRequirement(withdrawnRequirement)

    const expiredHistory = ApprovalDecisionHistory.create([
      { ...approval('expired-review'), expiresAt: '2026-09-02T12:00:00Z' },
    ])
    const expiresBeforeBoundary = expiredHistory.evaluateRequirement(expiredRequirement, {
      evaluatedAt: '2026-09-02T11:59:59Z',
    })
    const expiresAtBoundary = expiredHistory.evaluateRequirement(expiredRequirement, {
      evaluatedAt: '2026-09-02T12:00:00Z',
    })

    const supersededHistory = ApprovalDecisionHistory.create([
      { ...approval('superseded-review'), subjectFacts: { revision: '2' }, decidedAt: '2026-09-01T12:00:00Z' },
      { ...approval('superseded-review'), subjectFacts: { revision: '3' }, decidedAt: '2026-09-02T12:00:00Z' },
    ])
    supersededHistory.supersedeDecision({
      target: { requirementId: 'superseded-review', actorId: 'user-7', decidedAt: '2026-09-01T12:00:00Z' },
      successor: { requirementId: 'superseded-review', actorId: 'user-7', decidedAt: '2026-09-02T12:00:00Z' },
      actor: { type: 'user', id: 'user-7' },
      recordedAt: '2026-09-02T12:30:00Z',
    })
    const supersededState = supersededHistory.evaluateRequirement(supersededRequirement, {
      currentSubjectFacts: { revision: '2' },
      relevantFactPaths: ['revision'],
    })

    const staleState = ApprovalDecisionHistory.create([
      { ...approval('stale-review'), subjectFacts: { revision: '1' } },
    ]).evaluateRequirement(staleRequirement, {
      currentSubjectFacts: { revision: '2' },
      relevantFactPaths: ['revision'],
    })

    expect(effectiveState).toBe('APPROVED')
    expect(withdrawnState).toBe('PENDING')
    expect(expiresBeforeBoundary).toBe('APPROVED')
    expect(expiresAtBoundary).toBe('PENDING')
    expect(supersededState).toBe('PENDING')
    expect(staleState).toBe('PENDING')

    const anyOf = ApprovalComposition.from({
      rootGroup: 'options',
      groups: [
        {
          id: 'options',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'effective-member', requirementId: 'effective-review' },
            { type: 'requirement', id: 'withdrawn-member', requirementId: 'withdrawn-review' },
            { type: 'requirement', id: 'expired-member', requirementId: 'expired-review' },
          ],
        },
      ],
    })
    expect(anyOf.evaluate({
      requirements: [
        { id: 'effective-review', applicability: 'APPLICABLE', state: effectiveState },
        { id: 'withdrawn-review', applicability: 'APPLICABLE', state: withdrawnState },
        { id: 'expired-review', applicability: 'APPLICABLE', state: expiresAtBoundary },
      ],
      context: { evaluatedAt },
    })).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })

    const allOf = ApprovalComposition.from({
      rootGroup: 'complete-review',
      groups: [
        {
          id: 'complete-review',
          kind: 'ALL_OF',
          members: [
            { type: 'requirement', id: 'effective-member', requirementId: 'effective-review' },
            { type: 'requirement', id: 'withdrawn-member', requirementId: 'withdrawn-review' },
            { type: 'requirement', id: 'expired-member', requirementId: 'expired-review' },
            { type: 'requirement', id: 'superseded-member', requirementId: 'superseded-review' },
            { type: 'requirement', id: 'stale-member', requirementId: 'stale-review' },
          ],
        },
      ],
    })
    expect(allOf.evaluate({
      requirements: [
        { id: 'effective-review', applicability: 'APPLICABLE', state: effectiveState },
        { id: 'withdrawn-review', applicability: 'APPLICABLE', state: withdrawnState },
        { id: 'expired-review', applicability: 'APPLICABLE', state: expiresAtBoundary },
        { id: 'superseded-review', applicability: 'APPLICABLE', state: supersededState },
        { id: 'stale-review', applicability: 'APPLICABLE', state: staleState },
      ],
      context: { evaluatedAt },
    })).toEqual({
      outcome: 'PENDING',
      actionableRequirements: ['withdrawn-review', 'expired-review', 'superseded-review', 'stale-review'],
    })
  })

  it('enforces quorum N-1, N, and N+1 boundaries without duplicate or aggregate-state vote inflation', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'board-review', voter: { id: 'bob' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'board-review', voter: { id: 'carol' } },
          ],
        },
      ],
    })
    const evaluate = (decisions: readonly ReturnType<typeof vote>[]) =>
      composition.evaluate({
        requirements: [
          {
            id: 'board-review',
            applicability: 'APPLICABLE',
            state: 'APPROVED',
            eligibleActors: ['alice', 'bob', 'carol'],
            approvedOutcome: 'APPROVED',
            rejectedOutcome: 'REJECTED',
          },
        ],
        decisions,
        context: { evaluatedAt },
      })

    expect(evaluate([vote('alice', true), vote('alice', true)])).toEqual({
      outcome: 'PENDING',
      actionableRequirements: ['board-review'],
    })
    expect(evaluate([vote('alice', true), vote('bob', true)])).toEqual({
      outcome: 'APPROVED',
      actionableRequirements: [],
    })
    expect(evaluate([vote('alice', true), vote('bob', true), vote('carol', true)])).toEqual({
      outcome: 'APPROVED',
      actionableRequirements: [],
    })

    for (const ineffectiveVote of [vote('bob', false), vote('carol', false)]) {
      expect(evaluate([vote('alice', true), ineffectiveVote])).toEqual({
        outcome: 'PENDING',
        actionableRequirements: ['board-review'],
      })
    }
  })

  it('requires missing current states for any/all members before returning an aggregate outcome', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [
            { type: 'requirement', id: 'manager-member', requirementId: 'manager-review' },
            { type: 'requirement', id: 'finance-member', requirementId: 'finance-review' },
          ],
        },
      ],
    })

    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'finance-review', applicability: 'APPLICABLE' },
        ],
        context: { evaluatedAt },
      }),
    ).toThrow(InvalidApprovalChainError)

    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'NOT_APPLICABLE', state: 'MALFORMED' },
          { id: 'finance-review', applicability: 'NOT_APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt },
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('allows unused partial outcome metadata on non-quorum requirement observations', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'manager-member', requirementId: 'manager-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED', approvedOutcome: 'APPROVED' },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('treats an effective rejecting quorum vote as a rejected member, not an ignored pending vote', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [{ type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { id: 'alice' } }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          {
            id: 'board-review',
            applicability: 'APPLICABLE',
            eligibleActors: ['alice'],
            approvedOutcome: 'APPROVED',
            rejectedOutcome: 'REJECTED',
          },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'REJECTED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('keeps approved nested all-of groups applicable when competing with rejected alternatives', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'group', id: 'approved-all-member', groupId: 'approved-all' },
            { type: 'requirement', id: 'rejected-member', requirementId: 'legal-review' },
          ],
        },
        {
          id: 'approved-all',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'manager-member', requirementId: 'manager-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('keeps approved nested any-of groups applicable when competing with rejected alternatives', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'group', id: 'approved-any-member', groupId: 'approved-any' },
            { type: 'requirement', id: 'rejected-member', requirementId: 'legal-review' },
          ],
        },
        {
          id: 'approved-any',
          kind: 'ANY_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('propagates nested rejection through parallel stage evaluation', () => {
    const composition = ApprovalComposition.from({
      stages: [{ id: 'stage-1', groups: ['finance-stage', 'risk-stage'] }],
      groups: [
        {
          id: 'finance-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
        {
          id: 'risk-stage',
          kind: 'ALL_OF',
          members: [{ type: 'group', id: 'risk-options-member', groupId: 'risk-options' }],
        },
        {
          id: 'risk-options',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'legal-member', requirementId: 'legal-review' },
            { type: 'requirement', id: 'security-member', requirementId: 'security-review' },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'REJECTED' },
          { id: 'security-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })
})
