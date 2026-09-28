// SPDX-License-Identifier: MPL-2.0
package org.finkore;
import java.io.IOException;
import org.junit.jupiter.api.Test;
/** Includes native Approval vectors, numeric equality and result reuse in coverage. */
final class ApprovalContractsCoverageTest {
  @Test void approvalContracts() throws IOException { ApprovalContractsTest.main(new String[0]); }
}
