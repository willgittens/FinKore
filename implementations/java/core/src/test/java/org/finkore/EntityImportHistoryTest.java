// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** ENTITY-IMPORT-012 output shape, preservation, reuse and failure observations. */
public final class EntityImportHistoryTest {
  private EntityImportHistoryTest() {}

  /** Supplies direct core regression cases to unit, coverage and mutation tests. */
  public static Map<String, Runnable> cases() throws IOException {
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    List<?> vectors = (List<?>) map(Json.parse(Files.readString(root.resolve("conformance/entities/import-history.json")))).get("vectors");
    Map<String, Runnable> cases = new LinkedHashMap<>();
    cases.put("entity.import.history097.empty", () -> {
      for (Object item : vectors) {
        Map<String, Object> vector = map(item);
        if (map(vector.get("expected")).get("status").equals("success") && !vector.get("id").toString().endsWith(".nonempty")) success(vector);
      }
    });
    cases.put("entity.import.history097.nonempty", () -> {
      for (Object item : vectors) if (map(item).get("id").toString().endsWith(".nonempty")) success(map(item));
    });
    cases.put("entity.import.history097.failure", () -> {
      for (Object item : vectors) {
        Map<String, Object> vector = map(item);
        Map<String, Object> expected = map(vector.get("expected"));
        if (!expected.get("status").equals("error")) continue;
        Map<String, Object> input = map(copy(vector.get("input")));
        Object before = copy(input);
        try {
          Entities.importEntity(input.get("definition"), input.get("import"));
          throw new AssertionError("Invalid import accepted");
        } catch (FinKoreException error) {
          equal(map(expected.get("error")).get("code"), error.code());
        }
        equal(before, input);
      }
    });
    return cases;
  }

  private static void success(Map<String, Object> vector) {
    Map<String, Object> input = map(copy(vector.get("input")));
    Object before = copy(input);
    Object expected = map(vector.get("expected")).get("value");
    try {
      Map<String, Object> result = Entities.importEntity(input.get("definition"), input.get("import"));
      equal(expected, result);
      equal(result, Entities.importEntity(input.get("definition"), result));
      equal(before, input);
      list(result.get("historicalRevisions")).add(Map.of("revision", "caller-write"));
      equal(before, input);
      equal(expected, Entities.importEntity(input.get("definition"), input.get("import")));
    } catch (FinKoreException error) {
      throw new AssertionError("Valid import rejected: " + error.code(), error);
    }
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked")
  private static List<Object> list(Object value) { return (List<Object>) value; }
  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> values) {
      Map<String, Object> result = new LinkedHashMap<>();
      values.forEach((key, item) -> result.put((String) key, copy(item)));
      return result;
    }
    if (value instanceof List<?> values) {
      List<Object> result = new java.util.ArrayList<>();
      values.forEach(item -> result.add(copy(item)));
      return result;
    }
    return value;
  }
  private static void equal(Object expected, Object actual) {
    if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + " but got " + actual);
  }
}
