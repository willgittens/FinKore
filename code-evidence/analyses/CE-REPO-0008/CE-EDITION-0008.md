# py-moneyed — Addition is currency-checked, but numeric context remains observable

**Finding:** CE-FINDING-0008. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0008` / `CE-EDITION-0008`; `py-moneyed/py-moneyed`; `v3.0` |
| Source commit | [f45c0078b5ca2af098d5d75f2c54295e7196388e](https://github.com/py-moneyed/py-moneyed/tree/f45c0078b5ca2af098d5d75f2c54295e7196388e) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How do Money addition and subtraction preserve currency while supporting Python aggregation? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `moneyed.classes.Money.__add__` | `def __add__(self: M, other: object) -> M` | [src/moneyed/classes.py:220–235](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L220-L235) | [FN01](#fn01) |
| `moneyed.classes.Money.__sub__` | `def __sub__(self: M, other: SupportsNeg) -> M` | [src/moneyed/classes.py:237–241](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L237-L241) | [FN02](#fn02) |
| `moneyed.classes.Money.__eq__` | `def __eq__(self, other: object) -> bool` | [src/moneyed/classes.py:319–329](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L319-L329) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### moneyed.classes.Money.__add__

**Definition and evidence.** [Source lines 220–235](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L220-L235). Signature is recorded in the inventory.

**Inputs and financial context.** Receiver Money plus an arbitrary Python operand; stored amount is Decimal.

1. Return the receiver when other compares equal to numeric zero, supporting aggregation.
2. Return NotImplemented for unsupported non-Money operands.
3. For equal currency, add Decimal amounts and construct the same Money subclass; otherwise raise TypeError.

**Outputs and errors.** Money result, NotImplemented for Python dispatch, or TypeError for currency mismatch.

**State and effects.** No assignment to receiver amount/currency in the method. Decimal context and subclass constructor behavior remain dependencies.

**Dependencies and limits.** A Decimal representation does not eliminate the active decimal context; large/small mixed-magnitude precision was not tested here.

<a id="fn02"></a>

### moneyed.classes.Money.__sub__

**Definition and evidence.** [Source lines 237–241](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L237-L241). Signature is recorded in the inventory.

**Inputs and financial context.** Money receiver and negatable operand; reverse subtraction is defined alongside it.

1. Negate the operand and route subtraction through __add__.
2. For reverse subtraction, negate the receiver and route through __add__.

**Outputs and errors.** A delegated result or upstream negation/addition/dispatch error.

**State and effects.** This body does not update receiver fields; negation constructs another value in lines 214–218.

**Dependencies and limits.** Host operator dispatch for custom types is not a portable financial API.

<a id="fn03"></a>

### moneyed.classes.Money.__eq__

**Definition and evidence.** [Source lines 319–329](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/src/moneyed/classes.py#L319-L329). Signature is recorded in the inventory.

**Inputs and financial context.** An arbitrary comparison operand; __radd__ is also aliased to __add__ in this range.

1. Require a Money operand.
2. Compare both numeric amount and currency for equality.

**Outputs and errors.** A boolean; no explicit mismatch exception in equality.

**State and effects.** No explicit mutation.

**Dependencies and limits.** This equality boundary differs from a Core comparison operation that rejects incompatible currencies; addition has its separate rejecting guard.

<a id="ce-finding-0008"></a>

## CE-FINDING-0008 — Addition is currency-checked, but numeric context remains observable

**Observed financial rule.** Money addition checks matching currencies before decimal addition and creates a result with the receiver currency. The numeric-zero shortcut supports Python sum; subtraction reuses addition after negation. These are specific native-language boundaries and do not by themselves establish unlimited exact decimal arithmetic.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc monetary integrity](../../../docs/coreDoc/core-doc.md#monetary-integrity), [Money arithmetic](../../../spec/money/arithmetic.md#requirements), [Money errors](../../../spec/money/errors.md#requirements), manifest-listed [arithmetic cases](../../../conformance/money/arithmetic.json), [traceability](../../../conformance/traceability.md) and [Agentic operations](../../../agentic/operations.md) were consulted in source-of-truth order. The currency guard offers source support for CORE-001.3/MONEY-ARITHMETIC-001 and currency-carrying result construction under -002. Native TypeError is not a portable normalization. Numeric-zero convenience, non-throwing equality and host Decimal context need separate boundary analysis; there is no blanket claim for MONEY-ARITHMETIC-007 or all comparison semantics.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestMoney.test_add / test_add_non_money / test_sub / test_rsub_non_money` | [tests/test_moneyed_classes.py:151–175](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/tests/test_moneyed_classes.py#L151-L175) | Checks same-currency addition/subtraction, rejects an ordinary non-Money addend, and allows 0 - Money while rejecting 1 - Money. | The selected range does not include an explicit mismatched-addition test; do not invent one. |
| `TestMoney.test_sum` | [tests/test_moneyed_classes.py:296–299](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/tests/test_moneyed_classes.py#L296-L299) | Asserts Python sum of USD 1 and USD 2 equals USD 3. | Aggregation convenience is distinct from canonical Money input validation. |
| `TestMoney.test_round_context_override` | [tests/test_moneyed_classes.py:314–327](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/tests/test_moneyed_classes.py#L314-L327) | Asserts 2.5 rounds to 2 by default and to 3 under a local HALF_UP context. | Demonstrates context relevance for round, not a reproduced defect in addition. |

## Counterexamples, limitations and open discussions

- The constructor at classes.py lines 181–197 stores an existing Decimal or converts through Decimal(str(amount)); it does not establish a private unlimited arithmetic context.
- Proposed follow-up: explicit currency-mismatch addition rejection, changed decimal context, custom subclasses, and source preservation on failure.
- Do not treat the round-context test as execution evidence or as proof that a particular precision-loss example occurred.

**Independence and attribution.** The catalog README notes derivation of some code from python-money. That history was not independently traced for these functions.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
