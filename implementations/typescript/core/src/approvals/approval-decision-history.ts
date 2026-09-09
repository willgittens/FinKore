import { ApprovalDecision } from './approval-decision.js'
import { ApprovalRequirement } from './approval-requirement.js'
import { InvalidApprovalDecisionError } from './errors.js'
import type {
  ApprovalRequirementState,
  SerializedApprovalDecision,
  SerializedApprovalDecisionHistory,
} from './types.js'

/**
 * FinKore Approval Decision history for append-only committed decisions.
 *
 * The history validates and commits Decisions by appending them. Failed record
 * attempts leave previously committed Decisions unchanged. Existing committed
 * Decisions are never overwritten or removed by this milestone.
 *
 * @see APPROVAL-DECISION-007
 * @see APPROVAL-ERROR-001
 * @see APPROVAL-ERROR-005
 */
export class ApprovalDecisionHistory {
  private readonly committedDecisions: ApprovalDecision[]

  private constructor(decisions: readonly ApprovalDecision[]) {
    this.committedDecisions = [...decisions]
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
  static create(history: readonly unknown[] = []): ApprovalDecisionHistory {
    if (!Array.isArray(history)) throw new InvalidApprovalDecisionError()
    return new ApprovalDecisionHistory(history.map((decision) => ApprovalDecision.from(decision)))
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
    } = {},
  ): ApprovalRequirementState {
    const requirement = ApprovalRequirement.from(requirementInput)
    let hasEffectiveApproval = false
    for (const decision of this.committedDecisions) {
      if (decision.requirementId !== requirement.id) continue
      const associatedDecision = ApprovalDecision.forRequirement(requirement, decision.toJSON())
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
   * Returns the portable conformance shape for this Approval history.
   *
   * @returns An object containing the committed decision history observation.
   *
   * @see APPROVAL-DECISION-007
   */
  toJSON(): SerializedApprovalDecisionHistory {
    return { history: this.decisions() }
  }
}
