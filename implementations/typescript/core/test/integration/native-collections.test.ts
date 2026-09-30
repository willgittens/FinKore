// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { ApprovalChain, ApprovalComposition, ApprovalCondition, ApprovalDecision, ApprovalDecisionHistory, ApprovalRequirement, AuditActor, AuditChange, AuditEvent, AuditLog, EntityEvolutionHistory, FinancialEntity, Money, Workflow } from '../../src/index.js'

// Native holes cannot be represented by JSON vectors. Every supplied position
// must satisfy the owning declaration/evidence contract, including before reuse.
const workflow = { states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE', guards: [{ fact: 'ok', equals: true }] }] }
const definition = { type: 'invoice', identityScope: 'tenant', workflow, mutability: { DRAFT: ['memo'], DONE: [] }, validation: [{ id: 'positive', path: 'amount', rule: 'positive-money' }] }
const data = { memo: 'original', amount: { amount: '10', currency: 'EUR' } }
const entity = { type: 'invoice', id: 'i', state: 'DRAFT', data }
const requirement = { id: 'r', subject: { type: 'invoice', id: 'i' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', subjectFacts: { nested: [1, null] }, decidedAt: '2026-09-01T10:00:00Z' }
const lifecycle = { type: 'WITHDRAWN', target: { requirementId: 'r', actorId: 'alice', decidedAt: decision.decidedAt }, actor: { id: 'alice' }, recordedAt: '2026-09-02T10:00:00Z' }
const group = { id: 'g', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'm', requirementId: 'r' }] }
const quorum = { rootGroup: 'g', groups: [{ ...group, kind: 'N_OF_M', threshold: 1, members: [{ ...group.members[0], voter: { id: 'alice' } }] }] }
const event = { eventId: 'e', eventType: 'UPDATED', entity: { type: 'invoice', id: 'i' }, occurredAt: '2026-09-01T10:00:00Z', changes: [{ path: 'memo', after: 'secret' }] }
const relation = { relationId: 'rel', kind: 'VOID', source: { type: 'invoice', id: 'i', revision: 'v1' }, sourceCurrent: false, auditEventId: 'e' }
const observations = [{ id: 'r', applicability: 'APPLICABLE', state: 'APPROVED', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }]

interface Boundary {
  name: string
  requirement: string
  input: unknown
  path: readonly (string | number)[]
  code: string
  invoke: (input: never) => unknown
}
const boundaries: Boundary[] = [
  { name: 'approval fact values', requirement: 'APPROVAL-FACT-004', input: decision, path: ['subjectFacts', 'nested'], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalDecision.from(i) },
  { name: 'workflow guard values', requirement: 'WORKFLOW-GUARD-007', input: { ...workflow, transitions: [{ source: 'DRAFT', target: 'DONE', guards: [{ fact: 'ok', equals: [1, null] }] }] }, path: ['transitions', 0, 'guards', 0, 'equals'], code: 'WORKFLOW_INVALID_DEFINITION', invoke: i => Workflow.create(i) },
  { name: 'decision fact paths', requirement: 'APPROVAL-FACT-002', input: ['nested'], path: [], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalDecision.from(decision).evaluateEffectiveness(decision.subjectFacts, i) },
  { name: 'condition fact paths', requirement: 'APPROVAL-CONDITION-006', input: { id: 'c', requiredFacts: ['nested'], evaluation: 'external' }, path: ['requiredFacts'], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalCondition.from(i) },
  { name: 'composition requirement evidence', requirement: 'APPROVAL-COMPOSITION-024', input: { requirements: observations, decisions: [{ requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true }] }, path: ['requirements'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(quorum).evaluate(i) },
  { name: 'workflow states', requirement: 'WORKFLOW-STATES-001', input: workflow, path: ['states'], code: 'WORKFLOW_INVALID_DEFINITION', invoke: i => Workflow.create(i) },
  { name: 'workflow terminal states', requirement: 'WORKFLOW-TERMINAL-002', input: workflow, path: ['terminalStates'], code: 'WORKFLOW_INVALID_DEFINITION', invoke: i => Workflow.create(i) },
  { name: 'workflow transitions', requirement: 'WORKFLOW-TRANSITION-001', input: workflow, path: ['transitions'], code: 'WORKFLOW_INVALID_DEFINITION', invoke: i => Workflow.create(i) },
  { name: 'workflow guards', requirement: 'WORKFLOW-GUARD-002', input: workflow, path: ['transitions', 0, 'guards'], code: 'WORKFLOW_INVALID_DEFINITION', invoke: i => Workflow.create(i) },
  { name: 'entity permissions', requirement: 'ENTITY-MUTABILITY-008', input: definition, path: ['mutability', 'DRAFT'], code: 'ENTITY_INVALID_MUTATION', invoke: i => FinancialEntity.create(i, 'i', data) },
  { name: 'entity validators', requirement: 'ENTITY-VALIDATION-009', input: definition, path: ['validation'], code: 'ENTITY_INVALID_MUTATION', invoke: i => FinancialEntity.create(i, 'i', data) },
  { name: 'entity revisions', requirement: 'ENTITY-REVISION-001', input: { entity, historicalRevisions: ['v0'] }, path: ['historicalRevisions'], code: 'ENTITY_INVALID_IDENTITY', invoke: i => FinancialEntity.import(definition, i) },
  { name: 'evolution history', requirement: 'ENTITY-EVOLUTION-024', input: [relation], path: [], code: 'ENTITY_INVALID_MUTATION', invoke: i => EntityEvolutionHistory.create(i) },
  { name: 'approval eligibility', requirement: 'APPROVAL-REQUIREMENT-003', input: requirement, path: ['eligibleActors'], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalRequirement.from(i) },
  { name: 'approval history list', requirement: 'APPROVAL-DECISION-001', input: [decision], path: [], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalDecisionHistory.create(i) },
  { name: 'approval history envelope', requirement: 'APPROVAL-DECISION-001', input: { history: [decision] }, path: ['history'], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalDecisionHistory.create(i) },
  { name: 'approval lifecycle', requirement: 'APPROVAL-VALIDITY-014', input: { history: [decision], lifecycle: [lifecycle] }, path: ['lifecycle'], code: 'APPROVAL_INVALID_DECISION', invoke: i => ApprovalDecisionHistory.create(i) },
  { name: 'chain members', requirement: 'APPROVAL-CHAIN-001', input: { mode: 'SEQUENTIAL', requirements: ['r'], rejectionOutcome: 'REJECTED' }, path: ['requirements'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalChain.from(i) },
  { name: 'composition groups', requirement: 'APPROVAL-COMPOSITION-004', input: { rootGroup: 'g', groups: [group] }, path: ['groups'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(i) },
  { name: 'composition members', requirement: 'APPROVAL-COMPOSITION-004', input: { rootGroup: 'g', groups: [group] }, path: ['groups', 0, 'members'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(i) },
  { name: 'quorum members', requirement: 'APPROVAL-QUORUM-007', input: quorum, path: ['groups', 0, 'members'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(i) },
  { name: 'composition stages', requirement: 'APPROVAL-COMPOSITION-016', input: { stages: [{ id: 's', groups: ['g'] }], groups: [group] }, path: ['stages'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(i) },
  { name: 'stage groups', requirement: 'APPROVAL-COMPOSITION-016', input: { stages: [{ id: 's', groups: ['g'] }], groups: [group] }, path: ['stages', 0, 'groups'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(i) },
  { name: 'quorum eligibility', requirement: 'APPROVAL-QUORUM-002', input: { requirements: observations, decisions: [{ requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true }] }, path: ['requirements', 0, 'eligibleActors'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(quorum).evaluate(i) },
  { name: 'quorum evidence', requirement: 'APPROVAL-COMPOSITION-024', input: { requirements: observations, decisions: [{ requirementId: 'r', actor: { id: 'alice' }, outcome: 'APPROVED', effective: true }] }, path: ['decisions'], code: 'APPROVAL_INVALID_CHAIN', invoke: i => ApprovalComposition.from(quorum).evaluate(i) },
  { name: 'audit changes', requirement: 'AUDIT-CHANGE-001', input: event, path: ['changes'], code: 'AUDIT_INVALID_EVENT', invoke: i => AuditEvent.from(i) },
  { name: 'audit relationships', requirement: 'AUDIT-RELATIONSHIP-003', input: { ...event, relationships: [{ relationshipId: 'link', type: 'CORRECTS', target: { eventId: 'previous', entity: event.entity } }] }, path: ['relationships'], code: 'AUDIT_INVALID_EVENT', invoke: i => AuditEvent.from(i) },
  { name: 'audit actor values', requirement: 'AUDIT-ACTOR-010', input: { id: 'alice', metadata: { values: [1, null] } }, path: ['metadata', 'values'], code: 'AUDIT_ACTOR_INVALID', invoke: i => AuditActor.from(i) },
  { name: 'audit change values', requirement: 'AUDIT-CHANGE-008', input: { path: 'memo', after: { values: [1, null] } }, path: ['after', 'values'], code: 'AUDIT_INVALID_EVENT', invoke: i => AuditChange.from(i) },
  { name: 'audit history', requirement: 'AUDIT-APPEND-003', input: [event], path: [], code: 'AUDIT_INVALID_EVENT', invoke: i => AuditLog.create(i) },
  { name: 'redaction paths', requirement: 'AUDIT-REDACTION-001', input: { policy: { id: 'p', authority: 'retention', protectedPaths: ['memo'] }, redactionEvent: { ...event, eventId: 'redaction', eventType: 'REDACTED' } }, path: ['policy', 'protectedPaths'], code: 'AUDIT_REDACTION_INVALID', invoke: i => AuditLog.create([event]).redact(i) },
  { name: 'allocation ratios', requirement: 'MONEY-ALLOCATION-004', input: { method: 'RATIO', ratios: [1, 2], scale: 2 }, path: ['ratios'], code: 'MONEY_INVALID_ALLOCATION', invoke: i => Money.from({ amount: '12', currency: 'EUR' }).allocate(i) },
]

for (const boundary of boundaries) {
  it(`collections097 ${boundary.name} dense control`, () => {
    const input: unknown = structuredClone(boundary.input)
    const before = structuredClone(input)
    expect(() => boundary.invoke(input as never)).not.toThrow()
    expect(input).toStrictEqual(before)
  })
  // Actor/Change JSON values may change type; the other boundaries require arrays.
  if (!['audit actor values', 'audit change values', 'approval fact values', 'workflow guard values'].includes(boundary.name)) {
    for (const malformed of [null, {}, 'x', false, 1]) it(`collections097 ${boundary.name} non-array ${JSON.stringify(malformed)}`, () => {
      let input: unknown = structuredClone(boundary.input)
      if (boundary.path.length === 0) input = malformed
      else {
        let parent = input as Record<string | number, unknown>
        for (const key of boundary.path.slice(0, -1)) parent = parent[key] as Record<string | number, unknown>
        parent[boundary.path.at(-1)!] = malformed
      }
      const before = structuredClone(input)
      let code: unknown
      try { boundary.invoke(input as never) }
      catch (error) {
        if (!(error instanceof Error) || !('code' in error)) throw error
        code = error.code
      }
      expect(code).toBe(`FINKORE_${boundary.code}`)
      expect(input).toStrictEqual(before)
    })
  }
  it(`collections097 ${boundary.name} iterator cannot hide an invalid position`, () => {
    const input: unknown = structuredClone(boundary.input)
    let collection: unknown = input
    for (const key of boundary.path) collection = (collection as Record<string | number, unknown>)[key]
    const values = collection as unknown[]
    values.unshift(undefined)
    const before = structuredClone(input)
    const iterator = function* () { yield* values.slice(1) }
    Object.defineProperty(values, Symbol.iterator, { value: iterator, configurable: true })
    let code: unknown
    try {
      try { boundary.invoke(input as never) }
      catch (error) {
        if (!(error instanceof Error) || !('code' in error)) throw error
        code = error.code
      }
      expect(code).toBe(`FINKORE_${boundary.code}`)
    } finally {
      expect(Object.getOwnPropertyDescriptor(values, Symbol.iterator)?.value).toBe(iterator)
      Reflect.deleteProperty(values, Symbol.iterator)
      expect(input).toStrictEqual(before)
    }
  })
  for (const position of ['first', 'middle', 'last'] as const) it(`collections097 ${boundary.name} ${position} hole (${boundary.requirement})`, () => {
    const input: unknown = structuredClone(boundary.input)
    let collection: unknown = input
    for (const key of boundary.path) collection = (collection as Record<string | number, unknown>)[key]
    const values = collection as unknown[]
    const index = position === 'first' ? 0 : position === 'last' ? values.length : Math.floor(values.length / 2)
    values.splice(index, 0, undefined)
    delete values[index]
    const before = structuredClone(input)
    let code: unknown
    try {
      try { boundary.invoke(input as never) }
      catch (error) {
        // Runtime defects stay runtime failures, including under mutation probes.
        if (!(error instanceof Error) || !('code' in error)) throw error
        code = error.code
      }
      expect(code).toBe(`FINKORE_${boundary.code}`)
    } finally {
      expect(input).toStrictEqual(before)
      expect(Object.hasOwn(values, index)).toBe(false)
    }
  })
}
