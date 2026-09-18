# FinKore Core 0.9 Plan

## Status

Planned. This document is non-normative and depends on completion of the 0.8
release gate. Version 0.9 is the release-candidate phase for FinKore Core 1.0.

## Objective

FinKore Core 0.9 freezes the normative candidate, proves that its implementations
can be consumed outside the monorepo, and exposes any remaining public-API,
packaging, documentation, or portability defects before 1.0.

The release is stabilization work. New financial domains and speculative
features do not enter 0.9.

## Entry criteria

- [ ] FinKore Core 0.8 has been released.
- [ ] The five-domain candidate scope is fixed.
- [ ] Compatibility and conformance claim policies are documented.
- [ ] Canonical and conformance-local operation boundaries are explicit.
- [ ] All three implementations pass the 0.8 manifest.

## Milestone 1 — Normative release-candidate freeze

Create the exact behavioral candidate intended to become 1.0.

### Tasks

- [ ] Declare the 0.9 specification and CoreDoc to be the 1.0 release candidate.
- [ ] Freeze existing requirement IDs, portable error codes, operation IDs, and
      serialization shapes.
- [ ] Review every normative MUST and MUST NOT for ambiguity, conflicting
      precedence, and undefined observable results.
- [ ] Review SHOULD, SHOULD NOT, and MAY requirements to ensure they do not imply
      mandatory behavior accidentally.
- [ ] Review terminology shared across Money, Workflow, Audit, Approvals, and
      Entities.
- [ ] Verify that cross-domain refinements do not silently contradict their base
      domain rules.
- [ ] Verify error precedence wherever more than one invalid condition can be
      observed.
- [ ] Verify failure atomicity for every state-changing operation.
- [ ] Allow normative changes after freeze only to fix a demonstrated
      contradiction, ambiguity, or portability defect.
- [ ] Require every accepted normative correction to update specification,
      conformance, implementations, tests, and public documentation together.

### Completion criteria

- No known normative question blocks portable implementation.
- The candidate can become 1.0 without planned behavioral changes.

## Milestone 2 — Public API review

Review each language as an independent, idiomatic implementation of the same
portable behavior.

### Tasks

- [ ] Inventory the intentional public API of the TypeScript package.
- [ ] Inventory the intentional public API of the Python package.
- [ ] Inventory the intentional public API of the Java package.
- [ ] Remove or make internal any accidentally exported implementation detail.
- [ ] Review construction, serialization, mutation, and error surfaces in all
      three languages.
- [ ] Confirm exact decimal behavior without unsafe binary floating-point
      shortcuts.
- [ ] Confirm that portable consumers rely on error codes rather than exception
      or class names.
- [ ] Confirm that immutable-value and failure-atomicity guarantees are visible
      in each public API.
- [ ] Review TypeScript JSDoc for every intentional public symbol.
- [ ] Review the equivalent public documentation for Python and Java.
- [ ] Confirm that each implementation README describes its current API and
      limitations without historical milestone narration.
- [ ] Document any implementation-specific resource limit without turning it
      into portable financial semantics.

### Completion criteria

- Each implementation exposes a deliberate and documented public surface.
- No implementation API silently broadens or weakens the specification.
- API changes expected before 1.0 have been completed.

## Milestone 3 — Packaging and external-consumption proof

Test the implementations as consumers will receive them, rather than only from
inside the repository.

### Tasks

- [ ] Decide whether TypeScript, Python, and Java artifacts will be officially
      published with Core 1.0 or remain reference implementations.
- [ ] Keep Core release versions distinct from implementation package versions.
- [ ] Require each package to declare the FinKore Core version it implements.
- [ ] Finalize package names, descriptions, licenses, exported files, and runtime
      version requirements.
- [ ] Produce a TypeScript package archive locally.
- [ ] Install the TypeScript archive into an empty consumer project and execute
      representative public API calls.
- [ ] Build a Python wheel and source distribution locally.
- [ ] Install the Python artifact into a clean virtual environment and execute
      representative public API calls.
- [ ] Build the Java JAR locally.
- [ ] Consume the Java artifact from a separate minimal Maven project and
      execute representative public API calls.
- [ ] Verify that source packages exclude tests, generated reports, local
      toolchains, and repository-only developer files unless intentionally
      shipped.
- [ ] Verify MPL-2.0 license and notice inclusion in every distributable.
- [ ] Document local release commands under `docs/tools` if additional release
      tooling is required.
- [ ] Ensure every new permanent script begins with a comment explaining its
      purpose and contains no financial-domain behavior.

### Completion criteria

- Each intended artifact builds and installs without relying on monorepo-relative
  paths.
- A clean consumer can use the documented public API.
- Publication status is explicit; the repository does not imply that private or
  unpublished artifacts are available from a registry.

## Milestone 4 — Conformance and quality release candidate

Exercise the frozen candidate across languages and plausible defects.

### Tasks

- [ ] Freeze the release-candidate conformance manifest and schema compatibility
      version.
- [ ] Run every manifest vector against TypeScript, Python, and Java.
- [ ] Confirm that all implementations report identical normalized observations.
- [ ] Review all not-directly-testable classifications and their justifications.
- [ ] Add regression vectors for every defect found during API and packaging
      review when the behavior is portable and normative.
- [ ] Run runner and TypeScript mutation testing at the configured quality gate.
- [ ] Run the complete cross-language critical-mutant probes.
- [ ] Confirm that no known critical financial mutant survives.
- [ ] Run all configured coverage gates.
- [ ] Run architecture checks confirming that implementations do not depend on
      conformance or Agentic metadata for financial behavior.
- [ ] Perform clean-environment verification with only declared toolchain
      dependencies available.
- [ ] Record defects in the normal development tracker or merge request rather
      than adding repository audit reports.

### Completion criteria

- The frozen candidate passes the full local verification pipeline.
- All three implementations agree on the complete portable manifest.
- No known release-blocking portability, packaging, or financial defect remains.

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

