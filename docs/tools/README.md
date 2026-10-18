# Developer Tools

These scripts support local artifact and documentation verification. They are
not part of the FinKore financial contract and MUST NOT define or execute
financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `validate-conformance.js` | Validate the manifest, declared paths, vector JSON Schema, vector files, global vector ID uniqueness, declared portable error codes, and paired-control references among manifest-listed vectors. | `npm run conformance:check` |
| `check-agentic.js` | Cross-check canonical operations, required descriptor content, allowed registry effect values, specification requirements, portable errors, and manifest vector use. | `npm run agentic:check` |
| `check-architecture.js` | Enforce specification-only repository boundaries and local-only verification. | `npm run architecture:check` |
| `check-node-version.js` | Validate the Node runtime used by repository-local tools. | `npm run node:check` |
| `check-doc-links.js` | Validate local Markdown paths and fragments plus known CoreDoc requirement prefixes, IDs, abbreviations, and ranges. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, modalities, permitted coverage classifications, per-domain/total inventories, COVERED/PARTIAL evidence, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-license.js` | Validate license metadata, source headers, and repository license text. | `npm run license:check` |
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

The retained Learn profile is a local documentation index with one presentation
enhancement: the examples carousel. The gate checks local HTML destinations,
Markdown and HTML fragments, placeholders, duplicate anchors, and unsupported
interactive controls. Only the exact deferred script tag for
`js/examples.js` in `learn/index.html` and its `previous`, `next`, and `toggle`
buttons targeting `example-slides` are accepted. Inline handlers, other scripts,
remote links, and forms remain outside this reviewed profile.

The carousel displays authored illustrations linked to existing requirements
and acceptance cases; it does not load or execute financial behavior. It waits
at least eight seconds between automatic changes and restarts that interval
after manual navigation. Rotation pauses while the card is hovered, focused,
expanded, offscreen, or in a hidden document. Reduced-motion preferences disable
automatic rotation by default and remove the transition animation. A visible
control lets the reader pause or enable rotation. Without JavaScript, the first
example and its sources remain readable, and carousel controls stay hidden.

Review the rendered index for layout, keyboard navigation, manual cycling,
timer resets, pause conditions, and reduced motion. These static publication
checks do not execute a browser or establish general HTML correctness.

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
