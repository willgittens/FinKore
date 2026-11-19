# Reviews traceability

`build_review_traceability.py` maintains the optional, non-normative comparison
between specialist reports and exact CoreDoc rules. It reads explicitly
registered reports and their embedded interviews, verifies excerpts inside the
numbered answers, and generates JSON indexes and a Markdown reading view.
It makes no network calls and does not define or execute financial behavior.

Use Python 3.10+ and the repository's supported Node toolchain with locked
dependencies installed. The CLI uses the installed Ajv to validate the local
schema. The shared Experts contract reader supplies current CoreDoc clauses
and their fingerprints; academic catalogs are not required.

Run from the repository root:

```bash
python3 experts/reviews/tools/build_review_traceability.py
python3 experts/reviews/tools/build_review_traceability.py --check
python3 experts/reviews/tools/build_review_traceability.py --target CORE-003.3
python3 experts/reviews/tools/build_review_traceability.py --report ER-0001
```

`--repo-root` selects another checkout. Checks and lookups write nothing.
Reports are discovered only through `traceability.json.curation`, never by
scanning directories or inferring connections from matching terms. No separate
source file or PDF extraction utility is required.

## Embedded interview format

A registered interview anchor immediately precedes its level-two heading:

```markdown
<a id="interview"></a>
## Interview

Translation and attribution note.

<a id="er-0001-q01"></a>
### 1. What happened?

**Answer**

The participant's answer.
```

Questions continue consecutively through the declared `question_count`. Each
anchor must identify the registered report and match the question number.
Every question needs an explicit, nonempty `Answer` block. Another level-two
heading ends the interview section. Duplicate or mismatched anchors fail.
A missing question flags the interview for recheck. Evidence quotes must occur
inside the specified answer, not in a question, another answer or the analysis.

## Curation and change detection

Only `traceability.json.curation` is editable. Register each report's ID,
specialist attribution, scope, path, interview anchor and question count. Record
the original and displayed interview languages and whether the text is original
or an `editorial_translation`. Record publication authorization separately.
Each comparison retains its finding ID, report anchor, dated analyst assessment,
numbered answer, exact displayed excerpt and explicit CoreDoc bindings.

Bindings retain the rule ID, reviewed clause fingerprint, standard evidence
role, explanation and limits. The current format represents comparisons with
existing rules using `already_addressed`; deferred questions remain in the report
without a corroboration binding.

The report fingerprint covers the complete file bytes. The interview fingerprint
covers its embedded section, including question wording, answers and translation
note. CoreDoc fingerprints use the same title-and-normalized-clause-context
algorithm as Research, Legacy and Learn evidence. Rule boundaries and
interpretation are included, not just the mandatory sentence.

`resolved` and `traceability.md` are generated. The forward and reverse indexes
retain paths, comparison and answer anchors, roles and limitations for later
editorial selection. They do not introduce a Learn source kind, publish pages
or modify normative documents. Publication authorization never follows from a
build. Translation status never becomes independent approval.

A changed report, interview or clause, missing report or target, missing finding
anchor, incomplete question sequence, or absent excerpt produces `needs_recheck`.
The human index withholds unverified excerpts. A normal build can record that
status but preserves reviewed fingerprints. `--check` fails on stale outputs or
comparisons requiring recheck. `reviewed` means the analyst-curated binding is
current; independent validation remains `pending_validation`.

Review changes before deliberately updating fingerprints. Excerpt matching
establishes consistency with the displayed interview, not translation fidelity,
source truth or implementation conformance. Rebuilding approves none of these.

Outputs are replaced atomically per file with input-change guards. Do not edit
curation or run concurrent builds during generation. If interrupted between the
JSON and Markdown replacements, rerun the builder. These optional checks remain
independent of normative repository verification.

## Format migration

Format `2.0.0` replaces `1.0.0`'s separate PDF source path and physical-page
locators with an interview anchor, declared question count, language metadata,
embedded-interview fingerprint and numbered-answer references. Preserve report,
finding and CoreDoc identifiers. Review the complete transcript and any
translation before replacing source fingerprints and excerpt text. This changes
the local evidence index format, not the FinKore Core behavioral baseline.

## Tool tests

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s experts/reviews/tools/tests -v
```

Tests use synthetic interviews and temporary directories. They cover answer
selection, exclusion of question and analyst text, source and clause changes,
complete numbering, explicit translations, duplicate and unsafe references,
read-only checks, withheld excerpts and interrupted output. They do not execute
financial cases.

The [global Experts index](../../traceability.md#by-rule) exports these comparisons
in the common model while preserving embedded-answer and translation checks.
See [shared commands](../../tools/README.md) for cross-collection builds and lookups.
