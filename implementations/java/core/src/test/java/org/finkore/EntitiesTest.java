// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

/** Minimal stdlib tests for the Java Entities implementation. */
public final class EntitiesTest {
  private EntitiesTest() {}

  /** Runs Java Entities tests without an external test framework. */
  public static void main(String[] args) {
    createPreservesOpaqueIdentityAndInitialState();
    mutateRejectsImmutableIdentityWithoutChangingEntity();
    transitionPreservesUnknownTargetStateError();
    validationFailureReportsFindings();
    crossFieldValidationUsesExactMoneyOrdering();
    importRejectsDuplicateRevisionObservations();
    importEnforcesDeclaredValidators();
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

  private static void transitionPreservesUnknownTargetStateError() {
    assertError(Workflow.INVALID_STATE, () -> Entities.transition(definition(), entity(), "UNKNOWN"));
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

  private static void importEnforcesDeclaredValidators() {
    Map<String, Object> valid = Map.of(
        "type", "invoice",
        "id", "inv-import",
        "state", "DRAFT",
        "data", Map.of("amount", Map.of("amount", "1.00", "currency", "EUR")));
    assertEquals(Map.of("entity", valid, "historicalRevisions", List.of()), Entities.importEntity(definitionWithValidation(), Map.of("entity", valid)));

    Map<String, Object> invalid = Map.of(
        "type", "invoice",
        "id", "inv-import-invalid",
        "state", "DRAFT",
        "data", Map.of("amount", Map.of("amount", "-1", "currency", "EUR")));
    assertError(Entities.VALIDATION_FAILED,
        () -> Entities.importEntity(definitionWithValidation(), Map.of("entity", invalid)));
    assertEquals(Map.of("amount", Map.of("amount", "-1", "currency", "EUR")), invalid.get("data"));
  }

  private static void crossFieldValidationUsesExactMoneyOrdering() {
    Map<String, Object> definition = new LinkedHashMap<>(definitionWithValidation());
    definition.put("mutability", Map.of("DRAFT", List.of("amount", "limit", "memo"), "FINAL", List.of()));
    definition.put("validation", List.of(Map.of(
        "id", "WITHIN_LIMIT", "path", "amount", "otherPath", "limit", "rule", "money-not-greater-than")));
    for (List<String> pair : List.of(List.of("10", "20"), List.of("20.00", "20.0"), List.of("0", "0"), List.of("-2", "-1"))) {
      Map<String, Object> data = Map.of(
          "amount", Map.of("amount", pair.get(0), "currency", "EUR"),
          "limit", Map.of("amount", pair.get(1), "currency", "EUR"));
      assertEquals(data, Entities.create(definition, "inv-42", data).get("data"));
    }
    Map<String, Object> data = Map.of(
        "amount", Map.of("amount", "10", "currency", "EUR"),
        "limit", Map.of("amount", "20", "currency", "EUR"));
    Map<String, Object> entity = Entities.create(definition, "inv-42", data);
    for (Map<String, Object> changes : List.<Map<String, Object>>of(
        Map.of("amount", Map.of("amount", "20.000000000000000000001", "currency", "EUR")),
        Map.of("amount", Map.of("amount", "1", "currency", "USD")),
        Map.of("amount", "invalid"),
        Map.of("limit", Map.of("amount", "invalid", "currency", "EUR")))) {
      assertError(Entities.VALIDATION_FAILED, () -> Entities.mutate(definition, entity, changes));
      assertEquals(List.of(Map.of("rule", "WITHIN_LIMIT", "path", "amount")),
          Entities.validationFindingsForMutation(definition, entity, changes));
      assertEquals(data, entity.get("data"));
    }
    assertError(Entities.VALIDATION_FAILED,
        () -> Entities.create(definition, "inv-42", Map.of("amount", Map.of("amount", "10", "currency", "EUR"))));
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
        "mutability", Map.of("DRAFT", List.of("amount", "memo"), "FINAL", List.of()),
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
