// SPDX-License-Identifier: MPL-2.0
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
 * Portable Approval Chain outcome currently defined by Draft 0.1.
 *
 * `APPROVED` means every applicable Requirement is approved. `PENDING` means at
 * least one applicable Requirement remains pending and no effective rejection
 * determines the outcome. `REJECTED` is used when the chain's declared
 * rejection outcome applies.
 *
 * @see APPROVAL-CHAIN-005
 * @see APPROVAL-CHAIN-006
 * @see APPROVAL-CHAIN-007
 */
export type ApprovalChainState = 'APPROVED' | 'REJECTED' | 'PENDING'

/**
 * Approval Chain composition mode.
 *
 * Sequential chains preserve declared Requirement order and expose only the
 * first unsatisfied applicable Requirement as currently active. Unordered
 * chains do not imply sequence.
 *
 * @see APPROVAL-CHAIN-002
 * @see APPROVAL-CHAIN-003
 * @see APPROVAL-CHAIN-004
 */
export type ApprovalChainMode = 'SEQUENTIAL' | 'UNORDERED'

/**
 * Effectiveness observation for an Approval Decision against current facts.
 *
 * @see APPROVAL-DECISION-002
 * @see APPROVAL-DECISION-003
 */
export type ApprovalDecisionEffectiveness = 'EFFECTIVE' | 'INEFFECTIVE'

/**
 * Lifecycle event kind that changes current effectiveness without rewriting
 * committed Approval Decisions.
 *
 * @see APPROVAL-VALIDITY-004
 * @see APPROVAL-VALIDITY-010
 * @see APPROVAL-VALIDITY-011
 */
export type ApprovalLifecycleEventType = 'WITHDRAWN' | 'DECISION_SUPERSEDED' | 'REQUIREMENT_SUPERSEDED'

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
 * Explicit applicability observation for a Requirement member during Approval
 * Composition evaluation.
 *
 * @see APPROVAL-COMPOSITION-009
 * @see APPROVAL-COMPOSITION-011
 */
export type ApprovalCompositionRequirementApplicability = 'APPLICABLE' | 'NOT_APPLICABLE' | 'UNRESOLVED'

/**
 * Portable Approval Composition outcome.
 *
 * @see APPROVAL-COMPOSITION-013
 * @see APPROVAL-COMPOSITION-014
 * @see APPROVAL-COMPOSITION-018
 */
export type ApprovalCompositionOutcome = 'APPROVED' | 'REJECTED' | 'PENDING'

/**
 * Requirement state evidence supplied to Approval Composition evaluation.
 *
 * This is an explicit current observation. The Composition evaluator does not
 * derive it from ambient state or external fact lookup.
 *
 * @see APPROVAL-COMPOSITION-008
 * @see APPROVAL-COMPOSITION-010
 */
export interface SerializedApprovalCompositionRequirementObservation {
  /** Referenced Approval Requirement identity. */
  readonly id: ApprovalRequirementIdentifier

  /** Explicit applicability result for the Requirement member. */
  readonly applicability: ApprovalCompositionRequirementApplicability

  /** Current state for applicable Requirement members. */
  readonly state?: ApprovalRequirementState

  /** Actor identities eligible to satisfy or reject a quorum member. */
  readonly eligibleActors?: readonly ApprovalActorIdentifier[]

  /** Decision outcome that satisfies this Requirement for quorum evidence. */
  readonly approvedOutcome?: ApprovalDecisionOutcome

  /** Decision outcome that rejects this Requirement for quorum evidence. */
  readonly rejectedOutcome?: ApprovalDecisionOutcome

  /** Whether current-effectiveness semantics require an explicit evaluation context. */
  readonly requiresEvaluationContext?: boolean
}

/**
 * Current-effective Decision observation supplied to Approval Composition quorum
 * evaluation.
 *
 * The observation is already reduced by Draft 0.2 effectiveness rules; this
 * type does not define lifecycle derivation or mutate committed history.
 *
 * @see APPROVAL-COMPOSITION-008
 * @see APPROVAL-COMPOSITION-021
 * @see APPROVAL-QUORUM-002
 * @see APPROVAL-QUORUM-004
 */
export interface SerializedApprovalCompositionDecisionObservation {
  /** Optional external Decision identity preserved by callers and vectors. */
  readonly id?: string

  /** Requirement identity this Decision observation addresses. */
  readonly requirementId: ApprovalRequirementIdentifier

  /** Actor attributable for the Decision observation. */
  readonly actor: SerializedApprovalActor

  /** Observed Decision outcome. */
  readonly outcome: ApprovalDecisionOutcome

  /** Whether this Decision is currently effective for the supplied context. */
  readonly effective: boolean
}

/**
 * Evaluation input for the Draft 0.3 Approval Composition model.
 *
 * @see APPROVAL-COMPOSITION-008
 * @see APPROVAL-COMPOSITION-024
 */
export interface ApprovalCompositionEvaluationInput {
  /** Current observations for referenced Requirements. */
  readonly requirements: readonly SerializedApprovalCompositionRequirementObservation[]

  /** Current-effective Decision observations for quorum member evaluation. */
  readonly decisions?: readonly SerializedApprovalCompositionDecisionObservation[]

  /** Explicit evaluation context, such as an evaluation instant when required. */
  readonly context?: Readonly<Record<string, unknown>>
}

/**
 * Observable Approval Composition evaluation result.
 *
 * @see APPROVAL-COMPOSITION-018
 * @see APPROVAL-COMPOSITION-019
 */
export interface ApprovalCompositionEvaluation {
  /** Aggregate Composition outcome. */
  readonly outcome: ApprovalCompositionOutcome

  /** Pending applicable Requirement identities currently actionable. */
  readonly actionableRequirements: readonly ApprovalRequirementIdentifier[]
}

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
  | 'FINKORE_APPROVAL_INVALID_CONTEXT'

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

  /**
   * Optional RFC 3339 date-time at which this Decision expires.
   *
   * A Decision is no longer effective when the explicit evaluation instant is
   * equal to or later than this instant.
   *
   * @see APPROVAL-VALIDITY-007
   * @see APPROVAL-VALIDITY-009
   */
  readonly expiresAt?: string
}

/**
 * Stable structural reference to one committed Approval Decision.
 *
 * Draft 0.2 lifecycle events use the Requirement, deciding Actor, and decision
 * timestamp to identify a historical Decision without adding generated identity
 * to the Decision model. A lifecycle operation must resolve the reference to
 * exactly one committed Decision.
 *
 * @see APPROVAL-VALIDITY-005
 * @see APPROVAL-VALIDITY-010
 */
export interface SerializedApprovalDecisionReference {
  /** Requirement identity addressed by the target Decision. */
  readonly requirementId: ApprovalRequirementIdentifier

  /** Actor identity attributed to the target Decision. */
  readonly actorId: ApprovalActorIdentifier

  /** Decision timestamp of the target Decision. */
  readonly decidedAt: string
}

/**
 * Serialized lifecycle event that changes Approval current effectiveness.
 *
 * Lifecycle events are append-only observations. They do not remove committed
 * Decisions and do not define authorization, delegation, or RBAC.
 *
 * @see APPROVAL-VALIDITY-002
 * @see APPROVAL-VALIDITY-004
 * @see APPROVAL-VALIDITY-010
 * @see APPROVAL-VALIDITY-011
 */
export interface SerializedApprovalLifecycleEvent {
  /** Lifecycle relationship kind. */
  readonly type: ApprovalLifecycleEventType

  /** Target Decision for withdrawal or Decision supersession. */
  readonly target?: SerializedApprovalDecisionReference

  /** Successor Decision for Decision supersession. */
  readonly successor?: SerializedApprovalDecisionReference

  /** Superseded Requirement identity for Requirement supersession. */
  readonly targetRequirementId?: ApprovalRequirementIdentifier

  /** Successor Requirement identity for Requirement supersession. */
  readonly successorRequirementId?: ApprovalRequirementIdentifier

  /** Actor attributed to recording the lifecycle event. */
  readonly actor: SerializedApprovalActor

  /** RFC 3339 date-time when the lifecycle event was recorded. */
  readonly recordedAt: string
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

  /** Committed lifecycle events that affect current effectiveness. */
  readonly lifecycle?: readonly SerializedApprovalLifecycleEvent[]
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


/**
 * Stable identifier for an Approval Composition Group.
 *
 * Group identifiers are unique only within one Approval Composition definition.
 *
 * @see APPROVAL-COMPOSITION-002
 */
export type ApprovalCompositionGroupIdentifier = string

/**
 * Stable identifier for one member within an Approval Group.
 *
 * Member identifiers must not repeat within the containing group.
 *
 * @see APPROVAL-COMPOSITION-005
 */
export type ApprovalCompositionMemberIdentifier = string

/**
 * Stable identifier for an ordered Approval Stage.
 *
 * Stage identity is scoped to one Approval Composition definition.
 *
 * @see APPROVAL-COMPOSITION-001
 */
export type ApprovalCompositionStageIdentifier = string

/**
 * Supported Draft 0.3 Approval Group kind.
 *
 * @see APPROVAL-COMPOSITION-003
 */
export type ApprovalCompositionGroupKind = "ALL_OF" | "ANY_OF" | "N_OF_M"

/**
 * Serialized member reference in an Approval Group.
 *
 * Requirement members reference an Approval Requirement identity. Group members
 * reference a child Approval Group identity. Quorum groups accept only
 * requirement members with an explicit voter Actor.
 *
 * @see APPROVAL-COMPOSITION-004
 * @see APPROVAL-QUORUM-007
 */
export type SerializedApprovalCompositionMember =
  | {
      /** Member kind for a Requirement reference. */
      readonly type: "requirement"

      /** Stable member identifier unique within the containing Group. */
      readonly id: ApprovalCompositionMemberIdentifier

      /** Referenced Approval Requirement identity. */
      readonly requirementId: ApprovalRequirementIdentifier

      /** Explicit voter Actor for quorum members. */
      readonly voter?: SerializedApprovalActor
    }
  | {
      /** Member kind for a child Group reference. */
      readonly type: "group"

      /** Stable member identifier unique within the containing Group. */
      readonly id: ApprovalCompositionMemberIdentifier

      /** Referenced child Approval Group identity. */
      readonly groupId: ApprovalCompositionGroupIdentifier
    }

/**
 * Serialized Approval Group accepted by the TypeScript Approval core.
 *
 * Groups are bounded composition nodes. Threshold is required only for N_OF_M
 * groups and is validated against declared voting members before applicability
 * is evaluated.
 *
 * @see APPROVAL-COMPOSITION-002
 * @see APPROVAL-COMPOSITION-003
 * @see APPROVAL-COMPOSITION-004
 * @see APPROVAL-QUORUM-001
 */
export interface SerializedApprovalCompositionGroup {
  /** Stable group identity unique within one Composition. */
  readonly id: ApprovalCompositionGroupIdentifier

  /** Declared group-combination kind. */
  readonly kind: ApprovalCompositionGroupKind

  /** Nonempty member declarations in deterministic evaluation order. */
  readonly members: readonly SerializedApprovalCompositionMember[]

  /** Positive fixed quorum threshold for N_OF_M groups. */
  readonly threshold?: number
}

/**
 * Serialized ordered Approval Stage.
 *
 * Stages sequence root group references. Stage containers are not counted as
 * group nesting levels.
 *
 * @see APPROVAL-COMPOSITION-001
 * @see APPROVAL-COMPOSITION-007
 * @see APPROVAL-COMPOSITION-016
 */
export interface SerializedApprovalCompositionStage {
  /** Stable stage identity within the Composition. */
  readonly id: ApprovalCompositionStageIdentifier

  /** Nonempty root group references for this stage, in declared order. */
  readonly groups: readonly ApprovalCompositionGroupIdentifier[]
}

/**
 * Serialized Approval Composition accepted by the TypeScript Approval core.
 *
 * Exactly one of rootGroup or stages must be present. The Composition definition
 * does not itself contain Approval Decisions or runtime state.
 *
 * @see APPROVAL-COMPOSITION-001
 * @see APPROVAL-COMPOSITION-008
 */
export interface SerializedApprovalComposition {
  /** Standalone root group identity for non-staged compositions. */
  readonly rootGroup?: ApprovalCompositionGroupIdentifier

  /** Ordered stage list for staged compositions. */
  readonly stages?: readonly SerializedApprovalCompositionStage[]

  /** Declared groups available to the root or stage references. */
  readonly groups: readonly SerializedApprovalCompositionGroup[]
}

/**
 * Serialized Approval Chain accepted by the TypeScript Approval core.
 *
 * Chain identity is not part of the current Draft 0.1 portable chain model.
 * Requirement references are caller-supplied stable Requirement identifiers,
 * their declared order is preserved exactly, and duplicates are invalid.
 *
 * @see APPROVAL-CHAIN-001
 * @see APPROVAL-CHAIN-002
 * @see APPROVAL-CHAIN-007
 * @see APPROVAL-CHAIN-009
 */
export interface SerializedApprovalChain {
  /** Declares whether Requirements are evaluated sequentially or unordered. */
  readonly mode: ApprovalChainMode

  /** One or more Requirement identities in declared chain order. */
  readonly requirements: readonly ApprovalRequirementIdentifier[]

  /** Chain outcome to report when an effective rejection determines the result. */
  readonly rejectionOutcome: 'REJECTED'
}

/**
 * Current states for Requirements referenced by an Approval Chain.
 *
 * Only applicable Approval Requirements contribute to a chain's outcome. A
 * `NOT_APPLICABLE` entry represents a condition-bound Requirement that the
 * composing domain has explicitly evaluated as not applicable.
 *
 * @see APPROVAL-CONDITION-002
 * @see APPROVAL-CONDITION-006
 */
export type ApprovalChainRequirementStates = Readonly<
  Record<ApprovalRequirementIdentifier, ApprovalRequirementState | 'NOT_APPLICABLE'>
>

/**
 * Observable Approval Chain evaluation result.
 *
 * Sequential pending chains include the currently actionable Requirement
 * identity. Approved and rejected outcomes are returned as the portable state
 * value because no Requirement is then currently actionable.
 *
 * @see APPROVAL-CHAIN-004
 * @see APPROVAL-CHAIN-005
 * @see APPROVAL-CHAIN-006
 */
export type ApprovalChainEvaluation =
  | ApprovalChainState
  | {
      readonly state: 'PENDING'
      readonly activeRequirements: readonly ApprovalRequirementIdentifier[]
    }
