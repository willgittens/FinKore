// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * FinKore Audit behavior for logical event history, relationships, and
 * redacted representations.
 *
 * <p>Audit records are JSON-shaped portable observations. This implementation
 * validates and defensively copies those observations without deriving event
 * identity, event type, timestamps, actor attribution, or financial meaning
 * from implementation details.
 *
 * @see <a href="../../../../../../spec/audit/events.md">AUDIT-EVENT-001</a>
 * @see <a href="../../../../../../spec/audit/append-only.md">AUDIT-APPEND-001</a>
 * @see <a href="../../../../../../spec/audit/relationships.md">AUDIT-RELATIONSHIP-001</a>
 */
public final class Audit {
  /** Portable error for malformed or inconsistent Audit Event content. */
  public static final String INVALID_EVENT = "FINKORE_AUDIT_INVALID_EVENT";
  /** Portable error for duplicate committed Audit Event identities. */
  public static final String DUPLICATE_EVENT = "FINKORE_AUDIT_DUPLICATE_EVENT";
  /** Portable error for attempts to rewrite logical Audit history. */
  public static final String APPEND_ONLY_VIOLATION = "FINKORE_AUDIT_APPEND_ONLY_VIOLATION";
  /** Portable error for invalid redaction requests or representations. */
  public static final String REDACTION_INVALID = "FINKORE_AUDIT_REDACTION_INVALID";
  /** Portable error for malformed known Actor attribution. */
  public static final String ACTOR_INVALID = "FINKORE_AUDIT_ACTOR_INVALID";

  private static final Pattern EVENT_TYPE = Pattern.compile("[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*");
  private static final Pattern TIMESTAMP = Pattern.compile(
      "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})");
  private static final Set<String> RESERVED_METADATA = Set.of(
      "eventId", "eventType", "entity", "actor", "occurredAt", "changes", "relationships");
  private static final Set<String> RELATIONSHIP_TYPES = Set.of("CORRECTS", "REVERSES", "VOIDS", "SUPERSEDES");
  private static final String ACTOR_DISPLAY_NAME = "actor.displayName";
  private static final String ACTOR_METADATA = "actor.metadata";

  private Audit() {}

  /**
   * Affected financial Entity reference recorded by an Audit Event.
   *
   * @param type opaque entity type
   * @param id stable opaque entity identifier
   * @see <a href="../../../../../../spec/audit/events.md">AUDIT-EVENT-004</a>
   */
  public record EntityReference(String type, String id) {
    /**
     * Parses a portable Entity reference.
     *
     * @param value candidate portable value
     * @return validated reference
     * @throws FinKoreException with {@link Audit#INVALID_EVENT}
     */
    public static EntityReference fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      return new EntityReference(requiredString(map.get("type"), INVALID_EVENT), requiredString(map.get("id"), INVALID_EVENT));
    }

    /**
     * Returns the portable Entity reference observation.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("type", type);
      result.put("id", id);
      return result;
    }
  }

  /**
   * Known Audit Actor attribution.
   *
   * @param id stable opaque actor identifier
   * @param type optional opaque actor type
   * @param displayName optional historical display context
   * @param metadata optional actor context
   * @see <a href="../../../../../../spec/audit/actors.md">AUDIT-ACTOR-001</a>
   * @see <a href="../../../../../../spec/audit/actors.md">AUDIT-ACTOR-006</a>
   */
  public record Actor(String id, String type, String displayName, Object metadata) {
    /**
     * Parses known Actor attribution.
     *
     * @param value candidate portable Actor value
     * @return validated Actor
     * @throws FinKoreException with {@link Audit#ACTOR_INVALID}
     */
    public static Actor fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(ACTOR_INVALID);
      }
      String id = requiredString(map.get("id"), ACTOR_INVALID);
      String type = optionalString(map.get("type"), ACTOR_INVALID);
      String displayName = optionalString(map.get("displayName"), ACTOR_INVALID);
      Object metadata = map.containsKey("metadata") ? copyJson(map.get("metadata"), ACTOR_INVALID) : null;
      return new Actor(id, type, displayName, metadata);
    }

    /**
     * Returns portable Actor attribution as a defensive observation.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      if (type != null) {
        result.put("type", type);
      }
      result.put("id", id);
      if (displayName != null) {
        result.put("displayName", displayName);
      }
      if (metadata != null) {
        result.put("metadata", copyJson(metadata, ACTOR_INVALID));
      }
      return result;
    }
  }

  /**
   * Domain-relevant Audit Change.
   *
   * @param path caller-supplied changed field or domain path
   * @param hasBefore whether {@code before} was present
   * @param before prior value, when present
   * @param hasAfter whether {@code after} was present
   * @param after resulting value, when present
   * @see <a href="../../../../../../spec/audit/changes.md">AUDIT-CHANGE-001</a>
   * @see <a href="../../../../../../spec/audit/changes.md">AUDIT-CHANGE-005</a>
   */
  public record Change(String path, boolean hasBefore, Object before, boolean hasAfter, Object after) {
    /**
     * Parses and validates one Audit Change.
     *
     * @param value candidate portable Change
     * @return validated Change
     * @throws FinKoreException with {@link Audit#INVALID_EVENT}
     */
    public static Change fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      String path = requiredString(map.get("path"), INVALID_EVENT);
      boolean hasBefore = map.containsKey("before");
      boolean hasAfter = map.containsKey("after");
      Object before = hasBefore ? copyJson(map.get("before"), INVALID_EVENT) : null;
      Object after = hasAfter ? copyJson(map.get("after"), INVALID_EVENT) : null;
      if (hasBefore && hasAfter && Objects.equals(before, after)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      return new Change(path, hasBefore, before, hasAfter, after);
    }

    /**
     * Returns this Change as a defensive portable observation.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("path", path);
      if (hasBefore) {
        result.put("before", copyJson(before, INVALID_EVENT));
      }
      if (hasAfter) {
        result.put("after", copyJson(after, INVALID_EVENT));
      }
      return result;
    }
  }

  /**
   * Portable Audit Relationship target.
   *
   * @param eventId target Audit Event identity
   * @param entity target Audit Event affected Entity reference
   * @see <a href="../../../../../../spec/audit/relationships.md">AUDIT-RELATIONSHIP-001</a>
   */
  public record RelationshipTarget(String eventId, EntityReference entity) {
    /**
     * Parses a relationship target observation.
     *
     * @param value candidate target
     * @return validated target
     */
    public static RelationshipTarget fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      return new RelationshipTarget(requiredString(map.get("eventId"), INVALID_EVENT), EntityReference.fromPortable(map.get("entity")));
    }

    /**
     * Returns this target as a portable observation.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("eventId", eventId);
      result.put("entity", entity.toPortable());
      return result;
    }
  }

  /**
   * Portable relationship between Audit Events.
   *
   * @param relationshipId stable opaque relationship identity
   * @param type one permitted relationship type
   * @param target target event and Entity reference
   * @see <a href="../../../../../../spec/audit/relationships.md">AUDIT-RELATIONSHIP-003</a>
   */
  public record Relationship(String relationshipId, String type, RelationshipTarget target) {
    /**
     * Parses one Audit Relationship.
     *
     * @param value candidate relationship
     * @return validated relationship
     */
    public static Relationship fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      String relationshipId = requiredString(map.get("relationshipId"), INVALID_EVENT);
      String type = requiredString(map.get("type"), INVALID_EVENT);
      if (!RELATIONSHIP_TYPES.contains(type)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      return new Relationship(relationshipId, type, RelationshipTarget.fromPortable(map.get("target")));
    }

    /**
     * Returns this relationship as a portable observation.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("relationshipId", relationshipId);
      result.put("type", type);
      result.put("target", target.toPortable());
      return result;
    }
  }

  /**
   * Validated Audit Event observation.
   *
   * @param eventId stable event identity
   * @param eventType stable domain event type token
   * @param entity affected Entity reference
   * @param occurredAt unambiguous occurrence timestamp
   * @param actor optional known Actor attribution
   * @param changes optional ordered Change observations
   * @param relationships optional ordered Audit Relationships
   * @param metadata optional event metadata
   * @see <a href="../../../../../../spec/audit/events.md">AUDIT-EVENT-003</a>
   * @see <a href="../../../../../../spec/audit/events.md">AUDIT-EVENT-008</a>
   */
  public record Event(
      String eventId,
      String eventType,
      EntityReference entity,
      String occurredAt,
      Actor actor,
      List<Change> changes,
      List<Relationship> relationships,
      Object metadata) {
    /**
     * Creates an immutable Audit Event observation.
     *
     * @param eventId stable event identity
     * @param eventType event type token
     * @param entity affected Entity reference
     * @param occurredAt occurrence timestamp
     * @param actor optional known Actor
     * @param changes optional Changes
     * @param relationships optional Relationships
     * @param metadata optional metadata
     */
    public Event {
      changes = changes == null ? null : List.copyOf(changes);
      relationships = relationships == null ? null : List.copyOf(relationships);
      metadata = metadata == null ? null : copyJson(metadata, INVALID_EVENT);
    }

    /**
     * Parses and validates one portable Audit Event.
     *
     * @param value candidate portable event
     * @return validated event
     * @throws FinKoreException with audit portable error code
     */
    public static Event fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      String eventId = requiredString(map.get("eventId"), INVALID_EVENT);
      String eventType = requiredString(map.get("eventType"), INVALID_EVENT);
      if (!EVENT_TYPE.matcher(eventType).matches()) {
        throw new FinKoreException(INVALID_EVENT);
      }
      String occurredAt = requiredString(map.get("occurredAt"), INVALID_EVENT);
      validateTimestamp(occurredAt);
      Actor actor = map.containsKey("actor") ? Actor.fromPortable(map.get("actor")) : null;
      List<Change> changes = map.containsKey("changes") ? changesFromPortable(map.get("changes")) : null;
      List<Relationship> relationships = map.containsKey("relationships") ? relationshipsFromPortable(map.get("relationships")) : null;
      Object metadata = null;
      if (map.containsKey("metadata")) {
        metadata = copyJson(map.get("metadata"), INVALID_EVENT);
        if (metadata instanceof Map<?, ?> metadataMap) {
          for (Object key : metadataMap.keySet()) {
            if (RESERVED_METADATA.contains(key)) {
              throw new FinKoreException(INVALID_EVENT);
            }
          }
        }
      }
      return new Event(eventId, eventType, EntityReference.fromPortable(map.get("entity")), occurredAt, actor, changes, relationships, metadata);
    }

    /**
     * Returns the portable Audit Event observation.
     *
     * @return ordered defensive portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("eventId", eventId);
      result.put("eventType", eventType);
      result.put("entity", entity.toPortable());
      if (actor != null) {
        result.put("actor", actor.toPortable());
      }
      result.put("occurredAt", occurredAt);
      if (changes != null) {
        result.put("changes", changes.stream().map(Change::toPortable).toList());
      }
      if (relationships != null) {
        result.put("relationships", relationships.stream().map(Relationship::toPortable).toList());
      }
      if (metadata != null) {
        result.put("metadata", copyJson(metadata, INVALID_EVENT));
      }
      return result;
    }
  }

  /**
   * Policy-authorized redaction request.
   *
   * @param id stable policy identity
   * @param protectedPaths protected actor-context targets or Change paths
   * @param authority redaction authority
   * @see <a href="../../../../../../spec/audit/redaction.md">AUDIT-REDACTION-001</a>
   */
  public record RedactionPolicy(String id, List<String> protectedPaths, String authority) {
    /**
     * Parses a redaction policy.
     *
     * @param value candidate policy
     * @return validated policy
     */
    public static RedactionPolicy fromPortable(Object value) {
      if (!(value instanceof Map<?, ?> map)) {
        throw new FinKoreException(REDACTION_INVALID);
      }
      List<String> paths = stringList(map.get("protectedPaths"), REDACTION_INVALID);
      if (paths.isEmpty()) {
        throw new FinKoreException(REDACTION_INVALID);
      }
      return new RedactionPolicy(
          requiredString(map.get("id"), REDACTION_INVALID),
          paths,
          requiredString(map.get("authority"), REDACTION_INVALID));
    }

    /**
     * Creates an immutable redaction policy.
     *
     * @param id policy identity
     * @param protectedPaths targets to redact
     * @param authority redaction authority
     */
    public RedactionPolicy {
      protectedPaths = List.copyOf(protectedPaths);
    }
  }

  /**
   * Redaction result containing the redacted representation and evidence event.
   *
   * @param event redacted event representation
   * @param evidenceEvent appended redaction evidence event
   * @see <a href="../../../../../../spec/audit/redaction.md">AUDIT-REDACTION-006</a>
   */
  public record RedactionResult(Map<String, Object> event, Map<String, Object> evidenceEvent) {
    /**
     * Returns the portable redaction result.
     *
     * @return ordered portable map
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("event", copyJson(event, REDACTION_INVALID));
      result.put("evidenceEvent", copyJson(evidenceEvent, REDACTION_INVALID));
      return result;
    }
  }

  /**
   * Append-only logical Audit history.
   *
   * <p>Existing events and relationships are validated before use. Failed
   * appends and redactions leave this history unchanged.
   *
   * @see <a href="../../../../../../spec/audit/append-only.md">AUDIT-APPEND-003</a>
   * @see <a href="../../../../../../spec/audit/relationships.md">AUDIT-RELATIONSHIP-012</a>
   */
  public static final class Log {
    private final List<Event> events;
    private final Set<String> eventIds;
    private final Set<String> relationshipIds;

    private Log(List<Event> events) {
      this.events = new ArrayList<>(events);
      this.eventIds = new HashSet<>();
      this.relationshipIds = new HashSet<>();
      for (Event event : events) {
        eventIds.add(event.eventId());
        for (Relationship relationship : relationships(event)) {
          relationshipIds.add(relationship.relationshipId());
        }
      }
    }

    /**
     * Creates a logical Audit Log from committed history.
     *
     * @param history committed event observations
     * @return validated log
     * @throws FinKoreException with audit portable error code
     */
    public static Log create(Object history) {
      if (!(history instanceof List<?> list)) {
        throw new FinKoreException(INVALID_EVENT);
      }
      List<Event> parsed = new ArrayList<>();
      Map<String, Event> committedEvents = new HashMap<>();
      Set<String> committedRelationships = new HashSet<>();
      for (Object item : list) {
        Event event = Event.fromPortable(item);
        if (committedEvents.containsKey(event.eventId())) {
          throw new FinKoreException(DUPLICATE_EVENT);
        }
        validateRelationships(event, committedEvents, committedRelationships);
        parsed.add(event);
        committedEvents.put(event.eventId(), event);
        for (Relationship relationship : relationships(event)) {
          committedRelationships.add(relationship.relationshipId());
        }
      }
      return new Log(parsed);
    }

    /**
     * Appends a validated event to this logical history.
     *
     * @param eventValue candidate event
     * @return this log after append
     * @throws FinKoreException with audit portable error code
     */
    public Log append(Object eventValue) {
      Event event = Event.fromPortable(eventValue);
      if (eventIds.contains(event.eventId())) {
        throw new FinKoreException(DUPLICATE_EVENT);
      }
      validateRelationships(event, eventsById(), new HashSet<>(relationshipIds));
      events.add(event);
      eventIds.add(event.eventId());
      for (Relationship relationship : relationships(event)) {
        relationshipIds.add(relationship.relationshipId());
      }
      return this;
    }

    /**
     * Rejects replacement of committed Audit Event content.
     *
     * @throws FinKoreException with {@link Audit#APPEND_ONLY_VIOLATION}
     */
    public void replace() {
      throw new FinKoreException(APPEND_ONLY_VIOLATION);
    }

    /**
     * Rejects removal of committed Audit Event content.
     *
     * @throws FinKoreException with {@link Audit#APPEND_ONLY_VIOLATION}
     */
    public void remove() {
      throw new FinKoreException(APPEND_ONLY_VIOLATION);
    }

    /**
     * Produces a redacted event representation and appends evidence.
     *
     * @param policyValue redaction policy
     * @param redactionEventValue evidence event to append
     * @return redaction result
     * @throws FinKoreException with audit portable error code
     */
    public RedactionResult redact(Object policyValue, Object redactionEventValue) {
      RedactionPolicy policy = RedactionPolicy.fromPortable(policyValue);
      Event evidence = Event.fromPortable(redactionEventValue);
      if (eventIds.contains(evidence.eventId())) {
        throw new FinKoreException(DUPLICATE_EVENT);
      }
      validateRelationships(evidence, eventsById(), new HashSet<>(relationshipIds));
      Event source = redactionTarget(policy);
      Map<String, Object> redacted = redactEvent(source, policy);
      events.add(evidence);
      eventIds.add(evidence.eventId());
      for (Relationship relationship : relationships(evidence)) {
        relationshipIds.add(relationship.relationshipId());
      }
      return new RedactionResult(redacted, evidence.toPortable());
    }

    /**
     * Returns committed events as defensive portable observations.
     *
     * @return ordered committed history
     */
    public List<Map<String, Object>> events() {
      return events.stream().map(Event::toPortable).toList();
    }

    /**
     * Returns the conformance history envelope.
     *
     * @return map containing {@code history}
     */
    public Map<String, Object> toPortable() {
      Map<String, Object> result = new LinkedHashMap<>();
      result.put("history", events());
      return result;
    }

    private Map<String, Event> eventsById() {
      Map<String, Event> result = new HashMap<>();
      for (Event event : events) {
        result.put(event.eventId(), event);
      }
      return result;
    }

    private Event redactionTarget(RedactionPolicy policy) {
      Event target = null;
      for (Event event : events) {
        if (eventContainsAllProtectedPaths(event, policy)) {
          if (target != null) {
            throw new FinKoreException(REDACTION_INVALID);
          }
          target = event;
        }
      }
      if (target == null) {
        throw new FinKoreException(REDACTION_INVALID);
      }
      return target;
    }
  }

  private static void validateRelationships(Event event, Map<String, Event> committedEvents, Set<String> committedRelationships) {
    for (Relationship relationship : relationships(event)) {
      if (committedRelationships.contains(relationship.relationshipId())) {
        throw new FinKoreException(INVALID_EVENT);
      }
      committedRelationships.add(relationship.relationshipId());
      if (relationship.target().eventId().equals(event.eventId())) {
        throw new FinKoreException(INVALID_EVENT);
      }
      Event target = committedEvents.get(relationship.target().eventId());
      if (target == null || !relationship.target().entity().equals(target.entity())) {
        throw new FinKoreException(INVALID_EVENT);
      }
    }
  }

  private static List<Relationship> relationships(Event event) {
    return event.relationships() == null ? List.of() : event.relationships();
  }

  private static List<Change> changesFromPortable(Object value) {
    if (!(value instanceof List<?> list)) {
      throw new FinKoreException(INVALID_EVENT);
    }
    List<Change> result = new ArrayList<>();
    for (Object item : list) {
      result.add(Change.fromPortable(item));
    }
    return result;
  }

  private static List<Relationship> relationshipsFromPortable(Object value) {
    if (!(value instanceof List<?> list) || list.isEmpty()) {
      throw new FinKoreException(INVALID_EVENT);
    }
    List<Relationship> result = new ArrayList<>();
    for (Object item : list) {
      result.add(Relationship.fromPortable(item));
    }
    return result;
  }

  private static void validateTimestamp(String timestamp) {
    if (!TIMESTAMP.matcher(timestamp).matches()) {
      throw new FinKoreException(INVALID_EVENT);
    }
    try {
      OffsetDateTime.parse(timestamp);
    } catch (DateTimeParseException error) {
      throw new FinKoreException(INVALID_EVENT);
    }
  }

  private static boolean eventContainsAllProtectedPaths(Event event, RedactionPolicy policy) {
    Set<String> found = new HashSet<>();
    for (String path : policy.protectedPaths()) {
      if (ACTOR_DISPLAY_NAME.equals(path) && event.actor() != null && event.actor().displayName() != null) {
        found.add(path);
      } else if (ACTOR_METADATA.equals(path) && event.actor() != null && event.actor().metadata() != null) {
        found.add(path);
      } else if (!path.startsWith("actor.")) {
        for (Change change : event.changes() == null ? List.<Change>of() : event.changes()) {
          if (path.equals(change.path())) {
            found.add(path);
          }
        }
      }
    }
    return found.size() == policy.protectedPaths().size();
  }

  private static Map<String, Object> redactEvent(Event event, RedactionPolicy policy) {
    Map<String, Object> redacted = event.toPortable();
    Set<String> paths = new HashSet<>(policy.protectedPaths());
    if (redacted.get("actor") instanceof Map<?, ?> actorMap) {
      @SuppressWarnings("unchecked")
      Map<String, Object> actor = (Map<String, Object>) actorMap;
      if (paths.contains(ACTOR_DISPLAY_NAME) && actor.containsKey("displayName")) {
        actor.put("displayName", redactedValue(actor.get("displayName")));
      }
      if (paths.contains(ACTOR_METADATA) && actor.containsKey("metadata")) {
        actor.put("metadata", redactedValue(actor.get("metadata")));
      }
    }
    if (redacted.get("changes") instanceof List<?> changeList) {
      for (Object item : changeList) {
        @SuppressWarnings("unchecked")
        Map<String, Object> change = (Map<String, Object>) item;
        if (paths.contains(change.get("path"))) {
          if (!change.containsKey("before") && !change.containsKey("after")) {
            throw new FinKoreException(REDACTION_INVALID);
          }
          if (change.containsKey("before")) {
            change.put("before", redactedValue(change.get("before")));
          }
          if (change.containsKey("after")) {
            change.put("after", redactedValue(change.get("after")));
          }
        }
      }
    }
    return redacted;
  }

  private static Map<String, Object> redactedValue(Object original) {
    if (original instanceof Map<?, ?> map && map.size() == 1 && "REDACTED".equals(map.get("presence"))) {
      throw new FinKoreException(REDACTION_INVALID);
    }
    return new LinkedHashMap<>(Map.of("presence", "REDACTED"));
  }

  private static String requiredString(Object value, String code) {
    if (!(value instanceof String text) || text.isEmpty()) {
      throw new FinKoreException(code);
    }
    return text;
  }

  private static String optionalString(Object value, String code) {
    if (value == null) {
      return null;
    }
    return requiredString(value, code);
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
