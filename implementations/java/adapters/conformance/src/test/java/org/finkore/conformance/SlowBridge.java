// SPDX-License-Identifier: MPL-2.0
package org.finkore.conformance;

/** Test bridge that exceeds adapter timeout. */
public final class SlowBridge {
  private SlowBridge() {}

  /** Sleeps until the adapter timeout interrupts the process. */
  public static void main(String[] args) throws InterruptedException {
    Thread.sleep(2_000L);
  }
}
