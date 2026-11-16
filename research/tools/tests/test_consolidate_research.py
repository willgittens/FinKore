# SPDX-License-Identifier: MPL-2.0
# Tests offline research memory with synthetic inputs; defines no financial behavior.
import gzip
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("consolidation", Path(__file__).parents[1] / "consolidate_research.py")
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class ResearchMemoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)

    def session(self, name="first", sid="s1", pubs=None, extent="partial_text", notebook=True):
        path = self.root / "manifests" / name
        path.mkdir(parents=True, exist_ok=True)
        pubs = pubs if pubs is not None else [{"id": "doi:10.1234/a", "doi": "10.1234/a", "title": "First study", "authors": None}]
        (path / "manifest.json").write_bytes(mod.encoded({"schema_version": mod.MANIFEST_VERSION, "session_id": sid, "topic": name, "publications": pubs}))
        if notebook:
            text = "# Notebook\n\n"
            for index, pub in enumerate(pubs, 1):
                text += f"### PUB-{index:02d} — title\n\n- **ID:** `{pub['id']}`.\n- **Leitura:** `{extent}`; context.\n- **Limites:** not a proof.\n\n"
            if pubs:
                text += "## FND-0001 — conditional claim\n\n- **Status:** `pending_validation`.\n- PUB-01 supports this hypothesis.\n"
            (path / "findings.md").write_text(text)
        return path

    def run_catalog(self):
        return mod.synchronize(self.root)

    def test_new_session_reuses_identifier_without_erasing_reading_limits(self):
        self.session()
        first = self.run_catalog()
        wid = first["allSeen.json"]["works"][0]["work_id"]
        self.session("second", "s2", [{"id": "doi:10.1234/A", "doi": "https://doi.org/10.1234/a", "title": "Changed title", "authors": [{"name": "Named Author"}]}], extent="abstract_only")
        views = self.run_catalog()
        pub = views["allPublications.json"]["publications"][0]
        self.assertEqual(1, views["allPublications.json"]["total"])
        self.assertEqual(wid, pub["work_id"])
        self.assertEqual(2, len(pub["reading_history"]))
        self.assertIn("title", pub["metadata_conflicts"])
        self.assertTrue(views["allSeen.json"]["works"][0]["repeat_policy"]["needs_follow_up"])
        self.assertFalse(pub["status"]["full_text_reviewed"])
        self.assertEqual(2, len(views["allFindings.json"]["findings"]))  # Session-local FND IDs are independent.

    def test_idempotent_update_and_read_only_check(self):
        self.session()
        self.run_catalog()
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.run_catalog()
        mod.synchronize(self.root, check=True)
        after = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(before, after)

    def test_changed_and_deleted_inputs_keep_exact_prior_bytes_and_activity(self):
        path = self.session()
        original = (path / "manifest.json").read_bytes()
        self.run_catalog()
        self.session(pubs=[{"id": "doi:10.1234/a", "title": "Revised metadata", "future_field": {"important": True}}], extent="inaccessible")
        views = self.run_catalog()
        self.assertEqual(2, len(views["allSessions.json"]["sessions"][0]["revisions"]))
        work = views["allSeen.json"]["works"][0]
        self.assertEqual("partial_text", work["status"]["best_reported_reading_extent"])
        self.assertEqual({"partial_text", "inaccessible"}, {r["reading_extent"] for r in work["reading_history"]})
        archive = self.root / "catalog/snapshots" / (mod.digest(original) + ".gz")
        self.assertEqual(original, gzip.decompress(archive.read_bytes()))
        (path / "manifest.json").unlink()
        views = self.run_catalog()
        self.assertEqual("unified", views["allSessions.json"]["sessions"][0]["storage_mode"])
        self.assertEqual(1, views["allSeen.json"]["total"])
        self.assertTrue(any(o["is_current"] for o in views["allPublications.json"]["publications"][0]["occurrences"]))

    def test_discovery_and_download_are_not_reading(self):
        path = self.session(notebook=False)
        directory = self.root / "documents/first"
        directory.mkdir(parents=True)
        (directory / "downloads.json").write_bytes(mod.encoded({"manifest_session_id": "s1", "publications": [{"id": "doi:10.1234/a", "status": "downloaded", "file": "paper.pdf"}]}))
        views = self.run_catalog()
        self.assertEqual(0, views["allSeen.json"]["total"])
        self.assertEqual(1, len(views["allPublications.json"]["publications"][0]["download_history"]))
        self.assertFalse(views["allPublications.json"]["publications"][0]["status"]["source_text_read"])

    def test_blocked_and_unknown_are_never_reported_as_text_read(self):
        self.session(extent="inaccessible")
        work = self.run_catalog()["allSeen.json"]["works"][0]
        self.assertFalse(work["status"]["source_text_read"])
        self.assertTrue(work["repeat_policy"]["eligible_for_deeper_reading"])
        self.session(extent="future_unrecognized_state")
        views = self.run_catalog()
        self.assertTrue(views["allSessions.json"]["warnings"])
        self.assertFalse(views["allSeen.json"]["works"][0]["status"]["source_text_read"])

    def test_equal_titles_and_distinct_dois_stay_separate(self):
        pubs = [{"id": "doi:10.1234/a", "doi": "10.1234/a", "title": "Same title", "identifiers": {"openalex": "W123"}},
                {"id": "doi:10.1234/b", "doi": "10.1234/b", "title": "Same title", "identifiers": {"openalex": "https://openalex.org/W123"}}]
        self.session(pubs=pubs)
        views = self.run_catalog()
        self.assertEqual(2, views["allPublications.json"]["total"])
        self.assertTrue(all(p["identity_conflicts"] for p in views["allPublications.json"]["publications"]))
        self.assertTrue(all(not p["repeat_policy"]["skip_initial_triage_for_same_intent"] for p in views["allSeen.json"]["works"]))
        self.run_catalog()
        mod.synchronize(self.root, check=True)

    def test_later_explicit_alias_bridge_keeps_stable_redirect(self):
        self.session(pubs=[{"id": "doi:10.1234/a"}, {"id": "openalex:W123"}])
        before = self.run_catalog()
        old = {p["work_id"] for p in before["allPublications.json"]["publications"]}
        self.session("second", "s2", [{"id": "doi:10.1234/a", "identifiers": {"openalex": "W123"}}])
        views = self.run_catalog()
        self.assertEqual(1, views["allPublications.json"]["total"])
        survivor = views["allPublications.json"]["publications"][0]["work_id"]
        self.assertIn(survivor, old)
        self.assertEqual({(old - {survivor}).pop(): survivor}, views["allPublications.json"]["redirects"])
        self.assertEqual(3, len(views["allPublications.json"]["publications"][0]["occurrences"]))
        mod.synchronize(self.root, check=True)

    def test_interrupted_view_publication_is_repaired_from_authoritative_state(self):
        self.session()
        real = mod.atomic_write
        def interrupt(path, data):
            if path.name == "allSeen.json":
                raise OSError("simulated interruption")
            return real(path, data)
        with patch.object(mod, "atomic_write", side_effect=interrupt):
            with self.assertRaises(OSError):
                self.run_catalog()
        self.assertTrue((self.root / "catalog/state.json").exists())
        with self.assertRaises(ValueError):
            mod.synchronize(self.root, check=True)
        self.run_catalog()
        mod.synchronize(self.root, check=True)

    def test_invalid_input_does_not_replace_existing_state(self):
        path = self.session()
        self.run_catalog()
        before = (self.root / "catalog/state.json").read_bytes()
        (path / "manifest.json").write_text('{"schema_version":')
        with self.assertRaises(ValueError):
            self.run_catalog()
        self.assertEqual(before, (self.root / "catalog/state.json").read_bytes())

    def test_snapshot_corruption_detected_even_if_live_input_exists(self):
        self.session()
        self.run_catalog()
        snapshot = next((self.root / "catalog/snapshots").glob("*.gz"))
        snapshot.write_bytes(gzip.compress(b"corrupt"))
        with self.assertRaises(ValueError):
            mod.synchronize(self.root, check=True)
        with self.assertRaises(ValueError):
            self.run_catalog()

    def test_reviewer_updates_preserve_original_quote_and_previous_disposition(self):
        sid = "60ae7dd3-c56f-4aa7-a6ac-23796248a017"
        self.session(sid=sid)
        path = self.root / "allFindings.md"
        review = f"### REV-0001 — Consideration\n\n- **Origin:** `{sid}/FND-0001`\n- **Evidence assessment:** `supported_with_limits`. **Progress:** `limited`.\n- **Evidence for reuse:** [EVD-0001](#evd-0001)\n\n**Learn reuse:** `needs_more_evidence`.\n\n### EVD-0001 — Source\n\n- **Origins:** `{sid}/FND-0001`\n\n> Exact source wording.\n"
        path.write_text(review)
        self.run_catalog()
        path.write_text(review.replace("needs_more_evidence", "not_recommended"))
        views = self.run_catalog()
        self.assertEqual(2, len(views["allFindings.json"]["reviews"]))
        self.assertEqual({"needs_more_evidence", "not_recommended"}, {r["readiness"] for r in views["allFindings.json"]["reviews"]})
        self.assertEqual("Exact source wording.", views["allFindings.json"]["evidence"][0]["exact_quote"])
        self.assertEqual(1, views["allFindings.json"]["counts"]["current_reviews"])

    def test_concurrent_optional_notebook_creation_rejects_mixed_capture(self):
        path = self.session(notebook=False)
        self.run_catalog()
        before = (self.root / "catalog/state.json").read_bytes()
        real = mod.build_views
        def changed(*args):
            views = real(*args)
            (path / "findings.md").write_text("# A concurrent new notebook\n")
            return views
        with patch.object(mod, "build_views", side_effect=changed):
            with self.assertRaises(ValueError):
                self.run_catalog()
        self.assertEqual(before, (self.root / "catalog/state.json").read_bytes())

    def test_detached_known_downloader_and_missing_notebook_do_not_erase_history(self):
        path = self.session()
        directory = self.root / "documents/first"
        directory.mkdir(parents=True)
        report = directory / "downloads.json"
        report.write_bytes(mod.encoded({"manifest_session_id": "s1", "publications": [{"id": "doi:10.1234/a", "status": "failed"}]}))
        self.run_catalog()
        (path / "findings.md").unlink()
        views = self.run_catalog()
        self.assertEqual(1, views["allSeen.json"]["total"])
        self.assertTrue(views["allSeen.json"]["works"][0]["reading_history"][0]["is_current"])
        (path / "manifest.json").unlink()
        report.write_bytes(mod.encoded({"manifest_session_id": "s1", "publications": [{"id": "doi:10.1234/a", "status": "skipped"}]}))
        views = self.run_catalog()
        work = views["allPublications.json"]["publications"][0]
        self.assertEqual({"failed", "skipped"}, {d["record"]["status"] for d in work["download_history"]})
        mod.synchronize(self.root, check=True)

    def test_duplicate_session_ids_and_unresolved_notebook_ids_fail_closed(self):
        self.session()
        self.run_catalog()
        state = (self.root / "catalog/state.json").read_bytes()
        duplicate = self.session("duplicate", "s1")
        with self.assertRaises(ValueError):
            self.run_catalog()
        self.assertEqual(state, (self.root / "catalog/state.json").read_bytes())
        (duplicate / "manifest.json").unlink()
        notebook = self.root / "manifests/first/findings.md"
        notebook.write_text(notebook.read_text().replace("doi:10.1234/a", "doi:10.1234/missing"))
        with self.assertRaises(ValueError):
            self.run_catalog()
        self.assertEqual(state, (self.root / "catalog/state.json").read_bytes())

    def test_old_review_is_not_attached_to_new_source_for_same_finding(self):
        sid = "60ae7dd3-c56f-4aa7-a6ac-23796248a017"
        path = self.session(sid=sid)
        manifest_hash = mod.digest((path / "manifest.json").read_bytes())
        notebook_hash = mod.digest((path / "findings.md").read_bytes())
        report = f"### Session `{sid}`\n\n- Input markers: `manifest.json`: `{manifest_hash}`; `findings.md`: `{notebook_hash}`.\n\n## Reviews\n\n### REV-0001 — Original claim\n\n- **Origin:** `{sid}/FND-0001`\n- **Evidence assessment:** `supported`. **Progress:** `reviewed`.\n\n**Learn reuse:** `evidence_ready`.\n"
        (self.root / "allFindings.md").write_text(report)
        before = self.run_catalog()
        review = before["allFindings.json"]["reviews"][0]
        original_ids = review["work_ids"]
        self.assertEqual("current", review["input_compatibility"])
        self.session(sid=sid, pubs=[{"id": "doi:10.1234/new", "title": "Different source"}])
        views = self.run_catalog()
        review = views["allFindings.json"]["reviews"][0]
        self.assertEqual("changed", review["input_compatibility"])
        self.assertEqual(original_ids, review["work_ids"])
        new_work = next(w for w in views["allPublications.json"]["publications"] if "doi:10.1234/new" in w["identifiers"])
        self.assertFalse(new_work["status"]["review_recorded"])

    def test_original_folders_can_be_removed_without_staleness_or_invalidating_review(self):
        sid = "60ae7dd3-c56f-4aa7-a6ac-23796248a017"
        path = self.session(sid=sid)
        manifest_hash = mod.digest((path / "manifest.json").read_bytes())
        notebook_hash = mod.digest((path / "findings.md").read_bytes())
        (self.root / "allFindings.md").write_text(f"### Session `{sid}`\n\n- Inputs: `manifest.json`: `{manifest_hash}`; `findings.md`: `{notebook_hash}`.\n\n## Reviews\n\n### REV-0001 — Claim\n\n- **Origin:** `{sid}/FND-0001`\n- **Evidence assessment:** `supported`. **Progress:** `reviewed`.\n\n**Learn reuse:** `evidence_ready`.\n")
        self.run_catalog()
        before = {p.relative_to(self.root): p.read_bytes() for p in (self.root / "catalog").rglob("*") if p.is_file()}
        shutil.rmtree(self.root / "manifests")
        mod.synchronize(self.root, check=True)
        views = self.run_catalog()
        self.assertEqual("current", views["allFindings.json"]["reviews"][0]["input_compatibility"])
        after = {p.relative_to(self.root): p.read_bytes() for p in (self.root / "catalog").rglob("*") if p.is_file()}
        self.assertEqual(before, after)
        self.session("later", "s2", [{"id": "doi:10.1234/new", "title": "Later research"}])
        views = self.run_catalog()
        self.assertEqual(2, views["allSessions.json"]["total"])
        self.assertEqual(2, views["allPublications.json"]["total"])

    def test_v1_state_migrates_without_originals_and_keeps_ids_and_revisions(self):
        self.session()
        before = self.run_catalog()
        path = self.root / "catalog/state.json"
        legacy = json.loads(path.read_bytes())
        legacy["schema_version"] = "1.0.0"
        for session in legacy["sessions"].values():
            session.pop("storage_mode")
            session["present"] = False
        path.write_bytes(mod.encoded(legacy))
        shutil.rmtree(self.root / "manifests")
        with self.assertRaises(ValueError):
            mod.synchronize(self.root, check=True)
        self.assertEqual("1.0.0", json.loads(path.read_bytes())["schema_version"])
        after = self.run_catalog()
        state = json.loads(path.read_bytes())
        self.assertEqual("1.1.0", state["schema_version"])
        self.assertFalse(state["sessions"]["s1"]["legacy_source_present"])
        self.assertEqual(before["allSeen.json"]["works"][0]["work_id"], after["allSeen.json"]["works"][0]["work_id"])
        self.assertEqual(legacy["sessions"]["s1"]["revisions"], state["sessions"]["s1"]["revisions"])
        mod.synchronize(self.root, check=True)

    def test_unify_links_preserves_report_quotes_and_historical_bytes(self):
        self.session()
        original = "# Report\n\n## Scope and coverage\n\n[manifest](manifests/first/manifest.json) and [notebook](manifests/first/findings.md).\n\n> Exact source text remains unchanged.\n"
        report = self.root / "allFindings.md"
        report.write_text(original)
        self.run_catalog()
        state = mod.load_state(self.root)
        refs = state["sessions"]["s1"]["revisions"][0]["inputs"]
        shutil.rmtree(self.root / "manifests")
        mod.synchronize(self.root, unify_links=True)
        updated = report.read_text()
        self.assertNotIn("](manifests/", updated)
        self.assertIn(refs["manifest.json"]["snapshot"], updated)
        self.assertIn(refs["findings.md"]["snapshot"], updated)
        self.assertIn("> Exact source text remains unchanged.", updated)
        archive = self.root / "catalog/snapshots" / (mod.digest(original.encode()) + ".gz")
        self.assertEqual(original.encode(), gzip.decompress(archive.read_bytes()))
        state_bytes = (self.root / "catalog/state.json").read_bytes()
        mod.synchronize(self.root, unify_links=True)
        self.assertEqual(state_bytes, (self.root / "catalog/state.json").read_bytes())
        mod.synchronize(self.root, check=True)

    def test_unresolved_session_link_is_not_erased_or_replaced(self):
        self.session()
        report = self.root / "allFindings.md"
        original = "[unknown](manifests/unknown/findings.md)\n"
        report.write_text(original)
        self.run_catalog()
        before = (self.root / "catalog/state.json").read_bytes()
        with self.assertRaises(ValueError):
            mod.synchronize(self.root, unify_links=True)
        self.assertEqual(original, report.read_text())
        self.assertEqual(before, (self.root / "catalog/state.json").read_bytes())

    def test_auxiliary_snapshot_integrity_is_checked_without_any_original_files(self):
        path = self.session()
        (path / "queries.json").write_text('{"keywords": ["topic"]}')
        self.run_catalog()
        state = mod.load_state(self.root)
        ref = state["sessions"]["s1"]["revisions"][0]["inputs"]["queries.json"]
        shutil.rmtree(self.root / "manifests")
        (self.root / ref["snapshot"]).write_bytes(gzip.compress(b"damaged query metadata"))
        with self.assertRaises(ValueError):
            mod.synchronize(self.root, check=True)


if __name__ == "__main__":
    unittest.main()
