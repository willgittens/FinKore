# Developer Tools

These scripts support local development and verification. They are not part of
the FinKore public API and MUST NOT define financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `bootstrap-toolchains.js` | Install or validate repository-local Python, Java, and Maven toolchains. | `npm run tools:bootstrap`, `npm run tools:check` |
| `check-doc-links.js` | Validate Markdown links and CoreDoc requirement references. | `npm run docs:check` |
| `check-architecture.js` | Enforce implementation dependency boundaries. | `npm run architecture:check` |
| `check-license.js` | Validate license metadata, headers, and repository license text. | `npm run license:check` |
| `compile-java.js` | Compile the Java core, adapter, and executable tests. | `npm run java:compile` |
| `test-java.js` | Run the compiled Java core tests. | `npm run java:test` |
| `coverage-python.js` | Measure Python unit and conformance coverage. | `npm run python:coverage` |
| `mutation-critical.js` | Run targeted critical mutation probes for Python and Java. | `npm run mutation:critical` |

Run `npm run check` for the normal local validation suite. Run
`npm run verify` for the complete local suite, including conformance, coverage,
and critical mutation probes.
