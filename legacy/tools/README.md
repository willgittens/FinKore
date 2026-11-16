# Legacy comparison tools

This optional, offline index relates approved public practitioner interviews to
the current FinKore contract. It does not publish interviews, change financial
behavior, recover private material, or replace specialist validation.

From the repository root, using the maintained Node toolchain and Python 3.10+:

```sh
npm ci --no-audit
python3 legacy/tools/build_legacy_traceability.py
python3 legacy/tools/build_legacy_traceability.py --check
python3 legacy/tools/build_legacy_traceability.py --target MONEY-REPRESENTATION-002
python3 legacy/tools/build_legacy_traceability.py --interview LEGACY-001
python3 -m unittest discover -s legacy/tools/tests -v
```

The default repository path comes from the script location, so these commands
also work with an absolute script path from another working directory.
`--repo-root /absolute/path/to/FinKore` selects another repository tree.
The Python tool uses the existing repository-installed Ajv through Node to
validate JSON Schema, without network access or an additional Python dependency.

Read [traceability.md](../traceability.md) for the human view and
[traceability.json](../traceability.json) for structured comparisons. The format
is versioned independently as `1.0.0` in its
[JSON Schema](../schemas/traceability.schema.json).

Only the JSON `curation` section is editable. It contains the explicit interview
registry, section classifications, exact public quotations, analyst claims,
bounded requirement bindings, related research discussions and reviewed hashes.
The generated `resolved` section contains verified quotation locations, current
assessment statuses, contract excerpts, reverse indexes and counts. A null
`resolved` value is allowed only as a staging input; a successful build always
produces the complete object. Never hand-edit `resolved` or the Markdown report.

Speaker quotations must be exact contiguous text in a public answer paragraph.
The tool checks each against the named section and records source line numbers
and source/reader anchors. Source code blocks, italicized editorial paragraphs,
block quotations and the final H2 privacy note cannot supply speaker evidence.
Each section requires an explicit role and disposition. Editorial omission
notices are not quotations or paraphrases of the omitted answer. Do not consult
private accounts or Git history to fill those omissions.

Publication consent is recorded from the public interview header. It does not
approve the analyst's comparisons, future Learn text, or normative behavior.
`reviewed` describes a bounded analyst comparison; every finding is still
`pending_validation`, with normative acceptance `not_requested`.
`editorial_eligible` means it can be considered by an editor, not published
automatically. A contextual or limiting binding is not an assertion that FinKore
already covers the operational problem.

The builder reuses the [research contract reader](../../research/tools/build_traceability.py).
Requirements and their MUST/SHOULD/MAY distinctions come from CoreDoc and Specs;
vectors come only from `conformance/manifest.json`; coverage classifications and
limits come from the published traceability table; canonical operations come
only from the Agentic registry. Unlinked operations or vectors are not invented.
Linked vectors have not been executed. Only linked targets and their artifacts
are copied into this index, while contract input fingerprints cover the reader's
whole inventory.

Related `MAP-*` IDs point into the [research comparison index](../../research/traceability.md).
Its recorded readiness and status remain visible, including pending evidence.
Those academic sources and research assessments are not revalidated by this
tool. Such links identify related discussions, not independent corroboration or
equivalence between an interview and an academic study.

To add an interview after its existing publication/consent process:

1. Add an explicit `curation.interviews` entry with a unique `LEGACY-NNN` ID,
   approved source path under `legacy/interviews`, published reader under
   `learn`, and the interviewee's name. Unregistered files and drafts are ignored.
2. Classify every H3 section as a public answer, editorial-only text or unreviewed.
   Preserve professional history as `context_only` where no financial comparison
   is warranted; mark confidential omissions `excluded_confidentiality`.
   A section marked `mapped` needs at least one comparison.
3. Add bounded comparisons using unique `LGC-NNNN` IDs. Include an exact public
   quote, analyst interpretation, conditions, Learn benefit, explicit requirement
   IDs and an explanation for each relationship. Never invent a minimum finding
   count or promote an anecdote into a universal rule.
4. Review the current source and target text before recording
   `reviewed_source_sha256`, each `reviewed_clause_sha256`, `reviewed_on`, and any
   `reviewed_curation_sha256` for related research mappings. Current source hashes
   are shown in `resolved.interviews`; current clause hashes are available in
   `research/traceability.json.resolved.contract.targets`. A hash is a change
   detector, not a substitute for semantic review.
5. Build, inspect the report and run `--check`. Source changes, missing or changed
   clauses, new sections and changed related research curation flag comparisons
   for recheck. A build preserves reviewed fingerprints; it never reapproves them.

`--check` and lookup commands write nothing. An invalid/unapproved source fails
the build. Invalid quotations are flagged and omitted from the human report.
Regular builds can record `needs_recheck`; check mode returns failure until an
explicit review and regeneration resolve it. Outputs are replaced atomically
per file, with input-change guards. If interrupted between replacing the JSON
and Markdown files, rerun the builder; check mode detects the inconsistent pair.
Do not run concurrent builds or edit the curation during a build.

This workflow leaves interviews, the Legacy archive page, Learn pages, CoreDoc,
Specs, Conformance and Agentic unchanged. No normative document or publication
gate depends on these optional indexes.
