# Joda-Money — Money addition checks currency before combining amounts

**Finding:** CE-FINDING-0004. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0004` / `CE-EDITION-0004`; `JodaOrg/joda-money`; `v2.0.3` |
| Source commit | [2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e](https://github.com/JodaOrg/joda-money/tree/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Does a monetary addition prevent amounts in different currencies being combined? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `org.joda.money.Money.plus` | `public Money plus(Money moneyToAdd)` | [src/main/java/org/joda/money/Money.java:742–744](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/Money.java#L742-L744) | [FN01](#fn01) |
| `org.joda.money.BigMoney.plus` | `public BigMoney plus(BigMoneyProvider moneyToAdd)` | [src/main/java/org/joda/money/BigMoney.java:856–859](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/BigMoney.java#L856-L859) | [FN02](#fn02) |
| `org.joda.money.BigMoney.checkCurrencyEqual` | `private BigMoney checkCurrencyEqual(BigMoneyProvider moneyProvider)` | [src/main/java/org/joda/money/BigMoney.java:808–814](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/BigMoney.java#L808-L814) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### org.joda.money.Money.plus

**Definition and evidence.** [Source lines 742–744](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/Money.java#L742-L744). Signature is recorded in the inventory.

**Inputs and financial context.** A Money operand; the receiver holds the other amount and currency.

1. Delegate to the wrapped BigMoney plus overload.
2. Wrap the resulting monetary value with with(...).

**Outputs and errors.** A Money result or a propagated currency/provider failure; adding zero may reuse an existing immutable result as the selected test expects.

**State and effects.** No assignments to receiver fields in this body; with(...) internals were not reviewed in this bounded path.

**Dependencies and limits.** Only the Money operand overload is covered; double, scalar and rounded overloads have different preconditions.

<a id="fn02"></a>

### org.joda.money.BigMoney.plus

**Definition and evidence.** [Source lines 856–859](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/BigMoney.java#L856-L859). Signature is recorded in the inventory.

**Inputs and financial context.** A provider of monetary value, supplied by the Money wrapper in this path.

1. Call checkCurrencyEqual before extracting the addend amount.
2. Delegate to numerical plus using that amount.

**Outputs and errors.** A BigMoney result; mismatched currencies fail before the numeric-add delegate.

**State and effects.** No receiver mutation in the inspected body.

**Dependencies and limits.** The numerical BigDecimal plus overload and provider conversion internals were not independently analyzed, so unrestricted exactness is not asserted.

<a id="fn03"></a>

### org.joda.money.BigMoney.checkCurrencyEqual

**Definition and evidence.** [Source lines 808–814](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/main/java/org/joda/money/BigMoney.java#L808-L814). Signature is recorded in the inventory.

**Inputs and financial context.** A BigMoneyProvider and the receiver currency.

1. Resolve the provider using of(...).
2. Call isSameCurrency; on false throw CurrencyMismatchException with receiver and operand currency units.
3. Return the checked monetary value.

**Outputs and errors.** A checked BigMoney, CurrencyMismatchException, or a provider/null-related failure.

**State and effects.** Only local reference assignment; does not convert one currency into another.

**Dependencies and limits.** CurrencyUnit equality and the provider factory were not exhaustively reviewed; the selected mismatch test checks both reported currencies.

<a id="ce-finding-0004"></a>

## CE-FINDING-0004 — Money addition checks currency before combining amounts

**Observed financial rule.** The Money addition overload delegates to BigMoney, which converts the provider to a monetary value and checks currency equality before requesting numerical addition. A mismatch raises a typed exception containing the two currencies.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc monetary integrity](../../../../docs/coreDoc/core-doc.md#monetary-integrity), [Money arithmetic](../../../../spec/money/arithmetic.md#requirements), [Money errors](../../../../spec/money/errors.md#requirements), manifest-listed [arithmetic cases](../../../../conformance/money/arithmetic.json), [traceability](../../../../conformance/traceability.md) and [Agentic operations](../../../../agentic/operations.md) were consulted in source-of-truth order. The observed guard supports CORE-001.3 and MONEY-ARITHMETIC-001; the unchanged-field path supplies bounded context for MONEY-ARITHMETIC-009. Native CurrencyMismatchException is related in purpose to MONEY-ERROR-003 but is not an automatic portable normalization. No conformance result is claimed.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `org.joda.money.TestMoney::test_plus_Money_positive / negative / zero` | [src/test/java/org/joda/money/TestMoney.java:1317–1333](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/test/java/org/joda/money/TestMoney.java#L1317-L1333) | Expects GBP 2.34 + 1.23 -> 3.57; GBP 2.34 + (-1.23) -> 1.11; zero addition can reuse the same instance. | Bounded values; no broad numeric boundary or mutation proof. |
| `org.joda.money.TestMoney::test_plus_Money_currencyMismatch / nullMoney` | [src/test/java/org/joda/money/TestMoney.java:1335–1353](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/src/test/java/org/joda/money/TestMoney.java#L1335-L1353) | Expects CurrencyMismatchException for GBP plus USD and checks both currency fields; expects NullPointerException for a null Money. | Native exception details are not portable error codes. |

## Counterexamples, limitations and open discussions

- Do not infer a universal currency-conversion facility from the BigMoneyProvider interface.
- Proposed follow-up: zero-valued mismatched currencies, custom provider failures and source preservation after rejection.
- Joda-Money separates Money and BigMoney scale concerns; this finding covers the currency guard and selected small addition tests only.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
