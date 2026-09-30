// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { InvalidAuditRedactionError } from './errors.js'
import type {
  AuditRedactionPolicy,
  SerializedAuditChange,
  SerializedAuditEvent,
  SerializedAuditRedactedValue,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditRedactionError()
  return value
}

function cloneAuditValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new InvalidAuditRedactionError()
  }
}

function isRedactedValue(value: unknown): boolean {
  return isPlainRecord(value) && value.presence === 'REDACTED' && Object.keys(value).length === 1
}

function redactValue(value: unknown): SerializedAuditRedactedValue {
  if (isRedactedValue(value)) throw new InvalidAuditRedactionError()
  return { presence: 'REDACTED' }
}

function redactChange(change: SerializedAuditChange, protectedPaths: ReadonlySet<string>): SerializedAuditChange {
  if (!protectedPaths.has(change.path)) return cloneAuditValue(change)

  const hasBefore = Object.hasOwn(change, 'before')
  const hasAfter = Object.hasOwn(change, 'after')
  if (!hasBefore && !hasAfter) throw new InvalidAuditRedactionError()

  return {
    path: change.path,
    ...(hasBefore ? { before: redactValue(change.before) } : {}),
    ...(hasAfter ? { after: redactValue(change.after) } : {}),
  }
}

function foundProtectedPaths(event: SerializedAuditEvent, policy: AuditRedactionPolicy): ReadonlySet<string> {
  const protectedPaths = new Set(policy.protectedPaths)
  const foundPaths = new Set<string>()
  if (protectedPaths.has('actor.displayName') && event.actor !== undefined && Object.hasOwn(event.actor, 'displayName')) {
    foundPaths.add('actor.displayName')
  }
  if (protectedPaths.has('actor.metadata') && event.actor !== undefined && Object.hasOwn(event.actor, 'metadata')) {
    foundPaths.add('actor.metadata')
  }
  for (const change of event.changes ?? []) {
    if (protectedPaths.has(change.path)) foundPaths.add(change.path)
  }
  return foundPaths
}

function redactActor(
  actor: NonNullable<SerializedAuditEvent['actor']>,
  protectedPaths: ReadonlySet<string>,
): NonNullable<SerializedAuditEvent['actor']> {
  return {
    ...cloneAuditValue(actor),
    ...(protectedPaths.has('actor.displayName') && Object.hasOwn(actor, 'displayName')
      ? { displayName: redactValue(actor.displayName) }
      : {}),
    ...(protectedPaths.has('actor.metadata') && Object.hasOwn(actor, 'metadata')
      ? { metadata: redactValue(actor.metadata) }
      : {}),
  }
}

/**
 * Validates the Core 0.9 release candidate redaction policy fixture accepted by AuditLog.redact.
 *
 * @param input - Candidate redaction policy.
 * @returns A defensive policy value with protected change paths.
 * @throws {InvalidAuditRedactionError}
 * When supplied identity is not a nonempty string, the policy lacks authority
 * or protected paths, or a path position is malformed (including a sparse array hole).
 *
 * @see FINKORE_AUDIT_REDACTION_INVALID
 * @see AUDIT-REDACTION-001
 * @see AUDIT-REDACTION-008
 */
export function validateAuditRedactionPolicy(input: unknown): AuditRedactionPolicy {
  if (!isPlainRecord(input)) throw new InvalidAuditRedactionError()
  if (!Array.isArray(input.protectedPaths) || input.protectedPaths.length === 0) {
    throw new InvalidAuditRedactionError()
  }

  return {
    ...(Object.hasOwn(input, 'id') ? { id: requiredString(input.id) } : {}),
    protectedPaths: Array.from(arrayValues(input.protectedPaths), requiredString),
    authority: requiredString(input.authority),
  }
}

/**
 * Reports whether one event contains every path required by a redaction policy.
 *
 * @param event - Committed Audit Event observation.
 * @param policy - Validated redaction policy.
 * @returns `true` when the event is the policy's affected event candidate.
 *
 * @see AUDIT-REDACTION-001
 */
export function auditEventMatchesRedactionPolicy(event: SerializedAuditEvent, policy: AuditRedactionPolicy): boolean {
  return foundProtectedPaths(event, policy).size === policy.protectedPaths.length
}

/**
 * Produces a redacted representation of one Audit Event for protected content.
 *
 * Required event identity, type, entity reference, timestamp, actor identity,
 * actor type, relationships, and unrelated changes are preserved. The
 * committed source event supplied by the caller is not modified.
 *
 * @param event - Committed Audit Event observation to redact.
 * @param policy - Validated redaction policy.
 * @returns A redacted event representation.
 * @throws {InvalidAuditRedactionError}
 * When no protected target is found or the target is already redacted.
 *
 * @see AUDIT-REDACTION-002
 * @see AUDIT-REDACTION-003
 * @see AUDIT-CHANGE-006
 * @see AUDIT-ACTOR-006
 * @see AUDIT-RELATIONSHIP-010
 */
export function redactAuditEvent(event: SerializedAuditEvent, policy: AuditRedactionPolicy): SerializedAuditEvent {
  const protectedPaths = new Set(policy.protectedPaths)
  const changes = event.changes ?? []
  if (!auditEventMatchesRedactionPolicy(event, policy)) throw new InvalidAuditRedactionError()

  return {
    ...cloneAuditValue(event),
    ...(event.actor === undefined ? {} : { actor: redactActor(event.actor, protectedPaths) }),
    ...(event.changes === undefined ? {} : { changes: changes.map((change) => redactChange(change, protectedPaths)) }),
  }
}
