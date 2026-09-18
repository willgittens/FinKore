// SPDX-License-Identifier: MPL-2.0
import { AuditLog } from '../audit/audit-log.js'
import { InvalidEntityIdentityError, InvalidEntityMutationError, EntityStateConflictError } from './errors.js'
import type {
  EntityEvolutionAuditEvidenceInput,
  EntityEvolutionKind,
  EntityEvolutionRelationIdentifier,
  EntityEvolutionResult,
  EntityRelatedEvolutionRequest,
  EntityRevisionReference,
  EntitySupersessionRequest,
  EntityVoidRequest,
  FinancialEntityLike,
  SerializedEntityEvolutionHistory,
  SerializedEntityEvolutionRelation,
} from './types.js'
import type { AuditRelationshipType, SerializedAuditEvent } from '../audit/types.js'

const AUDIT_RELATIONSHIP_BY_KIND = {
  CORRECTION: 'CORRECTS',
  REVERSAL: 'REVERSES',
  VOID: 'VOIDS',
  SUPERSESSION: 'SUPERSEDES',
} as const satisfies Readonly<Record<EntityEvolutionKind, AuditRelationshipType>>

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneJsonValue<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    throw new InvalidEntityMutationError('Entity evolution observations must be portable structured data')
  }
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw new InvalidEntityIdentityError()
  return value
}

function optionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') throw new InvalidEntityMutationError()
  return value
}

function assertExpected(value: unknown, expected: unknown): void {
  if (expected !== undefined && value !== expected) throw new EntityStateConflictError()
}

function entityObservation(entity: FinancialEntityLike): ReturnType<FinancialEntityLike['toJSON']> {
  return entity.toJSON()
}

function entityReference(entity: FinancialEntityLike, revisionInput: unknown): EntityRevisionReference {
  const observed = entityObservation(entity)
  const revision = requiredString(revisionInput)
  if (revision === observed.id) throw new InvalidEntityIdentityError()
  return { type: observed.type, id: observed.id, revision }
}

function relationId(value: unknown, source: EntityRevisionReference, related?: EntityRevisionReference): EntityEvolutionRelationIdentifier {
  const id = requiredString(value)
  if (id === source.id || id === source.revision || id === related?.id || id === related?.revision) {
    throw new InvalidEntityIdentityError()
  }
  return id
}

function validateReference(input: unknown): EntityRevisionReference {
  if (!isPlainRecord(input)) throw new InvalidEntityIdentityError()
  const reference = {
    type: requiredString(input.type),
    id: requiredString(input.id),
    revision: requiredString(input.revision),
  }
  if (reference.revision === reference.id) throw new InvalidEntityIdentityError()
  return reference
}

function validateRelation(input: unknown): SerializedEntityEvolutionRelation {
  if (!isPlainRecord(input)) throw new InvalidEntityMutationError()
  const kind = validateKind(input.kind)
  const source = validateReference(input.source)
  const related = input.related === undefined ? undefined : validateReference(input.related)
  if ((kind === 'VOID') !== (related === undefined)) throw new InvalidEntityMutationError()
  const supersessionScope = input.supersessionScope === undefined ? undefined : requiredString(input.supersessionScope)
  if ((kind === 'SUPERSESSION') !== (supersessionScope !== undefined)) throw new InvalidEntityMutationError()
  const sourceCurrent = optionalBoolean(input.sourceCurrent)
  const relatedCurrent = optionalBoolean(input.relatedCurrent)
  if (sourceCurrent === undefined) throw new InvalidEntityMutationError()
  if (related === undefined && relatedCurrent !== undefined) throw new InvalidEntityMutationError()
  if (related !== undefined && relatedCurrent === undefined) throw new InvalidEntityMutationError()
  return {
    relationId: relationId(input.relationId, source, related),
    kind,
    source,
    ...(related === undefined ? {} : { related }),
    ...(supersessionScope === undefined ? {} : { supersessionScope }),
    sourceCurrent,
    ...(relatedCurrent === undefined ? {} : { relatedCurrent }),
    auditEventId: requiredString(input.auditEventId),
  }
}

function validateKind(value: unknown): EntityEvolutionKind {
  switch (value) {
    case 'CORRECTION':
    case 'REVERSAL':
    case 'VOID':
    case 'SUPERSESSION':
      return value
    default:
      throw new InvalidEntityMutationError()
  }
}

function sameReference(left: EntityRevisionReference, right: EntityRevisionReference): boolean {
  return left.type === right.type && left.id === right.id && left.revision === right.revision
}

function currentKey(reference: EntityRevisionReference, supersessionScope?: string): string {
  return `${supersessionScope ?? ''}\u0000${reference.type}\u0000${reference.id}\u0000${reference.revision}`
}

function auditEventId(event: SerializedAuditEvent): string {
  return event.eventId
}

function validateAuditEvidence(
  evidence: EntityEvolutionAuditEvidenceInput,
  kind: EntityEvolutionKind,
  relationIdentifier: EntityEvolutionRelationIdentifier,
  source: EntityRevisionReference,
  related: EntityRevisionReference | undefined,
  supersessionScope: string | undefined,
): { readonly log: AuditLog; readonly event: SerializedAuditEvent } {
  if (!isPlainRecord(evidence)) throw new InvalidEntityMutationError()
  const eventCandidate = evidence.event
  if (!isPlainRecord(eventCandidate)) throw new InvalidEntityMutationError()
  const metadata = isPlainRecord(eventCandidate.metadata) ? eventCandidate.metadata.entityEvolution : undefined
  if (!isPlainRecord(metadata)) throw new InvalidEntityMutationError()
  if (
    metadata.kind !== kind ||
    metadata.relationId !== relationIdentifier ||
    !sameReference(validateReference(metadata.source), source)
  ) {
    throw new InvalidEntityMutationError()
  }
  if (related === undefined) {
    if (metadata.related !== undefined) throw new InvalidEntityMutationError()
  } else if (!sameReference(validateReference(metadata.related), related)) {
    throw new InvalidEntityMutationError()
  }
  if (supersessionScope === undefined) {
    if (metadata.supersessionScope !== undefined) throw new InvalidEntityMutationError()
  } else if (metadata.supersessionScope !== supersessionScope) {
    throw new InvalidEntityMutationError()
  }

  const relationships = eventCandidate.relationships
  if (!Array.isArray(relationships)) throw new InvalidEntityMutationError()
  if (!relationships.some((relationship) => isPlainRecord(relationship) && relationship.type === AUDIT_RELATIONSHIP_BY_KIND[kind])) {
    throw new InvalidEntityMutationError()
  }

  const log = AuditLog.create(evidence.history)
  log.append(eventCandidate)
  const appended = log.events().at(-1)
  if (appended === undefined) throw new InvalidEntityMutationError()
  if (appended.entity.type !== source.type || appended.entity.id !== source.id) throw new InvalidEntityMutationError()
  return { log, event: appended }
}

/**
 * Immutable Core 0.8 Entity Evolution history.
 *
 * The history records correction, reversal, void, and supersession relations
 * without rewriting source Entity identity or financial facts. Every successful
 * operation validates caller-supplied revision/relation identity, composing
 * domain eligibility, optional expected-state/revision/currentness
 * preconditions, and required Audit evidence before returning a new history.
 * Failed operations leave this history, source/related Entity observations, and
 * supplied Audit history unchanged.
 *
 * @see ENTITY-EVOLUTION-001
 * @see ENTITY-EVOLUTION-003
 * @see ENTITY-EVOLUTION-004
 * @see ENTITY-EVOLUTION-022
 * @see ENTITY-EVOLUTION-023
 * @see ENTITY-EVOLUTION-029
 * @see ENTITY-EVOLUTION-033
 */
export class EntityEvolutionHistory {
  private readonly relations: readonly SerializedEntityEvolutionRelation[]
  private readonly relationIds: ReadonlySet<string>
  private readonly nonCurrent: ReadonlySet<string>
  private readonly reversedSources: ReadonlySet<string>

  private constructor(relations: readonly SerializedEntityEvolutionRelation[]) {
    this.relations = relations
    this.relationIds = new Set(relations.map((relation) => relation.relationId))
    this.nonCurrent = new Set(
      relations.flatMap((relation) => {
        if (relation.sourceCurrent) return []
        return [currentKey(relation.source, relation.supersessionScope)]
      }),
    )
    this.reversedSources = new Set(relations.filter((relation) => relation.kind === 'REVERSAL').map((relation) => currentKey(relation.source)))
  }

  /**
   * Creates an Entity Evolution history from existing relation observations.
   *
   * Imported relations must have valid opaque identities and no duplicate
   * relation identifiers. This method does not infer missing identifiers or
   * construct Entity state from audit history.
   *
   * @param relations - Existing relation observations, defaulting to none.
   * @returns An immutable Entity Evolution history.
   * @throws {InvalidEntityMutationError}
   * When a relation shape or kind is malformed.
   * @throws {InvalidEntityIdentityError}
   * When an identity is missing, malformed, or conflicting.
   *
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see ENTITY-EVOLUTION-002
   * @see ENTITY-EVOLUTION-003
   * @see ENTITY-EVOLUTION-014
   */
  static create(relations: readonly unknown[] = []): EntityEvolutionHistory {
    if (!Array.isArray(relations)) throw new InvalidEntityMutationError()
    const validated = relations.map(validateRelation)
    const ids = new Set<string>()
    for (const relation of validated) {
      if (ids.has(relation.relationId)) throw new InvalidEntityMutationError()
      ids.add(relation.relationId)
    }
    return new EntityEvolutionHistory(cloneJsonValue(validated))
  }

  /**
   * Records a Correction relation and required Audit evidence.
   *
   * The source Entity observation remains unchanged. The related Entity carries
   * corrected facts supplied by the composing domain. This method does not
   * compute diffs, authorize correction, or edit source data in place.
   *
   * @param request - Correction request and required Audit evidence.
   * @returns Successful correction result with new evolution and Audit history.
   * @throws {InvalidEntityMutationError}
   * When the request is malformed, unsupported, ineligible, duplicate, or lacks
   * required safe Audit evidence.
   * @throws {EntityStateConflictError}
   * When expected state, revision, or currentness does not match.
   * @throws {InvalidEntityIdentityError}
   * When source, related, revision, or relation identity is invalid.
   *
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see FINKORE_ENTITY_STATE_CONFLICT
   * @see FINKORE_ENTITY_INVALID_IDENTITY
   * @see ENTITY-EVOLUTION-008
   * @see ENTITY-EVOLUTION-009
   * @see ENTITY-EVOLUTION-010
   * @see ENTITY-EVOLUTION-015
   */
  correct(request: EntityRelatedEvolutionRequest): EntityEvolutionResult {
    return this.recordRelated('CORRECTION', request)
  }

  /**
   * Records a Reversal relation and required Audit evidence.
   *
   * The reversing related Entity is supplied by the composing domain. This
   * method rejects a second reversal for the same source Revision under the
   * current duplicate-reversal policy and never negates source facts in place.
   *
   * @param request - Reversal request and required Audit evidence.
   * @returns Successful reversal result with new evolution and Audit history.
   * @throws {InvalidEntityMutationError}
   * When the request is malformed, unsupported, ineligible, duplicate, or lacks
   * required safe Audit evidence.
   *
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see ENTITY-EVOLUTION-011
   * @see ENTITY-EVOLUTION-012
   * @see ENTITY-EVOLUTION-014
   */
  reverse(request: EntityRelatedEvolutionRequest): EntityEvolutionResult {
    return this.recordRelated('REVERSAL', request)
  }

  /**
   * Records a Void relation and required Audit evidence.
   *
   * Void marks the source Revision non-current for the composing-domain
   * purpose without deleting the source Entity, removing financial facts, or
   * erasing prior evolution or Audit evidence.
   *
   * @param request - Void request and required Audit evidence.
   * @returns Successful void result with new evolution and Audit history.
   * @throws {InvalidEntityMutationError}
   * When the request is malformed, unsupported, ineligible, duplicate, or lacks
   * required safe Audit evidence.
   *
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see ENTITY-EVOLUTION-016
   * @see ENTITY-EVOLUTION-017
   * @see ENTITY-EVOLUTION-018
   */
  void(request: EntityVoidRequest): EntityEvolutionResult {
    const source = entityReference(request.source, request.sourceRevision)
    this.assertRequestPreconditions(request, source)
    const identifier = relationId(request.relationId, source)
    this.assertNewRelation(identifier)
    const evidence = validateAuditEvidence(request.audit, 'VOID', identifier, source, undefined, undefined)
    const relation: SerializedEntityEvolutionRelation = {
      relationId: identifier,
      kind: 'VOID',
      source,
      sourceCurrent: false,
      auditEventId: auditEventId(evidence.event),
    }
    return this.resultFor(request.source, undefined, relation, evidence)
  }

  /**
   * Records a Supersession relation and required Audit evidence.
   *
   * The source and successor identities are preserved. Within the declared
   * supersession scope, the source Revision is no longer current and the
   * successor Revision is current after success.
   *
   * @param request - Supersession request and required Audit evidence.
   * @returns Successful supersession result with new evolution and Audit history.
   * @throws {InvalidEntityMutationError}
   * When the request is malformed, unsupported, ineligible, duplicate, or lacks
   * required safe Audit evidence.
   *
   * @see FINKORE_ENTITY_INVALID_MUTATION
   * @see ENTITY-EVOLUTION-019
   * @see ENTITY-EVOLUTION-020
   * @see ENTITY-EVOLUTION-021
   */
  supersede(request: EntitySupersessionRequest): EntityEvolutionResult {
    const source = entityReference(request.source, request.sourceRevision)
    const related = entityReference(request.successor, request.successorRevision)
    const supersessionScope = requiredString(request.supersessionScope)
    this.assertRequestPreconditions(request, source, supersessionScope)
    const identifier = relationId(request.relationId, source, related)
    this.assertNewRelation(identifier)
    const evidence = validateAuditEvidence(request.audit, 'SUPERSESSION', identifier, source, related, supersessionScope)
    const relation: SerializedEntityEvolutionRelation = {
      relationId: identifier,
      kind: 'SUPERSESSION',
      source,
      related,
      supersessionScope,
      sourceCurrent: false,
      relatedCurrent: true,
      auditEventId: auditEventId(evidence.event),
    }
    return this.resultFor(request.source, request.successor, relation, evidence)
  }

  private recordRelated(kind: 'CORRECTION' | 'REVERSAL', request: EntityRelatedEvolutionRequest): EntityEvolutionResult {
    const source = entityReference(request.source, request.sourceRevision)
    const related = entityReference(request.related, request.relatedRevision)
    this.assertRequestPreconditions(request, source)
    const identifier = relationId(request.relationId, source, related)
    this.assertNewRelation(identifier)
    if (kind === 'REVERSAL' && this.reversedSources.has(currentKey(source))) throw new InvalidEntityMutationError()
    const evidence = validateAuditEvidence(request.audit, kind, identifier, source, related, undefined)
    const relation: SerializedEntityEvolutionRelation = {
      relationId: identifier,
      kind,
      source,
      related,
      sourceCurrent: this.isCurrent(source),
      relatedCurrent: true,
      auditEventId: auditEventId(evidence.event),
    }
    return this.resultFor(request.source, request.related, relation, evidence)
  }

  private assertRequestPreconditions(
    request: {
      readonly source: FinancialEntityLike
      readonly sourceRevision: unknown
      readonly eligible: unknown
      readonly expectedSourceState?: unknown
      readonly expectedSourceRevision?: unknown
      readonly expectedSourceCurrent?: unknown
    },
    source: EntityRevisionReference,
    supersessionScope?: string,
  ): void {
    if (request.eligible !== true) throw new InvalidEntityMutationError()
    assertExpected(request.source.state, request.expectedSourceState)
    assertExpected(source.revision, request.expectedSourceRevision)
    const expectedCurrent = optionalBoolean(request.expectedSourceCurrent)
    if (expectedCurrent !== undefined && this.isCurrent(source, supersessionScope) !== expectedCurrent) {
      throw new EntityStateConflictError()
    }
  }

  private assertNewRelation(relationIdentifier: EntityEvolutionRelationIdentifier): void {
    if (this.relationIds.has(relationIdentifier)) throw new InvalidEntityMutationError()
  }

  private isCurrent(reference: EntityRevisionReference, supersessionScope?: string): boolean {
    return !this.nonCurrent.has(currentKey(reference, supersessionScope))
  }

  private resultFor(
    source: FinancialEntityLike,
    related: FinancialEntityLike | undefined,
    relation: SerializedEntityEvolutionRelation,
    evidence: { readonly log: AuditLog; readonly event: SerializedAuditEvent },
  ): EntityEvolutionResult {
    const nextHistory = new EntityEvolutionHistory([...this.relations, relation])
    return cloneJsonValue({
      source: entityObservation(source),
      ...(related === undefined ? {} : { related: entityObservation(related) }),
      relation,
      evolutionHistory: nextHistory.toJSON(),
      auditHistory: evidence.log.toJSON(),
      auditEvent: evidence.event,
    })
  }

  /**
   * Returns a defensive portable Entity Evolution history observation.
   *
   * @returns Recorded relations in local append observation order.
   *
   * @see ENTITY-EVOLUTION-022
   */
  toJSON(): SerializedEntityEvolutionHistory {
    return cloneJsonValue({ relations: this.relations })
  }
}
