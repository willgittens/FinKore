// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { InvalidAuditActorError } from './errors.js'
import type { SerializedAuditActor } from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditActorError()
  return value
}

function cloneJsonValue<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new InvalidAuditActorError()
    return value
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new InvalidAuditActorError()
    ancestors.add(value)
    const result = Array.from(arrayValues(value), (item) => cloneJsonValue(item, ancestors))
    ancestors.delete(value)
    return result as T
  }
  if (isPlainRecord(value)) {
    if (ancestors.has(value)) throw new InvalidAuditActorError()
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string')) throw new InvalidAuditActorError()
    ancestors.add(value)
    // Define own data members; assignment would invoke the __proto__ setter.
    const result = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJsonValue(item, ancestors)]),
    )
    ancestors.delete(value)
    return result as T
  }
  throw new InvalidAuditActorError()
}

/**
 * Known Actor attribution for a FinKore Audit Event.
 *
 * Actor identity is caller-supplied and opaque. Actor type and display metadata
 * are preserved when supplied, but they do not replace the stable actor
 * identifier. This class does not implement authentication, authorization,
 * identity-provider lookup, delegation, or redaction policy.
 *
 * @remarks Metadata arrays validate every position; sparse arrays are malformed JSON values.
 *
 * @see AUDIT-ACTOR-001
 * @see AUDIT-ACTOR-002
 * @see AUDIT-ACTOR-003
 * @see AUDIT-ACTOR-007
 * @see AUDIT-ACTOR-008
 * @see AUDIT-ACTOR-009
 * @see AUDIT-ACTOR-010
 */
export class AuditActor {
  private readonly value: SerializedAuditActor

  private constructor(value: SerializedAuditActor) {
    this.value = value
  }

  /**
   * Creates and validates known Actor attribution.
   *
   * Unknown attribution may be represented by omitting the actor from an Audit
   * Event. FinKore Core 0.9 release candidate leaves a serialized unknown-actor representation
   * open, so this method accepts only known actors with stable identifiers.
   * Metadata retains every own JSON member recursively, including `__proto__`
   * and `constructor`, as data. Construction does not mutate caller objects.
   *
   * @param input - Candidate serialized known actor.
   * @returns A validated Audit Actor value.
   * @throws {InvalidAuditActorError}
   * When actor attribution is malformed or lacks stable identity.
   *
   * @see FINKORE_AUDIT_ACTOR_INVALID
   * @see AUDIT-ACTOR-001
   * @see AUDIT-ACTOR-004
   * @see AUDIT-ACTOR-009
   * @see AUDIT-ACTOR-010
   */
  static from(input: unknown): AuditActor {
    if (!isPlainRecord(input) || typeof input.id !== 'string' || input.id.length === 0) {
      throw new InvalidAuditActorError()
    }
    const type = optionalString(input.type)
    const displayName = optionalString(input.displayName)
    return new AuditActor({
      id: input.id,
      ...(type === undefined ? {} : { type }),
      ...(displayName === undefined ? {} : { displayName }),
      ...(Object.hasOwn(input, 'metadata') ? { metadata: cloneJsonValue(input.metadata) } : {}),
    })
  }

  /**
   * Stable actor identity exactly as supplied.
   *
   * @see AUDIT-ACTOR-001
   * @see AUDIT-ACTOR-002
   */
  get id(): string {
    return this.value.id
  }

  /**
   * Returns portable known-actor attribution.
   *
   * The returned object is a defensive copy so consumers cannot mutate a
   * committed event's actor identity or nested metadata through a retained
   * reference. JSON member names are preserved without invoking prototype setters.
   *
   * @returns Serialized known Actor attribution.
   *
   * @see AUDIT-ACTOR-008
   * @see AUDIT-ACTOR-010
   */
  toJSON(): SerializedAuditActor {
    return cloneJsonValue(this.value)
  }
}
