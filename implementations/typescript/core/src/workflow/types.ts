// SPDX-License-Identifier: MPL-2.0
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
 * Stable opaque identity for a logical Workflow definition family.
 *
 * FinKore preserves this caller-supplied value exactly and does not derive
 * behavior from its internal format.
 *
 * @see WORKFLOW-VERSION-001
 * @see WORKFLOW-VERSION-002
 * @see WORKFLOW-VERSION-005
 */
export type WorkflowDefinitionIdentity = string

/**
 * Stable opaque identity for one immutable Workflow definition version.
 *
 * This value is distinct from Entity Revision, storage row versions, lock
 * tokens, counters, and timestamps unless a composing specification explicitly
 * binds those meanings.
 *
 * @see WORKFLOW-VERSION-001
 * @see WORKFLOW-VERSION-002
 * @see WORKFLOW-VERSION-004
 * @see WORKFLOW-VERSION-005
 */
export type WorkflowDefinitionVersionIdentity = string

/**
 * FinKore's fallback ordering convention for domains that elect to use it.
 *
 * When present, the definition version identity must be a positive base-10
 * integer string. The sequence is not a database counter, lock token, or
 * migration instruction.
 *
 * @see WORKFLOW-VERSION-006
 */
export type WorkflowDefinitionVersionSequence = 'DEFAULT'

/**
 * Observable binding to one Workflow definition version.
 *
 * Instances created or imported under a versioned Workflow definition use this
 * pair as their immutable governing definition until a future FinKore migration
 * operation explicitly changes it.
 *
 * @see WORKFLOW-VERSION-007
 * @see WORKFLOW-VERSION-008
 */
export interface WorkflowDefinitionVersionBinding {
  /** Bound logical Workflow definition family. */
  readonly definitionIdentity: WorkflowDefinitionIdentity

  /** Bound immutable Workflow definition version. */
  readonly definitionVersionIdentity: WorkflowDefinitionVersionIdentity
}

/**
 * Opaque revision of a Workflow instance observation.
 *
 * FinKore preserves this caller-supplied value exactly for import and conflict
 * precondition checks. It is not a database lock token, storage counter, Entity
 * Revision, timestamp, or revision-generation policy.
 *
 * @see WORKFLOW-IMPORT-004
 * @see WORKFLOW-CONFLICT-004
 * @see WORKFLOW-CONFLICT-005
 */
export type WorkflowInstanceRevision = string

/**
 * Portable FinKore Workflow error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see WORKFLOW-ERROR-001
 * @see WORKFLOW-ERROR-003
 * @see WORKFLOW-ERROR-004
 * @see WORKFLOW-ERROR-005
 * @see WORKFLOW-ERROR-006
 */
export type WorkflowErrorCode =
  | 'FINKORE_WORKFLOW_INVALID_DEFINITION'
  | 'FINKORE_WORKFLOW_INVALID_INSTANCE'
  | 'FINKORE_WORKFLOW_INVALID_STATE'
  | 'FINKORE_WORKFLOW_INVALID_TRANSITION'
  | 'FINKORE_WORKFLOW_GUARD_REJECTED'
  | 'FINKORE_WORKFLOW_TERMINAL_STATE'
  | 'FINKORE_WORKFLOW_VERSION_MISMATCH'
  | 'FINKORE_WORKFLOW_STATE_CONFLICT'

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
 * @see WORKFLOW-VERSION-001
 * @see WORKFLOW-VERSION-006
 */
export interface WorkflowDefinitionInput {
  /** Optional candidate identity for a logical Workflow definition family. */
  readonly definitionIdentity?: unknown

  /** Optional candidate identity for one immutable Workflow definition version. */
  readonly definitionVersionIdentity?: unknown

  /** Optional fallback FinKore version ordering convention marker. */
  readonly versionSequence?: unknown

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

  /** Bound definition version for a versioned Workflow instance. */
  readonly binding?: WorkflowDefinitionVersionBinding

  /** Opaque revision of the instance observation, when supplied. */
  readonly revision?: WorkflowInstanceRevision
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

  /**
   * Optional exact current-state precondition for the transition request.
   *
   * Omission performs no expected-current-state check.
   *
   * @see WORKFLOW-CONFLICT-001
   * @see WORKFLOW-CONFLICT-002
   * @see WORKFLOW-CONFLICT-003
   */
  readonly expectedCurrentState?: unknown

  /**
   * Optional exact Workflow Instance Revision precondition.
   *
   * Omission performs no expected-revision check and does not imply a latest
   * revision or storage lock.
   *
   * @see WORKFLOW-CONFLICT-004
   * @see WORKFLOW-CONFLICT-005
   */
  readonly expectedRevision?: unknown
}
