// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** JUnit coverage tests for Java Audit behavior. */
final class AuditCoverageTest {
  @Test
  void successfulRedactionSerializesActorContextChangeValuesAndEvidence() {
    Audit.Log log = Audit.Log.create(List.of(eventWithActorContextAndSensitiveChange()));

    Audit.RedactionResult result = log.redact(
        Map.of(
            "id", "privacy-policy",
            "protectedPaths", List.of("actor.displayName", "actor.metadata", "bankAccount"),
            "authority", "retention-policy"),
        redactionEvent("evt-redaction"));

    assertEquals(Map.of(
        "event", Map.of(
            "eventId", "evt-sensitive",
            "eventType", "ENTITY_SUBMITTED",
            "entity", Map.of("type", "expense", "id", "exp-52"),
            "actor", Map.of(
                "type", "user",
                "id", "user-7",
                "displayName", Map.of("presence", "REDACTED"),
                "metadata", Map.of("presence", "REDACTED")),
            "occurredAt", "2026-09-01T12:00:00Z",
            "changes", List.of(
                Map.of(
                    "path", "bankAccount",
                    "before", Map.of("presence", "REDACTED"),
                    "after", Map.of("presence", "REDACTED")),
                Map.of("path", "state", "before", "DRAFT", "after", "SUBMITTED"))),
        "evidenceEvent", redactionEvent("evt-redaction")),
        result.toPortable());
    assertEquals(2, log.events().size());
  }

  @Test
  void appendsRelationshipEventAndPreservesRelationshipObservation() {
    Map<String, Object> original = invoiceEvent("evt-original", "ENTITY_ISSUED");
    Map<String, Object> correction = relationshipEvent(
        "evt-correction",
        "CORRECTS",
        "rel-corrects-1",
        "evt-original",
        "inv-10");

    Audit.Log log = Audit.Log.create(List.of(original));
    assertEquals(Map.of("history", List.of(original, correction)), log.append(correction).toPortable());
  }

  @Test
  void appendRejectsInvalidEventShapesWithPortableCodes() {
    Audit.Log log = Audit.Log.create(List.of());

    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append("event")).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-bad-type",
        "eventType", "AuditLog.append",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z"))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-bad-time",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "not-an-instant"))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-metadata-conflict",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "metadata", Map.of("eventType", "ENTITY_APPROVED")))).code());
  }

  @Test
  void actorAndChangeValidationUsePortableErrors() {
    Audit.Log log = Audit.Log.create(List.of());

    assertEquals(Audit.ACTOR_INVALID, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-bad-actor",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "actor", Map.of("type", "user"),
        "occurredAt", "2026-09-01T12:00:00Z"))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-unchanged",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", List.of(Map.of("path", "state", "before", "SUBMITTED", "after", "SUBMITTED"))))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-bad-change",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", List.of(Map.of("before", "DRAFT", "after", "SUBMITTED"))))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(Map.of(
        "eventId", "evt-bad-changes",
        "eventType", "ENTITY_SUBMITTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T12:00:00Z",
        "changes", "not-a-list"))).code());
  }

  @Test
  void relationshipsValidateTypeTargetEntityAndIdentity() {
    Map<String, Object> original = invoiceEvent("evt-original", "ENTITY_ISSUED");
    Audit.Log log = Audit.Log.create(List.of(original));

    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(relationshipEvent(
        "evt-related",
        "RELATED_TO",
        "rel-unsupported",
        "evt-original",
        "inv-10"))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(relationshipEvent(
        "evt-self",
        "CORRECTS",
        "rel-self",
        "evt-self",
        "inv-10"))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> log.append(relationshipEvent(
        "evt-wrong-entity",
        "CORRECTS",
        "rel-wrong-entity",
        "evt-original",
        "inv-other"))).code());

    Audit.Log withRelationship = Audit.Log.create(List.of(original, relationshipEvent(
        "evt-correction",
        "CORRECTS",
        "rel-evolution-1",
        "evt-original",
        "inv-10")));
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> withRelationship.append(relationshipEvent(
        "evt-reversal",
        "REVERSES",
        "rel-evolution-1",
        "evt-original",
        "inv-10"))).code());
  }

  @Test
  void redactionRejectsInvalidPolicyAlreadyRedactedAndUnknownTargets() {
    Audit.Log log = Audit.Log.create(List.of(eventWithSensitiveChange()));
    assertEquals(Audit.REDACTION_INVALID, assertThrows(FinKoreException.class, () -> log.redact(
        Map.of("id", "policy", "protectedPaths", List.of(), "authority", "retention"),
        redactionEvent("evt-redaction"))).code());
    assertEquals(Audit.REDACTION_INVALID, assertThrows(FinKoreException.class, () -> log.redact(
        Map.of("id", "policy", "protectedPaths", List.of("taxIdentifier"), "authority", "retention"),
        redactionEvent("evt-redaction"))).code());

    Map<String, Object> alreadyRedacted = eventWithSensitiveChange();
    @SuppressWarnings("unchecked")
    Map<String, Object> change = (Map<String, Object>) ((List<?>) alreadyRedacted.get("changes")).get(0);
    change.put("before", Map.of("presence", "REDACTED"));
    Audit.Log redactedLog = Audit.Log.create(List.of(alreadyRedacted));
    assertEquals(Audit.REDACTION_INVALID, assertThrows(FinKoreException.class, () -> redactedLog.redact(
        Map.of("id", "policy", "protectedPaths", List.of("bankAccount"), "authority", "retention"),
        redactionEvent("evt-redaction"))).code());
  }

  @Test
  void replaceRemoveAndInvalidHistoryPreserveAppendOnlySemantics() {
    Audit.Log log = Audit.Log.create(List.of(eventWithSensitiveChange()));

    assertEquals(Audit.APPEND_ONLY_VIOLATION, assertThrows(FinKoreException.class, log::replace).code());
    assertEquals(Audit.APPEND_ONLY_VIOLATION, assertThrows(FinKoreException.class, log::remove).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> Audit.Log.create("history")).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> Audit.Log.create(List.of(relationshipEvent(
        "evt-orphan",
        "CORRECTS",
        "rel-orphan",
        "evt-missing",
        "inv-10")))).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> Audit.Relationship.fromPortable("relationship")).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> Audit.RelationshipTarget.fromPortable("target")).code());
    assertEquals(Audit.INVALID_EVENT, assertThrows(FinKoreException.class, () -> Audit.EntityReference.fromPortable("entity")).code());
    assertEquals(Audit.REDACTION_INVALID, assertThrows(FinKoreException.class, () -> Audit.RedactionPolicy.fromPortable("policy")).code());
  }

  @Test
  void portableObservationsAreDefensiveCopies() {
    Map<String, Object> event = eventWithSensitiveChange();
    Audit.Log log = Audit.Log.create(List.of(event));
    event.put("eventType", "MUTATED");

    List<Map<String, Object>> firstObservation = log.events();
    firstObservation.get(0).put("eventType", "MUTATED");

    assertEquals("ENTITY_SUBMITTED", log.events().get(0).get("eventType"));
    assertFalse(log.events().get(0).equals(firstObservation.get(0)));
  }

  private static Map<String, Object> eventWithSensitiveChange() {
    Map<String, Object> event = new LinkedHashMap<>();
    event.put("eventId", "evt-1042");
    event.put("eventType", "ENTITY_SUBMITTED");
    event.put("entity", Map.of("type", "expense", "id", "exp-52"));
    event.put("actor", Map.of("type", "user", "id", "user-7"));
    event.put("occurredAt", "2026-09-01T12:00:00Z");
    event.put("changes", new ArrayList<>(List.of(new LinkedHashMap<>(Map.of(
        "path", "bankAccount",
        "before", "DE111",
        "after", "DE222")))));
    return event;
  }

  private static Map<String, Object> eventWithActorContextAndSensitiveChange() {
    Map<String, Object> event = new LinkedHashMap<>();
    event.put("eventId", "evt-sensitive");
    event.put("eventType", "ENTITY_SUBMITTED");
    event.put("entity", Map.of("type", "expense", "id", "exp-52"));
    event.put("actor", Map.of(
        "type", "user",
        "id", "user-7",
        "displayName", "Ada",
        "metadata", Map.of("email", "ada@example.test")));
    event.put("occurredAt", "2026-09-01T12:00:00Z");
    event.put("changes", List.of(
        Map.of("path", "bankAccount", "before", "DE111", "after", "DE222"),
        Map.of("path", "state", "before", "DRAFT", "after", "SUBMITTED")));
    return event;
  }

  private static Map<String, Object> redactionEvent(String eventId) {
    return Map.of(
        "eventId", eventId,
        "eventType", "AUDIT_CONTENT_REDACTED",
        "entity", Map.of("type", "expense", "id", "exp-52"),
        "occurredAt", "2026-09-01T13:00:00Z");
  }

  private static Map<String, Object> invoiceEvent(String eventId, String eventType) {
    return Map.of(
        "eventId", eventId,
        "eventType", eventType,
        "entity", Map.of("type", "invoice", "id", "inv-10"),
        "occurredAt", "2026-09-01T10:00:00Z");
  }

  private static Map<String, Object> relationshipEvent(
      String eventId,
      String relationshipType,
      String relationshipId,
      String targetEventId,
      String targetEntityId) {
    return Map.of(
        "eventId", eventId,
        "eventType", "ENTITY_EVOLUTION_RECORDED",
        "entity", Map.of("type", "invoice", "id", "inv-10"),
        "occurredAt", "2026-09-01T11:00:00Z",
        "relationships", List.of(Map.of(
            "relationshipId", relationshipId,
            "type", relationshipType,
            "target", Map.of(
                "eventId", targetEventId,
                "entity", Map.of("type", "invoice", "id", targetEntityId)))));
  }
}
