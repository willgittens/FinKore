// SPDX-License-Identifier: MPL-2.0
import type { WorkflowDefinitionInput, WorkflowDefinitionVersionBinding, WorkflowStateIdentifier } from '../workflow/types.js'
import type { SerializedAuditEvent, SerializedAuditHistory } from '../audit/types.js'

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
 * Core 0.9 release candidate does not define concrete entity domains. The type identifies the
 * composing-domain definition used by a generic Financial Entity.
 *
 * @see ENTITY-DEFINITION-001
 */
export type EntityTypeIdentifier = string

/**
 * Declared scope in which an Entity identifier is unique.
 *
 * Core 0.9 release candidate requires an identity scope but leaves the cross-entity registry or
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
 * Validation rule fixture supported by Core 0.9 release candidate Entity conformance.
 *
 * Core 0.9 release candidate has not standardized a generic validation language. The current
 * TypeScript reference implementation supports the deterministic `positive-money`
 * and `money-not-greater-than` fixture predicates used by Entity conformance
 * vectors. The latter compares two compatible Money fields exactly and accepts
 * equality; invalid or incompatible values fail the declared Entity rule.
 *
 * @see ENTITY-VALIDATION-001
 * @see ENTITY-VALIDATION-003
 */
export type EntityValidationRule = 'positive-money' | 'money-not-greater-than'

/**
 * Declared Entity validation rule.
 *
 * The rule identifier is a stable composing-domain violation identity. The path
 * names the top-level Entity data member inspected by this Core 0.9 release candidate behavior.
 *
 * @see ENTITY-ERROR-002
 * @see ENTITY-VALIDATION-005
 */
export type EntityValidationRuleDefinition = {
  /** Stable violation identifier supplied by the composing domain. */
  readonly id: string

  /** Top-level Entity data path inspected by the rule. */
  readonly path: string
} & (
  | {
      /** Single-field positive Money predicate. */
      readonly rule: 'positive-money'
    }
  | {
      /** Exact comparison against another declared Money field. */
      readonly rule: 'money-not-greater-than'
      /** Top-level Money upper bound read from the same complete proposed data. */
      readonly otherPath: string
    }
)

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
 * representation. Core 0.9 release candidate conformance does not make finding array order a
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
 * Financial Entity definition input for Core 0.9 release candidate identity,
 * lifecycle, and mutability behavior.
 *
 * Core 0.9 release candidate validates the composing-domain type, declared
 * identity scope, referenced Workflow, and top-level field mutability
 * declarations. Validation rule engines, audit policy, persistence, versioning,
 * and concrete financial invariants remain outside Core 0.9 release candidate
 * Entity behavior.
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

  /** Owned Workflow declarations; exposed observations cannot reconfigure an existing Entity. */
  readonly workflow?: WorkflowDefinitionInput | unknown

  /** Explicit own entry for every declared State, preserving special names on reuse.
   * Each value is a list of nonempty field names; an empty list permits no fields.
   * @see ENTITY-MUTABILITY-008
   */
  readonly mutability?: unknown

  /** Declared Entity validation rules for Core 0.9 release candidate conformance. */
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

  /** Owned Workflow declarations; exposed observations cannot reconfigure an existing Entity. */
  readonly workflow: WorkflowDefinitionInput | unknown

  /** Explicit own entry for every declared State, preserving special names on reuse.
   * Each value is a list of nonempty field names; an empty list permits no fields.
   * @see ENTITY-MUTABILITY-008
   */
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
  /**
   * Retained Workflow identity/version binding, required for versioned reuse.
   * Import validates this supplied observation; it never infers or repairs it.
   * @see WORKFLOW-VERSION-007
   * @see WORKFLOW-VERSION-008
   * @see ENTITY-IMPORT-002
   */
  readonly binding?: WorkflowDefinitionVersionBinding
  /** Composing-domain entity type identifier. */
  readonly type: EntityTypeIdentifier

  /** Stable entity identifier exactly as supplied. */
  readonly id: EntityIdentifier

  /** Exactly one current lifecycle state. */
  readonly state: WorkflowStateIdentifier

  /** Composing-domain application data following the supported native value profile.
   * @see ENTITY-VALIDATION-011
   */
  readonly data: unknown
}

/**
 * Optional opaque Entity Conflict Version used for stale-observation
 * preconditions.
 *
 * The value is distinct from Entity Revision, stable Entity identity, storage
 * row identity, display numbers, and timestamps.
 *
 * @see ENTITY-REVISION-006
 * @see ENTITY-IMPORT-006
 */
export type EntityConflictVersion = string

/**
 * Stable identifier for a declared Entity Revision.
 *
 * A revision identifies one declared observation or version of a continuing
 * Financial Entity. It remains distinct from stable Entity identity.
 *
 * @see ENTITY-EVOLUTION-002
 */
export type EntityRevisionIdentifier = string

/**
 * Revision observation preserved at an Entity import boundary.
 *
 * The revision qualifies one stable Entity identity and indicates whether the
 * supplied revision is current for the import observation.
 *
 * @see ENTITY-REVISION-003
 * @see ENTITY-REVISION-004
 * @see ENTITY-IMPORT-006
 */
export interface EntityRevisionObservation {
  /** Stable Entity type qualified by this revision. */
  readonly type: EntityTypeIdentifier

  /** Stable Entity identity qualified by this revision. */
  readonly id: EntityIdentifier

  /** Opaque business revision identity. */
  readonly revision: EntityRevisionIdentifier

  /** Whether this is the current revision for the import observation. */
  readonly current: boolean
}

/**
 * External or legacy identity supplied during Entity import.
 *
 * Source identity is opaque and never replaces stable FinKore Entity identity.
 *
 * @see ENTITY-IMPORT-001
 * @see ENTITY-IMPORT-003
 */
export interface EntityImportSourceIdentity {
  /** Opaque source-system identifier supplied by the caller. */
  readonly sourceSystem: string

  /** Opaque entity identifier in the source system. */
  readonly sourceId: string
}

/**
 * Explicit mapping evidence relating source identity to FinKore Entity identity.
 *
 * This is not a registry lookup or deduplication result; it is preserved
 * caller-supplied continuity evidence.
 * Complete mapping evidence may be imported without a separate Source Identity.
 *
 * @see ENTITY-IDENTITY-006
 * @see ENTITY-IMPORT-003
 * @see ENTITY-IMPORT-004
 * @see ENTITY-IMPORT-011
 */
export interface EntityIdentityMapping extends EntityImportSourceIdentity {
  /** Opaque mapping evidence identity supplied by the caller. */
  readonly mappingId: string

  /** Stable FinKore Entity identity reached by this mapping. */
  readonly entity: {
    readonly type: EntityTypeIdentifier
    readonly id: EntityIdentifier
  }
}

/**
 * Result returned by a successful Entity import observation.
 *
 * The result preserves Entity identity, optional revision history, optional
 * source identity mapping, and optional conflict version as distinct values.
 *
 * @see ENTITY-IMPORT-001
 * @see ENTITY-IMPORT-006
 */
export interface EntityImportResult {
  /** Imported Entity observation. */
  readonly entity: SerializedFinancialEntity

  /** Current business revision when supplied. */
  readonly currentRevision?: EntityRevisionObservation

  /** Historical business revisions preserved from the import observation. */
  readonly historicalRevisions: readonly EntityRevisionObservation[]

  /** Explicit source identity mapping evidence when supplied. */
  readonly identityMapping?: EntityIdentityMapping

  /** Optional stale-observation conflict token, distinct from business revision. */
  readonly conflictVersion?: EntityConflictVersion
}

/**
 * Stable identifier for an Entity Evolution Relation.
 *
 * The identifier names the relation itself, not the source Entity, related
 * Entity, source Revision, related Revision, or Audit evidence.
 *
 * @see ENTITY-EVOLUTION-003
 */
export type EntityEvolutionRelationIdentifier = string

/**
 * Portable Entity evolution kinds supported by FinKore Core 0.9 release candidate.
 *
 * The four values are distinct; replacement and amendment are intentionally
 * not portable Core 0.9 release candidate operations.
 *
 * @see ENTITY-EVOLUTION-004
 * @see ENTITY-EVOLUTION-005
 */
export type EntityEvolutionKind = 'CORRECTION' | 'REVERSAL' | 'VOID' | 'SUPERSESSION'

/**
 * Revision-qualified Entity reference retained in evolution history.
 *
 * @see ENTITY-EVOLUTION-001
 * @see ENTITY-EVOLUTION-002
 * @see ENTITY-EVOLUTION-022
 */
export interface EntityRevisionReference {
  /** Stable Entity type. */
  readonly type: EntityTypeIdentifier

  /** Stable Entity identifier. */
  readonly id: EntityIdentifier

  /** Stable Revision identifier distinct from Entity identity. */
  readonly revision: EntityRevisionIdentifier
}

/**
 * Serialized Entity Evolution Relation observation.
 *
 * This value records portable evolution history. It does not define ledger
 * effects, authorization, storage transactions, replacement semantics, or
 * concrete invoice/payment behavior.
 *
 * @see ENTITY-EVOLUTION-003
 * @see ENTITY-EVOLUTION-022
 */
export interface SerializedEntityEvolutionRelation {
  /** Stable relation identity. */
  readonly relationId: EntityEvolutionRelationIdentifier

  /** Distinct evolution kind. */
  readonly kind: EntityEvolutionKind

  /** Source Entity and Revision preserved by the relation. */
  readonly source: EntityRevisionReference

  /** Related Entity and Revision, required except for Void. */
  readonly related?: EntityRevisionReference

  /** Supersession scope, required only for Supersession. */
  readonly supersessionScope?: string

  /** Source currentness after this relation becomes observable. */
  readonly sourceCurrent: boolean

  /** Related currentness after this relation becomes observable, when related exists. */
  readonly relatedCurrent?: boolean

  /** Audit Event identity that records the evolution. */
  readonly auditEventId: string
}

/**
 * Serialized Entity Evolution history.
 *
 * The relation array is an append observation for one logical history. It is
 * not a global ordering guarantee or persistence format.
 *
 * @see ENTITY-EVOLUTION-022
 */
export interface SerializedEntityEvolutionHistory {
  /** Recorded Entity Evolution Relations. */
  readonly relations: readonly SerializedEntityEvolutionRelation[]
}

/**
 * Audit evidence supplied for one Entity evolution operation.
 *
 * Both identifiers and event content are supplied by the composing domain or
 * caller. The implementation validates and commits them; it does not generate
 * missing evidence.
 *
 * @see ENTITY-EVOLUTION-029
 * @see ENTITY-EVOLUTION-030
 */
export interface EntityEvolutionAuditEvidenceInput {
  /** Committed logical Audit history before this evolution. */
  readonly history: readonly unknown[]

  /** Audit Event that records this evolution. */
  readonly event: unknown
}

/**
 * Shared request context for Core 0.9 release candidate Entity evolution operations.
 *
 * @see ENTITY-EVOLUTION-006
 * @see ENTITY-EVOLUTION-007
 * @see ENTITY-EVOLUTION-025
 */
export interface EntityEvolutionRequestBase {
  /** Source Entity preserved by the evolution operation. */
  readonly source: FinancialEntityLike

  /** Source Revision identity observed before the request. */
  readonly sourceRevision: unknown

  /** Evolution Relation identity supplied by the caller. */
  readonly relationId: unknown

  /** Explicit composing-domain eligibility decision. */
  readonly eligible: unknown

  /** Optional expected lifecycle state precondition. */
  readonly expectedSourceState?: unknown

  /** Optional expected source Revision precondition. */
  readonly expectedSourceRevision?: unknown

  /** Optional expected source currentness precondition. */
  readonly expectedSourceCurrent?: unknown

  /** Required Audit evidence. */
  readonly audit: EntityEvolutionAuditEvidenceInput
}

/**
 * Minimal structural shape consumed from FinancialEntity without creating a
 * circular public type dependency in this module.
 *
 * @internal
 */
export interface FinancialEntityLike {
  readonly id: EntityIdentifier
  readonly state: WorkflowStateIdentifier
  toJSON(): SerializedFinancialEntity
}

/**
 * Correction or Reversal request.
 *
 * @see ENTITY-EVOLUTION-008
 * @see ENTITY-EVOLUTION-011
 */
export interface EntityRelatedEvolutionRequest extends EntityEvolutionRequestBase {
  /** Related corrected or reversing Entity. */
  readonly related: FinancialEntityLike

  /** Related Revision identity carrying corrected or reversing facts. */
  readonly relatedRevision: unknown
}

/**
 * Void request.
 *
 * @see ENTITY-EVOLUTION-016
 */
export type EntityVoidRequest = EntityEvolutionRequestBase

/**
 * Supersession request.
 *
 * @see ENTITY-EVOLUTION-019
 * @see ENTITY-EVOLUTION-020
 */
export interface EntitySupersessionRequest extends EntityEvolutionRequestBase {
  /** Successor Entity replacing the source for the declared scope. */
  readonly successor: FinancialEntityLike

  /** Successor Revision identity replacing the source revision for current use. */
  readonly successorRevision: unknown

  /** Declared composing-domain supersession scope. */
  readonly supersessionScope: unknown
}

/**
 * Result returned by a successful Entity evolution operation.
 *
 * The result preserves source and related observations defensively, exposes the
 * new evolution relation, and returns committed Audit evidence in one
 * observable value.
 *
 * @see ENTITY-EVOLUTION-015
 * @see ENTITY-EVOLUTION-022
 * @see ENTITY-EVOLUTION-029
 * @see ENTITY-EVOLUTION-033
 */
export interface EntityEvolutionResult {
  /** Preserved source Entity observation. */
  readonly source: SerializedFinancialEntity

  /** Related Entity observation when the operation has one. */
  readonly related?: SerializedFinancialEntity

  /** Newly recorded evolution relation. */
  readonly relation: SerializedEntityEvolutionRelation

  /** Evolution history after the relation is recorded. */
  readonly evolutionHistory: SerializedEntityEvolutionHistory

  /** Audit history after the evidence event is committed. */
  readonly auditHistory: SerializedAuditHistory

  /** Committed Audit Event for this evolution. */
  readonly auditEvent: SerializedAuditEvent
}
