/**
 * State identifier for FinKore Workflow definitions and instances.
 *
 * Identifiers are domain names and are preserved exactly. The TypeScript core
 * does not normalize case, whitespace, or labels into alternate forms.
 *
 * @see WORKFLOW-STATES-001
 * @see WORKFLOW-STATES-005
 */
export type WorkflowStateIdentifier = string

/**
 * Portable FinKore Workflow error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see WORKFLOW-ERROR-001
 * @see WORKFLOW-ERROR-003
 */
export type WorkflowErrorCode =
  | 'FINKORE_WORKFLOW_INVALID_DEFINITION'
  | 'FINKORE_WORKFLOW_INVALID_STATE'
  | 'FINKORE_WORKFLOW_INVALID_TRANSITION'
  | 'FINKORE_WORKFLOW_GUARD_REJECTED'
  | 'FINKORE_WORKFLOW_TERMINAL_STATE'

/**
 * Guard condition supported by the Draft 0.1 TypeScript Workflow milestone.
 *
 * The condition deterministically compares one supplied fact to an expected
 * value. Authorization evidence may be supplied as an ordinary fact, but this
 * type assumes no authorization model. Broader guard languages, callbacks, and
 * external fact capture remain outside this Workflow milestone.
 *
 * @see WORKFLOW-GUARD-001
 * @see WORKFLOW-GUARD-002
 * @see WORKFLOW-GUARD-004
 * @see WORKFLOW-GUARD-005
 */
export interface WorkflowTransitionGuard {
  /** Fact key to read from a transition request's supplied facts. */
  readonly fact: string

  /** Expected value for the named fact. */
  readonly equals: unknown
}

/**
 * Declared directed transition between two states in a Workflow definition.
 *
 * A transition from `source` to `target` does not imply its reverse. A
 * self-transition is valid only when this exact directed pair is declared.
 *
 * @see WORKFLOW-TRANSITION-001
 * @see WORKFLOW-TRANSITION-002
 */
export interface WorkflowTransitionDefinition {
  /** Required current state before the transition may be requested. */
  readonly source: WorkflowStateIdentifier

  /** State that becomes current after a successful transition. */
  readonly target: WorkflowStateIdentifier

  /**
   * Optional Draft 0.1 fact-equality guard for this transition.
   *
   * This single-guard form is accepted for existing conformance fixtures.
   */
  readonly guard?: WorkflowTransitionGuard

  /**
   * Optional Draft 0.1 fact-equality guards that all apply to this transition.
   *
   * Every guard must pass before the transition succeeds.
   *
   * @see WORKFLOW-GUARD-002
   * @see WORKFLOW-GUARD-006
   */
  readonly guards?: readonly WorkflowTransitionGuard[]
}

/**
 * Input shape for creating a Workflow definition.
 *
 * The fields intentionally accept `unknown` at this boundary so the
 * implementation can reject invalid portable fixture values with specified
 * Workflow error codes.
 *
 * @see WORKFLOW-STATES-001
 * @see WORKFLOW-STATES-002
 * @see WORKFLOW-TRANSITION-001
 * @see WORKFLOW-TERMINAL-001
 */
export interface WorkflowDefinitionInput {
  /** Candidate state identifiers declared by the workflow. */
  readonly states?: unknown

  /** Candidate single initial state identifier. */
  readonly initialState?: unknown

  /** Invalid multi-start shape used by conformance to verify rejection. */
  readonly initialStates?: unknown

  /** Candidate explicitly terminal state identifiers. */
  readonly terminalStates?: unknown

  /** Candidate directed transition declarations. */
  readonly transitions?: unknown
}

/**
 * Portable observation of a Workflow instance's current state.
 *
 * @see WORKFLOW-STATES-003
 * @see WORKFLOW-STATES-007
 */
export interface SerializedWorkflowInstance {
  /** The instance's exactly one current state. */
  readonly currentState: WorkflowStateIdentifier
}

/**
 * Explicit transition context for {@link Workflow.transition}.
 *
 * @see WORKFLOW-GUARD-001
 * @see WORKFLOW-GUARD-003
 */
export interface WorkflowTransitionOptions {
  /** Supplied facts available to declared fact-equality guards. */
  readonly facts?: Readonly<Record<string, unknown>>
}
