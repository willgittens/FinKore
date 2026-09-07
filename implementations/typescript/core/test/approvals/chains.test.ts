import { describe, expect, it } from 'vitest'
import {
  ApprovalChain,
  ApprovalConditionUnresolvedError,
  InvalidApprovalChainError,
} from '../../src/index.js'

const unorderedChain = {
  mode: 'UNORDERED',
  requirements: ['manager', 'finance'],
  rejectionOutcome: 'REJECTED',
}

const sequentialChain = {
  mode: 'SEQUENTIAL',
  requirements: ['manager', 'finance', 'controller'],
  rejectionOutcome: 'REJECTED',
}

describe('Approval chains', () => {
  it('preserves declared mode, requirement order, and rejection outcome', () => {
    const chain = ApprovalChain.from(sequentialChain)

    expect(chain.mode).toBe('SEQUENTIAL')
    expect(chain.requirements).toEqual(['manager', 'finance', 'controller'])
    expect(chain.toJSON()).toEqual(sequentialChain)
  })

  it('requires one or more declared requirements, a mode, and a rejection outcome', () => {
    expect(() => ApprovalChain.from(null)).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from([])).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from({ ...unorderedChain, mode: 'PARALLEL' })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from({ ...unorderedChain, mode: undefined })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from({ ...unorderedChain, requirements: [] })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from({ ...unorderedChain, requirements: [7] })).toThrow(InvalidApprovalChainError)
    expect(() => ApprovalChain.from({ ...unorderedChain, requirements: ['manager', ''] })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalChain.from({ ...unorderedChain, rejectionOutcome: undefined })).toThrow(
      InvalidApprovalChainError,
    )
    expect(() => ApprovalChain.from({ ...unorderedChain, rejectionOutcome: 'PENDING' })).toThrow(
      InvalidApprovalChainError,
    )
  })

  it('approves an unordered all-required chain only when every applicable requirement is approved', () => {
    const chain = ApprovalChain.from(unorderedChain)

    expect(chain.evaluate({ manager: 'APPROVED', finance: 'APPROVED' })).toBe('APPROVED')
    expect(chain.evaluate({ manager: 'APPROVED', finance: 'PENDING' })).toBe('PENDING')
  })

  it('uses the declared rejection outcome when an effective rejection exists', () => {
    const chain = ApprovalChain.from(unorderedChain)

    expect(chain.evaluate({ manager: 'APPROVED', finance: 'REJECTED' })).toBe('REJECTED')
    expect(chain.evaluate({ manager: 'REJECTED', finance: 'PENDING' })).toBe('REJECTED')
  })

  it('does not interpret unordered chains as sequential active work', () => {
    const chain = ApprovalChain.from(unorderedChain)

    expect(chain.evaluate({ manager: 'PENDING', finance: 'PENDING' })).toBe('PENDING')
  })

  it('activates only the first pending applicable requirement in a sequential chain', () => {
    const chain = ApprovalChain.from(sequentialChain)

    expect(chain.evaluate({ manager: 'PENDING', finance: 'PENDING', controller: 'PENDING' })).toEqual({
      state: 'PENDING',
      activeRequirements: ['manager'],
    })
    expect(chain.evaluate({ manager: 'APPROVED', finance: 'PENDING', controller: 'PENDING' })).toEqual({
      state: 'PENDING',
      activeRequirements: ['finance'],
    })
    expect(chain.evaluate({ manager: 'APPROVED', finance: 'REJECTED', controller: 'PENDING' })).toBe('REJECTED')
  })

  it('preserves declared sequential order instead of inferring order from identifiers', () => {
    const chain = ApprovalChain.from({
      mode: 'SEQUENTIAL',
      requirements: ['z-review', 'a-review'],
      rejectionOutcome: 'REJECTED',
    })

    expect(chain.evaluate({ 'z-review': 'PENDING', 'a-review': 'PENDING' })).toEqual({
      state: 'PENDING',
      activeRequirements: ['z-review'],
    })
  })

  it('excludes explicitly not-applicable requirements from completion', () => {
    const chain = ApprovalChain.from(sequentialChain)

    expect(chain.evaluate({ manager: 'NOT_APPLICABLE', finance: 'APPROVED', controller: 'APPROVED' })).toBe(
      'APPROVED',
    )
    expect(chain.evaluate({ manager: 'APPROVED', finance: 'NOT_APPLICABLE', controller: 'PENDING' })).toEqual({
      state: 'PENDING',
      activeRequirements: ['controller'],
    })
  })

  it('does not silently skip unresolved or missing requirement states', () => {
    const chain = ApprovalChain.from(unorderedChain)

    expect(() => chain.evaluate({ manager: 'APPROVED' })).toThrow(InvalidApprovalChainError)
    expect(() => chain.evaluate({ manager: 'APPROVED', finance: 'UNRESOLVED' })).toThrow(
      ApprovalConditionUnresolvedError,
    )
    expect(() => chain.evaluate({ manager: 'APPROVED', finance: 'UNKNOWN' })).toThrow(InvalidApprovalChainError)
    expect(() => chain.evaluate(null)).toThrow(InvalidApprovalChainError)
  })

  it('returns defensive snapshots and requirement lists', () => {
    const chain = ApprovalChain.from(sequentialChain)
    const requirements = chain.requirements as string[]
    const snapshot = chain.toJSON() as { requirements: string[] }

    requirements[0] = 'changed'
    snapshot.requirements[0] = 'changed'

    expect(chain.requirements).toEqual(['manager', 'finance', 'controller'])
    expect(chain.toJSON()).toEqual(sequentialChain)
  })
})
