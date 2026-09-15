# SPDX-License-Identifier: MPL-2.0
"""FinKore logical Audit history behavior."""

from __future__ import annotations

from copy import deepcopy
import re
from typing import Any

from .errors import FinKoreError

INVALID_EVENT = "FINKORE_AUDIT_INVALID_EVENT"
DUPLICATE_EVENT = "FINKORE_AUDIT_DUPLICATE_EVENT"
APPEND_ONLY_VIOLATION = "FINKORE_AUDIT_APPEND_ONLY_VIOLATION"
REDACTION_INVALID = "FINKORE_AUDIT_REDACTION_INVALID"
ACTOR_INVALID = "FINKORE_AUDIT_ACTOR_INVALID"

_EVENT_TYPE_RE = re.compile(r"^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$")
_RELATIONSHIP_TYPES = {"CORRECTS", "REVERSES", "VOIDS", "SUPERSEDES"}
_REDACTED = {"presence": "REDACTED"}


def _opaque(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _entity(value: Any) -> dict[str, str] | None:
    if not isinstance(value, dict) or not _opaque(value.get("type")) or not _opaque(value.get("id")):
        return None
    return {"type": value["type"], "id": value["id"]}


def _event_identity(event: dict[str, Any]) -> str:
    event_id = event.get("eventId")
    if not _opaque(event_id):
        raise FinKoreError(INVALID_EVENT)
    return event_id


def _relationship_identity(relationship: dict[str, Any]) -> str:
    relationship_id = relationship.get("relationshipId")
    if not _opaque(relationship_id):
        raise FinKoreError(INVALID_EVENT)
    return relationship_id


def validate_event(event: Any, committed_events: dict[str, dict[str, Any]], committed_relationships: set[str]) -> dict[str, Any]:
    """Validate one Audit Event against already committed logical history.

    @see AUDIT-EVENT-001
    @see AUDIT-RELATIONSHIP-001
    """

    if not isinstance(event, dict):
        raise FinKoreError(INVALID_EVENT)
    event_id = _event_identity(event)
    event_type = event.get("eventType")
    if not isinstance(event_type, str) or _EVENT_TYPE_RE.fullmatch(event_type) is None:
        raise FinKoreError(INVALID_EVENT)
    entity = _entity(event.get("entity"))
    if entity is None or not _opaque(event.get("occurredAt")):
        raise FinKoreError(INVALID_EVENT)
    metadata = event.get("metadata")
    if isinstance(metadata, dict) and any(key in metadata for key in ("eventId", "eventType", "entity", "actor", "occurredAt", "changes", "relationships")):
        raise FinKoreError(INVALID_EVENT)
    if "actor" in event:
        _validate_actor(event["actor"])
    if "changes" in event:
        _validate_changes(event["changes"])
    if "relationships" in event:
        _validate_relationships(event, entity, committed_events, committed_relationships)
    return deepcopy(event)


def validate_history(history: Any) -> list[dict[str, Any]]:
    """Validate a complete logical Audit history without changing it."""

    if not isinstance(history, list):
        raise FinKoreError(INVALID_EVENT)
    events: dict[str, dict[str, Any]] = {}
    relationships: set[str] = set()
    validated: list[dict[str, Any]] = []
    for event in history:
        event_id = _event_identity(event) if isinstance(event, dict) else None
        if event_id in events:
            raise FinKoreError(DUPLICATE_EVENT)
        validated_event = validate_event(event, events, relationships)
        events[validated_event["eventId"]] = validated_event
        if isinstance(validated_event.get("relationships"), list):
            relationships.update(_relationship_identity(relationship) for relationship in validated_event["relationships"])
        validated.append(validated_event)
    return validated


def append_event(history: Any, event: Any) -> dict[str, list[dict[str, Any]]]:
    """Append one valid Audit Event to logical history.

    @see AUDIT-APPEND-001
    @see AUDIT-APPEND-003
    """

    current = validate_history(history)
    if _event_identity(event) in {item["eventId"] for item in current}:
        raise FinKoreError(DUPLICATE_EVENT)
    events = {item["eventId"]: item for item in current}
    relationships = _relationship_ids(current)
    appended = validate_event(event, events, relationships)
    return {"history": [*current, appended]}


def replace_event(history: Any, event_id: Any, replacement: Any) -> dict[str, list[dict[str, Any]]]:
    """Reject replacement of committed Audit Events.

    @see AUDIT-APPEND-001
    """

    validate_history(history)
    if not _opaque(event_id) or not isinstance(replacement, dict):
        raise FinKoreError(INVALID_EVENT)
    raise FinKoreError(APPEND_ONLY_VIOLATION)


def remove_event(history: Any, event_id: Any) -> dict[str, list[dict[str, Any]]]:
    """Reject removal of committed Audit Events.

    @see AUDIT-APPEND-001
    """

    validate_history(history)
    if not _opaque(event_id):
        raise FinKoreError(INVALID_EVENT)
    raise FinKoreError(APPEND_ONLY_VIOLATION)


def redact_history(history: Any, policy: Any, redaction_event: Any) -> dict[str, Any]:
    """Produce a redacted event representation and append redaction evidence.

    The source event remains present in the committed logical history
    observation; redaction is represented by the returned event view and a
    separate evidence event.

    @see AUDIT-REDACTION-002
    @see AUDIT-REDACTION-006
    """

    current = validate_history(history)
    protected_paths = _protected_paths(policy)
    events = {item["eventId"]: item for item in current}
    evidence = validate_event(redaction_event, events, _relationship_ids(current))
    if evidence["eventId"] in events:
        raise FinKoreError(DUPLICATE_EVENT)
    target = _redaction_target(current, protected_paths)
    if target is None:
        raise FinKoreError(REDACTION_INVALID)
    redacted = _redact_event(target, protected_paths)
    return {"event": redacted, "evidenceEvent": evidence, "history": [*current, evidence]}


def _validate_actor(actor: Any) -> None:
    if not isinstance(actor, dict) or not _opaque(actor.get("id")):
        raise FinKoreError(ACTOR_INVALID)
    if "type" in actor and not _opaque(actor["type"]):
        raise FinKoreError(ACTOR_INVALID)


def _validate_changes(changes: Any) -> None:
    if not isinstance(changes, list):
        raise FinKoreError(INVALID_EVENT)
    for change in changes:
        if not isinstance(change, dict) or not _opaque(change.get("path")):
            raise FinKoreError(INVALID_EVENT)
        if "before" in change and "after" in change and change["before"] == change["after"]:
            raise FinKoreError(INVALID_EVENT)


def _validate_relationships(event: dict[str, Any], entity: dict[str, str], events: dict[str, dict[str, Any]], relationships: set[str]) -> None:
    raw_relationships = event.get("relationships")
    if not isinstance(raw_relationships, list) or len(raw_relationships) == 0:
        raise FinKoreError(INVALID_EVENT)
    seen: set[str] = set()
    for relationship in raw_relationships:
        if not isinstance(relationship, dict):
            raise FinKoreError(INVALID_EVENT)
        relationship_id = _relationship_identity(relationship)
        if relationship_id in seen or relationship_id in relationships:
            raise FinKoreError(INVALID_EVENT)
        seen.add(relationship_id)
        if relationship.get("type") not in _RELATIONSHIP_TYPES:
            raise FinKoreError(INVALID_EVENT)
        target = relationship.get("target")
        if not isinstance(target, dict) or not _opaque(target.get("eventId")):
            raise FinKoreError(INVALID_EVENT)
        if target["eventId"] == event["eventId"]:
            raise FinKoreError(INVALID_EVENT)
        target_entity = _entity(target.get("entity"))
        target_event = events.get(target["eventId"])
        if target_entity is None or target_event is None or target_entity != _entity(target_event.get("entity")):
            raise FinKoreError(INVALID_EVENT)
        if target_entity != _entity(target.get("entity")):
            raise FinKoreError(INVALID_EVENT)
        if target_entity is None or "entity" not in target:
            raise FinKoreError(INVALID_EVENT)
        if entity is None:
            raise FinKoreError(INVALID_EVENT)


def _relationship_ids(history: list[dict[str, Any]]) -> set[str]:
    ids: set[str] = set()
    for event in history:
        for relationship in event.get("relationships", []):
            ids.add(_relationship_identity(relationship))
    return ids


def _protected_paths(policy: Any) -> list[str]:
    if not isinstance(policy, dict):
        raise FinKoreError(REDACTION_INVALID)
    paths = policy.get("protectedPaths")
    if not isinstance(paths, list) or len(paths) == 0 or any(not _opaque(path) for path in paths):
        raise FinKoreError(REDACTION_INVALID)
    return paths


def _redaction_target(history: list[dict[str, Any]], protected_paths: list[str]) -> dict[str, Any] | None:
    for event in history:
        if any(_event_has_path(event, path) for path in protected_paths):
            return event
    return None


def _event_has_path(event: dict[str, Any], path: str) -> bool:
    if path in {"actor.displayName", "actor.metadata"}:
        return isinstance(event.get("actor"), dict) and path.partition(".")[2] in event["actor"]
    return any(isinstance(change, dict) and change.get("path") == path for change in event.get("changes", []))


def _redact_event(event: dict[str, Any], protected_paths: list[str]) -> dict[str, Any]:
    redacted = deepcopy(event)
    actor_paths = {path.partition(".")[2] for path in protected_paths if path.startswith("actor.")}
    if actor_paths:
        if not isinstance(redacted.get("actor"), dict):
            raise FinKoreError(REDACTION_INVALID)
        for key in actor_paths:
            if key not in {"displayName", "metadata"} or key not in redacted["actor"]:
                raise FinKoreError(REDACTION_INVALID)
            redacted["actor"][key] = dict(_REDACTED)
    change_paths = {path for path in protected_paths if not path.startswith("actor.")}
    if change_paths:
        matched: set[str] = set()
        for change in redacted.get("changes", []):
            if change.get("path") in change_paths:
                matched.add(change["path"])
                if "before" in change:
                    change["before"] = dict(_REDACTED)
                if "after" in change:
                    change["after"] = dict(_REDACTED)
        if matched != change_paths:
            raise FinKoreError(REDACTION_INVALID)
    return redacted
