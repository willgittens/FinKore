// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  ApprovalComposition,
  ApprovalConditionUnresolvedError,
  InvalidApprovalChainError,
  InvalidApprovalContextError,
} from '../../src/index.js'

describe('Approval composition any/all evaluation', () => {
  it('evaluates ALL_OF pending state and reports pending applicable requirements', () => {
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
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })

  it('omits entirely inapplicable child groups from ANY_OF evaluation', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'group', id: 'exempt-branch', groupId: 'exemptions' },
            { type: 'requirement', id: 'legal-member', requirementId: 'legal-review' },
          ],
        },
        {
          id: 'exemptions',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'small-invoice-member', requirementId: 'small-invoice-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'small-invoice-review', applicability: 'NOT_APPLICABLE', state: 'PENDING' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['legal-review'] })
  })

  it('returns approved with no actionables when no requirements are applicable', () => {
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
          { id: 'manager-review', applicability: 'NOT_APPLICABLE', state: 'PENDING' },
          { id: 'finance-review', applicability: 'NOT_APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('evaluates stages in order while validating later stages', () => {
    const composition = ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['review-options'] },
        { id: 'stage-2', groups: ['cfo-stage'] },
      ],
      groups: [
        {
          id: 'review-options',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'manager-member', requirementId: 'manager-review' },
            { type: 'requirement', id: 'controller-member', requirementId: 'controller-review' },
          ],
        },
        {
          id: 'cfo-stage',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'cfo-member', requirementId: 'cfo-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'PENDING' },
          { id: 'controller-review', applicability: 'APPLICABLE', state: 'PENDING' },
          { id: 'cfo-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['manager-review', 'controller-review'] })
  })

  it('uses all-required semantics for parallel groups in one stage', () => {
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
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('does complete validation before returning a decisive outcome', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'requirement', id: 'approved-member', requirementId: 'manager-review' },
            { type: 'requirement', id: 'unknown-member', requirementId: 'legal-review' },
          ],
        },
      ],
    })

    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'manager-review', applicability: 'APPLICABLE', state: 'APPROVED' },
          { id: 'legal-review', applicability: 'UNRESOLVED', state: 'PENDING' },
        ],
        context: { evaluatedAt: '2026-09-12T10:00:00Z' },
      }),
    ).toThrow(ApprovalConditionUnresolvedError)
  })

  it('reports missing required context before malformed current state evidence', () => {
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
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'MALFORMED', requiresEvaluationContext: true },
        ],
        context: {},
      }),
    ).toThrow(InvalidApprovalContextError)
  })

  it('rejects missing requirement observations', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [{ type: 'requirement', id: 'finance-member', requirementId: 'finance-review' }],
        },
      ],
    })

    expect(() => composition.evaluate({ requirements: [], context: { evaluatedAt: '2026-09-12T10:00:00Z' } })).toThrow(
      InvalidApprovalChainError,
    )
  })
})
