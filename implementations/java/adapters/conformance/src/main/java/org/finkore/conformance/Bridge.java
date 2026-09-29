// SPDX-License-Identifier: MPL-2.0
package org.finkore.conformance;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.finkore.Approvals;
import org.finkore.Audit;
import org.finkore.Entities;
import org.finkore.FinKoreException;
import org.finkore.Money;
import org.finkore.Workflow;

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
      "finkore.money.allocate",
      "workflow.create",
      "workflow.import",
      "finkore.workflow.transition",
      "finkore.audit.append",
      "finkore.audit.replace",
      "finkore.audit.remove",
      "audit.redact",
      "approval.requirement.evaluate",
      "approval.decision.record",
      "approval.decision.evaluate",
      "approval.condition.evaluate",
      "approval.chain.evaluate",
      "approval.decision.withdraw",
      "approval.decision.supersede",
      "approval.requirement.supersede",
      "approval.composition.evaluate",
      "finkore.entity.create",
      "finkore.entity.mutate",
      "finkore.entity.transition",
      "finkore.entity.evolution.correct",
      "finkore.entity.evolution.reverse",
      "finkore.entity.evolution.supersede",
      "finkore.entity.evolution.void",
      "entity.import");

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
        case "workflow.create" -> success(Workflow.create(workflowDefinition(inputValue)).toPortable(), null);
        case "workflow.import" -> {
          Workflow.Definition definition = workflowDefinition(inputValue);
          Workflow.Instance instance = workflowInstance(inputValue);
          yield success(Workflow.importInstance(definition, instance).toPortable(), null);
        }
        case "finkore.workflow.transition" -> {
          Workflow.Definition definition = workflowDefinition(inputValue);
          Workflow.Instance instance = workflowInstance(inputValue);
          Workflow.Instance result = Workflow.transition(
              definition,
              instance,
              inputValue.get("target"),
              inputValue.get("facts"),
              inputValue.getOrDefault("expectedCurrentState", Workflow.OMITTED),
              inputValue.getOrDefault("expectedRevision", Workflow.OMITTED));
          yield success(result.toPortable(), null);
        }
        case "finkore.audit.append" -> {
          Audit.Log log = auditLog(inputValue);
          yield success(log.append(inputValue.get("event")).toPortable(), null);
        }
        case "finkore.audit.replace" -> {
          Audit.Log log = auditLog(inputValue);
          log.replace();
          yield success(log.toPortable(), null);
        }
        case "finkore.audit.remove" -> {
          Audit.Log log = auditLog(inputValue);
          log.remove();
          yield success(log.toPortable(), null);
        }
        case "audit.redact" -> {
          Audit.Log log = auditLog(inputValue);
          Audit.RedactionResult result = log.redact(inputValue.get("policy"), inputValue.get("redactionEvent"));
          yield success(result.toPortable(), Map.of("history", log.events()));
        }
        case "approval.requirement.evaluate" -> success(Approvals.evaluateRequirement(
            inputValue.get("requirement"),
            inputValue.get("decisions"),
            inputValue.getOrDefault("currentSubjectFacts", Approvals.OMITTED),
            inputValue.getOrDefault("relevantFactPaths", Approvals.OMITTED),
            inputValue.get("evaluatedAt")),
            Boolean.TRUE.equals(inputValue.get("observeHistory"))
                ? Map.of("history", inputValue.get("decisions")) : null);
        case "approval.decision.record" -> success(Approvals.recordDecision(
            inputValue.get("requirement"),
            inputValue.get("decision"),
            inputValue.get("history")), null);
        case "approval.decision.evaluate" -> success(Approvals.evaluateDecision(
            inputValue.get("requirement"),
            inputValue.get("decision"),
            inputValue.getOrDefault("currentSubjectFacts", Approvals.OMITTED),
            inputValue.getOrDefault("relevantFactPaths", Approvals.OMITTED),
            inputValue.get("evaluatedAt")), null);
        case "approval.condition.evaluate" -> success(Approvals.evaluateCondition(
            inputValue.get("condition"),
            inputValue.getOrDefault("facts", Approvals.OMITTED),
            inputValue.get("result")), null);
        case "approval.chain.evaluate" -> success(Approvals.evaluateChain(
            inputValue.get("chain"),
            inputValue.get("states")), null);
        case "approval.decision.withdraw" -> success(Approvals.withdrawDecision(
            inputValue.get("requirement"),
            inputValue.get("history"),
            inputValue.get("withdrawal")), null);
        case "approval.decision.supersede" -> success(Approvals.supersedeDecision(
            inputValue.get("history"),
            inputValue.get("supersession")), null);
        case "approval.requirement.supersede" -> success(Approvals.supersedeRequirement(
            inputValue.get("history"),
            inputValue.get("supersession")), null);
        case "approval.composition.evaluate" -> success(
            Approvals.evaluateComposition(
                inputValue.get("composition"),
                inputValue.get("requirements"),
                inputValue.getOrDefault("decisions", List.of()),
                inputValue.get("context")),
            compositionSuccessObservations(inputValue));
        case "finkore.entity.create" -> success(Entities.create(
            inputValue.get("definition"),
            inputValue.get("id"),
            inputValue.get("data")), null);
        case "finkore.entity.mutate" -> {
          Map<String, Object> result = Entities.mutate(
              inputValue.get("definition"),
              inputValue.get("entity"),
              inputValue.get("changes"));
          yield success(result, Map.of("identity", result.get("id"), "state", result.get("state")));
        }
        case "finkore.entity.transition" -> {
          Map<String, Object> result = Entities.transition(
              inputValue.get("definition"),
              inputValue.get("entity"),
              inputValue.get("target"));
          yield success(result, Map.of("identity", result.get("id")));
        }
        case "entity.import" -> success(Entities.importEntity(
            inputValue.get("definition"),
            inputValue.get("import")), null);
        case "finkore.entity.evolution.correct" -> executeEntityEvolution("CORRECTION", inputValue);
        case "finkore.entity.evolution.reverse" -> executeEntityEvolution("REVERSAL", inputValue);
        case "finkore.entity.evolution.supersede" -> executeEntityEvolution("SUPERSESSION", inputValue);
        case "finkore.entity.evolution.void" -> executeEntityEvolution("VOID", inputValue);
        default -> Map.of("status", "unsupported");
      };
    } catch (FinKoreException error) {
      return error(error.code(), observationsFor(operation, inputValue, error.code()));
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

  private static Workflow.Definition workflowDefinition(Map<String, Object> input) {
    return Workflow.Definition.fromPortable(input.get("definition"));
  }

  private static Workflow.Instance workflowInstance(Map<String, Object> input) {
    return Workflow.Instance.fromPortable(input.get("instance"));
  }

  private static Audit.Log auditLog(Map<String, Object> input) {
    return Audit.Log.create(input.get("history"));
  }

  private static Map<String, Object> observationsFor(String operation, Map<String, Object> input, String code) {
    try {
      if (List.of("finkore.money.add", "finkore.money.subtract", "finkore.money.compare").contains(operation)) {
        return pair(input).observations;
      }
      if (operation.startsWith("finkore.money.")) {
        return operand(input).observations;
      }
      if ("finkore.workflow.transition".equals(operation)) {
        return Workflow.INVALID_INSTANCE.equals(code) ? null : workflowErrorObservations(input);
      }
      if (List.of("finkore.audit.append", "finkore.audit.replace", "finkore.audit.remove", "audit.redact").contains(operation)) {
        return Map.of("history", auditLog(input).events());
      }
      if (List.of(
              "approval.decision.record",
              "approval.decision.withdraw",
              "approval.decision.supersede",
              "approval.requirement.supersede")
          .contains(operation)) {
        Map<String, Object> observed = approvalHistoryObservation(input.getOrDefault("history", List.of()));
        return "approval.decision.record".equals(operation) ? Map.of("history", observed.get("history")) : observed;
      }
      if ("approval.composition.evaluate".equals(operation) && input.containsKey("decisions")) {
        Map<String, Object> observations = new LinkedHashMap<>();
        observations.put("decisions", input.get("decisions"));
        return observations;
      }
      if ("finkore.entity.mutate".equals(operation)) {
        Map<String, Object> observations = entityObservation(input.get("entity"));
        if (observations != null) {
          List<Map<String, Object>> findings = Entities.validationFindingsForMutation(
              input.get("definition"),
              input.get("entity"),
              input.get("changes"));
          if (!findings.isEmpty()) {
            observations.put("findings", findings);
          }
        }
        return observations;
      }
      if ("finkore.entity.transition".equals(operation)) {
        Object definition = input.get("definition");
        Workflow.Definition.fromPortable(definition instanceof Map<?, ?> map ? map.get("workflow") : null);
        return entityObservation(input.get("entity"));
      }
      if ("entity.import".equals(operation)) {
        Object imported = input.get("import");
        if (imported instanceof Map<?, ?> map) {
          return entityObservation(map.get("entity"));
        }
      }
      if (operation.startsWith("finkore.entity.evolution.")) {
        return evolutionObservation(input, true);
      }
    } catch (FinKoreException ignored) {
      return null;
    }
    return null;
  }

  private static Map<String, Object> entityObservation(Object entity) {
    if (entity instanceof Map<?, ?>) {
      Map<String, Object> observations = new LinkedHashMap<>();
      observations.put("entity", entity);
      return observations;
    }
    return null;
  }

  private static Map<String, Object> approvalHistoryObservation(Object history) {
    return Approvals.importHistory(history);
  }

  private static Map<String, Object> evolutionObservation(Map<String, Object> input, boolean includeSameIdentityRelated) {
    Map<String, Object> observations = new LinkedHashMap<>();
    observations.put("source", input.get("source"));
    if (input.containsKey("related")
        && input.get("related") instanceof Map<?, ?> related
        && input.get("source") instanceof Map<?, ?> source
        && (includeSameIdentityRelated || !related.get("id").equals(source.get("id")))) {
      observations.put("related", input.get("related"));
    }
    if (input.containsKey("successor")) {
      observations.put("related", input.get("successor"));
    }
    observations.put("evolutionHistory", evolutionHistoryObservation(input.get("evolutionHistory")));
    observations.put("auditHistory", auditHistoryObservation(input.get("auditHistory")));
    return observations;
  }

  private static Map<String, Object> evolutionHistoryObservation(Object history) {
    Map<String, Object> result = new LinkedHashMap<>();
    if (history instanceof Map<?, ?> map && map.get("relations") instanceof List<?> relations) {
      result.put("relations", relations);
    } else if (history instanceof List<?> relations) {
      result.put("relations", relations);
    } else {
      result.put("relations", List.of());
    }
    return result;
  }

  private static Map<String, Object> auditHistoryObservation(Object history) {
    Map<String, Object> result = new LinkedHashMap<>();
    if (history instanceof Map<?, ?> map && map.get("history") instanceof List<?> events) {
      result.put("history", events);
    } else if (history instanceof List<?> events) {
      result.put("history", events);
    } else {
      result.put("history", List.of());
    }
    return result;
  }

  private static Map<String, Object> compositionSuccessObservations(Map<String, Object> input) {
    Object decisions = input.get("decisions");
    if (decisions instanceof List<?> list && list.isEmpty()) {
      return Map.of("decisions", decisions);
    }
    return null;
  }

  private static Map<String, Object> workflowErrorObservations(Map<String, Object> input) {
    Workflow.Instance instance = workflowInstance(input);
    Workflow.Definition definition = workflowDefinition(input);
    if (!definition.states().contains(instance.currentState())) {
      return null;
    }
    Map<String, Object> observations = instance.toPortable();
    Object facts = input.get("facts");
    if (facts instanceof Map<?, ?> factsMap && !factsMap.isEmpty()) {
      observations.put("facts", facts);
    }
    return observations;
  }

  private static Map<String, Object> executeEntityEvolution(String kind, Map<String, Object> input) {
    Map<String, Object> observations = new LinkedHashMap<>();
    observations.put("auditHistory", evolutionObservation(input, true).get("auditHistory"));
    Map<String, Object> request = new LinkedHashMap<>(input);
    Object history = input.get("evolutionHistory");
    request.put("evolutionHistory", history instanceof List<?> ? Map.of("relations", history) : history);
    try {
      observations.put("evolutionHistory", Entities.importEvolutionHistory(request.get("evolutionHistory")));
      Map<String, Object> imported = new LinkedHashMap<>(); imported.put("entity", input.get("source"));
      observations.put("source", Entities.importEntity(input.get("definition"), imported).get("entity"));
      if (!"VOID".equals(kind)) {
        imported.put("entity", input.get("SUPERSESSION".equals(kind) ? "successor" : "related"));
        observations.put("related", Entities.importEntity(input.get("definition"), imported).get("entity"));
      }
      return success(Entities.evolve(kind, input.get("definition"), request), evolutionObservation(input, !"CORRECTION".equals(kind)));
    } catch (FinKoreException failure) {
      return error(failure.code(), observations);
    }
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
