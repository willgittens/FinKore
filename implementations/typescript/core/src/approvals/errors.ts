// SPDX-License-Identifier: MPL-2.0
import type { ApprovalErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinKore Approval domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or human-readable message.
 * Diagnostic details must not redefine the portable code or disclose restricted
 * eligibility or decision data.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see APPROVAL-ERROR-004
 */
export class FinKoreApprovalError extends Error {
  /** Stable portable FinKore Approval error code. */
  readonly code: ApprovalErrorCode

  /** Optional implementation-provided structured context. */
  readonly details?: unknown

  /**
   * Creates a TypeScript Approval error carrying a portable FinKore code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: ApprovalErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinKoreApprovalError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_APPROVAL_INVALID_DECISION` error.
 *
 * @see FINKORE_APPROVAL_INVALID_DECISION
 * @see APPROVAL-DECISION-001
 * @see APPROVAL-DECISION-005
 * @see APPROVAL-DECISION-006
 * @see APPROVAL-ERROR-001
 * @see APPROVAL-ERROR-005
 */
export class InvalidApprovalDecisionError extends FinKoreApprovalError {
  /**
   * Creates an invalid-decision Approval error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe diagnostic context.
   */
  constructor(message = 'Invalid Approval Decision', details?: unknown) {
    super('FINKORE_APPROVAL_INVALID_DECISION', message, { details })
    this.name = 'InvalidApprovalDecisionError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_APPROVAL_INELIGIBLE_ACTOR` error.
 *
 * @see FINKORE_APPROVAL_INELIGIBLE_ACTOR
 * @see APPROVAL-DECISION-004
 * @see APPROVAL-ERROR-001
 * @see APPROVAL-ERROR-005
 */
export class IneligibleApprovalActorError extends FinKoreApprovalError {
  /**
   * Creates an ineligible-actor Approval error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe diagnostic context.
   */
  constructor(message = 'Approval Actor is not eligible', details?: unknown) {
    super('FINKORE_APPROVAL_INELIGIBLE_ACTOR', message, { details })
    this.name = 'IneligibleApprovalActorError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_APPROVAL_REQUIRED` error.
 *
 * @see FINKORE_APPROVAL_REQUIRED
 * @see APPROVAL-ERROR-003
 * @see APPROVAL-REQUIREMENT-005
 */
export class ApprovalRequiredError extends FinKoreApprovalError {
  /**
   * Creates a missing-approval Approval error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe diagnostic context.
   */
  constructor(message = 'Approval is required', details?: unknown) {
    super('FINKORE_APPROVAL_REQUIRED', message, { details })
    this.name = 'ApprovalRequiredError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_APPROVAL_CONDITION_UNRESOLVED` error.
 *
 * Chain evaluation uses this error when a Requirement's applicability is
 * explicitly unresolved.
 *
 * @see FINKORE_APPROVAL_CONDITION_UNRESOLVED
 * @see APPROVAL-CONDITION-006
 */
export class ApprovalConditionUnresolvedError extends FinKoreApprovalError {
  /**
   * Creates an unresolved-condition Approval error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe diagnostic context.
   */
  constructor(message = 'Approval condition is unresolved', details?: unknown) {
    super('FINKORE_APPROVAL_CONDITION_UNRESOLVED', message, { details })
    this.name = 'ApprovalConditionUnresolvedError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_APPROVAL_INVALID_CHAIN` error.
 *
 * Used when a chain definition or chain-state evaluation input is structurally
 * invalid.
 *
 * @see FINKORE_APPROVAL_INVALID_CHAIN
 * @see APPROVAL-CHAIN-001
 * @see APPROVAL-CHAIN-002
 * @see APPROVAL-CHAIN-009
 */
export class InvalidApprovalChainError extends FinKoreApprovalError {
  /**
   * Creates an invalid-chain Approval error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional safe diagnostic context.
   */
  constructor(message = 'Invalid Approval Chain', details?: unknown) {
    super('FINKORE_APPROVAL_INVALID_CHAIN', message, { details })
    this.name = 'InvalidApprovalChainError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinKore Approval error.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinKore Approval error from this implementation.
 */
export function isFinKoreApprovalError(error: unknown): error is FinKoreApprovalError {
  return error instanceof FinKoreApprovalError
}
