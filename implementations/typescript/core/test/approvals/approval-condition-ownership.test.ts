// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { ApprovalCondition } from '../../src/index.js'

it('owns condition selectors after validating the caller declaration', () => {
  const declaration = { id: 'c', requiredFacts: ['invoice.amount'], evaluation: 'external' }
  const condition = ApprovalCondition.from(declaration)
  declaration.requiredFacts.push('missing')
  declaration.requiredFacts[0] = 'changed'
  expect(condition.requiredFacts).toEqual(['invoice.amount'])
  expect(condition.evaluate({ facts: { invoice: { amount: null } }, result: 'APPLICABLE' })).toBe('APPLICABLE')
})

it('keeps unmodified condition selectors valid', () => {
  const condition = ApprovalCondition.from({ id: 'c', requiredFacts: ['invoice.amount'], evaluation: 'external' })
  expect(condition.evaluate({ facts: { invoice: { amount: 0 } }, result: 'APPLICABLE' })).toBe('APPLICABLE')
})

it('rejects sparse native selector declarations with a portable error', () => {
  expect(() => ApprovalCondition.from({ id: 'c', requiredFacts: new Array<string>(1), evaluation: 'external' }))
    .toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
})
