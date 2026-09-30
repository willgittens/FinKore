// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { AuditActor } from './actor.js'
import { AuditChange } from './audit-change.js'
import { InvalidAuditEventError } from './errors.js'
import { parsePortableTimestamp } from '../portable-timestamp.js'
import type {
  AuditRelationshipType,
  SerializedAuditChange,
  SerializedAuditEntityReference,
  SerializedAuditEvent,
  SerializedAuditRelationship,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditEventError()
  return value
}

function cloneJsonValue<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new InvalidAuditEventError()
    return value
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new InvalidAuditEventError()
    ancestors.add(value)
    const result = Array.from(arrayValues(value), (item) => cloneJsonValue(item, ancestors))
    ancestors.delete(value)
    return result as T
  }
  if (isPlainRecord(value)) {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) throw new InvalidAuditEventError()
    if (ancestors.has(value)) throw new InvalidAuditEventError()
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string')) throw new InvalidAuditEventError()
    ancestors.add(value)
    // Define own members without invoking the __proto__ setter.
    const result = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJsonValue(item, ancestors)]),
    )
    ancestors.delete(value)
    return result as T
  }
  throw new InvalidAuditEventError()
}

function validateEventType(value: unknown): string {
  const EVENT_TYPE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/u
  const eventType = requiredString(value)
  if (!EVENT_TYPE.test(eventType)) throw new InvalidAuditEventError()
  return eventType
}

function validateTimestamp(value: unknown): string {
  const timestamp = requiredString(value)
  try {
    parsePortableTimestamp(timestamp)
  } catch {
    throw new InvalidAuditEventError()
  }
  return timestamp
}

function validateEntity(value: unknown): SerializedAuditEntityReference {
  if (!isPlainRecord(value)) throw new InvalidAuditEventError()
  return { type: requiredString(value.type), id: requiredString(value.id) }
}

function validateRelationshipType(value: unknown): AuditRelationshipType {
  switch (value) {
    case 'CORRECTS':
    case 'REVERSES':
    case 'VOIDS':
    case 'SUPERSEDES':
      return value
    default:
      throw new InvalidAuditEventError()
  }
}

function validateRelationship(value: unknown): SerializedAuditRelationship {
  if (!isPlainRecord(value) || !isPlainRecord(value.target)) throw new InvalidAuditEventError()
  return {
    relationshipId: requiredString(value.relationshipId),
    type: validateRelationshipType(value.type),
    target: {
      eventId: requiredString(value.target.eventId),
      entity: validateEntity(value.target.entity),
    },
  }
}

function validateChange(value: unknown): SerializedAuditChange {
  return AuditChange.from(value).toJSON()
}

function validateMetadata(value: unknown): unknown {
  const metadata = cloneJsonValue(value)
  if (isPlainRecord(metadata)) {
    for (const field of ['eventId', 'eventType', 'entity', 'actor', 'occurredAt', 'changes', 'relationships']) {
      if (Object.hasOwn(metadata, field)) throw new InvalidAuditEventError()
    }
  }
  return metadata
}

function validateChanges(value: unknown): readonly SerializedAuditChange[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new InvalidAuditEventError()
  return Array.from(arrayValues(value), validateChange)
}

function validateRelationships(value: unknown): readonly SerializedAuditRelationship[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0) throw new InvalidAuditEventError()
  return Array.from(arrayValues(value), validateRelationship)
}

/**
 * FinKore Audit Event for event and change representation semantics.
 *
 * An Audit Event records what occurred, when it occurred, and which Financial
 * Entity was affected. The event preserves caller-supplied stable identity,
 * event type, entity reference, optional known actor attribution, timestamp,
 * changes, relationships, and metadata without generating IDs, event types, or
 * reading wall-clock time.
 *
 * @remarks Change and relationship collections validate every position; sparse arrays are malformed.
 * Metadata follows the Audit JSON-value profile, preserving omission versus null
 * and rejecting cycles or unsupported native values without coercion.
 *
 * @see AUDIT-EVENT-001
 * @see AUDIT-EVENT-002
 * @see AUDIT-EVENT-003
 * @see AUDIT-EVENT-004
 * @see AUDIT-EVENT-005
 * @see AUDIT-EVENT-006
 * @see AUDIT-EVENT-007
 * @see AUDIT-EVENT-009
 * @see AUDIT-RELATIONSHIP-001
 */
export class AuditEvent {
  private readonly value: SerializedAuditEvent

  private constructor(value: SerializedAuditEvent) {
    this.value = value
  }

  /**
   * Creates and validates an Audit Event from a portable candidate value.
   *
   * The method validates Core 0.9 release candidate event and change representation semantics.
   * The occurrence timestamp must use the portable FinKore RFC 3339 profile
   * with an explicit known offset and at most nine fractional digits.
   * It does not define a full path language, event-type catalog, redaction
   * behavior, relationship target existence, diff engine, or production storage
   * format. Relationship target existence and uniqueness are validated by
   * AuditLog because they depend on the surrounding logical history.
   *
   * @param input - Candidate serialized Audit Event.
   * @returns A validated Audit Event value.
   * @throws {InvalidAuditEventError}
   * When event content is missing, malformed, or inconsistent, or supplied metadata
   * contains cycles or unsupported native values. Rejection does not mutate input.
   *
   * @see FINKORE_AUDIT_INVALID_EVENT
   * @see AUDIT-EVENT-001
   * @see AUDIT-EVENT-003
   * @see AUDIT-EVENT-004
   * @see AUDIT-EVENT-005
   * @see AUDIT-EVENT-007
   * @see AUDIT-EVENT-008
   * @see AUDIT-EVENT-009
   * @see AUDIT-CHANGE-001
   * @see AUDIT-CHANGE-005
   * @see AUDIT-RELATIONSHIP-001
   * @see SPEC-TIMESTAMP-001
   * @see SPEC-TIMESTAMP-002
   * @see SPEC-TIMESTAMP-003
   * @see SPEC-TIMESTAMP-004
   * @see SPEC-TIMESTAMP-006
   */
  static from(input: unknown): AuditEvent {
    if (!isPlainRecord(input)) throw new InvalidAuditEventError()
    const eventId = requiredString(input.eventId)
    const eventType = validateEventType(input.eventType)
    const entity = validateEntity(input.entity)
    const occurredAt = validateTimestamp(input.occurredAt)
    const changes = validateChanges(input.changes)
    const relationships = validateRelationships(input.relationships)
    const hasMetadata = Object.hasOwn(input, 'metadata')
    const metadata = hasMetadata ? validateMetadata(input.metadata) : undefined
    const actor = input.actor === undefined ? undefined : AuditActor.from(input.actor).toJSON()
    return new AuditEvent({
      eventId,
      eventType,
      entity,
      occurredAt,
      ...(actor === undefined ? {} : { actor }),
      ...(changes === undefined ? {} : { changes }),
      ...(relationships === undefined ? {} : { relationships }),
      ...(hasMetadata ? { metadata } : {}),
    })
  }

  /**
   * Stable event identity exactly as supplied.
   *
   * @see AUDIT-EVENT-001
   * @see AUDIT-APPEND-003
   */
  get eventId(): string {
    return this.value.eventId
  }

  /**
   * Returns portable Audit Event serialization.
   *
   * The returned value is a defensive copy. Mutating it cannot modify the
   * committed event retained by an Audit Log.
   *
   * @returns Serialized Audit Event content.
   *
   * @see AUDIT-APPEND-001
   * @see AUDIT-ACTOR-008
   */
  toJSON(): SerializedAuditEvent {
    return cloneJsonValue(this.value)
  }
}
