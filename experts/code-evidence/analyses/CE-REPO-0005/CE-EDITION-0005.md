# Dinero.js — Allocation prioritizes larger weights for residual units

**Finding:** CE-FINDING-0005. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0005` / `CE-EDITION-0005`; `dinerojs/dinero.js`; `v2.0.2` |
| Source commit | [cc7df3e6d986445eab42dffc33f8c2d14e4d588a](https://github.com/dinerojs/dinero.js/tree/cc7df3e6d986445eab42dffc33f8c2d14e4d588a) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Which recipients receive residual units, and how does the numeric backend limit conservation? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `safeAllocate<TAmount> / returned allocate` | `export function safeAllocate<TAmount>(calculator: DineroCalculator<TAmount>)` | [packages/dinero.js/src/core/api/allocate.ts:54–95](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/core/api/allocate.ts#L54-L95) | [FN01](#fn01) |
| `distribute<TAmount> / returned unnamed closure` | `export function distribute<TAmount>(calculator: DistributeCalculator<TAmount>)` | [packages/dinero.js/src/core/utils/distribute.ts:17–78](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/core/utils/distribute.ts#L17-L78) | [FN02](#fn02) |
| `number calculator integerDivide` | `integerDivide: DineroBinaryOperation<number>`; parameters `(dividend, divisor)` | [packages/dinero.js/src/calculator/number/api/integerDivide.ts:11–16](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/calculator/number/api/integerDivide.ts#L11-L16) | [FN03](#fn03) |

The public api/allocate.ts wrapper, lines 14–21, was also read and delegates to safeAllocate. transformScale.ts, lines 14–39, was read to confirm amount/currency/scale reconstruction; the implementation of down and all comparison helpers remains outside this record.

## Function technical records

<a id="fn01"></a>

### safeAllocate<TAmount> / returned allocate

**Definition and evidence.** [Source lines 54–95](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/core/api/allocate.ts#L54-L95). Signature is recorded in the inventory.

**Inputs and financial context.** Injected numeric calculator; a Dinero value and raw or scaled weights accepted by the returned allocate function.

1. Normalize weight scales to their highest scale.
2. Require nonempty ratios, every normalized weight >= zero and at least one > zero.
3. Increase the money scale by the highest weight scale, transform the amount, then invoke the internal allocation builder.

**Outputs and errors.** New Dinero shares or an assertion failure using INVALID_RATIOS_MESSAGE; imported assert implementation was not inspected.

**State and effects.** Constructs normalized inputs/results rather than assigning to the original Dinero snapshot.

**Dependencies and limits.** This is an injected-calculator design. A default or custom backend is not automatically exact; zero ratios are accepted, unlike Core.

<a id="fn02"></a>

### distribute<TAmount> / returned unnamed closure

**Definition and evidence.** [Source lines 17–78](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/core/utils/distribute.ts#L17-L78). Signature is recorded in the inventory.

**Inputs and financial context.** Amount and weights supplied to the returned closure; backend defines integer division, arithmetic and comparisons.

1. Sum ratios; return ratios directly if total is zero. The safe public path normally rejects that case.
2. Compute truncated weighted base shares and subtract each from the remainder.
3. Select residual sign from source sign; build indices ordered by descending nonzero weight.
4. Cycle through those indices adding one signed unit until remainder is exhausted; break when subtraction makes no numerical progress.

**Outputs and errors.** Numeric shares. The no-progress branch returns the accumulated shares without an independent error, so successful return alone does not prove exact conservation beyond backend bounds.

**State and effects.** Updates a local share array and remainder; does not mutate the original monetary object.

**Dependencies and limits.** The equal-weight comparator returns 1 rather than 0 for equality; selected tests show intended tie outcomes, but universal stable ordering is not proved. No large-number defect was executed.

<a id="fn03"></a>

### number calculator integerDivide

**Definition and evidence.** [Source lines 11–16](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/calculator/number/api/integerDivide.ts#L11-L16). Signature is recorded in the inventory.

**Inputs and financial context.** Number dividend and divisor.

1. Divide using number arithmetic.
2. Apply Math.trunc to remove the fractional part toward zero.

**Outputs and errors.** A number result; no local zero/finite/precision guard.

**State and effects.** Pure expression over input values.

**Dependencies and limits.** Number precision is a bound on this backend; bigint and big.js implementations were not reviewed here.

<a id="ce-finding-0005"></a>

## CE-FINDING-0005 — Allocation prioritizes larger weights for residual units

**Observed financial rule.** The safe allocation path validates normalized non-negative weights with at least one positive value, while the distribution utility prioritizes larger weights for residual units. Numeric backend safety remains material: the number path contains a no-progress guard for values beyond safe floating precision.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc allocation principle](../../../../docs/coreDoc/core-doc.md#core-0014-allocation-conserves-the-source-value), [Money allocation requirements](../../../../spec/money/allocation.md#requirements), manifest-listed [allocation vectors](../../../../conformance/money/allocation.json), their [traceability](../../../../conformance/traceability.md) and [finkore.money.allocate](../../../../agentic/operations.md#finkoremoneyallocate) were consulted in source-of-truth order. The 801/[1,3] source expectation differs from Core earliest-position residual placement under MONEY-ALLOCATION-010: at matched integer units Core gives [201,600]. This Core result is analyst-derived, not executed. Scale derivation and accepted zero ratios also differ from MONEY-ALLOCATION-002 and -004. Number-backend behavior must not be generalized as satisfying exact MONEY-ALLOCATION-008/-009.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `distribute / largest ratio first and safe-integer overflow guard` | [packages/dinero.js/src/core/utils/__tests__/distribute.test.ts:1–47](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/core/utils/__tests__/distribute.test.ts#L1-L47) | Expects 5/[100,101,100,100] -> [1,2,1,1] and 801/[1,3] -> [200,601]. The large-number test checks return length and number-sum equality without exact recipient values. | A number equality at unsafe magnitude does not prove exact decimal conservation. This utility suite includes inputs that the safe API rejects. |
| `allocate number / percentage, zero ratio and scale tests` | [packages/dinero.js/src/api/__tests__/allocate.test.ts:13–88](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/packages/dinero.js/src/api/__tests__/allocate.test.ts#L13-L88) | Asserts amount, currency and scale for 1003/[50,50]; allows a zero-weight result; increases scale when weights carry a finer scale. | Selected number cases only; not all calculators or full public input validation. |

## Counterexamples, limitations and open discussions

- Do not confuse this larger-weight policy with Money PHP largest-fraction policy; identical easy examples do not identify the algorithm.
- The utility can accept all-zero/negative weights in its own tests, but the inspected public wrapper rejects inappropriate normalized ratios. Keep both boundaries distinct.
- Proposed follow-up: equal-weight order, number limits, bigint recipient equality, and whether no-progress return should be a diagnostic in a consumer.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
