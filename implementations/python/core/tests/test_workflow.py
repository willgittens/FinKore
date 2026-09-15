# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import unittest

from finkore import FinKoreError, WorkflowDefinition, WorkflowInstance, create_workflow, import_workflow, transition_workflow


class WorkflowTests(unittest.TestCase):
    def test_create_uses_declared_initial_state_and_binding(self) -> None:
        definition = WorkflowDefinition.from_portable(
            {
                "definitionIdentity": "invoice-approval",
                "definitionVersionIdentity": "1",
                "states": ["DRAFT", "SUBMITTED"],
                "initialState": "DRAFT",
                "terminalStates": ["SUBMITTED"],
                "transitions": [{"source": "DRAFT", "target": "SUBMITTED"}],
            }
        )
        self.assertEqual(
            create_workflow(definition).to_portable(),
            {
                "currentState": "DRAFT",
                "binding": {"definitionIdentity": "invoice-approval", "definitionVersionIdentity": "1"},
            },
        )

    def test_rejects_terminal_outgoing_definition(self) -> None:
        with self.assertRaises(FinKoreError) as context:
            WorkflowDefinition.from_portable(
                {
                    "states": ["DRAFT", "DONE"],
                    "initialState": "DRAFT",
                    "terminalStates": ["DONE"],
                    "transitions": [{"source": "DONE", "target": "DRAFT"}],
                }
            )
        self.assertEqual(context.exception.code, "FINKORE_WORKFLOW_INVALID_DEFINITION")

    def test_import_preserves_current_state_revision_and_binding(self) -> None:
        definition = WorkflowDefinition.from_portable(
            {
                "definitionIdentity": "invoice-approval",
                "definitionVersionIdentity": "1",
                "states": ["DRAFT", "SUBMITTED"],
                "initialState": "DRAFT",
                "terminalStates": [],
                "transitions": [{"source": "DRAFT", "target": "SUBMITTED"}],
            }
        )
        instance = WorkflowInstance.from_portable(
            {
                "currentState": "SUBMITTED",
                "binding": {"definitionIdentity": "invoice-approval", "definitionVersionIdentity": "1"},
                "revision": "wf-rev:0007",
            }
        )
        self.assertEqual(import_workflow(definition, instance).to_portable(), instance.to_portable())

    def test_transition_rejection_preserves_instance(self) -> None:
        definition = WorkflowDefinition.from_portable(
            {
                "states": ["SUBMITTED", "APPROVED"],
                "initialState": "SUBMITTED",
                "terminalStates": ["APPROVED"],
                "transitions": [
                    {
                        "source": "SUBMITTED",
                        "target": "APPROVED",
                        "guards": [{"fact": "approvalsSatisfied", "equals": True}],
                    }
                ],
            }
        )
        instance = WorkflowInstance.from_portable({"currentState": "SUBMITTED"})
        with self.assertRaises(FinKoreError) as context:
            transition_workflow(definition, instance, "APPROVED", {"approvalsSatisfied": False})
        self.assertEqual(context.exception.code, "FINKORE_WORKFLOW_GUARD_REJECTED")
        self.assertEqual(instance.to_portable(), {"currentState": "SUBMITTED"})

    def test_conflict_precedes_terminal_state(self) -> None:
        definition = WorkflowDefinition.from_portable(
            {
                "states": ["SUBMITTED", "APPROVED"],
                "initialState": "SUBMITTED",
                "terminalStates": ["APPROVED"],
                "transitions": [{"source": "SUBMITTED", "target": "APPROVED"}],
            }
        )
        instance = WorkflowInstance.from_portable({"currentState": "APPROVED"})
        with self.assertRaises(FinKoreError) as context:
            transition_workflow(definition, instance, "SUBMITTED", expected_current_state="SUBMITTED")
        self.assertEqual(context.exception.code, "FINKORE_WORKFLOW_STATE_CONFLICT")


if __name__ == "__main__":
    unittest.main()
