# GoMoney — Signed splitting preserves residual units, except the zero-weight fallback

**Finding:** CE-FINDING-0006. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0006` / `CE-EDITION-0006`; `Rhymond/go-money`; `v1.0.15` |
| Source commit | [b43ce49343a684c955ffb1a4e4165b81db8989b7](https://github.com/Rhymond/go-money/tree/b43ce49343a684c955ffb1a4e4165b81db8989b7) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How are signed residual units assigned, and what happens when every ratio is zero? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `money.(*Money).Split` | `func (m *Money) Split(n int) ([]*Money, error)` | [money.go:262–288](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money.go#L262-L288) | [FN01](#fn01) |
| `money.(*Money).Allocate` | `func (m *Money) Allocate(rs ...int) ([]*Money, error)` | [money.go:293–341](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money.go#L293-L341) | [FN02](#fn02) |
| `money.(*calculator).allocate` | `func (c *calculator) allocate(a Amount, r, s int64) Amount` | [calculator.go:27–33](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/calculator.go#L27-L33) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### money.(*Money).Split

**Definition and evidence.** [Source lines 262–288](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money.go#L262-L288). Signature is recorded in the inventory.

**Inputs and financial context.** Receiver amount in integer minor units and target count n; receiver currency is reused for every result.

1. Reject n <= 0.
2. Divide the source by n and build n result objects with that quotient.
3. Compute the modulus and its absolute magnitude; add +1 or -1 to successive first recipients depending on the source sign.

**Outputs and errors.** Slice of new Money pointers and nil, or a nil slice plus an upstream error for invalid count.

**State and effects.** Mutates the newly created results, not the receiver amount.

**Dependencies and limits.** Backend uses fixed-width integer arithmetic. Minimum integer absolute value, resource limits and all overflow paths were not executed.

<a id="fn02"></a>

### money.(*Money).Allocate

**Definition and evidence.** [Source lines 293–341](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money.go#L293-L341). Signature is recorded in the inventory.

**Inputs and financial context.** Integer receiver amount and native integer weights. Zero weights are accepted; negative weights are rejected.

1. Reject an empty list and any negative weight; guard overflow while summing weights.
2. Compute each weighted share through calculator.allocate and collect total allocated units.
3. If the summed weights are zero, return the zero shares immediately.
4. Otherwise distribute signed remaining units to successive first result positions.

**Outputs and errors.** Allocated values or errors for the explicit guards. Nonzero source with all-zero weights can return shares summing to zero by design in this code path.

**State and effects.** Local result object fields are updated; receiver fields are not assigned.

**Dependencies and limits.** The ratio-sum overflow guard does not establish safety of amount-times-ratio or every result-sum calculation.

<a id="fn03"></a>

### money.(*calculator).allocate

**Definition and evidence.** [Source lines 27–33](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/calculator.go#L27-L33). Signature is recorded in the inventory.

**Inputs and financial context.** Amount, ratio and total ratio as fixed-width integers.

1. Return zero if amount or total ratio is zero.
2. Otherwise return the native integer product a*r divided by s.

**Outputs and errors.** An integer base share; no explicit product-overflow guard or error result.

**State and effects.** No explicit state mutation.

**Dependencies and limits.** A correct-looking result at small values does not prove large integer safety. Calculator divide/modulus/absolute helpers at lines 19–41 were read for the Split path.

<a id="ce-finding-0006"></a>

## CE-FINDING-0006 — Signed splitting preserves residual units, except the zero-weight fallback

**Observed financial rule.** Equal splitting assigns leftover signed units to the first recipients. Ratio allocation also has ordered residual assignment, but returns zero shares without distributing the source when the ratio sum is zero. The selected test explicitly expects this for a nonzero amount.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc allocation principle](../../../docs/coreDoc/core-doc.md#core-0014-allocation-conserves-the-source-value), [Money allocation requirements](../../../spec/money/allocation.md#requirements), manifest-listed [allocation vectors](../../../conformance/money/allocation.json), their [traceability](../../../conformance/traceability.md) and [finkore.money.allocate](../../../agentic/operations.md#finkoremoneyallocate) were consulted in source-of-truth order. Signed equal-split examples offer bounded support for MONEY-ALLOCATION-005 and -009 through -011 after matching units explicitly. All-zero ratio success conflicts with the required invalid-ratio outcome under MONEY-ALLOCATION-004/MONEY-ERROR-008; a nonzero-source zero result also cannot satisfy MONEY-ALLOCATION-008. This is an upstream policy comparison, not a claim that GoMoney advertises Core conformance.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestMoney_Split / TestMoney_Split2` | [money_test.go:553–589](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money_test.go#L553-L589) | Asserts 100/3 -> [34,33,33], -101/4 -> [-26,-25,-25,-25], -2/3 -> [-1,-1,0]; negative target count returns an error. | Tests compare amount arrays; not an independent proof of every source/currency invariant. |
| `TestMoney_Allocate / TestMoney_Allocate2` | [money_test.go:591–630](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/money_test.go#L591-L630) | Includes 10 with [0,0] -> [0,0], 5 with [50,25,25] -> [3,1,1], a zero source, and no-ratio error. | The 10/[0,0] expectation demonstrates intentional total-loss fallback relative to a conservation contract; do not describe it as conservation support. |

## Counterexamples, limitations and open discussions

- The all-zero test is a counterexample to any blanket statement that this Allocate method always conserves the source.
- Source currency is carried into result objects, but the selected tests focus on amounts. A stronger invariant test would separately assert currency and unchanged receiver.
- Proposed follow-up: amount-times-ratio overflow, minimum negative amount and zero-ratio recipients that precede a residual assignment.

**Independence and attribution.** The catalog and README identify Fowler Money-pattern ancestry, shared with the Money PHP context. This reading supplies a distinct zero-total observation, not an independence claim.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
