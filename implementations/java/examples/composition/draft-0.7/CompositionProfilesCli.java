// SPDX-License-Identifier: MPL-2.0
package org.finkore.examples.composition.draft_0_7;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Emits Draft 0.7 Java reference composition results as deterministic JSON.
 */
public final class CompositionProfilesCli {
  private static final Pattern SCENARIO_ID = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");

  private CompositionProfilesCli() {}

  /**
   * Runs every shared Draft 0.7 scenario and writes the actual Java results.
   *
   * @param args ignored
   * @throws Exception when the shared fixture cannot be read
   */
  public static void main(String[] args) throws Exception {
    String fixture = Files.readString(Path.of("examples/composition/draft-0.7/scenarios.json"));
    Matcher matcher = SCENARIO_ID.matcher(fixture);
    StringBuilder output = new StringBuilder();
    output.append("{\"language\":\"java\",\"results\":[");
    boolean first = true;
    while (matcher.find()) {
      if (!first) {
        output.append(',');
      }
      output.append(toJson(CompositionProfiles.runScenario(matcher.group(1))));
      first = false;
    }
    output.append("]}\n");
    System.out.print(output);
  }

  private static String toJson(Object value) {
    if (value == null) {
      return "null";
    }
    if (value instanceof String text) {
      return "\"" + escape(text) + "\"";
    }
    if (value instanceof Boolean || value instanceof Number) {
      return value.toString();
    }
    if (value instanceof Map<?, ?> map) {
      StringBuilder result = new StringBuilder();
      result.append('{');
      boolean first = true;
      for (Map.Entry<?, ?> entry : map.entrySet()) {
        if (!first) {
          result.append(',');
        }
        result.append(toJson(entry.getKey().toString()));
        result.append(':');
        result.append(toJson(entry.getValue()));
        first = false;
      }
      result.append('}');
      return result.toString();
    }
    if (value instanceof List<?> list) {
      StringBuilder result = new StringBuilder();
      result.append('[');
      boolean first = true;
      for (Object item : list) {
        if (!first) {
          result.append(',');
        }
        result.append(toJson(item));
        first = false;
      }
      result.append(']');
      return result.toString();
    }
    throw new IllegalArgumentException("Unsupported JSON value: " + value.getClass().getName());
  }

  private static String escape(String value) {
    return value
        .replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\b", "\\b")
        .replace("\f", "\\f")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }
}
