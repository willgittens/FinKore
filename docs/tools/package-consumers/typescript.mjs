// SPDX-License-Identifier: MPL-2.0
// Exercises installed npm public APIs in an isolated consumer. Creates only
// in-memory observations and defines no financial behavior.
import assert from 'node:assert/strict'
import { FINKORE_CORE_VERSION, Money, FinancialEntity, Workflow, ApprovalDecisionHistory, AuditLog } from '@finkore/typescript'

const error = (code, action) => assert.throws(action, value => value?.code === code)
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
error('FINKORE_ENTITY_STATE_CONFLICT', () => FinancialEntity.import(entity.definition, { entity: before, expectedState: null }))
const workflow = Workflow.create(entity.definition.workflow)
error('FINKORE_WORKFLOW_INVALID_STATE', () => workflow.transition('REVIEW', { expectedCurrentState: null }))
const requirement = { id: 'review', subject: { type: 'invoice', id: 'invoice-1' }, eligibleActors: ['alice'], approvedOutcome: 'APPROVED', rejectedOutcome: 'REJECTED' }
const decision = { requirementId: 'review', subjectFacts: null, outcome: 'APPROVED', actor: { id: 'alice' }, decidedAt: '2026-09-01T12:00:00Z' }
const history = ApprovalDecisionHistory.create().record(requirement, decision)
assert.equal(history.evaluateRequirement(requirement), 'APPROVED')
const absent = { ...decision }; delete absent.subjectFacts
error('FINKORE_APPROVAL_INVALID_DECISION', () => ApprovalDecisionHistory.create().record(requirement, absent))
const metadata = JSON.parse('{"__proto__":{"kept":true}}')
const event = { eventId: 'event-1', eventType: 'ENTITY_CHANGED', entity: requirement.subject, occurredAt: decision.decidedAt, actor: { id: 'alice', metadata } }
const log = AuditLog.create().append(event)
metadata.__proto__.kept = false
assert.equal(log.toJSON().history[0].actor.metadata.__proto__.kept, true)
console.log('Installed npm consumer: exact Money, Entity binding/ownership, null preconditions, Approval association and Audit ownership pass')
