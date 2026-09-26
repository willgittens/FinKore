# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import unittest
from copy import deepcopy

from finkore import FinKoreError, WorkflowDefinition, WorkflowInstance, create_workflow, import_workflow, transition_workflow


class WorkflowTests(unittest.TestCase):
    def test_native_constructor_shapes(self) -> None:
        """Native definitions reject malformed containers before exposing values."""
        from finkore.workflow import WorkflowTransition
        base = dict(states=('DRAFT', 'DONE'), initial_state='DRAFT', terminal_states=('DONE',),
                    transitions=(WorkflowTransition('DRAFT', 'DONE'),))
        faults = [{'states': None}, {'states': 'DRAFT'}, {'states': ([],)},
                  {'initial_state': []}, {'terminal_states': None}, {'terminal_states': ('DONE', 'DONE')},
                  {'transitions': None}, {'transitions': ({'source': 'DRAFT', 'target': 'DONE'},)},
                  {'definition_identity': ''}, {'definition_version_identity': 'v1'}]
        for fault in faults:
            with self.subTest(fault=fault):
                with self.assertRaises(FinKoreError) as caught:
                    WorkflowDefinition(**{**base, **fault})
                self.assertEqual(caught.exception.code, 'FINKORE_WORKFLOW_INVALID_DEFINITION')

    def test_native_transition_and_instance_structure(self) -> None:
        """Malformed native observations fail before later binding/state checks."""
        from finkore.workflow import WorkflowTransition
        for source, target in [(None, 'DONE'), ('DRAFT', []), ({}, 'DONE')]:
            with self.subTest(source=source, target=target):
                with self.assertRaises(FinKoreError) as caught:
                    WorkflowTransition(source, target)
                self.assertEqual(caught.exception.code, 'FINKORE_WORKFLOW_INVALID_DEFINITION')
        for args in [(None,), ([],), ('DRAFT', {}), ('DRAFT', {'definitionIdentity': 'f'}),
                     ('DRAFT', None, ''), ('DRAFT', None, 7)]:
            with self.subTest(args=args):
                with self.assertRaises(FinKoreError) as caught:
                    WorkflowInstance(*args)
                self.assertEqual(caught.exception.code, 'FINKORE_WORKFLOW_INVALID_INSTANCE')
        self.assertEqual(WorkflowInstance('DRAFT', None, None).to_portable(), {'currentState': 'DRAFT'})

    def test_import_binding_input_and_repeated_observations(self) -> None:
        """WORKFLOW-VERSION-007/008/011: an imported observation cannot rebind instances."""
        binding = {"definitionIdentity": "review", "definitionVersionIdentity": "1"}
        definition = WorkflowDefinition.from_portable({**binding, "states": ["DRAFT", "DONE"],
            "initialState": "DRAFT", "terminalStates": ["DONE"],
            "transitions": [{"source": "DRAFT", "target": "DONE"}]})
        source = {"currentState": "DRAFT", "binding": deepcopy(binding), "revision": "opaque:r1"}
        instance = import_workflow(definition, WorkflowInstance.from_portable(source))
        before = deepcopy(source)
        independent = WorkflowInstance.from_portable(source)
        source["binding"]["definitionVersionIdentity"] = "2"
        instance.to_portable()["binding"]["definitionVersionIdentity"] = "3"
        self.assertEqual(instance.to_portable(), before)
        self.assertEqual(independent.to_portable(), before)
        self.assertEqual(transition_workflow(definition, instance, "DONE").to_portable(), {**before, "currentState": "DONE"})
        self.assertEqual(instance.to_portable(), before)

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

    def test_guard_equality_is_presence_aware_type_sensitive_and_recursive(self) -> None:
        def guarded(expected: object) -> WorkflowDefinition:
            return WorkflowDefinition.from_portable(
                {
                    "states": ["SUBMITTED", "APPROVED"],
                    "initialState": "SUBMITTED",
                    "terminalStates": ["APPROVED"],
                    "transitions": [
                        {"source": "SUBMITTED", "target": "APPROVED", "guard": {"fact": "value", "equals": expected}}
                    ],
                }
            )

        for expected, actual in ((True, 1), (1, True), ({"nested": [True]}, {"nested": [1]})):
            with self.subTest(expected=expected, actual=actual):
                instance = WorkflowInstance.from_portable({"currentState": "SUBMITTED"})
                with self.assertRaises(FinKoreError) as context:
                    transition_workflow(guarded(expected), instance, "APPROVED", {"value": actual})
                self.assertEqual(context.exception.code, "FINKORE_WORKFLOW_GUARD_REJECTED")
                self.assertEqual(instance.to_portable(), {"currentState": "SUBMITTED"})

        missing = WorkflowInstance.from_portable({"currentState": "SUBMITTED"})
        with self.assertRaises(FinKoreError) as context:
            transition_workflow(guarded(None), missing, "APPROVED", {})
        self.assertEqual(context.exception.code, "FINKORE_WORKFLOW_GUARD_REJECTED")
        self.assertEqual(missing.to_portable(), {"currentState": "SUBMITTED"})

        self.assertEqual(
            transition_workflow(
                guarded({"status": "CLEAR", "steps": ["KYC", "LIMIT"]}),
                WorkflowInstance.from_portable({"currentState": "SUBMITTED"}),
                "APPROVED",
                {"value": {"steps": ["KYC", "LIMIT"], "status": "CLEAR"}},
            ).to_portable(),
            {"currentState": "APPROVED"},
        )
        self.assertEqual(
            transition_workflow(
                guarded(None),
                WorkflowInstance.from_portable({"currentState": "SUBMITTED"}),
                "APPROVED",
                {"value": None},
            ).to_portable(),
            {"currentState": "APPROVED"},
        )


if __name__ == "__main__":
    unittest.main()

class WorkflowOwnershipTests(unittest.TestCase):
    def test_native_json_boundary(self):
        from finkore.workflow import WorkflowTransition
        cycle = []; cycle.append(cycle)
        for value in [float('nan'), float('inf'), float('-inf'), object(), {1: True}, (1,), {1}, cycle, {'x': object()}]:
            with self.subTest(value=type(value)):
                with self.assertRaises(FinKoreError) as error:
                    WorkflowTransition('DRAFT', 'DONE', ({'fact': 'value', 'equals': value},))
                self.assertEqual(error.exception.code, 'FINKORE_WORKFLOW_INVALID_DEFINITION')
        for guards in [None, {}, 'guard']:
            with self.assertRaises(FinKoreError) as error:
                WorkflowTransition('DRAFT', 'DONE', guards)
            self.assertEqual(error.exception.code, 'FINKORE_WORKFLOW_INVALID_DEFINITION')
        for guard in [None, {}, {'fact': '', 'equals': None}, {'fact': 'value'}]:
            with self.assertRaises(FinKoreError) as error:
                WorkflowTransition('DRAFT', 'DONE', (guard,))
            self.assertEqual(error.exception.code, 'FINKORE_WORKFLOW_INVALID_DEFINITION')

    def test_native_constructor_owns_unversioned_guards_and_declarations(self):
        from finkore.workflow import WorkflowTransition
        shared = {'approved': True}
        expected = {'left': [shared, None, 2.5, 'ok'], 'right': shared}
        guard = {'fact': 'value', 'equals': expected}
        transition = WorkflowTransition('DRAFT', 'DONE', (guard,))
        states, terminals, transitions = ['DRAFT', 'DONE'], ['DONE'], [transition]
        definition = WorkflowDefinition(states, 'DRAFT', terminals, transitions)
        instance = create_workflow(definition)
        shared['approved'] = False
        transition.guards[0]['equals']['right']['approved'] = False
        transition.guards[0]['fact'] = 'other'
        states.clear(); terminals.clear(); transitions.clear()
        self.assertEqual(definition.states, ('DRAFT', 'DONE'))
        self.assertEqual(definition.terminal_states, ('DONE',))
        with self.assertRaises(FinKoreError) as error:
            transition_workflow(definition, instance, 'DONE', {'value': expected})
        self.assertEqual(error.exception.code, 'FINKORE_WORKFLOW_GUARD_REJECTED')
        self.assertEqual(instance.to_portable(), {'currentState': 'DRAFT'})
        facts = {'value': {'left': [{'approved': True}, None, 2.5, 'ok'], 'right': {'approved': True}}}
        self.assertEqual(transition_workflow(definition, instance, 'DONE', facts).to_portable(), {'currentState': 'DONE'})
