// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigInteger;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * FinKore Approval behavior for requirements, decisions, lifecycle validity,
 * chains, and bounded composition.
 *
 * <p>The current Java API accepts portable JSON-shaped observations at the
 * conformance boundary while preserving Approval semantics in core code. It
 * does not define authorization, identity directories, dynamic approver
 * resolution, delegation, escalation, or unbounded approval graphs.
 *
 * @see <a href="../../../../../../spec/approvals/requirements.md">APPROVAL-REQUIREMENT-001</a>
 * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-001</a>
 * @see <a href="../../../../../../spec/approvals/composition.md">APPROVAL-COMPOSITION-001</a>
 */
public final class Approvals {
  /** Portable error for missing required approval. */
  public static final String REQUIRED = "FINKORE_APPROVAL_REQUIRED";
  /** Portable error for malformed or impermissible Approval Decisions. */
  public static final String INVALID_DECISION = "FINKORE_APPROVAL_INVALID_DECISION";
  /** Portable error for an ineligible deciding Actor. */
  public static final String INELIGIBLE_ACTOR = "FINKORE_APPROVAL_INELIGIBLE_ACTOR";
  /** Portable error for invalid Approval Chains or Composition evidence. */
  public static final String INVALID_CHAIN = "FINKORE_APPROVAL_INVALID_CHAIN";
  /** Portable error for unresolved Approval Conditions. */
  public static final String CONDITION_UNRESOLVED = "FINKORE_APPROVAL_CONDITION_UNRESOLVED";
  /** Portable error for missing or malformed explicit validity context. */
  public static final String INVALID_CONTEXT = "FINKORE_APPROVAL_INVALID_CONTEXT";

  private static final Missing MISSING = new Missing();

  private Approvals() {}

  /**
   * Appends one Approval Decision to append-only logical history.
   *
   * @param requirement portable Approval Requirement
   * @param decision portable Approval Decision
   * @param history existing decision history as a list or history envelope
   * @return history envelope containing the appended Decision
   * @throws FinKoreException with Approval portable error code
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-007</a>
   */
  public static Map<String, Object> recordDecision(Object requirement, Object decision, Object history) {
    Map<String, Object> req = validateRequirement(requirement);
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> recorded = validateDecision(req, decision);
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("history", append(current.history(), recorded));
    return result;
  }

  /**
   * Evaluates one Decision's current effectiveness for supplied current facts.
   *
   * @param decision portable Approval Decision
   * @param currentSubjectFacts current subject facts
   * @param relevantFactPaths optional relevant fact paths
   * @param evaluatedAt optional explicit evaluation instant
   * @return {@code EFFECTIVE} or {@code INEFFECTIVE}
   * @throws FinKoreException with Approval portable error code
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-003</a>
   */
  public static String evaluateDecision(
      Object decision,
      Object currentSubjectFacts,
      Object relevantFactPaths,
      Object evaluatedAt) {
    Map<String, Object> item = validateDecisionShape(decision);
    if (Boolean.FALSE.equals(item.get("effective")) || expired(item, evaluatedAt)) {
      return "INEFFECTIVE";
    }
    if (relevantFactPaths != null && !factsMatch(item.get("subjectFacts"), currentSubjectFacts, relevantFactPaths)) {
      return "INEFFECTIVE";
    }
    return "EFFECTIVE";
  }

  /**
   * Evaluates an Approval Requirement from currently effective Decisions.
   *
   * @param requirement portable Approval Requirement
   * @param decisions history list or history envelope
   * @param currentSubjectFacts current subject facts
   * @param relevantFactPaths optional fact paths that determine continued effectiveness
   * @param evaluatedAt optional explicit evaluation instant
   * @return {@code APPROVED}, {@code REJECTED}, or {@code PENDING}
   * @throws FinKoreException with Approval portable error code
   */
  public static String evaluateRequirement(
      Object requirement,
      Object decisions,
      Object currentSubjectFacts,
      Object relevantFactPaths,
      Object evaluatedAt) {
    Map<String, Object> req = validateRequirement(requirement);
    DecisionSet decisionSet = normalizeDecisionSet(decisions);
    boolean approved = false;
    boolean rejected = false;
    for (Map<String, Object> decision : decisionSet.history()) {
      if (decisionCurrent(req, decision, decisionSet.lifecycle(), currentSubjectFacts, relevantFactPaths, evaluatedAt)) {
        approved = approved || "APPROVED".equals(decision.get("outcome"));
        rejected = rejected || "REJECTED".equals(decision.get("outcome"));
      }
    }
    if (rejected) {
      return "REJECTED";
    }
    return approved ? "APPROVED" : "PENDING";
  }

  /**
   * Evaluates an Approval Condition from explicit facts and explicit result.
   *
   * @param condition portable condition
   * @param facts explicit fact map
   * @param result explicit result supplied by the composing domain
   * @return {@code APPLICABLE} or {@code NOT_APPLICABLE}
   */
  public static String evaluateCondition(Object condition, Object facts, Object result) {
    if (!(condition instanceof Map<?, ?> conditionMap) || !(facts instanceof Map<?, ?> factsMap)) {
      throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    Object requiredFacts = conditionMap.get("requiredFacts");
    if (requiredFacts instanceof List<?> factList) {
      for (Object fact : factList) {
        if (!(fact instanceof String key) || !factsMap.containsKey(key)) {
          throw new FinKoreException(CONDITION_UNRESOLVED);
        }
      }
    }
    if (!"APPLICABLE".equals(result) && !"NOT_APPLICABLE".equals(result)) {
      throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    return (String) result;
  }

  /**
   * Evaluates a Draft all-required Approval Chain.
   *
   * @param chain portable chain definition
   * @param states current requirement states
   * @return chain outcome or pending active requirement observation
   */
  public static Object evaluateChain(Object chain, Object states) {
    if (!(chain instanceof Map<?, ?> chainMap) || !(states instanceof Map<?, ?> stateMap)) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    List<String> requirements = stringList(chainMap.get("requirements"), INVALID_CHAIN);
    if (requirements.isEmpty() || new HashSet<>(requirements).size() != requirements.size()) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    Object mode = chainMap.get("mode");
    if (!"SEQUENTIAL".equals(mode) && !"UNORDERED".equals(mode)) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    for (String requirement : requirements) {
      Object state = stateMap.get(requirement);
      if (!Set.of("APPROVED", "REJECTED", "PENDING", "NOT_APPLICABLE").contains(state)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      if ("REJECTED".equals(state)) {
        return "REJECTED";
      }
    }
    boolean allApproved = true;
    for (String requirement : requirements) {
      Object state = stateMap.get(requirement);
      allApproved = allApproved && ("APPROVED".equals(state) || "NOT_APPLICABLE".equals(state));
    }
    if (allApproved) {
      return "APPROVED";
    }
    if ("SEQUENTIAL".equals(mode)) {
      for (String requirement : requirements) {
        if ("PENDING".equals(stateMap.get(requirement))) {
          Map<String, Object> result = new LinkedHashMap<>();
          result.put("state", "PENDING");
          result.put("activeRequirements", List.of(requirement));
          return result;
        }
      }
    }
    return "PENDING";
  }

  /**
   * Records lifecycle evidence withdrawing a committed Decision.
   *
   * @param requirement portable Approval Requirement
   * @param history existing decision history
   * @param withdrawal withdrawal lifecycle evidence
   * @return history envelope preserving committed Decisions and appending lifecycle evidence
   */
  public static Map<String, Object> withdrawDecision(Object requirement, Object history, Object withdrawal) {
    validateRequirement(requirement);
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> event = lifecycle(withdrawal, "WITHDRAWN", false);
    @SuppressWarnings("unchecked")
    Map<String, Object> target = (Map<String, Object>) event.get("target");
    if (findDecision(current.history(), target) == null || lifecycleContains(current.lifecycle(), "WITHDRAWN", target)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    return historyEnvelope(current.history(), append(current.lifecycle(), event));
  }

  /**
   * Records lifecycle evidence superseding a committed Decision.
   *
   * @param history existing decision history
   * @param supersession supersession lifecycle evidence
   * @return history envelope with appended lifecycle evidence
   */
  public static Map<String, Object> supersedeDecision(Object history, Object supersession) {
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> event = lifecycle(supersession, "DECISION_SUPERSEDED", true);
    @SuppressWarnings("unchecked")
    Map<String, Object> target = (Map<String, Object>) event.get("target");
    @SuppressWarnings("unchecked")
    Map<String, Object> successor = (Map<String, Object>) event.get("successor");
    if (findDecision(current.history(), target) == null || findDecision(current.history(), successor) == null) {
      throw new FinKoreException(INVALID_DECISION);
    }
    return historyEnvelope(current.history(), append(current.lifecycle(), event));
  }

  /**
   * Records lifecycle evidence superseding an Approval Requirement identity.
   *
   * @param history existing decision history
   * @param supersession requirement supersession evidence
   * @return history envelope with appended lifecycle evidence
   */
  public static Map<String, Object> supersedeRequirement(Object history, Object supersession) {
    DecisionSet current = normalizeDecisionSet(history);
    if (!(supersession instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> event = stringObjectMap(raw, INVALID_DECISION);
    requiredString(event.get("targetRequirementId"), INVALID_DECISION);
    requiredString(event.get("successorRequirementId"), INVALID_DECISION);
    instant(event.get("recordedAt"), INVALID_DECISION);
    Map<String, Object> lifecycle = new LinkedHashMap<>();
    lifecycle.put("type", "REQUIREMENT_SUPERSEDED");
    lifecycle.putAll(copyMap(event, INVALID_DECISION));
    return historyEnvelope(current.history(), append(current.lifecycle(), lifecycle));
  }

  /**
   * Evaluates bounded Approval Composition groups, quorum, and stages.
   *
   * @param composition portable composition definition
   * @param requirements current requirement observations
   * @param decisions current-effective decision observations for quorum groups
   * @param context explicit evaluation context
   * @return composition evaluation
   */
  public static Map<String, Object> evaluateComposition(
      Object composition,
      Object requirements,
      Object decisions,
      Object context) {
    Map<String, Map<String, Object>> groups = validateCompositionStructure(composition);
    @SuppressWarnings("unchecked")
    Map<String, Object> compositionMap = (Map<String, Object>) copyJson(composition, INVALID_CHAIN);
    Map<String, Map<String, Object>> reqs = validateCompositionRequirements(requirements, context);
    List<Map<String, Object>> decisionHistory = decisions instanceof List<?> list ? copyMapList(list, INVALID_CHAIN) : List.of();
    validateCompositionEvidence(reqs, decisionHistory);
    if (compositionMap.containsKey("stages")) {
      List<GroupResult> stageResults = new ArrayList<>();
      for (Object stageObject : listValue(compositionMap.get("stages"), INVALID_CHAIN)) {
        @SuppressWarnings("unchecked")
        Map<String, Object> stage = (Map<String, Object>) stageObject;
        List<GroupResult> roots = new ArrayList<>();
        for (String groupId : stringList(stage.get("groups"), INVALID_CHAIN)) {
          roots.add(evaluateGroup(groupId, groups, reqs, decisionHistory));
        }
        stageResults.add(combineStage(roots));
      }
      for (GroupResult result : stageResults) {
        if (!"APPROVED".equals(result.outcome())) {
          return compositionResult(result.outcome(), "PENDING".equals(result.outcome()) ? result.actionables() : List.of());
        }
      }
      return compositionResult("APPROVED", List.of());
    }
    GroupResult result = evaluateGroup((String) compositionMap.get("rootGroup"), groups, reqs, decisionHistory);
    String outcome = result.applicable() ? result.outcome() : "APPROVED";
    return compositionResult(outcome, "PENDING".equals(outcome) ? result.actionables() : List.of());
  }

  /**
   * Normalizes decision history into the portable history envelope.
   *
   * @param decisions list or envelope
   * @return defensive history envelope
   */
  public static Map<String, Object> historyObservation(Object decisions) {
    DecisionSet set = normalizeDecisionSet(decisions);
    return historyEnvelope(set.history(), set.lifecycle());
  }

  private static Map<String, Object> validateRequirement(Object requirement) {
    if (!(requirement instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> req = stringObjectMap(raw, INVALID_DECISION);
    requiredString(req.get("id"), INVALID_DECISION);
    if (req.containsKey("subject") && !(req.get("subject") instanceof Map<?, ?>)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (!req.containsKey("subject") && !req.containsKey("applicability") && !req.containsKey("state")) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (req.containsKey("eligibleActors")) {
      stringList(req.get("eligibleActors"), INVALID_DECISION);
    } else if (!req.containsKey("applicability") && !req.containsKey("state")) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (!"APPROVED".equals(req.getOrDefault("approvedOutcome", "APPROVED"))
        || !"REJECTED".equals(req.getOrDefault("rejectedOutcome", "REJECTED"))) {
      throw new FinKoreException(INVALID_DECISION);
    }
    return copyMap(req, INVALID_DECISION);
  }

  private static Map<String, Object> validateDecision(Map<String, Object> requirement, Object decision) {
    Map<String, Object> item = validateDecisionShape(decision);
    if (!Objects.equals(item.get("requirementId"), requirement.get("id"))
        || !Set.of("APPROVED", "REJECTED").contains(item.get("outcome"))) {
      throw new FinKoreException(INVALID_DECISION);
    }
    String actorId = actorId(item.get("actor"));
    if (requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_DECISION).contains(actorId)) {
      throw new FinKoreException(INELIGIBLE_ACTOR);
    }
    return copyMap(item, INVALID_DECISION);
  }

  private static Map<String, Object> validateDecisionShape(Object decision) {
    if (!(decision instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> item = stringObjectMap(raw, INVALID_DECISION);
    requiredString(item.get("requirementId"), INVALID_DECISION);
    if (!Set.of("APPROVED", "REJECTED").contains(item.get("outcome"))) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (actorId(item.get("actor")) == null) {
      throw new FinKoreException(INVALID_DECISION);
    }
    instant(item.get("decidedAt"), INVALID_DECISION);
    if (item.containsKey("expiresAt")) {
      instant(item.get("expiresAt"), INVALID_DECISION);
    }
    return copyMap(item, INVALID_DECISION);
  }

  private static DecisionSet normalizeDecisionSet(Object decisions) {
    if (decisions == null) {
      return new DecisionSet(List.of(), List.of());
    }
    if (decisions instanceof List<?> list) {
      return new DecisionSet(copyMapList(list, INVALID_DECISION), List.of());
    }
    if (decisions instanceof Map<?, ?> raw) {
      Map<String, Object> map = stringObjectMap(raw, INVALID_DECISION);
      Object history = map.getOrDefault("history", List.of());
      Object lifecycle = map.getOrDefault("lifecycle", List.of());
      return new DecisionSet(copyMapList(listValue(history, INVALID_DECISION), INVALID_DECISION), copyMapList(listValue(lifecycle, INVALID_DECISION), INVALID_DECISION));
    }
    throw new FinKoreException(INVALID_DECISION);
  }

  private static boolean decisionCurrent(
      Map<String, Object> requirement,
      Map<String, Object> decision,
      List<Map<String, Object>> lifecycle,
      Object currentSubjectFacts,
      Object relevantFactPaths,
      Object evaluatedAt) {
    try {
      validateDecision(requirement, decision);
    } catch (FinKoreException error) {
      return false;
    }
    Map<String, Object> key = decisionKey(decision);
    for (Map<String, Object> item : lifecycle) {
      Object type = item.get("type");
      if (("WITHDRAWN".equals(type) || "DECISION_SUPERSEDED".equals(type)) && key.equals(item.get("target"))) {
        return false;
      }
      if ("REQUIREMENT_SUPERSEDED".equals(type) && Objects.equals(item.get("targetRequirementId"), requirement.get("id"))) {
        return false;
      }
    }
    if (Boolean.FALSE.equals(decision.get("effective")) || expired(decision, evaluatedAt)) {
      return false;
    }
    return relevantFactPaths == null || factsMatch(decision.get("subjectFacts"), currentSubjectFacts, relevantFactPaths);
  }

  private static boolean expired(Map<String, Object> decision, Object evaluatedAt) {
    if (!decision.containsKey("expiresAt")) {
      return false;
    }
    if (evaluatedAt == null) {
      throw new FinKoreException(INVALID_CONTEXT);
    }
    return !instant(evaluatedAt, INVALID_CONTEXT).isBefore(instant(decision.get("expiresAt"), INVALID_CONTEXT));
  }

  private static boolean factsMatch(Object decisionFacts, Object currentFacts, Object paths) {
    List<String> pathList = stringList(paths, INVALID_DECISION);
    for (String factPath : pathList) {
      Object left = path(decisionFacts, factPath);
      Object right = path(currentFacts, factPath);
      if (left == MISSING || right == MISSING || !Objects.equals(left, right)) {
        return false;
      }
    }
    return true;
  }

  private static Object path(Object value, String path) {
    Object current = value;
    for (String part : path.split("\\.")) {
      if (!(current instanceof Map<?, ?> map) || !map.containsKey(part)) {
        return MISSING;
      }
      current = map.get(part);
    }
    return current;
  }

  private static Map<String, Object> decisionKey(Map<String, Object> decision) {
    String actorId = actorId(decision.get("actor"));
    if (actorId == null) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> key = new LinkedHashMap<>();
    key.put("requirementId", requiredString(decision.get("requirementId"), INVALID_DECISION));
    key.put("actorId", actorId);
    key.put("decidedAt", requiredString(decision.get("decidedAt"), INVALID_DECISION));
    return key;
  }

  private static Map<String, Object> findDecision(List<Map<String, Object>> history, Map<String, Object> target) {
    for (Map<String, Object> decision : history) {
      if (decisionKey(decision).equals(target)) {
        return decision;
      }
    }
    return null;
  }

  private static boolean lifecycleContains(List<Map<String, Object>> lifecycle, String type, Map<String, Object> target) {
    for (Map<String, Object> item : lifecycle) {
      if (type.equals(item.get("type")) && target.equals(item.get("target"))) {
        return true;
      }
    }
    return false;
  }

  private static Map<String, Object> lifecycle(Object value, String type, boolean successor) {
    if (!(value instanceof Map<?, ?> raw) || !(raw.get("target") instanceof Map<?, ?>)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> source = stringObjectMap(raw, INVALID_DECISION);
    instant(source.get("recordedAt"), INVALID_DECISION);
    if (successor && !(source.get("successor") instanceof Map<?, ?>)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> event = new LinkedHashMap<>();
    event.put("type", type);
    event.putAll(copyMap(source, INVALID_DECISION));
    return event;
  }

  private static Map<String, Map<String, Object>> validateCompositionStructure(Object composition) {
    if (!(composition instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    Map<String, Object> definition = stringObjectMap(raw, INVALID_CHAIN);
    Object rawGroups = definition.get("groups");
    if (!(rawGroups instanceof List<?> groupList) || definition.containsKey("rootGroup") == definition.containsKey("stages")) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    Map<String, Map<String, Object>> groups = new LinkedHashMap<>();
    for (Object groupObject : groupList) {
      if (!(groupObject instanceof Map<?, ?> groupRaw)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      Map<String, Object> group = stringObjectMap(groupRaw, INVALID_CHAIN);
      String id = requiredString(group.get("id"), INVALID_CHAIN);
      if (groups.containsKey(id) || !Set.of("ALL_OF", "ANY_OF", "N_OF_M").contains(group.get("kind"))) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      validateMembers(group);
      groups.put(id, group);
    }
    List<String> roots = new ArrayList<>();
    if (definition.containsKey("rootGroup")) {
      roots.add(requiredString(definition.get("rootGroup"), INVALID_CHAIN));
    } else {
      List<Object> stages = listValue(definition.get("stages"), INVALID_CHAIN);
      if (stages.isEmpty()) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      for (Object stageObject : stages) {
        if (!(stageObject instanceof Map<?, ?> stageRaw)) {
          throw new FinKoreException(INVALID_CHAIN);
        }
        Map<String, Object> stage = stringObjectMap(stageRaw, INVALID_CHAIN);
        List<String> stageGroups = stringList(stage.get("groups"), INVALID_CHAIN);
        if (stageGroups.isEmpty()) {
          throw new FinKoreException(INVALID_CHAIN);
        }
        roots.addAll(stageGroups);
      }
    }
    for (String root : roots) {
      checkGroup(root, groups, 1, List.of());
    }
    return groups;
  }

  private static void validateMembers(Map<String, Object> group) {
    List<Object> members = listValue(group.get("members"), INVALID_CHAIN);
    if (members.isEmpty()) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    Set<String> memberIds = new HashSet<>();
    Set<String> voterIds = new HashSet<>();
    for (Object memberObject : members) {
      if (!(memberObject instanceof Map<?, ?> memberRaw)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      Map<String, Object> member = stringObjectMap(memberRaw, INVALID_CHAIN);
      String id = requiredString(member.get("id"), INVALID_CHAIN);
      if (!memberIds.add(id)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      if ("N_OF_M".equals(group.get("kind"))) {
        if (!"requirement".equals(member.get("type")) || !opaque(member.get("requirementId"))) {
          throw new FinKoreException(INVALID_CHAIN);
        }
        String voterId = actorId(member.get("voter"));
        if (voterId == null || !voterIds.add(voterId)) {
          throw new FinKoreException(INVALID_CHAIN);
        }
      } else if ("requirement".equals(member.get("type"))) {
        requiredString(member.get("requirementId"), INVALID_CHAIN);
      } else if ("group".equals(member.get("type"))) {
        requiredString(member.get("groupId"), INVALID_CHAIN);
      } else {
        throw new FinKoreException(INVALID_CHAIN);
      }
    }
    if ("N_OF_M".equals(group.get("kind"))) {
      int threshold = intValue(group.get("threshold"), INVALID_CHAIN);
      if (threshold <= 0 || threshold > members.size()) {
        throw new FinKoreException(INVALID_CHAIN);
      }
    }
  }

  private static void checkGroup(String groupId, Map<String, Map<String, Object>> groups, int depth, List<String> path) {
    if (!groups.containsKey(groupId) || path.contains(groupId) || depth > 4) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    for (Object memberObject : listValue(groups.get(groupId).get("members"), INVALID_CHAIN)) {
      @SuppressWarnings("unchecked")
      Map<String, Object> member = (Map<String, Object>) memberObject;
      if ("group".equals(member.get("type"))) {
        List<String> next = new ArrayList<>(path);
        next.add(groupId);
        checkGroup((String) member.get("groupId"), groups, depth + 1, next);
      }
    }
  }

  private static Map<String, Map<String, Object>> validateCompositionRequirements(Object requirements, Object context) {
    if (!(requirements instanceof List<?> list)) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    Map<String, Map<String, Object>> reqs = new LinkedHashMap<>();
    boolean unresolved = false;
    boolean invalidContext = false;
    boolean invalidState = false;
    for (Object item : list) {
      if (!(item instanceof Map<?, ?> raw)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      Map<String, Object> requirement = stringObjectMap(raw, INVALID_CHAIN);
      String id = requiredString(requirement.get("id"), INVALID_CHAIN);
      if (reqs.containsKey(id)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      Object applicability = requirement.getOrDefault("applicability", "APPLICABLE");
      if ("UNRESOLVED".equals(applicability)) {
        unresolved = true;
      } else if (!Set.of("APPLICABLE", "NOT_APPLICABLE").contains(applicability)) {
        invalidState = true;
      }
      if (Boolean.TRUE.equals(requirement.get("requiresEvaluationContext"))
          && (!(context instanceof Map<?, ?> contextMap) || !contextMap.containsKey("evaluatedAt"))) {
        invalidContext = true;
      }
      if (requirement.containsKey("state") && !Set.of("APPROVED", "REJECTED", "PENDING").contains(requirement.get("state"))) {
        invalidState = true;
      }
      reqs.put(id, requirement);
    }
    if (unresolved) {
      throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    if (invalidContext) {
      throw new FinKoreException(INVALID_CONTEXT);
    }
    if (invalidState) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    return reqs;
  }

  private static void validateCompositionEvidence(Map<String, Map<String, Object>> requirements, List<Map<String, Object>> decisions) {
    for (Map<String, Object> decision : decisions) {
      if (!opaque(decision.get("requirementId")) || !requirements.containsKey(decision.get("requirementId"))) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      if (actorId(decision.get("actor")) == null || !Set.of("APPROVED", "REJECTED").contains(decision.get("outcome"))) {
        throw new FinKoreException(INVALID_CHAIN);
      }
    }
  }

  private static GroupResult evaluateGroup(
      String groupId,
      Map<String, Map<String, Object>> groups,
      Map<String, Map<String, Object>> requirements,
      List<Map<String, Object>> decisions) {
    Map<String, Object> group = groups.get(groupId);
    List<GroupResult> results = new ArrayList<>();
    for (Object memberObject : listValue(group.get("members"), INVALID_CHAIN)) {
      @SuppressWarnings("unchecked")
      Map<String, Object> member = (Map<String, Object>) memberObject;
      results.add(evaluateMember(member, group, groups, requirements, decisions));
    }
    List<GroupResult> applicable = results.stream().filter(GroupResult::applicable).toList();
    if (applicable.isEmpty()) {
      return new GroupResult("APPROVED", false, List.of());
    }
    if ("ALL_OF".equals(group.get("kind"))) {
      if (applicable.stream().anyMatch(result -> "REJECTED".equals(result.outcome()))) {
        return new GroupResult("REJECTED", true, List.of());
      }
      if (applicable.stream().allMatch(result -> "APPROVED".equals(result.outcome()))) {
        return new GroupResult("APPROVED", true, List.of());
      }
      return new GroupResult("PENDING", true, pendingActionables(applicable));
    }
    if ("ANY_OF".equals(group.get("kind"))) {
      if (applicable.stream().anyMatch(result -> "APPROVED".equals(result.outcome()))) {
        return new GroupResult("APPROVED", true, List.of());
      }
      if (applicable.stream().allMatch(result -> "REJECTED".equals(result.outcome()))) {
        return new GroupResult("REJECTED", true, List.of());
      }
      return new GroupResult("PENDING", true, pendingActionables(applicable));
    }
    int approvals = (int) applicable.stream().filter(result -> "APPROVED".equals(result.outcome())).count();
    List<GroupResult> pending = applicable.stream().filter(result -> "PENDING".equals(result.outcome())).toList();
    int threshold = intValue(group.get("threshold"), INVALID_CHAIN);
    if (approvals >= threshold) {
      return new GroupResult("APPROVED", true, List.of());
    }
    if (approvals + pending.size() < threshold) {
      return new GroupResult("REJECTED", true, List.of());
    }
    return new GroupResult("PENDING", true, pendingActionables(pending));
  }

  private static GroupResult evaluateMember(
      Map<String, Object> member,
      Map<String, Object> group,
      Map<String, Map<String, Object>> groups,
      Map<String, Map<String, Object>> requirements,
      List<Map<String, Object>> decisions) {
    if ("group".equals(member.get("type"))) {
      return evaluateGroup((String) member.get("groupId"), groups, requirements, decisions);
    }
    Map<String, Object> requirement = requirements.get(member.get("requirementId"));
    if (requirement == null) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    if ("NOT_APPLICABLE".equals(requirement.getOrDefault("applicability", "APPLICABLE"))) {
      return new GroupResult("APPROVED", false, List.of());
    }
    String state = "N_OF_M".equals(group.get("kind")) ? quorumMemberState(requirement, member, decisions) : (String) requirement.getOrDefault("state", "PENDING");
    return new GroupResult(state, true, "PENDING".equals(state) ? List.of((String) requirement.get("id")) : List.of());
  }

  private static String quorumMemberState(Map<String, Object> requirement, Map<String, Object> member, List<Map<String, Object>> decisions) {
    @SuppressWarnings("unchecked")
    Map<String, Object> voter = (Map<String, Object>) member.get("voter");
    String voterId = (String) voter.get("id");
    boolean approved = false;
    boolean rejected = false;
    for (Map<String, Object> decision : decisions) {
      if (!Objects.equals(decision.get("requirementId"), requirement.get("id"))
          || !voterId.equals(actorId(decision.get("actor")))
          || Boolean.FALSE.equals(decision.get("effective"))) {
        continue;
      }
      if (requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_CHAIN).contains(voterId)) {
        continue;
      }
      approved = approved || Objects.equals(decision.get("outcome"), requirement.getOrDefault("approvedOutcome", "APPROVED"));
      rejected = rejected || Objects.equals(decision.get("outcome"), requirement.getOrDefault("rejectedOutcome", "REJECTED"));
    }
    if (approved && rejected) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    if (approved) {
      return "APPROVED";
    }
    return rejected ? "REJECTED" : "PENDING";
  }

  private static GroupResult combineStage(List<GroupResult> roots) {
    List<GroupResult> applicable = roots.stream().filter(GroupResult::applicable).toList();
    if (applicable.isEmpty()) {
      return new GroupResult("APPROVED", false, List.of());
    }
    if (applicable.stream().anyMatch(result -> "REJECTED".equals(result.outcome()))) {
      return new GroupResult("REJECTED", true, List.of());
    }
    if (applicable.stream().allMatch(result -> "APPROVED".equals(result.outcome()))) {
      return new GroupResult("APPROVED", true, List.of());
    }
    return new GroupResult("PENDING", true, pendingActionables(applicable));
  }

  private static List<String> pendingActionables(List<GroupResult> results) {
    List<String> values = new ArrayList<>();
    for (GroupResult result : results) {
      if ("PENDING".equals(result.outcome())) {
        values.addAll(result.actionables());
      }
    }
    return dedupe(values);
  }

  private static List<String> dedupe(List<String> values) {
    Set<String> seen = new HashSet<>();
    List<String> result = new ArrayList<>();
    for (String value : values) {
      if (seen.add(value)) {
        result.add(value);
      }
    }
    return result;
  }

  private static Map<String, Object> compositionResult(String outcome, List<String> actionables) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("outcome", outcome);
    result.put("actionableRequirements", List.copyOf(actionables));
    return result;
  }

  private static Map<String, Object> historyEnvelope(List<Map<String, Object>> history, List<Map<String, Object>> lifecycle) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("history", copyJson(history, INVALID_DECISION));
    if (!lifecycle.isEmpty()) {
      result.put("lifecycle", copyJson(lifecycle, INVALID_DECISION));
    }
    return result;
  }

  private static OffsetDateTime instant(Object value, String code) {
    if (!(value instanceof String text)
        || !text.contains("T")
        || !(text.endsWith("Z") || text.substring(Math.min(10, text.length())).contains("+") || text.substring(Math.min(10, text.length())).contains("-"))) {
      throw new FinKoreException(code);
    }
    try {
      return OffsetDateTime.parse(text.replace("Z", "+00:00"));
    } catch (DateTimeParseException error) {
      throw new FinKoreException(code);
    }
  }

  private static String actorId(Object actor) {
    if (!(actor instanceof Map<?, ?> map) || !opaque(map.get("id"))) {
      return null;
    }
    return (String) map.get("id");
  }

  private static boolean opaque(Object value) {
    return value instanceof String text && !text.isEmpty();
  }

  private static String requiredString(Object value, String code) {
    if (!opaque(value)) {
      throw new FinKoreException(code);
    }
    return (String) value;
  }

  private static List<String> stringList(Object value, String code) {
    if (!(value instanceof List<?> list)) {
      throw new FinKoreException(code);
    }
    List<String> result = new ArrayList<>();
    for (Object item : list) {
      result.add(requiredString(item, code));
    }
    return result;
  }

  private static List<Object> listValue(Object value, String code) {
    if (!(value instanceof List<?> list)) {
      throw new FinKoreException(code);
    }
    return new ArrayList<>(list);
  }

  private static int intValue(Object value, String code) {
    if (value instanceof BigInteger number) {
      try {
        return number.intValueExact();
      } catch (ArithmeticException error) {
        throw new FinKoreException(code);
      }
    }
    if (value instanceof Integer number) {
      return number;
    }
    throw new FinKoreException(code);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stringObjectMap(Map<?, ?> map, String code) {
    return (Map<String, Object>) copyJson(map, code);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> copyMap(Map<String, Object> map, String code) {
    return (Map<String, Object>) copyJson(map, code);
  }

  private static List<Map<String, Object>> copyMapList(List<?> list, String code) {
    List<Map<String, Object>> result = new ArrayList<>();
    for (Object item : list) {
      if (!(item instanceof Map<?, ?> map)) {
        throw new FinKoreException(code);
      }
      result.add(stringObjectMap(map, code));
    }
    return result;
  }

  private static List<Map<String, Object>> append(List<Map<String, Object>> list, Map<String, Object> value) {
    List<Map<String, Object>> result = new ArrayList<>();
    for (Map<String, Object> item : list) {
      result.add(copyMap(item, INVALID_DECISION));
    }
    result.add(copyMap(value, INVALID_DECISION));
    return result;
  }

  private static Object copyJson(Object value, String code) {
    if (value == null || value instanceof String || value instanceof Number || value instanceof Boolean) {
      return value;
    }
    if (value instanceof List<?> list) {
      List<Object> result = new ArrayList<>();
      for (Object item : list) {
        result.add(copyJson(item, code));
      }
      return result;
    }
    if (value instanceof Map<?, ?> map) {
      Map<String, Object> result = new LinkedHashMap<>();
      for (Map.Entry<?, ?> entry : map.entrySet()) {
        if (!(entry.getKey() instanceof String key)) {
          throw new FinKoreException(code);
        }
        result.put(key, copyJson(entry.getValue(), code));
      }
      return result;
    }
    throw new FinKoreException(code);
  }

  private record DecisionSet(List<Map<String, Object>> history, List<Map<String, Object>> lifecycle) {}

  private record GroupResult(String outcome, boolean applicable, List<String> actionables) {}

  private static final class Missing {
    private Missing() {}
  }
}
