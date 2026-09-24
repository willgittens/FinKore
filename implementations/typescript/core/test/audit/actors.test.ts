// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { deepStrictEqual as assertJson } from 'node:assert/strict'
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

  it('preserves every portable JSON metadata shape and shared values defensively', () => {
    const shared = { flag: true }
    const metadata = {
      nullValue: null,
      stringValue: 'finance',
      booleanValue: false,
      numberValue: 12.5,
      arrayValue: [0, 'x', true, { nested: null }],
      sharedValues: [shared, shared],
    }
    const serialized = AuditActor.from({ id: 'user-7', metadata }).toJSON()

    expect(serialized.metadata).toEqual(metadata)
    expect(serialized.metadata).not.toBe(metadata)
    expect((serialized.metadata as typeof metadata).sharedValues[0]).not.toBe(shared)
  })

  it('accepts null-prototype JSON objects without retaining their prototype', () => {
    const metadata = Object.create(null) as Record<string, unknown>
    metadata.department = 'finance'

    const serialized = AuditActor.from({ id: 'user-7', metadata }).toJSON()

    expect(serialized.metadata).toEqual({ department: 'finance' })
    expect(Object.getPrototypeOf(serialized.metadata)).toBe(Object.prototype)
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
    expect(() => AuditActor.from({ id: 'user-7', metadata: undefined })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', metadata: 1n })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', metadata: Number.NaN })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', metadata: Number.POSITIVE_INFINITY })).toThrow(InvalidAuditActorError)
    expect(() => AuditActor.from({ id: 'user-7', metadata: new Date('2026-09-01T12:00:00Z') })).toThrow(
      InvalidAuditActorError,
    )

    const symbolMetadata = { department: 'finance', [Symbol('private')]: true }
    expect(() => AuditActor.from({ id: 'user-7', metadata: symbolMetadata })).toThrow(InvalidAuditActorError)

    const cyclicArray: unknown[] = []
    cyclicArray.push(cyclicArray)
    // Keep mutant failures compact instead of formatting a recursive error trace.
    let cycleFailure0: unknown
    try { AuditActor.from({ id: 'user-7', metadata: cyclicArray }) } catch (error) { cycleFailure0 = error }
    expect(cycleFailure0 instanceof InvalidAuditActorError).toBe(true)
    expect((cycleFailure0 as InvalidAuditActorError).code).toBe('FINKORE_AUDIT_ACTOR_INVALID')

    const cyclicObject: Record<string, unknown> = {}
    cyclicObject.self = cyclicObject
    // Keep mutant failures compact instead of formatting a recursive error trace.
    let cycleFailure1: unknown
    try { AuditActor.from({ id: 'user-7', metadata: cyclicObject }) } catch (error) { cycleFailure1 = error }
    expect(cycleFailure1 instanceof InvalidAuditActorError).toBe(true)
    expect((cycleFailure1 as InvalidAuditActorError).code).toBe('FINKORE_AUDIT_ACTOR_INVALID')
  })

  it('returns defensive actor copies', () => {
    const actor = AuditActor.from({ id: 'user-7', metadata: { department: 'finance' } })
    const snapshot = actor.toJSON() as { metadata: { department: string } }

    snapshot.metadata.department = 'changed'

    expect(actor.toJSON()).toEqual({ id: 'user-7', metadata: { department: 'finance' } })
  })
})

// Node compares own constructor members as data; Vitest strict equality treats them as type markers.
describe('Audit Actor own JSON member observations', () => {
  it('retains own members, null prototypes and shared inputs in every observation', () => {
    const payload = Object.assign(Object.create(null) as Record<string, unknown>, { constructor: { prototype: 'data' } })
    Object.defineProperty(payload, '__proto__', { value: [null, { value: true }], enumerable: true, writable: true })
    const input = { id: 'opaque :: actor', metadata: { first: payload, second: payload } }
    const expected = JSON.parse(JSON.stringify(input))
    const actor = AuditActor.from(input)
    payload['__proto__'] = false
    expect(actor.id).toBe(input.id)
    assertJson(actor.toJSON(), expected)
    const observation = actor.toJSON().metadata as typeof input.metadata
    observation.first['__proto__'] = 'changed'
    assertJson(actor.toJSON(), expected)
  })

  it('rejects unsupported values even beneath ordinary special-name members', () => {
    for (const value of [undefined, NaN, Infinity, 1n, () => true, new Date(), Symbol('x')]) {
      expect(() => AuditActor.from({ id: 'actor', metadata: { ['__proto__']: value } })).toThrow(InvalidAuditActorError)
    }
  })
})
