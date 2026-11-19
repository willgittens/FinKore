# SPDX-License-Identifier: MPL-2.0
# Reads reports, their embedded interviews and contract artifacts; writes optional
# Reviews traceability views. It does not define or execute financial behavior.
"""Maintain explicit report-to-CoreDoc comparisons without approving changed evidence."""

import argparse
import json
import posixpath
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO / "experts/research/tools"))
from build_traceability import read_contract, sha, target_link
from consolidate_research import atomic_write, encoded, inside

SCHEMA = Path(__file__).resolve().parents[1] / "schemas/traceability.schema.json"
VERSION = "2.0.0"


def validate_schema(document):
    script = """
import Ajv from 'ajv/dist/2020.js';
import {readFileSync} from 'node:fs';
const validate = new Ajv({allErrors:true}).compile(JSON.parse(readFileSync(process.argv[1], 'utf8')));
if (!validate(JSON.parse(readFileSync(0, 'utf8')))) {
  console.error(JSON.stringify(validate.errors)); process.exit(1);
}
"""
    result = subprocess.run(["node", "--input-type=module", "-e", script, str(SCHEMA)],
                            input=encoded(document), capture_output=True, cwd=REPO)
    if result.returncode:
        raise ValueError("Reviews schema validation failed: " + result.stderr.decode(errors="replace"))


def normal(text):
    return " ".join(text.split())


def interview_content(text, item):
    """Read only the registered interview section and explicitly numbered answers."""
    marker = f'<a id="{item["interview_anchor"]}"></a>'
    markers = list(re.finditer(r"^" + re.escape(marker) + r"$", text, re.M))
    if not markers:
        return "", {}, ["missing_interview"]
    if len(markers) != 1:
        raise ValueError("Duplicate interview anchor")
    remainder = text[markers[0].end():]
    heading = re.match(r"\s*\n## [^\n]+\n", remainder)
    if not heading:
        raise ValueError("Interview anchor must introduce a level-two heading")
    end = re.search(r"^## ", remainder[heading.end():], re.M)
    section = marker + remainder[:heading.end() + end.start() if end else len(remainder)]
    matches = list(re.finditer(r'^<a id="(er-\d{4}-q\d{2})"></a>\n### (\d{1,2})\. ([^\n]+)$', section, re.M))
    answers = {}
    for i, match in enumerate(matches):
        number = int(match[2])
        expected = f"{item['id'].lower()}-q{number:02d}"
        if match[1] != expected or number in answers:
            raise ValueError("Duplicate or mismatched interview question anchor")
        block = section[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(section)]
        answer = re.fullmatch(r"\s*\*\*Answer\*\*\s*\n(.+)", block, re.S)
        if not answer or not answer[1].strip():
            raise ValueError("Interview question must have an explicit nonempty Answer")
        answers[number] = {"anchor": expected, "question": match[3], "body": answer[1].strip()}
    declared = re.findall(r'^<a id="(er-\d{4}-q\d{2})"></a>$', section, re.M)
    if len(declared) != len(set(declared)) or len(declared) != len(matches):
        raise ValueError("Duplicate or malformed interview question anchors")
    problems = [] if list(answers) == list(range(1, item["question_count"] + 1)) else ["interview_question_set_changed"]
    return section, answers, problems


def quote_matches(answers, evidence):
    """Match the displayed excerpt inside the declared answer, not a question or analysis."""
    quote = normal(evidence["quote"])
    answer = answers.get(evidence["question"])
    return bool(quote and answer and quote in normal(answer["body"]))


def report_anchors(text):
    anchors = re.findall(r'^<a id="(er-\d{4}-f\d{2})"></a>$', text, re.M)
    if len(anchors) != len(set(anchors)):
        raise ValueError("Duplicate report finding anchors")
    return set(anchors)


def resolve(repo, document, contract):
    inputs, reports, interviews = {}, {}, {}
    for item in document["curation"]["reports"]:
        if item["id"] in reports:
            raise ValueError("Duplicate report ID: " + item["id"])
        if item["translation_status"] == "original" and item["original_language"] != item["interview_language"]:
            raise ValueError("A translated interview cannot be declared an original-language text")
        report_path = inside(repo / "experts/reviews/reports", repo / item["path"])
        problems, text = [], ""
        if not report_path.is_file():
            problems.append("missing_report")
        else:
            data = report_path.read_bytes()
            inputs[item["path"]] = sha(data)
            if sha(data) != item["reviewed_report_sha256"]:
                problems.append("report_changed")
            text = data.decode("utf-8")
        section, answers, structural = interview_content(text, item)
        problems += structural
        if section and sha(section.encode("utf-8")) != item["reviewed_interview_sha256"]:
            problems.append("interview_changed")
        interviews[item["id"]] = answers
        reports[item["id"]] = {**item, "anchors": report_anchors(text), "recheck_reasons": problems}
    records, by_target, by_report, seen, targets = [], defaultdict(list), defaultdict(list), set(), {}
    for mapping in document["curation"]["mappings"]:
        mid, rid = mapping["id"], mapping["report_id"]
        if mid in seen or rid not in reports or not mid.startswith(rid + "-F"):
            raise ValueError("Duplicate or unscoped mapping: " + mid)
        seen.add(mid)
        report = reports[rid]
        problems = list(report["recheck_reasons"])
        if mapping["report_anchor"] != mid.lower() or mapping["report_anchor"] not in report["anchors"]:
            problems.append("missing_report_anchor")
        verified = all(quote_matches(interviews[rid], item) for item in mapping["evidence"])
        if not verified:
            problems.append("source_quote_or_locator_changed")
        bindings, selected = [], set()
        for binding in mapping["bindings"]:
            tid = binding["target_id"]
            if tid in selected:
                raise ValueError("Duplicate target within mapping: " + mid)
            selected.add(tid)
            target = contract["targets"].get(tid)
            if target is None:
                problems.append("missing_target:" + tid)
            elif target["layer"] != "coredoc":
                raise ValueError("Reviews bindings target CoreDoc rules only")
            else:
                targets[tid] = target
                if target["clause_sha256"] != binding["reviewed_clause_sha256"]:
                    problems.append("clause_changed:" + tid)
            bindings.append({**binding, "target_path": target["path"] if target else None,
                             "current_clause_sha256": target["clause_sha256"] if target else None})
            by_target[tid].append(mid)
        status = "needs_recheck" if problems else "reviewed"
        records.append({**mapping, "status": status, "recheck_reasons": sorted(set(problems)),
                        "report_path": report["path"], "report_sha256": inputs.get(report["path"]),
                        "interview_anchor": report["interview_anchor"], "translation_status": report["translation_status"],
                        "quotes_verified": verified,
                        "publication_status": report["publication_status"],
                        "independent_validation": "pending_validation", "bindings": bindings})
        by_report[rid].append(mid)
    return {"core_version": contract["core_version"], "inputs": inputs,
            "targets": dict(sorted(targets.items())), "records": records,
            "by_target": dict(sorted(by_target.items())), "by_report": dict(sorted(by_report.items())),
            "counts": {"reports": len(reports), "comparisons": len(records), "bindings": sum(len(r["bindings"]) for r in records),
                       "coredoc_rules": len(by_target), "statuses": dict(Counter(r["status"] for r in records))}}


def link(path, anchor=None):
    return posixpath.relpath(path, "experts/reviews") + ("#" + anchor if anchor else "")


def cell(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("|", "&#124;").replace("[", "&#91;").replace("]", "&#93;").replace("\n", " ")


def render(document):
    data = document["resolved"]
    reports = {r["id"]: r for r in document["curation"]["reports"]}
    records = {r["id"]: r for r in data["records"]}
    counts = data["counts"]
    lines = ["# Reviews — CoreDoc traceability", "",
             "<!-- Generated by tools/build_review_traceability.py; edit traceability.json.curation. -->", "",
             f"{counts['reports']} report(s), {counts['comparisons']} comparisons and {counts['bindings']} bindings to {counts['coredoc_rules']} rules. Baseline: {data['core_version']}.", "",
             "The comparisons support a rule's rationale or illustrate its risk. They do not certify implementations or attribute normative approval to the specialist. Multiple passages from one interview are not independent confirmations. Excerpt checks verify the embedded answer text, not the fidelity of a translation to its original language.", "",
             "- [By CoreDoc rule](#by-coredoc-rule)", "- [By report](#by-report)", "- [Evidence and scope](#evidence-and-scope)", "",
             "## By CoreDoc rule", "",
             "| Rule | Comparisons and report |", "| --- | --- |"]
    for tid, mids in data["by_target"].items():
        target = data["targets"].get(tid)
        label = f"[{tid}]({target_link(target)}) — {cell(target['title'])}" if target else tid + " (recheck)"
        lines.append(f"| {label} | " + "; ".join(f"[{mid}](#{mid.lower()}) · [{records[mid]['report_id']}]({link(records[mid]['report_path'], records[mid]['report_anchor'])})" for mid in mids) + " |")
    lines += ["", "## By report", ""]
    for rid, mids in data["by_report"].items():
        report = reports[rid]
        lines += [f"### {rid} — {cell(report['specialist'])}", "", f"[Read the report]({link(report['path'])}) · [Full interview]({link(report['path'], report['interview_anchor'])}).", "",
                  "Contribution: " + cell(report["scope"]) + ".", "",
                  f"Interview language: `{report['interview_language']}`; original language: `{report['original_language']}`; text: `{report['translation_status']}`.", "",
                  "Comparisons: " + ", ".join(f"[{mid}](#{mid.lower()})" for mid in mids) + ".", ""]
    lines += ["## Evidence and scope", ""]
    role_names = {"supports_rationale": "supports the rationale", "illustrates_risk": "illustrates the risk", "limits_claim": "limits the claim", "counterpoint": "counterpoint", "context_only": "context"}
    for record in data["records"]:
        lines += [f'<a id="{record["id"].lower()}"></a>', f"### {record['id']} — {cell(record['claim'])}", "",
                  f"[Report section]({link(record['report_path'], record['report_anchor'])}) · Comparison: `{record['status']}` · Independent validation: `pending_validation`.", ""]
        if record["recheck_reasons"]:
            lines += ["Recheck: " + "; ".join(record["recheck_reasons"]) + ".", ""]
        for evidence in record["evidence"]:
            number = evidence["question"]
            anchor = f"{record['report_id'].lower()}-q{number:02d}"
            lines += [f"Source: [answer {number}]({link(record['report_path'], anchor)}) in the embedded interview.", ""]
            if record["quotes_verified"]:
                lines += ["> " + cell(normal(evidence["quote"])), ""]
            else:
                lines += ["Excerpt withheld: recheck the embedded answer and its location before reuse.", ""]
        for binding in record["bindings"]:
            tid = binding["target_id"]
            target = data["targets"].get(tid)
            label = f"[{tid}]({target_link(target)})" if target else tid + " (recheck)"
            lines += [f"**{label} — {role_names[binding['evidence_role']]}.** " + cell(binding["explanation"]), "",
                      "**Scope.** " + cell(binding["limits"]), ""]
    lines += ["## Maintenance", "",
              "Edit only `traceability.json.curation`. The remaining JSON and this page are generated. Changes to a report, its embedded interview, excerpt locations or CoreDoc clauses require reassessment; rebuilding does not approve changed bindings.", "",
              "Bindings retain paths, anchors, evidence roles and fingerprints for later editorial selection alongside rules. Analyst assessment is separate from publication authorization. This index does not publish Learn pages or create a dependency for the normative contract. See [tool usage](tools/README.md).", ""]
    return "\n".join(lines)


def build(repo=REPO, check=False, preview=False):
    repo = repo.resolve()
    path = inside(repo / "experts/reviews", repo / "experts/reviews/traceability.json")
    report = inside(repo / "experts/reviews", repo / "experts/reviews/traceability.md")
    original = path.read_bytes()
    document = json.loads(original)
    validate_schema({**document, "resolved": None})
    contract = read_contract(repo)
    document["resolved"] = resolve(repo, document, contract)
    validate_schema(document)
    data, markdown = encoded(document), render(document).encode("utf-8")
    if path.read_bytes() != original:
        raise ValueError("Reviews curation changed during build")
    for relative, expected in {**contract["files"], **document["resolved"]["inputs"]}.items():
        if sha(inside(repo, repo / relative).read_bytes()) != expected:
            raise ValueError("Input changed during build: " + relative)
    if check:
        if original != data or not report.exists() or report.read_bytes() != markdown:
            raise ValueError("Reviews traceability is stale; rebuild")
        if any(r["status"] == "needs_recheck" for r in document["resolved"]["records"]):
            raise ValueError("Reviews comparisons require semantic recheck")
    elif not preview:
        atomic_write(path, data)
        atomic_write(report, markdown)
    return document


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=REPO)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--target", help="Look up one CoreDoc rule")
    mode.add_argument("--report", help="Look up one report, e.g. ER-0001")
    args = parser.parse_args(argv)
    try:
        doc = build(args.repo_root, check=args.check, preview=bool(args.target or args.report))
        if args.target or args.report:
            ids = doc["resolved"]["by_target" if args.target else "by_report"].get(args.target or args.report, [])
            print(encoded([r for r in doc["resolved"]["records"] if r["id"] in ids]).decode(), end="")
        else:
            print(json.dumps(doc["resolved"]["counts"]))
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f"Reviews traceability failed: {error}\n")


if __name__ == "__main__":
    main()
