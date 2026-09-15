// SPDX-License-Identifier: MPL-2.0
package org.finkore.conformance;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.finkore.FinKoreException;
import org.finkore.Money;

/** Subprocess bridge from conformance requests to the Java Money implementation. */
public final class Bridge {
  private static final List<String> OPERATIONS = List.of(
      "money.deserialize",
      "money.serialize",
      "finkore.money.add",
      "finkore.money.subtract",
      "finkore.money.negate",
      "finkore.money.multiply",
      "finkore.money.divide",
      "finkore.money.compare",
      "finkore.money.round",
      "finkore.money.applyrate",
      "finkore.money.allocate");

  private Bridge() {}

  /**
   * Runs the bridge command.
   *
   * @param args use {@code --operations} for support discovery
   */
  public static void main(String[] args) throws IOException {
    if (args.length == 1 && "--operations".equals(args[0])) {
      System.out.println(Json.stringify(OPERATIONS.stream().sorted().toList()));
      return;
    }
    String input = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
    @SuppressWarnings("unchecked")
    Map<String, Object> request = (Map<String, Object>) Json.parse(input);
    System.out.println(Json.stringify(execute(request)));
  }

  static Map<String, Object> execute(Map<String, Object> request) {
    Object operationId = request.get("operationId");
    Object input = request.get("input");
    if (!(operationId instanceof String operation) || !OPERATIONS.contains(operation)) {
      return Map.of("status", "unsupported");
    }
    if (!(input instanceof Map<?, ?> rawInput)) {
      return error(Money.INVALID_AMOUNT, null);
    }
    @SuppressWarnings("unchecked")
    Map<String, Object> inputValue = (Map<String, Object>) rawInput;
    try {
      return switch (operation) {
        case "money.deserialize", "money.serialize" -> success(money(inputValue.get("value")).toPortable(), null);
        case "finkore.money.add" -> {
          MoneyPair pair = pair(inputValue);
          yield success(pair.left.add(pair.right).toPortable(), pair.observations);
        }
        case "finkore.money.subtract" -> {
          MoneyPair pair = pair(inputValue);
          yield success(pair.left.subtract(pair.right).toPortable(), pair.observations);
        }
        case "finkore.money.negate" -> {
          MoneyOperand operand = operand(inputValue);
          yield success(operand.value.negate().toPortable(), operand.observations);
        }
        case "finkore.money.multiply" -> {
          MoneyOperand operand = operand(inputValue);
          yield success(operand.value.multiply(inputValue.get("scalar")).toPortable(), operand.observations);
        }
        case "finkore.money.divide" -> {
          MoneyOperand operand = operand(inputValue);
          yield success(operand.value.divide(inputValue.get("scalar")).toPortable(), operand.observations);
        }
        case "finkore.money.compare" -> {
          MoneyPair pair = pair(inputValue);
          yield success(pair.left.compare(pair.right), pair.observations);
        }
        case "finkore.money.round" -> {
          MoneyOperand operand = operand(inputValue);
          yield success(operand.value.round(inputValue.get("scale"), inputValue.get("mode")).toPortable(), operand.observations);
        }
        case "finkore.money.applyrate" -> {
          MoneyOperand operand = operand(inputValue);
          yield success(operand.value.applyRate(inputValue.get("rate"), inputValue.get("rounding")).toPortable(), operand.observations);
        }
        case "finkore.money.allocate" -> {
          MoneyOperand operand = operand(inputValue);
          List<Map<String, Object>> values = new ArrayList<>();
          for (Money part : operand.value.allocate(inputValue.get("allocation"), inputValue.get("scale"))) {
            values.add(part.toPortable());
          }
          yield success(values, operand.observations);
        }
        default -> Map.of("status", "unsupported");
      };
    } catch (FinKoreException error) {
      return error(error.code(), observationsFor(operation, inputValue));
    }
  }

  private static Money money(Object value) {
    return Money.fromPortable(value);
  }

  private static MoneyPair pair(Map<String, Object> input) {
    Money left = money(input.get("left"));
    Money right = money(input.get("right"));
    Map<String, Object> observations = new LinkedHashMap<>();
    observations.put("left", left.toPortable());
    observations.put("right", right.toPortable());
    return new MoneyPair(left, right, observations);
  }

  private static MoneyOperand operand(Map<String, Object> input) {
    Money value = money(input.get("value"));
    return new MoneyOperand(value, Map.of("operand", value.toPortable()));
  }

  private static Map<String, Object> observationsFor(String operation, Map<String, Object> input) {
    try {
      if (List.of("finkore.money.add", "finkore.money.subtract", "finkore.money.compare").contains(operation)) {
        return pair(input).observations;
      }
      if (operation.startsWith("finkore.money.")) {
        return operand(input).observations;
      }
    } catch (FinKoreException ignored) {
      return null;
    }
    return null;
  }

  private static Map<String, Object> success(Object value, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "success");
    result.put("value", value);
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private static Map<String, Object> error(String code, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "error");
    result.put("error", Map.of("code", code));
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private record MoneyPair(Money left, Money right, Map<String, Object> observations) {}

  private record MoneyOperand(Money value, Map<String, Object> observations) {}
}
