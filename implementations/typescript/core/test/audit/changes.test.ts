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
    const undefinedBeforeOnly = AuditChange.from({ path: 'externalRef', before: undefined }).toJSON()

    expect(beforeOnly).toEqual({ path: 'externalRef', before: { presence: 'ABSENT' } })
    expect('after' in beforeOnly).toBe(false)
    expect(afterOnly).toEqual({ path: 'externalRef', after: null })
    expect('before' in afterOnly).toBe(false)
    expect(undefinedBeforeOnly).toEqual({ path: 'externalRef', before: undefined })
    expect('before' in undefinedBeforeOnly).toBe(true)
    expect('after' in undefinedBeforeOnly).toBe(false)
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

  it('rejects a missing change path, non-change value, or uncloneable change value as an invalid event', () => {
    expect(() => AuditChange.from(null)).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ before: 'DRAFT', after: 'SUBMITTED' })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: '', before: 'DRAFT', after: 'SUBMITTED' })).toThrow(InvalidAuditEventError)
    expect(() => AuditChange.from({ path: 'callback', before: 'missing', after: () => undefined })).toThrow(
      InvalidAuditEventError,
    )
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
