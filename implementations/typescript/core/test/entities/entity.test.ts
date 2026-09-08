import { describe, expect, it } from 'vitest'
import {
  EntityStateConflictError,
  FinancialEntity,
  InvalidEntityIdentityError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowTerminalStateError,
} from '../../src/index.js'

const invoiceDefinition = {
  type: 'invoice',
  identityScope: 'tenant-a',
  workflow: {
    states: ['DRAFT', 'SUBMITTED', 'FINAL'],
    initialState: 'DRAFT',
    terminalStates: ['FINAL'],
    transitions: [
      { source: 'DRAFT', target: 'SUBMITTED' },
      { source: 'SUBMITTED', target: 'FINAL' },
    ],
  },
}

const invoiceData = {
  amount: { amount: '100.00', currency: 'EUR' },
  memo: 'initial',
  deliveryStatus: 'NEW',
}

describe('Financial Entity identity and lifecycle', () => {
  it('creates an entity with caller-supplied identity in the workflow initial state', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)

    expect(entity.id).toBe('inv-42')
    expect(entity.state).toBe('DRAFT')
    expect(entity.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: invoiceData,
    })
  })

  it('does not infer or generate missing identity values', () => {
    const callableDefinition = Object.assign(() => undefined, invoiceDefinition)

    expect(() => FinancialEntity.create(invoiceDefinition, undefined, invoiceData)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.create(invoiceDefinition, '', invoiceData)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.create(null, 'inv-42', invoiceData)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.create([], 'inv-42', invoiceData)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.create(callableDefinition, 'inv-42', invoiceData)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.create({ ...invoiceDefinition, identityScope: '' }, 'inv-42', invoiceData)).toThrow(
      InvalidEntityIdentityError,
    )
  })

  it('preserves identity and data through successful lifecycle transitions', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)

    const transitioned = entity.transition('SUBMITTED')

    expect(transitioned).not.toBe(entity)
    expect(transitioned.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'SUBMITTED',
      data: invoiceData,
    })
    expect(entity.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: invoiceData,
    })
  })

  it('rejects undeclared lifecycle transitions without changing the entity', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)
    const before = entity.toJSON()

    expect(() => entity.transition('FINAL')).toThrow(InvalidWorkflowTransitionError)
    expect(() => entity.transition('UNKNOWN')).toThrow(InvalidWorkflowTransitionError)
    expect(() => entity.transition(7)).toThrow(InvalidWorkflowStateError)

    expect(entity.toJSON()).toEqual(before)
  })

  it('preserves Workflow terminal-state errors without changing identity or data', () => {
    const entity = FinancialEntity.from(invoiceDefinition, {
      type: 'invoice',
      id: 'inv-42',
      state: 'FINAL',
      data: invoiceData,
    })
    const before = entity.toJSON()

    expect(() => entity.transition('SUBMITTED')).toThrow(WorkflowTerminalStateError)

    expect(entity.toJSON()).toEqual(before)
  })

  it('rejects imported observations with undeclared lifecycle state or conflicting type', () => {
    const callableEntity = Object.assign(() => undefined, {
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: invoiceData,
    })

    expect(() => FinancialEntity.from(invoiceDefinition, null)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.from(invoiceDefinition, [])).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.from(invoiceDefinition, callableEntity)).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.from(invoiceDefinition, {
        type: 'invoice',
        id: 'inv-42',
        state: 'UNKNOWN',
        data: invoiceData,
      }),
    ).toThrow(InvalidWorkflowStateError)

    expect(() =>
      FinancialEntity.from(invoiceDefinition, {
        type: 'payment',
        id: 'inv-42',
        state: 'DRAFT',
        data: invoiceData,
      }),
    ).toThrow(InvalidEntityIdentityError)
  })

  it('rejects uncloneable entity data before creating an observable entity', () => {
    expect(() => FinancialEntity.create(invoiceDefinition, 'inv-42', { uncloneable: () => undefined })).toThrow(
      'Entity data must be observable as portable structured data',
    )
  })

  it('returns defensive serialized observations', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)
    const snapshot = entity.toJSON() as { id: string; state: string; data: { memo: string } }

    snapshot.id = 'changed'
    snapshot.state = 'FINAL'
    snapshot.data.memo = 'changed'

    expect(entity.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: invoiceData,
    })
  })
})
