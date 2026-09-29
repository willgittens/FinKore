// SPDX-License-Identifier: MPL-2.0
// Exercises installed npm public APIs in an isolated consumer. Creates only
// in-memory observations and defines no financial behavior.
import assert from 'node:assert/strict'
import { FINKORE_CORE_VERSION, Money, FinancialEntity, Workflow, WorkflowDefinition, ApprovalCondition, ApprovalComposition, ApprovalDecision, ApprovalDecisionHistory, AuditLog } from '@finkore/typescript'

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

const req097 = { id: 'review', subject: { type: 'invoice', id: '1' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const dec097 = { requirementId: 'review', actor: { id: 'alice' }, outcome: 'APPROVED', subjectFacts: { invoice: { amount: 1 } }, decidedAt: '2026-09-01T12:00:00Z' }
const hist097 = ApprovalDecisionHistory.from([]).record(req097, dec097)
assert.equal(hist097.evaluateRequirement(req097, { currentSubjectFacts: { invoice: { amount: 2 } } }), 'PENDING')
assert.equal(ApprovalDecision.evaluate(req097, dec097, { invoice: { amount: 1 } }), 'EFFECTIVE')
error('FINKORE_APPROVAL_INVALID_DECISION', () => ApprovalDecision.evaluate(req097, dec097, dec097.subjectFacts, null))
const condDeclaration097 = { id: 'c', requiredFacts: ['invoice.amount'], evaluation: 'external' }
const cond097 = ApprovalCondition.from(condDeclaration097)
condDeclaration097.requiredFacts.push('missing')
assert.equal(cond097.evaluate({ facts: { invoice: { amount: null } }, result: 'APPLICABLE' }), 'APPLICABLE')
error('FINKORE_APPROVAL_CONDITION_UNRESOLVED', () => cond097.evaluate({ facts: { 'invoice.amount': 1 }, result: 'APPLICABLE' }))
const wd097 = ApprovalDecisionHistory.from(hist097.toJSON()).withdraw(req097, { target: { requirementId: 'review', actorId: 'alice', decidedAt: dec097.decidedAt }, actor: { id: 'alice' }, recordedAt: '2026-09-02T00:00:00Z' })
const before097 = wd097.toJSON()
error('FINKORE_APPROVAL_INVALID_DECISION', () => wd097.record(req097, { ...dec097, subjectFacts: null }))
assert.deepEqual(wd097.toJSON(), before097)
assert.equal(ApprovalDecisionHistory.from(before097).evaluateRequirement(req097), 'PENDING')
if (process.argv.includes('--approvals')) {
  console.log('Installed npm Approval checks passed')
  process.exit(0)
}

// Native retained values must survive packaging with their validation intact.
for (const value of [new Number(1), NaN, Infinity, 1n, new Date(0)]) {
  const before = hist097.toJSON()
  error('FINKORE_APPROVAL_INVALID_DECISION', () => hist097.record(req097, { ...dec097, subjectFacts: { nested: [value] } }))
  error('FINKORE_WORKFLOW_INVALID_DEFINITION', () => WorkflowDefinition.from({ states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE', guard: { fact: 'value', equals: { nested: [value] } } }] }))
  assert.deepEqual(hist097.toJSON(), before)
}
const ownedFacts097 = { nested: { value: 1 } }
const ownedHistory097 = ApprovalDecisionHistory.create().record(req097, { ...dec097, subjectFacts: ownedFacts097 })
const ownedBefore097 = structuredClone(ownedHistory097.toJSON())
ownedFacts097.nested.value = 999
ownedHistory097.toJSON().history[0].subjectFacts.nested.value = 888
assert.deepEqual(ownedHistory097.toJSON(), ownedBefore097)
for (const field of ['terminalStates', 'transitions']) {
  const flow = { states: ['DRAFT'], initialState: 'DRAFT', terminalStates: [], transitions: [] }
  delete flow[field]
  error('FINKORE_WORKFLOW_INVALID_DEFINITION', () => WorkflowDefinition.from(flow))
}
if (process.argv.includes('--ownership')) {
  console.log('Installed npm native ownership checks passed')
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
