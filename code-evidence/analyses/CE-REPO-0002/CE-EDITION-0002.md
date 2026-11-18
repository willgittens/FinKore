# Brick Money — Ordered allocation in explicit integer steps

**Finding:** CE-FINDING-0002. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0002` / `CE-EDITION-0002`; `brick/money`; `0.15.2` |
| Source commit | [d025eb4a105071028764859d93537d394a147c31](https://github.com/brick/money/tree/d025eb4a105071028764859d93537d394a147c31) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How does an explicit allocation strategy preserve totals and negative-source meaning? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `Brick\Money\Money::allocate` | `public function allocate(array $ratios, AllocationMode $mode): array` | [src/Money.php:544–573](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Money.php#L544-L573) | [FN01](#fn01) |
| `Brick\Money\Money::normalizeRatios` | `private function normalizeRatios(array $ratios): array` | [src/Money.php:769–801](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Money.php#L769-L801) | [FN02](#fn02) |
| `Brick\Money\Allocation\AbstractFloorStrategy::computeFloors` | `final protected function computeFloors(BigInteger $amountInSteps, array $ratios): array` | [src/Allocation/AbstractFloorStrategy.php:25–37](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/AbstractFloorStrategy.php#L25-L37) | [FN03](#fn03) |
| `Brick\Money\Allocation\AbstractFloorAbsorbStrategy::allocate` | `final public function allocate(BigInteger $amountInSteps, array $ratios): array` | [src/Allocation/AbstractFloorAbsorbStrategy.php:16–27](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/AbstractFloorAbsorbStrategy.php#L16-L27) | [FN04](#fn04) |
| `Brick\Money\Allocation\FloorToFirstStrategy::prioritizeIndices` | `protected function prioritizeIndices(BigInteger $amountInSteps, array $ratios): array` | [src/Allocation/FloorToFirstStrategy.php:16–19](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/FloorToFirstStrategy.php#L16-L19) | [FN05](#fn05) |

## Function technical records

<a id="fn01"></a>

### Brick\Money\Money::allocate

**Definition and evidence.** [Source lines 544–573](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Money.php#L544-L573). Signature is recorded in the inventory.

**Inputs and financial context.** Ratios and an explicit AllocationMode; fixed-scale context supplies amount scale and step size. This context is not an explicit FinKore target-scale request.

1. Reject a non-fixed-scale context, then normalize ratios.
2. Take the absolute source amount; convert its unscaled integer to step counts by dividing by the context step.
3. Dispatch the selected strategy, rebuild decimal amounts from returned step counts, restore a negative sign when necessary and retain currency/context.

**Outputs and errors.** A list of new Money values; non-fixed contexts raise ContextException and normalization can reject invalid ratios.

**State and effects.** Builds results without assigning to the source amount. The result-producing closure, lines 560–570, is unnamed and included in this record; it only rebuilds a step-aligned result.

**Dependencies and limits.** Brick Math numeric operations and context constructors were not independently verified. Other AllocationMode strategies are not all reviewed.

<a id="fn02"></a>

### Brick\Money\Money::normalizeRatios

**Definition and evidence.** [Source lines 769–801](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Money.php#L769-L801). Signature is recorded in the inventory.

**Inputs and financial context.** Array entries accepted by BigRational::of; includes rational/string forms beyond the Core positive-integer input domain.

1. Reject empty input; reindex and convert entries to rational numbers.
2. Reject negative entries and an all-zero total.
3. Take a common denominator, turn each rational into an integer numerator at that denominator, then divide by their common divisor.

**Outputs and errors.** Normalized integer weights; library InvalidArgumentException on explicit guards; underlying numeric-parser failures remain upstream-specific.

**State and effects.** Creates normalized arrays; does not edit the caller source Money.

**Dependencies and limits.** Zero weights remain allowed. External rational parsing and LCM/GCD internals were not read.

<a id="fn03"></a>

### Brick\Money\Allocation\AbstractFloorStrategy::computeFloors

**Definition and evidence.** [Source lines 25–37](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/AbstractFloorStrategy.php#L25-L37). Signature is recorded in the inventory.

**Inputs and financial context.** A non-negative integer step count and normalized non-negative integer ratios with a positive total.

1. Sum the ratios.
2. Compute each base share using integer product and quotient.
3. Subtract the sum of base shares from source steps and return both shares and residual steps.

**Outputs and errors.** Pair of base-step list and remainder-step count; no local error guard.

**State and effects.** Local calculations only; quotient behavior depends on Brick Math, with non-negative inputs on this inspected path.

**Dependencies and limits.** No independent proof of dependency arithmetic or unrestricted integer resource bounds.

<a id="fn04"></a>

### Brick\Money\Allocation\AbstractFloorAbsorbStrategy::allocate

**Definition and evidence.** [Source lines 16–27](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/AbstractFloorAbsorbStrategy.php#L16-L27). Signature is recorded in the inventory.

**Inputs and financial context.** Integer source steps and normalized ratios; obtains recipient priority from its strategy method.

1. Compute base floors and remainder.
2. Request a prioritized list of recipient offsets.
3. Convert remainder count to a native integer and add one step to each of that many prioritized recipients; return an indexed list.

**Outputs and errors.** Step counts with the remainder absorbed; dependency conversion/arithmetic errors are not separately caught.

**State and effects.** Updates its local share list; does not mutate Money operands.

**Dependencies and limits.** The priority provider contract and native toInt conversion bound matter; no huge-input execution was performed.

<a id="fn05"></a>

### Brick\Money\Allocation\FloorToFirstStrategy::prioritizeIndices

**Definition and evidence.** [Source lines 16–19](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/src/Allocation/FloorToFirstStrategy.php#L16-L19). Signature is recorded in the inventory.

**Inputs and financial context.** Declared ratio list; source amount is accepted but not used by this priority policy.

1. Return array keys in declared order.

**Outputs and errors.** Recipient offsets for the absorb strategy; no explicit exception.

**State and effects.** No mutation; this method selects order, while its parent allocates units.

**Dependencies and limits.** This reading compares positive Core ratios; zero-weight behavior needs separate scrutiny rather than treating the wider upstream domain as identical.

<a id="ce-finding-0002"></a>

## CE-FINDING-0002 — Ordered allocation in explicit integer steps

**Observed financial rule.** In FloorToFirst allocation, the source magnitude is converted to context-sized integer steps, base shares are computed, residual steps are assigned by the strategy, and the source sign is restored on each newly constructed result.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03), [FN04](#fn04), [FN05](#fn05). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc allocation principle](../../../docs/coreDoc/core-doc.md#core-0014-allocation-conserves-the-source-value), [Money allocation requirements](../../../spec/money/allocation.md#requirements), manifest-listed [allocation vectors](../../../conformance/money/allocation.json), their [traceability](../../../conformance/traceability.md) and [finkore.money.allocate](../../../agentic/operations.md#finkoremoneyallocate) were consulted in source-of-truth order. Proposed source support for MONEY-ALLOCATION-007 through -011 and -013 under equivalent positive integer weights and explicitly matched step/scale. The source also accepts rational and zero weights, chooses scale from its context and supports other remainder policies; those differences prevent blanket equivalence to MONEY-ALLOCATION-001, -002, -004 or -014.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `Brick\Money\Tests\MoneyTest::testAllocate / providerAllocate` | [tests/MoneyTest.php:387–414](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/tests/MoneyTest.php#L387-L414) | The test invokes allocate with the supplied mode and calls assertMoniesAre. FloorToFirst data include USD 1 with [2,3,1] -> [0.34,0.50,0.16], cash-step contexts, and negative USD 100 with four weights. | Expected result data and the test call were read; assertMoniesAre internals, all strategies and all context invariants were not reviewed. |

## Counterexamples, limitations and open discussions

- The selected negative test provides a source expectation for distributing magnitude before restoring sign; it is not an observed passing test.
- A declared cash step is a business quantum. Do not replace Core decimal allocation units with a currency/cash default.
- Proposed adversarial follow-up: zero-weight recipients, moved context scale, native remainder conversion limits and source preservation on parser failure. No such execution is claimed.

**Independence and attribution.** The test provider calls this policy Fowler allocation. The Money PHP pilot also credits Fowler; matching examples are not independent corroboration.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
