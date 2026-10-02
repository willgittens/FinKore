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
