// SPDX-License-Identifier: MPL-2.0
/**
 * Stable identifier for a committed FinKore Audit Event.
 *
 * The TypeScript implementation treats event identifiers as caller-supplied,
 * opaque domain values. It does not infer type, origin, time, or ordering from
 * the identifier's characters.
 *
 * @see SPEC-IDENTIFIER-001
 * @see SPEC-IDENTIFIER-002
 * @see SPEC-IDENTIFIER-003
 * @see AUDIT-EVENT-001
 */
export type AuditEventIdentifier = string

/**
 * Stable identifier for the Financial Entity affected by an Audit Event.
 *
 * @see AUDIT-EVENT-004
 */
export type AuditEntityIdentifier = string

/**
 * Domain type of the Financial Entity affected by an Audit Event.
 *
 * @see AUDIT-EVENT-004
 */
export type AuditEntityType = string

/**
 * Stable identifier for a known Audit Actor.
 *
 * Actor identifiers are opaque and must not be replaced by display names.
 *
 * @see AUDIT-ACTOR-001
 * @see AUDIT-ACTOR-002
 * @see AUDIT-ACTOR-003
 */
export type AuditActorIdentifier = string

/**
 * Optional actor type supplied by a composing domain or application.
 *
 * FinKore Core 0.8 does not define a closed actor-type catalog.
 *
 * @see AUDIT-ACTOR-007
 */
export type AuditActorType = string

/**
 * Portable FinKore Audit error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 */
export type AuditErrorCode =
  | 'FINKORE_AUDIT_INVALID_EVENT'
  | 'FINKORE_AUDIT_DUPLICATE_EVENT'
  | 'FINKORE_AUDIT_APPEND_ONLY_VIOLATION'
  | 'FINKORE_AUDIT_REDACTION_INVALID'
  | 'FINKORE_AUDIT_ACTOR_INVALID'

/**
 * Serialized reference to the Financial Entity affected by an Audit Event.
 *
 * Both members are stable domain identifiers. This type does not prescribe a
 * storage model or entity lifecycle implementation.
 *
 * @see AUDIT-EVENT-004
 */
export interface SerializedAuditEntityReference {
  /** Stable entity type. */
  readonly type: AuditEntityType

  /** Stable entity identifier within the relevant entity scope. */
  readonly id: AuditEntityIdentifier
}

/**
 * Portable Audit Relationship type supported by Core 0.8.
 *
 * Relationship types are explicit event-content semantics. They are not
 * inferred from event type, identifier format, or storage order.
 *
 * @see AUDIT-RELATIONSHIP-003
 */
export type AuditRelationshipType = 'CORRECTS' | 'REVERSES' | 'VOIDS' | 'SUPERSEDES'

/**
 * Stable identifier for an Audit Relationship.
 *
 * This identifier names the relationship itself, not the source event, target
 * event, or affected Entity.
 *
 * @see AUDIT-RELATIONSHIP-001
 * @see AUDIT-RELATIONSHIP-002
 */
export type AuditRelationshipIdentifier = string

/**
 * Target Audit Event reference for an Audit Relationship.
 *
 * The target event identity and its affected Entity reference are both
 * recorded so a logical history can validate that the relationship points to
 * the intended event and Entity.
 *
 * @see AUDIT-RELATIONSHIP-001
 * @see AUDIT-RELATIONSHIP-008
 */
export interface SerializedAuditRelationshipTarget {
  /** Stable target Audit Event identity. */
  readonly eventId: AuditEventIdentifier

  /** Affected Entity reference of the target Audit Event. */
  readonly entity: SerializedAuditEntityReference
}

/**
 * Serialized Audit Relationship retained as Audit Event content.
 *
 * A relationship points from the containing source Audit Event to one target
 * Audit Event. Log-level validation checks target existence, self-targeting,
 * target Entity consistency, and duplicate relationship identities.
 *
 * @see AUDIT-RELATIONSHIP-001
 * @see AUDIT-RELATIONSHIP-004
 * @see AUDIT-RELATIONSHIP-005
 */
export interface SerializedAuditRelationship {
  /** Stable relationship identity. */
  readonly relationshipId: AuditRelationshipIdentifier

  /** Supported relationship type. */
  readonly type: AuditRelationshipType

  /** Target Audit Event and its affected Entity reference. */
  readonly target: SerializedAuditRelationshipTarget
}

/**
 * Serialized known Actor attribution for an Audit Event.
 *
 * Actor type and display metadata may be retained as context, but the stable
 * identity remains the actor identifier. FinKore Core 0.8 does not define
 * authentication, authorization, RBAC, or an identity-provider binding.
 *
 * @see AUDIT-ACTOR-001
 * @see AUDIT-ACTOR-002
 * @see AUDIT-ACTOR-003
 * @see AUDIT-ACTOR-007
 */
export interface SerializedAuditActor {
  /** Stable actor identifier. */
  readonly id: AuditActorIdentifier

  /** Optional actor type, such as a user, service, system, or integration. */
  readonly type?: AuditActorType

  /** Optional historical display metadata that must not replace identity. */
  readonly displayName?: string | SerializedAuditRedactedValue

  /** Optional non-normative actor context. */
  readonly metadata?: unknown
}

/**
 * Serialized domain field change retained inside an Audit Event.
 *
 * A change identifies the affected field or domain path and may preserve prior
 * and resulting values. Omitted members and explicit `null` values are distinct.
 * Core 0.8 does not define a full domain path syntax, change-kind catalog,
 * redaction behavior, or Money-specific change validation.
 *
 * @see AUDIT-CHANGE-001
 * @see AUDIT-CHANGE-002
 * @see AUDIT-CHANGE-003
 * @see AUDIT-CHANGE-005
 * @see AUDIT-CHANGE-007
 */
export interface SerializedAuditChange {
  /** Domain path or field name supplied by the composing domain. */
  readonly path: string

  /** Prior value when safely retained by the composing domain. */
  readonly before?: unknown

  /** Resulting value when safely retained by the composing domain. */
  readonly after?: unknown
}

/**
 * Serialized marker for FinKore Audit content concealed by redaction.
 *
 * This marker is intentionally distinct from an omitted value, explicit
 * `null`, an empty string, `false`, `0`, or an empty collection. It records
 * that protected content occupied this position without disclosing the
 * original value.
 *
 * @see AUDIT-REDACTION-002
 * @see AUDIT-REDACTION-003
 */
export interface SerializedAuditRedactedValue {
  /** Distinguishes policy-authorized redaction from absence or null. */
  readonly presence: 'REDACTED'
}

/**
 * Policy fixture used to request redaction of protected Audit content.
 *
 * FinKore Core 0.8 requires an audit policy to identify protected content and
 * the authority for redaction. This TypeScript milestone supports redaction of
 * Audit Change values whose `path` appears in `protectedPaths`, plus the
 * reserved actor-context targets `actor.displayName` and `actor.metadata`.
 *
 * @see AUDIT-REDACTION-001
 * @see AUDIT-CHANGE-006
 */
export interface AuditRedactionPolicy {
  /** Stable policy identifier supplied by the composing domain. */
  readonly id: string

  /** Change paths or reserved actor-context targets requiring redaction. */
  readonly protectedPaths: readonly string[]

  /** Policy or legal authority under which redaction is applied. */
  readonly authority: string
}

/**
 * Input for producing a redacted Audit representation with evidence.
 *
 * Redaction does not delete, replace, or regenerate the historical event. A
 * successful redaction returns a redacted representation of the affected event
 * and commits the supplied evidence event to the log.
 *
 * @see AUDIT-REDACTION-001
 * @see AUDIT-REDACTION-006
 * @see AUDIT-APPEND-001
 */
export interface AuditRedactionRequest {
  /** Policy describing protected content and redaction authority. */
  readonly policy: AuditRedactionPolicy

  /** Audit Event recording that redaction occurred. */
  readonly redactionEvent: unknown
}

/**
 * Result of an Audit redaction operation.
 *
 * The affected event is returned as a redacted logical representation while the
 * evidence event remains separately observable.
 *
 * @see AUDIT-REDACTION-003
 * @see AUDIT-REDACTION-006
 */
export interface AuditRedactionResult {
  /** Redacted representation of the affected historical Audit Event. */
  readonly event: SerializedAuditEvent

  /** Committed Audit Event identifying that redaction occurred. */
  readonly evidenceEvent: SerializedAuditEvent
}

/**
 * Serialized FinKore Audit Event accepted by the TypeScript Audit core.
 *
 * Event identity and timestamp are supplied explicitly; this implementation
 * does not generate identifiers, read wall-clock time, or infer distributed
 * ordering from timestamps or array positions.
 *
 * @see AUDIT-EVENT-001
 * @see AUDIT-EVENT-002
 * @see AUDIT-EVENT-004
 * @see AUDIT-EVENT-005
 * @see AUDIT-EVENT-006
 * @see AUDIT-EVENT-007
 */
export interface SerializedAuditEvent {
  /** Stable event identity within one logical audit history. */
  readonly eventId: AuditEventIdentifier

  /** Domain occurrence type recorded by this Audit Event. */
  readonly eventType: string

  /** Affected Financial Entity reference. */
  readonly entity: SerializedAuditEntityReference

  /** Known responsible Actor; omitted when actor attribution is unknown. */
  readonly actor?: SerializedAuditActor

  /** RFC 3339 date-time with an explicit numeric UTC offset or Z. */
  readonly occurredAt: string

  /** Optional domain-relevant changes preserved as event content. */
  readonly changes?: readonly SerializedAuditChange[]

  /** Optional event context that must not replace required event fields. */
  readonly metadata?: unknown

  /** Optional Audit Relationships from this source event to target events. */
  readonly relationships?: readonly SerializedAuditRelationship[]
}

/**
 * Portable observation of one logical Audit history.
 *
 * The order is the local history's append observation only. It is not a global
 * ordering guarantee for independently produced concurrent events.
 *
 * @see AUDIT-APPEND-001
 * @see AUDIT-APPEND-002
 * @see AUDIT-APPEND-006
 */
export interface SerializedAuditHistory {
  /** Committed Audit Events in this logical history's append observation. */
  readonly history: readonly SerializedAuditEvent[]
}
