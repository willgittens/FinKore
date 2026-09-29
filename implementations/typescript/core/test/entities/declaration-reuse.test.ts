// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { FinancialEntity, InvalidEntityMutationError, Workflow, ApprovalCondition, ApprovalDecision, AuditLog } from '../../src/index.js'

const names = ['DRAFT', '__proto__', 'constructor', 'prototype']
function definition(state: string, field = 'memo') {
  return { type: 'invoice', identityScope: 'scope', workflow: {
    definitionIdentity: 'flow', definitionVersionIdentity: 'v1', states: [state, 'DONE'],
    initialState: state, terminalStates: ['DONE'], transitions: [{ source: state, target: 'DONE' }],
  }, mutability: { [state]: [field], DONE: [] } }
}
const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

for (const state of names) for (const field of ['memo', '__proto__', 'constructor', 'prototype']) {
  it(`declaration097 reuse ${state} field ${field}`, () => {
    const input = definition(state, field)
    const prototype = Object.getOwnPropertyDescriptors(Object.prototype)
    const entity = (() => {
      try { return FinancialEntity.create(input, 'i', { [field]: 'old', protected: 'fixed' }) }
      catch (error) {
        // A portable declaration rejection is a wrong domain result; unexpected
        // runtime exceptions still propagate to the native probe classifier.
        if (error instanceof InvalidEntityMutationError) expect.fail('A valid own declaration was rejected')
        throw error
      }
    })()
    const before = roundTrip(entity.toJSON())
    const retained = { ...roundTrip(input), validation: [] }
    expect(entity.definition).toEqual(retained)
    expect(Object.keys(entity.definition.mutability)).toEqual([state, 'DONE'])
    expect(Object.getPrototypeOf(entity.definition.mutability)).toBe(Object.prototype)
    input.mutability[state]!.push('protected')
    const observed = entity.definition as unknown as { mutability: Record<string, string[]> }
    observed.mutability[state]!.push('protected')
    expect(entity.definition).toEqual(retained)
    const imported = FinancialEntity.from(roundTrip(entity.definition), roundTrip(entity.toJSON()))
    expect(() => imported.mutate({ protected: 'changed' })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_IMMUTABLE' }))
    expect(imported.toJSON()).toEqual(before)
    const changed = imported.mutate({ [field]: 'new' })
    expect(changed.toJSON()).toEqual({ ...before, data: { [field]: 'new', protected: 'fixed' } })
    expect(Object.hasOwn(changed.toJSON().data, field)).toBe(true)
    const transitioned = FinancialEntity.from(roundTrip(changed.definition), roundTrip(changed.toJSON())).transition('DONE')
    expect(transitioned.toJSON()).toEqual({ ...changed.toJSON(), state: 'DONE' })
    expect(transitioned.definition).toEqual(retained)
    expect(() => transitioned.mutate({ [field]: 'terminal change' })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_IMMUTABLE' }))
    const revisions = FinancialEntity.import(entity.definition, { entity: entity.toJSON(), currentRevision: 'r2', historicalRevisions: ['r1'], conflictVersion: 'v2' })
    expect(FinancialEntity.import(entity.definition, roundTrip(revisions))).toEqual(revisions)
    expect(revisions.currentRevision).toEqual({ type: 'invoice', id: 'i', revision: 'r2', current: true })
    expect(revisions.entity.binding).toEqual({ definitionIdentity: 'flow', definitionVersionIdentity: 'v1' })
    expect(entity.toJSON()).toEqual(before)
    expect(Object.getOwnPropertyDescriptors(Object.prototype)).toEqual(prototype)
  })
}
for (const state of names) it(`declaration097 inherited state is not a declaration ${state}`, () => {
  const input = definition(state)
  input.mutability = Object.create({ [state]: ['memo'] }) as typeof input.mutability
  expect(() => FinancialEntity.create(input, 'i', { memo: 'old' })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_INVALID_MUTATION' }))
  const observation = { type: 'invoice', id: 'i', state, data: { memo: 'old' }, binding: { definitionIdentity: 'flow', definitionVersionIdentity: 'v1' } }
  const before = roundTrip(observation)
  expect(() => FinancialEntity.from(input, observation).mutate({ memo: 'new' })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_INVALID_MUTATION' }))
  expect(observation).toEqual(before)
})
for (const key of ['__proto__', 'constructor', 'prototype']) it(`declaration097 adjacent own member ${key}`, () => {
  const value = { [key]: { amount: 1 } }
  const workflow = Workflow.create({ states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE', guard: { fact: key, equals: { amount: 1 } } }] })
  expect(() => workflow.transition('DONE', { facts: Object.create(value) as Record<string, unknown> })).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_GUARD_REJECTED' }))
  expect(workflow.transition('DONE', { facts: value }).currentState).toBe('DONE')
  const condition = ApprovalCondition.from({ id: key, requiredFacts: [key + '.amount'], evaluation: 'external' })
  expect(condition.evaluate({ facts: value, result: 'APPLICABLE' })).toBe('APPLICABLE')
  expect(() => condition.evaluate({ facts: Object.create(value) as Record<string, unknown>, result: 'APPLICABLE' })).toThrowError(expect.objectContaining({ code: 'FINKORE_APPROVAL_CONDITION_UNRESOLVED' }))
  const decision = ApprovalDecision.from({ requirementId: key, actor: { id: key }, outcome: 'APPROVED', decidedAt: '2026-09-01T00:00:00Z', subjectFacts: value })
  expect(decision.toJSON().subjectFacts).toEqual(value)
  const log = AuditLog.create().append({ eventId: key, eventType: 'EDITED', entity: { type: 'invoice', id: 'i' }, actor: { type: 'user', id: 'a', metadata: value }, occurredAt: '2026-09-01T00:00:00Z' })
  expect(AuditLog.create(log.toJSON().history).toJSON()).toEqual(log.toJSON())
  expect(log.toJSON().history[0]!.actor.metadata).toEqual(value)
})

for (const field of ['amount', '__proto__', 'constructor', 'prototype']) it(`declaration097 validator own field ${field}`, () => {
  const input = { ...definition('DRAFT', field), validation: [{ id: 'positive', rule: 'positive-money', path: field }] }
  const money = { amount: '1', currency: 'EUR' }
  const inherited = Object.create({ [field]: money }) as Record<string, unknown>
  expect(() => FinancialEntity.create(input, 'i', inherited)).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }))
  const entity = FinancialEntity.create(input, 'i', { [field]: money })
  expect(entity.validate()).toEqual({ valid: true, findings: [] })
  const imported = FinancialEntity.from(roundTrip(entity.definition), roundTrip(entity.toJSON()))
  const before = roundTrip(imported.toJSON())
  expect(() => imported.mutate({ [field]: { amount: '0', currency: 'EUR' } })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }))
  expect(imported.toJSON()).toEqual(before)
  expect(Object.keys(before.data as object)).toEqual([field])
})
