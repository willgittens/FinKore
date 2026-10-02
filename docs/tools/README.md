# Developer Tools

These scripts support local artifact and documentation verification. They are
not part of the FinKore financial contract and MUST NOT define or execute
financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `validate-conformance.js` | Validate the manifest, declared paths, vector JSON Schema, vector files, global vector ID uniqueness, declared portable error codes, and manifest/supplementary paired-control references. | `npm run conformance:check` |
| `check-agentic.js` | Cross-check canonical operations, required descriptor content, allowed registry effect values, specification requirements, portable errors, and manifest vector use. | `npm run agentic:check` |
| `check-architecture.js` | Enforce specification-only repository boundaries and local-only verification. | `npm run architecture:check` |
| `check-node-version.js` | Validate the Node runtime used by repository-local tools. | `npm run node:check` |
| `check-doc-links.js` | Validate local Markdown paths and fragments plus known CoreDoc requirement prefixes, IDs, abbreviations, and ranges. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, modalities, permitted coverage classifications, per-domain/total inventories, COVERED/PARTIAL evidence, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-license.js` | Validate license metadata, source headers, and repository license text. | `npm run license:check` |

Run the local checks after installing the locked Node dependency:

```bash
npm ci
npm run check
```

`npm run conformance:check` validates the published acceptance artifacts as
data. It does not execute their financial operations, test an implementation,
or establish that any vector has passed.

`conformance/boundary097-cases.json` supplies the only supported supplementary
paired-control namespace. The validator reads its case identifiers, portable
error references, and paired-control links for metadata integrity only. It does
not schema-validate those historical cases as current vectors, add them to
manifest counts, or execute them.

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
