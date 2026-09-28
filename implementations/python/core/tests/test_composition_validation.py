# SPDX-License-Identifier: MPL-2.0
"""All composition vectors at the native boundary, with exact values and ownership."""
from copy import deepcopy
import json
from pathlib import Path
import unittest
from finkore import FinKoreError
from finkore.approvals import evaluate_composition

ROOT = Path(__file__).resolve().parents[4]


class CompositionValidation(unittest.TestCase):
    def test_composition_vectors(self):
        manifest = json.loads((ROOT / 'conformance/manifest.json').read_text())
        executed = 0
        for suite in manifest['suites']:
            for file in suite['vectorFiles']:
                for vector in json.loads((ROOT / 'conformance' / file).read_text())['vectors']:
                    if vector['operation'] != 'approval.composition.evaluate':
                        continue
                    executed += 1
                    with self.subTest(vector=vector['id']):
                        i = deepcopy(vector['input'])
                        before = deepcopy(i)
                        try:
                            result = evaluate_composition(i['composition'], i['requirements'], context=i.get('context'), **({'decisions': i['decisions']} if 'decisions' in i else {}))
                            self.assertEqual(vector['expected']['status'], 'success')
                            self.assertEqual(vector['expected']['value'], result)
                        except FinKoreError as error:
                            self.assertEqual(vector['expected']['status'], 'error')
                            self.assertEqual(vector['expected']['error']['code'], error.code)
                        finally:
                            self.assertEqual(before, i)
        self.assertGreater(executed, 0)
