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

/** Core 0.9.6 native regressions and controls, independently of adapter dispatch. */
public final class ConstructionEvaluationRegressionTest {
  private ConstructionEvaluationRegressionTest() {}

  /** Executes named cases, reporting all failures; raw runtime exceptions never count as portable errors. */
  public static void main(String[] args) throws IOException {
    int executed = 0;
    List<String> failures = new ArrayList<>();
    for (Map.Entry<String, Runnable> entry : cases().entrySet()) {
      if (args.length > 0 && !entry.getKey().contains(args[0])) continue;
      executed++;
      try { entry.getValue().run(); System.out.println("PASS " + entry.getKey()); }
      catch (AssertionError | RuntimeException error) {
        failures.add(entry.getKey());
        System.out.println("FAIL " + entry.getKey() + ": " + error.getClass().getSimpleName() + " " + error.getMessage());
      }
    }
    if (executed == 0) throw new AssertionError("No Core 0.9.6 tests selected");
    System.out.println("Construction/evaluation tests: " + executed + ", failures: " + failures.size());
    if (!failures.isEmpty()) throw new AssertionError("Regressions failed: " + String.join(", ", failures));
  }

  /** Exposes named behavioral regressions and paired controls for normal discovery and later mutation probes. */
  public static Map<String, Runnable> cases() throws IOException {
    Map<String, Runnable> result = new LinkedHashMap<>();
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> manifest = map(Json.parse(Files.readString(root.resolve("conformance/manifest.json"))));
    Map<String, Object> correction = null;
    for (Object suite : list(manifest.get("suites"))) for (Object file : list(map(suite).get("vectorFiles"))) {
      for (Object item : list(map(Json.parse(Files.readString(root.resolve("conformance").resolve((String) file)))).get("vectors"))) {
        Map<String, Object> v = map(item);
        String id = (String) v.get("id");
        if (!id.contains(".boundary096.")) continue;
        result.put(id, () -> nativeVector(v));
        if (id.equals("entity.boundary096.evolution-correct-control-001")) correction = v;
      }
    }
    if (result.isEmpty() || correction == null) throw new AssertionError("Missing manifest regressions");
    for (String fault : List.of("initial", "empty", "duplicate", "terminal", "outgoing-terminal", "endpoint", "version"))
      result.put("workflow.native.constructor-" + fault, () -> error(Workflow.INVALID_DEFINITION, () -> definition(fault)));
    result.put("workflow.native.control", ConstructionEvaluationRegressionTest::workflowControl);
    result.put("workflow.native.null-states", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(null, "DRAFT", List.of(), List.of(), null, null)));
    result.put("workflow.native.null-state-member", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(java.util.Arrays.asList("DRAFT", null), "DRAFT", List.of(), List.of(), null, null)));
    result.put("workflow.native.null-terminals", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(List.of("DRAFT"), "DRAFT", null, List.of(), null, null)));
    result.put("workflow.native.duplicate-terminals", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(List.of("DRAFT"), "DRAFT", List.of("DRAFT", "DRAFT"), List.of(), null, null)));
    result.put("workflow.native.null-transitions", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(List.of("DRAFT"), "DRAFT", List.of(), null, null, null)));
    result.put("workflow.native.null-transition-member", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(List.of("DRAFT"), "DRAFT", List.of(), java.util.Collections.singletonList(null), null, null)));
    result.put("workflow.native.empty-version", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Definition(List.of("DRAFT"), "DRAFT", List.of(), List.of(), "f", "")));
    result.put("workflow.native.null-transition-source", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Transition(null, "DONE", List.of())));
    result.put("workflow.native.null-transition-target", () -> error(Workflow.INVALID_DEFINITION,
        () -> new Workflow.Transition("DRAFT", null, List.of())));
    result.put("workflow.native.null-instance-state", () -> error(Workflow.INVALID_INSTANCE,
        () -> new Workflow.Instance(null, null, null)));
    result.put("workflow.native.empty-instance-revision", () -> error(Workflow.INVALID_INSTANCE,
        () -> new Workflow.Instance("DRAFT", null, "")));
    result.put("workflow.native.malformed-instance-binding", () -> error(Workflow.INVALID_INSTANCE,
        () -> new Workflow.Instance("DRAFT", Map.of("definitionIdentity", "f"), null)));
    result.put("approval.sequence.supersession-across-requirements", ConstructionEvaluationRegressionTest::supersessionSequence);
    result.put("approval.context.ineligible-expiration", () -> {
      Map<String, Object> expiring = new LinkedHashMap<>(decision("2026-09-05T00:00:00Z"));
      expiring.put("actor", Map.of("id", "bob")); expiring.put("expiresAt", "2026-09-26T00:00:00Z");
      error(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateRequirement(requirement(), List.of(expiring), null, null, null));
    });
    result.put("approval.sequence.control", () -> approvalSequence());
    for (String boundary : List.of("record", "evaluate", "withdraw", "supersede", "supersede-requirement"))
      result.put("approval.sequence.invalid-history-" + boundary, () -> invalidHistory(boundary));
    Map<String, Object> template = correction;
    result.put("entity.sequence.control", () -> evolutionSequence(template, false));
    result.put("entity.sequence.null-precondition", () -> evolutionSequence(template, true));
    return result;
  }

  private static Object invoke(Map<String, Object> vector) {
    Map<String, Object> i = map(vector.get("input"));
    String op = (String) vector.get("operation");
    return switch (op) {
      case "finkore.money.applyrate" -> {
        Money money = Money.fromPortable(i.get("value")); Object before = copy(money.toPortable());
        try { yield money.applyRate(i.get("rate"), i.get("rounding")).toPortable(); }
        finally { equal(before, money.toPortable()); }
      }
      case "workflow.import", "finkore.workflow.transition" -> {
        Workflow.Definition definition = Workflow.Definition.fromPortable(i.get("definition"));
        Workflow.Instance instance = Workflow.Instance.fromPortable(i.get("instance")); Object before = copy(instance.toPortable());
        try { yield (op.equals("workflow.import") ? Workflow.importInstance(definition, instance)
            : Workflow.transition(definition, instance, i.get("target"), i.get("facts"))).toPortable(); }
        finally { equal(before, instance.toPortable()); }
      }
      case "audit.redact" -> {
        Audit.Log log = Audit.Log.create(i.get("history")); Object before = copy(log.events());
        try { yield log.redact(i.get("policy"), i.get("redactionEvent")).toPortable(); }
        catch (FinKoreException failure) { equal(before, log.events()); throw failure; }
      }
      case "approval.composition.evaluate" -> Approvals.evaluateComposition(i.get("composition"), i.get("requirements"), i.get("decisions"), i.get("context"));
      case "approval.chain.evaluate" -> Approvals.evaluateChain(i.get("chain"), i.get("states"));
      case "approval.requirement.evaluate" -> Approvals.evaluateRequirement(i.get("requirement"), i.get("decisions"), i.get("currentSubjectFacts"), i.get("relevantFactPaths"), i.get("evaluatedAt"));
      case "approval.decision.evaluate" -> Approvals.evaluateDecision(i.get("requirement"), i.get("decision"), i.get("currentSubjectFacts"), i.get("relevantFactPaths"), i.get("evaluatedAt"));
      case "approval.decision.record" -> Approvals.recordDecision(i.get("requirement"), i.get("decision"), i.get("history"));
      case "entity.import" -> Entities.importEntity(i.get("definition"), i.get("import"));
      default -> {
        Map<String, Object> request = map(copy(i));
        request.put("evolutionHistory", Map.of("relations", request.get("evolutionHistory")));
        String kind = Map.of("correct", "CORRECTION", "reverse", "REVERSAL", "void", "VOID", "supersede", "SUPERSESSION").get(op.substring(op.lastIndexOf('.') + 1));
        if (kind == null) throw new AssertionError("Missing native dispatch: " + op);
        Object before = copy(request);
        try { yield Entities.evolve(kind, request.get("definition"), request); }
        finally { equal(before, request); }
      }
    };
  }

  private static void nativeVector(Map<String, Object> vector) {
    Map<String, Object> candidate = map(copy(vector)); Object before = copy(candidate.get("input"));
    Map<String, Object> expected = map(candidate.get("expected"));
    try {
      if ("error".equals(expected.get("status"))) error((String) map(expected.get("error")).get("code"), () -> invoke(candidate));
      else equal(expected.get("value"), invoke(candidate));
    } finally { equal(before, candidate.get("input")); }
  }

  private static Workflow.Definition definition(String fault) {
    List<String> states = switch (fault) { case "empty" -> List.of(); case "duplicate" -> List.of("DRAFT", "FINAL", "DRAFT"); default -> List.of("DRAFT", "FINAL"); };
    return new Workflow.Definition(states, fault.equals("initial") ? "GHOST" : "DRAFT",
        List.of(fault.equals("terminal") ? "GHOST" : fault.equals("outgoing-terminal") ? "DRAFT" : "FINAL"),
        List.of(new Workflow.Transition("DRAFT", fault.equals("endpoint") ? "GHOST" : "FINAL", List.of())),
        "flow", fault.equals("version") ? null : "v1");
  }

  private static void workflowControl() {
    List<String> states = new ArrayList<>(List.of("DRAFT", "FINAL"));
    Workflow.Definition definition = new Workflow.Definition(states, "DRAFT", List.of("FINAL"), List.of(new Workflow.Transition("DRAFT", "FINAL", List.of())), "flow", "v1");
    states.add("GHOST");
    Workflow.Instance created = Workflow.create(definition);
    equal(Map.of("currentState", "DRAFT", "binding", Map.of("definitionIdentity", "flow", "definitionVersionIdentity", "v1")), created.toPortable());
    Workflow.Instance imported = Workflow.importInstance(definition, Workflow.Instance.fromPortable(created.toPortable()));
    equal("FINAL", Workflow.transition(definition, imported, "FINAL", Map.of()).toPortable().get("currentState"));
    equal("DRAFT", created.toPortable().get("currentState"));
    equal(List.of("DRAFT", "FINAL"), definition.states());
  }

  private static Map<String, Object> requirement() {
    return Map.of("id", "review", "subject", Map.of("type", "invoice", "id", "i"), "eligibleActors", List.of("alice"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
  }
  private static Map<String, Object> decision(String timestamp) {
    Map<String, Object> result = new LinkedHashMap<>(Map.of("requirementId", "review", "actor", Map.of("id", "alice"), "outcome", "APPROVED", "decidedAt", timestamp));
    result.put("subjectFacts", null); return result;
  }
  private static Map<String, Object> reference(String timestamp) { return Map.of("requirementId", "review", "actorId", "alice", "decidedAt", timestamp); }
  private static String evaluate(Object history) { return Approvals.evaluateRequirement(requirement(), history, null, null, null); }
  private static Map<String, Object> approvalSequence() {
    Map<String, Object> first = decision("2026-09-01T10:00:00Z");
    Map<String, Object> history = Approvals.recordDecision(requirement(), first, List.of());
    equal(Map.of("history", List.of(first)), history); equal("APPROVED", evaluate(history));
    Map<String, Object> withdrawn = Approvals.withdrawDecision(requirement(), history, Map.of("target", reference((String) first.get("decidedAt")), "actor", Map.of("id", "alice"), "recordedAt", "2026-09-02T10:00:00Z", "type", "IGNORED_REQUEST_MEMBER"));
    equal("WITHDRAWN", map(list(withdrawn.get("lifecycle")).get(0)).get("type")); equal("PENDING", evaluate(withdrawn));
    Map<String, Object> second = decision("2026-09-03T10:00:00Z");
    Map<String, Object> result = Approvals.recordDecision(requirement(), second, withdrawn);
    equal(Map.of("history", List.of(first, second), "lifecycle", withdrawn.get("lifecycle")), result);
    equal("APPROVED", evaluate(result)); equal(Map.of("history", List.of(first)), history);
    return result;
  }
  private static void supersessionSequence() {
    Map<String, Object> req = requirement();
    Map<String, Object> other = new LinkedHashMap<>(req); other.put("id", "other");
    Map<String, Object> first = decision("2026-09-01T10:00:00Z");
    Map<String, Object> second = new LinkedHashMap<>(first); second.put("requirementId", "other");
    Map<String, Object> history = Approvals.recordDecision(req, first, List.of());
    history = Approvals.recordDecision(other, second, history);
    Map<String, Object> successor = new LinkedHashMap<>(reference("2026-09-01T10:00:00Z")); successor.put("requirementId", "other");
    Map<String, Object> event = Map.of("target", reference("2026-09-01T10:00:00Z"), "successor", successor,
        "actor", Map.of("id", "alice"), "recordedAt", "2026-09-05T00:00:00Z");
    Map<String, Object> superseded = Approvals.supersedeDecision(history, event);
    Object before = copy(superseded);
    equal("PENDING", evaluate(superseded));
    equal("APPROVED", Approvals.evaluateRequirement(other, superseded, null, null, null));
    Map<String, Object> newDecision = decision("2026-09-06T00:00:00Z");
    Map<String, Object> recorded = Approvals.recordDecision(req, newDecision, Approvals.importHistory(superseded));
    equal(List.of(first, second, newDecision), recorded.get("history"));
    equal(superseded.get("lifecycle"), recorded.get("lifecycle"));
    equal("APPROVED", evaluate(recorded));
    error(Approvals.INVALID_DECISION, () -> Approvals.supersedeDecision(superseded, event));
    equal(before, superseded);
    equal(Map.of("history", List.of(first, second)), history);
  }

  private static void invalidHistory(String boundary) {
    Map<String, Object> valid = approvalSequence(); Object preserved = copy(valid);
    Map<String, Object> malformed = map(copy(valid)); map(list(malformed.get("lifecycle")).get(0)).put("type", "UNKNOWN");
    Map<String, Object> event = new LinkedHashMap<>(Map.of("target", reference("2026-09-03T10:00:00Z"), "actor", Map.of("id", "alice"), "recordedAt", "2026-09-04T10:00:00Z"));
    Object before = copy(malformed);
    try { error(Approvals.INVALID_DECISION, () -> {
      switch (boundary) {
        case "record" -> Approvals.recordDecision(requirement(), decision("2026-09-04T10:00:00Z"), malformed);
        case "evaluate" -> evaluate(malformed);
        case "withdraw" -> Approvals.withdrawDecision(requirement(), malformed, event);
        case "supersede" -> { event.put("successor", reference("2026-09-01T10:00:00Z")); Approvals.supersedeDecision(malformed, event); }
        case "supersede-requirement" -> Approvals.supersedeRequirement(malformed, Map.of("targetRequirementId", "review", "successorRequirementId", "next", "actor", event.get("actor"), "recordedAt", event.get("recordedAt")));
        default -> throw new AssertionError(boundary);
      }
    }); } finally { equal(before, malformed); equal(preserved, valid); equal("APPROVED", evaluate(valid)); }
  }
  private static void evolutionSequence(Map<String, Object> vector, boolean invalid) {
    Map<String, Object> first = map(invoke(map(copy(vector))));
    Map<String, Object> request = map(copy(vector.get("input")));
    request.put("evolutionHistory", first.get("evolutionHistory")); request.put("auditHistory", map(first.get("auditHistory")).get("history"));
    request.put("relationId", "second-correction");
    Map<String, Object> event = map(request.get("auditEvent")); event.put("eventId", "second-audit");
    map(map(event.get("metadata")).get("entityEvolution")).put("relationId", "second-correction");
    map(list(event.get("relationships")).get(0)).put("relationshipId", "second-audit-relation");
    if (invalid) request.put("expectedSourceRevision", null);
    Object before = copy(request), preserved = copy(first);
    try {
      if (invalid) error(Entities.STATE_CONFLICT, () -> Entities.evolve("CORRECTION", request.get("definition"), request));
      else {
        Map<String, Object> result = Entities.evolve("CORRECTION", request.get("definition"), request);
        equal(List.of(first.get("relation"), result.get("relation")), map(result.get("evolutionHistory")).get("relations"));
        List<Object> expectedAudit = new ArrayList<>(list(map(first.get("auditHistory")).get("history"))); expectedAudit.add(event);
        equal(expectedAudit, map(result.get("auditHistory")).get("history")); equal(first.get("source"), result.get("source"));
      }
    } finally { equal(before, request); equal(preserved, first); }
  }

  private static void error(String code, Runnable action) {
    try { action.run(); } catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code + "; operation succeeded");
  }
  private static void equal(Object expected, Object actual) { if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + ", got " + actual); }
  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> source) {
      Map<String, Object> result = new LinkedHashMap<>();
      source.forEach((key, item) -> result.put((String) key, copy(item)));
      return result;
    }
    if (value instanceof List<?> source) {
      List<Object> result = new ArrayList<>(); source.forEach(item -> result.add(copy(item))); return result;
    }
    return value;
  }
  @SuppressWarnings("unchecked") private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked") private static List<Object> list(Object value) { return (List<Object>) value; }
}
