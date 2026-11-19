# NodaMoney — Context-selected rounding can change a value at construction

**Finding:** CE-FINDING-0007. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0007` / `CE-EDITION-0007`; `RemyDuijkeren/NodaMoney`; `2.10.0` |
| Source commit | [1844718cc007b0699ab8aefbbdbcd3f532103708](https://github.com/RemyDuijkeren/NodaMoney/tree/1844718cc007b0699ab8aefbbdbcd3f532103708) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Where does the default monetary context select precision and midpoint behavior? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `NodaMoney.Money.Money` | `public Money(decimal amount, Currency currency, MoneyContext? context = null)` | [src/NodaMoney/Money.cs:38–75](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Money.cs#L38-L75) | [FN01](#fn01) |
| `NodaMoney.Context.StandardRounding.Round (Currency overload)` | `public decimal Round(decimal amount, Currency currency, int? decimals)` | [src/NodaMoney/Context/StandardRounding.cs:13–31](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/StandardRounding.cs#L13-L31) | [FN02](#fn02) |
| `NodaMoney.Context.StandardRounding.Round (CurrencyInfo overload)` | `public decimal Round(decimal amount, CurrencyInfo currencyInfo, int? decimals)` | [src/NodaMoney/Context/StandardRounding.cs:36–70](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/StandardRounding.cs#L36-L70) | [FN03](#fn03) |
| `NodaMoney.Context.MoneyContext.Round` | `internal decimal Round(decimal amount, Currency currency)` | [src/NodaMoney/Context/MoneyContext.cs:121–129](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/MoneyContext.cs#L121-L129) | [FN04](#fn04) |

Additional context source read: MoneyContext.cs lines 98–119 (default-mode initialization). CashDenominationRounding.cs lines 1–14 were checked only to reject an unimplemented candidate; no cash-rounding finding is claimed.

## Function technical records

<a id="fn01"></a>

### NodaMoney.Money.Money

**Definition and evidence.** [Source lines 38–75](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Money.cs#L38-L75). Signature is recorded in the inventory.

**Inputs and financial context.** Decimal amount, currency and optional explicit context; a missing context is resolved through MoneyContext.CurrentContext.

1. Resolve context; handle zero by storing zero bits with currency/context.
2. For a standard two-decimal currency context, round directly using decimal.Round and the context mode; otherwise delegate to context.Round.
3. Store rounded decimal bits together with currency and context index.

**Outputs and errors.** A constructed Money value; strategy/decimal errors are not caught in this body.

**State and effects.** Initializes the new value. Reading an ambient context can change the policy chosen for otherwise equal constructor inputs.

**Dependencies and limits.** Only this constructor was traced. Full context registration, thread isolation and all decimal overflow behavior were not reviewed.

<a id="fn02"></a>

### NodaMoney.Context.StandardRounding.Round (Currency overload)

**Definition and evidence.** [Source lines 13–31](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/StandardRounding.cs#L13-L31). Signature is recorded in the inventory.

**Inputs and financial context.** Decimal value, currency, nullable scale; record constructor defaults Mode to MidpointRounding.ToEven.

1. For a two-decimal currency and null or two decimals, call decimal.Round at scale two.
2. Otherwise resolve CurrencyInfo and delegate to the second Round overload.

**Outputs and errors.** Rounded decimal; dependency errors propagate.

**State and effects.** No explicit mutation of the monetary operand.

**Dependencies and limits.** CurrencyInfo registry and .NET decimal implementation were not independently validated.

<a id="fn03"></a>

### NodaMoney.Context.StandardRounding.Round (CurrencyInfo overload)

**Definition and evidence.** [Source lines 36–70](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/StandardRounding.cs#L36-L70). Signature is recorded in the inventory.

**Inputs and financial context.** Amount, currency metadata and optional decimal override.

1. Reject null CurrencyInfo; return amount unchanged when minor units are not applicable.
2. Reject an explicit decimals value below zero or above 28.
3. For a non-decimal minor-unit system, scale up, round and scale down; otherwise round using explicit decimals or currency DecimalDigits.

**Outputs and errors.** Rounded or unchanged decimal; ArgumentNullException/ArgumentOutOfRangeException on explicit guards.

**State and effects.** Computes a return value without updating source fields.

**Dependencies and limits.** Non-decimal subdivision semantics are upstream policy, not defined private-currency behavior for Core.

<a id="fn04"></a>

### NodaMoney.Context.MoneyContext.Round

**Definition and evidence.** [Source lines 121–129](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/src/NodaMoney/Context/MoneyContext.cs#L121-L129). Signature is recorded in the inventory.

**Inputs and financial context.** Amount and currency, plus the context Kind, RoundingStrategy and MaxScale.

1. Return the amount for None.
2. Invoke StandardRounding with MaxScale for Standard.
3. Invoke the custom strategy for other kinds.

**Outputs and errors.** Strategy-produced decimal; no local validation that the custom return preserves or approximates the input.

**State and effects.** No direct source Money mutation; custom strategy effects were not generally inspected.

**Dependencies and limits.** Context initialization at lines 98–119 sets default ToEven. Strategy correctness is a separate obligation from dispatch correctness.

<a id="ce-finding-0007"></a>

## CE-FINDING-0007 — Context-selected rounding can change a value at construction

**Observed financial rule.** Money construction applies the selected or ambient context before storing the amount. Standard rounding defaults to ToEven and, absent a decimal override, normally derives scale from currency metadata. A custom strategy can replace the amount completely, so its policy must be treated as meaningful financial input.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03), [FN04](#fn04). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc exact calculation](../../../../docs/coreDoc/core-doc.md#core-0012-exact-calculation-and-explicit-rounding), [rounding requirements](../../../../spec/money/rounding.md#requirements), [arithmetic requirements](../../../../spec/money/arithmetic.md#requirements), manifest-listed [rounding vectors](../../../../conformance/money/rounding.json), [traceability](../../../../conformance/traceability.md) and [Agentic operations](../../../../agentic/operations.md) were consulted in source-of-truth order. The source illustrates why scale derivation and rounding mode are financially material under MONEY-ROUNDING-001, -004 and -007. A documented composing domain may declare a policy under MONEY-ROUNDING-005; ambient/currency defaults are not automatically an applicable Core policy. The default constructor differs from preserving an exact supplied decimal without implicit reduction at a generic boundary. No full constructor-conformance judgment is made.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `CreateMoneyWithDifferentRounding.RoundUp_When_OnlyAmount / RoundUp_When_AmountAndCode` | [tests/NodaMoney.Tests/MoneySpec/CreateMoneyWithDifferentRounding.cs:3–29](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/tests/NodaMoney.Tests/MoneySpec/CreateMoneyWithDifferentRounding.cs#L3-L29) | For EUR 0.525, expects default construction 0.52 and the explicit AwayFromZero constructor 0.53. | The explicit constructor tested is marked obsolete in source; no new recommended API is inferred. |
| `ApplyCustomRounding.Construction_WhenCustomRoundingStrategy_ShouldCallStrategyAndStoreResult` | [tests/NodaMoney.Tests/MoneyRoundingSpec/ApplyCustomRounding.cs:9–22](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/tests/NodaMoney.Tests/MoneyRoundingSpec/ApplyCustomRounding.cs#L9-L22) | Creates a recording strategy returning 42.42, constructs Money from 1.2345, and expects one call and stored amount 42.42. | This is a dispatch assertion, not proof of a financially valid custom policy. |

## Counterexamples, limitations and open discussions

- A declared strategy name alone cannot certify financial correctness: the selected custom-strategy test deliberately changes 1.2345 into 42.42.
- CashDenominationRounding.cs was inspected and its constructor/Round throw NotImplementedException in this edition. It was excluded as implemented financial behavior.
- Proposed follow-up: negative midpoint cases, out-of-range explicit overrides and equivalence between standard constructor fast path and the strategy path.

**Independence and attribution.** The catalog records NodaMoney as inspired by Joda-Money. This is source-specific context-rounding evidence, not independent confirmation of every Joda semantic choice.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
