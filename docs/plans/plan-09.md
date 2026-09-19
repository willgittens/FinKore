# FinKore Core 0.9 Plan

## Status

In progress. This document is non-normative. Version 0.9 is the
release-candidate phase for FinKore Core 1.0.

## Objective

FinKore Core 0.9 freezes the normative candidate, proves that its implementations
can be consumed outside the monorepo, and exposes any remaining public-API,
packaging, documentation, or portability defects before 1.0.

The release is stabilization work. New financial domains and speculative
features do not enter 0.9.

## Entry criteria

- [x] FinKore Core 0.8 has been released.
- [x] The five-domain candidate scope is fixed.
- [x] Compatibility and conformance claim policies are documented.
- [x] Canonical and conformance-local operation boundaries are explicit.
- [x] All three implementations pass the 0.8 manifest.

## Milestone 1 — Normative release-candidate freeze

Create the exact behavioral candidate intended to become 1.0.

### Tasks

- [x] Declare the 0.9 specification and CoreDoc to be the 1.0 release candidate.
- [x] Freeze existing requirement IDs, portable error codes, operation IDs, and
      serialization shapes.
- [x] Review every normative MUST and MUST NOT for ambiguity, conflicting
      precedence, and undefined observable results.
- [x] Review SHOULD, SHOULD NOT, and MAY requirements to ensure they do not imply
      mandatory behavior accidentally.
- [x] Review terminology shared across Money, Workflow, Audit, Approvals, and
      Entities.
- [x] Verify that cross-domain refinements do not silently contradict their base
      domain rules.
- [x] Verify error precedence wherever more than one invalid condition can be
      observed.
- [x] Verify failure atomicity for every state-changing operation.
- [x] Allow normative changes after freeze only to fix a demonstrated
      contradiction, ambiguity, or portability defect.
- [x] Require every accepted normative correction to update specification,
      conformance, implementations, tests, and public documentation together.

### Completion criteria

- [x] No known normative question blocks portable implementation.
- [x] The candidate can become 1.0 without planned behavioral changes.

### Result

Milestone 1 declares FinKore Core 0.9 and CoreDoc as the Core 1.0 release
candidate. The compatibility surface is frozen in the specification conventions:
requirement IDs, portable error codes, canonical operation IDs, and normative
serialization shapes may change only through a documented correction for a
demonstrated contradiction, ambiguity, or portability defect. Existing Open
Questions remain non-normative future-scope notes unless conformance
traceability classifies one as a blocking specification gap.

## Milestone 2 — Public API review

Review each language as an independent, idiomatic implementation of the same
portable behavior.

### Tasks

- [x] Inventory the intentional public API of the TypeScript package.
- [x] Inventory the intentional public API of the Python package.
- [x] Inventory the intentional public API of the Java package.
- [x] Remove or make internal any accidentally exported implementation detail.
- [x] Review construction, serialization, mutation, and error surfaces in all
      three languages.
- [x] Confirm exact decimal behavior without unsafe binary floating-point
      shortcuts.
- [x] Confirm that portable consumers rely on error codes rather than exception
      or class names.
- [x] Confirm that immutable-value and failure-atomicity guarantees are visible
      in each public API.
- [x] Review TypeScript JSDoc for every intentional public symbol.
- [x] Review the equivalent public documentation for Python and Java.
- [x] Confirm that each implementation README describes its current API and
      limitations without historical milestone narration.
- [x] Document any implementation-specific resource limit without turning it
      into portable financial semantics.

### Completion criteria

- [x] Each implementation exposes a deliberate and documented public surface.
- [x] No implementation API silently broadens or weakens the specification.
- [x] API changes expected before 1.0 have been completed.

### Result

Milestone 2 inventories the intentional TypeScript, Python, and Java public
surfaces in their implementation READMEs. TypeScript exposes only the package
root and no longer re-exports Money serialization helper functions from the
package entry point. Java conformance observation helpers for Approval and
Entity vectors are no longer public core methods; the Java conformance adapter
owns its observation shaping. Python's top-level `finkore.__all__` is documented
as the intentional package surface. Implementation-specific runtime and numeric
limits are documented as package facts, not portable FinKore semantics.

## Milestone 3 — Packaging and external-consumption proof

Test the implementations as consumers will receive them, rather than only from
inside the repository.

### Tasks

- [x] Decide whether TypeScript, Python, and Java artifacts will be officially
      published with Core 1.0 or remain reference implementations.
- [x] Keep Core release versions distinct from implementation package versions.
- [x] Require each package to declare the FinKore Core version it implements.
- [x] Finalize package names, descriptions, licenses, exported files, and runtime
      version requirements.
- [x] Produce a TypeScript package archive locally.
- [x] Install the TypeScript archive into an empty consumer project and execute
      representative public API calls.
- [x] Build a Python wheel and source distribution locally.
- [x] Install the Python artifact into a clean virtual environment and execute
      representative public API calls.
- [x] Build the Java JAR locally.
- [x] Consume the Java artifact from a separate minimal Maven project and
      execute representative public API calls.
- [x] Verify that source packages exclude tests, generated reports, local
      toolchains, and repository-only developer files unless intentionally
      shipped.
- [x] Verify MPL-2.0 license and notice inclusion in every distributable.
- [x] Document local release commands under `docs/tools` if additional release
      tooling is required.
- [x] Ensure every new permanent script begins with a comment explaining its
      purpose and contains no financial-domain behavior.

### Completion criteria

- Each intended artifact builds and installs without relying on monorepo-relative
  paths.
- A clean consumer can use the documented public API.
- Publication status is explicit; the repository does not imply that private or
  unpublished artifacts are available from a registry.

### Result

Milestone 3 keeps the TypeScript, Python, and Java packages as repository
reference implementations for the 0.9 release candidate rather than claiming
registry publication. Each package declares the implemented FinKore Core version
separately from its artifact version. Local packaging proof produced and
consumed an npm archive, Python wheel and source distribution, and Java JAR from
clean consumer projects. Distributables include MPL-2.0 license and notice files
and exclude tests, generated reports, local toolchains, and repository-only
developer files.

## Milestone 4 — Conformance and quality release candidate

Exercise the frozen candidate across languages and plausible defects.

### Tasks

- [x] Freeze the release-candidate conformance manifest and schema compatibility
      version.
- [x] Run every manifest vector against TypeScript, Python, and Java.
- [x] Confirm that all implementations report identical normalized observations.
- [x] Review all not-directly-testable classifications and their justifications.
- [x] Add regression vectors for every defect found during API and packaging
      review when the behavior is portable and normative.
- [x] Run runner and TypeScript mutation testing at the configured quality gate.
- [x] Run the complete cross-language critical-mutant probes.
- [x] Confirm that no known critical financial mutant survives.
- [x] Run all configured coverage gates.
- [x] Run architecture checks confirming that implementations do not depend on
      conformance or Agentic metadata for financial behavior.
- [x] Perform clean-environment verification with only declared toolchain
      dependencies available.
- [x] Record defects in the normal development tracker or merge request rather
      than adding repository audit reports.

### Completion criteria

- The frozen candidate passes the full local verification pipeline.
- All three implementations agree on the complete portable manifest.
- No known release-blocking portability, packaging, or financial defect remains.

### Result

Milestone 4 freezes `conformance/manifest.json` as the Core 0.9
release-candidate manifest with `finkoreConformance` syntax compatibility
version `0.1`. TypeScript, Python, and Java each passed all 254 manifest-listed
vectors with 0 failures, 0 unsupported vectors, and 0 infrastructure errors, so
their normalized observations agree with the same portable expected results.

Traceability remains at 313 covered requirements, 68 not directly testable
requirements, and 0 uncovered, deferred, or blocking specification gaps. No API
or packaging-review defect required a new portable regression vector.

The full local verification pipeline passed with the declared local toolchains.
Runner and TypeScript Stryker mutation gates exceeded the configured 95% break
thresholds at 98.88% and 98.28%. The cross-language critical-mutant probes
killed 24 of 24 configured critical mutants. Coverage gates passed for runner,
TypeScript, Python, and Java. No repository audit report was added.

## Milestone 5 — Documentation and migration review

Make the 1.0 candidate understandable without requiring knowledge of the draft
history.

### Tasks

- [ ] Review the root README, CoreDoc, specification indexes, conformance
      documentation, Agentic Contract, implementation guide, adapter onboarding,
      and implementation READMEs.
- [ ] Ensure documentation distinguishes normative behavior from examples,
      implementation choices, and conformance evidence.
- [ ] Replace obsolete “experimental implementation” wording with accurate
      release-candidate language while retaining the pre-1.0 warning.
- [ ] State all intentionally unsupported areas clearly.
- [ ] Verify that deferred topics are not described as planned 1.0 behavior.
- [ ] Document the expected migration from the latest pre-0.9 public API if an
      external consumer could be affected.
- [ ] Check all local documentation links and CoreDoc requirement references.
- [ ] Confirm that no deleted research, examples, draft-report, script, or
      GitHub Actions path is referenced.

### Completion criteria

- A new implementer can locate the normative behavior, conformance evidence,
  operation metadata, and implementation boundaries directly.
- Documentation accurately describes the frozen candidate and its exclusions.

## Release gate

0.9 is complete only when:

- [ ] the normative candidate is frozen;
- [ ] there are no known release-blocking specification ambiguities;
- [ ] public APIs have been reviewed in all three languages;
- [ ] intended distribution artifacts install in clean consumer projects;
- [ ] all three implementations pass the same frozen manifest;
- [ ] coverage and mutation requirements pass;
- [ ] documentation is release-candidate ready;
- [ ] all verification remains runnable locally without GitHub Actions;
- [ ] only fixes, not planned features, remain before 1.0;
- [ ] release notes contain a concise 0.9 summary.
