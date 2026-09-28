// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Executes every Approval vector at the native boundary and checks input ownership. */
public final class ApprovalContractsTest {
  private ApprovalContractsTest() {}

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> map) {
      Map<Object, Object> result = new java.util.LinkedHashMap<>();
      map.forEach((key, item) -> result.put(key, copy(item)));
      return result;
    }
    if (value instanceof List<?> list) return list.stream().map(ApprovalContractsTest::copy).toList();
    return value;
  }

  private static Object optional(Map<?, ?> input, String key) {
    return input.containsKey(key) ? input.get(key) : Approvals.OMITTED;
  }

  private static Object invoke(String operation, Map<?, ?> i) {
    return switch (operation) {
      case "approval.decision.record" -> Approvals.recordDecision(i.get("requirement"), i.get("decision"), i.get("history"));
      case "approval.decision.withdraw" -> Approvals.withdrawDecision(i.get("requirement"), i.get("history"), i.get("withdrawal"));
      case "approval.decision.supersede" -> Approvals.supersedeDecision(i.get("history"), i.get("supersession"));
      case "approval.requirement.supersede" -> Approvals.supersedeRequirement(i.get("history"), i.get("supersession"));
      case "approval.decision.evaluate" -> Approvals.evaluateDecision(i.get("requirement"), i.get("decision"), optional(i, "currentSubjectFacts"), optional(i, "relevantFactPaths"), i.get("evaluatedAt"));
      case "approval.requirement.evaluate" -> Approvals.evaluateRequirement(i.get("requirement"), i.get("decisions"), optional(i, "currentSubjectFacts"), optional(i, "relevantFactPaths"), i.get("evaluatedAt"));
      case "approval.condition.evaluate" -> Approvals.evaluateCondition(i.get("condition"), optional(i, "facts"), i.get("result"));
      case "approval.chain.evaluate" -> Approvals.evaluateChain(i.get("chain"), i.get("states"));
      case "approval.composition.evaluate" -> i.containsKey("decisions") ? Approvals.evaluateComposition(i.get("composition"), i.get("requirements"), i.get("decisions"), i.get("context")) : Approvals.evaluateComposition(i.get("composition"), i.get("requirements"), i.get("context"));
      default -> throw new AssertionError(operation);
    };
  }

  static void exactNumbers() {
    Map<String, Object> req = Map.of("id", "r", "subject", Map.of("type", "invoice", "id", "i"), "eligibleActors", List.of("a"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
    List<List<Object>> pairs = List.of(
        List.of(new java.math.BigDecimal("1.00"), 1),
        List.of(new java.math.BigDecimal("0.1"), 0.1d),
        List.of(new java.math.BigDecimal("0.1"), 0.1f),
        List.of(new java.math.BigInteger("1000000000000000000000000000001"), new java.math.BigDecimal("1000000000000000000000000000001.0")),
        List.of(-0.0d, 0), List.of((byte) 1, (short) 1), List.of(1L, 1));
    Map<String, Object> large = Map.of("requirementId", "r", "actor", Map.of("id", "a"), "subjectFacts", new java.math.BigDecimal("1000000000000000000000000000001.000000001"), "outcome", "APPROVED", "decidedAt", "2026-09-01T00:00:00Z");
    if (!"INEFFECTIVE".equals(Approvals.evaluateDecision(req, large, new java.math.BigDecimal("1000000000000000000000000000001.000000002"), Approvals.OMITTED, null))) throw new AssertionError("Adjacent exact decimals must differ");
    for (List<Object> pair : pairs) for (Object paths : List.of(Approvals.OMITTED, List.of("nested"))) {
      Map<String, Object> d = Map.of("requirementId", "r", "actor", Map.of("id", "a"), "subjectFacts", Map.of("nested", List.of(Map.of("value", pair.get(0)))), "outcome", "APPROVED", "decidedAt", "2026-09-01T00:00:00Z");
      Object now = Map.of("nested", List.of(Map.of("value", pair.get(1))));
      if (!"EFFECTIVE".equals(Approvals.evaluateDecision(req, d, now, paths, null))) throw new AssertionError("Exact numeric comparison " + pair);
      if (!"APPROVED".equals(Approvals.evaluateRequirement(req, List.of(d), now, paths, null))) throw new AssertionError("Exact numeric Requirement " + pair);
      Object changed = Map.of("nested", List.of(Map.of("value", pair.get(1).toString())));
      if (!"INEFFECTIVE".equals(Approvals.evaluateDecision(req, d, changed, paths, null))) throw new AssertionError("Numeric strings must differ");
    }
  }

  public static void main(String[] args) throws IOException {
    Path root = Path.of("").toAbsolutePath();
    while (!Files.exists(root.resolve("conformance/manifest.json"))) root = root.getParent();
    Map<?, ?> manifest = (Map<?, ?>) Json.parse(Files.readString(root.resolve("conformance/manifest.json")));
    int executed = 0;
    for (Object suite : (List<?>) manifest.get("suites")) {
      for (Object file : (List<?>) ((Map<?, ?>) suite).get("vectorFiles")) {
        Map<?, ?> document = (Map<?, ?>) Json.parse(Files.readString(root.resolve("conformance").resolve((String) file)));
        for (Object item : (List<?>) document.get("vectors")) {
          Map<?, ?> vector = (Map<?, ?>) item;
          if (!((String) vector.get("operation")).startsWith("approval.")) continue;
          Map<?, ?> input = (Map<?, ?>) vector.get("input");
          Object before = copy(input);
          Map<?, ?> expected = (Map<?, ?>) vector.get("expected");
          try {
            Object result = invoke((String) vector.get("operation"), input);
            if (!"success".equals(expected.get("status")) || !Objects.equals(result, expected.get("value"))) throw new AssertionError(vector.get("id") + ": " + result);
          } catch (FinKoreException error) {
            if (!"error".equals(expected.get("status")) || !Objects.equals(error.code(), ((Map<?, ?>) expected.get("error")).get("code"))) throw new AssertionError((String) vector.get("id"), error);
          } finally {
            if (!before.equals(input)) throw new AssertionError(vector.get("id") + ": input changed");
          }
          executed++;
        }
      }
    }
    if (executed == 0) throw new AssertionError("No Approval vectors discovered");
    for (var entry : EvidenceRegressionTest.cases().entrySet()) {
      if (entry.getKey().startsWith("native097.sequence-") || entry.getKey().startsWith("native097.decimal-scale-")) entry.getValue().run();
    }
    exactNumbers();
    System.out.println("Approval native vectors passed: " + executed);
  }
}
