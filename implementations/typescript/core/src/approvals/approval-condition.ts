// SPDX-License-Identifier: MPL-2.0
import { ApprovalConditionUnresolvedError, InvalidApprovalDecisionError } from './errors.js'
import type {
  ApprovalConditionEvaluationResult,
  ApprovalConditionFactPath,
  ApprovalConditionIdentifier,
  SerializedApprovalCondition,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidApprovalDecisionError()
  return value
}

function validateRequiredFacts(value: unknown): readonly ApprovalConditionFactPath[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalDecisionError()
  const facts = value.map(requiredString)
  if (new Set(facts).size !== facts.length) throw new InvalidApprovalDecisionError()
  return facts
}

function validateEvaluationResult(value: unknown): ApprovalConditionEvaluationResult {
  if (value !== 'APPLICABLE' && value !== 'NOT_APPLICABLE') throw new ApprovalConditionUnresolvedError()
  return value
}

function factPresent(facts: Readonly<Record<string, unknown>>, path: string): boolean {
  let current: unknown = facts
  for (const segment of path.split('.')) {
    if (!isPlainRecord(current) || !Object.hasOwn(current, segment)) return false
    current = current[segment]
  }
  return true
}

/**
 * FinKore Approval Condition for Draft 0.1 representation and evaluation boundary semantics.
 *
 * A Condition has a stable caller-supplied identity, declares the domain facts
 * required to evaluate it, and preserves the composing-domain evaluation model
 * exactly as supplied. This class does not implement an expression language,
 * comparison operators, logical composition, policy engines, callbacks,
 * authorization, workflow integration, audit integration, or chains.
 *
 * @see APPROVAL-CONDITION-001
 * @see APPROVAL-CONDITION-002
 * @see APPROVAL-CONDITION-004
 * @see APPROVAL-CONDITION-005
 * @see APPROVAL-CONDITION-006
 */
export class ApprovalCondition {
  private readonly value: SerializedApprovalCondition

  private constructor(value: SerializedApprovalCondition) {
    this.value = value
  }

  /**
   * Creates and validates an Approval Condition from a portable candidate.
   *
   * Condition identity and evaluation ownership are preserved exactly. Required
   * facts are explicit identifiers and are not interpreted as expressions.
   *
   * @param input - Candidate serialized Approval Condition.
   * @returns A validated Approval Condition value.
   * @throws {InvalidApprovalDecisionError}
   * When required condition representation is missing or malformed.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see APPROVAL-CONDITION-001
   * @see APPROVAL-CONDITION-004
   */
  static from(input: unknown): ApprovalCondition {
    if (!isPlainRecord(input)) throw new InvalidApprovalDecisionError()
    return new ApprovalCondition({
      id: requiredString(input.id),
      requiredFacts: validateRequiredFacts(input.requiredFacts),
      evaluation: requiredString(input.evaluation),
    })
  }

  /**
   * Stable condition identity exactly as supplied.
   *
   * @see APPROVAL-CONDITION-001
   */
  get id(): ApprovalConditionIdentifier {
    return this.value.id
  }

  /**
   * Declared facts required before this condition can be evaluated.
   *
   * @see APPROVAL-CONDITION-001
   * @see APPROVAL-CONDITION-006
   */
  get requiredFacts(): readonly ApprovalConditionFactPath[] {
    return [...this.value.requiredFacts]
  }

  /**
   * Validates fact completeness and accepts an explicit composing-domain result.
   *
   * Missing required facts produce `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.
   * Present facts with values such as `null`, `false`, `0`, or `""` count as
   * present; FinKore does not interpret those values as truthy or falsey rule
   * outcomes. The result is deterministic for the same condition, supplied
   * facts, and explicit boundary result.
   *
   * @param input - Supplied facts and externally resolved condition result.
   * @returns The explicit `APPLICABLE` or `NOT_APPLICABLE` result.
   * @throws {ApprovalConditionUnresolvedError}
   * When required facts or an explicit boundary result are absent.
   * @throws {InvalidApprovalDecisionError}
   * When supplied facts are malformed.
   *
   * @see FINKORE_APPROVAL_CONDITION_UNRESOLVED
   * @see APPROVAL-CONDITION-002
   * @see APPROVAL-CONDITION-005
   * @see APPROVAL-CONDITION-006
   */
  evaluate(input: {
    readonly facts: unknown
    readonly result?: unknown
  }): ApprovalConditionEvaluationResult {
    if (!isPlainRecord(input.facts)) throw new InvalidApprovalDecisionError()
    for (const fact of this.value.requiredFacts) {
      if (!factPresent(input.facts, fact)) throw new ApprovalConditionUnresolvedError()
    }
    return validateEvaluationResult(input.result)
  }

  /**
   * Returns portable Approval Condition serialization.
   *
   * The returned value is a defensive copy. Mutating it cannot modify this
   * Condition.
   *
   * @returns Serialized Approval Condition content.
   *
   * @see APPROVAL-CONDITION-001
   */
  toJSON(): SerializedApprovalCondition {
    return structuredClone(this.value)
  }
}
