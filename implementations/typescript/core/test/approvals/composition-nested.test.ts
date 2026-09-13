// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition } from '../../src/index.js'

const evaluatedAt = '2026-09-12T10:00:00Z'

describe('Approval composition bounded nested group evaluation', () => {
  it('evaluates an approved nested quorum branch inside an any-of child group', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ALL_OF',
          members: [
            { type: 'group', id: 'options-member', groupId: 'options' },
            { type: 'requirement', id: 'finance-member', requirementId: 'finance-review' },
          ],
        },
        {
          id: 'options',
          kind: 'ANY_OF',
          members: [
            { type: 'group', id: 'quorum-member', groupId: 'board-quorum' },
            { type: 'requirement', id: 'legal-member', requirementId: 'legal-review' },
          ],
        },
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
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'legal-review', applicability: 'APPLICABLE', state: 'REJECTED' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'APPROVED' },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('propagates an inapplicable nested group omission to its parent', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
          kind: 'ANY_OF',
          members: [
            { type: 'group', id: 'exemption-member', groupId: 'exemption-branch' },
            { type: 'requirement', id: 'finance-member', requirementId: 'finance-review' },
          ],
        },
        {
          id: 'exemption-branch',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'small-invoice-member', requirementId: 'small-invoice-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'small-invoice-review', applicability: 'NOT_APPLICABLE' },
          { id: 'finance-review', applicability: 'APPLICABLE', state: 'PENDING' },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['finance-review'] })
  })

  it('evaluates the permitted four-level depth path deterministically', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'g1',
      groups: [
        { id: 'g1', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g2', groupId: 'g2' }] },
        { id: 'g2', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g3', groupId: 'g3' }] },
        { id: 'g3', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g4', groupId: 'g4' }] },
        {
          id: 'g4',
          kind: 'ALL_OF',
          members: [{ type: 'requirement', id: 'manager-member', requirementId: 'manager-review' }],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [{ id: 'manager-review', applicability: 'APPLICABLE', state: 'PENDING' }],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['manager-review'] })
  })
})
