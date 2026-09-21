# FinKore Core 0.9.2 Plan

## Status

In progress. Milestone 1 is complete; implementation fixes in Milestones 2
and 3 remain pending. Core 1.0 promotion is blocked by the Money exactness and
Approval validity defects reproduced during the readiness review.

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

Python subtraction and negation use context-sensitive Decimal unary negation.
Allocation constructs results with context-sensitive `Decimal.scaleb`.

For `x = 1234567890123456789012345678.91 EUR`, the default Python Decimal
precision produces these incorrect results:

| Operation | Required amount | Observed Python amount |
| --- | --- | --- |
| `0 - x` | `-1234567890123456789012345678.91` | `-1234567890123456789012345679` |
| Negate `x` | `-1234567890123456789012345678.91` | `-1234567890123456789012345679.00` |
| Allocate `x` equally into one part at scale 2 | `1234567890123456789012345678.91` | `1234567890123456789012345679.00` |

The allocation creates `0.09 EUR`. TypeScript and Java preserve the exact
amounts for all three probes.

Governing requirements include `MONEY-ARITHMETIC-003`,
`MONEY-ARITHMETIC-007`, `MONEY-ARITHMETIC-008`, `MONEY-ARITHMETIC-009`,
`MONEY-ALLOCATION-008`, and `MONEY-ALLOCATION-013`.

### Approval validity after a relevant fact changes

Python `_facts_match` uses native equality, under which `True == 1`. When a
caller-declared relevant fact changes from JSON `true` to JSON `1`, Python
continues to report `APPROVED`. TypeScript and Java report `PENDING`.

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

- [ ] Replace context-sensitive negation and allocation result construction
      with exact operations, following existing coefficient-and-scale patterns.
- [ ] Check adjacent Money operations for the same Decimal-context dependency;
      retain a failing regression before fixing any additional confirmed defect.
- [ ] Exercise operands below, at, and above the default precision boundary,
      including a high-precision right-hand subtraction operand.
- [ ] Cover positive, negative, and zero values, cancellation, high scales,
      equal-part and ratio allocation, and deterministic remainder order.
- [ ] Verify exact allocation conservation and unchanged operands after success
      and failure. Do not use approximate assertions.
- [ ] Use scoped Python Decimal contexts to verify results under different
      precisions and rounding modes, including a reduced-precision context
      with ordinary-sized amounts. Restore caller context after each test and
      confirm core operations do not change it.
- [ ] Verify serialization preserves corrected numeric amounts without adding
      an unspecified presentation-scale requirement.
- [ ] Run the affected unit tests and real Money conformance vectors on
      CPython 3.12 and 3.13, TypeScript, and Java.

Completion: exact arithmetic and allocation results no longer depend on the
caller's Decimal precision or rounding mode, and allocation conserves value.

## Milestone 3 — Portable Approval fact comparison

- [ ] Correct Python relevant-fact comparison so native Boolean/numeric
      equality cannot treat changed JSON facts as unchanged.
- [ ] Apply the correction consistently to decision effectiveness and
      requirement evaluation; review other Approval callers of the comparison.
- [ ] Add paired unchanged/changed cases for `true` versus `1` and `false`
      versus `0`, including reversed operands and nested objects and arrays.
- [ ] Preserve existing portable comparison semantics for numeric values,
      strings, nulls, missing paths, object member order, and array order.
      Resolve any demonstrated undefined semantics through `/spec` first.
- [ ] Verify stale decisions cannot satisfy or reject a requirement and that
      committed decisions and caller-supplied facts remain unchanged.
- [ ] Retain positive controls proving an unchanged effective approval still
      satisfies its requirement.
- [ ] Run affected unit tests and real Approval vectors on CPython 3.12 and
      3.13, TypeScript, and Java, comparing normalized observations.

Completion: changing a declared relevant fact invalidates the prior decision
consistently across languages without rewriting historical evidence.

## Milestone 4 — Mutation protection and release verification

- [ ] Extend targeted Python critical-mutant probes to reintroduce
      context-sensitive subtraction, negation, and allocation construction,
      and native Boolean/numeric fact equality.
- [ ] Confirm each probe is killed by the corresponding regression rather than
      an unrelated infrastructure failure.
- [ ] Run both full Stryker suites at the existing minimum 95 percent gate and
      all configured Python and Java critical probes. Review survivors; no
      critical financial mutant may survive.
- [ ] Run all configured builds, strict checks, unit and adapter tests,
      coverage gates, and the complete expanded conformance manifest.
- [ ] Verify all implementations pass every manifest vector with no failures,
      unsupported results, or infrastructure errors; include Python 3.13.
- [ ] Build and consume the TypeScript, Python, and Java artifacts in isolated
      consumer environments using the existing package gate.
- [ ] Run documentation, traceability, architecture, license, and whitespace
      checks, preserving a domain-neutral runner and translation-only adapters.
- [ ] From a clean checkout, run `npm ci` and the complete `npm run verify`.
      Ensure the new critical probes participate in this aggregate command.

Completion: the expanded local release workflow passes and demonstrably rejects
reintroductions of both blockers.

## Milestone 5 — Documentation and corrective release

- [ ] Review Python public API docstrings and README claims about exactness,
      Decimal context independence, Approval effectiveness, and immutability.
      Update affected examples and documentation with the corrections.
- [ ] Review TypeScript JSDoc, Java documentation, `/spec`, `/conformance`,
      `/agentic`, CoreDoc, the root README, and `AGENTS.md` for affected claims.
      Update only affected artifacts; do not change normative text merely to
      record an implementation fix.
- [ ] Keep Core release identity, implementation package versions, and
      conformance syntax versions distinct. Check consistency of public Core
      constants, package metadata, runner report labels, and consumer assertions
      with the declared corrective baseline; do not promote them to 1.0 here.
- [ ] Retain the repository-reference package publication status unless the
      maintainer explicitly changes the distribution decision.
- [ ] After verification, add a concise 0.9.2 summary to
      [the release notes](../releases/README.md) describing the Money and
      Approval corrections. Do not add separate audit or closure reports.
- [ ] Verify intended commit and existing tag state, then create the annotated
      `core-0.9.2` tag through the maintainer's release process after all gates
      pass. Do not move an existing release tag.
- [ ] Mark this plan complete and reopen [Core 1.0 planning](plan-10.md) only
      after the corrective release gate is satisfied.

## Release gate

Core 0.9.2 is complete only when:

- [ ] All four reproduced failures have permanent regressions and are fixed.
- [ ] Money preserves exact results and allocation conservation across tested
      Decimal contexts, with no operand mutation or implicit rounding.
- [ ] Changed relevant facts invalidate Approval decisions consistently across
      languages while preserving history.
- [ ] Existing and new vectors pass on all official implementations and required
      runtime versions.
- [ ] Coverage and mutation gates pass, including probes for each corrected
      failure mechanism, with no critical surviving mutant.
- [ ] Clean-checkout verification and isolated consumer installation pass.
- [ ] Traceability and affected public documentation describe the actual state.
- [ ] No new domain, invented financial semantics, or architectural bypass was
      introduced.
- [ ] The concise release note and corrective release tag identify the verified
      state, and no known blocker remains before resuming Core 1.0 promotion.
