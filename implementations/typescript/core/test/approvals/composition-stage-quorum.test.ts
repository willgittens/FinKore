// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition } from '../../src/index.js'

const evaluatedAt = '2026-09-12T10:00:00Z'

describe('Approval composition ordered stages with closed group evaluation', () => {
  it('reports only pending quorum requirements in the first pending stage', () => {
    const composition = ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['board-quorum'] },
        { id: 'stage-2', groups: ['cfo-stage'] },
      ],
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'alice-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'bob-review', voter: { id: 'bob' } },
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
          { id: 'alice-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'bob-review', applicability: 'APPLICABLE', eligibleActors: ['bob'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'cfo-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        decisions: [
          { requirementId: 'alice-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['bob-review'] })
  })

  it('lets an entirely inapplicable quorum stage advance to a later pending stage', () => {
    const composition = ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['board-quorum'] },
        { id: 'stage-2', groups: ['finance-stage'] },
      ],
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [{ type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { id: 'alice' } }],
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
          { id: 'board-review', applicability: 'NOT_APPLICABLE' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        decisions: [],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })

  it('rejects the first non-approved stage when a parallel closed group rejects', () => {
    const composition = ApprovalComposition.from({
      stages: [{ id: 'stage-1', groups: ['board-quorum', 'finance-stage'] }],
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [{ type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { id: 'alice' } }],
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
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })
})
