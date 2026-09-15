# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import unittest

from finkore import FinKoreError, create_entity, mutate_entity, transition_entity


DEFINITION = {
    "type": "invoice",
    "identityScope": "tenant-a",
    "workflow": {"states": ["DRAFT", "FINAL"], "initialState": "DRAFT", "terminalStates": ["FINAL"], "transitions": [{"source": "DRAFT", "target": "FINAL"}]},
    "mutability": {"DRAFT": ["amount", "memo"], "FINAL": ["deliveryStatus"]},
    "validation": [{"id": "AMOUNT_POSITIVE", "path": "amount", "rule": "positive-money"}],
}


class EntityTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
