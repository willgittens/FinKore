// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, InvalidApprovalChainError, InvalidApprovalContextError } from '../../src/index.js'

describe('Approval composition evaluation boundaries', () => {
  it('lets an entirely inapplicable stage pass to a later approved stage', () => {
    const composition = ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['exempt-stage'] },
        { id: 'stage-2', groups: ['finance-stage'] },
      ],
      groups: [
        {
          id: 'exempt-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'small-invoice-member', requirementId: 'small-invoice-review' }],
        },
        {
          id: 'finance-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'small-invoice-review', applicability: 'NOT_APPLICABLE', state: 'PENDING' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('deduplicates pending actionable requirements at their first eligible occurrence', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [
            { type: 'requirement', id: 'first', requirementId: 'shared-review' },
            { type: 'requirement', id: 'second', requirementId: 'shared-review' },
            { type: 'requirement', id: 'third', requirementId: 'legal-review' },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'shared-review', applicability: 'APPLICABLE', state: 'PENDING' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['shared-review', 'legal-review'] })
  })

  it('rejects duplicate, missing, malformed, or unresolved requirement observations', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() => composition.evaluate({ requirements: [], context: { evaluatedAt: '2026-09-12T10:00:00Z' } })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() =>
      composition.evaluate({
        requirements: [{ id: 'finance-review', applicability: 'APPLICABLE', state: 'MALFORMED' }],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      composition.evaluate({
        requirements: [{ id: 'finance-review', applicability: 'MAYBE', state: 'PENDING' }],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('returns no actionable requirements for approved or rejected compositions', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'manager-member', requirementId: 'manager-review' },
            { type: 'requirement', id: 'finance-member', requirementId: 'finance-review' },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'REJECTED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('rejects malformed evaluation input and required context values', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(() => composition.evaluate(null as never)).toThrow(InvalidApprovalChainError)
    expect(() => composition.evaluate({ requirements: 'finance-review' } as never)).toThrow(InvalidApprovalChainError)
    expect(() =>
      composition.evaluate({ requirements: [null], context: { evaluatedAt: '2026-09-12T10:00:00Z' } } as never),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      composition.evaluate({
        requirements: [
          {
            id: 'finance-review',
            applicability: 'APPLICABLE',
            state: 'PENDING',
            requiresEvaluationContext: 'yes',
          },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      } as never),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING', requiresEvaluationContext: true },
        ],
        context: { evaluatedAt: '' },
      }),
    ).toThrow(InvalidApprovalContextError)
    expect(() =>
      composition.evaluate({
        requirements: [{ id: 'finance-review', applicability: 'APPLICABLE' }],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('distinguishes ALL_OF rejection from pending and approval', () => {
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

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('keeps ANY_OF pending when rejection is not unanimous', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'manager-member', requirementId: 'manager-review' },
            { type: 'requirement', id: 'finance-member', requirementId: 'finance-review' },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'REJECTED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })

  it('keeps a stage pending when at least one parallel group is pending and none are rejected', () => {
    const composition = ApprovalComposition.from({
      stages: [{ id: 'stage-1', groups: ['manager-stage', 'finance-stage'] }],
      groups: [
        {
          id: 'manager-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'manager-member', requirementId: 'manager-review' }],
        },
        {
          id: 'finance-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })


  it('accepts required valid context and does not require context otherwise', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED', requiresEvaluationContext: true },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })

    expect(
      composition.evaluate({
        requirements: [{ id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' }],
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('accepts explicit inapplicability without current state evidence', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [{ id: 'finance-review', applicability: 'NOT_APPLICABLE' }],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('continues from an approved stage to a later pending stage', () => {
    const composition = ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['manager-stage'] },
        { id: 'stage-2', groups: ['finance-stage'] },
      ],
      groups: [
        {
          id: 'manager-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'manager-member', requirementId: 'manager-review' }],
        },
        {
          id: 'finance-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })

})
