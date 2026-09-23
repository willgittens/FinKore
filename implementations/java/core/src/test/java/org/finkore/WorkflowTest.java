// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

/** Minimal stdlib tests for the Java Workflow implementation. */
public final class WorkflowTest {
  private WorkflowTest() {}

  /** Runs Java Workflow tests without an external test framework. */
  public static void main(String[] args) {
    createVersionedInstancePreservesOpaqueBinding();
    terminalOutgoingTransitionIsInvalidDefinition();
    rejectedGuardDoesNotMutateInstanceObservation();
    importRejectsVersionMismatch();
    expectedRevisionConflictPrecedesTransition();
    guardEqualityIsPresenceAwareTypeSensitiveAndRecursive();
  }

  private static void createVersionedInstancePreservesOpaqueBinding() {
    Workflow.Definition definition = Workflow.Definition.fromPortable(Map.of(
        "definitionIdentity", "invoice approval :: us-east",
        "definitionVersionIdentity", "v:01",
        "states", List.of("DRAFT", "SUBMITTED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("SUBMITTED"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "SUBMITTED"))));

    assertEquals(
        Map.of(
            "currentState", "DRAFT",
            "binding", Map.of(
                "definitionIdentity", "invoice approval :: us-east",
                "definitionVersionIdentity", "v:01")),
        Workflow.create(definition).toPortable());
  }

  private static void terminalOutgoingTransitionIsInvalidDefinition() {
    assertError(Workflow.INVALID_DEFINITION, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DONE"),
        "initialState", "DRAFT",
        "terminalStates", List.of("DONE"),
        "transitions", List.of(
            Map.of("source", "DRAFT", "target", "DONE"),
            Map.of("source", "DONE", "target", "DRAFT")))));
  }

  private static void rejectedGuardDoesNotMutateInstanceObservation() {
    Workflow.Definition definition = approvalWorkflow();
    Workflow.Instance instance = Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED"));

    assertError(Workflow.GUARD_REJECTED, () -> Workflow.transition(
        definition,
        instance,
        "APPROVED",
        Map.of("approvalsSatisfied", false),
        null,
        null));
    assertEquals(Map.of("currentState", "SUBMITTED"), instance.toPortable());
  }

  private static void importRejectsVersionMismatch() {
    Workflow.Definition definition = Workflow.Definition.fromPortable(Map.of(
        "definitionIdentity", "invoice-approval",
        "definitionVersionIdentity", "2",
        "states", List.of("DRAFT", "SUBMITTED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("SUBMITTED"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "SUBMITTED"))));
    Workflow.Instance instance = Workflow.Instance.fromPortable(Map.of(
        "currentState", "SUBMITTED",
        "binding", Map.of(
            "definitionIdentity", "invoice-approval",
            "definitionVersionIdentity", "1")));

    assertError(Workflow.VERSION_MISMATCH, () -> Workflow.importInstance(definition, instance));
  }

  private static void expectedRevisionConflictPrecedesTransition() {
    Workflow.Definition definition = approvalWorkflow();
    Workflow.Instance instance = Workflow.Instance.fromPortable(Map.of(
        "currentState", "SUBMITTED",
        "revision", "wf-rev:0007"));

    assertError(Workflow.STATE_CONFLICT, () -> Workflow.transition(
        definition,
        instance,
        "APPROVED",
        Map.of("approvalsSatisfied", true),
        null,
        "wf-rev:old"));
    assertEquals(Map.of("currentState", "SUBMITTED", "revision", "wf-rev:0007"), instance.toPortable());
  }

  private static void guardEqualityIsPresenceAwareTypeSensitiveAndRecursive() {
    Workflow.Instance typeMismatch = Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED"));
    assertError(Workflow.GUARD_REJECTED, () -> Workflow.transition(
        workflowExpecting(true), typeMismatch, "APPROVED", Map.of("value", 1L), null, null));
    assertEquals(Map.of("currentState", "SUBMITTED"), typeMismatch.toPortable());

    Workflow.Instance missing = Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED"));
    assertError(Workflow.GUARD_REJECTED, () -> Workflow.transition(
        workflowExpecting(null), missing, "APPROVED", Map.of(), null, null));
    assertEquals(Map.of("currentState", "SUBMITTED"), missing.toPortable());

    Map<String, Object> explicitNull = new LinkedHashMap<>();
    explicitNull.put("value", null);
    assertEquals(Map.of("currentState", "APPROVED"), Workflow.transition(
        workflowExpecting(null),
        Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED")),
        "APPROVED",
        explicitNull,
        null,
        null).toPortable());

    assertEquals(Map.of("currentState", "APPROVED"), Workflow.transition(
        workflowExpecting(Map.of("status", "CLEAR", "steps", List.of("KYC", "LIMIT"))),
        Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED")),
        "APPROVED",
        Map.of("value", Map.of("steps", List.of("KYC", "LIMIT"), "status", "CLEAR")),
        null,
        null).toPortable());
  }

  private static Workflow.Definition workflowExpecting(Object expected) {
    Map<String, Object> guard = new LinkedHashMap<>();
    guard.put("fact", "value");
    guard.put("equals", expected);
    return Workflow.Definition.fromPortable(Map.of(
        "states", List.of("SUBMITTED", "APPROVED"),
        "initialState", "SUBMITTED",
        "terminalStates", List.of("APPROVED"),
        "transitions", List.of(Map.of("source", "SUBMITTED", "target", "APPROVED", "guard", guard))));
  }

  private static Workflow.Definition approvalWorkflow() {
    return Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "SUBMITTED", "APPROVED", "REJECTED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("APPROVED", "REJECTED"),
        "transitions", List.of(
            Map.of("source", "DRAFT", "target", "SUBMITTED"),
            Map.of(
                "source", "SUBMITTED",
                "target", "APPROVED",
                "guard", Map.of("fact", "approvalsSatisfied", "equals", true)),
            Map.of("source", "SUBMITTED", "target", "REJECTED"))));
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
