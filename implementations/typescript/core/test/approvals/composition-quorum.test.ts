// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, InvalidApprovalChainError } from '../../src/index.js'

const evaluatedAt = '2026-09-12T10:00:00Z'

describe('Approval composition quorum evaluation', () => {
  it('approves a two-of-three quorum from two distinct effective eligible approvals', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { type: 'user', id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'board-review', voter: { type: 'user', id: 'bob' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'board-review', voter: { type: 'user', id: 'carol' } },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          {
            id: 'board-review',
            applicability: 'APPLICABLE',
            eligibleActors: ['alice', 'bob', 'carol'],
            approvedOutcome: 'APPROVED',
            rejectedOutcome: 'REJECTED',
          },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { type: 'user', id: 'alice' }, outcome: 'APPROVED', effective: true },
          { requirementId: 'board-review', actor: { type: 'user', id: 'alice' }, outcome: 'APPROVED', effective: true },
          { requirementId: 'board-review', actor: { type: 'user', id: 'bob' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('rejects when fixed threshold cannot be reached after applicability omission', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'alice-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'bob-review', voter: { id: 'bob' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'carol-review', voter: { id: 'carol' } },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'alice-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'bob-review', applicability: 'NOT_APPLICABLE', eligibleActors: ['bob'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'carol-review', applicability: 'NOT_APPLICABLE', eligibleActors: ['carol'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'alice-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('stays pending when pending applicable voters can still reach threshold', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'alice-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'bob-review', voter: { id: 'bob' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'carol-review', voter: { id: 'carol' } },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'alice-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'bob-review', applicability: 'APPLICABLE', eligibleActors: ['bob'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'carol-review', applicability: 'NOT_APPLICABLE', eligibleActors: ['carol'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'alice-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['bob-review'] })
  })

  it('uses only member-specific effective evidence for a declared voter', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'board-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'board-review', voter: { id: 'carol' } },
          ],
        },
      ],
    })

    expect(
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
        decisions: [
          { requirementId: 'board-review', actor: { id: 'bob' }, outcome: 'APPROVED', effective: true },
          { requirementId: 'board-review', actor: { id: 'carol' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['board-review'] })
  })

  it('ignores ineffective approvals and rejected decisions for approval count', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'board-quorum',
      groups: [
        {
          id: 'board-quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [
            { type: 'requirement', id: 'alice-seat', requirementId: 'alice-review', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob-seat', requirementId: 'bob-review', voter: { id: 'bob' } },
            { type: 'requirement', id: 'carol-seat', requirementId: 'carol-review', voter: { id: 'carol' } },
          ],
        },
      ],
    })

    expect(
      composition.evaluate({
        requirements: [
          { id: 'alice-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'bob-review', applicability: 'APPLICABLE', eligibleActors: ['bob'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          { id: 'carol-review', applicability: 'APPLICABLE', eligibleActors: ['carol'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'alice-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: false },
          { requirementId: 'bob-review', actor: { id: 'bob' }, outcome: 'APPROVED', effective: false },
          { requirementId: 'carol-review', actor: { id: 'carol' }, outcome: 'REJECTED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['alice-review', 'bob-review'] })
  })

  it('rejects opposing effective outcomes for the same quorum member', () => {
    const decisions = [
      { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
      { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'REJECTED', effective: true },
    ] as const
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

    expect(() =>
      composition.evaluate({
        requirements: [
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions,
        context: { evaluatedAt },
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(decisions).toEqual([
      { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
      { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'REJECTED', effective: true },
    ])
  })

  it('ignores decisions by actors who are not eligible for the referenced requirement', () => {
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
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['bob'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['board-review'] })
  })


  it('treats an entirely inapplicable quorum as no current approval obligation', () => {
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
        requirements: [{ id: 'board-review', applicability: 'NOT_APPLICABLE' }],
        decisions: [],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

  it('requires quorum metadata and validates malformed decision observations', () => {
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
    const requirementBase = { id: 'board-review', applicability: 'APPLICABLE' as const }

    for (const requirement of [
      { ...requirementBase, approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
      { ...requirementBase, eligibleActors: ['alice'], rejectedOutcome: 'REJECTED' },
      { ...requirementBase, eligibleActors: ['alice'], approvedOutcome: 'APPROVED' },
      { ...requirementBase, eligibleActors: 'alice', approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
      { ...requirementBase, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'APPROVED' },
    ]) {
      expect(() =>
        composition.evaluate({
          requirements: [requirement],
          decisions: [],
          context: { evaluatedAt },
        }),
      ).toThrow(InvalidApprovalChainError)
    }

    for (const decisions of [
      'not-an-array',
      [null],
      [{ requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: 'yes' }],
      [{ requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'PENDING', effective: true }],
    ]) {
      expect(() =>
        composition.evaluate({
          requirements: [
            { ...requirementBase, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
          ],
          decisions,
          context: { evaluatedAt },
        }),
      ).toThrow(InvalidApprovalChainError)
    }
  })

  it('uses the requirement outcome mapping instead of assuming default labels', () => {
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
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'REJECTED', rejectedOutcome: 'APPROVED' },
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'REJECTED', actionableRequirements: [] })
  })

  it('does not count same-voter decisions for a different requirement', () => {
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
          { id: 'board-review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' },
        ],
        decisions: [
          { requirementId: 'other-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'PENDING', actionableRequirements: ['board-review'] })
  })

  it('allows an approved quorum child to satisfy an alternative group branch', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        {
          id: 'root',
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
        ],
        decisions: [
          { requirementId: 'board-review', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true },
        ],
        context: { evaluatedAt },
      }),
    ).toEqual({ outcome: 'APPROVED', actionableRequirements: [] })
  })

})
