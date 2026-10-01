// SPDX-License-Identifier: MPL-2.0
import { expect, it as test } from 'vitest'
import { isDeepStrictEqual } from 'node:util'
import { FinancialEntity, FinKoreEntityError } from '../../src/index.js'

function it(name: string, action: () => void): void {
  test(name, () => {
    try { action() } catch (error) {
      if (error instanceof FinKoreEntityError) expect.fail(`Unexpected Entity rejection: ${error.code}`)
      throw error
    }
  })
}

const definition = {
  type: 'invoice', identityScope: 'tenant',
  workflow: { states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: [], transitions: [{ source: 'DRAFT', target: 'DONE' }] },
  mutability: { DRAFT: ['memo', 'other'], DONE: [] },
}
const observed = (data: unknown) => ({ type: 'invoice', id: 'i', state: 'DRAFT', data })
const unsupported: readonly [string, () => unknown][] = [
  ['undefined', () => undefined], ['bigint', () => 1n], ['nan', () => NaN],
  ['infinity', () => Infinity], ['negative-infinity', () => -Infinity],
  ['boxed-number', () => Object(1)], ['date', () => new Date(0)], ['map', () => new Map()],
  ['set', () => new Set()], ['regexp', () => /x/], ['typed-array', () => new Uint8Array([1])],
  ['function', () => () => 1], ['symbol', () => Symbol('value')],
  ['instance', () => new (class Value { value = 1 })()],
  ['array-cycle', () => { const a: unknown[] = []; a.push(a); return a }],
  ['object-cycle', () => { const a: Record<string, unknown> = {}; a.self = a; return a }],
  ['sparse-array', () => [1, , 2]], ['symbol-member', () => ({ [Symbol('member')]: 1 })],
  ['own-undefined', () => ({ ['__proto__']: undefined })],
]
function result(action: () => unknown): unknown {
  try { return { status: 'success', value: action() } } catch (error) {
    if (!(error instanceof FinKoreEntityError)) throw error
    return { status: 'error', code: error.code }
  }
}
for (const [name, make] of unsupported) for (const boundary of ['create', 'from', 'import', 'current-mutate', 'current-transition', 'proposed'] as const) {
  it(`entity-value097 rejects ${name} at ${boundary}`, () => {
    const value = make()
    const data = { memo: { nested: [value] } }
    const entity = observed(data)
    const retained = FinancialEntity.create(definition, 'i', { memo: 1 })
    const before = retained.toJSON()
    const action = () => {
      if (boundary === 'create') return FinancialEntity.create(definition, 'i', data)
      if (boundary === 'from') return FinancialEntity.from(definition, entity)
      if (boundary === 'import') return FinancialEntity.import(definition, { entity })
      if (boundary === 'current-mutate') return FinancialEntity.from(definition, entity).mutate({ memo: 1 })
      if (boundary === 'current-transition') return FinancialEntity.from(definition, entity).transition('DONE')
      return retained.mutate(data)
    }
    expect(result(action)).toStrictEqual({ status: 'error', code: boundary === 'proposed'
      ? 'FINKORE_ENTITY_INVALID_MUTATION' : 'FINKORE_ENTITY_VALIDATION_FAILED' })
    expect(data.memo.nested[0]).toBe(value)
    expect(retained.toJSON()).toStrictEqual(before)
    expect(retained.mutate({ memo: 2 }).toJSON()).toStrictEqual(observed({ memo: 2 }))
  })
}
it('entity-value097 owns shared data and exact observations across reuse', () => {
  const child = { values: [null, false, 0, -0, 1.25, '', 'value'], ['__proto__']: { constructor: 1 } }
  const data = { memo: child, other: child }
  const expected = structuredClone(observed(data))
  const retained = FinancialEntity.create(definition, 'i', data)
  child.values.push(99)
  const view = retained.toJSON()
  ;(view.data as typeof data).memo.values.push(88)
  expect(isDeepStrictEqual(retained.toJSON(), expected)).toBe(true)
  const imported = FinancialEntity.import(definition, { entity: retained.toJSON() })
  expect(isDeepStrictEqual(imported.entity, expected)).toBe(true)
  const changed = FinancialEntity.from(definition, imported.entity).mutate({ memo: { exact: 1.25 } })
  const transitioned = changed.transition('DONE').toJSON()
  expect(isDeepStrictEqual(transitioned, { ...expected, state: 'DONE', data: { ...expected.data, memo: { exact: 1.25 } } })).toBe(true)
  expect(isDeepStrictEqual(retained.toJSON(), expected)).toBe(true)
})
it('entity-value097 scalar control', () => {
  expect(FinancialEntity.create(definition, 'i', { memo: 1 }).toJSON()).toStrictEqual(observed({ memo: 1 }))
})
it('entity-value097 captures proposed input independently', () => {
  const original = FinancialEntity.create(definition, 'i', { memo: 1 })
  const changes = { memo: { nested: [1.25] } }
  const changed = original.mutate(changes)
  changes.memo.nested[0] = 9
  expect(changed.toJSON()).toStrictEqual(observed({ memo: { nested: [1.25] } }))
  expect(original.toJSON()).toStrictEqual(observed({ memo: 1 }))
})
it('entity-value097 indexes arrays without trusting caller iteration', () => {
  const values = [undefined]
  Object.defineProperty(values, Symbol.iterator, { value: function* () { yield 1 } })
  expect(result(() => FinancialEntity.create(definition, 'i', { memo: values })))
    .toStrictEqual({ status: 'error', code: 'FINKORE_ENTITY_VALIDATION_FAILED' })
})
it('entity-value097 preserves earlier Workflow and mutability failures', () => {
  expect(result(() => FinancialEntity.create(definition, '', { memo: new Map() })))
    .toStrictEqual({ status: 'error', code: 'FINKORE_ENTITY_INVALID_IDENTITY' })
  expect(() => FinancialEntity.from(definition, { ...observed({ memo: new Map() }), state: '' }))
    .toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_INSTANCE' }))
  const entity = FinancialEntity.create(definition, 'i', { memo: 1 }).transition('DONE')
  expect(() => entity.mutate({ memo: new Map() }))
    .toThrowError(expect.objectContaining({ code: 'FINKORE_ENTITY_IMMUTABLE' }))
  expect(entity.toJSON()).toStrictEqual({ ...observed({ memo: 1 }), state: 'DONE' })
})
it('entity-value097 supports null-prototype data with own names', () => {
  const data = Object.create(null) as Record<string, unknown>
  data['__proto__'] = { constructor: 1 }
  expect(isDeepStrictEqual(FinancialEntity.create(definition, 'i', data).toJSON().data, { ['__proto__']: { constructor: 1 } })).toBe(true)
})
it('entity-value097 never validates inherited application facts', () => {
  const inheritedPath = 'd9InheritedMoney'
  const money = { amount: '1.00', currency: 'EUR' }
  const governed = { ...definition, validation: [{ id: 'positive', rule: 'positive-money', path: inheritedPath }] }
  Object.defineProperty(Object.prototype, inheritedPath, { configurable: true, value: money })
  try {
    expect(result(() => FinancialEntity.create(governed, 'i', { memo: 1 })))
      .toStrictEqual({ status: 'error', code: 'FINKORE_ENTITY_VALIDATION_FAILED' })
    expect(result(() => FinancialEntity.from(governed, observed({ memo: 1 }))))
      .toStrictEqual({ status: 'error', code: 'FINKORE_ENTITY_VALIDATION_FAILED' })
    expect(FinancialEntity.create(governed, 'i', { [inheritedPath]: money }).toJSON())
      .toStrictEqual(observed({ [inheritedPath]: money }))
  } finally {
    Reflect.deleteProperty(Object.prototype, inheritedPath)
  }
})
