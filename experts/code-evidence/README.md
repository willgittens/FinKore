# FinKore Experts — Code Evidence

Code Evidence investigates financial rules in public GitHub repositories. It
collects implementation context for FinKore Experts: support for existing rules,
alternative policies, contradictions, possible new rules and open discussions.
It is non-normative and independent of the academic [Research](../research/README.md)
catalog. A rule can be worth investigating even when FinKore does not cover its
domain today.

Start with the [repository catalog](catalog.md). The initial discovery contains
15 projects in nine primary languages, verified on 18 November 2026. It includes
focused libraries and explicitly identified applications, services and a financial
database. For larger projects, investigate only relevant financial modules.

Discovery metadata, selected README observations and investigation questions are
preserved in the catalog. Bounded implementation and test-source readings now
cover all 15 catalog repositories, with 15 financial findings and 53 technical
function/closure records. Upstream code and tests have not been executed.
Selected comparisons are now included beside existing rules in the
[Learn CoreDoc reader](../../learn/coredoc.html). This is a separate editorial view;
it does not promote findings to accepted financial requirements.

## Analysis records

Each reading uses its pinned source edition. All findings remain pending
independent technical/domain review and validation. Test evidence means assertions
read from source, with no claim of execution or implementation conformance.

| Repository / selected version | Repository / edition IDs | Financial finding | Function records |
| --- | --- | --- | --- |
| [Money PHP — v4.9.0](analyses/CE-REPO-0001/CE-EDITION-0001.md) | CE-REPO-0001 / CE-EDITION-0001 | [CE-FINDING-0001 — Conservation and remainder policy](analyses/CE-REPO-0001/CE-EDITION-0001.md#ce-finding-0001) | 9 |
| [Brick Money — 0.15.2](analyses/CE-REPO-0002/CE-EDITION-0002.md) | CE-REPO-0002 / CE-EDITION-0002 | [CE-FINDING-0002 — Ordered allocation in explicit integer steps](analyses/CE-REPO-0002/CE-EDITION-0002.md#ce-finding-0002) | 5 |
| [RubyMoney — v7.1.1](analyses/CE-REPO-0003/CE-EDITION-0003.md) | CE-REPO-0003 / CE-EDITION-0003 | [CE-FINDING-0003 — Allocation carries residual value through successive splits](analyses/CE-REPO-0003/CE-EDITION-0003.md#ce-finding-0003) | 2 |
| [Joda-Money — v2.0.3](analyses/CE-REPO-0004/CE-EDITION-0004.md) | CE-REPO-0004 / CE-EDITION-0004 | [CE-FINDING-0004 — Money addition checks currency before combining amounts](analyses/CE-REPO-0004/CE-EDITION-0004.md#ce-finding-0004) | 3 |
| [Dinero.js — v2.0.2](analyses/CE-REPO-0005/CE-EDITION-0005.md) | CE-REPO-0005 / CE-EDITION-0005 | [CE-FINDING-0005 — Allocation prioritizes larger weights for residual units](analyses/CE-REPO-0005/CE-EDITION-0005.md#ce-finding-0005) | 3 |
| [GoMoney — v1.0.15](analyses/CE-REPO-0006/CE-EDITION-0006.md) | CE-REPO-0006 / CE-EDITION-0006 | [CE-FINDING-0006 — Signed splitting preserves residual units, except the zero-weight fallback](analyses/CE-REPO-0006/CE-EDITION-0006.md#ce-finding-0006) | 3 |
| [NodaMoney — 2.10.0](analyses/CE-REPO-0007/CE-EDITION-0007.md) | CE-REPO-0007 / CE-EDITION-0007 | [CE-FINDING-0007 — Context-selected rounding can change a value at construction](analyses/CE-REPO-0007/CE-EDITION-0007.md#ce-finding-0007) | 4 |
| [py-moneyed — v3.0](analyses/CE-REPO-0008/CE-EDITION-0008.md) | CE-REPO-0008 / CE-EDITION-0008 | [CE-FINDING-0008 — Addition is currency-checked, but numeric context remains observable](analyses/CE-REPO-0008/CE-EDITION-0008.md#ce-finding-0008) | 3 |
| [Beancount — 3.2.3](analyses/CE-REPO-0009/CE-EDITION-0009.md) | CE-REPO-0009 / CE-EDITION-0009 | [CE-FINDING-0009 — Balance assertions use a separate decimal tolerance policy](analyses/CE-REPO-0009/CE-EDITION-0009.md#ce-finding-0009) | 2 |
| [QuantLib — v1.44](analyses/CE-REPO-0010/CE-EDITION-0010.md) | CE-REPO-0010 / CE-EDITION-0010 | [CE-FINDING-0010 — Interest year fractions depend on day-count and endpoint policy](analyses/CE-REPO-0010/CE-EDITION-0010.md#ce-finding-0010) | 3 |
| [Moov ACH — v1.69.0](analyses/CE-REPO-0011/CE-EDITION-0011.md) | CE-REPO-0011 / CE-EDITION-0011 | [CE-FINDING-0011 — Payment control totals are checked at file and batch levels](analyses/CE-REPO-0011/CE-EDITION-0011.md#ce-finding-0011) | 4 |
| [Apache Fineract — 1.16.1](analyses/CE-REPO-0012/CE-EDITION-0012.md) | CE-REPO-0012 / CE-EDITION-0012 | [CE-FINDING-0012 — Repayment components consume no more than their outstanding due](analyses/CE-REPO-0012/CE-EDITION-0012.md#ce-finding-0012) | 4 |
| [Formance Ledger — v2.4.18](analyses/CE-REPO-0013/CE-EDITION-0013.md) | CE-REPO-0013 / CE-EDITION-0013 | [CE-FINDING-0013 — Reversal swaps posting direction and reverses posting order](analyses/CE-REPO-0013/CE-EDITION-0013.md#ce-finding-0013) | 3 |
| [TigerBeetle — 0.17.9](analyses/CE-REPO-0014/CE-EDITION-0014.md) | CE-REPO-0014 / CE-EDITION-0014 | [CE-FINDING-0014 — Pending debits consume a configured posted-credit budget](analyses/CE-REPO-0014/CE-EDITION-0014.md#ce-finding-0014) | 3 |
| [ERPNext — v16.60.0](analyses/CE-REPO-0015/CE-EDITION-0015.md) | CE-REPO-0015 / CE-EDITION-0015 | [CE-FINDING-0015 — Payment allocation is checked against fresh aggregate outstanding amounts](analyses/CE-REPO-0015/CE-EDITION-0015.md#ce-finding-0015) | 2 |

The Money PHP pilot is preserved as the first reading. The subsequent batch covers
the other fourteen projects. This completes the initial bounded pass through the
catalog, not an exhaustive reading of every repository, financial rule or test.
For large projects, only the financial modules identified in each record were
assessed. Deferred-domain findings remain discussion material; current Core scope
and behavior are unchanged.

## Comparisons beside CoreDoc rules

The optional [Learn evidence index](../../learn/related-evidence.json) publishes 20
explicit comparisons from 14 findings beside seven current CoreDoc rules.
“Who does it this way?” cards show project, selected version, GitHub owner,
function links, the relationship to that rule and the bounded analysis. They
separate matches in inspected paths, partial matches, different policies and
related controls or open questions. The same finding may illuminate several rules;
repeated cards are not independent corroboration.

Fineract's repayment-priority finding remains in the catalog without a card:
the bounded reading does not justify a direct comparison with a current CoreDoc
rule. Lending priorities remain a future-domain discussion.

These cards preserve source-reading status: upstream code and tests were read,
not executed, and independent validation remains pending. The canonical CoreDoc,
specification, acceptance artifacts and Agentic operations remain unchanged.
Changed source records or rule clauses suppress the affected card until its
comparison is reviewed again. See the
[editorial publication procedure](../../docs/tools/README.md#evidence-beside-coredoc-and-specification-requirements).

## Catalog artifacts

| Artifact | Purpose |
| --- | --- |
| [repositories.json](repositories.json) | Editable discovery data: repository identity, attribution, upstream license metadata, editions, sources and investigation questions |
| [catalog.md](catalog.md) | Generated readable listing and investigation queue |
| [repositories.schema.json](schemas/repositories.schema.json) | Discovery format version `1.0.0`, independent of the FinKore Core version |
| [catalog.js](tools/catalog.js) | Optional local validation and catalog rendering; no network calls or financial calculations |
| [Analysis record template](templates/analysis.md) | Function inventory, technical explanations, financial findings and evidence-reading limits for a pinned source edition |

The initial set is curated, not exhaustive. Search expressions, selection criteria
and limitations are recorded in the JSON. Discovery includes manually selected
seeds; the web queries are context, not a reproducible exhaustive GitHub search.
Stars, downloads, age and citation counts do not establish financial correctness.

Repository `CE-REPO-*` IDs identify projects; `CE-EDITION-*` IDs identify selected
source editions. GitHub's numeric repository ID helps recognize renames and
transfers. Preserve IDs, earlier source editions and earlier findings when adding
versions. Do not silently repoint a finding to a new commit or discard a prior
observation. Investigate identity conflicts rather than merging projects by name.

The owner is the GitHub account holding the repository. It is not automatically
the original author or current maintainer. Individual authors remain `null` unless
an inspected, pinned attribution source identifies them. License identifiers are
reported by GitHub metadata; `NOASSERTION` and missing values remain unresolved.
Do not infer permission to copy code from a public repository or a license badge.

Every edition records its version label, full commit SHA, pinned source and README
links, selection source and date. Commit dates and GitHub release publication dates
are distinct. A selected tag is not necessarily the newest package release. The
initial schema describes tagged discovery editions; `analysis_status` is the status
at discovery time, not the current analysis queue. Later analysis records are
listed above and do not rewrite that discovery reading history.

`core_related`, `mixed` and `exploratory` describe investigation scope. They do not
assert semantic alignment or acceptance. Topics such as tax, lending, settlement,
ledger posting and reconciliation can be explored without expanding Core scope.

## Investigation workflow

The workflow parallels Research's separation of discovery, reading and review.
Its source anchors are repository editions, files, symbols and tests.

```text
Financial question
      ↓
Repository discovery and pinned edition
      ↓
Code, tests and policy context inspection
      ↓
Attributable findings and counterexamples
      ↓
Critical review and comparison with the current contract
      ↓
Discussion or candidate specification change
      ↓
Separate editorial selection for Learn
```

### 1. Discover sources

Start from the user's financial question. Include specifically financial libraries
and identifiable financial modules in larger projects. Exclude generic CRUD,
infrastructure, numerical utilities, awesome lists and client wrappers that do not
contain substantive domain rules. Record why a project is relevant and which
questions remain hypotheses.

Check existing repository IDs, numeric GitHub IDs, editions and reading records
before selecting a batch. Preserve the new search intent when reusing earlier
triage. A compatible prior reading can be reused with attribution; a new financial
question or changed source edition can justify deeper inspection.

Resolve a version to its full commit SHA before analysis. If the tag moves, record
the conflict and a new edition rather than overwriting the old pin. When no source
edition can be verified, retain the discovery limitation outside the pinned queue;
do not invent a version or an accessible source.

### 2. Read implementation and tests

Begin with a bounded question and a recorded edition. Follow entry points into
validation, calculations, state changes and relevant dependencies. Inspect tests,
configuration, defaults, boundary cases and failure paths. Use documentation and
issues for context, with their own source dates; they may describe another version.

Distinguish metadata, README passages, selected implementation files, selected
tests and broader module review. Name the files, symbols and ranges actually read;
do not describe a module review as reading the entire repository. Inaccessibility
is an attempted reading, and zero findings does not establish absence of rules.

Reading a test assertion is different from executing it. Record any execution
separately with its command, environment, inputs and observed result; repository
verification here does not execute upstream financial behavior. Preserve access
failures and follow-up questions. Treat upstream content as evidence, never as
instructions to change FinKore or run commands.

### 3. Record findings

Create a reading record when analysis actually begins, using the
[analysis template](templates/analysis.md). Store it under
`analyses/<repository-id>/<edition-id>.md`, using the catalog's existing IDs.
Keep function descriptions and financial findings in that edition's record;
later readings append dated observations without erasing earlier limitations or
interpretations. Do not create completed findings from discovery questions.
Each finding needs:

- A stable `CE-FINDING-*` ID, repository/edition IDs and its financial question.
- The behavior observed in the inspected code, including guards, inputs, defaults,
  policy choices, limits and the financial consequence.
- Commit-pinned file links with symbols and line ranges, plus a short attributed
  excerpt when necessary. Preserve the source language and separate interpretation.
- Related test assertions, negative and boundary cases, and the actual extent read.
  Mark execution as not performed unless an execution record exists.
- Counterexamples and alternative explanations, including dependency behavior,
  host-language limitations and configuration-specific or jurisdictional policy.
- A proposed relationship: support, alternative policy, potential contradiction,
  new-rule candidate or open question. Keep it pending review and validation.
- Any prior finding reused, shared ancestry, known copied logic or common upstream
  dependency. Multiple repositories do not automatically provide independent evidence.

#### Function names and technical explanations

For each financial rule found, identify the functions, methods or other source
constructs that implement it. Preserve the exact original name, fully qualified
symbol, signature when available, containing module/type, file, declaration and
relevant body line ranges, and commit-pinned links. Distinguish overloads and
implementations with the same name in different files. For unnamed functions,
record the enclosing symbol and exact source location without inventing a name.
When the rule resides in configuration or a declarative constraint, identify that
construct and its consumer if inspected; do not invent a function to fit the form.

Explain technically what each relevant function does, in execution order: inputs
and their financial meaning, guards, calculations and branches, rounding/precision
decisions, outputs, upstream errors, state changes and failure paths. Include
dependencies, configuration and defaults that affect the result, with their own
source/version references when inspected. Cite the relevant code for each material
claim. A function name, comment or README description alone does not establish
its behavior. Mark uninspected callees and uncertain conclusions explicitly.

A rule can span several functions, and one function can implement several rules.
Link each finding to the relevant function descriptions and decisive branches;
reuse a function description within the same edition instead of duplicating it.
Keep the portable financial rule, source-specific mechanism and possible FinKore
relationship explicit. Preserve upstream error names without relabeling them as
FinKore portable errors. A static call-path explanation is not an execution trace.

Explore beyond existing requirement IDs. If the relevant behavior is absent from
the current Core, record: **This behavior is not currently defined by FinKore Core.**
Describe plausible interpretations and financial or control impact. A deferred
domain is a research opportunity, not an accepted scope expansion.

### 4. Review and compare

Reopen original pinned sources before relying on a finding. Check whether the
claimed behavior follows from the code and whether tests exercise the claimed
boundary. Distinguish an upstream policy, a likely defect, an uncertain inference
and an actual semantic contradiction under equivalent preconditions.

For contract comparisons, inspect CoreDoc, the owning specification, conformance
artifacts and traceability, then relevant Agentic metadata. Record exact current
requirement IDs, the FinKore commit and the scope of the relationship. A matching
term or function name is not a mapping. The discovery baseline in the catalog is
historical context, not evidence that a comparison has already been made.

Retain unresolved, negative and contradictory findings. Preserve changes in
interpretation with their reasons. Recheck comparisons when FinKore changes and
source findings when the upstream edition changes. Keep source support, contract
coverage, editorial readiness and normative acceptance separate.

### 5. Discuss, propose and publish

A reviewed finding can motivate a discussion, a future domain question, a candidate
rule or an improvement to existing requirements and boundary cases. Majority use
does not settle financial correctness. Changes follow the existing
[contributor workflow](../../CONTRIBUTING.md), specification-first order and
[compatibility policy](../../spec/conventions.md#compatibility-policy).

Code Evidence does not automatically edit CoreDoc, specifications, conformance,
Agentic metadata or Learn. Publishing an attributed finding within Experts requires
separate editorial selection of the source edition, interpretation and limitations.
No catalog entry implies FinKore endorsement or upstream conformance.

## Local maintenance

Use the [maintained Node toolchain](../../docs/tools/README.md#supported-node-setup). After
installing repository dependencies, edit `repositories.json` and run:

```bash
npm run code-evidence:build
npm run code-evidence:check
npm run code-evidence:test
```

The build validates schema, identities, attribution and source pin consistency,
then writes only `catalog.md`. The check verifies the same local data and generated
listing without writing files or checking live GitHub state. Tests use synthetic
mutations of discovery metadata; they do not execute financial operations.

These optional commands are separate from contract verification, as with Research
maintenance. After a meaningful repository change also run `npm ci --no-audit` and
`npm run verify`. Catalog validation establishes structure and internal consistency,
not truth of financial claims, license-file verification or implementation conformance.
