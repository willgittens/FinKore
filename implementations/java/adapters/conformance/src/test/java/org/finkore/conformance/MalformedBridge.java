// SPDX-License-Identifier: MPL-2.0
package org.finkore.conformance;

/** Test bridge that emits malformed JSON. */
public final class MalformedBridge {
  private MalformedBridge() {}

  /** Emits malformed output. */
  public static void main(String[] args) {
    System.out.println("not json");
  }
}
