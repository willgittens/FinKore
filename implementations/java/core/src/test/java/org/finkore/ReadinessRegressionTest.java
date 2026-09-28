// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Public-API lifecycle, evolution and ownership regressions; no adapter calls. */
public final class ReadinessRegressionTest {
  private ReadinessRegressionTest() {}

  /** Runs all cases, or the Approval cases with {@code approvals}, retaining diagnostics. */
  public static void main(String[] args) throws IOException {
    List<String> failures = new ArrayList<>();
    if (args.length > 1 || (args.length == 1 && !"approvals".equals(args[0]))) {
      throw new IllegalArgumentException("Expected no arguments or approvals");
    }
    for (String kind : List.of("withdraw", "decision", "requirement")) {
      Map<String, Object> nullType = new LinkedHashMap<>(); nullType.put("type", null);
      for (Map<String, Object> extra : List.of(Map.<String, Object>of(), Map.<String, Object>of("type", "WITHDRAWN"), Map.<String, Object>of("type", "DECISION_SUPERSEDED"), Map.<String, Object>of("type", "REQUIREMENT_SUPERSEDED"), Map.<String, Object>of("type", "UNKNOWN"), nullType, Map.<String, Object>of("type", Map.of()))) {
        run(failures, "lifecycle-" + kind + extra, () -> lifecycle(kind, extra));
      }
    }
    run(failures, "new-effective-decision", ReadinessRegressionTest::newEffectiveDecision);
    for (String state : List.of("missing", "ambiguous", "withdrawn", "superseded", "unique")) {
      run(failures, "withdrawal-" + state, () -> invalidWithdrawal(state));
    }
    if (args.length == 1) {
      if (!failures.isEmpty()) throw new AssertionError(String.join("\n", failures));
      System.out.println("Java Approval readiness regressions passed.");
      return;
    }
    for (boolean imported : List.of(false, true)) for (boolean array : List.of(false, true)) {
      for (boolean observation : List.of(false, true)) for (boolean approved : List.of(false, true)) {
        run(failures, "ownership-import=" + imported + ",array=" + array + ",observation=" + observation + ",approved=" + approved,
            () -> ownership(imported, array, observation, approved));
      }
    }
    run(failures, "declaration-arrays", ReadinessRegressionTest::declarationArrays);
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> document = map(Json.parse(Files.readString(root.resolve("conformance/entities/evolution.json"))));
    run(failures, "audit-failure-atomicity", () -> auditFailure(document));
    for (boolean expected : List.of(false, true)) {
      run(failures, "evolution-expected=" + expected, () -> evolution(document, expected));
    }
    if (!failures.isEmpty()) throw new AssertionError(String.join("\n", failures));
    System.out.println("Java readiness sequence and ownership regressions passed.");
  }

  private static void run(List<String> failures, String name, Runnable test) {
    try { test.run(); }
    catch (AssertionError error) { failures.add("ASSERTION " + name + ": " + error.getMessage()); }
    catch (FinKoreException error) { failures.add("PORTABLE_ERROR_MISMATCH " + name + ": " + error.code()); }
    catch (RuntimeException error) { failures.add("UNEXPECTED_EXCEPTION " + name + ": " + error); }
  }

  /** Runs native Entity result-reuse and atomicity sequences independently. */
  public static void entities() throws IOException {
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> document = map(Json.parse(Files.readString(root.resolve("conformance/entities/evolution.json"))));
    auditFailure(document);
    evolution(document, false);
    evolution(document, true);
  }

  /** Selects existing public-API regressions for isolated native mutation probes. */
  public static Map<String, Runnable> mutationCases() throws IOException {
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> document = map(Json.parse(Files.readString(root.resolve("conformance/entities/evolution.json"))));
    return Map.of(
        "approval.sequence", () -> lifecycle("withdraw", Map.of()),
        "approval.control", () -> ApprovalsTest.main(new String[0]),
        "workflow.input", () -> ownership(false, false, false, false),
        "workflow.observation", () -> ownership(false, false, true, false),
        "workflow.list", () -> WorkflowTest.main(new String[0]),
        "workflow.control", ReadinessRegressionTest::declarationArrays,
        "entity.sequence", () -> evolution(document, false),
        "entity.control", () -> auditFailure(document));
  }

  private static Map<String, Object> requirement() {
    return Map.of("id", "review", "subject", Map.of("type", "invoice", "id", "invoice-1"), "eligibleActors", List.of("alice"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
  }

  private static Map<String, Object> decision(String revision, String date) {
    return new LinkedHashMap<>(Map.of("requirementId", "review", "subjectFacts", Map.of("revision", revision), "outcome", "APPROVED", "actor", Map.of("id", "alice"), "decidedAt", date));
  }

  private static Map<String, Object> target(String date) {
    return Map.of("requirementId", "review", "actorId", "alice", "decidedAt", date);
  }

  private static Map<String, Object> event() {
    return new LinkedHashMap<>(Map.of("target", target("2026-09-01T12:00:00Z"), "actor", Map.of("id", "alice"), "recordedAt", "2026-09-02T12:00:00Z"));
  }

  // APPROVAL-VALIDITY-001/002/004/010/011/012.
  private static void lifecycle(String kind, Map<String, Object> extra) {
    Map<String, Object> first = decision("3", "2026-09-01T12:00:00Z");
    Map<String, Object> later = decision("4", "2026-09-03T12:00:00Z");
    Map<String, Object> committed;
    Map<String, Object> request = event(); request.putAll(extra);
    if (kind.equals("withdraw")) committed = Approvals.withdrawDecision(requirement(), List.of(first), request);
    else if (kind.equals("decision")) {
      request.put("successor", target("2026-09-03T12:00:00Z"));
      committed = Approvals.supersedeDecision(List.of(first, later), request);
    } else {
      request.remove("target"); request.put("targetRequirementId", "review"); request.put("successorRequirementId", "next-review");
      committed = Approvals.supersedeRequirement(List.of(first), request);
    }
    Object before = copy(committed);
    Map<String, Object> next = decision("4", "2026-09-04T12:00:00Z");
    Map<String, Object> recorded = Approvals.recordDecision(requirement(), next, committed);
    equal(before, committed);
    List<Object> expected = new ArrayList<>(list(committed.get("history"))); expected.add(next);
    equal("PENDING", Approvals.evaluateRequirement(requirement(), recorded, Map.of("revision", "3"), List.of("revision"), null));
    equal(Map.of("history", expected, "lifecycle", committed.get("lifecycle")), recorded);
    Object stable = copy(recorded); next.put("outcome", "PENDING");
    error("FINKORE_APPROVAL_INVALID_DECISION", () -> Approvals.recordDecision(requirement(), next, recorded));
    equal(stable, recorded);
    next.put("outcome", "APPROVED"); next.remove("subjectFacts");
    error("FINKORE_APPROVAL_INVALID_DECISION", () -> Approvals.recordDecision(requirement(), next, recorded));
    equal(stable, recorded);
    equal("PENDING", Approvals.evaluateRequirement(requirement(), recorded, Map.of("revision", "3"), List.of("revision"), null));
    map(list(recorded.get("lifecycle")).get(0)).put("type", "UNKNOWN");
    equal(before, committed);
  }

  private static void invalidWithdrawal(String state) {
    Map<String, Object> first = decision("3", "2026-09-01T12:00:00Z");
    Map<String, Object> later = decision("4", "2026-09-03T12:00:00Z");
    Map<String, Object> history = new LinkedHashMap<>();
    history.put("history", List.of(first)); history.put("lifecycle", List.of());
    if (state.equals("missing")) history.put("history", List.of(later));
    if (state.equals("ambiguous")) history.put("history", List.of(first, copy(first)));
    if (state.equals("withdrawn")) history = Approvals.withdrawDecision(requirement(), history, event());
    if (state.equals("superseded")) {
      history.put("history", List.of(first, later));
      Map<String, Object> request = event(); request.put("successor", target("2026-09-03T12:00:00Z"));
      history = Approvals.supersedeDecision(history, request);
    }
    Map<String, Object> original = history;
    Object before = copy(original);
    String outcome = Approvals.evaluateRequirement(requirement(), original, Map.of("revision", "3"), List.of("revision"), null);
    if (state.equals("unique")) {
      Map<String, Object> result = Approvals.withdrawDecision(requirement(), original, event());
      equal("PENDING", Approvals.evaluateRequirement(requirement(), result, Map.of("revision", "3"), List.of("revision"), null));
    } else error(Approvals.INVALID_DECISION, () -> Approvals.withdrawDecision(requirement(), original, event()));
    equal(before, original);
    equal(outcome, Approvals.evaluateRequirement(requirement(), original, Map.of("revision", "3"), List.of("revision"), null));
  }

  private static void newEffectiveDecision() {
    Map<String, Object> committed = Approvals.withdrawDecision(requirement(), List.of(decision("3", "2026-09-01T12:00:00Z")), event());
    Map<String, Object> recorded = Approvals.recordDecision(requirement(), decision("3", "2026-09-03T12:00:00Z"), committed);
    equal("APPROVED", Approvals.evaluateRequirement(requirement(), recorded, Map.of("revision", "3"), List.of("revision"), null));
    equal(committed.get("lifecycle"), recorded.get("lifecycle"));
  }

  private static Map<String, String> binding() {
    return Map.of("definitionIdentity", "review-flow", "definitionVersionIdentity", "v1");
  }

  private static Map<String, Object> definition(Object value) {
    Map<String, Object> raw = new LinkedHashMap<>(binding());
    raw.put("states", new ArrayList<>(List.of("DRAFT", "DONE"))); raw.put("initialState", "DRAFT");
    raw.put("terminalStates", new ArrayList<>(List.of("DONE")));
    raw.put("transitions", new ArrayList<>(List.of(new LinkedHashMap<>(Map.of("source", "DRAFT", "target", "DONE", "guard", Map.of("fact", "decision", "equals", value))))));
    return raw;
  }

  // WORKFLOW-VERSION-003/009, including accepted and rejected transition controls.
  private static void ownership(boolean imported, boolean array, boolean observation, boolean approved) {
    Map<String, Object> inner = new LinkedHashMap<>(Map.of("approved", true));
    Object value = array ? new LinkedHashMap<>(Map.of("checks", new ArrayList<>(List.of(inner)))) : inner;
    Workflow.Definition definition = Workflow.Definition.fromPortable(definition(value));
    Workflow.Instance instance = imported ? Workflow.importInstance(definition, Workflow.Instance.fromPortable(Map.of("currentState", "DRAFT", "binding", binding(), "revision", "revision-1"))) : Workflow.create(definition);
    Object before = copy(instance.toPortable());
    Object retained = observation ? definition.transition("DRAFT", "DONE").guards().get(0).get("equals") : value;
    try {
      if (array) map(list(map(retained).get("checks")).get(0)).put("approved", false);
      else map(retained).put("approved", false);
    } catch (UnsupportedOperationException expected) { /* Deep immutability is an allowed design. */ }
    Map<String, Object> facts = Map.of("decision", array ? Map.of("checks", List.of(Map.of("approved", approved))) : Map.of("approved", approved));
    Object factsBefore = copy(facts);
    if (approved) {
      Workflow.Instance result = Workflow.transition(definition, instance, "DONE", facts);
      Map<String, Object> expected = new LinkedHashMap<>(map(before)); expected.put("currentState", "DONE");
      equal(expected, result.toPortable());
    } else error("FINKORE_WORKFLOW_GUARD_REJECTED", () -> Workflow.transition(definition, instance, "DONE", facts));
    equal(before, instance.toPortable()); equal(factsBefore, facts);
  }

  private static void declarationArrays() {
    Map<String, Object> raw = definition(true);
    map(list(raw.get("transitions")).get(0)).remove("guard");
    Workflow.Definition definition = Workflow.Definition.fromPortable(raw);
    Workflow.Instance instance = Workflow.create(definition);
    list(raw.get("states")).clear(); list(raw.get("terminalStates")).clear();
    map(list(raw.get("transitions")).get(0)).put("target", "OTHER");
    Workflow.Instance result = Workflow.transition(definition, instance, "DONE", Map.of());
    equal(Map.of("currentState", "DONE", "binding", binding()), result.toPortable());
    error("FINKORE_WORKFLOW_TERMINAL_STATE", () -> Workflow.transition(definition, result, "DRAFT", Map.of()));
  }

  // ENTITY-EVOLUTION-022/023/025/033/035: consume real histories through the native API.
  private static void evolution(Map<String, Object> document, boolean expected) {
    Map<String, Object> firstInput = fixture(document, "entity.evolution.void.audit-001");
    Object firstBefore = copy(firstInput);
    Map<String, Object> first = Entities.evolve("VOID", firstInput.get("definition"), firstInput);
    equal(firstBefore, firstInput);
    Map<String, Object> request = fixture(document, "entity.evolution.correction.audit-001");
    request.put("source", first.get("source")); request.put("evolutionHistory", first.get("evolutionHistory"));
    request.put("auditHistory", map(first.get("auditHistory")).get("history")); request.put("expectedSourceCurrent", expected);
    Object before = copy(request);
    if (expected) error("FINKORE_ENTITY_STATE_CONFLICT", () -> Entities.evolve("CORRECTION", request.get("definition"), request));
    else {
      Map<String, Object> result = Entities.evolve("CORRECTION", request.get("definition"), request);
      equal(false, map(result.get("relation")).get("sourceCurrent"));
      List<Object> relations = new ArrayList<>(list(map(first.get("evolutionHistory")).get("relations"))); relations.add(result.get("relation"));
      equal(relations, map(result.get("evolutionHistory")).get("relations"));
      List<Object> audit = new ArrayList<>(list(map(first.get("auditHistory")).get("history"))); audit.add(result.get("auditEvent"));
      equal(audit, map(result.get("auditHistory")).get("history"));
    }
    equal(before, request);
  }

  private static Map<String, Object> fixture(Map<String, Object> document, String id) {
    for (Object value : list(document.get("vectors"))) if (id.equals(map(value).get("id"))) return map(copy(map(value).get("input")));
    throw new AssertionError("Missing fixture " + id);
  }

  private static void auditFailure(Map<String, Object> document) {
    Map<String, Object> request = fixture(document, "entity.evolution.correction.audit-001");
    Map<String, Object> event = map(request.get("auditEvent"));
    event.put("occurredAt", "invalid");
    map(map(event.get("metadata")).get("entityEvolution")).put("relationId", "wrong-relation");
    Object before = copy(request);
    try { error("FINKORE_AUDIT_INVALID_EVENT", () -> Entities.evolve("CORRECTION", request.get("definition"), request)); }
    finally { equal(before, request); }
  }

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> record) { Map<String, Object> result = new LinkedHashMap<>(); record.forEach((key, item) -> result.put((String) key, copy(item))); return result; }
    if (value instanceof List<?> array) { List<Object> result = new ArrayList<>(); array.forEach(item -> result.add(copy(item))); return result; }
    return value;
  }

  @SuppressWarnings("unchecked") private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked") private static List<Object> list(Object value) { return (List<Object>) value; }
  private static void equal(Object expected, Object actual) { if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + ", actual " + actual); }
  private static void error(String code, Runnable action) {
    try { action.run(); } catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected portable error " + code);
  }
}
