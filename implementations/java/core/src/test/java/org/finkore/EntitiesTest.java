// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.Map;

/** Minimal stdlib tests for the Java Entities implementation. */
public final class EntitiesTest {
  private EntitiesTest() {}

  /** Runs Java Entities tests without an external test framework. */
  public static void main(String[] args) {
    createPreservesOpaqueIdentityAndInitialState();
    mutateRejectsImmutableIdentityWithoutChangingEntity();
    transitionRejectsUnknownTargetAsInvalidTransition();
    validationFailureReportsFindings();
    importRejectsDuplicateRevisionObservations();
  }

  private static void createPreservesOpaqueIdentityAndInitialState() {
    assertEquals(Map.of(
        "type", "invoice",
        "id", " Inv-0042 ",
        "state", "DRAFT",
        "data", Map.of("memo", "initial")),
        Entities.create(definition(), " Inv-0042 ", Map.of("memo", "initial")));
  }

  private static void mutateRejectsImmutableIdentityWithoutChangingEntity() {
    Map<String, Object> entity = entity();

    assertError(Entities.IMMUTABLE, () -> Entities.mutate(definition(), entity, Map.of("id", "other", "memo", "updated")));
    assertEquals("inv-42", entity.get("id"));
    assertEquals("initial", ((Map<?, ?>) entity.get("data")).get("memo"));
  }

  private static void transitionRejectsUnknownTargetAsInvalidTransition() {
    assertError(Workflow.INVALID_TRANSITION, () -> Entities.transition(definition(), entity(), "UNKNOWN"));
  }

  private static void validationFailureReportsFindings() {
    Map<String, Object> definition = definitionWithValidation();
    Map<String, Object> entity = Map.of(
        "type", "invoice",
        "id", "inv-42",
        "state", "DRAFT",
        "data", Map.of("amount", Map.of("amount", "100.00", "currency", "EUR"), "memo", "initial"));

    assertError(Entities.VALIDATION_FAILED, () -> Entities.mutate(
        definition,
        entity,
        Map.of("amount", Map.of("amount", "-1.00", "currency", "EUR"))));
    assertEquals(
        List.of(Map.of("rule", "AMOUNT_POSITIVE", "path", "amount")),
        Entities.validationFindingsForMutation(
            definition,
            entity,
            Map.of("amount", Map.of("amount", "-1.00", "currency", "EUR"))));
  }

  private static void importRejectsDuplicateRevisionObservations() {
    Map<String, Object> entity = entity();

    assertError(Entities.INVALID_IDENTITY, () -> Entities.importEntity(
        definition(),
        Map.of(
            "entity", entity,
            "currentRevision", "business-rev-2",
            "historicalRevisions", List.of("business-rev-2"))));
    assertEquals("initial", ((Map<?, ?>) entity.get("data")).get("memo"));
  }

  private static Map<String, Object> definition() {
    return Map.of(
        "type", "invoice",
        "identityScope", "tenant-a",
        "workflow", Map.of(
            "states", List.of("DRAFT", "FINAL"),
            "initialState", "DRAFT",
            "terminalStates", List.of("FINAL"),
            "transitions", List.of(Map.of("source", "DRAFT", "target", "FINAL"))),
        "mutability", Map.of(
            "DRAFT", List.of("memo"),
            "FINAL", List.of("deliveryStatus")));
  }

  private static Map<String, Object> definitionWithValidation() {
    return Map.of(
        "type", "invoice",
        "identityScope", "tenant-a",
        "workflow", Map.of(
            "states", List.of("DRAFT", "FINAL"),
            "initialState", "DRAFT",
            "terminalStates", List.of("FINAL"),
            "transitions", List.of(Map.of("source", "DRAFT", "target", "FINAL"))),
        "mutability", Map.of("DRAFT", List.of("amount", "memo")),
        "validation", List.of(Map.of("id", "AMOUNT_POSITIVE", "path", "amount", "rule", "positive-money")));
  }

  private static Map<String, Object> entity() {
    return Map.of(
        "type", "invoice",
        "id", "inv-42",
        "state", "DRAFT",
        "data", Map.of("memo", "initial"));
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
