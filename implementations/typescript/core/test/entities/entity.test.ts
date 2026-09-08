import { describe, expect, it } from 'vitest'
import {
  EntityStateConflictError,
  EntityValidationFailedError,
  FinancialEntity,
  ImmutableEntityError,
  InvalidEntityIdentityError,
  InvalidEntityMutationError,
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
  mutability: {
    DRAFT: ['amount', 'memo', 'deliveryStatus', 'emptyValue', 'falseValue', 'nullValue', 'zeroValue', 'arrayValue', 'objectValue'],
    SUBMITTED: ['memo'],
    FINAL: ['deliveryStatus'],
  },
}

const invoiceData = {
  amount: { amount: '100.00', currency: 'EUR' },
  memo: 'initial',
  deliveryStatus: 'NEW',
}

const validatedInvoiceDefinition = {
  ...invoiceDefinition,
  mutability: {
    ...invoiceDefinition.mutability,
    DRAFT: [...invoiceDefinition.mutability.DRAFT, 'tax'],
  },
  validation: [
    { id: 'AMOUNT_POSITIVE', path: 'amount', rule: 'positive-money' },
    { id: 'TAX_POSITIVE', path: 'tax', rule: 'positive-money' },
  ],
}

const validatedInvoiceData = {
  ...invoiceData,
  tax: { amount: '20.00', currency: 'EUR' },
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

describe('Financial Entity mutability', () => {
  it('mutates one declared mutable field while preserving identity, lifecycle state, and unrelated data', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)

    const mutated = entity.mutate({ memo: 'revised' })

    expect(mutated).not.toBe(entity)
    expect(mutated.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: {
        amount: { amount: '100.00', currency: 'EUR' },
        memo: 'revised',
        deliveryStatus: 'NEW',
      },
    })
    expect(entity.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: invoiceData,
    })
  })

  it('accepts falsey and structured values for declared mutable fields without truthiness validation', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)

    const mutated = entity.mutate({
      emptyValue: '',
      falseValue: false,
      nullValue: null,
      zeroValue: 0,
      arrayValue: [],
      objectValue: {},
    })

    expect(mutated.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: {
        ...invoiceData,
        emptyValue: '',
        falseValue: false,
        nullValue: null,
        zeroValue: 0,
        arrayValue: [],
        objectValue: {},
      },
    })
  })

  it('rejects immutable fields with the portable immutable code and no partial data change', () => {
    const entity = FinancialEntity.from(invoiceDefinition, {
      type: 'invoice',
      id: 'inv-42',
      state: 'SUBMITTED',
      data: invoiceData,
    })
    const before = entity.toJSON()

    expect(() => entity.mutate({ amount: { amount: '200.00', currency: 'EUR' }, memo: 'should-not-stick' })).toThrow(
      ImmutableEntityError,
    )

    expect(entity.toJSON()).toEqual(before)
  })

  it('does not allow identity or lifecycle state to be changed through generic mutation', () => {
    const permissiveDefinition = {
      ...invoiceDefinition,
      mutability: {
        ...invoiceDefinition.mutability,
        DRAFT: [...invoiceDefinition.mutability.DRAFT, 'id', 'type', 'state'],
      },
    }
    const entity = FinancialEntity.create(permissiveDefinition, 'inv-42', invoiceData)
    const before = entity.toJSON()

    expect(() => entity.mutate({ id: 'inv-99' })).toThrow(ImmutableEntityError)
    expect(() => entity.mutate({ state: 'FINAL' })).toThrow(ImmutableEntityError)
    expect(() => entity.mutate({ type: 'payment' })).toThrow(ImmutableEntityError)

    expect(entity.toJSON()).toEqual(before)
  })

  it('rejects unknown or malformed mutation targets without changing the entity', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)
    const before = entity.toJSON()

    expect(() => entity.mutate({ unknownField: 'value' })).toThrow(ImmutableEntityError)
    expect(() => entity.mutate(null)).toThrow(InvalidEntityMutationError)
    expect(() => entity.mutate([])).toThrow(InvalidEntityMutationError)
    expect(() => entity.mutate({})).toThrow(InvalidEntityMutationError)

    expect(entity.toJSON()).toEqual(before)
  })

  it('rejects mutation when entity data is not a field record', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', 'not-field-data')

    expect(() => entity.mutate({ memo: 'revised' })).toThrow(InvalidEntityMutationError)
  })

  it('allows declared terminal-state metadata without making every terminal field mutable', () => {
    const entity = FinancialEntity.from(invoiceDefinition, {
      type: 'invoice',
      id: 'inv-42',
      state: 'FINAL',
      data: invoiceData,
    })

    const mutated = entity.mutate({ deliveryStatus: 'SENT' })

    expect(mutated.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'FINAL',
      data: {
        amount: { amount: '100.00', currency: 'EUR' },
        memo: 'initial',
        deliveryStatus: 'SENT',
      },
    })
    expect(() => entity.mutate({ amount: { amount: '200.00', currency: 'EUR' } })).toThrow(ImmutableEntityError)
  })

  it('defensively snapshots accepted structured mutation values', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)
    const newObject = { nested: 1 }
    const mutated = entity.mutate({ objectValue: newObject })

    newObject.nested = 2

    expect(mutated.toJSON()).toEqual({
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: {
        ...invoiceData,
        objectValue: { nested: 1 },
      },
    })
  })

  it('rejects definitions without per-state mutability declarations', () => {
    expect(() => FinancialEntity.create({ ...invoiceDefinition, mutability: undefined }, 'inv-42', invoiceData)).toThrow(
      InvalidEntityMutationError,
    )
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, mutability: { DRAFT: 'memo', SUBMITTED: ['memo'], FINAL: [] } }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, mutability: { DRAFT: [7], SUBMITTED: ['memo'], FINAL: [] } }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, mutability: { DRAFT: [''], SUBMITTED: ['memo'], FINAL: [] } }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, mutability: { '': ['memo'], DRAFT: ['memo'], SUBMITTED: ['memo'], FINAL: [] } }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create(
        {
          ...invoiceDefinition,
          workflow: { ...invoiceDefinition.workflow, initialState: 'SUBMITTED' },
          mutability: { DRAFT: ['memo'], FINAL: [] },
        },
        'inv-42',
        invoiceData,
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, mutability: { DRAFT: ['memo'] } }, 'inv-42', invoiceData),
    ).not.toThrow()
    expect(() =>
      FinancialEntity.from(
        { ...invoiceDefinition, mutability: { DRAFT: ['memo'] } },
        { type: 'invoice', id: 'inv-42', state: 'FINAL', data: invoiceData },
      ),
    ).toThrow(InvalidEntityMutationError)
  })
})

describe('Financial Entity validation', () => {
  it('returns a complete valid validation result without mutating the entity', () => {
    const entity = FinancialEntity.create(validatedInvoiceDefinition, 'inv-42', validatedInvoiceData)
    const before = entity.toJSON()

    expect(entity.validate()).toEqual({ valid: true, findings: [] })
    expect(entity.toJSON()).toEqual(before)
  })

  it('treats omitted validation declarations as no declared validation rules', () => {
    const entity = FinancialEntity.create(invoiceDefinition, 'inv-42', invoiceData)

    expect(entity.definition.validation).toEqual([])
    expect(entity.validate()).toEqual({ valid: true, findings: [] })
  })

  it('rejects malformed validation declarations without inventing a rule language', () => {
    expect(() => FinancialEntity.create({ ...invoiceDefinition, validation: 'positive-money' }, 'inv-42', invoiceData)).toThrow(
      InvalidEntityMutationError,
    )
    expect(() => FinancialEntity.create({ ...invoiceDefinition, validation: [null] }, 'inv-42', invoiceData)).toThrow(
      InvalidEntityMutationError,
    )
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, validation: [{ id: 'AMOUNT_POSITIVE', path: 'amount', rule: 'unknown' }] }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, validation: [{ id: '', path: 'amount', rule: 'positive-money' }] }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, validation: [{ id: 'AMOUNT_POSITIVE', path: '', rule: 'positive-money' }] }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.create({ ...invoiceDefinition, validation: [{ id: 7, path: 'amount', rule: 'positive-money' }] }, 'inv-42', invoiceData),
    ).toThrow(InvalidEntityMutationError)
  })

  it('rejects invalid initial data with the portable validation code', () => {
    expect(() =>
      FinancialEntity.create(validatedInvoiceDefinition, 'inv-42', {
        ...validatedInvoiceData,
        amount: { amount: '0.00', currency: 'EUR' },
      }),
    ).toThrow(EntityValidationFailedError)

    try {
      FinancialEntity.create(validatedInvoiceDefinition, 'inv-42', {
        ...validatedInvoiceData,
        amount: { amount: '-1.00', currency: 'EUR' },
      })
      throw new Error('Expected validation failure')
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationFailedError)
      expect((error as EntityValidationFailedError).code).toBe('FINKORE_ENTITY_VALIDATION_FAILED')
      expect((error as EntityValidationFailedError).details).toEqual({
        findings: [{ rule: 'AMOUNT_POSITIVE', path: 'amount' }],
      })
    }
  })

  it('evaluates the complete proposed mutation result before any change becomes observable', () => {
    const entity = FinancialEntity.create(validatedInvoiceDefinition, 'inv-42', validatedInvoiceData)
    const before = entity.toJSON()

    expect(() =>
      entity.mutate({
        amount: { amount: '-1.00', currency: 'EUR' },
        tax: { amount: '0.00', currency: 'EUR' },
        memo: 'should-not-stick',
      }),
    ).toThrow(EntityValidationFailedError)

    expect(entity.toJSON()).toEqual(before)
  })

  it('collects every validation finding in declaration order', () => {
    const entity = FinancialEntity.create(validatedInvoiceDefinition, 'inv-42', validatedInvoiceData)

    try {
      entity.mutate({
        amount: { amount: '-1.00', currency: 'EUR' },
        tax: { amount: '0.00', currency: 'EUR' },
      })
      throw new Error('Expected validation failure')
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationFailedError)
      expect((error as EntityValidationFailedError).details).toEqual({
        findings: [
          { rule: 'AMOUNT_POSITIVE', path: 'amount' },
          { rule: 'TAX_POSITIVE', path: 'tax' },
        ],
      })
    }
  })

  it('distinguishes falsey mutable values from missing or non-positive Money validation values', () => {
    const falseyDefinition = {
      ...invoiceDefinition,
      validation: [{ id: 'AMOUNT_POSITIVE', path: 'amount', rule: 'positive-money' }],
    }
    const entity = FinancialEntity.create(falseyDefinition, 'inv-42', invoiceData)

    expect(entity.mutate({ emptyValue: '' }).validate()).toEqual({ valid: true, findings: [] })
    expect(entity.mutate({ falseValue: false }).validate()).toEqual({ valid: true, findings: [] })
    expect(entity.mutate({ nullValue: null }).validate()).toEqual({ valid: true, findings: [] })
    expect(entity.mutate({ zeroValue: 0 }).validate()).toEqual({ valid: true, findings: [] })

    expect(() => entity.mutate({ amount: undefined })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: null })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: false })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: 0 })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: '' })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: { amount: 'not-decimal', currency: 'EUR' } })).toThrow(EntityValidationFailedError)
    expect(() => entity.mutate({ amount: { amount: '1.00' } })).toThrow(EntityValidationFailedError)
    expect(() => FinancialEntity.create(falseyDefinition, 'inv-42', null)).toThrow(EntityValidationFailedError)
  })

  it('rejects invalid imported observations without changing identity or lifecycle semantics', () => {
    const valid = FinancialEntity.from(validatedInvoiceDefinition, {
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: validatedInvoiceData,
    })

    expect(valid.id).toBe('inv-42')
    expect(valid.state).toBe('DRAFT')
    expect(() =>
      FinancialEntity.from(validatedInvoiceDefinition, {
        type: 'invoice',
        id: 'inv-42',
        state: 'DRAFT',
        data: { ...validatedInvoiceData, amount: { amount: '-1.00', currency: 'EUR' } },
      }),
    ).toThrow(EntityValidationFailedError)
  })
})
