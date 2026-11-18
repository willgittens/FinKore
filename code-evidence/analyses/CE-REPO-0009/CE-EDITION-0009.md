# Beancount — Balance assertions use a separate decimal tolerance policy

**Finding:** CE-FINDING-0009. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0009` / `CE-EDITION-0009`; `beancount/beancount`; `3.2.3` |
| Source commit | [eeda2aa2a3204ffb980dab11220b2abde5e80b38](https://github.com/beancount/beancount/tree/eeda2aa2a3204ffb980dab11220b2abde5e80b38) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How does a ledger balance assertion distinguish an accepted discrepancy from an error? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `beancount.ops.balance.get_balance_tolerance` | `def get_balance_tolerance(balance_entry, options_map)` | [beancount/ops/balance.py:20–45](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance.py#L20-L45) | [FN01](#fn01) |
| `beancount.ops.balance.check` | `def check(entries, options_map)` | [beancount/ops/balance.py:48–185](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance.py#L48-L185) | [FN02](#fn02) |

## Function technical records

<a id="fn01"></a>

### beancount.ops.balance.get_balance_tolerance

**Definition and evidence.** [Source lines 20–45](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance.py#L20-L45). Signature is recorded in the inventory.

**Inputs and financial context.** Balance directive with Decimal amount and optional explicit tolerance, plus parsed options.

1. Use balance_entry.tolerance when present.
2. Otherwise read the amount exponent; for a negative exponent multiply one unit at that exponent by twice tolerance_multiplier.
3. For a non-negative exponent use zero tolerance.

**Outputs and errors.** A decimal tolerance; missing/malformed options and directive validity depend on parser/loader code not reviewed here.

**State and effects.** No mutation of the balance directive in this helper.

**Dependencies and limits.** The textual decimal precision influences this assertion policy. It is not a Money numerical-equality definition.

<a id="fn02"></a>

### beancount.ops.balance.check

**Definition and evidence.** [Source lines 48–185](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance.py#L48-L185). Signature is recorded in the inventory.

**Inputs and financial context.** Ordered accounting directives and options, including transactions and Balance entries.

1. Track running inventories for asserted accounts and relevant descendants.
2. For transactions add postings to the temporary inventories; for a Balance directive check account/currency context.
3. Compute the account subtree balance in the desired currency and subtract the expected amount.
4. Obtain the tolerance; when absolute difference exceeds it, append BalanceError and replace the output directive with a copy carrying diff_amount.

**Outputs and errors.** New entry list and balance errors. Other parser/inventory/assertion failures are outside this bounded analysis.

**State and effects.** Builds temporary balances and a new output list; failing balance entries copy metadata before adding a difference. No persistence or full-history immutability claim follows.

**Dependencies and limits.** Inventory, realization, date ordering and parser semantics were not exhaustively inspected. The method can accumulate errors and continue; this is not a Core failed-operation API.

<a id="ce-finding-0009"></a>

## CE-FINDING-0009 — Balance assertions use a separate decimal tolerance policy

**Observed financial rule.** An explicit balance tolerance takes precedence. Otherwise the source derives tolerance from the asserted Decimal exponent and a configured multiplier. It compares the accumulated currency-specific balance to the expected amount and reports errors only when absolute difference exceeds that tolerance.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. This is ledger assertion/tolerance policy. It does not authorize approximate comparison for Core Money or changing MONEY-REPRESENTATION-005, whose insignificant trailing zeros must not alter numeric equality. Tolerance in a ledger assertion and equality of a Money value answer different financial questions.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestBalancePrecision.test_get_balance_tolerance__explicit / regular` | [beancount/ops/balance_test.py:322–369](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance_test.py#L322-L369) | Explicit 0.002 is retained across different displayed precisions; regular examples expect 0, 0.1, 0.01 or 0.001 according to amount exponent. | Parser defaults feeding tolerance_multiplier were not independently reconstructed. |
| `TestBalancePrecision.test_balance_with_tolerance` | [beancount/ops/balance_test.py:371–391](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/beancount/ops/balance_test.py#L371-L391) | For an accumulated 23.024 USD and explicit 0.001, the two assertions outside the inclusive band produce the two expected errors. | Whole loader execution was not run; this is the source test scenario and assertions. |

## Counterexamples, limitations and open discussions

- A future balance/reconciliation specification would need to declare tolerance source, units, inclusive boundary and account-subtree/date scope.
- Proposed follow-up: negative balances, explicit zero tolerance, unknown accounts and currency restrictions, while retaining source examples and parser context.
- No source discrepancy or tolerance is reinterpreted as a permission to round away a monetary amount.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
