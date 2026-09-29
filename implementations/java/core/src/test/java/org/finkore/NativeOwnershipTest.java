// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

/** Native retention checks, including reuse of actual returned evidence. */
public final class NativeOwnershipTest {
  private NativeOwnershipTest() {}
  private static final Map<String, Object> REQ = Map.of("id", "r", "subject", Map.of("type", "invoice", "id", "i"), "eligibleActors", List.of("a"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
  private static Map<String, Object> decision(Object facts) { return Map.of("requirementId", "r", "actor", Map.of("id", "a"), "outcome", "APPROVED", "decidedAt", "2026-09-01T00:00:00Z", "subjectFacts", facts); }
  private static Map<String, Object> definition(Object value) { return Map.of("states", List.of("DRAFT", "DONE"), "initialState", "DRAFT", "terminalStates", List.of("DONE"), "transitions", List.of(Map.of("source", "DRAFT", "target", "DONE", "guard", Map.of("fact", "value", "equals", value))), "definitionIdentity", "flow", "definitionVersionIdentity", "v1"); }
  private static void error(String code, Runnable call) { try { call.run(); } catch (FinKoreException e) { equal(code, e.code()); return; } throw new AssertionError("Expected " + code); }
  private static void equal(Object a, Object b) { if (!Objects.equals(a,b)) throw new AssertionError("Observation differs"); }

  public static Map<String, Runnable> cases() throws Exception {
    Map<String, Runnable> result = new LinkedHashMap<>();
    EvidenceRegressionTest.cases().forEach((id, call) -> { if (id.startsWith("native097.")) result.put(id, call); });
    result.put("ownership097.cycles", () -> {
      List<Object> cycle = new ArrayList<>(); cycle.add(cycle);
      error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(REQ, decision(Map.of("value", cycle)), List.of()));
      error(Workflow.INVALID_DEFINITION, () -> Workflow.Definition.fromPortable(definition(cycle)));
    });
    result.put("ownership097.current-facts", () -> {
      AtomicInteger value = new AtomicInteger(1);
      Map<String, Object> prior = Approvals.recordDecision(REQ, decision(Map.of("value", 1)), List.of());
      Map<String, Object> before = Approvals.importHistory(prior);
      error(Approvals.INVALID_DECISION, () -> Approvals.evaluateDecision(REQ, decision(Map.of("value", 1)), Map.of("value", value), Approvals.OMITTED, null));
      error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(REQ, decision(Map.of("nested", List.of(value))), prior));
      value.set(999); equal(before, prior);
    });
    result.put("ownership097.shared-control", () -> {
      Map<String, Object> child = new LinkedHashMap<>(Map.of("value", new ArrayList<>(List.of(1, 2))));
      Map<String, Object> facts = Map.of("left", child, "right", child);
      Map<String, Object> history = Approvals.recordDecision(REQ, decision(facts), List.of());
      Map<String, Object> before = Approvals.importHistory(history);
      child.put("value", 999); equal(before, history);
      Map<String, Object> observation = Approvals.importHistory(history);
      observation.clear(); equal(before, history);
      equal("APPROVED", Approvals.evaluateRequirement(REQ, history, Map.of("left", Map.of("value", List.of(1, 2)), "right", Map.of("value", List.of(1, 2))), Approvals.OMITTED, null));
    });
    result.put("ownership097.workflow-captured-control", () -> {
      Map<String, Object> child = new LinkedHashMap<>(Map.of("value", List.of(1, false)));
      Workflow.Definition bound = Workflow.Definition.fromPortable(definition(Map.of("nested", child)));
      Workflow.Instance instance = Workflow.create(bound);
      child.put("value", 999);
      Object observed = bound.transitions().get(0).guards().get(0).get("equals");
      try { ((Map<?, ?>) observed).clear(); throw new AssertionError("Guard observation must be unmodifiable"); }
      catch (UnsupportedOperationException expected) { /* Documented immutable observation. */ }
      AtomicInteger rejected = new AtomicInteger(1);
      error(Workflow.INVALID_DEFINITION, () -> Workflow.Definition.fromPortable(definition(Map.of("nested", rejected))));
      rejected.set(999);
      Workflow.Instance advanced = Workflow.transition(bound, instance, "DONE", Map.of("value", Map.of("nested", Map.of("value", List.of(1, false)))));
      equal("DONE", advanced.currentState()); equal(instance.binding(), advanced.binding());
      equal("DRAFT", instance.currentState());
    });
    result.put("ownership097.collections", () -> {
      for (String field : List.of("terminalStates", "transitions")) {
        Map<String, Object> candidate = new LinkedHashMap<>(definition(1)); candidate.remove(field);
        error(Workflow.INVALID_DEFINITION, () -> Workflow.Definition.fromPortable(candidate));
        error(Workflow.INVALID_DEFINITION, () -> Entities.create(Map.of("type", "invoice", "identityScope", "tenant", "workflow", candidate, "mutability", Map.of("DRAFT", List.of("memo"), "DONE", List.of())), "i", Map.of("memo", "x")));
      }
    });
    result.put("ownership097.composition-priority", () -> {
      Map<String, Object> composition = Map.of("rootGroup", "q", "groups", List.of(Map.of("id", "q", "kind", "N_OF_M", "threshold", 1, "members", List.of(Map.of("id", "m", "type", "requirement", "requirementId", "r", "voter", Map.of("id", "a"))))));
      Map<String, Object> req = new LinkedHashMap<>(Map.of("id", "r", "applicability", "APPLICABLE", "eligibleActors", List.of("a"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED"));
      Map<String, Object> evidence = Map.of("requirementId", "r", "actor", Map.of("id", "a"), "outcome", "APPROVED", "effective", true, "subjectFacts", Map.of("value", new AtomicInteger(1)));
      error(Approvals.INVALID_CHAIN, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(evidence), null));
      req.put("applicability", "UNKNOWN");
      error(Approvals.CONDITION_UNRESOLVED, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(evidence), null));
      req.put("applicability", "APPLICABLE"); req.put("requiresEvaluationContext", true);
      error(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(evidence), null));
      req.remove("requiresEvaluationContext"); req.put("subjectFacts", Map.of("value", new AtomicInteger(1)));
      error(Approvals.INVALID_CHAIN, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(), null));
      req.put("applicability", "UNKNOWN");
      error(Approvals.CONDITION_UNRESOLVED, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(), null));
      req.put("applicability", "APPLICABLE"); req.put("requiresEvaluationContext", true);
      error(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateComposition(composition, List.of(req), List.of(), null));
    });
    return result;
  }
  public static void main(String[] args) throws Exception {
    int failed = 0;
    for (Map.Entry<String, Runnable> test : cases().entrySet()) {
      try { test.getValue().run(); }
      catch (AssertionError | RuntimeException | StackOverflowError e) { failed++; System.err.println("FAIL " + test.getKey() + ": " + e.getClass().getSimpleName()); }
    }
    if (failed != 0) throw new AssertionError(failed + " native retention failures");
    System.out.println("Native ownership cases passed: " + cases().size());
  }
}
