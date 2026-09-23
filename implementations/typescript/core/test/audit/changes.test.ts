// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
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

    const cyclicArray: unknown[] = []
    cyclicArray.push(cyclicArray)
    expect(() => AuditChange.from({ path: 'cycle', before: cyclicArray })).toThrow(InvalidAuditEventError)

    const cyclicObject: Record<string, unknown> = {}
    cyclicObject.self = cyclicObject
    expect(() => AuditChange.from({ path: 'cycle', after: cyclicObject })).toThrow(InvalidAuditEventError)
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
