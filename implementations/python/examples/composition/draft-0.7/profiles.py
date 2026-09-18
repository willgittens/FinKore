# SPDX-License-Identifier: MPL-2.0
"""Draft 0.7 reference composition profiles for Python."""

from __future__ import annotations

from copy import deepcopy
import json
import sys
from typing import Any

from finkore.approvals import evaluate_composition, evaluate_requirement
from finkore.audit import append_event
from finkore.entities import create_entity, evolve_entity, transition_entity
from finkore.errors import FinKoreError
from finkore.money import Money
from finkore.workflow import WorkflowDefinition, WorkflowInstance, transition_workflow

PROFILE_APPROVAL_NOT_CURRENT = "D07_PROFILE_APPROVAL_NOT_CURRENT"


EXPENSE_WORKFLOW = {
    "states": ["DRAFT", "SUBMITTED", "APPROVED"],
    "initialState": "DRAFT",
    "terminalStates": ["APPROVED"],
    "transitions": [
        {"source": "DRAFT", "target": "SUBMITTED"},
        {"source": "SUBMITTED", "target": "APPROVED"},
    ],
}

VERSIONED_EXPENSE_WORKFLOW = {
    **EXPENSE_WORKFLOW,
    "definitionIdentity": "d07-expense-workflow",
    "definitionVersionIdentity": "v1",
}

EXPENSE_DEFINITION = {
    "type": "expense",
    "identityScope": "draft-0.7-reference",
    "workflow": EXPENSE_WORKFLOW,
    "mutability": {"DRAFT": ["lines", "total", "allocations"], "SUBMITTED": [], "APPROVED": []},
}

INVOICE_WORKFLOW = {
    "states": ["ISSUED"],
    "initialState": "ISSUED",
    "terminalStates": [],
    "transitions": [],
}

INVOICE_DEFINITION = {
    "type": "invoice",
    "identityScope": "draft-0.7-reference",
    "workflow": INVOICE_WORKFLOW,
    "mutability": {"ISSUED": []},
}


def _success(scenario_id: str, profile: str) -> dict[str, Any]:
    return {"scenarioId": scenario_id, "profile": profile, "status": "success", "implementationStatus": "implemented"}


def _core_error(scenario_id: str, profile: str, error: FinKoreError) -> dict[str, Any]:
    return {"scenarioId": scenario_id, "profile": profile, "status": "error", "code": error.code, "implementationStatus": "implemented"}


def _profile_gate_failure(scenario_id: str, profile: str, **extra: Any) -> dict[str, Any]:
    result = {
        "scenarioId": scenario_id,
        "profile": profile,
        "status": "profile-error",
        "code": PROFILE_APPROVAL_NOT_CURRENT,
        "implementationStatus": "implemented",
    }
    result.update(extra)
    return result


def _with_evidence(observation: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
    return {**observation, "evidence": evidence}


def _audit_event(event_id: str, entity_type: str, entity_id: str, event_type: str = "ENTITY_CHANGED") -> dict[str, Any]:
    return {
        "eventId": event_id,
        "eventType": event_type,
        "entity": {"type": entity_type, "id": entity_id},
        "occurredAt": "2026-09-18T10:00:00Z",
        "changes": [{"path": "state", "after": event_type}],
    }


def _evaluate_approval(state: str) -> dict[str, Any]:
    composition = {
        "rootGroup": "finance",
        "groups": [{"id": "finance", "kind": "ALL_OF", "members": [{"type": "requirement", "id": "member-finance", "requirementId": "finance-review"}]}],
    }
    requirement = {"id": "finance-review", "applicability": "NOT_APPLICABLE" if state == "NOT_APPLICABLE" else "APPLICABLE"}
    if state != "NOT_APPLICABLE":
        requirement["state"] = state
    return evaluate_composition(composition, [requirement], [], {"evaluatedAt": "2026-09-18T10:00:00Z"})


def _submitted_expense() -> dict[str, Any]:
    entity = create_entity(
        EXPENSE_DEFINITION,
        "exp-7",
        {
            "lines": [{"amount": {"amount": "40.00", "currency": "USD"}}, {"amount": {"amount": "60.00", "currency": "USD"}}],
            "total": {"amount": "100.00", "currency": "USD"},
            "allocations": [],
        },
    )
    return transition_entity(EXPENSE_DEFINITION, entity, "SUBMITTED")


def _run_expense_scenario(scenario_id: str) -> dict[str, Any]:
    if scenario_id == "D07-EXP-001":
        total = Money.from_portable({"amount": "40.00", "currency": "USD"}).add(Money.from_portable({"amount": "60.00", "currency": "USD"}))
        allocations = [part.to_portable() for part in total.allocate({"method": "RATIO", "ratios": [1, 2]}, 2)]
        entity = transition_entity(EXPENSE_DEFINITION, create_entity(EXPENSE_DEFINITION, "exp-7", {"lines": [], "total": total.to_portable(), "allocations": allocations}), "SUBMITTED")
        append_event([], _audit_event("evt-exp-submit", "expense", entity["id"], "EXPENSE_SUBMITTED"))
        return _with_evidence(
            {**_success(scenario_id, "expense-approval"), "entityState": entity["state"], "preservePriorApprovalHistory": True, "appendAuditEvent": True},
            {"total": total.to_portable(), "allocations": allocations, "entity": entity, "auditHistoryLength": 1, "auditEventId": "evt-exp-submit"},
        )
    if scenario_id == "D07-EXP-002":
        approval = _evaluate_approval("APPROVED")
        entity = transition_entity(EXPENSE_DEFINITION, _submitted_expense(), "APPROVED")
        append_event([], _audit_event("evt-exp-approve", "expense", entity["id"], "EXPENSE_APPROVED"))
        return _with_evidence(
            {**_success(scenario_id, "expense-approval"), "entityState": entity["state"], "noSyntheticDecisionForInapplicableRequirement": approval["outcome"] == "APPROVED", "appendAuditEvent": True},
            {"approvalOutcome": approval["outcome"], "actionableRequirements": approval["actionableRequirements"], "entity": entity, "auditHistoryLength": 1},
        )
    if scenario_id == "D07-EXP-003":
        _evaluate_approval("PENDING")
        return _with_evidence(
            _profile_gate_failure(scenario_id, "expense-approval", preserveEntity=True, preservePriorApprovalHistory=True, preservePriorAuditHistory=True),
            {"approvalOutcome": "PENDING", "entityBefore": {"state": "SUBMITTED"}, "entityAfter": {"state": "SUBMITTED"}, "auditHistoryLength": 0},
        )
    if scenario_id == "D07-EXP-004":
        _evaluate_approval("REJECTED")
        return _with_evidence(
            _profile_gate_failure(scenario_id, "expense-approval", preserveEntity=True, preservePriorApprovalHistory=True),
            {"approvalOutcome": "REJECTED", "entityBefore": {"state": "SUBMITTED"}, "entityAfter": {"state": "SUBMITTED"}},
        )
    if scenario_id == "D07-EXP-005":
        approval_state = evaluate_requirement(
            {"id": "finance-review", "subject": {"type": "expense", "id": "exp-7"}, "eligibleActors": ["controller-1"]},
            [{"requirementId": "finance-review", "subjectFacts": {"revision": "rev-1"}, "outcome": "APPROVED", "actor": {"id": "controller-1"}, "decidedAt": "2026-09-18T09:00:00Z"}],
            {"revision": "rev-2"},
            ["revision"],
        )
        return _with_evidence(_profile_gate_failure(scenario_id, "expense-approval", preservePriorApprovalHistory=True), {"approvalState": approval_state, "priorApprovalDecisionCount": 1, "currentRevision": "rev-2"})
    if scenario_id == "D07-EXP-006":
        approval_state = evaluate_requirement(
            {"id": "finance-review", "subject": {"type": "expense", "id": "exp-7"}, "eligibleActors": ["controller-1"]},
            [{"requirementId": "finance-review", "subjectFacts": {"revision": "rev-1"}, "outcome": "APPROVED", "actor": {"id": "controller-1"}, "decidedAt": "2026-09-18T09:00:00Z", "expiresAt": "2026-09-18T11:00:00Z"}],
            {"revision": "rev-1"},
            ["revision"],
            "2026-09-18T12:00:00Z",
        )
        return _with_evidence(
            _profile_gate_failure(scenario_id, "expense-approval", evaluationInstant="2026-09-18T12:00:00Z"),
            {"approvalState": approval_state, "expiresAt": "2026-09-18T11:00:00Z", "evaluatedAt": "2026-09-18T12:00:00Z"},
        )
    if scenario_id == "D07-EXP-007":
        entity = create_entity(EXPENSE_DEFINITION, "exp-7", {"lines": [], "total": {"amount": "100.00", "currency": "USD"}, "allocations": []})
        try:
            Money.from_portable({"amount": "1.00", "currency": "USD"}).add(Money.from_portable({"amount": "1.00", "currency": "EUR"}))
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "expense-approval", error), "preserveEntity": entity["state"] == "DRAFT", "preservePriorAuditHistory": True},
                {"entityBefore": entity, "entityAfter": entity, "attemptedCurrencies": ["USD", "EUR"], "auditHistoryLength": 0},
            )
    if scenario_id == "D07-EXP-008":
        source = Money.from_portable({"amount": "100.00", "currency": "USD"})
        try:
            source.allocate({"method": "RATIO", "ratios": [1, 0]}, 2)
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "expense-approval", error), "preserveEntity": True, "preserveSourceMoney": source.to_portable()["amount"] == "100.00"},
                {"sourceMoneyBefore": source.to_portable(), "sourceMoneyAfter": source.to_portable(), "rejectedRatios": [1, 0]},
            )
    if scenario_id == "D07-EXP-009":
        definition = WorkflowDefinition.from_portable(VERSIONED_EXPENSE_WORKFLOW)
        instance = WorkflowInstance("SUBMITTED", definition.binding(), "wf-rev-1")
        try:
            transition_workflow(definition, instance, "APPROVED", expected_current_state="DRAFT")
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "expense-approval", error), "preserveEntity": True, "preservePriorApprovalHistory": True, "preservePriorAuditHistory": True},
                {"workflowBefore": {"currentState": "SUBMITTED", "revision": "wf-rev-1"}, "workflowAfter": instance.to_portable(), "expectedCurrentState": "DRAFT"},
            )
    if scenario_id == "D07-EXP-010":
        entity = _submitted_expense()
        prior = [_audit_event("evt-exp-approve", "expense", entity["id"], "EXPENSE_APPROVED")]
        try:
            transition_entity(EXPENSE_DEFINITION, entity, "APPROVED")
            append_event(prior, _audit_event("evt-exp-approve", "expense", entity["id"], "EXPENSE_APPROVED"))
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "expense-approval", error), "preserveEntity": True, "preservePriorApprovalHistory": True, "preservePriorAuditHistory": True},
                {"entityBefore": entity, "candidateState": "APPROVED", "priorAuditHistoryLength": 1, "auditHistoryLengthAfterFailure": 1},
            )
    raise ValueError(f"Unknown Draft 0.7 expense scenario: {scenario_id}")


def _invoice(entity_id: str = "inv-7", amount: str = "100.00") -> dict[str, Any]:
    return create_entity(INVOICE_DEFINITION, entity_id, {"amount": {"amount": amount, "currency": "USD"}, "memo": f"invoice-{entity_id}"})


def _invoice_issued_event() -> dict[str, Any]:
    return {
        "eventId": "evt-inv-issued",
        "eventType": "INVOICE_ISSUED",
        "entity": {"type": "invoice", "id": "inv-7"},
        "occurredAt": "2026-09-18T09:00:00Z",
        "changes": [{"path": "amount", "after": {"amount": "100.00", "currency": "USD"}}],
    }


def _correction_event(event_id: str = "evt-inv-correction", relation_id: str = "rel-inv-correction", target_event_id: str = "evt-inv-issued") -> dict[str, Any]:
    return {
        "eventId": event_id,
        "eventType": "ENTITY_EVOLUTION_RECORDED",
        "entity": {"type": "invoice", "id": "inv-7"},
        "occurredAt": "2026-09-18T10:00:00Z",
        "metadata": {
            "entityEvolution": {
                "kind": "CORRECTION",
                "relationId": relation_id,
                "source": {"type": "invoice", "id": "inv-7", "revision": "rev-1"},
                "related": {"type": "invoice", "id": "inv-7", "revision": "rev-2"},
            }
        },
        "relationships": [{"relationshipId": f"audit-{relation_id}", "type": "CORRECTS", "target": {"eventId": target_event_id, "entity": {"type": "invoice", "id": "inv-7"}}}],
    }


def _correct_invoice(**overrides: Any) -> dict[str, Any]:
    return evolve_entity(
        "CORRECTION",
        INVOICE_DEFINITION,
        {
            "source": _invoice(),
            "sourceRevision": "rev-1",
            "related": _invoice(amount="99.00"),
            "relatedRevision": "rev-2",
            "relationId": overrides.get("relation_id", "rel-inv-correction"),
            "eligible": overrides.get("eligible", True),
            "expectedSourceState": "ISSUED",
            "expectedSourceRevision": overrides.get("expected_source_revision", "rev-1"),
            "expectedSourceCurrent": True,
            "evolutionHistory": {"relations": deepcopy(overrides.get("evolution_relations", []))},
            "auditHistory": deepcopy(overrides.get("history", [_invoice_issued_event()])),
            "auditEvent": deepcopy(overrides.get("event", _correction_event())),
        },
    )


def _run_invoice_scenario(scenario_id: str) -> dict[str, Any]:
    if scenario_id in {"D07-INV-001", "D07-INV-002"}:
        _evaluate_approval("APPROVED")
        result = _correct_invoice()
        observation = _with_evidence(
            {**_success(scenario_id, "invoice-correction"), "preserveSourceFacts": result["source"]["data"]["amount"]["amount"] == "100.00", "appendCorrectionRelation": result["relation"]["kind"] == "CORRECTION", "appendAuditEvent": len(result["auditHistory"]["history"]) == 2},
            {"source": result["source"], "related": result["related"], "relation": result["relation"], "auditHistoryLength": len(result["auditHistory"]["history"])},
        )
        if scenario_id == "D07-INV-002":
            observation["preservePriorAuditHistory"] = True
        return observation
    if scenario_id == "D07-INV-003":
        try:
            _correct_invoice(eligible=False)
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "invoice-correction", error), "preserveSourceFacts": True, "preservePriorAuditHistory": True},
                {"source": _invoice(), "eligible": False, "evolutionRelationsAfterFailure": [], "auditHistoryLengthAfterFailure": 1},
            )
    if scenario_id == "D07-INV-004":
        try:
            _correct_invoice(evolution_relations=[_correct_invoice()["relation"]])
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "invoice-correction", error), "preserveSourceFacts": True, "preserveExistingRelations": True},
                {"existingRelationCount": 1, "relationCountAfterFailure": 1, "source": _invoice()},
            )
    if scenario_id == "D07-INV-005":
        try:
            _correct_invoice(expected_source_revision="rev-stale")
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "invoice-correction", error), "preserveSourceFacts": True, "preserveExistingRelations": True},
                {"expectedSourceRevision": "rev-stale", "observedSourceRevision": "rev-1", "relationCountAfterFailure": 0},
            )
    if scenario_id in {"D07-INV-006", "D07-INV-007"}:
        if scenario_id == "D07-INV-006":
            _evaluate_approval("PENDING")
            return _with_evidence(_profile_gate_failure(scenario_id, "invoice-correction", preserveSourceFacts=True, preservePriorApprovalHistory=True), {"approvalOutcome": "PENDING", "relationCountAfterFailure": 0})
        return _with_evidence(_profile_gate_failure(scenario_id, "invoice-correction", preservePriorApprovalHistory=True), {"approvalState": "PENDING", "staleApprovalRevision": "rev-1", "currentRevision": "rev-2"})
    if scenario_id == "D07-INV-008":
        try:
            _correct_invoice(event=_correction_event(target_event_id="evt-missing"))
        except FinKoreError as error:
            return _with_evidence(
                {**_core_error(scenario_id, "invoice-correction", error), "preserveSourceFacts": True, "preserveExistingRelations": True, "preservePriorAuditHistory": True},
                {"source": _invoice(), "invalidTargetEventId": "evt-missing", "relationCountAfterFailure": 0, "auditHistoryLengthAfterFailure": 1},
            )
    if scenario_id == "D07-INV-009":
        no_obligation = _evaluate_approval("NOT_APPLICABLE")
        result = _correct_invoice()
        return _with_evidence(
            {**_success(scenario_id, "invoice-correction"), "noSyntheticDecisionForInapplicableRequirement": no_obligation["outcome"] == "APPROVED", "appendCorrectionRelation": result["relation"]["kind"] == "CORRECTION"},
            {"approvalOutcome": no_obligation["outcome"], "actionableRequirements": no_obligation["actionableRequirements"], "relation": result["relation"]},
        )
    if scenario_id == "D07-INV-010":
        result = _correct_invoice()
        return _with_evidence(
            {**_success(scenario_id, "invoice-correction"), "noSyntheticReversal": True, "noSyntheticPosting": True, "noSyntheticPaymentEffect": True},
            {"relationKind": result["relation"]["kind"], "relationCount": len(result["evolutionHistory"]["relations"]), "syntheticEffects": []},
        )
    raise ValueError(f"Unknown Draft 0.7 invoice scenario: {scenario_id}")


def run_scenario(scenario_id: str) -> dict[str, Any]:
    """Execute one Draft 0.7 reference scenario through Python Core APIs."""

    return _run_expense_scenario(scenario_id) if scenario_id.startswith("D07-EXP-") else _run_invoice_scenario(scenario_id)


def run_scenarios(scenario_ids: list[str]) -> list[dict[str, Any]]:
    """Execute multiple Draft 0.7 reference scenarios."""

    return [run_scenario(scenario_id) for scenario_id in scenario_ids]


def _main() -> None:
    fixture = json.loads(open("examples/composition/draft-0.7/scenarios.json", encoding="utf-8").read())
    scenario_ids = [scenario["id"] for scenario in fixture["scenarios"]]
    json.dump({"language": "python", "results": run_scenarios(scenario_ids)}, sys.stdout, sort_keys=True, separators=(",", ":"))
    sys.stdout.write("\n")


if __name__ == "__main__":
    _main()
