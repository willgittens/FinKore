// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.Map;

/** Minimal stdlib tests for the Java Audit implementation. */
public final class AuditTest {
  private AuditTest() {}

  /** Runs Java Audit tests without an external test framework. */
  public static void main(String[] args) {
    appendsCompleteEventAndPreservesActorIdentity();
    duplicateAppendDoesNotMutateHistory();
    redactionPreservesSourceAndAppendsEvidence();
    invalidRelationshipDoesNotCommitSourceEvent();
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
