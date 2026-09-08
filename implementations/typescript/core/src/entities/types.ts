import type { WorkflowDefinitionInput, WorkflowStateIdentifier } from '../workflow/types.js'

/**
 * Stable identifier for a FinKore Financial Entity.
 *
 * Entity identifiers are caller-supplied opaque domain identity. This
 * implementation preserves them exactly and does not infer domain facts from
 * format, position, or display numbering.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-IDENTITY-002
 * @see ENTITY-IDENTITY-003
 */
export type EntityIdentifier = string

/**
 * Stable Financial Entity type identifier.
 *
 * Draft 0.1 does not define concrete entity domains. The type identifies the
 * composing-domain definition used by a generic Financial Entity.
 *
 * @see ENTITY-DEFINITION-001
 */
export type EntityTypeIdentifier = string

/**
 * Declared scope in which an Entity identifier is unique.
 *
 * Draft 0.1 requires an identity scope but leaves the cross-entity registry or
 * tenancy model to composing domains and storage layers.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-IDENTITY-005
 */
export type EntityIdentityScope = string

/**
 * Portable FinKore Entity error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see ENTITY-ERROR-001
 */
export type EntityErrorCode =
  | 'FINKORE_ENTITY_INVALID_IDENTITY'
  | 'FINKORE_ENTITY_IMMUTABLE'
  | 'FINKORE_ENTITY_INVALID_MUTATION'
  | 'FINKORE_ENTITY_STATE_CONFLICT'
  | 'FINKORE_ENTITY_VALIDATION_FAILED'

/**
 * Stage 1 Financial Entity definition input.
 *
 * This milestone validates the composing-domain type, declared identity scope,
 * and referenced Workflow. Field mutability policy, validation rule engines,
 * audit policy, persistence, versioning, and concrete financial invariants are
 * outside this Entity identity/lifecycle milestone.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-LIFECYCLE-001
 * @see ENTITY-DEFINITION-001
 */
export interface EntityDefinitionInput {
  /** Composing-domain entity type identifier. */
  readonly type?: unknown

  /** Declared identity scope for stable entity identifiers. */
  readonly identityScope?: unknown

  /** Workflow definition that governs lifecycle state. */
  readonly workflow?: WorkflowDefinitionInput | unknown
}

/**
 * Validated Stage 1 Financial Entity definition.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-LIFECYCLE-001
 */
export interface EntityDefinition {
  /** Composing-domain entity type identifier. */
  readonly type: EntityTypeIdentifier

  /** Declared identity scope for stable entity identifiers. */
  readonly identityScope: EntityIdentityScope

  /** Workflow definition that governs lifecycle state. */
  readonly workflow: WorkflowDefinitionInput | unknown
}

/**
 * Portable observation of a Financial Entity.
 *
 * The shape mirrors current conformance fixtures. It is not a persistence
 * format and does not define concrete financial entity fields.
 *
 * @see ENTITY-IDENTITY-002
 * @see ENTITY-LIFECYCLE-006
 */
export interface SerializedFinancialEntity {
  /** Composing-domain entity type identifier. */
  readonly type: EntityTypeIdentifier

  /** Stable entity identifier exactly as supplied. */
  readonly id: EntityIdentifier

  /** Exactly one current lifecycle state. */
  readonly state: WorkflowStateIdentifier

  /** Composing-domain data carried without interpretation in Stage 1. */
  readonly data: unknown
}
