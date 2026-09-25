// SPDX-License-Identifier: MPL-2.0
// Runs existing native regressions, emitting classified test observations only.
// Does not modify repository files or define financial behavior.
package org.finkore;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Machine-readable entry point for isolated public-API mutation checks. */
public final class NativeMutationProbe {
  private NativeMutationProbe() {}

  /** Executes explicitly named test cases; unexpected exceptions are infrastructure failures. */
  public static void main(String[] args) throws Exception {
    Map<String, Runnable> cases = new java.util.LinkedHashMap<>(ReadinessRegressionTest.mutationCases());
    cases.putAll(BoundaryRegressionTest.cases());
    List<String> rows = new ArrayList<>();
    int passed = 0, failed = 0, infrastructure = 0;
    for (String id : args) {
      if (!id.matches("[a-zA-Z0-9_.-]+") || !cases.containsKey(id)) throw new IllegalArgumentException("Unknown case");
      String status = "PASS", kind = "";
      try { cases.get(id).run(); passed++; }
      catch (AssertionError error) { status = "FAIL"; kind = "ASSERTION"; failed++; }
      catch (FinKoreException error) { status = "FAIL"; kind = "PORTABLE_ERROR_MISMATCH"; failed++; }
      catch (RuntimeException error) { status = "INFRASTRUCTURE_ERROR"; kind = "UNEXPECTED_EXCEPTION"; infrastructure++; }
      catch (StackOverflowError error) { status = "INFRASTRUCTURE_ERROR"; kind = "UNEXPECTED_EXCEPTION"; infrastructure++; }
      rows.add("{\"caseId\":\"" + id + "\",\"status\":\"" + status + "\",\"failureKind\":\"" + kind + "\"}");
    }
    System.out.println("{\"summary\":{\"total\":" + args.length + ",\"passed\":" + passed
        + ",\"failed\":" + failed + ",\"unsupported\":0,\"infrastructureErrors\":" + infrastructure
        + "},\"results\":[" + String.join(",", rows) + "]}");
    System.exit(infrastructure > 0 ? 2 : failed > 0 ? 1 : 0);
  }
}
