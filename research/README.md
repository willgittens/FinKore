# Cumulative research memory

`manifests/` is the staging area for new sessions. After import, the unified
catalog and its snapshots become the permanent reference; the original session
files are no longer required. The catalogs below let you recognize works already
investigated in any session while preserving previous queries, versions,
limitations, evidence, and interpretations. They contain research data, not
financial specifications or normative approval.

| File | Purpose |
| --- | --- |
| [allSeen.json](allSeen.json) | Reading and attempt history, actual reading extent, sources, linked findings, and follow-up indicators. Consult it before reopening a work. |
| [allPublications.json](allPublications.json) | All discovered publication identities, deduplicated through compatible identifiers, with occurrences by session and metadata variants. Includes works not yet investigated. |
| [allSessions.json](allSessions.json) | Sessions, topics, original parameters, imported versions, and format interpretation warnings. |
| [allFindings.json](allFindings.json) | Index of original findings, `REV-*` considerations, and `EVD-*` evidence, including revision history and existing quotations. |
| [allFindings.md](allFindings.md) | Human-readable critical review. `--unify-links` can retarget session links to snapshots without changing conclusions or quotations. |
| [catalog/state.json](catalog/state.json) | Persistent registry of sessions, versions, identities, and redirects. Used to rebuild the four JSON indexes. |
| `catalog/snapshots/<sha256>.gz` | Immutable, lossless copies of imported files, compressed to avoid duplicating large amounts of raw metadata. These are not PDFs. |
| [traceability.json](traceability.json) | Curated research-to-contract comparisons, reviewed clause fingerprints, generated contract inventory, and reverse indexes. |
| [traceability.md](traceability.md) | Human-readable navigation by consideration, requirement, domain, and related discussion. |

## Update after each session

Requires **Python 3.10+ on Linux/macOS**, using only the standard library. No
service, local model, credentials, or additional Python package is required.

From the repository root:

```bash
python3 research/tools/consolidate_research.py
```

The command discovers all `research/manifests/*/` directories, adds new sessions
and versions offered for import, and updates the indexes. Previously unified
sessions are read from snapshots even if their directories have been removed.
Run it after Scout and Analyst; you can also run it before building a new reading
queue. After Reviewer, use the following option to make report links independent
of staging directories:

```bash
python3 research/tools/consolidate_research.py --unify-links
```

This option preserves the previous report version and replaces only session link
destinations with verified files in `catalog/snapshots/`, adding a storage note.
It does not rewrite considerations or evidence. Running it again without changes
preserves the same IDs, versions, and output bytes.

Workflow for a new investigation:

1. Generate the new manifest in its own session directory, as usual.
2. Run the consolidator and look up identifiers in `allSeen.json`.
3. Reuse previous triage when intent and version are compatible. Preserve the new
   context in the catalog when importing the session.
4. Investigate new sources and relevant follow-up questions; record the results
   in the session's `findings.md`. Identify the previous origin when reusing a finding.
5. Run the consolidator again. After critical review, run it with `--unify-links`
   and verify with `--check`. Staging directories can be discarded after import;
   their absence does not invalidate unified data or reviews.

To look up a DOI or search for a title without writing files:

```bash
python3 research/tools/consolidate_research.py --lookup '10.29284/9q3b2060'
python3 research/tools/consolidate_research.py --lookup 'transaction consistency' --limit 10
```

To check snapshots, indexes, and available new inputs:

```bash
python3 research/tools/consolidate_research.py --check
```

`--check` is read-only and returns a nonzero exit code for changes, missing derived
files, corruption, or incompatible versions. A `--lookup` query does not
automatically check the freshness of every file; run `--check` before using a
lookup to decide the next batch.

The default destination is derived from the script's location and is independent
of the current directory. `--research-root /absolute/path/research` selects another
research tree. Each original manifest identifies the search context and web
reading queue during import. After import, that context resides in the catalog.
Local PDF downloading has been discontinued.

## What “already seen” means

`allSeen.json` includes **documented attempts**, not just papers that were read.
Each entry distinguishes:

- `inaccessible`: access was attempted, but no readable content was obtained;
- `metadata_only`: metadata only;
- `abstract_only`: an abstract or excerpts from it;
- `partial_text`: portions of the text;
- `full_text_reviewed`: full reading reported in the notebook;
- `unknown`: a missing or unrecognized format, with a warning for manual review.

`status.source_text_read` is true only for abstract, partial, or full reading.
`best_reported_reading_extent` preserves the greatest recorded extent without
erasing later unsuccessful attempts. The complete history remains in
`reading_history`; original notes preserve pages, URLs, and limitations. These
fields reproduce what the notebooks report without checking the web again.
A discovery summary, downloaded PDF, or metadata record does not count as reading.
Zero findings does not mean there is no relevant content.

`repeat_policy.skip_initial_triage_for_same_intent` allows **reuse of initial
triage** after checking intent and edition. It does not mean ignoring the work
in every investigation. `eligible_for_deeper_reading` and `needs_follow_up` keep
partial sources, access failures, and limited reviews visible. A change in topic,
version, source, evidence, or FinKore baseline may justify another analysis.
Full reading does not automatically resolve attribution or validation.

The index does not promote findings: `pending_validation`, negative dispositions,
author discrepancies, exact quotations, and Reviewer limitations are preserved.
In `allFindings.json`, `exact_quote` simply copies the quotation from the report;
the consolidator does not verify it or give it additional authority.

## Research-to-contract traceability

The [traceability view](traceability.md) connects existing REV/EVD/work identities
to precise CoreDoc and specification requirements. It then attaches published
conformance and canonical Agentic references. It is a research comparison layer;
CoreDoc, specifications, Conformance, Agentic, and Learn are read-only inputs.
No normative document or publication decision depends on this layer.

```bash
python3 research/tools/build_traceability.py
python3 research/tools/build_traceability.py --check
python3 research/tools/build_traceability.py --target MONEY-ROUNDING-001
python3 research/tools/build_traceability.py --finding REV-0001
```

Run the consolidator first if source research has changed. The builder requires
the unified catalog to be current and does not require original manifest folders.
It uses only local repository artifacts and existing research reviews; it does
not repeat academic discovery, reopen sources, download papers, or run financial
behavior. `--repo-root` and `--research-root` support explicit locations.

`traceability.json` separates two kinds of data:

- `curation` contains the deliberate comparisons. Each mapping records a bounded
  claim, source versus reviewer interpretation, evidence IDs, conditions, Learn
  angle, contract relationship, and the exact clauses examined. Edit this section
  only after substantive review. Its fingerprints record what was actually
  reviewed; do not replace them merely to make a check pass.
- `resolved` is generated. It contains current clause text/modality, explicit
  CoreDoc-to-spec references, manifest-listed vectors, published coverage labels,
  canonical Agentic operations, current source fingerprints, recheck reasons,
  and indexes by requirement/domain. Do not edit this section or the Markdown
  view manually.

Contract relationship and evidence role are separate. For example,
`already_addressed` describes contract scope, while `illustrates_risk` or
`limits_claim` describes how the source is used. A methodological or architectural
discussion can be useful without justifying a new financial obligation.

New considerations enter `pending_curation` automatically. Limited and negative
reviews stay visible. IDs mentioned in a review are listed as **uncurated
reference candidates**, not accepted links. Word similarity does not approve a
relationship. `related_findings` compares claims and conditions; it does not
establish independent studies or duplicate paper identities.

Changes to a reviewed clause, review, evidence quotation, or source readiness
produce `needs_recheck`; the builder never updates reviewed fingerprints on its
own. `--check` is read-only and fails for stale generated output or a mapping
requiring recheck. Lookup options provide a read-only preview of current targets
and assessments even when a relationship needs re-evaluation.

`reviewed` means a bounded research-to-contract comparison was curated.
`learn_eligible` means eligible for editorial review, not approved for publication.
Findings remain `pending_validation`, and normative acceptance is `not_requested`.
An absent research link does not establish a specification gap. A vector reference
does not establish executed, exhaustive, or implementation conformance evidence.
Conformance-local operations are never promoted into the Agentic registry.

Exact quotations, verified attribution, URLs, and page/section locators remain
in the referenced EVD catalog entries in `allFindings.md` and `allFindings.json`;
the traceability layer references them without duplicating quotations or claiming
to have independently verified the original studies.

The [traceability JSON Schema](schemas/traceability.schema.json) versions this
format separately from FinKore and the cumulative research catalog. Its Python
tests run with the other research-tool tests below. The CLI checks operational
invariants without requiring an installed JSON Schema validator.

## Identity, context, and preserved information

- DOIs are normalized without regard to case; DOI prefixes and `doi.org` URLs are
  recognized. OpenAlex and Semantic Scholar have separate namespaces. Identifiers
  from unknown namespaces remain opaque.
- The persistent `work_id` does not change when better metadata arrives. If a
  later occurrence explicitly links previously separate identities without a
  DOI conflict, one survives and the others are retained in `redirects`.
- Matching titles, preprints, deposits, and publisher editions **are not
  automatically merged**. Different DOIs remain separate even if a provider
  identifier conflates them; `identity_conflicts` requires investigation before
  skipping. Deduplication does not certify study or dataset independence.
- The `metadata` view selects the first recorded non-null value for lookup,
  without asserting that it is correct or current. `metadata_variants` preserves
  different values and their origins. `metadata_conflicts` identifies variations,
  which can also be legitimate updates, such as citation counts.
- Relevance, queries, and other investigation-specific data remain in
  `occurrences[].metadata` and the session context; no global score is created.
- Each occurrence points to the exact manifest copy and its `json_pointer`.
  Raw provider metadata, future fields, and distinctions between omission and
  `null` remain fully preserved in that copy, even when there is no summary field.
  `source.path` records only the historical import path; `source.snapshot` is
  the file used to retrieve the data. The historical path need not exist.
- Findings use `session_id/FND-*`, and PUB labels are local to a session. REV/EVD
  IDs belong to the consolidated report; the index retains each record's version.
- `is_current` distinguishes the current unified version from earlier versions.
  Removing a publication, notebook, or session from staging does not remove or
  invalidate the imported version. `storage_mode: "unified"` identifies this
  behavior. The catalog can preserve only versions that were actually imported.
- When the report contains Reviewer's input markers, `input_compatibility`
  compares a consideration with the imported manifest and notebook versions.
  Newly imported versions are marked `changed` when they differ from the review;
  without sufficient markers, the value is `unverified`. The previous review is
  preserved without automatically applying it to the new finding version.
  Checking the current FinKore contract remains the responsible agent's task,
  not the catalog's.

`allSessions.json` preserves the complete header of each current manifest.
`queries.json`, `summary.md`, `findings.md`, `downloads.json`, and the review report
have references to their respective copies when available. To recover a file
without changing the originals:

```bash
gzip -dc research/catalog/snapshots/YOUR_SHA256.gz > /tmp/recovered-file.json
```

The hash identifies file bytes, not academic quality or authenticity. Historical
`downloads.json` records preserve results reported by the former download tool;
the catalog neither checks whether the PDFs still exist nor opens them. The local
download tool has been removed. `preliminary-rules.json` and `.rule-mining*` files
from the discarded experiment are not imported as evidence of reading or current
findings.

## Persistence, interruptions, and evolution

Do not edit the JSON indexes manually. Import new observations through staging
notebooks and have the responsible agents update the report. Back up the
**entire** `catalog/` directory and `allFindings.md`; the JSON files at the research
root are rebuildable views. Keeping the original staging directories is optional.
Do not restore those directories just to make the catalog work.

Updates use a POSIX lock to prevent concurrent consolidators, check for input
changes during execution, and publish each file through atomic replacement.
Snapshots are written before persistent state; indexes are written afterward.
There is no single atomic transaction across all five JSON files: an interruption
can leave incomplete indexes or different generations. Run the same command to
rebuild them; `--check` detects the inconsistency. An interruption before the
state is written can leave unreferenced snapshots; no destructive cleanup runs
automatically. Do not remove the lock to resolve concurrency; the operating system
releases the lock when the process exits.

The format uses `schema_version: "1.1.0"`, independent of FinKore Core and the
manifest format. The [JSON Schema](schemas/catalog.schema.json) documents state
and views. The CLI validates operational invariants without requiring an installed
JSON Schema validator. The consolidator automatically migrates state from `1.0.0`
to `1.1.0`, preserving IDs, versions, and snapshots. Previous local-presence flags
are retained only as `legacy_source_present` and do not control validity or
freshness. Input manifests continue to use Research Scout format `1.0.0`.
Unknown state versions are rejected; a future migration must read the previous
version, preserve snapshots and IDs, produce compatible new state, and regenerate
the indexes. Do not change only the version number to force compatibility.

Optional local tests for this research tool:

```bash
python3 -m unittest discover -s research/tools/tests -p 'test_consolidate_research.py' -v
```

They cover deduplication, conflicts, new sessions, removals, versions,
interruptions, corruption, resumption, and the distinction between discovery and
reading. They make no network calls and execute no financial behavior.
