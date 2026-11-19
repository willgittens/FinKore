# SPDX-License-Identifier: MPL-2.0
# Reads research and contract artifacts and writes research traceability views;
# does not define, execute, or modify financial behavior.
"""Build non-normative, bidirectional research-to-contract traceability offline."""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
from expert_common import (RELATIONSHIPS, ROLES, atomic_write, encoded, inside,
                           normal, read_contract, references, sha, slug, target_link)
from consolidate_research import catalog_lock, synchronize

VERSION = "1.0.0"
REPO = Path(__file__).resolve().parents[3]
CURATION = {"reviewed", "pending_evidence", "not_recommended", "pending_curation"}


def field(notes, label):
    match = re.search(r"\*\*" + re.escape(label) + r"[.:]\*\*\s*(.*?)(?=\n\n|$)", notes, re.S)
    return normal(match[1]) if match else None


def review_hash(review):
    keys = ("id", "notes", "assessment", "progress", "readiness", "input_compatibility", "evidence_ids", "origins", "work_ids")
    return sha({k: review.get(k) for k in keys})


def evidence_hash(evidence):
    return sha({k: evidence.get(k) for k in ("id", "notes", "exact_quote", "origins", "work_ids", "input_compatibility")})


def current_catalog(research):
    # Reuse the existing lossless catalog; original manifests are never required.
    synchronize(research, check=True)
    source = (research / "allFindings.json").read_bytes()
    data = json.loads(source)
    state = (research / "catalog/state.json").read_bytes()
    if json.loads(state)["generation_id"] != data["generation_id"]:
        raise ValueError("Research generation changed during indexing")
    current = {"source_hashes": {"allFindings.json": sha(source), "catalog/state.json": sha(state)}}
    for kind in ("reviews", "evidence", "findings"):
        rows = [r for r in data[kind] if r["is_current"]]
        key = "origin_id" if kind == "findings" else "id"
        current[kind] = {r[key]: r for r in rows}
        if len(current[kind]) != len(rows):
            raise ValueError("Duplicate current research record: " + kind)
    return current


def pending_mapping(review):
    return {"id": "MAP-" + review["id"].split("-", 1)[1], "review_id": review["id"],
            "claim": review["notes"].splitlines()[0].split(" — ", 1)[-1],
            "curation_status": "pending_curation", "interpretation": "unverified",
            "contract_scope": ["unverified"], "evidence_ids": review["evidence_ids"],
            "conditions_and_limits": field(review["notes"], "Conditions, risk and counterpoints"),
            "learn_angle": field(review["notes"], "Learn reuse"), "bindings": [],
            "checked_source": None, "reviewed_on": None}


def resolve(document, contract, catalog):
    if document.get("schema_version") != VERSION:
        raise ValueError("Unsupported traceability format")
    mappings = document["curation"]["mappings"]
    seen, seen_reviews = set(), set()
    for item in mappings:
        if item["id"] in seen or item["review_id"] in seen_reviews:
            raise ValueError("Duplicate mapping/review identity")
        seen.add(item["id"]); seen_reviews.add(item["review_id"])
    # Newly imported reviews are queued, never automatically approved or discarded.
    for rid, review in sorted(catalog["reviews"].items()):
        if rid not in seen_reviews:
            item = pending_mapping(review)
            if item["id"] in seen:
                raise ValueError("New mapping ID collision; curate explicitly")
            mappings.append(item)
            seen.add(item["id"])
    records, reverse, candidates_by_target = [], defaultdict(list), defaultdict(list)
    for item in mappings:
        if item["curation_status"] not in CURATION or item["interpretation"] not in {"reviewer_inference", "source_statement", "unverified"}:
            raise ValueError("Invalid curation classification: " + item["id"])
        if not set(item["contract_scope"]) <= RELATIONSHIPS:
            raise ValueError("Invalid contract scope")
        review = catalog["reviews"].get(item["review_id"])
        problems = []
        if review is None:
            problems.append("review_not_current_or_removed")
        elif review["input_compatibility"] != "current":
            problems.append("review_inputs_not_current")
        source = item.get("checked_source")
        if item["curation_status"] == "reviewed":
            if not item["bindings"] or source is None or not item.get("reviewed_on"):
                raise ValueError("Reviewed mapping requires explicit bindings and reviewed fingerprints")
            if item["interpretation"] == "unverified" or not item.get("conditions_and_limits") or not item.get("learn_angle"):
                raise ValueError("Reviewed mapping requires interpretation, conditions and a bounded editorial angle")
            if review and review["readiness"] != "evidence_ready":
                problems.append("source_no_longer_evidence_ready")
            if review and source["review_sha256"] != review_hash(review):
                problems.append("review_changed")
            if not item["evidence_ids"]:
                raise ValueError("Reviewed mapping requires source evidence")
        for eid in item["evidence_ids"]:
            evidence = catalog["evidence"].get(eid)
            if evidence is None:
                problems.append("missing_evidence:" + eid)
            elif item["curation_status"] == "reviewed" and not evidence.get("exact_quote"):
                problems.append("missing_verified_quotation:" + eid)
            elif source and source["evidence_sha256"].get(eid) != evidence_hash(evidence):
                problems.append("evidence_changed:" + eid)
        if review and not set(item["evidence_ids"]) <= set(review["evidence_ids"]):
            raise ValueError("Mapping evidence is not associated with the source review")
        binding_ids = set()
        for binding in item["bindings"]:
            tid = binding["target_id"]
            if tid in binding_ids:
                raise ValueError("Duplicate target binding: " + tid)
            binding_ids.add(tid)
            if binding["relationship"] not in RELATIONSHIPS or binding["evidence_role"] not in ROLES or not binding["explanation"].strip():
                raise ValueError("Invalid semantic binding")
            target = contract["targets"].get(tid)
            if target is None:
                problems.append("target_removed_or_unknown:" + tid)
            elif binding["reviewed_clause"]["sha256"] != target["clause_sha256"]:
                problems.append("target_clause_changed:" + tid)
            reverse[tid].append(item["id"])
        state = "needs_recheck" if problems else item["curation_status"]
        notes = review["notes"] if review else ""
        candidates = references(field(notes, "FinKore comparison") or "")
        for tid in candidates:
            if tid not in binding_ids:
                candidates_by_target[tid].append(item["id"])
        records.append({"mapping_id": item["id"], "review_id": item["review_id"], "status": state,
                        "recheck_reasons": problems, "source_readiness": review["readiness"] if review else None,
                        "source_assessment": review["assessment"] if review else None,
                        "observed_source": {"review_sha256": review_hash(review), "evidence_sha256": {eid: evidence_hash(catalog["evidence"][eid]) for eid in item["evidence_ids"] if eid in catalog["evidence"]}} if review else None,
                        "origin_ids": review["origins"] if review else [], "work_ids": review["work_ids"] if review else [],
                        "normative_acceptance": "not_requested", "research_findings_status": "pending_validation",
                        "learn_eligible": state == "reviewed" and review is not None and review["readiness"] == "evidence_ready",
                        "unreviewed_reference_candidates": [t for t in candidates if t not in binding_ids],
                        "evidence_refs": [{"id": eid, "catalog": "allFindings.json", "report": "allFindings.md#" + eid.lower()} for eid in item["evidence_ids"]]})
    for edge in document["curation"].get("related_findings", []):
        if edge["from"] not in seen or edge["to"] not in seen or edge["from"] == edge["to"]:
            raise ValueError("Unresolved related-finding edge")
        if edge["relationship"] not in {"complements", "contrasts_conditions", "qualifies"} or not edge["explanation"].strip():
            raise ValueError("Invalid related-finding relationship")
    domains = defaultdict(set)
    for tid, mids in reverse.items():
        target = contract["targets"].get(tid)
        if target:
            parts = Path(target["path"]).parts
            domain = "CoreDoc" if target["layer"] == "coredoc" else ("Shared" if len(parts) == 2 else parts[1].capitalize())
            domains[domain].update(mids)
    return {"contract": contract, "research_sources": catalog.get("source_hashes", {}), "records": records, "by_target": dict(sorted(reverse.items())),
            "unreviewed_by_target": dict(sorted(candidates_by_target.items())),
            "by_domain": {domain: sorted(ids) for domain, ids in sorted(domains.items())},
            "counts": {"mappings": len(records), "statuses": dict(Counter(r["status"] for r in records)),
                       "learn_eligible": sum(r["learn_eligible"] for r in records), "linked_targets": len(reverse),
                       "indexed_requirements": len(contract["targets"]), "vectors": len(contract["vectors"]), "canonical_operations": len(contract["operations"])}}


def render(document):
    resolved = document["resolved"]
    contract = resolved["contract"]
    records = {r["mapping_id"]: r for r in resolved["records"]}
    mappings = {m["id"]: m for m in document["curation"]["mappings"]}
    counts = resolved["counts"]
    lines = ["# Research-to-contract traceability", "",
             "This is a non-normative research index. Source statements, reviewer inferences, contract scope, and editorial readiness remain separate. No rule is accepted or changed here. Academic sources were not reopened by this indexing stage.", "",
             f"Baseline: {contract['core_version']}; repository revision `{contract['repository_revision']}`. {counts['mappings']} considerations; {counts['linked_targets']} explicitly linked targets; {counts['learn_eligible']} eligible for editorial review. Status counts: " + ", ".join(f"{k}: {v}" for k, v in sorted(counts["statuses"].items())) + ".", "",
             "All original findings remain `pending_validation`. A reviewed mapping is a bounded comparison with current text, not specialist sign-off or evidence that FinKore historically adopted a paper's argument. `learn_eligible` permits editorial consideration only.", "",
             "## Navigation", "", "- [By consideration](#by-consideration)", "- [By requirement](#by-requirement)", "- [By domain](#by-domain)", "- [Related considerations](#related-considerations)", "- [Scope and maintenance](#scope-and-maintenance)", "",
             "## By consideration", "", "| Mapping / review | Claim | Status | Learn |", "| --- | --- | --- | --- |"]
    for mid, item in mappings.items():
        record = records[mid]
        claim = item["claim"].replace("|", "\\|")
        lines.append(f"| [{mid}](#{mid.lower()}) / [{item['review_id']}](allFindings.md#{item['review_id'].lower()}) | {claim} | {record['status']} | {record['source_readiness']} |")
    for mid, item in mappings.items():
        record = records[mid]
        lines += ["", f'<a id="{mid.lower()}"></a>', f"### {mid} — {item['claim']}", "",
                  f"- Review: [{item['review_id']}](allFindings.md#{item['review_id'].lower()}); origins: " + ", ".join(f"`{o}`" for o in record["origin_ids"]) + ".",
                  "- Evidence: " + ", ".join(f"[{e['id']}]({e['report']})" for e in record["evidence_refs"]) + ". Author attribution, exact quotations, primary URLs and page/section locators remain in those entries.",
                  f"- Mapping status: `{record['status']}`. Source assessment: `{record['source_assessment']}`. Interpretation: `{item['interpretation']}`.",
                  "- Contract scope: " + ", ".join(f"`{x}`" for x in item["contract_scope"]) + ".", "",
                  "**Conditions and limits.** " + (item["conditions_and_limits"] or "Unverified; curate before reuse."), "",
                  "**Learn angle.** " + (item["learn_angle"] or "Pending editorial assessment."), ""]
        if record["recheck_reasons"]:
            lines += ["**Recheck required:** " + "; ".join(record["recheck_reasons"]) + ".", ""]
        for binding in item["bindings"]:
            target = contract["targets"].get(binding["target_id"])
            if not target:
                lines += [f"- `{binding['target_id']}`: missing current target; retained for recheck."]
                continue
            lines += [f"- [{target['id']}]({target_link(target)}) — `{binding['relationship']}` / `{binding['evidence_role']}`. {binding['explanation']}"]
            if target["layer"] == "spec":
                coverage = target.get("coverage", {})
                lines += [f"  Published coverage: `{coverage.get('classification', 'unverified')}`; {len(target['vector_ids'])} manifest-listed vectors. Canonical Agentic operations: " + (", ".join(f"`{x}`" for x in target["agentic_operation_ids"]) or "none linked by the registry") + "."]
                if target["vector_ids"]:
                    examples = target["vector_ids"][:3]
                    lines += ["  Case references (first " + str(len(examples)) + "; full list in JSON): " + ", ".join(f"[{vid}](../../{contract['vectors'][vid]['path']})" for vid in examples) + "."]
        if record["unreviewed_reference_candidates"]:
            lines += ["", "**Uncurated references mentioned by the review:** " + ", ".join(f"`{x}`" for x in record["unreviewed_reference_candidates"]) + ". These are navigation candidates, not approved evidence links."]
    lines += ["", "## By requirement", "", "Only explicitly curated bindings appear below. A missing research link does not establish a specification or conformance gap.", "",
              "| Target | Modality | Curated mappings | Uncurated reference candidates | Published coverage |", "| --- | --- | --- | --- | --- |"]
    for tid in sorted(set(resolved["by_target"]) | set(resolved["unreviewed_by_target"])):
        mids = resolved["by_target"].get(tid, [])
        candidates = ", ".join(f"[{x}](#{x.lower()})" for x in resolved["unreviewed_by_target"].get(tid, [])) or "none"
        target = contract["targets"].get(tid)
        if not target:
            lines.append(f"| `{tid}` (missing) | unverified | " + ", ".join(f"[{x}](#{x.lower()})" for x in mids) + f" | {candidates} | unverified |")
            continue
        lines.append(f"| [{tid}]({target_link(target)}) | " + ", ".join(target["modalities"]) + " | " + (", ".join(f"[{x}](#{x.lower()})" for x in mids) or "none") + f" | {candidates} | " + target.get("coverage", {}).get("classification", "not applicable to foundation rule") + " |")
    lines += ["", "## By domain", "", "This domain index covers curated target bindings. Pending reference candidates remain visible in the requirement table.", ""]
    for domain, mids in resolved["by_domain"].items():
        lines += ["- " + domain + ": " + (", ".join(f"[{x}](#{x.lower()})" for x in mids) or "no curated bindings") + "."]
    lines += ["", "## Related considerations", "", "These relationships compare claims and conditions; they do not establish independent corroboration or duplicate publication identities.", ""]
    for edge in document["curation"].get("related_findings", []):
        lines += [f"- [{edge['from']}](#{edge['from'].lower()}) ↔ [{edge['to']}](#{edge['to'].lower()}): `{edge['relationship']}`. {edge['explanation']} Peer status: `{records[edge['to']]['status']}`."]
    lines += ["", "## Scope and maintenance", "",
              "Requirement text and modality come from CoreDoc and `/spec`. CoreDoc-to-spec references are explicit references from each foundation rule, not inferred semantic equivalences. Conformance links come only from `conformance/manifest.json` and vector `requirements`; coverage labels retain their published limitations. A listed vector is not an executed or exhaustive proof. No financial implementation was run.", "",
              "Canonical Agentic links come only from its registry. Conformance-local operations are not promoted. No canonical operation is invented for a deferred discussion. Requirements without vectors or canonical operations remain visible with that distinction.", "",
              "Source evidence is reused through stable EVD/REV/work IDs in the unified catalog. Original manifest folders are not required. Read evidence limits and edition discrepancies before reuse. Exact quotations are not duplicated here.", "",
              "The JSON separates `curation` (editable comparisons and reviewed fingerprints) from `resolved` (generated inventory and indexes). Run `python3 experts/research/tools/build_traceability.py` after catalog or contract updates. `--check` is read-only and fails for stale outputs or reviewed mappings requiring recheck. New reviews enter `pending_curation`; fingerprints are never silently refreshed or approved. Reassess the relationship before deliberately updating its reviewed fingerprints.", "",
              "A possible scope or coverage question remains a research discussion. Any normative proposal requires the existing specification-first process; the published contract and its verification do not depend on this index."]
    return "\n".join(lines) + "\n"


def build(repo, research=None, check=False, preview=False):
    repo = repo.resolve()
    research = (research or repo / "experts/research").resolve()
    path = inside(research, research / "traceability.json")
    original = path.read_bytes()
    document = json.loads(original)
    catalog = current_catalog(research)
    contract = read_contract(repo)
    document["resolved"] = resolve(document, contract, catalog)
    output = encoded(document)
    markdown = render(document).encode("utf-8")
    report = inside(research, research / "traceability.md")
    # Guard both the curated input and the repo/catalog snapshots used by this build.
    if path.read_bytes() != original:
        raise ValueError("Traceability input changed concurrently")
    for relative, expected in contract["files"].items():
        if sha((repo / relative).read_bytes()) != expected:
            raise ValueError("Contract changed during build: " + relative)
    for relative, expected in catalog["source_hashes"].items():
        if sha((research / relative).read_bytes()) != expected:
            raise ValueError("Research catalog changed during build: " + relative)
    if check:
        if output != original or not report.exists() or report.read_bytes() != markdown:
            raise ValueError("Traceability output is stale; rebuild")
        if stale := [r["mapping_id"] for r in document["resolved"]["records"] if r["status"] == "needs_recheck"]:
            raise ValueError("Semantic recheck required: " + ", ".join(stale))
    elif not preview:
        atomic_write(path, output)
        atomic_write(report, markdown)
    return document


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=REPO)
    parser.add_argument("--research-root", type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--target", help="Look up a requirement, such as MONEY-ROUNDING-001")
    mode.add_argument("--finding", help="Look up a consideration, such as REV-0001")
    args = parser.parse_args(argv)
    research = args.research_root or args.repo_root / "experts/research"
    try:
        if args.target or args.finding:
            document = build(args.repo_root, research, preview=True)
            if args.target:
                ids = document["resolved"]["by_target"].get(args.target, [])
                result = {"target": document["resolved"]["contract"]["targets"].get(args.target), "mapping_ids": ids, "mapping_statuses": {r["mapping_id"]: r["status"] for r in document["resolved"]["records"] if r["mapping_id"] in ids}, "uncurated_reference_candidates": document["resolved"]["unreviewed_by_target"].get(args.target, [])}
            else:
                result = {"curation": [m for m in document["curation"]["mappings"] if m["review_id"] == args.finding], "current_assessment": [r for r in document["resolved"]["records"] if r["review_id"] == args.finding]}
            print(encoded(result).decode(), end="")
        elif args.check:
            build(args.repo_root, research, check=True)
            print("Research traceability is current; reviewed comparisons require no recheck.")
        else:
            with catalog_lock(research):
                document = build(args.repo_root, research)
            print(json.dumps(document["resolved"]["counts"], ensure_ascii=False))
            print((research / "traceability.json").resolve())
            print((research / "traceability.md").resolve())
    except (ValueError, OSError, KeyError, TypeError) as error:
        parser.exit(1, f"Research traceability failed: {error}\n")


if __name__ == "__main__":
    main()
