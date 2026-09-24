// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { ApprovalDecisionHistory, EntityEvolutionHistory, FinancialEntity, Workflow } from '../../src/index.js'

const requirement = { id: 'review', subject: { type: 'invoice', id: 'invoice-1' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'review', subjectFacts: { revision: '3' }, outcome: 'APPROVED', actor: { id: 'alice' }, decidedAt: '2026-09-01T12:00:00Z' }
const target = { requirementId: 'review', actorId: 'alice', decidedAt: decision.decidedAt }
const later = { ...decision, subjectFacts: { revision: '4' }, decidedAt: '2026-09-03T12:00:00Z' }
const event = { target, actor: { id: 'alice' }, recordedAt: '2026-09-02T12:00:00Z' }

// APPROVAL-VALIDITY-001/002/004/010/011: consume real results across operations.
describe('Approval lifecycle recording sequences', () => {
  for (const kind of ['withdraw', 'decision', 'requirement'] as const) {
    for (const extra of [{}, { type: 'WITHDRAWN' }, { type: 'DECISION_SUPERSEDED' }, { type: 'REQUIREMENT_SUPERSEDED' }, { type: 'UNKNOWN' }, { type: null }, { type: {} }]) {
      it(`preserves ${kind} evidence after recording and reimporting with ${JSON.stringify(extra)}`, () => {
        const history = ApprovalDecisionHistory.create(kind === 'decision' ? [decision, later] : [decision])
        if (kind === 'withdraw') history.withdraw(requirement, { ...event, ...extra })
        if (kind === 'decision') history.supersedeDecision({ ...event, successor: { ...target, decidedAt: later.decidedAt }, ...extra })
        if (kind === 'requirement') history.supersedeRequirement({ actor: event.actor, recordedAt: event.recordedAt, targetRequirementId: 'review', successorRequirementId: 'next-review', ...extra })
        const committed = history.toJSON()
        const next = { ...later, decidedAt: '2026-09-04T12:00:00Z' }
        history.record(requirement, next)
        const imported = ApprovalDecisionHistory.create(history.toJSON())
        expect(imported.evaluateRequirement(requirement, { currentSubjectFacts: { revision: '3' }, relevantFactPaths: ['revision'] })).toBe('PENDING')
        expect(history.toJSON()).toEqual({ history: [...committed.history, next], lifecycle: committed.lifecycle })
        expect(imported.toJSON()).toEqual(history.toJSON())
        const before = imported.toJSON()
        expect(() => imported.record(requirement, { ...next, outcome: 'PENDING' })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_INVALID_DECISION' }))
        expect(imported.toJSON()).toEqual(before)
      })
    }
  }
  it('permits a new independently effective decision after withdrawal', () => {
    const history = ApprovalDecisionHistory.create([decision]).withdraw(requirement, event)
    history.record(requirement, { ...decision, decidedAt: later.decidedAt })
    expect(history.evaluateRequirement(requirement, { currentSubjectFacts: decision.subjectFacts, relevantFactPaths: ['revision'] })).toBe('APPROVED')
    expect(history.toJSON().lifecycle).toEqual([{ ...event, type: 'WITHDRAWN' }])
  })
})

const binding = { definitionIdentity: 'review-flow', definitionVersionIdentity: 'v1' }
function attemptMutation(change: () => void): void {
  try { change() } catch (error) { if (!(error instanceof TypeError)) throw error }
}

// WORKFLOW-VERSION-003/009: native aliases cannot be expressed by isolated JSON.
describe('Workflow retained definition ownership', () => {
  for (const imported of [false, true]) for (const array of [false, true]) for (const location of ['input', 'observation'] as const) for (const approved of [false, true]) {
    it(`${imported ? 'import' : 'create'} retains ${array ? 'array' : 'object'} ${location} guard when approved=${approved}`, () => {
      const original = array ? { checks: [{ approved: true }] } : { approved: true }
      const definition = { ...binding, states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE', guard: { fact: 'decision', equals: original } }] }
      const workflow = imported ? Workflow.import(definition, { currentState: 'DRAFT', binding, revision: 'revision-1' }) : Workflow.create(definition)
      const before = workflow.toJSON()
      const observation = workflow.definition.transitionFrom('DRAFT', 'DONE')
      expect(observation).toBeDefined()
      const retained = location === 'input' ? original : observation!.guards[0]!.equals
      attemptMutation(() => {
        if (array) (retained as { checks: { approved: boolean }[] }).checks[0]!.approved = false
        else (retained as { approved: boolean }).approved = false
      })
      const facts = { decision: array ? { checks: [{ approved }] } : { approved } }
      const factsBefore = structuredClone(facts)
      if (approved) {
        workflow.transition('DONE', { facts })
        expect(workflow.toJSON()).toEqual({ ...before, currentState: 'DONE' })
      } else {
        expect(() => workflow.transition('DONE', { facts })).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_GUARD_REJECTED' }))
        expect(workflow.toJSON()).toEqual(before)
      }
      expect(facts).toEqual(factsBefore)
    })
  }
  it('retains state, terminal and transition arrays after construction', () => {
    const definition = { ...binding, states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE' }] }
    const workflow = Workflow.create(definition)
    definition.states.splice(0); definition.terminalStates.splice(0); definition.transitions[0]!.target = 'OTHER'
    workflow.transition('DONE')
    expect(workflow.toJSON()).toEqual({ currentState: 'DONE', binding })
    expect(() => workflow.transition('DRAFT')).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_TERMINAL_STATE' }))
  })
})

const entityDefinition = { type: 'invoice', identityScope: 'tenant', workflow: { states: ['ISSUED'], initialState: 'ISSUED', terminalStates: [], transitions: [] }, mutability: { ISSUED: [] } }
const entity = () => FinancialEntity.from(entityDefinition, { type: 'invoice', id: 'invoice-1', state: 'ISSUED', data: { amount: { amount: '1', currency: 'EUR' } } })
const reference = { type: 'invoice', id: 'invoice-1', revision: 'revision-1' }
const originalAudit = { eventId: 'original', eventType: 'ISSUED', entity: { type: 'invoice', id: 'invoice-1' }, occurredAt: '2026-09-01T12:00:00Z' }
function evidence(kind: 'VOID' | 'CORRECTION', id: string) {
  return { eventId: `event-${id}`, eventType: 'EVOLUTION', entity: originalAudit.entity, occurredAt: originalAudit.occurredAt,
    metadata: { entityEvolution: { kind, relationId: id, source: reference, ...(kind === 'CORRECTION' ? { related: { ...reference, revision: 'revision-2' } } : {}) } },
    relationships: [{ relationshipId: `audit-${id}`, type: kind === 'VOID' ? 'VOIDS' : 'CORRECTS', target: { eventId: 'original', entity: originalAudit.entity } }] }
}

// ENTITY-EVOLUTION-022/023/025/033/035: real returned history survives reuse.
describe('Entity evolution output sequences', () => {
  it('preserves both histories and Entities when Audit validation and correspondence fail', () => {
    const source = entity(), related = entity(), history = EntityEvolutionHistory.create()
    const event = evidence('CORRECTION', 'correct-1')
    event.occurredAt = 'invalid'
    event.metadata.entityEvolution.relationId = 'wrong-relation'
    const audit = { history: [structuredClone(originalAudit)], event }
    const before = structuredClone({ source: source.toJSON(), related: related.toJSON(), history: history.toJSON(), audit })
    try {
      expect(() => history.correct({ source, related, sourceRevision: reference.revision, relatedRevision: 'revision-2', relationId: 'correct-1', eligible: true, audit })).toThrowError(expect.objectContaining({ code: 'FINKORE_AUDIT_INVALID_EVENT' }))
    } finally {
      expect({ source: source.toJSON(), related: related.toJSON(), history: history.toJSON(), audit }).toEqual(before)
    }
  })
  for (const expected of [false, true]) it(`void then correction checks observed currentness against ${expected}`, () => {
    const source = entity(), related = entity(), history = EntityEvolutionHistory.create()
    const first = history.void({ source, sourceRevision: reference.revision, relationId: 'void-1', eligible: true, audit: { history: [originalAudit], event: evidence('VOID', 'void-1') } })
    const imported = EntityEvolutionHistory.create(first.evolutionHistory.relations)
    const before = structuredClone(first)
    const request = { source, related, sourceRevision: reference.revision, relatedRevision: 'revision-2', relationId: 'correct-1', eligible: true, expectedSourceCurrent: expected, audit: { history: first.auditHistory.history, event: evidence('CORRECTION', 'correct-1') } }
    if (expected) expect(() => imported.correct(request)).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_STATE_CONFLICT' }))
    else {
      const next = imported.correct(request)
      expect(next.relation.sourceCurrent).toBe(false)
      expect(next.evolutionHistory.relations).toEqual([...first.evolutionHistory.relations, next.relation])
      expect(next.auditHistory.history).toEqual([...first.auditHistory.history, next.auditEvent])
      expect(EntityEvolutionHistory.create(next.evolutionHistory.relations).toJSON()).toEqual(next.evolutionHistory)
    }
    expect(first).toEqual(before)
    expect(imported.toJSON()).toEqual(first.evolutionHistory)
    expect(source.toJSON()).toEqual(first.source)
    expect(related.toJSON()).toEqual(first.source)
  })
})
