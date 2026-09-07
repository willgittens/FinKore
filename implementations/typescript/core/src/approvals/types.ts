/**
 * Stable identifier for an Approval Requirement within its approval context.
 *
 * The TypeScript implementation treats requirement identifiers as caller-supplied,
 * opaque domain values. It does not infer priority, ordering, actor eligibility,
 * or time from the identifier's characters.
 *
 * @see APPROVAL-REQUIREMENT-001
 */
export type ApprovalRequirementIdentifier = string

/**
 * Stable identifier for the subject whose approval is requested.
 *
 * @see APPROVAL-REQUIREMENT-002
 */
export type ApprovalSubjectIdentifier = string

/**
 * Domain type of the subject whose approval is requested.
 *
 * @see APPROVAL-REQUIREMENT-002
 */
export type ApprovalSubjectType = string

/**
 * Stable identifier for a deciding Actor.
 *
 * Eligibility evaluation is domain behavior and remains separate from technical
 * permission to submit a request.
 *
 * @see APPROVAL-REQUIREMENT-003
 * @see APPROVAL-REQUIREMENT-006
 * @see APPROVAL-DECISION-001
 */
export type ApprovalActorIdentifier = string

/**
 * Optional Actor type supplied by a composing domain or application.
 *
 * FinKore Draft 0.1 does not define a closed actor-type catalog.
 *
 * @see APPROVAL-DECISION-001
 */
export type ApprovalActorType = string

/**
 * Portable outcome of a committed Approval Decision.
 *
 * `PENDING` is intentionally excluded because it is a Requirement state, not a
 * Decision outcome.
 *
 * @see APPROVAL-DECISION-005
 */
export type ApprovalDecisionOutcome = 'APPROVED' | 'REJECTED'

/**
 * Portable state of an Approval Requirement under Draft 0.1 evaluation.
 *
 * @see APPROVAL-REQUIREMENT-004
 * @see APPROVAL-REQUIREMENT-005
 */
export type ApprovalRequirementState = 'APPROVED' | 'REJECTED' | 'PENDING'

/**
 * Effectiveness observation for an Approval Decision against current facts.
 *
 * @see APPROVAL-DECISION-002
 * @see APPROVAL-DECISION-003
 */
export type ApprovalDecisionEffectiveness = 'EFFECTIVE' | 'INEFFECTIVE'

/**
 * Stable identifier for an Approval Condition.
 *
 * @see APPROVAL-CONDITION-001
 */
export type ApprovalConditionIdentifier = string

/**
 * Domain fact path named by an Approval Condition.
 *
 * Fact paths are opaque composing-domain identifiers in this milestone; they
 * are not a portable expression or query language.
 *
 * @see APPROVAL-CONDITION-001
 */
export type ApprovalConditionFactPath = string

/**
 * Explicit result supplied by the composing domain at the condition boundary.
 *
 * FinKore Draft 0.1 does not define a portable expression language. The
 * TypeScript core validates condition/fact completeness and preserves the
 * boundary result without interpreting a condition expression.
 *
 * @see APPROVAL-CONDITION-002
 */
export type ApprovalConditionEvaluationResult = 'APPLICABLE' | 'NOT_APPLICABLE'

/**
 * Portable FinKore Approval error code.
 *
 * Consumers that need cross-language semantics should rely on these codes
 * rather than TypeScript-specific error class names or messages.
 *
 * @see SPEC-ERROR-001
 * @see SPEC-ERROR-002
 */
export type ApprovalErrorCode =
  | 'FINKORE_APPROVAL_REQUIRED'
  | 'FINKORE_APPROVAL_INVALID_DECISION'
  | 'FINKORE_APPROVAL_INELIGIBLE_ACTOR'
  | 'FINKORE_APPROVAL_INVALID_CHAIN'
  | 'FINKORE_APPROVAL_CONDITION_UNRESOLVED'

/**
 * Serialized reference to the subject whose approval is requested.
 *
 * @see APPROVAL-REQUIREMENT-002
 */
export interface SerializedApprovalSubject {
  /** Stable subject type within the composing domain. */
  readonly type: ApprovalSubjectType

  /** Stable subject identifier within the relevant subject scope. */
  readonly id: ApprovalSubjectIdentifier
}

/**
 * Serialized deciding Actor attribution for an Approval Decision.
 *
 * FinKore Draft 0.1 does not define authentication, authorization, RBAC,
 * delegation, or identity-provider binding.
 *
 * @see APPROVAL-DECISION-001
 */
export interface SerializedApprovalActor {
  /** Stable actor identifier. */
  readonly id: ApprovalActorIdentifier

  /** Optional actor type, such as a user, service, system, or integration. */
  readonly type?: ApprovalActorType
}

/**
 * Serialized Approval Requirement accepted by the TypeScript Approval core.
 *
 * Requirement identity, subject, eligibility, and satisfying/rejecting outcomes
 * are supplied explicitly. This implementation does not generate identifiers or
 * resolve dynamic actors.
 *
 * @see APPROVAL-REQUIREMENT-001
 * @see APPROVAL-REQUIREMENT-002
 * @see APPROVAL-REQUIREMENT-003
 * @see APPROVAL-REQUIREMENT-004
 */
export interface SerializedApprovalRequirement {
  /** Stable requirement identity within an approval context. */
  readonly id: ApprovalRequirementIdentifier

  /** Subject whose approval is requested. */
  readonly subject: SerializedApprovalSubject

  /** Actor identities eligible to decide this requirement in this milestone. */
  readonly eligibleActors: readonly ApprovalActorIdentifier[]

  /** Decision outcome that satisfies this requirement. */
  readonly approvedOutcome: ApprovalDecisionOutcome

  /** Decision outcome that rejects this requirement. */
  readonly rejectedOutcome: ApprovalDecisionOutcome
}

/**
 * Serialized Approval Decision accepted by the TypeScript Approval core.
 *
 * Decision timestamp and subject facts are supplied explicitly. Draft 0.1 does
 * not prescribe decision identity, reasons, comments, signatures, audit
 * metadata, or persistence identifiers.
 *
 * @see APPROVAL-DECISION-001
 * @see APPROVAL-DECISION-002
 * @see APPROVAL-DECISION-006
 */
export interface SerializedApprovalDecision {
  /** Requirement identity this decision addresses. */
  readonly requirementId: ApprovalRequirementIdentifier

  /** Subject facts or state against which the decision was made. */
  readonly subjectFacts: unknown

  /** Effective approval or rejection outcome. */
  readonly outcome: ApprovalDecisionOutcome

  /** Actor attributable for the decision. */
  readonly actor: SerializedApprovalActor

  /** RFC 3339 date-time with an explicit numeric UTC offset or Z. */
  readonly decidedAt: string
}

/**
 * Portable observation of one logical Approval Decision history.
 *
 * @see APPROVAL-DECISION-007
 * @see APPROVAL-ERROR-005
 */
export interface SerializedApprovalDecisionHistory {
  /** Committed Approval Decisions in this logical history's append observation. */
  readonly history: readonly SerializedApprovalDecision[]
}

/**
 * Serialized Approval Condition accepted by the TypeScript Approval core.
 *
 * The `evaluation` member identifies the composing-domain evaluation ownership
 * or model exactly as supplied. It is preserved, not interpreted.
 *
 * @see APPROVAL-CONDITION-001
 * @see APPROVAL-CONDITION-004
 */
export interface SerializedApprovalCondition {
  /** Stable condition identity. */
  readonly id: ApprovalConditionIdentifier

  /** Facts required before a composing-domain evaluation result can be accepted. */
  readonly requiredFacts: readonly ApprovalConditionFactPath[]

  /** Evaluation ownership or model identifier supplied by the composing domain. */
  readonly evaluation: string
}
