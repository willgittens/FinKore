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

/** Entity evolution regressions through public native APIs, without adapters. */
public final class EntityEvolutionTest {
  private EntityEvolutionTest() {}

  /** Runs portable examples, cross-field validation and defensive history import. */
  public static void main(String[] args) throws IOException {
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    List<Map<String, Object>> vectors = new ArrayList<>();
    for (String file : List.of("evolution", "readiness-regressions")) {
      for (Object vector : list(map(Json.parse(Files.readString(root.resolve("conformance/entities/" + file + ".json")))).get("vectors"))) vectors.add(map(vector));
    }
    Map<String, String> kinds = Map.of("correct", "CORRECTION", "reverse", "REVERSAL", "void", "VOID", "supersede", "SUPERSESSION");
    for (Map<String, Object> vector : vectors) {
      Map<String, Object> input = map(copy(vector.get("input")));
      input.put("evolutionHistory", Map.of("relations", input.getOrDefault("evolutionHistory", List.of())));
      Object before = copy(input);
      String operation = (String) vector.get("operation");
      String kind = kinds.get(operation.substring(operation.lastIndexOf('.') + 1));
      Map<String, Object> expected = map(vector.get("expected"));
      try {
        if ("error".equals(expected.get("status"))) {
          error((String) map(expected.get("error")).get("code"), () -> Entities.evolve(kind, input.get("definition"), input));
        } else equal(expected.get("value"), Entities.evolve(kind, input.get("definition"), input));
      } catch (AssertionError failure) {
        throw new AssertionError(vector.get("id") + ": " + failure.getMessage(), failure);
      } finally { equal(before, input); }
    }
    crossField(vectors, kinds);
    historyImport(vectors);
    explicitSuccessorEffect();
    System.out.println("Java native Entity evolution regressions passed.");
  }

  private static void crossField(List<Map<String, Object>> vectors, Map<String, String> kinds) {
    for (Map.Entry<String, String> operation : kinds.entrySet()) {
      Map<String, Object> template = input(vectors, "entity.evolution." + operation.getKey() + ".evidence-valid-control-001");
      List<String> keys = "VOID".equals(operation.getValue()) ? List.of("source") : List.of("source", "SUPERSESSION".equals(operation.getValue()) ? "successor" : "related");
      for (String key : keys) for (boolean valid : List.of(false, true)) {
        Map<String, Object> request = map(copy(template));
        map(request.get("definition")).put("validation", List.of(Map.of("id", "WITHIN_LIMIT", "path", "amount", "otherPath", "limit", "rule", "money-not-greater-than")));
        for (String name : List.of("source", "related", "successor")) if (request.containsKey(name)) {
          Map<String, Object> data = map(map(request.get(name)).get("data")); data.put("limit", copy(data.get("amount")));
        }
        Map<String, Object> data = map(map(request.get(key)).get("data"));
        data.put("amount", Map.of("amount", "20.00", "currency", "EUR"));
        data.put("limit", Map.of("amount", valid ? "20.0" : "19.99", "currency", "EUR"));
        Object before = copy(request);
        if (valid) equal(request.get("source"), Entities.evolve(operation.getValue(), request.get("definition"), request).get("source"));
        else error(Entities.VALIDATION_FAILED, () -> Entities.evolve(operation.getValue(), request.get("definition"), request));
        equal(before, request);
      }
    }
  }

  private static void historyImport(List<Map<String, Object>> vectors) {
    equal(Map.of("relations", List.of()), Entities.importEvolutionHistory(null));
    for (String name : List.of("valid-void-sequence", "valid-supersession-sequence", "contradiction", "same-step-contradiction", "void-effect-invalid")) {
      Map<String, Object> history = new LinkedHashMap<>(Map.of("relations", input(vectors, "entity.evolution.history." + name + "-001").get("evolutionHistory")));
      Object before = copy(history);
      if (name.startsWith("valid-")) {
        Map<String, Object> result = Entities.importEvolutionHistory(history);
        equal(before, result);
        map(map(list(result.get("relations")).get(0)).get("source")).put("id", "changed");
      } else error(Entities.INVALID_MUTATION, () -> Entities.importEvolutionHistory(history));
      equal(before, history);
    }
  }

  private static Map<String, Object> input(List<Map<String, Object>> vectors, String id) {
    return map(copy(vectors.stream().filter(vector -> id.equals(vector.get("id"))).findFirst().orElseThrow().get("input")));
  }

  private static void explicitSuccessorEffect() {
    Map<String, Object> reference = Map.of("type", "invoice", "id", "invoice-1", "revision", "revision-1");
    for (String kind : List.of("CORRECTION", "REVERSAL")) for (boolean current : List.of(false, true)) {
      Map<String, Object> invalid = Map.of("relations", List.of(Map.of("kind", kind, "relationId", "same-key", "source", reference, "related", reference,
          "sourceCurrent", current, "relatedCurrent", !current, "auditEventId", "audit-same-key")));
      error(Entities.INVALID_MUTATION, () -> Entities.importEvolutionHistory(invalid));
    }
    for (boolean current : List.of(true, false)) {
      Map<String, Object> invalid = Map.of("relations", List.of(Map.of("kind", "SUPERSESSION", "relationId", "same-key", "source", reference, "related", reference,
          "sourceCurrent", current, "relatedCurrent", current, "supersessionScope", "current", "auditEventId", "audit-same-key")));
      Object before = copy(invalid);
      error(Entities.INVALID_MUTATION, () -> Entities.importEvolutionHistory(invalid));
      equal(before, invalid);
    }
    List<Object> relations = new ArrayList<>();
    for (List<String> pair : List.of(List.of("a", "b"), List.of("b", "c"), List.of("c", "b"))) {
      relations.add(Map.of("kind", "SUPERSESSION", "relationId", pair.get(0) + "-" + pair.get(1),
          "source", Map.of("type", "invoice", "id", pair.get(0), "revision", "revision"),
          "related", Map.of("type", "invoice", "id", pair.get(1), "revision", "revision"),
          "sourceCurrent", false, "relatedCurrent", true, "supersessionScope", "current", "auditEventId", "audit-" + pair.get(0) + pair.get(1)));
    }
    Map<String, Object> history = Map.of("relations", relations);
    equal(history, Entities.importEvolutionHistory(history));
    Map<String, Object> first = Map.of("type", "invoice", "id", "id\0part", "revision", "r");
    Map<String, Object> second = Map.of("type", "invoice\0id", "id", "part", "revision", "r");
    history = Map.of("relations", List.of(
        Map.of("kind", "VOID", "relationId", "void", "source", first, "sourceCurrent", false, "auditEventId", "audit-void"),
        Map.of("kind", "CORRECTION", "relationId", "correction", "source", second, "related", second, "sourceCurrent", true, "relatedCurrent", true, "auditEventId", "audit-correction")));
    equal(history, Entities.importEvolutionHistory(history));
  }

  private static void error(String code, Runnable action) {
    try { action.run(); }
    catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code);
  }

  private static void equal(Object expected, Object actual) {
    if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + ", received " + actual);
  }

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> record) { Map<String, Object> result = new LinkedHashMap<>(); record.forEach((key, item) -> result.put((String) key, copy(item))); return result; }
    if (value instanceof List<?> array) { List<Object> result = new ArrayList<>(); array.forEach(item -> result.add(copy(item))); return result; }
    return value;
  }
  @SuppressWarnings("unchecked")
  private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked")
  private static List<Object> list(Object value) { return (List<Object>) value; }
}
