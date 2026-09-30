// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { InvalidApprovalChainError, InvalidApprovalDecisionError } from './errors.js'

/**
 * Captures the supported Approval fact tree without coercion or caller aliases.
 * Shared acyclic children are valid; cycles and unsupported native values fail
 * in the caller's concrete or composition evidence error category.
 * @internal
 * @see APPROVAL-FACT-004
 */
export function copyApprovalValue<T>(value: T, category: 'decision' | 'chain' = 'decision', ancestors = new Set<object>()): T {
  const invalid = () => category === 'chain' ? new InvalidApprovalChainError() : new InvalidApprovalDecisionError()
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'object' || value === null || ancestors.has(value)) throw invalid()
  ancestors.add(value)
  try {
    if (Array.isArray(value)) return Array.from(arrayValues(value), item => copyApprovalValue(item, category, ancestors)) as T
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw invalid()
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copyApprovalValue(item, category, ancestors)])) as T
  } finally {
    ancestors.delete(value)
  }
}
