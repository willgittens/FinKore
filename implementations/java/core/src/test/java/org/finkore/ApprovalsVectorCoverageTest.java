// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** Executes Approval conformance vectors directly against the Java core API. */
final class ApprovalsVectorCoverageTest {
  private static final List<Path> VECTOR_FILES = List.of(
      Path.of("conformance/approvals/decisions.json"),
      Path.of("conformance/approvals/validity.json"),
      Path.of("conformance/approvals/composition.json"));

  @Test
  void approvalVectorsExecuteAgainstCoreImplementation() throws IOException {
    Path repositoryRoot = Path.of("../../..").toAbsolutePath().normalize();
    int executed = 0;
    for (Path vectorFile : VECTOR_FILES) {
      @SuppressWarnings("unchecked")
      Map<String, Object> document = (Map<String, Object>) Json.parse(Files.readString(repositoryRoot.resolve(vectorFile)));
      for (Object vectorObject : list(document.get("vectors"))) {
        @SuppressWarnings("unchecked")
        Map<String, Object> vector = (Map<String, Object>) vectorObject;
        assertEquals(vector.get("expected"), execute(vector), (String) vector.get("id"));
        executed += 1;
      }
    }
    assertEquals(66, executed);
  }

  private static Map<String, Object> execute(Map<String, Object> vector) {
    @SuppressWarnings("unchecked")
    Map<String, Object> input = (Map<String, Object>) vector.get("input");
    String operation = (String) vector.get("operation");
    try {
      return switch (operation) {
        case "approval.requirement.evaluate" -> success(Approvals.evaluateRequirement(
            input.get("requirement"),
            input.get("decisions"),
            input.get("currentSubjectFacts"),
            input.get("relevantFactPaths"),
            input.get("evaluatedAt")), null);
        case "approval.decision.record" -> success(Approvals.recordDecision(
            input.get("requirement"),
            input.get("decision"),
            input.get("history")), null);
        case "approval.decision.evaluate" -> success(Approvals.evaluateDecision(
            input.get("decision"),
            input.get("currentSubjectFacts"),
            input.get("relevantFactPaths"),
            input.get("evaluatedAt")), null);
        case "approval.condition.evaluate" -> success(Approvals.evaluateCondition(
            input.get("condition"),
            input.get("facts"),
            input.get("result")), null);
        case "approval.chain.evaluate" -> success(Approvals.evaluateChain(
            input.get("chain"),
            input.get("states")), null);
        case "approval.decision.withdraw" -> success(Approvals.withdrawDecision(
            input.get("requirement"),
            input.get("history"),
            input.get("withdrawal")), null);
        case "approval.decision.supersede" -> success(Approvals.supersedeDecision(
            input.get("history"),
            input.get("supersession")), null);
        case "approval.requirement.supersede" -> success(Approvals.supersedeRequirement(
            input.get("history"),
            input.get("supersession")), null);
        case "approval.composition.evaluate" -> success(Approvals.evaluateComposition(
            input.get("composition"),
            input.get("requirements"),
            input.get("decisions"),
            input.get("context")), compositionSuccessObservations(input));
        default -> throw new IllegalArgumentException(operation);
      };
    } catch (FinKoreException error) {
      return error(error.code(), observationsFor(operation, input));
    }
  }

  private static Map<String, Object> observationsFor(String operation, Map<String, Object> input) {
    if (List.of(
            "approval.decision.record",
            "approval.decision.withdraw",
            "approval.decision.supersede",
            "approval.requirement.supersede")
        .contains(operation)) {
      return Approvals.historyObservation(input.get("history"));
    }
    if ("approval.composition.evaluate".equals(operation) && input.get("decisions") instanceof List<?>) {
      return Map.of("decisions", input.get("decisions"));
    }
    return null;
  }

  private static Map<String, Object> compositionSuccessObservations(Map<String, Object> input) {
    Object decisions = input.get("decisions");
    if (decisions instanceof List<?> list && list.isEmpty()) {
      return Map.of("decisions", decisions);
    }
    return null;
  }

  private static Map<String, Object> success(Object value, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "success");
    result.put("value", value);
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private static Map<String, Object> error(String code, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "error");
    result.put("error", Map.of("code", code));
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private static List<?> list(Object value) {
    return (List<?>) value;
  }
}
