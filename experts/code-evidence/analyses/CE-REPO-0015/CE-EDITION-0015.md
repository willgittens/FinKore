# ERPNext — Payment allocation is checked against fresh aggregate outstanding amounts

**Finding:** CE-FINDING-0015. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0015` / `CE-EDITION-0015`; `frappe/erpnext`; `v16.60.0` |
| Source commit | [886ab6ae187244e7f1b852393384ab6019d56264](https://github.com/frappe/erpnext/tree/886ab6ae187244e7f1b852393384ab6019d56264) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Can duplicate invoice reference rows each pass while jointly over-allocating an invoice? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `erpnext.accounts.doctype.payment_entry.payment_entry.PaymentEntry.validate_allocated_amount` | `def validate_allocated_amount(self):` | [erpnext/accounts/doctype/payment_entry/payment_entry.py:435–456](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/payment_entry.py#L435-L456) | [FN01](#fn01) |
| `erpnext.accounts.doctype.payment_entry.payment_entry.PaymentEntry.validate_allocated_amount_with_latest_data` | `def validate_allocated_amount_with_latest_data(self):` | [erpnext/accounts/doctype/payment_entry/payment_entry.py:493–590](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/payment_entry.py#L493-L590) | [FN02](#fn02) |

## Function technical records

<a id="fn01"></a>

### erpnext.accounts.doctype.payment_entry.payment_entry.PaymentEntry.validate_allocated_amount

**Definition and evidence.** [Source lines 435–456](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/payment_entry.py#L435-L456). Signature is recorded in the inventory.

**Inputs and financial context.** PaymentEntry type, party type, payment-request references and allocation/outstanding row values.

1. Return for Internal Transfer; validate linked payment-request constraints otherwise.
2. For Customer/Supplier, delegate to fresh-data validation and return.
3. For other parties, convert allocated and outstanding amounts at row precision; reject a positive allocation above outstanding or a negative allocation below negative outstanding.

**Outputs and errors.** Normal return or frappe.throw validation failure; no amount result is returned.

**State and effects.** No direct allocation or ledger write in this body. Called methods and surrounding Frappe transactions remain separate effects.

**Dependencies and limits.** flt conversion and row precision are upstream application policy, not a Core exact Money comparison definition.

<a id="fn02"></a>

### erpnext.accounts.doctype.payment_entry.payment_entry.PaymentEntry.validate_allocated_amount_with_latest_data

**Definition and evidence.** [Source lines 493–590](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/payment_entry.py#L493-L590). Signature is recorded in the inventory.

**Inputs and financial context.** Referenced vouchers/payment terms, current document context and freshly queried outstanding data.

1. Return for no references; deduplicate voucher identities for the outstanding lookup using company, party, account and posting-date context.
2. Index fresh results by voucher and payment term; reject missing required terms, fully paid references and selected stale partly-paid data.
3. Accumulate allocations per voucher and separately per payment term at row precision.
4. Check term-specific positive limits where configured, then reject signed aggregate allocation beyond the current voucher outstanding.

**Outputs and errors.** Normal return or framework validation errors; lookup/database failures are dependencies.

**State and effects.** Reads fresh external application state and builds local lookup/totals. This body does not by itself prove an atomic read-and-commit boundary against concurrent payments.

**Dependencies and limits.** get_outstanding_reference_documents, term-configuration lookup, flt and database isolation were not traced. Results depend on supplied document facts plus queried application state.

<a id="ce-finding-0015"></a>

## CE-FINDING-0015 — Payment allocation is checked against fresh aggregate outstanding amounts

**Observed financial rule.** Payment validation distinguishes internal transfers and party types, then for customer/supplier references refreshes outstanding data and accumulates allocation by voucher and payment term. It rejects positive or negative aggregate over-allocation using the configured amount precision instead of validating every duplicate row independently.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. Invoice settlement/allocation is a consuming application domain, distinct from Core Money.allocate ratio splitting. The source motivates aggregate validation, fresh-fact context and precision policy for future discussion; it is not a new invoice operation or a waiver of Core exact decimal semantics.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestPaymentEntry.test_allocation_equal_to_outstanding_at_precision_is_allowed` | [erpnext/accounts/doctype/payment_entry/test_payment_entry.py:897–910](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/test_payment_entry.py#L897-L910) | For an Employee Advance, calls validation with allocated 260.0 and outstanding 259.99999039999966 and expects no thrown exception at configured precision. | There is no explicit amount equality assertion; successful return is the test expectation. This is the non-Customer/Supplier path. |
| `TestPaymentEntry.test_total_allocation_across_reference_rows` | [erpnext/accounts/doctype/payment_entry/test_payment_entry.py:2092–2153](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/erpnext/accounts/doctype/payment_entry/test_payment_entry.py#L2092-L2153) | Duplicate rows for an invoice with outstanding 100 reject a total 200 and leave outstanding 100. Changing allocations to 40+60 permits submission, yields zero outstanding, and cancellation restores 100. Later scenarios check term and aggregate over-allocation. | Database fixtures and submit/cancel machinery were not run; the helper analysis does not define all accounting reversal or concurrency effects. |

## Counterexamples, limitations and open discussions

- Row-wise validation is insufficient when several rows refer to the same economic subject. The selected source test directly targets that plausible defect.
- Refreshing outstanding data before validation does not alone prevent a race between validation and commit. Concurrency/isolation needs separate evidence.
- The precision-boundary example should not be copied into Core Money as an approximate comparison. An invoice-domain policy would need explicit precision and rounding meaning.
- Proposed follow-up: mixed-sign duplicate rows, stale terms, missing references, concurrent submissions and failure state across all related financial documents.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
