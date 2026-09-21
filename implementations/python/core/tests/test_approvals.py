# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import json
import unittest

from finkore import FinKoreError, evaluate_composition, evaluate_requirement, record_decision


class ApprovalTests(unittest.TestCase):
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
