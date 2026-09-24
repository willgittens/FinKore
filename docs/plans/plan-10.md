# FinKore Core 1.0 Plan

## Status

Stable promotion is blocked by the additional Approval, Entity evolution,
Workflow, and Audit defects tracked in the [Core 0.9.4 corrective plan](plan-09.4.md).
The locally tagged [Core 0.9.3 release](plan-09.3.md) passes its existing
verification gate and retains the earlier corrections, but the subsequent
review demonstrates missing behavioral coverage. Core 0.9.4 must close those
findings and pass its expanded release gate before 1.0 promotion resumes.
Remote publication of the 0.9.3 snapshot remains pending GitHub authentication.

The stable 1.0 milestones below remain uncompleted. This document remains
non-normative and does not declare Core 1.0 stable. In this filename, `10`
means version 1.0, not version 0.10.

## Objective

FinKore Core 1.0 publishes the first stable language-neutral baseline for Money,
Workflow, Audit, Approvals, and Financial Entities. Stability applies to the
defined observable financial contract and its published compatibility promises;
it does not mean that FinKore implements every accounting domain.

## Stable 1.0 scope

- Exact Money representation, serialization, arithmetic, comparison, rounding,
  Rates, and Allocation.
- Workflow definitions, states, transitions, guards, terminal behavior, version
  binding, import observations, and conflict preconditions.
- Audit actors, events, changes, append-only history, redaction, relationships,
  and portable errors.
- Approval requirements, conditions, decisions, validity, chains, and bounded
  composition.
- Financial Entity identity, lifecycle, mutability, validation, revisions,
  imports, and bounded evolution with required Audit evidence.
- Canonical Agentic operation contracts explicitly promoted before the 0.9
  freeze.
- Language-independent conformance vectors and a domain-neutral runner contract.

## Explicit 1.0 exclusions

- Double-entry ledger and journal posting.
- Accounting periods and closing policy.
- Reconciliation, payments, settlement, tax, FX sourcing, and jurisdictional
  policy.
- Concrete correction or reversal posting entries.
- Distributed Audit ordering and persistence architecture.
- Workflow migration and distributed transition coordination.
- Approval delegation, escalation, dynamic approvers, and unrestricted graphs.
- Authorization, identity-provider integration, storage, HTTP, MCP, or agent
  runtime bindings.
- Universal autonomous-execution or financial-finality policy.

## Milestone 1 — Final normative baseline

Promote the reviewed 0.9 candidate without adding new behavior.

### Tasks

- [ ] Confirm that every 0.9 release blocker is resolved, including every
      finding and release gate in the [0.9.4 corrective plan](plan-09.4.md).
- [ ] Change CoreDoc status and version to FinKore Core 1.0.
- [ ] Change specification status from experimental or release candidate to
      stable 1.0.
- [ ] Confirm the exact documents and domains included in the 1.0 baseline.
- [ ] Confirm that every normative requirement has a stable identifier.
- [ ] Confirm that every portable error code has stable meaning.
- [ ] Confirm that every canonical operation ID has a stable contract.
- [ ] Confirm that every portable serialization shape has an explicit
      compatibility expectation.
- [ ] Confirm that deferred topics remain visibly outside the baseline.
- [ ] Make no normative change unless it fixes a newly demonstrated 1.0 blocker;
      return to release-candidate verification if such a change is required.

### Completion criteria

- The 1.0 normative text is identical in behavior to the accepted 0.9 candidate.
- No open question implies missing mandatory 1.0 behavior.

## Milestone 2 — Final conformance release

Publish executable evidence for the exact 1.0 contract.

### Tasks

- [ ] Mark the manifest as the FinKore Core 1.0 conformance baseline without
      conflating Core version with vector-schema syntax version.
- [ ] Validate every vector against the published vector schema.
- [ ] Confirm uniqueness and stability of all vector IDs.
- [ ] Confirm that every vector references valid normative requirement IDs.
- [ ] Confirm that the traceability inventory has no uncovered testable
      requirement or blocking specification gap.
- [ ] Run the complete manifest against TypeScript, Python, and Java.
- [ ] Confirm identical PASS results and normalized observations across all
      three implementations.
- [ ] Run runner unit tests and coverage.
- [ ] Verify that the runner remains domain-neutral.
- [ ] Verify full and domain-scoped conformance claim wording against the 0.9
      release-candidate policy.

### Completion criteria

- The complete 1.0 manifest is reproducible locally.
- Every official implementation satisfies the claim made for it.
- Conformance evidence does not become a second specification.

## Milestone 3 — Final implementation artifacts

Release or tag the language implementations that demonstrate the 1.0 baseline.

### Tasks

- [ ] Assign intentional implementation package versions independently of the
      Core specification version.
- [ ] Record Core 1.0 compatibility in TypeScript package documentation and
      metadata where appropriate.
- [ ] Record Core 1.0 compatibility in Python package documentation and metadata
      where appropriate.
- [ ] Record Core 1.0 compatibility in Java package documentation and metadata
      where appropriate.
- [ ] Build final TypeScript, Python, and Java artifacts from a clean checkout.
- [ ] Repeat the separate consumer-installation tests established in 0.9.
- [ ] Run all unit and adapter tests.
- [ ] Run all configured coverage gates.
- [ ] Run mutation testing and all critical-mutant probes.
- [ ] Confirm that no generated reports, local toolchains, credentials, or
      developer-only files are included in distribution artifacts.
- [ ] Confirm license and notice files are included where required.
- [ ] Publish packages only for registries explicitly selected during 0.9.
- [ ] If packages remain unpublished, label them clearly as repository reference
      implementations and do not advertise registry installation commands.

### Completion criteria

- Every shipped artifact is installable, documented, licensed, and tied to Core
  1.0.
- All official implementation claims are supported by the released manifest.

## Milestone 4 — Documentation and release

Present a concise, stable release without rebuilding the old report structure.

### Tasks

- [ ] Update the root README project status to describe FinKore Core 1.0 as
      stable within its explicit scope.
- [ ] Remove the general statement that the specification is expected to change
      significantly before 1.0.
- [ ] Retain clear warnings that FinKore is not an ERP, accounting engine,
      persistence layer, authorization system, or complete ledger standard.
- [ ] Verify all documentation links and CoreDoc requirement references.
- [ ] Run architecture and license checks.
- [ ] Run the complete local `verify` command from a clean checkout.
- [ ] Create the 1.0 version tag according to the maintainer's release process.
- [ ] Add only a short 1.0 summary to `docs/releases/README.md`, covering the
      stable scope, compatibility commitment, and verification outcome.
- [ ] Do not add closure reports, checksum inventories, provenance reports, or
      duplicated release documentation.
- [ ] Do not introduce GitHub Actions as part of the release.

### Completion criteria

- The repository describes exactly the released 1.0 state.
- Release history remains concise and detailed history remains in Git.
- The complete release can be verified locally.

## Milestone 5 — Post-1.0 change discipline

Establish how development proceeds after the stable baseline.

### Tasks

- [ ] Apply patch releases only to compatible clarifications, tooling fixes,
      documentation corrections, and defects that do not redefine the stable
      contract.
- [ ] Use minor releases for backward-compatible additive behavior and new
      independent domains.
- [ ] Require a new major release for incompatible changes to existing
      requirements, errors, operations, or serializations.
- [ ] Preserve requirement and vector IDs permanently according to the
      compatibility policy.
- [ ] Require new normative behavior to follow specification-first TDD.
- [ ] Keep Ledger, posting, Payments, Tax, Reconciliation, and other large
      domains out of 1.0 maintenance work until each has its own approved scope.
- [ ] Continue requiring local conformance, coverage, and mutation verification
      for meaningful financial behavior.
- [ ] Keep release summaries concise and avoid repository audit bureaucracy.

## Release gate

FinKore Core 1.0 is complete only when:

- [ ] the 0.9 candidate has no unresolved blocker;
- [ ] CoreDoc and `/spec` identify the stable 1.0 baseline;
- [ ] compatibility, conformance, and Agentic operation boundaries are final;
- [ ] traceability contains no uncovered testable requirement or blocking gap;
- [ ] TypeScript, Python, and Java pass the same complete 1.0 manifest;
- [ ] all local build, test, conformance, coverage, mutation, documentation,
      architecture, and license checks pass;
- [ ] every distributed artifact passes clean consumer installation;
- [ ] no new financial domain was inserted after the 0.9 freeze;
- [ ] the concise 1.0 release note and version tag are ready;
- [ ] post-1.0 compatibility rules are active.
