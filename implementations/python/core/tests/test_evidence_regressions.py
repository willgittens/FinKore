# SPDX-License-Identifier: MPL-2.0
"""Core 0.9.7 direct-core regressions, exact controls, and returned-value reuse."""
from copy import deepcopy
from decimal import Decimal, localcontext
from pathlib import Path
import json
import unittest

from finkore import FinKoreError
from finkore.audit import append_event
from finkore.workflow import WorkflowDefinition, WorkflowInstance, transition_workflow, create_workflow, import_workflow
from finkore.approvals import (evaluate_composition, evaluate_condition, evaluate_decision,
    evaluate_requirement, record_decision, withdraw_decision, supersede_decision,
    supersede_requirement, normalize_decision_set)
from finkore.entities import create_entity, import_entity, mutate_entity, transition_entity, evolve_entity

ROOT = Path(__file__).resolve().parents[4]
REQ = {'id': 'review', 'subject': {'type': 'invoice', 'id': 'i'}, 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}
FIRST = {'requirementId': 'review', 'actor': {'id': 'alice'}, 'subjectFacts': {'amount': '10'}, 'outcome': 'APPROVED', 'decidedAt': '2026-09-01T10:00:00Z'}


def vectors():
    manifest = json.loads((ROOT / 'conformance/manifest.json').read_text())
    return [v for s in manifest['suites'] for f in s['vectorFiles']
            if f.endswith(('/evidence-regressions.json', '/malformed-boundary-regressions.json', '/entities/discovery-regressions.json', '/workflow/discovery-regressions.json'))
            for v in json.loads((ROOT / 'conformance' / f).read_text())['vectors']
            if '.boundary097.' in v['id']] + [v for v in json.loads((ROOT / 'conformance/boundary097-cases.json').read_text())['cases'] if v['testBoundary'] == 'core-and-adapter']


def invoke(v):
    i, op = v['input'], v['operation']
    if op == 'approval.composition.evaluate':
        return evaluate_composition(i['composition'], i['requirements'], context=i.get('context'), **({'decisions': i['decisions']} if 'decisions' in i else {}))
    if op == 'approval.condition.evaluate':
        args = {k: i[k] for k in ('facts', 'result') if k in i}
        return evaluate_condition(i['condition'], **args)
    if op in ('approval.decision.evaluate', 'approval.requirement.evaluate'):
        kwargs = {target: i[key] for key, target in [('currentSubjectFacts', 'current_subject_facts'), ('relevantFactPaths', 'relevant_fact_paths'), ('evaluatedAt', 'evaluated_at')] if key in i}
        if op == 'approval.decision.evaluate':
            return evaluate_decision(i['requirement'], i['decision'], **kwargs)
        return evaluate_requirement(i['requirement'], i['decisions'], **kwargs)
    if op == 'approval.decision.record':
        return record_decision(i['requirement'], i['decision'], i['history'])
    if op == 'finkore.audit.append':
        return append_event(i['history'], i['event'])
    if op == 'workflow.create':
        return create_workflow(WorkflowDefinition.from_portable(i.get('definition'))).to_portable()
    if op == 'workflow.import':
        return import_workflow(WorkflowDefinition.from_portable(i.get('definition')), WorkflowInstance.from_portable(i.get('instance'))).to_portable()
    if op == 'finkore.workflow.transition':
        return transition_workflow(WorkflowDefinition.from_portable(i['definition']), WorkflowInstance.from_portable(i.get('instance')), i.get('target'), i.get('facts')).to_portable()
    if op == 'finkore.entity.create':
        return create_entity(i['definition'], i['id'], i.get('data'))
    if op == 'finkore.entity.mutate':
        return mutate_entity(i['definition'], i['entity'], i['changes'])
    if op == 'finkore.entity.transition':
        return transition_entity(i['definition'], i['entity'], i.get('target'))
    if op == 'entity.import':
        return import_entity(i['definition'], i['import'])
    if op.startswith('finkore.entity.evolution.'):
        request = dict(i)
        if isinstance(i.get('evolutionHistory'), list):
            request['evolutionHistory'] = {'relations': i['evolutionHistory']}
        kind = {'correct': 'CORRECTION', 'reverse': 'REVERSAL', 'void': 'VOID', 'supersede': 'SUPERSESSION'}[op.rsplit('.', 1)[1]]
        return evolve_entity(kind, i['definition'], request)
    raise AssertionError('Missing native dispatch: ' + op)


class EvidenceRegressions(unittest.TestCase):
    def portable_error(self, code, action):
        with self.assertRaises(FinKoreError) as caught:
            action()
        self.assertEqual(code, caught.exception.code)

    def sequence(self, lifecycle, variant):
        def ref(d):
            return {'requirementId': d['requirementId'], 'actorId': d['actor']['id'], 'decidedAt': d['decidedAt']}
        first = deepcopy(FIRST)
        second = dict(first, subjectFacts={'amount': '20'}, decidedAt='2026-09-02T10:00:00Z')
        one = record_decision(REQ, first, [])
        two = record_decision(REQ, second, one)
        event = {'actor': {'id': 'alice'}, 'recordedAt': '2026-09-03T10:00:00Z'}
        if lifecycle == 'withdraw':
            retained = withdraw_decision(REQ, two, dict(event, target=ref(first)))
        elif lifecycle == 'requirement':
            retained = supersede_requirement(two, dict(event, targetRequirementId='review', successorRequirementId='next'))
        else:
            retained = supersede_decision(two, dict(event, target=ref(first), successor=ref(second)))
        before = deepcopy(retained)
        target = second if lifecycle == 'successor' else first
        timestamp = '2026-09-04T10:00:00Z' if variant == 'control' else target['decidedAt']
        if variant == 'offset':
            timestamp = timestamp.replace('10:00:00Z', '12:00:00+02:00')
        candidate = dict(first, decidedAt=timestamp, subjectFacts={'amount': '30'})
        try:
            if variant != 'control' and lifecycle != 'requirement':
                self.portable_error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(REQ, candidate, retained))
            else:
                result = record_decision(REQ, candidate, retained)
                self.assertEqual(result, {'history': [first, second, candidate], 'lifecycle': before['lifecycle']})
                self.assertEqual(normalize_decision_set(result), (result['history'], result['lifecycle']))
                self.assertEqual(evaluate_requirement(REQ, result, candidate['subjectFacts'], ['amount']), 'PENDING' if lifecycle == 'requirement' else 'APPROVED')
        finally:
            self.assertEqual(retained, before)
            self.assertEqual(one, {'history': [first]})
            self.assertEqual(two, {'history': [first, second]})

    def test_owned_facts_control(self):
        candidate = dict(deepcopy(FIRST), subjectFacts={'nested': {'value': Decimal('1.00')}, 'array': [2, 3]})
        retained = record_decision(REQ, candidate, [])
        before = deepcopy(retained)
        candidate['subjectFacts']['nested']['value'] = 999
        observed, _ = normalize_decision_set(retained)
        observed[0]['subjectFacts']['nested']['value'] = 555
        self.assertEqual(retained, before)
        self.assertEqual(evaluate_requirement(REQ, retained, before['history'][0]['subjectFacts'], ['nested.value', 'array']), 'APPROVED')

    def test_exact_numeric_fact_control(self):
        candidate = dict(FIRST, subjectFacts={'value': Decimal('1.00')})
        self.assertEqual(evaluate_decision(REQ, candidate, {'value': Decimal('1.00')}, ['value']), 'EFFECTIVE')

    def test_exact_numeric_fact_scale_and_context(self):
        for number in ['1.0', '12345678901234567890.123456789']:
            with self.subTest(number=number), localcontext() as context:
                context.prec = 3
                before = dict(context.flags)
                candidate = dict(FIRST, subjectFacts={'value': Decimal(number)})
                self.assertEqual(evaluate_decision(REQ, candidate, {'value': Decimal(number + '0')}, ['value']), 'EFFECTIVE')
                self.assertEqual(context.flags, before)

    def test_unsupported_numeric_subclass_rejected(self):
        class MutableInt(int):
            pass
        history = record_decision(REQ, FIRST, [])
        before = deepcopy(history)
        for value in [MutableInt(1), float('nan'), float('inf'), Decimal('NaN'), Decimal('Infinity')]:
            with self.subTest(value=repr(value)):
                self.portable_error('FINKORE_APPROVAL_INVALID_DECISION', lambda: record_decision(REQ, dict(FIRST, subjectFacts={'value': value}), history))
                self.assertEqual(history, before)


def vector_test(v):
    def test(self):
        candidate = deepcopy(v)
        before = deepcopy(candidate['input'])
        try:
            if candidate['expected']['status'] == 'success':
                self.assertEqual(invoke(candidate), candidate['expected']['value'])
            else:
                self.portable_error(candidate['expected']['error']['code'], lambda: invoke(candidate))
        finally:
            self.assertEqual(candidate['input'], before)
    return test


for vector in vectors():
    setattr(EvidenceRegressions, 'test_' + vector['id'].replace('.', '_').replace('-', '_'), vector_test(vector))
for lifecycle in ['withdraw', 'target', 'successor', 'requirement']:
    for variant in ['control', 'collision', 'offset']:
        def sequence_test(self, lifecycle=lifecycle, variant=variant):
            self.sequence(lifecycle, variant)
        setattr(EvidenceRegressions, f'test_sequence_{lifecycle}_{variant}', sequence_test)

if __name__ == '__main__':
    unittest.main()
