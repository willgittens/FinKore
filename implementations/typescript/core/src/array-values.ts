// SPDX-License-Identifier: MPL-2.0
/**
 * Reads indexed Array positions, including holes as undefined, without invoking
 * a caller's iterator override. Domain callers still validate each member and
 * choose its portable error; this helper supplies no financial rule.
 * @internal
 */
export function arrayValues(value: readonly unknown[]): ArrayIterator<unknown> {
  return Array.prototype.values.call(value) as ArrayIterator<unknown>
}
