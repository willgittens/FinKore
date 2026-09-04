import { InvalidWorkflowDefinitionError } from './errors.js'
import type { WorkflowStateIdentifier, WorkflowTransitionDefinition, WorkflowTransitionGuard } from './types.js'

interface ValidatedWorkflowTransitionDefinition extends WorkflowTransitionDefinition {
  readonly guards: readonly WorkflowTransitionGuard[]
}

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null
}

function validateStateIdentifier(value: unknown): WorkflowStateIdentifier {
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvalidWorkflowDefinitionError()
  }
  return value
}

function validateStateList(value: unknown): readonly WorkflowStateIdentifier[] {
  if (!Array.isArray(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return value.map(validateStateIdentifier)
}

function validateGuard(value: unknown): WorkflowTransitionGuard {
  if (!isPlainRecord(value) || typeof value.fact !== 'string' || value.fact.length === 0 || !('equals' in value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return { fact: value.fact, equals: value.equals }
}

function validateGuards(value: unknown): readonly WorkflowTransitionGuard[] {
  if (!Array.isArray(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return value.map(validateGuard)
}

function validateTransition(value: unknown): ValidatedWorkflowTransitionDefinition {
  if (!isPlainRecord(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  const source = validateStateIdentifier(value.source)
  const target = validateStateIdentifier(value.target)
  const guard = value.guard
  const guards = value.guards
  if (guard !== undefined && guards !== undefined) {
    throw new InvalidWorkflowDefinitionError()
  }
  if (guards !== undefined) {
    return { source, target, guards: validateGuards(guards) }
  }
  if (guard !== undefined) {
    return { source, target, guards: [validateGuard(guard)] }
  }
  return { source, target, guards: [] }
}

function assertUnique(values: readonly string[]): void {
  if (new Set(values).size !== values.length) {
    throw new InvalidWorkflowDefinitionError()
  }
}

/**
 * Validated FinKore Workflow definition.
 *
 * Definitions declare exactly one initial state, explicit terminal states,
 * directed transitions between declared states, and optional fact-equality
 * guards attached to those transitions. This TypeScript representation is
 * immutable from callers' perspective and contains no persistence, versioning,
 * authorization model, or process-engine behavior.
 *
 * @see WORKFLOW-STATES-001
 * @see WORKFLOW-STATES-002
 * @see WORKFLOW-GUARD-001
 * @see WORKFLOW-GUARD-002
 * @see WORKFLOW-GUARD-006
 * @see WORKFLOW-TRANSITION-001
 * @see WORKFLOW-TERMINAL-001
 * @see WORKFLOW-TERMINAL-002
 * @see WORKFLOW-TERMINAL-004
 */
export class WorkflowDefinition {
  private readonly stateSet: ReadonlySet<WorkflowStateIdentifier>
  private readonly terminalStateSet: ReadonlySet<WorkflowStateIdentifier>
  private readonly transitionList: readonly ValidatedWorkflowTransitionDefinition[]

  /** State identifiers declared by this workflow definition. */
  readonly states: readonly WorkflowStateIdentifier[]

  /** The one deterministic initial state for new workflow instances. */
  readonly initialState: WorkflowStateIdentifier

  /** Explicit terminal state identifiers declared by this workflow definition. */
  readonly terminalStates: readonly WorkflowStateIdentifier[]

  private constructor(
    states: readonly WorkflowStateIdentifier[],
    initialState: WorkflowStateIdentifier,
    terminalStates: readonly WorkflowStateIdentifier[],
    transitions: readonly ValidatedWorkflowTransitionDefinition[],
  ) {
    this.states = states
    this.initialState = initialState
    this.terminalStates = terminalStates
    this.transitionList = transitions
    this.stateSet = new Set(states)
    this.terminalStateSet = new Set(terminalStates)
  }

  /**
   * Creates and validates a Workflow definition.
   *
   * @param input - Candidate definition containing states, initial state,
   * terminal states, directed transitions, and transition guard conditions.
   * @returns A validated Workflow definition.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates Draft 0.1 structural requirements.
   *
   * @see FINKORE_WORKFLOW_INVALID_DEFINITION
   * @see WORKFLOW-STATES-001
   * @see WORKFLOW-STATES-002
   * @see WORKFLOW-GUARD-001
   * @see WORKFLOW-GUARD-002
   * @see WORKFLOW-TRANSITION-001
   * @see WORKFLOW-TERMINAL-002
   */
  static from(input: unknown): WorkflowDefinition {
    if (!isPlainRecord(input)) {
      throw new InvalidWorkflowDefinitionError()
    }
    if ('initialStates' in input) {
      throw new InvalidWorkflowDefinitionError()
    }

    const states = validateStateList(input.states)
    assertUnique(states)

    const initialState = validateStateIdentifier(input.initialState)
    const stateSet = new Set(states)
    if (!stateSet.has(initialState)) {
      throw new InvalidWorkflowDefinitionError()
    }

    const terminalStates = validateStateList(input.terminalStates)
    assertUnique(terminalStates)
    for (const terminalState of terminalStates) {
      if (!stateSet.has(terminalState)) {
        throw new InvalidWorkflowDefinitionError()
      }
    }

    if (!Array.isArray(input.transitions)) {
      throw new InvalidWorkflowDefinitionError()
    }
    const transitions = input.transitions.map(validateTransition)
    for (const transition of transitions) {
      if (!stateSet.has(transition.source) || !stateSet.has(transition.target)) {
        throw new InvalidWorkflowDefinitionError()
      }
      if (terminalStates.includes(transition.source)) {
        throw new InvalidWorkflowDefinitionError()
      }
    }

    return new WorkflowDefinition([...states], initialState, [...terminalStates], transitions)
  }

  /**
   * Reports whether a state identifier belongs to this definition.
   *
   * @param state - Candidate state identifier.
   * @returns `true` when the state is declared exactly as supplied.
   *
   * @see WORKFLOW-STATES-004
   * @see WORKFLOW-STATES-005
   */
  hasState(state: WorkflowStateIdentifier): boolean {
    return this.stateSet.has(state)
  }

  /**
   * Reports whether a state is explicitly terminal.
   *
   * A name or the absence of declared outgoing transitions does not make a
   * state terminal.
   *
   * @param state - Candidate declared state identifier.
   * @returns `true` only when `terminalStates` explicitly lists the state.
   *
   * @see WORKFLOW-TERMINAL-001
   * @see WORKFLOW-TERMINAL-004
   */
  isTerminalState(state: WorkflowStateIdentifier): boolean {
    return this.terminalStateSet.has(state)
  }

  /**
   * Finds a declared directed transition from source to target.
   *
   * @param source - Required current state for the transition.
   * @param target - Requested target state.
   * @returns The matching transition when declared; otherwise `undefined`.
   *
   * @see WORKFLOW-TRANSITION-002
   * @see WORKFLOW-TRANSITION-003
   */
  transitionFrom(
    source: WorkflowStateIdentifier,
    target: WorkflowStateIdentifier,
  ): WorkflowTransitionDefinition | undefined {
    return this.transitionList.find((transition) => transition.source === source && transition.target === target)
  }
}
