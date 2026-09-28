# SPDX-License-Identifier: MPL-2.0
"""FinKore Approval requirement, decision, chain, and composition behavior."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from ._timestamp import parse_portable_timestamp
from .errors import FinKoreError

REQUIRED = "FINKORE_APPROVAL_REQUIRED"
INVALID_DECISION = "FINKORE_APPROVAL_INVALID_DECISION"
INELIGIBLE_ACTOR = "FINKORE_APPROVAL_INELIGIBLE_ACTOR"
INVALID_CHAIN = "FINKORE_APPROVAL_INVALID_CHAIN"
CONDITION_UNRESOLVED = "FINKORE_APPROVAL_CONDITION_UNRESOLVED"
INVALID_CONTEXT = "FINKORE_APPROVAL_INVALID_CONTEXT"


def _opaque(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _actor_id(actor: Any) -> str | None:
    if not isinstance(actor, dict) or not _opaque(actor.get("id")):
        return None
    return actor["id"]


def _instant(value: Any, code: str = INVALID_DECISION) -> tuple[int, int]:
    try:
        return parse_portable_timestamp(value)
    except ValueError as error:
        raise FinKoreError(code) from error


def _path(value: Any, path: str) -> Any:
    current = value
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return _MISSING
        current = current[part]
    return current


class _Missing:
    pass


_MISSING = _Missing()


def validate_requirement(requirement: Any) -> dict[str, Any]:
    """Validate a concrete Requirement's subject and nonempty distinct eligibility.

    Explicit approved/rejected mappings must be supported and distinct; swapped
    mappings are valid. Lightweight composition observations are validated separately. Malformed
    declarations raise INVALID_DECISION; inputs remain unchanged.

    @see APPROVAL-REQUIREMENT-001
    @see APPROVAL-REQUIREMENT-002
    @see APPROVAL-REQUIREMENT-003
    @see APPROVAL-REQUIREMENT-004
    """

    if not isinstance(requirement, dict) or not _opaque(requirement.get("id")):
        raise FinKoreError(INVALID_DECISION)
    subject = requirement.get("subject")
    if not isinstance(subject, dict) or not _opaque(subject.get("type")) or not _opaque(subject.get("id")):
        raise FinKoreError(INVALID_DECISION)
    eligible = requirement.get("eligibleActors")
    if not isinstance(eligible, list) or not eligible or any(not _opaque(actor) for actor in eligible) or len(set(eligible)) != len(eligible):
        raise FinKoreError(INVALID_DECISION)
    if requirement.get("approvedOutcome") not in ("APPROVED", "REJECTED") or requirement.get("rejectedOutcome") not in ("APPROVED", "REJECTED") or requirement["approvedOutcome"] == requirement["rejectedOutcome"]:
        raise FinKoreError(INVALID_DECISION)
    return deepcopy(requirement)


def validate_decision(requirement: dict[str, Any], decision: Any) -> dict[str, Any]:
    """Validate a complete Decision against a validated concrete Requirement.

    Missing association is INVALID_DECISION, while a valid declaration excluding
    the deciding Actor yields INELIGIBLE_ACTOR. Returns an independent copy.
    See APPROVAL-DECISION-001/002/005 and APPROVAL-ERROR-001/005.
    """

    item = _validate_decision_shape(decision)
    if item["requirementId"] != requirement["id"]:
        raise FinKoreError(INVALID_DECISION)
    actor_id = _actor_id(item["actor"])
    if actor_id not in requirement.get("eligibleActors", [actor_id]):
        raise FinKoreError(INELIGIBLE_ACTOR)
    return item


def _validate_decision_shape(decision: Any) -> dict[str, Any]:
    # Validate imported evidence independently of its current applicability.
    if not isinstance(decision, dict) or not _opaque(decision.get("requirementId")):
        raise FinKoreError(INVALID_DECISION)
    if decision.get("outcome") not in ("APPROVED", "REJECTED") or _actor_id(decision.get("actor")) is None:
        raise FinKoreError(INVALID_DECISION)
    if "type" in decision["actor"] and not _opaque(decision["actor"]["type"]):
        raise FinKoreError(INVALID_DECISION)
    if "subjectFacts" not in decision:
        raise FinKoreError(INVALID_DECISION)
    _instant(decision.get("decidedAt"))
    if "expiresAt" in decision:
        _instant(decision["expiresAt"])
    return deepcopy(decision)


def normalize_decision_set(decisions: Any = _MISSING) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Validate every concrete Decision and return defensive history observations.

    Omission is an empty native history; explicit None or an envelope without
    its history array is INVALID_DECISION. Missing subjectFacts is INVALID_DECISION, including on ineffective or
    unrelated evidence; explicit null remains valid. Lifecycle evidence is
    validated in local order against committed Decisions and prior lifecycle
    events, including unique references and nonrepeatable targets. Invalid
    evidence raises INVALID_DECISION. See APPROVAL-VALIDITY-014,
    APPROVAL-DECISION-001/002 and APPROVAL-ERROR-005.
    """

    if decisions is _MISSING:
        return [], []
    if isinstance(decisions, list):
        return [_validate_decision_shape(item) for item in decisions], []
    if isinstance(decisions, dict):
        history = decisions.get("history")
        lifecycle = decisions.get("lifecycle", [])
        if not isinstance(history, list) or not isinstance(lifecycle, list):
            raise FinKoreError(INVALID_DECISION)
        current = [_validate_decision_shape(item) for item in history]
        validated: list[dict[str, Any]] = []
        for event in lifecycle:
            validated.append(_validate_lifecycle(event, current, validated))
        return current, validated
    raise FinKoreError(INVALID_DECISION)


def record_decision(requirement: Any, decision: Any, history: Any) -> dict[str, Any]:
    """Append a Decision, preserving committed Decisions and lifecycle evidence.

    Inputs are not mutated, including on validation failure. Returned history
    owns its data for supported retained values. Before returning, the proposed
    history is revalidated so no retained lifecycle reference becomes ambiguous
    (APPROVAL-VALIDITY-015). See APPROVAL-DECISION-007 and VALIDITY-001/002/012.
    The Requirement needs a subject type/id and nonempty distinct eligibility.
    Every new or historical Decision needs explicit subjectFacts (null is valid);
    malformed declarations/evidence raise INVALID_DECISION. A valid eligibility
    declaration excluding the new Decision's Actor raises INELIGIBLE_ACTOR.
    """

    req = validate_requirement(requirement)
    current, lifecycle = normalize_decision_set(history)
    recorded = validate_decision(req, decision)
    result = {"history": [*current, recorded]}
    if lifecycle:
        result["lifecycle"] = lifecycle
    normalize_decision_set(result)
    return result


def evaluate_decision(requirement: Any, decision: Any, current_subject_facts: Any = _MISSING, relevant_fact_paths: Any = _MISSING, evaluated_at: Any = None) -> str:
    """Evaluate whether one Decision is currently effective for supplied facts.

    Expiration requires a valid portable evaluated_at and compares exact instants.
    Omit paths to compare the complete facts; explicit None/empty paths are invalid.
    Current facts are required, with None a supplied value. Nonempty dot-separated
    paths select own object members, and each must exist in both
    fact sets. This observation does not claim lifecycle-aware effectiveness.
    Comparison distinguishes JSON Booleans from numbers, including within
    objects and arrays. Object member order is immaterial; array order matters.
    The Decision and caller-supplied facts are not mutated.
    Missing association or malformed concrete Requirement eligibility raises
    INVALID_DECISION before effectiveness evaluation; explicit null facts are valid.

    @see APPROVAL-DECISION-003
    @see APPROVAL-DECISION-002
    @see APPROVAL-DECISION-007
    @see APPROVAL-DECISION-009
    @see APPROVAL-VALIDITY-013
    @see APPROVAL-VALIDITY-003
    @see APPROVAL-VALIDITY-012
    """

    req = validate_requirement(requirement)
    item = validate_decision(req, decision)
    _validate_comparison(current_subject_facts, relevant_fact_paths)
    if _expired(item, evaluated_at):
        return "INEFFECTIVE"
    if not _facts_match(item.get("subjectFacts"), current_subject_facts, relevant_fact_paths):
        return "INEFFECTIVE"
    return "EFFECTIVE"


def evaluate_requirement(requirement: Any, decisions: Any = _MISSING, current_subject_facts: Any = _MISSING, relevant_fact_paths: Any = _MISSING, evaluated_at: Any = None) -> str:
    """Evaluate an Approval Requirement from currently effective Decisions.

    Omit both facts and paths for history-only evaluation. Supplied facts, including
    None, are compared completely when paths are omitted; explicit None/empty paths
    are invalid, even without effective Decisions. Omitted decisions default to an
    empty native history; supplied None or an envelope without history is invalid.
    A Decision whose declared relevant facts changed can neither satisfy nor
    reject the Requirement. JSON Booleans remain distinct from numbers at
    every nesting level; object member order is ignored and array order retained.
    Committed decisions, lifecycle evidence, and supplied facts remain unchanged.
    All historical Decisions and lifecycle relationships are validated before
    filtering. Every considered expiring Decision requires valid context even if
    stale or preceded by rejection. Unrelated/lifecycle-excluded Decisions do not.
    Missing association raises INVALID_DECISION even for withdrawn or unrelated evidence.

    @see APPROVAL-DECISION-003
    @see APPROVAL-DECISION-002
    @see APPROVAL-DECISION-007
    @see APPROVAL-VALIDITY-002
    @see APPROVAL-DECISION-009
    @see APPROVAL-VALIDITY-013
    @see APPROVAL-VALIDITY-003
    @see APPROVAL-VALIDITY-012
    """

    req = validate_requirement(requirement)
    history, lifecycle = normalize_decision_set(decisions)
    _validate_comparison(current_subject_facts, relevant_fact_paths, allow_omission=True)
    for decision in history:
        if _decision_considered(req, decision, lifecycle) and "expiresAt" in decision:
            _instant(evaluated_at, INVALID_CONTEXT)
    approved = False
    rejected = False
    for decision in history:
        if _decision_current(req, decision, lifecycle, current_subject_facts, relevant_fact_paths, evaluated_at):
            approved = approved or decision["outcome"] == req["approvedOutcome"]
            rejected = rejected or decision["outcome"] == req["rejectedOutcome"]
    if rejected:
        return "REJECTED"
    if approved:
        return "APPROVED"
    return "PENDING"


def evaluate_condition(condition: Any, facts: Any = _MISSING, result: Any = None) -> str:
    """Validate a declaration and own-member fact completeness before its result.

    Malformed declarations/facts use INVALID_DECISION; unavailable required facts
    or results use CONDITION_UNRESOLVED. Explicit null/false/zero leaves are
    present. Inputs remain unchanged. See APPROVAL-CONDITION-007 and FACT-002.
    """
    if not isinstance(condition, dict) or not _opaque(condition.get("id")) or not _opaque(condition.get("evaluation")):
        raise FinKoreError(INVALID_DECISION)
    paths = _validate_paths(condition.get("requiredFacts"))
    if len(set(paths)) != len(paths):
        raise FinKoreError(INVALID_DECISION)
    if facts is _MISSING:
        raise FinKoreError(CONDITION_UNRESOLVED)
    if not isinstance(facts, dict):
        raise FinKoreError(INVALID_DECISION)
    if any(_path(facts, path) is _MISSING for path in paths):
        raise FinKoreError(CONDITION_UNRESOLVED)
    if result not in ("APPLICABLE", "NOT_APPLICABLE"):
        raise FinKoreError(CONDITION_UNRESOLVED)
    return result


def evaluate_chain(chain: Any, states: Any) -> Any:
    """Evaluate the bounded all-required Chain without mutating inputs.

    A concrete declaration requires explicit rejectionOutcome REJECTED;
    malformed declarations/states raise INVALID_CHAIN (APPROVAL-CHAIN-007).
    """

    if not isinstance(chain, dict) or not isinstance(states, dict):
        raise FinKoreError(INVALID_CHAIN)
    if chain.get("rejectionOutcome") != "REJECTED":
        raise FinKoreError(INVALID_CHAIN)
    requirements = chain.get("requirements")
    if not isinstance(requirements, list) or len(requirements) == 0 or any(not _opaque(item) for item in requirements):
        raise FinKoreError(INVALID_CHAIN)
    if len(set(requirements)) != len(requirements) or chain.get("mode") not in ("SEQUENTIAL", "UNORDERED"):
        raise FinKoreError(INVALID_CHAIN)
    if any(states.get(requirement) not in ("APPROVED", "REJECTED", "PENDING", "NOT_APPLICABLE") for requirement in requirements):
        raise FinKoreError(INVALID_CHAIN)
    if any(states[requirement] == "REJECTED" for requirement in requirements):
        return "REJECTED"
    if all(states[requirement] in {"APPROVED", "NOT_APPLICABLE"} for requirement in requirements):
        return "APPROVED"
    if chain["mode"] == "SEQUENTIAL":
        active = next((requirement for requirement in requirements if states[requirement] == "PENDING"), None)
        return {"state": "PENDING", "activeRequirements": [active]} if active is not None else "PENDING"
    return "PENDING"


def withdraw_decision(requirement: Any, history: Any, withdrawal: Any) -> dict[str, Any]:
    """Withdraw exactly one committed, not withdrawn or superseded Decision.

    An invalid target raises FINKORE_APPROVAL_INVALID_DECISION without changing
    either history. Ancillary request ``type`` cannot override withdrawal.
    See APPROVAL-VALIDITY-004/005/012.
    """

    req = validate_requirement(requirement)
    current, lifecycle = normalize_decision_set(history)
    event = _validate_lifecycle(_lifecycle(withdrawal, "WITHDRAWN"), current, lifecycle)
    if event["target"].get("requirementId") != req["id"]:
        raise FinKoreError(INVALID_DECISION)
    if _actor_id(event.get("actor")) not in req["eligibleActors"]:
        raise FinKoreError(INELIGIBLE_ACTOR)
    return {"history": current, "lifecycle": [*lifecycle, event]}


def supersede_decision(history: Any, supersession: Any) -> dict[str, Any]:
    """Supersede a committed Decision, preserving both histories and inputs.

    Ancillary request ``type`` cannot override Decision supersession.
    See APPROVAL-VALIDITY-010/012.
    """

    current, lifecycle = normalize_decision_set(history)
    event = _validate_lifecycle(_lifecycle(supersession, "DECISION_SUPERSEDED"), current, lifecycle)
    return {"history": current, "lifecycle": [*lifecycle, event]}


def supersede_requirement(history: Any, supersession: Any) -> dict[str, Any]:
    """Supersede a Requirement identity, preserving both histories and inputs.

    Ancillary request ``type`` cannot override Requirement supersession.
    See APPROVAL-VALIDITY-011/012.
    """

    current, lifecycle = normalize_decision_set(history)
    if not isinstance(supersession, dict):
        raise FinKoreError(INVALID_DECISION)
    event = _validate_lifecycle({**supersession, "type": "REQUIREMENT_SUPERSEDED"}, current, lifecycle)
    return {"history": current, "lifecycle": [*lifecycle, event]}


@dataclass
class GroupResult:
    outcome: str
    applicable: bool
    actionables: list[str]


def evaluate_composition(composition: Any, requirements: Any, decisions: Any = _MISSING, context: Any = None) -> dict[str, Any]:
    """Evaluate bounded Approval Composition groups, quorum, and stages.

    Omitted decisions mean an empty list; explicitly supplied None is invalid.
    Every supplied quorum Decision must have explicit Boolean ``effective``
    evidence; false is valid but cannot count as a vote. Invalid evidence raises
    FINKORE_APPROVAL_INVALID_CHAIN before any outcome, following the structure,
    applicability, context, then state/effectiveness priority. Inputs are not
    mutated. All declared groups, including disconnected groups, must be acyclic
    with resolved references. Applicable quorum observations require explicit
    eligibility and distinct outcome mappings, including unused members; unused
    members never become actionable. Depth four applies to actual root paths.
    See APPROVAL-COMPOSITION-004/006/007/024 and APPROVAL-ERROR-010.
    """

    groups = _validate_composition_structure(composition)
    reqs = _validate_composition_requirements(requirements, context, groups)
    if decisions is not _MISSING and not isinstance(decisions, list):
        raise FinKoreError(INVALID_CHAIN)
    decision_history = deepcopy(decisions) if decisions is not _MISSING else []
    _validate_composition_evidence(reqs, decision_history)
    for group in groups.values():
        if group["kind"] == "N_OF_M":
            for member in group["members"]:
                req = reqs[member["requirementId"]]
                if req["applicability"] == "APPLICABLE":
                    _quorum_member_state(req, member, decision_history)
    if "stages" in composition:
        stage_results: list[GroupResult] = []
        for stage in composition["stages"]:
            roots = [_evaluate_group(group_id, groups, reqs, decision_history, 1, []) for group_id in stage["groups"]]
            applicable = [result for result in roots if result.applicable]
            if not applicable:
                stage_results.append(GroupResult("APPROVED", False, []))
            elif any(result.outcome == "REJECTED" for result in applicable):
                stage_results.append(GroupResult("REJECTED", True, []))
            elif all(result.outcome == "APPROVED" for result in applicable):
                stage_results.append(GroupResult("APPROVED", True, []))
            else:
                actionables = _dedupe([item for result in applicable if result.outcome == "PENDING" for item in result.actionables])
                stage_results.append(GroupResult("PENDING", True, actionables))
        for result in stage_results:
            if result.outcome != "APPROVED":
                return {"outcome": result.outcome, "actionableRequirements": result.actionables if result.outcome == "PENDING" else []}
        return {"outcome": "APPROVED", "actionableRequirements": []}
    result = _evaluate_group(composition["rootGroup"], groups, reqs, decision_history, 1, [])
    outcome = result.outcome if result.applicable else "APPROVED"
    return {"outcome": outcome, "actionableRequirements": result.actionables if outcome == "PENDING" else []}


def _decision_considered(req: dict[str, Any], decision: dict[str, Any], lifecycle: list[dict[str, Any]]) -> bool:
    if decision["requirementId"] != req["id"]:
        return False
    key = _decision_key(decision)
    return not any(
        (item["type"] in ("WITHDRAWN", "DECISION_SUPERSEDED") and _same_decision_ref(item["target"], key))
        or (item["type"] == "REQUIREMENT_SUPERSEDED" and item["targetRequirementId"] == req["id"])
        for item in lifecycle
    )


def _decision_current(req: dict[str, Any], decision: dict[str, Any], lifecycle: list[dict[str, Any]], current_subject_facts: Any, relevant_fact_paths: Any, evaluated_at: Any) -> bool:
    if not _decision_considered(req, decision, lifecycle):
        return False
    try:
        validate_decision(req, decision)
    except FinKoreError:
        return False
    if _expired(decision, evaluated_at):
        return False
    if decision.get("effective") is False:
        return False
    if current_subject_facts is not _MISSING and not _facts_match(decision.get("subjectFacts"), current_subject_facts, relevant_fact_paths):
        return False
    return True


def _expired(decision: dict[str, Any], evaluated_at: Any) -> bool:
    if "expiresAt" not in decision:
        return False
    if evaluated_at is None:
        raise FinKoreError(INVALID_CONTEXT)
    return _instant(evaluated_at, INVALID_CONTEXT) >= _instant(decision["expiresAt"], INVALID_CONTEXT)


def _json_fact_equal(left: Any, right: Any) -> bool:
    """Compare JSON facts without Python's Boolean/numeric equality coercion.

    Containers must be traversed before using native scalar equality so that
    nested Booleans cannot compare equal to numbers. Accepted numeric scalars
    compare exactly, independent of decimal scale or ambient context. Finite floats use their roundtrip decimal value.

    @see APPROVAL-DECISION-003
    @see APPROVAL-DECISION-009
    @see APPROVAL-VALIDITY-013
    @see APPROVAL-VALIDITY-003
    """
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    if isinstance(left, dict) or isinstance(right, dict):
        if not isinstance(left, dict) or not isinstance(right, dict) or left.keys() != right.keys():
            return False
        return all(_json_fact_equal(left[key], right[key]) for key in left)
    if isinstance(left, list) or isinstance(right, list):
        if not isinstance(left, list) or not isinstance(right, list) or len(left) != len(right):
            return False
        return all(_json_fact_equal(a, b) for a, b in zip(left, right))
    numeric = (int, float, Decimal)
    if type(left) in numeric or type(right) in numeric:
        if type(left) not in numeric or type(right) not in numeric:
            return False
        a = Decimal(str(left)) if type(left) is float else Decimal(left)
        b = Decimal(str(right)) if type(right) is float else Decimal(right)
        if not a.is_finite() or not b.is_finite():
            raise FinKoreError(INVALID_DECISION)
        return a == b
    return type(left) is type(right) and left == right


def _validate_paths(paths: Any) -> list[str]:
    if not isinstance(paths, list) or not paths or any(not _opaque(path) or any(not part for part in path.split(".")) for path in paths):
        raise FinKoreError(INVALID_DECISION)
    return paths


def _validate_comparison(current_facts: Any, paths: Any, allow_omission: bool = False) -> None:
    if paths is not _MISSING:
        _validate_paths(paths)
    if current_facts is _MISSING and (not allow_omission or paths is not _MISSING):
        raise FinKoreError(INVALID_DECISION)


def _facts_match(decision_facts: Any, current_facts: Any, paths: Any) -> bool:
    if paths is _MISSING:
        return _json_fact_equal(decision_facts, current_facts)
    _validate_paths(paths)
    for fact_path in paths:
        left = _path(decision_facts, fact_path)
        right = _path(current_facts, fact_path)
        if left is _MISSING or right is _MISSING or not _json_fact_equal(left, right):
            return False
    return True


def _decision_key(decision: dict[str, Any]) -> dict[str, str]:
    actor_id = _actor_id(decision.get("actor"))
    if actor_id is None or not _opaque(decision.get("requirementId")) or not _opaque(decision.get("decidedAt")):
        raise FinKoreError(INVALID_DECISION)
    return {"requirementId": decision["requirementId"], "actorId": actor_id, "decidedAt": decision["decidedAt"]}


def _same_decision_ref(left: dict[str, Any], right: dict[str, Any]) -> bool:
    return (left["requirementId"] == right["requirementId"] and left["actorId"] == right["actorId"]
            and _instant(left["decidedAt"]) == _instant(right["decidedAt"]))


def _lifecycle(value: Any, lifecycle_type: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise FinKoreError(INVALID_DECISION)
    return {**deepcopy(value), "type": lifecycle_type}


def _validate_lifecycle(value: Any, history: list[dict[str, Any]], previous: list[dict[str, Any]]) -> dict[str, Any]:
    # Committed event kinds and local-order relationships are evidence (VALIDITY-014).
    if not isinstance(value, dict) or value.get("type") not in ("WITHDRAWN", "DECISION_SUPERSEDED", "REQUIREMENT_SUPERSEDED"):
        raise FinKoreError(INVALID_DECISION)
    actor = value.get("actor")
    if _actor_id(actor) is None or ("type" in actor and not _opaque(actor["type"])):
        raise FinKoreError(INVALID_DECISION)
    _instant(value.get("recordedAt"))
    kind = value["type"]
    if kind == "REQUIREMENT_SUPERSEDED":
        target, successor = value.get("targetRequirementId"), value.get("successorRequirementId")
        if "target" in value or "successor" in value or not _opaque(target) or not _opaque(successor) or target == successor:
            raise FinKoreError(INVALID_DECISION)
        if any(item["type"] == kind and item["targetRequirementId"] == target for item in previous):
            raise FinKoreError(INVALID_DECISION)
    else:
        if "targetRequirementId" in value or "successorRequirementId" in value or (kind == "WITHDRAWN" and "successor" in value):
            raise FinKoreError(INVALID_DECISION)
        for field in (["target", "successor"] if kind == "DECISION_SUPERSEDED" else ["target"]):
            ref = value.get(field)
            if not isinstance(ref, dict) or not _opaque(ref.get("requirementId")) or not _opaque(ref.get("actorId")):
                raise FinKoreError(INVALID_DECISION)
            _instant(ref.get("decidedAt"))
            if sum(_same_decision_ref(_decision_key(decision), ref) for decision in history) != 1:
                raise FinKoreError(INVALID_DECISION)
        if kind == "DECISION_SUPERSEDED" and _same_decision_ref(value["target"], value["successor"]):
            raise FinKoreError(INVALID_DECISION)
        if any(item["type"] in ("WITHDRAWN", "DECISION_SUPERSEDED") and _same_decision_ref(item["target"], value["target"]) for item in previous):
            raise FinKoreError(INVALID_DECISION)
    return deepcopy(value)


def _validate_composition_structure(composition: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(composition, dict) or not isinstance(composition.get("groups"), list):
        raise FinKoreError(INVALID_CHAIN)
    if ("rootGroup" in composition) == ("stages" in composition):
        raise FinKoreError(INVALID_CHAIN)
    groups: dict[str, dict[str, Any]] = {}
    for group in composition["groups"]:
        if not isinstance(group, dict) or not _opaque(group.get("id")) or group["id"] in groups or group.get("kind") not in ("ALL_OF", "ANY_OF", "N_OF_M"):
            raise FinKoreError(INVALID_CHAIN)
        members = group.get("members")
        if not isinstance(members, list) or len(members) == 0:
            raise FinKoreError(INVALID_CHAIN)
        member_ids: set[str] = set()
        voter_ids: set[str] = set()
        for member in members:
            if not isinstance(member, dict) or not _opaque(member.get("id")) or member["id"] in member_ids:
                raise FinKoreError(INVALID_CHAIN)
            member_ids.add(member["id"])
            if group["kind"] == "N_OF_M":
                if member.get("type") != "requirement" or not _opaque(member.get("requirementId")):
                    raise FinKoreError(INVALID_CHAIN)
                voter_id = _actor_id(member.get("voter"))
                if voter_id is None or voter_id in voter_ids:
                    raise FinKoreError(INVALID_CHAIN)
                voter_ids.add(voter_id)
            elif member.get("type") == "requirement":
                if not _opaque(member.get("requirementId")):
                    raise FinKoreError(INVALID_CHAIN)
            elif member.get("type") == "group":
                if not _opaque(member.get("groupId")):
                    raise FinKoreError(INVALID_CHAIN)
            else:
                raise FinKoreError(INVALID_CHAIN)
        if group["kind"] == "N_OF_M" and (not isinstance(group.get("threshold"), int) or isinstance(group.get("threshold"), bool) or group["threshold"] <= 0 or group["threshold"] > len(members)):
            raise FinKoreError(INVALID_CHAIN)
        groups[group["id"]] = group
    if "stages" in composition:
        stages = composition["stages"]
        if not isinstance(stages, list) or not stages:
            raise FinKoreError(INVALID_CHAIN)
        for stage in stages:
            if not isinstance(stage, dict) or not isinstance(stage.get("groups"), list) or not stage["groups"]:
                raise FinKoreError(INVALID_CHAIN)
        roots = [group_id for stage in stages for group_id in stage["groups"]]
    else:
        roots = [composition["rootGroup"]]
    # Validate the entire graph without creating artificial depth roots.
    incoming = dict.fromkeys(groups, 0)
    for group in groups.values():
        for member in group["members"]:
            if member["type"] == "group":
                child = member["groupId"]
                if child not in incoming:
                    raise FinKoreError(INVALID_CHAIN)
                incoming[child] += 1
    pending = [key for key, count in incoming.items() if count == 0]
    visited = 0
    while pending:
        group = groups[pending.pop()]
        visited += 1
        for member in group["members"]:
            if member["type"] == "group":
                child = member["groupId"]
                incoming[child] -= 1
                if incoming[child] == 0:
                    pending.append(child)
    if visited != len(groups):
        raise FinKoreError(INVALID_CHAIN)
    for root in roots:
        _check_group(root, groups, 1, [])
    return groups


def _check_group(group_id: str, groups: dict[str, dict[str, Any]], depth: int, path: list[str]) -> None:
    if not _opaque(group_id) or group_id not in groups or group_id in path or depth > 4:
        raise FinKoreError(INVALID_CHAIN)
    for member in groups[group_id]["members"]:
        if member["type"] == "group":
            _check_group(member["groupId"], groups, depth + 1, [*path, group_id])


def _validate_composition_requirements(requirements: Any, context: Any, groups: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    if not isinstance(requirements, list):
        raise FinKoreError(INVALID_CHAIN)
    reqs: dict[str, dict[str, Any]] = {}
    for requirement in requirements:
        if not isinstance(requirement, dict) or not _opaque(requirement.get("id")) or requirement["id"] in reqs:
            raise FinKoreError(INVALID_CHAIN)
        if "requiresEvaluationContext" in requirement and not isinstance(requirement["requiresEvaluationContext"], bool):
            raise FinKoreError(INVALID_CHAIN)
        reqs[requirement["id"]] = requirement
    members = [(group, member) for group in groups.values() for member in group["members"] if member["type"] == "requirement"]
    if any(member["requirementId"] not in reqs for _, member in members):
        raise FinKoreError(INVALID_CHAIN)
    required = {member["requirementId"] for _, member in members}
    if any(reqs[key].get("applicability") not in ("APPLICABLE", "NOT_APPLICABLE") for key in required):
        raise FinKoreError(CONDITION_UNRESOLVED)
    for key in required:
        req = reqs[key]
        if req["applicability"] == "APPLICABLE" and req.get("requiresEvaluationContext") is True:
            _instant(context.get("evaluatedAt") if isinstance(context, dict) else None, INVALID_CONTEXT)
    for key in required:
        if "state" in reqs[key] and reqs[key]["state"] not in ("APPROVED", "REJECTED", "PENDING"):
            raise FinKoreError(INVALID_CHAIN)
        req = reqs[key]
        if "eligibleActors" in req and (not isinstance(req["eligibleActors"], list) or not all(_opaque(actor) for actor in req["eligibleActors"])):
            raise FinKoreError(INVALID_CHAIN)
        for field in ("approvedOutcome", "rejectedOutcome"):
            if field in req and req[field] not in ("APPROVED", "REJECTED"):
                raise FinKoreError(INVALID_CHAIN)
        if "approvedOutcome" in req and "rejectedOutcome" in req and req["approvedOutcome"] == req["rejectedOutcome"]:
            raise FinKoreError(INVALID_CHAIN)
    for group, member in members:
        req = reqs[member["requirementId"]]
        if req["applicability"] == "APPLICABLE" and group["kind"] != "N_OF_M" and "state" not in req:
            raise FinKoreError(INVALID_CHAIN)
        if req["applicability"] == "APPLICABLE" and group["kind"] == "N_OF_M" and any(field not in req for field in ("eligibleActors", "approvedOutcome", "rejectedOutcome")):
            raise FinKoreError(INVALID_CHAIN)
    return reqs


def _validate_composition_evidence(reqs: dict[str, dict[str, Any]], decisions: list[dict[str, Any]]) -> None:
    for decision in decisions:
        if not isinstance(decision, dict) or not _opaque(decision.get("requirementId")) or decision["requirementId"] not in reqs:
            raise FinKoreError(INVALID_CHAIN)
        if not isinstance(decision.get("effective"), bool):
            raise FinKoreError(INVALID_CHAIN)
        actor_id = _actor_id(decision.get("actor"))
        if actor_id is None or decision.get("outcome") not in ("APPROVED", "REJECTED"):
            raise FinKoreError(INVALID_CHAIN)


def _evaluate_group(group_id: str, groups: dict[str, dict[str, Any]], reqs: dict[str, dict[str, Any]], decisions: list[dict[str, Any]], depth: int, path: list[str]) -> GroupResult:
    group = groups[group_id]
    results = [_evaluate_member(member, group, groups, reqs, decisions, depth, path) for member in group["members"]]
    applicable = [result for result in results if result.applicable]
    if not applicable:
        return GroupResult("APPROVED", False, [])
    if group["kind"] == "ALL_OF":
        if any(result.outcome == "REJECTED" for result in applicable):
            return GroupResult("REJECTED", True, [])
        if all(result.outcome == "APPROVED" for result in applicable):
            return GroupResult("APPROVED", True, [])
        return GroupResult("PENDING", True, _dedupe([item for result in applicable if result.outcome == "PENDING" for item in result.actionables]))
    if group["kind"] == "ANY_OF":
        if any(result.outcome == "APPROVED" for result in applicable):
            return GroupResult("APPROVED", True, [])
        if all(result.outcome == "REJECTED" for result in applicable):
            return GroupResult("REJECTED", True, [])
        return GroupResult("PENDING", True, _dedupe([item for result in applicable if result.outcome == "PENDING" for item in result.actionables]))
    approvals = sum(1 for result in applicable if result.outcome == "APPROVED")
    pending = [result for result in applicable if result.outcome == "PENDING"]
    threshold = group["threshold"]
    if approvals >= threshold:
        return GroupResult("APPROVED", True, [])
    if approvals + len(pending) < threshold:
        return GroupResult("REJECTED", True, [])
    return GroupResult("PENDING", True, _dedupe([item for result in pending for item in result.actionables]))


def _evaluate_member(member: dict[str, Any], group: dict[str, Any], groups: dict[str, dict[str, Any]], reqs: dict[str, dict[str, Any]], decisions: list[dict[str, Any]], depth: int, path: list[str]) -> GroupResult:
    if member["type"] == "group":
        return _evaluate_group(member["groupId"], groups, reqs, decisions, depth + 1, [*path, group["id"]])
    req = reqs.get(member["requirementId"])
    if req is None:
        raise FinKoreError(INVALID_CHAIN)
    if req.get("applicability", "APPLICABLE") == "NOT_APPLICABLE":
        return GroupResult("APPROVED", False, [])
    if group["kind"] == "N_OF_M":
        state = _quorum_member_state(req, member, decisions)
    else:
        state = req["state"]
    return GroupResult(state, True, [req["id"]] if state == "PENDING" else [])


def _quorum_member_state(req: dict[str, Any], member: dict[str, Any], decisions: list[dict[str, Any]]) -> str:
    voter_id = member["voter"]["id"]
    approved = False
    rejected = False
    for decision in decisions:
        if decision.get("requirementId") != req["id"] or _actor_id(decision.get("actor")) != voter_id or decision.get("effective") is False:
            continue
        if voter_id not in req["eligibleActors"]:
            continue
        approved = approved or decision["outcome"] == req["approvedOutcome"]
        rejected = rejected or decision["outcome"] == req["rejectedOutcome"]
    if approved and rejected:
        raise FinKoreError(INVALID_CHAIN)
    if approved:
        return "APPROVED"
    if rejected:
        return "REJECTED"
    return "PENDING"


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result
