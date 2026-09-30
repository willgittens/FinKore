// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { InvalidWorkflowDefinitionError } from './errors.js'
import type {
  WorkflowDefinitionIdentity,
  WorkflowDefinitionVersionBinding,
  WorkflowDefinitionVersionIdentity,
  WorkflowDefinitionVersionSequence,
  WorkflowStateIdentifier,
  WorkflowTransitionDefinition,
  WorkflowTransitionGuard,
} from './types.js'

interface ValidatedWorkflowTransitionDefinition extends WorkflowTransitionDefinition {
  readonly guards: readonly WorkflowTransitionGuard[]
}

type WorkflowDefinitionVersionMetadata =
  | { readonly kind: 'unversioned' }
  | {
      readonly kind: 'versioned'
      readonly definitionIdentity: WorkflowDefinitionIdentity
      readonly definitionVersionIdentity: WorkflowDefinitionVersionIdentity
      readonly versionSequence?: WorkflowDefinitionVersionSequence
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

function validateVersionIdentifier(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvalidWorkflowDefinitionError()
  }
  return value
}

function validateVersionMetadata(input: Readonly<Record<string, unknown>>): WorkflowDefinitionVersionMetadata {
  const hasDefinitionIdentity = 'definitionIdentity' in input
  const hasDefinitionVersionIdentity = 'definitionVersionIdentity' in input
  const hasVersionSequence = 'versionSequence' in input

  if (!hasDefinitionIdentity && !hasDefinitionVersionIdentity && !hasVersionSequence) {
    return { kind: 'unversioned' }
  }
  if (!hasDefinitionIdentity || !hasDefinitionVersionIdentity) {
    throw new InvalidWorkflowDefinitionError()
  }

  const definitionIdentity = validateVersionIdentifier(input.definitionIdentity)
  const definitionVersionIdentity = validateVersionIdentifier(input.definitionVersionIdentity)

  if (!hasVersionSequence) {
    return { kind: 'versioned', definitionIdentity, definitionVersionIdentity }
  }
  if (input.versionSequence !== 'DEFAULT' || !/^[1-9][0-9]*$/.test(definitionVersionIdentity)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return { kind: 'versioned', definitionIdentity, definitionVersionIdentity, versionSequence: 'DEFAULT' }
}

function validateStateList(value: unknown): readonly WorkflowStateIdentifier[] {
  if (!Array.isArray(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return Array.from(arrayValues(value), validateStateIdentifier)
}

function validateGuard(value: unknown): WorkflowTransitionGuard {
  if (!isPlainRecord(value) || typeof value.fact !== 'string' || value.fact.length === 0 || !('equals' in value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return Object.freeze({ fact: value.fact, equals: retainJson(value.equals) })
}

// Own the supported JSON tree without coercion or retaining caller aliases.
function retainJson(value: unknown, ancestors = new Set<object>()): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'object' || value === null || ancestors.has(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      return Object.freeze(Array.from(arrayValues(value), (item) => retainJson(item, ancestors)))
    }
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw new InvalidWorkflowDefinitionError()
    }
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, retainJson(item, ancestors)])))
  } finally {
    ancestors.delete(value)
  }
}

function validateGuards(value: unknown): readonly WorkflowTransitionGuard[] {
  if (!Array.isArray(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  return Array.from(arrayValues(value), validateGuard)
}

function validateTransition(value: unknown): ValidatedWorkflowTransitionDefinition {
  if (!isPlainRecord(value)) {
    throw new InvalidWorkflowDefinitionError()
  }
  const source = validateStateIdentifier(value.source)
  const target = validateStateIdentifier(value.target)
  const guards = 'guards' in value ? validateGuards(value.guards) : []
  if ('guard' in value) {
    if (guards.length !== 0) throw new InvalidWorkflowDefinitionError()
    return { source, target, guards: [validateGuard(value.guard)] }
  }
  return { source, target, guards }
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
 * guards attached to those transitions. They may also carry caller-supplied
 * opaque Workflow definition and version identities. This TypeScript
 * representation is immutable from callers' perspective and contains no
 * persistence, migration, authorization model, or process-engine behavior.
 *
 * @remarks Declaration collections validate every position; sparse arrays are malformed.
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
 * @see WORKFLOW-VERSION-001
 * @see WORKFLOW-VERSION-002
 * @see WORKFLOW-VERSION-005
 * @see WORKFLOW-VERSION-006
 */
export class WorkflowDefinition {
  private readonly stateSet: ReadonlySet<WorkflowStateIdentifier>
  private readonly terminalStateSet: ReadonlySet<WorkflowStateIdentifier>
  private readonly transitionList: readonly ValidatedWorkflowTransitionDefinition[]
  private readonly versionMetadata: WorkflowDefinitionVersionMetadata

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
    metadata: WorkflowDefinitionVersionMetadata,
  ) {
    this.states = Object.freeze(states)
    this.initialState = initialState
    this.terminalStates = Object.freeze(terminalStates)
    this.transitionList = Object.freeze(transitions.map((transition) => Object.freeze({
      ...transition, guards: Object.freeze(transition.guards),
    })))
    this.versionMetadata = metadata
    this.stateSet = new Set(states)
    this.terminalStateSet = new Set(terminalStates)
    Object.freeze(this)
  }

  /**
   * Creates and validates a Workflow definition.
   *
   * @param input - Candidate definition containing states, initial state,
   * terminal states, directed transitions, transition guard conditions, and
   * optional Workflow definition version metadata.
   * @returns A validated Workflow definition.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates Workflow structural or version metadata
   * requirements.
   *
   * @see FINKORE_WORKFLOW_INVALID_DEFINITION
   * @see WORKFLOW-STATES-001
   * @see WORKFLOW-STATES-002
   * @see WORKFLOW-GUARD-001
   * @see WORKFLOW-GUARD-002
   * @see WORKFLOW-TRANSITION-001
   * @see WORKFLOW-TERMINAL-002
   * @see WORKFLOW-VERSION-001
   * @see WORKFLOW-VERSION-006
   */
  static from(input: unknown): WorkflowDefinition {
    if (!isPlainRecord(input)) {
      throw new InvalidWorkflowDefinitionError()
    }
    if ('initialStates' in input) {
      throw new InvalidWorkflowDefinitionError()
    }

    const versionMetadata = validateVersionMetadata(input)

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
    const transitions = Array.from(arrayValues(input.transitions), validateTransition)
    for (const transition of transitions) {
      if (!stateSet.has(transition.source) || !stateSet.has(transition.target)) {
        throw new InvalidWorkflowDefinitionError()
      }
      if (terminalStates.includes(transition.source)) {
        throw new InvalidWorkflowDefinitionError()
      }
    }

    return new WorkflowDefinition([...states], initialState, [...terminalStates], transitions, versionMetadata)
  }

  /**
   * Reports whether this definition carries Workflow version metadata.
   *
   * @returns `true` when both definition and version identities are present.
   *
   * @see WORKFLOW-VERSION-001
   */
  get isVersioned(): boolean {
    return this.versionMetadata.kind === 'versioned'
  }

  /**
   * Opaque logical Workflow definition identity, when this definition is versioned.
   *
   * @returns The exact caller-supplied identity, or `undefined` for unversioned
   * definitions.
   *
   * @see WORKFLOW-VERSION-001
   * @see WORKFLOW-VERSION-002
   */
  get definitionIdentity(): WorkflowDefinitionIdentity | undefined {
    return this.versionMetadata.kind === 'versioned' ? this.versionMetadata.definitionIdentity : undefined
  }

  /**
   * Opaque Workflow definition version identity, when this definition is versioned.
   *
   * @returns The exact caller-supplied version identity, or `undefined` for
   * unversioned definitions.
   *
   * @see WORKFLOW-VERSION-001
   * @see WORKFLOW-VERSION-002
   * @see WORKFLOW-VERSION-004
   */
  get definitionVersionIdentity(): WorkflowDefinitionVersionIdentity | undefined {
    return this.versionMetadata.kind === 'versioned' ? this.versionMetadata.definitionVersionIdentity : undefined
  }

  /**
   * FinKore default sequence marker, when the caller elected to use it.
   *
   * @returns `DEFAULT` for definitions validated under FinKore's positive
   * integer sequence convention, otherwise `undefined`.
   *
   * @see WORKFLOW-VERSION-006
   */
  get versionSequence(): WorkflowDefinitionVersionSequence | undefined {
    return this.versionMetadata.kind === 'versioned' ? this.versionMetadata.versionSequence : undefined
  }

  /**
   * Returns the portable definition-version binding for versioned definitions.
   *
   * Calling this method does not mutate the definition. Unversioned
   * definitions return `undefined`.
   *
   * @returns The exact caller-supplied binding pair, or `undefined`.
   *
   * @see WORKFLOW-VERSION-007
   */
  versionBinding(): WorkflowDefinitionVersionBinding | undefined {
    if (this.versionMetadata.kind === 'unversioned') {
      return undefined
    }
    return {
      definitionIdentity: this.versionMetadata.definitionIdentity,
      definitionVersionIdentity: this.versionMetadata.definitionVersionIdentity,
    }
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
   * @returns The matching deeply frozen transition when declared; otherwise
   * `undefined`. Nested guard values are owned snapshots of the construction
   * input. Observations cannot change the retained predicate.
   *
   * @see WORKFLOW-TRANSITION-002
   * @see WORKFLOW-TRANSITION-003
   * @see WORKFLOW-VERSION-003
   */
  transitionFrom(
    source: WorkflowStateIdentifier,
    target: WorkflowStateIdentifier,
  ): WorkflowTransitionDefinition | undefined {
    return this.transitionList.find((transition) => transition.source === source && transition.target === target)
  }
}
