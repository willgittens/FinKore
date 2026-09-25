// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** JUnit coverage tests for Java Money behavior. */
final class MoneyCoverageTest {
  @Test
  void nativeSerializationBoundaries() throws java.io.IOException {
    BoundaryRegressionTest.main(new String[]{"money.serialization."});
  }

  @Test
  void exactAdditionDoesNotUseBinaryFloatingPoint() {
    Money left = Money.fromPortable(Map.of("amount", "0.1", "currency", "EUR"));
    Money right = Money.fromPortable(Map.of("amount", "0.2", "currency", "EUR"));

    assertEquals(Map.of("amount", "0.3", "currency", "EUR"), left.add(right).toPortable());
    assertEquals(Map.of("amount", "0.1", "currency", "EUR"), left.toPortable());
  }

  @Test
  void rejectsInvalidPortableAmountSyntax() {
    FinKoreException error = assertThrows(FinKoreException.class, () -> Money.fromPortable(Map.of("amount", "1e3", "currency", "EUR")));
    assertEquals(Money.INVALID_AMOUNT, error.code());
  }

  @Test
  void rejectsInvalidPortableShapesAndCurrencySyntax() {
    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> Money.fromPortable("1.00")).code());
    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> Money.fromPortable(Map.of("amount", 1, "currency", "EUR"))).code());
    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> Money.fromPortable(Map.of("amount", "1.", "currency", "EUR"))).code());
    assertEquals(Money.INVALID_CURRENCY, assertThrows(FinKoreException.class, () -> Money.fromPortable(Map.of("amount", "1.00", "currency", "eur"))).code());
  }

  @Test
  void currencyMismatchUsesPortableCode() {
    Money left = Money.fromPortable(Map.of("amount", "1.00", "currency", "EUR"));
    Money right = Money.fromPortable(Map.of("amount", "1.00", "currency", "USD"));

    assertEquals(Money.CURRENCY_MISMATCH, assertThrows(FinKoreException.class, () -> left.compare(right)).code());
    assertEquals(Money.CURRENCY_MISMATCH, assertThrows(FinKoreException.class, () -> left.add(right)).code());
  }

  @Test
  void subtractNegateCompareAndZeroSerializationAreExact() {
    Money one = Money.fromPortable(Map.of("amount", "1.00", "currency", "EUR"));
    Money two = Money.fromPortable(Map.of("amount", "2.00", "currency", "EUR"));
    Money minusZero = Money.fromPortable(Map.of("amount", "-0.00", "currency", "EUR"));

    assertEquals(Map.of("amount", "-1.00", "currency", "EUR"), one.subtract(two).toPortable(2));
    assertEquals(Map.of("amount", "-1.00", "currency", "EUR"), one.negate().toPortable());
    assertEquals(Map.of("amount", "0.00", "currency", "EUR"), minusZero.toPortable());
    assertEquals("LESS", one.compare(two));
    assertEquals("GREATER", two.compare(one));
    assertEquals("EQUAL", one.compare(Money.fromPortable(Map.of("amount", "1.0", "currency", "EUR"))));
  }

  @Test
  void multiplyAndDivideRejectInvalidScalars() {
    Money value = Money.fromPortable(Map.of("amount", "10.00", "currency", "EUR"));

    assertEquals(Map.of("amount", "12.500", "currency", "EUR"), value.multiply("1.25").toPortable(3));
    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> value.multiply("1,25")).code());
    assertEquals(Money.DIVISION_BY_ZERO, assertThrows(FinKoreException.class, () -> value.divide("0")).code());
  }

  @Test
  void divisionRequiresTerminatingDecimalResult() {
    Money value = Money.fromPortable(Map.of("amount", "10.00", "currency", "EUR"));

    assertEquals(Map.of("amount", "2.5", "currency", "EUR"), value.divide("4").toPortable());
    assertEquals(Money.ROUNDING_REQUIRED, assertThrows(FinKoreException.class, () -> value.divide("3")).code());
  }

  @Test
  void negativeRoundingBoundariesDiffer() {
    Money value = Money.fromPortable(Map.of("amount", "-1.231", "currency", "EUR"));

    assertEquals(Map.of("amount", "-1.23", "currency", "EUR"), value.round(2, "DOWN").toPortable());
    assertEquals(Map.of("amount", "-1.24", "currency", "EUR"), value.round(2, "FLOOR").toPortable());
  }

  @Test
  void roundingModesAndInvalidRoundingArePortable() {
    Money half = Money.fromPortable(Map.of("amount", "2.5", "currency", "EUR"));
    Money negative = Money.fromPortable(Map.of("amount", "-1.231", "currency", "EUR"));

    assertEquals(Map.of("amount", "3", "currency", "EUR"), half.round(0, "HALF_UP").toPortable());
    assertEquals(Map.of("amount", "2", "currency", "EUR"), half.round(0, "HALF_EVEN").toPortable());
    assertEquals(Map.of("amount", "-1.24", "currency", "EUR"), negative.round(2, "UP").toPortable());
    assertEquals(Map.of("amount", "-1.23", "currency", "EUR"), negative.round(2, "CEILING").toPortable());
    assertEquals(Money.INVALID_ROUNDING, assertThrows(FinKoreException.class, () -> half.round(-1, "HALF_UP")).code());
    assertEquals(Money.INVALID_ROUNDING, assertThrows(FinKoreException.class, () -> half.round(0, "TRUNCATE")).code());
    assertEquals(Money.INVALID_ROUNDING, assertThrows(FinKoreException.class, () -> half.round(0, 1)).code());
  }

  @Test
  void ratesAndAllocationUseExactDecimalSemantics() {
    Money value = Money.fromPortable(Map.of("amount", "100.00", "currency", "USD"));

    assertEquals(Map.of("amount", "25.000", "currency", "USD"), value.applyRate(Map.of("kind", "DECIMAL", "value", "0.25"), null).toPortable(3));
    assertEquals(Map.of("amount", "12.50", "currency", "USD"), value.applyRate(Map.of("kind", "PERCENTAGE", "value", "12.5"), Map.of("scale", 2, "mode", "HALF_UP")).toPortable());
    assertEquals(
        List.of(
            Map.of("amount", "50.01", "currency", "USD"),
            Map.of("amount", "33.33", "currency", "USD"),
            Map.of("amount", "16.66", "currency", "USD")),
        value.allocate(Map.of("method", "RATIO", "ratios", List.of(3, 2, 1)), 2).stream().map(Money::toPortable).toList());
  }

  @Test
  void invalidRateAndAllocationInputsUsePortableCodes() {
    Money value = Money.fromPortable(Map.of("amount", "10.00", "currency", "USD"));

    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> value.applyRate("0.1", null)).code());
    assertEquals(Money.INVALID_AMOUNT, assertThrows(FinKoreException.class, () -> value.applyRate(Map.of("kind", "BPS", "value", "1"), null)).code());
    assertEquals(Money.INVALID_ROUNDING, assertThrows(FinKoreException.class, () -> value.applyRate(Map.of("kind", "DECIMAL", "value", "0.1"), "round")).code());

    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate("three ways", 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "EQUAL", "parts", 0), 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "EQUAL", "parts", 2), -1)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "RATIO", "ratios", List.of()), 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "RATIO", "ratios", List.of(1, 0)), 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "RATIO", "ratios", List.of(new BigInteger("9007199254740992"), 1)), 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "EQUAL", "parts", 101), 2)).code());
    assertEquals(Money.INVALID_ALLOCATION, assertThrows(FinKoreException.class, () -> value.allocate(Map.of("method", "EQUAL", "parts", 2), 51)).code());
    assertEquals(Money.ROUNDING_REQUIRED, assertThrows(FinKoreException.class, () -> Money.fromPortable(Map.of("amount", "10.001", "currency", "USD")).allocate(Map.of("method", "EQUAL", "parts", 2), 2)).code());
  }

  @Test
  void allocationAcceptsThePortableIntegerBoundariesAndIntegralJsonNumbers() {
    Money value = Money.fromPortable(Map.of("amount", "10.00", "currency", "USD"));

    assertEquals(
        List.of(
            Map.of("amount", "3.34", "currency", "USD"),
            Map.of("amount", "6.66", "currency", "USD")),
        value.allocate(
            Map.of("method", "RATIO", "ratios", List.of(new BigDecimal("1.0"), new BigDecimal("2.0"))),
            new BigDecimal("2.0")).stream().map(Money::toPortable).toList());
    assertEquals(
        List.of(
            Map.of("amount", "3.34", "currency", "USD"),
            Map.of("amount", "6.66", "currency", "USD")),
        value.allocate(Map.of("method", "RATIO", "ratios", List.of(1.0d, 2.0d)), 2.0d)
            .stream().map(Money::toPortable).toList());
    assertEquals(
        List.of(
            Map.of("amount", "10.00", "currency", "USD"),
            Map.of("amount", "0.00", "currency", "USD")),
        value.allocate(
            Map.of("method", "RATIO", "ratios", List.of(new BigInteger("9007199254740991"), BigInteger.ONE)),
            2).stream().map(Money::toPortable).toList());
    List<Money> hundred = Money.fromPortable(Map.of("amount", "1.00", "currency", "USD"))
        .allocate(Map.of("method", "EQUAL", "parts", 100), 2);
    assertEquals(100, hundred.size());
    assertTrue(hundred.stream().allMatch(part -> Map.of("amount", "0.01", "currency", "USD").equals(part.toPortable())));
    assertEquals(
        List.of(
            Map.of("amount", "0.50000000000000000000000000000000000000000000000000", "currency", "USD"),
            Map.of("amount", "0.50000000000000000000000000000000000000000000000000", "currency", "USD")),
        Money.fromPortable(Map.of("amount", "1", "currency", "USD"))
            .allocate(Map.of("method", "EQUAL", "parts", 2), 50).stream().map(Money::toPortable).toList());
  }

  @Test
  void equalAllocationPreservesSignedTotalsInDeclaredOrder() {
    Money value = Money.fromPortable(Map.of("amount", "-10.00", "currency", "USD"));
    List<Map<String, Object>> parts = value.allocate(Map.of("method", "EQUAL", "parts", 3), 2).stream().map(Money::toPortable).toList();

    assertEquals(
        List.of(
            Map.of("amount", "-3.34", "currency", "USD"),
            Map.of("amount", "-3.33", "currency", "USD"),
            Map.of("amount", "-3.33", "currency", "USD")),
        parts);
    assertTrue(parts.stream().allMatch(part -> "USD".equals(part.get("currency"))));
  }
}
