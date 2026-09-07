import { describe, expect, it } from 'vitest'
import { ApprovalRequirement, InvalidApprovalDecisionError } from '../../src/index.js'

const requirement = {
  id: 'finance-review',
  subject: { type: 'invoice', id: 'inv-42' },
  eligibleActors: ['user-7'],
  approvedOutcome: 'APPROVED',
  rejectedOutcome: 'REJECTED',
}

describe('Approval requirements', () => {
  it('preserves stable identity, subject, eligibility, and outcome semantics', () => {
    const approvalRequirement = ApprovalRequirement.from(requirement)

    expect(approvalRequirement.id).toBe('finance-review')
    expect(approvalRequirement.isEligibleActor('user-7')).toBe(true)
    expect(approvalRequirement.isEligibleActor('user-9')).toBe(false)
    expect(approvalRequirement.stateForOutcome('APPROVED')).toBe('APPROVED')
    expect(approvalRequirement.stateForOutcome('REJECTED')).toBe('REJECTED')
    expect(approvalRequirement.toJSON()).toEqual(requirement)
  })

  it('does not infer identity from object position or generate missing identity', () => {
    expect(() => ApprovalRequirement.from(null)).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from([])).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from({ ...requirement, id: '' })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from({ ...requirement, id: undefined })).toThrow(InvalidApprovalDecisionError)
  })

  it('rejects malformed requirement subjects and eligibility declarations', () => {
    expect(() => ApprovalRequirement.from({ ...requirement, subject: null })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from({ ...requirement, subject: [] })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from({ ...requirement, subject: { type: 'invoice' } })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, subject: { type: '', id: 'inv-42' } })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, eligibleActors: [] })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalRequirement.from({ ...requirement, eligibleActors: 'user-7' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, eligibleActors: [''] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, eligibleActors: ['user-7', 'user-7'] })).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('rejects non-decision outcomes and indistinguishable outcome semantics', () => {
    expect(() => ApprovalRequirement.from({ ...requirement, approvedOutcome: 'PENDING' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, rejectedOutcome: 'PENDING' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalRequirement.from({ ...requirement, rejectedOutcome: 'APPROVED' })).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('uses the requirement declared outcome mapping without assuming default labels', () => {
    const invertedRequirement = ApprovalRequirement.from({
      ...requirement,
      approvedOutcome: 'REJECTED',
      rejectedOutcome: 'APPROVED',
    })

    expect(invertedRequirement.stateForOutcome('REJECTED')).toBe('APPROVED')
    expect(invertedRequirement.stateForOutcome('APPROVED')).toBe('REJECTED')
    expect(() => invertedRequirement.stateForOutcome('PENDING' as never)).toThrow(InvalidApprovalDecisionError)
  })

  it('returns defensive requirement snapshots', () => {
    const approvalRequirement = ApprovalRequirement.from(requirement)
    const snapshot = approvalRequirement.toJSON() as { subject: { id: string }; eligibleActors: string[] }

    snapshot.subject.id = 'changed'
    snapshot.eligibleActors[0] = 'user-9'

    expect(approvalRequirement.toJSON()).toEqual(requirement)
  })
})
