// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * A FinKore Money value containing one exact base-10 amount and one currency.
 *
 * <p>Money arithmetic is exact, preserves currency, and never mutates operands.
 *
 * @see <a href="../../../../../../spec/money/representation.md">MONEY-REPRESENTATION-001</a>
 * @see <a href="../../../../../../spec/money/serialization.md">MONEY-SERIALIZATION-001</a>
 */
public final class Money {
  public static final String INVALID_AMOUNT = "FINKORE_MONEY_INVALID_AMOUNT";
  public static final String INVALID_CURRENCY = "FINKORE_MONEY_INVALID_CURRENCY";
  public static final String CURRENCY_MISMATCH = "FINKORE_MONEY_CURRENCY_MISMATCH";
  public static final String DIVISION_BY_ZERO = "FINKORE_MONEY_DIVISION_BY_ZERO";
  public static final String ROUNDING_REQUIRED = "FINKORE_MONEY_ROUNDING_REQUIRED";
  public static final String INVALID_ROUNDING = "FINKORE_MONEY_INVALID_ROUNDING";
  public static final String INVALID_ALLOCATION = "FINKORE_MONEY_INVALID_ALLOCATION";

  private static final Pattern AMOUNT = Pattern.compile("-?(?:0|[0-9]+)(?:\\.[0-9]+)?");
  private static final Pattern CURRENCY = Pattern.compile("[A-Z]{3}");

  private final BigDecimal amount;
  private final String currency;
  private final Integer presentationScale;

  private Money(BigDecimal amount, String currency, Integer presentationScale) {
    this.amount = amount;
    this.currency = currency;
    this.presentationScale = presentationScale;
  }

  /**
   * Parses FinKore portable Money JSON.
   *
   * <p>Unknown members are ignored and cannot alter amount or currency meaning.
   *
   * @param value portable Money object
   * @return parsed Money value
   * @throws FinKoreException with a Money portable error code
   */
  public static Money fromPortable(Object value) {
    if (!(value instanceof Map<?, ?> map)) {
      throw new FinKoreException(INVALID_AMOUNT);
    }
    Object amountValue = map.get("amount");
    BigDecimal parsed = plainDecimal(amountValue);
    Object currencyValue = map.get("currency");
    if (!(currencyValue instanceof String currencyText) || !CURRENCY.matcher(currencyText).matches()) {
      throw new FinKoreException(INVALID_CURRENCY);
    }
    return new Money(parsed, currencyText, scaleOf((String) amountValue));
  }

  /**
   * Serializes this value as FinKore portable Money JSON.
   *
   * @return map containing amount and currency
   */
  public Map<String, Object> toPortable() {
    return toPortable(presentationScale);
  }

  /**
   * Serializes this value with an explicit presentation scale when supplied.
   *
   * @param scale desired amount scale, or {@code null} to use the value scale
   * @return map containing amount and currency
   */
  public Map<String, Object> toPortable(Integer scale) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("amount", format(amount, scale));
    result.put("currency", currency);
    return result;
  }

  /**
   * Adds compatible Money values exactly.
   *
   * @param other compatible Money value
   * @return exact sum
   */
  public Money add(Money other) {
    compatible(other);
    return new Money(amount.add(other.amount), currency, null);
  }

  /**
   * Subtracts compatible Money values exactly.
   *
   * @param other compatible Money value
   * @return exact difference
   */
  public Money subtract(Money other) {
    compatible(other);
    return new Money(amount.subtract(other.amount), currency, null);
  }

  /**
   * Returns the exact additive inverse.
   *
   * @return negated Money value
   */
  public Money negate() {
    return new Money(amount.negate(), currency, presentationScale);
  }

  /**
   * Multiplies by an exact decimal scalar.
   *
   * @param scalar scalar as FinKore plain decimal text
   * @return exact product
   */
  public Money multiply(Object scalar) {
    return new Money(amount.multiply(plainDecimal(scalar)), currency, null);
  }

  /**
   * Divides by a non-zero exact decimal scalar.
   *
   * @param scalar scalar as FinKore plain decimal text
   * @return exact quotient
   */
  public Money divide(Object scalar) {
    BigDecimal divisor = plainDecimal(scalar);
    if (divisor.signum() == 0) {
      throw new FinKoreException(DIVISION_BY_ZERO);
    }
    try {
      BigDecimal result = amount.divide(divisor);
      return new Money(result.stripTrailingZeros(), currency, Math.max(0, result.stripTrailingZeros().scale()));
    } catch (ArithmeticException error) {
      throw new FinKoreException(ROUNDING_REQUIRED);
    }
  }

  /**
   * Compares compatible Money values numerically.
   *
   * @param other compatible Money value
   * @return LESS, EQUAL, or GREATER
   */
  public String compare(Money other) {
    compatible(other);
    int comparison = amount.compareTo(other.amount);
    if (comparison < 0) {
      return "LESS";
    }
    if (comparison > 0) {
      return "GREATER";
    }
    return "EQUAL";
  }

  /**
   * Rounds to an explicit target scale with a portable rounding mode.
   *
   * @param scale target decimal places
   * @param mode portable rounding mode
   * @return rounded value
   */
  public Money round(Object scale, Object mode) {
    int targetScale = validScale(scale, INVALID_ROUNDING);
    return new Money(amount.setScale(targetScale, roundingMode(mode)), currency, targetScale);
  }

  /**
   * Applies an exact decimal or percentage Rate to this Money value.
   *
   * @param rate portable rate object
   * @param rounding optional portable rounding policy
   * @return resulting Money value
   */
  public Money applyRate(Object rate, Object rounding) {
    if (!(rate instanceof Map<?, ?> rateMap)) {
      throw new FinKoreException(INVALID_AMOUNT);
    }
    Object kind = rateMap.get("kind");
    if (!"DECIMAL".equals(kind) && !"PERCENTAGE".equals(kind)) {
      throw new FinKoreException(INVALID_AMOUNT);
    }
    BigDecimal scalar = plainDecimal(rateMap.get("value"));
    if ("PERCENTAGE".equals(kind)) {
      scalar = scalar.divide(new BigDecimal("100"));
    }
    Money result = new Money(amount.multiply(scalar), currency, null);
    if (rounding == null) {
      return result;
    }
    if (!(rounding instanceof Map<?, ?> roundingMap)) {
      throw new FinKoreException(INVALID_ROUNDING);
    }
    return result.round(roundingMap.get("scale"), roundingMap.get("mode"));
  }

  /**
   * Allocates this value in declared order at an explicit target scale.
   *
   * <p>The target scale is bounded by 50, the equal-part count by 100, and ratio
   * entries by 9007199254740991. The source value is never mutated.
   *
   * @param allocation equal or ratio allocation request using portable integer ranges
   * @param scale target decimal places in the inclusive range 0 through 50
   * @return allocated parts preserving total amount
   * @throws FinKoreException with {@link #INVALID_ALLOCATION} for malformed or
   *     out-of-range allocation requests, or {@link #ROUNDING_REQUIRED} when
   *     the source is not representable at the requested scale
   */
  public List<Money> allocate(Object allocation, Object scale) {
    int targetScale = validAllocationInteger(scale, 0, 50).intValueExact();
    if (!(allocation instanceof Map<?, ?> allocationMap)) {
      throw new FinKoreException(INVALID_ALLOCATION);
    }
    List<BigInteger> weights = allocationWeights(allocationMap);
    BigDecimal scaled = amount.movePointRight(targetScale);
    BigInteger units;
    try {
      units = scaled.toBigIntegerExact();
    } catch (ArithmeticException error) {
      throw new FinKoreException(ROUNDING_REQUIRED);
    }
    int sign = units.signum() < 0 ? -1 : 1;
    BigInteger absolute = units.abs();
    BigInteger total = weights.stream().reduce(BigInteger.ZERO, BigInteger::add);
    List<BigInteger> base = new ArrayList<>();
    BigInteger assigned = BigInteger.ZERO;
    for (BigInteger weight : weights) {
      BigInteger value = absolute.multiply(weight).divide(total);
      base.add(value);
      assigned = assigned.add(value);
    }
    BigInteger remainder = absolute.subtract(assigned);
    for (int index = 0; index < remainder.intValueExact(); index += 1) {
      base.set(index, base.get(index).add(BigInteger.ONE));
    }
    List<Money> result = new ArrayList<>();
    for (BigInteger value : base) {
      result.add(new Money(new BigDecimal(value.multiply(BigInteger.valueOf(sign)), targetScale), currency, targetScale));
    }
    return result;
  }

  private void compatible(Money other) {
    if (!currency.equals(other.currency)) {
      throw new FinKoreException(CURRENCY_MISMATCH);
    }
  }

  private static BigDecimal plainDecimal(Object value) {
    if (!(value instanceof String text) || !AMOUNT.matcher(text).matches()) {
      throw new FinKoreException(INVALID_AMOUNT);
    }
    return new BigDecimal(text);
  }

  private static int scaleOf(String text) {
    int dot = text.indexOf('.');
    return dot < 0 ? 0 : text.length() - dot - 1;
  }

  private static int validScale(Object value, String code) {
    BigInteger integer = validPositiveOrZeroInteger(value, code);
    if (integer.compareTo(BigInteger.valueOf(Integer.MAX_VALUE)) > 0) {
      throw new FinKoreException(code);
    }
    return integer.intValueExact();
  }

  private static BigInteger validPositiveOrZeroInteger(Object value, String code) {
    if (value instanceof BigInteger integer) {
      if (integer.signum() < 0) {
        throw new FinKoreException(code);
      }
      return integer;
    }
    if (value instanceof Integer integer) {
      if (integer < 0) {
        throw new FinKoreException(code);
      }
      return BigInteger.valueOf(integer);
    }
    if (value instanceof Long integer) {
      if (integer < 0) {
        throw new FinKoreException(code);
      }
      return BigInteger.valueOf(integer);
    }
    throw new FinKoreException(code);
  }

  private static BigInteger validAllocationInteger(Object value, long minimum, long maximum) {
    BigInteger integer;
    if (value instanceof BigDecimal decimal) {
      try {
        integer = decimal.toBigIntegerExact();
      } catch (ArithmeticException error) {
        throw new FinKoreException(INVALID_ALLOCATION);
      }
    } else if (value instanceof Double || value instanceof Float) {
      double number = ((Number) value).doubleValue();
      if (!Double.isFinite(number) || number != Math.rint(number)) {
        throw new FinKoreException(INVALID_ALLOCATION);
      }
      integer = BigDecimal.valueOf(number).toBigIntegerExact();
    } else if (value instanceof Short || value instanceof Byte) {
      integer = BigInteger.valueOf(((Number) value).longValue());
    } else {
      integer = validPositiveOrZeroInteger(value, INVALID_ALLOCATION);
    }
    if (integer.compareTo(BigInteger.valueOf(minimum)) < 0
        || integer.compareTo(BigInteger.valueOf(maximum)) > 0) {
      throw new FinKoreException(INVALID_ALLOCATION);
    }
    return integer;
  }

  private static RoundingMode roundingMode(Object mode) {
    if (!(mode instanceof String text)) {
      throw new FinKoreException(INVALID_ROUNDING);
    }
    return switch (text) {
      case "HALF_UP" -> RoundingMode.HALF_UP;
      case "HALF_EVEN" -> RoundingMode.HALF_EVEN;
      case "DOWN" -> RoundingMode.DOWN;
      case "UP" -> RoundingMode.UP;
      case "FLOOR" -> RoundingMode.FLOOR;
      case "CEILING" -> RoundingMode.CEILING;
      default -> throw new FinKoreException(INVALID_ROUNDING);
    };
  }

  private static List<BigInteger> allocationWeights(Map<?, ?> allocation) {
    Object method = allocation.get("method");
    if ("EQUAL".equals(method)) {
      int parts = validAllocationInteger(allocation.get("parts"), 1, 100).intValueExact();
      List<BigInteger> weights = new ArrayList<>();
      for (int index = 0; index < parts; index += 1) {
        weights.add(BigInteger.ONE);
      }
      return weights;
    }
    if ("RATIO".equals(method) && allocation.get("ratios") instanceof List<?> ratios && !ratios.isEmpty()) {
      List<BigInteger> weights = new ArrayList<>();
      for (Object ratio : ratios) {
        weights.add(validAllocationInteger(ratio, 1, 9007199254740991L));
      }
      return weights;
    }
    throw new FinKoreException(INVALID_ALLOCATION);
  }

  private static String format(BigDecimal value, Integer scale) {
    BigDecimal output = scale == null ? value : value.setScale(scale);
    if (output.signum() == 0) {
      output = output.abs();
    }
    return output.toPlainString();
  }
}
