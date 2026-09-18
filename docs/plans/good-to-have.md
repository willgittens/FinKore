# FinKore Draft 0.5 to 1.0 Good-to-Have Roadmap

## Status

Proposed, non-normative planning guidance based on the closed FinKore Core Draft
0.4 baseline.

This document recommends the work most likely to turn FinKore from a strong
single-implementation specification foundation into a credible, independently
validated, portable 1.0 standard. It does not add financial behavior, reserve
release numbers, or override `/spec`, CoreDoc, `/conformance`, `/agentic`, or
release notes.

The sequence is intentionally evidence-first. New financial domains are not on
the critical path to 1.0 unless an accepted finding proves that one is required
to make the existing scope coherent.

## Target Outcome

FinKore 1.0 should be a stable standard for the existing Money, Workflow,
Audit, Approvals, and Entities scope, with:

- independently implemented behavior in multiple languages;
- explicit compatibility and conformance-claim rules;
- cross-domain scenarios proving that the primitives compose safely;
- external domain, accounting, technical, security, and privacy review;
- machine-readable Agentic operation metadata where operations are promoted;
- reproducible, versioned releases and consumable language packages; and
- no claim to be a ledger, ERP, payment processor, or complete accounting
  engine.

## Critical Path

The recommended order is:

```text
Independent implementations
        ↓
Portability and compatibility hardening
        ↓
Release correction and Java full-profile parity
        ↓
Cross-domain composition proof
        ↓
Agentic, security, and external review
        ↓
Release-candidate stabilization
        ↓
FinKore Core 1.0
```

## Draft 0.5 — Independent Cross-Language Proof

### Objective

Prove that the Draft 0.4 specification can be implemented without copying
TypeScript semantics or inventing language-specific financial behavior.

The execution sequence is defined by the
[Draft 0.5 Cross-Language Implementation Task List](draft-0.5-cross-language-task-list.md).

### Recommended Work

- Start Python and Java implementations from `/spec` and `/conformance`, using
  the TypeScript implementation only as regression evidence after behavior has
  been derived independently.
- Begin with the bounded Money slice identified in the
  [Python and Java handoff](../draft-0.5-python-java-handoff.md):
  representation, serialization, addition, subtraction, comparison, and
  rounding.
- Expand one domain slice at a time: remaining Money, Workflow, Audit,
  Approvals, then Entities.
- Give each implementation an adapter that reports unsupported operations
  honestly and cannot convert unsupported or infrastructure outcomes into
  passes.
- Require exact base-10 behavior, explicit rounding, portable error codes,
  deterministic inputs, failure atomicity, and immutable observations.
- Add language-native unit, boundary, regression, and mutation or equivalent
  defect-resistance tests.
- Record every reasonable implementer disagreement as a specification finding.
  Resolve ambiguities in `/spec` before aligning implementations.
- Keep Python and Java public APIs idiomatic. Do not standardize TypeScript class
  names, fixture envelopes, exception hierarchies, or folder structures.

### Exit Gate

- At least one non-TypeScript implementation passes the complete manifest-listed
  Draft 0.4 suite with zero failures, unsupported results, or infrastructure
  errors.
- The second new language passes the recommended Money slice and has a documented
  path to the complete suite.
- All discovered portability blockers are resolved or explicitly prevent the
  release from closing.
- No specification correction is justified only by matching existing
  TypeScript behavior.
- Conformance evidence and exact implementation revisions are recorded in the
  release notes.

## Draft 0.6 — Portability and Compatibility Hardening

### Objective

Define the limits and evolution rules needed for independent implementations to
remain compatible over time.

The execution sequence is defined by the
[Draft 0.6 Portability and Compatibility Hardening Task List](draft-0.6-portability-compatibility-task-list.md).

### Recommended Work

- Decide how portable decimal precision, scale, allocation-unit, and overflow
  capabilities are declared. Prefer a clear minimum capability contract plus
  explicit unsupported behavior over an unrealistic unbounded guarantee.
- Define the compatibility relationship between FinKore Core versions,
  conformance format versions, Agentic descriptor versions, and language package
  versions.
- Define what constitutes an additive, compatible, deprecating, or breaking
  change for:
  - normative requirements;
  - portable error codes;
  - canonical operation identifiers;
  - normative serialization;
  - conformance vectors and schemas; and
  - capability declarations.
- Define conformance profiles and the exact evidence required to claim full,
  domain, operation, or version-specific conformance.
- Add automated checks for requirement-ID uniqueness, orphan requirements,
  orphan vectors, operation-registry drift, portable-error drift, and invalid
  compatibility metadata.
- Establish immutable release tags, artifact checksums, and a reproducible
  baseline for every closed draft.
- Exercise large decimal values, extreme scales, Unicode identifiers, timestamp
  offsets, absent versus null values, and declared-order behavior across all
  implementations.

### Exit Gate

- Compatibility and deprecation policies are published and linked from the
  specification and release process.
- All supported implementations produce the same outcomes inside the declared
  portable capability floor.
- No unresolved numeric, representation, ordering, timestamp, identity, or
  error-precedence portability blocker remains.
- Conformance claims identify the exact Core version, conformance format,
  implementation version, supported profile, and evidence revision.

## Pre-Draft 0.7 — Release Correction and Java Parity

### Objective

Begin Draft 0.7 from reproducible Draft 0.6 release evidence and three
independent full-profile implementations rather than carrying release
provenance defects or Java's Money-only scope into composition work.

The execution sequence is defined by the
[Pre-Draft 0.7 Readiness Task List](pre-draft-0.7-readiness-task-list.md).

### Required Work

- Correct Draft 0.6 checksum, metadata, verification, tag/provenance, and
  documentation-evidence defects without rewriting the historical release or
  changing financial behavior.
- Extend Java from its complete Money profile to the complete existing Draft
  0.6 profile for Money, Workflow, Audit, Approvals, and Entities.

### Exit Gate

- Corrected Draft 0.6 claims and checksums reproduce from a clean checkout.
- A closure-grade verification path detects stale metadata, profile evidence,
  generated artifacts, checksums, and provenance.
- Java passes the complete Draft 0.6 full profile with zero failures,
  unsupported results, or infrastructure errors.
- TypeScript and Python full-profile regression evidence remains green.
- No Draft 0.7 composition semantics or future financial domain is introduced
  by the maintenance and parity work.

## Draft 0.7 — Cross-Domain Composition Proof

### Objective

Demonstrate that the existing primitives compose into realistic financial
workflows without silently inventing cross-domain semantics.

The execution sequence is defined by the
[Draft 0.7 Cross-Domain Composition Task List](draft-0.7-composition-task-list.md).

Current status: the reference expense approval and invoice correction profiles
are implemented in TypeScript, Python, and Java as non-normative examples.
Their actual results are cross-language compared, critical failure-boundary
observations are checked, and seeded critical composition mutants are killed.
Closure-grade verification and release-candidate checksums reproduce; Draft
0.7 is pending explicit release-identity approval. Draft 0.7 still does not add
a new Core conformance profile or production application policy.

### Recommended Work

- Begin with non-normative reference profiles for at least two bounded use cases,
  such as an expense approval and an invoice correction.
- Exercise end-to-end scenarios that combine:
  - Money calculation and allocation;
  - Entity identity, revision, mutability, and evolution;
  - Workflow transition and stale-precondition rejection;
  - Approval applicability, effectiveness, quorum, and rejection; and
  - Audit evidence and append-only history.
- Include negative scenarios proving that failed approval, validation, version,
  conflict, and Audit steps leave no partial observable financial state.
- Identify the logical transaction boundary between composed operations without
  prescribing a database, transaction manager, message broker, or deployment
  architecture.
- Specify only cross-domain behavior that is required for portable meaning.
  Leave application policy, authorization, persistence, and orchestration
  architecture outside Core unless an accepted requirement explicitly brings
  them into scope.
- Promote a reference-profile rule into normative Core behavior only through the
  normal specification-first process, with requirement IDs, vectors, portable
  errors where necessary, Agentic review, and implementation updates.
- Run every normative composition vector against all conforming language
  implementations.

### Exit Gate

- At least two realistic composition profiles have been independently
  implemented in TypeScript and at least one other language.
- Cross-domain failure atomicity and history-preservation cases pass in every
  implementation claiming the profile.
- Each behavior is clearly classified as normative Core behavior,
  conformance-only observation, or non-normative application guidance.
- No concrete ledger posting, tax, settlement, or persistence behavior has been
  introduced accidentally.

## Draft 0.8 — Agentic, Security, Privacy, and External Review

### Objective

Make the operation contract operationally discoverable and challenge the
financial and control model outside the original implementation context.

### Recommended Work

- Define a versioned machine-readable Agentic operation descriptor schema and a
  single canonical operation manifest.
- Generate or validate Markdown operation documentation and runner metadata
  against that manifest so operation IDs and effects cannot drift.
- Represent inputs, outputs, portable errors, preconditions, postconditions,
  effects, determinism, idempotency, finality, approval implications, and Audit
  implications without turning conformance fixtures into production APIs.
- Keep Approval operations conformance-local until their public input model,
  diagnostic policy, authorization boundary, and security review are stable.
- Define how clients discover supported subsets and associated conformance
  evidence. Capability advertisement alone must never imply conformance.
- Conduct documented external review with relevant perspectives:
  - accounting and financial controls;
  - financial-domain engineering;
  - cross-language implementation and API design;
  - security and abuse resistance; and
  - privacy, redaction, diagnostic disclosure, and data minimization.
- Review threats involving forged actor evidence, stale approvals, replayed or
  duplicated operations, Audit tampering, over-broad diagnostics, untrusted
  identifiers, and confused-deputy authorization boundaries.
- Record reviewer scope and actual disposition without implying certification,
  regulatory approval, or credentials that were not provided.

### Exit Gate

- Canonical operations are available through a versioned machine-readable
  manifest with automated drift detection.
- Security-sensitive preconditions and effects are explicit, while
  implementation-specific authorization remains clearly separated.
- Every material external-review finding is resolved, accepted with a documented
  limitation, or tracked as a blocker.
- External-review status is factual and traceable to exact artifacts.

## Draft 0.9 — Release Candidate and Adoption Proof

### Objective

Freeze the intended 1.0 behavior, prove that third parties can consume it, and
remove release-engineering barriers to responsible adoption.

### Recommended Work

- Declare a compatibility freeze for candidate 1.0 requirement IDs, portable
  errors, canonical operation IDs, and normative serialization.
- Publish release-candidate TypeScript, Python, and Java packages using normal
  ecosystem installation workflows.
- Remove private-package status where publication is intended and document
  runtime, compiler, and platform support matrices.
- Provide concise implementation, migration, capability-discovery, adapter, and
  conformance-claim documentation.
- Ask an implementer who did not design the original TypeScript library to build
  or extend an adapter using only published specification and onboarding
  material.
- Run bounded pilot integrations or shadow evaluations using representative
  financial workflows. Do not claim production safety merely because pilots
  pass.
- Establish vulnerability reporting, release provenance, dependency review,
  changelog, support, and deprecation processes.
- Produce reproducible CI evidence for build, static analysis, unit tests,
  coverage, conformance, mutation testing, documentation, licensing, package
  installation, and clean-room examples.
- Permit only blocker-level normative changes during the release-candidate
  period. Every such change must restart the affected review and conformance
  gates.

### Exit Gate

- All intended 1.0 packages can be installed and used from clean environments.
- At least one external implementer has completed the documented conformance
  workflow without relying on repository-private knowledge.
- The full candidate suite passes in every implementation claiming full 1.0
  conformance.
- There are no unresolved critical financial mutants, critical security
  findings, portability blockers, directly testable uncovered mandatory
  requirements, or stale documentation claims.
- Release artifacts, tags, checksums, licenses, and conformance evidence are
  reproducible.

## FinKore Core 1.0 — Stable Foundation

### Release Standard

FinKore Core 1.0 should close only when:

- `/spec` is the unambiguous source of truth for the declared 1.0 scope;
- CoreDoc and every normative requirement have stable, attributable evolution
  history;
- TypeScript and at least two independent non-TypeScript implementations pass
  the full conformance profile they claim;
- every directly testable mandatory requirement in the 1.0 scope has
  manifest-listed conformance evidence;
- critical financial behavior is mutation-hardened or protected by a documented
  equivalent technique in each reference-quality implementation;
- cross-domain composition profiles prove failure atomicity, identity stability,
  approval validity, and Audit evidence preservation;
- compatibility, deprecation, capability, and conformance-claim policies are
  active;
- the Agentic operation manifest is versioned, machine-readable, and aligned
  with `/spec` and `/conformance`;
- material accounting, domain, technical, security, and privacy review findings
  have explicit dispositions;
- public packages and release artifacts are reproducible and documented; and
- release language accurately distinguishes specified, implemented, conformant,
  unsupported, deferred, and not-yet-specified behavior.

The 1.0 claim should remain scoped. It should mean that the existing FinKore
foundation is stable and portable, not that every financial or accounting
domain has been standardized.

## Explicit Non-Goals Before 1.0

The following are valuable future domains but should not delay 1.0 unless they
become necessary to resolve an accepted blocker in the existing scope:

- double-entry journals and general ledger;
- accounting dates, periods, and close controls;
- tax, interest, depreciation, accrual, or revenue-recognition policy;
- FX sourcing and foreign-exchange accounting;
- reconciliation, payment, settlement, and banking rails;
- jurisdiction-specific statutory or retention requirements;
- a universal persistence or distributed transaction architecture;
- a universal IAM, RBAC, segregation-of-duties, or policy engine; and
- framework-specific UI, HTTP, ORM, or messaging integrations.

These areas should enter FinKore through separate, specification-first domain
milestones after the foundation has demonstrated independent portability.

## Priority When Capacity Is Limited

If only a small amount of work can be funded, prioritize in this order:

1. One clean-room non-TypeScript implementation with full conformance.
2. Compatibility, conformance-profile, and numeric-capability policies.
3. Cross-domain failure-atomicity profiles.
4. Independent accounting/domain and security/privacy review.
5. A machine-readable Agentic operation manifest with drift checks.
6. Public package, release, and adoption hardening.

Additional financial domains should follow these items rather than displace
them. The main risk before 1.0 is not insufficient breadth; it is believing that
a specification is portable, composable, and independently understandable
before outside implementations and reviewers have demonstrated those qualities.
