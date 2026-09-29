// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigInteger;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.IdentityHashMap;
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
 * Native facts retain only exact Byte, Short, Integer, Long, BigInteger,
 * BigDecimal and finite Float/Double classes, plus null, Boolean, String,
 * lists and string-key maps. Mutable Number classes and numeric subclasses,
 * nonfinite values and cycles fail with INVALID_DECISION before retention.
 * Composition evidence uses INVALID_CHAIN after applicability and context.
 * Shared acyclic containers are captured independently without numeric coercion.
 * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-FACT-004</a>
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
  /**
   * Represents omitted current facts or selectors at concrete evaluation APIs.
   * Explicit null remains a supplied fact value and is invalid as a selector.
   * This marker is not a portable fact value or an empty-history substitute.
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-FACT-001</a>
   */
  public static final Object OMITTED = new Missing();

  private Approvals() {}

  /**
   * Reconstructs a defensive history after validating every Decision and lifecycle
   * event, including unique references and local-order supersession constraints.
   * Inputs are unchanged; failed reconstruction creates no committed history.
   *
   * @param history Decision list or envelope with optional lifecycle events
   * @return independently owned validated history envelope
   * @throws FinKoreException INVALID_DECISION for malformed historical evidence
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-014</a>
   */
  public static Map<String, Object> importHistory(Object history) {
    DecisionSet current = normalizeDecisionSet(history);
    return historyEnvelope(current.history(), current.lifecycle());
  }

  /**
   * Appends one Approval Decision, preserving all committed lifecycle evidence.
   * Inputs are unchanged on success or failure; the result owns its history data.
   * The concrete Requirement needs a subject type/id and distinct nonempty
   * eligibility. Every new or historical Decision needs explicit subjectFacts;
   * null is valid. Malformed declarations or evidence yield INVALID_DECISION,
   * while valid eligibility excluding the new Actor yields INELIGIBLE_ACTOR.
   * The proposed history is revalidated before return; a newly ambiguous retained
   * lifecycle reference yields INVALID_DECISION without changing either history.
   *
   * @param requirement portable Approval Requirement
   * @param decision portable Approval Decision
   * @param history existing decision history as a list or history envelope
   * @return history envelope containing the appended Decision
   * @throws FinKoreException with Approval portable error code
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-002</a>
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-007</a>
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-001/002/012/015</a>
   */
  public static Map<String, Object> recordDecision(Object requirement, Object decision, Object history) {
    Map<String, Object> req = validateRequirement(requirement);
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> recorded = validateDecision(req, decision);
    return importHistory(historyEnvelope(append(current.history(), recorded), current.lifecycle()));
  }

  /**
   * Legacy facts/expiration helper without concrete Requirement validation.
   * Use the five-argument overload for association and eligibility checks.
   * Missing subjectFacts yields INVALID_DECISION before effectiveness checks;
   * explicit null and other JSON fact representations remain valid.
   *
   * @param decision portable Approval Decision
   * @param currentSubjectFacts current subject facts
   * @param relevantFactPaths relevant fact paths; legacy null skips fact comparison
   * @param evaluatedAt optional explicit evaluation instant
   * @return {@code EFFECTIVE} or {@code INEFFECTIVE}
   * @throws FinKoreException with Approval portable error code
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-002</a>
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
   * Evaluates a concrete Decision against its Requirement, facts and expiration.
   * Validates subject, eligibility and association before effectiveness checks.
   * Without lifecycle history this makes no withdrawal or supersession claim.
   * Inputs remain unchanged. Selectors are validated before expiration filtering.
   * Equality is structural and type-sensitive; accepted numbers compare exactly
   * without decimal scale significance. The four-argument overload is a separate helper.
   *
   * @param requirement concrete Requirement with subject and eligibility
   * @param decision complete associated Decision
   * @param currentSubjectFacts current facts to compare
   * @param relevantFactPaths nonempty own-member paths, or {@link #OMITTED} for all facts; null is invalid
   * @param evaluatedAt explicit portable timestamp required for expiration
   * @return EFFECTIVE or INEFFECTIVE
   * @throws FinKoreException INVALID_DECISION for malformed/mismatched evidence,
   *     INELIGIBLE_ACTOR for excluded Actor, INVALID_CONTEXT for required time
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-009</a>
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-007</a>
   */
  public static String evaluateDecision(
      Object requirement, Object decision, Object currentSubjectFacts,
      Object relevantFactPaths, Object evaluatedAt) {
    Map<String, Object> item = validateDecision(validateRequirement(requirement), decision);
    validateComparison(currentSubjectFacts, relevantFactPaths, false);
    if (expired(item, evaluatedAt)) return "INEFFECTIVE";
    boolean matches = factsMatch(item.get("subjectFacts"), currentSubjectFacts, relevantFactPaths);
    return matches ? "EFFECTIVE" : "INEFFECTIVE";
  }

  /**
   * Evaluates an Approval Requirement from currently effective Decisions.
   * Validates the concrete subject, eligibility, and every historical Decision
   * and lifecycle relationships before filtering excluded evidence. Required
   * expiration context is checked for every considered Decision before outcomes.
   * See APPROVAL-VALIDITY-013 and APPROVAL-VALIDITY-014.
   * Missing association yields INVALID_DECISION; inputs remain unchanged.
   *
   * @param requirement portable Approval Requirement
   * @param decisions history list or history envelope
   * @param currentSubjectFacts supplied facts, including null; {@link #OMITTED} with omitted paths retains history-only evaluation
   * @param relevantFactPaths nonempty own-member paths, or {@link #OMITTED} for all supplied facts
   * @param evaluatedAt optional explicit evaluation instant
   * @return {@code APPROVED}, {@code REJECTED}, or {@code PENDING}
   * @throws FinKoreException with Approval portable error code
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-DECISION-001/002</a>
   * @see <a href="../../../../../../spec/approvals/requirements.md">APPROVAL-REQUIREMENT-002/003</a>
   */
  public static String evaluateRequirement(
      Object requirement,
      Object decisions,
      Object currentSubjectFacts,
      Object relevantFactPaths,
      Object evaluatedAt) {
    Map<String, Object> req = validateRequirement(requirement);
    DecisionSet decisionSet = normalizeDecisionSet(decisions);
    validateComparison(currentSubjectFacts, relevantFactPaths, true);
    for (Map<String, Object> decision : decisionSet.history()) {
      if (decisionConsidered(req, decision, decisionSet.lifecycle()) && decision.containsKey("expiresAt")) {
        instant(evaluatedAt, INVALID_CONTEXT);
      }
    }
    boolean approved = false;
    boolean rejected = false;
    for (Map<String, Object> decision : decisionSet.history()) {
      if (decisionCurrent(req, decision, decisionSet.lifecycle(), currentSubjectFacts, relevantFactPaths, evaluatedAt)) {
        approved = approved || Objects.equals(req.get("approvedOutcome"), decision.get("outcome"));
        rejected = rejected || Objects.equals(req.get("rejectedOutcome"), decision.get("outcome"));
      }
    }
    if (rejected) {
      return "REJECTED";
    }
    return approved ? "APPROVED" : "PENDING";
  }

  /**
   * Evaluates an Approval Condition from explicit facts and explicit result.
   * Validates a nonempty distinct required-path declaration before accepting any
   * result. Dot-separated paths traverse own map members, without array indexing.
   * Present null, false, and zero leaves count as facts. Inputs remain unchanged.
   *
   * @param condition portable condition
   * @param facts explicit fact map, or {@link #OMITTED} for absent evidence
   * @param result explicit result supplied by the composing domain
   * @return {@code APPLICABLE} or {@code NOT_APPLICABLE}
   * @throws FinKoreException INVALID_DECISION for malformed declarations/facts,
   *     CONDITION_UNRESOLVED for missing facts or explicit result
   * @see <a href="../../../../../../spec/approvals/conditions.md">APPROVAL-CONDITION-007</a>
   * @see <a href="../../../../../../spec/approvals/decisions.md">APPROVAL-FACT-002</a>
   */
  public static String evaluateCondition(Object condition, Object facts, Object result) {
    if (!(condition instanceof Map<?, ?> conditionMap)) throw new FinKoreException(INVALID_DECISION);
    requiredString(conditionMap.get("id"), INVALID_DECISION);
    requiredString(conditionMap.get("evaluation"), INVALID_DECISION);
    List<String> requiredFacts = validatePaths(conditionMap.get("requiredFacts"));
    if (new HashSet<>(requiredFacts).size() != requiredFacts.size()) throw new FinKoreException(INVALID_DECISION);
    if (facts == OMITTED) throw new FinKoreException(CONDITION_UNRESOLVED);
    if (!(facts instanceof Map<?, ?>)) throw new FinKoreException(INVALID_DECISION);
    for (String fact : requiredFacts) {
      if (path(facts, fact) == MISSING) throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    if (!"APPLICABLE".equals(result) && !"NOT_APPLICABLE".equals(result)) {
      throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    return (String) result;
  }

  /**
   * Evaluates a Core 0.9 release candidate all-required Approval Chain.
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
    if (!"REJECTED".equals(chainMap.get("rejectionOutcome"))) throw new FinKoreException(INVALID_CHAIN);
    Object mode = chainMap.get("mode");
    if (!"SEQUENTIAL".equals(mode) && !"UNORDERED".equals(mode)) {
      throw new FinKoreException(INVALID_CHAIN);
    }
    for (String requirement : requirements) {
      Object state = stateMap.get(requirement);
      if (!(state instanceof String) || !Set.of("APPROVED", "REJECTED", "PENDING", "NOT_APPLICABLE").contains(state)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
    }
    for (String requirement : requirements) {
      if ("REJECTED".equals(stateMap.get(requirement))) return "REJECTED";
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
   * The target must resolve exactly once and must not already be withdrawn or
   * superseded. Ancillary request {@code type} cannot change the operation.
   * Neither history is changed on failure.
   *
   * @param requirement portable Approval Requirement
   * @param history existing decision history
   * @param withdrawal withdrawal lifecycle evidence
   * @return history envelope preserving committed Decisions and appending lifecycle evidence
   * @throws FinKoreException with {@code FINKORE_APPROVAL_INVALID_DECISION} for an invalid target
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-004/005/012</a>
   */
  public static Map<String, Object> withdrawDecision(Object requirement, Object history, Object withdrawal) {
    Map<String, Object> req = validateRequirement(requirement);
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> event = validateLifecycle(lifecycle(withdrawal, "WITHDRAWN"), current.history(), current.lifecycle());
    if (!Objects.equals(((Map<?, ?>) event.get("target")).get("requirementId"), req.get("id"))) throw new FinKoreException(INVALID_DECISION);
    if (!((List<?>) req.get("eligibleActors")).contains(actorId(event.get("actor")))) throw new FinKoreException(INELIGIBLE_ACTOR);
    return historyEnvelope(current.history(), append(current.lifecycle(), event));
  }

  /**
   * Records lifecycle evidence superseding a committed Decision.
   * Preserves both histories and inputs; ancillary request {@code type} cannot
   * override Decision supersession.
   *
   * @param history existing decision history
   * @param supersession supersession lifecycle evidence
   * @return history envelope with appended lifecycle evidence
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-010/012</a>
   */
  public static Map<String, Object> supersedeDecision(Object history, Object supersession) {
    DecisionSet current = normalizeDecisionSet(history);
    Map<String, Object> event = validateLifecycle(lifecycle(supersession, "DECISION_SUPERSEDED"), current.history(), current.lifecycle());
    return historyEnvelope(current.history(), append(current.lifecycle(), event));
  }

  /**
   * Records lifecycle evidence superseding an Approval Requirement identity.
   * Preserves both histories and inputs; ancillary request {@code type} cannot
   * override Requirement supersession.
   *
   * @param history existing decision history
   * @param supersession requirement supersession evidence
   * @return history envelope with appended lifecycle evidence
   * @see <a href="../../../../../../spec/approvals/validity.md">APPROVAL-VALIDITY-011/012</a>
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
    lifecycle.putAll(copyMap(event, INVALID_DECISION));
    lifecycle.put("type", "REQUIREMENT_SUPERSEDED");
    validateLifecycle(lifecycle, current.history(), current.lifecycle());
    return historyEnvelope(current.history(), append(current.lifecycle(), lifecycle));
  }

  /**
   * Evaluates composition with no Decision observations, preserving native omission.
   * All declaration, applicability, context, and evidence checks still apply.
   *
   * @param composition portable composition definition
   * @param requirements current Requirement observations
   * @param context explicit evaluation context
   * @return composition outcome and ordered actionable Requirements
   * @throws FinKoreException with the portable composition validation error code
   * @see #evaluateComposition(Object, Object, Object, Object)
   * @see <a href="../../../../../../spec/approvals/composition.md">APPROVAL-COMPOSITION-024</a>
   */
  public static Map<String, Object> evaluateComposition(Object composition, Object requirements, Object context) {
    return evaluateComposition(composition, requirements, List.of(), context);
  }

  /**
   * Evaluates bounded Approval Composition groups, quorum, and stages.
   * Every supplied quorum Decision requires explicit Boolean {@code effective}
   * evidence. False is valid but cannot count as a vote. All evidence is validated
   * before any outcome, after structure, applicability, and required context.
   * Inputs are not mutated. All declared groups, including disconnected groups,
   * must have resolved references and be acyclic. Depth four applies to actual
   * root paths. Applicable quorum observations require explicit eligibility and
   * distinct outcome mappings; validation of unused members adds no actionables.
   *
   * @param composition portable composition definition
   * @param requirements current requirement observations
   * @param decisions explicit current-effective decision list; null is invalid
   * @param context explicit evaluation context
   * @return composition evaluation
   * @throws FinKoreException with {@code FINKORE_APPROVAL_INVALID_CHAIN} for invalid evidence
   * @see <a href="../../../../../../spec/approvals/composition.md">APPROVAL-COMPOSITION-024</a>
   * @see <a href="../../../../../../spec/approvals/errors.md">APPROVAL-ERROR-010</a>
   */
  public static Map<String, Object> evaluateComposition(
      Object composition,
      Object requirements,
      Object decisions,
      Object context) {
    Map<String, Map<String, Object>> groups = validateCompositionStructure(composition);
    @SuppressWarnings("unchecked")
    Map<String, Object> compositionMap = (Map<String, Object>) copyJson(composition, INVALID_CHAIN);
    Map<String, Map<String, Object>> reqs = validateCompositionRequirements(requirements, context, groups);
    if (!(decisions instanceof List<?> list)) throw new FinKoreException(INVALID_CHAIN);
    List<Map<String, Object>> decisionHistory = copyMapList(list, INVALID_CHAIN);
    validateCompositionEvidence(reqs, decisionHistory);
    for (Map<String, Object> group : groups.values()) {
      if (!"N_OF_M".equals(group.get("kind"))) continue;
      for (Object item : (List<?>) group.get("members")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> member = (Map<String, Object>) item;
        Map<String, Object> req = reqs.get(member.get("requirementId"));
        if ("APPLICABLE".equals(req.get("applicability"))) quorumMemberState(req, member, decisionHistory);
      }
    }
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
  static Map<String, Object> historyObservation(Object decisions) {
    DecisionSet set = normalizeDecisionSet(decisions);
    return historyEnvelope(set.history(), set.lifecycle());
  }

  private static Map<String, Object> validateRequirement(Object requirement) {
    if (!(requirement instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<String, Object> req = stringObjectMap(raw, INVALID_DECISION);
    requiredString(req.get("id"), INVALID_DECISION);
    if (!(req.get("subject") instanceof Map<?, ?> subject)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    requiredString(subject.get("type"), INVALID_DECISION);
    requiredString(subject.get("id"), INVALID_DECISION);
    List<String> eligible = stringList(req.get("eligibleActors"), INVALID_DECISION);
    if (eligible.isEmpty() || new HashSet<>(eligible).size() != eligible.size()) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (!(req.get("approvedOutcome") instanceof String) || !(req.get("rejectedOutcome") instanceof String)
        || !Set.of("APPROVED", "REJECTED").contains(req.get("approvedOutcome"))
        || !Set.of("APPROVED", "REJECTED").contains(req.get("rejectedOutcome"))
        || Objects.equals(req.get("approvedOutcome"), req.get("rejectedOutcome"))) {
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
    if (!"APPROVED".equals(item.get("outcome")) && !"REJECTED".equals(item.get("outcome"))) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (actorId(item.get("actor")) == null) {
      throw new FinKoreException(INVALID_DECISION);
    }
    Map<?, ?> actor = (Map<?, ?>) item.get("actor");
    if (actor.containsKey("type")) requiredString(actor.get("type"), INVALID_DECISION);
    if (!item.containsKey("subjectFacts")) {
      throw new FinKoreException(INVALID_DECISION);
    }
    instant(item.get("decidedAt"), INVALID_DECISION);
    if (item.containsKey("expiresAt")) {
      instant(item.get("expiresAt"), INVALID_DECISION);
    }
    return copyMap(item, INVALID_DECISION);
  }

  private static DecisionSet normalizeDecisionSet(Object decisions) {
    if (decisions instanceof List<?> list) {
      return new DecisionSet(validateHistory(list), List.of());
    }
    if (decisions instanceof Map<?, ?> raw) {
      Map<String, Object> map = stringObjectMap(raw, INVALID_DECISION);
      Object history = map.get("history");
      Object lifecycle = map.getOrDefault("lifecycle", List.of());
      List<Map<String, Object>> current = validateHistory(listValue(history, INVALID_DECISION));
      List<Map<String, Object>> validated = new ArrayList<>();
      for (Object event : listValue(lifecycle, INVALID_DECISION)) {
        validated.add(validateLifecycle(event, current, validated));
      }
      return new DecisionSet(current, validated);
    }
    throw new FinKoreException(INVALID_DECISION);
  }

  private static List<Map<String, Object>> validateHistory(List<?> history) {
    List<Map<String, Object>> validated = new ArrayList<>();
    for (Object decision : history) validated.add(validateDecisionShape(decision));
    return validated;
  }

  private static boolean decisionConsidered(
      Map<String, Object> requirement, Map<String, Object> decision, List<Map<String, Object>> lifecycle) {
    if (!Objects.equals(requirement.get("id"), decision.get("requirementId"))) return false;
    Map<String, Object> key = decisionKey(decision);
    for (Map<String, Object> item : lifecycle) {
      Object type = item.get("type");
      if (("WITHDRAWN".equals(type) || "DECISION_SUPERSEDED".equals(type)) && sameDecisionRef(key, item.get("target"))) {
        return false;
      }
      if ("REQUIREMENT_SUPERSEDED".equals(type) && Objects.equals(item.get("targetRequirementId"), requirement.get("id"))) {
        return false;
      }
    }
    return true;
  }

  private static boolean decisionCurrent(
      Map<String, Object> requirement,
      Map<String, Object> decision,
      List<Map<String, Object>> lifecycle,
      Object currentSubjectFacts,
      Object relevantFactPaths,
      Object evaluatedAt) {
    if (!decisionConsidered(requirement, decision, lifecycle)) return false;
    try {
      validateDecision(requirement, decision);
    } catch (FinKoreException error) {
      return false;
    }
    if (expired(decision, evaluatedAt) || Boolean.FALSE.equals(decision.get("effective"))) {
      return false;
    }
    return currentSubjectFacts == OMITTED || factsMatch(decision.get("subjectFacts"), currentSubjectFacts, relevantFactPaths);
  }

  private static boolean expired(Map<String, Object> decision, Object evaluatedAt) {
    if (!decision.containsKey("expiresAt")) {
      return false;
    }
    if (evaluatedAt == null) {
      throw new FinKoreException(INVALID_CONTEXT);
    }
    return instant(evaluatedAt, INVALID_CONTEXT).compareTo(instant(decision.get("expiresAt"), INVALID_CONTEXT)) >= 0;
  }

  private static List<String> validatePaths(Object paths) {
    List<String> result = stringList(paths, INVALID_DECISION);
    if (result.isEmpty()) throw new FinKoreException(INVALID_DECISION);
    for (String value : result) {
      for (String part : value.split("\\.", -1)) {
        if (part.isEmpty()) throw new FinKoreException(INVALID_DECISION);
      }
    }
    return result;
  }

  private static void validateComparison(Object facts, Object paths, boolean allowOmission) {
    if (paths != OMITTED) validatePaths(paths);
    if (facts != OMITTED) copyJson(facts, INVALID_DECISION);
    if (facts == OMITTED && (!allowOmission || paths != OMITTED)) throw new FinKoreException(INVALID_DECISION);
  }

  // Exact accepted numeric values, never via double or arbitrary Number coercion.
  private static BigDecimal factNumber(Object value) {
    Class<?> kind = value.getClass();
    if (kind == BigDecimal.class) return (BigDecimal) value;
    if (kind == BigInteger.class) return new BigDecimal((BigInteger) value);
    if (kind == Byte.class || kind == Short.class || kind == Integer.class || kind == Long.class) return BigDecimal.valueOf(((Number) value).longValue());
    if (kind == Float.class && Float.isFinite((Float) value)) return new BigDecimal(Float.toString((Float) value));
    if (kind == Double.class && Double.isFinite((Double) value)) return new BigDecimal(Double.toString((Double) value));
    throw new FinKoreException(INVALID_DECISION);
  }

  private static boolean factEqual(Object left, Object right) {
    if (left instanceof Number || right instanceof Number) {
      return left instanceof Number && right instanceof Number && factNumber(left).compareTo(factNumber(right)) == 0;
    }
    if (left instanceof Map<?, ?> || right instanceof Map<?, ?>) {
      if (!(left instanceof Map<?, ?> a) || !(right instanceof Map<?, ?> b) || !a.keySet().equals(b.keySet())) return false;
      for (Object key : a.keySet()) if (!factEqual(a.get(key), b.get(key))) return false;
      return true;
    }
    if (left instanceof List<?> || right instanceof List<?>) {
      if (!(left instanceof List<?> a) || !(right instanceof List<?> b) || a.size() != b.size()) return false;
      for (int i = 0; i < a.size(); i++) if (!factEqual(a.get(i), b.get(i))) return false;
      return true;
    }
    return Objects.equals(left, right);
  }

  private static boolean factsMatch(Object decisionFacts, Object currentFacts, Object paths) {
    if (paths == OMITTED) return factEqual(decisionFacts, currentFacts);
    List<String> pathList = validatePaths(paths);
    for (String factPath : pathList) {
      Object left = path(decisionFacts, factPath);
      Object right = path(currentFacts, factPath);
      if (left == MISSING || right == MISSING || !factEqual(left, right)) {
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

  private static boolean sameDecisionRef(Object left, Object right) {
    Map<?, ?> a = (Map<?, ?>) left;
    Map<?, ?> b = (Map<?, ?>) right;
    return Objects.equals(a.get("requirementId"), b.get("requirementId"))
        && Objects.equals(a.get("actorId"), b.get("actorId"))
        && instant(a.get("decidedAt"), INVALID_DECISION).compareTo(instant(b.get("decidedAt"), INVALID_DECISION)) == 0;
  }

  private static boolean lifecycleContains(List<Map<String, Object>> lifecycle, String type, Map<String, Object> target) {
    for (Map<String, Object> item : lifecycle) {
      if (type.equals(item.get("type")) && sameDecisionRef(target, item.get("target"))) {
        return true;
      }
    }
    return false;
  }

  private static Map<String, Object> lifecycle(Object value, String type) {
    if (!(value instanceof Map<?, ?> raw)) throw new FinKoreException(INVALID_DECISION);
    Map<String, Object> event = copyMap(stringObjectMap(raw, INVALID_DECISION), INVALID_DECISION);
    event.put("type", type);
    return event;
  }

  // Validate committed evidence in declared local order (APPROVAL-VALIDITY-014).
  private static Map<String, Object> validateLifecycle(
      Object value, List<Map<String, Object>> history, List<Map<String, Object>> previous) {
    if (!(value instanceof Map<?, ?> raw)) throw new FinKoreException(INVALID_DECISION);
    Map<String, Object> event = stringObjectMap(raw, INVALID_DECISION);
    Object kind = event.get("type");
    if (!"WITHDRAWN".equals(kind) && !"DECISION_SUPERSEDED".equals(kind) && !"REQUIREMENT_SUPERSEDED".equals(kind)) {
      throw new FinKoreException(INVALID_DECISION);
    }
    if (actorId(event.get("actor")) == null) throw new FinKoreException(INVALID_DECISION);
    Map<?, ?> actor = (Map<?, ?>) event.get("actor");
    if (actor.containsKey("type")) requiredString(actor.get("type"), INVALID_DECISION);
    instant(event.get("recordedAt"), INVALID_DECISION);
    if ("REQUIREMENT_SUPERSEDED".equals(kind)) {
      String target = requiredString(event.get("targetRequirementId"), INVALID_DECISION);
      String successor = requiredString(event.get("successorRequirementId"), INVALID_DECISION);
      if (event.containsKey("target") || event.containsKey("successor") || target.equals(successor)) throw new FinKoreException(INVALID_DECISION);
      if (previous.stream().anyMatch(item -> "REQUIREMENT_SUPERSEDED".equals(item.get("type")) && target.equals(item.get("targetRequirementId")))) {
        throw new FinKoreException(INVALID_DECISION);
      }
    } else {
      if (event.containsKey("targetRequirementId") || event.containsKey("successorRequirementId")
          || ("WITHDRAWN".equals(kind) && event.containsKey("successor"))) throw new FinKoreException(INVALID_DECISION);
      for (String field : "DECISION_SUPERSEDED".equals(kind) ? List.of("target", "successor") : List.of("target")) {
        if (!(event.get(field) instanceof Map<?, ?> ref)) throw new FinKoreException(INVALID_DECISION);
        requiredString(ref.get("requirementId"), INVALID_DECISION);
        requiredString(ref.get("actorId"), INVALID_DECISION);
        instant(ref.get("decidedAt"), INVALID_DECISION);
        if (history.stream().filter(decision -> sameDecisionRef(decisionKey(decision), ref)).count() != 1) throw new FinKoreException(INVALID_DECISION);
      }
      if ("DECISION_SUPERSEDED".equals(kind) && sameDecisionRef(event.get("target"), event.get("successor"))) throw new FinKoreException(INVALID_DECISION);
      @SuppressWarnings("unchecked")
      Map<String, Object> target = (Map<String, Object>) event.get("target");
      if (lifecycleContains(previous, "WITHDRAWN", target) || lifecycleContains(previous, "DECISION_SUPERSEDED", target)) throw new FinKoreException(INVALID_DECISION);
    }
    return copyMap(event, INVALID_DECISION);
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
      if (groups.containsKey(id) || !(group.get("kind") instanceof String) || !Set.of("ALL_OF", "ANY_OF", "N_OF_M").contains(group.get("kind"))) {
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
    // Check the whole graph without making disconnected declarations depth roots.
    Map<String, Integer> incoming = new LinkedHashMap<>();
    for (String id : groups.keySet()) incoming.put(id, 0);
    for (Map<String, Object> group : groups.values()) {
      for (Object item : (List<?>) group.get("members")) {
        Map<?, ?> member = (Map<?, ?>) item;
        if (!"group".equals(member.get("type"))) continue;
        String child = (String) member.get("groupId");
        if (!incoming.containsKey(child)) throw new FinKoreException(INVALID_CHAIN);
        incoming.put(child, incoming.get(child) + 1);
      }
    }
    List<String> pending = new ArrayList<>();
    incoming.forEach((id, count) -> { if (count == 0) pending.add(id); });
    int visited = 0;
    while (visited < pending.size()) {
      Map<String, Object> group = groups.get(pending.get(visited++));
      for (Object item : (List<?>) group.get("members")) {
        Map<?, ?> member = (Map<?, ?>) item;
        if (!"group".equals(member.get("type"))) continue;
        String child = (String) member.get("groupId");
        int count = incoming.get(child) - 1;
        incoming.put(child, count);
        if (count == 0) pending.add(child);
      }
    }
    if (visited != groups.size()) throw new FinKoreException(INVALID_CHAIN);
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

  private static Map<String, Map<String, Object>> validateCompositionRequirements(
      Object requirements, Object context, Map<String, Map<String, Object>> groups) {
    if (!(requirements instanceof List<?> list)) throw new FinKoreException(INVALID_CHAIN);
    Map<String, Map<String, Object>> reqs = new LinkedHashMap<>();
    for (Object item : list) {
      if (!(item instanceof Map<?, ?> raw)) throw new FinKoreException(INVALID_CHAIN);
      Map<String, Object> req = new LinkedHashMap<>();
      for (Map.Entry<?, ?> field : raw.entrySet()) {
        if (!(field.getKey() instanceof String key)) throw new FinKoreException(INVALID_CHAIN);
        req.put(key, field.getValue());
      }
      String id = requiredString(req.get("id"), INVALID_CHAIN);
      if (reqs.containsKey(id)) throw new FinKoreException(INVALID_CHAIN);
      if (req.containsKey("requiresEvaluationContext") && !(req.get("requiresEvaluationContext") instanceof Boolean)) throw new FinKoreException(INVALID_CHAIN);
      reqs.put(id, req);
    }
    Set<String> required = new HashSet<>();
    Set<String> stateRequired = new HashSet<>();
    Set<String> quorumRequired = new HashSet<>();
    for (Map<String, Object> group : groups.values()) {
      for (Object item : (List<?>) group.get("members")) {
        Map<?, ?> member = (Map<?, ?>) item;
        if ("requirement".equals(member.get("type"))) {
          String id = (String) member.get("requirementId");
          if (!reqs.containsKey(id)) throw new FinKoreException(INVALID_CHAIN);
          required.add(id);
          if (!"N_OF_M".equals(group.get("kind"))) stateRequired.add(id);
          else quorumRequired.add(id);
        }
      }
    }
    for (String id : required) {
      Object applicability = reqs.get(id).get("applicability");
      if (!"APPLICABLE".equals(applicability) && !"NOT_APPLICABLE".equals(applicability)) throw new FinKoreException(CONDITION_UNRESOLVED);
    }
    for (String id : required) {
      Map<String, Object> req = reqs.get(id);
      if ("APPLICABLE".equals(req.get("applicability")) && Boolean.TRUE.equals(req.get("requiresEvaluationContext"))) {
        instant(context instanceof Map<?, ?> map ? map.get("evaluatedAt") : null, INVALID_CONTEXT);
      }
    }
    for (Map<String, Object> req : reqs.values()) copyJson(req, INVALID_CHAIN);
    for (String id : required) {
      Map<String, Object> req = reqs.get(id);
      boolean needsState = "APPLICABLE".equals(req.get("applicability")) && stateRequired.contains(id);
      if (req.containsKey("state") || needsState) {
        Object state = req.get("state");
        if (!(state instanceof String) || !Set.of("APPROVED", "REJECTED", "PENDING").contains(state)) throw new FinKoreException(INVALID_CHAIN);
      }
      boolean needsQuorum = "APPLICABLE".equals(req.get("applicability")) && quorumRequired.contains(id);
      if (req.containsKey("eligibleActors") || needsQuorum) stringList(req.get("eligibleActors"), INVALID_CHAIN);
      for (String field : List.of("approvedOutcome", "rejectedOutcome")) {
        if (req.containsKey(field) || needsQuorum) {
          Object outcome = req.get(field);
          if (!(outcome instanceof String) || !Set.of("APPROVED", "REJECTED").contains(outcome)) throw new FinKoreException(INVALID_CHAIN);
        }
      }
      if (req.containsKey("approvedOutcome") && req.containsKey("rejectedOutcome") && Objects.equals(req.get("approvedOutcome"), req.get("rejectedOutcome"))) throw new FinKoreException(INVALID_CHAIN);
    }
    return reqs;
  }

  private static void validateCompositionEvidence(Map<String, Map<String, Object>> requirements, List<Map<String, Object>> decisions) {
    for (Map<String, Object> decision : decisions) {
      if (!opaque(decision.get("requirementId")) || !requirements.containsKey(decision.get("requirementId"))) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      if (!(decision.get("effective") instanceof Boolean)) {
        throw new FinKoreException(INVALID_CHAIN);
      }
      if (actorId(decision.get("actor")) == null || !(decision.get("outcome") instanceof String) || !Set.of("APPROVED", "REJECTED").contains(decision.get("outcome"))) {
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
    String state = "N_OF_M".equals(group.get("kind")) ? quorumMemberState(requirement, member, decisions) : (String) requirement.get("state");
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
      if (!stringList(requirement.get("eligibleActors"), INVALID_CHAIN).contains(voterId)) {
        continue;
      }
      approved = approved || Objects.equals(decision.get("outcome"), requirement.get("approvedOutcome"));
      rejected = rejected || Objects.equals(decision.get("outcome"), requirement.get("rejectedOutcome"));
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

  private static PortableTimestamp.InstantValue instant(Object value, String code) {
    try {
      return PortableTimestamp.parse(value);
    } catch (IllegalArgumentException error) {
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
    return copyJson(value, code, Collections.newSetFromMap(new IdentityHashMap<>()));
  }

  private static Object copyJson(Object value, String code, Set<Object> ancestors) {
    if ((value instanceof Double doubleValue && !Double.isFinite(doubleValue))
        || (value instanceof Float floatValue && !Float.isFinite(floatValue))) {
      throw new FinKoreException(code);
    }
    if (value == null || value instanceof String || value instanceof Boolean) {
      return value;
    }
    if (value instanceof Number) {
      // Exact classes: even BigInteger/BigDecimal subclasses may be mutable.
      Class<?> kind = value.getClass();
      if (kind != Byte.class && kind != Short.class && kind != Integer.class && kind != Long.class
          && kind != Float.class && kind != Double.class && kind != java.math.BigInteger.class && kind != java.math.BigDecimal.class) {
        throw new FinKoreException(code);
      }
      return value;
    }
    if (!ancestors.add(value)) {
      throw new FinKoreException(code);
    }
    try {
      if (value instanceof List<?> list) {
        List<Object> result = new ArrayList<>();
        for (Object item : list) {
          result.add(copyJson(item, code, ancestors));
        }
        return result;
      }
      if (value instanceof Map<?, ?> map) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
          if (!(entry.getKey() instanceof String key)) {
            throw new FinKoreException(code);
          }
          result.put(key, copyJson(entry.getValue(), code, ancestors));
        }
        return result;
      }
      throw new FinKoreException(code);
    } finally {
      ancestors.remove(value);
    }
  }

  private record DecisionSet(List<Map<String, Object>> history, List<Map<String, Object>> lifecycle) {}

  private record GroupResult(String outcome, boolean applicable, List<String> actionables) {}

  private static final class Missing {
    private Missing() {}
  }
}
