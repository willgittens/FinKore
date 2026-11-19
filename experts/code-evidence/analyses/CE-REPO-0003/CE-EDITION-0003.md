# RubyMoney — Allocation carries residual value through successive splits

**Finding:** CE-FINDING-0003. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0003` / `CE-EDITION-0003`; `RubyMoney/money`; `v7.1.1` |
| Source commit | [26e2829c34f165847040a5a40d4d2daa5eb72927](https://github.com/RubyMoney/money/tree/26e2829c34f165847040a5a40d4d2daa5eb72927) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How are indivisible residuals retained while calculating proportional parts? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `Money::Allocation.generate` | `def self.generate(amount, parts, decimal_cutoff = true)` | [lib/money/money/allocation.rb:24–70](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/lib/money/money/allocation.rb#L24-L70) | [FN01](#fn01) |
| `Money::Allocation.convert_to_big_decimal` | `def self.convert_to_big_decimal(number)` | [lib/money/money/allocation.rb:78–86](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/lib/money/money/allocation.rb#L78-L86) | [FN02](#fn02) |

## Function technical records

<a id="fn01"></a>

### Money::Allocation.generate

**Definition and evidence.** [Source lines 24–70](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/lib/money/money/allocation.rb#L24-L70). Signature is recorded in the inventory.

**Inputs and financial context.** Numeric amount; Numeric part count or an array of weights. decimal_cutoff selects whole-unit truncation, an integer precision, or no explicit rounding.

1. Turn a numeric count into equal weights; replace an all-zero weight list with equal weights, otherwise duplicate it. Reject an empty list.
2. Convert amount and parts to BigDecimal when a BigDecimal, Float or Rational is present.
3. Pop the last weight, divide the current remaining amount by current remaining weights, truncate/round as requested, and prepend the share.
4. Subtract the share and consumed weight; repeat until no weights remain.

**Outputs and errors.** An ordered numeric array; empty input raises ArgumentError and numeric operations can produce runtime-specific errors.

**State and effects.** Works on duplicated/created parts and local residuals. This helper handles numeric amounts, not Money currency construction.

**Dependencies and limits.** Numeric types affect division: Ruby integer division and BigDecimal division are distinct. No general negative-input or unlimited-precision equivalence was established.

<a id="fn02"></a>

### Money::Allocation.convert_to_big_decimal

**Definition and evidence.** [Source lines 78–86](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/lib/money/money/allocation.rb#L78-L86). Signature is recorded in the inventory.

**Inputs and financial context.** A numeric weight or amount passed by generate.

1. Return an existing BigDecimal.
2. For Rational, convert through a float and its string; for other types, construct BigDecimal from the string form.

**Outputs and errors.** A BigDecimal or an upstream conversion error.

**State and effects.** No explicit mutation of the input value.

**Dependencies and limits.** The Rational-to-float path can narrow exact rational meaning. Conversion and BigDecimal internals were not executed or exhaustively checked.

<a id="ce-finding-0003"></a>

## CE-FINDING-0003 — Allocation carries residual value through successive splits

**Observed financial rule.** Money::Allocation.generate consumes parts in reverse order, recalculating each share against the remaining amount and remaining weight, then prepends results to preserve declared output order. It is a successive-allocation policy rather than one global floor-and-remainder pass.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc allocation principle](../../../../docs/coreDoc/core-doc.md#core-0014-allocation-conserves-the-source-value), [Money allocation requirements](../../../../spec/money/allocation.md#requirements), manifest-listed [allocation vectors](../../../../conformance/money/allocation.json), their [traceability](../../../../conformance/traceability.md) and [finkore.money.allocate](../../../../agentic/operations.md#finkoremoneyallocate) were consulted in source-of-truth order. This provides implementation context for MONEY-ALLOCATION-008 and deterministic declared output order, but the sequential division, zero-weight fallback and configurable decimal cutoff are not the algorithm/input contract of MONEY-ALLOCATION-004, -009, -010 or -014. No Money-currency preservation claim is derived from a numeric-only helper.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `RSpec Money::Allocation / does not lose pennies` | [spec/money/allocation_spec.rb:10–26](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/spec/money/allocation_spec.rb#L10-L26) | Asserts 100 split three ways -> [34,33,33] and six ways -> [17,17,17,17,16,16]. | Whole-amount examples do not prove all proportional or signed cases. |
| `RSpec Money::Allocation / array weights and zero arguments` | [spec/money/allocation_spec.rb:64–96](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/spec/money/allocation_spec.rb#L64-L96) | Asserts an empty array raises, 10/[1,1,2] -> [3,2,5], and zero weights can produce zero recipients. | No explicit FinKore scale or currency assertion in this numeric helper suite. |
| `RSpec Money::Allocation / repeating decimals` | [spec/money/allocation_spec.rb:121–135](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/spec/money/allocation_spec.rb#L121-L135) | Rounds displayed shares to ten digits for comparison but separately asserts that parts.sum equals the original BigDecimal amount. | The display comparison and exact sum assertion are different checks; Ruby/JRuby internal precision context is not reproduced. |

## Counterexamples, limitations and open discussions

- All-zero weights are changed into equal weights by code; that must not be imported into Core, which rejects non-positive ratios.
- Rational conversion through float is a visible precision question, not a reproduced financial loss.
- Proposed follow-up: compare mixed rational weights and negative integer versus BigDecimal amounts under the same explicit unit policy.

**Independence and attribution.** RubyMoney is another Money-pattern library, but this reading did not establish its code ancestry. Do not count its conservation tests as independent of all other Money implementations.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
