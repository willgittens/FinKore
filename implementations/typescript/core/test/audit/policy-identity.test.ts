// SPDX-License-Identifier: MPL-2.0
import { expect, it } from 'vitest'
import { AuditLog, InvalidAuditRedactionError, type AuditRedactionPolicy } from '../../src/index.js'
import { validateAuditRedactionPolicy } from '../../src/audit/audit-redaction.js'

const source = {
  eventId: 'source', eventType: 'CONTEXT_RECORDED',
  entity: { type: 'invoice', id: 'invoice-1' }, occurredAt: '2026-09-01T12:00:00Z',
  actor: { id: 'alice', displayName: 'Private' },
}
const evidence = { ...source, eventId: 'redacted', actor: { id: 'privacy' } }
const policy = { authority: 'retention', protectedPaths: ['actor.displayName'] }
const view = { ...source, actor: { ...source.actor, displayName: { presence: 'REDACTED' } } }

// Classify a portable rejection of valid input as a behavioral failure; host errors escape.
function outcome(action: () => unknown): unknown {
  try { return { status: 'success', value: action() } } catch (error) {
    if (!(error instanceof InvalidAuditRedactionError)) throw error
    return { status: 'error', code: error.code }
  }
}

it.each([
  ['omitted', {}], ['string', { id: 'retention' }], ['whitespace', { id: ' ' }],
  ['unicode', { id: 'política-保護' }], ['special-name', { id: '__proto__' }],
])('policy097 accepts %s and reuses actual history', (_name, identity) => {
  const candidate = { ...policy, ...identity }
  const before = structuredClone(candidate)
  const log = AuditLog.create([source])
  expect(outcome(() => validateAuditRedactionPolicy(candidate)))
    .toStrictEqual({ status: 'success', value: candidate })
  expect(outcome(() => log.redact({ policy: candidate as AuditRedactionPolicy, redactionEvent: evidence })))
    .toStrictEqual({ status: 'success', value: { event: view, evidenceEvent: evidence } })
  expect(log.events()).toStrictEqual([source, evidence])
  const later = { ...evidence, eventId: 'later' }
  const imported = AuditLog.create(log.events())
  imported.append(later)
  expect(imported.events()).toStrictEqual([source, evidence, later])
  expect(candidate).toStrictEqual(before)
})

it.each([
  ['null', null], ['empty', ''], ['false', false], ['true', true], ['zero', 0],
  ['number', 42], ['array', []], ['object', {}], ['nonempty-array', ['retention']],
  ['undefined', undefined], ['boxed-string', Object('retention')], ['symbol', Symbol('retention')],
  ['function', () => 'retention'], ['bigint', 1n],
])('policy097 rejects %s without committing evidence', (_name, id) => {
  const candidate = { ...policy, id }
  const log = AuditLog.create([source])
  expect(() => log.redact({ policy: candidate as unknown as AuditRedactionPolicy, redactionEvent: evidence }))
    .toThrowError(expect.objectContaining({ code: 'FINKORE_AUDIT_REDACTION_INVALID' }))
  expect(log.events()).toStrictEqual([source])
  expect(candidate.id).toBe(id)
  log.append(evidence)
  expect(log.events()).toStrictEqual([source, evidence])
})

it('policy097 validates policy before malformed evidence', () => {
  const log = AuditLog.create([source])
  expect(() => log.redact({
    policy: { ...policy, id: null } as unknown as AuditRedactionPolicy,
    redactionEvent: { ...evidence, actor: null } as unknown as typeof evidence,
  })).toThrow(InvalidAuditRedactionError)
  expect(log.events()).toStrictEqual([source])
})
