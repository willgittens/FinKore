// SPDX-License-Identifier: MPL-2.0
import { InvalidApprovalChainError } from './errors.js'
import type {
  ApprovalActorIdentifier,
  ApprovalCompositionGroupIdentifier,
  ApprovalCompositionGroupKind,
  ApprovalCompositionMemberIdentifier,
  ApprovalRequirementIdentifier,
  SerializedApprovalActor,
  SerializedApprovalComposition,
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
    const members = value.map(validateNonQuorumMember)
    assertUniqueMemberIds(members)
    return members
  }

  const members = value.map(validateQuorumMember)
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
  const groups = value.map(validateGroup)
  const groupIds = groups.map((group) => group.id)
  if (new Set(groupIds).size !== groupIds.length) throw new InvalidApprovalChainError()
  return groups
}

function validateStage(value: unknown): SerializedApprovalCompositionStage {
  if (!isPlainRecord(value)) throw new InvalidApprovalChainError()
  if (!Array.isArray(value.groups) || value.groups.length === 0) throw new InvalidApprovalChainError()
  const groups = value.groups.map(requiredString)
  return {
    id: requiredString(value.id),
    groups,
  }
}

function validateStages(value: unknown): readonly SerializedApprovalCompositionStage[] {
  if (!Array.isArray(value) || value.length === 0) throw new InvalidApprovalChainError()
  const stages = value.map(validateStage)
  const stageIds = stages.map((stage) => stage.id)
  if (new Set(stageIds).size !== stageIds.length) throw new InvalidApprovalChainError()
  return stages
}

function assertReferencesAndBounded(
  groups: readonly SerializedApprovalCompositionGroup[],
  rootIds: readonly ApprovalCompositionGroupIdentifier[],
): void {
  const groupsById = new Map(groups.map((group) => [group.id, group]))

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

/**
 * FinKore Approval Composition definition for Draft 0.3 bounded groups.
 *
 * A Composition declares exactly one standalone root Approval Group or a
 * nonempty ordered list of Approval Stages. Groups have stable identities,
 * supported group kinds, nonempty member lists, no duplicate member identifiers,
 * no cycles, and a maximum root-to-child group depth of four. Quorum groups
 * require a fixed positive threshold over distinct declared voting members.
 *
 * This class validates and preserves the Composition definition only. It does
 * not evaluate approval outcomes, count Decisions, authorize Actors, resolve
 * dynamic approvers, execute callbacks, mutate history, or implement adapter
 * normalization.
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
