# Developer Tools

These scripts support local development and verification. They are not part of
the FinKore public API and MUST NOT define financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `bootstrap-toolchains.js` | Install or validate repository-local Python, Java, and Maven toolchains. | `npm run tools:bootstrap`, `npm run tools:check` |
| `check-doc-links.js` | Validate Markdown links and CoreDoc requirement references. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, traceability rows, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-architecture.js` | Enforce implementation dependency boundaries. | `npm run architecture:check` |
| `check-license.js` | Validate license metadata, headers, and repository license text. | `npm run license:check` |
| `compile-java.js` | Compile the Java core, adapter, and executable tests. | `npm run java:compile` |
| `test-java.js` | Run the compiled Java core tests. | `npm run java:test` |
| `coverage-python.js` | Measure Python unit and conformance coverage. | `npm run python:coverage` |
| `mutation-critical.js` | Run targeted critical mutation probes for Python and Java. | `npm run mutation:critical` |

Run `npm run check` for the normal local validation suite. Run
`npm run verify` for the complete local suite, including conformance, coverage,
and critical mutation probes.

## Local Packaging Proof

Milestone packaging checks use local artifacts only. They do not publish to npm,
PyPI, Maven Central, or any other registry.

Representative commands:

```bash
npm run build
npm pack --workspace @finkore/typescript --pack-destination /tmp/finkore-packaging

.tools/bin/python3.12 -m pip wheel implementations/python/core --no-deps --wheel-dir /tmp/finkore-packaging
.tools/bin/python3.12 -m pip install 'setuptools>=69' --target /tmp/finkore-packaging/build-backend
(cd implementations/python/core && PYTHONPATH=/tmp/finkore-packaging/build-backend ../../../.tools/bin/python3.12 -c "import setuptools.build_meta as build_meta; build_meta.build_sdist('/tmp/finkore-packaging')")

.tools/bin/mvn -f implementations/java/core/pom.xml package
.tools/bin/mvn install:install-file \
  -Dfile=implementations/java/core/target/finkore-java-core-0.1.0.jar \
  -DpomFile=implementations/java/core/pom.xml \
  -DlocalRepositoryPath=/tmp/finkore-packaging/m2
```

These commands only build and consume implementation artifacts. They do not
define financial behavior.
