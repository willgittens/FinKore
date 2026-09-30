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
| `mutation-result.js` | Classify mutation results, rejecting infrastructure failures and missing regression failures. | `npm run tools:test` |
| `check-packages.js` | Build, inspect, install, and import local TypeScript, Python, and Java package artifacts without publishing them. | `npm run package:check` |

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
the targeted Python and Java critical mutation probes and native public-API
mutation probes for all three implementations. It also includes the
documentation, traceability, architecture, license, and whitespace checks from
`npm run check`. The command downloads missing toolchains and package build
dependencies but does not publish artifacts.

The root workspace and standalone runner both override Stryker's transitive
`qs` dependency to `^6.16.0`. The root override is necessary for workspace
installs; the runner's package-local override alone does not govern them.
Both lockfiles resolve the patched version. This affects development tooling,
not financial behavior or published implementation dependencies.

With npm 11.12.1, `npm ls qs` still reports the upstream `typed-rest-client`
exact pin as invalid in a workspace, including a fresh minimal workspace.
Locked installation and fresh dependency resolution both select `qs` 6.16.0,
and `npm audit` reports zero vulnerabilities. This dependency-tree diagnostic
is distinct from installation, audit, and executable verification results.

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
currency validation, and portable error-code carriers. It excludes only type-only
modules and re-export files. Core regular expressions are constructed inside
validation calls so Stryker can mutate them at runtime. All core tests, including
native integration suites, participate; no inline mutation exclusions remain.

A surviving mutant is release-critical when it can change accepted input,
exact financial output, portable error selection, ordering, identity,
atomicity, immutability, or deterministic behavior. Such a survivor blocks the
release even if the aggregate score exceeds 95 percent. Survivors are
non-critical only when they alter non-normative diagnostics or are equivalent
under the portable observable contract. Targeted Python and Java probes apply
the same rule to timestamp precision and syntax, Money allocation range and
ordering, Audit actor validation, and the other critical requirements listed
in `conformance/traceability.md`.

The Python Money probes also reintroduce Decimal-context rounding during
subtraction, negation, and allocation result construction. Each has a permanent
high-precision regression vector in the Money suite. Python Approval probes
restore native scalar equality or shallow object/array comparison and reject
unchanged Boolean facts. Permanent changed-fact regressions and an unchanged
structured-fact control detect these defects. The complete release verification
gate passes. The corrections and release steps are tracked in the
[Core 0.9.2 plan](../plans/plan-09.2.md).

A critical probe is killed only by a valid conformance report with behavioral
failures and no unsupported or infrastructure outcomes. Compilation failures,
process failures, malformed reports, and empty suites fail the gate. Every probe
must name its regression and at least one distinct paired control. That regression
must fail and every declared control must execute and pass. Core 0.9.3 adds this paired protection for Entity
import validation, Workflow comparison, Audit Actor validation and metadata
presence, and Audit ordinary JSON and declared Money comparison. Classification
tests run through `npm run tools:test`, included in `npm run check` and `npm run
verify`.

Both mutation tools now require an unmodified passing baseline, including every
named regression and control. Duplicate result identifiers are rejected.
`npm run mutation:native` mutates temporary source copies and reuses permanent
native tests for retained Workflow aliases, Approval record/evaluate sequences,
Entity returned-history reuse, and TypeScript Audit own-key copying. Every probe
must fail its named assertion or portable-error expectation while a paired valid
control passes. Unexpected runtime exceptions, skipped cases, compilation or
process failures, empty suites, and inconsistent reports fail verification.
The Python and Java helpers only select tests and classify their results;
financial behavior remains in the implementations and existing tests.

Core 0.9.5 Milestone 8 supplies regression/control pairs for every one of the
176 portable critical probes, including the older probes that previously accepted
any failing vector. Baselines still run each complete suite; every mutant still
runs its complete suite. Invalid probe metadata fails before mutation execution.
The 50 native probes include all four TypeScript Entity create/from ×
input/observation alias combinations. `npm run verify` also executes all 19 native
Python probes on CPython 3.13 with `npm run mutation:native:python:3.13`.
The TypeScript Stryker configuration includes the portable boundary integration
suite, whose fixture lookup works in isolated mutation copies. No mutation scope,
annotations, or minimum score was relaxed.

Core 0.9.5 Milestone 3 adds 13 native Money serialization probes, covering
truncation, implicit rounding, portable errors, scale validation, retained
presentation scales, and zero formatting. Run
`node docs/tools/mutation-native.js money-serialization` for this focused gate.
The optional argument filters probe IDs; an unmatched filter fails. Omitting it
retains every probe. Set `FINKORE_PYTHON_PATH=.tools/bin/python3.13` to exercise
Python compatibility. Raw runtime exceptions from serializer assertions remain
infrastructure failures, not mutation kills. These targeted results are not an
aggregate mutation score for the whole implementation.

Milestone 4 adds two Python instance-binding alias probes and twelve Workflow
conformance probes for core/adapter null handling, invalid-target priority, and
version mismatch rejection. Run `node docs/tools/mutation-native.js workflow`
and `node docs/tools/mutation-critical.js all workflow`. Existing guard ownership,
default-sequence, terminal-state, and JSON comparison probes remain included.

Audit cycle fixtures retain genuine self-references but bound member reads.
Correct validation detects the repeated reference immediately; a cycle-check
removal reaches an ordinary test error that fails the exact portable-error
assertions before Stryker's execution-count limiter intervenes. Mutation scope,
coverage selection, existing annotations, and the 95 percent gate are unchanged.

Core 0.9.4 adds paired Approval probes for lifecycle preservation, operation
kind overrides, ambiguous or previously invalidated withdrawal targets, and
missing, malformed, or ineffective quorum observations. Run the focused gate
with `node docs/tools/mutation-critical.js all approvals` after the unmodified
Approval suite passes. The optional final argument selects a suite; omitting it
retains all probes. A focused run does not establish the full release mutation
gate or an aggregate mutation score.

Core 0.9.5 Milestone 5 adds 17 Approval conformance probes for association
presence, valid null facts, subject identity, malformed eligibility, and complete
history validation. Each requires its named regression and a passing control.
The existing eligibility bypass probes now also name their required cases.
Run `node docs/tools/mutation-critical.js all approvals` and
`node docs/tools/mutation-native.js approval`; the latter includes two new
reused-history probes and the existing lifecycle-evidence sequence probes.
Use `FINKORE_PYTHON_PATH=.tools/bin/python3.13` for native compatibility probes.
Maven Approval coverage uses `-Dtest=ApprovalsVectorCoverageTest`, which discovers
all entries in the Approval vector files without a stale fixed vector count.

Core 0.9.5 Milestone 6 adds 16 native Audit probes for cycle rejection, error
context, valid shared structures, Event metadata validation, native numeric
classes, numeric coercion, and record input/accessor aliases. Run
`node docs/tools/mutation-native.js audit` for these and the two existing
TypeScript own-member probes, and `node docs/tools/mutation-critical.js all audit`
for the existing portable Audit gates. Python compatibility uses
`FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-audit`.
Native assertions let recursion/stack failures reach the classification helpers;
they must not wrap them as assertion failures. Maven Audit coverage selects
`-Dtest=AuditCoverageTest`, including the native boundary suite.

Milestone 4 adds Entity probes for Audit precedence and correspondence,
consistent imported and resulting histories, exact currentness keys, required
effects, and the bounded duplicate-reversal policy. Run
`node docs/tools/mutation-critical.js all entities` after the unmodified Entity
suite passes. Native Entity tests also execute the vectors directly against the
cores, so adapter-side observation preparation cannot hide missing core checks.
TypeScript evolution mutation testing can be focused with
`npm run test:mutation -w @finkore/typescript -- --mutate src/entities/entity-evolution.ts --testFiles 'test/entities/*.test.ts'`.

Core 0.9.5 Milestone 7 adds 14 portable Entity probes for binding loss/check
bypass, equal revision/conflict tokens, skipped declarations, and null expected
State/revision/conflict preconditions. The Entity suite includes 62 critical
probes in total. Two additional TypeScript native probes protect original and
exposed Entity definitions; run `node docs/tools/mutation-native.js entity` for
these and the two existing currentness sequence probes. Native TypeScript Entity
sequences live in `test/entities/boundaries.test.ts`, so the existing Stryker
Entity test glob discovers them without filesystem-dependent fixture discovery.
Run focused Entity mutation with
`npm run test:mutation -w @finkore/typescript -- --mutate src/entities/entity.ts`.
Run ordinary Vitest coverage/checks after Stryker finishes: its temporary test
copies otherwise overlap Vitest's default file discovery.

The Milestone 7 Entity Stryker review leaves six non-critical survivors: one
redundant optional conflict-token guard, two redundant Money shape guards
followed by the same caught decoder rejection, two private predicate catch
returns whose `undefined` remains falsy, and one diagnostic message string.
None changes portable errors, binding, validation, identity or financial data.
No exclusions or thresholds were changed.

The Core 0.9.2 survivor review distinguishes these non-critical cases:

- Runner diagnostic text, source labels, and error wrapping do not change
  infrastructure classification. The remaining record-type guard mutant still
  rejects JSON primitives through the required-field checks.
- Core diagnostic messages, class names, and optional diagnostic details do not
  change portable codes. Redundant validation guards and optional `undefined`
  fields retain the same portable results; Workflow identifiers and Entity Money
  values still undergo their downstream validators.
- Internal Approval flags or synthetic entries are equivalent where they are
  discarded before outcomes and actionable requirements are produced. Entity
  synthetic currentness keys cannot match validated composite keys. Clone-error
  and post-append defensive branches are unreachable through already-validated
  public inputs; Money rounding modes are validated before dispatch.

Critical survivors require permanent public-behavior tests. The 0.9.2 review
added cases for portable errors, malformed histories and imports, opaque scope
and quorum identifiers, and Audit optional fields and overlapping redaction
targets. Actor-redaction target strings are evaluated inside the matching and
redaction functions so Stryker can mutate them after module initialization.
No mutation exclusions or thresholds were relaxed.

## Local Packaging Proof

Milestone packaging checks use local artifacts only. They do not publish to npm,
PyPI, Maven Central, or any other registry.

The executable gate is:

```bash
npm run package:check
```

The gate creates all artifacts in or from an isolated temporary directory and
checks their allowlisted runtime, metadata, license, and notice content. It
rejects source tests, coverage or mutation reports, backup files, local
toolchains, and other repository-only material. It then performs isolated
consumer checks:

- installs the npm tarball into an empty Node project and exercises the public
  package root, Entity binding and declaration ownership, null preconditions,
  Approval association, and Audit own-member retention;
- installs each Python wheel and sdist into separate virtual environments on
  CPython 3.12 and 3.13, then checks lossless serialization, retained binding,
  import identity/null, validator, Approval association, and Audit cycle rejection;
  only build dependencies use the package index; the FinKore artifacts are local;
- installs the Java JAR into an isolated Maven repository, compiles an external
  consumer against it, and checks lossless serialization, Entity binding and null
  preconditions, validator rejection, and Audit numeric/cycle/ownership behavior.

Temporary consumer environments and artifacts are removed when the check
finishes. These checks only build and consume implementation artifacts. They do
not define financial behavior.

## Core 0.9.7 discovery and red regressions

`explore-boundaries.js` reconstructs the original 3,861-case sweep and expands it
with last-success/first-error seeds, depth-six paths, first/last array entries,
complete normalized results, input snapshots, and CPython 3.13. It runs built
adapters from `--root` and writes investigation data only. It does not decide
which implementation is correct. `classify-boundaries.js` applies the reviewed
[plan dispositions](../plans/plan-09.7.md); an unknown lead fails classification.

Use an isolated checkout of `4041ec2838d4cbcf9333b8c6c651affe9ee10500`, install its
locked dependencies, and build its TypeScript and Java adapters first. Preserve
that checkout's original manifest while exploring. Run the current tools against
it (replace the example absolute paths with your checkouts):

```bash
node /path/to/current/docs/tools/explore-boundaries.js --root /path/to/baseline --mode original --output /tmp/original.json
node /path/to/current/docs/tools/explore-boundaries.js --root /path/to/baseline --mode expanded --output /tmp/expanded.json
node /path/to/current/docs/tools/classify-boundaries.js /tmp/original.json /tmp/expanded.json --output /tmp/dispositions.json
```

For red-regression verification, overlay the current `conformance`/`spec`
metadata and the new test files onto a separate copy of that baseline. Do not
replace implementation or adapter sources. Ordinary native/adapter discovery
loads the manifest vectors and `conformance/boundary097-cases.json`. The latter
asserts domain results plus unchanged input without inventing mandatory optional
diagnostics; the runner's full-envelope comparisons remain unchanged.

TypeScript Stryker selection, Python unit/coverage discovery, Java native/Maven
coverage entry points, and installed consumers include the new regressions.
Native mutation execution first requires these regression suites to pass; a red
baseline is never counted as a killed mutant. The specific new financial
perturbations are added with their implementation corrections in M3–M7. M2
intentionally leaves financial tests red and cannot pass release verification.

## Composition milestone checks

Composition retains explicit scoped checks after M7 closes the red regressions.
The default complete-suite gates remain unchanged:

```sh
npm exec -w @finkore/typescript -- vitest run --config vitest.composition.config.ts --coverage
npm exec -w @finkore/typescript -- stryker run stryker.composition.config.json
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_composition_validation.py
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -p test_composition_validation.py
.tools/bin/mvn -f implementations/java/core/pom.xml -Dtest=CompositionValidationCoverageTest test
node docs/tools/mutation-critical.js all approvals approval.composition.evaluate
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-critical.js python approvals approval.composition.evaluate
node docs/tools/check-packages.js --composition
```

The optional fourth mutation argument selects an existing operation's vectors
and probes, with a passing baseline required first. Omitting it retains the full
suite. Package `--composition` runs installed composition consumers on npm,
Python wheel/sdist on both versions, and the JAR. Those same assertions also run
in the default complete package checks. Neither filter claims full conformance.

## Approval milestone checks

M4 checks the full Approval vector suite, returned-history reuse, and exact fact
comparison. Default complete-suite gates include the later M5–M7 regressions:

```sh
npm exec -w @finkore/typescript -- vitest run --config vitest.approvals.config.ts --coverage
npm exec -w @finkore/typescript -- stryker run stryker.approvals.config.json
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_approval_contracts.py
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -p test_approval_contracts.py
.tools/bin/mvn -f implementations/java/core/pom.xml -Dtest=ApprovalContractsCoverageTest test
node docs/tools/mutation-critical.js all approvals --paired
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-critical.js python approvals --paired
node docs/tools/mutation-native.js approval097
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-approval097
node docs/tools/check-packages.js --approvals
```

`--paired` retains the entire selected suite's passing baseline, then runs each
mutant's named regression and independent controls. Without the flag, each mutant
runs the entire selected suite. Native `approval097` probes require the dedicated
Approval contract baseline, including vector results and actual history reuse.
The complete native gate retains its broader baseline. Package `--approvals`
checks installed composition plus concrete history/facts/condition APIs in npm,
both Python wheel/sdist versions, and the JAR; these assertions also run by default.

## Native ownership milestone checks

M5 verifies the accepted Approval/Workflow native profile. Entity policy outside
that profile remains explicitly unresolved (D9). Complete-suite checks include the corrected M6–M7 regressions.

```sh
npm exec -w @finkore/typescript -- vitest run --config vitest.ownership.config.ts --coverage
npm exec -w @finkore/typescript -- stryker run stryker.ownership.config.json
PYTHONPATH=implementations/python/core/src .tools/bin/python3.12 -m unittest discover -s implementations/python/core/tests -p test_native_ownership.py
PYTHONPATH=implementations/python/core/src .tools/bin/python3.13 -m unittest discover -s implementations/python/core/tests -p test_native_ownership.py
.tools/bin/mvn -f implementations/java/core/pom.xml -Dtest=NativeOwnershipCoverageTest,ApprovalContractsCoverageTest test
node docs/tools/mutation-native.js ownership097
FINKORE_PYTHON_PATH=.tools/bin/python3.13 node docs/tools/mutation-native.js python-ownership097
node docs/tools/check-packages.js --ownership
```

The ownership probe filter requires a passing dedicated native baseline and
independent passing controls. It never counts infrastructure failure as a kill.
Installed ownership assertions run by default as well as under `--ownership`;
the scoped option stops before the full Entity assertions.


## Entity declaration reuse checks

M6's native suite includes Entity declaration/data keys and adjacent Workflow,
Approval, and Audit own-member controls. Its configuration runs all core tests, including the M7 malformed-import
regression, with focused Entity file coverage.

```sh
npm exec -w @finkore/typescript -- vitest run --config vitest.declarations.config.ts --coverage
npm exec -w @finkore/typescript -- stryker run stryker.declarations.config.json
node docs/tools/mutation-native.js declarations097
node docs/tools/check-packages.js --ownership
```

Stryker mutates the complete changed Entity implementation with the existing
95% threshold. Five native probes cover unsafe assignment, dropped declarations,
inherited permission/validator lookup, and shared field arrays; each requires a
passing baseline and independent control. The installed npm consumer exercises
actual returned declarations/observations and special-field mutation/transition
under both `--ownership` and the default package check. Python/Java ownership
controls also run under that option. It does not skip M7 in full release checks.


## Malformed-input milestone checks

M7 runs the complete native and adapter suites and manifest across TypeScript,
Python 3.12/3.13, and Java. Its TypeScript mutation configuration covers both
complete Entity files, uses every core test, and retains the 95% threshold:

```sh
npm exec -w @finkore/typescript -- stryker run stryker.malformed.config.json
node docs/tools/mutation-critical.js all entities --paired
node docs/tools/mutation-critical.js python audit --paired
node docs/tools/mutation-native.js
```

Paired probes check total mutability declarations, malformed field lists, exact
data/State errors, empty changes, null evolution histories, original-data
validation, and primary error preservation during adapter observations. The
Audit relationship-type probe models acceptance of malformed values; a raw
unhashable-value crash would be infrastructure failure, not a mutation kill.
The earlier inherited-State and Python import probes now target their shared
validation boundary; their named regressions and controls remain unchanged.
Legacy Approval native probes use the current owned-copy helper and shared
Decision-shape validator, retaining their original assertions. Run artifact-writing
package/coverage tasks before critical probes that copy those directories.
Scoped mutation verification does not replace M8's full release verification.

### Core 0.9.7 M8 review checks

`npm run mutation:critical` uses the existing `--paired` mode: each complete
selected suite must first pass unmodified; every Python/Java probe then runs its
named regression and independent controls. Full-suite mutation may produce
unrelated runtime failures after a validation guard is removed; such failures
are never mutation kills. Direct tool invocation without `--paired` remains
available for investigation. No probe or baseline requirement is removed.

`node docs/tools/mutation-native.js collections` checks 28 sparse-collection, iterator and method
bypasses against native regressions and valid controls. The collection suite has
300 cases; the independent invariant suite has 717. The hole probes deliberately
drop missing positions while preserving dense controls; the other probes restore
caller iteration, methods or selector aliases. Simply restoring `.map` could cause runtime exceptions, which are not
counted as behavioral kills. Core Stryker now includes all native integration
suites. Currency, decimal, event-type and timestamp regular expressions are
mutated at validation time; previous broad lexical exclusions are removed. The internal indexed Array
traversal helper participates in the complete mutation scope.
The threshold remains 95%. See the plan for full-candidate results and the
inspection of surviving, uncovered, ignored and timed-out mutations.

M8 exclusion audit also removed the remaining operator-family ignores. An
`EqualityOperator` ignore justified only `<` versus `<=` also excluded the
non-equivalent `>=` mutation; likewise an arithmetic-family ignore covered more
than its cited sign identity. No core mutation exclusions remain. Equivalent
mutants stay in the report/denominator for explicit review. No threshold is lowered.

The post-D10 M8 run passed all gates. Runner scalar input/context/observation
regressions kill the previously surviving object-type-check removal: the runner
scores 97.21% with 18 diagnostic/wrapping survivors. Core scores 96.34% with no
ignored mutants, or 96.03% without timeout credit. The plan records every
non-killed family and the exact verified candidate. D10 is now resolved;
`node docs/tools/mutation-native.js metadata097` checks eleven additional paired
metadata probes. The native gate has 156 probes (57 on the Python 3.13 repeat),
and 423 static anchor tests cover critical/native probe declarations. All probes
pass in the complete post-D10 verification with independent valid controls.
