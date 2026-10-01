# SPDX-License-Identifier: MPL-2.0
"""ENTITY-VALIDATION-011 native value rejection, exactness, ownership and reuse."""
from copy import deepcopy
from decimal import Decimal, localcontext
from pathlib import Path
from functools import wraps
import json
import unittest
from finkore import FinKoreError, create_entity, import_entity, mutate_entity, transition_entity, evolve_entity


class IntSubclass(int):
    pass


class FloatSubclass(float):
    pass


class DecimalSubclass(Decimal):
    pass


class CopyHook:
    def __deepcopy__(self, memo):
        raise RuntimeError('unsupported object copy hook invoked')


def cycle():
    value = []
    value.append(value)
    return value


def object_cycle():
    value = {}
    value['self'] = value
    return value


def definition():
    return {'type': 'invoice', 'identityScope': 'tenant', 'workflow': {
        'states': ['DRAFT', 'DONE'], 'initialState': 'DRAFT', 'terminalStates': [],
        'transitions': [{'source': 'DRAFT', 'target': 'DONE'}]},
        'mutability': {'DRAFT': ['memo', 'other'], 'DONE': []}}


def observed(data):
    return {'type': 'invoice', 'id': 'i', 'state': 'DRAFT', 'data': data}


def valid_control(method):
    @wraps(method)
    def check(self):
        try:
            return method(self)
        except FinKoreError as failure:
            self.fail(f"Valid data rejected: {failure.code}")
    return check


class EntityNativeValues(unittest.TestCase):
    def test_entity_value097_rejects_unsupported(self):
        values = [IntSubclass(1), FloatSubclass(1), DecimalSubclass('1'), CopyHook(),
                  float('nan'), float('inf'), float('-inf'), Decimal('NaN'), Decimal('Infinity'),
                  {1: 'invalid-key'}, (), set(), object(), cycle(), object_cycle()]
        for index, value in enumerate(values):
            for boundary in ('create', 'import', 'current-mutate', 'current-transition', 'proposed'):
                with self.subTest(index=index, boundary=boundary):
                    data = {'memo': {'nested': [value]}}
                    original = observed({'memo': 1})
                    before = deepcopy(original)
                    calls = {
                        'create': lambda: create_entity(definition(), 'i', data),
                        'import': lambda: import_entity(definition(), {'entity': observed(data)}),
                        'current-mutate': lambda: mutate_entity(definition(), observed(data), {'memo': 1}),
                        'current-transition': lambda: transition_entity(definition(), observed(data), 'DONE'),
                        'proposed': lambda: mutate_entity(definition(), original, data),
                    }
                    with self.assertRaises(FinKoreError) as failure:
                        calls[boundary]()
                    self.assertEqual(failure.exception.code, 'FINKORE_ENTITY_INVALID_MUTATION' if boundary == 'proposed' else 'FINKORE_ENTITY_VALIDATION_FAILED')
                    self.assertIs(data['memo']['nested'][0], value)
                    self.assertEqual(original, before)
                    self.assertEqual(mutate_entity(definition(), original, {'memo': 2}), observed({'memo': 2}))

    @valid_control
    def test_entity_value097_exact_owned_control(self):
        with localcontext() as context:
            context.prec = 2
            numbers = [0, 10**80 + 1, -1, -0.0, 1.25, Decimal('12345678901234567890.12345678900')]
            child = {'numbers': numbers, '__proto__': {'constructor': [None, False, '']}}
            data = {'memo': child, 'other': child}
            before = deepcopy(observed(data))
            result = create_entity(definition(), 'i', data)
            numbers.append(99)
            self.assertEqual(result, before)
            self.assertEqual(result['data']['memo']['numbers'][5].as_tuple(), before['data']['memo']['numbers'][5].as_tuple())
            imported = import_entity(definition(), {'entity': result})['entity']
            result['data']['memo']['numbers'].append(88)
            self.assertEqual(imported, before)
            changes = {'memo': {'value': [Decimal('1.2300')]}}
            changed = mutate_entity(definition(), imported, changes)
            changes['memo']['value'].append(99)
            expected = {**before, 'data': {**before['data'], 'memo': {'value': [Decimal('1.2300')]}}}
            self.assertEqual(changed, expected)
            self.assertEqual(transition_entity(definition(), changed, 'DONE'), {**expected, 'state': 'DONE'})
            self.assertEqual(imported, before)

    @valid_control
    def test_entity_value097_scalar_control(self):
        self.assertEqual(create_entity(definition(), 'i', {'memo': 1}), observed({'memo': 1}))

    def test_entity_value097_priority(self):
        entity = {**observed({'memo': CopyHook()}), 'state': ''}
        with self.assertRaises(FinKoreError) as failure:
            import_entity(definition(), {'entity': entity})
        self.assertEqual(failure.exception.code, 'FINKORE_WORKFLOW_INVALID_INSTANCE')
        entity = {**observed({'memo': 1}), 'state': 'DONE'}
        with self.assertRaises(FinKoreError) as failure:
            mutate_entity(definition(), entity, {'memo': CopyHook()})
        self.assertEqual(failure.exception.code, 'FINKORE_ENTITY_IMMUTABLE')

    def test_entity_value097_evolution(self):
        root = Path(__file__).resolve().parents[4]
        fixtures = json.loads((root / 'conformance/entities/readiness-regressions.json').read_text())['vectors']
        for label, kind in [('correct', 'CORRECTION'), ('reverse', 'REVERSAL'), ('void', 'VOID'), ('supersede', 'SUPERSESSION')]:
            template = next(v for v in fixtures if v['id'] == f'entity.evolution.{label}.evidence-valid-control-001')
            for field in ['source'] + (['successor' if kind == 'SUPERSESSION' else 'related'] if kind != 'VOID' else []):
                with self.subTest(kind=kind, field=field):
                    request = deepcopy(template['input'])
                    request[field]['data']['memo'] = IntSubclass(1)
                    with self.assertRaises(FinKoreError) as failure:
                        evolve_entity(kind, request['definition'], request)
                    self.assertEqual(failure.exception.code, 'FINKORE_ENTITY_VALIDATION_FAILED')
                    self.assertEqual(request['evolutionHistory'], template['input']['evolutionHistory'])
                    self.assertEqual(request['auditHistory'], template['input']['auditHistory'])
            request = deepcopy(template['input'])
            request['source']['data']['memo'] = {'exact': Decimal('123456789.123456789')}
            before = deepcopy(request)
            result = evolve_entity(kind, request['definition'], request)
            self.assertEqual(result['source'], before['source'])
            result['source']['data']['memo']['exact'] = Decimal('0')
            self.assertEqual(request, before)
