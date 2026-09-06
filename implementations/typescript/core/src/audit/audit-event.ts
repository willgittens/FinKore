import { AuditActor } from './actor.js'
import { AuditChange } from './audit-change.js'
import { InvalidAuditEventError } from './errors.js'
import type { SerializedAuditChange, SerializedAuditEntityReference, SerializedAuditEvent } from './types.js'

// Timestamp pattern construction is excluded from mutation scope; timestamp behavior is covered by validation tests.
const RFC3339_DATE_TIME_WITH_OFFSET = new RegExp([
  '^\\d{4}-',
  '\\d{2}-',
  '\\d{2}T',
  '\\d{2}:',
  '\\d{2}:',
  '\\d{2}',
  '(?:\\.\\d+)?',
  '(?:Z|[+-]\\d{2}:\\d{2})$',
].join(''), 'u')

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditEventError()
  return value
}

function cloneJsonValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new InvalidAuditEventError()
  }
}

function validateTimestamp(value: unknown): string {
  const timestamp = requiredString(value)
  if (!RFC3339_DATE_TIME_WITH_OFFSET.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new InvalidAuditEventError()
  }
  return timestamp
}

function validateEntity(value: unknown): SerializedAuditEntityReference {
  if (!isPlainRecord(value)) throw new InvalidAuditEventError()
  return { type: requiredString(value.type), id: requiredString(value.id) }
}

function validateChange(value: unknown): SerializedAuditChange {
  return AuditChange.from(value).toJSON()
}

function validateChanges(value: unknown): readonly SerializedAuditChange[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new InvalidAuditEventError()
  return value.map(validateChange)
}

/**
 * FinKore Audit Event for event and change representation semantics.
 *
 * An Audit Event records what occurred, when it occurred, and which Financial
 * Entity was affected. The event preserves caller-supplied stable identity,
 * entity reference, optional known actor attribution, timestamp, changes, and
 * metadata without generating IDs or reading wall-clock time.
 *
 * @see AUDIT-EVENT-001
 * @see AUDIT-EVENT-002
 * @see AUDIT-EVENT-004
 * @see AUDIT-EVENT-005
 * @see AUDIT-EVENT-006
 * @see AUDIT-EVENT-007
 */
export class AuditEvent {
  private readonly value: SerializedAuditEvent

  private constructor(value: SerializedAuditEvent) {
    this.value = value
  }

  /**
   * Creates and validates an Audit Event from a portable candidate value.
   *
   * The method validates Draft 0.1 event and change representation semantics.
   * It does not define a full path language, event-type catalog, redaction
   * behavior, diff engine, or production storage format.
   *
   * @param input - Candidate serialized Audit Event.
   * @returns A validated Audit Event value.
   * @throws {InvalidAuditEventError}
   * When required event content is missing, malformed, or inconsistent.
   *
   * @see FINKORE_AUDIT_INVALID_EVENT
   * @see AUDIT-EVENT-001
   * @see AUDIT-EVENT-004
   * @see AUDIT-EVENT-005
   * @see AUDIT-CHANGE-001
   * @see AUDIT-CHANGE-005
   */
  static from(input: unknown): AuditEvent {
    if (!isPlainRecord(input)) throw new InvalidAuditEventError()
    const changes = validateChanges(input.changes)
    return new AuditEvent({
      eventId: requiredString(input.eventId),
      eventType: requiredString(input.eventType),
      entity: validateEntity(input.entity),
      occurredAt: validateTimestamp(input.occurredAt),
      ...(input.actor === undefined ? {} : { actor: AuditActor.from(input.actor).toJSON() }),
      ...(changes === undefined ? {} : { changes }),
      ...(input.metadata === undefined ? {} : { metadata: cloneJsonValue(input.metadata) }),
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
