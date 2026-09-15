# Draft 0.5 Cross-Language Governance

## Status

Accepted as the Milestone A governance record for Draft 0.5 on 2026-09-15.

This document records the shared baseline, independence procedure, selected
toolchains, conformance bridge boundary, and CI quality matrix for the Python
and Java implementation tracks. It is non-normative. CoreDoc and `/spec` remain
the source of financial behavior; `/conformance` records portable observations;
`/agentic` records canonical operation semantics.

## Scope

Draft 0.5 proves that the closed FinKore Core Draft 0.4 behavior can be
implemented outside TypeScript:

- Python targets full manifest-listed Draft 0.4 conformance.
- Java targets the full current Money suite only.
- TypeScript remains a regression implementation after behavior is derived from
  the specification and conformance artifacts.
- No Python or Java conformance is claimed until the relevant vectors pass with
  zero failures, unsupported results, or infrastructure errors.

## Baseline Artifacts

The Draft 0.5 implementation baseline is repository revision
`d130b2a9dccfbfa50e10e692c1b91866b0fce878`.

| Artifact | Baseline |
| --- | --- |
| Core version | FinKore Core Draft 0.4 |
| Conformance manifest format | `0.1` |
| Vector-file format | `0.1` |
| Vector schema | `conformance/vector.schema.json` |
| Runner package | `@finkore/conformance-runner` `0.1.0` |
| TypeScript core package | `@finkore/typescript` `0.1.0` |
| TypeScript conformance adapter | `@finkore/typescript-conformance-adapter` `0.1.0` |
| Node range for TypeScript packages | `^22.18.0 || >=24.11.0` |

The reproducible baseline counts are:

| Count | Value |
| --- | ---: |
| Indexed requirements | 381 |
| Manifest-listed suites | 5 |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 244 |
| Money vectors | 83 |
| Manifest operation labels | 35 |
| Canonical Agentic operations | 20 |
| Conformance-local operation labels | 15 |
| Mutation-sensitive vectors | 217 |
| Portable error codes | 31 |

Run `npm run baseline:draft0.5` after artifact changes. A count change is not
itself wrong, but it must be explained by the task that changed the artifact set.

## Finding Register

Draft 0.5 findings use stable `D05-*` identifiers and one classification:
`EDITORIAL`, `CLARIFICATION`, `NORMATIVE CHANGE`, `CONTRADICTION`,
`PORTABILITY BLOCKER`, `CONFORMANCE DEFECT`, `IMPLEMENTATION DEFECT`, or
`TOOLING DEFECT`.

Each finding must record:

- owner;
- status;
- classification;
- affected CoreDoc, specification, conformance, Agentic, implementation, and
  test artifacts;
- affected requirement IDs, vectors, operations, and portable errors;
- evidence and minimal reproducer where applicable;
- alternatives considered;
- release effect;
- accepted resolution; and
- maintainer acceptance.

Blocking release effects:

| Classification | Release effect |
| --- | --- |
| `NORMATIVE CHANGE` | Blocks the affected claim until accepted and synchronized across required artifacts. |
| `CONTRADICTION` | Blocks the affected claim until the authoritative conflict is resolved. |
| `PORTABILITY BLOCKER` | Blocks the affected slice and Draft 0.5 closure until resolved. |
| `CONFORMANCE DEFECT` | Blocks affected conformance claims until corrected or scoped out with an accepted decision. |
| `TOOLING DEFECT` | Blocks only the affected verification path unless it prevents faithful conformance evidence. |
| `IMPLEMENTATION DEFECT` | Blocks only claims made by the defective implementation. |
| `CLARIFICATION` | Does not block when it only makes existing evidenced behavior explicit. |
| `EDITORIAL` | Does not block when there is no semantic effect. |

TypeScript behavior may be evidence for regression comparison, but it is never
dispositive evidence for a finding. The authority order is CoreDoc, `/spec`,
`/conformance`, `/agentic`, then implementations.

The durable release-level register starts in
[Draft 0.5 Release Notes](releases/draft-0.5.md).

## Independence Procedure

For each domain slice:

1. Read CoreDoc, `/spec`, relevant `/conformance` vectors, and relevant
   `/agentic` operation metadata before reading TypeScript financial code.
2. Record any ambiguity or disagreement as a `D05-*` finding before choosing
   implementation semantics.
3. Write language-native tests from requirement IDs, boundary cases, invariants,
   and negative cases.
4. Implement the smallest idiomatic language-native behavior.
5. Run selected vectors, then the full claimed scope.
6. Use TypeScript only afterward for regression comparison or adapter diagnosis.

Allowed references before implementing financial behavior:

- CoreDoc and `/spec`;
- `conformance/manifest.json`, vector files, schema, conventions, and
  traceability;
- `agentic/operations.md` and related Agentic metadata;
- runner adapter types, CLI behavior, normalized-result shape, filtering, and
  report semantics;
- language-neutral implementation and adapter onboarding guides.

Prohibited shortcuts:

- copying or translating TypeScript core financial algorithms;
- treating conformance fixture shapes as production schemas;
- using TypeScript behavior to resolve undefined semantics;
- generating financial-domain source from another implementation;
- using binary floating point for Money behavior;
- silently rounding, normalizing opaque identifiers, inferring time, or
  converting currencies.

Infrastructure plumbing may reuse runner contracts or generated adapter glue
when it contains no financial rule and its generated origin is documented.

## Toolchains and Layouts

Python selected baseline:

- Runtime: CPython 3.12 is the required CI floor; CPython 3.13 is a
  compatibility check.
- Local toolchain: use system Python only when it satisfies the required
  version; otherwise run `npm run tools:bootstrap:draft0.5` and use
  `.tools/bin/python3.12` or `.tools/bin/python3.13`.
- Package layout when created by TASK-213:
  `implementations/python/core/src/finkore/` for core code and
  `implementations/python/adapters/conformance/` for adapter infrastructure.
- Package/build: `pyproject.toml` using a standard PEP 517 backend.
- Static analysis and formatting: `mypy --strict` and `ruff`.
- Tests and coverage: `pytest` and `coverage.py`.
- Mutation/equivalent: `mutmut` or an accepted documented equivalent for
  critical financial behavior.
- Documentation: docstrings plus generated API documentation.
- Exact decimal strategy: parse decimal strings into `decimal.Decimal` under
  FinKore plain-decimal validation; do not rely on implicit context precision
  for Money operations.
- Time strategy for future slices: timezone-aware instants; no host timezone
  defaults.

Java selected baseline:

- Runtime: JDK 21 is the required CI floor.
- Local toolchain: use system Java only when it provides JDK 21 and Maven 3.9.x;
  otherwise run `npm run tools:bootstrap:draft0.5` and use `.tools/bin/java`,
  `.tools/bin/javac`, and `.tools/bin/mvn`.
- Package layout when created by TASK-226:
  `implementations/java/core/src/main/java/org/finkore/` for core code and
  `implementations/java/adapters/conformance/` for adapter infrastructure.
- Package/build: Maven project metadata with package coordinates rooted at
  `org.finkore`.
- Static analysis and formatting: compiler warnings as errors where practical,
  Checkstyle or Spotless, and Error Prone or an accepted equivalent once the
  build is introduced.
- Tests and coverage: JUnit 5 and JaCoCo.
- Mutation/equivalent: PIT mutation testing or an accepted documented
  equivalent for critical financial behavior.
- Documentation: Javadoc for public API symbols.
- Exact decimal strategy: `BigDecimal` or exact coefficient/scale values parsed
  from strings with explicit validation; do not use binary floating point or
  `BigDecimal.equals` for Money numeric equality.
- Time strategy for future slices: `Instant` or `OffsetDateTime`; no JVM default
  timezone semantics at the portable boundary.

Dependency policy:

- Language cores must not depend on `/runner`, `/conformance`, `/agentic`,
  TypeScript, JavaScript, another language implementation, HTTP frameworks,
  persistence frameworks, or agent tooling.
- Adapters may depend on runner contracts and language cores.
- Test-only and adapter dependencies must not leak into production core APIs.

## Cross-Process Adapter Boundary

The TypeScript runner remains domain-neutral and loads a JavaScript adapter
module. Python and Java conformance adapters will use a thin JavaScript bridge
when needed to start and communicate with a language subprocess.

The bridge protocol is conformance infrastructure only. It is not normative
serialization and not a production FinKore API.

Required bridge behavior:

- request framing includes operation ID, input, optional context, and vector
  identity for diagnostics;
- response framing is converted to the existing normalized result envelope;
- `supports` returns false only for genuinely unsupported operation labels;
- `reset` clears vector-local subprocess state before supported execution;
- path resolution is repository-relative or adapter-owned, never inferred from
  filesystem enumeration order;
- stdout carries machine-readable responses, while stderr is diagnostic only;
- crashes, timeouts, malformed JSON, invalid normalized result shapes, and
  missing binaries map to `INFRASTRUCTURE_ERROR`;
- domain failures return portable `FINKORE_*` codes, not infrastructure errors;
- unsupported, failed, timed-out, and infrastructure-error vectors cannot be
  reported as passing.

Adapters translate fixture inputs and native outputs. They must not implement
financial rules that belong in a language core.

## CI and Quality Matrix

Required Draft 0.5 checks:

| Check | Required now | Required for final Python claim | Required for final Java Money claim |
| --- | ---: | ---: | ---: |
| Clean package installation | Yes | Yes | Yes |
| TypeScript build, typecheck, and unit tests | Yes | Yes | Yes |
| TypeScript full conformance regression | Yes | Yes | Yes |
| Baseline count check | Yes | Yes | Yes |
| Documentation references | Yes | Yes | Yes |
| License check | Yes | Yes | Yes |
| Git diff check after generated outputs | Yes | Yes | Yes |
| Python runtime availability | Advisory until TASK-213 | Yes | No |
| Python package build/static/unit tests | No package yet | Yes | No |
| Python full manifest conformance | No package yet | Yes | No |
| Python coverage and mutation/equivalent | No package yet | Yes | No |
| Java JDK availability | Advisory until TASK-226 | No | Yes |
| Java package build/static/unit tests | No package yet | No | Yes |
| Java Money conformance | No package yet | No | Yes |
| Java coverage and mutation/equivalent | No package yet | No | Yes |

The workflow in `.github/workflows/draft-0.5.yml` provisions the selected
Python and Java toolchain floors through the repository-local `.tools`
bootstrapper and labels those jobs as pre-implementation toolchain checks.
Local development must use the same fallback rule before executing Python or
Java package tasks. The downloaded toolchains remain ignored local artifacts,
not committed source. Later milestones must replace the placeholders with real
package, conformance, coverage, mutation, documentation, and architecture gates
as soon as the relevant package skeletons exist.
