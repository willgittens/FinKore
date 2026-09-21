// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AuditLog, DuplicateAuditEventError, InvalidAuditRedactionError } from '../../src/index.js'

const protectedEvent = {
  eventId: 'evt-1042',
  eventType: 'ENTITY_SUBMITTED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-7', displayName: 'Ada' },
  occurredAt: '2026-09-01T12:00:00Z',
  changes: [
    { path: 'bankAccount', before: 'DE111', after: 'DE222' },
    { path: 'amount', before: { amount: '100.00', currency: 'USD' }, after: { amount: '125.00', currency: 'USD' } },
  ],
  metadata: { source: 'expense-ui' },
}

const unrelatedEvent = {
  eventId: 'evt-1043',
  eventType: 'ENTITY_APPROVED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'user', id: 'user-8' },
  occurredAt: '2026-09-01T13:00:00Z',
  changes: [{ path: 'state', before: 'SUBMITTED', after: 'APPROVED' }],
}

const policy = {
  id: 'bank-redaction-v1',
  protectedPaths: ['bankAccount'],
  authority: 'retention-policy',
}

const redactionEvent = {
  eventId: 'evt-redact-1',
  eventType: 'AUDIT_CONTENT_REDACTED',
  entity: { type: 'expense', id: 'exp-52' },
  actor: { type: 'system', id: 'retention-service' },
  occurredAt: '2026-09-01T14:00:00Z',
}

describe('Audit redaction', () => {
  it.each(['displayName', 'metadata'] as const)(
    'redacts actor %s and a matching change path under the same policy target', (field) => {
      const path = `actor.${field}`
      const event = {
        ...protectedEvent,
        actor: { ...protectedEvent.actor, metadata: { source: 'private' } },
        changes: [{ path, after: 'private context' }],
      }
      const log = AuditLog.create([event])
      const result = log.redact({ policy: { ...policy, protectedPaths: [path] }, redactionEvent })
      expect(result.event.actor?.[field]).toEqual({ presence: 'REDACTED' })
      expect(result.event.changes).toEqual([{ path, after: { presence: 'REDACTED' } }])
      expect(log.toJSON()).toEqual({ history: [event, redactionEvent] })
    },
  )

  it('preserves an absent actor when redacting change content', () => {
    const { actor: _actor, ...event } = protectedEvent
    const log = AuditLog.create([event])
    expect(() => log.redact({
      policy: { ...policy, protectedPaths: ['actor.displayName'] }, redactionEvent,
    })).toThrowError(expect.objectContaining({ code: 'FINKORE_AUDIT_REDACTION_INVALID' }))
    expect(log.toJSON()).toEqual({ history: [event] })
    const result = log.redact({ policy, redactionEvent })
    expect(Object.hasOwn(result.event, 'actor')).toBe(false)
    expect(result.event.changes?.[0]).toEqual({
      path: 'bankAccount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' },
    })
    expect(log.toJSON()).toEqual({ history: [event, redactionEvent] })
  })

  it('redacts actor context without inventing absent changes', () => {
    const { changes: _changes, ...event } = protectedEvent
    const log = AuditLog.create([event])
    const result = log.redact({
      policy: { ...policy, protectedPaths: ['actor.displayName'] }, redactionEvent,
    })
    expect(result.event.actor).toEqual({ type: 'user', id: 'user-7', displayName: { presence: 'REDACTED' } })
    expect(Object.hasOwn(result.event, 'changes')).toBe(false)
    expect(log.toJSON()).toEqual({ history: [event, redactionEvent] })
  })

  it('does not mistake an ordinary record containing a presence field for the exact redaction marker', () => {
    const event = { ...protectedEvent, changes: [{ path: 'bankAccount', after: { presence: 'REDACTED', source: 'external' } }] }
    const log = AuditLog.create([event])
    expect(log.redact({ policy, redactionEvent }).event.changes).toEqual([
      { path: 'bankAccount', after: { presence: 'REDACTED' } },
    ])
    expect(log.toJSON()).toEqual({ history: [event, redactionEvent] })
  })

  it('redacts protected change values while preserving required event meaning and evidence', () => {
    const log = AuditLog.create([protectedEvent])

    const result = log.redact({ policy, redactionEvent })

    expect(result).toEqual({
      event: {
        ...protectedEvent,
        changes: [
          { path: 'bankAccount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
          protectedEvent.changes[1],
        ],
      },
      evidenceEvent: redactionEvent,
    })
    expect(log.toJSON()).toEqual({ history: [protectedEvent, redactionEvent] })
  })

  it('redacts multiple protected paths on the same affected event', () => {
    const log = AuditLog.create([protectedEvent])

    expect(log.redact({
      policy: { id: 'multi-redaction-v1', protectedPaths: ['bankAccount', 'amount'], authority: 'retention-policy' },
      redactionEvent,
    }).event.changes).toEqual([
      { path: 'bankAccount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
      { path: 'amount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
    ])
  })

  it('redacts optional actor context while preserving actor identity and type', () => {
    const event = {
      ...protectedEvent,
      eventId: 'evt-actor-context',
      actor: { type: 'user', id: 'user-7', displayName: 'Ada', metadata: { email: 'ada@example.test' } },
    }
    const log = AuditLog.create([event])

    const result = log.redact({
      policy: { id: 'actor-context-policy', protectedPaths: ['actor.displayName', 'actor.metadata'], authority: 'retention-policy' },
      redactionEvent,
    })

    expect(result.event.actor).toEqual({
      type: 'user',
      id: 'user-7',
      displayName: { presence: 'REDACTED' },
      metadata: { presence: 'REDACTED' },
    })
    expect(log.toJSON()).toEqual({ history: [event, redactionEvent] })
  })

  it('rejects actor identity or type redaction without partial mutation', () => {
    for (const protectedPaths of [['actor.id'], ['actor.type']]) {
      const log = AuditLog.create([protectedEvent])

      expect(() =>
        log.redact({ policy: { id: 'bad-actor-policy', protectedPaths, authority: 'retention-policy' }, redactionEvent }),
      ).toThrow(InvalidAuditRedactionError)
      expect(log.toJSON()).toEqual({ history: [protectedEvent] })
    }
  })

  it('keeps redacted, absent, null, false, zero, empty string, arrays, and records distinguishable', () => {
    const event = {
      ...protectedEvent,
      eventId: 'evt-boundary',
      changes: [
        { path: 'secret', before: null, after: '' },
        { path: 'visibleFalse', before: false, after: true },
        { path: 'visibleZero', before: 0, after: 1 },
        { path: 'visibleArray', before: [], after: ['kept'] },
        { path: 'visibleRecord', before: {}, after: { kept: true } },
        { path: 'visibleAbsent', before: { presence: 'ABSENT' }, after: null },
      ],
    }
    const log = AuditLog.create([event])

    const result = log.redact({
      policy: { id: 'secret-policy', protectedPaths: ['secret'], authority: 'retention-policy' },
      redactionEvent,
    })

    expect(result.event.changes).toEqual([
      { path: 'secret', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
      { path: 'visibleFalse', before: false, after: true },
      { path: 'visibleZero', before: 0, after: 1 },
      { path: 'visibleArray', before: [], after: ['kept'] },
      { path: 'visibleRecord', before: {}, after: { kept: true } },
      { path: 'visibleAbsent', before: { presence: 'ABSENT' }, after: null },
    ])
  })

  it('does not mutate unrelated historical events or caller-held request references', () => {
    const request = {
      policy: { id: 'bank-redaction-v1', protectedPaths: ['bankAccount'], authority: 'retention-policy' },
      redactionEvent: { ...redactionEvent },
    }
    const log = AuditLog.create([unrelatedEvent, protectedEvent])

    const result = log.redact(request)
    request.policy.protectedPaths[0] = 'amount'
    request.redactionEvent.eventType = 'CHANGED'
    ;(result.event.changes?.[0] as { before: { presence: string } }).before.presence = 'CHANGED'

    expect(log.toJSON()).toEqual({ history: [unrelatedEvent, protectedEvent, redactionEvent] })
    expect(log.redact({
      policy: { id: 'amount-policy', protectedPaths: ['amount'], authority: 'retention-policy' },
      redactionEvent: { ...redactionEvent, eventId: 'evt-redact-2' },
    }).event.changes).toEqual([
      { path: 'bankAccount', before: 'DE111', after: 'DE222' },
      { path: 'amount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
    ])
  })


  it('rejects duplicate evidence event identity before redacting or appending evidence', () => {
    const log = AuditLog.create([protectedEvent, redactionEvent])

    expect(() => log.redact({ policy, redactionEvent })).toThrow(DuplicateAuditEventError)
    expect(log.toJSON()).toEqual({ history: [protectedEvent, redactionEvent] })
  })

  it('records the evidence event identity for later duplicate detection', () => {
    const log = AuditLog.create([protectedEvent])

    log.redact({ policy, redactionEvent })

    expect(() => log.append({ ...unrelatedEvent, eventId: 'evt-redact-1' })).toThrow(DuplicateAuditEventError)
    expect(log.toJSON()).toEqual({ history: [protectedEvent, redactionEvent] })
  })

  it('redacts one-sided retained values without manufacturing the missing side', () => {
    const log = AuditLog.create([{
      ...protectedEvent,
      eventId: 'evt-one-sided',
      changes: [{ path: 'bankAccount', before: 'DE111' }],
    }])

    expect(log.redact({ policy, redactionEvent }).event.changes).toEqual([
      { path: 'bankAccount', before: { presence: 'REDACTED' } },
    ])
  })

  it('rejects invalid, ambiguous, repeated, or non-targeting redactions without partial mutation', () => {
    for (const badRequest of [
      undefined,
      null,
      'not-a-request',
      { policy: { id: '', protectedPaths: ['bankAccount'], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 4, protectedPaths: ['bankAccount'], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: [], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: [4], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: ['unknown'], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: ['bankAccount', 'unknown'], authority: 'retention-policy' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: ['bankAccount'], authority: '' }, redactionEvent },
      { policy: { id: 'p', protectedPaths: ['bankAccount'], authority: 4 }, redactionEvent },
    ]) {
      const log = AuditLog.create([protectedEvent])
      expect(() => log.redact(badRequest as never)).toThrow(InvalidAuditRedactionError)
      expect(log.toJSON()).toEqual({ history: [protectedEvent] })
    }

    const ambiguous = AuditLog.create([protectedEvent, { ...protectedEvent, eventId: 'evt-duplicate-target' }])
    expect(() => ambiguous.redact({ policy, redactionEvent })).toThrow(InvalidAuditRedactionError)
    expect(ambiguous.toJSON()).toEqual({ history: [protectedEvent, { ...protectedEvent, eventId: 'evt-duplicate-target' }] })

    const alreadyRedacted = AuditLog.create([{ ...protectedEvent, changes: [{ path: 'bankAccount', before: { presence: 'REDACTED' }, after: 'DE222' }] }])
    expect(() => alreadyRedacted.redact({ policy, redactionEvent })).toThrow(InvalidAuditRedactionError)
    expect(alreadyRedacted.toJSON()).toEqual({
      history: [{ ...protectedEvent, changes: [{ path: 'bankAccount', before: { presence: 'REDACTED' }, after: 'DE222' }] }],
    })
  })

  it('rejects protected targets without retained content or optional actor context', () => {
    const { actor: _actor, ...eventWithoutActor } = protectedEvent
    const pathOnlyEvent = {
      ...protectedEvent,
      eventId: 'evt-path-only',
      changes: [{ path: 'bankAccount' }],
    }
    const pathOnly = AuditLog.create([pathOnlyEvent])
    expect(() => pathOnly.redact({ policy, redactionEvent })).toThrow(InvalidAuditRedactionError)
    expect(pathOnly.toJSON()).toEqual({ history: [pathOnlyEvent] })

    for (const event of [
      { ...eventWithoutActor, eventId: 'evt-no-actor' },
      { ...protectedEvent, eventId: 'evt-no-actor-metadata', actor: { type: 'user', id: 'user-7' } },
    ]) {
      const log = AuditLog.create([event])
      expect(() => log.redact({
        policy: { id: 'actor-metadata', protectedPaths: ['actor.metadata'], authority: 'retention-policy' },
        redactionEvent,
      })).toThrow(InvalidAuditRedactionError)
      expect(log.toJSON()).toEqual({ history: [event] })
    }
  })

  it('redacts only the actor context named by the policy', () => {
    const event = {
      ...protectedEvent,
      eventId: 'evt-one-actor-field',
      actor: { type: 'user', id: 'user-7', displayName: 'Ada', metadata: { team: 'finance' } },
    }
    const log = AuditLog.create([event])

    expect(log.redact({
      policy: { id: 'display-name-only', protectedPaths: ['actor.displayName'], authority: 'retention-policy' },
      redactionEvent,
    }).event.actor).toStrictEqual({
      type: 'user',
      id: 'user-7',
      displayName: { presence: 'REDACTED' },
      metadata: { team: 'finance' },
    })
  })
})
