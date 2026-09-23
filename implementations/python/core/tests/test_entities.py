# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import unittest
from copy import deepcopy

from finkore import FinKoreError, create_entity, import_entity, mutate_entity, transition_entity


DEFINITION = {
    "type": "invoice",
    "identityScope": "tenant-a",
    "workflow": {"states": ["DRAFT", "FINAL"], "initialState": "DRAFT", "terminalStates": ["FINAL"], "transitions": [{"source": "DRAFT", "target": "FINAL"}]},
    "mutability": {"DRAFT": ["amount", "memo"], "FINAL": ["deliveryStatus"]},
    "validation": [{"id": "AMOUNT_POSITIVE", "path": "amount", "rule": "positive-money"}],
}


class EntityTests(unittest.TestCase):
    def test_cross_field_validation_uses_exact_money_ordering(self) -> None:
        definition = deepcopy(DEFINITION)
        definition["mutability"]["DRAFT"] = ["amount", "limit", "memo"]
        definition["validation"] = [{"id": "WITHIN_LIMIT", "path": "amount", "otherPath": "limit", "rule": "money-not-greater-than"}]
        for amount, limit in [("10", "20"), ("20.00", "20.0"), ("0", "0"), ("-2", "-1")]:
            with self.subTest(amount=amount, limit=limit):
                data = {"amount": {"amount": amount, "currency": "EUR"}, "limit": {"amount": limit, "currency": "EUR"}}
                self.assertEqual(create_entity(definition, "inv-42", data)["data"], data)

        entity = create_entity(definition, "inv-42", {"amount": {"amount": "10", "currency": "EUR"}, "limit": {"amount": "20", "currency": "EUR"}})
        before = deepcopy(entity)
        for changes in [
            {"amount": {"amount": "20.000000000000000000001", "currency": "EUR"}},
            {"amount": {"amount": "1", "currency": "USD"}},
            {"amount": None},
            {"limit": {"amount": "invalid", "currency": "EUR"}},
        ]:
            with self.subTest(changes=changes):
                with self.assertRaises(FinKoreError) as context:
                    mutate_entity(definition, entity, changes)
                self.assertEqual(context.exception.code, "FINKORE_ENTITY_VALIDATION_FAILED")
                self.assertEqual(context.exception.findings, [{"rule": "WITHIN_LIMIT", "path": "amount"}])
                self.assertEqual(entity, before)

        with self.assertRaises(FinKoreError) as context:
            create_entity(definition, "inv-42", {"amount": {"amount": "10", "currency": "EUR"}})
        self.assertEqual(context.exception.code, "FINKORE_ENTITY_VALIDATION_FAILED")

    def test_create_preserves_identity_and_initial_state(self) -> None:
        entity = create_entity(DEFINITION, "inv-42", {"amount": {"amount": "100.00", "currency": "EUR"}})
        self.assertEqual(entity["id"], "inv-42")
        self.assertEqual(entity["state"], "DRAFT")

    def test_mutation_rejects_immutable_field_without_changing_source(self) -> None:
        entity = {"type": "invoice", "id": "inv-42", "state": "FINAL", "data": {"amount": {"amount": "100.00", "currency": "EUR"}, "deliveryStatus": "NEW"}}
        with self.assertRaises(FinKoreError) as context:
            mutate_entity(DEFINITION, entity, {"amount": {"amount": "200.00", "currency": "EUR"}})
        self.assertEqual(context.exception.code, "FINKORE_ENTITY_IMMUTABLE")
        self.assertEqual(entity["data"]["amount"], {"amount": "100.00", "currency": "EUR"})

    def test_transition_preserves_identity(self) -> None:
        entity = {"type": "invoice", "id": "inv-42", "state": "DRAFT", "data": {"amount": {"amount": "100.00", "currency": "EUR"}}}
        self.assertEqual(transition_entity(DEFINITION, entity, "FINAL")["id"], "inv-42")

    def test_import_rejects_duplicate_revision_observations(self) -> None:
        entity = {
            "type": "invoice",
            "id": "inv-42",
            "state": "FINAL",
            "data": {"amount": {"amount": "100.00", "currency": "EUR"}},
        }

        with self.assertRaises(FinKoreError) as context:
            import_entity(
                DEFINITION,
                {
                    "entity": entity,
                    "currentRevision": "business-rev-2",
                    "historicalRevisions": ["business-rev-2"],
                },
            )

        self.assertEqual(context.exception.code, "FINKORE_ENTITY_INVALID_IDENTITY")
        self.assertEqual(entity["data"]["amount"], {"amount": "100.00", "currency": "EUR"})

    def test_import_enforces_declared_positive_and_cross_field_validators(self) -> None:
        valid = {
            "type": "invoice",
            "id": "inv-import",
            "state": "DRAFT",
            "data": {"amount": {"amount": "1.00", "currency": "EUR"}},
        }
        self.assertEqual(import_entity(DEFINITION, {"entity": valid}), {"entity": valid})

        invalid = deepcopy(valid)
        invalid["data"]["amount"] = {"amount": "-1", "currency": "EUR"}
        original = deepcopy(invalid)
        with self.assertRaises(FinKoreError) as context:
            import_entity(DEFINITION, {"entity": invalid})
        self.assertEqual(context.exception.code, "FINKORE_ENTITY_VALIDATION_FAILED")
        self.assertEqual(invalid, original)

        cross_field = deepcopy(DEFINITION)
        cross_field["mutability"]["DRAFT"] = ["amount", "limit"]
        cross_field["validation"] = [{"id": "WITHIN_LIMIT", "path": "amount", "otherPath": "limit", "rule": "money-not-greater-than"}]
        invalid_cross_field = {
            "type": "invoice",
            "id": "inv-import-limit",
            "state": "DRAFT",
            "data": {
                "amount": {"amount": "30", "currency": "EUR"},
                "limit": {"amount": "20", "currency": "EUR"},
            },
        }
        cross_field_original = deepcopy(invalid_cross_field)
        with self.assertRaises(FinKoreError) as context:
            import_entity(cross_field, {"entity": invalid_cross_field})
        self.assertEqual(context.exception.code, "FINKORE_ENTITY_VALIDATION_FAILED")
        self.assertEqual(invalid_cross_field, cross_field_original)


if __name__ == "__main__":
    unittest.main()
