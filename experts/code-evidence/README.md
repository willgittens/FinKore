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
| `conformance` | Optional bounded result: matched/selected case counts and one or two paragraphs describing observed behavior, limitations and execution context. |
| `context_requirement_ids` | Optional contextual references from an earlier reading, not reviewed target bindings. |

A counterpoint may be an alternative policy or an upstream suspected defect. It
does not establish that FinKore is wrong. A proposed rule is not accepted by
recurrence. Preserve runtime-dependent claims and the scope statement
“This behavior is not currently defined by FinKore Core.” when applicable.
The original source readings were static. Later evaluations of published cases,
when present, are recorded in `conformance` on the same finding. Native probes
without a faithful published-case correspondence may be described as dated,
bounded observations in `explanation`; they do not receive a conformance score
or establish execution of FinKore vectors. Financial independent validation
and specialist review remain separate; no whole-library certification is implied.
GitHub ownership does not establish authorship. Distinct repositories may share
ancestry, dependencies or policy; recurrence counts are navigation, not votes.

## Bounded execution results

Rule format 2.1.0 adds an optional `conformance` object to the existing evidence.
Format 2.0.0 remains readable for findings without an execution summary. The
library catalog and comparison curation remain format 2.0.0.

The object contains `passed`, `total` and `description` (one or two paragraphs).
Reuse the comparison's `vector_ids` when those are exactly the selected cases;
use optional `test_ids` only when the execution selection differs. The total is
the entire selected set, including unsupported cases, unmapped native outcomes,
resource-bound observations, conditional cases and infrastructure errors.
The description identifies the execution date, runtime/context, exercised native
path, failed observations and cases that could not yield a comparison. A score
such as 0/1 does not by itself distinguish a mismatch from an unavailable native
operation; read the description. Shared cases across findings are not independent
confirmations or unique test designs.

Each score identifies one primary native profile. Described control profiles
retain their names, outcome counts and case selection: “same test_ids” refers
to the primary selection, with any exceptions stated explicitly. Grouped
controls marked “each” have the stated counts separately. Controls do not add
repeated vectors to the primary score or count as independent libraries.

“Matched” means every required observation matched within the declared profile;
component checks cover only the stated shared obligations. An observation
mismatch can concern value, error, wire shape or required unchanged state.
Numeric trailing zeros alone are not a mismatch. An unmapped native outcome
is an actual exception/rejection without a complete portable comparison; an
unsupported case lacks faithful input, policy or operation correspondence.
A resource bound establishes neither a returned financial result nor
nontermination. A permitted conditional rejection is not a financial failure.
No complete native comparison is inferred from these incomplete outcomes,
and no infrastructure/binding failure is counted as an observed financial defect.

Only existing requirements and their manifest-listed cases are in the current
execution scope. New-rule candidates remain deferred. Run user-authorized
consumer evaluations outside the repository, using the recorded source commit.
Translate representations and native errors without adding missing financial
guards, rounding, allocation or serialization behavior. Construct exact operands;
report unsupported representations or operations rather than repairing inputs.
A native rounding name is usable only when its semantics match the requested
mode. Keep abnormal termination and unexpected exceptions separate from observed
mismatches. Do not retain upstream code, consumer bindings or execution logs here.

Selected-case results require a faithful correspondence between the native
function's responsibility and the assessed requirements. An unguarded native
transition can support a compatible bounded Workflow profile; payload transport,
configuration validation and identifier preflight alone do not execute Audit
append, Requirement-state evaluation or Entity operations. Native component
construction does not implement portable JSON grammar. Describe the shared
component obligations separately from the complete codec contract, and retain
non-equivalent probes as contextual observations.

State the representation mapping and any dependency doubles. Currency must come
from the native Money value or its declared native type, rather than a missing
output field filled from the request. Capture actual serialized JSON without
repairing its field names, units or numeric tokens. A different wire schema is
distinct from monetary precision loss. Compare every required observation,
including native before/after state; identity equality alone is insufficient.
Keep expected results out of native invocation inputs. Unsupported cases remain
in the denominator even when no native financial operation can be invoked. A
fully unsupported score reports applicability limits, not failed financial
behavior. Case design and a reviewed binding profile do not establish execution;
the actual binding, source integrity, dependencies and runtime still need
verification before a later evaluation.

A completed investigation may retain definitive unsupported capabilities,
unavailable native contexts or diagnosed source failures at a frozen edition.
Record their concrete cause and preserve the selected cases and denominator.
This completes their disposition, not native execution or financial conformity.
Do not keep a known source limit labelled as unfinished binding work, substitute
a different precision/version silently, or infer a portable error from an
expected result. Native rejection can be normalized only after the actual call,
using its observed cause and reviewed source path; component text admission must
reach the native constructor/parser rather than a binding-owned pre-parser.

Repository tools validate summary structure and references only; they do not
execute these financial tests. Results are attributed observations, not another
specification or a general conformance certificate. Source paths, commits and
original collection dates stay in their existing fields. Historical explanations
retain their original review date and static limits; the later execution result
is a separate dated observation and does not refresh that review or accept a rule.

## Traceability and freshness

Curate `CE-COMPARISON-*` in traceability.json, referencing the stable finding and
rule. Keep real requirement/vector/Agentic references, reviewed CoreDoc clause
hashes, reviewer/date, disposition and concrete deferred question/role. Canonical
Agentic operations are discovered from registry descriptor headings with the
entire identifier, including multi-segment Entity evolution operations. An
unmapped finding has a reason and no invented binding. Retain prior comparison
IDs for historical interpretations.

Execution applicability is reviewed per finding, independently of its family
label and CoreDoc mapping. A dated assessment in the comparison's `reason`
identifies a comparable property, an explicitly bounded native profile,
context-only evidence or a deferred candidate. A finding without a direct
CoreDoc binding can still concern an executable specification requirement.
Conversely, a contextual binding does not authorize dispatch to an unrelated
operation. Comparison references are not automatically selected execution cases.
Read the latest applicability assessment before reusing an older result: a
populated score does not settle whether its original function/operation
correspondence remains defensible. Preserve attributed observations while
reevaluating or reclassifying the earlier claim.

`record_sha256` freezes the compact reading and its repository/version/commit
identity at migration or subsequent review. The separately attributed `conformance`
summary is excluded from that earlier reading fingerprint; changing the reading
or pinned source still requires recheck. It is an integrity marker, not a new reading or specialist approval.
The preserved review baseline identifies the actual contract reviewed. Changed
evidence or baseline artifacts make comparisons require recheck; builds never
renew fingerprints or dates. Removing or changing a stable ID requires checking
its references and documenting compatibility.

The generated Markdown is a navigation view, including available conformance
scores, with no second editable explanation.
The shared [Experts index](../traceability.md) is generated from this local
curation. Curation, freshness, independent validation and publication authorization
remain separate. Optional metadata validation does not calculate financial
outcomes and is not a conformance execution gate.

## Existing Learn publications

Selected bounded interpretations remain in `historical_publications` inside their
rule JSON. This compatibility field also holds the explicitly selected non-Money
profiles reviewed on 2026-11-23. Their stable finding IDs, selected upstream functions,
limits and CoreDoc bindings are preserved. Their publication fingerprints cover
the selected historical record, not unrelated evidence or later execution summaries in the same file.
Current critical comparisons qualify the earlier readings separately; a format
migration does not promote those interpretations to independent approval.

The existing [Learn selection](../../learn/evidence-selection.json) is separate.
No new comparison is automatically selected or authorized. Changed publication
text, functions, source identity or clause must pass explicit review before its
editorial fingerprint changes. Learn evidence format 1.3.0 introduced the compact publication profile, retaining
older readers’ source formats. JSON links replace the removed extensive Markdown
analyses; the publication reader validates the selected record and pinned functions.

Learn format 1.4.0 separately publishes explicitly selected execution observations
through `conformance_selections`. The CoreDoc reader shows matched/selected case
counts, English descriptions and pinned function links inside “Who does it this
way?”. Unmapped findings remain in the snapshot and source records, without
display in CoreDoc or inferred bindings. Execution selection
does not publish a comparison interpretation or promote pending financial
validation. Its fingerprint covers the result and source/target identity; changes
require review before rebuilding. See the [publication workflow](../../docs/tools/README.md#evidence-beside-coredoc-and-specification-requirements).

A result appears only inside an independently selected finding card for the
reviewed clause, with matching repository, version, commit, record and source
locations. The score describes the finding's stated selection, which can cover
several properties; it is not a rule-level pass rate. Stored results without a
selected interpretation do not create cards. “No selected conformance result”
does not mean no native code was ever exercised; contextual probes and withdrawn
non-equivalent scores retain their stated limits. A result linked elsewhere is
identified separately, and stale results require review. Historical source
`execution_status` describes that reading, not the finding's later execution
history. The Audit, Approvals and Entity supplemental profiles remain context;
only the compatible bounded Workflow projection retains a selected score.

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

For a bounded investigation, freeze the editions, financial reading scope and
finding baseline before reporting coverage. Reconcile attributable historical
readings against the same pinned source, inspect gaps, and review applicability
per finding. Report reading coverage, finding dispositions, complete native
comparisons over the full case-application matrix, and the selected-case score
separately. Keep controls outside the primary score and supplemental editions
outside the cohort. A maintainer-accepted diagnosis may close an investigation
while native execution remains incomplete; retain every selected case and its
explicit limitation. Retire completed working plans into ordinary Git history
after moving lasting procedures into this guidance; do not publish copied plans
or a closure report.

The prior extensive investigation is preserved in ordinary Git history at local
branch `codex/code-evidence-before-compact`, commit
`2e5b6becb7350a058440d697f790e8c5d7639b3a`.
The completed Round 1 working plan is preserved in ordinary local Git history
at branch `codex/code-evidence-round1-completion`, commit
`99a08302ccfc19f35bf75eb0a8ca9cb6939ac4bb`.
The active tree retains 403 findings across 43 families, 356 collection-local
comparisons and 18 selected publication comparisons. The generated shared
Experts index includes those comparisons alongside the other collections;
its total is not the Code Evidence cohort denominator. Of 115 library editions,
38 have a completed scoped reading; the other 77 remain for a future investigation
round. Its unstarted plan is preserved in local Git history at branch
`codex/code-evidence-next-round-before-2.0.5`, commit
`d2f7b41c066cd07ed6c2ccb2947396d4536d87e0`.
The compact format alone is a retention model, not evidence of a new source audit.
