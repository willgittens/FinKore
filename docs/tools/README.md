# Developer Tools

These scripts support local development and verification. They are not part of
the FinKore public API and MUST NOT define financial-domain behavior.

| Tool | Purpose | Package command |
| --- | --- | --- |
| `bootstrap-toolchains.js` | Install or validate repository-local Python, Java, and Maven toolchains. | `npm run tools:bootstrap`, `npm run tools:check` |
| `check-node-version.js` | Validate the release Node runtime and aligned package engine declarations. | `npm run node:check` |
| `check-doc-links.js` | Validate Markdown links and CoreDoc requirement references. | `npm run docs:check` |
| `check-traceability.js` | Cross-check specification requirements, traceability rows, vector metadata, and Agentic references. | `npm run traceability:check`, `npm run docs:check` |
| `check-architecture.js` | Enforce implementation dependency boundaries. | `npm run architecture:check` |
| `check-license.js` | Validate license metadata, headers, and repository license text. | `npm run license:check` |
| `compile-java.js` | Compile the Java core, adapter, and executable tests. | `npm run java:compile` |
| `test-java.js` | Run the compiled Java core tests. | `npm run java:test` |
| `coverage-python.js` | Measure Python unit and conformance coverage. | `npm run python:coverage` |
| `mutation-critical.js` | Run targeted critical mutation probes for Python and Java. | `npm run mutation:critical` |
| `check-packages.js` | Build and inspect local TypeScript, Python, and Java package artifacts without publishing them. | `npm run package:check` |

Run `npm run check` for the normal local validation suite. Run
`npm run verify` for the complete release suite. From a clean checkout, install
the locked Node dependencies first:

```bash
npm ci
npm run verify
```

The release command bootstraps and validates CPython 3.12 and 3.13, JDK 21,
and Maven 3.9.x; validates the supported Node 24 line; runs strict builds, unit
tests, CPython 3.13 compatibility, every conformance vector against all three
implementations, coverage, local package checks, both full Stryker suites, and
the targeted Python and Java critical mutation probes. It also includes the
documentation, traceability, architecture, license, and whitespace checks from
`npm run check`. The command downloads missing toolchains and package build
dependencies but does not publish artifacts.

## Mutation Scope and Survivor Classification

The Runner Stryker configuration covers every executable module responsible
for adapter dispatch, loading, manifest and vector validation, metadata,
filtering, comparison, execution, and reporting. It excludes the CLI process
wrapper, type-only modules, re-export files, non-normative console formatting,
and diagnostic error classes; the CLI is exercised through integration and
conformance tests. Module-initialized operation registries, validation regular
expressions, and tag tables are excluded from Stryker because the Vitest worker
imports them before mutant activation. Exact registry assertions and explicit
valid/invalid boundary tests cover those static declarations instead; the
runtime parsing and validation branches that consume them remain in mutation
scope.

The TypeScript Stryker configuration covers every executable financial-domain
module, including Audit redaction, timestamp handling, serialization and
currency validation, and portable error-code carriers. It excludes type-only
modules, re-export files, and narrowly annotated static regular-expression
construction that Vitest imports before mutant activation; exact public
acceptance and rejection boundary tests cover those expressions.

A surviving mutant is release-critical when it can change accepted input,
exact financial output, portable error selection, ordering, identity,
atomicity, immutability, or deterministic behavior. Such a survivor blocks the
release even if the aggregate score exceeds 95 percent. Survivors are
non-critical only when they alter non-normative diagnostics or are equivalent
under the portable observable contract. Targeted Python and Java probes apply
the same rule to timestamp precision and syntax, Money allocation range and
ordering, Audit actor validation, and the other critical requirements listed
in `conformance/traceability.md`.

## Local Packaging Proof

Milestone packaging checks use local artifacts only. They do not publish to npm,
PyPI, Maven Central, or any other registry.

The executable gate is:

```bash
npm run package:check
```

Representative component commands:

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
