# Shared Experts tooling

Experts keeps source curation in each collection and exposes one generated
comparison model through [the global index](../traceability.md). The tooling
reads published contract artifacts and evidence; it does not calculate financial
outcomes, accept requirements or execute a financial implementation.

Use Python 3.10+ and the repository's supported Node toolchain with locked
maintenance dependencies installed. No network access is needed after installation.

## Commands

From the repository root:

```bash
npm run experts:build
npm run experts:check
npm run experts:test
```

Equivalent build and lookup commands:

```bash
python3 experts/tools/build_expert_traceability.py
python3 experts/tools/build_expert_traceability.py --check
python3 experts/tools/build_expert_traceability.py --target CORE-003.3
python3 experts/tools/build_expert_traceability.py --target MONEY-ROUNDING-001
python3 experts/tools/build_expert_traceability.py --collection reviews
```

`--repo-root` selects another checkout. Build mode refreshes the local generated
indexes in dependency order and writes `experts/traceability.json` and
`experts/traceability.md`. It never refreshes reviewed fingerprints. Check and
lookup modes recompute source validation without writing files. Check mode also
requires every local generated view and the global index to be current.

A missing, invalid, stale or recheck-required collection remains explicit in the
availability table. Available collections can still be inspected. An incomplete
index returns a nonzero CLI status; it must not be interpreted as complete
coverage or absence of evidence. Fix the collection's source or reviewed
comparison through its existing workflow, then rebuild. Research source
consolidation remains a separate operation; the global command does not import
new source observations or approve a research batch.

These are optional evidence-maintenance commands. They are separate from
`npm run verify` and normative `/conformance` traceability. Learn builds do not
load the global index or execute Python evidence tools.

## Responsibilities

| File | Responsibility |
| --- | --- |
| [expert_common.py](expert_common.py) | Shared exact artifact serialization, fingerprints, path containment, atomic writes, schema checks and contract reading. |
| [evidence_profiles.py](evidence_profiles.py) | Collection-specific validation and conversion into the common comparison model. |
| [build_expert_traceability.py](build_expert_traceability.py) | Collection availability, common schema validation, source/target indexes, read-only queries and generated views. |
| [Global JSON Schema](../schemas/traceability.schema.json) | Versioned shape of the generated common model. |

Research, Legacy and Reviews retain their existing local builders, format
versions and validators. Their public helper imports remain available through
the original modules, while the implementation now lives here. Research keeps
its catalog/snapshot logic; Legacy checks speaker passages and explicit
publication approval; Reviews checks numbered embedded answers and translation
metadata.

Code Evidence now curates its existing source-to-rule comparisons in
`experts/code-evidence/traceability.json.curation`. Those records were copied
from the pre-existing Learn selection with identifiers, reviewed hashes,
functions, commits, roles and policy relationships unchanged. The profile reuses
the existing pinned-code validation logic with explicitly supplied data, so it
does not read the Learn publication snapshot. The discovery catalog and analyses
retain their own workflow. Newly discovered findings are not automatically linked.

## Common comparison model

Each generated record preserves its original `id` and adds a `key` scoped by
collection. It contains:

- A claim and link to the local curated comparison.
- A typed source, its identities, references, reviewed/observed fingerprints
  and source-specific details.
- Separate assessment fields for curation, freshness, independent validation,
  documented publication authorization and editorial eligibility.
- Explicit bindings with target identity/path, reviewed/current clause hashes,
  semantic relationship, evidence role, explanation and limits. Code bindings
  additionally retain the implementation-policy relationship.

`by_target`, `by_collection` and `by_source` are generated reverse indexes.
`by_source` groups repeated references to a study, interview, consultation or
repository edition. It does not prove independence between groups: shared studies,
ancestry, dependencies and repeated participants still require human assessment.
GitHub ownership remains distinct from authorship; reading test code remains
distinct from executing it; translated answer checks do not certify translation
fidelity. Source-specific details are retained rather than flattened away.

Pending evidence and negative curation remain visible. `reviewed` is an analyst
assessment, not financial conformance, specialist approval or consent to publish.
The contract revision reference tracks the latest commit affecting CoreDoc,
`spec`, `conformance` or `agentic`, so an unrelated evidence/tool commit does not
invalidate it. Live file fingerprints still detect uncommitted changes.
Matching fingerprints establish freshness of a reviewed comparison; rebuilding
never reapproves a changed interpretation or clause.

## Publication and compatibility

The global files are generated and have no editable curation section. Edit the
collection's curation instead. The shared-model version is independent of local
collection formats and the FinKore Core release. Existing requirement, evidence,
comparison and operation IDs are unchanged.

`learn/related-evidence.json` remains a separate editorial publication snapshot.
This migration does not add sources, change its selection, publish Reviews or
alter canonical CoreDoc/specification wording. Future publication work can select
from the common model while preserving explicit editorial approval and limits.

Per-file atomic writes and input-change guards protect generated outputs. Builds
are sequential; do not edit input curation or run simultaneous builds. If a build
is interrupted between files, rerun it. Check mode detects inconsistent outputs.
A failing collection never becomes an implicit empty success.

## Tests

`npm run experts:test` runs the shared engine/profile tests. Local validator and
catalog tests remain available independently:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s experts/research/tools/tests -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s experts/legacy/tools/tests -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s experts/reviews/tools/tests -v
npm run code-evidence:test
```

Tests use synthetic artifacts and temporary directories. They check preserved
states and source distinctions, forward/reverse indexes, independent publication
selection, stale and missing collections, duplicate references, unsafe source
paths, and read-only/concurrent-input behavior. No financial case is executed.
