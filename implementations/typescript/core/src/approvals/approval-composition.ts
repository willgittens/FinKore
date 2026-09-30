// SPDX-License-Identifier: MPL-2.0
import { arrayValues } from '../array-values.js'
import { copyApprovalValue } from './approval-value.js'
import { parsePortableTimestamp } from '../portable-timestamp.js'
import { ApprovalConditionUnresolvedError, InvalidApprovalChainError, InvalidApprovalContextError } from './errors.js'
import type {
  ApprovalActorIdentifier,
  ApprovalDecisionOutcome,
  ApprovalCompositionEvaluation,
  ApprovalCompositionEvaluationInput,
  ApprovalCompositionGroupIdentifier,
  ApprovalCompositionGroupKind,
  ApprovalCompositionMemberIdentifier,
  ApprovalCompositionOutcome,
  ApprovalCompositionRequirementApplicability,
  ApprovalRequirementIdentifier,
  ApprovalRequirementState,
  SerializedApprovalActor,
  SerializedApprovalComposition,
  SerializedApprovalCompositionDecisionObservation,
  SerializedApprovalCompositionGroup,
  SerializedApprovalCompositionMember,
  SerializedApprovalCompositionStage,
} from './types.js'

const MAX_GROUP_DEPTH = 4

type SerializedApprovalCompositionRequirementMember = Extract<
  SerializedApprovalCompositionMember,
  { readonly type: 'requirement' }
>

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidApprovalChainError()
  return value
}
function validateGroupKind(value: unknown): ApprovalCompositionGroupKind {
  if (value === 'ALL_OF' || value === 'ANY_OF' || value === 'N_OF_M') return value
  throw new InvalidApprovalChainError()
}

function validateActor(value: unknown): SerializedApprovalActor {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  const actor: { id: ApprovalActorIdentifier; type?: string } = { id: requiredString(value.id) }
  if (value.type !== undefined) actor.type = requiredString(value.type)
  return actor
}

function validateRequirementMember(
  value: Readonly<Record<string, unknown>>,
  allowVoter: boolean,
): SerializedApprovalCompositionRequirementMember {
  const member: {
    type: 'requirement'
    id: ApprovalCompositionMemberIdentifier
    requirementId: ApprovalRequirementIdentifier
    voter?: SerializedApprovalActor
  } = {
    type: 'requirement',
    id: requiredString(value.id),
    requirementId: requiredString(value.requirementId),
  }
  if (value.voter !== undefined) {
    if (!allowVoter) throw new InvalidApprovalChainError()
    member.voter = validateActor(value.voter)
  }
  return member
}

function validateGroupMember(value: Readonly<Record<string, unknown>>): SerializedApprovalCompositionMember {
  if (value.voter !== undefined) throw new InvalidApprovalChainError()
  return {
    type: 'group',
    id: requiredString(value.id),
    groupId: requiredString(value.groupId),
  }
}

function validateNonQuorumMember(value: unknown): SerializedApprovalCompositionMember {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  if (value.type === 'requirement') return validateRequirementMember(value, false)
  if (value.type === 'group') return validateGroupMember(value)
  throw new InvalidApprovalChainError()
}

function validateQuorumMember(value: unknown): SerializedApprovalCompositionRequirementMember {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  if (value.type !== 'requirement') throw new InvalidApprovalChainError()
  return validateRequirementMember(value, true)
}

function assertUniqueMemberIds(members: readonly SerializedApprovalCompositionMember[]): void {
  const memberIds = members.map((member) => member.id)
  if (new Set(memberIds).size !== memberIds.length) throw new InvalidApprovalChainError()
}

function validateMembers(value: unknown, groupKind: ApprovalCompositionGroupKind): readonly SerializedApprovalCompositionMember[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalChainError()
  if (groupKind !== 'N_OF_M') {
    const members = Array.from(arrayValues(value), validateNonQuorumMember)
    assertUniqueMemberIds(members)
    return members
  }

  const members = Array.from(arrayValues(value), validateQuorumMember)
  assertUniqueMemberIds(members)
  const voterIds: string[] = []
  for (const member of members) {
    if (member.voter === undefined) throw new InvalidApprovalChainError()
    voterIds.push(member.voter.id)
  }
  if (new Set(voterIds).size !== voterIds.length) throw new InvalidApprovalChainError()
  return members
}

function validateThreshold(value: unknown, memberCount: number): number {
  if (!Number.isInteger(value)) throw new InvalidApprovalChainError()
  const threshold = value as number
  if (threshold < 1 || threshold > memberCount) throw new InvalidApprovalChainError()
  return threshold
}

function validateGroup(value: unknown): SerializedApprovalCompositionGroup {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  const kind = validateGroupKind(value.kind)
  const members = validateMembers(value.members, kind)
  const base = {
    id: requiredString(value.id),
    kind,
    members,
  }
  if (kind !== 'N_OF_M') {
    if (value.threshold !== undefined) throw new InvalidApprovalChainError()
    return base
  }
  return {
    ...base,
    threshold: validateThreshold(value.threshold, members.length),
  }
}

function validateGroups(value: unknown): readonly SerializedApprovalCompositionGroup[] {
  if (!Array.isArray(value)) throw new InvalidApprovalChainError()
  const groups = Array.from(arrayValues(value), validateGroup)
  const groupIds = groups.map((group) => group.id)
  if (new Set(groupIds).size !== groupIds.length) throw new InvalidApprovalChainError()
  return groups
}

function validateStage(value: unknown): SerializedApprovalCompositionStage {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  if (!Array.isArray(value.groups) || value.groups.length === 0) throw new InvalidApprovalChainError()
  const groups = Array.from(arrayValues(value.groups), requiredString)
  return {
    id: requiredString(value.id),
    groups,
  }
}

function validateStages(value: unknown): readonly SerializedApprovalCompositionStage[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalChainError()
  const stages = Array.from(arrayValues(value), validateStage)
  const stageIds = stages.map((stage) => stage.id)
  if (new Set(stageIds).size !== stageIds.length) throw new InvalidApprovalChainError()
  return stages
}

function assertReferencesAndBounded(
  groups: readonly SerializedApprovalCompositionGroup[],
  rootIds: readonly ApprovalCompositionGroupIdentifier[],
): void {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

  // Remove incoming edges across the entire declaration graph. This checks
  // disconnected components without treating them as evaluation/depth roots.
  const incoming = new Map(groups.map((group) => [group.id, 0]))
  for (const group of groups) {
    for (const member of group.members) {
      if (member.type !== 'group') continue
      const count = incoming.get(member.groupId)
      if (count === undefined) throw new InvalidApprovalChainError()
      incoming.set(member.groupId, count + 1)
    }
  }
  const pending = groups.filter((group) => incoming.get(group.id) === 0)
  let visited = 0
  while (pending.length > 0) {
    const group = pending.pop()!
    visited += 1
    for (const member of group.members) {
      if (member.type !== 'group') continue
      const count = incoming.get(member.groupId)! - 1
      incoming.set(member.groupId, count)
      if (count === 0) pending.push(groupsById.get(member.groupId)!)
    }
  }
  if (visited !== groups.length) throw new InvalidApprovalChainError()

  const visit = (groupId: ApprovalCompositionGroupIdentifier, depth: number): void => {
    if (depth > MAX_GROUP_DEPTH) throw new InvalidApprovalChainError()
    const group = groupsById.get(groupId)
    if (group === undefined) throw new InvalidApprovalChainError()
    for (const member of group.members) {
      if (member.type === 'group') visit(member.groupId, depth + 1)
    }
  }

  for (const groupId of rootIds) visit(groupId, 1)
}


type CompositionRequirementObservation = {
  readonly applicability: Exclude<ApprovalCompositionRequirementApplicability, 'UNRESOLVED'>
  readonly state: ApprovalRequirementState | undefined
  readonly eligibleActors: readonly ApprovalActorIdentifier[] | undefined
  readonly approvedOutcome: ApprovalDecisionOutcome | undefined
  readonly rejectedOutcome: ApprovalDecisionOutcome | undefined
}

type QuorumRequirementObservation = CompositionRequirementObservation & {
  readonly applicability: 'APPLICABLE'
  readonly eligibleActors: readonly ApprovalActorIdentifier[]
  readonly approvedOutcome: ApprovalDecisionOutcome
  readonly rejectedOutcome: ApprovalDecisionOutcome
}

type ApplicableGroupEvaluation =
  | { readonly applicable: true; readonly outcome: Exclude<ApprovalCompositionOutcome, 'PENDING'> }
  | {
      readonly applicable: true
      readonly outcome: 'PENDING'
      readonly actionableRequirements: readonly ApprovalRequirementIdentifier[]
    }

type GroupEvaluation = { readonly applicable: false } | ApplicableGroupEvaluation

function validateApplicability(value: unknown): Exclude<ApprovalCompositionRequirementApplicability, 'UNRESOLVED'> {
  if (value === 'APPLICABLE' || value === 'NOT_APPLICABLE') return value
  throw new ApprovalConditionUnresolvedError()
}

function validateRequirementState(value: unknown): ApprovalRequirementState {
  if (value === 'APPROVED' || value === 'REJECTED' || value === 'PENDING') return value
  throw new InvalidApprovalChainError()
}

function validateDecisionOutcome(value: unknown): ApprovalDecisionOutcome {
  if (value === 'APPROVED' || value === 'REJECTED') return value
  throw new InvalidApprovalChainError()
}

function validateEligibleActors(value: unknown): readonly ApprovalActorIdentifier[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new InvalidApprovalChainError()
  return Array.from(arrayValues(value), requiredString)
}

function validateDecisionObservation(value: unknown): SerializedApprovalCompositionDecisionObservation {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  copyApprovalValue(value, 'chain')
  if (typeof value.effective !== 'boolean') throw new InvalidApprovalChainError()
  return {
    requirementId: requiredString(value.requirementId),
    actor: validateActor(value.actor),
    outcome: validateDecisionOutcome(value.outcome),
    effective: value.effective,
  }
}

function validateDecisionObservations(value: unknown): readonly SerializedApprovalCompositionDecisionObservation[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidApprovalChainError()
  return Array.from(arrayValues(value), validateDecisionObservation)
}

function hasValidEvaluationContext(value: unknown): boolean {
  if (!isPlainRecord(value) || typeof value.evaluatedAt !== 'string') return false
  try {
    parsePortableTimestamp(value.evaluatedAt)
    return true
  } catch {
    return false
  }
}

function uniqueInOrder(values: readonly ApprovalRequirementIdentifier[]): readonly ApprovalRequirementIdentifier[] {
  const seen = new Set<ApprovalRequirementIdentifier>()
  const result: ApprovalRequirementIdentifier[] = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}


function isApplicableEvaluation(value: GroupEvaluation): value is ApplicableGroupEvaluation {
  return value.applicable === true
}


function isOpenStage(value: GroupEvaluation): value is ApplicableGroupEvaluation {
  return value.applicable === true && value.outcome !== 'APPROVED'
}

function pendingActionables(values: readonly ApplicableGroupEvaluation[]): readonly ApprovalRequirementIdentifier[] {
  return uniqueInOrder(
    values.flatMap((value) => value.outcome === 'PENDING' ? value.actionableRequirements : []),
  )
}

function collectRequirementIds(groups: readonly SerializedApprovalCompositionGroup[]): readonly ApprovalRequirementIdentifier[] {
  const ids: ApprovalRequirementIdentifier[] = []
  for (const group of groups) {
    for (const member of group.members) {
      if (member.type === 'requirement') ids.push(member.requirementId)
    }
  }
  return uniqueInOrder(ids)
}

function collectStateRequirementIds(groups: readonly SerializedApprovalCompositionGroup[]): readonly ApprovalRequirementIdentifier[] {
  const ids: ApprovalRequirementIdentifier[] = []
  for (const group of groups) {
    if (group.kind === 'N_OF_M') continue
    for (const member of group.members) {
      if (member.type === 'requirement') ids.push(member.requirementId)
    }
  }
  return uniqueInOrder(ids)
}

function validateEvaluationInput(
  input: unknown,
  requiredRequirementIds: readonly ApprovalRequirementIdentifier[],
  stateRequirementIds: readonly ApprovalRequirementIdentifier[],
): ReadonlyMap<ApprovalRequirementIdentifier, CompositionRequirementObservation> {
  if (!isPlainRecord(input) || !Array.isArray(input.requirements)) throw new InvalidApprovalChainError()
  const rawById = new Map<ApprovalRequirementIdentifier, Readonly<Record<string, unknown>>>()
  for (const raw of arrayValues(input.requirements)) {
    if (!isPlainRecord(raw)) throw new InvalidApprovalChainError()
    const id = requiredString(raw.id)
    if (rawById.has(id)) throw new InvalidApprovalChainError()
    rawById.set(id, raw)
    if (raw.requiresEvaluationContext !== undefined && typeof raw.requiresEvaluationContext !== 'boolean') {
      throw new InvalidApprovalChainError()
    }
  }

  for (const requirementId of requiredRequirementIds) {
    if (!rawById.has(requirementId)) throw new InvalidApprovalChainError()
  }
  for (const requirementId of requiredRequirementIds) {
    validateApplicability(rawById.get(requirementId)!.applicability)
  }
  for (const requirementId of requiredRequirementIds) {
    const raw = rawById.get(requirementId)!
    if (raw.applicability === 'APPLICABLE' && raw.requiresEvaluationContext === true && !hasValidEvaluationContext(input.context)) {
      throw new InvalidApprovalContextError()
    }
  }

  copyApprovalValue(input.requirements, 'chain')
  const stateRequirementSet = new Set(stateRequirementIds)
  const observations = new Map<ApprovalRequirementIdentifier, CompositionRequirementObservation>()
  for (const requirementId of requiredRequirementIds) {
    const raw = rawById.get(requirementId)!
    const applicability = validateApplicability(raw.applicability)
    const state = raw.state === undefined ? undefined : validateRequirementState(raw.state)
    if (applicability === 'APPLICABLE' && stateRequirementSet.has(requirementId) && state === undefined) {
      throw new InvalidApprovalChainError()
    }

    const eligibleActors = validateEligibleActors(raw.eligibleActors)
    const approvedOutcome = raw.approvedOutcome === undefined ? undefined : validateDecisionOutcome(raw.approvedOutcome)
    const rejectedOutcome = raw.rejectedOutcome === undefined ? undefined : validateDecisionOutcome(raw.rejectedOutcome)
    if (approvedOutcome !== undefined && rejectedOutcome !== undefined && approvedOutcome === rejectedOutcome) {
      throw new InvalidApprovalChainError()
    }

    observations.set(requirementId, {
      applicability,
      state,
      eligibleActors,
      approvedOutcome,
      rejectedOutcome,
    })
  }
  return observations
}

/**
 * FinKore Approval Composition definition for Core 0.9 release candidate bounded groups.
 *
 * A Composition declares exactly one standalone root Approval Group or a
 * nonempty ordered list of Approval Stages. Groups have stable identities,
 * supported group kinds, nonempty member lists, no duplicate member identifiers,
 * no cycles, and a maximum root-to-child group depth of four. Quorum groups
 * require a fixed positive threshold over distinct declared voting members.
 *
 * This class validates Composition definitions and evaluates `ALL_OF`, `ANY_OF`,
 * and `N_OF_M` groups from explicit current Requirement and Decision
 * observations. Native evidence is checked against the supported Approval value
 * profile after applicability and required context, using INVALID_CHAIN for
 * unsupported values (APPROVAL-FACT-004). Decision-history effectiveness derivation, authorization,
 * dynamic approvers, callbacks, history mutation, and adapter normalization
 * remain outside this class's current scope.
 *
 * @remarks Declaration and evidence collections validate every indexed position;
 * sparse arrays are malformed. Caller-defined iteration and Array methods cannot
 * alter declaration or eligibility evidence.
 *
 * @see APPROVAL-COMPOSITION-001
 * @see APPROVAL-COMPOSITION-002
 * @see APPROVAL-COMPOSITION-003
 * @see APPROVAL-COMPOSITION-004
 * @see APPROVAL-COMPOSITION-005
 * @see APPROVAL-COMPOSITION-006
 * @see APPROVAL-COMPOSITION-007
 * @see APPROVAL-QUORUM-001
 * @see APPROVAL-QUORUM-007
 * @see APPROVAL-QUORUM-008
 */
export class ApprovalComposition {
  private readonly value: SerializedApprovalComposition

  private constructor(value: SerializedApprovalComposition) {
    this.value = value
  }

  /**
   * Creates and validates an Approval Composition definition.
   *
   * The declared group, stage, and member order is preserved exactly. Invalid
   * structure uses the portable `FINKORE_APPROVAL_INVALID_CHAIN` category.
   *
   * @param input - Candidate serialized Approval Composition.
   * @returns A validated Approval Composition definition.
   * @throws {InvalidApprovalChainError}
   * When composition structure, references, depth, or quorum declarations are
   * invalid.
   *
   * @see FINKORE_APPROVAL_INVALID_CHAIN
   * @see APPROVAL-ERROR-008
   */
  static from(input: unknown): ApprovalComposition {
    if (!isPlainRecord(input)) throw new InvalidApprovalChainError()
    const hasRootGroup = input.rootGroup !== undefined
    const hasStages = input.stages !== undefined
    if (hasRootGroup === hasStages) throw new InvalidApprovalChainError()

    const groups = validateGroups(input.groups)
    const rootGroup = hasRootGroup ? requiredString(input.rootGroup) : undefined
    const stages = hasStages ? validateStages(input.stages) : undefined

    assertReferencesAndBounded(groups, rootGroup === undefined ? stages!.flatMap((stage) => stage.groups) : [rootGroup])

    if (stages === undefined) {
      return new ApprovalComposition({ rootGroup: rootGroup!, groups })
    }
    return new ApprovalComposition({ stages, groups })
  }

  /**
   * Standalone root Group identity, when this is not a staged composition.
   *
   * @see APPROVAL-COMPOSITION-001
   */
  get rootGroup(): ApprovalCompositionGroupIdentifier | undefined {
    return this.value.rootGroup
  }

  /**
   * Ordered Approval Stages, when this is a staged composition.
   *
   * The returned value is a defensive copy. Mutating it cannot change this
   * Composition.
   *
   * @see APPROVAL-COMPOSITION-001
   * @see APPROVAL-COMPOSITION-016
   */
  get stages(): readonly SerializedApprovalCompositionStage[] | undefined {
    return structuredClone(this.value.stages)
  }

  /**
   * Declared Approval Groups in definition order.
   *
   * The returned value is a defensive copy. Mutating it cannot change this
   * Composition or its nested member declarations.
   *
   * @see APPROVAL-COMPOSITION-002
   * @see APPROVAL-COMPOSITION-008
   */
  get groups(): readonly SerializedApprovalCompositionGroup[] {
    return structuredClone(this.value.groups)
  }


  /**
   * Evaluates this Composition from explicit current Requirement and Decision
   * observations.
   *
   * Evaluation validates every referenced Requirement observation before
   * returning an outcome, including disconnected groups, alternative branches,
   * and later stages. Applicable quorum members require explicit eligibility
   * and distinct outcome mappings; inapplicable members need no vote evidence.
   * Quorum members are counted only from currently effective eligible Decision
   * observations matching the declared voter and referenced Requirement.
   *
   * @param input - Explicit current Requirement and Decision observations plus evaluation context.
   * @returns Aggregate Composition outcome and current pending actionable Requirements.
   * @throws {InvalidApprovalChainError}
   * When state/effectiveness evidence is missing, malformed, or contradictory.
   * @throws {ApprovalConditionUnresolvedError}
   * When a referenced Requirement has unresolved applicability.
   * @throws {InvalidApprovalContextError}
   * When required current-effectiveness context is missing or malformed.
   *
   * @see FINKORE_APPROVAL_INVALID_CHAIN
   * @see FINKORE_APPROVAL_CONDITION_UNRESOLVED
   * @see FINKORE_APPROVAL_INVALID_CONTEXT
   * @see APPROVAL-COMPOSITION-008
   * @see APPROVAL-COMPOSITION-009
   * @see APPROVAL-COMPOSITION-010
   * @see APPROVAL-COMPOSITION-011
   * @see APPROVAL-COMPOSITION-013
   * @see APPROVAL-COMPOSITION-014
   * @see APPROVAL-COMPOSITION-016
   * @see APPROVAL-COMPOSITION-017
   * @see APPROVAL-COMPOSITION-018
   * @see APPROVAL-COMPOSITION-019
   * @see APPROVAL-COMPOSITION-022
   * @see APPROVAL-COMPOSITION-023
   * @see APPROVAL-COMPOSITION-024
   * @see APPROVAL-QUORUM-002
   * @see APPROVAL-QUORUM-003
   * @see APPROVAL-QUORUM-004
   * @see APPROVAL-QUORUM-005
   * @see APPROVAL-QUORUM-006
   * @see APPROVAL-QUORUM-009
   * @see APPROVAL-QUORUM-010
   */
  evaluate(input: ApprovalCompositionEvaluationInput): ApprovalCompositionEvaluation {
    const groupsById = new Map(this.value.groups.map((group) => [group.id, group]))
    const observations = validateEvaluationInput(
      input,
      collectRequirementIds(this.value.groups),
      collectStateRequirementIds(this.value.groups),
    )
    const decisions = validateDecisionObservations(input.decisions)

    const requireQuorumObservation = (
      observation: CompositionRequirementObservation,
    ): QuorumRequirementObservation => {
      if (observation.eligibleActors === undefined) throw new InvalidApprovalChainError()
      if (observation.approvedOutcome === undefined) throw new InvalidApprovalChainError()
      if (observation.rejectedOutcome === undefined) throw new InvalidApprovalChainError()
      return {
        applicability: 'APPLICABLE',
        state: observation.state,
        eligibleActors: observation.eligibleActors,
        approvedOutcome: observation.approvedOutcome,
        rejectedOutcome: observation.rejectedOutcome,
      }
    }

    const evaluateQuorumMember = (member: SerializedApprovalCompositionRequirementMember): ApprovalRequirementState => {
      const quorumObservation = requireQuorumObservation(observations.get(member.requirementId)!)
      const voter = member.voter!

      let hasApproval = false
      let hasRejection = false
      for (const decision of decisions) {
        if (!decision.effective) continue
        if (decision.requirementId !== member.requirementId) continue
        if (decision.actor.id !== voter.id) continue
        if (!quorumObservation.eligibleActors.includes(decision.actor.id)) continue

        if (decision.outcome === quorumObservation.approvedOutcome) hasApproval = true
        if (decision.outcome === quorumObservation.rejectedOutcome) hasRejection = true
      }

      if (hasApproval && hasRejection) throw new InvalidApprovalChainError()
      if (hasApproval) return 'APPROVED'
      if (hasRejection) return 'REJECTED'
      return 'PENDING'
    }

    // Unused declarations must be valid but never contribute actionability.
    for (const group of this.value.groups) {
      if (group.kind !== 'N_OF_M') continue
      for (const member of group.members as readonly SerializedApprovalCompositionRequirementMember[]) {
        if (observations.get(member.requirementId)!.applicability === 'APPLICABLE') evaluateQuorumMember(member)
      }
    }

    const evaluateQuorumGroup = (group: SerializedApprovalCompositionGroup): GroupEvaluation => {
      let hasApplicableMember = false
      let approvals = 0
      const pendingRequirements: ApprovalRequirementIdentifier[] = []
      const members = group.members as readonly SerializedApprovalCompositionRequirementMember[]

      for (const member of members) {
        const observation = observations.get(member.requirementId)!
        if (observation.applicability === 'NOT_APPLICABLE') continue

        hasApplicableMember = true
        const state = evaluateQuorumMember(member)
        if (state === 'APPROVED') approvals += 1
        if (state === 'PENDING') pendingRequirements.push(member.requirementId)
      }

      if (!hasApplicableMember) return { applicable: false }
      if (approvals >= group.threshold!) return { applicable: true, outcome: 'APPROVED' }
      if (approvals + pendingRequirements.length < group.threshold!) return { applicable: true, outcome: 'REJECTED' }
      return { applicable: true, outcome: 'PENDING', actionableRequirements: uniqueInOrder(pendingRequirements) }
    }

    const evaluateMember = (member: SerializedApprovalCompositionMember): GroupEvaluation => {
      if (member.type === 'requirement') {
        const observation = observations.get(member.requirementId)!
        if (observation.applicability === 'NOT_APPLICABLE') return { applicable: false }
        const outcome = observation.state!
        if (outcome === 'PENDING') {
          return { applicable: true, outcome, actionableRequirements: [member.requirementId] }
        }
        return { applicable: true, outcome }
      }
      return evaluateGroup(member.groupId)
    }

    const evaluateGroup = (groupId: ApprovalCompositionGroupIdentifier): GroupEvaluation => {
      const group = groupsById.get(groupId)!
      if (group.kind === 'N_OF_M') return evaluateQuorumGroup(group)
      const applicableMembers = group.members.map(evaluateMember).filter(isApplicableEvaluation)
      if (applicableMembers.length === 0) return { applicable: false }

      if (group.kind === 'ALL_OF') {
        if (applicableMembers.some((member) => member.outcome === 'REJECTED')) {
          return { applicable: true, outcome: 'REJECTED' }
        }
        if (applicableMembers.some((member) => member.outcome === 'PENDING')) {
          return { applicable: true, outcome: 'PENDING', actionableRequirements: pendingActionables(applicableMembers) }
        }
        return { applicable: true, outcome: 'APPROVED' }
      }

      if (applicableMembers.some((member) => member.outcome === 'APPROVED')) {
        return { applicable: true, outcome: 'APPROVED' }
      }
      if (applicableMembers.every((member) => member.outcome === 'REJECTED')) {
        return { applicable: true, outcome: 'REJECTED' }
      }
      return { applicable: true, outcome: 'PENDING', actionableRequirements: pendingActionables(applicableMembers) }
    }

    const evaluateStage = (stage: SerializedApprovalCompositionStage): GroupEvaluation => {
      const groups = stage.groups.map(evaluateGroup).filter(isApplicableEvaluation)
      if (groups.length === 0) return { applicable: false }
      if (groups.some((group) => group.outcome === 'REJECTED')) {
        return { applicable: true, outcome: 'REJECTED' }
      }
      if (groups.some((group) => group.outcome === 'PENDING')) {
        return { applicable: true, outcome: 'PENDING', actionableRequirements: pendingActionables(groups) }
      }
      return { applicable: true, outcome: 'APPROVED' }
    }

    if (this.value.rootGroup !== undefined) {
      const root = evaluateGroup(this.value.rootGroup)
      if (root.applicable === false) return { outcome: 'APPROVED', actionableRequirements: [] }
      return {
        outcome: root.outcome,
        actionableRequirements: root.outcome === 'PENDING' ? root.actionableRequirements : [],
      }
    }

    const stages = this.value.stages!.map(evaluateStage)
    const firstOpenStage = stages.find(isOpenStage)
    if (firstOpenStage === undefined) return { outcome: 'APPROVED', actionableRequirements: [] }
    return {
      outcome: firstOpenStage.outcome,
      actionableRequirements: firstOpenStage.outcome === 'PENDING' ? firstOpenStage.actionableRequirements : [],
    }
  }

  /**
   * Returns portable Approval Composition serialization.
   *
   * The returned value is a defensive copy preserving declared stage, group,
   * member, and voter order.
   *
   * @returns Serialized Approval Composition content.
   *
   * @see APPROVAL-COMPOSITION-008
   */
  toJSON(): SerializedApprovalComposition {
    return structuredClone(this.value)
  }
}
