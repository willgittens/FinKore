import type { WorkflowErrorCode } from './types.js'

/**
 * Base TypeScript error for portable FinKore Workflow domain failures.
 *
 * Consumers requiring cross-language semantics should rely on {@link code}
 * rather than this TypeScript-specific class name or the human-readable
 * message.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 * @see WORKFLOW-ERROR-001
 */
export class FinKoreWorkflowError extends Error {
  /** Stable portable FinKore Workflow error code. */
  readonly code: WorkflowErrorCode

  /**
   * Optional implementation-provided structured context.
   *
   * Additional details must not change the meaning of the portable code.
   *
   * @see WORKFLOW-ERROR-002
   */
  readonly details?: unknown

  /**
   * Creates a TypeScript Workflow error carrying a portable FinKore code.
   *
   * @param code - Stable portable error category.
   * @param message - Non-normative human-readable message.
   * @param options - Optional structured context for diagnostics.
   */
  constructor(code: WorkflowErrorCode, message: string, options: { readonly details?: unknown } = {}) {
    super(message)
    this.name = 'FinKoreWorkflowError'
    this.code = code
    if (options.details !== undefined) this.details = options.details
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_WORKFLOW_INVALID_DEFINITION` domain error.
 *
 * @see FINKORE_WORKFLOW_INVALID_DEFINITION
 * @see WORKFLOW-STATES-001
 * @see WORKFLOW-STATES-002
 * @see WORKFLOW-TRANSITION-001
 * @see WORKFLOW-TERMINAL-002
 */
export class InvalidWorkflowDefinitionError extends FinKoreWorkflowError {
  /**
   * Creates an invalid-definition Workflow error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Workflow definition', details?: unknown) {
    super('FINKORE_WORKFLOW_INVALID_DEFINITION', message, { details })
    this.name = 'InvalidWorkflowDefinitionError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_WORKFLOW_INVALID_STATE` domain error.
 *
 * @see FINKORE_WORKFLOW_INVALID_STATE
 * @see WORKFLOW-STATES-004
 * @see WORKFLOW-STATES-007
 */
export class InvalidWorkflowStateError extends FinKoreWorkflowError {
  /**
   * Creates an invalid-state Workflow error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Workflow state', details?: unknown) {
    super('FINKORE_WORKFLOW_INVALID_STATE', message, { details })
    this.name = 'InvalidWorkflowStateError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_WORKFLOW_INVALID_TRANSITION` domain error.
 *
 * @see FINKORE_WORKFLOW_INVALID_TRANSITION
 * @see WORKFLOW-TRANSITION-002
 * @see WORKFLOW-TRANSITION-003
 * @see WORKFLOW-TRANSITION-006
 */
export class InvalidWorkflowTransitionError extends FinKoreWorkflowError {
  /**
   * Creates an invalid-transition Workflow error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Invalid Workflow transition', details?: unknown) {
    super('FINKORE_WORKFLOW_INVALID_TRANSITION', message, { details })
    this.name = 'InvalidWorkflowTransitionError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_WORKFLOW_GUARD_REJECTED` domain error.
 *
 * @see FINKORE_WORKFLOW_GUARD_REJECTED
 * @see WORKFLOW-GUARD-002
 * @see WORKFLOW-GUARD-003
 */
export class WorkflowGuardRejectedError extends FinKoreWorkflowError {
  /**
   * Creates a guard-rejected Workflow error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Workflow guard rejected transition', details?: unknown) {
    super('FINKORE_WORKFLOW_GUARD_REJECTED', message, { details })
    this.name = 'WorkflowGuardRejectedError'
  }
}

/**
 * TypeScript representation of the portable
 * `FINKORE_WORKFLOW_TERMINAL_STATE` domain error.
 *
 * @see FINKORE_WORKFLOW_TERMINAL_STATE
 * @see WORKFLOW-ERROR-001
 * @see WORKFLOW-TERMINAL-003
 * @see WORKFLOW-TRANSITION-006
 */
export class WorkflowTerminalStateError extends FinKoreWorkflowError {
  /**
   * Creates a terminal-state Workflow error.
   *
   * @param message - Non-normative human-readable message.
   * @param details - Optional implementation-provided diagnostic context.
   */
  constructor(message = 'Workflow is in a terminal state', details?: unknown) {
    super('FINKORE_WORKFLOW_TERMINAL_STATE', message, { details })
    this.name = 'WorkflowTerminalStateError'
  }
}

/**
 * Narrows an unknown thrown value to a TypeScript FinKore Workflow error.
 *
 * @param error - Unknown thrown value.
 * @returns `true` when the value is a FinKore Workflow error from this
 * implementation.
 */
export function isFinKoreWorkflowError(error: unknown): error is FinKoreWorkflowError {
  return error instanceof FinKoreWorkflowError
}
