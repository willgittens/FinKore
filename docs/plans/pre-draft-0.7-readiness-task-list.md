# FinKore Pre-Draft 0.7 Readiness Task List

## 1. Purpose

This plan defines the two maintenance and implementation tasks that must finish
before normative Draft 0.7 cross-domain composition work begins:

1. correct the Draft 0.6 release-evidence and provenance defects; and
2. complete Java implementation parity for the existing Money, Workflow,
   Audit, Approvals, and Entities scope.

This plan continues task numbering after Draft 0.6. It is non-normative.
CoreDoc and `/spec` remain authoritative for financial behavior,
`/conformance` defines portable observations, `/agentic` defines canonical
operation semantics, and release notes record shipped results.

Neither task adds a financial domain or authorizes Draft 0.7 composition
semantics early. If execution reveals ambiguous or missing financial behavior,
record a specification finding and resolve it through the normal
specification-first process instead of copying TypeScript or Python behavior.

## 2. Starting Baseline

The starting baseline is the closed Draft 0.6 repository state described by:

- [Draft 0.6 Release Notes](../releases/draft-0.6.md);
- [Draft 0.6 Portability and Compatibility Task List](draft-0.6-portability-compatibility-task-list.md);
- [Draft 0.6 Compatibility, Claims, and Provenance Policy](../draft-0.6-compatibility-claims-provenance-policy.md);
- [Draft 0.6 Metadata](../../conformance/draft-0.6/README.md);
- [Conformance Traceability](../../conformance/traceability.md); and
- [Draft 0.5 Python and Java Handoff](../draft-0.5-python-java-handoff.md).

The opening implementation claims are:

- TypeScript: `finkore.core.draft0_6.full`, 254/254 vectors;
- Python: `finkore.core.draft0_6.full`, 254/254 vectors; and
- Java: `finkore.core.draft0_6.domain.money`, 93/93 vectors, with Workflow,
  Audit, Approvals, and Entities unsupported.

The immutable `core-draft-0.6` tag is historical evidence and MUST NOT be
moved, rewritten, or silently replaced. Any correction must follow the Draft
0.6 correction and revocation policy and preserve the original tag, claims,
and checksum record for traceability.

## 3. Scope and Sequencing

```text
TASK-256 — Draft 0.6 correction
        ↓
TASK-257 — Java full-profile parity
        ↓
Draft 0.7 normative composition work may begin
```

Exploratory Draft 0.7 use-case research may occur while these tasks are in
progress, but it MUST remain non-normative and MUST NOT create requirements,
portable errors, canonical operations, conformance vectors, or conformance
claims before this readiness gate closes.

## 4. Tasks

### - [x] TASK-256 — Correct Draft 0.6 Release Evidence and Provenance

**Depends on:** TASK-255.

**Objective:** Correct the Draft 0.6 checksum, metadata, verification, tag, and
documentation-evidence defects without changing the existing financial
behavior or rewriting historical release evidence.

**Required investigation and governance:**

- Register the identified release-evidence defect using the Draft 0.6 finding
  and correction policy.
- Classify whether the correction requires a patch-level Core identity, a
  release-evidence correction identity, or both. Do not assume that a Core
  version, implementation package version, conformance format, profile, and
  evidence revision must share a number.
- Identify every affected claim, checksum, profile, artifact, release note,
  tag statement, and verification command.
- Preserve `core-draft-0.6` and its original checksum manifest as historical
  evidence. Record replacement or superseding evidence explicitly.
- Confirm that no normative financial behavior, requirement identifier,
  portable error, canonical operation, or conformance outcome changes. If one
  does, stop and apply specification-first change governance.

**Implementation deliverables:**

- Make checksum input discovery independent of ignored or ambient working-tree
  files. Release-relevant committed artifacts must be derived from an explicit,
  deterministic source inventory.
- Either exclude generated coverage/build reports from release-source
  checksums, or classify each generated artifact explicitly and record the
  deterministic command and inputs that reproduce it.
- Strengthen the checksum schema and validator to enforce the accepted
  provenance policy, including artifact identity/kind and generated-artifact
  reproduction metadata where applicable.
- Add negative regression fixtures for ignored coverage files, missing
  generated artifacts, stale generated output, artifact-kind omissions,
  checksum drift, and tag/source-revision disagreement.
- Add one closure-grade verification command that runs the required toolchain,
  baseline, build, static analysis, unit, adapter, profile-aware conformance,
  coverage, mutation or accepted equivalent, metadata, checksum,
  architecture, documentation, licensing, and clean-tree checks in a safe
  order.
- Ensure coverage or mutation execution cannot invalidate checksum evidence
  that the same verification workflow subsequently claims as reproducible.
- Add a checked-in CI workflow that executes the closure-grade verification
  path from a clean checkout with the declared Node, Python, Java, and Maven
  toolchains.
- Reproduce the corrected claim and checksum evidence from a clean checkout
  and from the intended immutable correction identity.
- Synchronize the root README, specification status, CoreDoc status, Draft 0.6
  release notes, release index, compatibility inventory, task records, claim
  records, and correction record so none simultaneously describe Draft 0.6 as
  both pending and closed.

**Verification:**

- Run the closure-grade verification command from a clean checkout.
- Run it once with no pre-existing ignored build or coverage output and once
  after all coverage and mutation commands have generated their normal output.
- Verify that checksum reproduction produces identical committed evidence in
  both cases.
- Verify all TypeScript and Python full-profile claims and the Java Money
  profile claim with zero failures, unsupported results, or infrastructure
  errors in their declared scopes.
- Verify the correction identity resolves to the exact recorded commit and
  checksum-manifest digest.
- Run documentation, architecture, license, and `git diff --check` validation.

**Acceptance:**

- A clean checkout reproduces the recorded source and generated evidence.
- The closure-grade command fails if metadata, profile evidence, checksums, or
  provenance are stale or inconsistent.
- The original Draft 0.6 tag and claims remain recoverable and are not
  rewritten.
- The correction record identifies affected and replacement evidence and its
  compatibility impact.
- All current Draft 0.6 financial conformance outcomes remain unchanged.
- Documentation describes one consistent release state.

**Current status:** Complete. The corrected checksum manifest is reproducible
for 316 release-relevant artifacts, metadata validation passes, and
`npm run verify:closure:draft0.6` completed from a clean committed worktree at
commit `d001916e` through coverage, mutation, metadata, checksum, architecture,
documentation, licensing, whitespace, and clean-tree checks. The historical
`core-draft-0.6` tag remains preserved.

### - [x] TASK-257 — Complete Java Full-Profile Implementation Parity

**Depends on:** TASK-256.

**Objective:** Extend Java from its conformant Money-only scope to an
independent implementation of the complete existing Draft 0.6 profile before
Draft 0.7 relies on cross-domain composition.

**Implementation order:**

1. Workflow definitions, instances, guards, transitions, terminal behavior,
   version binding, import observations, and conflict preconditions.
2. Audit Events, Actors, Changes, append-only history, redaction
   representations, and Audit Relationships.
3. Approval Requirements, Decisions, validity, Conditions, Chains, lifecycle,
   and bounded composition.
4. Entity identity, lifecycle, mutability, validation, revisions, import, and
   evolution with required Audit evidence.

Each domain slice must be derived from `/spec` and the manifest-listed
conformance vectors. TypeScript and Python may be used as regression evidence
after the expected behavior is derived; they are not normative sources.

**Public API and architecture deliverables:**

- Provide idiomatic, typed Java domain APIs. Conformance-fixture `Map` and
  `Object` shapes must remain at adapter/portable-serialization boundaries and
  must not become the default production API solely for adapter convenience.
- Preserve the dependency direction Runner → Java Conformance Adapter → Java
  Core. Java Core must not depend on the runner, conformance fixtures,
  TypeScript, Python, agent frameworks, persistence, HTTP, or UI frameworks.
- Carry portable error codes without making Java exception class names or
  messages portable semantics.
- Preserve exact decimal behavior, explicit time and facts, declared order,
  omitted-versus-null distinctions, opaque identity, deterministic execution,
  failure atomicity, and immutable observations.
- Add meaningful Javadoc for every intentional public class, interface,
  record, enum, factory, and operation, including relevant requirement IDs,
  mutation behavior, return guarantees, and portable errors.
- Keep APIs small and domain-oriented; do not introduce persistence,
  transaction-manager, framework, or hypothetical extension abstractions.

**Testing and conformance deliverables:**

- Add Java-native positive, negative, boundary, invariant, regression, and
  non-mutation tests for every new domain slice.
- Add adapter support only after the corresponding Java Core behavior exists;
  the adapter must translate and normalize but must not implement financial
  rules.
- Run the applicable domain profile after each slice and retain unsupported
  reporting for domains not yet completed.
- Expand coverage and mutation testing across all Java domains. Meet the
  project mutation target or document an accepted equivalent while ensuring
  that no critical financial mutant survives.
- Run the full Draft 0.6 profile only after all five domains are implemented.
- Update Java capability metadata and create a Java full-profile claim only
  when all 254 required vectors pass with zero failures, unsupported results,
  or infrastructure errors.
- Version the Java package independently according to its public API and
  packaging policy; do not infer its version from the Core draft number.

**Verification:**

- JDK 21 and Maven 3.9.x compile/static checks.
- Java unit and adapter tests.
- Java coverage and mutation or accepted equivalent evidence.
- Per-domain conformance during implementation.
- `finkore.core.draft0_6.full`: 254/254 passing with zero failure,
  unsupported, and infrastructure outcomes.
- Cross-language actual-result comparison against TypeScript and Python for
  the full profile.
- Architecture, documentation, metadata, checksum, licensing, and clean-tree
  checks.

**Acceptance:**

- Java supports Money, Workflow, Audit, Approvals, and Entities without
  financial logic in its adapter.
- Java passes the complete Draft 0.6 full profile and accurately publishes the
  resulting capability and claim evidence.
- All critical Java financial mutants are killed.
- Public Java APIs are documented, typed, and usable independently of
  conformance fixture envelopes.
- TypeScript and Python full-profile regression evidence remains green.
- No deferred Draft 0.7 composition behavior or future financial domain has
  been implemented accidentally.

**Current status:** Complete. Java now implements Money, Workflow, Audit,
Approvals, and Entities, and `npm run conformance:java:profile:full` passes
254/254 vectors with zero failures, unsupported results, or infrastructure
errors. Capability metadata points to the Java full-profile claim recorded
against commit `e79ff010428a959dd7cae59948eab7ce5d79bab9`, and the historical
Java Money claim remains as original Draft 0.6 release evidence.

## 5. Pre-Draft 0.7 Exit Gate

Normative Draft 0.7 implementation may begin only when:

- [x] TASK-256 is complete and its correction evidence is reproducible from a
  clean committed worktree;
- [x] TASK-257 is complete and Java passes the full Draft 0.6 profile;
- [x] TypeScript, Python, and Java full-profile evidence is current and records
  zero failures, unsupported results, and infrastructure errors;
- [x] no unresolved release-provenance, specification, portability,
  conformance, implementation, or critical mutation blocker remains;
- [x] public documentation consistently distinguishes Core versions, package
  versions, profiles, claims, and evidence revisions; and
- [x] Draft 0.7 planning begins from the corrected immutable baseline rather
  than a moving branch or unqualified local worktree.

## 6. Completion Review

Before this plan closes, answer explicitly:

```text
Was the Draft 0.6 historical tag preserved unchanged?
Can a clean checkout reproduce every corrected claim and checksum?
Does the closure-grade command fail on stale metadata or generated artifacts?
Did Java derive every financial outcome from /spec rather than another implementation?
Does Java pass every full-profile vector with zero unsupported results?
Are adapter fixture shapes kept out of the default Java domain API?
Are critical financial mutants killed across every Java domain?
Did any discovered ambiguity receive a specification finding instead of an invented implementation rule?
Did any Draft 0.7 composition or future financial-domain behavior enter scope prematurely?
Are all affected tests, Javadoc, READMEs, metadata, claims, and release records current?
```

## 7. Current Execution Status

```text
NEXT CODEX TASK: begin Draft 0.7 planning from the corrected committed baseline.
```

TASK-256 and TASK-257 are complete. TASK-257 implementation work is bound to
commit `e79ff010428a959dd7cae59948eab7ce5d79bab9`; TASK-256 closure evidence
was verified from clean committed worktree commit `d001916e`. Draft 0.7
normative composition work may now begin from the corrected baseline.
