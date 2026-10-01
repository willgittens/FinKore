// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/** ENTITY-VALIDATION-011 native rejection, exactness and ownership regressions. */
public final class EntityNativeValuesTest {
  private EntityNativeValuesTest() {}

  private static final class DecimalSubclass extends BigDecimal {
    private static final long serialVersionUID = 1L;
    DecimalSubclass() { super("1"); }
  }
  private static final class IntegerSubclass extends BigInteger {
    private static final long serialVersionUID = 1L;
    IntegerSubclass() { super("1"); }
  }

  /** Supplies native cases to normal tests, coverage and behavioral mutation probes. */
  public static Map<String, Runnable> cases() throws IOException {
    Map<String, Runnable> cases = new LinkedHashMap<>();
    Map<String, Object> unsupported = new LinkedHashMap<>();
    unsupported.put("atomic-integer", new AtomicInteger(1));
    unsupported.put("atomic-long", new AtomicLong(1));
    unsupported.put("decimal-subclass", new DecimalSubclass());
    unsupported.put("integer-subclass", new IntegerSubclass());
    unsupported.put("double-nan", Double.NaN);
    unsupported.put("float-nan", Float.NaN);
    unsupported.put("double-infinity", Double.POSITIVE_INFINITY);
    unsupported.put("float-infinity", Float.NEGATIVE_INFINITY);
    unsupported.put("object", new Object());
    unsupported.put("nonstring-key", Map.of(1, "value"));
    List<Object> cycle = new ArrayList<>(); cycle.add(cycle);
    unsupported.put("list-cycle", cycle);
    Map<String, Object> mapCycle = new LinkedHashMap<>(); mapCycle.put("self", mapCycle);
    unsupported.put("map-cycle", mapCycle);
    unsupported.forEach((name, value) -> {
      for (String boundary : List.of("create", "import", "current-mutate", "current-transition", "proposed")) {
        cases.put("entity.value097." + name + "." + boundary, () -> rejects(value, boundary));
      }
    });
    cases.put("entity.value097.exact-control", EntityNativeValuesTest::exactControl);
    cases.put("entity.value097.scalar-control", () -> valid(() -> equal(observed(Map.of("memo", 1)), Entities.create(definition(), "i", Map.of("memo", 1)))));
    cases.put("entity.value097.priority", () -> {
      Map<String, Object> invalid = observed(Map.of("memo", new AtomicInteger(1)));
      invalid.put("state", "");
      error(Workflow.INVALID_INSTANCE, () -> Entities.importEntity(definition(), Map.of("entity", invalid)));
      Map<String, Object> immutable = observed(Map.of("memo", 1)); immutable.put("state", "DONE");
      error(Entities.IMMUTABLE, () -> Entities.mutate(definition(), immutable, Map.of("memo", new AtomicInteger(1))));
    });
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> fixtures = map(Json.parse(Files.readString(root.resolve("conformance/entities/readiness-regressions.json"))));
    for (Object item : (List<?>) fixtures.get("vectors")) {
      Map<String, Object> vector = map(item);
      String id = (String) vector.get("id");
      if (!id.matches("entity.evolution.(correct|reverse|void|supersede).evidence-valid-control-001")) continue;
      String label = id.split("\\.")[2];
      String kind = switch (label) { case "correct" -> "CORRECTION"; case "reverse" -> "REVERSAL"; case "void" -> "VOID"; default -> "SUPERSESSION"; };
      for (String field : kind.equals("VOID") ? List.of("source") : List.of("source", kind.equals("SUPERSESSION") ? "successor" : "related")) {
        cases.put("entity.value097.evolution-" + label + "-" + field, () -> {
          Map<String, Object> request = map(copy(vector.get("input")));
          map(map(request.get(field)).get("data")).put("memo", new AtomicInteger(1));
          Object evolution = copy(request.get("evolutionHistory"));
          Object audit = copy(request.get("auditHistory"));
          error(Entities.VALIDATION_FAILED, () -> Entities.evolve(kind, request.get("definition"), request));
          equal(evolution, copy(request.get("evolutionHistory")));
          equal(audit, copy(request.get("auditHistory")));
        });
      }
      cases.put("entity.value097.evolution-" + label + "-exact-control", () -> valid(() -> {
        Map<String, Object> request = map(copy(vector.get("input")));
        BigDecimal exact = new BigDecimal("12345678901234567890.12345678900");
        map(map(request.get("source")).get("data")).put("memo", Map.of("exact", exact));
        Map<String, Object> result = Entities.evolve(kind, request.get("definition"), request);
        equal(request.get("source"), result.get("source"));
        map(map(result.get("source")).get("data")).put("memo", 0);
        equal(Map.of("exact", exact), map(map(request.get("source")).get("data")).get("memo"));
      }));
    }
    return cases;
  }

  private static Map<String, Object> definition() {
    return Map.of("type", "invoice", "identityScope", "tenant", "workflow", Map.of(
        "states", List.of("DRAFT", "DONE"), "initialState", "DRAFT", "terminalStates", List.of(),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "DONE"))),
        "mutability", Map.of("DRAFT", List.of("memo", "other"), "DONE", List.of()));
  }

  private static Map<String, Object> observed(Object data) {
    return new LinkedHashMap<>(Map.of("type", "invoice", "id", "i", "state", "DRAFT", "data", data));
  }

  private static void rejects(Object value, String boundary) {
    Map<String, Object> data = Map.of("memo", Map.of("nested", List.of(value)));
    Map<String, Object> original = observed(Map.of("memo", 1));
    error(boundary.equals("proposed") ? Entities.INVALID_MUTATION : Entities.VALIDATION_FAILED, () -> {
      switch (boundary) {
        case "create" -> Entities.create(definition(), "i", data);
        case "import" -> Entities.importEntity(definition(), Map.of("entity", observed(data)));
        case "current-mutate" -> Entities.mutate(definition(), observed(data), Map.of("memo", 2));
        case "current-transition" -> Entities.transition(definition(), observed(data), "DONE");
        case "proposed" -> Entities.mutate(definition(), original, data);
        default -> throw new AssertionError(boundary);
      }
    });
    if (((List<?>) ((Map<?, ?>) data.get("memo")).get("nested")).get(0) != value) throw new AssertionError("Input changed");
    equal(observed(Map.of("memo", 1)), original);
    valid(() -> equal(observed(Map.of("memo", 2)), Entities.mutate(definition(), original, Map.of("memo", 2))));
  }

  private static void exactControl() {
    valid(() -> {
      List<Object> numbers = new ArrayList<>(Arrays.asList(null, false, "", (byte) 1, (short) 2, 3, 4L,
          new BigInteger("1234567890123456789012345678901"), new BigDecimal("12345678901234567890.12345678900"), -0.0f, 1.25d));
      Map<String, Object> shared = new LinkedHashMap<>(Map.of("numbers", numbers, "__proto__", Map.of("constructor", "value")));
      Map<String, Object> data = Map.of("memo", shared, "other", shared);
      Map<String, Object> result = Entities.create(definition(), "i", data);
      equal(observed(data), result);
      Map<String, Object> imported = map(Entities.importEntity(definition(), Map.of("entity", result)).get("entity"));
      numbers.add(99);
      equal(imported, result);
      map(map(result.get("data")).get("memo")).put("numbers", List.of());
      equal(11, ((List<?>) map(map(imported.get("data")).get("memo")).get("numbers")).size());
      equal(11, ((List<?>) map(map(result.get("data")).get("other")).get("numbers")).size());
      List<Object> values = new ArrayList<>(List.of(new BigDecimal("1.2300")));
      Map<String, Object> changed = Entities.mutate(definition(), imported, Map.of("memo", values));
      values.add(99);
      equal(List.of(new BigDecimal("1.2300")), map(changed.get("data")).get("memo"));
      Map<String, Object> transitioned = Entities.transition(definition(), changed, "DONE");
      equal("DONE", transitioned.get("state"));
      equal(changed.get("data"), transitioned.get("data"));
      equal("DRAFT", changed.get("state"));
    });
  }

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> map) {
      Map<String, Object> result = new LinkedHashMap<>();
      map.forEach((key, item) -> result.put((String) key, copy(item)));
      return result;
    }
    if (value instanceof List<?> list) {
      List<Object> result = new ArrayList<>();
      for (Object item : list) result.add(copy(item));
      return result;
    }
    return value;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  private static void equal(Object expected, Object actual) {
    if (!Objects.equals(expected, actual)) throw new AssertionError("Observation differs");
  }
  private static void valid(Runnable call) {
    try { call.run(); } catch (FinKoreException failure) { throw new AssertionError("Valid data rejected: " + failure.code(), failure); }
  }
  private static void error(String code, Runnable call) {
    try { call.run(); } catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code);
  }
}
