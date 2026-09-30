# SPDX-License-Identifier: MPL-2.0
"""FinKore Financial Entity behavior and evolution observations."""

from __future__ import annotations

from copy import deepcopy
from decimal import Decimal
from typing import Any

from .audit import append_event
from .errors import FinKoreError
from .money import Money
from .workflow import WorkflowDefinition, WorkflowInstance, create_workflow, import_workflow, transition_workflow

INVALID_IDENTITY = "FINKORE_ENTITY_INVALID_IDENTITY"
IMMUTABLE = "FINKORE_ENTITY_IMMUTABLE"
INVALID_MUTATION = "FINKORE_ENTITY_INVALID_MUTATION"
STATE_CONFLICT = "FINKORE_ENTITY_STATE_CONFLICT"
VALIDATION_FAILED = "FINKORE_ENTITY_VALIDATION_FAILED"
_OMITTED = object()


def _opaque(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _relations(history: Any) -> list[dict[str, Any]]:
    if history is _OMITTED or history == []:
        return []
    if isinstance(history, dict) and isinstance(history.get("relations"), list):
        return deepcopy(history["relations"])
    raise FinKoreError(INVALID_MUTATION)


def import_evolution_history(history: Any = _OMITTED) -> dict[str, Any]:
    """Import an ordered ``relations`` envelope without changing supplied data.

    Validate relation identities, required effects, and consistent post-step
    currentness independently of request preconditions. Unresolved contradictions
    raise FINKORE_ENTITY_INVALID_MUTATION; invalid reference identities retain
    FINKORE_ENTITY_INVALID_IDENTITY. The returned envelope owns its data. Omission and [] mean empty history;
    explicit None is malformed (FINKORE_ENTITY_INVALID_MUTATION).
    See ENTITY-EVOLUTION-014/022/023/035.
    """
    relations = _relations(history)
    _currentness(relations)
    return {"relations": relations}


def _reference_key(reference: Any, scope: Any = None) -> tuple[Any, str, str, str]:
    if not isinstance(reference, dict) or any(not _opaque(reference.get(key)) for key in ("type", "id", "revision")) or reference["id"] == reference["revision"]:
        raise FinKoreError(INVALID_IDENTITY)
    return scope, reference["type"], reference["id"], reference["revision"]


def _currentness(relations: list[dict[str, Any]]) -> dict[tuple[Any, str, str, str], bool]:
    # ENTITY-EVOLUTION-035: only declared effects explain a change between steps.
    observed = {}
    ids = set()
    for relation in relations:
        if not isinstance(relation, dict) or relation.get("kind") not in ("CORRECTION", "REVERSAL", "VOID", "SUPERSESSION"):
            raise FinKoreError(INVALID_MUTATION)
        kind = relation["kind"]
        identifier = relation.get("relationId")
        if not _opaque(identifier) or not _opaque(relation.get("auditEventId")):
            raise FinKoreError(INVALID_IDENTITY)
        if identifier in ids:
            raise FinKoreError(INVALID_MUTATION)
        ids.add(identifier)
        scope = relation.get("supersessionScope")
        if (kind == "SUPERSESSION") != ("supersessionScope" in relation) or ("supersessionScope" in relation and not _opaque(scope)):
            raise FinKoreError(INVALID_MUTATION)
        source = _reference_key(relation.get("source"), scope)
        value = relation.get("sourceCurrent")
        if not isinstance(value, bool) or (kind == "VOID") != ("related" not in relation):
            raise FinKoreError(INVALID_MUTATION)
        step = {source: value}
        effects = {source: False} if kind in ("VOID", "SUPERSESSION") else {}
        if kind == "VOID":
            if "relatedCurrent" in relation:
                raise FinKoreError(INVALID_MUTATION)
        else:
            related = _reference_key(relation["related"], scope)
            related_current = relation.get("relatedCurrent")
            if not isinstance(related_current, bool) or (related in step and step[related] != related_current):
                raise FinKoreError(INVALID_MUTATION)
            step[related] = related_current
            if kind == "SUPERSESSION":
                if related in effects and effects[related] is not True:
                    raise FinKoreError(INVALID_MUTATION)
                effects[related] = True
        for key, current in step.items():
            if key in effects and effects[key] != current:
                raise FinKoreError(INVALID_MUTATION)
            if key in observed and observed[key] != current and key not in effects:
                raise FinKoreError(INVALID_MUTATION)
            observed[key] = current
    return observed


def validate_definition(definition: Any) -> dict[str, Any]:
    """Validate identity scope, Workflow, all mutability entries and validators.

    Malformed/unsupported declarations raise FINKORE_ENTITY_INVALID_MUTATION;
    supported predicates rejecting data use FINKORE_ENTITY_VALIDATION_FAILED.
    Every declared State requires its own field list; an empty list is valid.
    See ENTITY-IDENTITY-007, ENTITY-MUTABILITY-008 and ENTITY-VALIDATION-009.
    """

    if not isinstance(definition, dict) or not _opaque(definition.get("type")) or not _opaque(definition.get("identityScope")):
        raise FinKoreError(INVALID_IDENTITY)
    workflow = WorkflowDefinition.from_portable(definition.get("workflow"))
    mutability = definition.get("mutability")
    if not isinstance(mutability, dict) or any(state not in mutability for state in workflow.states):
        raise FinKoreError(INVALID_MUTATION)
    for state, fields in mutability.items():
        if not _opaque(state) or not isinstance(fields, list) or any(not _opaque(field) for field in fields):
            raise FinKoreError(INVALID_MUTATION)
    rules = definition.get("validation", [])
    if not isinstance(rules, list):
        raise FinKoreError(INVALID_MUTATION)
    for rule in rules:
        if (not isinstance(rule, dict) or rule.get("rule") not in ("positive-money", "money-not-greater-than")
                or not _opaque(rule.get("id")) or not _opaque(rule.get("path"))
                or (rule["rule"] == "money-not-greater-than" and not _opaque(rule.get("otherPath")))):
            raise FinKoreError(INVALID_MUTATION)
    return deepcopy(definition)


def validate_entity(definition: dict[str, Any], entity: Any) -> dict[str, Any]:
    """Validate an Entity and its explicitly retained Workflow binding.

    Versioned observations require binding; missing/malformed bindings use
    FINKORE_WORKFLOW_INVALID_INSTANCE and mismatches use
    FINKORE_WORKFLOW_VERSION_MISMATCH. No binding is inferred from a definition.
    Malformed current States use FINKORE_WORKFLOW_INVALID_INSTANCE; undeclared
    nonempty States use FINKORE_WORKFLOW_INVALID_STATE. Data must be an object
    satisfying all declared rules, including before any proposed mutation.
    See WORKFLOW-VERSION-007/008/010, ENTITY-LIFECYCLE-007,
    ENTITY-VALIDATION-010 and ENTITY-IMPORT-002.
    """

    if not isinstance(entity, dict) or entity.get("type") != definition["type"] or not _opaque(entity.get("id")):
        raise FinKoreError(INVALID_IDENTITY)
    workflow = WorkflowDefinition.from_portable(definition["workflow"])
    if not _opaque(entity.get("state")):
        raise FinKoreError("FINKORE_WORKFLOW_INVALID_INSTANCE")
    import_workflow(workflow, _workflow_instance(entity))
    if not isinstance(entity.get("data"), dict):
        raise FinKoreError(VALIDATION_FAILED)
    _validate_entity_data(definition, entity)
    return deepcopy(entity)


def _workflow_instance(entity: dict[str, Any]) -> WorkflowInstance:
    # Translate the retained observation; never infer binding from a definition.
    return WorkflowInstance.from_portable({"currentState": entity.get("state"), **(
        {"binding": entity["binding"]} if "binding" in entity else {})})


def create_entity(definition: Any, entity_id: Any, data: Any) -> dict[str, Any]:
    """Create an Entity with the Workflow initial State and original binding.

    Returns owned data without mutating inputs. See ENTITY-LIFECYCLE-001/002
    and WORKFLOW-VERSION-007/008; validator errors follow validate_definition.
    Non-object data raises FINKORE_ENTITY_VALIDATION_FAILED.
    """

    entity_definition = validate_definition(definition)
    if not _opaque(entity_id):
        raise FinKoreError(INVALID_IDENTITY)
    if not isinstance(data, dict):
        raise FinKoreError(VALIDATION_FAILED)
    workflow = WorkflowDefinition.from_portable(entity_definition["workflow"])
    instance = create_workflow(workflow)
    entity = {"type": entity_definition["type"], "id": entity_id, "state": instance.current_state, "data": deepcopy(data)}
    if instance.binding is not None:
        entity["binding"] = instance.binding
    _validate_entity_data(entity_definition, entity)
    return entity


def mutate_entity(definition: Any, entity: Any, changes: Any) -> dict[str, Any]:
    """Apply declared changes, preserving identity, State and Workflow binding.

    Validate the original data and binding before applying changes; empty changes
    raise FINKORE_ENTITY_INVALID_MUTATION (ENTITY-MUTABILITY-009). Failure
    leaves the source unchanged. See ENTITY-MUTABILITY-002/004 and
    WORKFLOW-VERSION-008/010.
    """

    entity_definition = validate_definition(definition)
    current = validate_entity(entity_definition, entity)
    if not isinstance(changes, dict) or not changes:
        raise FinKoreError(INVALID_MUTATION)
    if any(path in {"type", "id", "state"} for path in changes):
        raise FinKoreError(IMMUTABLE)
    mutable = set(entity_definition["mutability"][current["state"]])
    if any(path not in mutable for path in changes):
        raise FinKoreError(IMMUTABLE)
    result = deepcopy(current)
    result["data"] = {**result["data"], **deepcopy(changes)}
    _validate_entity_data(entity_definition, result)
    return result


def transition_entity(definition: Any, entity: Any, target: Any) -> dict[str, Any]:
    """Transition through the bound Workflow without changing source or binding.

    Validate declarations and the original binding before transition. See
    ENTITY-LIFECYCLE-003 and WORKFLOW-VERSION-008/010.
    """

    entity_definition = validate_definition(definition)
    current = validate_entity(entity_definition, entity)
    workflow = WorkflowDefinition.from_portable(entity_definition["workflow"])
    result = transition_workflow(workflow, _workflow_instance(current), target)
    transitioned = deepcopy(current)
    transitioned["state"] = result.current_state
    _validate_entity_data(entity_definition, transitioned)
    return transitioned


def import_entity(definition: Any, import_value: Any) -> dict[str, Any]:
    """Validate and preserve a complete imported Entity observation.

    Require the original versioned Workflow binding; never infer it. The bounded
    API rejects equal current-revision/conflict tokens with INVALID_IDENTITY;
    it exposes no shared-meaning declaration. Omitted expectations impose no
    check; supplied null, missing observed, and nonmatching expected identities
    use STATE_CONFLICT. No input is mutated on success or failure.
    Complete mapping-only evidence is valid without synthesizing Source Identity.
    A supplied Source Identity must be a complete object with matching mapping;
    explicit null and malformed values use INVALID_IDENTITY.
    Supplied revision currentness must be Boolean and agree with its current or
    historical position; conflicting declarations are never silently rewritten.

    @see ENTITY-IMPORT-007
    @see ENTITY-VALIDATION-009
    @see WORKFLOW-VERSION-008/010
    @see ENTITY-IMPORT-002
    @see ENTITY-IMPORT-008
    @see ENTITY-IMPORT-011
    @see ENTITY-VALIDATION-004
    @see ENTITY-REVISION-007
    """

    entity_definition = validate_definition(definition)
    if not isinstance(import_value, dict):
        raise FinKoreError(INVALID_IDENTITY)
    entity = validate_entity(entity_definition, import_value.get("entity"))
    if "sourceIdentity" in import_value:
        source_identity = import_value["sourceIdentity"]
        if not isinstance(source_identity, dict) or not _opaque(source_identity.get("sourceSystem")) or not _opaque(source_identity.get("sourceId")):
            raise FinKoreError(INVALID_IDENTITY)
        mapping = _identity_mapping(import_value.get("identityMapping"), entity, import_value["sourceIdentity"])
    elif "identityMapping" in import_value:
        mapping = _identity_mapping(import_value["identityMapping"], entity, None)
    else:
        mapping = None
    current_revision = _revision(import_value.get("currentRevision"), entity, True) if "currentRevision" in import_value else None
    historical_input = import_value.get("historicalRevisions", [])
    if not isinstance(historical_input, list):
        raise FinKoreError(INVALID_IDENTITY)
    historical = [_revision(item, entity, False) for item in historical_input]
    revisions = ([current_revision] if current_revision is not None else []) + historical
    if len({revision["revision"] for revision in revisions}) != len(revisions):
        raise FinKoreError(INVALID_IDENTITY)
    conflict_version = import_value.get("conflictVersion")
    if "conflictVersion" in import_value and not _opaque(conflict_version):
        raise FinKoreError(INVALID_IDENTITY)
    if current_revision is not None and current_revision["revision"] == conflict_version:
        raise FinKoreError(INVALID_IDENTITY)
    if import_value.get("expectedState", entity["state"]) != entity["state"]:
        raise FinKoreError(STATE_CONFLICT)
    if "expectedRevision" in import_value and (current_revision is None or import_value["expectedRevision"] != current_revision["revision"]):
        raise FinKoreError(STATE_CONFLICT)
    if "expectedConflictVersion" in import_value and (conflict_version is None or import_value["expectedConflictVersion"] != conflict_version):
        raise FinKoreError(STATE_CONFLICT)
    result: dict[str, Any] = {"entity": entity}
    if current_revision is not None:
        result["currentRevision"] = current_revision
    if historical:
        result["historicalRevisions"] = historical
    if mapping is not None:
        result["identityMapping"] = mapping
    if conflict_version is not None:
        result["conflictVersion"] = conflict_version
    return result


def evolve_entity(kind: str, definition: Any, input_value: dict[str, Any]) -> dict[str, Any]:
    """Record evolution and corresponding Audit evidence atomically.

    Validate complete source/related business observations and ordered history.
    Intrinsic Audit errors precede correspondence errors (INVALID_MUTATION).
    Omitted evolution/Audit histories are empty; explicit None remains invalid.
    Expectations compare against history-derived currentness; mismatches raise
    FINKORE_ENTITY_STATE_CONFLICT. No input is mutated on success or failure.
    The bounded reference policy rejects a second Reversal of a source Revision;
    it does not impose a universal policy on every composing domain.
    See ENTITY-VALIDATION-001/003 and ENTITY-EVOLUTION-023/025/033/034/035.
    """

    if kind not in ("CORRECTION", "REVERSAL", "VOID", "SUPERSESSION"):
        raise FinKoreError(INVALID_MUTATION)
    current_relations = import_evolution_history(input_value.get("evolutionHistory", []))["relations"]
    observed = _currentness(current_relations)
    entity_definition = validate_definition(definition)
    source = validate_entity(entity_definition, input_value.get("source"))
    _validate_entity_data(entity_definition, source)
    related_key = "successor" if kind == "SUPERSESSION" else "related"
    revision_key = "successorRevision" if kind == "SUPERSESSION" else "relatedRevision"
    related = validate_entity(entity_definition, input_value.get(related_key)) if kind != "VOID" else None
    if related is not None:
        _validate_entity_data(entity_definition, related)
    source_revision = _opaque_revision(input_value.get("sourceRevision"), source)
    related_revision = _opaque_revision(input_value.get(revision_key), related) if related is not None else None
    relation_id = input_value.get("relationId")
    if not _opaque(relation_id):
        raise FinKoreError(INVALID_MUTATION)
    if relation_id in {relation["relationId"] for relation in current_relations if isinstance(relation, dict) and "relationId" in relation}:
        raise FinKoreError(INVALID_MUTATION)
    if input_value.get("expectedSourceState", source["state"]) != source["state"]:
        raise FinKoreError(STATE_CONFLICT)
    if input_value.get("expectedSourceRevision", source_revision) != source_revision:
        raise FinKoreError(STATE_CONFLICT)
    source_reference = {"type": source["type"], "id": source["id"], "revision": source_revision}
    scope = input_value.get("supersessionScope") if kind == "SUPERSESSION" else None
    if kind == "SUPERSESSION" and not _opaque(scope):
        raise FinKoreError(INVALID_MUTATION)
    current = observed.get(_reference_key(source_reference, scope), True)
    if "expectedSourceCurrent" in input_value and not isinstance(input_value["expectedSourceCurrent"], bool):
        raise FinKoreError(INVALID_MUTATION)
    if input_value.get("expectedSourceCurrent", current) != current:
        raise FinKoreError(STATE_CONFLICT)
    if input_value.get("eligible") is not True:
        raise FinKoreError(INVALID_MUTATION)
    if kind == "REVERSAL" and any(item["kind"] == "REVERSAL" and item["source"] == source_reference for item in current_relations):
        raise FinKoreError(INVALID_MUTATION)
    audit_history = append_event(input_value.get("auditHistory", []), input_value.get("auditEvent"))
    relation = _relation(kind, relation_id, source, source_revision, related, related_revision, scope, input_value["auditEvent"]["eventId"])
    if kind in ("CORRECTION", "REVERSAL"):
        relation["sourceCurrent"] = current
    _validate_evolution_evidence(input_value["auditEvent"], relation)
    next_history = import_evolution_history({"relations": [*current_relations, relation]})
    result: dict[str, Any] = {
        "source": source,
        "relation": relation,
        "evolutionHistory": next_history,
        "auditHistory": audit_history,
        "auditEvent": deepcopy(input_value.get("auditEvent")),
    }
    if related is not None:
        result["related"] = related
    return result


def _validate_evolution_evidence(event: dict[str, Any], relation: dict[str, Any]) -> None:
    metadata = event.get("metadata")
    evidence = metadata.get("entityEvolution") if isinstance(metadata, dict) else None
    if not isinstance(evidence, dict) or any(evidence.get(key) != relation[key] for key in ("kind", "relationId")):
        raise FinKoreError(INVALID_MUTATION)
    for key in ("source", "related"):
        if key not in relation:
            if key in evidence:
                raise FinKoreError(INVALID_MUTATION)
        elif not isinstance(evidence.get(key), dict) or any(evidence[key].get(part) != relation[key][part] for part in ("type", "id", "revision")):
            raise FinKoreError(INVALID_MUTATION)
    if ("supersessionScope" in evidence) != ("supersessionScope" in relation) or evidence.get("supersessionScope") != relation.get("supersessionScope"):
        raise FinKoreError(INVALID_MUTATION)
    if event["entity"] != {"type": relation["source"]["type"], "id": relation["source"]["id"]}:
        raise FinKoreError(INVALID_MUTATION)
    relationship_type = {"CORRECTION": "CORRECTS", "REVERSAL": "REVERSES", "VOID": "VOIDS", "SUPERSESSION": "SUPERSEDES"}[relation["kind"]]
    if not any(item["type"] == relationship_type for item in event.get("relationships", [])):
        raise FinKoreError(INVALID_MUTATION)


def _validate_entity_data(definition: dict[str, Any], entity: dict[str, Any]) -> None:
    findings = []
    for rule in definition.get("validation", []):
        if isinstance(rule, dict) and rule.get("rule") == "positive-money":
            try:
                money = Money.from_portable(entity["data"].get(rule.get("path")))
            except FinKoreError:
                findings.append({"rule": rule.get("id"), "path": rule.get("path")})
                continue
            if money.amount <= Decimal("0"):
                findings.append({"rule": rule.get("id"), "path": rule.get("path")})
        elif isinstance(rule, dict) and rule.get("rule") == "money-not-greater-than":
            try:
                value = Money.from_portable(entity["data"].get(rule.get("path")))
                other = Money.from_portable(entity["data"].get(rule.get("otherPath")))
                valid = value.compare(other) != "GREATER"
            except FinKoreError:
                valid = False
            if not valid:
                findings.append({"rule": rule.get("id"), "path": rule.get("path")})
    if findings:
        error = FinKoreError(VALIDATION_FAILED)
        error.findings = findings
        raise error


def _identity_mapping(mapping: Any, entity: dict[str, Any], source_identity: Any) -> dict[str, Any]:
    if not isinstance(mapping, dict) or not _opaque(mapping.get("mappingId")) or not _opaque(mapping.get("sourceSystem")) or not _opaque(mapping.get("sourceId")):
        raise FinKoreError(INVALID_IDENTITY)
    if source_identity is not None and (mapping["sourceSystem"] != source_identity.get("sourceSystem") or mapping["sourceId"] != source_identity.get("sourceId")):
        raise FinKoreError(INVALID_IDENTITY)
    if mapping.get("entity") != {"type": entity["type"], "id": entity["id"]}:
        raise FinKoreError(INVALID_IDENTITY)
    return deepcopy(mapping)


def _revision(value: Any, entity: dict[str, Any], current: bool) -> dict[str, Any]:
    if isinstance(value, str):
        if not _opaque(value) or value == entity["id"]:
            raise FinKoreError(INVALID_IDENTITY)
        return {"type": entity["type"], "id": entity["id"], "revision": value, "current": current}
    if not isinstance(value, dict) or value.get("type") != entity["type"] or value.get("id") != entity["id"] or not _opaque(value.get("revision")):
        raise FinKoreError(INVALID_IDENTITY)
    if value["revision"] == entity["id"]:
        raise FinKoreError(INVALID_IDENTITY)
    if "current" in value and (not isinstance(value["current"], bool) or value["current"] != current):
        raise FinKoreError(INVALID_IDENTITY)
    return {"type": value["type"], "id": value["id"], "revision": value["revision"], "current": current}


def _opaque_revision(value: Any, entity: dict[str, Any] | None) -> str:
    if entity is None or not _opaque(value) or value == entity["id"]:
        raise FinKoreError(INVALID_IDENTITY)
    return value


def _relation(kind: str, relation_id: str, source: dict[str, Any], source_revision: str, related: dict[str, Any] | None, related_revision: str | None, scope: Any, audit_event_id: Any) -> dict[str, Any]:
    if not _opaque(audit_event_id):
        raise FinKoreError(INVALID_MUTATION)
    relation: dict[str, Any] = {
        "relationId": relation_id,
        "kind": kind,
        "source": {"type": source["type"], "id": source["id"], "revision": source_revision},
        "sourceCurrent": kind not in {"VOID", "SUPERSESSION"},
        "auditEventId": audit_event_id,
    }
    if related is not None and related_revision is not None:
        relation["related"] = {"type": related["type"], "id": related["id"], "revision": related_revision}
        relation["relatedCurrent"] = True
    if kind == "SUPERSESSION":
        if not _opaque(scope):
            raise FinKoreError(INVALID_MUTATION)
        relation["supersessionScope"] = scope
    return relation
