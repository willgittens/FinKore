// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { comparePortableTimestamps, parsePortableTimestamp } from '../../src/portable-timestamp.js'

describe('Portable timestamps', () => {
  it('parses exact epoch seconds across calendar and offset boundaries', () => {
    expect(parsePortableTimestamp('0001-01-01T00:00:00Z')).toEqual({
      epochSecond: -62135596800n,
      nanosecond: 0,
    })
    expect(parsePortableTimestamp('1900-03-01T00:00:00Z')).toEqual({
      epochSecond: -2203891200n,
      nanosecond: 0,
    })
    expect(parsePortableTimestamp('2000-02-29T00:00:00Z')).toEqual({
      epochSecond: 951782400n,
      nanosecond: 0,
    })
    expect(parsePortableTimestamp('2026-09-01T12:34:56.123456789Z')).toEqual({
      epochSecond: 1788266096n,
      nanosecond: 123456789,
    })
    expect(parsePortableTimestamp('9999-12-31T23:59:59Z')).toEqual({
      epochSecond: 253402300799n,
      nanosecond: 0,
    })
    expect(parsePortableTimestamp('2026-09-01T12:34:56+02:30')).toEqual({
      epochSecond: 1788257096n,
      nanosecond: 0,
    })
    expect(parsePortableTimestamp('2026-09-01T12:34:56-02:30')).toEqual({
      epochSecond: 1788275096n,
      nanosecond: 0,
    })
  })

  it('accepts each portable syntax boundary', () => {
    for (const timestamp of [
      '2024-02-29T23:59:59.1Z',
      '2026-01-01T00:00:00.000000001+00:00',
      '2026-12-31T23:59:59.999999999-00:01',
      '2026-01-01T00:00:00-01:00',
      '2026-01-01T00:00:00+23:59',
      '2026-01-01T00:00:00-23:59',
      '2026-04-30T00:00:00Z',
      '2026-06-30T00:00:00Z',
      '2026-09-30T00:00:00Z',
      '2026-11-30T00:00:00Z',
    ]) {
      expect(() => parsePortableTimestamp(timestamp)).not.toThrow()
    }
  })

  it('rejects every out-of-profile date, time, offset, and precision boundary', () => {
    for (const timestamp of [
      null,
      0,
      {},
      '',
      '0000-01-01T00:00:00Z',
      '2026-00-01T00:00:00Z',
      '2026-13-01T00:00:00Z',
      '2026-01-00T00:00:00Z',
      '2026-01-32T00:00:00Z',
      '2023-02-29T00:00:00Z',
      '1900-02-29T00:00:00Z',
      '2026-04-31T00:00:00Z',
      '2026-06-31T00:00:00Z',
      '2026-09-31T00:00:00Z',
      '2026-11-31T00:00:00Z',
      '2026-01-01T24:00:00Z',
      '2026-01-01T23:60:00Z',
      '2026-01-01T23:59:60Z',
      '2026-01-01T00:00:00+24:00',
      '2026-01-01T00:00:00+00:60',
      '2026-01-01T00:00:00-00:00',
      '2026-01-01t00:00:00Z',
      '2026-01-01T00:00:00z',
      '20260101T000000Z',
      '2026-1-01T00:00:00Z',
      '2026-01-1T00:00:00Z',
      '2026-01-01T0:00:00Z',
      '2026-01-01T00:0:00Z',
      '2026-01-01T00:00:0Z',
      '2026-01-01T00:00:00.Z',
      '2026-01-01T00:00:00.1234567890Z',
      '2026-01-01T00:00:00Z-suffix',
      'prefix-2026-01-01T00:00:00Z',
    ]) {
      expect(() => parsePortableTimestamp(timestamp)).toThrow(RangeError)
    }
  })

  it('compares exact fractional instants and both offset directions', () => {
    expect(comparePortableTimestamps('2026-01-01T00:00:00Z', '2026-01-01T00:00:00.000000000Z')).toBe(0)
    expect(comparePortableTimestamps('2026-01-01T00:00:00.1Z', '2026-01-01T00:00:00.100000000Z')).toBe(0)
    expect(comparePortableTimestamps('2026-01-01T00:00:00.000000001Z', '2026-01-01T00:00:00.000000002Z')).toBeLessThan(0)
    expect(comparePortableTimestamps('2026-01-01T00:00:00.000000002Z', '2026-01-01T00:00:00.000000001Z')).toBeGreaterThan(0)
    expect(comparePortableTimestamps('2026-01-01T02:30:00+02:30', '2026-01-01T00:00:00Z')).toBe(0)
    expect(comparePortableTimestamps('2025-12-31T21:30:00-02:30', '2026-01-01T00:00:00Z')).toBe(0)
    expect(comparePortableTimestamps('2026-01-02T00:00:00Z', '2026-01-01T23:59:59Z')).toBeGreaterThan(0)
  })
})
