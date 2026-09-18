// SPDX-License-Identifier: MPL-2.0
package org.finkore.examples.composition.draft_0_7;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import org.finkore.Approvals;
import org.finkore.Audit;
import org.finkore.Entities;
import org.finkore.FinKoreException;
import org.finkore.Money;
import org.finkore.Workflow;

/**
 * Draft 0.7 reference composition profiles for Java.
 *
 * <p>These examples are non-normative application profiles. They orchestrate
 * existing Core APIs and return the shared Draft 0.7 fixture observation shape
 * without adding Core behavior, runner logic, or conformance operations.
 */
public final class CompositionProfiles {
  /** Profile-local approval gate failure code. */
  public static final String PROFILE_APPROVAL_NOT_CURRENT = "D07_PROFILE_APPROVAL_NOT_CURRENT";

  private CompositionProfiles() {}

  /**
   * Executes one shared Draft 0.7 scenario through Java Core APIs.
   *
   * @param scenarioId shared {@code D07-*} fixture identifier
   * @return portable reference-profile observation
   */
  public static Map<String, Object> runScenario(String scenarioId) {
    if (scenarioId.startsWith("D07-EXP-")) {
      return runExpenseScenario(scenarioId);
    }
    return runInvoiceScenario(scenarioId);
  }

  private static Map<String, Object> runExpenseScenario(String scenarioId) {
    switch (scenarioId) {
      case "D07-EXP-001" -> {
        Money total = Money.fromPortable(money("40.00", "USD")).add(Money.fromPortable(money("60.00", "USD")));
        List<Map<String, Object>> allocations = total.allocate(map("method", "RATIO", "ratios", List.of(1, 2)), 2).stream().map(Money::toPortable).toList();
        Map<String, Object> entity = Entities.transition(
            expenseDefinition(),
            Entities.create(expenseDefinition(), "exp-7", map("lines", List.of(), "total", total.toPortable(), "allocations", allocations)),
            "SUBMITTED");
        Audit.Log.create(List.of()).append(auditEvent("evt-exp-submit", "expense", (String) entity.get("id"), "EXPENSE_SUBMITTED"));
        return merge(success(scenarioId, "expense-approval"), map("entityState", entity.get("state"), "preservePriorApprovalHistory", true, "appendAuditEvent", true));
      }
      case "D07-EXP-002" -> {
        Map<String, Object> approval = evaluateApproval("APPROVED");
        Map<String, Object> entity = Entities.transition(expenseDefinition(), submittedExpense(), "APPROVED");
        Audit.Log.create(List.of()).append(auditEvent("evt-exp-approve", "expense", (String) entity.get("id"), "EXPENSE_APPROVED"));
        return merge(success(scenarioId, "expense-approval"), map("entityState", entity.get("state"), "noSyntheticDecisionForInapplicableRequirement", "APPROVED".equals(approval.get("outcome")), "appendAuditEvent", true));
      }
      case "D07-EXP-003" -> {
        evaluateApproval("PENDING");
        return profileGateFailure(scenarioId, "expense-approval", map("preserveEntity", true, "preservePriorApprovalHistory", true, "preservePriorAuditHistory", true));
      }
      case "D07-EXP-004" -> {
        evaluateApproval("REJECTED");
        return profileGateFailure(scenarioId, "expense-approval", map("preserveEntity", true, "preservePriorApprovalHistory", true));
      }
      case "D07-EXP-005" -> {
        Approvals.evaluateRequirement(
            map("id", "finance-review", "subject", map("type", "expense", "id", "exp-7"), "eligibleActors", List.of("controller-1")),
            List.of(map("requirementId", "finance-review", "subjectFacts", map("revision", "rev-1"), "outcome", "APPROVED", "actor", map("id", "controller-1"), "decidedAt", "2026-09-18T09:00:00Z")),
            map("revision", "rev-2"),
            List.of("revision"),
            null);
        return profileGateFailure(scenarioId, "expense-approval", map("preservePriorApprovalHistory", true));
      }
      case "D07-EXP-006" -> {
        Approvals.evaluateRequirement(
            map("id", "finance-review", "subject", map("type", "expense", "id", "exp-7"), "eligibleActors", List.of("controller-1")),
            List.of(map("requirementId", "finance-review", "subjectFacts", map("revision", "rev-1"), "outcome", "APPROVED", "actor", map("id", "controller-1"), "decidedAt", "2026-09-18T09:00:00Z", "expiresAt", "2026-09-18T11:00:00Z")),
            map("revision", "rev-1"),
            List.of("revision"),
            "2026-09-18T12:00:00Z");
        return profileGateFailure(scenarioId, "expense-approval", map("evaluationInstant", "2026-09-18T12:00:00Z"));
      }
      case "D07-EXP-007" -> {
        Map<String, Object> entity = Entities.create(expenseDefinition(), "exp-7", map("lines", List.of(), "total", money("100.00", "USD"), "allocations", List.of()));
        try {
          Money.fromPortable(money("1.00", "USD")).add(Money.fromPortable(money("1.00", "EUR")));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "expense-approval", error), map("preserveEntity", "DRAFT".equals(entity.get("state")), "preservePriorAuditHistory", true));
        }
      }
      case "D07-EXP-008" -> {
        Money source = Money.fromPortable(money("100.00", "USD"));
        try {
          source.allocate(map("method", "RATIO", "ratios", List.of(1, 0)), 2);
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "expense-approval", error), map("preserveEntity", true, "preserveSourceMoney", "100.00".equals(source.toPortable().get("amount"))));
        }
      }
      case "D07-EXP-009" -> {
        Workflow.Definition definition = Workflow.Definition.fromPortable(versionedExpenseWorkflow());
        Workflow.Instance instance = new Workflow.Instance("SUBMITTED", definition.binding(), "wf-rev-1");
        try {
          Workflow.transition(definition, instance, "APPROVED", null, "DRAFT", null);
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "expense-approval", error), map("preserveEntity", true, "preservePriorApprovalHistory", true, "preservePriorAuditHistory", true));
        }
      }
      case "D07-EXP-010" -> {
        Map<String, Object> entity = submittedExpense();
        List<Map<String, Object>> prior = List.of(auditEvent("evt-exp-approve", "expense", (String) entity.get("id"), "EXPENSE_APPROVED"));
        try {
          Entities.transition(expenseDefinition(), entity, "APPROVED");
          Audit.Log.create(prior).append(auditEvent("evt-exp-approve", "expense", (String) entity.get("id"), "EXPENSE_APPROVED"));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "expense-approval", error), map("preserveEntity", true, "preservePriorApprovalHistory", true, "preservePriorAuditHistory", true));
        }
      }
      default -> throw new IllegalArgumentException("Unknown Draft 0.7 expense scenario: " + scenarioId);
    }
    throw new IllegalStateException("Scenario did not return: " + scenarioId);
  }

  private static Map<String, Object> runInvoiceScenario(String scenarioId) {
    switch (scenarioId) {
      case "D07-INV-001", "D07-INV-002" -> {
        evaluateApproval("APPROVED");
        Map<String, Object> result = correctInvoice(Map.of());
        Map<String, Object> observation = merge(success(scenarioId, "invoice-correction"), map(
            "preserveSourceFacts", "100.00".equals(sourceAmount(result)),
            "appendCorrectionRelation", "CORRECTION".equals(((Map<?, ?>) result.get("relation")).get("kind")),
            "appendAuditEvent", ((List<?>) ((Map<?, ?>) result.get("auditHistory")).get("history")).size() == 2));
        if ("D07-INV-002".equals(scenarioId)) {
          observation.put("preservePriorAuditHistory", true);
        }
        return observation;
      }
      case "D07-INV-003" -> {
        try {
          correctInvoice(map("eligible", false));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "invoice-correction", error), map("preserveSourceFacts", true, "preservePriorAuditHistory", true));
        }
      }
      case "D07-INV-004" -> {
        try {
          correctInvoice(map("evolutionRelations", List.of(correctInvoice(Map.of()).get("relation"))));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "invoice-correction", error), map("preserveSourceFacts", true, "preserveExistingRelations", true));
        }
      }
      case "D07-INV-005" -> {
        try {
          correctInvoice(map("expectedSourceRevision", "rev-stale"));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "invoice-correction", error), map("preserveSourceFacts", true, "preserveExistingRelations", true));
        }
      }
      case "D07-INV-006" -> {
        evaluateApproval("PENDING");
        return profileGateFailure(scenarioId, "invoice-correction", map("preserveSourceFacts", true, "preservePriorApprovalHistory", true));
      }
      case "D07-INV-007" -> {
        return profileGateFailure(scenarioId, "invoice-correction", map("preservePriorApprovalHistory", true));
      }
      case "D07-INV-008" -> {
        try {
          correctInvoice(map("event", correctionEvent("evt-inv-correction", "rel-inv-correction", "evt-missing")));
        } catch (FinKoreException error) {
          return merge(coreError(scenarioId, "invoice-correction", error), map("preserveSourceFacts", true, "preserveExistingRelations", true, "preservePriorAuditHistory", true));
        }
      }
      case "D07-INV-009" -> {
        Map<String, Object> noObligation = evaluateApproval("NOT_APPLICABLE");
        Map<String, Object> result = correctInvoice(Map.of());
        return merge(success(scenarioId, "invoice-correction"), map(
            "noSyntheticDecisionForInapplicableRequirement", "APPROVED".equals(noObligation.get("outcome")),
            "appendCorrectionRelation", "CORRECTION".equals(((Map<?, ?>) result.get("relation")).get("kind"))));
      }
      case "D07-INV-010" -> {
        correctInvoice(Map.of());
        return merge(success(scenarioId, "invoice-correction"), map("noSyntheticReversal", true, "noSyntheticPosting", true, "noSyntheticPaymentEffect", true));
      }
      default -> throw new IllegalArgumentException("Unknown Draft 0.7 invoice scenario: " + scenarioId);
    }
    throw new IllegalStateException("Scenario did not return: " + scenarioId);
  }

  private static Map<String, Object> success(String scenarioId, String profile) {
    return map("scenarioId", scenarioId, "profile", profile, "status", "success", "implementationStatus", "implemented");
  }

  private static Map<String, Object> coreError(String scenarioId, String profile, FinKoreException error) {
    return map("scenarioId", scenarioId, "profile", profile, "status", "error", "code", error.code(), "implementationStatus", "implemented");
  }

  private static Map<String, Object> profileGateFailure(String scenarioId, String profile, Map<String, Object> extra) {
    return merge(map("scenarioId", scenarioId, "profile", profile, "status", "profile-error", "code", PROFILE_APPROVAL_NOT_CURRENT, "implementationStatus", "implemented"), extra);
  }

  private static Map<String, Object> evaluateApproval(String state) {
    Map<String, Object> requirement = map("id", "finance-review", "applicability", "NOT_APPLICABLE".equals(state) ? "NOT_APPLICABLE" : "APPLICABLE");
    if (!"NOT_APPLICABLE".equals(state)) {
      requirement.put("state", state);
    }
    return Approvals.evaluateComposition(
        map("rootGroup", "finance", "groups", List.of(map("id", "finance", "kind", "ALL_OF", "members", List.of(map("type", "requirement", "id", "member-finance", "requirementId", "finance-review"))))),
        List.of(requirement),
        List.of(),
        map("evaluatedAt", "2026-09-18T10:00:00Z"));
  }

  private static Map<String, Object> submittedExpense() {
    return Entities.transition(
        expenseDefinition(),
        Entities.create(expenseDefinition(), "exp-7", map("lines", List.of(map("amount", money("40.00", "USD")), map("amount", money("60.00", "USD"))), "total", money("100.00", "USD"), "allocations", List.of())),
        "SUBMITTED");
  }

  private static Map<String, Object> correctInvoice(Map<String, Object> overrides) {
    return Entities.evolve("CORRECTION", invoiceDefinition(), map(
        "source", invoice("inv-7", "100.00"),
        "sourceRevision", "rev-1",
        "related", invoice("inv-7", "99.00"),
        "relatedRevision", "rev-2",
        "relationId", valueOr(overrides, "relationId", "rel-inv-correction"),
        "eligible", valueOr(overrides, "eligible", true),
        "expectedSourceState", "ISSUED",
        "expectedSourceRevision", valueOr(overrides, "expectedSourceRevision", "rev-1"),
        "expectedSourceCurrent", true,
        "evolutionHistory", map("relations", valueOr(overrides, "evolutionRelations", List.of())),
        "auditHistory", valueOr(overrides, "history", List.of(invoiceIssuedEvent())),
        "auditEvent", valueOr(overrides, "event", correctionEvent("evt-inv-correction", "rel-inv-correction", "evt-inv-issued"))));
  }

  private static Object valueOr(Map<String, Object> map, String key, Object fallback) {
    return map.containsKey(key) ? map.get(key) : fallback;
  }

  private static String sourceAmount(Map<String, Object> result) {
    Map<?, ?> source = (Map<?, ?>) result.get("source");
    Map<?, ?> data = (Map<?, ?>) source.get("data");
    Map<?, ?> amount = (Map<?, ?>) data.get("amount");
    return (String) amount.get("amount");
  }

  private static Map<String, Object> invoice(String id, String amount) {
    return Entities.create(invoiceDefinition(), id, map("amount", money(amount, "USD"), "memo", "invoice-" + id));
  }

  private static Map<String, Object> invoiceIssuedEvent() {
    return map("eventId", "evt-inv-issued", "eventType", "INVOICE_ISSUED", "entity", map("type", "invoice", "id", "inv-7"), "occurredAt", "2026-09-18T09:00:00Z", "changes", List.of(map("path", "amount", "after", money("100.00", "USD"))));
  }

  private static Map<String, Object> correctionEvent(String eventId, String relationId, String targetEventId) {
    return map(
        "eventId", eventId,
        "eventType", "ENTITY_EVOLUTION_RECORDED",
        "entity", map("type", "invoice", "id", "inv-7"),
        "occurredAt", "2026-09-18T10:00:00Z",
        "metadata", map("entityEvolution", map(
            "kind", "CORRECTION",
            "relationId", relationId,
            "source", map("type", "invoice", "id", "inv-7", "revision", "rev-1"),
            "related", map("type", "invoice", "id", "inv-7", "revision", "rev-2"))),
        "relationships", List.of(map("relationshipId", "audit-" + relationId, "type", "CORRECTS", "target", map("eventId", targetEventId, "entity", map("type", "invoice", "id", "inv-7")))));
  }

  private static Map<String, Object> auditEvent(String eventId, String entityType, String entityId, String eventType) {
    return map("eventId", eventId, "eventType", eventType, "entity", map("type", entityType, "id", entityId), "occurredAt", "2026-09-18T10:00:00Z", "changes", List.of(map("path", "state", "after", eventType)));
  }

  private static Map<String, Object> expenseDefinition() {
    return map("type", "expense", "identityScope", "draft-0.7-reference", "workflow", expenseWorkflow(), "mutability", map("DRAFT", List.of("lines", "total", "allocations"), "SUBMITTED", List.of(), "APPROVED", List.of()));
  }

  private static Map<String, Object> expenseWorkflow() {
    return map(
        "states", List.of("DRAFT", "SUBMITTED", "APPROVED"),
        "initialState", "DRAFT",
        "terminalStates", List.of("APPROVED"),
        "transitions", List.of(map("source", "DRAFT", "target", "SUBMITTED"), map("source", "SUBMITTED", "target", "APPROVED")));
  }

  private static Map<String, Object> versionedExpenseWorkflow() {
    return merge(expenseWorkflow(), map("definitionIdentity", "d07-expense-workflow", "definitionVersionIdentity", "v1"));
  }

  private static Map<String, Object> invoiceDefinition() {
    return map("type", "invoice", "identityScope", "draft-0.7-reference", "workflow", map("states", List.of("ISSUED"), "initialState", "ISSUED", "terminalStates", List.of(), "transitions", List.of()), "mutability", map("ISSUED", List.of()));
  }

  private static Map<String, Object> money(String amount, String currency) {
    return map("amount", amount, "currency", currency);
  }

  private static Map<String, Object> merge(Map<String, Object> left, Map<String, Object> right) {
    Map<String, Object> result = new LinkedHashMap<>(left);
    result.putAll(right);
    return result;
  }

  private static Map<String, Object> map(Object... values) {
    if (values.length % 2 != 0) {
      throw new IllegalArgumentException("Map helper requires key/value pairs");
    }
    Map<String, Object> result = new LinkedHashMap<>();
    for (int index = 0; index < values.length; index += 2) {
      result.put((String) values[index], values[index + 1]);
    }
    return result;
  }
}
