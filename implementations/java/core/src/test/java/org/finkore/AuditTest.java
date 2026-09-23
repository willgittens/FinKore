// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

/** Minimal stdlib tests for the Java Audit implementation. */
public final class AuditTest {
  private AuditTest() {}

  /** Runs Java Audit tests without an external test framework. */
  public static void main(String[] args) {
    appendsCompleteEventAndPreservesActorIdentity();
    duplicateAppendDoesNotMutateHistory();
    appendErrorPrecedenceDoesNotMutateHistory();
    enforcesPortableTimestampProfile();
    redactionPreservesSourceAndAppendsEvidence();
    invalidRelationshipDoesNotCommitSourceEvent();
    actorOptionalStringsRejectExplicitNull();
    actorMetadataNullPresenceSurvivesAppendAndRedaction();
    changeComparisonDistinguishesJsonTypesAndDeclaredMoney();
  }

  private static void appendsCompleteEventAndPreservesActorIdentity() {
    Audit.Log log = Audit.Log.create(List.of());

    assertEquals(Map.of("history", List.of(submittedEvent())), log.append(submittedEvent()).toPortable());
  }

  private static void duplicateAppendDoesNotMutateHistory() {
    Audit.Log log = Audit.Log.create(List.of(submittedEvent()));

    assertError(Audit.DUPLICATE_EVENT, () -> log.append(Map.of(
        "eventId", "evt-1042",
        "eventType", "ENTITY_RESUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T13:00:00Z")));
    assertEquals(List.of(submittedEvent()), log.events());
  }

  private static void appendErrorPrecedenceDoesNotMutateHistory() {
    Audit.Log log = Audit.Log.create(List.of(submittedEvent()));

    assertError(Audit.INVALID_EVENT, () -> log.append(Map.of(
        "eventId", "evt-invalid",
        "eventType", "ENTITY_APPROVED",
        "entity", Map.of("type", "expense"),
        "actor", Map.of("type", "user"),
        "occurredAt", "2026-09-01T13:00:00Z")));
    assertError(Audit.ACTOR_INVALID, () -> log.append(Map.of(
        "eventId", "evt-1042",
        "eventType", "ENTITY_APPROVED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "actor", Map.of("type", "user"),
        "occurredAt", "2026-09-01T13:00:00Z")));
    assertError(Audit.DUPLICATE_EVENT, () -> log.append(Map.of(
        "eventId", "evt-1042",
        "eventType", "ENTITY_APPROVED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T13:00:00Z",
        "relationships", List.of(Map.of(
            "relationshipId", "rel-missing-target",
            "type", "CORRECTS",
            "target", Map.of(
                "eventId", "evt-missing",
                "entity", Map.of("type", "expense", "id", "exp-52")))))));

    assertEquals(List.of(submittedEvent()), log.events());
  }

  private static void enforcesPortableTimestampProfile() {
    Map<String, Object> valid = Map.of(
        "eventId", "evt-nanoseconds",
        "eventType", "ENTITY_OBSERVED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-02-28T12:00:00.123456789+23:59");
    assertEquals(Map.of("history", List.of(valid)), Audit.Log.create(List.of()).append(valid).toPortable());

    for (String occurredAt : List.of(
        "2026-02-30T12:00:00Z",
        "2026-09-01T12:00:00.1234567890Z",
        "20260901T120000Z",
        "2026-09-01t12:00:00Z",
        "2026-09-01T12:00:00z",
        "2026-09-01T12:00:00-00:00",
        "2026-12-31T23:59:60Z",
        "0000-01-01T00:00:00Z")) {
      Audit.Log log = Audit.Log.create(List.of());
      Map<String, Object> invalid = Map.of(
          "eventId", "evt-invalid-timestamp",
          "eventType", "ENTITY_OBSERVED",
          "entity", Map.of("type", "expense", "id", "exp-52"),
          "occurredAt", occurredAt);
      assertError(Audit.INVALID_EVENT, () -> log.append(invalid));
      assertEquals(List.of(), log.events());
    }
  }

  private static void redactionPreservesSourceAndAppendsEvidence() {
    Audit.Log log = Audit.Log.create(List.of(submittedEvent()));
    Map<String, Object> evidence = Map.of(
        "eventId", "evt-redaction",
        "eventType", "AUDIT_CONTENT_REDACTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "actor", Map.of("type", "system", "id", "retention-service"),
        "occurredAt", "2026-09-01T13:00:00Z");

    Audit.RedactionResult result = log.redact(
        Map.of("id", "bank-redaction", "protectedPaths", List.of("bankAccount"), "authority", "retention-policy"),
        evidence);

    assertEquals(Map.of(
        "event", Map.of(
            "eventId", "evt-1042",
            "eventType", "ENTITY_SUBMITTED",
            "entity", Map.of("type", "expense", "id", "exp-52"),
            "actor", Map.of("type", "user", "id", "user-7"),
            "occurredAt", "2026-09-01T12:00:00Z",
            "changes", List.of(Map.of(
                "path", "bankAccount",
                "before", Map.of("presence", "REDACTED"),
                "after", Map.of("presence", "REDACTED")))),
        "evidenceEvent", evidence),
        result.toPortable());
    assertEquals(List.of(submittedEvent(), evidence), log.events());
  }

  private static void invalidRelationshipDoesNotCommitSourceEvent() {
    Map<String, Object> original = Map.of(
        "eventId", "evt-original",
        "eventType", "ENTITY_ISSUED",
        "entity", Map.of("type", "invoice", "id", "inv-10"),
        "occurredAt", "2026-09-01T10:00:00Z");
    Audit.Log log = Audit.Log.create(List.of(original));

    assertError(Audit.INVALID_EVENT, () -> log.append(Map.of(
        "eventId", "evt-correction",
        "eventType", "ENTITY_CORRECTED",
        "entity", Map.of("type", "invoice", "id", "inv-10"),
        "occurredAt", "2026-09-01T11:00:00Z",
        "relationships", List.of(Map.of(
            "relationshipId", "rel-unknown-target",
            "type", "CORRECTS",
            "target", Map.of("eventId", "evt-missing", "entity", Map.of("type", "invoice", "id", "inv-10")))))));
    assertEquals(List.of(original), log.events());
  }

  private static void actorOptionalStringsRejectExplicitNull() {
    for (String field : List.of("type", "displayName")) {
      Map<String, Object> actor = new LinkedHashMap<>();
      actor.put("id", "user-7");
      actor.put(field, null);
      Map<String, Object> event = new LinkedHashMap<>();
      event.put("eventId", "evt-null-" + field);
      event.put("eventType", "ENTITY_SUBMITTED");
      event.put("entity", Map.of("type", "expense", "id", "exp-52"));
      event.put("actor", actor);
      event.put("occurredAt", "2026-09-01T12:00:00Z");
      Audit.Log log = Audit.Log.create(List.of());
      assertError(Audit.ACTOR_INVALID, () -> log.append(event));
      assertEquals(List.of(), log.events());
    }
  }

  private static void actorMetadataNullPresenceSurvivesAppendAndRedaction() {
    Map<String, Object> actor = new LinkedHashMap<>();
    actor.put("type", "user");
    actor.put("id", "user-7");
    actor.put("metadata", null);
    Map<String, Object> event = new LinkedHashMap<>();
    event.put("eventId", "evt-null-metadata");
    event.put("eventType", "ENTITY_SUBMITTED");
    event.put("entity", Map.of("type", "expense", "id", "exp-52"));
    event.put("actor", actor);
    event.put("occurredAt", "2026-09-01T12:00:00Z");

    Audit.Log appended = Audit.Log.create(List.of());
    assertEquals(Map.of("history", List.of(event)), appended.append(event).toPortable());

    Audit.Log redacted = Audit.Log.create(List.of(event));
    Audit.RedactionResult result = redacted.redact(
        Map.of("id", "null-metadata", "protectedPaths", List.of("actor.metadata"), "authority", "retention-policy"),
        Map.of(
            "eventId", "evt-null-metadata-evidence",
            "eventType", "AUDIT_CONTENT_REDACTED",
            "entity", Map.of("type", "expense", "id", "exp-52"),
            "occurredAt", "2026-09-01T13:00:00Z"));
    assertEquals(Map.of("type", "user", "id", "user-7", "metadata", Map.of("presence", "REDACTED")),
        ((Map<?, ?>) result.toPortable().get("event")).get("actor"));
    assertEquals(event, redacted.events().get(0));
  }

  private static void changeComparisonDistinguishesJsonTypesAndDeclaredMoney() {
    Map<String, Object> base = Map.of(
        "eventId", "evt-json-types",
        "eventType", "ENTITY_FACT_CHANGED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", List.of(Map.of("path", "approved", "before", true, "after", 1L)));
    assertEquals(Map.of("history", List.of(base)), Audit.Log.create(List.of()).append(base).toPortable());

    Map<String, Object> declaredMoney = Map.of(
        "path", "amount",
        "valueType", "MONEY",
        "before", Map.of("amount", "10.0", "currency", "EUR"),
        "after", Map.of("amount", "10.00", "currency", "EUR"));
    Map<String, Object> moneyEvent = Map.of(
        "eventId", "evt-money-unchanged",
        "eventType", "ENTITY_AMOUNT_CHANGED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", List.of(declaredMoney));
    assertError(Audit.INVALID_EVENT, () -> Audit.Log.create(List.of()).append(moneyEvent));
  }

  private static Map<String, Object> submittedEvent() {
    return Map.of(
        "eventId", "evt-1042",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "actor", Map.of("type", "user", "id", "user-7"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", List.of(Map.of("path", "bankAccount", "before", "DE111", "after", "DE222")));
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
