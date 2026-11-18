# Formance Ledger — Reversal swaps posting direction and reverses posting order

**Finding:** CE-FINDING-0013. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0013` / `CE-EDITION-0013`; `formancehq/ledger`; `v2.4.18` |
| Source commit | [83cd8dc7a66ba02a0418a36ec45663b19e26dcb3](https://github.com/formancehq/ledger/tree/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | What does a reversal helper preserve, and which accounting guarantees does it not establish? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `ledger.Transaction.Reverse` | `func (tx Transaction) Reverse() Transaction` | [internal/transaction.go:64–67](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/transaction.go#L64-L67) | [FN01](#fn01) |
| `ledger.Postings.Reverse` | `func (p Postings) Reverse() Postings` | [internal/posting.go:37–50](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/posting.go#L37-L50) | [FN02](#fn02) |
| `ledger.Postings.Validate` | `func (p Postings) Validate() (int, error)` | [internal/posting.go:52–72](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/posting.go#L52-L72) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### ledger.Transaction.Reverse

**Definition and evidence.** [Source lines 64–67](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/transaction.go#L64-L67). Signature is recorded in the inventory.

**Inputs and financial context.** A transaction value with an ordered posting slice.

1. Call the posting slice Reverse method.
2. Create a new transaction and add the reversed postings.
3. Return that new transaction.

**Outputs and errors.** New transaction value; this method has no error return or validation call.

**State and effects.** Does not explicitly update the original transaction, ID, reversal marker or stored ledger. This is a data-construction helper, not persisted reversal.

**Dependencies and limits.** NewTransaction/WithPostings construction at lines 27–35, 74–77 and 234–238 was inspected. Authorization, deduplication and database transaction behavior were not.

<a id="fn02"></a>

### ledger.Postings.Reverse

**Definition and evidence.** [Source lines 37–50](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/posting.go#L37-L50). Signature is recorded in the inventory.

**Inputs and financial context.** Ordered posting slice containing source, destination, asset and *big.Int amount.

1. Allocate another slice and copy posting structs.
2. Swap source/destination for each copied posting.
3. Reverse the copied posting sequence.

**Outputs and errors.** Reversed posting slice; no explicit rejection or amount negation.

**State and effects.** Endpoint/order changes affect copied structs. Amount pointers are shallow-copied rather than deep-cloned, so this does not establish immutable amount ownership.

**Dependencies and limits.** Consumers must separately reason about later mutation of shared big.Int values. Posting identity and economic-event lineage are not defined by this helper.

<a id="fn03"></a>

### ledger.Postings.Validate

**Definition and evidence.** [Source lines 52–72](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/posting.go#L52-L72). Signature is recorded in the inventory.

**Inputs and financial context.** Posting list with non-nil amounts, account addresses and assets to validate.

1. Reject a nil amount or an amount less than zero.
2. Validate source and destination addresses.
3. Validate asset spelling; return the failing index/error, or success.

**Outputs and errors.** Index and native error, or zero/nil. Zero amount is not rejected by the inspected amount guard.

**State and effects.** No explicit mutation in this validator.

**Dependencies and limits.** Account/asset validators were not read. This function is not called by Transaction.Reverse in the inspected body, so reversal construction alone does not prove validity.

<a id="ce-finding-0013"></a>

## CE-FINDING-0013 — Reversal swaps posting direction and reverses posting order

**Observed financial rule.** The posting helper creates a new posting slice, swaps each source/destination and reverses its order while preserving asset and amount. Transaction.Reverse builds a new transaction from those postings instead of negating unsigned posting amounts or rewriting the original transaction in this helper.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. Concrete reversal accounting effects and ledger posting remain deferred. The source distinguishes constructing inverse postings from executing or authorizing a correction. This reading therefore creates no mapping claiming that an existing Audit/Workflow operation performs these financial effects.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestTransactionsReverse` | [internal/transaction_test.go:15–33](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/internal/transaction_test.go#L15-L33) | For world -> users and users -> payments, expects payments -> users then users -> world, both with amount 100 and the same asset. Clears both timestamps before equality assertion. | Timestamp preservation, persisted history, one-time reversal, authorization and deep-copy ownership are not proven by this assertion. |

## Counterexamples, limitations and open discussions

- Reversing twice can construct another value; nothing in these helpers alone enforces one reversal per original transaction.
- The copied posting structs share *big.Int amount references. Proposed follow-up: mutate a reversed amount in an isolated upstream test and check ownership expectations; no mutation experiment was performed.
- A future correction model needs original-event linkage, effective dates, already-reversed checks, authorization and atomic persistence. The helper and selected test do not settle those questions.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
