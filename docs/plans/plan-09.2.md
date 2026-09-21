# FinKore Core 0.9.2 Plan

## Status

Complete locally. All five milestones are complete. The Money exactness and
Approval validity defects are fixed, clean-checkout release verification passes,
and the annotated local `core-0.9.2` tag identifies the corrective snapshot.
Core 1.0 planning is reopened. Remote tag inspection and publication remain
pending GitHub authentication.

Release type: Corrective release candidate.

This plan is non-normative. [CoreDoc](../coreDoc/core-doc.md) and `/spec` remain
the source of financial behavior. Work follows the Core 0.9 freeze rules in
`SPEC-FREEZE-001` through `SPEC-FREEZE-004`. Completing this plan permits work
on the [Core 1.0 plan](plan-10.md) to resume; it does not declare Core 1.0 stable.

## Objective and scope

Correct the two confirmed Python defects, retain permanent cross-language
regressions, and strengthen verification so the same defects cannot pass the
release gates again.

Both findings violate existing requirements. No new financial domain, portable
error, operation ID, serialization shape, or public API is planned. Preserve
existing identifiers and architectural boundaries. Financial fixes belong in
the implementation core, not in adapters or the runner.

If investigation demonstrates a specification gap, identify it before changing
behavior and apply the release-candidate correction policy. Do not redefine
expected results to match a defective implementation or reduce supported
precision to avoid the Money defect.

## Confirmed blockers

### Money exactness and allocation conservation

Before the Milestone 2 correction, Python subtraction and negation used
context-sensitive Decimal unary negation, and allocation constructed results
with context-sensitive `Decimal.scaleb`.

For `x = 1234567890123456789012345678.91 EUR`, the default Python Decimal
precision produced these incorrect results:

| Operation | Required amount | Observed Python amount |
| --- | --- | --- |
| `0 - x` | `-1234567890123456789012345678.91` | `-1234567890123456789012345679` |
| Negate `x` | `-1234567890123456789012345678.91` | `-1234567890123456789012345679.00` |
| Allocate `x` equally into one part at scale 2 | `1234567890123456789012345678.91` | `1234567890123456789012345679.00` |

The defective allocation created `0.09 EUR`. All three implementations now
preserve the exact amounts for these probes.

Governing requirements include `MONEY-ARITHMETIC-003`,
`MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-008`, `MONEY-ARITHMETIC-009`,
`MONEY-ALLOCATION-008`, and `MONEY-ALLOCATION-013`.

### Approval validity after a relevant fact changes

Before the Milestone 3 correction, Python `_facts_match` used native equality,
under which `True == 1`. When a caller-declared relevant fact changed from JSON
`true` to JSON `1`, Python continued to report `APPROVED`. All three
implementations now report `PENDING`, including for nested Boolean/numeric
changes, while preserving decision history.

Governing requirements include `APPROVAL-DECISION-003`,
`APPROVAL-VALIDITY-003`, and the history-preservation rule
`APPROVAL-DECISION-007`.

The existing complete verification workflow passed during the review despite
these defects. Its success is therefore insufficient evidence that the new
blockers have been resolved. Temporary review probes must become permanent
tests and vectors; this release must not depend on files under `/tmp`.

## Milestone 1 — Permanent failing regressions

Preserve each demonstrated failure before implementation changes.

- [x] Read Money arithmetic, representation, serialization, and allocation
      specifications and Approval decisions and validity specifications.
      Confirm the existing governing requirements and related Agentic metadata.
- [x] Add manifest-discovered Money vectors for high-precision subtraction,
      negation, and one-part allocation using the reproduced inputs above.
- [x] Add a vector for an approved requirement whose explicitly relevant fact
      changes from `true` to `1`, requiring `PENDING` and preserved history.
- [x] Give new vectors stable IDs, valid requirement references, `regression`
      and mutation-sensitive metadata, and exact expected observations.
- [x] Add Python unit regressions for each defect through the public API.
- [x] Confirm the new regressions fail against the defective Python code and
      that TypeScript and Java agree with the normative portable expectations.
- [x] Update traceability references and vector counts without claiming that
      requirement inventory coverage proves exhaustive boundary coverage.

Completed: 2026-09-21. All four demonstrated incorrect observations now have
permanent, requirement-backed unit tests and manifest-discovered vectors.
TypeScript and Java pass all 285 vectors; CPython 3.12 and 3.13 each pass the
original 281 and fail exactly the four new regressions. Python unit tests fail
on the same four defects. Approval adapters expose optional post-evaluation
history observations, and current conformance claims and traceability are
updated. No financial core behavior or normative contract was changed.

## Milestone 2 — Exact Python Money operations

- [x] Replace context-sensitive negation and allocation result construction
      with exact operations, following existing coefficient-and-scale patterns.
- [x] Check adjacent Money operations for the same Decimal-context dependency;
      retain a failing regression before fixing any additional confirmed defect.
- [x] Exercise operands below, at, and above the default precision boundary,
      including a high-precision right-hand subtraction operand.
- [x] Cover positive, negative, and zero values, cancellation, high scales,
      equal-part and ratio allocation, and deterministic remainder order.
- [x] Verify exact allocation conservation and unchanged operands after success
      and failure. Do not use approximate assertions.
- [x] Use scoped Python Decimal contexts to verify results under different
      precisions and rounding modes, including a reduced-precision context
      with ordinary-sized amounts. Restore caller context after each test and
      confirm core operations do not change it.
- [x] Verify serialization preserves corrected numeric amounts without adding
      an unspecified presentation-scale requirement.
- [x] Run the affected unit tests and real Money conformance vectors on
      CPython 3.12 and 3.13, TypeScript, and Java.

Completed: 2026-09-21. Subtraction and negation now use context-independent
sign reversal; allocation reconstructs exact values from integer units and
scale. The added boundary and context tests failed before the correction and
pass afterward on CPython 3.12 and 3.13. All 102 Money vectors pass in both
Python versions, TypeScript, and Java. All eight scoped Python Money critical
probes are killed, including reintroductions of the three corrected defects.
Money unit/conformance coverage is 94 percent. Adjacent Money operations were
reviewed and exercised without finding another Decimal-context defect.

Public docstrings and current conformance claims are updated. Existing
requirements, vectors, and Agentic operation contracts already define the
correct behavior; no normative or public API change was needed. The full
Python suites still fail only the Approval regression reserved for Milestone 3;
complete release verification remains pending.

## Milestone 3 — Portable Approval fact comparison

- [x] Correct Python relevant-fact comparison so native Boolean/numeric
      equality cannot treat changed JSON facts as unchanged.
- [x] Apply the correction consistently to decision effectiveness and
      requirement evaluation; review other Approval callers of the comparison.
- [x] Add paired unchanged/changed cases for `true` versus `1` and `false`
      versus `0`, including reversed operands and nested objects and arrays.
- [x] Preserve existing portable comparison semantics for numeric values,
      strings, nulls, missing paths, object member order, and array order.
      Resolve any demonstrated undefined semantics through `/spec` first.
- [x] Verify stale decisions cannot satisfy or reject a requirement and that
      committed decisions and caller-supplied facts remain unchanged.
- [x] Retain positive controls proving an unchanged effective approval still
      satisfies its requirement.
- [x] Run affected unit tests and real Approval vectors on CPython 3.12 and
      3.13, TypeScript, and Java, comparing normalized observations.

Completed: 2026-09-21. Recursive fact comparison distinguishes Booleans from
numbers in both decision and requirement evaluation. Other Approval callers
were reviewed; composition consumes effective evidence without another fact
comparison. Paired tests cover both change directions, nested containers,
unchanged controls, stale approvals and rejections, and preservation of inputs
and history. The new tests failed before the fix and pass afterward.

All 40 Python unit tests pass on CPython 3.12 and 3.13. All 290 manifest vectors,
including 72 Approval vectors, pass in both Python versions, TypeScript, and
Java. All 22 Python critical probes are killed with vector failures and no
infrastructure errors; each new Approval probe fails its intended regression
or positive control. Python coverage passes at 87 percent, and `npm run check`
passes. Docstrings, README claims, and traceability are current. Existing
requirements and operation contracts define the correction; no normative or
public API change was needed. Complete release verification remains pending.

## Milestone 4 — Mutation protection and release verification

- [x] Extend targeted Python critical-mutant probes to reintroduce
      context-sensitive subtraction, negation, and allocation construction,
      and native Boolean/numeric fact equality.
- [x] Confirm each probe is killed by the corresponding regression rather than
      an unrelated infrastructure failure.
- [x] Run both full Stryker suites at the existing minimum 95 percent gate and
      all configured Python and Java critical probes. Review survivors; no
      critical financial mutant may survive.
- [x] Run all configured builds, strict checks, unit and adapter tests,
      coverage gates, and the complete expanded conformance manifest.
- [x] Verify all implementations pass every manifest vector with no failures,
      unsupported results, or infrastructure errors; include Python 3.13.
- [x] Build and consume the TypeScript, Python, and Java artifacts in isolated
      consumer environments using the existing package gate.
- [x] Run documentation, traceability, architecture, license, and whitespace
      checks, preserving a domain-neutral runner and translation-only adapters.
- [x] From a clean checkout, run `npm ci` and the complete `npm run verify`.
      Ensure the new critical probes participate in this aggregate command.

Completed: 2026-09-21. `npm ci` and the complete `npm run verify` pass in an
isolated clean checkout containing the milestone changes. All 290 vectors pass
in TypeScript, Java, and CPython 3.12/3.13 without failures, unsupported results,
or infrastructure errors. Builds, strict checks, unit and adapter tests,
coverage gates, isolated package consumers, and repository checks pass.

Full Stryker scores are 97.06 percent for the runner and 96.67 percent for the
TypeScript core. All 22 Python and 21 Java critical probes are killed. Probe
classification now rejects compilation/process failures, malformed or empty
reports, infrastructure outcomes, and unsupported results. The seven new Money
and Approval probes must fail their named regression or positive control;
classification tests participate in the aggregate release command.

Verification exposed a stale Java coverage helper, now aligned with all 72
Approval vectors and their history observations. Survivor review added tests
for manifest types, portable errors, malformed history/import inputs, opaque
scope/quorum identifiers, and Audit redaction boundaries. Audit target strings
now execute within the checks so Stryker can mutate them after module loading.
No financial behavior or public API changed. Remaining survivors and uncovered
mutants are non-normative diagnostics or equivalent under the portable contract;
the rationale is documented in [Developer Tools](../tools/README.md). No critical
mutant remains, and no exclusions or thresholds were relaxed. Corrective release
preparation remains in Milestone 5.

## Milestone 5 — Documentation and corrective release

- [x] Review Python public API docstrings and README claims about exactness,
      Decimal context independence, Approval effectiveness, and immutability.
      Update affected examples and documentation with the corrections.
- [x] Review TypeScript JSDoc, Java documentation, `/spec`, `/conformance`,
      `/agentic`, CoreDoc, the root README, and `AGENTS.md` for affected claims.
      Update only affected artifacts; do not change normative text merely to
      record an implementation fix.
- [x] Keep Core release identity, implementation package versions, and
      conformance syntax versions distinct. Check consistency of public Core
      constants, package metadata, runner report labels, and consumer assertions
      with the declared corrective baseline; do not promote them to 1.0 here.
- [x] Retain the repository-reference package publication status unless the
      maintainer explicitly changes the distribution decision.
- [x] After verification, add a concise 0.9.2 summary to
      [the release notes](../releases/README.md) describing the Money and
      Approval corrections. Do not add separate audit or closure reports.
- [x] Verify intended commit and existing tag state, then create the annotated
      `core-0.9.2` tag through the maintainer's release process after all gates
      pass. Do not move an existing release tag.
- [x] Mark this plan complete and reopen [Core 1.0 planning](plan-10.md) only
      after the corrective release gate is satisfied.

Completed locally: 2026-09-21. Python docstrings and all affected public claims
were reviewed against the implemented corrections. TypeScript JSDoc, Java
documentation, CoreDoc, `/spec`, `/conformance`, `/agentic`, and `AGENTS.md`
require no financial-contract changes. The release notes summarize the two
corrections, and READMEs distinguish the `core-0.9.2` snapshot from the unchanged
`0.9-rc` behavioral baseline, `0.1.0` reference packages, and `0.1` conformance
syntax. Packages remain unpublished repository reference implementations.

The release documentation snapshot passed `npm ci` and the complete `npm run
verify` in a clean checkout. Local tag inspection found no existing
`core-0.9.2`; the annotated tag identifies the final release commit, preserving
all existing tags. Remote inspection failed because GitHub credentials were
unavailable, so this completion records a local release only. Core 1.0 planning
may resume from this verified snapshot; stable 1.0 promotion remains a separate
plan.

## Release gate

Core 0.9.2 is complete only when:

- [x] All four reproduced failures have permanent regressions and are fixed.
- [x] Money preserves exact results and allocation conservation across tested
      Decimal contexts, with no operand mutation or implicit rounding.
- [x] Changed relevant facts invalidate Approval decisions consistently across
      languages while preserving history.
- [x] Existing and new vectors pass on all official implementations and required
      runtime versions.
- [x] Coverage and mutation gates pass, including probes for each corrected
      failure mechanism, with no critical surviving mutant.
- [x] Clean-checkout verification and isolated consumer installation pass.
- [x] Traceability and affected public documentation describe the actual state.
- [x] No new domain, invented financial semantics, or architectural bypass was
      introduced.
- [x] The concise release note and corrective release tag identify the verified
      state, and no known blocker remains before resuming Core 1.0 promotion.
