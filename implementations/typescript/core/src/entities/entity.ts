import { Workflow } from '../workflow/workflow.js'
import { InvalidWorkflowTransitionError } from '../workflow/errors.js'
import {
  EntityStateConflictError,
  ImmutableEntityError,
  InvalidEntityIdentityError,
  InvalidEntityMutationError,
} from './errors.js'
import type { EntityDefinition, SerializedFinancialEntity } from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidEntityIdentityError()
  return value
}

function cloneJsonValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new EntityStateConflictError('Entity data must be observable as portable structured data')
  }
}

function validateDefinition(input: unknown): EntityDefinition {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  return {
    type: requiredString(input.type),
    identityScope: requiredString(input.identityScope),
    workflow: input.workflow,
    mutability: validateMutability(input.mutability),
  }
}

function validateFieldList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) throw new InvalidEntityMutationError()
  return value.map((field) => {
    if (typeof field !== 'string' || field.length === 0) throw new InvalidEntityMutationError()
    return field
  })
}

function validateMutability(value: unknown): Readonly<Record<string, readonly string[]>> {
  if (!isPlainRecord(value)) throw new InvalidEntityMutationError()
  const mutability: Record<string, readonly string[]> = {}
  for (const [state, fields] of Object.entries(value)) {
    if (state.length === 0) throw new InvalidEntityMutationError()
    mutability[state] = validateFieldList(fields)
  }
  return mutability
}

function validateChanges(value: unknown): Readonly<Record<string, unknown>> {
  if (!isPlainRecord(value) || Object.keys(value).length === 0) throw new InvalidEntityMutationError()
  return value
}

function mutableFieldsFor(definition: EntityDefinition, state: string): ReadonlySet<string> {
  const fields = definition.mutability[state]
  if (fields === undefined) throw new InvalidEntityMutationError()
  return new Set(fields)
}

function validateSerializedEntity(definition: EntityDefinition, input: unknown): SerializedFinancialEntity {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  const type = requiredString(input.type)
  const id = requiredString(input.id)
  if (type !== definition.type) throw new InvalidEntityIdentityError()
  return {
    type,
    id,
    state: requiredString(input.state),
    data: cloneJsonValue(input.data),
  }
}

/**
 * Generic FinKore Financial Entity for identity, lifecycle, and mutability behavior.
 *
 * An Entity has caller-supplied opaque identity within a declared scope and
 * exactly one current lifecycle state governed by its referenced Workflow.
 * Successful lifecycle transitions preserve identity and data while returning a
 * new Entity observation at the target state. Rejected Workflow transitions
 * retain their Workflow portable error code and leave the original Entity
 * unchanged.
 *
 * Mutability means only whether a top-level Entity data field may change in the
 * current lifecycle state. It does not validate the proposed value against
 * composing-domain business rules. This milestone does not implement validation
 * rule engines, persistence, audit integration, workflow integration beyond the
 * referenced Workflow transition semantics, correction/reversal, supersession,
 * versioning, optimistic locking, or authorization.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-IDENTITY-002
 * @see ENTITY-IDENTITY-003
 * @see ENTITY-LIFECYCLE-001
 * @see ENTITY-LIFECYCLE-002
 * @see ENTITY-LIFECYCLE-003
 * @see ENTITY-LIFECYCLE-006
 * @see ENTITY-MUTABILITY-001
 * @see ENTITY-MUTABILITY-002
 * @see ENTITY-MUTABILITY-004
 * @see ENTITY-MUTABILITY-006
 * @see ENTITY-MUTABILITY-007
 * @see ENTITY-ERROR-001
 * @see ENTITY-ERROR-004
 */
export class FinancialEntity {
  /** Validated Entity definition governing this entity. */
  readonly definition: EntityDefinition

  private readonly value: SerializedFinancialEntity

  private constructor(definition: EntityDefinition, value: SerializedFinancialEntity) {
    this.definition = definition
    this.value = value
  }

  /**
   * Creates a new Financial Entity in its referenced Workflow's initial state.
   *
   * Identity is supplied by the caller and preserved exactly; this method never
   * generates, normalizes, or replaces it.
   *
   * @param definitionInput - Candidate composing-domain Entity definition.
   * @param id - Caller-supplied stable entity identifier.
   * @param data - Initial composing-domain data carried without interpretation.
   * @returns A new Financial Entity in the Workflow initial state.
   * @throws {InvalidEntityIdentityError}
   * When Entity type, identity scope, or entity identifier is missing or
   * malformed.
   * @throws {InvalidWorkflowDefinitionError}
   * When the referenced Workflow definition is invalid.
   *
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see ENTITY-IDENTITY-001
   * @see ENTITY-IDENTITY-002
   * @see ENTITY-LIFECYCLE-001
   * @see ENTITY-LIFECYCLE-002
   */
  static create(definitionInput: unknown, id: unknown, data: unknown): FinancialEntity {
    const definition = validateDefinition(definitionInput)
    const workflow = Workflow.create(definition.workflow)
    mutableFieldsFor(definition, workflow.currentState)
    return new FinancialEntity(definition, {
      type: definition.type,
      id: requiredString(id),
      state: workflow.currentState,
      data: cloneJsonValue(data),
    })
  }

  /**
   * Reconstructs a Financial Entity from an existing portable observation.
   *
   * The supplied state must be exactly one state declared by the referenced
   * Workflow. This method is for conformance/import boundaries and does not
   * infer identity from object position or regenerate missing identifiers.
   *
   * @param definitionInput - Candidate composing-domain Entity definition.
   * @param entityInput - Existing serialized Entity observation.
   * @returns A Financial Entity at the supplied declared lifecycle state.
   * @throws {InvalidEntityIdentityError}
   * When Entity identity or type is missing, malformed, or conflicts with the
   * definition.
   * @throws {InvalidWorkflowStateError}
   * When the current lifecycle state is missing or undeclared.
   *
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see FINKORE_WORKFLOW_INVALID_STATE
   * @see ENTITY-IDENTITY-001
   * @see ENTITY-LIFECYCLE-006
   */
  static from(definitionInput: unknown, entityInput: unknown): FinancialEntity {
    const definition = validateDefinition(definitionInput)
    const entity = validateSerializedEntity(definition, entityInput)
    Workflow.from(definition.workflow, { currentState: entity.state })
    mutableFieldsFor(definition, entity.state)
    return new FinancialEntity(definition, entity)
  }

  /**
   * Stable entity identifier exactly as supplied.
   *
   * @see ENTITY-IDENTITY-002
   * @see ENTITY-IDENTITY-003
   */
  get id(): string {
    return this.value.id
  }

  /**
   * Current lifecycle state exactly as declared by the referenced Workflow.
   *
   * @see ENTITY-LIFECYCLE-006
   */
  get state(): string {
    return this.value.state
  }

  /**
   * Requests a declared lifecycle transition.
   *
   * The transition is delegated to the referenced Workflow. On success this
   * method returns a new Entity with the same identity, type, and data at the
   * target state. If Workflow validation rejects the request, the thrown
   * Workflow error keeps its portable code and this Entity remains unchanged.
   *
   * @param target - Requested target lifecycle state.
   * @returns A new Financial Entity after the successful lifecycle transition.
   * @throws {InvalidWorkflowStateError}
   * When the target state is missing or undeclared.
   * @throws {InvalidWorkflowTransitionError}
   * When the directed transition is not declared from the current state.
   * @throws {WorkflowTerminalStateError}
   * When the current state is explicitly terminal.
   * @throws {WorkflowGuardRejectedError}
   * When a declared Workflow guard does not pass.
   *
   * @see ENTITY-IDENTITY-002
   * @see ENTITY-LIFECYCLE-003
   * @see ENTITY-ERROR-001
   * @see ENTITY-ERROR-004
   */
  transition(target: unknown): FinancialEntity {
    const workflow = Workflow.from(this.definition.workflow, { currentState: this.value.state })
    if (
      typeof target === 'string' &&
      !workflow.definition.isTerminalState(workflow.currentState) &&
      workflow.definition.transitionFrom(workflow.currentState, target) === undefined
    ) {
      throw new InvalidWorkflowTransitionError()
    }
    workflow.transition(target)
    return new FinancialEntity(this.definition, { ...this.value, state: workflow.currentState })
  }

  /**
   * Applies a declared top-level Entity data mutation.
   *
   * Every targeted field must be listed as mutable for the Entity's current
   * lifecycle state. Identity (`id`), Entity type (`type`), and lifecycle state
   * (`state`) are not data fields and cannot be changed through this generic
   * mutation boundary. A rejected mutation leaves identity, lifecycle state, and
   * all Entity data unchanged. A terminal state is not treated as globally
   * immutable; only its declared mutability list governs what may change.
   *
   * This method does not evaluate Entity Validation rules, business predicates,
   * schemas, audit policy, authorization, or persistence.
   *
   * @param changesInput - Top-level data field changes keyed by field name.
   * @returns A new Financial Entity containing the accepted data changes.
   * @throws {ImmutableEntityError}
   * When any targeted field is not declared mutable in the current state.
   * @throws {InvalidEntityMutationError}
   * When the mutation request shape is not recognized by this milestone.
   *
   * @see FINKORE_ENTITY_IMMUTABLE
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see ENTITY-IDENTITY-002
   * @see ENTITY-LIFECYCLE-003
   * @see ENTITY-MUTABILITY-001
   * @see ENTITY-MUTABILITY-002
   * @see ENTITY-MUTABILITY-004
   * @see ENTITY-MUTABILITY-006
   * @see ENTITY-MUTABILITY-007
   * @see ENTITY-ERROR-001
   */
  mutate(changesInput: unknown): FinancialEntity {
    if (!isPlainRecord(this.value.data)) throw new InvalidEntityMutationError()
    const changes = validateChanges(changesInput)
    const mutableFields = mutableFieldsFor(this.definition, this.value.state)

    for (const field of Object.keys(changes)) {
      if (field === 'id' || field === 'type' || field === 'state' || !mutableFields.has(field)) {
        throw new ImmutableEntityError()
      }
    }

    const data = cloneJsonValue({ ...this.value.data, ...changes })
    return new FinancialEntity(this.definition, { ...this.value, data })
  }

  /**
   * Returns the portable Entity observation.
   *
   * The returned value is a defensive copy. Mutating it cannot modify this
   * Entity's stable identity, lifecycle state, or data.
   *
   * @returns Serialized Financial Entity content.
   *
   * @see ENTITY-IDENTITY-002
   * @see ENTITY-LIFECYCLE-006
   */
  toJSON(): SerializedFinancialEntity {
    return cloneJsonValue(this.value)
  }
}
