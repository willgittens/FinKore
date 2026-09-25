// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** JUnit coverage tests for Java Workflow behavior. */
final class WorkflowCoverageTest {
  @Test
  void nativePreconditionPresence() throws java.io.IOException {
    BoundaryRegressionTest.main(new String[]{"workflow.presence."});
  }

  @Test
  void nativeGuardBoundaryAndEquality() {
    WorkflowTest.main(new String[0]);
  }

  @Test
  void createsAndImportsVersionedInstances() {
    Workflow.Definition definition = versionedDefinition("1");
    Workflow.Instance created = Workflow.create(definition);

    assertEquals(Map.of(
        "currentState", "DRAFT",
        "binding", Map.of("definitionIdentity", "invoice-approval", "definitionVersionIdentity", "1")),
        created.toPortable());
    assertEquals(created.toPortable(), Workflow.importInstance(definition, created).toPortable());
  }

  @Test
  void rejectsInvalidDefinitions() {
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable("workflow")).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DRAFT"),
        "initialState", "DRAFT"))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "SUBMITTED"),
        "initialStates", List.of("DRAFT", "SUBMITTED"),
        "terminalStates", List.of("SUBMITTED")))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "definitionIdentity", "invoice-approval",
        "states", List.of("DRAFT"),
        "initialState", "DRAFT"))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "definitionIdentity", "invoice-approval",
        "definitionVersionIdentity", "1",
        "versionSequence", "01",
        "states", List.of("DRAFT"),
        "initialState", "DRAFT"))).code());
  }

  @Test
  void rejectsInvalidTransitionsInDefinitions() {
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DONE"),
        "initialState", "DRAFT",
        "terminalStates", List.of("DONE"),
        "transitions", List.of(Map.of("source", "DONE", "target", "DRAFT"))))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DONE"),
        "initialState", "DRAFT",
        "transitions", List.of(Map.of("source", "DRAFT", "target", "PAID"))))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DONE"),
        "initialState", "DRAFT",
        "transitions", List.of(Map.of("source", "DRAFT", "target", "DONE", "guards", "not-a-list"))))).code());
    assertEquals(Workflow.INVALID_DEFINITION, assertThrows(FinKoreException.class, () -> Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "DONE"),
        "initialState", "DRAFT",
        "transitions", List.of(Map.of("source", "DRAFT", "target", "DONE", "guard", Map.of("equals", true)))))).code());
  }

  @Test
  void validatesInstanceShapeAndBinding() {
    assertEquals(Workflow.INVALID_INSTANCE, assertThrows(FinKoreException.class, () -> Workflow.Instance.fromPortable(Map.of())).code());
    assertEquals(Workflow.INVALID_INSTANCE, assertThrows(FinKoreException.class, () -> Workflow.Instance.fromPortable(Map.of(
        "currentStates", List.of("DRAFT", "SUBMITTED")))).code());
    assertEquals(Workflow.INVALID_INSTANCE, assertThrows(FinKoreException.class, () -> Workflow.Instance.fromPortable(Map.of(
        "currentState", "DRAFT",
        "revision", ""))).code());
    assertEquals(Workflow.INVALID_INSTANCE, assertThrows(FinKoreException.class, () -> Workflow.Instance.fromPortable(Map.of(
        "currentState", "DRAFT",
        "binding", Map.of("definitionIdentity", "invoice-approval")))).code());
    assertEquals(Workflow.VERSION_MISMATCH, assertThrows(FinKoreException.class, () -> Workflow.importInstance(
        unversionedDefinition(),
        Workflow.Instance.fromPortable(Map.of(
            "currentState", "DRAFT",
            "binding", Map.of("definitionIdentity", "invoice-approval", "definitionVersionIdentity", "1"))))).code());
  }

  @Test
  void importsRejectUndeclaredStateAndVersionMismatch() {
    assertEquals(Workflow.INVALID_STATE, assertThrows(FinKoreException.class, () -> Workflow.importInstance(
        unversionedDefinition(),
        Workflow.Instance.fromPortable(Map.of("currentState", "PAID")))).code());
    assertEquals(Workflow.VERSION_MISMATCH, assertThrows(FinKoreException.class, () -> Workflow.importInstance(
        versionedDefinition("2"),
        Workflow.Instance.fromPortable(Map.of(
            "currentState", "SUBMITTED",
            "binding", Map.of("definitionIdentity", "invoice-approval", "definitionVersionIdentity", "1"))))).code());
  }

  @Test
  void transitionsRespectGuardsAndPreconditionsWithoutMutation() {
    Workflow.Definition definition = approvalWorkflow();
    Workflow.Instance instance = Workflow.Instance.fromPortable(Map.of("currentState", "SUBMITTED", "revision", "wf-rev:0007"));

    assertEquals(Map.of("currentState", "APPROVED", "revision", "wf-rev:0007"), Workflow.transition(
        definition,
        instance,
        "APPROVED",
        Map.of("approvalsSatisfied", true, "riskAccepted", true),
        "SUBMITTED",
        "wf-rev:0007").toPortable());
    assertEquals(Map.of("currentState", "SUBMITTED", "revision", "wf-rev:0007"), instance.toPortable());

    assertEquals(Workflow.GUARD_REJECTED, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition, instance, "APPROVED", Map.of("approvalsSatisfied", false))).code());
    assertEquals(Workflow.STATE_CONFLICT, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition, instance, "APPROVED", Map.of("approvalsSatisfied", true, "riskAccepted", true), "DRAFT", Workflow.OMITTED)).code());
    assertEquals(Workflow.STATE_CONFLICT, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition, instance, "APPROVED", Map.of("approvalsSatisfied", true, "riskAccepted", true), Workflow.OMITTED, "old")).code());
  }

  @Test
  void transitionsRejectInvalidStateTerminalAndUndeclaredMoves() {
    Workflow.Definition definition = approvalWorkflow();

    assertEquals(Workflow.INVALID_STATE, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition,
        Workflow.Instance.fromPortable(Map.of("currentState", "PAID")),
        "APPROVED",
        Map.of())).code());
    assertEquals(Workflow.TERMINAL_STATE, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition,
        Workflow.Instance.fromPortable(Map.of("currentState", "APPROVED")),
        "REJECTED",
        Map.of())).code());
    assertEquals(Workflow.INVALID_TRANSITION, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition,
        Workflow.Instance.fromPortable(Map.of("currentState", "DRAFT")),
        "APPROVED",
        Map.of())).code());
    assertEquals(Workflow.INVALID_STATE, assertThrows(FinKoreException.class, () -> Workflow.transition(
        definition,
        Workflow.Instance.fromPortable(Map.of("currentState", "DRAFT")),
        "draft",
        Map.of())).code());
  }

  @Test
  void unversionedDefinitionHasNoBinding() {
    Workflow.Definition definition = unversionedDefinition();

    assertNull(definition.binding());
    assertEquals("SUBMITTED", definition.transition("DRAFT", "SUBMITTED").target());
    assertNull(definition.transition("SUBMITTED", "DRAFT"));
  }

  private static Workflow.Definition unversionedDefinition() {
    return Workflow.Definition.fromPortable(Map.of(
        "states", List.of("DRAFT", "SUBMITTED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("SUBMITTED"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "SUBMITTED"))));
  }

  private static Workflow.Definition versionedDefinition(String version) {
    return Workflow.Definition.fromPortable(Map.of(
        "definitionIdentity", "invoice-approval",
        "definitionVersionIdentity", version,
        "states", List.of("DRAFT", "SUBMITTED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("SUBMITTED"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "SUBMITTED"))));
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
                "guards", List.of(
                    Map.of("fact", "approvalsSatisfied", "equals", true),
                    Map.of("fact", "riskAccepted", "equals", true))),
            Map.of("source", "SUBMITTED", "target", "REJECTED"))));
  }
}
