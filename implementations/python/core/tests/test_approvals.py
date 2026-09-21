# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import json
import unittest
from copy import deepcopy

from finkore import FinKoreError, evaluate_composition, evaluate_decision, evaluate_requirement, record_decision


class ApprovalTests(unittest.TestCase):
    def assert_fact_evaluation(self, recorded_facts, current_facts, paths, effective, outcome="APPROVED") -> None:
        """Check both public evaluators and exact preservation of caller-owned evidence."""
        requirement = {
            "id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"},
            "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED",
        }
        decision = {
            "requirementId": "finance-review", "subjectFacts": deepcopy(recorded_facts),
            "outcome": outcome, "actor": {"type": "user", "id": "user-7"},
            "decidedAt": "2026-09-01T12:00:00Z",
        }
        evidence = record_decision(requirement, decision, [])
        evidence["lifecycle"] = []
        inputs = [requirement, decision, evidence, current_facts, paths]
        before = json.dumps(inputs, sort_keys=True)
        decision_result = evaluate_decision(requirement, decision, current_facts, paths)
        requirement_result = evaluate_requirement(requirement, evidence, current_facts, paths)
        self.assertEqual(json.dumps(inputs, sort_keys=True), before)
        self.assertEqual(decision_result, "EFFECTIVE" if effective else "INEFFECTIVE")
        self.assertEqual(requirement_result, outcome if effective else "PENDING")

    def test_boolean_number_fact_changes_are_distinct_at_every_nesting_level(self) -> None:
        """APPROVAL-DECISION-003/007 and APPROVAL-VALIDITY-003: stale evidence cannot approve or reject."""
        wrappers = [
            lambda value: value,
            lambda value: {"inner": value},
            lambda value: [value],
            lambda value: {"inner": [{"value": value}]},
        ]
        for recorded, current in [(True, 1), (1, True), (False, 0), (0, False)]:
            for index, wrap in enumerate(wrappers):
                for outcome in ("APPROVED", "REJECTED"):
                    with self.subTest(recorded=recorded, current=current, shape=index, outcome=outcome):
                        facts = {"fact": wrap(recorded)}
                        self.assert_fact_evaluation(facts, deepcopy(facts), ["fact"], True, outcome)
                        self.assert_fact_evaluation(facts, {"fact": wrap(current)}, ["fact"], False, outcome)

    def test_fact_comparison_preserves_json_scalar_and_container_semantics(self) -> None:
        """APPROVAL-VALIDITY-003: preserve equality, member identity, and array order."""
        cases = [
            (None, None, True), (None, False, False),
            (1, 1, True), (1, 2, False), (1.5, 1.5, True), (1.5, 1.25, False),
            (1, 1.0, True),  # Python numeric representation alone does not change a fact.
            ("1", "1", True), ("1", 1, False), (1, "1", False), ("a", "b", False),
            ({"a": True, "b": [None, "x", 1]}, {"b": [None, "x", 1], "a": True}, True),
            ({"a": None}, {}, False), ({}, {"a": None}, False),
            ({"a": 1}, {"b": 1}, False), ({}, {}, True),
            ([1, 2], [2, 1], False), ([1], [1, 2], False), ([1, 2], [1], False),
            ([], [], True), ([], {}, False), ({}, [], False),
            ({"a": 1}, 1, False), (1, {"a": 1}, False), ([1], 1, False), (1, [1], False),
        ]
        for recorded, current, effective in cases:
            with self.subTest(recorded=recorded, current=current):
                self.assert_fact_evaluation({"fact": recorded}, {"fact": current}, ["fact"], effective)

    def test_relevant_paths_distinguish_missing_and_null_and_ignore_unrelated_changes(self) -> None:
        """APPROVAL-VALIDITY-003: compare only declared paths, requiring their presence."""
        cases = [
            ({"fact": None}, {"fact": None}, ["fact"], True),
            ({}, {}, ["fact"], False),
            ({"fact": None}, {}, ["fact"], False),
            ({}, {"fact": None}, ["fact"], False),
            ({"fact": {"inner": False}}, {"fact": {"inner": 0}}, ["fact.inner"], False),
            ({"fact": True, "other": 1}, {"other": 2, "fact": True}, ["fact"], True),
            ({"fact": True, "other": 1}, {"fact": True, "other": 2}, ["fact", "other"], False),
        ]
        for recorded, current, paths, effective in cases:
            with self.subTest(recorded=recorded, current=current, paths=paths):
                self.assert_fact_evaluation(recorded, current, paths, effective)

    def test_invalid_fact_paths_preserve_committed_decisions_and_current_facts(self) -> None:
        """APPROVAL-VALIDITY-012: a failed comparison leaves caller-owned evidence unchanged."""
        requirement = {"id": "review", "subject": {}, "eligibleActors": ["user-7"]}
        decision = {
            "requirementId": "review", "subjectFacts": {"flag": True}, "outcome": "APPROVED",
            "actor": {"id": "user-7"}, "decidedAt": "2026-09-01T12:00:00Z",
        }
        evidence = {"history": [decision], "lifecycle": []}
        current = {"flag": 1}
        before = json.dumps([requirement, evidence, current], sort_keys=True)
        for paths in ("flag", [""], [None]):
            for evaluate, value in ((evaluate_decision, decision), (evaluate_requirement, evidence)):
                with self.subTest(paths=paths, evaluate=evaluate.__name__):
                    with self.assertRaises(FinKoreError) as raised:
                        evaluate(requirement, value, current, paths)
                    self.assertEqual(raised.exception.code, "FINKORE_APPROVAL_INVALID_DECISION")
                    self.assertEqual(json.dumps([requirement, evidence, current], sort_keys=True), before)

    def test_boolean_to_number_fact_change_invalidates_approval_and_preserves_history(self) -> None:
        """APPROVAL-DECISION-003/007 and APPROVAL-VALIDITY-002/003: retain stale evidence."""
        requirement = {
            "id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"},
            "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED",
        }
        decision = {
            "requirementId": "finance-review", "subjectFacts": {"approvedFlag": True},
            "outcome": "APPROVED", "actor": {"type": "user", "id": "user-7"},
            "decidedAt": "2026-09-01T12:00:00Z",
        }
        history = record_decision(requirement, decision, [])["history"]
        before = json.dumps(history, sort_keys=True)
        self.assertEqual(
            evaluate_requirement(requirement, history, {"approvedFlag": True}, ["approvedFlag"]),
            "APPROVED",
        )
        result = evaluate_requirement(requirement, history, {"approvedFlag": 1}, ["approvedFlag"])
        # JSON comparison keeps Boolean/number distinctions that Python equality loses.
        self.assertEqual(json.dumps(history, sort_keys=True), before)
        self.assertEqual(result, "PENDING")

    def test_requirement_approved_by_effective_eligible_decision(self) -> None:
        requirement = {"id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"}, "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}
        decision = {"requirementId": "finance-review", "subjectFacts": {"revision": "3"}, "outcome": "APPROVED", "actor": {"type": "user", "id": "user-7"}, "decidedAt": "2026-09-01T12:00:00Z"}
        self.assertEqual(evaluate_requirement(requirement, [decision], {"revision": "3"}), "APPROVED")

    def test_record_decision_rejects_ineligible_actor_and_preserves_history(self) -> None:
        requirement = {"id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"}, "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}
        decision = {"requirementId": "finance-review", "subjectFacts": {"revision": "3"}, "outcome": "APPROVED", "actor": {"type": "user", "id": "user-8"}, "decidedAt": "2026-09-01T12:00:00Z"}
        with self.assertRaises(FinKoreError) as context:
            record_decision(requirement, decision, [])
        self.assertEqual(context.exception.code, "FINKORE_APPROVAL_INELIGIBLE_ACTOR")

    def test_expiration_uses_exact_nanoseconds_and_equivalent_offsets(self) -> None:
        requirement = {"id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"}, "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}
        decision = {
            "requirementId": "finance-review",
            "subjectFacts": {"revision": "3"},
            "outcome": "APPROVED",
            "actor": {"type": "user", "id": "user-7"},
            "decidedAt": "2026-09-01T12:00:00.000000001Z",
            "expiresAt": "2026-09-02T12:00:00.000000005Z",
        }
        self.assertEqual(
            evaluate_requirement(requirement, [decision], evaluated_at="2026-09-02T12:00:00.000000004Z"),
            "APPROVED",
        )
        self.assertEqual(
            evaluate_requirement(requirement, [decision], evaluated_at="2026-09-02T14:00:00.000000005+02:00"),
            "PENDING",
        )

    def test_rejects_timestamp_precision_beyond_nine_digits(self) -> None:
        requirement = {"id": "finance-review", "subject": {"type": "invoice", "id": "inv-42"}, "eligibleActors": ["user-7"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}
        decision = {
            "requirementId": "finance-review",
            "subjectFacts": {"revision": "3"},
            "outcome": "APPROVED",
            "actor": {"type": "user", "id": "user-7"},
            "decidedAt": "2026-09-01T12:00:00.1234567890Z",
        }
        with self.assertRaises(FinKoreError) as context:
            record_decision(requirement, decision, [])
        self.assertEqual(context.exception.code, "FINKORE_APPROVAL_INVALID_DECISION")

    def test_composition_quorum_counts_distinct_declared_voters(self) -> None:
        result = evaluate_composition(
            {
                "rootGroup": "board",
                "groups": [
                    {
                        "id": "board",
                        "kind": "N_OF_M",
                        "threshold": 2,
                        "members": [
                            {"type": "requirement", "id": "alice-seat", "requirementId": "board-review", "voter": {"type": "user", "id": "alice"}},
                            {"type": "requirement", "id": "bob-seat", "requirementId": "board-review", "voter": {"type": "user", "id": "bob"}},
                        ],
                    }
                ],
            },
            [{"id": "board-review", "applicability": "APPLICABLE", "eligibleActors": ["alice", "bob"], "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}],
            [
                {"requirementId": "board-review", "actor": {"type": "user", "id": "alice"}, "outcome": "APPROVED", "effective": True},
                {"requirementId": "board-review", "actor": {"type": "user", "id": "bob"}, "outcome": "APPROVED", "effective": True},
            ],
            {"evaluatedAt": "2026-09-12T10:00:00Z"},
        )
        self.assertEqual(result, {"outcome": "APPROVED", "actionableRequirements": []})


if __name__ == "__main__":
    unittest.main()
