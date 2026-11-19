# SPDX-License-Identifier: MPL-2.0
# Shared evidence-maintenance utilities read contract artifacts, validate local
# data and write generated indexes atomically. They do not define or execute
# financial behavior, approve comparisons or publish content.
"""Common artifact and contract support for optional Experts evidence tooling."""

import hashlib
import json
import os
import re
import subprocess
import tempfile
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
RELATIONSHIPS = {"already_addressed", "possible_gap", "possible_conflict", "application_policy",
                 "deferred_scope", "outside_scope", "unverified"}
ROLES = {"supports_rationale", "illustrates_risk", "limits_claim", "counterpoint", "context_only"}


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")


def inside(root, path):
    resolved = path.resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError(f"Path escapes allowed directory: {path}")
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


def sha(value):
    return hashlib.sha256(value if isinstance(value, bytes) else encoded(value)).hexdigest()


def normal(text):
    return " ".join(text.split())


def slug(text):
    text = re.sub(r"<[^>]*>|[`*_~]", "", text).strip().lower()
    return re.sub(r"\s+", "-", "".join(c for c in text if c.isalnum() or c.isspace() or c in "_-"))


def references(text, known=None):
    """Expand explicit ID lists/ranges. Never infer meaning from word similarity."""
    text = re.sub(r"\[([^\]]*)\]\([^)]+\)", r"\1", text).replace("`", "").replace("*", "")
    pattern = re.compile(r"(?<![\w-])([A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-\d{3}(?:\.\d+)?)\b(?!\d|\.\d)|-(\d{3}(?:\.\d+)?)\b(?!\d|\.\d)|(?<=/)(\d{3}(?:\.\d+)?)\b(?!\d|\.\d)")
    found, previous = set(), None
    for match in pattern.finditer(text):
        full, abbreviated = match[1], match[2] or match[3]
        gap = text[previous[1]:match.start()].strip() if previous else ""
        is_range = previous is not None and gap in {"to", "through", "–", "—", "-"}
        if full:
            target = full
        elif previous and (is_range or re.fullmatch(r"(?:[,;/\s]|and|or)+", gap or "/")):
            prefix = re.match(r"(.+-)\d{3}(?:\.\d+)?$", previous[0])[1]
            target = prefix + abbreviated
        else:
            continue
        if is_range:
            start = re.fullmatch(r"(.+-)(\d{3})", previous[0])
            end = re.fullmatch(r"(.+-)(\d{3})", target)
            if not start or not end or start[1] != end[1] or int(start[2]) > int(end[2]):
                raise ValueError(f"Invalid identifier range: {previous[0]} through {target}")
            found.update(start[1] + f"{i:03d}" for i in range(int(start[2]), int(end[2]) + 1))
        else:
            found.add(target)
        previous = (target, match.end())
    if known is not None and (unknown := found - set(known)):
        raise ValueError("Unknown explicit requirement IDs: " + ", ".join(sorted(unknown)))
    return sorted(found)


def read_contract(repo):
    repo = repo.resolve()
    files, texts = {}, {}
    def read(relative):
        path = inside(repo, repo / relative)
        data = path.read_bytes()
        files[relative] = sha(data)
        texts[relative] = data.decode("utf-8")
        return texts[relative]
    targets = {}
    core_path = "docs/coreDoc/core-doc.md"
    core = read(core_path)
    headings = list(re.finditer(r"^### (CORE-\d{3}\.\d+) [—-] (.+)$", core, re.M))
    for index, match in enumerate(headings):
        block = core[match.end():headings[index + 1].start() if index + 1 < len(headings) else len(core)]
        # The final rule ends at the next level-two heading, not the rest of CoreDoc.
        block = re.split(r"^## ", block, maxsplit=1, flags=re.M)[0]
        rule = re.search(r"\*\*Rule\*\*\s*(.*?)(?=\n\*\*|$)", block, re.S)
        if not rule:
            raise ValueError("CoreDoc rule missing: " + match[1])
        statement = normal(rule[1])
        context = normal(block)
        targets[match[1]] = {"id": match[1], "layer": "coredoc", "title": match[2], "path": core_path,
                             "anchor": slug(match[0].lstrip("# ")), "statement": statement,
                             "clause_sha256": sha({"title": match[2], "context": context}),
                             "modalities": sorted(set(re.findall(r"\b(?:SHALL NOT|SHALL|MUST NOT|MUST|SHOULD NOT|SHOULD|MAY)\b", statement))),
                             "explicit_spec_references": []}
        scope = block.split("**Relevant FinKore domains**", 1)
        if len(scope) == 2:
            targets[match[1]]["explicit_spec_references"] = references(scope[1])
    for path in sorted((repo / "spec").rglob("*.md")):
        relative = path.relative_to(repo).as_posix()
        text = read(relative)
        matches = list(re.finditer(r"^\s*- \*\*([A-Z][A-Z0-9-]+-\d{3})\*\*\s*[—-]\s*(.+)$", text, re.M))
        for match in matches:
            continuation = text[match.end():].split("\n\n", 1)[0]
            if continuation.lstrip().startswith(("- ", "#")):
                continuation = ""
            statement = normal(match[2] + " " + continuation)
            if not re.search(r"\b(?:MUST|SHOULD|MAY)\b", statement):
                continue
            rid = match[1]
            if rid in targets:
                raise ValueError("Duplicate normative identifier: " + rid)
            targets[rid] = {"id": rid, "layer": "spec", "title": rid, "path": relative,
                            "anchor": None, "statement": statement, "clause_sha256": sha(statement),
                            "modalities": sorted(set(re.findall(r"\b(?:MUST NOT|MUST|SHOULD NOT|SHOULD|MAY)\b", statement)))}
    if not targets:
        raise ValueError("No contract requirements found")
    specs = {k for k, v in targets.items() if v["layer"] == "spec"}
    for target in targets.values():
        for rid in target.get("explicit_spec_references", []):
            if rid not in specs:
                raise ValueError("Unknown CoreDoc reference: " + rid)
    coverage = read("conformance/traceability.md")
    classifications = {"COVERED", "PARTIAL", "NOT DIRECTLY TESTABLE", "UNCOVERED", "DEFERRED", "BLOCKING SPEC GAP"}
    for line in coverage.splitlines():
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) >= 5 and cells[0] in specs and cells[3] in classifications:
            targets[cells[0]]["coverage"] = {"classification": cells[3], "scope_note": cells[4], "source": "conformance/traceability.md"}
    vectors, by_requirement = {}, defaultdict(list)
    manifest = json.loads(read("conformance/manifest.json"))
    for suite in manifest["suites"]:
        for name in suite["vectorFiles"]:
            path = inside(repo / "conformance", repo / "conformance" / name)
            relative = path.relative_to(repo).as_posix()
            data = json.loads(read(relative))
            for vector in data["vectors"]:
                vid = vector["id"]
                if vid in vectors:
                    raise ValueError("Duplicate conformance vector: " + vid)
                if set(vector["requirements"]) - specs:
                    raise ValueError("Unknown vector requirement: " + vid)
                vectors[vid] = {"id": vid, "path": relative, "operation": vector["operation"], "requirements": vector["requirements"]}
                for rid in vector["requirements"]:
                    by_requirement[rid].append(vid)
    operations = {}
    registry = read("agentic/operations.md")
    read("agentic/safety.md")
    read("agentic/effects.md")
    for line in registry.splitlines():
        if not re.match(r"^\| `finkore\.", line):
            continue
        cells = [c.strip().strip("`") for c in line.strip("|").split("|")]
        if len(cells) != 8:
            raise ValueError("Unsupported Agentic registry row")
        operation = cells[0]
        if operation in operations:
            raise ValueError("Duplicate canonical operation: " + operation)
        operations[operation] = {"id": operation, "path": "agentic/operations.md", "requirements": references(cells[7], specs),
                                 "state_mutation": cells[2], "financial_state_mutation": cells[3], "determinism": cells[4], "audit_production": cells[5]}
    for rid, target in targets.items():
        target["vector_ids"] = sorted(by_requirement[rid])
        target["agentic_operation_ids"] = sorted(op for op, data in operations.items() if rid in data["requirements"])
        target["coredoc_ids"] = sorted(cid for cid, data in targets.items() if rid in data.get("explicit_spec_references", []))
    version = re.search(r"\*\*CoreDoc version:\*\*\s*(.+)", core)
    try:
        # Evidence/tool commits do not change the contract baseline. Live file
        # fingerprints still detect uncommitted and committed contract changes.
        revision = subprocess.check_output(
            ["git", "log", "-1", "--format=%H", "--", "docs/coreDoc", "spec", "conformance", "agentic"],
            cwd=repo, text=True, stderr=subprocess.DEVNULL).strip() or None
    except (OSError, subprocess.CalledProcessError):
        revision = None
    return {"core_version": version[1] if version else None, "repository_revision": revision,
            "files": files, "targets": targets, "vectors": vectors, "operations": operations}


def target_link(target):
    return "../../" + target["path"] + ("#" + target["anchor"] if target.get("anchor") else "")


def validate_schema(document, schema, repository=REPO, label="Evidence"):
    """Use installed Ajv and local data only; validation never downloads schemas."""
    script = """
import Ajv from 'ajv/dist/2020.js';
import {readFileSync} from 'node:fs';
const validate = new Ajv({allErrors:true}).compile(JSON.parse(readFileSync(process.argv[1], 'utf8')));
if (!validate(JSON.parse(readFileSync(0, 'utf8')))) {
  console.error(JSON.stringify(validate.errors)); process.exit(1);
}
"""
    result = subprocess.run(["node", "--input-type=module", "-e", script, str(schema)],
                            input=encoded(document), capture_output=True, cwd=repository)
    if result.returncode:
        raise ValueError(label + " schema validation failed: " + result.stderr.decode(errors="replace"))


def verify_inputs(root, inputs):
    """Detect concurrent input changes without modifying or approving evidence."""
    for relative, expected in inputs.items():
        if sha(inside(root, root / relative).read_bytes()) != expected:
            raise ValueError("Input changed during build: " + relative)


def markdown_cell(value):
    """Keep untrusted source labels literal in generated Markdown tables."""
    return str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('|', '&#124;').replace('[', '&#91;').replace(']', '&#93;').replace('\n', ' ')
