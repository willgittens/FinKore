# Developer Tools

These scripts support local artifact and documentation verification. They are
not part of the FinKore financial contract and MUST NOT define or execute
financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `validate-conformance.js` | Validate the manifest, declared paths, vector JSON Schema, vector files, and global vector ID uniqueness. | `npm run conformance:check` |
| `check-agentic.js` | Cross-check canonical operations, descriptors, specification requirements, portable errors, and manifest vector use. | `npm run agentic:check` |
| `check-architecture.js` | Enforce specification-only repository boundaries and local-only verification. | `npm run architecture:check` |
| `check-node-version.js` | Validate the Node runtime used by repository-local tools. | `npm run node:check` |
| `check-doc-links.js` | Validate Markdown links and CoreDoc requirement references. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, traceability rows, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-license.js` | Validate license metadata, source headers, and repository license text. | `npm run license:check` |

Run the local checks after installing the locked Node dependency:

```bash
npm ci
npm run check
```

`npm run conformance:check` validates the published acceptance artifacts as
data. It does not execute their financial operations, test an implementation,
or establish that any vector has passed.

`npm run check` is deterministic and local. It validates repository structure,
published artifact syntax, stable identifiers, requirement traceability,
Agentic metadata, documentation links, and licensing. It does not require
Python, Java, a financial implementation, an adapter, or a runner.
