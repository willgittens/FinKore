import { describe, expect, it } from 'vitest'
import {
  ApprovalCondition,
  ApprovalConditionUnresolvedError,
  InvalidApprovalDecisionError,
} from '../../src/index.js'

const condition = {
  id: 'finance-required',
  requiredFacts: ['totalAmount', 'country'],
  evaluation: 'composing-domain',
}

describe('Approval conditions', () => {
  it('preserves stable identity, required facts, and evaluation ownership', () => {
    const approvalCondition = ApprovalCondition.from(condition)

    expect(approvalCondition.id).toBe('finance-required')
    expect(approvalCondition.requiredFacts).toEqual(['totalAmount', 'country'])
    expect(approvalCondition.toJSON()).toEqual(condition)
  })

  it('does not infer identity or accept malformed required fact declarations', () => {
    expect(() => ApprovalCondition.from(null)).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from([])).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from({ ...condition, id: '' })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from({ ...condition, id: 7 })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from({ ...condition, requiredFacts: [] })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from({ ...condition, requiredFacts: 'totalAmount' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalCondition.from({ ...condition, requiredFacts: ['totalAmount', ''] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalCondition.from({ ...condition, requiredFacts: ['totalAmount', 7] })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => ApprovalCondition.from({ ...condition, requiredFacts: ['totalAmount', 'totalAmount'] })).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('requires explicit evaluation ownership without interpreting it', () => {
    expect(() => ApprovalCondition.from({ ...condition, evaluation: '' })).toThrow(InvalidApprovalDecisionError)
    expect(() => ApprovalCondition.from({ ...condition, evaluation: 7 })).toThrow(InvalidApprovalDecisionError)

    expect(ApprovalCondition.from({ ...condition, evaluation: 'domain-rule-v2' }).toJSON()).toEqual({
      ...condition,
      evaluation: 'domain-rule-v2',
    })
  })

  it('returns only an explicit composing-domain applicable or not-applicable result', () => {
    const approvalCondition = ApprovalCondition.from(condition)
    const facts = { totalAmount: { amount: '9000.00', currency: 'EUR' }, country: 'DE' }

    expect(approvalCondition.evaluate({ facts, result: 'APPLICABLE' })).toBe('APPLICABLE')
    expect(approvalCondition.evaluate({ facts, result: 'NOT_APPLICABLE' })).toBe('NOT_APPLICABLE')
    expect(() => approvalCondition.evaluate({ facts })).toThrow(ApprovalConditionUnresolvedError)
    expect(() => approvalCondition.evaluate({ facts, result: 'PENDING' })).toThrow(ApprovalConditionUnresolvedError)
  })

  it('does not treat missing required facts as not applicable', () => {
    const approvalCondition = ApprovalCondition.from(condition)

    expect(() => approvalCondition.evaluate({ facts: { totalAmount: 0 }, result: 'NOT_APPLICABLE' })).toThrow(
      ApprovalConditionUnresolvedError,
    )
    expect(() => approvalCondition.evaluate({ facts: {}, result: 'APPLICABLE' })).toThrow(
      ApprovalConditionUnresolvedError,
    )
  })

  it('counts null, false, zero, and empty string as present facts', () => {
    const approvalCondition = ApprovalCondition.from({
      ...condition,
      requiredFacts: ['nullable', 'falseValue', 'zeroValue', 'emptyValue'],
    })
    const facts = { nullable: null, falseValue: false, zeroValue: 0, emptyValue: '' }

    expect(approvalCondition.evaluate({ facts, result: 'APPLICABLE' })).toBe('APPLICABLE')
    expect(approvalCondition.evaluate({ facts, result: 'NOT_APPLICABLE' })).toBe('NOT_APPLICABLE')
  })

  it('supports nested fact identity without evaluating fact values', () => {
    const approvalCondition = ApprovalCondition.from({
      id: 'nested-facts',
      requiredFacts: ['invoice.amount', 'invoice.country'],
      evaluation: 'composing-domain',
    })

    expect(
      approvalCondition.evaluate({
        facts: { invoice: { amount: 0, country: '' } },
        result: 'NOT_APPLICABLE',
      }),
    ).toBe('NOT_APPLICABLE')
    expect(() =>
      approvalCondition.evaluate({
        facts: { invoice: { amount: 0 } },
        result: 'NOT_APPLICABLE',
      }),
    ).toThrow(ApprovalConditionUnresolvedError)
  })

  it('rejects malformed fact containers without creating a false evaluation result', () => {
    const approvalCondition = ApprovalCondition.from(condition)

    expect(() => approvalCondition.evaluate({ facts: null, result: 'NOT_APPLICABLE' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => approvalCondition.evaluate({ facts: [], result: 'NOT_APPLICABLE' })).toThrow(
      InvalidApprovalDecisionError,
    )
    expect(() => approvalCondition.evaluate({ facts: 7, result: 'NOT_APPLICABLE' })).toThrow(
      InvalidApprovalDecisionError,
    )
  })

  it('is deterministic for the same condition, facts, and explicit result', () => {
    const approvalCondition = ApprovalCondition.from(condition)
    const facts = { country: 'DE', totalAmount: { currency: 'EUR', amount: '9000.00' } }

    expect(approvalCondition.evaluate({ facts, result: 'APPLICABLE' })).toBe('APPLICABLE')
    expect(approvalCondition.evaluate({ facts, result: 'APPLICABLE' })).toBe('APPLICABLE')
    expect(approvalCondition.evaluate({ facts, result: 'NOT_APPLICABLE' })).toBe('NOT_APPLICABLE')
    expect(approvalCondition.evaluate({ facts, result: 'NOT_APPLICABLE' })).toBe('NOT_APPLICABLE')
  })

  it('returns defensive condition snapshots and required fact lists', () => {
    const approvalCondition = ApprovalCondition.from(condition)
    const facts = approvalCondition.requiredFacts as string[]
    const snapshot = approvalCondition.toJSON() as { id: string; requiredFacts: string[] }

    facts[0] = 'changed'
    snapshot.id = 'changed'
    snapshot.requiredFacts[0] = 'changed'

    expect(approvalCondition.requiredFacts).toEqual(['totalAmount', 'country'])
    expect(approvalCondition.toJSON()).toEqual(condition)
  })
})
