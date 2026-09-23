# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

from copy import deepcopy
import unittest

from finkore import FinKoreError, append_event, redact_history, remove_event


class AuditTests(unittest.TestCase):
    def test_appends_event_without_mutating_history(self) -> None:
        history: list[dict[str, object]] = []
        event = {
            "eventId": "evt-1042",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "actor": {"type": "user", "id": "user-7"},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        self.assertEqual(append_event(history, event), {"history": [event]})
        self.assertEqual(history, [])

    def test_rejects_duplicate_event_identity(self) -> None:
        event = {
            "eventId": "evt-1042",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        with self.assertRaises(FinKoreError) as context:
            append_event([event], event)
        self.assertEqual(context.exception.code, "FINKORE_AUDIT_DUPLICATE_EVENT")

    def test_applies_portable_append_error_precedence_without_mutation(self) -> None:
        committed = {
            "eventId": "evt-1042",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        base = {
            "eventId": "evt-1043",
            "eventType": "ENTITY_APPROVED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T13:00:00Z",
        }
        cases = (
            ({**base, "entity": {"type": "expense"}, "actor": {"type": "user"}}, "FINKORE_AUDIT_INVALID_EVENT"),
            ({**base, "eventId": "evt-1042", "actor": {"type": "user"}}, "FINKORE_AUDIT_ACTOR_INVALID"),
            (
                {
                    **base,
                    "eventId": "evt-1042",
                    "relationships": [
                        {
                            "relationshipId": "rel-missing-target",
                            "type": "CORRECTS",
                            "target": {
                                "eventId": "evt-missing",
                                "entity": {"type": "expense", "id": "exp-52"},
                            },
                        }
                    ],
                },
                "FINKORE_AUDIT_DUPLICATE_EVENT",
            ),
        )
        for candidate, expected_code in cases:
            with self.subTest(expected_code=expected_code):
                history = [committed]
                with self.assertRaises(FinKoreError) as context:
                    append_event(history, candidate)
                self.assertEqual(context.exception.code, expected_code)
                self.assertEqual(history, [committed])

    def test_enforces_portable_timestamp_profile_without_mutating_history(self) -> None:
        valid = {
            "eventId": "evt-nanoseconds",
            "eventType": "ENTITY_OBSERVED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-02-28T12:00:00.123456789+23:59",
        }
        self.assertEqual(append_event([], valid), {"history": [valid]})

        for occurred_at in (
            "2026-02-30T12:00:00Z",
            "2026-09-01T12:00:00.1234567890Z",
            "20260901T120000Z",
            "2026-09-01t12:00:00Z",
            "2026-09-01T12:00:00z",
            "2026-09-01T12:00:00-00:00",
            "2026-12-31T23:59:60Z",
            "0000-01-01T00:00:00Z",
        ):
            with self.subTest(occurred_at=occurred_at):
                history: list[dict[str, object]] = []
                with self.assertRaises(FinKoreError) as context:
                    append_event(history, {**valid, "occurredAt": occurred_at})
                self.assertEqual(context.exception.code, "FINKORE_AUDIT_INVALID_EVENT")
                self.assertEqual(history, [])

    def test_rejects_append_only_removal(self) -> None:
        with self.assertRaises(FinKoreError) as context:
            remove_event(
                [
                    {
                        "eventId": "evt-1042",
                        "eventType": "ENTITY_SUBMITTED",
                        "entity": {"type": "expense", "id": "exp-52"},
                        "occurredAt": "2026-09-01T12:00:00Z",
                    }
                ],
                "evt-1042",
            )
        self.assertEqual(context.exception.code, "FINKORE_AUDIT_APPEND_ONLY_VIOLATION")

    def test_redacts_change_and_keeps_evidence_event(self) -> None:
        event = {
            "eventId": "evt-1042",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T12:00:00Z",
            "changes": [{"path": "bankAccount", "before": "DE111", "after": "DE222"}],
        }
        evidence = {
            "eventId": "evt-redact-1",
            "eventType": "AUDIT_CONTENT_REDACTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T13:00:00Z",
        }
        self.assertEqual(
            redact_history([event], {"protectedPaths": ["bankAccount"]}, evidence),
            {
                "event": {
                    **event,
                    "changes": [
                        {
                            "path": "bankAccount",
                            "before": {"presence": "REDACTED"},
                            "after": {"presence": "REDACTED"},
                        }
                    ],
                },
                "evidenceEvent": evidence,
                "history": [event, evidence],
            },
        )

    def test_actor_optional_strings_are_non_empty_when_supplied(self) -> None:
        base = {
            "eventId": "evt-invalid-actor-context",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        for actor in (
            {"id": "user-7", "displayName": ""},
            {"id": "user-7", "displayName": 7},
            {"id": "user-7", "displayName": None},
            {"id": "user-7", "type": None},
        ):
            with self.subTest(actor=actor):
                history: list[dict[str, object]] = []
                with self.assertRaises(FinKoreError) as context:
                    append_event(history, {**base, "actor": actor})
                self.assertEqual(context.exception.code, "FINKORE_AUDIT_ACTOR_INVALID")
                self.assertEqual(history, [])

    def test_actor_metadata_null_presence_survives_append_and_redaction(self) -> None:
        event = {
            "eventId": "evt-null-metadata",
            "eventType": "ENTITY_SUBMITTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "actor": {"type": "user", "id": "user-7", "metadata": None},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        evidence = {
            "eventId": "evt-null-metadata-evidence",
            "eventType": "AUDIT_CONTENT_REDACTED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T13:00:00Z",
        }
        self.assertEqual(append_event([], event), {"history": [event]})
        result = redact_history([event], {"protectedPaths": ["actor.metadata"]}, evidence)
        self.assertEqual(result["event"]["actor"], {"type": "user", "id": "user-7", "metadata": {"presence": "REDACTED"}})
        self.assertEqual(result["history"], [event, evidence])

    def test_change_comparison_distinguishes_json_types_and_declared_money(self) -> None:
        base = {
            "eventId": "evt-change-comparison",
            "eventType": "ENTITY_FACT_CHANGED",
            "entity": {"type": "expense", "id": "exp-52"},
            "occurredAt": "2026-09-01T12:00:00Z",
        }
        for change in (
            {"path": "approved", "before": True, "after": 1},
            {"path": "approved", "before": 0, "after": False},
            {"path": "review", "before": {"checks": [True]}, "after": {"checks": [1]}},
            {"path": "steps", "before": ["KYC", "LIMIT"], "after": ["LIMIT", "KYC"]},
        ):
            with self.subTest(change=change):
                event = {**base, "changes": [change]}
                self.assertEqual(append_event([], event), {"history": [event]})

        money_unchanged = {
            **base,
            "eventId": "evt-money-unchanged",
            "changes": [{
                "path": "amount",
                "valueType": "MONEY",
                "before": {"amount": "10.0", "currency": "EUR"},
                "after": {"amount": "10.00", "currency": "EUR"},
            }],
        }
        original = deepcopy(money_unchanged)
        with self.assertRaises(FinKoreError) as context:
            append_event([], money_unchanged)
        self.assertEqual(context.exception.code, "FINKORE_AUDIT_INVALID_EVENT")
        self.assertEqual(money_unchanged, original)


if __name__ == "__main__":
    unittest.main()
