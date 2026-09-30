// SPDX-License-Identifier: MPL-2.0


interface ParsedPortableTimestamp {
  readonly epochSecond: bigint
  readonly nanosecond: number
}

function component(match: RegExpMatchArray, index: number): number {
  return Number(match[index])
}

function invalidTimestamp(): never {
  throw new RangeError()
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function daysInMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
    default:
      return 31
  }
}

function daysFromUnixEpoch(year: number, month: number, day: number): number {
  const adjustedYear = year - (month <= 2 ? 1 : 0)
  const era = Math.floor(adjustedYear / 400)
  const yearOfEra = adjustedYear - era * 400
  const adjustedMonth = month + (month > 2 ? -3 : 9)
  const dayOfYear = Math.floor((153 * adjustedMonth + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146097 + dayOfEra - 719468
}

/**
 * Parses the strict portable FinKore RFC 3339 profile without losing any
 * accepted fractional digit.
 *
 * @internal
 * @see SPEC-TIMESTAMP-001
 * @see SPEC-TIMESTAMP-002
 * @see SPEC-TIMESTAMP-003
 * @see SPEC-TIMESTAMP-004
 */
export function parsePortableTimestamp(value: unknown): ParsedPortableTimestamp {
  const PORTABLE_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/u
  if (typeof value !== 'string') invalidTimestamp()
  const match = value.match(PORTABLE_TIMESTAMP)
  if (match === null) invalidTimestamp()

  const year = component(match, 1)
  const month = component(match, 2)
  const day = component(match, 3)
  const hour = component(match, 4)
  const minute = component(match, 5)
  const second = component(match, 6)
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    invalidTimestamp()
  }

  const zone = match[8] as string
  let offsetSeconds = 0
  if (zone !== 'Z') {
    const sign = match[9]
    const offsetHour = component(match, 10)
    const offsetMinute = component(match, 11)
    if (offsetHour > 23 || offsetMinute > 59 || (sign === '-' && offsetHour === 0 && offsetMinute === 0)) {
      invalidTimestamp()
    }
    const offsetMagnitude = (offsetHour * 60 + offsetMinute) * 60
    offsetSeconds = sign === '+' ? offsetMagnitude : -offsetMagnitude
  }

  const fraction = match[7] ?? ''
  const nanosecond = Number(fraction.padEnd(9, '0'))
  const localSecond =
    daysFromUnixEpoch(year, month, day) * 86400 + hour * 3600 + minute * 60 + second
  return { epochSecond: BigInt(localSecond - offsetSeconds), nanosecond }
}

/**
 * Compares two valid portable timestamps by exact instant.
 *
 * @internal
 * @returns A negative value, zero, or a positive value when the left instant
 * is before, equal to, or after the right instant.
 * @see SPEC-TIMESTAMP-005
 */
export function comparePortableTimestamps(left: unknown, right: unknown): number {
  const leftInstant = parsePortableTimestamp(left)
  const rightInstant = parsePortableTimestamp(right)
  if (leftInstant.epochSecond < rightInstant.epochSecond) return -1
  if (leftInstant.epochSecond > rightInstant.epochSecond) return 1
  return leftInstant.nanosecond - rightInstant.nanosecond
}
