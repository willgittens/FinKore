// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AuditEvent, AuditLog, InvalidAuditEventError } from '../../src/index.js'

const originalEvent = {
  eventId: 'evt-original',
  eventType: 'ENTITY_ISSUED',
  entity: { type: 'invoice', id: 'inv-10' },
  actor: { type: 'user', id: 'user-1' },
  occurredAt: '2026-09-01T10:00:00Z',
  changes: [{ path: 'state', before: 'DRAFT', after: 'ISSUED' }],
}

const correctionEvent = {
  eventId: 'evt-correction',
  eventType: 'ENTITY_CORRECTED',
  entity: { type: 'invoice', id: 'inv-10' },
  actor: { type: 'user', id: 'user-2' },
  occurredAt: '2026-09-01T11:00:00Z',
  relationships: [
    {
      relationshipId: 'rel-corrects-1',
      type: 'CORRECTS',
      target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'inv-10' } },
    },
  ],
  changes: [{ path: 'amount', before: { amount: '100.00', currency: 'USD' }, after: { amount: '99.00', currency: 'USD' } }],
}

describe('Audit relationships', () => {
  it('preserves relationship identity, type, target event, and target entity on append', () => {
    const log = AuditLog.create([originalEvent])

    expect(log.append(correctionEvent).toJSON()).toEqual({
      history: [originalEvent, correctionEvent],
    })
  })

  it('supports every relationship type without inferring order from relationship identity', () => {
    const log = AuditLog.create([originalEvent])
    const event = {
      eventId: 'evt-evolution-bundle',
      eventType: 'ENTITY_EVOLUTION_RECORDED',
      entity: { type: 'invoice', id: 'inv-10' },
      occurredAt: '2026-09-01T12:00:00Z',
      relationships: [
        { relationshipId: 'z-rel', type: 'SUPERSEDES', target: { eventId: 'evt-original', entity: originalEvent.entity } },
        { relationshipId: 'a-rel', type: 'REVERSES', target: { eventId: 'evt-original', entity: originalEvent.entity } },
        { relationshipId: 'm-rel', type: 'VOIDS', target: { eventId: 'evt-original', entity: originalEvent.entity } },
      ],
    }

    expect(log.append(event).toJSON().history[1]?.relationships).toEqual(event.relationships)
  })

  it('rejects malformed, empty, unsupported, self-targeting, unknown-target, and target-entity-mismatched relationships', () => {
    for (const relationships of [
      [],
      [null],
      [{ relationshipId: 'rel-empty-target', type: 'CORRECTS', target: {} }],
      [{ relationshipId: 'rel-bad-type', type: 'RELATED_TO', target: { eventId: 'evt-original', entity: originalEvent.entity } }],
      [{ relationshipId: 'rel-self', type: 'CORRECTS', target: { eventId: 'evt-correction', entity: correctionEvent.entity } }],
      [{ relationshipId: 'rel-unknown', type: 'CORRECTS', target: { eventId: 'evt-missing', entity: originalEvent.entity } }],
      [{ relationshipId: 'rel-wrong-entity', type: 'CORRECTS', target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'other' } } }],
      [{ relationshipId: 'rel-wrong-type', type: 'CORRECTS', target: { eventId: 'evt-original', entity: { type: 'credit-note', id: 'inv-10' } } }],
    ]) {
      const log = AuditLog.create([originalEvent])

      expect(() => log.append({ ...correctionEvent, relationships })).toThrow(InvalidAuditEventError)
      expect(log.toJSON()).toEqual({ history: [originalEvent] })
    }
  })

  it('rejects duplicate relationship identities within one event or existing logical history', () => {
    const duplicateInEvent = {
      ...correctionEvent,
      relationships: [
        correctionEvent.relationships[0],
        { ...correctionEvent.relationships[0], type: 'REVERSES' },
      ],
    }
    const log = AuditLog.create([originalEvent])

    expect(() => log.append(duplicateInEvent)).toThrow(InvalidAuditEventError)
    expect(log.toJSON()).toEqual({ history: [originalEvent] })

    const committed = AuditLog.create([originalEvent, correctionEvent])
    expect(() =>
      committed.append({
        ...correctionEvent,
        eventId: 'evt-second-correction',
        relationships: [{ ...correctionEvent.relationships[0], type: 'SUPERSEDES' }],
      }),
    ).toThrow(InvalidAuditEventError)
    expect(committed.toJSON()).toEqual({ history: [originalEvent, correctionEvent] })

    const appended = AuditLog.create([originalEvent])
    appended.append(correctionEvent)
    expect(() =>
      appended.append({
        ...correctionEvent,
        eventId: 'evt-third-correction',
        relationships: [{ ...correctionEvent.relationships[0], type: 'VOIDS' }],
      }),
    ).toThrow(InvalidAuditEventError)
    expect(appended.toJSON()).toEqual({ history: [originalEvent, correctionEvent] })
  })

  it('rejects imported histories with absent targets, self targets, target entity mismatches, or duplicate relationship identities', () => {
    for (const history of [
      [correctionEvent],
      [originalEvent, { ...correctionEvent, relationships: [{ ...correctionEvent.relationships[0], target: { eventId: 'evt-correction', entity: correctionEvent.entity } }] }],
      [originalEvent, { ...correctionEvent, relationships: [{ ...correctionEvent.relationships[0], target: { eventId: 'evt-original', entity: { type: 'invoice', id: 'other' } } }] }],
      [originalEvent, correctionEvent, { ...correctionEvent, eventId: 'evt-duplicate-rel' }],
    ]) {
      expect(() => AuditLog.create(history)).toThrow(InvalidAuditEventError)
    }
  })

  it('preserves relationships through redacted representations and committed evidence events', () => {
    const log = AuditLog.create([originalEvent, correctionEvent])
    const evidenceEvent = {
      eventId: 'evt-redaction',
      eventType: 'AUDIT_CONTENT_REDACTED',
      entity: { type: 'invoice', id: 'inv-10' },
      occurredAt: '2026-09-01T12:00:00Z',
      relationships: [
        {
          relationshipId: 'rel-redaction-evidence',
          type: 'CORRECTS',
          target: { eventId: 'evt-correction', entity: { type: 'invoice', id: 'inv-10' } },
        },
      ],
    }

    const result = log.redact({
      policy: { id: 'amount-redaction', protectedPaths: ['amount'], authority: 'retention-policy' },
      redactionEvent: evidenceEvent,
    })

    expect(result.event.relationships).toEqual(correctionEvent.relationships)
    expect(result.event.changes).toEqual([
      { path: 'amount', before: { presence: 'REDACTED' }, after: { presence: 'REDACTED' } },
    ])
    expect(result.evidenceEvent).toEqual(evidenceEvent)
    expect(log.toJSON()).toEqual({ history: [originalEvent, correctionEvent, evidenceEvent] })
    expect(() =>
      log.append({
        ...correctionEvent,
        eventId: 'evt-after-redaction',
        relationships: [
          {
            ...correctionEvent.relationships[0],
            relationshipId: 'rel-redaction-evidence',
            type: 'SUPERSEDES',
          },
        ],
      }),
    ).toThrow(InvalidAuditEventError)
    expect(log.toJSON()).toEqual({ history: [originalEvent, correctionEvent, evidenceEvent] })
  })

  it('rejects invalid relationships on redaction evidence before mutating history', () => {
    const log = AuditLog.create([originalEvent, correctionEvent])

    expect(() =>
      log.redact({
        policy: { id: 'amount-redaction', protectedPaths: ['amount'], authority: 'retention-policy' },
        redactionEvent: {
          eventId: 'evt-redaction',
          eventType: 'AUDIT_CONTENT_REDACTED',
          entity: { type: 'invoice', id: 'inv-10' },
          occurredAt: '2026-09-01T12:00:00Z',
          relationships: [
            {
              relationshipId: 'rel-redaction-evidence',
              type: 'CORRECTS',
              target: { eventId: 'evt-missing', entity: { type: 'invoice', id: 'inv-10' } },
            },
          ],
        },
      }),
    ).toThrow(InvalidAuditEventError)
    expect(log.toJSON()).toEqual({ history: [originalEvent, correctionEvent] })
  })

  it('returns defensive relationship snapshots', () => {
    const event = AuditEvent.from(correctionEvent)
    const snapshot = event.toJSON()

    ;(snapshot.relationships?.[0]?.target.entity as { id: string }).id = 'changed'

    expect(event.toJSON()).toEqual(correctionEvent)
  })
})
