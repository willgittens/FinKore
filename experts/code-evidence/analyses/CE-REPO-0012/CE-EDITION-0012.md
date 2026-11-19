# Apache Fineract — Repayment components consume no more than their outstanding due

**Finding:** CE-FINDING-0012. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0012` / `CE-EDITION-0012`; `apache/fineract`; `1.16.1` |
| Source commit | [c643dab306fe29798951591ce825fd5e5272923e](https://github.com/apache/fineract/tree/c643dab306fe29798951591ce825fd5e5272923e) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | How does an installment choose how much of a supplied payment belongs to principal or interest? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.getPrincipalOutstanding` | `public Money getPrincipalOutstanding(final MonetaryCurrency currency)` | [fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java:319–322](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L319-L322) | [FN01](#fn01) |
| `org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.getInterestOutstanding` | `public Money getInterestOutstanding(final MonetaryCurrency currency)` | [fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java:340–344](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L340-L344) | [FN02](#fn02) |
| `org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.payPrincipalComponent` | `public Money payPrincipalComponent(final LocalDate transactionDate, final Money transactionAmount)` | [fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java:697–716](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L697-L716) | [FN03](#fn03) |
| `org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.payInterestComponent` | `public Money payInterestComponent(final LocalDate transactionDate, final Money transactionAmountRemaining)` | [fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java:676–695](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L676-L695) | [FN04](#fn04) |

## Function technical records

<a id="fn01"></a>

### org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.getPrincipalOutstanding

**Definition and evidence.** [Source lines 319–322](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L319-L322). Signature is recorded in the inventory.

**Inputs and financial context.** Installment principal, completed principal, written-off principal and the supplied MonetaryCurrency.

1. Add completed and written-off principal.
2. Subtract accounted-for principal from charged principal.

**Outputs and errors.** Outstanding principal as Money; arithmetic and null normalization depend on Fineract monetary helpers.

**State and effects.** No direct field assignment in this getter.

**Dependencies and limits.** The result is not clamped to zero here. A valid non-negative outstanding state is an explicit assumption for the payment-cap interpretation.

<a id="fn02"></a>

### org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.getInterestOutstanding

**Definition and evidence.** [Source lines 340–344](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L340-L344). Signature is recorded in the inventory.

**Inputs and financial context.** Charged, paid, waived and written-off interest with currency context.

1. Add paid, waived and written-off interest.
2. Subtract their total from interest charged.

**Outputs and errors.** Interest outstanding as Money; no explicit validation or normalization error mapping in this body.

**State and effects.** Reads component state without direct mutation.

**Dependencies and limits.** Waiver and write-off financial recognition are upstream domain policies, not existing Core ledger semantics.

<a id="fn03"></a>

### org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.payPrincipalComponent

**Definition and evidence.** [Source lines 697–716](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L697-L716). Signature is recorded in the inventory.

**Inputs and financial context.** Payment amount and transaction date; non-negative amount and valid outstanding state are assumptions, not guards proven in this method.

1. Use transaction currency and initialize a zero consumed portion; return it for a zero payment.
2. Compute principal due. If the payment is at least due, add due to completed principal and return due; otherwise apply the payment amount.
3. Check installment obligations and track advance/late totals using the transaction date.

**Outputs and errors.** The consumed principal portion; caller owns how the unconsumed payment is routed to other components. Dependency failures are not caught here.

**State and effects.** Mutates completed principal before calling obligation/timing helpers. Full failure atomicity and persistence rollback were not traced.

**Dependencies and limits.** Money operations, generated/custom setters, obligation helpers and surrounding transaction processor policy were not fully reviewed.

<a id="fn04"></a>

### org.apache.fineract.portfolio.loanaccount.domain.LoanRepaymentScheduleInstallment.payInterestComponent

**Definition and evidence.** [Source lines 676–695](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/main/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallment.java#L676-L695). Signature is recorded in the inventory.

**Inputs and financial context.** Remaining payment, date and installment interest state.

1. Return a zero portion for zero remaining amount.
2. Compare remaining payment to interest due; increment interest paid by due or by the remaining payment, whichever branch applies.
3. Check obligations and update advance/late tracking, then return consumed interest.

**Outputs and errors.** Consumed interest portion; no global principal/interest/fee priority is selected in this body.

**State and effects.** Updates interest-paid state before later helpers. No complete transaction rollback claim follows.

**Dependencies and limits.** Negative inputs/outstanding and guard conditions imposed by callers remain unresolved in this reading.

<a id="ce-finding-0012"></a>

## CE-FINDING-0012 — Repayment components consume no more than their outstanding due

**Observed financial rule.** For non-negative supplied payment and non-negative component outstanding, the inspected component methods apply the smaller of supplied amount and outstanding due, update the corresponding completed/paid field and return the consumed component amount. The methods do not determine the global ordering among loan components.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03), [FN04](#fn04). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. Installment principal/interest recognition, write-offs, waivers and repayment routing are lending/accounting rules outside current Core. The observation can motivate a future payment-consumption contract with explicit inputs and state preconditions; it does not introduce a new canonical operation or loan requirement.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `LoanRepaymentScheduleInstallmentTest.testPrincipalCompletedSetters / testInterestPaidSetters` | [fineract-loan/src/test/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallmentTest.java:69–92](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/test/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallmentTest.java#L69-L92) | Routes the relevant setter/getter pairs to the shared testBigDecimalSetter helper. | These tests support field normalization only; they do not call the component payment methods or prove the cap. |
| `LoanRepaymentScheduleInstallmentTest.testPrecisionAndScale / testBigDecimalSetter` | [fineract-loan/src/test/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallmentTest.java:182–208](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/fineract-loan/src/test/java/org/apache/fineract/portfolio/loanaccount/domain/LoanRepaymentScheduleInstallmentTest.java#L182-L208) | Expects six-decimal storage rounding; shared checks normalize zero/null to null and use HALF_EVEN under the mocked monetary context. | No direct payment-cap assertion was found in this selected class. Mock initialization and setup at lines 40–61 use fixed precision/mode and current host dates; not a portable deterministic execution record. |

## Counterexamples, limitations and open discussions

- The financial cap is code-supported but lacks a directly inspected payment-method test in this selected suite. It remains pending stronger evidence.
- Proposed test scenarios, not executed observations: principal due 100 with supplied payment 120 consumes 100; supplied 40 consumes 40; zero consumes zero. These are static branch expectations under valid non-negative state.
- Do not infer the priority among principal, interest, fees and penalties from the presence of these methods. That belongs to the selected transaction processor, not read here.
- Negative outstanding, partial helper failure and date-sensitive advance/late effects need an explicit policy and further source inspection.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
