// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AuditEvent, InvalidAuditActorError, InvalidAuditEventError } from '../../src/index.js'

const completeEvent = {
  eventId: 'evt-1042',
  eventType: 'ENTITY_SUBMITTED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-7' },
  occurredAt: '2026-09-01T12:00:00Z',
  changes: [{ path: 'state', before: 'DRAFT', after: 'SUBMITTED' }],
}

describe('Audit events', () => {
  it('represents a complete event with stable identity, entity, actor, and timestamp', () => {
    const event = AuditEvent.from(completeEvent)

    expect(event.eventId).toBe('evt-1042')
    expect(event.toJSON()).toEqual(completeEvent)
  })

  it('preserves known actor identity without inventing optional actor fields', () => {
    const event = AuditEvent.from({
      eventId: 'evt-actor-minimal',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      actor: { id: 'user-7' },
      occurredAt: '2026-09-01T12:00:00Z',
    })
    const actor = event.toJSON().actor

    expect(actor).toEqual({ id: 'user-7' })
    expect(actor === undefined ? [] : Object.keys(actor)).toEqual(['id'])
  })

  it('allows actor omission when the responsible actor is unknown', () => {
    const event = AuditEvent.from({
      eventId: 'evt-unknown',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      occurredAt: '2026-09-01T12:00:00Z',
    })

    expect(event.toJSON()).toEqual({
      eventId: 'evt-unknown',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      occurredAt: '2026-09-01T12:00:00Z',
    })
  })

  it('preserves explicit timestamp representation without injecting clock time', () => {
    const withOffset = AuditEvent.from({
      ...completeEvent,
      eventId: 'evt-offset',
      occurredAt: '2026-09-01T14:00:00+02:00',
    })

    expect(withOffset.toJSON().occurredAt).toBe('2026-09-01T14:00:00+02:00')
  })

  it('omits optional event fields that were not supplied', () => {
    const serialized = AuditEvent.from({
      eventId: 'evt-minimal',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      occurredAt: '2026-09-01T12:00:00Z',
    }).toJSON()

    expect('actor' in serialized).toBe(false)
    expect('changes' in serialized).toBe(false)
    expect('metadata' in serialized).toBe(false)
  })

  it('preserves change direction and absent versus null values as supplied event content', () => {
    const event = AuditEvent.from({
      eventId: 'evt-null',
      eventType: 'ENTITY_SUBMITTED',
      entity: { type: 'expense', id: 'exp-52' },
      actor: { type: 'user', id: 'user-7' },
      occurredAt: '2026-09-01T12:00:00Z',
      changes: [{ path: 'externalRef', before: { presence: 'ABSENT' }, after: null }],
    })

    expect(event.toJSON().changes).toEqual([{ path: 'externalRef', before: { presence: 'ABSENT' }, after: null }])
  })

  it('preserves event metadata and omitted change sets without redefining required fields', () => {
    const event = AuditEvent.from({
      eventId: 'evt-metadata',
      eventType: 'ENTITY_NOTE_RECORDED',
      entity: { type: 'expense', id: 'exp-52' },
      occurredAt: '2026-09-01T12:00:00.123Z',
      metadata: { source: 'import', batch: 7 },
    })

    expect(event.toJSON()).toEqual({
      eventId: 'evt-metadata',
      eventType: 'ENTITY_NOTE_RECORDED',
      entity: { type: 'expense', id: 'exp-52' },
      occurredAt: '2026-09-01T12:00:00.123Z',
      metadata: { source: 'import', batch: 7 },
    })
  })

  it('preserves explicit null event metadata', () => {
    expect(AuditEvent.from({ ...completeEvent, eventId: 'evt-null-metadata', metadata: null }).toJSON().metadata).toBeNull()
  })

  it('rejects metadata that attempts to restate required event fields', () => {
    for (const field of ['eventId', 'eventType', 'entity', 'actor', 'occurredAt', 'changes']) {
      expect(() =>
        AuditEvent.from({ ...completeEvent, eventId: 'evt-metadata-' + field, metadata: { [field]: 'conflict' } }),
      ).toThrow(InvalidAuditEventError)
    }
  })

  it('rejects implementation-looking or malformed event type values', () => {
    for (const eventType of ['AuditLog.append', 'audit-log-append', 'POST /expenses', 'save()', 'entitySubmitted']) {
      expect(() => AuditEvent.from({ ...completeEvent, eventId: 'evt-type-' + eventType, eventType })).toThrow(
        InvalidAuditEventError,
      )
    }
  })

  it('rejects events missing required identity, entity, type, or timestamp content', () => {
    expect(() => AuditEvent.from({ ...completeEvent, eventId: '' })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, eventType: '' })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, entity: { type: 'expense' } })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, occurredAt: undefined })).toThrow(InvalidAuditEventError)
  })

  it('rejects ambiguous or malformed serialized timestamps', () => {
    for (const occurredAt of [
      '2026-09-01T12:00:00',
      'not-a-date',
      '2-09-01T12:00:00Z',
      'ABCD-09-01T12:00:00Z',
      '2026-X9-01T12:00:00Z',
      '2026-9-01T12:00:00Z',
      '2026-09-1T12:00:00Z',
      '2026-0-01T12:00:00Z',
      '2026-09-0XT12:00:00Z',
      '2026-09-01T12:3:00Z',
      '2026-09-01T1:00:00Z',
      '2026-09-01TAB:00:00Z',
      '2026-09-01T12:00:X0Z',
      '2026-09-01T12:X0:00Z',
      '2026-09-01T12:00:0Z',
      '2026-09-01T12:00:00.abcZ',
      '2026-09-01T12:00:00+AB:00',
      '2026-09-01T12:00:00 02:00',
      '2026-09-01T12:00:00+02:0',
      '2026-09-01T12:00:00+2:00',
      'prefix-2026-09-01T12:00:00Z',
      '2026-09-01T12:00:00Z-suffix',
    ]) {
      expect(() => AuditEvent.from({ ...completeEvent, occurredAt })).toThrow(InvalidAuditEventError)
    }
  })

  it('rejects uncloneable event metadata as invalid event content', () => {
    expect(() => AuditEvent.from({ ...completeEvent, metadata: () => undefined })).toThrow(InvalidAuditEventError)
  })

  it('rejects malformed actor attribution using the actor portable error category', () => {
    expect(() => AuditEvent.from({ ...completeEvent, actor: { type: 'user' } })).toThrow(InvalidAuditActorError)
  })

  it('rejects malformed entity, change collection, and change path shapes', () => {
    const callableEvent = Object.assign(() => undefined, completeEvent)

    expect(() => AuditEvent.from(null)).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from(callableEvent)).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, entity: null })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, changes: 'state changed' })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, changes: [null] })).toThrow(InvalidAuditEventError)
    expect(() => AuditEvent.from({ ...completeEvent, changes: [{ before: 'DRAFT', after: 'SUBMITTED' }] })).toThrow(
      InvalidAuditEventError,
    )
  })

  it('returns defensive event copies', () => {
    const event = AuditEvent.from(completeEvent)
    const snapshot = event.toJSON() as { entity: { id: string }; changes: [{ after: string }] }

    snapshot.entity.id = 'changed'
    snapshot.changes[0].after = 'CHANGED'

    expect(event.toJSON()).toEqual(completeEvent)
  })
})
