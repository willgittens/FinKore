# FinKore Core 1.0 Plan

## Status

The [Core 0.9.8 transition](plan-09.8.md) defines FinKore as a
language-independent contract repository. It removes maintained financial
implementations, the Conformance Runner, adapter APIs, and language-package
publication from the supported surface. Core 1.0 promotion therefore evaluates
the specification, conformance artifacts, Agentic Contract, and repository
maintenance tooling—not consumer implementations.

The completed [Core 0.9.7 corrective plan](plan-09.7.md) and earlier plans retain
historical implementation and execution evidence for their repository states.
Those results are not current 1.0 gates and do not imply that the present
repository executes financial behavior.

The milestones below are uncompleted. This document is non-normative and does
not declare Core 1.0 stable. In this filename, `10` means version 1.0, not
version 0.10.

## Objective

FinKore Core 1.0 publishes the first stable language-neutral baseline for Money,
Workflow, Audit, Approvals, and Financial Entities. Stability applies to the
defined observable financial contract, stable identifiers, portable acceptance
artifacts, and published compatibility promises. It does not mean that FinKore
implements every accounting domain or ships executable domain software.

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
- Canonical Agentic operation contracts promoted before the release-candidate
  freeze.
- Language-independent conformance manifest, schemas, vectors, conventions, and
  requirement traceability.
- Domain-neutral local tools that validate and maintain those artifacts.

## Explicit 1.0 exclusions

- Maintained financial implementations or reference packages.
- A Conformance Runner, runner protocol, or adapter API.
- Registry publication to npm, PyPI, Maven Central, or another package service.
- Claims that a consumer implementation conforms without consumer-owned
  execution evidence.
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

- [ ] Confirm that every release blocker is resolved, including every
      specification question and applicable gate in the
      [0.9.8 transition plan](plan-09.8.md).
- [ ] Change CoreDoc status and version to FinKore Core 1.0.
- [ ] Change specification status from release candidate to stable 1.0.
- [ ] Confirm the exact documents and domains included in the baseline.
- [ ] Confirm that every normative requirement has a stable identifier.
- [ ] Confirm that every portable error code has stable meaning.
- [ ] Confirm that every canonical operation ID has a stable contract.
- [ ] Confirm that every portable serialization shape has an explicit
      compatibility expectation.
- [ ] Confirm that deferred topics remain visibly outside the baseline.
- [ ] Make no normative change unless it fixes a newly demonstrated blocker;
      return to release-candidate review if one is required.

### Completion criteria

- The 1.0 normative text is identical in behavior to the accepted 0.9 candidate.
- No open question implies missing mandatory 1.0 behavior.

## Milestone 2 — Final conformance artifacts

Publish a coherent, portable acceptance corpus for the exact 1.0 contract.

### Tasks

- [ ] Identify the manifest as the FinKore Core 1.0 conformance baseline without
      conflating Core version with manifest or vector-schema syntax versions.
- [ ] Validate the manifest and every referenced vector file against the
      published schemas.
- [ ] Confirm uniqueness and stability of vector IDs.
- [ ] Confirm that every vector references valid normative requirement IDs.
- [ ] Confirm that every operation label is canonical or explicitly documented
      as conformance-local.
- [ ] Confirm that traceability has no uncovered testable requirement or
      blocking specification gap.
- [ ] Review positive, negative, boundary, non-mutation, ordering, and
      mutation-sensitive cases for the stable scope.
- [ ] Verify that fixtures do not prescribe a production API, language model,
      runner protocol, or financial behavior absent from `/spec`.
- [ ] Verify claim wording distinguishes artifact validity from external
      implementation conformance.

### Completion criteria

- `conformance/manifest.json` discovers the complete published baseline.
- All artifacts validate and trace to normative requirements.
- Known coverage limits and non-testable requirements are explicit.
- Conformance artifacts do not become a second specification.

## Milestone 3 — Final Agentic Contract

Stabilize machine-understandable operation semantics without adding an
execution product.

### Tasks

- [ ] Confirm every promoted `finkore.*` operation ID is stable and unique.
- [ ] Verify purpose, inputs, outputs, preconditions, postconditions, effects,
      portable errors, and requirement references for each promoted operation.
- [ ] Confirm every promoted operation is covered by manifest-listed vectors.
- [ ] Keep unreviewed fixture operation labels explicitly conformance-local.
- [ ] Confirm Agentic metadata does not redefine financial behavior or create an
      agent-specific bypass.
- [ ] Preserve the boundary between Discoverable, Understandable, Governable,
      and consumer-owned Executable integrations.
- [ ] Keep transport, authorization, retry, idempotency, MCP, and autonomous
      execution policy outside Core unless already specified.

### Completion criteria

- The operation registry is internally consistent and traceable.
- Agentic readiness claims require no maintained implementation or runtime.

## Milestone 4 — Documentation and release

Present a concise stable release of the language-neutral contract.

### Tasks

- [ ] Update the root README and current-facing guidance to describe Core 1.0 as
      stable within its explicit scope.
- [ ] Retain clear warnings that FinKore is not an ERP, accounting engine,
      persistence layer, authorization system, implementation library, or
      complete ledger standard.
- [ ] Verify documentation links and CoreDoc requirement references.
- [ ] Run schema, vector, traceability, Agentic, architecture, tool-test,
      documentation, license, and dependency checks.
- [ ] Run the complete local `npm run verify` command from a clean checkout.
- [ ] Confirm the release contains no generated reports, credentials, local
      toolchains, or stale implementation/package instructions.
- [ ] Create the 1.0 version tag according to the maintainer's release process.
- [ ] Add only a short 1.0 summary to `docs/releases/README.md`, covering stable
      scope, compatibility commitments, and repository verification.
- [ ] Do not publish implementation packages or a runner as part of Core 1.0.
- [ ] Do not add closure reports, checksum inventories, provenance reports,
      duplicated release documents, or GitHub Actions.

### Completion criteria

- The repository describes exactly the released 1.0 contract.
- Release history remains concise and detailed history remains in Git.
- The published artifacts can be validated locally from a clean checkout.

## Milestone 5 — Post-1.0 change discipline

Establish how the stable contract evolves.

### Tasks

- [ ] Use patch releases only for compatible clarifications, tooling fixes,
      documentation corrections, and defects that do not redefine the stable
      contract.
- [ ] Use minor releases for backward-compatible additive behavior and new
      independent domains.
- [ ] Require a new major release for incompatible changes to existing
      requirements, errors, operations, or serializations.
- [ ] Preserve requirement, vector, error, and operation IDs according to the
      compatibility policy.
- [ ] Require new normative behavior to follow specification-first development,
      portable acceptance-case review, and traceability.
- [ ] Keep Ledger, posting, Payments, Tax, Reconciliation, and other large
      domains out of 1.0 maintenance work until each has an approved scope.
- [ ] Require local artifact validation and adversarial case review for
      meaningful financial changes.
- [ ] Keep release summaries concise and avoid repository audit bureaucracy.

## Release gate

FinKore Core 1.0 is complete only when:

- [ ] the 0.9 candidate has no unresolved blocker;
- [ ] CoreDoc and `/spec` identify the stable 1.0 baseline;
- [ ] compatibility, conformance, and Agentic operation boundaries are final;
- [ ] every published artifact validates against its schema;
- [ ] traceability contains no uncovered testable requirement or blocking gap;
- [ ] canonical Agentic operations are consistent with `/spec` and covered by
      the published conformance corpus;
- [ ] all local artifact, traceability, Agentic, architecture, tool-test,
      documentation, license, and dependency checks pass from a clean checkout;
- [ ] current-facing documentation contains no maintained implementation,
      runner, adapter API, package installation, or registry-publication claim;
- [ ] historical execution results are clearly historical;
- [ ] no new financial domain was inserted after the 0.9 freeze;
- [ ] the concise 1.0 release note and version tag are ready;
- [ ] post-1.0 compatibility rules are active.
