// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.Map;

/** Minimal stdlib tests for the Java Approvals implementation. */
public final class ApprovalsTest {
  private ApprovalsTest() {}

  /** Runs Java Approvals tests without an external test framework. */
  public static void main(String[] args) {
    recordsEligibleDecisionAndEvaluatesRequirement();
    rejectsIneligibleActorWithoutMutatingHistory();
    expirationRequiresExplicitContext();
    expirationUsesExactNanosecondsAndEquivalentOffsets();
    rejectsExcessTimestampPrecision();
    compositionRejectsOpposingEffectiveVotes();
  }

  private static void recordsEligibleDecisionAndEvaluatesRequirement() {
    Map<String, Object> decision = approvedDecision("2026-09-01T12:00:00Z");

    assertEquals(Map.of("history", List.of(decision)), Approvals.recordDecision(requirement(), decision, List.of()));
    assertEquals("APPROVED", Approvals.evaluateRequirement(requirement(), List.of(decision), Approvals.OMITTED, Approvals.OMITTED, null));
  }

  private static void rejectsIneligibleActorWithoutMutatingHistory() {
    Map<String, Object> decision = Map.of(
        "requirementId", "finance-review",
        "subjectFacts", Map.of("revision", "3"),
        "outcome", "APPROVED",
        "actor", Map.of("type", "user", "id", "user-9"),
        "decidedAt", "2026-09-01T12:00:00Z");

    assertError(Approvals.INELIGIBLE_ACTOR, () -> Approvals.recordDecision(requirement(), decision, List.of()));
    assertEquals(Map.of("history", List.of()), Approvals.historyObservation(List.of()));
  }

  private static void expirationRequiresExplicitContext() {
    Map<String, Object> expiringDecision = Map.of(
        "requirementId", "finance-review",
        "subjectFacts", Map.of("revision", "3"),
        "outcome", "APPROVED",
        "actor", Map.of("type", "user", "id", "user-7"),
        "decidedAt", "2026-09-01T12:00:00Z",
        "expiresAt", "2026-09-02T12:00:00Z");

    assertError(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateRequirement(requirement(), List.of(expiringDecision), Approvals.OMITTED, Approvals.OMITTED, null));
    assertEquals("PENDING", Approvals.evaluateRequirement(
        requirement(),
        List.of(expiringDecision),
        Approvals.OMITTED,
        Approvals.OMITTED,
        "2026-09-02T12:00:00Z"));
  }

  private static void expirationUsesExactNanosecondsAndEquivalentOffsets() {
    Map<String, Object> expiringDecision = Map.of(
        "requirementId", "finance-review",
        "subjectFacts", Map.of("revision", "3"),
        "outcome", "APPROVED",
        "actor", Map.of("type", "user", "id", "user-7"),
        "decidedAt", "2026-09-01T12:00:00.000000001Z",
        "expiresAt", "2026-09-02T12:00:00.000000005Z");

    assertEquals("APPROVED", Approvals.evaluateRequirement(
        requirement(),
        List.of(expiringDecision),
        Approvals.OMITTED,
        Approvals.OMITTED,
        "2026-09-02T12:00:00.000000004Z"));
    assertEquals("PENDING", Approvals.evaluateRequirement(
        requirement(),
        List.of(expiringDecision),
        Approvals.OMITTED,
        Approvals.OMITTED,
        "2026-09-02T14:00:00.000000005+02:00"));
  }

  private static void rejectsExcessTimestampPrecision() {
    assertError(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(
        requirement(),
        approvedDecision("2026-09-01T12:00:00.1234567890Z"),
        List.of()));
  }

  private static void compositionRejectsOpposingEffectiveVotes() {
    Map<String, Object> composition = Map.of(
        "rootGroup", "root",
        "groups", List.of(Map.of(
            "id", "root",
            "kind", "N_OF_M",
            "threshold", 1,
            "members", List.of(
                Map.of("type", "requirement", "id", "member-1", "requirementId", "finance-review", "voter", Map.of("type", "user", "id", "user-7"))))));
    List<Map<String, Object>> requirements = List.of(Map.of(
        "id", "finance-review",
        "applicability", "APPLICABLE",
        "state", "PENDING",
        "eligibleActors", List.of("user-7"),
        "approvedOutcome", "APPROVED",
        "rejectedOutcome", "REJECTED"));

    Map<String, Object> approval = new java.util.LinkedHashMap<>(approvedDecision("2026-09-01T12:00:00Z"));
    Map<String, Object> rejection = new java.util.LinkedHashMap<>(rejectedDecision("2026-09-01T12:05:00Z"));
    approval.put("effective", true);
    rejection.put("effective", true);
    assertEquals(Map.of("outcome", "APPROVED", "actionableRequirements", List.of()),
        Approvals.evaluateComposition(composition, requirements, List.of(approval), null));
    assertError(Approvals.INVALID_CHAIN, () -> Approvals.evaluateComposition(
        composition,
        requirements,
        List.of(approval, rejection),
        Map.of("evaluatedAt", "2026-09-01T13:00:00Z")));
  }

  private static Map<String, Object> requirement() {
    return Map.of(
        "id", "finance-review",
        "subject", Map.of("type", "invoice", "id", "inv-42"),
        "eligibleActors", List.of("user-7"),
        "approvedOutcome", "APPROVED",
        "rejectedOutcome", "REJECTED");
  }

  private static Map<String, Object> approvedDecision(String decidedAt) {
    return Map.of(
        "requirementId", "finance-review",
        "subjectFacts", Map.of("revision", "3"),
        "outcome", "APPROVED",
        "actor", Map.of("type", "user", "id", "user-7"),
        "decidedAt", decidedAt);
  }

  private static Map<String, Object> rejectedDecision(String decidedAt) {
    return Map.of(
        "requirementId", "finance-review",
        "subjectFacts", Map.of("revision", "3"),
        "outcome", "REJECTED",
        "actor", Map.of("type", "user", "id", "user-7"),
        "decidedAt", decidedAt);
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
