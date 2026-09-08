import { describe, expect, it } from 'vitest'
import {
  EntityStateConflictError,
  FinKoreEntityError,
  InvalidEntityIdentityError,
  isFinKoreEntityError,
} from '../../src/index.js'

describe('Entity errors', () => {
  it('exposes current portable Entity codes used by the identity and lifecycle milestone', () => {
    expect(new InvalidEntityIdentityError().code).toBe('FINKORE_ENTITY_INVALID_IDENTITY')
    expect(new EntityStateConflictError().code).toBe('FINKORE_ENTITY_STATE_CONFLICT')
    expect(new FinKoreEntityError('FINKORE_ENTITY_INVALID_MUTATION', 'custom').name).toBe('FinKoreEntityError')
    expect(new InvalidEntityIdentityError().name).toBe('InvalidEntityIdentityError')
    expect(new EntityStateConflictError().name).toBe('EntityStateConflictError')
    expect(new InvalidEntityIdentityError().message).toBe('Invalid Entity identity')
    expect(new EntityStateConflictError().message).toBe('Entity state conflict')
  })

  it('narrows FinKore Entity errors without relying on messages', () => {
    expect(isFinKoreEntityError(new InvalidEntityIdentityError())).toBe(true)
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
})
