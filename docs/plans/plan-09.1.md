# FinKore Core 0.9.1 Plan

Status: Planned

Release type: Corrective release candidate

Target: Resolve the portability, traceability, verification, and release-presentation defects found during the Core 0.9 audit before opening the project or advancing to Core 1.0.

This plan is non-normative. FinKore financial behavior remains defined by CoreDoc and /spec. Work under this plan MUST follow the specification-first sequence and the Core 0.9 freeze rules in SPEC-FREEZE-001 through SPEC-FREEZE-004.

## 1. Objective

Core 0.9.1 is a stabilization release. It does not add a new financial domain or expand the public scope.

The release MUST:

- eliminate demonstrated cross-language differences in timestamps and Money allocation;
- restore accurate requirement-to-conformance traceability;
- make release verification reproduce all mandatory quality gates;
- align documentation and release artifacts with the actual repository state;
- retain compatibility unless resolving a confirmed contradiction requires an explicitly documented corrective change.

## 2. Confirmed audit findings

The following findings define the initial task backlog. Each item must be resolved, explicitly deferred by the specification, or documented as a justified non-defect before 0.9.1 is released.

### 2.1 Release blockers

1. Timestamp precision is not portable across the TypeScript, Python, and Java implementations.
   - The specification requires exact RFC 3339 instant semantics.
   - TypeScript currently compares through millisecond-precision Date values.
   - Python retains microseconds.
   - Java retains nanoseconds.
   - An approval expiry probe using 0.0005 seconds versus 0.0004 seconds produced different results across implementations.

2. RFC 3339 timestamp validation is inconsistent.
   - Some implementations accept syntactically invalid or calendar-invalid values that others reject.
   - Observed examples include normalized invalid calendar dates and basic timestamp forms that are outside the intended portable syntax.

3. Money allocation ratio integers do not have a portable representable domain.
   - The specification requires positive integer ratios but does not define a maximum value or alternate encoding.
   - A ratio of 9007199254740992 is outside JavaScript's safe integer range and produced behavior different from Python and Java.

### 2.2 Traceability and contract defects

4. The traceability inventory is stale.
   - The specification contains 399 requirement definitions.
   - The traceability document reports 381.
   - Fourteen SPEC-COMPATIBILITY requirements and four SPEC-FREEZE requirements are absent from the inventory.

5. Six requirements are marked COVERED but are not referenced by any conformance vector requirements array:
   - AUDIT-APPEND-004
   - AUDIT-CHANGE-006
   - AUDIT-EVENT-007
   - APPROVAL-ERROR-003
   - ENTITY-REVISION-002
   - ENTITY-REVISION-007

6. SPEC-TIMESTAMP-001 and SPEC-TIMESTAMP-002 are marked non-directly-testable even though their portable syntax and instant-comparison rules are exercised by implementations.

7. FINKORE_AUDIT_ACTOR_INVALID is exposed as a portable Audit error without a complete normative requirement-to-vector mapping for its rejection behavior and precedence.

### 2.3 Verification and release-process defects

8. The aggregate npm run verify workflow passes, but does not execute the Runner and TypeScript Stryker suites.

9. The TypeScript mutation allowlist excludes meaningful financial behavior, including audit redaction, without sufficiently narrow release-facing justification.

10. Python 3.13 compatibility is required by repository policy but is not part of the normal aggregate verification workflow.

11. Release presentation is ambiguous.
    - CoreDoc contains both Core 0.9 release-candidate and Core 1.0 release-candidate wording.
    - Release notes describe 0.8 and 0.9 while the inspected local tags stop at earlier draft releases.
    - runner/package.json.orig is a tracked stale backup artifact.
    - Remote release and tag state still requires authenticated verification.

## 3. Scope constraints

This release MUST NOT:

- add a new domain;
- invent financial behavior in an implementation, adapter, runner, or test;
- turn conformance vectors into a second specification;
- rename stable requirement IDs, portable error codes, or operation IDs without a compatibility assessment;
- claim portability for values or syntax that are not supported consistently;
- weaken mutation-sensitive tests or expand mutation exclusions merely to pass a gate;
- convert release notes into an audit, coverage, or verification report;
- add hosted CI as a substitute for the required local verification workflow.

## 4. Milestone 1 — Portable timestamp correction

Completed: 2026-09-20

Decision: FinKore accepts a strict RFC 3339 profile with valid Gregorian years
`0001` through `9999`, uppercase `T` and `Z`, known explicit offsets,
and zero through nine fractional digits. Leap seconds, unknown `-00:00`
offsets, lowercase/basic forms, invalid calendars, and excess precision are
rejected. Exact comparison uses seconds plus nanoseconds and preserves supplied
valid lexical representations.

### 4.1 Specify the portable timestamp profile

- [x] Add regression probes for every demonstrated timestamp disagreement before changing implementation behavior.
- [x] Decide and normatively define one portable fractional-second policy:
  - a bounded precision supported identically by all conforming implementations; or
  - an exact representation and comparison algorithm that does not lose precision in any supported implementation.
- [x] Define behavior for fractional precision beyond the portable limit, including the portable error outcome.
- [x] Define the accepted RFC 3339 syntax precisely, including:
  - calendar validity;
  - uppercase and lowercase policy where relevant;
  - required separators;
  - UTC designator and numeric offsets;
  - fractional-second syntax and limits;
  - leap-second policy;
  - canonical serialization.
- [x] Confirm whether equivalent offset representations compare as the same instant.
- [x] Confirm Approval expiry boundary semantics at equality and at the smallest supported sub-second unit.
- [x] Map every invalid timestamp condition to an existing specified portable error, or identify a specification gap before adding a new code.

### 4.2 Update traceable artifacts

- [x] Review CoreDoc; no foundation-level obligation changed, so no CoreDoc edit was required.
- [x] Update shared timestamp requirements in /spec.
- [x] Review Audit, Approval, Entity Evolution, and Workflow specifications; update the affected Audit and Approval documents.
- [x] Update Agentic conventions and operation metadata; this repository has no separate Agentic schema artifact.
- [x] Add conformance vectors for:
  - valid minimum and maximum supported fractional precision;
  - the first rejected precision beyond the limit;
  - invalid calendar dates;
  - missing or malformed offsets;
  - basic forms without required separators;
  - equivalent instants with different offsets;
  - Approval expiry equality;
  - sub-unit before and after expiry;
  - failure-without-state-change invariants.
- [x] Reference the shared timestamp requirements from every relevant new vector.

### 4.3 Implement consistently

- [x] Correct the TypeScript implementation without using lossy Date-based comparison for unsupported precision.
- [x] Correct the Python implementation to enforce the same syntax and precision profile.
- [x] Correct the Java implementation to enforce the same syntax and precision profile.
- [x] Keep timestamp parsing and comparison out of the domain-neutral Runner.
- [x] Add unit and mutation-sensitive tests in all three implementations.
- [x] Review public API documentation and error documentation for timestamp semantics.

### 4.4 Completion criteria

- [x] All timestamp regression probes return identical normalized results in TypeScript, Python, and Java.
- [x] All affected conformance vectors pass in all three implementations.
- [x] No critical precision, boundary, syntax-validation, or failure-mutation mutant survives.
- [x] The accepted syntax and precision are unambiguous to a future implementation author.

## 5. Milestone 2 — Portable allocation integer domain

Completed: 2026-09-20

Decision: portable allocation integers retain the existing JSON-number shape.
Allocation scale is bounded to `0..50`, equal-part count to `1..100`, and each
ratio to `1..9007199254740991`, all inclusive. Integer meaning is mathematical,
so integral JSON numbers such as `2.0` are accepted; strings, booleans, nulls,
fractions, non-finite implementation values, and out-of-range integers fail
with `FINKORE_MONEY_INVALID_ALLOCATION`. These executable bounds preserve the
existing cross-language scale-50, 100-part, and safe-integer ratio baselines
while correcting the demonstrated ambiguity.

### 5.1 Specify the integer representation

- [x] Preserve a failing regression case for allocation ratios above JavaScript's safe integer range.
- [x] Decide and normatively define one portable representation:
  - bounded JSON integers with an explicit inclusive maximum; or
  - canonical decimal-string integers with exact parsing rules.
- [x] Define validation and portable errors for zero, negative, fractional, malformed, and out-of-range ratios.
- [x] Review whether the same representation issue affects allocation part counts, scale values, versions, revisions, or other integer-shaped inputs.
- [x] Assess compatibility consequences for existing conformance syntax and Agentic schemas.

### 5.2 Align specification and metadata

- [x] Update Money allocation requirements and examples.
- [x] Update the canonical conformance input schema and vectors.
- [x] Update finkore.money.allocate Agentic metadata.
- [x] Add boundary vectors at:
  - the largest supported value;
  - the first unsupported value;
  - combinations of large and small ratios;
  - totals that challenge intermediate arithmetic;
  - invalid encodings and non-integers.
- [x] Retain exact conservation, determinism, ordering, and non-mutation assertions.

### 5.3 Implement and verify

- [x] Update TypeScript, Python, and Java implementations only after the portable representation is specified.
- [x] Ensure adapters translate data without implementing allocation rules.
- [x] Add unit, conformance, regression, and mutation-sensitive coverage.
- [x] Review public API documentation and package examples.

### 5.4 Completion criteria

- [x] Every value accepted by the portable contract behaves identically in all three implementations.
- [x] Every value outside the portable contract returns the same portable error outcome.
- [x] No critical range, integer-validation, conservation, ordering, or mutation mutant survives.

## 6. Milestone 3 — Traceability and Audit contract repair

Completed: 2026-09-20

Decision: a supplied Audit actor has a closed portable minimum shape and uses
`FINKORE_AUDIT_ACTOR_INVALID`. Append validation now selects errors in the
portable order: supplied history, non-actor candidate representation, actor,
duplicate event identity, then history-dependent relationship validity. The
rebuilt inventory contains 406 requirements and 281 vectors; 322 requirements
are COVERED and 84 are NOT DIRECTLY TESTABLE with an explicit rationale.

### 6.1 Audit actor error

- [x] Add or clarify the normative requirement governing invalid Audit actors.
- [x] Specify rejection precedence where more than one Audit input is invalid.
- [x] Add negative conformance vectors for missing, empty, malformed, and otherwise invalid actors as applicable.
- [x] Verify that failed append operations do not mutate Audit history.
- [x] Align Agentic error declarations, implementation errors, JSDoc, and README examples.

### 6.2 Requirement inventory

- [x] Rebuild the requirement inventory from the current specification and confirm the expected total.
- [x] Add the fourteen SPEC-COMPATIBILITY and four SPEC-FREEZE requirements to traceability.
- [x] Repair or reclassify the six requirements marked COVERED without vector references.
- [x] Reclassify SPEC-TIMESTAMP-001 and SPEC-TIMESTAMP-002 based on their executable assertions.
- [x] Review every remaining non-directly-testable classification for a written, defensible reason.
- [x] Recalculate all traceability totals and status summaries.

### 6.3 Automated consistency checks

- [x] Add a local documentation check that detects specification requirement IDs missing from traceability.
- [x] Add a check that rejects COVERED rows without at least one machine-readable vector reference.
- [x] Add a check for unknown requirement IDs referenced by vectors or Agentic metadata.
- [x] Ensure checks validate metadata only and do not define financial behavior.
- [x] Add the required purpose/effects/non-normative header to every new executable under docs/tools.

### 6.4 Completion criteria

- [x] Every specification requirement appears exactly once in the traceability inventory.
- [x] Every COVERED claim is supported by a real vector reference.
- [x] Every intentional non-directly-testable classification has a clear reason.
- [x] Portable Audit actor errors are normatively specified and tested.

## 7. Milestone 4 — Reproducible verification and mutation gates

Completed: 2026-09-20

Decision: `npm run verify` is the single complete local release workflow. It
bootstraps missing repository-local toolchains, checks the Node release line,
runs CPython 3.12 and 3.13, executes every vector against all implementations,
builds and inspects local package artifacts, runs coverage, runs both full
Stryker suites, and finishes with the targeted Python and Java critical mutant
probes. The supported Node claim is narrowed to `>=24.11.0 <25`, the line
actually exercised by the release workflow. A fresh clone rehearsal completed
with Node 24.15.0, CPython 3.12.14 and 3.13.15, JDK 21.0.12.1, and Maven 3.9.9.
Runner mutation passed at 96.90 percent and TypeScript mutation passed at 96.17
percent; all 36 targeted Python and Java critical mutants were killed. Surviving
Stryker mutants were classified as non-normative diagnostic changes or
equivalent/unreachable transformations behind already validated invariants; no
survivor changes portable financial behavior.

### 7.1 Aggregate verification

- [x] Make the documented release workflow execute, directly or through a clearly documented second command:
  - strict builds;
  - unit tests;
  - coverage;
  - all conformance vectors against all implementations;
  - Runner mutation testing;
  - TypeScript implementation mutation testing;
  - targeted Python and Java critical mutation checks;
  - documentation, architecture, package, and license checks.
- [x] Keep fast developer checks separate if necessary, but make the release command complete and unambiguous.

### 7.2 Mutation scope

- [x] Review every mutation include and exclude rule.
- [x] Bring audit redaction and other meaningful financial behavior into mutation scope, or add a narrow equivalent-mutant justification.
- [x] Classify surviving mutants by financial criticality rather than aggregate score alone.
- [x] Add tests that kill all critical survivors.
- [x] Extend targeted Python and Java mutants for timestamp precision, allocation range, and Audit actor validation.

### 7.3 Toolchain matrix

- [x] Run the Python suite on CPython 3.12.
- [x] Run the compatibility suite on CPython 3.13.
- [x] Run Java work with JDK 21 and Maven 3.9.x.
- [x] Verify every Node version claimed by package engine metadata, or narrow the claim before release.
- [x] Make tool bootstrap and tool checks reproducible from a clean checkout.

### 7.4 Completion criteria

- [x] The complete release workflow passes from a clean checkout.
- [x] Runner and TypeScript mutation scores remain at least 95 percent.
- [x] No critical financial mutant survives in any implementation.
- [x] Required Python, Java, Maven, and Node compatibility claims are demonstrated by the release workflow.

## 8. Milestone 5 — Documentation and release hygiene

- [ ] Resolve the Core 0.9 versus Core 1.0 release-candidate wording in CoreDoc without changing normative behavior accidentally.
- [ ] Review root and package READMEs for current capability, conformance, toolchain, and release claims.
- [ ] Review Agentic metadata and public JSDoc for every corrected behavior.
- [ ] Remove runner/package.json.orig after confirming it has no legitimate package role.
- [ ] Verify published package contents exclude temporary, backup, fixture-only, and repository-only files.
- [ ] Perform consumer-style installation and import checks for publishable packages.
- [ ] Add a concise Core 0.9.1 entry to docs/releases/README.md after the corrective work is complete.
- [ ] Verify local and remote tag state with authenticated repository access before publishing.
- [ ] Create the Core 0.9.1 release tag only after every release gate passes.
- [ ] Reopen Core 1.0 planning only when no unresolved 0.9.1 blocker remains.

## 9. Required execution order

Work should proceed in this order:

1. Preserve each confirmed defect as a failing regression test or conformance probe.
2. Resolve the relevant specification ambiguity.
3. Update stable requirements and traceability.
4. Update conformance vectors and Agentic metadata.
5. Implement the minimum correction in each language.
6. Run unit, boundary, negative, invariant, and regression tests.
7. Run cross-language conformance.
8. Run mutation testing and kill all critical survivors.
9. Refresh JSDoc, READMEs, and release notes.
10. Run the complete release workflow from a clean checkout.

Implementation changes MUST NOT precede the normative decision for timestamp precision or allocation integer representation.

## 10. Core 0.9.1 release gate

Core 0.9.1 is ready only when all of the following are true:

- [ ] Timestamp syntax, precision, comparison, serialization, and expiry boundaries are portable.
- [ ] Money allocation has a portable integer representation and range.
- [ ] All confirmed cross-language probes agree.
- [ ] The requirement inventory and traceability totals are accurate.
- [ ] No COVERED requirement lacks real conformance evidence.
- [ ] Audit actor invalidity has a complete normative and conformance mapping.
- [ ] All 254 existing vectors plus every new 0.9.1 vector pass against TypeScript, Python, and Java.
- [ ] Runner and TypeScript mutation suites meet the 95 percent target.
- [ ] No critical mutant survives, including targeted Python and Java mutants.
- [ ] CPython 3.12 and 3.13 compatibility checks pass.
- [ ] JDK 21, Maven 3.9.x, and supported Node checks pass.
- [ ] Documentation, architecture, package, and license checks pass.
- [ ] CoreDoc, READMEs, Agentic metadata, JSDoc, and release notes describe the same current behavior.
- [ ] No stale backup or unintended package artifact remains.
- [ ] Remote release/tag state has been verified.
- [ ] The working tree contains only intentional release changes.

Any unresolved item above blocks the 0.9.1 release candidate unless the specification explicitly records it as deferred and the deferral does not undermine a current portability or conformance claim.
