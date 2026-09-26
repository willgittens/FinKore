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
    for (String expectation : List.of("expectedState", "expectedRevision", "expectedConflictVersion")) {
      Map<String, Object> input = new LinkedHashMap<>(Map.of("entity", entity)); input.put(expectation, null);
      error(Entities.STATE_CONFLICT, () -> Entities.importEntity(definition, input));
    }
    Map<String, Object> badDefinition = new LinkedHashMap<>(definition);
    badDefinition.put("validation", List.of(Map.of("id", "X", "path", "amount", "rule", "typo")));
    error(Entities.INVALID_MUTATION, () -> Entities.create(badDefinition, "invoice-2", entity.get("data")));
    error(Audit.ACTOR_INVALID, () -> Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", new AtomicInteger(1))));
    Map<String, Object> cycle = new LinkedHashMap<>(); cycle.put("self", cycle);
    error(Audit.ACTOR_INVALID, () -> Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", cycle)));
    Map<String, Object> metadata = new LinkedHashMap<>(Map.of("value", 1));
    Audit.Actor actor = Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", metadata));
    metadata.put("value", 2);
    equal(Map.of("value", 1), actor.metadata());
    System.out.println("Installed Java consumer: lossless serialization, Entity binding/null/validators, Audit numeric/cycle/ownership boundaries pass");
  }
}
