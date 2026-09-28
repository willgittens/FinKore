# SPDX-License-Identifier: MPL-2.0
"""Approval vector and native equality checks, independent of conformance adapters."""
from copy import deepcopy
from decimal import Decimal, localcontext
import json
from pathlib import Path
import unittest
from finkore import FinKoreError
from finkore.approvals import (evaluate_decision, evaluate_requirement, evaluate_condition,
    evaluate_chain, evaluate_composition, record_decision, withdraw_decision,
    supersede_decision, supersede_requirement)
import test_evidence_regressions as evidence_regressions
REQ, FIRST = evidence_regressions.REQ, evidence_regressions.FIRST
ROOT = Path(__file__).resolve().parents[4]


def invoke(v):
    i, op = v['input'], v['operation']
    kwargs = {native: i[key] for key, native in [('currentSubjectFacts', 'current_subject_facts'), ('relevantFactPaths', 'relevant_fact_paths'), ('evaluatedAt', 'evaluated_at')] if key in i}
    if op == 'approval.decision.evaluate': return evaluate_decision(i.get('requirement'), i.get('decision'), **kwargs)
    if op == 'approval.requirement.evaluate': return evaluate_requirement(i.get('requirement'), i.get('decisions'), **kwargs)
    if op == 'approval.condition.evaluate': return evaluate_condition(i.get('condition'), result=i.get('result'), **({'facts': i['facts']} if 'facts' in i else {}))
    if op == 'approval.chain.evaluate': return evaluate_chain(i.get('chain'), i.get('states'))
    if op == 'approval.composition.evaluate': return evaluate_composition(i.get('composition'), i.get('requirements'), context=i.get('context'), **({'decisions': i['decisions']} if 'decisions' in i else {}))
    if op == 'approval.decision.record': return record_decision(i.get('requirement'), i.get('decision'), i.get('history'))
    if op == 'approval.decision.withdraw': return withdraw_decision(i.get('requirement'), i.get('history'), i.get('withdrawal'))
    if op == 'approval.decision.supersede': return supersede_decision(i.get('history'), i.get('supersession'))
    if op == 'approval.requirement.supersede': return supersede_requirement(i.get('history'), i.get('supersession'))
    raise AssertionError(op)


class ApprovalContracts(unittest.TestCase):
    def test_vectors(self):
        manifest = json.loads((ROOT / 'conformance/manifest.json').read_text())
        vectors = [v for s in manifest['suites'] if s['id'] == 'approvals' for f in s['vectorFiles'] for v in json.loads((ROOT / 'conformance' / f).read_text())['vectors']]
        self.assertTrue(vectors)
        for v in vectors:
            with self.subTest(vector=v['id']):
                candidate = deepcopy(v)
                try:
                    if v['expected']['status'] == 'success': self.assertEqual(v['expected']['value'], invoke(candidate))
                    else:
                        with self.assertRaises(FinKoreError) as caught: invoke(candidate)
                        self.assertEqual(v['expected']['error']['code'], caught.exception.code)
                finally: self.assertEqual(v, candidate)

    def test_returned_history_sequences(self):
        evidence = evidence_regressions.EvidenceRegressions()
        for lifecycle in ('withdraw', 'target', 'successor', 'requirement'):
            for variant in ('control', 'collision', 'offset'):
                with self.subTest(lifecycle=lifecycle, variant=variant): evidence.sequence(lifecycle, variant)

    def test_exact_native_numbers_and_full_structure(self):
        pairs = [(Decimal('1.00'), 1), (Decimal('0.1'), 0.1), (0.1, Decimal('0.1')), (10**30+1, Decimal('1000000000000000000000000000001.0')), (Decimal('-0.00'), 0)]
        for left, right in pairs:
            for selected in (False, True):
                with self.subTest(left=left, right=right, selected=selected), localcontext() as context:
                    context.prec = 2
                    before_flags = dict(context.flags)
                    facts = {'nested': [{'value': left}], 'unchanged': False}
                    now = {'unchanged': False, 'nested': [{'value': right}]}
                    d = dict(FIRST, subjectFacts=facts)
                    args = {'relevant_fact_paths': ['nested']} if selected else {}
                    self.assertEqual('EFFECTIVE', evaluate_decision(REQ, d, now, **args))
                    self.assertEqual('APPROVED', evaluate_requirement(REQ, [d], now, **args))
                    now['nested'][0]['value'] = str(right)
                    self.assertEqual('INEFFECTIVE', evaluate_decision(REQ, d, now, **args))
                    self.assertEqual(before_flags, context.flags)

    def test_adjacent_large_numbers_are_distinct(self):
        left = Decimal('1000000000000000000000000000001.000000001')
        right = Decimal('1000000000000000000000000000001.000000002')
        d = dict(FIRST, subjectFacts={'value': left})
        self.assertEqual('INEFFECTIVE', evaluate_decision(REQ, d, {'value': right}))
        self.assertEqual('PENDING', evaluate_requirement(REQ, [d], {'value': right}))
