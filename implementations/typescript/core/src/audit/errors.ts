import type { AuditErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinKore Audit domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or human-readable message.
 * Diagnostic details must not redefine the portable code.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see SPEC-ERROR-003
 * @see SPEC-ERROR-004
 * @see SPEC-ERROR-005
 */
export class FinKoreAuditError extends Error {
  /** Stable portable FinKore Audit error code. */
  readonly code: AuditErrorCode

  /** Optional implementation-provided structured context. */
  readonly details?: unknown

  /**
   * Creates a TypeScript Audit error carrying a portable FinKore code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: AuditErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinKoreAuditError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable `FINKORE_AUDIT_INVALID_EVENT` error.
 *
 * @see FINKORE_AUDIT_INVALID_EVENT
 * @see AUDIT-EVENT-001
 * @see AUDIT-EVENT-004
 * @see AUDIT-EVENT-005
 * @see AUDIT-ERROR-001
 */
export class InvalidAuditEventError extends FinKoreAuditError {
  /**
   * Creates an invalid-event Audit error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional diagnostic context.
   */
  constructor(message = 'Invalid Audit Event', details?: unknown) {
    super('FINKORE_AUDIT_INVALID_EVENT', message, { details })
    this.name = 'InvalidAuditEventError'
  }
}

/**
 * TypeScript representation of the portable `FINKORE_AUDIT_DUPLICATE_EVENT` error.
 *
 * @see FINKORE_AUDIT_DUPLICATE_EVENT
 * @see AUDIT-APPEND-003
 * @see AUDIT-ERROR-001
 */
export class DuplicateAuditEventError extends FinKoreAuditError {
  /**
   * Creates a duplicate-event Audit error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional diagnostic context.
   */
  constructor(message = 'Duplicate Audit Event identity', details?: unknown) {
    super('FINKORE_AUDIT_DUPLICATE_EVENT', message, { details })
    this.name = 'DuplicateAuditEventError'
  }
}

/**
 * TypeScript representation of the portable `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` error.
 *
 * @see FINKORE_AUDIT_APPEND_ONLY_VIOLATION
 * @see AUDIT-APPEND-001
 * @see AUDIT-APPEND-002
 */
export class AuditAppendOnlyViolationError extends FinKoreAuditError {
  /**
   * Creates an append-only-violation Audit error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional diagnostic context.
   */
  constructor(message = 'Audit history is append-only', details?: unknown) {
    super('FINKORE_AUDIT_APPEND_ONLY_VIOLATION', message, { details })
    this.name = 'AuditAppendOnlyViolationError'
  }
}

/**
 * TypeScript representation of the portable `FINKORE_AUDIT_REDACTION_INVALID` error.
 *
 * Redaction behavior is outside the Stage 1 Audit implementation, but the
 * portable code is exported because it is already defined by `/spec`.
 *
 * @see FINKORE_AUDIT_REDACTION_INVALID
 * @see AUDIT-REDACTION-001
 * @see AUDIT-REDACTION-003
 * @see AUDIT-REDACTION-006
 */
export class InvalidAuditRedactionError extends FinKoreAuditError {
  /**
   * Creates an invalid-redaction Audit error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional diagnostic context.
   */
  constructor(message = 'Invalid Audit redaction', details?: unknown) {
    super('FINKORE_AUDIT_REDACTION_INVALID', message, { details })
    this.name = 'InvalidAuditRedactionError'
  }
}

/**
 * TypeScript representation of the portable `FINKORE_AUDIT_ACTOR_INVALID` error.
 *
 * @see FINKORE_AUDIT_ACTOR_INVALID
 * @see AUDIT-ACTOR-001
 * @see AUDIT-ACTOR-002
 * @see AUDIT-ACTOR-004
 */
export class InvalidAuditActorError extends FinKoreAuditError {
  /**
   * Creates an invalid-actor Audit error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional diagnostic context.
   */
  constructor(message = 'Invalid Audit Actor', details?: unknown) {
    super('FINKORE_AUDIT_ACTOR_INVALID', message, { details })
    this.name = 'InvalidAuditActorError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinKore Audit error.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinKore Audit error from this implementation.
 */
export function isFinKoreAuditError(error: unknown): error is FinKoreAuditError {
  return error instanceof FinKoreAuditError
}
