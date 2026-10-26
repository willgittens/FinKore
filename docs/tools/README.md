# Developer Tools

These scripts support artifact and documentation verification locally and in
CI. They are not part of the FinKore financial contract and MUST NOT define or
execute financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `validate-conformance.js` | Validate the manifest, declared paths, vector JSON Schema, vector files, global vector ID uniqueness, declared portable error codes, and paired-control references among manifest-listed vectors. | `npm run conformance:check` |
| `check-agentic.js` | Cross-check canonical operations, required descriptor content, allowed registry effect values, specification requirements, portable errors, and manifest vector use. | `npm run agentic:check` |
| `check-architecture.js` | Enforce specification-only repository boundaries and developer-tool headers. | `npm run architecture:check` |
| `check-node-version.js` | Validate the Node runtime used by repository-local tools. | `npm run node:check` |
| `check-doc-links.js` | Validate local Markdown paths and fragments plus known CoreDoc requirement prefixes, IDs, abbreviations, and ranges. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, modalities, permitted coverage classifications, per-domain/total inventories, COVERED/PARTIAL evidence, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-license.js` | Validate license metadata, source headers, and repository license text. | `npm run license:check` |
| `build-learn-coredoc.js`, `build-learn-pages.js` | Generate the CoreDoc reader, home index and linked document readers, or check that they match canonical Markdown without writing files. | `npm run learn:build`, `npm run learn:check` |
| `check-release-content.js` | Inspect a proposed stable publication tree for obsolete artifacts, coherent Core status, and static HTML content and links. | `npm run release:check` |

## Supported Node setup

The maintained tools require Node `>=24.11.0 <25`; npm installs the locked
maintenance dependency and invokes the repository scripts. Check the active
runtime first:

```bash
node --version
npm --version
```

If a compatible repository-local runtime already exists at
`.tools/node/bin/node`, place it first on `PATH` for the current shell:

```bash
export PATH="$PWD/.tools/node/bin:$PATH"
npm run node:check
```

If no compatible runtime exists, download an official Node 24 archive whose
version satisfies the declared range, verify it against the publisher's
`SHASUMS256.txt`, and extract or link it so that `.tools/node/bin/node` and its
bundled npm are present. The ignored `.tools/` directory is local bootstrap
state and must not be committed. The repository does not require Python, Java,
Maven, or language-package toolchains.

## Verification and dependency review

Run the local checks after installing the locked Node dependency:

```bash
npm ci --no-audit
npm run check
```

The install may require registry access when the npm cache is cold. The
`--no-audit` option keeps vulnerability lookup separate from installation.
Once dependencies are present, `npm run check` and its `npm run verify` alias
are deterministic local checks and do not contact an advisory service.

Run the network-backed dependency review separately when required:

```bash
npm run dependencies:audit
```

Report its date and whether it used fresh registry advisory data. An optional
`npm audit --offline` result is limited to advisory data already available in
the local npm cache and must not be described as a fresh network audit.

`npm run conformance:check` validates the published acceptance artifacts as
data. It does not execute their financial operations, test an implementation,
or establish that any vector has passed.

The manifest is the only vector discovery entry point. Paired-control references
must resolve to manifest-listed vectors, including controls in other declared
files. Unlisted files neither contribute vector counts nor supply controls.

`npm run check` is deterministic and local. It validates repository structure,
published artifact syntax, stable identifiers, requirement traceability,
Agentic metadata, documentation links, and licensing. It does not require
Python, Java, a financial implementation, an adapter, or a runner.

The permanent tool tests include valid controls and negative CLI-result checks
for undeclared vector errors, missing paired controls, incomplete Agentic
descriptors, invalid effect values, incorrect traceability totals/modalities,
unsupported classifications, invalid PARTIAL evidence, unknown CoreDoc prefixes
or IDs, and missing Markdown fragments. A rejected adversarial fixture must fail
with the intended diagnostic; a crash is not a passing validator result.

## GitHub Actions verification

[The Verify workflow](../../.github/workflows/verify.yml) runs on Pull Requests
into `main`, pushes to `main`, and manual dispatch. Its stable job ID is `verify`
and its exact required status check name is **Verify repository**. It uses an
Ubuntu runner, Node 24 (validated against `package.json`), lockfile-based npm
caching, `npm ci --no-audit`, and `npm run verify`. Superseded PR runs are
cancelled, and the job has a 15-minute timeout.

The workflow uses GitHub-maintained checkout and Node setup actions pinned to
commit SHAs. Checkout does not persist credentials. The repository token has
only `contents: read`; no repository secrets are passed to contributor code,
and the workflow uses `pull_request`, never `pull_request_target`.

`npm run verify` already covers the Node version, architecture, conformance
schemas and vectors, Agentic consistency, maintenance-tool tests, specification
requirement traceability, Markdown links, generated Learn synchronization,
licenses, and whitespace checks. There is no maintained TypeScript compilation
or financial implementation test gate. Dependency advisory review and stable
publication checks remain separate, as described here; ordinary CI does not
publish or certify consumer implementations.

Repository settings and the single-maintainer merge policy are documented in
[Contributing](../../CONTRIBUTING.md#manual-github-configuration).

## Stable publication gate

Run the separate publication check on a proposed release tree:

```bash
npm run release:check -- /absolute/path/to/proposed-release
```

With no path, it checks the current checkout. This is a required stable-release
gate, separate from `npm run verify`: development verification remains usable
while an active working plan and candidate status exist. The publication gate
rejects planning files or copied planning content, references to removed plans
or case supplements, retired freeze rules, and stale Core status in current
prose, including inline scope wording. It reads text and paths without financial
execution, mutation, or network access.

The publication checker exports the deliberately selected target
`TARGET_CORE_VERSION`, currently `2.0.2`; maintainers must review and update that
value for a later Core release. README, CoreDoc, each specification document,
conformance and Agentic READMEs, and any retained Learn index must explicitly
declare `FinKore Core 2.0.2 stable` (or `FinKore Core 2.0.2 is stable`). CoreDoc's
version and status fields must agree. Matching every document to an arbitrary
different version does not satisfy the selected release target.
For a patch target, unqualified major-minor wording may still describe the
compatible major baseline, but it cannot serve as the current stable declaration.
Historical release versions and CoreDoc evolution metadata remain historical;
schema syntax, maintenance-package versions, and stable vector IDs are not Core
status. The only removed-rule exceptions are one concise retirement paragraph
in release history and the designated adversarial JSON fixture under tool tests.
Test and validator source files themselves are scanned.

The retained Learn profile includes a home index, a generated CoreDoc reader,
and six generated document readers for getting started, the project overview,
licensing, contributing, implementation guidance, and release notes.
The home index pairs its introductory text with the local `learn/img/Finkore.png`
logo directly over the hero background. It loads no scripts. Scripted
presentation is limited to closing the mobile CoreDoc index after selecting a
link. Native `details` elements provide the CoreDoc index, mobile navigation and
rule history. The other document readers use native `details` for their mobile
indexes and load no scripts. The gate checks local HTML destinations, Markdown
and HTML fragments, placeholders, duplicate anchors, and unsupported interactive controls.
CoreDoc rule headings retain their source Markdown fragments alongside the
reader's shorter rule permalinks.
Inline handlers, home-page scripts, playback buttons, and forms remain outside
this reviewed profile. Remote resources are rejected. External links are limited
to the homepage founder CTA to `https://www.linkedin.com/in/will-gittens/`, the homepage and
project overview partner link to `https://savoiabarker.com/`, the project
overview link to `https://finkore.dev`, and the licensing reader link to the
official Mozilla FAQ at `https://www.mozilla.org/en-US/MPL/2.0/FAQ/`. All must use
`target="_blank"` and
`rel="noopener noreferrer"`. The checker validates these destinations and their
attributes without contacting those websites. The dark Partners section follows
the README's acknowledgments and links, displaying transparent local logos
directly on the dark background.
The founder section uses a light palette and responsive grid, with a local
portrait of Will Gittens. All Learn pages share the header's local FinKore logo
and navigation, and the dark footer's project resource links. The primary
navigation follows this order: Where to start, CoreDoc, Github Project. The last
link retains the highlighted button style and opens the official repository at
`https://github.com/willgittens/FinKore` in a new tab with
`rel="noopener noreferrer"`. The release checker permits this exact external
destination only on the known Learn pages.
Repository file links on these pages use
`https://github.com/willgittens/FinKore/blob/main/` with the repository-relative
path and original fragment. They open in a new tab with the same safe link
attributes. This includes Markdown, JSON artifacts, `LICENSE`, and `CODEOWNERS`.
The checker validates their file paths and any fragments against the local tree
without contacting GitHub; other repositories and branches remain outside this
allowance. Local HTML links must stay inside `learn/`, which is the published
site root at `https://finkore.dev/`. Relative navigation and asset paths also
support serving the directory under a URL prefix. CSS font paths are relative
to their stylesheet.
The reader permits the exact deferred
`js/coredoc.js` script when `core-mobile-index` exists; it closes that native
disclosure on link activation and adds no new controls.

The reader at [learn/coredoc.html](../../learn/coredoc.html) and the marked CoreDoc
index block in [learn/index.html](../../learn/index.html) are generated from
[CoreDoc](../coreDoc/core-doc.md). Run `npm run learn:build` after changing the
canonical document or the renderer. Do not edit generated content directly.
The renderer supports the document's current Markdown structure and rejects
unsupported block structures. It preserves rule wording, identifiers, governance
metadata and specification references; it does not define financial behavior.
`npm run learn:check`, included in `npm run docs:check` and `npm run verify`,
compares the CoreDoc outputs and all six document readers with their sources
without writing files. The release gate also checks synchronization before allowing historical rule metadata in the
reader. Changes to either generated output or its source require regeneration.

The additional readers are generated by `build-learn-pages.js`:

| Canonical Markdown | Learn reader |
| --- | --- |
| `docs/where-to-start.md` | [Where to start](../../learn/where-to-start.html) |
| `README.md` | [About the project](../../learn/about.html) |
| `LICENSING.md` | [Licensing](../../learn/licensing.html) |
| `CONTRIBUTING.md` | [Contribute](../../learn/contributing.html) |
| `docs/implementation-guide.md` | [Implementation guide](../../learn/implementation-guide.html) |
| `docs/releases/README.md` | [Release notes](../../learn/releases.html) |

The source documents remain canonical. Links between converted documents point
to their HTML readers, including from the home page and CoreDoc; each reader
also offers its Markdown source on GitHub. Markdown destinations without a
local HTML reader, including specifications, conformance guidance, Agentic
documentation, governance, and tool guidance, link to the corresponding file on
GitHub's `main` branch. Other repository files outside `learn/` also use GitHub
links so the site does not depend on parent directories being published. The readers cover the introductory guide and the
documents linked directly by the home page and CoreDoc; they do not recursively
publish the repository.

The document renderer preserves headings and fragments, paragraphs, lists,
tables, fenced code and the README's local images and website links. Unsupported
block forms fail generation. Regenerate with `npm run learn:build` after changing
any of these sources or their renderer. The publication check requires exact
source synchronization before treating generated release notes as historical
content; it still validates all HTML links and controls. Historical licensing
references in the derived licensing reader retain the source policy's license
exception, with synchronization checked by `npm run learn:check`.

Review the additional readers at desktop and mobile widths for readable prose,
tables and code, keyboard navigation, section links, and no horizontal overflow.

Review CoreDoc discovery and reading at desktop and mobile widths, including
native disclosure keyboard behavior, direct rule links, previous/next navigation,
source references and no-JavaScript access. The five principles and detailed-rule
count describe CoreDoc; the specification requirement count is a separate level.

Review the rendered index at desktop and mobile widths for text/logo balance,
logo contrast, keyboard navigation, and no horizontal overflow. These
static publication checks do not execute a browser or establish general HTML
correctness.

The scan omits only root checkout state (`.git`, `.tools`, `node_modules`,
`.npm-cache`, `coverage`, `dist`, and `reports`). Do not include that state in a
release artifact. Symlinks and opaque compressed archives are rejected because
their publication contents are not inspected. Renamed planning copies are
detected through plan filenames and document/milestone headings; maintainers
must also review the proposed file list for other copied development reports.

Exercise the gate on a disposable proposed-release copy during preparation.
Promote only reviewed status and scope text there; preserve requirement meaning,
vector contents, format versions, and CoreDoc evolution metadata. A passing copy
does not promote the checkout. Before tagging, install locked dependencies,
run `npm run verify`, run the separately required `npm run dependencies:audit`,
and run `npm run release:check` on the actual final tree after removing the last
working plan. Record only concise release history in the existing release notes.
