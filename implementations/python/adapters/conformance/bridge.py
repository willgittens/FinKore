#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Subprocess bridge from conformance requests to the Python implementation."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Callable

PYTHON_IMPLEMENTATION_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PYTHON_IMPLEMENTATION_ROOT / "core" / "src"))

from finkore.audit import append_event, redact_history, remove_event, replace_event, validate_history
from finkore.approvals import (
    evaluate_chain,
    evaluate_composition,
    evaluate_condition,
    evaluate_decision,
    evaluate_requirement,
    record_decision,
    supersede_decision,
    supersede_requirement,
    withdraw_decision,
)
from finkore.entities import create_entity, evolve_entity, import_entity, mutate_entity, transition_entity
from finkore.errors import FinKoreError
from finkore.money import Money
from finkore.workflow import WorkflowDefinition, WorkflowInstance, create_workflow, import_workflow, transition_workflow


def success(value: Any, observations: dict[str, Any] | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"status": "success", "value": value}
    if observations is not None:
        result["observations"] = observations
    return result


def error(code: str, observations: dict[str, Any] | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"status": "error", "error": {"code": code}}
    if observations is not None:
        result["observations"] = observations
    return result


def parse_money(value: Any) -> Money:
    return Money.from_portable(value)


def money_pair(input_value: dict[str, Any]) -> tuple[Money, Money, dict[str, Any]]:
    left = parse_money(input_value.get("left"))
    right = parse_money(input_value.get("right"))
    observations = {"left": left.to_portable(), "right": right.to_portable()}
    return left, right, observations


def money_operand(input_value: dict[str, Any]) -> tuple[Money, dict[str, Any]]:
    operand = parse_money(input_value.get("value"))
    return operand, {"operand": operand.to_portable()}


def execute_money_deserialize(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(parse_money(input_value.get("value")).to_portable())


def execute_money_serialize(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(parse_money(input_value.get("value")).to_portable())


def execute_money_add(input_value: dict[str, Any]) -> dict[str, Any]:
    left, right, observations = money_pair(input_value)
    return success(left.add(right).to_portable(), observations)


def execute_money_subtract(input_value: dict[str, Any]) -> dict[str, Any]:
    left, right, observations = money_pair(input_value)
    return success(left.subtract(right).to_portable(), observations)


def execute_money_negate(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    return success(operand.negate().to_portable(), observations)


def execute_money_multiply(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    return success(operand.multiply(input_value.get("scalar")).to_portable(), observations)


def execute_money_divide(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    return success(operand.divide(input_value.get("scalar")).to_portable(), observations)


def execute_money_compare(input_value: dict[str, Any]) -> dict[str, Any]:
    left, right, observations = money_pair(input_value)
    return success(left.compare(right), observations)


def execute_money_round(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    return success(operand.round(input_value.get("scale"), input_value.get("mode")).to_portable(), observations)


def execute_money_apply_rate(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    return success(operand.apply_rate(input_value.get("rate"), input_value.get("rounding")).to_portable(), observations)


def execute_money_allocate(input_value: dict[str, Any]) -> dict[str, Any]:
    operand, observations = money_operand(input_value)
    values = [part.to_portable() for part in operand.allocate(input_value.get("allocation"), input_value.get("scale"))]
    return success(values, observations)


def parse_workflow_definition(input_value: dict[str, Any]) -> WorkflowDefinition:
    return WorkflowDefinition.from_portable(input_value.get("definition"))


def parse_workflow_instance(input_value: dict[str, Any]) -> WorkflowInstance:
    return WorkflowInstance.from_portable(input_value.get("instance"))


def workflow_observations(instance: WorkflowInstance, input_value: dict[str, Any]) -> dict[str, Any]:
    observations = instance.to_portable()
    if isinstance(input_value.get("facts"), dict) and len(input_value["facts"]) > 0:
        observations["facts"] = input_value["facts"]
    return observations


def workflow_error_observations(code: str, input_value: dict[str, Any]) -> dict[str, Any] | None:
    instance = parse_workflow_instance(input_value)
    if code == "FINKORE_WORKFLOW_INVALID_STATE":
        definition = parse_workflow_definition(input_value)
        if instance.current_state not in definition.states:
            return None
    return workflow_observations(instance, input_value)


def execute_workflow_create(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(create_workflow(parse_workflow_definition(input_value)).to_portable())


def execute_workflow_import(input_value: dict[str, Any]) -> dict[str, Any]:
    definition = parse_workflow_definition(input_value)
    instance = parse_workflow_instance(input_value)
    return success(import_workflow(definition, instance).to_portable())


def execute_workflow_transition(input_value: dict[str, Any]) -> dict[str, Any]:
    definition = parse_workflow_definition(input_value)
    instance = parse_workflow_instance(input_value)
    result = transition_workflow(
        definition,
        instance,
        input_value.get("target"),
        input_value.get("facts"),
        input_value.get("expectedCurrentState"),
        input_value.get("expectedRevision"),
    )
    return success(result.to_portable())


def audit_history_observation(input_value: dict[str, Any]) -> dict[str, Any] | None:
    try:
        return {"history": validate_history(input_value.get("history"))}
    except FinKoreError:
        return None


def execute_audit_append(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(append_event(input_value.get("history"), input_value.get("event")))


def execute_audit_replace(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(replace_event(input_value.get("history"), input_value.get("eventId"), input_value.get("replacement")))


def execute_audit_remove(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(remove_event(input_value.get("history"), input_value.get("eventId")))


def execute_audit_redact(input_value: dict[str, Any]) -> dict[str, Any]:
    result = redact_history(input_value.get("history"), input_value.get("policy"), input_value.get("redactionEvent"))
    history = result.pop("history")
    return success(result, {"history": history})


def execute_approval_requirement_evaluate(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(
        evaluate_requirement(
            input_value.get("requirement"),
            input_value.get("decisions"),
            input_value.get("currentSubjectFacts"),
            input_value.get("relevantFactPaths"),
            input_value.get("evaluatedAt"),
        ),
        {"history": input_value.get("decisions")} if input_value.get("observeHistory") is True else None,
    )


def execute_approval_decision_record(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(record_decision(input_value.get("requirement"), input_value.get("decision"), input_value.get("history")))


def execute_approval_decision_evaluate(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(
        evaluate_decision(
            input_value.get("requirement"),
            input_value.get("decision"),
            input_value.get("currentSubjectFacts"),
            input_value.get("relevantFactPaths"),
            input_value.get("evaluatedAt"),
        )
    )


def execute_approval_condition_evaluate(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(evaluate_condition(input_value.get("condition"), input_value.get("facts"), input_value.get("result")))


def execute_approval_chain_evaluate(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(evaluate_chain(input_value.get("chain"), input_value.get("states")))


def execute_approval_decision_withdraw(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(withdraw_decision(input_value.get("requirement"), input_value.get("history"), input_value.get("withdrawal")))


def execute_approval_decision_supersede(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(supersede_decision(input_value.get("history"), input_value.get("supersession")))


def execute_approval_requirement_supersede(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(supersede_requirement(input_value.get("history"), input_value.get("supersession")))


def execute_approval_composition_evaluate(input_value: dict[str, Any]) -> dict[str, Any]:
    result = evaluate_composition(input_value.get("composition"), input_value.get("requirements"), input_value.get("decisions"), input_value.get("context"))
    observations = {"decisions": input_value["decisions"]} if input_value.get("decisions") == [] else None
    return success(result, observations)


def entity_observation(input_value: dict[str, Any]) -> dict[str, Any] | None:
    if isinstance(input_value.get("entity"), dict):
        return {"entity": input_value["entity"]}
    return None


def evolution_observation(input_value: dict[str, Any], include_same_identity_related: bool = True) -> dict[str, Any]:
    evolution_history = input_value.get("evolutionHistory", [])
    audit_history = input_value.get("auditHistory", [])
    observations: dict[str, Any] = {
        "source": input_value.get("source"),
        "evolutionHistory": {"relations": evolution_history if isinstance(evolution_history, list) else evolution_history.get("relations", [])},
        "auditHistory": {"history": audit_history if isinstance(audit_history, list) else audit_history.get("history", [])},
    }
    if (
        "related" in input_value
        and isinstance(input_value.get("source"), dict)
        and isinstance(input_value["related"], dict)
        and (include_same_identity_related or input_value["related"].get("id") != input_value["source"].get("id"))
    ):
        observations["related"] = input_value["related"]
    if "successor" in input_value:
        observations["related"] = input_value["successor"]
    return observations


def execute_entity_create(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(create_entity(input_value.get("definition"), input_value.get("id"), input_value.get("data")))


def execute_entity_mutate(input_value: dict[str, Any]) -> dict[str, Any]:
    result = mutate_entity(input_value.get("definition"), input_value.get("entity"), input_value.get("changes"))
    return success(result, {"identity": result["id"], "state": result["state"]})


def execute_entity_transition(input_value: dict[str, Any]) -> dict[str, Any]:
    result = transition_entity(input_value.get("definition"), input_value.get("entity"), input_value.get("target"))
    return success(result, {"identity": result["id"]})


def execute_entity_import(input_value: dict[str, Any]) -> dict[str, Any]:
    return success(import_entity(input_value.get("definition"), input_value.get("import")))


def execute_entity_evolution(kind: str, input_value: dict[str, Any]) -> dict[str, Any]:
    return success(evolve_entity(kind, input_value.get("definition"), input_value), evolution_observation(input_value, kind != "CORRECTION"))


HANDLERS: dict[str, Callable[[dict[str, Any]], dict[str, Any]]] = {
    "money.deserialize": execute_money_deserialize,
    "money.serialize": execute_money_serialize,
    "finkore.money.add": execute_money_add,
    "finkore.money.subtract": execute_money_subtract,
    "finkore.money.negate": execute_money_negate,
    "finkore.money.multiply": execute_money_multiply,
    "finkore.money.divide": execute_money_divide,
    "finkore.money.compare": execute_money_compare,
    "finkore.money.round": execute_money_round,
    "finkore.money.applyrate": execute_money_apply_rate,
    "finkore.money.allocate": execute_money_allocate,
    "workflow.create": execute_workflow_create,
    "workflow.import": execute_workflow_import,
    "finkore.workflow.transition": execute_workflow_transition,
    "finkore.audit.append": execute_audit_append,
    "finkore.audit.replace": execute_audit_replace,
    "finkore.audit.remove": execute_audit_remove,
    "audit.redact": execute_audit_redact,
    "approval.requirement.evaluate": execute_approval_requirement_evaluate,
    "approval.decision.record": execute_approval_decision_record,
    "approval.decision.evaluate": execute_approval_decision_evaluate,
    "approval.condition.evaluate": execute_approval_condition_evaluate,
    "approval.chain.evaluate": execute_approval_chain_evaluate,
    "approval.decision.withdraw": execute_approval_decision_withdraw,
    "approval.decision.supersede": execute_approval_decision_supersede,
    "approval.requirement.supersede": execute_approval_requirement_supersede,
    "approval.composition.evaluate": execute_approval_composition_evaluate,
    "finkore.entity.create": execute_entity_create,
    "finkore.entity.mutate": execute_entity_mutate,
    "finkore.entity.transition": execute_entity_transition,
    "entity.import": execute_entity_import,
    "finkore.entity.evolution.correct": lambda input_value: execute_entity_evolution("CORRECTION", input_value),
    "finkore.entity.evolution.reverse": lambda input_value: execute_entity_evolution("REVERSAL", input_value),
    "finkore.entity.evolution.void": lambda input_value: execute_entity_evolution("VOID", input_value),
    "finkore.entity.evolution.supersede": lambda input_value: execute_entity_evolution("SUPERSESSION", input_value),
}


def execute(request: dict[str, Any]) -> dict[str, Any]:
    operation_id = request.get("operationId")
    input_value = request.get("input")
    if not isinstance(operation_id, str) or operation_id not in HANDLERS:
        return {"status": "unsupported"}
    if not isinstance(input_value, dict):
        return error("FINKORE_MONEY_INVALID_AMOUNT")
    try:
        return HANDLERS[operation_id](input_value)
    except FinKoreError as exc:
        observations = None
        try:
            if operation_id in {"finkore.money.add", "finkore.money.subtract", "finkore.money.compare"}:
                left, right, observations = money_pair(input_value)
            elif operation_id.startswith("finkore.money."):
                operand, observations = money_operand(input_value)
            elif operation_id == "finkore.workflow.transition":
                observations = workflow_error_observations(exc.code, input_value)
            elif operation_id.startswith("finkore.audit.") or operation_id == "audit.redact":
                observations = audit_history_observation(input_value)
            elif operation_id in {"approval.decision.record", "approval.decision.withdraw", "approval.decision.supersede", "approval.requirement.supersede"}:
                history_value = input_value.get("history")
                if isinstance(history_value, dict):
                    observations = {"history": history_value.get("history", [])}
                    if history_value.get("lifecycle"):
                        observations["lifecycle"] = history_value["lifecycle"]
                else:
                    observations = {"history": history_value if isinstance(history_value, list) else []}
            elif operation_id == "approval.composition.evaluate" and "decisions" in input_value:
                observations = {"decisions": input_value["decisions"]}
            elif operation_id == "finkore.entity.mutate":
                observations = entity_observation(input_value)
                if hasattr(exc, "findings") and observations is not None:
                    observations["findings"] = exc.findings
            elif operation_id == "finkore.entity.transition":
                observations = entity_observation(input_value)
            elif operation_id == "entity.import":
                imported = input_value.get("import")
                observations = {"entity": imported["entity"]} if isinstance(imported, dict) and isinstance(imported.get("entity"), dict) else None
            elif operation_id.startswith("finkore.entity.evolution."):
                observations = evolution_observation(input_value)
        except FinKoreError:
            observations = None
        return error(exc.code, observations)


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] == "--operations":
        print(json.dumps(sorted(HANDLERS)))
        return 0
    request = json.load(sys.stdin)
    print(json.dumps(execute(request), separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
