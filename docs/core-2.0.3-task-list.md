# FinKore Core 2.0.3 — Maintenance Task List

**Status:** Active working plan; M0–M5 complete with explicit maintainer acceptance on 2026-11-09. M6 is in progress at the user's request. Specialist reviews remain pending as non-blocking follow-up; final publication checks and publication have not yet completed at this checkpoint.
**Date:** 2026-11-07.
**Published baseline:** FinKore Core 2.0.2 stable, tag `2.0.2`.
**Assessed checkout:** `9b6f54a29df1f95ab19b4dc275d41099fd46efb4`.

## Objective and compatibility boundary

Publish a patch release that includes the maintenance already committed after
the `2.0.2` tag, corrects demonstrated repository-tool defects, and completes
existing-behavior guidance. Preserve financial behavior, stable identifiers,
portable errors, canonical operations, applicability, and failure atomicity.

Apply the [compatibility policy](../spec/conventions.md#compatibility-policy).
Documentation clarification and tool fixes do not authorize new financial
requirements. Add a conformance case only for a demonstrated gap in behavior
already defined by the owning specification. Do not change an expected result
to satisfy an implementation or a maintenance tool.

The starting inventory is 447 requirements, 1,822 vectors in 47 files, 35
operation labels, and 20 canonical Agentic operations. Coverage is 363 COVERED,
five PARTIAL, and 79 NOT DIRECTLY TESTABLE. Preserve those classifications unless
a separately reviewed change actually addresses the relevant boundary.
Conformance format versions remain `0.1`; the private maintenance package
version is independent of the Core release.

M2 adds one regression for an existing Approval requirement after confirming a
specific missing branch. The working inventory is now 1,823 vectors in the same
47 files; all requirement counts, classifications, operation counts, and format
versions above remain unchanged. The published `2.0.2` inventory remains 1,822.

## Existing work and remaining scope

The previous [maintenance plan](core-2.0.2-plan.md) operated on the 2.0.2
baseline; it did not republish that tag. Carry forward these existing commits
rather than reimplementing them:

| Commit | Existing delivery |
| --- | --- |
| `080d098` | Operation/error association validation and adversarial tool tests. |
| `ba223a8` | Clarified PARTIAL explanations and consumer evidence boundaries. |
| `1ae6efc` | Non-normative Money, Approval, and Entity examples; synchronized Learn readers. |
| `9b6f54a` | Clarified consumer-authored external guard dependencies and their portability limit. |

Earlier post-tag Learn, deployment, contributor-guidance, and dependency changes
are included in M5's compatibility review; they are inherited work. M5 of the
previous plan passed development verification, not the stable-publication gate.
The earlier M4 Issue comment was subsequently confirmed published during this
plan's M5 review. The user owns manual Issue responses; local verification does
not publish or approve them.

Checked tasks are complete; unchecked tasks remain outstanding. Milestone names are planning labels,
not stable requirement IDs. P1 work is required for this release scope. P2 work
is optional and does not block release if explicitly deferred.

## Delivery order

| Milestone | Priority | Depends on | Exit condition |
| --- | --- | --- | --- |
| M0 — Baseline and scope | P1 | Current checkout | Exact baseline, inherited work, compatibility boundary, and optional scope are recorded. |
| M1 — Filesystem containment fixes | P1 | M0 | Both reproduced tool defects fail with intended diagnostics; valid controls pass. |
| M2 — Complete existing examples | P1 | M0 | Missing examples/references are added, maintainer acceptance is recorded, and pending specialist reviews remain explicit. |
| M3 — Broader requirement-reference checks | P2, optional | M0 | Selected current-facing references are validated against actual definitions without false historical/negative matches. |
| M4 — Learn navigation | P2, optional | M2 | Readers reach the three worked-example groups through accessible static links. |
| M5 — Release preparation | P1 | M1, M2; included P2 work | Compatibility, status, release notes, generated content, and disposable-tree gates agree. |
| M6 — Final tree and publication | P1 | M5 | Plan-free final tree passes required checks before any requested tag/publication. |

## M0 — Establish the release baseline

- [x] Recheck CoreDoc, owning specifications, manifest-listed artifacts,
  traceability, and Agentic metadata in source-of-truth order.
- [x] Resolve the exact local `2.0.2` tag commit and current proposed head.
  Separate inherited changes from new 2.0.3 changes; preserve unrelated work.
- [x] Confirm the starting inventory and unchanged financial compatibility
  surfaces against that tag. Distinguish conformance-local labels from canonical
  Agentic operations.
- [x] Confirm the two M1 reproductions using disposable fixtures and the
  maintained Node runtime. They are artifact-validation probes, not financial
  conformance execution.
- [x] Record whether optional M3 and M4 are included or deferred. Do not let
  either expand into a new specification or publication prerequisite silently.
  Both were explicitly selected by the user's requests to run M3 and M4.
- [x] Check Node `>=24.11.0 <25` before npm commands; use the repository-local
  `.tools/node/bin` runtime where needed. Install with `npm ci --no-audit`.
- [x] Recheck Issue review/publication status without assuming that prepared
  comments were posted. Retain unresolved acceptance items accurately.

Retrospective baseline checks on 2026-11-08 found no technical impact from
implementing M1 before closing M0. The local `2.0.2` tag resolves to
`953a2aca22681ff1a81897c732e9fc7a3a14087e`. Work through
`9b6f54a29df1f95ab19b4dc275d41099fd46efb4` is inherited; M1 is the subsequent
commit `cd09194013b3a03c42936d790074320ce525e42e`, touching only two maintenance
tools, their tests, a publication-policy regression test, and tooling guidance.

At the retrospective M1 check, CoreDoc and Agentic metadata matched the tag.
Specifications matched apart from the
existing non-normative external-dependency explanation in Workflow Guards.
Schemas, manifest, vector files, format versions, and all 447 traceability
identities, modalities, classifications, and direct vector-reference lists are
unchanged. The starting inventory and financial compatibility boundary above
remained intact; explanatory traceability edits were inherited. M2's subsequent
one-vector addition and its traceability references are recorded below.

Disposable fixtures confirmed that M1's parent accepts external schema/vector
symlinks and sibling-prefix documentation escapes, while M1 rejects each with
the intended diagnostic. Ordinary-file controls pass both versions. These
checks validate artifacts only and require no rollback or reimplementation of
M1. The maintained Node runtime and locked offline installation were rechecked.

The retrospective `npm run verify` run passed: 72 maintenance-tool tests, zero
failures or skips, plus architecture, conformance artifacts, Agentic,
documentation, traceability, Learn synchronization, and licensing checks.
No dependency versions changed; no fresh network-backed advisory review was
performed during this check.

M0's optional M3/M4 scope was subsequently settled by explicit user requests.
Read-only GitHub API checks during M5 confirmed published maintainer responses
for Issues #11–#15, all still open. The user confirmed that #11–#13 reviewer
acceptance remains pending. The
[Issue #14 response](https://github.com/willgittens/FinKore/issues/14#issuecomment-6705216921)
records descriptive clarification with retained classifications; the
[Issue #15 response](https://github.com/willgittens/FinKore/issues/15#issuecomment-6705220539)
records consumer-authored declarations and deferral of a portable schema,
keeping that RFC open. This completes M0's status recheck. On 2026-11-09 the
maintainer accepted M2's delivered scope with specialist review continuing as
non-blocking follow-up. No reviewer sign-off is inferred from a local commit.

**Exit:** implementation starts from a classified baseline without reopening
the published 2.0.2 release or accepting any 2.1 semantics.

## M1 — Correct filesystem containment in maintenance tools

Primary sources: [conformance discovery guidance](../conformance/consumer-guide.md#discovery-and-validation),
[conformance validator](tools/validate-conformance.js),
[documentation checker](tools/check-doc-links.js), and their
[existing tests](tools/test/).

### Conformance files and schema destinations

Assessment reproduced acceptance of a manifest-listed vector file and, in a
separate probe, its schema after replacing each with a symlink to a file outside
`conformance/`. Both probes retained the original artifact contents; the
validator accepted all 1,822 vectors despite the external destination.

- [x] Check containment of actual filesystem destinations as well as lexical
  path traversal, for both `vectorSchema` and every discovered vector file.
  Resolve the root consistently when the checkout itself has a canonical alias.
- [x] Reject external destinations before parsing them. Preserve intended
  diagnostics for missing, broken, unreadable, or non-file destinations.
- [x] Define and document development handling of links whose destinations stay
  inside the root. Do not weaken the publication gate's existing rejection of
  all symlinks in a proposed stable tree.
- [x] Add meaningful regression controls for ordinary files, external file and
  directory symlinks, the schema path, lexical escapes, and the chosen internal
  link policy. Keep all targets synthetic and temporary.
- [x] Preserve manifest discovery, published format versions, deliberately
  invalid financial inputs, and existing schema/error-association checks.

### Documentation paths with a shared name prefix

Assessment reproduced a link from a temporary `/tmp/.../repo` root to its
`repo-sibling` directory passing validation. The current string-prefix check
does not establish directory containment. An external path without that shared
prefix was rejected as the paired negative control.

- [x] Replace string-prefix containment with directory-aware path comparison.
  Review real destinations consistently with the tool's declared local boundary.
- [x] Add controls for the sibling-prefix defect, ordinary parent traversal,
  valid nested paths, repository-root directory links, and existing fragments.
  Cover encoded paths and symlink destinations where relevant.
- [x] Preserve valid local links and intended external-URL handling. Do not
  introduce network link checking into deterministic local verification.
- [x] Require rejected fixtures to return a nonzero CLI status and the intended
  diagnostic; a crash does not count as rejection evidence.
- [x] Update [Developer Tools](tools/README.md) and affected consumer guidance
  to explain actual containment guarantees without claiming a general sandbox.

Completed on 2026-11-08. Conformance checks lexical paths and real regular-file
destinations before reading schema/vector JSON. Documentation checks directory
containment, real link destinations, and discovered Markdown source destinations
before parsing. Internal links and checkout aliases remain valid for development;
the unchanged publication gate still rejects all symlinks, with a regression
control for that stricter boundary.

On Node 24.11.1 with npm 11.6.2, locked installation completed with
`npm ci --no-audit --offline` using the local cache. `npm run verify` passed on
the actual checkout: 72 tool tests passed, with no failures or skips, including
an unreadable-file diagnostic control. Learn synchronization passed; no Learn
source or renderer changed, so regeneration was unnecessary.

CoreDoc, specifications, schemas, manifest, vector contents, traceability,
Agentic metadata, dependency versions, and publication-target selection remain
unchanged. This is a maintenance-tool correction without financial behavior or
format changes. No financial implementation or fresh advisory query was run.
M0's runtime prerequisite was completed here; its retrospective baseline checks
are recorded above. Its remaining scope/review tasks and later milestones
remain outstanding.

**Exit:** both reproduced defects are caught by tool regressions. No financial
operation, input/result format, or runtime guarantee has changed.

## M2 — Complete and review existing-behavior examples

Use the [implementation guide](implementation-guide.md#worked-examples) as the
primary home. Read the owning requirements before changing explanatory results.

- [x] For [Issue #11](https://github.com/willgittens/FinKore/issues/11), retain
  the existing rounding/division walkthroughs.
- [x] Record the disposition of Issue #11's independent financial review:
  pending, with explicit maintainer acceptance on 2026-11-09 to proceed without
  blocking this release. Exact `bc` cross-checks remain computational evidence,
  not specialist sign-off.
- [x] For [Issue #12](https://github.com/willgittens/FinKore/issues/12), add
  explicit examples of null, empty, and malformed relevance selectors under
  [APPROVAL-FACT-001](../spec/approvals/decisions.md#fact-comparison), using the
  existing `FINKORE_APPROVAL_INVALID_DECISION` category and preservation rules.
- [x] Distinguish an invalid selector from omitted selection, omitted current
  facts, and explicitly supplied null facts. Preserve history-only Requirement
  evaluation's existing limits and single-Decision context requirements.
- [x] Pair invalid-selector examples with valid existing controls discovered
  through the manifest. Do not introduce a selector language or new error order.
- [x] For [Issue #13](https://github.com/willgittens/FinKore/issues/13), link
  `entity.evolution.reversal.duplicate-001` and
  `entity.evolution.stale-revision-001` from the evolution walkthrough, alongside
  its existing Audit-failure control. Explain only observations already defined
  by [Entity Evolution](../spec/entities/evolution.md).
- [x] Record the disposition of Approvals' financial-controls/engineering and
  Entity evolution's financial-domain/architecture reviews: pending as ongoing
  follow-up, with explicit maintainer acceptance on 2026-11-09. Future outcomes
  belong in the existing Issues or PR; no remote update is presumed completed.
- [x] Keep examples non-normative. Preserve application ownership of aggregation,
  relevance/materiality, eligibility, and concrete accounting effects.
- [x] Regenerate affected Learn readers and review desktop/mobile reading,
  section links, tables, code, keyboard navigation, and horizontal overflow.
- [x] Add a vector only if review finds a demonstrated coverage gap in existing
  normative behavior; update traceability and classify consumer impact if so.

Implemented on 2026-11-08. The Approval walkthrough now includes explicit
null, empty-list, empty-path, and trailing-segment selectors, alongside valid
controls, omitted/current-null facts, history-only evaluation, and an expired
Decision variant that cannot conceal invalid selectors. It preserves complete
single-Decision validation, lifecycle/context limits, and the native-ownership
and external-history evidence boundaries. Entity guidance now explains the
requested duplicate-reversal and stale-Revision controls with their existing
errors and unchanged observations. The Money walkthrough is unchanged.

A manifest-wide inspection found no `approval.requirement.evaluate` vector
supplying a selector while omitting current facts. Added
`approval.requirement.selectors-without-current-facts-001` to the already
discovered fact/history file, paired with
`approval.boundary097.requirement-facts-control-001`. The new case requires
`FINKORE_APPROVAL_INVALID_DECISION` and unchanged Decision history under
APPROVAL-FACT-001, APPROVAL-VALIDITY-012, and APPROVAL-ERROR-005. It detects
acceptance as history-only evaluation and synthesized current facts without
adding normative behavior. Traceability references and current inventory are
updated; the additional case requires consumer evaluation, not data migration.
Existing vector identities and expected observations are preserved.

Learn readers were regenerated through `npm run learn:build`, including its
shared CSS cache URLs. Chrome 150 checks at 1440×1000 and 390×844 confirmed the
worked-example fragments, visible keyboard focus, skip-link activation,
contained table/code overflow, and keyboard scrolling of the mobile comparison
table. Desktop and mobile screenshots were visually reviewed. No renderer,
stylesheet, operation metadata, schema, or runtime implementation was changed.

Locked installation passed on Node 24.11.1/npm 11.6.2 using
`npm ci --no-audit --offline` and the local cache. `npm run verify` passed:
72 maintenance-tool tests, no failures or skips, and all artifact,
documentation, traceability, Learn, architecture, Agentic, and license checks.
No repository-tool or tool-test changes were needed. CoreDoc, normative
requirements, portable errors, canonical operations, dependencies, and format
versions are unchanged. Financial behavior was not executed. No fresh advisory
query or stable-publication gate was run; those remain release-stage checks.

Read-only GitHub API checks confirmed that Issues #11–#13 remain open and that
the earlier implementation responses were published on 2026-11-07:

- [Issue #11 response](https://github.com/willgittens/FinKore/issues/11#issuecomment-6705205743):
  financial-reviewer sign-off remains pending.
- [Issue #12 response](https://github.com/willgittens/FinKore/issues/12#issuecomment-6705209858):
  financial-controls and engineering review remain pending; the documentation
  omissions identified there are addressed locally by M2.
- [Issue #13 response](https://github.com/willgittens/FinKore/issues/13#issuecomment-6705212623):
  financial-domain and architecture/engineering review remain pending; its two
  missing control references are now included locally.

These maintainer responses record delivery and outstanding acceptance, not
reviewer approval. No remote comment, closure, or review claim was added by M2.
On 2026-11-09 the maintainer explicitly accepted continuing with this delivered
scope while Expert Review proceeds. This supersedes the earlier dependency on
specialist confirmations for M2's exit and 2.0.3 publication. Those opinions
remain pending; they have not been recorded as approvals. M2 is complete under
that maintainer decision. M0's subsequent status checks are recorded above.

**Exit:** documentation omissions are fixed, maintainer acceptance is recorded,
and pending specialist reviews are explicit as non-blocking follow-up. Do not
close an Issue merely because repository checks pass.

## M3 — Expand requirement-reference checks, if selected

Selected by the user's request to run M3. This extends the documentation
checker's existing CoreDoc checks to a bounded set of current documents.

- [x] Define a bounded set of current-facing specification/guidance documents
  and supported reference syntax. Keep published verification independent of
  active plan filenames and contents.
- [x] Resolve references against actual normative definitions. A textual
  reference cannot create a requirement or make a retired identifier active.
- [x] Handle established abbreviated IDs and ranges where selected. Distinguish
  historical release notes, negative examples, fixture data, and future proposals
  explicitly, rather than accepting arbitrary unknown identifiers.
- [x] Add valid and invalid controls, including a known-prefix nonexistent ID,
  supported abbreviated references, and deliberate historical/negative examples.
- [x] Preserve current CoreDoc and Agentic checks. Keep the tool structural:
  do not infer financial semantics or automatic compatibility approval.
- [x] Document scope and limitations in existing contributor/tool guidance, or
  record explicit deferral here without claiming implementation.

Implemented on 2026-11-08. `check-doc-links.js` now checks Markdown under
`spec/`, `conformance/`, and `agentic/`, root README/CONTRIBUTING, and the
implementation/where-to-start guides. Selection uses maintained directories
and guide paths without depending on any working-plan filename or contents.
The inventory comes from normative specification list definitions, excluding
literal examples and comments; a prose reference cannot create an active ID.

Supported prose/inline-code/link-label references include full domain/topic
IDs, adjacent abbreviated lists and slash forms, hard-wrapped continuations,
and inclusive `to`/`through`/dash ranges. Every range member is checked; unknown
prefixes/IDs, missing interior members, descending ranges, and cross-prefix
ranges fail with path/line diagnostics. Context resets at paragraph, heading,
list-item, and table-row boundaries. Foundation CORE IDs and non-requirement
labels such as SHA-256 are outside the additional specification-ID inventory.

Fenced and indented literal data, HTML comments, and inline link destinations
are excluded from this additional check. Release notes, other documentation
such as proposals/history, JSON fixtures, and tool source are outside its
selected document set. An "Invalid examples" heading alone cannot suppress
active prose checking. Existing wider Markdown-link checks, CoreDoc checks,
Agentic checks, and M1 containment behavior remain in place. The tool checks
references, not financial semantics, compatibility approval, or conformance.

Eight additional documentation-tool tests exercise the selected locations,
valid and invalid shorthand/ranges, retired/undefined references, non-normative
and literal fake definitions, negative fixture examples, independent link-label
checking, and scope/context boundaries. Scope and syntax are documented in
[Developer Tools](tools/README.md#specification-requirement-references) and
CONTRIBUTING. A concise Unreleased note was added; affected Learn readers were
regenerated with the shared CSS cache refresh.

Locked installation passed on Node 24.11.1/npm 11.6.2 using the local cache and
`npm ci --no-audit --offline`. `npm run verify` passed with 80 maintenance-tool
tests, zero failures or skips. The documentation checker validated 199 existing
CoreDoc-to-specification references and 1,968 specification-reference occurrences
across 65 selected current documents. Architecture, conformance artifacts,
Agentic, traceability, Learn synchronization, licensing, and whitespace checks
also passed. No fresh advisory query or stable-publication gate was run; those
remain separate release-stage checks. Financial behavior was not executed.

No CoreDoc, specification, vector, schema, traceability, Agentic metadata,
portable error, operation identifier, dependency, or workflow was changed.
M2's inventory of 447 requirements and 1,823 vectors remains unchanged, as do
coverage classifications and format versions. M2's specialist reviews were
pending at this milestone; the maintainer subsequently accepted proceeding on
2026-11-09. M4 was subsequently selected and completed below.

**Exit:** selected references are checked with meaningful controls, or this
optional milestone is explicitly deferred.

## M4 — Improve static Learn navigation, if selected

- [x] Add direct navigation to the Money, Approval, and Entity worked examples
  through canonical source content or the existing renderer, without duplicating
  the walkthroughs or adding a competing normative index.
- [x] Preserve the reviewed static-site profile: no new script, search service,
  form, executable financial example, or remote resource is implied.
- [x] Verify destination fragments, keyboard access, visible focus, desktop and
  mobile layout, and existing table/code scrolling.
- [x] Regenerate readers with `npm run learn:build` and include the generated CSS
  cache URL changes. Adjust existing renderer tests only where behavior changes.
- [x] Record the scope decision: included by the user's request to run M4,
  with no deferral.

Completed on 2026-11-08. The implementation guide's introduction now contains
three labeled links directly to its existing Money, Approval, and Entity
worked-example headings. These canonical Markdown links are also rendered
locally in Learn, preceding the reading-order section. Existing heading IDs,
worked examples, normative guidance, and the sidebar/mobile index are preserved.
The links add navigation to non-normative examples without a new normative
index or duplicated walkthroughs.

Learn was regenerated through `npm run learn:build`, including the shared CSS
cache URLs. Chrome 150 review at 1440×1000, 390×844, and 320×740 confirmed all
three links are reachable by Tab, show visible focus, and activate with Enter.
Each destination heading remains visible below the sticky header. Screenshots
were reviewed at all three sizes. There is no page-wide horizontal overflow;
existing tables and code blocks retain local scrolling, including keyboard
scrolling at mobile widths. The generated guide still loads no scripts or forms.

This uses the existing renderer and styles without behavior changes, so no
renderer or tool-test changes were required. CoreDoc, specifications, vectors,
schemas, traceability, portable errors, stable IDs, Agentic metadata, tools,
dependencies, and workflows are unchanged. The inventory remains 447
requirements and 1,823 vectors with the existing coverage classifications.
The concise navigation note is under Unreleased in the existing release notes.
M2's requested specialist reviews remain pending, with non-blocking disposition
subsequently accepted by the maintainer on 2026-11-09.

Locked installation passed on Node 24.11.1/npm 11.6.2 with
`npm ci --no-audit --offline` using the local cache. `npm run verify` passed:
80 maintenance-tool tests, zero failures or skips, plus architecture,
conformance artifacts, Agentic, documentation references/links, traceability,
Learn synchronization, licensing, and whitespace checks. Financial behavior
was not executed. No fresh advisory query or stable-publication gate was run;
those remain separate release-stage checks.

**Exit:** included navigation is accessible and synchronized, or the milestone
is explicitly deferred without blocking the patch release.

## M5 — Prepare the 2.0.3 release

- [x] Review the complete proposed diff against the exact `2.0.2` tag, including
  inherited changes. Classify financial requirements, errors, IDs, operation
  contracts, serializations, applicability, and failure atomicity explicitly.
- [x] Keep WORKFLOW-GUARD-004 PARTIAL. Neither consumer review nor M1 path fixes
  supplies its missing portable external-dependency authoring representation.
- [x] Confirm Agentic synchronization needs; do not advertise idempotency,
  concurrency, new operations, or new safety properties.
- [x] Deliberately select `2.0.3` as the publication target in
  [check-release-content.js](tools/check-release-content.js) and update the
  associated tests/guidance. Preserve rejection of stale or arbitrary versions.
- [x] Align current-facing Core version/status declarations and CoreDoc's
  current version/status. Preserve `Introduced`, `Last updated`, and
  `Last updated on` governance metadata during editorial promotion.
- [x] Preserve historical versions, vector IDs, format versions, and independent
  maintenance-package versioning. Avoid a repository-wide numeric replacement.
- [x] Keep release summaries only in [release notes](releases/README.md). Use an
  accurately labeled Unreleased entry during preparation; do not describe a
  proposed release as already published or rewrite historical entries.
- [x] Synchronize contributor, consumer, and tool guidance. Move enduring
  procedures into existing guidance, not a closure or review-evidence report.
- [x] Regenerate affected Learn readers and review generated output and
  presentation. Record actual applicable review outcomes without fabrication.
- [x] Run `npm ci --no-audit` and `npm run verify` on the actual development
  tree. Run `npm run dependencies:audit` separately for the release and report
  its date, fresh advisory-data scope, and actual result.
- [x] Prepare a disposable proposed-release tree containing all intended final
  content, including any changes not yet in HEAD. Exclude planning artifacts and
  their references while preserving unrelated user-owned planning work safely.
- [x] Exercise ordinary verification and `npm run release:check` against that
  complete proposed tree using the [publication procedure](tools/README.md#stable-publication-gate).
  Do not satisfy the gate by dropping intended content or weakening checks.

Technical preparation completed on 2026-11-08 against tag `2.0.2` at
`953a2aca22681ff1a81897c732e9fc7a3a14087e`, with inherited/new work through
`ecc05675ce0560ffd63c081182af7d025f4d6cd9` and the actual uncommitted M5 edits.

| Reviewed surface | Classification and result |
| --- | --- |
| CoreDoc and 447 normative requirements | Publication metadata changes only. Every normative requirement clause and CoreDoc obligation remains identical to the tag; all `Introduced`, `Last updated`, and `Last updated on` fields are preserved. CoreDoc's prepared version/date are 2.0.3/2026-11-08. |
| Errors, operations, and serializations | Portable errors, 20 canonical operation contracts/effects/safety metadata, schemas, manifest, and format versions remain unchanged. Agentic synchronization requires only its current status declaration. No new 2.1 behavior is advertised. |
| Conformance and traceability | All 1,822 original vectors retain their complete inputs, expectations, IDs, and requirement mappings. M2 adds exactly one existing-behavior regression, giving 1,823 vectors in 47 files and 35 operation labels. Requirement identities/modalities/classifications remain unchanged: 363 COVERED, five PARTIAL, 79 NOT DIRECTLY TESTABLE. |
| Applicability and atomicity | Existing parser permissions, recommendation exceptions, fact-selection/current-context boundaries, error priorities, and failure-preservation obligations are unchanged. The additional case asserts the existing invalid-selector-context error and unchanged history. |
| Inherited explanations | Money/Approval/Entity examples and PARTIAL/guard-dependency explanations clarify existing requirements under SPEC-COMPATIBILITY-011. WORKFLOW-GUARD-004 remains PARTIAL; the accepted Issue #15 disposition introduces no schema or new error. |
| Maintenance tooling | Operation/error association checks, path containment, and bounded reference validation remain domain-neutral. They validate artifact structure/metadata without calculating financial outcomes or supplying consumer conformance execution. |
| Learn, deployment, and dependencies | Inherited static pages/navigation, Network content/assets, CSS cache generation, contributor guidance, and deployment of verified committed output are included. The Verify job remains artifact-only; hosting secrets remain in the separate production deployment job. The inherited lock update is fast-uri 3.1.8 to 3.1.9. |

Consumers need no data migration or history rewrite. Evaluation of this revision
includes M2's additional case. Artifact authors also need to satisfy the
documented tooling path/reference/error-association checks; those stricter
maintenance checks do not change the financial compatibility surface.

The checker explicitly targets `2.0.3`; target-specific tests preserve rejection
of prior patches, arbitrary matching versions, missing stable declarations,
incoherent CoreDoc metadata, and mixed stable/preparation claims. Current
checkout declarations are aligned as
`FinKore Core 2.0.3 release preparation (unpublished)`, not stable. The Unreleased
summary and contributor/tool guidance accurately distinguish preparation,
the disposable rehearsal, and final publication. Historical releases, the
`2.0.2` tag, conformance format `0.1`, and maintenance package `0.1.0` are preserved.

On Node 24.11.1/npm 11.6.2, locked offline installation and actual-tree
`npm run verify` passed: 80 maintenance-tool tests, zero failures or skips,
with all architecture, conformance-artifact, Agentic, documentation,
traceability, Learn, licensing, and whitespace checks. Separately,
`npm run dependencies:audit` queried fresh registry.npmjs.org advisory data
using a new cache on 2026-11-08: zero vulnerabilities across the five-dependency
locked maintenance graph. It covers that dependency graph, not consumer code.

The disposable tree copied all 182 intended tracked files directly from the
actual checkout, including modified M5 content; its inventory was compared
with the tracked-file list. The four user-owned, untracked planning/draft files
were preserved locally and excluded from publication. Only in the copy, 55
current preparation declarations were replaced by prospective stable metadata
and Learn was regenerated. A disposable Git index compared its changes with
the original HEAD without modifying the real index or creating a commit.
No intended artifact, test, static asset, or maintenance tool was dropped.

Locked installation and `npm run verify` also passed in that proposed tree
with 80 tests, zero failures or skips. Its `npm run release:check` passed for
2.0.3: 173 text files and 670 HTML links. The copy retains the accurate
Unreleased summary and pending-review statements; the gate checks publication
content, not reviewer approval. The actual unpublished tree was not claimed to
pass the final stable-publication gate.

Learn was regenerated in both trees. Chrome 150 checked the home, CoreDoc,
project overview, contribution, release, and implementation readers at
1440×1000, 390×844, and 320×740 in each tree. Status labels, keyboard entry,
visible focus, the static profile, and absence of page-wide horizontal overflow
passed; desktop/mobile screenshots were reviewed. The prepared tree uses only
prospective status text; no publication was performed.

The user initially confirmed #11–#13 financial/technical opinions were pending.
On 2026-11-09 the maintainer explicitly accepted proceeding with 2.0.3 while
Expert Review continues. This supersedes the earlier release dependency on
those opinions: M2 and M5 are accepted and complete. The specialist reviews
remain pending as follow-up, with future findings routed through the
compatibility policy. M6's actual-final-tree checks still precede tagging.
No Issue was changed remotely, no tag was created/moved, and no financial
implementation was executed.

Revalidated on 2026-11-09 after recording the maintainer decision in AGENTS,
CONTRIBUTING, developer guidance, and the Unreleased summary. Read the public
Expert Review series, including the
[Approval questions](https://github.com/willgittens/FinKore/discussions/34) and
[accounting questions](https://github.com/willgittens/FinKore/discussions/32).
Pending consultation is no longer an M2/M5 or release acceptance dependency;
specialist approval is still not claimed. No financial requirement, vector,
portable error, stable identifier, or Agentic metadata changed in this update.

Locked installation, regenerated Learn, and full verification passed in both the
actual working tree and a refreshed disposable proposed-release tree: 80 tool
tests, zero failures or skips in each. The updated proposed tree's stable gate
passed for 173 text files and 671 HTML links. Chrome checks at 1440, 390, and
320 pixels passed in both trees for layout, keyboard entry, status labels, and
the static profile. The four original local planning files were preserved and
excluded from the proposed tree. No new dependency advisory query was needed
for this governance-only change; the dated 2026-11-08 result remains above.
Actual stable declarations, final-tree cleanup, and publication remain M6 work.

**Exit:** reviewed 2.0.3 content passes development verification and the
disposable-tree publication gate, with maintainer acceptance and ongoing
specialist review recorded distinctly. This is not a claim of stable publication.

## M6 — Validate the final tree and publish when requested

Started on 2026-11-09 from `4d14491c3ddb75956916e11e7624a3c3d8a44ec3`
on `feature/version-2.0.3`. The user's request to execute M6 authorizes final
preparation and publication of this branch and the new `2.0.3` tag; it does not
authorize changing `main`, moving `2.0.2`, or posting manual Issue responses.
Read-only origin checks found no existing `2.0.3` tag or matching release branch.
The local and remote `2.0.2` target remains
`953a2aca22681ff1a81897c732e9fc7a3a14087e`.

Preserve all four original planning/draft files in an ordinary Git commit before
removing them from the release tree. This includes the still-pending 2.1 work,
without accepting its candidate semantics. This checkpoint intentionally precedes
the plan-free final-tree gates; their outcome belongs in the concise release
entry and final user response, not a copied closure report or restored plan.

Node 24.11.1/npm 11.6.2 locked installation passed. A fresh registry.npmjs.org
advisory query on 2026-11-09, with a new cache, reported zero vulnerabilities
across the five-dependency locked maintenance graph. This is dependency metadata
review, not financial execution. Final artifact checks remain outstanding at
this historical checkpoint.

- [ ] Preserve completed plans in ordinary Git history and user-owned untracked
  work safely before removing planning artifacts and their links from the actual
  publication tree. Do not create a tracked archive or delete 2.1 work silently.
- [ ] Remove this final working plan before stable publication. No published
  contract document or verification step may depend on it.
- [ ] Finalize the accurate 2.0.3 release entry, regenerate its affected readers,
  and review the final content after all publication preparation edits.
- [ ] Repeat required installation, `npm run verify`, and `npm run release:check`
  on the actual final tree after the last plan and reference have been removed.
  Any later change requires rechecking the affected gates before tagging.
- [ ] Confirm the chosen tag's exact final commit and that existing `2.0.2`
  remains unchanged. A passing disposable-tree check does not replace this gate.
- [ ] When publication is requested, create the annotated `2.0.3` tag and publish
  the intended branch/tag to origin. Do not recreate or force-move `2.0.2`.
- [ ] Reconcile Issues with their actual delivered scope and reviews. Manual
  comments and decisions are not presumed published until confirmed.

**Exit:** the actual plan-free final tree passed required gates before any
requested publication. Published checks remain artifact verification, not
execution or certification of a consumer financial implementation.

## Outside 2.0.3

Idempotency, replay, request binding, pending/unresolved outcomes, duplicate
arbitration, response-loss recovery, and their new acceptance formats remain in
the separate [2.1 task list](core-2.1-task-list.md). This plan accepts none of
the candidate semantics in its design draft.

New guard-dependency schemas, Audit path/provenance/time profiles, historical
Approval evaluation, maker-checker rules, precision/overflow guarantees, ledger,
tax, payments, settlement, FX sourcing, and general distributed coordination
remain separately scoped proposals. No implementation, runner, adapter API,
transport protocol, or language package is added to this repository.

## Definition of done

- [x] The inherited maintenance and new changes have an explicit compatibility
  review against 2.0.2, without changed financial semantics.
- [x] Both demonstrated containment defects have meaningful regression controls.
- [x] Example omissions are resolved and maintainer acceptance is recorded;
  pending financial/technical specialist reviews are non-blocking follow-up.
- [x] Optional M3/M4 work is delivered or explicitly deferred.
- [x] Current-facing documentation, release metadata, Learn, and tools agree.
- [ ] Actual-tree verification, fresh dependency review, disposable-tree release
  checks, and actual-final-tree release checks pass at their required stages.
- [ ] The stable publication tree contains no planning artifacts or dependencies
  on them; existing work and the 2.0.2 tag are preserved.
- [ ] Any tag, remote publication, Issue closure, or review claim reflects an
  action actually completed, with no financial-execution claim from tool checks.
