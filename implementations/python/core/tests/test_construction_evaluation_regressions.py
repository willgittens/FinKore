# SPDX-License-Identifier: MPL-2.0
"""Core 0.9.6 public boundaries: ordinary failing regressions and independent controls."""
import json
import unittest
from copy import deepcopy
from decimal import Decimal, localcontext
from pathlib import Path

from finkore import FinKoreError, Money, WorkflowDefinition, WorkflowInstance
from finkore.workflow import WorkflowTransition, create_workflow, import_workflow, transition_workflow
from finkore.approvals import (evaluate_composition, evaluate_chain, evaluate_decision,
    evaluate_requirement, record_decision, withdraw_decision, supersede_decision, supersede_requirement)
from finkore.audit import redact_history
from finkore.entities import import_entity, evolve_entity, mutate_entity, transition_entity

ROOT = Path(__file__).resolve().parents[4]
KINDS = {'correct': 'CORRECTION', 'reverse': 'REVERSAL', 'void': 'VOID', 'supersede': 'SUPERSESSION'}


def vectors():
    manifest = json.loads((ROOT / 'conformance/manifest.json').read_text())
    return [v for suite in manifest['suites'] for file in suite['vectorFiles']
            for v in json.loads((ROOT / 'conformance' / file).read_text())['vectors']
            if '.boundary096.' in v['id']]


def invoke(vector):
    """Representation translation only; every financial decision belongs to the public core."""
    i, op = vector['input'], vector['operation']
    if op == 'finkore.money.applyrate':
        return Money.from_portable(i['value']).apply_rate(i['rate'], i.get('rounding')).to_portable()
    if op in ('workflow.import', 'finkore.workflow.transition'):
        definition = WorkflowDefinition.from_portable(i['definition'])
        instance = WorkflowInstance.from_portable(i['instance'])
        before = deepcopy(instance.to_portable())
        try:
            if op == 'workflow.import':
                return import_workflow(definition, instance).to_portable()
            return transition_workflow(definition, instance, i['target'], i.get('facts')).to_portable()
        finally:
            assert instance.to_portable() == before, 'Source Workflow changed'
    if op == 'audit.redact':
        result = redact_history(i['history'], i['policy'], i['redactionEvent'])
        return {k: result[k] for k in ('event', 'evidenceEvent')}
    if op == 'approval.composition.evaluate':
        return evaluate_composition(i['composition'], i['requirements'], context=i.get('context'), **({'decisions': i['decisions']} if 'decisions' in i else {}))
    if op == 'approval.chain.evaluate':
        return evaluate_chain(i['chain'], i['states'])
    if op == 'approval.decision.evaluate':
        return evaluate_decision(i['requirement'], i['decision'], i.get('currentSubjectFacts'), i.get('relevantFactPaths'), i.get('evaluatedAt'))
    if op == 'approval.requirement.evaluate':
        return evaluate_requirement(i['requirement'], i['decisions'], i.get('currentSubjectFacts'), i.get('relevantFactPaths'), i.get('evaluatedAt'))
    if op == 'approval.decision.record':
        return record_decision(i['requirement'], i['decision'], i['history'])
    if op == 'entity.import':
        return import_entity(i['definition'], i['import'])
    if op.startswith('finkore.entity.evolution.'):
        request = deepcopy(i)
        request['evolutionHistory'] = {'relations': request['evolutionHistory']}
        return evolve_entity(KINDS[op.rsplit('.', 1)[1]], request['definition'], request)
    raise AssertionError('Missing native dispatch: ' + op)


class ConstructionEvaluationRegressions(unittest.TestCase):
    def portable_error(self, code, action):
        with self.assertRaises(FinKoreError) as caught:
            action()
        self.assertEqual(code, caught.exception.code)

    def test_money_decimal_controls(self):
        """MONEY-REPRESENTATION-002: native exponent notation does not invoke portable parsing."""
        for text, expected in [('1E+3', '1000'), ('-0.000', '0.000'), ('-1.2300', '-1.2300'),
                               ('12345678901234567890.123456789', '12345678901234567890.123456789')]:
            with self.subTest(text=text), localcontext() as context:
                context.prec = 3
                flags = dict(context.flags)
                value = Money(Decimal(text), 'EUR')
                before = value.to_portable()
                self.assertEqual(before, {'amount': expected, 'currency': 'EUR'})
                self.assertEqual(value.add(Money(Decimal('0'), 'EUR')).amount, Decimal(text))
                self.assertEqual(Money.from_portable(before).amount, Decimal(text))
                self.assertEqual(value.to_portable(), before)
                self.assertEqual(context.flags, flags)
                self.assertEqual(context.prec, 3)
        self.assertEqual(Money(Decimal('1.2300'), 'EUR', 2).to_portable(), {'amount': '1.23', 'currency': 'EUR'})

    def test_workflow_native_control(self):
        """Native definition -> create -> import -> transition retains owned declarations."""
        states = ['DRAFT', 'FINAL']
        definition = WorkflowDefinition(states, 'DRAFT', ('FINAL',), (WorkflowTransition('DRAFT', 'FINAL'),), 'flow', 'v1')
        states.append('GHOST')
        created = create_workflow(definition)
        self.assertEqual(created.to_portable(), {'currentState': 'DRAFT', 'binding': {'definitionIdentity': 'flow', 'definitionVersionIdentity': 'v1'}})
        imported = import_workflow(definition, WorkflowInstance.from_portable(created.to_portable()))
        result = transition_workflow(definition, imported, 'FINAL')
        self.assertEqual(result.to_portable(), {**created.to_portable(), 'currentState': 'FINAL'})
        self.assertEqual(created.to_portable()['currentState'], 'DRAFT')
        self.assertEqual(definition.states, ('DRAFT', 'FINAL'))

    def approval_sequence(self):
        req = {'id': 'review', 'subject': {'type': 'invoice', 'id': 'i'}, 'eligibleActors': ['alice'], 'approvedOutcome': 'APPROVED', 'rejectedOutcome': 'REJECTED'}
        first = {'requirementId': 'review', 'actor': {'id': 'alice'}, 'subjectFacts': None, 'outcome': 'APPROVED', 'decidedAt': '2026-09-01T10:00:00Z'}
        ref = {'requirementId': 'review', 'actorId': 'alice', 'decidedAt': first['decidedAt']}
        history = record_decision(req, first, [])
        self.assertEqual(history, {'history': [first]})
        self.assertEqual(evaluate_requirement(req, history), 'APPROVED')
        withdrawn = withdraw_decision(req, history, {'target': ref, 'actor': {'id': 'alice'}, 'recordedAt': '2026-09-02T10:00:00Z', 'type': 'IGNORED_REQUEST_MEMBER'})
        self.assertEqual(withdrawn['history'], [first])
        self.assertEqual(withdrawn['lifecycle'][0]['type'], 'WITHDRAWN')
        self.assertEqual(evaluate_requirement(req, withdrawn), 'PENDING')
        second = dict(first, decidedAt='2026-09-03T10:00:00Z')
        rerecorded = record_decision(req, second, withdrawn)
        self.assertEqual(rerecorded, {'history': [first, second], 'lifecycle': withdrawn['lifecycle']})
        self.assertEqual(evaluate_requirement(req, rerecorded), 'APPROVED')
        self.assertEqual(history, {'history': [first]})
        return req, rerecorded, second

    def test_approval_returned_history_control(self):
        self.approval_sequence()

    def test_approval_supersession_across_requirements(self):
        req, previous, decision = self.approval_sequence()
        other = dict(req, id='other')
        successor = dict(decision, requirementId='other')
        current = record_decision(other, successor, previous)
        ref = lambda value: {'requirementId': value['requirementId'], 'actorId': 'alice', 'decidedAt': value['decidedAt']}
        event = {'target': ref(decision), 'successor': ref(successor), 'actor': {'id': 'alice'}, 'recordedAt': '2026-09-05T00:00:00Z'}
        superseded = supersede_decision(current, event)
        before = deepcopy(superseded)
        self.assertEqual(evaluate_requirement(req, superseded), 'PENDING')
        self.assertEqual(evaluate_requirement(other, superseded), 'APPROVED')
        new = dict(decision, decidedAt='2026-09-06T00:00:00Z')
        recorded = record_decision(req, new, superseded)
        self.assertEqual(recorded, {'history': [*before['history'], new], 'lifecycle': before['lifecycle']})
        self.assertEqual(evaluate_requirement(req, recorded), 'APPROVED')
        self.portable_error('FINKORE_APPROVAL_INVALID_DECISION', lambda: supersede_decision(superseded, event))
        self.assertEqual(superseded, before)
        self.assertEqual(current['lifecycle'], previous['lifecycle'])

    def test_approval_considered_ineligible_expiration_context(self):
        req, _, decision = self.approval_sequence()
        ineligible = dict(decision, actor={'id': 'bob'}, expiresAt='2026-09-26T00:00:00Z')
        self.portable_error('FINKORE_APPROVAL_INVALID_CONTEXT', lambda: evaluate_requirement(req, [decision, ineligible]))

    def test_approval_invalid_history_reuse_boundaries(self):
        """APPROVAL-VALIDITY-014/012: each reuse boundary rejects an unknown committed kind."""
        req, history, second = self.approval_sequence()
        ref = {'requirementId': 'review', 'actorId': 'alice', 'decidedAt': second['decidedAt']}
        for boundary in ('record', 'evaluate', 'withdraw', 'supersede', 'supersede-requirement'):
            with self.subTest(boundary=boundary):
                malformed = deepcopy(history)
                malformed['lifecycle'][0]['type'] = 'UNKNOWN'
                before = deepcopy(malformed)
                event = {'target': ref, 'actor': {'id': 'alice'}, 'recordedAt': '2026-09-04T10:00:00Z'}
                actions = {
                    'record': lambda: record_decision(req, dict(second, decidedAt=event['recordedAt']), malformed),
                    'evaluate': lambda: evaluate_requirement(req, malformed),
                    'withdraw': lambda: withdraw_decision(req, malformed, event),
                    'supersede': lambda: supersede_decision(malformed, {**event, 'successor': malformed['lifecycle'][0]['target']}),
                    'supersede-requirement': lambda: supersede_requirement(malformed, {'targetRequirementId': 'review', 'successorRequirementId': 'next', 'actor': event['actor'], 'recordedAt': event['recordedAt']}),
                }
                try:
                    self.portable_error('FINKORE_APPROVAL_INVALID_DECISION', actions[boundary])
                finally:
                    self.assertEqual(malformed, before)
                    self.assertEqual(evaluate_requirement(req, history), 'APPROVED')

    def test_evolution_returned_history_control(self):
        self.evolution_sequence(False)

    def test_evolution_returned_history_null_precondition(self):
        self.evolution_sequence(True)

    def evolution_sequence(self, invalid):
        """ENTITY-EVOLUTION-023/025/033: real output is the next operation's input."""
        vector = next(v for v in vectors() if v['id'] == 'entity.boundary096.evolution-correct-control-001')
        first = invoke(deepcopy(vector))
        request = deepcopy(vector['input'])
        request['evolutionHistory'] = first['evolutionHistory']
        request['auditHistory'] = first['auditHistory']['history']
        request['relationId'] = 'second-correction'
        request['auditEvent']['eventId'] = 'second-audit'
        request['auditEvent']['metadata']['entityEvolution']['relationId'] = request['relationId']
        request['auditEvent']['relationships'][0]['relationshipId'] = 'second-audit-relation'
        if invalid:
            request['expectedSourceRevision'] = None
        before, preserved = deepcopy(request), deepcopy(first)
        try:
            if invalid:
                self.portable_error('FINKORE_ENTITY_STATE_CONFLICT', lambda: evolve_entity('CORRECTION', request['definition'], request))
            else:
                result = evolve_entity('CORRECTION', request['definition'], request)
                self.assertEqual(result['evolutionHistory']['relations'], [first['relation'], result['relation']])
                self.assertEqual(result['auditHistory']['history'], first['auditHistory']['history'] + [request['auditEvent']])
                self.assertEqual(result['source'], first['source'])
        finally:
            self.assertEqual(request, before)
            self.assertEqual(first, preserved)

    def test_entity_versioned_import_sequence(self):
        vector = deepcopy(next(v for v in vectors() if v['id'] == 'entity.boundary096.evolution-correct-control-001'))
        request = vector['input']
        binding = {'definitionIdentity': ' invoice-flow ', 'definitionVersionIdentity': ' v1 '}
        request['definition']['workflow'].update(binding)
        request['source']['binding'] = deepcopy(binding)
        request['related']['binding'] = deepcopy(binding)
        entity = {**request['source'], 'state': 'DRAFT'}
        mapping = {'mappingId': ' map:1 ', 'sourceSystem': ' legacy ', 'sourceId': ' 0001 ', 'entity': {'type': entity['type'], 'id': entity['id']}}
        input_value = {'entity': entity, 'identityMapping': mapping, 'currentRevision': request['sourceRevision'], 'historicalRevisions': ['rev-0'], 'conflictVersion': ' token '}
        before = deepcopy(input_value)
        imported = import_entity(request['definition'], input_value)
        self.assertEqual(imported, {**input_value, 'currentRevision': {**mapping['entity'], 'revision': 'rev-1', 'current': True}, 'historicalRevisions': [{**mapping['entity'], 'revision': 'rev-0', 'current': False}]})
        self.assertEqual(import_entity(request['definition'], imported), imported)
        updated = mutate_entity(request['definition'], imported['entity'], {'memo': 'updated'})
        request['source'] = transition_entity(request['definition'], updated, 'ISSUED')
        request['sourceRevision'] = imported['currentRevision']['revision']
        first = evolve_entity('CORRECTION', request['definition'], request)
        self.assertEqual(first['source'], request['source'])
        self.assertEqual(first['source']['binding'], binding)
        request['source'] = first['source']
        request['evolutionHistory'] = first['evolutionHistory']
        request['auditHistory'] = first['auditHistory']['history']
        request['relationId'] = 'second'
        request['auditEvent']['eventId'] = 'second-event'
        request['auditEvent']['metadata']['entityEvolution']['relationId'] = 'second'
        request['auditEvent']['relationships'][0]['relationshipId'] = 'second-evidence'
        preserved = deepcopy(request)
        self.portable_error('FINKORE_ENTITY_STATE_CONFLICT', lambda: evolve_entity('CORRECTION', request['definition'], {**request, 'expectedSourceRevision': None}))
        self.assertEqual(request, preserved)
        second = evolve_entity('CORRECTION', request['definition'], request)
        self.assertEqual(second['evolutionHistory']['relations'], [first['relation'], second['relation']])
        self.assertEqual(second['auditHistory']['history'], first['auditHistory']['history'] + [request['auditEvent']])
        self.assertEqual(input_value, before)

    def test_entity_presence_boundaries(self):
        for template in vectors():
            if template['id'].startswith('entity.boundary096.evolution-') and template['id'].endswith('-control-001'):
                omitted = deepcopy(template)
                for key in ('expectedSourceState', 'expectedSourceRevision', 'expectedSourceCurrent'):
                    omitted['input'].pop(key, None)
                self.assertEqual(invoke(omitted), template['expected']['value'])
                for current in (None, '', 1, [], {}):
                    candidate = deepcopy(omitted)
                    candidate['input']['expectedSourceCurrent'] = current
                    before = deepcopy(candidate)
                    self.portable_error('FINKORE_ENTITY_INVALID_MUTATION', lambda: invoke(candidate))
                    self.assertEqual(candidate, before)
        template = next(v for v in vectors() if v['id'] == 'entity.boundary096.import-control-001')
        for missing in ('sourceSystem', 'sourceId'):
            candidate = deepcopy(template)
            del candidate['input']['import']['sourceIdentity'][missing]
            self.portable_error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: invoke(candidate))
        for source in (None, {}, {'sourceSystem': 'other', 'sourceId': 'LEGACY-000042'}):
            for has_mapping in (False, True):
                candidate = deepcopy(template)
                candidate['input']['import']['sourceIdentity'] = source
                if not has_mapping:
                    del candidate['input']['import']['identityMapping']
                before = deepcopy(candidate)
                self.portable_error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: invoke(candidate))
                self.assertEqual(candidate, before)
        for key in ('mappingId', 'sourceSystem', 'sourceId', 'entity'):
            for standalone in (False, True):
                candidate = deepcopy(template)
                del candidate['input']['import']['identityMapping'][key]
                if standalone:
                    del candidate['input']['import']['sourceIdentity']
                self.portable_error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: invoke(candidate))
        for key in ('type', 'id'):
            candidate = deepcopy(template)
            candidate['input']['import']['identityMapping']['entity'][key] = 'other'
            self.portable_error('FINKORE_ENTITY_INVALID_IDENTITY', lambda: invoke(candidate))


def native_vector_test(vector):
    def test(self):
        candidate = deepcopy(vector)
        before = deepcopy(candidate['input'])
        try:
            expected = candidate['expected']
            if expected['status'] == 'success':
                self.assertEqual(invoke(candidate), expected['value'])
            else:
                self.portable_error(expected['error']['code'], lambda: invoke(candidate))
        finally:
            self.assertEqual(candidate['input'], before)
    return test


for vector in vectors():
    setattr(ConstructionEvaluationRegressions, 'test_' + vector['id'].replace('.', '_').replace('-', '_'), native_vector_test(vector))


def money_constructor_test(value, currency, code):
    def test(self):
        self.portable_error(code, lambda: Money(value, currency))
    return test


for label, amount in [('nan', Decimal('NaN')), ('signaling_nan', Decimal('sNaN')), ('infinity', Decimal('Infinity')), ('negative_infinity', Decimal('-Infinity')), ('string', '1.00'), ('float', 1.0), ('integer', 1), ('boolean', True), ('null', None), ('array', []), ('object', {})]:
    setattr(ConstructionEvaluationRegressions, 'test_money_constructor_' + label, money_constructor_test(amount, 'EUR', 'FINKORE_MONEY_INVALID_AMOUNT'))
for label, currency in [('empty', ''), ('lowercase', 'eur'), ('null', None), ('array', []), ('object', {})]:
    setattr(ConstructionEvaluationRegressions, 'test_money_currency_' + label, money_constructor_test(Decimal('1.00'), currency, 'FINKORE_MONEY_INVALID_CURRENCY'))


def workflow_constructor_test(fault):
    def test(self):
        args = dict(states=('DRAFT', 'FINAL'), initial_state='DRAFT', terminal_states=('FINAL',), transitions=(WorkflowTransition('DRAFT', 'FINAL'),), definition_identity='flow', definition_version_identity='v1')
        args.update(fault)
        self.portable_error('FINKORE_WORKFLOW_INVALID_DEFINITION', lambda: WorkflowDefinition(**args))
    return test


for label, fault in [('initial', {'initial_state': 'GHOST'}), ('empty', {'states': ()}), ('duplicate', {'states': ('DRAFT', 'FINAL', 'DRAFT')}), ('terminal', {'terminal_states': ('GHOST',)}), ('outgoing_terminal', {'terminal_states': ('DRAFT',)}), ('endpoint', {'transitions': (WorkflowTransition('DRAFT', 'GHOST'),)}), ('version', {'definition_version_identity': None})]:
    setattr(ConstructionEvaluationRegressions, 'test_workflow_constructor_' + label, workflow_constructor_test(fault))
