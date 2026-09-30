// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { isDeepStrictEqual } from 'node:util'
import { AuditEvent, AuditLog, InvalidAuditEventError } from '../../src/index.js'

const event = {
  eventId: 'context', eventType: 'CONTEXT_RECORDED',
  entity: { type: 'invoice', id: 'invoice-1' }, occurredAt: '2026-09-01T12:00:00Z',
}
const source = { ...event, eventId: 'source', actor: { id: 'alice', displayName: 'Private' } }
const policy = { id: 'retention', authority: 'retention', protectedPaths: ['actor.displayName'] }

// AUDIT-EVENT-009 / AUDIT-ERROR-001/004: host errors are never portable rejection.
function invalid(action: () => unknown): void {
  let failure: unknown
  try { action() } catch (error) { failure = error }
  if (failure !== undefined && !(failure instanceof InvalidAuditEventError)) throw failure
  expect(failure).toBeInstanceOf(InvalidAuditEventError)
  expect((failure as InvalidAuditEventError).code).toBe('FINKORE_AUDIT_INVALID_EVENT')
}

const unsupported: readonly [string, () => unknown][] = [
  ['undefined', () => undefined], ['function', () => () => 1],
  ['symbol', () => Symbol('context')], ['bigint', () => 1n],
  ['nan', () => NaN], ['infinity', () => Infinity], ['negative-infinity', () => -Infinity],
  ['date', () => new Date('2026-09-01T00:00:00Z')], ['map', () => new Map([['x', 1]])],
  ['set', () => new Set([1])], ['regexp', () => /context/], ['typed-array', () => new Uint8Array([1])],
  ['boxed-number', () => Object(1)], ['instance', () => new (class Context { value = 1 })()],
  ['object-cycle', () => { const value: Record<string, unknown> = {}; value.self = value; return value }],
  ['array-cycle', () => { const value: unknown[] = []; value.push(value); return value }],
  ['nested-cycle', () => { const value: Record<string, unknown> = {}; value.items = [value]; return { nested: value } }],
  ['sparse-array', () => [1, , 2]],
  ['symbol-member', () => ({ [Symbol('context')]: 1 })],
  ['nested-undefined', () => ({ ['__proto__']: undefined })],
]

for (const [name, make] of unsupported) {
  for (const boundary of ['construct', 'import', 'append', 'redact'] as const) {
    it(`metadata097 rejects ${name} at ${boundary}`, () => {
      const metadata = make()
      const candidate = { ...event, metadata }
      const log = AuditLog.create([source])
      const before = log.events()
      const attempt = () => {
        if (boundary === 'construct') return AuditEvent.from(candidate)
        if (boundary === 'import') return AuditLog.create([source, candidate])
        if (boundary === 'append') return log.append(candidate)
        return log.redact({ policy, redactionEvent: candidate })
      }
      invalid(attempt)
      expect(candidate.metadata).toBe(metadata)
      expect(log.events()).toStrictEqual(before)
      log.append({ ...event, metadata: null })
      expect(log.events()).toStrictEqual([source, { ...event, metadata: null }])
    })
  }
}

it('metadata097 JSON control preserves presence, own names and ownership', () => {
  const shared = { ['__proto__']: [null, false, 0, ''], constructor: { value: 1 } }
  const metadata = { left: shared, right: shared }
  const candidate = { ...event, metadata }
  const expected = structuredClone(candidate)
  const retained = AuditEvent.from(candidate)
  const log = AuditLog.create([candidate])
  shared.constructor.value = 2
  const observed = retained.toJSON().metadata as typeof metadata
  observed.left.constructor.value = 3
  // Own constructor members are data, not the matcher's prototype heuristic.
  expect(isDeepStrictEqual(retained.toJSON(), expected)).toBe(true)
  expect(isDeepStrictEqual(log.events(), [expected])).toBe(true)
  expect(AuditEvent.from(event).toJSON()).toStrictEqual(event)
  for (const value of [null, false, 0, '', [], {}]) {
    expect(AuditEvent.from({ ...event, metadata: value }).toJSON()).toStrictEqual({ ...event, metadata: value })
  }
  const dictionary = Object.create(null) as Record<string, unknown>
  dictionary.context = [1.25, -2, { nested: true }]
  expect(AuditEvent.from({ ...event, metadata: dictionary }).toJSON().metadata)
    .toStrictEqual({ context: [1.25, -2, { nested: true }] })
})

it('metadata097 scalar control', () => {
  expect(AuditEvent.from(event).toJSON()).toStrictEqual(event)
  expect(AuditEvent.from({ ...event, metadata: null }).toJSON()).toStrictEqual({ ...event, metadata: null })
})

it('metadata097 invalid metadata precedes actor and duplicate failures', () => {
  const log = AuditLog.create([source])
  invalid(() => log.append({ ...source, actor: null, metadata: new Map() }))
  expect(log.events()).toStrictEqual([source])
  invalid(() => AuditLog.create([{ ...source, metadata: new Map() }, { ...event, actor: null }]))
})

it('metadata097 indexed arrays ignore a caller iterator', () => {
  const metadata = [undefined]
  Object.defineProperty(metadata, Symbol.iterator, { value: function* () { yield null } })
  invalid(() => AuditEvent.from({ ...event, metadata }))
  expect(metadata[0]).toBeUndefined()
})

it('metadata097 redaction evidence preserves explicit null and unrelated context', () => {
  const original = { ...source, metadata: { ['__proto__']: [null, 0] } }
  const evidence = { ...event, metadata: null }
  const log = AuditLog.create([original])
  const result = log.redact({ policy, redactionEvent: evidence })
  expect(result.evidenceEvent).toStrictEqual(evidence)
  expect(result.event.metadata).toStrictEqual(original.metadata)
  expect(log.events()).toStrictEqual([original, evidence])
})

// The stricter output copier must not mask missing constructor validation.
// AUDIT-RELATIONSHIP-003: reject unsupported types before returning an Event.
it.each(['RELATED_TO', null, 0, {}])('metadata097 construction rejects relationship type %j', (type) => {
  invalid(() => AuditEvent.from({
    ...event,
    relationships: [{ relationshipId: 'rel', type, target: { eventId: 'source', entity: event.entity } }],
  }))
})
