# SPDX-License-Identifier: MPL-2.0
"""FinKore Approval requirement, decision, chain, and composition behavior."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
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
    """Validate an Approval Requirement definition.

    @see APPROVAL-REQUIREMENT-001
    @see APPROVAL-REQUIREMENT-004
    """

    if not isinstance(requirement, dict) or not _opaque(requirement.get("id")):
        raise FinKoreError(INVALID_DECISION)
    if "subject" in requirement and not isinstance(requirement["subject"], dict):
        raise FinKoreError(INVALID_DECISION)
    if "subject" not in requirement and all(key not in requirement for key in ("applicability", "state")):
        raise FinKoreError(INVALID_DECISION)
    eligible = requirement.get("eligibleActors")
    if eligible is not None and (not isinstance(eligible, list) or any(not _opaque(actor) for actor in eligible)):
        raise FinKoreError(INVALID_DECISION)
    if "eligibleActors" not in requirement and all(key not in requirement for key in ("applicability", "state")):
        raise FinKoreError(INVALID_DECISION)
    if requirement.get("approvedOutcome", "APPROVED") != "APPROVED" or requirement.get("rejectedOutcome", "REJECTED") != "REJECTED":
        raise FinKoreError(INVALID_DECISION)
    return deepcopy(requirement)


def validate_decision(requirement: dict[str, Any], decision: Any) -> dict[str, Any]:
    """Validate an Approval Decision for one requirement."""

    if not isinstance(decision, dict):
        raise FinKoreError(INVALID_DECISION)
    if decision.get("requirementId") != requirement["id"] or decision.get("outcome") not in {"APPROVED", "REJECTED"}:
        raise FinKoreError(INVALID_DECISION)
    actor_id = _actor_id(decision.get("actor"))
    if actor_id is None:
        raise FinKoreError(INVALID_DECISION)
    if actor_id not in requirement.get("eligibleActors", [actor_id]):
        raise FinKoreError(INELIGIBLE_ACTOR)
    _instant(decision.get("decidedAt"))
    if "expiresAt" in decision:
        _instant(decision["expiresAt"])
    return deepcopy(decision)


def normalize_decision_set(decisions: Any) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Return Approval history and lifecycle observations."""

    if decisions is None:
        return [], []
    if isinstance(decisions, list):
        return deepcopy(decisions), []
    if isinstance(decisions, dict):
        history = decisions.get("history", [])
        lifecycle = decisions.get("lifecycle", [])
        if not isinstance(history, list) or not isinstance(lifecycle, list):
            raise FinKoreError(INVALID_DECISION)
        return deepcopy(history), deepcopy(lifecycle)
    raise FinKoreError(INVALID_DECISION)


def record_decision(requirement: Any, decision: Any, history: Any) -> dict[str, Any]:
    """Append an Approval Decision without rewriting prior decisions."""

    req = validate_requirement(requirement)
    current, _ = normalize_decision_set(history)
    recorded = validate_decision(req, decision)
    return {"history": [*current, recorded]}


def evaluate_decision(requirement: Any, decision: Any, current_subject_facts: Any = None, relevant_fact_paths: Any = None, evaluated_at: Any = None) -> str:
    """Evaluate whether one Decision is currently effective for supplied facts."""

    req = validate_requirement(requirement)
    item = validate_decision(req, decision)
    if item.get("effective") is False:
        return "INEFFECTIVE"
    if _expired(item, evaluated_at):
        return "INEFFECTIVE"
    if relevant_fact_paths is not None and not _facts_match(item.get("subjectFacts"), current_subject_facts, relevant_fact_paths):
        return "INEFFECTIVE"
    return "EFFECTIVE"


def evaluate_requirement(requirement: Any, decisions: Any = None, current_subject_facts: Any = None, relevant_fact_paths: Any = None, evaluated_at: Any = None) -> str:
    """Evaluate an Approval Requirement from currently effective Decisions."""

    req = validate_requirement(requirement)
    history, lifecycle = normalize_decision_set(decisions)
    approved = False
    rejected = False
    for decision in history:
        if _decision_current(req, decision, lifecycle, current_subject_facts, relevant_fact_paths, evaluated_at):
            approved = approved or decision.get("outcome") == "APPROVED"
            rejected = rejected or decision.get("outcome") == "REJECTED"
    if rejected:
        return "REJECTED"
    if approved:
        return "APPROVED"
    return "PENDING"


def evaluate_condition(condition: Any, facts: Any, result: Any = None) -> str:
    """Evaluate an explicitly supplied Approval condition result."""

    if not isinstance(condition, dict) or not isinstance(facts, dict):
        raise FinKoreError(CONDITION_UNRESOLVED)
    for fact in condition.get("requiredFacts", []):
        if fact not in facts:
            raise FinKoreError(CONDITION_UNRESOLVED)
    if result not in {"APPLICABLE", "NOT_APPLICABLE"}:
        raise FinKoreError(CONDITION_UNRESOLVED)
    return result


def evaluate_chain(chain: Any, states: Any) -> Any:
    """Evaluate a Core 0.9 release candidate all-required Approval Chain."""

    if not isinstance(chain, dict) or not isinstance(states, dict):
        raise FinKoreError(INVALID_CHAIN)
    requirements = chain.get("requirements")
    if not isinstance(requirements, list) or len(requirements) == 0 or any(not _opaque(item) for item in requirements):
        raise FinKoreError(INVALID_CHAIN)
    if len(set(requirements)) != len(requirements) or chain.get("mode") not in {"SEQUENTIAL", "UNORDERED"}:
        raise FinKoreError(INVALID_CHAIN)
    if any(states.get(requirement) not in {"APPROVED", "REJECTED", "PENDING", "NOT_APPLICABLE"} for requirement in requirements):
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
    """Record lifecycle evidence withdrawing one committed Decision."""

    validate_requirement(requirement)
    current, lifecycle = normalize_decision_set(history)
    event = _lifecycle(withdrawal, "WITHDRAWN")
    target = event["target"]
    if _find_decision(current, target) is None or any(item.get("type") == "WITHDRAWN" and item.get("target") == target for item in lifecycle):
        raise FinKoreError(INVALID_DECISION)
    return {"history": current, "lifecycle": [*lifecycle, event]}


def supersede_decision(history: Any, supersession: Any) -> dict[str, Any]:
    """Record lifecycle evidence superseding one committed Decision with another."""

    current, lifecycle = normalize_decision_set(history)
    event = _lifecycle(supersession, "DECISION_SUPERSEDED", successor=True)
    if _find_decision(current, event["target"]) is None or _find_decision(current, event["successor"]) is None:
        raise FinKoreError(INVALID_DECISION)
    return {"history": current, "lifecycle": [*lifecycle, event]}


def supersede_requirement(history: Any, supersession: Any) -> dict[str, Any]:
    """Record lifecycle evidence superseding a requirement identity."""

    current, lifecycle = normalize_decision_set(history)
    if not isinstance(supersession, dict) or not _opaque(supersession.get("targetRequirementId")) or not _opaque(supersession.get("successorRequirementId")):
        raise FinKoreError(INVALID_DECISION)
    _instant(supersession.get("recordedAt"))
    return {"history": current, "lifecycle": [*lifecycle, {"type": "REQUIREMENT_SUPERSEDED", **deepcopy(supersession)}]}


@dataclass
class GroupResult:
    outcome: str
    applicable: bool
    actionables: list[str]


def evaluate_composition(composition: Any, requirements: Any, decisions: Any = None, context: Any = None) -> dict[str, Any]:
    """Evaluate bounded Approval Composition groups, quorum, and stages."""

    groups = _validate_composition_structure(composition)
    reqs = _validate_composition_requirements(requirements, context)
    decision_history = deepcopy(decisions) if isinstance(decisions, list) else []
    _validate_composition_evidence(reqs, decision_history)
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


def _decision_current(req: dict[str, Any], decision: dict[str, Any], lifecycle: list[dict[str, Any]], current_subject_facts: Any, relevant_fact_paths: Any, evaluated_at: Any) -> bool:
    try:
        validate_decision(req, decision)
    except FinKoreError:
        return False
    key = _decision_key(decision)
    if any(item.get("type") in {"WITHDRAWN", "DECISION_SUPERSEDED"} and item.get("target") == key for item in lifecycle):
        return False
    if any(item.get("type") == "REQUIREMENT_SUPERSEDED" and item.get("targetRequirementId") == req["id"] for item in lifecycle):
        return False
    if decision.get("effective") is False:
        return False
    if _expired(decision, evaluated_at):
        return False
    if relevant_fact_paths is not None and not _facts_match(decision.get("subjectFacts"), current_subject_facts, relevant_fact_paths):
        return False
    return True


def _expired(decision: dict[str, Any], evaluated_at: Any) -> bool:
    if "expiresAt" not in decision:
        return False
    if evaluated_at is None:
        raise FinKoreError(INVALID_CONTEXT)
    return _instant(evaluated_at, INVALID_CONTEXT) >= _instant(decision["expiresAt"], INVALID_CONTEXT)


def _facts_match(decision_facts: Any, current_facts: Any, paths: Any) -> bool:
    if not isinstance(paths, list) or any(not _opaque(path) for path in paths):
        raise FinKoreError(INVALID_DECISION)
    for fact_path in paths:
        left = _path(decision_facts, fact_path)
        right = _path(current_facts, fact_path)
        if left is _MISSING or right is _MISSING or left != right:
            return False
    return True


def _decision_key(decision: dict[str, Any]) -> dict[str, str]:
    actor_id = _actor_id(decision.get("actor"))
    if actor_id is None or not _opaque(decision.get("requirementId")) or not _opaque(decision.get("decidedAt")):
        raise FinKoreError(INVALID_DECISION)
    return {"requirementId": decision["requirementId"], "actorId": actor_id, "decidedAt": decision["decidedAt"]}


def _find_decision(history: list[dict[str, Any]], target: dict[str, Any]) -> dict[str, Any] | None:
    return next((decision for decision in history if _decision_key(decision) == target), None)


def _lifecycle(value: Any, lifecycle_type: str, successor: bool = False) -> dict[str, Any]:
    if not isinstance(value, dict) or not isinstance(value.get("target"), dict):
        raise FinKoreError(INVALID_DECISION)
    _instant(value.get("recordedAt"))
    event = {"type": lifecycle_type, **deepcopy(value)}
    if successor and not isinstance(value.get("successor"), dict):
        raise FinKoreError(INVALID_DECISION)
    return event


def _validate_composition_structure(composition: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(composition, dict) or not isinstance(composition.get("groups"), list):
        raise FinKoreError(INVALID_CHAIN)
    if ("rootGroup" in composition) == ("stages" in composition):
        raise FinKoreError(INVALID_CHAIN)
    groups: dict[str, dict[str, Any]] = {}
    for group in composition["groups"]:
        if not isinstance(group, dict) or not _opaque(group.get("id")) or group["id"] in groups or group.get("kind") not in {"ALL_OF", "ANY_OF", "N_OF_M"}:
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
    roots = [composition["rootGroup"]] if "rootGroup" in composition else [group_id for stage in composition.get("stages", []) for group_id in stage.get("groups", [])]
    if "stages" in composition and (not isinstance(composition["stages"], list) or len(composition["stages"]) == 0):
        raise FinKoreError(INVALID_CHAIN)
    for stage in composition.get("stages", []):
        if not isinstance(stage, dict) or not isinstance(stage.get("groups"), list) or len(stage["groups"]) == 0:
            raise FinKoreError(INVALID_CHAIN)
    for root in roots:
        _check_group(root, groups, 1, [])
    return groups


def _check_group(group_id: str, groups: dict[str, dict[str, Any]], depth: int, path: list[str]) -> None:
    if group_id not in groups or group_id in path or depth > 4:
        raise FinKoreError(INVALID_CHAIN)
    for member in groups[group_id]["members"]:
        if member["type"] == "group":
            _check_group(member["groupId"], groups, depth + 1, [*path, group_id])


def _validate_composition_requirements(requirements: Any, context: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(requirements, list):
        raise FinKoreError(INVALID_CHAIN)
    reqs: dict[str, dict[str, Any]] = {}
    unresolved = False
    invalid_context = False
    invalid_state = False
    for requirement in requirements:
        if not isinstance(requirement, dict) or not _opaque(requirement.get("id")) or requirement["id"] in reqs:
            raise FinKoreError(INVALID_CHAIN)
        applicability = requirement.get("applicability", "APPLICABLE")
        if applicability == "UNRESOLVED":
            unresolved = True
        elif applicability not in {"APPLICABLE", "NOT_APPLICABLE"}:
            invalid_state = True
        if requirement.get("requiresEvaluationContext") is True and (not isinstance(context, dict) or "evaluatedAt" not in context):
            invalid_context = True
        if "state" in requirement and requirement["state"] not in {"APPROVED", "REJECTED", "PENDING"}:
            invalid_state = True
        reqs[requirement["id"]] = requirement
    if unresolved:
        raise FinKoreError(CONDITION_UNRESOLVED)
    if invalid_context:
        raise FinKoreError(INVALID_CONTEXT)
    if invalid_state:
        raise FinKoreError(INVALID_CHAIN)
    return reqs


def _validate_composition_evidence(reqs: dict[str, dict[str, Any]], decisions: list[dict[str, Any]]) -> None:
    for decision in decisions:
        if not isinstance(decision, dict) or not _opaque(decision.get("requirementId")) or decision["requirementId"] not in reqs:
            raise FinKoreError(INVALID_CHAIN)
        actor_id = _actor_id(decision.get("actor"))
        if actor_id is None or decision.get("outcome") not in {"APPROVED", "REJECTED"}:
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
        state = req.get("state", "PENDING")
    return GroupResult(state, True, [req["id"]] if state == "PENDING" else [])


def _quorum_member_state(req: dict[str, Any], member: dict[str, Any], decisions: list[dict[str, Any]]) -> str:
    voter_id = member["voter"]["id"]
    approved = False
    rejected = False
    for decision in decisions:
        if decision.get("requirementId") != req["id"] or _actor_id(decision.get("actor")) != voter_id or decision.get("effective") is False:
            continue
        if voter_id not in req.get("eligibleActors", [voter_id]):
            continue
        approved = approved or decision.get("outcome") == req.get("approvedOutcome", "APPROVED")
        rejected = rejected or decision.get("outcome") == req.get("rejectedOutcome", "REJECTED")
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
