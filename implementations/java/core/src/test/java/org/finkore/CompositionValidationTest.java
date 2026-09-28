// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Executes every composition vector at the native boundary and checks input ownership. */
public final class CompositionValidationTest {
  private CompositionValidationTest() {}

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> map) {
      Map<Object, Object> result = new java.util.LinkedHashMap<>();
      map.forEach((key, item) -> result.put(key, copy(item)));
      return result;
    }
    if (value instanceof List<?> list) return list.stream().map(CompositionValidationTest::copy).toList();
    return value;
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
          if (!"approval.composition.evaluate".equals(vector.get("operation"))) continue;
          Map<?, ?> input = (Map<?, ?>) vector.get("input");
          Object before = copy(input);
          Map<?, ?> expected = (Map<?, ?>) vector.get("expected");
          try {
            Object result = (input.containsKey("decisions") ? Approvals.evaluateComposition(input.get("composition"), input.get("requirements"), input.get("decisions"), input.get("context")) : Approvals.evaluateComposition(input.get("composition"), input.get("requirements"), input.get("context")));
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
    if (executed == 0) throw new AssertionError("No composition vectors discovered");
    System.out.println("Composition native vectors passed: " + executed);
  }
}
