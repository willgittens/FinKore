# SPDX-License-Identifier: MPL-2.0
"""Native Approval facts and bound Workflow retention, independent of adapters."""
from copy import deepcopy
from decimal import Decimal
import unittest
from finkore import FinKoreError
from finkore.approvals import record_decision, evaluate_decision, evaluate_requirement, evaluate_composition
from finkore.workflow import WorkflowDefinition, create_workflow, transition_workflow
from test_evidence_regressions import REQ, FIRST


def definition(value):
    return {'states': ['DRAFT', 'DONE'], 'initialState': 'DRAFT', 'terminalStates': ['DONE'],
            'transitions': [{'source': 'DRAFT', 'target': 'DONE', 'guard': {'fact': 'value', 'equals': value}}],
            'definitionIdentity': 'flow', 'definitionVersionIdentity': 'v1'}


class NativeOwnership(unittest.TestCase):
    def error(self, code, call):
        with self.assertRaises(FinKoreError) as caught: call()
        self.assertEqual(code, caught.exception.code)

    def test_unsupported_approval_values(self):
        class MutableInt(int): pass
        class MutableFloat(float): pass
        class MutableDecimal(Decimal): pass
        class CopyTrap:
            def __deepcopy__(self, memo): raise AssertionError('unsupported object must be validated before copying')
        cycle = []; cycle.append(cycle)
        for value in [MutableInt(1), MutableFloat(1), MutableDecimal('1'), float('nan'), float('inf'), Decimal('NaN'), Decimal('Infinity'), object(), CopyTrap(), cycle, {1: 'bad'}]:
            with self.subTest(kind=type(value).__name__):
                history = record_decision(REQ, FIRST, [])
                before = deepcopy(history)
                candidate = dict(FIRST, subjectFacts={'nested': [value]})
                self.error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(REQ, candidate, history))
                self.error('FINKORE_APPROVAL_INVALID_DECISION', lambda: evaluate_decision(REQ, FIRST, {'nested': [value]}))
                self.error('FINKORE_APPROVAL_INVALID_DECISION', lambda: evaluate_requirement(REQ, {'history': [candidate]}))
                self.assertEqual(history, before)

    def test_supported_facts_capture_and_observation(self):
        for number in [1, 0.1, Decimal('1.00000000000000000000001'), 10**50]:
            child = {'value': number}
            facts = {'left': child, 'right': child, 'array': [None, False, 0]}
            candidate = dict(FIRST, subjectFacts=facts)
            history = record_decision(REQ, candidate, [])
            before = deepcopy(history)
            child['value'] = 99
            self.assertEqual(history, before)
            next_history = record_decision(REQ, dict(FIRST, decidedAt='2026-09-02T10:00:00Z'), history)
            next_history['history'][0]['subjectFacts']['left']['value'] = 88
            self.assertEqual(history, before)
            self.assertEqual('APPROVED', evaluate_requirement(REQ, history, before['history'][0]['subjectFacts']))

    def test_workflow_native_numbers(self):
        class MutableInt(int): pass
        class MutableFloat(float): pass
        cycle = {}; cycle['self'] = cycle
        for value in [MutableInt(1), MutableFloat(1), Decimal('1'), float('inf'), cycle]:
            self.error('FINKORE_WORKFLOW_INVALID_DEFINITION', lambda: WorkflowDefinition.from_portable(definition({'nested': [value]})))

    def test_workflow_owned_guard_control(self):
        child = {'value': [1, False, None]}
        value = {'left': child, 'right': child}
        original = deepcopy(value)
        candidate = definition(value)
        bound = WorkflowDefinition.from_portable(candidate)
        instance = create_workflow(bound)
        value['left']['value'][0] = 999
        observed = bound.transitions[0].guards
        observed[0]['equals']['left']['value'][0] = 888
        self.assertEqual('DONE', transition_workflow(bound, instance, 'DONE', {'value': original}).current_state)
        self.assertEqual('DRAFT', instance.current_state)
        self.assertEqual(bound.transitions[0].guards[0]['equals'], original)

    def test_required_workflow_collections(self):
        for key in ['terminalStates', 'transitions']:
            candidate = definition(1); del candidate[key]
            self.error('FINKORE_WORKFLOW_INVALID_DEFINITION', lambda: WorkflowDefinition.from_portable(candidate))

    def test_composition_native_evidence_priority(self):
        composition = {'rootGroup': 'q', 'groups': [{'id': 'q', 'kind': 'N_OF_M', 'threshold': 1, 'members': [{'id': 'm', 'type': 'requirement', 'requirementId': 'review', 'voter': {'id': 'alice'}}]}]}
        requirement = {'id': 'review', 'applicability': 'APPLICABLE', 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}
        decision = {'requirementId': 'review', 'actor': {'id': 'alice'}, 'effective': True, 'outcome': 'APPROVED', 'subjectFacts': {'value': object()}}
        self.error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(composition, [requirement], [decision]))
        self.error('FINKORE_APPROVAL_CONDITION_UNRESOLVED', lambda: evaluate_composition(composition, [dict(requirement, applicability='UNKNOWN')], [decision]))
        self.error('FINKORE_APPROVAL_INVALID_CONTEXT', lambda: evaluate_composition(composition, [dict(requirement, requiresEvaluationContext=True)], [decision]))

        malformed_requirement = dict(requirement, subjectFacts={'value': object()})
        self.error('FINKORE_APPROVAL_INVALID_CHAIN', lambda: evaluate_composition(composition, [malformed_requirement], []))
        self.error('FINKORE_APPROVAL_CONDITION_UNRESOLVED', lambda: evaluate_composition(composition, [dict(malformed_requirement, applicability='UNKNOWN')], []))
        self.error('FINKORE_APPROVAL_INVALID_CONTEXT', lambda: evaluate_composition(composition, [dict(malformed_requirement, requiresEvaluationContext=True)], []))
