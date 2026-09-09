// SPDX-License-Identifier: MPL-2.0
import type { EntityErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinKore Entity domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or the human-readable
 * message.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see ENTITY-ERROR-001
 */
export class FinKoreEntityError extends Error {
  /** Stable portable FinKore Entity error code. */
  readonly code: EntityErrorCode

  /** Optional implementation-provided structured context. */
  readonly details?: unknown

  /**
   * Creates a TypeScript Entity error carrying a portable FinKore code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: EntityErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinKoreEntityError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_ENTITY_INVALID_IDENTITY` domain error.
 *
 * @see FINKORE_ENTITY_INVALID_IDENTITY
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-ERROR-001
 */
export class InvalidEntityIdentityError extends FinKoreEntityError {
  /**
   * Creates an invalid-identity Entity error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Entity identity', details?: unknown) {
    super('FINKORE_ENTITY_INVALID_IDENTITY', message, { details })
    this.name = 'InvalidEntityIdentityError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_ENTITY_IMMUTABLE` domain error.
 *
 * @see FINKORE_ENTITY_IMMUTABLE
 * @see ENTITY-MUTABILITY-002
 * @see ENTITY-MUTABILITY-004
 * @see ENTITY-ERROR-001
 */
export class ImmutableEntityError extends FinKoreEntityError {
  /**
   * Creates an immutable Entity data error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Entity data is immutable in the current state', details?: unknown) {
    super('FINKORE_ENTITY_IMMUTABLE', message, { details })
    this.name = 'ImmutableEntityError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_ENTITY_INVALID_MUTATION` domain error.
 *
 * @see FINKORE_ENTITY_INVALID_MUTATION
 * @see ENTITY-ERROR-001
 */
export class InvalidEntityMutationError extends FinKoreEntityError {
  /**
   * Creates an invalid-mutation Entity error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Entity mutation', details?: unknown) {
    super('FINKORE_ENTITY_INVALID_MUTATION', message, { details })
    this.name = 'InvalidEntityMutationError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_ENTITY_STATE_CONFLICT` domain error.
 *
 * @see FINKORE_ENTITY_STATE_CONFLICT
 * @see ENTITY-LIFECYCLE-006
 * @see ENTITY-ERROR-001
 */
export class EntityStateConflictError extends FinKoreEntityError {
  /**
   * Creates a state-conflict Entity error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Entity state conflict', details?: unknown) {
    super('FINKORE_ENTITY_STATE_CONFLICT', message, { details })
    this.name = 'EntityStateConflictError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_ENTITY_VALIDATION_FAILED` domain error.
 *
 * The optional details may include safe validation findings. Human-readable
 * messages and sensitive field values are not portable Entity semantics.
 *
 * @see FINKORE_ENTITY_VALIDATION_FAILED
 * @see ENTITY-VALIDATION-004
 * @see ENTITY-VALIDATION-008
 * @see ENTITY-ERROR-001
 */
export class EntityValidationFailedError extends FinKoreEntityError {
  /**
   * Creates an Entity validation failure error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe validation findings or diagnostic context.
   */
  constructor(message = 'Entity validation failed', details?: unknown) {
    super('FINKORE_ENTITY_VALIDATION_FAILED', message, { details })
    this.name = 'EntityValidationFailedError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinKore Entity error.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinKore Entity error from this
 * implementation.
 */
export function isFinKoreEntityError(error: unknown): error is FinKoreEntityError {
  return error instanceof FinKoreEntityError
}
