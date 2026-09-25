# SPDX-License-Identifier: MPL-2.0
"""Entity evolution regressions against public core APIs, without adapters."""
import json
import unittest
from copy import deepcopy
from pathlib import Path

from finkore import FinKoreError, evolve_entity, import_evolution_history

ROOT = Path(__file__).resolve().parents[4]
VECTORS = [vector for name in ("evolution", "readiness-regressions")
           for vector in json.loads((ROOT / f"conformance/entities/{name}.json").read_text())["vectors"]
           if vector["operation"].startswith("finkore.entity.evolution.")]
KINDS = {"correct": "CORRECTION", "reverse": "REVERSAL", "void": "VOID", "supersede": "SUPERSESSION"}


class EntityEvolutionTests(unittest.TestCase):
    def test_conflicting_required_effects_with_agreeing_assertions(self):
        reference = {"type": "invoice", "id": "invoice-1", "revision": "revision-1"}
        for current in (True, False):
            history = {"relations": [{"kind": "SUPERSESSION", "relationId": "same-key", "source": reference, "related": reference, "sourceCurrent": current, "relatedCurrent": current, "supersessionScope": "current", "auditEventId": "audit-same-key"}]}
            before = deepcopy(history)
            with self.assertRaises(FinKoreError) as error:
                import_evolution_history(history)
            self.assertEqual(error.exception.code, "FINKORE_ENTITY_INVALID_MUTATION")
            self.assertEqual(history, before)
        for kind in ("CORRECTION", "REVERSAL"):
            for current in (False, True):
                history = {"relations": [{"kind": kind, "relationId": "same-key", "source": reference, "related": reference, "sourceCurrent": current, "relatedCurrent": not current, "auditEventId": "audit-same-key"}]}
                with self.assertRaises(FinKoreError) as error:
                    import_evolution_history(history)
                self.assertEqual(error.exception.code, "FINKORE_ENTITY_INVALID_MUTATION")

    def test_vectors_through_native_evolution(self):
        for vector in VECTORS:
            with self.subTest(vector=vector["id"]):
                request = deepcopy(vector["input"])
                request["evolutionHistory"] = {"relations": request.get("evolutionHistory", [])}
                before = deepcopy(request)
                kind = KINDS[vector["operation"].rsplit(".", 1)[1]]
                try:
                    if vector["expected"]["status"] == "error":
                        with self.assertRaises(FinKoreError) as error:
                            evolve_entity(kind, request["definition"], request)
                        self.assertEqual(error.exception.code, vector["expected"]["error"]["code"])
                    else:
                        self.assertEqual(evolve_entity(kind, request["definition"], request), vector["expected"]["value"])
                finally:
                    self.assertEqual(request, before)

    def test_versioned_binding_failures_preserve_complete_request(self):
        for operation, kind in KINDS.items():
            template = next(v["input"] for v in VECTORS if v["id"] == f"entity.evolution.{operation}.versioned-binding-001")
            for key in ("source",) if kind == "VOID" else ("source", "successor" if kind == "SUPERSESSION" else "related"):
                for fault in ("missing", "null", "malformed", "mismatch"):
                    with self.subTest(kind=kind, key=key, fault=fault):
                        request = deepcopy(template)
                        request["evolutionHistory"] = {"relations": request["evolutionHistory"]}
                        if fault == "missing":
                            del request[key]["binding"]
                        else:
                            request[key]["binding"] = None if fault == "null" else {} if fault == "malformed" else {"definitionIdentity": "invoice-workflow", "definitionVersionIdentity": "2"}
                        before = deepcopy(request)
                        with self.assertRaises(FinKoreError) as error:
                            evolve_entity(kind, request["definition"], request)
                        self.assertEqual(error.exception.code, "FINKORE_WORKFLOW_VERSION_MISMATCH" if fault == "mismatch" else "FINKORE_WORKFLOW_INVALID_INSTANCE")
                        self.assertEqual(request, before)

    def test_cross_field_validation_of_complete_observations(self):
        for operation, kind in KINDS.items():
            template = next(v["input"] for v in VECTORS if v["id"] == f"entity.evolution.{operation}.evidence-valid-control-001")
            for key in ("source",) if kind == "VOID" else ("source", "successor" if kind == "SUPERSESSION" else "related"):
                for valid in (False, True):
                    with self.subTest(kind=kind, key=key, valid=valid):
                        request = deepcopy(template)
                        request["definition"]["validation"] = [{"id": "WITHIN_LIMIT", "path": "amount", "otherPath": "limit", "rule": "money-not-greater-than"}]
                        for name in ("source", "related", "successor"):
                            if name in request:
                                request[name]["data"]["limit"] = deepcopy(request[name]["data"]["amount"])
                        request[key]["data"]["amount"] = {"amount": "20.00", "currency": "EUR"}
                        request[key]["data"]["limit"] = {"amount": "20.0" if valid else "19.99", "currency": "EUR"}
                        before = deepcopy(request)
                        if valid:
                            self.assertEqual(evolve_entity(kind, request["definition"], request)["source"], request["source"])
                        else:
                            with self.assertRaises(FinKoreError) as error:
                                evolve_entity(kind, request["definition"], request)
                            self.assertEqual(error.exception.code, "FINKORE_ENTITY_VALIDATION_FAILED")
                        self.assertEqual(request, before)

    def test_import_validates_and_owns_history(self):
        self.assertEqual(import_evolution_history(), {"relations": []})
        for name in ("valid-void-sequence", "valid-supersession-sequence", "contradiction", "same-step-contradiction", "void-effect-invalid"):
            history = {"relations": deepcopy(next(v["input"]["evolutionHistory"] for v in VECTORS if v["id"] == f"entity.evolution.history.{name}-001"))}
            before = deepcopy(history)
            if name.startswith("valid-"):
                result = import_evolution_history(history)
                self.assertEqual(result, before)
                result["relations"][0]["source"]["id"] = "changed"
            else:
                with self.assertRaises(FinKoreError) as error:
                    import_evolution_history(history)
                self.assertEqual(error.exception.code, "FINKORE_ENTITY_INVALID_MUTATION")
            self.assertEqual(history, before)

    def test_explicit_successor_effect_and_distinct_opaque_keys(self):
        def reference(identifier):
            return {"type": "invoice", "id": identifier, "revision": "revision"}

        history = {"relations": [
            {"kind": "SUPERSESSION", "relationId": f"{source}-{related}", "source": reference(source), "related": reference(related),
             "sourceCurrent": False, "relatedCurrent": True, "supersessionScope": "current", "auditEventId": f"audit-{source}-{related}"}
            for source, related in (("a", "b"), ("b", "c"), ("c", "b"))]}
        self.assertEqual(import_evolution_history(history), history)

        first = {"type": "invoice", "id": "id\x00part", "revision": "r"}
        second = {"type": "invoice\x00id", "id": "part", "revision": "r"}
        history = {"relations": [
            {"kind": "VOID", "relationId": "void", "source": first, "sourceCurrent": False, "auditEventId": "audit-void"},
            {"kind": "CORRECTION", "relationId": "correction", "source": second, "related": second, "sourceCurrent": True, "relatedCurrent": True, "auditEventId": "audit-correction"}]}
        self.assertEqual(import_evolution_history(history), history)

    def test_history_import_rejects_malformed_evidence_atomically(self):
        valid = {"kind": "VOID", "relationId": "void", "source": {"type": "invoice", "id": "invoice-1", "revision": "r1"}, "sourceCurrent": False, "auditEventId": "audit-void"}
        cases = [(None, "MUTATION"), ({**valid, "kind": "UNKNOWN"}, "MUTATION"),
                 ({**valid, "source": None}, "IDENTITY"), ({**valid, "relationId": ""}, "IDENTITY"),
                 ({**valid, "auditEventId": ""}, "IDENTITY"), ({**valid, "sourceCurrent": "false"}, "MUTATION"),
                 ({**valid, "supersessionScope": "scope"}, "MUTATION"), ({**valid, "relatedCurrent": True}, "MUTATION"),
                 ({**valid, "related": valid["source"]}, "MUTATION")]
        for relation, code in cases:
            with self.subTest(relation=relation):
                history = {"relations": [relation]}
                before = deepcopy(history)
                with self.assertRaises(FinKoreError) as error:
                    import_evolution_history(history)
                self.assertEqual(error.exception.code, f"FINKORE_ENTITY_INVALID_{code}")
                self.assertEqual(history, before)
        with self.assertRaises(FinKoreError) as error:
            import_evolution_history({"relations": [valid, deepcopy(valid)]})
        self.assertEqual(error.exception.code, "FINKORE_ENTITY_INVALID_MUTATION")
        for history in ("history", {"relations": "history"}, [valid]):
            with self.assertRaises(FinKoreError) as error:
                import_evolution_history(history)
            self.assertEqual(error.exception.code, "FINKORE_ENTITY_INVALID_MUTATION")
