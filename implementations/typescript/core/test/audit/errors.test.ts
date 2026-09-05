import { describe, expect, it } from 'vitest'
import {
  AuditAppendOnlyViolationError,
  DuplicateAuditEventError,
  FinKoreAuditError,
  InvalidAuditActorError,
  InvalidAuditEventError,
  InvalidAuditRedactionError,
  isFinKoreAuditError,
} from '../../src/index.js'

describe('Audit errors', () => {
  it('exposes every currently specified portable Audit code', () => {
    expect(new InvalidAuditEventError().code).toBe('FINKORE_AUDIT_INVALID_EVENT')
    expect(new DuplicateAuditEventError().code).toBe('FINKORE_AUDIT_DUPLICATE_EVENT')
    expect(new AuditAppendOnlyViolationError().code).toBe('FINKORE_AUDIT_APPEND_ONLY_VIOLATION')
    expect(new InvalidAuditRedactionError().code).toBe('FINKORE_AUDIT_REDACTION_INVALID')
    expect(new InvalidAuditActorError().code).toBe('FINKORE_AUDIT_ACTOR_INVALID')
  })

  it('narrows FinKore Audit errors without relying on messages', () => {
    expect(isFinKoreAuditError(new InvalidAuditEventError())).toBe(true)
    expect(isFinKoreAuditError(new FinKoreAuditError('FINKORE_AUDIT_INVALID_EVENT', 'custom'))).toBe(true)
    expect(isFinKoreAuditError(new Error('Invalid Audit Event'))).toBe(false)
  })
})
