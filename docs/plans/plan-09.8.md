# FinKore Core 0.9.8 Plan

## Status

**Implemented — unreleased transition to a language-independent specification
project.**

Updated on 2026-10-02. This replaces the previous 0.9.8 corrective implementation
plan. The transition milestones are implemented in the working tree: FinKore is
the financial source of truth for its defined scope, with no maintained language
implementation or Conformance Runner. This status does not declare a release.
Earlier releases remain historical snapshots of the project as it existed at
those versions.

This document is non-normative. [CoreDoc](../coreDoc/core-doc.md) establishes
foundation obligations and [/spec](../../spec/README.md) defines precise
financial behavior.

## Direction

FinKore will be the financial source of truth for its specified domains:
explicit financial obligations, precise observable behavior, and portable
acceptance cases. Its authority comes from the governing financial contract.
It will no longer maintain or distribute language implementations or a
Conformance Runner. Consumers implement the contract in their own languages
and systems and supply their own tools to demonstrate conformance.

The maintained financial contract consists of:

- CoreDoc and the domain specifications;
- language-independent conformance vectors, schemas, and requirement traceability;
- the Agentic Contract describing operation semantics and portable errors.

Conformance vectors remain language-independent acceptance cases linked to
normative requirements. They make required outcomes concrete without becoming
a second specification. Passing a finite set of vectors provides evidence of
conformance; it does not replace the complete governing contract.

Internal tools may validate schemas, identifiers, references, and consistency
of published artifacts. FinKore will not maintain an implementation execution
framework, runner adapter API, or financial evaluation engine.

Requirement IDs, portable error codes, canonical operation IDs, and vector IDs
retain their meaning. Removing implementations does not authorize changing
financial semantics or resolving deferred policy choices.

## Milestone 1 — Remove maintained implementations and runner

- [x] Remove all of `/implementations`, including TypeScript, Python, and Java
      cores, their conformance adapters, native tests, package examples,
      implementation documentation, and package metadata.
- [x] Remove implementation-specific consumers, mutation probes, coverage
      tools, build scripts, and other supporting artifacts outside that tree.
      Review shared tools before removing them so retained verification still works.
- [x] Remove all of `/runner`, including its CLI, adapter API, tests, fixtures,
      package metadata, and runner-specific build, coverage, and mutation setup.
- [x] Remove implementation and runner workspace entries, dependencies, package
      scripts, configuration, and lockfile references. Remove Python/Java bootstrap
      requirements that exist solely to build or test the removed implementations.
- [x] Preserve portable vector schemas and conventions needed to interpret
      acceptance cases. Separate any reusable artifact validation from runner
      execution before removal; keep it under `docs/tools` with appropriate tests.
- [x] Do not relocate financial implementations or the runner into developer
      tools, examples, or test fixtures.
- [x] Preserve prior release history. Repository removal does not imply deletion
      of prior tags or withdrawal of any previously distributed artifact.

**Completion:** the maintained repository contains no FinKore financial domain
implementation, bundled implementation adapter, or Conformance Runner, and
active tooling does not depend on removed packages.

## Milestone 2 — Align verification with the new scope

- [x] Keep schema validation, stable-ID checks, requirement traceability,
      Agentic contract consistency, documentation links, and license checks.
- [x] Adapt architecture checks to enforce the new repository boundaries.
      Retain appropriate tests for artifact-validation tools; remove gates that
      only build, execute, or test deleted implementations and runner code.
- [x] Make local verification work without financial implementations, a runner,
      or adapters. Validate vectors as published data against their schemas.
- [x] Document vector inputs, expected outputs, errors, and requirement mappings
      so consumers can use their own conformance tools without a FinKore runner API.
- [x] Distinguish vector/schema validation from executed financial conformance.
      Without an implementation under test, do not report financial vectors as
      passed or claim cross-language agreement.
- [x] Review traceability entries that rely on removed native or runner tests. Preserve
      portable vectors; identify any remaining coverage gaps explicitly.
- [x] Keep verification local and deterministic. Do not add GitHub Actions.

**Completion:** the retained specification and tooling have reproducible local
checks, and conformance claims accurately describe the evidence available.

## Milestone 3 — Update project documentation and development rules

- [x] Update the root README to describe FinKore as the financial source of truth
      for its defined scope, publishing specifications, conformance vectors,
      and the Agentic Contract, with internal artifact-validation tools.
- [x] Remove active installation instructions, API examples, support tables,
      and capability claims for the removed implementation and runner packages.
- [x] Update conformance, Agentic, and developer-tool documentation for
      consumer-owned implementations and conformance execution. Remove active
      runner CLI and adapter API instructions.
- [x] Update AGENTS.md to reflect the new repository responsibilities,
      toolchain needs, development workflow, and applicable quality gates.
- [x] Review CoreDoc and specification introductions for references that imply
      FinKore ships implementations or a runner. Make editorial scope corrections without
      changing foundation rules or their normative version fields.
- [x] Revise the [1.0 plan](plan-10.md) so stable release no longer requires
      maintained language packages, a runner, native tests, or package publication.
- [x] Preserve historical release descriptions as historical evidence. Repair
      links to removed files without presenting old results as current validation.

**Completion:** current documentation consistently describes the new scope and
does not promise maintained implementations or a runner.

## Specification questions carried forward

The superseded corrective plan identified issues that still matter to the
language-independent contract. Implementation removal does not resolve them:

- Sequential Approval Chain rejection precedence when an earlier Requirement
  is pending and a later Requirement is rejected.
- Handling a supplied `effective` member in concrete Decision/history inputs,
  distinct from Composition observations; concrete effectiveness must follow
  the governing validity rules.
- Eligibility validation of historical Decisions, including unrelated,
  lifecycle-excluded, stale, and expired evidence.
- Whether empty Workflow State identifiers are valid and the corresponding
  portable error behavior.

Review these against CoreDoc, `/spec`, `/conformance`, and `/agentic` before
stable promotion. The old plan's recommendations are not accepted policy.
Any normative correction must follow specification compatibility rules and
receive requirement-backed portable vectors and updated traceability.

The prior special-name and native-key defects also motivate reviewing portable
coverage for opaque identifiers and retained-value integrity. Language-specific
repair tasks end with removal of their implementations; the governing financial
obligations remain. Do not manufacture portable expectations for native values
that the conformance representation cannot express.

## Acceptance for this first change

- [x] All maintained financial implementations, the runner, and their dedicated
      support artifacts are removed.
- [x] Specification, conformance, and Agentic contracts remain authoritative
      and language-independent.
- [x] Retained tooling validates published artifacts without implementing finance
      or executing consumer implementations.
- [x] Portable acceptance cases remain usable without a maintained runner API.
- [x] Local checks pass with no dependency on removed implementation or runner packages.
- [x] Documentation, development instructions, and the 1.0 plan reflect the new scope.
- [x] Unresolved financial questions and coverage limitations remain explicit.

Add a concise summary to [release notes](../releases/README.md) when this work
is released. Do not record planned removal as a completed release or carry
forward old implementation verification as evidence for the new repository.
