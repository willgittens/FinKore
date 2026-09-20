// SPDX-License-Identifier: MPL-2.0
import { InvalidAuditActorError } from './errors.js'
import type { SerializedAuditActor } from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditActorError()
  return value
}

function cloneJsonValue<T>(value: T): T {
  return structuredClone(value)
}

/**
 * Known Actor attribution for a FinKore Audit Event.
 *
 * Actor identity is caller-supplied and opaque. Actor type and display metadata
 * are preserved when supplied, but they do not replace the stable actor
 * identifier. This class does not implement authentication, authorization,
 * identity-provider lookup, delegation, or redaction policy.
 *
 * @see AUDIT-ACTOR-001
 * @see AUDIT-ACTOR-002
 * @see AUDIT-ACTOR-003
 * @see AUDIT-ACTOR-007
 * @see AUDIT-ACTOR-008
 * @see AUDIT-ACTOR-009
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
      ...(input.metadata === undefined ? {} : { metadata: cloneJsonValue(input.metadata) }),
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
   * committed event's actor identity through a retained reference.
   *
   * @returns Serialized known Actor attribution.
   *
   * @see AUDIT-ACTOR-008
   */
  toJSON(): SerializedAuditActor {
    return cloneJsonValue(this.value)
  }
}
