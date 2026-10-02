# FinKore Core 0.9.8 Plan

## Status

**Transition and Milestones 4–7 implemented — audit follow-up milestone 8 pending; unreleased.**

Updated on 2026-10-03. This replaces the previous 0.9.8 corrective implementation
plan. Transition milestones 1–3 are implemented: FinKore is
the financial source of truth for its defined scope, with no maintained language
implementation or Conformance Runner. This status does not declare a release.
Earlier releases remain historical snapshots of the project as it existed at
those versions.

The post-transition audit found contract, validation, and documentation gaps.
Milestones 4–8 below are required follow-up work; passing existing local checks
does not close them or declare the full 0.9.8 plan complete.

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

## Post-transition audit — 2026-10-02

Reviewed baseline: `4204a28` (`0.9.8 Update project documentation and development
rules`), with a clean working tree before this plan update. The audit covered
repository boundaries and package wiring, CoreDoc/specification authority,
portable artifact discovery and metadata, Agentic descriptors, traceability,
consumer guidance, historical/current documentation boundaries, and maintenance
tools and their tests. It did not execute a financial implementation or claim
exhaustive financial correctness.

On Node 24.15.0, a fresh locked dependency install and `npm run verify` passed:
6 suites, 40 vector files, 1,775 vectors, 35 conformance operation labels,
20 canonical Agentic operations, 436 requirements, and 11 tool tests. The install
reported zero dependency vulnerabilities. The first sandboxed install failed
on registry DNS; a network-enabled retry completed successfully. Dependency
auditing during installation is separate from the local `verify` script.

Independent metadata inspection found no unknown expected error codes among the
31 catalogued codes, no unresolved specification requirement references, no
dangling references among 812 vectors with `pairedControl` metadata when the
explicit supplementary case set is included, no conflicting expected envelopes
for identical operation/input/context requests, and no invalid fenced JSON
examples in `/spec`. These checks establish bounded artifact consistency only.

Temporary-copy probes confirmed that missing specification topics and unknown
conformance-local operation labels are rejected. They also reproduced the
validation omissions below. Source artifacts were not mutated by these probes;
follow-up regression tests must reconstruct them without `/tmp` dependencies.

### Findings

A-labels are planning references, not normative requirement identifiers.

| Finding | Evidence and consequence | Follow-up |
| --- | --- | --- |
| A1 — P1, unresolved financial decisions are outside the active coverage classification | The four questions above remain unresolved in the owning Approval/Workflow documents. `conformance/traceability.md` reports zero blocking specification gaps while the 1.0 plan treats these questions as blockers. Removal of implementations did not decide these semantics. | M4 |
| A2 — P1, Money observation contract can overconstrain conforming implementations | `money.add.same-currency.basic-001` requires `"15.50"`; `money.deserialize.positive-001` requires `"1299.90"`. MONEY-ARITHMETIC-007 requires exact numeric results, and Money serialization explicitly does not require lexical trailing-zero preservation. The conventions require exact string comparison and refer to an “agreed observable representation” without specifying the unrounded-operation observation scale. A valid `"15.5"` or `"1299.9"` result has no fully defined route to that envelope. | M5 |
| A3 — P2, normative-language and traceability classification disagree | `spec/conventions.md` makes uppercase normative keywords the criterion for normative text, but SPEC-COMPATIBILITY-005, -009, -010, -011, -012 and APPROVAL-COMPOSITION-017 have no such keyword and are indexed as MUST / MUST NOT. Clarify whether these are binding definitions or obligations; do not silently weaken compatibility or parallel-stage semantics. | M4 |
| A4 — P2, important current fixture definitions are labeled historical | `conformance/conventions.md` labels its 0.9.5–0.9.7 boundary sections historical while retaining current concrete subject/eligibility shapes, dot-separated fact-selector encoding, quorum evidence, and Entity binding/import conventions there. APPROVAL-FACT-002 and the Approval Requirements document rely on these conventions. Consumers need a current, self-contained fixture contract separated from obsolete native API and implementation instructions. | M5 |
| A5 — P2, artifact-reference validation is incomplete | Replacing a vector error with `FINKORE_MONEY_INVENTED` passes the checks, including the full verification script in a temporary copy. A nonexistent `pairedControl` also passes artifact/Agentic/traceability/documentation checks. Existing published values are valid; the defect is failure to reject future broken references. | M6 |
| A6 — P2, Agentic validation checks identity but not descriptor completeness or effect values | An empty `finkore.money.add` descriptor retaining its heading passes full verification. Changing its registry state-mutation value from `no` to `banana` also passes. The descriptor minimum in `agentic/conventions.md` and allowed values in `agentic/effects.md` are not enforced. | M6 |
| A7 — P2, traceability and reference checkers can give false assurance | Changing the Money inventory count from 74 to 999 or replacing the PARTIAL row's evidence with `missing.vector-001` passes the metadata checks. An unknown requirement prefix in CoreDoc passes full verification because the checker skips unfamiliar prefixes. A nonexistent Markdown fragment passes documentation checks, which currently validate file paths only. | M6 |
| A8 — P2, active maintenance and release instructions overstate or retain removed responsibilities | README and AGENTS.md say verification audits dependencies, but `verify` only runs local checks. AGENTS.md directs missing-Node users to bootstrap instructions absent from `docs/tools/README.md`. SPEC-FREEZE-002 still requires updating implementations and tests in the same normative correction, without distinguishing consumer-owned repositories. Agentic Entity notes still call 0.9.7 execution “current verification,” and some current specification prose still directs native API migration work to old implementation milestones. | M7 |

## Milestone 4 — Resolve financial and normative-authoring gaps

### Accepted Milestone 4 dispositions — 2026-10-02

Before these dispositions, all four A1 questions were `BLOCKING SPEC GAP`
boundaries: each admitted more than one portable outcome and could not honestly
coexist with a zero-blocker inventory. The following interpretations are
accepted for the 0.9 release-candidate correction. They refine existing CoreDoc
obligations without adding a domain or portable error code.

| Boundary | Selected interpretation and rationale | Error and compatibility impact |
| --- | --- | --- |
| Sequential Approval Chain rejection and actionability | A sequential chain is governed by its first non-approved Requirement in declared order. A pending Requirement is the only active Requirement; a later rejection cannot determine the current outcome before every predecessor is approved. Once reached, a rejection determines the chain's declared rejection outcome and leaves no Requirement active. This follows CORE-004.4's non-activation rule and remains distinct from same-stage parallel Composition. All supplied state observations are still validated before an outcome is returned. | Valid mixed-state inputs that were previously ambiguous now have one result. `FINKORE_APPROVAL_INVALID_CHAIN` remains the error for malformed chain/state evidence. This is a corrective normative choice under SPEC-FREEZE-001 and a behavioral clarification with compatibility impact under SPEC-COMPATIBILITY-012/014. |
| Supplied concrete `effective` member | Concrete Decision and history operations derive current effectiveness from committed Decisions, lifecycle evidence, relevant facts/revision, eligibility, expiration, and explicit context. A caller-supplied `effective` member at that boundary is invalid even when Boolean and even when it agrees with the derived result; it cannot override or short-circuit derivation. Composition's explicitly documented Boolean effectiveness observation remains a separate lightweight fixture contract. | Concrete input containing the member uses `FINKORE_APPROVAL_INVALID_DECISION` and preserves history. Consumers that previously ignored or trusted it must remove it and supply the governing evidence. This closes a control-bypass ambiguity and is behaviorally incompatible under SPEC-COMPATIBILITY-012/014. |
| Historical Actor eligibility | Requirement evaluation validates Actor eligibility for every structurally valid supplied Decision that identifies the evaluated Requirement, including Decisions later excluded by withdrawal, Decision/Requirement supersession, expiration, stale facts/revision, or decisive ordering. A valid eligibility rule excluding that Actor uses `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. A Decision identifying another Requirement is structurally validated but is not tested against the evaluated Requirement's eligibility rule and cannot affect its outcome; no absent Requirement registry is invented. | Some previously ignored ineligible historical evidence now fails with the existing ineligible-Actor code. Unrelated evidence remains non-contributing rather than being judged by the wrong rule. This is a corrective normative choice under SPEC-FREEZE-001 with compatibility impact under SPEC-COMPATIBILITY-012/014. |
| Empty Workflow State identifiers | Every portable Workflow State identifier must be a nonempty string wherever it occurs. Empty declaration members, initial/terminal identifiers, or Transition endpoints invalidate the definition; an empty current State invalidates the instance; an empty requested target or expected-current-State precondition is an invalid State value. Nonempty identifiers remain opaque and case-sensitive. | Definition positions use `FINKORE_WORKFLOW_INVALID_DEFINITION`, current-instance input uses `FINKORE_WORKFLOW_INVALID_INSTANCE`, and target/precondition input uses `FINKORE_WORKFLOW_INVALID_STATE`, with existing error priority and non-mutation. Rejecting previously ambiguous empty identifiers is behaviorally incompatible under SPEC-COMPATIBILITY-012/014. |

A3 is resolved as an authoring correction: SPEC-COMPATIBILITY-005, -009, -010,
-011, and -012 and APPROVAL-COMPOSITION-017 retain their existing intended
semantics but receive explicit uppercase normative keywords so their text and
traceability modalities agree. This wording change does not itself alter an
observable result. WORKFLOW-GUARD-004's independent external-fact authoring
limitation remains `PARTIAL`.

- [x] Resolve A1's four questions individually against CoreDoc and the owning
      requirements: sequential Chain rejection/actionability, concrete
      `effective` input handling, historical Actor eligibility validation, and
      empty Workflow State identifiers. Record the selected interpretation,
      rationale, error behavior, and compatibility impact here before writing
      dependent expected outcomes. Prior recommendations are not acceptance.
- [x] Update affected requirements, portable vectors, traceability, and Agentic
      descriptions together. Preserve stable identifiers and failure atomicity;
      distinguish Chain sequencing from staged Composition behavior.
- [x] Classify known unresolved mandatory boundaries in the active traceability
      inventory while they remain open. Explain which are blocking gaps versus
      coverage limitations or explicitly permitted variation. Zero blockers must
      reflect resolution, not omission from the inventory.
- [x] Resolve A3's six modality inconsistencies using the existing normative
      language policy. Preserve intended compatibility definitions and financial
      semantics; assess any normative effect before changing wording or modality.
- [x] Retain WORKFLOW-GUARD-004's independent external-fact authoring limitation
      unless a separately accepted contract resolves it.

**Completion:** each financial question has an explicit disposition and owning
contract, and normative text and traceability agree about what is mandatory.

Implemented on 2026-10-02. The correction adds four normative requirements and
15 manifest-listed vectors. Local verification passes with 440 requirements,
1,790 vectors, 35 conformance operation labels, 20 canonical Agentic
operations, and 356 covered requirements; `WORKFLOW-GUARD-004` remains the one
partial requirement. Dependency installation and the offline audit report zero
known vulnerabilities. This is artifact validation, not implementation
execution or a 0.9.8 release declaration.

## Milestone 5 — Make portable acceptance independent of historical implementations

### Accepted Milestone 5 dispositions — 2026-10-02

A2 is resolved without imposing production scale preservation. For Money
operation results without an explicit target scale, a consumer binding renders
the actual exact result as a canonical plain decimal: redundant leading integer
zeros and trailing fractional zeros are removed, an empty fractional part loses
its decimal point, and numeric zero is `"0"`. Explicit round/allocation scales
and explicitly rounded Rate scales remain exact. Requested unchanged-operand
observations use the input amount's fractional digit count. The comparison layer
remains domain-neutral and compares the resulting envelope exactly; it neither
normalizes Money nor reads `expected` to manufacture an actual result.

This correction changes 16 normalized unscaled Money result strings while
preserving every numeric amount and currency. It is behaviorally incompatible
at the conformance-observation boundary under SPEC-COMPATIBILITY-012/014, but it
does not change production Money semantics or serialization freedom. Vector
syntax and the meaning of generic `expected` comparison remain unchanged, so
`finkoreVectorFile` stays at `0.1`.

A4 is resolved by the current `conformance/operations.md` contract. It covers
all 35 manifest operation labels and consolidates the Approval subject,
eligibility, selector, condition, quorum, and history fixtures plus versioned
Entity binding/import conventions. Historical runtime type profiles, native API
instructions, adapter behavior, and execution results remain labeled historical.
The review found no unresolved financial outcome requiring an invented rule.

Format `0.1` is schema-closed. Mandatory schema validation rejects unknown
members because `additionalProperties` is false. The earlier permission to
ignore them contradicted the published schema and is withdrawn; existing review
metadata remains allowed because it is explicitly declared. This is a
documentation correction for previously invalid files, not a schema loosening
or a format-version change.

- [x] Resolve A2 by specifying how consumer bindings obtain the requested Money
      observation for unrounded arithmetic and serialization, including trailing
      zeros, zero, and negative values. Distinguish presentation normalization
      from changes to the numeric value. Preserve explicit target-scale rules
      for rounding and allocation.
- [x] Do not impose a production scale-preservation rule merely to match old
      implementation outputs. If a normative financial change is necessary,
      settle it in `/spec` with compatibility review before changing vectors.
      Do not introduce approximate comparison or financial logic in tooling.
- [x] Include portable documentation examples showing equivalent valid native
      representations reaching the same defined observation and genuinely
      different values remaining distinguishable. Keep the comparison layer
      domain-neutral and the binding independent of expected-result substitution.
- [x] Move still-current fixture definitions identified in A4 into clearly
      current conformance sections. Keep historical native class/type profiles,
      test results, migration notes, and API advice explicitly historical.
- [x] Review all 35 operation labels for sufficient input, output, omission,
      null, error, and requested-post-state interpretation without consulting a
      removed adapter or historical implementation. Document gaps instead of
      reverse-engineering financial rules from expected results.
- [x] Reconcile the unknown-vector-member permission in conventions with the
      schema's `additionalProperties: false` and mandatory schema-validation
      instructions. State the supported extension/validation policy and assess
      format compatibility; do not silently loosen the schema.

**Completion:** consumers can interpret every published fixture using the
current contract, without inheriting an undocumented language implementation
choice or mistaking a historical convention for optional guidance.

Implemented on 2026-10-02. The manifest remains at 1,790 vectors and 35
operation labels; Milestone 5 changes observation spelling and documentation,
not discovery count. A clean `npm ci`, the complete local verification suite,
the dedicated Money-observation audit, and the 35-label documentation audit all
pass; the offline dependency audit reports zero known vulnerabilities. These are
artifact checks, not implementation execution or a 0.9.8 release declaration.

## Milestone 6 — Harden maintenance validation and regression tests

### Milestone 6 implementation — 2026-10-02

The conformance validator now resolves every expected portable error through
the consolidated specification error catalog. It also treats manifest vectors
and `boundary097-cases.json` as the two explicit identifier namespaces for
paired controls while continuing to exclude the supplementary historical cases
from manifest discovery, vector counts, schema conformance, and execution.

Agentic checking now enforces the documented descriptor minimum and registry
effect vocabularies. Traceability checking derives domain and modality from the
owning specification requirements, verifies every inventory column at both the
domain and total levels, constrains coverage classifications, and validates
vector evidence for both `COVERED` and `PARTIAL` rows. Documentation checking
now rejects unknown CoreDoc requirement prefixes, absent requirement IDs,
invalid ranges, and nonexistent local Markdown fragments.

- [x] Validate every `expected.error.code` against actual portable error
      declarations, not merely a naming pattern or any incidental mention.
      Preserve owning-domain and intentionally non-exhaustive error semantics.
- [x] Validate `pairedControl` references against explicitly supported manifest
      and supplementary namespaces. Supplementary historical controls remain
      historical evidence, not executed or manifest-listed conformance cases.
- [x] Validate required Agentic descriptor content and allowed effect values,
      supporting the existing Markdown field variants without demanding a new
      registry format, server, runner, or executable financial model.
- [x] Check per-domain and overall traceability totals, permitted classifications,
      modality consistency, and vector references in PARTIAL evidence as well as
      COVERED rows. Keep human rationales where evidence is not a vector list.
- [x] Reject unknown CoreDoc requirement prefixes and validate referenced IDs
      against definitions. Preserve valid CoreDoc rule IDs and range notation.
- [x] Check local Markdown fragments in addition to file existence, or narrow
      documented checker guarantees explicitly if fragment validation is deferred.
- [x] Add permanent positive and negative tool tests for A5–A7, including CLI
      failure exit status and valid controls. The audited baseline's 11 tests did
      not cover traceability and documentation checker behavior.
- [x] Re-run adversarial copies restoring each reproduced omission; require
      the relevant regression to fail for the intended reason. Tool crashes and
      infrastructure failures are not evidence of correct validation.

**Completion:** the documented automated guarantees have regression coverage,
and each reproduced metadata defect is rejected without executing finance.

Implemented on 2026-10-02. The permanent suite now contains 22 tool tests. Its
temporary-copy adversarial cases restore every A5–A7 omission: undeclared errors,
dangling paired controls, incomplete descriptors, invalid effect values, false
inventory totals and modalities, unsupported classifications, invalid PARTIAL
evidence, unknown CoreDoc prefixes or IDs, and missing Markdown fragments. Each
case returns a failure result with its intended diagnostic; valid controls pass.
The artifact inventory remains 440 requirements, 1,790 vectors, 35 conformance
operation labels, and 20 canonical Agentic operations. This milestone changes
maintenance validation only, not CoreDoc, normative financial requirements,
portable errors, stable identifiers, or operation semantics. A clean locked
install and the complete local verification suite pass on Node 24.15.0; the
separate offline dependency audit reports zero known vulnerabilities. These are
artifact and maintenance-tool checks, not financial implementation execution or
a 0.9.8 release declaration.

## Milestone 7 — Synchronize current documentation and governance

### Milestone 7 implementation — 2026-10-03

Local artifact verification and dependency vulnerability review are now
separate gates. A locked install uses `npm ci --no-audit`, `npm run verify`
performs the deterministic repository checks without an advisory-service query,
and `npm run dependencies:audit` performs the separately reported network-backed
dependency review. The developer-tool guide now documents the supported Node
range, an existing repository-local runtime path, official archive checksum
verification, the ignored `.tools/` layout, and the exact local commands.

`SPEC-FREEZE-002` now governs artifacts this repository owns: specification,
conformance or traceability, applicable Agentic metadata, public documentation,
and affected maintenance validation/tests. An observable correction must also
document compatibility and consumer migration impact, but consumer-owned code
and execution evidence are not a same-commit repository prerequisite. This is a
normative governance-scope correction prompted by the transition's demonstrated
ownership contradiction. It preserves the requirement ID and MUST modality,
changes no portable financial behavior or error, and remains `NOT DIRECTLY
TESTABLE`; its traceability rationale and contribution guidance are updated.

Active Agentic and specification correction notes now label former native,
adapter, package, and execution results as historical evidence instead of
current gates or pending repository implementation work. Root and domain
introductions, consumer guidance, the Core 1.0 plan, CoreDoc relationship text,
and agent instructions were rechecked against the current ownership model.
CoreDoc already states the correct layer relationship, so none of its text or
governance metadata changed.

- [x] Correct README, AGENTS.md, developer-tool guidance, and release gates to
      distinguish deterministic local verification from network dependency audit.
      Describe the actual dependency-check step and result scope; do not make
      financial expectations or local artifact checks network-dependent.
- [x] Provide the missing supported-Node setup/bootstrap guidance or replace
      the nonexistent workflow reference with an accurate prerequisite.
- [x] Review SPEC-FREEZE-002 and related contribution rules for the new ownership
      model. Keep coordinated specification/vector/Agentic/documentation updates
      mandatory while distinguishing consumer migration obligations from changes
      this repository can deliver. Follow compatibility policy for any normative edit.
- [x] Remove current-tense claims of maintained implementation verification
      from active Agentic/specification guidance. Preserve dated historical
      results and stable references without presenting them as current gates.
- [x] Recheck root/domain introductions, consumer guidance, the 1.0 plan,
      CoreDoc relationship text, and AGENTS.md against the completed follow-ups.
      Do not change CoreDoc normative version fields for editorial corrections.

**Completion:** current instructions can be followed from a clean checkout and
accurately describe maintained responsibilities and the checks actually run.

Implemented on 2026-10-03. The maintained surface remains specification,
conformance artifacts, the Agentic Contract, and domain-neutral maintenance
tools. No implementation, runner, adapter API, language package, or hosted
workflow was added. A clean locked install, complete local verification, and
separate network-backed dependency audit pass on Node 24.15.0. The 2026-10-03
advisory query reports zero known vulnerabilities in the six-package locked
maintenance graph. These checks validate repository artifacts and maintenance
dependencies; they do not execute financial behavior or establish consumer
conformance.

## Milestone 8 — Fresh audit and release readiness

- [ ] Run a fresh locked install and `npm run verify` after M4–M7. Record the
      supported runtime and actual bounded results; earlier counts are baseline
      observations, not acceptance targets.
- [ ] Repeat whole-corpus identifier, error, topic, operation, paired-control,
      traceability, and normative-example checks. Review any identical requests
      with differing expectations and any newly changed contract boundaries.
- [ ] Repeat targeted negative controls for all reproduced validator omissions
      and review descriptor semantics against `/spec`; static validity alone
      cannot establish semantic correctness.
- [ ] Confirm that A1–A8 are resolved or explicitly scoped out with a rationale
      consistent with the release's advertised guarantees. Unresolved mandatory
      financial behavior remains a blocker for stable promotion.
- [ ] Keep all release status and conformance claims accurate: artifact checks
      do not establish financial execution, external implementation conformance,
      exhaustive coverage, or production readiness.
- [ ] Update this plan's final status and the 1.0 prerequisite only after the
      follow-up gates pass. Keep release history concise; add no separate audit,
      closure, alignment, checksum, or provenance report.

**Completion:** the post-transition findings are dispositioned, current artifacts
and guidance agree, and the final candidate passes its documented local gates.
Execute M4 → M5 → M6 → M7 → M8, with independent tooling work allowed while
financial decisions are pending. This audit does not approve a financial policy,
publish a release, or promote Core 1.0.

Add a concise summary to [release notes](../releases/README.md) when this work
is released. Do not record planned removal as a completed release or carry
forward old implementation verification as evidence for the new repository.
