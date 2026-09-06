import { InvalidAuditEventError } from './errors.js'
import type { SerializedAuditChange } from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditEventError()
  return value
}

function cloneAuditValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new InvalidAuditEventError()
  }
}

function auditValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true

  if (Array.isArray(left)) {
    return Array.isArray(right) ? arraysEqual(left, right) : false
  }

  // Stryker disable next-line ConditionalExpression: equivalent; non-record left values still compare unequal through recordsEqual when forced into this branch.
  if (isPlainRecord(left)) {
    return isPlainRecord(right) ? recordsEqual(left, right) : false
  }

  return false
}

function arraysEqual(left: readonly unknown[], right: readonly unknown[]): boolean {
  return left.length === right.length && left.every((value, index) => auditValuesEqual(value, right[index]))
}

function recordsEqual(left: Readonly<Record<string, unknown>>, right: Readonly<Record<string, unknown>>): boolean {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return leftKeys.length === rightKeys.length && leftKeys.every((key) => Object.hasOwn(right, key) && auditValuesEqual(left[key], right[key]))
}

/**
 * FinKore Audit Change value retained inside an Audit Event.
 *
 * A Change identifies the affected domain field or path and preserves supplied
 * prior and resulting values without interpreting Money, Workflow, or future
 * Entity semantics. Draft 0.1 does not define a portable path syntax, change
 * kind catalog, duplicate-path rule, or diff engine.
 *
 * @see AUDIT-CHANGE-001
 * @see AUDIT-CHANGE-002
 * @see AUDIT-CHANGE-003
 * @see AUDIT-CHANGE-005
 */
export class AuditChange {
  private readonly value: SerializedAuditChange

  private constructor(value: SerializedAuditChange) {
    this.value = value
  }

  /**
   * Creates and validates an Audit Change from a portable candidate value.
   *
   * The field/path identity is required. When both `before` and `after` are
   * supplied, they must represent different domain values; explicit `null` and
   * omitted members remain distinct.
   *
   * @param input - Candidate serialized Audit Change.
   * @returns A validated Audit Change value.
   * @throws {InvalidAuditEventError}
   * When the change is malformed or claims an unchanged value changed.
   *
   * @see FINKORE_AUDIT_INVALID_EVENT
   * @see AUDIT-CHANGE-001
   * @see AUDIT-CHANGE-003
   * @see AUDIT-CHANGE-005
   */
  static from(input: unknown): AuditChange {
    if (!isPlainRecord(input)) throw new InvalidAuditEventError()

    const hasBefore = Object.hasOwn(input, 'before')
    const hasAfter = Object.hasOwn(input, 'after')
    const before = hasBefore ? cloneAuditValue(input.before) : undefined
    const after = hasAfter ? cloneAuditValue(input.after) : undefined

    if (hasBefore && hasAfter && auditValuesEqual(before, after)) {
      throw new InvalidAuditEventError()
    }

    return new AuditChange({
      path: requiredString(input.path),
      ...(hasBefore ? { before } : {}),
      ...(hasAfter ? { after } : {}),
    })
  }

  /**
   * Returns portable Audit Change serialization.
   *
   * The returned value is a defensive copy, so callers cannot mutate retained
   * historical before/after values through a previous observation.
   *
   * @returns Serialized Audit Change content.
   *
   * @see AUDIT-APPEND-001
   * @see AUDIT-CHANGE-002
   * @see AUDIT-CHANGE-003
   */
  toJSON(): SerializedAuditChange {
    return cloneAuditValue(this.value)
  }
}
