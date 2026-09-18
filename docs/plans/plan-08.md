# FinKore Core 0.8 Plan

## Status

Complete. This document is non-normative and records the work completed for the
0.8 release. Financial behavior remains defined by `/spec`, and shipped scope is
recorded concisely in `docs/releases/README.md`.

## Objective

FinKore Core 0.8 unifies the current project into one coherent release
baseline. It does not add a new financial domain. Its purpose is to remove
version ambiguity, establish compatibility and conformance rules, and decide
which operation contracts are stable enough to approach 1.0.

The candidate 1.0 domain scope is limited to:

- Money;
- Workflow;
- Audit;
- Approvals;
- Financial Entities.

## Out of scope

- Ledger, journal entries, posting, reconciliation, payments, tax, settlement,
  and other concrete accounting domains.
- Executable MCP, agent-framework, HTTP, persistence, or authorization layers.
- Workflow migration and distributed coordination.
- Approval delegation, escalation, dynamic approver resolution, or unrestricted
  approval graphs.
- A new repository provenance or source-code audit system.
- GitHub Actions or another hosted CI requirement.
- Publication of production packages; 0.8 prepares that decision for 0.9.

## Milestone 1 — Release identity and terminology

Establish one current name for the complete baseline while preserving old draft
numbers only where they describe historical releases.

### Tasks

- [x] Define `FinKore Core 0.8` as the shared language-neutral behavioral
      baseline.
- [x] Update the CoreDoc version and status from the old foundation baseline to
      0.8.
- [x] Update the specification status to identify the 0.8 baseline and its five
      included domains.
- [x] Inventory references to Draft 0.1, 0.2, 0.3, and 0.4.
- [x] Preserve historical draft labels in release history and genuinely
      historical explanations.
- [x] Replace historical labels where they incorrectly describe current
      behavior, implementation status, or current API scope.
- [x] Document the distinction between the Core release version, conformance
      format version, runner version, and language package versions.
- [x] Remove documentation that describes deleted repository structures, such
      as the former top-level `examples` directory.
- [x] Confirm that README files consistently describe the same current domain
      scope.

### Completion criteria

- A new developer can determine the current Core version without reconstructing
  the history of individual draft slices.
- No active capability is described as belonging only to an obsolete milestone.
- Historical release descriptions remain intact in the release notes.

## Milestone 2 — Compatibility policy

Define what users may rely on before the release candidate is frozen.

### Tasks

- [x] Define compatibility rules for normative requirements.
- [x] Confirm that published requirement IDs are never reused for a different
      meaning.
- [x] Define compatibility rules for portable error codes.
- [x] Define compatibility rules for canonical operation IDs.
- [x] Define compatibility rules for portable input and output serializations.
- [x] Define how a requirement is deprecated, replaced, or superseded without
      erasing its identity.
- [x] Define which changes are editorial and which changes are behaviorally
      incompatible.
- [x] Define the post-1.0 rule that incompatible observable changes require a
      new major version.
- [x] Define when a regression vector may be added without changing the Core
      version.
- [x] Verify that the policy does not promise compatibility for implementation
      details, exception class names, storage models, or framework APIs.

### Completion criteria

- Compatibility expectations are stated once and referenced consistently.
- Stable identifiers and observable formats have an explicit evolution rule.
- Implementation-specific APIs remain free to be idiomatic within the portable
  contract.

## Milestone 3 — Conformance claim model

Make conformance claims precise without rebuilding the removed provenance and
profile machinery.

### Tasks

- [x] Define full FinKore Core conformance as passing every applicable suite in
      the release manifest.
- [x] Define domain-scoped conformance for implementations that intentionally
      implement only named domains.
- [x] Require every claim to identify the exact Core release and conformance
      manifest version used.
- [x] State that advertising an Agentic capability is not evidence of
      conformance.
- [x] State that passing only selected vectors cannot be described as complete
      Core conformance.
- [x] Confirm how `UNSUPPORTED` affects full and domain-scoped claims.
- [x] Ensure the runner reports enough manifest and suite information for a
      developer to reproduce a claim locally.
- [x] Review the requirements classified as not directly testable and confirm
      that each classification is justified by architecture, authoring rules,
      or an intentionally non-observable obligation.
- [x] Regenerate or update the human-readable traceability index if any
      requirement or vector mapping changes.

### Completion criteria

- Full and partial conformance cannot be confused.
- A claim is reproducible locally from the repository without hosted CI.
- No additional checksum, attestation, profile, or repository-audit subsystem is
  introduced.

## Milestone 4 — Agentic Contract boundary

Stabilize what “agent-ready by contract” means for the 1.0 candidate scope.

### Tasks

- [x] Review every operation currently listed in the canonical operation
      registry.
- [x] Verify stable purpose, inputs, outputs, preconditions, postconditions,
      portable errors, effects, and requirement references for each promoted
      operation.
- [x] Decide whether effect values remain boolean-like or use the existing
      `none` / `may` / `required` distinctions consistently.
- [x] Decide whether idempotency is part of the 1.0 metadata contract or is
      explicitly unspecified.
- [x] State that autonomous-execution policy belongs to the consuming
      application unless a concrete FinKore rule says otherwise.
- [x] Keep accounting finality unspecified while ledger posting and financial
      commitment remain outside Core.
- [x] Review Approval operation labels and either define stable public contracts
      or keep them explicitly conformance-local.
- [x] Review Workflow and Entity import labels and either define stable public
      contracts or keep them explicitly conformance-local.
- [x] Confirm that every promoted operation is traceable to both specification
      requirements and conformance vectors.
- [x] Confirm that no agent-specific bypass exists for financial rules,
      approvals, audit evidence, or failure atomicity.

### Completion criteria

- The operation registry contains only intentionally stable operations.
- Every non-promoted label is clearly identified as adapter vocabulary.
- The open questions that affect the 1.0 contract are answered or explicitly
  deferred with no implied semantics.

## Milestone 5 — Cross-language baseline verification

Prove that the unified wording did not change or fragment behavior.

### Tasks

- [x] Run documentation link and reference checks.
- [x] Run architecture and license checks.
- [x] Build and type-check the TypeScript workspaces.
- [x] Run TypeScript, Python, and Java unit and adapter tests.
- [x] Run the complete manifest against TypeScript, Python, and Java.
- [x] Run coverage checks for the runner and all three implementations.
- [x] Run the complete critical-mutant suite.
- [x] Confirm that all critical financial mutants are killed.
- [x] Confirm that all verification commands work locally without GitHub
      Actions.
- [x] Add a short 0.8 entry to `docs/releases/README.md` only when the release is
      complete.

## Release gate

0.8 is complete only when:

- [x] the current baseline has one coherent version identity;
- [x] compatibility rules are explicit;
- [x] full and domain-scoped conformance claims are explicit;
- [x] the Agentic Contract boundary is settled for the current scope;
- [x] no new financial domain has entered the release;
- [x] TypeScript, Python, and Java pass the same complete manifest;
- [x] local build, tests, conformance, coverage, mutation, architecture,
      documentation, and license checks pass;
- [x] release notes contain only a concise shipped-scope summary.
