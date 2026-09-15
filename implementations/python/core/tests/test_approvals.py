# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import unittest

from finkore import FinKoreError, evaluate_composition, evaluate_requirement, record_decision


class ApprovalTests(unittest.TestCase):
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
