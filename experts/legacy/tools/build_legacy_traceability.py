# SPDX-License-Identifier: MPL-2.0
# Reads approved public interviews and contract artifacts; writes only Legacy
# comparison indexes. Does not define, execute, or modify financial behavior.
"""Build non-normative Legacy-to-contract comparisons from public sources, offline."""

import argparse
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "experts/research/tools"))
from build_traceability import read_contract, sha, slug, target_link
from consolidate_research import atomic_write, encoded, inside

VERSION = "1.0.0"
SCHEMA = Path(__file__).resolve().parents[1] / "schemas/traceability.schema.json"


def validate_schema(document):
    """Reuse the repository's installed Ajv; never fetch a schema or dependency."""
    script = """
import Ajv from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
const validate = new Ajv({allErrors:true}).compile(JSON.parse(readFileSync(process.argv[1], 'utf8')));
if (!validate(JSON.parse(readFileSync(0, 'utf8')))) {
  console.error(JSON.stringify(validate.errors)); process.exit(1);
}
"""
    result = subprocess.run(["node", "--input-type=module", "-e", script, str(SCHEMA)],
                            input=encoded(document), stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=REPO)
    if result.returncode:
        raise ValueError("Legacy schema validation failed (install repository dependencies with npm ci --no-audit): "
                         + result.stderr.decode("utf-8", errors="replace"))


def sections(text):
    """H3 answers end at the next H2/H3; H2 editorial notes are never answers."""
    headings = list(re.finditer(r"^(#{2,3}) (.+)$", text, re.M))
    result = {}
    for index, match in enumerate(headings):
        if match[1] != "###":
            continue
        heading = match[2]
        if heading in result:
            raise ValueError("Duplicate interview heading: " + heading)
        end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
        start = match.end()
        result[heading] = {"body": text[start:end], "start": start,
                           "line": text.count("\n", 0, match.start()) + 1, "anchor": slug(heading)}
    return result


def speaker_quote(section, quote):
    """Exact contiguous text within a plain answer paragraph, never editorial markup."""
    if not quote.strip():
        return None
    # Mask fenced examples while preserving offsets into the original document.
    safe, fence = [], None
    for line in section["body"].splitlines(keepends=True):
        marker = re.match(r"^[ \t]*(`{3,}|~{3,})", line)
        masked = fence is not None or marker is not None
        if marker:
            if fence is None:
                fence = marker[1]
            elif marker[1][0] == fence[0] and len(marker[1]) >= len(fence):
                fence = None
        safe.append(re.sub(r"[^\n]", " ", line) if masked else line)
    body = "".join(safe)
    for match in re.finditer(r"\S[\s\S]*?(?=\n\s*\n|\Z)", body):
        paragraph = match[0].strip()
        if paragraph.startswith(("*", "_", ">", "#", "---", "<!--")):
            continue
        offset = match[0].find(quote)
        if offset >= 0:
            return section["start"] + match.start() + offset
    return None


def read_interview(repo, item):
    source = inside(repo / "experts/legacy/interviews", repo / item["source"])
    reader = inside(repo / "learn", repo / item["reader"])
    if source.suffix != ".md" or reader.suffix != ".html":
        raise ValueError("Expected a public Markdown interview and HTML reader")
    raw = source.read_bytes()
    text = raw.decode("utf-8")
    name = re.search(r"^\*\*Interviewee:\*\*\s*(.+)$", text, re.M)
    approval = re.search(
        r"^\*\*Status:\*\* (Approved by Interviewee on .+|"
        r"Approved for publication — confirmed by the project maintainer on \d{2}\.\d{2}\.\d{4})$",
        text, re.M)
    if not approval or not name or name[1].strip() != item["name"] or not reader.is_file():
        raise ValueError("Interview is not an approved, attributed public source: " + item["id"])
    return {"sha256": sha(raw), "approval": approval[1], "text": text, "sections": sections(text)}


def research_links(repo):
    path = repo / "experts/research/traceability.json"
    if not path.exists():
        return {}, None
    raw = path.read_bytes()
    data = json.loads(raw)
    if data.get("schema_version") != VERSION:
        raise ValueError("Unsupported research comparison format")
    records = {r["mapping_id"]: r for r in data["resolved"]["records"]}
    return {m["id"]: {"curation": m, "assessment": records[m["id"]]}
            for m in data["curation"]["mappings"]}, sha(raw)


def resolve(repo, document, contract):
    curation = document["curation"]
    interviews, inventory, inputs = {}, [], {}
    ids, paths = set(), set()
    for item in curation["interviews"]:
        if item["id"] in ids or item["source"] in paths:
            raise ValueError("Duplicate interview identity or source")
        ids.add(item["id"]); paths.add(item["source"])
        source = read_interview(repo, item)
        inputs[item["source"]] = source["sha256"]
        checked = {s["heading"]: s for s in item["sections"]}
        if len(checked) != len(item["sections"]):
            raise ValueError("Duplicate section classification")
        problems = []
        if item["reviewed_source_sha256"] != source["sha256"]:
            problems.append("interview_changed_or_not_reviewed")
        if set(checked) != set(source["sections"]):
            problems.append("section_inventory_changed")
        interviews[item["id"]] = (item, source, checked, problems)
        inventory.append({"id": item["id"], "source_kind": "practitioner_interview",
                          "source": item["source"], "reader": item["reader"], "speaker": item["name"],
                          "publication_approval": source["approval"], "observed_sha256": source["sha256"],
                          "status": "needs_recheck" if problems else "reviewed", "recheck_reasons": problems,
                          "sections": [{"heading": h, "role": checked.get(h, {}).get("role", "unreviewed"),
                                        "disposition": checked.get(h, {}).get("disposition", "pending_curation"),
                                        "reason": checked.get(h, {}).get("reason", "New section; classify explicitly."),
                                        "line": s["line"], "anchor": s["anchor"]}
                                       for h, s in source["sections"].items()]})
    research, research_sha = research_links(repo)
    if research_sha:
        inputs["experts/research/traceability.json"] = research_sha
    records, by_target, by_interview, seen = [], defaultdict(list), defaultdict(list), set()
    linked = set()
    for item in curation["mappings"]:
        mid = item["id"]
        if mid in seen:
            raise ValueError("Duplicate Legacy mapping: " + mid)
        seen.add(mid)
        if item["interview_id"] not in interviews:
            raise ValueError("Unregistered interview: " + item["interview_id"])
        interview, source, checked, interview_problems = interviews[item["interview_id"]]
        problems = list(interview_problems)
        evidence = []
        for quote in item["evidence"]:
            heading = quote["heading"]
            section = source["sections"].get(heading)
            classification = checked.get(heading, {})
            offset = speaker_quote(section, quote["exact_quote"]) if section else None
            if classification.get("role") != "public_answer" or classification.get("disposition") != "mapped":
                problems.append("not_public_speaker_evidence:" + heading)
                offset = None
            if offset is None:
                problems.append("quote_not_verified:" + heading)
            evidence.append({**quote, "verified": offset is not None,
                             "line": source["text"].count("\n", 0, offset) + 1 if offset is not None else None,
                             "source": interview["source"], "speaker": interview["name"],
                             "source_anchor": section["anchor"] if section else None,
                             "reader": interview["reader"]})
        tids = set()
        for binding in item["bindings"]:
            tid = binding["target_id"]
            if tid in tids:
                raise ValueError("Duplicate target binding: " + tid)
            tids.add(tid)
            target = contract["targets"].get(tid)
            if target is None:
                problems.append("target_removed_or_unknown:" + tid)
            else:
                linked.add(tid)
                if binding["reviewed_clause_sha256"] != target["clause_sha256"]:
                    problems.append("target_clause_changed:" + tid)
            by_target[tid].append(mid)
        related = []
        for edge in item["related_research"]:
            current = research.get(edge["mapping_id"])
            if current is None or edge["reviewed_curation_sha256"] != sha(current["curation"]):
                problems.append("related_research_missing_or_changed:" + edge["mapping_id"])
            related.append({"mapping_id": edge["mapping_id"], "relationship": edge["relationship"],
                            "explanation": edge["explanation"],
                            "recorded_status": current["assessment"]["status"] if current else "missing",
                            "recorded_readiness": current["assessment"]["source_readiness"] if current else None,
                            "freshness": "not_revalidated_here"})
        status = "needs_recheck" if problems else item["curation_status"]
        records.append({"mapping_id": mid, "interview_id": item["interview_id"], "status": status,
                        "recheck_reasons": sorted(set(problems)), "evidence": evidence, "related_research": related,
                        "findings_status": "pending_validation", "normative_acceptance": "not_requested",
                        "editorial_eligible": status == "reviewed" and bool(evidence) and all(e["verified"] for e in evidence)})
        by_interview[item["interview_id"]].append(mid)
    for item, source, checked, _ in interviews.values():
        used = {q["heading"] for m in curation["mappings"] if m["interview_id"] == item["id"] for q in m["evidence"]}
        if any(s["disposition"] == "mapped" and h not in used for h, s in checked.items()):
            raise ValueError("Mapped section has no comparison: " + item["id"])
    targets = {tid: contract["targets"][tid] for tid in sorted(linked)}
    vids = {v for t in targets.values() for v in t["vector_ids"]}
    ops = {o for t in targets.values() for o in t["agentic_operation_ids"]}
    excerpt = {k: contract[k] for k in ("core_version", "repository_revision", "files")}
    excerpt.update(targets=targets, vectors={v: contract["vectors"][v] for v in sorted(vids)},
                   operations={o: contract["operations"][o] for o in sorted(ops)})
    return {"contract": excerpt, "inputs": inputs, "interviews": inventory, "records": records,
            "by_target": dict(sorted(by_target.items())), "by_interview": dict(sorted(by_interview.items())),
            "counts": {"interviews": len(inventory), "mappings": len(records), "linked_targets": len(targets),
                       "statuses": dict(Counter(r["status"] for r in records)),
                       "editorial_eligible": sum(r["editorial_eligible"] for r in records)}}


def render(document):
    resolved = document["resolved"]
    records = {r["mapping_id"]: r for r in resolved["records"]}
    contract = resolved["contract"]
    lines = ["# Legacy-to-contract traceability", "",
             "Non-normative analyst comparisons of approved public practitioner interviews. These are personal accounts, not academic studies, independently verified incidents, or accepted FinKore requirements. Every finding remains `pending_validation`.", "",
             "Publication approval applies to the interview text, not to these comparisons or future Learn pages. Speaker quotations, analyst interpretations, and editorial omissions remain separate. No private account was consulted or reconstructed.", "",
             f"Baseline: {contract['core_version']}; repository revision `{contract['repository_revision']}`. "
             f"{resolved['counts']['interviews']} interview(s), {resolved['counts']['mappings']} comparisons, "
             f"{resolved['counts']['linked_targets']} linked requirements.", "",
             "## Interview inventory", ""]
    for interview in resolved["interviews"]:
        lines += [f"### {interview['id']} — {interview['speaker']}", "",
                  f"[Approved source](../../{interview['source']}) · [Published reader](../../{interview['reader']}). "
                  f"{interview['publication_approval']}. Comparison status: `{interview['status']}`.", "",
                  "| Public section | Treatment | Reason |", "| --- | --- | --- |"]
        for section in interview["sections"]:
            lines.append(f"| [{section['heading']}](../../{interview['source']}#{section['anchor']}) | "
                         f"`{section['role']}` / `{section['disposition']}` | {section['reason']} |")
        lines += ["", "The final privacy note is editorial context, not speaker evidence."]
        if any(s["disposition"] == "excluded_confidentiality" for s in interview["sections"]):
            lines.append("Confidential omissions are excluded; their editorial placeholders cannot supply attributed quotations.")
        lines.append("")
    lines += ["## Comparisons", ""]
    for item in document["curation"]["mappings"]:
        record = records[item["id"]]
        lines += [f'<a id="{item["id"].lower()}"></a>', f"### {item['id']} — {item['claim']}", "",
                  f"Status: `{record['status']}`; interpretation: `analyst_inference`; "
                  "normative acceptance: `not_requested`; finding: `pending_validation`.", ""]
        if record["recheck_reasons"]:
            lines += ["Recheck required: " + "; ".join(record["recheck_reasons"]) + ".", ""]
        for quote in record["evidence"]:
            if quote["verified"]:
                lines += [f"> {quote['exact_quote']}", "",
                          f"— {quote['speaker']}, [{quote['heading']}](../../{quote['source']}#{quote['source_anchor']}), "
                          f"source line {quote['line']}; [reader](../../{quote['reader']}#{quote['source_anchor']}).", ""]
            else:
                lines += ["Quotation not verified; withheld from this report pending source review.", ""]
        lines += ["**Analyst interpretation.** " + item["interpretation"], "",
                  "**Conditions and limits.** " + item["conditions_and_limits"], "",
                  "**Potential Learn benefit.** " + item["learn_angle"], "",
                  "| Requirement | Relationship / evidence role | Bounded comparison |", "| --- | --- | --- |"]
        for binding in item["bindings"]:
            target = contract["targets"].get(binding["target_id"])
            label = f"[{target['id']}]({target_link(target)})" if target else binding["target_id"] + " (recheck required)"
            lines.append(f"| {label} | `{binding['relationship']}` / `{binding['evidence_role']}` | {binding['explanation']} |")
        lines += [""]
        if record["related_research"]:
            lines += ["Related research discussions (existing assessments are recorded, not revalidated here; a link does not establish independent corroboration):", ""]
            for edge in record["related_research"]:
                lines.append(f"- [{edge['mapping_id']}](../research/traceability.md#{edge['mapping_id'].lower()}) "
                             f"(`{edge['recorded_status']}`, `{edge['recorded_readiness']}`), "
                             f"{edge['relationship']}: {edge['explanation']}")
            lines += [""]
    lines += ["## By requirement", "",
              "Coverage classifications and canonical operations below come from the published contract index. Vector IDs refer to acceptance artifacts, not executed tests or proof of an implementation. CoreDoc rows can have no direct vector or operation; inspect their explicit Spec references in JSON.", ""]
    for tid, ids in resolved["by_target"].items():
        target = contract["targets"].get(tid)
        lines += [f"### {tid}", ""]
        if target:
            lines += [f"[{target['path']}]({target_link(target)}); modality: " + ", ".join(target["modalities"]) + ".", "",
                      target["statement"], ""]
            coverage = target.get("coverage")
            lines += [(f"Coverage: **{coverage['classification']}** — {coverage['scope_note']}" if coverage else
                       "Coverage: no direct classification; this is not a coverage claim."), "",
                      "Vectors: " + (", ".join(f"[{v}](../../{contract['vectors'][v]['path']})" for v in target["vector_ids"]) or "none directly linked") + ".", "",
                      "Canonical operations: " + (", ".join(f"[{o}](../../agentic/operations.md)" for o in target["agentic_operation_ids"]) or "none directly linked") + ".", ""]
        lines += ["Comparisons: " + ", ".join(f"[{mid}](#{mid.lower()}) ({records[mid]['status']})" for mid in ids) + ".", ""]
    lines += ["## Maintenance and limits", "",
              "See [tool usage](tools/README.md). Only `traceability.json.curation` is editable. The `resolved` section and this report are generated. New interviews require explicit registration and section classification; directory discovery never approves or publishes a draft. Changed interviews, clauses, or related research curation require an explicit semantic recheck. Rebuilding does not refresh reviewed fingerprints.", "",
              "The shared research contract reader supplies explicit CoreDoc/Spec references, manifest-discovered vectors, published coverage limits, and registry-listed Agentic operations. No lexical similarity or historical implementation creates a requirement. The specification-first process remains necessary for any proposed financial behavior; this index is not a publication gate."]
    return "\n".join(lines) + "\n"


def build(repo=REPO, check=False, preview=False):
    repo = repo.resolve()
    path = inside(repo / "experts/legacy", repo / "experts/legacy/traceability.json")
    report = inside(repo / "experts/legacy", repo / "experts/legacy/traceability.md")
    original = path.read_bytes()
    document = json.loads(original)
    if document.get("schema_version") != VERSION:
        raise ValueError("Unsupported Legacy comparison format")
    # Validate curation before processing as well as the completed output.
    validate_schema({**document, "resolved": None})
    contract = read_contract(repo)
    document["resolved"] = resolve(repo, document, contract)
    validate_schema(document)
    data, markdown = encoded(document), render(document).encode("utf-8")
    if path.read_bytes() != original:
        raise ValueError("Legacy curation changed during build")
    for relative, expected in {**contract["files"], **document["resolved"]["inputs"]}.items():
        if sha(inside(repo, repo / relative).read_bytes()) != expected:
            raise ValueError("Input changed during build: " + relative)
    if check:
        if original != data or not report.exists() or report.read_bytes() != markdown:
            raise ValueError("Legacy traceability is stale; rebuild")
        if any(r["status"] == "needs_recheck" for r in document["resolved"]["records"]) or any(
                i["status"] == "needs_recheck" for i in document["resolved"]["interviews"]):
            raise ValueError("Legacy comparisons require semantic recheck")
    elif not preview:
        atomic_write(path, data)
        atomic_write(report, markdown)
    return document


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=REPO)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--target", help="Look up a CoreDoc or Spec requirement")
    mode.add_argument("--interview", help="Look up an explicitly registered interview, e.g. LEGACY-001")
    args = parser.parse_args(argv)
    try:
        document = build(args.repo_root, check=args.check, preview=bool(args.target or args.interview))
        if args.target or args.interview:
            ids = document["resolved"]["by_target" if args.target else "by_interview"].get(args.target or args.interview, [])
            print(encoded({"mapping_ids": ids, "records": [r for r in document["resolved"]["records"] if r["mapping_id"] in ids]}).decode(), end="")
        else:
            print(json.dumps(document["resolved"]["counts"]))
            print((args.repo_root / "experts/legacy/traceability.json").resolve())
            print((args.repo_root / "experts/legacy/traceability.md").resolve())
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f"Legacy traceability failed: {error}\n")


if __name__ == "__main__":
    main()
