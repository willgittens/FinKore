// SPDX-License-Identifier: MPL-2.0
package org.finkore;

/**
 * Base runtime exception carrying a language-neutral FinKore portable error code.
 *
 * <p>The Java class name is implementation-specific. Consumers that need
 * portable semantics should inspect {@link #code()}.
 */
public final class FinKoreException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  private final String code;

  /**
   * Creates a FinKore exception with one portable error code.
   *
   * @param code language-neutral FinKore portable error code
   */
  public FinKoreException(String code) {
    super(code);
    this.code = code;
  }

  /**
   * Returns the language-neutral FinKore portable error code.
   *
   * @return portable error code
   */
  public String code() {
    return code;
  }
}
