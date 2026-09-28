// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/** Core 0.9.7 native ownership, exact equality, and actual-result sequence regressions. */
public final class EvidenceRegressionTest {
  private EvidenceRegressionTest() {}

  /** Runs named cases independently; unexpected runtime errors never count as portable failures. */
  public static void main(String[] args) throws IOException {
    List<String> failures = new ArrayList<>(); int count = 0;
    for (var entry : cases().entrySet()) {
      if (args.length > 0 && !entry.getKey().contains(args[0])) continue;
      count++;
      try { entry.getValue().run(); System.out.println("PASS " + entry.getKey()); }
      catch (AssertionError | RuntimeException error) {
        failures.add(entry.getKey());
        System.out.println("FAIL " + entry.getKey() + ": " + error.getClass().getSimpleName() + " " + error.getMessage());
      }
    }
    if (count == 0) throw new AssertionError("No evidence regressions selected");
    System.out.println("Evidence regressions: " + count + ", failures: " + failures.size());
    if (!failures.isEmpty()) throw new AssertionError(String.join(", ", failures));
  }

  /** Provides stable named cases to ordinary testing, coverage and targeted mutation selection. */
  public static Map<String, Runnable> cases() throws IOException {
    Map<String, Runnable> cases = new LinkedHashMap<>();
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> manifest = map(Json.parse(Files.readString(root.resolve("conformance/manifest.json"))));
    for (Object suite : list(manifest.get("suites"))) for (Object file : list(map(suite).get("vectorFiles"))) {
      if (!((String) file).endsWith("/evidence-regressions.json")) continue;
      for (Object raw : list(map(Json.parse(Files.readString(root.resolve("conformance").resolve((String) file)))).get("vectors"))) {
        Map<String, Object> vector = map(raw);
        String id = (String) vector.get("id");
        if (id.contains(".boundary097.")) cases.put(id, () -> vector(vector));
      }
    }
    for (Object raw : list(map(Json.parse(Files.readString(root.resolve("conformance/boundary097-cases.json")))).get("cases"))) {
      Map<String, Object> v = map(raw);
      if ("core-and-adapter".equals(v.get("testBoundary"))) cases.put((String) v.get("id"), () -> vector(v));
    }
    for (String lifecycle : List.of("withdraw", "target", "successor", "requirement"))
      for (String variant : List.of("control", "collision", "offset"))
        cases.put("native097.sequence-" + lifecycle + "-" + variant, () -> sequence(lifecycle, variant));
    cases.put("native097.approval-owned-control", EvidenceRegressionTest::ownedFacts);
    for (Object value : List.of(new AtomicInteger(1), new AtomicLong(1), new MutableDecimal("1"), new MutableInteger("1"), Double.NaN, Double.POSITIVE_INFINITY)) {
      cases.put("native097.approval-reject-" + value.getClass().getSimpleName() + "-" + value, () -> {
        Map<String, Object> history = Approvals.recordDecision(requirement(), decision("2026-09-01T10:00:00Z", 1), List.of());
        Object before = copy(history);
        error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(requirement(), decision("2026-09-02T10:00:00Z", value), history));
        equal(before, history);
      });
      cases.put("native097.workflow-reject-" + value.getClass().getSimpleName() + "-" + value, () -> error(Workflow.INVALID_DEFINITION, () -> Workflow.Definition.fromPortable(definition(value))));
    }
    for (Object value : List.of((byte) 1, (short) 1, 1, 1L, BigInteger.ONE, new BigDecimal("1.00"), 1.0f, 1.0d))
      cases.put("native097.numeric-control-" + value.getClass().getSimpleName(), () -> {
        Map<String, Object> recorded = Approvals.recordDecision(requirement(), decision("2026-09-01T10:00:00Z", value), List.of());
        equal(value, map(map(list(recorded.get("history")).get(0)).get("subjectFacts")).get("value"));
        equal("EFFECTIVE", Approvals.evaluateDecision(requirement(), list(recorded.get("history")).get(0), Map.of("value", value), List.of("value"), null));
        Workflow.Definition def = Workflow.Definition.fromPortable(definition(value));
        Workflow.Instance instance = Workflow.create(def);
        equal("DONE", Workflow.transition(def, instance, "DONE", Map.of("value", value)).currentState());
        equal("DRAFT", instance.currentState());
      });
    cases.put("native097.decimal-scale-selected", () -> exactNumbers(List.of("value")));
    cases.put("native097.decimal-scale-complete", () -> exactNumbers(Approvals.OMITTED));
    return cases;
  }

  private static Object invoke(Map<String, Object> v) {
    Map<String, Object> i = map(v.get("input"));
    String op = (String) v.get("operation");
    return switch (op) {
      case "approval.composition.evaluate" -> Approvals.evaluateComposition(i.get("composition"), i.get("requirements"), i.getOrDefault("decisions", List.of()), i.get("context"));
      case "approval.condition.evaluate" -> Approvals.evaluateCondition(i.get("condition"), i.getOrDefault("facts", Approvals.OMITTED), i.get("result"));
      case "approval.decision.record" -> Approvals.recordDecision(i.get("requirement"), i.get("decision"), i.get("history"));
      case "approval.decision.evaluate" -> Approvals.evaluateDecision(i.get("requirement"), i.get("decision"), i.getOrDefault("currentSubjectFacts", Approvals.OMITTED), i.getOrDefault("relevantFactPaths", Approvals.OMITTED), i.get("evaluatedAt"));
      case "approval.requirement.evaluate" -> Approvals.evaluateRequirement(i.get("requirement"), i.get("decisions"), i.getOrDefault("currentSubjectFacts", Approvals.OMITTED), i.getOrDefault("relevantFactPaths", Approvals.OMITTED), i.get("evaluatedAt"));
      case "finkore.entity.create" -> Entities.create(i.get("definition"), i.get("id"), i.get("data"));
      case "finkore.entity.mutate" -> Entities.mutate(i.get("definition"), i.get("entity"), i.get("changes"));
      case "finkore.entity.transition" -> Entities.transition(i.get("definition"), i.get("entity"), i.get("target"));
      case "entity.import" -> Entities.importEntity(i.get("definition"), i.get("import"));
      default -> {
        String kind = switch (op) {
          case "finkore.entity.evolution.correct" -> "CORRECTION";
          case "finkore.entity.evolution.reverse" -> "REVERSAL";
          case "finkore.entity.evolution.void" -> "VOID";
          case "finkore.entity.evolution.supersede" -> "SUPERSESSION";
          default -> throw new AssertionError("Missing native dispatch " + op);
        };
        Map<String, Object> request = new LinkedHashMap<>(i);
        if (i.get("evolutionHistory") instanceof List<?>) request.put("evolutionHistory", Map.of("relations", i.get("evolutionHistory")));
        yield Entities.evolve(kind, i.get("definition"), request);
      }
    };
  }
  private static void vector(Map<String, Object> v) {
    Map<String, Object> candidate = map(copy(v)); Object before = copy(candidate.get("input"));
    Map<String, Object> expected = map(v.get("expected"));
    try {
      if ("success".equals(expected.get("status"))) equal(expected.get("value"), invoke(candidate));
      else error((String) map(expected.get("error")).get("code"), () -> invoke(candidate));
    } finally { equal(before, candidate.get("input")); }
  }
  private static Map<String, Object> requirement() {
    return Map.of("id", "review", "subject", Map.of("type", "invoice", "id", "i"), "eligibleActors", List.of("alice"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
  }
  private static Map<String, Object> decision(String time, Object number) {
    return new LinkedHashMap<>(Map.of("requirementId", "review", "actor", Map.of("id", "alice"), "subjectFacts", new LinkedHashMap<>(Map.of("value", number)), "outcome", "APPROVED", "decidedAt", time));
  }
  private static Map<String, Object> reference(Map<String, Object> d) { return Map.of("requirementId", "review", "actorId", "alice", "decidedAt", d.get("decidedAt")); }
  private static void sequence(String lifecycle, String variant) {
    Map<String, Object> first = decision("2026-09-01T10:00:00Z", 1), second = decision("2026-09-02T10:00:00Z", 2);
    Map<String, Object> one = Approvals.recordDecision(requirement(), first, List.of());
    Map<String, Object> two = Approvals.recordDecision(requirement(), second, one);
    Map<String, Object> event = new LinkedHashMap<>(Map.of("actor", Map.of("id", "alice"), "recordedAt", "2026-09-03T10:00:00Z"));
    Map<String, Object> retained;
    if (lifecycle.equals("withdraw")) { event.put("target", reference(first)); retained = Approvals.withdrawDecision(requirement(), two, event); }
    else if (lifecycle.equals("requirement")) { event.put("targetRequirementId", "review"); event.put("successorRequirementId", "next"); retained = Approvals.supersedeRequirement(two, event); }
    else { event.put("target", reference(first)); event.put("successor", reference(second)); retained = Approvals.supersedeDecision(two, event); }
    Object before = copy(retained);
    String timestamp = (String) (lifecycle.equals("successor") ? second : first).get("decidedAt");
    if (variant.equals("control")) timestamp = "2026-09-04T10:00:00Z";
    if (variant.equals("offset")) timestamp = timestamp.replace("10:00:00Z", "12:00:00+02:00");
    Map<String, Object> candidate = decision(timestamp, 3);
    Map<String, Object> imported = Approvals.importHistory(retained);
    try {
      if (!variant.equals("control") && !lifecycle.equals("requirement")) error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(requirement(), candidate, imported));
      else {
        Map<String, Object> result = Approvals.recordDecision(requirement(), candidate, imported);
        equal(Map.of("history", List.of(first, second, candidate), "lifecycle", retained.get("lifecycle")), result);
        equal(result, Approvals.importHistory(result));
        equal(lifecycle.equals("requirement") ? "PENDING" : "APPROVED", Approvals.evaluateRequirement(requirement(), result, candidate.get("subjectFacts"), List.of("value"), null));
      }
    } finally { equal(before, retained); equal(before, imported); equal(Map.of("history", List.of(first)), one); equal(Map.of("history", List.of(first, second)), two); }
  }
  private static void ownedFacts() {
    Map<String, Object> original = decision("2026-09-01T10:00:00Z", new BigDecimal("1.00"));
    Map<String, Object> history = Approvals.recordDecision(requirement(), original, List.of()); Object before = copy(history);
    map(original.get("subjectFacts")).put("value", 999);
    Map<String, Object> observed = Approvals.importHistory(history);
    map(map(list(observed.get("history")).get(0)).get("subjectFacts")).put("value", 555);
    equal(before, history);
    equal("APPROVED", Approvals.evaluateRequirement(requirement(), history, Map.of("value", new BigDecimal("1.00")), List.of("value"), null));
  }
  private static void exactNumbers(Object paths) {
    for (String number : List.of("1.0", "12345678901234567890.123456789")) {
      Map<String, Object> d = decision("2026-09-01T10:00:00Z", new BigDecimal(number)); Object before = copy(d);
      equal("EFFECTIVE", Approvals.evaluateDecision(requirement(), d, Map.of("value", new BigDecimal(number + "0")), paths, null));
      equal(before, d);
    }
  }
  private static Map<String, Object> definition(Object value) {
    return Map.of("states", List.of("DRAFT", "DONE"), "initialState", "DRAFT", "terminalStates", List.of("DONE"), "transitions", List.of(Map.of("source", "DRAFT", "target", "DONE", "guard", Map.of("fact", "value", "equals", value))), "definitionIdentity", "flow", "definitionVersionIdentity", "v1");
  }
  private static final class MutableDecimal extends BigDecimal {
    private static final long serialVersionUID = 1L;
    private String text;
    MutableDecimal(String value) { super(value); text = value; }
    @Override public String toString() { return text; }
  }
  private static final class MutableInteger extends BigInteger {
    private static final long serialVersionUID = 1L;
    private String text;
    MutableInteger(String value) { super(value); text = value; }
    @Override public String toString() { return text; }
  }
  private static void error(String code, Runnable action) {
    try { action.run(); } catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code + "; operation succeeded");
  }
  private static void equal(Object expected, Object actual) { if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + ", got " + actual); }
  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> source) { Map<String, Object> result = new LinkedHashMap<>(); source.forEach((key, item) -> result.put((String) key, copy(item))); return result; }
    if (value instanceof List<?> source) { List<Object> result = new ArrayList<>(); source.forEach(item -> result.add(copy(item))); return result; }
    return value;
  }
  @SuppressWarnings("unchecked") private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked") private static List<Object> list(Object value) { return (List<Object>) value; }
}
