// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.finkore.examples.composition.draft_0_7.CompositionProfiles;

public final class CompositionDraft07Test {
  private static final Pattern SCENARIO = Pattern.compile(
      "\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\"[\\s\\S]*?\"expectedObservation\"\\s*:\\s*\\{([\\s\\S]*?)\\}\\s*,\\s*\"implementationStatus\"");
  private static final Pattern FIELD = Pattern.compile("\"([^\"]+)\"\\s*:\\s*(\"[^\"]*\"|true|false)");

  public static void main(String[] args) throws Exception {
    String fixture = Files.readString(Path.of("examples/composition/draft-0.7/scenarios.json"));
    Matcher scenarios = SCENARIO.matcher(fixture);
    int executed = 0;
    while (scenarios.find()) {
      String scenarioId = scenarios.group(1);
      Map<String, Object> actual = CompositionProfiles.runScenario(scenarioId);
      Matcher fields = FIELD.matcher(scenarios.group(2));
      while (fields.find()) {
        Object expected = "true".equals(fields.group(2)) || "false".equals(fields.group(2))
            ? Boolean.valueOf(fields.group(2))
            : fields.group(2).substring(1, fields.group(2).length() - 1);
        assertEquals(expected, actual.get(fields.group(1)), scenarioId + " " + fields.group(1));
      }
      executed += 1;
    }
    assertEquals(20, executed, "scenario count");
  }

  private static void assertEquals(Object expected, Object actual, String label) {
    if (!expected.equals(actual)) {
      throw new AssertionError(label + ": expected " + expected + " but got " + actual);
    }
  }
}
