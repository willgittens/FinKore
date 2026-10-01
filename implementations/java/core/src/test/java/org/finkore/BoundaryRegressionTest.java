// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/** Core 0.9.5 native regression and valid-control cases; no conformance adapter calls. */
public final class BoundaryRegressionTest {
  private BoundaryRegressionTest() {}

  /** Executes every discovered case; an optional name fragment selects cases for diagnosis. */
  public static void main(String[] args) throws IOException {
    List<String> failures = new ArrayList<>();
    int executed = 0;
    for (Map.Entry<String, Runnable> entry : cases().entrySet()) {
      if (args.length > 0 && !entry.getKey().contains(args[0])) continue;
      executed++;
      try {
        entry.getValue().run();
        System.out.println("PASS " + entry.getKey());
      } catch (AssertionError failure) {
        failures.add(entry.getKey());
        System.out.println("FAIL " + entry.getKey() + ": " + failure.getMessage());
      } catch (RuntimeException failure) {
        failures.add(entry.getKey());
        System.out.println("FAIL " + entry.getKey() + ": unexpected " + failure.getClass().getSimpleName());
      }
    }
    if (executed == 0) throw new AssertionError("No boundary tests selected");
    System.out.println("Boundary tests: " + executed + ", failures: " + failures.size());
    if (!failures.isEmpty()) throw new AssertionError("Boundary regressions failed: " + String.join(", ", failures));
  }

  /** Supplies named native cases to normal test discovery and later mutation probes. */
  public static Map<String, Runnable> cases() throws IOException {
    Map<String, Runnable> cases = new LinkedHashMap<>();
    Path root = Files.exists(Path.of("conformance")) ? Path.of(".") : Path.of("../../..");
    Map<String, Object> manifest = map(Json.parse(Files.readString(root.resolve("conformance/manifest.json"))));
    for (Object suite : list(manifest.get("suites"))) for (Object file : list(map(suite).get("vectorFiles"))) {
      Map<String, Object> document = map(Json.parse(Files.readString(root.resolve("conformance").resolve((String) file))));
      for (Object item : list(document.get("vectors"))) {
        Map<String, Object> vector = map(item);
        String id = (String) vector.get("id");
        if (List.of("approval.association.", "workflow.presence.", "entity.import.presence-", "entity.import.equal-revision-",
            "entity.import.distinct-token-", "entity.binding.", "entity.declaration.").stream().anyMatch(id::startsWith)) {
          cases.put(id, () -> nativeVector(vector));
        }
      }
    }
    if (cases.isEmpty()) throw new AssertionError("No boundary vectors discovered");
    cases.put("audit.policy097.omitted", () -> policyIdentityControl(null));
    cases.put("audit.policy097.string-control", () -> policyIdentityControl("retention"));
    cases.put("audit.policy097.whitespace", () -> policyIdentityControl(" "));
    cases.put("audit.policy097.malformed", BoundaryRegressionTest::policyIdentityInvalid);
    cases.put("audit.policy097.constructor", BoundaryRegressionTest::policyIdentityConstructor);
    cases.put("audit.metadata097.null-presence", () -> eventMetadataPresence(true));
    cases.put("audit.metadata097.omitted-control", () -> eventMetadataPresence(false));
    cases.put("audit.metadata097.explicit-constructor", BoundaryRegressionTest::eventMetadataConstructor);
    cases.put("money.serialization.exact-control", BoundaryRegressionTest::exactSerialization);
    cases.put("money.serialization.rounding-control", BoundaryRegressionTest::roundingControl);
    cases.put("money.serialization.unsupported-scale", () -> {
      Money money = Money.fromPortable(Map.of("amount", "1", "currency", "EUR"));
      Object before = money.toPortable();
      try { error(Money.INVALID_ROUNDING, () -> money.toPortable(Integer.MAX_VALUE)); }
      finally { equal(before, money.toPortable()); }
    });
    for (String amount : List.of("1.239", "-1.239", "0.001", "-0.001")) {
      cases.put("money.serialization.lossy-" + amount, () -> {
        Money money = Money.fromPortable(Map.of("amount", amount, "currency", "EUR"));
        Object before = money.toPortable();
        try { error(Money.ROUNDING_REQUIRED, () -> money.toPortable(2)); }
        finally { equal(before, money.toPortable()); }
      });
    }
    for (int scale : List.of(-1, -2)) cases.put("money.serialization.invalid-scale-" + scale, () -> {
      Money money = Money.fromPortable(Map.of("amount", "10.00", "currency", "EUR"));
      Object before = money.toPortable();
      try { error(Money.INVALID_ROUNDING, () -> money.toPortable(scale)); }
      finally { equal(before, money.toPortable()); }
    });
    cases.put("entity.sequence.unversioned-control", () -> entitySequence(false));
    cases.put("entity.sequence.versioned", () -> entitySequence(true));
    cases.put("entity.binding.mutation-reuse", BoundaryRegressionTest::entityBindingReuse);
    cases.put("entity.declaration.operation-boundaries", BoundaryRegressionTest::entityDeclarationBoundaries);
    cases.put("approval.sequence.control", () -> approvalSequence(false));
    cases.put("approval.sequence.missing-association", () -> approvalSequence(true));
    Map<String, Object> approvalVectors = map(Json.parse(Files.readString(root.resolve("conformance/approvals/readiness-regressions.json"))));
    cases.put("approval.sequence.incomplete-reused-history", () -> incompleteApprovalHistory(list(approvalVectors.get("vectors"))));
    for (String location : List.of("actor", "change", "metadata")) {
      for (String boundary : List.of("construct", "import", "append", "redact")) {
        for (String shape : List.of("map", "list", "nested")) {
          cases.put("audit.cycle." + location + "." + boundary + "." + shape, () -> auditCycle(location, boundary, shape));
        }
        for (String numeric : List.of("integer", "long")) {
          cases.put("audit.mutable-number." + location + "." + boundary + "." + numeric,
              () -> mutableNumber(location, boundary, numeric.equals("integer") ? new AtomicInteger(1) : new AtomicLong(1)));
        }
      }
    }
    cases.put("audit.mutable-number.returned-observation", BoundaryRegressionTest::numericObservation);
    cases.put("audit.immutable-numbers-shared-ownership-control", BoundaryRegressionTest::auditControl);
    cases.put("audit.native-record-ownership", BoundaryRegressionTest::auditRecordOwnership);
    cases.put("audit.native-error-precedence", BoundaryRegressionTest::auditErrorPrecedence);
    cases.put("audit.unsupported-number-subclasses", BoundaryRegressionTest::unsupportedNumberSubclasses);
    cases.put("audit.scalar-control", () -> equal(event(), Audit.Event.fromPortable(event()).toPortable()));
    cases.putAll(EntityNativeValuesTest.cases());
    return cases;
  }

  // Each fixture is executed by its owning native core; arguments retain explicit null.
  private static Object invoke(Map<String, Object> vector) {
    Map<String, Object> input = map(vector.get("input"));
    return switch ((String) vector.get("operation")) {
      case "approval.decision.record" -> Approvals.recordDecision(input.get("requirement"), input.get("decision"), input.get("history"));
      case "approval.requirement.evaluate" -> Approvals.evaluateRequirement(input.get("requirement"), input.get("decisions"), input.getOrDefault("currentSubjectFacts", Approvals.OMITTED), input.getOrDefault("relevantFactPaths", Approvals.OMITTED), input.get("evaluatedAt"));
      case "approval.decision.evaluate" -> Approvals.evaluateDecision(input.get("decision"), input.get("currentSubjectFacts"), null, null);
      case "finkore.workflow.transition" -> {
        Workflow.Definition definition = Workflow.Definition.fromPortable(input.get("definition"));
        Workflow.Instance instance = Workflow.Instance.fromPortable(input.get("instance"));
        Object before = copy(instance.toPortable());
        try {
          yield Workflow.transition(definition, instance, input.get("target"), input.get("facts"),
              input.getOrDefault("expectedCurrentState", Workflow.OMITTED),
              input.getOrDefault("expectedRevision", Workflow.OMITTED)).toPortable();
        } finally { equal(before, instance.toPortable()); }
      }
      case "finkore.entity.create" -> Entities.create(input.get("definition"), input.get("id"), input.get("data"));
      case "finkore.entity.transition" -> Entities.transition(input.get("definition"), input.get("entity"), input.get("target"));
      case "finkore.entity.mutate" -> Entities.mutate(input.get("definition"), input.get("entity"), input.get("changes"));
      case "entity.import" -> Entities.importEntity(input.get("definition"), input.get("import"));
      default -> throw new AssertionError("Missing native dispatch " + vector.get("operation"));
    };
  }

  private static void nativeVector(Map<String, Object> vector) {
    Map<String, Object> candidate = map(copy(vector));
    Object before = copy(candidate.get("input"));
    Map<String, Object> expected = map(candidate.get("expected"));
    try {
      if ("error".equals(expected.get("status"))) error((String) map(expected.get("error")).get("code"), () -> invoke(candidate));
      else equal(expected.get("value"), invoke(candidate));
    } finally { equal(before, candidate.get("input")); }
  }

  // MONEY-SERIALIZATION-008, MONEY-ERROR-005/006/007. Integer is the native scale type;
  // fractional/string/Boolean scales are unrepresentable through this public Java API.
  private static void exactSerialization() {
    for (String[] item : List.of(new String[]{"1.2300", "2", "1.23"}, new String[]{"-1.2300", "2", "-1.23"},
        new String[]{"1.239", "3", "1.239"}, new String[]{"1.239", "5", "1.23900"},
        new String[]{"0.000", "0", "0"}, new String[]{"-0.000", "2", "0.00"}, new String[]{"10.00", "0", "10"},
        new String[]{"123456789012345678901.123456789", "9", "123456789012345678901.123456789"})) {
      Money money = Money.fromPortable(Map.of("amount", item[0], "currency", "EUR"));
      Object before = money.toPortable();
      Map<String, Object> result = money.toPortable(Integer.valueOf(item[1]));
      equal(Map.of("amount", item[2], "currency", "EUR"), result);
      equal("EQUAL", money.compare(Money.fromPortable(result)));
      equal(before, money.toPortable());
      equal(before, money.toPortable(null));
    }
  }

  private static void roundingControl() {
    for (String amount : List.of("1.239", "-1.239")) {
      Money money = Money.fromPortable(Map.of("amount", amount, "currency", "EUR"));
      equal(Map.of("amount", amount.startsWith("-") ? "-1.24" : "1.24", "currency", "EUR"), money.round(2, "HALF_UP").toPortable(2));
      equal(amount, money.toPortable().get("amount"));
    }
  }

  private static Map<String, Object> binding() {
    return Map.of("definitionIdentity", "invoice-flow", "definitionVersionIdentity", "1");
  }

  private static void incompleteApprovalHistory(List<Object> vectors) {
    for (Object value : vectors) {
      Map<String, Object> vector = map(value);
      if (!((String) vector.get("id")).startsWith("approval.association.history-")) continue;
      Map<String, Object> input = map(vector.get("input"));
      Object history = copy(input.get("decisions"));
      Object before = copy(history);
      Map<String, Object> decision = new LinkedHashMap<>(Map.of("requirementId", "review", "outcome", "APPROVED",
          "actor", Map.of("id", "alice"), "decidedAt", "2026-09-03T12:00:00Z"));
      decision.put("subjectFacts", null);
      try { error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(input.get("requirement"), decision, history)); }
      finally { equal(before, history); }
    }
  }

  private static void approvalSequence(boolean rejectMissing) {
    Map<String, Object> requirement = Map.of("id", "review", "subject", Map.of("type", "invoice", "id", "invoice-1"), "eligibleActors", List.of("alice"), "approvedOutcome", "APPROVED", "rejectedOutcome", "REJECTED");
    Map<String, Object> decision = new LinkedHashMap<>(Map.of("requirementId", "review", "outcome", "APPROVED", "actor", Map.of("id", "alice"), "decidedAt", "2026-09-01T12:00:00Z"));
    decision.put("subjectFacts", null);
    Map<String, Object> history = Approvals.recordDecision(requirement, decision, List.of());
    equal(Map.of("history", List.of(decision)), history);
    equal("APPROVED", Approvals.evaluateRequirement(requirement, history, Approvals.OMITTED, Approvals.OMITTED, null));
    if (rejectMissing) {
      Map<String, Object> missing = new LinkedHashMap<>(decision);
      missing.remove("subjectFacts"); missing.put("decidedAt", "2026-09-02T12:00:00Z");
      Object before = copy(history);
      try { error(Approvals.INVALID_DECISION, () -> Approvals.recordDecision(requirement, missing, history)); }
      finally {
        equal(before, history);
        equal("APPROVED", Approvals.evaluateRequirement(requirement, history, Approvals.OMITTED, Approvals.OMITTED, null));
      }
    }
  }

  private static Map<String, Object> definition(boolean versioned) {
    Map<String, Object> flow = new LinkedHashMap<>(Map.of("states", List.of("DRAFT", "REVIEW", "DONE"), "initialState", "DRAFT", "terminalStates", List.of("DONE"),
        "transitions", List.of(Map.of("source", "DRAFT", "target", "REVIEW"), Map.of("source", "REVIEW", "target", "DONE"))));
    if (versioned) flow.putAll(binding());
    return Map.of("type", "invoice", "identityScope", "tenant", "workflow", flow, "mutability", Map.of("DRAFT", List.of("amount"), "REVIEW", List.of("amount"), "DONE", List.of()));
  }

  private static void entitySequence(boolean versioned) {
    Map<String, Object> definition = definition(versioned);
    Map<String, Object> data = Map.of("amount", Map.of("amount", "1.239", "currency", "EUR"));
    Map<String, Object> first = Entities.create(definition, "invoice-1", data);
    Object before = copy(first);
    try {
      Map<String, Object> second = Entities.transition(definition, first, "REVIEW");
      Map<String, Object> imported = Entities.importEntity(definition, Map.of("entity", second));
      Map<String, Object> last = Entities.transition(definition, imported.get("entity"), "DONE");
      Map<String, Object> expected = new LinkedHashMap<>(Map.of("type", "invoice", "id", "invoice-1", "state", "DONE", "data", data));
      if (versioned) expected.put("binding", binding());
      equal(expected, last);
    } finally { equal(before, first); }
  }

  private static void eventMetadataConstructor() {
    Audit.EntityReference entity = new Audit.EntityReference("invoice", "invoice-1");
    Audit.Event present = new Audit.Event("event-1", "ENTITY_CHANGED", entity,
        "2026-09-01T12:00:00Z", null, null, null, true, null);
    Map<String, Object> expected = event(); expected.put("metadata", null);
    equal(expected, present.toPortable());
    equal(true, present.hasMetadata());
    equal(null, present.metadata());
    Audit.Event legacy = new Audit.Event("event-1", "ENTITY_CHANGED", entity,
        "2026-09-01T12:00:00Z", null, null, null, null);
    equal(event(), legacy.toPortable());
    equal(false, legacy.hasMetadata());
    error(Audit.INVALID_EVENT, () -> new Audit.Event("e", "CHANGED", entity,
        "2026-09-01T12:00:00Z", null, null, null, false, Map.of("x", 1)));
    error(Audit.INVALID_EVENT, () -> new Audit.Event("e", "CHANGED", entity,
        "2026-09-01T12:00:00Z", null, null, null, true, new AtomicInteger(1)));
  }

  // AUDIT-EVENT-009: import, append and later reuse preserve explicit presence.
  private static Map<String, Object> identityPolicy() {
    return new LinkedHashMap<>(Map.of("authority", "retention", "protectedPaths", List.of("actor.displayName")));
  }

  private static Map<String, Object> identitySource() {
    Map<String, Object> source = event();
    source.put("actor", Map.of("id", "alice", "displayName", "Private"));
    return source;
  }

  private static void policyIdentityControl(String id) {
    try {
      Map<String, Object> policy = identityPolicy();
      if (id != null) policy.put("id", id);
      Object before = copy(policy);
      equal(id, Audit.RedactionPolicy.fromPortable(policy).id());
      Map<String, Object> source = identitySource();
      Map<String, Object> evidence = event(); evidence.put("eventId", "redacted");
      Map<String, Object> view = map(copy(source));
      view.put("actor", Map.of("id", "alice", "displayName", Map.of("presence", "REDACTED")));
      Audit.Log log = Audit.Log.create(List.of(source));
      equal(Map.of("event", view, "evidenceEvent", evidence), log.redact(policy, evidence).toPortable());
      equal(List.of(source, evidence), log.events());
      Map<String, Object> later = event(); later.put("eventId", "later");
      equal(List.of(source, evidence, later), Audit.Log.create(log.events()).append(later).events());
      equal(before, policy);
    } catch (FinKoreException failure) {
      throw new AssertionError("Valid policy rejected with " + failure.code());
    }
  }

  private static void policyIdentityInvalid() {
    for (Object id : java.util.Arrays.asList(null, "", false, true, 0, 42, List.of(), Map.of(), List.of("retention"))) {
      Map<String, Object> policy = identityPolicy(); policy.put("id", id);
      Object before = copy(policy);
      error(Audit.REDACTION_INVALID, () -> Audit.RedactionPolicy.fromPortable(policy));
      Map<String, Object> source = identitySource();
      Map<String, Object> evidence = event(); evidence.put("eventId", "redacted");
      Audit.Log log = Audit.Log.create(List.of(source));
      error(Audit.REDACTION_INVALID, () -> log.redact(policy, evidence));
      equal(List.of(source), log.events());
      equal(before, policy);
      equal(List.of(source, evidence), log.append(evidence).events());
    }
  }

  private static void policyIdentityConstructor() {
    equal(null, new Audit.RedactionPolicy(null, List.of("actor.displayName"), "retention").id());
    error(Audit.REDACTION_INVALID, () -> new Audit.RedactionPolicy("", List.of("actor.displayName"), "retention"));
  }

  private static void eventMetadataPresence(boolean supplied) {
    Map<String, Object> candidate = event();
    if (supplied) candidate.put("metadata", null);
    Map<String, Object> before = new LinkedHashMap<>(candidate);
    Audit.Event retained = Audit.Event.fromPortable(candidate);
    equal(before, retained.toPortable());
    equal(List.of(before), Audit.Log.create(List.of(candidate)).events());
    Audit.Log appended = Audit.Log.create(List.of()).append(candidate);
    equal(List.of(before), appended.events());
    Map<String, Object> later = event(); later.put("eventId", "later");
    equal(List.of(before, later), Audit.Log.create(appended.events()).append(later).events());
    equal(before, candidate);
  }

  private static Map<String, Object> event() {
    return new LinkedHashMap<>(Map.of("eventId", "event-1", "eventType", "ENTITY_CHANGED", "entity", Map.of("type", "invoice", "id", "invoice-1"), "occurredAt", "2026-09-01T12:00:00Z"));
  }

  private static void entityBindingReuse() {
    Map<String, Object> definition = definition(true);
    Map<String, Object> first = Entities.create(definition, "invoice-1", Map.of("amount", Map.of("amount", "1", "currency", "EUR")));
    Object firstBefore = copy(first);
    Map<String, Object> updated = Entities.mutate(definition, first, Map.of("amount", Map.of("amount", "2", "currency", "EUR")));
    Map<String, Object> imported = map(Entities.importEntity(definition, Map.of("entity", updated)).get("entity"));
    equal(binding(), Entities.transition(definition, imported, "REVIEW").get("binding"));
    for (Object binding : java.util.Arrays.asList(null, Map.of(), Map.of("definitionIdentity", "invoice-flow", "definitionVersionIdentity", "2"))) {
      Map<String, Object> candidate = map(copy(imported)); candidate.put("binding", binding);
      Object before = copy(candidate);
      String code = binding instanceof Map<?, ?> map && !map.isEmpty() ? Workflow.VERSION_MISMATCH : Workflow.INVALID_INSTANCE;
      error(code, () -> Entities.mutate(definition, candidate, Map.of("amount", Map.of("amount", "3", "currency", "EUR"))));
      error(code, () -> Entities.transition(definition, candidate, "REVIEW")); equal(before, candidate);
    }
    map(updated.get("binding")).put("definitionVersionIdentity", "2");
    equal(binding(), imported.get("binding")); equal(firstBefore, first);
  }

  private static void entityDeclarationBoundaries() {
    Map<String, Object> definition = new LinkedHashMap<>(definition(false));
    Map<String, Object> entity = Entities.create(definition, "invoice-1", Map.of("amount", Map.of("amount", "1", "currency", "EUR")));
    Object before = copy(entity);
    for (Object rules : java.util.Arrays.asList(null, java.util.Arrays.asList((Object) null), List.of(Map.of("id", "X", "path", "amount", "rule", "typo")), List.of(Map.of("path", "amount", "rule", "positive-money")))) {
      definition.put("validation", rules);
      error(Entities.INVALID_MUTATION, () -> Entities.mutate(definition, entity, Map.of("amount", Map.of("amount", "2", "currency", "EUR"))));
      error(Entities.INVALID_MUTATION, () -> Entities.transition(definition, entity, "REVIEW"));
      error(Entities.INVALID_MUTATION, () -> Entities.evolve("CORRECTION", definition, Map.of("source", entity)));
      equal(before, entity);
    }
  }

  private static Map<String, Object> eventWith(String location, Object value) {
    Map<String, Object> result = event();
    if (location.equals("actor")) result.put("actor", Map.of("id", "alice", "metadata", value));
    else if (location.equals("change")) result.put("changes", List.of(Map.of("path", "payload", "before", Map.of(), "after", value)));
    else result.put("metadata", value);
    return result;
  }

  private static void rejectAudit(String location, String boundary, Object value) {
    Map<String, Object> candidate = eventWith(location, value);
    Map<String, Object> prior = event(); prior.put("eventId", "prior");
    prior.put("actor", Map.of("id", "alice", "metadata", Map.of()));
    Audit.Log log = Audit.Log.create(List.of(prior));
    Object before = copy(log.events());
    Runnable action = switch (boundary) {
      case "construct" -> () -> Audit.Event.fromPortable(candidate);
      case "import" -> () -> Audit.Log.create(List.of(candidate));
      case "append" -> () -> log.append(candidate);
      case "redact" -> () -> log.redact(Map.of("id", "policy", "authority", "retention", "protectedPaths", List.of("actor.metadata")), candidate);
      default -> throw new AssertionError(boundary);
    };
    try { error(location.equals("actor") ? Audit.ACTOR_INVALID : Audit.INVALID_EVENT, action); }
    finally { equal(before, log.events()); }
  }

  private static void auditCycle(String location, String boundary, String shape) {
    Map<String, Object> map = new LinkedHashMap<>();
    List<Object> list = new ArrayList<>();
    Object value;
    if (shape.equals("list")) { list.add(list); value = list; }
    else if (shape.equals("nested")) { list.add(map); map.put("nested", list); value = map; }
    else { map.put("cycle", map); value = map; }
    rejectAudit(location, boundary, value);
  }

  private static void mutableNumber(String location, String boundary, Number value) {
    rejectAudit(location, boundary, Map.of("nested", List.of(value)));
  }

  private static void unsupportedNumberSubclasses() {
    for (Number value : List.of(new BigDecimal("1") { private static final long serialVersionUID = 1L; },
        new BigInteger("1") { private static final long serialVersionUID = 1L; })) {
      for (String location : List.of("actor", "change", "metadata")) rejectAudit(location, "append", value);
    }
    error(Audit.ACTOR_INVALID, () -> new Audit.Actor("alice", null, null, true, new AtomicInteger(1)));
    error(Audit.INVALID_EVENT, () -> new Audit.Change("x", true, new AtomicLong(1), false, null));
    error(Audit.INVALID_EVENT, () -> new Audit.Event("e", "CHANGED", new Audit.EntityReference("invoice", "i"),
        "2026-09-01T12:00:00Z", null, null, null, new AtomicInteger(1)));
  }

  private static void auditErrorPrecedence() {
    Map<String, Object> cycle = new LinkedHashMap<>(); cycle.put("self", cycle);
    Map<String, Object> actorBad = eventWith("actor", cycle);
    Map<String, Object> changeBad = eventWith("change", cycle);
    Map<String, Object> both = new LinkedHashMap<>(actorBad); both.put("changes", changeBad.get("changes"));
    Audit.Log log = Audit.Log.create(List.of(event())); Object before = copy(log.events());
    error(Audit.INVALID_EVENT, () -> log.append(both));
    error(Audit.ACTOR_INVALID, () -> log.append(actorBad));
    error(Audit.ACTOR_INVALID, () -> Audit.Log.create(List.of(actorBad, changeBad)));
    error(Audit.INVALID_EVENT, () -> Audit.Log.create(List.of(changeBad, actorBad)));
    equal(before, log.events());
    if (cycle.get("self") != cycle || cycle.size() != 1) throw new AssertionError("Changed cyclic input");
  }

  private static void auditRecordOwnership() {
    for (boolean direct : List.of(false, true)) {
      Map<String, Object> source = new LinkedHashMap<>(Map.of("__proto__", new ArrayList<>(List.of(1))));
      Audit.Actor actor = direct ? new Audit.Actor("alice", null, null, true, source)
          : Audit.Actor.fromPortable(Map.of("id", "alice", "metadata", source));
      Audit.Change change = direct ? new Audit.Change("x", true, source, true, List.of(source))
          : Audit.Change.fromPortable(Map.of("path", "x", "before", source, "after", List.of(source)));
      Map<String, Object> candidate = eventWith("metadata", source);
      candidate.put("actor", actor.toPortable()); candidate.put("changes", List.of(change.toPortable()));
      Audit.Event event = direct ? new Audit.Event("event-1", "ENTITY_CHANGED", new Audit.EntityReference("invoice", "invoice-1"),
          "2026-09-01T12:00:00Z", actor, List.of(change), null, source) : Audit.Event.fromPortable(candidate);
      Object expected = copy(event.toPortable());
      Audit.Log log = Audit.Log.create(List.of(event.toPortable()));
      list(source.get("__proto__")).add(2);
      equal(expected, event.toPortable());
      map(actor.metadata()).put("exposed", true);
      map(change.before()).put("exposed", true);
      map(list(change.after()).get(0)).put("exposed", true);
      map(event.metadata()).put("exposed", true);
      map(event.actor().metadata()).put("nested", true);
      map(event.changes().get(0).before()).put("nested", true);
      equal(expected, event.toPortable()); equal(List.of(expected), log.events());
      Map<String, Object> evidence = eventWith("metadata", new LinkedHashMap<>(Map.of("reason", List.of("retention"))));
      evidence.put("eventId", "redaction"); evidence.put("eventType", "AUDIT_CONTENT_REDACTED");
      Object evidenceBefore = copy(evidence);
      Audit.RedactionResult result = log.redact(Map.of("id", "policy", "authority", "retention", "protectedPaths", List.of("actor.metadata", "x")), evidence);
      map(evidence.get("metadata")).put("reason", "changed");
      result.event().put("eventType", "CHANGED"); result.evidenceEvent().put("eventType", "CHANGED");
      equal(List.of(expected, evidenceBefore), log.events());
    }
  }

  private static void numericObservation() {
    AtomicInteger number = new AtomicInteger(1);
    Map<String, Object> candidate = eventWith("actor", Map.of("counter", number));
    Audit.Log log = Audit.Log.create(List.of());
    try {
      log.append(candidate);
    } catch (FinKoreException failure) {
      equal(Audit.ACTOR_INVALID, failure.code());
      equal(List.of(), log.events());
      return;
    }
    Object observed = map(map(log.events().get(0).get("actor")).get("metadata")).get("counter");
    if (observed instanceof AtomicInteger atomic) atomic.set(999);
    number.set(777);
    Object retained = map(map(log.events().get(0).get("actor")).get("metadata")).get("counter");
    equal(1, ((Number) retained).intValue());
    throw new AssertionError("Unsupported mutable Number was accepted instead of ACTOR_INVALID");
  }

  private static void auditControl() {
    for (Number number : List.of(Byte.valueOf((byte) 1), Short.valueOf((short) 2), Integer.valueOf(3), Long.valueOf(4),
        new BigInteger("123456789012345678901"), new BigDecimal("1.234567890123456789"), Float.valueOf(1.5f), Double.valueOf(2.5))) {
      Map<String, Object> shared = new LinkedHashMap<>(Map.of("number", number));
      Map<String, Object> payload = Map.of("left", shared, "right", List.of(shared));
      Map<String, Object> candidate = eventWith("actor", payload);
      candidate.put("changes", List.of(Map.of("path", "payload", "before", Map.of(), "after", payload)));
      Object expected = copy(candidate);
      Audit.Event constructed = Audit.Event.fromPortable(candidate);
      Audit.Log imported = Audit.Log.create(List.of(candidate));
      Audit.Log appended = Audit.Log.create(List.of()).append(candidate);
      shared.put("number", 999);
      equal(expected, constructed.toPortable());
      equal(List.of(expected), imported.events());
      equal(List.of(expected), appended.events());
      Map<String, Object> exposed = appended.events().get(0);
      map(map(map(exposed.get("actor")).get("metadata")).get("left")).put("number", 888);
      equal(List.of(expected), appended.events());
      Map<String, Object> evidence = event(); evidence.put("eventId", "redaction"); evidence.put("eventType", "AUDIT_CONTENT_REDACTED");
      Audit.RedactionResult redacted = appended.redact(Map.of("id", "policy", "authority", "retention", "protectedPaths", List.of("actor.metadata")), evidence);
      equal(Map.of("presence", "REDACTED"), map(redacted.event().get("actor")).get("metadata"));
      equal(List.of(expected, evidence), appended.events());
    }
  }

  private static Object copy(Object value) {
    if (value instanceof Map<?, ?> source) { Map<String, Object> result = new LinkedHashMap<>(); source.forEach((key, item) -> result.put((String) key, copy(item))); return result; }
    if (value instanceof List<?> source) { List<Object> result = new ArrayList<>(); source.forEach(item -> result.add(copy(item))); return result; }
    return value;
  }
  @SuppressWarnings("unchecked") private static Map<String, Object> map(Object value) { return (Map<String, Object>) value; }
  @SuppressWarnings("unchecked") private static List<Object> list(Object value) { return (List<Object>) value; }
  private static void equal(Object expected, Object actual) {
    if (!Objects.equals(expected, actual)) throw new AssertionError("Expected " + expected + ", actual " + actual);
  }
  private static void error(String code, Runnable action) {
    try { action.run(); }
    catch (FinKoreException failure) { equal(code, failure.code()); return; }
    throw new AssertionError("Expected " + code + "; operation succeeded");
  }
}
