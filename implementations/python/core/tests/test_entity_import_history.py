# SPDX-License-Identifier: MPL-2.0
"""ENTITY-IMPORT-012 output shape, preservation, reuse and failure observations."""
from copy import deepcopy
from pathlib import Path
import json
import unittest
from finkore import FinKoreError, import_entity

VECTORS = json.loads((Path(__file__).resolve().parents[4] / 'conformance/entities/import-history.json').read_text())['vectors']


class EntityImportHistoryTests(unittest.TestCase):
    def check_success(self, vector):
        request = deepcopy(vector['input'])
        before = deepcopy(request)
        try:
            result = import_entity(request['definition'], request['import'])
            self.assertEqual(result, vector['expected']['value'])
            self.assertEqual(import_entity(request['definition'], result), result)
            self.assertEqual(request, before)
            result['historicalRevisions'].append({'revision': 'caller-write'})
            self.assertEqual(request, before)
            self.assertEqual(import_entity(request['definition'], request['import']), vector['expected']['value'])
        except FinKoreError as error:
            self.fail('Valid import rejected: ' + error.code)

    def test_empty_history_contract(self):
        for vector in VECTORS:
            if vector['expected']['status'] == 'success' and vector['expected']['value']['historicalRevisions'] == []:
                with self.subTest(vector=vector['id']):
                    self.check_success(vector)

    def test_nonempty_history_control(self):
        self.check_success(next(v for v in VECTORS if v['id'].endswith('.nonempty')))

    def test_failure_preserves_input_presence(self):
        for vector in VECTORS:
            if vector['expected']['status'] != 'error':
                continue
            request = deepcopy(vector['input'])
            before = deepcopy(request)
            with self.subTest(vector=vector['id']):
                with self.assertRaises(FinKoreError) as raised:
                    import_entity(request['definition'], request['import'])
                self.assertEqual(raised.exception.code, vector['expected']['error']['code'])
                self.assertEqual(request, before)
