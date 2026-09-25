// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { boundedCycle } from './cyclic-fixture.js'
import { deepStrictEqual as assertJson } from 'node:assert/strict'
import { AuditChange, AuditEvent, AuditLog, InvalidAuditEventError } from '../../src/index.js'

const eventBase = {
  eventId: 'evt-1042',
  eventType: 'ENTITY_SUBMITTED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-7' },
  occurredAt: '2026-09-01T12:00:00Z',
}

describe('Audit changes', () => {
  it('represents one valid change with field identity and before/after direction', () => {
    const change = AuditChange.from({ path: 'state', before: 'DRAFT', after: 'SUBMITTED' })

    expect(change.toJSON()).toEqual({ path: 'state', before: 'DRAFT', after: 'SUBMITTED' })
  })

  it('preserves explicit null separately from an absent prior value marker', () => {
    const change = AuditChange.from({ path: 'externalRef', before: { presence: 'ABSENT' }, after: null })

    expect(change.toJSON()).toEqual({ path: 'externalRef', before: { presence: 'ABSENT' }, after: null })
  })

  it('preserves omitted before and after members without manufacturing nulls or rejecting one-sided values', () => {
    const beforeOnly = AuditChange.from({ path: 'externalRef', before: { presence: 'ABSENT' } }).toJSON()
    const afterOnly = AuditChange.from({ path: 'externalRef', after: null }).toJSON()

    expect(beforeOnly).toEqual({ path: 'externalRef', before: { presence: 'ABSENT' } })
    expect('after' in beforeOnly).toBe(false)
    expect(afterOnly).toEqual({ path: 'externalRef', after: null })
    expect('before' in afterOnly).toBe(false)
  })

  it('preserves multiple changes, including duplicate paths, without collapsing them', () => {
    const event = AuditEvent.from({
      ...eventBase,
      changes: [
        { path: 'amount', before: '100.00', after: '120.00' },
        { path: 'amount', before: '120.00', after: '130.00' },
      ],
    })

    expect(event.toJSON().changes).toEqual([
      { path: 'amount', before: '100.00', after: '120.00' },
      { path: 'amount', before: '120.00', after: '130.00' },
    ])
  })

  it('accepts unequal scalar values without treating them as unchanged', () => {
    expect(AuditChange.from({ path: 'count', before: 1, after: 2 }).toJSON()).toEqual({
      path: 'count',
      before: 1,
      after: 2,
    })
    expect(AuditChange.from({ path: 'approved', before: false, after: true }).toJSON()).toEqual({
      path: 'approved',
      before: false,
      after: true,
    })
  })

  it('keeps Boolean and numeric ordinary JSON values distinct recursively', () => {
    for (const change of [
      { path: 'approved', before: true, after: 1 },
      { path: 'approved', before: 0, after: false },
      { path: 'review', before: { checks: [true, { manual: false }] }, after: { checks: [1, { manual: 0 }] } },
    ]) {
      expect(AuditChange.from(change).toJSON()).toEqual(change)
    }
  })

  it('uses explicit Money declarations for exact domain equality and preserves the declaration', () => {
    expect(() => AuditChange.from({
      path: 'amount',
      valueType: 'MONEY',
      before: { amount: '10.0', currency: 'EUR' },
      after: { amount: '10.00', currency: 'EUR' },
    })).toThrow(InvalidAuditEventError)

    const changed = {
      path: 'amount',
      valueType: 'MONEY',
      before: { amount: '10.00', currency: 'EUR' },
      after: { amount: '11.00', currency: 'EUR' },
    }
    expect(AuditChange.from(changed).toJSON()).toEqual(changed)
    expect(() => AuditChange.from({ ...changed, before: { amount: 10, currency: 'EUR' } })).toThrow(InvalidAuditEventError)
  })

  it('preserves Money null and absence distinctions while validating supplied values', () => {
    const beforeNull = { path: 'amount', valueType: 'MONEY' as const, before: null }
    const afterNull = { path: 'amount', valueType: 'MONEY' as const, after: null }

    expect(AuditChange.from(beforeNull).toJSON()).toEqual(beforeNull)
    expect(AuditChange.from(afterNull).toJSON()).toEqual(afterNull)
    expect(AuditChange.from({
      path: 'amount',
      valueType: 'MONEY',
      before: null,
      after: { amount: '0.00', currency: 'EUR' },
    }).toJSON()).toEqual({
      path: 'amount',
      valueType: 'MONEY',
      before: null,
      after: { amount: '0.00', currency: 'EUR' },
    })
    expect(() => AuditChange.from({ path: 'amount', valueType: 'MONEY', before: null, after: null })).toThrow(
      InvalidAuditEventError,
    )
    expect(() => AuditChange.from({ path: 'amount', valueType: 'MONEY', before: { amount: 10, currency: 'EUR' } })).toThrow(
      InvalidAuditEventError,
    )
    expect(() => AuditChange.from({ path: 'amount', valueType: 'DECIMAL', before: '10', after: '11' })).toThrow(
      InvalidAuditEventError,
    )
  })

  it('uses JSON numeric equality including signed zero', () => {
    expect(() => AuditChange.from({ path: 'count', before: -0, after: 0 })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'count', before: 12.5, after: 12.5 })).toThrow(InvalidAuditEventError)
  })

  it('accepts unequal arrays and records without treating shape differences as equality', () => {
    expect(AuditChange.from({ path: 'tags', before: [], after: ['travel'] }).toJSON()).toEqual({
      path: 'tags',
      before: [],
      after: ['travel'],
    })
    expect(AuditChange.from({ path: 'tags', before: ['travel'], after: [] }).toJSON()).toEqual({
      path: 'tags',
      before: ['travel'],
      after: [],
    })
    expect(AuditChange.from({ path: 'tags', before: [], after: { value: [] } }).toJSON()).toEqual({
      path: 'tags',
      before: [],
      after: { value: [] },
    })
    expect(AuditChange.from({ path: 'tags', before: { value: [] }, after: [] }).toJSON()).toEqual({
      path: 'tags',
      before: { value: [] },
      after: [],
    })
    expect(AuditChange.from({ path: 'allocation', before: { amount: '100.00' }, after: { amount: '100.00', currency: 'USD' } }).toJSON()).toEqual({
      path: 'allocation',
      before: { amount: '100.00' },
      after: { amount: '100.00', currency: 'USD' },
    })
    expect(AuditChange.from({ path: 'count', before: { value: 0 }, after: 0 }).toJSON()).toEqual({
      path: 'count',
      before: { value: 0 },
      after: 0,
    })
    expect(AuditChange.from({ path: 'count', before: 0, after: { value: 0 } }).toJSON()).toEqual({
      path: 'count',
      before: 0,
      after: { value: 0 },
    })
  })

  it('preserves structured values defensively without interpreting domain semantics', () => {
    const input = {
      path: 'allocation',
      before: { lines: [{ account: 'travel', amount: { amount: '100.00', currency: 'USD' } }] },
      after: { lines: [{ account: 'travel', amount: { amount: '125.00', currency: 'USD' } }] },
    }
    const change = AuditChange.from(input)

    input.after.lines[0].amount.amount = '999.00'
    const snapshot = change.toJSON() as { after: { lines: [{ amount: { amount: string } }] } }
    snapshot.after.lines[0].amount.amount = '888.00'

    expect(change.toJSON()).toEqual({
      path: 'allocation',
      before: { lines: [{ account: 'travel', amount: { amount: '100.00', currency: 'USD' } }] },
      after: { lines: [{ account: 'travel', amount: { amount: '125.00', currency: 'USD' } }] },
    })
  })

  it('rejects malformed changes and values outside the portable JSON data model', () => {
    expect(() => AuditChange.from(null)).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ before: 'DRAFT', after: 'SUBMITTED' })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: '', before: 'DRAFT', after: 'SUBMITTED' })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'callback', before: 'missing', after: () => undefined })).toThrow(
      InvalidAuditEventError,
    )
    expect(() => AuditChange.from({ path: 'undefined', before: undefined })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'bigint', before: 1n })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'date', before: new Date('2026-09-01T12:00:00Z') })).toThrow(
      InvalidAuditEventError,
    )
    expect(() => AuditChange.from({ path: 'nan', before: Number.NaN })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'infinity', after: Number.NEGATIVE_INFINITY })).toThrow(InvalidAuditEventError)

    const symbolValue = { value: 'visible', [Symbol('private')]: true }
    expect(() => AuditChange.from({ path: 'symbol', before: symbolValue })).toThrow(InvalidAuditEventError)

    const cyclicArray = boundedCycle(true)
    // Keep mutant failures compact instead of formatting a recursive error trace.
    let cycleFailure0: unknown
    try { AuditChange.from({ path: 'cycle', before: cyclicArray }) } catch (error) { cycleFailure0 = error }
    expect(cycleFailure0 instanceof InvalidAuditEventError).toBe(true)
    expect((cycleFailure0 as InvalidAuditEventError).code).toBe('FINKORE_AUDIT_INVALID_EVENT')

    // Bound the defective traversal first, then retain ordinary cyclic inputs.
    const ordinaryArray: unknown[] = []
    ordinaryArray.push(ordinaryArray)
    expect(() => AuditChange.from({ path: 'cycle', before: ordinaryArray })).toThrow(InvalidAuditEventError)

    const cyclicObject = boundedCycle(false)
    // Keep mutant failures compact instead of formatting a recursive error trace.
    let cycleFailure1: unknown
    try { AuditChange.from({ path: 'cycle', after: cyclicObject }) } catch (error) { cycleFailure1 = error }
    expect(cycleFailure1 instanceof InvalidAuditEventError).toBe(true)
    expect((cycleFailure1 as InvalidAuditEventError).code).toBe('FINKORE_AUDIT_INVALID_EVENT')
    const ordinaryObject: Record<string, unknown> = {}
    ordinaryObject.self = ordinaryObject
    expect(() => AuditChange.from({ path: 'cycle', after: ordinaryObject })).toThrow(InvalidAuditEventError)
  })

  it('accepts portable null-prototype and shared JSON values without retaining references', () => {
    const shared = { value: true }
    const before = Object.create(null) as Record<string, unknown>
    before.values = [null, 'text', false, 1.5, shared, shared]
    const change = AuditChange.from({ path: 'details', before, after: { values: [] } })
    const serialized = change.toJSON() as { before: { values: unknown[] } }

    expect(serialized.before).toEqual({ values: [null, 'text', false, 1.5, { value: true }, { value: true }] })
    expect(Object.getPrototypeOf(serialized.before)).toBe(Object.prototype)
    expect(serialized.before.values[4]).not.toBe(shared)
  })

  it('rejects changes that claim equal before and after domain values changed', () => {
    for (const change of [
      { path: 'state', before: 'DRAFT', after: 'DRAFT' },
      { path: 'approved', before: false, after: false },
      { path: 'count', before: 0, after: 0 },
      { path: 'externalRef', before: null, after: null },
      { path: 'tags', before: [], after: [] },
      { path: 'tags', before: ['travel'], after: ['travel'] },
      { path: 'allocation', before: { amount: '100.00', currency: 'USD' }, after: { currency: 'USD', amount: '100.00' } },
    ]) {
      expect(() => AuditChange.from(change)).toThrow(InvalidAuditEventError)
    }
  })

  it('rejects an event containing an unchanged value without partially appending it', () => {
    const committed = {
      ...eventBase,
      eventId: 'evt-committed',
      changes: [{ path: 'state', before: 'DRAFT', after: 'SUBMITTED' }],
    }
    const log = AuditLog.create([committed])

    expect(() =>
      log.append({
        ...eventBase,
        eventId: 'evt-invalid-change',
        changes: [{ path: 'state', before: 'SUBMITTED', after: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidAuditEventError)
    expect(log.toJSON()).toEqual({ history: [committed] })
  })
})

// Node compares own constructor members as data; Vitest strict equality treats them as type markers.
describe('Audit own JSON member preservation', () => {
  const values: unknown[] = [7, null, { approved: true }, [null, { approved: false }]]
  for (const key of ['__proto__', 'constructor', 'prototype', 'hasOwnProperty']) {
    for (const [index, value] of values.entries()) {
      it(`preserves ${key} value ${index} through construction, append, import, and redaction`, () => {
        const payload = Object.fromEntries([[key, value]])
        const shared = { payload }
        const metadata = { left: shared, right: [shared] }
        const event = { ...eventBase, actor: { id: 'actor :: opaque', type: 'service', metadata },
          metadata: { context: payload }, changes: [{ path: 'payload', before: {}, after: payload }] }
        const expected = structuredClone(event)
        const prototypeBefore = Object.getOwnPropertyDescriptors(Object.prototype)
        const instance = AuditEvent.from(event)
        const log = AuditLog.create().append(event)
        const imported = AuditLog.create([event])
        payload[key] = 'caller mutation'
        shared.payload = {}
        event.actor.id = 'changed'
        for (const observe of [() => instance.toJSON(), () => log.events()[0]!, () => imported.toJSON().history[0]!]) {
          const observed = observe()
          assertJson(observed, expected)
          const after = observed.changes![0]!.after as Record<string, unknown>
          expect(Object.hasOwn(after, key)).toBe(true)
          expect(Object.getPrototypeOf(after)).toBe(Object.prototype)
          expect(Object.getOwnPropertyDescriptor(after, key)).toEqual({ value, enumerable: true, writable: true, configurable: true })
          after[key] = 'observation mutation'
          const actorMetadata = observed.actor!.metadata as typeof metadata
          actorMetadata.left.payload[key] = 'observation mutation'
          assertJson(observe(), expected)
          assertJson(JSON.parse(JSON.stringify(observe())), expected)
        }
        const evidence = { ...eventBase, eventId: 'evt-redaction', eventType: 'AUDIT_CONTENT_REDACTED', actor: { id: 'redactor' } }
        const result = log.redact({ policy: { id: 'policy', authority: 'retention', protectedPaths: ['actor.metadata'] }, redactionEvent: evidence })
        assertJson(result.event, { ...expected, actor: { ...expected.actor, metadata: { presence: 'REDACTED' } } })
        assertJson(log.toJSON(), { history: [expected, evidence] })
        const changeRedaction = imported.redact({ policy: { id: 'policy', authority: 'retention', protectedPaths: ['payload'] }, redactionEvent: evidence })
        assertJson(changeRedaction.event, { ...expected, changes: [{ path: 'payload', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } }] })
        assertJson(imported.toJSON(), { history: [expected, evidence] })
        const changedView = result.event.changes![0]!.after as Record<string, unknown>
        changedView[key] = 'redacted view mutation'
        assertJson(log.events()[0], expected)
        expect(Object.getOwnPropertyDescriptors(Object.prototype)).toEqual(prototypeBefore)
      })
      it(`rejects equal ${key} value ${index} without changing committed history`, () => {
        const payload = Object.fromEntries([[key, value]])
        const log = AuditLog.create([eventBase])
        const unchanged = { ...eventBase, eventId: 'evt-equal', changes: [{ path: 'payload', before: payload, after: structuredClone(payload) }] }
        expect(() => log.append(unchanged)).toThrow(InvalidAuditEventError)
        assertJson(log.toJSON(), { history: [eventBase] })
        assertJson(AuditChange.from({ path: 'payload', after: payload }).toJSON(), { path: 'payload', after: payload })
      })
    }
  }

  it('compares member values without Boolean/number coercion or inferred Money semantics', () => {
    for (const [before, after] of [[true, 1], [null, 0], [{ amount: '1.0', currency: 'USD' }, { amount: '1.00', currency: 'USD' }]]) {
      const input = { path: 'payload', before: { ['__proto__']: before }, after: { ['__proto__']: after } }
      assertJson(AuditChange.from(input).toJSON(), input)
    }
  })
})

describe('Audit JSON and Money mutation controls', () => {
  it('preserves shared arrays as JSON data and rejects unsupported nested values', () => {
    const shared = [null, { ['__proto__']: true }]
    const input = { path: 'payload', after: { first: shared, second: shared } }
    const change = AuditChange.from(input)
    assertJson(change.toJSON(), input)
    shared.push(false)
    assertJson(change.toJSON(), { path: 'payload', after: { first: [null, { ['__proto__']: true }], second: [null, { ['__proto__']: true }] } })
    for (const value of [undefined, NaN, Infinity, 1n, () => true, new Date(), Symbol('x')]) {
      expect(() => AuditChange.from({ path: 'payload', after: { ['__proto__']: value } })).toThrow(InvalidAuditEventError)
    }
  })

  it('accepts unequal numbers, cross-currency Money and Money-to-null changes exactly', () => {
    for (const input of [
      { path: 'number', before: 7, after: 8 },
      { path: 'amount', valueType: 'MONEY', before: { amount: '1', currency: 'USD' }, after: { amount: '1', currency: 'EUR' } },
      { path: 'amount', valueType: 'MONEY', before: { amount: '1', currency: 'USD' }, after: null },
    ]) assertJson(AuditChange.from(input).toJSON(), input)
  })

  it('rejects unknown declarations even when every supplied Money value is valid', () => {
    for (const valueType of ['DECIMAL', null, undefined]) {
      for (const values of [{}, { before: { amount: '1', currency: 'USD' }, after: { amount: '2', currency: 'USD' } }]) {
        expect(() => AuditChange.from({ path: 'amount', valueType, ...values })).toThrow(InvalidAuditEventError)
      }
    }
  })
})
