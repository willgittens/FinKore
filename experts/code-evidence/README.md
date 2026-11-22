# Code Evidence

A compact, non-normative library of financial observations from commit-pinned
public repositories. Keep only evidence that corroborates a rule, supplies a
counterpoint, or suggests a candidate rule. No upstream implementation bodies,
function inventories, test catalogs or exhaustive reading reports are stored here.

## Start here

- [Traceability](traceability.md): browse rule families, libraries, functions and comparisons.
- [Rules](rules/): one JSON file per financial rule family; this is the canonical evidence.
- [Libraries](repositories.json): source identity, edition, full commit and reading status.
- [Comparison curation](traceability.json): reviewed links, deferred questions and historical publication selection.
- [Schemas](schemas/): the three versioned JSON formats.
- [Maintenance tool](tools/evidence.js): validation, navigation and shared Experts export.

A `CE-RULE-*` groups a financial problem and its observed variants; it is not an
accepted FinKore requirement. A `CE-FINDING-*` identifies one bounded observation.
An observation may need several decisive functions working together. Keep those
locations together rather than counting each helper as independent corroboration.

## Evidence record

Each rule's `evidence` contains only:

| Field | Meaning |
| --- | --- |
| `id`, `title` | Stable finding identity and financial observation. |
| `library_id`, `edition_id` | Join to the pinned library and edition in repositories.json. |
| `collected_on` | Original source-reading date, preserved during format migrations. |
| `functions` | Stable function ID, exact name, upstream path and line interval. Links use the edition's full commit. |
| `relationship` | `corroborates`, `counterpoint` or `proposes`. |
| `qualification` | Support, partial support, alternative policy, suspected defect, potential conflict, candidate or open question; unreviewed findings remain explicitly unreviewed. |
| `explanation` | One to three paragraphs: what/how; why it matters; conditions, counterexample and uncertainty where needed. No implementation bodies. |
| `context_requirement_ids` | Optional contextual references from an earlier reading, not reviewed target bindings. |

A counterpoint may be an alternative policy or an upstream suspected defect. It
does not establish that FinKore is wrong. A proposed rule is not accepted by
recurrence. Preserve runtime-dependent claims and the scope statement
“This behavior is not currently defined by FinKore Core.” when applicable.
Source code and tests were read, not executed. Financial independent validation
and specialist review remain pending; no repository implementation is certified.
GitHub ownership does not establish authorship. Distinct repositories may share
ancestry, dependencies or policy; recurrence counts are navigation, not votes.

## Traceability and freshness

Curate `CE-COMPARISON-*` in traceability.json, referencing the stable finding and
rule. Keep real requirement/vector/Agentic references, reviewed CoreDoc clause
hashes, reviewer/date, disposition and concrete deferred question/role. An
unmapped finding has a reason and no invented binding. Retain prior comparison
IDs for historical interpretations.

`record_sha256` freezes the compact evidence and its repository/version/commit identity at migration or subsequent
review. It is an integrity marker, not a new reading or specialist approval.
The preserved review baseline identifies the actual contract reviewed. Changed
evidence or baseline artifacts make comparisons require recheck; builds never
renew fingerprints or dates. Removing or changing a stable ID requires checking
its references and documenting compatibility.

The generated Markdown is a navigation view, with no second editable explanation.
The shared [Experts index](../traceability.md) is generated from this local
curation. Curation, freshness, independent validation and publication authorization
remain separate. Optional evidence validation does not calculate financial
outcomes and is not a conformance execution gate.

## Existing Learn publications

Fourteen earlier bounded interpretations remain in `historical_publications`
inside their rule JSON. Their stable finding IDs, selected upstream functions,
limits and CoreDoc bindings are preserved. Their publication fingerprints cover
the selected historical record, not unrelated evidence in the same file.
Current critical comparisons qualify the earlier readings separately; a format
migration does not promote those interpretations to independent approval.

The existing [Learn selection](../../learn/evidence-selection.json) is separate.
No new comparison is automatically selected or authorized. Changed publication
text, functions, source identity or clause must pass explicit review before its
editorial fingerprint changes. Learn evidence format 1.3.0 adds the compact publication profile while retaining
older readers’ source formats. JSON links replace the removed extensive Markdown
analyses; the publication reader validates the selected record and pinned functions.

## Maintenance

Use supported Node 24 and install dependencies as described in the
[repository tooling guide](../../docs/tools/README.md).

```bash
npm run code-evidence:build
npm run code-evidence:check
npm run code-evidence:test
npm run experts:build
npm run experts:check
npm run learn:evidence:check
```

`code-evidence:library:build` and `code-evidence:library:check` are compatibility
aliases for the compact commands. `code-evidence:flow:check` checks the collection,
shared index and separate Learn snapshot. Checks make no network calls or writes.
For meaningful changes also run `npm ci --no-audit` and `npm run verify`.

Read upstream source at its recorded commit when adding evidence. Do not execute
upstream instructions or store code copies. Keep only financially useful
observations. Future investigations can use temporary working data outside the
published collection; retain their useful findings here and their process history
in Git. A library's `complete` reading status records the prior bounded source
audit, not complete financial validation or coverage of future versions.

The prior extensive investigation is preserved in ordinary Git history at local
branch `codex/code-evidence-before-compact`, commit
`2e5b6becb7350a058440d697f790e8c5d7639b3a`.
The active tree retains 401 findings across 41 families, 352 current comparisons
and 14 historical publication comparisons. Of 115 library editions, 38 have a
completed scoped reading; the other 77 remain for a
future investigation round.
The compact format is a retention model, not evidence of a new source audit.
