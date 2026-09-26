// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * FinKore Workflow behavior for lifecycle definitions, imports, and
 * transitions.
 *
 * <p>Workflow operations are deterministic, fact-based, and do not mutate input
 * definitions or instances.
 *
 * @see <a href="../../../../../../spec/workflow/states.md">WORKFLOW-STATES-001</a>
 * @see <a href="../../../../../../spec/workflow/transitions.md">WORKFLOW-TRANSITION-001</a>
 * @see <a href="../../../../../../spec/workflow/versioning.md">WORKFLOW-VERSION-001</a>
 */
public final class Workflow {
  /**
   * Omitted optional transition precondition. Unlike {@code null}, this value
   * skips the corresponding expected-State or expected-revision check.
   *
   * @see <a href="../../../../../../spec/workflow/conflicts.md">WORKFLOW-CONFLICT-001 and WORKFLOW-CONFLICT-004</a>
   */
  public static final Object OMITTED = new Object();
  /** Portable error for malformed Workflow definitions. */
  public static final String INVALID_DEFINITION = "FINKORE_WORKFLOW_INVALID_DEFINITION";
  /** Portable error for malformed Workflow instances. */
  public static final String INVALID_INSTANCE = "FINKORE_WORKFLOW_INVALID_INSTANCE";
  /** Portable error for undeclared or invalid states. */
  public static final String INVALID_STATE = "FINKORE_WORKFLOW_INVALID_STATE";
  /** Portable error for undeclared directed transitions. */
  public static final String INVALID_TRANSITION = "FINKORE_WORKFLOW_INVALID_TRANSITION";
  /** Portable error for rejected transition guards. */
  public static final String GUARD_REJECTED = "FINKORE_WORKFLOW_GUARD_REJECTED";
  /** Portable error for transition attempts from terminal states. */
  public static final String TERMINAL_STATE = "FINKORE_WORKFLOW_TERMINAL_STATE";
  /** Portable error for definition/instance binding mismatch. */
  public static final String VERSION_MISMATCH = "FINKORE_WORKFLOW_VERSION_MISMATCH";
  /** Portable error for expected state or revision conflicts. */
  public static final String STATE_CONFLICT = "FINKORE_WORKFLOW_STATE_CONFLICT";

  private Workflow() {}

  /**
   * Declared directed Workflow transition with optional fact guards.
   *
   * @param source declared source state
   * @param target declared target state
   * @param guards immutable guard observations
   * @see <a href="../../../../../../spec/workflow/transitions.md">WORKFLOW-TRANSITION-001</a>
   * @see <a href="../../../../../../spec/workflow/guards.md">WORKFLOW-GUARD-001</a>
   */
  public record Transition(String source, String target, List<Map<String, Object>> guards) {
    /**
     * Creates an immutable transition observation, deeply copying guard JSON.
     * Nested observations are unmodifiable; caller mutations cannot change the
     * retained predicate (WORKFLOW-VERSION-003).
     *
     * @param source declared source state
     * @param target declared target state
     * @param guards guard observations evaluated against explicit facts
     * @throws FinKoreException with {@link #INVALID_DEFINITION} for null endpoints or malformed guards
     */
    public Transition {
      if (source == null || target == null) throw new FinKoreException(INVALID_DEFINITION);
      guards = deepCopyMapList(guards);
    }

    /**
     * Evaluates every guard against supplied facts using presence-aware,
     * type-sensitive recursive JSON equality.
     *
     * @param facts explicit fact map for this transition request
     * @return {@code true} when every guard is satisfied
     */
    public boolean guardsPass(Map<String, Object> facts) {
      for (Map<String, Object> guard : guards) {
        if (!facts.containsKey(guard.get("fact")) || !jsonEquals(facts.get(guard.get("fact")), guard.get("equals"))) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * Immutable Workflow definition, optionally bound to an opaque definition
   * version identity.
   *
   * @param states declared unique state identifiers
   * @param initialState one declared initial state
   * @param terminalStates declared terminal states
   * @param transitions declared directed transitions
   * @param definitionIdentity optional opaque definition identity
   * @param definitionVersionIdentity optional opaque version identity
   * @see <a href="../../../../../../spec/workflow/states.md">WORKFLOW-STATES-002</a>
   * @see <a href="../../../../../../spec/workflow/versioning.md">WORKFLOW-VERSION-001</a>
   */
  public record Definition(
      List<String> states,
      String initialState,
      List<String> terminalStates,
      List<Transition> transitions,
      String definitionIdentity,
      String definitionVersionIdentity) {
    /**
     * Validates and owns an immutable Workflow definition before exposing it.
     * Native null/null identities declare an unversioned definition; partial or
     * empty version pairs are invalid. Parsed definitions use this same boundary.
     *
     * @param states declared state identifiers
     * @param initialState one initial state
     * @param terminalStates terminal states
     * @param transitions declared transitions
     * @param definitionIdentity optional opaque definition identity
     * @param definitionVersionIdentity optional opaque version identity
     * @throws FinKoreException with {@link #INVALID_DEFINITION} for malformed
     * declarations, undeclared endpoints/initial State, or outgoing terminal transitions
     * @see <a href="../../../../../../spec/workflow/states.md">WORKFLOW-STATES-001 and WORKFLOW-STATES-002</a>
     * @see <a href="../../../../../../spec/workflow/terminal-states.md">WORKFLOW-TERMINAL-002</a>
     */
    public Definition {
      if (stringList(states) == null || states.isEmpty() || new HashSet<>(states).size() != states.size()
          || initialState == null || !states.contains(initialState)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      if (stringList(terminalStates) == null || new HashSet<>(terminalStates).size() != terminalStates.size()
          || !states.containsAll(terminalStates)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      if (transitions == null) throw new FinKoreException(INVALID_DEFINITION);
      for (Transition transition : transitions) {
        if (transition == null || !states.contains(transition.source()) || !states.contains(transition.target())
            || terminalStates.contains(transition.source())) {
          throw new FinKoreException(INVALID_DEFINITION);
        }
      }
      if (definitionIdentity != null || definitionVersionIdentity != null) {
        if (!opaque(definitionIdentity) || !opaque(definitionVersionIdentity)) throw new FinKoreException(INVALID_DEFINITION);
      }
      states = List.copyOf(states);
      terminalStates = List.copyOf(terminalStates);
      transitions = List.copyOf(transitions);
    }

    /**
     * Parses and validates a portable Workflow definition.
     *
     * <p>The {@code DEFAULT} versionSequence selector validates the version
     * identity as a positive ASCII integer string (WORKFLOW-VERSION-006).
     * Without it, identities remain opaque. Guards retain independent,
     * unmodifiable JSON observations, including explicit null comparisons.
     *
     * @param value portable definition observation
     * @return validated definition
     * @throws FinKoreException with {@link #INVALID_DEFINITION}
     */
    public static Definition fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      List<String> states = stringList(map.get("states"));
      if (states == null || states.isEmpty() || new HashSet<>(states).size() != states.size()) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Set<String> stateSet = new HashSet<>(states);
      Object initial = map.get("initialState");
      if (!(initial instanceof String initialState) || !stateSet.contains(initialState) || map.containsKey("initialStates")) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Object rawTerminalStates = map.containsKey("terminalStates") ? map.get("terminalStates") : List.of();
      List<String> terminalStates = stringList(rawTerminalStates);
      if (terminalStates == null || new HashSet<>(terminalStates).size() != terminalStates.size()) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Set<String> terminalSet = new HashSet<>(terminalStates);
      if (!stateSet.containsAll(terminalSet)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Object definitionIdentity = map.get("definitionIdentity");
      Object versionIdentity = map.get("definitionVersionIdentity");
      if (map.containsKey("definitionIdentity") != map.containsKey("definitionVersionIdentity")) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      String identity = null;
      String version = null;
      if (map.containsKey("definitionIdentity")) {
        if (!opaque(definitionIdentity) || !opaque(versionIdentity)) {
          throw new FinKoreException(INVALID_DEFINITION);
        }
        identity = (String) definitionIdentity;
        version = (String) versionIdentity;
      }
      if (map.containsKey("versionSequence") && (!"DEFAULT".equals(map.get("versionSequence")) || !opaque(identity) || !versionSequenceValid(version))) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Object rawTransitions = map.containsKey("transitions") ? map.get("transitions") : List.of();
      if (!(rawTransitions instanceof List<?> transitionList)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      List<Transition> transitions = new ArrayList<>();
      for (Object transition : transitionList) {
        transitions.add(parseTransition(transition, stateSet, terminalSet));
      }
      return new Definition(states, initialState, terminalStates, transitions, identity, version);
    }

    /**
     * Returns whether this definition declares version binding.
     *
     * @return {@code true} when both definition and version identity exist
     */
    public boolean isVersioned() {
      return definitionIdentity != null;
    }

    /**
     * Returns the portable version binding for versioned definitions.
     *
     * @return binding map, or {@code null} for unversioned definitions
     */
    public Map<String, String> binding() {
      if (!isVersioned()) {
        return null;
      }
      Map<String, String> result = new LinkedHashMap<>();
      result.put("definitionIdentity", definitionIdentity);
      result.put("definitionVersionIdentity", definitionVersionIdentity);
      return result;
    }

    /**
     * Finds a declared transition.
     *
     * @param source current state
     * @param target requested target state
     * @return transition or {@code null} when undeclared
     */
    public Transition transition(String source, String target) {
      for (Transition transition : transitions) {
        if (transition.source().equals(source) && transition.target().equals(target)) {
          return transition;
        }
      }
      return null;
    }
  }

  /**
   * Immutable Workflow instance observation.
   *
   * @param currentState current lifecycle state
   * @param binding optional definition version binding
   * @param revision optional opaque instance revision
   * @see <a href="../../../../../../spec/workflow/import.md">WORKFLOW-IMPORT-004</a>
   */
  public record Instance(String currentState, Map<String, String> binding, String revision) {
    /**
     * Creates a structurally valid immutable Workflow instance. Native null
     * binding/revision means omission. State membership and matching the supplied
     * definition are checked by import/transition, in WORKFLOW-ERROR-007 order.
     *
     * @param currentState current lifecycle state
     * @param binding optional definition version binding
     * @param revision optional opaque revision
     * @throws FinKoreException with {@link #INVALID_INSTANCE} for malformed structure
     */
    public Instance {
      if (currentState == null || (revision != null && !opaque(revision))
          || (binding != null && parseBinding(binding) == null)) {
        throw new FinKoreException(INVALID_INSTANCE);
      }
      binding = binding == null ? null : Map.copyOf(binding);
    }

    /**
     * Parses a portable Workflow instance observation. Supplied null revision
     * or binding is malformed; omission remains valid where optional. Structural
     * validation precedes version matching (WORKFLOW-ERROR-005/007).
     *
     * @param value portable instance observation
     * @return parsed instance
     * @throws FinKoreException with {@link #INVALID_INSTANCE}
     */
    public static Instance fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map) || map.containsKey("currentStates")) {
        throw new FinKoreException(INVALID_INSTANCE);
      }
      Object currentState = map.get("currentState");
      if (!(currentState instanceof String state)) {
        throw new FinKoreException(INVALID_INSTANCE);
      }
      Object revision = map.get("revision");
      if (map.containsKey("revision") && !opaque(revision)) {
        throw new FinKoreException(INVALID_INSTANCE);
      }
      Object rawBinding = map.get("binding");
      Map<String, String> binding = null;
      if (map.containsKey("binding")) {
        binding = parseBinding(rawBinding);
        if (binding == null) {
          throw new FinKoreException(INVALID_INSTANCE);
        }
      }
      return new Instance(state, binding, (String) revision);
    }

    /**
     * Serializes this instance as a portable observation.
     *
     * @return portable Workflow instance
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("currentState", currentState);
      if (binding != null) {
        result.put("binding", new LinkedHashMap<>(binding));
      }
      if (revision != null) {
        result.put("revision", revision);
      }
      return result;
    }
  }

  /**
   * Creates an instance at the definition's initial state.
   *
   * @param definition Workflow definition
   * @return new Workflow instance
   * @see <a href="../../../../../../spec/workflow/states.md">WORKFLOW-STATES-003</a>
   */
  public static Instance create(Definition definition) {
    return new Instance(definition.initialState(), definition.binding(), null);
  }

  /**
   * Imports an existing instance after validating state and version binding.
   *
   * @param definition Workflow definition
   * @param instance instance observation to preserve
   * @return the supplied instance as an immutable observation
   * @throws FinKoreException with Workflow portable error code
   * @see <a href="../../../../../../spec/workflow/import.md">WORKFLOW-IMPORT-001</a>
   */
  public static Instance importInstance(Definition definition, Instance instance) {
    validateBinding(definition, instance);
    if (!definition.states().contains(instance.currentState())) {
      throw new FinKoreException(INVALID_STATE);
    }
    return instance;
  }

  /**
   * Applies a declared transition with both preconditions omitted.
   *
   * @param definition Workflow definition
   * @param instance current instance observation, preserved on success and failure
   * @param target requested target State
   * @param facts explicit facts for guard evaluation
   * @return new instance retaining the original binding and revision
   * @throws FinKoreException with the applicable Workflow portable error code
   * @see #transition(Definition, Instance, Object, Object, Object, Object)
   */
  public static Instance transition(Definition definition, Instance instance, Object target, Object facts) {
    return transition(definition, instance, target, facts, OMITTED, OMITTED);
  }

  /**
   * Applies a declared transition without mutating the supplied instance.
   *
   * <p>Explicit {@code null} is supplied input: null expected State is
   * {@link #INVALID_STATE}, null expected revision is {@link #STATE_CONFLICT}.
   * Definition/instance/version checks precede State validation, conflicts,
   * terminal State, declared Transition, then guards. Failure preserves State,
   * binding, and revision; success retains the original binding and revision.
   *
   * @param definition Workflow definition
   * @param instance current instance observation
   * @param target requested target state
   * @param facts explicit facts for guard evaluation
   * @param expectedCurrentState expected State, or {@link #OMITTED} to skip it
   * @param expectedRevision expected revision, or {@link #OMITTED} to skip it
   * @return new Workflow instance in the target state
   * @throws FinKoreException with Workflow portable error code
   * @see <a href="../../../../../../spec/workflow/transitions.md">WORKFLOW-TRANSITION-006</a>
   * @see <a href="../../../../../../spec/workflow/conflicts.md">WORKFLOW-CONFLICT-001</a>
   * @see <a href="../../../../../../spec/workflow/errors.md">WORKFLOW-ERROR-007</a>
   */
  public static Instance transition(
      Definition definition,
      Instance instance,
      Object target,
      Object facts,
      Object expectedCurrentState,
      Object expectedRevision) {
    validateBinding(definition, instance);
    if (!definition.states().contains(instance.currentState())) {
      throw new FinKoreException(INVALID_STATE);
    }
    if (!(target instanceof String targetState) || !definition.states().contains(targetState)) {
      throw new FinKoreException(INVALID_STATE);
    }
    if (expectedCurrentState != OMITTED) {
      if (!(expectedCurrentState instanceof String expected) || !definition.states().contains(expected)) {
        throw new FinKoreException(INVALID_STATE);
      }
      if (!expectedCurrentState.equals(instance.currentState())) {
        throw new FinKoreException(STATE_CONFLICT);
      }
    }
    if (expectedRevision != OMITTED) {
      if (!opaque(expectedRevision) || !expectedRevision.equals(instance.revision())) {
        throw new FinKoreException(STATE_CONFLICT);
      }
    }
    if (definition.terminalStates().contains(instance.currentState())) {
      throw new FinKoreException(TERMINAL_STATE);
    }
    Transition transition = definition.transition(instance.currentState(), targetState);
    if (transition == null) {
      throw new FinKoreException(INVALID_TRANSITION);
    }
    Map<String, Object> factMap = facts instanceof Map<?, ?> map ? stringObjectMap(map) : Map.of();
    if (!transition.guardsPass(factMap)) {
      throw new FinKoreException(GUARD_REJECTED);
    }
    return new Instance(targetState, instance.binding(), instance.revision());
  }

  private static Transition parseTransition(Object value, Set<String> states, Set<String> terminalStates) {
    if (!(value instanceof Map<?, ?> map)) {
      throw new FinKoreException(INVALID_DEFINITION);
    }
    Object source = map.get("source");
    Object target = map.get("target");
    if (!(source instanceof String sourceState) || !(target instanceof String targetState) || !states.contains(sourceState) || !states.contains(targetState)) {
      throw new FinKoreException(INVALID_DEFINITION);
    }
    if (terminalStates.contains(sourceState)) {
      throw new FinKoreException(INVALID_DEFINITION);
    }
    Object guards = map.containsKey("guards") ? map.get("guards") : List.of();
    if (map.containsKey("guard")) {
      if (!List.of().equals(guards)) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      guards = Collections.singletonList(map.get("guard"));
    }
    if (!(guards instanceof List<?> guardList)) {
      throw new FinKoreException(INVALID_DEFINITION);
    }
    List<Map<String, Object>> parsedGuards = new ArrayList<>();
    for (Object guard : guardList) {
      if (!(guard instanceof Map<?, ?> guardMap) || !(guardMap.get("fact") instanceof String) || !guardMap.containsKey("equals")) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      parsedGuards.add(stringObjectMap(guardMap));
    }
    return new Transition(sourceState, targetState, parsedGuards);
  }

  private static void validateBinding(Definition definition, Instance instance) {
    if (definition.isVersioned()) {
      if (instance.binding() == null) {
        throw new FinKoreException(INVALID_INSTANCE);
      }
      if (!definition.binding().equals(instance.binding())) {
        throw new FinKoreException(VERSION_MISMATCH);
      }
    } else if (instance.binding() != null) {
      throw new FinKoreException(VERSION_MISMATCH);
    }
  }

  private static boolean opaque(Object value) {
    return value instanceof String text && !text.isEmpty();
  }

  private static boolean jsonEquals(Object left, Object right) {
    if (left == null || right == null) {
      return left == null && right == null;
    }
    if (left instanceof Boolean || right instanceof Boolean) {
      return left instanceof Boolean && right instanceof Boolean && left.equals(right);
    }
    if (left instanceof Number || right instanceof Number) {
      if (!(left instanceof Number) || !(right instanceof Number)) {
        return false;
      }
      try {
        return new BigDecimal(left.toString()).compareTo(new BigDecimal(right.toString())) == 0;
      } catch (NumberFormatException ignored) {
        return false;
      }
    }
    if (left instanceof String || right instanceof String) {
      return left instanceof String && right instanceof String && left.equals(right);
    }
    if (left instanceof List<?> || right instanceof List<?>) {
      if (!(left instanceof List<?> leftValues) || !(right instanceof List<?> rightValues)
          || leftValues.size() != rightValues.size()) {
        return false;
      }
      for (int index = 0; index < leftValues.size(); index += 1) {
        if (!jsonEquals(leftValues.get(index), rightValues.get(index))) {
          return false;
        }
      }
      return true;
    }
    if (left instanceof Map<?, ?> || right instanceof Map<?, ?>) {
      if (!(left instanceof Map<?, ?> leftValues) || !(right instanceof Map<?, ?> rightValues)
          || leftValues.size() != rightValues.size()) {
        return false;
      }
      for (Map.Entry<?, ?> entry : leftValues.entrySet()) {
        if (!rightValues.containsKey(entry.getKey())
            || !jsonEquals(entry.getValue(), rightValues.get(entry.getKey()))) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private static boolean versionSequenceValid(Object value) {
    return value instanceof String text && text.matches("[1-9][0-9]*");
  }

  private static List<String> stringList(Object value) {
    if (!(value instanceof List<?> raw)) {
      return null;
    }
    List<String> result = new ArrayList<>();
    for (Object item : raw) {
      if (!(item instanceof String text)) {
        return null;
      }
      result.add(text);
    }
    return result;
  }

  private static Map<String, String> parseBinding(Object value) {
    if (!(value instanceof Map<?, ?> map)) {
      return null;
    }
    Object definitionIdentity = map.get("definitionIdentity");
    Object versionIdentity = map.get("definitionVersionIdentity");
    if (!opaque(definitionIdentity) || !opaque(versionIdentity)) {
      return null;
    }
    Map<String, String> result = new LinkedHashMap<>();
    result.put("definitionIdentity", (String) definitionIdentity);
    result.put("definitionVersionIdentity", (String) versionIdentity);
    return result;
  }

  private static Map<String, Object> stringObjectMap(Map<?, ?> map) {
    Map<String, Object> result = new LinkedHashMap<>();
    for (Map.Entry<?, ?> entry : map.entrySet()) {
      if (entry.getKey() instanceof String key) {
        result.put(key, entry.getValue());
      }
    }
    return result;
  }

  private static List<Map<String, Object>> deepCopyMapList(List<Map<String, Object>> maps) {
    if (maps == null) throw new FinKoreException(INVALID_DEFINITION);
    List<Map<String, Object>> result = new ArrayList<>();
    for (Map<String, Object> map : maps) {
      if (map == null || !opaque(map.get("fact")) || !map.containsKey("equals")) {
        throw new FinKoreException(INVALID_DEFINITION);
      }
      Map<String, Object> guard = new LinkedHashMap<>();
      guard.put("fact", map.get("fact"));
      guard.put("equals", retainJson(map.get("equals"), Collections.newSetFromMap(new IdentityHashMap<>())));
      result.add(Collections.unmodifiableMap(guard));
    }
    return List.copyOf(result);
  }

  private static Object retainJson(Object value, Set<Object> ancestors) {
    if (value == null || value instanceof String || value instanceof Boolean) return value;
    if (value instanceof Byte || value instanceof Short || value instanceof Integer || value instanceof Long
        || value instanceof java.math.BigInteger || value instanceof BigDecimal) return value;
    if (value instanceof Double number && Double.isFinite(number)) return value;
    if (value instanceof Float number && Float.isFinite(number)) return value;
    if (!ancestors.add(value)) throw new FinKoreException(INVALID_DEFINITION);
    try {
      if (value instanceof List<?> list) {
        List<Object> result = new ArrayList<>();
        for (Object item : list) result.add(retainJson(item, ancestors));
        return Collections.unmodifiableList(result);
      }
      if (value instanceof Map<?, ?> map) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
          if (!(entry.getKey() instanceof String key)) throw new FinKoreException(INVALID_DEFINITION);
          result.put(key, retainJson(entry.getValue(), ancestors));
        }
        return Collections.unmodifiableMap(result);
      }
      throw new FinKoreException(INVALID_DEFINITION);
    } finally {
      ancestors.remove(value);
    }
  }
}
