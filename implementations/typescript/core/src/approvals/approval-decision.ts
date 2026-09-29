// SPDX-License-Identifier: MPL-2.0
import { copyApprovalValue } from './approval-value.js'
import { validateFactComparison } from './approval-facts.js'
import { ApprovalRequirement } from './approval-requirement.js'
import { IneligibleApprovalActorError, InvalidApprovalContextError, InvalidApprovalDecisionError } from './errors.js'
import { comparePortableTimestamps, parsePortableTimestamp } from '../portable-timestamp.js'
import type {
  ApprovalDecisionEffectiveness,
  ApprovalDecisionOutcome,
  SerializedApprovalActor,
  SerializedApprovalDecision,
} from './types.js'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidApprovalDecisionError()
  return value
}

function validateOutcome(value: unknown): ApprovalDecisionOutcome {
  if (value !== 'APPROVED' && value !== 'REJECTED') throw new InvalidApprovalDecisionError()
  return value
}

function validateTimestamp(value: unknown): string {
  const timestamp = requiredString(value)
  try {
    parsePortableTimestamp(timestamp)
  } catch {
    throw new InvalidApprovalDecisionError()
  }
  return timestamp
}

function validateActor(value: unknown): SerializedApprovalActor {
  if (!isPlainRecord(value)) throw new InvalidApprovalDecisionError()
  const type = value.type
  if (type !== undefined && (typeof type !== 'string' || type.length === 0)) throw new InvalidApprovalDecisionError()
  return { id: requiredString(value.id), ...(type === undefined ? {} : { type }) }
}

function hasPath(value: unknown, path: string): boolean {
  let current = value
  for (const segment of path.split('.')) {
    if (!isPlainRecord(current) || !Object.hasOwn(current, segment)) return false
    current = current[segment]
  }
  return true
}

function valueAtPath(value: unknown, path: string): unknown {
  let current = value
  for (const segment of path.split('.')) {
    current = (current as Readonly<Record<string, unknown>>)[segment]
  }
  return current
}

type JsonFactShape = 'array' | 'record'

function jsonFactShape(value: unknown): JsonFactShape | undefined {
  if (Array.isArray(value)) return 'array'
  if (isPlainRecord(value)) return 'record'
  return undefined
}

function jsonEquivalent(left: unknown, right: unknown): boolean {
  if (left === right) return true

  const leftShape = jsonFactShape(left)
  const rightShape = jsonFactShape(right)
  if (leftShape !== rightShape) return false

  if (leftShape === 'array') {
    const leftArray = left as readonly unknown[]
    const rightArray = right as readonly unknown[]
    return leftArray.length === rightArray.length && leftArray.every((item, index) => jsonEquivalent(item, rightArray[index]))
  }

  if (leftShape === 'record') {
    const leftRecord = left as Readonly<Record<string, unknown>>
    const rightRecord = right as Readonly<Record<string, unknown>>
    const leftKeys = Object.keys(leftRecord).sort()
    const rightKeys = Object.keys(rightRecord).sort()
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) => key === rightKeys[index] && jsonEquivalent(leftRecord[key], rightRecord[key]))
    )
  }

  return false
}

/**
 * FinKore Approval Decision for Core 0.9 release candidate decision representation.
 *
 * A Decision identifies exactly one Approval Requirement, one deciding Actor,
 * one `APPROVED` or `REJECTED` outcome, one unambiguous timestamp, and the
 * subject facts or state against which it was made. It validates an optional
 * expiration timestamp; concrete evaluation and Approval Decision history
 * evaluate that timestamp against explicit context. This class does not define withdrawal,
 * supersession, delegation, escalation, audit integration, or persistence.
 *
 * @see APPROVAL-DECISION-001
 * @see APPROVAL-DECISION-002
 * @see APPROVAL-DECISION-005
 * @see APPROVAL-DECISION-006
 *
 * @remarks
 * Native facts accept null, strings, Booleans, finite primitive numbers, arrays,
 * and plain or null-prototype records. Containers are copied independently;
 * shared acyclic children are valid. Cycles, undefined, bigint, boxed numbers,
 * nonfinite numbers, and custom scalar objects fail before retention with
 * FINKORE_APPROVAL_INVALID_DECISION. No numeric coercion is performed.
 * @see APPROVAL-FACT-004
 */
export class ApprovalDecision {
  private readonly value: SerializedApprovalDecision

  private constructor(value: SerializedApprovalDecision) {
    this.value = value
  }

  /**
   * Creates and validates an Approval Decision from a portable candidate.
   *
   * `PENDING` is rejected because it is a Requirement state, not a Decision
   * outcome. The decision timestamp must use the portable FinKore RFC 3339
   * profile with an explicit known offset and at most nine fractional digits.
   *
   * @param input - Candidate serialized Approval Decision.
   * @returns A validated Approval Decision value.
   * @throws {InvalidApprovalDecisionError}
   * When required decision content is missing or malformed.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-005
   * @see APPROVAL-DECISION-006
   * @see SPEC-TIMESTAMP-001
   * @see SPEC-TIMESTAMP-002
   * @see SPEC-TIMESTAMP-003
   * @see SPEC-TIMESTAMP-004
   * @see SPEC-TIMESTAMP-006
   */
  static from(input: unknown): ApprovalDecision {
    if (!isPlainRecord(input) || !Object.hasOwn(input, 'subjectFacts')) throw new InvalidApprovalDecisionError()
    if (input.subjectFacts === undefined) throw new InvalidApprovalDecisionError()
    return new ApprovalDecision({
      requirementId: requiredString(input.requirementId),
      subjectFacts: copyApprovalValue(input.subjectFacts),
      outcome: validateOutcome(input.outcome),
      actor: validateActor(input.actor),
      decidedAt: validateTimestamp(input.decidedAt),
      ...(Object.hasOwn(input, 'expiresAt') ? { expiresAt: validateTimestamp(input.expiresAt) } : {}),
    })
  }

  /**
   * Creates and validates a Decision for a specific Requirement.
   *
   * Association and eligibility are checked after structural validation and
   * before callers commit the decision to history.
   *
   * @param requirement - Requirement the Decision must address.
   * @param input - Candidate serialized Approval Decision.
   * @returns A validated Approval Decision associated with the Requirement.
   * @throws {InvalidApprovalDecisionError}
   * When the decision is malformed or identifies another Requirement.
   * @throws {IneligibleApprovalActorError}
   * When the deciding Actor does not satisfy the Requirement eligibility rule.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see FINKORE_APPROVAL_INELIGIBLE_ACTOR
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-004
   */
  static forRequirement(requirement: ApprovalRequirement, input: unknown): ApprovalDecision {
    const decision = ApprovalDecision.from(input)
    if (decision.requirementId !== requirement.id) throw new InvalidApprovalDecisionError()
    if (!requirement.isEligibleActor(decision.actor.id)) throw new IneligibleApprovalActorError()
    return decision
  }

  /**
   * Evaluates a concrete Decision against its Requirement and current facts.
   * Validates subject, eligibility, association and exact expiration context
   * before comparing relevant facts. Neither input nor history is mutated.
   * Without lifecycle history this makes no withdrawal/supersession claim.
   *
   * Omitted selectors compare complete facts; null/empty selectors are invalid
   * before expiration filtering. Equality is structural and type-sensitive.
   *
   * @param requirementInput - Concrete Requirement with subject and eligibility.
   * @param decisionInput - Complete Decision associated with that Requirement.
   * @param currentSubjectFacts - Current facts; absent paths compare all facts.
   * @param relevantFactPaths - Optional declared relevant fact paths.
   * @param evaluatedAt - Required portable timestamp when the Decision expires.
   * @returns `EFFECTIVE` or `INEFFECTIVE` for the supplied concrete context.
   * @throws {InvalidApprovalDecisionError} For malformed or mismatched evidence.
   * @throws {IneligibleApprovalActorError} For an excluded deciding Actor.
   * @throws {InvalidApprovalContextError} For invalid required expiration context.
   * @see APPROVAL-DECISION-009
   * @see APPROVAL-VALIDITY-007
   * @see SPEC-TIMESTAMP-005
   */
  static evaluate(
    requirementInput: unknown,
    decisionInput: unknown,
    currentSubjectFacts: unknown,
    relevantFactPaths?: readonly string[],
    evaluatedAt?: unknown,
  ): ApprovalDecisionEffectiveness {
    const decision = ApprovalDecision.forRequirement(ApprovalRequirement.from(requirementInput), decisionInput)
    validateFactComparison(currentSubjectFacts, relevantFactPaths)
    if (decision.expiresAt !== undefined) {
      try {
        if (typeof evaluatedAt !== 'string') throw new InvalidApprovalContextError()
        parsePortableTimestamp(evaluatedAt)
      } catch {
        throw new InvalidApprovalContextError()
      }
      if (comparePortableTimestamps(evaluatedAt, decision.expiresAt) >= 0) return 'INEFFECTIVE'
    }
    return decision.evaluateEffectiveness(currentSubjectFacts, relevantFactPaths)
  }

  /**
   * Requirement identity this Decision addresses.
   *
   * @see APPROVAL-DECISION-001
   */
  get requirementId(): string {
    return this.value.requirementId
  }

  /**
   * Deciding Actor attribution.
   *
   * @see APPROVAL-DECISION-001
   */
  get actor(): SerializedApprovalActor {
    return structuredClone(this.value.actor)
  }

  /**
   * Approval or rejection outcome.
   *
   * @see APPROVAL-DECISION-005
   */
  get outcome(): ApprovalDecisionOutcome {
    return this.value.outcome
  }

  /**
   * Timestamp when this Decision was made.
   *
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-006
   */
  get decidedAt(): string {
    return this.value.decidedAt
  }

  /**
   * Optional instant at which this Decision expires for current evaluation.
   *
   * Expiration requires explicit evaluation context and is handled by
   * `ApprovalDecision.evaluate` and `ApprovalDecisionHistory.evaluateRequirement`.
   *
   * @see APPROVAL-VALIDITY-007
   * @see APPROVAL-VALIDITY-009
   * @see SPEC-TIMESTAMP-005
   */
  get expiresAt(): string | undefined {
    return this.value.expiresAt
  }

  /**
   * Evaluates whether this Decision remains effective for current subject facts.
   *
   * Only caller-declared relevant fact paths are compared when supplied. Without
   * explicit relevant paths, the full supplied subject-fact value is compared.
   * This facts-only helper does not validate Requirement association, eligibility,
   * expiration, or lifecycle history. Use `ApprovalDecision.evaluate` for concrete
   * Decision evaluation. The composing domain defines which changes are material.
   *
   * @param currentSubjectFacts - Current subject facts or state to compare.
   * @param relevantFactPaths - Optional domain-defined relevant fact paths.
   * @returns `EFFECTIVE` when relevant facts are unchanged; otherwise `INEFFECTIVE`.
   * @throws {InvalidApprovalDecisionError}
   * When relevant fact paths are malformed.
   *
   * @see APPROVAL-DECISION-002
   * @see APPROVAL-DECISION-003
   */
  evaluateEffectiveness(
    currentSubjectFacts: unknown,
    relevantFactPaths?: readonly string[],
  ): ApprovalDecisionEffectiveness {
    const paths = validateFactComparison(currentSubjectFacts, relevantFactPaths)
    if (paths === undefined) {
      return jsonEquivalent(this.value.subjectFacts, currentSubjectFacts) ? 'EFFECTIVE' : 'INEFFECTIVE'
    }
    return paths.every(
      (path) =>
        hasPath(this.value.subjectFacts, path) &&
        hasPath(currentSubjectFacts, path) &&
        jsonEquivalent(valueAtPath(this.value.subjectFacts, path), valueAtPath(currentSubjectFacts, path)),
    )
      ? 'EFFECTIVE'
      : 'INEFFECTIVE'
  }

  /**
   * Returns portable Approval Decision serialization.
   *
   * The returned value is a defensive copy. Mutating it cannot modify this
   * Decision or a committed Approval history.
   *
   * @returns Serialized Approval Decision content.
   *
   * @see APPROVAL-DECISION-007
   */
  toJSON(): SerializedApprovalDecision {
    return copyApprovalValue(this.value)
  }
}
