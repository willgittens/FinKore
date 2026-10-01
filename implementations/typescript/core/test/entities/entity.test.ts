// SPDX-License-Identifier: MPL-2.0
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

describe('Financial Entity cross-field validation', () => {
  const definition = {
    ...invoiceDefinition,
    mutability: { ...invoiceDefinition.mutability, DRAFT: ['amount', 'limit', 'memo'] },
    validation: [{ id: 'WITHIN_LIMIT', path: 'amount', otherPath: 'limit', rule: 'money-not-greater-than' }],
  }
  const money = (amount: string, currency = 'EUR') => ({ amount, currency })

  it.each([
    ['10', { amount: money('20'), limit: money('20') }],
    ['20', { limit: money('10'), amount: money('10') }],
  ])('validates a paired update from %s against the complete proposed result', (initial, changes) => {
    const entity = FinancialEntity.create(definition, 'inv-42', { amount: money(initial), limit: money(initial) })
    const before = entity.toJSON()
    expect(entity.mutate(changes).toJSON().data).toEqual(changes)
    expect(entity.toJSON()).toEqual(before)
  })

  it.each([
    { amount: money('30'), limit: money('20'), memo: 'must-not-stick' },
    { amount: money('21') },
    { limit: money('9') },
    { amount: money('20.000000000000000000001') },
    { amount: money('1', 'USD') },
    { amount: null },
    { limit: { amount: 'invalid', currency: 'EUR' } },
  ])('rejects invalid proposals without modifying the original entity: %j', (changes) => {
    const entity = FinancialEntity.create(definition, 'inv-42', { amount: money('10'), limit: money('20'), memo: 'original' })
    const before = entity.toJSON()
    expect(() => entity.mutate(changes)).toThrowError(expect.objectContaining({
      code: 'FINKORE_ENTITY_VALIDATION_FAILED',
      details: { findings: [{ rule: 'WITHIN_LIMIT', path: 'amount' }] },
    }))
    expect(entity.toJSON()).toEqual(before)
  })

  it.each([
    ['10', '20'], ['20.00', '20.0'], ['0', '0'], ['-2', '-1'],
  ])('uses exact ordering without imposing positivity: %s <= %s', (amount, limit) => {
    const data = { amount: money(amount), limit: money(limit) }
    expect(FinancialEntity.create(definition, 'inv-42', data).toJSON().data).toEqual(data)
  })

  it('validates a partial update with its retained peer field', () => {
    const entity = FinancialEntity.create(definition, 'inv-42', { amount: money('10'), limit: money('20') })
    expect(entity.mutate({ amount: money('15') }).toJSON().data).toEqual({ amount: money('15'), limit: money('20') })
    expect(entity.toJSON().data).toEqual({ amount: money('10'), limit: money('20') })
  })

  it('rejects a missing peer value with a safe finding', () => {
    expect(() => FinancialEntity.create(definition, 'inv-42', { amount: money('10') }))
      .toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }))
  })

  it.each([undefined, null, '', 7])('requires a declared peer path: %j', (otherPath) => {
    expect(() => FinancialEntity.create({
      ...definition,
      validation: [{ id: 'WITHIN_LIMIT', path: 'amount', otherPath, rule: 'money-not-greater-than' }],
    }, 'inv-42', { amount: money('10'), limit: money('20') })).toThrow(InvalidEntityMutationError)
  })
})

describe('Financial Entity identity and lifecycle', () => {
  it('rejects null import identities and revisions with the portable identity error', () => {
    const entity = { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData }
    const sourceIdentity = { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-42' }
    const identityMapping = { mappingId: 'mapping-42', ...sourceIdentity, entity: { type: 'invoice', id: 'inv-42' } }
    const inputs = [
      { entity, sourceIdentity: null, identityMapping },
      { entity, sourceIdentity, identityMapping: null },
      { entity, sourceIdentity, identityMapping: { ...identityMapping, entity: null } },
      { entity, currentRevision: null },
      { entity, historicalRevisions: [null] },
    ]
    for (const input of inputs) {
      const before = structuredClone(input)
      expect(() => FinancialEntity.import(invoiceDefinition, input)).toThrowError(
        expect.objectContaining({ code: 'FINKORE_ENTITY_INVALID_IDENTITY' }),
      )
      expect(input).toEqual(before)
    }
  })

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
    expect(() => entity.transition('UNKNOWN')).toThrow(InvalidWorkflowStateError)
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
      expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }),
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

  it('rejects non-object data before an Entity can be observed or mutated', () => {
    expect(() => FinancialEntity.create(invoiceDefinition, 'inv-42', 'not-field-data')).toThrow(EntityValidationFailedError)
    expect(() => FinancialEntity.from(invoiceDefinition, { type: 'invoice', id: 'inv-42', state: 'DRAFT', data: 'not-field-data' })).toThrow(EntityValidationFailedError)
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
    ).toThrow(InvalidEntityMutationError)
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

    expect(() => entity.mutate({ amount: undefined })).toThrow(InvalidEntityMutationError)
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

describe('Financial Entity import', () => {
  it('reuses mapping-only versioned imports without synthesizing Source Identity', () => {
    const binding = { definitionIdentity: 'invoice flow ', definitionVersionIdentity: ' v1' }
    const definition = { ...invoiceDefinition, workflow: { ...invoiceDefinition.workflow, ...binding } }
    const entity = FinancialEntity.create(definition, 'inv-42', invoiceData).toJSON()
    const identityMapping = { mappingId: ' map:42 ', sourceSystem: ' legacy ', sourceId: ' 00042 ', entity: { type: entity.type, id: entity.id } }
    const input = { entity, identityMapping, currentRevision: 'rev-2', historicalRevisions: ['rev-1'], conflictVersion: 'token-3' }
    const before = structuredClone(input)
    const imported = FinancialEntity.import(definition, input)
    expect(imported).toEqual({ entity, identityMapping, currentRevision: { ...identityMapping.entity, revision: 'rev-2', current: true }, historicalRevisions: [{ ...identityMapping.entity, revision: 'rev-1', current: false }], conflictVersion: 'token-3' })
    expect(FinancialEntity.import(definition, imported)).toEqual(imported)
    expect(FinancialEntity.from(definition, imported.entity).mutate({ memo: 'updated' }).transition('SUBMITTED').toJSON()).toEqual({ ...entity, state: 'SUBMITTED', data: { ...invoiceData, memo: 'updated' } })
    expect(input).toEqual(before)
    for (const sourceIdentity of [null, [], '', 1, false, {}, { sourceSystem: ' legacy ' }, { sourceId: ' 00042 ' }, { sourceSystem: 'other', sourceId: ' 00042 ' }]) {
      const invalid = { ...input, sourceIdentity }
      const preserved = structuredClone(invalid)
      expect(() => FinancialEntity.import(definition, invalid)).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_INVALID_IDENTITY' }))
      expect(invalid).toEqual(preserved)
    }
    for (const identityMapping of [null, {}, { ...input.identityMapping, mappingId: '' }, { ...input.identityMapping, sourceSystem: '' }, { ...input.identityMapping, sourceId: '' }, { ...input.identityMapping, entity: { type: 'other', id: entity.id } }, { ...input.identityMapping, entity: { type: entity.type, id: 'other' } }]) {
      expect(() => FinancialEntity.import(definition, { ...input, identityMapping })).toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_INVALID_IDENTITY' }))
    }
  })

  it('applies declared positive-money and cross-field validators without mutating source input', () => {
    const definition = {
      ...invoiceDefinition,
      mutability: { ...invoiceDefinition.mutability, DRAFT: ['amount', 'limit'] },
      validation: [
        { id: 'AMOUNT_POSITIVE', path: 'amount', rule: 'positive-money' },
        { id: 'WITHIN_LIMIT', path: 'amount', otherPath: 'limit', rule: 'money-not-greater-than' },
      ],
    }
    const money = (amount: string) => ({ amount, currency: 'EUR' })
    const envelope = (amount: string, limit: string) => ({
      entity: {
        type: 'invoice',
        id: 'inv-42',
        state: 'DRAFT',
        data: { amount: money(amount), limit: money(limit) },
      },
    })

    expect(FinancialEntity.import(definition, envelope('10', '20')).entity.data).toEqual({
      amount: money('10'),
      limit: money('20'),
    })

    for (const input of [envelope('0', '20'), envelope('21', '20')]) {
      const before = structuredClone(input)
      expect(() => FinancialEntity.import(definition, input)).toThrowError(
        expect.objectContaining({ code: 'FINKORE_ENTITY_VALIDATION_FAILED' }),
      )
      expect(input).toEqual(before)
    }
  })

  it('imports a minimal observation without optional revision, mapping, or conflict fields', () => {
    const result = FinancialEntity.import(invoiceDefinition, {
      entity: {
        type: 'invoice',
        id: 'inv-42',
        state: 'SUBMITTED',
        data: invoiceData,
      },
    })

    expect(result).toEqual({
      entity: {
        type: 'invoice',
        id: 'inv-42',
        state: 'SUBMITTED',
        data: invoiceData,
      },
      historicalRevisions: [],
    })
    expect(Object.hasOwn(result, 'currentRevision')).toBe(false)
    expect(Object.hasOwn(result, 'identityMapping')).toBe(false)
    expect(Object.hasOwn(result, 'conflictVersion')).toBe(false)
  })

  it('preserves supplied entity identity, revision history, mapping evidence, and conflict version', () => {
    const result = FinancialEntity.import(invoiceDefinition, {
      entity: {
        type: 'invoice',
        id: 'inv-42',
        state: 'SUBMITTED',
        data: invoiceData,
      },
      currentRevision: { type: 'invoice', id: 'inv-42', revision: 'business-rev-2' },
      historicalRevisions: [{ type: 'invoice', id: 'inv-42', revision: 'business-rev-1' }],
      sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
      identityMapping: {
        mappingId: 'map-legacy-ar-42',
        sourceSystem: 'legacy-ar',
        sourceId: 'LEGACY-000042',
        entity: { type: 'invoice', id: 'inv-42' },
      },
      conflictVersion: 'storage-token-9',
      expectedState: 'SUBMITTED',
      expectedRevision: 'business-rev-2',
      expectedConflictVersion: 'storage-token-9',
    })

    expect(result).toEqual({
      entity: {
        type: 'invoice',
        id: 'inv-42',
        state: 'SUBMITTED',
        data: invoiceData,
      },
      currentRevision: { type: 'invoice', id: 'inv-42', revision: 'business-rev-2', current: true },
      historicalRevisions: [{ type: 'invoice', id: 'inv-42', revision: 'business-rev-1', current: false }],
      identityMapping: {
        mappingId: 'map-legacy-ar-42',
        sourceSystem: 'legacy-ar',
        sourceId: 'LEGACY-000042',
        entity: { type: 'invoice', id: 'inv-42' },
      },
      conflictVersion: 'storage-token-9',
    })
  })

  it('requires source identity mapping to match the imported FinKore identity', () => {
    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
        identityMapping: {
          mappingId: 'map-legacy-ar-42',
          sourceSystem: 'legacy-ar',
          sourceId: 'LEGACY-000042',
          entity: { type: 'invoice', id: 'LEGACY-000042' },
        },
      }),
    ).toThrow(InvalidEntityIdentityError)

    for (const identityMapping of [
      {
        mappingId: 'map-legacy-ar-42',
        sourceSystem: 'other-system',
        sourceId: 'LEGACY-000042',
        entity: { type: 'invoice', id: 'inv-42' },
      },
      {
        mappingId: 'map-legacy-ar-42',
        sourceSystem: 'legacy-ar',
        sourceId: 'OTHER-ID',
        entity: { type: 'invoice', id: 'inv-42' },
      },
      {
        mappingId: 'map-legacy-ar-42',
        sourceSystem: 'legacy-ar',
        sourceId: 'LEGACY-000042',
        entity: { type: 'payment', id: 'inv-42' },
      },
    ]) {
      expect(() =>
        FinancialEntity.import(invoiceDefinition, {
          entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
          sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
          identityMapping,
        }),
      ).toThrow(InvalidEntityIdentityError)
    }

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: 'legacy-ar:LEGACY-000042',
        identityMapping: {
          mappingId: 'map-legacy-ar-42',
          sourceSystem: 'legacy-ar',
          sourceId: 'LEGACY-000042',
          entity: { type: 'invoice', id: 'inv-42' },
        },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
        identityMapping: 'map-legacy-ar-42',
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'LEGACY-000042' },
        identityMapping: {
          mappingId: 'map-legacy-ar-42',
          sourceSystem: 'legacy-ar',
          sourceId: 'LEGACY-000042',
          entity: 'inv-42',
        },
      }),
    ).toThrow(InvalidEntityIdentityError)
  })

  it('rejects conflicting or duplicate business revision observations', () => {
    expect(
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: { type: 'invoice', id: 'inv-42', revision: 'business-rev-2', current: true },
      }).currentRevision,
    ).toEqual({ type: 'invoice', id: 'inv-42', revision: 'business-rev-2', current: true })

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: 7,
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: { type: 'invoice', id: 'other-entity', revision: 'business-rev-2' },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: 'business-rev-2',
        historicalRevisions: ['business-rev-2'],
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: 'same-token',
        conflictVersion: 'same-token',
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: { type: 'payment', id: 'inv-42', revision: 'business-rev-2' },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: { type: 'invoice', id: 'inv-42', revision: 'inv-42' },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        currentRevision: { type: 'invoice', id: 'inv-42', revision: 'business-rev-2', current: false },
      }),
    ).toThrow(InvalidEntityIdentityError)

    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        historicalRevisions: { revision: 'business-rev-1' },
      }),
    ).toThrow(InvalidEntityIdentityError)
  })

  it('checks expected state, business revision, and conflict version without returning partial import results', () => {
    const input = {
      entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
      currentRevision: 'business-rev-2',
      conflictVersion: 'storage-token-9',
    }

    expect(() => FinancialEntity.import(invoiceDefinition, { ...input, expectedState: 'DRAFT' })).toThrow(EntityStateConflictError)
    expect(() => FinancialEntity.import(invoiceDefinition, { ...input, expectedRevision: 'business-rev-1' })).toThrow(
      EntityStateConflictError,
    )
    expect(() => FinancialEntity.import(invoiceDefinition, { ...input, expectedConflictVersion: 'storage-token-8' })).toThrow(
      EntityStateConflictError,
    )
    expect(() =>
      FinancialEntity.import(invoiceDefinition, {
        entity: input.entity,
        expectedRevision: 'business-rev-2',
      }),
    ).toThrow(EntityStateConflictError)
    expect(FinancialEntity.import(invoiceDefinition, { entity: input.entity, conflictVersion: 'storage-token-9' })).toEqual({
      entity: input.entity,
      historicalRevisions: [],
      conflictVersion: 'storage-token-9',
    })
    expect(FinancialEntity.import(invoiceDefinition, { entity: input.entity, currentRevision: 'business-rev-2' })).toEqual({
      entity: input.entity,
      currentRevision: { type: 'invoice', id: 'inv-42', revision: 'business-rev-2', current: true },
      historicalRevisions: [],
    })
  })

  it('rejects malformed import envelopes and invalid imported entity observations', () => {
    expect(() => FinancialEntity.import(invoiceDefinition, null)).toThrow(InvalidEntityIdentityError)
    expect(() => FinancialEntity.import(invoiceDefinition, {})).toThrow(InvalidEntityIdentityError)
    expect(() =>
      FinancialEntity.import(
        { ...invoiceDefinition, mutability: { DRAFT: ['memo'] } },
        { entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData } },
      ),
    ).toThrow(InvalidEntityMutationError)
    expect(() =>
      FinancialEntity.import(validatedInvoiceDefinition, {
        entity: {
          type: 'invoice',
          id: 'inv-42',
          state: 'SUBMITTED',
          data: { ...validatedInvoiceData, amount: { amount: '-1.00', currency: 'EUR' } },
        },
      }),
    ).toThrow(EntityValidationFailedError)
  })

  it('does not expose sensitive source identity values in default import errors', () => {
    try {
      FinancialEntity.import(invoiceDefinition, {
        entity: { type: 'invoice', id: 'inv-42', state: 'SUBMITTED', data: invoiceData },
        sourceIdentity: { sourceSystem: 'legacy-ar', sourceId: 'SECRET-LEGACY-ID' },
        identityMapping: {
          mappingId: 'map-legacy-ar-42',
          sourceSystem: 'legacy-ar',
          sourceId: 'SECRET-LEGACY-ID',
          entity: { type: 'invoice', id: 'other-entity' },
        },
      })
      throw new Error('Expected invalid identity')
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEntityIdentityError)
      expect((error as InvalidEntityIdentityError).details).toBeUndefined()
      expect(String((error as InvalidEntityIdentityError).message)).not.toContain('SECRET-LEGACY-ID')
    }
  })
})
