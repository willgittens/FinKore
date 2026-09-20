// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Strict parser and exact comparable value for the portable FinKore RFC 3339
 * timestamp profile.
 *
 * @see <a href="../../../../../../spec/conventions.md">SPEC-TIMESTAMP-001 through -005</a>
 */
final class PortableTimestamp {
  private static final Pattern PATTERN = Pattern.compile(
      "(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})"
          + "(?:\\.(\\d{1,9}))?(Z|([+-])(\\d{2}):(\\d{2}))");

  private PortableTimestamp() {}

  /**
   * Parses a portable timestamp without truncating accepted fractional digits.
   *
   * @param value candidate serialized timestamp
   * @return exact comparable instant
   * @throws IllegalArgumentException when the value is outside the portable profile
   */
  static InstantValue parse(Object value) {
    if (!(value instanceof String text)) {
      throw new IllegalArgumentException("Invalid portable timestamp");
    }
    Matcher matcher = PATTERN.matcher(text);
    if (!matcher.matches()) {
      throw new IllegalArgumentException("Invalid portable timestamp");
    }

    try {
      int year = Integer.parseInt(matcher.group(1));
      int month = Integer.parseInt(matcher.group(2));
      int day = Integer.parseInt(matcher.group(3));
      int hour = Integer.parseInt(matcher.group(4));
      int minute = Integer.parseInt(matcher.group(5));
      int second = Integer.parseInt(matcher.group(6));
      if (year < 1 || hour > 23 || minute > 59 || second > 59) {
        throw new IllegalArgumentException("Invalid portable timestamp");
      }
      long epochDay = LocalDate.of(year, month, day).toEpochDay();

      int offsetSeconds = 0;
      if (!"Z".equals(matcher.group(8))) {
        String sign = matcher.group(9);
        int offsetHour = Integer.parseInt(matcher.group(10));
        int offsetMinute = Integer.parseInt(matcher.group(11));
        if (offsetHour > 23
            || offsetMinute > 59
            || ("-".equals(sign) && offsetHour == 0 && offsetMinute == 0)) {
          throw new IllegalArgumentException("Invalid portable timestamp");
        }
        offsetSeconds = (offsetHour * 60 + offsetMinute) * 60;
        if ("-".equals(sign)) {
          offsetSeconds = -offsetSeconds;
        }
      }

      String fraction = matcher.group(7);
      int nanosecond = fraction == null
          ? 0
          : Integer.parseInt((fraction + "000000000").substring(0, 9));
      long localSecond = epochDay * 86400L + hour * 3600L + minute * 60L + second;
      return new InstantValue(localSecond - offsetSeconds, nanosecond);
    } catch (DateTimeException | NumberFormatException error) {
      throw new IllegalArgumentException("Invalid portable timestamp", error);
    }
  }

  /** Exact seconds-plus-nanoseconds instant used only for domain comparison. */
  record InstantValue(long epochSecond, int nanosecond) implements Comparable<InstantValue> {
    @Override
    public int compareTo(InstantValue other) {
      int seconds = Long.compare(epochSecond, other.epochSecond);
      return seconds != 0 ? seconds : Integer.compare(nanosecond, other.nanosecond);
    }
  }
}
