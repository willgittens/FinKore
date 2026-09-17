// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Test-only JSON parser for portable conformance vectors. */
final class Json {
  private Json() {}

  static Object parse(String text) {
    Parser parser = new Parser(text);
    Object value = parser.value();
    parser.skipWhitespace();
    if (!parser.end()) {
      throw new IllegalArgumentException("Trailing JSON input");
    }
    return value;
  }

  private static final class Parser {
    private final String text;
    private int index;

    Parser(String text) {
      this.text = text;
    }

    boolean end() {
      return index == text.length();
    }

    void skipWhitespace() {
      while (!end() && Character.isWhitespace(text.charAt(index))) {
        index += 1;
      }
    }

    Object value() {
      skipWhitespace();
      if (end()) {
        throw new IllegalArgumentException("Expected JSON value");
      }
      return switch (text.charAt(index)) {
        case '{' -> object();
        case '[' -> array();
        case '"' -> string();
        case 't' -> literal("true", Boolean.TRUE);
        case 'f' -> literal("false", Boolean.FALSE);
        case 'n' -> literal("null", null);
        default -> number();
      };
    }

    private Map<String, Object> object() {
      index += 1;
      Map<String, Object> result = new LinkedHashMap<>();
      skipWhitespace();
      if (consume('}')) {
        return result;
      }
      while (true) {
        skipWhitespace();
        String key = string();
        skipWhitespace();
        expect(':');
        result.put(key, value());
        skipWhitespace();
        if (consume('}')) {
          return result;
        }
        expect(',');
      }
    }

    private List<Object> array() {
      index += 1;
      List<Object> result = new ArrayList<>();
      skipWhitespace();
      if (consume(']')) {
        return result;
      }
      while (true) {
        result.add(value());
        skipWhitespace();
        if (consume(']')) {
          return result;
        }
        expect(',');
      }
    }

    private String string() {
      expect('"');
      StringBuilder builder = new StringBuilder();
      while (!end()) {
        char c = text.charAt(index++);
        if (c == '"') {
          return builder.toString();
        }
        if (c != '\\') {
          builder.append(c);
          continue;
        }
        if (end()) {
          throw new IllegalArgumentException("Unclosed escape");
        }
        char escaped = text.charAt(index++);
        switch (escaped) {
          case '"' -> builder.append('"');
          case '\\' -> builder.append('\\');
          case '/' -> builder.append('/');
          case 'b' -> builder.append('\b');
          case 'f' -> builder.append('\f');
          case 'n' -> builder.append('\n');
          case 'r' -> builder.append('\r');
          case 't' -> builder.append('\t');
          case 'u' -> {
            if (index + 4 > text.length()) {
              throw new IllegalArgumentException("Short unicode escape");
            }
            builder.append((char) Integer.parseInt(text.substring(index, index + 4), 16));
            index += 4;
          }
          default -> throw new IllegalArgumentException("Invalid escape");
        }
      }
      throw new IllegalArgumentException("Unclosed string");
    }

    private Object number() {
      int start = index;
      if (peek('-')) {
        index += 1;
      }
      digits();
      boolean decimal = false;
      if (peek('.')) {
        decimal = true;
        index += 1;
        digits();
      }
      if (peek('e') || peek('E')) {
        decimal = true;
        index += 1;
        if (peek('+') || peek('-')) {
          index += 1;
        }
        digits();
      }
      String number = text.substring(start, index);
      return decimal ? new BigDecimal(number) : new BigInteger(number);
    }

    private void digits() {
      if (end() || !Character.isDigit(text.charAt(index))) {
        throw new IllegalArgumentException("Expected digit");
      }
      while (!end() && Character.isDigit(text.charAt(index))) {
        index += 1;
      }
    }

    private Object literal(String literal, Object value) {
      if (!text.startsWith(literal, index)) {
        throw new IllegalArgumentException("Invalid literal");
      }
      index += literal.length();
      return value;
    }

    private boolean consume(char expected) {
      if (peek(expected)) {
        index += 1;
        return true;
      }
      return false;
    }

    private void expect(char expected) {
      if (!consume(expected)) {
        throw new IllegalArgumentException("Expected " + expected);
      }
    }

    private boolean peek(char expected) {
      return !end() && text.charAt(index) == expected;
    }
  }
}
