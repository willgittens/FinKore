# SPDX-License-Identifier: MPL-2.0
# Tests research artifact indexing and stale-link detection; defines no financial behavior.
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parents[1]))
import build_traceability as tool


class TraceabilityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.research = self.repo / "research"
        self.research.mkdir()
        self.write("docs/coreDoc/core-doc.md", "# CoreDoc\n\n**CoreDoc version:** FinKore Core test\n\n### CORE-001.2 — Explicit policy\n\n**Rule**\n\nPrecision reduction SHALL use declared policy.\n\n**Boundaries**\n\nNo storage mandate.\n\n**Relevant FinKore domains**\n\nMONEY-ROUNDING-001 to -002.\n")
        self.write("spec/money/rounding.md", "# Rounding\n\n- **MONEY-ROUNDING-001** — Rounding MUST specify a scale.\n- **MONEY-ROUNDING-002** — Diagnostic detail SHOULD be safe.\n")
        self.write("conformance/manifest.json", {"suites": [{"id": "money", "vectorFiles": ["./money/cases.json"]}]})
        self.write("conformance/money/cases.json", {"vectors": [{"id": "case.one", "operation": "finkore.money.round", "requirements": ["MONEY-ROUNDING-001"]}, {"id": "case.local", "operation": "approval.condition.evaluate", "requirements": ["MONEY-ROUNDING-002"]}]})
        self.write("conformance/traceability.md", "| MONEY-ROUNDING-001 | Money | MUST / MUST NOT | COVERED | case.one |\n| MONEY-ROUNDING-002 | Money | SHOULD / SHOULD NOT | PARTIAL | Details remain conditional. |\n")
        self.write("agentic/operations.md", "| `finkore.money.round` | Money | `no` | `no` | `yes` | `none` | none | `MONEY-ROUNDING-001`–`-002` |\n")
        self.write("agentic/safety.md", "# Safety\n")
        self.write("agentic/effects.md", "# Effects\n")
        self.write("learn/index.html", "<p>Unchanged educational content.</p>")
        review = {"id": "REV-0001", "is_current": True, "notes": "### REV-0001 — Explicit context\n\n**FinKore comparison.** `already_addressed`: MONEY-ROUNDING-001.\n\n**Conditions, risk and counterpoints.** A bounded comparison.\n\n**Learn reuse:** `evidence_ready`. Explain context.\n", "assessment": "supported_with_limits", "progress": "reviewed", "readiness": "evidence_ready", "input_compatibility": "current", "evidence_ids": ["EVD-0001"], "origins": ["session/FND-0001"], "work_ids": ["work:example"]}
        evidence = {"id": "EVD-0001", "notes": "Fixture source context.", "exact_quote": "Fixture quotation.", "origins": ["session/FND-0001"], "work_ids": ["work:example"], "input_compatibility": "current"}
        self.catalog = {"reviews": {review["id"]: review}, "evidence": {evidence["id"]: evidence}, "findings": {}, "source_hashes": {}}
        contract = tool.read_contract(self.repo)
        target = contract["targets"]["MONEY-ROUNDING-001"]
        item = tool.pending_mapping(review)
        item.update(curation_status="reviewed", interpretation="reviewer_inference", contract_scope=["already_addressed"], reviewed_on="2026-11-17", checked_source={"review_sha256": tool.review_hash(review), "evidence_sha256": {evidence["id"]: tool.evidence_hash(evidence)}})
        item["bindings"] = [{"target_id": target["id"], "relationship": "already_addressed", "evidence_role": "supports_rationale", "explanation": "The source motivates the bounded context requirement.", "reviewed_clause": {"sha256": target["clause_sha256"], "statement": target["statement"], "path": target["path"]}}]
        self.document = {"schema_version": tool.VERSION, "curation": {"description": "Fixture comparisons.", "mappings": [item], "related_findings": []}}
        self.write("research/traceability.json", self.document)

    def write(self, relative, data):
        path = self.repo / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(tool.encoded(data) if isinstance(data, (dict, list)) else data.encode())

    def build(self, check=False):
        with patch.object(tool, "current_catalog", return_value=copy.deepcopy(self.catalog)):
            return tool.build(self.repo, check=check)

    def resolved(self, document=None):
        return tool.resolve(copy.deepcopy(document or self.document), tool.read_contract(self.repo), copy.deepcopy(self.catalog))

    def test_explicit_ranges_preserve_prefix_and_reject_invalid_ranges(self):
        self.assertEqual(["MONEY-ROUNDING-001", "MONEY-ROUNDING-002", "MONEY-ROUNDING-003"], tool.references("`MONEY-ROUNDING-001`–`-003`"))
        self.assertEqual(["CORE-001.1", "CORE-001.2"], tool.references("CORE-001.1/001.2"))
        with self.assertRaises(ValueError):
            tool.references("MONEY-ROUNDING-003 to -001")
        with self.assertRaises(ValueError):
            tool.references("MONEY-ROUNDING-001 to AUDIT-EVENT-002")
        with self.assertRaises(ValueError):
            tool.references("MONEY-ROUNDING-999", {"MONEY-ROUNDING-001"})

    def test_modality_foundation_links_and_partial_scope_are_preserved(self):
        c = tool.read_contract(self.repo)
        self.assertEqual(["SHOULD"], c["targets"]["MONEY-ROUNDING-002"]["modalities"])
        self.assertEqual("PARTIAL", c["targets"]["MONEY-ROUNDING-002"]["coverage"]["classification"])
        self.assertEqual(["MONEY-ROUNDING-001", "MONEY-ROUNDING-002"], c["targets"]["CORE-001.2"]["explicit_spec_references"])
        self.assertEqual(["CORE-001.2"], c["targets"]["MONEY-ROUNDING-001"]["coredoc_ids"])

    def test_vectors_use_manifest_only_and_local_labels_are_not_promoted(self):
        self.write("conformance/money/undeclared.json", {"vectors": [{"id": "should.not.appear"}]})
        c = tool.read_contract(self.repo)
        self.assertNotIn("should.not.appear", c["vectors"])
        self.assertNotIn("approval.condition.evaluate", c["operations"])
        self.assertEqual(["finkore.money.round"], c["targets"]["MONEY-ROUNDING-002"]["agentic_operation_ids"])
        self.assertEqual(["case.local"], c["targets"]["MONEY-ROUNDING-002"]["vector_ids"])

    def test_unknown_or_duplicate_vector_references_fail(self):
        self.write("conformance/money/cases.json", {"vectors": [{"id": "bad", "operation": "local.operation", "requirements": ["MONEY-ROUNDING-999"]}]})
        with self.assertRaises(ValueError):
            tool.read_contract(self.repo)

    def test_target_change_requires_recheck_without_reapproving_fingerprint(self):
        before = copy.deepcopy(self.document["curation"])
        self.write("spec/money/rounding.md", "- **MONEY-ROUNDING-001** — Rounding MUST specify a scale and mode.\n- **MONEY-ROUNDING-002** — Details SHOULD be safe.\n")
        d = self.build()
        self.assertEqual(before, d["curation"])
        self.assertEqual("needs_recheck", d["resolved"]["records"][0]["status"])
        self.assertFalse(d["resolved"]["records"][0]["learn_eligible"])
        with self.assertRaises(ValueError):
            self.build(check=True)

    def test_changed_source_quote_readiness_and_missing_evidence_block_reuse(self):
        self.catalog["evidence"]["EVD-0001"]["exact_quote"] = "Different text."
        self.catalog["reviews"]["REV-0001"]["readiness"] = "needs_more_evidence"
        d = self.resolved()
        reasons = d["records"][0]["recheck_reasons"]
        self.assertIn("source_no_longer_evidence_ready", reasons)
        self.assertIn("evidence_changed:EVD-0001", reasons)
        self.assertFalse(d["records"][0]["learn_eligible"])
        self.catalog["evidence"].clear()
        self.assertIn("missing_evidence:EVD-0001", self.resolved()["records"][0]["recheck_reasons"])

    def test_new_review_is_pending_despite_matching_words_and_requirement_ids(self):
        r = copy.deepcopy(self.catalog["reviews"]["REV-0001"])
        r["id"] = "REV-0002"
        self.catalog["reviews"][r["id"]] = r
        d = self.resolved()
        pending = next(r for r in d["records"] if r["review_id"] == "REV-0002")
        self.assertEqual("pending_curation", pending["status"])
        self.assertFalse(pending["learn_eligible"])
        self.assertEqual(["MAP-0001"], d["by_target"]["MONEY-ROUNDING-001"])
        self.assertEqual(["MONEY-ROUNDING-001"], pending["unreviewed_reference_candidates"])

    def test_negative_and_limited_records_remain_visible(self):
        document = copy.deepcopy(self.document)
        m = document["curation"]["mappings"][0]
        m.update(curation_status="not_recommended", checked_source=None, bindings=[], reviewed_on=None)
        d = self.resolved(document)
        self.assertEqual("not_recommended", d["records"][0]["status"])
        self.assertFalse(d["records"][0]["learn_eligible"])

    def test_unknown_target_is_visible_and_blocks_check(self):
        document = copy.deepcopy(self.document)
        document["curation"]["mappings"][0]["bindings"][0]["target_id"] = "MONEY-ROUNDING-999"
        d = self.resolved(document)
        self.assertIn("target_removed_or_unknown:MONEY-ROUNDING-999", d["records"][0]["recheck_reasons"])

    def test_unrelated_evidence_or_unknown_peer_cannot_be_attached(self):
        document = copy.deepcopy(self.document)
        document["curation"]["mappings"][0]["evidence_ids"] = ["EVD-9999"]
        with self.assertRaises(ValueError):
            self.resolved(document)
        document = copy.deepcopy(self.document)
        document["curation"]["related_findings"] = [{"from": "MAP-0001", "to": "MAP-9999", "relationship": "complements", "explanation": "Context."}]
        with self.assertRaises(ValueError):
            self.resolved(document)

    def test_writes_only_research_and_check_is_read_only(self):
        before = {p.relative_to(self.repo): p.read_bytes() for p in self.repo.rglob("*") if p.is_file() and not p.is_relative_to(self.research)}
        self.build()
        research_before = {p.relative_to(self.repo): p.read_bytes() for p in self.research.rglob("*") if p.is_file()}
        self.build(check=True)
        after = {p.relative_to(self.repo): p.read_bytes() for p in self.repo.rglob("*") if p.is_file() and not p.is_relative_to(self.research)}
        self.assertEqual(before, after)
        self.assertEqual(research_before, {p.relative_to(self.repo): p.read_bytes() for p in self.research.rglob("*") if p.is_file()})

    def test_stale_target_can_be_inspected_without_writing_or_approval(self):
        self.build()
        self.write("spec/money/rounding.md", "- **MONEY-ROUNDING-001** — Rounding MUST use explicit scale and mode.\n- **MONEY-ROUNDING-002** — Detail SHOULD be safe.\n")
        before = {p.relative_to(self.research): p.read_bytes() for p in self.research.rglob("*") if p.is_file()}
        with patch.object(tool, "current_catalog", return_value=copy.deepcopy(self.catalog)):
            preview = tool.build(self.repo, preview=True)
        self.assertEqual("needs_recheck", preview["resolved"]["records"][0]["status"])
        self.assertEqual(before, {p.relative_to(self.research): p.read_bytes() for p in self.research.rglob("*") if p.is_file()})

    def test_blank_evidence_quote_does_not_become_learn_eligible(self):
        self.catalog["evidence"]["EVD-0001"]["exact_quote"] = None
        record = self.resolved()["records"][0]
        self.assertFalse(record["learn_eligible"])
        self.assertIn("missing_verified_quotation:EVD-0001", record["recheck_reasons"])


if __name__ == "__main__":
    unittest.main()
