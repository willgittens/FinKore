# SPDX-License-Identifier: MPL-2.0
# Indexes research, writes catalogs/snapshots, and optionally repairs report links;
# does not define financial behavior.
"""Offline research memory. No discovery, downloads, extraction, or normative edits."""

import argparse
import copy
import gzip
import hashlib
import json
import os
import re
import tempfile
import uuid
from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

VERSION = "1.1.0"
MANIFEST_VERSION = "1.0.0"
ROOT = Path(__file__).resolve().parents[1]
VIEWS = ("allPublications.json", "allSeen.json", "allSessions.json", "allFindings.json")
EXTENTS = {"inaccessible": 0, "metadata_only": 1, "abstract_only": 2,
           "partial_text": 3, "full_text_reviewed": 4}
FIELDS = ("title", "abstract", "doi", "publication_year", "publication_date", "authors",
          "institutions", "publication_types", "venue", "language", "keywords",
          "landing_page_url", "license", "citation_count", "pdf_url", "open_access", "download")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def token(value):
    """Normalize explicit identifiers only. Titles never establish identity."""
    if not isinstance(value, str) or not value.strip():
        return None
    value = unquote(value.strip())
    if re.match(r"https?://(?:dx\.)?doi\.org/", value, re.I):
        value = re.sub(r"https?://(?:dx\.)?doi\.org/", "", value, flags=re.I)
    if value.lower().startswith(("doi:", "crossref:")):
        value = value.split(":", 1)[1].strip()
    if re.match(r"^10\.\d{4,9}/\S+$", value, re.I):
        return "doi:" + value.casefold()
    match = re.fullmatch(r"(?:https?://openalex\.org/|openalex:)?(W\d+)", value, re.I)
    if match:
        return "openalex:" + match[1].upper()
    match = re.fullmatch(r"(?:semantic_scholar:|semanticscholar:|s2:)([\da-f]{40})", value, re.I)
    if match:
        return "semantic_scholar:" + match[1].lower()
    return "id:" + value  # Unknown namespaces remain exact, opaque identifiers.


def identifiers(publication):
    primary = token(publication.get("id"))
    if primary is None:
        raise ValueError("Publication has no nonempty stable ID")
    values = {primary}
    doi = token(publication.get("doi"))
    if doi:
        values.add(doi)
    ids = publication.get("identifiers") or {}
    if not isinstance(ids, dict):
        raise ValueError("Publication identifiers must be an object or null")
    for provider, value in ids.items():
        if provider in {"doi", "crossref", "openalex", "semantic_scholar", "semanticscholar"} and value:
            explicit = str(value)
            if provider not in {"doi", "crossref"} and not explicit.startswith(("http:", "https:", provider + ":")):
                explicit = provider + ":" + explicit
            values.add(token(explicit))
    dois = {v for v in values if v.startswith("doi:")}
    if len(dois) > 1:
        return {primary}, sorted(values)  # Do not spread inconsistent identity assertions.
    return values, []


def inside(root, path):
    resolved = path.resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError(f"Path escapes research directory: {path}")
    return resolved


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() == data:
        return
    fd, name = tempfile.mkstemp(prefix=".tmp-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def catalog_lock(root):
    import fcntl  # POSIX advisory lock: released by the OS even after interruption.
    directory = inside(root, root / "catalog")
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / ".lock").open("a+b") as stream:
        try:
            fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError("Another research consolidation is running") from None
        yield


class Snapshots:
    def __init__(self, root, writing):
        self.root, self.writing, self.cache = root, writing, {}
        self.captured = {}

    def capture(self, path):
        path = inside(self.root, path)
        data = path.read_bytes()
        sha = digest(data)
        reference = {"path": path.relative_to(self.root).as_posix(), "sha256": sha,
                     "snapshot": f"catalog/snapshots/{sha}.gz", "size_bytes": len(data)}
        self.captured[reference["path"]] = reference
        self.cache[sha] = data
        target = inside(self.root, self.root / reference["snapshot"])
        if not self.writing:
            if not target.exists() or digest(gzip.decompress(target.read_bytes())) != sha:
                raise ValueError(f"Missing/corrupt snapshot; run consolidation: {target}")
        if self.writing:
            if target.exists():
                if digest(gzip.decompress(target.read_bytes())) != sha:
                    raise ValueError(f"Corrupt immutable snapshot: {target}")
            else:
                atomic_write(target, gzip.compress(data, mtime=0))
        return reference

    def read(self, reference):
        sha = reference["sha256"]
        if sha not in self.cache:
            target = inside(self.root, self.root / reference["snapshot"])
            data = gzip.decompress(target.read_bytes())
            if digest(data) != sha:
                raise ValueError(f"Corrupt snapshot: {target}")
            self.cache[sha] = data
        return self.cache[sha]

    def json(self, reference):
        return json.loads(self.read(reference))


def load_state(root):
    path = inside(root, root / "catalog/state.json")
    if not path.exists():
        return {"schema_version": VERSION, "generation_id": None, "updated_at": None,
                "sessions": {}, "review_revisions": [], "identities": {}, "redirects": {}}
    state = json.loads(path.read_bytes())
    if state.get("schema_version") not in {"1.0.0", VERSION}:
        raise ValueError("Unsupported catalog schema; migrate explicitly before writing")
    for field in ("sessions", "identities", "redirects"):
        if not isinstance(state.get(field), dict):
            raise ValueError(f"Invalid catalog state: {field}")
    if not isinstance(state.get("review_revisions"), list):
        raise ValueError("Invalid review revision history")
    return state


def sections(text, prefix):
    headings = list(re.finditer(r"^(#{1,6})\s+([^\n]+)", text, re.M))
    for i, match in enumerate(headings):
        identity = re.match(prefix, match[2])
        if not identity:
            continue
        end = next((h.start() for h in headings[i + 1:] if len(h[1]) <= len(match[1])), len(text))
        yield {"label": identity[1], "heading": match[2], "text": text[match.start():end].rstrip(),
               "line": text.count("\n", 0, match.start()) + 1}


def reference_location(reference, section):
    return {**reference, "heading": section["heading"], "line": section["line"]}


def collect_inputs(root, state, snapshots):
    """Append input revisions. Existing sessions/revisions are never removed."""
    changed = False
    found = set()
    downloads = {}
    for path in sorted((root / "documents").glob("*/downloads.json")):
        reference = snapshots.capture(path)
        document = snapshots.json(reference)
        sid = document.get("manifest_session_id")
        if not isinstance(sid, str):
            raise ValueError(f"downloads.json has no session identity: {path}")
        if sid in downloads:
            raise ValueError(f"Ambiguous downloader outputs for session {sid}")
        downloads[sid] = reference
    for path in sorted((root / "manifests").glob("*/manifest.json")):
        manifest_ref = snapshots.capture(path)
        manifest = snapshots.json(manifest_ref)
        if manifest.get("schema_version") != MANIFEST_VERSION or not isinstance(manifest.get("publications"), list):
            raise ValueError(f"Unsupported or malformed manifest: {path}")
        sid = manifest.get("session_id")
        if not isinstance(sid, str) or not sid.strip() or sid in found:
            raise ValueError(f"Missing or duplicate manifest session ID: {path}")
        found.add(sid)
        ids = [p.get("id") for p in manifest["publications"] if isinstance(p, dict)]
        if len(ids) != len(manifest["publications"]) or any(not isinstance(x, str) or not x.strip() for x in ids) or len(set(ids)) != len(ids):
            raise ValueError(f"Invalid/duplicate publication IDs: {path}")
        session = state["sessions"].get(sid)
        prior_inputs = next(r for r in session["revisions"] if r["revision_id"] == session["current_revision"])["inputs"] if session else {}
        inputs = {**prior_inputs, "manifest.json": manifest_ref}
        for name in ("queries.json", "summary.md", "findings.md"):
            sibling = path.with_name(name)
            if sibling.exists():
                inputs[name] = snapshots.capture(sibling)
                if name.endswith(".json"):
                    snapshots.json(inputs[name])  # Reject malformed auxiliary JSON too.
        if sid in downloads:
            inputs["downloads.json"] = downloads.pop(sid)
        revision_id = digest(encoded(inputs))
        session = state["sessions"].setdefault(sid, {"revisions": [], "storage_mode": "unified"})
        if revision_id not in {r["revision_id"] for r in session["revisions"]}:
            session["revisions"].append({"revision_id": revision_id, "imported_at": state["updated_at"], "inputs": inputs})
        if session.get("current_revision") != revision_id:
            changed = True
        session.update(current_revision=revision_id, storage_mode="unified")
    # A detached downloader report must not disappear from the archive silently.
    for sid, reference in downloads.items():
        if sid not in state["sessions"]:
            raise ValueError("Downloader session has no known manifest: " + sid)
        session = state["sessions"][sid]
        prior = next(r for r in session["revisions"] if r["revision_id"] == session["current_revision"])
        inputs = {**prior["inputs"], "downloads.json": reference}
        revision_id = digest(encoded(inputs))
        if revision_id != session["current_revision"]:
            session["revisions"].append({"revision_id": revision_id, "imported_at": state["updated_at"], "inputs": inputs})
            session["current_revision"] = revision_id
            changed = True
    report = root / "allFindings.md"
    current = snapshots.capture(report) if report.exists() else state.get("current_review")
    if current != state.get("current_review"):
        changed = True
        state["current_review"] = current
        if current and current not in state["review_revisions"]:
            state["review_revisions"].append(current)
    return changed


def input_inventory(root):
    """Only files offered for import now; archived paths are historical labels."""
    paths = set((root / "documents").glob("*/downloads.json"))
    for manifest in (root / "manifests").glob("*/manifest.json"):
        paths.add(manifest)
        paths.update(p for name in ("queries.json", "summary.md", "findings.md") if (p := manifest.with_name(name)).exists())
    if (root / "allFindings.md").exists():
        paths.add(root / "allFindings.md")
    return {p.relative_to(root).as_posix() for p in paths}


def unify_report_links(root, state, snapshots):
    """Retarget session links only; preserve the old report as an immutable revision."""
    report = root / "allFindings.md"
    if not report.exists():
        return False
    original = report.read_bytes()
    text = original.decode("utf-8")
    expected = {}
    for section in sections(text, r"Session `([^`]+)`"):
        for name, sha in re.findall(r"`([^`]+)`:\s*`([0-9a-f]{64})`", section["text"]):
            expected[(section["label"], name)] = sha
    references = {}
    for sid, session in state["sessions"].items():
        for revision in session["revisions"]:
            for name, reference in revision["inputs"].items():
                key = reference["path"]
                if key not in references or (sid, name) not in expected or reference["sha256"] == expected[(sid, name)]:
                    references[key] = reference
    def replace(match):
        target = match[2].partition("#")[0]
        reference = references.get(target)
        if reference is None:
            raise ValueError("Cannot unify unresolved session link: " + match[2])
        snapshots.read(reference)  # Verify the exact archive before linking it.
        # Compressed source files have no Markdown fragments; the report retains origin IDs.
        return f"[{match[1]}]({reference['snapshot']})"
    updated = re.sub(r"\[([^\]]*)\]\((manifests/[^)]+)\)", replace, text)
    if updated == text:
        return False
    note = ("Session links resolve to immutable imported snapshots in `catalog/`. "
            "The unified catalog is authoritative for imported research; original session folders are not required.\n\n")
    if note not in updated:
        updated = updated.replace("## Scope and coverage\n", note + "## Scope and coverage\n", 1)
    if report.read_bytes() != original:
        raise ValueError("Review changed while its links were being unified; rerun")
    # collect_inputs already captured the original; only link destinations and the storage note change.
    atomic_write(report, updated.encode("utf-8"))
    reference = snapshots.capture(report)
    state["current_review"] = reference
    if reference not in state["review_revisions"]:
        state["review_revisions"].append(reference)
    return True


class Identities:
    def __init__(self, state):
        self.works, self.redirects = state["identities"], state["redirects"]
        self.index = defaultdict(set)
        for wid, work in self.works.items():
            for alias in work["aliases"]:
                self.index[alias].add(wid)

    def resolve(self, wid):
        while wid in self.redirects:
            wid = self.redirects[wid]
        return wid

    def assign(self, publication, origin):
        aliases, inconsistent = identifiers(publication)
        matches = {self.resolve(w) for a in aliases for w in self.index[a]}
        combined = set(aliases)
        for wid in matches:
            combined.update(self.works[wid]["aliases"])
        conflict = len({x for x in combined if x.startswith("doi:")}) > 1 or bool(inconsistent)
        if conflict:
            # Equal provider IDs do not override different DOI assertions.
            matches = {w for w in matches if set(self.works[w]["aliases"]) & {a for a in aliases if a.startswith("doi:")}}
            if not matches:
                matches = {w for w in self.index[token(publication["id"])] if self.works[self.resolve(w)].get("seed") == origin}
                matches = {self.resolve(w) for w in matches}
        if matches:
            winner = min(matches, key=lambda w: (self.works[w]["order"], w))
            for loser in matches - {winner}:
                self.redirects[loser] = winner
                aliases.update(self.works.pop(loser)["aliases"])
        else:
            seed = min(aliases, key=lambda x: (not x.startswith("doi:"), x))
            if conflict:
                seed += "|" + origin
            winner = "work:" + str(uuid.uuid5(uuid.NAMESPACE_URL, seed))
            self.works.setdefault(winner, {"aliases": [], "order": max((v["order"] for v in self.works.values()), default=0) + 1, "seed": origin})
        self.works[winner]["aliases"] = sorted(set(self.works[winner]["aliases"]) | aliases)
        for alias in self.works[winner]["aliases"]:
            self.index[alias].add(winner)
        return winner, inconsistent


def build_views(root, state, snapshots):
    identity = Identities(state)
    occurrences, readings, findings, reviews, evidence, downloads = [], [], [], [], [], []
    warnings, sessions = [], []
    for sid, session in state["sessions"].items():
        current = next(r for r in session["revisions"] if r["revision_id"] == session["current_revision"])
        latest = snapshots.json(current["inputs"]["manifest.json"])
        sessions.append({"session_id": sid, "topic": latest.get("topic"), "storage_mode": "unified", "source_snapshot": current["inputs"]["manifest.json"],
                         "current_revision": session["current_revision"], "revisions": session["revisions"],
                         "current_manifest_context": {k: v for k, v in latest.items() if k != "publications"}})
        seen_manifest, seen_notebook, seen_download = set(), set(), set()
        for revision in session["revisions"]:
            inputs = revision["inputs"]
            for imported_source in inputs.values():
                snapshots.read(imported_source)
            source = inputs["manifest.json"]
            manifest = snapshots.json(source)
            current_manifest = source["sha256"] == current["inputs"]["manifest.json"]["sha256"]
            lookup = {}
            for index, pub in enumerate(manifest["publications"]):
                wid, inconsistent = identity.assign(pub, sid + "/" + pub["id"])
                lookup[pub["id"]] = wid
                if source["sha256"] not in seen_manifest:
                    metadata = {k: v for k, v in pub.items() if k != "sources"}
                    occurrences.append({"work_id": wid, "session_id": sid, "publication_id": pub["id"],
                                        "metadata": metadata, "source": {**source, "json_pointer": f"/publications/{index}"},
                                        "is_current": current_manifest, "identity_conflicts": inconsistent})
            seen_manifest.add(source["sha256"])
            notebook = inputs.get("findings.md")
            pub_map = {}
            if notebook:
                text = snapshots.read(notebook).decode("utf-8")
                current_reading = current["inputs"].get("findings.md", {}).get("sha256") == notebook["sha256"]
                for section in sections(text, r"(PUB-\d+)\b"):
                    pid = re.search(r"\*\*ID:\*\*\s*`([^`]+)`", section["text"])
                    if not pid or pid[1] not in lookup:
                        raise ValueError(f"Unresolved {sid}/{section['label']} publication ID in findings.md")
                    wid = lookup[pid[1]]
                    pub_map[section["label"]] = wid
                    if notebook["sha256"] in seen_notebook:
                        continue
                    extent = re.search(r"\*\*(?:Leitura|Reading):\*\*\s*`([^`]+)`", section["text"])
                    extent = extent[1] if extent else "unknown"
                    if extent not in EXTENTS:
                        warnings.append(f"Unrecognized reading extent: {sid}/{section['label']} ({extent}); no skip recommendation")
                    readings.append({"work_id": wid, "session_id": sid, "publication_id": pid[1],
                                     "local_publication_id": section["label"], "reading_extent": extent,
                                     "source": reference_location(notebook, section), "is_current": current_reading,
                                     "source_urls": sorted(set(re.findall(r"https?://[^\s)>]+", section["text"]))),
                                     "notes": section["text"]})
                if notebook["sha256"] not in seen_notebook:
                    for section in sections(text, r"(FND-\d+)\b"):
                        labels = set(re.findall(r"\bPUB-\d+\b", section["text"]))
                        unresolved = labels - pub_map.keys()
                        if unresolved:
                            raise ValueError(f"Unresolved finding publications: {sid}/{section['label']} {unresolved}")
                        findings.append({"origin_id": sid + "/" + section["label"], "session_id": sid,
                                         "finding_id": section["label"], "work_ids": sorted({pub_map[x] for x in labels}),
                                         "manifest_sha256": source["sha256"],
                                         "source": reference_location(notebook, section), "is_current": current_reading,
                                         "notes": section["text"]})
                seen_notebook.add(notebook["sha256"])
            else:
                warnings.append(f"No findings.md for {sid}; discovery alone does not establish reading")
            downloaded = inputs.get("downloads.json")
            if downloaded and downloaded["sha256"] not in seen_download:
                for index, entry in enumerate(snapshots.json(downloaded).get("publications", [])):
                    if entry.get("id") not in lookup:
                        raise ValueError(f"Unresolved download publication: {sid}/{entry.get('id')}")
                    file = entry.get("file")
                    pdf_path = None
                    if file:
                        pdf_path = (Path(downloaded["path"]).parent / file).as_posix()
                        inside(root, root / pdf_path)
                    downloads.append({"work_id": lookup[entry["id"]], "session_id": sid, "record": entry,
                                      "source": {**downloaded, "json_pointer": f"/publications/{index}"},
                                      "local_file": pdf_path,
                                      "is_current": current["inputs"].get("downloads.json", {}).get("sha256") == downloaded["sha256"]})
                seen_download.add(downloaded["sha256"])
    origin_works = defaultdict(set)
    origin_records = defaultdict(list)
    for finding in findings:
        origin_works[finding["origin_id"]].update(finding["work_ids"])
        origin_records[finding["origin_id"]].append(finding)
    for source in state["review_revisions"]:
        text = snapshots.read(source).decode("utf-8")
        is_current = source == state.get("current_review")
        expected_inputs = {}
        for session_section in sections(text, r"Session `([^`]+)`"):
            expected_inputs[session_section["label"]] = dict(re.findall(r"`(manifest\.json|findings\.md)`:\s*`([0-9a-f]{64})`", session_section["text"]))
        for section in sections(text, r"(REV-\d+|EVD-\d+)\b"):
            body = section["text"]
            origin_lines = "\n".join(line for line in body.splitlines() if re.match(r"- \*\*(?:Origins?|Merged origin):\*\*", line))
            origins = sorted(set(re.findall(r"`([^`\s]+/FND-\d+)`", origin_lines)))
            if not origins:
                warnings.append("Review origin format not recognized: " + section["label"])
            for origin in origins:
                if origin not in origin_works:
                    warnings.append(f"Review origin not resolved: {section['label']} -> {origin}")
            associated, compatibility = set(), []
            for origin in origins:
                sid = origin.rsplit("/", 1)[0]
                expected = expected_inputs.get(sid, {})
                records = origin_records[origin]
                if {"manifest.json", "findings.md"} <= expected.keys():
                    records = [r for r in records if r["source"]["sha256"] == expected["findings.md"] and r["manifest_sha256"] == expected["manifest.json"]]
                    session = state["sessions"].get(sid)
                    latest_inputs = next(r for r in session["revisions"] if r["revision_id"] == session["current_revision"])["inputs"] if session else {}
                    same = session and all(latest_inputs.get(k, {}).get("sha256") == v for k, v in expected.items())
                    compatibility.append("current" if same and records else "changed")
                else:
                    compatibility.append("unverified")
                associated.update(w for r in records for w in r["work_ids"])
            input_check = "changed" if "changed" in compatibility else ("current" if compatibility and set(compatibility) == {"current"} else "unverified")
            item = {"id": section["label"], "origins": origins,
                    "work_ids": sorted(associated), "input_compatibility": input_check,
                    "source": reference_location(source, section), "is_current": is_current, "notes": body}
            if item["id"].startswith("REV-"):
                for name, label in (("assessment", "Evidence assessment"), ("progress", "Progress"), ("readiness", "Learn reuse")):
                    value = re.search(r"\*\*" + label + r":\*\*\s*`([^`]+)`", body)
                    item[name] = value[1] if value else None
                    if value is None:
                        warnings.append(f"Review field not recognized: {section['label']}/{name}")
                item["evidence_ids"] = sorted(set(re.findall(r"\[?(EVD-\d+)\]?", body)))
                reviews.append(item)
            else:
                quote = "\n".join(line[2:] for line in body.splitlines() if line.startswith("> "))
                item["exact_quote"] = quote or None
                evidence.append(item)
        if not any(r["source"]["sha256"] == source["sha256"] for r in reviews):
            warnings.append("Review format not recognized; full report preserved in snapshot: " + source["sha256"])
    works = {}
    for wid, definition in state["identities"].items():
        works[wid] = {"work_id": wid, "identifiers": definition["aliases"], "metadata": {f: None for f in FIELDS},
                      "metadata_variants": {}, "occurrences": [], "reading_history": [], "download_history": [],
                      "finding_origins": [], "review_history": [], "identity_conflicts": []}
    for item in occurrences:
        item["work_id"] = identity.resolve(item["work_id"])
        work = works[item["work_id"]]
        work["occurrences"].append(item)
        if item["identity_conflicts"]:
            work["identity_conflicts"].append(item["identity_conflicts"])
        for field in FIELDS:
            value = item["metadata"].get(field)
            if work["metadata"][field] is None and value is not None:
                work["metadata"][field] = value
            values = work["metadata_variants"].setdefault(field, [])
            match = next((v for v in values if v["value"] == value), None)
            if match is None:
                match = {"value": value, "origins": []}
                values.append(match)
            match["origins"].append({"session_id": item["session_id"], "publication_id": item["publication_id"], "source": item["source"]})
    for item in readings:
        works[identity.resolve(item.pop("work_id"))]["reading_history"].append(item)
    for item in downloads:
        works[identity.resolve(item.pop("work_id"))]["download_history"].append(item)
    for item in findings + reviews + evidence:
        item["work_ids"] = sorted({identity.resolve(w) for w in item["work_ids"]})
    for item in findings:
        for wid in item["work_ids"]:
            if item["origin_id"] not in works[wid]["finding_origins"]:
                works[wid]["finding_origins"].append(item["origin_id"])
    for item in reviews:
        for wid in item["work_ids"]:
            works[wid]["review_history"].append({k: v for k, v in item.items() if k != "notes"})
    # Shared provider aliases with incompatible DOI records remain explicitly ambiguous.
    alias_works = defaultdict(list)
    for wid, work in works.items():
        for alias in work["identifiers"]:
            alias_works[alias].append(wid)
    for alias, ids in alias_works.items():
        if len(ids) > 1:
            for wid in ids:
                works[wid]["identity_conflicts"].append({"alias": alias, "work_ids": ids})
    seen = []
    for wid, work in works.items():
        reading = work["reading_history"]
        best = max((r["reading_extent"] for r in reading), key=lambda x: EXTENTS.get(x, -1), default=None)
        current_reviews = [r for r in work["review_history"] if r["is_current"]]
        status = {"triage_recorded": bool(reading), "best_reported_reading_extent": best,
                  "source_text_read": EXTENTS.get(best, -1) >= 2,
                  "full_text_reviewed": best == "full_text_reviewed", "review_recorded": bool(work["review_history"]),
                  "scope": "Reported notebook activity; not independently verified source access or normative validation"}
        work["status"] = status
        work["metadata_conflicts"] = sorted(f for f, vv in work["metadata_variants"].items() if len([v for v in vv if v["value"] is not None]) > 1)
        if reading or work["review_history"]:
            follow_up = (best != "full_text_reviewed" or bool(work["identity_conflicts"]) or any(r["reading_extent"] not in EXTENTS for r in reading) or
                         any(r["input_compatibility"] != "current" or r["progress"] in {None, "limited"} or r["readiness"] in {None, "needs_more_evidence"} for r in current_reviews))
            policy = {"skip_initial_triage_for_same_intent": bool(reading) and best in EXTENTS and not work["identity_conflicts"] and all(r["reading_extent"] in EXTENTS for r in reading),
                      "requires_topic_and_version_check": True, "eligible_for_deeper_reading": best != "full_text_reviewed",
                      "needs_follow_up": follow_up}
            work["repeat_policy"] = policy
            seen.append({"work_id": wid, "identifiers": work["identifiers"], "title": work["metadata"]["title"],
                         "authors": work["metadata"]["authors"], "status": status,
                         "repeat_policy": policy,
                         "identity_conflicts": work["identity_conflicts"], "reading_history": reading,
                         "finding_origins": work["finding_origins"], "review_history": work["review_history"],
                         "occurrences": [{k: v for k, v in o.items() if k not in {"metadata", "identity_conflicts", "work_id"}} for o in work["occurrences"]]})
    header = {"schema_version": VERSION, "generation_id": state["generation_id"], "updated_at": state["updated_at"]}
    return {
        "allPublications.json": {**header, "kind": "publications", "total": len(works), "redirects": state["redirects"], "publications": sorted(works.values(), key=lambda x: x["work_id"])},
        "allSeen.json": {**header, "kind": "seen", "total": len(seen), "redirects": state["redirects"],
                         "counts": {"text_read": sum(w["status"]["source_text_read"] for w in seen),
                                    "full_text_reviewed": sum(w["status"]["full_text_reviewed"] for w in seen),
                                    "attempted_without_text": sum(not w["status"]["source_text_read"] for w in seen),
                                    "needs_follow_up": sum(w["repeat_policy"]["needs_follow_up"] for w in seen)}, "works": sorted(seen, key=lambda x: x["work_id"])},
        "allSessions.json": {**header, "kind": "sessions", "total": len(sessions), "sessions": sessions, "warnings": sorted(set(warnings))},
        "allFindings.json": {**header, "kind": "findings", "findings": findings, "reviews": reviews, "evidence": evidence,
                             "counts": {"origin_findings": len({f["origin_id"] for f in findings}),
                                        "current_reviews": sum(r["is_current"] for r in reviews), "current_evidence": sum(e["is_current"] for e in evidence)}}}


def synchronize(root, check=False, unify_links=False):
    root = root.resolve(strict=True)
    state = load_state(root)
    before = copy.deepcopy(state)
    migrated = state["schema_version"] != VERSION
    if migrated:
        state["schema_version"] = VERSION
        for session in state["sessions"].values():
            if "present" in session:
                session["legacy_source_present"] = session.pop("present")
            session["storage_mode"] = "unified"
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    state["updated_at"] = timestamp
    snapshots = Snapshots(root, writing=not check)
    initial_inventory = input_inventory(root)
    changed = collect_inputs(root, state, snapshots)
    if unify_links:
        if check:
            raise ValueError("Link unification cannot run in read-only mode")
        changed = unify_report_links(root, state, snapshots) or changed
    if changed or migrated or state["generation_id"] is None:
        state["generation_id"] = str(uuid.uuid4())
    else:
        state["updated_at"] = before["updated_at"]
    views = build_views(root, state, snapshots)
    # Imported source paths never become live dependencies again.
    if input_inventory(root) != initial_inventory:
        raise ValueError("Import inventory changed during consolidation; rerun")
    for ref in snapshots.captured.values():
        path = inside(root, root / ref["path"])
        if not path.exists() or digest(path.read_bytes()) != ref["sha256"]:
            raise ValueError("Source changed during consolidation; rerun: " + ref["path"])
    stale = []
    if changed or migrated or before["generation_id"] is None:
        stale.append("source inputs changed")
    if check:
        for name, data in views.items():
            path = root / name
            if not path.exists() or path.read_bytes() != encoded(data):
                stale.append(name)
        if state != before:
            stale.append("catalog/state.json")
        if stale:
            raise ValueError("Catalog requires consolidation: " + ", ".join(stale))
    else:
        # Authoritative state first; interrupted view writes can always be regenerated.
        atomic_write(inside(root, root / "catalog/state.json"), encoded(state))
        for name, data in views.items():
            atomic_write(inside(root, root / name), encoded(data))
    return views


def lookup(root, query, limit):
    state = load_state(root)
    path = root / "allPublications.json"
    if not path.exists():
        raise ValueError("Run consolidation before lookup")
    publications = json.loads(path.read_bytes())
    if publications["generation_id"] != state["generation_id"]:
        raise ValueError("Catalog views are interrupted/stale; run consolidation")
    normalized, folded = token(query), query.casefold()
    redirected = query
    while redirected in state["redirects"]:
        redirected = state["redirects"][redirected]
    exact = [w for w in publications["publications"] if normalized in w["identifiers"] or redirected == w["work_id"]]
    matches = exact or [w for w in publications["publications"] if folded in (w["metadata"]["title"] or "").casefold()]
    return {"query": query, "match_type": "identifier" if exact else "title_search_only", "total_matches": len(matches),
            "note": "Run --check for freshness. Title matches never establish identity; compare topic, version and reading limits before skipping.",
            "matches": [{"work_id": w["work_id"], "identifiers": w["identifiers"], "title": w["metadata"]["title"],
                         "status": w["status"], "repeat_policy": w.get("repeat_policy"), "identity_conflicts": w["identity_conflicts"],
                         "finding_origins": w["finding_origins"], "reading_sources": [r["source"] for r in w["reading_history"]]} for w in matches[:limit]]}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--research-root", type=Path, default=ROOT)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Read-only freshness/integrity check")
    mode.add_argument("--lookup", metavar="ID_OR_TITLE", help="Read-only catalog lookup")
    mode.add_argument("--unify-links", action="store_true", help="Repoint session links in allFindings.md to imported snapshots")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args(argv)
    if args.limit < 1:
        parser.error("--limit must be positive")
    try:
        if args.lookup:
            print(encoded(lookup(args.research_root, args.lookup, args.limit)).decode(), end="")
        elif args.check:
            synchronize(args.research_root, check=True)
            print("Research catalog is current; snapshots and views verified.")
        else:
            with catalog_lock(args.research_root):
                views = synchronize(args.research_root, unify_links=args.unify_links)
            print(f"Sessions: {views['allSessions.json']['total']}; unique publication identities: {views['allPublications.json']['total']}; seen/attempted: {views['allSeen.json']['total']}")
            print("Reading:", json.dumps(views["allSeen.json"]["counts"], ensure_ascii=False))
            for name in VIEWS:
                print((args.research_root / name).resolve())
            if views["allSessions.json"]["warnings"]:
                print("Warnings recorded in allSessions.json:", len(views["allSessions.json"]["warnings"]))
    except (ValueError, OSError, EOFError, KeyError, TypeError, StopIteration) as error:
        parser.exit(1, f"Research consolidation failed: {error}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
