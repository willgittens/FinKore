// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  EntityStateConflictError,
  EntityValidationFailedError,
  FinKoreEntityError,
  ImmutableEntityError,
  InvalidEntityIdentityError,
  InvalidEntityMutationError,
  isFinKoreEntityError,
} from '../../src/index.js'

describe('Entity errors', () => {
  it('exposes current portable Entity codes used by Core 0.9 Entity behavior', () => {
    expect(new InvalidEntityIdentityError().code).toBe('FINKORE_ENTITY_INVALID_IDENTITY')
    expect(new ImmutableEntityError().code).toBe('FINKORE_ENTITY_IMMUTABLE')
    expect(new InvalidEntityMutationError().code).toBe('FINKORE_ENTITY_INVALID_MUTATION')
    expect(new EntityStateConflictError().code).toBe('FINKORE_ENTITY_STATE_CONFLICT')
    expect(new EntityValidationFailedError().code).toBe('FINKORE_ENTITY_VALIDATION_FAILED')
    expect(new FinKoreEntityError('FINKORE_ENTITY_INVALID_MUTATION', 'custom').name).toBe('FinKoreEntityError')
    expect(new InvalidEntityIdentityError().name).toBe('InvalidEntityIdentityError')
    expect(new ImmutableEntityError().name).toBe('ImmutableEntityError')
    expect(new InvalidEntityMutationError().name).toBe('InvalidEntityMutationError')
    expect(new EntityStateConflictError().name).toBe('EntityStateConflictError')
    expect(new EntityValidationFailedError().name).toBe('EntityValidationFailedError')
    expect(new InvalidEntityIdentityError().message).toBe('Invalid Entity identity')
    expect(new ImmutableEntityError().message).toBe('Entity data is immutable in the current state')
    expect(new InvalidEntityMutationError().message).toBe('Invalid Entity mutation')
    expect(new EntityStateConflictError().message).toBe('Entity state conflict')
    expect(new EntityValidationFailedError().message).toBe('Entity validation failed')
  })

  it('narrows FinKore Entity errors without relying on messages', () => {
    expect(isFinKoreEntityError(new InvalidEntityIdentityError())).toBe(true)
    expect(isFinKoreEntityError(new ImmutableEntityError())).toBe(true)
    expect(isFinKoreEntityError(new InvalidEntityMutationError())).toBe(true)
    expect(isFinKoreEntityError(new EntityValidationFailedError())).toBe(true)
    expect(isFinKoreEntityError(new FinKoreEntityError('FINKORE_ENTITY_INVALID_MUTATION', 'custom'))).toBe(true)
    expect(isFinKoreEntityError(new Error('Invalid Entity identity'))).toBe(false)
  })

  it('keeps optional diagnostic details separate from portable codes', () => {
    const details = { path: 'id' }
    const withDetails = new InvalidEntityIdentityError('custom', details)
    const withoutDetails = new InvalidEntityIdentityError('custom')

    expect(withDetails.code).toBe('FINKORE_ENTITY_INVALID_IDENTITY')
    expect(withDetails.message).toBe('custom')
    expect(withDetails.details).toBe(details)
    expect(withoutDetails.details).toBeUndefined()
  })

  it('preserves state-conflict diagnostic details when supplied', () => {
    const details = { reason: 'uncloneable' }
    const error = new EntityStateConflictError('custom', details)

    expect(error.code).toBe('FINKORE_ENTITY_STATE_CONFLICT')
    expect(error.details).toBe(details)
  })

  it('preserves mutability and validation diagnostic details when supplied', () => {
    const immutableDetails = { field: 'amount' }
    const mutationDetails = { field: 'changes' }
    const validationDetails = { findings: [{ rule: 'AMOUNT_POSITIVE', path: 'amount' }] }
    const immutable = new ImmutableEntityError('custom', immutableDetails)
    const invalidMutation = new InvalidEntityMutationError('custom', mutationDetails)
    const validation = new EntityValidationFailedError('custom', validationDetails)

    expect(immutable.code).toBe('FINKORE_ENTITY_IMMUTABLE')
    expect(immutable.details).toBe(immutableDetails)
    expect(invalidMutation.code).toBe('FINKORE_ENTITY_INVALID_MUTATION')
    expect(invalidMutation.details).toBe(mutationDetails)
    expect(validation.code).toBe('FINKORE_ENTITY_VALIDATION_FAILED')
    expect(validation.details).toBe(validationDetails)
  })
})
