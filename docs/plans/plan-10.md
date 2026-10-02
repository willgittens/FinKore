# FinKore Core 1.0 Plan

## Status

FinKore is a language-independent contract repository. Core 1.0 promotion
evaluates the specification, conformance artifacts, Agentic Contract, and
repository maintenance tooling. Maintained financial implementations, the
Conformance Runner, adapter APIs, and language-package publication are outside
the supported surface.

The repository transition and its follow-up findings are complete. Historical
implementation and execution evidence remains in Git and does not establish
current conformance or satisfy the 1.0 gates. The 2026-10-03 publication audit
below identifies the additional cleanup required before stable promotion.

**Publication cleanup pending.** New milestones 1–4 precede the former stable
promotion milestones, now numbered 5–9. This plan is temporary working material
and must itself be removed from the final 1.0 tree. Completed plans will not be
relocated to another archive directory or retained as release dependencies.

Milestones 1–3 are complete; milestones 4–9 remain uncompleted. This document is
non-normative and does not declare Core 1.0 stable. In this filename, `10` means
version 1.0, not version 0.10.

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

## Publication audit — 2026-10-03

Reviewed the working tree based on `0de7082`, including the then-uncommitted
transition completion updates now preserved in Git. This audit adds publication
requirements rather than reopening the accepted financial decisions.

Fresh `npm ci --no-audit` and `npm run verify` pass on Node 24.15.0: 1,790
manifest vectors in 42 files and six suites, 440 requirements, 35 conformance
operation labels, 20 canonical Agentic operations, and 22 maintenance-tool
tests. These are artifact checks, not financial execution. No new dependency
advisory query was made for this documentation-focused audit.

P-labels below are planning references, not normative requirement identifiers.

| Finding | Evidence and publication consequence | Milestone |
| --- | --- | --- |
| P1 — Temporary governance remains in the active contract | `spec/conventions.md` still defines SPEC-FREEZE-001 through -004 and frames compatibility around the 0.9 freeze. The four rules are counted in active traceability; no manifest vector references them. Stable consumers should not have to interpret a superseded release-candidate process. | 1 |
| P2 — Planning history remains published | Eleven files under `docs/plans` contain 7,438 lines at the audit baseline. A targeted scan finds 23 plan-reference lines across 11 current-facing documents. Removing the directory in a disposable copy causes 24 broken Markdown link occurrences. Labeling plans historical did not remove them from the reading path. | 2, 3, 8 |
| P3 — Current rules are mixed with development reports | Domain specifications retain version-named correction notes, D/F decision labels, and milestone narratives. Conformance conventions have 784 lines and traceability has 1,121, including old native API profiles, execution results, and closure reports. Some version-named sections also contain active requirements; deleting whole sections would lose contract content. | 2 |
| P4 — Tooling retains an obsolete case namespace | `validate-conformance.js` reads the 189 historical cases in `boundary097-cases.json` outside manifest discovery. No active vector uses a supplementary case as its paired control. Removing the file in a disposable copy still validates all 1,790 vectors, but its special reader, tests, and guidance remain. | 3 |
| P5 — A public-facing prototype has no release disposition | `learn/index.html` contains “Suggested structure,” unfinished prose such as “This section should grow,” an unwired documentation search, and a `Version 0.1.0` footer without explaining which artifact is versioned. Project/download links target the `FinFlow` repository name. Markdown-only checking does not review this HTML surface; its role and destinations need an explicit decision. | 2, 4 |
| P6 — Existing checks do not enforce the requested final tree | Architecture validation accepts a reintroduced obsolete plan in a disposable copy. The prior release gate allowed historical material if labeled and did not require this plan's removal. Release-candidate wording also occurs throughout operative prose, beyond status headings. A passing development check does not establish publication readiness. | 4, 5, 8 |

These are publication and maintenance gaps, not authorization for new financial
semantics. Detailed history stays in Git; concise release summaries stay only
in `docs/releases/README.md`. The audit does not establish exhaustive financial
correctness.

## Milestone 1 — Separate lasting contract rules from temporary governance

- [x] Remove the Release-Candidate Freeze section and SPEC-FREEZE-001 through
      -004 from the active 1.0 specification. Explicitly retire their
      release-candidate applicability; do not rename or reuse them as new rules.
- [x] Preserve original definitions in Git history and record the sunset
      concisely in the existing release notes when released. Do not create a
      retired-rule report, copied archive, or separate provenance inventory.
- [x] Preserve lasting compatibility, stable-identifier, portable-value,
      normative-language, and conformance obligations. SPEC-COMPATIBILITY-* and
      other identifiers are not obsolete merely because their names use `SPEC`.
- [x] Put contribution and coordinated-update procedures in CONTRIBUTING.md
      and AGENTS.md as appropriate. Keep consumer-facing compatibility promises
      in the contract without duplicating normative definitions.
- [x] Replace active freeze references with the enduring governing requirement
      where needed, or remove purely historical explanations. Remove the four
      retired rules from active traceability and recompute inventory totals.
- [x] Review the exact requirement diff: every continuing financial obligation,
      portable error, and operation keeps its identifier and meaning. Retirement
      of temporary rules must not hide deletion of other requirements.

**Completion:** the active specification states the lasting contract without
release-candidate workflow rules; retired identifiers remain historically
traceable and unavailable for reuse.

Completed 2026-10-03. Only the four temporary requirements were retired; all
436 continuing requirement definitions are unchanged. Active traceability now
records 356 covered, one partial, and 79 not directly testable requirements.
The sunset note is staged under [Unreleased](../releases/README.md#unreleased)
for inclusion when released; no release or stable promotion is declared.

## Milestone 2 — Publish a self-contained current contract

- [x] Rewrite specification introductions, version-named correction sections,
      and Agentic notes around present behavior. Retain operative clauses,
      examples, error priority, ownership guarantees, and accepted boundaries;
      remove milestone narratives, proposal acceptance stories, and D/F labels
      that require a plan to interpret them.
- [x] Keep one current explanation for each fixture convention in
      `conformance/operations.md` or `conformance/conventions.md`, with clear
      cross-references. Remove historical native type tables, old adapter/API
      migration instructions, and implementation execution reports.
- [x] Reduce traceability to the current inventory, requirement-to-vector
      mapping, present coverage rationales/limitations, and useful defect-sensitivity
      guidance. Remove historical reassessments, closure reports, and runtime
      totals; rewrite still-applicable rationales in current terms.
- [x] Remove plan links and textual dependencies from README, `/spec`,
      `/conformance`, `/agentic`, and consumer guidance. Link current rules or
      concise release history as appropriate; do not replace old plan links with
      another archive or Git permalinks to the same plans.
- [x] Review vector descriptions and optional metadata for unexplained review
      labels. Preserve useful regression intent, requirement mappings, and
      paired controls. Keep stable vector IDs even when they contain an old
      version number; those identifiers are not disposable prose.
- [x] Preserve CoreDoc `Introduced`, `Last updated`, and `Last updated on`
      metadata and licensing records required by existing governance. Editorial
      cleanup must not falsify the normative evolution of a rule.
- [x] Reduce the Learn prototype to an accurate working documentation index or
      remove it from the released tree. Verify retained project/download links;
      remove unsupported controls, ambiguous version labels, and placeholder
      prose. This does not require a new documentation site or deployment.
- [x] Preserve deferred topics and WORKFLOW-GUARD-004's explicit coverage
      limitation. Removing history must not imply those boundaries are solved.

**Completion:** consumers can interpret the released contract and all 35 fixture
operation labels without development plans or obsolete implementation evidence.

Completed 2026-10-03. Current contract prose and fixture guidance are independent
of development plans; traceability retains the inventory, mappings, limitations,
and defect-sensitive examples. Explanatory metadata was updated in 1,019 vectors,
preserving all 1,790 IDs, financial inputs/results, requirements, operations,
tags, and paired controls. All 436 requirement definitions and CoreDoc metadata
are unchanged. Learn is a local documentation index with 20 checked links.

## Milestone 3 — Remove obsolete artifacts and completed plans

- [x] Remove `conformance/boundary097-cases.json` and its special reader,
      supplementary-control namespace, dedicated tests, and current guidance.
      Keep error-code and paired-control validation for manifest-listed vectors.
- [x] Confirm that no active control depends on that file at execution time.
      Resolve any new dependency through existing portable controls or
      specification-backed manifest cases; do not discard regression protection
      or promote historical expectations wholesale.
- [x] Preserve the 1,790 active vector IDs, inputs, expected financial outcomes,
      canonical operations, and portable errors during cleanup. Any behavioral
      discrepancy needs a separate specification-first review.
- [x] Remove completed/superseded `docs/plans` files after their reviewed state
      is preserved in ordinary Git history.
      Remove references from the surviving working plan as well as public docs.
      Do not relocate plans into an archive directory or release attachments.
- [x] Keep only this active execution plan temporarily. Milestone 8 removes it
      after enduring release instructions are in existing contributor/tool
      guidance; the final 1.0 tree contains no planning files or directory.
- [x] Update AGENTS.md and contributor guidance so they do not require old
      plans in the released tree. Preserve Git history and concise release notes
      without copying detailed review reports into them.

**Completion:** validation is independent of the historical supplement,
completed plans are removed, and this working plan is the sole temporary
planning exception until final release preparation.

Completed 2026-10-03. Removed the 189-case historical supplement and ten completed
plans whose reviewed contents are preserved in Git at `f17786a`. All 812 active
paired-control references resolve within the manifest; all 1,790 vectors remain
unchanged. Validation and its tests now use only manifest-listed controls.

## Milestone 4 — Enforce the final publication boundary

- [ ] Add a focused local release-content check under `docs/tools` and document
      it in existing tool/contributor guidance. It inspects the proposed release
      tree without evaluating finance or introducing a runner.
- [ ] Require no `docs/plans` directory, copied planning archive, active plan
      references, historical case supplement, or active freeze definitions or
      references in the final tree. Permit only the concise retirement note in
      release history and explicit negative-test fixtures for those removed surfaces.
- [ ] Require coherent stable status across README, CoreDoc, specifications,
      conformance, and Agentic documents, including inline scope wording. Keep
      schema syntax `0.1`, private maintenance-package versions, stable vector
      IDs, release history, and CoreDoc evolution metadata distinct from the
      Core version. Do not perform a blanket numeric replacement.
- [ ] Add positive controls and negative tests that reintroduce an old plan,
      reference, release-candidate status, or supplementary-file dependency.
      Require intended diagnostics, not crashes or infrastructure failures.
- [ ] Include retained Learn HTML links and public content in release review.
      A Markdown-only checker does not establish that HTML or UI controls work.
- [ ] Keep ordinary development verification usable while this plan exists;
      make the stricter publication check an explicit release gate. Exercise it
      against a disposable proposed-release tree, then repeat it on the actual
      final tree after the last plan is removed.

**Completion:** the requested clean 1.0 surface has enforceable acceptance
criteria. Passing development verification cannot waive publication checks.

## Milestone 5 — Final normative baseline

Promote the reviewed 0.9 candidate without adding new behavior.

### Tasks

- [x] Confirm that every 0.9 candidate blocker is resolved, including the
      specification questions and repository-transition acceptance gates.
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

## Milestone 6 — Final conformance artifacts

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

## Milestone 7 — Final Agentic Contract

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

## Milestone 8 — Documentation and release

Present a concise stable release of the language-neutral contract.

### Tasks

- [ ] Update the root README and current-facing guidance to describe Core 1.0 as
      stable within its explicit scope.
- [ ] Retain clear warnings that FinKore is not an ERP, accounting engine,
      persistence layer, authorization system, implementation library, or
      complete ledger standard.
- [ ] Verify documentation links and CoreDoc requirement references.
- [ ] Run the complete local `npm run verify` command after a clean locked
      dependency install; this covers schema, vector, traceability, Agentic,
      architecture, tool-test, documentation, and license checks.
- [ ] Run `npm run dependencies:audit` as a separate network-backed release
      check and record the advisory-query date and result scope.
- [ ] Complete cleanup milestones 1–4 and place enduring release instructions
      in existing contributor/tool guidance so they do not depend on this plan.
- [ ] Remove this final plan and the now-empty `docs/plans` directory from the
      proposed release tree. Remove all remaining references to it; retain its
      development history only in Git. Do not replace it with a closure report.
- [ ] Run local verification and the strict release-content check on the actual
      final tree after plan removal, before creating the stable release tag.
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

## Milestone 9 — Post-1.0 change discipline

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
- [ ] publication cleanup milestones 1–4 are complete;
- [ ] the final tree has no plans, planning archive, or active references to plans;
- [ ] release-candidate freeze rules are retired from the active contract with
      stable identifiers preserved historically and never reassigned;
- [ ] the historical supplementary-case file and its tool dependency are removed;
- [ ] public contracts contain current semantics rather than correction reports,
      milestone narratives, or obsolete implementation instructions;
- [ ] CoreDoc and `/spec` identify the stable 1.0 baseline;
- [ ] compatibility, conformance, and Agentic operation boundaries are final;
- [ ] every published artifact validates against its schema;
- [ ] traceability contains no uncovered testable requirement or blocking gap;
- [ ] canonical Agentic operations are consistent with `/spec` and covered by
      the published conformance corpus;
- [ ] all local artifact, traceability, Agentic, architecture, tool-test,
      documentation, and license checks pass after a clean locked dependency
      install;
- [ ] the separate network-backed dependency audit passes with its advisory
      query date and result scope recorded;
- [ ] current-facing documentation contains no maintained implementation,
      runner, adapter API, financial implementation package installation, or
      registry-publication claim;
- [ ] detailed development/implementation reports live in Git history; release
      notes remain concise, and required CoreDoc/license history is preserved;
- [ ] the actual final tree passes the release-content check after this plan's removal;
- [ ] no new financial domain was inserted after the 0.9 freeze;
- [ ] the concise 1.0 release note and version tag are ready;
- [ ] post-1.0 compatibility rules are active.
