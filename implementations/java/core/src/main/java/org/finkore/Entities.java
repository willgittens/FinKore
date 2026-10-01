// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * FinKore Financial Entity behavior for identity, lifecycle, mutability,
 * validation, import, and bounded evolution relations.
 *
 * <p>Entity operations accept and return portable JSON-shaped observations.
 * They preserve caller-supplied opaque identity and delegate referenced
 * Workflow, Money, and Audit behavior to their domain implementations.
 *
 * Versioned observations carry their original Workflow binding on every call;
 * missing/malformed bindings use WORKFLOW_INVALID_INSTANCE and mismatches use
 * WORKFLOW_VERSION_MISMATCH. Stateless calls never infer historical binding.
 * All bounded validator declarations are checked before predicates: malformed
 * declarations use INVALID_MUTATION; rejected financial data uses VALIDATION_FAILED.
 * Every declared State requires an explicit field list (an empty list is valid).
 * Data must be an object satisfying its rules before and after each operation.
 * Application data owns its containers and accepts only immutable standard numeric
 * classes, preserving BigInteger/BigDecimal exactly. Unsupported values, numeric
 * subclasses, non-finite numbers and cycles use VALIDATION_FAILED for initial or
 * current data, and INVALID_MUTATION for proposed values after mutability checks.
 * Malformed current States use WORKFLOW_INVALID_INSTANCE; nonempty undeclared
 * States use WORKFLOW_INVALID_STATE.
 * @see "ENTITY-VALIDATION-011"
 * @see "ENTITY-MUTABILITY-008/009"
 * @see "ENTITY-VALIDATION-010"
 * @see "ENTITY-LIFECYCLE-007"
 * @see "WORKFLOW-VERSION-007/008/010"
 * @see "ENTITY-VALIDATION-009"
 * @see <a href="../../../../../../spec/entities/identity.md">ENTITY-IDENTITY-001</a>
 * @see <a href="../../../../../../spec/entities/lifecycle.md">ENTITY-LIFECYCLE-001</a>
 * @see <a href="../../../../../../spec/entities/evolution.md">ENTITY-EVOLUTION-001</a>
 */
public final class Entities {
  /** Portable error for malformed or conflicting Entity identity. */
  public static final String INVALID_IDENTITY = "FINKORE_ENTITY_INVALID_IDENTITY";
  /** Portable error for mutation of immutable Entity fields. */
  public static final String IMMUTABLE = "FINKORE_ENTITY_IMMUTABLE";
  /** Portable error for malformed or impermissible Entity mutation/evolution. */
  public static final String INVALID_MUTATION = "FINKORE_ENTITY_INVALID_MUTATION";
  /** Portable error for expected Entity state, revision, or conflict-version mismatch. */
  public static final String STATE_CONFLICT = "FINKORE_ENTITY_STATE_CONFLICT";
  /** Portable error for non-object/unsupported native Entity data or failed declared rules. */
  public static final String VALIDATION_FAILED = "FINKORE_ENTITY_VALIDATION_FAILED";

  private Entities() {}

  /**
   * Creates a Financial Entity in its referenced Workflow initial state with
   * the original binding. Returned observations own their data.
   *
   * @param definition portable Entity definition
   * @param entityId caller-supplied stable Entity identity
   * @param data initial Entity object; non-object/unsupported native data uses VALIDATION_FAILED
   * @return portable Entity observation
   */
  public static Map<String, Object> create(Object definition, Object entityId, Object data) {
    Map<String, Object> entityDefinition = validateDefinition(definition);
    if (!opaque(entityId)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    if (!(data instanceof Map<?, ?> dataMap)) throw new FinKoreException(VALIDATION_FAILED);
    Workflow.Definition workflow = Workflow.Definition.fromPortable(entityDefinition.get("workflow"));
    Map<String, Object> entity = new LinkedHashMap<>();
    entity.put("type", entityDefinition.get("type"));
    entity.put("id", entityId);
    Workflow.Instance instance = Workflow.create(workflow);
    entity.put("state", instance.currentState());
    if (instance.binding() != null) entity.put("binding", instance.binding());
    entity.put("data", copyEntityValue(dataMap, VALIDATION_FAILED));
    validateEntityData(entityDefinition, entity);
    return copyMap(entity, INVALID_IDENTITY);
  }

  /**
   * Applies declared mutable data changes without mutating the supplied Entity
   * or changing its original Workflow binding. Empty changes use INVALID_MUTATION;
   * invalid original data cannot be repaired by overwriting it. Unsupported proposed
   * native values use INVALID_MUTATION after field permissions pass (ENTITY-VALIDATION-011).
   *
   * @param definition portable Entity definition
   * @param entity current Entity observation
   * @param changes shallow data changes keyed by declared field path
   * @return mutated Entity observation
   */
  public static Map<String, Object> mutate(Object definition, Object entity, Object changes) {
    Map<String, Object> entityDefinition = validateDefinition(definition);
    Map<String, Object> current = validateEntity(entityDefinition, entity);
    if (!(changes instanceof Map<?, ?> rawChanges) || rawChanges.isEmpty()) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    Map<String, Object> changeMap = shallowMap(rawChanges, INVALID_MUTATION);
    for (String path : changeMap.keySet()) {
      if (Set.of("type", "id", "state").contains(path)) {
        throw new FinKoreException(IMMUTABLE);
      }
    }
    Set<String> mutable = mutableFields(entityDefinition, (String) current.get("state"));
    for (String path : changeMap.keySet()) {
      if (!mutable.contains(path)) {
        throw new FinKoreException(IMMUTABLE);
      }
    }
    Map<String, Object> result = copyMap(current, INVALID_IDENTITY);
    @SuppressWarnings("unchecked")
    Map<String, Object> resultData = (Map<String, Object>) result.get("data");
    resultData.putAll(copyEntityMap(changeMap, INVALID_MUTATION));
    validateEntityData(entityDefinition, result);
    return result;
  }

  /**
   * Transitions an Entity through the referenced Workflow without changing its
   * identity, data, or original Workflow binding.
   *
   * @param definition portable Entity definition
   * @param entity current Entity observation
   * @param target requested target state
   * @return transitioned Entity observation
   */
  public static Map<String, Object> transition(Object definition, Object entity, Object target) {
    Map<String, Object> entityDefinition = validateDefinition(definition);
    Map<String, Object> current = validateEntity(entityDefinition, entity);
    Workflow.Definition workflow = Workflow.Definition.fromPortable(entityDefinition.get("workflow"));
    Workflow.Instance transitioned = Workflow.transition(
        workflow,
        workflowInstance(current),
        target,
        null);
    Map<String, Object> result = copyMap(current, INVALID_IDENTITY);
    result.put("state", transitioned.currentState());
    validateEntityData(entityDefinition, result);
    return result;
  }

  /**
   * Validates the complete imported Entity observation and preserves its source
   * mapping, original Workflow binding, revisions, and conflict-version context.
   * The bounded API rejects equal current-revision/conflict tokens with
   * INVALID_IDENTITY; it has no shared-meaning declaration mechanism.
   * Omitted expectations impose no check. Supplied null or nonmatching expected
   * State/revision/conflict tokens use STATE_CONFLICT after identities validate.
   * Missing observed revision/conflict tokens cannot match an expectation.
   * Failure leaves the supplied observation unchanged.
   * Complete mapping-only evidence is accepted without synthesizing Source
   * Identity. Supplied Source Identity must be complete and match its mapping;
   * null or malformed values fail with INVALID_IDENTITY.
   *
   * @param definition portable Entity definition
   * @param importValue import request observation
   * @return portable import result, always including historicalRevisions; an
   *     empty list when supplied history is omitted or empty (ENTITY-IMPORT-012)
   * @throws FinKoreException with {@link #INVALID_IDENTITY} for invalid supplied
   *     source or mapping identity, {@link #STATE_CONFLICT} for mismatched
   *     expectations, or {@link #VALIDATION_FAILED} when native data is unsupported
   *     or a declared validator rejects the complete imported Entity
   * @see <a href="../../../../../../spec/entities/import.md">ENTITY-IMPORT-002</a>
   * @see <a href="../../../../../../spec/entities/import.md">ENTITY-IMPORT-008</a>
   * @see <a href="../../../../../../spec/entities/import.md">ENTITY-IMPORT-011</a>
   * @see <a href="../../../../../../spec/entities/revisions.md">ENTITY-REVISION-007</a>
   */
  public static Map<String, Object> importEntity(Object definition, Object importValue) {
    Map<String, Object> entityDefinition = validateDefinition(definition);
    if (!(importValue instanceof Map<?, ?> rawImport)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> input = shallowMap(rawImport, INVALID_IDENTITY);
    Map<String, Object> entity = validateEntity(entityDefinition, input.get("entity"));
    Map<String, Object> mapping = null;
    if (input.containsKey("sourceIdentity")) {
      if (!(input.get("sourceIdentity") instanceof Map<?, ?> sourceIdentity)) {
        throw new FinKoreException(INVALID_IDENTITY);
      }
      requiredString(sourceIdentity.get("sourceSystem"), INVALID_IDENTITY);
      requiredString(sourceIdentity.get("sourceId"), INVALID_IDENTITY);
      mapping = identityMapping(input.get("identityMapping"), entity, input.get("sourceIdentity"));
    } else if (input.containsKey("identityMapping")) {
      mapping = identityMapping(input.get("identityMapping"), entity, null);
    }
    Map<String, Object> currentRevision = input.containsKey("currentRevision") ? revision(input.get("currentRevision"), entity, true) : null;
    List<Map<String, Object>> historical = new ArrayList<>();
    if (input.containsKey("historicalRevisions")) {
      for (Object item : listValue(input.get("historicalRevisions"), INVALID_IDENTITY)) {
        historical.add(revision(item, entity, false));
      }
    }
    List<Map<String, Object>> revisions = new ArrayList<>();
    if (currentRevision != null) {
      revisions.add(currentRevision);
    }
    revisions.addAll(historical);
    ensureUniqueRevisions(revisions);
    Object conflictVersion = input.get("conflictVersion");
    if (input.containsKey("conflictVersion") && !opaque(conflictVersion)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    if (currentRevision != null && currentRevision.get("revision").equals(conflictVersion)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    if (input.containsKey("expectedState") && !entity.get("state").equals(input.get("expectedState"))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    if (input.containsKey("expectedRevision")
        && (currentRevision == null || !currentRevision.get("revision").equals(input.get("expectedRevision")))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    if (input.containsKey("expectedConflictVersion") && (conflictVersion == null || !conflictVersion.equals(input.get("expectedConflictVersion")))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("entity", copyJson(entity, INVALID_IDENTITY));
    if (currentRevision != null) {
      result.put("currentRevision", currentRevision);
    }
    result.put("historicalRevisions", copyJson(historical, INVALID_IDENTITY));
    if (mapping != null) {
      result.put("identityMapping", mapping);
    }
    if (conflictVersion != null) {
      result.put("conflictVersion", conflictVersion);
    }
    return result;
  }

  /**
   * Records one Entity evolution relation and its required Audit evidence.
   * Validates complete source and related business observations and consistent
   * ordered history. Intrinsic Audit validation precedes correspondence checks.
   * Neither Entity nor either supplied history is mutated on success or failure.
   * Omitted source State/Revision expectations impose no check. Supplied null,
   * malformed, or unequal expectations fail with STATE_CONFLICT. Currentness
   * expectations must be Boolean; malformed values use INVALID_MUTATION.
   * The bounded reference policy rejects a second Reversal of a source Revision;
   * this is not a universal reversal restriction for every composing domain.
   *
   * @param kind evolution kind: CORRECTION, REVERSAL, VOID, or SUPERSESSION
   * @param definition portable Entity definition
   * @param input evolution request
   * @return portable evolution result
   * @throws FinKoreException with INVALID_MUTATION for contradictory history or
   *     invalid correspondence, STATE_CONFLICT for mismatched expectations,
   *     VALIDATION_FAILED for business validation, or the primary Audit code
   * @see <a href="../../../../../../spec/entities/evolution.md">ENTITY-EVOLUTION-023/025/033/034/035</a>
   * @see <a href="../../../../../../spec/entities/validation.md">ENTITY-VALIDATION-001/003</a>
   */
  public static Map<String, Object> evolve(String kind, Object definition, Map<String, Object> input) {
    if (kind == null || !Set.of("CORRECTION", "REVERSAL", "VOID", "SUPERSESSION").contains(kind)) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    List<Map<String, Object>> currentRelations = relations(input.getOrDefault("evolutionHistory", List.of()));
    Map<EvolutionKey, Boolean> observed = currentness(currentRelations);
    Map<String, Object> entityDefinition = validateDefinition(definition);
    Map<String, Object> source = validateEntity(entityDefinition, input.get("source"));
    String relatedKey = "SUPERSESSION".equals(kind) ? "successor" : "related";
    String revisionKey = "SUPERSESSION".equals(kind) ? "successorRevision" : "relatedRevision";
    Map<String, Object> related = "VOID".equals(kind) ? null : validateEntity(entityDefinition, input.get(relatedKey));
    String sourceRevision = opaqueRevision(input.get("sourceRevision"), source);
    String relatedRevision = related == null ? null : opaqueRevision(input.get(revisionKey), related);
    String relationId = requiredString(input.get("relationId"), INVALID_MUTATION);
    for (Map<String, Object> relation : currentRelations) {
      if (relationId.equals(relation.get("relationId"))) {
        throw new FinKoreException(INVALID_MUTATION);
      }
    }
    if (input.containsKey("expectedSourceState") && !source.get("state").equals(input.get("expectedSourceState"))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    if (input.containsKey("expectedSourceRevision") && !sourceRevision.equals(input.get("expectedSourceRevision"))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    String scope = "SUPERSESSION".equals(kind) ? requiredString(input.get("supersessionScope"), INVALID_MUTATION) : null;
    Map<String, Object> sourceReference = revisionReference(source, sourceRevision);
    boolean current = observed.getOrDefault(evolutionKey(sourceReference, scope), Boolean.TRUE);
    if (input.containsKey("expectedSourceCurrent") && !(input.get("expectedSourceCurrent") instanceof Boolean)) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    if (!Boolean.valueOf(current).equals(input.getOrDefault("expectedSourceCurrent", current))) {
      throw new FinKoreException(STATE_CONFLICT);
    }
    if (!Boolean.TRUE.equals(input.get("eligible"))) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    if ("REVERSAL".equals(kind) && currentRelations.stream().anyMatch(item -> "REVERSAL".equals(item.get("kind")) && sourceReference.equals(item.get("source")))) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    Audit.Log auditLog = Audit.Log.create(input.getOrDefault("auditHistory", List.of()));
    Map<String, Object> auditHistory = auditLog.append(input.get("auditEvent")).toPortable();
    Map<String, Object> relation = relation(kind, relationId, source, sourceRevision, related, relatedRevision, scope, auditEventId(input.get("auditEvent")));
    if ("CORRECTION".equals(kind) || "REVERSAL".equals(kind)) relation.put("sourceCurrent", current);
    validateEvolutionEvidence(input.get("auditEvent"), relation);
    Map<String, Object> nextHistory = importEvolutionHistory(historyEnvelope(append(currentRelations, relation)));

    Map<String, Object> result = new LinkedHashMap<>();
    result.put("source", copyJson(source, INVALID_IDENTITY));
    if (related != null) {
      result.put("related", copyJson(related, INVALID_IDENTITY));
    }
    result.put("relation", relation);
    result.put("evolutionHistory", nextHistory);
    result.put("auditHistory", auditHistory);
    result.put("auditEvent", copyJson(input.get("auditEvent"), INVALID_MUTATION));
    return result;
  }

  /**
   * Imports an ordered relations envelope with consistent post-step currentness.
   * Required Void and Supersession effects may change earlier observations;
   * unexplained changes or contradictory observations fail without mutating input.
   *
   * @param history existing relations envelope, or an empty list for empty history; null is invalid
   * @return a defensive history envelope
   * @throws FinKoreException with INVALID_MUTATION for contradictory history,
   *     or INVALID_IDENTITY for malformed reference identities
   * @see <a href="../../../../../../spec/entities/evolution.md">ENTITY-EVOLUTION-014/022/023/035</a>
   */
  public static Map<String, Object> importEvolutionHistory(Object history) {
    List<Map<String, Object>> imported = relations(history);
    currentness(imported);
    return historyEnvelope(imported);
  }

  private record EvolutionKey(String type, String id, String revision, String scope) {}

  private static EvolutionKey evolutionKey(Object reference, String scope) {
    if (!(reference instanceof Map<?, ?> value)) throw new FinKoreException(INVALID_IDENTITY);
    String type = requiredString(value.get("type"), INVALID_IDENTITY);
    String id = requiredString(value.get("id"), INVALID_IDENTITY);
    String revision = requiredString(value.get("revision"), INVALID_IDENTITY);
    if (id.equals(revision)) throw new FinKoreException(INVALID_IDENTITY);
    return new EvolutionKey(type, id, revision, scope);
  }

  // ENTITY-EVOLUTION-035: only declared effects explain a change between steps.
  private static Map<EvolutionKey, Boolean> currentness(List<Map<String, Object>> relations) {
    Map<EvolutionKey, Boolean> observed = new LinkedHashMap<>();
    Set<String> ids = new HashSet<>();
    for (Map<String, Object> relation : relations) {
      String kind = requiredString(relation.get("kind"), INVALID_MUTATION);
      if (!Set.of("CORRECTION", "REVERSAL", "VOID", "SUPERSESSION").contains(kind)) throw new FinKoreException(INVALID_MUTATION);
      String id = requiredString(relation.get("relationId"), INVALID_IDENTITY);
      requiredString(relation.get("auditEventId"), INVALID_IDENTITY);
      if (!ids.add(id)) throw new FinKoreException(INVALID_MUTATION);
      if ("SUPERSESSION".equals(kind) != relation.containsKey("supersessionScope")) throw new FinKoreException(INVALID_MUTATION);
      String scope = relation.containsKey("supersessionScope") ? requiredString(relation.get("supersessionScope"), INVALID_MUTATION) : null;
      EvolutionKey source = evolutionKey(relation.get("source"), scope);
      if (!(relation.get("sourceCurrent") instanceof Boolean sourceCurrent)
          || "VOID".equals(kind) == relation.containsKey("related")) throw new FinKoreException(INVALID_MUTATION);
      Map<EvolutionKey, Boolean> step = new LinkedHashMap<>();
      Map<EvolutionKey, Boolean> effects = new LinkedHashMap<>();
      step.put(source, sourceCurrent);
      if ("VOID".equals(kind) || "SUPERSESSION".equals(kind)) effects.put(source, false);
      if ("VOID".equals(kind)) {
        if (relation.containsKey("relatedCurrent")) throw new FinKoreException(INVALID_MUTATION);
      } else {
        EvolutionKey related = evolutionKey(relation.get("related"), scope);
        if (!(relation.get("relatedCurrent") instanceof Boolean relatedCurrent)
            || (step.containsKey(related) && !step.get(related).equals(relatedCurrent))) throw new FinKoreException(INVALID_MUTATION);
        step.put(related, relatedCurrent);
        if ("SUPERSESSION".equals(kind)) {
          if (effects.containsKey(related) && !Boolean.TRUE.equals(effects.get(related))) throw new FinKoreException(INVALID_MUTATION);
          effects.put(related, true);
        }
      }
      for (Map.Entry<EvolutionKey, Boolean> assertion : step.entrySet()) {
        EvolutionKey key = assertion.getKey();
        Boolean value = assertion.getValue();
        if (effects.containsKey(key) && !effects.get(key).equals(value)) throw new FinKoreException(INVALID_MUTATION);
        if (observed.containsKey(key) && !observed.get(key).equals(value) && !effects.containsKey(key)) throw new FinKoreException(INVALID_MUTATION);
        observed.put(key, value);
      }
    }
    return observed;
  }

  private static boolean matchesReference(Object value, Object expected) {
    if (!(value instanceof Map<?, ?> reference) || !(expected instanceof Map<?, ?> target)) return false;
    return target.get("type").equals(reference.get("type")) && target.get("id").equals(reference.get("id"))
        && target.get("revision").equals(reference.get("revision"));
  }

  private static void validateEvolutionEvidence(Object eventValue, Map<String, Object> relation) {
    if (!(eventValue instanceof Map<?, ?> event) || !(event.get("metadata") instanceof Map<?, ?> metadata)
        || !(metadata.get("entityEvolution") instanceof Map<?, ?> evidence)) throw new FinKoreException(INVALID_MUTATION);
    if (!relation.get("kind").equals(evidence.get("kind")) || !relation.get("relationId").equals(evidence.get("relationId"))
        || !matchesReference(evidence.get("source"), relation.get("source"))) throw new FinKoreException(INVALID_MUTATION);
    if (relation.containsKey("related") ? !matchesReference(evidence.get("related"), relation.get("related")) : evidence.containsKey("related")) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    if (relation.containsKey("supersessionScope") ? !relation.get("supersessionScope").equals(evidence.get("supersessionScope")) : evidence.containsKey("supersessionScope")) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    Map<?, ?> source = (Map<?, ?>) relation.get("source");
    if (!Map.of("type", source.get("type"), "id", source.get("id")).equals(event.get("entity"))) throw new FinKoreException(INVALID_MUTATION);
    String type = Map.of("CORRECTION", "CORRECTS", "REVERSAL", "REVERSES", "VOID", "VOIDS", "SUPERSESSION", "SUPERSEDES").get(relation.get("kind"));
    if (!(event.get("relationships") instanceof List<?> relationships)
        || relationships.stream().noneMatch(item -> item instanceof Map<?, ?> relationship && type.equals(relationship.get("type")))) {
      throw new FinKoreException(INVALID_MUTATION);
    }
  }

  /**
   * Computes validation findings for a candidate mutation. Used by adapters to
   * report safe diagnostics for failed validation without committing changes.
   * The complete proposed data includes both changed and retained fields.
   * Findings contain declared rule identities and paths, never field values.
   * Neither the source Entity nor the supplied changes are mutated.
   *
   * @param definition portable Entity definition
   * @param entity current Entity observation
   * @param changes proposed changes
   * @return findings in declaration order, or an empty list for a non-map change request
   * @throws FinKoreException when the definition/current Entity is invalid, or
   *     with INVALID_MUTATION when proposed native values are unsupported
   * @see "ENTITY-VALIDATION-011"
   * @see "ENTITY-VALIDATION-003"
   */
  public static List<Map<String, Object>> validationFindingsForMutation(Object definition, Object entity, Object changes) {
    Map<String, Object> entityDefinition = validateDefinition(definition);
    Map<String, Object> current = validateEntity(entityDefinition, entity);
    if (!(changes instanceof Map<?, ?> rawChanges) || rawChanges.isEmpty()) {
      return List.of();
    }
    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) current.get("data");
    data.putAll(copyEntityMap(rawChanges, INVALID_MUTATION));
    return validationFindings(entityDefinition, current);
  }

  /**
   * Builds portable evolution observations from an input request.
   *
   * @param input evolution request
   * @param includeSameIdentityRelated whether corrections should include a same-id related entity
   * @return observations for conformance failure-atomicity checks
   */
  static Map<String, Object> evolutionObservation(Map<String, Object> input, boolean includeSameIdentityRelated) {
    Map<String, Object> observations = new LinkedHashMap<>();
    observations.put("source", copyJson(input.get("source"), INVALID_IDENTITY));
    if (input.containsKey("related")
        && input.get("related") instanceof Map<?, ?> related
        && input.get("source") instanceof Map<?, ?> source
        && (includeSameIdentityRelated || !related.get("id").equals(source.get("id")))) {
      observations.put("related", copyJson(input.get("related"), INVALID_IDENTITY));
    }
    if (input.containsKey("successor")) {
      observations.put("related", copyJson(input.get("successor"), INVALID_IDENTITY));
    }
    observations.put("evolutionHistory", historyEnvelope(normalizedObservationRelations(input.get("evolutionHistory"))));
    observations.put("auditHistory", auditObservation(input.get("auditHistory")));
    return observations;
  }

  private static Map<String, Object> validateDefinition(Object definition) {
    if (!(definition instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> entityDefinition = stringObjectMap(raw, INVALID_IDENTITY);
    requiredString(entityDefinition.get("type"), INVALID_IDENTITY);
    requiredString(entityDefinition.get("identityScope"), INVALID_IDENTITY);
    Workflow.Definition workflow = Workflow.Definition.fromPortable(entityDefinition.get("workflow"));
    Object mutability = entityDefinition.get("mutability");
    if (!(mutability instanceof Map<?, ?> fieldsByState) || !fieldsByState.keySet().containsAll(workflow.states())) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    for (Map.Entry<?, ?> entry : fieldsByState.entrySet()) {
      requiredString(entry.getKey(), INVALID_MUTATION);
      stringList(entry.getValue(), INVALID_MUTATION);
    }
    Object validation = entityDefinition.getOrDefault("validation", List.of());
    if (!(validation instanceof List<?> rules)) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    for (Object candidate : rules) {
      if (!(candidate instanceof Map<?, ?> rule)
          || (!"positive-money".equals(rule.get("rule")) && !"money-not-greater-than".equals(rule.get("rule")))
          || !opaque(rule.get("id")) || !opaque(rule.get("path"))
          || ("money-not-greater-than".equals(rule.get("rule")) && !opaque(rule.get("otherPath")))) {
        throw new FinKoreException(INVALID_MUTATION);
      }
    }
    return copyMap(entityDefinition, INVALID_IDENTITY);
  }

  private static Map<String, Object> validateEntity(Map<String, Object> definition, Object entity) {
    if (!(entity instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> value = shallowMap(raw, INVALID_IDENTITY);
    if (!definition.get("type").equals(value.get("type")) || !opaque(value.get("id"))) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Workflow.Definition workflow = Workflow.Definition.fromPortable(definition.get("workflow"));
    if (!opaque(value.get("state"))) throw new FinKoreException(Workflow.INVALID_INSTANCE);
    Workflow.importInstance(workflow, workflowInstance(value));
    if (!(value.get("data") instanceof Map<?, ?>)) {
      throw new FinKoreException(VALIDATION_FAILED);
    }
    value.put("data", copyEntityValue(value.get("data"), VALIDATION_FAILED));
    Map<String, Object> result = copyMap(value, INVALID_IDENTITY);
    validateEntityData(definition, result);
    return result;
  }

  private static Workflow.Instance workflowInstance(Map<String, Object> entity) {
    Map<String, Object> observation = new LinkedHashMap<>();
    observation.put("currentState", entity.get("state"));
    if (entity.containsKey("binding")) observation.put("binding", entity.get("binding"));
    return Workflow.Instance.fromPortable(observation);
  }

  private static void validateEntityData(Map<String, Object> definition, Map<String, Object> entity) {
    List<Map<String, Object>> findings = validationFindings(definition, entity);
    if (!findings.isEmpty()) {
      throw new FinKoreException(VALIDATION_FAILED);
    }
  }

  private static List<Map<String, Object>> validationFindings(Map<String, Object> definition, Map<String, Object> entity) {
    List<Map<String, Object>> findings = new ArrayList<>();
    @SuppressWarnings("unchecked")
    Map<String, Object> data = (Map<String, Object>) entity.get("data");
    for (Object ruleObject : listValue(definition.getOrDefault("validation", List.of()), VALIDATION_FAILED)) {
      if (!(ruleObject instanceof Map<?, ?> rawRule)) {
        continue;
      }
      Map<String, Object> rule = stringObjectMap(rawRule, VALIDATION_FAILED);
      boolean crossField = "money-not-greater-than".equals(rule.get("rule"));
      if (!"positive-money".equals(rule.get("rule")) && !crossField) {
        continue;
      }
      Object path = rule.get("path");
      boolean invalid = true;
      if (path instanceof String key) {
        Object candidate = data.get(key);
        try {
          Money value = Money.fromPortable(candidate);
          if (crossField) {
            Money other = Money.fromPortable(data.get(rule.get("otherPath")));
            invalid = "GREATER".equals(value.compare(other));
          } else if (candidate instanceof Map<?, ?> moneyMap && moneyMap.get("amount") instanceof String amount) {
            invalid = new BigDecimal(amount).compareTo(BigDecimal.ZERO) <= 0;
          }
        } catch (RuntimeException error) {
          invalid = true;
        }
      }
      if (invalid) {
        Map<String, Object> finding = new LinkedHashMap<>();
        finding.put("rule", rule.get("id"));
        finding.put("path", rule.get("path"));
        findings.add(finding);
      }
    }
    return findings;
  }

  private static Set<String> mutableFields(Map<String, Object> definition, String state) {
    Object rawMutability = definition.getOrDefault("mutability", Map.of());
    if (!(rawMutability instanceof Map<?, ?> map)) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    Object rawFields = map.containsKey(state) ? map.get(state) : List.of();
    List<String> fields = stringList(rawFields, INVALID_MUTATION);
    return new HashSet<>(fields);
  }

  private static Map<String, Object> identityMapping(Object mapping, Map<String, Object> entity, Object sourceIdentity) {
    if (!(mapping instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> value = stringObjectMap(raw, INVALID_IDENTITY);
    requiredString(value.get("mappingId"), INVALID_IDENTITY);
    requiredString(value.get("sourceSystem"), INVALID_IDENTITY);
    requiredString(value.get("sourceId"), INVALID_IDENTITY);
    if (sourceIdentity != null) {
      if (!(sourceIdentity instanceof Map<?, ?> source)
          || !value.get("sourceSystem").equals(source.get("sourceSystem"))
          || !value.get("sourceId").equals(source.get("sourceId"))) {
        throw new FinKoreException(INVALID_IDENTITY);
      }
    }
    Map<String, Object> expectedEntity = new LinkedHashMap<>();
    expectedEntity.put("type", entity.get("type"));
    expectedEntity.put("id", entity.get("id"));
    if (!expectedEntity.equals(value.get("entity"))) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    return copyMap(value, INVALID_IDENTITY);
  }

  private static Map<String, Object> revision(Object value, Map<String, Object> entity, boolean current) {
    if (value instanceof String text) {
      if (text.isEmpty() || text.equals(entity.get("id"))) {
        throw new FinKoreException(INVALID_IDENTITY);
      }
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("type", entity.get("type"));
      result.put("id", entity.get("id"));
      result.put("revision", text);
      result.put("current", current);
      return result;
    }
    if (!(value instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> map = stringObjectMap(raw, INVALID_IDENTITY);
    if (!entity.get("type").equals(map.get("type"))
        || !entity.get("id").equals(map.get("id"))
        || !opaque(map.get("revision"))
        || map.get("revision").equals(entity.get("id"))
        || (map.containsKey("current") && !Boolean.valueOf(current).equals(map.get("current")))) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("type", map.get("type"));
    result.put("id", map.get("id"));
    result.put("revision", map.get("revision"));
    result.put("current", current);
    return result;
  }

  private static void ensureUniqueRevisions(List<Map<String, Object>> revisions) {
    Set<Object> seen = new HashSet<>();
    for (Map<String, Object> revision : revisions) {
      if (!seen.add(revision.get("revision"))) {
        throw new FinKoreException(INVALID_IDENTITY);
      }
    }
  }

  private static String opaqueRevision(Object value, Map<String, Object> entity) {
    if (!opaque(value) || value.equals(entity.get("id"))) {
      throw new FinKoreException(INVALID_IDENTITY);
    }
    return (String) value;
  }

  private static Map<String, Object> relation(
      String kind,
      String relationId,
      Map<String, Object> source,
      String sourceRevision,
      Map<String, Object> related,
      String relatedRevision,
      Object scope,
      String auditEventId) {
    Map<String, Object> relation = new LinkedHashMap<>();
    relation.put("relationId", relationId);
    relation.put("kind", kind);
    relation.put("source", revisionReference(source, sourceRevision));
    if (related != null) {
      relation.put("related", revisionReference(related, relatedRevision));
    }
    if ("SUPERSESSION".equals(kind)) {
      relation.put("supersessionScope", requiredString(scope, INVALID_MUTATION));
    }
    relation.put("sourceCurrent", !"VOID".equals(kind) && !"SUPERSESSION".equals(kind));
    if (related != null) {
      relation.put("relatedCurrent", Boolean.TRUE);
    }
    relation.put("auditEventId", auditEventId);
    return relation;
  }

  private static Map<String, Object> revisionReference(Map<String, Object> entity, String revision) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("type", entity.get("type"));
    result.put("id", entity.get("id"));
    result.put("revision", revision);
    return result;
  }

  private static String auditEventId(Object auditEvent) {
    if (!(auditEvent instanceof Map<?, ?> raw)) {
      throw new FinKoreException(INVALID_MUTATION);
    }
    return requiredString(raw.get("eventId"), INVALID_MUTATION);
  }

  private static List<Map<String, Object>> relations(Object history) {
    if (List.of().equals(history)) {
      return List.of();
    }
    if (history instanceof Map<?, ?> raw && raw.get("relations") instanceof List<?> list) {
      return copyMapList(list, INVALID_MUTATION);
    }
    throw new FinKoreException(INVALID_MUTATION);
  }

  private static List<Map<String, Object>> normalizedObservationRelations(Object history) {
    if (history == null) {
      return List.of();
    }
    if (history instanceof List<?> list) {
      return copyMapList(list, INVALID_MUTATION);
    }
    if (history instanceof Map<?, ?> raw && raw.get("relations") instanceof List<?> list) {
      return copyMapList(list, INVALID_MUTATION);
    }
    return List.of();
  }

  private static Map<String, Object> historyEnvelope(List<Map<String, Object>> relations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("relations", copyJson(relations, INVALID_MUTATION));
    return result;
  }

  private static Map<String, Object> auditObservation(Object history) {
    Map<String, Object> result = new LinkedHashMap<>();
    if (history instanceof List<?>) {
      result.put("history", copyJson(history, INVALID_MUTATION));
    } else if (history instanceof Map<?, ?> raw && raw.get("history") instanceof List<?>) {
      result.put("history", copyJson(raw.get("history"), INVALID_MUTATION));
    } else {
      result.put("history", List.of());
    }
    return result;
  }

  private static List<Map<String, Object>> append(List<Map<String, Object>> list, Map<String, Object> value) {
    List<Map<String, Object>> result = new ArrayList<>();
    for (Map<String, Object> item : list) {
      result.add(copyMap(item, INVALID_MUTATION));
    }
    result.add(copyMap(value, INVALID_MUTATION));
    return result;
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

  // Delay application-data traversal until its owning validation stage.
  private static Map<String, Object> shallowMap(Map<?, ?> value, String code) {
    Map<String, Object> result = new LinkedHashMap<>();
    for (Map.Entry<?, ?> entry : value.entrySet()) {
      if (!(entry.getKey() instanceof String key)) throw new FinKoreException(code);
      result.put(key, entry.getValue());
    }
    return result;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> copyEntityMap(Map<?, ?> value, String code) {
    return (Map<String, Object>) copyEntityValue(value, code);
  }

  private static Object copyEntityValue(Object value, String code) {
    return copyEntityValue(value, code, Collections.newSetFromMap(new IdentityHashMap<>()));
  }

  // ENTITY-VALIDATION-011: no arbitrary Number conversion or retained mutable aliases.
  private static Object copyEntityValue(Object value, String code, Set<Object> ancestors) {
    if (value == null || value instanceof String || value instanceof Boolean) return value;
    if (value instanceof Number) {
      Class<?> kind = value.getClass();
      if (kind == Byte.class || kind == Short.class || kind == Integer.class || kind == Long.class
          || kind == BigInteger.class || kind == BigDecimal.class
          || (kind == Float.class && Float.isFinite((Float) value))
          || (kind == Double.class && Double.isFinite((Double) value))) return value;
      throw new FinKoreException(code);
    }
    if (!ancestors.add(value)) throw new FinKoreException(code);
    try {
      if (value instanceof List<?> list) {
        List<Object> result = new ArrayList<>();
        for (Object item : list) result.add(copyEntityValue(item, code, ancestors));
        return result;
      }
      if (value instanceof Map<?, ?> map) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
          if (!(entry.getKey() instanceof String key)) throw new FinKoreException(code);
          result.put(key, copyEntityValue(entry.getValue(), code, ancestors));
        }
        return result;
      }
      throw new FinKoreException(code);
    } finally {
      ancestors.remove(value);
    }
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
}
