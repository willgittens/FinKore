// SPDX-License-Identifier: MPL-2.0
import { InvalidAuditEventError } from './errors.js'
import type { SerializedAuditChange } from './types.js'
import { Money } from '../money/money.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidAuditEventError()
  return value
}

function cloneAuditValue<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new InvalidAuditEventError()
    return value
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new InvalidAuditEventError()
    ancestors.add(value)
    const result = value.map((item) => cloneAuditValue(item, ancestors))
    ancestors.delete(value)
    return result as T
  }
  if (isPlainRecord(value)) {
    if (ancestors.has(value)) throw new InvalidAuditEventError()
    if (Reflect.ownKeys(value).some((key) => typeof key !== 'string')) throw new InvalidAuditEventError()
    ancestors.add(value)
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      result[key] = cloneAuditValue(item, ancestors)
    }
    ancestors.delete(value)
    return result as T
  }
  throw new InvalidAuditEventError()
}

function declaredMoney(value: unknown): Money | null {
  if (value === null) return null
  try {
    return Money.deserialize(value)
  } catch {
    throw new InvalidAuditEventError()
  }
}

function moneyValuesEqual(left: Money | null, right: Money | null): boolean {
  if (left === null || right === null) return left === right
  if (left.currency.code !== right.currency.code) return false
  return left.compare(right) === 'EQUAL'
}

function auditValuesEqual(left: unknown, right: unknown): boolean {
  if (typeof left === 'number' && typeof right === 'number') {
    return Number.isFinite(left) && Number.isFinite(right) && left === right
  }
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
 * prior and resulting values. Money semantics are applied only when the Change
 * explicitly declares `valueType: 'MONEY'`; ordinary JSON objects are never
 * inferred to be Money. Core 0.9 release candidate does not define a portable
 * path syntax, change kind catalog, duplicate-path rule, or diff engine.
 *
 * @see AUDIT-CHANGE-001
 * @see AUDIT-CHANGE-002
 * @see AUDIT-CHANGE-003
 * @see AUDIT-CHANGE-005
 * @see AUDIT-CHANGE-008
 * @see AUDIT-CHANGE-009
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
   * @see AUDIT-CHANGE-008
   * @see AUDIT-CHANGE-009
   */
  static from(input: unknown): AuditChange {
    if (!isPlainRecord(input)) throw new InvalidAuditEventError()

    const hasBefore = Object.hasOwn(input, 'before')
    const hasAfter = Object.hasOwn(input, 'after')
    const before = hasBefore ? cloneAuditValue(input.before) : undefined
    const after = hasAfter ? cloneAuditValue(input.after) : undefined

    const hasValueType = Object.hasOwn(input, 'valueType')
    if (hasValueType && input.valueType !== 'MONEY') {
      throw new InvalidAuditEventError()
    }

    const beforeMoney = hasValueType && hasBefore ? declaredMoney(before) : null
    const afterMoney = hasValueType && hasAfter ? declaredMoney(after) : null
    const unchanged = hasBefore && hasAfter && (
      hasValueType
        ? moneyValuesEqual(beforeMoney, afterMoney)
        : auditValuesEqual(before, after)
    )
    if (unchanged) {
      throw new InvalidAuditEventError()
    }

    return new AuditChange({
      path: requiredString(input.path),
      ...(hasValueType ? { valueType: 'MONEY' as const } : {}),
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
   * @see AUDIT-CHANGE-009
   */
  toJSON(): SerializedAuditChange {
    return cloneAuditValue(this.value)
  }
}
