// SPDX-License-Identifier: MPL-2.0
// Exercises installed npm public APIs in an isolated consumer. Creates only
// in-memory observations and defines no financial behavior.
import assert from 'node:assert/strict'
import { FINKORE_CORE_VERSION, Money, FinancialEntity, Workflow, ApprovalComposition, ApprovalDecision, ApprovalDecisionHistory, AuditLog } from '@finkore/typescript'

const error = (code, action) => assert.throws(action, value => value?.code === code)
// Composition validation must survive packaging and installation.
const quorum097 = { rootGroup: 'q', groups: [{ id: 'q', kind: 'N_OF_M', threshold: 1, members: [{ id: 'seat', type: 'requirement', requirementId: 'review', voter: { id: 'alice' } }] }] }
const evidence097 = { requirements: [{ id: 'review', applicability: 'APPLICABLE', eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }], decisions: [{ requirementId: 'review', actor: { id: 'alice' }, effective: true, outcome: 'APPROVED' }] }
assert.deepEqual(ApprovalComposition.from(quorum097).evaluate(evidence097), { outcome: 'APPROVED', actionableRequirements: [] })
for (const field of ['eligibleActors', 'approvedOutcome', 'rejectedOutcome']) {
  const incomplete = structuredClone(evidence097)
  delete incomplete.requirements[0][field]
  const before097 = structuredClone(incomplete)
  error('FINKORE_APPROVAL_INVALID_CHAIN', () => ApprovalComposition.from(quorum097).evaluate(incomplete))
  assert.deepEqual(incomplete, before097)
}
const disconnected097 = structuredClone(quorum097)
disconnected097.groups.push({ id: 'unused', kind: 'ALL_OF', members: [{ id: 'self', type: 'group', groupId: 'unused' }] })
error('FINKORE_APPROVAL_INVALID_CHAIN', () => ApprovalComposition.from(disconnected097))
error('FINKORE_APPROVAL_INVALID_CHAIN', () => ApprovalComposition.from(quorum097).evaluate({ ...evidence097, decisions: null }))
assert.deepEqual(ApprovalComposition.from(quorum097).evaluate({ requirements: evidence097.requirements }), { outcome: 'PENDING', actionableRequirements: ['review'] })
if (process.argv.includes('--composition')) {
  console.log('Installed npm composition checks passed')
  process.exit(0)
}

assert.equal(FINKORE_CORE_VERSION, '0.9-rc')
assert.deepEqual(Money.from({ amount: '1.239', currency: 'EUR' }).toJSON(), { amount: '1.239', currency: 'EUR' })
const binding = { definitionIdentity: 'invoice-flow', definitionVersionIdentity: '1' }
const definition = {
  type: 'invoice', identityScope: 'tenant',
  workflow: { ...binding, states: ['DRAFT', 'REVIEW', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'],
    transitions: [{ source: 'DRAFT', target: 'REVIEW' }, { source: 'REVIEW', target: 'DONE' }] },
  mutability: { DRAFT: ['amount'], REVIEW: ['amount'], DONE: [] },
  validation: [{ id: 'POSITIVE', path: 'amount', rule: 'positive-money' }],
}
const data = { amount: { amount: '1.239', currency: 'EUR' } }
const entity = FinancialEntity.create(definition, 'invoice-1', data)
const before = entity.toJSON()
definition.workflow.transitions.push({ source: 'DRAFT', target: 'DONE' })
entity.definition.validation.splice(0)
error('FINKORE_WORKFLOW_INVALID_TRANSITION', () => entity.transition('DONE'))
error('FINKORE_ENTITY_VALIDATION_FAILED', () => entity.mutate({ amount: { amount: '-1', currency: 'EUR' } }))
assert.deepEqual(entity.toJSON(), before)
const imported = FinancialEntity.import(entity.definition, { entity: entity.transition('REVIEW').toJSON() })
assert.deepEqual(FinancialEntity.from(entity.definition, imported.entity).transition('DONE').toJSON().binding, binding)
const mapping = { mappingId: ' map ', sourceSystem: ' legacy ', sourceId: ' 001 ', entity: { type: before.type, id: before.id } }
const mapped = FinancialEntity.import(entity.definition, { entity: before, identityMapping: mapping })
assert.deepEqual(mapped.identityMapping, mapping)
assert.equal(Object.hasOwn(mapped, 'sourceIdentity'), false)
assert.deepEqual(FinancialEntity.from(entity.definition, mapped.entity).transition('REVIEW').toJSON().binding, binding)
for (const sourceIdentity of [null, [], false, 1, '', {}, { sourceSystem: ' legacy ' }]) {
  error('FINKORE_ENTITY_INVALID_IDENTITY', () => FinancialEntity.import(entity.definition, { entity: before, identityMapping: mapping, sourceIdentity }))
}
error('FINKORE_ENTITY_STATE_CONFLICT', () => FinancialEntity.import(entity.definition, { entity: before, expectedState: null }))
const workflow = Workflow.create(entity.definition.workflow)
for (const revision of [null, '', [], {}, false, 7]) {
  const observation = { currentState: 'DRAFT', binding: { ...binding, definitionVersionIdentity: 'wrong' }, revision }
  const original = structuredClone(observation)
  error('FINKORE_WORKFLOW_INVALID_INSTANCE', () => Workflow.import(entity.definition.workflow, observation))
  assert.deepEqual(observation, original)
}
error('FINKORE_WORKFLOW_VERSION_MISMATCH', () => Workflow.import(entity.definition.workflow, { currentState: 'DRAFT', binding: { ...binding, definitionVersionIdentity: 'wrong' }, revision: 'r1' }))
error('FINKORE_WORKFLOW_INVALID_STATE', () => workflow.transition('REVIEW', { expectedCurrentState: null }))
const composition = ApprovalComposition.from({ rootGroup: 'root', groups: [{ id: 'root', kind: 'ALL_OF', members: [{ type: 'requirement', id: 'member', requirementId: 'review' }] }] })
const observations = [{ id: 'review', applicability: 'APPLICABLE', state: 'PENDING', requiresEvaluationContext: true }]
const context = { evaluatedAt: '2026-09-26T10:00:00Z' }
assert.deepEqual(composition.evaluate({ requirements: observations, decisions: [], context }), { outcome: 'PENDING', actionableRequirements: ['review'] })
error('FINKORE_APPROVAL_INVALID_CHAIN', () => composition.evaluate({ requirements: observations, decisions: {}, context }))
error('FINKORE_APPROVAL_INVALID_CONTEXT', () => composition.evaluate({ requirements: observations, context: { evaluatedAt: 'invalid' } }))
error('FINKORE_APPROVAL_INVALID_CHAIN', () => composition.evaluate({ requirements: [{ id: 'review', applicability: 'APPLICABLE' }] }))
const requirement = { id: 'review', subject: { type: 'invoice', id: 'invoice-1' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'review', subjectFacts: null, outcome: 'APPROVED', actor: { id: 'alice' }, decidedAt: '2026-09-01T12:00:00Z' }
const history = ApprovalDecisionHistory.create().record(requirement, decision)
assert.equal(history.evaluateRequirement(requirement), 'APPROVED')
const expiresAt = '2026-09-26T10:00:00.123456789Z'
const expiring = { ...decision, expiresAt }
assert.equal(ApprovalDecision.evaluate(requirement, expiring, null, undefined, expiresAt), 'INEFFECTIVE')
error('FINKORE_APPROVAL_INVALID_CONTEXT', () => ApprovalDecision.evaluate(requirement, expiring, null))
error('FINKORE_APPROVAL_INVALID_DECISION', () => ApprovalDecision.evaluate({ ...requirement, id: 'other' }, decision, null))
const withdrawn = ApprovalDecisionHistory.create(history.toJSON()).withdraw(requirement, {
  target: { requirementId: 'review', actorId: 'alice', decidedAt: decision.decidedAt }, actor: { id: 'alice' }, recordedAt: expiresAt,
})
assert.equal(ApprovalDecisionHistory.create(withdrawn.toJSON()).evaluateRequirement(requirement), 'PENDING')
const invalidHistory = structuredClone(withdrawn.toJSON()); invalidHistory.lifecycle[0].type = 'UNKNOWN'
error('FINKORE_APPROVAL_INVALID_DECISION', () => ApprovalDecisionHistory.create(invalidHistory))
assert.equal(history.evaluateRequirement(requirement), 'APPROVED')
const absent = { ...decision }; delete absent.subjectFacts
error('FINKORE_APPROVAL_INVALID_DECISION', () => ApprovalDecisionHistory.create().record(requirement, absent))
const metadata = JSON.parse('{"__proto__":{"kept":true}}')
const event = { eventId: 'event-1', eventType: 'ENTITY_CHANGED', entity: requirement.subject, occurredAt: decision.decidedAt, actor: { id: 'alice', metadata } }
const log = AuditLog.create().append(event)
metadata.__proto__.kept = false
assert.equal(log.toJSON().history[0].actor.metadata.__proto__.kept, true)
const auditBefore = log.toJSON()
const evidence = { ...event, eventId: 'redaction', eventType: 'AUDIT_CONTENT_REDACTED' }
error('FINKORE_AUDIT_REDACTION_INVALID', () => log.redact({ policy: { id: 'retention-policy', protectedPaths: ['actor.metadata'] }, redactionEvent: evidence }))
assert.deepEqual(log.toJSON(), auditBefore)
const redacted = log.redact({ policy: { id: 'retention-policy', authority: 'retention', protectedPaths: ['actor.metadata'] }, redactionEvent: evidence })
assert.deepEqual(redacted.event.actor.metadata, { presence: 'REDACTED' })
assert.deepEqual(log.toJSON(), { history: [...auditBefore.history, redacted.evidenceEvent] })
// Core 0.9.7: the ordinary-name control precedes actual definition/result reuse.
for (const state of ['DRAFT', '__proto__', 'constructor', 'prototype']) {
  const ownDefinition = { type: 'invoice', identityScope: 'scope', workflow: { states: [state, 'DONE'], initialState: state, terminalStates: ['DONE'], transitions: [{ source: state, target: 'DONE' }] }, mutability: { [state]: ['memo'], DONE: [] } }
  const ownEntity = FinancialEntity.create(ownDefinition, 'own', { memo: 'old' })
  assert.equal(Object.hasOwn(ownEntity.definition.mutability, state), true)
  const reconstructed = FinancialEntity.from(ownEntity.definition, ownEntity.toJSON())
  assert.equal(reconstructed.mutate({ memo: 'new' }).toJSON().data.memo, 'new')
  assert.equal(ownEntity.toJSON().data.memo, 'old')
}
const withdrawnBefore097 = withdrawn.toJSON()
error('FINKORE_APPROVAL_INVALID_DECISION', () => withdrawn.record(requirement, { ...decision, subjectFacts: { changed: true } }))
assert.deepEqual(withdrawn.toJSON(), withdrawnBefore097)
console.log('Installed npm consumer: exact Money, Entity binding/ownership, null preconditions, Approval association and Audit ownership pass')
