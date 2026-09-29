// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import org.junit.jupiter.api.Test;

final class NativeOwnershipCoverageTest {
  @Test void nativeRetention() throws Exception { NativeOwnershipTest.main(new String[0]); }
}
