// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  ApprovalConditionUnresolvedError,
  ApprovalRequiredError,
  FinKoreApprovalError,
  IneligibleApprovalActorError,
  InvalidApprovalChainError,
  InvalidApprovalDecisionError,
  InvalidApprovalContextError,
  isFinKoreApprovalError,
} from '../../src/index.js'

describe('Approval errors', () => {
  it('exposes every currently specified portable Approval code', () => {
    expect(new ApprovalRequiredError().code).toBe('FINKORE_APPROVAL_REQUIRED')
    expect(new InvalidApprovalDecisionError().code).toBe('FINKORE_APPROVAL_INVALID_DECISION')
    expect(new IneligibleApprovalActorError().code).toBe('FINKORE_APPROVAL_INELIGIBLE_ACTOR')
    expect(new InvalidApprovalChainError().code).toBe('FINKORE_APPROVAL_INVALID_CHAIN')
    expect(new ApprovalConditionUnresolvedError().code).toBe('FINKORE_APPROVAL_CONDITION_UNRESOLVED')
    expect(new InvalidApprovalContextError().code).toBe('FINKORE_APPROVAL_INVALID_CONTEXT')
  })

  it('preserves TypeScript names, messages, and safe diagnostic details separately from portable codes', () => {
    const details = { requirementId: 'finance-review' }
    const base = new FinKoreApprovalError('FINKORE_APPROVAL_INVALID_DECISION', 'custom approval failure', { details })
    const invalidDecision = new InvalidApprovalDecisionError('invalid decision', details)
    const ineligibleActor = new IneligibleApprovalActorError('ineligible actor', details)
    const required = new ApprovalRequiredError('approval required', details)
    const unresolved = new ApprovalConditionUnresolvedError('condition unresolved', details)
    const invalidChain = new InvalidApprovalChainError('invalid chain', details)

    expect(base.name).toBe('FinKoreApprovalError')
    expect(base.message).toBe('custom approval failure')
    expect(base.details).toBe(details)
    expect(invalidDecision.name).toBe('InvalidApprovalDecisionError')
    expect(invalidDecision.message).toBe('invalid decision')
    expect(invalidDecision.details).toBe(details)
    expect(ineligibleActor.name).toBe('IneligibleApprovalActorError')
    expect(ineligibleActor.message).toBe('ineligible actor')
    expect(ineligibleActor.details).toBe(details)
    expect(required.name).toBe('ApprovalRequiredError')
    expect(required.message).toBe('approval required')
    expect(required.details).toBe(details)
    expect(unresolved.name).toBe('ApprovalConditionUnresolvedError')
    expect(unresolved.message).toBe('condition unresolved')
    expect(unresolved.details).toBe(details)
    expect(invalidChain.name).toBe('InvalidApprovalChainError')
    expect(invalidChain.message).toBe('invalid chain')
    expect(invalidChain.details).toBe(details)
  })

  it('omits diagnostic details when none are supplied', () => {
    expect(new InvalidApprovalDecisionError().message).toBe('Invalid Approval Decision')
    expect(new IneligibleApprovalActorError().message).toBe('Approval Actor is not eligible')
    expect(new ApprovalRequiredError().message).toBe('Approval is required')
    expect(new ApprovalConditionUnresolvedError().message).toBe('Approval condition is unresolved')
    expect(new InvalidApprovalChainError().message).toBe('Invalid Approval Chain')
    expect(new InvalidApprovalDecisionError().details).toBeUndefined()
  })

  it('narrows FinKore Approval errors without relying on messages', () => {
    expect(isFinKoreApprovalError(new ApprovalRequiredError())).toBe(true)
    expect(isFinKoreApprovalError(new Error('Approval is required'))).toBe(false)
    expect(isFinKoreApprovalError({ code: 'FINKORE_APPROVAL_REQUIRED' })).toBe(false)
  })
})
