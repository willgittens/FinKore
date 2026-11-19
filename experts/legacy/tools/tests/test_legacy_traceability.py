# SPDX-License-Identifier: MPL-2.0
# Exercises optional comparison tooling and source boundaries, not financial behavior.
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_legacy_traceability as tool


class LegacyTraceabilityTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.repo = Path(temporary.name)
        self.source = "experts/legacy/interviews/001-public.md"
        self.text = ("# Interview\n\n**Interviewee:** Public Speaker\n"
                     "**Status:** Approved by Interviewee on 2026-11-17\n\n"
                     "## The interview\n\n### Public answer\n\nPreserve the original financial value.\n\n"
                     "### Withheld answer\n\n*Editorial omission notice.*\n\n"
                     "## Editorial note\n\nPrivate account is not public evidence.\n")
        self.write(self.source, self.text)
        self.write("learn/public.html", '<h3 id="public-answer">Public answer</h3>')
        self.write("spec/money/representation.md", "Unchanged test contract source.\n")
        target = {"id": "MONEY-REPRESENTATION-002", "layer": "spec", "title": "Exact amount",
                  "path": "spec/money/representation.md", "anchor": None,
                  "statement": "The amount MUST be finite and exactly representable in base 10.",
                  "clause_sha256": "a" * 64, "modalities": ["MUST"],
                  "vector_ids": [], "agentic_operation_ids": [], "coredoc_ids": []}
        self.contract = {"core_version": "Test", "repository_revision": None,
                         "files": {target["path"]: tool.sha((self.repo / target["path"]).read_bytes())},
                         "targets": {target["id"]: target}, "vectors": {}, "operations": {}}
        mapping = {"id": "LGC-0001", "interview_id": "LEGACY-001", "claim": "Preserve financial values",
                   "curation_status": "reviewed", "interpretation": "A bounded analyst interpretation.",
                   "conditions_and_limits": "Personal experience; not a universal proof.",
                   "learn_angle": "Explain preservation.", "reviewed_on": "2026-11-17",
                   "evidence": [{"heading": "Public answer", "exact_quote": "Preserve the original financial value."}],
                   "bindings": [{"target_id": target["id"], "relationship": "already_addressed",
                                 "evidence_role": "illustrates_risk", "explanation": "Only value preservation is compared.",
                                 "reviewed_clause_sha256": target["clause_sha256"]}], "related_research": []}
        interview = {"id": "LEGACY-001", "source": self.source, "reader": "learn/public.html", "name": "Public Speaker",
                     "reviewed_source_sha256": tool.sha(self.text.encode()),
                     "sections": [{"heading": "Public answer", "role": "public_answer", "disposition": "mapped", "reason": "Public statement."},
                                  {"heading": "Withheld answer", "role": "editorial_only", "disposition": "excluded_confidentiality", "reason": "No public answer."}]}
        self.document = {"schema_version": "1.0.0", "curation": {"description": "Test curation", "interviews": [interview], "mappings": [mapping]}, "resolved": None}
        self.save()
        reader = patch.object(tool, "read_contract", side_effect=lambda repo: copy.deepcopy(self.contract))
        reader.start()
        self.addCleanup(reader.stop)

    def write(self, relative, data):
        path = self.repo / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(data, encoding="utf-8")

    def save(self):
        self.write("experts/legacy/traceability.json", json.dumps(self.document))

    def build(self, **kwargs):
        return tool.build(self.repo, **kwargs)

    def test_build_is_idempotent_and_does_not_modify_sources(self):
        protected = {str(p): p.read_bytes() for p in self.repo.rglob("*") if p.is_file() and p.name != "traceability.json"}
        document = self.build()
        after = (self.repo / "experts/legacy/traceability.json").read_bytes()
        self.build(check=True)
        self.assertEqual(after, (self.repo / "experts/legacy/traceability.json").read_bytes())
        for path, data in protected.items():
            self.assertEqual(data, Path(path).read_bytes())
        record = document["resolved"]["records"][0]
        self.assertEqual("pending_validation", record["findings_status"])
        self.assertEqual("not_requested", record["normative_acceptance"])
        self.assertTrue(record["evidence"][0]["verified"])
        self.assertEqual(["LGC-0001"], document["resolved"]["by_target"]["MONEY-REPRESENTATION-002"])

    def test_invalid_quote_blocks_reuse_and_is_not_rendered(self):
        self.document["curation"]["mappings"][0]["evidence"][0]["exact_quote"] = "Invented evidence."
        self.save()
        document = self.build()
        self.assertEqual("needs_recheck", document["resolved"]["records"][0]["status"])
        self.assertFalse(document["resolved"]["records"][0]["editorial_eligible"])
        self.assertNotIn("Invented evidence.", (self.repo / "experts/legacy/traceability.md").read_text())
        with self.assertRaisesRegex(ValueError, "semantic recheck"):
            self.build(check=True)

    def test_editorial_placeholder_is_not_speaker_evidence_even_if_reclassified(self):
        self.document["curation"]["mappings"][0]["evidence"].append({"heading": "Withheld answer", "exact_quote": "Editorial omission notice."})
        self.document["curation"]["interviews"][0]["sections"][1].update(role="public_answer", disposition="mapped")
        self.save()
        document = self.build()
        self.assertFalse(document["resolved"]["records"][0]["evidence"][1]["verified"])

    def test_final_privacy_note_cannot_supply_answer_evidence(self):
        self.document["curation"]["mappings"][0]["evidence"].append({"heading": "Editorial note", "exact_quote": "Private account is not public evidence."})
        self.save()
        document = self.build()
        self.assertEqual("needs_recheck", document["resolved"]["records"][0]["status"])
        self.assertNotIn("Editorial note", tool.sections(self.text))

    def test_fenced_code_and_blockquotes_are_not_speaker_evidence(self):
        text = "## Answers\n### Example\n\n```text\n\nFake quote.\n\n```\n\n> Another fake quote.\n\nActual answer.\n"
        section = tool.sections(text)["Example"]
        self.assertIsNone(tool.speaker_quote(section, "Fake quote."))
        self.assertIsNone(tool.speaker_quote(section, "Another fake quote."))
        self.assertEqual(text.index("Actual answer."), tool.speaker_quote(section, "Actual answer."))

    def test_source_change_does_not_refresh_approval_fingerprint(self):
        self.build()
        self.write(self.source, self.text + "\nAn editorial change.\n")
        document = self.build()
        self.assertEqual(self.document["curation"], document["curation"])
        self.assertEqual("needs_recheck", document["resolved"]["records"][0]["status"])
        self.assertFalse(document["resolved"]["records"][0]["editorial_eligible"])

    def test_unapproved_or_missing_interview_fails_without_output_changes(self):
        original = (self.repo / "experts/legacy/traceability.json").read_bytes()
        self.write(self.source, self.text.replace("Approved by Interviewee on", "Draft since"))
        with self.assertRaisesRegex(ValueError, "not an approved"):
            self.build()
        self.assertEqual(original, (self.repo / "experts/legacy/traceability.json").read_bytes())
        (self.repo / self.source).unlink()
        with self.assertRaises(OSError):
            self.build()

    def test_maintainer_confirmation_preserves_attribution_and_has_no_omission(self):
        approval = "Approved for publication — confirmed by the project maintainer on 17.11.2026"
        self.text = self.text.replace("Approved by Interviewee on 2026-11-17", approval)
        self.text = self.text.replace("### Withheld answer\n\n*Editorial omission notice.*\n\n", "")
        interview = self.document["curation"]["interviews"][0]
        interview["sections"] = interview["sections"][:1]
        interview["reviewed_source_sha256"] = tool.sha(self.text.encode())
        self.write(self.source, self.text)
        self.save()
        document = self.build()
        self.build(check=True)
        self.assertEqual(approval, document["resolved"]["interviews"][0]["publication_approval"])
        report = (self.repo / "experts/legacy/traceability.md").read_text()
        self.assertIn(approval, report)
        self.assertNotIn("Approved by Interviewee", report)
        self.assertNotIn("Confidential omissions are excluded", report)

    def test_pending_or_incomplete_maintainer_confirmation_is_rejected(self):
        original = (self.repo / "experts/legacy/traceability.json").read_bytes()
        for status in ["Draft — pending interviewee approval for publication",
                       "Approved for publication — pending confirmation by the project maintainer on 17.11.2026",
                       "Approved for publication — confirmed by the project maintainer on",
                       "Approved for publication — confirmed by the project maintainer on 17.11.2026 pending review"]:
            with self.subTest(status=status):
                self.write(self.source, self.text.replace("Approved by Interviewee on 2026-11-17", status))
                with self.assertRaisesRegex(ValueError, "not an approved"):
                    self.build()
                self.assertEqual(original, (self.repo / "experts/legacy/traceability.json").read_bytes())

    def test_unregistered_drafts_are_ignored_and_new_sections_are_unreviewed(self):
        self.write("experts/legacy/interviews/999-draft.md", "Draft with private text.")
        self.write(self.source, self.text + "\n### New question\n\nNot reviewed yet.\n")
        document = self.build()
        self.assertEqual(1, document["resolved"]["counts"]["interviews"])
        section = document["resolved"]["interviews"][0]["sections"][-1]
        self.assertEqual("unreviewed", section["role"])
        self.assertEqual("pending_curation", section["disposition"])
        self.assertEqual("needs_recheck", document["resolved"]["records"][0]["status"])

    def test_changed_or_removed_clause_requires_semantic_review(self):
        self.contract["targets"]["MONEY-REPRESENTATION-002"]["clause_sha256"] = "b" * 64
        document = self.build()
        self.assertIn("target_clause_changed:MONEY-REPRESENTATION-002", document["resolved"]["records"][0]["recheck_reasons"])
        self.assertEqual("a" * 64, document["curation"]["mappings"][0]["bindings"][0]["reviewed_clause_sha256"])
        self.contract["targets"] = {}
        document = self.build()
        self.assertIn("target_removed_or_unknown:MONEY-REPRESENTATION-002", document["resolved"]["records"][0]["recheck_reasons"])

    def test_related_research_retains_pending_status_and_detects_changes(self):
        related = {"id": "MAP-0001", "claim": "Limited research"}
        research = {"schema_version": "1.0.0", "curation": {"mappings": [related]},
                    "resolved": {"records": [{"mapping_id": "MAP-0001", "status": "pending_evidence", "source_readiness": "needs_more_evidence"}]}}
        self.write("experts/research/traceability.json", json.dumps(research))
        self.document["curation"]["mappings"][0]["related_research"] = [{"mapping_id": "MAP-0001", "relationship": "complements", "explanation": "Related topic only.", "reviewed_curation_sha256": tool.sha(related)}]
        self.save()
        document = self.build()
        edge = document["resolved"]["records"][0]["related_research"][0]
        self.assertEqual("pending_evidence", edge["recorded_status"])
        self.assertEqual("not_revalidated_here", edge["freshness"])
        research["curation"]["mappings"][0]["claim"] = "Changed research interpretation"
        self.write("experts/research/traceability.json", json.dumps(research))
        self.assertEqual("needs_recheck", self.build()["resolved"]["records"][0]["status"])

    def test_schema_rejects_normative_acceptance_and_duplicate_ids_are_rejected(self):
        document = self.build()
        document["resolved"]["records"][0]["findings_status"] = "accepted"
        with self.assertRaisesRegex(ValueError, "schema validation"):
            tool.validate_schema(document)
        self.document["curation"]["mappings"].append(copy.deepcopy(self.document["curation"]["mappings"][0]))
        self.save()
        with self.assertRaisesRegex(ValueError, "Duplicate Legacy mapping"):
            self.build()

    def test_source_path_escape_is_rejected(self):
        self.document["curation"]["interviews"][0]["source"] = "spec/money/representation.md"
        self.save()
        with self.assertRaisesRegex(ValueError, "escapes"):
            self.build()

    def test_lookup_and_preview_do_not_write(self):
        original = (self.repo / "experts/legacy/traceability.json").read_bytes()
        tool.build(self.repo, preview=True)
        self.assertEqual(original, (self.repo / "experts/legacy/traceability.json").read_bytes())
        self.assertFalse((self.repo / "experts/legacy/traceability.md").exists())

    def test_interrupted_pair_is_detected_and_can_be_rebuilt(self):
        self.build()
        self.write("experts/legacy/traceability.md", "Interrupted before the report was replaced.\n")
        with self.assertRaisesRegex(ValueError, "stale"):
            self.build(check=True)
        self.build()
        self.build(check=True)


if __name__ == "__main__":
    unittest.main()
