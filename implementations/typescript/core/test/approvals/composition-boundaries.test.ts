// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalComposition, InvalidApprovalChainError } from '../../src/index.js'

const requirementMember = { type: 'requirement', id: 'review-member', requirementId: 'review' }
const validGroup = { id: 'root', kind: 'ALL_OF', members: [requirementMember] }
const validComposition = { rootGroup: 'root', groups: [validGroup] }

describe('Approval composition validation boundaries', () => {
  it('rejects malformed top-level composition and group containers', () => {
    expect(() => ApprovalComposition.from(7)).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from([])).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from(Object.assign(() => undefined, validComposition))).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from(Object.assign([], validComposition))).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ rootGroup: undefined, groups: [validGroup] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from({ stages: undefined, groups: [validGroup] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from({ rootGroup: 'root', groups: [] })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ rootGroup: 'root', groups: 'root' })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ rootGroup: 'root', groups: [null] })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ rootGroup: '', groups: [validGroup] })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: '', kind: 'ALL_OF', members: [requirementMember] }],
    })).toThrow(InvalidApprovalChainError)
  })

  it('rejects malformed member declarations and unresolved child group references', () => {
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: 'root', kind: 'ALL_OF', members: [null] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'unknown', id: 'member' }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        { id: 'root', kind: 'ALL_OF', members: [{ type: 'unknown', id: 'member', groupId: 'child' }] },
        { id: 'child', kind: 'ALL_OF', members: [requirementMember] },
      ],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: '', requirementId: 'review' }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'member', requirementId: '' }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'group', id: 'child', groupId: 'missing' }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [
        { id: 'root', kind: 'ALL_OF', members: [{ type: 'group', id: 'child', groupId: '' }] },
        { id: 'child', kind: 'ALL_OF', members: [requirementMember] },
      ],
    })).toThrow(InvalidApprovalChainError)
  })

  it('rejects malformed stages and unresolved stage group references', () => {
    expect(() => ApprovalComposition.from({ stages: 'stage-1', groups: [validGroup] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from({ stages: [null], groups: [validGroup] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalComposition.from({
      stages: [
        { id: 'stage-1', groups: ['root'] },
        { id: 'stage-1', groups: ['root'] },
      ],
      groups: [validGroup],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({ stages: [{ id: '', groups: ['root'] }], groups: [validGroup] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() =>
      ApprovalComposition.from({ stages: [{ id: 'stage-1', groups: [''] }], groups: [validGroup] }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({ stages: [{ id: 'stage-1', groups: [7] }], groups: [validGroup] }),
    ).toThrow(InvalidApprovalChainError)
    expect(() =>
      ApprovalComposition.from({ stages: [{ id: 'stage-1', groups: ['missing'] }], groups: [validGroup] }),
    ).toThrow(InvalidApprovalChainError)
  })

  it('accepts exact depth and quorum threshold boundaries', () => {
    expect(ApprovalComposition.from({
      rootGroup: 'g1',
      groups: [
        { id: 'g1', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g2', groupId: 'g2' }] },
        { id: 'g2', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g3', groupId: 'g3' }] },
        { id: 'g3', kind: 'ALL_OF', members: [{ type: 'group', id: 'to-g4', groupId: 'g4' }] },
        { id: 'g4', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'leaf', requirementId: 'review' }] },
      ],
    }).toJSON().groups.map((group) => group.id)).toEqual(['g1', 'g2', 'g3', 'g4'])

    expect(ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [
        {
          id: 'quorum',
          kind: 'N_OF_M',
          threshold: 2,
          members: [
            { type: 'requirement', id: 'alice', requirementId: 'board', voter: { id: 'alice' } },
            { type: 'requirement', id: 'bob', requirementId: 'board', voter: { id: 'bob' } },
          ],
        },
      ],
    }).toJSON().groups[0].threshold).toBe(2)
  })

  it('rejects invalid quorum thresholds and malformed voters', () => {
    const quorumMember = { type: 'requirement', id: 'alice', requirementId: 'board', voter: { id: 'alice' } }
    for (const threshold of [0, 1.5, '1', 3]) {
      expect(() => ApprovalComposition.from({
        rootGroup: 'quorum',
        groups: [{ id: 'quorum', kind: 'N_OF_M', threshold, members: [quorumMember] }],
      })).toThrow(InvalidApprovalChainError)
    }
    expect(() => ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [{ id: 'quorum', kind: 'N_OF_M', threshold: 1, members: [{ type: 'requirement', id: 'alice', requirementId: 'board' }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [{ id: 'quorum', kind: 'N_OF_M', threshold: 1, members: [{ type: 'requirement', id: 'alice', requirementId: 'board', voter: null }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [{ id: 'quorum', kind: 'N_OF_M', threshold: 1, members: [{ type: 'requirement', id: 'alice', requirementId: 'board', voter: { id: '', type: 'user' } }] }],
    })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalComposition.from({
      rootGroup: 'quorum',
      groups: [{ id: 'quorum', kind: 'N_OF_M', threshold: 1, members: [{ type: 'requirement', id: 'alice', requirementId: 'board', voter: { id: 'alice', type: '' } }] }],
    })).toThrow(InvalidApprovalChainError)
  })

  it('keeps non-quorum threshold absence explicit and rejects threshold values', () => {
    expect(ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ ...validGroup, threshold: undefined }],
    }).toJSON()).toEqual(validComposition)
    expect(() => ApprovalComposition.from({
      rootGroup: 'root',
      groups: [{ ...validGroup, threshold: 1 }],
    })).toThrow(InvalidApprovalChainError)
  })
})
