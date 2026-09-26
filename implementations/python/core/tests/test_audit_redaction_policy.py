# SPDX-License-Identifier: MPL-2.0
"""Audit redaction authority, preservation, and returned-value ownership."""
from copy import deepcopy
import unittest

from finkore import FinKoreError, append_event, redact_history
from finkore.audit import validate_history


class AuditRedactionPolicyTests(unittest.TestCase):
    def inputs(self):
        entity = {'type': 'invoice', 'id': 'invoice-1'}
        first = {'eventId': 'created', 'eventType': 'ENTITY_CREATED', 'entity': entity,
                 'occurredAt': '2026-09-01T10:00:00.123456789Z'}
        target = {'eventId': 'changed', 'eventType': 'ENTITY_CHANGED', 'entity': entity,
                  'occurredAt': '2026-09-01T12:00:00+02:00',
                  'actor': {'id': 'alice', 'type': 'user', 'metadata': None},
                  'changes': [{'path': 'bankAccount', 'after': 'DE123'}],
                  'relationships': [{'relationshipId': 'rel-change', 'type': 'CORRECTS',
                                     'target': {'eventId': 'created', 'entity': entity}}]}
        history = append_event(append_event([], first)['history'], target)['history']
        evidence = {'eventId': 'redacted', 'eventType': 'AUDIT_CONTENT_REDACTED', 'entity': entity,
                    'occurredAt': '2026-09-02T10:00:00Z', 'actor': {'id': 'privacy', 'type': 'service'},
                    'metadata': {'reason': ['retention']}}
        policy = {'authority': 'retention-policy', 'protectedPaths': ['actor.metadata', 'bankAccount']}
        return history, policy, evidence

    def test_invalid_authority_preserves_history_policy_and_evidence(self):
        for authority in [None, '', False, True, 0, 42, [], ['retention'], {}, {'name': 'retention'}]:
            with self.subTest(authority=authority):
                history, policy, evidence = self.inputs()
                policy['authority'] = authority
                before = deepcopy((history, policy, evidence))
                with self.assertRaises(FinKoreError) as failure:
                    redact_history(history, policy, evidence)
                self.assertEqual(failure.exception.code, 'FINKORE_AUDIT_REDACTION_INVALID')
                self.assertEqual((history, policy, evidence), before)
                self.assertEqual(validate_history(history), before[0])
                self.assertEqual(append_event(history, evidence)['history'], [*before[0], before[2]])
        history, policy, evidence = self.inputs()
        del policy['authority']
        before = deepcopy((history, policy, evidence))
        with self.assertRaises(FinKoreError) as failure:
            redact_history(history, policy, evidence)
        self.assertEqual(failure.exception.code, 'FINKORE_AUDIT_REDACTION_INVALID')
        self.assertEqual((history, policy, evidence), before)

    def test_authorized_redaction_preserves_meaning_and_owns_observations(self):
        history, policy, evidence = self.inputs()
        before = deepcopy((history, policy, evidence))
        result = redact_history(history, policy, evidence)
        view = deepcopy(history[1])
        view['actor']['metadata'] = {'presence': 'REDACTED'}
        view['changes'][0]['after'] = {'presence': 'REDACTED'}
        self.assertEqual(result, {'event': view, 'evidenceEvent': evidence, 'history': [*history, evidence]})
        self.assertNotIn('displayName', result['event']['actor'])
        self.assertNotIn('before', result['event']['changes'][0])
        imported = validate_history(result['history'])
        next_evidence = {**deepcopy(evidence), 'eventId': 'redacted-again'}
        next_result = redact_history(imported, policy, next_evidence)
        self.assertEqual(next_result, {'event': view, 'evidenceEvent': next_evidence, 'history': [*imported, next_evidence]})
        result['event']['actor']['id'] = 'changed-view'
        result['event']['relationships'][0]['target']['eventId'] = 'changed-view'
        result['history'][0]['entity']['id'] = 'changed-observation'
        result['evidenceEvent']['metadata']['reason'].append('changed-observation')
        self.assertEqual((history, policy, evidence), before)
        self.assertEqual(imported, [*before[0], before[2]])

    def test_authorized_change_only_control(self):
        history, policy, evidence = self.inputs()
        policy['protectedPaths'] = ['bankAccount']
        result = redact_history(history, policy, evidence)
        view = deepcopy(history[1])
        view['changes'][0]['after'] = {'presence': 'REDACTED'}
        self.assertEqual(result, {'event': view, 'evidenceEvent': evidence, 'history': [*history, evidence]})
        self.assertIsNone(result['event']['actor']['metadata'])
