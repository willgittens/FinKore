// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { AuditActor, InvalidAuditActorError } from '../../src/index.js'

describe('Audit actors', () => {
  it('represents a known actor with stable opaque identity and optional type', () => {
    const actor = AuditActor.from({ type: 'service', id: 'settlement-importer' })

    expect(actor.id).toBe('settlement-importer')
    expect(actor.toJSON()).toEqual({ type: 'service', id: 'settlement-importer' })
  })

  it('preserves display metadata without replacing stable identity', () => {
    const actor = AuditActor.from({ id: 'user-7', type: 'user', displayName: 'Pat Finance' })

    expect(actor.id).toBe('user-7')
    expect(actor.toJSON()).toEqual({ id: 'user-7', type: 'user', displayName: 'Pat Finance' })
  })

  it('omits optional actor fields that were not supplied', () => {
    const serialized = AuditActor.from({ id: 'user-7' }).toJSON()

    expect(Object.keys(serialized)).toEqual(['id'])
    expect('type' in serialized).toBe(false)
    expect('displayName' in serialized).toBe(false)
    expect('metadata' in serialized).toBe(false)
  })

  it('preserves explicit null actor metadata as distinct from omission', () => {
    const serialized = AuditActor.from({ id: 'user-7', type: 'user', metadata: null }).toJSON()

    expect(serialized).toEqual({ id: 'user-7', type: 'user', metadata: null })
    expect('metadata' in serialized).toBe(true)
  })

  it('does not normalize actor identifiers or reject unknown actor types', () => {
    expect(AuditActor.from({ id: 'USER-7', type: 'agent' }).toJSON()).toEqual({ id: 'USER-7', type: 'agent' })
    expect(AuditActor.from({ id: 'user-7', type: 'new-system-kind' }).toJSON()).toEqual({
      id: 'user-7',
      type: 'new-system-kind',
    })
  })

  it('rejects malformed known actor attribution', () => {
    expect(() => AuditActor.from({ type: 'user' })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: '' })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from(null)).toThrow(InvalidAuditActorError)
    const callableActor = Object.assign(() => undefined, { id: 'user-7' })

    expect(() => AuditActor.from(7)).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from(callableActor)).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', type: '' })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', type: 7 })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', displayName: 7 })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', type: null })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', displayName: null })).toThrow(InvalidAuditActorError)
  })

  it('returns defensive actor copies', () => {
    const actor = AuditActor.from({ id: 'user-7', metadata: { department: 'finance' } })
    const snapshot = actor.toJSON() as { metadata: { department: string } }

    snapshot.metadata.department = 'changed'

    expect(actor.toJSON()).toEqual({ id: 'user-7', metadata: { department: 'finance' } })
  })
})
