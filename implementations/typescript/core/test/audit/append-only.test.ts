import { describe, expect, it } from 'vitest'
import {
  AuditAppendOnlyViolationError,
  AuditLog,
  DuplicateAuditEventError,
  InvalidAuditEventError,
} from '../../src/index.js'

const submitted = {
  eventId: 'evt-1042',
  eventType: 'ENTITY_SUBMITTED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-7' },
  occurredAt: '2026-09-01T12:00:00Z',
  changes: [{ path: 'state', before: 'DRAFT', after: 'SUBMITTED' }],
}

const approved = {
  eventId: 'evt-1043',
  eventType: 'ENTITY_APPROVED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-8' },
  occurredAt: '2026-09-01T13:00:00Z',
  changes: [{ path: 'state', before: 'SUBMITTED', after: 'APPROVED' }],
}

describe('Audit append-only history', () => {
  it('appends the first event to an empty history', () => {
    const log = AuditLog.create()

    expect(log.append(submitted)).toBe(log)
    expect(log.toJSON()).toEqual({ history: [submitted] })
  })

  it('appends a second event without dropping or replacing the first event', () => {
    const log = AuditLog.create([submitted])

    log.append(approved)

    expect(log.toJSON()).toEqual({ history: [submitted, approved] })
  })

  it('preserves committed event values against later caller-side mutation', () => {
    const mutableEvent = {
      eventId: 'evt-mutable',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      actor: { type: 'user', id: 'user-7' },
      occurredAt: '2026-09-01T12:00:00Z',
      changes: [{ path: 'state', before: 'DRAFT', after: 'SUBMITTED' }],
    }
    const log = AuditLog.create()

    log.append(mutableEvent)
    mutableEvent.eventType = 'ENTITY_APPROVED'
    mutableEvent.entity.id = 'exp-99'
    mutableEvent.changes[0].after = 'APPROVED'

    expect(log.toJSON().history[0]).toEqual({
      eventId: 'evt-mutable',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      actor: { type: 'user', id: 'user-7' },
      occurredAt: '2026-09-01T12:00:00Z',
      changes: [{ path: 'state', before: 'DRAFT', after: 'SUBMITTED' }],
    })
  })

  it('rejects duplicate event identity without partially appending', () => {
    const log = AuditLog.create([submitted])

    expect(() => log.append({ ...approved, eventId: 'evt-1042' })).toThrow(DuplicateAuditEventError)

    expect(log.toJSON()).toEqual({ history: [submitted] })
  })

  it('rejects an identity duplicated after a prior append in the same log', () => {
    const log = AuditLog.create()

    log.append(submitted)

    expect(() => log.append({ ...approved, eventId: 'evt-1042' })).toThrow(DuplicateAuditEventError)
    expect(log.toJSON()).toEqual({ history: [submitted] })
  })

  it('rejects invalid append attempts without partial history mutation', () => {
    const log = AuditLog.create([submitted])

    expect(() => log.append({ ...approved, occurredAt: undefined })).toThrow(InvalidAuditEventError)

    expect(log.toJSON()).toEqual({ history: [submitted] })
  })

  it('rejects malformed or duplicate imported history', () => {
    expect(() => AuditLog.create('not-history' as unknown as readonly unknown[])).toThrow(AuditAppendOnlyViolationError)
    expect(() => AuditLog.create([submitted, { ...approved, eventId: 'evt-1042' }])).toThrow(DuplicateAuditEventError)
    expect(() => AuditLog.create([{ ...submitted, eventId: '' }])).toThrow(InvalidAuditEventError)
  })

  it('rejects replacement and removal as append-only violations without mutating history', () => {
    const log = AuditLog.create([submitted])

    expect(() => log.replace()).toThrow(AuditAppendOnlyViolationError)
    expect(() => log.remove()).toThrow(AuditAppendOnlyViolationError)

    expect(log.toJSON()).toEqual({ history: [submitted] })
  })

  it('returns defensive history snapshots', () => {
    const log = AuditLog.create([submitted])
    const snapshot = log.toJSON() as { history: [{ eventType: string }] }

    snapshot.history[0].eventType = 'CHANGED'

    expect(log.toJSON()).toEqual({ history: [submitted] })
  })
})
