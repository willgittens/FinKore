// SPDX-License-Identifier: MPL-2.0
import { WorkflowDefinition } from './definition.js'
import {
  InvalidWorkflowInstanceError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowGuardRejectedError,
  WorkflowStateConflictError,
  WorkflowTerminalStateError,
  WorkflowVersionMismatchError,
} from './errors.js'
import type {
  SerializedWorkflowInstance,
  WorkflowDefinitionVersionBinding,
  WorkflowInstanceRevision,
  WorkflowStateIdentifier,
  WorkflowTransitionGuard,
  WorkflowTransitionOptions,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null
}

function factsFrom(options: WorkflowTransitionOptions | undefined): Readonly<Record<string, unknown>> {
  return options?.facts ?? {}
}

function guardsPass(guards: readonly WorkflowTransitionGuard[], facts: Readonly<Record<string, unknown>>): boolean {
  return guards.every((guard) => Object.is(facts[guard.fact], guard.equals))
}

function parseObservedBinding(value: unknown): WorkflowDefinitionVersionBinding {
  if (
    !isPlainRecord(value) ||
    typeof value.definitionIdentity !== 'string' ||
    value.definitionIdentity.length === 0 ||
    typeof value.definitionVersionIdentity !== 'string' ||
    value.definitionVersionIdentity.length === 0
  ) {
    throw new InvalidWorkflowInstanceError()
  }
  return {
    definitionIdentity: value.definitionIdentity,
    definitionVersionIdentity: value.definitionVersionIdentity,
  }
}

function bindingsMatch(left: WorkflowDefinitionVersionBinding, right: WorkflowDefinitionVersionBinding): boolean {
  return (
    left.definitionIdentity === right.definitionIdentity &&
    left.definitionVersionIdentity === right.definitionVersionIdentity
  )
}

function copyBinding(binding: WorkflowDefinitionVersionBinding): WorkflowDefinitionVersionBinding {
  return {
    definitionIdentity: binding.definitionIdentity,
    definitionVersionIdentity: binding.definitionVersionIdentity,
  }
}

function parseRevision(value: unknown): WorkflowInstanceRevision {
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvalidWorkflowInstanceError()
  }
  return value
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.hasOwn(value, key)
}

/**
 * TypeScript Workflow instance for FinKore state and transition semantics.
 *
 * A Workflow has exactly one current state from its definition. Successful
 * transitions update that current state after validation; rejected transitions
 * leave it unchanged.
 *
 * An explicitly terminal current state rejects every later transition request.
 * Workflow terminality governs transitions only; it does not imply broader
 * entity or metadata immutability.
 *
 * Versioned instances carry an immutable bound Workflow definition version.
 * Transition requests preserve that binding and reject a supplied definition
 * whose identity or version identity differs from the instance observation.
 * Imported instances may also carry a caller-supplied opaque Workflow Instance
 * Revision. FinKore preserves that revision exactly and does not generate,
 * increment, or interpret it as a storage lock.
 *
 * @see WORKFLOW-STATES-003
 * @see WORKFLOW-STATES-004
 * @see WORKFLOW-STATES-007
 * @see WORKFLOW-TRANSITION-005
 * @see WORKFLOW-TRANSITION-006
 * @see WORKFLOW-TERMINAL-001
 * @see WORKFLOW-TERMINAL-003
 * @see WORKFLOW-TERMINAL-004
 * @see WORKFLOW-VERSION-007
 * @see WORKFLOW-VERSION-008
 * @see WORKFLOW-VERSION-009
 * @see WORKFLOW-VERSION-010
 * @see WORKFLOW-IMPORT-001
 * @see WORKFLOW-IMPORT-004
 * @see WORKFLOW-IMPORT-005
 */
export class Workflow {
  /** Validated Workflow definition governing this instance. */
  readonly definition: WorkflowDefinition

  private state: WorkflowStateIdentifier
  private readonly boundDefinitionVersion: WorkflowDefinitionVersionBinding | undefined
  private readonly instanceRevision: WorkflowInstanceRevision | undefined

  private constructor(
    definition: WorkflowDefinition,
    currentState: WorkflowStateIdentifier,
    binding: WorkflowDefinitionVersionBinding | undefined,
    revision: WorkflowInstanceRevision | undefined,
  ) {
    this.definition = definition
    this.state = currentState
    this.boundDefinitionVersion = binding
    this.instanceRevision = revision
  }

  /**
   * Creates a new Workflow instance in the definition's initial state.
   *
   * Versioned definitions bind the new instance to the definition identity and
   * version identity supplied by the caller. The binding is preserved exactly
   * and is not derived from state names, transition lists, storage counters, or
   * Entity revisions.
   *
   * @param definitionInput - Candidate Workflow definition.
   * @returns A new Workflow instance whose current state is the declared
   * initial state, with a bound definition version when the definition is
   * versioned.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates structural or version metadata requirements.
   *
   * @see WORKFLOW-STATES-002
   * @see WORKFLOW-STATES-003
   * @see WORKFLOW-VERSION-007
   */
  static create(definitionInput: unknown): Workflow {
    const definition = WorkflowDefinition.from(definitionInput)
    return new Workflow(definition, definition.initialState, definition.versionBinding(), undefined)
  }

  /**
   * Imports a Workflow instance from an explicitly supplied observation.
   *
   * Import uses the supplied current state rather than the definition's initial
   * state. It validates the current state and version binding, preserves a
   * supplied opaque Workflow Instance Revision, and does not perform a
   * Transition Request, evaluate guards, create Audit evidence, or migrate
   * between definition versions.
   *
   * @param definitionInput - Candidate Workflow definition.
   * @param instance - Candidate Workflow instance observation.
   * @returns A Workflow instance at the supplied declared state, with supplied
   * binding and revision observations preserved where applicable.
   * @throws {InvalidWorkflowDefinitionError}
   * When the definition violates structural requirements.
   * @throws {InvalidWorkflowInstanceError}
   * When the instance observation is malformed, lacks current State, lacks a
   * required version binding, or carries a malformed revision.
   * @throws {InvalidWorkflowStateError}
   * When the supplied current state is undeclared.
   * @throws {WorkflowVersionMismatchError}
   * When the supplied definition identity or version identity differs from the
   * instance binding.
   *
   * @see FINKORE_WORKFLOW_INVALID_INSTANCE
   * @see FINKORE_WORKFLOW_INVALID_STATE
   * @see FINKORE_WORKFLOW_VERSION_MISMATCH
   * @see WORKFLOW-STATES-004
   * @see WORKFLOW-STATES-007
   * @see WORKFLOW-ERROR-004
   * @see WORKFLOW-ERROR-005
   * @see WORKFLOW-VERSION-007
   * @see WORKFLOW-VERSION-009
   * @see WORKFLOW-VERSION-010
   * @see WORKFLOW-IMPORT-001
   * @see WORKFLOW-IMPORT-002
   * @see WORKFLOW-IMPORT-003
   * @see WORKFLOW-IMPORT-004
   * @see WORKFLOW-IMPORT-005
   * @see WORKFLOW-IMPORT-006
   */
  static import(definitionInput: unknown, instance: unknown): Workflow {
    const definition = WorkflowDefinition.from(definitionInput)
    if (!isPlainRecord(instance) || !('currentState' in instance)) {
      throw new InvalidWorkflowInstanceError()
    }
    const expectedBinding = definition.versionBinding()
    let binding: WorkflowDefinitionVersionBinding | undefined
    if (expectedBinding !== undefined) {
      binding = parseObservedBinding(instance.binding)
      if (!bindingsMatch(binding, expectedBinding)) {
        throw new WorkflowVersionMismatchError()
      }
    } else if ('binding' in instance) {
      parseObservedBinding(instance.binding)
      throw new WorkflowVersionMismatchError()
    }

    const currentState = instance.currentState
    if (!definition.hasState(currentState as WorkflowStateIdentifier)) {
      throw new InvalidWorkflowStateError()
    }
    const revision = 'revision' in instance ? parseRevision(instance.revision) : undefined
    return new Workflow(definition, currentState as WorkflowStateIdentifier, binding, revision)
  }

  /**
   * Creates a Workflow instance at an explicitly supplied current state.
   *
   * This compatibility alias uses the same validation and preservation
   * semantics as {@link Workflow.import}.
   *
   * @param definitionInput - Candidate Workflow definition.
   * @param instance - Candidate Workflow instance observation.
   * @returns A Workflow instance at the supplied declared state.
   *
   * @see Workflow.import
   * @see WORKFLOW-IMPORT-001
   * @see WORKFLOW-IMPORT-005
   */
  static from(definitionInput: unknown, instance: unknown): Workflow {
    return Workflow.import(definitionInput, instance)
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
   * Returns the immutable bound Workflow definition version for this instance.
   *
   * Calling this method does not mutate the Workflow. Unversioned Draft 0.1
   * instances return `undefined`.
   *
   * @returns A defensive copy of the bound definition/version identity pair, or
   * `undefined` when the instance is unversioned.
   *
   * @see WORKFLOW-VERSION-007
   * @see WORKFLOW-VERSION-008
   */
  versionBinding(): WorkflowDefinitionVersionBinding | undefined {
    return this.boundDefinitionVersion === undefined ? undefined : copyBinding(this.boundDefinitionVersion)
  }

  /**
   * Returns the opaque Workflow Instance Revision supplied at import.
   *
   * FinKore preserves this value exactly and does not generate, increment,
   * order, or interpret it as storage state.
   *
   * @returns The caller-supplied revision, or `undefined` when none was
   * supplied.
   *
   * @see WORKFLOW-IMPORT-004
   */
  get revision(): WorkflowInstanceRevision | undefined {
    return this.instanceRevision
  }

  /**
   * Requests a declared directed transition to a target state.
   *
   * The current state is checked as the transition source, terminal-state
   * rejection takes precedence over undeclared-transition rejection, and every
   * declared fact-equality guard for the matched transition must pass before
   * the state changes. Failures leave current state and version binding
   * unchanged. Optional expected-current-state and expected-revision
   * preconditions are checked before terminal-state and transition validation.
   *
   * @param target - Requested target state.
   * @param options - Optional facts for declared guards and exact conflict
   * preconditions.
   * @returns This Workflow instance after a successful state change.
   * @throws {InvalidWorkflowStateError}
   * When the target state or supplied expected current state is missing or
   * undeclared.
   * @throws {WorkflowStateConflictError}
   * When an expected current state or expected revision does not exactly match
   * the observed Workflow instance.
   * @throws {WorkflowTerminalStateError}
   * When the current state is explicitly terminal.
   * @throws {InvalidWorkflowTransitionError}
   * When the directed transition is not declared from the current state.
   * @throws {WorkflowGuardRejectedError}
   * When a declared guard does not pass using supplied facts.
   *
   * @see FINKORE_WORKFLOW_INVALID_STATE
   * @see FINKORE_WORKFLOW_TERMINAL_STATE
   * @see FINKORE_WORKFLOW_INVALID_TRANSITION
   * @see FINKORE_WORKFLOW_GUARD_REJECTED
   * @see FINKORE_WORKFLOW_STATE_CONFLICT
   * @see WORKFLOW-ERROR-001
   * @see WORKFLOW-ERROR-003
   * @see WORKFLOW-ERROR-006
   * @see WORKFLOW-ERROR-007
   * @see WORKFLOW-CONFLICT-001
   * @see WORKFLOW-CONFLICT-002
   * @see WORKFLOW-CONFLICT-003
   * @see WORKFLOW-CONFLICT-004
   * @see WORKFLOW-CONFLICT-005
   * @see WORKFLOW-CONFLICT-006
   * @see WORKFLOW-CONFLICT-007
   * @see WORKFLOW-GUARD-001
   * @see WORKFLOW-GUARD-002
   * @see WORKFLOW-GUARD-003
   * @see WORKFLOW-GUARD-006
   * @see WORKFLOW-TRANSITION-002
   * @see WORKFLOW-TRANSITION-003
   * @see WORKFLOW-TRANSITION-004
   * @see WORKFLOW-TRANSITION-005
   * @see WORKFLOW-TRANSITION-006
   * @see WORKFLOW-TRANSITION-007
   * @see WORKFLOW-TERMINAL-003
   * @see WORKFLOW-TERMINAL-004
   * @see WORKFLOW-VERSION-008
   * @see WORKFLOW-VERSION-009
   */
  transition(target: unknown, options?: WorkflowTransitionOptions): Workflow {
    if (!this.definition.hasState(target as WorkflowStateIdentifier)) {
      throw new InvalidWorkflowStateError()
    }
    const requestedTarget = target as WorkflowStateIdentifier
    if (options !== undefined && hasOwn(options, 'expectedCurrentState')) {
      if (!this.definition.hasState(options.expectedCurrentState as WorkflowStateIdentifier)) {
        throw new InvalidWorkflowStateError()
      }
      if (options.expectedCurrentState !== this.state) {
        throw new WorkflowStateConflictError()
      }
    }
    if (options !== undefined && hasOwn(options, 'expectedRevision')) {
      if (options.expectedRevision !== this.instanceRevision) {
        throw new WorkflowStateConflictError()
      }
    }
    if (this.definition.isTerminalState(this.state)) {
      throw new WorkflowTerminalStateError()
    }

    const transition = this.definition.transitionFrom(this.state, requestedTarget)
    if (transition === undefined) {
      throw new InvalidWorkflowTransitionError()
    }

    if (!guardsPass(transition.guards!, factsFrom(options))) {
      throw new WorkflowGuardRejectedError()
    }

    this.state = requestedTarget
    return this
  }

  /**
   * Returns the portable observation for this Workflow instance.
   *
   * Calling this method does not mutate the Workflow. Versioned instances
   * include the exact bound Workflow definition version.
   *
   * @returns An object containing the instance's current state and, when
   * versioned, a defensive binding observation.
   *
   * @see WORKFLOW-STATES-003
   * @see WORKFLOW-STATES-007
   * @see WORKFLOW-VERSION-007
   * @see WORKFLOW-IMPORT-004
   * @see WORKFLOW-IMPORT-005
   */
  toJSON(): SerializedWorkflowInstance {
    const binding = this.versionBinding()
    const revision = this.instanceRevision
    if (binding === undefined) {
      return revision === undefined ? { currentState: this.state } : { currentState: this.state, revision }
    }
    return revision === undefined ? { currentState: this.state, binding } : { currentState: this.state, binding, revision }
  }
}
