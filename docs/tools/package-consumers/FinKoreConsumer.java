// SPDX-License-Identifier: MPL-2.0
// Exercises an installed JAR through public APIs in an isolated consumer.
// Creates only in-memory observations and defines no financial behavior.
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.finkore.FinKore;
import org.finkore.FinKoreException;
import org.finkore.Money;
import org.finkore.Entities;
import org.finkore.Audit;
import org.finkore.Approvals;
import org.finkore.Workflow;

public final class FinKoreConsumer {
  private static void equal(Object expected, Object actual) {
    if (!expected.equals(actual)) throw new AssertionError("Expected " + expected + ", got " + actual);
  }
  private static void error(String code, Runnable action) {
    try { action.run(); } catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code);
  }
  public static void main(String[] args) {
    equal("0.9-rc", FinKore.CORE_VERSION);
    Money money = Money.fromPortable(Map.of("amount", "1.239", "currency", "EUR"));
    error("FINKORE_MONEY_ROUNDING_REQUIRED", () -> money.toPortable(2));
    equal("1.2390", money.toPortable(4).get("amount"));
    equal("1.239", money.toPortable().get("amount"));
    Map<String, Object> binding = Map.of("definitionIdentity", "invoice-flow", "definitionVersionIdentity", "1");
    Map<String, Object> flow = new LinkedHashMap<>(binding);
    error(Workflow.INVALID_DEFINITION, () -> new Workflow.Definition(List.of("DRAFT", "DONE"), "GHOST", List.of("DONE"), List.of(), null, null));
    error(Workflow.INVALID_DEFINITION, () -> new Workflow.Definition(List.of("DRAFT", "DONE"), "DRAFT", List.of("DONE"), List.of(new Workflow.Transition("DONE", "DRAFT", List.of())), null, null));
    Workflow.Definition nativeDefinition = new Workflow.Definition(List.of("DRAFT", "DONE"), "DRAFT", List.of("DONE"), List.of(new Workflow.Transition("DRAFT", "DONE", List.of())), "native", "v1");
    Workflow.Instance nativeInstance = Workflow.importInstance(nativeDefinition, Workflow.create(nativeDefinition));
    equal(nativeInstance.binding(), Workflow.transition(nativeDefinition, nativeInstance, "DONE", Map.of()).binding());
    error(Workflow.INVALID_INSTANCE, () -> new Workflow.Instance("DRAFT", Map.of(), "r1"));
    Map<String, Object> malformed = new LinkedHashMap<>(Map.of("currentState", "DRAFT", "binding", Map.of("definitionIdentity", "native", "definitionVersionIdentity", "wrong")));
    malformed.put("revision", null);
    error(Workflow.INVALID_INSTANCE, () -> Workflow.importInstance(nativeDefinition, Workflow.Instance.fromPortable(malformed)));
    flow.putAll(Map.of("states", List.of("DRAFT", "REVIEW", "DONE"), "initialState", "DRAFT", "terminalStates", List.of("DONE"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "REVIEW"), Map.of("source", "REVIEW", "target", "DONE"))));
    Map<String, Object> definition = Map.of("type", "invoice", "identityScope", "tenant", "workflow", flow,
        "mutability", Map.of("DRAFT", List.of("amount"), "REVIEW", List.of("amount"), "DONE", List.of()));
    Map<String, Object> entity = Entities.create(definition, "invoice-1", Map.of("amount", money.toPortable()));
    Map<String, Object> reviewed = Entities.transition(definition, entity, "REVIEW");
    Object imported = Entities.importEntity(definition, Map.of("entity", reviewed)).get("entity");
    equal(binding, Entities.transition(definition, imported, "DONE").get("binding"));
    equal("DRAFT", entity.get("state"));
    Map<String, Object> mapping = Map.of("mappingId", " map ", "sourceSystem", " legacy ", "sourceId", " 001 ", "entity", Map.of("type", entity.get("type"), "id", entity.get("id")));
    Map<String, Object> mapped = Entities.importEntity(definition, Map.of("entity", entity, "identityMapping", mapping));
    equal(mapping, mapped.get("identityMapping")); equal(false, mapped.containsKey("sourceIdentity"));
    equal(binding, Entities.transition(definition, mapped.get("entity"), "REVIEW").get("binding"));
    for (Object source : new Object[]{null, List.of(), false, 1, "", Map.of(), Map.of("sourceSystem", " legacy ")}) {
      Map<String, Object> input = new LinkedHashMap<>(Map.of("entity", entity, "identityMapping", mapping)); input.put("sourceIdentity", source);
      error(Entities.INVALID_IDENTITY, () -> Entities.importEntity(definition, input));
    }
    for (String expectation : List.of("expectedState", "expectedRevision", "expectedConflictVersion")) {
      Map<String, Object> input = new LinkedHashMap<>(Map.of("entity", entity)); input.put(expectation, null);
      error(Entities.STATE_CONFLICT, () -> Entities.importEntity(definition, input));
    }
    Map<String, Object> badDefinition = new LinkedHashMap<>(definition);
    badDefinition.put("validation", List.of(Map.of("id", "X", "path", "amount", "rule", "typo")));
    error(Entities.INVALID_MUTATION, () -> Entities.create(badDefinition, "invoice-2", entity.get("data")));
    Map<String, Object> composition = Map.of("rootGroup", "root", "groups", List.of(Map.of("id", "root", "kind", "ALL_OF", "members", List.of(Map.of("type", "requirement", "id", "member", "requirementId", "review")))));
    List<Map<String, Object>> observations = List.of(Map.of("id", "review", "applicability", "APPLICABLE", "state", "PENDING", "requiresEvaluationContext", true));
    Map<String, Object> context = Map.of("evaluatedAt", "2026-09-26T10:00:00Z");
    equal(Map.of("outcome", "PENDING", "actionableRequirements", List.of("review")), Approvals.evaluateComposition(composition, observations, List.of(), context));
    error(Approvals.INVALID_CHAIN, () -> Approvals.evaluateComposition(composition, observations, Map.of(), context));
    error(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateComposition(composition, observations, List.of(), Map.of("evaluatedAt", "invalid")));
    error(Approvals.INVALID_CHAIN, () -> Approvals.evaluateComposition(composition, List.of(Map.of("id", "review", "applicability", "APPLICABLE")), List.of(), null));
    Map<String, Object> requirement = Map.of("id", "review", "subject", Map.of("type", "invoice", "id", "invoice-1"),
        "eligibleActors", List.of("alice"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
    String expiry = "2026-09-26T10:00:00.123456789Z";
    Map<String, Object> decision = Map.of("requirementId", "review", "actor", Map.of("id", "alice"), "outcome", "APPROVED",
        "subjectFacts", Map.of(), "decidedAt", "2026-09-01T00:00:00Z", "expiresAt", expiry);
    equal("INEFFECTIVE", Approvals.evaluateDecision(requirement, decision, Map.of(), null, expiry));
    error(Approvals.INVALID_CONTEXT, () -> Approvals.evaluateDecision(requirement, decision, Map.of(), null, null));
    Map<String, Object> history = Approvals.recordDecision(requirement, decision, List.of());
    Map<String, Object> withdrawal = Map.of("target", Map.of("requirementId", "review", "actorId", "alice", "decidedAt", decision.get("decidedAt")),
        "actor", Map.of("id", "alice"), "recordedAt", expiry);
    Map<String, Object> withdrawn = Approvals.withdrawDecision(requirement, history, withdrawal);
    equal(withdrawn, Approvals.importHistory(withdrawn));
    equal("PENDING", Approvals.evaluateRequirement(requirement, withdrawn, Map.of(), null, null));
    Map<String, Object> invalidEvent = new LinkedHashMap<>(withdrawal); invalidEvent.put("type", "UNKNOWN");
    error(Approvals.INVALID_DECISION, () -> Approvals.importHistory(Map.of("history", history.get("history"), "lifecycle", List.of(invalidEvent))));
    equal(Map.of("history", List.of(decision)), history);
    error(Audit.ACTOR_INVALID, () -> Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", new AtomicInteger(1))));
    Map<String, Object> cycle = new LinkedHashMap<>(); cycle.put("self", cycle);
    error(Audit.ACTOR_INVALID, () -> Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", cycle)));
    Map<String, Object> metadata = new LinkedHashMap<>(Map.of("value", 1));
    Audit.Actor actor = Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", metadata));
    metadata.put("value", 2);
    equal(Map.of("value", 1), actor.metadata());
    // Core 0.9.7: supported immutable evidence control before unsupported values.
    Map<String, Object> nativeDecision097 = new LinkedHashMap<>(decision);
    nativeDecision097.remove("expiresAt");
    nativeDecision097.put("subjectFacts", Map.of("value", new java.math.BigDecimal("1.0")));
    Map<String, Object> nativeHistory097 = Approvals.recordDecision(requirement, nativeDecision097, List.of());
    equal("EFFECTIVE", Approvals.evaluateDecision(requirement, nativeDecision097, Map.of("value", new java.math.BigDecimal("1.0")), List.of("value"), null));
    Map<String, Object> mutable097 = new LinkedHashMap<>(nativeDecision097);
    mutable097.put("subjectFacts", Map.of("value", new AtomicInteger(1)));
    error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(requirement, mutable097, nativeHistory097));
    equal(Map.of("history", List.of(nativeDecision097)), nativeHistory097);
    equal("EFFECTIVE", Approvals.evaluateDecision(requirement, nativeDecision097, Map.of("value", new java.math.BigDecimal("1.00")), List.of("value"), null));
    System.out.println("Installed Java consumer: lossless serialization, Entity binding/null/validators, Approval concrete/history, Audit numeric/cycle/ownership boundaries pass");
  }
}
