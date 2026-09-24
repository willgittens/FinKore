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
    jsonMembersSurviveOwnershipAndRedaction();
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

  private static Object copyJson(Object value) {
    if (value instanceof Map<?, ?> map) {
      Map<Object, Object> copy = new LinkedHashMap<>();
      for (Map.Entry<?, ?> entry : map.entrySet()) copy.put(entry.getKey(), copyJson(entry.getValue()));
      return copy;
    }
    if (value instanceof List<?> list) {
      List<Object> copy = new java.util.ArrayList<>();
      for (Object item : list) copy.add(copyJson(item));
      return copy;
    }
    return value;
  }

  @SuppressWarnings("unchecked")
  private static void jsonMembersSurviveOwnershipAndRedaction() {
    for (String key : List.of("__proto__", "constructor", "prototype", "hasOwnProperty")) {
      for (Object value : java.util.Arrays.asList(7, null, Map.of("approved", true), java.util.Arrays.asList(null, Map.of("approved", false)))) {
        Map<String, Object> payload = new LinkedHashMap<>(); payload.put(key, value);
        Map<String, Object> shared = Map.of("payload", payload);
        Map<String, Object> event = new LinkedHashMap<>(Map.of(
            "eventId", "event", "eventType", "ENTITY_CHANGED", "entity", Map.of("type", "invoice", "id", "1"),
            "occurredAt", "2026-09-01T12:00:00Z", "actor", Map.of("id", "opaque :: actor", "type", "service", "metadata", Map.of("left", shared, "right", List.of(shared))),
            "changes", List.of(Map.of("path", "payload", "before", Map.of(), "after", payload))));
        Object expected = copyJson(event);
        Audit.Actor actor = Audit.Actor.fromPortable(event.get("actor"));
        Audit.Event retained = Audit.Event.fromPortable(event);
        Audit.Log log = Audit.Log.create(List.of()).append(event);
        Audit.Log imported = Audit.Log.create(List.of(event));
        payload.put(key, "caller mutation");
        assertEquals(((Map<String, Object>) expected).get("actor"), actor.toPortable());
        assertEquals(expected, retained.toPortable());
        assertEquals(List.of(expected), log.events());
        assertEquals(List.of(expected), imported.events());
        Map<String, Object> observed = log.events().get(0);
        List<Map<String, Object>> changes = (List<Map<String, Object>>) observed.get("changes");
        ((Map<String, Object>) changes.get(0).get("after")).put(key, "observation mutation");
        assertEquals(List.of(expected), log.events());
        Map<String, Object> same = new LinkedHashMap<>(); same.put(key, value);
        Map<String, Object> unchanged = new LinkedHashMap<>(event);
        unchanged.put("eventId", "equal");
        unchanged.put("changes", List.of(Map.of("path", "payload", "before", same, "after", new LinkedHashMap<>(same))));
        assertError(Audit.INVALID_EVENT, () -> log.append(unchanged));
        Map<String, Object> evidence = Map.of("eventId", "redacted", "eventType", "AUDIT_CONTENT_REDACTED", "entity", event.get("entity"), "occurredAt", "2026-09-02T12:00:00Z");
        Audit.RedactionResult result = log.redact(Map.of("id", "policy", "authority", "retention", "protectedPaths", List.of("actor.metadata")), evidence);
        Map<String, Object> expectedView = (Map<String, Object>) copyJson(expected);
        ((Map<String, Object>) expectedView.get("actor")).put("metadata", Map.of("presence", "REDACTED"));
        assertEquals(expectedView, result.event());
        assertEquals(List.of(expected, evidence), log.events());
        Audit.RedactionResult changeRedaction = imported.redact(Map.of("id", "policy", "authority", "retention", "protectedPaths", List.of("payload")), evidence);
        Map<String, Object> expectedChangeView = (Map<String, Object>) copyJson(expected);
        expectedChangeView.put("changes", List.of(Map.of("path", "payload", "before", Map.of("presence", "REDACTED"), "after", Map.of("presence", "REDACTED"))));
        assertEquals(expectedChangeView, changeRedaction.event());
        ((Map<String, Object>) ((List<Map<String, Object>>) result.event().get("changes")).get(0).get("after")).put(key, "view mutation");
        assertEquals(List.of(expected, evidence), log.events());
      }
    }
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
