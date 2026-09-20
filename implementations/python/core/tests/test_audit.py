# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

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


if __name__ == "__main__":
    unittest.main()
