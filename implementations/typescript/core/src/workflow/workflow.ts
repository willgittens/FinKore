import { WorkflowDefinition } from './definition.js'
import {
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowGuardRejectedError,
  WorkflowTerminalStateError,
} from './errors.js'
import type {
  SerializedWorkflowInstance,
  WorkflowStateIdentifier,
  WorkflowTransitionGuard,
  WorkflowTransitionOptions,
} from './types.js'

function validateRequestedState(value: unknown): WorkflowStateIdentifier {
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvalidWorkflowStateError()
  }
  return value
}

function factsFrom(options: WorkflowTransitionOptions | undefined): Readonly<Record<string, unknown>> {
  return options?.facts ?? {}
}

function guardsPass(guards: readonly WorkflowTransitionGuard[], facts: Readonly<Record<string, unknown>>): boolean {
  return guards.every((guard) => Object.is(facts[guard.fact], guard.equals))
}

/**
 * TypeScript Workflow instance for Draft 0.1 state and transition semantics.
 *
 * A Workflow has exactly one current state from its definition. Successful
 * transitions update that current state after validation; rejected transitions
 * leave it unchanged.
 *
 * An explicitly terminal current state rejects every later transition request.
 * Workflow terminality governs transitions only; it does not imply broader
 * entity or metadata immutability.
 *
 * @see WORKFLOW-STATES-003
 * @see WORKFLOW-STATES-004
 * @see WORKFLOW-STATES-007
 * @see WORKFLOW-TRANSITION-005
 * @see WORKFLOW-TRANSITION-006
 * @see WORKFLOW-TERMINAL-001
 * @see WORKFLOW-TERMINAL-003
 * @see WORKFLOW-TERMINAL-004
 */
export class Workflow {
  /** Validated Workflow definition governing this instance. */
  readonly definition: WorkflowDefinition

  private state: WorkflowStateIdentifier

  private constructor(definition: WorkflowDefinition, currentState: WorkflowStateIdentifier) {
    this.definition = definition
    this.state = currentState
  }

  /**
   * Creates a new Workflow instance in the definition's initial state.
   *
   * @param definitionInput - Candidate Workflow definition.
   * @returns A new Workflow instance whose current state is the declared
   * initial state.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates Draft 0.1 structural requirements.
   *
   * @see WORKFLOW-STATES-002
   * @see WORKFLOW-STATES-003
   */
  static create(definitionInput: unknown): Workflow {
    const definition = WorkflowDefinition.from(definitionInput)
    return new Workflow(definition, definition.initialState)
  }

  /**
   * Creates a Workflow instance at an explicitly supplied current state.
   *
   * This is intended for adapter/import boundaries that already have an
   * existing instance observation. It validates that the supplied current state
   * belongs to the definition.
   *
   * @param definitionInput - Candidate Workflow definition.
   * @param instance - Candidate current-state observation.
   * @returns A Workflow instance at the supplied declared state.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates Draft 0.1 structural requirements.
   * @throws {InvalidWorkflowStateError}
   * When the supplied current state is missing or undeclared.
   *
   * @see FINFLOW_WORKFLOW_INVALID_STATE
   * @see WORKFLOW-STATES-004
   * @see WORKFLOW-STATES-007
   */
  static from(definitionInput: unknown, instance: unknown): Workflow {
    const definition = WorkflowDefinition.from(definitionInput)
    if (typeof instance !== 'object' || instance === null || !('currentState' in instance)) {
      throw new InvalidWorkflowStateError()
    }
    const currentState = validateRequestedState((instance as { readonly currentState: unknown }).currentState)
    if (!definition.hasState(currentState)) {
      throw new InvalidWorkflowStateError()
    }
    return new Workflow(definition, currentState)
  }

  /**
   * The instance's exactly one current state.
   *
   * @see WORKFLOW-STATES-007
   */
  get currentState(): WorkflowStateIdentifier {
    return this.state
  }

  /**
   * Requests a declared directed transition to a target state.
   *
   * The current state is checked as the transition source, terminal-state
   * rejection takes precedence over undeclared-transition rejection, and every
   * declared fact-equality guard for the matched transition must pass before
   * the state changes. Failures leave current state unchanged.
   *
   * @param target - Requested target state.
   * @param options - Optional facts for declared guards.
   * @returns This Workflow instance after a successful state change.
   * @throws {InvalidWorkflowStateError}
   * When the target state is missing or undeclared.
   * @throws {WorkflowTerminalStateError}
   * When the current state is explicitly terminal.
   * @throws {InvalidWorkflowTransitionError}
   * When the directed transition is not declared from the current state.
   * @throws {WorkflowGuardRejectedError}
   * When a declared guard does not pass using supplied facts.
   *
   * @see FINFLOW_WORKFLOW_INVALID_STATE
   * @see FINFLOW_WORKFLOW_TERMINAL_STATE
   * @see FINFLOW_WORKFLOW_INVALID_TRANSITION
   * @see FINFLOW_WORKFLOW_GUARD_REJECTED
   * @see WORKFLOW-ERROR-001
   * @see WORKFLOW-ERROR-003
   * @see WORKFLOW-GUARD-001
   * @see WORKFLOW-GUARD-002
   * @see WORKFLOW-GUARD-003
   * @see WORKFLOW-GUARD-006
   * @see WORKFLOW-TRANSITION-002
   * @see WORKFLOW-TRANSITION-003
   * @see WORKFLOW-TRANSITION-004
   * @see WORKFLOW-TRANSITION-005
   * @see WORKFLOW-TRANSITION-006
   * @see WORKFLOW-TERMINAL-003
   * @see WORKFLOW-TERMINAL-004
   */
  transition(target: unknown, options?: WorkflowTransitionOptions): Workflow {
    const requestedTarget = validateRequestedState(target)
    if (!this.definition.hasState(requestedTarget)) {
      throw new InvalidWorkflowStateError()
    }
    if (this.definition.isTerminalState(this.state)) {
      throw new WorkflowTerminalStateError()
    }

    const transition = this.definition.transitionFrom(this.state, requestedTarget)
    if (transition === undefined) {
      throw new InvalidWorkflowTransitionError()
    }

    if (!guardsPass(transition.guards ?? [], factsFrom(options))) {
      throw new WorkflowGuardRejectedError()
    }

    this.state = requestedTarget
    return this
  }

  /**
   * Returns the portable current-state observation for this Workflow instance.
   *
   * Calling this method does not mutate the Workflow.
   *
   * @returns An object containing the instance's current state.
   *
   * @see WORKFLOW-STATES-003
   * @see WORKFLOW-STATES-007
   */
  toJSON(): SerializedWorkflowInstance {
    return { currentState: this.state }
  }
}
