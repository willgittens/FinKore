// SPDX-License-Identifier: MPL-2.0
import { Money } from '../money/money.js'
import { Workflow } from '../workflow/workflow.js'
import { WorkflowDefinition } from '../workflow/definition.js'
import { InvalidWorkflowInstanceError } from '../workflow/errors.js'
import {
  EntityValidationFailedError,
  EntityStateConflictError,
  ImmutableEntityError,
  InvalidEntityIdentityError,
  InvalidEntityMutationError,
} from './errors.js'
import type {
  EntityDefinition,
  EntityIdentityMapping,
  EntityImportResult,
  EntityImportSourceIdentity,
  EntityRevisionObservation,
  EntityValidationFinding,
  EntityValidationResult,
  EntityValidationRuleDefinition,
  SerializedFinancialEntity,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidEntityIdentityError()
  return value
}

function optionalIdentityString(value: unknown): string | undefined {
  if (value === undefined) return undefined
  return requiredString(value)
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
  const type = requiredString(input.type)
  const identityScope = requiredString(input.identityScope)
  const workflow = WorkflowDefinition.from(input.workflow)
  const mutability = validateMutability(input.mutability)
  for (const state of workflow.states) {
    if (!Object.hasOwn(mutability, state)) throw new InvalidEntityMutationError()
  }
  return {
    type,
    identityScope,
    workflow: cloneJsonValue(input.workflow),
    mutability,
    validation: validateValidationRules(input.validation),
  }
}

function validateValidationRules(value: unknown): readonly EntityValidationRuleDefinition[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidEntityMutationError()
  return value.map((candidate) => {
    if (!isPlainRecord(candidate)) throw new InvalidEntityMutationError()
    if (candidate.rule !== 'positive-money' && candidate.rule !== 'money-not-greater-than') throw new InvalidEntityMutationError()
    const identity = {
      id: requiredValidationString(candidate.id),
      path: requiredValidationString(candidate.path),
    }
    return candidate.rule === 'money-not-greater-than'
      ? { ...identity, rule: candidate.rule, otherPath: requiredValidationString(candidate.otherPath) }
      : { ...identity, rule: candidate.rule }
  })
}

function requiredValidationString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidEntityMutationError()
  return value
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
  return Object.fromEntries(Object.entries(value).map(([state, fields]) => {
    if (state.length === 0) throw new InvalidEntityMutationError()
    return [state, validateFieldList(fields)]
  }))
}

function validateChanges(value: unknown): Readonly<Record<string, unknown>> {
  if (!isPlainRecord(value) || Object.keys(value).length === 0) throw new InvalidEntityMutationError()
  return value
}

function mutableFieldsFor(definition: EntityDefinition, state: string): ReadonlySet<string> {
  const fields = definition.mutability[state]
  return new Set(fields)
}

function validateSerializedEntity(definition: EntityDefinition, input: unknown): SerializedFinancialEntity {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  const type = requiredString(input.type)
  const id = requiredString(input.id)
  if (type !== definition.type) throw new InvalidEntityIdentityError()
  if (typeof input.state !== 'string' || input.state.length === 0) throw new InvalidWorkflowInstanceError()
  const workflow = Workflow.from(definition.workflow, {
    currentState: input.state,
    ...(Object.hasOwn(input, 'binding') ? { binding: input.binding } : {}),
  })
  const binding = workflow.versionBinding()
  return {
    type,
    id,
    state: workflow.currentState,
    ...(binding === undefined ? {} : { binding }),
    data: cloneJsonValue(input.data),
  }
}

function validateSourceIdentity(input: unknown): EntityImportSourceIdentity {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  return {
    sourceSystem: requiredString(input.sourceSystem),
    sourceId: requiredString(input.sourceId),
  }
}

function validateIdentityMapping(input: unknown, sourceIdentity: EntityImportSourceIdentity | undefined, entity: SerializedFinancialEntity): EntityIdentityMapping {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  const mappedEntity = input.entity
  if (!isPlainRecord(mappedEntity)) throw new InvalidEntityIdentityError()
  const mapping = {
    mappingId: requiredString(input.mappingId),
    sourceSystem: requiredString(input.sourceSystem),
    sourceId: requiredString(input.sourceId),
    entity: {
      type: requiredString(mappedEntity.type),
      id: requiredString(mappedEntity.id),
    },
  }
  if (
    (sourceIdentity !== undefined && (mapping.sourceSystem !== sourceIdentity.sourceSystem ||
      mapping.sourceId !== sourceIdentity.sourceId)) ||
    mapping.entity.type !== entity.type ||
    mapping.entity.id !== entity.id
  ) {
    throw new InvalidEntityIdentityError()
  }
  return mapping
}

function validateRevisionObservation(input: unknown, entity: SerializedFinancialEntity, current: boolean): EntityRevisionObservation {
  const candidate = typeof input === 'string' ? { type: entity.type, id: entity.id, revision: input } : input
  if (!isPlainRecord(candidate)) throw new InvalidEntityIdentityError()
  const observation = {
    type: requiredString(candidate.type),
    id: requiredString(candidate.id),
    revision: requiredString(candidate.revision),
    current,
  }
  if (observation.type !== entity.type || observation.id !== entity.id || observation.revision === entity.id) {
    throw new InvalidEntityIdentityError()
  }
  if (candidate.current !== undefined && candidate.current !== current) throw new InvalidEntityIdentityError()
  return observation
}

function validateHistoricalRevisions(input: unknown, entity: SerializedFinancialEntity): readonly EntityRevisionObservation[] {
  if (input === undefined) return []
  if (!Array.isArray(input)) throw new InvalidEntityIdentityError()
  return input.map((revision) => validateRevisionObservation(revision, entity, false))
}

function assertNoDuplicateRevisions(revisions: readonly EntityRevisionObservation[]): void {
  const seen = new Set<string>()
  for (const revision of revisions) {
    if (seen.has(revision.revision)) throw new InvalidEntityIdentityError()
    seen.add(revision.revision)
  }
}

function assertExpected(value: unknown, expected: unknown): void {
  if (expected !== undefined && value !== expected) throw new EntityStateConflictError()
}

function validateEntityImportResult(definition: EntityDefinition, input: unknown): EntityImportResult {
  if (!isPlainRecord(input) || !Object.hasOwn(input, 'entity')) throw new InvalidEntityIdentityError()
  const entity = validateSerializedEntity(definition, input.entity)
  assertValidEntityData(definition, entity.data)

  const currentRevision =
    input.currentRevision === undefined ? undefined : validateRevisionObservation(input.currentRevision, entity, true)
  const historicalRevisions = validateHistoricalRevisions(input.historicalRevisions, entity)
  assertNoDuplicateRevisions(currentRevision === undefined ? historicalRevisions : [currentRevision, ...historicalRevisions])

  const conflictVersion = optionalIdentityString(input.conflictVersion)
  if (currentRevision !== undefined && conflictVersion !== undefined && currentRevision.revision === conflictVersion) {
    throw new InvalidEntityIdentityError()
  }

  const sourceIdentity =
    input.sourceIdentity === undefined ? undefined : validateSourceIdentity(input.sourceIdentity)
  if (sourceIdentity !== undefined && input.identityMapping === undefined) throw new InvalidEntityIdentityError()
  const identityMapping =
    input.identityMapping === undefined ? undefined : validateIdentityMapping(input.identityMapping, sourceIdentity, entity)

  assertExpected(entity.state, input.expectedState)
  assertExpected(currentRevision?.revision, input.expectedRevision)
  assertExpected(conflictVersion, input.expectedConflictVersion)

  return cloneJsonValue({
    entity,
    ...(currentRevision === undefined ? {} : { currentRevision }),
    historicalRevisions,
    ...(identityMapping === undefined ? {} : { identityMapping }),
    ...(conflictVersion === undefined ? {} : { conflictVersion }),
  })
}

function valueAtTopLevelPath(data: unknown, path: string): unknown {
  if (!isPlainRecord(data) || !Object.hasOwn(data, path)) return undefined
  return data[path]
}

function isPositiveMoney(value: unknown): boolean {
  if (!isPlainRecord(value) || typeof value.currency !== 'string') return false
  try {
    return Money.deserialize(value).compare(Money.deserialize({ amount: '0', currency: value.currency })) === 'GREATER'
  } catch {
    return false
  }
}

function validateEntityData(definition: EntityDefinition, data: unknown): EntityValidationResult {
  if (!isPlainRecord(data)) throw new EntityValidationFailedError()
  const findings: EntityValidationFinding[] = []
  for (const rule of definition.validation) {
    const value = valueAtTopLevelPath(data, rule.path)
    const valid = rule.rule === 'positive-money'
      ? isPositiveMoney(value)
      : isMoneyNotGreaterThan(value, valueAtTopLevelPath(data, rule.otherPath))
    if (!valid) {
      findings.push({ rule: rule.id, path: rule.path })
    }
  }
  return { valid: findings.length === 0, findings }
}

function isMoneyNotGreaterThan(value: unknown, other: unknown): boolean {
  try {
    return Money.deserialize(value).compare(Money.deserialize(other)) !== 'GREATER'
  } catch {
    return false
  }
}

function assertValidEntityData(definition: EntityDefinition, data: unknown): void {
  const result = validateEntityData(definition, data)
  if (!result.valid) throw new EntityValidationFailedError('Entity validation failed', { findings: result.findings })
}

/**
 * Generic FinKore Financial Entity for identity, lifecycle, mutability, and
 * declared validation behavior.
 *
 * An Entity has caller-supplied opaque identity within a declared scope and
 * exactly one current lifecycle state governed by its referenced Workflow.
 * Successful lifecycle transitions preserve identity and data while returning a
 * new Entity observation at the target state. Rejected Workflow transitions
 * retain their Workflow portable error code and leave the original Entity
 * unchanged.
 *
 * Mutability means only whether a top-level Entity data field may change in the
 * current lifecycle state. Validation separately evaluates declared Entity
 * constraints against complete Entity data before a successful create, import,
 * or mutation becomes observable. Core 0.9 release candidate has not standardized a generic
 * validation language; this implementation supports only the small
 * `positive-money` and cross-field `money-not-greater-than` conformance fixture
 * predicates. The latter compares two declared top-level Money fields in the
 * complete proposed data using exact, compatible-currency ordering. Validator
 * paths read own top-level data fields; inherited values are not retained facts.
 *
 * Existing instances own their declarations; exposed definition observations
 * cannot reconfigure them. Own State and field names, including `__proto__`,
 * survive definition observation and reuse; inherited members grant no mutation
 * permission. Versioned Workflow bindings are retained unchanged.
 * Unsupported or malformed validators fail with FINKORE_ENTITY_INVALID_MUTATION
 * before predicates run; rejected data uses FINKORE_ENTITY_VALIDATION_FAILED.
 *
 * @see ENTITY-DEFINITION-002
 * @see ENTITY-VALIDATION-009
 * @see WORKFLOW-VERSION-008
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
 * @see ENTITY-VALIDATION-001
 * @see ENTITY-VALIDATION-003
 * @see ENTITY-VALIDATION-006
 */
export class FinancialEntity {
  private readonly retainedDefinition: EntityDefinition

  /**
   * Returns a defensive observation of this Entity's governing declarations.
   * Changing original inputs or this observation cannot reconfigure the Entity.
   * All own State names and field permissions survive serialization and reuse,
   * including `__proto__`, `constructor`, and `prototype`.
   * @see ENTITY-DEFINITION-002
   */
  get definition(): EntityDefinition {
    return cloneJsonValue(this.retainedDefinition)
  }

  private readonly value: SerializedFinancialEntity

  private constructor(definition: EntityDefinition, value: SerializedFinancialEntity) {
    this.retainedDefinition = definition
    this.value = value
  }

  /**
   * Creates a new Financial Entity in its referenced Workflow's initial state.
   *
   * Identity is supplied by the caller and preserved exactly; this method never
   * generates, normalizes, or replaces it. A versioned Workflow supplies the
   * original binding, retained in every subsequent Entity observation.
   *
   * @param definitionInput - Candidate composing-domain Entity definition.
   * @param id - Caller-supplied stable entity identifier.
   * @param data - Initial composing-domain data carried without interpretation.
   * @returns A new Financial Entity in the Workflow initial state.
   * @throws {InvalidEntityMutationError}
   * When validator declarations are malformed/unsupported, or mutability
   * declarations are malformed or lack an own entry for any declared State.
   * @throws {EntityValidationFailedError}
   * When initial data is not an object or declared predicates reject it.
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
   * @see ENTITY-MUTABILITY-008
   * @see ENTITY-IDENTITY-007
   * @see ENTITY-VALIDATION-010
   */
  static create(definitionInput: unknown, id: unknown, data: unknown): FinancialEntity {
    const definition = validateDefinition(definitionInput)
    const workflow = Workflow.create(definition.workflow)
    assertValidEntityData(definition, data)
    const binding = workflow.versionBinding()
    return new FinancialEntity(definition, {
      type: definition.type,
      id: requiredString(id),
      state: workflow.currentState,
      ...(binding === undefined ? {} : { binding }),
      data: cloneJsonValue(data),
    })
  }

  /**
   * Reconstructs a Financial Entity from an existing portable observation.
   *
   * The supplied state must be exactly one state declared by the referenced
   * Workflow. This method is for conformance/import boundaries and does not
   * infer identity from object position or regenerate missing identifiers.
   * Versioned observations must supply their original binding; this method never
   * derives a historical binding from the supplied definition.
   *
   * @param definitionInput - Candidate composing-domain Entity definition.
   * @param entityInput - Existing serialized Entity observation.
   * @returns A Financial Entity at the supplied declared lifecycle state.
   * @throws {InvalidEntityIdentityError}
   * When Entity identity or type is missing, malformed, or conflicts with the
   * definition.
   * @throws {InvalidWorkflowStateError}
   * When the nonempty current lifecycle State is undeclared.
   * @throws {InvalidWorkflowInstanceError}
   * When the current State is missing/malformed, or a versioned observation
   * has missing or malformed binding.
   * @throws {WorkflowVersionMismatchError}
   * When the original binding differs from the referenced definition/version.
   * @throws {InvalidEntityMutationError}
   * When validator declarations are malformed/unsupported, or mutability
   * declarations are malformed or lack an own entry for any declared State.
   * @throws {EntityValidationFailedError}
   * When Entity data is not an object or declared predicates reject it.
   *
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see FINKORE_WORKFLOW_INVALID_STATE
   * @see ENTITY-IDENTITY-001
   * @see ENTITY-LIFECYCLE-006
   * @see ENTITY-LIFECYCLE-007
   * @see ENTITY-VALIDATION-010
   */
  static from(definitionInput: unknown, entityInput: unknown): FinancialEntity {
    const definition = validateDefinition(definitionInput)
    const entity = validateSerializedEntity(definition, entityInput)
    assertValidEntityData(definition, entity.data)
    return new FinancialEntity(definition, entity)
  }

  /**
   * Imports an existing Financial Entity observation with optional revision,
   * source identity mapping, and conflict-version context.
   *
   * Import preserves the supplied FinKore Entity identity and validates any
   * Source Identity mapping as explicit continuity evidence. Current and
   * historical Entity Revisions are preserved as business revision identity,
   * while the optional conflict version remains a distinct stale-observation
   * token. Expected state, revision, and conflict-version preconditions are
   * checked independently after the supplied observation is structurally valid.
   * Supplied null expectations do not match; omitted expectations impose no check.
   * This bounded import API rejects equal current-revision/conflict tokens and
   * has no composing-domain shared-meaning declaration mechanism.
   * The original Workflow binding is required for a versioned observation.
   * Complete mapping evidence may be supplied without a separate Source Identity;
   * no Source Identity observation is synthesized. A supplied Source Identity
   * must be valid and accompanied by matching mapping evidence. Explicit null
   * is malformed Source Identity.
   *
   * @param definitionInput - Candidate composing-domain Entity definition.
   * @param importInput - Existing Entity import observation and optional
   * mapping, revision history, conflict version, and expected preconditions.
   * @returns A defensive import observation preserving supplied identity,
   * revision, mapping, and conflict-version values.
   * @throws {InvalidEntityIdentityError}
   * When Entity, revision, mapping, or conflict-version identity is missing,
   * malformed, incomplete, or internally conflicting.
   * @throws {EntityStateConflictError}
   * When an expected state, revision, or conflict version does not match the
   * supplied observation.
   * @throws {InvalidWorkflowInstanceError}
   * When the current State is missing/malformed, or a versioned observation
   * has missing or malformed binding.
   * @throws {WorkflowVersionMismatchError}
   * When the original binding differs from the referenced definition/version.
   * @throws {InvalidEntityMutationError}
   * When validator or mutability declarations are malformed, unsupported, or
   * omit a declared State.
   * @throws {InvalidWorkflowStateError}
   * When the nonempty current State is undeclared.
   * @throws {EntityValidationFailedError}
   * When supplied data is not an object or violates a declared validation rule.
   *
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see FINKORE_ENTITY_STATE_CONFLICT
   * @see ENTITY-IDENTITY-006
   * @see ENTITY-REVISION-001
   * @see ENTITY-REVISION-006
   * @see ENTITY-IMPORT-001
   * @see ENTITY-IMPORT-002
   * @see ENTITY-IMPORT-006
   * @see ENTITY-IMPORT-007
   * @see ENTITY-IMPORT-008
   * @see ENTITY-IMPORT-011
   * @see ENTITY-VALIDATION-004
   */
  static import(definitionInput: unknown, importInput: unknown): EntityImportResult {
    const definition = validateDefinition(definitionInput)
    return validateEntityImportResult(definition, importInput)
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
    const workflow = Workflow.from(this.retainedDefinition.workflow, {
      currentState: this.value.state,
      ...(this.value.binding === undefined ? {} : { binding: this.value.binding }),
    })
    workflow.transition(target)
    return new FinancialEntity(this.retainedDefinition, { ...this.value, state: workflow.currentState })
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
   * Validation evaluates the complete proposed data after all accepted changes
   * are combined, so multi-field proposals either become observable together or
   * are rejected together. This method does not implement schemas, audit
   * policy, authorization, persistence, arbitrary expressions, or a generic
   * rule registry.
   *
   * @param changesInput - Top-level data field changes keyed by field name.
   * @returns A new Financial Entity containing the accepted data changes.
   * @throws {ImmutableEntityError}
   * When any targeted field is not declared mutable in the current state.
   * @throws {InvalidEntityMutationError}
   * When the mutation request shape is not recognized by Core 0.9 release candidate Entity behavior.
   * @throws {EntityValidationFailedError}
   * When one or more declared Entity validation rules fail for the complete
   * proposed result.
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
   * @see ENTITY-VALIDATION-002
   * @see ENTITY-VALIDATION-003
   * @see ENTITY-VALIDATION-004
   * @see ENTITY-VALIDATION-006
   */
  mutate(changesInput: unknown): FinancialEntity {
    if (!isPlainRecord(this.value.data)) throw new InvalidEntityMutationError()
    const changes = validateChanges(changesInput)
    const mutableFields = mutableFieldsFor(this.retainedDefinition, this.value.state)

    for (const field of Object.keys(changes)) {
      if (field === 'id' || field === 'type' || field === 'state' || !mutableFields.has(field)) {
        throw new ImmutableEntityError()
      }
    }

    const data = cloneJsonValue({ ...this.value.data, ...changes })
    assertValidEntityData(this.retainedDefinition, data)
    return new FinancialEntity(this.retainedDefinition, { ...this.value, data })
  }

  /**
   * Evaluates declared Entity validation rules without changing this Entity.
   *
   * The returned result is complete for all validation rules declared in the
   * Entity definition: every failed rule contributes one finding, and
   * evaluation does not stop at the first failure. Findings expose only stable
   * rule identifiers and paths; they do not include sensitive field values.
   *
   * @returns Complete validation result for this Entity's current data.
   *
   * @see ENTITY-VALIDATION-003
   * @see ENTITY-VALIDATION-004
   * @see ENTITY-VALIDATION-005
   * @see ENTITY-VALIDATION-006
   * @see ENTITY-VALIDATION-008
   */
  validate(): EntityValidationResult {
    return cloneJsonValue(validateEntityData(this.retainedDefinition, this.value.data))
  }

  /**
   * Returns the portable Entity observation.
   *
   * The returned value is a defensive copy. Mutating it cannot modify this
   * Entity's stable identity, lifecycle state, Workflow binding, or data.
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
