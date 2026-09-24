# SPDX-License-Identifier: MPL-2.0
"""Public-API sequence and ownership regressions for Core 0.9.4."""
import json
import unittest
from copy import deepcopy
from itertools import product
from pathlib import Path

from finkore import (FinKoreError, WorkflowDefinition, WorkflowInstance, create_workflow,
                    import_workflow, transition_workflow, record_decision, evaluate_requirement)
from finkore.approvals import withdraw_decision, supersede_decision, supersede_requirement
from finkore.entities import evolve_entity

ROOT = Path(__file__).resolve().parents[4]
REQUIREMENT = {"id": "review", "subject": {"type": "invoice", "id": "invoice-1"}, "eligibleActors": ["alice"]}
DECISION = {"requirementId": "review", "subjectFacts": {"revision": "3"}, "outcome": "APPROVED", "actor": {"id": "alice"}, "decidedAt": "2026-09-01T12:00:00Z"}
TARGET = {"requirementId": "review", "actorId": "alice", "decidedAt": DECISION["decidedAt"]}
EVENT = {"target": TARGET, "actor": {"id": "alice"}, "recordedAt": "2026-09-02T12:00:00Z"}
LATER = {**DECISION, "subjectFacts": {"revision": "4"}, "decidedAt": "2026-09-03T12:00:00Z"}
BINDING = {"definitionIdentity": "review-flow", "definitionVersionIdentity": "v1"}


class ReadinessRegressionTests(unittest.TestCase):
    def test_lifecycle_record_evaluate_sequences(self):
        """APPROVAL-VALIDITY-001/002/004/010/011/012: retain actual prior results."""
        for kind, extra in product(("withdraw", "decision", "requirement"), ({}, {"type": "WITHDRAWN"}, {"type": "DECISION_SUPERSEDED"}, {"type": "REQUIREMENT_SUPERSEDED"}, {"type": "UNKNOWN"}, {"type": None}, {"type": {}})):
            with self.subTest(kind=kind, extra=extra):
                initial = [deepcopy(DECISION), deepcopy(LATER)] if kind == "decision" else [deepcopy(DECISION)]
                if kind == "withdraw":
                    committed = withdraw_decision(REQUIREMENT, initial, {**deepcopy(EVENT), **extra})
                elif kind == "decision":
                    committed = supersede_decision(initial, {**deepcopy(EVENT), "successor": {**TARGET, "decidedAt": LATER["decidedAt"]}, **extra})
                else:
                    committed = supersede_requirement(initial, {"targetRequirementId": "review", "successorRequirementId": "next-review", "actor": EVENT["actor"], "recordedAt": EVENT["recordedAt"], **extra})
                before = deepcopy(committed)
                later = {**deepcopy(LATER), "decidedAt": "2026-09-04T12:00:00Z"}
                recorded = record_decision(REQUIREMENT, later, committed)
                self.assertEqual(committed, before)
                self.assertEqual(evaluate_requirement(REQUIREMENT, recorded, {"revision": "3"}, ["revision"]), "PENDING")
                self.assertEqual(recorded, {"history": before["history"] + [later], "lifecycle": before["lifecycle"]})
                stable = deepcopy(recorded)
                with self.assertRaises(FinKoreError) as error:
                    record_decision(REQUIREMENT, {**later, "outcome": "PENDING"}, recorded)
                self.assertEqual(error.exception.code, "FINKORE_APPROVAL_INVALID_DECISION")
                self.assertEqual(recorded, stable)
                recorded["lifecycle"][0]["type"] = "UNKNOWN"
                self.assertEqual(committed, before)

    def test_invalid_withdrawal_preserves_history_and_effectiveness(self):
        """APPROVAL-VALIDITY-005/012: reject every invalid target atomically."""
        for state in ("missing", "ambiguous", "withdrawn", "superseded", "unique"):
            with self.subTest(state=state):
                history = {"history": [deepcopy(DECISION)], "lifecycle": []}
                if state == "missing":
                    history["history"] = [deepcopy(LATER)]
                if state == "ambiguous":
                    history["history"].append(deepcopy(DECISION))
                if state == "withdrawn":
                    history = withdraw_decision(REQUIREMENT, history, EVENT)
                if state == "superseded":
                    history["history"].append(deepcopy(LATER))
                    history = supersede_decision(history, {**EVENT, "successor": {**TARGET, "decidedAt": LATER["decidedAt"]}})
                before = deepcopy(history)
                outcome = evaluate_requirement(REQUIREMENT, history, {"revision": "3"}, ["revision"])
                if state == "unique":
                    result = withdraw_decision(REQUIREMENT, history, EVENT)
                    self.assertEqual(evaluate_requirement(REQUIREMENT, result, {"revision": "3"}, ["revision"]), "PENDING")
                else:
                    with self.assertRaises(FinKoreError) as error:
                        withdraw_decision(REQUIREMENT, history, EVENT)
                    self.assertEqual(error.exception.code, "FINKORE_APPROVAL_INVALID_DECISION")
                self.assertEqual(history, before)
                self.assertEqual(evaluate_requirement(REQUIREMENT, history, {"revision": "3"}, ["revision"]), outcome)

    def test_new_effective_decision_after_withdrawal(self):
        committed = withdraw_decision(REQUIREMENT, [deepcopy(DECISION)], deepcopy(EVENT))
        recorded = record_decision(REQUIREMENT, {**deepcopy(DECISION), "decidedAt": LATER["decidedAt"]}, committed)
        self.assertEqual(evaluate_requirement(REQUIREMENT, recorded, {"revision": "3"}, ["revision"]), "APPROVED")
        self.assertEqual(recorded.get("lifecycle"), committed["lifecycle"])

    def test_workflow_nested_definition_ownership(self):
        """WORKFLOW-VERSION-003/009: immutable semantics across original and exposed aliases."""
        for imported in (False, True):
            for array in (False, True):
                for location in ("input", "observation"):
                    for approved in (False, True):
                        with self.subTest(imported=imported, array=array, location=location, approved=approved):
                            value = {"checks": [{"approved": True}]} if array else {"approved": True}
                            raw = {**BINDING, "states": ["DRAFT", "DONE"], "initialState": "DRAFT", "terminalStates": ["DONE"], "transitions": [{"source": "DRAFT", "target": "DONE", "guard": {"fact": "decision", "equals": value}}]}
                            definition = WorkflowDefinition.from_portable(raw)
                            instance = import_workflow(definition, WorkflowInstance.from_portable({"currentState": "DRAFT", "binding": BINDING, "revision": "revision-1"})) if imported else create_workflow(definition)
                            before = deepcopy(instance.to_portable())
                            retained = value if location == "input" else definition.transition("DRAFT", "DONE").guards[0]["equals"]
                            try:
                                if array:
                                    retained["checks"][0]["approved"] = False
                                else:
                                    retained["approved"] = False
                            except TypeError:
                                pass  # A deeply immutable observation is an allowed API design.
                            facts = {"decision": {"checks": [{"approved": approved}]}} if array else {"decision": {"approved": approved}}
                            facts_before = deepcopy(facts)
                            if approved:
                                result = transition_workflow(definition, instance, "DONE", facts)
                                self.assertEqual(result.to_portable(), {**before, "currentState": "DONE"})
                            else:
                                with self.assertRaises(FinKoreError) as error:
                                    transition_workflow(definition, instance, "DONE", facts)
                                self.assertEqual(error.exception.code, "FINKORE_WORKFLOW_GUARD_REJECTED")
                            self.assertEqual(instance.to_portable(), before)
                            self.assertEqual(facts, facts_before)

    def test_workflow_declaration_arrays_are_owned(self):
        raw = {**BINDING, "states": ["DRAFT", "DONE"], "initialState": "DRAFT", "terminalStates": ["DONE"], "transitions": [{"source": "DRAFT", "target": "DONE"}]}
        definition = WorkflowDefinition.from_portable(raw)
        instance = create_workflow(definition)
        raw["states"].clear()
        raw["terminalStates"].clear()
        raw["transitions"][0]["target"] = "OTHER"
        result = transition_workflow(definition, instance, "DONE")
        self.assertEqual(result.to_portable(), {"currentState": "DONE", "binding": BINDING})
        with self.assertRaises(FinKoreError) as error:
            transition_workflow(definition, result, "DRAFT")
        self.assertEqual(error.exception.code, "FINKORE_WORKFLOW_TERMINAL_STATE")

    def test_evolution_consumes_actual_returned_history(self):
        """ENTITY-EVOLUTION-022/023/025/033/035: void then correct, with success and conflict controls."""
        vectors = json.loads((ROOT / "conformance/entities/evolution.json").read_text())["vectors"]
        templates = {v["id"]: v["input"] for v in vectors}
        for expected in (False, True):
            with self.subTest(expected=expected):
                first_input = deepcopy(templates["entity.evolution.void.audit-001"])
                first_before = deepcopy(first_input)
                first = evolve_entity("VOID", first_input["definition"], first_input)
                self.assertEqual(first_input, first_before)
                request = deepcopy(templates["entity.evolution.correction.audit-001"])
                request["source"] = first["source"]
                request["evolutionHistory"] = first["evolutionHistory"]
                request["auditHistory"] = first["auditHistory"]["history"]
                request["expectedSourceCurrent"] = expected
                before = deepcopy(request)
                if expected:
                    with self.assertRaises(FinKoreError) as error:
                        evolve_entity("CORRECTION", request["definition"], request)
                    self.assertEqual(error.exception.code, "FINKORE_ENTITY_STATE_CONFLICT")
                else:
                    result = evolve_entity("CORRECTION", request["definition"], request)
                    self.assertFalse(result["relation"]["sourceCurrent"])
                    self.assertEqual(result["evolutionHistory"]["relations"], first["evolutionHistory"]["relations"] + [result["relation"]])
                    self.assertEqual(result["auditHistory"]["history"], first["auditHistory"]["history"] + [result["auditEvent"]])
                self.assertEqual(request, before)

    def test_combined_audit_failure_preserves_all_supplied_observations(self):
        """ENTITY-EVOLUTION-023/033/034: validation order must not commit early."""
        vectors = json.loads((ROOT / "conformance/entities/evolution.json").read_text())["vectors"]
        request = deepcopy(next(v["input"] for v in vectors if v["id"] == "entity.evolution.correction.audit-001"))
        request["auditEvent"]["occurredAt"] = "invalid"
        request["auditEvent"]["metadata"]["entityEvolution"]["relationId"] = "wrong-relation"
        before = deepcopy(request)
        try:
            with self.assertRaises(FinKoreError) as error:
                evolve_entity("CORRECTION", request["definition"], request)
            self.assertEqual(error.exception.code, "FINKORE_AUDIT_INVALID_EVENT")
        finally:
            self.assertEqual(request, before)
