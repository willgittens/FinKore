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
 * Validation rule fixture supported by the current Entity conformance milestone.
 *
 * Draft 0.1 has not standardized a generic validation language. The current
 * TypeScript reference implementation supports only the deterministic
 * `positive-money` fixture predicate used by Entity conformance vectors.
 *
 * @see ENTITY-VALIDATION-001
 */
export type EntityValidationRule = 'positive-money'

/**
 * Declared Entity validation rule.
 *
 * The rule identifier is a stable composing-domain violation identity. The path
 * names the top-level Entity data member inspected by this Draft 0.1 milestone.
 *
 * @see ENTITY-ERROR-002
 * @see ENTITY-VALIDATION-005
 */
export interface EntityValidationRuleDefinition {
  /** Stable violation identifier supplied by the composing domain. */
  readonly id: string

  /** Top-level Entity data path inspected by the rule. */
  readonly path: string

  /** Small conformance fixture predicate, not a general rule expression. */
  readonly rule: EntityValidationRule
}

/**
 * Portable validation finding emitted when a declared Entity rule fails.
 *
 * The fields are machine-readable and intentionally omit sensitive field values
 * and localized human-readable messages.
 *
 * @see ENTITY-VALIDATION-004
 * @see ENTITY-VALIDATION-005
 * @see ENTITY-VALIDATION-008
 */
export interface EntityValidationFinding {
  /** Stable violation identifier from the failed rule declaration. */
  readonly rule: string

  /** Domain path relevant to the failed rule. */
  readonly path: string
}

/**
 * Complete result of evaluating declared Entity validation rules.
 *
 * Findings are reported in declaration order for this TypeScript
 * representation. Draft 0.1 conformance does not make finding array order a
 * cross-language contract.
 *
 * @see ENTITY-VALIDATION-003
 * @see ENTITY-VALIDATION-006
 */
export interface EntityValidationResult {
  /** `true` only when every declared validation rule passes. */
  readonly valid: boolean

  /** Every failed validation rule, without early return. */
  readonly findings: readonly EntityValidationFinding[]
}

/**
 * Financial Entity definition input for the current identity, lifecycle, and
 * mutability milestones.
 *
 * This milestone validates the composing-domain type, declared identity scope,
 * referenced Workflow, and top-level field mutability declarations. Validation
 * rule engines, audit policy, persistence, versioning, and concrete financial
 * invariants remain outside this Entity milestone.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-LIFECYCLE-001
 * @see ENTITY-MUTABILITY-001
 * @see ENTITY-DEFINITION-001
 */
export interface EntityDefinitionInput {
  /** Composing-domain entity type identifier. */
  readonly type?: unknown

  /** Declared identity scope for stable entity identifiers. */
  readonly identityScope?: unknown

  /** Workflow definition that governs lifecycle state. */
  readonly workflow?: WorkflowDefinitionInput | unknown

  /** Top-level data fields declared mutable by lifecycle state. */
  readonly mutability?: unknown

  /** Declared Entity validation rules for this conformance milestone. */
  readonly validation?: unknown
}

/**
 * Validated Financial Entity definition for identity, lifecycle, and
 * mutability behavior.
 *
 * @see ENTITY-IDENTITY-001
 * @see ENTITY-LIFECYCLE-001
 * @see ENTITY-MUTABILITY-001
 */
export interface EntityDefinition {
  /** Composing-domain entity type identifier. */
  readonly type: EntityTypeIdentifier

  /** Declared identity scope for stable entity identifiers. */
  readonly identityScope: EntityIdentityScope

  /** Workflow definition that governs lifecycle state. */
  readonly workflow: WorkflowDefinitionInput | unknown

  /** Top-level data fields declared mutable by lifecycle state. */
  readonly mutability: Readonly<Record<WorkflowStateIdentifier, readonly string[]>>

  /** Declared Entity validation rules evaluated against complete Entity data. */
  readonly validation: readonly EntityValidationRuleDefinition[]
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

  /** Composing-domain data carried without validation-rule interpretation. */
  readonly data: unknown
}
