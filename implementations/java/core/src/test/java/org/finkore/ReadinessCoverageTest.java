// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import org.junit.jupiter.api.Test;

/** Includes native sequence and ownership regressions in Maven coverage runs. */
final class ReadinessCoverageTest {
  @Test
  void evidenceAndReturnedValues() throws IOException {
    EvidenceRegressionTest.main(new String[0]);
  }

  @Test
  void sequencesAndOwnership() throws IOException {
    ReadinessRegressionTest.main(new String[0]);
  }

  @Test
  void serializationBindingAndNativeValues() throws IOException {
    BoundaryRegressionTest.main(new String[0]);
  }

  @Test
  void constructionEvidenceAndEvaluation() throws IOException {
    ConstructionEvaluationRegressionTest.main(new String[0]);
  }
}
