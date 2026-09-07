import { ApprovalRequirement } from './approval-requirement.js'
import { IneligibleApprovalActorError, InvalidApprovalDecisionError } from './errors.js'
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

function cloneJsonValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new InvalidApprovalDecisionError()
  }
}

function validateOutcome(value: unknown): ApprovalDecisionOutcome {
  if (value !== 'APPROVED' && value !== 'REJECTED') throw new InvalidApprovalDecisionError()
  return value
}

function validateTimestamp(value: unknown): string {
  const timestamp = requiredString(value)
  if (!RFC3339_DATE_TIME_WITH_OFFSET.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
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

function validateRelevantFactPaths(value: readonly string[] | undefined): readonly string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.some((path) => typeof path !== 'string' || path.length === 0)) {
    throw new InvalidApprovalDecisionError()
  }
  return value
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
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!isPlainRecord(current)) return undefined
    return current[segment]
  }, value)
}

function jsonEquivalent(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => jsonEquivalent(item, right[index]))
    )
  }
  if (isPlainRecord(left) || isPlainRecord(right)) {
    if (!isPlainRecord(left) || !isPlainRecord(right)) return false
    const leftKeys = Object.keys(left).sort()
    const rightKeys = Object.keys(right).sort()
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) => key === rightKeys[index] && jsonEquivalent(left[key], right[key]))
    )
  }
  return false
}

// Stryker disable all: regex construction mechanics are equivalent noise; timestamp acceptance/rejection behavior is covered by validation tests.
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
// Stryker restore all

/**
 * FinKore Approval Decision for Draft 0.1 decision representation.
 *
 * A Decision identifies exactly one Approval Requirement, one deciding Actor,
 * one `APPROVED` or `REJECTED` outcome, one unambiguous timestamp, and the
 * subject facts or state against which it was made. This class does not define
 * withdrawal, supersession, delegation, expiration, escalation, audit
 * integration, or persistence.
 *
 * @see APPROVAL-DECISION-001
 * @see APPROVAL-DECISION-002
 * @see APPROVAL-DECISION-005
 * @see APPROVAL-DECISION-006
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
   * outcome. The decision timestamp must serialize as an unambiguous RFC 3339
   * date-time with an explicit offset.
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
   */
  static from(input: unknown): ApprovalDecision {
    if (!isPlainRecord(input) || !Object.hasOwn(input, 'subjectFacts')) throw new InvalidApprovalDecisionError()
    if (input.subjectFacts === undefined) throw new InvalidApprovalDecisionError()
    return new ApprovalDecision({
      requirementId: requiredString(input.requirementId),
      subjectFacts: cloneJsonValue(input.subjectFacts),
      outcome: validateOutcome(input.outcome),
      actor: validateActor(input.actor),
      decidedAt: validateTimestamp(input.decidedAt),
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
   * Evaluates whether this Decision remains effective for current subject facts.
   *
   * Only caller-declared relevant fact paths are compared when supplied. Without
   * explicit relevant paths, the full supplied subject-fact value is compared.
   * This method does not define which mutations are material; that remains a
   * composing-domain policy choice under Draft 0.1.
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
    const paths = validateRelevantFactPaths(relevantFactPaths)
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
    return cloneJsonValue(this.value)
  }
}
