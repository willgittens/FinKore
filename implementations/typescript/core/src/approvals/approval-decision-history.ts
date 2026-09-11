// SPDX-License-Identifier: MPL-2.0
import { ApprovalDecision } from './approval-decision.js'
import { ApprovalRequirement } from './approval-requirement.js'
import { IneligibleApprovalActorError, InvalidApprovalContextError, InvalidApprovalDecisionError } from './errors.js'
import type {
  SerializedApprovalActor,
  ApprovalRequirementState,
  SerializedApprovalDecision,
  SerializedApprovalDecisionReference,
  SerializedApprovalDecisionHistory,
  SerializedApprovalLifecycleEvent,
} from './types.js'

type ApprovalLifecycleEvent =
  | {
      readonly type: 'WITHDRAWN'
      readonly target: SerializedApprovalDecisionReference
      readonly actor: SerializedApprovalActor
      readonly recordedAt: string
    }
  | {
      readonly type: 'DECISION_SUPERSEDED'
      readonly target: SerializedApprovalDecisionReference
      readonly successor: SerializedApprovalDecisionReference
      readonly actor: SerializedApprovalActor
      readonly recordedAt: string
    }
  | {
      readonly type: 'REQUIREMENT_SUPERSEDED'
      readonly targetRequirementId: string
      readonly successorRequirementId: string
      readonly actor: SerializedApprovalActor
      readonly recordedAt: string
    }

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

function validateTimestamp(value: unknown): string {
  const timestamp = requiredString(value)
  if (!RFC3339_DATE_TIME_WITH_OFFSET.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new InvalidApprovalDecisionError()
  }
  return timestamp
}

function validateEvaluationTimestamp(value: unknown): string {
  const timestamp = typeof value === 'string' ? value : ''
  if (timestamp.length === 0 || !RFC3339_DATE_TIME_WITH_OFFSET.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new InvalidApprovalContextError()
  }
  return timestamp
}

function validateActor(value: unknown): SerializedApprovalActor {
  if (!isPlainRecord(value)) throw new InvalidApprovalDecisionError()
  const type = value.type
  if (type !== undefined && (typeof type !== 'string' || type.length === 0)) throw new InvalidApprovalDecisionError()
  return { id: requiredString(value.id), ...(type === undefined ? {} : { type }) }
}

function validateDecisionRef(value: unknown): SerializedApprovalDecisionReference {
  if (!isPlainRecord(value)) throw new InvalidApprovalDecisionError()
  return {
    requirementId: requiredString(value.requirementId),
    actorId: requiredString(value.actorId),
    decidedAt: validateTimestamp(value.decidedAt),
  }
}

function sameDecisionRef(left: SerializedApprovalDecisionReference, right: SerializedApprovalDecisionReference): boolean {
  return left.requirementId === right.requirementId && left.actorId === right.actorId && left.decidedAt === right.decidedAt
}

function decisionRef(decision: ApprovalDecision): SerializedApprovalDecisionReference {
  return {
    requirementId: decision.requirementId,
    actorId: decision.actor.id,
    decidedAt: decision.decidedAt,
  }
}

function validateLifecycleEvent(input: unknown): ApprovalLifecycleEvent {
  if (!isPlainRecord(input)) throw new InvalidApprovalDecisionError()
  const type = input.type
  const actor = validateActor(input.actor)
  const recordedAt = validateTimestamp(input.recordedAt)
  if (type === 'WITHDRAWN') {
    if (Object.hasOwn(input, 'successor') || Object.hasOwn(input, 'targetRequirementId') || Object.hasOwn(input, 'successorRequirementId')) {
      throw new InvalidApprovalDecisionError()
    }
    return { type, target: validateDecisionRef(input.target), actor, recordedAt }
  }
  if (type === 'DECISION_SUPERSEDED') {
    if (Object.hasOwn(input, 'targetRequirementId') || Object.hasOwn(input, 'successorRequirementId')) {
      throw new InvalidApprovalDecisionError()
    }
    const target = validateDecisionRef(input.target)
    const successor = validateDecisionRef(input.successor)
    if (sameDecisionRef(target, successor)) throw new InvalidApprovalDecisionError()
    return { type, target, successor, actor, recordedAt }
  }
  if (type === 'REQUIREMENT_SUPERSEDED') {
    if (Object.hasOwn(input, 'target') || Object.hasOwn(input, 'successor')) throw new InvalidApprovalDecisionError()
    const targetRequirementId = requiredString(input.targetRequirementId)
    const successorRequirementId = requiredString(input.successorRequirementId)
    if (targetRequirementId === successorRequirementId) throw new InvalidApprovalDecisionError()
    return { type, targetRequirementId, successorRequirementId, actor, recordedAt }
  }
  throw new InvalidApprovalDecisionError()
}

function lifecycleCandidate(input: unknown, type: SerializedApprovalLifecycleEvent['type']): unknown {
  if (!isPlainRecord(input)) throw new InvalidApprovalDecisionError()
  return { ...input, type }
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
 * FinKore Approval Decision history for append-only committed decisions and
 * lifecycle events.
 *
 * The history validates and commits Decisions by appending them. Failed record
 * attempts leave previously committed Decisions unchanged. Existing committed
 * Decisions are never overwritten or removed. Draft 0.2 lifecycle events make
 * Decisions ineffective for current evaluation without rewriting history.
 *
 * @see APPROVAL-DECISION-007
 * @see APPROVAL-VALIDITY-001
 * @see APPROVAL-VALIDITY-002
 * @see APPROVAL-ERROR-001
 * @see APPROVAL-ERROR-005
 * @see APPROVAL-ERROR-006
 */
export class ApprovalDecisionHistory {
  private readonly committedDecisions: ApprovalDecision[]
  private readonly committedLifecycleEvents: ApprovalLifecycleEvent[]

  private constructor(decisions: readonly ApprovalDecision[]) {
    this.committedDecisions = [...decisions]
    this.committedLifecycleEvents = []
  }

  /**
   * Creates an Approval Decision history from existing committed decisions.
   *
   * Existing history is structurally validated. Requirement association and
   * eligibility for new commits are checked by {@link record}.
   *
   * @param history - Existing committed decision observations, defaulting to an empty history.
   * @returns An Approval Decision history containing the supplied decisions.
   * @throws {InvalidApprovalDecisionError}
   * When any supplied decision is malformed.
   *
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-005
   * @see APPROVAL-DECISION-006
   * @see APPROVAL-DECISION-007
   */
  static create(history: readonly unknown[] | unknown = []): ApprovalDecisionHistory {
    if (Array.isArray(history)) {
      return new ApprovalDecisionHistory(history.map((decision) => ApprovalDecision.from(decision)))
    }
    if (!isPlainRecord(history) || !Array.isArray(history.history)) throw new InvalidApprovalDecisionError()
    const decisions = history.history.map((decision) => ApprovalDecision.from(decision))
    const lifecycleInput = Object.hasOwn(history, 'lifecycle') ? history.lifecycle : []
    if (!Array.isArray(lifecycleInput)) throw new InvalidApprovalDecisionError()
    const lifecycleEvents = lifecycleInput.map((event) => validateLifecycleEvent(event))
    const result = new ApprovalDecisionHistory(decisions)
    for (const event of lifecycleEvents) result.commitLifecycleEvent(event)
    return result
  }

  /**
   * Records one valid Approval Decision for a Requirement.
   *
   * The candidate is fully validated before history changes. Decisions for a
   * different Requirement and decisions by ineligible Actors are rejected before
   * commit, so failed attempts leave existing history unchanged.
   *
   * @param requirementInput - Requirement the Decision must address.
   * @param decisionInput - Candidate Approval Decision to commit.
   * @returns This history after the Decision is appended.
   * @throws {InvalidApprovalDecisionError}
   * When the decision is malformed or identifies another Requirement.
   * @throws {IneligibleApprovalActorError}
   * When the deciding Actor does not satisfy the Requirement eligibility rule.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see FINKORE_APPROVAL_INELIGIBLE_ACTOR
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-004
   * @see APPROVAL-DECISION-007
   * @see APPROVAL-ERROR-001
   * @see APPROVAL-ERROR-005
   */
  record(requirementInput: unknown, decisionInput: unknown): ApprovalDecisionHistory {
    const requirement = ApprovalRequirement.from(requirementInput)
    const decision = ApprovalDecision.forRequirement(requirement, decisionInput)
    this.committedDecisions.push(decision)
    return this
  }

  /**
   * Records a lifecycle event that withdraws one committed Decision.
   *
   * The target Decision must already exist exactly once and the withdrawal
   * Actor must be eligible for the affected Requirement. The committed Decision
   * remains observable in history; the lifecycle event only changes current
   * effectiveness.
   *
   * @param requirementInput - Requirement addressed by the target Decision.
   * @param withdrawalInput - Candidate withdrawal lifecycle event.
   * @returns This history after appending the lifecycle event.
   * @throws {InvalidApprovalDecisionError}
   * When the lifecycle event is malformed, duplicate, missing, ambiguous, or
   * targets an already ineffective Decision.
   * @throws {IneligibleApprovalActorError}
   * When the lifecycle Actor is not eligible for the Requirement.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see FINKORE_APPROVAL_INELIGIBLE_ACTOR
   * @see APPROVAL-VALIDITY-004
   * @see APPROVAL-VALIDITY-005
   * @see APPROVAL-VALIDITY-006
   * @see APPROVAL-VALIDITY-012
   */
  withdraw(requirementInput: unknown, withdrawalInput: unknown): ApprovalDecisionHistory {
    const requirement = ApprovalRequirement.from(requirementInput)
    const event = validateLifecycleEvent(lifecycleCandidate(withdrawalInput, 'WITHDRAWN')) as Extract<
      ApprovalLifecycleEvent,
      { readonly type: 'WITHDRAWN' }
    >
    if (event.target.requirementId !== requirement.id) throw new InvalidApprovalDecisionError()
    if (!requirement.isEligibleActor(event.actor.id)) throw new IneligibleApprovalActorError()
    this.assertResolvableDecision(event.target)
    if (this.isDecisionWithdrawn(event.target) || this.isDecisionSuperseded(event.target)) throw new InvalidApprovalDecisionError()
    this.committedLifecycleEvents.push(event)
    return this
  }

  /**
   * Records a lifecycle event that supersedes one committed Decision with
   * another committed Decision.
   *
   * Both target and successor Decisions must already exist exactly once. The
   * superseded Decision remains in history but no longer contributes to current
   * Requirement evaluation.
   *
   * @param supersessionInput - Candidate Decision supersession event.
   * @returns This history after appending the lifecycle event.
   * @throws {InvalidApprovalDecisionError}
   * When the event is malformed or its target/successor references are invalid.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see APPROVAL-VALIDITY-010
   * @see APPROVAL-VALIDITY-012
   */
  supersedeDecision(supersessionInput: unknown): ApprovalDecisionHistory {
    const event = validateLifecycleEvent(lifecycleCandidate(supersessionInput, 'DECISION_SUPERSEDED')) as Extract<
      ApprovalLifecycleEvent,
      { readonly type: 'DECISION_SUPERSEDED' }
    >
    this.assertResolvableDecision(event.target)
    this.assertResolvableDecision(event.successor)
    if (this.isDecisionWithdrawn(event.target) || this.isDecisionSuperseded(event.target)) throw new InvalidApprovalDecisionError()
    this.committedLifecycleEvents.push(event)
    return this
  }

  /**
   * Records a lifecycle event that supersedes one Requirement with another.
   *
   * Decisions for the superseded Requirement remain in history but no longer
   * satisfy or reject that superseded Requirement for current evaluation. They
   * do not satisfy the successor Requirement.
   *
   * @param supersessionInput - Candidate Requirement supersession event.
   * @returns This history after appending the lifecycle event.
   * @throws {InvalidApprovalDecisionError}
   * When the event is malformed or duplicates an existing Requirement
   * supersession.
   *
   * @see FINKORE_APPROVAL_INVALID_DECISION
   * @see APPROVAL-VALIDITY-011
   * @see APPROVAL-VALIDITY-012
   */
  supersedeRequirement(supersessionInput: unknown): ApprovalDecisionHistory {
    const event = validateLifecycleEvent(lifecycleCandidate(supersessionInput, 'REQUIREMENT_SUPERSEDED')) as Extract<
      ApprovalLifecycleEvent,
      { readonly type: 'REQUIREMENT_SUPERSEDED' }
    >
    if (this.isRequirementSuperseded(event.targetRequirementId)) throw new InvalidApprovalDecisionError()
    this.committedLifecycleEvents.push(event)
    return this
  }

  /**
   * Evaluates one Requirement against committed or supplied Decisions.
   *
 * Decisions associated with other Requirements are ignored. Matching Decisions
 * must be valid for the Requirement and must remain effective for the supplied
 * current facts when current facts are available. Historical Decisions whose
 * relevant subject facts no longer match are preserved but do not satisfy or
 * reject the Requirement for current evaluation. An applicable Requirement with
 * no effective Decision remains `PENDING`.
   *
   * @param requirementInput - Requirement to evaluate.
   * @param options - Optional current subject facts and relevant fact paths.
   * @returns Requirement state derived from effective associated Decisions.
   * @throws {InvalidApprovalDecisionError}
   * When a matching Decision is malformed or identifies inconsistent state.
   * @throws {IneligibleApprovalActorError}
   * When a matching Decision's Actor is not eligible for the Requirement.
   *
   * @see APPROVAL-REQUIREMENT-004
   * @see APPROVAL-REQUIREMENT-005
   * @see APPROVAL-DECISION-001
   * @see APPROVAL-DECISION-002
   * @see APPROVAL-DECISION-003
   * @see APPROVAL-DECISION-004
   * @see APPROVAL-DECISION-007
   * @see APPROVAL-ERROR-005
   */
  evaluateRequirement(
    requirementInput: unknown,
    options: {
      readonly currentSubjectFacts?: unknown
      readonly relevantFactPaths?: readonly string[]
      readonly evaluatedAt?: unknown
    } = {},
  ): ApprovalRequirementState {
    const requirement = ApprovalRequirement.from(requirementInput)
    if (this.isRequirementSuperseded(requirement.id)) return 'PENDING'
    let hasEffectiveApproval = false
    for (const decision of this.committedDecisions) {
      if (decision.requirementId !== requirement.id) continue
      const associatedDecision = ApprovalDecision.forRequirement(requirement, decision.toJSON())
      if (!this.isDecisionLifecycleEffective(associatedDecision)) continue
      if (!this.isDecisionUnexpired(associatedDecision, options.evaluatedAt)) continue
      if (
        Object.hasOwn(options, 'currentSubjectFacts') &&
        associatedDecision.evaluateEffectiveness(options.currentSubjectFacts, options.relevantFactPaths) === 'INEFFECTIVE'
      ) {
        continue
      }
      const state = requirement.stateForOutcome(associatedDecision.outcome)
      if (state === 'REJECTED') return 'REJECTED'
      hasEffectiveApproval = true
    }
    return hasEffectiveApproval ? 'APPROVED' : 'PENDING'
  }

  /**
   * Returns committed Approval Decisions as defensive portable observations.
   *
   * @returns Approval history preserving every committed Decision's meaning.
   *
   * @see APPROVAL-DECISION-007
   */
  decisions(): readonly SerializedApprovalDecision[] {
    return this.committedDecisions.map((decision) => decision.toJSON())
  }

  /**
   * Returns committed Approval lifecycle events as defensive portable observations.
   *
   * @returns Lifecycle history preserving withdrawal and supersession evidence.
   *
   * @see APPROVAL-VALIDITY-002
   * @see APPROVAL-VALIDITY-004
   * @see APPROVAL-VALIDITY-010
   * @see APPROVAL-VALIDITY-011
   */
  lifecycleEvents(): readonly SerializedApprovalLifecycleEvent[] {
    return this.committedLifecycleEvents.map((event) => cloneJsonValue(event))
  }

  /**
   * Returns the portable conformance shape for this Approval history.
   *
   * @returns An object containing the committed decision history observation.
   *
   * @see APPROVAL-DECISION-007
   */
  toJSON(): SerializedApprovalDecisionHistory {
    const history = this.decisions()
    const lifecycle = this.lifecycleEvents()
    return lifecycle.length === 0 ? { history } : { history, lifecycle }
  }

  private assertResolvableDecision(ref: SerializedApprovalDecisionReference): void {
    const matches = this.committedDecisions.filter((decision) => sameDecisionRef(decisionRef(decision), ref))
    if (matches.length !== 1) throw new InvalidApprovalDecisionError()
  }

  private isDecisionLifecycleEffective(decision: ApprovalDecision): boolean {
    const ref = decisionRef(decision)
    return !this.isDecisionWithdrawn(ref) && !this.isDecisionSuperseded(ref)
  }

  private isDecisionWithdrawn(ref: SerializedApprovalDecisionReference): boolean {
    return this.committedLifecycleEvents.some((event) => event.type === 'WITHDRAWN' && sameDecisionRef(event.target, ref))
  }

  private isDecisionSuperseded(ref: SerializedApprovalDecisionReference): boolean {
    return this.committedLifecycleEvents.some((event) => event.type === 'DECISION_SUPERSEDED' && sameDecisionRef(event.target, ref))
  }

  private isRequirementSuperseded(requirementId: string): boolean {
    return this.committedLifecycleEvents.some(
      (event) => event.type === 'REQUIREMENT_SUPERSEDED' && event.targetRequirementId === requirementId,
    )
  }

  private isDecisionUnexpired(decision: ApprovalDecision, evaluatedAt: unknown): boolean {
    if (decision.expiresAt === undefined) return true
    const evaluatedAtTimestamp = validateEvaluationTimestamp(evaluatedAt)
    return Date.parse(evaluatedAtTimestamp) < Date.parse(decision.expiresAt)
  }

  private commitLifecycleEvent(event: ApprovalLifecycleEvent): void {
    switch (event.type) {
      case 'WITHDRAWN':
        this.assertResolvableDecision(event.target)
        if (this.isDecisionWithdrawn(event.target) || this.isDecisionSuperseded(event.target)) throw new InvalidApprovalDecisionError()
        this.committedLifecycleEvents.push(event)
        return
      case 'DECISION_SUPERSEDED':
        this.assertResolvableDecision(event.target)
        this.assertResolvableDecision(event.successor)
        if (this.isDecisionWithdrawn(event.target) || this.isDecisionSuperseded(event.target)) throw new InvalidApprovalDecisionError()
        this.committedLifecycleEvents.push(event)
        return
      case 'REQUIREMENT_SUPERSEDED':
        if (this.isRequirementSuperseded(event.targetRequirementId)) throw new InvalidApprovalDecisionError()
        this.committedLifecycleEvents.push(event)
    }
  }
}
