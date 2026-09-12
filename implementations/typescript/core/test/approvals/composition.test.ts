// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, InvalidApprovalChainError } from '../../src/index.js'

const allOfComposition = {
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
}

const stagedComposition = {
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
      kind: 'ANY_OF',
      members: [
        { type: 'requirement', id: 'controller-member', requirementId: 'controller-review' },
        { type: 'requirement', id: 'cfo-member', requirementId: 'cfo-review' },
      ],
    },
  ],
}

const quorumComposition = {
  rootGroup: 'board-quorum',
  groups: [
    {
      id: 'board-quorum',
      kind: 'N_OF_M',
      threshold: 2,
      members: [
        {
          type: 'requirement',
          id: 'alice-seat',
          requirementId: 'board-review',
          voter: { type: 'user', id: 'alice' },
        },
        {
          type: 'requirement',
          id: 'bob-seat',
          requirementId: 'board-review',
          voter: { type: 'user', id: 'bob' },
        },
        {
          type: 'requirement',
          id: 'carol-seat',
          requirementId: 'board-review',
          voter: { type: 'user', id: 'carol' },
        },
      ],
    },
  ],
}

describe('Approval compositions', () => {
  it('preserves standalone group structure and declared member order', () => {
    const composition = ApprovalComposition.from(allOfComposition)

    expect(composition.rootGroup).toBe('root')
    expect(composition.stages).toBeUndefined()
    expect(composition.groups.map((group) => group.id)).toEqual(['root'])
    expect(composition.toJSON()).toEqual(allOfComposition)
  })

  it('preserves ordered stages without treating stage containers as group levels', () => {
    const composition = ApprovalComposition.from(stagedComposition)

    expect(composition.rootGroup).toBeUndefined()
    expect(composition.stages).toEqual([
      { id: 'stage-1', groups: ['manager-stage'] },
      { id: 'stage-2', groups: ['finance-stage'] },
    ])
    expect(composition.groups.map((group) => group.id)).toEqual(['manager-stage', 'finance-stage'])
  })

  it('validates quorum members with explicit distinct voters and a fixed threshold', () => {
    const composition = ApprovalComposition.from(quorumComposition)

    expect(composition.toJSON()).toEqual(quorumComposition)
  })

  it('requires exactly one root group or nonempty stage list', () => {
    expect(() => ApprovalComposition.from(null)).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ groups: allOfComposition.groups })).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({ rootGroup: 'root', stages: stagedComposition.stages, groups: allOfComposition.groups }),
    ).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ stages: [], groups: allOfComposition.groups })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from({ stages: [{ id: 'stage-1', groups: [] }], groups: allOfComposition.groups }))
      .toThrow(InvalidApprovalChainError)
  })

  it('rejects duplicate identifiers, invalid group kinds, unresolved references, and empty members', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [
          { id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'a', requirementId: 'a' }] },
          { id: 'root', kind: 'ANY_OF', members: [{ type: 'requirement', id: 'b', requirementId: 'b' }] },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [{ id: 'root', kind: 'SOME_OF', members: [{ type: 'requirement', id: 'a', requirementId: 'a' }] }],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'missing',
        groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'a', requirementId: 'a' }] }],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ rootGroup: 'root', groups: [{ id: 'root', kind: 'ALL_OF', members: [] }] }))
      .toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [
          {
            id: 'root',
            kind: 'ALL_OF',
            members: [
              { type: 'requirement', id: 'duplicate', requirementId: 'a' },
              { type: 'requirement', id: 'duplicate', requirementId: 'b' },
            ],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('rejects cycles and root-to-child paths deeper than four groups', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'a',
        groups: [
          { id: 'a', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-b', groupId: 'b' }] },
          { id: 'b', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-a', groupId: 'a' }] },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'g1',
        groups: [
          { id: 'g1', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g2', groupId: 'g2' }] },
          { id: 'g2', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g3', groupId: 'g3' }] },
          { id: 'g3', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g4', groupId: 'g4' }] },
          { id: 'g4', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g5', groupId: 'g5' }] },
          { id: 'g5', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }] },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('rejects invalid quorum thresholds and voter declarations', () => {
    expect(() =>
      ApprovalComposition.from({
        ...quorumComposition,
        groups: [{ ...quorumComposition.groups[0], threshold: 0 }],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        ...quorumComposition,
        groups: [{ ...quorumComposition.groups[0], threshold: 4 }],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [
          {
            id: 'root',
            kind: 'N_OF_M',
            threshold: 1,
            members: [{ type: 'group', id: 'group-member', groupId: 'child', voter: { id: 'alice' } }],
          },
          { id: 'child', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }] },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        ...quorumComposition,
        groups: [
          {
            ...quorumComposition.groups[0],
            members: [
              quorumComposition.groups[0].members[0],
              { ...quorumComposition.groups[0].members[1], voter: { type: 'user', id: 'alice' } },
            ],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('returns defensive snapshots', () => {
    const composition = ApprovalComposition.from(stagedComposition)
    const groups = composition.groups as { id: string }[]
    const snapshot = composition.toJSON() as { groups: { id: string }[]; stages: { groups: string[] }[] }

    groups[0].id = 'changed'
    snapshot.groups[0].id = 'changed'
    snapshot.stages[0].groups[0] = 'changed'

    expect(composition.groups.map((group) => group.id)).toEqual(['manager-stage', 'finance-stage'])
    expect(composition.toJSON()).toEqual(stagedComposition)
  })
})
