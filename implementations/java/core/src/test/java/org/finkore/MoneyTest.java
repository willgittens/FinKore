// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.Map;

/** Minimal stdlib tests for the Java Money implementation. */
public final class MoneyTest {
  private MoneyTest() {}

  /** Runs Java Money tests without an external test framework. */
  public static void main(String[] args) {
    exactAdditionDoesNotUseBinaryFloatingPoint();
    currencyMismatchUsesPortableCode();
    negativeRoundingBoundariesDiffer();
    allocationPreservesDeclaredOrderRemainder();
  }

  private static void exactAdditionDoesNotUseBinaryFloatingPoint() {
    Money left = Money.fromPortable(Map.of("amount", "0.1", "currency", "EUR"));
    Money right = Money.fromPortable(Map.of("amount", "0.2", "currency", "EUR"));
    assertEquals(Map.of("amount", "0.3", "currency", "EUR"), left.add(right).toPortable());
    assertEquals(Map.of("amount", "0.1", "currency", "EUR"), left.toPortable());
  }

  private static void currencyMismatchUsesPortableCode() {
    Money left = Money.fromPortable(Map.of("amount", "1.00", "currency", "EUR"));
    Money right = Money.fromPortable(Map.of("amount", "1.00", "currency", "USD"));
    assertError(Money.CURRENCY_MISMATCH, () -> left.compare(right));
  }

  private static void negativeRoundingBoundariesDiffer() {
    Money value = Money.fromPortable(Map.of("amount", "-1.231", "currency", "EUR"));
    assertEquals(Map.of("amount", "-1.23", "currency", "EUR"), value.round(2, "DOWN").toPortable());
    assertEquals(Map.of("amount", "-1.24", "currency", "EUR"), value.round(2, "FLOOR").toPortable());
  }

  private static void allocationPreservesDeclaredOrderRemainder() {
    Money value = Money.fromPortable(Map.of("amount", "10.00", "currency", "USD"));
    List<Map<String, Object>> result = value.allocate(Map.of("method", "RATIO", "ratios", List.of(3, 2, 1)), 2)
        .stream()
        .map(Money::toPortable)
        .toList();
    assertEquals(
        List.of(
            Map.of("amount", "5.01", "currency", "USD"),
            Map.of("amount", "3.33", "currency", "USD"),
            Map.of("amount", "1.66", "currency", "USD")),
        result);
  }

  private static void assertError(String expectedCode, ThrowingRunnable runnable) {
    try {
      runnable.run();
    } catch (FinKoreException error) {
      assertEquals(expectedCode, error.code());
      return;
    }
    throw new AssertionError("Expected " + expectedCode);
  }

  private static void assertEquals(Object expected, Object actual) {
    if (!expected.equals(actual)) {
      throw new AssertionError("Expected " + expected + " but got " + actual);
    }
  }

  private interface ThrowingRunnable {
    void run();
  }
}
