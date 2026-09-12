// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, InvalidApprovalChainError } from '../../src/index.js'

describe('Approval composition mutation boundaries', () => {
  it('rejects non-string identities that would otherwise preserve structural references', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 7,
        groups: [{ id: 7, kind: 'ALL_OF', members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }] }],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: 7, requirementId: 'review' }] }],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('rejects voters on non-quorum requirement members and child groups', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [
          {
            id: 'root',
            kind: 'ALL_OF',
            members: [{ type: 'requirement', id: 'leaf', requirementId: 'review', voter: { id: 'alice' } }],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'root',
        groups: [
          {
            id: 'root',
            kind: 'ALL_OF',
            members: [{ type: 'group', id: 'child-member', groupId: 'child', voter: { id: 'alice' } }],
          },
          {
            id: 'child',
            kind: 'ALL_OF',
            members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('rejects child groups as quorum voting members even when the child group exists', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [
          {
            id: 'quorum',
            kind: 'N_OF_M',
            threshold: 1,
            members: [{ type: 'group', id: 'group-vote', groupId: 'child', voter: { id: 'alice' } }],
          },
          {
            id: 'child',
            kind: 'ALL_OF',
            members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [
          {
            id: 'quorum',
            kind: 'N_OF_M',
            threshold: 1,
            members: [{ type: 'group', id: 'group-vote', groupId: 'child' }],
          },
          {
            id: 'child',
            kind: 'ALL_OF',
            members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [
          {
            id: 'quorum',
            kind: 'N_OF_M',
            threshold: 1,
            members: [
              {
                type: 'group',
                id: 'misleading-group-vote',
                groupId: 'child',
                requirementId: 'board',
                voter: { id: 'alice' },
              },
            ],
          },
          {
            id: 'child',
            kind: 'ALL_OF',
            members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('rejects malformed quorum member containers before reading requirement fields', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [{ id: 'quorum', kind: 'N_OF_M', threshold: 1, members: [null] }],
      }),
    ).toThrow(InvalidApprovalChainError)
  })


  it('rejects duplicate quorum member identifiers before accepting voter uniqueness', () => {
    expect(() =>
      ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [
          {
            id: 'quorum',
            kind: 'N_OF_M',
            threshold: 1,
            members: [
              { type: 'requirement', id: 'duplicate-seat', requirementId: 'board', voter: { id: 'alice' } },
              { type: 'requirement', id: 'duplicate-seat', requirementId: 'board', voter: { id: 'bob' } },
            ],
          },
        ],
      }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('treats voter identities as ordinary opaque strings, including mutation sentinels', () => {
    const composition = ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [
        {
          id: 'quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [
            {
              type: 'requirement',
              id: 'sentinel-seat',
              requirementId: 'board',
              voter: { id: 'Stryker was here' },
            },
          ],
        },
      ],
    })

    expect(composition.toJSON().groups[0].members).toEqual([
      {
        type: 'requirement',
        id: 'sentinel-seat',
        requirementId: 'board',
        voter: { id: 'Stryker was here' },
      },
    ])
  })

  it('accepts a one-of-one quorum threshold boundary', () => {
    expect(ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [
        {
          id: 'quorum',
          kind: 'N_OF_M',
          threshold: 1,
          members: [{ type: 'requirement', id: 'alice-seat', requirementId: 'board', voter: { id: 'alice' } }],
        },
      ],
    }).toJSON().groups[0].threshold).toBe(1)
  })
})
