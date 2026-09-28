// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import org.junit.jupiter.api.Test;

/** Runs all native composition vectors under the coverage agent. */
final class CompositionValidationCoverageTest {
  @Test
  void compositionVectors() throws IOException {
    CompositionValidationTest.main(new String[0]);
  }
}
