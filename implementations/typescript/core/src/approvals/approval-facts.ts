// SPDX-License-Identifier: MPL-2.0
import { InvalidApprovalDecisionError } from './errors.js'

/**
 * Rejects empty selector lists and paths with empty dot-separated segments.
 * @throws {InvalidApprovalDecisionError} For malformed selector declarations.
 * @internal
 * @see APPROVAL-FACT-002
 */
export function validateFactPaths(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalDecisionError()
  for (const path of value) {
    if (typeof path !== 'string' || path.split('.').some(segment => segment.length === 0)) {
      throw new InvalidApprovalDecisionError()
    }
  }
  return value as readonly string[]
}

/**
 * Validates fact presence and selector declarations before lifecycle filtering.
 * Only Requirement evaluation permits both facts and selectors to be omitted.
 * Explicit null facts are supplied values; explicit null selectors are invalid.
 * @throws {InvalidApprovalDecisionError} For malformed comparison requests.
 * @internal
 * @see APPROVAL-FACT-001
 */
export function validateFactComparison(currentFacts: unknown, paths: unknown, allowOmission = false): readonly string[] | undefined {
  const selected = paths === undefined ? undefined : validateFactPaths(paths)
  if (currentFacts === undefined && (!allowOmission || selected !== undefined)) throw new InvalidApprovalDecisionError()
  return selected
}
