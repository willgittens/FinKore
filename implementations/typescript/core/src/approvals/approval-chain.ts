import { ApprovalConditionUnresolvedError, InvalidApprovalChainError } from './errors.js'
import type {
  ApprovalChainEvaluation,
  ApprovalChainMode,
  ApprovalChainRequirementStates,
  ApprovalChainState,
  ApprovalRequirementIdentifier,
  ApprovalRequirementState,
  SerializedApprovalChain,
} from './types.js'

type ChainRequirementEvaluationState = ApprovalRequirementState | 'NOT_APPLICABLE'

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateMode(value: unknown): ApprovalChainMode {
  if (value !== 'SEQUENTIAL' && value !== 'UNORDERED') throw new InvalidApprovalChainError()
  return value
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidApprovalChainError()
  return value
}

function validateRequirements(value: unknown): readonly ApprovalRequirementIdentifier[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalChainError()
  const requirements = value.map(requiredString)
  if (new Set(requirements).size !== requirements.length) throw new InvalidApprovalChainError()
  return requirements
}

function validateRejectionOutcome(value: unknown): 'REJECTED' {
  if (value !== 'REJECTED') throw new InvalidApprovalChainError()
  return value
}

function validateRequirementState(value: unknown): ChainRequirementEvaluationState {
  if (value === 'APPROVED' || value === 'REJECTED' || value === 'PENDING' || value === 'NOT_APPLICABLE') return value
  if (value === 'UNRESOLVED') throw new ApprovalConditionUnresolvedError()
  throw new InvalidApprovalChainError()
}

/**
 * FinKore Approval Chain for Draft 0.1 all-required composition semantics.
 *
 * A Chain contains one or more declared Approval Requirement identities,
 * declares whether the Requirements are sequential or unordered, and declares
 * the rejection outcome used when an effective rejection determines the chain
 * result. Requirement identities must not repeat within a chain. Chain identity
 * is intentionally absent in Draft 0.1; Decisions bind to Requirements and
 * relevant subject facts rather than to a Chain identifier. This class does not
 * implement quorum, parallel voting groups, delegation, withdrawal,
 * supersession, escalation, dynamic approver resolution, authorization,
 * persistence, audit integration, or workflow integration.
 *
 * @see APPROVAL-CHAIN-001
 * @see APPROVAL-CHAIN-002
 * @see APPROVAL-CHAIN-003
 * @see APPROVAL-CHAIN-004
 * @see APPROVAL-CHAIN-005
 * @see APPROVAL-CHAIN-006
 * @see APPROVAL-CHAIN-007
 * @see APPROVAL-CHAIN-008
 */
export class ApprovalChain {
  private readonly value: SerializedApprovalChain

  private constructor(value: SerializedApprovalChain) {
    this.value = value
  }

  /**
   * Creates and validates an Approval Chain from a portable candidate.
   *
 * The declared Requirement order is preserved exactly. Chain identity is not
 * generated because Draft 0.1 does not define a chain identity field. Duplicate
 * Requirement identities are rejected instead of deduplicated.
   *
   * @param input - Candidate serialized Approval Chain.
   * @returns A validated Approval Chain value.
   * @throws {InvalidApprovalChainError}
   * When the chain is missing Requirements, sequencing mode, or rejection
   * outcome.
   *
   * @see FINKORE_APPROVAL_INVALID_CHAIN
   * @see APPROVAL-CHAIN-001
   * @see APPROVAL-CHAIN-002
   * @see APPROVAL-CHAIN-007
   * @see APPROVAL-CHAIN-009
   */
  static from(input: unknown): ApprovalChain {
    if (!isPlainRecord(input)) throw new InvalidApprovalChainError()
    return new ApprovalChain({
      mode: validateMode(input.mode),
      requirements: validateRequirements(input.requirements),
      rejectionOutcome: validateRejectionOutcome(input.rejectionOutcome),
    })
  }

  /**
   * Declared composition mode for this Chain.
   *
   * @see APPROVAL-CHAIN-002
   */
  get mode(): ApprovalChainMode {
    return this.value.mode
  }

  /**
   * Requirement identities in declared chain order.
   *
   * @see APPROVAL-CHAIN-001
   * @see APPROVAL-CHAIN-004
   */
  get requirements(): readonly ApprovalRequirementIdentifier[] {
    return [...this.value.requirements]
  }

  /**
   * Evaluates the Chain from applicable Requirement states.
   *
   * `NOT_APPLICABLE` Requirements are excluded from the all-required outcome.
   * A `REJECTED` Requirement returns the Chain's declared rejection outcome.
   * Sequential chains expose only the first pending applicable Requirement as
   * currently actionable; unordered chains expose only the aggregate state.
   *
   * @param statesInput - Current states keyed by Requirement identity.
   * @returns The observable chain state, with active Requirement identity for a
   * pending sequential chain.
   * @throws {InvalidApprovalChainError}
   * When state input is malformed or omits a declared Requirement.
   * @throws {ApprovalConditionUnresolvedError}
   * When a Requirement's applicability is explicitly unresolved.
   *
   * @see FINKORE_APPROVAL_INVALID_CHAIN
   * @see FINKORE_APPROVAL_CONDITION_UNRESOLVED
   * @see APPROVAL-CHAIN-003
   * @see APPROVAL-CHAIN-004
   * @see APPROVAL-CHAIN-005
   * @see APPROVAL-CHAIN-006
   * @see APPROVAL-CHAIN-007
   * @see APPROVAL-CONDITION-006
   */
  evaluate(statesInput: unknown): ApprovalChainEvaluation {
    const states = this.validateStates(statesInput)
    if (this.value.mode === 'SEQUENTIAL') return this.evaluateSequential(states)
    return this.evaluateUnordered(states)
  }

  /**
   * Returns portable Approval Chain serialization.
   *
   * The returned value is a defensive copy. Mutating it cannot modify this
   * Chain or reorder its Requirements.
   *
   * @returns Serialized Approval Chain content.
   *
   * @see APPROVAL-CHAIN-001
   * @see APPROVAL-CHAIN-002
   */
  toJSON(): SerializedApprovalChain {
    return structuredClone(this.value)
  }

  private validateStates(statesInput: unknown): ApprovalChainRequirementStates {
    if (!isPlainRecord(statesInput)) throw new InvalidApprovalChainError()
    const states: Record<ApprovalRequirementIdentifier, ChainRequirementEvaluationState> = {}
    for (const requirementId of this.value.requirements) {
      states[requirementId] = validateRequirementState(statesInput[requirementId])
    }
    return states
  }

  private evaluateUnordered(states: ApprovalChainRequirementStates): ApprovalChainState {
    let hasPending = false
    for (const requirementId of this.value.requirements) {
      const state = states[requirementId]
      if (state === 'REJECTED') return this.value.rejectionOutcome
      if (state === 'PENDING') hasPending = true
    }
    return hasPending ? 'PENDING' : 'APPROVED'
  }

  private evaluateSequential(states: ApprovalChainRequirementStates): ApprovalChainEvaluation {
    for (const requirementId of this.value.requirements) {
      const state = states[requirementId]
      if (state === 'REJECTED') return this.value.rejectionOutcome
      if (state === 'PENDING') return { state: 'PENDING', activeRequirements: [requirementId] }
    }
    return 'APPROVED'
  }
}
